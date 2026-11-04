# Curupira

O Curupira é uma ferramenta (ainda a construir) que organiza o desenvolvimento de software como uma fábrica humano + IA: o humano decide nas aprovações, o agente produz, e verificações automáticas garantem qualidade.

## Estado atual

Em construção, usado para construir a si mesmo. Já existem a instalação, o `init` e os comandos da jornada de uma
funcionalidade; a adoção de um projeto e o resto da [linha](docs/decisoes/0031-a-linha.md) vêm a seguir.

## Instalar

Requer Node 24.11 ou mais novo e Git, no Linux ou no macOS. Não usa o npm: o script baixa o Curupira do GitHub para
`~/.local/share/curupira/` (ou `$XDG_DATA_HOME/curupira/`) e põe o comando `curupira` em `~/.local/bin/`.

```bash
curl -fsSL https://raw.githubusercontent.com/DevJanderson/curupira/main/install.sh | sh
```

Para ler o script antes de rodar:

```bash
curl -fsSLO https://raw.githubusercontent.com/DevJanderson/curupira/main/install.sh
less install.sh
sh install.sh
```

Rodar o script de novo atualiza para a versão atual da `main`; quem instalou antes do comando `curupira request`
precisa rodá-lo de novo para tê-lo. Se `~/.local/bin/` não estiver no seu `PATH`, o script
diz a linha que você acrescenta ao arquivo do seu shell.

## Preparar um projeto

Dentro do repositório Git do projeto:

```bash
curupira init
```

O `init` liga no `.claude/settings.json` o hook que registra as suas respostas e põe `.curupira/local/` no
`.gitignore`, sem mexer no resto dos dois arquivos; o `settings.json` volta gravado com dois espaços de recuo. Rodar
de novo não muda nada. Se um dos dois for um link simbólico, o `init` recusa e não muda nada.

## Desinstalar

Apague a pasta do Curupira e o comando (com `XDG_DATA_HOME`, a pasta é `$XDG_DATA_HOME/curupira`):

```bash
rm -rf ~/.local/share/curupira ~/.local/bin/curupira
```

Nos projetos, a entrada do hook no `.claude/settings.json` e a linha do `.gitignore` saem à mão.

## Para desenvolver

Requer [Vite+](https://viteplus.dev) (`vp`), Node 24 (fixado em `.node-version`) e
[Gitleaks](https://github.com/gitleaks/gitleaks), que barra segredos no pre-commit e no `vp run ready`.

```bash
vp install   # instala as dependências
vp check     # formatação, lint e tipos
vp test      # testes
vp run ready # check, testes e varredura de segredos (o mesmo da CI)
```

## Licença

[GNU AGPL v3](LICENSE) (`AGPL-3.0-only`).
