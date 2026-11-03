# ADR-0021: Núcleo independente de agente, com adaptadores

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

O [ADR-0005](0005-so-claude-code-na-v1.md) limita a v1 ao Claude Code. O [PRD](../produto/prd.md) quer que outros
agentes de terminal, inclusive os que usam outros modelos, entrem depois sem reescrever o Curupira.

## Opções consideradas

- Núcleo acoplado ao Claude Code: mais rápido agora, preso depois.
- Vários adaptadores já na v1: escopo maior.
- Núcleo independente de agente, com só o adaptador do Claude Code na v1.

## Decisão

O núcleo (CLI, estado, portões, verificação, medição e modelos dos artefatos) não depende de agente nem de modelo.
O que é específico de cada agente fica num adaptador: o formato das skills, os hooks, os subagentes, como chamar o
agente em modo interativo e não interativo, e como ler os registros de sessão dele. A v1 entrega só o adaptador do
Claude Code; outros agentes de terminal, inclusive os que usam outros modelos, entram como novos adaptadores.
Complementa o ADR-0005.

## Consequências

- Um agente novo exige escrever um adaptador, não mexer no núcleo.
- O núcleo não pode depender do adaptador; essa fronteira precisa ser checada por máquina.
- O adaptador de cada agente leva o nome dele (ADR-0020, item 7).
