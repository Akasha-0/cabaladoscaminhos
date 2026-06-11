# Akasha OS v0.0.12 — Tarefas

## Sprint 1: Expansão core-iching

### 1.1 Adicionar 10 Asas (Wenyan/Comentários)

- [ ] Criar arquivo `wings.ts` com dados das 10 Asas
- [ ] Adicionar tipo `Wing` em `types.ts`
- [ ] Criar função `getHexagramWithWings(number): HexagramWithWings`
- [ ] Adicionar testes unitários

### 1.2 Adicionar Práticas Integrativas

- [ ] Criar arquivo `practices.ts` com estrutura de práticas
- [ ] Adicionar tipo `IntegrativePractice`
- [ ] Criar primeiro batch de 20 práticas (ewé, cristais)
- [ ] Adicionar função `getPracticesByElement(element)`
- [ ] Adicionar função `getPracticesByTradition(tradition)`

### 1.3 Expandir correlações existentes

- [ ] Adicionar campo `wings` em `Hexagram`
- [ ] Adicionar campo `integrativePractices` em `Hexagram`

---

## Sprint 2: Mapa de Correlações

### 2.1 Criar Correlation Map

- [ ] Criar arquivo `packages/akasha-core/src/correlation-map.ts`
- [ ] Definir tipo `CrossTraditionCorrelation`
- [ ] Mapear Ifá (16 Odús) ↔ Hexagramas (64)
- [ ] Mapear Sefirot (10) ↔ Trigramas (8)
- [ ] Mapear Odús ↔ Sefirot (já existe parcialmente em `odu-correlations.ts`)

### 2.2 Validar correlações

- [ ] Criar testes de validação de consistência
- [ ] Documentar fontes de cada correlação
- [ ] Criar função `findCorrelations(archetype)` → lista de correlações

### 2.3 Integrar com sistemas existentes

- [ ] Exportar correlações de `core-cabala`
- [ ] Exportar correlações de `core-iching`
- [ ] Criar `core-correlation` package se necessário

---

## Sprint 3: Catálogo de Práticas

### 3.1 Estrutura de Dados

- [ ] Definir tipo `Practice` completo
- [ ] Criar enum `PracticeCategory`
- [ ] Definir guardrails como constantes

### 3.2 Primeiras 50 Práticas

- [ ] 15 práticas de Ifá/Candomblé (ewé)
- [ ] 10 práticas de cristais
- [ ] 10 práticas de aromaterapia/óleos
- [ ] 10 práticas de cromoterapia
- [ ] 5 práticas de defumação

### 3.3 Guardrails

- [ ] Implementar função `isSafePractice(practice): boolean`
- [ ] Implementar função `validatePractice(practice, userCode): ValidationResult`
- [ ] Criar testes de guardrails

---

## Sprint 4: Motor de Correlação (Future)

- [ ] Implementar `CorrelationEngine`
- [ ] Implementar `RecommendationGenerator`
- [ ] Integrar com RAG existente
- [ ] Adicionar endpoints de API

---

## Sprint 5: Morning Ritual UI (Future)

- [ ] Criar componente `MorningRitual`
- [ ] Implementar scheduling
- [ ] Integrar com notificações

---

## Sprint 6: Chat On-Demand (Future)

- [ ] Expandir Mentor existente
- [ ] Integrar com motor de correlação
- [ ] Adicionar contexto de práticas

---

## Tarefas de Infraestrutura

### Documentação

- [ ] Atualizar `docs/04_data-model.md`
- [ ] Criar seção de correlações
- [ ] Documentar guardrails

### Testes

- [ ] Adicionar testes em `tests/integration/iching/`
- [ ] Adicionar testes em `tests/integration/correlation/`
- [ ] Testar guardrails

### CI/CD

- [ ] Adicionar script `pnpm test:akasha-os`
- [ ] Adicionar lint rules específicas
