---
paths:
  - "tests/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
---

# Test Isolation — Cabala dos Caminhos

## Diagnóstico rápido (quando teste falha no suite mas passa isolado)

```bash
# 1. Confirmar que passa isolado:
npx vitest run tests/lib/<topic>/<file>.test.ts

# 2. Se passou isolado, é test pollution:
#    - shared module-level state (let cache = {} no topo)
#    - mocks vazando entre files (vi.fn() no top-level sem reset)
#    - singletons importados de src/lib/* que mutam estado global
```

## Padrões do projeto

### ✅ Use `vi.resetModules()` + `vi.clearAllMocks()` em `beforeEach`
```ts
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});
```

### ✅ Para mocks de Next.js (next/headers, next/navigation, next/cache)
**NÃO use `vi.doMock`** — não funciona para módulos já importados. Use `vi.mock` no topo:
```ts
let mockHeaders = new Map();
vi.mock('next/headers', () => ({
  headers: () => mockHeaders,
}));
```

### ✅ Para DB nos testes
Use `prisma.$transaction([...])` em produção; nos testes, mocke o client com factory functions, não singletons.

## Falhas pré-existentes — escopo

NÃO consertar dentro de uma fase de feature. Padrões registrados como pré-existentes:
- 233 test files B2C legacy (chakra, dosha, reiki, healing) — não existem nesta branch
- `tests/lib/auth-jwt/*` — não existem nesta branch (Fase 6+)
- Data drift `mesa-real-data.ts` vs test expectations — Fase 12 dedicada

Se aparecer uma falha nova que não está em `memory/cycle-*.md`, PARE e investigue — pode ser regressão real.

## Como rodar

- Suite completo: `npm run test:run`
- Isolado: `npx vitest run <path>`
- Watch: `npx vitest watch <path>`
- Com coverage: `npx vitest run --coverage`
