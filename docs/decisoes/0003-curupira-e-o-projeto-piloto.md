# ADR-0003: O próprio Curupira é o projeto-piloto

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

O método precisa ser validado no uso real, e a pesquisa precisa de métricas.

## Opções consideradas

Não registradas.

## Decisão

A partir do PRD, o Curupira é construído seguindo o próprio método: primeiro à mão, com modelos em Markdown;
depois, com a própria ferramenta.

## Consequências

- Cada fase do método é validada no uso real.
- A construção gera as métricas da pesquisa.

## Histórico

- 2026-11-03: depois da entrega da F01b, a jornada deste repositório passa a rodar pela própria ferramenta a partir
  da F02: os comandos `open`, `advance`, `approve` e `reject` gravam o estado em `.curupira/state/`, e o hook grava a
  resposta digitada. Até a F01b, as aprovações foram registradas à mão
  ([relato](../pesquisa/relatos/2026-11-03-fase-5-f01b.md)).
