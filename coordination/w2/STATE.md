# coordination/w2/STATE.md — Worker w2 (UI/Mobile)

**Versao atual**: v0.1.2 | **Ciclo**: 63 | **Atualizacao**: 2026-06-12

---

## Domínio
`apps/akasha-portal/src/components/**`, `apps/akasha-portal/src/app/[locale]/**`, `apps/akasha-portal/src/app/dashboard/**`, `apps/akasha-portal/src/app/page.tsx`, `apps/akasha-portal/src/app/layout.tsx`, `apps/akasha-portal/src/app/not-found.tsx`, `apps/akasha-portal/src/app/global-error.tsx`, `public/**`

---

## Status: Ciclo 63 — Auditoria Local

| Verificação | Resultado |
|-------------|-----------|
| typecheck / lint | ✅ 0 errors, 295 warnings (todos w1/w3) |
| w2 domain warnings | ✅ 0 |
| Attribution DEC-004 | ✅ JSX linha 130 |
| APK build | ✅ `4e0d96f3` — 4.4MB |

### Histórico: ver `historico.md`

---

## 3 Próximos Passos (w2)

1. **[P1] Offline APK** — server.url capacitor.config.ts aguarda decisão humana. Impacto: APK offline vs online-only.
2. **[P3] E2E mobile** — Playwright 375×812 requer auth. Impacto: garantia mobile-first.
3. **[P3] LifeArea type** — aguarda w1 corrigir tipo. Impacto: remove `as LifeArea` cast.

---

## Decisões Autônomas

- **cap-build.sh**: auto-detecta Java 21 + Android SDK
- **Mobile clamp()**: padding clamp(1rem, 4vw, 1.5rem)
- **PWA viewport**: maximumScale: 1, userScalable: false
- **service worker**: sw.js offline-ready (cache-first + network-first + stale-while-revalidate)
- **server.url**: Vercel production → APK online-only
