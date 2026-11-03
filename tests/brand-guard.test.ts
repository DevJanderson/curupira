import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { expect, test } from "vite-plus/test";

// O nome do produto só pode estar escrito na constante única (ADR-0008).
const ROOT = resolve(import.meta.dirname, "..");
const SCANNED_DIRS = ["apps", "packages"];
const SKIPPED_DIRS = new Set(["node_modules", "dist"]);
const EXTENSIONS = /\.(ts|tsx|vue|js|mjs)$/;
const BRAND_FILE = "packages/core/src/brand.ts";
// Especificadores do workspace (@curupira/...) mudam pelo comando de renomear do ADR-0008, não à mão.
const WORKSPACE_SPECIFIER = /@curupira\//gi;
const NAME = /curupira/i;

function listSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) files.push(...listSourceFiles(path));
    } else if (entry.isFile() && EXTENSIONS.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
}

test("o nome só aparece na constante do core", () => {
  const hits: string[] = [];
  for (const dir of SCANNED_DIRS) {
    for (const file of listSourceFiles(join(ROOT, dir))) {
      const rel = relative(ROOT, file).replaceAll("\\", "/");
      if (rel === BRAND_FILE) continue;
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          if (NAME.test(line.replace(WORKSPACE_SPECIFIER, ""))) {
            hits.push(`${rel}:${index + 1}: ${line.trim()}`);
          }
        });
    }
  }
  expect(hits, `nome escrito fora de ${BRAND_FILE}:\n${hits.join("\n")}`).toEqual([]);
});
