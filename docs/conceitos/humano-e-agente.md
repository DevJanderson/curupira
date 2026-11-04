# Humano e agente

## A divisão de trabalho

- **O humano decide e aprova.** Define a intenção, escolhe entre caminhos e dá o "sim" em cada aprovação.
- **O agente produz.** Escreve specs, testes, código e relatórios, e um verificador separado, que não implementou o
  código, confere o resultado ([verificação](verificacao.md)).
- **A CLI garante que o fluxo seja seguido.** Ela registra cada decisão e não deixa uma fase começar antes da
  aprovação anterior.

## As 5 aprovações

As aprovações ficam nas fases 1, 2, 4, 7 e 8 da [linha](../decisoes/0031-a-linha.md). A fase 0, a instalação e o
`init`, é da pessoa, no terminal; da fase 1 em diante, ela decide pela conversa, e toda aprovação tem um pedido.

| Fase                | O que a pessoa decide                                                               | Se ela disser não                                                       |
| ------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1. Adotar o projeto | Se a ficha do projeto (o perfil, com as partes que as peças acrescentam) o descreve | O agente ajusta a proposta e apresenta de novo; o perfil não é gravado  |
| 2. Produto (PRD)    | Se o PRD descreve o produto que ela quer                                            | A entrevista continua no ponto que falta; nenhuma funcionalidade começa |
| 4. Aprovar          | Se a spec e os cenários dizem o que a funcionalidade deve fazer                     | A funcionalidade volta à fase 3; nada é implementado                    |
| 7. Revisar          | Se a funcionalidade entregue está pronta para o merge                               | Volta à fase 5, ou à 3 se a mudança alterar a spec                      |
| 8. Entregar         | Se a funcionalidade está entregue e quais melhorias entram no método                | A funcionalidade fica na fase 8; melhoria recusada não vira trabalho    |

## O humano revisa resultados, não cada falha

A pessoa revisa resultados e decisões, não cada falha do caminho.
Entre as aprovações, o agente trabalha sozinho: corrige o que falhou, e o verificador separado confere de novo.
Ele só chama a pessoa quando a verificação dá "bloqueado", ou seja, quando o ambiente não deixou testar
(ver [verificação](verificacao.md)).

## Escritor único

Nenhuma decisão vale se não passar pela CLI, seja ela dada no terminal ou no painel
([ADR-0011](../decisoes/0011-painel-aceita-decisoes-humanas.md)).
Assim, terminal e painel nunca divergem: os dois gravam pelo mesmo caminho.

## O merge é sempre humano

O agente abre o PR, mas nunca faz o merge. Integrar o código é da pessoa, depois do "sim" da fase 8; até o merge,
o `status` mostra a funcionalidade como "esperando merge".
