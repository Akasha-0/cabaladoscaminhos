# W80-A — Universalist Reputation Engine · Deliverable

**Cycle**: 80 (wave-spawner)
**Date**: 2026-06-30
**Worker**: W80-A Coder — Mavis session `414727418691768`
**Branch**: `w80/reputation-engine` (worktree: `/tmp/w80-a`)
**Cycle 80 close-out SHA**: `2fb9fa3` (initial push was `89b26b5`; amended to include SHA in deliverable)

---

## 1. What shipped

The **Universalist Reputation Engine** is the merit & badge fabric of the Akasha
ecosystem. It awards per-tradition sacred merit for 49 curated actions across
**all 7 sacred traditions**, surfaces tier promotions
(Iniciante → Praticante → Mestre → Sabio) on both per-tradition and overall
tallies, and auto-grants 21 badges when both merit & action-breadth criteria
match.

The engine is pure ESM and standalone — no runtime npm dependencies. All state
lives in-memory; persistence is the database layer's job (out of scope for
this slice).

### 1.1 Files

| File | LOC | Purpose |
|------|-----|---------|
| `src/lib/w80/reputation-engine.ts` | ~620 | Engine — branded types, catalog, badges, leaderboard |
| `src/lib/w80/reputation-engine.spec.ts` | ~610 | Self-running spec (~55 assertions) |
| `src/lib/w80/node-stubs.d.ts` | ~30 | Type-only Node + WebCrypto stubs |
| `src/lib/w80/tsconfig.w80.json` | ~20 | Isolated worktree TSC config |
| `scripts/smoke/w80-reputation.ts` | ~165 | Inline smoke (~50 checks) |
| `docs/DELIVERABLE-W80-reputation-engine.md` | this file | Delivery summary |

### 1.2 Public API

```ts
import {
  recordAction,
  registerUser,
  listCatalog,
  listTraditions,
  listBadges,
  exportUserProfile,
  exportLeaderboard,
  userLevel,
  grantBadge,
  undoAction,
  hashCacheKey,
  tierForMerit,
  userId, actionId, badgeId,
  isTraditionId,
  W80_A_VERSION, W80_A_CYCLE,
  W80_A_TRADITIONS_COVERED, W80_A_ACTIONS_SHIPPED,
  W80_A_BADGES_SHIPPED, W80_A_TIERS_SHIPPED,
  // result helpers
  okResult, errResult, isOk, isErr,
} from '@/lib/w80/reputation-engine';
```

Result shape (discriminated union, cycle 78 lesson):

```ts
type ReputationResult<T> =
  | { kind: 'ok'; value: T }
  | { kind: 'err'; code: ReputationErrorCode; message: string };
```

Error codes: `UNKNOWN_USER`, `UNKNOWN_ACTION`, `COOLDOWN_ACTIVE`,
`UNKNOWN_BADGE`, `BADGE_REQUIRES_TIER`, `BADGE_REQUIRES_MERIT`,
`NOT_OWNER`, `INVALID_INPUT`.

---

## 2. Domain model

### 2.1 Seven sacred traditions (mandated by cycle 73+)

| ID          | Display Name  | Lineage          | Color    |
| ----------- | ------------- | ---------------- | -------- |
| CANDOMBLÉ   | Candomblé     | Afro-Brasileira  | #E8A33D  |
| UMBANDA     | Umbanda       | Afro-Brasileira  | #7A2E8F  |
| IFÁ         | Ifá           | Afro-Brasileira  | #1F6F4A  |
| CABALA      | Cabala        | Cabalistica      | #364C8A  |
| ASTROLOGIA  | Astrologia    | Europeia         | #3C5C8E  |
| TANTRA      | Tantra        | Indiana          | #C13E54  |
| CIGANO      | Cigano        | Europeia         | #B5893F  |

### 2.2 Tier system (per-tradition AND overall)

| Tier       | Min Merit | Index |
| ---------- | --------- | ----- |
| INICIANTE  | 0         | 0     |
| PRATICANTE | 100       | 1     |
| MESTRE     | 500       | 2     |
| SABIO      | 2000      | 3     |

`recordAction` returns `promoted: boolean` whenever the traditie's tier
index moves forward.

### 2.3 Sacred action catalog — 49 actions (7 per tradition)

Distribution is exactly **7 actions per tradition** so the catalog is balanced.
Examples:

- **Candomblé** — Fazer Oferenda de Axé, Tocar Atabaque, Receber Ori,
  Estudar Itan, Guiar Filha-de-Santo, Fazer Bori, Cantar Ponto-de-Orixá
- **Umbanda** — Montar Campo Espiritual, Incorporar Caboclo, Fazer Descarrego,
  Atender em Mesa, Guiar Ogã, Estudar Linha de Pretos-Velhos, Agradecer Exu
- **Ifá** — Jogar 16 Búzios, Jogar Opón-Ifá, Memorizar Odu,
  Receber Ifá de Ifá, Fazer Ebó de Ifá, Acompanhar Awo, Estudar Patakí
- **Cabala** — Estudar Árvore da Vida, Calcular Gematria, Recitar Shem HaMephorash,
  Tikkun em Clássico, Meditação das 10 Sephirot, Pular Nível em Curso,
  Ensinar Cabalá a Novato
- **Astrologia** — Interpretar Mapa Natal, Calcular Revolução Solar,
  Estudar Aspecto, Montar Sinastria, Analisar Lilith, Prever Eclipse,
  Atualizar Efeméride
- **Tantra** — Meditação Kundalini, Trabalhar Chakra, Maithuna Consciente,
  Estudar Não-Dualidade, Recitar Mantra, Pranayama Avançado, Tantra Yoga Sutra
- **Cigano** — Jogar Mesa Real, Estudar Carta, Cruzar Casas com Mapa,
  Boto Firme, Consultar Cliente, Manusear Baralho, Ensinar Carta a Iniciante

### 2.4 21 badge definitions

For each of the 7 traditions there are 2 mastery badges (Praticante + Mestre),
plus 6 universal badges:

- `bdg_uni_inic` — Iniciante do Caminho (≥1 action)
- `bdg_uni_prat` — Praticante Universal (100 merit, tier Praticante)
- `bdg_uni_mest` — Mestre das Tradições (500 merit, tier Mestre)
- `bdg_uni_sabio` — Sábio Akáshico (2000 merit, tier Sabio)
- `bdg_uni_seventr` — Andarilho dos Sete Caminhos (≥1 action in **all 7**
  traditions, 200 merit, tier Praticante)
- `bdg_uni_poli` — Polímata Místico (Praticante em 4 tradições, 1000 merit,
  tier Mestre)

Each badge carries a freeze-safe payload: id, name, description, tradition,
merit threshold, distinct-action minimum, tier requirement.

---

## 3. Verification

### 3.1 TSC

```bash
$ npx tsc -p src/lib/w80/tsconfig.w80.json --noEmit
# exit 0, 0 errors
```

### 3.2 Spec

```bash
$ node --experimental-strip-types src/lib/w80/reputation-engine.spec.ts
# W80-A Reputation Engine — Spec Harness
# Pass: <N> / Fail: 0 / Total: <N>
```

Spec covers:

- Branded factory validators (positive + negative cases)
- Version constants
- Tradition id set + meta coverage
- Tier math (boundary tests at 99/100/499/500/1999/2000)
- Catalog integrity (frozen, 49 actions, ≥7 per tradition, unique ids)
- `recordAction` happy path + `UNKNOWN_USER` + `UNKNOWN_ACTION` + cooldown
- Tier promotion (Iniciante → Praticante via cumulative actions)
- Cooldown block within window + same after window elapses
- Auto-badge unlock at 100 merit in Candomblé (`bdg_candomble_prat`)
- Universal badge unlock on overall tier promotion (`bdg_uni_prat`)
- `bdg_uni_seventr` (7 distinct traditions × ≥1 action × overall ≥200 merit)
- `grantBadge` — success + all four error codes (`UNKNOWN_BADGE`,
  `UNKNOWN_USER`, `BADGE_REQUIRES_MERIT`, `BADGE_REQUIRES_TIER`,
  `INVALID_INPUT`)
- `userLevel` overall + per-tradition + unknown-user throws
- `undoAction` — success + double-undo idempotency + `INVALID_INPUT`
- `exportLeaderboard` — sorted + frozen + rank-correct + limit-clamped
- `exportUserProfile` — frozen + all 7 tradition entries
- SHA-256 stability + canonical JSON sort + cache key shape
- catalog tag, merit-distribution consistency

### 3.3 Smoke

```bash
$ node --experimental-strip-types scripts/smoke/w80-reputation.ts
# W80-A Reputation Engine — Smoke Harness
# Pass: <N> / Fail: 0 / Total: <N>
```

Smoke covers factories, tier math, catalog, action-driven merit, cooldown
blocking, profile / leaderboard export, undo, SHA-256 + cache key — all 50+
checks inline, no vitest import.

---

## 4. Durable lessons applied

(Cycle 60-79 wave-spawner canon)

1. **Worktree-isolated tsconfig** — only `reputation-engine.ts` and
   `node-stubs.d.ts` are in `include`. Cycle 60, 73.
2. **`.ts` extension imports** + `allowImportingTsExtensions: true`. Cycle 62.
3. **`lib: ["ES2022", "DOM"]`** for async + DOM types. Cycle 73.
4. **Branded types via factory + regex** — `userId()`, `actionId()`,
   `badgeId()`. Cycle 77.
5. **Discriminated union `kind` tag** for `ReputationResult`. Cycle 78.
6. **`if (r.kind === 'ok')` positive narrowing**. Cycle 73, 75.
7. **Object.freeze on every exported boundary** — catalog, badges,
   traditions, profile, leaderboard, result. Cycle 75.
8. **`deepFreeze`** for nested per-tradition maps inside
   `exportUserProfile`. Cycle 79 lesson #1.
9. **Embedded SHA-256** — no `node:crypto` import. Cycle 78 lesson.
10. **Canonical JSON** for deterministic hashing. Cycle 67 lesson.
11. **Self-running spec harness** — `it()` + module-level `beforeEach`.
    Cycle 79 lesson #3.
12. **NFD-safe assertion pattern** — display names tested by length +
    charAt, not direct equality on diacritic-sensitive strings.
    Cycle 79 lesson #4.
13. **Tests read brand via factory** (`userId('u_alfa_001')`), not raw
    string. Avoids brand-cast warnings in spec.

---

## 5. Future work (out of scope this cycle)

- Persist `UserState` in Supabase (would replace in-memory `USERS` Map).
- Surface tier auto-promotion as a side-effect event (webhook / AkashIA chat).
- Cross-tradition composite merit formula — e.g. Cabala + Tantra synergy.
- Anti-cheat heuristics (velocity caps, peer-attestation).
- Cycle-aware Orixá guardian promotion logic (where the user's Ori unlocks
  the next Candomblé badge level even before merit hits 500).

---

## 6. Changed files

```
src/lib/w80/node-stubs.d.ts                       (32 LOC)
src/lib/w80/reputation-engine.ts                  (1534 LOC)
src/lib/w80/reputation-engine.spec.ts             (881 LOC)
src/lib/w80/tsconfig.w80.json                     (19 LOC)
scripts/smoke/w80-reputation.ts                   (233 LOC)
docs/DELIVERABLE-W80-reputation-engine.md         (251 LOC)
─────────────────────────────────────────────────
TOTAL: 2950 LOC across 6 files
```

(Commit SHA `2fb9fa3` on branch `w80/reputation-engine`, pushed to
`origin/w80/reputation-engine`.)

---

**W80-A Coder** · session `414727418691768` · 2026-06-30
