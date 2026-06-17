# Akasha OS v0.0.13 — Especificação

**Data:** 2026-06-09
**Versão:** akasha-v0.0.13
**Status:** ✅ Completa (verified 2026-06-15: code implemented, see tasks.md for completion status)

---

## 1. Why — Propósito

Completar a infraestrutura do **Akasha OS** implementando:
1. Motor de correlação híbrida (Regras + RAG)
2. Morning Ritual (UI + scheduling)
3. Chat On-Demand integrado com práticas

**Visão:** Entregar a primeira versão funcional do "Jarvis Espiritual" — mentor diário completo.

---

## 2. What — Escopo

### 2.1 Arquitetura Final

```
┌─────────────────────────────────────────────────────────────┐
│                    AKASHA OS v0.0.13                        │
├─────────────────────────────────────────────────────────────┤
│  ENTRADA                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  Código     │  │  Quizila    │  │  Prática    │      │
│  │  (Hex+Odu)  │  │  (Preceitos)│  │  Request    │      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              MOTOR DE CORRELAÇÃO                      │  │
│  │  ┌───────────────┐     ┌───────────────┐           │  │
│  │  │ GUARDRAILS    │────▶│   RAG         │           │  │
│  │  │ (Regras)      │     │ (Embedding)   │           │  │
│  │  └───────────────┘     └───────────────┘           │  │
│  │           │                   │                      │  │
│  │           └─────────┬─────────┘                      │  │
│  │                     ▼                                 │  │
│  │          ┌─────────────────────┐                     │  │
│  │          │ RECOMMENDATION      │                     │  │
│  │          │ GENERATOR           │                     │  │
│  │          └─────────────────────┘                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                           │                                │
│  SAÍDA                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Morning     │  │ Chat        │  │ Daily       │      │
│  │ Ritual      │  │ On-Demand   │  │ Practice    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Entregas (3 Sprints)

| Sprint | Entrega | Descrição |
|--------|---------|-----------|
| **Sprint 4** | Motor de Correlação | `CorrelationEngine` + `RecommendationGenerator` híbridos |
| **Sprint 5** | Morning Ritual | UI de ritual diário + scheduling |
| **Sprint 6** | Chat On-Demand | Mentor integrado com práticas |

---

## 3. Sprint 4: Motor de Correlação

### 3.1 CorrelationEngine

```typescript
interface CorrelationEngine {
  // Input
  userCode: AkashaCode;        // Hex + Odu + Level
  lifeArea?: LifeArea;          // Área de vida foco
  context?: string;            // Contexto adicional

  // Process
  findCorrelations(): CrossTraditionCorrelation[];
  scorePractices(practices: IntegrativePractice[]): ScoredPractice[];

  // Output
  recommend(count: number): PracticeRecommendation[];
}

interface ScoredPractice {
  practice: IntegrativePractice;
  score: number;                // 0-100
  reason: string;              // Por que esta prática
  correlation: string;         // Correlação com código
}
```

### 3.2 RecommendationGenerator

```typescript
interface RecommendationGenerator {
  // Híbrido: Regras + RAG
  generateFromRules(context: RecommendationContext): PracticeRecommendation[];
  generateFromRAG(query: string, limit: number): PracticeRecommendation[];

  // Combinação
  generateHybrid(context: RecommendationContext, limit: number): PracticeRecommendation[];
}

interface PracticeRecommendation {
  practice: IntegrativePractice;
  confidence: number;          // 0-1
  source: 'rules' | 'rag' | 'hybrid';
  personalizedReason: string;   // Explicação para o usuário
}
```

### 3.3 Guardrails no Motor

- Validar práticas antes de recomendar
- Filtrar práticas inseguras automaticamente
- Exibir warnings quando necessário

---

## 4. Sprint 5: Morning Ritual UI

### 4.1 Componente RitualDiario

```typescript
interface RitualDiario {
  horario: string;             // HH:MM configurável
  ativo: boolean;
  componentes: {
    codigoDoDia: boolean;
    praticaPrincipal: boolean;
    quizilas: boolean;
    afirmacao: boolean;
  };
}

interface RitualResponse {
  data: Date;
  codigo: {
    hexagrama: HexagramWithWings;
    odu?: Odu;
    nivel: 'shadow' | 'gift' | 'siddhi';
  };
  pratica: IntegrativePractice;
  quizilas: Quizila[];
  afirmacao: string;
  oracao: string;
}
```

### 4.2 Fluxo

1. Usuário configura ritual (horário, componentes)
2. Sistema calcula Código do dia baseado na data
3. Motor de correlação seleciona prática principal
4. Ritual completo é entregue

### 4.3 API

```
GET  /api/akasha/ritual          → RitualResponse
POST /api/akasha/ritual/config   → RitualDiario (salvar config)
GET  /api/akasha/ritual/today    → RitualResponse (hoje)
```

---

## 5. Sprint 6: Chat On-Demand

### 5.1 MentorExpandido

```typescript
interface ChatRequest {
  message: string;
  userCode?: AkashaCode;
  conversationHistory?: ChatMessage[];
  intent?: 'practice' | 'guidance' | 'ritual' | 'general';
}

interface ChatResponse {
  message: string;             // Resposta do mentor
  suggestedPractices?: IntegrativePractice[];  // Práticas relacionadas
  ritual?: RitualResponse;     // Ritual sugerido
  relevantQuizilas?: Quizila[];
}
```

### 5.2 Integração com Motor

- Detectar intent automaticamente
- Incluir práticas recomendadas quando intent='practice'
- Contextualizar com Código do usuário

### 5.3 API

```
POST /api/akasha/chat            → ChatResponse
POST /api/akasha/chat/practice  → Prática recomendada
POST /api/akasha/chat/ritual    → Ritual sugerido
```

---

## 6. NÃO está no escopo

- Diagnóstico médico
- Previsão de morte/acidentes
- Manipulação de terceiros
- Pactos com entidades
- Ritual de trabalho sexual
- Push notifications (futuro)
- Gamificação

---

## 7. Impact — Impacto Esperado

| Métrica | Antes | Depois |
|---------|-------|--------|
| Recomendações | Estáticas | Dinâmicas (RAG) |
| Ritual | Nenhum | Daily funcional |
| Chat | Menthor (texto) | Mentor + Práticas |
| Entrega | Parcial | v1.0 funcional |

---

## 8. Modelo de Dados

### 8.1 AkashaCode (já existe em v0.0.12)

```typescript
interface AkashaCode {
  hexagram: number;            // 1-64
  odu?: string;                // Ifá Odu
  level: 'shadow' | 'gift' | 'siddhi';
  lifeArea: LifeArea;
}
```

### 8.2 PracticeRecommendation

```typescript
interface PracticeRecommendation {
  practice: IntegrativePractice;
  confidence: number;          // 0.0 - 1.0
  source: 'rules' | 'rag' | 'hybrid';
  reason: string;
  correlations: string[];      // Ex: ["Hexagrama 5 → Oxum", "Vênus → Quartzo Rosa"]
}
```

### 8.3 RitualDiario

```typescript
interface RitualConfig {
  userId: string;
  horario: string;             // "07:00"
  timezone: string;             // "America/Sao_Paulo"
  componentes: {
    codigo: boolean;
    pratica: boolean;
    quizilas: boolean;
    afirmacao: boolean;
    oracao: boolean;
  };
  ativo: boolean;
}
```

---

## 9. Dependências

| Componente | Status |
|------------|--------|
| `packages/core-iching` | ✅ Existente (wings + practices) |
| `packages/akasha-core` | ✅ Existente (correlation-map + guardrails) |
| `packages/mentor` | ✅ Existente (precisa expansão) |
| RAG embeddings | ⚠️ Parcial (precisa integrar) |
| Storage (Redis/DB) | ⚠️ Configurar |

---

## 10. Roadmap de Implementação

| Fase | Sprint | Entrega | Status |
|------|--------|---------|--------|
| 1 | Sprint 4 | CorrelationEngine + RecommendationGenerator | **Este spec** |
| 1 | Sprint 5 | Morning Ritual (UI) | **Este spec** |
| 1 | Sprint 6 | Chat On-Demand | **Este spec** |
| 2 | Sprint 7 | Push Notifications | Future |
| 2 | Sprint 8 | User Dashboard | Future |

---

## 11. Critérios de Sucesso

- [ ] `CorrelationEngine` implementado e testado
- [ ] `RecommendationGenerator` híbrido funcionando
- [ ] API `/api/akasha/ritual` retornando dados corretos
- [ ] API `/api/akasha/chat` integrada com motor
- [ ] Guardrails aplicados em todas as recomendações
- [ ] Testes passando (`pnpm test:run`)
- [ ] Typecheck limpo (`pnpm typecheck`)
- [ ] Lint passando (`pnpm lint`)

---

## 12. Definições

| Termo | Definição |
|-------|-----------|
| **CorrelationEngine** | Motor que encontra correlações entre código e práticas |
| **RecommendationGenerator** | Gera recomendações personalizadas (híbrido Regras + RAG) |
| **RitualDiario** | Rotina spiritual configurável para o usuário |
| **ChatOn-Demand** | Consulta interativa com mentor espiritual |
| **AkashaCode** | Raiz espiritual do usuário (Hex + Odu + Level) |

---

## 13. Notas Técnicas

### 13.1 RAG Strategy
- Usar embeddings existentes do `packages/mentor`
- Indexar práticas integrativas
- Buscar por similaridade semântica

### 13.2 Scoring Algorithm
```typescript
score = (
  correlationWeight * correlationScore +
  safetyWeight * safetyScore +
  relevanceWeight * relevanceScore +
  recencyWeight * recencyScore
) / totalWeight
```

### 13.3 Guardrails Integration
- Sempre chamar `validatePractice()` antes de recomendar
- Filtrar práticas com `isValid: false`
- Exibir warnings ao usuário quando aplicável
