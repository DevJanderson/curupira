import { execFileSync } from "node:child_process";
import { FlowError } from "./errors.ts";

// Quem decide é o nome de autor do Git; o e-mail não é lido nem gravado (spec da F01a, dados pessoais).
export function gitAuthor(root: string, env: NodeJS.ProcessEnv = process.env): string {
  const name = git(["config", "user.name"], root, env);
  if (!name) throw new FlowError("no-git-author");
  return name;
}

export function projectRoot(cwd: string, env: NodeJS.ProcessEnv = process.env): string {
  const root = git(["rev-parse", "--show-toplevel"], cwd, env);
  if (!root) throw new FlowError("not-a-git-repo");
  return root;
}

// Devolve a saída sem espaços nas pontas, ou vazio se o Git terminar com erro.
function git(args: string[], cwd: string, env: NodeJS.ProcessEnv): string {
  try {
    return execFileSync("git", args, {
      cwd,
      env,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}
