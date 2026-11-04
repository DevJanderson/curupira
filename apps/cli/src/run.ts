import { parseArgs } from "node:util";
import {
  advance,
  answerAfter,
  approvalPhase,
  approvalTarget,
  checkUnchanged,
  approvalText,
  approve,
  currentRequest,
  deleteAnswer,
  FlowError,
  gitAuthor,
  hasApproval,
  isFeatureId,
  ignoreLocalData,
  LOCAL_LINE,
  open,
  prepareProject,
  projectRoot,
  purgeAnswers,
  readAllStates,
  readAnswer,
  readState,
  recordAnswer,
  reject,
  rejectionReason,
  requestApproval,
  writeState,
  type FeatureState,
  type ProjectFile,
} from "@curupira/core";
import { errorMessage, message } from "./messages.ts";

// O que muda de um agente para outro chega pronto do adaptador; quem o escolhe é o main.ts (ADR-0021).
export interface Agent {
  // A sessão dos comandos que o agente roda.
  session: (env: NodeJS.ProcessEnv) => string | undefined;
  // A mensagem digitada, como o hook do agente a entrega na entrada padrão.
  readPrompt: (input: string) => { session: string; prompt: string };
  // O hook das respostas no arquivo de configuração do agente, que o `init` liga.
  answerHook: ProjectFile;
}

export interface Io {
  cwd: string;
  env: NodeJS.ProcessEnv;
  agent: Agent;
  stdin: () => string;
  now: () => string;
  out: (line: string) => void;
  err: (line: string) => void;
}

// O argumento e as opções que cada comando aceita; o que não estiver aqui é erro de uso.
const COMMANDS: Record<string, { argument: boolean; options: string[] }> = {
  init: { argument: false, options: [] },
  open: { argument: true, options: [] },
  status: { argument: false, options: [] },
  advance: { argument: true, options: [] },
  request: { argument: true, options: [] },
  approve: { argument: true, options: [] },
  reject: { argument: true, options: ["spec"] },
  hook: { argument: true, options: [] },
};

// A CLI é a única que escreve o estado (ADR-0011); quem a roda é o agente, e a decisão vem de uma
// resposta digitada pela pessoa, que o hook registra (ADR-0025).
export function run(args: string[], io: Io): number {
  let parsed;
  try {
    parsed = parseArgs({ args, allowPositionals: true, options: { spec: { type: "boolean" } } });
  } catch {
    return usage(io);
  }
  const [command, argument, ...extra] = parsed.positionals;
  const definition = command === undefined ? undefined : COMMANDS[command];
  if (!definition || extra.length > 0 || definition.argument !== (argument !== undefined))
    return usage(io);
  if (Object.keys(parsed.values).some((option) => !definition.options.includes(option)))
    return usage(io);
  if (command === "hook" && argument !== "answer") return usage(io);

  try {
    const root = projectRoot(io.cwd, io.env);
    if (command === "init") {
      prepare(root, io);
      return 0;
    }
    if (command === "status") {
      status(root, io);
      return 0;
    }
    if (command === "hook") {
      // Nada vai para a saída padrão: no Claude Code, ela entraria no contexto do agente.
      const { session, prompt } = io.agent.readPrompt(io.stdin());
      purgeAnswers(root, new Date(io.now()));
      recordAnswer(root, session, prompt, io.now());
      return 0;
    }
    const id = argument!;
    if (!isFeatureId(id)) throw new FlowError("invalid-id", { id });
    if (command === "open") {
      const existing = readState(root, id);
      if (existing?.phase === "delivered") throw new FlowError("delivered", { id });
      if (existing) throw new FlowError("already-open", { id, phase: existing.phase });
      writeState(root, open(id));
      io.out(message("opened", { id }));
      return 0;
    }
    const current = readState(root, id);
    if (!current) throw new FlowError("not-found", { id });
    if (command === "request") {
      const phase = approvalPhase(current);
      const target = approvalTarget(root, id, phase);
      writeState(root, requestApproval(current, io.now(), target));
      const params = {
        id,
        phase,
        at: io.now(),
        hash: target.hash.slice(0, 12),
        file: target.path ?? "",
      };
      io.out(message(target.path === undefined ? "requested-commit" : "requested-spec", params));
      return 0;
    }
    if (command === "advance") {
      const next = advance(current);
      writeState(root, next);
      io.out(message("advanced", { id, phase: next.phase }));
      return 0;
    }
    // Qual erro vence: a fase, o pedido, o conteúdo (só no approve), a sessão, a resposta digitada e, por último, o
    // autor. Um "não" ao que a pessoa viu continua valendo, mesmo que o conteúdo tenha mudado.
    const from = approvalPhase(current);
    const request = currentRequest(current);
    if (command === "approve") checkUnchanged(root, id, request);
    const session = io.agent.session(io.env);
    if (session === undefined) throw new FlowError("no-session");
    const answer = answerAfter(readAnswer(root, session, new Date(io.now())), request, id);
    const supporting =
      command === "approve" ? approvalText(answer, id) : rejectionReason(answer, id);
    const by = gitAuthor(root, io.env);
    const next =
      command === "approve"
        ? approve(current, by, io.now(), supporting)
        : reject(current, by, io.now(), supporting, { spec: parsed.values.spec });
    writeState(root, next);
    // A resposta usada sai do registro, para não valer duas vezes (R4).
    deleteAnswer(root, session);
    io.out(decided(command!, next, from));
    return 0;
  } catch (error) {
    if (!(error instanceof FlowError)) throw error;
    io.err(errorMessage(error));
    return 1;
  }
}

// Preparar não grava decisão nem estado: só liga o hook e põe a pasta local no .gitignore (ADR-0031, fase 0).
function prepare(root: string, io: Io): void {
  const changed = prepareProject(root, [io.agent.answerHook, ignoreLocalData]);
  if (changed.length === 0) io.out(message("init-ready"));
  for (const { file, change } of changed)
    io.out(message(`init.${change}`, { file, line: LOCAL_LINE }));
}

function status(root: string, io: Io): void {
  const states = readAllStates(root);
  if (states.length === 0) io.out(message("status-empty"));
  for (const { id, phase } of states) {
    if (phase === "delivered") io.out(message("status-delivered", { id }));
    else io.out(message(hasApproval(phase) ? "status-waiting" : "status-phase", { id, phase }));
  }
}

function decided(command: string, next: FeatureState, from: FeatureState["phase"]): string {
  const by = next.decisions.at(-1)!.by;
  if (next.phase === "delivered") return message("approved-delivered", { id: next.id, by });
  const params = { id: next.id, from, by, phase: next.phase };
  if (command === "approve") return message("approved", params);
  return message(next.phase === from ? "rejected-stays" : "rejected", params);
}

function usage(io: Io): number {
  io.err(message("usage"));
  return 1;
}
