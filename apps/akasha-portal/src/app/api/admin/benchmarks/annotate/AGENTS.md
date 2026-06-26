# AGENTS.md — Wave 32.2 (Calibração humana AUT)

> Notas para agentes AI que vão trabalhar nesta área do código.
> Última atualização: 2026-06-25.

## Contexto

Wave 32 implementa a **camada de calibração humana** para os critérios AUT
(ADR-027). Wave 31 já tem o **scorer automático** (`packages/benchmarks/src/aut.ts`).
Agora humanos validam se esses 4 critérios medem o que dizem medir (construct
validity).

## Estrutura

```
apps/akasha-portal/
├── prisma/
│   ├── schema.prisma                      ← BenchmarkAnnotation model (PROPOSAL)
│   └── migrations/
│       └── WAVE-32-2-benchmark-annotation/
│           └── migration.sql              ← PROPOSAL ONLY (humano aplica via prisma migrate)
├── src/
│   ├── app/
│   │   ├── [locale]/(akasha)/admin/benchmarks/annotate/page.tsx
│   │   │                                  ← Server Component (auth + data load + redaction)
│   │   └── api/admin/benchmarks/annotate/
│   │       ├── route.ts                   ← API POST/GET (Zod validated, ADMIN-only)
│   │       └── __tests__/route.test.ts    ← 9 tests
│   ├── components/akasha/admin/
│   │   └── AnnotateUI.tsx                 ← Client component (sliders + submit)
│   └── lib/application/privacy/
│       ├── redact.ts                      ← PII redaction (LGPD Art. 7/8/37)
│       └── __tests__/redact.test.ts       ← 10 tests
```

## Conceitos críticos

### 1. Por que `responseId` aponta para `ChatMessage`, NÃO `DailyReading`?

O brief original mencionava "FK to DailyReading", mas DailyReading é "leitura
diária gerada", não "resposta do Mentor em conversa". Uma response do Mentor
é uma `ChatMessage` com `role: ASSISTANT`. Esta escolha reflete semanticamente
o que estamos medindo (qualidade de resposta em conversa), não leitura
unilateral. Mantive isso intencionalmente; pode ser revisto se Gabriel quiser.

### 2. LGPD — O que é redacted?

`/api/admin/benchmarks/annotate?action=list` aplica `redactMessagesForAnnotation`
que REMOVE do objeto de saída:
- `consultation.user.name`
- `consultation.user.email`
- `consultation.title` (pode conter nome do consulente)

E EXPÕE apenas:
- `id` (cuid), `content` (Mentor response), `ageDays` (relativo),
- `meta.routedPillars` (não-PII), `meta.{userName,userEmail,consultationTitle}Redacted`
- `anonymousOriginHash` (8-char hash para correlação entre responses da
  mesma consulta SEM expor qual consulta)

O content do Mentor é gerado pela IA e geralmente não contém PII. Por defesa
em profundidade, `scrubContentPII` aplica regex contra emails/CPFs/telefones
caso o modelo tenha alucinado um.

### 3. Schema NÃO aplicado automaticamente

`apps/akasha-portal/prisma/schema.prisma` inclui o model `BenchmarkAnnotation`
já validado (`prisma validate` passa). MAS a migration em
`prisma/migrations/WAVE-32-2-benchmark-annotation/migration.sql` é PROPOSAL
ONLY. **Gabriel (humano) deve aplicar manualmente** com:

```bash
cd apps/akasha-portal
pnpm exec prisma migrate dev --name benchmark-annotation
# Ou: pnpm exec prisma migrate deploy (em staging/prod)
```

Após aplicar, gere Prisma Client:
```bash
pnpm exec prisma generate
```

### 4. Multi-tenant

`workspaceId` NÃO está no `BenchmarkAnnotation` porque annotators são ADMINs
cross-tenant (avaliam globalmente, não por workspace). Para preservar LGPD:

- Annotations ficam associadas ao annotator + response.
- Se quiser tenant-scoping, basta adicionar `workspaceId String?` e
  propagar via `consultation.workspaceId`. **NÃO foi feito** porque:
  - ADMIN eval precisa ser global (qualidade da IA, não do workspace).
  - LGPD compliance vem do consentimento + redaction, não de tenant scoping.

Se Gabriel discordar, é 1 linha de mudança no schema + denormalização.

### 5. Auth — ADMIN only

`requireAkashaAdmin` já existe (Wave anterior). Anotadores DEVEM ter
`UserRole.ADMIN` no DB. Para promover um user a annotator:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'gabriel@akasha.app';
```

Ou adicionar uma role separada `ANNOTATOR`:
- Mais correto semanticamente
- Mas requer migração do enum UserRole
- Wave 32.2 não quis introduzir isso (decisão conservativa)

## Tests

```bash
cd apps/akasha-portal
pnpm exec vitest run src/lib/application/privacy/__tests__/redact.test.ts
pnpm exec vitest run src/app/api/admin/benchmarks/annotate/__tests__/route.test.ts
```

Total: 19 tests, 100% passando.

## Como testar end-to-end (com DB)

```bash
# 1. Aplicar migration
cd apps/akasha-portal && pnpm exec prisma migrate dev --name benchmark-annotation

# 2. Seed (opcional): promover seu user a ADMIN
psql $DATABASE_URL -c "UPDATE \"User\" SET role='ADMIN' WHERE email='seu@email.com'"

# 3. Login + acessar /admin/benchmarks/annotate

# 4. Após 3+ anotadores terem anotado ≥ 500 responses:
cd packages/benchmarks && pnpm run benchmarks:agreement --from-db
```

## Decisões divergentes do brief original

| Brief original | Implementação Wave 32.2 | Razão |
|---|---|---|
| `responseId` FK to DailyReading | FK to ChatMessage | DailyReading é "leitura", não "resposta em conversa". Mentor responses = ChatMessage.role=ASSISTANT. |
| workspaceId no schema | NÃO incluído | Annotators são ADMINs cross-tenant; eval é global. |
| Notas opcionais | TEXT field | Conforme brief. |

## Próximas waves

- Wave 33: integrar scores humanos como ground-truth para treinar
  regressor AUT (substituir avaliação ad-hoc por ML calibrado).
- Wave 34: expandir para IAA inter-criteria (correlação R↔T, U↔V).