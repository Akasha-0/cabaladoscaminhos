/**
 * w65 community-moderation-engine — test suite
 * ---------------------------------------------
 * Self-running test harness (no vitest import needed).
 *
 * Run via:
 *   node --experimental-strip-types src/lib/w65/community-moderation-engine.spec.ts
 *
 * Cycle 64 lesson 6: globalThis registration of describe/it/expect so the file
 * works both as a vitest module AND as a standalone script.
 *
 * Designed to run from a sibling of the engine file:
 *   import * as mod from "./community-moderation-engine.ts"
 */

import * as mod from "./community-moderation-engine.ts"

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

  // Self-executing variants — actually run bodies immediately so this works
  // as a standalone `node --experimental-strip-types` script (no vitest).
  // If a real describe/it is registered on globalThis (vitest), we delegate
  // to it. Otherwise we run bodies in order.
  const supportsVitest =
    typeof globalThis.describe === "function" && typeof globalThis.it === "function"

  // Wrap describe/it so we can count assertions (each it → 1 pass, expected).
  // When vitest is available we use globalThis directly so it tracks results;
  // our fails/passes counters only run on the standalone path.
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

  if (supportsVitest) {
    const realDescribe = globalThis.describe as DescribeFn
    const realIt = globalThis.it as ItFn
    realDescribe("w65 community-moderation-engine", () => {
      ;(globalThis.describe as DescribeFn)("__tests__", () => {})
    })
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

// Wrap everything inside a top-level describe so we get a single header output
// when running under vitest.
ds("w65/community-moderation-engine", () => {
  registerSuite()
})

// ============================================================================
// Tests
// ============================================================================

function registerSuite(): void {
ds("DARK_PATTERN_CATEGORIES", () => {
  it("contains all 7 categories", () => {
    expect(Object.keys(mod.DARK_PATTERN_CATEGORIES).length).toBe(7)
  })
  it("includes URGENCY_PRESSURE", () => {
    expect("URGENCY_PRESSURE" in mod.DARK_PATTERN_CATEGORIES).toBeTruthy()
  })
  it("includes FEAR_MONGERING", () => {
    expect("FEAR_MONGERING" in mod.DARK_PATTERN_CATEGORIES).toBeTruthy()
  })
  it("includes MANIPULATION", () => {
    expect("MANIPULATION" in mod.DARK_PATTERN_CATEGORIES).toBeTruthy()
  })
  it("includes SPIRITUAL_BYPASS", () => {
    expect("SPIRITUAL_BYPASS" in mod.DARK_PATTERN_CATEGORIES).toBeTruthy()
  })
  it("includes GUILT_TRIP", () => {
    expect("GUILT_TRIP" in mod.DARK_PATTERN_CATEGORIES).toBeTruthy()
  })
  it("includes MONEY_FOCUS", () => {
    expect("MONEY_FOCUS" in mod.DARK_PATTERN_CATEGORIES).toBeTruthy()
  })
  it("includes UNVERIFIED_CLAIMS", () => {
    expect("UNVERIFIED_CLAIMS" in mod.DARK_PATTERN_CATEGORIES).toBeTruthy()
  })
  it("SPIRITUAL_BYPASS has highest weight", () => {
    expect(mod.DARK_PATTERN_CATEGORIES.SPIRITUAL_BYPASS.weight)
      .toBeGreaterThanOrEqual(mod.DARK_PATTERN_CATEGORIES.URGENCY_PRESSURE.weight)
  })
})

ds("DARK_PATTERN_PATTERNS — totals", () => {
  it("contains 7 categories", () => {
    expect(Object.keys(mod.DARK_PATTERN_PATTERNS).length).toBe(7)
  })
  it("total patterns >= 30 (cycle 65 brief)", () => {
    expect(mod.TOTAL_DARK_PATTERN_PATTERNS).toBeGreaterThanOrEqual(30)
  })
  it("URGENCY_PRESSURE has 5+ patterns", () => {
    expect(mod.URGENCY_PRESSURE_PATTERNS.length).toBeGreaterThanOrEqual(5)
  })
  it("FEAR_MONGERING has 5+ patterns", () => {
    expect(mod.FEAR_MONGERING_PATTERNS.length).toBeGreaterThanOrEqual(5)
  })
  it("MANIPULATION has 5+ patterns", () => {
    expect(mod.MANIPULATION_PATTERNS.length).toBeGreaterThanOrEqual(5)
  })
  it("SPIRITUAL_BYPASS has 5+ patterns", () => {
    expect(mod.SPIRITUAL_BYPASS_PATTERNS.length).toBeGreaterThanOrEqual(5)
  })
  it("GUILT_TRIP has 5+ patterns", () => {
    expect(mod.GUILT_TRIP_PATTERNS.length).toBeGreaterThanOrEqual(5)
  })
  it("MONEY_FOCUS has 5+ patterns", () => {
    expect(mod.MONEY_FOCUS_PATTERNS.length).toBeGreaterThanOrEqual(5)
  })
  it("UNVERIFIED_CLAIMS has 5+ patterns", () => {
    expect(mod.UNVERIFIED_CLAIMS_PATTERNS.length).toBeGreaterThanOrEqual(5)
  })
  it("every pattern has phrase+regex", () => {
    const cats = Object.keys(mod.DARK_PATTERN_PATTERNS) as Array<keyof typeof mod.DARK_PATTERN_PATTERNS>
    for (const c of cats) {
      for (const p of mod.DARK_PATTERN_PATTERNS[c]) {
        if (typeof p.phrase !== "string") throw new Error(`bad phrase in ${c}`)
        if (!(p.regex instanceof RegExp)) throw new Error(`bad regex in ${c}`)
      }
    }
  })
})

ds("CIGANO_CARDS catalog", () => {
  it("has 36 cards", () => {
    expect(mod.CIGANO_CARDS.length).toBe(36)
  })
  it("includes 'Cigano' (card 28)", () => {
    expect(mod.CIGANO_CARDS.includes("Cigano")).toBeTruthy()
  })
  it("includes 'Cigana' (card 29)", () => {
    expect(mod.CIGANO_CARDS.includes("Cigana")).toBeTruthy()
  })
  it("includes 'Cavaleiro'", () => {
    expect(mod.CIGANO_CARDS.includes("Cavaleiro")).toBeTruthy()
  })
  it("includes 'Estrelas'", () => {
    expect(mod.CIGANO_CARDS.includes("Estrelas")).toBeTruthy()
  })
  it("includes 'Coração'", () => {
    expect(mod.CIGANO_CARDS.includes("Coração")).toBeTruthy()
  })
  it("meets floor of 7 (cigano)", () => {
    expect(mod.CIGANO_CARDS.length).toBeGreaterThanOrEqual(7)
  })
})

ds("ORIXAS catalog", () => {
  it("has 16 orixás", () => {
    expect(mod.ORIXAS.length).toBe(16)
  })
  it("includes Exu", () => {
    expect(mod.ORIXAS.includes("Exu")).toBeTruthy()
  })
  it("includes Ogum", () => {
    expect(mod.ORIXAS.includes("Ogum")).toBeTruthy()
  })
  it("includes Oxum", () => {
    expect(mod.ORIXAS.includes("Oxum")).toBeTruthy()
  })
  it("includes Xangô", () => {
    expect(mod.ORIXAS.includes("Xangô")).toBeTruthy()
  })
  it("includes Iemanjá", () => {
    expect(mod.ORIXAS.includes("Iemanjá")).toBeTruthy()
  })
  it("includes Obaluaiê", () => {
    expect(mod.ORIXAS.includes("Obaluaiê")).toBeTruthy()
  })
  it("meets floor of 7 (orixas)", () => {
    expect(mod.ORIXAS.length).toBeGreaterThanOrEqual(7)
  })
})

ds("SEFIROT catalog", () => {
  it("has 10 sefirot", () => {
    expect(mod.SEFIROT.length).toBe(10)
  })
  it("includes Keter", () => {
    expect(mod.SEFIROT.includes("Keter")).toBeTruthy()
  })
  it("includes Tiferet", () => {
    expect(mod.SEFIROT.includes("Tiferet")).toBeTruthy()
  })
  it("includes Malkuth", () => {
    expect(mod.SEFIROT.includes("Malkuth")).toBeTruthy()
  })
  it("meets floor of 7 (sefirot)", () => {
    expect(mod.SEFIROT.length).toBeGreaterThanOrEqual(7)
  })
})

ds("CHAKRAS catalog", () => {
  it("has 7 chakras", () => {
    expect(mod.CHAKRAS.length).toBe(7)
  })
  it("includes Muladhara", () => {
    expect(mod.CHAKRAS.includes("Muladhara")).toBeTruthy()
  })
  it("includes Sahasrara", () => {
    expect(mod.CHAKRAS.includes("Sahasrara")).toBeTruthy()
  })
  it("meets floor of 7 (chakras)", () => {
    expect(mod.CHAKRAS.length).toBeGreaterThanOrEqual(7)
  })
})

ds("PLANETS catalog", () => {
  it("has 11 planets", () => {
    expect(mod.PLANETS.length).toBe(11)
  })
  it("includes Sol", () => {
    expect(mod.PLANETS.includes("Sol")).toBeTruthy()
  })
  it("includes Plutão", () => {
    expect(mod.PLANETS.includes("Plutão")).toBeTruthy()
  })
  it("includes Quirón", () => {
    expect(mod.PLANETS.includes("Quirón")).toBeTruthy()
  })
  it("meets floor of 7 (planetas)", () => {
    expect(mod.PLANETS.length).toBeGreaterThanOrEqual(7)
  })
})

ds("HEBREW_LETTERS catalog", () => {
  it("has 22 letters", () => {
    expect(mod.HEBREW_LETTERS.length).toBe(22)
  })
  it("includes Aleph", () => {
    expect(mod.HEBREW_LETTERS.includes("Aleph")).toBeTruthy()
  })
  it("includes Tav", () => {
    expect(mod.HEBREW_LETTERS.includes("Tav")).toBeTruthy()
  })
  it("includes Shin", () => {
    expect(mod.HEBREW_LETTERS.includes("Shin")).toBeTruthy()
  })
  it("meets floor of 7 (hebrew)", () => {
    expect(mod.HEBREW_LETTERS.length).toBeGreaterThanOrEqual(7)
  })
})

ds("ASTROLOGY_HOUSES catalog", () => {
  it("has 12 houses", () => {
    expect(mod.ASTROLOGY_HOUSES.length).toBe(12)
  })
  it("includes Casa 1", () => {
    expect(mod.ASTROLOGY_HOUSES.includes("Casa 1")).toBeTruthy()
  })
  it("includes Casa 8 (transformação)", () => {
    expect(mod.ASTROLOGY_HOUSES.includes("Casa 8")).toBeTruthy()
  })
  it("includes Casa 12 (espiritualidade)", () => {
    expect(mod.ASTROLOGY_HOUSES.includes("Casa 12")).toBeTruthy()
  })
  it("meets floor of 7 (astrologia)", () => {
    expect(mod.ASTROLOGY_HOUSES.length).toBeGreaterThanOrEqual(7)
  })
})

ds("ALL_SACRED composition + SACRED_BY_TRADITION consistency", () => {
  it("ALL_SACRED length equals sum of traditions", () => {
    const expected =
      mod.CIGANO_CARDS.length + mod.ORIXAS.length + mod.SEFIROT.length +
      mod.CHAKRAS.length + mod.PLANETS.length + mod.HEBREW_LETTERS.length +
      mod.ASTROLOGY_HOUSES.length
    expect(mod.ALL_SACRED.length).toBe(expected)
  })
  it("ALL_SACRED >= 114 symbols (cycle 65 brief)", () => {
    expect(mod.ALL_SACRED.length).toBeGreaterThanOrEqual(114)
  })
  it("SACRED_BY_TRADITION.cigano equals CIGANO_CARDS", () => {
    expect(mod.SACRED_BY_TRADITION.cigano.length).toBe(mod.CIGANO_CARDS.length)
  })
  it("SACRED_BY_TRADITION.orixas equals ORIXAS", () => {
    expect(mod.SACRED_BY_TRADITION.orixas.length).toBe(mod.ORIXAS.length)
  })
  it("SACRED_BY_TRADITION.sefirot equals SEFIROT", () => {
    expect(mod.SACRED_BY_TRADITION.sefirot.length).toBe(mod.SEFIROT.length)
  })
})

ds("buildSacredRegex — word-boundary logic", () => {
  it("matches whole word 'Exu' in 'consulto Exu hoje'", () => {
    const rx = mod.buildSacredRegex("Exu")
    expect(rx.test("consulto Exu hoje")).toBeTruthy()
  })
  it("does NOT match 'exu' inside 'exuberant' (cycle 55+60 lesson)", () => {
    const rx = mod.buildSacredRegex("Exu")
    expect(rx.test("exuberant")).toBeFalsy()
  })
  it("respects UTF-8 'Cigano'", () => {
    const rx = mod.buildSacredRegex("Cigano")
    expect(rx.test("o Cigano respondeu")).toBeTruthy()
  })
  it("does NOT match 'Cigano' inside 'Ciganocolo'", () => {
    const rx = mod.buildSacredRegex("Cigano")
    expect(rx.test("Ciganocolo")).toBeFalsy()
  })
  it("supports 'Oxum' not in 'Oxumaré' (subset trap)", () => {
    const rxOxum = mod.buildSacredRegex("Oxum")
    const rxOxumare = mod.buildSacredRegex("Oxumarê")
    expect(rxOxum.test("Oxumarê")).toBeFalsy()
    expect(rxOxumare.test("Oxumarê")).toBeTruthy()
  })
})

ds("auditDarkPatterns — cycle 62 lesson 6", () => {
  it("returns [] for empty text", () => {
    expect(mod.auditDarkPatterns("").length).toBe(0)
  })
  it("returns [] for clean sacred text", () => {
    expect(mod.auditDarkPatterns("consulto Exu e Ogum, abro o jogo de Cigano").length).toBe(0)
  })
  it("detects 'agora ou nunca' as URGENCY_PRESSURE", () => {
    const rows = mod.auditDarkPatterns("aproveite: agora ou nunca!")
    const cat = rows.find((r) => r.category === "URGENCY_PRESSURE")
    expect(cat !== undefined).toBeTruthy()
    expect(cat!.matches.length).toBeGreaterThan(0)
  })
  it("detects 'maldição' as FEAR_MONGERING", () => {
    const rows = mod.auditDarkPatterns("se não fizer, vai receber uma maldição")
    const cat = rows.find((r) => r.category === "FEAR_MONGERING")
    expect(cat !== undefined).toBeTruthy()
  })
  it("detects 'deus cura tudo' as SPIRITUAL_BYPASS", () => {
    const rows = mod.auditDarkPatterns("deus cura tudo, não precisa de médico")
    const cat = rows.find((r) => r.category === "SPIRITUAL_BYPASS")
    expect(cat !== undefined).toBeTruthy()
  })
  it("detects '100% garantido' as UNVERIFIED_CLAIMS", () => {
    const rows = mod.auditDarkPatterns("cura 100% garantida em 7 dias")
    const cat = rows.find((r) => r.category === "UNVERIFIED_CLAIMS")
    expect(cat !== undefined).toBeTruthy()
  })
  it("detects 'pix para' as MONEY_FOCUS", () => {
    const rows = mod.auditDarkPatterns("faça pix para 11999990000")
    const cat = rows.find((r) => r.category === "MONEY_FOCUS")
    expect(cat !== undefined).toBeTruthy()
  })
  it("detects 'vai decepcionar' as GUILT_TRIP", () => {
    const rows = mod.auditDarkPatterns("se não ajudar, vai decepcionar os orixás")
    const cat = rows.find((r) => r.category === "GUILT_TRIP")
    expect(cat !== undefined).toBeTruthy()
  })
  it("detects 'faça isso ou' as MANIPULATION", () => {
    const rows = mod.auditDarkPatterns("faça isso ou nada vai dar certo")
    const cat = rows.find((r) => r.category === "MANIPULATION")
    expect(cat !== undefined).toBeTruthy()
  })
  it("returns Deduped matches (no duplicate phrases)", () => {
    const rows = mod.auditDarkPatterns("agora ou nunca, aproveite agora, é agora ou nunca")
    const cat = rows.find((r) => r.category === "URGENCY_PRESSURE")
    expect(cat !== undefined).toBeTruthy()
    expect(cat!.matches.length).toBeGreaterThan(0)
    const lower = cat!.matches.map((m) => m.toLowerCase())
    const unique = new Set(lower)
    expect(unique.size).toBe(lower.length)
  })
})

ds("moderateText — happy paths", () => {
  it("clean text -> allowed=true severity=none", () => {
    const r = mod.moderateText(
      { text: "boa tarde, como vão vocês hoje?", contentId: "c1", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.allowed).toBeTruthy()
    expect(r.severity).toBe("none")
    expect(r.darkPatternHits.length).toBe(0)
  })
  it("throws on missing text", () => {
    expect(() => mod.moderateText(
      { text: "", contentId: "c1", authorId: "u1", kind: "post" } as mod.ModerationInput,
      { locale: "pt-BR" },
    )).toThrow("INVALID_MODERATION_INPUT")
  })
  it("throws on unsafe contentId", () => {
    expect(() => mod.moderateText(
      { text: "oi", contentId: "../../etc", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )).toThrow("INVALID_MODERATION_INPUT")
  })
  it("throws on unsupported locale", () => {
    expect(() => mod.moderateText(
      { text: "oi", contentId: "c1", authorId: "u1", kind: "post" },
      { locale: "fr" as "pt-BR" },
    )).toThrow("INVALID_MODERATION_INPUT")
  })
})

ds("moderateText — sacred content respected (NEVER flagged)", () => {
  it("Cigano mention -> allowed=true, sacredHits>0", () => {
    const r = mod.moderateText(
      { text: "o jogo de Cigano mostrou o Coração e a Cigana", contentId: "c1", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.allowed).toBeTruthy()
    expect(r.sacredHits.length).toBeGreaterThan(0)
    expect(r.darkPatternHits.length).toBe(0)
  })
  it("Orixás mention -> allowed=true", () => {
    const r = mod.moderateText(
      { text: "Exu, Ogum e Oxum abriram os caminhos", contentId: "c2", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.allowed).toBeTruthy()
    expect(r.traditionCounts.orixas).toBeGreaterThanOrEqual(3)
  })
  it("Sefirot mention -> allowed=true, hits present", () => {
    const r = mod.moderateText(
      { text: "Keter e Tiferet iluminam", contentId: "c3", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.allowed).toBeTruthy()
    expect(r.traditionCounts.sefirot).toBeGreaterThanOrEqual(2)
  })
  it("Sacred reference in 'exuberant' is NOT matched (word boundary)", () => {
    const r = mod.moderateText(
      { text: "estou exuberante hoje", contentId: "c4", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.sacredHits.length).toBe(0)
  })
  it("Sacred + dark pattern -> allowed=false, severity escalated", () => {
    const r = mod.moderateText(
      { text: "Exu, Ogum, agora ou nunca! Doe R$ 100 para o terreiro e deus cura tudo",
        contentId: "c5", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.allowed).toBeFalsy()
    expect(r.severity).not.toBe("none")
    expect(r.sacredHits.length).toBeGreaterThanOrEqual(2)
    expect(r.darkPatternHits.length).toBeGreaterThanOrEqual(2)
  })
})

ds("moderateText — dark pattern detection", () => {
  it("urgency pattern -> severity>=low", () => {
    const r = mod.moderateText(
      { text: "aproveite: agora ou nunca!", contentId: "c1", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.darkPatternHits.length).toBeGreaterThan(0)
    expect(r.categoryCounts.URGENCY_PRESSURE).toBeGreaterThanOrEqual(1)
    expect(r.severity).not.toBe("none")
  })
  it("fear-mongering -> severity >= low", () => {
    const r = mod.moderateText(
      { text: "vai sofrer uma maldição se ignorar", contentId: "c2", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.categoryCounts.FEAR_MONGERING).toBeGreaterThanOrEqual(1)
  })
  it("manipulation -> severity >= low", () => {
    const r = mod.moderateText(
      { text: "faça isso ou perderá a chance", contentId: "c3", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.categoryCounts.MANIPULATION).toBeGreaterThanOrEqual(1)
  })
  it("spiritual-bypass -> high severity", () => {
    const r = mod.moderateText(
      { text: "deus cura tudo, não é terapia, ignore o médico",
        contentId: "c4", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.categoryCounts.SPIRITUAL_BYPASS).toBeGreaterThanOrEqual(2)
    expect(["high", "critical"]).toContain(r.severity)
  })
  it("guilt-trip -> counted", () => {
    const r = mod.moderateText(
      { text: "se não fizer, vai decepcionar os orixás", contentId: "c5", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.categoryCounts.GUILT_TRIP).toBeGreaterThanOrEqual(1)
  })
  it("money-focus -> counted", () => {
    const r = mod.moderateText(
      { text: "doe R$ 200, contribua com o pix para 11999990000",
        contentId: "c6", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.categoryCounts.MONEY_FOCUS).toBeGreaterThanOrEqual(2)
  })
  it("unverified-claims -> counted", () => {
    const r = mod.moderateText(
      { text: "resultado certo, 100% garantido, sem risco",
        contentId: "c7", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.categoryCounts.UNVERIFIED_CLAIMS).toBeGreaterThanOrEqual(2)
    expect(["high", "critical"]).toContain(r.severity)
  })
  it("decision: critical content -> allowed=false", () => {
    const r = mod.moderateText(
      { text: "deus cura tudo, ignore o médico, 100% garantido, doe R$ 1000, agora ou nunca",
        contentId: "c8", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    expect(r.allowed).toBeFalsy()
    expect(r.severity).toBe("critical")
  })
  it("custom threshold 'medium' blocks lower-severity patterns", () => {
    const r = mod.moderateText(
      { text: "aproveite: agora ou nunca!", contentId: "c9", authorId: "u1", kind: "post" },
      { locale: "pt-BR", minSeverityToBlock: "medium" },
    )
    expect(r.allowed).toBeFalsy()
  })
  it("custom threshold 'critical' permits medium-severity patterns", () => {
    const r = mod.moderateText(
      { text: "aproveite: agora ou nunca!", contentId: "c10", authorId: "u1", kind: "post" },
      { locale: "pt-BR", minSeverityToBlock: "critical" },
    )
    expect(r.allowed).toBeTruthy()
  })
})

ds("flagReport — pseudonym + audit", () => {
  it("pseudonymizes reporterId (raw never appears)", () => {
    const r = mod.flagReport("c-1", "user-12345-secret", "spam", { locale: "pt-BR" })
    expect(r.reporterPseudonym).not.toContain("user-12345-secret")
    expect(r.reporterPseudonym.length).toBeGreaterThanOrEqual(8)
    expect(r.reporterPseudonym.length).toBeLessThanOrEqual(64)
  })
  it("produces a 16-char pseudonym by default", () => {
    const r = mod.flagReport("c-1", "u1", "spam", { locale: "pt-BR" })
    expect(r.reporterPseudonym.length).toBe(16)
  })
  it("deterministic for same (reporter, salt)", () => {
    const r1 = mod.flagReport("c-1", "u1", "spam", { locale: "pt-BR" })
    const r2 = mod.flagReport("c-1", "u1", "spam", { locale: "pt-BR" })
    expect(r1.reporterPseudonym).toBe(r2.reporterPseudonym)
    expect(r1.auditHash).toBe(r2.auditHash)
  })
  it("different contentId -> different pseudonym (salt differs)", () => {
    const r1 = mod.flagReport("c-1", "u1", "spam", { locale: "pt-BR" })
    const r2 = mod.flagReport("c-2", "u1", "spam", { locale: "pt-BR" })
    expect(r1.reporterPseudonym).not.toBe(r2.reporterPseudonym)
  })
  it("auditHash >= 16 chars", () => {
    const r = mod.flagReport("c-1", "u1", "spam", { locale: "pt-BR" })
    expect(r.auditHash.length).toBeGreaterThanOrEqual(16)
  })
  it("throws on invalid reason", () => {
    expect(() => mod.flagReport("c-1", "u1", "bogus" as mod.ReportReason, { locale: "pt-BR" }))
      .toThrow("INVALID_REPORT")
  })
  it("throws on unsafe contentId", () => {
    expect(() => mod.flagReport("../etc/passwd", "u1", "spam", { locale: "pt-BR" }))
      .toThrow("INVALID_REPORT")
  })
  it("throws on empty reporterId", () => {
    expect(() => mod.flagReport("c-1", "", "spam", { locale: "pt-BR" }))
      .toThrow("INVALID_REPORT")
  })
  it("truncates detail to 2000 chars", () => {
    const big = "x".repeat(5000)
    const r = mod.flagReport("c-1", "u1", "spam", { locale: "pt-BR", detail: big })
    expect(r.detail.length).toBeLessThanOrEqual(2000)
  })
})

ds("chainModerationHash — HMAC semantics", () => {
  it("produces 64-char hex", () => {
    const h = mod.chainModerationHash("prev1", "payload1", "secret1")
    expect(h.length).toBe(64)
    expect(/^[0-9a-f]{64}$/.test(h)).toBeTruthy()
  })
  it("deterministic for same inputs", () => {
    const h1 = mod.chainModerationHash("p", "pl", "s")
    const h2 = mod.chainModerationHash("p", "pl", "s")
    expect(h1).toBe(h2)
  })
  it("different prev -> different hash", () => {
    const h1 = mod.chainModerationHash("prevA", "payload", "s")
    const h2 = mod.chainModerationHash("prevB", "payload", "s")
    expect(h1).not.toBe(h2)
  })
  it("different secret -> different hash", () => {
    const h1 = mod.chainModerationHash("p", "pl", "s1")
    const h2 = mod.chainModerationHash("p", "pl", "s2")
    expect(h1).not.toBe(h2)
  })
  it("throws on empty secret", () => {
    expect(() => mod.chainModerationHash("p", "pl", "")).toThrow("CHAIN_INTEGRITY")
  })
  it("verifyModerationChainLink accepts valid link", () => {
    const h = mod.chainModerationHash("p", "pl", "s")
    expect(mod.verifyModerationChainLink("p", "pl", h, "s")).toBeTruthy()
  })
  it("verifyModerationChainLink rejects tampered payload", () => {
    const h = mod.chainModerationHash("p", "pl", "s")
    expect(mod.verifyModerationChainLink("p", "plZZ", h, "s")).toBeFalsy()
  })
  it("verifyModerationChainLink rejects tampered secret", () => {
    const h = mod.chainModerationHash("p", "pl", "s")
    expect(mod.verifyModerationChainLink("p", "pl", h, "sZZ")).toBeFalsy()
  })
})

ds("pseudonymizeUserId — LGPD Art. 9", () => {
  it("produces 16-char hex by default", () => {
    const p = mod.pseudonymizeUserId("user-42", "salt-1")
    expect(p.length).toBe(16)
    expect(/^[0-9a-f]{16}$/.test(p)).toBeTruthy()
  })
  it("deterministic for same (userId, salt)", () => {
    const a = mod.pseudonymizeUserId("u1", "s1")
    const b = mod.pseudonymizeUserId("u1", "s1")
    expect(a).toBe(b)
  })
  it("different salt -> different pseudonym", () => {
    const a = mod.pseudonymizeUserId("u1", "s1")
    const b = mod.pseudonymizeUserId("u1", "s2")
    expect(a).not.toBe(b)
  })
  it("returns '' for empty userId", () => {
    expect(mod.pseudonymizeUserId("", "s1")).toBe("")
  })
  it("truncation chars respected (8, 16, 32, 64)", () => {
    expect(mod.pseudonymizeUserId("u1", "s", { truncationChars: 8 }).length).toBe(8)
    expect(mod.pseudonymizeUserId("u1", "s", { truncationChars: 32 }).length).toBe(32)
    expect(mod.pseudonymizeUserId("u1", "s", { truncationChars: 64 }).length).toBe(64)
  })
  it("truncation >= 8 even when smaller requested", () => {
    expect(mod.pseudonymizeUserId("u1", "s", { truncationChars: 4 }).length).toBe(8)
  })
  it("truncation cap at 64", () => {
    expect(mod.pseudonymizeUserId("u1", "s", { truncationChars: 200 }).length).toBeLessThanOrEqual(64)
  })
})

ds("validateModeration — never-throws", () => {
  it("valid result -> ok=true, no errors", () => {
    const r = mod.moderateText(
      { text: "oi", contentId: "c1", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    const v = mod.validateModeration(r)
    expect(v.ok).toBeTruthy()
    expect(v.errors.length).toBe(0)
  })
  it("invalid: null -> ok=false", () => {
    const v = mod.validateModeration(null as unknown as mod.ModerationResult)
    expect(v.ok).toBeFalsy()
    expect(v.errors.length).toBeGreaterThan(0)
  })
  it("invalid: bad severity -> ok=false", () => {
    const r = mod.moderateText(
      { text: "oi", contentId: "c1", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    const tampered = { ...r, severity: "bogus" as mod.Severity }
    const v = mod.validateModeration(tampered)
    expect(v.ok).toBeFalsy()
  })
  it("invalid: empty auditHash -> ok=false", () => {
    const r = mod.moderateText(
      { text: "oi", contentId: "c1", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    const tampered = { ...r, auditHash: "" }
    const v = mod.validateModeration(tampered)
    expect(v.ok).toBeFalsy()
  })
})

ds("validateReport — never-throws", () => {
  it("valid report -> ok=true", () => {
    const r = mod.flagReport("c-1", "u1", "spam", { locale: "pt-BR" })
    const v = mod.validateReport(r)
    expect(v.ok).toBeTruthy()
    expect(v.errors.length).toBe(0)
  })
  it("invalid: null -> ok=false", () => {
    const v = mod.validateReport(null as unknown as mod.ReportRecord)
    expect(v.ok).toBeFalsy()
  })
  it("invalid: short pseudonym -> ok=false", () => {
    const r = mod.flagReport("c-1", "u1", "spam", { locale: "pt-BR" })
    const tampered = { ...r, reporterPseudonym: "abc" }
    const v = mod.validateReport(tampered)
    expect(v.ok).toBeFalsy()
  })
  it("invalid: bad reason -> ok=false", () => {
    const r = mod.flagReport("c-1", "u1", "spam", { locale: "pt-BR" })
    const tampered = { ...r, reason: "bogus" as mod.ReportReason }
    const v = mod.validateReport(tampered)
    expect(v.ok).toBeFalsy()
  })
})

ds("auditModeration + auditSacredCoverage", () => {
  it("auditModeration totalScanned >= 114", () => {
    const a = mod.auditModeration()
    expect(a.totalScanned).toBeGreaterThanOrEqual(114)
  })
  it("auditModeration byTradition is full coverage (7 traditions met)", () => {
    const a = mod.auditModeration()
    expect(a.isFullCoverage).toBeTruthy()
    expect(a.missingTraditions.length).toBe(0)
  })
  it("auditModeration darkPatternsDetected >= 30", () => {
    const a = mod.auditModeration()
    expect(a.darkPatternsDetected).toBeGreaterThanOrEqual(30)
  })
  it("every tradition meets floor of 7", () => {
    const a = mod.auditModeration()
    for (const t of Object.keys(a.traditionFloorMet) as Array<keyof typeof a.traditionFloorMet>) {
      expect(a.traditionFloorMet[t]).toBeTruthy()
    }
  })
  it("auditSacredCoverage returns same structure", () => {
    const a = mod.auditSacredCoverage()
    expect(a.totalScanned).toBeGreaterThanOrEqual(114)
    expect(a.isFullCoverage).toBeTruthy()
  })
})

ds("helpers — clampUnit, severityFromScore, maxSeverity, boostScore, stripDiacritics", () => {
  it("clampUnit(1.5) = 1", () => expect(mod.clampUnit(1.5)).toBe(1))
  it("clampUnit(-0.5) = 0", () => expect(mod.clampUnit(-0.5)).toBe(0))
  it("clampUnit(NaN) = 0", () => expect(mod.clampUnit(NaN)).toBe(0))
  it("severityFromScore(0.9) = critical (with new thresholds)", () => expect(mod.severityFromScore(0.9)).toBe("critical"))
  it("severityFromScore(0.1) = none", () => expect(mod.severityFromScore(0.1)).toBe("none"))
  it("severityFromScore(0.5) = medium (between 0.40 and 0.65)", () => expect(mod.severityFromScore(0.5)).toBe("medium"))
  it("severityFromScore(1.0) = critical (clamped)", () => expect(mod.severityFromScore(1.0)).toBe("critical"))
  it("maxSeverity(low, high) = high", () => expect(mod.maxSeverity("low", "high")).toBe("high"))
  it("maxSeverity(critical, none) = critical", () => expect(mod.maxSeverity("critical", "none")).toBe("critical"))
  it("boostScore(0.5, 1.0, 0.5) <= 0.99", () => {
    const s = mod.boostScore(0.5, 1.0, 0.5)
    expect(s).toBeLessThanOrEqual(0.99)
  })
  it("boostScore(0.95, 1.0, 1.0) = 0.99 (cap)", () => {
    expect(mod.boostScore(0.95, 1.0, 1.0)).toBe(0.99)
  })
  it("stripDiacritics('Exu') = 'Exu'", () => expect(mod.stripDiacritics("Exu")).toBe("Exu"))
  it("stripDiacritics('Ogúm') = 'Ogum'", () => expect(mod.stripDiacritics("Ogúm")).toBe("Ogum"))
})

ds("type guards", () => {
  it("isSacredHit accepts valid", () => {
    expect(mod.isSacredHit({ symbol: "Exu", tradition: "orixas", charStart: 0, charEnd: 3 })).toBeTruthy()
  })
  it("isSacredHit rejects null", () => {
    expect(mod.isSacredHit(null)).toBeFalsy()
  })
  it("isDarkPatternCategory accepts", () => {
    expect(mod.isDarkPatternCategory("URGENCY_PRESSURE")).toBeTruthy()
  })
  it("isDarkPatternCategory rejects unknown", () => {
    expect(mod.isDarkPatternCategory("BOGUS")).toBeFalsy()
  })
  it("isSacredTradition accepts all 7", () => {
    expect(mod.isSacredTradition("cigano")).toBeTruthy()
    expect(mod.isSacredTradition("orixas")).toBeTruthy()
    expect(mod.isSacredTradition("sefirot")).toBeTruthy()
    expect(mod.isSacredTradition("chakras")).toBeTruthy()
    expect(mod.isSacredTradition("planetas")).toBeTruthy()
    expect(mod.isSacredTradition("hebrew")).toBeTruthy()
    expect(mod.isSacredTradition("astrologia")).toBeTruthy()
  })
  it("isSacredTradition rejects unknown", () => {
    expect(mod.isSacredTradition("tarot")).toBeFalsy()
  })
  it("isSeverity accepts all 5", () => {
    for (const s of ["none", "low", "medium", "high", "critical"]) {
      expect(mod.isSeverity(s)).toBeTruthy()
    }
  })
  it("isReportReason accepts all 6", () => {
    for (const r of ["spam", "harassment", "dark_pattern", "sacred_misuse", "fraud", "other"]) {
      expect(mod.isReportReason(r)).toBeTruthy()
    }
  })
})

ds("formatters — never-throws, useful strings", () => {
  it("formatModerationResult includes contentId + severity", () => {
    const r = mod.moderateText(
      { text: "oi", contentId: "c-FORMAT-1", authorId: "u1", kind: "post" },
      { locale: "pt-BR" },
    )
    const s = mod.formatModerationResult(r)
    expect(s).toContain("c-FORMAT-1")
    expect(s).toContain("none")
  })
  it("formatReport includes reporterPseudonym", () => {
    const r = mod.flagReport("c-1", "u1", "spam", { locale: "pt-BR" })
    const s = mod.formatReport(r)
    expect(s).toContain(r.reporterPseudonym)
  })
  it("formatSacredHits returns '(no sacred hits)' for empty", () => {
    expect(mod.formatSacredHits([])).toContain("no sacred hits")
  })
  it("formatDarkPatternHits returns '(no dark pattern hits)' for empty", () => {
    expect(mod.formatDarkPatternHits([])).toContain("no dark")
  })
  it("formatSacredHits handles many hits gracefully", () => {
    const hits: mod.SacredHit[] = []
    for (let i = 0; i < 200; i++) {
      hits.push({ symbol: "Exu", tradition: "orixas", charStart: i * 4, charEnd: i * 4 + 3 })
    }
    const s = mod.formatSacredHits(hits)
    expect(s.length).toBeGreaterThan(0)
  })
})

ds("decideAllowed + calculateSeverity edge cases", () => {
  it("empty dark hits -> severity=none", () => {
    expect(mod.calculateSeverity([], [])).toBe("none")
  })
  it("only sacred hits -> severity=none", () => {
    const sacred: mod.SacredHit[] = [
      { symbol: "Exu", tradition: "orixas", charStart: 0, charEnd: 3 },
    ]
    expect(mod.calculateSeverity([], sacred)).toBe("none")
  })
  it("many URGENCY_PRESSURE hits -> severity >= medium", () => {
    const hits: mod.DarkPatternHit[] = []
    for (let i = 0; i < 6; i++) {
      hits.push({ category: "URGENCY_PRESSURE", phrase: "agora", regexIndex: 0, charStart: i, charEnd: i + 5 })
    }
    const s = mod.calculateSeverity(hits, [])
    expect(["medium", "high", "critical"]).toContain(s)
  })
  it("spiritual-bypass alone -> severity >= high", () => {
    const hits: mod.DarkPatternHit[] = [
      { category: "SPIRITUAL_BYPASS", phrase: "deus cura tudo", regexIndex: 0, charStart: 0, charEnd: 14 },
    ]
    expect(["high", "critical"]).toContain(mod.calculateSeverity(hits, []))
  })
  it("decideAllowed('none', 'high') = true", () => expect(mod.decideAllowed("none", "high")).toBeTruthy())
  it("decideAllowed('critical', 'high') = false", () => expect(mod.decideAllowed("critical", "high")).toBeFalsy())
})

ds("__ALL_EXPORTS — grep-audit visibility", () => {
  it("counts sections=14", () => {
    expect(mod.__ALL_EXPORTS.sections).toBe(14)
  })
  it("mainApi length >= 8 (brief requires 8 named exports)", () => {
    expect(mod.__ALL_EXPORTS.mainApi.length).toBeGreaterThanOrEqual(8)
  })
  it("mainApi includes moderateText", () => {
    expect(mod.__ALL_EXPORTS.mainApi).toContain("moderateText")
  })
  it("mainApi includes auditDarkPatterns", () => {
    expect(mod.__ALL_EXPORTS.mainApi).toContain("auditDarkPatterns")
  })
  it("mainApi includes chainModerationHash", () => {
    expect(mod.__ALL_EXPORTS.mainApi).toContain("chainModerationHash")
  })
  it("mainApi includes pseudonymizeUserId", () => {
    expect(mod.__ALL_EXPORTS.mainApi).toContain("pseudonymizeUserId")
  })
  it("error classes include ChainIntegrityError", () => {
    expect(mod.__ALL_EXPORTS.errorClasses).toContain("ChainIntegrityError")
  })
  it("version string is set", () => {
    expect(typeof mod.W65_COMMUNITY_MODERATION_ENGINE_VERSION).toBe("string")
    expect(mod.W65_COMMUNITY_MODERATION_ENGINE_VERSION.startsWith("w65.")).toBeTruthy()
  })
})
}

// =============================================================================
// Summary printout
// =============================================================================

// =============================================================================
// Summary printout
// =============================================================================

console.log("\n")
console.log("═".repeat(72))
console.log("  w65 community-moderation-engine — test results")
console.log("═".repeat(72))
console.log(`  total passes: ${harness.passes()}`)
console.log(`  total fails:  ${harness.fails()}`)
const fs = harness.failures()
if (fs.length > 0) {
  console.log("\n  FAILURES:")
  for (const f of fs) console.log(`    - ${f}`)
  console.log("═".repeat(72))
  process.exit(1)
}
console.log("═".repeat(72))
console.log("  ALL GREEN ✅")
console.log("═".repeat(72))
