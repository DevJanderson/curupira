import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { DATA_DIR } from "./brand.ts";
import { FlowError } from "./errors.ts";
import { FEATURE_PHASES, hasApproval, type FeatureState } from "./journey.ts";

// Um arquivo por funcionalidade, para duas branches não escreverem no mesmo arquivo (ADR-0023, ADR-0026).
const STATE_DIR = join(DATA_DIR, "state");

export function stateFile(root: string, id: string): string {
  return join(root, STATE_DIR, `${id}.json`);
}

export function readState(root: string, id: string): FeatureState | undefined {
  const file = stateFile(root, id);
  if (!existsSync(file)) return undefined;
  return parse(readFileSync(file, "utf8"), id);
}

export function readAllStates(root: string): FeatureState[] {
  const dir = join(root, STATE_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json") && !name.startsWith("."))
    .sort()
    .map((name) => parse(readFileSync(join(dir, name), "utf8"), name.slice(0, -".json".length)));
}

// Grava num temporário e troca o nome, para um arquivo de estado nunca ficar pela metade.
export function writeState(root: string, state: FeatureState): void {
  const file = stateFile(root, state.id);
  mkdirSync(join(root, STATE_DIR), { recursive: true });
  const temporary = join(root, STATE_DIR, `.${state.id}.json.${process.pid}.tmp`);
  writeFileSync(temporary, JSON.stringify(state, null, 2) + "\n");
  renameSync(temporary, file);
}

function parse(content: string, id: string): FeatureState {
  const invalid = (problem: string) =>
    new FlowError("invalid-state", { file: join(STATE_DIR, `${id}.json`), problem });
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    throw invalid("json");
  }
  if (!isRecord(data) || data.id !== id) throw invalid("id");
  if (data.phase !== "delivered" && !FEATURE_PHASES.includes(data.phase as never))
    throw invalid("phase");
  if (!Array.isArray(data.decisions) || !data.decisions.every(isDecision))
    throw invalid("decisions");
  return data as unknown as FeatureState;
}

function isDecision(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const { phase, decision, by, at, reason } = value;
  return (
    FEATURE_PHASES.includes(phase as never) &&
    hasApproval(phase as never) &&
    (decision === "approve" || (decision === "reject" && typeof reason === "string")) &&
    typeof by === "string" &&
    typeof at === "string" &&
    (reason === undefined || typeof reason === "string")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
