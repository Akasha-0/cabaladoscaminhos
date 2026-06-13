# coordination/w2/historico.md — Histórico de Ciclos w2

## Ciclo 7 (2026-06-12) — AUDITORIA LOCAL
- typecheck 0 ✅, build 46/46 ✅, lint 0 errors ✅
- APK 4.4MB (`4e0d96f3`) ✅, cap-build.sh tracked ✅
- AkashaSignificadoCard: clamp(), maxWidth:100%, flexWrap ✅
- w2 domain limpo de warnings (307 warnings todos w1/w3)
- viewport: maximumScale=1, userScalable=false ✅
- BACKLOG GERADO: (1) 9 áreas vs 5 — coverage vida areas, (2) PWA manifest audit, (3) E2E mobile test

## Ciclos 5-6 (2026-06-12)
- cap-build.sh criado e melhorado com auto-detect Java/Android SDK
- APK build end-to-end funcionando (Java 21, Android SDK)
- .gitignore fix: cap-build.sh não mais ignorado

## Ciclos 2-4 (2026-06-12)
- AkashaSignificadoCard integrado no dashboard
- AkashaSignificadoCard mobile-responsive (clamp padding)
- AkashaSignificadoCard defaultNivel prop com dominantFrequency
- HTML entities, <a>→<Link>, dead imports removidos
## Ciclo 8 (2026-06-12)
- AkashaSignificadoCard: AREAS_WITH_DATA 5→7 (sexualidade + espiritualidade)
- area state: LifeArea→string + as LifeArea casts (3 lugares)
- requests.md: type mismatch LifeArea vs aplicacao reportado a w1
- Commit `056edbeb`: typecheck 0, build 46/46, lint 0 errors


## Ciclo 9 (2026-06-12)
- PWA audit: manifest.json + sw.js + icons em public/ verificados
- manifest: completo (name, short_name, icons 192/512/maskable, shortcuts, categories)
- sw.js: cache-first estaticos, network-first transitos, stale-while-revalidate HTML
- capacitor/: manifest.json + sw.js syncados via cap-build.sh
- server.url: Vercel production — APK online-only, offline bloqueada por architecture
- requests.md: offline APK architecture reportado como P1 para integrador

## Ciclo 10 (2026-06-12) — AUDITORIA LOCAL
- typecheck 0 errors, build 46/46, lint 0 errors + 306 warnings (todos pre-existentes w1/w3)
- Warnings w2 domain: 4 hygiene items non-blocking (DailyTransitUI, PILAR_ICONE, locale, motion)
- APK 4.4MB (4e0d96f3) + cap-build.sh OK
- Backlog: P1 offline APK blocked by architecture decision; P3 E2E blocked by auth; P3 LifeArea wait w1
- PWA manifest + sw.js: OK (online-only APK, offline blocked by server.url decision)

## Ciclo 11 (2026-06-12)
- Dead code cleanup: 7 warnings removidos (306 -> 299 warnings)
  - AkashaLifeAreasDashboard: DailyTransitUI, AUTHORITY_ICONS, ak, bk
  - DimensaoCard: PILAR_ICONE, PILAR_NOME
  - MandalaNarrative: locale
- test_write.txt removido
- Commit bd9de5c5

## Ciclo 12 (2026-06-12)
- Hygiene round 2: removed 3 more unused imports
  - diario/page.tsx: significadoGenericoDoPilar
  - glossario/page.tsx: GLOSSARIO
  - mural/page.tsx: redirect
- lint: 299 -> 296 warnings
- Commit 5c4c91be

## Ciclo 13 (2026-06-12)
- Hygiene round 3: 3 files + 4 items removed
  - CalendarDay.tsx: motion import unused
  - onboarding/page.tsx: locale var + params const + useParams import (all unused)
- Commit b24a006d (CalendarDay + locale)
- Commit 28516f77 (useParams + params)
- lint: 296 -> 295 warnings

## Ciclo 14 (2026-06-12)
- DOMAIN VIOLATION: pillarContribution removido de AkashaLifeAreasDashboard.tsx (35 linhas, commit a7b5ab9b)
- DEC-004: "Inspirado em Gene Keys (Richard Rudd)" adicionado ao header de AkashaSignificadoCard.tsx (commit 3f64039e)
- typecheck: 0 errors ✅
- lint: 296 warnings (pillarContribution removido nao afetou contagem)
- Commits: 3f64039e (Gene Keys), a7b5ab9b (pillarContribution)

## Ciclo 15 (2026-06-12)
- Auditoria local completa: typecheck 0, lint 0 errors em w2 domain (components/ + src/app/[locale]/)
- Conflito dominio: src/app/api/** (backend/w1) no glob w2; reportado em requests.md
- Commit requests.md: domain conflict filed
