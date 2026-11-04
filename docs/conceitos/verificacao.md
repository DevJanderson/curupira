# Verificação

> **Status:** proposta. O fluxo descrito aqui é o do
> ADR-0010 (no [registro de decisões](../decisoes/README.md)), que ainda não foi aceito.

## Cenários

- Cada funcionalidade tem poucos cenários. Cada cenário tem um ponto de partida, uma ação e um resultado esperado, e
  verifica uma condição só.
- Uma lista longa de cenários indica detalhe de implementação, não comportamento.
- Os cenários nascem na especificação (fase 3), dentro do `spec.md`, e são aprovados junto com ela (fase 4).

## O verificador

- Um verificador separado, que não implementou o código, roda os cenários contra o sistema real.
- Ele também lê os testes automáticos dos cenários e confere que cada um testa todas as partes do resultado
  esperado; um teste que passaria com o comportamento errado é achado da verificação.
- Ele é chamado por um comando só.

## Os quatro vereditos

| Veredito   | Significa                                                  |
| ---------- | ---------------------------------------------------------- |
| verificado | O cenário passou, com prova                                |
| parcial    | Parte do resultado esperado aconteceu, parte não           |
| bloqueado  | O ambiente não deixou testar; é diferente de código errado |
| falhou     | O sistema não fez o que o cenário pede                     |

## O laço de correção

- Em "falhou", o agente que implementou corrige, e o verificador roda os cenários de novo, com um limite de tentativas.
- Achados fora dos cenários seguem a mesma regra: defeito (contradiz a spec) é corrigido; observação (a spec não diz
  nada) tem no máximo duas rodadas de correção, e o que sobrar vai para a `verification.md`, para a revisão.
- Em "bloqueado", o agente chama a pessoa.

## Provas em texto

Cada veredito vem com provas em texto: saída de testes, requisições e respostas reais à API e logs.

- O veredito de cada cenário e um resumo da prova (o que foi rodado e o que saiu de importante, inclusive a prova do
  vermelho) vão para `docs/specs/<ID>-<nome>/verification.md`, no Git, e passam pela aprovação da fase 7.
- A saída bruta fica em `.curupira/local/`, fora do Git, até a funcionalidade terminar
  ([ADR-0024](../decisoes/0024-o-que-fica-na-maquina-e-no-projeto.md),
  [ADR-0026](../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md)).

## Depois da verificação

Cenário aprovado vira teste de regressão e passa a rodar sempre.

## Testes antes do código

Cada passo da implementação começa com um teste que falha: a prova do vermelho.
Só depois vem o código que faz o teste passar.
Se o código de um passo vier antes do teste, a prova do vermelho é feita depois: os testes novos rodam com o código do
passo guardado (`git stash`), e o relato diz que foi assim.

## Histórico

- 2026-11-03: depois da entrega da F01a, o verificador passou a ler os testes dos cenários, e as observações
  ganharam um limite de rodadas ([relato](../pesquisa/relatos/2026-11-03-fase-5-f01a.md)).
- 2026-11-04: a prova do vermelho feita depois, com o código guardado, quando o código de um passo veio antes do
  teste, como no passo 2 da F01c ([relato](../pesquisa/relatos/2026-11-04-fases-5-a-7-f01c.md)). Nenhuma regra saiu:
  é o caminho de volta de uma regra que já existe, e não uma regra nova.
