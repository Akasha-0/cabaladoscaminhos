# Performance Budgets

> **Status:** ✅ Ativo desde 2026-06-27
> **Workflow:** `.github/workflows/perf-budgets.yml`
> **Script:** `scripts/check-bundle-size.ts`
> **Owner:** Performance (Aki)

Este documento define os **budgets de performance** do Akasha Portal e como
eles sao enforced em CI. O objetivo e simples: **bloquear regressao de bundle
size e tempo de resposta antes de chegar em producao**.

---

## 📊 Budgets Ativos

### Core Web Vitals (campo, p75 mobile)

| Metrica | Budget | Threshold de Alerta | Status |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | > 2.8s | 🔴 Critical |
| **FID** (First Input Delay) | < 100ms | > 150ms | 🟡 Degraded |
| **CLS** (Cumulative Layout Shift) | < 0.1 | > 0.15 | 🟡 Degraded |
| **INP** (Interaction to Next Paint) | < 200ms | > 250ms | 🟡 Degraded |
| **TTFB** (Time to First Byte) | < 800ms | > 1200ms | 🟡 Degraded |
| **FCP** (First Contentful Paint) | < 1.8s | > 2.0s | 🟡 Degraded |
| **TBT** (Total Blocking Time) | < 200ms | > 300ms | 🟡 Degraded |

> **Nota:** FID foi descontinuado pelo Google em 2024 em favor de INP.
> Mantemos FID no budget para compatibilidade com versoes antigas do Lighthouse
> e dados historicos. INP e a metrica ativa.

### Bundle Size (CI gate, enforced em PR)

| Budget | Limite | Motivo |
|---|---|---|
| **Maior chunk JS** | < 250 KB (raw) | TTI em 3G simulado fica < 3s se cada chunk < 250KB |
| **Total chunks JS** | < 5 MB (raw) | Cabem em 1.5MB gzipped (taxa media ~70% compressao) |
| **Maior chunk CSS** | < 100 KB (raw) | Critical CSS inline + resto lazy |
| **Total CSS** | < 500 KB (raw) | (informational por enquanto) |

**Por que raw e nao gzipped?**
- Raw e estavel entre Node versions e facil de medir (`fs.statSync`).
- Gzipped e o wire-size real, mas varia com level do compressor.
- Mostramos ambos no report (`scripts/check-bundle-size.ts`).

**Por que 250 KB e nao 200 KB?**
- Aki (persona de performance) recomenda 200 KB gzipped.
- 250 KB raw ≈ 80 KB gzipped para libs tipicas — bem dentro do recomendado.
- Margem permite libs como `@supabase/ssr` (~30KB) sem code-splitting
  agressivo em todas as rotas.

---

## 🚀 Como Rodar Localmente

### Pre-requisitos

1. Node 22+ (ou a versao do `.nvmrc` se existir)
2. pnpm 9+
3. Build de producao gerado: `pnpm build`

### Comando Principal

```bash
pnpm build           # gera .next/static/chunks/
pnpm check:bundle    # roda o budget check
```

### Overrides de Budget (avancado)

```bash
# Tolerar chunks maiores temporariamente
pnpm check:bundle --max-chunk=400000   # 400 KB
pnpm check:bundle --max-total=8000000  # 8 MB

# Apontar para outro dir (debug)
pnpm check:bundle --dir=.next/static/chunks/app
```

### Output Esperado

```
╔══════════════════════════════════════════════════════════════╗
║   AKASHA PORTAL — Bundle Size Budget Check                   ║
╚══════════════════════════════════════════════════════════════╝

  Root:           /path/to/.next/static/chunks
  Max chunk:      250.00 KB  (256000 bytes)
  Max total:      5120.00 KB  (5242880 bytes)

  Top 5 maiores chunks (raw size):

    Rank           Raw        Gzipped  Kind  Path
    ────── ──────────── ────────────  ────  ────
    #1       189.42 KB      62.31 KB  js    framework-abc123.js
    #2       102.18 KB      35.40 KB  js    main-app-def456.js
    ...

  Resumo (apenas arquivos .js/.mjs):
    Total chunks: 47
    Soma total:   2340.18 KB (2396 bytes)
    Maior chunk:  189.42 KB  —  framework-abc123.js

  ✅ DENTRO DO BUDGET
     Headroom no maior chunk: 24.2%
     Headroom no total: 54.3%
```

---

## 🔧 Como o CI Falha

### Quando

O workflow `.github/workflows/perf-budgets.yml` roda em:

- ✅ Todo **PR aberto contra `main`**
- ✅ Toda **segunda 06:30 UTC** (scheduled, detecta drift)
- ✅ Manualmente via `workflow_dispatch`

### Como falha

1. Step `Check bundle size` roda `pnpm check:bundle`
2. Se exit code = 1 (budget estourado), o step marca como `failure`
   (mas usa `continue-on-error: true` para o comentario ser postado)
3. Step `Fail if budget exceeded` entao falha o job
4. Step `Comment PR with bundle report` posta tabela com top 5 chunks
5. PR fica bloqueado ate o budget voltar

### Mensagem no PR

O comentario sticky aparece assim:

```
## 📦 Bundle Size Budget

❌ **BUDGET ESTOURADO** — ver tabela abaixo.

<details>
<summary>📊 Top 5 maiores chunks + resumo</summary>
...
</details>

**Budgets enforced** (definidos em `docs/PERFORMANCE-BUDGETS.md`):
- Maior chunk JS: < 250 KB
- Total chunks JS: < 5 MB
```

---

## 🛠️ Como Corrigir Budget Estourado

### Playbook (TL;DR)

1. **Rode local** para reproduzir:
   ```bash
   pnpm build && pnpm check:bundle
   ```
2. **Identifique o chunk ofensor** na tabela top 5
3. **Investigue o conteudo** com `@next/bundle-analyzer`:
   ```bash
   ANALYZE=true pnpm build
   # Abre .next/analyze/client.html no browser
   ```
4. **Aplique uma das 5 mitigacoes** abaixo
5. **Re-valide** com `pnpm check:bundle`

### 5 Mitigacoes Comuns

#### 1. Dynamic Import (code splitting)

```tsx
// ❌ Errado: bundle no initial JS
import { Chart } from 'chart.js';

// ✅ Certo: carrega so quando precisa
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('chart.js').then(m => m.Chart), {
  ssr: false,
});
```

#### 2. Tree-shaking friendly imports

```tsx
// ❌ Errado: importa TUDO da lib
import * as Icons from 'lucide-react';

// ✅ Certo: so o icone usado
import { Home } from 'lucide-react';
```

#### 3. Substituir lib pesada

| Lib original | Tamanho | Alternativa | Tamanho |
|---|---|---|---|
| `moment` (300KB) | ❌ | `date-fns` ou `dayjs` | 10-20KB ✅ |
| `lodash` (70KB) | ⚠️ | `lodash-es` + cherry-pick | ~5KB ✅ |
| `chart.js` (200KB) | ❌ | `recharts` ou dynamic import | 50KB ✅ |
| `@mui/material` (300KB+) | ❌ | Headless UI + Tailwind | ~10KB ✅ |

#### 4. Mover para server component

```tsx
// ❌ Errado: client component por default
'use client';
import { Markdown } from 'react-markdown';
export function Post() { return <Markdown>{content}</Markdown>; }

// ✅ Certo: server component, sem JS no client
import { Markdown } from 'react-markdown';  // server-side render
export function Post() { return <Markdown>{content}</Markdown>; }
```

#### 5. Lazy load abaixo da fold

```tsx
// ❌ Errado: CommentsBundle no initial bundle
import { CommentsBundle } from './CommentsBundle';
export function PostPage() {
  return <><Post /><CommentsBundle /></>;
}

// ✅ Certo: so carrega quando usuario scrolla perto
import dynamic from 'next/dynamic';
const CommentsBundle = dynamic(() => import('./CommentsBundle'));
```

### Quando Aumentar o Budget (legitimo)

Se apos analise a dep nova e **essencial** e **inevitavel**:

1. Documente a justificativa em `docs/adr/` (Architecture Decision Record)
2. Proponha novo budget em PR com dados de impacto
3. Coordene com time (Code Review + PM) antes de subir budget

**NUNCA** faca `pnpm check:bundle --max-chunk=1000000` para silenciar.

---

## 📈 Metricas Auxiliares (nao enforced em CI)

| Metrica | Onde Medir | Target |
|---|---|---|
| Lighthouse Performance | PageSpeed Insights | >= 90 |
| Lighthouse Accessibility | PageSpeed Insights | >= 95 |
| Bundle gzipped (wire) | `check:bundle` (info) | < 200 KB por rota |
| TTFB Vercel Edge | Vercel Analytics | < 200ms p75 |
| AI response cache hit | PostHog funnel | > 40% |

---

## 🔗 Referencias

- [PERFORMANCE-AUDIT.md](./PERFORMANCE-AUDIT.md) — auditorias periodicas
- [PERSONAS: Aki (Performance)](../agent-configs/performance-persona.md) — voz/tom
- [Next.js Bundle Analyzer docs](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
- [Web Vitals](https://web.dev/vitals/) — Google
- `.github/workflows/perf-budgets.yml` — implementacao do CI
- `scripts/check-bundle-size.ts` — implementacao do check

---

## 📝 Changelog

- **2026-06-27** — v1: budget gate implementado (250KB / 5MB). Workflow
  perf-budgets.yml adicionado, check-bundle-size.ts com suporte a gzip
  informational. Scheduled run segunda 06:30 UTC.
