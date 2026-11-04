# Relato: parecer sobre o loop da F01

Na aprovação da fase 4 da F01d, a pessoa recusou com um pedido: entender o que faz o projeto girar em volta de si
mesmo, por que as necessidades não apareceram no começo, e como parar isso, com base em fontes. A F01d voltou à
fase 3 e fica parada até a decisão.

## Os números

Em dois dias (2026-11-03 e 2026-11-04):

| Medida                         | Valor                                                                    |
| ------------------------------ | ------------------------------------------------------------------------ |
| Funcionalidades entregues      | 4 de 22 (F01a, F01b, F00, F01c), todas de governança do próprio método   |
| Funcionalidades para o usuário | nenhuma: adotar um projeto (F02), o PRD (F06) e a spec (F07) não andam   |
| Commits                        | 158: 106 de documentação, 15 de funcionalidade                           |
| Linhas acrescentadas           | 6.422 de documentação, 1.403 de código, 3.154 de testes                  |
| ADRs                           | 32                                                                       |
| Achados por contraditório      | F02: 23; ADR-0031: 28; F00: 22; F01c: 26; F01d: 34; revisão do fluxo: 61 |
| Achados recusados na F01d      | 2 de 34                                                                  |
| Mudanças do método nas fases 8 | 15 (F01a: 6, F01b: 4, F00: 3, F01c: 2); uma só tirou uma regra           |

## Por que as coisas não apareceram no começo

São três causas diferentes, e só a primeira é normal.

### 1. Parte só aparece usando, e isso é esperado

O `init` com quatro sentidos só apareceu quando a F02 foi escrita; a ligação entre o "sim" da fase 8 e o merge só
apareceu quando a F01a foi entregue. Nenhum documento escrito antes teria achado isso. O problema não é aprender: é o
que o método faz com o que aprende. Cada lição vira escopo **agora**, antes da próxima entrega:

- a F02 foi recusada duas vezes, e a recusa virou uma revisão de tudo (61 achados), que virou o ADR-0031, que criou
  a F00 e a F01c, que se dividiu na F01d, que muda a F02;
- como o produto é o próprio método, cada regra nova do método vira uma funcionalidade nova da ferramenta para
  cumpri-la. É uma recursão: quanto mais o método aprende, mais longe fica o produto.

### 2. Parte é detalhe que não precisava estar na spec

A Completude procura o que falta, e um leitor atento sempre acha mais: o HEAD solto, `refs/heads/main`, a ordem
exata dos erros, o squash e o rebase, o arquivo malformado. São casos de borda que um teste ou a revisão do código
pegariam na fase 5 ou 7. Postos na spec, eles viram requisitos; os requisitos passam do limite de 10; a peça se
divide. A regra de tamanho conta requisitos, e a precisão infla requisitos: **a spec cresce até se dividir por
construção**. Não há critério de parada: nada diz qual achado fica de fora por ser pequeno.

### 3. As regras só sobem

O histórico dos roteiros repete "Nenhuma regra saiu". A poda entrou como recomendação no
[parecer do fluxo](2026-11-04-parecer-do-fluxo.md) e tirou uma regra em quatro entregas. Cada entrega deixa a
seguinte mais cara.

### E o que falta: um limite de tempo

O escopo é fixo e o tempo é livre. Nada diz "a F01d tem duas horas; o que não couber sai". Sem esse limite, cada
achado aceito parece de graça, e a soma não é.

## O que dizem as fontes

Fontes abertas em 2026-11-04 por um subagente de pesquisa; a frase da Anthropic sobre o revisor foi conferida de
novo pelo agente na página. Tudo descrito, nada copiado
([ADR-0020](../../decisoes/0020-uso-de-referencias-de-terceiros.md)).

| Tema                           | Fonte                                                                                                                                                                                                                                          | O que diz, em resumo                                                                                                                                                             | O que tem a ver conosco                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Revisor que sempre acha        | [Anthropic, boas práticas do Claude Code](https://code.claude.com/docs/en/best-practices)                                                                                                                                                      | quem revisa com a ordem de achar problemas sempre acha; corrigir tudo traz abstração a mais e testes para casos impossíveis; pedir só o que afeta a correção                     | é a Completude: 22 a 61 achados por rodada, quase todos aceitos             |
| Regras impostas                | a mesma página                                                                                                                                                                                                                                 | o conjunto de regras barradas por hook deve ser pequeno; dezenas delas são, na maioria, preferência                                                                              | cada regra do método vira uma funcionalidade para impô-la                   |
| Começar simples                | [Anthropic, Building effective agents (2024)](https://www.anthropic.com/engineering/building-effective-agents)                                                                                                                                 | a solução mais simples primeiro; complexidade só quando melhora o resultado de forma demonstrada; o ciclo avaliador e otimizador só com critério claro de avaliação              | nove fases e dois revisores em toda peça, sem medição que mostre o ganho    |
| Crítica sem fim                | [Self-Refine (2023)](https://arxiv.org/abs/2303.17651), [Huang et al. (2024)](https://arxiv.org/abs/2310.01798), [Cihan et al. (2025)](https://arxiv.org/abs/2412.18531)                                                                       | o ganho da autocrítica vem nas primeiras voltas e depois cai; sem feedback externo, o modelo não se corrige com segurança; revisão por LLM na indústria aumentou o tempo dos PRs | o contraditório não tem critério de parada nem teto de achados              |
| Tempo fixo, escopo variável    | [Shape Up, 37signals](https://basecamp.com/shapeup/1.2-chapter-03) ([disjuntor](https://basecamp.com/shapeup/2.2-chapter-08), [cortar escopo](https://basecamp.com/shapeup/3.5-chapter-14))                                                    | o tempo é decidido antes e limita o desenho; o que não termina no prazo não ganha prorrogação; compara-se com o que existe hoje, não com o ideal; cortar é parte do trabalho     | nenhuma peça tem prazo; o que não cabe se divide em vez de sair             |
| Crescer do que funciona        | [Lei de Gall](https://lawsofsoftwareengineering.com/laws/galls-law/), [tracer bullets, Hunt e Thomas (2003)](https://www.artima.com/articles/tracer-bullets-and-prototypes), [YAGNI, Fowler (2015)](https://martinfowler.com/bliki/Yagni.html) | sistema complexo que funciona nasce de um simples que funcionava; primeiro um fio fino de ponta a ponta; o que se constrói por antecipação custa quatro vezes                    | quatro peças de governança e nenhum fio do produto de ponta a ponta         |
| Bootstrap                      | [Rust, bootstrapping](https://rustc-dev-guide.rust-lang.org/building/bootstrapping/what-bootstrapping-does.html)                                                                                                                               | o compilador não se constrói com o próprio método desde o começo: parte de um estágio zero pronto, e cada estágio constrói o seguinte                                            | o Curupira se impõe o método inteiro antes de ter o estágio zero            |
| Críticas ao SDD                | [Böckeler, martinfowler.com (2025)](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html), [Zaninotto, Marmelab (2025)](https://marmelab.com/blog/2025/11/12/spec-driven-development-waterfall-strikes-back.html)               | um fluxo só para todo tamanho; Markdown longo é pior de revisar que código; specs longas trazem casos de borda imaginados e dobram a revisão                                     | 6.422 linhas de documentação para 1.403 de código                           |
| Para onde as ferramentas foram | [GitHub Spec Kit](https://github.com/github/spec-kit), [Kiro, AWS](https://kiro.dev/docs/specs/)                                                                                                                                               | o Spec Kit passou a tratar os comandos como pontos de entrada, não fases obrigatórias; o Kiro ganhou um modo de spec rápida sem aprovações                                       | a F14 (modo leve) está em 18º lugar na ordem                                |
| Aprovar o que melhora          | [Google, padrão de code review](https://google.github.io/eng-practices/review/reviewer/standard.html), [design docs, Ubl (2020)](https://www.industrialempathy.com/posts/design-docs-at-google/)                                               | aprova-se o que deixa o código melhor, mesmo imperfeito; o detalhe menor é opcional; documento só quando há ambiguidade real, e "testei e funciona" é bom argumento              | nossa aprovação pede "sem lacuna"; o critério poderia ser "melhor que hoje" |

Os nomes do que aconteceu já existem: paralisia por análise, gold plating (trabalho além do ponto em que agrega
valor) e o efeito do segundo sistema (Brooks). Não é falta de competência: é uma armadilha conhecida, e as próprias
ferramentas de referência caíram nela e recuaram. A qualidade de cada peça é alta (testes, mutação, nenhum defeito
chegou à pessoa); o que falhou foi a regra de parada e o lugar onde o esforço foi posto.

## O que o parecer propõe

Cinco mudanças, que viram um ADR se a pessoa aceitar a direção:

1. **Estágio zero congelado.** A F01a, a F01b, a F00 e a F01c bastam para a linha rodar. Nada de governança nova até
   um fio do produto rodar de ponta a ponta (adotar, PRD, spec, implementar, entregar) num projeto real.
2. **Contraditório com corte.** Uma rodada. Só entra na spec o que muda o que a pessoa vê ou impede a
   implementação. Caso de borda vira item de teste no plano, não requisito. O resto vai para uma lista "talvez", fora
   por padrão.
3. **Prazo por peça.** O `open` diz o prazo (por exemplo, meio dia). Estourou: corta-se escopo. A divisão por
   contagem de requisitos sai, porque a contagem era o que inflava.
4. **Regra só entra se outra sai**, e nenhuma lição da fase 8 vira funcionalidade da ferramenta antes do estágio 1.
5. **Aprovar o que é melhor que hoje**, não o que não tem lacuna.

### E a F01d

| Opção                       | O que é                                                                                       | Custo                                    |
| --------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------- |
| a. Estacionar (recomendada) | a branch continua à mão, como hoje, que funciona; o `project.json` espera a F02 precisar dele | nenhum código; a spec fica como rascunho |
| b. Só o `open` com branch   | R1 e R2 apenas, uma peça pequena                                                              | algumas horas; o resto da F01d some      |
| c. Seguir como está         | os 7 requisitos                                                                               | o mesmo ciclo que motivou este parecer   |

A branch à mão não deu problema em nenhuma entrega; a F01d previne um erro que ainda não aconteceu.

## Próximo passo

Se a pessoa aceitar a direção: um ADR com as cinco mudanças, os roteiros podados por ele, e o próximo trabalho
passa a ser o primeiro fio do produto, decidido na conversa de organização que a pessoa pediu antes da F02.
