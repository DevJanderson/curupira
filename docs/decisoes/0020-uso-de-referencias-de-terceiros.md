# ADR-0020: Uso de referências de terceiros

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

O Curupira é aberto (AGPL-3.0) e nasceu de uma pesquisa que estudou outras ferramentas.
Citar é necessário para a pesquisa ser rastreável; copiar conteúdo depende da licença de cada projeto.

## Opções consideradas

- Não citar ninguém: a pesquisa perde rastreabilidade.
- Citar livremente, em qualquer lugar.
- Citar com regras.

## Decisão

Citar com regras:

1. Nomes de outras ferramentas aparecem só em `docs/pesquisa/` e nos ADRs, sempre com fonte (link direto ou para
   [`docs/pesquisa/fontes.md`](../pesquisa/fontes.md)). Nunca no código, nas skills, nos modelos instalados nem na
   interface do produto.
2. De projetos proprietários (Kiro, Ranger), nada é copiado (textos, prompts, modelos, código): só descrito com
   palavras nossas.
3. De projetos com licença permissiva (MIT, Apache-2.0), reaproveitar trechos é permitido, mantendo o aviso de copyright
   e a licença deles junto do trecho, e registrando o reaproveitamento em `docs/pesquisa/fontes.md`.
4. Do specwork (do mesmo autor, AGPL-3.0), reaproveitar livremente.
5. Nada sugere parceria, endosso ou vínculo com os donos das marcas; os nomes são marcas dos seus donos.
6. A regra vale para produtos e marcas de terceiros. Normas e padrões (ISO/IEC, SWEBOK, OWASP), relatórios (DORA,
   SPACE), formatos abertos (AGENTS.md) e termos técnicos podem ser citados em qualquer documento, com fonte em
   [`docs/pesquisa/fontes.md`](../pesquisa/fontes.md) quando houver.
7. A regra dos itens 1 a 3 vale para referências estudadas (ferramentas e métodos analisados na pesquisa, como Kiro,
   Spec Kit, Ranger, Tessl e BMAD). Dependências e plataformas que o Curupira usa ou integra (Claude Code, GitHub,
   Node, Vite+, Vue, Gitleaks, Figma) podem ser citadas onde for necessário, inclusive no PRD, no README, na
   configuração e no código de integração, como o adaptador de cada agente.

## Consequências

- A pesquisa fica rastreável e o produto fica neutro.
- Cada reaproveitamento de código de terceiro exige registrar origem e licença.
- Não é parecer jurídico: se o Curupira virar produto comercial, as marcas devem passar por revisão jurídica.

## Histórico

- 2026-11-03: acrescentado o item 7, porque a regra original impediria o adaptador do Claude Code de ter o nome dele
  e o PRD de citar a stack.
