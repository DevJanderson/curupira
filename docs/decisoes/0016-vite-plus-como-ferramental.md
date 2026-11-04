# ADR-0016: Vite+ como ferramental

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

O monorepo precisa de formatação, lint, checagem de tipos, testes, tarefas e empacotamento.

## Opções consideradas

- [Vite+](../pesquisa/fontes.md#ferramentas-e-métodos): um comando só (`vp`).
- Biome + Vitest + tsc, montados à mão.

## Decisão

Vite+ 1.4.0: um comando (`vp`) para formatação (Oxfmt), lint (Oxlint), tipos (tsgo), testes (Vitest),
tarefas (Vite Task) e empacotamento (`vp pack`).

## Consequências

- O `vp run ready` é a checagem local e da CI.
