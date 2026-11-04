# F01c: Pedido e teto

- **Status:** rascunho, na fase 3
- **Data:** 2026-11-04

## Objetivo

Amarrar cada aprovação ao que a pessoa viu ([ADR-0031](../../decisoes/0031-a-linha.md), regras 6 a 8). Antes de pedir
a resposta, o agente registra o pedido pela CLI, que guarda a hora e o hash do que vai ser aprovado; a CLI só aceita
uma resposta digitada depois do pedido, e a aprovação recusa um conteúdo que mudou depois dele. O texto de cada
decisão ganha um teto, e a F01a e a F01b, feitas antes do estado existir, ganham o estado delas.

## Linha

Muda as linhas 4, 7 e 8 do ADR-0031, cuja coluna "Fica registrado" já pede a hora do pedido, o hash do `spec.md` e o
commit revisado; hoje, nada disso é gravado. Na entrega, o ADR-0031 ganha uma linha no histórico. As fases 1 e 2 e o
`project.json` ficam com a F01d.

## Requisitos

- **R1.** QUANDO o agente roda `curupira request <ID>` numa fase com aprovação, O SISTEMA DEVE gravar no estado da
  funcionalidade o pedido, com a fase, a hora e o hash do que se aprova (o SHA-256 do `spec.md` na fase 4; o commit
  da branch nas fases 7 e 8), no lugar de um pedido anterior, e dizer o que foi pedido.
- **R2.** SE `request` roda numa fase sem aprovação, ou o `spec.md` da funcionalidade não existe ou existe em mais de
  uma pasta, ou, nas fases 7 e 8, há mudança sem commit fora de `.curupira/`, ENTÃO O SISTEMA DEVE recusar sem gravar
  e dizer por quê.
- **R3.** SE `approve` ou `reject` roda sem um pedido da fase atual, ENTÃO O SISTEMA DEVE recusar sem mudar o estado e
  dizer que o pedido vem antes.
- **R4.** SE a resposta digitada que sustentaria `approve` ou `reject` é anterior ao pedido, ENTÃO O SISTEMA DEVE
  recusar sem mudar o estado e dizer que a pessoa precisa responder de novo.
- **R5.** SE `approve` roda e o que se aprova mudou desde o pedido (outro hash do `spec.md`, outro commit ou mudança
  sem commit fora de `.curupira/`), ENTÃO O SISTEMA DEVE recusar sem mudar o estado e dizer que é preciso um pedido
  novo.
- **R6.** QUANDO `approve` ou `reject` grava a decisão, O SISTEMA DEVE guardar nela a hora e o hash do pedido e tirar
  o pedido do estado.
- **R7.** QUANDO a resposta ou o motivo a gravar passa de 280 caracteres, O SISTEMA DEVE gravar os primeiros 279 e
  "…".
- **R8.** O SISTEMA DEVE continuar lendo os estados gravados antes da F01c: decisões sem pedido e textos com mais de
  280 caracteres valem como estão.
- **R9.** O SISTEMA DEVE mostrar no `status` a F01a e a F01b como entregues, com as decisões que os relatos delas
  registram.

Entre os erros de `approve`, vale a ordem: a fase, o pedido, o conteúdo mudado, a sessão, a resposta e, por último, o
autor. O `reject` não confere o conteúdo: um "não" ao que a pessoa viu continua valendo.

## Cenários

Cada cenário roda contra a CLI real, num repositório Git descartável, com a funcionalidade e o `spec.md` dela em
`docs/specs/<ID>-<nome>/`. A mensagem digitada entra pelo hook, como na F01b.

### C1. O pedido e um "sim" depois dele aprovam

- **Cobre:** R1, R6.
- **Ponto de partida:** F09 na aprovação da fase 4, com o `spec.md`.
- **Ação:** `curupira request F09`; o "sim" passa pelo hook; `curupira approve F09`.
- **Resultado esperado:** a F09 vai à fase 5, e a decisão guarda a hora do pedido e o SHA-256 do `spec.md`.

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
- **Ponto de partida:** F09 com o pedido feito; depois, o `spec.md` mudou, e o "sim" passou pelo hook.
- **Ação:** `curupira approve F09`.
- **Resultado esperado:** o comando termina com erro, diz que é preciso um pedido novo, e o estado não muda.

### C5. Um motivo longo é cortado no teto

- **Cobre:** R7.
- **Ponto de partida:** F09 na aprovação da fase 7, com o pedido feito; um "não" com motivo de 400 caracteres passou
  pelo hook.
- **Ação:** `curupira reject F09`.
- **Resultado esperado:** a F09 volta à fase 5, e o motivo gravado tem 280 caracteres, terminando em "…".

## Fora do escopo

- O `project.json`, as fases 1 e 2, a branch no `open` e o "esperando merge" (F01d).
- O pedido feito pelo painel (F16) e a medição do tempo até cada "sim", que usa a hora gravada aqui (F12).
- A recusa de uma spec com marca `[A ESCLARECER]` aberta (F07).
- Mostrar o cartão de decisão: o pedido só registra; o cartão é do agente
  ([ADR-0028](../../decisoes/0028-cartao-de-decisao.md)).

## Dados pessoais

Os mesmos da F01b: o nome de autor do Git e o texto digitado na decisão. O teto de 280 caracteres diminui o que se
grava ([ADR-0026](../../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md)).

## Decisões

- **Um pedido aberto por funcionalidade.** Um `request` novo substitui o anterior, para a resposta valer para o que a
  pessoa viu por último.
- **O pedido fica no estado da funcionalidade**, e não em `.curupira/local/`, porque é dele que a decisão tira a hora e
  o hash; ao virar decisão, ele sai ([ADR-0026](../../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md)).
- **O hash da fase 4 é o do `spec.md` só**, como manda o ADR-0026; o da 7 e da 8 é o commit, porque a pessoa lê o PR.
  Mudanças em `.curupira/` não contam, porque o próprio pedido grava ali.
- **O texto longo é cortado, e não recusado**: o ADR-0031 diz que o que passar do teto fica na conversa, e recusar
  faria a pessoa digitar o motivo de novo.
- **O estado da F01a e da F01b é gravado uma vez, à mão, pelo agente**, a partir dos relatos, como manda o ADR-0031; a
  CLI é quem o lê e o confere.

## Riscos aceitos

- **O pedido não prova que a pessoa leu.** Ele prova só que a resposta veio depois de o conteúdo ficar pronto; o tempo
  até o "sim" fica como dado, sem barrar ([ADR-0028](../../decisoes/0028-cartao-de-decisao.md)).
- **As horas da F01a e da F01b vêm dos relatos**, escritas à mão, com precisão de minuto.

## Histórico

- 2026-11-04: rascunho. A F01c se dividiu antes do rascunho: as regras 3 a 5 do ADR-0031 foram para a F01d.
