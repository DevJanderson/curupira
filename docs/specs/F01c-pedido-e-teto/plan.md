# F01c: plano

Cada passo começa por um teste que falha (a prova do vermelho). Depende da F01b, que já tem o `approve`, o `reject`
e as respostas digitadas, e da F00, que trouxe o comando instalado.

## Consequências de ADR que o código toca

| ADR                                                                          | Consequência                                                     | Como se confere                                         |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| [0031](../../decisoes/0031-a-linha.md)                                       | toda aprovação tem pedido; a resposta vem depois; o hash confere | testes nos passos 1 a 3                                 |
| [0026](../../decisoes/0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md) | o hash da fase 4 cobre só o `spec.md`; teto de 280 caracteres    | testes nos passos 1 e 4                                 |
| [0023](../../decisoes/0023-estado-artefatos-e-dados-locais.md)               | o estado guarda o caminho e o hash do que se aprovou             | teste no passo 1: a decisão leva o caminho do `spec.md` |
| [0027](../../decisoes/0027-idioma-e-vocabulario-da-ferramenta.md)            | `request` em inglês; as mensagens no catálogo pt-BR              | revisão                                                 |
| [0008](../../decisoes/0008-nome-provisorio-e-troca-facil.md)                 | o nome só na constante                                           | o teste que já existe                                   |

## 1. O comando `request`

- **Teste primeiro:** num repositório Git descartável, com a funcionalidade e o `spec.md` dela:
  - na fase 4, grava o pedido com a fase, a hora e o SHA-256 do `spec.md`, e o caminho dele;
  - nas fases 7 e 8, grava o commit da branch; com uma mudança sem commit fora de `.curupira/`, recusa;
  - um segundo `request` substitui o primeiro;
  - nas fases 3, 5 e 6, recusa; sem `spec.md`, ou com dois `docs/specs/<ID>-*/`, recusa; `F01-x` não conta como
    pasta da `F01a`;
  - nenhuma recusa muda o estado.
- **O que muda:** o núcleo (o pedido no estado e o hash), `run.ts`, o catálogo e o uso.
- **Requisitos:** R1, R2.

## 2. A aprovação e a recusa pedem o pedido

- **Teste primeiro:**
  - sem pedido, ou com o pedido de outra fase, `approve` e `reject` recusam;
  - com a resposta mais velha que o pedido, recusam; com a mesma hora, também;
  - a decisão guarda a hora e o hash do pedido, e o pedido sai do estado;
  - a ordem dos erros: a fase, o pedido, o conteúdo, a sessão, a resposta, o autor.
- **O que muda:** o núcleo e `run.ts`. Os testes da F01a, da F01b e da F00 que aprovam passam a fazer o pedido antes
  do "sim".
- **Requisitos:** R3, R4, R6.

## 3. O conteúdo mudado

- **Teste primeiro:**
  - na fase 4, um `spec.md` mudado depois do pedido faz o `approve` recusar; um pedido novo e um "sim" novo aprovam;
  - nas fases 7 e 8, um commit novo, ou uma mudança sem commit fora de `.curupira/`, faz o `approve` recusar;
  - um `spec.md` apagado ou movido depois do pedido faz o `approve` recusar, dizendo o caminho;
  - o `reject` não confere o conteúdo.
- **O que muda:** o núcleo.
- **Requisitos:** R5.

## 4. O teto e os estados antigos

- **Teste primeiro:**
  - um motivo de 280 caracteres fica inteiro; um de 281 vira 279 e "…"; conta caractere, e não byte (texto com
    acento e emoji);
  - um estado com decisões sem pedido e com um motivo de mais de 280 caracteres continua válido no `status`, no
    `advance` e no `approve`.
- **O que muda:** o núcleo.
- **Requisitos:** R7, R8.

## 5. O estado da F01a e da F01b

- **Teste primeiro:** não se aplica; é um dado. Depois de gravar, `curupira status` neste repositório mostra as duas
  como entregues, e um teste confere que os dois arquivos são estados válidos.
- **O que muda:** `.curupira/state/F01a.json` e `F01b.json`, com as decisões das fases 4, 7 e 8 nas horas dos
  relatos; a da fase 8 na hora do commit do merge (`53e29e5` e `7a2ec9b`); a fase 4 da F01a com a segunda aprovação,
  a que vale.
- **Requisitos:** R9.

## 6. Os cenários como testes de regressão

- **Teste primeiro:** C1 a C5. Sem vermelho natural: a prova é uma mutação de propósito no código, desfeita em
  seguida ([roteiro da spec](../../metodo/roteiro-spec.md#planmd)).
- **O que muda:** `apps/cli/tests/scenarios-f01c.test.ts`.
- **Requisitos:** os que os cenários cobrem.

## 7. Documentação

- **Teste primeiro:** não se aplica.
- **O que muda:** o ADR-0031 ganha a linha da entrega no histórico; o
  [humano e agente](../../conceitos/humano-e-agente.md) diz que o agente roda `request` antes do cartão.
