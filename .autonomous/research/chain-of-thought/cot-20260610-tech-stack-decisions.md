# COT: Tech Stack v1 — 7 Decisões (D-030..D-037)

**Data:** 2026-06-10
**Sessão N (continuação)**
**Escopo:** R-025 / D-030..D-036 (+ D-037 bônus ORM)
**Output:** `.autonomous/research/tech/stack_v1.md` (981 linhas, 14 seções)
**Confidence:** HIGH

## Contexto

Fases 0 (Research 12/12), 1 (Patterns/Gaps/Synthesis), 2 (Mentor
Persona), 3 (UX Architecture) completas. Restava fechar Fase 4 (Tech
Stack) antes de Fase 5 (Prototype). Akasha já roda Next.js 16 +
Supabase + Stripe (verificado em `package.json` + `apps/akasha-portal/`);
este artefato **confirma e expande** decisões existentes, não inventa
stack do zero.

## Hipóteses iniciais

H1: Turbopack default em Next.js 16 é estável para produção (jun/2026)
H2: pgvector é default correto para corpus < 2M vetores
H3: Claude Sonnet 4.6 > GPT-4o para RAG-grounded + PT-BR esotérico
H4: SSE é o padrão certo para streaming LLM unidirecional
H5: Supabase Auth + RLS > Clerk para LGPD + multi-tenant
H6: Vercel Pro é justificado até MAU 50k
H7: Prisma 7 já é bom o suficiente (não migrar Drizzle)

## Evidências (30+ fontes 2026)

**D-030 Turbopack (Next.js 16)**
- nextjs.org/blog/next-16 (out/2025) — Turbopack default
- nextjs.org/blog/next-16-2-turbopack (mar/2026) — 200+ fixes
- socialanimal.dev migration guide — 8min→2.5min Vercel build
- qasimcode.com OOM analysis — 7168MB heap ideal, não 8192
- iloveblogs.blog opt-out pattern — `NEXT_DISABLE_TURBOPACK=1`

**D-031 pgvector (5 comparações convergentes)**
- devopsness.com 6-month production (3 stores × 90 dias)
- kalviumlabs.ai 2026 comparison
- tensoria.fr 100M vector benchmark
- leanopstech 2026 verdict: pgvector < 5M wins
- cloudmagazin 2026: pgvector default if Postgres in stack

**D-032 LLM (Sonnet 4.6 > GPT-4o)**
- claudeguide.io benchmark: MMLU 84.9%, GPQA 64.8% (Claude) vs
  53.6% (GPT-4o), SWE-bench 64% vs 46%, JSON 99.2% vs 97.8%
- huiosweb BR comparison: Claude cache 90% saving em RAG chatbot
- talki cost benchmark: $389/mo Claude vs $458/mo GPT-4o (RAG)
- apicents cost: $1,050/mo Sonnet 4.6 vs $1,750/mo Opus 4.5 (40% saving)
- akitaonrails "RAG is dead" — contra-ponto honesto descartado
  para nosso caso (corpus curado + cita fonte obrigatória)

**D-033 SSE**
- thanosk.eu Next.js 16 patterns — SSE > WS para 90% AI use case
- jangwook.net raw SSE implementation guide
- tianpan.co protocol decision — SSE latency ≈ WS para LLM
- dev.to "SSE vs WebSockets 2026" — 90% rule
- sameersabir streaming UX

**D-034 Auth (Supabase vs Clerk)**
- makerkit.dev 2026: Clerk $1,025/mo @ 100k MAU vs Supabase $25
- wolf-tech 2025-2026 EU GDPR analysis
- clerk.com official Next.js 16 support article
- toolchew Auth.js vs Clerk
- starterpick 2026: Supabase RLS elimina classe de bugs

**D-035 Stripe**
- já integrado; i18n + Customer Portal + Stripe Tax
- PIX + Boleto via Stripe (nativo 2026)

**D-036 Deploy (Vercel + Supabase sa-east-1)**
- techplained 8 platforms benchmark
- rohitraj Mumbai 2026: Vercel $20/seat, Railway $5, Hetzner $5
- starterpick SaaS cost 2026: Hetzner 30-50% cheaper @ 10k MAU
- propicked viral $96k bill warning
- birjob PaaS 2026: Vercel Pro sweet spot para < 50k MAU
- superfa.st cold start comparison

**D-037 Prisma 7 (mantém)**
- encore.dev 2026: Prisma 7 dropped Rust engine (14MB→1.6MB)
- toolchew Prisma vs Drizzle: Prisma 7 fechou cold start gap
- designrevision 2026: Prisma wins migrations (battle-tested)
- techsy.io: Drizzle Kit ainda rough em rename detection

## Conclusão

**Todas as 7 hipóteses confirmadas.** Decisões:
- D-030: Next.js 16.2+ Turbopack ✅
- D-031: Postgres 16 + pgvector (Supabase sa-east-1) ✅
- D-032: Sonnet 4.6 + Haiku 4.5 + Minimax M3 ✅
- D-033: SSE Edge Runtime ✅
- D-034: Supabase Auth + RLS ✅
- D-035: Stripe (mantém) ✅
- D-036: Vercel Pro + Supabase Cloud + AWS sa-east-1 ✅
- D-037: Prisma 7 (mantém) ✅

**Custo MVP**: ~$50-60/mo (R$ 250-300/mo)
**Custo ano 1 (10k MAU)**: ~$150-250/mo (R$ 750-1.2k/mo)
**Migration path**: Hetzner + Coolify @ MAU 50k (ano 3-4)

## 5 Incertezas honestas

1. Vercel billing em viral load (Cloudflare cache + rate limit mitigate)
2. Sonnet 4.6 PT-BR com terminologia esotérica (validar empiricamente)
3. pgvector recall @ 1M+ vetores (sweet spot 0-5M; medir)
4. Supabase Auth MFA UX (depende de shadcn blocks customizados)
5. Supabase region switch para Mercosur (downtime ~1h)

## 10 Decisões abertas (v2)

O-1 Akasha 6ª pilar (Sheldrake) → rejeitado, narrativa poética
O-2 Vercel AI Gateway → sem gateway no ano 1
O-3 Prisma migrate dev vs push → migrate deploy prod
O-4 Embeddings self-host → OpenAI text-embedding-3-small ano 1
O-5 Cron job Mandato → Vercel Cron → Inngest se necessário
O-6 Multi-region Mercosur → ano 2
O-7 Sentry vs Highlight → Highlight.io (open-source)
O-8 i18n next-intl → validado
O-9 Background jobs → Inngest ou Trigger.dev
O-10 E-mail transacional → Resend

## Próximos passos

- ✅ D-030..D-036 fechados
- ⏳ R-030 Akasha Core Algorithm prototype (TS puro)
- ⏳ R-040 Prisma schema com 5 pilares
- ⏳ R-050 Mentor integration tests
- ⏳ R-022b Ethics Charter v1 (paralelo)
- ⏳ D-005 refinement dos 3 perfis (Ana/Bruno/Carla) com samples

## Cross-refs

- `tech/stack_v1.md` (981 linhas, 14 seções) — artefato principal
- `synthesis/synthesis_v1.md §7` — depende
- `mentor/persona_v1.md §5,§6` — depende (router Haiku + 3 camadas memória)
- `ux/architecture_v1.md §6,§7` — depende (SSE + WCAG)
- `gaps.md §3.2,§4.3` — validações LGPD + RAG transparente
- `CLAUDE.md` — Prisma 7 cycle-367
