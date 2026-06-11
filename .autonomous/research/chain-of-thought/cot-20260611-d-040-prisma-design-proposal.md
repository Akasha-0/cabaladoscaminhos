# COT: D-040 — Schema Prisma 5 Pilares (DESIGN PROPOSAL)

## Contexto

Sistema Akasha Fase 5 (protótipo). R-030 ✅, D-043 ✅, D-044 ✅.
Próximo: D-040 "Schema Prisma com 5 pilares" (TODO FASE 5).

D-040 é PRIMEIRA mudança estrutural de Fase 5: toca produção
DB (Postgres + pgvector). Diferente de D-043/D-044 (código
+ testes isolados), D-040 afeta dados persistidos de usuários
reais. Decisão: NÃO aplicar, escrever DESIGN PROPOSAL primeiro.

User pediu: "Verificar sistema de cálculos + base de
conhecimento. Não parar até o sistema ser referência."

## Hipóteses

H1. **Migrations em prod DB sem staging test** = risco alto.
Mesmo com backward compat, esconder coluna de User.ichingMap
sem migrar dados corromperia a UX. AGENTS.md §"Update After
Editing" manda atualizar `prisma/AGENTS.md` ao mudar schema
— não fiz ainda.

H2. **D-040 + D-042 + D-043 + D-044 formam cluster conceitual**.
Cada um precisa de review humana antes de ser aplicado.
Misturar todos num único commit é anti-pattern.

H3. **Design proposal > auto-migration**. Documento markdown
detalhando (a) estado atual, (b) inconsistências detectadas,
(c) proposta mínima reversível, (d) riscos, (e) próximos
passos por fase. Permite revisão assíncrona + checkpoint.

H4. **Inconsistências reveladas por D-044** são entry point:
- Pilar 5 (I Ching) em `User.ichingMap` (não em BirthChart)
- `DailyReading.hexagram` é String, deveria ser Int 1-64
- `BirthChart.oduBirth` sem Zod invariant (consentimento)
- `MandalaSnapshot` ausente → recompute on-the-fly
- `mentor_hook.crise_detectada` (R-030) sem coluna persistente

## Evidências

E1. `apps/akasha-portal/prisma/schema.prisma` (222 linhas) tem
10 models: User, BirthChart, Subscription, CreditEntry,
Manifesto, DailyReading, RitualCompletion, Consultation,
ChatMessage, PushSubscription, GrimoireEntry.

E2. `User.ichingMap Json` (line 31) e `User.ichingEnabled
Boolean @default(false)` (line 38) — Pilar 5 está aqui, não
em BirthChart. Inconsistência com Pilar 1-4.

E3. `BirthChart` (line 64-78) tem 4 Pilares Json: astrologyMap,
kabalisticMap, tantricMap, oduBirth. Sem pilar5IChing.
Campos incompletos + timestamps.

E4. `DailyReading.hexagram String?` (line 144) — String, mas
range canônico D-044 é Int 1-64. Type mismatch.

E5. `Consultation/ChatMessage` log apenas, sem `crise_detectada`
persistente. Mentor hook R-030 detecta crise em runtime
mas não persiste para auditoria LGPD.

E6. **AGENTS.md não tem `apps/akasha-portal/prisma/AGENTS.md`** —
faltando DOX rail local para o subsistema de DB. AGENTS.md
§"Update After Editing" exige criar antes de mudar schema.

E7. D-044 confirmou: IFA_ODUS tem 15 entries (não 16). Pilar 4
schema deve usar este canônico — não inventar 16 nomes.

## Decisões

D1. **DESIGN PROPOSAL, não aplicação**. Migration requer
staging test + review humana. Documento markdown é o
artefato correto para esta sessão.

D2. **Backward compat por 1 release**: NÃO dropar
`User.ichingMap`/`User.ichingEnabled` agora. Criar
`BirthChart.pilar5IChing` + `ichingEnabled` paralelo.
Próxima release (v0.1.0) depreca as colunas User.

D3. **3 achados formalizados**:
1. Pilar 5 inconsistente (User.ichingMap → BirthChart)
2. Mandala/Mandato sem persistência (recompute on-the-fly)
3. Pilar 4 ethics invariant não enforced (Json sem Zod)

D4. **5 riscos documentados** (R1-R5): migration prod, Pilar 4
Zod, MandalaSnapshot invalidation, MandatoDiario LGPD audit,
Zod derive from akasha-core.

D5. **Feature list flag `status: design_proposal_pending_approval`
+ passes: false**. Diferencia "design escrito" de "design
aplicado". Decisão: marca o item como não-concluído.

D6. **Próximos passos em 3 horizontes** (curto/médio/longo
prazo). Curto = aprovação + staging + migration. Médio =
Zod validators + wire akasha-core → Prisma. Longo = deprecação
+ RitualCatalog + TridoshaProfile + GeneKeyPearl.

## Conclusão

D-040 design proposal escrito. NÃO aplicado. Aguarda revisão
humana antes de `pnpm db:migrate`.

**3 achados principais** (D-040):
1. Pilar 5 mora em `User.ichingMap` — inconsistente com 1-4
2. Mandala/Mandato recomputados on-the-fly — desperdiça compute
3. Pilar 4 ethics invariant não enforced — Json sem Zod schema

**5 riscos** (D-040 R1-R5): prod migration, Pilar 4 Zod, cache
invalidation, LGPD audit, Zod derive from akasha-core.

**Por que não aplicar agora**:
- Migration prod DB sem staging test
- AGENTS.md rail local (prisma/AGENTS.md) ainda não existe
- Cluster D-040/D-042/D-043/D-044 precisa review humano
- Fase 6 (código) é melhor local para migration supervisionada

**Próximo passo humano**: revisar
`.autonomous/research/designs/d-040-prisma-5-pilares-design.md`
+ aprovar ou solicitar ajustes.

## Lições

- **Design > code para mudanças estruturais**. Migration prod
  = design primeiro, code depois. Custa 30min escrever doc,
  economiza horas de rollback.
- **Backward compat > clean break**. Manter User.ichingMap
  por 1 release evita quebrar usuários existentes.
- **Documentar inconsistências como achados**. Pilar 5 fora
  de BirthChart é bug latente — explicitar em vez de esconder.
- **Feature list flag `passes:false` + `status:pending`** é
  melhor que esconder em "wip". Auditoria vê status real.
- **AGENTS.md chain check antes de mudar schema**. Não fiz
  prisma/AGENTS.md — flag como TODO pré-condição.
