# Roteiro da spec

## Para que serve

A spec diz o que uma funcionalidade deve fazer, de um jeito que dá para aprovar, testar e verificar. Ela é ancorada
([ADR-0002](../decisoes/0002-nivel-de-spec-driven-development.md)): evolui junto com o código. É curta de propósito;
o que não cabe vira outra peça.

## Antes de escrever

O agente lê:

- a linha da funcionalidade em [funcionalidades](funcionalidades.md) e o trecho do [PRD](prd.md) que trata dela;
- as [perguntas em aberto](perguntas-em-aberto.md) ligadas a ela;
- os ADRs que ela toca;
- as specs das funcionalidades de que ela depende;
- o código que já existe na área.

O que já está decidido entra na spec com a referência e não vira pergunta.

## O que sai

Dois arquivos em `docs/specs/<ID>-<nome>/`, um por portão
([ADR-0026](../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md)):

- `spec.md`: objetivo, requisitos, cenários, fora do escopo, dados pessoais, decisões e o que falta esclarecer; passa
  pelo portão da fase 4;
- `plano.md`: os passos da implementação; não passa por portão.

A `verificacao.md`, do portão da fase 7, vem depois, na verificação.

## spec.md

### Requisitos em EARS

Cada requisito é uma frase com um gatilho e uma resposta, numa das cinco formas do EARS
([fontes](../pesquisa/fontes.md#artigos-estudos-e-relatórios)):

| Forma      | Modelo                                             |
| ---------- | -------------------------------------------------- |
| Sempre     | O SISTEMA DEVE <resposta>.                         |
| Evento     | QUANDO <gatilho>, O SISTEMA DEVE <resposta>.       |
| Estado     | ENQUANTO <estado>, O SISTEMA DEVE <resposta>.      |
| Indesejado | SE <condição>, ENTÃO O SISTEMA DEVE <resposta>.    |
| Opcional   | ONDE <recurso existir>, O SISTEMA DEVE <resposta>. |

- Cada requisito tem um ID (R1, R2…) e descreve um comportamento só.
- O comportamento é observável de fora: um comando, um arquivo, uma saída. A spec não diz como implementar.
- Requisito que não dá para testar é reescrito ou sai.

### Cenários

- Cada cenário tem um ID (C1, C2…), os requisitos que cobre, um ponto de partida, uma ação e um resultado esperado,
  e verifica uma condição só.
- O cenário roda contra o sistema real (comando, arquivo, saída), pelo verificador separado
  ([verificação](../conceitos/verificacao.md)).
- Os cenários cobrem os comportamentos principais; o resto dos requisitos é coberto pelos testes do plano. Todo
  requisito aparece num cenário ou num passo do plano.
- Cenário aprovado vira teste de regressão.

### As outras seções

- **Fora do escopo:** o que a peça não faz, para a revisão não cobrar.
- **Dados pessoais:** os campos com dados pessoais e a base legal; "nenhum", quando não houver.
- **Decisões:** o que foi decidido ao escrever a spec, com a referência (ADR, pergunta respondida). Decisão de
  arquitetura vira pendência de ADR.
- **A esclarecer:** cada dúvida fica marcada no ponto do texto como `[A ESCLARECER: …]`. A spec não vai para
  aprovação com marca aberta.

## plano.md

- Passos pequenos, em ordem. Cada passo diz o teste que falha primeiro (a prova do vermelho), o que muda, os
  requisitos que atende e os arquivos que toca.
- Passo grande se quebra em dois.
- O plano é do agente e pode mudar na implementação; o que muda o comportamento volta para a spec.

## Tamanho

Até a [Q03](perguntas-em-aberto.md) fixar os números, valem como provisórios: até 10 requisitos e até 5 cenários.
Acima disso, o agente propõe dividir a peça com sufixo (F10a, F10b), em vez de levar uma spec grande ao portão.

## As perguntas

- Primeiro o rascunho, depois as perguntas: o agente escreve a spec, marca o que falta e só pergunta o que muda um
  requisito ou um cenário.
- No máximo 5 perguntas, uma por vez, com opções quando ajudar.
- Cada resposta muda a spec na hora. Se uma resposta vier com variantes condicionais, o agente pergunta qual vale.
- Se precisar de mais de 5, a peça é grande demais ou o PRD tem uma lacuna: o agente propõe dividir ou voltar ao PRD.

## O portão

A spec, com os cenários, só vale depois do "sim" da pessoa, no portão da fase 4. O plano não passa pelo portão.

## Histórico

- 2026-11-03: primeira versão, para a fase 3 à mão da F01.
- 2026-11-03: os cenários passaram para dentro do `spec.md` (ADR-0026).
