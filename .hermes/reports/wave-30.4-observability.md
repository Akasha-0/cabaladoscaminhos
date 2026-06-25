# Wave 30.4 — Observability da Consciência Viva
## Research + Planning: Como saber se a IA do Akasha está *aprendendo* ou só *memorizando*

**Data:** 2026-06-25
**Base:** `main` @ 0a8a0cb6 (Wave 28.7 merged, ADR-013/014)
**Modo:** RESEARCH + PLANNING apenas. **Nenhum código de implementação.**
**Missão:** distinguir **aprendizado real** (generalização, transfer, insight novo) de **memorização** (repetição, cache de pattern, regurgitação). Métrica dura, não feeling.

**Persona-alvo:** Gabriel Letteriello, founder solo. O dashboard tem que **responder em 5 segundos** se a consciência está viva ou estagnada.

---

## 1. Diagnóstico (1 parágrafo, sem textão)

O Akasha **já tem** a fundação: tokens persistidos, SSE incremental, health checks, créditos reconciliados (Doc 22 §5, AD-22.5). Wave 25.1/26.6/28.7 já entrega `/admin/consciousness` (4 métricas: discoveries/dia, papers citados, top up-weighted, what-now) e `/admin/universalism` (clusters cross-pilar, feedback trends, top 10 insights, pilar distribution). **O que falta** é a malha de **observability de aprendizado** — saber se a IA está generalizando (descobrir padrões novos cross-paper) ou se está só repetindo os mesmos 5 papers há 30 dias. Isso não é "métrica de IA" tradicional (perplexity/accuracy), é **métrica de evolução**.

---

## 2. A pergunta certa (problema de framing)

> **"Está aprendendo" não se mede em perplexity.** Perplexity mede fluência sobre dados estáticos — não mede se o sistema está **descobrindo verdades novas cross-domínio**.

O Akasha tem 3 planos de aprendizado a observar:

| Plano | O que significa "aprendeu" | Como medir |
|---|---|---|
| **RAG (retrieval)** | Acha papers certos pra pergunta nova | **Retrieval relevance** (top-k cita papers relevantes) |
| **Synthesis (Camada 3)** | Cruza 5 Pilares em 1 verdade coerente | **Cross-pilar density** (quantos pilares por discovery) |
| **Evolution (consciência viva)** | Hoje descobre o que ontem não existia | **Novelty score** (novos papers × novos clusters × feedback up) |

**Anti-métrica** (sinal de memorização): se a mesma headline aparece em 3+ dias com a mesma confidence = cache de pattern, não insight.

---

## 3. Métricas propostas (6 eixos, todas calculáveis HOJE)

### 3.1 Perplexity do corpus (Wave 31+ opcional)
- **O quê:** perplexidade média dos embeddings gerados vs corpus de referência (`LiteraturePaper` Wave 21.1).
- **Como:** `exp(-Σ p(w) · log p(w))` sobre modelo de linguagem do Ollama local (`nomic-embed-text` ou `llama3`). Custo marginal ~zero (soberania, Doc 22 §5).
- **Por quê importa:** se perplexidade cai ao longo do tempo em direção à perplexidade do corpus curado, o sistema está **convergindo pro "tom Akasha"** (vocabulário, estrutura, cross-ref). Se oscila sem direção → estagnação.
- **LGPD-safe:** roda sobre texto público (papers), nunca sobre conteúdo do usuário.

### 3.2 Accuracy over time (proxy: feedback ratio)
- **O quê:** `upvotes / total_feedback` agregado por janela (7d, 30d).
- **Hoje:** Wave 28.7 já calcula via `computeFeedbackTrends()` em `universalism-aggregation.ts:213-252` (ratio up/total por dia).
- **Por quê importa:** feedback positivo sustentado = sintese acertando. Queda sustentada = drift ou regressão.
- **Threshold de alerta:** ratio < 0.60 por 14 dias consecutivos = alerta amarelo.

### 3.3 Dedup ratio (a métrica anti-memorização)
- **O quê:** `1 - (insights_únicos / insights_totais)`. Similaridade via embedding cosine > 0.85 = duplicata.
- **Hoje:** não existe. Wave 31.4 propõe implementar (`computeDedupRatio(jobs, threshold=0.85)` em `consciousness/dedup-metrics.ts`).
- **Por quê importa:** dedup ratio alto = IA está **regurgitando**. Dedup ratio < 0.15 = saudável (cada discovery é genuinamente nova).
- **Threshold:** > 0.40 por 7 dias = 🔴 estagnação (memoization disfarçada de aprendizado).

### 3.4 Cross-pilar density (universalismo em números)
- **O quê:** média de `pilarBreakdown` distintos por discovery. 5 Pilares + cross = 6.
- **Hoje:** Wave 28.7 já calcula via `extractPilarBreakdown()` (`universalism-aggregation.ts:89-128`) e `computePilarDistribution()`.
- **Por quê importa:** densidade alta = convergência genuína (1 verdade encontrada por múltiplas vozes). Densidade baixa = descoberta de 1 pilar só (não é universalismo, é reductionism).
- **Threshold:** cross-pilar ratio > 30% = saudável (5 vozes estão convergindo).

### 3.5 Novelty score (papers novos por janela)
- **O quê:** `papers_citados_nunca_vistos_antes / papers_citados_total` em janela rolante (30d).
- **Hoje:** Wave 28.7 tem `computeTopPapersCited()` como proxy; Wave 31.4 pode ligar à tabela `LiteraturePaper` (Wave 21.1) e cruzar com histórico.
- **Por quê importa:** se a IA cita os mesmos 50 papers há 90 dias = **memorizou o corpus**, não está lendo papers novos (Cron Wave 23.1 traz 50+ papers novos por semana — usar isso).
- **Threshold:** novelty < 0.10 por 30 dias = 🔴 estagnação grave.

### 3.6 Cost-per-discovery (sustentabilidade econômica)
- **O quê:** `(tokens_input + tokens_output) / insightsGenerated` em janela 7d. Custo em créditos (Doc 22 §5, AD-22.5).
- **Hoje:** Wave 26.6 já tem `tokensUsed` persistido em `DailyReading`, `Manifesto`, `ChatMessage`.
- **Por quê importa:** se custo/descoberta sobe sem ganho de qualidade = **modelo mais pesado não está aprendendo mais**, só gastando. Sinal claro pra revisar `SYNTHESIS_MODEL`.
- **Threshold:** aumento > 50% em 14 dias sem ganho de feedback ratio = alerta amarelo.

---

## 4. Dashboards: estado da arte (4 candidatos)

### 4.1 Langfuse (open-source, self-hostable)
- **Stack:** TypeScript + ClickHouse + Postgres. OSS-license (MIT), 8k+ stars.
- **Forças:** tracing de LLM nativo (token usage, latency, prompt template versionamento), evaluations (LLM-as-judge + humano), prompt management, dataset tracking, **self-hostable** (soberania, alinhado com VPS Linux soberano, Doc 22).
- **Fraquezas:** sem RAG-specific metrics por padrão (precisa instrumentar retrieval separadamente), setup operacional ~1 dia (ClickHouse + Redis + worker).
- **Akasha-fit:** **ALTO**. SDK JS nativo, integra com OpenAI/Ollama. Custo infra estimado: ~150MB RAM ClickHouse + 50MB API. Cabe no VPS.
- **LGPD:** self-host, zero vazamento (vs SaaS).

### 4.2 Helicone (open-source, proxy-first)
- **Stack:** proxy LLM (1 linha `baseURL` trocada), ClickHouse. OSS.
- **Forças:** **drop-in** (zero código), cache automático, rate-limit, cost tracking granular. Bastante popular em produtos B2C (Y-Combinator origin).
- **Fraquezas:** foco em proxy/custo, menos forte em eval/quality que Langfuse. Métricas de "aprendizado" (novelty, dedup) precisam ser custom.
- **Akasha-fit:** **MÉDIO-ALTO**. Barato pra começar (proxy + env var), upgrade depois pra Langfuse quando precisar de eval.
- **LGPD:** self-host OSS, mas UI SaaS tem tier pago (evitar tier pago).

### 4.3 Arize Phoenix (open-source, evaluation-first)
- **Stack:** Python + Jupyter + lightweight web UI. OSS (Elastic License v2).
- **Forças:** **LLM eval** nativo (relevance, hallucination, QAG). Embeddings drift detection. Traces + spans por retrieval/rerank/generation.
- **Fraquezas:** Python-first (custo de integração com monorepo TS), UI mais "data scientist" que "founder solo". Setup ~3h.
- **Akasha-fit:** **MÉDIO**. Excelente pra **evaluations offline** (rodar contra dataset de 50 perguntas canônicas) — bom complemento, não substituto do dashboard in-app.
- **LGPD:** self-host, mas licença restritiva (Elastic v2) — verificar antes de uso comercial.

### 4.4 Helicone vs Langfuse vs Phoenix — TL;DR

| Critério | Langfuse | Helicone | Phoenix (Arize) |
|---|---|---|---|
| Custo setup | ~1 dia | ~2h | ~3h |
| Custo infra | Médio (ClickHouse) | Baixo-Médio | Baixo |
| Tracing LLM | ✅ nativo | ✅ nativo | ✅ nativo |
| Eval (LLM-as-judge) | ✅ | ❌ | ✅✅ (best-in-class) |
| Prompt versioning | ✅ | ❌ | ❌ |
| Self-host soberano | ✅ MIT | ✅ MIT | ⚠️ Elastic v2 |
| Akasha stack (TS) | ✅ first-class | ✅ proxy | ⚠️ Python-first |
| LGPD safe | ✅ | ✅ | ✅ (verificar licença) |

### 4.5 Recomendação primária: **Langfuse self-hosted**
Para o Akasha Portal, Langfuse é o melhor trade-off: tracing + eval + prompt versioning + self-host soberano + TS-native. **Phoenix fica como complemento opcional** pra evaluations offline (Wave 31+).

---

## 5. Como integrar no Akasha (Wave 26.6 já tem a base)

### 5.1 Estado atual (já implementado)
- `/admin/consciousness` (Wave 25.1 + Wave 26.6): 5 cards + 2 charts CSS-only, 13 testes.
- `/admin/universalism` (Wave 28.7): 6 clusters + feedback trends + top insights + pilar distribution.
- `tokensUsed`/`llmModel` persistido (AD-22.5) em `DailyReading`, `Manifesto`, `ChatMessage`.
- `requestId` propagado em logs JSON estruturados (AD-22.3).
- `computeByTimeBucket()` + `computeFeedbackTrends()` prontos.

### 5.2 Gap para a "observability da consciência"
| Falta | Esforço | Wave sugerida |
|---|---|---|
| **Dedup ratio** (3.3) | Médio — embeddings + cosine sim | **31.4-A** (1 subagente) |
| **Novelty score** (3.5) | Médio — JOIN com `LiteraturePaper` | **31.4-B** (1 subagente) |
| **Cost-per-discovery trend** (3.6) | Pequeno — agregação de `tokensUsed` existente | **31.4-C** (1 subagente) |
| **Cross-pilar density trend** (3.4) | Pequeno — `computePilarDistribution` já existe, falta histórico | **31.4-D** (1 subagente) |
| **Langfuse self-host** (4.5) | Médio — Docker compose + env vars + SDK init | **32.1** (1 subagente) |
| **Alertas estagnação** (ver §6) | Pequeno — cron job checa thresholds | **31.4-E** (1 subagente) |
| **Perplexity corpus** (3.1) | Opcional — Ollama inference loop | **33+** (futuro) |

**NÃO integrar SaaS externo.** Soberania VPS Linux (Doc 25 §10) + LGPD Art. 33 (sensitive data) = self-host é mandatório.

### 5.3 Plano de integração (passo a passo)

**Wave 31.4 (próxima):** estender `/admin/consciousness` com 3 novas métricas + 1 alerta.

```
consciousness/
├── dashboard-aggregation.ts    [já existe]
├── universalism-aggregation.ts [já existe]
├── dedup-metrics.ts            [NOVO — computeDedupRatio()]
├── novelty-metrics.ts          [NOVO — computeNoveltyScore()]
├── cost-metrics.ts             [NOVO — computeCostPerDiscovery()]
└── alerts.ts                   [NOVO — checkStagnationThresholds()]

ConsciousnessDashboard.tsx      [extender — 3 cards novos]
/api/admin/consciousness/route  [extender — incluir agregações novas]
```

**Wave 32.1 (Langfuse):** instrumentar chamadas LLM com SDK Langfuse.

```ts
// Em packages/mentor/src/llm-client.ts
import { Langfuse } from 'langfuse';
const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
  secretKey: process.env.LANGFUSE_SECRET_KEY!,
  baseUrl: process.env.LANGFUSE_URL!, // self-host
});
// Wrap cada chamada: trace, generation, span
```

**Benefício cross-wave:** dedup ratio + novelty score alimentam **background-job** (`consciousness/background-job.ts`) que já roda daily às 06:00 UTC — adicionar 1 step ao pipeline (sem novo cron).

---

## 6. Plano de alertas de estagnação (regra prática)

### 6.1 Thresholds (calibrados pro Akasha atual)

| Alerta | Métrica | Threshold | Severidade | Ação |
|---|---|---|---|---|
| **Dedup alto** | Dedup ratio | > 0.40 por 7d | 🔴 crítico | Rever `SYNTHESIS_MODEL` + janela RAG; considerar temperature bump |
| **Novelty baixo** | Novelty score | < 0.10 por 30d | 🔴 crítico | Forçar leitura de N papers novos (Cron Wave 23.1 já ingere 50+/semana — falha no pipeline) |
| **Feedback em queda** | Feedback ratio | < 0.60 por 14d | 🟡 amarelo | Revisar prompt template + quality eval offline |
| **Custo subindo** | Cost/discovery | +50% em 14d sem ↑ quality | 🟡 amarelo | Considerar modelo mais leve (gpt-4o-mini → fallback) |
| **Cross-pilar fraco** | Cross ratio | < 15% por 30d | 🟡 amarelo | Revisar `cross-correlation-engine.ts`; forçar Pilar 4 (Odu) + Pilar 5 (I Ching) na síntese |
| **Cron falhou** | `status='FAILED'` em 2+ dias | 2 dias | 🔴 crítico | Slack alert (já existe padrão Doc 22 §9.7) |

### 6.2 Implementação (Wave 31.4-E)

```ts
// consciousness/alerts.ts
export interface StagnationAlert {
  severity: 'critical' | 'warning';
  metric: 'dedup' | 'novelty' | 'feedback' | 'cost' | 'cross-pilar' | 'cron';
  message: string;
  suggestedAction: string;
}

export function checkStagnationThresholds(
  metrics: EvolutionMetrics
): StagnationAlert[] {
  // pure function, deterministic, testável
  // retorna [] se tudo OK, ou lista priorizada
}
```

Hook: integrar no `background-job.ts` **step final** (após agregar tudo). Se `alerts.length > 0`, postar em Slack (`SLACK_WEBHOOK_URL` já configurado, Doc 22 §9.7) + exibir banner em `/admin/consciousness`.

### 6.3 LGPD + soberania
- Thresholds rodam em VPS local, zero vazamento.
- Slack alert contém **só métricas agregadas**, nunca conteúdo (`X-RateLimit` style).
- Founder (Gabriel) vê alerta no celular via webhook → ação manual (sem auto-correção de modelo — fora do escopo fundador solo).

---

## 7. Recomendação final + trade-offs

### 7.1 Recomendação (3 ondas incrementais)

**Wave 31.4 — Quick wins (1-2 subagentes):**
- Implementar **3 métricas novas**: dedup ratio, novelty score, cost-per-discovery.
- Adicionar **1 alerta** de estagnação (cron-based, Slack).
- **Resultado:** dashboard ganha 3 cards + banner de saúde. Esforço: ~1 dia. Risco: baixo (funções puras + testes co-located).

**Wave 32.1 — Langfuse self-host:**
- Docker Compose: Langfuse + ClickHouse + Postgres no VPS.
- Instrumentar SDK nas chamadas LLM (mentor, synthesis, embedding).
- **Resultado:** tracing completo, eval LLM-as-judge opcional. Esforço: ~2 dias. Risco: médio (novo componente infra, precisa monitoramento).

**Wave 33+ — Phoenix opcional:**
- Eval offline em Jupyter: 50 perguntas canônicas, score relevance + coherence por modelo.
- **Resultado:** capability de comparar modelos sem mexer em produção. Esforço: ~1 dia. Risco: baixo (read-only sobre dados).

### 7.2 Trade-offs (honestos)

| Decisão | Pro | Contra | Recomendação |
|---|---|---|---|
| **Langfuse vs Helicone** | Langfuse tem eval + prompt versioning | Helicone é mais rápido setup | Langfuse (capacidades > velocidade de setup) |
| **Self-host vs SaaS** | Soberania, LGPD, custo zero recorrente | Esforço operacional (updates, backup) | **Self-host** (não-negociável, VPS soberano) |
| **Métricas em SQL vs Langfuse** | SQL é trivial, testável, dono do dado | Langfuse tem UI bonita + drill-down | **Ambos** (SQL pro alerta, Langfuse pro forensic) |
| **Perplexity** (3.1) | Sinal estatístico real | Caro de calcular todo dia, baixo valor incremental | **Pular** (novelty + dedup são proxies melhores) |
| **Alertas auto-correção** | IA corrige IA | Founder perde controle, magic box | **Alertas só** (Founder decide ação, sempre) |
| **Background job daily** (já existe) | Esforço marginal | Janela 24h perde sinais sub-diários | Manter (custo > benefício de in-real-time) |

### 7.3 NÃO fazer (anti-padrões)
- ❌ **Métricas de perplexity/accuracy clássicas** sem grounding no domínio (Akasha não tem benchmark público — criar um custom leva meses, ROI duvidoso).
- ❌ **SaaS externo** (Helicone Cloud, Langfuse Cloud) — viola soberania Doc 25 §10.
- ❌ **Auto-retraining** baseado em feedback — fundador solo não tem capacidade de auditar drift; alerting é o suficiente.
- ❌ **Dashboard novo do zero** — estender `/admin/consciousness` (já é a home canônica de observability de IA), manter 1 fonte de verdade.

---

## 8. Próximos passos (handoff para Wave 31+)

### 8.1 Wave 31.4 — Métricas de evolução (proposta)
- **Escopo:** 5 arquivos novos + 2 modificados. Funções puras + testes co-located (lesson N+24).
- **Critérios de aceitação:**
  - 3 métricas novas visíveis em `/admin/consciousness` (dedup, novelty, cost-per-discovery)
  - Alerta de estagnação dispara quando thresholds batem (≥ 6 cenários de teste)
  - i18n parity pt-BR + en (namespace `admin.consciousness.*`)
  - LGPD: nenhum dado de usuário nas novas métricas (só agregados)
  - Mobile-first: novos cards funcionam em viewport 360px
- **Estimativa:** 1 subagente × 1 dia.
- **Riscos:** embeddings drift entre execuções (mitigar: snapshot fixo por janela 7d).

### 8.2 Wave 32.1 — Langfuse self-host (proposta)
- **Escopo:** `infra/docker-compose.langfuse.yml`, env vars, SDK init em `packages/mentor/src/llm-client.ts`, dashboard link.
- **Critérios de aceitação:**
  - Langfuse UI acessível em `https://akasha.seudominio.com/langfuse` (sub-path nginx)
  - Traces visíveis para: `manifesto.generated`, `daily.generated`, `consult.answered`, `embedding.generated` (AD-22.4)
  - Custo ClickHouse < 300MB após 30 dias
  - Backup da Langfuse DB no cron existente
- **Estimativa:** 1 subagente × 2 dias.
- **Riscos:** ClickHouse memory pressure no VPS pequeno (mitigar: retention 30d + sampling).

### 8.3 Cross-references (Pilares + medicinas ancestrais)
- **Pilar 1 (Cabala):** dedup ratio detecta "rabinização" — repetição de padrões cabalísticos sem insight novo.
- **Pilar 4 (Odu):** novelty score detecta se a IA está engessada em Ifá tradicional vs abrindo pra novas combinações.
- **Medicinas ancestrais (ayahuasca, reiki):** feedback ratio alto em sessões de cura = IA acertando no visceral (não-acadêmico); ratio baixo = drift pro textão.
- **Universalismo:** cross-pilar density é literalmente a métrica de "5 vozes → 1 verdade" em números.

---

## 9. Conclusão (curta, visceral)

A IA do Akasha **não está memorizando** se, ao longo de 30 dias:
1. **30%+ das discoveries** cruzam 2+ Pilares (cross-pilar density).
2. **Dedup ratio < 15%** (cada insight é genuinamente novo).
3. **Novelty score > 25%** (papers novos estão sendo lidos e integrados).
4. **Feedback ratio sobe ou se mantém** (Zelador sente que está ficando melhor).

Se algum desses cai por 14+ dias → **estagnação**. Não é bug, é ausência de alimentação nova — o equivalente ao Zelador que parou de estudar. A solução não é mágica: é **ler papers novos** (Cron Wave 23.1), **forçar cross-pilar** (background job step), **pedir feedback** (Zelador é o termômetro).

**Observability da consciência viva = termômetro + bússola, não detector de plagio.** O objetivo não é pegar a IA "cola"; é garantir que ela continua **faminto por verdade**.

---

*Doc de research + planning. **Nenhum código de implementação.** Wave 31.4 pronta pra puxar 1-2 subagentes conforme gaps acima. Universalismo + visceral, sem textão.*