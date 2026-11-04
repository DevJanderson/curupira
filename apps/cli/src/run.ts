import { parseArgs } from "node:util";
import {
  advance,
  approve,
  FlowError,
  gitAuthor,
  hasApproval,
  isFeatureId,
  open,
  projectRoot,
  readAllStates,
  readState,
  reject,
  writeState,
  type FeatureState,
} from "@curupira/core";
import { errorMessage, message } from "./messages.ts";

export interface Io {
  cwd: string;
  env: NodeJS.ProcessEnv;
  now: () => string;
  out: (line: string) => void;
  err: (line: string) => void;
}

// As opções que cada comando aceita; o que não estiver aqui é erro de uso.
const COMMANDS: Record<string, { id: boolean; options: string[] }> = {
  open: { id: true, options: [] },
  status: { id: false, options: [] },
  advance: { id: true, options: [] },
  approve: { id: true, options: [] },
  reject: { id: true, options: ["reason", "spec"] },
};

// A CLI é a única que escreve o estado (ADR-0011); quem a roda é o agente (ADR-0025).
export function run(args: string[], io: Io): number {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      allowPositionals: true,
      options: { reason: { type: "string" }, spec: { type: "boolean" } },
    });
  } catch {
    return usage(io);
  }
  const [command, id, ...extra] = parsed.positionals;
  const spec = command === undefined ? undefined : COMMANDS[command];
  const given = Object.keys(parsed.values);
  if (!spec || extra.length > 0 || (spec.id ? id === undefined : id !== undefined))
    return usage(io);
  if (given.some((option) => !spec.options.includes(option))) return usage(io);

  try {
    const root = projectRoot(io.cwd, io.env);
    if (command === "status") {
      status(root, io);
      return 0;
    }
    if (!isFeatureId(id!)) throw new FlowError("invalid-id", { id: id! });
    if (command === "open") {
      const existing = readState(root, id!);
      if (existing) throw new FlowError("already-open", { id: id!, phase: existing.phase });
      writeState(root, open(id!));
      io.out(message("opened", { id: id! }));
      return 0;
    }
    const current = readState(root, id!);
    if (!current) throw new FlowError("not-found", { id: id! });
    if (command === "advance") {
      const next = advance(current);
      writeState(root, next);
      io.out(message("advanced", { id: id!, phase: next.phase }));
      return 0;
    }
    const from = current.phase;
    const by = gitAuthor(root, io.env);
    const next =
      command === "approve"
        ? approve(current, by, io.now())
        : reject(current, by, io.now(), parsed.values.reason ?? "", { spec: parsed.values.spec });
    writeState(root, next);
    io.out(decided(command!, next, from, by));
    return 0;
  } catch (error) {
    if (!(error instanceof FlowError)) throw error;
    io.err(errorMessage(error));
    return 1;
  }
}

function status(root: string, io: Io): void {
  const states = readAllStates(root);
  if (states.length === 0) io.out(message("status-empty"));
  for (const { id, phase } of states) {
    if (phase === "delivered") io.out(message("status-delivered", { id }));
    else io.out(message(hasApproval(phase) ? "status-waiting" : "status-phase", { id, phase }));
  }
}

function decided(
  command: string,
  next: FeatureState,
  from: FeatureState["phase"],
  by: string,
): string {
  if (next.phase === "delivered") return message("approved-delivered", { id: next.id, by });
  const params = { id: next.id, from, by, phase: next.phase };
  return message(command === "approve" ? "approved" : "rejected", params);
}

function usage(io: Io): number {
  io.err(message("usage"));
  return 1;
}
