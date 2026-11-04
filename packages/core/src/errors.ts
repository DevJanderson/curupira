// O núcleo não escreve texto para a pessoa: cada erro leva um código e os dados,
// e a CLI monta a mensagem no idioma do projeto (ADR-0027).
export type FlowErrorCode =
  | "invalid-id"
  | "not-found"
  | "already-open"
  | "needs-decision"
  | "no-approval"
  | "delivered"
  | "missing-reason"
  | "spec-only-in-phase-7"
  | "no-git-author"
  | "not-a-git-repo"
  | "invalid-state"
  | "unreadable-state"
  | "unwritable-state";

export class FlowError extends Error {
  readonly code: FlowErrorCode;
  readonly params: Readonly<Record<string, string | number>>;

  constructor(code: FlowErrorCode, params: Readonly<Record<string, string | number>> = {}) {
    super(code);
    this.name = "FlowError";
    this.code = code;
    this.params = params;
  }
}
