import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { BRAND } from "@curupira/core";
import { beforeAll, beforeEach, expect, test } from "vite-plus/test";

// O script de instalação (passo 1 do plano da F00), rodado com uma pasta pessoal e um PATH descartáveis.
// O PATH só tem links para as ferramentas que o script usa, sem npm, npx nem pnpm (ADR-0009).
const ROOT = resolve(import.meta.dirname, "../../..");
const SCRIPT = join(ROOT, "install.sh");
const TOOLS = ["node", "git", "env", "sh", "mkdir", "rm", "mv", "ln", "readlink"];

let origin: string;
let base: string;
let home: string;

// A origem é um repositório Git local com os arquivos desta cópia de trabalho, para o teste valer antes do commit.
beforeAll(() => {
  origin = realpathSync(mkdtempSync(join(tmpdir(), "install-origin-")));
  const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .split("\n")
    .filter((file) => file !== "" && existsSync(join(ROOT, file)));
  for (const file of files) {
    mkdirSync(dirname(join(origin, file)), { recursive: true });
    copyFileSync(join(ROOT, file), join(origin, file));
  }
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: origin, env: gitEnv(origin), stdio: "ignore" });
  git("init", "-q", "-b", "main");
  git("add", "-A");
  git("-c", "user.name=Teste", "-c", "user.email=teste@example.com", "commit", "-qm", "origem");
});

beforeEach(() => {
  base = realpathSync(mkdtempSync(join(tmpdir(), "install-")));
  home = join(base, "home");
  mkdirSync(home);
});

function gitEnv(dir: string): NodeJS.ProcessEnv {
  const config = join(dir, "..", "gitconfig-vazio");
  if (!existsSync(config)) writeFileSync(config, "");
  return { ...process.env, GIT_CONFIG_GLOBAL: config, GIT_CONFIG_NOSYSTEM: "1" };
}

// Uma pasta com links só para as ferramentas pedidas; `fake` troca uma delas por um script.
function toolsDir(tools: string[], fake: Record<string, string> = {}): string {
  const dir = join(base, `bin-${readdirSync(base).length}`);
  mkdirSync(dir);
  for (const tool of tools) {
    const target = tool === "node" ? process.execPath : which(tool);
    symlinkSync(target, join(dir, tool));
  }
  for (const [tool, body] of Object.entries(fake)) {
    writeFileSync(join(dir, tool), `#!/bin/sh\n${body}\n`);
    chmodSync(join(dir, tool), 0o755);
  }
  return dir;
}

function which(tool: string): string {
  return execFileSync("sh", ["-c", `command -v ${tool}`], { encoding: "utf8" }).trim();
}

interface Options {
  tools?: string[];
  fake?: Record<string, string>;
  repo?: string;
  env?: Record<string, string>;
  onPath?: boolean;
}

function install(options: Options = {}) {
  const tools = toolsDir(options.tools ?? TOOLS, options.fake);
  const path = options.onPath ? `${tools}:${join(home, ".local/bin")}` : tools;
  const result = spawnSync(join(tools, "sh"), [SCRIPT], {
    env: {
      HOME: home,
      PATH: path,
      SHELL: "/bin/zsh",
      GIT_CONFIG_NOSYSTEM: "1",
      [`${BRAND.name.toUpperCase()}_REPO`]: options.repo ?? `file://${origin}`,
      ...options.env,
    },
    encoding: "utf8",
  });
  return { code: result.status, out: result.stdout, err: result.stderr, tools };
}

const dataDir = () => join(home, ".local/share", BRAND.name);
const command = () => join(home, ".local/bin", BRAND.name);

function listHome(): string[] {
  return readdirSync(home, { recursive: true }) as string[];
}

test("sem o Node, para sem mudar nada e diz o que falta", () => {
  const result = install({ tools: TOOLS.filter((tool) => tool !== "node") });
  expect(result.code).not.toBe(0);
  expect(result.err).toMatch(/Node/);
  expect(result.err).toMatch(/24\.11/);
  expect(listHome()).toEqual([]);
});

test("sem o Git, para sem mudar nada e diz o que falta", () => {
  const result = install({ tools: TOOLS.filter((tool) => tool !== "git") });
  expect(result.code).not.toBe(0);
  expect(result.err).toMatch(/Git/);
  expect(listHome()).toEqual([]);
});

test("com o Node abaixo de 24.11, para sem mudar nada e diz a versão pedida", () => {
  const tools = TOOLS.filter((tool) => tool !== "node");
  for (const version of ["22.18.0", "24.10.3"]) {
    const result = install({ tools, fake: { node: `echo ${version}` } });
    expect(result.code).not.toBe(0);
    expect(result.err).toMatch(/24\.11/);
    expect(result.err).toContain(version);
    expect(listHome()).toEqual([]);
  }
});

test("instala a cópia e o comando, diz onde ficaram, e o comando roda pelo link", () => {
  const result = install();
  expect(result.err).toBe("");
  expect(result.code).toBe(0);
  expect(result.out).toContain(dataDir());
  expect(result.out).toContain(command());
  expect(lstatSync(command()).isSymbolicLink()).toBe(true);
  expect(readlinkSync(command())).toBe(join(dataDir(), "apps/cli/src/main.ts"));

  const project = join(base, "projeto");
  mkdirSync(project);
  execFileSync("git", ["init", "-q"], { cwd: project });
  const status = spawnSync(command(), ["status"], {
    cwd: project,
    env: { HOME: home, PATH: result.tools },
    encoding: "utf8",
  });
  expect(status.stderr).toBe("");
  expect(status.stdout).toMatch(/Nenhuma funcionalidade/);
});

test("de novo, troca a cópia e não mexe no resto", () => {
  install();
  writeFileSync(join(dataDir(), "sobra"), "");
  writeFileSync(join(home, ".local/share/outra"), "");
  const result = install();
  expect(result.code).toBe(0);
  expect(existsSync(join(dataDir(), "sobra"))).toBe(false);
  expect(existsSync(join(dataDir(), "apps/cli/src/main.ts"))).toBe(true);
  expect(existsSync(join(home, ".local/share/outra"))).toBe(true);
  expect(readlinkSync(command())).toBe(join(dataDir(), "apps/cli/src/main.ts"));
});

test("com a origem que não existe, deixa a cópia anterior e diz qual origem", () => {
  install();
  writeFileSync(join(dataDir(), "sobra"), "");
  const missing = `file://${join(base, "nao-existe")}`;
  const result = install({ repo: missing });
  expect(result.code).not.toBe(0);
  expect(result.err).toContain(missing);
  expect(existsSync(join(dataDir(), "sobra"))).toBe(true);
  expect(readdirSync(join(home, ".local/share")).sort()).toEqual([BRAND.name]);
});

test("com uma falha no meio da troca, devolve a cópia anterior e diz qual caminho", () => {
  install();
  writeFileSync(join(dataDir(), "sobra"), "");
  // Um mv que só falha ao pôr a cópia nova no lugar, depois de a antiga ter ido para a reserva.
  const mv = `case "$1" in */.${BRAND.name}-new) exit 1 ;; esac\nexec ${which("mv")} "$@"`;
  const result = install({ tools: TOOLS.filter((tool) => tool !== "mv"), fake: { mv } });
  expect(result.code).not.toBe(0);
  expect(result.err).toContain(dataDir());
  expect(existsSync(join(dataDir(), "sobra"))).toBe(true);
  expect(readdirSync(join(home, ".local/share"))).toEqual([BRAND.name]);
});

test("um caminho de reserva ocupado não é tocado, e a cópia anterior fica", () => {
  install();
  writeFileSync(join(dataDir(), "sobra"), "");
  const reserve = join(home, ".local/share", `.${BRAND.name}-old`);
  writeFileSync(reserve, "no caminho");
  const result = install();
  expect(result.code).not.toBe(0);
  expect(result.err).toContain(reserve);
  expect(existsSync(join(dataDir(), "sobra"))).toBe(true);
  expect(readFileSync(reserve, "utf8")).toBe("no caminho");
  expect(readdirSync(join(home, ".local/share")).sort()).toEqual(
    [BRAND.name, `.${BRAND.name}-old`].sort(),
  );
});

test("uma pasta sem a marca da instalação não é tocada", () => {
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(join(dataDir(), "de-outro"), "");
  const result = install();
  expect(result.code).not.toBe(0);
  expect(result.err).toContain(dataDir());
  expect(readdirSync(dataDir())).toEqual(["de-outro"]);
  expect(existsSync(command())).toBe(false);
});

test("um comando que não é o link da instalação não é tocado", () => {
  mkdirSync(dirname(command()), { recursive: true });
  writeFileSync(command(), "de outro");
  const result = install();
  expect(result.code).not.toBe(0);
  expect(result.err).toContain(command());
  expect(readFileSync(command(), "utf8")).toBe("de outro");
  expect(existsSync(dataDir())).toBe(false);
});

test("um link de outro lugar no nome do comando não é tocado", () => {
  mkdirSync(dirname(command()), { recursive: true });
  symlinkSync("/usr/bin/env", command());
  const result = install();
  expect(result.code).not.toBe(0);
  expect(result.err).toContain(command());
  expect(readlinkSync(command())).toBe("/usr/bin/env");
});

test("usa o XDG_DATA_HOME absoluto e ignora o relativo", () => {
  const xdg = join(base, "dados");
  expect(install({ env: { XDG_DATA_HOME: xdg } }).code).toBe(0);
  expect(readlinkSync(command())).toBe(join(xdg, BRAND.name, "apps/cli/src/main.ts"));

  const relative = install({ env: { XDG_DATA_HOME: "dados-relativos" } });
  expect(relative.code).not.toBe(0);
  expect(relative.err).toContain(command());

  home = join(base, "home2");
  mkdirSync(home);
  expect(install({ env: { XDG_DATA_HOME: "dados-relativos" } }).code).toBe(0);
  expect(readlinkSync(command())).toBe(join(dataDir(), "apps/cli/src/main.ts"));
});

test("fora do PATH, diz a linha e o arquivo do shell; no PATH, não diz", () => {
  const line = 'export PATH="$HOME/.local/bin:$PATH"';
  const shells = { "/bin/zsh": ".zshrc", "/usr/bin/bash": ".bashrc", "/usr/bin/fish": ".profile" };
  for (const [shell, file] of Object.entries(shells)) {
    const result = install({ env: { SHELL: shell } });
    expect(result.code).toBe(0);
    expect(result.out).toContain(line);
    expect(result.out).toContain(join(home, file));
  }
  const onPath = install({ onPath: true });
  expect(onPath.code).toBe(0);
  expect(onPath.out).not.toContain(line);
});

test("o nome no script é o da constante e só está no topo e nos comentários", () => {
  const lines = readFileSync(SCRIPT, "utf8").split("\n");
  expect(lines).toContain(`NAME=${BRAND.name}`);
  expect(lines).toContain(`DISPLAY_NAME=${BRAND.displayName}`);
  const named = lines.filter((line) => new RegExp(BRAND.name, "i").test(line));
  const allowed = /^(\s*#|NAME=|DISPLAY_NAME=|REPO=)/;
  expect(named.filter((line) => !allowed.test(line))).toEqual([]);
  expect(lines.filter((line) => line.startsWith("REPO="))).toEqual([
    `REPO=\${${BRAND.name.toUpperCase()}_REPO:-https://github.com/DevJanderson/$NAME}`,
  ]);
});
