# Método

## Visão

O Curupira organiza o desenvolvimento como uma fábrica humano + IA, mas não uma "fábrica no escuro".
O humano define a intenção, decide e aprova; o agente produz em volume.
O que torna a produção confiável é a base: padrões, especificações, testes e checagens de qualidade que valem para
todo projeto.

## Problema

Agentes geram código rápido, mas sem estrutura o resultado varia de uma sessão para outra.
Decisões de arquitetura se perdem, convenções divergem, testes são frágeis ou ausentes, e o contexto do projeto não
chega ao agente. Velocidade sem consistência vira dívida técnica.

## Pergunta central

Como estruturar um processo de desenvolvimento colaborativo humano–agente de IA que produza software com qualidade e
consistência verificáveis, de forma repetível entre projetos?

## Perguntas derivadas

1. Quais artefatos o agente precisa para produzir de forma consistente?
2. Onde ficam os pontos de decisão e revisão humana, e o que pode ser delegado?
3. Quais checagens automáticas garantem que nada fora do padrão avance?
4. Como medir se a fábrica produz melhor do que um processo sem ela?

## Como a pesquisa é conduzida

- O próprio Curupira é o projeto-piloto ([ADR-0003](../decisoes/0003-curupira-e-o-projeto-piloto.md)).
- Cada passo e cada funcionalidade entram no [registro da pesquisa](../pesquisa/registro.md).
- As hipóteses são confirmadas ou derrubadas com medição.

## Leia também

- [Hipóteses](hipoteses.md): as apostas que a pesquisa quer confirmar ou derrubar.
- [Mapa do conhecimento](mapa-do-conhecimento.md): os 11 eixos da pesquisa.
- [A jornada](../conceitos/jornada.md): as 9 fases e as 5 aprovações.
- [Roteiro do PRD](roteiro-prd.md), [da spec](roteiro-spec.md) e [da revisão e da entrega](roteiro-entrega.md): o que o
  agente faz nas fases 2, 3, 7 e 8.
- [Registro de decisões](../decisoes/README.md): os ADRs.
