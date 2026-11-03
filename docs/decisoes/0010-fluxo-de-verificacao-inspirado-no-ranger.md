# ADR-0010: Fluxo de verificação inspirado no Ranger

- **Status:** proposta
- **Data:** 2026-11-03

## Contexto

É preciso verificar que o agente entregou o que a spec pede, sem chamar a pessoa a cada falha.
O fluxo de verificação do Ranger serve de inspiração.

## Opções consideradas

Não registradas.

## Decisão

- Poucos cenários por funcionalidade, uma condição cada.
- Verificador em subagente próprio, chamado por um comando só.
- Vereditos: verificado, parcial, bloqueado e falhou.
- Laço de correção sem chamar o humano.
- Hook antes da compactação.
- Cenário aprovado vira teste de regressão.
- Para backend, as provas são requisições, respostas e saídas de teste.

## Consequências

- A pessoa só é chamada quando o veredito é "bloqueado".
- Os cenários aprovados se acumulam como suíte de regressão.
