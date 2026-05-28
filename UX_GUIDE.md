# UX Guide — Cabala dos Caminhos

## Histórico de Implementação

### ✅ Implementado (v1.0)

1. **Correção de Navegação Quebrada** — `src/components/dashboard/DashboardNav.tsx`
   - Diário Espiritual → `/calendario` ✓
   - Odús do Dia → `/` ✓
   - Orixás → `/` ✓
   - Adicionada seção "Recursos" com links para Planetas e Relatórios

2. **Empty States Roteirizável** — `src/components/ui/empty-state.tsx`
   - 6 variantes: no-data, no-results, not-found, error, no-content, onboarding
   - Componente `LoadingState` para estados de carregamento contextuais
   - Exportado via `src/components/ui/index.ts`

3. **Integração nos Componentes:**
   - `MapaNatalCard.tsx` — Empty state para dados indisponíveis e erros
   - `TransitosAtivos.tsx` — Empty state para zero trânsitos
   - `InsightDiario.tsx` — Empty state para erros de carregamento

---

## Overview

Análise de UX do dashboard e fluxo de autenticação do projeto Cabala dos Caminhos. O produto é uma aplicação de práticas espirituais que combina Cabala, Tarot, Orixás, Numerologia e Astrologia.

---

## User Journeys

### Jornada 1: Novo Usuário (Cadastro → Login → Dashboard)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   LANDING        │────▶│   REGISTRO       │────▶│   LOGIN         │
│                 │     │                 │     │                 │
│ /registro       │     │ Form com nome,   │     │ Email + senha   │
│                 │     │ email, nasc.,     │     │                 │
│ Call-to-action:  │     │ senha            │     │ Redirect para   │
│ "Iniciar Jornada"│     │                 │     │ dashboard após   │
└─────────────────┘     │ ❌ Se senha não   │     │ autenticação    │
                        │    confere        │     │                 │
                        │ ❌ Se email já    │     │ Sucesso:        │
                        │    existe         │     │ "Conta criada"  │
                        └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                        ┌─────────────────────────────────────────┐
                        │              DASHBOARD                   │
                        │                                          │
                        │  Painel Espiritual (home)               │
                        │  ├── Cards de resumo numerológico       │
                        │  ├── Ciclos temporais                    │
                        │  ├── Astrologia (Mapa Natal, Trânsitos) │
                        │  ├── Explorers (Odus, Lenormand)         │
                        │  ├── Orixás                              │
                        │  └── Chakras + Fases da Lua              │
                        └─────────────────────────────────────────┘
```

**Pontos de Fricção:**
- Registro pede muitos campos sem contexto (hora/nascimento, local)
- Redirecionamento pós-cadastro para login pode frustrar
- Dashboard lotado sem foco claro para novo usuário

---

### Jornada 2: Usuário Recorrente

```
┌─────────────────┐     ┌─────────────────┐
│   LOGIN         │────▶│   DASHBOARD      │
│                 │     │                  │
│ Credenciais     │     │ Acesso direto   │
│ salvas?         │     │ à página inicial │
│                 │     │                  │
│ ❌ Erro:         │     │ Navegação:       │
│ "Email/senha     │     │ - Início         │
│  incorretos"     │     │ - Calendário     │
│                 │     │ - Práticas (Chat) │
│ ✅ Sucesso       │     │ - Perfil         │
└─────────────────┘     └──────────────────┘
```

**Pontos de Fricção:**
- Sem "lembrar-me" para persistir sessão
- ~~Todas as quick-links da sidebar apontam para `/calendario`~~ ✅ CORRIGIDO

---

### Jornada 3: Acesso a Funcionalidades Premium

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   DASHBOARD     │────▶│   FUNCIONALIDADE│────▶│   BLOQUEIO      │
│                 │     │   PREMIUM        │     │                 │
│ Insight Diário  │     │ Mapa Natal      │     │ Badge "Premium"  │
│ Odus Explorer   │     │ Relatórios      │     │ ou redirect p/   │
│ Relatórios      │     │ Geometria Sagrada│     │ upgrade         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Pontos de Fricção:**
- Nenhum feedback visual claro para indicar quais features são premium
- Sistema de créditos não visível claramente na UI

---

## Hierarquia de Informação

### Dashboard Home — Problemas Identificados

```
NÍVEL 1 (Critical):
├── Painel Espiritual (título)
└── Cards numerológicos (4 cards pequenos)

NÍVEL 2 (High):
├── Ciclos Temporais
├── Astrologia (2 cards lado a lado)
├── Dia Espiritual
└── Tabs de navegação

NÍVEL 3 (Medium):
├── Insight Diário
├── Mapa de Correlações
└── Footer
```

**Problemas:**
- 9+ seções competindo por atenção no carregamento
- Sem hierarquia visual clara para novo usuário
- Cards de resumo numerológico estão no topo mas não são auto-explicativos

---

## Estados Identificados

### ✅ Existentes
- **Loading**: Skeleton placeholders para dados async
- **Error**: Ícone AlertCircle + texto "Erro"
- **Success**: Banner verde no login

### ✅ Adicionados (v1.0)
- **Empty State**: Componente reutilizável com 6 variantes
- **Loading State**: Estados de carregamento contextuais

### ❌ Ainda Ausentes
- **Partial State**: Quando alguns dados carregam e outros não
- **Toast Notifications**: Feedback durante ações do usuário

---

## Wireframes Textuais

### Fluxo: Login → Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│                         LOGIN PAGE                                │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                    ✦ ✦ ✦ ✦ ✦ ✦ ✦                       │     │
│  │                                                          │     │
│  │               CABALA DOS CAMINHOS                        │     │
│  │               Retorne ao seu caminho de luz              │     │
│  │                                                          │     │
│  │  ┌─────────────────────────────────────────────────┐    │     │
│  │  │ Email                                            │    │     │
│  │  └─────────────────────────────────────────────────┘    │     │
│  │                                                          │     │
│  │  ┌─────────────────────────────────────────────────┐    │     │
│  │  │ Senha                                            │    │     │
│  │  └─────────────────────────────────────────────────┘    │     │
│  │                                                          │     │
│  │  ┌─────────────────────────────────────────────────┐    │     │
│  │  │              ✧ ENTRAR ✧                        │    │     │
│  │  └─────────────────────────────────────────────────┘    │     │
│  │                                                          │     │
│  │              Novo aqui? Criar uma conta                  │     │
│  │                                                          │     │
│  │                    ◯ ◯ ◯ ◯ ◯ ◯ ◯                        │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo: Empty State (Após Implementação)

```
┌──────────────────────────────────────────────────────────────────┐
│                      EMPTY STATE (Mapa Natal)                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │                         🪐                                │  │
│  │                                                            │  │
│  │               Mapa Natal não disponível                     │  │
│  │                                                            │  │
│  │   Complete seu perfil com data e hora de nascimento         │  │
│  │   para revelar seu mapa astral.                            │  │
│  │                                                            │  │
│  │                    ✧ Ver Detalhes ✧                       │  │
│  │                                                            │  │
│  │                       ✦ ✦ ✦ ✦ ✦ ✦ ✦                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Recomendações Priorizadas

### P0 — Crítico ✅ RESOLVIDOS

1. ~~Fixar navegação quebrada da sidebar~~
   - ✅ Corrigido: quick-links agora apontam para destinos corretos
   - ✅ Adicionada seção "Recursos"

2. ~~Implementar Empty States~~
   - ✅ Componente `EmptyState` criado com 6 variantes
   - ✅ Integração em MapaNatal, Trânsitos e Insight

### P1 — Alta Prioridade

3. **Melhorar feedback de carregamento**
   - Progress indicators para operações longas
   - Toast notifications para ações concluídas

4. **Adicionar breadcrumbs/navegação contextual**
   - Indicativo de localização atual
   - Histórico de navegação

5. **Visualizar créditos do usuário**
   - Indicador na sidebar ou header
   - Feedback ao tentar acessar feature premium

### P2 — Média Prioridade

6. **Simplificar dashboard para novos usuários**
   - Onboarding tour opcional
   - Destacar 2-3 ações principais

7. **Melhorar validação de forms**
   - Validação inline em tempo real
   - Mensagens de erro mais descritivas

8. **Melhorar responsividade mobile**
   - Menu hamburger para navegação
   - Cards empilhados em telas pequenas

### P3 — Melhorias Futuras

9. **Adicionar tooltips explicativos** nos cards de numerologia
10. **Implementar animações de transição** entre páginas
11. **Criar gamificação** para engajamento (streaks, conquistas)

---

## Componentes Implementados

### EmptyState

```tsx
// Uso básico
<EmptyState 
  variant="no-data"
  title="Mapa Natal não disponível"
  description="Complete seu perfil..."
/>

// Com ação
<EmptyState 
  variant="error"
  title="Erro ao carregar"
  action={{
    label: 'Tentar novamente',
    onClick: buscarDados,
  }}
  icon={<AlertCircle className="w-12 h-12" />}
/>

// Variantes disponíveis:
// - 'no-data' — Dados indisponíveis
// - 'no-results' — Busca sem resultados
// - 'not-found' — Recurso não encontrado
// - 'error' — Erro de carregamento (com ação de retry)
// - 'no-content' — Conteúdo em construção
// - 'onboarding' — Orientação para novos usuários
```

### LoadingState

```tsx
// Uso
<LoadingState 
  title="Consultando os astros..."
  description="Aguarde enquanto preparamos suas informações cósmicas."
/>
```

---

## Métricas de Sucesso

- **Tempo para primeira interação**: Usuário deve conseguir acessar uma feature em < 3 clicks
- **Taxa de conclusão de registro**: Meta > 80%
- **Engajamento com features**: Uso de pelo menos 2 módulos por sessão
- **Satisfação**: NPS > 40 (futuro)

---

## Notas Técnicas

### Arquivos Modificados/Criados

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/components/ui/empty-state.tsx` | Criado | Componente EmptyState e LoadingState |
| `src/components/ui/index.ts` | Modificado | Exportação dos novos componentes |
| `src/components/dashboard/DashboardNav.tsx` | Modificado | Correção de links quebrados |
| `src/components/astrologia/MapaNatalCard.tsx` | Modificado | Integração EmptyState |
| `src/components/astrologia/TransitosAtivos.tsx` | Modificado | Integração EmptyState |
| `src/components/dashboard/InsightDiario.tsx` | Modificado | Integração EmptyState |
| `UX_GUIDE.md` | Criado | Documentação de UX |
