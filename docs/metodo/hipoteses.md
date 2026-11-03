# Hipóteses

Cada hipótese é uma aposta a confirmar ou derrubar com evidência. O status de cada uma muda conforme a medição.

| #   | Hipótese                                                                                                              | Como verificar                                                    | Status |
| --- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------ |
| H1  | Especificações escritas antes do código reduzem a variação entre execuções do agente                                  | Mesma tarefa, com e sem spec, comparando o resultado              | aberta |
| H2  | Regras de projeto versionadas no repositório aumentam a aderência a padrões                                           | Contar violações de lint e arquitetura antes e depois             | aberta |
| H3  | Testes escritos ou aprovados pelo humano antes da implementação são o principal controle de qualidade                 | Taxa de defeitos com testes antes vs testes gerados depois        | aberta |
| H4  | Portões automáticos substituem boa parte da revisão manual linha a linha                                              | Tempo de revisão e defeitos que escapam                           | aberta |
| H5  | A revisão humana rende mais nos pontos de decisão (spec, plano, aprovação) do que no código final                     | Em que fase os defeitos são detectados                            | aberta |
| H6  | Uma base reutilizável (método + modelos + portões) transfere a qualidade entre projetos                               | Aplicar em 2 ou 3 projetos diferentes e comparar                  | aberta |
| H7  | Separar o contexto em camadas e delegar o trabalho ruidoso a subagentes reduz custo e retrabalho sem perder qualidade | Tokens, taxa de acerto do cache e defeitos, com e sem a separação | aberta |
