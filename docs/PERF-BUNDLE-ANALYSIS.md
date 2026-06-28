# Bundle Analysis — Setup & Workflow

> **Status:** ✅ Ativo desde Wave 11 (2026-06-27)
> **Tool:** `@next/bundle-analyzer` v16.2.9 (compat with Next 16.2.6)
> **Script:** `pnpm analyze:bundle` / `pnpm analyze:bundle:open`
> **Output:** `.next/analyze/{client,server,edge}.html`
> **Owner:** Performance (Aki)

Este documento descreve **como rodar e ler** o bundle analyzer no Akasha
Portal. Sem essa ferramenta, qualquer decisão de "isso é pesado demais?" é
achismo. Com ela, **cada KB fica visível e justificável**.

---

## 🚀 Quick Start

### Local

```bash
# Gera o report estático em .next/analyze/*.html (não abre o browser)
pnpm analyze:bundle

# (opcional) Abre o report no browser ao final do build
pnpm analyze:bundle:open
```

Os arquivos gerados:

```
.next/analyze/
  ├── client.html   # bundle do browser (o que importa p/ CWV)
  ├── server.html   # bundle do Node runtime (SSR/RSC + APIs)
  ├── edge.html     # bundle do Edge runtime (middleware)
  └── *.json        # dados crus (drill-down via treemap JS)
```

**Abra `client.html`** no browser — é a vista interativa (treemap + lista)
do JS que vai pro navegador do usuário.

### CI / Scheduled

O analyzer não roda por padrão em CI (é pesado, ~2-3 min extras). A
recomendação é rodar **semanalmente** (segunda 06:30 UTC, junto com o
`perf-budgets.yml`) e postar o report como artifact.

> **Wave 11:** script CI não foi adicionado nesta onda (escopo era setup
> local). Wave 12+ pode adicionar `bundle-analyzer.yml` similar ao
> `perf-budgets.yml`.

---

## 🔧 Configuração

### `next.config.ts`

```ts
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true", // gate por env var
  openAnalyzer: false,                    // CI-friendly
  analyzerMode: "static",                 // gera HTML sem server
  reportFilename: "../analyze/[type].html",
  defaultSizes: "gzip",                   // mostra tamanhos gzipped
});

const nextConfig: NextConfig = { /* ... */ };
export default withBundleAnalyzer(nextConfig);
```

**Por que `enabled: process.env.ANALYZE === "true"`?**
- Sem a env var, o wrapper é no-op (zero overhead em dev/build normais)
- `pnpm analyze:bundle` define `ANALYZE=true` automaticamente
- CI roda o build normal (sem analyzer) e o build com analyzer sob demanda

### `package.json`

```json
"scripts": {
  "analyze:bundle":      "ANALYZE=true next build",
  "analyze:bundle:open": "ANALYZE=true next build --turbo"
}
```

> **Por que `--turbo` no `:open`?** Turbopack é ~2x mais rápido no build,
> ótimo pra iteração local. **Não usar em CI** — Turbopack ainda tem
> divergências com webpack em alguns casos.

---

## 📊 Como Ler o Report

### Treemap (vista padrão)

Cada retângulo = um módulo. **Tamanho da área = tamanho do bundle**.

| Sinal | O que procurar |
|---|---|
| 🔴 Retângulo gigante | Dependência pesada (chart.js, moment, lodash inteiro) |
| 🟡 Muitos retângulos pequenos da mesma lib | Tree-shaking falhou — imports não específicos |
| 🟢 Retângulos em "vendor chunks" | Boa separação Next.js (React, framework, lib) |
| 🟢 Muitas cores diferentes por rota | Code splitting funcionando |

### Lista (vista "Stat")

Ordenada por tamanho parseado. **3 colunas importam:**

| Coluna | Significado |
|---|---|
| **Parsed** | Tamanho que o V8 vai compilar (≈ tempo de execução) |
| **Gzipped** | Tamanho transferido pela rede (≈ impacto no CWV) |
| **Path** | Caminho do módulo no código |

> **Regra prática:** Parsed > 50 KB para um único módulo = candidato
> imediato a dynamic import.

---

## 🎯 Budgets Específicos por Análise

Os budgets do `docs/PERFORMANCE-BUDGETS.md` (250 KB chunk / 5 MB total)
são o **gate duro**. Este documento adiciona **alvos por rota** baseados
no wave 11:

| Rota | Target gzipped JS inicial | Por quê |
|---|---|---|
| `/` (landing) | < 80 KB | Marketing copy + hero — não tem feature interativa |
| `/feed` | < 90 KB | PostCard + useFeed (SWR/React Query) — conteúdo principal |
| `/groups/[slug]` | < 100 KB | Header + tabs + posts — feed filtrado |
| `/akashic` | < 120 KB | Composer + message list + Select — heavy IA interaction |
| `/library` | < 100 KB | Article cards + filters |
| `/explore` | < 110 KB | Tabs + search results + filters |
| `/u/[handle]` | < 70 KB | Cover + profile + posts (lazy) |
| `/login`, `/onboarding` | < 60 KB | Forms only |

> **Como medir:** no report, filtrar por rota e somar os chunks `app/...`
> (não `framework-...`, não `polyfills-...`). Os chunks `framework` são
> compartilhados por todas as rotas.

---

## 🔍 Workflow de Investigação

### "Minha rota X está grande — e agora?"

1. **Rode o analyzer focado na rota:**
   ```bash
   pnpm analyze:bundle
   # Abrir .next/analyze/client.html
   # Filtrar por "app/(community)/feed/"
   ```
2. **Identifique o chunk ofensor:** tipicamente o maior da lista filtrada
3. **Clique no chunk** no treemap → mostra o que está dentro
4. **Cruzamento:** abra o arquivo do código-fonte que importa esse módulo
5. **Decida a mitigação** (5 opções abaixo)

### 5 Mitigações (do `PERFORMANCE-BUDGETS.md`, recall)

| # | Mitigação | Quando aplicar |
|---|---|---|
| 1 | `next/dynamic` (code split) | Componente pesado usado condicionalmente |
| 2 | Tree-shaking (named imports) | Lib grande com barrel exports |
| 3 | Substituir lib | Lib tem alternativa mais leve |
| 4 | Mover para RSC | Lógica que não precisa de JS no client |
| 5 | Lazy load abaixo da fold | Conteúdo não-acima-do-fold |

### "Como sei se minha otimização funcionou?"

```bash
# Antes
pnpm analyze:bundle  # → anota top-5 chunks da rota X
# Aplica a otimização
# Depois
pnpm analyze:bundle  # → compara top-5 chunks da rota X
```

Salve os reports em `docs/PERF-BUNDLE-ANALYSIS-SNAPSHOTS/` (wave 12+ pode
automatizar isso com diff em CI).

---

## 🛠️ Troubleshooting

### "Build trava / OOM"

O sandbox do projeto é 2 GB RAM. O analyzer sozinho adiciona ~300 MB ao
build (gera HTML estático de cada chunk). Se OOM:

```bash
NODE_OPTIONS='--max-old-space-size=4096' pnpm analyze:bundle
```

### "Report não gera"

Verifique:
1. `ANALYZE=true` está no ambiente?
2. `.next/` existe (rode `pnpm build` antes se necessário)?
3. Permissão de escrita em `.next/analyze/`?

### "Treemap muito denso / ilegível"

Filtre por rota no canto superior direito do HTML. Ou use o `.json` cru:

```bash
# Lista top-20 módulos por parsed size
cat .next/analyze/client.json \
  | jq -r '.. | .name? // empty' \
  | head -20
```

---

## 📚 Referências

- [`@next/bundle-analyzer` docs](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Next.js: optimize bundles](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
- [Webpack: visualize bundle](https://webpack.js.org/guides/code-splitting/#bundle-analysis)
- [`docs/PERFORMANCE-BUDGETS.md`](./PERFORMANCE-BUDGETS.md) — budgets duros
- [`docs/PERF-DEEP-WAVE11.md`](./PERF-DEEP-WAVE11.md) — antes/depois desta wave

---

## 📝 Changelog

- **2026-06-27** — Wave 11: setup completo (`@next/bundle-analyzer` v16.2.9,
  `pnpm analyze:bundle` script, este doc). Report ainda não foi gerado em
  CI (sandbox OOM); primeira geração real será no Wave 12 ao rodar em
  ambiente com 4 GB+ RAM.