# ADR-0002: Nível de spec-driven development

- **Status:** proposta
- **Data:** 2026-11-03

## Contexto

Spec-driven development tem graus diferentes de compromisso com a spec. É preciso escolher em qual deles o Curupira trabalha.

## Opções consideradas

- **Spec-first:** a spec só inicia o trabalho.
- **Spec-anchored:** a spec evolui junto com o código.
- **Spec-as-source:** só a spec é editada; o código é gerado a partir dela (como o Tessl, descrito na [análise de Böckeler](../pesquisa/fontes.md#artigos-estudos-e-relatórios)).

## Decisão

Em aberto. A tendência é spec-anchored.

## Consequências

- Spec-as-source arrisca repetir os problemas do Model-Driven Development.
- Spec-anchored exige manter spec e código em sincronia ao longo do tempo.
