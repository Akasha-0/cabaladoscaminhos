# Tasks

## Fase 0 — PRÉ-REQUISITO (verificar, não executar)

- [ ] **Task 0: Confirmar `refactor-akasha-v2` concluído**
  - [ ] Verificar `prisma/schema.prisma` contém apenas o núcleo B2C canônico (User, BirthChart, Subscription, CreditEntry, Manifesto, DailyReading, RitualCompletion, Consultation, ChatMessage, GrimoireEntry + enums UserRole, Plan, SubStatus, ChatRole)
  - [ ] Verificar inexistência de `src/app/api/operator/**` e `src/app/cockpit/**`
  - [ ] Verificar inexistência de `src/lib/auth/operator-*` e `src/lib/db/client-actions.ts` (B2B)
  - [ ] `npx prisma validate` + `npx prisma generate` → 0 erros
  - [ ] `npx tsc --noEmit` → 0 erros
  - [ ] `npm run test:run` → ≥ 8783 testes passando, 0 falhas (alvo 0 falhas — corrigir 1 pré-existente de mapa-alma orixá correlation)
  - [ ] `npm run build` → OK (alvo 0 falhas, 0 erros TS)
  - [ ] `docs/04_data-model.md`, `docs/03_architecture-spec.md`, `AUTH-AUDIT.md`, `MIGRATIONS.md` sem menção a "legado/quarentena B2B"

> **Gate de entrada da Fase 1:** todos os 8 itens acima verdes.

---

## Fase 1 — ONDA 3 ATIVA

- [ ] **Task 1: Ativar embeddings GrimoireEntry (DB + migration)**
  - [ ] SubTask 1.1: Verificar `prisma/schema.prisma` tem `GrimoireEntry { ... embedding Unsupported("vector(768)")? ... }` (Doc 04 §1; já existe conforme Fase B)
  - [ ] SubTask 1.2: Criar `prisma/migrations/<ts>_grimoire_embedding_active/migration.sql` com:
    - `CREATE EXTENSION IF NOT EXISTS vector;`
    - `ALTER TABLE "grimoire" ADD COLUMN IF NOT EXISTS "embedding" vector(768);`
    - `CREATE INDEX IF NOT EXISTS grimoire_embedding_idx ON "grimoire" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);`
  - [ ] SubTask 1.3: Validar migration: `npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script` → SQL idempotente
  - [ ] SubTask 1.4: Atualizar `MIGRATIONS.md` §"Status" com referência explícita a esta migration
  - [ ] Verify: `npx prisma validate` + `npx prisma generate` + `npm run build`

- [ ] **Task 2: Pipeline embeddings Ollama em produção (sync + webhook)**
  - [ ] SubTask 2.1: Revisar `src/lib/grimoire/sync.ts` (Fase B) — confirmar: lê `grimoire/**/*.md`, extrai frontmatter YAML, gera embedding via `nomic-embed-text` (`http://localhost:11434/api/embeddings`), fallback gracioso se Ollama offline
  - [ ] SubTask 2.2: Revisar `src/app/api/admin/webhooks/grimoire-sync/route.ts` — confirmar: valida HMAC-SHA256 com `GITHUB_WEBHOOK_SECRET` (env), chama `syncGrimoire()`, retorna `200` em sucesso, `500` para retry
  - [ ] SubTask 2.3: Adicionar teste de integração: `tests/api/admin/webhooks/grimoire-sync.test.ts` (assina payload com HMAC, valida 200/401/500)
  - [ ] SubTask 2.4: Adicionar `npm run grimoire:status` → retorna contagem de entries com/sem embedding (operabilidade)
  - [ ] Verify: `npm run test:run` + smoke test em dev (`OLLAMA_URL` mockado)

- [ ] **Task 3: Busca híbrida (JSONB + pgvector) — Camada 2**
  - [ ] SubTask 3.1: Criar `src/lib/grimoire/search.ts` com função `searchGrimoire({ tags: Record<string, string|string[]>, query: string, limit?: number })`:
    - Filtro determinístico: `WHERE metadata @> $tags::jsonb` (PostgreSQL JSONB containment)
    - Similaridade semântica: `ORDER BY embedding <=> $1::vector LIMIT $2` apenas sobre o resultado filtrado
    - Edge case: se filtro retorna 0, relaxa para `metadata->>'elemento'` apenas e loga `event: grimoire.search.fallback`
  - [ ] SubTask 3.2: Adicionar tipos TypeScript em `src/lib/grimoire/types.ts`:
    ```typescript
    export interface GrimoireSearchQuery {
      tags: { [k: string]: string | string[] };
      query: string;
      limit?: number; // default 10
    }
    export interface GrimoireSearchResult {
      id: string;
      slug: string;
      categoria: string;
      biblioteca: string;
      conteudo: string; // Markdown completo para injeção no System Prompt
      distance: number; // pgvector cosine distance (0 = idêntico)
    }
    ```
  - [ ] SubTask 3.3: Wire-up no `consult` SSE: `src/app/api/akasha/consult/route.ts` chama `searchGrimoire({ tags: tensionPoint.tags, query: userMessage })` e injeta os IDs como `grimoireRefs[]` no `ChatMessage` (Camada 3 anti-alucinação, Doc 25 §5)
  - [ ] SubTask 3.4: Testes em `tests/lib/grimoire/search.test.ts`:
    - filtro JSONB simples (1 tag)
    - filtro múltiplo (elemento + corpo)
    - fallback sem resultados
    - ordenação por distância
    - injeção de IDs no ChatMessage
  - [ ] Verify: `npm run test:run` verde nos novos testes

- [ ] **Task 4: Cronjob de trânsitos diários (deploy + Redis)**
  - [ ] SubTask 4.1: Revisar `scripts/daily-transits-cron.ts` (Fase 4-J) — confirmar: chama `core-astrology` Swiss Ephemeris para 00:00–23:59 UTC, salva JSON no Redis com chave `transitos_diarios:YYYY-MM-DD` e TTL 86400s
  - [ ] SubTask 4.2: Adicionar fallback gracioso: se Redis offline, salva em `process.env.TRANSITS_FALLBACK_PATH` (default `/tmp/transitos_diarios.json`) e loga `event: transits.fallback`
  - [ ] SubTask 4.3: Criar unit `systemd` `deploy/systemd/cabala-transits.service` + `cabala-transits.timer` (`OnCalendar=*-*-* 00:00:00 UTC`, `Persistent=true`)
  - [ ] SubTask 4.4: Adicionar rota de leitura `src/app/api/akasha/transits/today/route.ts` que lê Redis (com fallback) e retorna o JSON — chamada pelo Dashboard Diário
  - [ ] SubTask 4.5: Wire-up no `/api/health`: readiness inclui `redis:has(transitos_diarios:YYYY-MM-DD)` (sinal extra Doc 22 AD-22.8)
  - [ ] SubTask 4.6: Testes:
    - `tests/scripts/daily-transits-cron.test.ts` — mock Redis, valida payload + chave + TTL
    - `tests/api/akasha/transits/today.test.ts` — 200 com payload, 503 se Redis offline sem fallback
  - [ ] Verify: `npm run test:run` + lint + build

- [ ] **Task 5: Conteúdo do Grimório (50 ervas + 16 Odus D4 + 11 Corpos D2)**
  - [ ] SubTask 5.1: Auditar `grimoire/botanica/*.md` (atualmente ~8/50) e listar 42 ervas faltantes com base em referências: `docs/15_glossario-oracular.md` + `IDEIA.md` + bibliografia afro-brasileira
  - [ ] SubTask 5.2: Curar 42 arquivos `.md` de ervas faltantes — cada um com:
    - Frontmatter YAML conforme Doc 25 §5 (categoria, polaridade, elementos_regentes, signos_compativeis, corpos_tantricos_alvo, odus_associados, acao_principal, fonte)
    - Corpo: 200–500 palavras (sabedoria, lenda, modo de preparo)
  - [ ] SubTask 5.3: Validar 16 Odus (D4) — para cada `grimoire/ancestral/odu_*.md`, confirmar `metadata.source` (linhagem) e `metadata.lineage`; remover `⚠️ PROVISIONAL (D4)` em `docs/15_glossario-oracular.md §2`
  - [ ] SubTask 5.4: Validar 11 Corpos Tântricos (D2) — `grimoire/vibracional/corpo_*.md` com `metadata.source` e `metadata.lineage`; remover `provisional` do `oduBirth` se aplicável
  - [ ] SubTask 5.5: Atualizar `IDEIA.md` (ledger) com as 50 ervas, registrando proveniência (Doc 20 AD-20.1)
  - [ ] SubTask 5.6: Atualizar `docs/15_glossario-oracular.md` para v1.2 (D4 ✅ + D2 ✅)
  - [ ] SubTask 5.7: Teste-guardião `tests/grimoire/content-completeness.test.ts`:
    - 50 arquivos em `grimoire/botanica/`
    - 16 arquivos em `grimoire/ancestral/odu_*.md` com `metadata.source` não-vazio
    - 11 arquivos em `grimoire/vibracional/corpo_*.md` com `metadata.source` não-vazio
    - Todos os `.md` parseiam como frontmatter YAML válido
  - [ ] Verify: `npm run test:run` verde

- [ ] **Task 6: Validação RAG-fechado end-to-end (testes-guardião)**
  - [ ] SubTask 6.1: Criar `tests/integration/oraculo-rag-fechado.test.ts`:
    - Cenário 1: "Lua em Escorpião sobrecarregando Mente Negativa" → `searchGrimoire` retorna apenas entries com `metadata.elemento = Agua` E `metadata.corpos_tantricos_alvo CONTAINS 2`
    - Cenário 2: System Prompt da Camada 3 contém EXATAMENTE o `conteudo` (Markdown) das entries retornadas (sem paráfrase, sem alucinação)
    - Cenário 3: Resposta do ORACLE cita o slug de ≥ 1 entry (`grimoireRefs[]` populado e não-vazio)
    - Cenário 4: Edge case (filtro retorna 0) → fallback + log de `grimoire.search.fallback`
  - [ ] SubTask 6.2: Criar `tests/integration/daily-engine-rag.test.ts`:
    - Mock do cronjob (insere `transitos_diarios:YYYY-MM-DD` no Redis)
    - Dashboard retorna 200 com `ritual.grimoireId` populado e slug válido
    - Custo de tokens registrado (`llm.call` event com `tokens`)
  - [ ] SubTask 6.3: Atualizar `docs/19_estrategia-testes-qualidade.md` §3 com a lista de testes-guardião (6 determinismo + 540 provenance + 11 RAG + 10 RAG-fechado)
  - [ ] Verify: `npm run test:run` verde; nenhum dos novos testes tem `it.skip`/`describe.skip`

- [ ] **Task 7: Quality gates Fase 1**
  - [ ] `npx prisma validate` + `npx prisma generate`
  - [ ] `npx tsc --noEmit` → 0 erros
  - [ ] `npm run test:run` → ≥ 8900 testes passando (alvo +117 da Fase 1), 0 falhas, 0 pré-existentes
  - [ ] `npm run build` → OK, sem warnings novos
  - [ ] `npm run lint` → sem novos warnings (baseline 1437 mantido)
  - [ ] `npm run quality` (fallow) → 0 issues novas
  - [ ] Atualizar `PROGRESS.md` §2 e §3.1 com métricas da Fase 1
  - [ ] Commit + push para branch + abrir PR (se Fase grande)

> **Gate de saída da Fase 1:** Onda 3 está "viva" (busca RAG-fechado funcional, cronjob deployável, conteúdo completo, embeddings ativos).

---

## Fase 2 — POLIMENTO & LANÇAMENTO

- [ ] **Task 8: Three.js atmosfera da Mandala (R3F)**
  - [ ] SubTask 8.1: Instalar `three` + `@react-three/fiber` + `@react-three/drei` (versões estáveis; verificar license MIT)
  - [ ] SubTask 8.2: Criar `src/components/mandala/MandalaAtmosphere.tsx`:
    - Toroide etéreo em `wireframe` com partículas (50–100 instâncias)
    - Rotação lenta no eixo Y (0.1 rad/s)
    - `dpr={[1, 2]}` para retina
    - `frameloop="demand"` em `prefers-reduced-motion: reduce` (acessibilidade)
  - [ ] SubTask 8.3: Wire-up em `src/components/mandala/MandalaChart.tsx` — atmosfera como `<div className="absolute inset-0 -z-10">` sob o SVG (sem raycasting cruzado, Doc 25 §8)
  - [ ] SubTask 8.4: Adicionar toggle de intensidade (low/medium/high) no `cockpit-store` Zustand
  - [ ] SubTask 8.5: Teste de performance `tests/components/mandala/atmosphere.test.tsx`:
    - Renderiza com `prefers-reduced-motion: reduce` → `frameloop="demand"`
    - Não renderiza 60fps em ambiente headless (apenas smoke test de render)
  - [ ] Verify: `npm run test:run` + `npm run build` + Lighthouse mobile ≥ 90

- [ ] **Task 9: i18n pt-BR + en (next-intl)**
  - [ ] SubTask 9.1: Instalar `next-intl` (versão estável; verificar compat com Next.js 16)
  - [ ] SubTask 9.2: Configurar `src/middleware.ts` para detectar locale via `Accept-Language` + cookie `NEXT_LOCALE`
  - [ ] SubTask 9.3: Criar `src/i18n/pt-BR.json` e `src/i18n/en.json` com todas as chaves da UI (rotas, botões, mensagens, validações Zod, e-mails transacionais)
  - [ ] SubTask 9.4: Adicionar `[locale]` segment em `src/app/(pt-BR|en)/` — mover páginas existentes (onboarding, dashboard, conta, manifesto) para os dois locales
  - [ ] SubTask 9.5: Adicionar toggle de idioma em `src/components/layout/LocaleSwitcher.tsx` (cookie httpOnly + recarrega preservando rota)
  - [ ] SubTask 9.6: Testes:
    - `tests/i18n/middleware.test.ts` — detecção de locale via header/cookie
    - `tests/i18n/dictionaries.test.ts` — todas as chaves existem em ambos os locales
  - [ ] Verify: `npm run test:run` + manual: aceitar `Accept-Language: en` → UI em inglês; cookie pt-BR → UI em pt-BR

- [ ] **Task 10: PWA (manifest + service worker)**
  - [ ] SubTask 10.1: Criar `public/manifest.json`:
    ```json
    {
      "name": "Sistema Akasha",
      "short_name": "Akasha",
      "start_url": "/",
      "display": "standalone",
      "theme_color": "#0a0a1f",
      "background_color": "#0a0a1f",
      "icons": [
        { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
      ]
    }
    ```
  - [ ] SubTask 10.2: Gerar ícones 192/512 (Doc 26 — Identidade Akasha) e `apple-touch-icon-180.png`
  - [ ] SubTask 10.3: Criar `public/sw.js` (service worker) com estratégia:
    - Cache-first para assets estáticos (`/icons/*`, `/fonts/*`)
    - Network-first com fallback para `transitos_diarios:YYYY-MM-DD` (Redis-via-API)
    - Stale-while-revalidate para HTML
  - [ ] SubTask 10.4: Registrar service worker em `src/app/layout.tsx` (client component)
  - [ ] SubTask 10.5: Adicionar `head` link para manifest + meta theme-color + apple-touch-icon
  - [ ] SubTask 10.6: Teste manual: Chrome DevTools → Application → Installability (deve passar) + Lighthouse PWA ≥ 90
  - [ ] Verify: `npm run build` + lighthouse mobile

- [ ] **Task 11: Notificações push (Web Push API + VAPID)**
  - [ ] SubTask 11.1: Gerar par VAPID (`web-push generate-vapid-keys`) e adicionar ao `.env.example`: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
  - [ ] SubTask 11.2: Adicionar `User.pushEnabled Boolean @default(false)` + `User.pushSubscription Json?` no schema + migration
  - [ ] SubTask 11.3: Criar `src/lib/push/subscribe.ts` (subscribe endpoint no client) e `src/lib/push/send.ts` (server-side)
  - [ ] SubTask 11.4: Wire-up do `sendPush` no `scripts/daily-transits-cron.ts`: após gerar `daily_readings`, envia push para users com `pushEnabled = true` (mensagem genérica: "Seu ritual de hoje está pronto" — sem conteúdo, Doc 22 AD-22.2)
  - [ ] SubTask 11.5: Adicionar toggle `Notificações` em `/conta` (opt-in explícito — LGPD)
  - [ ] SubTask 11.6: Testes:
    - `tests/lib/push/send.test.ts` — mock `web-push`, valida payload
    - `tests/api/akasha/push/subscribe.test.ts` — POST/DELETE subscription
  - [ ] Verify: `npm run test:run` + smoke test (subscription → push recebido em DevTools)

- [ ] **Task 12: Reconciliação LLM × créditos (painel admin)**
  - [ ] SubTask 12.1: Criar `src/lib/billing/reconcile.ts` com função `reconcileCredits({ startDate, endDate })`:
    - Query: `JOIN ChatMessage × CreditEntry ON consultationId`
    - Calcula: tokens × modelPrice, créditos debitados × unitPrice, margem
    - Retorna: `{ day, tokens, credits, costUSD, marginUSD, marginRatio }[]`
  - [ ] SubTask 12.2: Criar rota `src/app/api/admin/reconcile/route.ts` (gate: `requireRole('ADMIN')`)
  - [ ] SubTask 12.3: Criar `src/app/(admin)/admin/reconcile/page.tsx` (Server Component) + `ReconcileTable.tsx` (Client) — tabela responsiva com totais
  - [ ] SubTask 12.4: Adicionar teste de invariante em `tests/lib/billing/reconcile.test.ts`:
    - Margem ≥ 0 (Akasha não vende a prejuízo)
    - Para cada `consultationId`: 1 `ChatMessage` ORACLE + 1 `CreditEntry` `delta < 0`
    - Falha de LLM não debita crédito (mock: `tokensUsed=0` → `creditCost=0`)
  - [ ] SubTask 12.5: Adicionar alerta no `/api/health` se margem < 0 nas últimas 24h
  - [ ] Verify: `npm run test:run` + manual: 1 consulta real → tabela correta

- [ ] **Task 13: Runbook operacional VPS (Doc 22 §9)**
  - [ ] SubTask 13.1: Atualizar `docs/22_observabilidade-operacao.md §9` com:
    - Deploy (git pull, `pnpm install`, `prisma migrate deploy`, `pm2 reload b2c-portal`)
    - Backup/restore (pg_dump + pgvector dump separado, restore testado mensalmente)
    - Troubleshooting:
      - Ollama offline → fallback OpenAI + degradação RAG
      - Redis offline → fallback `TRANSITS_FALLBACK_PATH` + alerta
      - pgvector migration failed → restore backup + abrir issue
    - Rollback (reverter migration, reverter deploy, manter backup de DB por 7 dias)
  - [ ] SubTask 13.2: Adicionar `scripts/backup-db.sh` e `scripts/restore-db.sh` (testados em dev)
  - [ ] SubTask 13.3: Adicionar `deploy/systemd/cabala-backup.service` + `cabala-backup.timer` (`OnCalendar=*-*-* 03:00:00 UTC`)
  - [ ] SubTask 13.4: Teste de smoke em dev: backup → drop table → restore → verificar contagem
  - [ ] SubTask 13.5: Adicionar alerta Slack `#akasha-ops` em healthcheck failure (Doc 22 AD-22.8)
  - [ ] Verify: smoke test passa; runbook linkado em `/admin/health`

- [ ] **Task 14: Quality gates finais + i18n EN completa do Grimório**
  - [ ] SubTask 14.1: Traduzir as 50 ervas (`grimoire/botanica/*.md`) — campo `metadata.title_en` + corpo `## EN` (Doc 25 §9 Fase 2)
  - [ ] SubTask 14.2: Traduzir os 16 Odus (`grimoire/ancestral/odu_*.md`)
  - [ ] SubTask 14.3: Traduzir os 11 Corpos (`grimoire/vibracional/corpo_*.md`)
  - [ ] SubTask 14.4: Atualizar `docs/15_glossario-oracular.md` para v1.3 (EN completo)
  - [ ] SubTask 14.5: Teste-guardião `tests/i18n/grimoire-completeness.test.ts`:
    - Para cada `.md` em `grimoire/`, `metadata.title_en` existe e tem ≥ 3 palavras
  - [ ] SubTask 14.6: Quality gates finais:
    - `npx prisma validate` + `npx prisma generate`
    - `npx tsc --noEmit` → 0 erros
    - `npm run test:run` → ≥ 9200 testes passando (alvo +400 da Fase 2)
    - `npm run build` → OK, 0 warnings novos
    - `npm run lint` → 0 warnings novos
    - `npm run quality` (fallow) → 0 issues
    - Lighthouse mobile: Performance ≥ 90, PWA ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 90
  - [ ] SubTask 14.7: Atualizar `PROGRESS.md` §2 e §3.1 com métricas da Fase 2
  - [ ] SubTask 14.8: Atualizar `docs/08_roadmap.md` para v3.0 (Onda 3 e Onda 4 ✅)
  - [ ] SubTask 14.9: Atualizar `docs/25_visao-akasha.md §12` — AD-25.6, AD-25.9, AD-25.12 marcados como ✅
  - [ ] SubTask 14.10: Commit final + push + abrir PR (se Fase grande) + tag de release `v1.0.0-akasha`

> **Gate de saída da Fase 2:** Akasha v1.0.0 launchable.

---

# Task Dependencies

- Task 0 (gate) → todas as outras
- Task 1 → Task 2, Task 3
- Task 2 → Task 3
- Task 3 → Task 6
- Task 4 → Task 6
- Task 5 → Task 6
- Task 6 → Task 7
- Task 7 → Task 8, Task 9, Task 10, Task 11, Task 12, Task 13
- Task 8, Task 9, Task 10 → Task 11 (push requer PWA)
- Task 8, Task 9, Task 10, Task 11, Task 12, Task 13 → Task 14
- Task 9 (i18n EN UI) → Task 14 (i18n EN Grimório completo)

> Tasks 8, 9, 10, 12, 13 podem rodar em paralelo entre si após Task 7.
