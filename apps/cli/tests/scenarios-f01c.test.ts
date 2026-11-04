import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { stateFile } from "@curupira/core";
import { beforeEach, expect, test } from "vite-plus/test";

// Os cenários da spec da F01c (docs/specs/F01c-pedido-e-teto/spec.md), contra a CLI real, cada um num repositório
// Git descartável com um commit e a spec da F09. A mensagem digitada entra como o hook do Claude Code a entregaria.
const MAIN = resolve(import.meta.dirname, "../src/main.ts");
const SESSION = "sessao-de-teste";
const SPEC = join("docs", "specs", "F09-exemplo", "spec.md");
let repo: string;
let env: NodeJS.ProcessEnv;

beforeEach(() => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), "scenario-f01c-")));
  const emptyConfig = join(base, "gitconfig");
  writeFileSync(emptyConfig, "");
  env = {
    ...process.env,
    GIT_CONFIG_GLOBAL: emptyConfig,
    GIT_CONFIG_NOSYSTEM: "1",
    CLAUDE_CODE_SESSION_ID: SESSION,
  };
  repo = join(base, "repo");
  mkdirSync(repo);
  git("init", "-q");
  git("config", "user.name", "Ana Lima");
  git("config", "user.email", "ana@example.com");
  mkdirSync(join(repo, SPEC, ".."), { recursive: true });
  writeFileSync(join(repo, SPEC), "# F09\n");
  git("add", "-A");
  git("commit", "-qm", "início");
});

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: repo, env, encoding: "utf8" }).trim();
}

function say(prompt: string): void {
  const input = JSON.stringify({ session_id: SESSION, prompt });
  const result = spawnSync(process.execPath, [MAIN, "hook", "answer"], { cwd: repo, env, input });
  expect(result.status).toBe(0);
}

function cli(...args: string[]) {
  const result = spawnSync(process.execPath, [MAIN, ...args], { cwd: repo, env, encoding: "utf8" });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

// Leva a F09 à fase pedida, conferindo cada passo, para a recusa do cenário não vir de outra causa.
function at(phase: 4 | 7): void {
  expect(cli("open", "F09").code).toBe(0);
  for (let current = 3; current < phase; current++) {
    if (current === 4) {
      expect(cli("request", "F09").code).toBe(0);
      say("sim");
    }
    expect(cli(current === 4 ? "approve" : "advance", "F09").code).toBe(0);
  }
  expect(JSON.parse(raw()).phase).toBe(phase);
}

function raw(): string {
  return readFileSync(stateFile(repo, "F09"), "utf8");
}

test('C1. O pedido e um "sim" depois dele aprovam', () => {
  at(4);
  expect(cli("request", "F09").code).toBe(0);
  const asked = JSON.parse(raw()).request;
  say("sim");
  const result = cli("approve", "F09");
  expect(result.code).toBe(0);
  const state = JSON.parse(raw());
  expect(state.phase).toBe(5);
  const hash = createHash("sha256")
    .update(readFileSync(join(repo, SPEC)))
    .digest("hex");
  expect(state.decisions.at(-1)).toMatchObject({
    phase: 4,
    decision: "approve",
    requestedAt: asked.at,
    path: SPEC,
    hash,
  });
  expect(Date.parse(state.decisions.at(-1).requestedAt)).not.toBeNaN();
});

test("C2. Sem pedido, a aprovação é recusada", () => {
  at(4);
  say("sim");
  const before = raw();
  const result = cli("approve", "F09");
  expect(result.code).not.toBe(0);
  expect(result.err).toContain("request F09");
  expect(raw()).toBe(before);
});

test('C3. Um "sim" anterior ao pedido não vale', () => {
  at(4);
  say("sim");
  expect(cli("request", "F09").code).toBe(0);
  const before = raw();
  const result = cli("approve", "F09");
  expect(result.code).not.toBe(0);
  expect(result.err).toContain("responder de novo");
  expect(raw()).toBe(before);
});

test("C4. A spec mudada depois do pedido não é aprovada", () => {
  at(4);
  expect(cli("request", "F09").code).toBe(0);
  writeFileSync(join(repo, SPEC), "# F09, mudada\n");
  say("sim");
  const before = raw();
  const result = cli("approve", "F09");
  expect(result.code).not.toBe(0);
  expect(result.err).toContain("pedido novo");
  expect(raw()).toBe(before);
});

test("C5. Um commit novo depois do pedido da revisão não é aprovado", () => {
  at(7);
  expect(cli("request", "F09").code).toBe(0);
  writeFileSync(join(repo, "codigo.ts"), "export {};\n");
  git("add", "codigo.ts");
  git("commit", "-qm", "mais código");
  say("sim");
  const before = raw();
  const result = cli("approve", "F09");
  expect(result.code).not.toBe(0);
  expect(result.err).toContain("pedido novo");
  expect(raw()).toBe(before);
});
