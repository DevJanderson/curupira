# Fontes da pesquisa

Esta lista segue o [ADR-0020](../decisoes/0020-uso-de-referencias-de-terceiros.md): toda ferramenta ou estudo citado na
pesquisa e nos ADRs tem a sua fonte aqui. Os nomes são marcas dos seus donos; citá-los não indica parceria, endosso ou vínculo.

## Ferramentas e métodos

| Fonte                                                                                  | O que é                                                                                 | Licença                  | Consulta   |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------ | ---------- |
| [GitHub Spec Kit](https://github.com/github/spec-kit) (v1.2.7.dev0)                    | CLI de spec-driven development com integrações para vários agentes                      | MIT                      | 2026-11-03 |
| [Kiro (AWS): specs](https://kiro.dev/docs/specs.md)                                    | Documentação das especificações do Kiro: requisitos, design e tarefas                   | proprietária             | 2026-11-03 |
| [Kiro: steering](https://kiro.dev/docs/steering/)                                      | Documentação do contexto de projeto do Kiro e seus modos de inclusão                    | proprietária             | 2026-11-03 |
| [Kiro: hooks](https://kiro.dev/docs/hooks/)                                            | Documentação das automações disparadas por eventos no Kiro                              | proprietária             | 2026-11-03 |
| [Kiro: testes baseados em propriedades](https://kiro.dev/blog/property-based-testing/) | Artigo sobre testes de propriedade extraídos dos requisitos                             | proprietária             | 2026-11-03 |
| [Ranger: como funciona](https://docs.ranger.net/concepts/how-it-works/)                | Visão geral do serviço de QA para agentes                                               | proprietária             | 2026-11-03 |
| [Ranger: cenários](https://docs.ranger.net/concepts/scenarios)                         | Documentação dos cenários de verificação do Ranger                                      | proprietária             | 2026-11-03 |
| [specwork](https://github.com/DevJanderson/specwork) (v1.0.0, mesmo autor)             | Tentativa anterior do autor, em Python, com contratos, avaliação independente e medição | AGPL-3.0                 | 2026-11-03 |
| [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD)                            | Método de desenvolvimento ágil conduzido por agentes de IA                              | MIT (com aviso de marca) | 2026-11-03 |
| Tessl, citado na [análise de Böckeler](#artigos-estudos-e-relatórios)                  | Ferramenta em que a spec é a fonte e o código é gerado a partir dela                    | proprietária             | 2026-11-03 |
| [Astro Starlight](https://starlight.astro.build)                                       | Gerador de sites de documentação, usado pela documentação do Ranger                     | MIT                      | 2026-11-03 |
| [AGENTS.md](https://agents.md)                                                         | Formato de arquivo de instruções para agentes de código                                 | formato aberto           | 2026-11-03 |
| [Vite+](https://github.com/voidzero-dev/vite-plus) (dependência do projeto)            | Ferramental unificado: formatação, lint, tipos, testes e tarefas                        | MIT                      | 2026-11-03 |
| [Gitleaks](https://github.com/gitleaks/gitleaks) (dependência do projeto)              | Varredura de segredos em repositórios git                                               | MIT                      | 2026-11-03 |

## Artigos, estudos e relatórios

| Fonte                                                                                                                                                                   | O que é                                                                        | Consulta   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------- |
| Böckeler, B. [Understanding Spec-Driven Development: Kiro, spec-kit, and Tessl](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) (martinfowler.com) | Análise comparada de três ferramentas e dos níveis de spec-driven development  | 2026-11-03 |
| Gloaguen et al. [Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988) (ETH Zurich, 2026)                                                                             | Estudo do efeito de arquivos de contexto no sucesso e no custo de agentes      | 2026-11-03 |
| [DORA 2025: State of AI-assisted Software Development](https://dora.dev/dora-report-2025/)                                                                              | Relatório anual sobre o desenvolvimento de software assistido por IA           | 2026-11-03 |
| [METR (2025)](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)                                                                                 | Estudo do impacto da IA de início de 2025 na produtividade de devs experientes | 2026-11-03 |
| [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)                             | Guia de engenharia de contexto para agentes                                    | 2026-11-03 |
| [Chroma (2025): Context Rot](https://trychroma.com/research/context-rot)                                                                                                | Estudo da queda de desempenho dos modelos com contextos longos                 | 2026-11-03 |
| [Anthropic: prompt caching](https://docs.claude.com/en/docs/build-with-claude/prompt-caching)                                                                           | Documentação do cache de prompt da API                                         | 2026-11-03 |

## Normas

| Fonte                                                                                                | Artigos usados              | O que sustenta                                                           | Consulta   |
| ---------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------ | ---------- |
| [Lei nº 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) | art. 6º, III; art. 46, § 2º | A medição guarda só números (necessidade); privacidade desde a concepção | 2026-11-03 |

## Reaproveitamentos

Nenhum trecho de terceiros foi reaproveitado até agora.
