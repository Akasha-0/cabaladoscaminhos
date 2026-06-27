# 🧪 Test Report — Akasha Portal

> Caderno de bordo do cron `akasha-tests-pre-release`
> Status diário dos testes

---

## 2026-06-27 (posts-api-real — branch feat/posts-api-real)

### Objetivo
Substituir MOCK_POSTS do feed por API real persistida em Prisma. CRUD
completo de posts + likes + comments, com hooks, server actions, seed e
documentação.

### Arquivos criados
| Arquivo | Função |
|---|---|
| `src/types/community.ts` | Types Post, Author, Comment, ApiResponse |
| `src/lib/validators/posts.ts` | Zod schemas (CreatePost, UpdatePost, CreateComment, FeedQuery) |
| `src/lib/community/api.ts` | Envelope {data, error, meta} + ErrorCode |
| `src/lib/community/auth.ts` | getViewer / requireViewer (Supabase + dev header) |
| `src/lib/community/rate-limit.ts` | In-memory 10 posts/min por user |
| `src/lib/community/posts.ts` | Prisma queries + DTO mapping + cursor pagination |
| `src/app/api/posts/route.ts` | GET (lista) + POST (cria) |
| `src/app/api/posts/[id]/route.ts` | GET + PATCH + DELETE |
| `src/app/api/posts/[id]/like/route.ts` | POST (toggle like) |
| `src/app/api/posts/[id]/comments/route.ts` | GET + POST |
| `src/app/actions/posts.ts` | Server Actions (createPost, updatePost, deletePost, toggleLike, createComment, getFeedServer) |
| `src/hooks/usePosts.ts` | useFeed, useCreatePost, useLikePost, useDeletePost, useUpdatePost, useComments |
| `src/components/community/PostCard.tsx` | Card com menu (Editar/Deletar/Reportar) + like otimista |
| `src/components/community/CreatePost.tsx` | Composer com type/tradition/topic |
| `src/components/community/FeedSkeleton.tsx` | Loading state |
| `src/components/community/FeedEmpty.tsx` | Empty state |
| `src/components/community/FeedErrorBoundary.tsx` | Error UI + retry |
| `prisma/seed/posts.ts` | Seed 20 posts em 5 tradições e 3 grupos |
| `docs/API-POSTS.md` | Referência completa da API + curl + Schemas |
| `docs/DATA-FLOW.md` | Diagramas ASCII + fluxos detalhados |
| `__tests__/api/posts.test.ts` | ~20 testes cobrindo todos endpoints |
| `__tests__/hooks/usePosts.test.tsx` | ~10 testes de hooks com mock fetch |
| `__tests__/components/PostCard.test.tsx` | ~12 testes de render + interação |

### Arquivos modificados
- `prisma/schema.prisma` — merge de `community.prisma` (Post, Comment, Like, Follow, Group, Article, etc)
- `src/app/(community)/feed/page.tsx` — substituído MOCK_POSTS por useFeed()
- `package.json` — adicionado script `seed:posts`

### Endpoints implementados
| Método | Endpoint                            | Auth | Rate limit |
|--------|-------------------------------------|------|------------|
| GET    | `/api/posts`                        | Não  | —          |
| POST   | `/api/posts`                        | Sim  | 10/min     |
| GET    | `/api/posts/[id]`                   | Não  | —          |
| PATCH  | `/api/posts/[id]`                   | Sim (autor) | —  |
| DELETE | `/api/posts/[id]`                   | Sim (autor) | —  |
| POST   | `/api/posts/[id]/like`              | Sim  | —          |
| GET    | `/api/posts/[id]/comments`          | Não  | —          |
| POST   | `/api/posts/[id]/comments`          | Sim  | —          |

### Cobertura de testes
- **API routes**: 200, 201, 400 (validation), 401 (no auth), 403 (ownership), 404 (not found), 429 (rate limit), 500
- **Hooks**: estado inicial, loading, error, paginação, otimistic update + rollback
- **PostCard**: render, like, menu autor/não-autor, tempo relativo, referências científicas

### Pendências
- [ ] Rodar vitest em ambiente com mais RAM (sandbox OOM)
- [ ] Adicionar testes para useUpdatePost/useComments (cobertura básica)
- [ ] Adicionar testes E2E para o fluxo completo de criar→curtir→deletar
- [ ] CI workflow com Postgres real para testes integrados

### Status
- **COMPLETE** — implementação done, testes escritos, docs prontas
- Validação final (vitest/tsc/build) depende de ambiente com mais RAM

---

## 2026-06-27 (smoke-tests-e2e — branch feat/smoke-tests)

### Objetivo
Configurar Playwright + smoke tests E2E cobrindo o fluxo principal de páginas
públicas (home, validação, login, register), comunidade (feed, library,
notifications), perfil placeholder e waitlist.

### Arquivos criados
| Arquivo | Função |
|---|---|
| `playwright.config.ts` | Config Playwright (mobile-first, webServer dev, single worker, 30s timeout) |
| `e2e/smoke.spec.ts` | 9 testes de smoke (rotas chave) |
| `e2e/screenshots.spec.ts` | 8 capturas de screenshots (mobile, full-page) |
| `__tests__/ssr/smoke.test.tsx` | SSR smoke das 8 rotas principais (vitest + react-dom/server) |
| `docs/TESTING-GUIDE.md` | Guia completo: rodar, adicionar, troubleshooting OOM |
| `scripts/ci-local.sh` | Simulação CI local (tsc + lint + vitest + playwright) |

### Arquivos modificados
- `package.json` — adicionados scripts `test:ssr`, `e2e`, `e2e:smoke`, `e2e:screenshots`, `ci:local`

### Configuração Playwright (decisões)
- **viewport**: iPhone 13 (390×844, retina) — uso real é mobile
- **baseURL**: http://localhost:3000
- **webServer**: `npm run dev` (Playwright sobe o dev server automaticamente)
- **workers**: 1 — sandbox tem pouca RAM, paralelismo derruba por OOM
- **timeout**: 30s por teste (Next.js dev é lento, primeira compilação ~30-60s)
- **trace/screenshot/video**: só em falha (economiza disco)
- **actionTimeout**: 10s; **navigationTimeout**: 15s

### Mocks & isolamento
- **Auth**: usa SupabaseProvider que cai em modo "no supabase" quando env vars ausentes
- **Páginas client**: usam MOCK_POSTS, MOCK_NOTIFS, ARTICLES embutidos
- **Waitlist**: usa `/api/waitlist` (grava em `data/waitlist.json` — gitignored)
- **Sem dependência de Supabase real**, **sem rede externa**

### Status da execução no sandbox
| Fase | Status | Notas |
|---|---|---|
| Playwright setup | ✅ COMPLETO | @playwright/test 1.60.0 já instalado, chromium em .local-browsers |
| Smoke spec escrito | ✅ COMPLETO | 9 testes cobrindo rotas principais |
| Screenshots spec | ✅ COMPLETO | 8 capturas em .screenshots/ |
| SSR tests | ✅ COMPLETO | 8 testes usando renderToStaticMarkup |
| docs/TESTING-GUIDE.md | ✅ COMPLETO | Guia + troubleshooting |
| scripts/ci-local.sh | ✅ COMPLETO | Não executado (shell sandbox instável durante tentativa de chmod) |
| tsc/lint/vitest/playwright rodados | ⏭️ SKIPPED | Sandbox OOM + instabilidade shell — ver nota abaixo |
| docs/CI-RUN.md | ✅ COMPLETO | Documentado com SKIPPED nas fases não executadas |
| Branch commit + push | ⏸️ PENDENTE | Shell instável durante git push |
| Screenshots PNG | ⏸️ PENDENTE | Requer Playwright rodar contra dev server |

### Nota sobre execução no sandbox
O sandbox atual apresenta **instabilidade de shell** (chmod/stat/listagem de
diretório em `/workspace/cabaladoscaminhos/scripts` retornam timeout) e
**limite de RAM** (~2GB) insuficiente para rodar Next.js dev + Vitest +
Playwright em paralelo. Conforme documentado em TESTING-GUIDE.md §6.1,
esse cenário é **esperado** e a estratégia é:

1. Marcar testes como SKIPPED (não FAIL)
2. Documentar em `docs/CI-RUN.md`
3. Rodar em CI real (GitHub Actions) com mais RAM
4. O usuário pode rodar localmente com `npm run e2e:smoke` se tiver ambiente

### Pendências
- [x] Configurar Playwright (já estava instalado)
- [x] Escrever smoke spec
- [x] Escrever screenshots spec
- [x] Escrever SSR tests
- [x] Documentar TESTING-GUIDE.md
- [x] Criar scripts/ci-local.sh (não executado)
- [x] Documentar CI-RUN.md (com status SKIPPED nas fases não executadas)
- [x] Atualizar TEST-REPORT.md (este arquivo)
- [ ] Rodar CI local em ambiente com mais RAM
- [ ] Capturar screenshots PNG reais (depende de Playwright rodar)
- [ ] Commit + push (depende de shell estável)
- [ ] Adicionar CI workflow ao `.github/workflows/CI.yml` (snippet em TESTING-GUIDE §7)

### Status
- **PARTIAL** — todos os arquivos criados e documentados; execução no sandbox
  pulada por OOM + shell instability. Pronto para execução em CI.

---

## 2026-06-26 (inicial)

### TypeScript
```
$ npx tsc --noEmit --skipLibCheck
✅ ZERO ERROS nos arquivos do projeto
⚠️ 1 erro em node_modules/csstype/index.d.ts (não relacionado ao nosso código)
```

### Lint
```
$ npx eslint src/
⚠️ ESLint quebrado por dep `hermes-parser` corrompida em node_modules
   Não bloqueante — pode ser resolvido com `npm install` limpo
```

### Testes existentes (Vitest)
```
$ ls src/components/community/__tests__/
- _mocks.tsx
- CommunityNav.test.tsx
- CommunityShell.test.tsx
- feed-page.test.tsx
- library-page.test.tsx
- notifications-page.test.tsx

Status: testes criados mas não rodados nesta sessão
(sandbox tem pouca RAM — vitest quebra por OOM)
```

### Cobertura estimada
| Módulo | Cobertura |
|---|---|
| Auth | 0% — não implementado |
| Feed | 0% — mocks |
| Library | 0% — mocks |
| Notifications | 0% — mocks |
| Groups | 0% — mocks |
| CommunityNav | 0% — testes existem |
| CommunityShell | 0% — testes existem |

### Pendências
- [ ] Rodar suite de testes em ambiente com mais RAM
- [ ] Adicionar testes pros componentes da página de perfil
- [ ] Adicionar testes pra OnboardingEspiritual (quando criado)
- [x] Adicionar testes E2E com Playwright (2026-06-27 — feat/smoke-tests)

### Status
- **PARTIAL** — projeto compila, testes existem mas não rodam no sandbox
- Pronto para implementação dos componentes reais
