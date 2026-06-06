# Checklist — Akasha Onda 3 Live + Lançamento

## Fase 0 — PRÉ-REQUISITO

- [ ] `prisma/schema.prisma` contém apenas o núcleo B2C canônico (10 models + 4 enums conforme Doc 04 §1–5)
- [ ] Não existem `src/app/api/operator/**`, `src/app/cockpit/**`, `src/lib/auth/operator-*`, `src/lib/db/client-actions.ts`
- [ ] `npx prisma validate` + `npx prisma generate` → 0 erros
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run test:run` → ≥ 8783 testes passando, 0 falhas
- [ ] `npm run build` → OK
- [ ] `docs/04_data-model.md`, `docs/03_architecture-spec.md`, `AUTH-AUDIT.md`, `MIGRATIONS.md` sem menção a "legado/quarentena B2B"

## Fase 1 — ONDA 3 ATIVA

### Task 1 — Embeddings GrimoireEntry
- [ ] Migration `<ts>_grimoire_embedding_active/migration.sql` criada com `CREATE EXTENSION vector`, `ADD COLUMN embedding vector(768)`, `CREATE INDEX grimoire_embedding_idx`
- [ ] `MIGRATIONS.md` atualizado com referência à nova migration
- [ ] `npx prisma validate` + `npx prisma generate` + `npm run build` verdes

### Task 2 — Pipeline embeddings Ollama
- [ ] `src/lib/grimoire/sync.ts` revisto: lê `grimoire/**/*.md`, gera embeddings via Ollama `nomic-embed-text`, fallback gracioso
- [ ] `src/app/api/admin/webhooks/grimoire-sync/route.ts` valida HMAC-SHA256 com `GITHUB_WEBHOOK_SECRET`
- [ ] `tests/api/admin/webhooks/grimoire-sync.test.ts` cobre 200/401/500
- [ ] `npm run grimoire:status` retorna contagem de entries com/sem embedding
- [ ] `npm run test:run` verde

### Task 3 — Busca híbrida
- [ ] `src/lib/grimoire/search.ts` com `searchGrimoire({ tags, query, limit })` combinando JSONB containment + pgvector cosine
- [ ] `src/lib/grimoire/types.ts` com `GrimoireSearchQuery` + `GrimoireSearchResult`
- [ ] `src/app/api/akasha/consult/route.ts` chama `searchGrimoire` e injeta `grimoireRefs[]`
- [ ] `tests/lib/grimoire/search.test.ts` cobre filtro simples/múltiplo, fallback, ordenação, injeção no ChatMessage
- [ ] `npm run test:run` verde

### Task 4 — Cronjob de trânsitos
- [ ] `scripts/daily-transits-cron.ts` calcula trânsitos 00:00–23:59 UTC e salva em Redis `transitos_diarios:YYYY-MM-DD` TTL 86400s
- [ ] Fallback `TRANSITS_FALLBACK_PATH` documentado e testado
- [ ] `deploy/systemd/cabala-transits.{service,timer}` criados (`OnCalendar=*-*-* 00:00:00 UTC`)
- [ ] `src/app/api/akasha/transits/today/route.ts` lê Redis com fallback
- [ ] `/api/health` (readiness) inclui `redis:has(transitos_diarios:YYYY-MM-DD)`
- [ ] `tests/scripts/daily-transits-cron.test.ts` e `tests/api/akasha/transits/today.test.ts` verdes
- [ ] `npm run test:run` + `npm run build` verdes

### Task 5 — Conteúdo do Grimório
- [ ] ≥ 50 arquivos em `grimoire/botanica/*.md` com frontmatter YAML válido (Doc 25 §5)
- [ ] 16 arquivos `grimoire/ancestral/odu_*.md` com `metadata.source` e `metadata.lineage` (D4 validado)
- [ ] 11 arquivos `grimoire/vibracional/corpo_*.md` com `metadata.source` e `metadata.lineage` (D2 validado)
- [ ] `docs/15_glossario-oracular.md` v1.2 — `⚠️ PROVISIONAL (D4)` removido
- [ ] `IDEIA.md` atualizado com 50 ervas + proveniência
- [ ] `tests/grimoire/content-completeness.test.ts` verde (50 botânica + 16 Odus + 11 corpos)
- [ ] `npm run test:run` verde

### Task 6 — Validação RAG-fechado
- [ ] `tests/integration/oraculo-rag-fechado.test.ts` cobre os 4 cenários: filtro composto, System Prompt com Markdown exato, `grimoireRefs` populado, fallback
- [ ] `tests/integration/daily-engine-rag.test.ts` cobre mock do cronjob + Dashboard com `ritual.grimoireId` + `llm.call` event
- [ ] `docs/19_estrategia-testes-qualidade.md` §3 atualizado com a lista completa de testes-guardião
- [ ] `npm run test:run` verde, 0 `it.skip`/`describe.skip` nos novos testes

### Task 7 — Quality gates Fase 1
- [ ] `npx prisma validate` + `npx prisma generate` verdes
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run test:run` → ≥ 8900 testes passando, 0 falhas, 0 pré-existentes
- [ ] `npm run build` → OK
- [ ] `npm run lint` → sem novos warnings (baseline 1437 mantido)
- [ ] `npm run quality` (fallow) → 0 issues novas
- [ ] `PROGRESS.md` §2 e §3.1 atualizados

## Fase 2 — POLIMENTO & LANÇAMENTO

### Task 8 — Three.js atmosfera
- [ ] `three`, `@react-three/fiber`, `@react-three/drei` instalados (versões estáveis)
- [ ] `src/components/mandala/MandalaAtmosphere.tsx` renderiza Toroide wireframe + partículas
- [ ] `dpr={[1, 2]}` + `frameloop="demand"` em `prefers-reduced-motion: reduce`
- [ ] Wire-up em `MandalaChart.tsx` como camada `-z-10` (sem raycasting cruzado)
- [ ] Toggle de intensidade no `cockpit-store`
- [ ] `tests/components/mandala/atmosphere.test.tsx` verde
- [ ] `npm run build` + Lighthouse mobile ≥ 90 (Performance)

### Task 9 — i18n pt-BR + en
- [ ] `next-intl` instalado e configurado
- [ ] `src/middleware.ts` detecta locale via `Accept-Language` + cookie `NEXT_LOCALE`
- [ ] `src/i18n/pt-BR.json` + `src/i18n/en.json` com chaves da UI (rotas, botões, validações, e-mails)
- [ ] `src/app/(pt-BR|en)/` com páginas movidas para os dois locales
- [ ] `src/components/layout/LocaleSwitcher.tsx` funcional
- [ ] `tests/i18n/middleware.test.ts` + `tests/i18n/dictionaries.test.ts` verdes
- [ ] `npm run test:run` verde

### Task 10 — PWA
- [ ] `public/manifest.json` com name/short_name/start_url/display/icons 192+512/theme_color/background_color
- [ ] Ícones gerados (192/512 + apple-touch-icon 180)
- [ ] `public/sw.js` com cache-first (assets) + network-first (transits) + stale-while-revalidate (HTML)
- [ ] Service worker registrado em `src/app/layout.tsx`
- [ ] `<link rel="manifest">` + `<meta theme-color>` + apple-touch-icon no `<head>`
- [ ] Chrome DevTools → Application → Installability passa
- [ ] Lighthouse PWA ≥ 90

### Task 11 — Notificações push
- [ ] VAPID par gerado, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + `VAPID_SUBJECT` no `.env.example`
- [ ] `User.pushEnabled` + `User.pushSubscription` no schema + migration
- [ ] `src/lib/push/subscribe.ts` + `src/lib/push/send.ts`
- [ ] `scripts/daily-transits-cron.ts` envia push após `daily_readings` (msg genérica, sem conteúdo)
- [ ] Toggle "Notificações" em `/conta` (opt-in LGPD)
- [ ] `tests/lib/push/send.test.ts` + `tests/api/akasha/push/subscribe.test.ts` verdes
- [ ] Smoke test: subscription → push recebido em DevTools

### Task 12 — Reconciliação LLM × créditos
- [ ] `src/lib/billing/reconcile.ts` com `reconcileCredits({ startDate, endDate })` — query JOIN + cálculo de margem
- [ ] `src/app/api/admin/reconcile/route.ts` (gate `requireRole('ADMIN')`)
- [ ] `src/app/(admin)/admin/reconcile/page.tsx` + `ReconcileTable.tsx`
- [ ] `tests/lib/billing/reconcile.test.ts` cobre invariantes: margem ≥ 0, 1:1 ChatMessage×CreditEntry, falha LLM = sem débito
- [ ] `/api/health` alerta se margem < 0 nas últimas 24h
- [ ] `npm run test:run` verde + manual: 1 consulta real → tabela correta

### Task 13 — Runbook operacional
- [ ] `docs/22_observabilidade-operacao.md §9` com: deploy, backup/restore, troubleshooting (Ollama/Redis/pgvector), rollback
- [ ] `scripts/backup-db.sh` + `scripts/restore-db.sh` testados em dev
- [ ] `deploy/systemd/cabala-backup.{service,timer}` (`OnCalendar=*-*-* 03:00:00 UTC`)
- [ ] Smoke test: backup → drop → restore → contagem confere
- [ ] Alerta Slack `#akasha-ops` em healthcheck failure
- [ ] Runbook linkado em `/admin/health`

### Task 14 — Quality gates finais
- [ ] 50 ervas + 16 Odus + 11 Corpos com `metadata.title_en` e `## EN`
- [ ] `docs/15_glossario-oracular.md` v1.3 (EN completo)
- [ ] `tests/i18n/grimoire-completeness.test.ts` verde
- [ ] `npx prisma validate` + `npx prisma generate` verdes
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run test:run` → ≥ 9200 testes passando
- [ ] `npm run build` → OK, 0 warnings novos
- [ ] `npm run lint` → 0 warnings novos
- [ ] `npm run quality` (fallow) → 0 issues
- [ ] Lighthouse mobile: Performance ≥ 90, PWA ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 90
- [ ] `PROGRESS.md` §2 e §3.1 atualizados com métricas da Fase 2
- [ ] `docs/08_roadmap.md` v3.0 (Onda 3 ✅ + Onda 4 ✅)
- [ ] `docs/25_visao-akasha.md §12` — AD-25.6, AD-25.9, AD-25.12 marcados como ✅
- [ ] Commit final + push + PR (se aplicável) + tag de release `v1.0.0-akasha`

## Critérios de Sucesso Globais

- [ ] **Funcional:** Do cadastro à Mandala + Dashboard Diário com ritual do Grimório em < 2 min
- [ ] **Preciso:** Mapas natais validados; rituais 100% do Grimório (zero alucinação) — comprovado por `tests/integration/oraculo-rag-fechado.test.ts`
- [ ] **Vivo:** Conteúdo do dia muda com o céu (cronjob 00:00 UTC → Redis); nunca repete texto, nunca foge das regras
- [ ] **Soberano:** Embeddings e dados sensíveis nunca saem do VPS (Ollama local)
- [ ] **Internacional:** pt-BR + en (UI + Grimório); switch preservando rota
- [ ] **Retentivo:** Push notification diária abre o app; PWA instalável
- [ ] **Econômico:** Margem de LLM × créditos ≥ 0 em 100% das consultas (painel admin)
- [ ] **Operável:** Runbook testado + alertas Slack + backup automatizado
- [ ] **QUALITY_SCORE ≥ 0.91** mantido
