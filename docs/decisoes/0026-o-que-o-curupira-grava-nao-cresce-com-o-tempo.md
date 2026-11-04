# ADR-0026: O que o Curupira grava não cresce com o tempo

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

Tudo o que o Curupira grava num projeto ocupa espaço no repositório de quem o adota, e arquivos espalhados atrapalham
quem trabalha nele. Nada disso entra no software entregue: `.curupira/` e `docs/` ficam fora do build. O peso está no
repositório, em número de arquivos e em tamanho.

Medido em 2026-11-03, nas duas primeiras specs escritas à mão (F01a e F01b): 6 arquivos, 12,5 KB no total, cerca de
6 KB por funcionalidade. Para comparar, o `pnpm-lock.yaml` deste repositório tem 67 KB.

Até aqui, cada funcionalidade deixava 6 arquivos no Git: o estado e a medição em `.curupira/`
([ADR-0023](0023-estado-artefatos-e-dados-locais.md), [ADR-0024](0024-o-que-fica-na-maquina-e-no-projeto.md)), e
spec, cenários, plano e verificação em `docs/specs/<ID>-<nome>/`. A [Q09](../product/open-questions.md), sobre
conflito do estado entre branches, continuava aberta.

O que cresce com o número de funcionalidades cresce junto com o produto, como o próprio código. O que cresce com o
tempo (uma entrada por decisão, sessão, rodada ou evento) se multiplica sem limite.

## Opções consideradas

- **Um arquivo por decisão, sessão ou evento**: não há conflito nem com duas pessoas na mesma funcionalidade, mas o
  número de arquivos cresce a cada dia de trabalho.
- **Um arquivo por funcionalidade, como estava**: 6 arquivos versionados por funcionalidade.
- **Um arquivo por funcionalidade, com menos arquivos**: a medição dentro do estado, e a spec e os cenários juntos.

## Decisão

1. **No Git, só arquivos do projeto ou de uma funcionalidade.** Nada ganha um arquivo por decisão, sessão, rodada ou
   evento; o que acontece com o tempo vira uma entrada dentro do arquivo da funcionalidade.
2. **Um arquivo de estado por funcionalidade, com a medição dentro**: `.curupira/state/<ID>.json` guarda a fase, as
   decisões e a medição; as decisões das fases 1 e 2 ficam no arquivo do projeto, `.curupira/state/project.json`. O
   texto de cada decisão (motivo e resposta) tem até 280 caracteres. A medição guarda totais, não uma entrada por
   sessão; o formato fica para a F12. A pasta `.curupira/medicao/` deixa de existir.
3. **Um arquivo de spec por aprovação**, em `docs/specs/<ID>-<nome>/`:

   | Arquivo           | O que guarda                                      | Aprovação |
   | ----------------- | ------------------------------------------------- | --------- |
   | `spec.md`         | objetivo, requisitos, cenários, decisões e o mais | fase 4    |
   | `plan.md`         | os passos da implementação                        | nenhum    |
   | `verification.md` | o veredito e o resumo da prova de cada cenário    | fase 7    |

4. **Dados locais só enquanto servem.** Em `.curupira/local/`, fora do Git, fica só o que ainda vai ser usado:
   - das mensagens digitadas, só a última de cada sessão, no lugar da anterior, e apagada quando sustenta uma decisão;
   - a saída bruta das provas, até a funcionalidade terminar;
   - o que passar de 30 dias é apagado, por quem grava cada tipo de dado.
5. **A Q09 fica respondida na v1**: um arquivo de estado por funcionalidade basta. Cada funcionalidade anda na sua
   branch, que nasce no `open`, e só mexe no próprio arquivo; duas branches só escreveriam no mesmo arquivo se mudassem
   a mesma funcionalidade, o que a jornada não prevê. A pergunta volta com os recursos de equipe.

## Consequências

- Cada funcionalidade deixa 4 arquivos versionados: o estado, a spec, o plano e a verificação. O número de arquivos
  cresce com o número de funcionalidades, e nenhuma pasta cresce com o tempo.
- O hash da aprovação na aprovação da fase 4 (F01c) cobre um arquivo só, o `spec.md`.
- O `spec.md` fica maior; o limite de tamanho do [roteiro da spec](../metodo/roteiro-spec.md) (10 requisitos e 5
  cenários, provisório) o mantém curto.
- O arquivo de estado é escrito pela CLI nas aprovações e no fim de cada sessão, sempre na branch da funcionalidade.
- Guardar só a última mensagem de cada sessão também reduz os dados pessoais em `.curupira/local/`
  ([LGPD](../pesquisa/fontes.md#normas), art. 6º, III).
- Ajusta o ADR-0023 (spec e cenários num arquivo só; a Q09 respondida) e a regra 8 do ADR-0024 (a medição no estado).

## Histórico

- 2026-11-03: o caminho do estado passou a `.curupira/state/`, os arquivos a `plan.md` e `verification.md`, e
  "portão" a "aprovação" ([ADR-0027](0027-idioma-e-vocabulario-da-ferramenta.md)).
- 2026-11-04: a branch nasce no `open`, e não na F09; o `project.json` guarda as decisões das fases 1 e 2; o texto
  de cada decisão tem teto de 280 caracteres ([ADR-0031](0031-a-linha.md)).
