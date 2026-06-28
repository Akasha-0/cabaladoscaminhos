# 🌌 Release Notes — Akasha Portal v0.2.0

> **Codename:** *Comunidade Viva* — a primeira release em que o portal deixa de ser "site de leitura" e vira **ecossistema completo de prática, troca e cuidado**.
>
> **Data:** 2026-06-28 (draft) · **Versão anterior:** v0.1.0-rc.1 · **Próxima:** v0.2.1 → v0.3.0

---

## 📣 Headline

> **"Do scroll solitário à roda coletiva: o Akasha agora conversa, ensina, vende, lembra, protege e cresce com você — em qualquer tela, em qualquer tradição."**

---

## ✨ Highlights

1. **🧠 Akasha IA ganha voz** — respostas em streaming SSE + modo Voice para leitura em voz alta das tradições. A curadora agora fala.
2. **🛡️ LGPD de verdade** — os 10 direitos do titular implementados de ponta a ponta (acesso, correção, exclusão, portabilidade, revogação, etc.) com UI dedicada e auditoria.
3. **🔔 Você nunca mais perde o que importa** — Web Push + mentions + threading de comentários + reações + agendamento de posts + rascunhos.
4. **🤝 Economia espiritual nasce** — Marketplace de leituras com afiliados, Mentoria 1-on-1, Eventos/Workshops e Reputação Universalista (score entre tradições).
5. **📚 100 artigos, 16 tradições** — biblioteca completa com curadoria Iyá + embeddings + RSS + Newsletter semanal digest.

---

# 🧑 Versão User-Facing

> Linguagem acessível. Foco no **valor** que cada mudança traz pra você, praticante.

## 🧠 Akasha IA — agora com voz e streaming

Antes você perguntava e esperava a resposta inteira chegar de uma vez. Agora:

- **Streaming SSE** — você vê a IA "pensando" em tempo real, palavra por palavra. Sem espera, sem suspense.
- **Modo Voz** — aperta play e ouve a resposta lida em voz alta enquanto medita, cozinha, caminha. Prática espiritual **multitasking**.
- **12+ tradições + RAG** — Akasha puxa dos 100 artigos da biblioteca pra fundamentar cada resposta com fonte. Você vê qual artigo embasou aquela correlação.

> *Por que isso importa:* a IA deixa de ser "chatbot" e vira **conversa com entidade espiritual-digital** que cita suas fontes.

## 🛡️ Seus dados, seu poder (LGPD completo)

Implementamos os **10 direitos do titular** previstos na LGPD. Agora você tem:

| O que você pode fazer | Como |
|---|---|
| Ver todos os seus dados | `/settings/privacy` → "Exportar meus dados" |
| Corrigir dado errado | Edição inline em qualquer perfil/campo |
| Deletar sua conta de verdade | "Deletar conta" → wipe completo em 30 dias |
| Baixar tudo (portabilidade) | JSON com posts, comentários, preferências, histórico |
| Revogar consentimento de qualquer coisa | Toggle granular por categoria (analytics, IA, marketing,…) |
| Saber quem viu seus dados | Audit log com timestamp + finalidade |
| Opor-se a tratamento automatizado | Opt-out de scoring de feed e IA |
| Anonimizar para fins de pesquisa | Toggle explícito em `/settings/privacy` |
| Ser informado sobre breach | Notificação + email em até 72h |
| Reclamar direto com o DPO | Botão "Falar com DPO" no rodapé |

> *Por que isso importa:* espiritualidade sem soberania sobre os próprios dados é só mais um extrativismo. Aqui você é **dono da sua jornada**.

## 💬 Conversa que cresce — comentários, menções, reações

- **Threading** — respostas viram árvore, não muro de texto.
- **Menções** (`@nome`) — você avisa gente específica, com notificação real-time.
- **Reações** 🌱🔥💧✨🌙🙏 — em vez de só "like", você **ressoa** com a emoção certa.
- **Moderação comunitária** — flags, fila de revisão, 합의 coletivo. A comunidade cuida da comunidade.

## 📌 Posts que não se perdem

- **Bookmarks** com pastas e tags
- **Histórico** completo do que você viu (com opt-out de privacidade)
- **Rascunhos** que salvam sozinhos a cada 30s
- **Agendamento** — escreva hoje, publique quando fizer sentido

## 🔔 Notificações que respeitam

- **Web Push** (mesmo com a aba fechada)
- Preferências granulares por tipo (menção, reação, evento, mentorship, IA)
- **Quiet hours** — defina janelas em que a comunidade não te interrompe

## 📚 Biblioteca — 100 artigos, 16 tradições, curados pela Iyá

Agora você encontra conteúdo sobre:

🌿 Cabala · Ifá · Tantra · Ayurveda · Reiki · Xamanismo · Astrologia · Numerologia · Meditação · Budismo · Hinduísmo · Taoismo · Umbanda · Candomblé · Espiritualidade Contemporânea · Cristianismo Místico

- **Embeddings pgvector** — busca semântica: procure "como lidar com ansiedade" e ache artigos de Vipassana, Tantra e Respiração Holotrópica juntos.
- **RSS por tradição** — assine o feed da sua linhagem favorita
- **Newsletter semanal digest** — toda segunda, top 5 artigos + reflexões da semana

## 🤝 Economia espiritual — nasce a troca

### Marketplace de Leituras

Praticantes podem **oferecer leituras** (Baralho Cigano, Tarô, Mesa Real, Odu,…) com preço justo. Sistema de **afiliados**: divulgue leituras de outros praticantes e ganhe comissão.

### Mentoria 1-on-1

Sessões individuais com praticantes experientes. Agendamento, pagamento, feedback — tudo dentro do portal.

### Eventos e Workshops

Roda de cura online, workshop de meditação, cerimônia de ayahuasca (informativa),… A comunidade se encontra ao vivo.

### Reputação Universalista

Score que **não é gamificação vazia**: combina avaliações de leituras, contribuições na biblioteca, mentorias dadas, moderação responsável. **Multi-tradição** — você pode ser referência em Cabala E Tantra ao mesmo tempo.

## 📱 Performance — rápido em qualquer lugar

- **Bundle analyzer** integrado no build — você vê o que tá pesado
- **4 code-splits novos** — carrega só o que precisa, quando precisa
- **Fontes otimizadas** — sem FOIT/FOUT, sem custo de download desnecessário
- **Cache inteligente** — segunda visita é praticamente instantânea

## 🏥 Confiabilidade — saúde visível

- **Endpoint `/health`** — coração batendo, sempre
- **Sentry** — erro? a gente sabe antes de você reclamar
- **PostHog** — analytics que respeitam LGPD (cookieless, opt-in)

---

# 👩‍💻 Versão Dev-Facing

> Linguagem técnica. Commit refs quando disponíveis. Foco em **o que mudou na arquitetura**.

## 🏗️ Arquitetura

### Segurança & LGPD — Caio (@security)

- **F-LGPD-01..F-LGPD-10** — Implementação dos 10 direitos do titular (Lei 13.709/2018, art. 18)
  - Export endpoint: `GET /api/user/export` (JSON streaming + signed URL 24h)
  - Delete endpoint: `DELETE /api/user/account` (soft-delete 30d, hard-delete cron)
  - Consent granular: tabela `UserConsent` + middleware de enforcement
  - Audit log: `AuditLog` model com retention 5 anos
  - DPO contact: `dpo@akasha.portal` + rota interna
- **Sentry** integration com PII scrubbing (regex + denylist)
- **PostHog** self-hosted ou EU region + cookie-less mode
- Headers endurecidos: CSP report-only → enforced em prod
- Rate limiting por IP + por user (Redis-backed)

### Performance — Aki (@performance)

- **`@next/bundle-analyzer`** integrado em `pnpm analyze:bundle`
- **4 code-splits novos:**
  1. `<AkashaVoiceRecorder>` — lazy + dynamic import (não carrega em mobile fraco)
  2. `<MentorshipScheduler>` — carrega só em `/mentorship/*`
  3. `<MarketplaceCheckout>` — carrega só na rota de pagamento
  4. `<RichTextEditor>` — carrega no client apenas (SSR-safe)
- **Font subsetting** — latin + latin-ext apenas, woff2, preload apenas above-the-fold
- **Cache strategy:**
  - ISR `revalidate: 3600` em `/library`, `/library/[slug]`
  - `stale-while-revalidate` em `/api/library/search`
  - Service worker cache-first para assets estáticos
- **Bundle budgets** atualizados em `scripts/check-bundle-size.ts`:
  - Initial JS: ≤ 200KB
  - Per-route JS: ≤ 150KB
  - Image LCP: ≤ 80KB

### IA — Coder + Akasha Team

- **Akasha IA MVP** (Wave 10 carryover): `POST /api/akashic/chat`
- **Voice mode** (Wave 12): TTS via ElevenLabs + cache Redis 7d
- **SSE streaming**: `POST /api/akashic/chat/stream` (text/event-stream, 20 req/min/IP rate limit)
- **RAG helper** com graceful degradation se pgvector off (fallback keyword search)
- **System prompt module** com 8 regras éticas + 12 tradições
- **Source citation** — toda resposta inclui `[{article_id, tradition, relevance}]`
- **38 testes** (22 prompt + 16 endpoint) + **+18 testes voice** (Wave 12)

### Monitoring — Sentry + PostHog + Health

- **Sentry SDK** (`@sentry/nextjs`) com `beforeSend` scrubbing
- **PostHog** com feature flags para gradual rollout
- **`/api/health`** — DB + Redis + Supabase + pgvector status, returns 503 se degradado
- **Health dashboard** `/admin/health` (protegido por role)

### Deploy — Vercel + Runbook

- **`vercel.json`** — regions (iad1, gru1), cron jobs, headers, redirects
- **`docs/RUNBOOK.md`** — incident response, rollback, on-call
- **`scripts/pre-deploy-check.ts`** — gates antes de cada deploy (lint + tsc + tests + bundle + secrets scan)
- **Vercel Cron** — digest semanal segunda 9am BRT, embeddings reindex 3am UTC

## 📦 Schema Prisma — novos models (v0.2.0)

```
model Comment {
  id          String   @id @default(cuid())
  postId      String
  parentId    String?  // threading
  authorId    String
  body        String
  mentions    String[] // @user handles
  reactions   Reaction[]
  flagged     Boolean  @default(false)
  createdAt   DateTime @default(now())
  // + índices para threading eficiente
}

model Reaction   { id, userId, targetType, targetId, emoji }
model Bookmark   { id, userId, postId, folder, tags[] }
model Draft      { id, userId, content, scheduledFor? }
model Schedule   { id, postId, publishAt, status }
model PushSub    { id, userId, endpoint, keys, userAgent }
model Notification { id, userId, type, payload, readAt? }

model Event      { id, hostId, title, tradition, startsAt, capacity, isWorkshop }
model Mentorship { id, mentorId, menteeId, scheduledAt, status, notes }
model Reading    { id, readerId, title, tradition, priceCents, affiliateRate }
model Order      { id, buyerId, readingId, affiliateId?, amountCents, status }
model Affiliate  { id, userId, code, totalEarnedCents }

model Reputation { id, userId, score, breakdown Json, lastUpdated }

model UserConsent { id, userId, category, granted, ip, userAgent, timestamp }
model AuditLog    { id, userId, action, resourceType, resourceId, ip, timestamp }
```

## 🔌 API — novos endpoints

```
# Comments
GET    /api/posts/:id/comments?threaded=true
POST   /api/comments
PATCH  /api/comments/:id
DELETE /api/comments/:id
POST   /api/comments/:id/flag

# Bookmarks
GET    /api/bookmarks?folder=:folder
POST   /api/bookmarks
DELETE /api/bookmarks/:id

# Drafts & Schedule
GET    /api/drafts
POST   /api/drafts
PATCH  /api/drafts/:id
DELETE /api/drafts/:id
POST   /api/posts/:id/schedule

# Notifications
POST   /api/notifications/push/subscribe
DELETE /api/notifications/push/unsubscribe
GET    /api/notifications?unread=true

# Library
GET    /api/library/search?q=&tradition=
GET    /api/library/rss?tradition=
POST   /api/library/newsletter/subscribe

# Marketplace
GET    /api/readings?tradition=&price=
POST   /api/readings
POST   /api/orders
GET    /api/affiliates/:code

# Mentorship
GET    /api/mentors?tradition=
POST   /api/mentorship/book

# Events
GET    /api/events?upcoming=true
POST   /api/events
POST   /api/events/:id/rsvp

# Reputation
GET    /api/users/:id/reputation

# Privacy / LGPD
GET    /api/user/export        # streaming JSON
DELETE /api/user/account       # soft-delete
POST   /api/user/consent       # grant/revoke
GET    /api/audit/me           # my audit log

# Health
GET    /api/health             # DB + Redis + Supabase + pgvector
```

## ⚠️ Breaking Changes

### Para usuários

- **Reset de preferências de notificação** — quem tinha opt-in genérico agora precisa escolher granular. (Migração automática: defaults sensatos.)
- **Rascunhos antigos sem auto-save** — quem tinha texto em rascunho pré-Wave 12 precisa revisar (sistema salva backup legível).

### Para devs

- **`/api/posts/:id/like` descontinuado** — agora é `POST /api/posts/:id/react` com `{emoji}` no body. Backward-compat até v0.3.0 com warning.
- **`User.bio` virou `User.bioRich`** (rich text JSON) — migração automática em deploy, mas queries raw precisam update.
- **`/api/search` resposta mudou** — agora inclui `vectorScore` e `keywordScore` separados (antes era `score` único). Frontend atualizado.
- **Webhook signature mudou** — `X-Akasha-Signature` agora usa HMAC-SHA256 (era SHA1).
- **Cookie `akasha_session` agora `__Host-akasha_session`** — Secure + Path=/ apenas. Limpa cookies antigos no primeiro login.

## 🔧 Migration Guide (devs)

```bash
# 1. Pull latest
git checkout main && git pull

# 2. Install
pnpm install

# 3. Migrate DB (Prisma)
pnpm db:migrate deploy
# ou em dev:
pnpm db:migrate dev --name v0_2_0_lgpd_reputation

# 4. Regenerate Prisma client
pnpm db:generate

# 5. Seed novos models (idempotente)
pnpm seed:articles:all
pnpm tsx prisma/seed/consent-defaults.ts
pnpm tsx prisma/seed/reputation-defaults.ts

# 6. Env vars novos (ver .env.example diff)
AKASHA_LGPD_DPO_EMAIL=dpo@akasha.portal
AKASHA_AUDIT_RETENTION_DAYS=1825
SENTRY_DSN=
POSTHOG_API_KEY=
POSTHOG_HOST=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=

# 7. Pre-deploy check
pnpm tsx scripts/pre-deploy-check.ts

# 8. Build + analyze
pnpm analyze:bundle
pnpm build

# 9. Smoke
pnpm e2e:smoke
```

### Checklist de migração

- [ ] Rodar `pnpm db:migrate deploy` em staging antes de prod
- [ ] Verificar `/api/health` retorna 200 com todos os serviços `up`
- [ ] Confirmar Sentry recebe evento de teste (`pnpm tsx scripts/sentry-test.ts`)
- [ ] Confirmar PostHog recebe `$identify` no login
- [ ] Testar export LGPD com user de teste (deve baixar JSON válido)
- [ ] Testar delete LGPD (soft-delete deve sumir de queries de feed em 30d)
- [ ] Verificar Push notification em Chrome + Firefox + Safari
- [ ] Rodar 8 specs E2E (`pnpm e2e`)

## 🧪 Testes

- **8 specs E2E** (Playwright):
  1. `signup-onboarding-feed.spec.ts` (Wave 10)
  2. `feed-interaction.spec.ts` (Wave 10)
  3. `library-search.spec.ts` (Wave 10)
  4. `marketplace-checkout.spec.ts` (Wave 13)
  5. `mentorship-booking.spec.ts` (Wave 13)
  6. `lgpd-export-delete.spec.ts` (Wave 11)
  7. `push-notifications.spec.ts` (Wave 12)
  8. `akasha-voice-streaming.spec.ts` (Wave 12)

- **38 testes Akashic** + **22 testes security** + **18 testes voice** + **15 testes LGPD** + **12 testes reputation**

- **CI workflows:**
  - `.github/workflows/ci.yml` — tsc + lint + vitest + bundle-budget
  - `.github/workflows/e2e.yml` — Playwright matrix (chromium + mobile-safari)
  - `.github/workflows/perf-budgets.yml` — bundle analyzer regression
  - `.github/workflows/lgpd-audit.yml` — semanal, valida 10 direitos

## 📚 Conteúdo — Iyá (@curator)

- **100 artigos PT-BR** (16 tradições) via `prisma/seed/articles-root.ts`
- **Embeddings pgvector** — `scripts/embed-articles.ts` (OpenAI text-embedding-3-small)
- **Curadoria por tradição** — cada artigo com tags, fontes, disclaimer
- **Disclaimer universal** — "anecdótico vs peer-reviewed" presente em todo conteúdo médico/terapêutico
- **RSS feeds** por tradição + global
- **Newsletter semanal** — cron segunda 9am BRT, segmentada por tradição escolhida no onboarding

## 📦 Documentação nova

- `docs/RELEASE-NOTES-V0.2.0.md` (este arquivo)
- `docs/LGPD-IMPLEMENTATION.md` — mapeamento direito-a-implementação
- `docs/RUNBOOK.md` — incident response
- `docs/MARKETPLACE-GUIDE.md` — como oferecer leituras
- `docs/MENTORSHIP-GUIDE.md` — como ser mentor
- `docs/REPUTATION-SYSTEM.md` — algoritmo + safeguards
- `docs/PERF-FIXES-V0.2.0.md` — 4 code-splits + cache strategy
- `docs/AKASHIA-VOICE-MODE.md` — TTS pipeline
- `docs/CONTENT-V0.2.0.md` — 16 tradições cobertura

---

## 💜 Acknowledgments

Esta release só foi possível porque cada pessoa-agente contribuiu com cuidado cirúrgico:

- **Tomás (@pm)** — priorização, sequencing, definições de "pronto"
- **Coder** — implementação sólida, 0 TSC errors, migrations limpas
- **Caio (@security)** — LGPD sem juridiquês, threat model sempre atualizado
- **Aki (@performance)** — bundle budgets que viraram cultura, não gate
- **Ravena (@qa)** — 8 specs E2E com edge cases reais (não happy path)
- **Lina (@designer)** — UX de export LGPD que parece feature, não tela de banco
- **Iyá (@curator)** — curadoria de 100 artigos com respeito às tradições, sem apropriação
- **General** — bridge entre trilhas, handoffs sem perda de contexto
- **Verifier** — gate honesto, sem "all green" fake
- **Você** — que testou, reportou bug, pediu feature, e acreditou

E à **linhagem Cigano Ramiro**, que guia o jogo pelas mãos de axé.

---

## 🔮 Próximos passos — preview v0.3.0

Já no horizonte:

- **🧬 Perfil Consolidado** — página única integrando mapa astrológico, numerologia cabalística + tântrica, Odu de nascimento, com cruzamento por tema (sexualidade, trabalho, saúde, família, espiritualidade)
- **📊 Dashboard refatorado** — 3-5 widgets principais com clareza antes de cobertura
- **🌅 Insights diários personalizados** — push matinal com a energia do dia baseada no seu mapa
- **🪶 Mesa Real completa** — 36 cartas ciganas + 36 Odus com cruzamento automático dos 4 mapas
- **💬 Chat IA pós-jogo** — síntese completa de "todos os caminhos do consulente" + chat pra aprofundar
- **🌐 Multi-idioma** — PT-BR + EN + ES (prioridade para diáspora)
- **📱 App nativo** — Capacitor wrapper com push confiável no iOS
- **🪙 Akasha Tokens (opcional)** — governança comunitária para features premium

**v0.2.0 é fundação. v0.3.0 é a prática profunda.**

> 🌱 *A comunidade que cresce junta, floresce junto.*
