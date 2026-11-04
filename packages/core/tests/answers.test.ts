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

  test("apaga as respostas guardadas há mais de 30 dias", () => {
    recordAnswer(root, "velha", "sim", AT);
    recordAnswer(root, "nova", "sim", AT);
    const now = new Date("2026-12-10T00:00:00.000Z");
    const old = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
    const recent = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    utimesSync(answerFile(root, "velha"), old, old);
    utimesSync(answerFile(root, "nova"), recent, recent);
    purgeAnswers(root, now);
    expect(readAnswer(root, "velha")).toBeUndefined();
    expect(readAnswer(root, "nova")).toEqual({ at: AT, text: "sim" });
  });
});

describe("o sim que aprova", () => {
  test("vale sim puro ou sim com o ID, sem contar maiúsculas, espaços nas pontas e um ponto final", () => {
    for (const text of ["sim", "Sim", "SIM.", "  sim  ", "sim F01a", "Sim f01a."]) {
      expect(approvalText({ at: AT, text }, "F01a")).toBe(text);
    }
  });

  test("um sim com outra frase pede o sim sozinho", () => {
    expect(
      failure(() => approvalText({ at: AT, text: "sim, e mais uma coisa" }, "F01a")).code,
    ).toBe("plain-yes-only");
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
