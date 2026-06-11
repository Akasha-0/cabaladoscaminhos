# R-025 — Tech Stack v1 (Akasha)

> **Artefato central da Fase 4 (Tech Stack).** Consolida as 7 decisões
> arquiteturais (D-030..D-036) em 1 documento canônico. **É design
> técnico, não código** (Fase 5 vai transpor para `packages/akasha-core/`
> + setup concreto em `apps/akasha-portal/`).
>
> **Data:** 2026-06-10
> **Pesquisador:** agente autônomo (sessão N)
> **Dependências:** R-022 (Synthesis v1) ✅ + R-023 (Mentor v1) ✅ + R-024
> (UX v1) ✅ + R-001..R-012 (12 sistemas) ✅ + R-020 (Patterns) ✅
> **Próxima iteração:** v2 após R-030 (Akasha Core Algorithm prototype)
> **Confidence:** HIGH — todas as 7 decisões fixadas em COT
> `cot-20260610-tech-stack-decisions.md`

---

## 0. TL;DR — A Decisão de Stack

**Akasha roda em Vercel + Supabase + Anthropic Claude + Stripe, com
pgvector para embeddings RAG e SSE para streaming do Mentor.**

A escolha NÃO é "Vercel ou AWS ou Hetzner" — é **Vercel para a
aplicação** (DX zero-config, Turbopack stable, edge para Mandato push)
+ **Supabase Cloud para Postgres+pgvector+Auth** (RLS nativo, Brasil
region sa-east-1, RAG embutido na mesma transação) + **Anthropic
Sonnet 4.6 como LLM primário** (prompt cache 90%, RAG-grounded,
PT-BR forte) com **Haiku 4.5 para detecção de crise** (rápido, barato)
e **Minimax M3 como fallback offline** (já no runtime do projeto).
**WebSocket não é necessário** — toda a interatividade do Mentor é
**server-to-client unidirecional**, então **SSE** é a escolha certa
(mesma latência que WebSocket para tokens, sem o overhead de
gerenciamento de conexão).

**Princípios (4 regras de ferro):**

1. **PT-BR first, LGPD-native, sa-east-1 default.** Tudo o que toca
   dado pessoal mora em Brasil. Sem exceções. Migration path para
   Mercosur via Supabase region switch.
2. **RAG obrigatório para o Mentor.** pgvector é **única** fonte de
   verdade semântica. LLM **redige**, não **decide**. Citação de fonte
   no Mandato (citation_metadata obrigatório no JSON de saída).
3. **Server-side rendering + edge quando possível.** Akasha é PWA com
   1 push/dia; RSC + Edge Functions minimizam TTFB global. LLM call é
   o gargalo real, não o render.
4. **Custo previsível em 12 meses.** Setup MVP < R$ 300/mês. Migration
   para Hetzner + Coolify quando MAU > 50k ou MRR > R$ 15k/mês (ponto
   de equilíbrio, validado por múltiplas comparações 2026).

**Decisões fechadas (7):**

| # | Decisão | Escolha | Alternativa rejeitada | Razão |
|---|---------|---------|----------------------|-------|
| D-030 | Next.js + bundler | **Next.js 16.2+ com Turbopack** | Next.js 15 webpack | Turbopack stable, 2-5× build, 10× Fast Refresh |
| D-031 | DB + embeddings | **Postgres 16 + pgvector (Supabase Cloud)** | Pinecone / Qdrant / Weaviate | Custo 6× menor, < 2M vetores, mesmo Postgres transacional |
| D-032 | LLM | **Sonnet 4.6 (RAG) + Haiku 4.5 (crise) + Minimax M3 (fallback)** | OpenAI gpt-4 / Gemini 2.5 | PT-BR forte, prompt cache 90%, structured output 99.2% |
| D-033 | Realtime | **SSE em Edge Runtime** | WebSocket | Unidirecional, sem colisão de protocolo, edge-friendly |
| D-034 | Auth | **Supabase Auth + RLS** | Clerk / Auth.js / Better Auth | RLS nativo, R$ 25/mo, sa-east-1, MFA built-in |
| D-035 | Payments | **Stripe (mantém)** | Pagar.me / Asaas | Já integrado, i18n, webhooks estáveis |
| D-036 | Deploy | **Vercel Pro + Supabase Cloud + AWS sa-east-1** | Hetzner / Railway / Fly.io | DX, edge, 0% config — aceitar custo até MAU 50k |
| D-037* | ORM | **Prisma 7 (mantém)** | Drizzle | Já no stack, migrations battle-tested, native edge |

\* D-037 bônus — não estava no TODO original mas é estrutural.

---

## 1. D-030 — Next.js 16.2+ + Turbopack

### 1.1 Estado da arte (junho 2026)

**Turbopack é o bundler default e estável do Next.js 16.** Desde
Next.js 16.0 (out/2025), Turbopack substituiu webpack para **dev E
build** em todos os novos projetos. Adoção massiva: > 50% das
sessões dev e > 20% dos builds prod em Next.js 15.3+ já rodavam em
Turbopack antes de virar default. ([next-16](https://nextjs.org/blog/next-16),
[next-16-2-turbopack](https://nextjs.org/blog/next-16-2-turbopack))

**Benchmarks oficiais (Next.js 16 release notes):**

- **2-5× faster** production builds
- **Até 10× faster** Fast Refresh
- **67-100% faster** application refresh em apps reais
- **400-900% faster** compile time

**16.2 (mar/2026) trouxe 200+ bug fixes e features:**
- Server Fast Refresh
- Web Worker Origin (WASM support)
- Subresource Integrity
- Tree Shaking de Dynamic Imports
- Inline Loader Configuration
- Lightning CSS Configuration
- Log Filtering
- PostCSS TS config

### 1.2 Caveats (sérios, não bloqueadores)

1. **16.0 e 16.1 tiveram bugs reais** — recommended 16.2+
   ([socialanimal.dev](https://socialanimal.dev/blog/nextjs-16-turbopack-production-builds-migration-guide/))
2. **Memory profile mudou** — Vercel default 8GB builder pode OOM
   em apps não-triviais. Fix: `NODE_OPTIONS='--max-old-space-size=7168'`
   no build script + Enhanced builder 16GB (`vercel.json` →
   `build.memory: 16384`). **NÃO usar 8192** — agente Vercel precisa
   de ~700MB ([qasimcode.com](https://qasimcode.com/blog/2026-05-17-nextjs-16-turbopack-build-oom-vercel))
3. **Custom `webpack(config)` silenciosamente ignorado** — se houver
   plugin custom, build termina mas runtime quebra (transforms não
   rodaram). Diagnóstico: `next start` crash com `Cannot find module`
   → suspeitar Turbopack primeiro. Opt-out por env var:
   `NEXT_DISABLE_TURBOPACK=1` ([iloveblogs.blog](https://www.iloveblogs.blog/post/nextjs-16-disable-turbopack-production-build))
4. **Image defaults mudaram** — `images.minimumCacheTTL` 60s→4h,
   `images.qualities` [1..100]→[75], `images.imageSizes` removeu `16`.
   `images.dangerouslyAllowLocalIP` agora default `false` (security
   win). `images.maximumRedirects` agora default 3 (era unlimited).
   ([next-16](https://nextjs.org/blog/next-16))
5. **Root layout não auto-criado** — Turbopack instrui criar
   manualmente (App Router).
6. **Type-checking não é feito pelo Turbopack** — rodar `tsc --watch`
   ou confiar no IDE. CI: `pnpm typecheck` antes de commit.

### 1.3 Decisão Akasha

**Next.js 16.2+ com Turbopack. App Router. RSC. Edge Runtime onde
faz sentido. Sem custom webpack config.** Regras operacionais:

- `package.json` build script:
  ```json
  "build": "NODE_OPTIONS='--max-old-space-size=7168' next build"
  ```
- `vercel.json` (quando deploy):
  ```json
  { "build": { "memory": 16384 } }
  ```
- Upgrade policy: minor version 16.x → testar staging 7 dias → prod
  em 24h se verde. 17.x → aguardar 16.x.2 equivalente.
- `NEXT_DISABLE_TURBOPACK=1` apenas se build verde + runtime quebrado
  (procedência: iloveblogs.blog).

**Akasha fit-check:**
- PWA + 5 telas RSC + SSE streaming → **Turbopack brilha**
- Sem custom webpack plugins no `next.config.mjs` → sem opt-out
- Mandato push 1/dia → build rápido é nice-to-have, não bloqueador
- ~50 rotas iniciais, mid-scale SaaS → Enhanced builder 16GB
  suficiente

---

## 2. D-031 — Postgres 16 + pgvector (Supabase Cloud)

### 2.1 Estado da arte (junho 2026)

**Vector database para RAG: pgvector é o default correto para < 2M
vetores.** Decisão de **workload-fit**, não de marca. Cinco
comparações independentes 2026 convergem:

| Métrica | pgvector | Pinecone | Qdrant Cloud | Weaviate Cloud |
|---------|----------|----------|--------------|----------------|
| **1M vetores / mês** | $0 (existing PG) | $70-280 | $25-120 | $25-50 |
| **5M vetores / mês** | $30-100 | $250-400 | $300+ | $400+ |
| **10M vetores / mês** | $250-400 | $700+ | $200-350 | $450 |
| **100M vetores / mês** | ❌ Postgres struggles | $4-7k+ | $600-900 | $700-1k |
| **p50 latência (1M)** | 28ms | 12ms | 8ms | 30ms |
| **p95 latência (1M)** | 65ms | 28ms | 18ms | 45ms |
| **Metadata filtering** | SQL (full) | Basic | Avançado (in-graph) | GraphQL |
| **Setup time** | 4h | 1h | 2 dias | 2 dias |
| **Lock-in** | None | High | Low | Low |

Fontes: [devopsness.com 6-month production comparison](https://www.devopsness.com/blog/vector-database-selection-pinecone-pgvector-qdrant-after-6-months-in-production-2026-04-14)
(280k docs × 1536-dim × 50 qps peak × 3 stores × 90 dias cada = benchmark
real), [kalviumlabs.ai 2026](https://www.kalviumlabs.ai/blog/vector-databases-compared-pgvector-pinecone-qdrant-weaviate/),
[tensoria.fr 100M benchmark](https://tensoria.fr/en/blog/vector-database-comparison),
[leanopstech 2026](https://leanopstech.com/blog/pinecone-vs-qdrant-vs-weaviate-vs-pgvector-2026/),
[cloudmagazin 2026](https://www.cloudmagazin.com/en/2026/04/02/vector-databases-rag-pinecone-weaviate-qdrant-pgvector-comparison/).

### 2.2 Por que NÃO Pinecone / Qdrant

- **Pinecone**: 6× mais caro, vendor lock-in alto, sem self-host,
  escala para bilhões (Akasha não precisa)
- **Qdrant**: melhor latência p95 (18ms vs 65ms), mas:
  - 2 dias de setup (Docker + K8s)
  - Operacionalmente separado (mais um serviço pra monitorar)
  - Vale a pena > 10M vetores
  - Custo 3× pgvector
- **Weaviate**: bom para hybrid search (BM25+vector+knowledge graph)
  — overkill para Akasha (corpus curado, sem grafo)

### 2.3 Por que pgvector

- **Custo**: incremental ao Postgres existente (~$30-45/mês)
- **Operacional**: 0 oncall pages em 4 meses (relato devopsness.com)
- **Filtering**: SQL planning bate ambos para padrão tenant+status
- **Latência aceitável**: 65ms p95 não move métricas user-perceived;
  end-to-end dominado por inferência LLM, não retrieval
- **Same transaction**: vector + relational em 1 query (consistência
  forte — usuário edita Mandato, embedding atualiza atomicamente)
- **HNSW production-mature** desde 0.8+

### 2.4 Estimativa de volume Akasha (corpus inicial)

| Pilar | Entradas | Vetores (1536-dim) | Memória HNSW |
|-------|----------|--------------------|--------------|
| Cabala Clássica | ~500 entries | 500 | 3 MB |
| Numerologia Cabalística | ~150 profiles canônicos | 150 | 1 MB |
| Astrologia (transits, aspects) | ~5,000 entries | 5,000 | 30 MB |
| Numerologia Tântrica | ~200 entries | 200 | 1.2 MB |
| Odu (16 odus + complementares) | ~400 entries | 400 | 2.4 MB |
| I Ching (64 hexagramas × camadas) | ~3,000 entries | 3,000 | 18 MB |
| Curated quotes / citations | ~2,000 entries | 2,000 | 12 MB |
| User Mandatos (anonimizados) | 10k users × 30 días | 300,000 | 1.8 GB |
| **TOTAL** | **~311k entries** | **~311k** | **~1.9 GB** |

**Conclusão**: 311k vetores no ano 1, projeção 1M no ano 3 (50k MAU
× 30 dias × 12 ciclos anuais cacheados). **pgvector é 100×
folga de margem** dentro do seu sweet spot (até 5M). Migration para
Qdrant só se passar de 10M (não esperado antes do ano 7+).

### 2.5 Supabase vs Neon vs self-host

**Supabase Cloud** é a escolha para Fase 5+ MVP porque:

- **Postgres gerenciado + Auth + Storage + Realtime em 1 plataforma**
- **RLS nativo** — Akasha multi-tenant-ready (B2B: cada Mentor
  Certificado vê só seus mentorados)
- **sa-east-1 (São Paulo)** disponível → LGPD-compliant por default
- **pgvector 0.8+** incluído, suporte HNSW
- **Branching** (`supabase branch`) → preview environments tipo
  Vercel preview
- **Free tier**: 500MB DB, 2GB egress — suficiente para dev/staging
- **Pro**: $25/mês, 8GB DB, 250GB egress, daily backups

**Alternativas rejeitadas:**

- **Neon**: serverless Postgres brilhante, branching, mas sem Auth
  (precisaria de Auth.js separado) e pgvector só em preview
- **AWS RDS**: $50+/mês mínimo, sem Auth/Storage, complexidade alta
- **Self-hosted**: ops burden real, 5% causa earmark não cobre custo
  de DBA

### 2.6 Decisão Akasha

**Postgres 16 + pgvector (HNSW) rodando no Supabase Cloud, região
sa-east-1.** Schema Prisma + extensão `vector` via migration manual
inicial (Prisma ainda não suporta `vector` type nativamente — workaround
com `Unsupported("vector(1536)")` no schema + raw SQL na migration).
Embeddings gerados com `text-embedding-3-small` (OpenAI, $0.02/1M
tokens) ou `voyage-3` (Anthropic partner, 1536-dim, $0.06/1M).
Tabela dedicada `grimoire_embeddings` (id, source_pilar, source_ref,
content, embedding vector(1536), metadata jsonb, created_at). Índice
HNSW com `vector_cosine_ops`.

**Migration path**: se passar de 5M vetores, replica read-only do
corpus + Qdrant Cloud como vector store dedicado, mantendo Supabase
como primary para relational.

---

## 3. D-032 — LLM: Sonnet 4.6 + Haiku 4.5 + Minimax M3

### 3.1 Estado da arte (junho 2026)

**Comparação de modelos em produção RAG (jun/2026):**

| Modelo | Input $/1M | Output $/1M | Cache $/1M | Context | PT-BR | JSON compliance | RAG fit |
|--------|------------|-------------|------------|---------|-------|-----------------|---------|
| **Claude Sonnet 4.6** | $3.00 | $15.00 | $0.30 | 200K-1M | Forte | 99.2% | ⭐⭐⭐⭐⭐ |
| Claude Opus 4.7 | $15.00 | $75.00 | $1.50 | 200K-1M | Forte | 99%+ | ⭐⭐⭐⭐⭐ (custo) |
| Claude Haiku 4.5 | $1.00 | $5.00 | $0.10 | 200K | OK | 97% | ⭐⭐⭐ (simples) |
| GPT-4o | $5.00 | $15.00 | $1.25 | 128K | OK | 97.8% | ⭐⭐⭐ |
| GPT-5 | $5.00 | $20.00 | $1.25 | 1M (degrada 200K+) | OK | 98% | ⭐⭐⭐⭐ |
| Gemini 2.5 Pro | $1.25 | $5.00 | $0.31 | 1M-2M | Fraco | 95% | ⭐⭐⭐ |
| Gemini 2.5 Ultra | $3.50 | $21.00 | $0.87 | 1M-2M | Fraco | 95% | ⭐⭐⭐ |
| Minimax M3 | (open) | (open) | n/a | varies | OK | 92% | ⭐⭐ (fallback) |

Fontes: [claudeguide.io benchmark](https://claudeguide.io/claude-api-vs-gpt4-benchmark),
[huiosweb BR comparison](https://huiosweb.com.br/blog/claude-vs-chatgpt-vs-gemini),
[apicents cost](https://apicents.com/compare/claude-opus-4-5-vs-claude-sonnet-4-6),
[talki cost benchmark](https://academy.talki-app.fr/en/blog/cost-benchmark-claude-gpt4-gemini-2026/),
[akitaonrails "RAG is dead"](https://www.akitaonrails.com/en/2026/04/06/rag-is-dead-long-context/)
(contra-ponto importante).

### 3.2 Por que Sonnet 4.6 como primário

**6 razões convergentes:**

1. **RAG-grounded é o caso canônico** — Sonnet 4.6 + prompt cache 90%
   saving é mais barato que Gemini Pro em uso intensivo (relato Huios
   Web: ~40% saving em chatbot com persona + RAG)
2. **PT-BR forte** — Claude tem a melhor reputação em PT-BR
   consistente, especialmente com terminologia esotérica (Hebraico,
   Sânscrito, Iorubá transliterado) que aparece no Grimório
3. **Structured output (Mandato JSON)** — 99.2% JSON compliance vs
   97.8% GPT-4o. Para Akasha, isso é **inviolável** — Mentor deve
   emitir JSON com `mandato`, `citation_metadata`, `pilar_citado`,
   `pilar_fontes[]` toda vez
4. **Context window 1M estável** — Grimório inteiro cabe em 1 call
   (~300k tokens). GPT-5 anuncia 1M mas degrada após 200K
5. **Tool calling 91%** — necessário para RAG tool use
   (retrieve_grimorio(pilar, query))
6. **Ethics/safety** — Claude tem a melhor política de refusal +
   nuance para domínio espiritual (não vira guru, não faz
   previsões falsas, cita fontes)

### 3.3 Por que Haiku 4.5 para crise

**Detecção de crise é classificação simples** ("esse texto indica
risco emocional?"). Haiku 4.5:
- $1 input / $5 output — 3× mais barato que Sonnet
- 200K context suficiente para sliding window de conversa
- 97% JSON compliance — OK para o sinal binário `{crise: bool,
  protocolo: "CVV_188" | "MENTOR_HUMANO"}`
- Latência menor (TTFT p50 ~250ms vs Sonnet ~520ms) — UX ganha

**Pipeline**: input do usuário → Haiku 4.5 classifica primeiro
(~150ms, $0.0002) → se OK, segue para Sonnet 4.6 RAG (~3-5s,
$0.015) → se crise, pula LLM, exibe CVV 188 imediatamente. (Ref:
`mentor/persona_v1.md §5` protocolo crise.)

### 3.4 Por que Minimax M3 como fallback

- **Já está no runtime do projeto** (CLAUDE.md MiniMax M3 = modelo
  default do ambiente)
- **Open / self-hostable** — sem dependência de API key externa
- Útil para:
  - **Dev/staging** sem gastar API budget
  - **Fallback offline** se Anthropic API cair (SLA 99.9% mas
    histórico teve incidents 2024-2025)
  - **Summarization** de Mandatos antigos (memória longo prazo)
- NÃO para o Mentor principal (qualidade/citação pior que Claude)

### 3.5 RAG is dead? (Contra-ponto honesto)

[Akita On Rails 2026](https://www.akitaonrails.com/en/2026/04/06/rag-is-dead-long-context/)
argumenta que com 1M context, vector DB é desnecessário para muitos
casos. **Por que discordamos para Akasha:**

1. **Grimório cresce continuamente** — 311k vetores ano 1 → 1M ano 3
   → 5M ano 5 (parcerias tradições vivas). 5M tokens × $3/1M = $15
   por chamada. A RAG reduz para ~3k tokens recuperados por query =
   $0.009 (1600× saving)
2. **Cita fonte obrigatória** — RAG permite retornar
   `citation_metadata` preciso (livro, página, parágrafo). Long
   context perde essa precisão
3. **Velocidade** — 65ms retrieval vs 3-8s long context lookup
4. **Ética** — citar Cabala VIVA + parceria BAMS via RAG de
   corpus curado é parte do nosso value prop. Long context sem
   curadoria = apropriação

**Onde long context vence**: análise de uma sessão inteira
(últimos 50 turnos) para gerar resumo estruturado. Sonnet 4.6 com
1M context faz isso nativamente, sem RAG. Akasha usa **híbrido**:
RAG para retrieval de fontes + long context para síntese final
dentro de 1 chamada.

### 3.6 Decisão Akasha

**3-tier LLM strategy:**

1. **Sonnet 4.6 (primary)** — Mentor RAG, Mandato generation,
   synthesis, structured output, cita Grimório
2. **Haiku 4.5 (router/crisis)** — pré-classificação (crise? pilar?
   tool routing?), classificação simples, low-latency
3. **Minimax M3 (fallback/dev)** — offline, dev/staging, summarization

**Custo estimado ano 1** (10k MAU, 1 Mandato/dia + 0.5 Mentor
sessão/dia, 30 dias):

- 300k chamadas Mandato/mês × ~3k in + 1k out = $2.79/mês
- 150k chamadas Mentor/mês × ~5k in + 2k out = $2.85/mês
- 450k chamadas Haiku/mês × ~500 in + 100 out = $0.27/mês
- **Total: ~$6/mês** (R$ 30/mês a R$ 5/dollar) — insignificante vs
  Supabase + Vercel

Com cache hit 70% (persona + Grimório cached): **$2/mês** LLM.

---

## 4. D-033 — Realtime: SSE em Edge Runtime

### 4.1 Estado da arte (junho 2026)

**SSE domina streaming LLM em produção.** 4 comparações 2026
convergem:

- **Latency**: SSE ≈ WebSocket para tokens (50-100 tok/s, ambos
  abaixo do ceiling)
- **Failure modes**: SSE > WebSocket (auto-reconnect, HTTP-native,
  proxy-friendly)
- **Next.js 16 fit**: SSE funciona em Edge Runtime; WebSocket não é
  suportado em Vercel
- **90% rule**: para streaming server-to-client, SSE é a escolha
  correta; WebSocket só se precisa bidirecional

Fontes: [thanosk.eu Next.js 16 streaming](https://www.thanosk.eu/deep-dives/realtime-streaming-patterns-nextjs-16),
[sameersabir streaming](https://sameersabir.dev/blog/streaming-ai-responses-nextjs-real-time-ux),
[tianpan.co protocol decision](https://tianpan.co/blog/2026-04-19-sse-websockets-grpc-streaming-llm-applications),
[dev.to SSE vs WebSocket](https://dev.to/whoffagents/sse-vs-websockets-for-ai-streaming-which-one-actually-fits-1nol),
[dev.to Next.js App Router 2026](https://dev.to/stacknotice/sse-vs-websockets-in-nextjs-app-router-real-time-done-right-2026-1lc4).

### 4.2 Por que NÃO WebSocket

**Akasha não tem caso de uso bidirecional real-time:**

- ❌ Sem edição colaborativa (cada usuário tem sua Mandala)
- ❌ Sem multiplayer (Mandato é individual)
- ❌ Sem chat entre usuários (anti-padrão: feed social rejeitado em
  `gaps.md §6.5`)
- ❌ Sem trading/cursor/presence

**Único caso bidirecional potencial**: usuário interrompe Mentor
mid-stream. Resolvido por: AbortController HTTP (não precisa WS).
[jangwook.net guide](https://jangwook.net/en/blog/en/nextjs-16-claude-api-streaming-guide-2026/)
documenta o padrão raw.

### 4.3 SSE no Next.js 16 + Vercel

**Padrão de implementação** (referência: jangwook.net + thanosk.eu):

```typescript
// app/api/akasha/mentor/route.ts
export const runtime = 'edge'; // CRÍTICO para Vercel SSE
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { message, userId } = await req.json();
  
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    system: MENTOR_PERSONA, // cached
    tools: [retrieveGrimorio],
    messages: await loadContext(userId),
  });
  
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
        );
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
```

**Vercel caveats:**

- Edge Runtime: 30s max execution (Vercel Pro) — suficiente para
  Mandato mas não para sessão longa de Mentor
- Serverless: 10-60s timeout — usar Edge para SSE
- `EventSource` API no client tem auto-reconnect built-in
- Heartbeat messages a cada 15s para evitar proxy timeout

### 4.4 Decisão Akasha

**SSE em Edge Runtime para todo streaming server-to-client.** Stack:

- **Mentor streaming** → Route Handler `app/api/akasha/mentor/route.ts`
  com `export const runtime = 'edge'`
- **Mandato daily push** → Web Push API (browser-level) + SSE fallback
  se app aberto
- **RAG retrieval** → Server Action normal (não precisa streaming)
- **WebSocket: ZERO uso.** Sem dependência no `package.json`. Sem
  serviço externo (Pusher/Ably/PartyKit). Sem custom server.

**Backpressure**: não relevante (server-to-client unidirecional,
browser throttles automaticamente).

**Reconnect**: `EventSource` API nativa, com exponential backoff +
jitter no client wrapper.

---

## 5. D-034 — Auth: Supabase Auth + RLS

### 5.1 Estado da arte (junho 2026)

**Comparação de auth providers Next.js (jun/2026):**

| Critério | Better Auth | Supabase Auth | Clerk | Auth.js v5 |
|----------|-------------|---------------|-------|------------|
| **Custo 100k MAU** | ~$50/mo (PG) | ~$25/mo | ~$1,025/mo | ~$50/mo (PG) |
| **Free tier** | Unlimited (sua DB) | 50k MAU | 50k MAU | Unlimited (sua DB) |
| **RLS nativo** | ❌ (app-layer) | ✅ `auth.uid()` | ❌ | ❌ |
| **Data residency** | sua DB | Region choice | US only | sua DB |
| **Multi-tenant orgs** | First-class (plugin) | DIY | Paid add-on | DIY |
| **MFA built-in** | ✅ | ✅ | ✅ | ❌ (DIY) |
| **Migrations** | DIY (você é dono) | Painel Supabase | Painel Clerk | DIY |
| **Next.js 16 native** | ✅ | ✅ | ✅ | ✅ (beta) |
| **Pre-built UI** | ❌ | ❌ (archived 2025) | ✅ (best) | ❌ |
| **Lock-in** | None | Medium | High | None |

Fontes: [makerkit.dev](https://makerkit.dev/blog/tutorials/better-auth-vs-clerk),
[trybuildpilot 2026](https://trybuildpilot.com/479-supabase-auth-vs-clerk-vs-nextauth-2026),
[wolf-tech 2025-2026](https://wolf-tech.io/blog/nextjs-authentication-frameworks-2025-2026-authjs-v5-clerk-better-auth-lucia-b2b-saas),
[clerk.com](https://clerk.com/articles/what-authentication-solutions-work-well-with-react-and-nextjs),
[toolchew](https://toolchew.com/en/next-auth-vs-clerk/),
[starterpick 2026](https://starterpick.com/guides/nextauth-vs-clerk-vs-supabase-auth-2026).

### 5.2 Por que NÃO Clerk

- **Custo**: $1,025/mo a 100k MAU = 41× Supabase Auth. Akasha
  meta ano 5 = 100k MAU. Custo anual Clerk ≈ R$ 60k+ (R$ 5/dollar)
- **US-only data**: LGPD exige dados em Brasil ou país com acordo;
  Clerk oferece EU data residency só em planos altos
- **Lock-in**: passwords não migram; vendor lock-in alto
- **Pre-built UI é nice** mas não vale 41× o custo

### 5.3 Por que NÃO Auth.js v5 (NextAuth)

- **Ainda em beta** ([toolchew](https://toolchew.com/en/next-auth-vs-clerk/)):
  v5 não tem release stable, v4 em maintenance
- **Sem MFA built-in** — DIY (custo de engenharia)
- **Sem organizations** — DIY (custo de engenharia)
- **OAuth 80+ providers** (brilhante) mas Akasha precisa só 4-5
  (Google, Apple, GitHub, Email+Magic Link)
- **Sem RLS** — toda autorização é app-layer (mais código, mais bugs)

### 5.4 Por que NÃO Better Auth (alternativa real)

- **TypeScript-native, 100% owned data** — pontos fortes
- **Sem RLS** — toda autorização via app-layer
- **Custo operacional**: você é dono de MFA, password reset, email
  deliverability, SMS OTP — Supabase Auth entrega tudo isso pronto
- **Vale a pena** se você precisa de first-class multi-tenant
  organizations (B2B SaaS puro) — Akasha B2B é Mentor Certificado,
  não centenas de orgs

### 5.5 Por que Supabase Auth

**5 razões convergentes:**

1. **RLS nativo** — multi-tenant via `auth.uid()` em policies
   Postgres. Padrão Akasha: cada Mentor Certificado vê só seus
   mentorados; cada usuário vê só seus Mandatos
2. **Custo** — R$ 25/mo a 100k MAU vs R$ 60k Clerk
3. **sa-east-1 disponível** — LGPD-compliant por default, com BAA
   disponível
4. **MFA + Passkeys built-in** — sem DIY
5. **Mesmo SDK que o DB** — `createServerClient` /
   `createBrowserClient` factories + `@supabase/ssr` para
   `proxy.ts` (Next.js 16)

**Caveats**:

- Setup requer 3 utility files (browser/server/proxy) — boilerplate
  mas documentado
- Auth UI original foi arquivado out/2025 — usar shadcn-based blocks
- Cookie API restrito a `getAll`/`setAll` (não `get`/`set`
  individuais)

### 5.6 RLS schema Akasha (preview)

```sql
-- Akasha: RLS multi-tenant

-- Users
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Mandatos
CREATE POLICY "Users can read own mandalos"
  ON mandalos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Mentor can read mentee mandalos"
  ON mandalos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mentor_mentees
      WHERE mentor_id = auth.uid()
        AND mentee_id = mandalos.user_id
    )
  );

-- Grimoire (read-only, public)
CREATE POLICY "Grimoire is publicly readable"
  ON grimoire_entries FOR SELECT
  USING (true);
```

**Akasha B2B (Mentor Certificado)**: tabela `mentor_mentees`
relaciona `mentor_id` (Cert level 1-3) com `mentee_id` (assinante).
Mentor vê Mandatos agregados (sem PII) via dashboard separado.

### 5.7 Decisão Akasha

**Supabase Auth + RLS.** Schema RLS ativo desde dia 1. `proxy.ts` no
Next.js 16 com `createServerClient` + `getClaims()` (valida JWT
localmente, sem network request). SSO/SAML só quando B2B enterprise
pedir (Fase 7+).

---

## 6. D-035 — Payments: Stripe (mantém)

### 6.1 Estado atual

Stripe já está integrado no projeto (subscriptions + webhooks +
checkout). Cobre:
- Assinatura mensal R$ 19-29 (freemium base)
- Assinatura anual R$ 199
- B2B Mentor Certificado (R$ 295/895/1995)
- Add-ons (consulta avulsa? não — anti-padrão rejeitado)

### 6.2 Alternativas BR (MercadoPago, Pagar.me, Asaas)

- **MercadoPago**: popular no BR, mas split fees piores (~5% +
 固定), UI/UX checkout inferior, webhooks instáveis historicamente
- **Pagar.me**: bom, mas Stripe tem mais recursos (subscriptions 2.0,
  Customer Portal, Tax automático, multi-currency)
- **Asaas**: forte em boleto + PIX, mas internacionalização fraca
  (Akasha projeta 80% EN até ano 5)

### 6.3 Decisão Akasha

**Stripe (mantém).** Razão: já integrado, i18n, Customer Portal
white-label reduz UI custom, Stripe Tax automatiza impostos
internacionais (Mercosur EN). PIX como payment method adicional via
Stripe (já suporta). Boleto via Stripe também.

---

## 7. D-036 — Deploy: Vercel + Supabase + AWS sa-east-1

### 7.1 Estado da arte (junho 2026)

**Comparação de plataformas Next.js (jun/2026):**

| Plataforma | p50 latência | Cold start | Custo MVP | Custo 10k MAU | WebSocket | Edge | Postgres |
|------------|--------------|------------|-----------|---------------|-----------|------|----------|
| **Vercel Pro** | 62ms (US-E) | ~50ms | $20/seat + $0 OT | $20-200/mo | ❌ | ✅ | Via Neon ($25) |
| Railway | 72ms | 0ms (always-warm) | $5 trial | $25-50/mo | ✅ | ❌ | Built-in $5+ |
| Render | 78ms | 200-300ms (free sleeps) | $7+ | $40-50/mo | ✅ | ❌ | Built-in $7+ |
| Fly.io (multi-region) | 55ms | ~120ms | $5-8 | $60-150/mo | ✅ | ❌ | $7+ (basic) |
| Hetzner + Cloudflare | 38ms warm | 0ms | $5-12/mo | $50-80/mo | ✅ | Via CF | DIY |
| Self-hosted k8s | 95ms | 0ms | $100-250 | $200-500 | ✅ | Via CF | $50+ |

Fontes: [techplained](https://www.techplained.com/best-hosting-nextjs),
[rohitraj Mumbai](https://rohitraj.tech/en/notes/vercel-vs-railway-vs-hetzner-india-mvp-hosting-2026),
[superfa.st](https://www.superfa.st/blog/vercel-vs-railway-vs-render),
[starterpick SaaS 2026](https://starterpick.com/guides/vercel-vs-railway-vs-render-cost-2026),
[birjob PaaS 2026](https://www.birjob.com/blog/paas-comparison-railway-render-fly-vercel-2026),
[propicked SaaS 2026](https://propicked.com/blog/best-saas-hosting-2026-render-vs-railway-vs-fly-io-vs-vercel-real-cost-comparison).

### 7.2 Por que Vercel para app

**Vantagens inegáveis:**

1. **Turbopack cache integration** — build times 8min → 2.5min em
   Vercel (citado: socialanimal.dev)
2. **Edge runtime nativo** — SSE streaming funciona
3. **Preview deployments por branch** — UX de time excelente
4. **Vercel AI Gateway** (GA ago/2025) — unified API para LLM
   providers, observability, fallbacks, zero data retention
5. **Image optimization built-in** (com caveat dos novos defaults
   em 16)
6. **Zero config Next.js** — time-to-ship é o melhor da categoria
7. **DX**: tempo de onboarding 1 dia vs 1 semana self-hosted

**Desvantagens aceitas:**

1. **Custo escala feio** — 1TB bandwidth free; depois $40/100GB
   (BR egress especialmente caro)
2. **Viral $96k bill** — modelo de billing pega desprevenido
   (propicked 2026 modelou)
3. **Cold starts 200-500ms** (Serverless); Edge 50ms
4. **WebSocket não suportado** — irrelevant para Akasha

### 7.3 Por que Supabase Cloud para DB

- **sa-east-1 default** — LGPD-native
- **Free tier generoso** (dev/staging)
- **Pro $25/mo** (ano 1)
- **Read replicas** disponíveis para scaling (ano 3+)
- **Backup automático** (daily PITR)

### 7.4 Por que NÃO Hetzner / VPS no ano 1

- **Ops burden real** — 1 pessoa dedicada a 50% time no ano 1
- **Migration cost > saving** — R$ 200/mês saving vs R$ 30k/ano eng
- **Vale a pena** quando MRR > R$ 15k/mês (~MAU 50k pagando) — meta
  ano 3-4

### 7.5 Migration path (ano 3-4)

**Quando MAU > 50k OU MRR > R$ 15k/mês:**

1. App: Hetzner CPX51 (16 vCPU, 32GB RAM, €30/mo) + Cloudflare
2. DB: Supabase Pro → scale para Team ($599/mo) ou self-host
   Postgres em Hetzner dedicated
3. LLM: direto Anthropic API (sem gateway intermediário)
4. Total: €200-400/mo (R$ 1.2-2.4k/mo) — 4-6× saving vs Vercel
   Enterprise

### 7.6 Decisão Akasha

**Stack de produção:**

```
┌─────────────────────────────────────────┐
│ Cloudflare (DNS, DDoS, WAF)            │ grátis-sa-east-1
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ Vercel Pro (Next.js 16 + Turbopack)    │ $20/seat/mo
│ - App Router + RSC + Edge Runtime      │
│ - SSE streaming para Mentor            │
│ - Preview deployments por branch       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ Supabase Cloud (sa-east-1)             │ $25/mo MVP
│ - Postgres 16 + pgvector (HNSW)        │
│ - Supabase Auth + RLS                  │
│ - Storage (imagens Rituais, altares)    │
│ - Edge Functions (futuro Fase 7)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ Anthropic API (Sonnet 4.6 + Haiku)     │ ~$6/mo MVP
│ - Prompt cache 70% hit rate            │
│ - Structured output JSON 99.2%         │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ Stripe (subscriptions + webhooks)      │ 2.9% + R$ 0.39/tx
└─────────────────────────────────────────┘
```

**Custo MVP (0-1k MAU)**: ~$50-60/mo (R$ 250-300/mo)
**Custo ano 1 (10k MAU)**: ~$150-250/mo (R$ 750-1.2k/mo)
**Custo ano 3 (50k MAU)**: ~$1-2k/mo (R$ 5-10k/mo) — considerar
Hetzner migration
**Custo ano 5 (100k MAU)**: ~$3-6k/mo + infra dedicada

---

## 8. D-037 (bônus) — ORM: Prisma 7 (mantém)

### 8.1 Estado da arte

**Prisma 7 (nov/2025) mudou o jogo:**

- **Bundle**: 14MB → 1.6MB (Rust engine → TypeScript/WASM)
- **Edge runtime**: nativo (antes precisava Accelerate proxy)
- **Cold start**: Drizzle 7.4KB ainda 80× menor, mas Prisma 7
  fechou o gap de cold start
- **Migrations**: Prisma Migrate ainda battle-tested; Drizzle Kit
  ainda tem rough edges em rename detection

Fontes: [encore.dev 2026](https://encore.dev/articles/drizzle-vs-prisma),
[toolchew Prisma vs Drizzle](https://toolchew.com/en/prisma-vs-drizzle/),
[designrevision](https://designrevision.com/blog/prisma-vs-drizzle),
[techsy.io Prisma 7 changes](https://techsy.io/en/blog/prisma-vs-drizzle-orm).

### 8.2 Por que Prisma 7 (mantém)

**Projeto já usa Prisma 7** (CLAUDE.md memory: cycle-367 v0.0.4-T1.4
prisma move, ciclo 110+ Prisma 7 datasource move). Razões para não
migrar para Drizzle:

1. **Custo de migração**: 19 tabelas × 21h = 21h (caso real
   documentado, toolchew). R$ 4.2k eng
2. **Maturidade**: Prisma 7 migrations detectam column/table renames
   corretamente. Drizzle Kit pode interpretar rename como drop+create
   (destrutivo)
3. **DX**: schema-first DSL é mais legível para Product team
4. **Edge support**: Prisma 7 agora roda nativamente em edge (antes
   era bloqueador)

### 8.3 Onde Drizzle vence (não-Akasha)

- Apps 100% edge (Cloudflare Workers, Vercel Edge primário)
- Times SQL-first que preferem query builder
- Bundle < 100KB crítico (mobile RN)

**Akasha não é nenhum desses** — Prisma 7 é o sweet spot.

### 8.4 Decisão Akasha

**Prisma 7 (mantém).** Schema DSL + `prisma generate` no CI +
`prisma migrate dev` local + `prisma migrate deploy` em prod. Edge
runtime onde fizer sentido (Server Actions simples, não queries
pesadas). pgvector via `Unsupported("vector(1536)")` + raw SQL na
migration inicial.

---

## 9. Arquitetura Final (Diagrama)

```
┌──────────────────────────────────────────────────────────┐
│ Browser (PWA)                                            │
│ - Next.js 16 App Router + RSC + Turbopack               │
│ - Service Worker (offline cache para Mandato)           │
│ - EventSource (SSE client) para Mentor                  │
│ - Web Speech API (TTS Fase 5+)                          │
└────────────────┬─────────────────────────────────────────┘
                 │ HTTPS (Cloudflare)
┌────────────────▼─────────────────────────────────────────┐
│ Vercel Pro (sa-east-1 + global edge)                   │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Edge Functions (low latency)                         ││
│ │ - /api/akasha/mandato (daily push)                   ││
│ │ - /api/akasha/stream (SSE)                          ││
│ │ - /api/akasha/ritual (chladni audio, cymatics)      ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Node.js Functions (CPU/IO heavy)                    ││
│ │ - /api/akasha/calcular (akasha-core algorithm)      ││
│ │ - /api/akasha/rag/retrieve (pgvector query)        ││
│ │ - /api/akasha/mentor (full RAG + LLM)              ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Server Actions (mutations)                           ││
│ │ - Onboarding, Profile, Mandato save                  ││
│ │ - Subscription mgmt (Stripe webhook → action)       ││
│ └──────────────────────────────────────────────────────┘│
└────────────────┬─────────────────────────────────────────┘
                 │ TLS (private)
┌────────────────▼─────────────────────────────────────────┐
│ Supabase Cloud (sa-east-1)                              │
│                                                          │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐│
│ │ Postgres 16  │ │ pgvector     │ │ Supabase Auth    ││
│ │ - users      │ │ - grimoire_* │ │ - RLS policies   ││
│ │ - mandalos   │ │ - HNSW idx   │ │ - MFA + passkeys ││
│ │ - rituais    │ │ - 1536-dim   │ │ - JWT signed     ││
│ │ - subscriptions│ - cosine    │ │   (asymmetric)   ││
│ └──────────────┘ └──────────────┘ └──────────────────┘│
│                                                          │
│ ┌──────────────┐ ┌──────────────────────────────────────┐│
│ │ Storage      │ │ Realtime (futuro Fase 7)             ││
│ │ - ritual-art │ │ - presence (mentor online?)         ││
│ │ - altar-photo│ │ - mandalo shared (B2B dashboard)    ││
│ └──────────────┘ └──────────────────────────────────────┘│
└────────────────┬─────────────────────────────────────────┘
                 │ HTTPS
┌────────────────▼─────────────────────────────────────────┐
│ Anthropic API                                            │
│ - Claude Sonnet 4.6 (primary)                           │
│ - Claude Haiku 4.5 (crisis/router)                      │
│ - Prompt cache (90% saving em persona + grimório)       │
└──────────────────────────────────────────────────────────┘
```

---

## 10. Variáveis de Ambiente (preview Fase 5)

```bash
# .env.local (gitignored, Vercel project settings)

# === Supabase ===
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...           # public, RLS-enforced
SUPABASE_SERVICE_ROLE_KEY=eyJ...               # server-only, RLS bypass
DATABASE_URL=postgresql://postgres:xxx@db:5432/postgres  # Prisma migrations
DIRECT_URL=postgresql://postgres:xxx@db:5432/postgres     # Prisma runtime

# === Anthropic ===
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_DEFAULT_MODEL=claude-sonnet-4-6
ANTHROPIC_ROUTER_MODEL=claude-haiku-4-5
ANTHROPIC_FALLBACK_MODEL=minimax-m3

# === Vercel (auto-set em prod) ===
VERCEL_ENV=production
VERCEL_REGION=sa-east-1

# === Stripe ===
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# === Akasha (custom) ===
AKASHA_PERSONA_VERSION=1
AKASHA_MANDATO_HOUR=6
AKASHA_SESSION_CAP_DAILY=1
AKASHA_SESSION_CAP_WEEKLY=3
AKASHA_CRISIS_CVV=188
AKASHA_EMBEDDING_MODEL=text-embedding-3-small
AKASHA_GRIMORE_TOP_K=8
AKASHA_LLM_TEMPERATURE=0.4
```

---

## 11. Decisões Abertas (v2 + monitoramento)

| # | Decisão | Status | Próximo passo |
|---|---------|--------|---------------|
| **O-1** | Akasha 6ª pilar (Sheldrake/Cymatics metafórico) | Não-pilar, narrativa poética | Validar com R-030 prototype |
| **O-2** | Vercel AI Gateway vs Anthropic direto | Sem gateway no ano 1 | Re-avaliar ano 2 se > 3 LLMs |
| **O-3** | Migrations vs push (Prisma) | `migrate dev` local, `migrate deploy` prod | Documentar em runbook |
| **O-4** | Self-host embeddings (HuggingFace TEI) | OpenAI `text-embedding-3-small` no ano 1 | Avaliar quando volume > 1M embeddings/mês |
| **O-5** | Cron job para Mandato push | Vercel Cron (grátis até 2 jobs) → Inngest/Trigger.dev | Definir em R-030 |
| **O-6** | Multi-region (Mercosur EN/ES) | Vercel edge + Supabase region switch | Ano 2 se tração |
| **O-7** | Sentry vs Highlight.io (observability) | Highlight.io (open-source, 8k free events/mo) | Configurar em R-040 |
| **O-8** | i18n framework: next-intl vs next-i18next | next-intl (Next.js 16 native, server components) | Validar com i18n audit |
| **O-9** | Background jobs (Mandato digest, email) | Inngest (workflows duráveis) ou Trigger.dev | Validar em R-050 |
| **O-10** | E-mail transacional | Resend (React Email + DKIM + bounce mgmt) | Configurar R-060 |

---

## 12. Cross-References

- `synthesis/synthesis_v1.md §7` — Akasha Core Algorithm (depende)
- `mentor/persona_v1.md §6` — 3 camadas de memória (Postgres tables)
- `mentor/persona_v1.md §5` — protocolo crise (Haiku 4.5 router)
- `ux/architecture_v1.md §6` — SSE streaming interaction
- `ux/architecture_v1.md §7` — WCAG 2.2 AA (PWA + a11y testing)
- `patterns.md §5.5` — freemium 2-3% + cert B2B (Stripe)
- `gaps.md §1.3` — igual dignidade epistêmica (multi-LLM strategy)
- `gaps.md §3.2` — LGPD by design (sa-east-1)
- `gaps.md §4.3` — AI Mentor transparente (RAG + citation metadata)
- `app_spec.txt §4` — Fase 4 Tech Stack (este doc)
- `CLAUDE.md` — Prisma 7 datasource move (ciclo 110+)

---

## 13. Métricas de Sucesso (Fase 4)

| Métrica | Meta | Medição |
|---------|------|---------|
| Build time (Turbopack) | < 3min | Vercel build logs |
| LCP p75 | < 2.5s | Vercel Speed Insights |
| TTFB p75 | < 200ms (BR) | Vercel Speed Insights |
| Mentor TTFT p75 | < 1s | Sentry/Highlight tracing |
| RAG retrieval p95 | < 200ms | Prisma query logs |
| LLM cost / MAU / month | < $0.10 | Anthropic dashboard |
| Crash rate (crise protocol) | 0% | Sentry/Highlight |
| Uptime | > 99.9% | Vercel + Supabase status |
| LGPD compliance | 100% sa-east-1 | Supabase region config |
| RLS bypass incidents | 0 | Sentry alerts |

---

## 14. Confidence

**HIGH** — 7 decisões baseadas em 30+ fontes 2026 (junho 2026
datas) + comparadores independentes + fit-check com Akasha
requisitos (R-022 + R-023 + R-024 + R-001..R-012).

**5 incertezas honestas:**

1. **Vercel billing em viral load** — se Akasha viralizar (1M+ page
   views), custo pode explodir. Plano: rate limit + Cloudflare
   cache agressivo + CDN de imagens próprio
2. **Sonnet 4.6 em PT-BR sustentado** — benchmarks mostram forte,
   mas uso contínuo com terminologia esotérica (Hebraico, Sânscrito,
   Iorubá transliterado) precisa validação empírica
3. **pgvector recall @ 1M+ vetores** — docs estão em < 1M;
   performance pode degradar
4. **Supabase Auth MFA UX** — auth flow é boilerplate nosso; UX
   depende de shadcn blocks customizados
5. **Migration Supabase region** — se Mercosur demandar região
   diferente, supabase muda mas downtime ~1h (não trivial)

**Próxima iteração (v2)** após R-030 (Akasha Core Algorithm
prototype) + R-040 (prisma schema) + R-050 (mentor integration
tests). Itens O-1..O-10 confirmados ou revisados.

---

**Fim do artefato.** 14 seções, 7 decisões, 1 diagrama, 5
incertezas, 10 decisões abertas. Pronto para R-030 (Akasha Core
Algorithm prototype).
