# Estado da arte

Em 2026-11-03, a pesquisa estudou quatro ferramentas que organizam o trabalho entre pessoas e agentes de código:
o [GitHub Spec Kit](https://github.com/github/spec-kit), o [Kiro](https://kiro.dev/docs/specs.md), o
[specwork](https://github.com/DevJanderson/specwork) e o [Ranger](https://docs.ranger.net/concepts/how-it-works/).
Todas as fontes estão em [fontes.md](fontes.md), e as citações seguem o [ADR-0020](../decisoes/0020-uso-de-referencias-de-terceiros.md).

**Conclusão.** O Spec Kit dá o modelo de distribuição e os comandos de consistência; o Kiro dá o formato enxuto da
especificação; o specwork dá a verificação e a medição; o Ranger dá o fluxo de verificação. Nenhum cobre ao mesmo tempo
testes obrigatórios, gestão de contexto e métricas, e esse é o espaço do Curupira.

## GitHub Spec Kit

Fonte: [repositório](https://github.com/github/spec-kit), consultado na v1.2.7.dev0.

- **O que é:** uma CLI instalável (`specify init`) que prepara o projeto para spec-driven development, com 43 integrações de agentes.
- **Licença:** MIT.
- **Aproveitar:**
  - a constituição, com princípios versionados, checada como portão no plano: violar um princípio exige justificativa;
  - a marca dos pontos que faltam esclarecer, com um comando que faz até 5 perguntas;
  - a análise de consistência entre spec, plano e tarefas;
  - checklists que testam a escrita dos requisitos, e não o código;
  - um comando que compara o código com a spec e acrescenta as tarefas que faltam;
  - tarefas agrupadas por história, com marca de quais podem correr em paralelo;
  - fluxos descritos em YAML, com portões de aprovação humana.
- **Adaptar:** extensões, presets e bundles; a ideia serve, mas é grande demais para a v1.
- **Não levar:** scripts mantidos em três linguagens.
- **Limitações:** o fluxo é pesado e gera muito material para revisar; exige Python e uv; os testes são opcionais por padrão.

## Kiro

Fontes: [specs](https://kiro.dev/docs/specs.md), [steering](https://kiro.dev/docs/steering/),
[hooks](https://kiro.dev/docs/hooks/) e [testes baseados em propriedades](https://kiro.dev/blog/property-based-testing/).

- **O que é:** um produto da AWS (IDE, CLI e web) que conduz o agente por uma especificação.
- **Licença:** proprietária. Pelo ADR-0020, só descrevemos as ideias; nada é copiado.
- **Aproveitar:**
  - a especificação em três arquivos por funcionalidade: requisitos, design e tarefas;
  - os requisitos no formato EARS;
  - a escolha de começar pelos requisitos ou pelo design;
  - a especificação de correção de bug com três partes: o comportamento atual, o esperado e o que não pode mudar;
  - a análise dos requisitos antes do design;
  - os testes baseados em propriedades extraídos dos requisitos, com rastreio requisito → propriedade → tarefa → teste
    (em TypeScript, com [fast-check](https://github.com/dubzzz/fast-check));
  - o contexto do projeto com modos de inclusão: sempre, por padrão de arquivo, manual ou automático.
- **Adaptar:**
  - tarefas executadas em ondas paralelas;
  - hooks: a ideia é boa, mas lá estão presos ao produto;
  - um modo rápido, sem portões, para tarefas pequenas.
- **Não levar:** textos, prompts e modelos do produto (é proprietário).
- **Limitações:** é proprietário; os testes de propriedade existem só na IDE; editar as tarefas à mão desalinha a spec.

## specwork

Fonte: [repositório](https://github.com/DevJanderson/specwork), consultado na v1.0.0. É do mesmo autor do Curupira.

- **O que é:** um pacote Python com 960 testes, a tentativa anterior de organizar a fábrica humano + IA.
- **Licença:** AGPL-3.0, a mesma do Curupira; pode ser reaproveitado livremente.
- **Aproveitar:**
  - o contrato verificável, item a item, com PASS/FAIL;
  - a avaliação independente: quem implementa não avalia;
  - o estado com escritor único e a impressão digital da aprovação;
  - hooks que barram ações fora do fluxo;
  - a prova do vermelho e o teste de mutação num worktree descartável;
  - a revisão em quatro eixos com critério de parada: só defeitos bloqueiam;
  - a medição de tokens, custo e cache por papel;
  - os defeitos que escapam viram lições;
  - as avaliações (evals) das skills;
  - o teto de contexto por papel, medido em teste.
- **Adaptar:**
  - o contraditório da spec, com dois agentes defendendo teses opostas;
  - o método formal (V-Modell XT sobre a ISO/IEC/IEEE 12207), útil para a parte acadêmica.
- **Não levar:** o volume, ou seja, contratos enormes e regras que nenhuma máquina garante.
- **Limitações (falhas medidas):**
  - uma entrega de 100 itens levou 7h46 e custou cerca de US$ 312;
  - o contexto mediano foi de 293 mil tokens por resposta, com máximo de 527 mil;
  - de 323 regras, só 49 eram garantidas por máquina;
  - os contratos tinham de 95 a 162 itens;
  - as propostas somavam cerca de 70 mil palavras.

## Ranger

Fontes: [como funciona](https://docs.ranger.net/concepts/how-it-works/) e [cenários](https://docs.ranger.net/concepts/scenarios).

- **O que é:** um serviço de QA para agentes de código, que verifica no sistema real o que o agente fez.
- **Licença:** proprietária. Pelo ADR-0020, só descrevemos o fluxo; nada é copiado.
- **Aproveitar:**
  - poucos cenários por funcionalidade, cada um com uma condição;
  - um verificador separado, chamado por um comando só;
  - quatro vereditos: verificado, parcial, bloqueado e falhou;
  - um laço de correção que não chama a pessoa;
  - cenários definidos já no planejamento;
  - hooks no início da sessão, no planejamento, na edição, antes da compactação e no fim;
  - um registro de revisão com comentários que o agente lê por comando;
  - a revisão aprovada vira teste permanente;
  - o "onde e como testar" separado do "o que testar".
- **Adaptar:** para backend, o verificador faz chamadas reais à API, à CLI e ao banco de teste, e guarda requisições,
  respostas e saídas como prova.
- **Não levar:** capturas de tela, vídeo, navegador e execução em nuvem.
- **Limitações:** é proprietário e depende da nuvem dele.

## Lacunas que o Curupira cobre

- Testes antes do código como regra, não como opção.
- Portões reais fora do agente: scripts, hooks e CI.
- Gestão de contexto e de cache.
- Um modo leve e um modo completo.
- Métricas embutidas.
- Funcionalidades pequenas.
