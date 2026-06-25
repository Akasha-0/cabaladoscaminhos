---
slug: /
title: Introdução
sidebar_position: 1
description: Bem-vindo ao Akasha Portal — orquestrador de 5 Pilares (Cabala, Astrologia, Tantra, Odu, I Ching) com Mentor AI.
---

# Akasha Portal

**Documentação técnica do orquestrador de 5 Pilares esotéricos com Mentor AI.**

Akasha Portal é um monorepo TypeScript/Next.js que integra cinco tradições
esotéricas em uma plataforma única: **Cabala** (numerologia), **Astrologia**
(Swiss Ephemeris), **Tantra** (kundalini/yoga), **Odu** (Ifá) e **I Ching**
(oráculos chineses). O portal expõe uma interface PWA-first, API REST em
Next.js App Router, Mentor AI baseado em RAG, e um pipeline de correlação
multidimensional.

---

## 🎯 Os 5 Pilares

| # | Pilar            | Domínio                                  | Package                |
|---|------------------|------------------------------------------|------------------------|
| 1 | **Cabala**       | Numerologia cabalística, Mispar Hechrachi | `@akasha/core-cabala`   |
| 2 | **Astrologia**   | Mapa natal, trânsitos, Swiss Ephemeris    | `@akasha/core-astrology`|
| 3 | **Tantra**       | 11 corpos, 5 koshas, 4 temperamentos      | `@akasha/core-tantra`   |
| 4 | **Odu (Ifá)**    | 15 Odus canônicos, ética terreiro         | `@akasha/core-odus`     |
| 5 | **I Ching**      | 64 hexagramas King Wen                    | `@akasha/core-iching`   |

Cada pilar é um **package pnpm independente** com testes próprios. O
`@akasha/core` orquestra os cinco, fazendo **lazy import** para
degradação graciosa (F-200).

## 🧠 Mentor AI

O Mentor é um assistente baseado em **RAG (Retrieval-Augmented Generation)** com:

- Pipeline de correlação entre os 5 Pilares
- Sistema de autoridade (F-227) que calibra confiança por fonte
- Integração **MCP** (Model Context Protocol) para tools externas
- Intenção classificada por intent router

## 🏗️ Arquitetura (visão geral)

```
┌────────────────────────────────────────────────────────────┐
│                     Akasha Portal (PWA)                    │
│  apps/akasha-portal/  — Next.js 16 App Router + i18n      │
└────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  ┌───────────┐       ┌───────────┐       ┌───────────┐
  │  Core     │       │  Mentor   │       │   CLI     │
  │ @akasha/  │       │ @akasha/  │       │ @akasha/  │
  │   core    │◄─────►│  mentor   │       │    cli    │
  └───────────┘       └───────────┘       └───────────┘
        │                   │                   │
        ▼                   ▼                   ▼
  ┌─────────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
  │ core-   │  │core-│  │core-│  │core-│  │core-│
  │ cabala  │  │ast. │  │tant.│  │odus │  │ich. │
  └─────────┘  └─────┘  └─────┘  └─────┘  └─────┘
                          (5 Pilares)
```

## 🚀 Quick start

```bash
# Clone
git clone https://github.com/Akasha-0/cabaladoscaminhos.git
cd cabaladoscaminhos

# Install
pnpm install

# Env
cp .env.example .env
# Edite .env com DATABASE_URL, SUPABASE_*, etc.

# Dev server
pnpm dev:portal          # http://localhost:3000
pnpm docs:dev            # esta documentação → http://localhost:3001
```

> **Pré-requisitos**: Node.js ≥ 20, pnpm ≥ 9, PostgreSQL 15+ (ou Supabase).

## 📚 Estrutura da documentação

- **[Getting Started](./getting-started)** — clone, install, env, dev
- **[Arquitetura](./architecture/intro)** — 5 Pilares, AkashaLayout, MCP, RAG
- **[Referência da API](./api/intro)** — endpoints REST, autenticação
- **[Contribuindo](./contributing/intro)** — dev setup, testes, deploy

## 📐 Princípios de design

1. **PT-BR primeiro** — i18n com default `pt-BR`, EN summary
2. **Privacy-first** — sem rastreamento externo, dados em Supabase próprio
3. **PWA-first** — funciona offline (F-228), share target (F-240)
4. **Determinismo** — cálculos esotéricos são puros, sem RNG fora de yoga/meditação
5. **Ética esotérica** — Pilar 4 (Odu) requer consentimento + terreiro

## 📜 Licença

MIT © Akasha-0 contributors.

---

> **Próximo passo**: [Getting Started →](./getting-started)
