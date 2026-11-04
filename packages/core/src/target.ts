import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DATA_DIR } from "./brand.ts";
import { FlowError } from "./errors.ts";
import { isMissing } from "./files.ts";
import type { Phase, Request } from "./journey.ts";

// O que se aprova em cada fase (ADR-0031, regra 6): o spec.md na fase 4, com o caminho (ADR-0023, regra 2), e o
// commit da branch na 7 e na 8, porque a pessoa lê o PR.
export interface ApprovalTarget {
  hash: string;
  path?: string;
}

const SPECS_DIR = join("docs", "specs");

export function approvalTarget(root: string, id: string, phase: Phase): ApprovalTarget {
  if (phase === 4) {
    const path = specPath(root, id);
    return { path, hash: fileHash(root, path) };
  }
  return { hash: cleanCommit(root) };
}

// O que se aprova não mudou desde o pedido (ADR-0031, regra 8): o mesmo spec.md, no mesmo caminho, ou o mesmo
// commit, sem mudança fora da pasta de dados. Se mudou, a resposta foi para outra coisa, e é preciso um pedido novo.
export function checkUnchanged(root: string, id: string, request: Request): void {
  if (request.path !== undefined) {
    if (specHash(root, request.path) !== request.hash)
      throw new FlowError("changed-spec", { id, file: request.path });
    return;
  }
  let head: string;
  try {
    head = cleanCommit(root);
  } catch (error) {
    if (error instanceof FlowError && error.code === "uncommitted-changes")
      throw new FlowError("changed-commit", { id, file: error.params.file! });
    throw error;
  }
  if (head !== request.hash) throw new FlowError("changed-commit", { id, file: head.slice(0, 12) });
}

// Um spec.md que sumiu ou deixou de ser arquivo comum conta como mudado.
function specHash(root: string, path: string): string | undefined {
  try {
    return fileHash(root, path);
  } catch (error) {
    if (error instanceof FlowError && error.code !== "unreadable-file") return undefined;
    throw error;
  }
}

// A pasta da spec é docs/specs/<ID>-<nome>/: o hífen separa a F01 da F01a.
function specPath(root: string, id: string): string {
  let names: string[] = [];
  try {
    names = readdirSync(join(root, SPECS_DIR));
  } catch (error) {
    if (!isMissing(error)) throw new FlowError("unreadable-file", { file: SPECS_DIR });
  }
  const dirs = names.filter((name) => name.startsWith(`${id}-`)).sort();
  if (dirs.length > 1) {
    throw new FlowError("spec-ambiguous", {
      id,
      dirs: dirs.map((dir) => join(SPECS_DIR, dir)).join(", "),
    });
  }
  return join(SPECS_DIR, dirs[0] ?? `${id}-<nome>`, "spec.md");
}

// Só um arquivo comum vale: um link levaria o hash para fora do projeto.
export function fileHash(root: string, path: string): string {
  let content: Buffer;
  try {
    const stats = lstatSync(join(root, path));
    if (!stats.isFile()) throw new FlowError("spec-not-file", { file: path });
    content = readFileSync(join(root, path));
  } catch (error) {
    if (error instanceof FlowError) throw error;
    if (isMissing(error)) throw new FlowError("spec-not-found", { file: path });
    throw new FlowError("unreadable-file", { file: path });
  }
  return createHash("sha256").update(content).digest("hex");
}

// O HEAD, desde que nada fora da pasta de dados esteja sem commit: o próprio pedido grava ali.
export function cleanCommit(root: string): string {
  const head = git(root, ["rev-parse", "--verify", "--quiet", "HEAD"]);
  if (!head) throw new FlowError("no-commit");
  const status = git(root, [
    "status",
    "--porcelain",
    "--untracked-files=all",
    "--",
    ".",
    `:(exclude)${DATA_DIR}`,
  ]);
  if (status === undefined) throw new FlowError("no-commit");
  const first = status.split("\n").find((line) => line !== "");
  if (first) throw new FlowError("uncommitted-changes", { file: first.slice(3) });
  return head;
}

function git(root: string, args: string[]): string | undefined {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trimEnd();
  } catch {
    return undefined;
  }
}
