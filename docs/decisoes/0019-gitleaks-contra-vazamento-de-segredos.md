# ADR-0019: Gitleaks contra vazamento de segredos

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

O repositório é público: um segredo que entra num commit fica no histórico para sempre.
O GitHub já faz varredura de segredos e bloqueia o push de tokens conhecidos, mas só no servidor e só para padrões de provedores.

## Opções consideradas

- Só a proteção do GitHub.
- Gitleaks só na CI.
- Gitleaks no pre-commit, no `vp run ready` e na CI.

## Decisão

Gitleaks em três pontos: no pre-commit (só o que está preparado para commit), no `vp run ready` (o histórico inteiro)
e, por consequência, na CI, que instala o binário numa versão fixa e confere o checksum.

## Consequências

- O segredo é barrado antes de virar commit, e a CI barra o que escapar do hook.
- Quem roda `vp run ready` ou faz commit precisa do Gitleaks instalado: é um binário à parte, não um pacote npm.
- Trocar a versão do Gitleaks na CI exige atualizar a versão e o checksum juntos.
