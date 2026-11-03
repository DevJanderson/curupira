# Curupira

O Curupira é uma ferramenta (ainda a construir) que organiza o desenvolvimento de software como uma fábrica humano + IA: o humano decide em portões, o agente produz, e verificações automáticas garantem qualidade.

## Estado atual

Base do repositório; nada implementado ainda.

## Comandos

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
