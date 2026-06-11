# Apps DOX

## Purpose
Aplicações web do projeto Akasha.

## Ownership
- `akasha-portal/`: Portal Next.js principal

## Local Contracts
- Aplicações são clientes dos packages (akasha-core, mentor, etc.)
- API routes em `src/app/api/` devem seguir REST patterns
- Componentes React em `src/components/`

## Work Guidance
- Usar TypeScript estrito
- Testes com Vitest/React Testing Library
- API routes com validação Zod

## Verification
- `pnpm typecheck`
- `pnpm test`

## Child DOX Index
- [akasha-portal](file:///home/skynet/cabala-dos-caminhos/apps/akasha-portal/AGENTS.md) (se existir)
