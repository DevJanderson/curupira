# F01a: Estado e comandos

- **Status:** rascunho, na fase 3
- **Data:** 2026-11-03

## Objetivo

Uma CLI que guarda, versionado no Git, em que fase da [jornada](../../conceitos/jornada.md) cada funcionalidade
está, registra cada decisão de portão (quem e quando) e mostra o que espera decisão. A pessoa decide pela conversa,
e quem roda a CLI é o agente ([ADR-0025](../../decisoes/0025-a-pessoa-decide-pela-conversa.md)). A CLI é o único
escritor do estado ([ADR-0011](../../decisoes/0011-painel-aceita-decisoes-humanas.md)) e não deixa uma fase começar
antes de o portão anterior abrir.

## Requisitos

- **R1.** O SISTEMA DEVE guardar o estado de cada funcionalidade num arquivo próprio, `.curupira/estado/<ID>.json`.
- **R2.** QUANDO o agente roda `curupira abrir <ID>`, O SISTEMA DEVE criar o estado da funcionalidade na fase 3.
- **R3.** QUANDO o agente roda `curupira estado`, O SISTEMA DEVE mostrar cada funcionalidade com a fase em que está
  e se ela espera decisão humana.
- **R4.** QUANDO o agente roda `curupira concluir <ID>` numa fase sem portão, O SISTEMA DEVE levar a funcionalidade à
  fase seguinte.
- **R5.** QUANDO o agente roda `curupira aprovar <ID>` com a funcionalidade num portão, O SISTEMA DEVE registrar o
  portão, quem aprovou e quando, e levar a funcionalidade à fase seguinte.
- **R6.** QUANDO o agente roda `curupira recusar <ID> --motivo <texto>` com a funcionalidade num portão, O SISTEMA
  DEVE registrar o portão, quem recusou, quando e o motivo, e levar a funcionalidade à fase de volta que a tabela dos
  portões define ([humano e agente](../../conceitos/humano-e-agente.md)).
- **R7.** SE o ID não tiver o formato de ID de funcionalidade, a funcionalidade não existir (ou já existir, ao
  abrir), ou o comando não couber na fase em que ela está, ENTÃO O SISTEMA DEVE recusar o comando, dizer o motivo e a
  fase, e não mudar o estado.
- **R8.** SE o Git não tiver nome de autor configurado, ENTÃO O SISTEMA DEVE recusar a decisão e dizer como
  configurar.
- **R9.** O SISTEMA DEVE manter as decisões de cada funcionalidade em ordem, sem apagar nem reescrever uma decisão
  anterior.
- **R10.** SE um arquivo de estado estiver num formato inválido, ENTÃO O SISTEMA DEVE recusar o comando e dizer qual
  arquivo e o que está errado.

## Cenários

Cada cenário roda contra a CLI real, num repositório Git descartável, com o nome de autor do Git configurado.

### C1. O estado mostra a fase e o que espera decisão

- **Cobre:** R1, R3.
- **Ponto de partida:** F01a parada no portão da fase 4; F02 na fase 3.
- **Ação:** `curupira estado`.
- **Resultado esperado:** a saída lista as duas, com a fase de cada uma, e marca só a F01a como esperando decisão.

### C2. Aprovar um portão registra quem e quando

- **Cobre:** R5, R9.
- **Ponto de partida:** F01a no portão da fase 4.
- **Ação:** `curupira aprovar F01a`.
- **Resultado esperado:** a F01a vai à fase 5; o arquivo dela ganha uma decisão nova, com o portão 4, o nome de
  autor e a data e hora, e as decisões anteriores ficam iguais. Nenhum outro arquivo de estado muda.

### C3. Aprovar fora do portão é recusado

- **Cobre:** R7.
- **Ponto de partida:** F02 na fase 3.
- **Ação:** `curupira aprovar F02`.
- **Resultado esperado:** o comando termina com erro, diz que a F02 está na fase 3, e o arquivo dela não muda.

### C4. Recusar o portão 7 volta à implementação

- **Cobre:** R6.
- **Ponto de partida:** F01a no portão da fase 7.
- **Ação:** `curupira recusar F01a --motivo "faltou tratar o erro de rede"`.
- **Resultado esperado:** a F01a volta à fase 5, e o arquivo dela registra a recusa com o motivo, o nome de autor e
  a data e hora.

### C5. Duas funcionalidades em branches não conflitam

- **Cobre:** R1, R9.
- **Ponto de partida:** F01a e F02 em portões, cada uma aprovada numa branch diferente.
- **Ação:** juntar as duas branches com `git merge`.
- **Resultado esperado:** o merge acontece sem conflito, e `curupira estado` mostra as duas aprovações.

## Fora do escopo

- Conferir que a decisão veio da pessoa: é da F01b. Na F01a, `aprovar` e `recusar` gravam sem essa conferência.
- Os portões de projeto, das fases 1 e 2: entram com a F02 (adoção) e a F06 (entrevista do PRD).
- O hash dos artefatos aprovados: é da F08. O formato do estado já tem lugar para o caminho e o hash
  ([ADR-0023](../../decisoes/0023-estado-artefatos-e-dados-locais.md)).
- As skills `/cr-…` (F03), os hooks (F05), o painel (F15 e F16), a medição (F12), o id do projeto e a versão (F02), e
  a branch por funcionalidade (F09).

## Dados pessoais

O nome de autor do Git de quem decide, gravado no estado de cada funcionalidade. É o necessário para saber quem
aprovou ([PRD](../../produto/prd.md), Restrições; LGPD, art. 6º, III). O e-mail não é gravado. Num repositório
público, o nome fica visível, e a documentação avisa.

## Decisões

- **Só as fases 3 a 8** de cada funcionalidade (pergunta 1).
- **A funcionalidade entra na jornada pelo `abrir`**, que o agente roda quando a pessoa pede para especificá-la; a CLI
  confere só o formato do ID, sem ler a lista de funcionalidades (pergunta 2, respondida pelo ADR-0025).
- **O arquivo leva o ID e não o nome**, para não mudar se o nome mudar (ADR-0023).
- **JSON**, porque o Node lê e grava sem dependência nova.
- **Comandos em português**, como o `curupira iniciar` da jornada.
- **Recusa no portão 7:** volta à fase 5 por padrão, e à fase 3 com `--spec`, quando a mudança altera a spec.
- **Um arquivo por funcionalidade basta para a Q09 na v1** (pergunta 3): cada funcionalidade anda na sua branch e só
  mexe no próprio arquivo; nada ganha um arquivo por decisão
  ([ADR-0026](../../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md)).
