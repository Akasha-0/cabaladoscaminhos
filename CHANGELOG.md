# CHANGELOG — Akasha OS

Todas as mudanças significativas são documentadas aqui — reverts e regressões aparecem com nome e motivo.

---

---

## v0.1.8 (2026-06-14) — Ciclo 13

### fix(w2): Dashboard missing meu-dia elements and test suite fixes
- **Fixed Loading Race Condition**: Updated the dashboard loader check to keep the spinner visible until all required async datasets (`statsData`, `synthesis`, and `detSintese`) are resolved. This ensures that elements like "Perfil de Hoje", "Akasha Authority", and "Foco Prioritário" do not render empty or missing cards on slow network requests.
- **Robust Birth Time Parsing**: Added a robust time normalization utility `parseHora` to the dashboard server page component, ensuring that the Akasha input validation does not reject timestamps with seconds (e.g. `HH:MM:SS`) or empty formats.
- **Test Suite Alignment**: Corrected the assertion in `tests/api/akasha/mandato-do-dia/route.test.ts` to expect `body.pilares` to be defined instead of undefined, matching the new payload schema introduced in F-222.
- **Sidebar Collapse Verification**: Verified the responsive and collapsible navigation sidebar state transitions, which allow collapsing desktop navigation to `w-16` using top and bottom chevron controls.

## v0.1.7 (2026-06-13) — Ciclo 12

### feat(w2): Consolidated Dashboard and Responsive Navigation
- **Unified Routing**: Moved dashboard to localized `/[locale]/dashboard` sharing layouts, and added redirection from root `/dashboard` and `/meu-dia` to their localized counterpart.
- **Meu Dia Tab Consolidation**: Compacted the `/meu-dia` page as a Tab inside `/dashboard`, reducing routing bloat and displaying daily vibe (climate, moon, theme), Akasha type (OneProfileCard), daily decision (DailyDecisionCard), and a check-in action to mark the daily ritual as completed.
- **Akasha Navigation Layout**: Created a responsive `<AkashaNavigation>` sidebar (on desktop) and hamburger sliding drawer (on mobile), with a profile details card at the bottom displaying user birth details (name, date, time, city) and a custom cosmic initials avatar.
- **Mandala Terminology and Degree Formatting**: Renamed raw systems layers to unified "Camadas do Akasha" (C1..C5: Ori, Contrato, Vitalidade, Céu, Chave) and added a degree-formatting utility mapping raw float values (e.g. `Asc 343.7259` -> `Peixes 13°`).

## v0.1.6 (2026-06-12) — Ciclo 11

### fix(w2): dead code cleanup
- Removidos 7 warnings de codigo nao-utilizado: `DailyTransitUI` e `AUTHORITY_ICONS` de `AkashaLifeAreasDashboard`, `PILAR_ICONE` e `PILAR_NOME` de `DimensaoCard`, `locale` de `MandalaNarrative`
- Lint: 306 → 299 warnings
- **Impacto**: code hygiene, zero impacto para usuario

## v0.1.6 (2026-06-12) — Ciclo 10

### docs(w2): Ciclo 10 — auditoria local completa
- **Suite validada**: typecheck 0 errors, build 46/46, lint 0 errors + 306 warnings (todos pre-existentes w1/w3)
- **APK 4.4MB**: PWA manifest + service worker OK
- **Backlog w2**: P1 offline APK (blocked), P3 E2E (blocked auth), P3 LifeArea (blocked w1)
- **Warnings w2 domain**: 4 hygiene items (DailyTransitUI, PILAR_ICONE, PILAR_NOME, locale, motion) — non-blocking

---

## v0.1.5 (2026-06-12) — Ciclo 541

### feat(w2): AkashaSignificadoCard mobile-responsive
- `clamp()` padding + `maxWidth: '100%'` para adaptacao sem media queries

### feat(w2): AkashaSignificadoCard prop defaultNivel
- `defaultNivel?: 'shadow' | 'gift' | 'siddhi'` — dashboard passa `dominantFrequency`

### feat(w2): AkashaSignificadoCard — 7 areas da vida
- AREAS_WITH_DATA expandido de 5 para 7: `sexualidade` + `espiritualidade`

### fix(w2): type mismatch LifeArea
- `area` state de `LifeArea` para `string`; casts `as LifeArea` onde `aplicacao` indexada

### fix(w2): .gitignore
- Removeu `apps/akasha-portal/cap-build.sh` do ignore (só capacitor/ output deve ser ignorado)

### feat(w2): cap-build.sh — APK build completo
- Script auto-detecta Java + Android SDK; APK 4.4MB em `android/app/build/outputs/apk/debug/`

### feat(w2): AkashaSignificadoCard no dashboard principal
- Substituiu `LifePathInsightCard` pelo `AkashaSignificadoCard` completo em `/dashboard`

### fix(w2): HTML entities e Next.js Link
- `&ldquo;`/`&rdquo;` corrigidos; `<a>` → `<Link>` em `mandala/page.tsx`

---

## v0.1.4 (2026-06-12) — Ciclo 528

### Motor e glossario DEC-004 attribution
- shadow/gift/siddhi = "Inspirado em Gene Keys (Richard Rudd)"
- Atribuicao no motor de sintese e no glossario

---

## v0.1.3 (2026-06-12) — Ciclo 520

### Dead code removido
- Arquivos sem uso removidos do codebase

---

## v0.1.2 (2026-06-12) — Ciclo 515

### build: standalone output
- `output: 'standalone'` configurado

---

## v0.1.1 (2026-06-12) — Ciclo 506

### docs: historico de integracao
- `historico.md` por dominio para auditoria

---
## [0.2.1] — 2026-06-15

### feat(loop): 5 changed files lack tests
- Added test coverage for changed files identified by akasha-evolution loop

## [0.3.1] — 2026-06-15

### feat(loop): 5 files with TODO
- Resolved TODO comments in 5 files

## [0.4.1] — 2026-06-15

### feat(loop): 28 oversized files
- Addressed 28 oversized files (>500 LOC)

## [0.5.1] — 2026-06-15

### feat(loop): 12 changed files lack tests
- Added test coverage for 12 changed files

## [0.6.1] — 2026-06-15

### feat(loop): TypeScript typecheck is clean
- Verified pnpm typecheck passes with 0 errors

## [0.7.1] — 2026-06-15

### feat(loop): 5 files with TODO
- Resolved remaining TODO comments in codebase

## v0.1.0 (2026-06-12) — Ciclo 500

### FASE 3 completa
- AkashaSignificadoCard + 5 areas de vida + APK build
