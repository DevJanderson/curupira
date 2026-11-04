# F01d: Branch e projeto

- **Status:** rascunho, na fase 3
- **Data:** 2026-11-04

## Objetivo

Levar para a CLI as regras 3 a 5 do [ADR-0031](../../decisoes/0031-a-linha.md). Cada etapa anda numa branch criada
pela CLI a partir da `main`: o `open` cria a da funcionalidade, e dois comandos novos abrem as fases 1 e 2 do projeto,
cujas decisões passam a ficar em `.curupira/state/project.json`, com o pedido e o hash da F01c. Os comandos de uma
etapa só rodam na branch dela, e o `status` mostra "esperando merge" enquanto uma entrega ou uma aprovação do projeto
não chegou à `main`.

## Linha

Muda as linhas 1, 2, 3 e 8 do ADR-0031. Nas linhas 1 e 2, a CLI passa a criar a branch da etapa (`adopt` e `prd`) e a
gravar a decisão, com o pedido e o hash, no `project.json`. Na linha 3, o `open` passa a criar a branch. Na linha 8, o
`status` passa a mostrar "esperando merge". O que a pessoa e o agente fazem em cada linha não muda. O ADR-0031 ganha
uma linha no histórico. A barreira do `open` (o perfil e o PRD aprovados na `main`) fica com a F02.

## Requisitos

- **R1.** QUANDO o agente roda `curupira open <ID>`, O SISTEMA DEVE criar a branch `feat/<ID>` a partir da `main`,
  passar a ela e só então gravar o estado da funcionalidade nela, qualquer que seja a branch de onde o comando rodou.
- **R2.** SE `open`, `adopt` ou `prd` roda com mudança sem commit (fora do que o Git ignora), sem a branch `main`, com
  a branch da etapa já existente ou com o Git falhando, ENTÃO O SISTEMA DEVE recusar sem criar branch nem gravar
  estado, e dizer o motivo.
- **R3.** SE `advance`, `request`, `approve` ou `reject` roda fora da branch da etapa (`feat/<ID>` para uma
  funcionalidade; `adopt` ou `prd` para a fase aberta do projeto), ENTÃO O SISTEMA DEVE recusar sem mudar o estado e
  dizer em que branch rodar.
- **R4.** QUANDO o agente roda `curupira adopt` ou `curupira prd`, O SISTEMA DEVE criar a branch da etapa a partir da
  `main`, passar a ela e gravar no `project.json` a fase aberta (1 ou 2), mantendo as decisões anteriores.
- **R5.** SE `prd` roda sem uma aprovação da fase 1 no `project.json` da `main`, ou `adopt` ou `prd` rodam com uma fase
  do projeto já aberta, ENTÃO O SISTEMA DEVE recusar sem criar branch e dizer o que falta.
- **R6.** QUANDO `request project`, `approve project` ou `reject project` roda com uma fase do projeto aberta, O
  SISTEMA DEVE seguir as regras da F01c (o pedido, a resposta posterior, o conteúdo conferido, o teto do motivo), com
  o hash do `.curupira/profile.json` na fase 1 e o do `docs/product/prd.md` com o `docs/product/features.md` na fase
  2, e os caminhos; a aprovação fecha a fase, e a recusa a mantém aberta.
- **R7.** ENQUANTO uma fase do projeto está aberta, O SISTEMA DEVE mostrar no `status` a fase do projeto e que ela
  espera aprovação.
- **R8.** ENQUANTO a branch atual não é a `main`, O SISTEMA DEVE mostrar no `status` "esperando merge" para cada
  funcionalidade entregue nela que não está entregue na `main`, e para cada aprovação do projeto nela que não está na
  `main`, lendo a `main` pelo Git, sem gravar nada.
- **R9.** SE o `project.json` está malformado, ENTÃO O SISTEMA DEVE recusar como estado inválido, dizendo o arquivo e
  o problema, como no estado de uma funcionalidade.

Entre os erros do `open`, vale a ordem: o ID, a funcionalidade já aberta ou entregue, a mudança sem commit, a `main`
que falta, a branch que já existe. Entre os de `request`, `approve` e `reject`, a branch vem logo depois da fase e
antes do pedido.

## Cenários

Cada cenário roda contra a CLI real, num repositório Git descartável com a branch `main` e um commit. A mensagem
digitada entra pelo hook, como na F01b.

### C1. O `open` cria a branch a partir da `main`

- **Cobre:** R1.
- **Ponto de partida:** o repositório está numa outra branch, `outra`, com um commit que a `main` não tem.
- **Ação:** `curupira open F09`.
- **Resultado esperado:** a branch atual é `feat/F09`, que nasce no commit da `main`, sem o commit de `outra`, e o
  estado da F09 está nela, na fase 3.

### C2. Com mudança sem commit, o `open` não faz nada

- **Cobre:** R2.
- **Ponto de partida:** um arquivo do projeto mudado e sem commit.
- **Ação:** `curupira open F09`.
- **Resultado esperado:** o comando termina com erro e cita o arquivo; a branch atual e a lista de branches não
  mudam, e não há estado da F09.

### C3. A adoção grava a decisão no `project.json`

- **Cobre:** R4, R6.
- **Ponto de partida:** a `main` sem `project.json`.
- **Ação:** `curupira adopt`; o agente grava o `.curupira/profile.json` e faz o commit; `curupira request project`; o
  "sim" passa pelo hook; `curupira approve project`.
- **Resultado esperado:** a branch atual é `adopt`; o `project.json` tem a decisão da fase 1, com a hora do pedido, o
  caminho e o SHA-256 do `profile.json`, e nenhuma fase aberta.

### C4. O PRD não abre antes de a adoção chegar à `main`

- **Cobre:** R5.
- **Ponto de partida:** a adoção aprovada na branch `adopt`, ainda sem merge na `main`.
- **Ação:** `curupira prd`.
- **Resultado esperado:** o comando termina com erro, diz que a adoção precisa estar aprovada na `main`, e nenhuma
  branch nasce.

### C5. A entrega espera o merge

- **Cobre:** R8.
- **Ponto de partida:** a F09 entregue na branch `feat/F09`, com o commit da entrega, e a `main` sem ele.
- **Ação:** `curupira status` na `feat/F09`; depois, o merge na `main` e `curupira status` na `main`.
- **Resultado esperado:** na `feat/F09`, a F09 aparece como entregue e esperando merge; na `main`, como entregue,
  sem a espera; nenhum arquivo muda.

## Fora do escopo

- A barreira do `open` (o perfil e o PRD aprovados na `main`) e o conteúdo do `profile.json` (F02); a entrevista e o
  conteúdo do PRD (F06).
- Abrir o PR, buscar a `main` do servidor e o merge: o agente abre o PR, e o merge é da pessoa.
- Ver da `main` o que anda nas outras branches (F15).
- Escolher outro nome para a `main` ou outro prefixo de branch pelo perfil (F02).
- Apagar branches antigas.

## Dados pessoais

Os mesmos da F01b e da F01c: o nome de autor do Git e o texto digitado na decisão, agora também no `project.json`.

## Decisões

- **Os nomes das branches:** `feat/<ID>` para uma funcionalidade, como as deste repositório, e `adopt` e `prd` para as
  fases 1 e 2, com os nomes dos comandos que as abrem. Uma branch que já existe é recusada, e não reaproveitada: a
  pessoa decide se a apaga.
- **A `main` local.** A branch nasce da `main` deste clone; buscar a do servidor antes é do agente, como hoje.
- **O projeto se chama `project`** nos comandos que já existem (`request project`, `approve project`,
  `reject project`), porque não é um ID de funcionalidade (`F` e dígitos) e não colide com um.
- **O hash da fase 2 cobre os dois arquivos** que a regra 6 do ADR-0031 cita, o `prd.md` e o `features.md`; a decisão
  guarda os dois caminhos.
- **A adoção pode voltar.** O `adopt` abre a fase 1 de novo mesmo com uma adoção já aprovada, porque a ficha cresce com
  as peças e cada parte nova pede um "sim" novo (regra 2 do ADR-0031); as decisões anteriores ficam.
- **"Esperando merge" se lê, não se grava**, comparando o estado da branch atual com o da `main` pelo Git (regra 5).
  Sem a branch `main`, o `status` mostra o estado sem a comparação.
- **O `project.json` deste repositório** é montado uma vez, à mão, a partir dos relatos, com as duas aprovações do PRD
  (2026-11-03 e 2026-11-04), como a F01c fez com a F01a e a F01b. É a mesma exceção ao escritor único
  ([ADR-0011](../../decisoes/0011-painel-aceita-decisoes-humanas.md)).

## Riscos aceitos

- **A `main` local pode estar atrás da do servidor**, e a branch nascer de um commit velho. Buscar a `main` antes de
  abrir fica com o agente, até a F03.
- **Sem trava entre comandos**, como na F01c: dois `open` ao mesmo tempo podem disputar a branch.
- **Um projeto cuja branch principal não se chama `main`** não consegue abrir etapas até a F02 deixar o nome no perfil.

## Histórico

- 2026-11-04: rascunho.
