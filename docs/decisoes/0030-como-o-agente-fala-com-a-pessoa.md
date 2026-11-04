# ADR-0030: Como o agente fala com a pessoa

- **Status:** aceita
- **Data:** 2026-11-04

## Contexto

As mensagens do agente para a pessoa não têm forma fixa. Nas 14 últimas mensagens longas da conversa que escreveu o
[ADR-0029](0029-mascote-no-terminal.md), o tamanho foi de 350 a 4.900 caracteres; os títulos às vezes eram `#`, às
vezes negrito, às vezes nada; uma mensagem tinha 31 itens de lista. Os problemas que isso trouxe:

- o que a pessoa precisava saber ficava no meio do texto, como as escolhas que o agente fez sem perguntar;
- a pergunta para a pessoa às vezes estava só na caixa de próximo passo do aplicativo de desktop, que não existe em
  outros agentes nem no terminal;
- nomes internos (variáveis, IDs de sessão, hashes) apareciam no meio do que a pessoa lê;
- o pedido de aprovação da fase 7 da F01b era uma lista de 14 itens, e o "sim" veio em um minuto
  ([parecer](../pesquisa/relatos/2026-11-04-parecer-do-fluxo.md)).

O [ADR-0028](0028-cartao-de-decisao.md) resolveu o pedido de aprovação, mas não o resto das mensagens.

## Opções consideradas

- Deixar a forma livre e confiar no bom senso do agente: é o que deu a confusão acima.
- Um formato único para tudo: pesado para uma resposta curta a uma pergunta.
- Poucos tipos de mensagem, cada um com forma fixa, e uma regra para escolher entre tabela, lista e texto.

## Decisão

O agente fala com a pessoa em três tipos de mensagem.

**1. Aviso de passo**, ao fim de cada passo. As partes vêm sempre nesta ordem; uma parte vazia não aparece:

| Parte                | O que diz                                                              |
| -------------------- | ---------------------------------------------------------------------- |
| linha de estado      | ✅ feito, ⏸ esperando a pessoa ou ❌ falhou, e o resultado numa frase  |
| O que mudou          | os arquivos e o que mudou neles, com link, e se as checagens passaram  |
| Decidi sem perguntar | cada escolha que o agente fez sozinho e que a pessoa pode desfazer     |
| Não feito            | o que ficou de fora ou sem conferir (um envio, uma checagem, um teste) |
| 🔥 Próximo           | o passo que o agente sugere e como seguir                              |

- O aviso cabe em cerca de 20 linhas. O detalhe vai para o relato, com link.
- "Decidi sem perguntar" nunca fica de fora quando houve escolha: é onde a pessoa pega o agente no caminho errado.

**2. Cartão de decisão**, só nas aprovações, na forma do [ADR-0028](0028-cartao-de-decisao.md). Ele entra no lugar do
"🔥 Próximo".

**3. Resposta**, quando a pessoa pergunta: a resposta vem primeiro, em texto corrido, sem as partes fixas. Se a
resposta pedir uma ação, ela termina com o "🔥 Próximo".

Regras que valem para os três:

- **Tabela** quando três ou mais itens são comparados pelas mesmas características (opções, vereditos,
  recomendações); **lista** para itens soltos; **texto corrido** para explicar um porquê.
- A pergunta para a pessoa está sempre no texto da mensagem, mesmo que o agente tenha outra forma de perguntar.
- Nomes internos (variáveis, IDs, hashes) só entram quando a pessoa precisa deles para agir.
- **"segue" continua, "sim" aprova.** Para continuar um passo, a pessoa digita "segue". O "sim" fica só para as
  aprovações ([ADR-0025](0025-a-pessoa-decide-pela-conversa.md)), para não virar reflexo. "segue" não é decisão: o
  hook não o registra e a CLI não o exige.
- O 🔥 é a voz do mascote na conversa: marca só o "Próximo". O desenho do mascote fica no terminal
  ([ADR-0029](0029-mascote-no-terminal.md)).

## Consequências

- A pessoa lê a primeira linha e sabe o resultado; lê "Decidi sem perguntar" e sabe o que conferir.
- O texto vem no idioma do projeto e os títulos das partes também
  ([ADR-0027](0027-idioma-e-vocabulario-da-ferramenta.md)).
- O agente escreve neste formato à mão a partir de agora, na F02, para testar antes de virar regra das skills na
  F03. O relato da F02 diz o que funcionou.
- A tela inicial da CLI ([ADR-0029](0029-mascote-no-terminal.md)) mostra, ao lado do mascote, o projeto, a
  funcionalidade em andamento, o que espera decisão e o "🔥 Próximo"; com uma aprovação pendente, mostra o cartão.
