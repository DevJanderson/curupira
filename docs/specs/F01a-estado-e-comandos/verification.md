# F01a: verificação

- **Código verificado:** `e3a8509`, na branch `feat/F01a`
- **Data:** 2026-11-03
- **Verificador:** um subagente separado, que não implementou o código; leu só a [spec](spec.md) e rodou só a CLI
  real, cada cenário num repositório Git descartável, com a configuração global do Git isolada.

As provas brutas (comandos, saídas, códigos de saída, estado antes e depois) ficaram em
`.curupira/local/F01a/verification/`, fora do Git ([verificação](../../conceitos/verificacao.md)).

## Vereditos

| Cenário                                            | Veredito   |
| -------------------------------------------------- | ---------- |
| C1. O estado mostra a fase e o que espera decisão  | verificado |
| C2. Aprovar registra quem e quando                 | verificado |
| C3. Aprovar fora da fase com aprovação é recusado  | verificado |
| C4. Recusar na fase 7 volta à implementação        | verificado |
| C5. Duas funcionalidades em branches não conflitam | verificado |

## Resumo das provas

- **C1.** Com a F01a na fase 4 e a F02 na fase 3, `status` saiu com código 0 e mostrou
  `F01a  fase 4  espera aprovação` e `F02  fase 3`; os dois arquivos ficaram iguais (sha256).
- **C2.** Com a F01a na fase 4, já com uma recusa anterior, `approve F01a` levou à fase 5 e gravou
  `{"phase":4,"decision":"approve","by":…,"at":…}` no fim da lista; a decisão anterior ficou igual, e os arquivos da
  F02 e da F03 também (sha256).
- **C3.** Com a F02 na fase 3, `approve F02` saiu com código 1 e `F02 está na fase 3, que não tem aprovação.`; o
  arquivo da F02 não mudou (sha256, mtime e inode).
- **C4.** Com a F01a na fase 7, `reject F01a --reason "faltou tratar o erro de rede"` levou à fase 5 e gravou a
  recusa com a fase 7, o autor, a data e hora e o motivo. Com `--spec`, a volta foi à fase 3.
- **C5.** F01a e F02 aprovadas em branches diferentes; `git merge` sem conflito (fast-forward e `ort`, e também com
  `--no-ff`), `git status` limpo, e `status` mostrou as duas na fase 5, cada arquivo com a sua aprovação.

## Prova do vermelho

- Passos 1 a 4 do plano: cada teste rodou falhando antes do código (13, 5 e 4 testes, e o módulo da CLI ausente).
- Passo 5: os cenários passaram de primeira, porque testam o que os passos anteriores fizeram. Uma mutação de
  propósito (a recusa da fase 7 voltando à 3) fez o C4 falhar.
- Correções da verificação: cada uma começou por um teste falhando (5, 2 e 1 testes).

## O laço de correção

Os cinco cenários deram "verificado" desde a 1ª rodada. Os achados fora dos cenários foram corrigidos em três voltas:

| Rodada | Código    | Achados                                                                                     | Correção  |
| ------ | --------- | ------------------------------------------------------------------------------------------- | --------- |
| 1ª     | `da4b5d1` | conteúdo `[]` com o motivo errado; `x.json` aceito; "fase delivered" na mensagem (defeitos) | `b7526ed` |
| 2ª     | `b7526ed` | `open` quebrava com stack trace ao não conseguir gravar                                     | `c2adf15` |
| 3ª     | `c2adf15` | pasta de estado ilegível: stack trace no `status` e "não está na jornada" no `advance`      | `e3a8509` |
| 4ª     | `e3a8509` | nenhum                                                                                      | —         |

Também na 1ª rodada, por serem baratas: a recusa na fase 8 passou a dizer "continua na fase 8, sem merge", arquivo
ilegível deixou de quebrar, e decisão com autor vazio ou data inválida passou a ser estado inválido.

## Observações para a revisão

Pontos em que a spec é silenciosa, que ficaram como estão:

- A recusa com `--spec` grava a mesma decisão que a recusa sem ela; o registro não diz se a volta foi à fase 3 ou à 5.
- Com um arquivo de estado malformado, `status` recusa, mas comandos sobre outra funcionalidade funcionam.
- `F00` e `F001` são IDs aceitos (a regra é dois ou mais dígitos).
- `reject --reason` sem valor mostra só o texto de uso, sem dizer o que faltou; `--reason=x` também é aceito.
- Vale só o `user.name` do Git; `GIT_AUTHOR_NAME` no ambiente é ignorado.
- Chaves a mais no arquivo de estado são mantidas sem aviso.
- Um arquivo de estado só de leitura (444), numa pasta que aceita escrita, é substituído pela gravação atômica.
- O `status` mostra a aprovação pela fase; quem aprovou e quando ficam no arquivo de estado.

## Histórico

- 2026-11-03: aprovada na fase 7 com "sim", por Janderson, no PR
  [DevJanderson/curupira#1](https://github.com/DevJanderson/curupira/pull/1), no commit `db841f8`, com a CI passando.
