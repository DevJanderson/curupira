# ADR-0033: todo passo tem base

- **Status:** aceita
- **Data:** 2026-11-04

## Contexto

O [ADR-0032](0032-parar-a-recursao.md) mostrou que boa parte do método nasceu de regras inventadas na hora, a cada
lição, e que essas regras viraram peças da ferramenta. O Curupira quer ser uma fábrica de software de ponta a ponta,
agnóstica quanto ao projeto, mas que segue um padrão de desenvolvimento. Um padrão inventado não se defende diante de
quem já trabalha com práticas conhecidas, e não aproveita o que essas práticas já aprenderam.

A pessoa decidiu, em 2026-11-04: "nós não vamos fazer simplesmente coisas da nossa cabeça".

## Opções consideradas

- Seguir criando as regras a partir da experiência do próprio projeto.
- Exigir que cada passo do método se apoie numa prática de engenharia consolidada ou numa referência acadêmica.

## Decisão

A segunda.

1. **Cada passo da linha cita a sua base**: uma prática de engenharia consolidada e testada (de uma organização ou
   comunidade reconhecida) ou uma referência acadêmica, com a fonte em [fontes](../pesquisa/fontes.md), descrita e não
   copiada ([ADR-0020](0020-uso-de-referencias-de-terceiros.md)).
2. **Um passo novo só entra com a base junto.** A proposta mostra a fonte, o que ela diz e como se encaixa; o que não
   tem base vai para o [backlog](../product/backlog.md) até ter.
3. **Adaptar é permitido, e se diz o que mudou.** Quando o Curupira adapta uma prática (por exemplo, para um agente de
   IA), o ADR diz o que foi adaptado e por quê.
4. **A experiência do projeto mede, não inventa.** O que o Curupira aprende ao usar a linha serve para escolher entre
   práticas conhecidas e para ajustá-las, e entra pelo backlog.

## Consequências

- Os passos que a linha já tem são conferidos contra uma base, um a um, começando pelo fluxo no GitHub (a branch, o
  PR, a revisão, o merge, as issues). O que não tiver base vai para o backlog ou sai.
- As propostas ficam mais lentas de escrever, e mais fáceis de defender e de aprovar.
- [Fontes](../pesquisa/fontes.md) passa a ser a lista de bases do método, e não só da pesquisa.
