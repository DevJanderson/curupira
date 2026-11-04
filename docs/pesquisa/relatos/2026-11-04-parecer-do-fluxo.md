# Relato: parecer sobre o fluxo da F01a e da F01b

Avaliação pedida pela pessoa depois da entrega da F01b: o fluxo de 9 fases rodou inteiro duas vezes, à mão
([ADR-0003](../../decisoes/0003-curupira-e-o-projeto-piloto.md)). A pergunta era se estamos construindo do jeito
certo, antes de seguir para a F02.

## O que funcionou

- O fluxo completo rodou duas vezes, da spec ao merge pela pessoa.
- A verificação e a revisão pegaram 15 defeitos antes do merge.
- O método aprende com cada funcionalidade: a fase 8 da F01a trouxe 6 melhorias e a da F01b, 4.
- Tudo é rastreável: cada decisão tem ADR, relato e linha no registro.

## O que preocupa

1. Não medimos o que as hipóteses pedem: não há tokens nem custo por funcionalidade, nem uma linha de base sem o
   método para comparar.
2. A aprovação da fase 7 da F01b levou um minuto, sem olhar o código. A H5 fica em risco se a pessoa aprovar sem
   saber onde olhar.
3. O verificador e os revisores são o mesmo modelo que implementou. Dos 10 defeitos da revisão nas duas
   funcionalidades, 8 foram do eixo de testes. A H3 não está sendo exercitada: os testes não passam pela pessoa.
4. As regras só se acumulam: cada fase 8 acrescenta, nenhuma tira.
5. Até agora construímos ferramentas de governança; a H6 pede um segundo projeto.
6. A proporção entre documentação e código está alta: cerca de 2.900 linhas de documentação e 27 ADRs para 628
   linhas de código e 1.200 de testes.

## As 5 recomendações

Todas aceitas pela pessoa em 2026-11-04:

| #   | Recomendação                                                                     | Onde entra                                                            |
| --- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | Uma tabela fixa de medição por funcionalidade: tempo, tokens, defeitos por fase  | no relato de cada funcionalidade, a partir da F02                     |
| 2   | Um cartão de decisão que aponta onde a pessoa olha, e o tempo até a resposta     | [ADR-0028](../../decisoes/0028-cartao-de-decisao.md), a partir da F02 |
| 3   | Um eixo da revisão com outro olhar: outro modelo ou uma amostra lida pela pessoa | na revisão da F02                                                     |
| 4   | Na fase 8, podar regras além de acrescentar                                      | no roteiro da fase 8                                                  |
| 5   | Um segundo projeto pequeno, cedo                                                 | depois da F02 e da F04a                                               |

## O mascote

Da conversa sobre o cartão saiu também o mascote da CLI, desenhado fora do repositório em seis rodadas, com regras de
duas skills abertas. A escolha foi a versão de frente de 16x16, com a entrada correndo pela esquerda
([ADR-0029](../../decisoes/0029-mascote-no-terminal.md)).
