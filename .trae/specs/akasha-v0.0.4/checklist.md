# Checklist — Akasha v0.0.4 (Pós-Launch: Conclusão, Atmosfera & Escala)

## Fase 0 — PRÉ-REQUISITO

- [ ] `prisma/schema.prisma` contém os 9 modelos B2C canônicos + 4 enums (Doc 04 §1)
- [ ] `npx prisma validate` + `npx prisma generate` → 0 erros
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run test:run` → ≥ 8113 testes passando, 0 falhas
- [ ] `npm run build` → OK
- [ ] `grimoire/botanica/*.md` tem ≥ 50 arquivos com `title_en` e frontmatter YAML válido
- [ ] `grimoire/ancestral/odu-*.md` tem 16 arquivos
- [ ] `grimoire/vibracional/corpo-*.md` tem 11 arquivos
- [ ] `grimoire/diagnostico/*.md` tem 4 arquivos
- [ ] `docs/15_glossario-oracular.md §1` ainda tem `⚠️ PROVISIONAL (D4)` — GAP CONFIRMADO _(bloqueia T3.4)_
- [x] `apps/akasha-portal/` está vazio (apenas `next-env.d.ts` e `tsconfig.tsbuildinfo`) — RESOLVIDO _(cycle 356: skeleton criado — `package.json` + `tsconfig.json` + `next.config.js` + dirs `src/`/`public/`/`prisma/`/; código B2C será movido em T1.3+)_
- [ ] `packages/core-{astrology,cabala,odus,tantra,types}/` existem (Fase A ✅)

## Fase 1 — CONCLUSÃO TÉCNICA

### Task 1 — Migração monorepo completa
- [ ] Inventário de arquivos a mover gerado
- [x] Estrutura `apps/akasha-portal/{src,public,prisma}/` criada com `package.json` e `tsconfig.json` _(cycle 356 — skeleton mínimo com next.config.js + .gitkeep)_
- [ ] Código B2C movido para `apps/akasha-portal/src/` preservando imports
- [ ] `prisma/schema.prisma` movido para `apps/akasha-portal/prisma/`
- [ ] `pnpm-workspace.yaml` e `turbo.json` configurados
- [ ] `package.json` raiz com retrocompatibilidade (`npm run build` ainda funciona)
- [ ] Testes reorganizados: `tests/api/akasha*`, `tests/components/mandala*`, `tests/lib/grimoire*`, `tests/integration/oraculo-rag-fechado*`, `tests/integration/daily-engine-rag*`
- [ ] `pnpm install` + `pnpm --filter akasha-portal build` + `pnpm test:core` verdes
- [ ] `npm run build` (retrocompat) verde

### Task 2 — Shutdown formal do legacy-cockpit
- [x] `apps/legacy-cockpit/` (se existir) removido definitivamente _(refactor Akasha v2 `53c8501c`, cycle 334)_
- [x] `apps/akasha-portal/src/middleware.ts` sem allowlist de prefixos B2B (`/cockpit`, `/api/mesa-real`, `/api/consult`, `/api/operator`) _(audit `00d4328a`, cycle 351)_
- [x] `apps/akasha-portal/src/app/api/operator/`, `mesa-real/`, `consult/` (legado) — não existem _(audit `00d4328a`, cycle 351)_
- [x] `AUTH-AUDIT.md` reflete zero rotas/páginas B2B _(stamp `bb33dcee`, cycle 350)_
- [x] `Doc 08` v3.1 — Onda 4.8 (desligar legacy-cockpit) marcado como ✅ _(formalização `8ecbbfff`)_
- [x] `Doc 25 §11` — `apps/legacy-cockpit` removido do diagrama _(formalização `8ecbbfff`)_
- [x] Verificação estrutural: `tests/integration/legacy-shutdown.test.ts` _(cycle 356 — 6 testes verdes, reproduz audit `00d4328a` em CI; runtime curl 404 deferido para T1 que move `src/` → `apps/akasha-portal/`)_

### Task 3 — Validação D4 (16 Odus)
- [ ] Auditoria de `grimoire/ancestral/odu-*.md` — proveniência atual mapeada
- [ ] Os 16 arquivos têm `metadata.source` e `metadata.lineage` preenchidos
- [ ] `IDEIA.md` (ledger) tem entrada para cada um dos 16 Odus com proveniência (Doc 20 AD-20.5)
- [ ] `Doc 15 §1` — `⚠️ PROVISIONAL (D4)` removido do cabeçalho e da tabela
- [ ] `Doc 15` version bumped 2.1 → 2.2
- [ ] `tests/grimoire/odus-validation.test.ts` verde (auditoria automatizada)
- [ ] `npm run test:run` verde nos novos testes

### Task 4 — Quality gates Fase 1
- [ ] `npx prisma validate` + `npx prisma generate` verdes
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run test:run` → ≥ 8113 testes passando, 0 falhas
- [ ] `npm run build` → OK
- [ ] `npm run lint` → sem novos warnings
- [ ] `npm run quality` (fallow) → 0 issues novas
- [ ] `pnpm --filter akasha-portal build` → OK
- [ ] `PROGRESS.md` §3.1 atualizado

## Fase 2 — CAMADA ATMOSFÉRICA

### Task 5 — Three.js atmosfera WebGL
- [ ] `three` + `@react-three/fiber` + `@react-three/drei` instalados em `apps/akasha-portal/package.json`
- [ ] `apps/akasha-portal/src/components/mandala/MandalaAtmosphere.tsx` criado:
  - Toroide etéreo em `wireframe` + 50–100 instâncias de partículas
  - Rotação lenta no eixo Y (0.1 rad/s)
  - `dpr={[1, 2]}` para retina
  - `frameloop="demand"` em `prefers-reduced-motion: reduce`
  - Cores conforme Doc 26 §3 (paleta cósmica)
- [ ] Wire-up em `MandalaChart.tsx` como `<div className="absolute inset-0 -z-10">` (sem raycasting cruzado)
- [ ] Toggle de intensidade (low/medium/high) no `cockpit-store` Zustand
- [ ] `tests/components/mandala/atmosphere.test.tsx` verde
- [ ] Lighthouse mobile: Performance ≥ 90 (não regredir)
- [ ] `npm run test:run` + `npm run build` + Lighthouse verdes

### Task 6 — PWA full-install
- [ ] `apps/akasha-portal/public/manifest.json` com `name`/`short_name`/`start_url`/`display: standalone`/`theme_color: #06070F`/`icons[192/512]`
- [ ] Ícones 192/512 gerados (Doc 26) + `apple-touch-icon-180.png`
- [ ] `apps/akasha-portal/public/sw.js` com:
  - Cache-first para assets estáticos (`/icons/*`, `/fonts/*`)
  - Network-first para `transitos_diarios:YYYY-MM-DD` (via API)
  - Stale-while-revalidate para HTML
- [ ] Service worker registrado em `apps/akasha-portal/src/app/layout.tsx`
- [ ] `<link rel="manifest">` + `<meta name="theme-color">` + `<link rel="apple-touch-icon">` no `<head>`
- [ ] Chrome DevTools → Application → Installability passa
- [ ] Lighthouse PWA ≥ 90

### Task 7 — Push notifications (VAPID + Web Push API)
- [ ] Par VAPID gerado e adicionado ao `.env.example` (`NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + `VAPID_SUBJECT`)
- [ ] `User.pushEnabled Boolean @default(false)` + `User.pushSubscription Json?` no schema + migration
- [ ] `apps/akasha-portal/src/lib/push/subscribe.ts` (client-side)
- [ ] `apps/akasha-portal/src/lib/push/send.ts` (server-side, usa `web-push`)
- [ ] Rota `POST /api/akasha/push/subscribe` (gate `requireAkashaApi`)
- [ ] Toggle "Notificações" em `/conta` (opt-in LGPD)
- [ ] `apps/akasha-portal/scripts/daily-transits-cron.ts` envia push após gerar `daily_readings` (msg genérica, sem conteúdo)
- [ ] Evento `push.sent` no log estruturado (Doc 22 AD-22.4)
- [ ] `Doc 22 §4` (tabela de auditoria) atualizado com `push.sent`
- [ ] `tests/lib/push/send.test.ts` verde (mock `web-push`, valida payload sem conteúdo)
- [ ] `tests/api/akasha/push/subscribe.test.ts` verde (POST/DELETE)
- [ ] Smoke test em dev: subscription → push recebido em DevTools

### Task 8 — Quality gates Fase 2
- [ ] `npx prisma validate` + `npx prisma generate` verdes
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run test:run` → ≥ 8200 testes passando, 0 falhas
- [ ] `npm run build` → OK
- [ ] `npm run lint` → sem novos warnings
- [ ] `npm run quality` (fallow) → 0 issues novas
- [ ] Lighthouse mobile: Performance ≥ 90, PWA ≥ 90
- [ ] `PROGRESS.md` §3.1 atualizado

## Fase 3 — ESCALA GLOBAL

### Task 9 — i18n EN completa do Grimório (corpo + UI)
- [ ] Auditoria de `## EN` em `grimoire/botanica/erva-*.md` (52 arquivos)
- [ ] Auditoria de `## EN` em `grimoire/ancestral/odu-*.md` (16 arquivos)
- [ ] Auditoria de `## EN` em `grimoire/vibracional/corpo-*.md` (11 arquivos)
- [ ] Auditoria de `## EN` em `grimoire/diagnostico/*.md` (4 arquivos)
- [ ] Corpo dos arquivos pendentes traduzido (PT-BR → EN)
- [ ] `next-intl` instalado e configurado em `apps/akasha-portal/`
- [ ] `apps/akasha-portal/src/i18n/pt-BR.json` + `en.json` com todas as chaves da UI
- [ ] `[locale]` segment em `apps/akasha-portal/src/app/(pt-BR|en)/` com páginas movidas
- [ ] `apps/akasha-portal/src/middleware.ts` detecta locale via `Accept-Language` + cookie `NEXT_LOCALE`
- [ ] Toggle de idioma em `apps/akasha-portal/src/components/layout/LocaleSwitcher.tsx`
- [ ] `tests/i18n/grimoire-completeness.test.ts` verde (83 arquivos com `## EN` + `title_en`)
- [ ] `Doc 15` bumped para v2.3 (EN completo)
- [ ] `Doc 25 §12` — AD-25.12 marcado como ✅
- [ ] `tests/i18n/middleware.test.ts` verde
- [ ] `tests/i18n/dictionaries.test.ts` verde (todas as chaves em ambos os locales)
- [ ] Manual: `Accept-Language: en` → UI em inglês; cookie pt-BR → UI em pt-BR

### Task 10 — (Opcional) I-Ching 5º sistema
- [ ] `User.ichingMap Json?` no schema + migration
- [ ] `packages/core-iching/` agnóstico criado com:
  - Função `buildIchingMap({ birthDate, birthTime, ... })`
  - Tabela canônica dos 64 hexagramas e 8 trigramas
  - Algoritmo determinístico de hexagrama natal
  - ≥ 8 testes unitários (hexagramas conhecidos)
- [ ] Bloco `CorrelationEntry.iching{ aspects: string[]; extractionKeys: string[] }` em `packages/core-graph/`
- [ ] `grimoire/iching/` com 8 hexagramas curados (frontmatter YAML + corpo)
- [ ] `PromptBuilder` (Doc 14 Passo 4) extrai `ichingData` condicionalmente
- [ ] Pilar "iching" no roteador de temas (Doc 14 Passo 5)
- [ ] `IDEIA.md` (ledger) e `Doc 25 §1` atualizados
- [ ] `grimoire:sync` inclui `grimoire/iching/`
- [ ] Smoke test: hexagrama natal gerado e exibido no Centro de Comando

### Task 11 — Quality gates finais + release
- [ ] `npx prisma validate` + `npx prisma generate` verdes
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run test:run` → ≥ 8500 testes passando, 0 falhas
- [ ] `npm run build` → OK, 0 warnings novos
- [ ] `npm run lint` → 0 warnings novos
- [ ] `npm run quality` (fallow) → 0 issues
- [ ] Lighthouse mobile: Performance ≥ 90, PWA ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 90
- [ ] `PROGRESS.md` §2 e §3.1 atualizados com métricas da Fase 3
- [ ] `Doc 08` v3.2 (Onda 5 ✅)
- [ ] `Doc 25 §12` — AD-25.6, AD-25.9, AD-25.12 marcados como ✅
- [ ] Commit final + push + tag de release `v1.1.0-akasha`

## Critérios de Sucesso Globais (v0.0.4)

- [ ] **Monorepo funcional:** código B2C vive em `apps/akasha-portal/` (Doc 25 §11); `pnpm --filter akasha-portal build` e `npm run build` (retrocompat) ambos verdes
- [ ] **Legado desligado:** zero rotas/páginas B2B no repo; `apps/legacy-cockpit/` removido; middleware sem allowlist de Cockpit
- [ ] **Odus validados (D4 ✅):** `Doc 15 §1` sem `⚠️ PROVISIONAL`; proveniência (`source` + `lineage`) em todos os 16 arquivos
- [ ] **Vivo:** Toroide WebGL renderiza em mobile (≥ 30fps) com `prefers-reduced-motion` respeitado
- [ ] **Retentivo:** PWA instalável (Lighthouse ≥ 90) + push notifications após opt-in LGPD
- [ ] **Global:** UI e Grimório em pt-BR e en; toggle preserva rota; cobertura EN completa (83 arquivos)
- [ ] **Extensível:** (se T10 executada) I-Ching como 5º sistema seguindo Doc 14
- [ ] **Operável:** ≥ 8500 testes passando; build OK; QUALITY_SCORE ≥ 0.91 mantido
