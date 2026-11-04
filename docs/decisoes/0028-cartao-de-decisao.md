# ADR-0028: O cartão de decisão

- **Status:** aceita
- **Data:** 2026-11-04

## Contexto

Na aprovação da fase 7 da F01b, a pessoa respondeu "sim" um minuto depois do pedido, sem olhar o código
([parecer](../pesquisa/relatos/2026-11-04-parecer-do-fluxo.md)). O pedido era um texto corrido: o que pedia a
atenção dela estava misturado com o que a máquina já tinha conferido. Isso ameaça a H5
([hipóteses](../metodo/hipoteses.md)): a revisão humana só rende nos pontos de decisão se a pessoa souber onde olhar.

O pedido aparece em lugares diferentes: a conversa no terminal, a conversa no aplicativo de desktop, outros agentes
([ADR-0021](0021-nucleo-independente-de-agente-com-adaptadores.md)) e a saída da própria CLI. Nem todo terminal
mostra emoji. A resposta continua digitada, sem botão ([ADR-0025](0025-a-pessoa-decide-pela-conversa.md)).

## Opções consideradas

- Texto corrido, como até a F01b: é fácil de escrever e fácil de aprovar sem ler.
- Uma lista de tudo o que mudou: é completa, mas devolve à pessoa o trabalho de achar o que importa.
- Um cartão curto no fim da mensagem, com no máximo 3 pontos que pedem o olho da pessoa e a forma de responder.

## Decisão

Todo pedido de aprovação termina com um cartão de decisão. A explicação vem antes; o cartão é a última coisa da
mensagem, para a pessoa achar sem rolar.

O cartão tem cinco partes, nesta ordem. Os ícones aparecem só nos títulos e cada um tem um sentido fixo:

| Ícone | Rótulo sem emoji | Parte                                                                                 |
| ----- | ---------------- | ------------------------------------------------------------------------------------- |
| 🛑    | [DECIDA]         | o que está em decisão: a funcionalidade, a fase e o link do que se aprova             |
| 👀    | [OLHE]           | até 3 pontos de atenção, cada um com onde olhar (arquivo e linha) e o que perguntar   |
| ⚠️    | [RISCO]          | o que ficou em aberto e por quê                                                       |
| ✅    | [CONFERIDO]      | o que a máquina já conferiu (checagens, cenários, revisão), para a pessoa não refazer |
| ⌨️    | [RESPONDA]       | como responder: `sim` ou `não, <motivo>`                                              |

- O 🛑 aparece só no cartão, para continuar raro e chamar a atenção.
- Mais de 3 pontos de atenção é sinal de peça grande: o agente propõe dividir, em vez de alongar o cartão.
- Um ponto de atenção é algo que só a pessoa decide (um comportamento, um nome, um risco aceito), e não um
  resumo do que mudou.
- Onde não há emoji, valem os rótulos entre colchetes. Os rótulos e o texto do cartão saem no idioma do projeto
  ([ADR-0027](0027-idioma-e-vocabulario-da-ferramenta.md)).
- O "sim" continua puro ([F01b](../specs/F01b-prova-de-decisao-humana/spec.md)); o cartão só mostra a forma.

O tempo do pedido até a resposta é medido em toda aprovação, só como dado: um "sim" rápido não é barrado. É o número
que diz se a pessoa teve tempo de olhar os pontos do cartão.

## Consequências

- A pessoa sabe onde olhar e o que já foi conferido; o agente precisa escolher o que leva ao cartão.
- A H5 ganha um número por aprovação: o tempo até a resposta, ao lado dos defeitos achados em cada fase.
- Até as skills existirem, o agente monta o cartão à mão nas aprovações da F02, e o relato anota o tempo até a
  resposta. As skills de aprovação da F03 montam o cartão; a F12 guarda o tempo com a medição; a CLI usa o mesmo
  formato quando mostra o que espera decisão.
- O que o cartão diz é texto para a pessoa; os dados por trás dele (pontos, links, checagens) não vão para o estado.

## Histórico

- 2026-11-04: o cartão passou a ser um dos três tipos de mensagem do agente
  ([ADR-0030](0030-como-o-agente-fala-com-a-pessoa.md)).
