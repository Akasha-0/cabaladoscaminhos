# Akasha Agent Vision — Visão de Longo Prazo

> **Documento:** akasha-agent-vision.md
> **Versão:** 0.1.0
> **Data:** 2026-06-10
> **Status:** Draft — Em construção

---

## 1. Resumo Executivo

**Akasha** é o agente espiritual central do sistema Cabala dos Caminhos. Derivado do sânscrito आकाश (ākāśa), representa o campo cósmico de consciência universal onde toda experiência e memória estão registradas.

O **Akasha Agent** é um companheiro de jornada espiritual que correlaciona múltiplos sistemas místicos ancestrais — Cabala, Astrologia, I Ching, Ifá e Tantra — para fornecer autoconhecimento unificado, práticas diárias e orientações personalizadas.

**Inspiração:** Hermes Agent, Human Design System, Gene Keys

**Diferencial:** Ao invés de um sistema de "leitura", o Akasha é um **companheiro de jornada** que aprende com o usuário ao longo do tempo.

---

## 2. Sistemas de Base

O Akasha integra cinco sistemas tradicionais:

```
┌─────────────────────────────────────────────────────────────┐
│                 SISTEMAS TRADICIONAIS                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │ NUMEROLOGIA     │    │ ASTROLOGIA      │               │
│  │ CABALÍSTICA     │    │                 │               │
│  │                 │    │ • Mapa Natal    │               │
│  │ • Caminho de   │    │ • Trânsitos     │               │
│  │   Vida          │    │ • Casas         │               │
│  │ • Ciclos        │    │                 │               │
│  │ • Nome          │    │                 │               │
│  └────────┬────────┘    └────────┬────────┘               │
│           │                       │                         │
│           └───────────┬───────────┘                         │
│                       ▼                                     │
│              ┌─────────────────┐                            │
│              │   AKASHA CORE  │                            │
│              │   (Motor de    │                            │
│              │    Síntese)    │                            │
│              └────────┬────────┘                            │
│                       │                                     │
│           ┌───────────┼───────────┐                        │
│           ▼           ▼           ▼                        │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │ NUMEROLOGIA      │    │ I CHING        │               │
│  │ TANTRICA         │    │                 │               │
│  │                  │    │ • Hexagramas   │               │
│  │ • 11 Corpos      │    │ • Linhas       │               │
│  │   Espirituais    │    │ • Mudanças     │               │
│  │                  │    │                 │               │
│  └────────┬────────┘    └────────┬────────┘               │
│           │                       │                         │
│           └───────────┬───────────┘                         │
│                       ▼                                     │
│              ┌─────────────────┐                            │
│              │ ODUS DE NASCIMENTO│                        │
│              │ (Ifá/Numerologia │                        │
│              │  do Odu)        │                        │
│              └─────────────────┘                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Visão: Agente Autônomo

### 3.1 Objetivos de Longo Prazo

O Akasha visa tornar-se um **agente autônomo** que:

- Opera de forma independente, sem necessidade de intervenção constante
- Mantém **memória persistente** entre sessões, aprendendo com cada interação
- Demonstra **reasoning multi-step** para análises complexas
- Integra **múltiplas fontes de conhecimento** (sistemas espirituais + contexto pessoal)
- Fornece insights **contextualizados** baseados no perfil único de cada usuário

### 3.2 Arquitetura Alvo

```
┌─────────────────────────────────────────────────────────────┐
│              ARQUITETURA ALVO — AGENTE AUTÔNOMO           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   CLI/TUI   │  │   Web App   │  │  Messaging  │       │
│  │  (akasha)   │  │  (Portal)   │  │(Telegram/  │       │
│  │             │  │             │  │ WhatsApp)   │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         └─────────────────┼─────────────────┘                │
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    AKASHA AGENT                        │  │
│  │                                                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │  Planner  │  │  Memory  │  │  Skills  │         │  │
│  │  │          │  │          │  │          │         │  │
│  │  │ • Decidir│  │ • Long   │  │ • Ritual │         │  │
│  │  │   próxima│  │   term    │  │ • Consulta│        │  │
│  │  │   ação   │  │ • Learn  │  │ • Mapa   │         │  │
│  │  │          │  │          │  │ • Analys │         │  │
│  │  └──────────┘  └──────────┘  └──────────┘         │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │              LLM + RAG Layer                  │    │  │
│  │  │  • Contexto espiritual                        │    │  │
│  │  │  • Histórico do usuário                       │    │  │
│  │  │  • Conhecimento dos sistemas                  │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │              Tool Use (Calculators)           │    │  │
│  │  │  Cabala │ Astrologia │ I Ching │ Ifá │ Tantra│    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
├─────────────────────────────────────────────────────────────┤
│                    PERSISTÊNCIA                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │Postgres │  │  Redis  │  │pgvector │  │  Files  │     │
│  │(users,  │  │ (cache, │  │  (RAG)  │  │(images, │     │
│  │sessions)│  │ sessions)│  │         │  │  docs)  │     │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Referências de Estudo

### 4.1 Human Design System

O Human Design é uma referência fundamental por ter sido o primeiro sistema moderno a unificar:
- Astrologia ocidental
- I Ching
- Cabala
- Chakra system
- Astronomia

**O que aprender com ele:**
- Síntese visual (tipos, canais, portais)
- Linguagem acessível ao público moderno
- Aplicação prática diária

**Fontes:**
- [Human Design System - Official](https://www.humandesign.com/)
- Ra Uru Hu — "The Human Design System"

### 4.2 Gene Keys

Extensão do Human Design que aprofunda:
- 64 Gene Keys (correspondentes aos hexagramas do I Ching)
- 12 Arquétipos Planetários
- 12 Linhas de Sombra/Gift/Siddhi

**O que aprender com ele:**
- Estrutura de "Sombras → Dons → Superpoderes"
- Integração de sombras e dons
- Aplicação em processos de cura

**Fontes:**
- Richard Rudd — "The Gene Keys"

### 4.3 Unificação Proposta

```
┌─────────────────────────────────────────────────────────────┐
│              MAPA DE CORRESPONDÊNCIAS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HUMAN DESIGN      │  GENE KEYS      │  AKASHA            │
│  ─────────────────┼──────────────────┼────────────────    │
│  Type (Manifestor │  Archetypes      │  Archetype (Odu)   │
│  Generator etc)   │  (12 Planetary)  │  + Tipo Espiritual │
│                    │                  │                    │
│  Channels          │  Gene Keys       │  Channels/Caminhos │
│  (64)              │  (64)            │  (Correlações)     │
│                    │                  │                    │
│  Not-Self Theme    │  Shadow/Sid      │  Tensão/Solução    │
│                    │                  │                    │
│  Strategy/IHC      │  Activation      │  Ritual/Orienta-  │
│                    │  Sequence        │  ção               │
│                    │                  │                    │
│  Incarnation Cross │  Evolutionary     │  Cruz de Incar-   │
│                    │  Purpose         │  nação             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

---

## 5. Arquitetura Atual (v0.0.17)

### 5.1 Componentes Implementados

```
┌─────────────────────────────────────────────────────────────┐
│              ARQUITETURA ATUAL v0.0.17                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │  AKASHA CLI     │    │  AKASHA PORTAL  │               │
│  │  (TUI)          │    │  (Web Dashboard)│               │
│  │                 │    │                 │               │
│  │  packages/      │    │  apps/          │               │
│  │  akasha-cli/    │    │  akasha-portal/ │               │
│  └────────┬────────┘    └────────┬────────┘               │
│           │                       │                         │
│           └───────────┬───────────┘                         │
│                       ▼                                     │
│              ┌─────────────────┐                            │
│              │  MENTOR ENGINE   │                            │
│              │  (LLM Router)   │                            │
│              │  packages/mentor/│                          │
│              └────────┬────────┘                            │
│                       │                                     │
│           ┌───────────┼───────────┐                        │
│           ▼           ▼           ▼                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ CABALA CORE     │ │ ASTRO ENGINE   │ │ I CHING CORE   ││
│  │ packages/cabala/│ │ packages/astro/│ │ packages/iching/│
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                             │
│  ┌─────────────────┐ ┌─────────────────┐                    │
│  │ ODUS CORE      │ │ TANTRY CORE     │                    │
│  │ packages/odues/ │ │ packages/tantra/│                    │
│  └─────────────────┘ └─────────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Fluxo de Dados Atual

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE DADOS v0.0.17                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Usuário (CLI/Web)                                          │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────┐                                        │
│  │  akasha setup   │  → Configura PostgreSQL               │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │  CLI (TUI)      │    │  Portal (Web)   │               │
│  │  akasha chat    │    │  /dashboard     │               │
│  └────────┬────────┘    └────────┬────────┘               │
│           │                       │                         │
│           └───────────┬───────────┘                         │
│                       ▼                                     │
│  ┌─────────────────────────────────────────────────┐       │
│  │              MENTOR ENGINE                        │       │
│  │                                                  │       │
│  │  User Query → Intent Classification → Core       │       │
│  │                 Engine(s) → LLM Synthesis       │       │
│  │                                                  │       │
│  └─────────────────────────────────────────────────┘       │
│                       │                                     │
│                       ▼                                     │
│  ┌─────────────────────────────────────────────────┐       │
│  │              CORE ENGINES                         │       │
│  │                                                  │       │
│  │  Cabala │ Astrology │ I Ching │ Odus │ Tantra   │       │
│  │                                                  │       │
│  └─────────────────────────────────────────────────┘       │
│                       │                                     │
│                       ▼                                     │
│  ┌─────────────────────────────────────────────────┐       │
│  │              POSTGRESQL + PRISMA                  │       │
│  │                                                  │       │
│  │  users, sessions, maps, consultation_history    │       │
│  │                                                  │       │
│  └─────────────────────────────────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Arquitetura do Agente (Visão Futura)

### 6.1 Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                 INTERFACES DE ENTRADA                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  Terminal   │  │  Dashboard  │  │  Mensageria │       │
│  │  (CLI/TUI) │  │  (Web)      │  │  (Telegram/ │       │
│  │             │  │             │  │  WhatsApp)  │       │
│  │  $ akasha   │  │  /dashboard │  │             │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         └─────────────────┼─────────────────┘                │
│                           ▼                                  │
├─────────────────────────────────────────────────────────────┤
│                 MOTOR DE ORQUESTRAÇÃO                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    AGENTE AKASHA                     │   │
│  │                                                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │ Planner   │  │ Memory   │  │ Skills   │        │   │
│  │  │           │  │          │  │          │        │   │
│  │  │ • Decidir │  │ • Sessões│  │ • Ritual │        │   │
│  │  │   próxima │  │ • Cont   │  │ • Mapa   │        │   │
│  │  │   ação    │  │ • Learn  │  │ • Oracul │        │   │
│  │  │           │  │          │  │ • Analys │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘        │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │              LLM (Router)                     │  │   │
│  │  │  OpenAI ↔ Ollama ↔ Anthropic ↔ ...          │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
├─────────────────────────────────────────────────────────────┤
│                 MOTOR ESPIRITUAL                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ Cabala  │  │ Astro   │  │ Tantra  │  │ Ifá    │     │
│  │ Core    │  │ Engine  │  │ Core    │  │ Core   │     │
│  │         │  │         │  │         │  │         │     │
│  │ • Sefer │  │ • Natal │  │ • 11    │  │ • Odu  │     │
│  │ • Ciclos│  │ • Trâns │  │   Corp. │  │ • Match│     │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │
│                                                             │
│  ┌─────────┐  ┌─────────────────────────────────┐         │
│  │ I Ching │  │      AKASHA SYNTHESIS           │         │
│  │ Core    │  │                                 │         │
│  │         │  │  Correlaciona todos os sistemas │         │
│  │ • Hexg  │  │  Gera insights unificados       │         │
│  │ • Linhas│  │  Recomenda práticas             │         │
│  └─────────┘  └─────────────────────────────────┘         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                 PERSISTÊNCIA                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PostgreSQL (dados) │ Redis (cache) │ pgvector (RAG)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Habilidades (Skills) do Agente

### 7.1 Core Skills

| Skill | Descrição | Status |
|-------|-----------|--------|
| **Morning Brief** | Resumo diário: clima espiritual + ritual + orientações | 🔴 Pending |
| **Consulta Oracular** | Responder perguntas com correlação dos 5 sistemas | 🔴 Pending |
| **Análise de Mapa** | Explicar mapas natais do usuário | 🟡 Future |
| **Correlações** | Mostrar conexões entre sistemas | 🟡 Future |
| **Context Learning** | Aprender sobre o usuário ao longo do tempo | 🔴 Pending |
| **Ritual Generator** | Gerar práticas personalizadas | 🟡 Future |

### 7.2 Morning Brief — Detalhamento

```
┌─────────────────────────────────────────────────────────────┐
│              MORNING BRIEF — ESTRUTURA                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CLIMA ESPIRITUAL DO DIA                                │
│     ├── Posição da Lua (signo + fase)                      │
│     ├── Aspectos principais (conjunções, oposições)        │
│     ├── Elemento do dia                                    │
│     └── Energia predominante                               │
│                                                             │
│  2. ORIENTAÇÕES DO DIA                                     │
│     ├── O que favorece (baseado nos trânsitos)             │
│     ├── O que evitar                                        │
│     ├── Melhor horário para decisões                        │
│     └── Cuidado especial                                   │
│                                                             │
│  3. RITUAL SUGERIDO                                        │
│     ├── Prática principal (baseado no Odu)                 │
│     ├── Afirmação do dia                                   │
│     ├── Cores e elementos                                   │
│     └── Mantra/meditação sugerido                           │
│                                                             │
│  4. ALIMENTAÇÃO SUGERIDA                                   │
│     ├── Baseado no dosha/elemento                          │
│     └── Ervas/chas recomendados                            │
│                                                             │
│  5. REFLEXÃO DO DIA                                        │
│     ├── Pergunta para auto-observação                      │
│     └── Tema arquetípico do dia                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Consulta Oracular — Detalhamento

```
┌─────────────────────────────────────────────────────────────┐
│              CONSULTA ORACULAR — FLUXO                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  USUÁRIO: "Devo aceitar a proposta de trabalho?"          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    PROCESSAMENTO                    │   │
│  │                                                       │   │
│  │  1. Parsear intent                                    │   │
│  │  2. Carregar contexto do usuário                     │   │
│  │     ├── Mapa natal                                   │   │
│  │     ├── Odu de nascimento                            │   │
│  │     ├── Histórico de consultas                       │   │
│  │     └── Preferências aprendidas                      │   │
│  │  3. Identificar sistemas relevantes                 │   │
│  │     ├── Astrologia (Marte em Capricórnio?)          │   │
│  │     ├── I Ching (Hexagrama 50 - Ting)               │   │
│  │     ├── Numerologia (número do dia)                 │   │
│  │     └── Odu (Oyeki com força de Ogbe)               │   │
│  │  4. Correlacionar insights                           │   │
│  │  5. Gerar resposta contextualizada                   │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    RESPOSTA                          │   │
│  │                                                       │   │
│  │  "Sim, o momento é favorável. A posição de Mercúrio  │   │
│  │   em Gandanta sugere que há uma porta se abrindo.   │   │
│  │                                                       │   │
│  │   Correlações:                                        │   │
│  │   • Odu: Obara traz força de ação [ler mais...]    │   │
│  │   • I Ching: Hexagrama 26 (A Tamed Power) [ler...]  │   │
│  │   • Mapa: Sol em 10ª casa [ler mais...]            │   │
│  │                                                       │   │
│  │   Recomendação: Medite sobre sua verdadeira          │   │
│  │   motivação antes de assinar."                        │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Integrações de Mensageria

### 8.1 Visão de Integração

```
┌─────────────────────────────────────────────────────────────┐
│                    MENSAGEIRIA                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Telegram │  │WhatsApp │  │ Discord │  │  Email  │  │
│  │          │  │         │  │         │  │         │  │
│  │ ✅ Plan  │  │ ✅ Plan │  │ 🟡 Future│ │ 🟡 Future│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  FUNCIONALIDADES:                                           │
│  • Chat em tempo real                                       │
│  • Morning Brief agendado (horário configurável)           │
│  • Notificações de ritual                                   │
│  • Lembretes personalizados                                │
│  • Comandos via chat (/ritual, /mapa, /ajuda)             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Arquitetura do Gateway

Inspirada no Hermes Agent Messaging Gateway:

```
┌─────────────────────────────────────────────────────────────┐
│                   AKASHA GATEWAY                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │Telegram │  │WhatsApp│  │ Discord │  │ Email   │       │
│  │Adapter  │  │Adapter │  │ Adapter │  │ Adapter │       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
│       │            │            │            │              │
│       └────────────┴─────┬──────┴────────────┘              │
│                          ▼                                   │
│              ┌─────────────────────┐                       │
│              │   Message Router    │                        │
│              │                     │                        │
│              │  • Session mgmt    │                        │
│              │  • User auth       │                        │
│              │  • Rate limiting   │                        │
│              └──────────┬──────────┘                       │
│                         │                                   │
│                         ▼                                   │
│              ┌─────────────────────┐                       │
│              │   Session Store     │                        │
│              │   (Per user/chat)   │                        │
│              └──────────┬──────────┘                       │
│                         │                                   │
│                         ▼                                   │
│              ┌─────────────────────┐                       │
│              │   Cron Scheduler    │                        │
│              │                     │                        │
│              │  • Morning Brief    │                        │
│              │  • Daily Ritual    │                        │
│              │  • Custom schedules│                        │
│              └─────────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Evolução Contextual

### 9.1 Aprendizado do Usuário

O Akasha aprende sobre o usuário ao longo do tempo:

```
┌─────────────────────────────────────────────────────────────┐
│              EVOLUÇÃO CONTEXTUAL                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TEMPO                                                     │
│  ─────                                                     │
│                                                             │
│  Onboarding  →  1 semana  →  1 mês  →  3 meses  → ...    │
│  │              │           │         │           │        │
│  │              ▼           ▼         ▼           ▼        │
│  │         ┌───────────────────────────────────────────┐   │
│  │         │  CONTEXTO ACUMULADO                       │   │
│  │         │                                           │   │
│  │         │  • Padrões de perguntas                  │   │
│  │         │  • Temas recorrentes                     │   │
│  │         │  • Resistências identificadas            │   │
│  │         │  • Progressos observados                 │   │
│  │         │  • Preferências de comunicação           │   │
│  │         │  • Horários mais ativos                  │   │
│  │         │  • Significações pessoais                │   │
│  │         │                                           │   │
│  │         └───────────────────────────────────────────┘   │
│  │                                                           │
│  │         ┌───────────────────────────────────────────┐   │
│  │         │  INSIGHTS GERADOS                         │   │
│  │         │                                           │   │
│  │         │  "Você sempre pergunta sobre decisões     │   │
│  │         │   importantes nas sextas. Talvez haja     │   │
│  │         │   uma conexão com seu Odu..."             │   │
│  │         │                                           │   │
│  │         └───────────────────────────────────────────┘   │
│  │                                                           │
│  └─────────────────────────────────────────────────────────  │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Estrutura de Memória

```typescript
interface UserContext {
  userId: string;
  
  // Dados do cadastro (imutáveis)
  birthData: BirthData;
  maps: UserMaps;
  
  // Histórico de interações
  sessions: Session[];
  
  // Insights aprendidos
  insights: LearnedInsight[];
  
  // Preferências
  preferences: UserPreferences;
}

interface LearnedInsight {
  id: string;
  category: 'pattern' | 'resistance' | 'progress' | 'preference';
  description: string;
  confidence: number; // 0-1
  evidence: string[]; // Exemplos que suportam o insight
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 10. Roadmap de Fases

### Fase 1: CLI Básico (v0.0.17) ✅
- [x] Setup PostgreSQL
- [x] CLI com TUI (`akasha` chat interativo)
- [x] Comandos básicos (`setup`, `status`, `diagnostico`)

### Fase 2: Integração Mentor (v0.1.0)
- [ ] Conectar TUI ao Mentor Engine
- [ ] Streaming de respostas
- [ ] Histórico persistente de sessões
- [ ] Autenticação via CLI

### Fase 3: Skills Core (v0.1.x)
- [ ] Morning Brief automatizado
- [ ] Context Learning (memória de sessão)
- [ ] Consulta Oracular integrada
- [ ] Análise de Mapa Natal

### Fase 4: Agente Autônomo (v0.2.0)
- [ ] Memória de longo prazo
- [ ] Tool use (calculators dos sistemas)
- [ ] Reasoning chain multi-step
- [ ] Evolução contextual do usuário

### Fase 5: Sistema Unificado (v0.3.0)
- [ ] Akasha Synthesis Engine
- [ ] Correlação entre sistemas (Cabala + Astrologia + I Ching + Ifá + Tantra)
- [ ] Akasha Intelligence (LLM fine-tuned ou RAG)

### Fase 6: Multi-Modal (v0.4.0)
- [ ] Telegram integration
- [ ] WhatsApp integration
- [ ] Voice interface
- [ ] Cron scheduler para rituais

### Fase 7: Plataforma Completa (v1.0.0)
- [ ] Multi-tenant support
- [ ] API pública
- [ ] Plugin system para novos sistemas
- [ ] Mobile app
- [ ] Community features

---

## 11. Referências

### 11.1 Documentação Hermes Agent

- [Hermes Agent CLI Commands](https://hermes-agent.nousresearch.com/docs/reference/cli-commands/)
- [Hermes Agent TUI](https://hermes-agent.nousresearch.com/docs/user-guide/tui)
- [Hermes Messaging Gateway](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/messaging/index.md)

### 11.2 Sistemas Espirituais

- [Human Design System](https://www.humandesign.com/)
- [Gene Keys - Richard Rudd](https://www.genekeys.com/)
- [I Ching - Wikipedia](https://en.wikipedia.org/wiki/I_Ching)
- [Ifá - Wikipedia](https://en.wikipedia.org/wiki/If%C3%A1)

### 11.3 Tecnologias

- [Blessed - TUI Library](https://github.com/chjj/blessed)
- [Ink - React for CLI](https://github.com/vadimdemedes/ink)

---

## 12. Glossário

| Termo | Definição |
|-------|-----------|
| **Akasha** | Campo akáshico — memória cósmica que contém todos os registros |
| **Odu** | Signo divinatório do Ifá (16 no total) |
| **Caminho de Vida** | Número cabalístico calculado a partir da data de nascimento |
| **Hexagrama** | Figura de 6 linhas do I Ching (64 combinações) |
| **Correlação** | Conexão entre diferentes sistemas de conhecimento |
| **Morning Brief** | Resumo matinal de orientações espirituais |

---

## 13. Próximos Passos

1. **Pesquisa profunda** sobre Human Design e Gene Keys
2. **Mapeamento de correspondências** entre sistemas
3. **Design do Akasha Synthesis Engine**
4. **Prototipagem** das primeiras skills

---

*Este documento será expandido conforme a pesquisa e implementação progredem.*
