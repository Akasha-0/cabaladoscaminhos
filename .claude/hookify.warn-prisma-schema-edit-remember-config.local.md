---
name: warn-prisma-schema-edit-remember-config
enabled: true
event: file
action: warn
pattern: prisma/schema\.prisma
---

🗄️  **Editando schema.prisma (cluster database — 3 instintos carregados)**

Lembre Prisma 7 (instinto `prisma-7-datasource-moved-to-config`):
- `schema.prisma` deve ter APENAS `provider = "postgresql"` no bloco `datasource` (NÃO `url`)
- A URL vive em `prisma.config.ts` via `datasource: { url: env('DATABASE_URL') }`
- Se adicionar `datasourceUrl = env(...)` no schema → erro "Property not known"
- Se esquecer `provider` → "current connector does not support lists of primitive types"

**Após salvar schema:**
1. Rode `npx prisma validate`
2. Rode `npx prisma generate`
3. Se mudou modelo, crie migration: `npx prisma migrate dev --name descricao` (vai exigir shadow DB — ver hook `warn-prisma-migration-no-shadow-db`)

Skill carregada: `designing-persisting-or-migrat` (3 instintos).
