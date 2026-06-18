# QA Loop Report — Loop 001
**Date**: 2026-06-17  
**Version**: 0.81.0 (git: v0.0.12-1056-ga33a3873)  
**Build**: `pnpm build:portal` ✅ PASS | root `npm run build` ❌ FAIL  
**Tests**: 473 failed | 112 passed | 4 skipped (589 total)

---

## Cadeia de Pensamento (Thought Chain)

### Layer 1: Build Health
O build do portal funciona (`pnpm build:portal`) mas o build raiz (`npm run build`) está quebrado. Isso é um problema de DX crítico — qualquer pessoa rodando `npm run build` na raiz vai ter erro. Além disso, há 2 warnings de build que precisam de atenção.

### Layer 2: Auth/Session (UX Bug principal)
O bug de "refresh volta pro onboarding" é o problema UX #1. A cadeia: token de acesso expira em 15min → nunca é refreshado → verificação retorna null → redirect incondicional para /onboarding. O endpoint de refresh existe e funciona, mas NENHUMA página o chama.

### Layer 3: Test Infrastructure  
473 testes falhando é um sintoma de divórcio entre testes e código. Testes importam módulos que não existem, usam paths antigos para Prisma, mockam Supabase em vez de Akasha JWT, e têm problemas de ambiente (React version mismatch, ResizeObserver polyfill).

### Layer 4: Missing Modules
12 módulos que testes importam mas não existem. Alguns são funcionalidades reais (correlation libs), outros são páginas de dashboard planejadas mas nunca implementadas, e outros são rotas de API que nunca foram criadas.

### Layer 5: Dead Code
SupabaseProvider残留 — código de uma integração Supabase abandonada que ainda está no tree mas não faz nada.

---

## Métricas de QA (0-100)

### B1 — Build Health
| Indicador | Peso | Score |
|-----------|------|-------|
| Root build command funciona | 20% | 0 (fails) |
| Portal build funciona | 30% | 100 (passa com warnings) |
| Build warnings (deve ser 0) | 20% | 50 (2 warnings) |
| TypeScript errors | 30% | 90 (tsc não verificado ainda) |
| **B1 Total** | | **62** |

### B2 — Test Health  
| Indicador | Peso | Score |
|-----------|------|-------|
| Test pass rate (112/589) | 40% | 19 |
| Test file health (arquivos com TODOS falhando) | 20% | 30 |
| Missing module tests (devem ser skip ou fix) | 20% | 0 |
| Auth mock correctness | 20% | 25 |
| **B2 Total** | | **21** |

### B3 — Auth/Session Robustness
| Indicador | Peso | Score |
|-----------|------|-------|
| Token refresh é chamado automaticamente | 30% | 0 (nunca chamado) |
| Sessions persistem após refresh | 25% | 0 (volta pro onboarding) |
| Logout limpa todos os cookies | 15% | 80 (precisa verificar) |
| Auth error messages são úteis | 15% | 40 (redirect obscuro) |
| SupabaseProvider dead code | 10% | 0 (dead code presente) |
| **B3 Total** | | **19** |

### B4 — Runtime Stability
| Indicador | Peso | Score |
|-----------|------|-------|
| Middleware cobre rotas corretamente | 25% | 70 (locale + security, auth client-side) |
| API error handling (500s correctly returned) | 25% | 60 (alguns endpoints retornam 200 em vez de 500) |
| Null/undefined edge cases | 25% | 50 (não verificado) |
| Loading states UX | 25% | 60 (verificar) |
| **B4 Total** | | **60** |

### B5 — UI/UX Consistency
| Indicador | Peso | Score |
|-----------|------|-------|
| Emoji usage removed (✦, ▲, ▼ em vez de Lucide) | 20% | 80 (20+ fixes aplicados) |
| Consistent icon library (Lucide only) | 20% | 80 |
| Loading states (sem emoji spinners) | 20% | 80 |
| Error states (sem emoji) | 20% | 70 (ErrorState test falhando) |
| Design system consistency | 20% | 70 |
| **B5 Total** | | **76** |

### B6 — Missing/Broken Features
| Indicador | Peso | Score |
|-----------|------|-------|
| lib/correlation/* (7 módulos) | 25% | 0 (não existem) |
| lib/ai/theme-router | 15% | 0 (não existe) |
| /api/chat/oracle route | 15% | 0 (não existe) |
| /api/mapa route | 15% | 0 (não existe) |
| Dashboard sub-pages (chakra, orixa, ritual) | 20% | 0 (não existem) |
| @akasha/mentor/rag build warning | 10% | 50 (lazy import com fallback) |
| **B6 Total** | | **8** |

---

## Overall Score: 41/100

### Scorecard Visual
```
B1 Build Health:       62/100 ████████░░░░░░░░░░░░░
B2 Test Health:         21/100 ███░░░░░░░░░░░░░░░░░░
B3 Auth/Session:       19/100 ██░░░░░░░░░░░░░░░░░░░
B4 Runtime Stability:   60/100 ████████░░░░░░░░░░░░░
B5 UI/UX Consistency:   76/100 ██████████████░░░░░░░
B6 Missing Features:    8/100  █░░░░░░░░░░░░░░░░░░░░

OVERALL:               41/100 █████░░░░░░░░░░░░░░░░
```

---

## Priorização (Focus for Loop 002)

### CRÍTICO (quebrando produção)
1. **AUTH BUG**: Token refresh nunca é chamado — usuário perde sessão após 15min
2. **ROOT BUILD**: `npm run build` da erro — DX quebrado

### ALTO (afeta muito gente)
3. **MISSING MODULES**: 12 módulos que testes importam mas não existem
4. **TEST MOCKS**: Stale Prisma path (`@/lib/prisma` vs `@/lib/infrastructure/prisma`)

### MÉDIO (quality of life)
5. **@akasha/mentor/rag**: Build warning (lazy import, mas deveria existir)
6. **API error codes**: 200 vs 500 wrong returns
7. **Dead SupabaseProvider**: Dead code no tree

### BAIXO (polimento)
8. **ErrorState test**: Emoji change broke test assertion
9. **ResizeObserver polyfill**: 3D components sem polyfill em testes
10. **Dashboard sub-pages**: Pages planejadas mas não implementadas

---

## Evals Rígidos (Hard Evals — nunca dar nota alta demais)

### Eval 1: Auth Session Persistence
```typescript
// CRITÉRIO: Após login, refresh da página NÃO deve redirecionar para /onboarding
// se refresh token ainda é válido (30 dias)
// THRESHOLD: 0/100 se falhar 1x, 100/100 se passar 10/10 refreshes consecutivos
async function evalAuthPersistence() {
  // Steps:
  // 1. Login
  // 2. Wait 16 minutes (token expired)
  // 3. Refresh page
  // 4. EXPECT: still on dashboard (no redirect to /onboarding)
  // 5. Repeat 10x
}
```

### Eval 2: Build Command Correctness
```typescript
// CRITÉRIO: `npm run build` (raiz) E `pnpm build:portal` devem funcionar
// THRESHOLD: 0/100 se root build falha, 50/100 se portal build tem warnings, 100/100 se ambos passing clean
```

### Eval 3: Test Pass Rate (Decay Model)
```typescript
// CRITÉRIO: Taxa de aprovação NUNCA pode ser > 50% quando há >100 módulos faltando
// A nota de testes deve DECAIR proporcionalmente ao número de missing modules
// THRESHOLD: score = min(50, (passed/total) * 100) quando missing_modules > 10
```

### Eval 4: API Error Code Correctness  
```typescript
// CRITÉRIO: 400 para bad input, 401 para não autenticado, 500 para server errors
// THRESHOLD: 0/100 se QUALQUER endpoint retorna código errado consecutivamente
// Deve haver 100% de conformidade com REST semantics
```

### Eval 5: Feature Completeness (Inverse)
```typescript
// CRITÉRIO: Score = 100 - (missing_modules * 7) - (stale_tests * 3)
// missing_modules: módulos que testes importam mas não existem
// stale_tests: testes com paths errados ou mocks quebrados
// THRESHOLD: Nunca pode ser > 50 enquanto houver > 5 missing modules
```

---

## Action Plan Loop 002

### FASE 1: CRÍTICO — Auth Refresh Bug
- [ ] Criar `AuthSessionProvider` server component que chama refresh automaticamente
- [ ] Ou: adicionar refresh call no middleware
- [ ] Remover SupabaseProvider dead code
- [ ] Testar: login → wait 16min → refresh → permanece logado

### FASE 2: CRÍTICO — Root Build Fix
- [ ] Mudar `package.json` root `build` script para `pnpm build:portal`
- [ ] Verificar que turbo.json está configurado corretamente

### FASE 3: TEST INFRASTRUCTURE  
- [ ] Corrigir todos os stale Prisma imports (`@/lib/prisma` → `@/lib/infrastructure/prisma`)
- [ ] Corrigir mocks de auth (de Supabase → Akasha JWT)
- [ ] Marcar testes de missing modules como `skip` temporário com TODO comment
- [ ] Adicionar ResizeObserver polyfill para testes de Three.js

### FASE 4: MISSING MODULES
- [ ] Decidir: criar os módulos ou remover os testes?
- [ ] Se criar: implementar lib/correlation/* (7 módulos)
- [ ] Se criar: implementar theme-router
- [ ] Se criar: implementar /api/chat/oracle e /api/mapa routes
- [ ] Se remover: deletar testes órfãos

---

## Histórico de Evolução
| Loop | Data | Score | Foco Principal | Resolved |
|------|------|-------|----------------|----------|
| 001 | 2026-06-17 | 41/100 | Initial assessment | Auth bug, build command, 12 missing modules |
