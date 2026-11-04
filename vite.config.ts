import { configDefaults, defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  test: {
    // As cópias de trabalho dos agentes (.claude/worktrees/) trazem os testes do repositório; um revisor que muda o
    // código de propósito numa delas não pode derrubar os testes desta.
    exclude: [...configDefaults.exclude, ".claude/**"],
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
    tasks: {
      // Sem cache: a varredura de segredos tem de rodar sempre, inclusive depois de commits novos.
      secrets: {
        command: "gitleaks git --redact --no-banner",
        cache: false,
      },
    },
  },
});
