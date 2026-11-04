import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DATA_DIR, stateFile } from "@curupira/core";
import { beforeEach, expect, test } from "vite-plus/test";

// Os cenários da spec da F01a (docs/specs/F01a-estado-e-comandos/spec.md), contra a CLI real,
// cada um num repositório Git descartável, com o nome de autor configurado.
const MAIN = resolve(import.meta.dirname, "../src/main.ts");
let repo: string;
let env: NodeJS.ProcessEnv;

beforeEach(() => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), "scenario-")));
  const emptyConfig = join(base, "gitconfig");
  writeFileSync(emptyConfig, "");
  env = { ...process.env, GIT_CONFIG_GLOBAL: emptyConfig, GIT_CONFIG_NOSYSTEM: "1" };
  repo = join(base, "repo");
  mkdirSync(repo);
  git("init", "-q", "-b", "main");
  git("config", "user.name", "Ana Lima");
  git("config", "user.email", "ana@example.com");
});

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: repo, env, encoding: "utf8" });
}

function cli(...args: string[]) {
  const result = spawnSync(process.execPath, [MAIN, ...args], { cwd: repo, env, encoding: "utf8" });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

function at(id: string, phase: number): void {
  cli("open", id);
  for (let current = 3; current < phase; current++) {
    if (current === 4) cli("approve", id);
    else cli("advance", id);
  }
}

function snapshot(): Record<string, string> {
  const dir = join(repo, DATA_DIR, "state");
  return Object.fromEntries(
    readdirSync(dir).map((name) => [name, readFileSync(join(dir, name), "utf8")]),
  );
}

function state(id: string) {
  return JSON.parse(readFileSync(stateFile(repo, id), "utf8"));
}

test("C1. O estado mostra a fase e o que espera decisão", () => {
  at("F01a", 4);
  at("F02", 3);
  const result = cli("status");
  expect(result.code).toBe(0);
  const lines = result.out.trim().split("\n");
  expect(lines).toHaveLength(2);
  expect(lines[0]).toMatch(/^F01a\b.*\b4\b.*espera aprovação/);
  expect(lines[1]).toMatch(/^F02\b.*\b3\b/);
  expect(lines[1]).not.toContain("espera");
});

test("C2. Aprovar registra quem e quando", () => {
  // Uma recusa anterior, para conferir que ela não muda com a decisão nova.
  at("F01a", 4);
  cli("reject", "F01a", "--reason", "falta um cenário");
  cli("advance", "F01a");
  at("F02", 3);
  const before = snapshot();
  const earlier = state("F01a").decisions;
  const result = cli("approve", "F01a");
  expect(result.code).toBe(0);
  const after = snapshot();
  const f01a = state("F01a");
  expect(f01a.phase).toBe(5);
  expect(f01a.decisions).toHaveLength(2);
  expect(f01a.decisions[0]).toEqual(earlier[0]);
  expect(f01a.decisions[1]).toMatchObject({ phase: 4, decision: "approve", by: "Ana Lima" });
  expect(Date.parse(f01a.decisions[1].at)).not.toBeNaN();
  expect(Object.keys(after)).toEqual(Object.keys(before));
  expect(after["F02.json"]).toBe(before["F02.json"]);
});

test("C3. Aprovar fora da fase com aprovação é recusado", () => {
  at("F02", 3);
  const before = snapshot();
  const result = cli("approve", "F02");
  expect(result.code).not.toBe(0);
  expect(result.err).toMatch(/F02.*fase 3/);
  expect(snapshot()).toEqual(before);
});

test("C4. Recusar na fase 7 volta à implementação", () => {
  at("F01a", 7);
  const result = cli("reject", "F01a", "--reason", "faltou tratar o erro de rede");
  expect(result.code).toBe(0);
  const f01a = state("F01a");
  expect(f01a.phase).toBe(5);
  expect(f01a.decisions.at(-1)).toMatchObject({
    phase: 7,
    decision: "reject",
    by: "Ana Lima",
    reason: "faltou tratar o erro de rede",
  });
  expect(Date.parse(f01a.decisions.at(-1).at)).not.toBeNaN();
});

test("C5. Duas funcionalidades em branches não conflitam", () => {
  at("F01a", 4);
  at("F02", 4);
  git("add", "-A");
  git("commit", "-q", "-m", "base");
  git("switch", "-q", "-c", "a");
  cli("approve", "F01a");
  git("commit", "-q", "-am", "aprova F01a");
  git("switch", "-q", "main");
  git("switch", "-q", "-c", "b");
  cli("approve", "F02");
  git("commit", "-q", "-am", "aprova F02");
  git("merge", "-q", "--no-edit", "a");
  expect(git("status", "--porcelain")).toBe("");
  const lines = cli("status").out.trim().split("\n");
  expect(lines[0]).toMatch(/^F01a\b.*\b5\b/);
  expect(lines[1]).toMatch(/^F02\b.*\b5\b/);
  expect(state("F01a").decisions).toHaveLength(1);
  expect(state("F02").decisions).toHaveLength(1);
});
