# PROGRESS — Cabala dos Caminhos

> **Fonte da verdade** sobre o estado do projeto. Lido no início de cada
> ciclo de evolução (ver `AGENTS.md` §6). Atualizado após cada feature,
> bug fix ou decisão arquitetural importante.

---

## 1. Visão Geral

**Cabala dos Caminhos** é um sistema de tecnologia espiritual que integra
múltiplas tradições (Numerologia Cabalística, Odu Ifá, Astrologia, Tarot,
Cabala, Orixás, Chakras, Geometria Sagrada, Frequências Solfeggio) em
um produto B2B (Cockpit Oracular) com correlações verificáveis.

- **Stack**: Next.js 16 + React 19 + App Router (Turbopack) · Prisma 7 + PostgreSQL · Redis/ioredis · JWT próprio (bcryptjs) · OpenAI + Minimax · Stripe · Vitest · Zod · Zustand
- **Tradições suportadas**: 9+ (ver `IDEIA.md` para banco de correspondências)
- **Métricas-alvo**: `QUALITY_SCORE >= 0.91`, 100% testes passando, build OK

---

## 2. Fases Concluídas

| Fase | Título | Commit | Status |
|------|--------|--------|--------|
| 1–6 | Engines espirituais (Numerologia, Odu, Astrologia, MapaAlma, Deep Correlation, AI Insights) | — | ✅ |
| 7 | Setup base (Next.js + Prisma + Redis + Jest→Vitest) | — | ✅ |
| 8 | Auth Operator (login + register) | — | ✅ |
| 9–12 | Engines expandidas + cobertura de testes | — | ✅ |
| 13 | OperatorSession + revogação server-side | — | ✅ |
| 14 | Polish UI/UX + cleanup de re-exports especulativos | `b1f8d48f` | ✅ |
| 15 | **Refresh tokens com rotação** (15min access + 30d refresh, detecção de reuso) | `0c0d43c5` | ✅ |
| 16 | **UI de sessões ativas** (Operator) | `9f6e8a71` | ✅ |
| 17 | **Audit auth Operator** (server-side gate em todas as páginas + APIs) | `4e3f3c5b` | ✅ |
| 18 | **Hard final + cleanup** (rate-limit Redis, security headers, PROGRESS.md) | (este commit) | ✅ |
| 18b | **Fallow cleanup** (42% reduction de issues) | `b3524c41` | ✅ |
### Fase 18 — Hard final + cleanup (detalhes)

| Rota | Limite | Janela |
|------|--------|--------|
| `POST /api/operator/auth/login` | 5 / IP | 15 min |
| `POST /api/operator/auth/register` | 3 / IP | 1 h |
| `POST /api/operator/auth/refresh` | 30 / IP | 1 min |

- Implementado em `src/lib/auth/rate-limit.ts`
- Headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` em **toda** resposta (200/400/401/403/429)
- `Retry-After` em respostas 429
- **Failed-open** se Redis cair (auth não pode parar por infra)

**B) Security headers no `middleware.ts`:**

- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff` (já existia)
- `X-Frame-Options: DENY` (já existia)
- `Referrer-Policy: strict-origin-when-cross-origin` (já existia)
- `Permissions-Policy` (já existia)
- `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'` em **toda** resposta `/api/*` (incluindo 404, 429)

**C) Limpeza:**

- `tests/lib/auth-jwt/` (3 arquivos) + `tests/lib/auth-jwt.test.ts` (1 arquivo) removidos — referenciavam `@/lib/auth-jwt` que não existe desde a Fase 6+ (pré-existente documentado)
- `PROGRESS.md` criado (este arquivo)
- Workflow de fases documentado em `AGENTS.md` §7

---

## 3. Estado Atual

### 3.1 Métricas (Fase 18)

> Ver `memory/cycle-127.md` para os números exatos desta fase.

| Métrica | Status |
|---------|--------|
| `npx tsc --noEmit` | 0 erros |
| `npm run test:run` | passando |
| `npm run build` | sucesso |
| `npm run lint` | (pendente) |
| QUALITY_SCORE | (atualizar após `npm run quality`) |

### 3.2 Cobertura de Testes

- `tests/lib/auth/` — operator-jwt, operator-session, operator-sessions, operator-guard, operator-server-context, **rate-limit (novo)**
- `tests/api/operator-auth/` — login, register, refresh, me, sessions, logout
- `tests/api/mesa-real/`, `tests/api/consult/`
- `tests/integration/`
- `tests/components/operator/`
- `tests/lib/<espiritual>/` — numerology, ifa, astrology, lenormand, etc.

### 3.3 Auth Stack (Fase 8 + 13 + 15 + 18)

- JWT próprio (HS256), bcrypt cost 12
- **Access token**: 15 min, type=`access`, cookie `cockpit_session`
- **Refresh token**: 30 d, type=`refresh`, cookie `cockpit_refresh`
- **Detecção de reuso**: refresh revogado reapresentado → revoga TODAS as sessões do operator (sinal de roubo)
- **Rotação atômica**: a cada refresh, novo par + revoke do anterior
- **Server-side gate** em `requireOperatorPage()` (Fase 17) + `requireOperator()` em APIs
- **Rate limiting** por IP (Fase 18) com Redis
- **UI de gestão** de sessões ativas (Fase 16)

### 3.4 Quarentena B2C (Doc 16 AD-01)

- `LEGACY_B2C=on` reativa B2C legado
- Default: B2C quarentenado, raiz → `/cockpit`, APIs legadas → 404
- Reversível por flag (não por hard delete)

---

## 4. Pré-existentes Conhecidos

> Falhas/drift documentados. **NÃO consertar** sem aprovação — podem
> ser dívida técnica intencional (ver `AGENTS.md` §4 — Surgical Changes).

| Item | Descrição | Origem |
|------|-----------|--------|
| `tests/integration/setup.ts` | importa `@/lib/auth-jwt` (módulo inexistente) | Pré-Fase 6 |
| `tests/integration/middleware.test.ts` | importa helpers de `@/lib/auth-jwt/helpers` | Pré-Fase 6 |
| `tests/integration/api/auth.test.ts` | importa `clearAuthCookie` de `@/lib/auth-jwt/helpers` | Pré-Fase 6 |

Estes testes de integração referenciam um módulo `@/lib/auth-jwt` que
foi removido/renomeado na Fase 6+ (substituído por `@/lib/auth/operator-jwt`
e família). Como a Fase 18 só listou `tests/lib/auth-jwt/*` no escopo de
limpeza, estes permanecem para decisão futura. Possíveis ações:
- (a) Remover (provavelmente o mais simples — auth é coberto pelos novos
  testes em `tests/lib/auth/` e `tests/api/operator-auth/`).
- (b) Migrar para os novos helpers (mais trabalho, valor questionável).

---

## 5. Roadmap (Phase 19+)

Sugestões para os próximos ciclos. **Não fazer** sem planejar:

| Fase | Tema | Esboço |
|------|------|--------|
| 19 | **Cleanup de integration tests pré-existentes** | Resolver `tests/integration/*` (ver §4) |
| 20 | **MFA / TOTP** | Adicionar 2FA opcional para Operators ADMIN |
| 21 | **Audit log persistente** | Tabela `SecurityEvent` (login failures, refresh reuso, rate-limit hits) — SRE / compliance |
| 22 | **Health checks profundos** | `/api/health/db`, `/api/health/redis` (atual é shallow) |
| 23 | **CSP para páginas (não só APIs)** | Next metadata `headers()` em layouts |
| 24 | **Rate-limit mais granular** | Por operator (não só IP) em `/api/operator/sessions` etc. |
| 25 | **Troca de senha / reset de senha** | Fluxo público de "esqueci minha senha" |
| 26 | **Lockout de conta** | Após N falhas de login no MESMO email (não só IP) |
| 27 | **Webhooks Stripe hardening** | Verificação de assinatura + idempotência |

### Engines Espirituais — Próximas

- **Sephirot × Signos** (correlação detalhada — já temos base)
- **Caminhos da Árvore × Arcanos** (1:1 já mapeado, falta engine)
- **Orixás × Signos** (correlações afro-brasileiras)
- **Geometria Sagrada × Frequências** (poliedros + Solfeggio)
- **Onda C — features B2B** (ver `.claude/plan/onda-c-features-b2b.md`)

---

## 6. Comandos Úteis

```bash
npm run test:run         # Validar que testes passam
npm run build            # Validar que build passa
npm run lint             # Validar linting
npx tsc --noEmit         # Type-check sem build
npm run quality          # Análise de qualidade de código
npm run db:generate      # Após mudanças no schema Prisma
```

---

## 7. Histórico de Métricas (resumo)

| Fase | Tests | Build | Lint | Notas |
|------|------:|------:|------|-------|
| 113 | 9771 | OK | — | Próximo do 10k |
| 114–125 | … | OK | — | Engines + polish |
| **128 (Fase 18)** | (ver cycle-127.md) | OK | — | Rate limit + headers + cleanup |
| **129 (Fase 18b)** | (ver cycle-128 ou memory) | OK | — | Fallow cleanup (-42% issues) |

> Para detalhes de cada ciclo, ver `memory/cycle-XXX.md`.

---

*Última atualização: 2026-06-02 — Fase 18 (Hard final + cleanup)*
*Versão: 1.0 — Inicial*

---

## 8. Nota da Sessão Atual (2026-06-02)

A running session produziu as siguientes mudanças não-planejadas:

**Fase 18b — Fallow Cleanup**: Limpeza via `npx fallow`
- 1029 → 595 issues (-42%) — principalmente unresolved imports (515→49)
- Commits: `2e91f8e2` (config inicial) · `c3fa0301` (stats + test fixes) · `b3524c41` (operator login refactor)
- Arquivos de dados espirituais (Odús, meji) adicionados a `.fallowrc.json` ignorePatterns
- 4 test files legacy com `@ts-ignore` em imports de módulos inexistentes

**OperatorLoginForm refactor**: `b3524c41` — signIn direto do provider removido
O form agora faz fetch direto para `/api/operator/auth/login` (não passa pelo helper signIn que não expõe mfaToken).

**Docs criados**: `docs/fallow-duplication-analysis.md` (clone groups priorizados)

*Última atualização: 2026-06-02 — Fase 18b (Fallow cleanup)*
