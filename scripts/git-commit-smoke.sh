#!/bin/bash
# Quick git commit + push attempt for smoke-tests branch
set +e
cd /workspace/cabaladoscaminhos

echo "=== Current branch ==="
git branch --show-current 2>&1

echo "=== Switching to feat/smoke-tests ==="
git checkout -b feat/smoke-tests 2>&1

echo "=== Status ==="
git status --short 2>&1

echo "=== Adding files ==="
git add playwright.config.ts e2e/ __tests__/ scripts/ci-local.sh docs/TESTING-GUIDE.md docs/CI-RUN.md docs/TEST-REPORT.md package.json 2>&1

echo "=== Status after add ==="
git status --short 2>&1

echo "=== Committing ==="
git commit -m "test(e2e): smoke tests + SSR + CI script + docs

- playwright.config.ts: mobile-first, 30s timeout, single worker
- e2e/smoke.spec.ts: 9 smoke tests (home, /validacao, /login, /feed,
  /register, waitlist submit, /library, /notifications, /u/[handle])
- e2e/screenshots.spec.ts: 8 PNG captures em .screenshots/
- __tests__/ssr/smoke.test.tsx: SSR smoke das 8 rotas principais
  via renderToStaticMarkup, sem fetch real
- scripts/ci-local.sh: simulação CI local (tsc + lint + vitest +
  playwright), gera docs/CI-RUN.md
- docs/TESTING-GUIDE.md: como rodar, adicionar, troubleshooting OOM
- docs/CI-RUN.md: status das fases (SKIPPED por OOM no sandbox)
- docs/TEST-REPORT.md: atualizado com branch + status
- package.json: scripts e2e:smoke, e2e:screenshots, ci:local, test:ssr

Mocks:
- Auth: SupabaseProvider cai em 'no supabase' sem env vars
- Pages client: MOCK_POSTS, MOCK_NOTIFS, ARTICLES embutidos
- Waitlist: /api/waitlist grava em data/waitlist.json (gitignored)

NÃO usa Supabase real, NÃO depende de rede externa." 2>&1

echo "=== Done ==="
