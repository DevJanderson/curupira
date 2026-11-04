# Changelog

As mudanças do Curupira, no formato do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), com versões no
[SemVer](https://semver.org/lang/pt-BR/) a partir de 0.1.0 (ADR-0034).

## [Unreleased]

### Added

- F01a: o estado de cada funcionalidade no Git, com os comandos `open`, `advance`, `approve`, `reject` e `status`.
- F01b: a aprovação e a recusa só com a resposta que a pessoa digitou, gravada pelo hook.
- F00: a instalação por `curl` a partir do GitHub e o `curupira init`.
- F01c: o `curupira request`, com a hora e o hash do que se aprova, e o teto de 280 caracteres no motivo da recusa.

### Changed

- O método: a spec em seis perguntas, com prazo e backlog (ADR-0032); todo passo com base (ADR-0033); o fluxo no
  GitHub (ADR-0034).
