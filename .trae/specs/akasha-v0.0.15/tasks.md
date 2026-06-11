# Akasha OS v0.0.15 — Tarefas

## Sprint 1: Estrutura Base

### 1.1 Setup de Pasta e Exports

- [ ] Criar `apps/akasha-portal/src/components/akasha/dashboard/index.ts`
- [ ] Exportar todos os componentes do dashboard
- [ ] Verificar imports existentes

### 1.2 Mock Data

- [ ] Criar `apps/akasha-portal/src/components/akasha/dashboard/mocks.ts`
- [ ] Definir `mockStats: DashboardStats`
- [ ] Definir `mockStreak: StreakDay[]`
- [ ] Definir `mockHistory: RitualHistoryItem[]`

### 1.3 Hook de Dados

- [ ] Criar `apps/akasha-portal/src/components/akasha/dashboard/hooks/useDashboardData.ts`
- [ ] Implementar fetch com fallback para mock
- [ ] Implementar estados de loading/error
- [ ] Adicionar tipagem correta

---

## Sprint 2: DashboardStats

### 2.1 StatsCard Sub-componente

- [ ] Criar `apps/akasha-portal/src/components/akasha/dashboard/components/StatsCard.tsx`
- [ ] Props: title, value, subtitle, icon
- [ ] Estilos consistentes com tema
- [ ] Animação countUp no value

### 2.2 DashboardStats Componente

- [ ] Criar `apps/akasha-portal/src/components/akasha/dashboard/DashboardStats.tsx`
- [ ] Layout grid responsivo (1 col mobile, 3 cols desktop)
- [ ] Renderizar 4 StatsCards: Total, Streak, Longest, Rate
- [ ] Integração com useDashboardData
- [ ] Skeleton loading state
- [ ] Empty state
- [ ] Animação fadeInUp

---

## Sprint 3: StreakCalendar

### 3.1 CalendarDay Sub-componente

- [ ] Criar `apps/akasha-portal/src/components/akasha/dashboard/components/CalendarDay.tsx`
- [ ] Props: date, completed, isToday, ritualType
- [ ] Estilos: completed vs non-completed
- [ ] Pulse animation no dia atual

### 3.2 StreakCalendar Componente

- [ ] Criar `apps/akasha-portal/src/components/akasha/dashboard/StreakCalendar.tsx`
- [ ] Layout de semana atual + navegação
- [ ] Renderizar 7 CalendarDays
- [ ] Header com nome dos dias
- [ ] Integração com useDashboardData
- [ ] Skeleton loading state
- [ ] Animação fadeInUp

---

## Sprint 4: ProgressChart

### 4.1 ProgressBar Sub-componente

- [ ] Criar `apps/akasha-portal/src/components/akasha/dashboard/components/ProgressBar.tsx`
- [ ] Props: value, max, label
- [ ] Animação de preenchimento
- [ ] Estilos com gradiente

### 4.2 ProgressChart Componente

- [ ] Criar `apps/akasha-portal/src/components/akasha/dashboard/ProgressChart.tsx`
- [ ] Seção semanal (7 dias)
- [ ] Seção mensal (30 dias)
- [ ] ProgressBars para cada seção
- [ ] Cálculo de percentual
- [ ] Integração com useDashboardData
- [ ] Skeleton loading state
- [ ] Animação fadeInUp

---

## Sprint 5: RitualHistory

### 5.1 HistoryItem Sub-componente

- [ ] Criar `apps/akasha-portal/src/components/akasha/dashboard/components/HistoryItem.tsx`
- [ ] Props: item (RitualHistoryItem)
- [ ] Layout: título, data, badge de status
- [ ] Link para detalhes (futuro)

### 5.2 RitualHistory Componente

- [ ] Criar `apps/akasha-portal/src/components/akasha/dashboard/RitualHistory.tsx`
- [ ] Lista de HistoryItems
- [ ] Limite de 10 itens visíveis
- [ ] "Ver mais" link (futuro)
- [ ] Integração com useDashboardData
- [ ] Empty state para novos usuários
- [ ] Skeleton loading state
- [ ] Animação fadeInUp staggered

---

## Sprint 6: Dashboard Container

### 6.1 Dashboard Componente Principal

- [ ] Criar `apps/akasha-portal/src/components/akasha/dashboard/Dashboard.tsx`
- [ ] Layout vertical mobile-first
- [ ] Header com título e ThemeToggle
- [ ] Orchestrar todos os componentes filhos
- [ ] Estados combinados (loading, error, empty)
- [ ] Animações em nível de container

### 6.2 Estilos Globais do Dashboard

- [ ] Padding consistente
- [ ] Gap entre seções
- [ ] Max-width para desktop
- [ ] Responsividade

---

## Sprint 7: Integração com Tema e Animações

### 7.1 ThemeProvider Integration

- [ ] Garantir ThemeProvider disponível no contexto
- [ ] Aplicar classes dark: nos componentes
- [ ] Tokens CSS via Tailwind

### 7.2 Animações Aplicadas

- [ ] fadeInUp em DashboardStats
- [ ] countUp em DashboardStats values
- [ ] pulse em StreakCalendar dia atual
- [ ] fadeInUp staggered em RitualHistory

---

## Sprint 8: Rotas e Navegação

### 8.1 Nova Rota

- [ ] Criar `apps/akasha-portal/src/app/dashboard/page.tsx`
- [ ] Renderizar Dashboard component
- [ ] Metadata da página
- [ ] SEO tags básicas

### 8.2 Link na Home

- [ ] Adicionar link para /dashboard na página principal
- [ ] Posição: após seção de ritual diário
- [ ] Estilo consistente com CTA existente

---

## Sprint 9: Testes

### 9.1 Testes Unitários

- [ ] Testar DashboardStats com mock data
- [ ] Testar DashboardStats com empty data
- [ ] Testar StreakCalendar renderização
- [ ] Testar ProgressChart cálculos
- [ ] Testar RitualHistory com múltiplos itens

### 9.2 Testes de Integração

- [ ] Testar Dashboard com API mockada
- [ ] Testar estados de erro
- [ ] Testar navegação /dashboard

---

## Sprint 10: Quality Gates

- [ ] `pnpm typecheck` passando
- [ ] `pnpm lint` passando
- [ ] `pnpm test:run` passando (testes novos + legados)
- [ ] Verificar 0 warnings de lint em arquivos novos

---

## Dependências Entre Tarefas

```
Sprint 1 (Estrutura)
  └─ Sprint 2 (DashboardStats) depende de: mocks.ts + hook
  └─ Sprint 3 (StreakCalendar) depende de: mocks.ts + hook
  └─ Sprint 4 (ProgressChart) depende de: mocks.ts + hook
  └─ Sprint 5 (RitualHistory) depende de: mocks.ts + hook

Sprints 2-5 (Componentes)
  └─ Sprint 6 (Dashboard Container) depende de: todos os componentes

Sprint 6 (Container)
  └─ Sprint 7 (Tema/Animações) depende de: container

Sprint 7 (Tema/Animações)
  └─ Sprint 8 (Rotas) independente

Sprint 8 (Rotas)
  └─ Sprint 9 (Testes) depende de: todos os componentes

Sprint 9 (Testes)
  └─ Sprint 10 (Quality Gates) depende de: testes
```

---

## Prioridade de Execução

1. **Sprint 1** — Setup base (independente)
2. **Sprints 2-5** — Componentes (paralelizáveis)
3. **Sprint 6** — Container (depende de 2-5)
4. **Sprint 7** — Tema/Animações (depende de 6)
5. **Sprint 8** — Rotas (depende de 7)
6. **Sprint 9** — Testes (depende de todos)
7. **Sprint 10** — Quality Gates (depende de 9)
