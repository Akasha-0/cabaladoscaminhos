# Quality Metrics & Evals - Cabala dos Caminhos

Sistema completo de métricas e evals para auto-avaliação contínua e evolução do projeto.

## Estrutura

```
src/lib/quality/
├── metrics-framework.ts      # Framework central de métricas
├── auto-evolution.ts         # Sistema de auto-evolução
├── runner.ts                 # CLI runner
└── evals/
    ├── index.ts              # Exporta todos os evals
    ├── spiritual-correlations.ts  # Evals para correlações espirituais
    ├── ai-integration.ts      # Evals para integração IA
    ├── performance.ts         # Evals para performance
    ├── ui-ux.ts              # Evals para UI/UX Design
    ├── architecture.ts       # Evals para arquitetura
    ├── qa-testing.ts         # Evals para QA/Testes
    └── documentation.ts       # Evals para documentação

tests/lib/quality/
├── metrics.test.ts           # Testes de regressão do framework
└── evals/
    └── performance.test.ts   # Testes de evals de performance

.github/workflows/
└── quality-evals.yml        # GitHub Actions para evals automáticos

scripts/
└── run-quality-eval.ts       # Script para executar evals
```

## Categorias de Métricas

| Categoria | Peso | Threshold Critical | Descrição |
|-----------|------|-------------------|-----------|
| `spiritual_correlations` | 1.5x | 95% | Sistema de correlações espirituais (Tarot, Orixás, Cabala, etc.) |
| `ai_integration` | 1.5x | 90% | Integração com OpenAI/Minimax, Oracle, Circuit Breaker |
| `performance` | 1.2x | 90% | Core Web Vitals, latência, cache, bundle size |
| `ui_design` | 1.0x | 85% | Design tokens, componentes, responsividade |
| `ux_design` | 1.0x | 85% | Acessibilidade, hierarquia tipográfica, estados |
| `architecture` | 1.2x | 90% | Modularidade, type safety, error handling |
| `qa_testing` | 1.3x | 90% | Cobertura de testes, flakiness, isolamento |
| `documentation` | 0.8x | 80% | README, API docs, TSDoc, changelog |

## Evals por Categoria (80+ métricas)

### Spiritual Correlations (10 evals)
1. **Coverage Eval** - Verifica 22 Arcanos Maiores do Tarot
2. **Correlation Completeness** - Valida mapeamentos cruzados
3. **Element ↔ Orixá Consistency** - Consistencia de elementos
4. **Cross-References** - Valida referências bidirecionais
5. **Data Integrity** - Integridade das lookup tables
6. **Semantic Accuracy** - Precisão semântica dos Orixás
7. **Symbol Mappings** - Cores, números, direções
8. **Sefirot Correspondences** - 10 Sefirots com 22 caminhos
9. **Odu Ifá System** - 16 Odús principais
10. **Chakra Integration** - 7 Chakras com atributos

### AI Integration (10 evals)
1. **API Success Rate** - Taxa de sucesso >98%
2. **Latency P95** - Latência <2000ms
3. **Circuit Breaker** - Ativação correta em falhas
4. **Rate Limiting** - Effetividade do rate limiting
5. **Cache Hit Ratio** - Cache hit >70%
6. **Sanitization** - Bloqueio de XSS/injection
7. **Fallback Behavior** - Fallbacks funcionais
8. **Semantic Coherence** - Coerência espiritual
9. **Token Usage Efficiency** - Uso eficiente de tokens
10. **Error Recovery** - Recuperação de erros

### Performance (10 evals)
1. **LCP** - <2500ms
2. **FID** - <100ms
3. **CLS** - <0.1
4. **TTFB** - <600ms
5. **API Response Time P95** - <500ms
6. **Database Query Time P95** - <200ms
7. **Redis Cache Hit** - >80%
8. **Bundle Size** - <500KB gzipped
9. **Memory Usage** - <512MB
10. **Throughput** - >100 rps

### UI/UX (10 evals)
1. **Design Token Coverage** - Uso consistente de tokens
2. **Accessibility** - WCAG 2.1 compliance
3. **Responsive Design** - Breakpoints mobile/tablet/desktop
4. **Component Consistency** - Consistência visual
5. **Dark/Light Mode** - Ambos themes funcionais
6. **Animation Performance** - Sem jank
7. **Typography Hierarchy** - Hierarquia h1-h6
8. **Color Contrast** - Ratio >4.5:1
9. **Loading States** - Estados implementados
10. **Touch Target Size** - >44px

### Architecture (10 evals)
1. **Modularity** - Separação de módulos
2. **Type Safety** - Sem `any`, generics corretos
3. **Error Handling** - Erros tratados
4. **API Design** - REST patterns
5. **Database Schema** - Relacionamentos, indexes
6. **Dependency Inversion** - DIP seguido
7. **Cohesion** - Alta coesão
8. **Coupling** - Baixo acoplamento
9. **Scalability** - Suporte a escala horizontal
10. **Code Organization** - Estrutura consistente

### QA/Testing (10 evals)
1. **Test Coverage** - >80% linhas
2. **Critical Path Coverage** - >95% para auth/payments
3. **Test Flakiness** - <5% flakiness
4. **Test Execution Time** - <5min
5. **Mock Quality** - Mock não excessivo
6. **Assertion Density** - >2 assertions/test
7. **Test Isolation** - >90% isolados
8. **E2E Coverage** - Fluxos críticos cobertos
9. **CI Reliability** - Pipeline confiável
10. **Visual Regression** - Componentes corretos

### Documentation (10 evals)
1. **README Quality** - Setup, features, contrib guild
2. **API Documentation** - Todos endpoints documentados
3. **Type Documentation** - TSDoc comments
4. **Changelog** - Atualizado no padrão Keep a Changelog
5. **Contributing Guide** - Coding standards
6. **Component Documentation** - Props, examples
7. **Error Messages** - Descritivas com contexto
8. **Examples Coverage** - Code examples
9. **Inline Comments** - Lógica complexa comentada
10. **Version Documentation** - SemVer seguido

## Sistema de Auto-Evolução

### Fluxo
```
1. Run All Evals → Generate Baseline Report
2. Analyze → Identify Improvement Targets (sorted by priority)
3. Generate Actions → Create improvement tasks
4. Auto-Execute (low-effort) → Apply changes automatically
5. Manual Review (high-effort) → Human approval required
6. Re-run Evals → Measure improvement
7. Update Trends → Track historical data
```

### Configurações
```typescript
{
  maxAttemptsPerMetric: 3,       // Max tentativas por métrica
  autoExecuteLowEffort: true,     // Auto-executar low-effort
  baselineThreshold: 70,            // Score mínimo para iniciar
  targetImprovement: 5,            // Melhoria alvo por ciclo
  cooldownPeriod: 7,               // Dias entre ciclos
}
```

## Comandos

```bash
# Executar todos os evals
npm run quality

# Executar com evolução automática
npm run quality:evolve

# Executar apenas categorias específicas
npm run quality -- --categories spiritual_correlations,performance

# Saída em JSON
npm run quality -- --output json --output-path ./report.json

# Saída em Markdown
npm run quality -- --output markdown --output-path ./report.md

# Executar via GitHub Actions (manual)
gh workflow run quality-evals.yml

# Executar via GitHub Actions (automático - semanal)
# Configurado para toda segunda-feira às 06:00 UTC
```

## GitHub Actions Integration

### Triggers
- `workflow_dispatch` - Execução manual
- `schedule` - Toda segunda-feira às 06:00 UTC
- `pull_request` - Automaticamente em PRs

### Outputs
- Artifact com relatório JSON
- Comment no PR com summary
- Issue criada em caso de falha (labels: automated, quality)

## Testes de Regressão

109 testes verificando:
- MetricResultBuilder
- Sistema de grading (A+ até F)
- EvalSuiteRunner
- QualityReportGenerator
- validateMetricValue (todos operators)
- calculateScoreFromValue (todos thresholds)
- DEFAULT_THRESHOLDS (todas categorias)
- Zod schema validation

```bash
npm run test:run -- tests/lib/quality
# 109 tests passed ✓
```

## Dashboard API

```typescript
// GET /api/quality/dashboard
// Retorna relatório atual + histórico de evolução
// Cache: 5 minutos

// POST /api/quality/dashboard
// Executa evals sob demanda
// Requer: role admin
```

## Próximos Passos

1. [ ] Integrar com banco de dados para persistência de histórico
2. [ ] Adicionar webhooks para notificações (Slack, Discord)
3. [ ] Criar dashboard visual na UI
4. [ ] Implementar mutation testing
5. [ ] Adicionar benchmarks de regressão

---

**Status**: ✅ Framework completo e funcional  
**Testes**: ✅ 109 passing  
**Categorias**: 8  
**Evals**: 80+  
**Auto-Evolução**: ✅ Implementada