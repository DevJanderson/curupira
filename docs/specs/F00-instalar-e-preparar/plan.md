# F00: plano

Cada passo começa por um teste que falha (a prova do vermelho). Depende da F01b, que já tem o `hook answer`.

## Consequências de ADR que o código toca

| ADR                                                                          | Consequência                                                            | Como se confere                                                           |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [0009](../../decisoes/0009-instalacao-por-curl.md)                           | a instalação não usa o npm                                              | teste no passo 1 e C1: o `PATH` não tem `npm`, `npx` nem `pnpm`           |
| [0008](../../decisoes/0008-nome-provisorio-e-troca-facil.md)                 | o nome só na constante                                                  | teste no passo 1: o nome no script é o da constante do núcleo             |
| [0024](../../decisoes/0024-o-que-fica-na-maquina-e-no-projeto.md)            | o hook só chama `curupira hook <nome>`; pastas da máquina no padrão XDG | testes nos passos 1 e 2                                                   |
| [0023](../../decisoes/0023-estado-artefatos-e-dados-locais.md)               | o `init` põe `.curupira/local/` no `.gitignore`                         | teste no passo 2, com `git check-ignore`                                  |
| [0031](../../decisoes/0031-a-linha.md)                                       | o `init` não grava decisão                                              | teste no passo 2: não há `.curupira/state/` depois do `init`              |
| [0027](../../decisoes/0027-idioma-e-vocabulario-da-ferramenta.md)            | mensagens em pt-BR, fora do código                                      | revisão: o script tem um bloco de mensagens no topo; o `init`, o catálogo |
| [0021](../../decisoes/0021-nucleo-independente-de-agente-com-adaptadores.md) | o formato do `.claude/settings.json` fica no adaptador do Claude Code   | teste da fronteira, que já existe                                         |

## 1. O script de instalação

- **Teste primeiro:** com `HOME` e `PATH` descartáveis, e `CURUPIRA_REPO` apontando para um repositório local:
  - o `PATH` é uma pasta temporária só com links para `node`, `git`, `env`, `sh` e os utilitários POSIX que o script
    usa, sem `npm`, `npx` nem `pnpm`; no caso sem Git, o `git` fica de fora;
  - sem Node, sem Git ou com o Node abaixo de 24.11, para sem mudar nada;
  - com os dois, baixa para `$XDG_DATA_HOME/curupira/` e põe o link `~/.local/bin/curupira`, a saída cita os dois
    caminhos, e o comando, chamado pelo link, roda;
  - de novo, troca a cópia;
  - com a origem que não existe, deixa a cópia anterior; uma falha no meio da troca (forçada com um arquivo no
    lugar do nome da cópia de reserva, e não com permissão, que não vale para quem roda como root) também deixa a
    cópia anterior; a mensagem cita o caminho;
  - uma pasta `curupira/` sem a marca do Curupira, ou um `~/.local/bin/curupira` que não é o link, não são tocados;
  - um `XDG_DATA_HOME` relativo é ignorado, como manda o padrão XDG; `~/.local/bin/` é criada se faltar;
  - fora do `PATH`, diz a linha `export PATH="$HOME/.local/bin:$PATH"` e o arquivo, pelo `$SHELL` (`~/.zshrc`,
    `~/.bashrc`, senão `~/.profile`);
  - o nome no script é o da constante.
- **Como faz:**
  - baixa com `git clone --depth 1` do ramo padrão da origem para uma pasta ao lado, liga os pacotes do próprio
    Curupira em `node_modules/@curupira/` (lista fixa no script; o C1 pega a lista desatualizada) e troca o nome no
    fim: a cópia antiga vai para um nome de reserva, a nova entra, e a de reserva é apagada; se a nova não entrar, a
    de reserva volta; o link é trocado só depois, apontando para o mesmo caminho;
  - uma marca dentro da pasta diz que ela é do Curupira;
  - todo o corpo fica numa função chamada na última linha, para um download cortado não rodar pela metade;
  - só utilitários POSIX, sem opções do GNU;
  - as mensagens, em pt-BR, num bloco no topo do script;
  - o `main.ts` da CLI ganha a linha `#!/usr/bin/env node` e o modo 755 no Git (`git update-index --chmod=+x`).
- **Depois do teste:** rodar o script real a partir de um clone local, numa pasta pessoal descartável, e o comando
  instalado, porque é a primeira saída para a pessoa.
- **O que muda:** `install.sh` na raiz e `apps/cli/src/main.ts`.
- **Requisitos:** R1 a R5.

## 2. O comando `init`

- **Teste primeiro:** num repositório Git descartável:
  - `init` cria ou completa o `.claude/settings.json` com o hook, mantendo outras chaves e outros hooks, na raiz do
    repositório, mesmo se rodado numa subpasta; conta como presente só uma entrada de `UserPromptSubmit` cujo comando
    é exatamente `curupira hook answer`; com a entrada antiga do piloto (o `main.ts` pelo caminho), acrescenta a nova
    sem erro, e a antiga sai à mão no passo 3;
  - acrescenta `.curupira/local/` ao `.gitignore`, mantendo o resto e o fim de linha; conta como presente só a linha
    `.curupira/local/` idêntica, sem contar espaços no fim (vale: `.curupira/local/`, `.curupira/local/  `; não vale:
    `.curupira/local`, `/.curupira/local/`, `# .curupira/local/`); `git check-ignore` confirma a pasta fora do Git;
  - de novo, não muda nada e diz que já estava pronto;
  - fora do Git, com `settings.json` inválido, que é uma pasta ou que não é um objeto, com `.claude` que é um arquivo e
    com `.gitignore` sem permissão, recusa sem mudar nenhum arquivo, na ordem do R8;
  - não cria `.curupira/state/`.
- **O que muda:** o adaptador do Claude Code (o formato do hook no `settings.json`), o núcleo (o `.gitignore`),
  `apps/cli/src/run.ts` e o catálogo `pt-BR.json`, inclusive o uso, que passa a listar `init`.
- **Requisitos:** R6, R7, R8.

## 3. O piloto se prepara

- **Teste primeiro:** não se aplica; é o primeiro uso real.
- **O que muda:** o agente tira do `.claude/settings.json` a entrada antiga do hook (a que chama o `main.ts` pelo
  caminho). A pessoa, na fase 0 dela, roda o script com `CURUPIRA_REPO` apontando para este clone, que baixa a branch
  atual antes do merge, e depois `curupira init` neste repositório. Por fim, um "sim" numa conversa chega ao
  `.curupira/local/`.
- **Requisitos:** R6, na prática.

## 4. Os cenários como testes de regressão

- **Teste primeiro:** C1 a C5, com o `PATH` montado como no passo 1. Sem vermelho natural: a prova é uma mutação de
  propósito no código, desfeita em seguida ([roteiro da spec](../../metodo/roteiro-spec.md#planmd)).
- **O que muda:** `apps/cli/tests/scenarios-f00.test.ts`.
- **Requisitos:** os que os cenários cobrem.

## 5. Documentação

- **Teste primeiro:** não se aplica.
- **O que muda:** o README ganha a instalação (com `curl … | sh` e o jeito de baixar e ler antes), o `init` e como
  desinstalar (apagar a pasta do Curupira e o link); o ADR-0031 ganha a linha da entrega no histórico.
