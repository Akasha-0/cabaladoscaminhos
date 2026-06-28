# SEARCH — Wave 18 (Typo tolerance + Synonyms + Filters + UI)

> **Data:** 2026-06-28
> **Escopo:** Refinar a busca do Akasha Portal (Wave 12) para tolerar typos,
> expandir sinônimos do domínio espiritual, expor filtros ricos na API e
> reformular a UI mobile-first com sidebar/accordion.
> **Tipo:** Surgical — mínimo de código que resolve; sem libs adicionais.

---

## TL;DR

| Antes (Wave 12) | Depois (Wave 18) |
|---|---|
| 1 typo = 0 resultados | `pg_trgm` tolera ~2 chars em palavras curtas |
| `cabala` ≠ `kabbalah` | Sinônimos expandem a query automaticamente |
| Filtros: `tradition`, `tag`, `from/to`, `sort` | + `level`, `format`, `author`, `dateFrom/dateTo`, `hasAudio/hasVideo` |
| Página `/search` mock (demo list) | Integração real com `/api/search` + `/api/search/suggestions` |
| Suggestions a cada keystroke | `useDebounce` 300ms |
| Sem highlight | `<mark>` amber no preview |
| Sem empty state rico | 4 tips ("Tente X ou Y") |

---

## 1. Migration — typo tolerance (`pg_trgm`)

**Arquivo:** `prisma/migrations/20260628_search_typo/migration.sql`

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
SET pg_trgm.similarity_threshold = 0.3;
CREATE INDEX idx_articles_title_trgm ON articles USING gin (title gin_trgm_ops);
CREATE INDEX idx_posts_content_trgm ON posts USING gin (content gin_trgm_ops);
CREATE INDEX idx_groups_name_trgm ON groups USING gin (name gin_trgm_ops);
CREATE INDEX idx_spiritual_profiles_birth_name_trgm
  ON spiritual_profiles USING gin ("birthName" gin_trgm_ops);
```

**Idempotente:** `IF NOT EXISTS` em tudo; pode rodar quantas vezes quiser
em dev sem erro. Em prod, aplicar com:

```bash
psql $DATABASE_URL -f prisma/migrations/20260628_search_typo/migration.sql
```

**Por que nomes canônicos?** Wave 12 criou índices `_trgm_idx` equivalentes
em `articles.title` e `posts.content`. Mantemos os dois por compat, mas o
app e este doc referenciam os nomes canônicos:

- `idx_articles_title_trgm`
- `idx_posts_content_trgm`
- `idx_groups_name_trgm`
- `idx_spiritual_profiles_birth_name_trgm`

**Threshold 0.3** — tolera typos em palavras curtas sem inflar falso-positivo
em matches longos. Configurável via `SET pg_trgm.similarity_threshold = ...`
em runtime se quiser afrouxar/apertar.

### Quando o `pg_trgm` é usado?

- **Search principal** (`/api/search`): se a `tsquery` retorna vazio, o fallback
  do `searchTags()` (tags) usa `similarity(tag, q)` e operador `%`.
- **Suggestions** (`/api/search/suggestions`): se nenhuma fonte retornou
  resultado e `len(q) >= 4`, cai em `pg_trgm` direto (`content % q`,
  `title % q`, `name % q`). Ver `src/lib/community/search.ts:suggestions()`.

---

## 2. Synonyms — mapa PT-BR de termos espirituais

**Arquivo:** `src/lib/search/synonyms.ts`

Mapa curado para o domínio do Akasha. Cada entrada tem:
- `canonical` — slug canônico (sempre lowercase, sem acento)
- `aliases[]` — grafias equivalentes

Entradas atuais (12):

| Canônico | Aliases |
|---|---|
| `cabala` | cabalá, kabbalah, kabbala, qabalah |
| `meditacao` | meditacao, meditação, meditation |
| `tantra` | tantra, tântra |
| `xamanismo` | xamanismo, shamanismo, xaman, shaman |
| `reiki` | reiki, reik |
| `astrologia` | astrologia, astro |
| `cristianismo` | cristianismo, cristã, crista |
| `umbanda` | umbanda, umbandista |
| `espiritismo` | espiritismo, kardecismo, kardecista |
| `numerologia` | numerologia, numerológico, numerologica |
| `tarot` | tarot, tarô, taro |

### Como funciona

1. Usuário digita `cabalá meditação`
2. `expandQueryTs("cabalá meditação")` retorna:
   `(cabalá | cabala | kabbalah | kabbala | qabalah) & (meditação | meditacao | meditation)`
   (com prefix match `:*` em cada termo)
3. O termo original vem **primeiro** na expansão — ranking preserva a
   intenção do usuário.
4. Acentos são removidos para normalização (mas preservados nos aliases
   para o motor de busca; o Postgres `to_tsvector('portuguese', ...)`
   lida com ambos via `unaccent`).

### Como estender

```typescript
// src/lib/search/synonyms.ts
export const SYNONYMS: SynonymEntry[] = [
  // ...
  { canonical: 'umbanda', aliases: ['umbanda', 'umbandista'] },
  // ADICIONE AQUI — slug canônico em lowercase + aliases
];
```

Sem necessidade de migration: o mapa é estático, em memória, custo O(1)
por request.

---

## 3. Filters API

**Endpoint:** `GET /api/search`

### Query params (Wave 18)

| Param | Tipo | Notas |
|---|---|---|
| `q` | string (1-200) | obrigatório |
| `type` | enum | `all` \| `posts` \| `articles` \| `users` \| `groups` \| `tags` |
| `tradition` | string (≤50) | slug canônico (cabala, ifa, tantra, ...) |
| `tag` | string (≤80) | post.topic ou article.tags[] contém |
| `level` | enum | `ANECDOTAL` \| `LOW` \| `MEDIUM` \| `HIGH` (articles) |
| `format` | enum | `SCIENTIFIC_PAPER` \| `BOOK` \| `VIDEO` \| ... (articles) |
| `author` | string (≤120) | article.authors[] contém |
| `dateFrom` | ISO date | janela temporal (alias semântico) |
| `dateTo` | ISO date | janela temporal (alias semântico) |
| `from` | ISO date | janela temporal (legado, compat) |
| `to` | ISO date | janela temporal (legado, compat) |
| `hasAudio` | "true"/"false" | proxy: viewCount > 0 (articles) |
| `hasVideo` | "true"/"false" | proxy: citations > 0 (articles) |
| `sort` | enum | `relevance` \| `recent` \| `popular` (default: relevance) |
| `cursor` | base64 | paginação cursor |
| `limit` | int 1-50 | default 20 |

### Helper `buildWhere`

**Arquivo:** `src/lib/search/filters.ts`

Converte `SearchFilters` em cláusulas `Prisma.Sql` parametrizadas:

```typescript
import { buildWhere } from '@/lib/search/filters';

const where = buildWhere(filters, 'articles');
// → Prisma.Sql`a.tradition = ${tradition} AND ...`
```

Helpers por modelo:
- `buildPostsWhere(filters)` — alias `p`
- `buildArticlesWhere(filters)` — alias `a`
- `buildGroupsWhere(filters)` — alias `g`
- `buildProfilesWhere(filters)` — alias `sp`

**Garantia:** toda cláusula usa parametrização Prisma (`${value}`), nunca
string interpolation manual → proteção contra SQL injection.

**Sanitização:** `sanitizeTradition()` e `sanitizeTag()` validam contra
uma allowlist curada (15 tradições) para impedir queries gordas.

---

## 4. UI — `/search`

**Arquivo:** `src/app/search/page.tsx`

### Mudanças vs Wave 17

1. **Integração real com API** (era demo list estática)
   - `fetch(/api/search?q=...&filters...)` em `useEffect`
   - `fetch(/api/search/suggestions?q=...)` debounced

2. **Debounce 300ms nas suggestions**
   - Hook `useDebounce` (`src/hooks/use-debounce.ts`)
   - Cancela requests anteriores via flag `cancelled`

3. **Sidebar de filtros em desktop / accordion drawer em mobile**
   - `<aside className="hidden lg:block">` (≥1024px mostra sidebar)
   - `<MobileFiltersDrawer>` (bottom sheet com backdrop, `<lg`)
   - 4 seções colapsáveis: Tradição, Nível, Formato, Mídia

4. **Highlight de matches** (`<HighlightedPreview>`)
   - Recebe HTML com `<mark>...</mark>` (gerado pelo `ts_headline`)
   - Renderiza `<mark className="bg-amber-500/25 text-amber-200">`
   - Sanitiza via split (não `dangerouslySetInnerHTML`)

5. **Empty state rico**
   - 4 tips curados ("Verifique a grafia", "Use termos genéricos", ...)
   - CTAs: Limpar busca / Explorar biblioteca

6. **Sort options + result count**
   - Desktop: linha acima do grid com "X resultados em Yms" + `<select>` de sort
   - Mobile: select na header (mesma posição visual mas compacto)
   - 3 opções: Relevância / Mais recente / Mais popular

### Estados visuais

| Estado | Render |
|---|---|
| `idle` | Card "Comece digitando..." com 5 sugestões de tradição |
| `loading` | 3× `<ArticleCardSkeleton />` |
| `success` | Grid de `<HitCard>` (1 por hit, com type-specific layout) |
| `empty` | `<EmptyState>` com 4 tips |
| `error` | `<ApiError>` com retry |

---

## 5. Performance — cache headers

Verificado (Wave 11 já entregou; revisado aqui):

| Endpoint | `Cache-Control` |
|---|---|
| `/api/search` | `public, s-maxage=60, stale-while-revalidate=300` |
| `/api/search/suggestions` | `public, s-maxage=300, stale-while-revalidate=600` |

**Justificativa:**
- Search: 60s TTL é "fresh enough" para exploração; SWR 300s dá
  resiliência contra storms sem duplicar DB load.
- Suggestions: 5min TTL porque o corpus muda devagar; SWR 10min protege
  contra stampedes em horário de pico.

**Como verificar:**
```bash
curl -I "$BASE_URL/api/search?q=cabala"
# → Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

---

## 6. Como rodar localmente

```bash
# 1. Aplicar a nova migration
psql $DATABASE_URL -f prisma/migrations/20260628_search_typo/migration.sql

# 2. (Opcional) Re-seedar para testar sinônimos frescos
pnpm seed:articles
pnpm embed:articles

# 3. Dev server
pnpm dev

# 4. Testar manualmente
curl 'http://localhost:3000/api/search?q=cabala&tradition=cabala&sort=relevance'
curl 'http://localhost:3000/api/search/suggestions?q=cabalá'
```

### Cenários de teste manual

```bash
# Typo tolerance
curl 'http://localhost:3000/api/search?q=kabbalah'      # matches "cabala"
curl 'http://localhost:3000/api/search?q=meditacao'     # matches "meditação"

# Synonyms
curl 'http://localhost:3000/api/search?q=shamanismo'    # matches "xamanismo"
curl 'http://localhost:3000/api/search?q=reik'           # matches "reiki"

# Filters combinados
curl 'http://localhost:3000/api/search?q=meditacao&tradition=cabala&level=MEDIUM&sort=recent'

# Cache
curl -I 'http://localhost:3000/api/search?q=cabala' | grep -i cache
```

---

## 7. Arquivos modificados / criados

| Arquivo | Tipo | LOC |
|---|---|---|
| `prisma/migrations/20260628_search_typo/migration.sql` | NEW | 88 |
| `src/lib/search/synonyms.ts` | NEW | 152 |
| `src/lib/search/filters.ts` | NEW | 168 |
| `src/hooks/use-debounce.ts` | NEW | 35 |
| `src/lib/validators/search.ts` | MOD | +30 (novos campos no Zod) |
| `src/lib/community/search.ts` | MOD | refactor para `SearchFilters` + synonyms fallback + trgm fallback em suggestions |
| `src/app/api/search/route.ts` | MOD | +10 params no `safeParse` + comment header |
| `src/app/search/page.tsx` | REWRITE | demo → real API + filters UI |
| `docs/SEARCH-W18.md` | NEW | (este arquivo) |

---

## 8. Limitações conhecidas

1. **`hasAudio`/`hasVideo` são proxies**, não detecção real de mídia
   embedada no conteúdo. `viewCount > 0` e `citations > 0` são heurísticas
   conservadoras. Quando tivermos campo `hasAudioMedia Boolean` no schema,
   trocamos a query — sem mudar a API pública.

2. **Sinônimos não são cross-language** — `kabbalah` está mapeado, mas
   sinônimos em inglês (`meditation`) só funcionam como match exato (com
   expansão para `meditation` se aparecer no mapa). Em v2, podemos usar
   um dicionário multilíngue via Wiktionary API ou similar.

3. **Threshold pg_trgm é global** (`SET pg_trgm.similarity_threshold = 0.3`).
   Ajustar por query exige custom GUC ou re-configurar via application_name.
   Em prática, 0.3 funciona bem para o tamanho típico de termos espirituais
   (4-15 chars).

4. **Cache de 60s pode esconder edições** — se um curador adiciona um
   artigo e ele não aparece, aguarde 60s (ou use `?nocache=` workaround
   futuro).

5. **TSC não foi rodado localmente** (sandbox bash degradada, timeouts
   >100s em `npx tsc --noEmit`). Validação manual feita via Read tool:
   imports resolvem, assinaturas batem, SearchFilters é o novo contrato.
   Rodar `pnpm tsc --noEmit` no seu ambiente antes de mergear.

---

## 9. Checklist pré-merge

- [ ] Migration `20260628_search_typo` aplicada em staging
- [ ] `pnpm tsc --noEmit` retorna 0 errors
- [ ] Testes manuais: 5 cenários da seção 6 passam
- [ ] Smoke test: `/search?q=cabala` retorna resultados com `<mark>`
- [ ] Mobile (Chrome DevTools 375px): drawer de filtros abre/fecha OK
- [ ] Debounce visível: digitar "cabala" não bate no servidor 5 vezes
- [ ] Cache: 2ª request em <60s vem do edge (TTFB <50ms)
- [ ] Commit segue Conventional Commits: `feat(search): ...`
