# ADR-0027: Idioma e vocabulário da ferramenta

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

O [ADR-0014](0014-estrutura-e-convencoes-do-repositorio.md) pôs os identificadores do código em inglês e a
documentação, as mensagens e os commits em pt-BR, mas trata só deste repositório. O que a ferramenta mostra e grava
no projeto de quem a usa estava todo em português: os comandos (`curupira iniciar`, `aprovar`, `recusar`), as pastas
e os arquivos (`.curupira/estado/`, `docs/produto/`, `plano.md`) e as respostas aceitas ("sim" e "não"). Para o
Curupira ser usado fora do Brasil, a interface precisa ser a mesma em toda parte.

O termo "portão" nomeava duas coisas diferentes:

- a decisão da pessoa entre fases (os 5 portões da [jornada](../conceitos/jornada.md));
- a checagem automática do código (a F04a, "Portões básicos", e os "portões locais" da fase 5).

Ele veio do inglês _gate_, que também tem os dois sentidos: o ponto de decisão entre etapas do Stage-Gate
([Cooper, 1990](../pesquisa/fontes.md#artigos-estudos-e-relatórios)) e o _quality gate_ da integração contínua. Um
nome para duas coisas gera confusão na documentação e para quem usa a ferramenta.

## Opções consideradas

- **Tudo em português:** fácil para quem lê no Brasil, mas a interface não serve a quem está fora.
- **Tudo em inglês, inclusive o texto que a pessoa lê:** uma versão só, mas afasta quem não lê inglês.
- **Interface em inglês e texto no idioma do projeto:** como o Git, os comandos são iguais em toda parte, e só as
  mensagens são traduzidas.

## Decisão

Interface em inglês e texto no idioma do projeto:

| O quê                                                                                                                                 | Idioma                                               |
| ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Código, comandos, opções, nomes de skills, subagentes e hooks, chaves dos arquivos de estado, pastas e arquivos que a ferramenta cria | inglês, sempre                                       |
| Instruções das skills e dos subagentes (o texto que o agente lê)                                                                      | inglês, com a ordem de responder no idioma do perfil |
| Mensagens da CLI, perguntas e documentos gerados para o projeto (o texto que a pessoa lê)                                             | o idioma do perfil do projeto; pt-BR primeiro        |
| Respostas aceitas numa decisão                                                                                                        | as do idioma do perfil: "sim"/"não", "yes"/"no"      |
| Este repositório: pesquisa, ADRs, relatos, roteiros e commits                                                                         | pt-BR, como no ADR-0014                              |
| README deste repositório                                                                                                              | inglês, com uma versão em pt-BR                      |

Até a F02 trazer o perfil, o idioma é pt-BR. As mensagens ficam fora do código, num catálogo por idioma, desde a
primeira peça com saída para a pessoa.

### Vocabulário

Um nome por conceito:

| Conceito                                              | Na interface                   | Na documentação em pt-BR |
| ----------------------------------------------------- | ------------------------------ | ------------------------ |
| A decisão da pessoa entre fases                       | approval (`approve`, `reject`) | aprovação                |
| A checagem automática (lint, tipos, testes, segredos) | check                          | checagem                 |
| As etapas da jornada                                  | phase                          | fase                     |
| Cada peça entregável                                  | feature                        | funcionalidade           |
| O resultado de um cenário na verificação              | verdict                        | veredito                 |
| O arquivo de configuração do projeto                  | profile                        | perfil                   |

"Portão" sai da documentação e da interface. Ele aparece só na pesquisa, como tradução de _gate_, com a fonte.

Exemplos da interface, para orientar as specs: `curupira init`, `curupira approve F01a`,
`curupira reject F01a --reason "…"`, `.curupira/state/F01a.json`, `docs/product/`,
`docs/specs/<ID>-<nome>/plan.md` e `verification.md`. Os nomes finais de cada comando ficam nas specs.

## Consequências

- A spec da F01a, aprovada, muda os nomes dos comandos e do caminho do estado. Pela regra da jornada, volta à fase 3
  e passa de novo pela aprovação; o comportamento não muda.
- A spec da F01b fica sem decisão até ser ajustada, e então vai à aprovação.
- O repositório-piloto segue a regra que vai impor aos outros: as pastas e os arquivos que a ferramenta cria passam a
  ter nome em inglês (`docs/produto/` vira `docs/product/`, por exemplo), e "portão" sai dos documentos. A lista exata
  e o ajuste dos links ficam para um passo próprio. As pastas deste repositório que a ferramenta não cria
  (`docs/decisoes/`, `docs/pesquisa/`, `docs/metodo/`, `docs/conceitos/`) ficam em português.
- A F02 ganha o idioma no perfil. A F04a e a F04b trocam "portões" por "checagens".
- Os caminhos dos ADRs 0023, 0024 e 0026 mudam no passo da renomeação, com linha no histórico de cada um.
- Complementa o ADR-0014, que continua valendo para este repositório.

## Histórico

- 2026-11-03: a renomeação foi feita no repositório-piloto:
  - `docs/produto/` virou `docs/product/`, com `features.md` e `open-questions.md`; os roteiros do PRD e da spec
    foram para `docs/metodo/`, porque são do método deste repositório, e não arquivos que a ferramenta cria;
  - nas specs, `plano.md` virou `plan.md`, e o ADR-0015 mudou de nome;
  - na máquina, a pasta de cache passou a `~/.cache/curupira/projects/`;
  - a pasta vazia `docs/produto/` foi apagada;
  - "portão" virou "aprovação" ou "checagem" em toda a documentação, menos no registro e nos relatos, que guardam o
    que aconteceu, e na pesquisa;
  - a spec da F01a voltou à fase 3 com os comandos `open`, `status`, `advance`, `approve` e `reject --reason`.
