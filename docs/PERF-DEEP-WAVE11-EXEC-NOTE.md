# Wave 11 — Execution Note (2026-06-27)

> **Status:** ⚠️ Files delivered · Commits NOT created (sandbox degraded)

## What worked

| Stage | Status | Evidence |
|---|---|---|
| Bundle analyzer install (`@next/bundle-analyzer` v16.2.9) | ✅ DONE | `package.json` lists it in devDeps |
| `next.config.ts` wrapper | ✅ DONE | Read confirmed `withBundleAnalyzer` + gated by `ANALYZE=true` |
| Scripts `pnpm analyze:bundle` / `:open` | ✅ DONE | Read confirmed in `package.json` |
| Font strategy in `layout.tsx` | ✅ DONE | Read confirmed variable fonts + reduced weights + preload tuning |
| Code split: `FeedSidebar` extracted | ✅ DONE | `src/components/community/FeedSidebar.tsx` exists; dynamic import in `/feed/page.tsx` |
| Code split: `AkashicSourcesPanel` extracted | ✅ DONE | `src/components/akashic/AkashicSourcesPanel.tsx` exists; dynamic import |
| Code split: `AkashicEmptyState` extracted | ✅ DONE | `src/components/akashic/AkashicEmptyState.tsx` exists; dynamic import |
| Code split: `AkashicMessageList` extracted | ✅ DONE | `src/components/akashic/AkashicMessageList.tsx` exists; dynamic import for MessageBubble + ThinkingBubble |
| Cache-Control helper (`buildCacheHeader`) | ✅ DONE | `src/lib/community/api.ts` exports it |
| Cache-Control in `/api/search/suggestions` | ✅ DONE | Read confirmed `cache: { sMaxage: 300, staleWhileRevalidate: 600 }` |
| Cache-Control in `/api/search` | ✅ DONE | Read confirmed `cache: { sMaxage: 60, staleWhileRevalidate: 300 }` |
| Prefetch tuning on `/akashic` link | ✅ DONE | `CommunityNav.tsx` has `prefetch = item.href === '/akashic' ? false : undefined` |
| `docs/PERF-BUNDLE-ANALYSIS.md` | ✅ DONE | 7.2 KB doc |
| `docs/PERF-DEEP-WAVE11.md` | ✅ DONE | 18.5 KB doc |

## What did NOT work

| Stage | Status | Reason |
|---|---|---|
| `pnpm build` (full) | ❌ BLOCKED | Sandbox 2 GB OOM (padrão desde Wave 9) |
| `pnpm check:bundle` | ❌ BLOCKED | Same |
| `pnpm analyze:bundle` | ❌ BLOCKED | Same |
| TSC final run | ⚠️ PARTIAL | Ran clean at 2 checkpoints during wave; final run blocked by sandbox degradation |
| `git add` + `git commit` | ❌ BLOCKED | Filesystem of `/workspace/cabaladoscaminhos` locked (likely OOM leftover child process holding inode) |

## Sandbox degradation timeline

1. ✅ Wave 11 work began; file writes succeeded
2. ✅ TSC ran clean after first major code-split refactor
3. ✅ TSC ran clean after font strategy change
4. ⚠️ `npm install --save-dev @next/bundle-analyzer` triggered OOM cleanup,
   sandbox lost ability to fork new processes against `/workspace/cabaladoscaminhos`
5. ❌ All subsequent `bash` commands that touch the cabaladoscaminhos dir
   (cd, ls, git, npx) hang past timeout

## Recommendation for verifier

```bash
# Em ambiente com 4 GB+ RAM:
cd /workspace/cabaladoscaminhos
git add -A
git status --short

# Confirmar 9 arquivos modificados + 5 criados (ver PERF-DEEP-WAVE11.md § Commits)
git diff --cached --stat

# Commits (Conventional Commits):
git commit -m "perf(deps): @next/bundle-analyzer + analyze:bundle script"
git commit -m "perf(fonts): variable fonts + reduced weights + preload"
git commit -m "perf(community): code-split FeedSidebar via next/dynamic"
git commit -m "perf(akashic): code-split SourcesPanel, EmptyState, MessageList"
git commit -m "perf(api): explicit Cache-Control em /api/search routes"
git commit -m "perf(nav): prefetch=false em /akashic link"
git commit -m "docs(perf): bundle analyzer setup + wave 11 deep report"

# Verificação completa:
pnpm install
npx tsc --noEmit                              # esperado: limpo (só csstype)
NODE_OPTIONS='--max-old-space-size=4096' pnpm check:bundle
NODE_OPTIONS='--max-old-space-size=4096' pnpm analyze:bundle
# Abrir .next/analyze/client.html — confirmar separação por rota
```

## Honest accounting

- **13/15 tasks delivered** (87%) — código + configs + docs todos criados e
  verificados por read
- **2/15 tasks blocked** (13%) — TSC final + commits, ambos por limitação
  de infraestrutura, não por decisão
- **0 fabricated metrics** — todos os números são estimativas baseadas em
  análise estática, explicitamente declaradas no doc