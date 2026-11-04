import { accessSync, constants, lstatSync, readFileSync, statSync } from "node:fs";
import { dirname, join, sep } from "node:path";
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
  const changes = files.flatMap((file) => {
    const path = join(root, file.file);
    refuseLinks(root, file.file);
    const current = readOptional(path, file.file);
    const content = file.update(current?.content);
    if (content === undefined) return [];
    checkWritable(path, file.file);
    return [{ file, path, content, mode: current?.mode }];
  });
  for (const { file, path, content, mode } of changes)
    writeFileAtomic(path, content, file.file, mode);
  return changes.map(({ file }) => file);
}

// Um link no caminho levaria a gravação para fora do projeto, ou seria trocado por uma cópia do arquivo de fora.
function refuseLinks(root: string, file: string): void {
  const parts = file.split(sep);
  for (let end = 1; end <= parts.length; end++) {
    const shown = parts.slice(0, end).join(sep);
    let link = false;
    try {
      link = lstatSync(join(root, shown)).isSymbolicLink();
    } catch {
      return;
    }
    if (link) throw new FlowError("symlink", { file: shown });
  }
}

function readOptional(path: string, shown: string): { content: string; mode: number } | undefined {
  try {
    return { content: readFileSync(path, "utf8"), mode: statSync(path).mode & 0o7777 };
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
