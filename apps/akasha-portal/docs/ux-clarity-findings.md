# UX Clarity Findings — Dashboard Narrative Text

## Finding: `buildSynthesisV3` produces abstract, non-actionable synthesis text

**File:** `apps/akasha-portal/src/lib/grimoire/synthesis/narrative-generator.ts`  
**Function:** `buildSynthesisV3` (lines 281–355)  
**Where displayed:** Dashboard "Perfil de Hoje" card and modal dimension detail view

### Problem Diagnosis

The `buildSynthesisV3` function generates the **Akasha Synthesis — visão unificada:** section, the most prominent narrative block on the dashboard. It fails all three criteria:

| Criterion | Status | Evidence |
|---|---|---|
| **Short sentences (≤15 words)** | ❌ FAIL | Longest sentence: 22 words. Multiple sentences chain 2-3 ideas with commas before reaching a period. |
| **Always has CTA / next step** | ❌ FAIL | Zero calls to action. The entire function outputs abstract metaphysical language only — no suggestion of what to do. |
| **No raw symbols without translation** | ❌ FAIL | Shows `Os seus 5 mapas convergem` — user doesn't know what "5 mapas" refers to. Contains `I Ching 45` with no explanation of what I Ching is or what "45" means. |

### Example: Current Text (Problematic)

```
[buildSynthesisV3 output]
**Akasha Synthesis — visão unificada:**
Os seus 5 mapas convergem: uma assinatura única. Missão: autenticidade e foco.
Convergência: alinhamento entre o que você deseja e o que o momento pede.
Tensão detectada: tendência a se sacrificar pelos outros. Isso não é conflito — é o campo de transformação. Atravesse, não evite.
I Ching 45 diz que hoje: practice text.
```

**Issues:**
- "5 mapas" — raw symbol. User sees a count of five but doesn't know what those five are or why it matters.
- "Akasha Synthesis — visão unificada" — jargon heading. "Synthesis" and "visão unificada" mean the same thing; user-friendly alternative: simply "Hoje em Uma Frase" or leave it as the card header "Perfil de Hoje".
- "assinatura única" — abstract, mystical phrasing. Not useful for daily decisions.
- "campo de transformação" — poetic metaphor that doesn't convey a next step.
- "Atravesse, não evite" — sounds like an instruction but is generic. Can apply to any day, any situation.
- "I Ching 45" — raw technical term + number with no context. Most users don't know what I Ching is, let alone hexagram 45.
- No concrete action anywhere. User reads 3-5 sentences and has no idea what to DO.

### Proposed Improvement

Same function, shorter sentences, always ends with a CTA, raw symbols translated:

```
[Proposed replacement output]
**Síntese do Dia:**
Seus cinco mapas (Cabala, Astrologia, Tantra, Odu, I Ching) convergem em uma mensagem: autenticidade com foco no hoje. 
O que seus mapas reforçam: alinhamento entre desejo e momento presente.
Cuidado com: sacrificar-se pelos outros. Este padrão pode se repetir hoje.

**Sua ação:**
Escolha UMA conversa ou decisão onde você costuma dizer "sim" por obrigação. Hoje, diga "não" com consciência.

**Referência:** I Ching hexagrama 45 (Reunião) — convida a juntar forças ao invés de agir sozinho.
```

**Improvements quantified:**
1. Shortest sentence: 5 words. Longest: 15 words.
2. Explicit CTA in "Sua ação" section — one concrete, specific behavior for today.
3. Raw symbols translated: "5 mapas" → named (Cabala, Astrologia...), "I Ching 45" → "I Ching hexagrama 45 (Reunião)" with a plain-language description of what it means.
4. "campo de transformação" → "Este padrão pode se repetir hoje" — grounded in the actual day, not a poetic label.

### Implementation Sketch

The change requires rewriting the `buildSynthesisV3` function body (lines 301–354) to:
1. Remove the heading `**Akasha Synthesis — visão unificada:**` — the card itself already has a heading.
2. Start with an explicit synthesis sentence of ≤15 words using plain language.
3. Add a concrete CTA paragraph (`**Sua ação:**`) with one specific behavior for today.
4. Translate all raw symbols: `I Ching ${hex}` → `I Ching hexagrama ${hex} (${titulo}) — ${explicação_curta}`.
5. Replace "5 mapas" with the actual listed names, or drop the count entirely and say what it means.

The same pattern applies to `buildPerspectivasV3` (lines 185–279) which displays raw pillar names with arcane codes (`Caminho 7`, `Corpo 8`, `Odu 45`) and no CTA — a secondary fix for the dimension detail modal.

### Impact

This function feeds the **most visible narrative section** on the daily dashboard — the synthesis card below the cosmic vibe grid. Users see this first after opening the app. Making it short, actionable, and symbol-free is the highest-ROI clarity improvement in the dashboard.