# PROGRESS_UI.md - Progresso da Evolução Estética

## Sprint 218 - Meta: Erradicação de Poluição Visual

**Última Atualização:** 2026-05-30
**Status:** EM PROGRESSO

---

## METAS DE DESIGN

### Meta Principal
- [ ] Reduzir widgets de 23 para 8 componentes mestres (65% redução)
- [ ] Implementar visual unificado com correlações ocultas visíveis
- [ ] Garantir build passando após refatoração

### Metas Secundárias
- [ ] Usar `GlowEffect` em todos os cards principais
- [ ] Integrar `SpiritualRadarChart` na visualização principal
- [ ] Criar fluxo visual Chakra ↔ Sefira ↔ Erva

---

## ELEMENTOS UI ATUAIS

### Dashboard (src/app/dashboard/page.tsx)
| Widget | Tamanho | Prioridade | Status |
|--------|---------|------------|--------|
| RealtimeEnergyWidget | Grande | Alta | Manter |
| DayEnergyWidget | Pequeno | Média | **MELT** → EnergyFlow |
| NotificationCenter | Pequeno | Média | Manter |
| NumerologyWidget | Médio | Alta | Manter |
| AstrologyWidget | Médio | Alta | Manter |
| LunarPhaseWidget | Médio | Alta | Manter |
| OduDivinationWidget | Grande | Alta | Manter |
| QuickDivination | Pequeno | Média | **MELT** → OduFlow |
| AIAgentsWidget | Grande | Alta | Manter |
| AchievementsWidget | Médio | Média | Manter |
| MeditationPlayer | Médio | Alta | Manter |
| MoonTracker | Médio | Alta | Manter |
| DailyProtection | Médio | Média | Manter |
| SacredCalendar | Médio | Média | Manter |
| EnergyFlowWidget | Médio | Alta | **MELT** → Unified |
| RitualPlanner | Médio | Alta | Manter |
| ChakraBalanceWidget | Médio | Alta | **MELT** → Unified |
| CorrelationViz | Médio | Alta | **MELT** → Unified |
| AffirmationWidget | Médio | Média | **MELT** → DailyPractice |
| DailyWisdomCard | Médio | Média | **MELT** → DailyPractice |

### Legenda
- **MELT**: Fundir em componente unificado
- **Manter**: Manter como está (componente funcional único)

---

## COMPONENTES DE SÍNTESE A CRIAR

### 1. UnifiedSpiritualFlow.tsx (PRIORIDADE ALTA)
**Função:** Unifica RealtimeEnergy + DayEnergy + EnergyFlow + ChakraBalance + CorrelationViz
**Tamanho estimado:** ~300 linhas
**Dependências:** GlowEffect, CosmicBackground, SpiritualRadarChart

### 2. DivinationFlow.tsx (PRIORIDADE ALTA)
**Função:** Unifica OduDivinationWidget + QuickDivination
**Tamanho estimado:** ~200 linhas

### 3. DailyPracticeFlow.tsx (PRIORIDADE MÉDIA)
**Função:** Unifica AffirmationWidget + DailyWisdomCard
**Tamanho estimado:** ~150 linhas

---

## MÉTRICAS DE SUCESSO

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| Total de widgets | 23 | ~15 | 8 |
| Elementos na tela | 150+ | ~60 | <50 |
| Tamanho de bundle | ? | -5% | -10% |
| Build status | ✅ | ✅ | ✅ |

---

## REGISTRO DE EVOLUÇÃO

### Sprint 218 (2026-05-30)
- [ ] Análise completa do dashboard
- [ ] Criação de THINKING_UI.md e PROGRESS_UI.md
- [ ] Implementação de UnifiedSpiritualFlow.tsx
- [ ] Atualização do dashboard/page.tsx
- [ ] Verificação de build

### Histórico
*(Vazio - primeiro ciclo)*

---

## DESIGN TOKENS UTILIZADOS

### Cores (src/styles/tokens.css)
```css
--cosmic-primary: #8B5CF6 (purple)
--glow-gold: #F59E0B
--gradient-cosmic: linear-gradient(135deg, #0F0F1A, #1A1A2E)
--text-sacred: #E2E8F0
--text-mystical: #94A3B8
```

### Componentes de Design
- GlowEffect (gold, purple, aurora, white)
- CosmicBackground (default, dense, subtle)
- SacredCornerSVG

---

## BACKLOG DE MELHORIAS

### Alta Prioridade
1. Implementar Árvore da Vida interativa com sefirot clicáveis
2. Conectar ChakraBalanceWidget com SpiritualRadarChart
3. Criar fluxo visual usuário: Odu → Orixá → Sefira → Chakra

### Média Prioridade
1. Adicionar tooltips explicativos nos gráficos
2. Implementar tema claro (currently dark-only)
3. Criar animações de entrada escalonadas

### Baixa Prioridade
1. Adicionar suporte a gestos touch no mobile
2. Implementar modo de apresentação (slideshow)
3. Adicionar feedback haptic em interações