import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BRAND, DATA_DIR } from "@curupira/core";
import { beforeAll, beforeEach, expect, test } from "vite-plus/test";
import { makeOrigin, runInstall, TOOLS } from "./install-support.ts";

// Os cenários da spec da F00 (docs/specs/F00-instalar-e-preparar/spec.md), contra o script e a CLI reais,
// com uma pasta pessoal descartável e, no `init`, um repositório Git descartável. O comando é o instalado,
// chamado pelo PATH.
const SETTINGS = join(".claude", "settings.json");
let origin: string;
let base: string;
let home: string;
let repo: string;

beforeAll(() => {
  origin = makeOrigin();
});

beforeEach(() => {
  base = realpathSync(mkdtempSync(join(tmpdir(), "scenario-f00-")));
  home = join(base, "home");
  mkdirSync(home);
  repo = join(base, "repo");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
});

function install() {
  return runInstall(base, home, origin, { onPath: true });
}

// O comando instalado, achado pelo PATH com a pasta ~/.local/bin, como a pessoa o chamaria.
function cli(tools: string, ...args: string[]) {
  const result = spawnSync(BRAND.name, args, {
    cwd: repo,
    env: { HOME: home, PATH: `${tools}:${join(home, ".local/bin")}`, GIT_CONFIG_NOSYSTEM: "1" },
    encoding: "utf8",
  });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

function installed(): string {
  const result = install();
  expect(result.code).toBe(0);
  return result.tools;
}

function read(file: string): string {
  return readFileSync(join(repo, file), "utf8");
}

// Tudo o que há no repositório, fora do .git, para um arquivo novo também contar como mudança.
function files(): Record<string, string> {
  return Object.fromEntries(
    readdirSync(repo, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => join(entry.parentPath, entry.name).slice(repo.length + 1))
      .filter((file) => file !== ".git" && !file.startsWith(".git/"))
      .sort()
      .map((file) => [file, read(file)]),
  );
}

test("C1. A instalação põe o comando no caminho, sem npm", () => {
  const result = install();
  expect(result.code).toBe(0);
  expect(result.out).toContain(join(home, ".local/share", BRAND.name));
  expect(result.out).toContain(join(home, ".local/bin", BRAND.name));
  for (const manager of ["npm", "npx", "pnpm"]) {
    expect(existsSync(join(result.tools, manager))).toBe(false);
  }
  const status = cli(result.tools, "status");
  expect(status.err).toBe("");
  expect(status.code).toBe(0);
  expect(status.out).toMatch(/Nenhuma funcionalidade/);
});

test("C2. Sem Git, a instalação para antes de mudar qualquer coisa", () => {
  const result = runInstall(base, home, origin, { tools: TOOLS.filter((tool) => tool !== "git") });
  expect(result.code).not.toBe(0);
  expect(result.err).toMatch(/Falta o Git/);
  expect(readdirSync(home)).toEqual([]);
});

test("C3. O init prepara o projeto", () => {
  const tools = installed();
  writeFileSync(join(repo, ".gitignore"), "dist/\n");
  const result = cli(tools, "init");
  expect(result.err).toBe("");
  expect(result.code).toBe(0);
  const commands = JSON.parse(read(SETTINGS)).hooks.UserPromptSubmit.flatMap(
    (entry: { hooks: { command: string }[] }) => entry.hooks.map((hook) => hook.command),
  );
  expect(commands).toEqual([`${BRAND.name} hook answer`]);
  expect(read(".gitignore")).toBe(`dist/\n${DATA_DIR}/local/\n`);
  expect(result.out).toContain(SETTINGS);
  expect(result.out).toContain(".gitignore");
  expect(existsSync(join(repo, DATA_DIR))).toBe(false);
});

test("C4. O init de novo não muda nada", () => {
  const tools = installed();
  writeFileSync(join(repo, ".gitignore"), "dist/\n");
  cli(tools, "init");
  const before = files();
  const result = cli(tools, "init");
  expect(result.code).toBe(0);
  expect(result.out).toMatch(/já estava pronto/);
  expect(files()).toEqual(before);
});

test("C5. Um settings.json inválido não é tocado", () => {
  const tools = installed();
  mkdirSync(join(repo, ".claude"));
  writeFileSync(join(repo, SETTINGS), "{ não é json");
  writeFileSync(join(repo, ".gitignore"), "dist/\n");
  const before = files();
  const result = cli(tools, "init");
  expect(result.code).toBe(1);
  expect(result.err).toContain(SETTINGS);
  expect(files()).toEqual(before);
});
