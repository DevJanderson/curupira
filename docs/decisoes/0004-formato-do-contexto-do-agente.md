# ADR-0004: Formato do contexto do agente

- **Status:** proposta
- **Data:** 2026-11-03

## Contexto

O agente precisa de contexto sobre o projeto, mas contexto demais custa caro e pode atrapalhar.
Um estudo da ETH Zurich (2026) mostrou que arquivos de contexto gerados por LLM pioram o sucesso e encarecem em 20%+;
os escritos por humanos ajudam pouco, e só se forem enxutos.

## Opções consideradas

- Arquivo de contexto gerado por LLM.
- Arquivo de contexto extenso, escrito à mão.
- AGENTS.md mínimo + contexto carregado sob demanda.

## Decisão

Tendência: AGENTS.md mínimo, só com o que o agente não descobre lendo o código, mais contexto carregado sob demanda.

## Consequências

- O AGENTS.md precisa ser revisado para continuar enxuto.
- O contexto sob demanda depende de um mecanismo de carga, como as skills do Claude Code ([ADR-0005](0005-so-claude-code-na-v1.md)).
