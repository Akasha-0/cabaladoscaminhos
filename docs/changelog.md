---
title: Changelog — Akasha Portal
sidebar_label: Changelog
---

# Changelog — Akasha Portal

> Changelog auto-gerado por `scripts/generate-changelog.sh` a partir do
> git log do repositório. Cada página lista os merges Wave N.x, os commits
> não-merge de cada merge, e diff stats agregados.

## Índice por Wave

- [Wave 3](./_changelog/wave-3.md)
- [Wave 4](./_changelog/wave-4.md)
- [Wave 5](./_changelog/wave-5.md)
- [Wave 7](./_changelog/wave-7.md)
- [Wave 8](./_changelog/wave-8.md)
- [Wave 9](./_changelog/wave-9.md)
- [Wave 10](./_changelog/wave-10.md)
- [Wave 11](./_changelog/wave-11.md)
- [Wave 12](./_changelog/wave-12.md)
- [Wave 13](./_changelog/wave-13.md)

## Como regenerar

```bash
./scripts/generate-changelog.sh
```

O script detecta merges Wave N.x no primeiro-parent chain, agrupa commits
por merge, e escreve páginas determinísticas (mesmo SHA → mesmo output).

Para customizar destino:

```bash
./scripts/generate-changelog.sh --out docs/_changelog --index docs/changelog.md
```
