# Tests DOX

## Purpose
Suite completa de testes para o projeto Akasha.

## Ownership
- `api/`: Testes de API routes
- `app/`: Testes de componentes React
- `e2e/`: Testes end-to-end (Playwright)
- `hooks/`: Testes de React hooks customizados
- `integration/`: Testes de integração entre módulos
- `lib/`: Testes unitários de bibliotecas (400+ categorias)

## Local Contracts
- Arquivos de teste seguem padrão `*.test.ts`
- Arquivos de fixture em `__fixtures__/` ou junto ao teste
- Mocks centralizados em `mocks/`

## Work Guidance
- Tests devem ser determinísticos
- Evitar dependência de ordem entre testes
- Coverage targets definidos em `package.json`

## Verification
- `pnpm test:run` - testes não-interativos
- `pnpm test` - modo watch
- `pnpm quality` - lint + typecheck

## Child DOX Index
- [architecture tests](file:///home/skynet/cabala-dos-caminhos/tests/architecture/AGENTS.md) (se existir)
