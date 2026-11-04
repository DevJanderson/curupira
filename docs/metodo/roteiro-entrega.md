# Roteiro da revisão e da entrega

## Para que serve

Diz o que o agente faz nas fases 7 e 8 da [linha](../decisoes/0031-a-linha.md), além do que a tabela da jornada já diz:
como a revisão ganha um olhar diferente, o que se mede em cada funcionalidade e como o método perde regras, e não só
ganha. Saiu do [parecer](../pesquisa/relatos/2026-11-04-parecer-do-fluxo.md) sobre a F01a e a F01b.

## Fase 7: revisão

A revisão roda em eixos (spec, segurança, testes, padrões), cada um num subagente separado, e só defeitos bloqueiam.

- **Um eixo com outro olhar.** O eixo de testes, que achou 8 dos 10 defeitos da revisão na F01a e na F01b, roda com
  um olhar diferente do agente que implementou: na v1, outro modelo do mesmo agente
  ([ADR-0005](../decisoes/0005-so-claude-code-na-v1.md)).
- **O eixo que muda o código de propósito roda à parte.** As mutações do eixo de testes acontecem numa cópia de
  trabalho só dele, para os outros eixos, que rodam ao mesmo tempo, não lerem o código no meio de uma mutação.
- A revisão diz qual olhar foi usado e quantos defeitos ele achou que os outros eixos não acharam.
- **O eixo de segurança confere os casos de borda** que a spec deixa para a revisão
  ([ADR-0032](../decisoes/0032-parar-a-recursao.md)): para cada dado lido ou gravado, o arquivo que não se lê ou não
  se grava, o link simbólico em qualquer parte do caminho, o caminho de outro dono, duas execuções ao mesmo tempo, a
  gravação interrompida, o nome vindo do disco que vai cru para a saída e, quando dois erros podem acontecer juntos,
  qual vence. Um caso de borda achado aqui é defeito se quebra o que a spec promete; se não, vai para o backlog.
- O pedido de aprovação das fases 7 e 8 segue esta ordem: o commit de tudo, `curupira request <ID>`, que grava a hora
  e o commit, e só então o cartão de decisão. Entre o pedido e a resposta, nenhum commit: um commit novo faz o
  `approve` recusar, e é preciso um pedido novo. A medição tira da hora do pedido o tempo até a resposta.

### O PR

O fluxo no GitHub segue o [ADR-0034](../decisoes/0034-fluxo-no-github.md). Na fase 7, o agente tira o PR de
rascunho (`gh pr ready`) e completa o corpo pelo template: "Closes #n", a spec, os cenários, o veredito do verificador
e o que a revisão achou. Acima de cerca de 400 linhas de código mudadas (fora documentação e testes), o cartão de
decisão avisa, porque a revisão rende menos em mudança grande.

## Fase 8: entrega

### A tabela de medição

A medição de cada funcionalidade usa esta tabela (no repositório-piloto, no fim do relato), sempre com as mesmas
linhas, para comparar uma funcionalidade com outra. O que não deu para medir fica como "sem dado", e não some.

| Medida               | O que entra                                               |
| -------------------- | --------------------------------------------------------- |
| Duração              | do início da fase 3 ao "sim" da fase 8, e o prazo da spec |
| Defeitos por fase    | verificação, revisão (por eixo) e pessoa                  |
| Tempo até cada "sim" | fase 4, fase 7 e fase 8, a partir da hora do pedido       |
| Regras do método     | quantas entraram e quantas saíram                         |

O agente preenche à mão, no fim do relato da peça, que é um só e curto. A tabela guarda só números
([fontes](../pesquisa/fontes.md#normas): necessidade, da LGPD).

### As melhorias

- O agente propõe **no máximo uma** mudança do método, a que a peça mais mostrou, e só se outra regra sai junto (uma
  regra nunca usada nas últimas peças, que repete outra ou que um teste já garante). A pessoa decide.
- As outras melhorias que a peça mostrou vão para o [backlog](../product/backlog.md).
- O que entra e o que sai vai para o histórico do roteiro, com o link do relato.

### O merge

A pessoa faz o merge com commit de merge; a branch se apaga e a issue fecha sozinha. Antes do pedido da fase 8, o
agente põe uma linha no "Unreleased" do `CHANGELOG.md`, no formato do Keep a Changelog.

### Depois da entrega

Antes de abrir a próxima peça, a pessoa revê os itens pendentes do backlog e decide cada um: entra, sai ou fica.

## Histórico

- 2026-11-04: primeira versão, com o eixo de outro olhar, a tabela de medição e a poda de regras, a partir das
  recomendações 1, 3 e 4 do [parecer](../pesquisa/relatos/2026-11-04-parecer-do-fluxo.md).
- 2026-11-04: na v1, o outro olhar é outro modelo do mesmo agente; a duração vai até o "sim" da fase 8, e os defeitos
  depois do merge se contam na F13; o tempo até a resposta sai da hora do pedido
  ([ADR-0031](../decisoes/0031-a-linha.md)).
- 2026-11-04: entrou o eixo que muda o código numa cópia de trabalho à parte; saiu o cartão com um teste por cenário
  para quando não há outro modelo, que nunca foi usado
  ([relato da F00](../pesquisa/relatos/2026-11-04-fases-5-a-7-f00.md)).
- 2026-11-04: pelo [ADR-0032](../decisoes/0032-parar-a-recursao.md), o eixo de segurança passa a conferir os casos de
  borda que saíram da spec; a medição fica com quatro linhas; a fase 8 traz no máximo uma mudança do método, e só com
  uma regra saindo; o resto vai para o backlog, que a pessoa revê antes da próxima peça.
- 2026-11-04: pelo [ADR-0034](../decisoes/0034-fluxo-no-github.md), o PR sai de rascunho na fase 7 pelo template,
  com aviso acima de cerca de 400 linhas de código; a entrega põe uma linha no changelog, e o merge é com commit de
  merge, apagando a branch.
