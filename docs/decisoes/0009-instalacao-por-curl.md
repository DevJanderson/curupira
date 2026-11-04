# ADR-0009: Instalação por curl

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

A pessoa precisa instalar o comando `curupira` uma vez por máquina (fase 0 da [linha](0031-a-linha.md)). Não há conta
no npm nem domínio próprio, e o repositório é público no GitHub.

## Opções consideradas

- **Script `curl` que confere o Node e roda `npm i -g`:** exige publicar no npm.
- **Binário único por sistema** (o `vp pack` gera) no GitHub Releases.
- **Script `curl` que baixa o Curupira do GitHub:** sem npm e sem domínio.

## Decisão

A instalação é um script baixado por `curl` do repositório no GitHub, pelo endereço do próprio GitHub
(`raw.githubusercontent.com`). O script confere o Node e o Git, baixa o Curupira do GitHub para a máquina, instala as
dependências e põe o comando `curupira` no caminho. Os detalhes (como baixa, para onde, como atualiza, HTTPS,
`--dry-run`) ficam para a spec da F00.

Publicar no npm, reservar o nome, ter um domínio e o binário por sistema ficam fora até a pessoa decidir.

## Consequências

- A F00 constrói o script, junto com o `init`.
- A instalação depende do GitHub estar no ar e do Node e do Git na máquina.

## Histórico

- 2026-11-04: deixou de ser adiada. Sai o `npm i -g` e entra o script que baixa do GitHub, sem npm nem domínio
  ([ADR-0031](0031-a-linha.md)).
