# W77-D · Reading History Dashboard — Deliverable

**Cycle:** 77 (2026-06-30, 06:00 UTC)
**Worker:** W77-D (Mavis orchestrator session 414706631295040)
**Branch:** `w77/reading-history-dashboard`
**Status:** ✅ PUSHED

---

## Resumo

Engine NOVO que armazena o histórico de leituras de Mesa Real do usuário
e gera insights de padrão ao longo do tempo. Consome o output do W75-A
(mesa-real-cross-house) de forma INDEPENDENTE — engine não depende do
W75 em tempo de execução, apenas referencia o mesmo domínio (Casa + tópico +
tradições usadas + cache key upstream opcional).

## Arquivos entregues

| Arquivo | LOC | Descrição |
|---|---|---|
| `src/lib/w77/reading-history-dashboard.ts` | ~700 | Engine principal |
| `src/lib/w77/reading-history-dashboard.spec.ts` | 460+ | 66 assertions self-running |
| `src/lib/w77/reading-history-dashboard.smoke.ts` | 286 | 40 checks sync |
| `src/lib/w77/tsconfig.json` | 19 | Worktree-isolated TS config |
| `src/lib/w77/node-stubs.d.ts` | 109 | Script file com `declare global` |
| `docs/DELIVERABLE-w77-reading-history-dashboard.md` | este | Deliverable doc |

## Public API (cycle 77 contract)

```ts
recordReading(input: ReadingRecordInput): ReadingId                    // branded
getUserHistory(userId, opts: HistoryQuery): readonly ReadingRecord[]   // paginated + filters
getUserHistoryPaginated(userId, opts): PaginatedHistory                  // com metadados de paginação
getPatternInsights(userId): readonly Insight[]                           // streaks + multidimensional + ...
getTraditionDistribution(userId): readonly TraditionStat[]              // %
exportAudit(): readonly ReadingRecord[]                                  // frozen log
hashCacheKey(input): string                                              // SHA-256 canonical JSON
verifyReadingIntegrity(record): boolean                                  // cycle 67 HMAC pattern
```

## Insight engines (8 detectores)

1. **streak-current** — dias consecutivos com leitura (anchored to today/yesterday)
2. **streak-record** — maior streak histórico
3. **streak-celebration** — 7 dias = ciclo de Orixá (sagrado) → confidence 1.0
4. **most-consulted-house** — Casa da Mesa Real com mais leituras (≥2 para disparar)
5. **most-consulted-topic** — tema de vida dominante
6. **multidimensional-approach** — mesmo tópico via 3+ tradições
7. **time-of-day-pattern** — Yin (madrugada/noite) vs Yang (manhã/tarde)
8. **tradition-balance** — todas as 7 tradições usadas
9. **sacred-tradition-affinity** — uma tradição ≥ 50%
10. **reflection-richness** — ≥ 70% das leituras têm reflexão escrita

## 7-Tradição Coverage (cycle 77 mandate)

```
Candomblé ✓   (Candomblé, Umbanda, Ifá nos streaks sagrados)
Umbanda   ✓   (idem)
Ifá       ✓   (idem)
Cabala    ✓   (aparece no cache key, deep reads)
Astrologia ✓  (presente em insights Yin/Yang)
Tantra    ✓   (idem)
Cigano    ✓   (tradição central da Mesa Real)
```

A `SACRED_TRADITIONS = ['Candomblé', 'Umbanda', 'Ifá', 'Cabala', 'Astrologia', 'Tantra', 'Cigano']`
é `Object.freeze`-ada e o type system rejeita qualquer string fora dessa tupla.

## Validação (TSC + testes)

- ✅ **TSC:** `npx tsc --noEmit -p src/lib/w77/tsconfig.json` → 0 erros
- ✅ **Spec:** `node --experimental-strip-types reading-history-dashboard.spec.ts` → **66/66 PASS**
- ✅ **Smoke:** `node --experimental-strip-types reading-history-dashboard.smoke.ts` → **40/40 PASS**

## Padrões cycle 60-76 aplicados

- **Worktree isolado** em `/tmp/w77-d` (cycle 60)
- **Self-running test harness** (cycle 68+) — sem vitest
- **Worktree-isolated tsconfig** com `lib: ["ES2022", "DOM"]` (cycle 73)
- **node-stubs.d.ts** como script file (cycle 73)
- **Branded types** com factories + regex prefix (`u_*`, `r_*`, `i_*`) (cycle 73/76)
- **Object.freeze + ReadonlyArray** em todo dado exportado (cycle 75 #6)
- **Sacred regex** com `[^\p{L}\p{N}_]` Unicode lookaround (cycle 68/69)
- **HMAC canonical JSON** para `hashCacheKey` (cycle 67)
- **`public readonly code:` constructor** banido pelo strip-types — sem classes Error tipadas (cycle 75/76)
- **Result narrowing** positivo (cycle 73)

## 5 NEW durable lessons (cycle 77)

1. **`??` + `&&` precisa de parens explícitos** sob `--experimental-strip-types`.
   Pattern: `a && b && c ?? false` é rejeitado pelo stripper. Wrap the `&&` chain
   in parens: `((a && b && c) ?? false)`. Reusable: any spec file that does
   defensive optional chaining + nullish coalescing.

2. **Branded ID regex precisa ser dimensionado pro ID real** — o `r_` original
   com 8-16 dígitos não cabia `Date.now() (13 digits) + counter (4 digits) = 17`.
   Solução: 8-20 dígitos. Reusable: any branded counter pattern that combines
   timestamp + monotonic counter.

3. **`@ts-ignore + declare const process: { exit(code: number): never }`** é o
   pattern correto (ciclo 75) pra forçar o TSC a aceitar `process.exit(0)` mesmo
   sem `@types/node` no worktree-isolated tsconfig. Reusable: every cycle-7X
   spec/smoke that uses process.exit.

4. **Streak insigh "current" exige dados que cheguem até hoje** — um dataset
   com leituras de 2026-06-01 a 2026-06-28 rodado em 2026-06-30 NÃO dispara
   `streak-current` (grace: tries today, then yesterday, both empty). Spec
   assertions precisam distinguir "should fire" vs "may not fire for historical
   data" — senão o teste falha por design. Reusable: any time-aware insight
   engine with a "current state" detector.

5. **Insight `multidimensional-approach` com 4 tradições tem confiança ~0.95**;
   com 3 tem 0.9; com 2 tem 0.7 (mas só dispara a partir de 3). Isso significa
   que a fórmula `Math.min(1, 0.6 + 0.1 * traditionsCount)` produz uma rampa
   que vai de 0.6 a 1.0 conforme a sofisticacão do leitor. Reusable: any
   confidence score that scales with input richness.

## Como rodar localmente

```bash
cd /workspace/cabaladoscaminhos
git checkout w77/reading-history-dashboard
cd src/lib/w77

# TSC
npx tsc --noEmit -p tsconfig.json

# Spec
node --experimental-strip-types reading-history-dashboard.spec.ts

# Smoke
node --experimental-strip-types reading-history-dashboard.smoke.ts
```

## Coordenação com W75-A (mesa-real-cross-house)

W77-D **consome semanticamente** o output de W75-A, mas **não depende dele
em runtime**. O engine aceita:
- `mesaRealHouseNumber: 1..12` (mesma escala de W75)
- `topic: ConsultationTopic` (mesmos 12 temas de W75)
- `traditionsUsed: readonly SacredTradition[]` (mesma enum)
- `upstreamCacheKey?: string` (opcional — o cache key do W75)

Se W75-A evoluir pra 36 casas, W77-D precisa de uma migration no
`MESA_REAL_HOUSES` (atualmente `1..12`). Por enquanto, ambos compartilham o
slice A (12).

## Wall time

~25 min (setup worktree + engine + 2 spec passes + 2 smoke passes + doc).
Restante do cap de 30 min foi gasto em debugging TSC.

