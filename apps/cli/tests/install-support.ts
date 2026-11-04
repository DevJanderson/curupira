import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { BRAND } from "@curupira/core";

// O que os testes do script de instalação e os cenários da F00 têm em comum: uma origem local, uma pasta
// pessoal e um PATH descartáveis. O PATH só tem links para as ferramentas que o script usa, sem npm, npx nem
// pnpm (ADR-0009).
const ROOT = resolve(import.meta.dirname, "../../..");
export const SCRIPT = join(ROOT, "install.sh");
export const TOOLS = ["node", "git", "env", "sh", "mkdir", "rm", "mv", "ln", "readlink"];

// A origem é um repositório Git local com os arquivos desta cópia de trabalho, para o teste valer antes do commit.
export function makeOrigin(): string {
  const origin = realpathSync(mkdtempSync(join(tmpdir(), "install-origin-")));
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
  const config = join(origin, "..", `${origin.split("/").pop()}.gitconfig`);
  writeFileSync(config, "");
  const env = { ...process.env, GIT_CONFIG_GLOBAL: config, GIT_CONFIG_NOSYSTEM: "1" };
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: origin, env, stdio: "ignore" });
  git("init", "-q", "-b", "main");
  git("add", "-A");
  git("-c", "user.name=Teste", "-c", "user.email=teste@example.com", "commit", "-qm", "origem");
  return origin;
}

// Uma pasta com links só para as ferramentas pedidas; `fake` troca uma delas por um script.
export function toolsDir(base: string, tools: string[], fake: Record<string, string> = {}): string {
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

export function which(tool: string): string {
  return execFileSync("sh", ["-c", `command -v ${tool}`], { encoding: "utf8" }).trim();
}

export interface InstallOptions {
  tools?: string[];
  fake?: Record<string, string>;
  repo?: string;
  env?: Record<string, string>;
  onPath?: boolean;
}

// Roda o script; `tools` volta junto, para os comandos seguintes usarem o mesmo PATH.
export function runInstall(
  base: string,
  home: string,
  origin: string,
  options: InstallOptions = {},
) {
  const tools = toolsDir(base, options.tools ?? TOOLS, options.fake);
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
