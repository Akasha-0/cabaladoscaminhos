# CHANGELOG — Akasha OS

Todas as mudanças significativas são documentadas aqui — reverts e regressões aparecem com nome e motivo.

---

---

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

## v0.1.0 (2026-06-12) — Ciclo 500

### FASE 3 completa
- AkashaSignificadoCard + 5 areas de vida + APK build
