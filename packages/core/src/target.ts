import { createHash } from "node:crypto";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";
import { DATA_DIR } from "./brand.ts";
import { FlowError } from "./errors.ts";
import { isMissing } from "./files.ts";
import { git } from "./git-author.ts";
import type { Phase, Request } from "./journey.ts";

// O que se aprova em cada fase (ADR-0031, regra 6): o spec.md na fase 4, com o caminho (ADR-0023, regra 2), e o
// commit da branch na 7 e na 8, porque a pessoa lê o PR.
export type ApprovalTarget = Pick<Request, "hash" | "path">;

export const SPECS_DIR = join("docs", "specs");

export function approvalTarget(
  root: string,
  id: string,
  phase: Phase,
  env: NodeJS.ProcessEnv,
): ApprovalTarget {
  if (phase === 4) {
    const path = specPath(root, id);
    return { path, hash: fileHash(root, path) };
  }
  return { hash: cleanCommit(root, env) };
}

// O que se aprova não mudou desde o pedido (ADR-0031, regra 8): a mesma spec, no mesmo caminho e com o mesmo
// conteúdo, ou o mesmo commit, sem mudança fora da pasta de dados. Se mudou, a resposta foi para outra coisa, e é
// preciso um pedido novo.
export function checkUnchanged(
  root: string,
  id: string,
  request: Request,
  env: NodeJS.ProcessEnv,
): void {
  if (request.phase === 4) {
    const path = request.path!;
    if (currentSpec(root, id) !== path || specHash(root, path) !== request.hash)
      throw new FlowError("changed-spec", { id, file: path });
    return;
  }
  let head: string;
  try {
    head = cleanCommit(root, env);
  } catch (error) {
    if (error instanceof FlowError && error.code === "uncommitted-changes")
      throw new FlowError("changed-uncommitted", { id, file: error.params.file! });
    throw error;
  }
  if (head !== request.hash) throw new FlowError("changed-commit", { id, hash: head });
}

// Uma spec que sumiu, deixou de ser arquivo comum ou ganhou uma segunda pasta conta como mudada.
function currentSpec(root: string, id: string): string | undefined {
  return unlessChanged(() => specPath(root, id));
}

function specHash(root: string, path: string): string | undefined {
  return unlessChanged(() => fileHash(root, path));
}

function unlessChanged(read: () => string): string | undefined {
  try {
    return read();
  } catch (error) {
    if (error instanceof FlowError && error.code !== "unreadable-file") return undefined;
    throw error;
  }
}

// A pasta da spec é docs/specs/<ID>-<nome>/: o hífen separa a F01 da F01a. Um arquivo solto não conta; uma pasta que
// é link conta, para ser recusada adiante.
function specPath(root: string, id: string): string {
  let names: string[] = [];
  try {
    names = readdirSync(join(root, SPECS_DIR), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
      .map((entry) => entry.name);
  } catch (error) {
    if (!isMissing(error)) throw new FlowError("unreadable-file", { file: SPECS_DIR });
  }
  const dirs = names.filter((name) => name.startsWith(`${id}-`)).sort();
  if (dirs.length === 0) throw new FlowError("no-spec-dir", { id, dir: SPECS_DIR });
  if (dirs.length > 1) {
    throw new FlowError("spec-ambiguous", {
      id,
      dirs: dirs.map((dir) => join(SPECS_DIR, dir)).join(", "),
    });
  }
  return join(SPECS_DIR, dirs[0]!, "spec.md");
}

// Só um arquivo comum, sem link em nenhuma parte do caminho, vale: um link levaria o hash para fora do projeto.
export function fileHash(root: string, path: string): string {
  let content: Buffer;
  try {
    const parts = path.split(sep);
    for (let end = 1; end <= parts.length; end++) {
      const shown = parts.slice(0, end).join(sep);
      const stats = lstatSync(join(root, shown));
      if (stats.isSymbolicLink() || (end === parts.length && !stats.isFile()))
        throw new FlowError("spec-not-file", { file: shown });
    }
    content = readFileSync(join(root, path));
  } catch (error) {
    if (error instanceof FlowError) throw error;
    if (isMissing(error)) throw new FlowError("spec-not-found", { file: path });
    throw new FlowError("unreadable-file", { file: path });
  }
  return createHash("sha256").update(content).digest("hex");
}

// O HEAD, desde que nada fora da pasta de dados esteja sem commit: o próprio pedido grava ali.
export function cleanCommit(root: string, env: NodeJS.ProcessEnv): string {
  const head = git(["rev-parse", "--verify", "--quiet", "HEAD"], root, env);
  if (!head) throw new FlowError("no-commit");
  const status = git(
    ["status", "--porcelain", "--untracked-files=all", "--", ".", `:(exclude)${DATA_DIR}`],
    root,
    env,
  );
  if (status === undefined) throw new FlowError("no-commit");
  const first = status.split("\n").find((line) => line !== "");
  if (first) throw new FlowError("uncommitted-changes", { file: first.slice(3) });
  return head;
}
