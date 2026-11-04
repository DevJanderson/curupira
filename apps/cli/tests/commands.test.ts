import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { stateFile } from "@curupira/core";
import { beforeEach, expect, test } from "vite-plus/test";
import { run } from "../src/run.ts";

const NOW = "2026-11-03T20:00:00.000Z";
let repo: string;
let env: NodeJS.ProcessEnv;

beforeEach(() => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), "cli-")));
  const emptyConfig = join(base, "gitconfig");
  writeFileSync(emptyConfig, "");
  env = { ...process.env, GIT_CONFIG_GLOBAL: emptyConfig, GIT_CONFIG_NOSYSTEM: "1" };
  repo = join(base, "repo");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo, env });
  execFileSync("git", ["config", "user.name", "Ana Lima"], { cwd: repo, env });
});

function cli(...args: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = run(args, {
    cwd: repo,
    env,
    now: () => NOW,
    out: (line) => out.push(line),
    err: (line) => err.push(line),
  });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

function state(id: string) {
  return JSON.parse(readFileSync(stateFile(repo, id), "utf8"));
}

test("open cria a funcionalidade na fase 3", () => {
  const result = cli("open", "F01a");
  expect(result.code).toBe(0);
  expect(result.out).toContain("F01a");
  expect(state("F01a")).toEqual({ id: "F01a", phase: 3, decisions: [] });
});

test("open recusa um ID inválido e uma funcionalidade já aberta", () => {
  expect(cli("open", "F1").code).toBe(1);
  expect(existsSync(stateFile(repo, "F1"))).toBe(false);
  cli("open", "F01a");
  const again = cli("open", "F01a");
  expect(again.code).toBe(1);
  expect(again.err).toContain("F01a");
});

test("status mostra a fase de cada uma e marca só a que espera decisão", () => {
  expect(cli("status").out).not.toBe("");
  cli("open", "F01a");
  cli("advance", "F01a");
  cli("open", "F02");
  const lines = cli("status").out.split("\n");
  expect(lines).toHaveLength(2);
  expect(lines[0]).toMatch(/F01a.*4.*aprovação/);
  expect(lines[1]).toMatch(/F02.*3/);
  expect(lines[1]).not.toMatch(/aprovação/);
});

test("advance leva à fase seguinte e é recusado numa fase com aprovação", () => {
  cli("open", "F01a");
  expect(cli("advance", "F01a").code).toBe(0);
  expect(state("F01a").phase).toBe(4);
  const refused = cli("advance", "F01a");
  expect(refused.code).toBe(1);
  expect(refused.err).toContain("4");
  expect(state("F01a").phase).toBe(4);
});

test("approve grava quem e quando e leva à fase seguinte", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  const result = cli("approve", "F01a");
  expect(result.code).toBe(0);
  expect(state("F01a")).toEqual({
    id: "F01a",
    phase: 5,
    decisions: [{ phase: 4, decision: "approve", by: "Ana Lima", at: NOW }],
  });
});

test("approve fora de uma fase com aprovação é recusado e diz a fase", () => {
  cli("open", "F02");
  const before = readFileSync(stateFile(repo, "F02"), "utf8");
  const result = cli("approve", "F02");
  expect(result.code).toBe(1);
  expect(result.err).toMatch(/F02.*3/);
  expect(readFileSync(stateFile(repo, "F02"), "utf8")).toBe(before);
});

test("reject exige --reason e grava o motivo", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  expect(cli("reject", "F01a").code).toBe(1);
  expect(cli("reject", "F01a", "--reason", "falta um cenário").code).toBe(0);
  expect(state("F01a").phase).toBe(3);
  expect(state("F01a").decisions[0]).toMatchObject({
    decision: "reject",
    reason: "falta um cenário",
  });
});

test("sem nome de autor no Git, a decisão é recusada e diz como configurar", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  execFileSync("git", ["config", "--unset", "user.name"], { cwd: repo, env });
  const result = cli("approve", "F01a");
  expect(result.code).toBe(1);
  expect(result.err).toContain("git config user.name");
  expect(state("F01a").phase).toBe(4);
});

test("funcionalidade que não existe e arquivo inválido são recusados", () => {
  expect(cli("advance", "F09").err).toContain("F09");
  cli("open", "F01a");
  writeFileSync(stateFile(repo, "F01a"), "{");
  const result = cli("status");
  expect(result.code).toBe(1);
  expect(result.err).toContain("F01a.json");
});

test("comando desconhecido ou sem ID mostra o uso", () => {
  expect(cli().code).toBe(1);
  expect(cli("fly").code).toBe(1);
  expect(cli("approve").code).toBe(1);
  expect(cli("status", "--spec").code).toBe(1);
});
