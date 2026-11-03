# ADR-0009: Instalação por curl

- **Status:** adiada
- **Data:** 2026-11-03

## Contexto

A pessoa precisa instalar o comando `curupira` uma vez por máquina (fase 0 da [jornada](../conceitos/jornada.md)).

## Opções consideradas

- **Fase 1:** script curl que confere o Node e roda `npm i -g`.
- **Fase 2:** binário único por sistema (o `vp pack` gera) no GitHub Releases.

## Decisão

Adiada. Quando vier: as duas fases, nessa ordem, com HTTPS, checksum, `--dry-run` e versão PowerShell.
Reservar o nome no npm e publicar também ficam para o futuro.

## Consequências

- Até lá, o Curupira roda a partir do repositório.
