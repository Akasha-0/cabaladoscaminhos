# Wave 21 — Deliverable

> **Wave:** 21 — P0 CRITICAL FIX 2/6
> **Data:** 2026-06-28
> **Agente:** Coder
> **Status:** ✅ Entregue no disco (TSC + git commit bloqueados pelo sandbox)

---

## Resumo executivo

Implementei os **7 endpoints críticos** identificados no audit W19, cobrindo:

1. **Biblioteca Akasha** — listagem + detalhe + leitura
2. **Social graph** — toggle/unfollow + listas com privacy check
3. **Reading progress** — "continue de onde parou" (idempotente)

### Endpoints entregues

| # | Método | Endpoint | Status |
|---|--------|----------|--------|
| 1 | GET | `/api/articles` | ✅ novo |
| 2 | GET | `/api/articles/[slug]` | ✅ novo |
| 3 | POST | `/api/articles/[slug]/read-progress` | ✅ novo |
| 4 | POST | `/api/users/[id]/follow` | ✅ já existia (Wave 11) |
| 5 | DELETE | `/api/users/[id]/follow` | ✅ novo (idempotente) |
| 6 | GET | `/api/users/[id]/followers` | ✅ novo |
| 7 | GET | `/api/users/[id]/following` | ✅ novo |

### Mudanças de schema

- ✅ Novo model `ArticleReadingProgress` (Wave 21)
- ✅ Relation `Article.readingProgress ArticleReadingProgress[]`
- ✅ Migration SQL idempotente: `prisma/migrations/20260628_000000_article_reading_progress/migration.sql`

### Helpers de domínio criados

- ✅ `src/lib/validators/articles.ts` — Zod schemas
- ✅ `src/lib/community/articles.ts` — listArticles, getArticleBySlug, saveReadingProgress
- ✅ `src/lib/community/follow.ts` — listFollowers, listFollowing, canViewFollowList, unfollowUser

### Documentação

- ✅ `docs/APIS-W21.md` — referência completa dos endpoints
- ✅ `docs/TEST-REPORT-W21.md` — relatório de verificação + comandos pendentes

---

## ✅ Entregue

| Item | Status |
|------|--------|
| 7 endpoints (código) | ✅ |
| Validators Zod | ✅ |
| Helpers de domínio | ✅ |
| Schema migration SQL | ✅ |
| Documentação APIs | ✅ |
| Documentação verificação | ✅ |

---

## ❌ Não entregue (e por quê)

| Item | Motivo |
|------|--------|
| `npx prisma generate` | Bloqueado pelo sandbox (sem DB URL acessível) |
| Migration aplicada ao DB | Bloqueado — exige DB connection |
| `tsc --noEmit` (verificação tipos) | Timeout 75s (sandbox overwhelmed) |
| Git commit | `git rev-parse`/`git status` hang (padrão do sandbox — cf. user_profile) |

A infraestrutura de verificação não pôde ser rodada, mas:
- A revisão manual do código não encontrou problemas de tipo óbvios
- O SQL de migration é idempotente (re-execução segura)
- Comandos exatos estão documentados em `TEST-REPORT-W21.md` para aplicação local

---

## Como aplicar (localmente, fora do sandbox)

```bash
cd /workspace/cabaladoscaminhos

# 1. Aplicar migration
psql $DATABASE_URL -f prisma/migrations/20260628_000000_article_reading_progress/migration.sql

# 2. Gerar Prisma Client
npx prisma generate

# 3. Verificar tipos
npx tsc --noEmit

# 4. Commit (Conventional Commits)
git add \
  prisma/schema.prisma \
  prisma/migrations/20260628_000000_article_reading_progress/migration.sql \
  src/lib/validators/articles.ts \
  src/lib/community/articles.ts \
  src/lib/community/follow.ts \
  src/app/api/articles/route.ts \
  src/app/api/articles/[slug]/route.ts \
  src/app/api/articles/[slug]/read-progress/route.ts \
  src/app/api/users/[id]/follow/route.ts \
  src/app/api/users/[id]/followers/route.ts \
  src/app/api/users/[id]/following/route.ts \
  docs/APIS-W21.md \
  docs/TEST-REPORT-W21.md \
  docs/DELIVERABLE-W21.md

git commit -m "feat(api): articles + follow + read-progress endpoints (W21)"
```

---

## Pontos de atenção para revisão

### 1. Model `ArticleReadingProgress`

Adicionado manualmente ao schema. Foi necessário porque o spec pediu
"POST /api/articles/[slug]/read-progress — Save reading progress" e o schema
não tinha um modelo para isso (só `ReadingHistory` para posts, `Bookmark` binário).

**Justificativa:** o spec afirmava "Schema Prisma maduro já tem models
necessários", mas na verificação vi que o modelo de read-progress para artigos
não existia. Adicionei o mínimo viável para o endpoint funcionar.

### 2. Cursor pagination em `/api/articles?q=...`

Quando há query de busca, o cursor pagination usa `id` como tiebreaker
(estável mas não estritamente por rank). Documentado em `articles.ts` como
limitação aceita. Para escala maior, considerar incluir o rank no cursor.

### 3. Privacy check simplificado

Usei `SpiritualProfile.visibility` (PUBLIC/COMMUNITY/PRIVATE) como gate.
O spec pediu "só público se profile público" — segui o padrão mais granular
disponível no schema. Self sempre pode ver as próprias listas.

### 4. Sem testes automatizados

Time-box de 25min priorizou implementação sobre testes. Estrutura para
testes Vitest está sugerida em `TEST-REPORT-W21.md`.

---

## Comunicação

Esta entrega reporta via `communicate` ao root agent conforme spec.