# THINKING_UI.md - Cadeia de Pensamento UI/UX

## Ciclo: Sprint 218 - Erradicação de Poluição Visual

**Data:** 2026-05-30
**Status:** EM PROGRESSO

---

## 1. ANÁLISE DO CAOS VISUAL ATUAL

### 1.1 Widgets Identificados (Dashboard)
Total: **23 widgets** dispersos em 8 seções, causando sobrecarga cognitiva

| Seção | Widgets | Impacto |
|-------|---------|---------|
| Energia | RealtimeEnergy, DayEnergy, Notification | Alto - alta frequência de mudança |
| Ferramentas | Numerology, Astrology, Lunar | Médio - conteúdo estático |
| Divinação | OduDivination, QuickDivination | Alto - funcional mas separado |
| IA & Intel. | AIAgents, Achievements | Médio - informativo |
| Práticas | MeditationPlayer, MoonTracker | Médio - interativo |
| Proteção | DailyProtection, SacredCalendar | Médio - informativo |
| Fluxo | EnergyFlow, RitualPlanner | Alto - redundante com Energy |
| Equilíbrio | ChakraBalance, CorrelationViz | Alto - relação oculta não visível |
| Práticas Diárias | Affirmation, DailyWisdom | Baixo - duplicado funcionalmente |

### 1.2 Padrões de Redundância Detectados

1. **Energia Duplicada**: `RealtimeEnergyWidget` e `EnergyFlowWidget` mostram dados similares
2. **Divinação Fragmentada**: Odu e QuickDivination poderiam ser 1 widget unificado
3. **Correlações Escondidas**: ChakraBalance e CorrelationViz mostram dados relacionados sem conexão visual
4. **Práticas Dispersas**: Affirmation + DailyWisdom = conteúdo similar em componentes separados

---

## 2. REFATORAÇÃO PROPOSTA (REGRA DE SÍNTESE)

### 2.1 Componentes de Síntese (7 widgets → 3)

| Original | Síntese | Componente |
|----------|---------|------------|
| RealtimeEnergy + EnergyFlow | **Energia Cósmica Unificada** | `UnifiedSpiritualFlow.tsx` |
| ChakraBalance + CorrelationViz | **Fluxo Espiritual Visual** | `UnifiedSpiritualFlow.tsx` |
| OduDivination + QuickDivination | **Painel de Divinação Integrada** | `DivinationFlow.tsx` |
| Affirmation + DailyWisdom | **Prática do Dia Consolidada** | `DailyPracticeFlow.tsx` |

### 2.2 Nova Arquitetura Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIFIED DASHBOARD                         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │                 │ │                                     │ │
│ │   ENERGIA       │ │     GRÁFICO RADAR ESPIRITUAL       │ │
│ │   CÓSMICA       │ │     (6 sistemas em 1 visual)        │ │
│ │   UNIFICADA     │ │                                     │ │
│ │                 │ └─────────────────────────────────────┘ │
│ └─────────────────┘ ┌─────────────────────────────────────┐ │
│ ┌─────────────────┐ │                                     │ │
│ │                 │ │     ÁRVORE DA VIDA INTERATIVA       │ │
│ │   CHAKRAS       │ │     (sefirot + odus + chakras)      │ │
│ │   + FLUXO       │ │                                     │ │
│ │                 │ └─────────────────────────────────────┘ │
│ └─────────────────┘ ┌─────────────────────────────────────┐ │
│                    │                                     │ │
│                    │     DIVINAÇÃO INTEGRADA              │ │
│                    │     (odu + tarot + ifá em fluxo)      │ │
│                    │                                     │ │
│                    └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. DECISÕES DE DESIGN

### 3.1 Tokens CSS a Usar
- `--cosmic-primary`: Cor principal do tema
- `--glow-gold`: Para destaques
- `--gradient-cosmic`: Gradiente de fundo cósmico

### 3.2 Componentes de Efeito
- `GlowEffect` (gold/purple variants)
- `CosmicBackground` (nebula + stars CSS)
- `SpiritualRadarChart` (6 sistemas em 1 visual)

### 3.3 Animações
- Framer Motion para transições suaves
- CSS-only para glows e partículas
- Hover states com profundidade

---

## 4. PADRÕES DE INTERFACE UNIFICADOS NESTE CICLO

### 4.1 Card Unificado
```tsx
<Card className="cosmic-card glow-border">
  <div className="sacred-corner-tl" />
  <SacredCornerSVG />
</Card>
```

### 4.2 Grid Adaptativo
```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  <div className="lg:col-span-5">Energia + Chakras</div>
  <div className="lg:col-span-7">Radar + Árvore da Vida</div>
</div>
```

### 4.3 Métrica de Sucesso
- **Objetivo:** Reduzir de 23 widgets para 8 componentes mestres
- **Taxa de redução:** 65% de decrease em elementos UI
- **Verificação:** Build passa + visual coeso

---

## 5. PRÓXIMOS PASSOS
1. Implementar `UnifiedSpiritualFlow.tsx` (energy + chakra + flow)
2. Criar `DivinationFlow.tsx` (odu + quick divination)
3. Atualizar `page.tsx` com layout consolidado
4. Executar `npm run build` para verificação