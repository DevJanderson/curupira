# ADR-0011: O painel aceita decisões humanas

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

No specwork, o painel era só de leitura: as decisões humanas eram tomadas no terminal.

## Opções consideradas

- Painel só de leitura.
- Painel que aceita decisões humanas.

## Decisão

A pessoa pode aprovar, pedir mudanças e comentar pelo painel. O painel sempre grava pelo mesmo comando da CLI,
que é o escritor único do estado.

## Consequências

- Painel e terminal não divergem, porque o estado tem um único escritor.
