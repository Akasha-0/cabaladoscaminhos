# Akasha — Project Memory

## What is Akasha?

**Akasha** is a multi-domain spiritual guidance system that synthesizes five Western esoteric traditions into a unified, interactive experience. The system provides birth-chart calculations, divination readings, mentorship guidance, and cross-traditional correlation analysis.

## Domains Covered

| Domain | Description | Key Package |
|--------|-------------|-------------|
| **Cabala** | Kabbalistic pathworking, Sephirot analysis, tree of life interpretations | `packages/core-cabala` |
| **I Ching** | Hexagram divination via coin/ystem methods, Yi Jing wisdom | `packages/core-iching` |
| **Odus** | Odu Ifá system (16 principal odus), Orixá alignments | `packages/core-odus` |
| **Tantra** | Chakra system, kundalini mapping, tantric energy work | `packages/core-tantra` |
| **Mentor** | AI-guided spiritual mentorship, personalized guidance | `packages/mentor` |

## Package Architecture

```
cabala-dos-caminhos/
├── packages/
│   ├── akasha-cli/          # Node.js CLI tool for local readings
│   ├── akasha-core/         # Shared engine — deep-correlation, narrative, shared types
│   ├── akasha-portal/       # React web app (Next.js) — user-facing UI
│   ├── core-astrology/      # Birth chart calculation engine
│   ├── core-cabala/         # Cabala/Kabbalah domain logic
│   ├── core-iching/         # I Ching hexagram generation
│   ├── core-odus/           # Odu Ifá system
│   ├── core-tantra/         # Tantra/Chakra domain logic
│   └── mentor/              # Mentor/guidance subsystem
├── apps/
│   └── akasha-portal/       # React portal app
├── docs/
│   ├── adrs/                # Architecture Decision Records
│   └── audit/               # Security and quality audits
├── grimoire/                # Ancestral, botanica, diagnostico, iching, mentor, vibracional
├── memory/                  # Session cycle logs (cycle-NNN.md)
├── scripts/                 # Dev and build scripts
└── tests/                   # Vitest unit, integration, and architecture tests
```

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm (monorepo via `pnpm-workspace.yaml`)
- **Web:** React + Next.js (portal), Node.js (CLI, API)
- **Testing:** Vitest
- **Database:** Prisma ORM (portal)
- **Styling:** Tailwind CSS + design system tokens

## Key Architectural Decisions

All significant decisions are documented in `docs/adrs/`:

- **ADR-001** — Shared domain types live in `domain/types/`, not `interface/`
- **ADR-002** — Barrel file pattern for clean public exports
- **ADR-003** — Resolution of V001 boundary violation
- **ADR-004** — Shared utilities in `shared/` to avoid duplication
- **ADR-025** — Narrative engine architecture
- **ADR-026** — Deep spiritual correlation engine (cross-tradition harmony scoring)

## Important Patterns

- **Spiritual Correlation Maps** — `packages/akasha-core/src/deep-correlation-engine/correlation-maps.ts` maps symbols across traditions (ODU_SEPHIROT_MAP, TAROT_ORIXA_MAP, CHAKRA_ELEMENT_MAP, etc.)
- **Domain Types** — All cross-domain spiritual types in `packages/akasha-core/src/domain/types/`
- **Shared Utilities** — Common helpers in `packages/akasha-core/src/shared/`
- **Clean Boundaries** — `interface/` is for API contracts only; domain types stay in `domain/`

## Development Notes

- Run portal: `pnpm --filter @akasha/portal dev`
- Run CLI: `pnpm --filter @akasha/cli <command>`
- Run tests: `pnpm test`
- Build: `pnpm build`
- ADRs follow the `# ADR-NNN: Title` format with Status, Context, Decision, Consequences sections

## Important Links

- ADR index: `docs/adrs/README.md`
- Audit reports: `docs/audit/`
- Cycle logs: `memory/cycle-NNN.md`
- Mandala spec: `docs/MANDALA-EVOLUTION-SPEC-v3.md`
