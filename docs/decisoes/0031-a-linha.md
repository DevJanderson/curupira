# ADR-0031: A linha

- **Status:** aceita
- **Data:** 2026-11-04

## Contexto

A [revisão do fluxo inteiro](../pesquisa/relatos/2026-11-04-revisao-do-fluxo.md) achou a linha quebrada nas duas
pontas. Não há o comando `curupira` (fase 0). O `init` tinha quatro sentidos, e a adoção estava espalhada em quatro
peças (fase 1). A aprovação do PRD não tem onde ser gravada (fase 2). A entrega não se liga ao merge, e o estado não
chega à `main` (fase 8). O meio, das fases 3 a 7, anda, mas quase tudo à mão.

As causas apontadas:

- as funcionalidades foram cortadas por capacidade, e não pela linha;
- a jornada deixou de ser a fonte única, porque os roteiros mudaram o método sem mudá-la,
  apesar da regra do [ADR-0015](0015-jornada-de-9-fases-e-5-aprovacoes.md);
- o contraditório olha só a peça;
- a linha nunca rodou de ponta a ponta.

A pessoa decidiu cinco nós, registrados no relato: quem toca a CLI, o que é a adoção, onde ficam as decisões do
projeto, estado, branch e entrega, e a instalação mínima.

## Opções consideradas

- **Manter a jornada como página de conceito, com o ADR-0015 apontando para ela.** É o que existe, e foi o que deixou
  a jornada para trás: mudar um roteiro não obrigava a olhar a tabela.
- **Um ADR que contém a linha**, com quem age, o que fica registrado e a peça de cada etapa. Mudar a linha passa a
  ser mudar este ADR, com uma linha no histórico.
- **Um documento de método fora dos ADRs.** Seria a jornada de novo, com outro nome.

## Decisão

A linha mora neste ADR. A jornada passa a apontar para cá, e o ADR-0015 é substituído por este.

### A linha

★ marca uma aprovação.

| #   | Etapa               | Pessoa                                                                            | Agente e CLI                                                                                                | Fica registrado                                                                     | Peças                |
| --- | ------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------- |
| 0   | Instalar e preparar | instala o Curupira com o script `curl`, uma vez por máquina; roda `curupira init` | —                                                                                                           | o hook das respostas e a linha do `.gitignore`; nenhuma decisão                     | F00, F03             |
| 1 ★ | Adotar o projeto    | pede a adoção; confere o cartão; digita "sim" ou "não"                            | lê o projeto e propõe a ficha do projeto (o perfil), que cresce com as peças                                | `.curupira/profile.json` (o conteúdo) e a decisão em `.curupira/state/project.json` | F02, F03, F04a, F05  |
| 2 ★ | Produto (PRD)       | responde à entrevista; digita "sim" ou "não"                                      | conduz a entrevista ([roteiro do PRD](../metodo/roteiro-prd.md)) e divide em funcionalidades                | `docs/product/` e a decisão no `project.json`                                       | F06                  |
| 3   | Especificar         | responde até 5 perguntas                                                          | `open` cria o estado e a branch; spec, plano e contraditório ([roteiro da spec](../metodo/roteiro-spec.md)) | `docs/specs/<ID>-<nome>/spec.md` e `plan.md`; `.curupira/state/<ID>.json`           | F01a, F01d, F07      |
| 4 ★ | Aprovar a spec      | confere o cartão; digita "sim" ou "não"                                           | pede a aprovação e mostra o cartão ([ADR-0028](0028-cartao-de-decisao.md))                                  | a decisão, com a hora do pedido e o hash do `spec.md`                               | F01b, F01c           |
| 5   | Implementar         | acompanha, se quiser                                                              | testes primeiro, passo a passo, com as checagens a cada passo                                               | código e testes na branch                                                           | F04a, F09            |
| 6   | Verificar           | só é chamada se o veredito for "bloqueado"                                        | o verificador separado roda os cenários; o agente corrige até passar, com limite                            | `verification.md`                                                                   | F10                  |
| 7 ★ | Revisar             | lê o PR e o cartão; digita "sim" ou "não"                                         | revisão em eixos, um deles com outro olhar ([roteiro da entrega](../metodo/roteiro-entrega.md)); abre o PR  | a decisão, com a hora do pedido e o commit revisado                                 | F01c, F11            |
| 8 ★ | Entregar            | escolhe as melhorias; digita "sim"; faz o merge                                   | atualiza docs; cenários viram testes; mede; propõe o que entra e o que sai do método                        | a decisão, com a hora do pedido e o commit; "entregue" e a medição, na branch       | F01c, F01d, F12, F13 |

Quem clona um projeto que já adotou o Curupira faz só a fase 0. Se a pessoa pede mudanças na fase 7, a
funcionalidade volta à 5, ou à 3 se a mudança alterar a spec.

### As regras da linha

1. **A fase 0 é da pessoa; o resto é da conversa.** A pessoa roda a instalação e o `init`. O `init` liga o hook das
   respostas, põe `.curupira/local/` no `.gitignore` e, com a F03, põe as skills, que são da ferramenta e ficam fora do
   Git ([ADR-0024](0024-o-que-fica-na-maquina-e-no-projeto.md)). Ele serve a quem adota e a quem clona, pode rodar de
   novo sem estragar nada e não grava decisão. Rodá-lo é o ato que autoriza o hook das respostas; os hooks que barram
   ações (F05) entram pela ficha, com o "sim" da fase 1. Da fase 1 em diante, a pessoa pede, responde e decide digitando
   ([ADR-0025](0025-a-pessoa-decide-pela-conversa.md)), e o agente roda a CLI. Os comandos que só leem (`curupira` sem
   argumentos e `status`) servem aos dois.
2. **A adoção é uma ficha só.** O perfil ganha partes com as peças (a instrução do agente no `AGENTS.md`, as checagens,
   os hooks), e cada parte nova pede a ficha inteira de novo, com um "sim" novo. Cada checagem aparece como um item no
   cartão.
3. **As decisões do projeto ficam em `.curupira/state/project.json`**, como as de uma funcionalidade ficam no arquivo
   dela. O perfil e o PRD guardam só o conteúdo. Nenhuma funcionalidade abre sem o perfil e o PRD aprovados na `main`.
4. **Cada etapa anda numa branch e chega à `main` por um PR que o agente abre e a pessoa junta.** A CLI cria a branch no
   começo da etapa, sempre a partir da `main`: o `open` na fase 3 e o primeiro comando das fases 1 e 2. Cada
   funcionalidade tem um PR só, com spec, plano, estado, código e verificação. As fases 1 e 2 andam uma por vez, e a
   seguinte começa depois do merge da anterior; as funcionalidades andam em paralelo, cada uma na sua branch.
5. **A entrega se liga ao merge.** O "sim" da fase 8 grava "entregue" e a medição na branch, e o merge leva isso à
   `main`. Enquanto a branch não chega à `main`, o `status` rodado nela mostra "esperando merge", lido do Git, sem
   gravar nada; o mesmo vale para as fases 1 e 2. Ver da `main` o que anda nas outras branches fica com o painel (F15).
6. **Toda aprovação tem um pedido.** Antes de pedir a resposta, o agente registra o pedido pela CLI, que guarda a hora e
   o hash do que vai ser aprovado: o `profile.json` na fase 1, o `prd.md` e o `features.md` na 2, o `spec.md` na 4 e o
   commit da branch na 7 e na 8. A CLI só aceita uma resposta digitada depois do pedido, e a decisão vale para o
   conteúdo daquele hash. Isso impede que um "sim" antigo aprove o que veio depois, amarra o "sim" ao que a pessoa viu e
   dá o tempo até cada "sim" que a medição promete.
7. **Cada decisão tem teto de texto.** O motivo de uma recusa fica gravado com até 280 caracteres; o que passar disso
   fica na conversa. A resposta de uma aprovação é um "sim" puro e não precisa de teto. O agente lê o estado só pela CLI, e não os arquivos.
8. **A máquina confere o que pode.** O `advance` da fase 3 recusa uma spec com marca `[A ESCLARECER]` aberta, e a
   aprovação recusa um conteúdo que mudou depois do pedido. O hash fica na decisão, como pede a regra 2 do
   [ADR-0023](0023-estado-artefatos-e-dados-locais.md).
9. _Retirada pelo [ADR-0032](0032-parar-a-recursao.md)._ Ela pedia que toda spec dissesse qual linha desta tabela
   muda e escrevesse no histórico deste ADR.

## Consequências

- A linha tem uma fonte só. O ADR-0015 passa a "substituída por ADR-0031", e a jornada vira um ponteiro para cá
  (apagado depois, pelo [ADR-0032](0032-parar-a-recursao.md)).
- Duas peças novas entram na lista de funcionalidades, que se reordena pela linha: a **F00 Instalar e preparar** (a fase
  0, com o script de instalação por `curl` e o `init`) e a **F01c A linha no estado** (as regras 3 a 7 e a conferência
  do hash da regra 8 na CLI, com o estado da F01a e da F01b montado a partir dos relatos). A ordem começa por F00, F01c
  e F02. A F08 entra na F01c, porque o hash passa a valer para toda aprovação; a F09 perde a branch, e a F12, o "depois
  do merge".
- O [ADR-0009](0009-instalacao-por-curl.md) deixa de ser adiado e muda: a instalação é um script baixado por `curl` do
  repositório no GitHub, pelo endereço do próprio GitHub (`raw.githubusercontent.com`), sem domínio próprio. O script
  confere o Node e o Git, baixa o Curupira do GitHub para a máquina, instala as dependências e põe o comando `curupira`
  no caminho. Não há npm nem domínio: publicar no npm, reservar o nome, ter um domínio e o binário por sistema ficam
  fora até a pessoa decidir.
- A F02 volta à fase 3 com a linha nova: a entrega da proposta deixa de se chamar `init`, e a decisão vai para o
  `project.json`.
- Ajusta outros ADRs, com uma linha no histórico de cada um:
  - [ADR-0023](0023-estado-artefatos-e-dados-locais.md): o `init`, e não a adoção, põe `.curupira/local/` no
    `.gitignore`; o `project.json` entra no estado;
  - [ADR-0024](0024-o-que-fica-na-maquina-e-no-projeto.md): o `init` é da pessoa e não grava decisão; o hook das
    respostas é ligado pelo `init`, e os que barram ações, pela ficha;
  - [ADR-0025](0025-a-pessoa-decide-pela-conversa.md): a pessoa roda a fase 0; a regra do `!` no piloto sai; a
    ligação do hook passa da F05 para a F00; toda aprovação tem pedido;
  - [ADR-0026](0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md): a branch nasce no `open`, e não na F09; o
    `project.json` é um arquivo do projeto; o teto de texto.
- Ajusta, no mesmo PR, os documentos que a linha contradiz:
  - o [humano e agente](../conceitos/humano-e-agente.md): a fase 1 é a ficha, e o merge vem depois do "sim" da 8;
  - o [roteiro da spec](../metodo/roteiro-spec.md): os achados do contraditório e o seu destino ficam no histórico do
    `spec.md`, sem arquivo novo, e a Completude confere a peça contra a linha;
  - o [roteiro da entrega](../metodo/roteiro-entrega.md): na v1, o outro olhar é outro modelo do mesmo agente
    ([ADR-0005](0005-so-claude-code-na-v1.md)); a duração vai até o "sim" da 8, e os defeitos depois do merge se
    contam na F13; o relato por funcionalidade é do repositório-piloto;
  - o [PRD](../product/prd.md), que ganha a F00 e a F01c, tira a instalação de "Fica para depois" e se aprova de
    novo, porque a F00 não é divisão de uma peça.
- Depois da F00, da F01c e da F02, o próprio Curupira se adota pela linha.
- Fica mais difícil mudar o método só num roteiro: toda mudança que toca uma etapa passa por esta tabela.

### Riscos aceitos

- **Regras que dependem do agente até as peças chegarem.** Até a F03 e a F05, nada barra o agente de ler os arquivos
  de estado (regra 7) nem de commitar na `main` (regra 4).
- **O que a fase 8 muda no PR** (docs e cenários que viram testes) não passa pela revisão em eixos da fase 7; o
  "sim" da 8 vale para o commit que inclui essas mudanças, e a pessoa as vê no cartão e no merge.
- **Da `main`, a pessoa não vê o que anda nas outras branches** até o painel (F15); o `status` mostra a branch atual.
- **Uma funcionalidade aberta antes de uma ficha nova** só vê as checagens novas quando a branch dela recebe a
  `main`.

## Histórico

- 2026-11-04: aceita pela pessoa com um "sim" digitado, depois de duas correções na conversa: a instalação é o
  script `curl` (sem npm) e usa só o GitHub (sem domínio próprio).
- 2026-11-04: a F00 constrói a fase 0: o script de instalação, sem npm, e o `curupira init`, que liga o hook das
  respostas e põe `.curupira/local/` no `.gitignore`. A tabela não muda.
- 2026-11-04: a F01c se dividiu em F01c (o pedido, o hash e o teto de texto: regras 6 e 7 e a conferência do hash da
  regra 8) e F01d (a branch no `open`, o "esperando merge" e o `project.json`: regras 3 a 5). Nas peças da tabela, a
  linha 3 passa a citar a F01d, e a linha 8, a F01c e a F01d.
- 2026-11-04: a F01c constrói as regras 6 e 7 e a conferência do hash da regra 8: o `curupira request`, que grava a
  hora e o hash do que se aprova; o `approve` e o `reject`, que só aceitam uma resposta posterior ao pedido; o
  `approve`, que recusa o conteúdo mudado; e o teto de 280 caracteres no motivo da recusa. Nas peças, a linha 7 passa
  a citar a F01c; na linha 8, fica registrada também a decisão, com a hora do pedido e o commit.
- 2026-11-04: na revisão da F01c, a regra 7 passou a falar só do motivo, como decidiu a spec da F01c: a resposta de
  uma aprovação é um "sim" puro. As Consequências ficam como foram aceitas; a divisão da F01c está no histórico acima.
- 2026-11-04: pelo [ADR-0032](0032-parar-a-recursao.md), a regra 9 sai, e as regras 3 a 5 seguem como prática do
  agente, à mão, sem peça que as imponha: a F01d saiu da fila para o backlog. Onde a tabela cita a F01d, a branch e o
  "esperando merge" ficam com o agente; as decisões das fases 1 e 2 seguem no PRD.
