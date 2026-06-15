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
- [akasha-core](file:///home/skynet/cabala-dos-caminhos/packages/akasha-core/AGENTS.md) — 5 Pilares orchestrator
- [akasha-cli](file:///home/skynet/cabala-dos-caminhos/packages/akasha-cli/AGENTS.md) — Standalone CLI (blessed TUI)
- [mentor](file:///home/skynet/cabala-dos-caminhos/packages/mentor/AGENTS.md) — Mentor AI (RAG + correlation + intent)
- [core-astrology](file:///home/skynet/cabala-dos-caminhos/packages/core-astrology/AGENTS.md) — Pilar 2 (Swiss Ephemeris)
- [core-cabala](file:///home/skynet/cabala-dos-caminhos/packages/core-cabala/AGENTS.md) — Pilar 1 (Numerologia Cabalística)
- [core-iching](file:///home/skynet/cabala-dos-caminhos/packages/core-iching/AGENTS.md) — Pilar 5 (I-Ching)
- [core-odus](file:///home/skynet/cabala-dos-caminhos/packages/core-odus/AGENTS.md) — Pilar 4 (15 Odus)
- [core-tantra](file:///home/skynet/cabala-dos-caminhos/packages/core-tantra/AGENTS.md) — Pilar 3 (11 corpos + 5 koshas)
