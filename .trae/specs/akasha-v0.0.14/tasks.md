# Akasha OS v0.0.14 — Tarefas

## Sprint 7: RAG Real

### 7.1 Configuração e Tipos

- [ ] Criar `packages/mentor/src/rag/index.ts` com tipos RAGConfig e RAGService
- [ ] Definir tipo `RAGProvider` (`'openai' | 'cohere'`)
- [ ] Definir tipo `PracticeEmbedding`
- [ ] Definir tipo `SimilarPractice`

### 7.2 Implementação OpenAI

- [ ] Criar `packages/mentor/src/rag/openai-embedder.ts`
- [ ] Implementar `embedOpenAI(text: string): Promise<number[]>`
- [ ] Implementar `findSimilarOpenAI(query: string, limit: number): Promise<SimilarPractice[]>`
- [ ] Criar testes unitários

### 7.3 Implementação Cohere (Fallback)

- [ ] Criar `packages/mentor/src/rag/cohere-embedder.ts`
- [ ] Implementar `embedCohere(text: string): Promise<number[]>`
- [ ] Implementar `findSimilarCohere(query: string, limit: number): Promise<SimilarPractice[]>`
- [ ] Criar testes unitários

### 7.4 RAG Service Principal

- [ ] Criar `packages/mentor/src/rag/rag-service.ts`
- [ ] Implementar factory pattern para selecionar provider
- [ ] Implementar cache de embeddings (in-memory simples)
- [ ] Integrar com RecommendationGenerator existente

### 7.5 API Routes

- [ ] Criar `apps/akasha-portal/src/app/api/akasha/rag/search/route.ts`
- [ ] Implementar `GET /api/akasha/rag/search?q=&limit=`
- [ ] Criar `apps/akasha-portal/src/app/api/akasha/rag/index/route.ts`
- [ ] Implementar `POST /api/akasha/rag/index` para indexar práticas
- [ ] Criar testes de integração

### 7.6 Migração do Simulado

- [ ] Substituir `simulateEmbedding()` em `recommendation-generator.ts`
- [ ] Remover placeholder RAG do mentor
- [ ] Atualizar exports em `packages/mentor/src/index.ts`

---

## Sprint 8: Dashboard do Usuário

### 8.1 Prisma Setup

- [ ] Instalar Prisma: `pnpm add prisma @prisma/client`
- [ ] Criar `prisma/schema.prisma` com modelo UserRitual
- [ ] Criar `prisma/schema.prisma` com modelo DashboardStats
- [ ] Executar `pnpm prisma generate`
- [ ] Criar `packages/akasha-core/src/db.ts` com PrismaClient singleton

### 8.2 Tipos de Dashboard

- [ ] Definir `DashboardStats` em `packages/akasha-core/src/dashboard-types.ts`
- [ ] Definir `StreakDay`
- [ ] Definir `RitualHistoryItem`

### 8.3 Dashboard Service

- [ ] Criar `packages/akasha-core/src/dashboard-service.ts`
- [ ] Implementar `getStats(userId: string): Promise<DashboardStats>`
- [ ] Implementar `getStreak(userId: string): Promise<StreakDay[]>`
- [ ] Implementar `getHistory(userId: string, limit?: number): Promise<RitualHistoryItem[]>`
- [ ] Implementar `saveRitualCompletion(userId, ritualData): Promise<void>`
- [ ] Implementar `calculateStreak(rituals): number`
- [ ] Criar testes unitários

### 8.4 API Routes

- [ ] Criar `apps/akasha-portal/src/app/api/akasha/dashboard/stats/route.ts`
- [ ] Criar `apps/akasha-portal/src/app/api/akasha/dashboard/streak/route.ts`
- [ ] Criar `apps/akasha-portal/src/app/api/akasha/dashboard/history/route.ts`
- [ ] Criar `apps/akasha-portal/src/app/api/akasha/dashboard/complete/route.ts` (POST)
- [ ] Criar testes de integração

### 8.5 UI Components

- [ ] Criar `apps/akasha-portal/src/components/akasha/DashboardStats.tsx`
- [ ] Criar `apps/akasha-portal/src/components/akasha/StreakCalendar.tsx`
- [ ] Criar `apps/akasha-portal/src/components/akasha/ProgressChart.tsx`
- [ ] Criar `apps/akasha-portal/src/components/akasha/RitualHistory.tsx`
- [ ] Criar `apps/akasha-portal/src/components/akasha/Dashboard.tsx` (container)
- [ ] Integrar com tema claro/escuro

### 8.6 Migração de Storage

- [ ] Migrar `ritual-storage.ts` de in-memory para Prisma
- [ ] Preservar dados existentes (se houver)
- [ ] Atualizar imports nos componentes existentes

---

## Sprint 9: UX Refinement

### 9.1 Animações

- [ ] Adicionar Framer Motion: `pnpm add framer-motion`
- [ ] Implementar animação fade-in + slide-up no `RitualCard`
- [ ] Implementar count-up animation no `DashboardStats`
- [ ] Implementar pulse animation no `StreakCalendar` (dia atual)
- [ ] Adicionar transição suave entre páginas

### 9.2 Tema Claro/Escuro

- [ ] Criar `apps/akasha-portal/src/components/akasha/ThemeProvider.tsx`
- [ ] Implementar toggle light/dark/system
- [ ] Persistir preferência no localStorage
- [ ] Aplicar tema nos componentes existentes
- [ ] Criar componente `ThemeToggle`

### 9.3 Onboarding

- [ ] Criar `apps/akasha-portal/src/components/akasha/Onboarding.tsx`
- [ ] Implementar fluxo de 4 passos
- [ ] Criar `WelcomeStep` — apresentação
- [ ] Criar `RitualConfigStep` — configuração inicial
- [ ] Criar `DashboardTourStep` — tutorial rápido
- [ ] Criar `FirstPracticeStep` — primeira prática
- [ ] Detectar novo usuário via localStorage
- [ ] Mostrar onboarding apenas uma vez

### 9.4 Polimento Geral

- [ ] Ajustar espaçamento e tipografia
- [ ] Melhorar feedback visual em interações
- [ ] Adicionar loading states elegantes
- [ ] Tratar erros com mensagens amigáveis

---

## Tarefas de Infraestrutura

### 10.1 Configuração

- [ ] Adicionar variáveis de ambiente `.env.example`:
  - `RAG_PROVIDER=openai`
  - `OPENAI_API_KEY=`
  - `COHERE_API_KEY=`
  - `DATABASE_URL=file:./dev.db`

### 10.2 Testes

- [ ] Adicionar testes para RAG service
- [ ] Adicionar testes para dashboard service
- [ ] Adicionar testes de integração para APIs
- [ ] Verificar coverage > 80%

### 10.3 Quality Gates

- [ ] Garantir `pnpm test:run` passando
- [ ] Garantir `pnpm typecheck` limpo
- [ ] Garantir `pnpm lint` passando

### 10.4 Documentação

- [ ] Atualizar `docs/` com novos tipos
- [ ] Documentar APIs no README do package
- [ ] Atualizar CHANGELOG

---

## Dependências Entre Tarefas

```
Sprint 7 (RAG Real)
  └─ Sprint 8 (Dashboard) depende de: Prisma setup
  └─ Sprint 8 (Dashboard) pode usar: RAG para enriquecimento
  └─ Sprint 9 (UX) independente

Sprint 8 (Dashboard)
  └─ Sprint 9 (UX) integra com: Dashboard components
```

---

## Prioridade de Execução

1. **Sprint 7** (RAG Real) — SEMPRE primeiro
2. **Sprint 8** (Dashboard) — depende de Sprint 7 para Prisma
3. **Sprint 9** (UX) — independente, pode paralelizar
