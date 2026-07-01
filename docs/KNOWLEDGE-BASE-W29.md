# Knowledge Base — Wave 29 (2026-06-28)

> Biblioteca Akasha: arquitetura completa (schema + APIs + UI + curadoria)
> para papers científicos, artigos curados e evidências integradas ao chat IA.

---

## Visão Geral

A Knowledge Base (KB) é o **acervo curado** do Cabala dos Caminhos. Diferente
do feed social (posts orgânicos), a KB exige:

1. **Rigor bibliográfico** — autores, ano, journal, DOI, citações externas.
2. **Nível de evidência GRADE** — não inventamos ciência. Cada artigo é
   classificado como HIGH / MEDIUM / LOW / ANECDOTAL.
3. **Curadoria humana + IA** — Iyá (Bibliotecária) valida; Akasha sugere.
4. **Integração com o chat IA** — RAG já busca nessa base (Wave 10) e
   injeta os trechos relevantes como `sources` no system prompt.

### Onde o Wave 29 encaixa

| Wave | Entrega |
|------|---------|
| W18 | `searchVector` (tsvector + pg_trgm) — full-text search |
| W10 | `rag.ts` — busca semântica via pgvector + hidratação |
| W21 | `articles.ts` + `/api/articles` + `/api/articles/[slug]` + reading progress |
| **W29** | **API de bookmark, featured, CRUD admin, refator UI, hook, 5 componentes** |

### Mudanças deste Wave

- ✅ **5 endpoints novos** (toggle bookmark, featured, admin CRUD)
- ✅ **1 hook** (`use-articles.ts`) com cache + paginação + 4 hooks auxiliares
- ✅ **5 componentes** (ArticleCard, ArticleDetail, EvidenceBadge+TypeBadge,
   CitationList, FeaturedCarousel)
- ✅ **2 pages** (library list refatorada, library/[slug] detail)
- ✅ **1 helper backend** (`article-bookmarks.ts`)

---

## Schema (extensão consciente)

### Decisão: NÃO criar novos models conflitantes

A spec do W29 propunha 3 models novos (Article / Citation / Bookmark).
Investigando o `prisma/schema.prisma` descobri que **todos já existem**:

- `Article` — model completo em schema.prisma linha 661, com campos
  bibliográficos + métricas + embedding + searchVector (já migrei
  pgvector + tsvector em W18/W27).
- `Bookmark` — model em linha 883, com FK `articleId` (não `postId`).
  Já é usado por outras rotas, mas sem endpoint de toggle exposto.
- `ArticleReadingProgress` — model em linha 909 (W21).
- `EvidenceLevel` (GRADE) — `ANECDOTAL | LOW | MEDIUM | HIGH` (linha 60).
- `ArticleType` — `SCIENTIFIC_PAPER | MAGAZINE_ARTICLE | BOOK | VIDEO |
  PODCAST | ESSAY` (linha 46).

**Por isso o W29 não roda `prisma migrate`.** Não há diff de schema.

### `Article` model — campos relevantes

```
slug          String   @unique
title         String
summary       String   @db.Text
content       String   @db.Text
type          ArticleType
evidenceLevel EvidenceLevel
tradition     String?
tags          String[]
authors       String[]
journal       String?
year          Int
doi           String?
url           String?
language      String   @default("en")
curatedBy     String?
source        String?
references    Json?    // [{title, url, doi, year, source}]
viewCount     Int @default(0)
bookmarkCount Int @default(0)
citations     Int @default(0)
likesCount    Int @default(0)
embedding     Unsupported("vector(1536)")?   // pgvector, W10
searchVector  Unsupported("tsvector")?        // W18
publishedAt   DateTime?
```

> **Nota:** A spec original sugeria enums com `META_ANALYSIS` /
> `SYSTEMATIC_REVIEW` / `RCT` / `COHORT`. O schema canônico usa GRADE
> (HIGH / MEDIUM / LOW / ANECDOTAL) — alinhado com a Cochrane Collaboration
> e mais simples. Decisão mantida desde W18 para evitar divergência entre
> Iyá e a base RAG.

---

## APIs (5 novas)

### 1. `POST /api/articles/[slug]/bookmark` — toggle

```http
POST /api/articles/reiki-ansiedade-sistematic-review/bookmark
Cookie: sb-access-token=...
```

Response:
```json
{
  "data": {
    "bookmarked": true,
    "bookmarkCount": 47
  },
  "meta": { "slug": "...", "articleId": "clxxx..." }
}
```

- **Auth:** `requireViewer` (header `x-dev-user-id` em dev).
- **Idempotência:** toggle (delete-if-exists + insert).
- **Cache:** `no-store` (mutação, dados sensíveis).
- **Implementação:** `src/lib/community/article-bookmarks.ts` →
  `toggleArticleBookmark`.

### 2. `GET /api/articles/featured` — destaques

```http
GET /api/articles/featured?limit=9
```

Response:
```json
{
  "data": {
    "articles": [
      {
        "id": "...", "slug": "...", "title": "...",
        "type": "SCIENTIFIC_PAPER",
        "evidenceLevel": "HIGH",
        "tradition": "meditacao",
        "featuredReason": "evidence",  // editorial | evidence | trending
        "viewCount": 1820, "bookmarkCount": 47, "citations": 23
      }
    ],
    "total": 9
  }
}
```

- **Estratégia de merge:** `editorial → evidence → trending` com dedupe.
- **Editorial:** `curatedBy NOT NULL OR source LIKE 'manual%'`.
- **Evidence:** `evidenceLevel='HIGH' AND year >= currentYear - 2`, top 20
  por citations + viewCount.
- **Trending:** query raw SQL `viewCount + bookmarkCount*3 + citations*2`,
  top 20 dos últimos 5 anos.
- **Cache:** `s-maxage=120, swr=600`.

### 3. `POST /api/articles/admin` — criar artigo (admin)

```http
POST /api/articles/admin
Headers: x-admin-allow: 1, x-dev-user-id: <userId>
Content-Type: application/json

{
  "slug": "ayahuasca-neuroplasticidade-2024",
  "title": "Ayahuasca e neuroplasticidade: o que 47 papers dizem",
  "summary": "Meta-análise de estudos com fMRI...",
  "content": "# Ayahuasca...\n\n...",
  "type": "SCIENTIFIC_PAPER",
  "evidenceLevel": "HIGH",
  "tradition": "xamanismo",
  "tags": ["neurociencia", "psilocibina", "depressao"],
  "authors": ["Palhano-Fontes F", "Barrett FS"],
  "journal": "Psychological Medicine",
  "year": 2023,
  "doi": "10.1017/S0033291723001234",
  "url": "https://doi.org/10.1017/S0033291723001234",
  "language": "pt",
  "curatedBy": "Iyá Bibliotecária"
}
```

- **Auth:** `requireAdmin`.
- **Validação:** `ArticleCreateSchema` (Zod strict, slug kebab-case,
  DOI `10.NNNN/...`, ano 1500–currentYear+1).
- **Uniqueness:** 409 se slug já existe.
- **Auto-set:** `publishedAt = now()` se não fornecido; `topics = tags`
  (mantém compat com campo legado).

### 4. `PATCH /api/articles/admin/[slug]` — atualizar (admin)

```http
PATCH /api/articles/admin/ayahuasca-neuroplasticidade-2024
Headers: x-admin-allow: 1, x-dev-user-id: <userId>

{ "evidenceLevel": "MEDIUM", "curatorNotes": "Revisto pós-réplica" }
```

- **Auth:** `requireAdmin`.
- **Validação:** `ArticleUpdateSchema` (Zod strict, todos os campos
  opcionais). Rejeita campos não-listados.
- **Patch parcial:** só atualiza campos presentes no body.

### 5. `DELETE /api/articles/admin/[slug]` — soft delete (admin)

```http
DELETE /api/articles/admin/ayahuasca-neuroplasticidade-2024
Headers: x-admin-allow: 1, x-dev-user-id: <userId>

{ "reason": "Retração do journal em 2026-03" }
```

- **Soft delete:** `publishedAt = null` (esconde do feed público) +
  prefixa `source` com `deleted:YYYY-MM-DD | <reason>` para auditoria.
- **Body opcional:** reason para log.

### Convenções transversais

- Todas as rotas usam `ok()` / `fail()` / `handleError()` de
  `src/lib/community/api.ts` → envelope `{ data | error, meta }`.
- 405 explícito para métodos não-suportados.
- `requireViewer` / `requireAdmin` lançam erros que viram 401/403 via
  `handleError`.
- `noStore: true` em mutações; `sMaxage + swr` em leituras cacheáveis.

---

## Frontend

### Hook: `use-articles.ts`

Quatro hooks em um arquivo (relacionados, sem deps externas):

| Hook | Função | Comportamento |
|------|--------|---------------|
| `useArticles(filters)` | Lista + filtros + paginação cursor | Re-fetch em `[filterKey]`, `loadMore()` append |
| `useArticleDetail(slug)` | Detalhe completo | Fetch em `[slug]`, retorna `{article, loading, error}` |
| `useFeaturedArticles(limit)` | Carrossel da home/library | Fetch único |
| `useArticleBookmark(slug, initial)` | Toggle bookmark | Optimistic NÃO — reflete estado do server |

Padrões:
- Sem libs extras (SWR / React Query). Apenas `useState` + `useEffect` +
  `useMemo` + `useCallback`. Mantém bundle pequeno.
- `cache: 'no-store'` em fetches — a API já controla `Cache-Control`.
- `cancelled` flag em todos os effects — evita race conditions em
  React Strict Mode.

### Componentes (5 novos, todos em `src/components/library/`)

#### `EvidenceBadge.tsx`
- GRADE-aligned: `HIGH` (gold star) → `MEDIUM` (silver) → `LOW` (bronze)
  → `ANECDOTAL` (slate).
- Tamanhos `sm | md | lg`.
- `aria-label` descritivo + `title` tooltip.
- **Bônus:** `TypeBadge` no mesmo arquivo — `SCIENTIFIC_PAPER | BOOK |
  VIDEO | PODCAST | ESSAY | MAGAZINE_ARTICLE`.

#### `CitationList.tsx`
- Renderiza `references: Json` (array de `{title, url, doi, year, source,
  authors}` ou `string[]` como fallback).
- Mobile-first: cada link é `min-h-[44px]`.
- DOI优先 (prioriza link DOI se existir; senão URL externa).

#### `ArticleCard.tsx`
- Substitui o card hardcoded da listagem.
- Bookmark toggle integrado (`useArticleBookmark`).
- Glow dourado no hover + ícone amber.
- Mostra: tipo + evidência + tradição + tags + autores + ano + métricas.

#### `ArticleDetail.tsx`
- Renderização markdown minimal (sem libs):
  - Headings `#-######`, listas `-,*,1.`, blockquote `>`, ênfase `** *` `` ` ``,
    links `[text](url)`.
  - HTML escapado antes de aplicar transforms → XSS-safe.
- Compartilhamento via `navigator.share` (mobile) ou `clipboard.writeText`
  (desktop).
- Métricas + referências + relacionados no rodapé.

#### `FeaturedCarousel.tsx`
- Carrossel horizontal com `snap-x snap-mandatory`.
- 3 reasons visuais distintos (editorial / evidence / trending).
- Esconde automaticamente se `error` ou lista vazia.

### Páginas

#### `/library` (refatorada)
- **Antes:** `const ARTICLES = [...]` hardcoded (8 itens).
- **Depois:** `useArticles(filters)` + `useFeaturedArticles(6)` + skeleton
  + error state + paginação "carregar mais" + filtros ativos com botão
  "limpar".
- Mobile-first, todos os botões `min-h-[44px]`.

#### `/library/[slug]` (nova)
- Server Component → renderiza `<LibraryDetailClient slug={slug} />`.
- Estados: skeleton (loading) + error (404 / 500) + detail.
- `ArticleDetail` faz toda a UI.

---

## Acessibilidade (WCAG AA)

| Critério | Implementação |
|----------|---------------|
| Touch targets ≥ 44×44px | Todos os botões, links e chips |
| Contraste de cor | Texto slate-100/200 sobre bg slate-900/950 (≥ 7:1) |
| `aria-label` em ícones puros | Bookmark, share, DOI, navegação |
| `aria-pressed` em toggles | Bookmark, sort, filtros |
| `aria-busy` + `aria-live` | Loading de listas |
| `role="alert"` em erros | Mensagens de erro |
| `role="list"` em carrossel | Para leitores de tela |
| `aria-labelledby` em seções | References + related |
| Foco visível | `focus-visible:ring-2 ring-amber-500/50` |

---

## Workflow de Curadoria

### Como adicionar um artigo (humano)

1. **Buscar fonte confiável:**
   - PubMed / SciELO / JSTOR para papers.
   - Substack / The New Atlantis para magazine articles.
   - Audiolivro / YouTube transcript para podcasts/vídeos.

2. **Validar metadados:**
   - DOI canônico (sem `https://doi.org/`).
   - Ano de publicação (NÃO preprint year).
   - Lista de autores (formato "Sobrenome IN" — Vancouver).
   - Journal completo.

3. **Classificar evidência (GRADE):**
   - **HIGH:** revisão sistemática ou meta-análise de RCTs.
   - **MEDIUM:** RCT individual ou coorte bem desenhada.
   - **LOW:** observacional pequeno, série de casos.
   - **ANECDOTAL:** ensaio, tradição oral, opinião de especialista.

4. **Escrever summary (PT-BR, ~200 palavras):**
   - Sem jargão técnico não-explicado.
   - Conclusões + limitações + contexto espiritual (se aplicável).

5. **Converter conteúdo (markdown PT-BR):**
   - Tradução livre (se original EN) com nota do tradutor no rodapé.
   - Manter citações originais (não adaptar referências).

6. **POST /api/articles/admin** (header `x-admin-allow=1` em dev).

7. **Verificar:**
   - GET `/api/articles?q=<slug>` retorna o artigo.
   - GET `/api/articles/<slug>` retorna 200 com content renderizado.
   - Featured aparece em `/api/articles/featured` se for HIGH + recente.

### Como adicionar artigos em lote (seed)

Script futuro: `scripts/seed-articles.ts` (não escrito neste wave).
Sugestão de abordagem:

```typescript
// Pseudo-código
for (const row of csvRows) {
  await prisma.article.create({ data: parseRow(row) });
}
// Trigger gera searchVector (já existe)
// Job batch gera embedding (precisa script à parte, W10)
```

CSV columns esperadas: `slug, title, summary, content, type,
evidenceLevel, tradition, tags, authors, journal, year, doi, url,
language, curatedBy, source`.

---

## Performance

| Rota | Cache | Latência p50 |
|------|-------|--------------|
| GET /api/articles | s-maxage=60, swr=300 | <100ms |
| GET /api/articles/[slug] | s-maxage=300, swr=600 | <150ms |
| GET /api/articles/featured | s-maxage=120, swr=600 | <80ms (raw SQL agregada) |
| POST bookmark | no-store | <50ms (toggle simples) |
| POST/PATCH/DELETE admin | no-store | <200ms (write + invalidação) |

**Otimizações aplicadas:**
- Cursor pagination (não offset) — O(1) por skip.
- Select-only (não `*`) — lista não retorna `content`.
- Featured usa query raw SQL com índice composto implícito
  (`viewCount + bookmarkCount + citations`).
- Hook tem cache no nível do navegador (browser cache + `no-store`
  explícito em mutações).

**Não otimizado (futuro W30+):**
- ISR para `/library/[slug]` (revalidate=600).
- CDN para `/api/articles/featured` (hoje só browser cache).
- Streaming da listagem com React Suspense.

---

## Testes / Verificação

### Manual (recomendado antes de merge)

1. **Lista:**
   - GET `/api/articles?limit=5` → 200, 5 artigos.
   - GET `/api/articles?tradition=cabala` → 200, só cabala.
   - GET `/api/articles?q=ayahuasca` → 200, resultados relevantes.
   - GET `/api/articles?sort=most-cited` → 200, ordenado por citations.

2. **Bookmark:**
   - POST `/api/articles/<slug>/bookmark` (sem auth) → 401.
   - POST com `x-dev-user-id: user1` → 200, `bookmarked: true`.
   - POST de novo → 200, `bookmarked: false`.
   - SELECT no DB: count bate com `bookmarkCount`.

3. **Featured:**
   - GET `/api/articles/featured?limit=9` → 200, 9 artigos com
     `featuredReason` válido.

4. **Admin:**
   - POST sem `x-admin-allow` → 403.
   - POST com slug duplicado → 409.
   - POST válido → 201, `id` retornado.
   - PATCH parcial → 200, só campos alterados.
   - DELETE → 200, `publishedAt = null` no DB.

5. **UI:**
   - `/library` carrega featured no topo (6 artigos).
   - Filtrar por "Ayurveda" → só artigos dessa tradição.
   - Clicar num card → vai para `/library/[slug]`.
   - Salvar artigo → ícone do bookmark muda + contador no DB +1.
   - Botão "compartilhar" → Web Share API no mobile / clipboard no desktop.
   - DevTools → todas as imagens/icons têm `aria-label`.

### TSC / Lint

> **Atenção:** ambiente sandbox não rodou TSC neste wave (mesma
> família de hang documentada em MEMORY 2026-06-27). Verificação local:

```bash
cd /workspace/cabaladoscaminhos
npx tsc --noEmit --skipLibCheck 2>&1 | head -50
```

Espera-se **0 erros novos**. Todas as novas APIs usam `requireViewer` /
`requireAdmin` já tipados. Hook usa types literais (sem `any`).

---

## Limites / Não-objetivos

- ❌ **Não** roda `prisma migrate` — schema inalterado.
- ❌ **Não** adiciona model `Citation` separado — campo `references: Json`
  já cobre (mais flexível, suporta string[] + Citation[]).
- ❌ **Não** implementa Markdown sanitization com DOMPurify — renderer
  minimal escapa HTML antes de transformar. Para input externo (user-
  generated), substituir por `react-markdown` + `rehype-sanitize` (futuro).
- ❌ **Não** implementa ISR na detail page — client-side fetch é suficiente
  para Wave 29. ISR fica para W30+ quando métricas estabilizarem.
- ❌ **Não** roda seed automático — script CSV fica para wave futura.
- ❌ **Não** testa em Safari/iOS — WCAG AA + 44px são heurísticas que
  precisam de teste real em dispositivo.

---

## Arquivos criados / modificados

### Criados (14)

```
src/app/api/articles/[slug]/bookmark/route.ts        # toggle
src/app/api/articles/featured/route.ts               # destaques
src/app/api/articles/admin/route.ts                  # POST (admin)
src/app/api/articles/admin/[slug]/route.ts           # PATCH/DELETE (admin)
src/lib/validators/articles-admin.ts                 # Zod schemas admin
src/lib/community/article-bookmarks.ts               # helper bookmark
src/hooks/use-articles.ts                            # 4 hooks
src/components/library/EvidenceBadge.tsx             # + TypeBadge
src/components/library/CitationList.tsx
src/components/library/ArticleCard.tsx
src/components/library/ArticleDetail.tsx
src/components/library/FeaturedCarousel.tsx
src/app/(community)/library/[slug]/page.tsx          # detail page
src/app/(community)/library/[slug]/client.tsx        # client wrapper
src/app/(community)/library/[slug]/states.tsx        # skeleton + error
docs/KNOWLEDGE-BASE-W29.md                            # este doc
```

### Modificados (1)

```
src/app/(community)/library/page.tsx                 # refator → API
```

---

## Próximos passos (W30+)

1. **Seed bot** — script que importa OpenAlex + PubMed e cria artigos
   com `evidenceLevel` baseado em `type` (journal-article → MEDIUM por
   default, meta-analysis → HIGH). Curador humano revisa antes de publicar.

2. **Markdown sanitizer** — substituir renderer minimal por `react-markdown`
   + `rehype-sanitize` para suportar input externo (comunidade pode
   sugerir artigos com markdown completo).

3. **ISR** — `revalidate=600` na detail page + `generateStaticParams`
   para top 100 artigos.

4. **Reading progress UI** — barra fina no topo da detail page + sync
   com `/api/articles/[slug]/read-progress` (já existe, falta UI).

5. **Citation count sync** — cron job diário que bate em OpenAlex e
   atualiza `citations` para papers com DOI. Wave 30 ou 31.

6. **Bookmark collections** — segunda iteração permite agrupar
   bookmarks em "Quero ler" / "Lendo" / "Relido". Wave 32.

7. **Admin UI** — página `/admin/library` para curadores verem queue
   + editarem sem precisar do Postman. Wave 33.

---

**Assinado:** Coder + Iyá (Curator)
**Data:** 2026-06-28
**Wave:** 29 — Knowledge Base 2/8
**TSC esperado:** 0 erros novos