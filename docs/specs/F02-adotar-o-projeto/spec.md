# F02: Adotar o projeto

- **Status:** rascunho, na fase 3
- **Data:** 2026-11-04

## Objetivo

Dar ao projeto um perfil aprovado pela pessoa: o idioma, a stack, os comandos, se há dados pessoais e que leis valem,
e os limites de tamanho. O agente lê o projeto e propõe o perfil ([funcionalidades](../../product/features.md)); a
CLI confere a proposta, mostra o resumo e só grava o perfil com o "sim" digitado pela pessoa, na aprovação da fase 1
([jornada](../../conceitos/jornada.md), [ADR-0025](../../decisoes/0025-a-pessoa-decide-pela-conversa.md)).

## Requisitos

- **R1.** QUANDO o agente roda `curupira init` com uma proposta de perfil válida na entrada padrão, O SISTEMA DEVE
  guardar a proposta em `.curupira/local/`, no lugar de uma proposta anterior, mostrar o resumo dela e dizer que o
  perfil espera a aprovação da pessoa, sem gravar o perfil.
- **R2.** SE a proposta não for um JSON válido, faltar um campo obrigatório, um campo tiver o tipo errado ou um
  texto vazio, o idioma não tiver catálogo de mensagens ou um limite não for um inteiro positivo, ENTÃO O SISTEMA
  DEVE recusar, dizer qual campo e por quê, e não gravar nada.
- **R3.** QUANDO o agente roda `curupira approve profile` com uma proposta guardada e um "sim" puro digitado, O
  SISTEMA DEVE gravar o perfil em `.curupira/profile.json`, com a proposta, o id do projeto, a versão da CLI que
  aprovou e a decisão (quem, quando e o texto), e apagar a proposta e a resposta usada.
- **R4.** QUANDO o agente roda `curupira reject profile` com uma proposta guardada e um "não, <motivo>" digitado, O
  SISTEMA DEVE apagar a proposta e a resposta usada, mostrar o motivo e não mudar o perfil. [A ESCLARECER: a recusa
  deixa rastro? Ver a pergunta da fase 3, que junta os achados K5 e N1 do contraditório.]
- **R5.** SE não houver proposta guardada, ou ela estiver ilegível ou inválida, ENTÃO `approve profile` e
  `reject profile` DEVEM recusar e dizer para o agente propor com `curupira init`. Na ordem dos erros das aprovações
  das funcionalidades (a fase, a sessão, a resposta digitada e o autor), a proposta toma o lugar da fase.
- **R6.** QUANDO o projeto já tem perfil e uma proposta nova é aprovada, O SISTEMA DEVE trocar o perfil e a versão,
  manter o id do projeto e acrescentar a decisão às anteriores.
- **R7.** SE o projeto não tiver perfil aprovado, ENTÃO `curupira open <ID>` DEVE recusar e dizer para adotar o
  projeto com `curupira init`.
- **R8.** QUANDO o agente roda `curupira status`, O SISTEMA DEVE mostrar, antes das funcionalidades, se o projeto
  tem perfil aprovado e se há uma proposta esperando aprovação.
- **R9.** SE `.curupira/profile.json` ou a proposta guardada não puderem ser lidos ou gravados, ou estiverem
  inválidos, ENTÃO O SISTEMA DEVE dizer qual arquivo e o problema, como no estado da F01a, e não mudar nada.

## A proposta

A proposta é um JSON, com chaves em inglês
([ADR-0027](../../decisoes/0027-idioma-e-vocabulario-da-ferramenta.md)):

| Campo          | Tipo                        | O que é                                                                                          |
| -------------- | --------------------------- | ------------------------------------------------------------------------------------------------ |
| `language`     | texto                       | o idioma do texto para a pessoa; só `pt-BR` tem catálogo por enquanto                            |
| `stack`        | lista de textos, não vazia  | linguagens, frameworks e ferramentas do projeto; nenhum texto vazio                              |
| `commands`     | objeto de nome para comando | os comandos que o projeto já usa, como `test` e `lint`; pode ser vazio, mas nenhum comando vazio |
| `personalData` | objeto                      | `present` (sim ou não) e `laws` (lista das leis que valem, sem texto vazio)                      |
| `limits`       | objeto                      | `requirements` e `scenarios` por funcionalidade, inteiros positivos                              |

O id do projeto e a versão do Curupira não vêm na proposta: a CLI os põe na aprovação.

O idioma é conferido como texto exato, porque é o agente quem o escreve:

| Vale    | Não vale                                                           |
| ------- | ------------------------------------------------------------------ |
| `pt-BR` | `pt-br`, `pt`, `PT-BR`, ` pt-BR` (com espaço), `en` (sem catálogo) |

Nas respostas digitadas, valem os exemplos da [F01b](../F01b-prova-de-decisao-humana/spec.md): "sim" e "sim profile"
aprovam; "sim, mas…", "sim F02" e "sim?" não.

## Cenários

Cada cenário roda contra a CLI real, num repositório Git descartável. A mensagem digitada entra pelo hook, como na
F01b.

### C1. Propor e aprovar o perfil

- **Cobre:** R1, R3.
- **Ponto de partida:** projeto sem perfil; a mensagem "sim" passou pelo hook depois do `init`.
- **Ação:** `curupira init` com uma proposta válida, e depois `curupira approve profile`.
- **Resultado esperado:** o `init` mostra o resumo e não grava o perfil; o `approve` grava `.curupira/profile.json`
  com a proposta, um id de projeto, a versão e a decisão com "sim", e a proposta guardada some.

### C2. Uma proposta inválida não é guardada

- **Cobre:** R2.
- **Ponto de partida:** projeto sem perfil.
- **Ação:** `curupira init` com uma proposta de limite `scenarios` igual a 0.
- **Resultado esperado:** o comando termina com erro, cita o campo `limits.scenarios`, e nada é gravado.

### C3. Um "não" digitado recusa a proposta

- **Cobre:** R4.
- **Ponto de partida:** uma proposta guardada; a mensagem "não, faltou o comando de lint" passou pelo hook.
- **Ação:** `curupira reject profile`.
- **Resultado esperado:** o comando mostra o motivo, a proposta some e o perfil não é criado.

### C4. Sem perfil, nenhuma funcionalidade abre

- **Cobre:** R7.
- **Ponto de partida:** projeto sem perfil.
- **Ação:** `curupira open F01a`.
- **Resultado esperado:** o comando termina com erro, diz para adotar o projeto com `curupira init`, e nenhum estado é
  gravado.

### C5. Trocar o perfil mantém o id do projeto

- **Cobre:** R6.
- **Ponto de partida:** projeto adotado; uma proposta nova com `language` igual e outra stack; "sim" pelo hook.
- **Ação:** `curupira init` com a proposta nova e `curupira approve profile`.
- **Resultado esperado:** o perfil tem a stack nova, o mesmo id de antes e duas decisões.

## Fora do escopo

- A leitura do projeto e a proposta escrita pelo agente: é instrução da skill de adoção (F03). Até ela existir, o
  agente faz à mão no repositório-piloto.
- As checagens que rodam os comandos do perfil (F04a e F04b).
- O bloco no `AGENTS.md`, as skills e os subagentes no `.claude/` (F03) e os hooks propostos na adoção (F05).
- A pasta dos artefatos configurável no perfil ([ADR-0023](../../decisoes/0023-estado-artefatos-e-dados-locais.md)):
  entra com a primeira peça que lê os artefatos.
- Um catálogo de mensagens em outro idioma além do pt-BR, e com ele as respostas desse idioma, como "yes" e "no"
  ([F01b](../F01b-prova-de-decisao-humana/spec.md)): enquanto só há o pt-BR, o `language` é conferido e gravado, e
  as respostas continuam "sim" e "não".
- O aviso de que a CLI instalada tem outra versão que a do perfil
  ([ADR-0024](../../decisoes/0024-o-que-fica-na-maquina-e-no-projeto.md)): vem com os arquivos do adaptador, na F03.
- A arquitetura e o ambiente de verificação, que a [jornada](../../conceitos/jornada.md) põe na fase 1: as
  [funcionalidades](../../product/features.md) e o [PRD](../../product/prd.md) não os põem no perfil, e eles entram
  com a peça que os usar.
- A tela inicial com o mascote ([ADR-0029](../../decisoes/0029-mascote-no-terminal.md)).

## Dados pessoais

O nome de autor do Git de quem aprova e o texto que sustentou a decisão, gravados no perfil, como na F01a e na F01b.
É o necessário para saber quem adotou o projeto (LGPD, art. 6º, III). A proposta, em `.curupira/local/`, fica fora
do Git. O campo `personalData` diz se o projeto trata dados pessoais, mas não guarda nenhum.

## Decisões

- **O perfil é JSON, em `.curupira/profile.json`**, porque a CLI e as checagens o leem; a pessoa vê o resumo no
  cartão de decisão ([ADR-0028](../../decisoes/0028-cartao-de-decisao.md)). A [jornada](../../conceitos/jornada.md)
  troca `profile.md` por `profile.json`.
- **Sem perfil, o `open` é barrado** (pergunta 1, respondida com "barrar"): a fase 3 de uma funcionalidade só
  começa depois da fase 1 do projeto. No piloto, o projeto é adotado logo depois do merge da F02.
- **A recusa só apaga a proposta:** o motivo aparece na conversa e no relato, mas não vai para o Git, porque ainda
  não há perfil onde gravar.
- **A aprovação da fase 1 usa os comandos da F01a**, com `profile` no lugar do ID da funcionalidade.
- **O `.gitignore` do projeto não muda:** toda gravação em `.curupira/local/`, e não só a do hook da F01b, cria
  antes o `.gitignore` de dentro da pasta. O [ADR-0023](../../decisoes/0023-estado-artefatos-e-dados-locais.md)
  ganha uma linha no histórico.
- **O id do projeto é um UUID aleatório**, criado na primeira aprovação
  ([ADR-0024](../../decisoes/0024-o-que-fica-na-maquina-e-no-projeto.md), regra 3).

## Riscos aceitos

- **Um "sim" digitado antes do `init` aprova a proposta que vier depois.** A resposta guardada não sabe a que pedido
  respondeu, como em toda aprovação desde a [F01b](../F01b-prova-de-decisao-humana/spec.md), e a prova pela conversa
  não é uma garantia formal ([ADR-0025](../../decisoes/0025-a-pessoa-decide-pela-conversa.md)). Por que aceitar: o
  "sim" ficou só para as aprovações, e "segue" continua os passos
  ([ADR-0030](../../decisoes/0030-como-o-agente-fala-com-a-pessoa.md)); amarrar a resposta ao pedido vale para todas
  as aprovações e pede uma peça própria.

## Histórico

- 2026-11-04: recusada na aprovação da fase 4, porque a fase 3 ficou com decisões em aberto e sem contraditório;
  voltou à fase 3.
- 2026-11-04: contraditório da fase 3, com 12 lacunas e 5 excessos; os destinos estão no
  [relato](../../pesquisa/relatos/2026-11-04-fase-3-f02.md).
