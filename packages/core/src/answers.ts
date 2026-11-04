import { readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { DATA_DIR } from "./brand.ts";
import { FlowError } from "./errors.ts";
import { isMissing, writeFileAtomic } from "./files.ts";
import type { Request } from "./journey.ts";

// A última mensagem digitada em cada sessão, que sustenta uma aprovação ou recusa (ADR-0025).
// Fica fora do Git e só guarda o texto quando ele pode ser uma decisão (ADR-0026).
export interface Answer {
  at: string;
  text?: string;
}

const LOCAL_DIR = join(DATA_DIR, "local");
const ANSWERS_DIR = join(LOCAL_DIR, "answers");
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
// O id da sessão vira nome de arquivo: só letras, dígitos, ponto, hífen e sublinhado, sem começar por ponto.
const SESSION_ID = /^[A-Za-z0-9_-][A-Za-z0-9._-]{0,199}$/;
// "sim" ou "não" como primeira palavra; "simples" não conta.
const DECISION_START = /^(sim|não)(?![\p{L}\p{N}])/iu;
const REJECTION = /^não[\s,.:;!?—–-]+(.*\S)/isu;

export function answerFile(root: string, session: string): string {
  return join(root, ANSWERS_DIR, `${checkSession(session)}.json`);
}

export function recordAnswer(root: string, session: string, prompt: string, at: string): void {
  const file = answerFile(root, session);
  // Na forma composta, um "não" com o acento como caractere à parte conta igual.
  const text = prompt.normalize("NFC");
  const answer: Answer = DECISION_START.test(text.trim()) ? { at, text } : { at };
  ignoreInGit(root);
  writeFileAtomic(file, JSON.stringify(answer) + "\n", join(ANSWERS_DIR, `${session}.json`));
}

// Uma resposta de mais de 30 dias não vale, mesmo que a limpeza ainda não tenha rodado; uma com data
// inválida ou no futuro também não.
export function readAnswer(root: string, session: string, now?: Date): Answer | undefined {
  const answer = parseAnswer(answerFile(root, session));
  if (answer && now && !isRecent(Date.parse(answer.at), now)) return undefined;
  return answer;
}

// A resposta só sustenta a decisão se veio depois do pedido (ADR-0031, regra 6); a mesma hora não basta.
export function answerAfter(
  answer: Answer | undefined,
  request: Request,
  id: string,
): Answer | undefined {
  if (answer && !(Date.parse(answer.at) > Date.parse(request.at)))
    throw new FlowError("answer-before-request", { id });
  return answer;
}

export function deleteAnswer(root: string, session: string): void {
  rmSync(answerFile(root, session), { force: true });
}

export function purgeAnswers(root: string, now: Date): void {
  const dir = join(root, ANSWERS_DIR);
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch (error) {
    if (isMissing(error)) return;
    throw new FlowError("unreadable-file", { file: ANSWERS_DIR });
  }
  for (const name of names) {
    const file = join(dir, name);
    // A idade vem da data da resposta; sem ela, ou com uma data no futuro, da data do arquivo.
    const at = Date.parse(parseAnswer(file)?.at ?? "");
    const time = Number.isNaN(at) || at > now.getTime() ? statSync(file).mtimeMs : at;
    if (!isRecent(time, now)) rmSync(file, { force: true });
  }
}

// Devolve o texto digitado se ele for um "sim" puro: "sim" ou "sim <ID>", com um espaço.
export function approvalText(answer: Answer | undefined, id: string): string {
  const text = answer?.text;
  if (text === undefined) throw new FlowError("approve-needs-answer", { id });
  if (DECISION_START.exec(text.trim())?.[1]?.toLowerCase() !== "sim") {
    throw new FlowError("approve-needs-answer", { id });
  }
  const plain = /^sim(?: (\S+))?$/.exec(normalize(text));
  if (plain && (plain[1] === undefined || plain[1] === id.toLowerCase())) return text;
  // "sim F02" é um sim puro para outra funcionalidade: não sustenta esta.
  if (plain && /^f\d{2,}[a-z]?$/.test(plain[1]!))
    throw new FlowError("approve-needs-answer", { id });
  throw new FlowError("plain-yes-only", { id });
}

// Devolve o motivo de um "não, <motivo>"; o ID da própria funcionalidade não faz parte dele.
export function rejectionReason(answer: Answer | undefined, id: string): string {
  const match = REJECTION.exec(answer?.text?.trim() ?? "");
  const ownId = new RegExp(`^${id}(?![\\p{L}\\p{N}])[\\s,.:;!?—–-]*`, "iu");
  const reason = match?.[1]?.trim().replace(ownId, "").trim();
  if (!reason || /^[.!?]+$/.test(reason)) throw new FlowError("reject-needs-answer", { id });
  return reason;
}

function isRecent(time: number, now: Date): boolean {
  const age = now.getTime() - time;
  return age >= 0 && age <= MAX_AGE_MS;
}

// Maiúsculas, espaços nas pontas e um ponto final não contam (spec da F01b, decisões).
function normalize(text: string): string {
  return text.trim().replace(/\.$/, "").toLowerCase();
}

function checkSession(session: string): string {
  if (!SESSION_ID.test(session)) throw new FlowError("no-session");
  return session;
}

// A pasta local se ignora no Git sozinha, para o texto da pessoa nunca ir para um commit.
function ignoreInGit(root: string): void {
  const file = join(root, LOCAL_DIR, ".gitignore");
  try {
    statSync(file);
  } catch {
    writeFileAtomic(file, "*\n", join(LOCAL_DIR, ".gitignore"));
  }
}

function parseAnswer(file: string): Answer | undefined {
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    // Ausente ou ilegível: não sustenta decisão, e a próxima mensagem a substitui.
    return undefined;
  }
  if (typeof data !== "object" || data === null || typeof (data as Answer).at !== "string") {
    return undefined;
  }
  const { at, text } = data as Answer;
  return typeof text === "string" ? { at, text } : { at };
}
