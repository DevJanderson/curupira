import { expect, test } from "vite-plus/test";
import { BRAND, CLI_NAME, DATA_DIR, SKILL_PREFIX } from "../src/index.ts";

test("os derivados saem do nome", () => {
  expect(CLI_NAME).toBe(BRAND.name);
  expect(DATA_DIR).toBe("." + BRAND.name);
  expect(SKILL_PREFIX).toBe(BRAND.name + "-");
});

test("o nome é um identificador em minúsculas, sem espaços", () => {
  expect(BRAND.name).toBe(BRAND.name.toLowerCase());
  expect(BRAND.name).not.toMatch(/\s/);
});
