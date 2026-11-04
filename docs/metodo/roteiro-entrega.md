# Roteiro da revisão e da entrega

## Para que serve

Diz o que o agente faz nas fases 7 e 8 da [jornada](../conceitos/jornada.md), além do que a tabela da jornada já diz:
como a revisão ganha um olhar diferente, o que se mede em cada funcionalidade e como o método perde regras, e não só
ganha. Saiu do [parecer](../pesquisa/relatos/2026-11-04-parecer-do-fluxo.md) sobre a F01a e a F01b.

## Fase 7: revisão

A revisão roda em eixos (spec, segurança, testes, padrões), cada um num subagente separado, e só defeitos bloqueiam.

- **Um eixo com outro olhar.** O eixo de testes, que achou 8 dos 10 defeitos da revisão na F01a e na F01b, roda com
  um olhar diferente do agente que implementou: outro agente de terminal, se a pessoa tiver um
  ([ADR-0022](../decisoes/0022-sem-api-de-modelo-so-agentes-de-terminal.md)), ou outro modelo. Sem nenhum dos dois,
  o cartão de decisão leva um teste por cenário nos pontos 👀, para a pessoa ler
  ([ADR-0028](../decisoes/0028-cartao-de-decisao.md)).
- O relato diz qual olhar foi usado e quantos defeitos ele achou que os outros eixos não acharam.
- O pedido de aprovação da fase 7 é um cartão de decisão, e o relato anota o tempo até a resposta.

## Fase 8: entrega

### A tabela de medição

O relato de cada funcionalidade termina com esta tabela, sempre com as mesmas linhas, para comparar uma
funcionalidade com outra. O que não deu para medir fica como "sem dado", e não some.

| Medida                 | O que entra                                               |
| ---------------------- | --------------------------------------------------------- |
| Duração                | do início da fase 3 ao merge, e só o trabalho do agente   |
| Commits e PRs          |                                                           |
| Código e testes        | linhas novas de código e de testes; total de testes       |
| Tokens e custo         | da sessão que fez a funcionalidade, como o agente informa |
| Perguntas da spec      | quantas, e quantas mudaram um requisito                   |
| Rodadas de verificação |                                                           |
| Defeitos por fase      | verificação, revisão (por eixo), pessoa, depois do merge  |
| Tempo até cada "sim"   | fase 4 e fase 7                                           |
| Regras do método       | quantas entraram e quantas saíram                         |

Até a F12 existir, o agente preenche à mão. A tabela guarda só números
([fontes](../pesquisa/fontes.md#normas): necessidade, da LGPD).

### As melhorias

- O agente propõe as melhorias do método que a funcionalidade mostrou; a pessoa escolhe quais entram.
- **Junto das melhorias, o agente propõe o que sai.** Para cada roteiro que vai ganhar uma regra, ele procura uma
  regra que nunca foi usada nas últimas funcionalidades, que repete outra ou que um teste já garante, e propõe tirar,
  juntar ou trocar por teste.
- Uma regra nova que não tira nenhuma diz por quê.
- O que entra e o que sai vai para o histórico do roteiro, com o link do relato.

## Histórico

- 2026-11-04: primeira versão, com o eixo de outro olhar, a tabela de medição e a poda de regras, a partir das
  recomendações 1, 3 e 4 do [parecer](../pesquisa/relatos/2026-11-04-parecer-do-fluxo.md).
