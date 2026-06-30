# W76-B — Reputation Universalist · DELIVERABLE

**Cycle:** 76 · **Date:** 2026-06-30 · **Worker:** W76-B (Mavis session 414698242793714)
**Branch:** `w76/reputation-universalist` · **SHA:** `c061c99a530deb0af9788f0eb3e28363cb118535`
**Status:** ✅ DELIVERED · PUSHED · 1528 LOC · 41/41 spec + 44/44 smoke PASS

---

## 1. Mission

Build a **multi-domain, time-weighted reputation system** that respects ALL 7 traditions WITHOUT ranking one above another. The hard constraint is **UNIVERSALISM** — no tradition is ever a score dimension.

## 2. Files shipped (1528 LOC total)

| File | LOC | Purpose |
|------|-----|---------|
| `src/lib/w76/reputation-universalist.ts` | 627 | Engine: types, anti-gating, decay, leaderboards, elder veto |
| `src/lib/w76/reputation-universalist.spec.ts` | 633 | Self-running spec — 41 assertions |
| `scripts/smoke/w76-reputation-universalist.ts` | 166 | Smoke harness — 44 inline checks |
| `src/lib/w76/node-stubs.d.ts` | 82 | Worktree-isolated Node/vitest type stubs |
| `src/lib/w76/tsconfig.json` | 19 | Worktree-isolated TSC config |

## 3. Engine design

### 3.1 Multi-domain reputation — 5 domains

| Domain | λ (per day) | windowDays | maxWeight | Sacred-rhythm note |
|--------|------------|-----------|-----------|---------------------|
| `contributions` | 0.003 | 365 | 25 | Standard — posts/comments decay at standard pace |
| `mentorship` | 0.002 | 365 | 50 | Slower decay — pair completions build durable wisdom |
| `ritual-knowledge` | **0.001** | 365 | **75** | **Slowest decay** — tradition knowledge is sacred |
| `peer-help` | 0.005 | 365 | 15 | Fastest decay — answers/translations fade as ecosystem evolves |
| `sacred-content-quality` | 0.0025 | 365 | 30 | Medium — Akashia readings carry mid-life weight |

### 3.2 Universalism gates (HARD CONSTRAINTS)

1. **No global "top user" ranking.** `listTopContributorsGlobal()` exists ONLY as a `never` throw — universalism hard rule.
2. **Tradition is a TAG, never a score dimension.** `listTopContributors(tradition, domain)` filters by tradition tag at query time; weight is not multiplied by tradition rarity.
3. **Opt-out per (userId, domain)** honored at both `awardReputation` (returns `applied=false`) and `listTopContributors` (filtered out).
4. **Tradition-elder veto** requires 2 elders from the SAME tradition; audited; on approval, user is auto-opted-out of `ritual-knowledge`.

### 3.3 Anti-gating (enforced inside `awardReputation`)

- Self-award blocked → `SELF_AWARD`
- Max 5 events per peer per UTC day → `RATE_LIMIT`
- Tradition must be one of 7 → `UNKNOWN_TRADITION`
- Domain must be one of 5 → `UNKNOWN_DOMAIN`
- Weight must be in (0, maxWeight] → `INVALID_WEIGHT`
- Opt-out honored → `applied=false, reason=OPT_OUT`

### 3.4 Time-weighted decay

`score(t) = Σ (eventWeight · exp(-λ · daysAgo))` over rolling 12-month window.

### 3.5 Sacred coverage

- **7 traditions:** Candomblé, Umbanda, Ifá, Cabala, Astrologia, Tantra, Cigano
- **≥30 sacred terms** correctly cased + accented in `SACRED_TERM_WHITELIST` (Orixá, Babalorixá, Yalorixá, Oxalá, Iansã, Oxum, Exu, Ogum, Caboclo, Preto-Velho, Pomba-Gira, Sete Linhas, Três Reis, Ifá, Orunmila, Bàbá, Sephirot, Kether, Chokmah, Binah, Tiferet, Ascendente, Lilith, Meio-do-Céu, Nodo Lunar, Bodhisattva, Mantra, Kundalini, Cigano, Tarô)

### 3.6 Audit log

- Append-only `AUDIT` array; every entry is `Object.freeze({...})`
- `exportAudit()` returns frozen outer array — push/mutation throws in strict mode

## 4. Verification

| Gate | Result |
|------|--------|
| Worktree-isolated `tsc --noEmit --skipLibCheck -p src/lib/w76/tsconfig.json` | **0 errors** |
| Pre-spawn TSC (whole project) | 3 lines (unchanged baseline — vitest/globals types missing in repo root) |
| Spec: `node --experimental-strip-types reputation-universalist.spec.ts` | **41/41 PASS** (0 fail) |
| Smoke: `node --experimental-strip-types scripts/smoke/w76-reputation-universalist.ts` | **44/44 PASS** (0 fail) |
| Push | ✅ `w76/reputation-universalist` → SHA `c061c99` |

## 5. Public API

```ts
awardReputation(eventInput) → AwardResult   // anti-gating + audit
getReputation(userId, domain, now?) → ReputationScore
listTopContributors(tradition, domain, limit, now?) → ReadonlyArray<Contributor>
listTopContributorsGlobal() → never  // HARD FORBIDDEN — universalism gate
requestRemoval({ targetUserId, tradition, reason, requestedBy, cosignedBy }) → RemovalRequest
decideRemoval(requestId, 'approved' | 'rejected', decidedBy, now?) → RemovalRequest
registerElder(userId, tradition, now?) → Elder
listElders(tradition?) → ReadonlyArray<Elder>
isElder(userId, tradition) → boolean
elderCount(tradition) → number
optOut(userId, domain) / optIn(userId, domain) / isOptedOut(userId, domain)
scoreWithDecay(events, λ, windowDays, now) → number  // pure utility
decayWeight(weight, ageDays, λ) → number              // pure utility
exportAudit() → ReadonlyArray<Readonly<Record<string, unknown>>>
```

All exported types use `Object.freeze` + `ReadonlyArray`. IDs are branded (`UserId`, `EventId`, `RemovalRequestId`).

## 6. Durable lessons (cycle 76)

1. **Universalism is enforced by omission, not just assertion.** The `listTopContributorsGlobal()` function exists ONLY as a `never` throw. If a junior dev tries to wire a "Top 100" widget, they hit a compile-time return-type error at the call site — that's the gate. Cycle 73-style "positive narrowing" applied to API surface design.

2. **Elder veto as opt-out, not deletion.** Approval of a removal request sets `optOut(target, 'ritual-knowledge')` rather than mutating or deleting events. Events stay in the audit log forever (provenance); the contributor's CURRENT visibility drops to zero. Reversible, transparent, auditable.

3. **Sacred rhythm via per-domain λ.** ritual-knowledge decays slowest (λ=0.001) because tradition-specific knowledge is the most durable; peer-help decays fastest (λ=0.005) because answers evolve with the ecosystem. The asymmetry is INTENTIONAL — it encodes the project's belief that sacred tradition > tactical help in long-term value.

4. **`public readonly code:` constructor params banned by strip-types.** Confirms cycle 75 lesson: refactor to `readonly code: T; constructor(code: T, message: string) { this.code = code; super(message); }`. Otherwise `node --experimental-strip-types` ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX before any test runs.

5. **Rate limit scoped by UTC day, not 24h rolling window.** `dayBucket(iso) = iso.slice(0,10)` is the simplest correct implementation. 24h rolling is more precise but requires storing every timestamp and walking a queue; day-bucketing accepts ±23h jitter, which is acceptable for anti-gaming because attackers don't gain much by waiting until 23:59 UTC.

---

## 7. Notes for Verifier

- Spec & smoke are SELF-RUNNING (no vitest required). They use `declare const process: { exit(code: number): never };` and a registry pattern from cycle 73.
- Run the spec: `cd src/lib/w76 && node --experimental-strip-types --no-warnings reputation-universalist.spec.ts`
- Run the smoke: `cd /tmp/w76-b && node --experimental-strip-types --no-warnings scripts/smoke/w76-reputation-universalist.ts`
- TSC worktree: `cd src/lib/w76 && tsc --noEmit --skipLibCheck -p tsconfig.json` → 0 errors.
- `Object.freeze` test: any attempt to mutate a `ReputationScore`, `Contributor`, `RemovalRequest`, or audit-log entry throws in strict mode.
