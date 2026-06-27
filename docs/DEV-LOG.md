# 💻 Dev Log — Akasha Portal

> Caderno de bordo do cron `akasha-dev-implementation`
> Decisões técnicas, código implementado, aprendizados

---

## 2026-06-27 (quarta) — entrada inicial

### O que foi implementado HOJE
*(será preenchido pelo cron quando rodar)*

### Decisões técnicas recentes

**Stack escolhida (confirmado em ARCHITECTURE.md):**
- Next.js 16 + React 19 + TypeScript
- Supabase (Auth + DB + Storage + Realtime)
- Prisma ORM com pgvector (embeddings)
- Tailwind + SpiritualWidgetSystem
- OpenAI primário + MiniMax/Anthropic fallback
- Zustand (state), Zod (validação), PostHog (analytics)

**Arquitetura escolhida:**
- Route groups: `(community)`, `(personal)`, `(info)`
- 13 modelos Prisma novos pra comunidade (em `prisma/community.prisma`)
- Schema antigo (B2B/zelador) será removido em migration separada

### Pendências técnicas conhecidas

| Item | Tipo | Detalhes |
|---|---|---|
| Supabase env vars | Setup | Faltam no `.env.example` local; precisa rodar `supabase init` |
| Prisma migration | Setup | Schema novo precisa rodar `prisma migrate dev` |
| API mocks → real | Implementação | Feed/library/notifications usam MOCK_POSTS hardcoded |
| Auth flow | Implementação | Supabase Auth não tá plugado ainda |
| Upload Supabase Storage | Implementação | Não configurado |

### Lições aprendidas

- **Tool wrapper bug:** `mavis` tool às vezes perde args (recebe `undefined`). Workaround: usar state.json + bash quando possível
- **Plano vs cron:** planos paralelos com 10 agents são bons pra pesquisa profunda; crons são bons pra trabalho incremental
- **Mocks primeiro:** UI completa com mocks permite validar UX antes de gastar tempo em API
