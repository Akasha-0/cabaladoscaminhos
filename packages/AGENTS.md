# Packages DOX

## Purpose

Workspaces pnpm compartilhados do monorepo Akasha. Cada package é
1 workspace independente, com `package.json`, build, e tests próprios.
Apps (`apps/akasha-portal/`) importam packages via TypeScript paths.

## Ownership

Packages principais (todos com AGENTS.md dedicado):

- `akasha-core/`: 5 Pilares orchestrator (AkashaInput, AkashaLeitura,
  Mandala, Mandato, PilarCabala, PilarAstrologia, PilarTantrica,
  PilarOdu, PilarIChing)
  → [AGENTS.md](akasha-core/AGENTS.md)
- `akasha-cli/`: Standalone CLI (diagnostico, setup, blessed TUI)
  → [AGENTS.md](akasha-cli/AGENTS.md)
- `mentor/`: Mentor AI (RAG + correlation + intent + F-227 Authority)
  → [AGENTS.md](mentor/AGENTS.md)
- `types/`: Tipos TypeScript compartilhados (AstrologyMap, KabalisticMap,
  TantricMap, OduMap, OduData, IChingMap)
- `core-astrology/`: Pilar 2 (Swiss Ephemeris via sweph)
  → [AGENTS.md](core-astrology/AGENTS.md)
- `core-cabala/`: Pilar 1 (Numerologia Cabalística, Mispar Hechrachi)
  → [AGENTS.md](core-cabala/AGENTS.md)
- `core-iching/`: Pilar 5 (64 hexagramas King Wen, Wilhelm/Baynes 1950)
  → [AGENTS.md](core-iching/AGENTS.md)
- `core-odus/`: Pilar 4 (15 Odus canônicos D-044, comparison engine)
  → [AGENTS.md](core-odus/AGENTS.md)
- `core-tantra/`: Pilar 3 (11 corpos Yogi Bhajan + 5 koshas védicas +
  4 temperamentos gregos R-019)
  → [AGENTS.md](core-tantra/AGENTS.md)

## Local Contracts

- **Barrel files** (`src/index.ts`): exportam API pública do package
- **Sem dependências circulares** entre packages (verificado por
  `tests/architecture/package-boundaries.test.ts`)
- **Tipos compartilhados** vivem em `packages/types/`, NÃO duplicados
- **App → Package**: apps importam packages (one-way)
- **Package → App**: NUNCA (quebraria boundaries)
- **Package → Package**: OK se necessário, mas preferir types/

## Work Guidance

- Cada package é workspace pnpm independente
- TypeScript estrito (zero `any` em código novo)
- Tests **co-located** com código (lesson N+24): `*.test.ts` ao lado
- Pilar 4 ethics invariant: respeito ao whitelist 15 Odus (N+15)
- Não inventar correspondências esotéricas
- Engines em `core-*/` são lazy-imported pelo `akasha-core` (F-200)
  para graceful degradation

## Verification

- `pnpm --filter @akasha/core-cabala typecheck` (per package)
- `pnpm --filter @akasha/core-cabala test` (per package)
- `pnpm typecheck` no workspace root (cross-package)
- `pnpm test:run` (suite full)
- `pnpm test:run tests/architecture/` (boundary checks)

## Import patterns

```ts
// Em apps/akasha-portal/src/...
import { calcular, AkashaInputSchema } from '@akasha/core';
import type { AstrologyMap, KabalisticMap } from '@akasha/types';

// Em packages/akasha-core/src/...
import type { AstrologyMap } from '@akasha/types';
// Lazy import engines (graceful degradation):
const cabala = await import('@akasha/core-cabala').catch(() => null);
```

## Related Files

- `apps/akasha-portal/tsconfig.json` — TS path aliases (`@akasha/*`)
- Root `tsconfig.json` — workspace-level paths
- `pnpm-workspace.yaml` — workspace config
- `tests/architecture/package-boundaries.test.ts` — boundary enforcement

## Child DOX Index

- [akasha-core](file:///home/skynet/cabala-dos-caminhos/packages/akasha-core/AGENTS.md) — 5 Pilares orchestrator
- [akasha-cli](file:///home/skynet/cabala-dos-caminhos/packages/akasha-cli/AGENTS.md) — Standalone CLI
- [mentor](file:///home/skynet/cabala-dos-caminhos/packages/mentor/AGENTS.md) — Mentor AI (RAG + Authority)
- [core-astrology](file:///home/skynet/cabala-dos-caminhos/packages/core-astrology/AGENTS.md) — Pilar 2 (Astrologia)
- [core-cabala](file:///home/skynet/cabala-dos-caminhos/packages/core-cabala/AGENTS.md) — Pilar 1 (Cabala)
- [core-iching](file:///home/skynet/cabala-dos-caminhos/packages/core-iching/AGENTS.md) — Pilar 5 (I Ching)
- [core-odus](file:///home/skynet/cabala-dos-caminhos/packages/core-odus/AGENTS.md) — Pilar 4 (15 Odus canônicos)
- [core-tantra](file:///home/skynet/cabala-dos-caminhos/packages/core-tantra/AGENTS.md) — Pilar 3 (Tantra)
