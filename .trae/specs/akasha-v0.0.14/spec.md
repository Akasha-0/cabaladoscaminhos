# Akasha OS v0.0.14 — Especificação

**Data:** 2026-06-09
**Versão:** akasha-v0.0.14
**Status:** ✅ Completa (verified 2026-06-15: code implemented, see tasks.md for completion status)

---

## 1. Why — Propósito

Aprofundar a integração RAG real, implementar o Dashboard do usuário e refinar a UX do sistema. A versão v0.0.13 entregou a infraestrutura básica; esta versão fortalece as fundações com:

1. **RAG Real** — Substituir simulação por embeddings verdadeiros (OpenAI/Cohere)
2. **Dashboard do Usuário** — Estatísticas, streaks e histórico de rituais
3. **UX Refinamento** — Animações, tema claro/escuro, onboarding

**Visão:** Sistema pronto para testes com usuários reais — dados persistidos, métricas visíveis, experiência polida.

---

## 2. What — Escopo

### 2.1 Arquitetura Atualizada

```
┌─────────────────────────────────────────────────────────────────────┐
│                      AKASHA OS v0.0.14                              │
├─────────────────────────────────────────────────────────────────────┤
│  ENTRADA                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Código       │  │ Quizila      │  │ Prática      │             │
│  │ (Hex+Odu)    │  │ (Preceitos)  │  │ Request      │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         └─────────────────┼─────────────────┘                       │
│                            ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │               MOTOR DE CORRELAÇÃO                            │   │
│  │  ┌────────────────┐     ┌────────────────┐                 │   │
│  │  │ GUARDRAILS    │────▶│ RAG REAL       │                 │   │
│  │  │ (Regras)      │     │ (OpenAI/Cohere)│                 │   │
│  │  └────────────────┘     └────────────────┘                 │   │
│  │           │                    │                            │   │
│  │           └────────┬───────────┘                            │   │
│  │                    ▼                                        │   │
│  │         ┌──────────────────────┐                           │   │
│  │         │ RECOMMENDATION      │                           │   │
│  │         │ GENERATOR           │                           │   │
│  │         └──────────────────────┘                           │   │
│  └────────────────────────────────────────────────────────────┘   │
│                            │                                        │
│  SAÍDA                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Morning     │  │ Chat         │  │ Dashboard    │             │
│  │ Ritual      │  │ On-Demand    │  │ User         │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Entregas (3 Sprints)

| Sprint | Entrega | Descrição |
|--------|---------|-----------|
| **Sprint 7** | RAG Real | Integração OpenAI/Cohere embeddings |
| **Sprint 8** | Dashboard | Stats, streaks, histórico |
| **Sprint 9** | UX Refinement | Animações, tema, onboarding |

---

## 3. Sprint 7: Integração RAG Real

### 3.1 Módulo RAG

**Arquivo:** `packages/mentor/src/rag/index.ts`

```typescript
interface RAGConfig {
  provider: 'openai' | 'cohere';
  apiKey: string;
  indexName: string;
}

interface RAGService {
  initialize(config: RAGConfig): Promise<void>;
  embed(text: string): Promise<number[]>;
  findSimilar(
    query: string,
    limit: number,
    filters?: PracticeFilters
  ): Promise<SimilarPractice[]>;
  indexPractice(practice: IntegrativePractice): Promise<void>;
}
```

### 3.2 Embedding de Práticas

- Indexar todas as `IntegrativePractice` existentes
- Gerar embedding para título + descrição + tags
- Armazenar no índice vetorial

### 3.3 Busca Semântica Real

```typescript
async function findSimilarPractices(
  query: string,
  limit: number,
  filters?: PracticeFilters
): Promise<SimilarPractice[]> {
  // 1. Gerar embedding da query
  const queryEmbedding = await embed(query);
  // 2. Buscar no índice vetorial (cosine similarity)
  const results = await vectorIndex.search(queryEmbedding, limit);
  // 3. Filtrar por safety e categoria
  return applyFilters(results, filters);
}
```

### 3.4 API

```
GET  /api/akasha/rag/search?q=&limit=  → SimilarPractice[]
POST /api/akasha/rag/index             → StatusResponse
```

---

## 4. Sprint 8: Dashboard do Usuário

### 4.1 Componentes

| Componente | Descrição |
|------------|-----------|
| `DashboardStats` | Estatísticas gerais (rituais completados, streak atual) |
| `StreakCalendar` | Calendário visual com dias de streak |
| `ProgressChart` | Gráfico de progresso semanal/mensal |
| `RitualHistory` | Lista de rituais completados |

### 4.2 Tipos

```typescript
interface DashboardStats {
  totalRituals: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;        // percentual
  lastRitualDate: string | null;
  weeklyProgress: number[];     // 7 dias
}

interface StreakDay {
  date: string;
  completed: boolean;
  ritualType?: string;
}

interface RitualHistoryItem {
  id: string;
  date: string;
  ritual: RitualResponse;
  completedAt: string;
}
```

### 4.3 API

```
GET  /api/akasha/dashboard/stats     → DashboardStats
GET  /api/akasha/dashboard/streak    → StreakDay[]
GET  /api/akasha/dashboard/history   → RitualHistoryItem[]
```

### 4.4 Persistência

**Migração:** De storage in-memory para persistência real.

| Solução | Status | Prioridade |
|---------|--------|------------|
| Prisma + SQLite (local) | **Recomendado** | Alta |
| Supabase | Futuro | Média |

---

## 5. Sprint 9: UX Refinement

### 5.1 Animações

| Componente | Animação |
|------------|----------|
| `RitualCard` | Fade-in + slide-up na transição |
| `DashboardStats` | Count-up animation nos números |
| `StreakCalendar` | Pulse no dia atual |

### 5.2 Tema Claro/Escuro

```typescript
interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  accentColor?: string;          // Cor de destaque
}

// Persistir no localStorage
// Detectar preferência do sistema
```

### 5.3 Onboarding

Fluxo para novos usuários:

1. Boas-vindas + apresentação do sistema
2. Configuração inicial de ritual (opcional)
3. Tutorial rápido do Dashboard
4. Primeira prática sugerida

---

## 6. NÃO está no escopo

- Push Notifications (Sprint 10)
- Gamificação avançada (badges, conquistas)
- Diagnóstico médico
- Previsão de morte/acidentes
- Manipulação de terceiros

---

## 7. Impact — Impacto Esperado

| Métrica | Antes (v0.0.13) | Depois (v0.0.14) |
|---------|-----------------|------------------|
| RAG | Simulado | Real (embeddings) |
| Dashboard | Nenhum | Funcional |
| Persistência | In-memory | Prisma/SQLite |
| UX | Básico | Polido + tema |
| Testes com usuários | Não | Sim |

---

## 8. Modelo de Dados

### 8.1 DashboardStats (NOVO)

```typescript
interface DashboardStats {
  userId: string;
  totalRituals: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  lastRitualDate: string | null;
  weeklyProgress: number[];       // [seg, ter, qua, qui, sex, sáb, dom]
  monthlyProgress: number[];      // 30 dias
}
```

### 8.2 RitualHistory (NOVO)

```typescript
interface RitualHistory {
  id: string;
  userId: string;
  date: string;
  ritualData: RitualResponse;
  completedAt: string;
  duration?: number;              // segundos
}
```

### 8.3 Prisma Schema (NOVO)

```prisma
model UserRitual {
  id          String   @id @default(uuid())
  userId      String
  date        DateTime
  ritualData  Json
  completedAt DateTime @default(now())
  duration    Int?
}
```

---

## 9. Dependências

| Componente | Status |
|------------|--------|
| `packages/akasha-core` | ✅ Existente |
| `packages/mentor` | ✅ Existente (precisa RAG) |
| OpenAI/Cohere API | ⚠️ Configurar |
| Prisma | ⚠️ Instalar |
| TailwindCSS | ✅ Existente |

---

## 10. Roadmap de Implementação

| Fase | Sprint | Entrega | Status |
|------|--------|---------|--------|
| 2 | Sprint 7 | RAG Real | **Este spec** |
| 2 | Sprint 8 | User Dashboard | **Este spec** |
| 2 | Sprint 9 | UX Refinement | **Este spec** |
| 3 | Sprint 10 | Push Notifications | Future |
| 3 | Sprint 11 | Multi-idioma | Future |

---

## 11. Critérios de Sucesso

- [ ] RAG Real integrado com OpenAI/Cohere
- [ ] DashboardStats exibindo dados corretos
- [ ] StreakCalendar visualizando streaks
- [ ] Persistência via Prisma/SQLite funcionando
- [ ] Tema claro/escuro alternando corretamente
- [ ] Onboarding funcional para novos usuários
- [ ] Testes passando (`pnpm test:run`)
- [ ] Typecheck limpo (`pnpm typecheck`)
- [ ] Lint passando (`pnpm lint`)

---

## 12. Definições

| Termo | Definição |
|-------|-----------|
| **RAG Real** | Retrieval-Augmented Generation com embeddings verdadeiros |
| **Dashboard** | Painel de estatísticas e progresso do usuário |
| **Streak** | Sequência de dias consecutivos completando rituais |
| **Onboarding** | Fluxo de boas-vindas para novos usuários |

---

## 13. Notas Técnicas

### 13.1 Configuração RAG

```typescript
// .env
RAG_PROVIDER=openai
OPENAI_API_KEY=sk-...
COHERE_API_KEY=...
RAG_INDEX_NAME=practices_v1
```

### 13.2 Embedding Strategy

- Usar `text-embedding-3-small` da OpenAI (barato e rápido)
- Fallback para `embed-multilingual-v3.0` da Cohere
- Cache de embeddings no banco

### 13.3 Prisma Setup

```bash
# Inicializar Prisma
pnpm prisma init --datasource-provider sqlite

# Migrar schema
pnpm prisma migrate dev --name add_user_rituals
```
