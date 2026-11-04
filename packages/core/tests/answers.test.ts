import { existsSync, mkdtempSync, readFileSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, test } from "vite-plus/test";
import {
  answerFile,
  approvalText,
  DATA_DIR,
  deleteAnswer,
  FlowError,
  purgeAnswers,
  readAnswer,
  recordAnswer,
  rejectionReason,
} from "../src/index.ts";

const AT = "2026-11-03T20:00:00.000Z";
const SESSION = "eab843e2-6fd7-4194-b36f-5d1fe4855838";
let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "answers-"));
});

function failure(run: () => unknown): FlowError {
  try {
    run();
  } catch (error) {
    if (error instanceof FlowError) return error;
    throw error;
  }
  throw new Error("esperava um FlowError");
}

describe("o registro da última mensagem", () => {
  test("guarda o texto quando a mensagem começa por sim ou não", () => {
    recordAnswer(root, SESSION, "sim", AT);
    expect(readAnswer(root, SESSION)).toEqual({ at: AT, text: "sim" });
    recordAnswer(root, SESSION, "Não, falta um cenário", AT);
    expect(readAnswer(root, SESSION)).toEqual({ at: AT, text: "Não, falta um cenário" });
  });

  test("guarda só a marca de outra mensagem, sem o texto", () => {
    recordAnswer(root, SESSION, "simples assim, siga em frente", AT);
    expect(readAnswer(root, SESSION)).toEqual({ at: AT });
    expect(readFileSync(answerFile(root, SESSION), "utf8")).not.toContain("siga");
  });

  test("a mensagem nova substitui a anterior da mesma sessão, sem tocar nas outras", () => {
    recordAnswer(root, SESSION, "sim", AT);
    recordAnswer(root, "outra", "não, ainda não", AT);
    recordAnswer(root, SESSION, "e mais uma coisa", AT);
    expect(readAnswer(root, SESSION)).toEqual({ at: AT });
    expect(readAnswer(root, "outra")).toEqual({ at: AT, text: "não, ainda não" });
  });

  test("fica na pasta local de dados, que se ignora no Git sozinha", () => {
    recordAnswer(root, SESSION, "sim", AT);
    expect(answerFile(root, SESSION)).toBe(
      join(root, DATA_DIR, "local", "answers", `${SESSION}.json`),
    );
    expect(readFileSync(join(root, DATA_DIR, "local", ".gitignore"), "utf8")).toBe("*\n");
  });

  test("apagar a resposta a tira do registro", () => {
    recordAnswer(root, SESSION, "sim", AT);
    deleteAnswer(root, SESSION);
    expect(readAnswer(root, SESSION)).toBeUndefined();
    expect(existsSync(answerFile(root, SESSION))).toBe(false);
  });

  test("uma resposta ilegível conta como ausente", () => {
    recordAnswer(root, SESSION, "sim", AT);
    writeFileSync(answerFile(root, SESSION), "{");
    expect(readAnswer(root, SESSION)).toBeUndefined();
  });

  test("recusa uma sessão que não serve de nome de arquivo", () => {
    for (const session of ["", "../x", ".oculta", "a/b"]) {
      expect(failure(() => recordAnswer(root, session, "sim", AT)).code).toBe("no-session");
      expect(failure(() => readAnswer(root, session)).code).toBe("no-session");
    }
  });

  test("uma resposta de mais de 30 dias não vale, mesmo antes da limpeza", () => {
    recordAnswer(root, SESSION, "sim", "2026-09-01T00:00:00.000Z");
    expect(readAnswer(root, SESSION, new Date("2026-11-03T00:00:00.000Z"))).toBeUndefined();
    expect(readAnswer(root, SESSION, new Date("2026-09-20T00:00:00.000Z"))).toEqual({
      at: "2026-09-01T00:00:00.000Z",
      text: "sim",
    });
  });

  test("a limpeza usa a data da resposta", () => {
    recordAnswer(root, "velha", "sim", "2026-09-01T00:00:00.000Z");
    purgeAnswers(root, new Date("2026-11-03T00:00:00.000Z"));
    expect(existsSync(answerFile(root, "velha"))).toBe(false);
  });

  test("apaga as respostas guardadas há mais de 30 dias, e as sem data pela data do arquivo", () => {
    const now = new Date("2026-12-10T00:00:00.000Z");
    const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    recordAnswer(root, "velha", "sim", daysAgo(31).toISOString());
    recordAnswer(root, "nova", "sim", daysAgo(1).toISOString());
    recordAnswer(root, "sem-data", "sim", AT);
    writeFileSync(answerFile(root, "sem-data"), "{");
    utimesSync(answerFile(root, "sem-data"), daysAgo(31), daysAgo(31));
    purgeAnswers(root, now);
    expect(existsSync(answerFile(root, "velha"))).toBe(false);
    expect(existsSync(answerFile(root, "sem-data"))).toBe(false);
    expect(readAnswer(root, "nova")).toEqual({ at: daysAgo(1).toISOString(), text: "sim" });
  });

  test("uma resposta com data inválida ou no futuro não vale, e a limpeza usa a data do arquivo", () => {
    const now = new Date(AT);
    recordAnswer(root, SESSION, "sim", "ontem");
    expect(readAnswer(root, SESSION, now)).toBeUndefined();
    recordAnswer(root, SESSION, "sim", "2027-01-01T00:00:00.000Z");
    expect(readAnswer(root, SESSION, now)).toBeUndefined();
    const old = new Date("2026-09-01T00:00:00.000Z");
    utimesSync(answerFile(root, SESSION), old, old);
    purgeAnswers(root, now);
    expect(existsSync(answerFile(root, SESSION))).toBe(false);
  });

  test("guarda o texto na forma composta, para um não com acento separado contar", () => {
    recordAnswer(root, SESSION, "na\u0303o, falta um cenário", AT);
    expect(readAnswer(root, SESSION)).toEqual({ at: AT, text: "não, falta um cenário" });
  });
});

describe("o sim que aprova", () => {
  test("vale sim puro ou sim com o ID, sem contar maiúsculas, espaços nas pontas e um ponto final", () => {
    for (const text of ["sim", "Sim", "SIM.", "  sim  ", "sim F01a", "Sim f01a."]) {
      expect(approvalText({ at: AT, text }, "F01a")).toBe(text);
    }
  });

  test("um sim com outra frase, outra pontuação ou outro ID colado pede o sim sozinho", () => {
    const texts = [
      "sim, e mais uma coisa",
      "sim?",
      "sim!",
      "sim..",
      "sim:",
      "sim, F01a",
      "sim.F01a",
    ];
    for (const text of [...texts, "sim:F02", "sim\nF01a", "sim/abc", "sim  F01a"]) {
      expect(failure(() => approvalText({ at: AT, text }, "F01a")).code).toBe("plain-yes-only");
    }
  });

  test("sem resposta, com outra mensagem, com um não ou com o ID de outra, pede o sim", () => {
    for (const answer of [
      undefined,
      { at: AT },
      { at: AT, text: "não, falta" },
      { at: AT, text: "sim F02" },
    ]) {
      expect(failure(() => approvalText(answer, "F01a")).code).toBe("approve-needs-answer");
    }
  });
});

describe("o não que recusa", () => {
  test("tira o ID da funcionalidade do começo do motivo", () => {
    expect(rejectionReason({ at: AT, text: "não F01a, falta um cenário" }, "F01a")).toBe(
      "falta um cenário",
    );
    expect(rejectionReason({ at: AT, text: "não, F02 depende disso" }, "F01a")).toBe(
      "F02 depende disso",
    );
  });

  test("devolve o motivo, depois do não e da pontuação", () => {
    expect(rejectionReason({ at: AT, text: "não, faltou tratar o erro de rede" }, "F01a")).toBe(
      "faltou tratar o erro de rede",
    );
    expect(rejectionReason({ at: AT, text: "Não: a spec mudou." }, "F01a")).toBe("a spec mudou.");
    expect(rejectionReason({ at: AT, text: "não falta um cenário" }, "F01a")).toBe(
      "falta um cenário",
    );
  });

  test("sem motivo, sem resposta ou com um sim, pede o não com o motivo", () => {
    for (const answer of [
      undefined,
      { at: AT },
      { at: AT, text: "não" },
      { at: AT, text: "Não." },
      { at: AT, text: "sim" },
    ]) {
      expect(failure(() => rejectionReason(answer, "F01a")).code).toBe("reject-needs-answer");
    }
  });
});
