# F01d: Branch e projeto

- **Status:** rascunho, na fase 3
- **Data:** 2026-11-04

## Objetivo

Levar para a CLI as regras 3 a 5 do [ADR-0031](../../decisoes/0031-a-linha.md). Cada etapa anda numa branch criada
pela CLI a partir da `main`: o `open` cria a da funcionalidade, e dois comandos novos abrem as fases 1 e 2 do projeto,
cujas decisões passam a ficar em `.curupira/state/project.json`, com o pedido e o hash da F01c. O `status` mostra
"esperando merge" enquanto uma entrega ou uma aprovação do projeto não chegou à `main`.

## Linha

Muda as linhas 1, 2, 3 e 8 do ADR-0031. Nas linhas 1 e 2, a CLI passa a criar a branch da etapa (`project/adopt` e
`project/prd`) e a gravar a decisão, com o pedido e o hash, no `project.json`. Na linha 3, o `open` passa a criar a
branch. Na linha 8, o `status` passa a mostrar "esperando merge". O que a pessoa e o agente fazem em cada linha não
muda. O ADR-0031 ganha uma linha no histórico.

## Requisitos

- **R1.** QUANDO o agente roda `curupira open <ID>`, O SISTEMA DEVE criar a branch `feat/<ID>` a partir da `main`,
  passar a ela e só então gravar nela o estado da funcionalidade, qualquer que seja a branch de onde o comando rodou;
  se a gravação falhar, DEVE voltar à branch de origem e apagar a branch nova.
- **R2.** SE `open`, `adopt` ou `prd` roda com mudança sem commit (fora do que o Git ignora, inclusive na pasta de
  dados), sem a branch `main`, com a branch da etapa já existente e com commits que a `main` não tem, ou com o Git
  falhando, ENTÃO O SISTEMA DEVE recusar sem criar branch nem gravar estado, e dizer o motivo.
- **R3.** QUANDO o agente roda `curupira adopt` ou `curupira prd`, O SISTEMA DEVE criar a branch da etapa a partir da
  `main`, passar a ela e gravar no `project.json` a fase aberta (1 ou 2), mantendo as decisões anteriores.
- **R4.** SE `prd` roda sem uma aprovação da fase 1 no `project.json` da `main`, ou `adopt` ou `prd` rodam com a
  branch da outra fase do projeto em andamento (com commits que a `main` não tem), ENTÃO O SISTEMA DEVE recusar sem
  criar branch e dizer o que falta.
- **R5.** QUANDO `request project`, `approve project` ou `reject project` roda com uma fase do projeto aberta, O
  SISTEMA DEVE seguir as regras da F01c (o pedido, a resposta posterior, o conteúdo conferido no `approve`, o teto do
  motivo), com o que se aprova em cada fase (abaixo); a aprovação fecha a fase, e a recusa a mantém aberta.
- **R6.** ENQUANTO uma fase do projeto está aberta, O SISTEMA DEVE mostrar no `status` a fase do projeto e que ela
  espera aprovação.
- **R7.** ENQUANTO a branch atual não é a `main`, O SISTEMA DEVE mostrar no `status` "esperando merge" para cada
  funcionalidade entregue nela que não está entregue na `main`, e para cada aprovação do projeto nela que não está no
  `project.json` da `main` (a mesma fase com a mesma hora; só as aprovações contam), lendo a `main` pelo Git, sem gravar nada; sem a branch
  `main`, DEVE dizer que não comparou.

Entre os erros do `open`, vale a ordem: o ID, a funcionalidade já aberta ou entregue na `main`, a mudança sem commit, a
`main` que falta, a branch em andamento. No `adopt` e no `prd`: a mudança sem commit, a `main` que falta, a branch da
etapa em andamento, a da outra fase em andamento e, no `prd`, a aprovação da fase 1 na `main` (basta uma, de qualquer
adoção). Uma branch da etapa que já existe e não tem commit fora da `main` (a de uma etapa já mesclada) é recriada a
partir da `main`, e não recusada; se a pessoa está nela, a CLI passa antes à `main`.

O que conta como resposta para o projeto segue a F01b, com `project` no lugar do ID: "sim" e "sim project" aprovam;
"sim F09" e "sim projeto" não, e a CLI pede o "sim" de novo; "não, falta o limite de tamanho" e "não project, falta o limite" recusam com o motivo.
`open project` e `advance project` são recusados como ID inválido.

## O `project.json`

| Campo       | O que guarda                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `phase`     | a fase aberta do projeto, 1 ou 2; ausente quando nenhuma está aberta                            |
| `decisions` | as decisões das fases 1 e 2, no formato das da F01c, com a hora do pedido, os caminhos e o hash |
| `request`   | o pedido aberto, como na F01c, com `paths` (os caminhos) no lugar de `path`                     |

| Fase | O que se aprova                                    | Hash                                                                                           |
| ---- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1    | `.curupira/profile.json`                           | o SHA-256 do arquivo                                                                           |
| 2    | `docs/product/prd.md` e `docs/product/features.md` | o SHA-256 do texto `<SHA-256 do prd.md>\n<SHA-256 do features.md>\n`, em hexadecimal minúsculo |

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
- **Ponto de partida:** o estado de outra funcionalidade, a F10, gravado e sem commit.
- **Ação:** `curupira open F09`.
- **Resultado esperado:** o comando termina com erro e cita o arquivo da F10; a branch atual e a lista de branches não
  mudam, e não há estado da F09.

### C3. A adoção grava a decisão no `project.json`

- **Cobre:** R3, R5.
- **Ponto de partida:** a `main` sem `project.json`.
- **Ação:** `curupira adopt`; o agente grava o `.curupira/profile.json` e faz o commit; `curupira request project`; o
  "sim" passa pelo hook; `curupira approve project`.
- **Resultado esperado:** a branch atual é `project/adopt`; o `project.json` tem a decisão da fase 1, com a hora do
  pedido, o caminho e o SHA-256 do `profile.json`, e nenhuma fase aberta.

### C4. O PRD não abre antes de a adoção chegar à `main`

- **Cobre:** R4.
- **Ponto de partida:** a adoção aprovada na branch `project/adopt`, ainda sem merge na `main`.
- **Ação:** `curupira prd`.
- **Resultado esperado:** o comando termina com erro, diz que a adoção precisa estar aprovada na `main`, e nenhuma
  branch nasce.

### C5. A entrega espera o merge

- **Cobre:** R7.
- **Ponto de partida:** a F09 entregue na branch `feat/F09`, com o commit da entrega, e a `main` sem ele.
- **Ação:** `curupira status` na `feat/F09`; depois, o merge na `main` e `curupira status` na `main`.
- **Resultado esperado:** na `feat/F09`, a F09 aparece como entregue e esperando merge; na `main`, como entregue,
  sem a espera; nenhum arquivo muda.

## Fora do escopo

- Recusar os comandos de uma etapa fora da branch dela (F05; risco aceito no ADR-0031). Fora da branch, o estado da
  etapa não existe, e o comando já falha por isso.
- A barreira do `open` (o perfil e o PRD aprovados na `main`) e o conteúdo do `profile.json` (F02, que volta a ser
  escrita sobre o `project.json`); a entrevista e o conteúdo do PRD (F06).
- O `project.json` deste repositório, que nasce quando o Curupira se adotar, depois da F02; até lá, as aprovações do
  PRD ficam nos relatos e no histórico do PRD.
- Abrir o PR, buscar a `main` do servidor e o merge: o agente abre o PR, e o merge é da pessoa.
- Ver da `main` o que anda nas outras branches (F15) e apagar branches antigas.
- Outro nome para a `main` ou outro prefixo de branch pelo perfil (F02).

## Dados pessoais

Os mesmos da F01b e da F01c: o nome de autor do Git e o texto digitado na decisão, agora também no `project.json`.

## Decisões

- **Os nomes das branches:** `feat/<ID>` para uma funcionalidade, como as deste repositório, e `project/adopt` e
  `project/prd` para as fases 1 e 2, com o prefixo que separa as do projeto das da pessoa.
- **Uma branch mesclada se recria.** A adoção volta a cada parte nova da ficha (regra 2 do ADR-0031), e a branch da
  vez anterior continua existindo depois do merge; recriá-la a partir da `main` evita que a pessoa a apague à mão. Uma
  branch com commits fora da `main` é trabalho em andamento e é recusada.
- **O `open` não ignora a pasta de dados.** A troca de branch levaria junto o estado sem commit de outra
  funcionalidade, ao contrário do `request` da F01c, que grava ali.
- **"Já aberta ou entregue" se lê na `main`**, de onde a branch nasce, e não na branch atual.
- **O projeto se chama `project`** nos comandos que já existem, porque não é um ID de funcionalidade e não colide com
  um.
- **O hash da fase 2 cobre os dois arquivos** que a regra 6 do ADR-0031 cita, e a decisão guarda os dois caminhos.
  Como na fase 4, o pedido confere os arquivos, e não o commit; fazer o commit antes do pedido é do agente.
- **O `project.json` se lê e se grava pelo caminho do estado da F01a**, com os mesmos erros (ilegível, malformado,
  link, gravação pela metade); um `project.json` da `main` malformado é estado inválido, citando a `main`.

## Riscos aceitos

- **A `main` local pode estar atrás da do servidor**, e a branch nascer de um commit velho. Buscar a `main` antes de
  abrir fica com o agente, até a F03.
- **Sem trava entre comandos**, como na F01c: dois `open` ao mesmo tempo podem disputar a branch.
- **Só o merge com commit de merge reconhece a branch como mesclada.** Num merge por squash ou rebase, os commits da
  branch não chegam à `main`, e ela parece em andamento: a recusa diz como apagá-la. Este repositório usa o merge com
  commit.
- **Um projeto cuja branch principal não se chama `main`** não consegue abrir etapas até a F02 deixar o nome no perfil.

## Histórico

- 2026-11-04: rascunho.
- 2026-11-04: contraditório em duas rodadas, com 34 achados (17 da Completude e 11 da Necessidade na primeira; 6 na
  segunda). A peça não se dividiu: a Completude propôs uma F01e, e a Necessidade mostrou que, com os cortes, ela cabe
  folgada no limite. Saíram: a recusa dos comandos fora da branch da etapa (para a F05), o `project.json` deste
  repositório montado à mão (para quando o Curupira se adotar) e o requisito do `project.json` malformado, que virou
  decisão. Entraram: "já aberta ou entregue" lido na `main`; a pasta de dados conta como mudança no `open`; a branch
  mesclada recriada, com a passagem à `main`; a gravação que falha desfaz a branch; os prefixos `project/`; o formato
  do `project.json` e o hash exato da fase 2; a lista de respostas com `project`; a ordem dos erros do `adopt` e do
  `prd`. Riscos aceitos: o squash e o rebase. O destino de cada achado está no
  [relato](../../pesquisa/relatos/2026-11-04-fase-3-f01d.md).
