# Benchmarks Annotate — Wave 32.2

API + UI para anotação humana R/T/U/V de responses do Mentor Akasha,
usado para calibração (Cohen's κ / Fleiss' κ) dos critérios AUT.

## Stack

- Next.js 14 (App Router)
- Prisma + PostgreSQL (via `@prisma/client`)
- Zod para validação
- Vitest para tests

## Estrutura

```
.
├── route.ts               # API POST/GET
├── AGENTS.md              # Notas para AI agents
└── __tests__/
    └── route.test.ts      # 9 tests (validation, auth, redaction, idempotency)
```

## Endpoints

### POST /api/admin/benchmarks/annotate

```json
{
  "responseId": "ckl2...m",
  "rScore": 7,
  "tScore": 8,
  "uScore": 6,
  "vScore": 9,
  "notes": "Bom chain-of-thought mas rasgou na etica"
}
```

- `rScore`, `tScore`, `uScore`, `vScore`: Int 0-10 (Zod validated)
- `notes`: opcional, max 2000 chars
- ADMIN-only (requireAkashaAdmin)
- Idempotente via upsert por (responseId, annotatorId)
- Retorna 400 se schema inválido, 404 se response não existe, 401 se não-ADMIN

### GET /api/admin/benchmarks/annotate?action=list

Lista responses do Mentor redacted (sem PII), com filtro opcional por
`annotatorId`.

### GET /api/admin/benchmarks/annotate?action=progress

Conta annotations por annotator (visível a todos ADMINs).

## LGPD

Todas as responses são redacted antes de serem servidas ao anotador.
Ver `@/lib/application/privacy/redact.ts` para detalhes.

## Setup

```bash
# 1. Aplicar migration (PROPOSAL — humano valida antes)
cd apps/akasha-portal
pnpm exec prisma migrate dev --name benchmark-annotation

# 2. Promover user a ADMIN (anotadores precisam ser ADMIN)
psql $DATABASE_URL -c "UPDATE \"User\" SET role='ADMIN' WHERE email='seu@email.com'"

# 3. Tests
pnpm exec vitest run src/app/api/admin/benchmarks/annotate/__tests__/route.test.ts
pnpm exec vitest run src/lib/application/privacy/__tests__/redact.test.ts
```

## Próximos passos

Após 3+ anotadores terem anotado ≥ 500 responses:

```bash
cd packages/benchmarks
pnpm run benchmarks:agreement --from-db
```

Para rodar a análise de inter-annotator agreement e gerar report
(Cohen's κ + Fleiss' κ). Ver `packages/benchmarks/src/agreement.ts`.