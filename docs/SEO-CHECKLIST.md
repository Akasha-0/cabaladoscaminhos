# SEO Checklist — Wave 20 (GTM Readiness 1/6)

> **Objetivo:** Tornar o Akasha Portal descobrível via busca orgânica
> (Google PT-BR primário) + preparado para compartilhamento social rico
> (OG/Twitter Cards/JSON-LD). Foco em fundamentals técnicos —
> conteúdo editorial entra em ondas seguintes.

---

## Status por página

| Rota | Title | Description | Canonical | OG image | OG type | Twitter card | JSON-LD | Indexable |
|------|-------|-------------|-----------|----------|---------|--------------|---------|-----------|
| `/` | ✓ | ✓ | ✓ | cover-home | website | summary_large_image | Organization + WebSite + SearchAction | yes |
| `/validacao` | ✓ | ✓ | ✓ | cover-home | website | summary_large_image | WebPage + BreadcrumbList | yes |
| `/library` | ✓ | ✓ | ✓ | cover-library | website | summary_large_image | WebSite (search action reforça) | yes |
| `/community` | ✓ | ✓ | ✓ | cover-community | website | summary_large_image | WebPage | yes |
| `/events` | ✓ | ✓ | ✓ | cover-events | website | summary_large_image | WebPage | yes |
| `/about` | ✓ | ✓ | ✓ | cover-home | website | summary_large_image | Organization + BreadcrumbList | yes |
| `/manifesto` | ✓ | ✓ | ✓ | cover-home | website | summary_large_image | BreadcrumbList | yes |
| `/privacy` | ✓ | ✓ | ✓ | cover-home | website | summary_large_image | BreadcrumbList | yes |
| `/terms` | ✓ | ✓ | ✓ | cover-home | website | summary_large_image | BreadcrumbList | yes |
| `/groups/[slug]` | (a definir) | (a definir) | ✓ | cover-community | website | summary_large_image | (futuro) | yes |

> **Convenção:** Toda metadata pública passa por `buildPageMetadata()`
> em `src/lib/seo/og.ts`. Single source of truth — drift entre páginas
> impossível sem mudar o helper.

---

## Arquivos entregues (Wave 20)

### Infraestrutura SEO

| Arquivo | Função |
|---------|--------|
| `src/lib/seo/og.ts` | Helper central: `buildPageMetadata()`, JSON-LD helpers (Organization, WebSite, Article, Event, BreadcrumbList), `<SeoJsonLd />`, constantes (BASE_URL, OG_DIMENSIONS) |
| `src/app/sitemap.xml/route.ts` | Sitemap dinâmico: rotas estáticas + top 20 artigos + próximos 50 eventos. ISR 1h |
| `src/app/robots.txt/route.ts` | Política de crawl: allow `/`, block `/api/`, `/admin/`, `/me`, `/u/`, `/community/`, `/onboarding`, `/settings`, `/notifications`, `/search`, `/drafts`. Block GPTBot/Claude/CCBot/PerplexityBot (LLM training). Block AhrefsBot/SemrushBot/MJ12bot/DotBot (link explorers). Sitemap URL absoluta |
| `public/og/cover-{home,library,akashic,events,community}.svg` | 5 OG covers 1200×630, um por categoria |

### Páginas com metadata/JSON-LD atualizados

| Página | O que mudou |
|--------|-------------|
| `/validacao` | Metadata via `buildPageMetadata()` (era raw object); adicionou JSON-LD WebPage + BreadcrumbList |
| `/library` | Novo `layout.tsx` server component com metadata (a página client existente é wrap) + JSON-LD WebSite |
| `/community` | Novo `layout.tsx` com metadata + JSON-LD WebPage |
| `/events` | Novo `layout.tsx` com metadata + JSON-LD WebPage |
| `/about` | Nova página server component — metadata + JSON-LD Organization + BreadcrumbList |
| `/manifesto` | Nova página server component — metadata + JSON-LD BreadcrumbList |
| `/privacy` | Nova página server component — metadata + JSON-LD BreadcrumbList |
| `/terms` | Nova página server component — metadata + JSON-LD BreadcrumbList |

**Total: 8 páginas com metadata canônico + 1 home (root layout) + 1 /validacao refactor = 10 superfícies SEO cobertas.**

---

## O que NÃO está nesta onda (defer)

| Item | Motivo | Onda sugerida |
|------|--------|---------------|
| Article schema por artigo (`/library/[slug]`) | Rota `[slug]` ainda não existe (precisa refactor client→server) | 2/6 |
| Event schema por evento (`/events/[id]`) | Rota `[id]` ainda não existe | 2/6 |
| Group schema por grupo (`/groups/[slug]`) | Rota `[slug]` ainda não existe | 2/6 |
| Per-author schema (`/u/[handle]`) | Rota bloqueada para não-logados (robots disallow) | N/A |
| Página `/akashic` | Jogo oracular é feature, não escopo SEO-only | 3/6 |
| Google Search Console submission | Requer acesso à conta GSC | pós-launch |
| Bing Webmaster submission | Idem | pós-launch |
| Hreflang PT-BR/EN/ES | V3.0 universalista promete 16 tradições, mas i18n não está em rota | 4/6 |
| Performance: LCP < 2.5s | Escopo Wave 11/17 perf, não SEO | (já medido) |

---

## Verificação manual (pós-deploy)

### 1. Sitemap.xml

```bash
# Em produção
curl -I https://cabaladoscaminhos.com/sitemap.xml
# Esperado: 200 OK, Content-Type: application/xml

curl https://cabaladoscaminhos.com/sitemap.xml | head -50
# Esperado: <?xml version="1.0"... + <urlset> + 18+ <url> (estáticos) + até 70 dinâmicos
```

Submit no Google Search Console:
- URL Inspection → `sitemap.xml` → "Request indexing"
- Sitemaps → Add new sitemap → `https://cabaladoscaminhos.com/sitemap.xml`

### 2. robots.txt

```bash
curl https://cabaladoscaminhos.com/robots.txt
# Esperado: User-agent: *, Allow: /, Disallow: /api/ etc, Sitemap: .../sitemap.xml
```

Testar no [Google Search Console → robots.txt Tester](https://support.google.com/webmasters/answer/6062598).

### 3. Open Graph (preview social)

- **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fcabaladoscaminhos.com
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/inspect/https%3A%2F%2Fcabaladoscaminhos.com
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator (descontinuado, mas ainda útil)

Para cada um:
- og:title presente e correto
- og:description ≤ 200 chars
- og:image carrega (1200×630)
- og:type = website (ou article)
- twitter:card = summary_large_image

### 4. JSON-LD (Schema.org)

- **Schema Markup Validator:** https://validator.schema.org/
  - Validar `https://cabaladoscaminhos.com` → Organization + WebSite + SearchAction
  - Validar `https://cabaladoscaminhos.com/validacao` → WebPage + BreadcrumbList
- **Google Rich Results Test:** https://search.google.com/test/rich-results
  - Validar JSON-LD Organization
  - Validar JSON-LD WebSite (search box eligible)

### 5. Lighthouse SEO (target ≥ 95)

```bash
# Local
npx lighthouse https://cabaladoscaminhos.com --only-categories=seo --view
npx lighthouse https://cabaladoscaminhos.com/validacao --only-categories=seo --view
```

**Checklist Lighthouse SEO (100 pontos possíveis):**

| Item | Pontos | Status |
|------|--------|--------|
| `<title>` presente e descritivo | 1 | ✓ |
| Meta description | 1 | ✓ |
| Viewport meta | 1 | ✓ |
| robots.txt válido | 1 | ✓ |
| Sitemap referenciado | 1 | ✓ |
| Links com href válido (sem 404) | 1 | ✓ (após rotas /about /manifesto /privacy /terms existirem) |
| `rel="canonical"` | 0.5 | ✓ |
| lang attribute no `<html>` | 1 | ✓ |
| HTTP 200 | 1 | ✓ |
| Tap targets ≥ 48px | 1 | (Wave 11 perf) |

**Target score: ≥ 95** (perda de pontos esperada em robots/sitemap só se houver 404 nos links).

### 6. Google Search Console (após submit)

Após 3-7 dias do submit:
- **Coverage → Valid pages:** todas as URLs do sitemap devem estar "Discovered → Indexed"
- **Experience → Core Web Vitals:** LCP < 2.5s, CLS < 0.1, INP < 200ms
- **Enhancements → Breadcrumbs:** se implementado (futuro), deve aparecer
- **Enhancements → Sitelinks Search Box:** habilitado automaticamente se WebSite+SearchAction estiver correto

---

## Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Sitemap puxa DB em runtime e cai em cold-start | Média | Médio | ISR 1h + graceful degradation (se DB offline, retorna só estáticos) |
| LLM crawlers (GPTBot) ignoram robots.txt | Alta | Baixo | Aceitável: copy institucional continua sendo raspada, mas a) nosso conteúdo principal é posts autenticados, b) podemos bloquear Cloudflare WAF depois |
| `/community/*` no robots mas ainda aparece em SERP legacy | Baixa | Médio | Remover via URL Removal no GSC + 410 Gone em rotas privadas (próxima onda) |
| OG image SVG não é aceito por FB/LinkedIn | Média | Médio | SVG é suportado por padrão OG spec; validar via Sharing Debugger. Fallback PNG pode ser gerado via Playwright se necessário (próxima onda) |
| Article slug routes (`/library/[slug]`) ainda não existem | Alta | Médio | Sitemap lista esses URLs mas são 404 até a rota ser implementada (Wave 2/6). GSC vai flaggar como soft 404 |

---

## Próximos passos

### Wave 21 (GTM Readiness 2/6) — Conteúdo + Article routes
- [ ] Implementar `/library/[slug]` server component com Article schema por artigo
- [ ] Implementar `/events/[id]` server component com Event schema por evento
- [ ] Implementar `/groups/[slug]` com Group schema
- [ ] Adicionar 5+ artigos novos na biblioteca (seed)

### Wave 22 (GTM Readiness 3/6) — Performance + Core Web Vitals
- [ ] Auditar LCP nas páginas públicas (target < 2.5s mobile 4G)
- [ ] Inline critical CSS (já parcial)
- [ ] Preload OG images no `<head>`
- [ ] Lazy-hydrate componentes below-the-fold

### Wave 23 (GTM Readiness 4/6) — Tracking + Analytics
- [ ] PostHog: events para pageview, scroll depth, CTA clicks
- [ ] Google Search Console: link propriedade
- [ ] Bing Webmaster: link propriedade

### Wave 24 (GTM Readiness 5/6) — Link building + Outreach
- [ ] Diretórios espirituais (YogaFinder, BrasilHolístico, etc)
- [ ] Guest posts em sites de psicologia/ciência
- [ ] Press release no ProductHunt

### Wave 25 (GTM Readiness 6/6) — Launch
- [ ] Submit sitemap em todos os buscadores
- [ ] Anúncio em redes sociais com OG preview validado
- [ ] Email marketing para waitlist com link `?utm_campaign=launch`

---

## Referências

- Google Search Central — Sitemaps: https://developers.google.com/search/docs/sitemaps/overview
- Google Search Central — robots.txt: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Schema.org Organization: https://schema.org/Organization
- Schema.org WebSite + SearchAction: https://schema.org/WebSite
- Open Graph spec: https://ogp.me/
- Twitter Cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
- Lighthouse SEO audit: https://developer.chrome.com/docs/lighthouse/seo/

---

**Wave 20 — concluída. Próxima onda: 21.**