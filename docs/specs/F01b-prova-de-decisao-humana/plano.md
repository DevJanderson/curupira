# F01b: plano

Cada passo começa por um teste que falha (a prova do vermelho). Depende da F01a.

## 1. O registro das respostas

- **Teste primeiro:** guardar a última mensagem de uma sessão em `.curupira/local/`, no lugar da anterior, com o
  texto só se ela começar por "sim" ou "não"; ler e apagar a resposta; apagar as de mais de 30 dias. Numa pasta
  temporária.
- **O que muda:** `packages/core/src/answers.ts`.
- **Requisitos:** R1, R4, R6.

## 2. A entrada do hook do Claude Code

- **Teste primeiro:** um JSON de exemplo do hook `UserPromptSubmit` vira uma resposta com o texto e a sessão; um JSON
  inválido gera erro claro.
- **O que muda:** o adaptador do Claude Code, num pacote próprio em `packages/`.
- **Requisitos:** R1.

## 3. A regra nos comandos

- **Teste primeiro:** `aprovar` e `recusar` com e sem resposta que os sustente.
- **O que muda:** os comandos da F01a, em `apps/cli`, e o `curupira hook resposta`.
- **Requisitos:** R2, R3, R5.

## 4. O hook no repositório-piloto

- **Teste primeiro:** não se aplica; é configuração.
- **O que muda:** a entrada `UserPromptSubmit` no `.claude/settings.json` do repositório, chamando
  `curupira hook resposta`.
- **Requisitos:** R1.

## 5. Os cenários como testes de regressão

- **Teste primeiro:** C1 a C4, cada um num repositório Git descartável.
- **O que muda:** `apps/cli/tests/`.
- **Requisitos:** os que os cenários cobrem.
