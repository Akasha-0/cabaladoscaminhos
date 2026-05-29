# CABALA DOS CAMINHOS — PROGRESS LOG

**Última atualização:** 2026-05-29 08:40
**Ciclos de desenvolvimento completados:** 1
**Build status:** FAILING (build break)
**Tests:** 739 passing, 1 failing, 14 skipped

## ✅ IMPLEMENTADO E FUNCIONANDO

### Core Infrastructure
- Next.js 16.2.6 + React 19 + App Router
- Prisma 7 + PostgreSQL via pg adapter
- Supabase SSR integration
- Redis/ioredis for caching
- JWT authentication (bcryptjs + jsonwebtoken)
- Stripe payments configured
- OpenAI SDK integrated
- jsPDF for PDF exports

### Engines Implementadas
- Numerologia Cabalística (cálculos, name-analysis, personality, destiny-number, compatibility-scores)
- Odu Ifá system (16 Odús com dados completos - ogbe, oyeku, ejioko, etc.)
- Astrologia (planet-calculator, houses, aspects, natal positions, synastry)
- Tarot (22 Arcanos Maiores, cards, meanings, spread-maker)
- Chakra system (v2, v3, v4 data and practice)
- Orixás (complete data for all main orixás with colors, herbs, days, etc.)
- Cabala (tree of life, sephiroth mappings)
- Ayurveda, Cromoterapia, Cromoterapia
- Meditação, Yoga, Mantras, Mudras
- Reiki, Marma, Acupuntura
- Biorritmo, Energias, Aura
- Daily wisdom, guidance, affirmations

### Frontend
- Dashboard with widgets (SpiritualEnergyWidget, DailyWisdomCard, etc.)
- Multiple dashboard pages (main, debug, test-complete, etc.)
- Login/auth flows
- Profile pages
- Chat integration with AI oracles

### API Routes
- 100+ API routes across src/app/api/
- Auth routes (login, register, refresh, create-test, test)
- Spiritual data routes (orixás, numerologia, astrologia, tarot, etc.)
- Dashboard widgets, calendar, export, shopping

### Testing
- 36 test files, 754 tests (739 passing, 14 skipped)

## 🔄 EM DESENVOLVIMENTO AGORA

### Build Breaks (Blocking)
1. `src/components/dashboard/DailyWisdomCard.tsx:192` - Type error: ?? unreachable
2. `tests/integration/api/oracle.test.ts` - 9 errors with module= assignment

### Test Failure
- `tests/lib/quality/metrics.test.ts` - flaky timing test expecting duration >= 10ms

### Lint Errors
- 23 lint errors (mostly module= assignment in oracle.test.ts)
- 629 warnings (unused vars, etc.)

## 📋 PRÓXIMAS PRIORIDADES (em ordem)

### Imediata (Build Breaks)
1. Fix DailyWisdomCard.tsx ?? operator issue (line 192)
2. Fix oracle.test.ts module= errors
3. Fix or skip flaky timing test in metrics.test.ts
4. Get build passing

### Curto Prazo (After Build Fix)
1. Create PROGRESS.md (IN PROGRESS)
2. Clean up untracked files (move tests/integration/api/correlation-diagnosis.test.ts.disabled)
3. Verify tests fully passing
4. Commit current work

### Sprint 2 - Core Engines
1. Verify numerologia calculations with real cases
2. Verify Odu calculations with real cases  
3. Verify astrologia with known natal charts
4. Build correlation engine
5. Build insights generator (OpenAI)

### Sprint 3 - Frontend
1. Clean up dashboard components
2. Build Mapa da Alma page
3. Build Odu visualization
4. Build Chakra meditation page

## 🐛 BUGS CONHECIDOS

| Bug | Arquivo | Linha | Status |
|-----|---------|-------|--------|
| ?? operator unreachable | DailyWisdomCard.tsx | 192 | Open |
| module= lint errors | oracle.test.ts | 39, 206, 222, etc. | Open |
| Flaky timing test | metrics.test.ts | 482 | Open |

## 🏗️ DECISÕES ARQUITETURAIS TOMADAS

1. **Modular Orixá data structure**: Each orixá has its own data file + practice file in src/lib/orixa/
2. **Spiritual correlation engine**: Cross-system analysis to find convergent patterns
3. **AI integration**: OpenAI for insights generation, MiniMax for oracle chat
4. **Widget-based dashboard**: Adaptive grid with spiritual energy, wisdom, guidance panels
5. **Quality evolution system**: Auto-improvement based on quality reports

## 📊 MÉTRICAS

- Engines implemented: ~15/25 core systems
- Test coverage: 36 files, 754 tests
- API routes: 100+
- Build status: FAILING (1 error)
- Lint status: 23 errors, 629 warnings

## 📁 ESTRUTURA CONFIRMADA

```
src/
  app/
    api/           # 100+ API routes
    dashboard/     # Dashboard pages
    (auth)/        # Auth routes (DELETED - deleted)
    login/         # Login pages
  components/
    dashboard/     # 20+ widget components
    ui/            # shadcn/ui components
  lib/
    ai/            # AI integration (insight-generator, spiritual-coach, etc.)
    astrologia/    # Astrology engines
    numerologia/   # Numerology engines
    numerology/    # Duplicate numerology (needs consolidation)
    orixa/         # Orixá data + practice (modular per orixá)
    tarot/         # Tarot system
    quality/       # Quality metrics and evolution
    redis.ts       # Redis client
  hooks/           # React hooks (useMapaNatal, useNumerologia, etc.)
  middleware.ts    # Auth middleware

prisma/
  schema.prisma    # Database schema

tests/
  lib/             # Unit tests
  integration/     # Integration tests
  components/      # Component tests
  hooks/           # Hook tests
```

## 🔮 ROADMAP

### Completed
- [x] Project setup (Next.js 16, React 19, Prisma 7)
- [x] Auth system (JWT + bcrypt)
- [x] Orixá data system
- [x] Numerologia engine
- [x] Astrologia engine
- [x] Tarot engine
- [x] Chakra system
- [x] Dashboard widgets
- [x] AI integration (OpenAI + MiniMax)

### In Progress
- [x] PROGRESS.md creation (STARTED)
- [ ] Build fix

### Pending
- [ ] Sprint 2: Correlation engine
- [ ] Sprint 3: Mapa da Alma page
- [ ] Sprint 4: PDF export
- [ ] Sprint 5: Payments/Stripe integration

---

*O universo está esperando este projeto.*