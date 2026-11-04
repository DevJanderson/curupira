#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { agentSession, answerHook, readPromptHook } from "@curupira/claude-code";
import { run } from "./run.ts";

// A entrada da CLI é o único lugar que escolhe o adaptador do agente (ADR-0021); a v1 só tem o do Claude Code.

process.exitCode = run(process.argv.slice(2), {
  cwd: process.cwd(),
  env: process.env,
  agent: { session: agentSession, readPrompt: readPromptHook, answerHook },
  stdin: () => readFileSync(0, "utf8"),
  now: () => new Date().toISOString(),
  out: (line) => console.log(line),
  err: (line) => console.error(line),
});
