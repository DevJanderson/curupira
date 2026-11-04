import { FlowError } from "@curupira/core";
import { expect, test } from "vite-plus/test";
import { agentSession, readPromptHook } from "../src/index.ts";

// O JSON que o Claude Code entrega ao hook UserPromptSubmit (https://code.claude.com/docs/en/hooks).
const INPUT = {
  session_id: "abc123",
  transcript_path: "/home/ana/.claude/projects/x/abc123.jsonl",
  cwd: "/home/ana/projeto",
  permission_mode: "default",
  hook_event_name: "UserPromptSubmit",
  prompt: "sim",
};

function failureCode(run: () => unknown): string {
  try {
    run();
  } catch (error) {
    if (error instanceof FlowError) return error.code;
    throw error;
  }
  throw new Error("esperava um FlowError");
}

test("a entrada do hook vira a sessão e o texto digitado", () => {
  expect(readPromptHook(JSON.stringify(INPUT))).toEqual({ session: "abc123", prompt: "sim" });
});

test("uma entrada inválida gera erro claro", () => {
  for (const input of [
    "{",
    "[]",
    JSON.stringify({ ...INPUT, prompt: 1 }),
    JSON.stringify({ prompt: "sim" }),
  ]) {
    expect(failureCode(() => readPromptHook(input))).toBe("invalid-hook-input");
  }
});

test("a sessão do agente sai de CLAUDE_CODE_SESSION_ID, e sem ela não há sessão", () => {
  expect(agentSession({ CLAUDE_CODE_SESSION_ID: "abc123" })).toBe("abc123");
  expect(agentSession({})).toBeUndefined();
  expect(agentSession({ CLAUDE_CODE_SESSION_ID: "" })).toBeUndefined();
});
