# ADR-0008: Nome provisório e troca fácil

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

O nome "specwork" já existe no npm, numa ferramenta do mesmo nicho. O nome definitivo pode mudar até a publicação.

## Opções consideradas

- Manter "specwork".
- Nome novo, escrito onde for preciso.
- Nome novo, numa única constante.

## Decisão

O nome provisório é "Curupira". Ele fica numa única constante; pastas, comando e skills derivam dela.
Um teste barra o nome escrito fora dela, e um comando de renomear migra projetos.

## Consequências

- Trocar o nome é fácil até a publicação.
- O teste e o comando de renomear entram no escopo.

## Histórico

- 2026-11-03: a constante ganhou uma abreviação (`cr`), de onde sai o prefixo das skills e dos subagentes (`cr-`),
  para os nomes ficarem curtos, como o `sw-` do specwork. O comando e as pastas continuam com o nome inteiro.
