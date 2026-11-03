# Contexto e cache

## Por que importa

O desempenho dos modelos cai à medida que a entrada cresce (context rot). Por isso, o contexto é um recurso escasso.
A regra é entregar o menor conjunto de informação de alto sinal e carregar o resto sob demanda.
As fontes estão em [fontes.md](../pesquisa/fontes.md#artigos-estudos-e-relatórios).

## Três camadas

| Camada                  | O que contém                                | Quando entra      | Cuidado                                      | Cache                          |
| ----------------------- | ------------------------------------------- | ----------------- | -------------------------------------------- | ------------------------------ |
| 1. Base estável         | AGENTS.md/constituição, regras, ferramentas | Sempre, no início | Mínima                                       | Prefixo fixo, ideal para cache |
| 2. Contexto da estação  | Spec, plano, ADRs, tarefa atual             | Por estação       | Por referência a arquivos, não cópia         | Enquanto a estação dura        |
| 3. Contexto de trabalho | Arquivos lidos, saídas de testes, buscas    | Sob demanda       | Compactar, descartar ou delegar a subagentes | Não cachear                    |

## Subagentes

Um subagente tem janela de contexto própria, sem o histórico do agente principal.
Para cada papel, o Curupira define:

- **contrato de entrada:** um briefing mínimo, com a tarefa, os arquivos e o critério de pronto;
- **contrato de saída:** o formato e o tamanho máximo do resumo que volta;
- **ferramentas restritas ao papel;**
- **notas em arquivo,** para sobreviver à compactação.

## Cache de prompt

Ler do cache custa cerca de 10% do preço normal de entrada; gravar no cache custa um pouco mais. As regras:

- ordem fixa, do que muda menos para o que muda mais;
- nada volátil (data, IDs) no início do contexto;
- não editar a constituição no meio da sessão;
- medir a taxa de acerto do cache.

## Lição da pesquisa

Na tentativa anterior, o contexto do agente chegou a centenas de milhares de tokens por resposta
(ver o [estado da arte](../pesquisa/estado-da-arte.md)).
O Curupira terá um teto de tamanho de contexto por papel, medido em teste.
