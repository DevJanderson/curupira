# Backlog

O que apareceu durante uma peça e não entrou nela: um achado cortado, uma melhoria, uma ideia, uma peça retirada da
fila ([ADR-0032](../decisoes/0032-parar-a-recursao.md)).

## Como funciona

- Durante uma peça, o que não entra no escopo vem para cá, com a origem, e a peça segue o fluxo até o fim.
- Nada daqui entra na peça em andamento.
- Depois de cada entrega, antes de abrir a próxima peça, a pessoa revê os itens pendentes e decide cada um: **entra**
  (numa peça da fila ou como peça nova), **sai** ou **fica**.
- Um item decidido guarda a decisão e a data; um item que sai não se apaga.

## Itens

| ID  | Item                                                                                                   | De onde veio                                          | Desde      | Decisão  |
| --- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ---------- | -------- |
| B01 | O `open` cria a branch `feat/<ID>` a partir da `main` e recusa com mudança sem commit                  | F01d, retirada da fila (regra 4 do ADR-0031)          | 2026-11-04 | pendente |
| B02 | O `adopt` e o `prd`, com as decisões das fases 1 e 2 gravadas em `.curupira/state/project.json`        | F01d, retirada da fila (regra 3 do ADR-0031)          | 2026-11-04 | pendente |
| B03 | O `status` mostra "esperando merge" para o que foi entregue ou aprovado na branch e não está na `main` | F01d, retirada da fila (regra 5 do ADR-0031)          | 2026-11-04 | pendente |
| B04 | Recusar os comandos de uma etapa fora da branch dela                                                   | contraditório da F01d, que o tirou da F01d para a F05 | 2026-11-04 | pendente |
| B05 | A retrospectiva que propõe melhorias e transforma defeitos que escapam em lições (antiga F13)          | retirada da fila pelo ADR-0032                        | 2026-11-04 | pendente |
| B06 | O comando que troca o nome do Curupira a partir da constante e migra os projetos (antiga F18)          | retirada da fila pelo ADR-0032                        | 2026-11-04 | pendente |
| B07 | Um nome de pasta com quebra de linha aparece cru na saída do `request`                                 | revisão da F01c, que o deixou como estava             | 2026-11-04 | pendente |
