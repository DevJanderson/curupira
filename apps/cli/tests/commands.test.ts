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
import { agentSession, answerHook, readPromptHook } from "@curupira/claude-code";
import { answerFile, stateFile } from "@curupira/core";
import { beforeEach, expect, test } from "vite-plus/test";
import { run } from "../src/run.ts";

const NOW = "2026-11-03T20:00:00.000Z";
const SESSION = "sessao-de-teste";
let repo: string;
let env: NodeJS.ProcessEnv;

beforeEach(() => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), "cli-")));
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
});

function cli(...args: string[]) {
  return cliWith("", args);
}

// A mensagem digitada passa pelo hook, como o Claude Code faria.
function say(prompt: string, session = SESSION, now = NOW) {
  return cliWith(JSON.stringify({ session_id: session, prompt }), ["hook", "answer"], now);
}

function cliWith(stdin: string, args: string[], now = NOW) {
  const out: string[] = [];
  const err: string[] = [];
  const code = run(args, {
    cwd: repo,
    env,
    agent: { session: agentSession, readPrompt: readPromptHook, answerHook },
    stdin: () => stdin,
    now: () => now,
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
  say("Sim.");
  const result = cli("approve", "F01a");
  expect(result.code).toBe(0);
  expect(state("F01a")).toEqual({
    id: "F01a",
    phase: 5,
    decisions: [{ phase: 4, decision: "approve", by: "Ana Lima", at: NOW, answer: "Sim." }],
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

test("reject tira o motivo do não digitado", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  say("não");
  expect(cli("reject", "F01a").err).toContain("não, <motivo>");
  say("não, falta um cenário");
  expect(cli("reject", "F01a").code).toBe(0);
  expect(state("F01a").phase).toBe(3);
  expect(state("F01a").decisions[0]).toMatchObject({
    decision: "reject",
    reason: "falta um cenário",
  });
});

test("reject --spec na fase 7 volta à fase 3", () => {
  cli("open", "F01a");
  writeFileSync(stateFile(repo, "F01a"), JSON.stringify({ id: "F01a", phase: 7, decisions: [] }));
  say("não, a spec mudou");
  expect(cli("reject", "F01a", "--spec").code).toBe(0);
  expect(state("F01a").phase).toBe(3);
});

test("sem nome de autor no Git, a decisão é recusada e diz como configurar", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  execFileSync("git", ["config", "--unset", "user.name"], { cwd: repo, env });
  say("sim");
  const result = cli("approve", "F01a");
  expect(result.code).toBe(1);
  expect(result.err).toContain("git config user.name");
  expect(state("F01a").phase).toBe(4);
});

test("sem nome de autor no Git, um comando fora da fase diz a fase", () => {
  cli("open", "F02");
  execFileSync("git", ["config", "--unset", "user.name"], { cwd: repo, env });
  const result = cli("approve", "F02");
  expect(result.code).toBe(1);
  expect(result.err).toMatch(/F02.*fase 3/);
});

test("funcionalidade que não existe e arquivo inválido são recusados", () => {
  const missing = cli("advance", "F09");
  expect(missing.code).toBe(1);
  expect(missing.err).toContain("F09");
  expect(existsSync(stateFile(repo, "F09"))).toBe(false);
  cli("open", "F01a");
  writeFileSync(stateFile(repo, "F01a"), "{");
  const result = cli("status");
  expect(result.code).toBe(1);
  expect(result.err).toContain("F01a.json");
  expect(result.err).toContain("JSON");
});

test("comando desconhecido ou sem ID mostra o uso", () => {
  expect(cli().code).toBe(1);
  expect(cli("fly").code).toBe(1);
  expect(cli("approve").code).toBe(1);
  expect(cli("status", "--spec").code).toBe(1);
  expect(cli("reject", "F01a", "--reason", "x").code).toBe(1);
  expect(cli("hook", "other").code).toBe(1);
});

test("open de uma funcionalidade entregue diz que foi entregue, sem o nome interno da fase", () => {
  cli("open", "F01a");
  writeFileSync(
    stateFile(repo, "F01a"),
    JSON.stringify({ id: "F01a", phase: "delivered", decisions: [] }),
  );
  const result = cli("open", "F01a");
  expect(result.code).toBe(1);
  expect(result.err).toContain("entregue");
  expect(result.err).not.toContain("delivered");
});

test("a recusa na fase 8 diz que a funcionalidade continua na fase 8", () => {
  cli("open", "F01a");
  writeFileSync(stateFile(repo, "F01a"), JSON.stringify({ id: "F01a", phase: 8, decisions: [] }));
  say("não, sem merge");
  const result = cli("reject", "F01a");
  expect(result.code).toBe(0);
  expect(result.out).toContain("continua na fase 8");
});

test("hook answer guarda a resposta sem escrever nada na saída", () => {
  const result = say("sim");
  expect(result).toEqual({ code: 0, out: "", err: "" });
});

test("hook answer com entrada inválida sai com erro que não bloqueia a mensagem", () => {
  const result = cliWith("{", ["hook", "answer"]);
  expect(result.code).toBe(1);
  expect(result.err).toContain("session_id");
});

test("a resposta usada é apagada e não vale para a próxima decisão", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  cli("open", "F02");
  cli("advance", "F02");
  say("sim");
  expect(cli("approve", "F01a").code).toBe(0);
  const again = cli("approve", "F02");
  expect(again.code).toBe(1);
  expect(again.err).toContain('"sim"');
  expect(state("F02").phase).toBe(4);
});

test("um sim com outra frase não aprova e diz que o sim vem sozinho", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  say("sim, e mais uma coisa");
  const result = cli("approve", "F01a");
  expect(result.code).toBe(1);
  expect(result.err).toContain("sozinho");
  expect(state("F01a").phase).toBe(4);
});

test("sem a sessão do agente, a decisão é recusada", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  say("sim");
  delete env.CLAUDE_CODE_SESSION_ID;
  const before = readFileSync(stateFile(repo, "F01a"), "utf8");
  const result = cli("approve", "F01a");
  expect(result.code).toBe(1);
  expect(result.err).toContain("sessão");
  expect(result.err).toContain('"sim"');
  expect(result.err).toContain("não, <motivo>");
  expect(readFileSync(stateFile(repo, "F01a"), "utf8")).toBe(before);
});

test("a recusa usada é apagada e não vale para a próxima recusa", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  say("não, falta um cenário");
  expect(cli("reject", "F01a").code).toBe(0);
  expect(existsSync(answerFile(repo, SESSION))).toBe(false);
  cli("advance", "F01a");
  const before = readFileSync(stateFile(repo, "F01a"), "utf8");
  const again = cli("reject", "F01a");
  expect(again.code).toBe(1);
  expect(again.err).toContain("não, <motivo>");
  expect(readFileSync(stateFile(repo, "F01a"), "utf8")).toBe(before);
});

test("um sim digitado em outra sessão não aprova", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  say("sim", "outra-sessao");
  const before = readFileSync(stateFile(repo, "F01a"), "utf8");
  const result = cli("approve", "F01a");
  expect(result.code).toBe(1);
  expect(result.err).toContain('"sim"');
  expect(readFileSync(stateFile(repo, "F01a"), "utf8")).toBe(before);
});

test("um sim de mais de 30 dias não aprova", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  say("sim", SESSION, "2026-10-01T20:00:00.000Z");
  const result = cli("approve", "F01a");
  expect(result.code).toBe(1);
  expect(result.err).toContain('"sim"');
  expect(state("F01a").phase).toBe(4);
});

test("o hook apaga as respostas de mais de 30 dias, de qualquer sessão", () => {
  say("sim", "outra-sessao", "2026-10-01T20:00:00.000Z");
  say("sim", "sessao-recente", "2026-10-20T20:00:00.000Z");
  say("oi");
  expect(existsSync(answerFile(repo, "outra-sessao"))).toBe(false);
  expect(existsSync(answerFile(repo, "sessao-recente"))).toBe(true);
});

test("qual erro vence: a fase antes da resposta, e a resposta antes do autor", () => {
  cli("open", "F02");
  expect(cli("approve", "F02").err).toMatch(/F02.*fase 3/);
  cli("advance", "F02");
  execFileSync("git", ["config", "--unset", "user.name"], { cwd: repo, env });
  expect(cli("approve", "F02").err).toContain('"sim"');
});
