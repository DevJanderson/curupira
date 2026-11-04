import { execFileSync } from "node:child_process";
import { FlowError } from "./errors.ts";

// Quem decide é o nome de autor do Git; o e-mail não é lido nem gravado (spec da F01a, dados pessoais).
export function gitAuthor(root: string, env: NodeJS.ProcessEnv = process.env): string {
  const name = git(["config", "user.name"], root, env)?.trim();
  if (!name) throw new FlowError("no-git-author");
  return name;
}

export function projectRoot(cwd: string, env: NodeJS.ProcessEnv = process.env): string {
  const root = git(["rev-parse", "--show-toplevel"], cwd, env)?.trim();
  if (!root) throw new FlowError("not-a-git-repo");
  return root;
}

// Devolve a saída sem a quebra de linha do fim, ou nada se o Git terminar com erro. O limite da saída é largo, para
// um `git status` grande não virar falha do Git.
export function git(args: string[], cwd: string, env: NodeJS.ProcessEnv): string | undefined {
  try {
    return execFileSync("git", args, {
      cwd,
      env,
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    }).trimEnd();
  } catch {
    return undefined;
  }
}
