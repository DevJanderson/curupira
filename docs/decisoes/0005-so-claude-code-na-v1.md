# ADR-0005: Só Claude Code na v1

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

Cada agente de código oferece recursos diferentes. O Claude Code tem skills, subagentes e hooks nativos.

## Opções consideradas

- Vários agentes desde o início.
- Formato genérico, comum a vários agentes (perde subagentes e hooks).
- Só Claude Code.

## Decisão

A v1 suporta só o Claude Code e usa as skills, os subagentes e os hooks nativos dele. Outros agentes vêm depois.

## Consequências

- Quem usa outro agente não é atendido na v1.
- Suportar outros agentes depois exige revisitar esta decisão.
