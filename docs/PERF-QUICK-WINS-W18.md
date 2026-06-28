# Performance Quick Wins — Wave 18

> **Status:** ✅ Aplicado em 2026-06-27
> **Escopo:** Lazy loading + Web Vitals tracking + Critical CSS inline
> **Owner:** Coder + Aki (Performance)
> **Branch:** `main` (commit pendente — git sandbox degraded, ver Apêndice B)
> **Tarefa:** 15 min — quick wins cirúrgicos pós-Wave 17

Este doc registra **3 wins concretos** aplicados na Wave 18 sobre os
componentes adicionados pela Wave 17 (`skeleton`, `empty-illustrations`,
`error-states`, `motion`). Não é uma auditoria exaustiva — é o mínimo
cirúrgico que cabe em 15 min e devolve bundle + observabilidade.

**Não-deste-doc:** análise completa de bundle (depende de `pnpm build`
que não rodou no sandbox degradado). Ver Apêndice A para itens não
concluídos e Apêndice B para limitações.

---

## 🎯 Resumo dos Quick Wins

| # | Quick Win | Status | Arquivos tocados | Impacto esperado |
|---|---|---|---|---|
| 1 | Lazy load `PostCardSkeleton` / `ArticleCardSkeleton` em `loading.tsx` | ✅ Aplicado | 2 arquivos | −2-4 KB JS no initial bundle das rotas feed/library |
| 2 | Web Vitals tracker (LCP/CLS/INP/FCP/TTFB) → PostHog | ✅ Aplicado | 2 arquivos novos | +observabilidade (era zero signal em prod) |
| 3 | Critical CSS inline (above-the-fold tokens) | ✅ Aplicado | 1 arquivo | −50-100ms FCP perceived em cold loads |
| 4 | `next/image` audit + `sizes` migration | ⏸️ Não iniciado (sandbox grep morta) | — | Ver Apêndice A |
| 5 | `pnpm check:bundle` + análise top-3 chunks | ⏸️ Não iniciado (sandbox bash morta) | — | Ver Apêndice A |

---

## 🏗️ Win 1 — Dynamic Import nos `loading.tsx`

### Contexto

Wave 17 adicionou `src/components/design-system/skeleton.tsx` com
**8 variantes** + **5 skeletons compostos** (`PostCardSkeleton`,
`ArticleCardSkeleton`, etc). As rotas `feed/` e `library/` usam esses
componentes compostos em seus `loading.tsx` files (Next.js Suspense
fallback).

Problema: como `loading.tsx` é renderizado no **initial JS chunk** da
rota (é parte do segmento client-side), qualquer componente composto
importado estaticamente entra no initial bundle — mesmo que o usuário
nunca veja o skeleton (datasheet já carregadas).

### Mudança

```diff
- // src/app/feed/loading.tsx
- import { PostCardSkeleton } from '@/components/design-system/skeleton';
+ import dynamic from 'next/dynamic';
+ import { Skeleton } from '@/components/design-system/skeleton';
+
+ const PostCardSkeleton = dynamic(
+   () => import('@/components/design-system/skeleton').then(
+     (m) => ({ default: m.PostCardSkeleton }),
+   ),
+   { ssr: true },
+ );
```

Mesmo padrão aplicado em `src/app/library/loading.tsx` para
`ArticleCardSkeleton`.

### Decisões

- **`ssr: true`** mantido: skeleton deve aparecer **no server-side
  render** para evitar layout jump. Custo do SSR = só HTML markup (não
  JS do componente); o componente fica dynamic só pro client.
- **`Skeleton` primitivo** continua importado estaticamente (ele é só
  CSS + props — sem deps JS). Só os **compostos** ganham dynamic.
- **Os inline `<div className="skeleton">`** no header também
  permanecem estaticos (zero JS, puro CSS class).

### Impacto esperado

- `feed/_loading` chunk: remove dependency tree do
  `PostCardSkeleton` (Skeleton variants + lucide-react deps se houver).
- `library/_loading` chunk: idem para `ArticleCardSkeleton`.
- Estimativa conservadora: **2-4 KB raw** removidos do initial bundle
  por rota (compondo o que `check-bundle` medir).

---

## 📊 Win 2 — Web Vitals Tracker

### Contexto

- **Antes:** zero signal de Core Web Vitals em prod. A persona Aki
  (Performance) tinha só o CI budget gate (`scripts/check-bundle-size.ts`)
  que mede **build artifact size** — não mede **campo**.
- **Dep `web-vitals`** não está instalada. Adicionar custaria
  ~3 KB gzipped + 1 KB types. PerformanceObserver cobre tudo.

### Mudança

**Arquivo novo:** `src/lib/monitoring/web-vitals.ts`

Implementa tracking de **5 métricas** usando `PerformanceObserver`:

| Métrica | Threshold (good/poor) | Entry type |
|---|---|---|
| LCP | 2500ms / 4000ms | `largest-contentful-paint` |
| CLS | 0.10 / 0.25 | `layout-shift` |
| INP | 200ms / 500ms | `event` (duration ≥ 16ms) |
| FCP | 1800ms / 3000ms | `paint` |
| TTFB | 800ms / 1800ms | `navigation` |

API:
```ts
import { startWebVitals, onVital, reportCustomVital } from '@/lib/monitoring/web-vitals';
```

Cada métrica é:
1. Classificada (`good` / `needs-improvement` / `poor`)
2. Reportada a todos os listeners (`onVital()`)
3. Forwardada como evento `web_vital` ao PostHog via `track()`
   (helper existente em `@/lib/monitoring/posthog`)

**Arquivo novo:** `src/components/monitoring/WebVitalsReporter.tsx`

Client component que renderiza `null` e apenas monta/desmonta os
observers. Mounted uma vez em `app/layout.tsx`.

**Arquivo alterado:** `src/app/layout.tsx`

```diff
+ import { WebVitalsReporter } from '@/components/monitoring/WebVitalsReporter';
  ...
  <PostHogProvider>
+   <WebVitalsReporter />
    {children}
  </PostHogProvider>
```

### Decisões

- **Zero deps novas.** PerformanceObserver cobre tudo; o pacote
  `web-vitals` só adiciona ~3KB + types por conveniência que não
  precisamos (já temos `posthog.track`).
- **Dedupe por métrica.** Final value é reportado 1× por page-load
  (LCP/CLS/INP disparam múltiplas entries durante a sessão; queremos
  só o **final**).
- **`reportCustomVital()`** exposto para timings custom (hydration
  completion, AI streaming latency, etc) — bypassa dedupe.
- **Listeners extensíveis.** `onVital()` permite Sentry / logger
  custom sem tocar o módulo.

### Como inspecionar localmente

```bash
pnpm dev
# abrir DevTools console
# navegar entre rotas
# procurar: [web-vital] LCP=1234ms (good) @ /feed
```

### Como ler em prod

PostHog → Eventos → filter `web_vital` → breakdown por `metric` + `rating`.

---

## 🎨 Win 3 — Critical CSS Inline

### Contexto

O `globals.css` (Tailwind + tokens) tem ~50 KB raw (estimado). Mesmo
com Next.js inline automático via PostCSS, há um window de
**~100-300ms** entre `domcontentloaded` e CSS aplicar — onde o
background fica branco (flash) antes do dark theme aplicar.

### Mudança

Adicionado inline `<style>` em `app/layout.tsx` `<head>`:

```html
<style>
  :root { color-scheme: dark light; }
  html, body { background-color: #020617; color: #e2e8f0; }
  html {
    font-family: var(--font-raleway), system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
</style>
```

### Decisões

- **Inline `<style>` > external `<link rel="stylesheet">`** para
  tokens above-the-fold. Zero network roundtrip.
- **`color-scheme: dark light`** permite que browser chrome (scrollbar,
  form controls) adote dark em vez de flash white→dark.
- **`#020617`** = slate-950 (background default do projeto).
- **`#e2e8f0`** = slate-200 (foreground default).
- Tokens Tailwind (`bg-background`) depois sobrescrevem — a inline
  serve só pro window pré-CSS.

### Impacto esperado

- Cold FCP perceived: **−50-100ms** (elimina o white flash inicial).
- CLS risk: zero (não há layout shift — só background color).
- Bundle size: +~250 bytes inline (sem request extra).

---

## ✅ Validação

### TSC

Não rodável no sandbox atual (bash travada). Verificação manual:

- `src/lib/monitoring/web-vitals.ts` — exports tipados (`VitalReport`,
  `VitalListener`, `VitalMetric`, `VitalRating`), todas as funções SSR-safe.
- `src/components/monitoring/WebVitalsReporter.tsx` — `"use client"`,
  useEffect mount/unmount limpos.
- `src/app/layout.tsx` — import correto, mount dentro de
  `PostHogProvider` (garante `posthog.track` disponível).
- `src/app/feed/loading.tsx` + `library/loading.tsx` — `ssr: true`
  preserva Suspense fallback no SSR.

### Bundle

Não rodável (`pnpm check:bundle` precisa de `pnpm build` primeiro,
ambos falham no sandbox). Ver Apêndice A.

---

## 🔮 Próximas Wins (Não Aplicadas — Apêndice A)

### A1. `next/image` audit + `sizes` migration

- **Status:** ⏸️ Não iniciado
- **Motivo:** grep + glob no `src/` sandbox-dead (timeouts em todos os
  comandos). Sem listar os `<img>` literals não há como fazer
  substituição segura.
- **Quando retomar:** `grep -rn "<img " src/` em sessão sem sandbox
  degradado. Substituir por `next/image` com `sizes` apropriado
  (mobile-first, `100vw` mobile / `50vw` tablet / `33vw` desktop para
  grid cards).
- **Heurística rápida:** abrir `src/components/dashboard/InstallPrompt`,
  `HeaderPushButton`, etc — qualquer SVG/inline PNG estático é candidato.

### A2. Bundle analyzer run + top-3 chunks

- **Status:** ⏸️ Não iniciado
- **Motivo:** `pnpm build` e `pnpm check:bundle` ambos travados no
  sandbox.
- **Quando retomar:**
  ```bash
  pnpm build
  pnpm check:bundle           # top 5 chunks
  ANALYZE=true pnpm build     # gera .next/analyze/client.html
  ```
- **Próxima ação esperada:** identificar chunks > 200KB raw, aplicar
  mais dynamic imports nas importações estáticas desses chunks.

### A3. Font preconnect + preload check

- **Status:** ✅ Já feito Wave 11
- **Verificado em `app/layout.tsx`:** Cinzel (600) + Raleway (400/500/600)
  ambos com `display: "swap"` + `preload: true`. Cormorant + IM_Fell
  com `preload: false` (não críticos). **Sem mudança necessária.**

### A4. Lazy load `empty-illustrations` + `error-states` + `motion`

- **Status:** ⏸️ Não aplicado nesta wave
- **Motivo:** não localizei consumers atuais desses componentes em
  rotas que carregam no initial bundle (grep morta). Esses arquivos
  só entram no bundle se alguma rota os importar — sem import path
  confirmado, dynamic import seria no-op.
- **Próxima ação:** rodar `grep -rn "from '@/components/design-system/empty-illustrations'" src/`
  em sessão normal, identificar top-3 consumers, e aplicar dynamic
  onde fizer sentido (ex: `<NotFound>` em `not-found.tsx` pode ser
  dynamic — só aparece quando erro já rolou, não precisa no initial).

---

## 📎 Apêndice B — Limitações do Sandbox

### Comportamento observado nesta sessão

- **Bash dead** em `/workspace/cabaladoscaminhos/`: todo comando
  (`ls`, `cat`, `git status`, `git add`, `git commit`, `pnpm build`)
  trava ≥30s, mesmo `echo hi` no diretório raiz.
- **Glob/grep** timeouts idênticos em qualquer path dentro de
  `cabaladoscaminhos/`.
- **Read/Edit/Write tools** funcionam normalmente em paths conhecidos.

### Workaround aplicado

- Read específico nos arquivos-alvo para entender contexto.
- Write/Edit direto, sem preview de listagem de diretório.
- Sem git commit nesta sessão (ver mensagem de commit abaixo para
  o owner colar localmente).

### Mensagem de commit (owner: rodar localmente)

```bash
cd /workspace/cabaladoscaminhos
git add \
  src/lib/monitoring/web-vitals.ts \
  src/components/monitoring/WebVitalsReporter.tsx \
  src/app/layout.tsx \
  src/app/feed/loading.tsx \
  src/app/library/loading.tsx \
  docs/PERF-QUICK-WINS-W18.md

git commit -m "perf(components): lazy load design-system + dynamic imports

Wave 18 quick wins (15min):
- Dynamic import PostCardSkeleton / ArticleCardSkeleton in feed/library loading.tsx
- Web Vitals tracker (LCP/CLS/INP/FCP/TTFB) via PerformanceObserver → PostHog
- Critical CSS inline (above-the-fold tokens) in layout.tsx
- New doc: docs/PERF-QUICK-WINS-W18.md

No new deps. No push. Sandbox degraded — git commit deferred to owner.

Refs: PERFORMANCE-BUDGETS.md (existing budget gates remain unchanged)"
```

### Validação pós-commit (owner)

```bash
pnpm install
pnpm tsc --noEmit
pnpm build
pnpm check:bundle
# manualmente: abrir DevTools, navegar entre /feed e /library,
# confirmar console.debug [web-vital] em dev mode
```

---

## 🔗 Referências

- [PERFORMANCE-BUDGETS.md](./PERFORMANCE-BUDGETS.md) — budgets já enforced
- [PERFORMANCE-AUDIT.md](./PERFORMANCE-AUDIT.md) — auditorias full-scope
- `scripts/check-bundle-size.ts` — gate de bundle size
- [web.dev/vitals](https://web.dev/vitals/) — Core Web Vitals thresholds
- Next.js docs: [Lazy Loading](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading),
  [Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts),
  [Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)

---

## 📝 Changelog

- **2026-06-27** — Wave 18 v1: 3 quick wins aplicados (dynamic imports
  em 2 loading.tsx, web-vitals tracker, critical CSS inline). 2 wins
  não-aplicados (image audit + bundle run) bloqueados por sandbox
  degradado — ver Apêndice A.