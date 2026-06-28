# Deliverable — RSS / Atom / JSON Feed (Wave 14)

**Status:** ⚠️ **PARTIAL — code complete, git/tsc verification BLOCKED by shell environment**
**Data:** 2026-06-27
**Sessão:** root (Coder)
**Prazo original:** 15 min

---

## Resumo executivo

| Item | Status | Notas |
|------|--------|-------|
| `src/lib/community/feed.ts` | ✅ Entregue | Helpers compartilhados (escape, formats, prisma) |
| `src/app/feed.xml/route.ts` | ✅ Entregue | RSS 2.0 global |
| `src/app/feed.atom/route.ts` | ✅ Entregue | Atom 1.0 |
| `src/app/feed.json/route.ts` | ✅ Entregue | JSON Feed v1 |
| `src/app/feed/[tradition]/route.ts` | ✅ Entregue | RSS por tradição (12 slugs canônicos) |
| `src/app/layout.tsx` (link alternate) | ✅ Entregue | 3× `<link rel="alternate">` no `<head>` |
| `docs/RSS-W14.md` | ✅ Entregue | Documentação operacional completa |
| `pnpm tsc --noEmit` | ❌ BLOCKED | Shell sandbox não responde a `tsc` / `npx tsc` (timeout 30–180s) |
| `git add` + `git commit` | ❌ BLOCKED | Mesmo padrão — `git status` retorna timeout, `git add -A` timeout 60s |

---

## Por que tsc/git estão BLOCKED

A sessão de bash neste sandbox está intermitente. Padrão observado:

```bash
$ echo a       # OK (responde em <1s)
$ date         # TIMEOUT (15–30s sem resposta)
$ git status   # TIMEOUT (30–300s sem resposta)
$ tsc --ver    # TIMEOUT (15s sem resposta)
$ ls /workspace/cabaladoscaminhos/.git  # TIMEOUT
```

Não é problema do código — é instabilidade do runtime cloud. Documentado aqui
para o verifier não exigir re-execução cega.

### Por que acredito que o código TSC-clean

Os 4 routes + helper seguem patterns já usados no projeto (`src/app/api/posts/route.ts`,
`src/app/api/posts/[id]/route.ts`, `src/app/api/health/route.ts`):

- **Imports** — mesmo estilo (`next/server`, `@/lib/prisma`)
- **Tipos** — `RouteContext { params: Promise<{...}> }` igual ao resto
- **Prisma** — `post.findMany({ where, include, orderBy, take })` com shape `FeedPost` (tipado)
- **NextResponse** — `new NextResponse(xml, { headers })` e `NextResponse.json(body, { headers })`
- **No any / unsafe casts** — todas as funções são estritamente tipadas
- **runtime = 'nodejs'** declarado (não edge, porque usamos Buffer/Prisma)

A única "lib externa" usada pelo JSON Feed é `NextResponse.json`, que já está no
runtime do Next. **Nenhuma instalação foi necessária.**

---

## Verificação manual recomendada (após sandbox estável)

```bash
cd /workspace/cabaladoscaminhos

# 1) Type-check
pnpm tsc --noEmit
# esperado: 0 errors

# 2) Lint dos arquivos novos
pnpm lint src/app/feed.xml src/app/feed.atom src/app/feed.json src/app/feed/[tradition] src/lib/community/feed.ts

# 3) Build (sanidade)
pnpm build

# 4) Smoke test runtime (após build)
pnpm start &
sleep 4
curl -i http://localhost:3000/feed.xml | head -20
curl -i http://localhost:3000/feed.atom | head -20
curl -i http://localhost:3000/feed.json | head -20
curl -i http://localhost:3000/feed/cabala | head -20
curl -i http://localhost:3000/feed/foobar  # esperar 400
kill %1

# 5) Validar XML
curl -s http://localhost:3000/feed.xml  | xmllint --noout -
curl -s http://localhost:3000/feed.atom | xmllint --noout -
curl -s http://localhost:3000/feed.json | jq '.items | length'

# 6) Commit
git add src/lib/community/feed.ts \
        src/app/feed.xml/route.ts \
        src/app/feed.atom/route.ts \
        src/app/feed.json/route.ts \
        'src/app/feed/[tradition]/route.ts' \
        src/app/layout.tsx \
        docs/RSS-W14.md

git commit -m "feat(rss): public feeds for posts and traditions

- /feed.xml  → RSS 2.0 (top 20 posts, qualquer tradição)
- /feed.atom → Atom 1.0 (RFC 4287)
- /feed.json → JSON Feed v1.1
- /feed/[tradition] → RSS filtrado por tradição (12 slugs canônicos)
- <link rel=\"alternate\"> no <head> para auto-discovery
- Cache: s-maxage=300, stale-while-revalidate=600
- Sem libs externas (XML/JSON gerados manualmente)

Refs: Wave 14 — RSS feeds públicos para leitores externos (Feedly, Inoreader, etc)."

# NÃO fazer push (constraint do escopo)
```

---

## Mudanças entregues

### Novos arquivos

```
src/lib/community/feed.ts                   5649 bytes  helpers compartilhados
src/app/feed.xml/route.ts                   4116 bytes  RSS 2.0
src/app/feed.atom/route.ts                  3810 bytes  Atom 1.0
src/app/feed.json/route.ts                  2983 bytes  JSON Feed v1
src/app/feed/[tradition]/route.ts           4463 bytes  RSS por tradição
docs/RSS-W14.md                             8258 bytes  documentação
```

### Arquivos editados

```
src/app/layout.tsx                          +12 linhas  <link rel="alternate"> × 3
```

---

## Decisões técnicas (resumo)

1. **Sem libs externas** — `feed.ts` tem `escapeXml`, `htmlBody`, `plainText`,
   `toRfc822`, `toIso8601`. Tudo manual. Zero `npm install`.
2. **Tradição canônica** — `KNOWN_TRADITIONS` Set em `feed.ts`. Slug inválido
   em `/feed/[tradition]` → 400 JSON (não 200 com feed vazio).
3. **Cache público** — `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`.
   Feeds são públicos por definição.
4. **auto-discovery** — 3× `<link rel="alternate">` no `<head>` (RSS + Atom + JSON)
   para que Feedly/Inoreader detectem sem o usuário abrir o app.
5. **`dynamic = 'force-dynamic'`** + `runtime = 'nodejs'` — garante Prisma
   funciona (não roda em edge runtime).
6. **Limite 20 posts** — alinhado com `getFeed` padrão. Cap defensivo em 50
   mesmo se alguém passar valor maior.

---

## Próximos passos

1. **Verifier humano** executar a sequência "Verificação manual recomendada" acima
2. **Commit** com a mensagem já preparada
3. **Push** quando aprovado (fora do escopo desta task)
4. **Próxima wave (sugestão)**: WebSub hub, feed de artigos, CDN purge on new post

---

> "Honest blocked > fake green. Document the env, deliver the code."
> — pattern estabelecido nas waves 12–13 desta sessão.
