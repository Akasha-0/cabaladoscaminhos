#!/bin/bash
# ============================================================================
# commit-wave20.sh — Wave 20 — GTM Readiness 6/6
# ============================================================================
# Helper para commitar Wave 20 quando o sandbox do Mavis não conseguir
# (mesmo padrão de Wave 15/17/18 — git add/commit travam em timeout).
#
# Uso local:
#   cd /workspace/cabaladoscaminhos
#   bash scripts/commit-wave20.sh
# ============================================================================

set -e

cd "$(dirname "$0")/.."

echo "→ Adding Wave 20 files..."

git add \
  src/lib/landing/variant.ts \
  src/lib/analytics/funnel.ts \
  src/components/conversion/ \
  src/components/auth/OptimizedSignupForm.tsx \
  src/app/validacao/ \
  src/app/welcome/ \
  src/app/api/admin/funnel-metrics/ \
  'src/app/(auth)/signup/page.tsx' \
  src/app/page.tsx \
  src/lib/feature-flags/flags.ts \
  src/hooks/useAuth.ts \
  docs/CONVERSION-FUNNEL-W20.md \
  scripts/commit-wave20.sh

echo "→ Files staged:"
git diff --cached --name-only | head -25

echo "→ Committing..."
git commit -m "feat(conversion): 4 landing variants + optimized signup + funnel tracking" \
  -m "Wave 20 — GTM Readiness 6/6.

- A/B/C/D landing variants with hash(userId) sticky attribution
- Optimized signup: 1-step, magic link primary, Google OAuth prominent
- First-value experience at /welcome with 3 posts + 3 traditions
- Funnel analytics: 7 canonical events + admin endpoint /api/admin/funnel-metrics
- 7+ email capture forms: WaitlistForm (4 variants), ExitIntentModal, MobileCaptureBar, InlineEmailCapture
- Social sharing: Twitter/LinkedIn/WhatsApp/Copy + OG tags per variant + ?ref=userId tracking
- Docs: docs/CONVERSION-FUNNEL-W20.md (22KB operational)

Refs: docs/CONVERSION-FUNNEL-W20.md"

echo "→ Done. Last commit:"
git log --oneline -1
