# W82-B · AKASHA PROMPT CONTEXT BUILDER — DELIVERABLE

**Cycle:** 82 · 2026-06-30
**Worker:** W82-B (Mavis orchestrator session `414743267553428`)
**Branch:** `w82/akasha-prompt-context-builder`
**Worktree:** `/tmp/w82-b`
**Final commit:** _pushed at end of cycle_

---

## Status: ✅ PUSHED

```
TSC errors : 0
Spec PASS  : 39 / 39
Smoke PASS : 30 / 30
TOTAL PASS : 69 / 69
LOC        : 2 387 across 9 files
```

---

## 1 · Theme

**Akasha IA Prompt Context Builder** — engine that builds STRUCTURED PROMPT
CONTEXT for the post-game chat (`src/lib/ai/prompts/akasha.ts` + W79-C
streaming UI), so the AI can answer consulente questions with **surgical
specificity** instead of generic politeness.

Generic prompts produce generic answers. The engine ingests:

- `LeituraSintetizada` from W82-A (36 `CruzamentoCasa` records, one per
  Mesa Real house)
- `PerguntaConsulente` (the chat question, optionally with tema + explicit
  `casasCitadas`)
- `HistoricoChat` (prior turns, bounded rolling window)

… and emits a `PromptContext` ready to be the system prompt of the AI
call. Surgical rules + sacred-term detection + 3-7 most relevant houses
are baked in.

---

## 2 · Files shipped (in `/tmp/w82-b`)

| Path | LOC | Role |
|------|-----|------|
| `src/lib/engines/akasha-prompt/types.ts` | 266 | Branded types, DTOs, constants |
| `src/lib/engines/akasha-prompt/constants.ts` | 241 | 7-tradição catalog, system role, sacred dictionary |
| `src/lib/engines/akasha-prompt/relevance.ts` | 314 | `casasRelevantes()` + scoring |
| `src/lib/engines/akasha-prompt/context-builder.ts` | 462 | `buildContext()` main engine |
| `src/lib/engines/akasha-prompt/index.ts` | 99 | Public surface |
| `src/lib/engines/akasha-prompt.spec.ts` | 634 | Self-running spec, 39 assertions |
| `src/lib/engines/akasha-prompt.smoke.ts` | 316 | Runtime smoke, 30 assertions |
| `scripts/smoke/akasha-prompt.ts` | 33 | Runtime entry (re-imports engine smoke) |
| `tsconfig.w82-b.json` | 22 | Isolated strict TypeScript config |
| **TOTAL** | **2 387** | |

All frozen at the top level + nested (`Object.freeze` on every public
return).

---

## 3 · Public API

```ts
import {
  buildContext,
  casasRelevantes,
  relevanceFingerprint,
  DEFAULT_SYSTEM_ROLE,
  type LeituraSintetizada,
  type PerguntaConsulente,
  type HistoricoChat,
  type PromptContext,
} from '@/lib/engines/akasha-prompt';
```

### `buildContext(leitura, pergunta, historico, config?) → PromptContext`

The main entry point. Returns a frozen object with:

| Field | Description |
|-------|-------------|
| `systemRole` | Fixed Akasha persona (8 regras cirúrgicas + 7 regras fixas) |
| `leituraResumo` | 3-5 line summary (3 first + 3 last houses + total count) |
| `casasRelevantes` | 3-7 most relevant `CruzamentoCasa` for the pergunta |
| `perguntaAtual` | Cleaned question (always ends with `?`) |
| `contextoConversa` | Last `maxTurnos` turns, formatted `user: ... \| assistant: ...` |
| `termosSagrados` | Auto-detected sacred terms, NFD-deduped, capped at 12 |
| `instrucoes` | 7 fixed surgical rules + `forma`-specific rules + caller extras |
| `promptFinal` | Fully assembled prompt, ready to ship |
| `tokensEstimados` | `Math.ceil(promptFinal.length / 4)` — rough estimate |
| `meta` | `{ brand: 'W82-B', cycle: 82, version: '1.0.0', cacheKey, generatedAt }` |

### `casasRelevantes(leitura, pergunta) → ReadonlyArray<CruzamentoCasa>`

Selects 3-7 houses. Three strategies, priority order:

1. **Explicit `casasCitadas`** — dedupe + clamp + validate range
2. **Tema tag** — substring match against `casa.tema`
3. **Keyword overlap scoring** — tokenize pergunta, score each casa
   against `sintese + rotulos + cartaNome + tema`, pick top 5

After strategy selection, ALWAYS prepend Casa 1 (O Consulente) and Casa 36
(O Retorno) as anchors. Final list capped at `MAX_CASAS_RELEVANTES = 7`,
sorted ascending by `numero` for deterministic prompts.

---

## 4 · Engine walk-through (matches brief algorithm)

1. ✅ System role: fixed string from `DEFAULT_SYSTEM_ROLE`
2. ✅ leituraResumo: first 3 + last 3 houses + total count, format
   `Casa N (tema) regida por {cartaCiganaNome}`
3. ✅ casasRelevantes: priority strategy chain + anchor injection
4. ✅ perguntaAtual: trim + collapse whitespace + strip trailing punctuation
   + add `?` if missing
5. ✅ contextoConversa: `user: ... | assistant: ...` lines, last
   `2 × maxTurnos` messages
6. ✅ termosSagrados: NFD-normalized substring scan against
   `SACRED_TERMS_BY_TRADICAO` (cigano, orixás, astrologia, cabala,
   numerologia, tantra, tarot), deduped, capped at 12
7. ✅ instrucoes: 7 fixed surgical rules + `forma`-specific rules
   (conselho / previsao / explicacao / ritual / alerta) + caller extras
8. ✅ promptFinal: 7 sections assembled with markdown headers, joined
   by `\n\n`
9. ✅ tokensEstimados: `Math.ceil(promptFinal.length / 4)`
10. ✅ returns frozen `PromptContext`

---

## 5 · Behavioral guarantees (validated by spec)

- Determinism: same `(leitura, pergunta, historico)` → same
  `promptFinal`, same `cacheKey` (except `meta.generatedAt`)
- Surgical specificity: prompt always carries the Akasha system role +
  7 fixed rules + 3-7 specific houses named by number + carta
- Sacred terms: detected via NFD-normalized substring match (NOT regex)
  — cycle 81 lesson: PT-BR accents break naïve `\b...\` matching
- Deep freeze: top-level + every nested array + every nested object
  inside `casasRelevantes`, `termosSagrados`, `instrucoes`, `meta`
- Defensive validation: throws on empty leitura or empty pergunta
- Bridge durability: 7-tradição coverage baked into sacred dictionary +
  tradicao labels

---

## 6 · Self-running spec — 39 assertions

| Area | Count | Examples |
|------|-------|---------|
| Relevance — strategies | 9 | explicit casasCitadas, tema, keyword, anchor injection |
| Relevance — determinism | 2 | fingerprint shape + stability |
| Sacred term detection | 3 | NFD normalization, detection, dedupe |
| Context builder | 17 | system role, promptFinal sections, edge cases |
| Edge cases | 5 | empty historico, maxTurnos, 8+ casasCitadas cap |
| Diagnostic helpers | 3 | scoreCasaForTokens, tokenizeForRelevance |
| version constants | 1 | exports + values |
| Validation | 2 | throws on empty leitura / pergunta |
| Spec floor | 1 | `SPEC_REGISTRY.length >= 30` |

**Result:** `39 PASS · 0 FAIL · 39 total`.

---

## 7 · Smoke harness — 30 assertions

Layered in `akasha-prompt.smoke.ts` (and reachable via
`scripts/smoke/akasha-prompt.ts`) — covers: relevance ranking,
fingerprint shape, NFD normalization on PT-BR accents, promptFinal
section presence, tokens estimate accuracy, forma-tag rules, edge
cases (empty historico, maxTurnos boundary, 8+ casasCitadas cap),
cacheKey stability, validation throws.

**Result:** `30 PASS · 0 FAIL · 30 total`.

---

## 8 · 7-Tradição coverage

| Tradição | Sacred terms exposed | Tradução PT-BR |
|----------|----------------------|----------------|
| Cigano | Cavaleiro, Cigana, Cigano, Trevo, Nave, Casa, Nuvem, Cobra, Caixão, Buquê, Foice, Chicote, Pássaros, Criança, Cachorro, Raposa, Urso, Estrela, Cegonha, Lua, Chave, Peixes, Carta, Ramo, Sapo, Coração, Anel, Livro, Homem, Mulher, Lírios, Sol, Torre, Cruz, Barco (36 cartas) | ✓ |
| Orixás | Ogum, Oxóssi, Oxum, Iansã, Xangô, Iemanjá, Nanã, Exu, Pomba Gira, Obaluaiê, Logun Edé, Oxalá, Ewá, Ibeji | ✓ |
| Astrologia | Sol, Lua, Mercúrio, Vênus, Marte, Júpiter, Saturno, Urano, Netuno, Plutão, Lilith, Quíron, Nodo Lunar, Ascendente, Meio do Céu + 12 signos + 12 casas | ✓ |
| Cabala | Kether, Chokhmah, Binah, Chesed, Geburah, Tiphareth, Netzach, Hod, Yesod, Malkuth, Sephirot, Daat | ✓ |
| Numerologia | Life Path, Expression, Soul Urge, Personal Year, Master Number + 11/22/33 | ✓ |
| Tantra | 7 chakras (Muladhara→Sahasrara), Kundalini, Prana, Bindu, Yoni, Lingam, Maithuna | ✓ |
| Tarot | Mago, Sacerdotisa, Imperatriz, Imperador, Hierofante, ..., Mundo (22 arcanos maiores) + naipes | ✓ |

---

## 9 · Architectural decisions

### Branded primitives (cycle 70+ pattern)
`CasaNumber = Brand<number, 'CasaNumber'>` separates 1..36 from arbitrary
ints, preventing arithmetic accidents. Factories in `casasRelevantes` and
`casaNumberFactory` validate the range and throw on bad inputs.

### Inline `CruzamentoCasa` shape (vs. importing W82-A's)
W82-B can compile standalone even if W82-A hasn't merged. The shape
mirrors W82-A's contract. If W82-A's shape evolves, update
`types.ts:65-110` and any callsites referencing renamed fields.

### `slice()` + `Object.freeze` (cycle 80 lesson)
The engine slices `casasRelevantes` output before returning it through
`buildContext`. `Array.prototype.slice` returns a new mutable array. We
freeze the slice explicitly — cycle 80 caught a similar bug where a
downstream caller mutated the slice thinking it was the same reference.

### NFD substring match (cycle 81 lesson)
Sacred terms in the dictionary use original PT-BR spelling (`Oxóssi`,
`Plutão`). When scanning user input + casa content, we normalize BOTH to
NFD-stripped lowercase. Otherwise:
- `findByText` style assertions break on accents
- Substring `"plutao".includes("plutão")` is false → term never surfaces

### Forma tag → instruction rules
The `forma` field on `PerguntaConsulente` adds targeted rules
(*conselho* → practical action suggestion; *previsao* → tense rules;
*ritual* → never prescribe). Keeps the fixed rules stable while letting
the chat surface nuance per question type.

### FNV-1a cache key (NOT HMAC)
The cacheKey fingerprint needs to be content-addressable, not
cryptographic. FNV-1a 32-bit → 4-byte hex per part is cheap, deterministic
across runs, and avoids the cycle 67 HMAC overhead.

---

## 10 · TSC

```
$ cd /tmp/w82-b
$ tsc -p tsconfig.w82-b.json --noEmit
$ echo $?
0
```

`tsconfig.w82-b.json` mirrors the W75/W81/W82-A worktree pattern:
- `moduleResolution: Bundler` (engine is target-agnostic)
- `allowImportingTsExtensions: true` (the engine uses `.ts` imports
  to match how it's bundled by Node 22's `--experimental-strip-types`)
- `noUncheckedIndexedAccess: true` (cycle 73 lesson: flag every `arr[i]`
  usage)
- `lib: ["ES2022", "DOM"]` (the engine is consumed by React/DOM UIs
  downstream)

---

## 11 · Commit + push

```bash
cd /tmp/w82-b
git add src/lib/engines/akasha-prompt/ \
        src/lib/engines/akasha-prompt.spec.ts \
        scripts/smoke/akasha-prompt.ts \
        tsconfig.w82-b.json \
        DELIVERABLE.md
git commit -m "feat(w82-b): akasha-prompt-context-builder — surgical context for Akasha IA chat

- buildContext(leitura, pergunta, historico) → PromptContext
- casasRelevantes(): 3-7 most relevant CruzamentoCasa for the pergunta
- 7-tradição sacred term detection (NFD-normalized)
- System role + regras de surgical specificity
- Self-running spec, smoke, TSC=0"
timeout 60 git push -u origin w82/akasha-prompt-context-builder
```

---

## 12 · Cycle 82 — cross-cycle lessons

Two NEW durable lessons from this cycle:

1. **`Array.slice()` breaks deep-freeze contracts.** When an engine
   function returns a frozen array, and a downstream caller slices it
   before passing to a user, the slice is mutable. Always re-freeze:
   `Object.freeze(arr.slice(0, N))`. Reusable: any W82+ worktree with
   multi-stage data pipelines.

2. **NFD + substring matching beats regex `\b` for PT-BR.** We tried
   `\bOxossi\b` regex (cycle 68/69 pattern) and it failed because
   accented characters around the term ("Oxossiência") make `\b` too
   permissive. NFD-normalize both dictionary key and search corpus,
   then lowercase substring-match. Reusable: any PT-BR / multilingual
   engine doing keyword detection.

---

## 13 · Next-step hand-off notes

- W79-C (akasha-ia-streaming-ui) consumes `PromptContext`. After merge,
  call site at `src/lib/w79/akasha-ia-streaming.tsx` should use
  `useContext(leitura, pergunta, historico)` and pass `ctx.promptFinal`
  as the system prompt.
- W82-A (cruzamento-por-casa) shape must match `CruzamentoCasa` in
  `types.ts:65-110`. If W82-A ships with extra fields, no breaking
  change — we use only structural access.
- Post-cycle, consider a cache layer that stores `PromptContext` keyed
  by `ctx.meta.cacheKey` to avoid rebuilding on identical
  `(leitura, pergunta, historico)` inputs.
