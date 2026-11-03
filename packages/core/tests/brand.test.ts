import { expect, test } from "vite-plus/test";
import { BRAND, CLI_NAME, DATA_DIR, SKILL_PREFIX } from "../src/index.ts";

test("os derivados saem do nome e da abreviação", () => {
  expect(CLI_NAME).toBe(BRAND.name);
  expect(DATA_DIR).toBe("." + BRAND.name);
  expect(SKILL_PREFIX).toBe(BRAND.short + "-");
});

test("o nome é um identificador em minúsculas, sem espaços", () => {
  expect(BRAND.name).toBe(BRAND.name.toLowerCase());
  expect(BRAND.name).not.toMatch(/\s/);
});

test("a abreviação tem de 2 a 4 letras minúsculas e é menor que o nome", () => {
  expect(BRAND.short).toMatch(/^[a-z]{2,4}$/);
  expect(BRAND.short.length).toBeLessThan(BRAND.name.length);
});
