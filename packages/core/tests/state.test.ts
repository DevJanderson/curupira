import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, expect, test } from "vite-plus/test";
import {
  approve,
  DATA_DIR,
  FlowError,
  open,
  readAllStates,
  readState,
  stateFile,
  writeState,
} from "../src/index.ts";

const AT = "2026-11-03T20:00:00.000Z";
let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "state-"));
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

test("grava e lê o estado num arquivo por funcionalidade", () => {
  writeState(root, open("F01a"));
  writeState(root, open("F02"));
  expect(stateFile(root, "F01a")).toBe(join(root, DATA_DIR, "state", "F01a.json"));
  expect(readState(root, "F01a")).toEqual(open("F01a"));
  expect(readAllStates(root).map((state) => state.id)).toEqual(["F01a", "F02"]);
});

test("sem estado, a leitura não acha nada", () => {
  expect(readState(root, "F01a")).toBeUndefined();
  expect(readAllStates(root)).toEqual([]);
});

test("uma decisão nova entra no fim, sem mudar as anteriores", () => {
  const approved = approve({ ...open("F01a"), phase: 4 }, "Ana", AT);
  writeState(root, approved);
  const before = readFileSync(stateFile(root, "F01a"), "utf8");
  writeState(root, approve({ ...readState(root, "F01a")!, phase: 7 }, "Bia", AT));
  const after = readState(root, "F01a")!;
  expect(after.decisions).toHaveLength(2);
  expect(after.decisions[0]).toEqual(JSON.parse(before).decisions[0]);
});

test("a gravação não deixa arquivo temporário para trás", () => {
  writeState(root, open("F01a"));
  expect(readdirSync(join(root, DATA_DIR, "state"))).toEqual(["F01a.json"]);
});

test("um arquivo inválido gera erro com o nome do arquivo e o problema", () => {
  const dir = join(root, DATA_DIR, "state");
  mkdirSync(dir, { recursive: true });
  const cases: [string, string][] = [
    ["{", "json"],
    ["[]", "object"],
    [
      '{"id":"F01a","phase":5,"decisions":[{"phase":4,"decision":"approve","by":"","at":"' +
        AT +
        '"}]}',
      "decisions",
    ],
    [
      '{"id":"F01a","phase":5,"decisions":[{"phase":4,"decision":"approve","by":"Ana","at":"ontem"}]}',
      "decisions",
    ],
    ['{"id":"F02","phase":3,"decisions":[]}', "id"],
    ['{"id":"F01a","phase":9,"decisions":[]}', "phase"],
    ['{"id":"F01a","phase":3}', "decisions"],
    [
      '{"id":"F01a","phase":5,"decisions":[{"phase":4,"decision":"maybe","by":"Ana","at":"x"}]}',
      "decisions",
    ],
  ];
  for (const [content, problem] of cases) {
    writeFileSync(join(dir, "F01a.json"), content);
    const error = failure(() => readState(root, "F01a"));
    expect(error.code).toBe("invalid-state");
    expect(error.params).toEqual({ file: join(DATA_DIR, "state", "F01a.json"), problem });
    expect(failure(() => readAllStates(root)).code).toBe("invalid-state");
  }
});

test("um arquivo cujo nome não é ID de funcionalidade é inválido", () => {
  const dir = join(root, DATA_DIR, "state");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "x.json"), '{"id":"x","phase":3,"decisions":[]}');
  const error = failure(() => readAllStates(root));
  expect(error.params).toEqual({ file: join(DATA_DIR, "state", "x.json"), problem: "name" });
});

test("um arquivo que não pode ser lido gera erro de leitura, não uma exceção do Node", () => {
  mkdirSync(join(root, DATA_DIR, "state", "F04.json"), { recursive: true });
  const file = join(DATA_DIR, "state", "F04.json");
  expect(failure(() => readState(root, "F04"))).toMatchObject({
    code: "unreadable-file",
    params: { file },
  });
  expect(failure(() => readAllStates(root)).code).toBe("unreadable-file");
});

test("um estado que não pode ser gravado gera erro de gravação, não uma exceção do Node", () => {
  writeFileSync(join(root, DATA_DIR), "não é uma pasta");
  const file = join(DATA_DIR, "state", "F01a.json");
  expect(failure(() => writeState(root, open("F01a")))).toMatchObject({
    code: "unwritable-file",
    params: { file },
  });
});

test("uma pasta de estado que não pode ser lida não vira funcionalidade inexistente", () => {
  mkdirSync(join(root, DATA_DIR), { recursive: true });
  writeFileSync(join(root, DATA_DIR, "state"), "não é uma pasta");
  expect(failure(() => readState(root, "F03")).code).toBe("unreadable-file");
  expect(failure(() => readAllStates(root))).toMatchObject({
    code: "unreadable-file",
    params: { file: join(DATA_DIR, "state") },
  });
});
