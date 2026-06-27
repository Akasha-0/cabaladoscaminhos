# ADR-0002: Use Supabase como backend (Auth + Postgres + Storage + Realtime)

## Status

Accepted

Data: 2026-06-26
Autor: time Akasha Portal
Relacionado a: [VISION.md §7](../../VISION.md), [ARCHITECTURE.md §2](../../ARCHITECTURE.md)

## Contexto

O Akasha Portal precisa de um backend que ofereça, **sem ter que montar/operar manualmente**:

1. **Autenticação** — email/senha, magic link, OAuth (Google), com gestão de sessão
2. **Banco de dados Postgres** — relacional, com suporte a JSON,全文 search, e (futuramente) **pgvector** para embeddings
3. **Storage** — avatares, imagens de posts, anexos de artigos (com transformações)
4. **Realtime** — notificações, contagem de likes/comments ao vivo, presença no chat IA
5. **Row Level Security (RLS)** — política de segurança declarativa no banco, não no app

Restrições:
- Equipe pequena **sem DevOps dedicado** — solução gerenciada é praticamente obrigatória
- Custo precisa ser **zero ou quase zero na Fase 1** (até ~1000 usuários)
- LGPD compliance é importante (dados de saúde mental, tradição espiritual são sensíveis)
- Hospedagem em **Vercel** — backend precisa ter boa integração com Edge/Serverless

Drivers:
- Crescimento orgânico da comunidade exige iteração rápida (sem blocking de infra)
- Time-to-market sobre perfeição arquitetural (MVP primeiro)
- Akasha IA (Fase 3) precisa de **pgvector** para RAG sobre biblioteca — ficar no mesmo banco evita ETL

## Decisão

Adotamos **Supabase** como backend gerenciado, usando:

| Serviço Supabase | Uso |
|---|---|
| **Auth** | Email/senha + Magic Link + Google OAuth |
| **Postgres** | Banco principal (acessado via **Prisma** com `@prisma/adapter-pg`) |
| **Storage** | Avatares, imagens de post, capas de artigo |
| **Realtime** | Notificações, presença no chat, contador de likes ao vivo |
| **Row Level Security** | Permissões declarativas (ex: "só dono do post pode editar") |

**Configuração:**
- Cliente: `@supabase/supabase-js@2.106.2` + `@supabase/ssr@0.10.3` (cookie-based sessions para Next.js)
- Conexão Postgres: **direta via `pg`** (Prisma 7 + `@prisma/adapter-pg`), NÃO via PostgREST
- JWT emitidos pelo Supabase Auth, validados pelo nosso middleware
- Storage buckets: `avatars` (público leitura), `posts` (público leitura), `articles` (público leitura)
- RLS ativo em **todas as tabelas** — o app **nunca** confia no client

**Decisões correlatas:**
- [ADR-0003](0003-use-pgvector-for-embeddings.md) — pgvector roda dentro do Supabase Postgres
- ORM: **Prisma 7** (não Drizzle, não Supabase Data API) — veja ADR interno `/adr/0007-use-prisma-with-pg-adapter`
- Edge Functions Supabase: **não usar** (prefere Vercel Functions por consistência)

## Consequências

### Positivas

- **Velocidade de desenvolvimento** — Auth, RLS, Realtime, Storage prontos em horas, não semanas
- **Custo zero na Fase 1** — free tier cobre até 500MB DB, 1GB Storage, 50k MAU. Atingimos 1000 usuários sem pagar
- **Postgres puro** — sem lock-in de NoSQL; SQL padrão, migrations via Prisma, acesso total via `psql`
- **pgvector nativo** — embeddings da biblioteca cabem no mesmo banco (ADR-0003)
- **RLS declarativa** — políticas de segurança vivem no schema, visíveis em código SQL, auditáveis
- **Dashboard visual** — Studio do Supabase permite debugar queries, ver dados, ajustar RLS sem subir app
- **Realtime built-in** — notificações "ao vivo" sem precisar montar WebSocket próprio
- **Backup automático** — point-in-time recovery no plano Pro; paz de espírito
- **LGPD facilitado** — Supabase é processador de dados conforme; temos DPA assinado

### Negativas

- **Vendor lock-in significativo** — RLS policies, Realtime channels, Auth flows são específicos do Supabase. Migrar para Auth0 + Neon + Cloudflare R2 exigiria reescrever 30-40% do código de auth/permissões
- **Free tier tem limites irritantes** — 500MB DB enche com logs de eventos + posts + dados espirituais; vamos precisar do Pro ($25/mês) cedo (provavelmente ~3-5k usuários)
- **Realtime cobra por mensagens** — uso intenso (chat IA com 100+ mensagens/dia/usuário) pode ficar caro no Pro
- **Performance de RLS em queries complexas** — policies mal escritas viram gargalo; precisamos de `EXPLAIN ANALYZE` regular
- **Cold start do projeto free** — instância Postgres pausa após inatividade (7 dias); primeiro request demora 5-10s
- **Limitação de Edge Runtime** — middleware Next.js não consegue usar Supabase client completo no Edge (precisa do Node runtime em alguns casos)
- **Sem suporte oficial a transações distribuídas** — se um dia tivermos filas/eventos cross-service, vai doer

### Neutras

- Supabase Auth emite JWT com claims customizadas (precisamos adicionar `handle` ao user) — workaround conhecido
- Storage não tem CDN global incluído no free — primeiros usuários fora das Américas podem ter latência maior
- Logs do Supabase não exportam para nosso Sentry automaticamente — script customizado necessário

## Alternativas consideradas

### 1. Firebase (GCP)

- **Prós:** Madureza extrema, realtime excelente, Auth robusto, free tier generoso, integração nativa com GCP
- **Contras:** NoSQL (Firestore) — não dá pra fazer queries SQL complexas, joins, pgvector. Migração futura para Postgres seria cara. Vendor lock-in GIGANTE com Google. Preços sobem exponencialmente com escala
- **Por que não:** Sem SQL não temos pgvector (matador pra Fase 3), e o lock-in com GCP é ainda pior que com Supabase

### 2. Auth0 + Neon (Postgres) + Cloudflare R2 + Pusher

- **Prós:** Best-of-breed em cada categoria; sem lock-in; Neon tem branching de DB (excelente DX); Cloudflare R2 sem egress fee
- **Contras:** Custo alto desde o dia 1 (cada serviço cobra separado, mesmo no free); mais peças para integrar e manter; sem Realtime unificado (Pusher é caro); Auth0 é notoriously confuso de configurar
- **Por que não:** Para Fase 1 é overkill operacional e financeiro. Possível migração na Fase 4+ quando comunidade for grande

### 3. Self-hosted: Node + Express/Fastify + Postgres + Redis + S3-compatible

- **Prós:** Controle total, zero custo de vendor, customização infinita, aprende muito sobre infra
- **Contras:** Equipe de 2 devs teria que ser DevOps também; segurança de auth é **perigosa** quando implementada por não-especialistas; backup/monitoramento é trabalho; tempo até MVP triplica
- **Por que não:** Risco operacional e de segurança. Sem justificativa para o tamanho do projeto

### 4. Convex

- **Prós:** Realtime excelente, TypeScript end-to-end, modelo de dados interessante (documents + queries reativas)
- **Contras:** Banco proprietário (não Postgres) — sem pgvector, sem migrations SQL padrão, sem ferramentas familiares. Comunidade pequena. Vendor lock-in total
- **Por que não:** Perde toda vantagem do Postgres + pgvector. Lock-in pior que Supabase

### 5. AWS (Cognito + RDS + S3 + API Gateway + AppSync)

- **Prós:** Escalabilidade comprovada, compliance forte, integrations com 100+ serviços AWS
- **Contras:** Complexidade operacional absurda; Cognito é notoriamente ruim; AppSync é overkill; custo imprevisível; equipe precisaria ser AWS-certified
- **Por que não:** Tamanho do time não comporta. Custo e complexidade proibitivos para Fase 1

### 6. Pocketbase

- **Prós:** Single binary Go, super leve, self-hostable, SQLite embutido, Auth + Storage + Realtime inclusos
- **Contras:** SQLite (não Postgres) — sem pgvector, sem SQL complexo, sem replicação madura. Limitado para escala. Comunidade pequena
- **Por que não:** SQLite quebra nossas premissas de RAG (pgvector) e queries complexas. Fase 3+ inviável

## Referências

- [Supabase docs](https://supabase.com/docs) — referência oficial
- [VISION.md §7 Stack técnica](../../VISION.md)
- [ARCHITECTURE.md §2 Stack definitiva](../../ARCHITECTURE.md)
- [ADR-0003: Use pgvector for Embeddings](0003-use-pgvector-for-embeddings.md)
- [Supabase RLS patterns](https://supabase.com/docs/guides/auth/row-level-security) — guia interno de policies
- Comparativo interno: Notion `/docs/backend-comparison-2026-q2`