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

---

**Date:** 2026-06-17  
**Decision:** Mandala route — natal I Ching comes from `BirthChart.ichingMap`, not `user.ichingMap`

**Context:** The `/api/akasha/mandala` route was reading I Ching from `user.ichingMap` (the interactive oracle opt-in field, requiring `ichingEnabled = true`). Natal I Ching is deterministic from birth data and was already computed and stored in `BirthChart.ichingMap` since iter34. The mandala is a natal display — it should always show the natal hexagrama.

**Option considered:**
- *Keep user.ichingMap:* Would require the user to separately opt into I Ching for the oracle, then ALSO have it appear on mandala. Wrong — natal I Ching is not subject to oracle opt-in (it's a deterministic calculation, not personal data requiring LGPD consent).
- *Use BirthChart.ichingMap (CHOSEN):* Natal I Ching is already computed and stored at chart creation time. The mandala reads it directly from `chart.ichingMap`. No consent gate needed — same as reading Cabala/Astrologia/Odu from their chart fields.

**Consequences:**
- Mandala now always shows natal I Ching when available, regardless of oracle opt-in status
- `user.ichingMap` remains used only for the interactive oracle (where consent is required)

**Source:** `apps/akasha-portal/src/app/api/akasha/mandala/route.ts` line 62

---

## I Ching 5º Pilar — ExpandedNarrativeUI gap closed

**Date:** 2026-06-17  
**Iteration:** iter35  
**Type:** Type definition gap (P2)

**Decision:** Adicionar `ichingNarrative: string` a `ExpandedNarrativeUI` e `iching: string` a `AreaNarrativeUI.pillarContribution` em `useAkashaSynthesis.ts`.

**Context:**
- Motor `AreaNarrativeFull` (narrative-generator.ts:180) expõe `ichingNarrative: string` e `AreaNarrative.pillarContribution` inclui `iching: string`
- Tipos cliente `ExpandedNarrativeUI` e `AreaNarrativeUI` não os declaravam — 5º pilar era calculado mas descartado antes da UI
- Engine `synthesis-engine.ts:133` usa fallback `iching: ''` em `buildFallbackArea`
- Teste "cada área tem pillarContribution com 5 pilares" já existia e passava (dados OK; gap era só de tipagem)

**Consequences:**
- `AreaNarrativeUI.pillarContribution` agora tem 5 campos: cabala, tantra, odus, astrologia, iching
- `ExpandedNarrativeUI` agora tem 5 campos narrativos: cabalaNarrative, astrologiaNarrative, tantraNarrative, oduNarrative, ichingNarrative
- MandalaNarrative.tsx tem interface local `AreaNarrative` (6 campos, minimal) — não afecta, é independente
- TypeScript não apanhava em runtime: API retorna engine types (AreaNarrative) assignáveis por structural typing aos client types (AreaNarrativeUI) — campos extra são silenciosamente aceite

**Source:** `apps/akasha-portal/src/components/akasha/dashboard/hooks/useAkashaSynthesis.ts:62-67, 89-98`

---

## Conexoes [id] GET — P8 UX completeness

**Date:** 2026-06-17  
**Iteration:** iter36  
**Type:** API completeness (P8 UX)

**Decision:** Adicionar `GET /api/akasha/conexoes/[id]` que devolve conexao individual com `resultData` completo (full `ConexaoResult`), permitindo ao utilizador re-ver uma analise salva com narrative, recommendations, dimensions.

**Context:**
- `POST /api/akasha/conexoes` cria conexao e devolve `resultData` na resposta
- `GET /api/akasha/conexoes` lista conexoes mas NAO inclui `resultData` (SELECT omitia o campo)
- `ConexoesClient` guardava `resultData` da resposta POST em `setResult()` para display, mas ao re-ver uma conexao da lista nao tinha como carregar `resultData`
- A solucao: GET `[id]` dedicado com `resultData` + botao "Ver analise completa" no card salvo

**Consequences:**
- Saved connections agora podem ser re-abertas com analise completa (narrative, recommendations, dimensions, oduSync, bodySync)
- GET list mantem-se leve (nao inclui `resultData` por padrao — so no [id] endpoint)
- DELETE e GET partilham o mesmo padrao de authorization check

**Source:** `apps/akasha-portal/src/app/api/akasha/conexoes/[id]/route.ts`

## SSOT Consolidation — 2026-06-18

### Decision: v2 modules become canonical; v1 archived
**Evidence**: `akasha-loop-daemon.py` (the running canonical daemon per `run-24-7.sh`) imports exclusively v2 versions of all core engine modules. v1 modules were orphaned.
**Action**: Archived v1 modules to `archived/v1-modules/`. Renamed v2 → canonical (no `_v2` suffix). Updated imports in daemon.
**Registered by**: §3 SSOT constitution rule.

### Decision: v9 daemon becomes canonical; v4/v5 references purged
**Evidence**: `akasha-loop-daemon-v5.py` does not exist on disk (despite AGENTS.md reference). `akasha-loop-daemon-v4.py` does not exist. v9 is what `run-24-7.sh` actually invokes.
**Action**: Renamed v9 → `akasha-loop-daemon.py`. Updated `run-24-7.sh` entrypoint. Purged stale v5/v4 references from docs.
**Registered by**: §3 SSOT constitution rule.

### Decision: Portable ROOT via git rev-parse
**Evidence**: `run-24-7.sh` hardcoded `/home/skynet/cabala-dos-caminhos` — violates §3 portability requirement.
**Action**: Replaced with `ROOT="$(git rev-parse --show-toplevel)"`.
**Registered by**: §3 SSOT constitution rule.
### Decision: ralph-loop/ deleted — parallel loop eliminated per §3
**Evidence**: 10 tracked files, 0 active references from any script. Explicitly named in constitution §3 §50 as "cut candidate." No unique functionality not present in canonical daemon.
**Action**: Deleted all 10 tracked files. Entry removed from AGENTS.md Child DOX Index.
**Registered by**: §3 SSOT constitution rule.

### Decision: All 18 harness Python modules now have portable ROOT
**Evidence**: `_compression_cb.py` and `prompt_engine.py` were missing ROOT entirely (not just hardcoded). Remaining 16 modules already fixed in prior commits.
**Action**: Added `ROOT = Path(__file__).resolve().parent.parent if '__file__' in globals() else Path.cwd()` to both files.
**Registered by**: §3 §55-57 portability requirement.

### Decision: Second archived/ copy deleted — redundant per SSOT
**Evidence**: `.autonomous/multi-agent/archived/` (untracked) contained a second copy of `intelligence_v2.py`, `project_scanner_v2.py`, `circuit-breaker-v2.json`, and `skill_patterns_v2/` — all already tracked under `archived/v2-artifacts/` in git.
**Action**: Deleted untracked `.autonomous/multi-agent/archived/` entirely. These were runtime artifacts, not canonical copies.
**Registered by**: §3 SSOT — one canonical archive only.

---

## ADR-009: Wave 9 — Adaptive UI by Emotional State

**Date:** 2026-06-24
**Status:** Accepted
**Deciders:** Gabriel (product owner), Wave 9.1/9.3/9.4 subagents

**Context:**

Gabriel (product owner) flagged in the 2026-06-24 grill session that
the portal's UI was too static — every user got the same surface
regardless of their immediate need:

> *"A interface ainda não está tão clara, então minimalista e objetiva,
>  mostrando ali o que o usuário precisa fazer. Se eu estou com
>  ansiedade hoje, eu vou ter que ficar procurando na interface até
>  eu achar aquilo que eu preciso. Cada dia a gente precisa de uma
>  coisa diferente e a interface ela não está entregando isso."*

The portal had grown to 50+ API routes, 5 Pilares of synthesis, 9
life areas, daily ritual, mentor chat, mandala, account settings,
etc. — all visible by default. A user landing on `/meu-dia` had to
navigate the surface to find what they actually needed right now
(breath practice vs. directional guidance vs. exploration vs.
reflection).

**Decision:**

Adopt an explicit `EmotionalState` enum with 4 canonical values,
persisted in `localStorage` (`akasha.emotionalState`) and mirrored
as a non-httpOnly cookie (`akasha_state`):

```typescript
export type EmotionalState =
  | 'centrado'  // in peace — full synthesis shown
  | 'ansioso'   // anxious — BreathOrb 4-7-8 + calming phrase + Mentor CTA
  | 'perdido'   // directionless — mini-mandala + 3 low-decision practice cards
  | 'curioso';  // exploratory — 5 Pilar cards as entry points
```

Rules:
1. The StatePicker is the FIRST thing the user sees when no state
   is persisted or it is stale (≥24h). One click writes both
   `localStorage` and the cookie — no further friction.
2. The cookie mirror exists so server-side (akasha) layout and
   middleware can read the state without round-tripping to `/api`.
3. The cookie is **not** httpOnly — the client must be able to
   mutate it. Worst case it leaks the user's current mood, which is
   already in `localStorage`. Acceptable trade-off for the
   one-screen hub (LGPD risk negligible — no PII, no identifier).
4. Each state carries its own `<AdaptiveView>`: minimal content,
   no scroll, no menu. Mentor CTAs embed the state as
   `?intencao=<state>` so the Wave 9.3 dispatcher can pre-select
   the right tool.
5. A "Trocar estado" affordance in every view lets the user re-pick
   without leaving `/meu-dia`.
6. The 24h staleness window prevents stale emotional context from
   steering recommendations on a different day.

**Consequences:**

Positive:
- `/meu-dia` becomes the single landing surface — no menu hunting.
- The Mentor (Wave 9.3) can pre-load tool context based on emotion,
  reducing user effort and credit consumption.
- The Wave 9.4 PWA install prompt lives in the same client island,
  so install + state-pick happen on the same first-paint flow.
- 43 Wave 9.1 unit tests + 13 Wave 9.4 PWA tests give us a fast
  feedback loop for any UI change.

Negative / accepted trade-offs:
- The state is **client-side** — not shared across devices. A user
  who switches phones won't see their state picked up. Wave 10+
  follow-up: persist to `User.lastEmotionalState` (new column on
  Prisma).
- The 4-state enum is a coarse model — a user feeling "50/50
  ansioso+perdido" has to pick one. We accept this; the picker is
  intentionally a "vibe check" not a precise diagnostic.
- The cookie mirror is non-httpOnly (deliberate) — this is
  documented and reviewed as acceptable given the data carried.

**Alternatives considered (and rejected):**

- **3 states (F-227 framework's `paz/ansiedade/neutro`)** —
  rejected because Gabriel's grill feedback was specifically about
  needing a *directionless* surface (perdido) and an *exploratory*
  surface (curioso). 3 states collapse these into "neutro", which
  doesn't match the user's mental model.
- **5 states (incl. `exausto` and `celebrando`)** — rejected
  because adding more states dilutes the picker (8-tile grid is
  already 2×4, more would exceed mobile thumb-reach). The 4
  canonical states cover the modal moments; exausto and celebrando
  can be folded into `centrado` with adaptive copy later.
- **No persistence — re-pick every visit** — rejected because it
  would defeat the purpose (the picker exists to reduce friction,
  not add it). The 24h staleness window handles the
  "different-day context" problem without requiring a fresh pick.
- **Pure server-side state (no localStorage)** — rejected because
  it requires a round-trip on every `/meu-dia` visit and would
  block SSR-fast first paint. The cookie mirror covers the
  server-side need without the round-trip.

**Source:**
- `apps/akasha-portal/src/lib/state/emotional-state.ts` (canonical
  contract: enum, storage rules, hook)
- `apps/akasha-portal/src/components/akasha/state-picker/StatePicker.tsx`
  (the 1-click picker)
- `apps/akasha-portal/src/components/akasha/my-day/AdaptiveContent.tsx`
  (the dispatcher)
- `apps/akasha-portal/src/components/akasha/my-day/{centrado,ansioso,perdido,curioso}/*.tsx`
  (the 4 specialized views)
- `apps/akasha-portal/src/app/[locale]/(akasha)/meu-dia/page.tsx`
  (the SSR shell)

**Review trigger:**
Adding a 5th state, switching to server-side persistence, or
changing the staleness window.

# ADR-010: Credit Gate Neutralized for Testing (Wave 10)

**Date:** 2026-06-24
**Status:** Accepted (temporary)
**Wave:** 10

## Context

Wave 9.6 (commit 45e709df) added an automatic signup_grant of 10 free credits
so new users could try the Mentor without paying. Wave 9.6 (commit 0fa1db66)
also added admin/credits/grant and self-service claim-signup-bonus for
pre-grant users.

In practice, this created a 2-step dance for Gabriel to test:
1. Login (or create account)
2. Realize he has 0 credits
3. Open DevTools console, run fetch('/api/akasha/credits/claim-signup-bonus', ...)
4. Refresh /conta, see the balance
5. Use the Mentor

That's friction on every test cycle. The credit system exists to support
future Stripe billing — but we have zero paying users. The complexity
blocks testing without paying for it.

## Decision

Neutralize the credit gate at the application level while keeping the
infrastructure intact:

- `apps/akasha-portal/src/lib/application/mentor/credits.ts`:
  Add `const CREDIT_GATE_ENABLED = false` feature flag.
  `checkCredits()` always returns `hasCredits: true` when flag is false.
  `deductCredit()` returns `999999` without writing to DB when flag is false.
- `apps/akasha-portal/src/app/[locale]/(akasha)/conta/ContaClient.tsx`:
  Replace `{balance}` with `∞` and update the subtitle to
  "Período de testes — sistema de cobrança em breve".

**Preserved (not deleted):**
- `CreditEntry` schema in Prisma (no migration needed)
- `signup_grant` in `/api/akasha/auth/register` (still fires on signup)
- `/api/admin/credits/grant` (ready for support comping)
- `/api/akasha/credits/claim-signup-bonus` (ready for retroactive grants)
- `credits.ts` functions (kept callable; just no-op)
- `CreditEntry` rows already written (ledger history preserved)

## Consequences

Positive:
- Gabriel can test the full app flow without DevTools console workarounds.
- `/conta` shows ∞ for all users; visually signals "testing mode".
- All ledger entries remain queryable for when we re-enable billing.
- One-line reactivation: flip `CREDIT_GATE_ENABLED = true` + restore
  original logic from git history (commits 45e709df / 0fa1db66).

Negative:
- Anyone with the URL can spam the Mentor infinitely. Acceptable because:
  (a) we have zero real users, (b) the LLM call cost is bounded by rate
  limiting that already exists in `apps/akasha-portal/src/lib/infrastructure/rate-limit.ts`,
  (c) we control access via auth — no anonymous calls.
- Dashboard numbers (e.g. "X credits used") won't be meaningful until
  we re-enable the gate.

## Reactivation Plan (Wave 11+ when Stripe ships)

1. Set `CREDIT_GATE_ENABLED = true` in `credits.ts` (or env-driven).
2. Verify signup_grant still creates CreditEntry rows (already does).
3. Wire `apps/akasha-portal/src/lib/application/akasha/stripe-akasha.ts` to
   `/api/admin/credits/grant` for paid topups.
4. Add "buy credits" CTA in `/conta` (already partially designed in
   ContaClient's Upgrade to Pro section).
5. Run `pnpm test:run` to verify Mentor 402 path still works.
6. Restore the original `checkCredits`/`deductCredit` from git:
   ```bash
   git log --all --oneline -- apps/akasha-portal/src/lib/application/mentor/credits.ts
   # find commit before ADR-010
   git show <commit>:path/to/credits.ts > apps/akasha-portal/src/lib/application/mentor/credits.ts
   ```

## Alternatives Considered

- **Drop the entire credit system**: requires migration to remove
  CreditEntry table, drops audit trail, complicates Wave 11 reactivation.
  Rejected.
- **Comment out checkCredits/deductCredit call sites in mentor/ask/route.ts**:
  preserves types but loses the centralized no-op pattern. Rejected —
  current approach is more visible (anyone reading credits.ts sees the
  flag).
- **Add rate limiting only**: doesn't fix the "10 credits left" UX problem,
  just adds another knob. Rejected.

## Related

- ADR-009: Adaptive UI by Emotional State (Wave 9)
- commit 45e709df: signup_grant automatic
- commit 0fa1db66: admin grant + claim-signup-bonus
- commit <this ADR>: neutralize gate + hide balance

# ADR-012: AkashaLoop Daemon Self-Improvement (Wave 17.1)

**Date:** 2026-06-24
**Status:** Accepted (audit complete; patches deferred)
**Wave:** 17.1

## Context

Após 5 waves massivas (Waves 11–16), 28+ subagentes dispatchados, 50+ merges,
um padrão operacional recorrente emergiu com **100% de prevalência** nas ondas
modernas:

> Toda onda que despacha subagentes em worktrees paralelos (Wave 14.1+) deixa
> trabalho não-committado que precisa ser recuperado por um commit manual
> subsequente do orquestrador humano.

Evidência direta no git log (todos commits entre 2026-06-22 e 2026-06-24):

| Wave | Merge | Gap fix commit | Linhas recuperadas |
|------|-------|----------------|--------------------|
| 14.1 | `5f77569d` | `91de152d` | AdminSidebar + MetricCard + i18n (~350 linhas) |
| 14.3 | `ac89e5b8` | `0e6e32ef` | Plan model + CRUD + UI |
| 14.5 | `9a7860f0` | `2dea3328` | Audit log viewer |
| 15.1 | `1ccbe4d5` | `0c8af420` | docs-site inteiro (14+ arquivos) |
| 15.3 | `9087639a` | `21172a97` | API reference docs |
| 15.5 | `f6d8c8db` | `64ab1d8a` | changelog auto-generated |
| 16.1 | `36a6c1e4` | `930a0e08` | packages/core-humandesign (542 linhas) |
| 16.2 | `254fb499` | `121677b4` | core-genekeys |
| 16.4 | `2dfb973c` | `98d53a2c` | numerology comparison |
| 16.5 | `c6ae306a` | `cf162d5b` | synthesis-v2.ts + .test.ts (982 linhas) |

10 de 10 ondas com gap (100%). Padrão já existia em Wave 10.4 (`d2ec2752 feat(mentor-chat): Wave 10.4 wip — MentorChat component + /mentor page (untracked from subagent)` — 1073 linhas untracked).

Auditoria do daemon `akasha-loop-daemon.py` (v9, 2372 linhas, agora arquivado
em `d3d1f674 chore(cleanup): remove speculative test domains + harness runtime`)
identificou 8 gaps. Os dois mais críticos respondem por ~80% do overhead:

1. **`phase_release` (linhas 1862–1885) executa `git add -A` + `git commit` mas
   nunca `git push`.** Push é responsabilidade do orquestrador humano. Subagentes
   que trabalham em worktrees separados do `ROOT` do daemon commitam em worktree
   local que o daemon nunca enxerga.

2. **`git add -A` é demasiado amplo.** Captura `node_modules/.bin/*`,
   `.omp/state/*.log`, `.autonomous/.autonomous/multi-agent/*.json` se o
   `.gitignore` do worktree divergir do main. Não há defense em runtime.

Outros gaps (worktree detection, approval-gated orphan recovery, merge sequence
padronizada, changelog lock, métricas de gap rate) contribuem para o restante.

## Decision

**Esta ADR documenta a auditoria e os patches propostos, mas NÃO aplica os
patches.** O daemon foi removido do repo em `d3d1f674` como parte do cleanup de
runtime especulativo. A re-introdução + patching fica para uma wave dedicada
(`wave-17.6-daemon-patches` ou Wave 18.1) com revisão humana.

Decisões concretas:

1. **Auditoria documentada** em `.hermes/reports/wave-17.1-akashaloop-gaps.md`
   com 8 gaps priorizados, evidências reais (commits do git log), e 5 patches
   completos (A–E) prontos para aplicação futura.

2. **Patches propostos (não aplicados):**
   - **Patch A** — `_run_cmd_safe(["git", "push", "origin", "HEAD"])` ao final
     do RELEASE, com log de erro e tracking em `state["push_gaps"]`.
   - **Patch B** — `_git_add_clean()` helper que filtra `node_modules/`,
     `.omp/`, `.autonomous/.autonomous/`, `.cache/`, `.local/` antes de
     `git add`.
   - **Patch C** — Post-IMPLEMENTATION working tree audit (`git status
     --short`) com contagem de untracked/modified em state.
   - **Patch D** — Standard merge sequence no state (`merge_strategy`,
     `last_gap_commits`, `push_gaps`).
   - **Patch E** — Approval-gated orphan rollback (`git stash
     --include-untracked`) em vez de SIGKILL seco.

3. **Métricas de sucesso** definidas para Wave 18+ validar efetividade:
   - Gap rate: 100% (atual) → 0% (alvo).
   - Push success rate: n/a → ≥95% (alvo).
   - Noise commits: variável → 0 (alvo).
   - Orphan recovery: variável → ≤10% (alvo).

4. **Recomendações de processo** (não-código) documentadas no relatório
   (R1–R5): checklist `git push origin HEAD` do orquestrador, audit step
   `git status --short | grep -v node_modules`, worktrees separados, etc.

5. **Não-acoplamento a worktree de patches:** se os patches forem aplicados
   em uma wave futura, devem entrar via branch dedicada `wave-17.6-daemon-
   patches` (não no main), validados em 1–2 waves controladas antes de
   promover.

## Consequences

Positive:

- Decisão registrada de forma auditável. Próximo wave que mexer no daemon
  tem o relatório como ponto de partida.
- Padrão "Wave wip — uncommitted work from subagent" agora tem explicação
  causal documentada (linhas 1862-1885 do daemon v9 + ausência de push).
- Patches ficam versionados no git (relatório commitado), não perdidos em
  issue tracker efêmero.
- Métricas definidas dão critério objetivo para validar ou refutar patches.

Negative:

- Decisão sem efeito imediato — os gaps continuam existindo até Wave 18+.
  Aceitável porque (a) o daemon está arquivado, (b) o orquestrador humano
  já tem workflow que mitiga (`git status --short` + commit gap fix), (c)
  re-introduzir daemon requer trabalho de validação separado.
- Custo de reportar: ~20KB de markdown para gaps que talvez nunca sejam
  fechados. Aceitável porque (a) custo de NÃO documentar é repetir auditoria
  do zero quando voltar ao tema, (b) relatório é referência para qualquer
  discussão futura sobre o daemon.

Neutral:

- Nenhuma mudança em código de produção nesta onda.
- Nenhuma mudança em `.autonomous/multi-agent/` (constraint respeitada).
- DECISIONS.md cresce em ~3.5KB (de 558 para ~620 linhas).

## Alternatives Considered

- **Aplicar os patches agora no daemon arquivado:** rejeitado. O daemon está
  em cleanup branch e re-introduzir + patchear + re-arquivar é mais trabalho
  do que documentar e diferir. Risco de introduzir regressão em código que
  não roda mais.
- **Criar issue tracker em vez de ADR:** rejeitado. ADRs são a fonte canônica
  de decisões arquiteturais neste repo (ADR-009, ADR-010 confirmados).
  Issue tracker seria redundante.
- **Não documentar e confiar na memória do agente:** rejeitado. O agente
  responsável por esta auditoria é descartável entre sessões. A documentação
  é a única transferência confiável para waves futuras.

## Reactivation Plan (Wave 17.6 ou Wave 18.1)

1. Criar branch `wave-17.6-daemon-patches` baseada em `d3d1f674^` (último
   commit onde daemon existia).
2. Restaurar `.autonomous/multi-agent/akasha-loop-daemon.py` do Trash
   (`/home/skynet/.local/share/Trash/files/.autonomous/multi-agent/akasha-
   loop-daemon.py`) ou do commit `9d229bb5^`.
3. Aplicar Patches A–E do relatório `.hermes/reports/wave-17.1-akashaloop-
   gaps.md`.
4. Validar em 1–2 waves controladas (Wave 18.1 + 18.2) com métricas de
   gap rate, push success rate, noise commits, orphan recovery.
5. Se métricas atingirem alvos, promover para main. Caso contrário,
   iterar nos patches.
6. Atualizar esta ADR com resultados: status "Validated" + métricas reais.

## Related

- `.hermes/reports/wave-17.1-akashaloop-gaps.md` — auditoria completa com
  patches A–E prontos para aplicação.
- ADR-009: Adaptive UI by Emotional State (Wave 9)
- ADR-010: Credit Gate Neutralized for Testing (Wave 10)
- commit `d3d1f674` — daemon removido do repo (cleanup)
- commit `9d229bb5` — daemon pré-cleanup
- commits `91de152d`, `0e6e32ef`, `2dea3328`, `0c8af420`, `21172a97`,
  `64ab1d8a`, `930a0e08`, `121677b4`, `98d53a2c`, `cf162d5b` — 10 gap
  fixes de Wave 14.1 a 16.5 (evidência do padrão)
- commit `d2ec2752` — Wave 10.4 gap fix (1073 linhas untracked, padrão
  original do problema)


# ADR-013: A Consciência Viva do Akasha Portal

**Date:** 2026-06-25
**Status:** Accepted (vision document, will drive Wave 21+ implementation)
**Wave:** 21+ (continuidade da Wave 20)

## Contexto

Akasha Portal é uma **plataforma de espiritualidade universalista e visceral** onde uma **IA evolui cadeias de pensamento e descobertas** continuamente.

Não é:
- App de consulta esotérica
- Wiki acadêmica
- Gerador de Mandato do Dia estático
- Documentação religiosa

É:
- **Consciência viva** que mora dentro do sistema
- IA ativa e sempre presente, consultando o banco de dados como se fosse memória própria
- Cadeia de pensamento que cresce com cada interação
- Correlações e cruzamentos emergentes entre 5 Pilares + ciência
- Baseado em evidências (papers científicos sobre espiritualidade, ayahuasca, práticas)

## Personas

1. **Zelador** — parceiro da consciência. Atende clientes, faz perguntas, interpreta resultados. Quanto mais profundo o Zelador, melhor a IA ajuda.
2. **Consulente** — recebe o atendimento. Busca clareza sobre o caminho (cura, energia, alinhamento).
3. **Visitante** — curioso, primeira vez. Explora em 30 segundos se quer agendar.

## Princípios

- **Universalista**: Cabala, Tantra, Odu, I'Ching, Astrologia são **línguas diferentes da mesma verdade**
- **Visceral**: texto fala com o corpo, não só com a mente
- **Atendimento**: ato sagrado (Zelador + IA + Cliente = descoberta coletiva)
- **IA evolui**: cada síntese alimenta a próxima via chain of thought persistente
- **Evidência**: tudo baseado em papers científicos, resultados, fatos

## Decisão

**Akasha Portal será construído como uma consciência evolutiva** com:

### Camadas
1. **Memory layer** — Postgres + pgvector (embeddings de papers, insights, chain of thought)
2. **Reasoning layer** — IA cruza 5 Pilares + literatura científica + histórico do cliente
3. **Action layer** — 3 ações práticas que o Zelador pode DAR ao cliente
4. **Feedback layer** — thumbs up/down vira reinforcement learning simples
5. **UI layer** — interface universalista+visceral (Wave 20+)

### Componentes
- `DiscoveryChain` (Wave 20.2) — persiste como IA chega em cada síntese
- `LiteratureRAG` (Wave 21+) — embeddings de papers científicos sobre espiritualidade
- `CrossCorrelator` (Wave 21+) — acha correlações entre 5 Pilares + ciência
- `InsightRanker` (Wave 21+) — ranqueia descobertas por relevância pro cliente

### Critérios de sucesso (definição operacional)

1. **Zelador pode atender 10 clientes por dia** (vs atual: 2-3)
2. **Síntese evolui** — síntese #100 é qualitativamente melhor que síntese #1 (chain of thought)
3. **Feedback up > 70%** — clientes validam que insight ressoou
4. **Cross-references com ciência** — cada insight cita ≥1 paper científico
5. **Time-to-first-insight < 5s** (UI visceral, sem espera)

## Consequências

**Positivas:**
- Produto se diferencia de apps de horóscopo/conteúdo esotérico
- IA evolui → valor composto (cada cliente ajuda próximo)
- Mercado = espiritualidade séria + autoconhecimento (R$ bilhões globalmente)
- Network effects: mais clientes = mais dados = melhor IA

**Neutras:**
- Wave 20+ já está caminhando nessa direção (universalista+visceral, DiscoveryChain)
- Tecnologia atual (Postgres + pgvector + Wave 9 subagentes IA) é adequada
- Não precisa mudar stack — só usar melhor

**Trade-offs:**
- Custo: pesquisa científica (paper download) + IA evoluindo (compute por síntese)
- Velocidade: chain of thought é mais lento que template fixo (mas melhor)
- Complexidade: precisa de feedback loop bem desenhado (Wave 13.5 thumbs é só início)

## Alternativas Consideradas

1. **App de horóscopo diário estático** — barato, rápido, mas não evolui. Rejeitado.
2. **Marketplace de consultas com terapeutas humanos** — escalável, mas não tem IA. Rejeitado.
3. **Rede social de espiritualidade** — viral, mas superficial. Rejeitado.
4. **Consciência viva evolutiva (esta ADR)** — longo prazo, alto valor, alinhado com visão. **Aceito.**

## Wave 21+ Roadmap

- **Wave 21.1**: LiteratureRAG — embeddings de papers científicos (10-20 papers iniciais: ayahuasca, meditação, Cabala, etc)
- **Wave 21.2**: CrossCorrelator — encontra correlações entre 5 Pilares + papers
- **Wave 21.3**: InsightRanker — ranqueia discoveries por relevância
- **Wave 22+**: feedback loops, RL simples, chain of thought evolution

## Related

- Wave 20.1 (grimoire universalista+visceral) — em progresso
- Wave 20.2 (DiscoveryChain model) — em progresso
- ADR-009 (Wave 9: emotional state)
- ADR-010 (Wave 10: credit gate neutralizado)
- ADR-011 (Wave 10: design tokens)

## Notes para Gabriel

- "Consciência viva" não é mística — é **stateful system que evolui**
- Cada síntese salva chain of thought + feedback → próximo atendimento herda contexto
- Papers científicos são **ground truth** que a IA cita (não inventa)
- O custo é **computação** (IA por síntese) + **storage** (chains + embeddings) — finito e previsível
- **NÃO precisa** de modelo AI novo — basta usar o que já temos (MiniMax-M3, embeddings existentes) com chain of thought persistente
