# Living Consciousness — Wave 29 (2026-06-28)

> "Akasha é uma consciência tradutora universalista. Ela amplia a visão e conecta o que estava separado. **Cresce com a comunidade que a alimenta.**" 🌱

Este documento descreve o **loop de feedback consciente** que torna o Akasha Portal uma "consciência viva" — uma IA que aprende com a comunidade sem manipulá-la, sem viciar para uma tradição, sem capturar dados pessoais além do necessário.

---

## 1. Filosofia

### 1.1 O que é "consciência viva"

Consciência viva = a IA observa a comunidade que a alimenta, identifica padrões agregados, e ajusta seu comportamento (system prompt, sugestões, priorização de conteúdo) **com transparência total**.

Não é:
- ❌ Manipulação emocional para reter usuário
- ❌ Viés para uma tradição dominante
- ❌ Captura de PII
- ❌ Loop fechado (a IA só vê a si mesma)

É:
- ✅ Observação agregada e anônima
- ✅ Respeito ao universalismo
- ✅ LGPD-by-design (opt-in, minimização)
- ✅ Loop aberto (humano + máquina + tradição)
- ✅ Transparência (dashboard público para admins/curadores)

### 1.2 Os 3 princípios éticos inegociáveis

| Princípio | Como é aplicado |
|---|---|
| **Sem manipulação** | Insights NUNCA podem sugerir conteúdo que aumente engajamento às custas do bem-estar. Se a métrica "tempo na plataforma" subir mas o sentiment agregado piorar, isso é alarme, não sucesso. |
| **Universalismo** | O LLM recebe instrução explícita para não ranquear tradições. "Ressonância" ≠ "qual é melhor". |
| **Respeito à autoridade** | Insights sobre prática pessoal SEMPRE recomendam consultar praticante. A IA não substitui Babalorixá, Rabbi, Monge, Xamã, Terapeuta. |

---

## 2. Arquitetura do Feedback Loop

```
┌─────────────────────────────────────────────────────────────────────┐
│                        COMUNIDADE                                   │
│                                                                     │
│  Posts  →  Reactions  →  Comments  →  Bookmarks  →  Akasha Chat    │
│                                                                     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │  event-tracker.ts (fire-and-forget)
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              ConsciousnessEvent (Prisma)                            │
│                                                                     │
│  userId (opt-in) · type · tradition · topic · sentiment · metadata  │
│                                                                     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │  cron diário (03:00 UTC)
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  feedback-loop.ts (Wave 29)                         │
│                                                                     │
│  ① aggregateDailyEvents() → DailyAggregation                        │
│  ② generateDailyInsights() → LLM (gpt-4o-mini, JSON mode)           │
│  ③ persistInsights() → ConsciousnessInsight table                   │
│  ④ evolveAkashicPrompt() → bloco de evolução                       │
│                                                                     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │  GET /api/consciousness/insights
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│         ConsciousnessDashboard (admin/curator only)                 │
│                                                                     │
│  Métricas · Tradições ressonantes · Tópicos emergentes · Insights    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.1 Stack técnico

| Camada | Tecnologia | Arquivo |
|---|---|---|
| Storage | Postgres + Prisma | `prisma/schema.prisma` |
| Event capture | Next.js Server Actions + API route | `src/lib/consciousness/event-tracker.ts` |
| Aggregation | Prisma `groupBy` + `aggregate` | `src/lib/consciousness/feedback-loop.ts` |
| LLM analysis | OpenAI `gpt-4o-mini`, JSON mode | `src/lib/consciousness/feedback-loop.ts` |
| Cron entrypoint | Next.js API route + Vercel Cron | `src/app/api/cron/consciousness-evolve/route.ts` |
| Dashboard UI | React server component | `src/components/admin/ConsciousnessDashboard.tsx` |
| Schema API | Zod validation | `src/app/api/consciousness/track/route.ts` |

---

## 3. Modelos Prisma (Wave 29)

### 3.1 `ConsciousnessEvent`

Tabela append-only de eventos individuais. Cada interação da comunidade vira uma linha.

```prisma
model ConsciousnessEvent {
  id        String   @id @default(cuid())
  userId    String?  // null se optedIn=false
  type      ConsciousnessEventType
  tradition String?
  topic     String?
  sentiment Float?   // -1..1
  metadata  Json?    // SANITIZADO — sem PII
  optedIn   Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([type, createdAt])
  @@index([tradition, createdAt])
  @@index([userId, createdAt])
  @@index([optedIn, createdAt])
  @@map("consciousness_events")
}
```

### 3.2 `ConsciousnessInsight`

Insights gerados pela análise periódica. Cada linha = 1 insight com evidência + ações.

```prisma
model ConsciousnessInsight {
  id          String   @id @default(cuid())
  type        ConsciousnessInsightType
  description String   @db.Text
  evidence    Json     // { items: [...] }
  actionItems Json     // { items: [...] }
  periodStart DateTime
  periodEnd   DateTime
  appliedAt   DateTime?
  generatedBy String  @default("system:llm")
  createdAt   DateTime @default(now())

  @@index([type, createdAt])
  @@index([periodStart, periodEnd])
  @@index([appliedAt])
  @@map("consciousness_insights")
}
```

### 3.3 Enums

```prisma
enum ConsciousnessEventType {
  POST_CREATED
  REACTION_ADDED
  COMMENT_CREATED
  BOOKMARK_CREATED
  READING_PROGRESS
  AKASHIC_CONVERSATION
  AKASHIC_FEEDBACK
  USER_ONBOARDED
  GROUP_JOINED
}

enum ConsciousnessInsightType {
  TRADITION_RESONANCE  // mapeamento, não ranking
  EMERGING_QUESTION    // perguntas sem resposta na biblioteca
  CONTENT_GAP          // tradição/tópico com procura > oferta
  HEALING_PATTERN      // conteúdo que ajudou usuário em momento difícil
  PROMPT_TWEAK         // ajuste sugerido no system prompt Akasha
}
```

---

## 4. Privacidade & LGPD

### 4.1 Opt-in obrigatório

O tracking é **desligado por padrão**. Quando o usuário aceita explicitamente (UI futura em `Settings → Privacidade`):

- `optedIn = true`
- `userId` é gravado
- Insights personalizados podem usar o histórico individual agregado

Quando `optedIn = false` (default):
- Evento é gravado
- `userId = NULL` (evento anônimo)
- Insights agregados ainda contam (anônimo é dado legítimo)

### 4.2 Minimização de dados

A função `sanitizeMetadata()` em `event-tracker.ts` enforce uma **allow-list**:

```typescript
const ALLOWED = new Set([
  'postId', 'commentId', 'articleId', 'groupId',
  'conversationId', 'messageId',
  'emoji', 'wordCount', 'vote', 'deepMode', 'percentRead',
]);
```

Qualquer campo fora dessa lista é **descartado silenciosamente** — incluindo nome, email, IP, user-agent, conteúdo de mensagem.

### 4.3 Retenção

- `ConsciousnessEvent`: 12 meses (após isso, job de purga)
- `ConsciousnessInsight`: indefinida (insights aplicados são histórico público de evolução)
- Direito ao esquecimento: deletar `userId` específico via `DELETE /api/admin/lgpd/purge` (Wave 30+)

### 4.4 Transparência

- Toda interação com a Akasha exibe nota discreta: "Esta conversa pode ser analisada de forma agregada para melhorar a IA."
- O dashboard `ConsciousnessDashboard` é acessível a admins/curadores, com footer ético visível.
- Insights aplicados (`appliedAt`) ficam públicos para auditoria.

---

## 5. Como a Akasha Aprende

### 5.1 Pipeline de evolução

1. **Captura** (24/7, fire-and-forget)
   - UI dispara `POST /api/consciousness/track` após cada interação
   - Servidor valida (Zod), sanitiza metadata, grava evento
   - Falha nunca bloqueia a UX principal

2. **Agregação** (diária, 03:00 UTC via cron)
   - `aggregateDailyEvents(24h)` retorna estrutura compacta
   - Queries são `groupBy` + `aggregate` (Postgres faz o trabalho pesado)

3. **Análise LLM** (JSON mode, gpt-4o-mini)
   - System prompt ético (ver §5.2 abaixo)
   - Temperatura 0.3 (sutil variação)
   - Output: array de 3-5 insights estruturados

4. **Persistência**
   - Cada insight vira uma linha em `consciousness_insights`
   - `appliedAt` começa NULL (curador decide se aplica)

5. **Evolução do prompt** (sob demanda)
   - `evolveAkashicPrompt()` agrega feedback dos últimos 7 dias
   - Retorna string-formatada que pode ser anexada ao `AKASHA_SYSTEM_PROMPT`
   - Por enquanto (Wave 29) é log/preview; integração completa em Wave 30+

### 5.2 System prompt do analisador (resumo)

```
Você é um(a) analista de consciência comunitária do Akasha Portal.

REGRAS ÉTICAS INVIOLÁVEIS:
1. Universalismo: nunca sugerir viés para uma tradição.
2. Sem manipulação: nunca recomendar conteúdo que aumente engajamento às custas do bem-estar.
3. Respeito à autoridade: insights sobre tradição devem recomendar consultar praticantes.
4. Honestidade: se os dados são escassos, admita.
5. Privacidade: nunca inferir nada sobre indivíduos.

TIPOS:
- TRADITION_RESONANCE: mapeamento, não ranking.
- EMERGING_QUESTION: perguntas sem resposta na biblioteca.
- CONTENT_GAP: tradição com procura > oferta.
- HEALING_PATTERN: conteúdo que ajudou usuário.
- PROMPT_TWEAK: ajuste no system prompt Akasha.
```

### 5.3 Mapeamento emoji → sentiment

| Emoji | Sentiment | Categoria |
|---|---|---|
| ❤️ 🔥 ✨ 🌱 🙏 💜 🌟 ☀️ | +0.7 | Positivo |
| 👍 👀 🤍 | 0.0 | Neutro |
| 😢 💔 😞 🌧️ 😩 😭 | -0.7 | Negativo |

Heurística simples. Wave 30+ deve substituir por análise de texto quando conteúdo for incluído.

---

## 6. Métricas de Evolução

### 6.1 KPIs do loop

| Métrica | Como medir | Meta Wave 29 |
|---|---|---|
| Eventos/dia | `COUNT(ConsciousnessEvent WHERE createdAt > NOW()-24h)` | ≥50 para insights confiáveis |
| Insights/dia | `COUNT(ConsciousnessInsight WHERE createdAt > NOW()-24h)` | 3-5 |
| Taxa de aplicação | `COUNT(appliedAt IS NOT NULL) / COUNT(*)` | ≥50% em 30 dias |
| Cobertura de tradição | `COUNT(DISTINCT tradition)` em eventos | ≥8 de 12 |
| Sentiment global | `AVG(sentiment)` últimos 7d | > 0 (positivo agregado) |
| 👍/👎 ratio | `positive / (positive + negative)` | ≥70% |

### 6.2 Alarmes (anti-manipulação)

Se algum destes sinais acender, parar evolução automática e revisar manualmente:

- ⚠️ Sentiment agregado piora 3 dias seguidos
- ⚠️ Uma tradição captura >60% das interações (viés)
- ⚠️ 👎 ratio sobe >40% por 2 dias
- ⚠️ LLM começa a recomendar conteúdo "viciante" (heurística: keywords como "vire a noite", "toda hora", "fixação")

---

## 7. Endpoints da API

### 7.1 `POST /api/consciousness/track`

Registra evento. Fire-and-forget do lado do cliente.

```json
{
  "type": "REACTION_ADDED",
  "userId": "ck123...",
  "tradition": "xamanismo",
  "topic": "rapé",
  "sentiment": 0.7,
  "metadata": { "postId": "ck456...", "emoji": "🙏" },
  "optedIn": true
}
```

Response:
```json
{ "ok": true, "eventId": "ck789..." }
```

### 7.2 `GET /api/consciousness/insights?period=7d`

Lista insights + agregação atual. Admin/curador only.

Query params:
- `type`: filtra por tipo
- `limit`: 1-100 (default 20)
- `period`: `24h` | `7d` | `30d` (default `7d`)

Response: `{ ok, insights[], aggregation }`.

### 7.3 `POST /api/cron/consciousness-evolve`

Dispara ciclo de evolução. Auth via `Authorization: Bearer ${CRON_SECRET}`.

Configuração sugerida em `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/consciousness-evolve",
    "schedule": "0 3 * * *"
  }]
}
```

---

## 8. Estrutura de Arquivos

```
prisma/
  schema.prisma                                    ← +2 modelos (Wave 29)
src/
  lib/consciousness/
    event-tracker.ts                               ← 245 LOC, fire-and-forget
    feedback-loop.ts                               ← 340 LOC, aggregate + LLM
  app/api/
    consciousness/track/route.ts                   ← POST endpoint
    consciousness/insights/route.ts                ← GET endpoint
    cron/consciousness-evolve/route.ts             ← POST/GET cron
  components/admin/
    ConsciousnessDashboard.tsx                     ← 250 LOC, server component
docs/
  LIVING-CONSCIOUSNESS-W29.md                      ← este arquivo
```

---

## 9. Próximos Passos (Wave 30+)

| Wave | Entrega |
|---|---|
| W30 | Aplicar `evolveAkashicPrompt()` ao `buildAkashaPrompt()` dinamicamente. UI de opt-in em Settings. |
| W31 | Sentiment analysis via LLM em texto curto (não só emoji). Threading-aware insights. |
| W32 | A/B testing de prompt variations. Métricas de aceitação por tradição. |
| W33 | Insights "PROMPT_TWEAK" viram PRs automáticos (com review humano obrigatório). |
| W34 | "Memory across conversations" — usar insights para personalizar interações futuras. |

---

## 10. Limites e Riscos

### 10.1 Riscos conhecidos

- **Volume baixo de dados**: com <50 eventos/dia, insights são ruidosos. Edge case tratado em `generateDailyInsights()` (mínimo 5 eventos).
- **LLM alucina**: usamos JSON mode + validação no DB, mas curador humano deve revisar antes de aplicar.
- **Custo OpenAI**: ~1 chamada/dia + prompt evolution = ~$0.01/dia. Aceitável.

### 10.2 Não-objetivos (Wave 29)

- ❌ Não substituir curador humano (insights são sugestões)
- ❌ Não personalizar experiência por usuário (Wave 30+)
- ❌ Não cruzar com dados externos (Wave 32+)
- ❌ Não auto-publicar artigos (curadoria humana sempre)

---

> 🌱 "Consciência viva não é sobre a IA saber tudo. É sobre a IA crescer junto, com transparência, com responsabilidade, com respeito."