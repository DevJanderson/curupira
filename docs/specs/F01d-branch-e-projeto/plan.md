# F01d: plano

Cada passo começa por um teste que falha (a prova do vermelho). Depende da F01c, que trouxe o pedido, o hash e a
conferência do conteúdo.

## Consequências de ADR que o código toca

| ADR                                                                          | Consequência                                                                                              | Como se confere                                   |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [0031](../../decisoes/0031-a-linha.md)                                       | branch por etapa a partir da `main`; decisões do projeto no `project.json`; "esperando merge" lido do Git | testes nos passos 1 a 5                           |
| [0023](../../decisoes/0023-estado-artefatos-e-dados-locais.md)               | o estado guarda o caminho e o hash do que se aprovou                                                      | o pedido e a decisão do projeto levam os caminhos |
| [0026](../../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md) | o `project.json` é um arquivo só, do projeto                                                              | passo 3                                           |
| [0027](../../decisoes/0027-idioma-e-vocabulario-da-ferramenta.md)            | `adopt`, `prd` e `project` em inglês; as mensagens no catálogo pt-BR                                      | revisão                                           |
| [0008](../../decisoes/0008-nome-provisorio-e-troca-facil.md)                 | o nome só na constante                                                                                    | o teste que já existe                             |

## 1. A branch no `open`

- **Teste primeiro:** num repositório Git descartável com `main` e um commit:
  - de outra branch com um commit a mais, `open F09` cria `feat/F09` no commit da `main`, passa a ela e grava o estado
    nela, e não na branch de onde rodou;
  - com um arquivo mudado ou novo e não ignorado, sem a `main`, com `feat/F09` já existente ou fora de um repositório
    com commit, recusa sem criar branch nem estado, dizendo o arquivo ou o motivo; um arquivo ignorado não conta;
  - a ordem dos erros: o ID, a funcionalidade já aberta ou entregue, a mudança sem commit, a `main`, a branch.
- **O que muda:** o núcleo (criar a branch pelo Git, com o `env` da CLI) e `run.ts`. Os testes que abrem duas
  funcionalidades no mesmo repositório passam a gravar o estado direto ou a fazer o commit entre um `open` e outro, e
  os repositórios dos testes nascem com `main`.
- **Requisitos:** R1, R2.

## 2. Os comandos só na branch da etapa

- **Teste primeiro:** `advance`, `request`, `approve` e `reject` de uma funcionalidade fora de `feat/<ID>` recusam,
  citando a branch, sem mudar o estado; a fase errada vence a branch errada, e a branch errada vence a falta de pedido.
- **O que muda:** `run.ts` e o núcleo (a branch atual pelo Git). Os testes da F01a, da F01b, da F01c e da F00 que
  decidem passam a rodar na branch da funcionalidade.
- **Requisitos:** R3.

## 3. O `project.json` e as fases 1 e 2

- **Teste primeiro:**
  - `adopt` cria `adopt` a partir da `main` e grava `{ "phase": 1, "decisions": [] }`; `prd` cria `prd` e grava a
    fase 2, mantendo as decisões; as recusas do R2 valem para os dois;
  - `prd` sem uma aprovação da fase 1 no `project.json` da `main` recusa; `adopt` ou `prd` com uma fase aberta no
    `project.json` da `main` recusam;
  - o `load` recusa um `project.json` malformado (a fase, as decisões, o pedido), com o problema, e o `status` com ele
    falha como com o estado de uma funcionalidade.
- **O que muda:** o núcleo (o estado do projeto, com os campos em inglês `phase` e `decisions`, a fase ausente quando
  nenhuma está aberta), `run.ts`, o catálogo e o uso.
- **Requisitos:** R4, R5, R9.

## 4. O pedido e a decisão do projeto

- **Teste primeiro:**
  - `request project` na fase 1 grava o caminho e o SHA-256 do `.curupira/profile.json`; na fase 2, os dois caminhos
    e um hash dos dois arquivos; sem fase aberta, recusa;
  - `approve project` e `reject project` seguem a F01c: sem pedido, com resposta anterior ou com o conteúdo mudado
    (só no `approve`), recusam; o motivo tem teto; a aprovação fecha a fase, e a recusa a mantém;
  - fora da branch da fase aberta, os três recusam;
  - o `status` mostra a fase aberta do projeto e que ela espera aprovação.
- **O que muda:** o núcleo (reaproveita o pedido, a conferência e o teto da F01c) e `run.ts`.
- **Requisitos:** R6, R7.

## 5. "Esperando merge"

- **Teste primeiro:** numa branch que não é a `main`:
  - uma funcionalidade entregue nela e não entregue na `main` (ou ausente da `main`) aparece como entregue e esperando
    merge; depois do merge, na `main`, só como entregue;
  - uma aprovação do projeto que não está no `project.json` da `main` aparece como esperando merge;
  - sem a branch `main`, o `status` mostra o estado sem a comparação; nenhum arquivo muda.
- **O que muda:** o núcleo (ler o estado da `main` com `git show`) e o `status`.
- **Requisitos:** R8.

## 6. O `project.json` deste repositório

- **Teste primeiro:** não se aplica; é um dado. Depois de gravar, `curupira status` neste repositório roda sem erro.
- **O que muda:** `.curupira/state/project.json`, com as duas aprovações do PRD (fase 2): 2026-11-03 às 17:12 (relato
  da fase 2) e 2026-11-04 às 13:09 (hora do commit da segunda aprovação, que o relato não guarda), horas locais
  (UTC-4); por Janderson Lira, com "sim"; sem pedido nem hash, que não existiam.
- **Requisitos:** o objetivo; a exceção ao escritor único está nas decisões da spec.

## 7. Os cenários como testes de regressão

- **Teste primeiro:** C1 a C5. Sem vermelho natural: a prova é uma mutação de propósito no código, desfeita em
  seguida.
- **O que muda:** `apps/cli/tests/scenarios-f01d.test.ts`.
- **Requisitos:** os que os cenários cobrem.

## 8. Documentação

- **Teste primeiro:** não se aplica.
- **O que muda:**
  - o ADR-0031: as linhas 1, 2, 3 e 8 e a linha no histórico; a linha longa da regra 7;
  - o [humano e agente](../../conceitos/humano-e-agente.md) e o `AGENTS.md`: o `open`, o `adopt` e o `prd` criam a
    branch; o agente busca a `main` antes; os comandos rodam na branch da etapa;
  - o README: os comandos novos.
