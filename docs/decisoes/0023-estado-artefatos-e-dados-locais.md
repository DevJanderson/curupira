# ADR-0023: Onde ficam o estado, os artefatos e os dados locais

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

Num projeto que adota o Curupira convivem três tipos de arquivo, com donos, leitores e vida útil diferentes:

- o estado da ferramenta (perfil, fase de cada funcionalidade, aprovações), escrito só pela CLI e lido pela máquina;
- os artefatos do produto (PRD, specs, cenários, planos), escritos pela pessoa e pelo agente e revisados no PR; pela
  spec ancorada ([ADR-0002](0002-nivel-de-spec-driven-development.md)), vivem enquanto o código existir;
- os dados de trabalho de cada máquina (provas da verificação, rodadas, temporários), que servem a uma rodada só.

Três forças pesam. O desenho pronto para equipe ([PRD](../product/prd.md)) pede o estado versionado no Git. Duas
funcionalidades em branches ao mesmo tempo não podem conflitar no estado
([Q09](../product/open-questions.md)). E o nome é provisório
([ADR-0008](0008-nome-provisorio-e-troca-facil.md)): o que ficar dentro de `.curupira/` muda de lugar quando o nome
muda.

## Opções consideradas

As três ferramentas estão descritas em [ferramentas estudadas](../pesquisa/ferramentas-estudadas.md); a organização
das pastas foi conferida nas fontes abaixo.

- **Tudo na pasta oculta da ferramenta**, como o Kiro, que gera as specs em `.kiro/specs/<nome>/`
  ([specs do Kiro](https://kiro.dev/docs/specs.md)). Fica tudo num lugar só, mas os artefatos ficam ocultos, presos à
  ferramenta e mudam de lugar quando o nome muda.
- **Tudo numa pasta visível com o nome da ferramenta**, como o specwork: perfil, `state.json`, produto e
  funcionalidades em `specwork/`, e só os arquivos de trabalho em `.specwork/`, fora do Git
  ([README do specwork](https://github.com/DevJanderson/specwork/blob/main/README.md)). Os artefatos continuam presos
  ao nome da ferramenta, e o estado num arquivo único recebe a escrita de todas as funcionalidades.
- **Estado da ferramenta separado dos artefatos**, como o Spec Kit: as specs em `specs/<branch>/`, visíveis
  ([spec-driven.md](https://github.com/github/spec-kit/blob/main/spec-driven.md)), e os arquivos da ferramenta em
  `.specify/` ([README do Spec Kit](https://github.com/github/spec-kit/blob/main/README.md)).

## Decisão

Três categorias, cada uma no seu lugar:

| Categoria            | Onde                            | Git                   | Quem escreve      | O que guarda                                                                     |
| -------------------- | ------------------------------- | --------------------- | ----------------- | -------------------------------------------------------------------------------- |
| Estado da ferramenta | `.curupira/`                    | versionado            | só a CLI          | o perfil, o estado de cada funcionalidade, as aprovações e a medição             |
| Artefatos do produto | `docs/`, configurável no perfil | versionado            | pessoa e agente   | PRD, perguntas em aberto, funcionalidades, specs, cenários, planos, verificações |
| Dados locais         | `.curupira/local/`              | fora, no `.gitignore` | CLI e verificador | provas brutas, rodadas, eventos dos hooks e temporários                          |

1. **Um arquivo de estado por funcionalidade**, não um arquivo único, para que duas funcionalidades em branches
   diferentes não escrevam no mesmo arquivo. Na v1, isso responde a Q09
   ([ADR-0026](0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md)).
2. **Caminho e hash juntos.** Para cada artefato aprovado, o estado guarda o caminho e o hash da aprovação. Se o
   artefato for movido ou renomeado, a ferramenta avisa, em vez de seguir em silêncio.
3. **Uma pasta visível só: `docs/`.** No repositório-piloto e em qualquer outro projeto, os artefatos ficam em
   `docs/product/` (PRD, funcionalidades e perguntas em aberto) e em `docs/specs/<ID>-<nome>/` (a spec com os
   cenários, o plano e a verificação de cada funcionalidade, por exemplo `docs/specs/F01a-estado-e-comandos/`). O
   perfil pode trocar a pasta, para o projeto que já usa `docs/` para outra coisa.

## Consequências

- Na raiz do projeto, o Curupira acrescenta no máximo uma pasta visível (`docs/`, se ainda não existir) e uma oculta
  (`.curupira/`).
- Desinstalar o Curupira deixa os artefatos onde estão, legíveis sem a ferramenta.
- Trocar o nome (ADR-0008) move só o estado e os dados locais; os artefatos ficam no lugar. O comando de renomear
  também ajusta a linha de `.curupira/local/` no `.gitignore`.
- A adoção do projeto (fase 1) acrescenta `.curupira/local/` ao `.gitignore`.
- A visão do projeto inteiro (painel e CLI) junta os arquivos de estado das funcionalidades ao ler.
- A CLI continua sendo a única que escreve o estado; os artefatos são escritos pela pessoa e pelo agente
  ([conceito do painel](../conceitos/painel.md)).

## Histórico

- 2026-11-03: o padrão dos artefatos passou de `specs/` na raiz para uma pasta visível só, `docs/`, igual à do
  repositório-piloto, para não espalhar pastas na raiz do projeto.
- 2026-11-03: o veredito de cada cenário e o resumo da prova passaram para o Git, em
  `docs/specs/<ID>-<nome>/verificacao.md`; só a saída bruta fica em `.curupira/local/`. A medição entrou no estado
  ([ADR-0024](0024-o-que-fica-na-maquina-e-no-projeto.md)).
- 2026-11-03: a spec e os cenários passaram a um arquivo só, a medição entrou no arquivo de estado de cada
  funcionalidade, e a Q09 ficou respondida na v1 ([ADR-0026](0026-o-que-o-curupira-grava-nao-cresce-com-o-tempo.md)).
- 2026-11-03: as pastas e os arquivos que a ferramenta cria passaram para o inglês: `docs/product/`, `plan.md` e
  `verification.md` ([ADR-0027](0027-idioma-e-vocabulario-da-ferramenta.md)).
