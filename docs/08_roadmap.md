# Documento 08 — Roadmap de Desenvolvimento
## Cabala dos Caminhos

> **Versão:** 1.0 | **Horizonte:** 5 meses até lançamento do MVP estável  
> **Metodologia:** Sprints de 2 semanas

---

## Visão Geral das Fases

```
FASE 1 — FUNDAÇÃO         FASE 2 — COCKPIT MVP       FASE 3 — ESCALA
(Semanas 1–4)              (Semanas 5–10)              (Semanas 11–20)
──────────────────         ──────────────────          ──────────────────
✦ Setup & Infra            ✦ Mesa Real 9x4             ✦ PDF Premium
✦ Banco de Dados           ✦ Motor IA                  ✦ Multi-tenant
✦ Autenticação             ✦ Geração Dossiê            ✦ App Mobile
✦ Motores de Cálculo       ✦ Histórico                 ✦ SaaS / Billing
──────────────────         ──────────────────          ──────────────────
Entregável:                Entregável:                 Entregável:
Sistema rodando            MVP funcional               Produto comercial
localmente com             para uso real em            para outros
banco configurado          atendimentos               terapeutas
```

> **Itens incorporados nesta refatoração (Doc 10):**
> - **Mapas enriquecidos** (G3) entram já na **Fase 1** (motores de cálculo — Doc 11).
> - **Consulta Interativa / Q&A** (G5, Doc 12) entra na transição **Fase 2 → 3** (Sprint 7), atrás de feature flag.
> - **Identidade v2 / paleta laranja+royal** (Doc 13) aplica-se a toda UI desde o setup.
> - **Extensibilidade (I-Ching)** (Doc 14) fica como **Fase 2+**, fora do MVP.
> - **Decisões de conteúdo D1–D6** (Doc 10 §5) são pré-requisito da Fase 1/2 — ver "Dependências Críticas".

---

## FASE 1 — Fundação e Motores de Cálculo
**Duração:** 4 semanas (Sprints 1 e 2)  
**Objetivo:** Sistema com infraestrutura sólida, autenticação funcional e motores matemáticos precisos.

### Sprint 1 (Semanas 1–2): Setup e Banco de Dados

| ID | Tarefa | Épico | Prioridade | Estimativa |
|---|---|---|---|---|
| T1.1 | Setup Next.js, Tailwind, Shadcn/ui | E1 | 🔴 | 4h |
| T1.2 | Configurar Prisma + PostgreSQL + Migrations | E1 | 🔴 | 4h |
| T1.3 | Implementar NextAuth + tela de Login | E1 | 🔴 | 6h |
| T1.4 | Criar layout base do Dashboard (Sidebar + Topbar) | E1 | 🔴 | 6h |
| T1.5 | Configurar fontes e design system (CSS vars) | E1 | 🟡 | 3h |
| T1.6 | Criar constantes: 36 cartas e 16 Odus | E2 | 🔴 | 3h |
| T1.7 | Script de seed do usuário admin | E1 | 🔴 | 1h |

**Milestone Sprint 1:** Sistema rodando localmente com login funcional e banco configurado. Um usuário admin criado. Layout base visível.

---

### Sprint 2 (Semanas 3–4): Motores de Cálculo e Cadastro

> **Pré-requisito de conteúdo:** as decisões **D1–D4** (Doc 10 §5 / Doc 11) devem estar respondidas, ou os motores rodam com os defaults provisórios do Doc 11 e os campos afetados ficam sinalizados.

| ID | Tarefa | Épico | Prioridade | Estimativa |
|---|---|---|---|---|
| T2.1 | Motor de Numerologia Cabalística **enriquecido** + testes (Doc 11 §2: impressão, pináculos, lições, ciclos pessoais, arcanos) | E2 | 🔴 | 10h |
| T2.2 | Motor de Numerologia Tântrica completo + testes (Doc 11 §3: 11 corpos, rótulos resolvidos) | E2 | 🔴 | 5h |
| T2.3 | Integração com API de Astrologia + AstrologyMap **enriquecido** (elementos, modalidades, harmony/tension) | E2 | 🔴 | 13h |
| T2.4 | Motor de Odu de Nascimento (Doc 11 §4; default provisório até D3) | E2 | 🟡 | 3h |
| T2.5 | Formulário de cadastro de consulente (validação Zod) | E2 | 🔴 | 8h |
| T2.6 | Server Action: createClient com todos os mapas (enriquecidos) | E2 | 🔴 | 6h |
| T2.7 | Página de listagem e perfil de consulente | E2 | 🟡 | 6h |

**Milestone Sprint 2:** Cadastrar um consulente calcula e salva todos os mapas. Perfil exibe badges dos mapas corretamente.

**Validação da Fase 1:** Cadastrar "Eliane Simão de Almeida, 20/08/1986" e verificar:
- Caminho de Vida = 7
- Alma Tântrica = 2, Karma = 8, Dom = 5
- Sol em Leão no mapa astral

---

## FASE 2 — O Cockpit e o Motor de IA (MVP)
**Duração:** 6 semanas (Sprints 3, 4 e 5)  
**Objetivo:** Sistema totalmente funcional para conduzir uma consulta real de ponta a ponta.

### Sprint 3 (Semanas 5–6): Grid da Mesa Real

| ID | Tarefa | Épico | Prioridade | Estimativa |
|---|---|---|---|---|
| T3.1 | Zustand store do grid (mesa-real-store.ts) | E3 | 🔴 | 4h |
| T3.2 | Componente MesaRealGrid 9×4 (layout CSS Grid) | E3 | 🔴 | 6h |
| T3.3 | CasaSlot: estado vazio (design e hover) | E3 | 🔴 | 4h |
| T3.4 | CasaSlot: estado preenchido (design e animação) | E3 | 🔴 | 4h |
| T3.5 | CartaCombobox (ComboBox Shadcn com busca) | E3 | 🔴 | 4h |
| T3.6 | OduCombobox (ComboBox Shadcn com busca) | E3 | 🔴 | 3h |
| T3.7 | CasaPopover: integrar os dois ComboBoxes | E3 | 🔴 | 5h |

**Milestone Sprint 3:** Grid 9×4 visível na tela. É possível clicar em um slot, selecionar carta e Odu, e ver o slot atualizado.

---

### Sprint 4 (Semanas 7–8): Painel do Consulente e Integração da Tela

| ID | Tarefa | Épico | Prioridade | Estimativa |
|---|---|---|---|---|
| T4.1 | ClientSearchCombobox no painel lateral | E3 | 🔴 | 5h |
| T4.2 | Exibição dos badges de mapas ao selecionar cliente | E3 | 🔴 | 4h |
| T4.3 | Indicador de progresso (X/36 cartas) | E3 | 🟡 | 2h |
| T4.4 | Botão "Limpar Mesa" com Dialog de confirmação | E3 | 🟡 | 2h |
| T4.5 | Correlation Map completo: as 36 entradas | E4 | 🔴 | 8h |
| T4.6 | PromptBuilder: buildHousePayload + buildFullPayload | E4 | 🔴 | 8h |
| T4.7 | LLM Client abstrato (OpenAI + Anthropic) | E4 | 🔴 | 4h |

**Milestone Sprint 4:** Cockpit completo: selecionar consulente, preencher grid, ver mapas no painel. PromptBuilder testado localmente gerando payloads corretos.

---

### Sprint 5 (Semanas 9–10): Geração do Dossiê e Histórico

| ID | Tarefa | Épico | Prioridade | Estimativa |
|---|---|---|---|---|
| T5.1 | API Route /api/generate-dossier com streaming | E4 | 🔴 | 8h |
| T5.2 | DossierViewer: consumir stream + render Markdown | E4 | 🔴 | 8h |
| T5.3 | Criação de Reading + Report no banco | E4 | 🔴 | 4h |
| T5.4 | Estados de loading, erro e sucesso na UI | E4 | 🟡 | 4h |
| T5.5 | Dashboard principal com métricas e últimas leituras | E6 | 🟡 | 6h |
| T5.6 | Histórico de leituras por consulente | E6 | 🟡 | 4h |
| T5.7 | Página de visualização de dossiê salvo (/leituras/[id]) | E6 | 🟡 | 4h |

**Milestone Sprint 5:** 🎉 **MVP FUNCIONAL** — É possível conduzir uma consulta completa: selecionar cliente → preencher grid → gerar dossiê → ver o relatório na tela → acessar no histórico.

**Validação da Fase 2:** Conduzir uma consulta real com um cliente. O dossiê gerado deve:
- Mencionar dados específicos do mapa do cliente (não ser genérico)
- Ter a estrutura de 3 parágrafos por casa
- Ter a síntese final com 4 capítulos e veredito

---

## FASE 3 — Refinamentos, PDF e Escala
**Duração:** 10 semanas (Sprints 6 ao 10)  
**Objetivo:** Produto polido, exportação de PDF, e infraestrutura para escala comercial.

### Sprint 6 (Semanas 11–12): Exportação de PDF

| ID | Tarefa | Épico | Prioridade | Estimativa |
|---|---|---|---|---|
| T6.1 | Template do PDF (react-pdf ou Puppeteer) | E5 | 🔴 | 12h |
| T6.2 | API Route /api/generate-pdf | E5 | 🔴 | 6h |
| T6.3 | Upload para Vercel Blob / S3 + salvar URL | E5 | 🟡 | 4h |
| T6.4 | Botão de download integrado ao DossierViewer | E5 | 🔴 | 3h |

**Milestone Sprint 6:** Dossiê exportável como PDF com capa, mapas e análise formatada.

---

### Sprint 7 (Semanas 13–14): Consulta Interativa (Q&A) — *Doc 12*

> **Decisão D5:** Q&A recomendado para a **Fase 2/início da Fase 3**, atrás de feature flag. Aplicar a paleta v2 (Doc 13). Marca a entrega da "maior expansão da visão".

| ID | Tarefa | Épico | Prioridade | Estimativa |
|---|---|---|---|---|
| T7Q.1 | Modelos `Consultation`/`ChatMessage` + migration (Doc 04) | E8 | 🔴 | 3h |
| T7Q.2 | Roteador de Temas `theme-router.ts` (Doc 12 §4) | E8 | 🔴 | 8h |
| T7Q.3 | API `/api/consult` com RAG fechado + persona (Doc 12 §5–§7) | E8 | 🔴 | 10h |
| T7Q.4 | Tela "Consultar o Oráculo" (Doc 05 §9) + chips de roteamento | E8 | 🔴 | 8h |

**Milestone Sprint 7:** É possível perguntar ao Oráculo sobre uma leitura e receber resposta ancorada, com transparência das casas consultadas.

---

### Sprint 8 (Semanas 15–16): UX Avançada e Performance

| ID | Tarefa | Épico | Prioridade | Estimativa |
|---|---|---|---|---|
| T7.1 | Micro-interações e animações do grid (paleta v2) | E7 | 🟢 | 8h |
| T7.2 | Atalhos de teclado globais | E7 | 🟢 | 4h |
| T7.3 | Otimização de re-renders com React.memo e useCallback | E7 | 🟡 | 6h |
| T7.4 | Responsividade para tablet (iPad Pro landscape) | E7 | 🟡 | 8h |
| T7.5 | Testes de integração E2E com Playwright | E7 | 🟡 | 12h |

---

### Sprint 9–10 (Semanas 17–20): Escala e Monetização (Opcional)

Estas tarefas são opcionais para o MVP e entram apenas se o objetivo for abrir o sistema para outros terapeutas:

| ID | Tarefa | Prioridade |
|---|---|---|
| T8.1 | Sistema multi-tenant: UserProfile e hierarquia de acessos | 🟢 |
| T8.2 | Integração com Stripe para assinaturas | 🟢 |
| T8.3 | Limites de uso por plano (consultas/mês) | 🟢 |
| T8.4 | Dashboard admin para gerenciar usuários | 🟢 |
| T8.5 | App mobile React Native (leitura de dossiês) | 🟢 |

---

## Critérios de Sucesso do MVP (Fase 1 + Fase 2)

O MVP é considerado bem-sucedido quando:

1. **Funcional:** É possível conduzir uma consulta completa do zero em menos de 10 minutos (incluindo cadastrar o cliente se necessário).
2. **Preciso:** O dossiê gerado menciona aspectos específicos do mapa natal do consulente em pelo menos 80% das casas.
3. **Confiável:** O sistema fica disponível durante os horários de atendimento sem erros de API.
4. **Valioso:** O consulente recebe um dossiê que justifica o valor cobrado pelo atendimento.

---

## Dependências Críticas

| Dependência | Risco | Mitigação |
|---|---|---|
| API de Astrologia | Alta — sem ela, o mapa astral fica incompleto | Ter fallback com biblioteca `astronomia` local (precisão menor) |
| API do LLM (OpenAI/Anthropic) | Alta — core do produto | Implementar com ambos os providers e failover automático |
| Google Places API | Baixo — apenas autocomplete | Fallback: input manual de cidade + timezone |
| Cálculos Numerológicos | Nenhum — algoritmos próprios | Validar com casos conhecidos antes de produção |
| Decisões de conteúdo D1–D4 (tabelas alfanuméricas, tântricas, data→Odu, 16 Odus) | Média — sem elas os números seguem defaults provisórios | Rodar com defaults do Doc 11 sinalizados; substituir pela linhagem antes do go-live |
| Tabela data → Odu (D3) | Alta para o Odu Natal | Algoritmo default provisório (Doc 11 §4.1) até o operador definir a tabela |

---

## Stack de Deploy Recomendada

| Serviço | Propósito | Custo Estimado/mês |
|---|---|---|
| Vercel (Hobby/Pro) | Hosting do Next.js | $0–$20 |
| Supabase (Free/Pro) | PostgreSQL gerenciado | $0–$25 |
| Vercel Blob | Storage dos PDFs | ~$0.02/GB |
| OpenAI API | Geração dos dossiês | ~$0.005/1k tokens (GPT-4o) |
| Google Places API | Autocomplete de cidades | Free (28k reqs/mês) |

**Custo total estimado para uso pessoal (MVP):** $0 a $50/mês dependendo do volume de consultas.

---

## Checklist de Go-Live

Antes de usar o sistema em atendimentos reais:

- [ ] Todos os motores de cálculo validados com pelo menos 5 casos conhecidos
- [ ] Dossiê gerado para 1 consulta completa de teste (36 casas)
- [ ] PDF exportado e formatado corretamente
- [ ] Backup automático do banco configurado
- [ ] Chaves de API rotacionadas (não usar as de desenvolvimento)
- [ ] NEXTAUTH_SECRET seguro gerado em produção
- [ ] Deploy em Vercel com domínio personalizado
- [ ] Teste de carga: gerar 3 dossiês simultâneos sem timeout
