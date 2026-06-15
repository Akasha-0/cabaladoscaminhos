# Akasha OS v0.0.15 — Especificação

**Data:** 2026-06-09
**Versão:** akasha-v0.0.15
**Status:** ✅ Completa (verified 2026-06-15: code implemented, see tasks.md for completion status)

---

## 1. Why — Propósito

Completar a entrega do Dashboard do usuário iniciado na v0.0.14. A infraestrutura de dados existe (tipos, service, APIs), mas falta a camada visual que permite ao usuário ver suas estatísticas, streaks e histórico de rituais.

**Visão:** Usuário pode acessar `/dashboard` e visualizar seus dados de prática espiritual de forma polida e animada.

---

## 2. What — Escopo

### 2.1 Componentes UI

| Componente | Descrição |
|------------|-----------|
| `DashboardStats` | Cards com estatísticas (total rituais, streak atual, longest streak, taxa de conclusão) |
| `StreakCalendar` | Calendário visual com dias consecutivos marcados |
| `ProgressChart` | Gráfico de progresso semanal/mensal |
| `RitualHistory` | Lista de rituais completados com data e detalhes |
| `Dashboard` | Container principal que orquestra os componentes |

### 2.2 Arquitetura de Componentes

```
apps/akasha-portal/src/components/akasha/dashboard/
├── index.ts                    # Exports
├── Dashboard.tsx               # Container principal
├── DashboardStats.tsx         # Cards de estatísticas
├── StreakCalendar.tsx         # Calendário de streaks
├── ProgressChart.tsx          # Gráfico de progresso
├── RitualHistory.tsx          # Lista de histórico
└── components/                # Sub-componentes internos
    ├── StatsCard.tsx
    ├── CalendarDay.tsx
    ├── ProgressBar.tsx
    └── HistoryItem.tsx
```

### 2.3 Estados Visuais

| Estado | Implementação |
|--------|----------------|
| Loading | Skeleton placeholders animados |
| Empty | Empty state com mensagem amigável |
| Error | Error state com retry |
| Data | Renderização normal com animações |

### 2.4 Integrações

| Integração | Descrição |
|------------|-----------|
| ThemeProvider | Tema claro/escuro aplicado aos componentes |
| Framer Motion | Animações (fadeInUp, countUp, pulse) |
| API Routes | Dados reais via `/api/akasha/dashboard/*` |

---

## 3. Layout — Scroll Vertical Mobile-First

```
┌─────────────────────────────┐
│       Dashboard Header      │
│    (Título + ThemeToggle)   │
├─────────────────────────────┤
│       DashboardStats        │
│  ┌─────┐ ┌─────┐ ┌─────┐  │
│  │Total│ │Streak│ │Rate │  │
│  └─────┘ └─────┘ └─────┘  │
├─────────────────────────────┤
│       StreakCalendar        │
│  ┌─────────────────────────┐│
│  │  Seg Ter Qua Qui Sex    ││
│  │  ●  ●  ●  ○  ○  ●  ○   ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│       ProgressChart         │
│  ┌─────────────────────────┐│
│  │  ▓▓▓▓░░░░░░░░░░░░░░░   ││
│  │  Semanal: 4/7 dias      ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│       RitualHistory         │
│  ┌─────────────────────────┐│
│  │  Ritual 1 • Hoje        ││
│  │  Ritual 2 • Ontem       ││
│  │  Ritual 3 • 2 dias      ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

---

## 4. Dados — Mock + Fallback Real

### 4.1 Estratégia

```typescript
// Mock data para desenvolvimento/demo
const mockStats: DashboardStats = {
  totalRituals: 42,
  currentStreak: 7,
  longestStreak: 14,
  completionRate: 85,
  lastRitualDate: '2026-06-08',
  weeklyProgress: [1, 1, 1, 1, 1, 1, 1],
};

// Fetch real via API
async function fetchStats(userId: string): Promise<DashboardStats> {
  try {
    const res = await fetch(`/api/akasha/dashboard/stats?userId=${userId}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return mockStats; // Fallback para mock
  }
}
```

### 4.2 APIs Existentes

| Endpoint | Tipo | Status |
|----------|------|--------|
| `GET /api/akasha/dashboard/stats` | → DashboardStats | ✅ Implementado |
| `GET /api/akasha/dashboard/streak` | → StreakDay[] | ✅ Implementado |
| `GET /api/akasha/dashboard/history` | → RitualHistoryItem[] | ✅ Implementado |
| `POST /api/akasha/dashboard/complete` | → void | ✅ Implementado |

---

## 5. Animações — Framer Motion

### 5.1 Animações Existentes (v0.0.14)

```typescript
// apps/akasha-portal/src/components/akasha/animations.tsx
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const useCountUp = (end: number, duration = 2000) => { ... };

export const pulse = {
  scale: [1, 1.05, 1],
  transition: { repeat: Infinity, duration: 2 },
};
```

### 5.2 Aplicação nos Componentes

| Componente | Animação |
|------------|----------|
| Dashboard | Stagger children com fadeInUp |
| DashboardStats | countUp nos números |
| StreakCalendar | pulse no dia atual |
| RitualHistory | fadeInUp por item |

---

## 6. Tema — Light/Dark/System

### 6.1 ThemeProvider Existente

```typescript
// apps/akasha-portal/src/components/akasha/ThemeProvider.tsx
interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
}
```

### 6.2 Aplicação

- Componentes leem `theme` do context
- Tokens CSS via Tailwind (`dark:` prefix)
- Transições suaves entre temas

---

## 7. NÃO está no escopo

- Migração `ritual-storage.ts` → Prisma (v0.0.16)
- Integração ThemeProvider global no layout (v0.0.16)
- Push notifications
- Gamificação avançada (badges, conquistas)

---

## 8. Impact — Impacto Esperado

| Métrica | Antes (v0.0.14) | Depois (v0.0.15) |
|---------|------------------|-------------------|
| Dashboard UI | Não existe | Completo e funcional |
| Visualização de dados | API crua | UI polida |
| Experiência mobile | N/A | Scroll vertical |
| Animações | Componentes prontos | Aplicadas nos componentes |
| Testes | Legado | Unit + integração |

---

## 9. Critérios de Sucesso

- [ ] Rota `/dashboard` funcional
- [ ] DashboardStats exibindo dados corretos
- [ ] StreakCalendar visualizando streaks
- [ ] ProgressChart exibindo progresso
- [ ] RitualHistory listando itens
- [ ] Skeleton loading durante fetch
- [ ] Empty state para novos usuários
- [ ] Error state com retry
- [ ] Tema claro/escuro aplicado
- [ ] Animações Framer Motion funcionando
- [ ] Link para dashboard na home
- [ ] Testes unitários passando
- [ ] Testes de integração passando

---

## 10. Definições

| Termo | Definição |
|-------|-----------|
| **Dashboard** | Painel visual de estatísticas e progresso |
| **Streak** | Dias consecutivos completando rituais |
| **Skeleton** | Placeholder animado durante loading |
| **Empty state** | Mensagem amigável quando não há dados |

---

## 11. Notas Técnicas

### 11.1 Estrutura de Arquivos

```
apps/akasha-portal/src/
├── app/
│   └── dashboard/
│       └── page.tsx           # Nova rota
├── components/akasha/
│   ├── dashboard/             # Pasta nova
│   │   ├── index.ts
│   │   ├── Dashboard.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── StreakCalendar.tsx
│   │   ├── ProgressChart.tsx
│   │   └── RitualHistory.tsx
│   ├── animations.tsx        # Já existe
│   ├── ThemeProvider.tsx     # Já existe
│   └── ThemeToggle.tsx       # Já existe
```

### 11.2 Dependências

| Dependência | Status |
|-------------|--------|
| framer-motion | ✅ v12.40.0 |
| ThemeProvider | ✅ Criado |
| animations.tsx | ✅ Criado |
| Dashboard APIs | ✅ Criadas |
| Dashboard types | ✅ Criados |

### 11.3 Testes

```bash
# Unitários
pnpm vitest run DashboardStats
pnpm vitest run StreakCalendar

# Integração
pnpm vitest run dashboard/integration
```
