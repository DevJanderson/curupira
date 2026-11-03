# ADR-0001: O resultado é uma ferramenta instalável

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

A pesquisa de engenharia de software sobre a fábrica humano + IA precisa de uma entrega concreta.
O espaço já tem ferramentas como o GitHub Spec Kit e o Kiro.

## Opções consideradas

- Só um método documentado.
- Só um template.
- Uma ferramenta instalável que junta método e template.

## Decisão

A pesquisa entrega uma ferramenta nova e instalável (método + template), no espaço do GitHub Spec Kit e do Kiro,
que conduz humano e agente do primeiro ao último passo.

## Consequências

- Além de documentar o método, é preciso construir e manter software: CLI, painel e instalação.
- O método passa a ser testado no uso real, não só no papel.
