# Roteiro do PRD

## Para que serve

Um PRD vago contamina tudo o que vem depois: specs, cenários, código e revisão.
Por isso, a entrevista vai em blocos curtos, com uma pergunta por vez.

## Os 7 blocos

### 1. Problema

O que dói, para quem, e como é resolvido hoje.

- Que problema você quer resolver?
- Quem sente esse problema, e com que frequência?
- Como as pessoas resolvem isso hoje, e o que falha nesse jeito?

### 2. Usuários

Quem usa, em que situação, e o que conta como sucesso para cada um.

- Quem vai usar o produto?
- Em que momento do dia ou do trabalho essa pessoa usa?
- O que faria essa pessoa dizer que o produto deu certo?

### 3. Objetivo e métrica

O que muda se der certo, e como medir.

- O que muda no mundo se o produto der certo?
- Que número mostra essa mudança?
- Qual valor desse número conta como sucesso, e em quanto tempo?

### 4. Escopo

O que entra, o que fica de fora, e o que fica para depois.

- O que precisa estar na primeira versão?
- O que fica de fora de propósito?
- O que é desejável, mas pode esperar?

### 5. Restrições

Prazo, stack, dados, segurança, leis (como a LGPD) e integrações.

- Há prazo ou data fixa?
- Que tecnologias são obrigatórias ou proibidas?
- O produto guarda dados pessoais ou precisa se integrar a outros sistemas?

### 6. Funcionalidades

A divisão em peças pequenas, cada uma entregável sozinha, em ordem de valor.

- Qual é a menor peça que já entrega valor sozinha?
- Que peça vem depois, e por quê?
- Alguma peça depende de outra para funcionar?

### 7. Perguntas em aberto

O que ninguém sabe ainda, registrado para não virar suposição.

- O que você ainda não sabe sobre o problema ou os usuários?
- Que decisão depende de alguém que não está aqui?
- Onde estamos supondo sem ter certeza?

## Projeto que já tem código

O agente lê o código antes da entrevista e a transforma em confirmação:
"entendi que o sistema faz X; está certo?". A pessoa confirma ou corrige, em vez de explicar do zero.

## O que sai da entrevista

- `prd.md`;
- a lista de perguntas em aberto;
- a lista de funcionalidades.

O PRD só vale depois do "sim" da pessoa, no portão da fase 2.
