# Proposal: D-XXX Schema Multi-Tenant para Consulentes (estende D-041)

## Context

Apos realignment da visao (Akasha = ferramenta do Zelador, nao SaaS pra usuario final — ver `docs/25_visao-akasha.md` revisada em 2026-06-23), o modelo de dados precisa suportar:

1. **Multi-tenant**: o Zelador atende N consulentes. Cada consulente tem dados isolados (anamnese, 7 Pilares calculados, historico de sessoes, grimorios pessoais). Consulta a um consulente NAO pode vazar dados de outro.
2. **Consulente como "MCP logico"** na interface chat: quando Zelador clica num consulente, o chat carrega automaticamente os grimorios pessoais, historico e prescricoes previas daquele consulente.
3. **Reuso de D-041**: `Caminhante` (pessoa atendida pelo Zelador, sem login) + `Caminhada` (relacao) ja foram aplicados (migration `20260622000000_041_caminhante_caminhada/`). **Nao criar schema paralelo** — estender.
4. **RAG isolado por consulente**: cada consulente tem seu proprio espaco de embeddings (grimorios pessoais + sessoes) + retrieval cross-consulente **proibido** (LGPD + etica profissional).

**Research basis:**
- `/home/skynet/cabala-dos-caminhos/.hermes/plans/research-rag-multitenant-2026-06-23.md` (Research 1)
- `/home/skynet/cabala-dos-caminhos/docs/adrs/0004-multi-tenant-consulente-mcp.md` (ADR 0004, accepted)

## Decision

**Estender D-041 com 5 models novos + reusar stack pgvector existente.**

### Stack (do ADR 0004, accepted)

- **Vector store**: pgvector (ja em producao)
- **Embeddings**: `@xenova/transformers` (self-hosted, multilingual, 768d)
- **Multi-tenant**: app-layer `withCaminhanteContext()` proxy helper
- **Retrieval**: weighted UNION ALL (grimorio pessoal 1.0 + sessoes 0.8 + global 0.4)

## Proposed Changes

### 1. `schema.prisma` — 5 models novos (estende D-041)

```prisma
// Estende User (Zelador) — sem mudanca. User ja existe em D-041.
// Estende Caminhante (consulente) — sem mudanca. Caminhante ja existe em D-041.
// Estende Caminhada (relacao) — sem mudanca. Caminhada ja existe em D-041.

model Sessao {
  id            String   @id @default(cuid())

  // FKs (denormalizadas — alinha precedent de D-041 em Caminhada)
  zeladorId     String
  zelador       User     @relation(fields: [zeladorId], references: [id], onDelete: Cascade)
  caminhadaId   String
  caminhada     Caminhada @relation(fields: [caminhadaId], references: [id], onDelete: Cascade)

  // Metadata
  tipo          TipoSessao       // Apresentacao | Leitura | Ritual | Aconselhamento | Integracao
  status        StatusSessao     @default(aberta)
  abertoEm      DateTime         @default(now())
  fechadoEm     DateTime?

  // Conteudo
  // (notas privadas do Zelador sao armazenadas em GrimorioPessoal, NAO aqui)

  // Relations
  chunks        SessaoChunk[]

  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  @@index([zeladorId, caminhadaId, abertoEm])    // listagem por consulente
  @@index([zeladorId, status])                   // dashboard de sessoes abertas
  @@map("sessoes")
}

enum TipoSessao {
  Apresentacao
  Leitura
  Ritual
  Aconselhamento
  Integracao
}

enum StatusSessao {
  aberta
  fechada
}

model SessaoChunk {
  id              String   @id @default(cuid())

  // FKs
  zeladorId       String
  zelador         User     @relation(fields: [zeladorId], references: [id], onDelete: Cascade)
  sessaoId        String
  sessao          Sessao   @relation(fields: [sessaoId], references: [id], onDelete: Cascade)

  // Conteudo chunked
  texto           String                              // chunk text (markdown-friendly)
  embedding       Unsupported("vector(768)")?         // pgvector embedding (768d)
  origem          String                              // "zelador" | "mentor" | "consulente"
  metadata        Json?                               // flexivel (ex: timestamp, pilarId, etc)

  // Relations
  createdAt       DateTime         @default(now())

  @@index([zeladorId, sessaoId])
  @@index([zeladorId])
  // NOTA: indice IVFFlat ou HNSW para embedding e criado via raw SQL na migration
  @@map("sessao_chunks")
}

model GrimorioPessoal {
  id              String   @id @default(cuid())

  // FKs (denormalizadas — escopo por Zelador + Caminhante)
  zeladorId       String   @unique // 1:1 com Zelador por design (grimorio pessoal DO Zelador)
  zelador         User     @relation(fields: [zeladorId], references: [id], onDelete: Cascade)
  // NOTA: NAO ha `caminhanteId` aqui — GrimorioPessoal e escopado por Zelador,
  // NAO por consulente. Os grimorios DE consulentes sao "NotasConsulente" (ver abaixo).

  // Conteudo estruturado (markdown-like)
  prescricoes    String?              // "ervas", "praticas", "oraculos", "firmesas"
  notasInternas  String?              // reflexoes do Zelador sobre o metodo
  bibliografia   String?              // referencias externas (Cumino, Saraceni, etc)

  // Metadata
  atualizadoEm   DateTime         @updatedAt
  createdAt      DateTime         @default(now())

  @@map("grimorios_pessoais")
}

model NotasConsulente {
  id              String   @id @default(cuid())

  // FKs (escopo por Zelador + Caminhante — multi-tenant)
  zeladorId       String
  zelador         User     @relation(fields: [zeladorId], references: [id], onDelete: Cascade)
  caminhadaId     String
  caminhada       Caminhada @relation(fields: [caminhadaId], references: [id], onDelete: Cascade)

  // Conteudo
  categoria       CategoriaNota   // observacao | prescricao | ritual | firmeza | intercorrencia
  titulo          String
  conteudo        String
  contexto        Json?            // flexivel (ex: pilar, odu, sessaoId)
  tags            String[]         // free-form

  // Auditoria
  criadoEm        DateTime         @default(now())
  atualizadoEm    DateTime         @updatedAt

  @@index([zeladorId, caminhadaId, categoria])    // listagem por consulente + categoria
  @@index([zeladorId, atualizadoEm])              // feed cronologico
  @@map("notas_consulentes")
}

enum CategoriaNota {
  observacao
  prescricao
  ritual
  firmeza
  intercorrencia
}

model MapaCalculo {
  id              String   @id @default(cuid())

  // FKs (escopo por Zelador + Caminhante — multi-tenant)
  zeladorId       String
  zelador         User     @relation(fields: [zeladorId], references: [id], onDelete: Cascade)
  caminhadaId     String
  caminhada       Caminhada @relation(fields: [caminhadaId], references: [id], onDelete: Cascade)

  // 7 Pilares calculados (cache — evita recalcular em cada consulta)
  // Estrutura segue `MandalaData` (ver /api/akasha/mandala/route.ts)
  cabala          Json?     // Pilar 1: Numerologia Cabalistica
  astrologia      Json?     // Pilar 2: Astrologia Ocidental
  tantra          Json?     // Pilar 3: Numerologia Tantrica + Ayurveda
  odu             Json?     // Pilar 4: Odu de Nascimento (Merindilogun)
  iching          Json?     // Pilar 5: I Ching
  // Pilar 6 e 7 adicionados em Wave 4 (ver D-YYY, D-ZZZ)
  pilar6          Json?
  pilar7          Json?

  // Setores derivados (auto-correlacionados)
  setores         Json?     // 8 dimensoes (saude, trabalho, amor, etc)

  // Auditoria
  versaoCalculo   String              // ex: "v1", "v2" — para invalidar cache se algoritmo muda
  calculadoEm     DateTime            @default(now())
  atualizadoEm    DateTime            @updatedAt

  @@unique([zeladorId, caminhadaId])  // 1 calculo por consulente
  @@index([zeladorId, versaoCalculo])
  @@map("mapas_calculo")
}
```

### 2. `schema.prisma` — relations reversas em User e Caminhada

```prisma
// Adicionar ao model User (depois de `currentRefreshTokenJti`):
  sessoes              Sessao[]
  sessaoChunks         SessaoChunk[]
  grimorioPessoal      GrimorioPessoal?
  notasConsulentes     NotasConsulente[]
  mapasCalculo         MapaCalculo[]

// Adicionar ao model Caminhada (depois de relations existentes):
  sessoes              Sessao[]
  notasConsulentes     NotasConsulente[]
  mapasCalculo         MapaCalculo[]
```

### 3. Migration Plan (copy-don't-move, 2 steps)

**Migration `XXX_001_multitenant_core`** (Wave 3 — apply now):
- ADD TABLE `sessoes`, `sessao_chunks`, `grimorios_pessoais`, `notas_consulentes`, `mapas_calculo`
- ADD INDEXES per model
- (no data migration needed — tabelas vazias)

**Migration `XXX_002_vector_indexes`** (Wave 3 — apply after table creation):
- CREATE INDEX ON `sessao_chunks` USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
- (raw SQL — Prisma nao suporta indice IVFFlat/HNSW nativamente)

### 4. App-layer: helper `withCaminhanteContext()`

```typescript
// /apps/akasha-portal/src/lib/application/tenant-context.ts (NOVO)

import { AsyncLocalStorage } from 'node:async_hooks'
import { prisma as rawPrisma } from '@/lib/infrastructure/prisma'
import type { Prisma, PrismaClient } from '@prisma/client'

export interface CaminhanteContext {
  zeladorId: string
  caminhadaId: string
  // (opcional) outras dimensoes de escopo
}

const als = new AsyncLocalStorage<CaminhanteContext>()

export function withCaminhanteContext<T>(ctx: CaminhanteContext, fn: () => T): T {
  return als.run(ctx, fn)
}

export function getCaminhanteContext(): CaminhanteContext | undefined {
  return als.getStore()
}

const SCOPED_MODELS = new Set([
  'Sessao',
  'SessaoChunk',
  'GrimorioPessoal',
  'NotasConsulente',
  'MapaCalculo',
  // D-041 models (ja existentes)
  'Caminhante',
  'Caminhada',
  // (User nao — Zelador e single-tenant por design)
])

export const prisma = rawPrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!SCOPED_MODELS.has(model)) return query(args)
        const ctx = getCaminhanteContext()
        if (!ctx) {
          throw new Error(
            `[Tenant] Missing CaminhanteContext for scoped model ${model}. ` +
            `Use withCaminhanteContext() or pass explicit where.zeladorId.`
          )
        }
        // Injeta filtros automaticamente
        args = args || ({} as any)
        args.where = { ...(args.where || {}), zeladorId: ctx.zeladorId }
        if (model !== 'GrimorioPessoal') {
          // GrimorioPessoal e escopado por Zelador (nao por consulente)
          args.where.caminhadaId = ctx.caminhadaId
        }
        return query(args)
      },
    },
  },
})
```

### 5. API routes novos

- `GET /api/akasha/caminhantes/:id/sessoes` — lista sessoes do consulente
- `POST /api/akasha/caminhantes/:id/sessoes` — cria nova Sessao (tipo: Apresentacao | Leitura | ...)
- `PATCH /api/akasha/sessoes/:id/fechar` — fecha sessao (gera embeddings dos chunks)
- `GET /api/akasha/caminhantes/:id/notas` — lista NotasConsulente (categoria, busca full-text)
- `POST /api/akasha/caminhantes/:id/notas` — cria nota
- `GET /api/akasha/caminhantes/:id/mapa` — retorna MapaCalculo (cache hit) ou recalcula

## Architectural Decisions (inline)

| # | Decision | Justification | Reversibility |
|---|---|---|---|
| D-XXX.1 | Estender D-041 (reusar Caminhante) | Schema ja aplicado; sem duplicacao | Trivial — rollback = drop tables |
| D-XXX.2 | 5 models novos (Sessao, SessaoChunk, GrimorioPessoal, NotasConsulente, MapaCalculo) | Cobre todos os use cases do Zelador-tool | Trivial — drop tables |
| D-XXX.3 | `withCaminhanteContext()` proxy via AsyncLocalStorage | Isolation app-layer (sem RLS) | Medium — reescrita de toda query |
| D-XXX.4 | `GrimorioPessoal` e escopado por **Zelador** (nao por consulente) | Grimorio pessoal DO Zelador (seus proprios metodos/prescricoes), NAO do consulente | Trivial |
| D-XXX.5 | `NotasConsulente` e escopado por **Zelador + Caminhada** | Notas especificas do consulente, dentro do contexto de uma Caminhada | Trivial |
| D-XXX.6 | Embeddings 768d (mesma dimensao do grimoire global) | Reusa stack pgvector existente | Hard — mudanca requer recriar embeddings |
| D-XXX.7 | `MapaCalculo` com cache por (zeladorId, caminhadaId) | Evita recalcular 7 Pilares em cada consulta | Trivial |

### Why no ADR formal (criteria check)

1. **Hard to reverse** — **Partial** (caches sao faceis; estrutura multi-tenant e' reversivel mas caro).
2. **Surprising without context** — **No** (extensao de D-041, segue padrao canonico).
3. **Real trade-off** — **Yes** (GrimorioPessoal escopado por Zelador vs por Caminhada; NotasConsulente vs sessao embed).

**Decision:** Documentar inline (proposal). Se aparecer decisao realmente dura no Wave 3 (ex: "MapaCalculo deve ser append-only ou substituivel"), criar ADR formal.

## Open Dependencies

- **D-041** (Caminhante + Caminhada) — **applied** (2026-06-22). Nenhuma mudanca necessaria.
- **D-YYY** (Pilar 6 mapping) — **Wave 4**. Quando implementado, adicionar campos `pilar6`/`pilar7` em MapaCalculo (ja placeholders).
- **D-ZZZ** (Pilar 7 mapping) — **Wave 4**. Idem.
- **pgvector extension** — **ja instalado** (`extensions = [pgvector(map: "vector")]` no schema).
- **`@xenova/transformers`** — Wave 3 implementation (npm install).
- **Vercel AI SDK** — Wave 3 implementation (ja tem `ai` no package.json, verificar versao).

## Migration Plan

1. **Wave 2 (now)**: Este proposal aceito (revisao tua)
2. **Wave 3**: Apply migration `XXX_001_multitenant_core` (manual via `prisma migrate dev`)
3. **Wave 3**: Apply migration `XXX_002_vector_indexes` (raw SQL via psql)
4. **Wave 3**: Implementar `withCaminhanteContext()` helper + testes de regressao
5. **Wave 3**: Implementar 6 API routes novas
6. **Wave 3**: Suite de testes E2E multi-tenant

## Risk and Rollback

- **Risk:** Migration aditiva (5 tabelas novas + indexes). Sem mudanca destrutiva nos 19 models existentes.
- **Risk:** `withCaminhanteContext()` helper e' propenso a bugs (se Zelador esquecer de usar, query vaza cross-tenant). Mitigacao: suite de testes de regressao + code review obrigatorio.
- **Risk:** Performance do `ivfflat` index em escala (limite ~100k vetores confortavelmente). Mitigacao: monitorar, migrar para `hnsw` se necessario (Wave 5+).
- **Rollback:** `git revert <sha>` + manual `DROP TABLE` em ordem reversa.

## Verification

- `pnpm exec prisma validate` passa
- `pnpm --filter akasha-portal typecheck` 0 errors
- **Teste de regressao multi-tenant:**
  - Criar Zelador A com Caminhante X
  - Criar Zelador B com Caminhante Y
  - Tentar acessar dados de X como B → 403 / vazio
  - Tentar acessar dados de Y como A → 403 / vazio
- **Smoke test manual:**
  1. Login como Zelador
  2. Selecionar Caminhante no chat
  3. Mensagem: "como ele esta hoje?" → IA consulta APENAS grimorios + sessoes daquele Caminhante
  4. Verificar log: query SQL deve ter `WHERE zeladorId = $1 AND caminhadaId = $2`

## Approval Required

Aprovacao tua antes de Wave 3 aplicar migration.

---

**Author:** vision realignment session + research consolidation (2026-06-23).
**Anchors:**
- `CONTEXT.md` (glossario: Caminhante, Caminhada, Zelador)
- `docs/25_visao-akasha.md` (visao revisada)
- `docs/adrs/0004-multi-tenant-consulente-mcp.md` (ADR 0004, accepted)
- `apps/akasha-portal/prisma/AGENTS.md:69-82` (migration protocol)
- `.hermes/plans/research-rag-multitenant-2026-06-23.md` (Research 1)
