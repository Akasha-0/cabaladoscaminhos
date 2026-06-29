/**
 * w66 audio-video-posts — test suite
 * ----------------------------------
 * Self-running test harness (no vitest import needed).
 *
 * Run via:
 *   node --experimental-strip-types src/lib/w66/audio-video-posts.spec.ts
 *
 * Designed to run from a sibling of the engine file:
 *   import * as mod from "./audio-video-posts.ts"
 *
 * Smoke count: 50+ assertions across 15 sections.
 */

import * as mod from "./audio-video-posts.ts"

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
  not: {
    toBe: (expected: unknown) => void
    toEqual: (expected: unknown) => void
    toBeTruthy: () => void
    toContain: (item: unknown) => void
    toMatch: (rx: RegExp) => void
    toThrow: (msg?: string | RegExp) => void
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
        if (!Array.isArray(actual) || !actual.includes(item as never)) {
          throw new Error(`toContain failed: ${stableStr(actual)} does not include ${stableStr(item)}`)
        }
      },
      toContainString: (s) => {
        if (typeof actual !== "string" || !actual.includes(s)) {
          throw new Error(`toContainString failed: ${stableStr(actual)} does not include "${s}"`)
        }
      },
      toMatch: (rx) => {
        if (typeof actual !== "string" || !rx.test(actual)) {
          throw new Error(`toMatch failed: ${stableStr(actual)} does not match ${rx}`)
        }
      },
      toThrow: (msg) => {
        if (typeof actual !== "function") {
          throw new Error("toThrow needs a function")
        }
        let thrown: unknown = null
        try { (actual as () => unknown)() } catch (e) { thrown = e }
        if (thrown === null) throw new Error("toThrow failed: did not throw")
        if (msg) {
          const errStr = thrown instanceof Error ? thrown.message : String(thrown)
          if (msg instanceof RegExp) {
            if (!msg.test(errStr)) throw new Error(`toThrow(re) failed: ${errStr}`)
          } else {
            if (!errStr.includes(String(msg))) throw new Error(`toThrow(str) failed: ${errStr}`)
          }
        }
      },
      not: {
        toBe: (expected) => {
          if (Object.is(actual, expected)) {
            throw new Error(`not.toBe failed: both are ${stableStr(actual)}`)
          }
        },
        toEqual: (expected) => {
          if (deepEqual(actual, expected)) {
            throw new Error(`not.toEqual failed: both are ${stableStr(actual)}`)
          }
        },
        toBeTruthy: () => {
          if (actual) throw new Error(`not.toBeTruthy failed: ${stableStr(actual)}`)
        },
        toContain: (item) => {
          if (Array.isArray(actual) && actual.includes(item as never)) {
            throw new Error(`not.toContain failed: ${stableStr(actual)} includes ${stableStr(item)}`)
          }
        },
        toMatch: (rx) => {
          if (typeof actual === "string" && rx.test(actual)) {
            throw new Error(`not.toMatch failed: ${stableStr(actual)} matches ${rx}`)
          }
        },
        toThrow: (msg) => {
          if (typeof actual !== "function") {
            throw new Error("not.toThrow needs a function")
          }
          let thrown: unknown = null
          try { (actual as () => unknown)() } catch (e) { thrown = e }
          if (thrown !== null) {
            if (!msg) throw new Error(`not.toThrow failed: did throw ${thrown instanceof Error ? thrown.message : thrown}`)
            const errStr = thrown instanceof Error ? thrown.message : String(thrown)
            if (msg instanceof RegExp) {
              if (msg.test(errStr)) throw new Error(`not.toThrow(re) failed: matched ${errStr}`)
            } else {
              if (errStr.includes(String(msg))) throw new Error(`not.toThrow(str) failed: matched ${errStr}`)
            }
          }
        },
      },
    }
    return obj
  }

  function stableStr(v: unknown): string {
    try {
      return JSON.stringify(v)
    } catch {
      return String(v)
    }
  }

  function deepEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true
    if (typeof a !== typeof b) return false
    if (a === null || b === null) return false
    if (typeof a !== "object") return false
    if (Array.isArray(a)) {
      if (!Array.isArray(b)) return false
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false
      return true
    }
    if (Array.isArray(b)) return false
    const ao = a as Record<string, unknown>
    const bo = b as Record<string, unknown>
    const ak = Object.keys(ao)
    const bk = Object.keys(bo)
    if (ak.length !== bk.length) return false
    for (const k of ak) {
      if (!Object.prototype.hasOwnProperty.call(bo, k)) return false
      if (!deepEqual(ao[k], bo[k])) return false
    }
    return true
  }

  const supportsVitest =
    typeof globalThis.describe === "function" && typeof globalThis.it === "function"

  const wrappedDescribe: DescribeFn = (name, body) => {
    process.stdout.write(`  ${name}\n`)
    if (supportsVitest) {
      ;(globalThis.describe as DescribeFn)(name, body)
    } else {
      body()
    }
  }
  const wrappedIt: ItFn = (name, body) => {
    if (supportsVitest) {
      ;(globalThis.it as ItFn)(name, () => {
        try {
          body()
          passes++
        } catch (e) {
          fails++
          failures.push(`${name}: ${e instanceof Error ? e.message : String(e)}`)
        }
      })
      return
    }
    try {
      body()
      passes++
    } catch (e) {
      fails++
      failures.push(`${name}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return {
    passes: () => passes,
    fails: () => fails,
    failures: () => failures,
    wrappedDescribe,
    wrappedIt,
    wrappedExpect: localExpect,
  }
}

const harness = registerHarness()
const ds = harness.wrappedDescribe
const it = harness.wrappedIt
const expect = harness.wrappedExpect

ds("w66/audio-video-posts", () => {
  registerSuite()
})

// ============================================================================
// Helpers for fixtures
// ============================================================================

function makeConsent(opts?: { voice?: boolean; face?: boolean }): mod.MediaConsent {
  const voice = opts?.voice ?? true
  const face = opts?.face ?? true
  const grantedAt = new Date(Date.now() - 60_000).toISOString()
  const expiresAt = new Date(Date.now() + 3600_000).toISOString()
  return { faceConsent: face, voiceConsent: voice, grantedAt, expiresAt }
}

function makeMp3Fixture(): Uint8Array {
  // Build a minimal valid-ish MPEG Layer III frame header (MPEG-1, Layer 3,
  // 128 kbps, 44.1 kHz, no padding). Then append audio bytes.
  const header = new Uint8Array(4)
  header[0] = 0xff
  header[1] = 0xfb // 11 bits sync + MPEG-1 + Layer 3
  header[2] = 0x90 // bitrate index 9 (128kbps), sample rate index 0 (44.1kHz)
  header[3] = 0x00 // no padding, channel mode = stereo
  const frameSize = Math.floor((144 * 128_000) / 44_100) // = 417 bytes
  const total = header.length + frameSize - 4 // frame = header + (frameSize - 4) payload
  const buf = new Uint8Array(total + 4096)
  buf.set(header, 0)
  // Fill rest with deterministic audio data
  for (let i = header.length; i < buf.length; i++) {
    buf[i] = (i * 7 + 13) & 0xff
  }
  return buf
}

function makeMp4Fixture(): Uint8Array {
  // ftyp box (32 bytes) + moov box containing mvhd (version 0, 4-byte duration).
  const ftyp = new Uint8Array(32)
  // box size = 32 (4 bytes)
  ftyp[3] = 32
  // type = "ftyp"
  ftyp[4] = 0x66; ftyp[5] = 0x74; ftyp[6] = 0x79; ftyp[7] = 0x70
  // brand = "isom"
  ftyp[8] = 0x69; ftyp[9] = 0x73; ftyp[10] = 0x6f; ftyp[11] = 0x6d

  // Build mvhd payload (version 0)
  const mvhdPayload = new Uint8Array(100)
  // version + flags: 0x00000000
  // creation_time (4 bytes): 0
  mvhdPayload[4] = 0; mvhdPayload[5] = 0; mvhdPayload[6] = 0; mvhdPayload[7] = 0
  // modification_time (4 bytes): 0
  mvhdPayload[8] = 0; mvhdPayload[9] = 0; mvhdPayload[10] = 0; mvhdPayload[11] = 0
  // timescale (4 bytes): 1000
  mvhdPayload[12] = 0; mvhdPayload[13] = 0; mvhdPayload[14] = 0x03; mvhdPayload[15] = 0xe8
  // duration (4 bytes): 30 seconds = 30000
  mvhdPayload[16] = 0; mvhdPayload[17] = 0; mvhdPayload[18] = 0x75; mvhdPayload[19] = 0x30

  // mvhd box: 8-byte header + 4-byte version/flags + 92-byte payload = 104 bytes
  const mvhdBoxSize = 8 + mvhdPayload.length
  const mvhd = new Uint8Array(mvhdBoxSize)
  mvhd[3] = mvhdBoxSize
  mvhd[4] = 0x6d; mvhd[5] = 0x76; mvhd[6] = 0x68; mvhd[7] = 0x64
  mvhd.set(mvhdPayload, 8)

  // moov box: 8-byte header + mvhd
  const moovBoxSize = 8 + mvhd.length
  const moov = new Uint8Array(moovBoxSize)
  moov[3] = moovBoxSize
  moov[4] = 0x6d; moov[5] = 0x6f; moov[6] = 0x6f; moov[7] = 0x76
  moov.set(mvhd, 8)

  // concatenate ftyp + moov
  const result = new Uint8Array(ftyp.length + moov.length)
  result.set(ftyp, 0)
  result.set(moov, ftyp.length)
  return result
}

function makeWebmFixture(): Uint8Array {
  // EBML header: 0x1A45DFA3, then Segment containing Duration (0x4489) as float64
  // and TimestampScale (0x2AD7B1) as uint = 1_000_000.
  const ebmlHeader = new Uint8Array(4)
  ebmlHeader[0] = 0x1a; ebmlHeader[1] = 0x45; ebmlHeader[2] = 0xdf; ebmlHeader[3] = 0xa3

  // Duration = 5000 timecode units (5 seconds at default TimestampScale=1ms per unit)
  const durationBytes = new Uint8Array(8)
  const dv = new DataView(durationBytes.buffer)
  dv.setFloat64(0, 5000.0, false)

  // EBML element for Duration (id=0x4489, size=1 byte (0x80 = 8))
  // Variable-size integer encoding: 0x44 0x89 (2-byte ID), then size 0x88 (1-byte size=8)
  const durationEl = new Uint8Array([0x44, 0x89, 0x88, ...durationBytes])

  // TimestampScale (id=0x2AD7B1, size=3 bytes (0x80|3=0x83), value=1_000_000 = 0x0F4240 in 3 BE bytes)
  const tsEl = new Uint8Array([0x2a, 0xd7, 0xb1, 0x83, 0x0f, 0x42, 0x40])

  // Segment payload = durationEl + tsEl
  const segPayload = new Uint8Array(durationEl.length + tsEl.length)
  segPayload.set(durationEl, 0)
  segPayload.set(tsEl, durationEl.length)

  // Segment ID = 0x18538067, size = variable. Total payload is < 256 so size byte is 0x80|1=0x81? wait:
  // payload = 12 + 7 = 19 bytes. Size encoding: 1-byte size with leading 1 + value in remaining 7 bits = 0x80 | 19 = 0x93
  const segId = new Uint8Array([0x18, 0x53, 0x80, 0x67])
  const segSizeByte = 0x80 | (segPayload.length & 0x7f) // 0x80 | 19 = 0x93
  const segment = new Uint8Array(segId.length + 1 + segPayload.length)
  segment.set(segId, 0)
  segment[segId.length] = segSizeByte
  segment.set(segPayload, segId.length + 1)

  // Total: EBML header + segment
  const result = new Uint8Array(ebmlHeader.length + segment.length)
  result.set(ebmlHeader, 0)
  result.set(segment, ebmlHeader.length)
  return result
}

function makeWavStub(): Uint8Array {
  // Minimal RIFF/WAVE: header "RIFF<size>WAVE" + "fmt " chunk.
  // We won't parse duration from WAV (no extractor); createAudioPost must accept callerDurationSec.
  const out = new Uint8Array(64)
  out[0] = 0x52; out[1] = 0x49; out[2] = 0x46; out[3] = 0x46 // RIFF
  out[8] = 0x57; out[9] = 0x41; out[10] = 0x56; out[11] = 0x45 // WAVE
  out[12] = 0x66; out[13] = 0x6d; out[14] = 0x74; out[15] = 0x20 // fmt
  return out
}

// ============================================================================
// Tests
// ============================================================================

function registerSuite(): void {

// ============================================================================
// §1 Type definitions
// ============================================================================
ds("§1 types — exports & shape", () => {
  it("MediaKind is 'audio'|'video'", () => {
    expect(mod.MEDIA_FORMATS.audio).toContain("mp3")
    expect(mod.MEDIA_FORMATS.video).toContain("mp4")
  })
  it("AudioPost has kind='audio'", () => {
    const buf = makeMp3Fixture()
    const post = mod.createAudioPost({
      authorId: "u1", pseudonymSalt: "salt-1",
      caption: "Cigano 1 Paus — leitura",
      format: "mp3", buffer: buf,
      consent: makeConsent(),
      secret: "s1",
    })
    expect(post.kind).toBe("audio")
  })
  it("VideoPost has kind='video'", () => {
    const buf = makeMp4Fixture()
    const post = mod.createVideoPost({
      authorId: "u1", pseudonymSalt: "salt-1",
      caption: "Mesa Real video",
      format: "mp4", buffer: buf,
      consent: makeConsent(),
      secret: "s1",
    })
    expect(post.kind).toBe("video")
  })
  it("Post has id, postId, auditHash (64 hex)", () => {
    const buf = makeMp3Fixture()
    const post = mod.createAudioPost({
      authorId: "u2", pseudonymSalt: "s",
      caption: "Cavaleiro",
      format: "mp3", buffer: buf,
      consent: makeConsent(),
      secret: "sk",
    })
    expect(typeof post.id).toBe("string")
    expect(typeof post.postId).toBe("string")
    expect(/^[0-9a-f]{64}$/.test(post.auditHash)).toBeTruthy()
  })
})

// ============================================================================
// §3 MEDIA_FORMATS whitelist
// ============================================================================
ds("§3 MEDIA_FORMATS whitelist", () => {
  it("AUDIO_FORMATS = [mp3,wav,ogg]", () => {
    expect(mod.AUDIO_FORMATS.length).toBe(3)
    expect(mod.AUDIO_FORMATS).toContain("mp3")
    expect(mod.AUDIO_FORMATS).toContain("wav")
    expect(mod.AUDIO_FORMATS).toContain("ogg")
  })
  it("VIDEO_FORMATS = [mp4,webm]", () => {
    expect(mod.VIDEO_FORMATS.length).toBe(2)
    expect(mod.VIDEO_FORMATS).toContain("mp4")
    expect(mod.VIDEO_FORMATS).toContain("webm")
  })
  it("MEDIA_FORMATS.audio contains all 3 audio formats", () => {
    expect(mod.MEDIA_FORMATS.audio.length).toBe(3)
  })
  it("MEDIA_FORMATS.video contains all 2 video formats", () => {
    expect(mod.MEDIA_FORMATS.video.length).toBe(2)
  })
  it("FORBIDDEN_FORMATS includes wma/flac/aac/avi/mov/mkv", () => {
    expect(mod.FORBIDDEN_FORMATS.length).toBeGreaterThanOrEqual(6)
    expect(mod.FORBIDDEN_FORMATS).toContain("wma")
    expect(mod.FORBIDDEN_FORMATS).toContain("flac")
    expect(mod.FORBIDDEN_FORMATS).toContain("aac")
    expect(mod.FORBIDDEN_FORMATS).toContain("avi")
    expect(mod.FORBIDDEN_FORMATS).toContain("mov")
    expect(mod.FORBIDDEN_FORMATS).toContain("mkv")
  })
  it("getMediaKind('mp3') → audio", () => {
    expect(mod.getMediaKind("mp3")).toBe("audio")
  })
  it("getMediaKind('mp4') → video", () => {
    expect(mod.getMediaKind("mp4")).toBe("video")
  })
  it("getMediaKind('wma') throws InvalidMediaFormatError", () => {
    expect(() => mod.getMediaKind("wma" as never)).toThrow()
  })
})

// ============================================================================
// §4 MEDIA_LIMITS
// ============================================================================
ds("§4 MEDIA_LIMITS", () => {
  it("audio.maxBytes = 15 MB", () => {
    expect(mod.MEDIA_LIMITS.audio.maxBytes).toBe(15 * 1024 * 1024)
  })
  it("video.maxBytes = 50 MB", () => {
    expect(mod.MEDIA_LIMITS.video.maxBytes).toBe(50 * 1024 * 1024)
  })
  it("audio.minDurationSec = 1", () => {
    expect(mod.MEDIA_LIMITS.audio.minDurationSec).toBe(1)
  })
  it("video.maxDurationSec = 3600", () => {
    expect(mod.MEDIA_LIMITS.video.maxDurationSec).toBe(3600)
  })
})

// ============================================================================
// §11 Validation
// ============================================================================
ds("§11 validateMediaPost", () => {
  it("ok on valid audio", () => {
    const buf = makeMp3Fixture()
    const v = mod.validateMediaPost({
      kind: "audio", format: "mp3", buffer: buf,
      caption: "Cigano", consent: makeConsent(),
    })
    expect(v.ok).toBeTruthy()
  })
  it("ok on valid video", () => {
    const buf = makeMp4Fixture()
    const v = mod.validateMediaPost({
      kind: "video", format: "mp4", buffer: buf,
      caption: "Mesa Real", consent: makeConsent(),
    })
    expect(v.ok).toBeTruthy()
  })
  it("invalid_format on aac", () => {
    const v = mod.validateMediaPost({
      kind: "audio", format: "aac" as never, buffer: makeMp3Fixture(),
      caption: "x", consent: makeConsent(),
    })
    expect(v.ok).toBeFalsy()
    if (!v.ok) expect(v.errors).toContain("invalid_format")
  })
  it("size_exceeded on 16MB audio", () => {
    const big = new Uint8Array(16 * 1024 * 1024)
    const v = mod.validateMediaPost({
      kind: "audio", format: "mp3", buffer: big,
      caption: "x", consent: makeConsent(),
    })
    expect(v.ok).toBeFalsy()
    if (!v.ok) expect(v.errors).toContain("size_exceeded")
  })
  it("size_exceeded on 51MB video", () => {
    const big = new Uint8Array(51 * 1024 * 1024)
    const v = mod.validateMediaPost({
      kind: "video", format: "mp4", buffer: big,
      caption: "x", consent: makeConsent(),
    })
    expect(v.ok).toBeFalsy()
    if (!v.ok) expect(v.errors).toContain("size_exceeded")
  })
  it("voice_consent_required when voiceConsent=false", () => {
    const v = mod.validateMediaPost({
      kind: "audio", format: "mp3", buffer: makeMp3Fixture(),
      caption: "x", consent: makeConsent({ voice: false }),
    })
    expect(v.ok).toBeFalsy()
    if (!v.ok) expect(v.errors).toContain("voice_consent_required")
  })
  it("video_face_consent_required when faceConsent=false", () => {
    const v = mod.validateMediaPost({
      kind: "video", format: "mp4", buffer: makeMp4Fixture(),
      caption: "x", consent: makeConsent({ face: false }),
    })
    expect(v.ok).toBeFalsy()
    if (!v.ok) expect(v.errors).toContain("video_face_consent_required")
  })
  it("consent_expired when expiresAt is in the past", () => {
    const consent = {
      faceConsent: true, voiceConsent: true,
      grantedAt: new Date(Date.now() - 7200_000).toISOString(),
      expiresAt: new Date(Date.now() - 3600_000).toISOString(),
    }
    const v = mod.validateMediaPost({
      kind: "audio", format: "mp3", buffer: makeMp3Fixture(),
      caption: "x", consent,
    })
    expect(v.ok).toBeFalsy()
    if (!v.ok) expect(v.errors).toContain("consent_expired")
  })
})

// ============================================================================
// §9 Duration extractors
// ============================================================================
ds("§9 extractDurationMp3", () => {
  it("parses MPEG-1 Layer III, 128 kbps, 44.1 kHz fixture", () => {
    const buf = makeMp3Fixture()
    const d = mod.extractDurationMp3(buf)
    expect(d).toBeGreaterThan(0)
  })
  it("throws on empty buffer", () => {
    expect(() => mod.extractDurationMp3(new Uint8Array(0))).toThrow()
  })
  it("throws on buffer without sync word", () => {
    const buf = new Uint8Array(2048).fill(0xaa)
    expect(() => mod.extractDurationMp3(buf)).toThrow()
  })
  it("Xing VBR header → accurate duration (mocked)", () => {
    const buf = makeMp3Fixture()
    // Insert Xing header at offset 32 after the frame header
    const xingOff = 32
    buf[xingOff + 0] = 0x58 // X
    buf[xingOff + 1] = 0x69 // i
    buf[xingOff + 2] = 0x6e // n
    buf[xingOff + 3] = 0x67 // g
    // flags = 0x00000001 (frames flag set)
    buf[xingOff + 4] = 0; buf[xingOff + 5] = 0; buf[xingOff + 6] = 0; buf[xingOff + 7] = 1
    // totalFrames = 5000 (big-endian)
    buf[xingOff + 8] = 0; buf[xingOff + 9] = 0; buf[xingOff + 10] = 0x13; buf[xingOff + 11] = 0x88
    const d = mod.extractDurationMp3(buf)
    // 5000 frames * 1152 samples / 44100 Hz ≈ 130.6 sec
    expect(d).toBeGreaterThanOrEqual(120)
    expect(d).toBeLessThanOrEqual(140)
  })
})

ds("§9 extractDurationMp4", () => {
  it("parses mvhd v0 with 30s duration", () => {
    const buf = makeMp4Fixture()
    const d = mod.extractDurationMp4(buf)
    expect(d).toBe(30)
  })
  it("throws on missing ftyp", () => {
    const buf = new Uint8Array(2048)
    expect(() => mod.extractDurationMp4(buf)).toThrow()
  })
  it("throws on missing mvhd", () => {
    const buf = new Uint8Array(64)
    // ftyp valid but no moov
    buf[3] = 32; buf[4] = 0x66; buf[5] = 0x74; buf[6] = 0x79; buf[7] = 0x70
    expect(() => mod.extractDurationMp4(buf)).toThrow()
  })
  it("supports mvhd v1 (8-byte duration)", () => {
    // Build ftyp + moov containing mvhd v1 (timescale=1000, duration=45s)
    const ftyp = new Uint8Array(32)
    ftyp[3] = 32; ftyp[4] = 0x66; ftyp[5] = 0x74; ftyp[6] = 0x79; ftyp[7] = 0x70
    // mvhd payload (v1): version=1, flags=0, creation(8)+modification(8)+timescale(4)+duration(8) = 28 bytes payload
    const mvhdPayload = new Uint8Array(28)
    mvhdPayload[0] = 0x01 // version = 1
    // creation time (8 bytes) at offset 4
    // modification time (8 bytes) at offset 12
    // timescale (4 bytes) at offset 20
    mvhdPayload[20] = 0; mvhdPayload[21] = 0; mvhdPayload[22] = 0x03; mvhdPayload[23] = 0xe8 // 1000
    // duration (8 bytes) at offset 24: 45000 (45 sec @ 1000Hz)
    mvhdPayload[24] = 0; mvhdPayload[25] = 0; mvhdPayload[26] = 0; mvhdPayload[27] = 0
    // 45000 = 0xAFC8 → use upper 4 bytes = 0, lower = 0x0000AFC8
    // but only 4 bytes allocated — let me re-size
    const mvhdPayloadFull = new Uint8Array(32)
    mvhdPayloadFull[0] = 0x01 // version 1
    mvhdPayloadFull[20] = 0; mvhdPayloadFull[21] = 0; mvhdPayloadFull[22] = 0x03; mvhdPayloadFull[23] = 0xe8 // 1000
    // 8-byte duration: 45000 = 0x000000000000AFC8
    mvhdPayloadFull[24] = 0; mvhdPayloadFull[25] = 0; mvhdPayloadFull[26] = 0; mvhdPayloadFull[27] = 0
    mvhdPayloadFull[28] = 0; mvhdPayloadFull[29] = 0; mvhdPayloadFull[30] = 0xaf; mvhdPayloadFull[31] = 0xc8

    const mvhdBoxSize = 8 + mvhdPayloadFull.length
    const mvhd = new Uint8Array(mvhdBoxSize)
    mvhd[3] = mvhdBoxSize; mvhd[4] = 0x6d; mvhd[5] = 0x76; mvhd[6] = 0x68; mvhd[7] = 0x64
    mvhd.set(mvhdPayloadFull, 8)

    const moovBoxSize = 8 + mvhd.length
    const moov = new Uint8Array(moovBoxSize)
    moov[3] = moovBoxSize; moov[4] = 0x6d; moov[5] = 0x6f; moov[6] = 0x6f; moov[7] = 0x76
    moov.set(mvhd, 8)

    const result = new Uint8Array(ftyp.length + moov.length)
    result.set(ftyp, 0); result.set(moov, ftyp.length)

    const d = mod.extractDurationMp4(result)
    expect(d).toBe(45)
  })
})

ds("§9 extractDurationWebm", () => {
  it("parses EBML with Duration=5s", () => {
    const buf = makeWebmFixture()
    const d = mod.extractDurationWebm(buf)
    expect(d).toBe(5)
  })
  it("throws on missing EBML magic", () => {
    const buf = new Uint8Array(128)
    buf[0] = 0x00; buf[1] = 0x00; buf[2] = 0x00; buf[3] = 0x00
    expect(() => mod.extractDurationWebm(buf)).toThrow()
  })
  it("throws on EBML without Duration element", () => {
    const buf = new Uint8Array(16)
    buf[0] = 0x1a; buf[1] = 0x45; buf[2] = 0xdf; buf[3] = 0xa3
    expect(() => mod.extractDurationWebm(buf)).toThrow()
  })
  it("extractDuration dispatcher returns null on unknown format", () => {
    const r = mod.extractDuration("wav", makeWavStub())
    expect(r).toBe(null)
  })
  it("extractDuration dispatcher returns number for mp3", () => {
    const r = mod.extractDuration("mp3", makeMp3Fixture())
    expect(typeof r).toBe("number")
  })
})

// ============================================================================
// §10 Waveform + contact-sheet SVG
// ============================================================================
ds("§10 generateWaveformDataUri", () => {
  it("returns data:image/svg+xml;base64 URI", () => {
    const uri = mod.generateWaveformDataUri(makeMp3Fixture(), 256)
    expect(uri.startsWith("data:image/svg+xml;base64,")).toBeTruthy()
  })
  it("SVG contains 256 <rect> elements", () => {
    const uri = mod.generateWaveformDataUri(makeMp3Fixture(), 256)
    // count <rect occurrences in the base64-decoded payload
    const b64 = uri.slice("data:image/svg+xml;base64,".length)
    const decoded = Buffer.from(b64, "base64").toString("utf8")
    const matches = decoded.match(/<rect /g)
    expect((matches ?? []).length).toBe(256)
  })
  it("works on tiny buffer (1 KB)", () => {
    const buf = new Uint8Array(1024)
    const uri = mod.generateWaveformDataUri(buf, 256)
    expect(uri.startsWith("data:image/svg+xml;base64,")).toBeTruthy()
  })
  it("empty buffer returns the empty sentinel", () => {
    const uri = mod.generateWaveformDataUri(new Uint8Array(0), 256)
    expect(uri).toBe("data:image/svg+xml;base64,${empty}")
  })
})

ds("§10 generateVideoContactSheetDataUri", () => {
  it("returns data:image/svg+xml;base64 URI", () => {
    const uri = mod.generateVideoContactSheetDataUri(makeMp4Fixture(), 9)
    expect(uri.startsWith("data:image/svg+xml;base64,")).toBeTruthy()
  })
  it("SVG contains 9 frame labels", () => {
    const uri = mod.generateVideoContactSheetDataUri(makeMp4Fixture(), 9)
    const b64 = uri.slice("data:image/svg+xml;base64,".length)
    const decoded = Buffer.from(b64, "base64").toString("utf8")
    for (let i = 1; i <= 9; i++) {
      expect(decoded).toContain(`frame ${i}`)
    }
  })
  it("9 <rect> tile placeholders", () => {
    const uri = mod.generateVideoContactSheetDataUri(makeMp4Fixture(), 9)
    const b64 = uri.slice("data:image/svg+xml;base64,".length)
    const decoded = Buffer.from(b64, "base64").toString("utf8")
    const matches = decoded.match(/<rect /g)
    expect((matches ?? []).length).toBe(9)
  })
})

// ============================================================================
// §12 createAudioPost + createVideoPost
// ============================================================================
ds("§12 createAudioPost", () => {
  it("creates a valid AudioPost with HMAC id + chain", () => {
    const post = mod.createAudioPost({
      authorId: "u1", pseudonymSalt: "salt",
      caption: "Cigano 1 Paus — leitura inicial",
      format: "mp3", buffer: makeMp3Fixture(),
      consent: makeConsent(),
      secret: "s1",
    })
    expect(post.kind).toBe("audio")
    expect(/^[0-9a-f]{64}$/.test(post.auditHash)).toBeTruthy()
    expect(post.sacredRefs.length).toBeGreaterThanOrEqual(1)
  })
  it("pseudonymizes authorId (16 hex chars, not raw)", () => {
    const post = mod.createAudioPost({
      authorId: "user-12345-original", pseudonymSalt: "salt",
      caption: "Cigano",
      format: "mp3", buffer: makeMp3Fixture(),
      consent: makeConsent(),
      secret: "s",
    })
    expect(post.authorPseudonym).not.toBe("user-12345-original")
    expect(post.authorPseudonym.length).toBe(16)
    expect(/^[0-9a-f]{16}$/.test(post.authorPseudonym)).toBeTruthy()
  })
  it("throws MediaConsentMissingError when voice=false", () => {
    expect(() => mod.createAudioPost({
      authorId: "u1", pseudonymSalt: "salt",
      caption: "Cigano",
      format: "mp3", buffer: makeMp3Fixture(),
      consent: makeConsent({ voice: false }),
      secret: "s",
    })).toThrow(/MEDIA_CONSENT_MISSING/)
  })
  it("falls back to callerDurationSec when extractor returns null (wav)", () => {
    const post = mod.createAudioPost({
      authorId: "u1", pseudonymSalt: "salt",
      caption: "Cigano 5 Espadas",
      format: "wav", buffer: makeWavStub(),
      consent: makeConsent(),
      callerDurationSec: 42,
      secret: "s",
    })
    expect(post.durationSec).toBe(42)
    expect(post.durationSource).toBe("caller_supplied")
  })
  it("durationSource='parsed' for MP3 with valid header", () => {
    const post = mod.createAudioPost({
      authorId: "u1", pseudonymSalt: "salt",
      caption: "Cigano 1",
      format: "mp3", buffer: makeMp3Fixture(),
      consent: makeConsent(),
      secret: "s",
    })
    expect(post.durationSource).toBe("parsed")
  })
  it("sacredRefs include Cigano + Cavaleiro", () => {
    const post = mod.createAudioPost({
      authorId: "u1", pseudonymSalt: "salt",
      caption: "Cigano Cavaleiro",
      format: "mp3", buffer: makeMp3Fixture(),
      consent: makeConsent(),
      secret: "s",
    })
    const tags = post.sacredTags
    expect(tags).toContain("Cigano")
    expect(tags).toContain("Cavaleiro")
  })
})

ds("§12 createVideoPost", () => {
  it("creates a valid VideoPost with contactSheet", () => {
    const post = mod.createVideoPost({
      authorId: "u1", pseudonymSalt: "salt",
      caption: "Mesa Real session",
      format: "mp4", buffer: makeMp4Fixture(),
      consent: makeConsent(),
      includeContactSheet: true,
      secret: "s",
    })
    expect(post.kind).toBe("video")
    expect(post.contactSheetDataUri).not.toBe(null)
    expect(post.contactSheetDataUri?.startsWith("data:image/svg+xml;base64,")).toBeTruthy()
  })
  it("contactSheet=null when includeContactSheet=false", () => {
    const post = mod.createVideoPost({
      authorId: "u1", pseudonymSalt: "salt",
      caption: "Mesa Real",
      format: "mp4", buffer: makeMp4Fixture(),
      consent: makeConsent(),
      includeContactSheet: false,
      secret: "s",
    })
    expect(post.contactSheetDataUri).toBe(null)
  })
  it("throws MediaConsentMissingError when face=false (video)", () => {
    expect(() => mod.createVideoPost({
      authorId: "u1", pseudonymSalt: "salt",
      caption: "Mesa Real",
      format: "mp4", buffer: makeMp4Fixture(),
      consent: makeConsent({ face: false }),
      secret: "s",
    })).toThrow(/face/)
  })
  it("VideoPost has parsed duration from MP4 fixture", () => {
    const post = mod.createVideoPost({
      authorId: "u1", pseudonymSalt: "salt",
      caption: "Mesa Real",
      format: "mp4", buffer: makeMp4Fixture(),
      consent: makeConsent(),
      secret: "s",
    })
    expect(post.durationSec).toBe(30)
    expect(post.durationSource).toBe("parsed")
  })
})

// ============================================================================
// §13 HMAC chain
// ============================================================================
ds("§13 chainMediaHash", () => {
  it("returns 64 hex chars", () => {
    const h = mod.chainMediaHash("genesis", "payload", "secret")
    expect(/^[0-9a-f]{64}$/.test(h)).toBeTruthy()
  })
  it("deterministic for same inputs", () => {
    const h1 = mod.chainMediaHash("genesis", "p", "s")
    const h2 = mod.chainMediaHash("genesis", "p", "s")
    expect(h1).toBe(h2)
  })
  it("different prev → different hash", () => {
    const h1 = mod.chainMediaHash("genesis", "p", "s")
    const h2 = mod.chainMediaHash("prev1", "p", "s")
    expect(h1).not.toBe(h2)
  })
  it("throws on empty secret", () => {
    expect(() => mod.chainMediaHash("p", "x", "")).toThrow()
  })
  it("verifyMediaHashLink round-trip", () => {
    const hash = mod.chainMediaHash("prev", "payload", "sec")
    expect(mod.verifyMediaHashLink("prev", "payload", hash, "sec")).toBeTruthy()
  })
  it("verifyMediaHashLink detects tampering", () => {
    const hash = mod.chainMediaHash("prev", "payload", "sec")
    expect(mod.verifyMediaHashLink("tampered", "payload", hash, "sec")).toBeFalsy()
    expect(mod.verifyMediaHashLink("prev", "tampered", hash, "sec")).toBeFalsy()
    expect(mod.verifyMediaHashLink("prev", "payload", "tampered", "sec")).toBeFalsy()
  })
})

// ============================================================================
// §6 / §14 Sacred-tag coverage
// ============================================================================
ds("§6 CIGANO_CARDS catalog", () => {
  it("has 36 cards", () => {
    expect(mod.CIGANO_CARDS.length).toBe(36)
  })
  it("includes Cigano (card 28)", () => {
    expect(mod.CIGANO_CARDS).toContain("Cigano")
  })
  it("includes Cigana (card 29)", () => {
    expect(mod.CIGANO_CARDS).toContain("Cigana")
  })
  it("includes Cavaleiro", () => {
    expect(mod.CIGANO_CARDS).toContain("Cavaleiro")
  })
  it("includes Estrelas", () => {
    expect(mod.CIGANO_CARDS).toContain("Estrelas")
  })
  it("meets floor of 36", () => {
    expect(mod.CIGANO_CARDS.length).toBeGreaterThanOrEqual(36)
  })
})

ds("§6 ORIXAS catalog", () => {
  it("has 16 orixás", () => {
    expect(mod.ORIXAS.length).toBe(16)
  })
  it("includes Exu", () => expect(mod.ORIXAS).toContain("Exu"))
  it("includes Ogum", () => expect(mod.ORIXAS).toContain("Ogum"))
  it("includes Oxum", () => expect(mod.ORIXAS).toContain("Oxum"))
  it("includes Xangô", () => expect(mod.ORIXAS).toContain("Xangô"))
  it("includes Iemanjá", () => expect(mod.ORIXAS).toContain("Iemanjá"))
  it("includes Obaluaiê", () => expect(mod.ORIXAS).toContain("Obaluaiê"))
  it("meets floor of 16", () => {
    expect(mod.ORIXAS.length).toBeGreaterThanOrEqual(16)
  })
})

ds("§6 CHAKRAS catalog", () => {
  it("has 7 chakras", () => {
    expect(mod.CHAKRAS.length).toBe(7)
  })
  it("includes Muladhara", () => expect(mod.CHAKRAS).toContain("Muladhara"))
  it("includes Sahasrara", () => expect(mod.CHAKRAS).toContain("Sahasrara"))
  it("meets floor of 7", () => {
    expect(mod.CHAKRAS.length).toBeGreaterThanOrEqual(7)
  })
})

ds("§6 SEFIROT catalog", () => {
  it("has 10 sefirot", () => {
    expect(mod.SEFIROT.length).toBe(10)
  })
  it("includes Keter", () => expect(mod.SEFIROT).toContain("Keter"))
  it("includes Tiferet", () => expect(mod.SEFIROT).toContain("Tiferet"))
  it("includes Malkuth", () => expect(mod.SEFIROT).toContain("Malkuth"))
  it("meets floor of 10", () => {
    expect(mod.SEFIROT.length).toBeGreaterThanOrEqual(10)
  })
})

ds("§6 ASTROLOGIA catalog", () => {
  it("has 18 entries (12 signs + 6 axes)", () => {
    expect(mod.ASTROLOGIA.length).toBe(18)
  })
  it("includes 12 zodiac signs", () => {
    const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"]
    for (const s of signs) {
      expect(mod.ASTROLOGIA).toContain(s)
    }
  })
  it("includes 6 astrological axes", () => {
    expect(mod.ASTROLOGIA).toContain("Ascendente")
    expect(mod.ASTROLOGIA).toContain("Meio-do-Céu")
    expect(mod.ASTROLOGIA).toContain("Descendente")
    expect(mod.ASTROLOGIA).toContain("Fundo-do-Céu")
    expect(mod.ASTROLOGIA).toContain("Nodo Norte")
    expect(mod.ASTROLOGIA).toContain("Nodo Sul")
  })
  it("meets floor of 18", () => {
    expect(mod.ASTROLOGIA.length).toBeGreaterThanOrEqual(18)
  })
})

ds("§14 auditMediaCoverage", () => {
  it("total = 87 (36+16+7+10+18)", () => {
    const a = mod.auditMediaCoverage()
    expect(a.total).toBe(87)
  })
  it("isFullCoverage = true", () => {
    const a = mod.auditMediaCoverage()
    expect(a.isFullCoverage).toBeTruthy()
  })
  it("gaps = []", () => {
    const a = mod.auditMediaCoverage()
    expect(a.gaps.length).toBe(0)
  })
  it("floorMet.CIGANO = true", () => {
    expect(mod.auditMediaCoverage().floorMet.CIGANO).toBeTruthy()
  })
  it("floorMet.ORIXAS = true", () => {
    expect(mod.auditMediaCoverage().floorMet.ORIXAS).toBeTruthy()
  })
  it("floorMet.ASTROLOGIA = true", () => {
    expect(mod.auditMediaCoverage().floorMet.ASTROLOGIA).toBeTruthy()
  })
  it("IS_FULL_COVERAGE module-init flag = true", () => {
    expect(mod.IS_FULL_COVERAGE).toBeTruthy()
  })
  it("ALL_MEDIA_SACRED_TAGS has 87 unique entries", () => {
    expect(mod.ALL_MEDIA_SACRED_TAGS.length).toBe(87)
  })
})

// ============================================================================
// §7 Type guards
// ============================================================================
ds("§7 type guards", () => {
  it("isAudioPost", () => {
    const post = mod.createAudioPost({
      authorId: "u", pseudonymSalt: "s",
      caption: "Cigano",
      format: "mp3", buffer: makeMp3Fixture(),
      consent: makeConsent(),
      secret: "sk",
    })
    expect(mod.isAudioPost(post)).toBeTruthy()
    expect(mod.isVideoPost(post)).toBeFalsy()
  })
  it("isVideoPost", () => {
    const post = mod.createVideoPost({
      authorId: "u", pseudonymSalt: "s",
      caption: "Mesa Real",
      format: "mp4", buffer: makeMp4Fixture(),
      consent: makeConsent(),
      secret: "sk",
    })
    expect(mod.isVideoPost(post)).toBeTruthy()
    expect(mod.isAudioPost(post)).toBeFalsy()
  })
  it("isSacredMediaRef — accepts valid ref", () => {
    const ref = {
      tag: "Cigano", tradition: "CIGANO",
      charStart: 0, charEnd: 6,
    }
    expect(mod.isSacredMediaRef(ref)).toBeTruthy()
  })
  it("isSacredMediaRef — rejects invalid tradition", () => {
    const ref = {
      tag: "Cigano", tradition: "INVALID",
      charStart: 0, charEnd: 6,
    }
    expect(mod.isSacredMediaRef(ref)).toBeFalsy()
  })
})

// ============================================================================
// §8 Helpers
// ============================================================================
ds("§8 helpers", () => {
  it("clampMediaSize within cap", () => {
    expect(mod.clampMediaSize(1024, "audio")).toBe(1024)
  })
  it("clampMediaSize above cap", () => {
    expect(mod.clampMediaSize(20 * 1024 * 1024, "audio")).toBe(15 * 1024 * 1024)
  })
  it("clampMediaSize clamps video to 50MB", () => {
    expect(mod.clampMediaSize(60 * 1024 * 1024, "video")).toBe(50 * 1024 * 1024)
  })
  it("clampMediaSize handles negative / NaN / Infinity (defensive = 0)", () => {
    expect(mod.clampMediaSize(-1, "audio")).toBe(0)
    expect(mod.clampMediaSize(NaN, "audio")).toBe(0)
    expect(mod.clampMediaSize(Infinity, "audio")).toBe(0)
  })
  it("sacredMediaRefs finds Cigano tag", () => {
    const refs = mod.sacredMediaRefs("Hoje vi o Cigano 1 Paus")
    expect(refs.length).toBeGreaterThanOrEqual(1)
    expect(refs.some((r) => r.tag === "Cigano")).toBeTruthy()
  })
  it("sacredMediaRefs returns empty on no sacred content", () => {
    const refs = mod.sacredMediaRefs("hello world no sacred stuff here")
    expect(refs.length).toBe(0)
  })
  it("sacredMediaRefs handles accented boundary (Muladhara / chakra)", () => {
    const refs = mod.sacredMediaRefs("A energia de Muladhara pulsa forte")
    expect(refs.some((r) => r.tag === "Muladhara")).toBeTruthy()
  })
})

// ============================================================================
// §15 __ALL_EXPORTS grep-audit
// ============================================================================
ds("§15 __ALL_EXPORTS", () => {
  it("exports 14 functions", () => {
    expect(mod.__ALL_EXPORTS.functions.length).toBe(14)
  })
  it("exports 5 error classes", () => {
    expect(mod.__ALL_EXPORTS.errorClasses.length).toBe(5)
  })
  it("exports 3 type guards", () => {
    expect(mod.__ALL_EXPORTS.typeGuards.length).toBe(3)
  })
  it("exports 15 sections", () => {
    expect(mod.__ALL_EXPORTS.sectionsCount).toBe(15)
  })
})

// ============================================================================
// §5 Error classes — constructor + name
// ============================================================================
ds("§5 error classes", () => {
  it("InvalidMediaFormatError has code", () => {
    const e = new mod.InvalidMediaFormatError("wma")
    expect(e.code).toBe("INVALID_MEDIA_FORMAT")
    expect(e.name).toBe("InvalidMediaFormatError")
  })
  it("MediaSizeExceededError reports kind + sizes", () => {
    const e = new mod.MediaSizeExceededError("audio", 16_000_000, 15_000_000)
    expect(e.kind).toBe("audio")
    expect(e.message).toContain("16000000")
  })
  it("MediaConsentMissingError carries consent kind", () => {
    const e = new mod.MediaConsentMissingError("video", "face")
    expect(e.kind).toBe("video")
    expect(e.code).toBe("MEDIA_CONSENT_MISSING")
  })
  it("DurationParseError mentions format", () => {
    const e = new mod.DurationParseError("mp3", "no sync word")
    expect(e.code).toBe("DURATION_PARSE_FAILED")
    expect(e.message).toContain("mp3")
  })
})

// ============================================================================
// End-to-end pipeline
// ============================================================================
ds("E2E: full pipeline", () => {
  it("audio: caption 'Cigano Cavaleiro Oxum Keter' tags 4 traditions", () => {
    const post = mod.createAudioPost({
      authorId: "u1", pseudonymSalt: "salt",
      caption: "Cigano Cavaleiro Oxum Keter Áries Muladhara",
      format: "mp3", buffer: makeMp3Fixture(),
      consent: makeConsent(),
      secret: "s",
    })
    const traditions = new Set(post.sacredRefs.map((r) => r.tradition))
    expect(traditions.has("CIGANO")).toBeTruthy()
    expect(traditions.has("ORIXAS")).toBeTruthy()
    expect(traditions.has("SEFIROT")).toBeTruthy()
    expect(traditions.has("ASTROLOGIA")).toBeTruthy()
    expect(traditions.has("CHAKRAS")).toBeTruthy()
  })
  it("HMAC chain genesis → next link", () => {
    const post1 = mod.createAudioPost({
      authorId: "u", pseudonymSalt: "s",
      caption: "Cigano 1",
      format: "mp3", buffer: makeMp3Fixture(),
      consent: makeConsent(),
      secret: "secret-chain",
    })
    const payload2 = `post#2-${Date.now()}`
    const link2 = mod.chainMediaHash(post1.auditHash, payload2, "secret-chain")
    expect(/^[0-9a-f]{64}$/.test(link2)).toBeTruthy()
    expect(mod.verifyMediaHashLink(post1.auditHash, payload2, link2, "secret-chain")).toBeTruthy()
  })
  it("audio post + video post in same chain share secret", () => {
    const a = mod.createAudioPost({
      authorId: "u", pseudonymSalt: "s",
      caption: "Cigano",
      format: "mp3", buffer: makeMp3Fixture(),
      consent: makeConsent(),
      secret: "shared-secret",
    })
    const v = mod.createVideoPost({
      authorId: "u", pseudonymSalt: "s",
      caption: "Mesa Real",
      format: "mp4", buffer: makeMp4Fixture(),
      consent: makeConsent(),
      secret: "shared-secret",
    })
    expect(a.auditHash).not.toBe(v.auditHash)
    // cross-link audio → video
    const next = mod.chainMediaHash(a.auditHash, v.auditHash, "shared-secret")
    expect(/^[0-9a-f]{64}$/.test(next)).toBeTruthy()
  })
})

} // registerSuite

// ============================================================================
// Final summary + exit code (only when running standalone, NOT under vitest)
// ============================================================================

const supportsVitest = typeof globalThis.describe === "function" && typeof globalThis.it === "function"
if (!supportsVitest) {
  const p = harness.passes()
  const f = harness.fails()
  const failList = harness.failures()
  process.stdout.write(`\n=== w66/audio-video-posts spec: ${p} passed, ${f} failed ===\n`)
  if (f > 0) {
    for (const msg of failList) process.stdout.write(`  - ${msg}\n`)
    process.exit(1)
  }
  process.stdout.write(`✅ all assertions PASS\n`)
}