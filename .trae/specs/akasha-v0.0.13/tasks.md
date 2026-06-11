# Akasha OS v0.0.13 — Tarefas

## Sprint 4: Motor de Correlação

### 4.1 CorrelationEngine

- [ ] Criar `packages/akasha-core/src/correlation-engine.ts`
- [ ] Definir tipo `RecommendationContext`
- [ ] Implementar `findCorrelations(userCode): CrossTraditionCorrelation[]`
- [ ] Implementar `scorePractice(practice, userCode): ScoredPractice`
- [ ] Criar testes unitários

### 4.2 RecommendationGenerator

- [ ] Criar `packages/akasha-core/src/recommendation-generator.ts`
- [ ] Implementar `generateFromRules(context): PracticeRecommendation[]`
- [ ] Implementar `generateFromRAG(query, limit): PracticeRecommendation[]`
- [ ] Implementar `generateHybrid(context, limit): PracticeRecommendation[]`
- [ ] Integrar com RAG existente do `packages/mentor`
- [ ] Criar testes unitários

### 4.3 Guardrails Integration

- [ ] Integrar `validatePractice()` no RecommendationGenerator
- [ ] Filtrar práticas inseguras automaticamente
- [ ] Criar testes de guardrails

---

## Sprint 5: Morning Ritual

### 5.1 Tipos e Modelos

- [ ] Definir tipo `RitualConfig` em `packages/akasha-core/src/types.ts`
- [ ] Definir tipo `RitualResponse`
- [ ] Definir tipo `RitualComponent`

### 5.2 Ritual Calculator

- [ ] Criar `packages/akasha-core/src/ritual-calculator.ts`
- [ ] Implementar `calculateCodeOfDay(date): AkashaCode`
- [ ] Implementar `buildRitual(config, code): RitualResponse`
- [ ] Implementar `getAfirmacaoDoDia(code): string`
- [ ] Implementar `getOracaoDoDia(code): string`
- [ ] Criar testes unitários

### 5.3 API Routes

- [ ] Criar `apps/api/src/routes/akasha/ritual.ts`
- [ ] Implementar `GET /api/akasha/ritual` — retorna ritual do usuário
- [ ] Implementar `POST /api/akasha/ritual/config` — salva configuração
- [ ] Implementar `GET /api/akasha/ritual/today` — retorna ritual de hoje
- [ ] Criar testes de integração

### 5.4 UI Components (se aplicável)

- [ ] Criar componente `RitualCard` para exibir ritual
- [ ] Criar componente `RitualConfig` para configurar
- [ ] Integrar com scheduling (opcional)

---

## Sprint 6: Chat On-Demand

### 6.1 Expandir Tipos

- [ ] Adicionar tipo `ChatRequest` com intent detection
- [ ] Adicionar tipo `ChatResponse` com práticas sugeridas
- [ ] Definir intents: `'practice' | 'guidance' | 'ritual' | 'general'`

### 6.2 Integrar Motor de Correlação

- [ ] Modificar `packages/mentor/src/mentor.ts` para aceitar contexto
- [ ] Integrar `RecommendationGenerator` no mentor
- [ ] Detectar intent automaticamente da mensagem
- [ ] Incluir práticas na resposta quando intent='practice'

### 6.3 API Routes

- [ ] Criar/expandir `apps/api/src/routes/akasha/chat.ts`
- [ ] Implementar `POST /api/akasha/chat` — chat completo
- [ ] Implementar `POST /api/akasha/chat/practice` — só prática
- [ ] Implementar `POST /api/akasha/chat/ritual` — só ritual
- [ ] Criar testes de integração

---

## Tarefas de Infraestrutura

### Testes

- [ ] Adicionar testes em `tests/integration/akasha/`
- [ ] Adicionar testes de guardrails
- [ ] Verificar coverage > 80%

### Quality Gates

- [ ] Garantir `pnpm test:run` passando
- [ ] Garantir `pnpm typecheck` limpo
- [ ] Garantir `pnpm lint` passando

### Documentação

- [ ] Atualizar `docs/04_data-model.md` com novos tipos
- [ ] Documentar APIs no README do package
- [ ] Atualizar CHANGELOG

---

## Dependências Entre Tarefas

```
Sprint 4 (Motor)
  └─ Sprint 5 (Morning Ritual) depende de: CorrelationEngine + RecommendationGenerator
  └─ Sprint 6 (Chat) depende de: CorrelationEngine + RecommendationGenerator
```

---

## Prioridade de Execução

1. **Sprint 4** (Motor de Correlação) — SEMPRE primeiro
2. **Sprint 5** (Morning Ritual) — depende de Sprint 4
3. **Sprint 6** (Chat On-Demand) — depende de Sprint 4
