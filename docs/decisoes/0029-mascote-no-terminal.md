# ADR-0029: O mascote no terminal

- **Status:** adiada, pelo [ADR-0032](0032-parar-a-recursao.md): nenhuma peça o constrói
- **Data:** 2026-11-04

## Contexto

A CLI é a cara da ferramenta no terminal. Um mascote na tela inicial dá identidade e ajuda a reconhecer a saída da
CLI no meio da conversa, como faz o Claude Code na abertura. Mas a saída da CLI também é lida por agentes, roda em CI
e passa por pipes, e o hook não pode escrever nada na saída padrão
([F01b](../specs/F01b-prova-de-decisao-humana/spec.md)).

O desenho foi explorado fora do repositório em seis rodadas, em pixels coloridos com meio-bloco (`▀` e `▄`: dois
pixels por caractere, um na cor da letra e outro na cor do fundo). As regras de desenho vieram de duas skills abertas,
lidas e adaptadas, sem cópia ([fontes](../pesquisa/fontes.md), [ADR-0020](0020-uso-de-referencias-de-terceiros.md)).
As rodadas de perfil, com mais detalhe, ficaram ilegíveis no tamanho do terminal.

## Opções consideradas

- Sem mascote, só o nome em texto.
- Arte em ASCII com caracteres de caixa: funciona em qualquer terminal, mas fica pobre.
- Pixels coloridos com meio-bloco, de frente e simples, só onde a saída é para uma pessoa.

## Decisão

O mascote é um curupira de frente, em pixels coloridos com meio-bloco:

- coroa de três chamas, cabeça larga, olhos grandes de 2x2 com brilho, roupa de folhas e duas pernas;
- 14 cores, em rampas para o fogo, a pele e as folhas, sem contorno preto, para servir em fundo escuro e claro;
- os pés virados para trás não aparecem de frente nesse tamanho: a identidade fica no cabelo de fogo e nas folhas.

Onde ele aparece:

| Onde                                                                      | Tamanho            | Movimento                                      |
| ------------------------------------------------------------------------- | ------------------ | ---------------------------------------------- |
| tela inicial: o comando sem argumentos                                    | 16x16, em 8 linhas | entrada correndo pela esquerda, cerca de 1,6 s |
| `init` e `--version`                                                      | 16x16, em 8 linhas | parado                                         |
| cartão de decisão na saída da CLI ([ADR-0028](0028-cartao-de-decisao.md)) | 12x6, em 3 linhas  | parado                                         |

Quando ele aparece: só com a saída padrão num terminal (TTY), sem `NO_COLOR`, sem `CI` e com cor de 256 ou mais.
Com truecolor, as cores são exatas; com 256, cada cor tem um índice fixo e distinto. Em qualquer outro caso, sai só
o texto, sem códigos ANSI. Na conversa, o agente nunca desenha o mascote: o cartão da conversa usa só os ícones.

A animação esconde o cursor, redesenha as 8 linhas no lugar e devolve o cursor no fim e no Ctrl-C. O texto ao lado
do mascote só aparece no último quadro. Qualquer tecla pula para o fim. Não há opção para desligar a animação:
ela só toca no comando sem argumentos, e `init` e `--version` mostram o mascote parado.

O desenho fica num módulo da CLI, com as grades e a paleta; o núcleo não escreve no terminal. O nome escrito ao lado
vem da constante do [ADR-0008](0008-nome-provisorio-e-troca-facil.md); se o nome mudar, o mascote muda por um ADR novo.

## Consequências

- A tela inicial ganha identidade sem atrapalhar agentes, pipes nem CI.
- Os testes conferem que, sem TTY, com `NO_COLOR` ou com `CI`, a saída não tem códigos ANSI nem o mascote, e que a
  animação devolve o cursor.
- A F01a já tem a CLI; a tela inicial e o mascote entram como um passo de uma funcionalidade da CLI, com spec, e não
  como peça solta. O protótipo fora do repositório é a referência do desenho.
- O desenho é original: olhos grandes com brilho, coroa de chamas e várias cores por área, diferente do bloco de uma
  cor e dos olhos de traço do mascote do Claude Code.
