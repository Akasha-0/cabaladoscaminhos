# Akasha OS v0.0.13 — Checklist de Verificação

## Critérios de Sucesso

- [ ] `CorrelationEngine` implementado e testado
- [ ] `RecommendationGenerator` híbrido funcionando
- [ ] API `/api/akasha/ritual` retornando dados corretos
- [ ] API `/api/akasha/chat` integrada com motor
- [ ] Guardrails aplicados em todas as recomendações
- [ ] Testes passando (`pnpm test:run`)
- [ ] Typecheck limpo (`pnpm typecheck`)
- [ ] Lint passando (`pnpm lint`)

---

## Sprint 4: Motor de Correlação

### CorrelationEngine

- [ ] `correlation-engine.ts` criado em `packages/akasha-core/src/`
- [ ] Tipo `RecommendationContext` definido
- [ ] `findCorrelations()` implementado
- [ ] `scorePractice()` implementado
- [ ] Testes unitários passando

### RecommendationGenerator

- [ ] `recommendation-generator.ts` criado em `packages/akasha-core/src/`
- [ ] `generateFromRules()` implementado
- [ ] `generateFromRAG()` implementado (usa embeddings existentes)
- [ ] `generateHybrid()` implementado
- [ ] Integração com RAG funcionando
- [ ] Testes unitários passando

### Guardrails Integration

- [ ] `validatePractice()` integrado no RecommendationGenerator
- [ ] Práticas inseguras filtradas automaticamente
- [ ] Testes de guardrails passando

---

## Sprint 5: Morning Ritual

### Tipos e Modelos

- [ ] `RitualConfig` definido em types
- [ ] `RitualResponse` definido
- [ ] `RitualComponent` definido

### Ritual Calculator

- [ ] `ritual-calculator.ts` criado em `packages/akasha-core/src/`
- [ ] `calculateCodeOfDay()` implementado
- [ ] `buildRitual()` implementado
- [ ] `getAfirmacaoDoDia()` implementado
- [ ] `getOracaoDoDia()` implementado
- [ ] Testes unitários passando

### API Routes

- [ ] `GET /api/akasha/ritual` implementado
- [ ] `POST /api/akasha/ritual/config` implementado
- [ ] `GET /api/akasha/ritual/today` implementado
- [ ] Testes de integração passando

### UI Components

- [ ] `RitualCard` criado (se aplicável)
- [ ] `RitualConfig` criado (se aplicável)

---

## Sprint 6: Chat On-Demand

### Tipos Expandidos

- [ ] `ChatRequest` com intent detection definido
- [ ] `ChatResponse` com práticas definido
- [ ] Intents definidos: `'practice' | 'guidance' | 'ritual' | 'general'`

### Motor Integration

- [ ] `packages/mentor/src/mentor.ts` aceitando contexto
- [ ] `RecommendationGenerator` integrado
- [ ] Intent detection funcionando
- [ ] Práticas incluídas quando intent='practice'

### API Routes

- [ ] `POST /api/akasha/chat` implementado
- [ ] `POST /api/akasha/chat/practice` implementado
- [ ] `POST /api/akasha/chat/ritual` implementado
- [ ] Testes de integração passando

---

## Quality Gates

```bash
pnpm test:run          # Todos os testes passando
pnpm typecheck         # 0 erros TypeScript
pnpm lint             # 0 warnings ESLint
pnpm quality          # Gates de qualidade
```

---

## Checklist de Revisão

### Código

- [ ] Nomenclatura consistente (camelCase para funções, PascalCase para types)
- [ ] Comentários em português
- [ ] Sem código duplicado
- [ ] Funções pequenas e focadas (< 50 linhas idealmente)
- [ ] Types bem definidos (sem `any`)

### Documentação

- [ ] JSDoc em funções públicas
- [ ] Tipos exportados documentados
- [ ] README atualizado se necessário

### Testes

- [ ] Cobertura > 80% para código novo
- [ ] Testes legíveis e descritivos
- [ ] Sem testes commented-out
- [ ] Mocks quando necessário

---

## Criteria of Done

1. **Código implementado** — Todos os arquivos criados/modificados
2. **Testes passando** — `pnpm test:run` retorna 0 erros
3. **Typecheck limpo** — `pnpm typecheck` retorna 0 erros
4. **Lint passando** — `pnpm lint` retorna 0 warnings
5. **Documentação atualizada** — Docs refletem implementação

---

## Notas de Verificação

### Sprint 4
- Verificar que CorrelationEngine usa correlation-map.ts existente
- Verificar que RecommendationGenerator integra com RAG do mentor
- Verificar que guardrails são aplicados ANTES de retornar recomendações

### Sprint 5
- Verificar que calculateCodeOfDay usa data do usuário (timezone)
- Verificar que buildRitual usa RecommendationGenerator
- Verificar que APIs retornam formato correto

### Sprint 6
- Verificar que intent detection funciona para mensagens em português
- Verificar que práticas sugeridas são seguras (guardrails applied)
- Verificar que histórico de chat é preservado
