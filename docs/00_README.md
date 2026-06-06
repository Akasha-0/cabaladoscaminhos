# Sistema Akasha — Documentação Oficial do Projeto

> **Produto público:** Sistema Akasha (Oráculo Vivo B2C)
> **Matriz tecnológica:** Cabala dos Caminhos (monorepo / laboratório)
> **Versão:** 2.0.0 | **Última atualização:** 2026-06-05
> **Proprietário:** Gabriel (Operador e Desenvolvedor)
> **Status:** 🔄 **PIVÔ B2B → B2C em andamento** — Cirurgia de Extração (monorepo) · Cockpit B2B em quarentena como legado

---

## ⚠️ Leia Primeiro: O Pivô

O projeto **mudou de rumo**. Deixou de ser uma ferramenta **B2B** para terapeutas (Cockpit Oracular / Mesa Real de 36 casas) e passou a ser o **Sistema Akasha**: um produto **B2C de tecnologia espiritual viva**, mobile-first, para clientes finais.

A fonte da nova visão é **`NOVAVISAO.md`** (cadeia de raciocínio bruta) e sua síntese acionável é o **Doc 25 — Visão Akasha**, o novo **norte canônico**. Toda a documentação está sendo realinhada a essa visão.

| Antes (B2B — legado) | Agora (B2C — Akasha) |
|---|---|
| Cockpit Oracular para terapeutas | Oráculo Vivo para clientes finais |
| Mesa Real (36 casas / Baralho Cigano + Odus) | **4 Pilares** + **Mandala Toroidal** |
| Identidade Cigano Ramiro (laranja+royal) | Identidade **Akasha cósmica** (violeta/ciano/dourado) |
| Dossiê PDF estático | **Manifesto** (PDF base) + **Dashboard Diário** vivo |
| Monólito Next.js · Vercel/Supabase | **Monorepo** (`core-*` + `b2c-portal`) · **VPS Linux** |
| IA direta (PromptBuilder → LLM) | **3 camadas** (Determinístico + Grafo + Síntese/Grimório RAG) |
| Ticket por consulta (operador) | **Freemium + Assinatura + Créditos** (Stripe) |

---

## Índice de Documentos

### 🌌 Norte da Visão Akasha (canônico)
| # | Documento | Descrição |
|---|-----------|-----------|
| — | [NOVAVISAO.md](./NOVAVISAO.md) | 📜 Fonte bruta da nova visão (cadeia de raciocínio). **Não editar.** |
| 25 | [Visão Akasha](./25_visao-akasha.md) | ⭐ **NORTE CANÔNICO** — síntese acionável: 4 pilares, Mandala, 3 camadas, Grimório, monetização, monorepo |
| 26 | [Identidade Akasha](./26_identidade-akasha.md) | Marca, paleta cósmica, voz do Oráculo — **substitui o Doc 13** |

### 📘 Núcleo de Produto (realinhado ao Akasha)
| # | Documento | Descrição |
|---|-----------|-----------|
| 01 | [Product Brief](./01_product-brief.md) | Visão, proposta de valor, público B2C, diferenciais |
| 02 | [PRD](./02_prd.md) | Onboarding, Mandala, Dashboard Diário, Manifesto, créditos |
| 03 | [Arquitetura Técnica](./03_architecture-spec.md) | Monorepo, VPS Linux, 3 camadas de IA, Grimório, Swiss Ephemeris+Redis |
| 04 | [Modelo de Dados](./04_data-model.md) | Prisma B2C: User, Subscription, Credits, Grimoire (pgvector) |
| 05 | [Especificação UI/UX](./05_uiux-spec.md) | Mandala Toroidal, mobile-first PWA, glassmorphism, WebGL+SVG |
| 06 | [Motor de IA (3 camadas)](./06_ai-engine-spec.md) | Determinístico → Grafo → Síntese; Grimório RAG anti-alucinação |
| 07 | [Épicos & User Stories](./07_epics-stories.md) | Backlog B2C por ondas (extração, portal, oráculo, monetização) |
| 08 | [Roadmap](./08_roadmap.md) | Fases: Cirurgia de Extração → Portal B2C → Oráculo Vivo → Escala |
| 09 | [Master Prompt para Agentes](./09_master-agent-prompt.md) | Contexto-mestre B2C para o agente codificador |

### 🔢 Specs Agnósticas (preservadas, reenquadradas)
| # | Documento | Descrição |
|---|-----------|-----------|
| 11 | [Cálculo Determinístico](./11_calculo-deterministico.md) | Fórmulas de Cabalística, Tântrica, Odu — **matemática preservada** |
| 12 | [Agente Oracular Interativo](./12_motor-consulta-qa.md) | Camada 3: consulta com créditos, RAG fechado sobre o Grimório |
| 14 | [Extensibilidade Oracular](./14_extensibilidade-oracular.md) | Contrato para crescer o Grimório e novos sistemas |
| 15 | [Glossário Oracular](./15_glossario-oracular.md) | Significados-base dos Odus e arquétipos (anti-alucinação) |
| 20 | [Governança do Grimório](./20_governanca-conteudo-oracular.md) | Proveniência, ledger `IDEIA.md`, validação por fonte |
| 23 | [Auditoria de Mapas & Geolocalização](./23_auditoria-mapas-geolocalizacao.md) | Completude dos mapas natais, timezone, ephemeris |

### ⚙️ Operação & Qualidade
| # | Documento | Descrição |
|---|-----------|-----------|
| 19 | [Estratégia de Testes & CI](./19_estrategia-testes-qualidade.md) | Testes no monorepo; preservar os ~9k testes na extração |
| 22 | [Observabilidade & Operações](./22_observabilidade-operacao.md) | VPS/Docker/PM2, logs, health, custo de IA/créditos |
| 24 | [Guia de Desenvolvimento com Agentes IA](./24_guia-desenvolvimento-agentes-ia.md) | A Constituição Akasha para agentes |
| 21 | [Registro de Decisões & Roadmap](./21_registro-decisoes-roadmap.md) | Painel de ADRs (AD-25 + legado) |
| AUTH | [AUTH-AUDIT](./AUTH-AUDIT.md) | Auditoria de autenticação (transição Operator → User B2C) |
| — | [MIGRATIONS](./MIGRATIONS.md) | Fluxo de migrations Prisma (+ pgvector) |

### 🗄️ Legado B2B (referência histórica — marcado, não-canônico)
| # | Documento | Por que é legado |
|---|-----------|-----------|
| 10 | [Revisão & Gap Analysis](./10_revisao-gap-analysis.md) | Auditoria da documentação B2B 00–09 |
| 13 | [Identidade Cigano Ramiro](./13_identidade-ramiro-design-v2.md) | Substituído pelo Doc 26 (Akasha) |
| 16 | [Revisão de Arquitetura B2B](./16_revisao-arquitetura-plano-decisoes.md) | ADRs do Cockpit B2B |
| 17 | [Interface Única (Mesa Real)](./17_arquitetura-interface-unica.md) | Página única do Cockpit B2B |
| 18 | [Blueprint Técnico (Mesa Real)](./18_blueprint-tecnico-contratos.md) | Contratos da Mesa Real (`MatrixData`) |
| — | [PROGRESS-fases-21-29](./PROGRESS-fases-21-29.md) | Histórico de fases do Cockpit B2B |
| — | [fallow-duplication-analysis](./fallow-duplication-analysis.md) | Análise de duplicação (código legado) |

---

## Visão Geral

**Sistema Akasha** é um oráculo dinâmico B2C que cruza quatro tradições — **Astrologia** (o Céu), **Numerologia Cabalística** (o Verbo), **Numerologia Tântrica** (os 11 Corpos) e **Odus de Nascimento** (a Terra/Ori) — em uma **Mandala Toroidal** interativa, entregando um **Manifesto Akáshico** (relatório base) e um **Dashboard Diário** com clima energético, ritual e alerta personalizados.

A inteligência opera em **três camadas**: um Motor Determinístico (cálculos exatos via Swiss Ephemeris), um Grafo de Conhecimento (cruzamento de correspondências) e um Agente de Síntese (IA com RAG sobre o **Grimório Digital** — Markdown + pgvector, blindado contra alucinação).

**Stack-alvo:** Monorepo (Turborepo/pnpm) · Next.js 16 + React 19 · `packages/core-*` (engines puros) · PostgreSQL + **pgvector** · Redis · **Ollama** (`nomic-embed-text`) · Prisma 7 · Stripe · WebGL/Three.js + SVG/D3 · PWA mobile-first · `next-intl` · **VPS Linux** (Docker + PM2).

**Patrimônio preservado:** ~9.000 testes da matemática oracular (a matemática dos Odus e da Cabala não muda) — extraídos para `packages/core-*` na Cirurgia de Extração (Doc 25 §11).
