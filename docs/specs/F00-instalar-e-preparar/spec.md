# F00: Instalar e preparar

- **Status:** na aprovação da fase 4
- **Data:** 2026-11-04

## Objetivo

Fechar a fase 0 da [linha](../../decisoes/0031-a-linha.md): a pessoa instala o Curupira na máquina com um script
baixado por `curl` do GitHub, sem npm e sem domínio próprio ([ADR-0009](../../decisoes/0009-instalacao-por-curl.md)),
e prepara cada projeto com `curupira init`, que liga o hook das respostas e põe `.curupira/local/` no `.gitignore`.
Depois disso, a adoção (F02) começa num projeto já preparado, sem passo à mão.

## Linha

Muda a linha 0 do ADR-0031, que hoje não tem nada construído. A tabela já descreve o que a F00 entrega; na entrega, o
ADR-0031 ganha uma linha no histórico.

## Requisitos

- **R1.** QUANDO a pessoa roda o script de instalação, O SISTEMA DEVE conferir se há Node 24.11 ou mais novo e Git e,
  se faltar um deles, parar sem mudar nada e dizer o que falta e a versão pedida.
- **R2.** QUANDO a pessoa roda o script de instalação com o Node e o Git presentes, O SISTEMA DEVE baixar o Curupira
  do repositório no GitHub para `$XDG_DATA_HOME/curupira/` (por padrão, `~/.local/share/curupira/`), pôr o comando
  `curupira` em `~/.local/bin/`, sem usar o npm, e dizer onde cada um ficou.
- **R3.** QUANDO a pessoa roda o script de instalação com o Curupira já instalado, O SISTEMA DEVE trocar a cópia pela
  versão atual do GitHub, sem mexer em nada fora da pasta do Curupira e do comando.
- **R4.** SE o download ou a gravação falhar, ou se a pasta ou o comando já existirem sem ser do Curupira, ENTÃO O
  SISTEMA DEVE deixar os dois como estavam e dizer qual caminho e por quê.
- **R5.** ENQUANTO `~/.local/bin/` não estiver no `PATH`, O SISTEMA DEVE terminar a instalação dizendo a linha que a
  pessoa acrescenta ao arquivo do seu shell.
- **R6.** QUANDO a pessoa roda `curupira init` dentro de um repositório Git, O SISTEMA DEVE ligar no
  `.claude/settings.json` da raiz o hook `UserPromptSubmit` que chama `curupira hook answer`, acrescentar
  `.curupira/local/` ao `.gitignore`, manter o resto dos dois arquivos, não gravar decisão nem estado, e dizer o que
  mudou.
- **R7.** QUANDO `curupira init` roda num projeto já preparado, O SISTEMA DEVE deixar os arquivos como estão e dizer
  que o projeto já estava pronto.
- **R8.** SE `curupira init` roda fora de um repositório Git, ou um dos dois arquivos não pode ser lido ou gravado, ou o
  `.claude/settings.json` não é um JSON com um objeto, ENTÃO O SISTEMA DEVE recusar sem mudar nenhum arquivo e dizer
  qual arquivo e por quê. Fora do Git vence; entre os arquivos, vale a ordem `.claude/settings.json`, `.gitignore`.

## Cenários

Cada cenário roda contra o script e a CLI reais, com uma pasta pessoal (`HOME`) descartável e, no `init`, num
repositório Git descartável. O script baixa de um repositório Git local, apontado pela variável `CURUPIRA_REPO`, para
não depender da rede.

### C1. A instalação põe o comando no caminho, sem npm

- **Cobre:** R1, R2.
- **Ponto de partida:** `HOME` vazio e um `PATH` montado só com o Node, o Git, os utilitários básicos e
  `~/.local/bin/`, sem `npm`, `npx` nem `pnpm`.
- **Ação:** rodar o script.
- **Resultado esperado:** `curupira status`, chamado pelo `PATH` num repositório Git vazio, responde que não há
  funcionalidades.

### C2. Sem Git, a instalação para antes de mudar qualquer coisa

- **Cobre:** R1.
- **Ponto de partida:** `HOME` vazio e um `PATH` montado como no C1, sem o Git.
- **Ação:** rodar o script.
- **Resultado esperado:** o script termina com erro, diz que falta o Git, e `HOME` continua vazio.

### C3. O `init` prepara o projeto

- **Cobre:** R6.
- **Ponto de partida:** o Curupira instalado; um repositório Git com um `.gitignore` de uma linha (`dist/`) e sem
  `.claude/`.
- **Ação:** `curupira init`.
- **Resultado esperado:** o `.claude/settings.json` tem o hook que chama `curupira hook answer`, e o `.gitignore` tem
  `dist/` e `.curupira/local/`.

### C4. O `init` de novo não muda nada

- **Cobre:** R7.
- **Ponto de partida:** o repositório do C3, depois do `init`.
- **Ação:** `curupira init` de novo.
- **Resultado esperado:** o comando diz que o projeto já estava pronto, e nenhum arquivo muda.

### C5. Um `settings.json` inválido não é tocado

- **Cobre:** R8.
- **Ponto de partida:** um repositório Git com um `.claude/settings.json` que não é JSON válido.
- **Ação:** `curupira init`.
- **Resultado esperado:** o comando termina com erro e cita o `.claude/settings.json`; nem ele nem o `.gitignore`
  mudam.

## Fora do escopo

- Publicar no npm, reservar o nome, ter um domínio e o binário por sistema (ADR-0009).
- Windows nativo e PowerShell ([PRD](../../product/prd.md)).
- Desinstalar: a pessoa apaga a pasta do Curupira e o comando; o README diz quais são.
- Escolher uma versão: o script baixa o ramo padrão. O aviso de versão diferente da do projeto fica com a F03
  ([ADR-0024](../../decisoes/0024-o-que-fica-na-maquina-e-no-projeto.md), regra 2).
- As skills e a instrução do agente no `init` (F03); os hooks que barram ações (F05).
- A tela inicial de `curupira` sem argumentos, com o mascote ([ADR-0029](../../decisoes/0029-mascote-no-terminal.md)).

## Dados pessoais

Nenhum. O script e o `init` mexem só em caminhos e arquivos de configuração.

## Decisões

- **Nada do npm, nem para as dependências.** A CLI, para rodar, só usa o Node e os pacotes do próprio Curupira, que
  vêm no download; o script os liga entre si, sem gerenciador de pacotes na máquina de quem instala. Assim, o que o
  ADR-0009 chama de "instalar as dependências" não depende do npm nem do pnpm.
- **A versão é a do ramo padrão do GitHub (a `main`)**, enquanto não houver versões publicadas. Rodar o script de novo
  atualiza.
- **`CURUPIRA_REPO` troca a origem do download**, para os testes e para quem tem uma cópia do repositório, como a
  variável que troca a raiz no ADR-0024. Sem ela, a origem é `https://github.com/DevJanderson/curupira`.
- **O hook chama `curupira hook answer`**, sem caminho, como manda o ADR-0024; quem clona sem o Curupira instalado vê
  o erro do hook, sem falha silenciosa.
- **O `init` é só preparar:** sem argumentos e sem entrada padrão. A entrega da proposta de perfil ganha outro nome
  na F02 (ADR-0031).

## Riscos aceitos

- **O script baixado por `curl` roda sem conferência de checksum.** Sem versões publicadas, não há arquivo fixo para
  conferir; a confiança vem do HTTPS e do repositório no GitHub. Quem quiser ler antes de rodar baixa o script e o lê.
- **O hook depende do `curupira` e de um Node 24.11 no `PATH` do agente.** Se a pessoa não acrescentar `~/.local/bin/`
  ao `PATH`, ou se o agente achar um Node mais velho (com nvm, por exemplo), o hook falha com o erro do shell ou do
  Node, visível, até ela corrigir.

## Histórico

- 2026-11-04: rascunho e contraditório em duas rodadas, com 22 achados (12 lacunas e 6 excessos na primeira, 4 lacunas
  na segunda). Na spec: o R4 passou a cobrir a pasta e o comando que não são do Curupira; o `--dry-run`, a troca
  automática do hook antigo e três decisões repetidas saíram; o C3 e o C4 ficaram com uma condição cada; o C1 prova a
  instalação sem npm; o `init` ficou só como preparar. No plano: a ordem da troca, a marca na pasta, o `PATH` montado
  dos testes, o modo 755 e o que vale como hook e como linha do `.gitignore`. Risco aceito: o Node do agente.
  Recusados: a variável de versão, a divisão em duas peças e o `init` na subpasta. O destino de cada achado está no
  [relato](../../pesquisa/relatos/2026-11-04-fase-3-f00.md).
