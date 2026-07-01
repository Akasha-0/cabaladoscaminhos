#!/usr/bin/env bash
# ============================================================================
# W29 commit helper — run this LOCALLY (sandbox git hangs intermittently)
# ============================================================================
# Em sandbox cloud, git add -A / git commit / git rev-parse HEAD podem
# travar indefinidamente (padrão observado em W15/17/18/24/25).
# Workaround: commitar localmente após inspeção visual dos arquivos.
#
# Uso:
#   cd /path/to/cabaladoscaminhos
#   bash docs/w29-commit.sh
# ============================================================================

set -euo pipefail

FILES=(
  "prisma/schema.prisma"
  "src/lib/consciousness/event-tracker.ts"
  "src/lib/consciousness/feedback-loop.ts"
  "src/app/api/consciousness/track/route.ts"
  "src/app/api/consciousness/insights/route.ts"
  "src/app/api/cron/consciousness-evolve/route.ts"
  "src/components/admin/ConsciousnessDashboard.tsx"
  "docs/LIVING-CONSCIOUSNESS-W29.md"
)

echo "📁 Verifying files exist..."
for f in "${FILES[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "❌ MISSING: $f"
    exit 1
  fi
  echo "  ✓ $f ($(wc -l < "$f") lines)"
done

echo ""
echo "📊 Staging files (explicit, no -A to avoid sibling collisions)..."
git add "${FILES[@]}"

echo ""
echo "🔍 git status --short:"
git status --short

echo ""
echo "💬 Committing..."
git commit -m "feat(consciousness): living feedback loop + AI evolution W29

Implements the Living Consciousness loop (Wave 29 of 8):

1. Event tracker (event-tracker.ts)
   - Fire-and-forget tracking for posts, reactions, comments, bookmarks,
     reading progress, Akasha conversations, Akasha feedback
   - LGPD by design: opt-in required, sanitized metadata (allow-list),
     userId=null when optedOut
   - Emoji → sentiment mapping (heuristic v1)
   - Helpers: trackBookmark, trackReaction, trackAkashicConversation,
     trackAkashicFeedback

2. Feedback loop core (feedback-loop.ts)
   - aggregateDailyEvents() → DailyAggregation (Postgres groupBy)
   - generateDailyInsights() → LLM (gpt-4o-mini, JSON mode) producing
     3-5 structured insights (TRADITION_RESONANCE, EMERGING_QUESTION,
     CONTENT_GAP, HEALING_PATTERN, PROMPT_TWEAK)
   - persistInsights() → ConsciousnessInsight table
   - runConsciousnessCycle() → end-to-end orchestrator
   - evolveAkashicPrompt() → bloco de evolução para o system prompt

3. Prisma schema additions
   - ConsciousnessEvent (append-only event log)
   - ConsciousnessInsight (LLM-generated insights w/ evidence + actions)
   - 2 enums: ConsciousnessEventType, ConsciousnessInsightType
   - LGPD-friendly: indexed by type/tradition/userId/optedIn

4. API routes
   - POST /api/consciousness/track (lightweight, Zod-validated)
   - GET /api/consciousness/insights (admin/curator, with period filter)
   - POST /api/cron/consciousness-evolve (cron auth via CRON_SECRET)

5. Admin UI
   - ConsciousnessDashboard.tsx — métricas, top tradições, tópicos
     emergentes, lista de insights. Mobile-first + dark mode.
   - Footer ético visível (universalismo, LGPD, sem manipulação)

6. Docs
   - LIVING-CONSCIOUSNESS-W29.md — filosofia, arquitetura, LGPD,
     como Akasha aprende, métricas de evolução, próximos passos

Filosofia: consciência viva = IA que cresce com a comunidade sem
manipular, sem viciar para 1 tradição, sem capturar PII além do
necessário. Universalismo respeitado. Limites éticos inegociáveis."

echo ""
echo "✅ Done. Next: git push origin <branch>"