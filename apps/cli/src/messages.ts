import { CLI_NAME, DATA_DIR, FlowError } from "@curupira/core";
import ptBR from "./messages/pt-BR.json" with { type: "json" };

// As mensagens ficam num catálogo por idioma, fora do código; até a F02 trazer o perfil, vale o pt-BR (ADR-0027).
type MessageKey = keyof typeof ptBR;
type Params = Readonly<Record<string, string | number>>;

export function message(key: MessageKey, params: Params = {}): string {
  const values: Params = { cli: CLI_NAME, data: `${DATA_DIR}/`, ...params };
  return ptBR[key].replace(/\{(\w+)\}/g, (match, name: string) => String(values[name] ?? match));
}

export function errorMessage(error: FlowError): string {
  if (error.code === "invalid-state" || error.code === "invalid-settings") {
    const problem = message(`problem.${error.params.problem}` as MessageKey);
    return message(`error.${error.code}`, { ...error.params, problem });
  }
  return message(`error.${error.code}`, error.params);
}
