# Funcionalidades

As peças do [PRD](prd.md), em ordem de valor. Cada uma é entregável e testável sozinha.

| ID   | Nome                            | O que entrega                                                                                                                                                | Fase da jornada | Depende de | Ordem de valor |
| ---- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ---------- | -------------- |
| F01a | Estado e comandos               | CLI com o estado de cada funcionalidade versionado no Git e escritor único, que registra cada decisão (quem e quando) e mostra a fase e o que espera decisão | 3 a 8           | —          | 1              |
| F01b | Prova de decisão humana         | A resposta digitada pela pessoa é registrada, e a CLI só aceita uma aprovação ou recusa com ela (ADR-0025)                                                   | 4, 7 e 8        | F01a       | 2              |
| F02  | Adotar o projeto                | O agente lê o projeto e propõe o perfil (comandos, stack, dados pessoais, leis e limites de tamanho), e a pessoa confirma                                    | 1               | F01a       | 3              |
| F03  | Instrução mínima e adaptador    | A instrução mínima do agente e as skills por estação, no adaptador do Claude Code                                                                            | 1               | F02        | 4              |
| F04a | Checagens básicas               | Lint, tipos, testes e segredos, propostos no perfil e rodados por comando                                                                                    | 1 e 5           | F02        | 5              |
| F04b | Checagens extras                | Duplicação, código morto, complexidade, dependências vulneráveis e análise de segurança, com cada ferramenta escolhida em ADR                                | 1 e 5           | F04a       | 6              |
| F05  | Hooks do ciclo de vida          | Hooks que barram ações fora do fluxo e agem no início da sessão, antes da compactação e no fim                                                               | 3 a 8           | F01b, F03  | 7              |
| F06  | Entrevista do PRD               | O agente conduz o roteiro, propõe dividir o que passa do limite de tamanho e grava PRD, perguntas em aberto e funcionalidades; aprovação                     | 2               | F01b, F03  | 8              |
| F07  | Spec e cenários                 | Spec em EARS, poucos cenários e plano, com até 5 perguntas, dados pessoais marcados, design como entrada e recusa acima do limite de tamanho                 | 3               | F06        | 9              |
| F08  | Aprovação com impressão digital | A aprovação de spec e cenários grava o hash e mostra o tamanho; mudar a spec invalida a aprovação                                                            | 4               | F01b, F07  | 10             |
| F09  | Implementar com testes primeiro | Branch por funcionalidade, prova do vermelho registrada, checagens a cada passo e quebra do passo grande                                                     | 5               | F04a, F08  | 11             |
| F10  | Verificador separado            | Os cenários rodam contra API, CLI, banco e testes, com 4 vereditos, laço de correção com limite e provas em texto                                            | 6               | F09        | 12             |
| F11  | Revisão em eixos e PR           | Revisão em 4 eixos em que só defeitos bloqueiam, PR aberto pela CLI `gh`; aprovação                                                                          | 7               | F10        | 13             |
| F12  | Entrega e medição               | Depois do merge humano, a entrega é registrada, a medição guarda só números e os cenários viram testes de regressão                                          | 8               | F11        | 14             |
| F13  | Retrospectiva e lições          | A retrospectiva propõe melhorias, revê os limites de tamanho, e os defeitos que escapam viram lições para as próximas specs                                  | 8               | F12        | 15             |
| F14  | Modo leve                       | Mudanças pequenas e bugs (atual, esperado e o que não pode mudar, que vira teste de regressão) pulam PRD e spec, mas passam por checagens e verificação      | 5 e 6           | F04a, F10  | 16             |
| F15  | Painel: andamento               | O painel mostra a fase, as decisões pendentes e a documentação                                                                                               | todas           | F01a       | 17             |
| F16  | Painel: decidir                 | As aprovações feitas no painel gravam pela CLI                                                                                                               | 2, 4, 7 e 8     | F15        | 18             |
| F17  | Contexto em camadas             | Camadas de contexto, contratos dos subagentes e teto de contexto por papel, medido em teste                                                                  | 3 a 8           | F03        | 19             |
| F19  | Evals das skills                | Projetos descartáveis que provam o comportamento do agente; custam dinheiro e ficam fora da CI                                                               | 3 a 8           | F17        | 20             |
| F18  | Comando de renomear             | Troca o nome a partir da constante e migra os projetos (ADR-0008)                                                                                            | —               | —          | 21             |

## Regras

- **As peças F01 a F05 nascem à mão, mas pela jornada:** spec em Markdown, aprovação registrada, testes primeiro e
  verificação. Assim que a F01 existir, as aprovações seguintes passam a ser gravadas por ela.
- **Peça grande se divide.** Se uma peça passar do limite de tamanho na fase 3, ela é dividida com sufixo (F10a,
  F10b), e nenhum ID é reaproveitado. A lista pode crescer por divisão sem reabrir o PRD.
