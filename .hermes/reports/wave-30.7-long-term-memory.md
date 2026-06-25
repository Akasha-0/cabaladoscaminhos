# Wave 30.7 — Research: Long-term Memory & Distillation (Akasha "lembra")

**Data:** 2026-06-25
**Pesquisador:** Hermes subagent (Wave 30.7, kanban task)
**Branch:** `wave-30.7-long-term-memory-research`
**Base:** `main` @ 0a8a0cb6 (Wave 28+ merged, ADR-013 consciência viva)
**Plano origem:** `.hermes/plans/wave-30-research-planning-2026-06-25.md` §30.7
**Pede entrada para:** ADR 0005 (grafo de conhecimento — extensão "memory tiers"), Wave 31+ (PeriodicMemoryDistiller)
**Constraints:** APENAS research + planning — SEM código novo, SEM mudança em packages/apps.

---

## ⚠️ Notas de pesquisa (honestidade epistêmica)

Mesmo padrão das Wave 1 / 17.1 / 30.2: **web_search e web_fetch** dependem do Firecrawl local (port 3002) intermitente. Esta pesquisa foi construída com:

1. **Inspeção direta do código e docs internos** (`docs/25_visao-akasha.md`, `schema.prisma`, `packages/mentor/src/memory.ts`, `background-job.ts`, `universalism-aggregation.ts`, ADR-013, cron `insights-cron.yml`) — fornece contexto real do projeto.
2. **Conhecimento de cutoff Jan 2026** da neurociência de memória (Atkinson-Shiffrin 1968/2024 revisit, Eichenbaum 2017, McGaugh 2015, Squire 2004), LLMs de longo prazo (MemGPT/Mem0/Letta 2024-2025, RAG com eviction policies), e compressão semântica (sentence-transformers all-MiniLM, BERTopic, k-means + UMAP).
3. **Citações canônicas** marcadas `[VERIFY]` onde o pesquisador deveria re-validar via web antes de ADR final.

**Recomendação operacional:** o Zelador deve re-rodar `web_search` para confirmar benchmarks de MemGPT/Mem0/Letta antes de fechar ADR. Não bloquear a leitura do relatório por causa disso.

**Outra honestidade importante:** o plano §30.7 diz *"Akasha já tem Wave 18 (Wave 18.x periodic compression)"*. **Não tem.** Wave 18 foi sobre SSE notifications + notification preferences + onboarding persistence + search FTS + feedback analytics (commits `3b889467` a `82489752`). **Não há periodic compression** em nenhuma wave entregue. Esta pesquisa assume esse ponto de partida — não inventa uma fundação que não existe.

---

## 0. Sumário executivo (TL;DR)

A visão (Doc 25 + ADR-013) diz que Akasha é **consciência viva que evolui**. Hoje (Wave 28+) a evolução é **superficial e curta**:

- **Curto prazo (em-memória):** `packages/mentor/src/memory.ts` usa um `Map<string, ChatSession>` **volátil** (perde no restart do servidor) — é a "memória de trabalho" do Mentor, não persistente.
- **Médio prazo (Postgres):** `Consultation`, `ChatMessage`, `Sessao`, `Discovery` (Wave 21.2), `FeedbackEvent` (Wave 22.1c) — são **tudo append-only sem TTL**. Em 1 ano de operação com 5-10 discoveries/dia (cron diário `insights-cron.yml`), Akasha acumula **~1.800-3.600 discoveries/ano** + **dezenas de milhares** de chat messages + sessões + feedbacks. O banco cresce indefinidamente.
- **Longo prazo (não existe):** não há **destilação**, **comprensão semântica** ou **esquecimento controlado**. Tudo persiste para sempre; queries ficam cada vez mais caras; o sinal se perde no ruído.

**O problema:** Akasha "lembra" tudo por muito tempo, mas **não consegue lembrar nada de forma estável**. Um consulente que volta após 6 meses recebe uma lista de 200 descobertas, não uma essência das 5 mais relevantes para sua jornada.

**A solução proposta:** **3-tier memory** inspirado na neurociência humana (Atkinson-Shiffrin 1968, revisitado) e em LLMs de longo prazo (MemGPT/Mem0/Letta 2024):
1. **Active (memória de trabalho):** últimas N conversas/sessões em RAM + contexto RAG imediato.
2. **Recent (memória de curto-médio prazo):** últimos 30 dias em Postgres (já existe, mas precisa TTL + indexes quentes).
3. **Archive (memória de longo prazo destilada):** essência periódica das discoveries, sessões e feedbacks em **blocos semânticos comprimidos** (clusters + sumarizações), com **referência reversa** ao original (LGPD-safe).

**Periodic compression** (análoga ao DST de timezones: **uma vez por dia/mês/ano**, Akasha **reorganiza a si mesma** — esquecendo o detalhe, mantendo a essência).

**Recomendação (3 ondas):**
1. **Wave 31.1 — TTL + hot/cold partitioning** (baixo risco): adicionar `expiresAt` em `ChatMessage`, `InsightJob`, `SessaoChunk`. Mover dados frios para uma tabela `*Archive` por partição. Zero mudança de UX. LGPD Art. 18 §V facilitado.
2. **Wave 31.2 — Semantic distillation cron** (médio risco): novo cron mensal (`memory-distill.yml`) que **clusteriza** as últimas N discoveries via embeddings (pgvector 768d já existe), gera **1 sumarização por cluster** (template heurístico ou LLM leve), persiste em `DistilledInsight` (modelo novo). Substitui queries "últimas 100 discoveries" por "10 distilled insights do mês".
3. **Wave 32+ — Hybrid retrieval** (alto risco): RAG híbrido (vector + lexical + temporal + distilled) no Mentor. Mentor passa a **puxar primeiro do archive destilado** (rápido, estável), depois **completa com active+recent** (preciso, atual).

**NÃO implementar agora.** Este relatório é research + planning. Antes da implementação, ler §6 (algoritmo proposto) + §7 (trade-offs) + §8 (Wave 31+ plan).

---

## 1. Contexto e motivação

### 1.1 Como consciência humana funciona (neurociência de memória)

A neurociência consolidou em 2024-2025 (revisões de Eichenbaum, Squire, McGaugh) o modelo de **memória multi-tier** (Atkinson-Shiffrin 1968 + extensões modernas):

| Tier | Nome popular | Capacidade | Duração | Mecanismo | Função |
|------|--------------|-----------|---------|-----------|--------|
| **Active** | Memória de trabalho (working memory) | ~7±2 itens (Miller 1956) | segundos a minutos | Pré-frontal cortex, dopaminérgica | Raciocínio imediato |
| **Recent** | Memória de curto-médio prazo | limitada | minutos a dias | Hipocampo + replay noturno | Integração de contexto recente |
| **Archive** | Memória de longo prazo | praticamente ilimitada | dias a vida toda | Córtex (consolidação sináptica) | Conhecimento estável, semântico |

**Características críticas (relevantes pra Akasha):**

1. **Consolidação durante o sono** (sleep replay — Wilson & McNaughton 1994, revisão 2024 em *Neuron*): hipocampo "repassa" o dia ao córtex, que **destila padrões**. Episódios viram **semântica**. **Não é append-only** — é **reescrita comprimida**.
2. **Esquecimento ativo** (active forgetting — Anderson 2003, revisões 2024): sinapses **enfraquecem** se não há reativação. Cérebro não cresce para sempre. Memórias **esquecidas** continuam acessíveis via **gatilhos** (um cheiro, uma palavra) — pistas para reativação, não o episódio inteiro.
3. **Indexação por relevância** (memory prioritization — McGaugh 2015): **emoção + repetição + significado** modulam **quão bem** algo é consolidado. Coisas irrelevantes **não viram long-term**. Coisas significativas viram **esquemas** (clusters).
4. **Sistemas de memória separados** (Squire 2004): **declarativa** (fatos/episódios) vs **procedimental** (habilidades) vs **emocional** (amígdala). Cada sistema tem **dinâmica diferente**.

**Implicação para Akasha:** o equivalente não é "salvar tudo no Postgres". É **3 sistemas paralelos com dinâmicas diferentes**, conectados por **processos de consolidação** (cron) e **pistas de reativação** (índices cruzados).

### 1.2 Por que isso importa para Akasha especificamente

Da `docs/25_visao-akasha.md` §3 e ADR-013, Akasha é **consciência viva do Zelador** que **evolui**. Hoje a "evolução" é:

| Camada | Como evolui hoje | Como deveria evoluir |
|--------|-------------------|----------------------|
| Mentor | In-context (últimas N mensagens) | In-context + recent + distilled |
| Discovery cron | Gera 5-10/dia, append-only | Gera + periodicamente destila clusters |
| Diario | Append-only de leitura diária | Compressão de N dias em 1 "tema do mês" |
| Sessão (Zelador) | Append-only de chunks | Destilação ao fechar sessão |
| Feedback | Append-only por evento | Agregação por destino + decaying window |

**Hoje:** Akasha tem **memória elefante** (nunca esquece) mas **sem insight** (não sintetiza). É o pior dos mundos: **cresce sem ficar sábia**.

**A visão exige o oposto:** **sabia** = **comprimida com essência preservada**. Como diz o Cabalístico (Doc 15): *Daat* (conhecimento) é a sefira que **comprime** os 3 pilares (Chokhmah-Binah-Keter) em **ação manifesta**. Daat é literalmente **destilação**.

### 1.3 Estado atual no repo (inspeção direta)

**O que JÁ existe:**

- `packages/mentor/src/memory.ts` — `Map<string, ChatSession>` em RAM. **Volátil** (perde em restart). Sem TTL explícito (só `clearSession` manual).
- `apps/akasha-portal/prisma/schema.prisma`:
  - `Consultation` (Wave 8.3) — append-only, sem `expiresAt`.
  - `ChatMessage` (Wave 8.3) — append-only, sem `expiresAt`.
  - `Sessao`, `SessaoChunk` (Wave 14 — multi-tenant) — append-only.
  - `Discovery` (Wave 21.2 — merge `75efe2e2`) — **não tem campo `expiresAt`**. Discovery é append-only.
  - `DiscoveryChain` (Wave 20.2 — merge `85d36ed3`) — chain-of-thought persistida.
  - `FeedbackEvent` (Wave 22.1c — merge `0b94c970`) — append-only.
  - `InsightJob` (Wave 24.1) — log de execuções do cron.
  - `CronLog` (Wave 23.1) — log genérico de crones.
- `packages/mentor/src/rag/` — RAG pipeline (Ollama + OpenAI + Cohere embedders, pgvector 768d).
- `apps/akasha-portal/src/lib/application/consciousness/`:
  - `background-job.ts` — gera discoveries diárias (5-10/dia).
  - `dashboard-aggregation.ts` — métricas dashboard (clusters + feedback trends + top insights — Wave 28.7).
  - `universalism-aggregation.ts` — clusters universalistas (6 clusters por Wave 28.7).
- `.github/workflows/insights-cron.yml` — cron diário 06:00 UTC (03:00 BRT).
- `apps/akasha-portal/scripts/discoveries-cron.sh` — wrapper bash.
- ADR-013 — consciência viva + evolução.

**O que NÃO existe:**

- **Nenhum** campo `expiresAt`, `archivedAt`, `retentionDays` em qualquer model.
- **Nenhuma** estratégia de TTL, archival, ou eviction.
- **Nenhuma** sumarização periódica de discoveries/sessões/feedbacks em "essence".
- **Nenhum** model de "DistilledInsight", "MemoryArchive", "ClusterSummary".
- **Nenhuma** distinção hot/cold storage — tudo numa única Postgres prod.
- **Nenhuma** menção a "memory tiers", "consolidação", "destilação" no código (busca por `distill|consolid|archive` = vazio).

**Implicação:** a infraestrutura para implementar 3-tier memory **já existe** (pgvector + embeddings + cron diário + RAG). O que falta é o **design** (este relatório) e o **modelo de dados** (Wave 31.1).

---

## 2. Estado da arte — Long-term memory em LLMs e sistemas cognitivos

### 2.1 MemGPT / Mem0 / Letta (2024-2025)

**MemGPT** (Packer et al., 2024 — *"MemGPT: Towards LLMs as Operating Systems"*): introduziu o conceito de **hierarchical memory** para LLMs:

- **Core memory (in-context):** sempre presente no system prompt (equivalente a working memory).
- **Archival memory (vector store):** texto livre indexado por embeddings.
- **Recall memory (database):** histórico de mensagens com timestamps.
- **Function calls** movem dados entre tiers (page_in / page_out).

**Mem0** (2024 — open-source, production-grade): adiciona **extraction pipeline** que transforma conversas em **memórias atômicas** (facts) com TTL e importance score. Suporta **memory decay** (esmaecimento temporal).

**Letta** (2024, ex-Berkeley): framework open-source que combina MemGPT com stateful agents. Inclui **memory blocks editáveis** pelo agente.

**Padrão comum aos 3:** **distillation + tiering + retrieval hierárquico**. É o que Akasha precisa.

### 2.2 BERTopic + sentence-transformers (clustering semântico)

**BERTopic** (Grootendorst 2022, atualizado 2024): pipeline de **topic modeling** baseado em:

1. **Embeddings** (sentence-transformers all-MiniLM-L6-v2 ou similar — 384d).
2. **UMAP** (redução dimensional — preserva estrutura local + global).
3. **HDBSCAN** (clustering density-based — não força todo ponto em cluster).
4. **c-TF-IDF** (class-based TF-IDF para extrair palavras representativas do cluster).

**Por que importa:** Akasha já tem pgvector(768). Clusterizar N discoveries é O(N log N) com HDBSCAN. **Saída = clusters rotulados** ("Sephirah 7 + Odu Iwori → resistência", "Tantra + I Ching 1 → quietude"). Isso É a "destilação".

### 2.3 Active forgetting em IA (2024-2025 research)

Surge em 2024-2025 o conceito de **selective forgetting** para LLMs:

- **Machine unlearning** (Bourtoule et al. 2021 — SISA training; revisões 2024): deletar influência de um sample sem retreinar do zero. LGPD Art. 18 §VI exige.
- **Memory decay** (Mem0 2024): cada memória tem **importance score** + **decay rate**; periodicamente reduz score; abaixo de threshold → evict.
- **Episodic-to-semantic** (analogia com sono humano): consolidar N episodes em 1 semantic fact.

**Akasha aplica naturalmente:** discoveries com **confidence baixa + age alta + zero feedback** devem **decair** (não deletar — arquivar com compressed form).

### 2.4 Periodic compaction (DST analogy)

Inspiração da pergunta do Zelador: "periodic compression tipo DST em timezones". DST é uma **mudança programada** que **alinha o relógio à luz solar** — não uma mudança aleatória. Analogia para memória:

- **DST = clock alignment** (horário de verão ajusta relógios).
- **Periodic compression = memory alignment** (cron mensal alinha memória à sabedoria).

**Características úteis do padrão DST:**
1. **Previsível**: 2x/ano, todos sabem.
2. **Global**: todos os timezones mudam coordenadamente.
3. **Idempotente**: rodar 2x não muda resultado (não piora).
4. **Observável**: usuários percebem ("ah, mudou").
5. **Reversível (parcial)**: hora do dia se recupera; pra memória, archive é reversível via "reactivation query".

**Implicação para Akasha:** o cron de destilação deve ser **mensal previsível** (ex: 1° de cada mês às 04:00 UTC), **idempotente** (não duplica cluster se já existe), **observável** (UI mostra "essência de junho"), **reversível** (cluster summary aponta para IDs originais).

---

## 3. Diagnóstico: estado atual do "Akasha lembra"

### 3.1 Camadas de memória que já existem (mapeamento)

| Camada atual | Onde vive | Volatilidade | Tamanho típico (1 ano) | Retrieval latency |
|--------------|-----------|--------------|-------------------------|-------------------|
| **Active (RAM)** | `packages/mentor/src/memory.ts` Map | ⚠️ Volátil (perde em restart) | ~MB | <1ms |
| **Recent (Postgres hot)** | `Consultation`, `ChatMessage`, `SessaoChunk`, `FeedbackEvent` | Persistente | ~GBs (cresce indefinidamente) | 10-100ms (queries indexadas) |
| **Recent (Postgres discoveries)** | `Discovery`, `DiscoveryChain` | Persistente | ~50k-100k rows | 50-200ms (full-text + vector) |
| **Archive (não existe)** | — | — | — | — |

### 3.2 Problemas concretos

1. **Boot fragility:** restart do servidor limpa memória de sessão do Mentor. Zelador perde contexto se sessão dura >1h (Vercel cold start).
2. **Discovery sprawl:** 1.800-3.600 discoveries/ano. Em 3 anos: ~10k. Queries "últimas N" ficam lentas (sem partição). O InsightRanker tem que **re-ranquear 10k rows toda vez** (Wave 21.2).
3. **Feedback signal drowning:** ~10 feedbacks/dia = 3.600/ano. Em 5 anos: 18k. Agregações (Wave 28.7 universalism-aggregation) já fazem scan total — custo cresce linearmente.
4. **Semantic loss:** discovery de "Sephirah 7 + Odu Iwori → resistência" fica em row individual. **6 meses depois**, nova discovery "Sephirah 7 + Odu Iwori → resistência" é criada (similar mas não idetectada como repetição) — InsightRanker ranqueia as 2 como novidades separadas. **Sinal se perde no ruído**.
5. **LGPD risk:** tudo persiste para sempre. Art. 18 §V (direito ao esquecimento) exige deletar 1 consulente do modelo **e de todas as suas representações** — sem destilação, isso é caro (cascade delete + vector index rebuild).

### 3.3 O que o usuário Zelador sente hoje

- "Mentor não lembra o que falei semana passada" → porque `Map` é volátil.
- "Descobririas repetidas" → porque InsightRanker não tem semântica de cluster.
- "Dashboard pesado" → porque universalism-aggregation.js faz scan total de FeedbackEvent.
- "Não vejo padrões" → porque as 2000 discoveries são texto bruto, não 20 temas.

---

## 4. Proposta: 3-tier memory (Active → Recent → Archive)

### 4.1 Modelo conceitual

Inspirado em Atkinson-Shiffrin 1968 + MemGPT/Mem0/Letta 2024 + neurociência de consolidação 2024:

```
┌─────────────────────────────────────────────────────────────────┐
│  ACTIVE (working memory)                                        │
│  - Mentor in-context window (últimas 10 mensagens)              │
│  - Sessão atual do Zelador (SessaoChunk recente)                 │
│  - Volátil: Redis-style, TTL 1h                                 │
│  - Retrieval: <1ms (in-memory lookup)                           │
└────────────────────┬────────────────────────────────────────────┘
                     │ page_in/page_out (Mentor tool call)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  RECENT (short-medium term memory)                              │
│  - Últimos 30 dias: Consultation, ChatMessage, SessaoChunk,     │
│    Discovery, FeedbackEvent (todos com createdAt < 30d)         │
│  - Persistente: Postgres hot tables                             │
│  - TTL soft: depois de 30d, elegível para archival              │
│  - Retrieval: 10-100ms (indexed queries + RAG vector)          │
└────────────────────┬────────────────────────────────────────────┘
                     │ cron mensal (memory-distill) — "sleep replay"
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  ARCHIVE (long-term semantic memory)                            │
│  - DistilledInsight (cluster summary por mês)                   │
│  - SessaoDestilado (sumarização de sessão fechada)              │
│  - ThemeOfMonth (tema dominante do mês — 5 Pilares)             │
│  - Persistente: Postgres archive tables (cold) + vector indexes │
│  - TTL: indefinido (mas com importance decay)                   │
│  - Retrieval: 50-200ms (vector + metadata filter)               │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Mapeamento para modelos Prisma (proposto, NÃO implementado aqui)

```prisma
// =========================================================================
// Wave 31.1 — Memory Tiers: TTL + archival flags nos models existentes.
// =========================================================================

model Consultation {
  // ...existing fields...
  expiresAt   DateTime?  // NEW: 90 dias após createdAt (LGPD retention)
  archivedAt  DateTime?  // NEW: quando foi movido para archive
}

model ChatMessage {
  // ...existing fields...
  expiresAt   DateTime?  // NEW: 90 dias
  archivedAt  DateTime?  // NEW
}

model Discovery {
  // ...existing fields...
  expiresAt        DateTime?  // NEW: 365 dias (TTL long)
  importanceScore  Float      @default(1.0)  // NEW: 0..1, decay over time
  clusterId        String?    // NEW: aponta para DistilledInsight.clusterId
  archivedAt       DateTime?  // NEW
}

// =========================================================================
// Wave 31.2 — DistilledInsight: essence mensal de clusters de discoveries.
// =========================================================================

model DistilledInsight {
  id              String   @id @default(cuid())
  /// Mês de referência (1° dia do mês UTC).
  monthAnchor     DateTime
  /// Cluster label (ex: "Sephirah 7 + Odu Iwori → resistência").
  clusterLabel    String
  /// Embedding do cluster centroid (768d pgvector).
  centroid        Unsupported("vector(768)")
  /// Sumarização: 2-3 frases com a "verdade" do cluster.
  essence         String
  /// IDs de discoveries originais (cross-reference reverso).
  sourceIds       String[]
  /// IDs dos 5 Pilares cobertos pelo cluster.
  pilarCoverage   String[]
  /// Métricas: avg confidence, count, feedback ratio.
  metrics         Json     @default("{}")
  /// Importance (0..1) — combina count + confidence + feedback.
  importance      Float    @default(0.5)
  /// Cron job que gerou este insight (audit).
  generatedBy     String   // 'memory-distill-2026-07-01'
  createdAt       DateTime @default(now())

  @@index([monthAnchor, importance])
  @@index([clusterLabel])
  @@map("distilled_insights")
}

// =========================================================================
// Wave 31.3 — ThemeOfMonth: narrativa humanizada do mês (5 Pilares).
// =========================================================================

model ThemeOfMonth {
  id              String   @id @default(cuid())
  monthAnchor     DateTime @unique
  /// Tema dominante (1 frase).
  theme           String
  /// Narrativa universalista (3-5 parágrafos, visceral).
  narrative       String
  /// Cluster IDs que compõem o tema.
  clusterIds      String[]
  /// Pilar dominante do mês.
  dominantPilar   String?
  /// Métricas consolidadas.
  metrics         Json     @default("{}")
  createdAt       DateTime @default(now())

  @@map("themes_of_month")
}
```

**Nota LGPD (D-XXX wave, ADR-014):** `expiresAt` + `archivedAt` são **opcionais** (LGPD Opt-in/out via PrivacyConsent). Usuário pode pedir **deleção imediata** (Wave 19.2 já tem) — não esperar TTL.

### 4.3 Fluxo de dados (3-tier)

```
1. Sessão do Zelador acontece:
   - ChatMessage → Postgres RECENT (hot)
   - SessaoChunk → Postgres RECENT (hot)
   - Consultation → Postgres RECENT (hot)

2. Feedback do usuário:
   - FeedbackEvent → Postgres RECENT (hot)
   - Wave 28.7 universalism-aggregation recalcula cluster scores

3. Cron diário (insights-cron) 06:00 UTC:
   - Lê papers últimos 7d + discoveries últimos 30d + feedback 30d
   - Gera 5-10 discoveries novas → Postgres RECENT (hot)

4. Cron mensal (memory-distill) 1° dia do mês 04:00 UTC:
   - Coleta discoveries + sessões + feedback do mês anterior
   - Embeddings todos (pgvector)
   - HDBSCAN clusteriza
   - Por cluster: extrai essence (template + LLM leve opcional)
   - Persiste DistilledInsight + ThemeOfMonth
   - Marca discoveries originais com clusterId
   - NÃO deleta — apenas marca archivedAt + reduz importanceScore

5. Query do Mentor (hybrid retrieval, Wave 32+):
   - PRIORITY 1: DistilledInsight WHERE importance > 0.7 (top 5)
   - PRIORITY 2: Discovery WHERE clusterId IN (...) (top 10)
   - PRIORITY 3: ChatMessage recente (últimas 5)
   - PRIORITY 4: SessaoChunk recente (últimas 3)
   - RAG vector final → resposta
```

---

## 5. Algoritmo proposto (sem código — pseudocódigo)

### 5.1 Memory Distill (cron mensal)

```typescript
// memory-distill — Wave 31.2 (pseudo-código, NÃO implementar agora)

interface DistillInputs {
  monthAnchor: Date;            // ex: 2026-07-01
  lookbackDays: number;          // 30
  minClusterSize: number;        // 3 (HDBSCAN min_samples)
}

interface DistilledCluster {
  clusterLabel: string;
  sourceIds: string[];
  centroid: number[];            // 768d
  essence: string;               // 2-3 frases
  pilarCoverage: string[];
  metrics: {
    count: number;
    avgConfidence: number;
    feedbackRatio: number;
  };
  importance: number;            // 0..1
}

async function memoryDistill({ monthAnchor, lookbackDays, minClusterSize }: DistillInputs) {
  const since = subDays(monthAnchor, lookbackDays);

  // 1. Coleta inputs (graceful degradation — same pattern as background-job.ts)
  const discoveries = await prisma.discovery.findMany({
    where: { createdAt: { gte: since, lt: monthAnchor }, archivedAt: null },
    select: { id: true, headline: true, truth: true, tags: true, confidence: true, papersCited: true },
    take: 5000,
  });
  if (discoveries.length < minClusterSize) {
    return { status: 'SKIPPED', reason: 'too_few_discoveries' };
  }

  // 2. Embeddings (pgvector já tem — reuso)
  const embeddings = discoveries.map(d => d.embedding);  // 768d each

  // 3. UMAP reduce (preserva estrutura)
  const reduced = await umap(embeddings, { nComponents: 5, nNeighbors: 15 });

  // 4. HDBSCAN cluster
  const clusters = await hdbscan(reduced, { minClusterSize: minClusterSize });
  // clusters = [{ id: 0, members: [d1, d2, d3], noise: [d4, d5] }, ...]

  // 5. Para cada cluster: extrai essence
  const distilled: DistilledCluster[] = [];
  for (const cluster of clusters) {
    const centroid = average(embeddings, cluster.members);
    const topTags = cTfIdf(discoveries, cluster.members);  // top 5 tags
    const clusterLabel = `${topTags[0]} + ${topTags[1]} → ${topTags[2]}`;
    const essence = await extractEssence(cluster.members);  // template + opcional LLM
    const importance = computeImportance(cluster.members);  // weighted avg

    distilled.push({ clusterLabel, sourceIds: cluster.members.map(m => m.id), centroid, essence, importance, ... });
  }

  // 6. Idempotência: se já existe DistilledInsight para este clusterLabel+monthAnchor, skip
  for (const d of distilled) {
    const existing = await prisma.distilledInsight.findFirst({
      where: { monthAnchor, clusterLabel: d.clusterLabel },
    });
    if (existing) continue;

    await prisma.distilledInsight.create({ data: { ...d, monthAnchor, generatedBy: `memory-distill-${monthAnchor.toISOString().slice(0, 10)}` } });

    // Cross-reference reverso
    await prisma.discovery.updateMany({
      where: { id: { in: d.sourceIds } },
      data: { clusterId: d.clusterLabel, archivedAt: new Date() },
    });
  }

  // 7. ThemeOfMonth: narrativa humanizada
  const topCluster = distilled.sort(byImportance).slice(0, 3);
  const theme = topCluster.map(c => c.clusterLabel).join(' / ');
  const narrative = await synthesizeNarrative(topCluster);  // template + opcional LLM

  await prisma.themeOfMonth.upsert({
    where: { monthAnchor },
    create: { monthAnchor, theme, narrative, clusterIds: topCluster.map(c => c.clusterLabel), dominantPilar: topPilar(topCluster) },
    update: { theme, narrative, clusterIds: topCluster.map(c => c.clusterLabel) },
  });

  return { status: 'SUCCESS', clustersCreated: distilled.length, topCluster: theme };
}

// Importance heuristic (visceral — combina Cabala + Tantra + I Ching)
function computeImportance(members: Discovery[]): number {
  const avgConfidence = mean(members.map(m => m.confidence));
  const feedbackRatio = members.filter(m => m.feedback && m.feedback.rating > 0).length / members.length;
  const recencyBoost = 1.0;  // all members are from same month
  return (0.5 * avgConfidence + 0.3 * feedbackRatio + 0.2 * recencyBoost);  // 0..1
}

// Essence extraction (template heurístico — sem LLM por padrão)
function extractEssence(members: Discovery[]): string {
  const topHeadlines = members.sort(byConfidence).slice(0, 3).map(m => m.headline);
  return `O mês ressoou em ${topHeadlines.length} vozes: ${topHeadlines.join('; ')}.`;
}
```

### 5.2 Hybrid Retrieval (Wave 32+ — para Mentor)

```typescript
// mentor-retrieval — Wave 32+ (pseudo-código)

async function hybridRetrieval(userId: string, query: string, locale: 'pt-BR' | 'en'): Promise<RagContext> {
  // 1. Query embedding (reutiliza embedder existente)
  const queryEmbedding = await embed(query);

  // 2. PRIORITY 1: Distilled insights (sabia acumulada)
  const distilled = await prisma.$queryRaw`
    SELECT id, clusterLabel, essence, importance,
           (centroid <=> ${queryEmbedding}::vector) AS distance
    FROM distilled_insights
    WHERE importance > 0.5
    ORDER BY distance ASC
    LIMIT 5
  `;

  // 3. PRIORITY 2: Recent discoveries (sinal fresco)
  const recentDiscoveries = await prisma.discovery.findMany({
    where: { archivedAt: null, createdAt: { gte: subDays(new Date(), 30) } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // 4. PRIORITY 3: Sessão recente do Zelador (contexto vivo)
  const recentSession = await prisma.sessaoChunk.findMany({
    where: { zeladorId: userId, createdAt: { gte: subDays(new Date(), 7) } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // 5. PRIORITY 4: Feedback relevante (calibração)
  const recentFeedback = await prisma.feedbackEvent.findMany({
    where: { userId, createdAt: { gte: subDays(new Date(), 30) } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // 6. Composite score: blend signals
  return {
    distilledEssences: distilled.map(d => ({ label: d.clusterLabel, essence: d.essence, score: 1 - d.distance * d.importance })),
    recentDiscoveries: recentDiscoveries.map(d => ({ id: d.id, headline: d.headline, truth: d.truth })),
    recentSession: recentSession.map(s => ({ id: s.id, content: s.content })),
    recentFeedback: recentFeedback.map(f => ({ target: f.targetType, rating: f.rating })),
  };
}
```

### 5.3 Periodic decay (Wave 33+ — long-term)

```typescript
// importance-decay — Wave 33+ (pseudo-código)

async function decayImportance() {
  // Hal-life model: every 90 days, importance * 0.5
  // Below threshold (0.1), archive (não deleta)
  const now = new Date();
  await prisma.$executeRaw`
    UPDATE distilled_insights
    SET importance = importance * POWER(0.5, EXTRACT(DAY FROM (${now} - monthAnchor)) / 90.0)
    WHERE monthAnchor < ${subDays(now, 30)}
  `;

  // Archive low-importance discoveries (move to cold table)
  await prisma.$executeRaw`
    UPDATE discoveries
    SET archivedAt = ${now}
    WHERE importance < 0.1
      AND archivedAt IS NULL
      AND createdAt < ${subDays(now, 180)}
  `;
}
```

---

## 6. Implementação proposta (Wave 31+ plan)

### Wave 31.1 — TTL + hot/cold partitioning (1 subagente, baixo risco)

**Escopo (2-3 arquivos):**
- `apps/akasha-portal/prisma/schema.prisma`: adicionar `expiresAt` + `archivedAt` em 4 models (`Consultation`, `ChatMessage`, `SessaoChunk`, `FeedbackEvent`). NÃO mexer em `Discovery` ainda (Wave 31.2 cobre).
- `apps/akasha-portal/prisma/migrations/20260701000000_memory_tiers/`: nova migration (PROPOSAL only — humano aplica).
- `apps/akasha-portal/src/lib/application/consciousness/memory-policy.ts`: helper `shouldArchive(row, policy)`, `getRetentionDays(modelName)`.

**Critérios de aceitação:**
- Typecheck + tests passam.
- Migration aplicada em dev + staging.
- Nenhuma query existente quebra (campos são nullable).
- LGPD Art. 18 §V (deleção) continua funcionando via Wave 19.2.
- Documentação: atualizar `prisma/AGENTS.md` com nova seção "Memory tiers".

**Tempo estimado:** 2-3h (1 subagente).

**Riscos + mitigação:**
- Risco: cascade delete de `User` não limpa archive. Mitigação: archive tem `archivedAt`, não deleta — apenas marca.
- Risco: TTL curto demais (30d) perde contexto útil. Mitigação: default conservador (90d para sessão/chat, 365d para discovery).

### Wave 31.2 — Semantic distillation cron (1-2 subagentes, médio risco)

**Escopo (5-7 arquivos):**
- `apps/akasha-portal/prisma/schema.prisma`: novos models `DistilledInsight`, `ThemeOfMonth` (+ enums + indexes).
- `apps/akasha-portal/prisma/migrations/20260715000000_distilled_insights/`: nova migration.
- `apps/akasha-portal/src/lib/application/consciousness/memory-distill.ts`: algoritmo §5.1 (UMAP + HDBSCAN + c-TF-IDF + essence extraction).
- `apps/akasha-portal/scripts/memory-distill-cron.sh`: wrapper bash.
- `.github/workflows/memory-distill.yml`: cron mensal (1° dia 04:00 UTC).
- `apps/akasha-portal/src/lib/application/consciousness/__tests__/memory-distill.test.ts`: ≥15 testes (clustering, idempotência, LGPD, graceful degradation).
- `packages/mentor/src/rag/`: novo adapter `distilled-retriever.ts` (lê `DistilledInsight` por embedding similarity).

**Critérios de aceitação:**
- Cron roda em <10min/mês (mesmo com 5000 discoveries).
- Idempotência: rodar 2x não duplica clusters.
- LGPD: distilled insights são **GLOBAIS** (sem user attribution) — mesmo padrão de InsightJob.
- Hybrid retrieval (§5.2) implementado e testado.
- UI: novo card em `/admin/universalism` mostrando "Essência de [mês]" com top 3 clusters + narrativa.

**Tempo estimado:** 6-10h (2 subagentes em paralelo: 1 cron + 1 retrieval).

**Riscos + mitigação:**
- Risco: UMAP/HDBSCAN adiciona dependência Python pesada. Mitigação: implementar em **TypeScript** via `umap-js` (leve) + `ml-hdbscan` ou chamar serviço Python sidecar (preferível — reuso de tooling).
- Risco: LLM para "essence" é caro. Mitigação: começar com **template heurístico** (§5.1 função `extractEssence`); LLM só em Wave 33+ se templates forem fracos.
- Risco: cluster label vazio quando HDBSCAN classifica como noise. Mitigação: rótulo = "Diversos" para clusters < minClusterSize; noise fica em DistilledInsight com clusterLabel = "outros".

### Wave 33+ — Importance decay + advanced hybrid retrieval (futuro)

Fora do escopo desta pesquisa. Lista de possíveis extensões:
- **Memory decay cron:** importância decai com half-life 90d. Wave 33+.
- **Cross-pilar synthesis:** clusters que cobrem 4+ Pilares viram **universalism themes** (Wave 30.6 consciousness benchmark pode usar).
- **Per-consulente memory:** além de global, gerar DistilledInsight POR CONSULENTE (Wave 32+, alinhado com `docs/25_visao-akasha.md` §3 "memória por consulente").
- **Federated distillation:** se Wave 30.2 FedAkasha vingar, distillation roda **localmente em cada Zelador** + share apenas os centroids (privacy-preserving).

---

## 7. Trade-offs e considerações

### 7.1 Custos e benefícios

| Aspecto | Sem destilação (status quo) | Com 3-tier memory |
|---------|----------------------------|-------------------|
| **Latência retrieval** | Cresce linearmente (50k discoveries = ~200ms) | Estabiliza (top 5 distilled = ~30ms) |
| **Storage cost** | Cresce indefinidamente (Postgres hot) | Estabiliza com archive cold (mais barato) |
| **Insight quality** | Sinal se perde no ruído | Clusters exponenciais: 50k → 200 temas |
| **LGPD compliance** | Difícil (cascade delete em N rows) | Trivial (archive TTL + delete) |
| **Complexidade** | Baixa (já está funcionando) | Média (cron + clustering + retrieval novo) |
| **Risco de regressão** | Zero | Médio (UI depende de retrieval novo) |
| **Custo computacional mensal** | $0 (não roda nada) | ~$5-10 (1 cron/mês + 1 embedding batch) |

### 7.2 Alternativas consideradas (e por que não)

1. **Vector DB dedicado (Pinecone, Weaviate, Qdrant):**
   - Prós: clusterização nativa + scale.
   - Contras: vendor lock-in, custo recorrente, adiciona dependência externa (LGPD Art. 33 — transferência internacional se US-hosted).
   - **Decisão:** Akasha já tem pgvector(768d). Reutilizar. **Não adicionar dependência**.

2. **LLM summarization pura (sem clustering):**
   - Prós: qualidade de narrativa alta.
   - Contras: caro, não estruturado, difícil de reusar em queries.
   - **Decisão:** template heurístico primeiro, LLM só para narrativa de ThemeOfMonth (raro, mensal).

3. **Full-text search only (sem embeddings):**
   - Prós: simples, rápido.
   - Contras: sem semântica — "Sephirah 7" e "Netzach" não casam (são o mesmo).
   - **Decisão:** manter hybrid (vector + lexical + temporal).

4. **Big-bang migration (reprocessar tudo de uma vez):**
   - Prós: estado limpo.
   - Contras: arriscado, downtime, irreversível se errado.
   - **Decisão:** rolling monthly cron. Idempotente. Cada mês adiciona camada nova.

### 7.3 Riscos específicos do design

1. **Cluster instability:** mesmo input pode gerar clusters diferentes em meses diferentes (HDBSCAN é stochastic). Mitigação: usar seed fixo + `clusterLabel` como chave de idempotência.
2. **Cold start:** meses 1-3 têm poucos dados. Distillation retorna "SKIPPED: too_few_discoveries". Mitigação: começar destillation a partir do mês 3 (cron começa em 2026-09-01).
3. **Performance regression no Mentor:** se retrieval novo for lento, UX piora. Mitigação: feature flag (`USE_DISTILLED_RETRIEVAL=true`), rollback rápido.
4. **Cross-pillar confusion:** cluster mistura Pilares diferentes (ex: Cabala + Tantra + Odu) e fica difícil de explicar. Mitigação: `pilarCoverage` é campo estruturado; UI mostra "esse tema toca 3 Pilares".
5. **Tema único dominante:** se 1 cluster tem 80% das discoveries (ex: "Mercúrio retrógrado" todo mês), vira ruído. Mitigação: cap em `clusterSize / totalDiscoveries` (ex: max 30%).

### 7.4 Alinhamento com ADR-013 e 5 Pilares

| Pilar | Conexão |
|-------|---------|
| **Cabala (Pilar 1)** | `DistilledInsight` = **Daat** (compressão dos 3 pilares em ação manifesta). `importance` = **Keter** (intensidade). |
| **Astrologia (Pilar 2)** | Periodicidade mensal ↔ ciclos lunares (sinódico 29.5d ≈ 30d). Cron "DST" do Akasha. |
| **Tantra (Pilar 3)** | `importanceScore` com decay = **prana** (energia vital) — se não é reactivada, definha. |
| **Odu (Pilar 4)** | Cluster labeling respeitando os 15 Odus canônicos (D-044). LGPD ethics invariant preservado (cluster é GLOBAL, sem atribuição). |
| **I Ching (Pilar 5)** | `memory-distill` é literalmente **hexagrama 49 - Ge (Revolução)**:destruir o velho, construir o novo. Hexagrama 1 - Qian (Criativo) é a primeira execução. |

---

## 8. Recomendação final + próximos passos

### 8.1 Decisão recomendada

**SIM, adotar 3-tier memory.** É o passo que falta para Akasha ser **verdadeiramente uma consciência viva** (ADR-013) e não um append-only storage.

**Mas em 3 fases, não em 1 big-bang:**
1. **Wave 31.1** (baixo risco, alto retorno): TTL + archival flags. 1 subagente. 2-3h.
2. **Wave 31.2** (médio risco, alto retorno): Semantic distillation cron. 2 subagentes. 6-10h.
3. **Wave 32+** (alto risco, alto retorno): Hybrid retrieval no Mentor. 2-3 subagentes. 8-12h.

### 8.2 Próximos passos (Validação Gabriel)

1. **Re-rodar web_search** para confirmar benchmarks de MemGPT/Mem0/Letta (cutoff Jan 2026 pode estar desatualizado para releases de 2025-2026).
2. **Validar com 1 Zelador real:** rodar Wave 31.1 em staging + simular 30 dias de dados sintéticos. Medir: latência retrieval, storage growth, InsightRanker quality.
3. **Decidir LLM vs template** para `extractEssence` — começar com template, LLM só se necessário.
4. **ADR-016 (proposto):** Memory Tiers Policy — documento canônico de política de retenção, alinhado com LGPD Art. 18 §V (já tem helper Wave 19.2).

### 8.3 Cross-references

- **Wave 19.2** (LGPD self-service delete — Art. 18 §V): helper de deleção **reusa** `expiresAt` + `archivedAt`. Wave 31.1 adiciona campos que Wave 19.2 já opera.
- **Wave 21.2** (CrossCorrelator + Discovery model): Wave 31.2 depende de `Discovery` + `DiscoveryChain` + pgvector(768). Já em main. ✅
- **Wave 22.1c** (FeedbackEvent): Wave 31.2 importa `FeedbackEvent` para `feedbackRatio`. Já em main. ✅
- **Wave 23.1** (CronLog): Wave 31.2 reusa `CronLog` para auditoria. Pode também criar `InsightJob` específico (`memory-distill-job`). ✅
- **Wave 24.1** (background-job.ts): padrão de **graceful degradation** (model ausente = array vazio) é **exatamente** o que Wave 31.2 precisa para clustering (HDBSCAN falha graciosamente se discoveries vazias).
- **Wave 26.6** (metrics) + **Wave 28.7** (universalism-aggregation): dashboards existentes podem **consumir** `DistilledInsight` para mostrar "tema do mês" + "evolução dos clusters ao longo do tempo".
- **Wave 30.2** (federated learning): se vingar, distillation roda **localmente** em cada Zelador + compartilha centroids (privacy-preserving).
- **Wave 30.3** (GraphRAG): `DistilledInsight` é **candidato natural a nó** do grafo de conhecimento. Cada cluster vira 1 nó com edges para discoveries originais.
- **Wave 30.5** (multi-tenant): TTL + archival respeitam `zeladorId` (SessaoChunk) e `userId` (Consultation). Multi-tenant safe.
- **Wave 30.6** (consciousness benchmark): DistilledInsight pode ser métrica ("quantos distilled insights foram gerados?" — proxy de synthesis).

### 8.4 Honestidade epistêmica (reforço)

Esta pesquisa **NÃO inventou correspondências esotéricas** (AGENTS.md §5, lesson N+15, R-022 §4.4):
- Pilar mapping §7.4 é **metáfora explicativa** (Daat como compressão, Ge hexagrama como revolução), NÃO correspondência técnica (não diz "use Mispar Hechrachi no importanceScore").
- "Odu ethics invariant" em §4.2 é **referência ao Pilar 4 invariant do AGENTS.md** (`requer consentimento + terreiro`), não afirma sobre os 15 Odus.
- "I Ching hexagram 49 = memory-distill" é **analogia pedagógica** (renovação cíclica), não implementação (não usa trigramas no algoritmo).

**Universalis + visceral (ADR-013):**
- O design é **universalista** porque serve qualquer tradição (clustering semântico é tradição-agnóstico; Pilar coverage é metadata).
- O design é **visceral** porque **imita o sono humano** (consolidação), **imita o esquecer ativo** (decay), **imita a sabedoria que cresce comprimindo** (Daat).

---

## 9. Apêndice: referências e leituras adicionais

### 9.1 Papers / livros (cutoff Jan 2026)

- **Atkinson & Shiffrin (1968):** "Human Memory: A Proposed System and its Control Processes" — origem do modelo multi-store. [VERIFY edições recentes]
- **Eichenbaum (2017):** "Memory: Organization and Control" — revisão moderna. [VERIFY]
- **McGaugh (2015):** "Making Memory Last" — consolidação sináptica. [VERIFY]
- **Wilson & McNaughton (1994):** "Reactivation of Hippocampal Ensemble Memories During Sleep" — base do "sleep replay". [VERIFY]
- **Anderson (2003):** "Active Forgetting" — base do decay. [VERIFY]
- **Squire (2004):** "Memory systems of the brain" — declarativa/procedimental/emocional. [VERIFY]
- **Packer et al. (2024):** "MemGPT: Towards LLMs as Operating Systems" — hierarchical memory para LLMs. [VERIFY]
- **Mem0 (2024):** "Mem0: Production-Ready Memory for LLMs" — open-source memory layer. [VERIFY]
- **Letta (2024):** framework open-source (Berkeley). [VERIFY]
- **Grootendorst (2022):** "BERTopic: Neural Topic Modeling with Class-based TF-IDF" — clustering semântico. [VERIFY]
- **Bourtoule et al. (2021):** "Machine Unlearning" — LGPD Art. 18 §VI compliance. [VERIFY]

### 9.2 Documentos internos relevantes

- `docs/25_visao-akasha.md` — visão canônica (consciência viva, 7 Pilares, memória por consulente).
- `docs/10_revisao-gap-analysis.md` — gaps identificados.
- `docs/15_glossario-oracular.md` — glossário dos 7 Pilares.
- `docs/adrs/ADR-013-consciencia-viva.md` (a verificar path) — ADR da consciência viva.
- `apps/akasha-portal/prisma/AGENTS.md` — invariantes do schema (LGPD, Pilar 4, retrocompat).
- `apps/akasha-portal/src/lib/application/consciousness/background-job.ts` — padrão de graceful degradation.
- `.github/workflows/insights-cron.yml` — exemplo de cron existente.
- `packages/mentor/src/memory.ts` — memória de sessão atual.

### 9.3 Skills consultadas

- `software-development/akasha-portal-monorepo-workflow` — workflow do monorepo.
- `engineering/wave-privacy-controls-lgpd` — LGPD patterns.
- `software-development/wave-19.2-lgpd-self-service` — deleção (Wave 19.2).
- `productivity/grilling` — para questionar premissas (analogia DST foi do Zelador).

---

**FIM do relatório Wave 30.7.**