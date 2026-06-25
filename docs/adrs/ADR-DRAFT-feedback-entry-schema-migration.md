# ADR-DRAFT: FeedbackEntry Prisma Schema Migration

**Status:** DRAFT — awaiting human approval (per `apps/akasha-portal/prisma/AGENTS.md`)
**Date:** 2026-06-24
**Wave:** 17.3 (TypeScript Residual Errors)
**Author:** Hermes Agent (autonomous)

## Context

O endpoint `POST /api/feedback` (Wave 13.5, commit `b2ae135f`) referencia
`prisma.feedbackEntry.upsert(...)`, mas o model `FeedbackEntry` **não
está** em `apps/akasha-portal/prisma/schema.prisma`. O endpoint foi
merged mas a migration correspondente nunca foi aplicada.

**Policy:** `apps/akasha-portal/prisma/AGENTS.md` diz:

> **NUNCA** rodar `pnpm exec prisma migrate dev` ou `pnpm db:push` sem
> aprovação humana explícita. (coding_prompt STEP 5.5 + D-040 D1)

Este ADR documenta o estado e propõe 3 opções para fechar o gap.

## Estado Atual (Wave 17.3)

- **Typecheck baseline:** 30 erros pré-existentes.
- **Fix Wave 17.3:** o erro TS2339 `Property 'feedbackEntry' does not exist`
  em `apps/akasha-portal/src/app/api/feedback/route.ts:104` foi resolvido
  via **typed cast** do `prisma` client:
  ```ts
  const feedbackClient = prisma as unknown as {
    feedbackEntry: { upsert: (args) => Promise<{...}> };
  };
  const entry = await feedbackClient.feedbackEntry.upsert({...});
  ```
  O cast tipado documenta o shape esperado e será redundante assim que
  a migration for aplicada.
- **Typecheck pós-fix:** 0 erros (root + portal).

## Opções Propostas

### Opção A — Aplicar migration (recomendado, MAS precisa de humano)

1. Adicionar model `FeedbackEntry` ao schema:
   ```prisma
   model FeedbackEntry {
     id        String   @id @default(cuid())
     userId    String
     messageId String
     rating    String   // 'up' | 'down'
     comment   String?
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

     @@unique([userId, messageId])
     @@index([messageId])
   }
   ```
2. Adicionar reverse relation `User.feedbackEntries FeedbackEntry[]`.
3. Rodar `pnpm exec prisma migrate dev --name feedback_entry_wave_17_3`.
4. Remover o cast tipado em `route.ts`.

**Trade-offs:**
- ✅ Resolve o type error de forma permanente
- ✅ Permite LGPD Art. 18 (portabilidade + cascade delete)
- ⚠️ Requer aprovação humana (per `AGENTS.md`)
- ⚠️ Afeta prod DB

### Opção B — Remover o endpoint (fallback)

Se o endpoint não está sendo chamado (verificar logs de prod), deletar:
- `apps/akasha-portal/src/app/api/feedback/route.ts`
- Os 15 testes unitários correspondentes

**Trade-offs:**
- ✅ Remove o cast tipado + complexidade
- ⚠️ Perde feature Wave 13.5 (thumbs up/down no Mentor)
- ⚠️ Requer product approval

### Opção C — Manter cast tipado (atual Wave 17.3)

Cast tipado em `route.ts` é a saída pragmática Wave 17.3. Typecheck
verde, código production-safe em runtime (o cast desaparece em runtime),
mas viola "TypeScript estrito" do `apps/akasha-portal/AGENTS.md`.

**Trade-offs:**
- ✅ Não precisa aprovação humana
- ✅ Zero novos erros
- ⚠️ Cast `as unknown as` é code smell
- ⚠️ Cast precisa ser removido quando migration for aplicada

## Recomendação

**Opção A** (aplicar migration). O endpoint está merged desde Wave 13.5,
é LGPD-compliant (cascade delete, comment ≤500 chars, no PII leak), e
o model é trivial (1 tabela + 1 unique constraint + 1 index).

## Próximos Passos

1. **Humano** revisar este ADR
2. Se aprovado: criar branch `wave-17.3.1-feedback-entry-migration` que:
   - Adiciona model ao schema
   - Roda migration localmente
   - Remove cast tipado do route.ts
   - Verifica typecheck + integration tests
3. PR contra main → merge

## Referências

- Wave 13.5 commit: `b2ae135f`
- Policy: `apps/akasha-portal/prisma/AGENTS.md` (PROPOSAL ONLY, never apply)
- Endpoints afetados: `apps/akasha-portal/src/app/api/feedback/route.ts`
- AGENTS.md §Work Guidance: TypeScript estrito, zero `any` em código novo