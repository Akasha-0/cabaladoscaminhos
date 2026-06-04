---
name: warn-prisma-migration-no-shadow-db
enabled: true
event: bash
action: warn
pattern: prisma\s+migrate\s+(dev|diff\s+--from-migrations)
---

⚠️  **Prisma 7 — shadow database obrigatória** (instinto `prisma-7-shadow-database-url-required-for-diff-from-migrations`)

Você está prestes a rodar um comando Prisma 7 que exige `shadowDatabaseUrl` em `prisma.config.ts`. Sem isso você vai receber erro de conexão sem dica do config que falta.

**Antes de continuar:**
1. Verifique se `prisma.config.ts` declara `datasource.shadowDatabaseUrl`
2. Se não declarar, adicione apontando para um PG descartável (local ou schema separado da mesma instância)
3. Forward diff (`--from-empty --to-schema`) NÃO precisa; só reverse diff e `migrate dev` precisam

Citado de cycle-117 e cycle-121.
