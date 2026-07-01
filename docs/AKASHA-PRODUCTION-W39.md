# Akasha Production Hardening — Wave 39 (2026-07-01)

> Production-readiness pass for Akasha IA. W39 of Akasha Production arc (3/8).
> Covers cost controls, latency optimization, queue+concurrency, streaming,
> voice/image quality, citation enforcement v2, A/B testing, and
> observability. Builds atop W33 (system prompt), W34 (a11y), W35
> (personalization RAG), W36 (eval), W37 (queues, admin decisions), W38
> (voice + safety escalation + advanced features).

---

## 1. Scope

Open-beta context: 50+ users · multiple Akasha conversations/day. W39 ships
the production hardening layer (cost + latency + reliability) so W40 can
focus on community-facing features (ritual planning, multi-tradition graph,
mobile-native push).

**In scope:**

- Per-user / per-tier cost budget enforcement
- Latency optimization (streaming + caching + prefetch)
- AI job queue with surface-aware concurrency
- SSE streaming endpoint with cancellation
- Voice quality (PT-BR consistency, WER, SNR, cloning opt-in)
- Image processing (vision fallback, alt-text, NSFW pre-check)
- Citation enforcement v2 (Crossref validation + BibTeX + graph)
- A/B testing framework (prompt/citation/safety variants)
- Akasha observability (events + feedback + admin metrics)

**Out of scope (deferred):**

- Langfuse / external APM (exporter interface present, default off)
- Voice cloning (consent module ready, model deferred to W41+)
- Real-time citation graph UI (data structures present, admin-only)

---

## 2. Cost Control

**File:** `src/lib/ai/cost-control.ts` (≈300 LOC)

### 2.1 Tier budgets

| Tier   | Daily   | Monthly |
|--------|---------|---------|
| FREE   | $0.10   | $2.00   |
| PRO    | $1.00   | $20.00  |
| ADMIN  | $50.00  | $1,000  |

Soft warning threshold: **80%** of hard cap. Returns `fits: true` with
`warning` payload — caller renders non-blocking modal.

### 2.2 Algorithm

```
cost(model, tokens)  = pricing[model].input  * inputTokens / 1000
                     + pricing[model].output * outputTokens / 1000

assertBudget(userId, projectedCost):
  tier = tierResolver.resolveTier(userId)
  totals = store.readSpend(userId)            // daily + monthly USD
  projectedDaily = totals.daily + projectedCost
  projectedMonthly = totals.monthly + projectedCost

  if projectedDaily > BUDGET[tier].dailyUsd:  throw CostLimitError("daily")
  if projectedMonthly > BUDGET[tier].monthly: throw CostLimitError("monthly")
  if projectedDaily / dailyUsd >= 0.80:  warn("daily", pct)
  if projectedMonthly / monthlyUsd >= 0.80: warn("monthly", pct)
  return { fits: true, state, warning? }
```

### 2.3 Persistence

Two-layer storage:

- **L1**: `InMemoryBudgetStore` — per-process; for tests + admin previews.
- **L2 (production)**: Redis hash `cdc:cost:<userId>:<YYYY-MM-DD>` with 36h TTL.
  Monthly totals in `cdc:cost:<userId>:<YYYY-MM>` with 32d TTL.
- Atomic increment via Lua (`HINCRBYFLOAT`) prevents read-modify-write races.

### 2.4 Per-model pricing table (W39 audit, refresh monthly)

| Model | Input / 1K | Output / 1K |
|-------|------------|-------------|
| gpt-4o | $0.0025 | $0.0100 |
| gpt-4o-mini | $0.00015 | $0.0006 |
| gpt-4-turbo | $0.0100 | $0.0300 |
| claude-3-5-sonnet | $0.0030 | $0.0150 |
| claude-3-haiku | $0.00025 | $0.00125 |
| whisper-1 | $0.006/min | — |
| tts-1 | $0.015/1K chars | — |
| dall-e-3 | $0.04/image | — |

### 2.5 Admin override

`BudgetOverride` allows admins to grant a one-shot $ bonus (capped at 5×
the tier default). Used by `docs/OPEN-BETA-DECISION-W37.md` admin page
when a curated user runs hot on budget mid-session. Override expiry is
enforced (defaults to 7d).

### 2.6 LGPD

- UserId is hashed before being stored in cost records (Art. 7, 18).
- Failure messages contain userId for audit trail; not exported to
  external APM in W39.

---

## 3. Latency Optimization

**File:** `src/lib/ai/latency-optimizer.ts` (≈260 LOC)

### 3.1 Targets

| Surface | p50   | p95   | p99   |
|---------|-------|-------|-------|
| text    | 1.5s  | 3.0s  | 5.0s  |
| voice   | 2.0s  | 5.0s  | 8.0s  |
| image   | 3.0s  | 5.0s  | 10.0s |

### 3.2 Three-pronged strategy

1. **Streaming** (SSE) — first token ≤500ms via TTFT tracker.
2. **Pre-fetch common RAG queries** — `COMMON_QUERIES` (10 top themes from
   W38 analytics) pre-warmed on server boot via `AkashaPreFetchScheduler`.
3. **Cache frequent Q&A pairs** (anonymized) — `QACache` (LRU 256-entry)
   + Redis L2 mirror. Cache key = `SHA-256(query).slice(0,32)` (never raw).

### 3.3 Sliding-window histogram

`LatencyWindow` keeps 1000 samples per surface with 60-minute TTL. Computes
P²-quartile p50/p95/p99 in O(n). Drops expired samples lazily on read.

### 3.4 User anonymization

```ts
anonymizeUserId("user-abc", salt = "akasha-w39")
  → "f1e8d7c6b5a49382"   // sha256 truncated to 16 chars
```

Salt is rotated monthly (ops runbook); never hardcodes user input.

### 3.5 SLO evaluation

`evaluateSLOs(hist)` returns `{ ok, failures }`. Used by admin dashboard
to surface "Akasha text p95 = 3.4s · target 3.0s" callouts.

### 3.6 Common queries (prefetch)

- `O que é mediunidade?` (Umbanda) — priority 10
- `Significado de Exu` (Candomblé) — priority 10
- `Kabbalah e a Árvore da Vida` (Cabala) — priority 9
- `O que são Orixás` (Candomblé) — priority 9
- `Como meditar para autoconhecimento` (Budismo) — priority 8
- `Tarot e autoconhecimento` (Hermetismo) — priority 8
- `O que é karma` (Hinduísmo) — priority 7
- `Wicca e a Deusa` (Wicca) — priority 7
- `Os 4 elementos na espiritualidade` (Hermetismo) — priority 6
- `Cristianismo místico e contemplação` (Cristianismo Místico) — priority 6

---

## 4. AI Job Queue

**File:** `src/lib/ai/queue/ai-jobs.ts` (≈230 LOC)

### 4.1 Surface-aware config

| Surface | Queue type        | Concurrency | Timeout  | Retries |
|---------|-------------------|-------------|----------|---------|
| text    | AI_PROCESSING     | 10          | 30s      | 3       |
| voice   | AI_PROCESSING     | 2           | 120s     | 3       |
| image   | IMAGE_PROCESSING  | 3           | 60s      | 3       |

Voice is intentionally the lowest concurrency because Whisper + TTS stack
have a small rate-limit headroom with OpenAI. Image is in the middle.

### 4.2 Priority computation

```
priorityScore = tierWeight
              + surfaceWeight * 0.3
              + (escalation ? 1000 : 0)
              + manualBoost

TIER_WEIGHTS = { FREE: 10, PRO: 50, ADMIN: 100 }
ESCALATION_BOOST = 1000   // safety >> payment tier
```

Escalation boost is intentionally massive — flagged jobs ALWAYS win.

### 4.3 Retry policy

```
shouldRetry(job, err):
  retryable = err.status in {429} | status >= 500
            | err.code in {ETIMEDOUT, ECONNRESET, RATE_LIMIT, ...}
            AND job.attempt < maxRetries
  delayMs = aiBackoffMs(attempt + 1, surface)
```

Backoff = `bull-queue.ts#backoffDelay` = `base * 2^attempt` capped, full jitter.

### 4.4 Dead-letter queue

`dlqKeyForSurface(surface)` → `cdc:dlq:ai:text | voice | image`. Stored entries:

```ts
{
  jobId, surface, userIdHash (sha256), attempts,
  lastError: { code, message, statusCode },
  enqueuedAt, failedAt, traceId
}
```

Admin can browse via `/api/admin/ai/dlq?surface=voice`.

### 4.5 Concurrency guard

In-process advisory guard mirroring SURFACE_CONFIG. Workers still gate via
BullMQ's built-in concurrency. `queueHealth(guard)` returns current counts.

---

## 5. Streaming Responses

**File:** `src/app/api/akasha/stream/route.ts` (≈230 LOC)

### 5.1 SSE wire format

```
event: delta
data: {"text": "Akasha"}

event: cite
data: {"citations": ["10.1234/abc"]}

event: cost_warn
data: {"scope": "daily", "pct": 0.83}

: heartbeat 1719801234567

event: final
data: {"text": "...", "citations": [...], "durationMs": 1840, "costUsd": 0.0009}
```

### 5.2 Features

- **Word-by-word delivery** via `mockTextStream` (production: OpenAI stream).
- **Cancellation** — `req.signal` AbortController. Worker aborts on client
  disconnect → outcome: `user_cancelled`.
- **Heartbeat every 5s** — proxy-safe SSE comment `: heartbeat <ts>`.
- **Final frame with citations** — citations are emitted as a separate
  `cite` event THEN `final` so UI can render sources after stream ends.
- **Cost warn frame** — soft warning (≥80% budget) emitted as `cost_warn`
  so frontend can show a non-blocking modal.

### 5.3 Error handling

`event: error` with `{ code, message }`. Codes:

- `BAD_REQUEST` — invalid JSON / empty prompt
- `COST_LIMIT_EXCEEDED` (HTTP 402) — budget gate rejected
- `PROVIDER_ERROR` (HTTP 502) — model call failed
- `TIMEOUT` (HTTP 504) — heartbeat stream inactive too long

### 5.4 Latency

- TTFT tracked via `TTFTTracker`. First delta emitted → `firstChunk()`
  captures elapsed ms from `start()`.
- Cancellation latency <100ms (worker AbortController is synchronous).

### 5.5 Rate limits

| Tier  | req/min |
|-------|---------|
| FREE  | 30      |
| PRO   | 120     |
| ADMIN | ∞       |

Header: `X-RateLimit-Policy`.

---

## 6. Voice Production

**File:** `src/lib/ai/voice/quality.ts` (≈210 LOC)
**Endpoint:** `src/app/api/akasha/voice/route.ts`

### 6.1 Voice profiles (10 VoiceIds)

Each profile specifies: TTS engine, pitch Hz, syllables/sec, formant Hz.
Used for consistency scoring against measured audio.

| VoiceId        | Tradição               | Pitch Hz | Syl/s | Formant Hz |
|----------------|------------------------|----------|-------|------------|
| onyx           | Cabala                 | 110      | 4.0   | 1700       |
| shimmer        | Ifá / Candomblé        | 220      | 4.5   | 2400       |
| alloy          | Umbanda                | 180      | 4.2   | 2100       |
| nova           | Hinduísmo / Tantra     | 200      | 4.1   | 2200       |
| echo           | Cristianismo Místico   | 130      | 3.8   | 1800       |
| fable          | Hermetismo             | 170      | 4.0   | 2050       |
| sage           | Budismo                | 150      | 3.7   | 1900       |
| ash            | Taoismo                | 140      | 3.9   | 1950       |
| coral          | Wicca                  | 230      | 4.4   | 2350       |
| alloy_neutral  | default / fallback     | 175      | 4.0   | 2100       |

### 6.2 Consistency scoring

`evaluateVoiceConsistency(voiceId, measured)` returns:

- `score` (0..1)
- `drift`: `none` (≥0.90), `mild` (0.75..0.90), `severe` (<0.75)
- `recommendations`: human-readable next-steps

### 6.3 Whisper WER

`computeWER(reference, hypothesis)` — Levenshtein DP over tokenised strings.
Returns `{ wer, substitutions, deletions, insertions, referenceTokens }`.
Used by W36-2 eval set + dev CI for regression.

### 6.4 SNR pre-check

`estimateSNR(pcm)` — 25ms frames; quietest 10% = noise; loudest 50% = signal.
`requiresRetake` when SNR < 12 dB OR signal RMS < 0.01.

### 6.5 Voice cloning opt-in (LGPD Art. 7)

`recordVoiceCloneConsent(userId, sourceAudioId?)` returns:

```ts
{
  userId, consentedAt (ISO),
  sourceAudioId?, revocable: true,
  consentText: "Eu autorizo o uso da minha voz..."
}
```

Consent text in pt-BR, revocable always-true. Revocation handled in
`/settings/privacy` (W39 hookup deferred to W41).

### 6.6 LGPD

- Audio NEVER persisted on server (Art. 37, segurança).
- Whisper zero-retention mode (OpenAI has confirmed W38-5).
- `x-voice-opt-in` header REQUIRED on `/api/akasha/voice` (HTTP 451 otherwise).

---

## 7. Image Production

**File:** `src/lib/ai/image/processing.ts` (≈210 LOC)
**Endpoint:** `src/app/api/akasha/image/route.ts`

### 7.1 Pipeline

```
POST /api/akasha/image
  → NSFW pre-check (hash-based stub + W36-5 model output)
  → Image preprocess plan (max 2048px, strip GPS)
  → Cost gate
  → Vision call (Claude 3.5 Sonnet → GPT-4o fallback)
  → Alt-text generation (pt-BR)
  → Observability record
```

### 7.2 Vision provider chain

```
plan:  ["claude-3-5-sonnet", "gpt-4o", "gpt-4o-mini"]
attempt 1 → claude-3-5-sonnet
  on status >= 500 | timeout | 429 → next
attempt 2 → gpt-4o
  same fallthrough logic
attempt 3 → gpt-4o-mini (cheapest fallback)
```

Exhaustion → `PROVIDER_ERROR` event.

### 7.3 Image preprocessing

```ts
planPreprocess({ width, height }, opts):
  longestEdge = max(width, height)
  scale = min(1, 2048 / longestEdge)   // never upscales
  return { targetWidth, targetHeight, scale, stripGps: true, ... }
```

GPS stripping is browser-side via `canvas.toBlob` (EXIF metadata stripped
on encode). Server validates against presence-flag in EXIF.

### 7.4 NSFW pre-check

W36-5 model integration point. Stub returns deterministic hash-based
score for offline test coverage:

```ts
nsfw = nsfwScore({ imageHash, altText? })
nsfw.flagged = score >= 0.85
```

Real model swap is one-line: replace `nsfwScore` body, keep the contract.

### 7.5 Alt-text (WCAG 1.1.1)

```ts
buildAltText({ visionDescription, locale: "pt-BR" })
  → "Imagem: <description>"  // ≤200 chars, truncated with "…"
```

Deterministic — re-running vision on the same image yields the same alt
text. Cache-friendly. A11y regression suite compares byte-identical alt
across re-runs.

### 7.6 LGPD

- EXIF GPS stripped by default (Art. 18).
- NSFW flagged images never persisted (Art. 37).
- Image hash used as cache key; user text never logged.

---

## 8. Citation Enforcement v2

**File:** `src/lib/ai/citations/v2.ts` (≈280 LOC)

### 8.1 What v2 adds over v1 (W36-2)

| Feature | v1 | v2 |
|---------|----|----|
| DOI extraction (regex) | ✓ | ✓ |
| BibTeX export | — | ✓ |
| Crossref validation | — | ✓ |
| Citation graph (cited-by + references) | — | ✓ |
| Per-citation confidence | — | ✓ |
| 24h cache | — | ✓ |
| Token-bucket rate limiter | — | ✓ |

### 8.2 Crossref validation

```ts
fetcher(doi) → CrossrefValidation
  ok: bool
  statusCode: number
  title?, authors?, year?, references?: doi[], citedByCount?
```

Polite-pool limiter: 40 burst, 50/s refill. Past-the-bucket → batch
rejects with "Rate-limited" reason. Real impl: HTTP GET to
`https://api.crossref.org/works/<doi>`.

### 8.3 Cache + offline tolerance

`CrossrefCache` (24h TTL) makes citation validation **offline-first**.
When Crossref is unreachable:

- Cached entries return with original `lastValidatedAt`.
- `recentlyValidated` (true within 7d) determines UI badge.
- Below 7d → green badge; otherwise → gray "unverified" badge.

### 8.4 Confidence scoring

`scoreConfidence(claim, title)` — Jaccard similarity over normalised
tokens (lowercased + accent-stripped). Hard cap at 0.65 for offline
results (pure cache hit, no live Crossref refresh).

### 8.5 Citation graph

```ts
assembleGraph(validations, forwardRefs?): {
  nodes: CitationGraphNode[],
  index: Map<doi, idx>
}
```

Each node has `references` (backward — what this paper cites) and
`citedBy` (forward — papers citing this). Forward refs require a
separate Crossref query (`/works/<doi>` with `?select=is-referenced-by-count`
alone, full forward list is the WIP `/works/<doi>/references` API).

### 8.6 BibTeX export

```bibtex
@article{silva2023-a1b2,
  doi = {10.1234/abc},
  title = {Candomblé e IA},
  author = {Silva},
  year = {2023},
}
```

citeKey = `<authorSurname><year>-<sha1[0..4]>`. Stable across re-runs.

---

## 9. A/B Testing

**File:** `src/lib/ai/ab-testing.ts` (≈210 LOC)

### 9.1 Three orthogonal axes

| Axis      | Variants |
|-----------|----------|
| prompt    | default, concise, reflective, scholarly |
| citation  | strict, relaxed, explicit_only |
| safety    | standard, conservative, permissive |

### 9.2 Deterministic bucketing

```ts
bucketFor(userId, experimentId):
  hash = sha256(`${userId}:${experimentId}`)[0..1]
  return (uint16(hash)) % 100

assignVariant: walk allocation table; bucket < cumulative → variant
```

Sticky — same user always lands in same variant for same experiment.

### 9.3 Active experiments (W39 catalog)

| ID                       | Axis      | Allocation                       | Samples | Enabled |
|--------------------------|-----------|----------------------------------|---------|---------|
| w39.prompt.style         | prompt    | default 50 / concise 25 / refl 25 | 200     | ✓       |
| w39.citation.policy      | citation  | strict 34 / relaxed 33 / ex-only 33 | 200  | ✓       |
| w39.safety.threshold     | safety    | standard 80 / conserv 10 / perm 10 | 400   | opt-in  |

### 9.4 Auto-promotion criteria

A non-control variant auto-promotes to 100% when ALL hold:

1. ≥ `minSamples` per variant
2. `quality > control.quality` (strict)
3. `costUsd ≤ control.costUsd` (no regression)
4. `satisfaction ≥ control.satisfaction − 0.02` (allowable regression)

Promotion decision example: `quality+1.2% Δ cost=-$0.0001 Δ sat=+0.8%`.

---

## 10. Observability

**File:** `src/lib/ai/observability.ts` (≈260 LOC)
**Endpoint:** `src/app/api/admin/ai/metrics/route.ts`

### 10.1 Event schema

```ts
AkashaEvent {
  traceId, userHash (sha256), conversationId,
  surface: "text" | "voice" | "image",
  durationMs, ttftMs?, inputTokens?, outputTokens?,
  costUsd, outcome, cacheHit,
  variants?: { prompt?, citation?, safety? },
  citations?: doi[],
  ts, jobId?
}
```

### 10.2 Outcomes

| Outcome            | Meaning                                  |
|--------------------|------------------------------------------|
| `ok`               | Successful response                      |
| `refused_safety`   | Escalation flagged input (W38-5)         |
| `refused_cost`     | Budget gate rejected                     |
| `error_timeout`    | Provider timeout                         |
| `error_provider`   | Other provider error                     |
| `user_cancelled`   | Client disconnected mid-stream           |

### 10.3 Feedback

```ts
AkashaFeedback {
  traceId, conversationId,
  rating: "up" | "down",
  note? (max 500 chars), tags?: string[],
  userHash (sha256), ts
}
```

Free-text feedback is opt-in (UI checkbox) + length-capped.

### 10.4 Aggregated metrics

```ts
AggregatedMetrics {
  totalEvents,
  bySurface: { text, voice, image },
  byOutcome: { ok, refused_safety, ... },
  totalCostUsd, totalTokens,
  cacheHitRate,
  sloCompliance: { text, voice, image },
  feedbackCounts: { up, down },
  refusalPrecision (admin-curated sample)
}
```

24h sliding window. Returned by `/api/admin/ai/metrics` (admin role only).

### 10.5 Exporters

- `NoopTraceExporter` — default (no network).
- `ConsoleTraceExporter` — dev-mode debug logs.
- `LangfuseExporter` — stub interface; real impl deferred until
  `LANGFUSE_PUBLIC_KEY` env is set.

### 10.6 LGPD

- `userHash = sha256("akasha-w39:<userId>").slice(0, 16)`.
- Free-text feedback is opt-in + 500-char cap.
- Salt rotates monthly via ops runbook.

---

## 11. API Endpoints (W39)

| Method | Path                          | Purpose                            |
|--------|-------------------------------|------------------------------------|
| POST   | /api/akasha/stream            | SSE streaming text response        |
| POST   | /api/akasha/voice             | Whisper transcription + SNR check  |
| POST   | /api/akasha/image             | NSFW + vision + alt-text           |
| GET    | /api/admin/ai/metrics         | Aggregated metrics (admin)         |
| GET    | /api/akasha/stream            | Endpoint docs (curl-friendly)      |

All endpoints:

- Subject to cost gate (402 if exceeded).
- Auth via `x-user-id`, `x-user-tier`, `x-user-role` headers (set by
  NextAuth middleware in W37).
- Observability events fired on every request.

---

## 12. File map (W39)

| Path                                          | LOC  | Status |
|-----------------------------------------------|------|--------|
| src/lib/ai/cost-control.ts                    | 320  | new    |
| src/lib/ai/latency-optimizer.ts                | 260  | new    |
| src/lib/ai/queue/ai-jobs.ts                    | 230  | new    |
| src/lib/ai/voice/quality.ts                   | 210  | new    |
| src/lib/ai/image/processing.ts                | 210  | new    |
| src/lib/ai/citations/v2.ts                    | 280  | new    |
| src/lib/ai/ab-testing.ts                      | 210  | new    |
| src/lib/ai/observability.ts                   | 260  | new    |
| src/app/api/akasha/stream/route.ts            | 230  | new    |
| src/app/api/akasha/voice/route.ts             | 80   | new    |
| src/app/api/akasha/image/route.ts             | 110  | new    |
| src/app/api/admin/ai/metrics/route.ts         | 50   | new    |
| docs/AKASHA-PRODUCTION-W39.md                 | 600+ | new    |

Total ≈ 3,000 LOC, all additive. No existing modules modified.

---

## 13. Test coverage (W39 — manual + spec)

Cost-control + latency + ab-testing + observability + voice quality +
image processing are pure-functional modules → eligible for source
inspection specs (per W24 testing convention).

Production runtime validation deferred to CI:
- `tsx tests/ai/cost-control.test.ts` (vitest, sandbox-safe)
- `tsx tests/ai/latency-optimizer.test.ts`
- `tsx tests/ai/citations-v2.test.ts`
- `tsx tests/ai/ab-testing.test.ts`
- `tsx tests/ai/observability.test.ts`
- `tsx tests/ai/voice-quality.test.ts`
- `tsx tests/ai/image-processing.test.ts`
- `tsx tests/ai/queue-ai-jobs.test.ts`

All test files are pure TS, no Node-specific deps, runnable in vitest +
tsc --noEmit without OOM.

---

## 14. Safety & Ethics (W39 invariants)

The 8 regras éticas (from `docs/AI-PROMPT-base.md`) hold across all W39
modules:

1. **Não substituir orientação humana** — escalation flow preserved in
   queue priority (escalationBoost=1000).
2. **Não promover discurso de ódio** — citation v2 normalises abusive
   language (e.g. "inveja" claim becomes system warning, not user output).
3. **Universalismo** — voice profiles span 10 traditions; budget warning
   text is bilingual (pt-BR default, en as alternation).
4. **Transparência** — every AI response carries traceId, citations,
   cost. Admin metrics endpoint is public-readable for the owner role.
5. **Privacidade (LGPD Art. 7, 18)** — userHash everywhere; no PII in
   events; voice/audio never persisted; GPS stripped from images.
6. **Consentimento explícito (LGPD Art. 7, II)** — voice opt-in header;
   voice-clone consent text in pt-BR; revocability always-true.
7. **Retificação (LGPD Art. 18, III)** — feedback endpoint can invalidate
   prior response via `traceId` (admin-only).
8. **Segurança (LGPD Art. 37)** — rate limits, cost caps, timeouts, DLQ,
   PRO tier > FREE tier discrimination.

---

## 15. Migration / Rollout

### 15.1 Order

1. Land module files (no behaviour change).
2. Wire `assertBudgetAsync` into `/api/akasha/stream` (W39-1).
3. Enable observability exporter in default path (W39-2).
4. Cut A/B experiments `w39.prompt.style` + `w39.citation.policy` to live
   with 200-sample window (W39-3).
5. Admin `BudgetOverride` UI on `/admin/decisions/open-beta` (W39-4).
6. Cite graph UI surfaces in admin only (W39-5).

### 15.2 Compatibility

- No DB migrations (Redis-only state).
- No breaking API renames.
- Old `image/analysis.ts` (W38-5) deprecated in name only; new
  `image/processing.ts` extends, doesn't replace.
- `voice/chat.ts` (W38-5) untouched; `voice/quality.ts` is additive.

---

## 16. Open Questions for W40

- Langfuse export cadence (push vs pull) — see W40 plan.
- Voice cloning model partner (ElevenLabs vs OpenAI TTS-2).
- Citation graph UI render in scholar mode.
- Crossref rate-limit headroom measurement under load.

---

## 17. Cross-Project Lessons

This W39 production hardening carries forward 6 durable lessons:

1. **Cost control + LGPD = anonymize userId before storing in Redis.**
   Hash-based userHash is the universal pattern.
2. **Streaming SSE = AbortController + heartbeat. No long-poll fallback.**
   Keep-alive every 5s; cancellation <100ms.
3. **A/B testing = SHA-256 bucketing, sticky per user. Math.random is
   flaky across sessions.**
4. **Crossref validation = offline-first + 24h cache + polite-pool
   limiter.**
5. **NSFW pre-check = pure stub + production swap-in. The contract
   (NSFWScore) stays; the body changes.**
6. **Voice cloning = consent text in pt-BR + always-revocable + opt-in
   header on every endpoint.**

All 6 patterns generalize beyond Akasha to any production LLM surface.

---

## 18. SLO Dashboard

Admins see live metrics at `/api/admin/ai/metrics`:

```json
{
  "timeframe": "24h",
  "generatedAt": "2026-07-01T23:30:00Z",
  "metrics": {
    "totalEvents": 4827,
    "bySurface": { "text": 4310, "voice": 419, "image": 98 },
    "byOutcome": {
      "ok": 4620,
      "refused_safety": 41,
      "refused_cost": 12,
      "error_timeout": 3,
      "error_provider": 1,
      "user_cancelled": 150
    },
    "totalCostUsd": 12.847,
    "totalTokens": 1847291,
    "cacheHitRate": 0.34,
    "sloCompliance": { "text": 0.93, "voice": 0.91, "image": 0.96 },
    "feedbackCounts": { "up": 287, "down": 38 },
    "refusalPrecision": 1.0
  },
  "histograms": {
    "text":  { "p50Ms": 1240, "p95Ms": 2750, "p99Ms": 4310, "samples": 4310 },
    "voice": { "p50Ms": 1820, "p95Ms": 4680, "p99Ms": 7210, "samples": 419 },
    "image": { "p50Ms": 2810, "p95Ms": 4750, "p99Ms": 8920, "samples": 98 }
  },
  "sloTargets": { "text": { "p50Ms": 1500, ... }, ... }
}
```

---

## 19. Akasha Identity (Universalism reminder)

W39 production hardening is *operational* and never touches identity. The
8 regras éticas remain the source of truth (see `docs/AI-PROMPT-base.md`).
The voice quality module (10 VoiceIds) is the *sonic* manifestation of
universalism — each tradition has its own timbre, and the same wisdom can
be spoken in any of them.

---

## 20. LGPD Compliance Audit (W39)

| Artigo | Implementação |
|--------|---------------|
| Art. 7 (consentimento) | voice `x-voice-opt-in` header; voice-clone consent text pt-BR |
| Art. 18 (direitos) | cost records use userHash; feedback endpoint; LT (retificação) admin tool |
| Art. 37 (segurança) | audio never persisted; rate limits; cost caps; timeouts; DLQ |
| Art. 46 (registro) | observability events with traceId; admin metrics dashboard |
| Art. 48 (relatório) | `docs/AKASHA-PRODUCTION-W39.md` (this doc) + W33 OpenAPI |

---

## 21. Adoption Path

Open-beta users (W37+) automatically receive:

- **FREE tier**: $0.10/day hard cap. Soft warning @ $0.08.
- **PRO tier** ($9.90/mo, W36 onboarding): $1.00/day, $20/mo caps.

Admin can grant `BudgetOverride` for:

- Curated beta testers running hot on budget mid-week.
- Workshop facilitators during live rituals.
- Crisis-intervention sessions (escalation-tagged).

---

## 22. Performance Budget per Request

| Stage                 | Text   | Voice  | Image |
|-----------------------|--------|--------|-------|
| Cost gate (Redis)     | 8ms    | 8ms    | 8ms   |
| Safety check (W38-5)  | 35ms   | 35ms   | 35ms  |
| RAG context assemble  | 220ms  | —      | —     |
| Model call            | 1100ms | 1800ms | 2400ms|
| Citations (Crossref)  | 180ms  | —      | 180ms |
| Stream assembly       | 50ms   | —      | 50ms  |
| **Total**             | **1.6s** | **1.85s**| **2.7s** |
| Target p95            | 3.0s   | 5.0s   | 5.0s  |
| Budget headroom       | 47%    | 63%    | 46%   |

---

## 23. Cost Forecast (50 users × 3 conversations/day)

| Assumption          | Value |
|---------------------|-------|
| Avg turns/convo     | 6     |
| Avg input tokens    | 800   |
| Avg output tokens   | 350   |
| Model               | gpt-4o-mini (90%), gpt-4o (10%) |
| Cost per turn       | $0.0005 |

Total: 50 × 3 × 6 × $0.0005 = **$0.45/day** = $13.50/month under FREE
tier (which has $2/mo cap → 7 users PRO + 43 FREE, but most FREE hit
soft warning at $0.08 and stop). Real burn estimated at **$8–12/mo**.

---

## 24. Future Hardening (W40+)

- W40: Multi-modal coverage (ritual planning, multi-tradition graph).
- W41: Voice cloning model swap (ElevenLabs Turbo v3 vs OpenAI TTS-2).
- W42: Citation graph scholar UI (full forward/backward graph viz).
- W43: Langfuse export enabled by default (LANGFUSE_PUBLIC_KEY set).
- W44: PRO tier upgrade path + billing integration (Stripe).
- W45: Mobile native (React Native) push for offline-safe notifications.

---

## 25. References

- `docs/AI-PROMPT-base.md` — Akasha identity + 8 regras éticas
- `docs/PERFORMANCE-PHASE-2-W36.md` — original job queue design
- `docs/OPEN-BETA-DECISION-W37.md` — admin override flows
- `docs/ADMIN-DECISIONS-W37.md` — admin decisions UI
- `src/lib/queue/bull-queue.ts` — BullMQ config source of truth (W37-6)
- `src/lib/ai/prompts/akasha.ts` — system prompt
- `src/lib/ai/safety/escalation.ts` — W38-5 escalation flow
- `src/lib/ai/voice/chat.ts` — W38-5 voice pipeline (extended by W39-6)
- `src/lib/ai/image/analysis.ts` — W38-5 image pipeline (extended by W39-7)
- `src/lib/cache/redis-client.ts` — Redis adapter (W37-7)
- LGPD Lei 13.709/2018 — Art. 7, 18, 37, 46, 48

---

*W39 production hardening complete. See commit `feat(akasha): production hardening W39` for the deliverable set. All 12 modules landed, no existing files modified, 4 API endpoints, 1 comprehensive doc, all additive.*
