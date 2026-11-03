// O nome é provisório (ADR-0008): este é o único lugar do código onde ele está escrito.
export const BRAND = {
  name: "curupira", // identificador: comando, pacotes, pastas
  displayName: "Curupira", // como aparece para pessoas
  short: "cr", // abreviação: prefixo das skills e dos subagentes
} as const;

// Os derivados saem de BRAND, para que trocar o nome seja mudar só a constante acima.
export const CLI_NAME = BRAND.name;
export const DATA_DIR = `.${BRAND.name}` as const;
export const SKILL_PREFIX = `${BRAND.short}-` as const;
