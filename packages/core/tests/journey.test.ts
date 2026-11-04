import { describe, expect, test } from "vite-plus/test";
import {
  advance,
  approve,
  FEATURE_PHASES,
  FlowError,
  hasApproval,
  isFeatureId,
  open,
  reject,
  type FeatureState,
} from "../src/index.ts";

const AT = "2026-11-03T20:00:00.000Z";

function at(phase: FeatureState["phase"]): FeatureState {
  return { id: "F01a", phase, decisions: [] };
}

function errorCode(run: () => unknown): string | undefined {
  try {
    run();
  } catch (error) {
    if (error instanceof FlowError) return error.code;
    throw error;
  }
  return undefined;
}

describe("o formato do ID", () => {
  test("aceita F, número de dois ou mais dígitos e sufixo opcional", () => {
    for (const id of ["F01", "F01a", "F19", "F100b"]) expect(isFeatureId(id)).toBe(true);
  });

  test("recusa o resto", () => {
    for (const id of ["F1", "f01", "F01A", "F01ab", "01a", "F01-a", ""])
      expect(isFeatureId(id)).toBe(false);
  });
});

test("só as fases 4, 7 e 8 têm aprovação", () => {
  expect(FEATURE_PHASES.filter((phase) => hasApproval(phase))).toEqual([4, 7, 8]);
});

test("abrir cria a funcionalidade na fase 3, sem decisões", () => {
  expect(open("F02")).toEqual({ id: "F02", phase: 3, decisions: [] });
  expect(errorCode(() => open("F2"))).toBe("invalid-id");
});

describe("avançar", () => {
  test("leva à fase seguinte nas fases sem aprovação", () => {
    expect(advance(at(3)).phase).toBe(4);
    expect(advance(at(5)).phase).toBe(6);
    expect(advance(at(6)).phase).toBe(7);
  });

  test("é recusado nas fases com aprovação e depois da entrega", () => {
    for (const phase of [4, 7, 8] as const)
      expect(errorCode(() => advance(at(phase)))).toBe("needs-decision");
    expect(errorCode(() => advance(at("delivered")))).toBe("delivered");
  });
});

describe("aprovar", () => {
  test("registra a fase, quem e quando, e leva à fase seguinte", () => {
    const state = approve(at(4), "Ana", AT);
    expect(state.phase).toBe(5);
    expect(state.decisions).toEqual([{ phase: 4, decision: "approve", by: "Ana", at: AT }]);
    expect(approve(at(7), "Ana", AT).phase).toBe(8);
    expect(approve(at(8), "Ana", AT).phase).toBe("delivered");
  });

  test("põe a decisão nova no fim, sem mudar as anteriores", () => {
    const first = approve(at(4), "Ana", AT);
    const later = approve({ ...first, phase: 7 }, "Bia", AT);
    expect(later.decisions[0]).toEqual(first.decisions[0]);
    expect(later.decisions).toHaveLength(2);
    expect(first.decisions).toHaveLength(1);
  });

  test("é recusado fora das fases com aprovação", () => {
    for (const phase of [3, 5, 6] as const)
      expect(errorCode(() => approve(at(phase), "Ana", AT))).toBe("no-approval");
    expect(errorCode(() => approve(at("delivered"), "Ana", AT))).toBe("delivered");
  });
});

describe("recusar", () => {
  test("volta à fase que a tabela das aprovações define", () => {
    expect(reject(at(4), "Ana", AT, "falta um cenário").phase).toBe(3);
    expect(reject(at(7), "Ana", AT, "falta tratar o erro").phase).toBe(5);
    expect(reject(at(7), "Ana", AT, "a spec mudou", { spec: true }).phase).toBe(3);
    expect(reject(at(8), "Ana", AT, "sem merge").phase).toBe(8);
  });

  test("registra a fase, quem, quando e o motivo", () => {
    expect(reject(at(4), "Ana", AT, "falta um cenário").decisions).toEqual([
      { phase: 4, decision: "reject", by: "Ana", at: AT, reason: "falta um cenário" },
    ]);
  });

  test("exige motivo, e o --spec só vale na fase 7", () => {
    expect(errorCode(() => reject(at(4), "Ana", AT, "  "))).toBe("missing-reason");
    expect(errorCode(() => reject(at(4), "Ana", AT, "x", { spec: true }))).toBe(
      "spec-only-in-phase-7",
    );
  });

  test("é recusado fora das fases com aprovação", () => {
    expect(errorCode(() => reject(at(5), "Ana", AT, "x"))).toBe("no-approval");
  });
});
