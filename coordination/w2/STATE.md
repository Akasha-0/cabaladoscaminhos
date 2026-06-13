# coordination/w2/STATE.md — Worker w2 (UI/Mobile)

**Versao atual**: v0.1.2 | **Ciclo**: 107 | **Atualizacao**: 2026-06-13

---

## Domínio
`apps/akasha-portal/src/components/**`, `apps/akasha-portal/src/app/[locale]/**`, `apps/akasha-portal/src/app/dashboard/**`, `apps/akasha-portal/src/app/page.tsx`, `apps/akasha-portal/src/app/layout.tsx`, `apps/akasha-portal/src/app/not-found.tsx`, `apps/akasha-portal/src/app/global-error.tsx`, `public/**`

---

## Status: Ciclo 107 — UI code hygiene & warnings cleanup

| Verificação | Resultado |
|-------------|-----------|
| typecheck / lint | ✅ 0 errors |
| w2 domain warnings | ✅ 0 |
| Attribution DEC-004 | ✅ JSX linha 130 |
| APK build | ✅ `4e0d96f3` — 4.4MB |

### Histórico: ver `historico.md`

---

## 3 Próximos Passos (w2)

1. **[P1] Offline APK** — server.url capacitor.config.ts aguarda decisão humana. Impacto: APK offline vs online-only.
2. **[P3] E2E mobile** — Playwright 375×812 requer auth. Impacto: garantia mobile-first.
3. **[P4] UI performance check** — Monitorar carregamento de componentes pesados na UI. Impacto: UX mobile fluida.

---

## Decisões Autônomas

- **cap-build.sh**: auto-detecta Java 21 + Android SDK
- **Mobile clamp()**: padding clamp(1rem, 4vw, 1.5rem)
- **PWA viewport**: maximumScale: 1, userScalable: false
- **service worker**: sw.js offline-ready (cache-first + network-first + stale-while-revalidate)
- **server.url**: Vercel production → APK online-only
- **AkashaSignificadoCard header fix**: Corrigido mapeamento de abas para as áreas `sexualidade` e `espiritualidade` na UI.
- **AkashaSignificadoCard type cast removal**: Modificado `AREAS_WITH_DATA` para `LifeArea[]` e o estado `area` para `LifeArea` para remover todos os casts redundantes `as LifeArea` na indexação do objeto `interp.aplicacao`.
- **UI code hygiene**: Removidos todos os 10 warnings de linter e compilador na pasta de componentes UI (StreakCalendar, DashboardStats, ErrorState, card, city-autocomplete, dialog, progress, SupabaseProvider) garantindo 0 warnings e 0 errors no domínio w2.
