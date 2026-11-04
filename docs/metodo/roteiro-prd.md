# Roteiro do PRD

## Para que serve

Um PRD vago contamina tudo o que vem depois: specs, cenários, código e revisão. Por isso, a entrevista vai em blocos
curtos, com uma pergunta por vez.

## Antes da entrevista

O agente lê o que o projeto já decidiu:

- visão, método e hipóteses;
- a jornada e a divisão entre humano e agente;
- as ferramentas estudadas;
- o índice das decisões de arquitetura e o conteúdo das que tratam de escopo;
- o perfil do projeto;
- o código, se o projeto já tiver.

O que já está escrito ou já existe no código vira confirmação ("pelo que está escrito, X; continua assim?"), e a
pessoa confirma ou corrige em vez de explicar do zero. Só o que não está escrito vira pergunta nova.

## Durante a entrevista

- Uma pergunta por vez, com opções quando ajudar.
- Ao fim de cada bloco, um resumo curto para a pessoa confirmar.
- Uma pergunta em aberto é registrada no momento em que aparece, em qualquer bloco; o bloco 7 só revisa a lista.
- Uma decisão de arquitetura que surgir vira pendência de ADR.
- Se uma resposta vier com variantes condicionais ("se for X, então Y"), o agente pergunta qual vale antes de seguir.

## Os 7 blocos

### 1. Problema

O que dói, com que frequência, e como é resolvido hoje. Quem sente o problema fica para o bloco 2.

- Que problema você quer resolver?
- Com que frequência ele aparece?
- Como as pessoas resolvem isso hoje, e o que falha nesse jeito?

### 2. Usuários

Quem usa, em que situação, e o que conta como sucesso para cada um.

- Quem vai usar o produto, e em que etapas?
- Em que momento do dia ou do trabalho essa pessoa usa?
- O que faria essa pessoa dizer que o produto deu certo? Em palavras; o número vem no bloco 3.

### 3. Objetivo e métrica

O que muda se der certo, como medir, e que princípio vale para o produto inteiro.

- O que muda no mundo se o produto der certo?
- Que número mostra o sucesso descrito no bloco 2?
- Qual valor desse número conta como sucesso, e em quanto tempo?
- Que princípio vale para o produto inteiro, em qualquer funcionalidade?

### 4. Escopo

O que entra, o que fica de fora, o que fica para depois, e o que o produto não é.

- O que precisa estar na primeira versão?
- O que fica de fora de propósito?
- O que o produto não é?
- O que é desejável, mas pode esperar?

### 5. Restrições

Prazo, stack, sistemas, serviços, dados, segurança e leis (como a LGPD).

- Há prazo ou data fixa?
- Que tecnologias são obrigatórias ou proibidas? Dependências e plataformas podem ser citadas pelo nome
  ([ADR-0020](../decisoes/0020-uso-de-referencias-de-terceiros.md), item 7).
- Em que sistemas operacionais o produto roda?
- Que serviços são obrigatórios (repositório de código, agente, ferramentas de design) e a que outros sistemas ele se
  integra?
- Que dados pessoais o produto trata, e que dados o próprio produto guarda sobre quem o usa?

### 6. Funcionalidades

A divisão em peças pequenas, cada uma entregável sozinha, em ordem de valor.

- Qual é a menor peça que já entrega valor sozinha?
- Que peça vem depois, e por quê?
- Alguma peça depende de outra para funcionar?
- Cada peça cabe no limite de tamanho do perfil do projeto? A que não couber se divide com sufixo (F10a, F10b), sem
  reaproveitar ID.

### 7. Perguntas em aberto

Revisão das perguntas registradas ao longo da entrevista, mais o que ainda não apareceu.

- O que você ainda não sabe sobre o problema ou os usuários?
- Que decisão depende de alguém que não está aqui?
- Onde estamos supondo sem ter certeza?

## O que sai da entrevista

- `prd.md`;
- a lista de perguntas em aberto;
- a lista de funcionalidades;
- as pendências de ADR.

O PRD só vale depois do "sim" da pessoa, na aprovação da fase 2.

## Histórico

- 2026-11-03: revisado a partir do relato da fase 2 (11 atritos).
