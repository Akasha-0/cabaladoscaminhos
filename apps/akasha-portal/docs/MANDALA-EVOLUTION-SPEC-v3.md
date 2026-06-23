# Mandala Evolution SPEC v3.0 — Akasha OS

**Status**: Active development
**Branch**: `feat/mandala-evolution-v2`
**Updated**: 2026-06-19

---

## 1. Executive Summary

Phase 5 addresses the three most critical gaps identified by Wave 1 research in the Mandala visualization system:

1. **i18n coverage** — ALL InfoPanel text (4 panels + tooltips) is hardcoded Portuguese; zero `mandala.*` i18n keys exist for panel content.
2. **Test coverage** — Zero test files for MandalaChart, its 5 layers, hooks, or InfoPanels.
3. **Sefirot fidelity** — Layer 2 (Kabala) renders a 3-vertex triangle instead of the 10-sefirot Tree of Life.

A secondary wave (5d–5e) enriches the TantricBody InfoPanel with its existing `TANTRIC_BODY_WISDOM` data, corrects the CHANGELOG RAF inaccuracy claim, and runs an a11y audit.

---

## 2. Gap Inventory

| # | Severity | Gap | Description | Acceptance Criteria |
|---|----------|-----|-------------|-------------------|
| G1 | **P0** | i18n — InfoPanels | All 4 InfoPanel components render hardcoded Portuguese strings. `useTranslation()` is absent from all InfoPanel files. `buildTooltipByLayer` returns Portuguese text strings, not i18n keys. | Every visible string in every InfoPanel and every `buildTooltipByLayer` value is a `t('mandala.*')` key lookup. `pnpm i18n:check` passes. |
| G2 | **P0** | Tests — zero coverage | No `.test.ts` / `.spec.ts` files exist for `MandalaChart`, `MandalaInfoPanels`, `AstrologyInfoPanel`, `IchingInfoPanel`, `OduInfoPanel`, `useMandalaData`, `useReducedMotion`, or any layer component. | ≥1 test file per component; Vitest runs and passes (pre-existing failures are excluded from pass criteria). |
| G3 | **P0** | Sefirot — Layer2Kabala | Renders a 3-vertex triangle (Vida/Expressão/Motivação) instead of the 10-sefirot Tree of Life. Full spec at `docs/MANDALA-SEFIROT-TREE-DESIGN.md`. | Layer2Kabala renders all 10 sefirot with correct positions and pillar colouring per `data.kabala`. |
| G4 | **P1** | InfoPanel depth — TantricBody | `TantricBodyInfoPanel` shows active/inactive body list but does NOT render the `desc`, `challenge`, `activate` fields from `TANTRIC_BODY_WISDOM`. | Each inactive body row in the TantricBodyInfoPanel shows full wisdom text (desc + challenge + activate). |
| G5 | **P1** | CHANGELOG — RAF claim | CHANGELOG-mandala.md states "RAF-driven rotation" for Layer 4; code inspection shows CSS-only rotation (`ring-rotate` keyframe, no `requestAnimationFrame`). | CHANGELOG accurately reflects the CSS-only animation implementation. |
| G6 | **P2** | A11y — focus management | Keyboard nav is structurally present (`role="button"`, `tabIndex`, `onKeyDown`); focus ring visibility and InfoPanel focus management may need improvement. | WCAG 2.1 AA focus indicators pass; screen-reader coherent layer announcements confirmed. |

---

## 3. Phase Sequence

```
Phase 5a ── i18n (InfoPanels + buildTooltipByLayer)
Phase 5b ── Tests (component + hook coverage)
Phase 5c ── Sefirot (Layer2Kabala rewrite)
Phase 5d ── TantricBody InfoPanel depth enrichment
Phase 5e ── Performance audit (RAF claim) + A11y audit
```

---

## 4. Phase 5a — i18n

### 4.1 Inventory of Hardcoded Strings

**`MandalaInfoPanels.tsx`** — `TantricBodyInfoPanel` (Layer 3):
- Title: `"Corpo e Energia — Os 11 Corpos"`
- Subtitle: `"Teia de Conexão · Camada 3"`
- Row labels: `"Caminho Tântrico — sua prática de integração"`, `"Alma — essência que reencarna"`, `"Karma — legado de ações passadas"`, `"Dom Divino — talento espiritual a cultivar"`
- Insight (all active): `"Todos os 11 Corpos estão ativos — seu campo espiritual está em fluxo."`
- Inactive label: `"Corpos a ativar (indicados em magenta na Mandala):"`
- Inactive summary: `"{n} Corpos inativos — clique para ver detalhes →"`
- Body row: `"Corpo {n} — {desc}"`, `"Desafio: {challenge} · Ativar: {activate}"`
- Kosha section title: `"5 Koshas (Tantra Védica) — os 5 revestimentos do ser"`
- Kosha toggle: `"Mostrar detalhes avançados →"` / `"Ocultar detalhes avançados"`

**`MandalaInfoPanels.tsx`** — `KabalaInfoPanel` (Layer 2):
- Title: `"Número de Vida — Geometria Sagrada"`
- Subtitle: `"Geometria Interna · Camada 2"`
- Row labels: `"Caminho de Vida — o mapa da sua jornada"`, `"Expressão — como você se manifesta"`, `"Motivação — o que move suas escolhas"`, `"Impressão — como os outros te percebem"`, `"Missão — seu propósito incarnatório"`, `"Ano Pessoal — energia deste ciclo"`, `"Mês Pessoal — energia deste mês"`, `"Dia Pessoal — energia de hoje"`, `"Sefira — atributo divino em ação"`, `"Letra Hebraica — som sagrado do seu caminho"`, `"Carta de Tarot — arcano do seu destino"`
- Section headers: `"Ciclos de Desafio — provas que moldam seu caminho"`, `"Marcos da Vida — transições que redefinem seu caminho"`, `"Ritmo de Vida — ciclos que pedem consciência"`
- Challenge row labels: `"1º Desafio — o que enfrentar primeiro"`, `"2º Desafio — o que superar"`, `"Desafio Principal — a prova central"`, `"Último Desafio — lição final a harmonizar"`
- Pinnacle row labels: `"1º Pináculo — primeira fase de crescimento"`, `"2º Pináculo — maturação da identidade"`, `"3º Pináculo — construção do propósito"`, `"4º Pináculo — integração da sabedoria"`
- Cycle row labels: `"1º Ciclo — primeiro ritmo de vida"`, `"2º Ciclo — expansão das possibilidades"`, `"3º Ciclo — amadurecimento espiritual"`

**`AstrologyInfoPanel.tsx`** — `AstrologyInfoPanel` (Layer 4):
- Title: `"Movimento Celeste — O Céu"`
- Subtitle: `"Anel Cósmico · Camada 4"`
- Row labels for planets, aspects, elemental balance, dominant planet, ascendant, midheaven (see file)
- Elemental balance section text

**`IchingInfoPanel.tsx`** — `IchingInfoPanel` (Layer 5):
- Title: `"Mutação do Caminho — Hexagrama do Ori"`
- Subtitle: `"Sabedoria Ancestral Chinesa · Camada 5"`
- Hexagram rows (number, name, trigrams, lines, birth date/time)
- Loading/error/unavailable states

**`OduInfoPanel.tsx`** — `OduInfoPanel` (Layer 1):
- Title: `"Odu: {oduName}"`
- Subtitle: `"Núcleo — Ancestralidade · Camada 1"`
- Row labels: `"Número de Odu"`, `"Força Elemental — seu elemento estruturante"`
- Provisional warning: `"* Cálculo provisório — confirmar com linhagem de referência."`
- Preceitos/Quizilas section headers
- Insight fallback text

**`mandala-layers.ts`** — `buildTooltipByLayer`:
- Layer 1: `"Camada 1 · Ancestralidade ({name}) — {essencia}"`
- Layer 2: `"Camada 2 · Número de Vida (Vida {n}) — {essencia}"`
- Layer 3: `"Camada 3 · Corpo e Energia (Alma {n}) — {essencia}"`
- Layer 4: `"Camada 4 · Movimento Celeste (Ascendente: {formatted}) — {essencia}"`
- Layer 5: `"Camada 5 · Mutação do Caminho ({hex}) — {essencia}"`
- Fallback: `"Hex do dia (requer Mutação do Caminho)"`

### 4.2 i18n Key Schema

All new keys go under the `mandala` namespace. Structure:

```json
{
  "mandala": {
    "panels": {
      "kabala": {
        "title": "...",
        "subtitle": "...",
        "rows": {
          "lifePath": "...",
          "expression": "...",
          "motivation": "...",
          "impression": "...",
          "mission": "...",
          "personalYear": "...",
          "personalMonth": "...",
          "personalDay": "...",
          "sefira": "...",
          "hebrewLetter": "...",
          "tarotCard": "..."
        },
        "sections": {
          "challengesTitle": "...",
          "pinnaclesTitle": "...",
          "lifeCyclesTitle": "...",
          "challengeFirst": "...",
          "challengeSecond": "...",
          "challengeMain": "...",
          "challengeLast": "...",
          "pinnacleFirst": "...",
          "pinnacleSecond": "...",
          "pinnacleThird": "...",
          "pinnacleFourth": "...",
          "cycleFirst": "...",
          "cycleSecond": "...",
          "cycleThird": "..."
        }
      },
      "tantra": {
        "title": "...",
        "subtitle": "...",
        "rows": {
          "tantricPath": "...",
          "soul": "...",
          "karma": "...",
          "divineGift": "..."
        },
        "allActive": "...",
        "inactiveLabel": "...",
        "inactiveSummary": "...",
        "koshasTitle": "...",
        "showAdvanced": "...",
        "hideAdvanced": "...",
        "bodyRow": "..."
      },
      "astrology": {
        "title": "...",
        "subtitle": "...",
        "dominantPlanet": "...",
        "ascendant": "...",
        "midheaven": "...",
        "house": "...",
        "retrograde": "...",
        "aspects": "...",
        "elementalBalance": "...",
        "showAdvanced": "...",
        "hideAdvanced": "..."
      },
      "iching": {
        "title": "...",
        "subtitle": "...",
        "hexagram": "...",
        "trigrams": "...",
        "lines": "...",
        "birthDate": "...",
        "birthTime": "...",
        "showAdvanced": "...",
        "hideAdvanced": "...",
        "unavailable": "...",
        "error": "..."
      },
      "odu": {
        "title": "...",
        "subtitle": "...",
        "oduNumber": "...",
        "elementalForce": "...",
        "provisional": "...",
        "preceitos": "...",
        "quizilas": "...",
        "noPreceitos": "..."
      }
    },
    "tooltips": {
      "layer1": "...",
      "layer2": "...",
      "layer3": "...",
      "layer4": "...",
      "layer5": "...",
      "layer5Fallback": "..."
    },
    "layerNames": {
      "1": "...",
      "2": "...",
      "3": "...",
      "4": "...",
      "5": "..."
    }
  }
}
```

### 4.3 Implementation Steps

1. Add all keys to `src/i18n/pt-BR.json` (source of truth, most complete).
2. Add same-structure keys to `src/i18n/en.json` with English translations.
3. Update `buildTooltipByLayer` in `mandala-layers.ts` to return i18n key strings instead of translated strings (call site does `t()` lookup).
4. Update each InfoPanel:
   - Import: `import { useTranslation } from '@/i18n'`
   - Add `const { t } = useTranslation()` inside each component
   - Replace every hardcoded Portuguese string with `t('mandala.panels.*')` or `t('mandala.tooltips.*')`
5. Run `pnpm i18n:check` to verify key parity between en and pt-BR.

### 4.4 Verification — Phase 5a

- `pnpm typecheck` → 0 errors
- `pnpm lint` → 0 errors
- `pnpm i18n:check` → 0 missing keys reported
- All 4 InfoPanels render translated strings in both locales
- `buildTooltipByLayer` returns stable key strings; `<title>` elements show translated text via `t()` at call site

---

## 5. Phase 5b — Tests

### 5.1 Test File Map

| Component | Test File | What to Test |
|-----------|-----------|-------------|
| `useMandalaData.ts` | `src/components/akasha/hooks/__tests__/useMandalaData.test.ts` | Memoisation, derived fields (`tooltipByLayer`, `planetDots`, `tantricNodes`, `kabVerts`, `trianglePath`) |
| `useReducedMotion.ts` | `src/components/akasha/hooks/__tests__/useReducedMotion.test.ts` | Returns `true`/`false` based on media query |
| `buildTooltipByLayer` | `src/components/akasha/__tests__/mandala-layers.test.ts` | Return shape, i18n keys per layer, handles nulls |
| `buildPlanetDots` | `src/components/akasha/__tests__/mandala-layers.test.ts` | Positions, fallbacks |
| `buildTantricNodes` | `src/components/akasha/__tests__/mandala-layers.test.ts` | Count, active flags |
| `buildKabVerts` | `src/components/akasha/__tests__/mandala-layers.test.ts` | 3 vertices, angles |
| `MandalaInfoPanels` | `src/components/akasha/__tests__/MandalaInfoPanels.test.tsx` | Renders without crash, toggle advanced state |
| `AstrologyInfoPanel` | `src/components/akasha/__tests__/AstrologyInfoPanel.test.tsx` | Renders planets, aspects |
| `IchingInfoPanel` | `src/components/akasha/__tests__/IchingInfoPanel.test.tsx` | Available + unavailable states |
| `OduInfoPanel` | `src/components/akasha/__tests__/OduInfoPanel.test.tsx` | Renders odu name, provisional flag |

### 5.2 Mock Strategy

- `next-i18next` mocked via `jest.mock('@/i18n', () => ({ useTranslation: () => ({ t: (k: string) => k }) }))`
- `resolveSig` from `mandala-meanings` mocked to return predictable shapes
- `MandalaData` fixtures: minimal valid object covering only fields the unit under test reads

### 5.3 Verification — Phase 5b

- `pnpm vitest run` → all new tests pass
- No pre-existing test files were modified (excluded from pass criteria)

---

## 6. Phase 5c — Sefirot Tree (Layer2Kabala)

### 6.1 Full specification

See `docs/MANDALA-SEFIROT-TREE-DESIGN.md`. Summary of required changes:

- Replace 3-vertex triangle with 10-sefirot Tree of Life
- Positions: Keter(200,20), Chokhmah(200,55), Binah(200,90), Chesed(140,120), Gevurah(260,120), Tiferet(200,150), Netzach(115,185), Hod(285,185), Yesod(200,215), Malkut(200,250)
- Three pillars: Left (Binah-Chesed-Hod), Middle (Keter-Chokhmah-Tiferet-Netzach-Yesod-Malkut), Right (Chokhmah-Gevurah-Hod)
- Pillar colouring per `data.kabala` active state
- 22 paths (paths between sefirot) not required in Phase 5c (deferred to future research)
- Master number indicators: outer ring when `lifePathMaster === true`

### 6.2 Files to Change

- `src/components/akasha/layers/Layer2Kabala.tsx`

### 6.3 Verification — Phase 5c

- Layer2Kabala renders all 10 sefirot circles at correct SVG positions
- Pillar colours reflect `data.kabala` state
- `pnpm typecheck` → 0 errors

---

## 7. Phase 5d — TantricBody InfoPanel Depth

### 7.1 Change

Currently, `TantricBodyInfoPanel` renders inactive body indices and a `TANTRIC_BODY_WISDOM` desc, but challenge/activate fields from `TANTRIC_BODY_WISDOM[n.i + 1]` are already wired (line 68: `"Desafio: {w?.challenge} · Ativar: {w?.activate}"`). Verify this renders correctly; if not, fix the data access.

### 7.2 Files to Change

- `src/components/akasha/MandalaInfoPanels.tsx` (confirm `TantricBodyInfoPanel` renders full wisdom)

### 7.3 Verification — Phase 5d

- Each inactive body row shows: body name, description, challenge, activation method
- Panel renders without crash with all 11 bodies active and any subset inactive

---

## 8. Phase 5e — Performance + A11y

### 8.1 CHANGELOG RAF Correction

CHANGELOG-mandala.md line 22 states "RAF-driven rotation with `prefers-reduced-motion` support". The actual implementation uses CSS `@keyframes ring-rotate` (CSS animation) only. `requestAnimationFrame` is NOT used.

**Action**: Remove "RAF-driven" from CHANGELOG. Replace with accurate description: "CSS `@keyframes ring-rotate` animation with `prefers-reduced-motion` support (animation paused via `.ring-astrological-paused` class)".

### 8.2 A11y Audit

- Verify focus rings are visible on all 5 layer `<g>` elements (`:focus-visible` styling)
- Verify `aria-live="polite"` region correctly announces layer changes
- Check InfoPanel focus management: when a layer is activated, does keyboard focus move to/inside the relevant InfoPanel?
- Verify planet glyph `aria-label` quality (complete sentence: planet + sign + house + retrograde status)

### 8.3 Files to Change (if issues found)

- `src/styles/mandala-animations.css`
- Layer component files (focus ring CSS)
- `MandalaChart.tsx` (aria-live region check)
- `CHANGELOG-mandala.md`

### 8.4 Verification — Phase 5e

- CHANGELOG accurately describes CSS-only rotation
- WCAG 2.1 AA focus indicators visible
- Screen reader layer change announcements work

---

## 9. Risks and Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| i18n keys added to pt-BR but not en → `i18n:check` fails | Medium | Blocks CI | Add to both files in same commit; verify with `i18n:check` before PR |
| `useTranslation()` in InfoPanels causes SSR/hydration mismatch | Low | Runtime error | InfoPanels are already `'use client'`; `useTranslation` from `@/i18n` is SSR-safe |
| Sefirot tree requires research on authentic 10-sefirot positions | Low | Delay Phase 5c | Use canonical Tree of Life positions documented in `MANDALA-SEFIROT-TREE-DESIGN.md` |
| Pre-existing test failures obscure new test results | Medium | Confusion | Run new tests in isolation first; document pre-existing failures in test files |
| `buildTooltipByLayer` key change breaks `<title>` rendering | Low | Visual regression | Verify `<title>` elements in browser after change |

### Dependencies

- `mandala-meanings.ts` (`resolveSig`, `TANTRIC_BODY_WISDOM`) — must exist before i18n wiring
- `mandala-geometry.ts` (`Layer` type, `toXY`, `STARS`, `ZODIAC_*`) — unchanged
- `@/i18n` hook — must be importable from all InfoPanel files
- `MandalaData` interface — unchanged; InfoPanels receive typed props

---

## 10. Quality Gates

| Gate | Target | Phase |
|------|--------|-------|
| TypeScript errors | 0 | All |
| Lint errors | 0 | All |
| i18n key parity (en = pt-BR structure) | 100% | 5a |
| New test files | ≥10 | 5b |
| Vitest pass (new tests) | 100% | 5b |
| Layer2Kabala renders 10 sefirot | Yes | 5c |
| CHANGELOG accuracy | Fixed | 5e |
| WCAG focus indicators | AA | 5e |

---

## 11. Branch and PR

- **Branch**: `feat/mandala-evolution-v2`
- **Commits per phase** with signed, descriptive messages (one phase per commit)
- **PR description** links each commit to its gap (G1–G6)
