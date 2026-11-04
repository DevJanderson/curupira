# F00: verificação

- **Código verificado:** `ac53a57`, na branch `feat/F00`
- **Data:** 2026-11-04
- **Verificador:** um subagente separado, de outro modelo, que não implementou o código; leu só a [spec](spec.md) e os
  testes dos cenários, e rodou o script e o comando instalado como caixa-preta, com `env -i`, uma pasta pessoal
  descartável, um `PATH` só com links e sem `npm`, `npx` nem `pnpm`, e a origem num clone local.

As provas brutas ficaram em `.curupira/local/F00/verification/`, fora do Git
([verificação](../../conceitos/verificacao.md)).

## Vereditos

| Cenário                                                      | Veredito   |
| ------------------------------------------------------------ | ---------- |
| C1. A instalação põe o comando no caminho, sem npm           | verificado |
| C2. Sem Git, a instalação para antes de mudar qualquer coisa | verificado |
| C3. O `init` prepara o projeto                               | verificado |
| C4. O `init` de novo não muda nada                           | verificado |
| C5. Um `settings.json` inválido não é tocado                 | verificado |

## Resumo das provas

- **C1.** O script saiu com 0, disse onde ficaram a pasta e o comando, e `curupira status`, pelo `PATH`, num
  repositório Git vazio, respondeu que não há funcionalidades.
- **C2.** Sem o Git, saiu com 1 e "Falta o Git. Instale-o e rode o script de novo."; a pasta pessoal ficou vazia.
- **C3.** O `init` saiu com 0; o `settings.json` tem só o hook `curupira hook answer`, e o `.gitignore` ficou
  `dist/` e `.curupira/local/`; não nasceu `.curupira/` no projeto.
- **C4.** O segundo `init` disse "O projeto já estava pronto; nada mudou.", e os hashes ficaram iguais.
- **C5.** O `init` saiu com 1 e citou o `.claude/settings.json`; os dois arquivos ficaram iguais (sha256).

Também conferido, além dos cenários: o Node 22.0.0 e o 24.10.0 param sem mudar nada; o `XDG_DATA_HOME` muda a pasta;
rodar de novo troca a cópia sem tocar no resto da pasta pessoal; uma pasta ou um comando de outro dono, inclusive um
link para outro lugar, não são tocados; uma origem que não existe deixa a cópia anterior; o arquivo do shell segue o
`$SHELL`; o `init` numa subpasta prepara a raiz; o fim de linha CRLF fica; fora do Git, o erro do Git vence; um
`settings.json` que não é objeto ou está vazio, um `.gitignore` ilegível ou que é pasta, um `.claude` que é arquivo
ou sem permissão de escrita recusam sem mudar nada, na ordem do R8.

## Os testes dos cenários

O verificador leu `apps/cli/tests/scenarios-f00.test.ts`. Três lacunas, corrigidas: o C1 não conferia que a saída diz
onde ficaram a pasta e o comando; o C3 não conferia a mensagem do que mudou nem a ausência de `.curupira/`; o C5 só
comparava os arquivos que já existiam, e um arquivo novo passaria. Duas mutações de propósito (o `init` criando
`.curupira/state/` e criando um arquivo a mais) fizeram o C3 e o C5 falharem; depois, foram desfeitas.

## Prova do vermelho

- Passos 1 e 2 do plano: os 14 testes do script e os 13 do `init` rodaram falhando antes do código.
- Passo 4: uma mutação por cenário (sem o link, sem conferir o Git, sem a linha do `.gitignore`, o hook sempre
  acrescentado, o JSON inválido lido como vazio); cada uma fez o seu cenário falhar.

## Observações

Nenhuma contraria a spec.

- Numa instalação nova cujo download falha, sobra um `~/.local/share/` vazio que não existia; a pasta e o comando do
  Curupira não nascem, e a mensagem diz "nada foi mudado".
- A mensagem do `git clone` aparece junto da do script, em inglês.
- A cópia instalada traz o `.curupira/` deste repositório, porque é um clone dele; não afeta os projetos.

## O laço de correção

| Rodada | Código    | Achados                                             | Correção                       |
| ------ | --------- | --------------------------------------------------- | ------------------------------ |
| 1ª     | `ac53a57` | nenhum defeito; 3 lacunas nos testes, 3 observações | testes dos cenários reforçados |
