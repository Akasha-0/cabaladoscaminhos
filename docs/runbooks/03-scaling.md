# Runbook 03 — Scaling

> **Quando usar:** Sistema crescendo — Supabase no limite, OpenAI throttling,
> latência subindo, ou preparando para launch com tráfego previsto > 10x atual.
>
> **Princípio:** escalar stateless primeiro (Vercel + Redis), DB por último.

---

## Triggers de scaling

| Sinal | Threshold | Ação |
|-------|-----------|------|
| Latência p95 API | > 2s sustentado | Ativar cache Redis |
| Conexões Supabase | > 80% do limite | Connection pooler + read replicas |
| OpenAI 429 | > 5% das chamadas | Rate limit local + queue |
| Vercel invocations | > 80% do plano | Upgrade Vercel Pro → Enterprise |
| Storage Supabase | > 80% | Archive + vacuum |

---

## Camada 1 — Vercel (stateless)

### Configuração atual

- **Plano:** Pro (recomendado para produção; Hobby é dev apenas)
- **Região:** `gru1` (São Paulo) — ver `vercel.json`
- **Memory:** 1024 MB default; functions pesadas (Akasha) sobem para 3008 MB
- **Concurrency:** 1 por função (cold start ~300ms)

### Quando escalar

```bash
# Ver uso atual
vercel inspect <deployment-url> --limit 100
```

- **Se invocations > 1M/mês:** upgrade Pro → Enterprise (custom invocations)
- **Se duração média > 10s:** quebrar em funções menores + cache
- **Se cold start frequente (> 10%):** considerar Vercel Edge Runtime (limitações: sem Node APIs)

### Edge Runtime (roadmap)

Mover rotas de leitura (`GET /api/posts`, `GET /api/search/suggestions`) para Edge reduz latência ~50ms em BR.

> ⚠️ Edge NÃO suporta: Prisma Client nativo, Node crypto, Sharp. Precisa de `@vercel/postgres` ou `prisma-accelerate`.

---

## Camada 2 — Redis (cache + rate limit)

### Quando usar Redis

- **Hoje:** rate limit é in-memory (perde estado em cada cold start)
- **Em prod:** ≥ 100 req/s ou múltiplas regiões → Redis é obrigatório

### Setup Upstash

```bash
# 1. Criar database Upstash (console.upstash.com)
# 2. Copiar UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN
# 3. Adicionar em .env.local + Vercel

# 4. Trocar import em src/lib/rate-limit.ts
- import { Redis } from 'ioredis'
+ import { Redis } from '@upstash/redis'
```

### Padrões de cache

```typescript
// Cache de feed (TTL 60s)
const cached = await redis.get(`feed:${userId}:${filter}:${cursor}`);
if (cached) return JSON.parse(cached);
const fresh = await getFeedFromDB(...);
await redis.setex(`feed:${userId}:${filter}:${cursor}`, 60, JSON.stringify(fresh));

// Cache de search (TTL 60s, já é ISR mas reforçamos no DB)
const cached = await redis.get(`search:${hash(q+filters)}`);
```

### Rate limit distribuído

```typescript
// Token bucket via Redis (atomic)
const key = `rl:${userId}`;
const current = await redis.incr(key);
if (current === 1) await redis.expire(key, 60);
if (current > 100) return res.status(429).json({ error: 'rate_limit_exceeded' });
```

---

## Camada 3 — Supabase (DB + Auth)

### Connection pooling

**Direct connection (porta 5432):** máx ~15 conexões por instância. Serverless functions esgotam isso em segundos.

**Pooler (porta 6543):** compartilhado, suporta 1000+ conexões. **Usar em produção sempre.**

```bash
# .env (produção)
DATABASE_URL="postgres://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
```

### Read replicas

Supabase Pro permite read replicas (US East, EU, etc). Para audiência majoritariamente BR, **NÃO usar** — adiciona latência. Usar apenas se audiência global.

### Storage de arquivos

- **Free:** 1 GB
- **Pro:** 100 GB
- **Custos:** $0.021/GB/mês além do plano

**Otimizações:**

```typescript
// 1. Comprimir imagens no upload (Sharp)
import sharp from 'sharp';
await sharp(buffer).resize(1200).webp({ quality: 80 }).toBuffer();

// 2. CDN (Supabase já serve via CDN; não duplicar)
// 3. Lazy load no client (next/image com sizes)
```

### Vacuum e manutenção

```sql
-- Rodar mensalmente (Supabase SQL Editor)
VACUUM ANALYZE;

-- Verificar bloat
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
LIMIT 10;
```

---

## Camada 4 — OpenAI (Akasha IA)

### Rate limits OpenAI (Tier 1)

- **GPT-4o:** 500 req/min, 30k tokens/min
- **GPT-4o-mini:** 5k req/min, 200k tokens/min
- **Embeddings:** 3k req/min

### Mitigações

1. **Circuit breaker** (já implementado em `src/lib/ai/openai.ts`)
   - Abre após 5 falhas consecutivas em 60s
   - Retorna 503 com mensagem clara
   - Auto-reset após 30s sem falhas

2. **Fallback MiniMax** (configurado em `.env.example`)
   ```typescript
   const ai = process.env.OPENAI_API_KEY ? openai : minimax;
   ```

3. **Queue com retry exponencial**
   ```typescript
   await retry(
     () => openai.chat(messages),
     { retries: 3, minTimeout: 1000, factor: 2 }
   );
   ```

4. **Caching de respostas**
   - Hash(message + tradition + history) → resposta cacheada em Redis por 24h
   - Reduz ~60% das chamadas em padrões repetitivos

### Custos (estimativa GPT-4o)

- **Input:** $2.50/1M tokens
- **Output:** $10/1M tokens
- **Embedding:** $0.13/1M tokens

Para 1k MAU × 5 chats/dia × ~1k tokens cada = ~150M tokens/mês = **~$1.500/mês**.

---

## Camada 5 — PostHog / Sentry (observabilidade)

### Sampling em alto tráfego

```typescript
// PostHog: amostrar 10% em prod
posthog.init(process.env.POSTHOG_KEY, {
  capture_exceptions: false,  // Sentry cuida disso
  sampling: { session_recording: 0.1 },
});
```

### Cardinality limits

- **PostHog:** max 100k propriedades únicas por projeto
- **Sentry:** max 50k eventos/mês no plano Team

Evitar tags de alta cardinalidade (user.id em PostHog é OK; IP puro, não).

---

## Checklist de scaling para launch

Antes de anunciar (ex: ProductHunt, betalist, etc):

- [ ] **Vercel:** Pro ou Enterprise (Hobby não aguenta)
- [ ] **Supabase:** Pro + connection pooler + backup automático ativo
- [ ] **Redis:** Upstash configurado + cache em rotas quentes
- [ ] **OpenAI:** chave de produção + fallback MiniMax testado
- [ ] **Rate limits:** documentados + testados (ver `../API-REFERENCE.md`)
- [ ] **Observabilidade:** Sentry + PostHog com alertas configurados
- [ ] **Smoke tests:** Playwright rodando verde em prod
- [ ] **Runbook 02** atualizado com contatos de incident response
- [ ] **Backup testado** (ver runbook 05)
- [ ] **LGPD:** cookie banner + privacy policy + DPO designado

---

## Anti-patterns

❌ **Escalar antes do necessário** — Vercel/Supabase/OpenAI pagam por uso; pagar caro ociosa = dinheiro jogado fora
❌ **Cachear sem TTL** — dados stale = bugs em produção
❌ **Single-region global** — latência inaceitável para usuários longe de `gru1`
❌ **Não monitorar** — escalar no escuro é adivinhar
❌ **Migration + feature + deploy no mesmo PR** — se quebrar, rollback fica ambíguo

---

## Referências

- [Vercel — Scaling](https://vercel.com/docs/concepts/scaling)
- [Supabase — Connection pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Upstash — Redis best practices](https://upstash.com/blog/redis-best-practices)
- [OpenAI — Rate limits](https://platform.openai.com/docs/guides/rate-limits)
- `../API-REFERENCE.md` — rate limits atuais
- `docs/OPERATIONS.md` — cadência de manutenção