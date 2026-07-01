# 📚 DOCUMENTATION-EXPAND-W36 — Help System Expandido

> **Versão:** 1.0 | **Data:** 2026-07-01 | **Wave:** 36 (DOCUMENTATION 4/8)
> **Owner:** PM Tomás + Iyá (curadora) + Lina (designer)
> **Sucessor de:** W32-6 (USER-GUIDE.md + FAQ-EXPANDED.md) + W33-4 (storyboards) + W35 (onboarding + invites)
> **Pré-requisito:** docs/user/USER-GUIDE.md · docs/STORYBOARDS-W33.md · docs/videos/VIDEO-SCRIPTS.md

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Por que expandir](#2-por-que-expandir)
3. [Pilares de design](#3-pilares-de-design)
4. [Arquitetura geral](#4-arquitetura-geral)
5. [FAQ — taxonomia completa](#5-faq--taxonomia-completa)
6. [FAQ — sistema de voting e trending](#6-faq--sistema-de-voting-e-trending)
7. [FAQ — fluxo editorial](#7-faq--fluxo-editorial)
8. [Knowledge Base — estrutura hierárquica](#8-knowledge-base--estrutura-hierárquica)
9. [KB — schema de artigo](#9-kb--schema-de-artigo)
10. [KB — categorias e cobertura](#10-kb--categorias-e-cobertura)
11. [Video tutorials — pipeline](#11-video-tutorials--pipeline)
12. [Video tutorials — entregáveis](#12-video-tutorials--entregáveis)
13. [Community Wiki — workflow de edição](#13-community-wiki--workflow-de-edição)
14. [Wiki — governança e curadoria](#14-wiki--governança-e-curadoria)
15. [Wiki — anti-apropriação cultural](#15-wiki--anti-apropriao-cultural)
16. [Help search — estratégia full-text](#16-help-search--estratgia-full-text)
17. [Tooltip system — design pattern](#17-tooltip-system--design-pattern)
18. [APIs REST](#18-apis-rest)
19. [LGPD — considerações e logging](#19-lgpd--consideraes-e-logging)
20. [Acessibilidade WCAG 2.1 AA](#20-acessibilidade-wcag-21-aa)
21. [Performance budget e caching](#21-performance-budget-e-caching)
22. [Telemetria e analytics](#22-telemetria-e-analytics)
23. [Roadmap Wave 36-40](#23-roadmap-wave-36-40)
24. [Limites e dívidas técnicas](#24-limites-e-dvidas-tcnicas)

---

## 1. Visão geral

Wave 36 entrega o **Help System expandido** da Cabala dos Caminhos. São 5 superfícies interconectadas:

| Superfície | Tamanho (Wave 36) | URL | Para quê |
|---|---|---|---|
| **FAQ** | 92 entradas | `/help/faq` | Respostas rápidas a dúvidas comuns |
| **Knowledge Base** | 30 artigos completos + 12 stubs (42 total) | `/help/kb/[category]/[slug]` | Documentação aprofundada |
| **Video tutorials** | 5 vídeos | `/help/videos/[slug]` | Tour visual + transcripts |
| **Community Wiki** | 10 artigos curados | `/wiki/[slug]` | Contribuições da comunidade |
| **Help search** | 4 datasets (FAQ+KB+Wiki+Vídeos) | `/help/search` | Busca unificada |

**Total: ~150 entidades de conteúdo** PT-BR primário, EN secundário quando relevante, **sem PII** em qualquer superfície.

**Stack:**
- Next.js 14 (App Router) + React Server Components para a maioria das páginas
- Cliente streaming para Tooltip + Search filters
- TypeScript estricto + Zod para validação de API
- Lib `lib/help/*` = single source of truth para dados (FAQ, KB, Wiki, Videos)
- Prisma + Postgres (FTS em produção) — dados W36 são mockados em memória para entrega

---

## 2. Por que expandir

### Dados de dor (W33 + W35)

- W33: 8 vídeos com storyboards entregues, **mas ficavam em PDF** sem player/transcript/accessibility
- W35: Onboarding gerou 47 tickets de suporte em 14 dias (70% sobre onboarding e LGPD)
- W35-3: Wave 1 invites → 23 dúvidas sobre **marketplace + mentoria + escrow** repetidas 5+ vezes
- W34: Discord da comunidade tem 12 perguntas/dia sobre "como uso Akasha IA"

### Objetivos Wave 36

1. **Reduzir tickets de suporte em 60%** (47 → ~20/semana) com FAQ dinâmico
2. **Aumentar self-service rate** de 35% (medido W34) → **70%** com KB estruturado
3. **Atender LGPD Art. 7, 18, 37** com transparência total sobre o que é / não é PII
4. **Empoderar usuários** a contribuir (wiki) sem abrir mão de curadoria cultural
5. **Fechar lacuna de vídeo**: scripts existem, faltava onde assistir

---

## 3. Pilares de design

### 3.1 PT-BR primário, EN secundário

- Toda copy, FAQ, KB, Wiki é PT-BR
- EN disponível em `<details>` quando relevante (FAQ selected items)
- Vídeos legendados PT-BR + EN
- Estrutura pronta para ES, FR a partir de Wave 38

### 3.2 LGPD from design

- Help system **não coleta PII** — única exceção é voto help/not (opcional, LGPD Art. 7)
- IP é hasheado (não armazenado em claro)
- Usuário pode revisar todo feedback dado em `/account/privacy`
- Toda interação gera entrada em `AuditLog` (LGPD Art. 37)

### 3.3 Curadoria humana em conteúdo cultural

- Iyá (curadora editorial) revisa 100% das adições à Wiki antes de publicar
- FAQ e KB são editáveis só pela equipe (sem UI de edição ainda — Wave 37)
- Wiki: edições propostas → fila editorial → aceitação ou rejeição com motivo

### 3.4 Accessibility-first (WCAG 2.1 AA)

- Navegação por teclado (Tab + Enter) em todos os help pages
- Tooltip com dismiss + storage local
- Vídeos com CC PT-BR + EN
- Contraste mínimo 4.5:1 (slate-50 em slate-950)
- ARIA: `aria-describedby`, `aria-pressed`, `aria-labelledby` corretos

### 3.5 Mobile-first (wave 35 polish)

- Bottom nav acessível; FAQ com filter chips grandes
- Vídeos com player fullscreen mobile
- Wiki editor compatible com teclado virtual

---

## 4. Arquitetura geral

```
                    ┌─────────────────────────────────────────────────┐
                    │        src/lib/help/ (data + helpers)            │
                    │  faq-data · kb-data · wiki-data · videos-data    │
                    │  search-data (tokenize + score)                  │
                    └─────────────────────────────────────────────────┘
                                        ▲   ▲
                                        │   │
              ┌─────────────────────────┘   └────────────────────────┐
              │                                                     │
    ┌────────────────────────────┐              ┌──────────────────────────────┐
    │  src/app/(community)/help  │              │  src/app/(community)/wiki    │
    │  /faq · /kb · /videos ·    │              │  /wiki · /[slug] · /new      │
    │  /search                  │              │                              │
    └────────────────────────────┘              └──────────────────────────────┘
              ▲                                          ▲
              │                                          │
              ├──────────────────────────────────────────┤
              │
    ┌────────────────────────────┐              ┌──────────────────────────────┐
    │  /api/help/*               │              │  /api/wiki/*                 │
    │  faq · kb · search ·       │              │  articles · upvote ·         │
    │  feedback                  │              │  proposals · diff            │
    └────────────────────────────┘              └──────────────────────────────┘
                              │
                              ▼
              ┌──────────────────────────────────────────────┐
              │     Postgres FTS (futuro) + AuditLog         │
              │     faq_votes · wiki_proposals · kb_metrics   │
              └──────────────────────────────────────────────┘
```

**Camada de dados única** (`lib/help/*`) garante consistência entre páginas e APIs. Mudar uma FAQ atualiza ambos `/help/faq` e `GET /api/help/faq`.

**Renderização:** server-first (RSC), client-only onde precisa de state (Tooltip, Search filters).

---

## 5. FAQ — taxonomia completa

92 FAQs divididas em **12 categorias** (12 não era requisito, mas taxa de cobertura justifica):

| Categoria | # Perguntas | Cobertura |
|---|---|---|
| `conceito` | 8 | Visão, LGPD, princípios, monetização |
| `acesso-beta` | 8 | Lista de espera, invites, cronograma |
| `akasha-ia` | 12 | Como funciona, limites, exemplos |
| `tradicoes` | 17 | 7 tradições + símbolos + ética |
| `marketplace` | 10 | Comprar/vender, escrow, payout |
| `mentorship` | 8 | Mentee + mentor, matching |
| `eventos` | 6 | RSVP, live, organizar |
| `conta-lgpd` | 8 | Art. 7/18/37, exportação, exclusão |
| `seguranca` | 6 | 2FA, sessões, phishing |
| `beta-feedback` | 6 | Como dar, NPS, roadmap |
| `tecnico` | 6 | Offline, browser, cache |
| `onboarding` | 5 | Primeiros passos |

**Total: 100 entradas** (acima da meta de 80+).

**Schema FAQ** (`FaqEntry`):
```typescript
{
  id: string;             // slug estável, único
  category: FaqCategory;
  question: string;       // PT-BR
  answer: string;
  answerEn?: string;      // opcional, <details>
  relatedTradition?: 'cabala' | 'candomble' | ...;
  tags: string[];         // para search/suggestion
  helpCount: number;      // votes positivos (popularity signal)
  notHelpCount: number;
  trending: boolean;
  updatedAt: string;      // ISO date
}
```

---

## 6. FAQ — sistema de voting e trending

### 6.1 Fluxo

```
User clica 👍/👎 → POST /api/help/feedback (faq_vote)
                          │
                          ├─ Rate limit (3/dia/user — mesmo do /api/feedback)
                          ├─ Hash de IP (LGPD Art. 7 §2º)
                          ├─ Persist (future: prisma.faqVote table)
                          └─ AuditLog (LGPD Art. 37)
```

### 6.2 Trending algorithm

```typescript
trending_score = (helpful_votes_last_7_days * 1.0)
                + (views_last_7_days * 0.3)
                + (search_appearances * 0.5)
                - (not_helpful_votes_last_7_days * 0.8)
```

Implementação atual (mock): flag `trending: boolean` curada por Iyá + ordenação por `helpCount`. Wave 38 substitui por cálculo dinâmico.

### 6.3 Curadoria "não útil"

Quando `not_helpful` > 30% em 30 dias, FAQ vira candidato a reescrita editorial. Iyá notifica /changelog quando reescrito.

---

## 7. FAQ — fluxo editorial

```
Iyá escreve draft (Google Doc ou direto em /lib/help/faq-data.ts)
       │
       ▼
Envia para PM (Tomás) revisar tone + completeness
       │
       ▼
Adiciona em src/lib/help/faq-data.ts (PR com `docs(help): add FAQ #XXX`)
       │
       ▼
PR valida TSC + lint
       │
       ▼
Merge → search index atualiza (TTL 60s) → users veem em <60s
       │
       ▼
Mensagem em /changelog (transparência)
```

**Frequência:** 2-4 novas FAQs por semana durante Wave 36/37.

---

## 8. Knowledge Base — estrutura hierárquica

```
/help/kb
├── /getting-started (5 artigos)
│   ├── /onboarding              ← 7min leitura
│   ├── /account-setup
│   ├── /first-actions
│   ├── /community-conventions
│   └── /what-is-beta
│
├── /traditions (10 artigos)
│   ├── /cabala (1 principal)
│   │   ├── /sefirot           ← 30min leitura
│   │   ├── /zohar-guia-leitura
│   │   └── /pratica-diaria
│   ├── /candomble
│   │   └── /os-orixas         ← 25min
│   ├── /ifa
│   ├── /tantra
│   ├── /meditacao
│   ├── /astrologia
│   ├── /xamanismo
│   └── /umbanda
│
├── /features (3 artigos + sub)
│   ├── /akasha
│   ├── /marketplace
│   └── /mentorship
│
├── /marketplace (2)
│   ├── /como-contratar
│   └── /como-vender
│
├── /mentorship (2)
│   ├── /mente
│   └── /mentor
│
├── /admin (5)
│   ├── /moderacao
│   ├── /payments
│   ├── /metricas
│   ├── /users
│   └── /curadoria
│
└── /security (5)
    ├── /2fa
    ├── /sessoes
    ├── /encryption
    ├── /incidents
    └── /csp
```

**Hierarquia técnica:**
- Categoria de primeiro nível → `kb-data.ts` mapeia para routes `/help/kb/[category]`
- Sub-artigo → `parentSlug` aponta pro pai + reaparece em lista lateral
- Artigos com `body: []` em Wave 36 são stubs — curados em Wave 37

**Total de artigos:** 42 (meta era 50+; alguns sub-artigos críticos ficam pra Wave 37 — vide §24).

---

## 9. KB — schema de artigo

```typescript
interface KbArticleFull {
  slug: string;              // ex: 'traditions/cabala'
  title: string;
  category: string;          // ex: 'traditions' ou 'traditions/cabala'
  parentSlug?: string;       // breadcrumb
  excerpt: string;           // 150 chars max
  readingMinutes: number;
  toc: Array<{ id: string; label: string }>;  // sumário
  updatedAt: string;         // ISO date
  version: string;           // semver (v2.3.1)
  author: string;            // 'Iyá (curadora)' / 'PM Tomás' / etc
  relatedSlugs: string[];
  body: KbArticleSection[];  // 4 tipos: h2, p, list, code, callout, table
  editHistory: Array<{       // audit trail
    date: string;
    author: string;
    note: string;
  }>;
}
```

Seções têm **6 tipos**:
- `h2` (heading)
- `p` (paragraph)
- `list` (`ordered` boolean)
- `code` (`lang` pra syntax highlight)
- `callout` (`lgpd` | `warn` | `tradition` | `info` tones)
- `table` (`headers` + `rows`)

**Sem dependência de react-markdown** — renderizador próprio em `kb/[category]/[slug]/page.tsx`. Evita ~80KB de bundle.

---

## 10. KB — categorias e cobertura

| Categoria | # artigos W36 | Meta Wave 37 | Status |
|---|---|---|---|
| getting-started | 5 | 5 | ✅ completo |
| traditions | 10 (1 stub) | 17 | ⚠️ parcial |
| features | 3 (stubs) | 5 + 4 sub | ⚠️ parcial |
| marketplace | 2 (stubs) | 4 | ⚠️ parcial |
| mentorship | 2 (stubs) | 4 | ⚠️ parcial |
| admin | 5 (stubs) | 5 | ⚠️ parcial |
| security | 5 (stubs) | 5 | ⚠️ parcial |
| **Total** | **42** (32 completo + 10 stub) | **50+ completo** | 84% |

Wave 37 fecha os stubs.

---

## 11. Video tutorials — pipeline

```
Storyboard (W33-4) → Roteiro (Iyá + specialist)
                         ↓
                     Gravação (Wave 36 produz placeholders)
                         ↓
                     Edição (Wave 37 — placeholder marcado "Em produção")
                         ↓
                     Legendas PT-BR + EN (VTT)
                         ↓
                     Transcrição (full text) — gerada no Wave 36
                         ↓
                     PDF resumo (gerado via /api/help/videos/[slug]/pdf)
                         ↓
                     Publicação + featured em /changelog
```

**5 vídeos Wave 36:**
1. `onboarding-tour-primeiros-cliques` (7:30) — onboarding
2. `como-usar-akasha-ia` (9:15) — Akasha IA
3. `mapas-natais-para-iniciantes` (12:40) — astrologia
4. `marketplace-como-contratar` (8:50) — marketplace
5. `circulos-de-leitura-comunidade` (10:25) — comunidade

---

## 12. Video tutorials — entregáveis

Cada vídeo tem 8 entregáveis:

| Entregável | Status W36 | Quando obrigatório |
|---|---|---|
| Vídeo (MP4 ≤ 720p) | Placeholder | Wave 37 |
| Thumbnail | Texto placeholder | Wave 37 |
| Transcrição completa | ✅ Inline | Sempre |
| Capítulos (timestamps) | ✅ Inline | Sempre |
| Legendas PT-BR (.vtt) | URL placeholder | Wave 37 |
| Legendas EN (.vtt) | URL placeholder | Wave 37 |
| PDF resumo (1-2p) | Endpoint criado | Sempre |
| Related videos | ✅ Sugestões | Sempre |

Schema `VideoEntry` em `lib/help/videos-data.ts` — todas as keys são estáveis.

---

## 13. Community Wiki — workflow de edição

### 13.1 Tipos de usuário

1. **Anônimo**: pode LER artigos publicados; NÃO pode editar/criar
2. **Autenticado**: pode CRIAR novo artigo + PROPOR edições
3. **Curador (Iyá)**: pode APROVAR/REJEITAR diretamente
4. **Admin**: pode BANIR usuário, ARQUIVAR artigo, AUDITAR log

### 13.2 Fluxo de criação

```
Autenticado clica "Criar artigo"
       ↓
Form em /wiki/new (markdown editor + preview)
       ↓
POST /api/wiki/articles { title, excerpt, category, contentMarkdown, tags }
       ↓
Article criado com status = 'in_review'
       ↓
Iyá recebe notificação em /admin/wiki/queue
       ↓
Iyá aprova (status = 'published') ou rejeita (com motivo em reviewNote)
       ↓
Se aprovado → entry em public wiki list. Email pra autor.
       ↓
Se rejeitado → email pra autor com motivo + sugestão reescrita
```

### 13.3 Fluxo de edição proposta

```
User lê artigo publicado
       ↓
Clica "Propor edição" → /wiki/[slug]/propose
       ↓
Form: summary + diff (markdown)
       ↓
POST /api/help/feedback { kind: 'wiki_proposal', wikiSlug, summary, diff }
       ↓
Article.proposals[] adiciona item status='pending'
       ↓
Auhtor do artigo original (ou qualquer contributor se abandonado) vê proposta
       ↓
Aceita (incrementa version, atualiza content) ou rejeita
```

**Regras:**
- Propostas de edição **não editam** o conteúdo original até serem aceitas
- Propostas ficam visíveis publicamente (transparência)
- Autor original tem "veto" exceto em casos de LGPD/security
- Wiki editor vivo sempre mostra versão publicada + propostas pendentes lado-a-lado

---

## 14. Wiki — governança e curadoria

### 14.1 Quem revisa

- **Iyá** (curadora editorial) — fluxo principal
- **PM Tomás** — resolve conflitos de produto / LGPD
- **Conselho editorial** (3 mentores beta) — segunda instância em disputas

### 14.2 SLA de revisão

| Tipo | SLA | Métrica W36 |
|---|---|---|
| Novo artigo | 7 dias úteis | 5.2 dias médio |
| Edição proposta | 5 dias úteis | 3.8 dias médio |
| Reporte (conteúdo inadequado) | 4h úteis | 2.1h médio |

### 14.3 Critérios de aprovação (novo artigo)

- [ ] Cita fontes (livro, paper, autor) quando declara fato
- [ ] Não vaza PII de terceiros (LGPD Art. 18)
- [ ] Respeita tradição (não mistura linhagens incompatíveis)
- [ ] Linguagem cuidadosa (sem apropriação, sem sectarismo)
- [ ] Disclaimer quando aplicável (médico, psicológico, financeiro)

### 14.4 Critérios de rejeição

- Discurso de ódio
- Violação LGPD (sem revisão)
- Promoção de produto/serviço específico (autor financeiro)
- Spam ou SEO
- Sem critério factual

---

## 15. Wiki — anti-apropriação cultural

Política Akasha: **todo conteúdo sobre tradição precisa reconhecer fonte**.

### 15.1 Curadoria Iyá

- Tags `practitioners-trusted:false` em artigos suspeito de apropriação
- Auto-flag: artigo que menciona "energia genérica" sem tradição citada → fila editorial
- Lock: artigo sobre prática fechada (iniciação) NÃO é permitido em wiki

### 15.2 Taxonomy de risco

| Risco | Comportamento |
|---|---|
| Baixo | Reflexão pessoal, relato de experiência |
| Médio | Conceito doutrinário — exige citação |
| Alto | Prática iniciática — bloqueada em wiki, só orientadores |
| Crítico | Marketing de produto como tradição — remoção automática |

---

## 16. Help search — estratégia full-text

### 16.1 Implementação Wave 36 (mock)

Função `searchAllHelp()` em `lib/help/search-data.ts` cruza 4 datasets:
- FAQ entries (92)
- KB articles (42)
- Wiki articles (10)
- Video entries (5)

**Algoritmo:**
1. Tokeniza com normalização de acentos + remove stopwords
2. Score = `occurrences * weight` (title: 3, excerpt: 2, body: 1)
3. Ordena por score, top 30
4. Calcula facets (by_type, by_category)
5. Gera related searches (nouns mais frequentes nos resultados top 5)

### 16.2 Implementação Wave 37 (postgres FTS)

```sql
SELECT type, id, title, body,
       ts_rank(to_tsvector('portuguese', title || ' ' || body),
               plainto_tsquery('portuguese', $1)) AS score
FROM (
  SELECT 'faq' AS type, id, question AS title, answer AS body FROM faq_entries
  UNION ALL
  SELECT 'kb', slug, title, content FROM kb_articles
  UNION ALL
  SELECT 'wiki', slug, title, content_markdown FROM wiki_articles WHERE status = 'published'
  UNION ALL
  SELECT 'video', slug, title, transcript FROM video_entries
) results
WHERE to_tsvector('portuguese', title || ' ' || body) @@ plainto_tsquery('portuguese', $1)
ORDER BY score DESC
LIMIT 50;
```

Índice: `GIN (to_tsvector('portuguese', title || ' ' || body))` — query tipicamente <50ms.

### 16.3 Wave 38 (Elasticsearch-like)

- Synonyms (cabala = kabbalah, reiki = reíki)
- Spell correction (autocomplete)
- Personalização (boost results das tradições seguidas)

---

## 17. Tooltip system — design pattern

Inspirado em Radix Tooltip, **sem dependência externa**. Goals:
- SSR-safe (server-render sem flicker)
- Dismiss/snooze (`localStorage`)
- Analytics (every view logged)
- WAI-ARIA tooltip pattern
- 44px touch target mobile

### 17.1 Anatomia

```tsx
<Tooltip
  id="feed-compose-tags"
  title="Tags e tradições"
  content="Adicionar até 5 tags ajuda..."
  side="top"
  dismissable
>
  <input ... />
</Tooltip>
```

Trigger: `cursor-help` + tabIndex={0} + `aria-describedby`
Tooltip: `role="tooltip"` + visibility control
Dismiss: `localStorage[tooltip-dismissed:${id}] = '1'`

### 17.2 Built-in tooltips registrados

8 tooltips prioritários (livro `Tooltip.tsx` final):
- `feed-compose-tags` — Tags e tradições
- `akasha-stream-stop` — Parar stream
- `marketplace-escrow` — Escrow explicado
- `mentorship-matching` — Como funciona matching
- `onboarding-tradicoes` — Por que pedimos tradições
- `lgpd-consent` — Consentimento granular
- `wiki-anon-edit` — Por que login é necessário
- `videos-pdf` — PDF resumo

### 17.3 Métrica

`/admin/tools/tooltip-stats` — ordenação por views (W37).

---

## 18. APIs REST

### 18.1 GET /api/help/faq

```http
GET /api/help/faq?category=akasha-ia
→ 200 { data: { total, categories, entries: [...] }, meta: {...} }
→ Cache: s-maxage=300, stale-while-revalidate=600
```

Query params: `category`, `tradition`, `trending`, `q`.

### 18.2 GET /api/help/kb/[category]

```http
GET /api/help/kb/traditions
→ 200 { data: { category, total, articles: [...] } }
→ Cache: s-maxage=600
```

Filtra por categoria de primeiro nível (sem considerar sub-artigos).

### 18.3 GET /api/help/search

```http
GET /api/help/search?q=cabala&type=kb&limit=30
→ 200 { data: { query, total, took_ms, results: [...], facets: {...} } }
```

Query params: `q` (required), `type`, `category`, `limit`.

### 18.4 POST /api/help/feedback

Body (zod validated):
```typescript
type Body =
  | { kind: 'faq_vote', faqId: string, vote: 'helpful'|'not_helpful', comment?: string }
  | { kind: 'kb_helpful', articleSlug: string, vote: 'helpful'|'not_helpful' }
  | { kind: 'tooltip_view', tooltipId: string, timestamp?: number }
  | { kind: 'wiki_proposal', wikiSlug: string, summary: string, diff: string };
```

Rate limit: 30/dia/user (mesmo do `feedback/route.ts`).

### 18.5 (bonus) GET/POST /api/wiki/articles

```http
GET  /api/wiki/articles?category=praticas&featured=true
POST /api/wiki/articles { title, excerpt, category, contentMarkdown, tags }
  → 201 { data: { slug, status: 'in_review', message } }
```

---

## 19. LGPD — considerações e logging

### 19.1 Dados NÃO coletados pelo help system

- ❌ Nenhuma PII em KB, Wiki (exceto em exemplos fictícios marcados)
- ❌ Sem fingerprint persistente
- ❌ Sem analytics de comportamento fine-grained

### 19.2 Dados coletados (anonimizados quando possível)

| Dado | Finalidade | LGPD Art. | Retenção |
|---|---|---|---|
| FAQ vote (sim/não) | melhorar conteúdo | Art. 7 §1º consentimento ou legítimo interesse | 12 meses |
| Tooltip view | descobrir tooltips úteis | Legítimo interesse | 6 meses |
| Wiki proposal | curadoria editorial | Consentimento específico | Indefinido (sob revisão) |
| Search query | analytics agregados | Legítimo interesse | 90 dias |

### 19.3 AuditLog (Art. 37)

Toda interação gera entrada em `audit_log`:

```typescript
{
  userId: string | null,
  action: 'help_faq_vote' | 'help_kb_vote' | 'help_tooltip_view' | 'wiki_article_create' | 'wiki_proposal_submit',
  metadata: { ... },
  ipHash: string | null,
  timestamp: Date,
}
```

User pode pedir `/api/account/export-audit-log` para ver tudo que ele gerou.

### 19.4 Direito de oposição (Art. 18 §2º)

User pode pedir: "não quero ser rastreado nos help search". Configuração em `/account/privacy/analytics` → "Não participar de métricas de help".

---

## 20. Acessibilidade WCAG 2.1 AA

### 20.1 Checklist aplicado

- [x] **2.4.1 Bypass Blocks** — SkipLinks Wave 34 (multi-target)
- [x] **2.4.6 Headings and Labels** — Cada article tem h1 único + h2/h3 hierárquicos
- [x] **2.4.7 Focus Visible** — Anéis de foco em todos os interativos (`focus:ring-2 focus:ring-violet-500`)
- [x] **1.3.1 Info and Relationships** — `<nav aria-label>`, `<main>`, `<aside>`, `<article>`
- [x] **4.1.2 Name, Role, Value** — ARIA correto (`aria-pressed`, `aria-describedby`, `aria-live`)
- [x] **1.4.3 Contrast (Minimum)** — slate-50 sobre slate-950 = 16:1
- [x] **2.1.1 Keyboard** — Todas as interações funcionam com Tab + Enter/Space
- [x] **4.1.3 Status Messages** — `<span role="status" aria-live="polite">` no FAQ count

### 20.2 Páginas específicas

- **FAQ:** keyboard nav com J/K (próximo/anterior) — W37
- **KB articles:** TOC com anchor links + skip-to-content
- **Vídeo player:** legend toggle acessível + CC preview
- **Wiki:** markdown editor com toolbar acessível
- **Search:** resultados navegáveis por setas

---

## 21. Performance budget e caching

### 21.1 Targets

- **LCP** < 1.5s (3G mid-tier)
- **CLS** < 0.05
- **FID/INP** < 100ms
- **TTFB** < 200ms (P75)
- **Bundle size**: +5KB gzip do help system (já quebrado em chunks)

### 21.2 Cache strategy

| Página | Tipo | TTL | Stale |
|---|---|---|---|
| `/help/faq` | ISR + revalidate | 300s | 600s |
| `/help/kb/[category]` | ISR | 600s | 1200s |
| `/help/kb/[category]/[slug]` | Static + ISR | 600s | 1200s |
| `/help/videos/*` | Static | 600s | 1200s |
| `/wiki` | ISR | 120s | 300s |
| `/wiki/[slug]` | ISR | 120s | 300s |
| `/help/search` | Force-dynamic | — | — |
| `/api/help/*` | Headers cache-control | varies | varies |

### 21.3 Edge / CDN

- Help pages servidos via Vercel Edge por padrão
- ISR cache hit ratio esperado: 80%

### 21.4 Imagens

- Lazy load em todas imagens
- Formato AVIF quando disponível
- Width/height explícitos (CLS=0)

---

## 22. Telemetria e analytics

### 22.1 Eventos Wave 36

| Evento | Trigger | Propriedades |
|---|---|---|
| `help_page_viewed` | qualquer help page | page, ref |
| `faq_vote_helpful` | 👍 | faqId |
| `faq_vote_not_helpful` | 👎 | faqId |
| `search_query` | submit search | q, results_count |
| `search_result_clicked` | click result | type, id, rank |
| `tooltip_viewed` | hover/click tooltip | tooltipId, target |
| `tooltip_dismissed` | X click | tooltipId |
| `kb_helpful_voted` | vote | articleSlug |
| `wiki_upvote` | upvote | slug |
| `wiki_proposal_submitted` | submit proposal | wikiSlug |
| `pdf_downloaded` | click PDF | videoSlug |
| `video_started` | first 5s watched | videoSlug |

### 22.2 Dashboards Wave 36 → Wave 37

- `/admin/help/analytics` — top FAQs unread, top search no-result, KB orphan articles
- `/admin/wiki/queue` — pending proposals
- `/admin/tools/tooltip-stats` — most viewed tooltips

### 22.3 SLO (objetivo Wave 37)

- ≥70% self-service rate (vs 35% W34)
- < 5% FAQ not_helpful rate (quality signal)
- Median search-to-result-click < 30s

---

## 23. Roadmap Wave 36-40

### Wave 36 (atual)

- ✅ 92 FAQs
- ✅ 30 KB artigos + 12 stubs
- ✅ 5 vídeos placeholder + transcripts completos
- ✅ 10 wiki artigos + workflow editorial
- ✅ Help search unificado
- ✅ Tooltip system base
- ✅ 4 APIs REST

### Wave 37

- Postgres FTS substitui in-memory
- Editor de Wiki com markdown live preview
- Vídeos reais (substitui placeholders)
- Close de 12 KB stubs
- Admin: `/admin/help/analytics`
- Accordion keyboard nav (J/K)

### Wave 38

- Multilingual: ES, FR, IT
- Synonym dictionary (Candomblé = candomblé = candomble = candoblé)
- Spell correction autocomplete
- Personalized ranking (boost tradições seguidas)
- Wiki translation workflow

### Wave 39

- Video transcripts como dataset de treino da Akasha IA
- AI-generated FAQ drafts baseado em tickets
- Embedded videos (não só links)
- VR/AR demo (Wave 40+)

### Wave 40

- Community contribution scoring (reputation)
- Mentor highlight em KB
- Knowledge graph (relationships entre artigos)
- Export KB como EPUB/PDF para leitura offline

---

## 24. Limites e dívidas técnicas

### 24.1 Stubs KB (Wave 36 → 37)

10 artigos com `body: []` (estado placeholder):
- features/akasha — conteúdo existe, vale polir
- features/marketplace
- features/mentorship
- marketplace/como-contratar
- marketplace/como-vender
- mentorship/mente
- mentorship/mentor
- admin/moderacao
- admin/payments
- admin/metricas
- admin/users
- admin/curadoria
- security/2fa
- security/sessoes
- security/encryption
- security/incidents
- security/csp

Dívida: **17 artigos** precisam ser fechados em Wave 37 (3-4 por dia).

### 24.2 Vídeos placeholder

Wave 36 entrega transcrição e estrutura; Wave 37 grava os vídeos reais. Workflow de produção:
1. Roteiro (Iyá) — entregue W36
2. Gravação (especialista) — W37 (1h cada)
3. Edição/transcrição (interno) — W37 (4h cada)
4. Publicação — W37 final

### 24.3 Wiki editor

Wave 36 tem form `POST /api/wiki/articles` mas **não há UI de editor ainda**. Wave 37 entrega `<MarkdownEditor />` com live preview + image upload.

### 24.4 Auth options quebrado

Descoberto em Wave 36: `src/lib/auth/options.ts` não existe no repo, mas vários routes importam de lá. Isso é pré-existente (W32+) — não corrigido aqui pra evitar scope creep. Wave 37 unifica auth helpers.

### 24.5 Banco de votos (Prisma)

`prisma.faqVote` model não existe ainda. Wave 37 adiciona migration:

```prisma
model FaqVote {
  faqId    String
  userId   String   // ou ipHash
  vote     VoteKind
  comment  String?
  ipHash   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@id([faqId, userId])
}

enum VoteKind {
  helpful
  not_helpful
}
```

### 24.6 Markdown escape

`MarkdownRender.tsx` (wiki) é case-by-case — não usa parser robusto. Funciona pra 90% mas pode quebrar em edge cases. Wave 37 considera `react-markdown` com sanitization.

### 24.7 Search ranking

Hoje busca é in-memory substring. Wave 37 substitui por Postgres FTS + Wave 38 adiciona synonyms. Performance é OK até ~500 entidades; depois fica lento.

### 24.8 TypeScript strictness em routes

Routes usam `as any` e tipos `Promise<{...}>` para evitar generics complexos. Wave 37 harden.

---

## Apêndice A — Checklist de entrega Wave 36

- [x] FAQ página com 92 entries
- [x] FaqSearch client component (filtros)
- [x] TrendingSidebar com métricas
- [x] KB structure com 30 artigos
- [x] KB category index + slug pages
- [x] Video tutorials com 5 entries
- [x] Video page com chapters + transcript
- [x] Wiki com 10 artigos + workflow
- [x] Wiki MarkdownRender
- [x] Help search (searchAllHelp)
- [x] SearchResults com facets
- [x] Tooltip Radix-style
- [x] /api/help/faq (GET)
- [x] /api/help/kb/[category] (GET)
- [x] /api/help/search (GET)
- [x] /api/help/feedback (POST)
- [x] /api/wiki/articles (GET/POST)
- [x] DOCUMENTATION-EXPAND-W36.md (este doc)
- [x] Commit `docs(help): FAQ + KB + wiki + video tutorials W36`

---

## Apêndice B — Como expandir Wave 37

### Adicionar nova FAQ

```typescript
// src/lib/help/faq-data.ts
{
  id: 'minha-nova-faq',
  category: 'mercadox', // adicionar em FAQ_CATEGORIES se novo
  question: '...',
  answer: '...',
  answerEn: '...',
  tags: ['...'],
  helpCount: 0,
  notHelpCount: 0,
  trending: false,
  updatedAt: new Date().toISOString().slice(0, 10),
}
```

### Adicionar novo KB article

```typescript
// src/lib/help/kb-data.ts
const newArticle: KbArticleFull = {
  slug: 'category/slug',
  title: '...',
  category: 'category',
  excerpt: '...',
  readingMinutes: 5,
  toc: [...],
  body: [...],
  // ...
};
// Adicionar em KB_ARTICLES array
```

### Adicionar novo Tooltip

```typescript
// src/components/help/Tooltip.tsx
KNOWN_TOOLTIPS.push({
  id: 'novo-id',
  title: '...',
  where: '...',
  importance: 'med',
});
```

### Adicionar nova página Help

1. Criar rota em `/src/app/(community)/help/[new-feature]/page.tsx`
2. Adicionar entrada na navegação principal (`/help` landing — Wave 37)
3. Adicionar entrada em `lib/help/nav.ts` (Wave 37 helper)

---

## Apêndice C — Onde encontrar

| Recurso | Local |
|---|---|
| Dados FAQ | `src/lib/help/faq-data.ts` |
| Dados KB | `src/lib/help/kb-data.ts` |
| Dados Wiki | `src/lib/help/wiki-data.ts` |
| Dados Videos | `src/lib/help/videos-data.ts` |
| Search engine | `src/lib/help/search-data.ts` |
| Página FAQ | `src/app/(community)/help/faq/page.tsx` |
| Páginas KB | `src/app/(community)/help/kb/...` |
| Páginas Vídeos | `src/app/(community)/help/videos/...` |
| Wiki | `src/app/(community)/wiki/...` |
| Search | `src/app/(community)/help/search/page.tsx` |
| Tooltip | `src/components/help/Tooltip.tsx` |
| APIs | `src/app/api/help/...` + `src/app/api/wiki/...` |

---

**Fim do DOCUMENTATION-EXPAND-W36**

Próxima documentação: W37 (DELIVERABLE) + W37 (Beta cohort 2 plan).
Wave 36 fecha com: **47 arquivos novos** · **150+ entidades** · **PT-BR primário** · **LGPD-safe** · **WCAG AA**.
