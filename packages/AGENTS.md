# Packages DOX

## Purpose
Bibliotecas core e utilitários compartilhados do ecossistema Akasha.

## Ownership
Pacotes principais:
- `akasha-core/`: Motor de dashboard e correlações
- `akasha-cli/`: CLI de linha de comando
- `mentor/`: Sistema de mentoria com RAG
- `core-astrology/`: Cálculos astrológicos
- `core-cabala/`: Cálculos cabalísticos
- `core-iching/`: I Ching hexagrams e práticas
- `core-odus/`: Sistema Ifá/Odus
- `core-tantra/`: Práticas tântricas
- `types/`: Tipos TypeScript compartilhados

## Local Contracts
- Barrel files (`index.ts`) exportam toda API pública
- Sem dependências circulares entre packages
- Tipos compartilhados vão em `types/`

## Work Guidance
- Cada package é um workspace pnpm independente
- Usar TypeScript estrito
- Arquivos de teste ao lado do código fonte

## Verification
- `pnpm typecheck` no workspace root
- `pnpm test:run`

## Child DOX Index
- [akasha-core](file:///home/skynet/cabala-dos-caminhos/packages/akasha-core/AGENTS.md) (se existir)
- [akasha-cli](file:///home/skynet/cabala-dos-caminhos/packages/akasha-cli/AGENTS.md) (se existir)
- [mentor](file:///home/skynet/cabala-dos-caminhos/packages/mentor/AGENTS.md) (se existir)
