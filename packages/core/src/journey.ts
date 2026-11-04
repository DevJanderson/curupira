import { FlowError } from "./errors.ts";

// As fases de cada funcionalidade na jornada (docs/conceitos/jornada.md); as 1 e 2 são do projeto.
export const FEATURE_PHASES = [3, 4, 5, 6, 7, 8] as const;
export type Phase = (typeof FEATURE_PHASES)[number];
// Depois do "sim" da fase 8, a funcionalidade está entregue e sai da jornada.
export type Stage = Phase | "delivered";

export interface Decision {
  phase: Phase;
  decision: "approve" | "reject";
  by: string;
  at: string;
  reason?: string;
}

export interface FeatureState {
  id: string;
  phase: Stage;
  decisions: Decision[];
}

const APPROVAL_PHASES: ReadonlySet<Phase> = new Set([4, 7, 8]);
// F, número de dois ou mais dígitos e um sufixo opcional em minúscula: F02, F01a.
const FEATURE_ID = /^F\d{2,}[a-z]?$/;

export function isFeatureId(id: string): boolean {
  return FEATURE_ID.test(id);
}

export function hasApproval(phase: Phase): boolean {
  return APPROVAL_PHASES.has(phase);
}

export function open(id: string): FeatureState {
  if (!isFeatureId(id)) throw new FlowError("invalid-id", { id });
  return { id, phase: 3, decisions: [] };
}

export function advance(state: FeatureState): FeatureState {
  const phase = activePhase(state);
  if (hasApproval(phase)) throw new FlowError("needs-decision", { id: state.id, phase });
  return { ...state, phase: (phase + 1) as Phase };
}

export function approve(state: FeatureState, by: string, at: string): FeatureState {
  const phase = approvalPhase(state);
  const next: Stage = phase === 8 ? "delivered" : ((phase + 1) as Phase);
  return {
    ...state,
    phase: next,
    decisions: [...state.decisions, { phase, decision: "approve", by, at }],
  };
}

// A fase de volta de cada recusa segue a tabela das aprovações (docs/conceitos/humano-e-agente.md).
export function reject(
  state: FeatureState,
  by: string,
  at: string,
  reason: string,
  options: { spec?: boolean } = {},
): FeatureState {
  const phase = approvalPhase(state);
  const trimmed = reason.trim();
  if (trimmed === "") throw new FlowError("missing-reason", { id: state.id });
  if (options.spec && phase !== 7)
    throw new FlowError("spec-only-in-phase-7", { id: state.id, phase });
  const back: Phase = phase === 4 ? 3 : phase === 7 ? (options.spec ? 3 : 5) : 8;
  return {
    ...state,
    phase: back,
    decisions: [...state.decisions, { phase, decision: "reject", by, at, reason: trimmed }],
  };
}

function activePhase(state: FeatureState): Phase {
  if (state.phase === "delivered") throw new FlowError("delivered", { id: state.id });
  return state.phase;
}

function approvalPhase(state: FeatureState): Phase {
  const phase = activePhase(state);
  if (!hasApproval(phase)) throw new FlowError("no-approval", { id: state.id, phase });
  return phase;
}
