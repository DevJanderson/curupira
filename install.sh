#!/bin/sh
# Instala o Curupira a partir do GitHub, sem npm (ADR-0009, spec da F00).
#
#   curl -fsSL https://raw.githubusercontent.com/DevJanderson/curupira/main/install.sh | sh
#
# Para ler antes de rodar, baixe com `curl -fsSLO <o mesmo endereço>`, abra o arquivo e rode `sh install.sh`.
# Rodar de novo troca a cópia pela versão atual do ramo padrão.

# O nome é provisório (ADR-0008): no script, ele só está aqui, igual à constante BRAND.name do núcleo.
NAME=curupira
DISPLAY_NAME=Curupira
# A origem do download; a variável a troca, para os testes e para quem tem uma cópia do repositório.
REPO=${CURUPIRA_REPO:-https://github.com/DevJanderson/$NAME}
NODE_MAJOR=24
NODE_MINOR=11
# Os pacotes do próprio Curupira que a CLI importa; o script os liga em node_modules/@$NAME/.
PACKAGES="core claude-code"

# As mensagens, em pt-BR (ADR-0027). As com o nome usam aspas duplas, que o trocam na hora.
MSG_NO_NODE='Falta o Node %s ou mais novo. Instale-o e rode o script de novo.'
MSG_OLD_NODE="O Node encontrado é o %s; o $DISPLAY_NAME pede o %s ou mais novo. Atualize-o e rode o script de novo."
MSG_NO_GIT='Falta o Git. Instale-o e rode o script de novo.'
MSG_NOT_OURS="%s já existe e não é do $DISPLAY_NAME; nada foi mudado. Mova ou apague esse caminho e rode o script de novo."
MSG_IN_THE_WAY='%s está no caminho da troca; nada foi mudado. Apague esse caminho e rode o script de novo.'
MSG_DOWNLOAD="Não foi possível baixar o $DISPLAY_NAME de %s; nada foi mudado."
MSG_UNWRITABLE='Não foi possível gravar em %s; a cópia anterior, se havia, ficou como estava.'
MSG_SWAP='Não foi possível pôr a cópia nova em %s; a cópia anterior ficou como estava.'
MSG_RESTORE='Não foi possível pôr a cópia nova em %s, nem devolver a anterior, que está em %s.'
MSG_DONE="$DISPLAY_NAME instalado em %s.\nComando: %s."
MSG_PATH='A pasta %s não está no PATH. Acrescente esta linha ao arquivo %s e abra um terminal novo:'
MSG_NEXT='Depois, em cada projeto, rode: %s init'

fail() {
  format=$1
  shift
  # shellcheck disable=SC2059
  printf "$format\n" "$@" >&2
  exit 1
}

say() {
  format=$1
  shift
  # shellcheck disable=SC2059
  printf "$format\n" "$@"
}

exists() {
  [ -e "$1" ] || [ -L "$1" ]
}

check_tools() {
  wanted="$NODE_MAJOR.$NODE_MINOR"
  command -v node >/dev/null 2>&1 || fail "$MSG_NO_NODE" "$wanted"
  version=$(node -p process.versions.node 2>/dev/null) || fail "$MSG_NO_NODE" "$wanted"
  major=${version%%.*}
  rest=${version#*.}
  minor=${rest%%.*}
  case "$major.$minor" in
    *[!0-9.]* | .* | *.) fail "$MSG_OLD_NODE" "$version" "$wanted" ;;
  esac
  if [ "$major" -lt "$NODE_MAJOR" ] || { [ "$major" -eq "$NODE_MAJOR" ] && [ "$minor" -lt "$NODE_MINOR" ]; }; then
    fail "$MSG_OLD_NODE" "$version" "$wanted"
  fi
  command -v git >/dev/null 2>&1 || fail "$MSG_NO_GIT"
}

main() {
  check_tools

  # Um XDG_DATA_HOME relativo é ignorado, como manda o padrão XDG.
  case "${XDG_DATA_HOME:-}" in
    /*) data_home=$XDG_DATA_HOME ;;
    *) data_home=$HOME/.local/share ;;
  esac
  target=$data_home/$NAME
  new=$data_home/.$NAME-new
  old=$data_home/.$NAME-old
  mark=.$NAME-install
  bin_dir=$HOME/.local/bin
  link=$bin_dir/$NAME
  entry=$target/apps/cli/src/main.ts

  # Antes de mudar qualquer coisa: a pasta e o comando, se existem, têm de ser do Curupira (R4).
  if exists "$target" && ! { [ -d "$target" ] && [ -f "$target/$mark" ]; }; then
    fail "$MSG_NOT_OURS" "$target"
  fi
  if exists "$link" && ! { [ -L "$link" ] && [ "$(readlink "$link")" = "$entry" ]; }; then
    fail "$MSG_NOT_OURS" "$link"
  fi
  for spare in "$new" "$old"; do
    if exists "$spare"; then fail "$MSG_IN_THE_WAY" "$spare"; fi
  done

  # A cópia nova nasce ao lado e só entra no lugar da antiga no fim; se o script parar antes, ela sai.
  trap 'rm -rf "$new"' EXIT
  trap 'exit 1' INT TERM
  mkdir -p "$data_home" 2>/dev/null || fail "$MSG_UNWRITABLE" "$data_home"
  git clone --quiet --depth 1 "$REPO" "$new" || fail "$MSG_DOWNLOAD" "$REPO"
  mkdir -p "$new/node_modules/@$NAME" || fail "$MSG_UNWRITABLE" "$new"
  for package in $PACKAGES; do
    ln -s "../../packages/$package" "$new/node_modules/@$NAME/$package" || fail "$MSG_UNWRITABLE" "$new"
  done
  printf '%s\n' "$REPO" >"$new/$mark" || fail "$MSG_UNWRITABLE" "$new"

  if [ -d "$target" ]; then
    mv "$target" "$old" || fail "$MSG_SWAP" "$target"
    if ! mv "$new" "$target"; then
      mv "$old" "$target" || fail "$MSG_RESTORE" "$target" "$old"
      fail "$MSG_SWAP" "$target"
    fi
    rm -rf "$old"
  else
    mv "$new" "$target" || fail "$MSG_SWAP" "$target"
  fi

  # O link aponta sempre para o mesmo caminho, então só nasce na primeira instalação.
  mkdir -p "$bin_dir" 2>/dev/null || fail "$MSG_UNWRITABLE" "$bin_dir"
  if ! [ -L "$link" ]; then
    ln -s "$entry" "$link" || fail "$MSG_UNWRITABLE" "$link"
  fi

  say "$MSG_DONE" "$target" "$link"
  case ":$PATH:" in
    *":$bin_dir:"*) ;;
    *)
      case "${SHELL##*/}" in
        zsh) rc=$HOME/.zshrc ;;
        bash) rc=$HOME/.bashrc ;;
        *) rc=$HOME/.profile ;;
      esac
      say "$MSG_PATH" "$bin_dir" "$rc"
      # shellcheck disable=SC2016
      say '  %s' 'export PATH="$HOME/.local/bin:$PATH"'
      ;;
  esac
  say "$MSG_NEXT" "$NAME"
}

# O corpo só roda aqui, na última linha, para um download cortado no meio não rodar pela metade.
main "$@"
