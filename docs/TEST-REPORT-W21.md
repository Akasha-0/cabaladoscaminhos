# Wave 21 — Test Report

> **Data:** 2026-06-28
> **Wave:** 21 — P0 CRITICAL FIX 2/6 (4 APIs faltantes)
> **Status final:** ⚠️ Implementação completa — TSC + git commit bloqueados pelo sandbox

---

## Resumo executivo

A implementação dos 7 endpoints está **completa no disco**. A verificação estática
(TypeScript) e o commit git estão **bloqueados por timeout do sandbox**, padrão
conhecido neste repo (cf. user_profile 2026-06-27 sobre git hangs intermitentes).

| Verificação | Status | Detalhes |
|-------------|--------|----------|
| Arquivos criados/modificados | ✅ | 7 endpoints + 2 helpers + 1 validator + 1 doc + 1 migration SQL + schema.prisma update |
| TypeScript check (`tsc --noEmit`) | ❌ BLOCKED | Timeout 75s (consistente) — sandbox overwhelmed |
| Prisma generate | ❌ NOT RUN | `npx prisma generate` requer DB URL + cliente já gerado |
| Migration SQL aplicada | ❌ NOT RUN | `psql $DATABASE_URL -f ...` requer DB |
| Git commit | ❌ BLOCKED | `git status`/`git add` hangs (padrão do sandbox) |

---

## 1. TSC timeout — análise

Comandos tentados (todos com timeout 60-75s):

```bash
npx tsc --noEmit
npx --no-install tsc --noEmit -p .
npx --no-install tsc --noEmit --skipLibCheck src/lib/validators/articles.ts
node node_modules/typescript/bin/tsc --noEmit
```

Todos retornaram timeout. O sandbox tem pressão de memória/disco no momento
da execução. Esse padrão é consistente com a nota no user_profile (2026-06-27):
"git operations intermittently hang in cabaladoscaminhos sandbox".

### Recomendação para follow-up

```bash
cd /workspace/cabaladoscaminhos
npx prisma generate
npx tsc --noEmit
# Se houver erros de tipo, ver lista abaixo
```

### Erros de tipo antecipados (manual review)

Fiz uma revisão manual dos arquivos. Possíveis issues:

#### 1. `prisma.follow.findUnique` no follow DELETE

```ts
const existing = await prisma.follow.findUnique({
  where: {
    followerId_followedId: {
      followerId: viewer.id,
      followedId,
    },
  },
});
```

O compound key `@@id([followerId, followedId])` gera o nome
`followerId_followedId` automaticamente. **Esperado OK**.

#### 2. `prisma.article.findUnique({ where: { slug } })`

`slug` tem `@unique` no schema. **Esperado OK**.

#### 3. `prisma.articleReadingProgress.upsert` com compound unique

```ts
where: {
  userId_articleId: { userId, articleId },
}
```

O `@@unique([userId, articleId])` gera `userId_articleId`. **Esperado OK**.

#### 4. `Prisma.Sql` com template strings

```ts
Prisma.sql`AND a.id < ${decoded.id}`
```

Pattern padrão do projeto (já usado em `lib/community/search.ts`). **Esperado OK**.

#### 5. `$queryRaw` typing

```ts
prisma.$queryRaw<Array<{...}>>(Prisma.sql`SELECT ...`)
```

Pattern padrão. **Esperado OK**.

---

## 2. Migration SQL — pendente

Arquivo: `prisma/migrations/20260628_000000_article_reading_progress/migration.sql`

Aplicar manualmente:

```bash
cd /workspace/cabaladoscaminhos
psql $DATABASE_URL -f prisma/migrations/20260628_000000_article_reading_progress/migration.sql
npx prisma generate
```

O SQL é idempotente (usa `CREATE TABLE IF NOT EXISTS`).

---

## 3. Git commit — pendente

Git operations hang no sandbox deste repo (padrão documentado).

Comando para aplicar localmente:

```bash
cd /workspace/cabaladoscaminhos
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
  docs/TEST-REPORT-W21.md

git commit -m "feat(api): articles + follow + read-progress endpoints (W21)

- GET /api/articles (lista + filtros + full-text search)
- GET /api/articles/[slug] (detalhe + related)
- POST /api/articles/[slug]/read-progress (idempotente)
- DELETE /api/users/[id]/follow (unfollow idempotente)
- GET /api/users/[id]/followers (com privacy check)
- GET /api/users/[id]/following (com privacy check)
- Adiciona model ArticleReadingProgress + migration SQL
- Docs: APIS-W21.md
"
```

---

## 4. Arquivos da entrega

### Criados

| Arquivo | Linhas | Função |
|---------|--------|--------|
| `src/lib/validators/articles.ts` | 95 | Zod schemas (article list, read-progress, follow list) |
| `src/lib/community/articles.ts` | 580 | Backend helpers (list, detail, view++, read-progress) |
| `src/lib/community/follow.ts` | 280 | Backend helpers (followers, following, privacy, unfollow) |
| `src/app/api/articles/route.ts` | 70 | GET /api/articles |
| `src/app/api/articles/[slug]/route.ts` | 65 | GET /api/articles/[slug] |
| `src/app/api/articles/[slug]/read-progress/route.ts` | 95 | POST /api/articles/[slug]/read-progress |
| `src/app/api/users/[id]/followers/route.ts` | 75 | GET /api/users/[id]/followers |
| `src/app/api/users/[id]/following/route.ts` | 70 | GET /api/users/[id]/following |
| `prisma/migrations/20260628_000000_article_reading_progress/migration.sql` | 65 | Schema migration |
| `docs/APIS-W21.md` | 380 | API documentation |
| `docs/TEST-REPORT-W21.md` | este | Test/verification report |

### Modificados

| Arquivo | Mudança |
|---------|---------|
| `prisma/schema.prisma` | + `ArticleReadingProgress` model + relation `readingProgress ArticleReadingProgress[]` em `Article` |
| `src/app/api/users/[id]/follow/route.ts` | + DELETE handler (idempotente unfollow) |

---

## 5. Testes manuais sugeridos (pós-deploy)

```bash
# 1. Listar artigos
curl -s "http://localhost:3000/api/articles?limit=5" | jq

# 2. Detalhe de artigo
curl -s "http://localhost:3000/api/articles/mbsr-meta-analysis-2019" | jq

# 3. Read-progress (precisa de auth)
curl -X POST "http://localhost:3000/api/articles/mbsr-meta-analysis-2019/read-progress" \
  -H "Content-Type: application/json" \
  -H "x-dev-user-id: test-user" \
  -d '{"percentRead": 65, "lastPosition": "p12"}'

# 4. Followers list (precisa de profile público)
curl -s "http://localhost:3000/api/users/user-abc/followers?limit=10" | jq

# 5. Toggle follow (precisa de auth)
curl -X POST "http://localhost:3000/api/users/user-abc/follow" \
  -H "x-dev-user-id: test-user"

# 6. Unfollow idempotente
curl -X DELETE "http://localhost:3000/api/users/user-abc/follow" \
  -H "x-dev-user-id: test-user"
```

---

## 6. Próximos passos

1. **Aplicar migration** (ver seção 2)
2. **Rodar `prisma generate`** (regenera tipos do cliente)
3. **Rodar `npx tsc --noEmit`** localmente — corrigir qualquer erro real
4. **Aplicar commit** (ver seção 3)
5. **Smoke test** com curl (seção 5)
6. **Adicionar testes Vitest** (recomendado, não bloqueante):
   - `tests/api/articles-list.spec.ts`
   - `tests/api/articles-detail.spec.ts`
   - `tests/api/read-progress.spec.ts`
   - `tests/api/follow.spec.ts`