# Performance Audit — Akasha Portal (2026-06-27)

> **Auditor:** Aki (Performance Engineer)
> **Escopo:** Next.js 16.2.6 + React 19.2.4 + Tailwind, route groups `(community)` / `(personal)` / `(info)`
> **Método:** Análise estática via Read + ripgrep. **Sem build disponível** no sandbox (2 GB RAM OOM). Métricas de campo não puderam ser coletadas; esta auditoria foca em **code shape**, **hotspots** e **quick wins**.
> **Status:** Relatório baseline. Recomendações ordenadas por ROI estimado.

---

## TL;DR — Estado Atual

| Sinal | Valor medido | Veredito |
|---|---|---|
| `'use client'` em `src/` | **274 arquivos** | 🔴 Severo — quase tudo é client. Bundle inicial deve estar > 500 KB gzipped. |
| `<img>` raw (sem Next/Image) | **4 ocorrências reais** | 🟡 Moderado — poucos mas no caminho crítico (groups, shop). |
| `next/image` (uso direto) | **0** usos em JSX (só re-export) | 🔴 Severo — image optimization pipeline **não está sendo aproveitado**. |
| `loading="lazy"` | **0** atributos | 🔴 Severo — nenhuma imagem abaixo da fold tem lazy explícito (default do Next/Image = lazy, mas como ninguém usa Next/Image...). |
| API routes com `force-dynamic` | **39 rotas** | 🔴 Severo — todas as APIs são SSR sem cache. Edge cache do Vercel **não está sendo usado**. |
| Pages com `dynamic`/`revalidate` explícito | **2** (validacao + admin/feedback) | 🔴 Severo — 33/35 pages não declaram estratégia de cache. |
| `next/dynamic` (dynamic import) | **1 uso** (oraculo/page.tsx) | 🔴 Severo — code splitting **quase inexistente**. |
| `useTransition` / `useOptimistic` | **2 usos**, 0 `useDeferredValue` / `useOptimistic` | 🟡 Moderado — interações pesadas (filtros, IA) não usam APIs React 19. |
| Fontes Google (`next/font/google`) | **4 famílias** (Cinzel, Cormorant, Raleway, IM_Fell) com 4–5 pesos cada | 🟡 Moderado — ~20 arquivos de fonte no budget. Acima do ideal para mobile. |
| Top 15 arquivos | Maior = **1.646 linhas** (tarot-interpretations) | 🟡 Moderado — hotspots são dados estáticos puros (TS literals), candidatos a `.json`. |

---

## Top 15 maiores arquivos

| # | Path | Linhas | Categoria | Recomendação |
|---|---|---:|---|---|
| 1 | `src/lib/tarot/tarot-interpretations.ts` | 1.646 | Dados estáticos | **Split** em `.json` ou arquivos por arcano (78 cartas × ~21 linhas). Tree-shake por carta individual. |
| 2 | `src/lib/api/openapi.ts` | 1.202 | Schema OpenAPI gerado | **Não bundle** — manter como asset gerado em build, importar sob demanda (Rota `/api-docs`). |
| 3 | `src/lib/ai/deep-correlation-engine.ts` | 1.179 | Engine IA server-side | **Server-only** — mover para `server/` e garantir que nunca vá pro client. Medir tempo de execução (provável CPU-heavy). |
| 4 | `src/components/dashboard/GuidedMeditationWidget.tsx` | 1.119 | Widget client (player) | **Dynamic import** — só carregar quando widget é montado. Tem timers, áudio, scripts. |
| 5 | `src/lib/tarot/card-interpretations.ts` | 1.102 | Dados estáticos | **Split** por arcano. Maior/menor + corte. Tree-shake-friendly. |
| 6 | `src/lib/orixa/odu-data.ts` | 1.068 | Dados estáticos | **Split** em 16 Odus separados. Cada Odu sob demanda. |
| 7 | `src/lib/orixa/visao-data.ts` | 1.040 | Dados estáticos | Idem #6. |
| 8 | `src/lib/ai/tradition-mapper.ts` | 1.007 | Engine server-side | Server-only. Mover para `server/`. |
| 9 | `src/lib/ai/pattern-recognizer.ts` | 990 | Engine server-side | Server-only. |
| 10 | `src/lib/ai/predictive-guidance.ts` | 976 | Engine server-side | Server-only. |
| 11 | `src/lib/export/pdf.ts` | 962 | Geração de PDF (jsPDF) | **Dynamic import** no botão "Exportar PDF" — jsPDF é ~80 KB gzipped, não pode estar no bundle inicial. |
| 12 | `src/lib/life-areas/life-areas-engine.ts` | 957 | Engine server-side | Server-only. |
| 13 | `src/lib/orixa/astrologia-data.ts` | 926 | Dados estáticos | Split por signo (12 arquivos). |
| 14 | `src/lib/correlation/zodiac-zodiac.ts` | 926 | Engine correlações | Server-only. |
| 15 | `src/lib/agents/personal-cycle-engine.ts` | 867 | Engine server-side | Server-only. |

### Padrão observado

Os 15 maiores arquivos se dividem em **3 famílias**:

1. **Dados estáticos puros** (itens #1, #5, #6, #7, #13) — literais TS. Devem ser `.json` ou `.ts` granulares para tree-shaking funcionar.
2. **Engines de IA server-side** (#3, #8, #9, #10, #12, #14, #15) — atualmente vivem em `src/lib/` mas só rodam no servidor. Risco alto de ir pro bundle do client por import acidental.
3. **Componentes client gordos** (#4, #11) — contêm libs pesadas (player de áudio, jsPDF) que devem ser dynamic imports.

> **Observação crítica:** os 7 engines de IA no Top 15 somam ~7.000 linhas. Se **qualquer um** for importado por engano num client component (e dado que 274 arquivos são `'use client'`, o risco é real), o bundle explode. Investigar `bundle analyzer` é P0.

---

## Performance Budgets (metas mensuráveis)

Definidos para o p75 mobile em **3G Fast** (Moto G-class / iPhone 8):

| Métrica | Budget | Justificativa |
|---|---|---|
| **LCP** (Largest Contentful Paint) | **< 2.5 s** | Core Web Vitals "Good". Hero image da home deve estar pronta nesse tempo. |
| **INP** (Interaction to Next Paint) | **< 200 ms** | Crítico em filtros, busca e chat IA. |
| **CLS** (Cumulative Layout Shift) | **< 0.1** | Reservar dimensões em todas imagens/fonts. |
| **TTFB** | **< 800 ms** | Vercel Edge deve entregar. |
| **FCP** | **< 1.8 s** | Acima disso, user sente "tela branca". |
| **TBT** (Total Blocking Time) | **< 200 ms** | Bundle inicial não pode bloquear main thread. |
| **Bundle inicial (JS gzipped por rota)** | **< 250 KB** | Acima disso, TTI degrada em mobile mid-range. |
| **Imagens** | **< 200 KB cada** | WebP/AVIF quando possível. |
| **Fonts (total)** | **< 100 KB** | 4 famílias × 5 pesos estoura isso facilmente. |

### Enforcement

- **CI:** Lighthouse em cada PR falha se Performance < 90 ou Accessibility < 95.
- **Bundle:** `@next/bundle-analyzer` semanal em CI. Qualquer rota > 250 KB gzipped bloqueia merge.
- **Slow queries:** P95 < 100 ms ou com índice documentado em `docs/SLOW-QUERIES.md`.
- **Budget violations:** ticket P1 automático em PostHog + alerta Slack.

---

## Top 10 oportunidades de otimização

| # | Oportunidade | Impacto | Esforço | ROI |
|---|---|---|---|---|
| 1 | **Mover 7 engines de IA para `src/server/` e banir de client bundle.** (#3, #8, #9, #10, #12, #14, #15 — ~7.000 linhas) | 🔴 Alto | M (1 dia) | ⭐⭐⭐⭐⭐ |
| 2 | **Split de dados estáticos** (tarot, odu, astrologia) em arquivos granulares por unidade. | 🔴 Alto (tree-shaking) | M (2 dias) | ⭐⭐⭐⭐⭐ |
| 3 | **Dynamic import em 100% dos widgets de dashboard** (Lazy load por rota + Suspense). Atualmente só `oraculo/page.tsx` usa `next/dynamic`. | 🔴 Alto | M (1 dia) | ⭐⭐⭐⭐⭐ |
| 4 | **Substituir 4 `<img>` raw por Next/Image** com `placeholder="blur"` (lib já tem helper `createOptimizedImage`). | 🟡 Médio | S (2h) | ⭐⭐⭐⭐ |
| 5 | **Adicionar `revalidate = 60`** em APIs de leitura (feed, posts, search suggestions) — hoje 39 rotas são `force-dynamic`. | 🟡 Médio | S (4h) | ⭐⭐⭐⭐ |
| 6 | **Reduzir fontes Google de 4 → 2 famílias** (Cinzel + Raleway). Cormorant/IM_Fell podem ser self-hosted subset Latin-Ext ou removidas. | 🟡 Médio (CLS + font budget) | S (1 dia) | ⭐⭐⭐⭐ |
| 7 | **`loading="lazy"` explícito + `priority` no LCP hero.** | 🟡 Médio | XS (1h) | ⭐⭐⭐ |
| 8 | **Adicionar `useTransition` em filtros e chat** (já tem 2 usos; estender para Mesa Real, busca, predictions). | 🟢 Baixo-Médio | S (4h) | ⭐⭐⭐ |
| 9 | **React 19 `useOptimistic`** em likes/comments/follow (3 endpoints existentes). | 🟢 Baixo | S (4h) | ⭐⭐ |
| 10 | **Bundle analyzer em CI semanal** (não existe hoje). Configurar `@next/bundle-analyzer` + step no GitHub Actions. | 🟢 Baixo (prevenção) | XS (2h) | ⭐⭐⭐⭐ |

---

## Caching Strategy Recomendada

### Camadas

```
┌─────────────────────────────────────────────────────────────┐
│ CDN Edge (Vercel) — stale-while-revalidate, HTTP cache      │
├─────────────────────────────────────────────────────────────┤
│ Server-side — React `cache()` + `unstable_cache` com TTL    │
├─────────────────────────────────────────────────────────────┤
│ Client-side — SWR/TanStack Query com stale-while-revalidate │
├─────────────────────────────────────────────────────────────┤
│ AI response cache — hash(prompt + user context) por 24h     │
└─────────────────────────────────────────────────────────────┘
```

### Por tipo de rota

| Tipo | Estratégia | Configuração |
|---|---|---|
| **Páginas estáticas** (validacao, terms, privacy) | SSG default | `export const dynamic = 'force-static'` + `revalidate = 3600` (1h) |
| **Páginas autenticadas** (dashboard, perfil) | SSR com cache por usuário | `unstable_cache` com tag `user:${id}` para invalidação on-update |
| **API leitura** (GET feed, GET search/suggestions) | ISR | `export const revalidate = 60` (1 min) |
| **API leitura cara** (GET divination/oracle, GET recommendations) | ISR + tag-based | `revalidate = 300` (5 min) + invalidar via `revalidateTag` |
| **API mutação** (POST/PUT/DELETE posts, comments) | SSR sem cache | `force-dynamic` (manter) |
| **API personal-time** (GET progresso, GET notifications) | SSR + React `cache()` | `force-dynamic` + dedup intra-request |
| **API admin** (rate-limit, feedback) | SSR | `force-dynamic` (manter — segurança) |

### Ações concretas

1. **`/api/feed`** → `revalidate = 60` (feed muda frequente, 1 min é OK).
2. **`/api/posts`** → `revalidate = 60`.
3. **`/api/search/suggestions`** → `revalidate = 300` (sugestões mudam devagar).
4. **`/api/planetary`** → `revalidate = 86400` (1 dia — ephemeris não muda em runtime).
5. **`/api/recommendations`** → `revalidate = 1800` (30 min — modelo roda server-side).
6. **`/api/divination/oracle`** → `revalidate = 0` mas cachear resposta por hash do input por 24h.

---

## Análise por categoria

### 1. Bundle analysis

- **274 componentes client** (`'use client'`) vs estimativa de **~30 server components** (páginas sem `'use client'`, providers, server-only libs).
- **0% das engines de IA estão atrás de `server-only`**. Risco de vazamento para client.
- **Apenas 1 dynamic import** em toda a base de código (`oraculo/page.tsx`). Potencial: 50+ candidatos óbvios (widgets dashboard, modais, players, charts).
- **Top 15 = ~16.000 linhas**. Mesmo que cada KB seja 1 linha compactada, isso é ~500 KB só nesses arquivos.

### 2. Imagens

| Local | Tag | Problema |
|---|---|---|
| `src/app/(community)/groups/[slug]/page.tsx:190` | `<img>` | Sem lazy, sem dimensões. Sem Next/Image. |
| `src/app/(community)/groups/page.tsx:285` | `<img>` | Idem. |
| `src/components/shop/ShopCart.tsx:78` | `<img>` | Idem + dentro de lista (deveria ser virtualizada). |
| `src/lib/image.ts` | helper existe | `createOptimizedImage` **não está sendo usado em lugar nenhum**. |

**Ação imediata:** criar `<MysticImage />` component que encapsula `next/image` + `placeholder="blur"` + `loading="lazy"` por padrão. Substituir os 3 `<img>` raw.

### 3. Fontes

`src/app/layout.tsx` importa **4 famílias**:

```ts
Cinzel (display)         → 4 pesos (400, 500, 600, 700)
Cormorant_Garamond (display) → 4 pesos
Raleway (body)           → 5 pesos (300, 400, 500, 600, 700)
IM_Fell_English (accent) → 1 peso
```

Total estimado: ~20 arquivos `.woff2`. Em 3G Fast isso bloqueia FCP.

**Recomendação:**

1. Reduzir para **2 famílias**: Cinzel (display) + Raleway (body).
2. Reduzir pesos para **2 por família**: 400 + 600.
3. Mover Cormorant_Garamond e IM_Fell_English para CSS class opcional (carregar sob demanda em páginas específicas).
4. Adicionar `<link rel="preload" as="font">` para o font do LCP.

`layout.tsx` já usa `next/font/google` corretamente (não tem `<link>` Google Fonts no head — ✅). Os 3 `<link rel="preconnect">` estão OK.

### 4. Caching

**39 rotas API** com `force-dynamic`:

- **Podem virar ISR** (apenas leitura): feed, posts, search, planetary, recommendations, divination (com cache), tags.
- **Devem permanecer dynamic**: notifications, push, follow, like, comments, invite, members, waitlist, swarm.

Estimativa: **~20 rotas** podem ganhar ISR com TTL apropriado. Redução esperada de TTFB em 60-80%.

**Server actions e pages** (sem `dynamic` explícito): por padrão Next.js assume SSG. Bom para `(info)/privacy`, `(info)/terms`. Ruim para `(personal)/dashboard/*` que não declara nada — cair no comportamento default. **Marcar como `force-dynamic` ou usar `unstable_cache` explicitamente**.

### 5. React 19 features

| Hook | Usos | Onde falta |
|---|---|---|
| `useMemo` / `useCallback` | ~180 (já maduros no código) | OK, mas em alguns casos é **over-optimization** (deps primitivos). |
| `useTransition` | **2** (FeedbackBoard, AdminFeedbackDashboard) | Mesa Real, Mapa, AI Oracle Chat, filtros de feed. |
| `useDeferredValue` | **0** | Filtros de busca, sliders de período (predictions). |
| `useOptimistic` | **0** | Likes, comments, follow, ritual completion. |
| `use()` (async) | **0** | Promises em RSC, suspense boundaries. |

**Quick win:** adicionar `useTransition` em **MesaRealGrid** (casa modal é pesado) + **PredictiveInsightsPanel** (filtros).

### 6. Server vs Client components

**Achado crítico:** **35/35 page.tsx** são client components (`'use client'` na primeira linha). Isso quebra o modelo mental do Next.js 16 App Router, onde pages devem ser **server-first** e ir pra client só quando necessário (eventos, hooks, estado).

**Causa provável:** desenvolvedor adicionou `'use client'` em massa para resolver erros de hook. Hoje muitos desses componentes poderiam ser **server components com children client**.

**Exemplo de refatoração segura** (zero mudança de UX):

```tsx
// ATUAL — tudo client
'use client';
export default function DashboardPage() {
  const { user } = useUser();
  return <DashboardClient user={user} />;
}

// DEPOIS — server boundary
import DashboardClient from './DashboardClient';
export default async function DashboardPage() {
  const user = await getUserOnServer();
  return <DashboardClient initialUser={user} />;
}
```

**Benefício:** data fetching server-side (sem JS no client), menos código hidratado, melhor TTFB.

---

## 5 Quick Wins (cada < 2h)

| # | Ação | Esforço | Ganho estimado |
|---|---|---|---|
| 1 | **Criar `<MysticImage />`** wrapper de `next/image` + substituir os 3 `<img>` raw. Adicionar `priority` no hero. | **1.5h** | -40 KB imagem na primeira dobra, LCP -300 ms. |
| 2 | **Adicionar `revalidate = 60` em `/api/feed`, `/api/posts`, `/api/search/suggestions`.** Testar com curl que cache está funcionando. | **1h** | TTFB -60% nessas rotas. |
| 3 | **Mover engines de IA para `src/server/`** + importar `server-only` no topo. Build quebra se algum client tentar importar. | **2h** | Previne leak massivo no bundle. |
| 4 | **Adicionar `next/dynamic` em `GuidedMeditationWidget` e `MapaNatalWheel`** (SVGs e charts são client-only). | **1.5h** | -80 KB no bundle inicial do dashboard. |
| 5 | **Reduzir de 4 → 2 fontes Google** (remover Cormorant + IM_Fell, manter Cinzel + Raleway com pesos 400/600). | **1h** | -60 KB de fonts, FCP -200 ms. |

---

## Riscos & Notas para Verifier

- **Métricas de campo não puderam ser coletadas** (sem Vercel Analytics, sem build). Esta auditoria é 100% análise estática.
- **Bundle size real não medido** — sem `next build` (sandbox 2 GB OOM). Recomenda-se rodar `@next/bundle-analyzer` em CI antes de fechar tickets.
- **TSX com `'use client'` no topo da árvore** (pages) é o maior drag. Refatorar para RSC server-first é a **maior alavanca única** (estimativa: -30% a -50% no bundle inicial se feito corretamente).
- **39 rotas `force-dynamic`** sugere que toda a app é SSR. Se confirmado, **toda a estratégia de cache do Vercel Edge está sendo desperdiçada**.
- **`createOptimizedImage` existe mas não é usado** — sinal claro de que o time pulou essa otimização. Quick win imediato.

---

## Próximos passos recomendados (ordenados)

1. **P0 — Auditoria manual de 3 page.tsx** (groups, feed, dashboard) para entender por que são client. Provavelmente dá pra converter para server + 1 client child.
2. **P0 — Configurar `@next/bundle-analyzer` em CI** (não existe hoje). Sem isso, todo o resto é cego.
3. **P1 — Executar os 5 quick wins acima.**
4. **P1 — Refatoração em massa `'use client'` → RSC**, priorizando rotas mais acessadas (home, dashboard, mapa).
5. **P2 — Split de dados estáticos** (tarot, odu, astrologia) em arquivos granulares.
6. **P2 — Configurar `unstable_cache` com TTL** nas engines de IA server-side.
7. **P3 — Bundle size budgets no CI** (fail build se rota > 250 KB gzipped).

---

*Gerado por Aki (Performance Engineer) — 2026-06-27 — revisão sugerida a cada 30 dias ou após mudança significativa.*