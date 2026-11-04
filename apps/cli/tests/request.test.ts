import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { agentSession, answerHook, readPromptHook } from "@curupira/claude-code";
import { BRAND, stateFile, writeState, type FeatureState } from "@curupira/core";
import { beforeEach, expect, test } from "vite-plus/test";
import { run } from "../src/run.ts";

// O pedido (passo 1 do plano da F01c), num repositório Git descartável com um commit e a spec da F09.
const NOW = "2026-11-04T16:00:00.000Z";
const SPEC = join("docs", "specs", "F09-exemplo", "spec.md");
let repo: string;
let env: NodeJS.ProcessEnv;

beforeEach(() => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), "request-")));
  const emptyConfig = join(base, "gitconfig");
  writeFileSync(emptyConfig, "");
  env = { ...process.env, GIT_CONFIG_GLOBAL: emptyConfig, GIT_CONFIG_NOSYSTEM: "1" };
  repo = join(base, "repo");
  mkdirSync(repo);
  git("init", "-q");
  git("config", "user.name", "Ana Lima");
  git("config", "user.email", "ana@example.com");
  write(SPEC, "# F09\n");
  git("add", "-A");
  git("commit", "-qm", "início");
});

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: repo, env, encoding: "utf8" }).trim();
}

function write(file: string, content: string): void {
  mkdirSync(join(repo, file, ".."), { recursive: true });
  writeFileSync(join(repo, file), content);
}

function cli(...args: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = run(args, {
    cwd: repo,
    env,
    agent: { session: agentSession, readPrompt: readPromptHook, answerHook },
    stdin: () => "",
    now: () => NOW,
    out: (line) => out.push(line),
    err: (line) => err.push(line),
  });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

function at(phase: FeatureState["phase"], id = "F09"): void {
  writeState(repo, { id, phase, decisions: [] });
}

function state(id = "F09") {
  return JSON.parse(readFileSync(stateFile(repo, id), "utf8"));
}

function raw(id = "F09"): string {
  return readFileSync(stateFile(repo, id), "utf8");
}

function sha256(file: string): string {
  return createHash("sha256")
    .update(readFileSync(join(repo, file)))
    .digest("hex");
}

test("na fase 4, grava o pedido com a hora, o caminho e o SHA-256 do spec.md", () => {
  at(4);
  const result = cli("request", "F09");
  expect(result.err).toBe("");
  expect(result.code).toBe(0);
  expect(state().request).toEqual({ phase: 4, at: NOW, path: SPEC, hash: sha256(SPEC) });
  expect(result.out).toContain(SPEC);
});

test("nas fases 7 e 8, grava o commit", () => {
  for (const phase of [7, 8] as const) {
    at(phase);
    const result = cli("request", "F09");
    expect(result.code).toBe(0);
    expect(state().request).toEqual({ phase, at: NOW, hash: git("rev-parse", "HEAD") });
    expect(result.out).toContain(git("rev-parse", "--short", "HEAD"));
  }
});

test("um segundo pedido substitui o primeiro", () => {
  at(4);
  cli("request", "F09");
  write(SPEC, "# F09, mudada\n");
  cli("request", "F09");
  expect(state().request.hash).toBe(sha256(SPEC));
});

test("numa fase sem aprovação, recusa sem gravar", () => {
  for (const phase of [3, 5, 6] as const) {
    at(phase);
    const before = raw();
    const result = cli("request", "F09");
    expect(result.code).toBe(1);
    expect(result.err).toContain(String(phase));
    expect(raw()).toBe(before);
  }
});

test("uma funcionalidade fora da jornada ou entregue é recusada", () => {
  expect(cli("request", "F09").code).toBe(1);
  at("delivered");
  expect(cli("request", "F09").code).toBe(1);
});

test("sem spec.md, ou com duas pastas de spec, recusa dizendo o caminho", () => {
  at(4, "F10");
  let result = cli("request", "F10");
  expect(result.code).toBe(1);
  expect(result.err).toContain("F10");
  expect(state("F10").request).toBeUndefined();

  write(join("docs", "specs", "F09-outra", "spec.md"), "# outra\n");
  at(4);
  result = cli("request", "F09");
  expect(result.code).toBe(1);
  expect(result.err).toContain("F09-exemplo");
  expect(result.err).toContain("F09-outra");
  expect(state().request).toBeUndefined();
});

test("a pasta de outro ID com o mesmo começo não conta", () => {
  write(join("docs", "specs", "F01-velha", "spec.md"), "# F01\n");
  write(join("docs", "specs", "F01a-nova", "spec.md"), "# F01a\n");
  at(4, "F01a");
  expect(cli("request", "F01a").code).toBe(0);
  expect(state("F01a").request.path).toBe(join("docs", "specs", "F01a-nova", "spec.md"));
});

test("um spec.md que é pasta, link simbólico ou ilegível é recusado, dizendo o caminho", () => {
  at(4);
  const file = join(repo, SPEC);
  execFileSync("rm", [file]);
  mkdirSync(file);
  let result = cli("request", "F09");
  expect(result.code).toBe(1);
  expect(result.err).toContain(SPEC);

  execFileSync("rm", ["-r", file]);
  writeFileSync(join(repo, "fora.md"), "# fora\n");
  symlinkSync(join(repo, "fora.md"), file);
  result = cli("request", "F09");
  expect(result.code).toBe(1);
  expect(result.err).toContain(SPEC);

  execFileSync("rm", [file]);
  writeFileSync(file, "# F09\n");
  chmodSync(file, 0o000);
  try {
    result = cli("request", "F09");
    expect(result.code).toBe(1);
    expect(result.err).toContain(SPEC);
  } finally {
    chmodSync(file, 0o644);
  }
  expect(state().request).toBeUndefined();
});

test("nas fases 7 e 8, uma mudança sem commit fora da pasta de dados é recusada", () => {
  at(7);
  const before = raw();
  write("codigo.ts", "novo\n");
  let result = cli("request", "F09");
  expect(result.code).toBe(1);
  expect(result.err).toContain("codigo.ts");
  expect(raw()).toBe(before);

  execFileSync("rm", [join(repo, "codigo.ts")]);
  write(SPEC, "# mudada\n");
  result = cli("request", "F09");
  expect(result.code).toBe(1);
  expect(result.err).toContain(SPEC);
});

test("nas fases 7 e 8, um arquivo ignorado e uma mudança só na pasta de dados não contam", () => {
  write(".gitignore", "dist/\n");
  git("add", "-A");
  git("commit", "-qm", "ignora dist");
  write("dist/x.js", "gerado\n");
  at(7);
  write(join(`.${BRAND.name}`, "local", "x"), "local\n");
  expect(cli("request", "F09").code).toBe(0);
});

test("num repositório sem commit, o pedido das fases 7 e 8 é recusado", () => {
  git("update-ref", "-d", "HEAD");
  at(7);
  const result = cli("request", "F09");
  expect(result.code).toBe(1);
  expect(result.err).toMatch(/commit/);
  expect(state().request).toBeUndefined();
});

test("o pedido gravado continua um estado válido, e um pedido malformado é estado inválido", () => {
  at(4);
  cli("request", "F09");
  expect(cli("status").code).toBe(0);
  const broken = { ...state(), request: { phase: 5, at: "ontem", hash: "" } };
  writeFileSync(stateFile(repo, "F09"), JSON.stringify(broken));
  const result = cli("status");
  expect(result.code).toBe(1);
  expect(result.err).toMatch(/pedido/);
});

test("request precisa de um ID", () => {
  expect(cli("request").code).toBe(1);
  expect(cli("request").err).toMatch(/request <ID>/);
});

test("uma pasta da spec que é link simbólico é recusada, mesmo com o spec.md comum dentro", () => {
  const outside = join(repo, "..", "fora");
  mkdirSync(outside);
  writeFileSync(join(outside, "spec.md"), "# fora\n");
  execFileSync("rm", ["-r", join(repo, SPEC, "..")]);
  symlinkSync(outside, join(repo, SPEC, ".."));
  at(4);
  let result = cli("request", "F09");
  expect(result.code).toBe(1);
  expect(result.err).toContain(join("docs", "specs", "F09-exemplo"));
  expect(state().request).toBeUndefined();

  execFileSync("rm", ["-r", join(repo, "docs", "specs")]);
  mkdirSync(join(outside, "F09-exemplo"));
  writeFileSync(join(outside, "F09-exemplo", "spec.md"), "# fora\n");
  symlinkSync(outside, join(repo, "docs", "specs"));
  result = cli("request", "F09");
  expect(result.code).toBe(1);
  expect(state().request).toBeUndefined();
});

test("um arquivo solto com o começo do ID não conta como pasta de spec", () => {
  write(join("docs", "specs", "F09-notas.md"), "# notas\n");
  at(4);
  expect(cli("request", "F09").code).toBe(0);
  expect(state().request.path).toBe(SPEC);
});

test("sem pasta de spec, a mensagem diz onde ela fica", () => {
  at(4, "F10");
  const result = cli("request", "F10");
  expect(result.code).toBe(1);
  expect(result.err).toContain(join("docs", "specs", "F10-"));
});

test("uma saída grande do git status não vira falta de commit", () => {
  at(7);
  const dir = join(repo, "muitos");
  mkdirSync(dir);
  for (let i = 0; i < 30000; i++)
    writeFileSync(join(dir, `arquivo-com-um-nome-comprido-${i}.txt`), "");
  const result = cli("request", "F09");
  expect(result.code).toBe(1);
  expect(result.err).toContain("muitos");
});

test("um pedido com o caminho fora do lugar, sem caminho na fase 4, com caminho na 7 ou com hora solta é inválido", () => {
  const cases = [
    { phase: 4, at: NOW, hash: "a", path: join("..", "fora.md") },
    { phase: 4, at: NOW, hash: "a", path: "/etc/spec.md" },
    { phase: 4, at: NOW, hash: "a" },
    { phase: 7, at: NOW, hash: "a", path: SPEC },
    { phase: 4, at: "1", hash: "a", path: SPEC },
  ];
  at(4);
  for (const request of cases) {
    writeFileSync(
      stateFile(repo, "F09"),
      JSON.stringify({ id: "F09", phase: request.phase, decisions: [], request }),
    );
    const result = cli("status");
    expect(result.code).toBe(1);
    expect(result.err).toMatch(/pedido/);
  }
});
