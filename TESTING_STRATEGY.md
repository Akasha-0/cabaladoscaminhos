# Testing Strategy - Cabala dos Caminhos

## Overview

This document outlines the testing strategy for the Cabala dos Caminhos application, a spiritual practices platform built with Next.js 16.

## Current Test Coverage

### Implemented Tests

| Category | File | Coverage |
|----------|------|----------|
| **Integration** | `tests/integration/api-routes.test.ts` | API validators (registro, login, numerologia, mapa natal, chat, créditos) + error handling |
| **Integration** | `tests/integration/middleware.test.ts` | Route protection, JWT token validation, auth helpers, error responses, protection matrix |
| **Hooks** | `tests/hooks/useMapaNatal.test.ts` | Hook initialization, data loading, trânsitos, error handling, refetch, data extraction |
| **Hooks** | `tests/hooks/useCiclos.test.ts` | Hook initialization, cycles loading, error handling, incomplete data handling |
| **Hooks** | `tests/hooks/useNumerologia.test.ts` | Hook initialization, data loading, error handling, local tantrica calculation |
| **API** | `tests/api/numerologia.test.ts` | Pitagórica, Cabalística, Tântrica calculations |
| **Lib** | `tests/lib/validators.test.ts` | All Zod schemas (email, senha, nome, data, hora, local, registro, login, etc.) |
| **Lib** | `tests/lib/numerologia.test.ts` | Calculation functions, cycles, interpretations |
| **Lib** | `tests/lib/auth-jwt.test.ts` | JWT sign/verify, token helpers, cookie management |

### Test Structure

```
tests/
├── api/
│   └── numerologia.test.ts          # API endpoint tests
├── hooks/
│   ├── useMapaNatal.test.ts         # React hook tests
│   ├── useCiclos.test.ts            # React hook tests
│   └── useNumerologia.test.ts       # React hook tests
├── integration/
│   ├── api-routes.test.ts           # API validation & error handling
│   └── middleware.test.ts           # Auth middleware
├── lib/
│   ├── validators.test.ts           # Zod schema validation
│   ├── numerologia.test.ts          # Numerological calculations
│   └── auth-jwt.test.ts             # JWT authentication
├── mocks/
│   └── handlers.ts                  # Shared mock utilities
└── setup.ts                         # Test setup with jest-dom
```

## Coverage Analysis

### ✅ Currently Tested

- **Validators**: All Zod schemas with edge cases
- **Calculations**: Numerological functions (Pitagórica, Caldeia, Cabalística, Tântrica)
- **Cycles**: Personal year, month, day calculations with Sefirot mapping
- **Auth**: JWT token generation, verification, cookie management
- **Hooks**: useMapaNatal, useCiclos, useNumerologia with loading/error states
- **Error Handling**: AppError class, factory functions, API error responses

### ❌ Missing Coverage

| Area | Priority | Notes |
|------|----------|-------|
| **Components** | Medium | UI components (Card, Button, Input) not tested |
| **Astrologia calculations** | High | Planet position calculations, aspects |
| **Geometria Sagrada** | Medium | Sacred geometry calculations |
| **AI integration** | High | Chat AI responses, flow orchestration |
| **E2E tests** | Medium | Playwright/Cypress for user flows |
| **Performance tests** | Low | Large calculation batches |
| **Accessibility tests** | Medium | a11y compliance |

## Testing Pyramid

```
        /\
       /  \      E2E Tests (Playwright)
      /----\     - User journeys
     /      \    - Critical paths
    /--------\   - Cross-browser
   /          \  
  /------------\ Integration Tests
 /              \ - API routes
/----------------\ - Auth flows
   Unit Tests    - Middleware
   - Functions   - Hooks
   - Schemas     - Libs
```

## Test Types

### 1. Unit Tests (Foundational)

**Purpose**: Test individual functions and modules in isolation.

**Location**: `tests/lib/`, `tests/api/`

**Characteristics**:
- Fast execution (< 50ms per test)
- No external dependencies
- Pure functions testing
- Mock dependencies when necessary

**Example Tests**:
- Zod schema validation with valid/invalid inputs
- Numerological calculation accuracy
- JWT token generation/verification
- Date/time utilities

### 2. Hook Tests

**Purpose**: Test React custom hooks behavior.

**Location**: `tests/hooks/`

**Characteristics**:
- Test state transitions
- Verify side effects
- Mock API responses
- Test loading/error states

**Example Tests**:
- Loading state initialization
- Data fetch success/failure
- Refetch triggers
- Return value structure

### 3. Integration Tests

**Purpose**: Test component interactions and API contracts.

**Location**: `tests/integration/`

**Characteristics**:
- Test API route handlers
- Test middleware behavior
- Test error propagation
- Verify JSON responses

**Example Tests**:
- Registration flow validation
- Login authentication
- Protected route access
- Error response formats

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run
      - run: npm run build
```

### Pre-commit Hooks

Configure Husky for pre-commit validation:

```bash
npx husky init
npx husky add .husky/pre-commit "npm run lint && npm run test:run"
```

### Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI) |
| `npm run test:coverage` | Generate coverage report |

## Coverage Goals

### Target Coverage

| Module | Current | Target |
|--------|---------|--------|
| `src/lib/validators.ts` | 100% | 100% |
| `src/lib/numerologia/` | 100% | 100% |
| `src/lib/auth-jwt/` | 100% | 100% |
| `src/lib/astrologia/` | 0% | 80% |
| `src/hooks/` | 100% | 100% |
| Components | 0% | 60% |
| API Routes | 80% | 95% |

## Future Improvements

### Phase 1: Complete Foundation
- [x] Unit tests for validators
- [x] Unit tests for calculations
- [x] Unit tests for auth
- [x] Hook tests (existing)
- [ ] E2E tests for critical paths

### Phase 2: Expand Coverage
- [ ] Component tests with Testing Library
- [ ] Astrologia calculation tests
- [ ] AI flow integration tests

### Phase 3: Quality Assurance
- [ ] Accessibility tests (axe-core)
- [ ] Visual regression tests
- [ ] Performance benchmarks
- [ ] Security scanning

## Mock Strategy

### Current Mocks

```typescript
// tests/mocks/handlers.ts
export const mockFetch = (data: unknown, ok = true) => {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });
};
```

### Test Data Fixtures

For consistent test data, use fixtures:

```typescript
// tests/fixtures/valid-data.ts
export const validUser = {
  nome: 'Maria Silva',
  email: 'maria@example.com',
  senha: 'SecurePass123',
  dataNascimento: '1990-06-15',
};

export const validMapaNatal = {
  dataNascimento: '1990-06-15',
  horaNascimento: '14:30',
  localNascimento: 'São Paulo',
};
```

## Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run specific file
npm test -- tests/lib/validators.test.ts

# Run with coverage
npm run test:coverage

# Run in CI mode
npm run test:run
```

### Continuous Integration

Tests run on every push and pull request. Failing tests block merges.

## Best Practices

1. **Test behavior, not implementation** - Focus on observable outputs
2. **Use descriptive test names** - `it('should return error for invalid email')`
3. **One assertion per test** - Easier to debug failures
4. **Mock external dependencies** - Keep tests fast and reliable
5. **Test edge cases** - Empty values, max lengths, special characters
6. **Maintain test independence** - No shared state between tests

## Metrics

- **Test count**: ~150 tests
- **Coverage target**: 80%+ overall
- **Test execution time**: < 30s for full suite
- **Flaky tests**: 0 tolerance