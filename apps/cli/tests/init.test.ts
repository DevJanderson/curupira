import { execFileSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { agentSession, answerHook, readPromptHook } from "@curupira/claude-code";
import { BRAND, DATA_DIR } from "@curupira/core";
import { beforeEach, expect, test } from "vite-plus/test";
import { run } from "../src/run.ts";

// O `init` (passo 2 do plano da F00), num repositório Git descartável.
const COMMAND = `${BRAND.name} hook answer`;
const LINE = `${DATA_DIR}/local/`;
const SETTINGS = join(".claude", "settings.json");
let base: string;
let repo: string;
let env: NodeJS.ProcessEnv;

beforeEach(() => {
  base = realpathSync(mkdtempSync(join(tmpdir(), "init-")));
  const emptyConfig = join(base, "gitconfig");
  writeFileSync(emptyConfig, "");
  env = { ...process.env, GIT_CONFIG_GLOBAL: emptyConfig, GIT_CONFIG_NOSYSTEM: "1" };
  repo = join(base, "repo");
  mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo, env });
});

function init(cwd = repo, args = ["init"]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = run(args, {
    cwd,
    env,
    agent: { session: agentSession, readPrompt: readPromptHook, answerHook },
    stdin: () => "",
    now: () => "2026-11-04T12:00:00.000Z",
    out: (line) => out.push(line),
    err: (line) => err.push(line),
  });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

function read(file: string): string {
  return readFileSync(join(repo, file), "utf8");
}

function write(file: string, content: string): void {
  mkdirSync(join(repo, file, ".."), { recursive: true });
  writeFileSync(join(repo, file), content);
}

function settings() {
  return JSON.parse(read(SETTINGS));
}

function answerCommands(): string[] {
  return (settings().hooks.UserPromptSubmit as { hooks: { command: string }[] }[]).flatMap(
    (entry) => entry.hooks.map((hook) => hook.command),
  );
}

// Tudo o que há no repositório, fora do .git, com o conteúdo, para conferir que nada mudou.
function snapshot(): Record<string, string> {
  const files = readdirSync(repo, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name).slice(repo.length + 1))
    .filter((file) => !file.startsWith(".git" + "/") && file !== ".git");
  return Object.fromEntries(files.sort().map((file) => [file, read(file)]));
}

function ignored(path: string): boolean {
  try {
    execFileSync("git", ["check-ignore", "-q", path], { cwd: repo, env });
    return true;
  } catch {
    return false;
  }
}

test("cria o settings.json com o hook e o .gitignore com a pasta local, e diz o que mudou", () => {
  const result = init();
  expect(result.err).toBe("");
  expect(result.code).toBe(0);
  expect(settings()).toEqual({
    hooks: { UserPromptSubmit: [{ hooks: [{ type: "command", command: COMMAND }] }] },
  });
  expect(read(".gitignore")).toBe(`${LINE}\n`);
  expect(result.out).toContain(SETTINGS);
  expect(result.out).toContain(".gitignore");
  expect(ignored(`${DATA_DIR}/local/answers/x.json`)).toBe(true);
  expect(existsSync(join(repo, DATA_DIR))).toBe(false);
});

test("completa o settings.json mantendo outras chaves e outros hooks", () => {
  const other = { hooks: [{ type: "command", command: "echo oi" }] };
  write(
    SETTINGS,
    JSON.stringify({
      permissions: { allow: ["Bash(ls)"] },
      hooks: { UserPromptSubmit: [other], Stop: [other] },
    }),
  );
  expect(init().code).toBe(0);
  expect(settings().permissions).toEqual({ allow: ["Bash(ls)"] });
  expect(settings().hooks.Stop).toEqual([other]);
  expect(answerCommands()).toEqual(["echo oi", COMMAND]);
});

test("rodado numa subpasta, prepara a raiz do repositório", () => {
  mkdirSync(join(repo, "a/b"), { recursive: true });
  expect(init(join(repo, "a/b")).code).toBe(0);
  expect(answerCommands()).toEqual([COMMAND]);
  expect(read(".gitignore")).toBe(`${LINE}\n`);
  expect(existsSync(join(repo, "a/b/.claude"))).toBe(false);
});

test("com a entrada antiga do piloto, acrescenta a nova sem erro", () => {
  const pilot = `node "$CLAUDE_PROJECT_DIR/apps/cli/src/main.ts" hook answer`;
  write(
    SETTINGS,
    JSON.stringify({
      hooks: { UserPromptSubmit: [{ hooks: [{ type: "command", command: pilot }] }] },
    }),
  );
  expect(init().code).toBe(0);
  expect(answerCommands()).toEqual([pilot, COMMAND]);
});

test("completa o .gitignore mantendo o resto e o fim de linha", () => {
  write(".gitignore", "dist/\nnode_modules");
  expect(init().code).toBe(0);
  expect(read(".gitignore")).toBe(`dist/\nnode_modules\n${LINE}\n`);

  write(".gitignore", "dist/\r\n");
  write(SETTINGS, "{}");
  expect(init().code).toBe(0);
  expect(read(".gitignore")).toBe(`dist/\r\n${LINE}\r\n`);
});

test("conta como presente só a linha idêntica, sem contar espaços no fim", () => {
  for (const present of [LINE, `${LINE}  `]) {
    write(".gitignore", `dist/\n${present}\n`);
    init();
    expect(read(".gitignore")).toBe(`dist/\n${present}\n`);
  }
  for (const absent of [LINE.slice(0, -1), `/${LINE}`, `# ${LINE}`]) {
    write(".gitignore", `${absent}\n`);
    init();
    expect(read(".gitignore")).toBe(`${absent}\n${LINE}\n`);
  }
});

test("de novo, não muda nada e diz que já estava pronto", () => {
  write(".gitignore", "dist/\n");
  init();
  const before = snapshot();
  const result = init();
  expect(result.code).toBe(0);
  expect(result.out).toMatch(/já estava pronto/);
  expect(snapshot()).toEqual(before);
});

test("fora do Git, recusa sem mudar nada", () => {
  const outside = join(base, "fora");
  mkdirSync(outside);
  const result = init(outside);
  expect(result.code).toBe(1);
  expect(result.err).toMatch(/repositório Git/);
  expect(readdirSync(outside)).toEqual([]);
});

test("com o settings.json inválido, recusa sem mudar nenhum arquivo e diz qual e por quê", () => {
  write(".gitignore", "dist/\n");
  const cases: [string, RegExp][] = [
    ["{ não é json", /JSON válido/],
    ["[1, 2]", /objeto/],
    ['{"hooks": []}', /hooks/],
    ['{"hooks": {"UserPromptSubmit": {}}}', /hooks/],
  ];
  for (const [content, why] of cases) {
    write(SETTINGS, content);
    const before = snapshot();
    const result = init();
    expect(result.code).toBe(1);
    expect(result.err).toContain(SETTINGS);
    expect(result.err).toMatch(why);
    expect(snapshot()).toEqual(before);
  }
});

test("com o settings.json que é uma pasta ou o .claude que é um arquivo, recusa sem mudar nada", () => {
  mkdirSync(join(repo, SETTINGS), { recursive: true });
  let result = init();
  expect(result.code).toBe(1);
  expect(result.err).toContain(SETTINGS);
  expect(existsSync(join(repo, ".gitignore"))).toBe(false);

  execFileSync("rm", ["-r", join(repo, ".claude")]);
  writeFileSync(join(repo, ".claude"), "");
  result = init();
  expect(result.code).toBe(1);
  expect(result.err).toContain(SETTINGS);
  expect(existsSync(join(repo, ".gitignore"))).toBe(false);
});

test("com o .gitignore sem permissão, recusa sem mudar o settings.json", () => {
  write(".gitignore", "dist/\n");
  chmodSync(join(repo, ".gitignore"), 0o000);
  try {
    const result = init();
    expect(result.code).toBe(1);
    expect(result.err).toContain(".gitignore");
    expect(existsSync(join(repo, ".claude"))).toBe(false);
  } finally {
    chmodSync(join(repo, ".gitignore"), 0o644);
  }
});

test("com os dois arquivos com problema, o settings.json vence", () => {
  write(SETTINGS, "{");
  write(".gitignore", "dist/\n");
  chmodSync(join(repo, ".gitignore"), 0o000);
  try {
    const result = init();
    expect(result.code).toBe(1);
    expect(result.err).toContain(SETTINGS);
    expect(result.err).not.toContain(".gitignore");
  } finally {
    chmodSync(join(repo, ".gitignore"), 0o644);
  }
});

test("grava o settings.json com dois espaços e um fim de linha", () => {
  init();
  expect(read(SETTINGS)).toBe(
    JSON.stringify(
      { hooks: { UserPromptSubmit: [{ hooks: [{ type: "command", command: COMMAND }] }] } },
      null,
      2,
    ) + "\n",
  );
});

test("conta como ligado só o comando exato, mesmo numa entrada com outros hooks", () => {
  for (const near of [`${COMMAND} --x`, `echo ${COMMAND}`]) {
    write(
      SETTINGS,
      JSON.stringify({
        hooks: { UserPromptSubmit: [{ hooks: [{ type: "command", command: near }] }] },
      }),
    );
    init();
    expect(answerCommands()).toEqual([near, COMMAND]);
  }
  const shared = {
    hooks: {
      UserPromptSubmit: [
        {
          hooks: [
            { type: "command", command: "echo oi" },
            { type: "command", command: COMMAND },
          ],
        },
      ],
    },
  };
  write(SETTINGS, JSON.stringify(shared));
  const result = init();
  expect(result.out).toMatch(/já estava pronto|\.gitignore/);
  expect(settings()).toEqual(shared);
});

test("mantém o modo do arquivo que já existia", () => {
  write(SETTINGS, "{}");
  chmodSync(join(repo, SETTINGS), 0o600);
  write(".gitignore", "dist/\n");
  chmodSync(join(repo, ".gitignore"), 0o640);
  expect(init().code).toBe(0);
  expect(statSync(join(repo, SETTINGS)).mode & 0o777).toBe(0o600);
  expect(statSync(join(repo, ".gitignore")).mode & 0o777).toBe(0o640);
});

test("com o .gitignore ilegível, diz que não conseguiu ler", () => {
  write(".gitignore", "dist/\n");
  chmodSync(join(repo, ".gitignore"), 0o000);
  try {
    const result = init();
    expect(result.code).toBe(1);
    expect(result.err).toMatch(/ler .gitignore/);
  } finally {
    chmodSync(join(repo, ".gitignore"), 0o644);
  }
});

test("com a raiz sem escrita, recusa pelo .gitignore antes de gravar o settings.json", () => {
  write(SETTINGS, "{}");
  write(".gitignore", "dist/\n");
  chmodSync(repo, 0o555);
  try {
    const result = init();
    expect(result.code).toBe(1);
    expect(result.err).toContain(".gitignore");
    expect(read(SETTINGS)).toBe("{}");
  } finally {
    chmodSync(repo, 0o755);
  }
});

test("um link simbólico no caminho é recusado, sem gravar fora do projeto nem trocar o link", () => {
  const outside = join(base, "fora");
  mkdirSync(outside);
  writeFileSync(join(outside, "settings.json"), '{"a":1}');
  writeFileSync(join(outside, "ignore"), "dist/\n");

  symlinkSync(outside, join(repo, ".claude"));
  let result = init();
  expect(result.code).toBe(1);
  expect(result.err).toContain(".claude");
  expect(readFileSync(join(outside, "settings.json"), "utf8")).toBe('{"a":1}');
  rmSync(join(repo, ".claude"));

  mkdirSync(join(repo, ".claude"));
  symlinkSync(join(outside, "settings.json"), join(repo, SETTINGS));
  result = init();
  expect(result.code).toBe(1);
  expect(result.err).toContain(SETTINGS);
  expect(lstatSync(join(repo, SETTINGS)).isSymbolicLink()).toBe(true);
  expect(readFileSync(join(outside, "settings.json"), "utf8")).toBe('{"a":1}');
  rmSync(join(repo, SETTINGS));

  symlinkSync(join(outside, "ignore"), join(repo, ".gitignore"));
  result = init();
  expect(result.code).toBe(1);
  expect(result.err).toContain(".gitignore");
  expect(lstatSync(join(repo, ".gitignore")).isSymbolicLink()).toBe(true);
  expect(existsSync(join(repo, SETTINGS))).toBe(false);
});

test("init não aceita argumento nem opção", () => {
  for (const args of [
    ["init", "x"],
    ["init", "--spec"],
  ]) {
    const result = init(repo, args);
    expect(result.code).toBe(1);
    expect(result.err).toMatch(/^Uso:/);
  }
  expect(existsSync(join(repo, ".claude"))).toBe(false);
});
