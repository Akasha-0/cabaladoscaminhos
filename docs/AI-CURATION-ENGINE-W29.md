# AI Curation Engine — Wave 29

**Status:** ✅ Delivered (Wave 29 · AI Curation Engine 4/8)
**Branch target:** `main` (post-W28)
**Author:** Coder + Iyá (Curator) — Wave 29 sub-fix
**Sandbox environment:** Linux cloud sandbox, 2GB RAM ceiling

---

## 1. Visão Geral

O **AI Curation Engine** é um pipeline contínuo (cron diário) que mantém a base de conhecimento do **Cabala dos Caminhos** atualizada com artigos, papers e notícias de fontes confiáveis sobre espiritualidade, medicinas tradicionais e saúde integrativa.

Ele **NÃO** inventa conteúdo. Ele **NÃO** substitui curadores humanos. Ele é um **gatekeeper automatizado** que:

1. **Busca** artigos reais em fontes oficiais (PubMed, SciELO, Crossref, arXiv, MAPS, Chacruna, ICEERS).
2. **Pontua** cada artigo com LLM em 5 dimensões (relevância, evidência, segurança, universalismo, citações).
3. **Persiste** artigos aprovados (ACCEPT) ou marcados para revisão humana (REVIEW).
4. **Rejeita** artigos que violam as regras éticas da Akasha IA ou não têm evidência mínima.

É a primeira camada de defesa contra alucinação: o LLM é usado **só para classificar** artigos que já existem no mundo real.

---

## 2. Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CRON TRIGGER (daily 06:00 UTC)                  │
│                  Vercel Cron / GitHub Actions / manual              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
                ┌──────────────────────────────┐
                │   GET /api/cron/curate-articles │
                │   Auth: Bearer CRON_SECRET      │
                └──────────────┬─────────────────┘
                               │
                               ▼
       ┌────────────────────────────────────────────────────┐
       │           curateDaily() — engine.ts              │
       │   • Loop em DEFAULT_SOURCES                        │
       │   • Para cada source:                              │
       │     1. fetchFromSource() — busca artigos          │
       │     2. pMap(scoreArticle, 8) — paraleliza LLM     │
       │     3. Persist ou rejeita                          │
       └────────────────────┬───────────────────────────────┘
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
┌──────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   SOURCES    │   │   LLM SCORING    │   │   PERSISTENCE   │
│  • PubMed    │   │  curation-prompt │   │  • Prisma DB    │
│  • SciELO    │   │  temperature=0   │   │  • JSONL ledger │
│  • Crossref  │   │  maxTokens=600   │   │  (fallback)     │
│  • arXiv     │   │  json response   │   │                 │
│  • MAPS      │   │                  │   │                 │
│  • Chacruna  │   │  3 retries with  │   │                 │
│  • ICEERS    │   │  exp backoff     │   │                 │
└──────────────┘   └─────────────────┘   └─────────────────┘
```

### 2.1 Módulos

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/ai/curation-prompt.ts` | System prompt + schema Zod + agregação de scores |
| `src/lib/curation/sources.ts` | Registry das 7 fontes + fetchers tipados |
| `src/lib/curation/engine.ts` | Orquestrador: `curateDaily()`, `curateSource()`, `listSources()` |
| `src/app/api/cron/curate-articles/route.ts` | Endpoint autenticado para o cron |
| `scripts/curate-now.ts` | CLI para disparo manual (`pnpm curate`) |
| `docs/AI-CURATION-ENGINE-W29.md` | Este documento |

---

## 3. Fontes Configuradas

7 fontes ativas, cada uma com query específica e tradição espiritual relacionada:

| # | Source Name | Tipo | Tradição | Max/Run | URL da API |
|---|---|---|---|---|---|
| 1 | `pubmed-meditation` | PubMed | Meditação contemplativa | 25 | `eutils.ncbi.nlm.nih.gov` |
| 2 | `pubmed-psychedelics` | PubMed | Medicinas psicodélicas | 25 | `eutils.ncbi.nlm.nih.gov` |
| 3 | `scielo-saude-espiritual` | SciELO | Espiritualidade e saúde pública | 20 | `api.scielo.org` |
| 4 | `crossref-integrative` | Crossref | Medicina integrativa | 30 | `api.crossref.org` |
| 5 | `arxiv-consciousness` | arXiv | Neurociência contemplativa | 15 | `export.arxiv.org/api` |
| 6 | `maps-research` | RSS | Pesquisa psicodélica | 10 | `maps.org/news/research` |
| 7 | `chacruna-ayahuasca` | RSS | Ayahuasca e plantas | 10 | `chacruna-institute.org/feed/` |
| 8 | `iceers-ibogaine` | RSS | Ibogaína e medicinas amazônicas | 10 | `iceers.org/feed/` |

**Total máximo por execução:** ~145 artigos.
**Concorrência LLM:** 8 chamadas paralelas (limite respeitando rate limits).
**Tempo estimado de execução:** ~3–6 minutos (depende da latência das APIs).

### 3.1 Rate limiting

Cada host externo recebe no mínimo 200ms entre requests (via `rateLimitedFetch`). Em caso de 5xx, faz retry com backoff exponencial (500ms × 2^attempt). Em caso de 4xx, propaga o erro (não adianta retry em query malformada).

### 3.2 Retries

3 tentativas por artigo para o LLM (configurável no `engine.ts`). Resposta do LLM que não passa no schema Zod é tratada como REJECT silencioso (log warning, não fatal).

---

## 4. LLM Scoring Rubric

O prompt do sistema (`CURATION_SYSTEM_PROMPT`) define a persona e os 8 princípios éticos. O LLM retorna JSON com:

```json
{
  "relevance":     0.0–1.0,   // relevância para práticas espirituais/medicinais
  "evidence":      0.0–1.0,   // qualidade metodológica
  "safety":        0.0–1.0,   // respeito a disclaimers médicos
  "universalism":  0.0–1.0,   // respeito a múltiplas tradições
  "citations":     0.0–1.0,   // referências verificáveis
  "recommendation":"ACCEPT" | "REVIEW" | "REJECT",
  "reason":        "string em PT-BR",
  "tradition":     "string opcional (Candomblé, Budismo, etc.)"
}
```

### 4.1 Pesos para score agregado

| Dimensão | Peso | Justificativa |
|---|---|---|
| relevance | 0.20 | Tema central da curadoria |
| evidence | 0.25 | Hedge contra pseudociência |
| safety | 0.25 | Crítico para medicinas psicodélicas |
| universalism | 0.10 | Importante mas já temos curadoria humana |
| citations | 0.20 | Traçabilidade |

### 4.2 Thresholds de decisão

```typescript
ACCEPT_THRESHOLD  = 0.7   // agregado mínimo para AUTO-ACCEPT
REVIEW_THRESHOLD  = 0.4   // abaixo disso → REJECT automático
```

**Regra dura (não-negociável):** Se **qualquer** sub-score < 0.4, o artigo é REJECT mesmo que o LLM tenha recomendado ACCEPT. Isso impede que o LLM classifique um artigo tóxico como relevante.

---

## 5. Cron Schedule

### 5.1 Configuração recomendada (Vercel)

Em `vercel.json` (não alterado nesta wave — fora de escopo):

```json
{
  "crons": [
    {
      "path": "/api/cron/curate-articles",
      "schedule": "0 6 * * *"
    }
  ]
}
```

Todos os dias às 06:00 UTC. Janela ampla para evitar race conditions com outros crons.

### 5.2 Configuração alternativa (GitHub Actions)

`.github/workflows/curate-daily.yml`:

```yaml
name: Daily Curation
on:
  schedule:
    - cron: '0 6 * * *'
  workflow_dispatch:
jobs:
  curate:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger curation
        run: |
          curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
            "$APP_URL/api/cron/curate-articles"
```

### 5.3 Trigger manual

```bash
# Todas as fontes
pnpm curate

# Fonte específica
pnpm curate --source=pubmed-psychedelics

# Com REVIEW incluído
pnpm curate --include-review

# Dry-run (fetch + score, sem persistir)
pnpm curate --dry-run --source=crossref-integrative

# Listar fontes disponíveis
pnpm curate --list
```

---

## 6. Monitoring

### 6.1 Logs estruturados

Todos os logs vão para stderr com prefixo `[curation]` ou `[curation:cron]`. Formato JSON-parseable para facilitar ingestion por Datadog/CloudWatch.

```json
{"level":"info","msg":"[curation] source done","source":"pubmed-meditation","fetched":18,"curated":12,"rejected":5,"review":1,"durationMs":4321}
```

### 6.2 Métricas sugeridas

- `curation_total_curated` (counter): total de artigos aceitos
- `curation_total_rejected` (counter): total de artigos rejeitados
- `curation_source_duration_ms` (histogram): latência por fonte
- `curation_llm_failure_rate` (gauge): % de artigos que falharam no LLM
- `curation_total_errors` (counter): erros de fetch/persistência

### 6.3 Sentry

Em produção, o route handler captura `(e as Error)` no `catch` final. Para monitoring mais granular, importar `Sentry` no topo do `engine.ts` e adicionar `Sentry.captureException(e, { tags: { source: source.name } })` no catch de cada source.

### 6.4 Health check

A rota retorna `200 { ok: true }` em sucesso ou `500 { ok: false, error }` em falha. Monitor externo pode fazer ping diário e alertar se `ok === false` por 2 dias consecutivos.

---

## 7. Schema do Banco (Prisma)

Modelo `CuratedArticle` esperado (criação do schema fica para wave futura):

```prisma
model CuratedArticle {
  id          String   @id @default(cuid())
  source      String
  externalId  String
  title       String
  url         String
  doi         String?
  pmid        String?
  tradition   String?
  score       String   // JSON serializado
  aggregate   Float
  curatedAt   DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([source, externalId])
  @@index([tradition])
  @@index([curatedAt])
}
```

O engine faz **upsert** pela chave `(source, externalId)` — é idempotente. Rodar 2× no mesmo dia não duplica artigos.

---

## 8. Limites Conhecidos & Próximos Passos

### 8.1 Limites

- **Sem fallback de embeddings.** Quando o artigo é persistido, ainda não disparamos o cálculo de embedding nem o upsert no índice RAG. Wave futura deve adicionar um `postPersist` hook que chama `embeddings.ts` e indexa no vector store.
- **Sem deduplicação cross-source.** O mesmo artigo pode aparecer em PubMed e Crossref. Deduplicação via DOI é trivial mas ainda não implementada.
- **Sem retry persistente.** Se o cron falhar no meio, não retoma do ponto — precisa rodar de novo.
- **Tradução de abstract.** Abstracts em outros idiomas são persistidos como estão (não há tradução automática).

### 8.2 Próximas waves

- **Wave 30:** Adicionar embeddings + RAG indexing no `postPersist`.
- **Wave 31:** Deduplicação cross-source via DOI/PMID matching.
- **Wave 32:** Dashboard admin para revisar artigos em `REVIEW`.
- **Wave 33:** Alertas Slack/Telegram para artigos psicodélicos com evidência forte (time-to-market para o chat IA).

---

## 9. Compliance com as 8 Regras da Akasha IA

| Regra | Como o engine respeita |
|---|---|
| 1. Não prescreve | Engine NÃO recomenda tratamento; só persiste artigos |
| 2. Sempre cita | Todo artigo precisa de DOI/PMID/URL verificável |
| 3. Não proselitiza | Score `universalism` penaliza proselitismo |
| 4. Não alucina | Engine só ingere artigos REAIS (fetch HTTP obrigatório) |
| 5. Transparente | Threshold explícito, logs estruturados, decisão auditável |
| 6. Cuidadoso (psicodélicos) | Sub-score `safety` pesa 0.25 + contraindicações no prompt |
| 7. Plural | Multi-tradition tags, multiple sources from different epistemologies |
| 8. Acolhedor | Prompt instrui LLM a usar linguagem cuidadosa com temas sensíveis |

---

## 10. Operacional

### 10.1 Variáveis de ambiente

| Var | Obrigatória? | Descrição |
|---|---|---|
| `OPENAI_API_KEY` | Sim (se minimax não configurado) | Chave da OpenAI para o LLM scorer |
| `CRON_SECRET` | Sim (para cron route) | Bearer token do scheduler |
| `CURATION_MODEL` | Não | Override do modelo (default: `gpt-4o-mini`) |
| `CURATION_LEDGER_PATH` | Não | Caminho do JSONL fallback (default: `/tmp/cabaladoscaminhos-curation.jsonl`) |

### 10.2 Troubleshooting

| Sintoma | Causa provável | Fix |
|---|---|---|
| `No LLM client available` | OPENAI_API_KEY ausente + minimax module not configured | Configurar uma das duas |
| `401 unauthorized` no cron | CRON_SECRET errado | Conferir env var no scheduler |
| `429` em PubMed | Rate limit NCBI | Adicionar `&email=seu@email.com` na query (polite pool) |
| `0 fetched` em todas as fontes | API key pública expirada ou rede bloqueada | Conferir egress, testar curl manual |
| Muitos REJECT | Prompt muito rigoroso | Relaxar `REVIEW_THRESHOLD` para 0.3 |

### 10.3 Comandos úteis

```bash
# Validar tipos (deve passar)
pnpm tsc --noEmit

# Rodar manualmente
pnpm curate --source=pubmed-meditation

# Ver sources disponíveis
pnpm curate --list

# Trigger via curl (mesma lógica do cron)
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://cabala-dos-caminhos.com/api/cron/curate-articles
```

---

## 11. Histórico

- **W29 (esta wave):** Engine entregue + 7 fontes + cron route + CLI.
- **W12:** Akasha IA base (prompts, RAG, embeddings).
- **Próximo (W30+):** Embeddings + RAG indexing, dedup, dashboard admin.

---

**Mantido por:** Wave 29 — Coder + Iyá (Curator)
**Última atualização:** 2026-06-28