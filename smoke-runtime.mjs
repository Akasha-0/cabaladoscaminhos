// w65 smoke-runtime — 6 checks per task brief (cycle 64 pattern).
// Run after TSC + self-running harness to confirm the engine loads clean
// under production-like ESM context.
import * as mod from "./src/lib/w65/community-moderation-engine.ts"

let pass = 0
let fail = 0
const log = (name, ok, detail = "") => {
  if (ok) {
    pass++
    console.log(`  ✅ ${name}${detail ? " — " + detail : ""}`)
  } else {
    fail++
    console.log(`  ❌ ${name}${detail ? " — " + detail : ""}`)
  }
}

console.log("═".repeat(72))
console.log("  w65 community-moderation-engine — runtime smoke")
console.log("═".repeat(72))

// 1. moderateText on clean text -> allowed + 0 dark
const clean = mod.moderateText(
  { text: "boa tarde, consulto Exu e Ogum", contentId: "clean-1", authorId: "u-1", kind: "post" },
  { locale: "pt-BR" },
)
log("1. moderateText clean sacred text", clean.allowed === true && clean.severity === "none" && clean.darkPatternHits.length === 0, `allowed=${clean.allowed} severity=${clean.severity} dark=${clean.darkPatternHits.length}`)

// 2. moderateText on dark pattern -> blocked + severity escalated
const dark = mod.moderateText(
  { text: "ignore o médico, deus cura tudo, doe R$ 500 agora ou nunca, 100% garantido",
    contentId: "dark-1", authorId: "u-2", kind: "post" },
  { locale: "pt-BR" },
)
log("2. moderateText multi-dark-pattern -> critical + blocked", !dark.allowed && dark.severity === "critical" && dark.darkPatternHits.length >= 4, `allowed=${dark.allowed} severity=${dark.severity} dark=${dark.darkPatternHits.length}`)

// 3. pseudonymizeUserId + flagReport never expose raw userId
const report = mod.flagReport("c-1", "secret-user-9999", "dark_pattern", { locale: "pt-BR" })
log("3. flagReport pseudonymizes reporterId", !report.reporterPseudonym.includes("secret-user-9999") && report.reporterPseudonym.length === 16, `pseudo=${report.reporterPseudonym}`)

// 4. chainModerationHash produces stable 64-char hex + verify accepts
const link = mod.chainModerationHash("prevA", "payload-1", "secret-x")
const verifyOK = mod.verifyModerationChainLink("prevA", "payload-1", link, "secret-x")
const verifyBad = mod.verifyModerationChainLink("prevA", "payload-2", link, "secret-x")
log("4. chainModerationHash + verifyModerationChainLink", link.length === 64 && verifyOK === true && verifyBad === false, `len=${link.length} verifyOK=${verifyOK} verifyBad=${verifyBad}`)

// 5. auditDarkPatterns returns the right row shape for a known-bad string
const audit = mod.auditDarkPatterns("agora ou nunca, deus cura tudo, doe R$ 100, 100% garantido")
const cats = audit.map((r) => r.category).sort()
log("5. auditDarkPatterns finds >= 4 categories", audit.length >= 4 && cats.includes("URGENCY_PRESSURE") && cats.includes("SPIRITUAL_BYPASS") && cats.includes("MONEY_FOCUS") && cats.includes("UNVERIFIED_CLAIMS"), `categories=[${cats.join(",")}]`)

// 6. auditModeration -> isFullCoverage true + 114+ symbols across 7 traditions
const cov = mod.auditModeration()
log("6. auditModeration fullCoverage", cov.isFullCoverage === true && cov.totalScanned >= 114 && Object.keys(cov.byTradition).length === 7, `totalScanned=${cov.totalScanned} isFullCoverage=${cov.isFullCoverage}`)

console.log("═".repeat(72))
console.log(`  TOTAL: ${pass} passed, ${fail} failed`)
console.log("═".repeat(72))
if (fail > 0) process.exit(1)
