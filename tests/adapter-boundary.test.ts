import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { expect, test } from "vite-plus/test";

// O núcleo não depende do adaptador de nenhum agente (ADR-0021). Só a entrada da CLI escolhe o adaptador.
const ROOT = resolve(import.meta.dirname, "..");
const CORE_DIRS = ["packages/core/src", "apps/cli/src"];
const ENTRY = "apps/cli/src/main.ts";
const ADAPTERS = /["']@curupira\/claude-code["']/;

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

test("só a entrada da CLI importa um adaptador", () => {
  const hits = CORE_DIRS.flatMap((dir) => listFiles(join(ROOT, dir)))
    .map((file) => relative(ROOT, file).replaceAll("\\", "/"))
    .filter((rel) => rel !== ENTRY && ADAPTERS.test(readFileSync(join(ROOT, rel), "utf8")));
  expect(hits).toEqual([]);
});
