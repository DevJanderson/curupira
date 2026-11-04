# ADR-0025: A pessoa decide pela conversa

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

A pessoa trabalha na conversa com o agente, no terminal. Sair dela para rodar um comando em outro terminal quebra o
fluxo. Ao mesmo tempo, a CLI é o único escritor do estado
([ADR-0011](0011-painel-aceita-decisoes-humanas.md)) e precisa saber que uma aprovação ou recusa veio da pessoa, e não
do agente decidindo sozinho.

Fatos da documentação do Claude Code:

- Uma skill com `disable-model-invocation: true` só é chamada pela pessoa, com `/nome`; o modelo não a chama
  sozinho ([skills](https://code.claude.com/docs/en/skills)).
- O hook `UserPromptSubmit` recebe o texto como a pessoa digitou, inclusive a linha de um comando como
  `/deploy staging` ([hooks](https://code.claude.com/docs/en/hooks)).
- O prefixo `!` roda um comando direto da conversa, sem passar pelo modelo
  ([modo interativo](https://code.claude.com/docs/en/interactive-mode)).
- Uma regra que proíbe um comando cobre a forma que o modelo costuma escrever e "isn't a security boundary"
  ([permissões](https://code.claude.com/docs/en/permissions)).

O specwork já resolvia isso assim: a aprovação era uma skill que só a pessoa chama, a resposta "sim" valia só
digitada, um hook a registrava, e o comando de aprovar conferia o registro
([sw-approve-spec](https://github.com/DevJanderson/specwork/blob/main/src/specwork/skills/sw-approve-spec/SKILL.md)).

## Opções consideradas

- A pessoa roda a CLI em outro terminal: tira a pessoa da conversa.
- A pessoa roda a CLI com `!` na conversa: obriga a saber os comandos e não existe igual em outros agentes.
- A pessoa pede pela conversa e responde digitando; o agente roda a CLI; um hook registra a resposta digitada; a CLI
  só aceita a decisão com esse registro.

## Decisão

A pessoa decide pela conversa:

| Quem   | Faz o quê                                                                                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pessoa | roda a fase 0 (a instalação e o `init`); depois, pede pelas skills `/cr-…` (as de aprovação, só ela chama) e, nas aprovações, digita "sim" ou "não" com o motivo |
| Agente | roda a CLI                                                                                                                                                       |
| Hook   | registra cada resposta digitada, chamando `curupira hook answer`, em `.curupira/local/`                                                                          |
| CLI    | grava o estado e só aceita uma aprovação ou recusa se houver uma resposta digitada que a sustente                                                                |

Toda aprovação tem um pedido, registrado pelo agente antes de pedir a resposta; a CLI só aceita uma resposta digitada
depois dele ([ADR-0031](0031-a-linha.md), regra 6).

Uma escolha clicada numa pergunta com opções não vale como aprovação ou recusa, porque o hook não a vê. No painel, a
decisão passa pela mesma regra (F16).

A regra da CLI vale para qualquer agente. Como capturar a resposta digitada é do adaptador de cada agente
([ADR-0021](0021-nucleo-independente-de-agente-com-adaptadores.md)).

## Consequências

- A pessoa não sai da conversa para decidir.
- O mecanismo impede o agente de se aprovar por engano e deixa rastro (quem, quando e o texto digitado), mas não é
  uma garantia formal contra um agente que tente burlar: a documentação não dá essa garantia.
- A F01 se divide: a F01a guarda o estado e os comandos, e a F01b exige a resposta digitada. As skills ficam com a
  F03, e a ligação do hook, com o `init` da F00.
- No repositório-piloto, até a F00, o hook fica ligado à mão no `.claude/settings.json`.

## Histórico

- 2026-11-03: o hook passou a `curupira hook answer`, e "portão" passou a "aprovação"
  ([ADR-0027](0027-idioma-e-vocabulario-da-ferramenta.md)).
- 2026-11-04: a pessoa roda a fase 0; a ligação do hook passa da F05 para o `init` da F00; a regra do `!` no piloto
  sai, porque a F01b já aprova pela conversa; toda aprovação tem um pedido ([ADR-0031](0031-a-linha.md)).
