import { FlowError } from "@curupira/core";

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
