# Proposal: D-042 Schema Prisma — MandalaSnapshot (memória simbólica da Mandala Viva)

## Context

O glossário canônico (`CONTEXT.md:54-70`) define a **Mandala Viva** do
Caminhante como estado refinado pelos Jogos da Caminhada. Cada Jogo
produz um **snapshot** dos 4 elementos da Mandala (Akasha Type + Caminho
+ Setores + Autoridade), formando a **memória simbólica** do Caminhante
(mesmo quando o estado é idêntico ao anterior — é o "não-movimento" da
Mandala, melhor memória cheia do que silenciada por ruído).

Hoje (pós-D-041) temos `Caminhante` + `Caminhada` persistidos, mas a
Mandala ainda é recomputada on-the-fly (D-040 achado #2). A lacuna impede:

- Histórico cronológico da Mandala Viva (timeline da memória simbólica).
- Diff entre snapshots consecutivos (Setores com `intensidade + deltaIntensidade`).
- Assertividade da leitura do Mentor: sem histórico, o Mentor não consegue
  mostrar como a Mandala **respondeu** à intenção ao longo da Caminhada
  (mandato primário do `akasha-loop-daemon` em `CONTEXT.md:108`).

Este PROPOSAL adiciona **2 models novos** + **2 enums novos** + relações
reversas em `Caminhada` (e em `Jogo`, futuro). **Sem mudanças destrutivas**
nos 17 models atuais. Migration **não-aplicável** sem D-043 (`Jogo`):
a FK para `Jogo` é declarada no PROPOSAL mas só é válida após D-043
shipar (gate duplo).

## Glossário de referência (ancoragem)

- **Mandala Viva** — `CONTEXT.md:54` (refinamento da Mandala constitucional
  pelos Jogos da Caminhada).
- **Snapshot da Mandala Viva** — `CONTEXT.md:56-60` (4 elementos:
  Akasha Type + Caminho de Vida + Setores + Autoridade; 8 dimensões; diff
  vs snapshot anterior).
- **Autoridade Tipo vs Estado** — `CONTEXT.md:61-67` (Tipo constitucional
  **vai** no snapshot: `sagrada | emocional | esplênica | mental`; Estado
  Akáshico **NÃO vai** — UI-only F-227).
- **Forma compacta canônica** — `CONTEXT.md:78` (o que cabe no contexto
  do Mentor para interpretar qualquer Oráculo).
- **Caminhada** — `CONTEXT.md:34` (container de longo prazo para snapshots).
- **Jogo** — `CONTEXT.md:13` (evento que produz o snapshot ao fechar —
  depende D-043).

## Proposed Changes

### 1. `schema.prisma` — 2 models novos

```prisma
// ─── D-042: MandalaSnapshot (memória simbólica) + MandalaSnapshotSetor ────
// Cada Jogo fechado (D-043) produz um MandalaSnapshot (1:1 com Jogo).
// Setores via tabela irmã (não JSON) — queryable, diff-able, indexável.
// Ver apps/akasha-portal/prisma/designs/d-042-prisma-mandala-snapshot-proposal.md
// e CONTEXT.md:54-70.

model MandalaSnapshot {
  id              String   @id @default(cuid())

  // FKs
  jogoId          String   @unique            // 1:1 com Jogo (D-043)
  jogo            Jogo     @relation(fields: [jogoId], references: [id], onDelete: Cascade)
  caminhadaId     String                       // redundante p/ queries (timeline da memória simbólica)
  caminhada       Caminhada @relation(fields: [caminhadaId], references: [id], onDelete: Cascade)

  // 4 elementos da Mandala (ver Glossário)
  // AkashaType + CaminhoVida: Int + Zod app-layer (range enforço é runtime)
  akashaType      Int                          // Zod: ∈ [1, 9]
  caminhoVida     Int                          // Zod: ∈ [1..9, 11, 22, 33]
  autoridade      MandalaAutoridade            // enum nativo (Tipo constitucional)

  // Setores via tabela irmã
  setores         MandalaSnapshotSetor[]

  // Metadados (auditoria do algoritmo)
  synthesVersion  String   @default("v1")      // versão do algoritmo de síntese
  produzidoEm     DateTime @default(now())     // imutável pós-criação; = Jogo.dataFechamento

  @@index([caminhadaId, produzidoEm])          // timeline da memória simbólica
  @@map("mandala_snapshots")
}

enum MandalaAutoridade {
  sagrada
  emocional
  esplenica
  mental
}

model MandalaSnapshotSetor {
  id                String   @id @default(cuid())

  snapshotId        String
  snapshot          MandalaSnapshot @relation(fields: [snapshotId], references: [id], onDelete: Cascade)

  dimensao          DimensaoId                       // enum nativo (8 dimensões canônicas)
  intensidade       Decimal  @db.Decimal(5, 2)       // 0.00–100.00 (canônico; alinha com chakra-v4/cross-engine)
  deltaIntensidade  Decimal? @db.Decimal(5, 2)       // -100.00..+100.00; NULL no 1º snapshot da Caminhada

  @@unique([snapshotId, dimensao])                  // 8 rows por snapshot, uma por dimensão
  @@map("mandala_snapshot_setores")
}

enum DimensaoId {
  saude
  trabalho
  amor
  criacao
  proposito
  familia
  espiritualidade
  superacao
}
```

### 2. `schema.prisma` — relação reversa na `Caminhada`

Adicionar ao model `Caminhada` (após `consentimentoPilar4Uso Json?`,
linha 409):

```prisma
  snapshots        MandalaSnapshot[]
```

(Substitui o placeholder comentado na linha 415-416.)

### 3. `schema.prisma` — relação reversa futura na `Jogo` (D-043)

Adicionar ao model `Jogo` (D-043 — não existe ainda):

```prisma
  mandalaSnapshot  MandalaSnapshot?
```

### 4. App layer — Zod schemas (escopo separado, pós-approval)

Em `apps/akasha-portal/src/lib/application/caminhante/snapshot/schemas.ts`:

```ts
import { z } from 'zod';

export const DIMENSOES = [
  'saude',
  'trabalho',
  'amor',
  'criacao',
  'proposito',
  'familia',
  'espiritualidade',
  'superacao',
] as const;

export const MandalaSnapshotSetorSchema = z.object({
  dimensao: z.enum(DIMENSOES),
  intensidade: z.number().min(0).max(100).multipleOf(0.01),
  deltaIntensidade: z.number().min(-100).max(100).multipleOf(0.01).nullable(),
});

export const MandalaSnapshotInputSchema = z.object({
  jogoId: z.string().cuid(),
  caminhadaId: z.string().cuid(),
  akashaType: z.number().int().min(1).max(9),
  caminhoVida: z.number().int().refine((n) => n >= 1 && n <= 9 || n === 11 || n === 22 || n === 33, {
    message: 'caminhoVida deve ser 1-9 ou mestre (11, 22, 33)',
  }),
  autoridade: z.enum(['sagrada', 'emocional', 'esplenica', 'mental']),
  setores: z.array(MandalaSnapshotSetorSchema).length(8), // invariante: 8 rows
});
```

### 5. App layer — hook de criação (escopo separado, pós-approval)

Em `apps/akasha-portal/src/lib/application/caminhante/snapshot/create-on-jogo-close.ts`:

- Hook invocado pelo handler de `PATCH /api/akasha/jogos/:id/status`
  quando `status` transita `aberto → fechado`.
- Valida `MandalaSnapshotInputSchema` (Zod).
- Cria 1 `MandalaSnapshot` + 8 `MandalaSnapshotSetor` em transação única.
- Se for o 1º snapshot da `Caminhada` (`SELECT 1 FROM mandala_snapshots WHERE caminhadaId = ?`):
  força `deltaIntensidade = NULL` em todos os 8 setores.
- Caso contrário: computa `deltaIntensidade = intensidade_atual - intensidade_anterior`
  usando o snapshot imediatamente anterior da mesma `caminhadaId` (ORDER BY `produzidoEm` DESC LIMIT 1).
- Sem `upsert` — snapshots são **imutáveis pós-criação** (invariante lógica).

### 6. API routes novos (escopo separado, pós-approval)

- `GET /api/akasha/caminhadas/:id/snapshots` — listar timeline da
  memória simbólica da Caminhada.
- `GET /api/akasha/caminhadas/:id/snapshots/latest` — último snapshot
  (drill-down na UI da Mandala Viva).
- `GET /api/akasha/jogos/:id/snapshot` — snapshot produzido pelo Jogo
  (1:1).
- `GET /api/akasha/caminhantes/:id/mandala` — última Mandala conhecida
  (para o Mentor interpretar Oráculo em `Consultation`).
- `GET /api/akasha/caminhadas/:id/snapshots/:snapshotId/diff` — diff
  explícito entre 2 snapshots consecutivos (visualização "como a Mandala
  respondeu à intenção").

## Architectural Decisions (ADRs inline)

| # | Decisão | ADR | Reversibilidade |
|---|---|---|---|
| D-042.1 | 1:1 snapshot↔Jogo (`jogoId @unique`) | — | Trivial (drop UNIQUE). |
| D-042.2 | `akashaType Int` + `caminhoVida Int` + Zod app-layer | — | Trivial (range enforço é runtime, não DB). |
| D-042.3 | Setores via tabela irmã `MandalaSnapshotSetor` (não JSON) | — | Trivial (migração de dados opcional — JSON → tabela). |
| D-042.4 | **Enum nativo `MandalaAutoridade { sagrada emocional esplenica mental }`** (PT-PT sem acento) | **ADR D-042.1** | **Hard to reverse** — adicionar 5º valor é trivial; renomear/remover valor exige migration + refator em `synthesizer.ts:127-145` + `akasha-authority.ts:43-71`. |
| D-042.5 | **`intensidade Decimal(5,2)` 0.00–100.00 + `deltaIntensidade Decimal?` -100..+100** | **ADR D-042.2** | **Hard to reverse** — mudar escala é ADR (decisão irreversível sobre taxonomia; alinha com chakra-v4 + cross-engine, diverge de `frequency-analysis.ts:11` que usa 1-3 — ver cross-ref #2 em "Out of scope"). |
| D-042.6 | **Estado Akáshico (`paz \| ansiedade \| neutro`) NÃO vai no snapshot** (UI-only F-227) | — | Trivial. |
| D-042.7 | `synthesVersion String @default("v1")` — audit do algoritmo | — | Trivial (string livre). |
| D-042.8 | `produzidoEm DateTime @default(now())` = `Jogo.dataFechamento` (imutável pós-criação) | — | Trivial. Imutabilidade é invariante lógica (não DB). |
| D-042.9 | FK declarada para `Jogo` (gate duplo; não-aplicável até D-043) | — | Trivial. |
| D-042.10 | 8 dimensões canônicas (`DimensaoId` enum nativo, código-fonte de verdade em `dimensoes.ts:57-130` + F-223) | — | Trivial (re-dedup manual se mudar). |

### ADR D-042.1 — Enum nativo `MandalaAutoridade`

**Status:** accepted (sessão 7, transcrito do handoff sessão 6 decisão 5b).

**Contexto.** O framework F-227 define 4 Tipos de Autoridade canônicos:
`sagrada | emocional | esplenica | mental`. Fonte executável:
`apps/akasha-portal/src/lib/grimoire/synthesizer.ts:127-145`
(`deriveAkashaAuthority`) + `apps/akasha-portal/src/lib/grimoire/akasha-authority.ts:43-71`.
O snapshot precisa carregar o Tipo (constitucional) — não o Estado
(momento, UI-only).

**Decisão.** Usar **enum nativo Prisma** `MandalaAutoridade` com 4 valores
em PT-PT (sem acento: `esplenica` — canônico no enum; UI PT-BR pode
renderizar com acento `esplênica`).

**Consequências.**
- (+) DB-level integrity (não dá pra inserir valor fora do enum).
- (+) Type-safety no `@prisma/client` gerado.
- (−) Adicionar 5º valor (ex.: `integrativa` se framework F-227 evoluir)
  é trivial, mas **renomear** um valor exige migration + refator em
  `synthesizer.ts:127-145` + `akasha-authority.ts:43-71` + toda UI que
  exibe o Tipo. Tratar como **hard to reverse**.
- (−) Estado Akáshico (`paz | ansiedade | neutro`) **não** entra neste
  enum — é UI-only F-227 (ver cross-ref #3 em "Out of scope").

**Alternativas consideradas.**
- *String livre com Zod app-layer.* Rejeitada: DB-level integrity vale
  o trade-off de migration pesada para renomeação.
- *Json com shape arbitrário.* Rejeitada: mesma razão + pior DX no
  client gerado.

### ADR D-042.2 — Escala `Decimal(5,2)` 0.00–100.00

**Status:** accepted (sessão 7, transcrito do handoff sessão 6 decisão 3b).

**Contexto.** A Mandala expressa **intensidade por setor**. Três escalas
estão em uso na codebase atual:

- `Decimal(5,2)` 0.00–100.00 — canônico em `chakra-v4` + `cross-engine.ts:379, 394, 401`.
- `Int 1-3` — `frequency-analysis.ts:11` (escala qualitativa ordinal).
- `Decimal` sem range — `spiritual-engine.ts:257`.

**Decisão.** D-042 adota **`Decimal(5,2)` 0.00–100.00** para `intensidade`
e **`Decimal(5,2)` -100.00..+100.00** para `deltaIntensidade`. Alinha
com chakra-v4 + cross-engine (maioria dos engines).

**Consequências.**
- (+) Consistência com engines majoritários.
- (+) Granularidade fina (2 casas decimais) sem overhead.
- (−) **Hard to reverse** — mudar escala é decisão irreversível sobre
  taxonomia (exige migration + refator de qualquer leitura histórica
  que assuma 0-100).
- (−) Divergência residual com `frequency-analysis.ts:11` (escala 1-3).
  Cleanup registrado como cross-ref #2 em "Out of scope" — exige ADR
  separado em sessão dedicada "harmonização de escalas".

**Alternativas consideradas.**
- *Int 0-1000.* Rejeitada: granularidade sem ganho semântico.
- *Float.* Rejeitada: precisão decimal crítica para diff entre snapshots.
- *Percentual como Int 0-10000 (basis points).* Rejeitada: granularidade
  excessiva, sem uso real.

## Open Dependencies

**Esta seção é obrigatória.** D-042 **NÃO É APLICÁVEL** sem D-043
shipar. Sem D-043, `prisma validate` falha (FK declarada para model
`Jogo` inexistente).

- **D-043 `Jogo` + `JogoStatus`** — model `Jogo` + enum
  `JogoStatus { aberto | fechado }`. A migration de D-042 depende de
  D-043 estar aplicada primeiro (FK para `Jogo`).
- **D-043 inclui o hook** que dispara `create-on-jogo-close.ts` no
  fechamento do Jogo (handler `PATCH /api/akasha/jogos/:id/status`).
- **Sequência recomendada:**
  1. D-043 grillada + PROPOSAL aplicado (migration `043_jogo`).
  2. D-042 aplicado (migration `042_mandala_snapshot`).
  3. App-layer Zod + 5 API routes + hook de fechamento.

**Se D-042 for aplicada antes de D-043** (não-recomendado, gate
duplo), `prisma validate` falha com "relation `MandalaSnapshot.jogo`
references non-existing model `Jogo`". Rollback é trivial (ver Risk
and Rollback) mas a aplicação prematura perde o propósito.

## Out of scope (D-042)

- **D-043 `Jogo`** — gate aberto; dependência declarada acima.
- **Aplicar migration** — gate humano (Work Guidance em
  `apps/akasha-portal/prisma/AGENTS.md:69-82`).
- **App-layer Zod** para snapshot (ver §4 acima).
- **Hook de criação** no fechamento do Jogo (ver §5 acima).
- **5 API routes** de snapshot (ver §6 acima).
- **Cleanup dos 3 cross-refs surfaced na sessão 6** (registrados no
  handoff sessão 6, fora do escopo D-042 — não corrigidos):
  1. Header "9 dimensões" → "8" em
     `apps/akasha-portal/src/lib/grimoire/synthesis/synthesizer.ts:218, 252`
     (cosmética; tests em `dimensoes.test.ts:58` asseveram 8).
  2. Escala intensidade 0-100 vs 1-3 entre
     `frequency-analysis.ts:11` (1-3) e
     `spiritual-engine.ts:257` + `cross-engine.ts:379, 394, 401` (0-100).
     ADR separado em sessão dedicada "harmonização de escalas".
  3. Campo `autoridadeAkasha.tipo: 'paz' | 'ansiedade'` embedado em
     `DimensaoSintese` (`synthesizer.ts:308-312`) — refator de UI quando
     Estado Akáshico virar produto (não só F-227 prompt). Hoje Estado é
     UI-only e **não** entra no snapshot.
- **`grimoire/mentor/system-prompt.md` ausente** — `FALLBACK_PROMPT`
  sempre ativo; pendência menor pré-existente, fora de escopo.
- **`src/lib/infrastructure/grimoire-sync.ts:228`** — `return {…}` fora
  de função (sintaxe quebrada, typecheck falha). Pré-existente, não
  escopo desta sessão.

## Migration Plan

1. **Schema update** — adicionar `MandalaSnapshot`, `enum MandalaAutoridade`,
   `MandalaSnapshotSetor`, `enum DimensaoId`, relação reversa em `Caminhada`,
   e (em D-043) relação reversa em `Jogo`.
2. **Migration** — após aprovação humana **e após D-043 aplicado**:
   - Estratégia padrão: `pnpm exec prisma migrate dev --name 042_mandala_snapshot`
   - **Estratégia fallback** (drift documentado em
     `apps/akasha-portal/prisma/AGENTS.md:25-30`):
     `pnpm exec prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`
     + INSERT manual em `_prisma_migrations` (mesma estratégia do D-041).
     **Necessário** porque shadow DB replay falha (`cycle_snapshots`,
     `area_history`, `exercise_completions` foram criados via `db push`,
     fora do migration history).
3. **Backfill** — nenhum (tabelas vazias; zero produção).
4. **App update** — Zod schemas + `create-on-jogo-close.ts` hook + 5 API
   routes novos (escopo separado, pós-approval).
5. **Ordem de rollout** — D-043 primeiro, depois D-042, depois app layer.
   Schema primeiro (idempotente, sem código dependente), app layer depois.

## Risk and Rollback

- **Risk:** migration aditiva. Sem mudança destrutiva nos 17 models
  atuais. Backward compat OK (D-040 D2 não violado).
- **Risk:** drift documentado em `apps/akasha-portal/prisma/AGENTS.md:25-30`
  (shadow DB não replay). Mitigação: usar estratégia de
  `prisma migrate diff --from-config-datasource --to-schema
  prisma/schema.prisma --script` + INSERT manual em `_prisma_migrations`
  (mesma estratégia do D-041).
- **Risk:** dependência D-043 — se D-042 for aplicada antes de D-043,
  `prisma validate` falha (FK para `Jogo` inexistente). Mitigação:
  gate duplo declarado explicitamente em "Open Dependencies"; D-042
  não-aplicável até D-043 shipar.
- **Risk:** enum nativo `MandalaAutoridade` é **hard to reverse**
  (ADR D-042.1). Mitigação: enum declarado com 4 valores finais do
  framework F-227 (sem expectativa de renomeação); adição de 5º valor
  é trivial via migration.
- **Risk:** escala `Decimal(5,2)` 0.00-100.00 é **hard to reverse**
  (ADR D-042.2). Mitigação: alinha com chakra-v4 + cross-engine
  (maioria); divergência residual com frequency-analysis registrada
  como cross-ref #2 (sessão dedicada).
- **Rollback:** `pnpm exec prisma migrate resolve --rolled-back` + DROP
  TABLE `mandala_snapshots`, `mandala_snapshot_setores` + DROP TYPE
  `MandalaAutoridade`, `DimensaoId`. Trivial (tabelas vazias no MVP).
  Sem perda de dados (zero produção).

## Verification (smoke tests planejados, pós-D-043)

1. `pnpm exec prisma validate` passa (após D-043 aplicar).
2. `pnpm db:generate` regenera client sem erro.
3. `pnpm --filter akasha-portal typecheck` 0 errors.
4. **Smoke test manual** (após D-043 + D-042 aplicados):
   1. Criar Jogo `A` (tipo Apresentação) para Caminhada `X` → fechar
      → 1 snapshot produzido com 8 setores, todos com
      `deltaIntensidade IS NULL` (1º snapshot da Caminhada).
   2. Tentar criar outro Jogo `B` para Caminhada `X` e associar
      snapshot ao mesmo Jogo `A` (simulando erro de aplicação) →
      **409** (`jogoId UNIQUE` colide).
   3. Criar 2º Jogo `C` para Caminhada `X` → fechar → 1 snapshot
      produzido com 8 setores, todos com `deltaIntensidade IS NOT NULL`
      e respeitando range Zod `[-100, +100]`.
   4. Listar timeline de Caminhada `X` → snapshots em ordem cronológica
      (`ORDER BY produzidoEm ASC`).
   5. Validar que `akashaType = 0` ou `caminhoVida = 10` rejeitados
      pela API (Zod 400, antes de chegar ao DB).
   6. Validar que `autoridade = "inválida"` rejeitada pela API
      (Zod enum 400, antes de chegar ao DB).

## Approval Required

Aprovação humana **e** D-043 aplicado antes de
`pnpm exec prisma migrate dev --name 042_mandala_snapshot`.

Gate duplo:
1. Aprovação deste PROPOSAL (reviewer humano lê diff + ADRs + riscos).
2. D-043 (`Jogo` + `JogoStatus`) já aplicado — pré-requisito da FK.

---

**Author:** sessão 7 (transcrição do handoff sessão 6 / `/grilling` puro),
2026-06-22.
**Anchors:** `CONTEXT.md:54-70, 78`. Handoff sessão 6 (decisões #1-#6 +
sub-itens 3a, 3b, 5b, 6b). `apps/akasha-portal/prisma/AGENTS.md:69-82`
(PROPOSAL-only policy). `apps/akasha-portal/prisma/designs/d-041-prisma-caminhante-caminhada-proposal.md`
(template de formato).
