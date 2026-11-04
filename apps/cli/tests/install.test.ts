import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { BRAND } from "@curupira/core";
import { beforeAll, beforeEach, expect, test } from "vite-plus/test";
import {
  makeOrigin,
  runInstall,
  SCRIPT,
  TOOLS,
  which,
  type InstallOptions,
} from "./install-support.ts";

// O script de instalação (passo 1 do plano da F00), rodado com uma pasta pessoal e um PATH descartáveis.
let origin: string;
let base: string;
let home: string;

beforeAll(() => {
  origin = makeOrigin();
});

beforeEach(() => {
  base = realpathSync(mkdtempSync(join(tmpdir(), "install-")));
  home = join(base, "home");
  mkdirSync(home);
});

function install(options: InstallOptions = {}) {
  return runInstall(base, home, origin, options);
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
  expect(result.err).toContain(`${reserve} está no caminho`);
  expect(existsSync(join(dataDir(), "sobra"))).toBe(true);
  expect(readFileSync(reserve, "utf8")).toBe("no caminho");
  expect(readdirSync(join(home, ".local/share")).sort()).toEqual(
    [BRAND.name, `.${BRAND.name}-old`].sort(),
  );
});

test("um arquivo da pessoa no nome da cópia nova não é tocado", () => {
  const spare = join(home, ".local/share", `.${BRAND.name}-new`);
  mkdirSync(dirname(spare), { recursive: true });
  writeFileSync(spare, "da pessoa");
  const result = install();
  expect(result.code).not.toBe(0);
  expect(result.err).toContain(`${spare} está no caminho`);
  expect(readFileSync(spare, "utf8")).toBe("da pessoa");
  expect(existsSync(dataDir())).toBe(false);
});

test("se outra instalação cria a cópia nova logo depois da conferência, ela não é apagada", () => {
  // A pasta da cópia nova nasce entre a conferência e o mkdir que a cria.
  const spare = join(home, ".local/share", `.${BRAND.name}-new`);
  const real = which("mkdir");
  const mkdir = `case "$1" in */.${BRAND.name}-new) ${real} -p "$1/de-outra" ;; esac\nexec ${real} "$@"`;
  const result = install({ tools: TOOLS.filter((tool) => tool !== "mkdir"), fake: { mkdir } });
  expect(result.code).not.toBe(0);
  expect(result.err).toContain(spare);
  expect(existsSync(join(spare, "de-outra"))).toBe(true);
  expect(existsSync(dataDir())).toBe(false);
});

test("com uma falha ao pôr a primeira cópia no lugar, não deixa nada e diz qual caminho", () => {
  const mv = `case "$1" in */.${BRAND.name}-new) exit 1 ;; esac\nexec ${which("mv")} "$@"`;
  const result = install({ tools: TOOLS.filter((tool) => tool !== "mv"), fake: { mv } });
  expect(result.code).not.toBe(0);
  expect(result.err).toContain(dataDir());
  expect(readdirSync(join(home, ".local/share"))).toEqual([]);
  expect(existsSync(command())).toBe(false);
});

test("se a pasta do comando não pode ser gravada, não instala a cópia e diz qual caminho", () => {
  const bin = join(home, ".local/bin");
  mkdirSync(join(home, ".local"), { recursive: true });
  writeFileSync(bin, "um arquivo");
  let result = install();
  expect(result.code).not.toBe(0);
  expect(result.err).toContain(bin);
  expect(existsSync(dataDir())).toBe(false);

  rmSync(bin);
  mkdirSync(bin, { mode: 0o555 });
  try {
    result = install();
    expect(result.code).not.toBe(0);
    expect(result.err).toContain(bin);
    expect(existsSync(dataDir())).toBe(false);
  } finally {
    chmodSync(bin, 0o755);
  }
});

test("um sinal no meio da troca devolve a cópia anterior", () => {
  install();
  writeFileSync(join(dataDir(), "sobra"), "");
  // Um mv que, depois de levar a cópia antiga para a reserva, manda TERM ao script.
  const mv = `${which("mv")} "$@" || exit 1\ncase "$2" in */.${BRAND.name}-old) kill -TERM $PPID ;; esac`;
  const result = install({ tools: TOOLS.filter((tool) => tool !== "mv"), fake: { mv } });
  expect(result.code).not.toBe(0);
  expect(existsSync(join(dataDir(), "sobra"))).toBe(true);
  expect(readdirSync(join(home, ".local/share"))).toEqual([BRAND.name]);
  expect(existsSync(command())).toBe(true);
});

test("com uma versão do Node que não dá para ler, para sem mudar nada", () => {
  const tools = TOOLS.filter((tool) => tool !== "node");
  for (const version of ["v24", "", "24.x.1"]) {
    const result = install({ tools, fake: { node: `echo "${version}"` } });
    expect(result.code).not.toBe(0);
    expect(result.err).toMatch(/24\.11/);
    expect(listHome()).toEqual([]);
  }
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
