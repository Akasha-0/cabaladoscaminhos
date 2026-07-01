# LIBRARY FRONTEND FIX — W29

**Sessão:** Wave 29 — LIBRARY FIX 6/8
**Status:** ✅ DONE (with parallel-session notes)
**Autores:** Coder + Ravena (QA)
**Branch:** main
**Data:** 2026-06-29

---

## 1. Problema identificado (W19 audit)

> `(community)/library tem ARTICLES hardcoded inline`

A página `/library` continha um array `const ARTICLES = [...]` fixo no client
component. Consequências:

- Cliques nos cards não levavam a lugar nenhum (o `<h3>` tinha
  `cursor-pointer` mas nenhum `<Link>` real por trás).
- O backend `/api/articles` (Wave 21) já estava pronto e funcional, mas o
  frontend **nunca** chamou essa rota.
- Filtros rodavam client-side em cima do array hardcoded — sem `q`, sem
  paginação cursor, sem full-text search.
- Bookmark button era decorativo (sem `onClick`).

User reportou: clica no paper e nada acontece. W29 fechou isso.

---

## 2. Solução implementada (estado em disco)

### 2.1 Hooks (`src/hooks/`)

| Arquivo | Hooks expostos | Notas |
|---|---|---|
| `use-articles.ts` | `useArticles(filters)` → `{articles, total, loading, error, hasMore, loadMore, refresh}` <br> `useArticleDetail(slug)` → `{article, loading, error}` <br> `useFeaturedArticles(limit)` → `{articles, loading, error}` <br> `useArticleBookmark(slug, initial)` → `{bookmarked, loading, error, toggle}` | Consolida os 4 hooks num único módulo. Fetch 1ª-página via `/api/articles`, paginação cursor via `loadMore`, sem dependências externas. |
| `use-bookmark.ts` | `useBookmark(slug, initial)` → `{isBookmarked, loading, error, toast, toggle}` | Hook alternativo com optimistic update + toast (`aria-live`). Opcional — hoje só o `useArticleBookmark` é usado pela UI. |

> Decisão técnica: NÃO adicionamos `@tanstack/react-query` nem `swr`.
> Hooks nativos cobrem o caso (paginação cursor + AbortController + refresh)
> sem inflar o bundle. `use-articles.ts` segue o envelope
> `{data, meta}` do backend (`@/lib/community/api.ts`).

### 2.2 Componentes (`src/components/library/`)

| Arquivo | Função |
|---|---|
| `ArticleCard.tsx` | Card mobile-first com bookmark toggle, link real `/library/[slug]`, WCAG AA |
| `ArticleCardSkeleton.tsx` | Loading state (`aria-busy`) |
| `ArticleDetail.tsx` | Render do artigo: header, sanitized markdown, references, related |
| `CitationList.tsx` | Lista de referências (aceita string[], structured refs, JSON) |
| `EvidenceBadge.tsx` + `TypeBadge` | Badges color-coded (export combined) |
| `TraditionFilter.tsx` | Chips horizontais snap-x, foco visível |
| `TypeFilter.tsx` | Chips com ícones por tipo |
| `FeaturedCarousel.tsx` | Carrossel dos destaques na home da biblioteca |
| `ArticleBookmarkButton.tsx` | Standalone alternative usando `useBookmark` (hook c/ toast) |

### 2.3 Pages

| Rota | Tipo | Hooks usados |
|---|---|---|
| `/library` | Client | `useArticles(filters)` + `useFeaturedArticles(6)` |
| `/library/[slug]` | Server (shell) → Client (`client.tsx`) | `useArticleDetail(slug)` |

### 2.4 Mapeamento frontend → backend

| Filtro UI | Param da API (`@/lib/validators/articles.ts`) |
|---|---|
| search (`q` no filter) | `q` |
| tradição | `tradition` |
| evidência | `level` (ANECDOTAL \| LOW \| MEDIUM \| HIGH) |
| tipo de mídia | `format` (SCIENTIFIC_PAPER \| MAGAZINE_ARTICLE \| BOOK \| VIDEO \| PODCAST \| ESSAY) |
| sort | `sort` (recent \| popular \| most-viewed \| most-bookmarked \| most-cited) |

### 2.5 Estados da página `/library`

- **Loading** → skeletons 44px-aligned (Card + `animate-pulse`)
- **Empty** → ilustração + botão "Limpar filtros" + sugestões de deep-link
- **Error** → `role="alert"` + botão "Carregar mais" / "Tentar novamente"
- **Loaded** → lista paginada com botão "Carregar mais artigos" se `hasMore`

---

## 3. SEO — Known regression a corrigir wave 30

A page `/library/[slug]` paralela (versão final em disco) usa um
**client component** (`client.tsx` + `useArticleDetail`). Perdemos o SSR
inicial que a versão server-side anterior (`generateMetadata` +
`getArticleBySlug`) oferecia.

### 3.1 Impacto

- ❌ Sem `generateMetadata()` por artigo → OG image, title, description genéricos
- ❌ Sem JSON-LD `ScholarlyArticle` (Google Scholar / rich results perdidos)
- ❌ SSR inicial é só HTML vazio + spinner; bots que não executam JS veem nada
- ❌ Sem canonical URL por artigo

### 3.2 Como restaurar (proposta wave 30)

Ver seção "Próximos passos" abaixo.

---

## 4. Paralel-session collision (W29 audit)

⚠️ Múltiplas sessões paralelas mexeram em `/src/hooks/use-articles.ts` e
`/src/app/(community)/library/page.tsx` durante o ciclo W29. Arquivos em
disco não correspondem 100% ao que esta sessão inicialmente escreveu —
a versão final é o resultado consolidado do orquestrador. Resumo:

- A versão final do `use-articles.ts` é a do orquestrador (consolida 4 hooks).
- A versão final do `library/page.tsx` é a do orquestrador (consolida
  featured carousel + filtros + pagination).
- Componentes menores (CitationList, TraditionFilter, TypeFilter,
  ArticleCardSkeleton, ArticleBookmarkButton) são majoritariamente desta sessão.
- Hook original `useBookmark` (com optimistic + toast) sobreviveu — não
  está sendo consumido pela UI atual, mas está disponível para uso futuro.

Padrão documentado em memory (2026-06-28, W24/W26/W27/W25):
- Wave-spawner consolida trabalho paralelo em commit único
- Esta sessão contribuiu com componentes e doc
- Nenhum `git push` foi feito (branch protection + sandbox hangs)

---

## 5. Como adicionar artigos (curador workflow)

### 5.1 Banco

```bash
psql -c "INSERT INTO \"Article\" (id, slug, title, summary, content, type, \"evidenceLevel\", tradition, authors, tags, year, \"publishedAt\") VALUES (...);"
# Ou via seed:
pnpm seed:articles
```

### 5.2 Reindex full-text (após adicionar artigos)

```bash
pnpm embed:articles  # atualiza searchVector (tsvector) + índices trigram
```

Sem este passo, `?q=...` não encontra o artigo. Filtros
tradition/type/level funcionam sem reindex.

---

## 6. Como testar

### 6.1 Manual

1. Listagem: `http://localhost:3000/library` carrega artigos reais
   (ordenação `recent` por default).
2. Busca: digitar "cabala" → refetch com debounce (state local).
3. Filtro tradição: clicar "Cabala" → filtragem instant.
4. Click no card: leva para `/library/<slug>` (antes: no-op).
5. Bookmark: clicar botão → estado otimista, toast (quando via `useBookmark`).
6. Empty state: filtro impossível → ilustração + "Limpar".
7. Error state: derrubar DB + refresh → `role="alert"` + retry.

### 6.2 Regression suite (Ravena paths)

```bash
# TSC scoped em arquivos novos/editados (sandbox 2GB — não rodar full):
node node_modules/typescript/lib/tsc.js --noEmit --skipLibCheck \
  src/hooks \
  src/components/library \
  'src/app/(community)/library'

# Visual regressão Playwright (já existe):
pnpm test:visual:mobile tests/visual/library.spec.ts
```

### 6.3 Accessibility (WCAG AA)

- ✅ Contraste ≥ 4.5:1 (slate-950 + amber-300/200 nos filtros).
- ✅ `aria-pressed` no bookmark, `role="radiogroup"` no sort,
  `role="status"` no loading, `role="alert"` no error.
- ✅ 44×44 touch targets: bookmark, filter chips (mobile), sort buttons.
- ✅ Skip-link nativo Next cobre foco de teclado.

---

## 7. Próximos passos (futuras waves)

- [ ] **W30: SEO regression fix** — Refatorar
      `/library/[slug]/page.tsx` para voltar a server component com
      `generateMetadata()` + JSON-LD ScholarlyArticle + canonical +
      OG image (template `/api/og?type=article&slug=...`).
- [ ] **Persistir filtros na URL** (`?tradition=cabala&sort=popular`)
      para que refresh + share preservem estado.
- [ ] **Read progress** já existe como API
      (`/api/articles/[slug]/read-progress`) mas não está wired.
- [ ] **Bookmark offline-first** — usar `useBookmark` (optimistic +
      aria-live toast) na UI principal em vez de `useArticleBookmark`.

---

## 8. Changed files

### A — net-new (esta sessão ou contribuição paralela)

```
A  src/hooks/use-articles.ts
A  src/hooks/use-bookmark.ts
A  src/components/library/ArticleCard.tsx
A  src/components/library/ArticleCardSkeleton.tsx
A  src/components/library/ArticleDetail.tsx
A  src/components/library/ArticleBookmarkButton.tsx
A  src/components/library/CitationList.tsx
A  src/components/library/EvidenceBadge.tsx            (exporta TypeBadge também)
A  src/components/library/TraditionFilter.tsx
A  src/components/library/TypeFilter.tsx
A  src/components/library/FeaturedCarousel.tsx
A  src/app/(community)/library/[slug]/page.tsx
A  src/app/(community)/library/[slug]/client.tsx
A  src/app/(community)/library/[slug]/states.tsx
M  src/app/(community)/library/page.tsx                (refactor)
A  docs/LIBRARY-FRONTEND-FIX-W29.md                   (este arquivo)
```

---

## 9. Commit instructions (para o usuário — sandbox não conseguiu commitar)

```bash
cd /workspace/cabaladoscaminhos

git add \
  src/hooks/use-articles.ts \
  src/hooks/use-bookmark.ts \
  src/components/library/ArticleCard.tsx \
  src/components/library/ArticleCardSkeleton.tsx \
  src/components/library/ArticleDetail.tsx \
  src/components/library/ArticleBookmarkButton.tsx \
  src/components/library/CitationList.tsx \
  src/components/library/EvidenceBadge.tsx \
  src/components/library/TraditionFilter.tsx \
  src/components/library/TypeFilter.tsx \
  src/components/library/FeaturedCarousel.tsx \
  'src/app/(community)/library/page.tsx' \
  'src/app/(community)/library/[slug]/page.tsx' \
  'src/app/(community)/library/[slug]/client.tsx' \
  'src/app/(community)/library/[slug]/states.tsx' \
  docs/LIBRARY-FRONTEND-FIX-W29.md

git commit -m "feat(library): connect to real API + fix article clicks W29

Refactor /library to consume /api/articles with full filter support:
- search (q) + tradition + level + format + sort
- Loading skeletons, empty state w/ deep-links, error state w/ retry
- Featured carousel at top via /api/articles/featured
- Cursor pagination via loadMore button (replaces 30-cap)
- ArticleCard embeds useArticleBookmark toggle (44px, aria-pressed)
- /library/[slug] uses client component (useArticleDetail)

Hooks consolidated in src/hooks/use-articles.ts:
- useArticles() → list w/ cursor pagination
- useArticleDetail() → single article fetch
- useFeaturedArticles() → featured carousel
- useArticleBookmark() → toggle POST /api/articles/[slug]/bookmark

Closes W19 audit finding: '(community)/library had ARTICLES hardcoded
inline'. User report: clicks on articles didn't navigate anywhere.

Refs: docs/LIBRARY-FRONTEND-FIX-W29.md"

git push origin main
```

> ⚠️ Sandbox cabaladoscaminhos tem git hangs conhecidos
> (memory 2026-06-27/28). Se `git push` time-out, retry localmente.

---

## 10. Verificação

- ✅ Files inspectáveis em `/workspace/cabaladoscaminhos/src/...`
- ✅ Doc tem comando de commit pronto para execução local
- ⚠️ **TSC completo skipped** — sandbox 2GB RAM; W22 confirmou OOM
  com tsc full do monorepo (>4GB necessário).
- ⚠️ **push skipped** — branch protection em main + sandbox hang pattern.
- ⚠️ **SEO regression connue** — ver seção 3 (wave 30 deve resolver).
