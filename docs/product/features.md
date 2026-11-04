# Funcionalidades

As peças do [PRD](prd.md), na ordem da [linha](../decisoes/0031-a-linha.md): primeiro as que fecham as pontas (a
instalação, a adoção e o PRD), depois o meio. Cada uma é entregável e testável sozinha.

| ID   | Nome                            | O que entrega                                                                                                                                                                                                 | Fase da linha | Depende de | Ordem de valor |
| ---- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------- | -------------- |
| F01a | Estado e comandos               | CLI com o estado de cada funcionalidade versionado no Git e escritor único, que registra cada decisão (quem e quando) e mostra a fase e o que espera decisão                                                  | 3 a 8         | —          | 1, entregue    |
| F01b | Prova de decisão humana         | A resposta digitada pela pessoa é registrada, e a CLI só aceita uma aprovação ou recusa com ela (ADR-0025)                                                                                                    | 4, 7 e 8      | F01a       | 2, entregue    |
| F00  | Instalar e preparar             | O script de instalação por `curl`, baixado do GitHub sem npm (ADR-0009), e o `init`, que liga o hook das respostas e põe `.curupira/local/` no `.gitignore`                                                   | 0             | —          | 3, entregue    |
| F01c | Pedido e teto                   | Toda aprovação tem pedido, com a hora e o hash do que se aprova, e a resposta vem depois dele; teto de texto por decisão; o estado da F01a e da F01b montado a partir dos relatos                             | 4, 7 e 8      | F00, F01b  | 4              |
| F01d | Branch e projeto                | O `open` cria a branch a partir da `main`; "esperando merge" lido do Git; o `project.json` com as decisões das fases 1 e 2, com pedido e hash                                                                 | 1, 2, 3 e 8   | F01c       | 5              |
| F02  | Adotar o projeto                | O agente lê o projeto e propõe a ficha do projeto (comandos, stack, dados pessoais, leis e limites de tamanho), e a pessoa a aprova; a barreira do `open`                                                     | 1             | F01d       | 6              |
| F03  | Instrução mínima e adaptador    | As skills, postas pelo `init`, e a instrução do agente, como parte da ficha, no adaptador do Claude Code                                                                                                      | 0 e 1         | F02        | 7              |
| F04a | Checagens básicas               | Lint, tipos, testes e segredos, como itens da ficha, rodados por comando                                                                                                                                      | 1 e 5         | F02        | 8              |
| F05  | Hooks do ciclo de vida          | Hooks que barram ações fora do fluxo, como parte da ficha, e agem no início da sessão, antes da compactação e no fim                                                                                          | 1 a 8         | F01b, F03  | 9              |
| F06  | Entrevista do PRD               | O agente conduz o roteiro, propõe dividir o que passa do limite de tamanho e grava PRD, perguntas em aberto e funcionalidades; aprovação                                                                      | 2             | F01d, F03  | 10             |
| F07  | Spec e cenários                 | Spec em EARS, poucos cenários e plano, com contraditório, até 5 perguntas, dados pessoais marcados, design como entrada e recusa acima do limite de tamanho; o `advance` recusa marca `[A ESCLARECER]` aberta | 3             | F06        | 11             |
| F09  | Implementar com testes primeiro | Prova do vermelho registrada, checagens a cada passo e quebra do passo grande                                                                                                                                 | 5             | F04a, F07  | 12             |
| F10  | Verificador separado            | Os cenários rodam contra API, CLI, banco e testes, com 4 vereditos, laço de correção com limite e provas em texto                                                                                             | 6             | F09        | 13             |
| F11  | Revisão em eixos e PR           | Revisão em 4 eixos em que só defeitos bloqueiam, um deles com outro modelo, e PR aberto pela CLI `gh`; aprovação                                                                                              | 7             | F10        | 14             |
| F12  | Entrega e medição               | No "sim" da fase 8, a entrega e a medição ficam gravadas na branch; a medição guarda só números, e os cenários viram testes de regressão                                                                      | 8             | F11        | 15             |
| F13  | Retrospectiva e lições          | A retrospectiva propõe melhorias, revê os limites de tamanho, e os defeitos que escapam viram lições para as próximas specs                                                                                   | 8             | F12        | 16             |
| F04b | Checagens extras                | Duplicação, código morto, complexidade, dependências vulneráveis e análise de segurança, com cada ferramenta escolhida em ADR                                                                                 | 1 e 5         | F04a       | 17             |
| F14  | Modo leve                       | Mudanças pequenas e bugs (atual, esperado e o que não pode mudar, que vira teste de regressão) pulam PRD e spec, mas passam por checagens e verificação                                                       | 5 e 6         | F04a, F10  | 18             |
| F15  | Painel: andamento               | O painel mostra a fase, as decisões pendentes e a documentação, inclusive o que anda nas outras branches                                                                                                      | todas         | F01d       | 19             |
| F16  | Painel: decidir                 | As aprovações feitas no painel gravam pela CLI                                                                                                                                                                | 2, 4, 7 e 8   | F15        | 20             |
| F17  | Contexto em camadas             | Camadas de contexto, contratos dos subagentes e teto de contexto por papel, medido em teste                                                                                                                   | 3 a 8         | F03        | 21             |
| F19  | Evals das skills                | Projetos descartáveis que provam o comportamento do agente; custam dinheiro e ficam fora da CI                                                                                                                | 3 a 8         | F17        | 22             |
| F18  | Comando de renomear             | Troca o nome a partir da constante e migra os projetos (ADR-0008)                                                                                                                                             | —             | —          | 23             |
| F08  | Aprovação com impressão digital | Entrou na F01c: o hash passou a valer para toda aprovação (ADR-0031)                                                                                                                                          | —             | —          | —              |

## Regras

- **Cada peça diz qual linha do [ADR-0031](../decisoes/0031-a-linha.md) ela muda** e a atualiza no mesmo PR.
- **As peças até a F05 nascem à mão, mas pela linha:** spec em Markdown, aprovação registrada, testes primeiro e
  verificação. Cada peça entregue passa a gravar as aprovações seguintes.
- **Peça grande se divide.** Se uma peça passar do limite de tamanho na fase 3, ela é dividida com sufixo (F10a,
  F10b), e nenhum ID é reaproveitado. A lista pode crescer por divisão sem reabrir o PRD.

## Histórico

- 2026-11-04: a lista se reordenou pela linha ([ADR-0031](../decisoes/0031-a-linha.md)). Entraram a F00 e a F01c; a
  F08 entrou na F01c; a F09 perdeu a branch, que nasce no `open`; a F12 grava a entrega no "sim" da fase 8, e não
  depois do merge; a F04b foi para depois da F13.
- 2026-11-04: a F01c se dividiu na fase 3 dela, por passar do limite de tamanho: a F01c ficou com o pedido, o hash e o
  teto de texto (regras 6, 7 e a conferência do hash da 8), e a F01d, com a branch no `open`, o "esperando merge" e o
  `project.json` (regras 3 a 5). A F02, a F06 e a F15 passam a depender da F01d.
