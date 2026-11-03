# ADR-0014: Estrutura e convenções do repositório

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

Pessoas e agentes trabalham no mesmo repositório e precisam das mesmas regras.

## Opções consideradas

Não registradas.

## Decisão

- Monorepo pnpm com `apps/` (aplicações) e `packages/` (bibliotecas).
- Identificadores em inglês; documentação, mensagens, comentários e commits em pt-BR.
- Commits no formato `tipo: descrição`.
- Trabalho em passos pequenos, cada um revisado antes do próximo.

## Consequências

- O [AGENTS.md](../../AGENTS.md) resume essas regras para os agentes.
