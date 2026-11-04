import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { answerFile, stateFile } from "@curupira/core";
import { beforeEach, expect, test } from "vite-plus/test";

// Os cenários da spec da F01b (docs/specs/F01b-prova-de-decisao-humana/spec.md), contra a CLI real, cada um num
// repositório Git descartável. A mensagem digitada entra como o hook do Claude Code a entregaria.
const MAIN = resolve(import.meta.dirname, "../src/main.ts");
const SESSION = "sessao-de-teste";
let repo: string;
let env: NodeJS.ProcessEnv;

beforeEach(() => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), "scenario-f01b-")));
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
  execFileSync("git", ["init", "-q"], { cwd: repo, env });
  execFileSync("git", ["config", "user.name", "Ana Lima"], { cwd: repo, env });
  execFileSync("git", ["config", "user.email", "ana@example.com"], { cwd: repo, env });
  // Desde a F01c, a aprovação da fase 4 pede a spec, e as das fases 7 e 8, um commit.
  for (const id of ["F01a", "F02"]) {
    mkdirSync(join(repo, "docs", "specs", `${id}-exemplo`), { recursive: true });
    writeFileSync(join(repo, "docs", "specs", `${id}-exemplo`, "spec.md"), `# ${id}\n`);
  }
  execFileSync("git", ["add", "-A"], { cwd: repo, env });
  execFileSync("git", ["commit", "-qm", "specs"], { cwd: repo, env });
});

function say(prompt: string): void {
  const input = JSON.stringify({ session_id: SESSION, prompt });
  const result = spawnSync(process.execPath, [MAIN, "hook", "answer"], { cwd: repo, env, input });
  expect(result.status).toBe(0);
}

function cli(...args: string[]) {
  const result = spawnSync(process.execPath, [MAIN, ...args], { cwd: repo, env, encoding: "utf8" });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

// Leva a funcionalidade à fase pedida, conferindo cada passo, para a recusa do cenário não vir de outra causa. Na
// fase pedida, já faz o pedido dela (F01c), que vem antes da resposta.
function at(id: string, phase: number): void {
  expect(cli("open", id).code).toBe(0);
  for (let current = 3; current < phase; current++) {
    if (current === 4) {
      expect(cli("request", id).code).toBe(0);
      say("sim");
    }
    expect(cli(current === 4 ? "approve" : "advance", id).code).toBe(0);
  }
  expect(cli("request", id).code).toBe(0);
  expect(JSON.parse(raw(id)).phase).toBe(phase);
}

function raw(id: string): string {
  return readFileSync(stateFile(repo, id), "utf8");
}

test('C1. Um "sim" digitado permite aprovar', () => {
  at("F01a", 4);
  say("sim");
  const result = cli("approve", "F01a");
  expect(result.code).toBe(0);
  const decision = JSON.parse(raw("F01a")).decisions.at(-1);
  expect(decision).toMatchObject({ phase: 4, decision: "approve", answer: "sim" });
  expect(existsSync(answerFile(repo, SESSION))).toBe(false);
});

test("C2. Sem resposta digitada, a aprovação é recusada", () => {
  at("F01a", 4);
  const before = raw("F01a");
  const result = cli("approve", "F01a");
  expect(result.code).not.toBe(0);
  expect(result.err).toContain('"sim"');
  expect(raw("F01a")).toBe(before);
});

test("C3. Uma resposta não vale duas vezes", () => {
  at("F01a", 4);
  at("F02", 4);
  say("sim");
  expect(cli("approve", "F01a").code).toBe(0);
  const before = raw("F02");
  const result = cli("approve", "F02");
  expect(result.code).not.toBe(0);
  expect(result.err).toContain('"sim"');
  expect(raw("F02")).toBe(before);
});

test('C4. Um "não" digitado recusa com o motivo', () => {
  at("F01a", 7);
  say("não, faltou tratar o erro de rede");
  const result = cli("reject", "F01a");
  expect(result.code).toBe(0);
  const state = JSON.parse(raw("F01a"));
  expect(state.phase).toBe(5);
  expect(state.decisions.at(-1)).toMatchObject({
    phase: 7,
    decision: "reject",
    reason: "faltou tratar o erro de rede",
  });
});

test('C5. Um "sim" com outra frase não aprova', () => {
  at("F01a", 4);
  say("sim, e mais uma coisa");
  const before = raw("F01a");
  const result = cli("approve", "F01a");
  expect(result.code).not.toBe(0);
  expect(result.err).toContain("sozinho");
  expect(raw("F01a")).toBe(before);
});
