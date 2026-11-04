# F01d: plano

Cada passo começa por um teste que falha (a prova do vermelho). Depende da F01c, que trouxe o pedido, o hash e a
conferência do conteúdo.

## Consequências de ADR que o código toca

| ADR                                                                          | Consequência                                                               | Como se confere                                   |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| [0031](../../decisoes/0031-a-linha.md)                                       | branch por etapa a partir da `main`; decisões do projeto no `project.json` | testes nos passos 1 a 4                           |
| [0023](../../decisoes/0023-estado-artefatos-e-dados-locais.md)               | o estado guarda o caminho e o hash do que se aprovou                       | o pedido e a decisão do projeto levam os caminhos |
| [0026](../../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md) | o `project.json` é um arquivo só, do projeto                               | passo 2                                           |
| [0027](../../decisoes/0027-idioma-e-vocabulario-da-ferramenta.md)            | `adopt`, `prd` e `project` em inglês; as mensagens no catálogo pt-BR       | revisão                                           |

## 1. A branch no `open`

- **Teste primeiro:** num repositório Git descartável com `main` e um commit:
  - de outra branch com um commit a mais, e também com o HEAD solto, `open F09` cria `feat/F09` no commit da `main`,
    passa a ela e grava o estado nela, e não na branch de onde rodou;
  - com um arquivo mudado ou novo e não ignorado, inclusive o estado sem commit de outra funcionalidade, sem a `main`
    (só uma tag `main` ou só `origin/main` também contam como sem), com `feat/F09` com commits fora da `main` ou fora
    de um repositório com commit, recusa sem criar branch nem estado, dizendo o arquivo ou o motivo; um arquivo
    ignorado não conta;
  - uma `feat/F09` que já existe sem commit fora da `main` é recriada a partir da `main`, também rodando de dentro
    dela;
  - a F09 já aberta ou entregue na `main` é recusada, mesmo rodando de uma branch velha que não a tem;
  - se a gravação do estado falha (a pasta de estado sem escrita), a CLI volta à branch de origem e apaga a nova;
  - a ordem dos erros do R2.
- **O que muda:** o núcleo (a branch pelo Git, sempre com `refs/heads/main`, e o `env` da CLI) e `run.ts`. Os
  repositórios dos testes nascem com `main` (`git init -b main`), e os testes que abrem duas funcionalidades no mesmo
  repositório gravam o estado direto ou fazem o commit entre um `open` e outro: `commands.test.ts`,
  `request.test.ts`, `scenarios-f01a`, `scenarios-f01b`, `scenarios-f01c` e `init.test.ts`, onde chamarem `open`.
- **Requisitos:** R1, R2.

## 2. O `project.json` e as fases 1 e 2

- **Teste primeiro:**
  - `adopt` cria `project/adopt` a partir da `main` e grava `{ "phase": 1, "decisions": [] }`; `prd` cria
    `project/prd` e grava a fase 2, mantendo as decisões da `main`; as recusas do R2 e a recriação da branch mesclada
    valem para os dois;
  - `prd` sem uma aprovação da fase 1 no `project.json` da `main` recusa; `adopt` com `project/prd` em andamento, e
    `prd` com `project/adopt` em andamento, recusam;
  - o `load` recusa um `project.json` malformado (a fase, as decisões, o pedido, os caminhos), com o problema;
  - `open project` e `advance project` são ID inválido;
  - a ordem dos erros do `adopt` e do `prd`, da spec.
- **O que muda:** o núcleo (o estado do projeto, com as fases 1 e 2 nos tipos e na validação), `run.ts`, o catálogo e
  o uso.
- **Requisitos:** R3, R4.

## 3. O pedido e a decisão do projeto

- **Teste primeiro:**
  - `request project` na fase 1 grava o caminho e o SHA-256 do `.curupira/profile.json`; na fase 2, os dois caminhos
    e o hash da tabela da spec, calculado à mão no teste; sem fase aberta, recusa; sem um dos arquivos, ou com ele como pasta ou link, recusa
    citando o caminho, numa mensagem que não fala em spec;
  - `approve project` e `reject project` seguem a F01c: sem pedido, com resposta anterior ou com o conteúdo mudado
    (só no `approve`), recusam; o motivo tem teto; a aprovação fecha a fase, e a recusa a mantém;
  - as respostas da lista da spec ("sim", "sim project", "sim F09", "sim projeto", "não project, …");
  - o `status` mostra a fase aberta do projeto e que ela espera aprovação.
- **O que muda:** o núcleo (reaproveita o pedido, a conferência e o teto da F01c; `answers.ts` passa a reconhecer
  `project` como alvo do "sim"; a mensagem de arquivo ausente deixa de falar só em spec) e `run.ts`.
- **Requisitos:** R5, R6.

## 4. "Esperando merge"

- **Teste primeiro:** numa branch que não é a `main`, inclusive com o HEAD solto:
  - uma funcionalidade entregue nela e não entregue na `main` (ou ausente da `main`) aparece como entregue e esperando
    merge; depois do merge, na `main`, só como entregue;
  - uma aprovação do projeto que não está no `project.json` da `main` (a mesma fase com a mesma hora) aparece como
    esperando merge;
  - sem a branch `main`, o `status` diz que não comparou; um estado da `main` malformado é estado inválido citando a
    `main`; nenhum arquivo muda.
- **O que muda:** o núcleo (ler o estado da `main` com `git show refs/heads/main:<arquivo>`) e o `status`.
- **Requisitos:** R7.

## 5. Os cenários como testes de regressão

- **Teste primeiro:** C1 a C5. Sem vermelho natural: a prova é uma mutação de propósito no código, desfeita em
  seguida.
- **O que muda:** `apps/cli/tests/scenarios-f01d.test.ts`.
- **Requisitos:** os que os cenários cobrem.

## 6. Documentação

- **Teste primeiro:** não se aplica.
- **O que muda:**
  - o ADR-0031: as linhas 1, 2, 3 e 8 e a linha no histórico;
  - o [humano e agente](../../conceitos/humano-e-agente.md) e o `AGENTS.md`: o `open`, o `adopt` e o `prd` criam a
    branch; o agente busca a `main` antes e faz o commit de tudo antes de abrir;
  - o README: os comandos novos;
  - a linha da F02 em [funcionalidades](../../product/features.md): ela volta a ser escrita sobre o `project.json`.
