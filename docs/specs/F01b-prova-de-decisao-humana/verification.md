# F01b: verificação

- **Código verificado:** `aca391f`, na branch `feat/F01b`
- **Data:** 2026-11-03
- **Verificador:** um subagente separado, que não implementou o código; leu só a [spec](spec.md) e os testes dos
  cenários, e rodou só a CLI real, cada cenário num repositório Git descartável, com a sessão definida em cada comando.

As provas brutas ficaram em `.curupira/local/F01b/verification/`, fora do Git
([verificação](../../conceitos/verificacao.md)).

## Vereditos

| Cenário                                           | Veredito   |
| ------------------------------------------------- | ---------- |
| C1. Um "sim" digitado permite aprovar             | verificado |
| C2. Sem resposta digitada, a aprovação é recusada | verificado |
| C3. Uma resposta não vale duas vezes              | verificado |
| C4. Um "não" digitado recusa com o motivo         | verificado |
| C5. Um "sim" com outra frase não aprova           | verificado |

## Resumo das provas

- **C1.** Com "sim" passado pelo hook, `approve F01a` saiu com código 0, levou à fase 5 e gravou `"answer":"sim"` na
  decisão; o arquivo da resposta existia antes e não existe depois.
- **C2.** Sem nada no hook, `approve F01a` saiu com código 1 e
  `…precisa digitar "sim" sozinho na conversa (ou "sim F01a").`; o estado ficou igual (sha256).
- **C3.** Depois de aprovar a F01a com um "sim", `approve F02` sem nova mensagem saiu com código 1 e pediu o "sim"; os
  arquivos da F01a e da F02 ficaram iguais (sha256).
- **C4.** Com "não, faltou tratar o erro de rede" no hook, `reject F01a` na fase 7 saiu com código 0, levou à fase 5 e
  gravou `"reason":"faltou tratar o erro de rede"`; a resposta foi apagada.
- **C5.** Com "sim, e mais uma coisa" no hook, `approve F01a` saiu com código 1 e
  `O "sim" precisa vir sozinho na mensagem…`; o estado não mudou.

Também conferido: o hook não escreve nada na saída padrão e só sai com 0 ou 1; o texto fica guardado só quando a
mensagem começa por "sim" ou "não"; um "sim" de outra sessão não vale; um comando que falha não consome a resposta; o
texto digitado não entra no Git, nem com `git add -A`.

## Os testes dos cenários

O verificador leu `apps/cli/tests/scenarios-f01b.test.ts`. Na 1ª rodada, o ajudante que monta o ponto de partida não
conferia cada passo, e o C3 não conferia o motivo da recusa. Corrigido; na 2ª rodada, os cinco testes cobrem todas
as partes do resultado esperado.

## Prova do vermelho

- Passos 1 a 3 do plano: cada teste rodou falhando antes do código.
- Passo 5: duas mutações de propósito. Sem apagar a resposta usada, o C1 e o C3 falharam; aceitando qualquer texto que
  comece por "sim", o C5 falhou.
- Correções da verificação: os 5 testes novos falharam antes do código.

## O laço de correção

| Rodada | Código    | Achados                                                                                                    | Correção  |
| ------ | --------- | ---------------------------------------------------------------------------------------------------------- | --------- |
| 1ª     | `4dde830` | 2 defeitos: `sim?`, `sim!` e `sim:F02` aprovavam (R2); sem sessão, a mensagem não dizia o que digitar (R5) | `aca391f` |
| 2ª     | `aca391f` | nenhum defeito; só observações                                                                             | —         |

Na 1ª rodada também saíram três observações: a idade da resposta passou a vir da data dela, uma resposta de mais de
30 dias deixou de valer antes da limpeza, e o ID da própria funcionalidade saiu do começo do motivo.

## Observações para a revisão

Pontos em que a spec é silenciosa, que ficaram como estão (o limite de rodadas para observações foi atingido):

- "nao", sem acento, não conta como recusa; fica só a marca, e a mensagem orienta a digitar "não, <motivo>".
- "não F02, motivo" recusa a F01a e grava "F02, motivo" como motivo; o "sim F02", ao contrário, não aprova a F01a.
- Na recusa, a decisão grava só o motivo, e não o texto digitado inteiro (compatível com a seção Dados pessoais).
- Uma resposta com `at` inválido ou no futuro aprova, e a limpeza não a apaga; só acontece mexendo no arquivo à mão.
