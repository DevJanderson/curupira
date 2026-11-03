# F01a: plano

Cada passo começa por um teste que falha (a prova do vermelho). A lógica fica em `packages/core`, e o comando em
`apps/cli`. Os caminhos e o nome do comando saem da constante do nome (`DATA_DIR` e `CLI_NAME`, ADR-0008).

## 1. As fases e os portões da jornada

- **Teste primeiro:** a fase seguinte de cada fase; quais fases têm portão; a fase de volta de cada recusa, com e
  sem `--spec`; o formato do ID (F, número e sufixo opcional).
- **O que muda:** `packages/core/src/journey.ts`, com as regras como funções puras, sem disco.
- **Requisitos:** R4, R5, R6, R7.

## 2. O arquivo de estado

- **Teste primeiro:** gravar e ler `.curupira/estado/<ID>.json` numa pasta temporária; uma decisão nova entra no fim
  sem mudar as anteriores; um arquivo inválido gera erro com o nome do arquivo e o problema.
- **O que muda:** `packages/core/src/state.ts`, com gravação atômica (arquivo temporário e troca de nome).
- **Requisitos:** R1, R9, R10.

## 3. Quem decide

- **Teste primeiro:** com `user.name` configurado, devolve o nome; sem ele, um erro que diz como configurar.
- **O que muda:** `packages/core/src/git-author.ts`, que lê só o nome, não o e-mail.
- **Requisitos:** R8.

## 4. Os comandos

- **Teste primeiro:** cada comando chamado com argumentos de exemplo grava ou mostra o esperado, e termina com erro
  quando deve.
- **O que muda:** `apps/cli`, com `abrir`, `estado`, `concluir`, `aprovar` e `recusar`, usando os passos 1 a 3.
- **Requisitos:** R2 a R8.

## 5. Os cenários como testes de regressão

- **Teste primeiro:** C1 a C5, cada um num repositório Git descartável, chamando a CLI real.
- **O que muda:** `apps/cli/tests/`.
- **Requisitos:** os que os cenários cobrem.
