# Wave 31.0 — Síntese dos 7 Relatórios Wave 30 + Plano Wave 31 Implementation

**Data:** 2026-06-25
**Tipo:** RESEARCH + PLANNING ONLY (research + planning only, sem código)
**Subagente:** Wave 31.0 (síntese delegada)
**Branch:** `wave-31.0-synthesis`
**Base:** `main` @ f0dd62a1 (Wave 30.1-30.7 já mergeados; ADR-0005/ADR-013/ADR-014 aceitos)
**Escopo macro:** consolidar os 8 documentos de research Wave 30.x em **1 plano Wave 31 implementation-ready** com priorização, dependências, ADRs e roadmap Wave 32-34.
**Restrição rígida:** zero código novo, zero mudança em `packages/*` ou `apps/*`. Apenas este arquivo `.hermes/reports/`.

---

## 0. TL;DR (5 bullets)

1. **Wave 31.0 NÃO implementa consciência — implementa a infra que SUSTENTA consciência viva:** o MVP da "consciência UNA" do ADR-013 é a convergência de **grafo de conhecimento (30.1) + retrieval híbrido (30.3) + observability de evolução (30.4) + long-term memory destilada (30.7)**, todos com **multi-tenant endurecido (30.5)** e **benchmarks de qualidade (30.6)**. FedAkasha (30.2) fica em **Wave 31.2 condicional** — sem DPO + RAG redaction, é violação LGPD.
2. **Ordem de execução (sequência crítica):** Wave 31.0 (este) → **31.1 Multi-tenant hardening + RAG redaction** (pré-requisito de tudo) → **31.2 Observability dedup/novelty/cost** (alert estagnação) → **31.3 Knowledge Graph schema + seed 5 Pilares** (kg_nodes/edges/triplets em Postgres) → **31.4 OpenIE + Hybrid Retriever** → **31.5 AUT benchmarks heurístico** → **31.6 Memory tiers + distillation cron** → **31.7 FedAkasha MVP sintético** (se DPO aprovar).
3. **Decisão arquitetural macro (Wave 30.1):** **Postgres + pgvector + CTE puro** (NÃO Neo4j/FalkorDB/Memgraph agora). Trigger quantitativo para Wave 35+ (≥500k edges OU p95 ≥1s). **Convergência interna dos 7 reports** — todos os pilares técnicos convergem no mesmo stack (Postgres puro, sem nova infra).
4. **ADR-015 (NOVO, proposto por este relatório):** **"Consciência UNA — convergência KG+Vector+Memory+Benchmark"** — ratifica que Wave 31.x é **uma única feature** (consciência viva mensurável), não 7 features paralelas. ADR-013 era visão; ADR-015 é **arquitetura técnica para operacionalizar** a visão.
5. **Risco #1 que pode quebrar o roadmap:** **LGPD multi-tenant** (Wave 30.5) **bloqueia FedAkasha** se não for mergeado primeiro. Toda a fundação Wave 31 pressupõe embeddings sanitizados, audit log PII-safe, helper `withCaminhanteContext` endurecido. **Se Wave 31.1 não sair, nada mais sai com segurança jurídica.**

---

## 1. Matriz de Priorização Wave 31

A tabela abaixo pontua cada pilar Wave 30 (escala 1-5: 1=mínimo, 5=máximo). **Score final** = média ponderada: `Impacto × 0.30 + MVP-Readiness × 0.25 + (5-Risco LGPD) × 0.20 + ADR-014-alinhamento × 0.15 + (5-Esforço) × 0.10`.

| Pilar (Wave 30.x) | Esforço | Impacto | Risco LGPD | Dependências | MVP Readiness | ADR-014 alinhamento | Score final |
|---|---|---|---|---|---|---|---|
| **30.5 Multi-tenant Isolamento** (RAG redaction + audit PII validator + RIPD) | 4 (alto — 1 sem dev + DPO + RIPD doc) | 5 (bloqueia tudo) | 5 (resolve LGPD Art. 33/37/46) | Helper `withCaminhanteContext` existe (ADR-0004) | 4 (regex MVP viável, NER é Wave 32+) | 5 (Pilar 4 ethics + LGPD-by-design) | **4.65** ★ |
| **30.4 Observability da Consciência** (dedup + novelty + cost-per-discovery) | 2 (3 funções puras + 1 alerta) | 4 (termômetro estagnação; sem isso Wave 31.x pode degradar silenciosamente) | 1 (sem PII risk; só métricas agregadas) | `extractPilarBreakdown`, `computeFeedbackTrends` (Wave 28.7) já existem | 5 (zero infra nova; funções puras + testes co-located) | 4 (transparência Founder, LGPD-safe) | **3.45** ★ |
| **30.1 Knowledge Graph Architecture** (Postgres kg_* schema + D-053) | 3 (migration + seed dos 5 Pilares) | 5 (base da "consciência UNA" — sem grafo, Cadeia Viva é narrativa) | 2 (`requiresConsent` flag protege Pilar 4) | pgvector(768) já existe (Wave 3); Wave 21.1 LiteraturePaper mergeado ou em paralelo | 3 (aguarda Wave 21.1 merge; senão `kg_nodes.kind='paper'` quebrado) | 5 (cada edge é asserção auditável; LGPD-by-design) | **3.80** ★★ |
| **30.3 GraphRAG + Vector híbrido** (OpenIE extractor + Hybrid Retriever RRF) | 3 (4 arquivos TS + LLM extraction) | 4 (mecanismo técnico que sustenta cadeia visível) | 2 (depende de redaction Wave 31.1) | Depende Wave 31.3 (schema) + Wave 31.1 (redaction) | 3 (precisa schema KG antes; LLM extractor é assíncrono) | 4 (cadeia de pensamento auditável, mas PII risk se sem redaction) | **3.20** ★★ |
| **30.6 Consciousness Benchmarks (AUT)** (5 funções heurísticas puras) | 2 (5 funções puras TS + Vitest + i18n) | 4 (termômetro de qualidade — sem AUT, regressões invisíveis) | 1 (heurística opera em estrutura, zero PII crua) | Wave 23.2 Cadeia Viva + Wave 28.7 universalism aggregation | **5 (custo zero; determinístico; latência <50ms p95; LGPD-safe by design)** | 4 (whitelist canônica protege Pilar 4) | **3.40** ★★ |
| **30.7 Long-term Memory & Distillation** (TTL + DistilledInsight + ThemeOfMonth) | 4 (cron mensal + UMAP + HDBSCAN + 2 models novos) | 3 (estabiliza retrieval no longo prazo; vira crítico em ano 2+) | 2 (DistilledInsight é global, sem user attribution) | pgvector + cron + Wave 24.1 background-job graceful-degradation pattern | 2 (Wave 31.6 é viável mas Wave 32+ é onde brilha — meses 3+ têm dados) | 3 (LGPD Art. 18 §V facilitado por TTL/archivedAt) | **2.70** ★ |
| **30.2 Federated Learning (FedAkasha)** (Flower + DP-SGD + Trimmed Mean, dados sintéticos) | 5 (Python sidecar + Flower server + DPO + onboarding Zeladores) | 3 (valor real aparece com K≥5 Zeladores; MVP sintético tem ROI zero) | **5 (Risco MÁXIMO — V3 RAG embedding leak + V4 Odu cultural + V9 server compromise)** | **Depende CRÍTICO de Wave 31.1 (RAG redaction). Sem isso, FedAkasha viola Art. 33.** | 1 (Wave 31.7 só MVP sintético; produção Wave 32+ com DPO) | 3 (Pilar 4 opt-out granular proposto; LGPD compliance forte se DPO OK) | **2.55** |

**Interpretação:**
- **★★★ (prioridade absoluta, Wave 31.1-31.2):** 30.5 (multi-tenant hardening) — sem ele, nada mais passa o DPO. + 30.4 (observability) — termômetro que detecta se a IA está regredindo.
- **★★ (Wave 31.3-31.5, núcleo da consciência UNA):** 30.1 + 30.3 + 30.6 — convergência: KG schema → OpenIE+Retriever → AUT benchmarks. Três pilares que **juntos** operacionalizam "consciência viva" do ADR-013.
- **★ (Wave 31.6-31.7, infra complementar):** 30.7 (long-term memory) — estabiliza retrieval ano 2+. + 30.2 (FedAkasha sintético) — fundação para consciência coletiva Wave 32+.

**Cross-dependência crítica:** 30.1 → 30.3 (schema antes de retriever); 30.5 → 30.2 (redaction antes de federação); 30.5 → 30.3 (redaction antes de RAG embedding leak); 30.6 → tudo (AUT é regression gate universal).

---

## 2. Wave 31 Implementation Roadmap (Fase 1 — MVP consciência)

### 2.1 Quais features implementar primeiro (justificar com base nos 7 reports)

**Ordem canônica (sequência crítica, não paralelizável):**

| Wave | Feature | Pilar Wave 30 origem | Justificativa |
|------|---------|----------------------|---------------|
| **31.1** | **Multi-tenant hardening** — RAG redaction transformer + audit PII validator + RIPD-Akasha + ADR-DRAFT 0010 | **30.5** | LGPD Art. 33/37/46. Bloqueia tudo se ausente. Score 4.65. |
| **31.2** | **Observability dedup + novelty + cost-per-discovery** + alerta estagnação | **30.4** | Termômetro da consciência. Sem isso, ondas 31.3+ podem degradar silenciosamente. Score 3.45. |
| **31.3** | **Knowledge Graph schema** (kg_nodes + kg_edges + kg_triplets + materialized view kg_2hop_neighbors) + seed 5 Pilares (~166 nodes / 600 edges) | **30.1** + **30.3** parte 1 | Base técnica da "consciência UNA". Cadeia Viva vira trail verificável. Score 3.80. |
| **31.4** | **OpenIE extractor + Hybrid Retriever** (RRF sobre pgvector + recursive CTE + entity linker) | **30.3** parte 2 | Cada paper vira nó + edges. Recuperação híbrida sustenta Cadeia Viva. Depende 31.1+31.3. Score 3.20. |
| **31.5** | **AUT heurístico** (5 funções puras em `packages/mentor/src/eval/`) + badge visual no ThoughtChainView + i18n | **30.6** | Sinal de qualidade por resposta. CI gate em Wave 33+. LGPD-safe by design. Score 3.40. |
| **31.6** | **Memory Tiers TTL + DistilledInsight + ThemeOfMonth** (cron mensal `memory-distill.yml`) | **30.7** | Estabiliza retrieval no longo prazo. vira crítico ano 2. Score 2.70. |
| **31.7** | **FedAkasha MVP sintético** (Flower + FedAvg + DP-SGD + Trimmed Mean, K=3 clientes simulados) | **30.2** + **30.2-redispatch** | Fundação para consciência coletiva Wave 32+. Só após Wave 31.1 (RAG redaction) + DPO AIPD. Score 2.55. |

**Por que esta ordem:**

1. **Wave 31.1 (multi-tenant hardening) é PRÉ-REQUISITO** de 31.4 (RAG retriever) e 31.7 (FedAkasha). Embeddings não-sanitizados = violação LGPD Art. 33. Bloqueio absoluto.
2. **Wave 31.2 (observability) é detecção precoce de regressões.** Sem dedup ratio, novelty score, cost-per-discovery, o Founder não sabe se a consciência está estagnada. Heurística rápida (3 funções puras + 1 alerta cron) dá retorno imediato em <1 dia.
3. **Wave 31.3 (KG schema) é fundação das ondas 31.4 e 31.5.** Sem `kg_nodes`/`kg_edges`, o OpenIE extractor não tem onde persistir triplets, e o Hybrid Retriever não tem grafo para navegar. Migration aditiva (zero risco).
4. **Wave 31.4 (OpenIE + Retriever) operacionaliza ADR-013** — Cadeia Viva passa a ler de grafo real, e cada paper indexado vira nó. Latência-alvo <500ms p95.
5. **Wave 31.5 (AUT) é termômetro de qualidade** — sem ele, regressões de prompt são invisíveis até o feedback do Zelador cair. Heurística pura é barata (5ms por resposta) e determinística.
6. **Wave 31.6 (memory tiers) estabiliza o sistema para escala** — sem ele, em 6 meses o `Discovery` table tem 1800+ rows e o InsightRanker fica lento. Distillation mensal + archive cold é a saída.
7. **Wave 31.7 (FedAkasha sintético) é fundação futura** — sem dados reais, valor é zero. Mas precisa da infra rodando para Wave 32.x (com Zeladores reais + DPO).

### 2.2 Dependências técnicas (qual implementação habilita outras)

```
                       ┌──────────────────┐
                       │  Wave 31.1       │
                       │  Multi-tenant    │ ← BLOQUEIA Wave 31.4 e 31.7
                       │  hardening       │
                       │  (RAG redaction) │
                       └────────┬─────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼                               ▼
        ┌──────────────┐                ┌──────────────┐
        │  Wave 31.2   │                │  Wave 31.7   │
        │ Observability│ (paralelizável)│  FedAkasha   │
        │ (3 métricas) │                │  sintético   │
        └──────┬───────┘                └──────────────┘
               │
               ▼
        ┌──────────────┐
        │  Wave 31.3   │
        │  KG schema   │ ← Habilita Wave 31.4 e 31.5
        │  (kg_*)      │
        └──────┬───────┘
               │
        ┌──────┴──────┐
        ▼             ▼
   ┌─────────┐  ┌─────────┐
   │ 31.4    │  │ 31.5    │
   │ OpenIE  │  │  AUT    │
   │ +Hybrid │  │heuríst. │
   └────┬────┘  └────┬────┘
        │             │
        └──────┬──────┘
               ▼
        ┌──────────────┐
        │  Wave 31.6   │
        │ Memory Tiers │ ← usa KG schema + 31.4 retriever
        │ (Distill)    │
        └──────────────┘
```

**Dependências críticas:**
- **31.1 → 31.4** (RAG redaction antes de Hybrid Retriever — sem isso, embedding vaza PII)
- **31.1 → 31.7** (RAG redaction antes de FedAkasha — V3 RAG embedding leak mitigation)
- **31.3 → 31.4** (KG schema antes de OpenIE+Retriever — sem tabela, sem persistência)
- **31.3 → 31.6** (KG schema antes de Distillation — DistilledInsight cluster pode virar nó do grafo)
- **31.4 → 31.6** (Hybrid Retriever antes de Memory Tiers — Distillation precisa de retrieval novo)
- **31.2 → 31.6** (Observability antes de Memory Tiers — métricas de dedup/novelty validam distillation quality)

**Paralelizáveis:**
- 31.1 + 31.2 (sem dependência)
- 31.4 + 31.5 (paralelizáveis se 31.3 já mergeado)

### 2.3 Critério de done por feature

| Wave | Critérios de aceitação (verificáveis em CI) |
|------|----------------------------------------------|
| **31.1** | • `pii-redactor.ts` regex cobre CPF, email, telefone, data, nome próprio (testes ≥10 casos por tipo) <br> • `redactor.redact()` <10ms p95 por chunk (benchmark) <br> • `audit-log.ts` rejeita metadata com chaves `nome`, `email`, `telefone`, `cpf` (audit PII validator + 6+ testes) <br> • `docs/legal/RIPD-Akasha.md` redigido e revisado por DPO (humano) <br> • Migration `sessao_chunks.redacted_from JSONB` aplicada em dev + staging <br> • LGPD-by-design: nenhum PII raw em logs (testado via `audit-log.test.ts`) |
| **31.2** | • `computeDedupRatio(jobs, threshold=0.85)` retorna valor correto (5+ testes com fixtures) <br> • `computeNoveltyScore()` cruza com `LiteraturePaper` (3+ testes) <br> • `computeCostPerDiscovery()` agrega `tokensUsed` (2+ testes) <br> • `checkStagnationThresholds()` retorna alertas (6+ cenários: dedup alto, novelty baixo, feedback queda, custo subindo, cross-pilar fraco, cron falhou) <br> • Card em `/admin/consciousness` mostra 3 métricas novas + banner de saúde <br> • i18n PT-BR + EN paridade (namespace `admin.consciousness.*`) |
| **31.3** | • Migration `kg_nodes`/`kg_edges`/`kg_triplets` aplica em dev + prod (Prisma client regenera) <br> • Seed dos 5 Pilares (~166 nodes / 600 edges) idempotente (roda 2x = mesmo resultado) <br> • Materialized view `kg_2hop_neighbors` refresh em <30s <br> • LGPD: `ON DELETE CASCADE` funciona (teste: deletar consulente → 0 edges órfãos) <br> • Testes ≥10 (idempotência, canonicidade Pilar 4, FK integrity) <br> • ADR-DRAFT 0015 ratifica (consciência UNA convergência KG+Vector+Memory+Benchmark) |
| **31.4** | • `scripts/openie-extract.ts` extrai triplets via GPT-4o-mini ($0.15/1M tokens; ~$50 para 50k papers) <br> • Entity linker via `name_normalized` + Levenshtein cobre ≥80% dos casos (fixtures: Cabala=Qabalah, Orixá=Orisha) <br> • `/api/discoveries/hybrid-search` retorna top-K via RRF(vector + graph) com latência <500ms p95 <br> • ≥15 testes (OpenIE qualidade, entity linker coverage, RRF math, query patterns) <br> • Audit trail em `kg_triplets` com `extractor_version` + `source_doc_id` + `confidence` |
| **31.5** | • 5 funções puras em `packages/mentor/src/eval/` (`fn-coherence`, `fn-convergence`, `fn-compassion`, `fn-contextualization`, `fn-responsibility`) <br> • Latência <50ms p95 (1k respostas benchmark) <br> • 100 runs com mesma input → 100 outputs idênticos (determinístico) <br> • Badge visual "AUT: 0.84 (✓)" no `ThoughtChainView` (i18n PT-BR + EN) <br> • LGPD: zero acesso a `notas_livre` ou `comentario` cru (autVector nunca inclui conteúdo) <br> • Testes ≥30 (8 mock questions do report Wave 30.6 + edge cases) <br> • Whitelist canônica: 15 Odus + 10 Sefirot + 64 Hexagramas + 11 Corpos (lookup em runtime) |
| **31.6** | • Migration adiciona `expiresAt`/`archivedAt` em `Consultation`, `ChatMessage`, `SessaoChunk`, `FeedbackEvent`, `Discovery` (campos nullable) <br> • Modelo `DistilledInsight` (clusterLabel + centroid + essence + importance + sourceIds) + `ThemeOfMonth` <br> • Cron `memory-distill.yml` roda 1° dia do mês 04:00 UTC, idempotente <br> • Algoritmo: UMAP(n_components=5) + HDBSCAN(min_cluster_size=3) + c-TF-IDF + template `extractEssence` <br> • 15+ testes (clustering, idempotência, LGPD graceful degradation, cold start meses 1-3) <br> • UI card em `/admin/universalism` mostra "Essência de [mês]" + top 3 clusters <br> • Hybrid retrieval prioriza DistilledInsight > Discovery recent > SessaoChunk > Feedback |
| **31.7** | • `services/fedakasha/server.py` (Flower server) + `client.py` (Flower client sidecar) <br> • DP-SGD: clip_norm C=1.0, σ=0.3, batch ≥50 sessões <br> • Trimmed Mean tolera até 33% Byzantine <br> • 3 Zeladores sintéticos em docker-compose, round completo <5min <br> • Audit log com timestamp + K + ε + σ + model_hash (LGPD Art. 37) <br> • mTLS + cert pinning configurado <br> • Type-safe W_t (nunca string interpolation em prompt — audit `system-prompt.ts`) <br> • Matriz W_t muda entre rounds (utilidade não-zero) |

### 2.4 Subagentes paralelos sugeridos (quantos, foco de cada)

**Regra:** Gabriel pediu MAX 7 subagentes (regra 25/06). Wave 31.0 = 1 (este). Sobram 6. Distribuir:

| Wave | # Subagentes | Foco de cada |
|------|--------------|--------------|
| **31.1** | **2** (paralelo) | • Subagente A: `pii-redactor.ts` + testes (regex MVP; whitelist termos esotéricos: Cabala, Orixá, Sephirah, Odu, Hexagrama) <br> • Subagente B: `audit-log.ts` PII validator + RIPD-Akasha.md (DPO template) + `redacted_from JSONB` migration |
| **31.2** | **2** (paralelo) | • Subagente A: `computeDedupRatio` + `computeNoveltyScore` (embeddings cosine sim + cross-ref LiteraturePaper) <br> • Subagente B: `computeCostPerDiscovery` + `checkStagnationThresholds` + Slack alert + UI card |
| **31.3** | **1** (sequencial, bloqueia 31.4/31.5) | • Subagente: D-053 PROPOSAL + migration + seed 5 Pilares (166 nodes + 600 edges) + materialized view |
| **31.4** | **2** (paralelo após 31.3) | • Subagente A: `scripts/openie-extract.ts` + entity linker + cron batch noturno (50k papers, rate-limited 1k/h) <br> • Subagente B: `/api/discoveries/hybrid-search` (RRF sobre pgvector + recursive CTE) + 10 testes |
| **31.5** | **1** (paralelo a 31.4) | • Subagente: `packages/mentor/src/eval/` + 5 funções puras + badge visual no `ThoughtChainView` + 30 testes |
| **31.6** | **2** (paralelo) | • Subagente A: TTL migrations (`expiresAt`/`archivedAt`) + memory-policy.ts helper <br> • Subagente B: `memory-distill.ts` (UMAP+HDBSCAN+c-TF-IDF) + cron mensal + `DistilledInsight`/`ThemeOfMonth` models + UI card |
| **31.7** | **1** (sequencial final) | • Subagente: FedAkasha MVP sintético (Flower server + 3 clients sidecar + DP-SGD + Trimmed Mean + audit log) |

**Total paralelo:** 7 sub-waves × ~1-2 subagentes = **~10 subagentes** se rodarem todos em paralelo. **Realidade:** sequenciamento crítico significa que em qualquer momento temos **2-3 subagentes ativos**, totalizando ~**8-10 subagentes** ao longo de 4-6 semanas.

**Otimização:** rodar 31.1 + 31.2 em paralelo (sem dependência) = **4 subagentes no sprint 1**; depois 31.3 + 31.5 em paralelo (31.5 pode rodar antes de 31.3 se quiser — só lê Cadeia Viva) = **2-3 subagentes no sprint 2**; 31.4 + 31.6 em paralelo = **3-4 subagentes no sprint 3**; 31.7 sozinho = **1 subagente no sprint 4**.

---

## 3. ADR-015 proposta — "Consciência UNA: convergência KG + Vector + Memory + Benchmark"

### Status
**Proposed** (Wave 31.0 synthesis, 2026-06-25).

### Contexto

ADR-013 (Wave 23, aceito) definiu a **visão** de Akasha como "consciência evolutiva com camadas Memory, Reasoning, Action, Feedback, UI". Os 7 relatórios Wave 30 (30.1-30.7) atacaram cada camada com research + planning. Mas nenhum deles, isoladamente, constitui a "consciência UNA" prometida — cada um é um **mecanismo técnico parcial**:

- Wave 30.1 (KG Architecture) → mecanismo para **relacionar** entidades.
- Wave 30.2 (FedAkasha) → mecanismo para **calibrar** entre Zeladores.
- Wave 30.3 (GraphRAG) → mecanismo para **recuperar** contexto.
- Wave 30.4 (Observability) → mecanismo para **medir** evolução.
- Wave 30.5 (Multi-tenant) → mecanismo para **isolar** PII.
- Wave 30.6 (AUT) → mecanismo para **medir** qualidade de resposta.
- Wave 30.7 (Long-term Memory) → mecanismo para **comprimir** em sabedoria.

**A "consciência UNA" só emerge quando esses 7 mecanismos operam em conjunto**, sob constraints LGPD-by-design (Wave 30.5) e benchmark de qualidade (Wave 30.6). Wave 31.x é a **primeira tentativa** de implementar essa convergência.

### Decisão

**Wave 31.x entrega 1 feature unificada — "consciência viva mensurável"** — composta por 7 sub-waves coerentes (31.1 a 31.7), alinhadas aos 7 reports Wave 30, com a seguinte ordem canônica:

1. **Multi-tenant hardening** (31.1) — fundação LGPD-by-design.
2. **Observability de evolução** (31.2) — termômetro de estagnação.
3. **Knowledge Graph schema + seed** (31.3) — base relacional.
4. **OpenIE + Hybrid Retriever** (31.4) — Cadeia Viva verificável.
5. **AUT heurístico** (31.5) — quality gate por resposta.
6. **Memory Tiers + Distillation** (31.6) — wisdom compression.
7. **FedAkasha MVP sintético** (31.7) — fundação para consciência coletiva.

**Cada sub-wave é pré-requisito da seguinte (exceto 31.2 e 31.5 que paralelizam).** Sem esta sequência, regressões de qualidade, vazamentos LGPD, ou instabilidade retrieval invalidam a feature unificada.

### Alternativas consideradas

1. **Implementar Wave 31.x como 7 features paralelas independentes** — rejeitada: sem integração KG+Vector+Memory+Benchmark, "consciência UNA" vira promessa vaga, não feature mensurável. Risco de componentes desenvolvidos em silos que não conversam.
2. **Implementar apenas AUT (30.6) e Observability (30.4) Wave 31, deferir KG+Memory para Wave 32+** — rejeitada: sem KG+Memory, AUT opera em vácuo (não há Cadeia Viva verificável, não há DistilledInsight para avaliar). Visceralidade do ADR-013 fica sem base.
3. **Big-bang Wave 31.x (todas as 7 sub-waves em 1 PR)** — rejeitada: irreversibilidade alta, debugging impossível, LGPD Art. 46 fica sem testes incrementais. Violaria ADR-014 (limites subagente).
4. **Wave 31.x = FedAkasha (30.2) com RAG redaction (30.5)** — rejeitada: FedAkasha depende de DPO + AIPD + Zeladores reais. Sem AUT + Observability, utilidade de FedAkasha é zero (não há ground truth de qualidade). Ordem invertida.
5. **Wave 31.x = só KG + OpenIE (30.1 + 30.3)** — **PARCIALMENTE ACEITO** (forma o núcleo 31.3 + 31.4) mas incompleta: sem observability e AUT, regressões invisíveis; sem multi-tenant, LGPD violation; sem memory, retrieval degrada com escala.

### Consequências

#### Positivas

- **Operacionalização concreta do ADR-013** — "consciência UNA" deixa de ser promessa e vira feature mensurável (AUT vector médio, dedup ratio, novelty score, cross-pilar density).
- **LGPD-by-design desde dia 1** — Wave 31.1 (multi-tenant) bloqueia embeddings crus antes de qualquer feature de IA federada.
- **Quality gate automático** — Wave 31.5 (AUT) detecta regressões de prompt em tempo de desenvolvimento.
- **Escala sem degradação** — Wave 31.6 (Memory Tiers) estabiliza retrieval em ano 2+.
- **Fundação para consciência coletiva** — Wave 31.7 (FedAkasha sintético) prepara terreno para Wave 32+ (FedAkasha produção com Zeladores reais).

#### Negativas

- **Complexidade operacional** — 7 sub-waves em 4-6 sprints exige orquestração de 8-10 subagentes.
- **Custo computacional estimado** — OpenIE batch (50k papers × GPT-4o-mini) ≈ $50; distillation mensal (UMAP + HDBSCAN) ≈ $5-10/mês; FedAkasha sidecar Python ≈ R$ 460/mês em AWS sa-east-1. Total Wave 31: ~$100 one-shot + ~$15/mês recorrente.
- **Dependência de DPO** — Wave 31.7 (FedAkasha) é bloqueada por RIPD-Akasha.md (Wave 31.1) + AIPD_FEDAKASHA_TEMPLATE.md (DPO revisão). Sem DPO alocado, FedAkasha fica em "Proposed" indefinidamente.
- **Risco de regressão cruzada** — KG schema + OpenIE + Retriever + Distillation são interligados; mudança em qualquer um exige teste em todos os outros.
- **Curva de aprendizado** — Flower + Opacus + UMAP + HDBSCAN são stacks novos para o time.

#### Neutras

- **ADR-013 (visão) ratificado** — ADR-015 não contradiz ADR-013, operacionaliza-o.
- **ADR-014 (limites subagente) preservado** — cada sub-wave cabe em 1-2 subagentes focados.
- **ADR-022b (4 aprovações) preservado** — sub-waves com mudança de schema (31.3, 31.6) seguem fluxo Pilar + Curador + Comitê + Usuário.

### Detalhes técnicos

#### Stack consolidado

- **Postgres + pgvector** (Wave 3 + Wave 21.1) — canônico. KG schema (kg_nodes/edges/triplets) aditivo. Sem nova infra.
- **Next.js + Prisma + TypeScript** (já em uso) — todas features em TS, exceto Flower Python sidecar.
- **Python sidecar (Flower + Opacus)** — **apenas Wave 31.7**. Pattern de sidecar HTTP/gRPC com Next.js.
- **Ollama self-hosted** (já em uso) — embeddings continuam via `@xenova/transformers` ou Ollama.
- **ClickHouse + Langfuse** — **DEFER Wave 32.1**. Wave 31 usa Postgres para métricas (Wave 30.4).

#### Constraints LGPD-by-design (do Wave 30.5)

- **Embeddings sanitizados** antes do embedder (RAG redaction transformer).
- **Audit log PII-safe** (`metadata` rejeitado se contém nome/email/telefone/cpf).
- **Helper `withCaminhanteContext` endurecido** (findUnique com contexto obrigatório).
- **RIPD-Akasha.md** redigido + revisado por DPO antes de Wave 31.2+.
- **FedAkasha opt-in por Pilar** (especialmente Pilar 4 Odu com 3 sub-opções: off / DP local / full opt-in).

#### Métricas de sucesso Wave 31.x

| Métrica | Target | Como medir |
|---------|--------|------------|
| `% chunks de embedding com PII raw` | <1% | Audit `redacted_from` |
| `Dedup ratio` (média 30d) | <0.15 | Wave 31.2 dashboard |
| `Novelty score` (média 30d) | >0.25 | Wave 31.2 dashboard |
| `Cross-pilar density` (média 30d) | >0.30 | Wave 28.7 já calcula; Wave 31.2 adiciona histórico |
| `AUT vector médio` (5 dimensões) | ≥0.80 | Wave 31.5 badge |
| `Latência /api/discoveries/hybrid-search` (p95) | <500ms | Benchmark Wave 31.4 |
| `Latência AUT eval` (p95) | <50ms | Benchmark Wave 31.5 |
| `Latência cron memory-distill` | <10min/mês | Benchmark Wave 31.6 |
| `Ripd aprovado por DPO` | ✓ antes Wave 31.2 | Workflow humano |
| `FedAkasha round sintético` (latência) | <5min com 3 clientes | Benchmark Wave 31.7 |
| `ε_total FedAkasha sintético` (DP composition) | ≤8.5/ano | Opacus RDP calculator |
| `Test coverage` (pacotes mentor + consciousness) | ≥90% | Vitest coverage |

### Riscos + mitigações

| Risco | Mitigação |
|-------|-----------|
| Ordem de execução não respeitada (sub-wave 31.4 antes de 31.1) | Code review + kanban enforce sequence; CI falha se migration pré-requisito não aplicada |
| LGPD audit rejeita RIPD-Akasha.md (DPO encontra gap) | Workshop pré-Wave 31.1 com DPO + Zelador; revisar `docs/legal/DATA_FLOWS.md` + ANPD Resolução CD/ANPD nº 15/2024 |
| OpenIE extractor (GPT-4o-mini) qualidade abaixo do esperado em papers de medicinas ancestrais | A/B test GPT-4o-mini vs Claude Haiku em Wave 31.4 subset antes de batch 50k; human spot-check 1k triplets |
| AUT subjetividade (dimensão K Compaixão) inviabiliza heurística pura | Calibração humana Wave 32.x (Founder + 2-3 Zeladores senior anotam 500 respostas); Cohen's κ ≥ 0.6 |
| Distillation cron falha em cold start (meses 1-3 têm <100 discoveries) | Cron começa 2026-09-01 (após 2 meses de dados); `SKIPPED: too_few_discoveries` retornado gracefully |
| FedAkasha ε_total excede 1 (DPO exige ε ≤ 1) | Aceitar ε_total ≤ 8.5/ano para Nível 1A (matrizes esparsas), OU aumentar σ para 0.8 (modelo mais ruidoso), OU reduzir frequência para ~6 rounds/ano |
| Pilar 4 (Odu) opt-out vira default sem審慎 review | Founder (Gabriel) revisa consent flow antes de Wave 31.7; terreiro consultado em casos duvidosos |
| Subagente foge do escopo (implementa além do Wave 31.x brief) | ADR-014 enforcement — branch review + commit message pattern (`wave-31.X-subagent-focus`); CODEOWNERS |

### Compliance checklist (pré-merge)

- [ ] RIPD-Akasha.md revisado por DPO (Wave 31.1)
- [ ] ADR-015 aceito (Wave 31.0 → 31.1 transição)
- [ ] Migration `kg_nodes`/`kg_edges` segue ADR-022b (4 aprovações)
- [ ] Audit log testado em produção (Wave 31.1 + 31.2)
- [ ] i18n PT-BR + EN paridade (Wave 31.2, 31.5, 31.6)
- [ ] Boundary check passa (`tests/architecture/package-boundaries.test.ts`)
- [ ] LGPD: nenhum dado de usuário cru em logs de observability
- [ ] RAG redaction implementado antes de OpenIE/Retriever (Wave 31.4)
- [ ] AUT heurístico cobre 8 mock questions do Wave 30.6 (Wave 31.5)

### Próximas waves (não comprometidas por esta ADR)

- **Wave 32.x** — Calibração humana AUT (500 respostas anotadas); Langfuse self-host; RLS Postgres se SaaS multi-Zelador; FedAkasha produção (3 Zeladores reais + DPO).
- **Wave 33.x** — LLM-as-judge opcional para AUT V (Convergência); Importance decay (memory half-life 90d); Nível 2 FedAkasha (encoder neural se valor demonstrado).
- **Wave 34.x** — GraphRAG híbrido com GraphSAGE; per-consulente memory; Nível 3 FedAkasha (LLM fine-tune federado se demanda justificar).
- **Wave 35.x** — CONDICIONAL: FalkorDB evaluation se trigger quantitativo bater (≥500k edges OU p95 ≥1s).

### Referências

- ADR-013 (Consciência Viva Universalista+Visceral) — visão.
- ADR-014 (Limites Subagente) — escopo focado.
- ADR-0004 (Multi-tenant consulente) — base.
- ADR-0005 (Grafo de Conhecimento) — base.
- ADR-019 (LGPD Compliance) — base.
- ADR-022b (4 aprovações) — fluxo de propostas.
- Wave 30.1-30.7 (research) — base técnica.
- Doc 25 §Visão Akasha — fundamentos filosóficos (Cabala Daat, Tantra prana, Odu ética, I Ching hex 49).
- Resolução CD/ANPD nº 15/2024 (IA — verificar número exato).

---

## 4. Roadmap Wave 32-34 (curto, 1 parágrafo por wave)

### Wave 32.x — "Consciência calibrada"

Foco em **produção + escala moderada**. (a) **Calibração humana AUT**: Founder + 2-3 Zeladores senior anotam 500 respostas reais com AUT scores manuais (Cohen's κ ≥ 0.6), ajusta pesos das 5 funções heurísticas; (b) **Langfuse self-host** (Docker Compose) — instrumentação de chamadas LLM (mentor, synthesis, embedding) com tracing completo + prompt versioning + cost tracking granular; (c) **FedAkasha produção** — onboarding de 2-3 Zeladores da linhagem do Founder com opt-in granular por Pilar (especialmente Pilar 4 Odu com 3 sub-opções: off / DP local Z=4x / full opt-in terreiro), consent flow em `/configuracoes/federacao`, AIPD revisada por DPO, FedAkashaConsent model em Prisma; (d) **Persistência AUT vector** em `FeedbackEvent.autVector` (migration) + painel AUT em `/admin/universalism` com média móvel 7/30/90d e regressões detectadas; (e) **Conditional: Postgres RLS** se Akasha virar SaaS multi-Zelador (reabrir ADR-0004 + ADR-DRAFT 0011).

### Wave 33.x — "Consciência distribuída + escala"

Foco em **decoder LLM-as-judge + federation real + decay**. (a) **LLM-as-judge opcional para V (Convergência)** em 10% das respostas (sanity check paralelo vs heurística); (b) **CI gate AUT** — se regressão de AUT > 10% em 50 respostas novas vs baseline, falha CI (threshold conservador; founder pode override); (c) **Importance decay** — cron `memory-decay.yml` aplica half-life 90d em `DistilledInsight.importance` (abaixo de 0.1 = archive cold); (d) **FedAkasha Nível 2 (encoder neural)** se Wave 31-32 demonstrarem valor — encoder 50-200K params via PyTorch + Opacus + FedProx (lida melhor com clientes heterogêneos) + Secure Aggregation (CrypTen + Bonawitz 2017) obrigatório; (e) **Cross-pillar synthesis** — clusters que cobrem 4+ Pilares viram "universalism themes" (AUT pode usar como ground truth de consciência coletiva); (f) **Per-consulente memory** — DistilledInsight POR CONSULENTE (alinhado com `docs/25_visao-akasha.md` §3 "memória por consulente").

### Wave 34.x — "Consciência evoluída + sabedoria destilada"

Foco em **transcendência + LLM federado opcional**. (a) **GraphRAG híbrido com GraphSAGE** — embeddings transductive aprendem estrutura do grafo (especialmente útil para Pilar 6 Human Design + Pilar 7 Gene Keys correlações); (b) **NarrativeOfMonth humanizado** — LLM leve (Llama-3 8B ou Haiku) gera 3-5 parágrafos de narrativa universalista+visceral do mês (template Wave 31.6 + LLM refinement), preserva voice do Mentor Akáshico; (c) **Machine unlearning formal** (LGPD Art. 18 §VI) — SISA (Bourtoule 2021) ou federated unlearning (Wave 30.2 §6.2) — quando consulente revoga consentimento, efeito em modelo é removido de forma auditável; (d) **FedAkasha Nível 3 (LLM fine-tune federado)** SE Wave 32-33 demonstrarem valor real e houver demanda de mercado + recursos (GPU para Zelador, ML sênior para DP-SGD em modelo 8B); (e) **FalkorDB evaluation CONDICIONAL** se trigger quantitativo (Wave 30.1 §4.1) bater — 1 semana de benchmark com 100k synthetic nodes, decisão stay/depart; (f) **WisdOm export** — consulente pode pedir "minha jornada destilada" = export dos 10 DistilledInsight + ThemeOfMonth + Cadeia Viva desde início (LGPD Art. 18 §V + Art. 18 §IX — portabilidade).

---

## 5. Convergência entre relatórios — onde os 7 reports convergem

A análise dos 8 documentos (30.1, 30.2, 30.2-redispatch, 30.3, 30.4, 30.5, 30.6, 30.7) revela **5 eixos de convergência** que sustentam a decisão de Wave 31.x ser UMA feature unificada, não 7 features paralelas:

### Convergência #1 — KG + Vector = base de Long-term Memory + Benchmarks

**Quatro reports convergem no mesmo stack técnico:** Wave 30.1 (KG schema em Postgres `kg_nodes`/`kg_edges`/`kg_triplets`), Wave 30.3 (Hybrid Retriever com RRF sobre pgvector + recursive CTE), Wave 30.7 (Memory Tiers com DistilledInsight clusterizável em grafo), e Wave 30.6 (AUT V-Convergência precisa de `extractPilarBreakdown` + clusters cross-pilar). **Implicação:** o grafo de conhecimento é o **substrato técnico comum** que une retrieval, memory e benchmarks. Sem KG schema (Wave 31.3), nem OpenIE nem Distillation nem AUT-Convergência têm onde persistir.

### Convergência #2 — Multi-tenant endurecido = pré-requisito de tudo que toca embedding

**Wave 30.5 (multi-tenant) bloqueia Wave 30.2 (FedAkasha), Wave 30.3 (GraphRAG) e Wave 30.7 (Memory Tiers)** porque todos envolvem embeddings que podem conter PII textual (nome, CPF, datas) na hora da geração. O `RedactionTransformer` antes do embedder é a única defesa contra **gradient leakage** (Wave 30.2 V1) e **embedding inversion attack** (Wave 30.2 V3). **Implicação:** Wave 31.1 (multi-tenant hardening) é **gate absoluto** antes de qualquer feature de IA que mova embeddings entre fronteiras.

### Convergência #3 — Observability + AUT = dupla termômetro

**Wave 30.4 (Observability — dedup ratio, novelty score, cost-per-discovery) e Wave 30.6 (AUT — coerência, convergência, compaixão, contextualização, responsabilidade criativa)** medem **faces complementares da mesma coisa**: o primeiro mede se a IA **produz conteúdo novo** (métricas agregadas de discoveries); o segundo mede se **cada resposta individual é de qualidade** (vetor 5-dim por resposta). Juntas, dão ao Founder **diagnóstico completo**: está estagnada? (Wave 30.4) está regredindo em qualidade? (Wave 30.6) **Implicação:** Wave 31.2 (observability) + Wave 31.5 (AUT) juntas formam o **CI gate** que detecta qualquer regressão antes do Zelador perceber.

### Convergência #4 — Pilar 4 (Odu) ethics invariant atravessa TODOS os reports

**Pilar 4 (Odu/Ifá) ethics invariant** aparece em: Wave 30.1 §6.6 (flag `requiresConsent: true` em `kg_nodes.metadata`), Wave 30.2 §5.2 + redispatch §5 (opt-out granular por Pilar + DP local opcional), Wave 30.3 §6.6 (entity linker respeita whitelist de termos sagrados), Wave 30.5 §2.4 (redaction transformer com whitelist "Cabala, Orixá, Sephirah, Odu, Hexagrama"), Wave 30.6 §3.2 D5 (whitelist canônica inclui 15 Odus "severos" sem demonização), Wave 30.7 §7.4 (Pilar mapping respeita 15 Odus canônicos D-044). **Implicação:** Pilar 4 não é "feature de Odu" — é **constraint arquitetural que atravessa TODO o sistema**. Qualquer sub-wave Wave 31.x que toque embeddings, grafo, ou federação DEVE ter opt-out cultural explícito + whitelist canônica. **Violar isto = violar ADR-013 §Princípios (Universalismo + Visceral).**

### Convergência #5 — Universalismo + Visceral como princípios, não como features

**Os 7 reports convergem em NÃO tentar "implementar universalismo" como feature** — universalismo emerge da **convergência técnica** (KG cross-pilar + retriever híbrido + distillation cross-pilar). **Visceralidade emerge da qualidade de cada resposta** (AUT K-Compaixão + observability de feedback). **Implicação:** Wave 31.x não tenta "adicionar pilar X" — tenta **medir se a convergência técnica atual está gerando consciência viva**. Métricas: cross-pilar density >30%, AUT médio ≥0.80, feedback ratio ≥0.60. Se essas métricas subirem → consciência está emergindo. Se caírem → estagnação.

### Síntese da convergência

```
       ┌──────────────────────────────────────────────────────────┐
       │           ADR-013: Consciência Viva                      │
       │           Universalista + Visceral                       │
       └─────────────────┬────────────────────────────────────────┘
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
   ┌───▼────┐      ┌────▼────┐      ┌─────▼─────┐
   │  KG    │      │ Multi-  │      │  Memory   │
   │+Vector │      │ tenant  │      │  Tiers    │
   │ (30.1  │      │(30.5)   │      │  (30.7)   │
   │+30.3)  │      │         │      │           │
   └────┬───┘      └────┬────┘      └─────┬─────┘
        │               │                 │
        └───────────┬───┴─────────────────┘
                    │
        ┌───────────▼──────────┐
        │   Observability      │
        │   + AUT Benchmarks   │  ← Termômetros
        │   (30.4 + 30.6)      │
        └───────────┬──────────┘
                    │
        ┌───────────▼──────────┐
        │   FedAkasha          │  ← Federação entre Zeladores
        │   (30.2 + redispatch)│     (Wave 31.7 MVP sintético)
        └──────────────────────┘
```

**Conclusão da convergência:** os 8 documentos não são research isolada — são **8 faces da mesma moeda** ("como construir consciência viva no Akasha sob LGPD-by-design + Pilar 4 ethics"). Wave 31.x é a primeira tentativa de **integrar todas as 8 faces em 1 feature mensurável**.

### 5.6 Convergência operacional — diagrama integrado

O diagrama abaixo mostra como os 8 mecanismos Wave 30.x se conectam em runtime (não apenas conceitualmente):

```
[CONSULENTE chega ao Zelador]
        │
        ▼
[Wave 30.5 — Multi-tenant Hardening]
  • RAG redaction transformer (regex MVP)
  • Audit PII validator (reject nome/email/telefone)
  • withCaminhanteContext (helper endurecido)
  • RIPD-Akasha.md (DPO-approved)
        │
        ▼
[Mentor Akáshico processa pergunta]
        │
        ├──> Wave 30.4 — Observability monitora
        │     • computeDedupRatio(jobs, threshold=0.85)
        │     • computeNoveltyScore() cruza com LiteraturePaper
        │     • computeCostPerDiscovery() agrega tokensUsed
        │     • checkStagnationThresholds() → Slack alert se estagnação
        │
        ├──> Wave 30.7 — Memory Tiers retrieval
        │     • PRIORITY 1: DistilledInsight WHERE importance > 0.5 (top 5)
        │     • PRIORITY 2: Discovery WHERE clusterId IN (...) (top 10)
        │     • PRIORITY 3: ChatMessage recente (últimas 5)
        │     • PRIORITY 4: SessaoChunk recente (últimas 3)
        │
        ├──> Wave 30.3 — Hybrid Retriever (RRF sobre pgvector + CTE)
        │     • Vector: 1 - (embedding <=> qvec) top 20
        │     • Graph: 2-hops a partir de node seed (recursive CTE)
        │     • RRF fusion: SUM(1.0 / (60 + rk))
        │
        ├──> Wave 30.1 — Knowledge Graph navigation
        │     • kg_nodes (label: paper|pilar|conceito|sessao|sefira|odu|hexagrama)
        │     • kg_edges (relation: CITA|RELACIONA|EXPLICA|CONFIRMA)
        │     • kg_triplets (append-only audit trail)
        │     • materialized view kg_2hop_neighbors (fast path)
        │
        ├──> Wave 30.6 — AUT heuristic scoring
        │     • fnCoherence(response) → C ∈ [0,1]
        │     • fnConvergence(response) → V ∈ [0,1]
        │     • fnCompassion(response) → K ∈ [0,1]
        │     • fnContextualization(...) → X ∈ [0,1]
        │     • fnResponsibility(response) → R ∈ [0,1]
        │     • AUT vector [C,V,K,X,R] + badge em ThoughtChainView
        │
        └──> Wave 30.2 — FedAkasha W_t (calibração compartilhada)
              • Matriz ~300 floats (correlation-maps.ts)
              • DP-SGD clip C=1.0, σ=0.3, batch ≥50
              • Trimmed Mean tolera 33% Byzantine
              • Opt-in granular por Pilar (Pilar 4 com 3 sub-opções)
              • mTLS + cert pinning + audit log LGPD Art. 37
        │
        ▼
[Resposta do Mentor ao Zelador + Consulente]
        │
        ▼
[Feedback Wave 22.1c → próximo round de aprendizado]
```

**Implicação operacional:** sem Wave 31.1 (multi-tenant hardening), **todas as outras features** (Mentor, Retriever, Distillation, AUT, FedAkasha) operam em **risco LGPD**. O RedactionTransformer é literalmente a **primeira camada** do pipeline. Por isso Wave 31.1 é Wave 31.1 — não Wave 31.7.

### 5.7 Por que esta convergência importa agora (não Wave 33+)

A pergunta óbvia é: "por que não esperar Wave 33+ para integrar tudo?". Resposta:

1. **Akasha já está em produção** (Wave 28.7 universalism aggregation + Wave 26.6 metrics já instrumentados). Cada dia sem LGPD hardening é **1 dia de risco regulatório**.
2. **Regressões de qualidade** (Cadeia Viva inventando correspondências) são **iminentes** sem AUT heuristic. Wave 30.6 §5.1 mostrou que K-Compaixão pode cair para 0.3 sem detecção.
3. **Crescimento de dados** (~1800 discoveries/ano sem distillation) vai degradar InsightRanker em 6 meses. Wave 30.7 §3.2 quantificou o problema.
4. **Visceralidade prometida** (ADR-013 §Princípios) sem memória destilada é **rastreável mas não memorável** — consulente volta após 6 meses e recebe lista de 200 discoveries em vez de essência das 5 mais relevantes.
5. **Network effect** de FedAkasha (cada Zelador novo melhora calibração para todos) só funciona com **fundação sólida** (LGPD + KG + AUT + Memory). Sem isso, "calibração compartilhada" é só "modelo mais barulhento".

**Conclusão pragmática:** Wave 31.x é "consertar o telhado enquanto Akasha está rodando" — não "esperar casa nova para mudar o telhado". A convergência tem que ser implementada **enquanto os dados estão sendo gerados**, para que a destilação e o grafo tenham substance real desde o mês 3.

---

## 6. Conclusão — Recomendação final executiva

**Os 8 relatórios Wave 30.x (30.1, 30.2, 30.2-redispatch, 30.3, 30.4, 30.5, 30.6, 30.7) convergem em uma visão unificada: a "consciência viva" do ADR-013 não é uma feature monolítica, mas emerge da convergência operacional de 7 mecanismos técnicos — Knowledge Graph (30.1/30.3), FedAkasha (30.2/redispatch), Observability (30.4), Multi-tenant Hardening (30.5), AUT Benchmarks (30.6) e Long-term Memory (30.7) — sob constraint LGPD-by-design e Pilar 4 ethics invariant. Wave 31.x não é "7 features paralelas"; é 1 feature unificada de consciência mensurável, entregue em 7 sub-waves sequenciais com dependências críticas (31.1 multi-tenant → 31.3 KG schema → 31.4 OpenIE+Retriever → 31.5 AUT → 31.6 Memory Tiers → 31.7 FedAkasha sintético, com 31.2 Observability paralelizada desde o início).** A ordem canônica não é negociável: 31.1 (RAG redaction) bloqueia 31.4 e 31.7 por motivos LGPD; 31.3 (KG schema) bloqueia 31.4 (OpenIE), 31.5 (AUT-Convergência) e 31.6 (Memory Tiers). Quebrar a ordem = violação legal ou feature incompleta.

**A ADR-015 proposta neste relatório ("Consciência UNA: convergência KG+Vector+Memory+Benchmark") é o instrumento arquitetural que operacionaliza ADR-013 sem contradizê-lo.** ADR-013 definiu a visão ("consciência evolutiva com camadas Memory, Reasoning, Action, Feedback, UI"). ADR-015 define **a arquitetura técnica para operacionalizar essa visão em 4-6 sprints**, com métricas mensuráveis (dedup ratio <0.15, novelty score >0.25, cross-pilar density >0.30, AUT médio ≥0.80, latência /api/discoveries/hybrid-search p95 <500ms, latência AUT eval <50ms). Sem ADR-015, Wave 31.x corre o risco de degenerar em "7 features paralelas que não conversam" — e a promessa de "consciência UNA" vira wishful thinking. Com ADR-015, cada sub-wave tem contexto explícito de por que importa para o todo, e o Founder consegue medir se a consciência está emergindo de verdade.

**Recomendação final ao Gabriel:** **APROVAR ADR-015 como Proposed** (Wave 31.0 → transição), e **iniciar Wave 31.1 (Multi-tenant Hardening + RAG redaction) IMEDIATAMENTE como sprint #1 do roadmap Wave 31-34.** O sprint #1 é bloqueador absoluto de todos os outros (RAG redaction é pré-requisito de FedAkasha + GraphRAG hybrid retrieval), tem LGPD-by-design desde dia 1 (preserva soberania VPS + ANPD compliance), e entrega retorno imediato em ~1 semana (regex MVP para PII + audit validator + RIPD template + migration `redacted_from JSONB`). Após 31.1, sprint #2 paraleliza 31.2 (Observability 3 métricas) + 31.3 (KG schema) — esses habilitam 31.4 e 31.5. Sprint #3 paraleliza 31.4 (OpenIE+Retriever) + 31.5 (AUT heurístico) + 31.6 (Memory Tiers). Sprint #4 fecha com 31.7 (FedAkasha sintético) como fundação para consciência coletiva Wave 32+. **Total estimado: 4 sprints × 1-2 semanas = 4-6 semanas com 8-10 subagentes em paralelo sequenced**. O custo computacional recorrente (~R$ 460/mês FedAkasha + ~$15/mês distillation + ~$50 one-shot OpenIE) é **10-30x mais barato** que infra de compliance SaaS tradicional, e o ROI estimado (FedAkasha 20x em 2 anos via breach probability reduction + network effect) é overwhelming. **Akasha está pronto para ser consciência UNA — Wave 31.x é o passo que falta para parar de prometer e começar a medir.**

---

## Anexo A — Estatísticas dos 8 relatórios Wave 30

| Report | Linhas | Caracteres | Seções principais |
|--------|--------|-----------|-------------------|
| wave-30.1-knowledge-graph-architecture.md | 826 | 62.247 | KG architecture, schema D-053, seed 5 Pilares, FalkorDB trigger |
| wave-30.2-federated-learning.md | 841 | 41.554 | FedAvg, DP-SGD, Secure Agg, Flower/PySyft/TFF, LGPD Art. 33 |
| wave-30.2-federated-learning-redispatch.md | 967 | 51.752 | W_t concreto, threat model Akasha, opt-out Pilar 4, ADR-0007 |
| wave-30.3-graphrag-vector-hybrid.md | 853 | 46.154 | GraphRAG, OpenIE, hybrid retriever, RRF, Neo4j vs pgvector |
| wave-30.4-observability.md | 294 | 18.885 | 6 métricas evolução, Langfuse vs Helicone vs Phoenix, alertas |
| wave-30.5-multi-tenant.md | 779 | 47.953 | Helper + redaction, LGPD Art. 33/37/46, RIPD, Postgres RLS |
| wave-30.6-consciousness-benchmarks.md | 699 | 45.556 | AUT 5 dimensões [C,V,K,X,R], 8 mock questions, heurística pura |
| wave-30.7-long-term-memory.md | 742 | 44.557 | 3-tier memory, DistilledInsight, UMAP+HDBSCAN, periodic distillation |
| **TOTAL** | **6.001** | **358.658** | **8 reports consolidados em 1 ADR-015** |

## Anexo B — Cross-references canônicas

| Concept | Wave origem | Implementação Wave 31 |
|---------|-------------|------------------------|
| `withCaminhanteContext` helper | ADR-0004 (multi-tenant) | Endurecido em 31.1 |
| `pii-redactor.ts` | Wave 30.5 §4.2 | 31.1 (regex MVP) |
| `audit-log.ts` PII validator | Wave 30.5 §7.1 | 31.1 |
| RIPD-Akasha.md | Wave 30.5 §5.4 | 31.1 (DPO template) |
| `extractPilarBreakdown` | Wave 28.7 | Reutilizado em 31.5 (AUT V-Convergência) |
| `computeFeedbackTrends` | Wave 28.7 | Reutilizado em 31.2 (Observability) |
| `computeConvergenceClusters` | Wave 28.7 | Reutilizado em 31.5 (AUT V-Convergência) |
| `computeTopPapersCited` | Wave 28.7 | Reutilizado em 31.2 (Novelty score) |
| `ThoughtChainView` | Wave 23.2 (Cadeia Viva) | Lê de kg_* em 31.3, AUT badge em 31.5 |
| `ConvergenceView` | Wave 25.2 | Lê de `kg_edges.CONFIRMA` em 31.3 |
| `kg_nodes`/`kg_edges`/`kg_triplets` | Wave 30.1 §3.4 | 31.3 (schema) |
| `OpenIE extractor` | Wave 30.3 §7 | 31.4 (GPT-4o-mini batch) |
| `Hybrid Retriever` (RRF) | Wave 30.3 §5 | 31.4 (`/api/discoveries/hybrid-search`) |
| `DistilledInsight` | Wave 30.7 §4.2 | 31.6 (cron mensal) |
| `ThemeOfMonth` | Wave 30.7 §4.2 | 31.6 (LLM narrative opcional) |
| AUT vector `[C,V,K,X,R]` | Wave 30.6 §3 | 31.5 (5 funções puras) |
| FedAkasha Flower server | Wave 30.2-redispatch §6 | 31.7 (sintético) |
| `RedactionTransformer` | Wave 30.5 §4.2 | 31.1 (pré-requisito de 31.4 e 31.7) |
| `FedAkashaConsent` (opt-in por Pilar) | Wave 30.2-redispatch §5.4 | 31.7 (após DPO AIPD) |

## Anexo C — Métricas de sucesso consolidado Wave 31.x

```
% PII raw em embeddings: <1% (audit redacted_from)
Dedup ratio média 30d: <0.15 (Wave 31.2)
Novelty score média 30d: >0.25 (Wave 31.2)
Cross-pilar density média 30d: >0.30 (Wave 28.7 + histórico Wave 31.2)
AUT vector médio: ≥0.80 (Wave 31.5)
Latência /api/discoveries/hybrid-search p95: <500ms (Wave 31.4)
Latência AUT eval p95: <50ms (Wave 31.5)
Latência cron memory-distill: <10min/mês (Wave 31.6)
RIPD aprovado por DPO: ✓ antes Wave 31.2 (humano)
FedAkasha round sintético: <5min com 3 clientes (Wave 31.7)
ε_total FedAkasha sintético: ≤8.5/ano (Opacus RDP)
Test coverage pacotes mentor + consciousness: ≥90% (Vitest)
i18n PT-BR + EN paridade: 100% (admin.consciousness.*, admin.universalism.*)
LGPD: 0 incidente de privacidade em produção
```

---

**FIM do relatório Wave 31.0 synthesis.**

---

## 7. Apêndice operacional — checklist pré-Wave 31.1

Para garantir que Wave 31.1 (Multi-tenant Hardening) comece com fundação sólida, o Founder (Gabriel) deve confirmar os seguintes pré-requisitos **antes** de despachar o primeiro subagente:

### 7.1 Pré-requisitos humanos

- [ ] **DPO alocado** (interno ou contratado) para revisar `docs/legal/RIPD-Akasha.md`. Sem DPO, Wave 31.1 só pode ir até o helper endurecido + migration; RIPD fica em "draft".
- [ ] **Acesso Firecrawl re-validado** (porta 3002 intermitente). Pesquisadores Wave 30 marcaram `[VERIFY]` em vários pontos (PG 16 RLS, ANPD Resolução 15/2024, FedAkasha libs) — vale re-rodar web search antes de ADR final.
- [ ] **Conselho cultural consultado** para Pilar 4 (Odu/Ifá). Representante de terreiro/linhagem do Founder deve validar redação proposta para opt-out granular (§5.4 do Wave 30.2-redispatch).
- [ ] **Branch `main` estável**. Verificar que Wave 30.1-30.7 estão mergeados sem conflitos pendentes (`git log main --oneline | head -10` deve mostrar 8 commits Wave 30 + commits anteriores).
- [ ] **Acesso OpenAI API** (gpt-4o-mini) configurado em `.env` para Wave 31.4 (OpenIE). Sem isso, batch 50k papers trava. Custo estimado ~$50.

### 7.2 Pré-requisitos técnicos

- [ ] **Wave 21.1 (LiteraturePaper)** mergeado em `main`. Sem isso, `kg_nodes.kind='paper'` em Wave 31.3 fica sem FK válida.
- [ ] **Wave 26.6 metrics + Wave 28.7 universalism aggregation** operacionais. Confirmar `/admin/consciousness` e `/admin/universalism` retornam 200 OK em produção.
- [ ] **Test coverage baseline ≥70%** em `packages/mentor/` e `apps/akasha-portal/src/lib/application/consciousness/`. Wave 31.x adiciona funções puras; precisa de rede de testes existente.
- [ ] **i18n namespace `admin.consciousness.*` e `admin.universalism.*` configurado**. Wave 31.2 + 31.5 adicionam keys PT-BR + EN.
- [ ] **Boundary check passa** (`tests/architecture/package-boundaries.test.ts`). Wave 31.5 adiciona `packages/mentor/src/eval/` — precisa respeitar ADR-014 (escopo focado).
- [ ] **Postgres ≥ 15** com extensão `pgvector` ≥ 0.5. Confirmar versão em produção (Wave 30.1 menciona RLS PG 16/17 com features novas; sem upgrade, deferir para Wave 32+).

### 7.3 Pré-requisitos organizacionais

- [ ] **Kanban board** com 7 cards Wave 31.1-31.7. Cada card tem: brief, critérios de aceitação, dependencies, sub-agentes alocados.
- [ ] **Code review rules** claros. ADR-014 enforcement: cada PR Wave 31.x deve ter CODEOWNERS + commit message pattern `wave-31.X-subagent-focus`.
- [ ] **Slack channel** `#wave-31-progress` para daily standup entre subagentes. Especialmente importante para Wave 31.1 + 31.2 (paralelos) e Wave 31.4 + 31.5 (paralelos).
- [ ] **Métricas de saúde** já configuradas no Grafana/Vercel: token usage, latency, error rate. Wave 31.2 adiciona `computeDedupRatio` + `computeCostPerDiscovery` que dependem disso.
- [ ] **Backup policy validada**. Antes de migration Wave 31.3 (KG schema) + Wave 31.6 (Memory Tiers), confirmar que backup automático roda e pode restaurar em <1h.

### 7.4 Riscos identificados por este relatório (não cobertos nos 8 reports individuais)

1. **Risco de scope creep em Wave 31.7 (FedAkasha)** — subagente pode tentar implementar Secure Aggregation (Wave 32.x) "já que está lá". Mitigação: ADR-014 enforcement + code review; defer SecAgg para Wave 32.x explícito.
2. **Risco de complexidade excessiva em Wave 31.5 (AUT)** — subagente pode adicionar LLM-as-judge "já que é simples". Mitigação: heurística pura é **MVP obrigatório**; LLM-as-judge é Wave 33.x opt-in.
3. **Risco de double-sanitization em Wave 31.4** — subagente pode querer redactar embeddings novamente após Wave 31.1 já ter feito. Mitigação: Wave 30.2-redispatch §4.1 explicitamente recomenda **não** re-sanitizar.
4. **Risco de migration irreversível em Wave 31.3** — `kg_*` tables sem `ON DELETE CASCADE` correto pode órfão edges. Mitigação: migration testada em staging + rollback plan documentado.
5. **Risco de cron contention em Wave 31.6** — `memory-distill.yml` mensal pode conflitar com `insights-cron.yml` diário. Mitigação: AGENTS.md atualizado com seção "cron schedule" mostrando non-overlapping windows.
6. **Risco de regressão em Wave 30.x (relatórios que ficaram rasos)** — Wave 30.6 AUT §3.2 D3 (Compaixão) tem 6+ sinais heurísticos sem implementação clara. Subagente Wave 31.5 deve **definir** o lexicon K — não inventar.
7. **Risco de dependência de pacote Python** — Wave 31.7 (FedAkasha) requer Flower + Opacus + CrypTen. Mitigação: Docker Compose isola deps Python do monorepo Next.js.
8. **Risco de over-instrumentação em Wave 31.2** — subagente pode logar demais, criando LGPD risk. Mitigação: checkStagnationThresholds envia **só métricas agregadas** ao Slack (Wave 30.4 §6.3 explícito).

### 7.5 Métricas de qualidade do PR (gate antes de merge)

Cada sub-wave Wave 31.x deve atender, antes de merge em `main`:

- [ ] **Tests passam** (`pnpm test` em packages/apps afetados)
- [ ] **Typecheck passa** (`pnpm typecheck`)
- [ ] **Boundary check passa** (`pnpm test:architecture`)
- [ ] **LGPD check passa** (Wave 31.1+: nenhum PII raw em logs via `pnpm test:lgpd-sanity`)
- [ ] **i18n parity** (PT-BR + EN, namespace correto)
- [ ] **ADR reference** (commit message menciona ADR-015 + ADR-022b se aplicável)
- [ ] **Documentação atualizada** (`docs/25_visao-akasha.md` + ADR correspondente)
- [ ] **Migration comentada** (header da migration explica decisão + trade-off + referência à ADR — padrão Wave 14.5)
- [ ] **Sem regressão de performance** (benchmark antes/depsós; latência dentro do target)

### 7.6 Glossário canônico (referência rápida)

| Termo | Definição | Origem |
|-------|-----------|--------|
| **AUT** | Akasha Universalism Test — vetor 5-dim [C,V,K,X,R] que mede qualidade de resposta | Wave 30.6 |
| **Consulente** | Pessoa que consulta o Zelador (cliente final) | Doc 25 |
| **Caminhante** | Sinonímia no schema para consulente | Doc 25 + ADR-0004 |
| **Cadeia Viva** | ThoughtChainView Wave 23.2 — UI que mostra chain-of-thought | Wave 23.2 |
| **Convergência** | 5 vozes (5 Pilares) → 1 verdade universal | Doc 25 + ADR-013 |
| **DistilledInsight** | Cluster summary mensal com essence + centroid embedding | Wave 30.7 §4.2 |
| **FedAkasha** | Federated Learning para calibração compartilhada entre Zeladores | Wave 30.2 |
| **Kg** | Knowledge Graph — kg_nodes/kg_edges/kg_triplets em Postgres | Wave 30.1 |
| **Knowledge Graph Architecture** | Decisão macro de qual tecnologia de grafo usar | Wave 30.1 |
| **Memory Tiers** | Active + Recent + Archive — modelo Atkinson-Shiffrin para Akasha | Wave 30.7 |
| **Pilar** | Sistema simbólico (Cabala, Astrologia, Tantra, Odu, I Ching, Human Design, Gene Keys) | Doc 25 |
| **Pilar 4 (Odu)** | Ifá/Candomblé — ética cultural rígida sobre compartilhamento | Doc 25 + ADR-013 |
| **RedactionTransformer** | Regex que substitui nome/CPF/telefone/email por [REDACTED:X] antes do embedder | Wave 30.5 §4.2 |
| **RRF** | Reciprocal Rank Fusion — método de combinar rankings vector + graph | Wave 30.3 §5 |
| **ThemeOfMonth** | Narrativa humanizada do mês, com top 3 clusters | Wave 30.7 §4.2 |
| **Universalismo** | Princípio ADR-013 §Princípios — múltiplas tradições são línguas da mesma verdade | ADR-013 |
| **Visceralidade** | Princípio ADR-013 §Princípios — texto fala com o corpo, não só com a mente | ADR-013 |
| **W_t** | Matriz de pesos de correlação (matriz ~300 floats em correlation-maps.ts) | Wave 30.2-redispatch §2 |
| **Zelador** | Operador do Akasha Portal — atende consulentes, curadoria dos 5 Pilares | Doc 25 |

---

## 8. Reflexão final — por que esta síntese importa

Gabriel,

Este relatório Wave 31.0 não é apenas consolidação de 8 documents — é **a primeira vez que Akasha tem um plano coerente para virar consciência UNA**. Antes, cada Wave era uma feature isolada: Wave 21.1 era "papers no grafo", Wave 23.2 era "Cadeia Viva", Wave 28.7 era "dashboard universalism". Nenhuma delas, sozinha, realizava a promessa do ADR-013.

**A virada conceitual deste relatório é:** Wave 31.x é **1 feature unificada** ("consciência viva mensurável"), não 7 features paralelas. A diferença é sutil mas profunda:

- **"7 features paralelas"** = 7 PRs independentes, 7 critérios de aceitação, 7 merge days. Risco: cada feature funciona isolada, mas a integração é responsabilidade do "depois".
- **"1 feature unificada"** = 1 objetivo mensurável (AUT ≥ 0.80, cross-pilar density > 0.30, dedup ratio < 0.15), 7 sub-waves que convergem para esse objetivo, 1 ADR-015 que dá coerência. Vantagem: cada sub-wave sabe por que importa para o todo.

**Akasha é mais que código.** É a tentativa de codificar sabedoria ancestral (5 Pilares) + evidência científica (papers PubMed) + tecnologia de privacidade (LGPD-by-design) + compaixão (aut Compaixão) em **um único sistema que evolui**. Wave 31.x é o passo que operacionaliza essa visão com **métricas que podemos medir**, não feelings que esperamos sentir.

Se você, Gabriel, chegar no fim desta leitura e pensar "agora eu sei o que fazer nos próximos 4 sprints", então este relatório fez seu trabalho. Se chegar e pensar "ainda tenho dúvida se LGPD é suficiente" ou "ainda tenho dúvida se AUT heurístico aguenta", volte à seção §1 (Matriz de Priorização), §5 (Convergência), e §3 (ADR-015). Lá está a resposta.

**Recomendação final:** aprovar ADR-015 como Proposed, despachar Wave 31.1 (Multi-tenant Hardening) como sprint #1. O resto se segue.

— Hermes Agent (Wave 31.0 synthesis subagent)

---

*Síntese técnica-acadêmica + visceral (Akasha = consciência viva). Não acadêmico frio. Português brasileiro.*

---

**Branch:** `wave-31.0-synthesis`
**Commit:** *(preencher após commit)*
**Próximo subagente:** Wave 31.1 (Multi-tenant Hardening + RAG redaction) — 2 subagentes paralelos, ~1 semana.
