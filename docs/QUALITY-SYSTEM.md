# 🔮 Quality Metrics & Evals System - Cabala dos Caminhos

Sistema completo de métricas e evals para medição rigorosa da qualidade do projeto com foco em auto-evolução contínua.

## 📊 Visão Geral

| Componente | Status | Descrição |
|------------|--------|-----------|
| **Framework Core** | ✅ 17KB | Sistema central de métricas com Zod schemas |
| **Evals Espirituais** | ✅ 44KB | 10 evals para correlações espirituais |
| **Evals IA** | ✅ 27KB | 10 evals para integração com OpenAI/Minimax |
| **Evals Performance** | ✅ 25KB | 10 evals para Core Web Vitals |
| **Evals UI/UX** | ✅ 35KB | 10 evals para design system |
| **Evals Arquitetura** | ✅ 33KB | 10 evals para estrutura de código |
| **Evals QA/Testing** | ✅ 44KB | 10 evals para cobertura de testes |
| **Evals Documentação** | ✅ 32KB | 10 evals para docs |
| **Auto-Evolution** | ✅ 18KB | Motor de auto-melhoria contínua |
| **Tests Regressão** | ✅ 45KB | 109 testes de validação |

**Total: 80+ evals rigorosos em 8 categorias**

## 🚀 Quick Start

```bash
# Executar todos os evals
npm run quality

# Executar com auto-evolução
npm run quality:evolve

# Executar testes de regressão
npm run test:run -- tests/lib/quality

# Executar via GitHub Actions (manual)
gh workflow run quality-evals.yml
```

## 📁 Estrutura do Projeto

```
├── src/lib/quality/
│   ├── metrics-framework.ts    # Framework central
│   ├── auto-evolution.ts     # Motor de evolução
│   ├── runner.ts             # CLI runner
│   └── evals/
│       ├── spiritual-correlations.ts  # Sistema espiritual
│       ├── ai-integration.ts         # Integração IA
│       ├── performance.ts            # Performance
│       ├── ui-ux.ts                 # UI/UX Design
│       ├── architecture.ts          # Arquitetura
│       ├── qa-testing.ts            # QA/Testes
│       └── documentation.ts        # Documentação
│
├── tests/lib/quality/
│   ├── metrics.test.ts        # 109 testes
│   └── evals/
│       └── performance.test.ts
│
├── .github/workflows/
│   └── quality-evals.yml     # CI/CD automation
│
├── scripts/
│   └── run-quality-eval.ts   # CLI script
│
└── docs/
    └── QUALITY-METRICS.md     # Documentação completa
```

## 🎯 Sistema de Auto-Evolução

### Ciclo de Evolução

```
┌─────────────────────────────────────────────────────────────┐
│  1. RUN EVALS ────► 2. ANALYZE ────► 3. GENERATE ACTIONS    │
│       │                   │                   │             │
│       ▼                   ▼                   ▼             │
│  Baseline Report     Improvement      Improvement Tasks     │
│                      Targets          (sorted by priority) │
│                                                             │
│  4. AUTO-EXECUTE ──► 5. RE-RUN ────► 6. UPDATE TRENDS       │
│       │                   │                   │             │
│       ▼                   ▼                   ▼             │
│  Low-effort fixes    New Score          Historical Data    │
│  (automatic)         Compare             Track Progress     │
└─────────────────────────────────────────────────────────────┘
```

### Configuração Padrão

```typescript
{
  maxAttemptsPerMetric: 3,    // Max tentativas por métrica
  autoExecuteLowEffort: true,  // Auto-executar melhorias triviais
  baselineThreshold: 70,        // Score mínimo para iniciar evolução
  targetImprovement: 5,        // Meta de melhoria por ciclo
  cooldownPeriod: 7,            // Dias entre ciclos de evolução
}
```

### Categorias e Pesos

| Categoria | Peso | Critical | High | Medium | Low |
|-----------|------|----------|------|--------|-----|
| `spiritual_correlations` | 1.5x | 95% | 85% | 70% | 50% |
| `ai_integration` | 1.5x | 90% | 80% | 65% | 45% |
| `performance` | 1.2x | 90% | 75% | 60% | 40% |
| `ui_design` | 1.0x | 85% | 75% | 60% | 40% |
| `ux_design` | 1.0x | 85% | 75% | 60% | 40% |
| `architecture` | 1.2x | 90% | 80% | 65% | 45% |
| `qa_testing` | 1.3x | 90% | 80% | 65% | 45% |
| `documentation` | 0.8x | 80% | 70% | 55% | 35% |

### Sistema de Grades

| Score | Grade | Cor |
|-------|-------|-----|
| 97-100% | A+ | 🟢 Verde |
| 93-96% | A | 🟢 Verde |
| 90-92% | A- | 🟢 Verde |
| 87-89% | B+ | 🟡 Amarelo |
| 83-86% | B | 🟡 Amarelo |
| 80-82% | B- | 🟡 Amarelo |
| 77-79% | C+ | 🟠 Laranja |
| 73-76% | C | 🟠 Laranja |
| 70-72% | C- | 🔴 Vermelho |
| 60-69% | D | 🔴 Vermelho |
| <60% | F | 🔴 Vermelho |

## 📋 Evals Detalhados

### 1. Spiritual Correlations (Correlações Espirituais)

| ID | Nome | Threshold | Descrição |
|----|------|-----------|-----------|
| `spiritual-tarot-coverage` | Tarot Coverage | 100% | 22 Arcanos Maiores mapeados |
| `spiritual-correlation-completeness` | Correlation Completeness | 100% | Mapeamentos cruzados completos |
| `spiritual-element-orixa-consistency` | Element↔Orixá | 95% | Consistência de elementos |
| `spiritual-cross-references` | Cross-References | 100% | Referências bidirecionais |
| `spiritual-data-integrity` | Data Integrity | 100% | Lookup tables integros |
| `spiritual-orixa-semantic-accuracy` | Orixá Semantic | 95% | Atributos semânticos corretos |
| `spiritual-symbol-mappings` | Symbol Mappings | 98% | Cores, números, direções |
| `spiritual-sefirot-correspondences` | Sefirot | 100% | 10 Sefirots com 22 caminhos |
| `spiritual-odufa-system` | Odu Ifá | 100% | 16 Odús principais |
| `spiritual-chakra-integration` | Chakra Integration | 95% | 7 Chakras com atributos |

### 2. AI Integration (Integração IA)

| ID | Nome | Threshold | Descrição |
|----|------|-----------|-----------|
| `ai-api-success-rate` | API Success Rate | >98% | Taxa de sucesso OpenAI/Minimax |
| `ai-latency-p95` | Latency P95 | <2000ms | Latência P95 de respostas |
| `ai-circuit-breaker` | Circuit Breaker | 5 falhas | Ativação em falhas |
| `ai-rate-limiting` | Rate Limiting | 100% | Retorno correto de 429 |
| `ai-cache-hit-ratio` | Cache Hit Ratio | >70% | Eficiência do cache |
| `ai-sanitization` | Sanitization | 100% | Bloqueio XSS/injection |
| `ai-fallback-behavior` | Fallback Behavior | ✓ | Fallbacks funcionais |
| `ai-semantic-coherence` | Semantic Coherence | >80% | Coerência espiritual |
| `ai-token-usage-efficiency` | Token Efficiency | >50% | Uso eficiente de tokens |
| `ai-error-recovery` | Error Recovery | >66% | Recuperação de erros |

### 3. Performance

| ID | Nome | Threshold | Descrição |
|----|------|-----------|-----------|
| `perf-lcp` | LCP | <2500ms | Largest Contentful Paint |
| `perf-fid` | FID | <100ms | First Input Delay |
| `perf-cls` | CLS | <0.1 | Cumulative Layout Shift |
| `perf-ttfb` | TTFB | <600ms | Time to First Byte |
| `perf-api-latency` | API Latency P95 | <500ms | Latência P95 de APIs |
| `perf-db-query` | DB Query P95 | <200ms | Query duration P95 |
| `perf-cache-hit` | Cache Hit | >80% | Redis cache efficiency |
| `perf-bundle-size` | Bundle Size | <500KB | JS gzipped |
| `perf-memory` | Memory Usage | <512MB | Heap memory |
| `perf-throughput` | Throughput | >100 rps | Requests per second |

### 4. UI/UX Design

| ID | Nome | Threshold | Descrição |
|----|------|-----------|-----------|
| `ui-design-token-coverage` | Token Coverage | >90% | Uso consistente de tokens |
| `ui-accessibility` | Accessibility | WCAG 2.1 | Compliance |
| `ui-responsive` | Responsive | 3 breakpoints | Mobile/Tablet/Desktop |
| `ui-component-consistency` | Component | >95% | Consistência visual |
| `ui-dark-light-mode` | Dark/Light | 100% | Ambos themes |
| `ui-animation-performance` | Animation | <16ms | Frame time |
| `ui-typography-hierarchy` | Typography | ✓ | Hierarquia h1-h6 |
| `ui-color-contrast` | Contrast | >4.5:1 | Ratio de contraste |
| `ui-loading-states` | Loading States | 100% | Estados implementados |
| `ui-touch-target` | Touch Target | >44px | Tamanho mínimo |

### 5. Architecture (Arquitetura)

| ID | Nome | Threshold | Descrição |
|----|------|-----------|-----------|
| `arch-modularity` | Modularity | >90% | Separação de módulos |
| `arch-type-safety` | Type Safety | 100% | Sem `any` types |
| `arch-error-handling` | Error Handling | >95% | Erros tratados |
| `arch-api-design` | API Design | REST | Patterns consistentes |
| `arch-database-schema` | DB Schema | ✓ | Relacionamentos, indexes |
| `arch-dependency-inversion` | DI | >90% | DIP seguido |
| `arch-cohesion` | Cohesion | >85% | Alta coesão |
| `arch-coupling` | Coupling | <20 | Imports por arquivo |
| `arch-scalability` | Scalability | ✓ | Escala horizontal |
| `arch-code-organization` | Organization | >90% | Estrutura consistente |

### 6. QA/Testing (QA/Testes)

| ID | Nome | Threshold | Descrição |
|----|------|-----------|-----------|
| `qa-test-coverage` | Coverage | >80% | Linhas cobertas |
| `qa-critical-path` | Critical Path | >95% | Auth/Payments |
| `qa-test-flakiness` | Flakiness | <5% | Tests não flaky |
| `qa-execution-time` | Exec Time | <5min | Tempo total |
| `qa-mock-quality` | Mock Quality | 70-90% | Mock adequado |
| `qa-assertion-density` | Assertions | >2/test | Densidade |
| `qa-test-isolation` | Isolation | >90% | Tests isolados |
| `qa-e2e-coverage` | E2E Coverage | >80% | Fluxos críticos |
| `qa-ci-reliability` | CI Reliability | >90% | Pipeline confiável |
| `qa-visual-regression` | Visual | >60% | Snapshot tests |

### 7. Documentation (Documentação)

| ID | Nome | Threshold | Descrição |
|----|------|-----------|-----------|
| `docs-readme-quality` | README | >80% | Setup, features, contrib |
| `docs-api-documentation` | API Docs | >85% | Endpoints documentados |
| `docs-type-documentation` | TSDoc | >80% | Types documentados |
| `docs-changelog` | Changelog | >70% | Keep a Changelog |
| `docs-contributing` | Contributing | >75% | Coding standards |
| `docs-components` | Components | >80% | Props, examples |
| `docs-error-messages` | Error Messages | >80% | Descritivas |
| `docs-examples` | Examples | >75% | Code examples |
| `docs-inline-comments` | Comments | >75% | Lógica complexa |
| `docs-version` | Version | >70% | SemVer seguido |

## 🔧 Comandos Disponíveis

```bash
# Evals
npm run quality                    # Executar todos evals
npm run quality:evolve             # Executar com auto-evolução

# Evals específicos
npm run quality -- --categories spiritual_correlations,performance
npm run quality -- --output json --output-path ./report.json
npm run quality -- --verbose

# Testes
npm run test:run -- tests/lib/quality   # Testes de regressão (109 tests)

# CI/CD
gh workflow run quality-evals.yml      # Executar GitHub Actions manualmente

# Dashboard API
curl -X GET http://localhost:3000/api/quality/dashboard  # Relatório atual
curl -X POST http://localhost:3000/api/quality/dashboard # Executar evals
```

## 📈 Dashboard API

### GET /api/quality/dashboard

```json
{
  "report": {
    "id": "uuid",
    "overallScore": 87.5,
    "grade": "B+",
    "suites": [...],
    "criticalIssues": [...],
    "improvements": [...]
  },
  "history": [...],
  "metadata": {
    "timestamp": "2026-05-29T00:00:00Z",
    "cached": true,
    "cacheTTL": 300
  }
}
```

### POST /api/quality/dashboard

```json
{
  "categories": ["spiritual_correlations", "ai_integration"],
  "evolve": true,
  "autoExecute": false
}
```

## 🔄 GitHub Actions

### Triggers

| Trigger | Descrição |
|---------|-----------|
| `workflow_dispatch` | Execução manual |
| `schedule` | Toda segunda-feira às 06:00 UTC |
| `pull_request` | Automaticamente em PRs |

### Jobs

1. **quality-check**: Lint, tests, build
2. **generate-report**: Gera JSON do relatório
3. **post-results**: Comment no PR ou issue

## 🧪 Testes

```
✓ 109 tests passed (2 test files)
  - metrics.test.ts: 94 tests
  - evals/performance.test.ts: 15 tests

✓ Coverage: All framework components tested
✓ Validation: Zod schemas, grading system, threshold configs
✓ Integration: EvalSuiteRunner, QualityReportGenerator
```

## 📊 Output Example

```
══════════════════════════════════════════════════════════════════════════════
  QUALITY REPORT - Cabala dos Caminhos
══════════════════════════════════════════════════════════════════════════════
Timestamp: 2026-05-29T00:00:00.000Z
Version: 1.0.0
Overall Score: 87.5% (Grade: B+)

Suite: SPIRITUAL_CORRELATIONS EVALUATION
------------------------------------------------------------
  Score: 95.4% | 6/10 passed
    ✓ tarot-coverage: 100.0% - All 22 Major Arcana mapped
    ✓ correlation-completeness: 100.0% - Cross-system coverage complete
    ⚠ element-orixa-consistency: 88.0% - Found 2 inconsistencies
    ✓ cross-references: 100.0% - All bidirectional
    ...

🚨 CRITICAL ISSUES:
  -spiritual-chakra-integration: Chakra color mismatch detected
  -ai-semantic-coherence: 78% below threshold

══════════════════════════════════════════════════════════════════════════════
```

## 🎯 Próximos Passos

1. [ ] Integrar com banco de dados para persistência de histórico
2. [ ] Adicionar webhooks para notificações (Slack, Discord)
3. [ ] Criar dashboard visual na UI
4. [ ] Implementar mutation testing
5. [ ] Adicionar benchmarks de regressão
6. [ ] Configurar alertas automáticos

---

**Status**: ✅ Sistema completo e funcional  
**Testes**: ✅ 109 passing  
**Categorias**: 8  
**Evals**: 80+  
**Auto-Evolução**: ✅ Implementada  
**CI/CD**: ✅ GitHub Actions configurado