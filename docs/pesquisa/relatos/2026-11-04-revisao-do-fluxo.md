# Relato: revisão do fluxo inteiro

Na segunda recusa da fase 4 da F02, a pessoa apontou que o `init` tinha três sentidos e pediu uma releitura de tudo:
PRD, ADRs e a linha inteira, da instalação à entrega. A impressão era de que o Curupira estava desafinado: cada
peça fazia sentido sozinha, mas a linha não se fechava como numa fábrica.

## Como foi feita

Três leituras em paralelo, cada uma num subagente que leu só os arquivos:

| Leitura                     | O que leu                                                    | Modelo            | Achados |
| --------------------------- | ------------------------------------------------------------ | ----------------- | ------- |
| A linha, vista por quem usa | PRD, funcionalidades, conceitos e roteiros                   | outro (Sonnet)    | 21      |
| Os 30 ADRs                  | todos os ADRs, conferidos com PRD, funcionalidades e jornada | o mesmo do agente | 20      |
| O que existe de fato        | código, CLI, hook, specs, relatos e registro                 | o mesmo do agente | 20      |

Os 61 achados se repetem bastante entre as leituras: o `init`, por exemplo, apareceu nas três. Juntos, eles se
resumem em seis nós.

## A linha hoje

| Etapa              | Quem age, pelos documentos           | O que a ferramenta registra hoje                       | Situação                                                 |
| ------------------ | ------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------- |
| 0. Instalar        | a pessoa roda o instalador           | nada: não há o comando `curupira`                      | parte: nenhuma funcionalidade a constrói                 |
| 1. Adotar          | a pessoa (jornada) ou o agente (F02) | nada: a F02 está parada                                | parte: o escopo está espalhado em F02, F03, F04a e F05   |
| 2. PRD             | pessoa e agente                      | nada: a aprovação está escrita à mão no PRD            | parte: sem comando nem lugar de registro                 |
| 3. Especificar     | o agente, com perguntas              | o `open` cria o estado                                 | fecha, à mão                                             |
| 4. Aprovar a spec  | a pessoa, pela conversa              | o "sim" ou o "não" pelo hook, sem o hash da spec       | fecha                                                    |
| 5. Implementar     | o agente                             | o `advance`; a branch não é da CLI                     | fecha, à mão                                             |
| 6. Verificar       | o verificador                        | o `advance`; as provas, à mão                          | fecha, à mão                                             |
| 7. Revisar         | a pessoa: página, cartão ou PR?      | o "sim" ou o "não" pelo hook                           | fecha, com o lugar da revisão em aberto                  |
| 8. Entregar        | a pessoa faz o merge                 | um "sim" que marca "entregue", sem ligação com o merge | parte: na branch, o estado não chega à `main`            |
| Outra pessoa clona | quem clona roda `init` (ADR-0024)    | nada                                                   | parte: não está na jornada nem em nenhuma funcionalidade |

O meio da linha, das fases 3 a 7, anda; as duas pontas não.

## Os seis nós

### 1. Quem toca a CLI

- O [ADR-0025](../../decisoes/0025-a-pessoa-decide-pela-conversa.md) diz que só o agente roda a CLI e recusou a
  pessoa rodando-a em outro terminal; a [jornada](../../conceitos/jornada.md) põe a pessoa rodando `curupira init`, e
  o [ADR-0029](../../decisoes/0029-mascote-no-terminal.md) desenha uma tela de terminal para a pessoa.
- O `init` tem quatro sentidos: a pessoa começa a adoção (jornada), quem clona refaz as skills (ADR-0024, linha
  108), o agente entrega a proposta (spec da F02) e a tela com o mascote (ADR-0029).
- O ADR-0025, linha 59, ainda manda aprovar com `!` no piloto, o que a F01b já tinha substituído.

### 2. O que é a adoção e como ela começa

- A jornada põe na fase 1 o perfil, a arquitetura, o ambiente de verificação, as checagens e os hooks, com uma
  aprovação só; o PRD diz que cada checagem é confirmada; a F02 aprova só o perfil.
- O "sim" da adoção precisa do hook, mas o hook só seria instalado com esse "sim" (ADR-0024, linha 82, e a F05 na
  ordem 7): a F02 só funciona num projeto com o hook já ligado à mão.
- O ADR-0023 e o ADR-0024 mandam a adoção mudar o `.gitignore`; a F02 decidiu o contrário.

### 3. Onde ficam as decisões do projeto

- As fases 1 e 2 são do projeto, não de uma funcionalidade, e a CLI só conhece as fases 3 a 8.
- A F02 inventou um lugar (as decisões dentro do `profile.json`); a aprovação do PRD continua escrita à mão, e a
  F06 vai precisar de outro lugar.
- O PRD diz que nenhuma funcionalidade começa sem o PRD aprovado; a F02 só barra o `open` pelo perfil.

### 4. Estado, branch e entrega

- O [ADR-0026](../../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md) põe o estado na branch da
  funcionalidade, mas a branch só nasce na fase 5 (F09). A F01a e a F01b fizeram as fases 3 e 4 na `main`; a F02,
  numa branch.
- A `main` não tem `.curupira/`, o `status` só vê a branch atual, e a F01a e a F01b, já entregues, não têm estado.
- A fase 8 marca "entregue" com um "sim" na branch, antes do merge; a F12 promete registrar a entrega depois dele.
  Não há onde gravar o que acontece depois do merge.

### 5. O método mudou sem a jornada mudar

- O [ADR-0015](../../decisoes/0015-jornada-de-9-fases-e-5-aprovacoes.md) diz que toda mudança na jornada vira ADR;
  o contraditório na fase 3 e o eixo com outro olhar na fase 7 entraram só nos roteiros.
- O relato por funcionalidade virou peça do método (achados do contraditório, medição, olhar da revisão), mas só
  existe neste repositório; o ADR-0026 limita cada funcionalidade a 4 arquivos.
- O tempo até cada "sim" (ADR-0028) não tem como ser medido: nada grava a hora do pedido.
- A jornada promete o hash da spec na fase 4, e o estado não tem esse campo.
- O `advance` da fase 3 para a 4 não confere nada que a máquina poderia conferir, como uma marca
  `[A ESCLARECER]` aberta. A primeira recusa da F02 veio disso.
- Os roteiros mandam usar outro agente de terminal; o ADR-0005 limita a v1 ao Claude Code.

### 6. Os ADRs

- Cerca de 15 dos 30 ADRs governam o que existe. Cinco ainda não têm efeito (0009, 0011, 0012, 0013, 0029) e dois
  estão em "proposta" com a prática à frente (0004, 0010).
- Há grupos que se corrigem uns aos outros pelo histórico e caberiam num só: onde o Curupira grava (0023, 0024 e
  0026), o painel (0011, 0012 e 0013), o ferramental (0016 e 0017), as mensagens (0028 dentro do 0030).
- O 0001 e o 0007 são intenção de produto, e o 0007 ("tudo na v1") nunca registrou o recuo do PRD.
- O 0015 só aponta para a jornada, em vez de contê-la.

## Por que aconteceu

- **As funcionalidades foram cortadas por capacidade, e não pela linha.** A fase 1 ficou em quatro peças (F02,
  F03, F04a, F05), e a fase 8, em três (F01a, F12, F13). Cada spec fechou a sua peça sem olhar a linha inteira.
- **A jornada deixou de ser a fonte única.** Os roteiros e os ADRs mudaram o método, e a tabela da jornada ficou
  para trás.
- **O contraditório também olha só a peça.** Ele leu a jornada e o ADR-0024 e não pegou o `init`.
- **A linha nunca rodou de ponta a ponta.** O próprio piloto pulou as pontas: o PRD foi aprovado à mão, e o projeto
  nunca foi adotado.

## O caminho proposto

1. **Decidir os nós, um por vez, nesta ordem:** quem toca a CLI; o que é a adoção e como ela começa; onde ficam as
   decisões do projeto; estado, branch e entrega; a instalação mínima antes do segundo projeto. Cada resposta
   destrava a seguinte.
2. **Escrever a linha num ADR só**, que contém a jornada em vez de apontar para ela, com quem age, o comando, o
   registro e a funcionalidade de cada etapa. Os grupos de ADRs se juntam, e os que viram intenção de produto vão
   para o PRD.
3. **Recortar as funcionalidades pela linha**, para que cada peça feche uma etapa inteira, e refazer a ordem.
4. **Pôr uma regra no método:** toda spec diz qual linha da jornada ela muda e atualiza a jornada no mesmo PR, e a
   Completude confere a peça contra a linha (quem roda cada comando, o que vem antes e o que vem depois).
5. **Retomar a F02** com a linha nova.

## As decisões dos nós

Cada nó decidido entra aqui, com as palavras da pessoa resumidas e o que decorre dele. No fim, tudo vira o ADR da
linha.

### Nó 1: quem toca a CLI (2026-11-04)

**Decisão da pessoa:** os comandos de preparação, da instalação até o Curupira estar implantado no projeto, são
rodados pela pessoa (quem desenvolve, analisa ou estuda). Depois disso, o trabalho é a conversa entre a pessoa e o
agente de IA, e os comandos dessa interação são do agente.

O que decorre, para confirmar nos próximos nós:

- A pessoa roda a instalação e o `init`. O `init` prepara o projeto: liga o hook das respostas, cria os arquivos do
  agente e põe `.curupira/local/` no `.gitignore`. Serve para quem adota e para quem clona, e não registra decisão.
- Rodar o `init` é o ato da pessoa que autoriza o hook das respostas; os hooks que barram ações (F05) continuam
  propostos na adoção.
- Os comandos do fluxo (`open`, `advance`, `approve`, `reject` e a entrega da proposta de perfil) são do agente,
  na conversa, e as decisões continuam digitadas ([ADR-0025](../../decisoes/0025-a-pessoa-decide-pela-conversa.md)).
- Os comandos que só leem (`curupira` sem argumentos, com a tela inicial, e `status`) servem aos dois.
- O `init` deixa de ter os sentidos de "o agente entrega a proposta" e de "começar a adoção": a adoção começa
  quando a pessoa pede ao agente, depois do `init`.

## Números

| Medida                                   | Valor                                       |
| ---------------------------------------- | ------------------------------------------- |
| Achados                                  | 61 (21 da linha, 20 dos ADRs, 20 do código) |
| Nós depois de juntar                     | 6                                           |
| Achados que travam a próxima peça        | 17, com repetições entre as leituras        |
| ADRs que governam o que existe           | cerca de 15 de 30                           |
| Etapas da linha que fecham na ferramenta | 5 de 10 (fases 3 a 7), quatro delas à mão   |
