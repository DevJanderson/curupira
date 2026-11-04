# F01c: verificação

- **Código verificado:** `8d80e74`, na branch `feat/F01c`
- **Data:** 2026-11-04
- **Verificador:** um subagente separado, de outro modelo (Sonnet), que não implementou o código; leu só a
  [spec](spec.md), a [verificação](../../conceitos/verificacao.md) e os testes dos cenários, e rodou a CLI da branch
  como caixa-preta, em repositórios Git descartáveis, com a configuração global do Git vazia.

As provas brutas ficaram em `.curupira/local/F01c/verification/`, fora do Git.

## Vereditos

| Cenário                                                       | Veredito   |
| ------------------------------------------------------------- | ---------- |
| C1. O pedido e um "sim" depois dele aprovam                   | verificado |
| C2. Sem pedido, a aprovação é recusada                        | verificado |
| C3. Um "sim" anterior ao pedido não vale                      | verificado |
| C4. A spec mudada depois do pedido não é aprovada             | verificado |
| C5. Um commit novo depois do pedido da revisão não é aprovado | verificado |

## Resumo das provas

- **C1.** O `request` gravou a fase, a hora, o caminho e o hash; depois do "sim", o `approve` levou a F09 à fase 5, e
  a decisão guardou a hora do pedido, o caminho e o mesmo SHA-256 do `sha256sum`; o pedido saiu do estado.
- **C2.** O `approve` saiu com 1 e disse que o pedido vem antes, citando `curupira request F09`; o estado ficou igual
  (sha256).
- **C3.** Com o "sim" antes do `request`, o `approve` saiu com 1 e disse que a pessoa precisa responder de novo; o
  estado ficou igual.
- **C4.** Com o `spec.md` mudado, e em outra rodada apagado, depois do pedido, o `approve` saiu com 1 e pediu um pedido
  novo; o estado ficou igual.
- **C5.** Com um commit novo depois do pedido da fase 7, o `approve` saiu com 1 e pediu um pedido novo, citando o
  commit; com um arquivo novo sem commit, citou o arquivo. O estado ficou igual.

Também conferido, além dos cenários: um `request` novo substitui o anterior, e um recusado não toca o que já estava
gravado; cada recusa do R2 (fase sem aprovação, spec ausente, em duas pastas, pasta, link, ilegível, sem commit,
mudança sem commit, fora do Git) sai com 1 sem gravar; uma mudança só em `.curupira/` não conta; o `reject` pede o
pedido e uma resposta posterior, não confere o conteúdo e guarda os campos do pedido; o teto do R7 com 280 e 281
caracteres, letras acentuadas, emojis e espaços nas pontas; um estado antigo, com um motivo de 500 caracteres, é lido
e continua intacto depois de uma decisão nova; e a ordem dos erros do `approve` e do `reject`.

## Os testes dos cenários

O verificador leu `apps/cli/tests/scenarios-f01c.test.ts`. Duas lacunas, corrigidas: o C2 conferia só o trecho
`request F09`, que também está na mensagem do conteúdo mudado; o C1 não conferia que o pedido sai do estado. Duas
mutações de propósito (a mensagem do C2 trocada pela do conteúdo mudado e o pedido deixado no estado) fizeram o C2 e o
C1 falharem; depois, foram desfeitas.

## Prova do vermelho

- Passos 1, 3 e 4 do plano: os testes rodaram falhando antes do código (13 do `request`, com 12 falhando; 4 do
  conteúdo mudado; 2 do teto).
- Passo 2: o código veio antes dos testes novos. A prova foi feita depois, com o código do passo 2 guardado: 11 testes
  falharam, e todos passaram com ele de volta.
- Passo 6: uma mutação por cenário (a decisão sem os campos do pedido, a decisão sem pedido aceita, a resposta
  anterior aceita, o hash da spec não conferido, o commit não conferido); cada uma fez o seu cenário falhar.

## Observações

Nenhuma contraria a spec.

- A mensagem do `request` mostrava a hora com 1 ms de diferença da gravada, porque lia o relógio duas vezes.
  Corrigido: a leitura é uma só.
- Os cenários dependem de a resposta e o pedido não caírem no mesmo milissegundo; cada um roda em um processo
  separado, e o caso da mesma hora está nos testes dos comandos.
- O hash da fase 4 cobre só o `spec.md`: mudar outro arquivo não invalida a aprovação, como diz a decisão da spec.

## Histórico

- 2026-11-04: aprovada na fase 7 com "sim", por Janderson, no PR
  [#5](https://github.com/DevJanderson/curupira/pull/5). É a primeira aprovação gravada com o pedido: o `request` da
  CLI da branch, às 16:12, no commit `d54861a`, e o `approve`, às 16:14.
