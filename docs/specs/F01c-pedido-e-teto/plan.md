# F01c: plano

Cada passo começa por um teste que falha (a prova do vermelho). Depende da F01b, que já tem o `approve`, o `reject`
e as respostas digitadas, e da F00, que trouxe o comando instalado.

## Consequências de ADR que o código toca

| ADR                                                                          | Consequência                                                     | Como se confere                                                       |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| [0031](../../decisoes/0031-a-linha.md)                                       | toda aprovação tem pedido; a resposta vem depois; o hash confere | testes nos passos 1 a 3                                               |
| [0026](../../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md) | o hash da fase 4 cobre só o `spec.md`; teto de 280 caracteres    | testes nos passos 1 e 4                                               |
| [0023](../../decisoes/0023-estado-artefatos-e-dados-locais.md)               | o estado guarda o caminho e o hash do que se aprovou             | o pedido (passo 1) e a decisão (passo 2) levam o caminho do `spec.md` |
| [0027](../../decisoes/0027-idioma-e-vocabulario-da-ferramenta.md)            | `request` em inglês; as mensagens no catálogo pt-BR              | revisão                                                               |
| [0008](../../decisoes/0008-nome-provisorio-e-troca-facil.md)                 | o nome só na constante                                           | o teste que já existe                                                 |

## 1. O comando `request`

- **Teste primeiro:** num repositório Git descartável, com a funcionalidade e o `spec.md` dela:
  - na fase 4, grava o pedido com a fase, a hora, o caminho e o SHA-256 do `spec.md`;
  - nas fases 7 e 8, grava o commit (`HEAD`); com um arquivo mudado ou novo e não ignorado fora de `.curupira/`,
    recusa; com uma mudança só em `.curupira/`, aceita; num repositório sem commit, recusa;
  - um segundo `request` substitui o primeiro;
  - nas fases 3, 5 e 6, recusa; sem `spec.md`, com dois `docs/specs/<ID>-*/`, com o `spec.md` que é pasta, link
    simbólico ou ilegível, recusa dizendo o caminho; `F01-x` não conta como pasta da `F01a`;
  - a ordem dos erros do `request`: a fase, o `spec.md` (fase 4) ou o Git (fases 7 e 8);
  - nenhuma recusa muda o estado; o estado gravado continua válido para o `load` (o pedido malformado é estado
    inválido, como na F01a).
- **O que muda:** o núcleo (o pedido no estado, com os campos em inglês `request`, `phase`, `at`, `hash` e `path`, e o
  hash), `run.ts`, o catálogo e o uso.
- **Requisitos:** R1, R2.

## 2. A aprovação e a recusa pedem o pedido

- **Teste primeiro:**
  - sem pedido, ou com o pedido de outra fase, `approve` e `reject` recusam, e a mensagem cita
    `curupira request <ID>`;
  - com a resposta mais velha que o pedido, recusam; com a mesma hora, também;
  - a decisão guarda a hora e o hash do pedido, e o pedido sai do estado;
  - a ordem dos erros do `approve`: a fase, o pedido, o conteúdo, a sessão, a resposta, o autor; a do `reject`, a
    mesma sem o conteúdo.
- **O que muda:** o núcleo e `run.ts`. Os testes da F01a, da F01b e da F00 que aprovam passam a fazer o pedido antes
  do "sim".
- **Requisitos:** R3, R4, R6.

## 3. O conteúdo mudado

- **Teste primeiro:**
  - na fase 4, um `spec.md` mudado depois do pedido faz o `approve` recusar; um pedido novo e um "sim" novo aprovam;
  - nas fases 7 e 8, um commit novo, ou uma mudança sem commit fora de `.curupira/`, faz o `approve` recusar;
  - um `spec.md` apagado ou movido depois do pedido faz o `approve` recusar, dizendo o caminho; a mensagem cita
    `curupira request <ID>`;
  - o `reject` não confere o conteúdo.
- **O que muda:** o núcleo.
- **Requisitos:** R5.

## 4. O teto e os estados antigos

- **Teste primeiro:**
  - um motivo de 280 caracteres fica inteiro; um de 281 vira 279 e "…"; conta ponto de código, e não byte nem
    unidade UTF-16 (um emoji na posição 279 não se parte); o corte vem depois de tirar os espaços das pontas;
  - o `load` aceita um estado com decisões sem pedido e com um motivo de mais de 280 caracteres, como o da F02.
- **O que muda:** o núcleo.
- **Requisitos:** R7, R8.

## 5. O estado da F01a e da F01b

- **Teste primeiro:** não se aplica; é um dado. Depois de gravar, `curupira status` neste repositório mostra as duas
  como entregues, o que já confere que os dois arquivos são estados válidos.
- **O que muda:** `.curupira/state/F01a.json` e `F01b.json`, com as decisões das fases 4, 7 e 8 nas horas dos
  relatos; a da fase 8 na hora do commit do merge (`53e29e5` e `7a2ec9b`); a fase 4 da F01a com a segunda aprovação,
  a que vale, porque a primeira foi para uma spec que mudou depois (os nomes em inglês do ADR-0027).
- **Requisitos:** o objetivo; a exceção ao escritor único está nas decisões da spec.

## 6. Os cenários como testes de regressão

- **Teste primeiro:** C1 a C5. Sem vermelho natural: a prova é uma mutação de propósito no código, desfeita em
  seguida ([roteiro da spec](../../metodo/roteiro-spec.md#planmd)).
- **O que muda:** `apps/cli/tests/scenarios-f01c.test.ts`.
- **Requisitos:** os que os cenários cobrem.

## 7. Documentação

- **Teste primeiro:** não se aplica.
- **O que muda:**
  - o ADR-0031 ganha a F01c nas peças da linha 7 e a linha da entrega no histórico;
  - o [humano e agente](../../conceitos/humano-e-agente.md) e o `AGENTS.md` dizem que o agente commita tudo, roda
    `request` e só então mostra o cartão, sem commitar entre o pedido e a resposta;
  - o [roteiro da entrega](../../metodo/roteiro-entrega.md) diz o mesmo nas fases 7 e 8;
  - o README lembra de rodar o script de instalação de novo para ter o `request`.
