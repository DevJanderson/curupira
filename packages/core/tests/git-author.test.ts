import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, expect, test } from "vite-plus/test";
import { FlowError, gitAuthor, projectRoot } from "../src/index.ts";

let repo: string;
let env: NodeJS.ProcessEnv;

// Sem a configuração global de quem roda os testes, para o nome vir só do repositório.
beforeEach(() => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), "git-author-")));
  const emptyConfig = join(base, "gitconfig");
  writeFileSync(emptyConfig, "");
  env = { ...process.env, GIT_CONFIG_GLOBAL: emptyConfig, GIT_CONFIG_NOSYSTEM: "1" };
  repo = join(base, "repo");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo, env });
});

function failureCode(run: () => unknown): string {
  try {
    run();
  } catch (error) {
    if (error instanceof FlowError) return error.code;
    throw error;
  }
  throw new Error("esperava um FlowError");
}

test("com user.name configurado, devolve o nome", () => {
  execFileSync("git", ["config", "user.name", "Ana Lima"], { cwd: repo, env });
  execFileSync("git", ["config", "user.email", "ana@example.com"], { cwd: repo, env });
  expect(gitAuthor(repo, env)).toBe("Ana Lima");
});

test("sem user.name, recusa com o erro de autor", () => {
  expect(failureCode(() => gitAuthor(repo, env))).toBe("no-git-author");
});

test("a raiz do projeto é a raiz do repositório Git", () => {
  const sub = join(repo, "a", "b");
  mkdirSync(sub, { recursive: true });
  expect(projectRoot(sub, env)).toBe(repo);
});

test("fora de um repositório Git, recusa", () => {
  const outside = realpathSync(mkdtempSync(join(tmpdir(), "no-git-")));
  expect(
    failureCode(() => projectRoot(outside, { ...env, GIT_CEILING_DIRECTORIES: outside })),
  ).toBe("not-a-git-repo");
});
