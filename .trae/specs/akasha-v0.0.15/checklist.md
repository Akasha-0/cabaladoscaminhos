# Akasha OS v0.0.15 — Checklist de Verificação

## Sprint 1: Estrutura Base

- [ ] Pasta `components/akasha/dashboard/` criada
- [ ] Arquivo `index.ts` exporta todos os componentes
- [ ] `mocks.ts` contém dados mock realistas
- [ ] `useDashboardData.ts` implementa fetch com fallback
- [ ] Estados de loading/error implementados

## Sprint 2: DashboardStats

- [ ] `StatsCard.tsx` renderiza título, valor, subtítulo
- [ ] `StatsCard.tsx` aceita ícone via props
- [ ] `DashboardStats.tsx` renderiza 4 cards (Total, Streak, Longest, Rate)
- [ ] Layout responsivo (1 col mobile, 3 cols desktop)
- [ ] Skeleton loading state visível
- [ ] Empty state para dados nulos
- [ ] Animação fadeInUp aplicada
- [ ] countUp animation nos valores numéricos

## Sprint 3: StreakCalendar

- [ ] `CalendarDay.tsx` renderiza dia corretamente
- [ ] Estilos diferenciados para completed vs non-completed
- [ ] `StreakCalendar.tsx` renderiza semana atual (7 dias)
- [ ] Header com nomes dos dias (Seg, Ter, Qua...)
- [ ] Dia atual marcado com pulse animation
- [ ] Skeleton loading state visível
- [ ] Animação fadeInUp aplicada

## Sprint 4: ProgressChart

- [ ] `ProgressBar.tsx` renderiza barra de progresso
- [ ] Animação de preenchimento suave
- [ ] `ProgressChart.tsx` renderiza seção semanal (7 dias)
- [ ] `ProgressChart.tsx` renderiza seção mensal (30 dias)
- [ ] Percentual calculado corretamente
- [ ] Skeleton loading state visível
- [ ] Animação fadeInUp aplicada

## Sprint 5: RitualHistory

- [ ] `HistoryItem.tsx` renderiza título e data
- [ ] Badge de status visível
- [ ] `RitualHistory.tsx` renderiza lista de itens
- [ ] Limite de 10 itens implementado
- [ ] Empty state para novos usuários
- [ ] Skeleton loading state visível
- [ ] Animação fadeInUp staggered aplicada

## Sprint 6: Dashboard Container

- [ ] `Dashboard.tsx` orchestrando todos os componentes
- [ ] Layout vertical mobile-first (scroll)
- [ ] Header com título "Dashboard"
- [ ] ThemeToggle integrado no header
- [ ] Padding e gap consistentes
- [ ] Max-width definido para desktop
- [ ] Estados combinados (loading/error/empty) funcionando

## Sprint 7: Tema e Animações

- [ ] Tema claro aplicado corretamente
- [ ] Tema escuro aplicado corretamente (dark:)
- [ ] Tokens CSS do tema acessíveis
- [ ] fadeInUp em DashboardStats
- [ ] countUp em todos os valores numéricos
- [ ] pulse no dia atual do StreakCalendar
- [ ] Transições suaves entre temas

## Sprint 8: Rotas e Navegação

- [ ] Rota `/dashboard` acessível
- [ ] Página `/dashboard` renderiza Dashboard component
- [ ] Metadata da página (`title`, `description`)
- [ ] Link para `/dashboard` presente na home page
- [ ] Link posicionado adequadamente
- [ ] Estilo do link consistente com CTAs existentes

## Sprint 9: Testes

- [ ] Teste: DashboardStats com mock data passando
- [ ] Teste: DashboardStats com empty data passando
- [ ] Teste: StreakCalendar renderização passando
- [ ] Teste: ProgressChart cálculos passando
- [ ] Teste: RitualHistory com múltiplos itens passando
- [ ] Teste: Dashboard com API mockada passando
- [ ] Teste: Estados de erro tratados passando
- [ ] Teste: Navegação /dashboard passando

## Sprint 10: Quality Gates

- [ ] `pnpm typecheck` retorna 0 errors
- [ ] `pnpm lint` retorna 0 errors (warnings aceitáveis)
- [ ] `pnpm test:run` retorna 0 failures
- [ ] Arquivos novos sem warnings de lint

---

## Verificação Visual

- [ ] Dashboard carrega em < 1s com mock data
- [ ] Animações são suaves (60fps)
- [ ] Tema alterna sem flicker
- [ ] Mobile view é usável
- [ ] Desktop view é responsivo
- [ ] Skeleton loading é visível durante fetch
- [ ] Empty state é amigável para novos usuários

---

## Critérios de Aceitação Final

1. **Funcional:** Rota `/dashboard` mostra dados visuais do usuário
2. **Completo:** Todos os 5 componentes renderizam corretamente
3. **Responsivo:** Funciona em mobile e desktop
4. **Polido:** Tema e animações aplicados
5. **Testado:** Testes unitários e integração passando
6. **Qualidade:** Quality gates verdes
