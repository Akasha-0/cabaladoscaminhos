# Changelog

Todas as mudanças notáveis neste projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e o projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Wave 10 — 2026-06-27

**Polimento final do v3.0 antes do release candidate. 18 commits, 5 trilhas paralelas, 0 erros TSC.**

### Segurança (Caio) — 6 fixes (F1-F11)

- **F1 P0** — Removido MiniMax API token hardcoded em código (`68636108`)
- **F2 P0** — Reescrito logout com `supabase.auth.signOut()` real (`e3980c5e`)
- **F3 P0** — LoginForm demo bypass gateado a `NODE_ENV=development` (`7c8d6e35`)
- **F6 P1** — CORS fail-closed em produção (throw se `ALLOWED_ORIGINS` ausente) (`3dcc0800`)
- **F8 P1** — Headers de segurança adicionados: HSTS, COOP, CORP (`3dcc0800`)
- **F11 P1** — Debug auth routes gateadas a `NODE_ENV=development` (`04f26fe6`)
- Cobertura de testes: 22 testes para F1/F2/F3/F11 (`2b2cad5d`)
- Doc: `docs/SECURITY-FIXES-WAVE10.md` (`1f0b07b6`)

### Performance (Aki) — 4 quick wins

- **next/image** trocado por `<img>` em 3 páginas críticas (`1718e38f`)
- **next/dynamic** para code-split do `CreatePost` em feed e grupos (`d0f1c30f`)
- **ISR (revalidate)** adicionado em `/api/search` e `/api/search/suggestions` (`eeacad23`)
- Doc: `docs/PERF-FIXES-WAVE10.md` (`4ab0d482`)

### Conteúdo (Iyá) — +20 artigos (70 total)

- `prisma/seed/articles-batch-3.ts` com 20 artigos cobrindo tradições adicionais
- Cobertura expandida: Taoismo, Budismo, Hinduísmo, Espiritualidade Contemporânea
- Doc: `docs/CONTENT-WAVE10.md` (`981a7409`)

### Mobile + Acessibilidade (Lina) — Wave 10 polish

- **Touch targets ≥ 44px** em todos os botões de Feed, Groups, Profile
- **iOS safe-area** font aplicada consistentemente
- **Focus-visible** ring-2 em todos os elementos interativos
- **Skip-target** para navegação por teclado
- Arquivos: `LoginForm.tsx`, `CommunityNav.tsx`, `CommunityShell.tsx`, `CreatePost.tsx`, `PostCard.tsx`
- Doc: `docs/MOBILE-A11Y-FIXES-WAVE10.md` (`2119c6b2`)

### Akasha IA MVP (Coder + Caio) — 5 commits

- **System prompt module** com 8 regras éticas + 12 tradições (`e425f011`)
- **RAG helper** com degradação graceful quando pgvector off (`e425f011`)
- **POST /api/akashic/chat** endpoint com rate limit 20 req/min/IP (`bb9d0c6f`)
- **POST /api/akashic/chat/stream** SSE endpoint (`bb9d0c6f`)
- **UI /akashic** mobile-first com painel de fontes, filtro de tradição, empty states (`8745062b`)
- **38 testes** (22 prompt + 16 endpoint) (`3807ae63`)
- Doc: `docs/AKASHIA-IA-MVP-WAVE10.md` (`fb3876f1`)

### E2E Smoke Tests (Ravena) — Playwright + 3 specs

- `playwright.config.ts` com chromium + mobile-safari projects (`30fd6c10`)
- `e2e/signup-onboarding-feed.spec.ts` — caminho do novo usuário
- `e2e/feed-interaction.spec.ts` — interação social core
- `e2e/library-search.spec.ts` — consumo de conteúdo
- CI workflow `.github/workflows/e2e.yml` (defensivo, skip em sandbox)
- Doc: `docs/E2E-TESTS-WAVE10.md` (`30fd6c10`)

### Não entregue nesta wave (próximas)

- **Wave 10 — Auth Integration** (BLOCKED): Worker rodou mais de 30 min sem commits.
  Componentes existem (`LoginForm`, `RegisterForm`, `GoogleOAuthButton`, `AuthGuard`) e
  middleware funciona, mas faltam pages `/login` e `/signup`. Próxima wave cria essas pages
  + profile auto-creation + reset password + email verification.

---

## [0.1.0-rc.1] — 2026-06-27 (release candidate)

### Adicionado

**v3.0 — Comunidade Akasha (community + universalismo)**

- Schema Prisma unificado: 33 models (18 community + 15 legacy), 0 B2B
- 9 grupos de rotas API: `akashic`, `auth`, `community`, `groups`, `notifications`, `posts`, `search`, `users`, `waitlist`
- Pages: `/feed`, `/explore`, `/library`, `/notifications`, `/profile`, `/groups`, `/post`, `/akashic`
- Pages públicas: `/about`, `/manifesto`, `/privacy`, `/terms`, `/validacao`
- Landing `/validacao` com `/api/waitlist` (50 vagas beta privado)
- Onboarding 5 passos incluindo seleção de tradições
- Akasha IA MVP: chat com RAG, 8 regras éticas, 12 tradições
- 5 feeds: Tudo / Seguindo / Grupos / Tendências / **Para Você** (scored recommendation)
- Search API com full-text + pgvector embeddings
- 70 artigos PT-BR cobrindo 12+ tradições
- pgvector habilitado (extensão + embeddings vector(1536) + IVFFlat index)
- Notifications Realtime verification script

### Segurança

- CORS fail-closed em produção
- HSTS, COOP, CORP headers
- Debug routes gateadas a dev only
- LoginForm demo bypass removido para prod
- Logout real Supabase
- Tokens hardcoded removidos

### Performance

- Bundle budgets CI gate (`.github/workflows/perf-budgets.yml`)
- `next/image` em vez de `<img` em 3 páginas
- `next/dynamic` para CreatePost (code-split)
- ISR em /api/search
- `scripts/check-bundle-size.ts` + `pnpm check:bundle`

### Mobile + Acessibilidade

- Touch targets ≥ 44px
- iOS safe-area fonts
- Focus-visible ring-2 consistente
- Skip-to-content em todas as páginas
- Aria-labels em botões só com ícone

### Testes

- 5 test files community: groups, posts-likes, auth-viewer
- 38 testes akashic
- 22 testes security fixes
- 3 Playwright E2E specs (signup, feed, library)
- CI workflows: tsc + tests + e2e (defensive)

### Documentação

- 9 docs novos wave 10: SECURITY-FIXES, PERF-FIXES, CONTENT, MOBILE-A11Y-FIXES, AKASHIA-IA-MVP, E2E-TESTS, WAVE-10-ORCHESTRATION
- DESIGN-SYSTEM.md (9.1KB)
- VISION.md (v3.0)
- ARCHITECTURE.md (v3.0)
- AI-PROMPT-base.md (8 regras éticas)

### Limpeza

- **1178 arquivos deletados** (-238K linhas): 100% B2B legacy removido
- (personal)/ route group removido
- 44 API groups legacy removidos
- 110+ src/lib/ paths B2B removidos
- 13 hooks legacy removidos
- 12 components legacy removidos
- Branch strategy: `main = v3.0` (overwrite B2B history)

### Corrigido

- 6 broken imports pós-cleanup: recriados `analytics/events.ts`, `WaitlistForm.tsx`; deletados
  `useUserProfile.ts` (B2B), `/api/search/index` (B2B), `/api/search/spiritual` (B2B)
- Layout.tsx: recriados `SupabaseProvider`, `SkipToContent`, `UpdatePrompt`, `InstallPrompt`, `OfflineIndicator`
- UI: recriados `Avatar` + `useHaptic`
- Login form: removido demo bypass em prod

### Estado final

- TSC: **0 errors** (strict mode)
- Broken imports: **0**
- Branches locais: 1 (`main`)
- Branches remotas: 5 (main + 4 dependabot)
- PRs abertas: 4 (dependabot auto security bumps)
- Workers paralelos: 6 max (sandbox 2GB RAM)
- Testes no sandbox: BLOCKED em vitest/playwright (Bus error, OOM); roda em ambiente real

[0.1.0-rc.1]: https://github.com/Akasha-0/cabaladoscaminhos/releases/tag/v0.1.0-rc.1
