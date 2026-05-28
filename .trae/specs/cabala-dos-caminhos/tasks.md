# Tarefas de Implementação - Cabala dos Caminhos

## Visão Geral do Roadmap

```
FASE 1 (MVP)     → Fundações: Auth + Cálculos + Dashboard
FASE 2           → Profundidade: Odús + IA + Créditos  
FASE 3           → Expansão: Trânsitos + Chat + Módulos
FASE 4           → Ecossistema: Empresa + Mobile + Comunidade
```

---

## FASE 1: FUNDAÇÕES (MVP) - 4 semanas estimadas

### Sprint 1: Configuração do Projeto (5-7 dias)

#### Tarefa 1.1: Setup do Next.js com TypeScript
- [x] 1.1.1: Criar projeto Next.js 14+ com App Router
- [x] 1.1.2: Configurar TypeScript strict mode
- [x] 1.1.3: Configurar ESLint + Prettier
- [x] 1.1.4: Setup do Tailwind CSS com design system
- [x] 1.1.5: Configurar shadcn/ui + componentes base

**Dependências:** Nenhuma  
**Entrega:** Projeto base configurado e rodando

#### Tarefa 1.2: Configuração de Banco de Dados
- [x] 1.2.1: Setup PostgreSQL local ou Docker
- [x] 1.2.2: Configurar Prisma ORM
- [x] 1.2.3: Criar schema inicial (User, Profile, Subscription)
- [x] 1.2.4: Setup migrations
- [x] 1.2.5: Configurar seed de dados base

**Dependências:** 1.1  
**Entrega:** Database configurado com schema inicial

#### Tarefa 1.3: Autenticação
- [x] 1.3.1: Implementar registro de usuário
- [x] 1.3.2: Implementar login (NextAuth.js)
- [x] 1.3.3: Implementar recuperação de senha
- [x] 1.3.4: Configurar JWT + refresh tokens
- [x] 1.3.5: Proteger rotas com middleware

**Dependências:** 1.1, 1.2  
**Entrega:** Sistema de autenticação completo

---

### Sprint 2: Módulos de Cálculo (7-10 dias)

#### Tarefa 2.1: Cálculos de Numerologia
- [x] 2.1.1: Implementar Numerologia Pitagórica
- [x] 2.1.2: Implementar Numerologia Cabalística
- [x] 2.1.3: Implementar Numerologia Caldeia
- [x] 2.1.4: Implementar Numerologia Tântrica
- [x] 2.1.5: Criar interpretadores para cada tipo
- [x] 2.1.6: Testar com casos known

**Dependências:** 1.1, 1.2  
**Entrega:** API de numerologia funcional

#### Tarefa 2.2: Cálculo de Ciclos Temporais
- [x] 2.2.1: Implementar cálculo de Ano Pessoal
- [x] 2.2.2: Implementar cálculo de Mês Pessoal
- [x] 2.2.3: Implementar cálculo de Dia Pessoal
- [x] 2.2.4: Criar cache Redis para ciclos (24h TTL)
- [x] 2.2.5: Documentar fórmulas utilizadas

**Dependências:** 1.1, 1.2  
**Entrega:** API de ciclos temporais funcional

#### Tarefa 2.3: Base de Conhecimento Inicial
- [x] 2.3.1: Modelar dados dos 7 dias da semana
- [x] 2.3.2: Modelar dados dos 12 Orixás principais
- [x] 2.3.3: Modelar dados dos 7 Chakras
- [x] 2.3.4: Modelar dados de cores e elementos
- [x] 2.3.5: Modelar dados de ervas (quente/frio)
- [x] 2.3.6: Importar dados do IDEIA.md para o banco

**Dependências:** 1.2  
**Entrega:** Base de conhecimento populada

---

### Sprint 3: Dashboard e Interface (7-10 dias)

#### Tarefa 3.1: Layout Base e Design System
- [x] 3.1.1: Implementar tema escuro místico (CSS variables)
- [x] 3.1.2: Criar componentes: Card, Button, Input, Badge
- [x] 3.1.3: Implementar navegação (sidebar/topbar)
- [x] 3.1.4: Criar wrappers de página (container, sections)
- [x] 3.1.5: Implementar animações de transição

**Dependências:** 1.1, 2.1  
**Entrega:** Design system implementada

#### Tarefa 3.2: Dashboard Principal
- [x] 3.2.1: Criar componente de saudação dinâmica
- [x] 3.2.2: Implementar cards de resumo (números, odú, arcano)
- [x] 3.2.3: Criar componente de ciclo atual (ano/mês/dia)
- [x] 3.2.4: Implementar visualização da Árvore da Vida
- [x] 3.2.5: Adicionar fase lunar atual

**Dependências:** 1.1, 2.1, 2.2, 3.1  
**Entrega:** Dashboard principal funcional

#### Tarefa 3.3: Calendário Semanal (Kanban)
- [x] 3.3.1: Criar componente Card de Dia
- [x] 3.3.2: Implementar grid de 7 cards
- [x] 3.3.3: Adicionar lógica de filtragem por quizilas
- [x] 3.3.4: Implementar scroll horizontal em mobile
- [x] 3.3.5: Adicionar indicador do dia atual

**Dependências:** 2.3, 3.1  
**Entrega:** Calendário semanal funcional

---

### Sprint 4: Integração e MVP (5-7 dias)

#### Tarefa 4.1: Integração de APIs
- [x] 4.1.1: Conectar frontend com backend (tRPC ou API routes)
- [x] 4.1.2: Implementar estados de loading/success/error
- [x] 4.1.3: Adicionar tratamento de erros global
- [x] 4.1.4: Configurar cache no client

**Dependências:** 3.1, 3.2, 3.3  
**Entrega:** APIs integradas ao frontend

#### Tarefa 4.2: Página de Perfil
- [x] 4.2.1: Implementar edição de dados pessoais
- [x] 4.2.2: Adicionar recálculo de mapa natal
- [x] 4.2.3: Criar visualização completa do perfil
- [x] 4.2.4: Implementar preferências de usuário

**Dependências:** 1.3, 2.1, 3.1  
**Entrega:** Página de perfil funcional

#### Tarefa 4.3: Testes e Correções MVP
- [x] 4.3.1: Testar fluxo completo (registro → dashboard)
- [x] 4.3.2: Verificar responsividade mobile
- [x] 4.3.3: Testar cálculos com usuários known
- [x] 4.3.4: Corrigir bugs encontrados
- [x] 4.3.5: Deploy staging

**Dependências:** 4.1, 4.2  
**Entrega:** MVP funcionando em produção

---

## FASE 2: PROFUNDIDADE - 4 semanas estimadas

### Sprint 5: Odús Completos (7-10 dias)

#### Tarefa 5.1: Cálculo de Odús de Nascimento
- [x] 5.1.1: Implementar algoritmo de cálculo do Odú
- [x] 5.1.2: Implementar Odú secundário
- [x] 5.1.3: Criar lógica de interpretação
- [x] 5.1.4: Implementar preceitos e quizilas
- [x] 5.1.5: Adicionar ebós recomendados

**Dependências:** Fase 1 completa  
**Entrega:** Sistema de Odús funcional

#### Tarefa 5.2: Integração Odús ↔ Dashboard
- [x] 5.2.1: Mostrar Odú na dashboard
- [x] 5.2.2: Filtrar calendário por quizilas
- [x] 5.2.3: Personalizar insights por Odú
- [x] 5.2.4: Adicionar Orientações específicas do Odú

**Dependências:** 5.1, 3.3  
**Entrega:** Odús integrados à interface

---

### Sprint 6: Integração com IA (7-10 dias)

#### Tarefa 6.1: Setup da API de IA
- [x] 6.1.1: Configurar OpenAI API (GPT-4)
- [x] 6.1.2: Implementar sistema de créditos
- [x] 6.1.3: Criar lógica de custo por operação
- [x] 6.1.4: Implementar rate limiting

**Dependências:** Fase 1 completa  
**Entrega:** API de IA configurada

#### Tarefa 6.2: Motor de Insights
- [x] 6.2.1: Criar prompt system para insights
- [x] 6.2.2: Implementar geração de insight diário
- [x] 6.2.3: Criar formatação de resposta (título, ação, ritual)
- [x] 6.2.4: Implementar cache de insights (12h)

**Dependências:** 6.1, 2.2, 2.3, 5.1  
**Entrega:** Motor de insights funcional

#### Tarefa 6.3: Chat de Consultas
- [x] 6.3.1: Implementar interface de chat
- [x] 6.3.2: Criar sistema de temas (relacionamento, trabalho, etc.)
- [x] 6.3.3: Implementar contexto do usuário no prompt
- [x] 6.3.4: Adicionar histórico de conversas
- [x] 6.3.5: Implementar streaming de resposta

**Dependências:** 6.1, 6.2  
**Entrega:** Chat funcional

---

### Sprint 7: Sistema de Assinatura (7-10 dias)

#### Tarefa 7.1: Integração Stripe
- [x] 7.1.1: Configurar Stripe SDK
- [x] 7.1.2: Implementar checkout de assinatura
- [x] 7.1.3: Implementar webhooks (pagamento, cancelamento)
- [x] 7.1.4: Criar portal de assinatura do cliente

**Dependências:** Fase 1 completa  
**Entrega:** Pagamentos funcionais

#### Tarefa 7.2: Sistema de Créditos
- [x] 7.2.1: Implementar modelo de créditos
- [x] 7.2.2: Criar lógica de desconto por operação
- [x] 7.2.3: Implementar recarga de créditos
- [x] 7.2.4: Criar histórico de uso

**Dependências:** 6.1, 7.1  
**Entrega:** Sistema de créditos funcional

---

### Sprint 8: Refinamentos e Polish (5-7 dias)

#### Tarefa 8.1: Dashboard Insights
- [x] 8.1.1: Implementar componente de insight diário
- [x] 8.1.2: Adicionar ações recomendadas
- [x] 8.1.3: Criar seção de mantras/afirmações
- [x] 8.1.4: Implementar cores/ervas do dia

**Dependências:** 6.2, 3.1  
**Entrega:** Dashboard com insights

#### Tarefa 8.2: Visualizações Avançadas
- [x] 8.2.1: Implementar visualização de Chakras
- [x] 8.2.2: Criar visualização de Sefirots interativa
- [x] 8.2.3: Adicionar correspondências visuais
- [x] 8.2.4: Implementar tooltips informativos

**Dependências:** 2.3, 3.1  
**Entrega:** Visualizações avançadas

---

## FASE 3: EXPANSÃO - 4 semanas estimadas

### Sprint 9: Astrologia Avançada
- [x] 9.1.1: Configurar Swiss Ephemeris (JS puro)
- [x] 9.1.2: Implementar cálculo de posição planetária
- [x] 9.1.3: Criar cálculo de casas astrológicas (Placidus)
- [x] 9.1.4: Implementar mapa natal completo

**Dependências:** Fase 2 completa  
**Entrega:** Cálculos astrológicos funcionais

#### Tarefa 9.2: Trânsitos Planetários
- [x] 9.2.1: Implementar cálculo de trânsitos atuais
- [x] 9.2.2: Criar interpretador de aspectos
- [x] 9.2.3: Adicionar notificação de trânsitos importantes
- [x] 9.2.4: Integrar trânsitos aos insights

**Dependências:** 9.1, 6.2  
**Entrega:** Trânsitos integrados

---

### Sprint 10: Módulos Adicionais (7-10 dias)

#### Tarefa 10.1: Módulo de Planetas
- [x] 10.1.1: Implementar visualização de trânsitos
- [x] 10.1.2: Criar interpretação planetária
- [x] 10.1.3: Adicionar efemérides interativas

**Dependências:** 9.2  
**Entrega:** Módulo de planetas ✅

#### Tarefa 10.2: Módulo de Geometria Sagrada
- [x] 10.2.1: Implementar visualização de formas geométricas
- [x] 10.2.2: Criar explicações de proporções
- [x] 10.2.3: Adicionar associações com sefirots

**Dependências:** Fase 2 completa  
**Entrega:** Módulo de geometria ✅

#### Tarefa 10.3: Módulo de Frequências
- [x] 10.3.1: Implementar lista de frequências Solfeggio
- [x] 10.3.2: Criar recomendações por dia/chakra
- [x] 10.3.3: Adicionar player de áudio

**Dependências:** Fase 2 completa  
**Entrega:** Módulo de frequências ✅

---

### Sprint 11-12: Relatórios e Polish (10-14 dias)

#### Tarefa 11.1: Relatório Semanal
- [ ] 11.1.2: Implementar geração de relatório (PDF)
- [ ] 11.1.3: Criar template visual místico
- [ ] 11.1.4: Adicionar cronograma de rituais

**Dependências:** Fase 2 completa  
**Entrega:** Relatório semanal

#### Tarefa 11.2: Relatório Mensal
- [ ] 11.2.1: Implementar análise mensal completa
- [ ] 11.2.2: Criar visualização de ciclos
- [ ] 11.2.3: Adicionar previsões e orientações

**Dependências:** 9.2, 11.1  
**Entrega:** Relatório mensal

---

## FASE 4: ECOSSISTEMA - 4 semanas estimadas

### Sprint 13: Numerologia Empresarial (7-10 dias)

#### Tarefa 13.1: Cadastro de Empresa
- [ ] 13.1.1: Implementar formulário de empresa
- [ ] 13.1.2: Criar modelo de dados empresa
- [ ] 13.1.3: Implementar vínculo usuário↔empresa

**Dependências:** Fase 2 completa  
**Entrega:** Cadastro de empresa

#### Tarefa 13.2: Cálculos Empresariais
- [ ] 13.2.1: Implementar numerologia do nome fantasia
- [ ] 13.2.2: Implementar numerologia da razão social
- [ ] 13.2.3: Criar interpretador empresarial
- [ ] 13.2.4: Adicionar dia de abertura favoravel

**Dependências:** 13.1, 2.1  
**Entrega:** Numerologia empresarial

---

### Sprint 14: Preparação Mobile (7-10 dias)

#### Tarefa 14.1: PWA (Progressive Web App)
- [ ] 14.1.1: Configurar manifest.json
- [ ] 14.1.2: Implementar service worker
- [ ] 14.1.3: Adicionar offline support básico
- [ ] 14.1.4: Configurar push notifications

**Dependências:** Fase 3 completa  
**Entrega:** PWA funcional

#### Tarefa 14.2: Responsive Mobile
- [ ] 14.2.1: Revisar layout mobile
- [ ] 14.2.2: Otimizar performance
- [ ] 14.2.3: Adicionar gestos touch
- [ ] 14.2.4: Testar em múltiplos dispositivos

**Dependências:** 14.1  
**Entrega:** Mobile otimizado

---

## Task Dependencies

```
FASE 1:
1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 2.3 → 3.1 → 3.2 → 3.3 → 4.1 → 4.2 → 4.3

FASE 2:
Fase 1 completa → 5.1 → 5.2 → 6.1 → 6.2 → 6.3 → 7.1 → 7.2 → 8.1 → 8.2

FASE 3:
Fase 2 completa → 9.1 → 9.2 → 10.1 → 10.2 → 10.3 → 11.1 → 11.2

FASE 4:
Fase 3 completa → 13.1 → 13.2 → 14.1 → 14.2
```

---

## Métricas de Progresso

| Fase | Tarefas | Status | Semanas | Entrega |
|------|---------|--------|---------|---------|
| Fase 1 | 1.1 - 4.3 | ✅ COMPLETA | 4 | MVP funcional |
| Fase 2 | 5.1 - 8.2 | ✅ COMPLETA | 4 | Sistema completo |
| Fase 3 | 9.1 - 11.2 | ⏳ PENDENTE | 4 | Expansão |
| Fase 4 | 13.1 - 14.2 | ⏳ PENDENTE | 4 | Ecossistema |

**Total Estimado:** 16 semanas (~4 meses)

---

## Progresso Detalhado

### FASE 1: COMPLETA ✅
- Sprint 1: Setup completo ✅
- Sprint 2: Cálculos implementados ✅
- Sprint 3: Interface completa ✅
- Sprint 4: Integração e MVP ✅

### FASE 2: COMPLETA ✅
- Sprint 5: Odús COMPLETO ✅
- Sprint 6: IA COMPLETO ✅
- Sprint 7: Stripe COMPLETO ✅
- Sprint 8: Polish COMPLETO ✅

### FASE 3: EM PROGRESSO 🚧
- Sprint 9: Astrologia Avançada COMPLETO ✅
- Sprint 10: Módulos Adicionais (Planetas, Geometria, Frequências) ⏳
- Sprint 11-12: Relatórios (Semanal, Mensal) ⏳

### Próximos Passos Prioritários
1. Sprint 9.1: Configurar Swiss Ephemeris para cálculos astrológicos
2. Sprint 9.2: Implementar mapa natal completo
3. Sprint 10: Módulos adicionais
4. Sprint 11-12: Relatórios

---

*Última atualização: 2026-05-27*
