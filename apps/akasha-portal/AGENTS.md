# Portal DOX

## Purpose
Aplicação web principal do Akasha — Next.js 16 + React 19. Portal
acessível aos usuários com Mandala, Mandato, Mentor, e dashboards.

## Ownership
- `src/app/`: App Router (rotas, layouts, server components)
  - `api/akasha/`: API routes (47 endpoints tracked)
  - `[locale]/(akasha)/`: rotas localizadas
- `src/components/`: Componentes React (akasha/*, ui/*, shared/*)
- `src/lib/`: Domain + application + infrastructure
- `messages/`: i18n (PT-BR primeiro)
- `middleware.ts`: rate limit, CORS, i18n
- `prisma/`: schema + migrations + seed
- `next.config.{js,ts}`: Next.js config (legacy .js + .ts coexistem)

## Local Contracts
- `requireAkashaApi()` para auth em rotas protegidas
- Zod para validação de input em rotas mutating
- Mandato + Mandala vêm de `@akasha/core` (5 Pilares)
- Mentor orquestra via `@akasha/mentor` (com RAG obrigatório)

## Work Guidance
- PT-BR primeiro (i18n config)
- Pilar 4 (Odu) ethics invariant: aviso `requer consentimento + terreiro`
- LGPD by design: mínimo PII em responses (omitir pilares quando sensível)
- Não inventar correspondências esotéricas (AGENTS.md §5)

## Verification
- `pnpm test:run` antes de commit
- `pnpm typecheck` antes de merge
- `pnpm lint` antes de merge
- F-102 OWASP audit antes de prod deploy

## Child DOX Index
(Nenhum subdiretório com AGENTS.md dedicado no momento)
