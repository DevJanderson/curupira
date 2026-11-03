# ADR-0006: Núcleo novo em TypeScript, migrando o specwork

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

O specwork, tentativa anterior em Python com 960 testes, tem a melhor verificação, mas é pesado demais:
uma entrega custa cerca de US$ 312, o contexto chega a 527 mil tokens e as skills somam 48 mil palavras.

## Opções consideradas

- Reescrever do zero em TypeScript.
- Specwork v2 em Python.
- Núcleo novo em TypeScript, migrando aos poucos modelos, contratos, evals e medição do specwork.

## Decisão

Núcleo novo em TypeScript, migrando aos poucos modelos, contratos, evals e medição do specwork.

## Consequências

- O que o specwork tem de bom é reaproveitado sem herdar o peso.
- Cada peça migrada passa pela regra dos passos pequenos.
