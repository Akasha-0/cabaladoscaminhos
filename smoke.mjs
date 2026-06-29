// w66 smoke-runtime — 6 checks per task brief (cycle 64 pattern).
// Plain ESM .mjs (no TS casts).
import * as mod from "./src/lib/w66/live-streams.ts"

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
console.log("  w66 live-streams — runtime smoke")
console.log("═".repeat(72))

// Reset before run
mod.resetStreamLedgerForTest()
const ctx = {
  hmacSecret: "w66-smoke-secret",
  chatConsentSalt: "w66-smoke-salt",
  pseudonymSalt: "w66-smoke-pseudo",
}

// 1. scheduleStream → schedule a Mesa Real
const scheduled = mod.scheduleStream(
  {
    title: "Mesa Real — Abertura da Sorte Cigana",
    topic: "MESA_REAL",
    hostId: "host-cigano-ramiro",
    sacredTags: ["Cigano", "Cigana", "Sol", "Lua"],
    scheduledStart: new Date(Date.now() + 3600_000).toISOString(),
    streamConsent: {
      grantedAt: "2026-06-29T22:00:00.000Z",
      expiresAt: "2026-12-29T22:00:00.000Z",
      faceConsent: true,
      voiceConsent: true,
      audienceConsent: true,
    },
  },
  ctx,
)
log(
  "1. scheduleStream Mesa Real → scheduled",
  scheduled.ok && scheduled.stream?.state === "scheduled" && scheduled.stream?.chainHash?.length === 64,
  `state=${scheduled.stream?.state} chainHash=${scheduled.stream?.chainHash?.slice(0, 16)}…`,
)

// 2. startStream → scheduled → live
const started = mod.startStream(scheduled.stream.id, ctx)
log(
  "2. startStream → live + streamKey 32-char",
  started.ok && started.stream?.state === "live" && started.stream?.streamKey?.length === 32,
  `state=${started.stream?.state} streamKey=${started.stream?.streamKey?.slice(0, 8)}…`,
)

// 3. joinStream → pseudonymized viewer token + viewer count
const joined = mod.joinStream(started.stream.id, {
  viewerId: "super-secret-viewer-id-AAA",
  pseudonymSalt: ctx.pseudonymSalt,
})
log(
  "3. joinStream pseudonymizes viewer (no raw in token)",
  joined.ok && joined.viewerToken.length > 0 && !joined.viewerToken.includes("super-secret-viewer-id-AAA") && joined.viewerCount === 1,
  `tokenLen=${joined.viewerToken.length} viewerCount=${joined.viewerCount}`,
)

// 4. moderateChatMessage sacred text → ALWAYS allowed
const sac = mod.moderateChatMessage(started.stream.id, {
  id: "m-smoke-1",
  streamId: String(started.stream.id),
  viewerToken: joined.viewerToken,
  text: "O Cigano e a Cigana abençoam esta Mesa Real junto com Exu",
  sentAt: new Date(Date.now() + 3600_000).toISOString(),
  sacredHits: [],
})
log(
  "4. moderateChatMessage sacred text → allowed + isSacred",
  sac.allowed === true && sac.isSacred === true && sac.sacredHits.length >= 2,
  `allowed=${sac.allowed} isSacred=${sac.isSacred} hits=[${sac.sacredHits.slice(0, 3).join(",")}]`,
)

// 5. heartbeatStream → re-anchors chain, verifyStreamChain passes
const hb = mod.heartbeatStream(started.stream.id, 99, ctx)
const verify = mod.verifyStreamChain(started.stream.id, ctx.hmacSecret)
log(
  "5. heartbeatStream + verifyStreamChain (cycle 65 lesson 4)",
  hb.ok === true && hb.stream?.currentViewerCount === 99 && verify.ok === true,
  `viewerCount=${hb.stream?.currentViewerCount} verifyOk=${verify.ok}`,
)

// 6. auditLiveStreamCoverage → 96 symbols across 6 traditions, isFullCoverage=true
const cov = mod.auditLiveStreamCoverage()
const allTraditions = ["CIGANO", "ORIXAS", "ASTROLOGIA", "SEFIROT", "CHAKRAS", "IFA"]
const allMet = allTraditions.every((t) => cov.traditionFloorMet[t] === true)
log(
  "6. auditLiveStreamCoverage → 96 symbols + full coverage",
  cov.totalSymbols === 96 && allMet && cov.isFullCoverage === true && cov.missingTraditions.length === 0,
  `total=${cov.totalSymbols} isFullCoverage=${cov.isFullCoverage} missing=[${cov.missingTraditions.join(",")}]`,
)

console.log("═".repeat(72))
console.log(`  TOTAL: ${pass} passed, ${fail} failed`)
console.log("═".repeat(72))
if (fail > 0) process.exit(1)
