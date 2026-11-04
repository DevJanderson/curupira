import { CLI_NAME, FlowError, isRecord, type ProjectFile } from "@curupira/core";

// O adaptador do Claude Code (ADR-0021): só aqui o núcleo encontra o formato desse agente.
// Referência: https://code.claude.com/docs/en/hooks e https://code.claude.com/docs/en/env-vars.

export interface TypedPrompt {
  session: string;
  prompt: string;
}

// Lê o JSON que o hook UserPromptSubmit recebe na entrada padrão.
export function readPromptHook(input: string): TypedPrompt {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new FlowError("invalid-hook-input");
  }
  const { session_id: session, prompt } = (data ?? {}) as Record<string, unknown>;
  if (typeof session !== "string" || session === "" || typeof prompt !== "string") {
    throw new FlowError("invalid-hook-input");
  }
  return { session, prompt };
}

// A sessão dos comandos que o agente roda: a mesma do session_id que o hook recebe.
export function agentSession(env: NodeJS.ProcessEnv): string | undefined {
  return env.CLAUDE_CODE_SESSION_ID || undefined;
}

// O hook que registra cada mensagem digitada; chama o comando pelo nome, sem caminho (ADR-0024).
const ANSWER_COMMAND = `${CLI_NAME} hook answer`;
const SETTINGS = ".claude/settings.json";

// O `init` liga o hook no settings.json da raiz, mantendo o resto do arquivo (spec da F00, R6).
export const answerHook: ProjectFile = {
  file: SETTINGS,
  change: "hook",
  update: (current) => {
    const settings = current === undefined ? {} : parseObject(current);
    const hooks = settings.hooks ?? {};
    if (!isRecord(hooks)) throw invalid("hooks");
    const entries = hooks.UserPromptSubmit ?? [];
    if (!Array.isArray(entries)) throw invalid("hooks");
    // Conta como ligado só uma entrada cujo comando é exatamente o do hook.
    const present = entries.some(
      (entry) =>
        isRecord(entry) &&
        Array.isArray(entry.hooks) &&
        entry.hooks.some((hook) => isRecord(hook) && hook.command === ANSWER_COMMAND),
    );
    if (present) return undefined;
    const entry = { hooks: [{ type: "command", command: ANSWER_COMMAND }] };
    const next = { ...settings, hooks: { ...hooks, UserPromptSubmit: [...entries, entry] } };
    return JSON.stringify(next, null, 2) + "\n";
  },
};

function parseObject(content: string): Record<string, unknown> {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    throw invalid("json");
  }
  if (!isRecord(data)) throw invalid("object");
  return data;
}

function invalid(problem: string): FlowError {
  return new FlowError("invalid-settings", { file: SETTINGS, problem });
}
