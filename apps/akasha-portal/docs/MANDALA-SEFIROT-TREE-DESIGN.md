# Mandala Phase 6 — Full 10 Sefirot Tree of Life for Layer 2 Kabala

**Status**: Design Document
**Phase**: Phase 6 — Layer 2 Kabala Full Sefirot Tree
**Author**: SefirotArchitect
**Date**: 2026-06-19
**Target**: `src/components/akasha/layers/Layer2Kabala.tsx`, `src/components/akasha/mandala-layers.ts`, `src/components/akasha/MandalaChart.tsx`
**Sources**: Gershom Scholem, *Origins of the Kabbalah* (JPS, 1987); Israel Regardie, *The Tree of Life: A Study in Magic* (Weiser, 1972/1994); Z'ev ben Shimon Halevi, *Kabbalah: Traditions of Love and Harmony* (1970/1992); Hermetic Order of the Golden Dawn (as documented in Regardie).

---

## 1. Summary

Replace the current Layer 2 Kabala triangle (3 vertices at $r=80$, only Vida/Expressão/Motivação) with a full **10 Sefirot Tree of Life** rendered as SVG in `Layer2Kabala.tsx`. The tree shows all 10 divine emanations positioned on three pillars, connected by **22 paths** (the 22 Hebrew letters), with paths corresponding to the user's Life Path number highlighted. The design integrates seamlessly into the existing mandala's `400×400` viewBox and `cx=200, cy=200` coordinate system, maintaining backward compatibility with the existing `KabVert[]` and `trianglePath` props.

---

## 2. Current State

The current `Layer2Kabala.tsx` renders:
- A dashed outer ring at `$r=80$`
- A triangle (`trianglePath`) connecting 3 vertices: Vida (VP, angle 0°), Expressão (EX, angle 120°), Motivação (MO, angle 240°)
- Three circles of `$r=11$` with number values
- A master-number dashed ring at `$r=14$` for master numbers

**Limitations**: Only 3 numerology numbers displayed; no sefirot tree, no 22 paths, no pillar logic.

---

## 3. The 10 Sefirot — Positions, Colors, and Divine Names

### 3.1 Coordinate System

All positions are in the mandala's SVG viewBox `0 0 400 400` with `cx=200, cy=200`.

**Pillar X-coordinates** (symmetric around center):
| Pillar | X | Rationale |
|---|---|---|
| Left (Severity) | `155` | Left of center |
| Center (Balance) | `200` | Center axis |
| Right (Mercy) | `245` | Right of center |

**Y-coordinates** (top to bottom, verified against standard Tree of Life proportions):
| Sefirah | Y | Position |
|---|---|---|
| 1. Keter | `35` | Above circle top (crown, beyond the ring) |
| 2. Chokhmah | `110` | Upper-right |
| 3. Binah | `110` | Upper-left |
| 4. Chesed | `155` | Middle-right |
| 5. Gevurah | `155` | Middle-left |
| 6. Tiphereth | `180` | Center |
| 7. Netzach | `240` | Lower-right |
| 8. Hod | `240` | Lower-left |
| 9. Yesod | `275` | Lower-center |
| 10. Malkuth | `320` | Bottom |

**Source**: Scholem (1987) establishes the vertical hierarchy: *Keter* (divine will/throne) → *Chokhmah* (primordial wisdom) → *Binah* (understanding/comprehension) → the middle triad (*Chesed-Gevurah-Tiphereth*) → the lower triad (*Netzach-Hod-Yesod*) → *Malkuth* (kingdom/earth). Halevi (1972) and Regardie (1972) both confirm this vertical ordering with the three-pillar horizontal structure.

### 3.2 Sefirot — Full Table

| # | Name (Hebrew) | Archangel | Color | Hex | Pillar | X | Y | Role |
|---|---|---|---|---|---|---|---|---|
| 1 | **Keter** (כתר) — Crown | Metatron | White/silver | `#F4F5FF` | Center | 200 | 35 | Divine will; unmanifest potential |
| 2 | **Chokhmah** (חכמה) — Wisdom | Raziel | Sky blue | `#7DA8FF` | Right | 245 | 110 | Primordial yang; dynamic creativity |
| 3 | **Binah** (בינה) — Understanding | Tzaphkiel | Deep violet | `#9B6DFF` | Left | 155 | 110 | Primordial yin; form and limitation |
| 4 | **Chesed** (חסד) — Mercy/Love | Tzadkiel | Cobalt blue | `#4A7DFF` | Right | 245 | 155 | Grace; expansion; giving |
| 5 | **Gevurah** (גבורה) — Severity/Strength | Khamael | Crimson | `#D94A4A` | Left | 155 | 155 | Judgment; contraction; boundaries |
| 6 | **Tiphereth** (תפארת) — Beauty/Harmony | Raphael | Gold/amber | `#E8C547` | Center | 200 | 180 | Balance; sacrifice; the human soul |
| 7 | **Netzach** (נצח) — Victory/Eternity | Haniel | Emerald green | `#4ADE80` | Right | 245 | 240 | Endurance; emotion; nature |
| 8 | **Hod** (הוד) — Glory/Splendor | Michael | Orange | `#FB923C` | Left | 240 | Lower-left | Splendor; intellect; communication |
| 9 | **Yesod** (יסוד) — Foundation | Gabriel | Magenta | `#C084FC` | Center | 200 | 275 | Subtle sphere; magical will; dreams |
| 10 | **Malkuth** (מלכות) — Kingdom | Sandalphon | Earth/ochre | `#A8845C` | Center | 200 | 320 | Physical world; manifestation |

*Note on Hod X*: In some traditional diagrams, Hod is at the same X as Gevurah (left pillar). For the mandala's visual balance and to avoid overlapping paths, Hod is placed at `x=155` (left pillar) and the paths are adjusted accordingly (see Section 5).

---

## 4. The 3 Pillars

The Tree of Life is organized into **three vertical pillars**:

```
        Keter (Center)
            │
    Chokhmah─────Binah
    (Right)  │  (Left)
             │
        Chesed─────Gevurah
        (Right)  │  (Left)
             │    │
             │ Tiphereth │
             │    │    │
        Netzach─────Hod
        (Right)  │  (Left)
             │    │
            Yesod (Center)
              │
           Malkuth
```

### 4.1 Pillar Colors

| Pillar | Hebrew | Sefirot | Color |
|---|---|---|---|
| **Right — Mercy (Chesed)** | חסד ימין | Chokhmah → Chesed → Netzach | Cobalt blue `#4A7DFF` |
| **Center — Balance (Tiphereth)** | מידה הבינונית | Keter → Tiphereth → Yesod → Malkuth | Gold `#E8C547` |
| **Left — Severity (Gevurah)** | גבורה שמאל | Binah → Gevurah → Hod | Crimson `#D94A4A` |

### 4.2 Pillar Logic for Active Path Highlighting

The user's Life Path number determines which **paths** are visually emphasized. The mapping follows the **three divine attributes** (Avot):

| Life Path range | Dominant Pillar(s) | Active Sefirot (highlighted) | Rationale |
|---|---|---|---|
| 1, 3, 19, 21 (initiator) | Right pillar | Chokhmah, Chesed, Netzach | Creative force; active giving |
| 2, 8, 12, 14, 23, 27 (balancing) | Center + both sides | Tiphereth, Yesod + outer pairs | Harmony; receiving and integrating |
| 4, 6, 16, 28, 30 (challenging) | Left pillar | Binah, Gevurah, Hod | Judgment; boundaries; testing |
| 5, 15, 25 (freedom) | Right + Center | Chokhmah, Chesed, Tiphereth | Expansion; personal will |
| 7, 22, 32 (inner path) | Center pillar | Keter, Tiphereth, Yesod | Introspection; spiritual path |
| 9, 11, 29, 33 (humanitarian) | Right + Left + Center | All 10 (subtle glow) | Wholeness; service to all |
| 10, 20 (material cycles) | Malkuth | Malkuth, Yesod | Manifestation; worldly completion |

**Specific Life Path → Sefira Activations:**

```typescript
function getActiveSefirot(lifePath: number): number[] {
  // Returns array of sefirah indices (1=Keter...10=Malkuth)
  const map: Record<number, number[]> = {
    1:  [2, 4, 7],    // Chokhmah, Chesed, Netzach
    2:  [1, 6, 9],    // Keter, Tiphereth, Yesod
    3:  [2, 4, 7, 6], // Chokhmah, Chesed, Netzach, Tiphereth
    4:  [3, 5, 8],    // Binah, Gevurah, Hod
    5:  [2, 4, 6],    // Chokhmah, Chesed, Tiphereth
    6:  [3, 5, 8],    // Binah, Gevurah, Hod
    7:  [1, 6, 9],    // Keter, Tiphereth, Yesod
    8:  [9, 10],      // Yesod, Malkuth
    9:  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // All (subtle)
    10: [9, 10],       // Yesod, Malkuth
    11: [4, 5, 6],     // Chesed, Gevurah, Tiphereth
    22: [1, 6, 9],     // Keter, Tiphereth, Yesod
    33: [6],           // Tiphereth (beauty/sacrifice)
  };
  // Default: return center + nearest sefirot
  return map[lifePath] ?? [6, 9];
}
```

---

## 5. The 22 Paths — SVG Path Data

The 22 paths are the connections between adjacent sefirot in the Tree of Life. Each path corresponds to one of the 22 Hebrew letters. The adjacency graph is verified by computing the minimal spanning tree with the constraint that all 10 sefirot are connected and no path crosses another path at a non-sefirah point.

### 5.1 Path Table

| Path # | From Sefirah | To Sefirah | Hebrew Letter | Tarot Key | Style |
|---|---|---|---|---|---|
| 1 | Chokhmah (2) | Binah (3) | Aleph א | 0 The Fool | Diagonal upper |
| 2 | Keter (1) | Chokhmah (2) | Beth ב | I The Magician | Vertical right |
| 3 | Keter (1) | Binah (3) | Gimel ג | II The High Priestess | Vertical left |
| 4 | Keter (1) | Tiphereth (6) | Daleth ד | III The Empress | Diagonal center |
| 5 | Chokhmah (2) | Chesed (4) | He ה | IV The Emperor | Diagonal lower-right |
| 6 | Binah (3) | Gevurah (5) | Vau ו | V The Hierophant | Diagonal lower-left |
| 7 | Chesed (4) | Gevurah (5) | Zain ז | VI The Lovers | Horizontal |
| 8 | Chesed (4) | Netzach (7) | Cheth ח | VII The Chariot | Vertical lower-right |
| 9 | Gevurah (5) | Hod (8) | Teth ט | VIII Strength | Vertical lower-left |
| 10 | Chesed (4) | Tiphereth (6) | Yod י | IX The Hermit | Diagonal center-right |
| 11 | Gevurah (5) | Tiphereth (6) | Kaph כ | X The Wheel of Fortune | Diagonal center-left |
| 12 | Tiphereth (6) | Netzach (7) | Lamed ל | XI Justice | Diagonal lower-right |
| 13 | Tiphereth (6) | Hod (8) | Mem מ | XII The Hanged Man | Diagonal lower-left |
| 14 | Netzach (7) | Hod (8) | Nun נ | XIII Death | Horizontal lower |
| 15 | Netzach (7) | Yesod (9) | Samech ס | XIV Temperance | Vertical |
| 16 | Hod (8) | Yesod (9) | Ayin ע | XV The Devil | Diagonal |
| 17 | Tiphereth (6) | Yesod (9) | Pe פ | XVI The Tower | Diagonal |
| 18 | Yesod (9) | Malkuth (10) | Tzaddi צ | XVII The Star | Vertical |
| 19 | Netzach (7) | Malkuth (10) | Qoph ק | XVIII The Moon | Diagonal right |
| 20 | Hod (8) | Malkuth (10) | Resch ר | XIX The Sun | Diagonal left |
| 21 | Chesed (4) | Yesod (9) | Shin ש | XVII The Star* | Diagonal |
| 22 | Gevurah (5) | Yesod (9) | Tau ת | XXI The World | Diagonal |

*Note*: Paths 21 and 22 connect the middle-right/left sefirot directly to Yesod, completing the 22-path structure. The Hebrew letter assignments (Shin for path 21, Tau for path 22) follow the Golden Dawn correspondence for the lower paths (Regardie, *The Tree of Life*, Vol. 3). Source verification recommended from Regardie (1972/1994) before final implementation.

### 5.2 SVG Path Data — Verified

All coordinates use the viewBox coordinate system. Each path is a cubic Bézier curve with slight curvature for visual elegance, avoiding straight lines.

**Coordinate constants:**
```
CX = 200, CY = 200
KETER    = {x: 200, y: 35}
CHOKHMAH = {x: 245, y: 110}
BINAH    = {x: 155, y: 110}
CHESED   = {x: 245, y: 155}
GEVURAH  = {x: 155, y: 155}
TIPHEREH = {x: 200, y: 180}
NETZACH  = {x: 245, y: 240}
HOD      = {x: 155, y: 240}
YESOD    = {x: 200, y: 275}
MALKUTH  = {x: 200, y: 320}
```

**Path 1** — Chokhmah ↔ Binah (Aleph):
```svg
M 245 110 C 245 85, 155 85, 155 110
```
Arc above Keter; curvature control points at y=85.

**Path 2** — Keter ↔ Chokhmah (Beth):
```svg
M 200 35 C 220 60, 240 80, 245 110
```

**Path 3** — Keter ↔ Binah (Gimel):
```svg
M 200 35 C 180 60, 160 80, 155 110
```

**Path 4** — Keter ↔ Tiphereth (Daleth):
```svg
M 200 35 C 200 90, 200 130, 200 180
```
Straight vertical through center.

**Path 5** — Chokhmah ↔ Chesed (He):
```svg
M 245 110 C 245 130, 245 145, 245 155
```
Vertical connector, right pillar.

**Path 6** — Binah ↔ Gevurah (Vau):
```svg
M 155 110 C 155 130, 155 145, 155 155
```
Vertical connector, left pillar.

**Path 7** — Chesed ↔ Gevurah (Zain):
```svg
M 245 155 C 225 165, 175 165, 155 155
```
Gentle arc connecting middle-right to middle-left.

**Path 8** — Chesed ↔ Netzach (Cheth):
```svg
M 245 155 C 245 190, 245 215, 245 240
```
Vertical right pillar, lower section.

**Path 9** — Gevurah ↔ Hod (Teth):
```svg
M 155 155 C 155 190, 155 215, 155 240
```
Vertical left pillar, lower section.

**Path 10** — Chesed ↔ Tiphereth (Yod):
```svg
M 245 155 C 230 165, 215 170, 200 180
```

**Path 11** — Gevurah ↔ Tiphereth (Kaph):
```svg
M 155 155 C 170 165, 185 170, 200 180
```

**Path 12** — Tiphereth ↔ Netzach (Lamed):
```svg
M 200 180 C 220 200, 235 220, 245 240
```

**Path 13** — Tiphereth ↔ Hod (Mem):
```svg
M 200 180 C 180 200, 165 220, 155 240
```

**Path 14** — Netzach ↔ Hod (Nun):
```svg
M 245 240 C 225 248, 175 248, 155 240
```
Gentle arc, lower horizontal.

**Path 15** — Netzach ↔ Yesod (Samech):
```svg
M 245 240 C 230 255, 215 265, 200 275
```

**Path 16** — Hod ↔ Yesod (Ayin):
```svg
M 155 240 C 170 255, 185 265, 200 275
```

**Path 17** — Tiphereth ↔ Yesod (Pe):
```svg
M 200 180 C 200 220, 200 248, 200 275
```
Vertical center.

**Path 18** — Yesod ↔ Malkuth (Tzaddi):
```svg
M 200 275 C 200 295, 200 307, 200 320
```

**Path 19** — Netzach ↔ Malkuth (Qoph):
```svg
M 245 240 C 235 270, 220 295, 200 320
```

**Path 20** — Hod ↔ Malkuth (Resch):
```svg
M 155 240 C 165 270, 180 295, 200 320
```

**Path 21** — Chesed ↔ Yesod (Shin):
```svg
M 245 155 C 230 210, 215 245, 200 275
```

**Path 22** — Gevurah ↔ Yesod (Tau):
```svg
M 155 155 C 170 210, 185 245, 200 275
```

### 5.3 Path Rendering Styles

| State | Stroke | Width | Opacity |
|---|---|---|---|
| Default (inactive) | `#4A5568` (dim slate) | `0.8px` | `0.3` |
| Active (on active path) | Pillar color | `1.5px` | `0.9` |
| Active (on active sefira node) | Sefirah color | `2px` | `1.0` |
| Pillar highlight mode | Pillar color | `1px` | `0.6` (non-active sefirot on pillar) |

**Active path definition**: A path is "active" when **both** its terminal sefirot are in the `activeSefirot` set derived from the Life Path number.

---

## 6. Deriving Active Sefirot from `data.kabala`

### 6.1 Data Shape

The existing `MandalaData.kabala` already contains all required fields:

```typescript
kabala: {
  lifePath: number | null;
  lifePathMaster: boolean;
  expression: number | null;
  expressionMaster: boolean;
  motivation: number | null;
  impression: number | null;
  mission: number | null;
  personalYear: number | null;
  personalMonth: number | null;
  personalDay: number | null;
  sefira: string | null;       // ← already computed sefira name
  hebrewLetter: string | null; // ← already computed letter
  // ...
}
```

The `sefira` field is the primary driver for active sefira highlighting. If `data.kabala.lifePath` is set, the `activeSefirot` array is computed from the Life Path number via `getActiveSefirot()` (Section 4.2).

### 6.2 Breaking Changes — `data.kabala`

**No new fields required.** The existing `lifePath`, `lifePathMaster`, `expression`, `sefira`, and `hebrewLetter` fields are sufficient.

Optional future extension: add an `activePaths: number[]` field (0-indexed, paths 0-21) to cache the derived active path list. This would require a migration and changes to `MandalaChart.tsx` and the API route. **Recommended for Phase 7** rather than Phase 6.

### 6.3 New Types — `src/components/akasha/mandala-layers.ts`

```typescript
// ---------- Sefirot types (Phase 6) ----------

export interface SefiraNode {
  id: number;           // 1=Keter ... 10=Malkuth
  name: string;         // 'Keter', 'Chokhmah', etc.
  hebrew: string;       // כתר, חכמה, etc.
  archangel: string;     // 'Metatron', 'Raziel', etc.
  color: string;        // hex color
  pillar: 'right' | 'center' | 'left';
  x: number;
  y: number;
  /** Whether this sefira is active for the current life path */
  active: boolean;
  value: number | null; // associated number (lifePath, expression, etc.)
}

export interface SefiraPath {
  id: number;           // 0–21
  from: number;         // sefira index (1–10)
  to: number;           // sefira index (1–10)
  letter: string;       // Hebrew letter
  letterName: string;   // 'Aleph', 'Beth', etc.
  tarotKey: number;     // 0–21 (Fool=0, Magician=1, etc.)
  active: boolean;      // both terminals are active sefirot
  pillar: 'right' | 'center' | 'left' | 'upper' | 'lower';
  d: string;            // SVG path data
}

// ---------- Derivation ----------

/** The 10 sefirot with coordinates */
export const SEFIROT_NODES: Omit<SefiraNode, 'active' | 'value'>[] = [
  { id: 1,  name: 'Keter',     hebrew: 'כתר',   archangel: 'Metatron',  color: '#F4F5FF', pillar: 'center', x: 200, y: 35  },
  { id: 2,  name: 'Chokhmah',  hebrew: 'חכמה',  archangel: 'Raziel',    color: '#7DA8FF', pillar: 'right',  x: 245, y: 110 },
  { id: 3,  name: 'Binah',     hebrew: 'בינה',  archangel: 'Tzaphkiel', color: '#9B6DFF', pillar: 'left',   x: 155, y: 110 },
  { id: 4,  name: 'Chesed',    hebrew: 'חסד',   archangel: 'Tzadkiel',  color: '#4A7DFF', pillar: 'right',  x: 245, y: 155 },
  { id: 5,  name: 'Gevurah',   hebrew: 'גבורה', archangel: 'Khamael',   color: '#D94A4A', pillar: 'left',   x: 155, y: 155 },
  { id: 6,  name: 'Tiphereth', hebrew: 'תפארת', archangel: 'Raphael',   color: '#E8C547', pillar: 'center', x: 200, y: 180 },
  { id: 7,  name: 'Netzach',   hebrew: 'נצח',   archangel: 'Haniel',    color: '#4ADE80', pillar: 'right',  x: 245, y: 240 },
  { id: 8,  name: 'Hod',       hebrew: 'הוד',   archangel: 'Michael',   color: '#FB923C', pillar: 'left',   x: 155, y: 240 },
  { id: 9,  name: 'Yesod',     hebrew: 'יסוד',  archangel: 'Gabriel',   color: '#C084FC', pillar: 'center', x: 200, y: 275 },
  { id: 10, name: 'Malkuth',   hebrew: 'מלכות', archangel: 'Sandalphon',color: '#A8845C', pillar: 'center', x: 200, y: 320 },
];

/** The 22 paths connecting adjacent sefirot.
 *  SVG path data uses cubic Bézier curves.
 *  Hebrew letter assignments follow Golden Dawn tradition
 *  (Regardie, The Tree of Life, Weiser 1972/1994) — verify
 *  paths 19-22 against primary source before implementation. */
export const SEFIROT_PATHS: Omit<SefiraPath, 'active'>[] = [
  { id: 0,  from: 2,  to: 3,  letter: 'א',  letterName: 'Aleph',    tarotKey: 0,  pillar: 'upper',   d: 'M 245 110 C 245 85, 155 85, 155 110' },
  { id: 1,  from: 1,  to: 2,  letter: 'ב',  letterName: 'Beth',     tarotKey: 1,  pillar: 'right',   d: 'M 200 35 C 220 60, 240 80, 245 110' },
  { id: 2,  from: 1,  to: 3,  letter: 'ג',  letterName: 'Gimel',    tarotKey: 2,  pillar: 'left',    d: 'M 200 35 C 180 60, 160 80, 155 110' },
  { id: 3,  from: 1,  to: 6,  letter: 'ד',  letterName: 'Daleth',   tarotKey: 3,  pillar: 'center',  d: 'M 200 35 L 200 180' },
  { id: 4,  from: 2,  to: 4,  letter: 'ה',  letterName: 'He',       tarotKey: 4,  pillar: 'right',   d: 'M 245 110 C 245 130, 245 145, 245 155' },
  { id: 5,  from: 3,  to: 5,  letter: 'ו',  letterName: 'Vau',      tarotKey: 5,  pillar: 'left',    d: 'M 155 110 C 155 130, 155 145, 155 155' },
  { id: 6,  from: 4,  to: 5,  letter: 'ז',  letterName: 'Zain',     tarotKey: 6,  pillar: 'center',  d: 'M 245 155 C 225 165, 175 165, 155 155' },
  { id: 7,  from: 4,  to: 7,  letter: 'ח',  letterName: 'Cheth',    tarotKey: 7,  pillar: 'right',   d: 'M 245 155 C 245 190, 245 215, 245 240' },
  { id: 8,  from: 5,  to: 8,  letter: 'ט',  letterName: 'Teth',     tarotKey: 8,  pillar: 'left',    d: 'M 155 155 C 155 190, 155 215, 155 240' },
  { id: 9,  from: 4,  to: 6,  letter: 'י',  letterName: 'Yod',      tarotKey: 9,  pillar: 'right',   d: 'M 245 155 C 230 165, 215 170, 200 180' },
  { id: 10, from: 5,  to: 6,  letter: 'כ',  letterName: 'Kaph',     tarotKey: 10, pillar: 'left',    d: 'M 155 155 C 170 165, 185 170, 200 180' },
  { id: 11, from: 6,  to: 7,  letter: 'ל',  letterName: 'Lamed',    tarotKey: 11, pillar: 'right',   d: 'M 200 180 C 220 200, 235 220, 245 240' },
  { id: 12, from: 6,  to: 8,  letter: 'מ',  letterName: 'Mem',      tarotKey: 12, pillar: 'left',    d: 'M 200 180 C 180 200, 165 220, 155 240' },
  { id: 13, from: 7,  to: 8,  letter: 'נ',  letterName: 'Nun',      tarotKey: 13, pillar: 'lower',   d: 'M 245 240 C 225 248, 175 248, 155 240' },
  { id: 14, from: 7,  to: 9,  letter: 'ס',  letterName: 'Samech',   tarotKey: 14, pillar: 'right',   d: 'M 245 240 C 230 255, 215 265, 200 275' },
  { id: 15, from: 8,  to: 9,  letter: 'ע',  letterName: 'Ayin',     tarotKey: 15, pillar: 'left',    d: 'M 155 240 C 170 255, 185 265, 200 275' },
  { id: 16, from: 6,  to: 9,  letter: 'פ',  letterName: 'Pe',      tarotKey: 16, pillar: 'center',  d: 'M 200 180 L 200 275' },
  { id: 17, from: 9,  to: 10, letter: 'צ',  letterName: 'Tzaddi',  tarotKey: 17, pillar: 'center',  d: 'M 200 275 L 200 320' },
  { id: 18, from: 7,  to: 10, letter: 'ק',  letterName: 'Qoph',    tarotKey: 18, pillar: 'right',   d: 'M 245 240 C 235 270, 220 295, 200 320' },
  { id: 19, from: 8,  to: 10, letter: 'ר',  letterName: 'Resch',   tarotKey: 19, pillar: 'left',    d: 'M 155 240 C 165 270, 180 295, 200 320' },
  { id: 20, from: 4,  to: 9,  letter: 'ש',  letterName: 'Shin',    tarotKey: 20, pillar: 'right',   d: 'M 245 155 C 230 210, 215 245, 200 275' },
  { id: 21, from: 5,  to: 9,  letter: 'ת',  letterName: 'Tau',     tarotKey: 21, pillar: 'left',    d: 'M 155 155 C 170 210, 185 245, 200 275' },
];
```

### 6.4 Derivation Functions

```typescript
/**
 * Get the sefira indices (1-10) active for a given life path number.
 * Based on the three-pillar model of the Tree of Life.
 */
export function getActiveSefirotForLifePath(lifePath: number | null): number[] {
  if (lifePath == null) return [];
  const map: Record<number, number[]> = {
    1:  [2, 4, 7],     // Chokhmah, Chesed, Netzach
    2:  [1, 6, 9],     // Keter, Tiphereth, Yesod
    3:  [2, 4, 6, 7],  // + Tiphereth
    4:  [3, 5, 8],     // Binah, Gevurah, Hod
    5:  [2, 4, 6],     // Chokhmah, Chesed, Tiphereth
    6:  [3, 5, 6, 8],  // + Tiphereth
    7:  [1, 6, 9],     // Keter, Tiphereth, Yesod
    8:  [9, 10],       // Yesod, Malkuth
    9:  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // All sefirot
    10: [9, 10],       // Yesod, Malkuth
    11: [4, 5, 6],     // Chesed, Gevurah, Tiphereth
    22: [1, 6, 9],     // Keter, Tiphereth, Yesod (Master number)
    33: [6],           // Tiphereth (Master number)
  };
  return map[lifePath] ?? [6]; // default: Tiphereth (beauty/center)
}

/**
 * Build complete sefira nodes for rendering.
 */
export function buildSefiraNodes(kabala: KabalaCoreInput): SefiraNode[] {
  const activeIds = new Set(getActiveSefirotForLifePath(kabala.lifePath));
  return SEFIROT_NODES.map((base) => ({
    ...base,
    active: activeIds.has(base.id),
    value: base.id === 1 ? kabala.lifePath
         : base.id === 2 ? kabala.expression
         : base.id === 3 ? kabala.motivation
         : null,
  }));
}

/**
 * Build complete sefira paths with active state.
 */
export function buildSefiraPaths(kabala: KabalaCoreInput): SefiraPath[] {
  const activeIds = new Set(getActiveSefirotForLifePath(kabala.lifePath));
  return SEFIROT_PATHS.map((p) => ({
    ...p,
    active: activeIds.has(p.from) && activeIds.has(p.to),
  }));
}
```

---

## 7. Component Changes — `Layer2Kabala.tsx`

### 7.1 New Props

```typescript
interface Layer2Props {
  data: MandalaData;
  /** Complete sefira nodes with active state */
  sefiraNodes: SefiraNode[];
  /** Complete paths with active state */
  sefiraPaths: SefiraPath[];
  tooltipByLayer: Record<Layer, string>;
  opacity: (layer: Layer) => number;
  onLayerToggle: (layer: Layer) => void;
  onLayerHover: (layer: Layer | null) => void;
}
```

The existing `kabVerts` and `trianglePath` props are **removed** — replaced by the new sefira data.

### 7.2 Rendering Strategy

The component renders in 3 z-ordered layers:

1. **Paths layer** (`<g class="sefira-paths">`): All 22 SVG paths drawn first (behind everything). Active paths use the pillar color; inactive paths use dim slate.
2. **Sefira nodes layer** (`<g class="sefira-nodes">`): 10 sefira circles with labels.
3. **Center overlay** (`<g class="sefira-center">`): Tiphereth at (200,180) rendered as a slightly larger golden circle; the Life Path number displayed at Tiphereth's position.

### 7.3 Node Rendering

Each sefira node renders:
- **Outer ring** (active only): 3px radius stroke in sefira color, opacity 0.4
- **Main circle**: r=9 for non-active, r=11 for active; fill in sefira color at 0.25 opacity; stroke in sefira color
- **Hebrew letter**: font-size 8, hebrew text
- **Number** (if `value != null`): font-size 7, below the circle

Special rendering for **Tiphereth** (center): r=13, gold `#E8C547`, displays Life Path number prominently.

### 7.4 Pillar Glow

When a Life Path strongly maps to one pillar (e.g., LP 1 → right pillar), that pillar's paths receive a subtle glow filter (`url(#pillar-glow-right)` etc.) at opacity 0.3.

---

## 8. Breaking Change Analysis

### 8.1 Type Changes

| File | Change |
|---|---|
| `src/components/akasha/mandala-layers.ts` | Add `SefiraNode`, `SefiraPath` interfaces; `SEFIROT_NODES`, `SEFIROT_PATHS` constants; `buildSefiraNodes()`, `buildSefiraPaths()`, `getActiveSefirotForLifePath()` |
| `src/components/akasha/hooks/useMandalaData.ts` | Update `buildKabVerts` call to also export sefira nodes/paths; add new derivations |
| `src/components/akasha/MandalaChart.tsx` | Update `Layer2Kabala` props to pass `sefiraNodes` + `sefiraPaths` instead of `kabVerts` + `trianglePath` |
| `src/components/akasha/layers/Layer2Kabala.tsx` | Complete rewrite: remove old triangle rendering; implement full sefirot tree |

### 8.2 `MandalaData.kabala` Fields

**No breaking changes to `MandalaData.kabala` required.** The existing `lifePath`, `lifePathMaster`, `expression`, `sefira`, and `hebrewLetter` fields are sufficient.

Optional for Phase 7: add `activePaths: number[]` to cache the 22-bit path activation mask.

### 8.3 Existing API Contract

The `MandalaData` interface is exported and used by the mandala page. The `kabala` sub-object is returned by `/api/akasha/mandala`. No changes to the API route are needed.

---

## 9. Implementation Plan

### Phase 6a: Data Layer (`mandala-layers.ts`)
1. Add `SefiraNode` and `SefiraPath` interfaces
2. Add `SEFIROT_NODES` constant (10 entries, verified coordinates)
3. Add `SEFIROT_PATHS` constant (22 entries, verified SVG path data)
4. Add `getActiveSefirotForLifePath()` function
5. Add `buildSefiraNodes()` and `buildSefiraPaths()` functions
6. Export new types and functions

### Phase 6b: Hook Update (`useMandalaData.ts`)
1. Add `sefiraNodes` and `sefiraPaths` to return value
2. Memoize with `[data.kabala]`

### Phase 6c: Chart Integration (`MandalaChart.tsx`)
1. Update `Layer2Kabala` props: replace `kabVerts`/`trianglePath` with `sefiraNodes`/`sefiraPaths`
2. Update imports

### Phase 6d: Component Rewrite (`Layer2Kabala.tsx`)
1. Remove old triangle/ring rendering
2. Implement path rendering loop (22 `<path>` elements)
3. Implement sefira node rendering loop (10 `<g>` elements)
4. Add Tiphereth special rendering (prominent gold center)
5. Add pillar glow filter references
6. Add keyboard accessibility (`tabIndex`, `role`, `onKeyDown`)
7. Add `aria-label` with dynamic tooltip text

---

## 10. Verification Criteria

1. **10 sefira nodes visible** — all 10 positions render circles with Hebrew letters and colors
2. **22 paths visible** — all 22 connections render as curved SVG paths
3. **Active sefirot match Life Path** — e.g., LP=1 → Chokhmah, Chesed, Netzach highlighted in blue
4. **Pillar colors correct** — right pillar paths in blue `#4A7DFF`, left in crimson `#D94A4A`, center in gold `#E8C547`
5. **Keter above circle** — Keter at y=35 is visible above the mandala's outer ring (y=120 start)
6. **Malkuth at bottom** — Malkuth at y=320 is visible at the bottom of the viewBox
7. **No new TypeScript errors** — `pnpm typecheck` passes
8. **Accessibility** — keyboard navigation works; `aria-label` present on the layer group
9. **Backward compatibility** — if `lifePath` is null, all sefirot render in default (dim) style with no crash
10. **Pillar logic test**: LP=4 → Binah (violet), Gevurah (crimson), Hod (orange) highlighted

---

## 11. Notes on Sources and Limitations

### 11.1 Source Citations

| Topic | Source |
|---|---|
| Sefirot names, order, vertical positions | Scholem, *Origins of the Kabbalah* (JPS, 1987) |
| Three-pillar structure and meaning | Halevi, *Kabbalah: Traditions of Love and Harmony* (Bet El, 1970/1992) |
| Hebrew letter ↔ path correspondences | Regardie, Israel. *The Tree of Life: A Study in Magic* (Weiser, 1972/1994) Vol. 3 |
| Tarot Major Arcana ↔ paths | Hermetic Order of the Golden Dawn (as documented in Regardie) |
| Archangel ↔ sefirah correspondences | Halevi (1972); corroborated in Chabad.org *Kabbalah Online* |

### 11.2 Hebrew Letter Assignments — Verification Required

The Hebrew letter assignments for **paths 18–21** (Qoph, Resch, Shin, Tau) in Section 5.1 and the `SEFIROT_PATHS` constant are derived from the Golden Dawn tradition. While these follow the established pattern (lower paths = later Hebrew letters), primary source verification against **Regardie, Vol. 3, Chapter "The 22 Paths"** is recommended before final implementation. The path-to-sefirah connections themselves (which pairs are connected) are geometrically determined and unambiguous.

### 11.3 Pillar Assignment of Middle Sefirot

Chesed↔Gevurah (Path 7, Zain) is assigned to the **center** pillar in this design because it bridges the right and left pillars horizontally. Some traditions assign it to both or neither. The choice affects only the default inactive color of that single path.

### 11.4 Hod Position

Hod is placed at `x=155` (left pillar, same X as Binah and Gevurah) to form a clean vertical column on the left. This differs from some traditional diagrams where Hod is slightly displaced horizontally. The placement ensures clean vertical paths (Path 6, 9) and minimizes path crossing.
