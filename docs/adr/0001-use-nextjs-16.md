# ADR-0001: Use Next.js 16 como framework principal

## Status

Accepted

Data: 2026-06-26
Autor: time Akasha Portal
Relacionado a: [VISION.md §7](../../VISION.md), [ARCHITECTURE.md §2](../../ARCHITECTURE.md)

## Contexto

O Akasha Portal precisa de um framework web que atenda simultaneamente a quatro demandas distintas:

1. **SSR + SSG** — conteúdo espiritual/artigos precisam ser indexáveis e rápidos no carregamento inicial (SEO + UX mobile-first)
2. **API routes serverless** — endpoints para posts, comentários, chat com IA, geração de mapa espiritual
3. **React Server Components (RSC)** — renderização híbrida para reduzir bundle JS inicial, crítico para mobile com conexão instável
4. **App Router moderno** — nested layouts (Comunidade / Pessoal / Auth), streaming, Suspense

Restrições adicionais:
- Equipe pequena (~2 devs), precisa de **batteries included**
- Comunidade-alvo fala **português**, mas pode acessar de qualquer lugar (latência global importa)
- Mobile-first (acesso cotidiano do usuário) — performance percebida no 3G/4G é requisito
- Deploy em **Vercel** (já usado pela equipe) — integração nativa vale ouro

Drivers do projeto:
- Crescimento orgânico via SEO (artigos espirituais + páginas de tradição)
- Experiência de app nativo sem precisar publicar app store
- IA (Akasha) com streaming de resposta exige RSC + Server Actions

## Decisão

Adotamos **Next.js 16** (com App Router) como framework único para frontend e backend BFF (Backend-for-Frontend).

**Configuração:**
- **Next.js 16.2.6** com `--experimental-build-mode=compile` para builds parciais mais rápidos
- **React 19.2.4** (Server Components estáveis)
- **TypeScript 5** estrito (`strict: true`)
- **Tailwind v4** + `SpiritualWidgetSystem` próprio
- API Routes via App Router (`src/app/api/*/route.ts`)
- Server Actions para mutações simples
- Middleware (`middleware.ts`) para auth Supabase e redirects

**Decisões correlatas (ver ADRs específicos):**
- [ADR-0002](0002-use-supabase-as-backend.md) — Supabase como backend
- Hospedagem: Vercel (free tier na Fase 1, Pro na Fase 2+)
- ORM: Prisma 7 com `@prisma/adapter-pg` (não via Supabase client)

## Consequências

### Positivas

- **SEO forte** — SSR + Metadata API nativa (`generateMetadata`) gera Open Graph, Twitter Cards, JSON-LD automático
- **Streaming nativo** — respostas da Akasha IA usam `ReadableStream` via RSC, latência percebida cai 40%+
- **Code splitting automático** — só carrega JS do que o usuário realmente usa; impacto direto em mobile 3G
- **Batteries included** — i18n, Image optimization, Font optimization, Link prefetch tudo built-in
- **Vercel native** — preview deploys automáticos em PR, edge functions disponíveis, zero-config para nossa stack
- **App Router maduro** — nested layouts eliminam re-renders; ideal para nossa hierarquia (Comunidade / Pessoal / Auth)
- **Server Actions** — mutações sem precisar criar API routes para tudo; menos código boilerplate
- **Comunidade enorme** — qualquer problema tem resposta no Stack Overflow / GitHub Discussions

### Negativas

- **Vendor lock-in com Vercel** — features como `next/image`, Edge Runtime, ISR funcionam melhor lá. Migrar para self-hosted (Docker) exige reconfigurar e perder algumas otimizações
- **Bundle do Next.js é pesado** — o framework sozinho adiciona ~80KB gzipped ao client bundle; em páginas simples (landing) é overkill
- **Debug de RSC é doloroso** — Server Components + Client Components com hydration boundaries podem causar bugs sutis; debugging exige `react-server-dom` e logs específicos
- **Curva de aprendizado** — equipe nova precisa entender RSC, Suspense, Server Actions, que são paradigmas diferentes do React clássico. ~2 semanas de ramp-up
- **Versões majors quebram** — Next.js 14→15→16 já quebraram APIs (App Router estabilizou, mas `cookies()` async mudou). Atualizar exige auditoria
- **`--experimental-build-mode=compile` ainda é experimental** — pode ter bugs; nosso build script depende dessa flag

### Neutras

- React 19 mudou comportamento de `useEffect` (executa duas vezes em dev) — nossa estratégia de testes já cobre isso
- Vercel Analytics e Speed Insights são opcionais (não estamos usando ainda)
- Middleware roda em Edge Runtime (limite de 1MB de bundle) — não é problema hoje, mas restringir se crescer

## Alternativas consideradas

### 1. Remix (agora React Router v7)

- **Prós:** Excelente para forms e mutações (sem precisar de Server Actions); modelo mental mais simples que RSC; boa performance
- **Contras:** Comunidade menor que Next.js; menos vagas no mercado (contratação difícil); sem equivalente ao `next/image` tão maduro; ecossistema de plugins menor
- **Por que não:** Time já tem expertise em Next.js. Trocar agora custa 3-4 sprints de reescrita para zero benefício claro em nosso caso de uso

### 2. SvelteKit

- **Prós:** Bundle menor (15-30% que Next.js em cenários similares); sintaxe mais limpa; performance excelente
- **Contras:** Ecossistema React de UI components (shadcn, Radix) não aproveita; teríamos que reescrever `SpiritualWidgetSystem` em Svelte; mercado menor
- **Por que não:** Investimento grande em componentes React e no ecossistema. Reescrever não traz benefício proporcional

### 3. Astro com React islands

- **Prós:** Zero JS por padrão (ideal para páginas estáticas/artigos); excelente para SEO; pode usar React em "ilhas"
- **Contras:** Não é framework full-stack — para o app autenticado (feed, chat, dashboard pessoal) teríamos que misturar com outro framework; comunidade menor para casos complexos
- **Por que não:** Nosso app tem partes dinâmicas pesadas (feed, chat IA, dashboard pessoal). Astro brilha em conteúdo estático, não em apps autenticados

### 4. Nuxt 3 (Vue)

- **Prós:** Excelente DX; SSR/SSG robusto; boa performance; i18n nativo
- **Contras:** Vue, não React — jogar fora todo `SpiritualWidgetSystem`, hooks customizados, e conhecimento de equipe; ecossistema de UI libs menor
- **Por que não:** Custo de migração enorme sem ganho proporcional. React continua dominante no mercado

### 5. Vite + React puro + Hono backend

- **Prós:** Controle total; bundle mínimo; sem framework opinativo; Hono é ultrarrápido
- **Contras:** Sem SSR nativo (precisaria implementar); sem file-based routing; sem Image optimization; sem middleware helpers; muito mais código boilerplate
- **Por que não:** Para uma equipe de 2 devs, reinventar SSR/routing/i18n é suicídio. Vamos otimizar bundle via Next.js Code Splitting

### 6. Solid Start

- **Prós:** Performance superior a React (fine-grained reactivity); bundle pequeno; sintaxe familiar
- **Contras:** Ecossistema minúsculo; sem equipe React não aproveitamos; documentação esparsa; mercado de trabalho praticamente inexistente
- **Por que não:** Risco operacional alto demais para um projeto comunitário que precisa de manutenção por anos

## Referências

- [Next.js 16 release notes](https://nextjs.org/blog/next-16) — features Server Actions, RSC estável, Turbopack
- [VISION.md §7 Stack técnica](../../VISION.md) — decisão original
- [ARCHITECTURE.md §2 Stack definitiva](../../ARCHITECTURE.md) — versão refatorada
- [ADR-0002: Use Supabase as Backend](0002-use-supabase-as-backend.md)
- Comparativo interno: Notion `/docs/framework-comparison-2026-q2`