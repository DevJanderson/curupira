import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
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
// O pedido vem antes da resposta (F01c): a hora padrão dele é anterior à de cada mensagem digitada.
const ASKED = "2026-11-03T19:59:00.000Z";
const SPEC = join("docs", "specs", "F01a-exemplo", "spec.md");
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
  execFileSync("git", ["config", "user.email", "ana@example.com"], { cwd: repo, env });
  for (const file of [SPEC, join("docs", "specs", "F02-exemplo", "spec.md")]) {
    mkdirSync(join(repo, file, ".."), { recursive: true });
    writeFileSync(join(repo, file), "# spec\n");
  }
  execFileSync("git", ["add", "-A"], { cwd: repo, env });
  execFileSync("git", ["commit", "-qm", "specs"], { cwd: repo, env });
});

function cli(...args: string[]) {
  return cliWith("", args);
}

// A mensagem digitada passa pelo hook, como o Claude Code faria.
function say(prompt: string, session = SESSION, now = NOW) {
  return cliWith(JSON.stringify({ session_id: session, prompt }), ["hook", "answer"], now);
}

function ask(id: string, now = ASKED) {
  return cliWith("", ["request", id], now);
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
  ask("F01a");
  say("Sim.");
  const result = cli("approve", "F01a");
  expect(result.code).toBe(0);
  const decision = { phase: 4, decision: "approve", by: "Ana Lima", at: NOW, answer: "Sim." };
  const asked = { requestedAt: ASKED, hash: sha256(SPEC), path: SPEC };
  expect(state("F01a")).toEqual({ id: "F01a", phase: 5, decisions: [{ ...decision, ...asked }] });
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
  ask("F01a");
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
  ask("F01a");
  say("não, a spec mudou");
  expect(cli("reject", "F01a", "--spec").code).toBe(0);
  expect(state("F01a").phase).toBe(3);
});

test("sem nome de autor no Git, a decisão é recusada e diz como configurar", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  ask("F01a");
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
  ask("F01a");
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
  ask("F01a");
  ask("F02");
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
  ask("F01a");
  say("sim, e mais uma coisa");
  const result = cli("approve", "F01a");
  expect(result.code).toBe(1);
  expect(result.err).toContain("sozinho");
  expect(state("F01a").phase).toBe(4);
});

test("sem a sessão do agente, a decisão é recusada", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  ask("F01a");
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
  ask("F01a");
  say("não, falta um cenário");
  expect(cli("reject", "F01a").code).toBe(0);
  expect(existsSync(answerFile(repo, SESSION))).toBe(false);
  cli("advance", "F01a");
  ask("F01a");
  const before = readFileSync(stateFile(repo, "F01a"), "utf8");
  const again = cli("reject", "F01a");
  expect(again.code).toBe(1);
  expect(again.err).toContain("não, <motivo>");
  expect(readFileSync(stateFile(repo, "F01a"), "utf8")).toBe(before);
});

test("um sim digitado em outra sessão não aprova", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  ask("F01a");
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
  ask("F01a", "2026-09-30T20:00:00.000Z");
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

test("qual erro vence: a fase, o pedido, a sessão, a resposta e, por último, o autor", () => {
  cli("open", "F02");
  execFileSync("git", ["config", "--unset", "user.name"], { cwd: repo, env });
  delete env.CLAUDE_CODE_SESSION_ID;
  for (const command of ["approve", "reject"]) {
    expect(cli(command, "F02").err).toMatch(/F02.*fase 3/);
  }
  cli("advance", "F02");
  for (const command of ["approve", "reject"]) {
    expect(cli(command, "F02").err).toContain("request F02");
  }
  ask("F02");
  for (const command of ["approve", "reject"]) {
    expect(cli(command, "F02").err).toContain("sessão");
  }
  env.CLAUDE_CODE_SESSION_ID = SESSION;
  expect(cli("approve", "F02").err).toContain('"sim"');
  expect(cli("reject", "F02").err).toContain("não, <motivo>");
});

test("sem pedido, ou com o pedido de outra fase, approve e reject recusam e citam o request", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  for (const prompt of ["sim", "não, falta um cenário"]) {
    say(prompt);
    const before = readFileSync(stateFile(repo, "F01a"), "utf8");
    const result = cli(prompt === "sim" ? "approve" : "reject", "F01a");
    expect(result.code).toBe(1);
    expect(result.err).toContain("request F01a");
    expect(readFileSync(stateFile(repo, "F01a"), "utf8")).toBe(before);
  }
  ask("F01a");
  const asked = state("F01a");
  writeFileSync(stateFile(repo, "F01a"), JSON.stringify({ ...asked, phase: 7 }));
  say("sim");
  expect(cli("approve", "F01a").err).toContain("request F01a");
  expect(state("F01a").phase).toBe(7);
});

test("uma resposta de antes do pedido, ou da mesma hora, não vale e pede outra resposta", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  for (const [answered, asked] of [
    [ASKED, NOW],
    [NOW, NOW],
  ]) {
    for (const [prompt, command] of [
      ["sim", "approve"],
      ["não, falta um cenário", "reject"],
    ]) {
      say(prompt, SESSION, answered);
      ask("F01a", asked);
      const before = readFileSync(stateFile(repo, "F01a"), "utf8");
      const result = cli(command!, "F01a");
      expect(result.code).toBe(1);
      expect(result.err).toContain("responder de novo");
      expect(readFileSync(stateFile(repo, "F01a"), "utf8")).toBe(before);
    }
  }
});

test("a recusa guarda o pedido, e o pedido sai do estado depois da decisão", () => {
  cli("open", "F01a");
  cli("advance", "F01a");
  ask("F01a");
  say("não, falta um cenário");
  expect(cli("reject", "F01a").code).toBe(0);
  const after = state("F01a");
  expect(after.request).toBeUndefined();
  expect(after.decisions[0]).toMatchObject({ requestedAt: ASKED, hash: sha256(SPEC), path: SPEC });
});

test("nas fases 7 e 8, a decisão guarda o commit do pedido, sem caminho", () => {
  cli("open", "F01a");
  writeFileSync(stateFile(repo, "F01a"), JSON.stringify({ id: "F01a", phase: 7, decisions: [] }));
  ask("F01a");
  say("sim");
  expect(cli("approve", "F01a").code).toBe(0);
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, env, encoding: "utf8" });
  const decision = state("F01a").decisions[0];
  expect(decision).toMatchObject({ phase: 7, requestedAt: ASKED, hash: head.trim() });
  expect(decision).not.toHaveProperty("path");
});

function sha256(file: string): string {
  return createHash("sha256")
    .update(readFileSync(join(repo, file)))
    .digest("hex");
}

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: repo, env, encoding: "utf8" }).trim();
}

function atPhase(phase: 4 | 7 | 8): void {
  cli("open", "F01a");
  writeFileSync(stateFile(repo, "F01a"), JSON.stringify({ id: "F01a", phase, decisions: [] }));
}

test("na fase 4, um spec.md mudado depois do pedido não é aprovado; um pedido novo e um sim novo aprovam", () => {
  atPhase(4);
  ask("F01a");
  writeFileSync(join(repo, SPEC), "# spec, mudada\n");
  say("sim");
  const before = readFileSync(stateFile(repo, "F01a"), "utf8");
  const result = cli("approve", "F01a");
  expect(result.code).toBe(1);
  expect(result.err).toContain(SPEC);
  expect(result.err).toContain("request F01a");
  expect(readFileSync(stateFile(repo, "F01a"), "utf8")).toBe(before);
  ask("F01a");
  say("sim");
  expect(cli("approve", "F01a").code).toBe(0);
  expect(state("F01a").decisions[0].hash).toBe(sha256(SPEC));
});

test("um spec.md apagado ou movido depois do pedido não é aprovado, e a mensagem diz o caminho", () => {
  atPhase(4);
  ask("F01a");
  const moved = join(repo, "docs", "specs", "F01a-outro");
  execFileSync("mv", [join(repo, SPEC, ".."), moved]);
  say("sim");
  let result = cli("approve", "F01a");
  expect(result.code).toBe(1);
  expect(result.err).toContain(SPEC);
  expect(result.err).toContain("request F01a");
  execFileSync("rm", ["-r", moved]);
  say("sim");
  result = cli("approve", "F01a");
  expect(result.code).toBe(1);
  expect(result.err).toContain(SPEC);
  expect(state("F01a").phase).toBe(4);
});

test("nas fases 7 e 8, um commit novo ou uma mudança sem commit depois do pedido não são aprovados", () => {
  for (const phase of [7, 8] as const) {
    atPhase(phase);
    ask("F01a");
    writeFileSync(join(repo, "codigo.ts"), `fase ${phase}\n`);
    say("sim");
    const before = readFileSync(stateFile(repo, "F01a"), "utf8");
    let result = cli("approve", "F01a");
    expect(result.code).toBe(1);
    expect(result.err).toContain("codigo.ts");
    expect(result.err).toContain("request F01a");
    git("add", "codigo.ts");
    git("commit", "-qm", `fase ${phase}`);
    say("sim");
    result = cli("approve", "F01a");
    expect(result.code).toBe(1);
    expect(result.err).toContain("request F01a");
    expect(readFileSync(stateFile(repo, "F01a"), "utf8")).toBe(before);
  }
});

test("o reject não confere o conteúdo: um não ao que a pessoa viu continua valendo", () => {
  atPhase(4);
  ask("F01a");
  writeFileSync(join(repo, SPEC), "# spec, mudada\n");
  say("não, falta um cenário");
  expect(cli("reject", "F01a").code).toBe(0);
  expect(state("F01a").phase).toBe(3);
});

test("o conteúdo mudado vem antes da sessão", () => {
  atPhase(4);
  ask("F01a");
  writeFileSync(join(repo, SPEC), "# spec, mudada\n");
  delete env.CLAUDE_CODE_SESSION_ID;
  const result = cli("approve", "F01a");
  expect(result.err).toContain("request F01a");
  expect(result.err).not.toContain("sessão");
});

test("na fase 4, uma segunda pasta de spec que aparece depois do pedido faz o approve recusar", () => {
  atPhase(4);
  ask("F01a");
  const copy = join(repo, "docs", "specs", "F01a-copia");
  mkdirSync(copy);
  writeFileSync(join(copy, "spec.md"), "# outra spec\n");
  say("sim");
  const result = cli("approve", "F01a");
  expect(result.code).toBe(1);
  expect(result.err).toContain("request F01a");
  expect(state("F01a").phase).toBe(4);
});

test("um commit novo e uma mudança sem commit têm mensagens diferentes", () => {
  atPhase(7);
  ask("F01a");
  writeFileSync(join(repo, "codigo.ts"), "novo\n");
  say("sim");
  expect(cli("approve", "F01a").err).toMatch(/sem commit.*codigo\.ts/);
  git("add", "codigo.ts");
  git("commit", "-qm", "novo");
  say("sim");
  expect(cli("approve", "F01a").err).toContain(`commit ${git("rev-parse", "--short=12", "HEAD")}`);
});
