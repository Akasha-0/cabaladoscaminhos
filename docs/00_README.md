# Cabala dos Caminhos — Documentação Oficial do Projeto

> **Versão:** 1.1.0 | **Última atualização:** 2026-06-03
> **Proprietário:** Gabriel (Operador e Desenvolvedor)
> **Status:** Desenvolvimento Ativo — Fase 52 | Cockpit B2B operacional | MVP funcional

---

## Índice de Documentos

| # | Documento | Descrição |
|---|-----------|-----------|
| 01 | [Product Brief](./01_product-brief.md) | Visão, proposta de valor, público-alvo e contexto estratégico |
| 02 | [PRD — Product Requirements Document](./02_prd.md) | Módulos, funcionalidades, regras de negócio e critérios de aceitação ⚠️ LEGADO B2C |
| 03 | [Arquitetura Técnica](./03_architecture-spec.md) | Stack, infraestrutura, fluxo de dados e integrações externas ⚠️ SUPERSEDED (usar Doc 16) |
| 04 | [Modelo de Dados](./04_data-model.md) | Prisma Schema, estruturas JSON, payloads de API |
| 05 | [Especificação UI/UX](./05_uiux-spec.md) | Design system, layout, componentes e comportamento da interface ⚠️ SUPERSEDED (usar Doc 17) |
| 06 | [Motor de IA & Matriz de Correlação](./06_ai-engine-spec.md) | Prompt engineering, cadeia de raciocínio e mapeamento das 36 casas |
| 07 | [Épicos & User Stories](./07_epics-stories.md) | Backlog estruturado com critérios de aceitação técnicos ⚠️ LEGADO B2C |
| 08 | [Roadmap](./08_roadmap.md) | Fases de desenvolvimento, milestones e entregáveis |
| 09 | [Master Prompt para Agentes](./09_master-agent-prompt.md) | Contexto-mestre para o agente orquestrador/codificador |
| 10 | [Revisão & Gap Analysis](./10_revisao-gap-analysis.md) | Auditoria de prontidão mecânica da documentação 00–09 |
| 11 | [Cálculo Determinístico](./11_calculo-deterministico.md) | Tabelas alfanuméricas, fórmulas, números mestres, data→Odu |
| 12 | [Motor de Consulta Interativa (Q&A)](./12_motor-consulta-qa.md) | Roteador de temas, RAG fechado, persona e API de consulta |
| 13 | [Identidade Ramiro & Design System v2](./13_identidade-ramiro-design-v2.md) | Consagração ao Cigano Ramiro, paleta laranja+azul royal (canônica) |
| 14 | [Extensibilidade Oracular](./14_extensibilidade-oracular.md) | Contrato de plugin para I-Ching e novos sistemas |
| 15 | [Glossário Oracular Canônico](./15_glossario-oracular.md) | Significados-base das 36 cartas e 16 Odus (anti-alucinação) |
| 16 | [Revisão de Arquitetura & Plano de Decisões](./16_revisao-arquitetura-plano-decisoes.md) | Auditoria Visão × Implementação; ADRs de features e UI/UX; plano priorizado |
| 17 | [Arquitetura da Interface Única (Mesa Real)](./17_arquitetura-interface-unica.md) | A visão "uma só página": 36 casas em cards + Odus + 4 entradas natais; poda de componentes; camadas de inteligência |
| 18 | [Blueprint Técnico & Contratos](./18_blueprint-tecnico-contratos.md) | Contratos de dados/estado/API: `MatrixData` canônico, store Zustand, máquina de estados, sequências, decisões AD-18 |
| 19 | [Estratégia de Testes, Qualidade & CI](./19_estrategia-testes-qualidade.md) | Partição core/legado (Vitest projects), pirâmide de testes, testes-guardião de determinismo, gate de CI, orçamento de performance |
| 20 | [Governança de Conteúdo Oracular & Motor de Inteligência](./20_governanca-conteudo-oracular.md) | Proveniência das correspondências, ledger `IDEIA.md`, validação por fonte, crescimento governado das camadas de inteligência (AD-17.7) |
| 21 | [Registro de Decisões (ADR Index) & Roadmap](./21_registro-decisoes-roadmap.md) | Painel único de todas as decisões AD-16…AD-20 com status e ordem de execução; roadmap consolidado em ondas |
| 22 | [Observabilidade & Operações](./22_observabilidade-operacao.md) | Métricas, logs, health endpoints, runbook de incidentes |
| 23 | [Auditoria de Mapas & Geolocalização](./23_auditoria-mapas-geolocalizacao.md) | Auditoria de completeness dos 4 mapas, timezone, ephemeris |
| 24 | [Guia de Desenvolvimento com Agentes IA](./24_guia-desenvolvimento-agentes-ia.md) | Como usar agentes IA para desenvolver este projeto |
| AUTH | [AUTH-AUDIT.md](../AUTH-AUDIT.md) | Auditoria completa de todos os fluxos de autenticação |

---

## Visão Geral

Sistema de consultoria oracular B2B para terapeutas. Cockpit operacional com Mesa Real (36 casas), motores de cálculo, geração de dossiê com IA, e consulta interativa.

**Stack:** Next.js 16 + React 19 + Prisma 7 + PostgreSQL + Redis + MiniMax API

**Status atual:** 1832 testes · TypeScript 0 erros · build 118 páginas · quality score ≥ 81%
