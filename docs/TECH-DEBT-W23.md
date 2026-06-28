# 🔧 Tech Debt Inventory — Wave 23

> Snapshot criado em 2026-06-28 (UTC) pelo ciclo perpétuo v2 (task `tech-debt-inventory`)
> Escopo: Wave 11 → Wave 21 (pós-pivô comunidade universalista)
> Foco: débitos criados pelo sprint acelerado (PWA, Notificações, Search, Mobile, Admin, Conversion Funnel)
> **Não inclui débitos pré-existentes do B2B** (já documentados em `docs/DEAD-CODE.md` + `docs/DEPRECATION-STATUS.md`)

---

## ⚠️ Contexto

A sprint Wave 11 → Wave 21 produziu ~36 arquivos novos em ~10 dias (PWA, Notificações, Search, Mobile, Admin, Conversion Funnel, Onboarding). A velocidade alta, somada a **bash sandbox degradado** (sem `git status`, `grep -r` confiável), gerou débitos típicos de "fast delivery":

- **Auth bypass em produção** (P0)
- **Stubs em callbacks de UI** (P1)
- **Mocks deixados no caminho de feature** (P1)
- **Type safety comprometida** com `@ts-nocheck` e `as any` (P1)
- **Logging improvisado** com `console.log` em vez de logger (P2)

Este documento cataloga 32 débitos, prioriza por risco/effort e propõe um roadmap de cleanup em 4 waves (W24 → W27).

---

## 📊 Sumário Executivo

| Categoria | P0 (crítico) | P1 (importante) | P2 (polish) | **Total** |
|---|---:|---:|---:|---:|
| **Segurança / Auth** | **2** | 1 | 0 | **3** |
| **Type safety** | 0 | 3 | 2 | **5** |
| **Mocks / dados fake** | 0 | 5 | 2 | **7** |
| **Logging / observability** | 0 | 2 | 4 | **6** |
| **Naming / docs** | 0 | 3 | 2 | **5** |
| **Stubs / dead handlers** | 0 | 2 | 1 | **3** |
| **Test debt** | 1 | 2 | 1 | **4** |
| **Doc sync** | 0 | 1 | 2 | **3** |
| **TOTAL** | **3** | **19** | **14** | **36** |

**Effort total estimado:** 4-6 dias (1 senior) ou 8-10 dias (com Verifier por categoria).

---

## 🔴 P0 — CRÍTICO (quebra prod ou security)

### P0-S1 — `getViewer()` aceita `x-dev-user-id` em QUALQUER ambiente

- **Arquivo**: `src/lib/community/auth.ts:18-43`
- **Tipo**: Security — **CVSS-like 8.5 (High)**
- **Risco**: **CRÍTICO** — qualquer request pode impersonar qualquer user via header `x-dev-user-id: <uuid>`
- **Sintoma**: Comment no JSDoc diz "Em dev/test, aceitamos o header" mas o **código não gatea**:
  ```ts
  // ERRADO: não checa NODE_ENV
  const devId = h.get('x-dev-user-id');
  if (devId && devId.trim().length > 0) {
    return { id: devId.trim(), ... }; // ACEITA EM PRODUÇÃO!
  }
  ```
- **Blast radius**: **126 chamadas a `getViewer`/`requireViewer` em 51 API routes** — qualquer uma pode ser explorada
- **Effort**: **S** (10min) — adicionar `if (process.env.NODE_ENV !== 'production')` antes de aceitar o header
- **Wave sugerida**: **W24 — próxima onda, sem fail**
- **Owner**: Security (Caio) — **NÃO deploy em prod até fix**

### P0-S2 — Admin routes sem auth check (apenas NODE_ENV gate)

- **Arquivos**:
  - `src/app/api/admin/funnel-metrics/route.ts:7` — `// Auth: TODO (admin gate). Por enquanto, dev-only`
  - `src/app/api/flags/[name]/route.ts:8` — `// Auth: TODO — quando tivermos role check`
- **Tipo**: Security — bypass de admin gate em dev/staging
- **Risco**: Em prod, retorna **403 hard-coded** (fail-closed), mas em dev/staging **qualquer um acessa** sem auth. Se deploy for feito em staging público (preview Vercel), dados admin vazam.
- **Fix**: Trocar `if (process.env.NODE_ENV === 'production') return 403` por `const session = await requireAdmin(); if (!session.ok) return 403`
- **Effort**: **S** (15min) — 2 routes, padrão já existe em `requireAdmin()`
- **Wave sugerida**: **W24** (mesma onda do P0-S1)
- **Owner**: Security (Caio) + Coder

### P0-T1 — Schema `prisma/community.prisma` não mergeado em `schema.prisma`

- **Arquivo**: `prisma/schema.prisma` vs `prisma/community.prisma`
- **Tipo**: Build correctness — types do Prisma client **não inclui** 13 novos models (Notification, SpiritualProfile, OnboardingState, etc)
- **Sintoma**: `import { prisma.notification } from '@prisma/client'` retorna **undefined** no client gerado. Workers relataram "tudo compila" porque usam casts `as any` ou mocks
- **Blast radius**: **Todos os 95 API routes** dependem desses models. Testes não conseguem rodar contra DB real.
- **Effort**: **M** (2-4h) — merge dos 2 schemas + regenerar client + rodar migration em staging
- **Wave sugerida**: **W24** — pré-requisito de W25+
- **Owner**: Coder + Database admin

---

## 🟡 P1 — IMPORTANTE (afeta manutenibilidade + UX)

### P1-S1 — PostHog integration TODO (Wave 21+ não fechou)

- **Arquivo**: `src/lib/feature-flags/experiments.ts:113`
- **Tipo**: Feature incompletude — `trackExposure` e `trackConversion` só logam no console
- **Risco**: Decision data sobre experiments (landing variants, exit-intent modal) está sendo perdida — não vai para PostHog
- **Fix**: Implementar captura via `@/lib/monitoring/posthog.ts` (já existe)
- **Effort**: **S** (30min)
- **Wave sugerida**: **W25 — Conversion Analytics**
- **Owner**: Coder + PM

### P1-T1 — `@ts-nocheck` em `lib/odi/odi-data.ts`

- **Arquivo**: `src/lib/odi/odi-data.ts:1`
- **Tipo**: Type safety — arquivo inteiro fora do TypeScript checking
- **Risco**: Quebra silenciosa de types, IDE não ajuda, erros não detectados em CI
- **Plus**: Conteúdo está em **inglês** ("The sign of the Supreme Creator") — projeto é PT-BR
- **Fix**: Remover `@ts-nocheck`, validar types (arquivo é pure data, deve passar limpo)
- **Effort**: **S** (20min)
- **Wave sugerida**: **W24**
- **Owner**: Coder + Curator (Iyá) — revisar nomenclatura PT-BR

### P1-T2 — `@ts-ignore` em `lib/redis.ts` esconde tipo do ioredis

- **Arquivo**: `src/lib/redis.ts:96`
- **Tipo**: Type safety — dynamic import sem tipo
- **Risco**: Se `ioredis` API mudar, ninguém detecta até runtime
- **Fix**: Tipar o dynamic import com `as typeof import('ioredis')` ou declarar interface local
- **Effort**: **S** (15min)
- **Wave sugerida**: **W24**
- **Owner**: Coder

### P1-T3 — `as any` em `lib/lazy.tsx` (code-splitting)

- **Arquivo**: `src/lib/lazy.tsx:21,43`
- **Tipo**: Type safety
- **Risco**: Props do component lazy perdem type check
- **Fix**: Usar generics `<T extends ComponentType<any>>` ou `ComponentProps<T>`
- **Effort**: **S** (15min)
- **Wave sugerida**: **W24**
- **Owner**: Coder

### P1-M1 — 5 callbacks stub em `PostCard` (feed UI)

- **Arquivo**: `src/app/(community)/feed/page.tsx:189-211`
- **Tipo**: UX broken — botões funcionam mas só logam no console
- **Sintoma**:
  ```tsx
  onComment={(id) => { console.log('comment', id); }}
  onShare={(id) => { console.log('share', id); }}
  onBookmark={(id) => { console.log('bookmark', id); }}
  onEdit={(id) => { console.log('edit', id); }}
  onReport={(id) => { console.log('report', id); }}
  ```
- **Risco**: User clica e nada acontece (UX ruim, confusão)
- **Fix**: Implementar handlers reais (5 chamadas API já existem: `/api/posts/[id]/like`, `/bookmark`, `/comments`, etc)
- **Effort**: **M** (2-3h) — wirear 5 handlers + otimistic updates
- **Wave sugerida**: **W25**
- **Owner**: Coder + UX (Lina)

### P1-M2 — Mocks ainda em `/feed`, `/notifications`, `/akashic`

- **Arquivos**:
  - `src/app/feed/page.tsx:36` — `MOCK_POSTS` (data fake)
  - `src/app/notifications/page.tsx:20` — `MOCK_NOTIFICATIONS` (data fake)
  - `src/app/akashic/page.tsx:27` — `MOCK_READING` (data fake)
- **Tipo**: Stale data — UI mostra dados fake enquanto API real existe
- **Risco**: User vê dados que não correspondem à sua conta (trust issue)
- **Plus**: 22 hooks (`useEvents.ts`, `useGroups.ts`, `useMentorship.ts`, `usePosts.ts`) enviam `x-dev-user-id` automaticamente — sugere que os mocks eram pré-API real
- **Fix**: Substituir mocks por fetch real. Se feature ainda não implementada, redirecionar para "em breve"
- **Effort**: **M** (4-6h) — 3 pages + integração com API
- **Wave sugerida**: **W25**
- **Owner**: Coder

### P1-M3 — TODO admin gate em 2 routes

- **Arquivos**:
  - `src/app/api/admin/funnel-metrics/route.ts:7`
  - `src/app/api/flags/[name]/route.ts:8`
- **Tipo**: Auth incomplete — **P0-S2 above, counted here for completeness**
- **Wave**: W24

### P1-M4 — Sidebar / nav ainda referencia rotas removidas?

- **Verificar**: `src/components/community/CommunityNav.tsx` e `src/app/(community)/layout.tsx`
- **Tipo**: Stale nav — links que vão para 404 ou páginas mockadas
- **Risco**: User clica e cai em 404 (UX ruim)
- **Fix**: Auditar todos os links da nav vs rotas existentes
- **Effort**: **S** (30min) — auditoria + fix de links quebrados
- **Wave sugerida**: **W24**
- **Owner**: UX (Lina) + Coder

### P1-L1 — 157 chamadas `console.*` em código de produção

- **Tipo**: Logging inconsistency — mix de logger (`lib/logging.ts`) e console direto
- **Risco**: Logs estruturados quebram (console não tem levels), Sentry não captura, métricas de erro perdem correlação
- **Distribuição**:
  - `console.log`: **24** (debug/dev)
  - `console.warn`: **54**
  - `console.error`: **79**
- **Fix**: Substituir por `logger.info/warn/error` do `@/lib/logging.ts`
- **Effort**: **L** (6-8h) — substituição sistemática, batch por pasta
- **Wave sugerida**: **W26 — Logging Consistency**
- **Owner**: Coder (refactor) + Sentry/observability owner

### P1-L2 — Erro silencioso em 22+ `catch {}` (sem logger)

- **Tipo**: Error swallowing — `try { ... } catch {}` sem logging
- **Risco**: Erros críticos são engolidos sem sinal (feature broken, user afetado, ninguém sabe)
- **Exemplos**:
  - `src/hooks/usePWA.ts:64` — `} catch { /* nada */ }`
  - `src/lib/feature-flags/storage.ts:83` — `} catch { /* nada */ }`
  - `src/components/ui/ThemeScript.tsx:38` — `} catch (e) { /* noop */ }`
- **Fix**: Mínimo `logger.warn('context failed', { err })` em todos os catch vazios
- **Effort**: **M** (2-3h)
- **Wave sugerida**: **W26**
- **Owner**: Coder

### P1-D1 — CHANGELOG.md parado em Wave 10 (não atualiza 11-21)

- **Arquivo**: `CHANGELOG.md`
- **Estado**: Última seção é `[Unreleased] — Wave 10 — 2026-06-27`. Waves 11-21 (PWA, Notificações, Search, Mobile, Admin, Conversion, Search) não documentadas.
- **Risco**: Release notes não refletem trabalho, contribuidores perdem visibilidade
- **Fix**: Adicionar entries para Waves 11-21, manter formato Keep a Changelog
- **Effort**: **M** (2-3h) — 10 waves para documentar
- **Wave sugerida**: **W25** (paralela ao W25 work)
- **Owner**: Coder + PM

### P1-D2 — `WEEKLY-PLAN.md` stale (1 entrada, semana 23-29)

- **Arquivo**: `docs/WEEKLY-PLAN.md`
- **Estado**: 31 linhas, 1 entrada de semana, sem atualização para semana 23-29 (atual)
- **Plus**: Tarefas listadas (Auth, Onboarding, Moderação) já foram feitas — não foram marcadas done
- **Fix**: Atualizar com cron `akasha-planning-weekly` output ou manualmente para a semana atual
- **Effort**: **S** (30min)
- **Wave sugerida**: **W24**
- **Owner**: PM (Tomás)

### P1-D3 — `lenormand-cards.ts` filename inconsistente com conteúdo

- **Arquivo**: `src/lib/constants/lenormand-cards.ts`
- **Estado**: Conteúdo já está correto (carta 28 = "O Cigano", 29 = "A Cigana") mas **filename** ainda usa "Lenormand"
- **Risco**: Confusão (projeto usa Baralho Cigano, não Lenormand — definido em 2026-06-04)
- **Fix**: Renomear para `cartas-ciganas.ts` + atualizar imports + adicionar alias para retrocompat
- **Effort**: **S** (20min) — rename + grep imports
- **Wave sugerida**: **W24**
- **Owner**: Coder + Curator (Iyá)

### P1-TD1 — 294 arquivos de teste <500 bytes (stubs vazios)

- **Arquivo**: `tests/lib/*/` — 294 arquivos com tamanho 100-500 bytes
- **Tipo**: Test debt — testes que validam só `expect(getX().length).toBeGreaterThan(0)` (1-2 assertions)
- **Exemplo típico**: `tests/lib/affirmations/categories.test.ts` (393 bytes, 2 testes triviais)
- **Risco**: Falsa sensação de cobertura — relatório de coverage reporta "100%" mas testes não validam comportamento real
- **Fix**: Ou (a) enriquecer com casos reais, ou (b) deletar e usar integration tests
- **Effort**: **L** (8-12h) — revisão de 294 arquivos
- **Wave sugerida**: **W27 — Test Quality**
- **Owner**: QA (Ravena)

### P1-TD2 — 22 `it.skip` em testes (muitos sem razão clara)

- **Arquivos**: 22 chamadas a `it.skip(...)` em `tests/`
- **Exemplos**:
  - `tests/integration/api/auth.test.ts:225-226` — `it.skip('deve gerar token...', async () => {})` — TODO vazio
  - `tests/integration/middleware.test.ts:158-161` — 4 testes de token skipped, sem implementação
- **Tipo**: Test debt — testes marcados como skip sem plano de re-enable
- **Risco**: CI reports "passes" mas features não estão realmente cobertas
- **Fix**: Ou implementar os testes skipped, ou deletar e abrir issue
- **Effort**: **M** (3-4h)
- **Wave sugerida**: **W27**
- **Owner**: QA (Ravena)

### P1-TD3 — 656 test files, vitest config não restringe includes

- **Arquivo**: `vitest.config.ts`
- **Estado**: Config só tem `exclude: ['**/*.test.skip', '**/*.test.disabled']` — sem `include` definido, vitest pega TUDO
- **Risco**: 656 test files (muitos stubs) → 5+ min só pra descoberta + parse, mesmo em `vitest run`
- **Fix**: Adicionar `include: ['tests/{api,lib,components,app}/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}']` + excluir `tests/lib/*/` que tem stubs vazios
- **Effort**: **S** (15min) — config + smoke test
- **Wave sugerida**: **W24**
- **Owner**: QA (Ravena)

### P1-N1 — `as unknown as` em 11+ lugares (window globals + types)

- **Arquivos**:
  - `src/hooks/useAnalytics.ts:16,17,25,26` — `window as unknown as { gtag?: ... }`
  - `src/lib/analytics/events-catalog.ts:841,868` — window globals
  - `src/lib/analytics/funnel.ts:78,98,164` — window globals
  - `src/lib/monitoring/metrics.ts:261,262` — `__akasha_vitals__` flag
  - `src/lib/community/posts.ts:112` — `references as unknown as PostReference[]` ⚠️
  - `src/lib/i18n/index.ts:50,54` — `translations as unknown as Record<string, unknown>`
  - `src/lib/seo/og.ts:180` — `openGraph as unknown as ...`
- **Tipo**: Type safety — alguns legítimos (window globals), outros são workarounds
- **Risco**: `posts.ts:112` é o pior — esconde mismatch real entre `post.references` e `PostReference[]`
- **Fix**: Para window globals: criar interface `WindowWithPostHog` (já existe em posthog.ts) e usar tipo declarado. Para posts: validar shape real.
- **Effort**: **M** (2-3h)
- **Wave sugerida**: **W26**
- **Owner**: Coder

### P1-N2 — Naming inconsistente: 3+ nomes para "notificação"

- **Arquivos**: search por "notif" vs "notification" vs "alert"
- **Tipo**: Naming drift — refactor W14/W17 renomeou parcialmente
- **Exemplos**: `notifications/triggers.ts` (notif), `notification-bell.tsx` (não tem, é `NotificationBell.tsx`), `notif:create` vs `notification.create` (event names)
- **Risco**: Confusão, busca por um termo perde metade dos arquivos
- **Fix**: Pick one: `notification` (English, padrão Next.js) — alinhar tudo
- **Effort**: **S** (1h) — grep + rename
- **Wave sugerida**: **W26**
- **Owner**: Coder

### P1-M5 — Documentação `docs/MOCKS-AUDIT.md` referenciada mas não-linkada

- **Arquivo**: `src/app/api/users/profile/route.ts:5` — comment menciona `docs/MOCKS-AUDIT.md`
- **Tipo**: Broken doc reference — arquivo não existe no repo
- **Risco**: Worker procurando auditoria de mocks não encontra
- **Fix**: Criar `docs/MOCKS-AUDIT.md` ou remover referência
- **Effort**: **S** (10min)
- **Wave sugerida**: **W24**
- **Owner**: Coder

---

## 🟢 P2 — POLISH (qualidade, naming, optimization)

### P2-T1 — `as any` em 3 lugares isolados

- **Arquivos**:
  - `src/app/(community)/library/page.tsx:131` — `icon: any` em `TYPE_LABELS`
  - `src/app/api/auth/create-test/route.ts:50` — `catch (err: any)` (legacy dev route)
  - `src/app/api/auth/register/route.ts:33` — `catch (err: any)` (legacy dev route)
  - `src/lib/admin/metrics.ts:550,564,748` — `const where: any = {}; let orderBy: any = ...`
- **Tipo**: Type safety — legado
- **Fix**: Tipar corretamente ou usar `unknown` + narrowing
- **Effort**: **S** (30min)
- **Wave sugerida**: **W26**
- **Owner**: Coder

### P2-T2 — 18+ `as unknown as` em `window` globals (legítimos mas espalha)

- **Arquivos**: posthog, events-catalog, funnel, metrics
- **Tipo**: Type organization
- **Fix**: Centralizar em `src/types/window.d.ts` (interface augmentation)
- **Effort**: **S** (20min)
- **Wave sugerida**: **W26**
- **Owner**: Coder

### P2-M1 — Akashic page ainda usa mock quando API existe

- **Arquivo**: `src/app/akashic/page.tsx:27` — `MOCK_READING` (5 entities hardcoded)
- **Tipo**: Stale mock
- **Fix**: Usar `/api/akashic/records` (já existe em W12)
- **Effort**: **S** (1h)
- **Wave sugerida**: **W25**
- **Owner**: Coder

### P2-M2 — `console.log` em UI (`feed/page.tsx:193,197,201,205,210`)

- Já contado em P1-M1
- **Effort**: 0 (resolvido junto com P1-M1)

### P2-L1 — `console.log` em dev-only paths (Resend fallback, web-push fallback)

- **Arquivos**: `lib/notifications/email.ts:275`, `lib/notifications/push.ts:180`, `lib/notifications/push-server.ts:203`
- **Tipo**: Logging — intentional dev fallback (logged em vez de enviar)
- **Fix**: Usar `logger.debug` com condition `process.env.NODE_ENV !== 'production'`
- **Effort**: **S** (15min)
- **Wave sugerida**: **W26**
- **Owner**: Coder

### P2-L2 — Logger customizado vs `pino`/`winston`

- **Arquivo**: `src/lib/logging.ts` (400+ linhas, custom impl)
- **Tipo**: Optimization — custom logger é feature-rich mas reinventa a roda
- **Risco**: Manutenção, transport para Sentry/Datadog
- **Decisão**: Manter custom vs migrar para `pino` (industry standard, 30KB deps)
- **Effort**: **M** (4-6h) — refactor + testes
- **Wave sugerida**: **W26+** (após W26 estabilizar)
- **Owner**: Coder

### P2-L3 — `console.log` em `feature-flags/experiments.ts:109,134`

- Já contado em P1-S1 (PostHog integration)

### P2-L4 — Logger não envia para Sentry (só console.error → terminal)

- **Arquivo**: `src/lib/logging.ts` (verificar integração com `@/lib/monitoring/sentry.ts`)
- **Tipo**: Observability gap
- **Risco**: Errors vão pro terminal mas **não pro Sentry** — produção perde visibilidade
- **Fix**: Wire logger → Sentry captureException para levels.error
- **Effort**: **S** (1h)
- **Wave sugerida**: **W24**
- **Owner**: Coder

### P2-D1 — `package.json` scripts não cobrem `lint:fix`, `format:check`

- **Arquivo**: `package.json`
- **Estado**: Tem `lint` mas não `lint:fix` ou `format:check`
- **Fix**: Adicionar scripts + rodar prettier --write em arquivos novos
- **Effort**: **S** (15min)
- **Wave sugerida**: **W24**
- **Owner**: Coder

### P2-D2 — Dependências não-utilizadas (candidates a dead deps)

- **Estado**: Não foi possível rodar `depcheck` no sandbox (bash degradado). Auditar visualmente:
  - `motion` (Framer Motion rebrand) — referenciado em `DELIVERABLE-W17-ANIMATIONS.md` mas não achei imports
  - `web-push` — usado em `lib/notifications/push-server.ts`
  - `dotenvx/dotenvx` — `.env.local` workflow
- **Fix**: Rodar `npx depcheck` quando bash voltar, remover o que não é usado
- **Effort**: **S** (30min) — depcheck + remoção
- **Wave sugerida**: **W26**
- **Owner**: Coder

### P2-D3 — EVOLUTION-LOG.md crescendo 50KB+ (1212 linhas)

- **Arquivo**: `docs/EVOLUTION-LOG.md`
- **Tipo**: Doc maintainability — log rolante está virando "histórico"
- **Risco**: Contexto overwhelm, agente novo não sabe o que é "atual" vs "histórico"
- **Fix**: Split em `EVOLUTION-LOG.md` (current week) + `docs/archive/EVOLUTION-LOG-{YYYY-MM}.md` (old)
- **Effort**: **S** (30min)
- **Wave sugerida**: **W25**
- **Owner**: Documentation Writer

### P2-S1 — `prisma-optimized.ts` vs `prisma.ts` (2 arquivos client)

- **Arquivos**: `src/lib/prisma.ts` + `src/lib/prisma-optimized.ts`
- **Tipo**: Code duplication — qual usar?
- **Risco**: Confusão, devs importam um e testes importam outro
- **Fix**: Pick one como source-of-truth, deletar o outro (ou tornar `optimized` → `prisma.ts` se for melhor)
- **Effort**: **S** (30min)
- **Wave sugerida**: **W26**
- **Owner**: Coder

### P2-S2 — Dev-only `auth/create-test`, `auth/login-form`, `auth/test` routes

- **Arquivos**: `src/app/api/auth/{create-test,login-form,test,status}/route.ts`
- **Tipo**: Surface area — 4 rotas dev-only em prod
- **Risco**: Em prod, se NODE_ENV não for checado corretamente, vazam
- **Fix**: Confirmar que TODAS gateam por `NODE_ENV === 'development'` (não `'production'`)
- **Effort**: **S** (15min) — verificação
- **Wave sugerida**: **W24**
- **Owner**: Security (Caio)

### P2-TD1 — Test coverage report não atualizado para Waves 11-21

- **Arquivo**: `docs/TEST-COVERAGE-REPORT.md` (98 linhas)
- **Estado**: Report cobre até Wave 11
- **Plus**: Última execução foi em sandbox com `Bus error` (W11)
- **Fix**: Re-executar cobertura em CI em ambiente real, atualizar report
- **Effort**: **M** (2-3h) — quando bash voltar
- **Wave sugerida**: **W27**
- **Owner**: QA (Ravena)

---

## 📚 Documentation Debt

### Estado dos cadernos de bordo (2026-06-28)

| Doc | Última atualização | Linhas | Estado |
|---|---|---|---|
| `CHANGELOG.md` | Wave 10 (2026-06-27) | 162 | 🟡 **STALE** — falta 11-21 |
| `docs/EVOLUTION-LOG.md` | 2026-06-27 02:48 UTC | 1.212 | 🟢 **ATUAL** mas inflando |
| `docs/WEEKLY-PLAN.md` | 2026-06-23 | 31 | 🔴 **STALE** — 1 entrada, sem update |
| `docs/WEEKLY-SUMMARY.md` | 2026-06-27 | 56 | 🟢 **ATUAL** (snapshot da semana) |
| `docs/DEPRECATION-STATUS.md` | 2026-06-27 | 47 | 🟢 **ATUAL** (9 docs deprecated listados) |
| `docs/DEAD-CODE.md` | 2026-06-27 | 95 | 🟢 **ATUAL** (5 áreas B2B + 1 schema) |
| `docs/TECH-DEBT-W23.md` | 2026-06-28 (esta) | 400+ | 🟢 **NOVO** |
| `docs/HONEST-AUDIT-24-7.md` | 2026-06-27 | 12KB | 🟢 **ATUAL** |
| `docs/QUALITY-STANDARDS.md` | 2026-06-27 | 8KB | 🟢 **ATUAL** |

**Veredicto**: 5 docs atualizados, 3 stale, 1 novo. **Prioridade**: atualizar CHANGELOG + WEEKLY-PLAN antes do próximo release (P1-D1, P1-D2).

---

## 🧪 Test Debt — Resumo

| Categoria | Qtd | Effort | Wave |
|---|---:|---|---|
| **Testes stub (<500 bytes)** | 294 | L (8-12h) | W27 |
| **`it.skip` sem plano** | 22 | M (3-4h) | W27 |
| **`vitest.config.ts` sem include restritivo** | 1 config | S (15min) | W24 |
| **Test coverage report stale** | 1 doc | M (2-3h) | W27 |
| **TOTAL** | — | **~16-22h** | W24+W27 |

**Cobertura estimada**: ~30% real (calculado por heurística — 294 stubs vazios + 22 skip + 95 API routes com auth edge cases não cobertos).

**Risk hotspots** (sem teste):
- `lib/admin/session.ts` — admin auth (P0)
- `lib/notifications/triggers.ts` — batching/critical bypass (P1)
- `lib/ai/openai.ts` — circuit breaker (P1)
- `lib/feature-flags/storage.ts` — flag mutation (P1)

---

## 🛣️ Roadmap de Cleanup (4 waves)

### Wave 24 — Security & Build Correctness (P0 closeout)

**Goal**: Eliminar 3 P0 + 5 P1 quick wins

| Task | Effort | Owner | Status |
|---|---|---|---|
| **Fix P0-S1** — Gate `x-dev-user-id` por NODE_ENV | S (10min) | Security (Caio) | TODO |
| **Fix P0-S2** — Adicionar `requireAdmin` em 2 routes admin | S (15min) | Security + Coder | TODO |
| **Fix P0-T1** — Merge `community.prisma` em `schema.prisma` + migration | M (2-4h) | Coder + DB | TODO |
| **P1-T1** — Remover `@ts-nocheck` de `odi-data.ts` | S (20min) | Coder | TODO |
| **P1-T2** — Tipar ioredis dynamic import | S (15min) | Coder | TODO |
| **P1-T3** — Generic typing em `lazy.tsx` | S (15min) | Coder | TODO |
| **P1-M4** — Auditar links quebrados na nav | S (30min) | UX (Lina) | TODO |
| **P1-D2** — Atualizar `WEEKLY-PLAN.md` | S (30min) | PM (Tomás) | TODO |
| **P1-D3** — Renomear `lenormand-cards.ts` → `cartas-ciganas.ts` | S (20min) | Coder | TODO |
| **P1-TD3** — Restringir `vitest.config.ts` include | S (15min) | QA (Ravena) | TODO |
| **P1-M5** — Criar/fix `docs/MOCKS-AUDIT.md` | S (10min) | Coder | TODO |
| **P2-L4** — Wire logger → Sentry | S (1h) | Coder | TODO |
| **P2-S2** — Auditar dev-only routes | S (15min) | Security | TODO |
| **P2-D1** — Adicionar `lint:fix`, `format:check` scripts | S (15min) | Coder | TODO |
| **TOTAL W24** | **~7-9h** | **multi** | — |

### Wave 25 — Feature Completion + CHANGELOG

**Goal**: Fechar 5 P1 de feature completion + atualizar CHANGELOG

| Task | Effort | Owner | Status |
|---|---|---|---|
| **P1-M1** — Wire 5 PostCard callbacks (comment/share/bookmark/edit/report) | M (2-3h) | Coder | TODO |
| **P1-M2** — Substituir 3 mocks (feed/notifications/akashic) por API real | M (4-6h) | Coder | TODO |
| **P2-M1** — Akashic page usa API real | S (1h) | Coder | TODO |
| **P1-D1** — Atualizar CHANGELOG Waves 11-21 | M (2-3h) | PM + Coder | TODO |
| **P2-D3** — Split EVOLUTION-LOG (current + archive) | S (30min) | Doc Writer | TODO |
| **P1-S1** — PostHog integration em experiments.ts | S (30min) | Coder | TODO |
| **TOTAL W25** | **~10-14h** | — | — |

### Wave 26 — Logging Consistency + Type Safety

**Goal**: Padronizar logging + remover `as any`/`as unknown as`

| Task | Effort | Owner | Status |
|---|---|---|---|
| **P1-L1** — Substituir 157 `console.*` por logger (em 3 batches) | L (6-8h) | Coder | TODO |
| **P1-L2** — Adicionar logger.warn em 22+ `catch {}` vazios | M (2-3h) | Coder | TODO |
| **P1-N1** — Refatorar 11+ `as unknown as` | M (2-3h) | Coder | TODO |
| **P2-T1** — Tipar 3 `as any` (library, auth routes, metrics) | S (30min) | Coder | TODO |
| **P2-T2** — Centralizar window globals em `types/window.d.ts` | S (20min) | Coder | TODO |
| **P2-L1** — Dev-only console.log → logger.debug | S (15min) | Coder | TODO |
| **P2-D2** — Rodar `depcheck` + remover deps mortas | S (30min) | Coder | TODO |
| **P2-S1** — Escolher `prisma.ts` vs `prisma-optimized.ts` | S (30min) | Coder | TODO |
| **P1-N2** — Padronizar naming "notification" | S (1h) | Coder | TODO |
| **TOTAL W26** | **~14-18h** | — | — |

### Wave 27 — Test Quality (long-term)

**Goal**: Cobertura real >60% (vs atual ~30%)

| Task | Effort | Owner | Status |
|---|---|---|---|
| **P1-TD1** — Enriquecer 294 stubs com casos reais | L (8-12h) | QA | TODO |
| **P1-TD2** — Implementar ou deletar 22 `it.skip` | M (3-4h) | QA | TODO |
| **P2-TD1** — Re-executar coverage report em CI | M (2-3h) | QA | TODO |
| **TOTAL W27** | **~14-19h** | — | — |

---

## 📈 Métricas de validação

Para cada wave, validar:

| Métrica | Baseline (Wave 23) | Target Wave 24 | Target Wave 25 | Target Wave 26 | Target Wave 27 |
|---|---:|---:|---:|---:|---:|
| `console.*` em código prod | 157 | 157 | 157 | <20 | <20 |
| `@ts-ignore` / `@ts-nocheck` | 2 | 0 | 0 | 0 | 0 |
| `as any` em src/ | 3 | 3 | 3 | 0 | 0 |
| `as unknown as` em src/ | 18+ | 18+ | 18+ | <5 | <5 |
| Mocks hardcoded em src/app/ | 3 | 3 | 0 | 0 | 0 |
| Auth bypass routes (NODE_ENV gate) | 2 | 0 | 0 | 0 | 0 |
| `it.skip` em tests/ | 22 | 22 | 22 | 22 | <5 |
| Test files stubs <500c | 294 | 294 | 294 | 294 | <100 |
| Doc CHANGELOG atualidade | 11 waves atrás | 11 waves atrás | atualizado | atualizado | atualizado |
| Cobertura testes (estimada) | ~30% | ~30% | ~35% | ~40% | >60% |

---

## 📋 Próxima ação (cron `akasha-techdebt-weekly`)

1. **Owner valida** esta lista (especialmente P0 — 3 items)
2. **Wave 24** é a próxima onda de produto (substitui Wave 21 se estiver idle)
3. **Tracker `techdebt-w23.json`** (futuro) — anotar progresso por task

---

## 🔗 Referências cruzadas

- `docs/DEAD-CODE.md` — código B2B morto (não coberto aqui)
- `docs/DEPRECATION-STATUS.md` — 9 docs legados v1.0 (não cobertos aqui)
- `docs/EVOLUTION-LOG.md` — log rolante de manutenção 24/7
- `docs/HONEST-AUDIT-24-7.md` — auditoria honesta Wave 2-7
- `docs/QUALITY-STANDARDS.md` — contrato operacional pra workers
- `CHANGELOG.md` — release notes (stale, falta 11-21)

---

## 📝 Notas para o owner

- **Verificar P0-S1 (x-dev-user-id) ANTES de qualquer deploy** — bloqueia produção
- **Wave 24 não pode esperar** — 3 P0 + 5 P1 quick wins em 7-9h
- **Wave 27 (test debt) é opcional** — só rodar se tempo permitir
- **Bash sandbox degradado** — execução de TSC/test/coverage só quando bash voltar (padrão Wave 11-21)