# D-040 — Schema Prisma 5 Pilares (DESIGN PROPOSAL)

**Status:** Proposta. NÃO aplicar até revisão + aprovação.
**Data:** 2026-06-11
**Dependências:** R-030 ✅, D-043 ✅, D-044 ✅, synthesis_v1 §5

## 1. Contexto

O schema Prisma atual (`apps/akasha-portal/prisma/schema.prisma`, 222 linhas)
tem 10 models: User, BirthChart, Subscription, CreditEntry, Manifesto,
DailyReading, RitualCompletion, Consultation, ChatMessage,
PushSubscription, GrimoireEntry.

**Estado atual vs D-040:**

| Pilar | Hoje | Gap D-040 |
|-------|------|-----------|
| 1. Cabala | `BirthChart.kabalisticMap Json` | OK (mas sem tipo Zod) |
| 2. Astrologia | `BirthChart.astrologyMap Json` | OK (mas sem tipo Zod) |
| 3. Tantra | `BirthChart.tantricMap Json` | OK (mas sem tipo Zod) |
| 4. Odu | `BirthChart.oduBirth Json` | OK (mas sem tipo Zod) |
| 5. I Ching | `User.ichingMap Json` (fora de BirthChart!) | **Inconsistência** |
| Mandala | `DailyReading.hexagram` (parcial) | Falta snapshot completo |
| Mandato | `DailyReading.ritual/alert/tensionPoint` (parcial) | Falta hook CVV-188 |
| Mentor hook | `Consultation/ChatMessage` (log only) | Sem crisis_detectada |

**Inconsistências detectadas via D-044:**
- Pilar 5 (I Ching) mora em `User.ichingMap`, não em `BirthChart`
- `User.ichingEnabled` (opt-in flag) está em User, mas Pilar 1-4 não
  têm flag similar
- `DailyReading.hexagram` (line 144) é String, mas deveria ser Int 1-64
  (range canônico D-044)
- `BirthChart.oduBirth` não tem referência à ética (consentimento Odu,
  Pilar 4 ethics_charter §3)
- `MandalaSnapshot` não existe como tabela; Mandala é computada on-the-fly
- `mentor_hook.crise_detectada` (R-030) não tem coluna persistente

## 2. Proposta de Mudança (mínima, reversível)

### 2.1 Unificar 5 Pilares em BirthChart

```prisma
model BirthChart {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 5 Pilares — todos Json, simétricos (v0.0.4 → v0.0.13)
  pilar1Cabala    Json   // Mispar Hechrachi + Katan Mispari (Sefer Yetzirah)
  pilar2Astrologia Json // Whole Sign Houses (Brennan 2017)
  pilar3Tantrica  Json   // 11 corpos + Tridosha
  pilar4Odu       Json   // Ifá 16 Odu (com aviso consentimento, ethics_charter §3)
  pilar5IChing    Json   // 64 hexagramas (Wilhelm/Baynes 1950)
  // Pilar 4 explicitamente exige `aviso: 'requer consentimento + terreiro'`
  // no schema Json (D-044 finding F2: stub R-030 não tem Ogbe+Ofun)

  // v0.0.5 T3: opt-in flags por Pilar (LGPD)
  ichingEnabled Boolean @default(false) // migrar de User.ichingEnabled
  oduEnabled    Boolean @default(false) // Pilar 4 — tradição viva, opt-in explícito

  // MandalaSnapshot
  mandalaCache    Json?  // shape MandalaResumo (5 anéis, 4 camadas)
  mandalaComputedAt DateTime?

  incomplete Boolean   @default(false)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  @@map("birth_charts")
}
```

### 2.2 Criar `MandalaSnapshot` (cache materializado)

```prisma
model MandalaSnapshot {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  computedAt   DateTime @default(now())
  // Shape synthesis_v1 §4
  camadas      Json     // { D: PilarRef[], S: [...], Z: [...], V: [...] }
  escala       String   // 'D' | 'S' | 'Z' | 'V'
  pilaresPresentes String[]
  pilaresAusentes  String[]
  // Cálculo é caro (5 engines); cache 30d é razoável
  @@index([userId, computedAt])
  @@map("mandala_snapshots")
}
```

### 2.3 Criar `MandatoDiario` (1 push/dia)

```prisma
model MandatoDiario {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date         DateTime @db.Date
  // Shape synthesis_v1 §5.3 (Mandato.emitir)
  escala       String   // 'D' | 'S' | 'Z' | 'V'
  pilares      String[] // relevantes
  redacao      String   // 3 frases + 1 pergunta + 1 micro-ritual
  citaFontes   String[] // ética R-022 §3.2 (citação obrigatória)
  // Crisis detection (R-022 §5.5, ethics_charter §3)
  criseDetectada Boolean @default(false)
  recursoCv188   Boolean @default(false) // 1 se mentor_hook.recurso='CVV-188'
  // Custo
  llmModel     String?
  tokensUsed   Int?
  createdAt    DateTime @default(now())
  @@unique([userId, date])
  @@map("mandatos_diarios")
}
```

### 2.4 Migração de User.ichingMap → BirthChart.pilar5IChing

```sql
-- Migration script (a ser revisado)
BEGIN;
-- 1. Adicionar colunas nullable
ALTER TABLE birth_charts ADD COLUMN pilar5_i_ching JSONB;
ALTER TABLE birth_charts ADD COLUMN pilar4_odu JSONB;
ALTER TABLE birth_charts ADD COLUMN pilar3_tantrica JSONB;
ALTER TABLE birth_charts ADD COLUMN pilar2_astrologia JSONB;
ALTER TABLE birth_charts ADD COLUMN pilar1_cabala JSONB;
ALTER TABLE birth_charts ADD COLUMN iching_enabled BOOLEAN DEFAULT false;
ALTER TABLE birth_charts ADD COLUMN odu_enabled BOOLEAN DEFAULT false;

-- 2. Migrar dados existentes (User.ichingMap → BirthChart.pilar5IChing)
UPDATE birth_charts bc
SET pilar5_i_ching = u.iching_map,
    iching_enabled = u.iching_enabled
FROM users u
WHERE bc.user_id = u.id
  AND u.iching_map IS NOT NULL;

-- 3. NÃO dropar User.ichingMap ainda (compat backward)
--    Próxima release: deprecar
COMMIT;
```

## 3. Riscos & Decisões em Aberto

### R1. **Migration on prod data** — BACKWARD COMPATIBLE
- Manter `User.ichingMap` e `User.ichingEnabled` por 1 release
- Não dropar colunas até v0.1.0
- Migration testada em staging primeiro

### R2. **Pilar 4 ethics invariant** — Zod schema no Json
- `pilar4Odu` deve incluir `aviso: 'requer consentimento + terreiro'`
- Zod schema em `packages/akasha-core/src/zod/pilar4-odu.ts` (a criar)
- Validação no momento de escrita (não no read)

### R3. **MandalaSnapshot cache invalidation** — quando recomputar?
- Pilar novo (onboarding) → invalidar
- Trânsitos astrológicos (D-1) → invalidar diariamente
- Aniversário (ano pessoal) → invalidar anualmente
- 30d default TTL; auditoria decide

### R4. **MandatoDiario.criseDetectada + recursoCv188** — audit
- LGPD/ética: crise detectada NÃO pode ser exposta no UI pública
- `recursoCv188=true` → rota para `mentor.responder()` com resposta
  fixa (não-LLM), conforme ethics_charter §3
- Audit log: quem viu o quê (DPO Art. 37 LGPD)

### R5. **Tipos Zod por Pilar** — derive from akasha-core
- `pilar1Cabala: PilarCabalaSchema` (já existe em akasha-core.ts:30)
- Repetir para 5 Pilares em `packages/akasha-core/src/zod/pilares.ts`
- D-042 (já [x]) é o protótipo; D-040 instancia em Prisma

## 4. Por que NÃO aplicar agora

1. **Schema mutation em prod DB** sem staging test é risco alto
2. **D-040 + D-042 + D-043 + D-044 estão alinhados conceitualmente** mas
   cada mudança precisa de review humana
3. **Próxima sessão (Fase 6) tem agentes autônomos** que podem aplicar
   migration com supervisão. Melhor que eu aplique às cegas.
4. **AGENTS.md §"Update After Editing"** manda atualizar docs/AGENTS.md
   ao mudar schema. Não fiz ainda.

## 5. Próximos Passos

### Curto prazo (próxima sessão)
- [ ] Aprovação humana da proposta
- [ ] `pnpm db:migrate dev --name d-040-5-pilares` em staging
- [ ] Atualizar `apps/akasha-portal/prisma/AGENTS.md` (criar se não existe)
- [ ] Aplicar migration em prod com feature flag
- [ ] Documentar em `docs/` (ADR-040)

### Médio prazo (Fase 6)
- [ ] Implementar Zod validator por Pilar (D-042 derivado)
- [ ] Wire akasha-core `calcular()` → Prisma upsert em BirthChart
- [ ] Cron job `computeMandalaSnapshot` (diário 03:00 BRT)
- [ ] Mentor hook → `MandatoDiario.criseDetectada` write-through

### Longo prazo (Fase 7+)
- [ ] Deprecar `User.ichingMap` + `User.ichingEnabled`
- [ ] Adicionar `RitualCatalog` (Pilar 4 Ifá)
- [ ] Adicionar `TridoshaProfile` (Pilar 3 Ayurveda)
- [ ] Adicionar `GeneKeyPearl` (Pilar 5 Gene Keys)

## 6. Conclusão

D-040 design proposal escrito. **3 achados principais:**
1. **Inconsistência Pilar 5** — `User.ichingMap` deve migrar para
   `BirthChart.pilar5IChing` (simetria com 1-4)
2. **Mandala/Mandato sem persistência** — recomputados on-the-fly,
   desperdiçando compute. Cache materializado.
3. **Pilar 4 ethics invariant não enforced** — Json field sem Zod
   schema que valide `aviso: 'requer consentimento + terreiro'`

**Aguardando aprovação** antes de aplicar `pnpm db:migrate`.
Próxima ação humana: revisar este doc + aprovar ou solicitar ajustes.

Refs:
- synthesis_v1 §5 (Mandala, Mandato, akasha.calcular())
- ethics_charter_v1 §3 (Pilar 4 consentimento, CVV-188)
- AGENTS.md §"Update After Editing" (atualizar AGENTS.md ao mudar schema)
- D-044 (knowledge base canônico, IFA_ODUS 15 entries)
