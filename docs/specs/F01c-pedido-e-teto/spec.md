# F01c: Pedido e teto

- **Status:** na aprovação da fase 4
- **Data:** 2026-11-04

## Objetivo

Amarrar cada aprovação ao que a pessoa viu ([ADR-0031](../../decisoes/0031-a-linha.md), regras 6 a 8). Antes de pedir
a resposta, o agente registra o pedido pela CLI, que guarda a hora e o hash do que vai ser aprovado; a CLI só aceita
uma resposta digitada depois do pedido, e a aprovação recusa um conteúdo que mudou depois dele. O motivo de cada
recusa ganha um teto. A F01a e a F01b, feitas antes de o estado existir, ganham o estado delas, montado a partir dos
relatos.

## Linha

Muda as linhas 4, 7 e 8 do ADR-0031. Na coluna "Fica registrado", a linha 4 já pede a hora do pedido e o hash do
`spec.md`, e a 7, a hora do pedido e o commit revisado; hoje, nada disso é gravado. A linha 8 passa a pedir também a
hora do pedido e o commit, como a regra 6 manda. Na entrega, a F01c entra nas peças da linha 7, e o ADR-0031 ganha uma
linha no histórico. As fases 1 e 2 e o `project.json` ficam com a F01d.

## Requisitos

- **R1.** QUANDO o agente roda `curupira request <ID>` numa fase com aprovação, O SISTEMA DEVE gravar no estado da
  funcionalidade o pedido, com a fase, a hora e o hash do que se aprova (na fase 4, o caminho e o SHA-256 do
  `spec.md`; nas fases 7 e 8, o commit da branch), no lugar de um pedido anterior, e dizer o que foi pedido.
- **R2.** SE `request` roda numa fase sem aprovação; ou o `spec.md` da funcionalidade não existe, existe em mais de uma
  pasta, não é um arquivo comum ou não pode ser lido; ou, nas fases 7 e 8, não há commit, o Git falha ou há mudança
  sem commit fora de `.curupira/`, ENTÃO O SISTEMA DEVE recusar sem gravar e dizer o caminho ou o motivo.
- **R3.** SE `approve` ou `reject` roda sem um pedido da fase atual, ENTÃO O SISTEMA DEVE recusar sem mudar o estado e
  dizer que o pedido vem antes.
- **R4.** SE a resposta digitada que sustentaria `approve` ou `reject` não é posterior ao pedido, ENTÃO O SISTEMA DEVE
  recusar sem mudar o estado e dizer que a pessoa precisa responder de novo.
- **R5.** SE `approve` roda e o que se aprova mudou desde o pedido (outro hash do `spec.md`, um `spec.md` que sumiu,
  outro commit ou mudança sem commit fora de `.curupira/`), ENTÃO O SISTEMA DEVE recusar sem mudar o estado e dizer
  que é preciso um pedido novo.
- **R6.** QUANDO `approve` ou `reject` grava a decisão, O SISTEMA DEVE guardar nela a hora e o hash do pedido (e, na
  fase 4, o caminho do `spec.md`) e tirar o pedido do estado.
- **R7.** QUANDO o motivo de uma recusa passa de 280 caracteres, O SISTEMA DEVE gravar os primeiros 279 e "…".
- **R8.** O SISTEMA DEVE continuar lendo os estados gravados antes da F01c: decisões sem pedido e motivos com mais de
  280 caracteres valem como estão.

Exemplos do R7: um motivo de 280 caracteres fica inteiro; um de 281 vira 279 e "…"; uma letra com acento e um emoji
contam um caractere cada (o caractere é o ponto de código, e o emoji nunca se parte); os espaços das pontas saem antes
da contagem.

Entre os erros de `approve`, vale a ordem: a fase, o pedido, o conteúdo mudado, a sessão, a resposta e, por último, o
autor. O `reject` segue a mesma ordem sem o conteúdo: um "não" ao que a pessoa viu continua valendo.

## Cenários

Cada cenário roda contra a CLI real, num repositório Git descartável com um commit, com a funcionalidade e o `spec.md`
dela em `docs/specs/<ID>-<nome>/`. A mensagem digitada entra pelo hook, como na F01b.

### C1. O pedido e um "sim" depois dele aprovam

- **Cobre:** R1, R6.
- **Ponto de partida:** F09 na aprovação da fase 4, com o `spec.md`.
- **Ação:** `curupira request F09`; o "sim" passa pelo hook; `curupira approve F09`.
- **Resultado esperado:** a F09 vai à fase 5, e a decisão guarda a hora do pedido, o caminho e o SHA-256 do `spec.md`.

### C2. Sem pedido, a aprovação é recusada

- **Cobre:** R3.
- **Ponto de partida:** F09 na aprovação da fase 4, sem pedido; o "sim" passou pelo hook.
- **Ação:** `curupira approve F09`.
- **Resultado esperado:** o comando termina com erro, diz que o pedido vem antes, e o estado não muda.

### C3. Um "sim" anterior ao pedido não vale

- **Cobre:** R4.
- **Ponto de partida:** F09 na aprovação da fase 4; o "sim" passou pelo hook e, depois, o agente rodou `request`.
- **Ação:** `curupira approve F09`.
- **Resultado esperado:** o comando termina com erro, diz que a pessoa precisa responder de novo, e o estado não muda.

### C4. A spec mudada depois do pedido não é aprovada

- **Cobre:** R5.
- **Ponto de partida:** F09 com o pedido feito na fase 4; depois, o `spec.md` mudou, e o "sim" passou pelo hook.
- **Ação:** `curupira approve F09`.
- **Resultado esperado:** o comando termina com erro, diz que é preciso um pedido novo, e o estado não muda.

### C5. Um commit novo depois do pedido da revisão não é aprovado

- **Cobre:** R1, R5.
- **Ponto de partida:** F09 com o pedido feito na fase 7; depois, um commit novo entrou na branch, e o "sim" passou
  pelo hook.
- **Ação:** `curupira approve F09`.
- **Resultado esperado:** o comando termina com erro, diz que é preciso um pedido novo, e o estado não muda.

## Fora do escopo

- O `project.json`, as fases 1 e 2, a branch no `open`, conferir em que branch se está e o "esperando merge" (F01d).
- O pedido pelo painel (F16) e a medição do tempo até cada "sim", que usa a hora gravada aqui (F12).
- A recusa de uma spec com marca `[A ESCLARECER]` aberta (F07).
- Mostrar o pedido no `status` e o cartão de decisão, que é do agente
  ([ADR-0028](../../decisoes/0028-cartao-de-decisao.md)).
- A barreira que impede o agente de ler o estado sem a CLI (F03 e F05; risco aceito no ADR-0031).

## Dados pessoais

Os mesmos da F01b: o nome de autor do Git e o texto digitado na decisão. O teto do motivo diminui o que se grava
([ADR-0026](../../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md)).

## Decisões

- **Um pedido aberto por funcionalidade.** Um `request` novo substitui o anterior, para a resposta valer para o que a
  pessoa viu por último.
- **O pedido fica no estado da funcionalidade**, e não em `.curupira/local/`, porque é dele que a decisão tira a hora e
  o hash ([ADR-0026](../../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md)). Ele grava pelo mesmo
  caminho do estado da F01a, sem arquivo pela metade e com os mesmos erros de leitura e gravação.
- **O hash da fase 4 é o do `spec.md` só**, como manda o ADR-0026, com o caminho, como manda a regra 2 do
  [ADR-0023](../../decisoes/0023-estado-artefatos-e-dados-locais.md). O das fases 7 e 8 é o commit (o `HEAD`), porque
  a pessoa lê o PR. "Mudança sem commit" é o que o `git status` mostra fora de `.curupira/`, inclusive arquivo novo
  não ignorado; `.curupira/` não conta, porque o próprio pedido grava ali.
- **Só o motivo tem teto.** A resposta de uma aprovação é um "sim" puro (F01b, R2), que nunca chega perto de 280
  caracteres. O motivo longo é cortado, e não recusado: o ADR-0031 diz que o que passar do teto fica na conversa, e
  recusar faria a pessoa digitar de novo.
- **O estado da F01a e da F01b é a única escrita fora da CLI**, feita uma vez pelo agente a partir dos relatos, porque
  a CLI não grava decisão com data passada. É uma exceção ao escritor único
  ([ADR-0011](../../decisoes/0011-painel-aceita-decisoes-humanas.md)) que o ADR-0031 pede ao montar o estado a
  partir dos relatos; a CLI o lê e o confere como qualquer outro.
- **A transição.** A fase 4 da própria F01c se aprova sem pedido, pelo comando instalado, que ainda não tem o
  `request`. Nas fases 7 e 8 da F01c, o agente roda a CLI da branch, que já pede. Depois do merge, a pessoa roda o
  script de instalação de novo. A F02 só chega a uma aprovação depois da F01d.

## Riscos aceitos

- **O pedido não prova que a pessoa leu.** Ele prova só que a resposta veio depois de o conteúdo ficar pronto; o tempo
  até o "sim" fica como dado, sem barrar ([ADR-0028](../../decisoes/0028-cartao-de-decisao.md)).
- **Sem trava entre comandos.** Se `request` e `approve` rodarem ao mesmo tempo na mesma funcionalidade, a última
  gravação vence, como no resto do estado
  ([ADR-0026](../../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md), regra 5).
- **O commit aprovado pode não existir na `main`** se o merge for por squash ou rebase; a decisão guarda o hash da
  branch.
- **As horas da F01a e da F01b vêm dos relatos**, escritas à mão, com precisão de minuto.

## Histórico

- 2026-11-04: rascunho. A F01c se dividiu antes do rascunho: as regras 3 a 5 do ADR-0031 foram para a F01d.
- 2026-11-04: contraditório em duas rodadas, com 26 achados (15 da Completude e 8 da Necessidade na primeira; 3 na
  segunda). Na spec: a transição da própria F01c; o caminho do `spec.md` no pedido e na decisão; o que é "commit" e
  "mudança sem commit"; o `spec.md` que é pasta, link ou ilegível; "não posterior" no R4; o teto só no motivo, com a
  contagem por ponto de código; a ordem dos erros do `reject`; o C5 trocado pelo commit novo na fase 7; a linha 8 do
  ADR-0031. O R9 saiu dos requisitos: o estado da F01a e da F01b é um dado, gravado uma vez fora da CLI, como exceção
  dita nas decisões. Riscos aceitos: sem trava entre comandos e o commit que some num squash. No plano: os campos em
  inglês, as mensagens com `curupira request <ID>`, commitar antes do pedido, o `AGENTS.md` e o README. Recusados:
  mostrar o pedido no `status`, HEAD solto e submódulo, e juntar o C1 e o C3. O destino de cada achado está no
  [relato](../../pesquisa/relatos/2026-11-04-fase-3-f01c.md).
