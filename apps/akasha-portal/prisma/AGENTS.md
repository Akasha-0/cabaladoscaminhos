# Prisma DOX

## Purpose

Camada de persistência do Portal Akasha — Prisma ORM 7 sobre PostgreSQL
(com extensão `pgvector` para RAG do Mentor). Define o schema canônico dos
25 models que sustentam Mandala, Mandato, Mentor, Diário Energético e
billing.

## Ownership

- `schema.prisma`: schema-fonte único. **25 models canonicos** (apos D-041 +
  D-XXX Wave 3 + D-YYY/D-ZZZ Wave 4): `User`, `BirthChart`, `Subscription`,
  `CreditEntry`, `Manifesto`, `DailyReading`, `RitualCompletion`,
  `Consultation`, `ChatMessage`, `PushSubscription`, `GrimoireEntry`, `Connection`,
  `CycleSnapshot`, `AreaHistoryEntry`, `ExerciseCompletion` (15 v3),
  `Caminhante`, `Caminhada` (2 D-041), `Sessao`, `SessaoChunk`,
  `GrimorioPessoal`, `NotasConsulente`, `MapaCalculo` (5 D-XXX),
  `Pilar6Calculo`, `Pilar7Calculo`, `Pilar7Estagio` (3 D-YYY/D-ZZZ Wave 4).
- `migrations/`: SQL versionado pelo Prisma Migrate. **NÃO** rodar
  `prisma migrate dev` sem aprovação humana (ver Work Guidance).
  - 7 migrations aplicadas: `20260611000000_init_akasha_v3/`,
    `20260618000000_add_ritual_fields_to_area_history/`,
    `20260622000000_041_caminhante_caminhada/`,
    `20260624000000_multitenant_core/` (D-XXX.001),
    `20260624000001_vector_indexes/` (D-XXX.002),
    `20260624000002_pilar6_calculo/` (D-YYY Wave 4),
    `20260624000003_pilar7_calculo/` (D-ZZZ Wave 4).
  - `migration_lock.toml`: pin do provider (postgresql).
- `seed.ts`: idempotente, popula dados de demo em dev. Não roda em prod.
- `migrations/README.md`: instruções de migration (legado).

## Local Contracts

### Schema invariants (NÃO quebrar sem migration aprovada)

- **Pilar 1-4** vivem em `BirthChart.{astrologyMap,kabalisticMap,tantricMap,oduBirth}` (Json).
  Estes campos **não** têm Zod schema enforced no DB — Pilar 4 (Odu) ethics
  invariant (`requer consentimento + terreiro`) é responsabilidade da camada
  de aplicação, não do schema. (D-040 R2)
- **Pilar 5** (I Ching) está em `User.{ichingMap,ichingEnabled}` (Json+Boolean) —
  **inconsistente** com Pilares 1-4. D-040 propõe mover para
  `BirthChart.pilar5IChing` mas exige migration prod. (D-040 achado #1)
- **`DailyReading.hexagram`** é `String?`, mas o range canônico IFA/D-044 é
  `Int 1-64`. Type mismatch latente — D-040 propõe `Int?`. (D-040 E4)
- **Mandala + Mandato** são recomputados on-the-fly (sem `MandalaSnapshot`).
  Trade-off: simplicidade vs compute. D-040 propõe cache table. (D-040 achado #2)
- **`MandatoDiario.criseDetectada`** não é persistido — apenas log em
  `Consultation`/`ChatMessage`. LGPD Art. 37 pede trilha de auditoria
  quando há detecção de crise. (D-040 R4)

### Generated client

- `pnpm db:generate` regenera `@prisma/client` em `node_modules`.
- Build pipeline roda `db:generate` automaticamente antes de `tsc`.
- NUNCA editar arquivos em `node_modules/.prisma/client/` — são gerados.

### Backward compat policy

- Mudanças destrutivas (drop column, type change) **exigem** 1 release de
  deprecation. (D-040 D2)
- Colunas novas podem ser adicionadas com `@default` seguro (não-null
  só se tiver default).

## Work Guidance

### Migrations: PROPOSAL ONLY, never apply

**NUNCA** rodar `pnpm exec prisma migrate dev` ou `pnpm db:push` sem
aprovação humana explícita. (coding_prompt STEP 5.5 + D-040 D1)

Para qualquer mudança em `schema.prisma`:

1. Produzir PROPOSAL (markdown com diff do schema + justificativa +
   riscos + plano de rollback)
2. Commitar PROPOSAL com `feat(schema): D-NNN — design proposal (awaiting approval)`
3. **NÃO** rodar migration — humano aplica manualmente após review
4. Após approval, humano roda: `pnpm exec prisma migrate dev --name <NNN>`
5. Só então commitar a migration real

### DOX chain

- Raiz: `AGENTS.md` (DOX framework)
- App: `apps/akasha-portal/AGENTS.md` (Ownership deste arquivo)
- Este: `apps/akasha-portal/prisma/AGENTS.md` (subsistema DB)

Antes de qualquer mudança em `schema.prisma`, **ler este arquivo** +
`AGENTS.md` + `apps/akasha-portal/AGENTS.md` (chain check do DOX framework).

### Pilar 4 (Odu) ethics invariant

- Aviso `requer consentimento + terreiro` é responsabilidade da camada
  de aplicação (`Mentor hook`, API routes)
- Pilar 4 schema aceita `Json` (sem Zod enforço) — **não** adicionar
  Zod no schema, fazer via application-layer
- Documentar em code review: "Pilar 4 invariant é app-layer, não DB"

### LGPD

- Mínimo PII persistido. `User.birthDate`, `birthTime`, `birthCity`
  são birth data, não livre-arbítrio editável após cadastro.
- `consentAt` é o único campo LGPD-explicit; tudo mais é herança
  do escopo do produto.
- `MandatoDiario.criseDetectada` (D-040 R4) — flag ainda não
  persistida, audit apenas em logs.

## Verification

- `pnpm db:generate` regenera o client sem erros
- `pnpm --filter akasha-portal typecheck` deve passar (imports de
  `@prisma/client` resolvem)
- `pnpm test:run` deve passar (seed.ts mocks + integration tests)
- **D-XXX** (P1, design): Multi-tenant core + vector indexes (Wave 3).
  2 migrations criadas: `20260624000000_multitenant_core/` (5 tabelas +
  3 enums + 9 FKs) e `20260624000001_vector_indexes/` (ivfflat index).
  Aplicação **requer D-041 já aplicada** (FKs para `caminhadas`).
  Schema estendido em `schema.prisma` (7 models + 7 reverse relations).
  Helper `withCaminhanteContext` em `src/lib/application/tenant-context.ts`.
  Status: `branch_wave_3_multi_tenant_merged_2026_06_23`.
- **D-YYY + D-ZZZ** (P1, design): Pilares 6 e 7 (Wave 4).
  2 migrations: `20260624000002_pilar6_calculo/` (4 enums + pilar6_calculos
  table) e `20260624000003_pilar7_calculo/` (1 enum + pilar7_calculos +
  pilar7_estagios tables). Schema estendido (3 models + 5 enums).
  Engines em `packages/core-pilar6/` (17 tests) e `packages/core-pilar7/`
  (63 tests + 192 placeholder texts). akasha-core orchestrator integrado.
  Status: `branch_wave_4_integration_awaiting_human_apply_and_merge`.

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado no momento. Se `prisma/migrations/`
passar a ter múltiplas migrations com decisões arquiteturais não-óbvias,
criar `migrations/AGENTS.md` para documentar o rationale de cada.)
