# Painel

## Para que serve

O painel é a planta da fábrica ao vivo. Ele deixa visível em que fase cada funcionalidade está, de quem é a vez e o
que espera decisão humana. Roda local, sem nuvem
([ADR-0011](../decisoes/0011-painel-aceita-decisoes-humanas.md),
[ADR-0012](../decisoes/0012-documentacao-em-markdown-no-painel.md),
ADR-0013 (no [registro de decisões](../decisoes/README.md))).

## Princípios

- **Não inventa dados.** O que falta aparece como "não registrado".
- **Ao vivo pelos hooks.** Os hooks avisam o painel do que acontece.
- **Ações humanas gravam pela CLI.** O painel nunca grava direto.
- **Cada tela responde a uma pergunta** que leva a uma decisão.

## Telas

| Tela                      | Pergunta                                         | O que mostra                                                                         |
| ------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Início                    | O que está esperando por mim?                    | Projetos, decisões pendentes, agentes trabalhando agora                              |
| Linha da fábrica          | Onde está cada funcionalidade e de quem é a vez? | As fases, com a marca de quem age: humano, agente ou parada                          |
| Revisão da funcionalidade | Posso aprovar isto?                              | Spec, cenários com veredito, provas em texto, comentários, aprovar ou pedir mudanças |
| Decisões                  | Por que isto foi feito assim?                    | ADRs e aprovações, com data e quem decidiu                                           |
| Medição                   | A fábrica está melhorando?                       | Tempo, custo, contexto, cache, voltas à spec, defeitos que escaparam                 |
| Documentação              | Como faço isto?                                  | Esta documentação, offline                                                           |

## Arquitetura

```text
pessoa ── conversa ──▶ agente ── chama ──▶ CLI ── grava ──▶ .curupira/
pessoa ── decide ───▶ painel ── pede ───▶ CLI
painel ◀── lê ─────── .curupira/
painel ◀── eventos ── hooks
```

- A pessoa conversa com o agente e decide no painel.
- O agente chama a CLI.
- A CLI é a única que grava os arquivos do projeto, em `.curupira/`.
- O painel lê esses arquivos e recebe eventos dos hooks.
- Decisões dadas no painel também passam pela CLI.
