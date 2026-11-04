# F02: plano

Cada passo começa por um teste que falha (a prova do vermelho). Depende da F01a e da F01b.

## Consequências de ADR que o código toca

| ADR                                                                          | Consequência                                                                                      | Como se confere                   |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------- |
| [0021](../../decisoes/0021-nucleo-independente-de-agente-com-adaptadores.md) | o núcleo não importa adaptador                                                                    | teste da fronteira, que já existe |
| [0024](../../decisoes/0024-o-que-fica-na-maquina-e-no-projeto.md)            | o perfil e o id do projeto ficam em `.curupira/`, no Git; a proposta, em `.curupira/local/`, fora | teste no passo 1                  |
| [0025](../../decisoes/0025-a-pessoa-decide-pela-conversa.md)                 | a aprovação do perfil só vale com a resposta digitada                                             | C1, C3 e testes do passo 3        |
| [0027](../../decisoes/0027-idioma-e-vocabulario-da-ferramenta.md)            | chaves em inglês; o texto para a pessoa vem do catálogo                                           | revisão; o catálogo já é a regra  |
| [0008](../../decisoes/0008-nome-provisorio-e-troca-facil.md)                 | o nome só na constante                                                                            | teste do nome, que já existe      |

## 1. O perfil no núcleo

- **Teste primeiro:** validar a proposta, com os exemplos da spec (idioma que vale e que não vale, limite 0, campo
  faltando, tipo errado, texto vazio), e dizer o campo de cada erro; guardar e ler a proposta em `.curupira/local/`,
  conferindo-a de novo na leitura; gravar e ler o perfil em `.curupira/profile.json`; perfil ou proposta ilegível,
  inválido ou que é uma pasta gera o erro com o arquivo; inválido é o perfil fora das regras da proposta, a falta do
  id ou uma decisão sem quem, quando e texto. Numa pasta temporária. Num repositório Git sem nenhuma
  resposta guardada, `git check-ignore` confirma que a proposta fica fora do Git e o perfil dentro.
- **O que muda:** `packages/core/src/profile.ts` e as exportações do núcleo.
- **Requisitos:** R2, R9.

## 2. O comando `init`

- **Teste primeiro:** `init` com proposta válida guarda a proposta, mostra o resumo e não grava o perfil; com
  proposta inválida, sai com erro citando o campo. Depois do teste, rodar a CLI real (`node apps/cli/src/main.ts
  init`) com uma proposta por um pipe, porque é a primeira saída para a pessoa.
- **O que muda:** `apps/cli/src/run.ts` e o catálogo `pt-BR.json`.
- **Requisitos:** R1, R2.

## 3. Aprovar e recusar o perfil

- **Teste primeiro:** `approve profile` com "sim" grava o perfil com o id (UUID), a versão do pacote da CLI e a decisão,
  e apaga a proposta e a resposta; uma segunda decisão mantém o id e soma a decisão, e a aprovação troca a versão; nos
  dois comandos, a proposta e o perfil são lidos e conferidos antes de tudo, a resposta é apagada antes de gravar o
  perfil, e a proposta depois, para uma falha ao apagar não deixar a mesma resposta decidir duas vezes; uma gravação que
  falha deixa o perfil e a proposta como estavam, sem a resposta; uma recusa depois de um perfil aprovado não muda o
  perfil nem a versão; `reject profile` com "não, <motivo>" grava a recusa (criando o arquivo e o id, se for a primeira
  decisão), apaga a proposta e mostra o motivo; sem proposta, os dois recusam antes de olhar a resposta.
- **O que muda:** `apps/cli/src/run.ts`, o catálogo e o núcleo, se a decisão do perfil pedir um tipo próprio.
- **Requisitos:** R3, R4, R5, R6.

## 4. O `open` barrado e o `status`

- **Teste primeiro:** `open` sem perfil aprovado recusa e não grava estado, inclusive com o arquivo só com recusas;
  `status` mostra, antes das funcionalidades, se há perfil aprovado e se há proposta esperando, os dois juntos quando
  for o caso. Os testes da F01a e da F01b passam a criar um perfil no ponto de partida.
- **O que muda:** `apps/cli/src/run.ts`, o catálogo e os testes existentes.
- **Requisitos:** R7, R8.

## 5. Os cenários como testes de regressão

- **Teste primeiro:** C1 a C5, cada um num repositório Git descartável. Sem vermelho natural: a prova é uma mutação
  de propósito no código, desfeita em seguida ([roteiro da spec](../../metodo/roteiro-spec.md#planmd)).
- **O que muda:** `apps/cli/tests/scenarios-f02.test.ts`.
- **Requisitos:** os que os cenários cobrem.

## 6. Documentação

- **Teste primeiro:** não se aplica.
- **O que muda:** a [jornada](../../conceitos/jornada.md) troca `profile.md` por `profile.json`; ela e o
  [humano e agente](../../conceitos/humano-e-agente.md) passam a dizer que a arquitetura, o ambiente de verificação,
  as checagens e os hooks vêm com as peças que os usam, e o humano e agente, que a recusa da fase 1 fica gravada; o
  [ADR-0023](../../decisoes/0023-estado-artefatos-e-dados-locais.md) ganha a linha do `.gitignore` no histórico.
