# ADR-0024: O que fica na máquina e o que fica no projeto

- **Status:** aceita
- **Data:** 2026-11-03

## Contexto

O Curupira é instalado uma vez por máquina (fase 0 da [jornada](../conceitos/jornada.md)) e adotado em vários
projetos. É preciso decidir o que mora na máquina, o que mora em cada projeto e, no projeto, o que vai para o Git,
sem perder informação e sem espalhar arquivos sem dono pelo computador. O
[ADR-0023](0023-estado-artefatos-e-dados-locais.md) já separou, dentro do projeto, o estado, os artefatos e os dados
locais.

Três fatos da documentação do Claude Code pesam:

- Um plugin junta skills, subagentes e hooks. Ele é instalado na máquina, em `~/.claude/plugins/`, e ligado por
  projeto com uma entrada `enabledPlugins` no `.claude/settings.json`, que vai para o Git. Quem abre o projeto sem o
  plugin instalado vê o erro "enabled in project settings but isn't installed here". A documentação não prevê fixar a
  versão do plugin por projeto ([instalar plugins](https://code.claude.com/docs/en/plugins/install),
  [carregamento](https://code.claude.com/docs/en/plugins/loading)).
- Os registros de sessão ficam em `~/.claude/projects/<pasta>/<sessão>.jsonl` e são apagados depois de 30 dias, por
  padrão. O formato é interno e muda entre versões ([sessões](https://code.claude.com/docs/en/sessions)).
- O nome da pasta de cada projeto é o caminho com os caracteres não alfanuméricos trocados por `-`, cortado e com um
  hash quando passa de 200 caracteres; não dá para voltar do nome ao caminho com segurança (mesma fonte).

Na máquina do autor, em 2026-11-03, esses registros somavam 479 MB em 12 pastas.

## Opções consideradas

Para os arquivos do adaptador (skills, subagentes e hooks):

- No projeto, no Git: quem clona já tem tudo, mas cada atualização gera diffs grandes de arquivos gerados.
- No projeto, fora do Git, refeitos pela instalação, como o specwork
  ([README do specwork](https://github.com/DevJanderson/specwork/blob/main/README.md)): o Git fica limpo, mas os
  arquivos gerados ficam dentro do `.claude/` do projeto, e os hooks teriam de ir no `settings.json`, que é
  versionado.
- Na máquina, como plugin do Claude Code, ligado por projeto: nenhum arquivo gerado no projeto.

Para a organização da máquina:

- Uma pasta oculta única na home, com tudo misturado.
- Um banco central com os dados de todos os projetos.
- Uma pasta por tipo de dado, só com ponteiros e cache, e o projeto como fonte da verdade.

## Decisão

O projeto é a fonte da verdade. A máquina guarda só o programa, ponteiros e cache: apagar o que o Curupira deixa
na máquina não perde nada, e o que se apaga se refaz ao abrir cada projeto.

### Na máquina

| Onde                               | O que guarda                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| onde o instalador puser (ADR-0009) | o programa: CLI, núcleo, painel e o adaptador                                                                |
| `~/.claude/plugins/`               | o adaptador, instalado como plugin do Claude Code; a pasta é do Claude Code                                  |
| `~/.config/curupira/`              | a configuração da pessoa; só existe se ela mudar algo (a porta do painel, por exemplo)                       |
| `~/.local/state/curupira/`         | os ponteiros: os projetos conhecidos e seus caminhos, o painel em execução, o log da ferramenta com rotação  |
| `~/.cache/curupira/projetos/<id>/` | o cache de cada projeto, como até onde cada registro de sessão já foi lido; pode ser apagado a qualquer hora |
| `~/.claude/projects/`              | os registros de sessão do agente; a pasta é do Claude Code, e o Curupira só lê                               |

As pastas seguem o padrão XDG ([XDG Base Directory](https://specifications.freedesktop.org/basedir-spec/latest/)),
no Linux, no macOS e no WSL, e respeitam as variáveis `XDG_*` quando definidas. Os nomes derivam da constante do
nome ([ADR-0008](0008-nome-provisorio-e-troca-facil.md)), e uma variável de ambiente troca a raiz, para testes e CI.

### No projeto

| Onde                                        | Git | O que guarda                                                                      |
| ------------------------------------------- | --- | --------------------------------------------------------------------------------- |
| `docs/produto/` e `docs/specs/<ID>-<nome>/` | sim | os artefatos (ADR-0023), inclusive a `verificacao.md` de cada funcionalidade      |
| `.curupira/`                                | sim | o perfil, o estado, a medição, o id do projeto e a versão do Curupira que ele usa |
| `.curupira/local/`                          | não | provas brutas, rodadas, eventos dos hooks para o painel e temporários             |
| `.claude/settings.json`                     | sim | só a entrada que liga o plugin do Curupira                                        |
| `AGENTS.md` e `CLAUDE.md`                   | sim | um bloco curto e delimitado do Curupira; o resto do arquivo é do projeto          |
| `.gitignore`                                | sim | a linha `.curupira/local/`                                                        |

Nomes e formatos dos arquivos dentro de `.curupira/` ficam para a F01.

### Regras

1. **Adaptador como plugin.** A instalação do Curupira registra um marketplace local, que aponta para o programa
   instalado. Em cada projeto, a CLI liga o plugin no `.claude/settings.json` e o instala no escopo do projeto,
   em cada máquina. Os hooks ficam dentro do plugin.
2. **Versão.** Como o plugin não fixa versão por projeto, a CLI compara a versão que o projeto usa com a instalada e
   avisa quando não batem.
3. **Projeto pelo id, não pelo caminho.** O id fica em `.curupira/`, no Git. Um mesmo id pode ter vários caminhos
   (pasta movida, worktrees); caminho que sumiu aparece como "não encontrado".
4. **Projetos isolados.** O cache é separado por id do projeto, e não há banco central que junte os projetos. O
   único arquivo compartilhado é a lista de projetos conhecidos, gravada de forma atômica.
5. **Memória.** Nada é carregado inteiro: os registros de sessão são lidos linha a linha, só o que é novo e só os
   do projeto pedido. A tela inicial do painel lê só os arquivos de estado de cada projeto.
6. **Um painel por máquina**, com uma porta só; a pessoa escolhe o projeto nele. Cada CLI só escreve dentro do seu
   projeto.
7. **Provas.** O veredito de cada cenário, com um resumo da prova (o que foi rodado e o que saiu de importante,
   inclusive a prova do vermelho), vai para `docs/specs/<ID>-<nome>/verificacao.md`, no Git. A saída bruta fica em
   `.curupira/local/`, fora do Git: é grande e pode ter dados pessoais do ambiente de teste
   ([LGPD](../pesquisa/fontes.md#normas), art. 6º, III).
8. **Medição.** No fim de cada sessão, a CLI grava os números em `.curupira/medicao/`, um arquivo por
   funcionalidade, a partir do caminho do registro que o hook recebe (`transcript_path`). O registro de sessão nunca
   é copiado. A leitura do formato fica no adaptador
   ([ADR-0021](0021-nucleo-independente-de-agente-com-adaptadores.md)).

## Consequências

- Gravar a medição a cada sessão protege os números da limpeza de 30 dias. A mudança de formato continua sendo um
  risco, e a [Q10](../produto/perguntas-em-aberto.md) continua aberta para o teste com registro de exemplo.
- Quem clona o projeto sem o Curupira vê o erro do Claude Code, sem falha silenciosa. Avançar fases exige a CLI, e
  os portões continuam valendo na CI.
- O plugin do projeto só carrega depois que a pessoa marca a pasta como confiável no Claude Code.
- As skills passam a ter o nome do plugin na frente (`curupira:<skill>`), e o `SKILL_PREFIX` do núcleo pode ficar
  desnecessário; isso se revê na F03.
- Num repositório público, os números da medição ficam visíveis; a documentação avisa, como faz com o nome de quem
  aprova.
- Desinstalar remove o programa, as três pastas da máquina e o plugin; os projetos ficam intactos.
- Ajusta o ADR-0023: as provas se dividem entre o Git e `.curupira/local/`, e a medição entra em `.curupira/`.
