# Roteiro da spec

## Para que serve

A spec diz o que uma funcionalidade deve fazer, de um jeito que dá para aprovar, testar e verificar. Ela é ancorada
([ADR-0002](../decisoes/0002-nivel-de-spec-driven-development.md)): evolui junto com o código. É curta de propósito;
o que não cabe vira outra peça.

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

- `spec.md`: objetivo, requisitos, cenários, fora do escopo, dados pessoais, decisões, riscos aceitos e o que falta
  esclarecer; passa pela aprovação da fase 4;
- `plan.md`: os passos da implementação; não passa por aprovação.

A `verification.md`, da aprovação da fase 7, vem depois, na verificação.

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
- Para cada dado que a funcionalidade grava, a spec diz o que acontece quando ele não pode ser lido ou gravado (pasta
  sem permissão, arquivo que é pasta, disco cheio).
- Quando duas condições de erro podem acontecer juntas (fase errada e autor ausente, por exemplo), um cenário ou
  requisito diz qual erro vence.
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
- O mesmo vale para todo teste escrito depois de o comportamento existir, como os das correções da verificação e da
  revisão: um teste que passa de primeira só conta depois de uma mutação de propósito que o derrube.
- O plano lista as consequências de ADR que o código toca. Uma consequência que pede checagem por máquina vira teste
  no primeiro passo que toca aquilo.

## Tamanho

Até a [Q03](../product/open-questions.md) fixar os números, valem como provisórios: até 10 requisitos e até 5 cenários.
Acima disso, o agente propõe dividir a peça com sufixo (F10a, F10b), em vez de levar uma spec grande à aprovação.

## O contraditório

Quem escreve a spec não vê as próprias lacunas. Entre o rascunho e as perguntas, dois subagentes leem a peça, cada um
no seu contexto, numa adaptação do contraditório do specwork ([fontes](../pesquisa/fontes.md#ferramentas-e-métodos)):

- **Completude** procura o que vai parar a implementação ou mudar a spec depois: um estado ou erro sem requisito, uma
  decisão sem base, uma dependência dada como pronta que não está, uma contradição com um ADR, a jornada ou outra
  spec, uma melhoria de relato que não foi aplicada. Ela também confere a peça contra a
  [linha](../decisoes/0031-a-linha.md): quem roda cada comando, o que vem antes e o que vem depois.
- **Necessidade** responde a cada achado da Completude, concordando ou contestando com evidência, e procura o que
  passa do PRD, o que se repete, o teste de implementação no lugar do de comportamento e a estrutura nova para o que
  já existe.

Regras:

- Os dois leem só os arquivos (PRD, funcionalidades, perguntas em aberto, spec, plano, ADRs, jornada, specs de que a
  peça depende, relatos), nunca a conversa: um achado só vale com o arquivo e o trecho.
- Cada achado é uma linha: lacuna ou excesso, a tese, a evidência e a recomendação (incorporar, cortar ou perguntar).
- O agente dá um destino a cada achado: **incorporado** na spec ou no plano, **recusado**, com o motivo, ou
  **perguntado**, só quando é decisão da pessoa (escopo, regra de negócio, custo aceito). Os perguntados entram nas
  perguntas.
- No máximo duas rodadas; a segunda só roda se a primeira mudou um requisito ou um cenário.
- Um dos dois subagentes usa outro modelo do mesmo agente, quando houver
  ([roteiro da entrega](roteiro-entrega.md#fase-7-revisão)).
- O histórico do `spec.md` guarda os achados e o destino de cada um, sem arquivo novo. No repositório-piloto, o
  relato também guarda.

## As perguntas

- Primeiro o rascunho, depois o contraditório, depois as perguntas: o agente escreve a spec, marca o que falta, passa
  pelo contraditório e só pergunta o que muda um requisito ou um cenário.
- No máximo 5 perguntas, uma por vez, com opções quando ajudar.
- Cada resposta muda a spec na hora. Se uma resposta vier com variantes condicionais, o agente pergunta qual vale.
- Se precisar de mais de 5, a peça é grande demais ou o PRD tem uma lacuna: o agente propõe dividir ou voltar ao PRD.

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
