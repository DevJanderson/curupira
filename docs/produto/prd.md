# PRD do Curupira

- **Status:** aprovado no portão da fase 2, em 2026-11-03
- **Aprovado por:** Janderson
- **Data:** 2026-11-03

## Problema

Agentes de código produzem rápido, mas sem estrutura:

- o resultado varia de uma sessão para outra: decisões se perdem, convenções divergem, testes ficam frágeis ou
  ausentes, e o contexto do projeto não chega ao agente;
- a pessoa perde a visão do que o agente está fazendo e de onde precisa decidir;
- os processos estruturados que existem pesam: muito texto, muito contexto e custo alto.

Hoje, quem usa agente trabalha em sessões soltas, com um arquivo de instrução (AGENTS.md ou CLAUDE.md) escrito à mão
e sem estrutura, ou adota ferramentas pesadas, proprietárias ou caras ([estado da arte](../pesquisa/estado-da-arte.md)).
O problema aparece em toda sessão de trabalho. O desafio é estruturar sem pesar.

## Usuários

- **Quem, em etapas:** primeiro o autor, com o próprio Curupira como projeto-piloto; depois quem desenvolve sozinho e
  usa agente de código todo dia; no horizonte, equipes pequenas (2 a 5 pessoas, cada uma com o seu agente, no mesmo
  repositório).
- **Perfis:** back-end, front-end, UX e análise. O Curupira não depende de stack: o que muda fica no perfil do
  projeto. UX e análise participam dos portões, não só do código; na v1, é a mesma pessoa trocando de papel.
- **Quando:** em toda mudança. As pequenas vão pelo modo leve.
- **Como:** a conversa com o agente é a interface principal. O painel complementa, para ver o andamento e, se a
  pessoa preferir, decidir. Nos dois casos, a decisão grava pela CLI.
- **Pronto para equipe desde já:** estado versionado no Git, toda aprovação registra quem aprovou, e cada
  funcionalidade fica isolada na sua branch.
- **O que conta como sucesso, em ordem:**
  1. entregar com testes passando e sem retrabalho depois do merge;
  2. visão clara do que está acontecendo e do que espera a decisão da pessoa, sem decisão pendente escondida;
  3. custo e tempo menores que os de um processo pesado, desde que o item 1 não piore.

## Objetivo e métricas de sucesso

Desenvolver com agente passa a produzir software com qualidade e consistência verificáveis, de forma repetível entre
projetos. A pessoa decide nos portões, com visão clara, em vez de revisar cada falha. O processo melhora a cada
funcionalidade: a retrospectiva propõe melhorias, e os defeitos que escapam viram lições para as próximas specs.

**Princípio:** o Curupira segue um método de produção, como uma linha de produção enxuta (Lean), mas o método fica
embutido na ferramenta, não no contexto do agente. O que pode ser checado vira máquina: hooks, testes, portões e CLI.
O agente recebe só a instrução curta da estação em que está. A pessoa vê o método pelo painel e pela documentação.

| Métrica                                     | Meta                                                        |
| ------------------------------------------- | ----------------------------------------------------------- |
| Defeitos que escapam depois do merge        | no máximo 1 a cada 10 funcionalidades (provisória)          |
| Cenários que passam na primeira verificação | pelo menos 70% (provisória)                                 |
| Custo e tempo por funcionalidade            | sem meta; comparação com a linha de base medida no specwork |

As metas de qualidade são revistas depois das 5 primeiras funcionalidades. Custo e tempo ficam sem meta porque as
primeiras funcionalidades são pequenas e de infraestrutura, e não se comparam direto às entregas do specwork.

Para a pesquisa, o resultado é evidência medida a favor ou contra cada hipótese, de H1 a H7
([hipóteses](../metodo/hipoteses.md)). Uma hipótese derrubada também conta como resultado.

## Escopo

### Entra na v1

- A jornada de 9 fases e 5 portões, com cada decisão registrada pela CLI.
- Adoção do projeto: perfil (comandos, stack, dados pessoais e leis que valem, limites de tamanho), instrução mínima
  do agente e portões automáticos de qualidade e segurança (lint, tipos, testes, segredos, código duplicado, código
  morto, complexidade, dependências vulneráveis e análise de segurança do código), cada um confirmado pela pessoa.
- Entrevista do PRD, spec ancorada com poucos cenários e aprovação com impressão digital.
- Testes antes do código, com a prova do vermelho como evidência.
- Verificador separado, que não implementou o código, com vereditos e provas em texto. A v1 cobre API, CLI, banco e
  testes; interface contra design fica em aberto.
- Revisão em eixos, PR aberto pelo agente e merge sempre humano.
- Medição e retrospectiva com lições.
- Peças pequenas como portão checado por máquina: os limites de tamanho ficam no perfil, com um padrão provisório
  revisto pela medição. A fase 2 propõe dividir o que passa do limite, a fase 3 recusa spec acima dele, a fase 4
  mostra o tamanho ao aprovar e a fase 5 quebra o passo grande.
- Modo leve para mudanças pequenas: pula o PRD e a spec completa, mas passa pelos portões e pela verificação. Inclui o
  caminho de bug: comportamento atual, esperado e o que não pode mudar, que vira teste de regressão.
- Spec de interface que aceita como entrada link do Figma, imagens ou outra ferramenta de design.
- Ajuda a cumprir a LGPD: o perfil pergunta se há dados pessoais e quais leis valem; a spec marca os campos com dados
  pessoais e a base legal; PRD e specs citam lei e artigo num arquivo de fontes; a revisão de segurança confere o
  tratamento.
- Camadas de contexto, contratos dos subagentes e teto de contexto por papel.
- Hooks do ciclo de vida, inclusive antes da compactação.
- Painel com o andamento, as decisões e a documentação.
- Núcleo independente de agente e de modelo (CLI, estado, portões, verificação, medição e modelos dos artefatos), com
  o adaptador do Claude Code (skills, hooks e subagentes).
- Evals das skills, fora da CI.
- Comando de renomear ([ADR-0008](../decisoes/0008-nome-provisorio-e-troca-facil.md)).

### Fica de fora, de propósito

- Ser agente, ter modelo próprio, ser IDE ou editor.
- Chamar API de modelo, ter servidor próprio, pedir ou guardar chave de API.
- Fazer merge sozinho.
- Enviar medição ou telemetria para fora.
- Vídeo na verificação.
- Spec como fonte, em que só a spec é editada e o código é gerado dela: a abordagem é a spec ancorada.
- Regra que só existe no papel: toda regra que dá para checar vira máquina, e os contratos têm poucos cenários.

### Fica para depois

- Recursos só de equipe: painel compartilhado, papéis e permissões.
- Adaptadores para outros agentes de terminal, inclusive os que usam outros modelos.
- Outros serviços de código além do GitHub.
- Windows nativo.
- Instalação por um comando, publicação no npm e reserva do nome
  ([ADR-0009](../decisoes/0009-instalacao-por-curl.md)); até lá, o Curupira roda a partir do repositório.

## Restrições

- **Stack:** TypeScript, Node 24, Vite+, pnpm em monorepo, painel em Vue 3 e shadcn-vue, documentação em Markdown
  dentro do painel, licença AGPL-3.0, Gitleaks e o nome numa única constante (ADRs 0006, 0008, 0012 a 0014 e 0016 a
  0019).
- **Agente:** na v1, só o Claude Code, sempre agente de terminal (ADR-0005).
- **Sem API de modelo:** o Curupira não chama API de modelo nenhuma e não tem servidor próprio. Ele trabalha só
  através dos agentes de terminal que a pessoa já tem instalados e autenticados; a comunicação com o modelo é do
  agente, e o Curupira nunca pede nem guarda chave de API. O Curupira roda local. O verificador roda como subagente
  ou como outra sessão do agente em modo não interativo, e a medição lê os registros de sessão que o agente grava na
  máquina.
- **Git e GitHub:** Git é obrigatório. Na v1, o código fica no GitHub e o PR é aberto pela CLI `gh`.
- **Sistemas:** Linux e macOS; no Windows, pelo WSL.
- **Dados pessoais:** a medição guarda só números (tokens, custo, cache e tempo, por fase e por papel), nunca o texto
  das conversas nem o código, pelo princípio da necessidade (LGPD, Lei nº 13.709/2018, art. 6º, III) e pela
  privacidade desde a concepção (art. 46, § 2º). A retrospectiva aponta onde está a prova, sem copiá-la. Quem aprovou
  cada portão é registrado pelo nome de autor do Git; num repositório público, esse nome fica visível, e a
  documentação avisa.
- **Prazo:** sem data. Marcos, nesta ordem: fases 1 a 4 funcionando com a ferramenta; a primeira funcionalidade do
  Curupira entregue pela jornada completa, com verificação e medição; o Curupira usado num segundo projeto real
  (primeiro teste da H6).
- **Risco:** a checagem de tipos do Vite+ usa o TypeScript 7, ainda a testar com o Vue do painel.

## Funcionalidades

Em ordem de valor; o detalhe está em [funcionalidades.md](funcionalidades.md), e as dúvidas em
[perguntas-em-aberto.md](perguntas-em-aberto.md).

- **F01 Estado e portões:** estado versionado no Git e registro de cada decisão pela CLI.
- **F02 Adotar o projeto:** o perfil do projeto, proposto pelo agente e confirmado pela pessoa.
- **F03 Instrução mínima e adaptador:** a instrução do agente e as skills por estação, para o Claude Code.
- **F04a Portões básicos:** lint, tipos, testes e segredos.
- **F04b Portões extras:** duplicação, código morto, complexidade, dependências e segurança.
- **F05 Hooks do ciclo de vida:** barram ações fora do fluxo.
- **F06 Entrevista do PRD:** o PRD, as perguntas em aberto e a lista de funcionalidades.
- **F07 Spec e cenários:** a spec ancorada, os cenários e o plano.
- **F08 Aprovação com impressão digital:** a spec aprovada e protegida contra mudança silenciosa.
- **F09 Implementar com testes primeiro:** branch, prova do vermelho e portões a cada passo.
- **F10 Verificador separado:** os cenários conferidos contra o sistema real.
- **F11 Revisão em eixos e PR:** a revisão em que só defeitos bloqueiam, e o PR aberto.
- **F12 Entrega e medição:** a entrega registrada e os números da funcionalidade.
- **F13 Retrospectiva e lições:** as melhorias do método e as lições dos defeitos.
- **F14 Modo leve:** mudanças pequenas e bugs com portões e verificação.
- **F15 Painel, andamento:** a fase, as decisões pendentes e a documentação.
- **F16 Painel, decidir:** as aprovações pelo painel, gravadas pela CLI.
- **F17 Contexto em camadas:** contratos dos subagentes e teto de contexto por papel.
- **F19 Evals das skills:** o comportamento do agente provado em projetos descartáveis.
- **F18 Comando de renomear:** a troca do nome a partir da constante.

## Referências

- [Roteiro do PRD](roteiro-prd.md), [método](../metodo/README.md), [hipóteses](../metodo/hipoteses.md),
  [jornada](../conceitos/jornada.md), [humano e agente](../conceitos/humano-e-agente.md) e
  [estado da arte](../pesquisa/estado-da-arte.md).
- ADRs 0002 a 0020, no [registro de decisões](../decisoes/README.md).

### Pendências de ADR

Resolvidas:

- [ADR-0021](../decisoes/0021-nucleo-independente-de-agente-com-adaptadores.md): núcleo independente de agente, com
  adaptadores; complementa o ADR-0005.
- [ADR-0022](../decisoes/0022-sem-api-de-modelo-so-agentes-de-terminal.md): sem API de modelo, só agentes de terminal.
- [ADR-0002](../decisoes/0002-nivel-de-spec-driven-development.md): aceita, com a spec ancorada.
- [ADR-0020](../decisoes/0020-uso-de-referencias-de-terceiros.md), item 7: referências estudadas só em
  `docs/pesquisa/` e nos ADRs; dependências e plataformas que o Curupira usa podem ser citadas onde for necessário.

Ainda pendente: uma ferramenta por portão extra da F04b, quando essa peça chegar.
