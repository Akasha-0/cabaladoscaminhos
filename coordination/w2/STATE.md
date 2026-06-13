# coordination/w2/STATE.md — Worker w2 (UI/Mobile)

**Versao atual**: v0.1.2 | **Ciclo**: 18 | **Atualizacao**: 2026-06-12

---

## Domínio (w1: src/app/api/** por decision Ciclo 577)
`apps/akasha-portal/src/components/**`, `apps/akasha-portal/src/app/[locale]/**`, `apps/akasha-portal/src/app/dashboard/**`, `apps/akasha-portal/src/app/page.tsx`, `apps/akasha-portal/src/app/layout.tsx`, `apps/akasha-portal/src/app/not-found.tsx`, `apps/akasha-portal/src/app/global-error.tsx`, `public/**`

---

## Status: Ciclo 18 — Domain Glob Correction

| Verificação | Resultado |
|-------------|-----------|
| typecheck / build / lint | ✅ 0 errors, 46/46 páginas, 0 errors + 295 warnings (-12 w2 domain from Ciclo 11+12+13+16) (0 warnings em w2 domain — todos em w1/w3) (-11 w2 domain from Ciclo 11+12+13) (-10 w2 domain from Ciclo 11+12) (todos pré-existentes w1/w3) |
| AkashaSignificadoCard | ✅ 7 áreas: proposito, carreira, finanças, saúde, relacionamentos, sexualidade, espiritualidade |
| type mismatch w1 | ⚠️ `proposito`/`sexualidade` não estão no tipo `LifeArea` mas são usados em `aplicacao` — reportado em `requests.md` |
| APK build | ✅ `4e0d96f3` — 4.4MB APK |

### Histórico: ver `historico.md`

---

## 3 Proximos Passos (w2)

1. **[P1] Offline APK architecture** — server.url em capacitor.config.ts aponta para Vercel; APK online-only. Decision needed: (a) empty server.url for offline-ready APK, (b) keep as online-only production. Blocking PWA offline feature.
   - **Impacto**: APK funciona offline sem internet vs. requer conexao

2. **[P3] E2E mobile test** — Playwright viewport 375x812 (requer auth)
   - **Impacto**: garantia mobile-first antes de release

3. **[P3] LifeArea type fix wait** — aguardando w1 corrigir tipo LifeArea (proposito/sexualidade in, familia/criatividade out). Remover as LifeArea casts de AkashaSignificadoCard.tsx quando w1 publicar tipo corrigido.
   - **Impacto**: type safety nao depende de cast

---

## Decisoes Autonomas

- **cap-build.sh**: auto-detecta Java 21 + Android SDK; APK em android/app/build/outputs/apk/debug/
- **Mobile clamp()**: padding clamp(1rem, 4vw, 1.5rem) ---adapta 320px->1440px sem media queries
- **viewport**: maximumScale: 1, userScalable: false ---previne zoom acidental (PWA)
- **PWA manifest**: completo com icons, shortcuts, categories; sync para capacitor/ via cap-build.sh
- **service worker**: sw.js com cache-first estaticos, network-first transitos, stale-while-revalidate HTML
- **Auditoria local**: w2 domain 100% clean — 0 warnings em components/ + src/app/[locale]/. Conflito de dominio: src/app/api/** (backend/w1) no glob w2 reportado em requests.md.
- **server.url**: Vercel production ---APK online-only; offline capability bloqueada por P1 decision
