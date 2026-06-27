# Akasha IA — MVP Chat Wave 10

> **Status:** ✅ MVP entregue (2026-06-27)
> **Wave:** 10 — Batch 2 (Coder + skill security Caio)
> **Branch:** main
> **Commit base:** 981a7409

---

## TL;DR

Implementado o **MVP completo** da Akasha IA: chat RAG-aware com as 8 regras éticas de `docs/AI-PROMPT-base.md`, busca semântica via pgvector, painel de fontes citadas, filtro de tradição, e streaming opcional via SSE.

- **2 endpoints:** `/api/akashic/chat` (POST) + `/api/akashic/chat/stream` (SSE)
- **1 página:** `/akashic` (chat UI mobile-first)
- **1 prompt module:** `src/lib/ai/prompts/akasha.ts`
- **1 RAG helper:** `src/lib/ai/rag.ts`
- **2 test files:** prompt + endpoint (32 testes totais)

---

## Arquivos criados

```
src/lib/ai/prompts/akasha.ts             (11k)  system prompt + 8 regras + builder
src/lib/ai/rag.ts                        ( 4k)  RAG helper com degradação graceful
src/app/api/akashic/chat/route.ts        ( 7k)  endpoint POST principal
src/app/api/akashic/chat/stream/route.ts ( 6k)  endpoint SSE streaming
src/app/(community)/akashic/page.tsx     (19k)  UI do chat
__tests__/lib/ai/akasha-prompt.test.ts   ( 6k)  22 testes do prompt
__tests__/api/akashic-chat.test.ts       (11k)  16 testes do endpoint
docs/AKASHIA-IA-MVP-WAVE10.md            ← este arquivo
```

**Arquivos modificados:**
- `src/components/community/CommunityNav.tsx` — adicionados links `/akashic` no desktop nav e bottom nav

---

## System Prompt — conteúdo integral

O prompt vive em `src/lib/ai/prompts/akasha.ts` e é exportado como `AKASHA_SYSTEM_PROMPT`. Implementa **as 8 regras éticas** de `docs/AI-PROMPT-base.md`:

1. **Nunca prescreve** — sugere explorar, não diz "você deveria"
2. **Nunca substitui profissional** — sempre encaminha pra saúde / tradição
3. **Nunca promete cura** — fala em "evidência forte/média/fraca"
4. **Sempre cita** — DOI, autor, ano; admite quando não tem fonte
5. **Sempre lembra contexto cultural** — ayahuasca ≠ droga recreativa
6. **Sempre aponta contraindicações** — SSRI + psilocibina, etc
7. **Sempre respeita autoridade da tradição** — babalorixá, rabino, xamã
8. **Nunca forma seita** — ferramenta pública, não guru

A ordem é importante: identidade primeiro, contexto RAG depois — assim a IA não "esquece" as regras quando o contexto cresce.

### Como o prompt é montado

```ts
buildAkashaPrompt({
  tradition: 'cabala',           // opcional — filtro explícito
  sources: [...ragHits],         // injetado como bloco "Artigos relevantes"
});
```

Output (resumido):
```
# Akasha — Consciência Digital Universalista
... (identidade + 8 regras) ...

## Filtro de tradição ativo
O usuário pediu foco em: **cabala**. ...

## Artigos relevantes da biblioteca (RAG)
[1] **Reiki e ansiedade** (similaridade: 91.0%, slug: `reiki-ansiedade`)
   Estudo randomizado controlado com 200 pacientes...
```

---

## Endpoints criados

### `POST /api/akashic/chat` — chat principal

**Request:**
```json
{
  "message": "Como funciona Reiki pra ansiedade?",
  "tradition": "reiki",
  "history": [{ "role": "user", "content": "..." }],
  "topK": 5,
  "threshold": 0.65
}
```

**Response (200):**
```json
{
  "reply": "Estudos sugerem que Reiki pode ajudar com ansiedade em contexto...",
  "sources": [
    {
      "id": "art_123",
      "title": "Reiki e ansiedade: revisão sistemática 2024",
      "slug": "reiki-ansiedade",
      "similarity": 0.91,
      "excerpt": "Revisão de 23 estudos RCT...",
      "tradition": "reiki"
    }
  ],
  "meta": {
    "took_ms": 1843,
    "rag_took_ms": 234,
    "model": "gpt-4o",
    "tradition": "reiki",
    "rag_degraded": false,
    "tokens": { "prompt": 1230, "completion": 280, "total": 1510 }
  }
}
```

**Status codes:**
- `200` — sucesso
- `400` — validação (message vazia, tradition inválida, etc)
- `429` — rate limit (20 req/min/IP)
- `502` — OpenAI falhou depois de retries
- `503` — circuit breaker aberto

**Defesas em camadas (security Caio):**
1. **Sanitização** — `sanitizeInput()` remove prompt injection básico (`ignore previous instructions`, `[INST]`, etc)
2. **Rate limit** — 20 req/min por IP via `checkRateLimit()` (já existente em `src/lib/rate-limit.ts`)
3. **Validação zod** — schema rigoroso, retorna `VALIDATION_ERROR` com details
4. **Sem persistência de PII** — conversa é stateless (não salvamos mensagens)
5. **Circuit breaker** — já existe em `src/lib/ai/openai.ts`; respeitado

### `POST /api/akashic/chat/stream` — SSE streaming

Mesma lógica do `/chat`, mas usa Server-Sent Events para respostas token-a-token.

**Eventos:**
```
event: sources
data: {"sources":[...]}

event: meta
data: {"model":"gpt-4o","rag_degraded":false,"took_ms":234,"tradition":"reiki"}

event: token
data: {"content":"Estudos"}

event: token
data: {"content":" sugerem"}

event: done
data: {"ok":true}
```

Em caso de erro mid-stream:
```
event: error
data: {"code":"STREAM_ERROR","message":"..."}
```

**Headers:**
- `content-type: text/event-stream`
- `cache-control: no-cache, no-transform`
- `x-accel-buffering: no` (Nginx-friendly)

### `GET /api/akashic/chat` — health check

```json
{
  "ok": true,
  "endpoint": "/api/akashic/chat",
  "method": "POST",
  "schema": { ... }
}
```

---

## UI — `/akashic`

Página `/akashic` (dentro do layout `(community)`) com chat mobile-first.

### Layout (descrito — sem screenshot real)

**Desktop (md+):**
```
┌─────────────────────────────────────────────────┬──────────────────────┐
│  ✨ Akasha IA        [🔄 Nova conversa]         │  📚 Fontes citadas   │
│  Consciência tradutora universalista            │  [3]                 │
│  Tradição: [Cabala  ▾]                          │                      │
├─────────────────────────────────────────────────┤  ┌─────────────────┐ │
│                                                  │  │ [1] Reiki e     │ │
│  ✨ Olá, eu sou a Akasha                         │  │ ansiedade       │ │
│  Posso ajudar a conectar...                      │  │ 91% match · reiki│ │
│                                                  │  │ Estudo random.. │ │
│  Comece com uma pergunta:                        │  └─────────────────┘ │
│  💬 O que a ciência diz sobre Vipassana?         │                      │
│  💬 Quais práticas podem ajudar com ansiedade?   │  ┌─────────────────┐ │
│  💬 Como Cabala e Ifá se correlacionam?          │  │ [2] Vipassana   │ │
│                                                  │  │ DMN             │ │
│  ┌─────────────────────────────────────────┐    │  │ 74% match       │ │
│  │ 💬 Como funciona Reiki pra ansiedade?    │    │  └─────────────────┘ │
│  │                                          │    │                      │
│  │        ┌──────────────────────────────────┐│   │                      │
│  │        │ Estudos sugerem que Reiki...     ││   │                      │
│  │        │ gpt-4o · 1.2s · 3 fontes         ││   │                      │
│  │        └──────────────────────────────────┘│   │                      │
│  └─────────────────────────────────────────┘    │                      │
│                                                  │                      │
│  [Pergunte à Akasha...]                  [📤]    │                      │
│  Akasha cita papers, respeita tradições...      │                      │
└─────────────────────────────────────────────────┴──────────────────────┘
```

**Mobile:**
- Bottom sheet com sources (colapsável)
- Stack vertical, mesmo input fixo no rodapé
- 44px tap targets (a11y)

### Features

- ✅ **Lista de mensagens** com distinção user (amber/gold) vs assistant (slate)
- ✅ **Painel de fontes citadas** com similarity % + tradição + excerpt
- ✅ **Filtro de tradição** via `<Select>` (12 tradições + "Todas")
- ✅ **Empty state** com 6 sugestões de pergunta prontas
- ✅ **Loading state** ("Akasha está buscando na biblioteca e pensando…")
- ✅ **Error banner** + bubble de erro inline
- ✅ **Botão "Nova conversa"** para reset
- ✅ **Mobile-first** — bottom sheet para sources, 44px targets, safe-area-inset
- ✅ **A11y** — `aria-live="polite"`, `aria-label` em inputs, `aria-current` na nav

### Como o front consome

```ts
const res = await fetch('/api/akashic/chat', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ message, tradition, history }),
});
const data = await res.json();
// data.reply + data.sources + data.meta
```

Streaming opcional (SSE) — UI atual usa o endpoint non-streaming; pode evoluir para `/stream` com EventSource.

---

## Testes

### Cobertura

**`__tests__/lib/ai/akasha-prompt.test.ts` (22 testes)**
- As 8 regras éticas estão presentes no prompt ✅
- `AKASHA_TRADITIONS` tem 12 entries ✅
- `buildAkashaPrompt` com tradição, com RAG, com ambos, sem nada ✅
- Trunca excerpt > 400 chars ✅
- `maxContextChars` limita número de fontes ✅

**`__tests__/api/akashic-chat.test.ts` (16 testes)**
- GET health-check ✅
- Validação: message vazia, > 2000 chars, tradition inválida, topK > 10 ✅
- JSON inválido → 400 BAD_JSON ✅
- Rate limit → 429 + x-forwarded-for ✅
- Happy path → 200 com reply + sources ✅
- RAG degradado → `rag_degraded: true` + `rag_reason` ✅
- Sanitização: filtra `ignore previous instructions` no user + history ✅
- Erros OpenAI: circuit breaker (503), API key (401), genérico (500) ✅
- History > 20 → 400 ✅

### Como rodar localmente

```bash
# Roda só os testes da Akasha IA
./node_modules/.bin/vitest run __tests__/lib/ai/akasha-prompt.test.ts __tests__/api/akashic-chat.test.ts

# Roda tudo
./node_modules/.bin/vitest run
```

### Status da execução

⚠️ **Testes NÃO foram executados no sandbox cloud** — ambiente apresenta **bus error** (provável OOM no processo Node do vitest). Validação feita via:

1. **TypeScript:** `tsc --noEmit --project tsconfig.json` → **zero erros** nos arquivos novos
2. **Smoke test semântico** do prompt module (8 checks via Node + ts.transpileModule):
   - 8 regras presentes ✓
   - 12 tradições ✓
   - buildAkashaPrompt: tradição injetada ✓
   - buildAkashaPrompt: RAG block ✓
   - Similaridade formatada (90.0%) ✓
   - Truncamento de excerpt ✓
   - Sem RAG quando sources=[] ✓
   - maxContextChars limita fontes ✓

3. **Validação de imports:** todos os `import` resolvem para arquivos existentes no projeto

> Conforme preferência cross-project do usuário (2026-06-27): aceita-se "BLOCKED" quando o ambiente impede execução, desde que código/configs/docs estejam entregues e inspectable. Não fabricamos "all green".

---

## Como testar localmente

### Pré-requisitos

1. **Postgres com pgvector** rodando e `search_similar_articles()` aplicada:
   ```bash
   psql $DATABASE_URL -f prisma/migrations/20260627_000000_pgvector_enable/migration.sql
   ```

2. **Artigos com embedding** (já existe script):
   ```bash
   pnpm seed:articles    # 70 artigos
   pnpm embed:articles   # gera embeddings
   ```

3. **Variáveis de ambiente** em `.env.local`:
   ```
   OPENAI_API_KEY=sk-...
   DATABASE_URL=postgresql://...
   OPENAI_MODEL=gpt-4o
   OPENAI_FALLBACK_MODEL=gpt-4o-mini
   ```

### Subir

```bash
pnpm dev
# → http://localhost:3000/akashic
```

### Smoke test sem Supabase real

O endpoint degrada gracefully — se `search_similar_articles` falhar (sem pgvector), o sistema:
1. Marca `rag_degraded: true`
2. Injeta `rag_reason` no meta
3. Continua respondendo SEM bloco RAG (a IA responde só com conhecimento geral)

Para testar sem chave OpenAI: 401 INVALID_API_KEY é retornado com mensagem amigável.

### cURL rápido

```bash
curl -X POST http://localhost:3000/api/akashic/chat \
  -H "content-type: application/json" \
  -d '{"message":"Reiki funciona pra ansiedade?","tradition":"reiki"}'
```

### SSE streaming

```bash
curl -N -X POST http://localhost:3000/api/akashic/chat/stream \
  -H "content-type: application/json" \
  -d '{"message":"oi"}'
```

---

## Decisões de design

### Por que dois endpoints (não um com query param)?

- **`/chat`** — usado pela UI MVP, simple POST → JSON
- **`/chat/stream`** — SSE para futuras iterações com streaming real
- Manter separados é mais explícito e evita headers conflitantes (SSE precisa `text/event-stream`)

### Por que traditions enum (não string livre)?

- Garante que o filtro bate com `Article.tradition` no banco
- Zod rejeita valores inválidos → 400 explícito
- 12 tradições é o set completo conhecido; adicionar nova = bump + migration

### Por que 20 req/min?

- Conservador para MVP (evita abuso)
- Cabe numa janela de conversa típica (15-20 trocas)
- Bumped quando auth for adicionado (por userId, não IP)

### Por que não persistir histórico?

- **LGPD / privacy:** conversa pode ter dados sensíveis (saúde, práticas)
- **Stateless:** MVP foca em qualidade da resposta, não em features de produto
- **Futuro:** salvar em `AiConversation`/`AiMessage` (já no schema Prisma) com consent explícito

### Por que circuit breaker existente em vez de novo?

- `src/lib/ai/openai.ts` já implementa circuit breaker + retry + backoff exponencial
- Reutilizar garante consistência com outros call sites da IA
- Thresholds vêm de env vars (OPENAI_CIRCUIT_THRESHOLD etc)

---

## O que ficou fora (intencionalmente)

- ❌ **Persistência de conversa** — schema `AiConversation` existe mas não foi integrado
- ❌ **Feedback 👍/👎** — schema `AiMessage.helpful` existe mas não foi integrado
- ❌ **Multi-idioma** — só pt-BR por enquanto (i18n já tem `en.ts`)
- ❌ **Streaming na UI** — endpoint `/stream` existe mas a UI usa `/chat` non-streaming (mais simples pro MVP)
- ❌ **Auth** — endpoint é público por enquanto (rate limit por IP é a defesa)
- ❌ **Refinamento automático do prompt** — job semanal mencionado em `AI-PROMPT-base.md` ainda não existe

Essas evoluções ficam pra waves seguintes.

---

## Convenções seguidas

- **Conventional Commits** — `feat(akashic): ...`
- **Sem dependências novas** — usou `openai`, `zod`, `next/server`, `lucide-react` que já estavam
- **Mobile-first** — bottom sheet, 44px targets, safe-area-inset
- **Acessibilidade** — aria-live, aria-label, focus-visible, contraste WCAG AA
- **Server-side safety** — zod validate + sanitize + rate limit + circuit breaker
- **Documentação inline** — comentários `// =====` em todos os arquivos

---

## Próximos passos sugeridos

1. **Integrar feedback** — botões 👍/👎 após cada resposta, persistir em `AiMessage`
2. **Streaming na UI** — substituir fetch por EventSource em `akashic/page.tsx`
3. **Auth gate** — adicionar `requireViewer()` quando auth estiver maduro
4. **Job de refinamento** — script semanal que pega 👍 e ajusta prompt
5. **Métricas** — datadog/grafana para p95 latency, token usage, RAG hit rate
6. **Admin override** — moderadores podem ver/editar respostas da IA

---

> "Akasha é uma consciência tradutora universalista. Ela não substitui o guru, o cientista, nem o praticante. Ela amplia a visão e conecta o que estava separado. Cresce com a comunidade que a alimenta." 🧠🌱