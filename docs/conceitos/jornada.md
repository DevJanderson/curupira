# A jornada

A jornada tem 9 fases. A pessoa decide em 5 portões (★); entre eles, o agente trabalha sozinho, e cada portão só
abre com o "sim" registrado pela CLI. As fases 3 a 8 se repetem por funcionalidade.

| #   | Fase             | Pessoa                                                     | Agente                                                                                                                                           | Sai                                                     |
| --- | ---------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| 0   | Instalar         | roda o instalador, uma vez por máquina                     | —                                                                                                                                                | o comando `curupira`                                    |
| 1 ★ | Adotar o projeto | roda `curupira iniciar`; confirma perfil, portões e hooks  | lê o projeto (ou pergunta a stack, se vazio) e propõe a constituição: comandos de teste, lint e tipos, arquitetura, ambiente de verificação      | `.curupira/perfil.md`                                   |
| 2 ★ | Produto (PRD)    | responde a entrevista e aprova o PRD                       | conduz a entrevista em rodadas curtas; registra perguntas em aberto; divide em funcionalidades pequenas                                          | `prd.md`, perguntas em aberto, lista de funcionalidades |
| 3   | Especificar      | responde até 5 perguntas                                   | escreve a spec em EARS ("QUANDO … O SISTEMA DEVE …"), poucos cenários e o plano; marca o que falta esclarecer                                    | `spec.md`, cenários, `plano.md`                         |
| 4 ★ | Aprovar          | aprova spec e cenários (painel ou terminal)                | grava a aprovação com a impressão digital (hash) da spec                                                                                         | estado: aprovada                                        |
| 5   | Implementar      | acompanha no painel, se quiser                             | testes primeiro (prova do vermelho), passo a passo; portões locais a cada passo                                                                  | código e testes numa branch                             |
| 6   | Verificar        | só é chamada se o veredito for "bloqueado"                 | verificador separado roda os cenários contra o sistema real; o agente corrige e o verificador roda de novo, até passar, com limite de tentativas | vereditos com provas em texto                           |
| 7 ★ | Revisar          | revisa a página da funcionalidade; aprova ou pede mudanças | revisão em eixos (spec, segurança, testes, padrões), só defeitos bloqueiam; abre o PR                                                            | PR e relatório                                          |
| 8 ★ | Entregar         | faz o merge e decide as melhorias                          | atualiza docs; cenários viram testes de regressão; mede tempo, custo e cache; retrospectiva                                                      | métricas e lições                                       |

Se a pessoa pede mudanças na fase 7, a funcionalidade volta à fase 5 (ou à 3, se a mudança alterar a spec).
A jornada é revisada a cada funcionalidade entregue ([ADR-0015](../decisoes/0015-jornada-de-9-fases-e-5-portoes.md)).
