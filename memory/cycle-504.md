# Cycle 504 — B2C Legacy Removal Complete

**Date**: 2026-06-04  
**Branch**: `claude/docs-refactor-alignment-FOUqN`  
**Commit**: `c456b8e0`

## Summary

B2C legacy artifacts fully removed per AD-17.4.

## Actions Taken

### 1. B2C API Routes Removed (39)
```
src/app/api/akashic/records/route.ts
src/app/api/ancestor/connection/route.ts
src/app/api/astrologia/{analise,previsao-mensal,transitos}/route.ts
src/app/api/astrology/{natal,planets,positions}/route.ts
src/app/api/audio/{route.ts,soundscapes/route.ts}
src/app/api/auth/{create-test,login-form,login,logout,register,status,test}/route.ts
src/app/api/cabala/{route.ts,sefirot/route.ts}
src/app/api/chart/{generate,interpretations}/route.ts
src/app/api/chat/oracle/route.ts
src/app/api/correlation/{analyze,diagnosis,ritual}/route.ts
src/app/api/dashboard/{ai-models,collaboration,correlation,data-sources,energy,notifications,workflow}/route.ts
src/app/api/divination/{route.ts,cross-system,oracle}/route.ts
src/app/api/divine/connection/route.ts
src/app/api/energy/{route.ts,flow,work}/route.ts
src/app/api/gamification/achievements/route.ts
src/app/api/guidance/types/route.ts
src/app/api/healing/types/route.ts
src/app/api/ifa/{route.ts,consulta}/route.ts
src/app/api/journal/spiritual/route.ts
src/app/api/lenormand/route.ts
src/app/api/mapa/{route.ts,insights,pdf,share}/route.ts
src/app/api/materials/route.ts
src/app/api/notifications/{route.ts,preferences,spiritual,stream,templates}/route.ts
src/app/api/numerologia/route.ts
src/app/api/numerology/readings/route.ts
src/app/api/odus/route.ts
src/app/api/og/route.tsx
src/app/api/onboarding/route.ts
src/app/api/orixa/{route.ts,profiles}/route.ts
src/app/api/payments/{checkout,portal}/route.ts
src/app/api/planetary/route.ts
src/app/api/progress/route.ts
src/app/api/stats/route.ts
src/app/api/swarm/{route.ts,knowledge}/route.ts
src/app/api/tarot/{route.ts,cards,consulta,do-dia,library,reading,readings}/route.ts
src/app/api/user/profile/route.ts
src/app/api/users/profile/route.ts
```

### 2. B2C Pages Removed (3)
```
src/app/calendario/page.tsx
src/app/privacy/page.tsx
src/app/terms/page.tsx
```

### 3. B2C Tests Removed (9)
```
tests/api/auth-login.test.ts
tests/api/auth-register.test.ts
tests/api/mapa.test.ts
tests/api/onboarding.test.ts
tests/api/previsao-mensal.test.ts
tests/integration/api/correlation-diagnosis.test.ts
tests/integration/api/mapa.test.ts
tests/integration/payments.test.ts
tests/integration/spiritual-reading.test.ts
```

## Verification

| Check | Result |
|-------|--------|
| TypeScript Build | 0 errors ✅ |
| Test Suite | 8716 passing ✅ |
| Test Files | 220 passed, 5 skipped ✅ |
| Git Status | Clean ✅ |

## Stats

- **Files deleted**: 93
- **Lines deleted**: 22.218
- **Backup**: `/tmp/b2c-backup-20260604-110022`

## Lessons Learned

1. **Always clean .next cache** after removing pages/routes — TypeScript validator caches stale references
2. **Test files must be removed** in same commit as routes — otherwise CI breaks
3. **Backup before destructive operations** — `git rm` is recoverable but messy

## Next Steps (Phase 55)

- Playwright E2E for Cockpit (dev server required)
- LLM token metrics dashboard (separate feature, deprioritized)
