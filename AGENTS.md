# AGENTS.md

O Curupira é uma ferramenta (ainda a construir) que organiza o desenvolvimento de software como uma fábrica humano + IA.
Este repositório é um monorepo TypeScript com Vite+ (`vp`) e pnpm: aplicações em `apps/`, bibliotecas em `packages/`.

## Como trabalhamos

- Trabalhamos em passos pequenos. Não crie nada fora do que o passo pede.
- Antes de dizer que terminou: `vp run ready` passando (é o mesmo que roda na CI).
- Dependência nova só com justificativa na mensagem do commit.
- Decisão de arquitetura nova ou mudada vira ADR em `docs/decisoes/` antes do código.
- Referências de terceiros seguem o ADR-0020: conteúdo de projetos proprietários nunca é copiado, só descrito, com fonte.
- Ao fim de cada passo, uma linha datada em `docs/pesquisa/registro.md`.

## Idioma

- Identificadores de código em inglês.
- A interface da ferramenta (comandos, opções, pastas e arquivos que ela cria) em inglês; o texto que a pessoa
  lê no idioma do projeto (ADR-0027).
- Documentação, mensagens, comentários e commits deste repositório em português (pt-BR).
- Skills e subagentes da ferramenta: todo o conteúdo em inglês, inclusive descrição, exemplos e modelos (ADR-0027).

## Commits

Formato `tipo: descrição`, com `tipo` entre `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`.

## Ferramental (Vite+)

- `vp <nome>` roda um comando embutido; `vp run <nome>` roda um script do `package.json` ou uma tarefa do `vite.config.ts`. Confira esses arquivos antes e use `vp run` quando o projeto define o nome.
- Rode arquivos TS/JS com `vpx <arquivo>` (não adicione `tsx` nem `ts-node`). `vp node <arquivo>` roda Node puro.
- `vp install` depois de puxar mudanças. `vp toolchain` mostra as versões das ferramentas.
- Documentação local em `node_modules/vite-plus/docs` ou em https://viteplus.dev/guide/.
- Se o ambiente parecer errado, rode `vp env doctor` e inclua a saída ao pedir ajuda.
- O hook de pre-commit roda o Gitleaks nos arquivos preparados e depois `vp staged`, que aplica `vp check --fix`.
- O Gitleaks (ADR-0019) é um binário à parte, exigido pelo pre-commit e pelo `vp run ready`. Nunca contorne o hook com `--no-verify`.
