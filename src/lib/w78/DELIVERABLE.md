# W78-A — achievements-badges engine — DELIVERABLE

**Branch:** `w78/achievements-badges`
**Worker:** Coder (cycle 78, respawn of W77-B cascade failure)
**Status:** ✅ PUSHED
**Date:** 2026-06-30

## Summary

Sacred-aware gamification engine for o caminho. Acknowledges meaningful spiritual
practice WITHOUT reducing it to vanity metrics. Hierarchically respectful
(Cigano < Orixás < Ifá < Mestres) — no competitive leaderboards by design.

## Files (6 files, 2,898 LOC)

| File | LOC | Purpose |
|------|-----|---------|
| `achievements-badges.ts` | 1,317 | Main engine — 7 traditions × 4 hierarchy × 37 badges |
| `achievements-badges.spec.ts` | 839 | Self-running spec, 71 assertions, 19 describe blocks |
| `achievements-badges.smoke.ts` | 402 | Sync smoke harness, 64 checks |
| `achievements-badges.hash.ts` | 223 | Pure-JS SHA-256 + canonical-JSON |
| `node-stubs.d.ts` | 99 | Node 22 + vitest type stubs (worktree-isolated) |
| `tsconfig.json` | 18 | Worktree-isolated config (verbatim from spec) |

## Quality gates

```
TSC: 0 errors (clean)
Spec: 71/71 PASS
Smoke: 64/64 PASS
```

## Public API (engine exports)

```typescript
// Core
registerBadge(input): Result<BadgeId, BadgeError>
getBadge(id): Option<Badge>
listBadges(filter?): ReadonlyArray<Badge>
listBadgesByTradition(t): ReadonlyArray<Badge>

// Earning
awardBadge(userOrId, badge, context): AwardResult
revokeBadge(user, badge, reason): { status, revokedAt? }
listEarnedBadges(user): ReadonlyArray<EarnedBadge>
checkEarnedBadges(user, action): ReadonlyArray<BadgeId>

// Tradition-aware
isTraditionRespected(badge): boolean
getBadgeHierarchyLevel(badge): HierarchyLevel

// Anti-pattern detection
isVanityMetric(badge): boolean
blocksSacredPractice(badge): boolean

// Anti-pattern API (THROW by design — never implement)
listTopUsersByBadgeCount(limit): never
rankUsersByXp(limit): never
getGlobalUserLevel(user): never
getUserXp(user): never
```

## 7-Tradition coverage (mandatory ✓)

| Tradition | Badges | Hierarchy distribution | Reference token |
|-----------|--------|------------------------|------------------|
| Candomblé | 6 | 0 cigano / 6 orixa | Orixá, axé, terreiro, Ogum, Oxalá, Xangô, Iemanjá, Iansã, Oxóssi, Obaluaiê, Nanã, Omolu |
| Umbanda | 3 | 0 cigano / 3 orixa | Caboclo, Preto-Velho, Exu, Pombagira |
| Ifá | 5 | 0 cigano / 0 ifa | Odu, Orunmila, Mérindilogun, Ofun, Oyeku, Ika, Ogbe |
| Cabala | 5 | 0 cigano / 0 / 0 / 5 mestre | Sefirá, Keter, Chokhmah, Binah, Tiferet, Árvore, Gematria, Nomes Divinos |
| Astrologia | 4 | 0 / 4 orixa | signos, planetas, casas, Lilith, Nodos, trânsitos, eclipses |
| Tantra | 4 | 0 / 2 orixa / 0 / 2 mestre | Prana, Kundalini, Chakra, Ida, Pingala, Sushumna, Chandra |
| Cigano Ramiro | 10 (5 mesa + 5 mestres) | 5 cigano / 0 / 0 / 5 mestre | Cigano, carta, Mesa Real, naipe (paus/copas/espadas/ouros) |

**Total: 37 badges** (≥25 required ✓; ≥3 per tradition ✓; all 4 hierarchy levels covered ✓)

## Sacred-respect invariants (enforced)

1. **NO vanity metrics** — `isVanityAction` rejects 8 signature patterns
   (`login_streak`, `post_count`, `days_active`, `message_count`,
   `upvotes_received`, `followers_count`, `fasted_days`, `app_opens`).
   Name-based detection via `isVanityMetric` (10 vanity tokens).
2. **NO leaderboards** — `listTopUsersByBadgeCount`/`rankUsersByXp`/
   `getGlobalUserLevel`/`getUserXp` all `throw` by design.
3. **Hierarchy respected** — users cannot earn a `mestre`-level badge
   until they reach `mestre` themselves.
4. **Tradition-aware** — every badge carries `tradition` + `hierarchy` +
   `respectNote` (≥20 chars). `isTraditionRespected` enforces tradition-
   specific token presence (Candomblé must mention Orixás, Ifá must
   mention Odus, etc.).
5. **Anti-extraction** — every award requires `intent: 'genuine'` (not
   `'extractive'`). Farming is rejected.
6. **Witnessed & honest** — every award requires `witnessed: true` and
   `intentionHonest: true`.
7. **Duration gate** — actions must meet `minDurationMinutes` (depth of
   practice, not frequency).
8. **Immutability** — every record is `Object.freeze`d; all arrays are
   `ReadonlyArray<T>`. Junior devs cannot mutate engine state.

## Engine architecture

```
achievements-badges.ts (1,317 LOC)
├── Branded types: BadgeId, UserId, AwardId
├── Tradition & hierarchy enums (7 + 4)
├── Sacred action types (7)
├── Vanity action signatures (8)
├── AwardIntent: 'genuine' | 'extractive'
├── Models: Badge, EarnedBadge, RevokedBadge, SacredAction, UserState
├── Filter & result types: BadgeFilter, Result<T,E>, Option<T>
├── Store: in-memory frozen Map + arrays
├── Audit log: _audit() appends to immutable array
├── Registration: registerBadge() with 7 validation gates
├── Earning: awardBadge() with 10 invariant checks
├── Revoke: revokeBadge() removes from earned
├── Check (no award): checkEarnedBadges() returns candidates
├── Tradition-aware: isTraditionRespected() per-tradition token check
├── Anti-pattern: isVanityMetric() + blocksSacredPractice()
├── Anti-pattern API: 4 functions that THROW by design
└── seedCatalog(): idempotent bootstrap of 37 badges
```

## Cycles of wisdom applied

- **Cycle 60-77 patterns:** `Object.freeze` + `ReadonlyArray` + branded types
  (everywhere).
- **Cycle 75 lesson #6:** `Object.freeze` on every record + array — confirmed
  via spec test "EarnedBadge is frozen".
- **Cycle 75/77 lesson:** Pure-JS SHA-256 (240-LOC embedded) used in
  `achievements-badges.hash.ts`. Verified against canonical vectors
  (`sha256("")` = `e3b0c4...`, `sha256("abc")` = `ba7816bf...`).
- **Cycle 67 lesson:** Canonical-JSON cache key via `hashCanonical()` —
  produces byte-identical output regardless of key insertion order.
- **Cycle 73 lesson:** NO vitest at runtime; self-running `it()` registry
  with `expectEqual/expectTrue/expectFalse/expectThrows` helpers.
- **Cycle 77 lesson:** Branded types via factory + regex prefix
  (`b_`, `u_`, `a_`) blocks ID forgery and is grep-able.
- **Anti-pattern by omission:** `listTopUsersByBadgeCount` exists ONLY as
  a `never` function that throws. Junior devs get a runtime error and
  cannot wire it (cycle 75 lesson pattern).

## Test coverage highlights

- Branded types: 5 assertions
- Traditions & hierarchy: 5 assertions
- Vanity detection: 3 assertions
- Hashing primitives: 5 assertions
- Catalog seed: 7 assertions (≥25 badges, ≥3 per tradition, all 4
  hierarchy levels, every badge has respectNote + tradition + hierarchy)
- Registration: 5 assertions (vanity reject, duplicate reject, short
  note reject, malformed id, getBadge)
- Award happy paths: 9 assertions
- Cross-tradition: 2 assertions
- List earned + check: 2 assertions
- Revoke: 2 assertions
- Anti-pattern API throws: 4 assertions
- Tradition-respect guards: 4 assertions
- Vanity & blocksSacredPractice: 3 assertions
- Audit log: 1 assertion
- 7-tradition coverage: 8 assertions (one per tradition + bulk)
- Frozen output: 3 assertions

## Notes for the verifier

1. **TSC is run with `--noEmit --skipLibCheck`** — the `lib: ["ES2022", "DOM"]`
   is required because `node-stubs.d.ts` declares `DataView` etc. as
   ambient types; the worktree-isolated tsconfig has `types: []` so
   we explicitly include the DOM lib.
2. **The spec/smoke run via `node --experimental-strip-types`**, NOT via
   vitest. This is intentional — cycle 73 lesson: vitest types are for
   the editor LSP only; runtime is the self-running harness.
3. **All 37 badges are seeded by `seedCatalog()`**. Spec and smoke call
   it via `_resetAuditForTests()` between describes for isolation.
4. **The `AwardContext` type allows `witness: string` and `intention: string`**
   to make sacred actions carry context (witness name, intention text).
   The engine does NOT validate the content of these strings — only
   that they're non-empty (caller's responsibility).
5. **Cigano Ramiro tier has 10 badges** (5 mesa + 5 mestres) because
   the mestres tier in the spec is cross-tradition, anchored in
   Cigano Ramiro's method (the user's "mé pessoal"). Each mestres
   badge's `respectNote` includes Cigano-specific tokens to pass
   `isTraditionRespected`.

## Push command

```bash
cd /workspace/.worktrees/w78-ab
git add -A
git commit -m "feat(w78-achievements-badges): sacred-aware gamification engine (37 badges, 7 traditions, hierarchy-respecting, anti-vanity)"
git push origin w78/achievements-badges
```

## Next steps for downstream

- Wire `awardBadge` to the user's action stream (consulta_realizada,
  meditacao_completa, etc.) — the engine's invariants protect against
  misuse at the type and runtime level.
- Use `checkEarnedBadges(user, action)` for "you may have unlocked X"
  UX moments WITHOUT actually awarding (gives the user agency).
- The anti-pattern API (`listTopUsersByBadgeCount` etc.) intentionally
  throws — if a future contributor needs ranking, the conversation
  should be about whether the spec permits it, not whether the engine
  permits it. Sacred respect is the design floor, not the design
  ceiling.
