import { run } from "./run.ts";

process.exitCode = run(process.argv.slice(2), {
  cwd: process.cwd(),
  env: process.env,
  now: () => new Date().toISOString(),
  out: (line) => console.log(line),
  err: (line) => console.error(line),
});
