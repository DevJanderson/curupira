# ADR-0022: Sem API de modelo: só agentes de terminal

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

O Curupira precisa de um modelo de IA para produzir, verificar e revisar. A pessoa já tem um agente de terminal
instalado e autenticado, que fala com o modelo.

## Opções consideradas

- Chamar a API do modelo direto: exigiria chaves, custo separado e um caminho fora do agente da pessoa.
- Trabalhar só através dos agentes de terminal que a pessoa já tem.

## Decisão

O Curupira não chama API de modelo nenhuma e não tem servidor próprio. Ele trabalha só através dos agentes de
terminal que a pessoa já tem instalados e autenticados, e nunca pede nem guarda chave de API.

## Consequências

- O verificador separado roda como subagente, com definição própria e recebendo só ponteiros, ou como outra sessão
  do agente em modo não interativo (como `claude -p`); nunca por API.
- A medição lê os registros de sessão que o agente grava na máquina, e cada adaptador
  ([ADR-0021](0021-nucleo-independente-de-agente-com-adaptadores.md)) sabe ler o formato do seu agente.
