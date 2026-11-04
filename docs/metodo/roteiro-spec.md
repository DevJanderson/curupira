# Roteiro da spec

## Para que serve

A spec diz o que uma funcionalidade deve fazer, de um jeito que dá para aprovar, testar e verificar. Ela é ancorada
([ADR-0002](../decisoes/0002-nivel-de-spec-driven-development.md)): evolui junto com o código. É curta de propósito;
o que não cabe vai para o [backlog](../product/backlog.md).

## Antes de escrever

O agente lê:

- a linha da funcionalidade em [funcionalidades](../product/features.md) e o trecho do [PRD](../product/prd.md) que
  trata dela;
- as [perguntas em aberto](../product/open-questions.md) ligadas a ela;
- os ADRs que ela toca;
- as specs das funcionalidades de que ela depende;
- o código que já existe na área.

O que já está decidido entra na spec com a referência e não vira pergunta.

## O que sai

Dois arquivos em `docs/specs/<ID>-<nome>/`, um por aprovação
([ADR-0026](../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md)):

- `spec.md`: as seis perguntas (abaixo), os dados pessoais, as decisões e o que falta esclarecer; passa pela
  aprovação da fase 4;
- `plan.md`: os passos da implementação; não passa por aprovação.

A `verification.md`, da aprovação da fase 7, vem depois, na verificação.

## spec.md

### As seis perguntas

A spec responde a seis perguntas e está pronta quando as seis têm resposta, e não quando não tem lacuna
([ADR-0032](../decisoes/0032-parar-a-recursao.md)):

| Pergunta                          | Seção          |
| --------------------------------- | -------------- |
| Qual é o problema, e para quem?   | Objetivo       |
| Quanto tempo a peça vale?         | Prazo          |
| O que ela entrega?                | Requisitos     |
| Como se sabe que acabou?          | Cenários       |
| O que ela não faz?                | Fora do escopo |
| O que a pessoa aceita ao aprovar? | Riscos aceitos |

O que aparece durante a escrita e não cabe nas respostas vai para o [backlog](../product/backlog.md).

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
- Caso de borda não vira requisito: o arquivo que não se lê, o link simbólico, duas execuções ao mesmo tempo, a
  gravação interrompida, dois erros juntos. Ele vira item de teste no plano, e o eixo de segurança da revisão confere
  a lista do [roteiro da entrega](roteiro-entrega.md#fase-7-revisão).
- Quando uma regra depende de texto digitado (uma resposta, um nome, um comando), a spec lista exemplos do que vale e
  do que não vale, variando pontuação, espaços e maiúsculas; os testes de unidade usam essa lista.
- Cenário aprovado vira teste de regressão.

### As outras seções

- **Fora do escopo:** o que a peça não faz, para a revisão não cobrar.
- **Dados pessoais:** os campos com dados pessoais e a base legal; "nenhum", quando não houver.
- **Decisões:** o que foi decidido ao escrever a spec, com a referência (ADR, pergunta respondida). Decisão de
  arquitetura vira pendência de ADR.
- **Riscos aceitos:** o que a pessoa aceita ao aprovar (um custo, um limite, um comportamento que pode incomodar),
  cada um com o porquê; "nenhum", quando não houver. O risco da implementação vai para o plano, e a informação de
  contexto, para o aviso de passo ([ADR-0030](../decisoes/0030-como-o-agente-fala-com-a-pessoa.md)).
- **A esclarecer:** cada dúvida fica marcada no ponto do texto como `[A ESCLARECER: …]`. A spec não vai para
  aprovação com marca aberta.

## plan.md

- Passos pequenos, em ordem. Cada passo diz o teste que falha primeiro (a prova do vermelho), o que muda, os
  requisitos que atende e os arquivos que toca.
- Passo grande se quebra em dois.
- O plano é do agente e pode mudar na implementação; o que muda o comportamento volta para a spec.
- O primeiro passo que tem saída para a pessoa roda a entrada real (o comando, a página, a API), e não só os testes:
  o executor de testes pode aceitar o que o ambiente real recusa.
- O passo dos cenários não tem vermelho natural, porque testa o que os passos anteriores fizeram. Ele prova que os
  cenários pegam defeito com uma mutação de propósito no código, desfeita em seguida.
- O plano lista as consequências de ADR que o código toca. Uma consequência que pede checagem por máquina vira teste
  no primeiro passo que toca aquilo.

## Prazo

A spec diz o prazo da peça, em horas de trabalho do agente. Se o rascunho não cabe no prazo, o agente corta escopo e
põe o que saiu no backlog; a peça não se divide no meio da fase 3. Estourou o prazo na implementação: corta-se de novo,
em vez de estender.

## O contraditório

Quem escreve a spec não vê as próprias lacunas nem os próprios excessos. Entre o rascunho e as perguntas, um
subagente, com outro modelo do mesmo agente quando houver, lê a peça no contexto dele, numa adaptação do contraditório
do specwork ([fontes](../pesquisa/fontes.md#ferramentas-e-métodos)), e procura as duas coisas: o que impede a
implementação ou contradiz um ADR, e o que passa do PRD ou se repete.

Regras:

- Uma rodada só. Ele lê só os arquivos (PRD, funcionalidades, spec, plano, ADRs que a peça toca, specs de que ela
  depende), nunca a conversa: um achado só vale com o arquivo e o trecho.
- Só entra na spec o que muda o que a pessoa vê ou impede a implementação. Caso de borda vai para o plano, como
  teste. O resto vai para o [backlog](../product/backlog.md), e não é recusado nem discutido.
- O que é decisão da pessoa (escopo, regra de negócio, custo aceito) vira pergunta.
- O histórico do `spec.md` diz quantos achados houve e quantos entraram.

## As perguntas

- Primeiro o rascunho, depois o contraditório, depois as perguntas: o agente escreve a spec, marca o que falta, passa
  pelo contraditório e só pergunta o que muda um requisito ou um cenário.
- No máximo 5 perguntas, uma por vez, com opções quando ajudar.
- Cada resposta muda a spec na hora. Se uma resposta vier com variantes condicionais, o agente pergunta qual vale.
- Se precisar de mais de 5, a peça é grande demais ou o PRD tem uma lacuna: o agente propõe cortar escopo ou voltar
  ao PRD.

## A aprovação

A spec, com os cenários, só vale depois do "sim" da pessoa, na aprovação da fase 4. O plano não passa pela aprovação.

A spec só vai para a aprovação sem marca aberta, sem pergunta pendente e com um destino para cada achado do
contraditório. O cartão de decisão ([ADR-0028](../decisoes/0028-cartao-de-decisao.md)) aponta o que já está decidido
e os riscos aceitos; se o agente ainda tem uma pergunta, a spec não está pronta.

## Histórico

- 2026-11-03: primeira versão, para a fase 3 à mão da F01.
- 2026-11-03: os cenários passaram para dentro do `spec.md` (ADR-0026).
- 2026-11-03: o roteiro passou de `docs/produto/` para `docs/metodo/`, os arquivos a `plan.md` e `verification.md`, e
  "portão" a "aprovação" (ADR-0027).
- 2026-11-03: depois da entrega da F01a, entraram os erros de leitura e gravação, o cenário de dois erros juntos, a
  entrada real no plano e a mutação no passo dos cenários
  ([relato](../pesquisa/relatos/2026-11-03-fase-5-f01a.md)).
- 2026-11-03: depois da entrega da F01b, entraram os exemplos para regras de texto digitado, a mutação em todo teste
  escrito depois do comportamento e o teste para a consequência de ADR checada por máquina
  ([relato](../pesquisa/relatos/2026-11-03-fase-5-f01b.md)).
- 2026-11-04: depois da recusa da fase 4 da F02, com decisões em aberto no cartão, entraram o contraditório entre o
  rascunho e as perguntas e a seção de riscos aceitos. Nenhuma regra saiu: nada antes cobria as lacunas que quem
  escreve não vê.
- 2026-11-04: a Completude passa a conferir a peça contra a linha, os achados ficam no histórico do `spec.md`, e o
  outro olhar é outro modelo do mesmo agente ([ADR-0031](../decisoes/0031-a-linha.md)). Saiu a menção a outro agente
  de terminal, que o ADR-0005 deixa fora da v1.
- 2026-11-04: a regra dos dados gravados passa a cobrir o link simbólico, o caminho de outro dono, duas execuções ao
  mesmo tempo e a interrupção no meio, os quatro defeitos de segurança da F00
  ([relato](../pesquisa/relatos/2026-11-04-fases-5-a-7-f00.md)). Nenhuma regra saiu: a regra cresceu sem virar outra.
- 2026-11-04: a regra dos dados gravados passa a valer também para o que a funcionalidade lê e mostra: o link em
  qualquer parte do caminho e o nome que vai cru para a saída, os dois pontos da segurança da F01c que a spec não
  previa ([relato](../pesquisa/relatos/2026-11-04-fases-5-a-7-f01c.md)). Nenhuma regra saiu: a regra cresceu sem virar
  outra.
- 2026-11-04: pelo [ADR-0032](../decisoes/0032-parar-a-recursao.md), a spec responde a seis perguntas; o prazo
  substitui o limite de tamanho; o contraditório tem um subagente e uma rodada, com corte, e o que sobra vai para o
  backlog. Saíram as regras dos dados gravados e lidos, a de dois erros juntos (para a revisão de segurança) e a
  mutação em todo teste escrito depois (fica só no passo dos cenários).
