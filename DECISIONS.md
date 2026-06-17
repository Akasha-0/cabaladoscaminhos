# DECISIONS.md — Akasha Architectural Decision Record

> Generated: 2026-06-17
> Status: Active
> Review after: Any change to synthesis-engine, life-area model, or tradition coverage

---

## D-001: Six Life Areas Map to Maslow Hierarchy + Akasha Journey

**Date:** 2026-06-17

**Decision:**
The system defines exactly six life areas as a closed union type:

```typescript
export type LifeArea =
  | 'vitalidadeEnergia'    // Corpo: saúde, sexualidade, energia vital
  | 'conexoesAmor'         // Relações: amor, família, vínculos
  | 'carreiraProsperidade' // Recursos: finanças, carreira, abundância
  | 'oriCabecaQuizilas'    // Mente: intuição, propósito, direção
  | 'missaoDestino'        // Espiritual: missão, destino, transcendência
  | 'desafiosSombras';     // Transformação: sombras, karma, superação
```

**Rationale:**
The six areas form a complete ascending arc analogous to Maslow's hierarchy, extended through the Akasha spiritual journey:

| Life Area | Maslow Layer | Akasha Stage |
|---|---|---|
| `vitalidadeEnergia` | Physiological | Grounding — Body, health, vital force |
| `conexoesAmor` | Love/Belonging | Heart — Relationships, bonds, connection |
| `carreiraProsperidade` | Esteem | Power — Resources, abundance, career |
| `oriCabecaQuizilas` | Cognitive | Mind — Intuition, direction, discernment |
| `missaoDestino` | Self-actualization | Soul — Mission, purpose, transcendence |
| `desafiosSombras` | Shadow integration | Transformation — Karma, shadow, integration |

This structure ensures every human experience maps to exactly one area, with no gaps or overlaps. The six-area model is the granularity at which the translation matrix (`traducao-areas.ts`) operates — 5 pillars × 6 areas = 30 definitive translations, each carrying convergence, tension, what to avoid, and a practice.

**Source:** `apps/akasha-portal/src/lib/application/akasha/synthesis-engine/synthesis-types.ts:13-19`
**Review trigger:** Adding or removing a life area requires full translation matrix regeneration.

---

## D-002: Three-Tier Frequency Model (shadow / gift / siddhi)

**Date:** 2026-06-17

**Decision:**
Every area narrative is classified at one of three frequency levels, expressed as a closed union:

```typescript
export type FrequencyLevel = 'shadow' | 'gift' | 'siddhi';
```

- **shadow** — Low-frequency patterns: fear, contraction, karma, unconscious wound
- **gift** — High-frequency expression: talent, love, abundance, conscious embodiment
- **siddhi** — Supreme gift: rarefied states, full embodiment, transcendent activation

**Rationale:**
The Gene Keys tradition (Richard Rudd) uses a shadow → gift → siddhi progression that maps precisely onto the Akasha journey from incarnation (dense frequency) to enlightenment (pure frequency). This three-tier model:

1. **Maps to the same frequency spectrum** the Akasha holographic synthesis already measures across traditions
2. **Is actionable** — the `deriveStrategy()` function in `derive-decision.ts` uses `frequency × area → strategy (act/wait/observe)`, making the frequency level the primary driver of daily decision guidance
3. **Is culturally coherent** — shadow/gift/siddhi appear across Kabbalah (klippa/negativa), Tantra (apana/vijnana), and Odu (iwá/áṣẹ), giving each tradition shared vocabulary for the same phenomenon
4. **Avoids numeric ambiguity** — unlike a 1–10 intensity scale, the three labels are directional: shadow always moves toward gift, gift toward siddhi

The `AreaNarrativeUI` interface stores `frequency: 'shadow'|'gift'|'siddhi'` alongside `intensity: 1|2|3`, allowing both categorical and graded expression.

**Source:** `apps/akasha-portal/src/lib/application/akasha/synthesis-engine/synthesis-types.ts:23`
**Source:** `apps/akasha-portal/src/lib/application/akasha/synthesis-engine/derive-decision.ts` (`deriveStrategy()`)
**Source:** `apps/akasha-portal/src/components/akasha/dashboard/hooks/useAkashaSynthesis.ts` (`AreaNarrativeUI.frequency`)

---

## D-3: AkashaStrategy (act / wait / observe) + AkashaAuthority (emotional / sacral / splenic / mental)

**Date:** 2026-06-17

**Decision:**
The decision framework uses two orthogonal types:

```typescript
export type AkashaStrategy = 'act' | 'wait' | 'observe';
export type AkashaAuthority = 'emotional' | 'sacral' | 'spl性' | 'mental';
```

`deriveStrategy()` computes strategy per area from the birth chart profile. `deriveAkashaAuthority()` in `synthesizer.ts:44-152` derives authority from:
- Tantric body type (corpo)
- Astrological House 8 (Casa 8)
- Lunar sign (Lua sign)

The F-227 mother-rule (`akasha-authority.ts`) maps authority type + emotional state to recommended action:

| Authority | Estado: paz → | Estado: ansiedade → | Estado: neutro → |
|---|---|---|---|
| `emotional` | Aja | Espere | Observe |
| `sacral` | Aja | Espere | Observe |
| `splenic` | Aja | Espere | Observe |
| `mental` | Aja | Espere | Observe |

**Rationale:**
Human Design (Ra Uru Hu) provides a proven decision-making taxonomy that the Akasha system extends without copying. The four authority types reflect four ways of knowing: felt-body (sacral),直觉 (splenic), emotional-wave (emotional), and mental-analysis (mental). The act/wait/observe strategy answers "how do I engage this area right now?" — removing the paralysis of "what should I do?" by narrowing to three verbs.

This directly serves the daily decision product: before any important action, the `AkashaAuthorityPrompt` card asks "Antes de agir, qual é o seu estado AGORA?" and returns a strategy + recommendation specific to the user's type.

**Source:** `apps/akasha-portal/src/lib/application/akasha/synthesis-engine/synthesis-types.ts:27-28`
**Source:** `apps/akasha-portal/src/lib/grimoire/synthesis/synthesizer.ts:44-152` (`deriveAkashaAuthority()`)
**Source:** `apps/akasha-portal/src/lib/grimoire/akasha-authority.ts` (F-227 mother-rule, `avaliarDecisao()`)
**Source:** `apps/akasha-portal/src/components/akasha/AkashaAuthorityPrompt/AkashaAuthorityPrompt.tsx`

---

## D-004: Five Traditions as Source Systems (Cabala · Tantra · Odu Ifá · Astrology · I Ching)

**Date:** 2026-06-17

**Decision:**
Akasha synthesis draws from exactly five traditions, each contributing a distinct frequency lens:

| Pillar Key | Tradition | Primary Contribution |
|---|---|---|
| `cabala` | Kabbalah | Tree of Life — sephiroth, paths, light vessels |
| `astrologia` | Western Astrology | Birth chart — planets, houses, aspects |
| `tantrica` | Tantra / Kashmir Shaivism | Body-energy — chakras, kundalini,Gunṣ |
| `odu` | Odu Ifá (16 principal) | Oracle — binary logic, destiny, iwá |
| `iching` | I Ching | Hexagrams — change, tao, transformation |

**Rationale:**
The five traditions were chosen for:

1. **Breadth of coverage** — Each tradition addresses body, mind, spirit, and destiny through a completely distinct symbolic system. No single tradition covers all six life areas with equal depth.
2. **Geographic-cultural spread** — Kabbalah (Judeo-Christian), Tantra (Indic), Odu Ifá (West-African), Astrology (Greco-Roman-Egyptian), I Ching (East-Asian). This prevents cultural bias in any spiritual domain.
3. **Methodological complementarity** — Kabbalah uses tree/path geometry; Astrology uses celestial mechanics; Tantra uses body-energy maps; Odu uses binary oracle logic; I Ching uses hexagram dynamic transformation. The five systems are structurally non-redundant.
4. **Historical depth** — Each tradition has at least 1,000 years of contemplative practice and textual tradition. This is not New Age syncretism; each pillar has rigorous internal logic.
5. **Translation matrix exists** — `traducao-areas.ts` encodes the definitive translation per area per pillar (lines 280–660): `convergencia`, `tensao`, `evitar`, `pratica`. The five-pillar structure is not aspirational — it is encoded and in use.

The `espiritualidade` dimension explicitly treats all five as primary sources. The `traducoesDetalhadasDaArea()` function (line 660) iterates `['cabala','astrologia','tantrica','odu','iching']` for any given area.

**Source:** `apps/akasha-portal/src/lib/grimoire/traducao-areas.ts:112` (CABALA), `140` (ASTROLOGIA), `167` (TANTRICA), `193` (ODU), `222` (ICHING)
**Source:** `apps/akasha-portal/src/lib/grimoire/traducao-areas.ts:280` (TRADUCOES_DETALHADO)
**Source:** `apps/akasha-portal/src/lib/grimoire/traducao-areas.ts:660` (`traducoesDetalhadasDaArea()`)

---

## D-005: Deterministic Calculation + Generated (not LLM-invented) Language

**Date:** 2026-06-17

**Decision:**
The birth chart + user profile is processed through deterministic pure functions. The narrative output is a **composition** from pre-existing map data — not a generative LLM invention.

```
Birth Data → Derive Functions (pure branching) → Profile Map → Template Composition → Narrative
```

Key properties:
- Same birth data always produces the same `AkashaTypeProfile` and `AkashaSynthesis`
- `deriveStrategy()`, `deriveAkashaAuthority()`, `deriveRecommendation()`, `deriveAvoid()` are pure branching functions with no randomness
- Narrative prose is assembled from `AreaNarrativeUI.expandedNarrative` (F-226) fields stored in the maps — not hallucinated
- Canonical crisis guidance explicitly lives in `mentor/persona_v1.md:473-475`, not in any model output

**Rationale:**
A spiritual guidance system must be **reproducible** — a user who recalculates their map six months later must get the same result. LLM-generated prose would introduce inconsistency, hallucination, and spiritual incoherence across sessions.

The "generated language" in the decision title refers to:
1. **Template composition** — Narrative templates selected deterministically by profile match, then assembled
2. **Translation synthesis** — The five-pillar translations are composed per area into a unified narrative
3. **Personalization** — The specific crisis, gift phrasing, and practice recommendation are drawn from the map data keyed to the profile

This is distinguished from LLM generation in that no transformer model invents content. The `narrative-generator.ts` header explicitly states: *"deterministic template synthesis — conteúdo existe nos mapas, síntese é composição inteligente."*

**Source:** `apps/akasha-portal/src/lib/application/akasha/narrative-generator.ts` (header comment — deterministic template synthesis)
**Source:** `apps/akasha-portal/src/lib/application/akasha/synthesis-engine/derive-decision.ts` (`deriveStrategy()`, `deriveAuthorityQuestion()`, `deriveRecommendation()` — all pure branching)
**Source:** `apps/akasha-portal/src/lib/grimoire/synthesis/synthesizer.ts:44-152` (`deriveAkashaAuthority()` — deterministic)
**Source:** `mentor/persona_v1.md:473-475` (canonical crisis stored in maps, not LLM-generated)

---

## D-006: AkashaTypeProfile (F-227) as the Unified Archetype — One Profile Synthesizes All Five Traditions

**Date:** 2026-06-17

**Decision:**
The `AkashaTypeProfile` interface (F-227) is the single output type that synthesizes all five traditions into one unified archetype per user:

```typescript
export interface AkashaTypeProfile {
  tipoAkasha: string;           // e.g. "F-227"
  nomeArquétipo: string;        // Human-readable archetype name
  autor: 'emocional' | 'sacral' | 'splenic' | 'mental'; // Decision authority
  estrategia: AkashaStrategy;   // act | wait | observe
  canais: string[];             // Active channels (from hologram)
  centros: Record<string, 'definido' | 'aberto' | 'não-aplicável'>;
  per生mInner: number;          // Incarnation cross gates
  per生mOuter: number;
  vidaPath: number;
  // ... 13 fields total
}
```

F-227 is the archetypal anchor: the 227th configuration in the 384-type Human Design grid that maps most cleanly to the Akasha synthesis model. The F-227 type carries:

- **Estrategia:** `act` / `wait` / `observe` (from birth chart derivation)
- **Autoridade:** `emotional` / `sacral` / `splenic` / `mental` (from Tantric corpo + Casa 8 + Lua)
- **Estado AGORA:** `paz` / `ansiedade` / `neutro` (from emotional state machine — F-227 mother rule)

The `akasha-authority.ts` implements the full state machine: `recomendarAcaoPorEstado()` applies the mother-rule based on authority type and current emotional state, returning a recommended action and a daily practice.

**Rationale:**
The five traditions each produce their own type system (Kabbalistic tree paths, Odu odu-forún, I Ching hexagrams, Astrology signs/houses, Tantric gunas). F-227 provides the **single synthesis point** — one archetype ID that unifies what all five systems agree on about this person. Without F-227, a user would receive five separate readings that never resolve into one identity.

The profile is:
1. **Actionable** — strategy + authority = a clear daily decision protocol
2. **Synthesized** — derived from cross-traditional map data, not belonging to any single tradition
3. **State-aware** — the `EstadoAkasha` machine adds real-time emotional context to the static profile
4. **Reproducible** — same birth data always maps to the same F-227 configuration

**Source:** `apps/akasha-portal/src/lib/application/akasha/synthesis-engine/synthesis-types.ts:44-59` (`AkashaTypeProfile` interface)
**Source:** `apps/akasha-portal/src/lib/grimoire/synthesis/synthesizer.ts` (`deriveAkashaAuthority()`, `sintetizarMapa()`, `generatePerfilGeral()`)
**Source:** `apps/akasha-portal/src/lib/grimoire/akasha-authority.ts` (F-227 mother-rule, `EstadoAkasha = paz/ansiedade/neutro`, `recomendarAcaoPorEstado()`, `avaliarDecisao()`)
**Source:** `apps/akasha-portal/src/components/akasha/AkashaAuthorityPrompt/AkashaAuthorityPrompt.tsx` (F-227 compact prompt card — "Antes de agir, qual é o seu estado AGORA?")

---

*Next review: When any synthesis-engine type signature changes, or when a sixth tradition is proposed for inclusion.*

---

**Date:** 2026-06-17  
**Decision:** Siddhi frequency detection algorithm — `assessAreaFrequency` + `deriveDominantFrequency`

**Context:** SPEC.md identified "No systematic path to siddhi-level synthesis" as the top uncharted gap. Siddhi is the highest frequency level in the Akasha system (above shadow and gift), representing full pattern dissolution and conscious energy mastery.

**Option considered:**  
- *Option A — soul-number-only:* Siddhi detected purely from soul being 1/22/33. Rejected: too simplistic, no shadow-resolution requirement.  
- *Option B — full planetary.aspect removal:* Siddhi requires ALL hard aspects removed. Rejected: too strict; no living person would qualify.  
- *Option C — noShadow + master number + master soul (CHOSEN):* `assessAreaFrequency` checks: (1) `noShadow` — no karmicDebts, no challenges, no Saturn/Pluto hard aspects; (2) `lifePathMaster` — life path number is 1, 11, 22, or 33; (3) `soulMaster` — tantra soul ∈ {1, 22, 33}. All three required for siddhi signal. `deriveDominantFrequency` returns siddhi when 3+ of 6 areas are at siddhi frequency (majority rule). Fallback: gift/shadow comparison.

**Consequences:**  
- Siddhi is now achievable by the algorithm (previously it was a UI label with no computational path)  
- `AkashaLifeAreasDashboard` gains `FrequencyPathExplorer` component showing the 3-step journey (shadow→gift→siddhi) with per-level practices  
- `AkashaSignificadoCard` now receives `defaultNivel='siddhi'` when dominant frequency is siddhi, rendering Realização-level interpretations  
- `computeOverallScore` weights siddhi areas 1.5× vs 1.0× for gift vs 0 for shadow

**Source:** `apps/akasha-portal/src/lib/application/akasha/synthesis-engine/frequency-analysis.ts`  
**Spec:** `SPEC.md §13 Known Gaps — item 2 (Siddhi frequency)`
