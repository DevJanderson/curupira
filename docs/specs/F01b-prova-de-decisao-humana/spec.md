# F01b: Prova de decisão humana

- **Status:** rascunho, na fase 3
- **Data:** 2026-11-03

## Objetivo

Garantir que uma aprovação ou recusa parta de uma resposta que a pessoa digitou na conversa, e não do agente
decidindo sozinho ([ADR-0025](../../decisoes/0025-a-pessoa-decide-pela-conversa.md)). Um hook registra cada
resposta digitada, e os comandos `approve` e `reject` da [F01a](../F01a-estado-e-comandos/spec.md) só gravam com
uma resposta que os sustente.

## Requisitos

- **R1.** QUANDO o hook do agente roda `curupira hook answer` com uma mensagem digitada pela pessoa, O SISTEMA
  DEVE guardar em `.curupira/local/`, no lugar da anterior da mesma sessão, a data e hora e o texto, se a mensagem
  começar por "sim" ou "não", ou só a marca de outra mensagem, sem o texto.
- **R2.** QUANDO o agente roda `curupira approve <ID>`, O SISTEMA DEVE aceitar só se a última mensagem digitada na
  sessão do agente for um "sim" puro ("sim" ou "sim <ID>") ainda não usado.
- **R3.** QUANDO o agente roda `curupira reject <ID>`, O SISTEMA DEVE aceitar só se a última mensagem digitada na
  sessão do agente for "não" seguido de um motivo, ainda não usada, e gravar o motivo.
- **R4.** O SISTEMA DEVE gravar, na decisão do estado, o texto digitado que a sustentou, e apagar a resposta
  guardada, para ela não valer duas vezes.
- **R5.** SE não houver resposta que sustente a decisão, ou a sessão do agente não puder ser identificada, ENTÃO O
  SISTEMA DEVE recusar o comando, dizer o que a pessoa precisa digitar ("sim" sozinho, ou "não, <motivo>") e não
  mudar o estado.
- **R6.** QUANDO o hook roda, O SISTEMA DEVE apagar as respostas guardadas há mais de 30 dias.

## Cenários

Cada cenário roda contra a CLI real, num repositório Git descartável. A mensagem digitada entra como o hook do
Claude Code a entregaria: um JSON na entrada de `curupira hook answer`.

### C1. Um "sim" digitado permite aprovar

- **Cobre:** R1, R2, R4.
- **Ponto de partida:** F01a na aprovação da fase 4; a mensagem "sim" passou pelo hook.
- **Ação:** `curupira approve F01a`.
- **Resultado esperado:** a aprovação é gravada com o texto "sim", e a resposta guardada é apagada.

### C2. Sem resposta digitada, a aprovação é recusada

- **Cobre:** R2, R5.
- **Ponto de partida:** F01a na aprovação da fase 4; nenhuma mensagem passou pelo hook.
- **Ação:** `curupira approve F01a`.
- **Resultado esperado:** o comando termina com erro, diz que a pessoa precisa digitar "sim", e o estado não muda.

### C3. Uma resposta não vale duas vezes

- **Cobre:** R4, R5.
- **Ponto de partida:** a F01a acabou de ser aprovada com um "sim"; a F02 está na aprovação da fase 4.
- **Ação:** `curupira approve F02`, sem nova mensagem.
- **Resultado esperado:** o comando é recusado, e o estado da F02 não muda.

### C4. Um "não" digitado recusa com o motivo

- **Cobre:** R3.
- **Ponto de partida:** F01a na aprovação da fase 7; a mensagem "não, faltou tratar o erro de rede" passou pelo hook.
- **Ação:** `curupira reject F01a`.
- **Resultado esperado:** a F01a volta à fase 5, com o motivo "faltou tratar o erro de rede".

### C5. Um "sim" com outra frase não aprova

- **Cobre:** R2, R5.
- **Ponto de partida:** F01a na aprovação da fase 4; a mensagem "sim, e mais uma coisa" passou pelo hook.
- **Ação:** `curupira approve F01a`.
- **Resultado esperado:** o comando termina com erro, diz que o "sim" precisa vir sozinho, e o estado não muda.

## Fora do escopo

- As skills de aprovação, que só a pessoa chama (F03).
- Ligar o hook pela adoção do projeto (F05). No repositório-piloto, o hook é ligado à mão no `.claude/settings.json`.
- Decidir pelo painel (F16).

## Dados pessoais

O texto que a pessoa digita na conversa. Em `.curupira/local/`, fora do Git, fica só a última mensagem de cada
sessão, e o texto só quando ela começa por "sim" ou "não"; a resposta é apagada quando vira decisão ou depois de 30
dias. No estado vai só o texto que sustentou a decisão (por exemplo, "sim" ou o motivo da recusa). É o necessário
para provar a decisão (LGPD, art. 6º, III;
[ADR-0026](../../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md)).

## Decisões

- **Escolha clicada não vale:** a resposta a uma pergunta com opções não passa pelo hook e não sustenta decisão
  (ADR-0025).
- **A leitura da entrada do hook fica no adaptador do Claude Code** (ADR-0021); a regra dos comandos fica no núcleo.
- **As respostas aceitas são "sim" e "não", do pt-BR**, o idioma até o perfil do projeto existir; outros idiomas, como
  "yes" e "no", vêm com o perfil (F02, [ADR-0027](../../decisoes/0027-idioma-e-vocabulario-da-ferramenta.md)).
- **Maiúsculas, espaços nas pontas e um ponto final não contam:** "Sim" e "sim." valem como "sim".
- **O motivo da recusa vem do texto digitado:** com a F01b, `reject` deixa de receber `--reason`; o `--spec` da
  F01a continua.
- **A sessão vem do adaptador** (ADR-0021). No Claude Code, o hook recebe a sessão no JSON de entrada, e os comandos
  que o agente roda têm a variável `CLAUDE_CODE_SESSION_ID`, vista no ambiente; o plano confere na documentação antes
  de usar, e sem ela vale o R5.
- **Só a última mensagem de cada sessão**, porque só ela pode sustentar uma decisão; uma mensagem nova depois do
  "sim" o desfaz (ADR-0026).
