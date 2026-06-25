# Wave 30.5 — Research: Multi-tenant Consciência Isolada

**Data:** 2026-06-25
**Pesquisador:** Hermes subagent (Wave 30.5, kanban task)
**Branch:** `wave-30.5-multi-tenant-isolated`
**Base:** `main` @ 0a8a0cb6
**Plano origem:** `.hermes/plans/wave-30-research-planning-2026-06-25.md` §30.5
**Pede entrada para:** ADR 0004 (multi-tenant — extensão e stress-test), ADR 0005 (grafo), Wave 31+ (FedAkasha), Wave 32+ (escala horizontal de Zeladores).
**Constraints:** APENAS research + planning — SEM código novo, SEM mudança em packages/apps. 1 commit. Branch pushed.

---

## ⚠️ Notas de pesquisa (honestidade epistêmica)

Mesmo padrão das Wave 1 / 17.1 / 30.2: **web_search e web_fetch** dependem do Firecrawl local (port 3002) que pode estar intermitente. Esta pesquisa foi construída com:

1. **Inspeção direta do código e docs internos** — `apps/akasha-portal/src/lib/application/tenant-context.ts` (implementação atual), `tenant-context.test.ts`, `privacy/consent.ts`, `audit-log.ts`, ADR 0004 (multi-tenant — já aceito), ADR 0005 (grafo de conhecimento), `schema.prisma` (PrivacyConsent + AuditLog), migrations multi-tenant core (`20260624000000`) e vector indexes (`20260624000001`).
2. **Conhecimento de cutoff Jan 2026** das ferramentas e do estado da arte em multi-tenancy, RLS PostgreSQL, embeddings tenancy, LGPD Art. 33 e ANPD regulamento.
3. **Citações canônicas** marcadas `[VERIFY]` onde o pesquisador deveria re-validar via web antes de ADR final.

**Recomendação operacional:** o Zelador deve re-rodar `web_search` para confirmar releases de Postgres 16 (Native RLS incremental view maintenance), benchmarks ANPD 2025-2026 e jurisprudência antes de fechar ADR de hardening. Não bloquear a leitura do relatório por causa disso.

---

## 0. Sumário executivo (TL;DR)

A pergunta da Wave 30.5 é cirúrgica: **"como garantir que cada Zelador vê só sua 'fatia' da consciência?"** Hoje (Wave 28+), a resposta é **app-layer `withCaminhanteContext()`** (ADR 0004, implementado em `apps/akasha-portal/src/lib/application/tenant-context.ts`). Funciona para um Zelador com N consulentes. **Não funciona** quando a "consciência" envolve embeddings de RAG (pgvector), sumarização cross-caminhante, federação entre Zeladores (Wave 30.2 / FedAkasha) ou visualização em grafo (ADR 0005).

**A tese deste relatório:** **a abordagem atual está correta na decisão ("helper de aplicação, não RLS") mas incompleta na cobertura**. Cobrimos bem dados tabulares (`Sessao`, `SessaoChunk`, `GrimorioPessoal`, etc.); **estamos descobertos em três vetores críticos**:

1. **Embeddings RAG** — `SessaoChunk.embedding` é gerado por texto bruto que pode conter PII (nome do consulente em "notas do Zelador"); o `WHERE` atual passa texto pelo filtro, mas o embedding já foi treinado/vetorizado com PII junto. **Vazamento semântico cross-tenant.**
2. **RAG retrieval cross-tenant** — a query de retrieval passa o filtro de `zeladorId` no SQL (`AND [scope, ...]`), mas se houver bug no helper ou um `findUnique` sem contexto (já mitigado por `MissingTenantContextError`), o embedding é retornado e o LLM é alimentado com ele.
3. **Logs e audit** — `AuditLog.metadata` é JSON e tem política de não-PII, mas não é aplicada automaticamente. Um developer distraído pode logar `caminhante.nome` num audit de "consulta aberta" e criar trilha LGPD de nome + IP hasheado.

**Recomendação em 3 camadas (defense in depth):**

1. **Wave 30.5.x (este relatório → ADR-DRAFT 0010):**
   - **Endurecer o helper atual**: banir `findUnique` sem `caminhadaId` no escopo (hoje passa porque `findUnique` usa `AND [scope, where]` mas pode ter `where` vazio — verificar). Adicionar **assertion em runtime** de que `SessaoChunk.embedding` nunca retorna texto > N chars com nome próprio detectado.
   - **Embeddings com redação**: passar um `RedactionTransformer` ANTES do embedder (substituir nome/CPF/telefone/email por `[REDACTED:NAME]` etc.) — o embedding fica semanticamente próximo do original, mas o RAG cross-tenant não vaza nome.
   - **Audit automatizado de PII em logs**: middleware que escaneia `AuditLog.metadata` antes do INSERT e rejeita/transforma campos proibidos (nome, email, telefone, nascimento).
2. **Wave 31.x (com FedAkasha):**
   - Cada Zelador recebe **namespace próprio de embeddings** (FK `zeladorId` em `SessaoChunk` — já existe — mas **chave de partição** para FedAkasha). Embeddings **nunca saem** do Zelador local em forma reversível.
   - Auditoria de federação: o `W_t` agregado é versionado com **hash dos clientes** + ε + σ, e a UI do Zelador exibe "Sua calibração participou do round #N com K clientes".
3. **Wave 32.x (escala):**
   - Se o Akasha virar SaaS com **múltiplos Zeladores na mesma instância** (não mais "ferramenta de um Zelador"), aí sim **Postgres RLS** vira camada adicional obrigatória — porque o helper de aplicação sozinho não escala entre deploys diferentes. Avaliar RLS nativo do PG 15+ com **session variables** (`SET LOCAL app.zelador_id = ...`) + **FORCE ROW LEVEL SECURITY** em tabelas sensíveis.

**NÃO implementar agora** Wave 31.x/32.x. Este relatório é research + planning. Wave 30.6 (benchmarks) e Wave 31 (FedAkasha MVP) devem começar com **endurecimento do helper atual** + redação de embeddings antes de tocar arquitetura nova.

---

## 1. Contexto e motivação

### 1.1 O que é "consciência" no Akasha hoje?

Da `docs/25_visao-akasha.md` §3 e ADR 0004, a "consciência" do Akasha é **a soma de três camadas**:

1. **Dados estruturados** — `Sessao`, `SessaoChunk`, `GrimorioPessoal`, `NotasConsulente`, `MapaCalculo`, `Caminhante`, `Caminhada`. Tudo escopado por `zeladorId` + `caminhadaId` (helper atual).
2. **Embeddings RAG** — `vector(768)` em `SessaoChunk.embedding` (D-XXX migration `20260624000001_vector_indexes` usa **ivfflat**, NÃO hnsw — trade-off explicitado no header da migration). O retrieval faz `Weighted UNION ALL` (ADR 0004 §Retrieval).
3. **Memória de sessão + cache** — `packages/mentor/src/memory.ts` (TTL), `packages/mentor/src/correlation.ts` (pesos hardcoded hoje; FedAkasha Wave 31.x vai federar).

**Pergunta crítica:** "consciência isolada" significa que cada Zelador vê só a **parte 1+2+3** dos seus consulentes. Não significa dados segregados do Zelador — significa que o Zelador A nunca lê consulentes do Zelador B (e vice-versa).

### 1.2 Por que a pergunta importa AGORA (Wave 30.5)

Hoje (Wave 28+) a arquitetura assume **um Zelador por instância do Akasha**. Mas três tendências criam pressão:

1. **Federação (Wave 30.2 / 31+)** — múltiplos Zeladores compartilham aprendizados. **Sem isolamento forte, a "consciência coletiva" vaza PII dos consulentes** (gradient leakage, membership inference).
2. **SaaS futuro (Wave 32+)** — se o Akasha virar multi-tenant no sentido clássico (vários Zeladores pagando assinatura numa instância gerenciada), o helper atual ainda funciona mas precisa de hardening.
3. **Grafo de conhecimento (ADR 0005 / Wave 30.3)** — `MapaRelacional` prevê "Maria é mãe de João" como relação entre **Caminhantes diferentes do mesmo Zelador**. Se um Zelador atende mãe e filho, a relação atravessa `caminhadaId` — o helper atual precisa de cuidado especial.

### 1.3 Estado atual no repo (inspeção direta)

**O que JÁ existe (e funciona):**

- `apps/akasha-portal/src/lib/application/tenant-context.ts` — proxy Prisma com `$allOperations`. Injeta `{zeladorId, caminhadaId}` em todas as operações de modelos no `SCOPED_MODELS` Set. Throw `MissingTenantContextError` se chamado fora de `withCaminhanteContext()`. **Testado em `tenant-context.test.ts`.**
- `apps/akasha-portal/src/lib/application/privacy/consent.ts` — append-only `PrivacyConsent` (Wave 19.3). 4 categorias: MARKETING, ANALYTICS, AI_TRAINING, THIRD_PARTY_SHARING. Defaults no signup opt-in estrito para AI_TRAINING (LGPD Art. 11).
- `apps/akasha-portal/src/lib/infrastructure/audit-log.ts` — `AuditLog` em PostgreSQL + stdout NDJSON. IP hasheado (HMAC-SHA256), metadata sem PII (política declarada no JSDoc, **não aplicada por código**).
- Migration `20260624000000_multitenant_core` — criou `Sessao`, `SessaoChunk`, `GrimorioPessoal`, `NotasConsulente`, `MapaCalculo` com FKs `zeladorId` + `caminhadaId`.
- Migration `20260624000001_vector_indexes` — `ivfflat` (não hnsw) em `sessao_chunks.embedding`. Trade-off explícito: ivfflat tem recall menor mas é determinístico e estável em volume pequeno-médio.

**O que NÃO existe (gaps a fechar):**

- **Nenhuma redação de PII antes do embedding.** `SessaoChunk.chunkText` pode conter "Maria mencionou que sente dor no peito desde a morte da mãe" — embedder recebe isso cru. O RAG do Zelador B jamais vai encontrar essa frase (filtro SQL funciona), mas se houver bug no filtro, ela vaza.
- **Nenhuma validação automática de PII em `AuditLog.metadata`.** Política declarada no JSDoc, não no código. Developer pode logar `caminhante.nome` sem warning.
- **Nenhuma detecção de "embedding vazado".** Sem teste de regressão que tente "achar embedding de consulente X com contexto de Zelador Y e espere erro" (parcialmente coberto por `tenant-context.test.ts` mas não explicitamente para embeddings).
- **Nenhum namespace de embeddings por Zelador.** `SessaoChunk.zeladorId` existe, mas se o FedAkasha Wave 31.x agregar embeddings cross-Zelador, precisa de chave de partição explícita + DP.
- **Nenhuma política de "machine unlearning"** (LGPD Art. 18 §VI — revogação de consentimento e efeito em modelo treinado).

**Implicação:** o helper atual é **90% da resposta**, mas os 10% que faltam (redação + audit + namespace) são exatamente onde LGPD Art. 33 + Art. 46 pegam.

### 1.4 O que o helper atual faz e não faz

| Camada | O helper cobre? | Comentário |
|---|---|---|
| `SELECT * FROM sessoes WHERE zeladorId=X AND caminhadaId=Y` | ✅ | Injeção automática via `$allOperations`. |
| `SELECT chunk_text, embedding FROM sessao_chunks WHERE zeladorId=X AND caminhadaId=Y AND 1 - (embedding <=> $1) > 0.7` | ⚠️ | O `WHERE` é injetado, mas o embedding em si pode conter PII (texto). **Não cobre "embeddings gerados com PII".** |
| `INSERT INTO audit_logs (action, userId, metadata)` | ❌ | Helper não toca `audit_logs` (model fora do `SCOPED_MODELS`). **metadata é livre.** |
| Embedding cross-Zelador em federação | ❌ | Não existe hoje. Wave 31.x (FedAkasha). |
| `findUnique({ where: { id: 'xxx' } })` sem contexto | ⚠️ | Helper injetará `AND [scope, {id: 'xxx'}]` → retorna null (porque id existe mas com outro `zeladorId`). **Não throw** — silenciosamente retorna vazio. Isso é **perigoso** para `findUnique` em relações (e.g. `notasConsulente.findUnique({ where: { id } })` retorna null em vez de throw — o developer pode pensar "não existe" em vez de "sem permissão"). |
| `prisma.$queryRaw` direto | ❌ | Bypass completo do helper. Code review obrigatório. |
| `prisma.$transaction([...])` | ⚠️ | `$allOperations` dispara por operação dentro da transaction; mas se algum `findUnique` interno usar `args.where = {}` (vazio), helper injeta scope mas o `findUnique` exige unique key — pode dar erro de SQL confuso. |

---

## 2. Estado da arte — Multi-tenant isolation

### 2.1 As 4 estratégias canônicas

(Comparação honesta; o helper atual do Akasha é a #2.)

#### Estratégia 1 — Schema separado por tenant

- **Como funciona:** um Postgres schema (`akasha_zelador_a`, `akasha_zelador_b`) por Zelador. Cada schema tem suas tabelas. App escolhe schema via `search_path`.
- **Prós:** isolamento físico total. Backup por tenant trivial. Migração por tenant possível.
- **Contras:** **NÃO ESCALA** — para 100 Zeladores = 100 schemas = migração infernal. Backup management vira pesadelo. Pgvector não compartilha índice cross-schema.
- **Quando usar:** B2B enterprise com < 10 clientes grandes (ex: Salesforce orgs).
- **Veredito Akasha:** **rejeitado** (já considerado no ADR 0004 §Alternatives).

#### Estratégia 2 — App-layer proxy / helper (helper atual)

- **Como funciona:** middleware ou ORM extension que injeta `WHERE tenant_id = X` em toda query. **É o que o Akasha já faz** com `withCaminhanteContext()`.
- **Prós:** simples de auditar (1 ponto de entrada). Funciona com qualquer ORM. Funciona com qualquer storage (PG, Mongo, S3 prefix). **Audit-friendly** — basta logar entrada do helper.
- **Contras:** propenso a bugs (developer esquece, query vaza). Não cobre `findUnique` retornando null (em vez de throw). Não cobre `$queryRaw` direto. **Mitigação: testes de regressão obrigatórios.**
- **Quando usar:** B2B com N tenants pequenos-médios, **um único deploy compartilhado**.
- **Veredito Akasha:** **adotado** (ADR 0004). Endurecer, não substituir.

#### Estratégia 3 — Postgres Row-Level Security (RLS) [VERIFY releases PG 15/16/17]

- **Como funciona:** políticas (`CREATE POLICY ... USING (...)`) em cada tabela. A sessão PG precisa setar variável (`SET LOCAL app.zelador_id = 'X'`) e a policy filtra automaticamente.
- **Prós:** **isolamento no banco, não na app.** Defensivo contra bypass (developer que esquecer o helper ainda está protegido). Audit-friendly (policy = SQL = código versionado). Funciona com qualquer client (não só Prisma). Suportado nativamente.
- **Contras:** complexidade operacional. Cada nova tabela precisa de policy. Cada nova query precisa de `SET LOCAL`. **Performance**: overhead de evaluation por row (~5-10%, verificável com EXPLAIN). **Debugging mais difícil** — policy violada = erro genérico "new row violates row-level security policy".
- **Quando usar:** SaaS B2B com sensibilidade alta (saúde, finanças, gov). Compliance audit (SOC2, ISO 27001, HIPAA).
- **Veredito Akasha:** **rejeitado pelo ADR 0004** ("adiciona complexidade operacional sem ganho claro"). **Reabrir este ADR se**: (a) virar SaaS multi-tenant Wave 32+, (b) LGPD audit pedir prova de isolation no DB layer (não só na app).

**PG 15+ melhorou RLS** com:
- `CREATE POLICY ... ON ... TO PUBLIC` — policies por role, não por user.
- `FORCE ROW LEVEL SECURITY` — força RLS até para o dono da tabela (evita "owner bypass").
- `pg_catalog.pg_rls_policies` — queryable.
- **Native RLS incremental view maintenance** (PG 17, [VERIFY]) — materialized views com RLS refresh.

#### Estratégia 4 — Database-per-tenant

- **Como funciona:** cada Zelador tem seu próprio cluster Postgres. App faz connection routing.
- **Prós:** isolamento físico total. Compliance perfeito. Backup trivial.
- **Contras:** **CARÍSSIMO** — 100 Zeladores = 100 clusters PG. Vercel Postgres não suporta bem. **Não-recomendado para SaaS pequeno-médio.**
- **Quando usar:** B2B enterprise ultra-premium (banco, saúde com HIPAA estrito).
- **Veredito Akasha:** **rejeitado** (overkill, custo proibitivo).

### 2.2 Comparação canônica

| Aspecto | Schema-per-tenant | App-layer proxy (atual) | Postgres RLS | DB-per-tenant |
|---|---|---|---|---|
| Isolamento | Físico (schema) | Lógico (filtro) | Lógico (policy) | Físico (cluster) |
| Custo operacional | Médio | Baixo | Médio | Alto |
| Risco de bypass | Baixo | **Alto** (developer esquece) | Baixo (defesa no DB) | Nenhum |
| Audit-friendliness | Médio | **Alto** (1 ponto) | Médio (SQL versionado) | Alto |
| Compliance (LGPD Art. 46) | OK | OK com testes | **Excelente** | Excelente |
| MVP-ready | ~ | **✓** | ~ | ✗ |
| Wave 32+ readiness | ✗ | ✓ (com hardening) | **✓✓** | ✗ |

**Recomendação faseada:**
- **Wave 30.5.x:** endurecer o app-layer proxy (helper atual).
- **Wave 31.x (FedAkasha):** manter app-layer + adicionar namespace de embeddings.
- **Wave 32.x (SaaS):** **acoplar RLS como 2ª camada**, mantendo o helper (defense in depth).

---

## 3. RLS PostgreSQL — anatomia técnica

### 3.1 Exemplo canônico para o Akasha

**Setup (Wave 32+ hipotético):**

```sql
-- 1. Adicionar coluna tenant_key em todas as tabelas sensíveis
-- (já existe via zeladorId + caminhadaId — não precisa adicionar)

-- 2. Habilitar RLS
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes FORCE ROW LEVEL SECURITY; -- protege contra owner bypass

-- 3. Policy: SELECT só vê o Zelador ativo
CREATE POLICY zelador_isolation_select ON sessoes
  FOR SELECT
  USING (zelador_id = current_setting('app.zelador_id', true)::text);

-- 4. Policy: INSERT só cria com zelador_id da sessão
CREATE POLICY zelador_isolation_insert ON sessoes
  FOR INSERT
  WITH CHECK (zelador_id = current_setting('app.zelador_id', true)::text);

-- 5. Policy: UPDATE/DELETE só no próprio Zelador
CREATE POLICY zelador_isolation_modify ON sessoes
  FOR UPDATE
  USING (zelador_id = current_setting('app.zelador_id', true)::text)
  WITH CHECK (zelador_id = current_setting('app.zelador_id', true)::text);

-- 6. No app: setar a variável antes de cada request
-- SET LOCAL app.zelador_id = 'zelador_xxx';
```

**Padrão por sessão** (helper atual):

```typescript
// Em withCaminhanteContext, ANTES de cada operação Prisma:
await prisma.$executeRawUnsafe(`SET LOCAL app.zelador_id = '${ctx.zeladorId}'`);
// Prisma executa a query — RLS policy filtra automaticamente
// No fim da request: SET LOCAL é descartado automaticamente
```

### 3.2 Vantagens que justificariam reabrir o ADR 0004

1. **Defesa contra bypass.** Developer que usar `prisma.$queryRaw` direto ainda está protegido.
2. **Audit-friendly.** Policy é SQL = versionado em `prisma/migrations/*.sql` = auditável por DBA.
3. **Compliance-ready.** Auditor LGPD pede "como você garante que consulente do Zelador A não é lido pelo Zelador B?" — "a policy RLS está na tabela" é resposta mais forte que "o helper de aplicação injeta o filtro".
4. **Funciona com qualquer client.** Python (FedAkasha sidecar), BI tools, scripts de migração — todos protegidos.

### 3.3 Trade-offs que continuam válidos

1. **Performance:** ~5-10% overhead por query [VERIFY com EXPLAIN]. Em queries pequenas (Sessao.findMany com 10 rows) é negligível. Em scans grandes (relatórios Wave 28.7) pode ser perceptível.
2. **Debugging:** erro `new row violates row-level security policy` é genérico. Precisa de logging adicional para diagnosticar.
3. **Operação:** cada migration nova precisa de policy. Risco de "tabela sem policy" = buraco. **Mitigação: script de audit que verifica toda tabela tem RLS + policy.**
4. **Complexidade:** 2 camadas (helper + RLS) = 2 pontos de configuração. Helper precisa setar `SET LOCAL` + injetar `WHERE`. Mitigação: helper **sempre** setar `SET LOCAL`, **sempre** injetar `WHERE` (não confiar só no RLS).

### 3.4 Variantes de policy por modelo

Nem todo modelo precisa da mesma policy. **Proposta para Wave 32+ (se aplicável):**

| Modelo | Policy | Razão |
|---|---|---|
| `sessoes`, `sessao_chunks` | `zelador_id = current_setting('app.zelador_id')` | Isolamento padrão. |
| `caminhantes`, `caminhadas` | `zelador_id = current_setting('app.zelador_id')` | Igual. |
| `grimorio_pessoal` | `zelador_id = current_setting('app.zelador_id')` | Igual (1:1 com Zelador). |
| `mapa_calculo` | `zelador_id = current_setting('app.zelador_id')` | Igual. |
| `audit_logs` (SELECT) | `user_id = current_setting('app.user_id') OR role = 'admin'` | Admin pode ler tudo. |
| `audit_logs` (INSERT) | sem policy (sistema insere) | App-side. |
| `akasha_users` | SEM RLS — usado para auth | Único modelo sem isolation (é a identidade). |
| `privacy_consents` | SEM FK para `akasha_users` (já é LGPD-safe), mas RLS por `user_id` | LGPD Art. 37 (audit trail). |
| `literature_papers` (Wave 21.1) | sem RLS — é corpus compartilhado | Conhecimento público/curado. |
| `grimoire_chunks` (corpus global) | sem RLS — é compartilhado por design | RAG público. |

---

## 4. Tenant isolation em IA embeddings

### 4.1 O problema específico

Embeddings são **vetores densos** (768 floats para `multilingual-e5-base` ou similar). Não dá para "ler" um embedding e recuperar o nome do consulente — mas dá para:

1. **Gradient leakage** (em federação, Wave 31.x) — recuperar input do embedding via otimização.
2. **Nearest-neighbor leakage** — embedding `E_maria` está próximo de embedding `E_joao` se Maria e João têm perfis similares. Se o retrieval for cross-tenant (Zelador A busca e recebe vizinhos do Zelador B), o Zelador A infere "existe um consulente similar a Maria no Zelador B".
3. **Membership inference** — Zelador A nota que certo embedding aparece/some do índice → infere que consulente X entrou/saiu do Zelador B.

O helper atual **filtra no SQL** (`WHERE zeladorId = X`), então nearest-neighbor leakage **dentro do retrieval** está coberto. Mas **na hora de gerar o embedding**, PII textual (nome, CPF, telefone) pode ter sido embeddado — e se o filtro falhar, vaza.

### 4.2 Redação pré-embedder (Wave 30.5.x proposto)

**Pipeline proposto:**

```typescript
// Antes do embedder (no Retriever ou no ETL que popula SessaoChunk):
const redactor = new PIIRedactor({
  replacements: {
    NAME: '[REDACTED:NAME]',
    CPF: '[REDACTED:CPF]',
    PHONE: '[REDACTED:PHONE]',
    EMAIL: '[REDACTED:EMAIL]',
    BIRTHDATE: '[REDACTED:DATE]',
    CITY: '[REDACTED:CITY]', // opcional, depende da base legal
  },
  detectors: [
    new RegexDetector(),       // CPF, email, telefone
    new SpacyNERDetector(),   // NER para nomes (requer Python sidecar)
    new WhitelistFilter(),    // NÃO redactar "Cabala", "Orixá", "Sephirah"
  ],
});

const safeText = redactor.redact(sessao.notasDoZelador);
await embedder.embed(safeText); // embedding agora é "PII-free"
```

**Trade-offs:**

- ✅ **Elimina PII no embedding.** Embedding de "Maria sente dor no peito" vira embedding de "[REDACTED:NAME] sente dor no peito" — semanticamente próximo, sem nome.
- ✅ **Defende contra gradient leakage** (Wave 31.x FedAkasha) — mesmo que o vetor vaze, não tem nome.
- ⚠️ **Perda de precisão semântica.** Substituir "Maria" por "[REDACTED:NAME]" muda marginalmente o embedding (~1-3% no benchmark GLUE para NER redaction, [VERIFY]). Para RAG de "notas de sessão" isso é aceitável (o contexto de cura é o que importa, não o nome).
- ⚠️ **Custo do NER.** Regex é barato; Spacy/HuggingFace NER requer Python sidecar ou lib ONNX em Node.
- ⚠️ **Manutenção do whitelist.** "Cabala" não pode virar `[REDACTED:NAME]` (false positive). Manter lista curated.

### 4.3 Alternativas avaliadas

| Abordagem | Privacidade | Custo | Precisão RAG | Recomendação |
|---|---|---|---|---|
| Embeddings crus (status quo) | ❌ PII no vetor | Baixo | 100% | **Rejeitar para Wave 31+** |
| Redação regex + whitelist | ✅ média-alta | Baixo (~5ms/texto) | 97-99% | **MVP Wave 30.5.x** |
| Redação NER (Spacy/HF) | ✅ alta | Médio (~50ms/texto, sidecar) | 95-98% | Wave 31.x se necessário |
| Embeddings de "summary estruturada" | ✅✅ máxima | Alto (LLM summary antes de embed) | 80-90% | Wave 33+ (explorar) |
| Embeddings diferenciados (matryoshka) | ⚠️ mesma PII | Baixo | 100% | Não resolve PII |

### 4.4 Namespace de embeddings para FedAkasha (Wave 31+)

Mesmo com redação, embeddings FedAkasha precisam de **isolamento criptográfico**:

1. **Hash de partição.** Cada embedding recebe `partition_key = HMAC-SHA256(ZELADOR_SECRET, zeladorId)`. Servidor FedAkasha agrega por partition key, não por embedding individual.
2. **DP-SGD no cliente.** Zelador treina local com DP (gradient clipping + Gaussian noise, ε ≤ 1). Vetor enviado ao servidor já é differentially private.
3. **Secure Aggregation (Bonawitz 2017).** Máscaras criptográficas entre Zeladores — servidor central vê só a soma agregada, não vetores individuais.

**Recomendação:** mesmo com DP + SecureAgg, **manter redação pré-embedder** como defesa em profundidade. Se um dia o DP for quebrado (avanço criptanalítico), a redação ainda protege.

---

## 5. LGPD Art. 33 + ANPD compliance

### 5.1 Texto canônico (LGPD Lei 13.709/2018)

**Art. 33 — Transferência internacional de dados:**
> "Transferência internacional de dados é a transferência de dados pessoais para país estrangeiro ou organismo internacional do qual o país seja membro."

**§1º — Bases legais:** consentimento específico + destacado OU cooperação internacional OR ANPD autorizar OR país com nível adequado.

**§2º — ANPD pode:** exigir garantias contratuais (cláusulas-padrão), exigir relatórios de impacto, **vedar transferência** se país não oferece proteção adequada.

**§4º — Tratamento que envolva:** (I) país sem nível adequado; (II) sem consentimento; (III) sem as garantias do §2º = **vedado**.

### 5.2 Implicações para o Akasha

**Pergunta crítica:** o embedding do consulente X, gerado pelo Zelador A em Salvador, enviado para um servidor FedAkasha nos EUA (Vercel Postgres US) é **transferência internacional**?

**Resposta:** **SIM, se o vetor embedding (mesmo após redação) permitir re-identificação** ou se o metadata (chunk_text raw, mesmo ofuscado) contiver PII. ANPD 2024 [VERIFY] tem se posicionado que **dados derivados** (incluindo embeddings) são dados pessoais se razoavelmente re-identificáveis.

**Por isso:**

1. **Redação pré-embedder é obrigatória** (seção 4.2) — sem ela, FedAkasha em servidor cross-border é violação.
2. **Embeddings NÃO são anônimos por definição** (LGPD Art. 5° III — dado anonimizado ≠ dado anônimo; anonimizado é dado pessoal que passou por meios técnicos razoáveis).
3. **Federação em território nacional** (BR-only deploys) reduz risco mas **não elimina** — auditoria ANPD pode pedir prova de "não re-identificação".
4. **Consentimento específico para federação** (`AI_TRAINING` no PrivacyConsent, default `false`) é obrigatório.

### 5.3 Mapeamento LGPD → implementações Akasha

| LGPD Art. | Requisito | Status atual | Gap |
|---|---|---|---|
| **Art. 7º, I** | Consentimento expresso para tratamento sensível | ✅ `PrivacyConsent` append-only (Wave 19.3) | Nenhum |
| **Art. 11** | Consentimento específico para dado sensível (Odu, mapa cabalístico) | ✅ `AI_TRAINING` opt-in estrito | Reforçar com UI explaining "seus mapas não saem do seu Zelador" |
| **Art. 18, §V** | Direito de eliminação | ✅ `lgpd_deletion_scheduled` (Wave 19.2) + cron | Machine unlearning (efeito em embedding) — **gap** |
| **Art. 18, §VI** | Revogação de consentimento | ✅ `PrivacyConsent` permite revoke | Idem — efeito em embedding derivado é **gap** |
| **Art. 33** | Transferência internacional | ⚠️ Vercel Postgres US atual | Mitigar com redação + DP + região BR se federar |
| **Art. 37** | Registro de operações (trilha audit) | ✅ `AuditLog` + stdout NDJSON (Wave 8.3 + 14.5) | PII em `metadata` não é validado — **gap** |
| **Art. 46** | Segurança adequada | ✅ Helper + audit + IP hashing | Adicionar RLS (Wave 32+) ou redação embeddings (Wave 30.5.x) |
| **Art. 48** | Comunicação de incidente | ✅ Processo existe (DPO) | Nenhum técnico — gap é processual |

### 5.4 ANPD regulamento + Resolução CD/ANPD 4/2023 (padrões mínimos)

[VERIFY com DPO — checar releases até Jan 2026]

- **Pequenos portes** (receita ≤ R$ 4.8M) podem ter regime simplificado.
- **Relatório de Impacto à Proteção de Dados (RIPD)** obrigatório para tratamento sensível.
- **DPO obrigatório** se tratamento envolver dados sensíveis em larga escala.
- **Comunicação de incidente** em "prazo razoável" (ANPD 2024 orienta 2 dias úteis para incidentes com risco).

**Implicação Akasha:** Akasha Portal trata dados sensíveis (Odu, mapa cabalístico) em escala média (100+ consulentes por Zelador). **RIPD é obrigatório**. Hoje não há RIPD versionado no repo — **gap crítico**. Wave 30.5+ deve gerar `docs/legal/RIPD-Akasha.md`.

### 5.5 Estratégia de conformidade faseada

1. **Wave 30.5.x (este relatório):** gerar RIPD. Endurecer helper. Adicionar redação pré-embedder (MVP regex). Audit PII validator.
2. **Wave 31.x (FedAkasha):** DP-SGD ε=1. SecureAgg. **Não federar se RIPD não estiver aprovado por DPO + Zelador.**
3. **Wave 32.x (SaaS):** RLS. DPO contratado formalmente. Política de incidentes ANPD-compliant.
4. **Wave 33+:** explorar FHE se auditoria exigir.

---

## 6. Wave 19.x (LGPD per-categoria) — como o Akasha já implementou

### 6.1 Inventário (inspeção direta do código)

**Wave 19.2 — LGPD self-service soft delete:**
- `apps/akasha-portal/prisma/migrations/20260624000000_multitenant_core/migration.sql` — extensão `akasha_users` com `deletedAt` + `deleteGracePeriodEndsAt`.
- Cron diário Wave 19.2-followup faz hard delete + cascade.
- AuditAction enum estendido (migration `20260625090001_audit_lgpd_actions`).

**Wave 19.3 — PrivacyConsent append-only:**
- `apps/akasha-portal/src/lib/application/privacy/consent.ts` — helper central de leitura/escrita.
- Modelo `PrivacyConsent` em `schema.prisma` (linha 942).
- Enum `PrivacyConsentType`: `MARKETING | ANALYTICS | AI_TRAINING | THIRD_PARTY_SHARING`.
- Defaults signup: AI_TRAINING=false, MARKETING=false, ANALYTICS=true, THIRD_PARTY_SHARING=false.

**Wave 8.3 / 14.5 — AuditLog persistente:**
- `apps/akasha-portal/src/lib/infrastructure/audit-log.ts` — dual-write PG + stdout.
- IP hashing (HMAC-SHA256 com JWT_SECRET).
- AuditAction enum com 17 valores (LGPD self-service + third-party consent).

### 6.2 Padrões a reutilizar em Wave 30.5.x

1. **Append-only** (PrivacyConsent) é o padrão para qualquer trilha de decisão sensível. Wave 30.5.x deve replicar isso para **trilha de "qual embedding foi enviado para qual LLM provider"**.
2. **Defaults opt-in estrito para sensível** — `AI_TRAINING: false` é o template. Wave 30.5.x deve criar `EMBEDDING_REDACTION: true` (default ativo, opt-out) porque redação **protege** o Zelador, não o consulente direto.
3. **Audit enum extension** — adicionar `embedding_redaction_applied`, `cross_tenant_query_attempted_blocked`, `audit_metadata_pii_blocked`.
4. **Helper central + testes** — `tenant-context.ts` + `tenant-context.test.ts` é o template para qualquer helper transversal. Wave 30.5.x deve ter `pii-redactor.ts` + `pii-redactor.test.ts`.
5. **Migration commentada** — o padrão das migrations multi-tenant core é **comentário longo no header** explicando decisão + trade-off + referência à ADR. Wave 30.5.x migrations devem seguir.

### 6.3 O que Wave 19.x NÃO cobre (e Wave 30.5.x deve)

- **LGPD Art. 18 §VI — machine unlearning.** Como deletar embedding derivado de um consulente que pediu eliminação? Hoje: cascade Prisma deleta `Sessao` → `SessaoChunk` (cascade), mas o **embedding já vetorizado pode ter sido**:
  - Indexado em vector store fora do PG (Qdrant, Pinecone — não usamos hoje).
  - Treinado em modelo de federação (FedAkasha Wave 31+).
  - Copiado para backup / replica.
- **LGPD Art. 33 — território nacional.** Nenhuma garantia hoje.
- **LGPD Art. 46 — security policy automatizada.** RLS é manual; auditoria é manual.

---

## 7. Plano de migração para multi-tenant consciência

### 7.1 Wave 30.5.x (este wave → ADR-DRAFT 0010)

**Objetivo:** endurecer helper atual + adicionar redação pré-embedder + audit validator. **Sem mudança arquitetural.**

**Entregas:**

1. **ADR-DRAFT 0010** (`docs/adrs/0010-multi-tenant-embedding-hardening.md`):
   - Reafirma decisão ADR 0004 (helper > RLS).
   - Adiciona: redação pré-embedder é obrigatória.
   - Adiciona: audit PII validator é obrigatório.
   - Reabre quando virar SaaS Wave 32+.

2. **`docs/legal/RIPD-Akasha.md`** — Relatório de Impacto à Proteção de Dados (Art. 38 LGPD).

3. **Migration `20260625100000_embedding_redaction_audit/`:**
   ```sql
   -- Nova coluna em sessao_chunks: redactedFrom (JSONB com lista de redactions aplicadas)
   -- Útil para auditoria + debug.
   ALTER TABLE sessao_chunks
     ADD COLUMN redacted_from JSONB;
   -- Migration NO-OP se coluna já existir.
   ```

4. **Helper `apps/akasha-portal/src/lib/application/privacy/pii-redactor.ts`:**
   - Regex-based (CPF, email, telefone).
   - Whitelist (termos esotéricos: Cabala, Orixá, Sephirah, Odu, etc.).
   - Loga redactions (sem conteúdo raw, só tipo + posição).

5. **Integração no `RAGService`:**
   - Antes de `embedder.embed(text)`, chamar `redactor.redact(text)`.
   - Persistir `chunkText` redacted + `redactedFrom` no `SessaoChunk`.

6. **Audit PII validator:**
   - `apps/akasha-portal/src/lib/infrastructure/audit-log.ts` ganha método `validateMetadata()` que rejeita keys proibidas (`nome`, `email`, `telefone`, `cpf`, `birthDate`, etc.) antes do INSERT.
   - Erro → log warning + INSERT com `metadata: { _redacted: true }` (transparência).

7. **Testes de regressão:**
   - `tenant-context.test.ts` ganha caso "embeddings cross-tenant attempt throws".
   - `pii-redactor.test.ts` cobre nomes comuns PT-BR + termos esotéricos.
   - `audit-log.test.ts` cobre "metadata com nome é rejeitado".

### 7.2 Wave 31.x (FedAkasha MVP — depende de Wave 30.2)

**Objetivo:** Federação de estatísticas de calibração com DP-SGD. **Manter app-layer proxy.**

**Entregas:**

1. Cada Zelador roda **FedAkasha Client sidecar** (Python). Lê apenas:
   - `sessao_clinica.estrutura` (não conteúdo).
   - `mapa_calculo.pilares` (7 valores estruturados).
   - `feedback.rating` (1-5 + tags curtas).
2. **DP-SGD no cliente** (Opacus, ε=1).
3. **Audit federado:**
   - `embedding_redaction_applied: true` em cada envio.
   - `federation_round_id`, `k_clients`, `epsilon` no AuditLog.
4. **UI do Zelador:** "Sua calibração participou do round #N com K=12 Zeladores. ε=1.0. Versão do modelo: W_47."

### 7.3 Wave 32.x (SaaS — decisão arquitetural)

**Objetivo:** Multi-tenant SaaS com múltiplos Zeladores por instância. **Acoplar RLS como 2ª camada.**

**Entregas:**

1. **Migração para Postgres RLS** em todas as tabelas sensíveis:
   - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY; FORCE ROW LEVEL SECURITY;`
   - Policies (`zelador_id = current_setting('app.zelador_id')`).
2. **Helper estendido:**
   ```typescript
   export async function withCaminhanteContext(ctx, fn) {
     return als.run(ctx, async () => {
       await prisma.$executeRawUnsafe(`SET LOCAL app.zelador_id = '${ctx.zeladorId}'`);
       return fn();
     });
   }
   ```
3. **Audit:** todas as policies + SET LOCAL commands logados.
4. **Teste de bypass:** developer que usar `prisma.$queryRaw` direto é bloqueado por RLS (mas log warning).
5. **Reabrir ADR 0004** com ADR-DRAFT 0011 ("Multi-tenant hardening v2") justificando acoplar RLS.

### 7.4 Wave 33+ (exploração)

- **Secure Aggregation** (Bonawitz 2017) se auditoria exigir "servidor central não vê contribuição individual".
- **FHE** (TenSEAL / Concrete-ML) se demanda de mercado justificar custo ~1000x.
- **Machine unlearning** (LGPD Art. 18 §VI) — research aberto. Provavelmente fica como "explorar com paper acadêmico" e nunca implementar.

### 7.5 Diagrama de decisão (quando reabrir ADR 0004)

```
                          ┌─────────────────────────┐
                          │ Akasha ainda é "ferra-  │
                          │ menta do Zelador"?      │
                          └────────┬────────────────┘
                                   │ sim (Wave 30.5-31)
                                   ▼
                          ┌─────────────────────────┐
                          │ Helper app-layer proxy  │
                          │ + redação pré-embedder  │
                          │ (Wave 30.5.x)           │
                          └────────┬────────────────┘
                                   │
                                   ▼
                          ┌─────────────────────────┐
                          │ Akasha virou SaaS       │
                          │ multi-Zelador?          │
                          └────────┬────────────────┘
                                   │ sim (Wave 32+)
                                   ▼
                          ┌─────────────────────────┐
                          │ Helper + Postgres RLS   │
                          │ (defense in depth)      │
                          │ (Wave 32.x)             │
                          └────────┬────────────────┘
                                   │
                                   ▼
                          ┌─────────────────────────┐
                          │ Auditoria LGPD pediu    │
                          │ prova de "servidor não  │
                          │ vê contribuição"?       │
                          └────────┬────────────────┘
                                   │ sim
                                   ▼
                          ┌─────────────────────────┐
                          │ + Secure Aggregation    │
                          │ (Bonawitz 2017)         │
                          │ (Wave 33+)              │
                          └────────┬────────────────┘
                                   │
                                   ▼
                          ┌─────────────────────────┐
                          │ Compliance ultra-       │
                          │ estrito (gov, saúde     │
                          │ com certificação)?      │
                          └────────┬────────────────┘
                                   │ sim
                                   ▼
                          ┌─────────────────────────┐
                          │ + FHE (TenSEAL/         │
                          │ Concrete-ML)            │
                          │ (Wave 34+, explorar)    │
                          └─────────────────────────┘
```

---

## 8. Schema RLS proposto (Wave 32+ — não implementar agora)

```sql
-- ============================================================
-- Migration: 2026XXXX_multi_tenant_rls_hardening
-- Wave 32.x — defesa em profundidade via Postgres RLS
-- Mantém app-layer helper (não substitui).
-- ============================================================

-- 1. Função helper: lê tenant_id da sessão
CREATE OR REPLACE FUNCTION app_current_zelador_id()
RETURNS TEXT AS $$
  SELECT current_setting('app.zelador_id', true)
$$ LANGUAGE SQL STABLE;

-- 2. Tabela: sessoes
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes FORCE ROW LEVEL SECURITY;

CREATE POLICY sessoes_zelador_isolation ON sessoes
  FOR ALL
  USING (zelador_id = app_current_zelador_id())
  WITH CHECK (zelador_id = app_current_zelador_id());

-- 3. Tabela: sessao_chunks
ALTER TABLE sessao_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessao_chunks FORCE ROW LEVEL SECURITY;

CREATE POLICY sessao_chunks_zelador_isolation ON sessao_chunks
  FOR ALL
  USING (zelador_id = app_current_zelador_id())
  WITH CHECK (zelador_id = app_current_zelador_id());

-- 4. Tabela: grimorio_pessoal
ALTER TABLE grimorio_pessoal ENABLE ROW LEVEL SECURITY;
ALTER TABLE grimorio_pessoal FORCE ROW LEVEL SECURITY;

CREATE POLICY grimorio_pessoal_zelador_isolation ON grimorio_pessoal
  FOR ALL
  USING (zelador_id = app_current_zelador_id())
  WITH CHECK (zelador_id = app_current_zelador_id());

-- 5. Tabela: notas_consulentes
ALTER TABLE notas_consulentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_consulentes FORCE ROW LEVEL SECURITY;

CREATE POLICY notas_consulentes_zelador_isolation ON notas_consulentes
  FOR ALL
  USING (zelador_id = app_current_zelador_id())
  WITH CHECK (zelador_id = app_current_zelador_id());

-- 6. Tabela: mapa_calculo
ALTER TABLE mapa_calculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapa_calculo FORCE ROW LEVEL SECURITY;

CREATE POLICY mapa_calculo_zelador_isolation ON mapa_calculo
  FOR ALL
  USING (zelador_id = app_current_zelador_id())
  WITH CHECK (zelador_id = app_current_zelador_id());

-- 7. Tabela: caminhantes (D-041)
ALTER TABLE caminhantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE caminhantes FORCE ROW LEVEL SECURITY;

CREATE POLICY caminhantes_zelador_isolation ON caminhantes
  FOR ALL
  USING (zelador_id = app_current_zelador_id())
  WITH CHECK (zelador_id = app_current_zelador_id());

-- 8. Tabela: caminhadas (D-041)
ALTER TABLE caminhadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE caminhadas FORCE ROW LEVEL SECURITY;

CREATE POLICY caminhadas_zelador_isolation ON caminhadas
  FOR ALL
  USING (zelador_id = app_current_zelador_id())
  WITH CHECK (zelador_id = app_current_zelador_id());

-- 9. Tabela: audit_logs (somente SELECT com policy — INSERT é sistema)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_self_select ON audit_logs
  FOR SELECT
  USING (
    user_id = app_current_zelador_id()
    OR app_current_zelador_id() = 'admin' -- role check simplificado
  );
-- INSERT/UPDATE/DELETE: sem policy (sistema gerencia)

-- 10. Tabelas SEM RLS (por design):
--    - akasha_users (identidade — auth)
--    - privacy_consents (append-only, sem FK; LGPD Art. 37)
--    - grimoire_chunks (corpus compartilhado)
--    - literature_papers (corpus compartilhado)
--    - pilares_curadoria (corpus compartilhado)
```

**Helper atualizado:**

```typescript
export async function withCaminhanteContext<T>(
  ctx: CaminhanteContext,
  fn: () => T,
): Promise<T> {
  return als.run(ctx, async () => {
    // Set tenant variable para RLS
    // IMPORTANTE: parametrized query (não string concat)
    await prisma.$executeRaw`
      SELECT set_config('app.zelador_id', ${ctx.zeladorId}, true)
    `;
    return fn();
  });
  // set_config(..., true) = SET LOCAL (auto-reset no fim da transação)
}
```

---

## 9. Recomendação + trade-offs

### 9.1 Recomendação consolidada

**Wave 30.5.x (este wave → ADR-DRAFT 0010):**

1. ✅ Manter app-layer helper (não mexer no `tenant-context.ts` além de hardening).
2. ✅ Adicionar **redação pré-embedder** (regex + whitelist MVP).
3. ✅ Adicionar **audit PII validator** (rejeita `metadata` com nome/email/telefone).
4. ✅ Gerar **`docs/legal/RIPD-Akasha.md`** (obrigatório por LGPD Art. 38).
5. ✅ Migration `sessao_chunks.redacted_from JSONB` para audit trail de redação.
6. ✅ Testes de regressão para embeddings cross-tenant.

**Wave 31.x (FedAkasha MVP):**
7. ✅ Manter helper + redação.
8. ✅ Adicionar DP-SGD ε=1 no FedAkasha Client.
9. ✅ Auditoria federada (round_id, K, ε, σ).

**Wave 32.x (SaaS — decisão a tomar):**
10. ⏸ **Reabrir ADR 0004.** Se virar SaaS multi-Zelador, **acoplar Postgres RLS** como 2ª camada.
11. ⏸ Helper estendido com `set_config('app.zelador_id', ...)`.

**Wave 33+:**
12. ⏸ Secure Aggregation se auditoria exigir.
13. ⏸ FHE só se compliance ultra-estrito justificar custo.

### 9.2 Trade-offs principais

| Decisão | Pró | Contra |
|---|---|---|
| Manter helper (não ir para RLS agora) | Simplicidade, 1 ponto de auditoria | Bypass possível via `$queryRaw` |
| Adicionar redação pré-embedder | Defesa contra gradient leakage | ~1-3% perda precisão semântica |
| RLS Wave 32+ | Defense in depth, audit-ready | +5-10% overhead, complexidade operacional |
| DP-SGD ε=1 | Compliance matemático | Utilidade menor (modelo mais ruidoso) |
| Secure Aggregation | Servidor não vê individual | +Complexidade criptográfica |
| FHE | Máxima privacidade | ~1000x slowdown, MVP inviável |

### 9.3 "O que NÃO fazer"

- ❌ **NÃO criar schema separado por Zelador** (rejeitado ADR 0004; overkill para MVP).
- ❌ **NÃO criar DB-per-tenant** (custo proibitivo).
- ❌ **NÃO enviar embeddings crus para federação** (Wave 31.x) sem redação + DP.
- ❌ **NÃO usar embeddings de API externa (OpenAI text-embedding-3)** — já proibido por ADR 0004 (LGPD Art. 33). Manter `@xenova/transformers` self-hosted.
- ❌ **NÃO pular RIPD** — LGPD Art. 38, multa ANPD até 2% do faturamento (máx. R$ 50M por infração).
- ❌ **NÃO fazer machine unlearning "removendo row" e achar que basta** — embeddings derivados podem estar em backup/replica. Documentar limitação.

### 9.4 Métricas de sucesso (Wave 30.5.x)

| Métrica | Target | Como medir |
|---|---|---|
| `% queries que cruzam tenant inadvertidamente` | 0% | Teste de regressão `tenant-context.test.ts` |
| `% chunks de embedding com PII raw` | <1% (regex MVP) | Audit de `redacted_from` |
| `% audit_logs com PII em metadata` | 0% | Audit PII validator |
| `Latência extra do redator` | <10ms por chunk | Benchmark |
| `RIPD aprovado por DPO + Zelador` | ✓ antes de Wave 31 | Workflow humano |
| `Cobertura de testes de regressão` | >90% | Vitest coverage |

---

## 10. Próximos passos

### 10.1 Imediato (Wave 30.5.x — este wave)

- [ ] Criar **ADR-DRAFT 0010** (`docs/adrs/0010-multi-tenant-embedding-hardening.md`) com base neste relatório.
- [ ] Criar **RIPD-Akasha.md** (`docs/legal/RIPD-Akasha.md`).
- [ ] Implementar `pii-redactor.ts` + testes.
- [ ] Implementar audit PII validator + testes.
- [ ] Migration `sessao_chunks.redacted_from JSONB`.
- [ ] Estender `tenant-context.test.ts` com casos de embedding cross-tenant.
- [ ] **Não mergear ainda** — esperar aprovação do Zelador em sessão síncrona.

### 10.2 Wave 31.x (FedAkasha MVP)

- [ ] Manter helper + redação.
- [ ] Implementar FedAkasha Client (Python sidecar + Opacus DP-SGD).
- [ ] Audit federada.
- [ ] **Bloqueio:** se RIPD não estiver aprovado, **não federar**.

### 10.3 Wave 32.x (SaaS — gate de decisão)

- [ ] **Pergunta ao Zelador:** "Akasha virou SaaS ou ainda é ferramenta individual?"
- [ ] Se sim → reabrir ADR 0004, planejar migration RLS.
- [ ] Se não → manter Wave 30.5.x.

### 10.4 Onde esta pesquisa falha (honestidade)

- **Não validei web** releases PG 16/17 (RLS incremental view maintenance), benchmarks ANPD 2025-2026, jurisprudência específica sobre embeddings como dado pessoal. [VERIFY]
- **Não tenho contato com DPO** para validar RIPD. Esta é uma proposta, não um documento aprovado.
- **Não medi performance** do helper atual em produção. Estimativas são baseadas em Prisma docs.
- **Não considerei** Vector DBs externos (Qdrant, Pinecone) — não estão no escopo hoje, mas se entrar, multi-tenancy vira problema novo (namespaces por Zelador).

### 10.5 Anexos

- **A.** Inspeção do código atual: `tenant-context.ts` (310 linhas), `consent.ts` (305 linhas), `audit-log.ts` (199 linhas).
- **B.** ADRs relevantes: 0004 (multi-tenant), 0005 (grafo), 0006 (MCP protocol).
- **C.** Migrations: `20260624000000_multitenant_core`, `20260624000001_vector_indexes`, `20260625090001_audit_lgpd_actions`.
- **D.** Modelo Prisma: `Sessao`, `SessaoChunk`, `GrimorioPessoal`, `NotasConsulente`, `MapaCalculo`, `Caminhante`, `Caminhada`, `PrivacyConsent`, `AuditLog`.

---

**FIM do relatório Wave 30.5.**

Branch: `wave-30.5-multi-tenant-isolated`
Base: `main` @ 0a8a0cb6
Próximo passo: 1 commit + push + pedir aprovação do Zelador antes de merge.