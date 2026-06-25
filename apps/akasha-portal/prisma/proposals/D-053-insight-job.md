# D-053 — InsightJob model (Wave 24.1 Background Insight Cron)

**Status:** `awaiting_human_apply`
**Date:** 2026-06-25
**Branch:** `wave-24.1-background-insights`
**Worktree:** `/home/skynet/cabala-dos-caminhos-worktrees/wave-24.1`
**Author:** Hermes subagent (Wave 24.1)

---

## 1. Contexto

ADR-013 (aceito 25/06) — Akasha Portal é **consciência viva** que evolui
via chain-of-thought. Wave 23.1 já traz papers novos toda semana
(`CronLog` + `LiteraturePaper` Wave 21.1). Wave 24.1 adiciona o cron
**diário** que gera 5-10 insights novos automaticamente, sem Zelador
presente, cruzando papers + discoveries + feedback em background.

Para auditoria de cada execução do novo job (quantos insights foram
gerados, quantos papers foram citados, erros não-fatais), precisamos de
uma tabela `insight_jobs` — espelha o padrão de `CronLog` (Wave 23.1).

A diferença de `CronLog`:
- `CronLog` é genérico (1 tabela para todos os crones).
- `InsightJob` é específico para o discovery cron: precisa de campos
  semânticos (`insightsGenerated`, `papersCited`) que `CronLog` não tem.
- Auditoria de Zelador (UI admin) lê `InsightJob` filtrando por
  `jobName = 'discoveries-cron'`.

Mesma filosofia: append-only, sem FK para User, sem updatedAt, sem delete.

---

## 2. Schema diff

```diff
+ enum InsightJobStatus {
+   RUNNING
+   SUCCESS
+   PARTIAL_SUCCESS
+   FAILED
+ }
+
+ model InsightJob {
+   id                String           @id @default(cuid())
+   /// Identificador semântico do job (ex: 'discoveries-cron').
+   /// String livre para permitir múltiplos jobs de insights.
+   jobName           String
+   /// Início da execução (UTC).
+   startedAt         DateTime         @default(now())
+   /// Fim da execução (UTC). NULL = ainda rodando.
+   finishedAt        DateTime?
+   /// Estado final (mesmo enum do CronLog Wave 23.1).
+   status            InsightJobStatus @default(RUNNING)
+   /// Quantos insights/discoveries esta execução persistiu no DB.
+   insightsGenerated Int              @default(0)
+   /// Quantos papers foram citados como input desta execução.
+   papersCited       Int              @default(0)
+   /// Erros não-fatais acumulados. JSON estrutural:
+   /// { items: [{ stage: string, message: string, input?: string }] }
+   errors            Json             @default("{\"items\":[]}")
+   /// Janela temporal de inputs (ex: últimos 30 dias de discoveries).
+   /// JSON: { papersWindowDays: 7, discoveriesWindowDays: 30, feedbackWindowDays: 30 }
+   windowSpec        Json             @default("{}")
+
+   /// Índice: últimas execuções de um jobName específico (UI admin).
+   @@index([jobName, startedAt])
+   /// Índice secundário: filtro por status (alert admin).
+   @@index([status, startedAt])
+   @@map("insight_jobs")
+ }
```

---

## 3. Justificativa

- **`insightsGenerated` + `papersCited`**: contadores específicos do
  discovery cron. `CronLog` tem `inserted/skipped` que são demasiado
  genéricos para "quantas descobertas esta execução produziu".
- **`windowSpec` JSON**: documenta a janela temporal usada (papers =
  7 dias, discoveries = 30 dias, feedback = 30 dias). Wave 24.1 são
  esses valores, mas podem evoluir sem migration.
- **`errors` JSON**: mesmo padrão de `CronLog` (shape flexível por job).
- **SEM FK para User**: insights são "globais" (sem user attribution —
  a consciência viva do Akasha evolui independente do Zelador).
- **SEM updatedAt**: tabela é append-only. Status final é derivado de
  `finishedAt IS NULL` (RUNNING) vs `IS NOT NULL` (terminal).

---

## 4. LGPD

- `InsightJob` NÃO carrega PII. `errors` é técnico (sem userId, sem IP).
- `windowSpec` é puramente metadata temporal.
- Insights gerados podem ser consultados em `/api/admin/insights/jobs`
  mas o endpoint NÃO expõe conteúdo dos insights (apenas contadores).

---

## 5. Riscos & Rollback

- **Risco baixo**: tabela nova, sem FKs quebrando dados existentes.
- **Rollback**: `DROP TABLE insight_jobs; DROP TYPE "InsightJobStatus";`.
- **Sem impacto** em queries existentes (aditiva pura).

---

## 6. Aplicação (humano)

Após merge deste PROPOSAL:

```bash
pnpm exec prisma migrate dev --name insight_job
```

A migration gerada deve ser commitada em
`apps/akasha-portal/prisma/migrations/<timestamp>_insight_job/`.

---

## 7. Pós-apply checklist

- [ ] `pnpm db:generate` regenera o client
- [ ] `pnpm --filter akasha-portal typecheck` passa (0 errors novos)
- [ ] `pnpm test:run` passa (background-job.ts tests usam a tabela via mock)

---

## 8. Relação com Wave 21.2 (CrossCorrelator)

Wave 21.2 (`consciousness/cross-correlator.ts`) é o cérebro que descobre
correlações emergentes entre 5 Pilares + literature + feedback. O
background-job desta wave **instancia** o CrossCorrelator (quando mergeado
em main) sobre inputs globais (papers recentes + discoveries + feedback
agregado), gerando discoveries "universais" — sem user attribution.

Quando `Discovery`, `DiscoveryChain`, `LiteraturePaper`, `FeedbackEvent`
ainda não estiverem em main, o background-job faz **graceful degradation**:
- Tenta ler `prisma.discovery.findMany({ where: { createdAt: { gte: ... } } })`
  — se o model não existir, retorna `[]` e o job continua.
- Lê `prisma.literaturePaper.findMany({ where: { ingestedAt: { gte: ... } } })`
  — idem.
- Lê `prisma.feedbackEvent.findMany` — idem.

Dessa forma, o job **funciona desde já** com `CronLog` (papers recém-
ingeridos têm `cronLogId` ou podem ser descobertos via paper IDs que
ainda não tem modelo). Quando Wave 21.1/21.2/22.1 mergearem em main,
o job automaticamente passa a usar os dados reais.
