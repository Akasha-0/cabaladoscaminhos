# Akasha OS v0.0.14 — Checklist de Verificação

## Sprint 7: RAG Real

### 7.1 Configuração e Tipos
- [ ] `packages/mentor/src/rag/index.ts` criado com tipos `RAGConfig` e `RAGService`
- [ ] Tipo `RAGProvider` definido como `'openai' | 'cohere'`
- [ ] Tipo `PracticeEmbedding` definido
- [ ] Tipo `SimilarPractice` definido

### 7.2 OpenAI Embedder
- [ ] `packages/mentor/src/rag/openai-embedder.ts` criado
- [ ] Função `embedOpenAI(text)` retorna `Promise<number[]>`
- [ ] Função `findSimilarOpenAI(query, limit)` retorna práticas similares
- [ ] Testes unitários passando

### 7.3 Cohere Embedder
- [ ] `packages/mentor/src/rag/cohere-embedder.ts` criado
- [ ] Função `embedCohere(text)` retorna `Promise<number[]>`
- [ ] Função `findSimilarCohere(query, limit)` retorna práticas similares
- [ ] Testes unitários passando

### 7.4 RAG Service
- [ ] `packages/mentor/src/rag/rag-service.ts` criado
- [ ] Factory pattern implementado
- [ ] Cache de embeddings funcionando
- [ ] Integração com `RecommendationGenerator` completa

### 7.5 API Routes
- [ ] `GET /api/akasha/rag/search?q=&limit=` retornando `SimilarPractice[]`
- [ ] `POST /api/akasha/rag/index` indexando práticas
- [ ] Testes de integração passando

### 7.6 Migração
- [ ] `simulateEmbedding()` substituído por implementação real
- [ ] Placeholder RAG removido do mentor
- [ ] Exports atualizados em `packages/mentor/src/index.ts`

---

## Sprint 8: Dashboard do Usuário

### 8.1 Prisma Setup
- [ ] Dependências `prisma` e `@prisma/client` instaladas
- [ ] Schema `prisma/schema.prisma` com modelos `UserRitual` e `DashboardStats`
- [ ] `pnpm prisma generate` executado com sucesso
- [ ] `packages/akasha-core/src/db.ts` com singleton funcionando

### 8.2 Tipos
- [ ] `DashboardStats` exportado e completo
- [ ] `StreakDay` exportado e completo
- [ ] `RitualHistoryItem` exportado e completo

### 8.3 Dashboard Service
- [ ] `packages/akasha-core/src/dashboard-service.ts` criado
- [ ] `getStats(userId)` retornando estatísticas corretas
- [ ] `getStreak(userId)` retornando dias de streak
- [ ] `getHistory(userId, limit?)` retornando histórico
- [ ] `saveRitualCompletion(userId, ritualData)` persistindo dados
- [ ] `calculateStreak(rituals)` calculando streak corretamente
- [ ] Testes unitários passando

### 8.4 API Routes
- [ ] `GET /api/akasha/dashboard/stats` retornando `DashboardStats`
- [ ] `GET /api/akasha/dashboard/streak` retornando `StreakDay[]`
- [ ] `GET /api/akasha/dashboard/history` retornando `RitualHistoryItem[]`
- [ ] `POST /api/akasha/dashboard/complete` salvando ritual
- [ ] Testes de integração passando

### 8.5 UI Components
- [ ] `DashboardStats` renderizando números animados
- [ ] `StreakCalendar` mostrando calendário visual
- [ ] `ProgressChart` exibindo gráfico semanal/mensal
- [ ] `RitualHistory` listando rituais passados
- [ ] `Dashboard` container integrando todos componentes
- [ ] Tema claro/escuro aplicado

### 8.6 Migração de Storage
- [ ] `ritual-storage.ts` migrado para Prisma
- [ ] Dados existentes preservados
- [ ] Imports atualizados nos componentes

---

## Sprint 9: UX Refinement

### 9.1 Animações
- [ ] Framer Motion instalado
- [ ] Animação `fade-in` + `slide-up` no `RitualCard`
- [ ] Count-up animation no `DashboardStats`
- [ ] Pulse animation no dia atual do `StreakCalendar`
- [ ] Transições suaves entre páginas

### 9.2 Tema Claro/Escuro
- [ ] `ThemeProvider` criado e funcionando
- [ ] Toggle light/dark/system implementado
- [ ] Preferência persistida no localStorage
- [ ] `ThemeToggle` visível e funcional
- [ ] Tema aplicado em todos componentes

### 9.3 Onboarding
- [ ] Fluxo de 4 passos completo
- [ ] `WelcomeStep` com apresentação
- [ ] `RitualConfigStep` com configuração inicial
- [ ] `DashboardTourStep` com tutorial
- [ ] `FirstPracticeStep` com primeira prática
- [ ] Detecção de novo usuário funcionando
- [ ] Exibição única (não repete)

### 9.4 Polimento
- [ ] Espaçamento consistente
- [ ] Tipografia legível
- [ ] Feedback visual em interações
- [ ] Loading states implementados
- [ ] Erros tratados com mensagens amigáveis

---

## Quality Gates

### Testes
- [ ] `pnpm test:run` passando (0 falhas)
- [ ] Coverage total > 80%

### Typecheck
- [ ] `pnpm typecheck` limpo (0 erros)

### Lint
- [ ] `pnpm lint` passando (0 erros, warnings aceitáveis)

---

## Entregáveis Finais

### Código
- [ ] Todos os arquivos criados conforme tasks.md
- [ ] Sem código comentado ou placeholders
- [ ] Imports organizados
- [ ] Nomenclatura consistente

### Documentação
- [ ] Tipos documentados
- [ ] READMEs atualizados
- [ ] CHANGELOG registrado

### Configuração
- [ ] `.env.example` atualizado com variáveis RAG
- [ ] Variáveis de ambiente documentadas
