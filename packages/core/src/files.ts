import { chmodSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { FlowError } from "./errors.ts";

// Grava num temporário e troca o nome, para o arquivo nunca ficar pela metade.
// `shown` é o caminho relativo à raiz do projeto, que vai na mensagem de erro; `mode`, o do arquivo que já existia.
export function writeFileAtomic(file: string, content: string, shown: string, mode?: number): void {
  const temporary = join(dirname(file), `.${basename(file)}.${process.pid}.tmp`);
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(temporary, content);
    if (mode !== undefined) chmodSync(temporary, mode);
    renameSync(temporary, file);
  } catch {
    // O temporário guarda uma cópia do conteúdo; não pode sobrar na pasta. Se nem a pasta existir, não há o que apagar.
    try {
      rmSync(temporary, { force: true });
    } catch {}
    throw new FlowError("unwritable-file", { file: shown });
  }
}

export function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === "ENOENT";
}
