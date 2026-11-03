# Verificação

> **Status:** proposta. O fluxo descrito aqui é o do
> ADR-0010 (no [registro de decisões](../decisoes/README.md)), que ainda não foi aceito.

## Cenários

- Cada funcionalidade tem poucos cenários. Cada cenário tem um ponto de partida, uma ação e um resultado esperado, e
  verifica uma condição só.
- Uma lista longa de cenários indica detalhe de implementação, não comportamento.
- Os cenários nascem na especificação (fase 3) e são aprovados junto com ela (fase 4).

## O verificador

- Um verificador separado, que não implementou o código, roda os cenários contra o sistema real.
- Ele é chamado por um comando só.

## Os quatro vereditos

| Veredito   | Significa                                                  |
| ---------- | ---------------------------------------------------------- |
| verificado | O cenário passou, com prova                                |
| parcial    | Parte do resultado esperado aconteceu, parte não           |
| bloqueado  | O ambiente não deixou testar; é diferente de código errado |
| falhou     | O sistema não fez o que o cenário pede                     |

## O laço de correção

- Em "falhou", o agente que implementou corrige, e o verificador roda os cenários de novo, com um limite de tentativas.
- Em "bloqueado", o agente chama a pessoa.

## Provas em texto

Cada veredito vem com provas em texto: saída de testes, requisições e respostas reais à API e logs.

## Depois da verificação

Cenário aprovado vira teste de regressão e passa a rodar sempre.

## Testes antes do código

Cada passo da implementação começa com um teste que falha: a prova do vermelho.
Só depois vem o código que faz o teste passar.
