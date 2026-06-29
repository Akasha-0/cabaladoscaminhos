/**
 * w66 live-streams — test suite
 * -----------------------------
 * Self-running test harness (no vitest import needed).
 *
 * Run via:
 *   node --experimental-strip-types src/lib/w66/live-streams.spec.ts
 *
 * Cycle 64 lesson 6 pattern: globalThis registration of describe/it/expect so
 * the file works both as a vitest module AND as a standalone script.
 *
 * Section breakdown (56+ assertions):
 *   - LIVE_STATES  (5)
 *   - types/guards (5)
 *   - errors       (4)
 *   - schedule     (6)
 *   - start        (4)
 *   - heartbeat    (5)
 *   - end          (4)
 *   - join         (4)
 *   - moderate     (4)
 *   - rotate       (3)
 *   - HMAC         (4)
 *   - sacred       (8)
 *   - audit        (3+)
 *   - chain verify (3)
 *   - LGPD         (2)
 *   TOTAL: 56+
 */

import * as mod from "./live-streams.ts"
import type {
  LiveStream,
  ScheduledStream,
  ActiveStream,
  TerminalStream,
  StreamId,
  StreamRecording,
  ViewerRef,
  ChatMessage,
  StreamConsent,
} from "./live-streams.ts"

// ---------------------------------------------------------------------------
// Global harness registration (cycle 64 lesson 6)
// ---------------------------------------------------------------------------

type DescribeFn = (name: string, body: () => void) => void
type ItFn = (name: string, body: () => void) => void

declare global {
  // eslint-disable-next-line no-var
  var describe: DescribeFn | undefined
  // eslint-disable-next-line no-var
  var it: ItFn | undefined
  // eslint-disable-next-line no-var
  var expect: ExpectFn | undefined
}

type ExpectFn = (actual: unknown) => {
  toBe: (expected: unknown) => void
  toEqual: (expected: unknown) => void
  toBeTruthy: () => void
  toBeFalsy: () => void
  toBeGreaterThan: (n: number) => void
  toBeGreaterThanOrEqual: (n: number) => void
  toBeLessThan: (n: number) => void
  toBeLessThanOrEqual: (n: number) => void
  toContain: (item: unknown) => void
  toContainString: (s: string) => void
  toMatch: (rx: RegExp) => void
  toThrow: (msg?: string | RegExp) => void
  toHaveLength: (n: number) => void
  not: {
    toBe: (expected: unknown) => void
    toEqual: (expected: unknown) => void
    toBeTruthy: () => void
    toBeFalsy: () => void
    toContain: (item: unknown) => void
    toThrow: (msg?: string | RegExp) => void
    toHaveLength: (n: number) => void
    toMatch: (rx: RegExp) => void
  }
}

function registerHarness() {
  let passes = 0
  let fails = 0
  const failures: string[] = []

  const localExpect = (actual: unknown) => {
    const obj: ReturnType<ExpectFn> = {
      toBe: (expected) => {
        if (!Object.is(actual, expected)) {
          throw new Error(`toBe failed: expected ${stableStr(expected)}, got ${stableStr(actual)}`)
        }
      },
      toEqual: (expected) => {
        if (!deepEqual(actual, expected)) {
          throw new Error(`toEqual failed: expected ${stableStr(expected)}, got ${stableStr(actual)}`)
        }
      },
      toBeTruthy: () => {
        if (!actual) throw new Error(`toBeTruthy failed: ${stableStr(actual)}`)
      },
      toBeFalsy: () => {
        if (actual) throw new Error(`toBeFalsy failed: ${stableStr(actual)}`)
      },
      toBeGreaterThan: (n) => {
        if (typeof actual !== "number" || !(actual as number > n)) {
          throw new Error(`toBeGreaterThan failed: ${stableStr(actual)} not > ${n}`)
        }
      },
      toBeGreaterThanOrEqual: (n) => {
        if (typeof actual !== "number" || !(actual as number >= n)) {
          throw new Error(`toBeGreaterThanOrEqual failed: ${stableStr(actual)} not >= ${n}`)
        }
      },
      toBeLessThan: (n) => {
        if (typeof actual !== "number" || !(actual as number < n)) {
          throw new Error(`toBeLessThan failed: ${stableStr(actual)} not < ${n}`)
        }
      },
      toBeLessThanOrEqual: (n) => {
        if (typeof actual !== "number" || !(actual as number <= n)) {
          throw new Error(`toBeLessThanOrEqual failed: ${stableStr(actual)} not <= ${n}`)
        }
      },
      toContain: (item) => {
        if (typeof actual === "string") {
          if (!actual.includes(String(item))) {
            throw new Error(`toContain(str) failed: ${stableStr(actual)} does not include ${stableStr(item)}`)
          }
          return
        }
        if (Array.isArray(actual)) {
          const found = actual.some((v) => Object.is(v, item) || deepEqual(v, item))
          if (!found) {
            throw new Error(`toContain(arr) failed: ${stableStr(actual)} does not contain ${stableStr(item)}`)
          }
          return
        }
        throw new Error(`toContain unsupported: ${stableStr(actual)}`)
      },
      toContainString: (s) => {
        if (typeof actual !== "string" || !actual.includes(s)) {
          throw new Error(`toContainString failed: ${stableStr(actual)} does not include ${s}`)
        }
      },
      toMatch: (rx) => {
        if (typeof actual !== "string" || !rx.test(actual)) {
          throw new Error(`toMatch failed: ${stableStr(actual)} does not match ${rx}`)
        }
      },
      toThrow: (msg) => {
        if (typeof actual !== "function") {
          throw new Error(`toThrow requires a function`)
        }
        let threw = false
        let err: unknown = null
        try {
          ;(actual as () => unknown)()
        } catch (e) {
          threw = true
          err = e
        }
        if (!threw) throw new Error("toThrow failed: function did not throw")
        if (msg !== undefined) {
          const m = String(err instanceof Error ? err.message : err)
          if (msg instanceof RegExp) {
            if (!msg.test(m)) throw new Error(`toThrow failed: error "${m}" did not match ${msg}`)
          } else if (typeof msg === "string" && !m.includes(msg)) {
            throw new Error(`toThrow failed: error "${m}" did not include "${msg}"`)
          }
        }
      },
      toHaveLength: (n) => {
        if (typeof actual !== "string" && !Array.isArray(actual)) {
          throw new Error(`toHaveLength requires string or array; got ${stableStr(actual)}`)
        }
        if ((actual as { length: number }).length !== n) {
          throw new Error(`toHaveLength failed: expected length ${n}, got ${(actual as { length: number }).length}`)
        }
      },
      not: {
        toBe: (expected) => {
          if (Object.is(actual, expected)) {
            throw new Error(`not.toBe failed: both equal ${stableStr(actual)}`)
          }
        },
        toEqual: (expected) => {
          if (deepEqual(actual, expected)) {
            throw new Error(`not.toEqual failed: both equal ${stableStr(actual)}`)
          }
        },
        toBeTruthy: () => {
          if (actual) throw new Error(`not.toBeTruthy failed: ${stableStr(actual)} is truthy`)
        },
        toBeFalsy: () => {
          if (!actual) throw new Error(`not.toBeFalsy failed: ${stableStr(actual)} is falsy`)
        },
        toContain: (item) => {
          if (typeof actual === "string") {
            if (actual.includes(String(item))) {
              throw new Error(`not.toContain(str) failed: ${stableStr(actual)} contains ${stableStr(item)}`)
            }
            return
          }
          if (Array.isArray(actual)) {
            const found = actual.some((v) => Object.is(v, item) || deepEqual(v, item))
            if (found) {
              throw new Error(`not.toContain(arr) failed: ${stableStr(actual)} contains ${stableStr(item)}`)
            }
            return
          }
        },
        toThrow: (msg) => {
          if (typeof actual !== "function") {
            throw new Error(`not.toThrow requires a function`)
          }
          let threw = false
          let err: unknown = null
          try {
            ;(actual as () => unknown)()
          } catch (e) {
            threw = true
            err = e
          }
          if (threw) {
            const m = String(err instanceof Error ? err.message : err)
            if (msg === undefined) {
              throw new Error(`not.toThrow failed: function threw "${m}"`)
            }
            if (msg instanceof RegExp) {
              if (msg.test(m)) {
                throw new Error(`not.toThrow failed: error "${m}" matched ${msg}`)
              }
            } else if (typeof msg === "string" && m.includes(msg)) {
              throw new Error(`not.toThrow failed: error "${m}" included "${msg}"`)
            }
          }
        },
        toHaveLength: (n) => {
          if (typeof actual !== "string" && !Array.isArray(actual)) {
            return
          }
          if ((actual as { length: number }).length === n) {
            throw new Error(`not.toHaveLength failed: length is ${n}`)
          }
        },
        toMatch: (rx) => {
          if (typeof actual === "string" && rx.test(actual)) {
            throw new Error(`not.toMatch failed: ${stableStr(actual)} matches ${rx}`)
          }
        },
      },
    }
    return obj
  }

  const localDescribe = (name: string, body: () => void) => {
    try {
      body()
    } catch (e) {
      fails++
      failures.push(`describe "${name}" crashed: ${(e as Error).message}`)
    }
  }
  const localIt = (name: string, body: () => void) => {
    try {
      body()
      passes++
    } catch (e) {
      fails++
      failures.push(`it "${name}": ${(e as Error).message}`)
    }
  }

  globalThis.describe = localDescribe
  globalThis.it = localIt
  globalThis.expect = localExpect

  return {
    passes: () => passes,
    fails: () => fails,
    failures: () => failures,
  }
}

function stableStr(v: unknown): string {
  try { return JSON.stringify(v) } catch { return String(v) }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== typeof b) return false
  if (a === null || b === null) return false
  if (typeof a === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) return false
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false
      return true
    }
    const ak = Object.keys(a as Record<string, unknown>).sort()
    const bk = Object.keys(b as Record<string, unknown>).sort()
    if (ak.length !== bk.length) return false
    for (let i = 0; i < ak.length; i++) {
      if (ak[i] !== bk[i]) return false
    }
    for (const k of ak) {
      if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false
    }
    return true
  }
  return false
}

const tally = registerHarness()
const { describe, it, expect } = globalThis as unknown as {
  describe: DescribeFn
  it: ItFn
  expect: ExpectFn
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VALID_CTX = {
  hmacSecret: "w66-test-secret",
  chatConsentSalt: "w66-test-salt",
  pseudonymSalt: "w66-test-pseudo",
}

const VALID_CONSENT: StreamConsent = {
  grantedAt: "2026-06-29T22:00:00.000Z",
  expiresAt: "2026-12-29T22:00:00.000Z",
  faceConsent: true,
  voiceConsent: true,
  audienceConsent: true,
}

const FUTURE_START = new Date(Date.now() + 60 * 60 * 1000).toISOString()

function freshCtx(): typeof VALID_CTX {
  mod.resetStreamLedgerForTest()
  return { hmacSecret: "w66-test-secret", chatConsentSalt: "w66-test-salt", pseudonymSalt: "w66-test-pseudo" }
}

function scheduledFixture(ctx: typeof VALID_CTX): ScheduledStream {
  const res = mod.scheduleStream(
    {
      title: "Cigano Ramiro live — Abertura da 28ª Carta",
      topic: "MESA_REAL",
      hostId: "host-1",
      sacredTags: ["Cigano", "Cigana", "Sol", "Lua"],
      scheduledStart: FUTURE_START,
      timezone: "America/Sao_Paulo",
      isPublic: true,
      streamConsent: VALID_CONSENT,
      replayConsent: VALID_CONSENT,
    },
    ctx,
  )
  if (!res.ok || !res.stream) throw new Error(`fixture schedule failed: ${(res.errors as ReadonlyArray<string>).join(",")}`)
  return res.stream
}

function liveFixture(ctx: typeof VALID_CTX, scheduled?: ScheduledStream): ActiveStream {
  const s = scheduled ?? scheduledFixture(ctx)
  const started = mod.startStream(s.id, ctx)
  if (!started.ok || !started.stream) {
    throw new Error(`fixture start failed: ${(started.errors as ReadonlyArray<string>).join(",")}`)
  }
  return started.stream as ActiveStream
}

// ---------------------------------------------------------------------------
// §1 LIVE_STATES shape (5)
// ---------------------------------------------------------------------------

describe("LIVE_STATES shape", () => {
  it("contains exactly 5 states", () => {
    expect(mod.LIVE_STATES).toHaveLength(5)
  })
  it("includes scheduled", () => {
    expect(mod.LIVE_STATES).toContain("scheduled")
  })
  it("includes live", () => {
    expect(mod.LIVE_STATES).toContain("live")
  })
  it("includes ended", () => {
    expect(mod.LIVE_STATES).toContain("ended")
  })
  it("includes cancelled + failed as terminal", () => {
    expect(mod.LIVE_STATES).toContain("cancelled")
    expect(mod.LIVE_STATES).toContain("failed")
  })
})

// ---------------------------------------------------------------------------
// §2 Types + type guards (5)
// ---------------------------------------------------------------------------

describe("types + guards", () => {
  it("isLiveState accepts 5 states and rejects garbage", () => {
    expect(mod.isLiveState("scheduled")).toBe(true)
    expect(mod.isLiveState("live")).toBe(true)
    expect(mod.isLiveState("ended")).toBe(true)
    expect(mod.isLiveState("cancelled")).toBe(true)
    expect(mod.isLiveState("failed")).toBe(true)
    expect(mod.isLiveState("xxx")).toBe(false)
    expect(mod.isLiveState(42)).toBe(false)
  })
  it("isStreamTopic accepts MESA_REAL and rejects garbage", () => {
    expect(mod.isStreamTopic("MESA_REAL")).toBe(true)
    expect(mod.isStreamTopic("CEREMONY")).toBe(true)
    expect(mod.isStreamTopic("xxx")).toBe(false)
  })
  it("isStreamTradition accepts IFA and rejects garbage", () => {
    expect(mod.isStreamTradition("IFA")).toBe(true)
    expect(mod.isStreamTradition("CIGANO")).toBe(true)
    expect(mod.isStreamTradition("xxx")).toBe(false)
  })
  it("isSacredStreamTopic returns true only for CEREMONY/MESA_REAL", () => {
    expect(mod.isSacredStreamTopic("CEREMONY")).toBe(true)
    expect(mod.isSacredStreamTopic("MESA_REAL")).toBe(true)
    expect(mod.isSacredStreamTopic("WORKSHOP")).toBe(false)
  })
  it("isLiveStream narrows state==='live'", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    expect(mod.isLiveStream(live)).toBe(true)
    const sch = scheduledFixture(ctx)
    expect(mod.isLiveStream(sch)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// §3 Error classes (4)
// ---------------------------------------------------------------------------

describe("error classes", () => {
  it("InvalidStreamStateError", () => {
    expect(new mod.InvalidStreamStateError("test").name).toBe("InvalidStreamStateError")
    expect(new mod.InvalidStreamStateError("test").code).toBe("INVALID_STREAM_STATE")
  })
  it("StreamRateLimitError", () => {
    expect(new mod.StreamRateLimitError("test").name).toBe("StreamRateLimitError")
    expect(new mod.StreamRateLimitError("test").code).toBe("STREAM_RATE_LIMIT")
  })
  it("StreamConsentMissingError", () => {
    expect(new mod.StreamConsentMissingError("test").name).toBe("StreamConsentMissingError")
    expect(new mod.StreamConsentMissingError("test").code).toBe("STREAM_CONSENT_MISSING")
  })
  it("StreamKeyRotationError", () => {
    expect(new mod.StreamKeyRotationError("test").name).toBe("StreamKeyRotationError")
    expect(new mod.StreamKeyRotationError("test").code).toBe("STREAM_KEY_ROTATION")
  })
})

// ---------------------------------------------------------------------------
// §4 scheduleStream (6)
// ---------------------------------------------------------------------------

describe("scheduleStream", () => {
  it("creates a scheduled record with HMAC chain", () => {
    const ctx = freshCtx()
    const res = mod.scheduleStream(
      {
        title: "Cigano Ramiro live",
        topic: "MESA_REAL",
        hostId: "host-1",
        scheduledStart: FUTURE_START,
        streamConsent: VALID_CONSENT,
      },
      ctx,
    )
    expect(res.ok).toBe(true)
    expect(res.stream).toBeTruthy()
    expect(res.stream!.state).toBe("scheduled")
    expect(res.stream!.chainHash).toHaveLength(64)
    expect(res.stream!.prevHash).toBe("GENESIS")
  })
  it("rejects title shorter than 3 chars", () => {
    const ctx = freshCtx()
    const res = mod.scheduleStream(
      { title: "ab", topic: "WORKSHOP", hostId: "h", scheduledStart: FUTURE_START },
      ctx,
    )
    expect(res.ok).toBe(false)
    expect(res.errors.length).toBeGreaterThan(0)
    expect(res.errors[0]).toContain("title length")
  })
  it("rejects title longer than 200 chars", () => {
    const ctx = freshCtx()
    const res = mod.scheduleStream(
      {
        title: "x".repeat(201),
        topic: "WORKSHOP",
        hostId: "h",
        scheduledStart: FUTURE_START,
      },
      ctx,
    )
    expect(res.ok).toBe(false)
  })
  it("rejects bad topic", () => {
    const ctx = freshCtx()
    const res = mod.scheduleStream(
      {
        title: "Valid Title",
        topic: "xxx" as unknown as mod.StreamTopic,
        hostId: "h",
        scheduledStart: FUTURE_START,
      },
      ctx,
    )
    expect(res.ok).toBe(false)
  })
  it("rejects past scheduledStart", () => {
    const ctx = freshCtx()
    const res = mod.scheduleStream(
      {
        title: "Valid Title",
        topic: "WORKSHOP",
        hostId: "h",
        scheduledStart: "2020-01-01T00:00:00.000Z",
      },
      ctx,
    )
    expect(res.ok).toBe(false)
    expect(res.errors[0]).toContain("future")
  })
  it("rejects empty hostId", () => {
    const ctx = freshCtx()
    const res = mod.scheduleStream(
      { title: "Valid Title", topic: "WORKSHOP", hostId: "", scheduledStart: FUTURE_START },
      ctx,
    )
    expect(res.ok).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// §5 startStream (4)
// ---------------------------------------------------------------------------

describe("startStream", () => {
  it("flips scheduled → live and creates streamKey", () => {
    const ctx = freshCtx()
    const sch = scheduledFixture(ctx)
    const res = mod.startStream(sch.id, ctx)
    expect(res.ok).toBe(true)
    expect(res.stream!.state).toBe("live")
    expect((res.stream as ActiveStream).streamKey).toHaveLength(32)
  })
  it("rejects when streamConsent missing", () => {
    const ctx = freshCtx()
    const res = mod.scheduleStream(
      {
        title: "No Consent Title",
        topic: "WORKSHOP",
        hostId: "h",
        scheduledStart: FUTURE_START,
      },
      ctx,
    )
    const started = mod.startStream(res.stream!.id, ctx)
    expect(started.ok).toBe(false)
    expect(started.errors[0]).toContain("Consent")
  })
  it("rejects when streamConsent.faceConsent is false", () => {
    const ctx = freshCtx()
    const badConsent: StreamConsent = { ...VALID_CONSENT, faceConsent: false }
    const res = mod.scheduleStream(
      {
        title: "Bad Face Consent",
        topic: "WORKSHOP",
        hostId: "h",
        scheduledStart: FUTURE_START,
        streamConsent: badConsent,
      },
      ctx,
    )
    const started = mod.startStream(res.stream!.id, ctx)
    expect(started.ok).toBe(false)
  })
  it("rejects when called on already-live stream", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    const again = mod.startStream(live.id, ctx)
    expect(again.ok).toBe(false)
    expect(again.errors[0]).toContain("current state")
  })
})

// ---------------------------------------------------------------------------
// §6 heartbeatStream (5)
// ---------------------------------------------------------------------------

describe("heartbeatStream", () => {
  it("re-anchors the chain (cycle 65 lesson 4)", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    const chainBefore = live.chainHash
    const res = mod.heartbeatStream(live.id, 42, ctx)
    expect(res.ok).toBe(true)
    expect(res.stream!.chainHash).not.toBe(chainBefore)
    expect((res.stream as ActiveStream).currentViewerCount).toBe(42)
  })
  it("rejects when not live", () => {
    const ctx = freshCtx()
    const sch = scheduledFixture(ctx)
    const res = mod.heartbeatStream(sch.id, 5, ctx)
    expect(res.ok).toBe(false)
  })
  it("clamps negative viewer counts to 0", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    const res = mod.heartbeatStream(live.id, -10, ctx)
    expect(res.ok).toBe(true)
    expect((res.stream as ActiveStream).currentViewerCount).toBe(0)
  })
  it("clamps viewer counts > MAX", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    const res = mod.heartbeatStream(live.id, 999999999, ctx)
    expect(res.ok).toBe(true)
    expect((res.stream as ActiveStream).currentViewerCount).toBe(mod.MAX_VIEWER_COUNT)
  })
  it("does not break chain after multiple heartbeats", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    let cur: ActiveStream = live
    for (let i = 0; i < 5; i++) {
      const r = mod.heartbeatStream(cur.id, i + 1, ctx)
      expect(r.ok).toBe(true)
      cur = r.stream as ActiveStream
    }
    expect(cur.currentViewerCount).toBe(5)
    const verify = mod.verifyStreamChain(cur.id, ctx.hmacSecret)
    expect(verify.ok).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// §7 endStream (4)
// ---------------------------------------------------------------------------

describe("endStream", () => {
  it("flips live → ended with recording", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    const recording: StreamRecording = {
      provider: "internal",
      url: "https://cdn.cdn/recordings/abc.mp4",
      ready: true,
      byteSize: 12_345_678,
      sha256_16: "0123456789abcdef",
      durationSeconds: 1800,
      replayConsent: VALID_CONSENT,
    }
    const res = mod.endStream(live.id, recording, ctx)
    expect(res.ok).toBe(true)
    expect(res.stream!.state).toBe("ended")
    expect((res.stream as TerminalStream).recording).toEqual(recording)
  })
  it("rejects when called on scheduled (use cancelStream)", () => {
    const ctx = freshCtx()
    const sch = scheduledFixture(ctx)
    const res = mod.endStream(sch.id, null, ctx)
    expect(res.ok).toBe(false)
    expect(res.errors[0]).toContain("cancelStream")
  })
  it("rejects when called twice (terminal)", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    const rec: StreamRecording = {
      provider: "internal",
      url: "https://cdn/abc.mp4",
      ready: true,
      byteSize: 1000,
      sha256_16: "0123456789abcdef",
      durationSeconds: 60,
      replayConsent: VALID_CONSENT,
    }
    mod.endStream(live.id, rec, ctx)
    const again = mod.endStream(live.id, rec, ctx)
    expect(again.ok).toBe(false)
  })
  it("cancelStream flips scheduled → cancelled", () => {
    const ctx = freshCtx()
    const sch = scheduledFixture(ctx)
    const res = mod.cancelStream(sch.id, "host_cancel", ctx)
    expect(res.ok).toBe(true)
    expect(res.stream!.state).toBe("cancelled")
    expect((res.stream as TerminalStream).endReason).toBe("host_cancel")
  })
})

// ---------------------------------------------------------------------------
// §8 joinStream (4)
// ---------------------------------------------------------------------------

describe("joinStream", () => {
  it("returns a ViewerToken and increments viewer count", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    const viewerRef: ViewerRef = { viewerId: "user-raw-99", pseudonymSalt: ctx.pseudonymSalt }
    const res = mod.joinStream(live.id, viewerRef)
    expect(res.ok).toBe(true)
    expect(res.viewerToken.length).toBeGreaterThan(0)
    expect(res.viewerCount).toBe(1)
  })
  it("pseudonymizes viewer id (no raw in token)", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    const viewerRef: ViewerRef = { viewerId: "super-secret-id-AAA", pseudonymSalt: ctx.pseudonymSalt }
    const res = mod.joinStream(live.id, viewerRef)
    expect(res.ok).toBe(true)
    expect(res.viewerToken.includes("super-secret-id-AAA")).toBe(false)
  })
  it("idempotent per token (set semantics)", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    const viewerRef: ViewerRef = { viewerId: "user-A", pseudonymSalt: ctx.pseudonymSalt }
    const t1 = mod.joinStream(live.id, viewerRef)
    const t2 = mod.joinStream(live.id, viewerRef)
    expect(t1.viewerCount).toBe(1)
    expect(t2.viewerCount).toBe(1)
  })
  it("rejects when stream is not live", () => {
    const ctx = freshCtx()
    const sch = scheduledFixture(ctx)
    const res = mod.joinStream(sch.id, { viewerId: "x", pseudonymSalt: "y" })
    expect(res.ok).toBe(false)
    expect(res.error).toContain("state")
  })
})

// ---------------------------------------------------------------------------
// §9 moderateChatMessage (4)
// ---------------------------------------------------------------------------

describe("moderateChatMessage", () => {
  it("allows clean sacred reference (sacred ALWAYS allowed)", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    const msg: ChatMessage = {
      id: "m-1",
      streamId: String(live.id),
      viewerToken: "tok-test",
      text: "O Cigano e a Cigana estão presentes nesta mesa",
      sentAt: FUTURE_START,
      sacredHits: [],
    }
    const res = mod.moderateChatMessage(live.id, msg)
    expect(res.allowed).toBe(true)
    expect(res.isSacred).toBe(true)
    expect(res.sacredHits.length).toBeGreaterThan(0)
  })
  it("flags messages exceeding max length", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    const msg: ChatMessage = {
      id: "m-2",
      streamId: String(live.id),
      viewerToken: "tok-test",
      text: "x".repeat(mod.CHAT_RATE_LIMITS.maxMessageLength + 1),
      sentAt: FUTURE_START,
      sacredHits: [],
    }
    const res = mod.moderateChatMessage(live.id, msg)
    expect(res.allowed).toBe(false)
    expect(res.flags[0]).toContain("message_too_long")
  })
  it("rejects when stream not found", () => {
    const ctx = freshCtx()
    const msg: ChatMessage = {
      id: "m-3",
      streamId: "ghost",
      viewerToken: "t",
      text: "hi",
      sentAt: FUTURE_START,
      sacredHits: [],
    }
    const res = mod.moderateChatMessage("ghost" as unknown as StreamId, msg)
    expect(res.allowed).toBe(false)
    expect(res.flags[0]).toContain("stream_not_found")
  })
  it("rejects when stream is not live", () => {
    const ctx = freshCtx()
    const sch = scheduledFixture(ctx)
    const msg: ChatMessage = {
      id: "m-4",
      streamId: String(sch.id),
      viewerToken: "t",
      text: "hi",
      sentAt: FUTURE_START,
      sacredHits: [],
    }
    const res = mod.moderateChatMessage(sch.id, msg)
    expect(res.allowed).toBe(false)
    expect(res.flags[0]).toContain("stream_not_live")
  })
})

// ---------------------------------------------------------------------------
// §10 rotateStreamKey (3)
// ---------------------------------------------------------------------------

describe("rotateStreamKey", () => {
  it("returns new 32-char key", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    const res = mod.rotateStreamKey(live.id, ctx)
    expect(res.ok).toBe(true)
    expect(res.key).toHaveLength(32)
    expect(res.key).not.toBe((live as ActiveStream).streamKey)
  })
  it("rejects when stream not live", () => {
    const ctx = freshCtx()
    const sch = scheduledFixture(ctx)
    const res = mod.rotateStreamKey(sch.id, ctx)
    expect(res.ok).toBe(false)
  })
  it("re-anchors chain after rotation", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    const chainBefore = live.chainHash
    const res = mod.rotateStreamKey(live.id, ctx)
    expect(res.ok).toBe(true)
    const updated = mod.getStream(live.id) as ActiveStream
    expect(updated.chainHash).not.toBe(chainBefore)
    expect(updated.streamKey).toBe(res.key)
  })
})

// ---------------------------------------------------------------------------
// §11 HMAC chain (4)
// ---------------------------------------------------------------------------

describe("HMAC chain", () => {
  it("sha256Hex returns a 64-char hex string", () => {
    const h = mod.sha256Hex("hello")
    expect(h).toHaveLength(64)
    expect(h).toMatch(/^[0-9a-f]{64}$/)
  })
  it("hmacSha256Hex returns stable 64-char hex", () => {
    const a = mod.hmacSha256Hex("k", "p")
    const b = mod.hmacSha256Hex("k", "p")
    expect(a).toBe(b)
    expect(a).toHaveLength(64)
  })
  it("hmacSha256Hex is sensitive to key", () => {
    const a = mod.hmacSha256Hex("k1", "p")
    const b = mod.hmacSha256Hex("k2", "p")
    expect(a).not.toBe(b)
  })
  it("chainStreamHash emits 64-char hex", () => {
    const ctx = freshCtx()
    const sch = scheduledFixture(ctx)
    const h = mod.chainStreamHash("GENESIS", sch as LiveStream, ctx.hmacSecret)
    expect(h).toHaveLength(64)
    expect(h).toMatch(/^[0-9a-f]{64}$/)
  })
})

// ---------------------------------------------------------------------------
// §12 Sacred catalogs (8)
// ---------------------------------------------------------------------------

describe("sacred catalogs", () => {
  it("CIGANO_CARDS has 36 entries", () => {
    expect(mod.CIGANO_CARDS).toHaveLength(36)
  })
  it("ORIXAS has 16 entries", () => {
    expect(mod.ORIXAS).toHaveLength(16)
  })
  it("ASTROLOGIA has 12 entries", () => {
    expect(mod.ASTROLOGIA).toHaveLength(12)
  })
  it("SEFIROT has 10 entries", () => {
    expect(mod.SEFIROT).toHaveLength(10)
  })
  it("CHAKRAS has 7 entries", () => {
    expect(mod.CHAKRAS).toHaveLength(7)
  })
  it("IFA_ODUS has 15 entries", () => {
    expect(mod.IFA_ODUS).toHaveLength(15)
  })
  it("STREAM_SACRED_TAGS totals 96 entries", () => {
    expect(mod.STREAM_SACRED_TAGS).toHaveLength(96)
  })
  it("isSacredTag is true for known + false for unknown", () => {
    expect(mod.isSacredTag("Exu")).toBe(true)
    expect(mod.isSacredTag("Cigano")).toBe(true)
    expect(mod.isSacredTag("Muladhara")).toBe(true)
    expect(mod.isSacredTag("not-a-sacred-tag")).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// §13 auditLiveStreamCoverage (3)
// ---------------------------------------------------------------------------

describe("auditLiveStreamCoverage", () => {
  it("isFullCoverage is true at module init", () => {
    const cov = mod.auditLiveStreamCoverage()
    expect(cov.isFullCoverage).toBe(true)
  })
  it("totalSymbols === 96", () => {
    const cov = mod.auditLiveStreamCoverage()
    expect(cov.totalSymbols).toBe(96)
  })
  it("every tradition floor met", () => {
    const cov = mod.auditLiveStreamCoverage()
    expect(cov.traditionFloorMet.CIGANO).toBe(true)
    expect(cov.traditionFloorMet.ORIXAS).toBe(true)
    expect(cov.traditionFloorMet.ASTROLOGIA).toBe(true)
    expect(cov.traditionFloorMet.SEFIROT).toBe(true)
    expect(cov.traditionFloorMet.CHAKRAS).toBe(true)
    expect(cov.traditionFloorMet.IFA).toBe(true)
    expect(cov.missingTraditions).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// §14 verifyStreamChain (3)
// ---------------------------------------------------------------------------

describe("verifyStreamChain", () => {
  it("verifies a freshly scheduled stream", () => {
    const ctx = freshCtx()
    const sch = scheduledFixture(ctx)
    const v = mod.verifyStreamChain(sch.id, ctx.hmacSecret)
    expect(v.ok).toBe(true)
    expect(v.reason).toBe(null)
  })
  it("rejects after secret tampering", () => {
    const ctx = freshCtx()
    const sch = scheduledFixture(ctx)
    const v = mod.verifyStreamChain(sch.id, "wrong-secret")
    expect(v.ok).toBe(false)
  })
  it("verifies after start → heartbeat → end sequence", () => {
    const ctx = freshCtx()
    const live = liveFixture(ctx)
    mod.heartbeatStream(live.id, 12, ctx)
    const rec: StreamRecording = {
      provider: "internal",
      url: "https://x/y.mp4",
      ready: true,
      byteSize: 999,
      sha256_16: "fedcba9876543210",
      durationSeconds: 90,
      replayConsent: VALID_CONSENT,
    }
    mod.endStream(live.id, rec, ctx)
    const v = mod.verifyStreamChain(live.id, ctx.hmacSecret)
    expect(v.ok).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// §15 LGPD pseudonymization (2)
// ---------------------------------------------------------------------------

describe("LGPD pseudonymization", () => {
  it("pseudonymizeViewer never returns raw viewerId", () => {
    const a = mod.pseudonymizeViewer("raw-secret-id-XYZ", "salt-A")
    const b = mod.pseudonymizeViewer("raw-secret-id-XYZ", "salt-B")
    expect(a).not.toContain("raw-secret-id-XYZ")
    expect(a).not.toBe(b)
    expect(a.length).toBeGreaterThan(0)
  })
  it("signViewerToken produces a non-empty branded string", () => {
    const tok = mod.signViewerToken({ viewerId: "u-1", pseudonymSalt: "s-1" }, "k-1")
    expect(tok.length).toBe(28) // 12 + 16
  })
})

// ---------------------------------------------------------------------------
// §16 helpers + factories (4)
// ---------------------------------------------------------------------------

describe("helpers", () => {
  it("emptyStreamCounters returns fresh zeros", () => {
    const a = mod.emptyStreamCounters()
    expect(a.viewCount).toBe(0)
    expect(a.joinCount).toBe(0)
    expect(a.chatCount).toBe(0)
  })
  it("clampViewerCount handles NaN, Infinity, negatives", () => {
    expect(mod.clampViewerCount(10)).toBe(10)
    expect(mod.clampViewerCount(-1)).toBe(0)
    expect(mod.clampViewerCount(NaN)).toBe(0)
    expect(mod.clampViewerCount(Infinity)).toBe(mod.MIN_VIEWER_COUNT)
  })
  it("sacredStreamTopics returns CEREMONY + MESA_REAL", () => {
    const topics = mod.sacredStreamTopics()
    expect(topics).toContain("CEREMONY")
    expect(topics).toContain("MESA_REAL")
  })
  it("buildSacredRegex handles UTF-8 accented chars", () => {
    const rx = mod.buildSacredRegex("Iemanjá")
    expect(rx.test("Iemanjá")).toBe(true)
    expect(rx.test(" Iemanjá ")).toBe(true)
    expect(rx.test("WordIemanjá")).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Entry point — run + report
// ---------------------------------------------------------------------------

console.log("═".repeat(72))
console.log("  w66 live-streams — self-running harness")
console.log("═".repeat(72))
console.log(`  passes: ${tally.passes()}`)
console.log(`  fails:  ${tally.fails()}`)
const failList = tally.failures()
if (failList.length > 0) {
  console.log("─".repeat(72))
  for (const f of failList) console.log(`  ✗ ${f}`)
  console.log("═".repeat(72))
  ;((globalThis as unknown) as { process: { exit(code?: number): never } }).process.exit(1)
}
console.log("═".repeat(72))
console.log("  ALL PASS ✅")
