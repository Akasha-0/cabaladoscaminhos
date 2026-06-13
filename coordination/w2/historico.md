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
