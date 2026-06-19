# ADR-026: Deep Spiritual Correlation Engine

**Date:** 2026-06-18  
**Cycle:** 530  
**Status:** Implemented  

## Context

The Akasha synthesis system draws from five spiritual traditions (Cabala, Tantra, Odu Ifá, Astrology, I Ching). Each tradition has its own symbolic system for mapping spiritual energy. A gap was identified: there was no systematic way to detect and report cross-system correlations — e.g., "Your Cabala Path 27 (Mars) correlates with your Odu Ogbe with 78% harmony."

## Decision

Introduce a `DeepCorrelationEngine` class in `packages/akasha-core/src/deep-correlation-engine/` that:

1. **Accepts** `UserSpiritualData` — a unified input containing birth chart data from all five traditions
2. **Detects patterns** via `PatternDetector` functions across the five systems
3. **Computes correlations** using `correlation-maps.ts` which maps cross-system symbols (e.g., `ODU_SEPHIROT_MAP`, `TAROT_ORIXA_MAP`, `CHAKRA_ELEMENT_MAP`)
4. **Outputs** `EnergyHarmonyReport` with harmony scores, detected patterns, and per-tradition correlations

## Architecture

```
UserSpiritualData
  ├── BirthChart (astrology)
  ├── CabalaProfile
  ├── TantraProfile
  ├── OduMap
  └── IChingHexagrams

         ↓
DeepCorrelationEngine
  ├── PatternDetector[] — detect cross-system patterns
  ├── CrossSystemCorrelator — compute inter-tradition harmony
  └── HarmonyScorer — aggregate into EnergyHarmonyReport

         ↓
EnergyHarmonyReport
  ├── overallHarmonyScore (0-100)
  ├── dominantFrequency (shadow/gift/siddhi)
  ├── detectedPatterns: CrossSystemPattern[]
  ├── correlations: SpiritualCorrelation[]
  └── recommendations: string[]
```

## Key Correlation Maps

| Map | Purpose |
|---|---|
| `ODU_SEPHIROT_MAP` | Odu → Kabbalah Sephirot correlation |
| `ODU_ORIXA_MAP` | Odu → Orixá alignment |
| `TAROT_ORIXA_MAP` | Tarot → Orixá connection |
| `TAROT_CHAKRA_MAP` | Tarot cards → Chakra energy centers |
| `CHAKRA_ELEMENT_MAP` | Chakra → Classical element |
| `PLANET_ORIXA_MAP` | Planet → Orixá ruler |
| `DAY_ENERGY_MAP` | Day of week → spiritual energy |
| `SEPHIROT_PLANET_MAP` | Sephira → ruling planet |
| `SEPHIROT_SIGN_MAP` | Sephira → Zodiac sign |
| `SEPHIROT_ORIXA_MAP` | Sephira → Orixá |
| `LIFE_PATH_ZODIAC_MAP` | Life path number → Zodiac sign |

## Detected Pattern Types

The engine detects 22 cross-system patterns including:
- `solar_arc_intuition` — Solar arc direction aligned with intuitive channels
- `jupiter_ogbea_expansion` — Jupiter energy × Ogbey great expansion
- `mars_soul_32_fire` — Mars × Soul path 32 (fire/warrior)
- `shadow_mars_ogbe` — Karmic tension between Mars and Ogbe
- `full_siddhi_alignment` — All six areas at siddhi frequency

## Consequences

- **Positive:** New holistic cross-traditional analysis capability; users get inter-tradition harmony scores
- **Positive:** Replaces manual correlation work with systematic algorithm
- **Needs:** Integration route (`/api/akasha/correlation`) to expose the engine; `packages/mentor/src/correlation.ts` needs path alias fix (currently uses `@/` instead of `@akasha/core`)
- **Risk:** Pattern detector weights need calibration against real user data

## Source

`packages/akasha-core/src/deep-correlation-engine/` (6 files)  
Commit: `546e8731` — "feat: Implemented deep spiritual correlation engine"
