import { FlowError } from "./errors.ts";

// As fases de cada funcionalidade na jornada (docs/decisoes/0031-a-linha.md); as 1 e 2 são do projeto.
export const FEATURE_PHASES = [3, 4, 5, 6, 7, 8] as const;
export type Phase = (typeof FEATURE_PHASES)[number];
// Depois do "sim" da fase 8, a funcionalidade está entregue e sai da jornada.
export type Stage = Phase | "delivered";

export interface Decision {
  phase: Phase;
  decision: "approve" | "reject";
  by: string;
  at: string;
  // O texto digitado que sustentou a aprovação (F01b); na recusa, ele é o motivo.
  answer?: string;
  reason?: string;
  // A hora e o hash do pedido que a decisão respondeu (F01c); as decisões de antes dela não os têm.
  requestedAt?: string;
  hash?: string;
  path?: string;
}

// O pedido de aprovação (ADR-0031, regra 6): a hora e o hash do que se aprova e, na fase 4, o caminho do spec.md.
export interface Request {
  phase: Phase;
  at: string;
  hash: string;
  path?: string;
}

export interface FeatureState {
  id: string;
  phase: Stage;
  decisions: Decision[];
  // Um pedido aberto por vez: um novo substitui o anterior.
  request?: Request;
}

// O que passar do teto fica na conversa (ADR-0031, regra 7; ADR-0026).
const MAX_REASON = 280;
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

export function requestApproval(
  state: FeatureState,
  at: string,
  target: Pick<Request, "hash" | "path">,
): FeatureState {
  const phase = approvalPhase(state);
  return { ...state, request: { phase, at, ...target } };
}

export function advance(state: FeatureState): FeatureState {
  const phase = activePhase(state);
  if (hasApproval(phase)) throw new FlowError("needs-decision", { id: state.id, phase });
  return { ...state, phase: (phase + 1) as Phase };
}

export function approve(
  state: FeatureState,
  by: string,
  at: string,
  answer?: string,
): FeatureState {
  const request = currentRequest(state);
  const { phase } = request;
  const next: Stage = phase === 8 ? "delivered" : ((phase + 1) as Phase);
  const decision: Decision = { phase, decision: "approve", by, at };
  if (answer !== undefined) decision.answer = answer;
  return decided(state, next, { ...decision, ...answered(request) });
}

// A fase de volta de cada recusa segue a tabela das aprovações (docs/conceitos/humano-e-agente.md).
export function reject(
  state: FeatureState,
  by: string,
  at: string,
  reason: string,
  options: { spec?: boolean } = {},
): FeatureState {
  const request = currentRequest(state);
  const { phase } = request;
  const trimmed = reason.trim();
  if (trimmed === "") throw new FlowError("missing-reason", { id: state.id });
  if (options.spec && phase !== 7)
    throw new FlowError("spec-only-in-phase-7", { id: state.id, phase });
  const back: Phase = phase === 4 ? 3 : phase === 7 ? (options.spec ? 3 : 5) : 8;
  const decision: Decision = { phase, decision: "reject", by, at, reason: capped(trimmed) };
  return decided(state, back, { ...decision, ...answered(request) });
}

// Conta ponto de código, mas corta só entre grafemas: um emoji de vários pontos, como uma bandeira, e uma letra com
// acento à parte não se partem; se o último não couber inteiro, sai todo.
function capped(reason: string): string {
  if (codePoints(reason) <= MAX_REASON) return reason;
  let kept = "";
  let count = 0;
  for (const { segment } of new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
    reason,
  )) {
    count += codePoints(segment);
    if (count > MAX_REASON - 1) break;
    kept += segment;
  }
  return kept + "…";
}

function codePoints(text: string): number {
  let count = 0;
  for (const _ of text) count++;
  return count;
}

// O pedido da fase atual: sem ele, nada se decide (ADR-0031, regra 6).
export function currentRequest(state: FeatureState): Request {
  const phase = approvalPhase(state);
  if (state.request?.phase !== phase) throw new FlowError("no-request", { id: state.id, phase });
  return state.request;
}

function answered({ at, hash, path }: Request): Pick<Decision, "requestedAt" | "hash" | "path"> {
  return path === undefined ? { requestedAt: at, hash } : { requestedAt: at, hash, path };
}

// A decisão responde ao pedido, que sai do estado: um "sim" novo pede um pedido novo.
function decided(state: FeatureState, phase: Stage, decision: Decision): FeatureState {
  const { request: _answered, ...rest } = state;
  return { ...rest, phase, decisions: [...state.decisions, decision] };
}

function activePhase(state: FeatureState): Phase {
  if (state.phase === "delivered") throw new FlowError("delivered", { id: state.id });
  return state.phase;
}

// A fase com aprovação em que a funcionalidade está; recusa se não houver decisão a tomar.
export function approvalPhase(state: FeatureState): Phase {
  const phase = activePhase(state);
  if (!hasApproval(phase)) throw new FlowError("no-approval", { id: state.id, phase });
  return phase;
}
