# ADR-0034: o fluxo no GitHub

- **Status:** aceita
- **Data:** 2026-11-04

## Contexto

A linha ([ADR-0031](0031-a-linha.md)) já anda por branch e PR, mas o fluxo no GitHub foi montado sem base: não há
issue, a `main` não tem proteção, as branches ficam depois do merge e nada liga o PR ao que ele entrega. Pelo
[ADR-0033](0033-todo-passo-tem-base.md), cada passo precisa de uma base. A
[pesquisa](../pesquisa/relatos/2026-11-04-fluxo-github.md) comparou GitHub Flow, Git Flow, GitLab Flow e
trunk-based development, a evidência da DORA e três estudos acadêmicos sobre PR e revisão, e chegou a um fluxo e a
cinco escolhas. A pessoa aceitou as cinco recomendações com "sim, as cinco".

## Opções consideradas

- **Git Flow:** feito para várias versões em paralelo; o próprio autor indica o GitHub Flow para entrega contínua.
- **GitLab Flow:** acrescenta branches de ambiente, que o Curupira não tem.
- **GitHub Flow com branches curtas, como no trunk-based development:** uma branch curta por peça, um PR, CI antes do
  merge, branch apagada depois.

## Decisão

GitHub Flow com branches curtas, nos passos da linha:

| Passo da linha               | No GitHub                                                                                                  | Base                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Abrir a peça (fase 3)        | o agente abre a issue da peça pelo form e cria `feat/<ID>` a partir da `main`                              | GitHub Flow; issue forms; trunk-based                      |
| Spec e plano                 | commits `docs(<ID>): …`; depois do commit da spec, o PR abre como rascunho, com "Closes #n"                | Conventional Commits; GitHub Flow; agentes por PR rascunho |
| Aprovação da spec (fase 4)   | o "sim" e o `curupira request`, como hoje                                                                  | [ADR-0025](0025-a-pessoa-decide-pela-conversa.md)          |
| Implementar e verificar      | commits pequenos, com o teste antes; a CI (`ready`) roda a cada push; o veredito vai para o corpo do PR    | Google, mudanças pequenas; Bacchelli e Bird                |
| Revisão e aprovação (fase 7) | o PR sai de rascunho, pelo template; acima de cerca de 400 linhas de código mudadas, o cartão avisa        | GitHub Flow; Google; DORA, lotes pequenos                  |
| Merge e entrega (fase 8)     | a pessoa faz o merge com commit de merge; a branch se apaga; a issue fecha sozinha; uma linha no changelog | Driessen; GitHub Flow; Keep a Changelog                    |

As cinco escolhas:

1. **A lista de peças segue no [`features.md`](../product/features.md)**, no Git. A issue nasce quando a peça abre e
   fecha no merge; o [backlog](../product/backlog.md) não vira issue.
2. **O merge é com commit de merge**, o único método permitido no repositório: ele guarda a sequência de teste e
   código e o estado no Git, que o squash apagaria.
3. **A aprovação segue pelo "sim" e pelo `curupira request`.** O ruleset da `main` não exige revisão: o agente usa o
   `gh` da pessoa, e o GitHub não deixa o autor aprovar o próprio PR.
4. **Um PR por peça**, aberto como rascunho depois do commit da spec e marcado pronto na fase 7.
5. **Cada peça entregue ganha uma linha no "Unreleased" do [`CHANGELOG.md`](../../CHANGELOG.md)**; tag SemVer 0.y.z e
   release só em marcos, por decisão da pessoa.

O que fica no GitHub, configurado uma vez:

- um ruleset na `main`: exigir PR, exigir o check `ready`, barrar force push e exclusão;
- só o commit de merge permitido; a branch apagada no merge;
- o form da issue de peça em `.github/ISSUE_TEMPLATE/` e o template do PR em `.github/pull_request_template.md`.

Nenhum desses passos vira código do Curupira agora ([ADR-0032](0032-parar-a-recursao.md)): o agente os faz pelo `gh`.

## Consequências

- O commit segue o Conventional Commits; o ID da peça pode ser o escopo, como em `feat(F02): …`.
- A regra 4 do ADR-0031 ganha a issue e o PR rascunho.
- A proteção da `main` vale também para o agente: nada chega à `main` sem PR e sem a CI passando.
- A aprovação da pessoa não aparece como revisão no GitHub; ela fica no estado da peça, pelo `curupira request`.
- Se um dia o agente tiver identidade própria no GitHub, a escolha 3 pode mudar para a revisão formal.
