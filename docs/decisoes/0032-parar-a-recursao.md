# ADR-0032: parar a recursão, com a spec em seis perguntas e o backlog

- **Status:** aceita
- **Data:** 2026-11-04

## Contexto

Em dois dias, o Curupira entregou 4 de 22 peças, todas de governança do próprio método, com 6.422 linhas de
documentação para 1.403 de código. A família F01 cresceu de uma peça para quatro, e a F01d foi recusada na fase 4
para um [parecer](../pesquisa/relatos/2026-11-04-parecer-do-loop.md). O parecer achou um laço: uma entrega ensina
algo, a lição vira regra do método, a regra vira uma peça nova da ferramenta para impô-la, e a peça passa pelo
método inteiro, que acha mais coisas. Achou também que a spec cresce até se dividir: o contraditório traz entre 22 e
61 achados por rodada, quase todos aceitos, e a regra de tamanho conta requisitos.

A spec não especificou mal. Nenhuma das quatro peças entregues fez a coisa errada depois do "sim" da fase 4. Dos
defeitos achados depois da spec, a maior parte foi de testes fracos (12 de 15 na F01c), que a spec não pega. As duas
recusas da F02 vieram de ADRs que se contradiziam (o `init` com vários sentidos), e não da forma da spec. O que
mudou o escopo veio de fora da spec: decisões novas do método, como o ADR-0031. O que inchou a spec foi pedir a ela
dois trabalhos: dizer o que construir e prever todo defeito. O segundo não cabe na spec; cabe nos testes e na
revisão. Cada defeito que escapou virou uma regra de "a spec deve prever X", e a spec ficou mais pesada a cada peça.

## Opções consideradas

- Seguir como está: o mesmo laço.
- Ajustar só o contraditório: corta o inchaço, mas a lição continua virando peça.
- Cortar o laço nos dois pontos, dar à spec um formato fechado e guardar o que sobra num backlog.

## Decisão

A terceira opção.

1. **A ferramenta impõe só o que já existe**: o estado, a prova do "sim" e o pedido com o hash (F01a, F01b, F00 e
   F01c). Uma regra nova do método é texto num roteiro e não vira peça nova enquanto o fluxo do produto não rodar de
   ponta a ponta num projeto real. As regras 3 a 5 do [ADR-0031](0031-a-linha.md) (a branch, o `project.json` e o
   "esperando merge") seguem como prática do agente, à mão; as decisões das fases 1 e 2 seguem no próprio PRD.
2. **A spec responde a seis perguntas**, e está pronta quando as seis têm resposta, e não quando não tem lacuna:
   o problema, o prazo, o que entrega (requisitos), como se sabe que acabou (cenários), o que não faz e os riscos
   aceitos. Os dados pessoais seguem como seção, pela LGPD. As seis vêm dos cinco ingredientes do _pitch_ do
   [Shape Up](https://basecamp.com/shapeup/1.5-chapter-06) (problema, apetite, solução, buracos e o que não entra) e do
   "negociável" do [INVEST](https://xp123.com/invest-in-good-stories-and-smart-tasks/) (a história não é um contrato
   explícito).
3. **O prazo substitui o limite de tamanho.** A spec diz o prazo da peça. O que não cabe sai do escopo para o
   backlog, e a peça não se divide no meio da fase 3.
4. **O contraditório tem uma rodada e um subagente**, que procura lacunas e excessos. Só entra na spec o que muda o
   que a pessoa vê ou impede a implementação. Caso de borda vira item de teste no plano.
5. **O backlog guarda o que sobra.** O que aparece durante uma peça e não entra nela (achado cortado, melhoria,
   ideia, peça retirada) vai para [o backlog](../product/backlog.md), e a peça segue o fluxo até o fim. Nada do
   backlog entra na peça em andamento. Depois da entrega, antes de abrir a próxima, a pessoa revê o backlog e decide
   cada item: entra (numa peça da fila ou como peça nova), sai, ou fica.
6. **A fase 8 traz no máximo uma mudança do método**, e só se outra regra sai; o resto vai para o backlog. A medição
   fica com quatro linhas, e o relato é um por peça.
7. **Saem da fila** a F01d, a F13 e a F18, que vão para o backlog, e a F08, que já entrou na F01c. A F05 e a F12
   esperam. A F14 (modo leve) sobe.

## Consequências

- O que a [spec](../metodo/roteiro-spec.md) tratava sobre link simbólico, dono, concorrência, interrupção, nome cru
  na saída e erros juntos passa a ser lista de conferência do eixo de segurança da
  [revisão](../metodo/roteiro-entrega.md).
- Sai a regra 9 do ADR-0031 (toda spec diz qual linha muda e escreve no histórico dele).
- A mutação de propósito fica só no passo dos cenários.
- A jornada (`docs/conceitos/jornada.md`), que era só um ponteiro para o ADR-0031, sai; os links apontam para ele.
- O [ADR-0029](0029-mascote-no-terminal.md) fica adiado, sem peça que o construa, e o
  [ADR-0010](0010-fluxo-de-verificacao-inspirado-no-ranger.md) passa a aceito: o verificador rodou em quatro peças.
- A spec e o plano da F01d saem do repositório e ficam no histórico do Git.
- A pessoa aprovou a mudança da lista de peças com "aplique tudo"; o PRD não se aprova de novo por isso.
- Mais fácil: uma peça termina, e o que sobrou espera numa lista em vez de virar a próxima peça. Mais difícil: um
  defeito de borda pode passar da spec à revisão; a revisão em eixos e os testes seguem para pegá-lo.
