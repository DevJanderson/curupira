import { accessSync, constants, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { DATA_DIR } from "./brand.ts";
import { FlowError } from "./errors.ts";
import { isMissing, writeFileAtomic } from "./files.ts";

// Um arquivo do projeto que o `init` prepara (spec da F00). O núcleo lê e grava; quem sabe o formato
// é `update`, que devolve o conteúdo novo, ou nada se o arquivo já está pronto. O do agente vem do adaptador (ADR-0021).
export interface ProjectFile {
  file: string; // relativo à raiz do projeto
  change: "hook" | "ignore";
  update: (current: string | undefined) => string | undefined;
}

// A pasta local fica fora do Git (ADR-0023).
export const LOCAL_LINE = `${DATA_DIR}/local/`;

export const ignoreLocalData: ProjectFile = {
  file: ".gitignore",
  change: "ignore",
  update: (current) => {
    const text = current ?? "";
    // Conta só a linha idêntica; espaços no fim não contam, como no Git.
    if (text.split("\n").some((line) => line.trimEnd() === LOCAL_LINE)) return undefined;
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    const separator = text === "" || text.endsWith("\n") ? "" : eol;
    return `${text}${separator}${LOCAL_LINE}${eol}`;
  },
};

// Lê e confere todos antes de gravar o primeiro, na ordem da lista, para uma recusa não deixar nada pela
// metade (R8). Devolve os arquivos que mudaram.
export function prepareProject(root: string, files: ProjectFile[]): ProjectFile[] {
  const changes = files.flatMap((project) => {
    const path = join(root, project.file);
    const content = project.update(readOptional(path, project.file));
    if (content === undefined) return [];
    checkWritable(path, project.file);
    return [{ project, path, content }];
  });
  for (const { project, path, content } of changes) writeFileAtomic(path, content, project.file);
  return changes.map(({ project }) => project);
}

function readOptional(path: string, shown: string): string | undefined {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    if (isMissing(error)) return undefined;
    throw new FlowError("unreadable-file", { file: shown });
  }
}

// O arquivo, se existe, e a pasta mais próxima que existe precisam aceitar escrita.
function checkWritable(path: string, shown: string): void {
  let target = path;
  try {
    while (!exists(target)) target = dirname(target);
    accessSync(target, constants.W_OK);
    if (target === path) accessSync(dirname(path), constants.W_OK);
  } catch {
    throw new FlowError("unwritable-file", { file: shown });
  }
}

function exists(path: string): boolean {
  try {
    statSync(path);
    return true;
  } catch (error) {
    if (isMissing(error)) return false;
    throw error;
  }
}
