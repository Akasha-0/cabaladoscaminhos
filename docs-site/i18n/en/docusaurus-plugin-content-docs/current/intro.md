---
slug: /
title: Introduction
sidebar_position: 1
description: Welcome to Akasha Portal — orchestrator of 5 Pillars (Kabbalah, Astrology, Tantra, Odu, I Ching) with Mentor AI.
---

# Akasha Portal

**Technical documentation for the orchestrator of 5 esoteric Pillars with Mentor AI.**

Akasha Portal is a TypeScript/Next.js monorepo that integrates five
esoteric traditions into a single platform: **Kabbalah** (numerology),
**Astrology** (Swiss Ephemeris), **Tantra** (kundalini/yoga),
**Odu** (Ifá) and **I Ching** (Chinese oracles). The portal exposes a
PWA-first interface, REST API on Next.js App Router, Mentor AI based on
RAG, and a multidimensional correlation pipeline.

---

## 🎯 The 5 Pillars

| # | Pillar            | Domain                                      | Package                |
|---|-------------------|---------------------------------------------|------------------------|
| 1 | **Kabbalah**      | Kabbalistic numerology, Mispar Hechrachi    | `@akasha/core-cabala`   |
| 2 | **Astrology**     | Natal chart, transits, Swiss Ephemeris       | `@akasha/core-astrology`|
| 3 | **Tantra**        | 11 bodies, 5 koshas, 4 temperaments          | `@akasha/core-tantra`   |
| 4 | **Odu (Ifá)**     | 15 canonical Odus, terreiro ethics            | `@akasha/core-odus`     |
| 5 | **I Ching**       | 64 King Wen hexagrams                         | `@akasha/core-iching`   |

Each pillar is an **independent pnpm package** with its own tests.
`@akasha/core` orchestrates the five, doing **lazy import** for
graceful degradation (F-200).

## 🧠 Mentor AI

Mentor is a **RAG (Retrieval-Augmented Generation)** assistant with:

- Cross-Pillar correlation pipeline
- Authority system (F-227) that calibrates confidence by source
- **MCP** (Model Context Protocol) integration for external tools
- Intent classification via router

## 🏗️ Architecture (overview)

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
  │ kabbalah│  │ast. │  │tant.│  │odus │  │ich. │
  └─────────┘  └─────┘  └─────┘  └─────┘  └─────┘
                          (5 Pillars)
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
# Edit .env with DATABASE_URL, SUPABASE_*, etc.

# Dev server
pnpm dev:portal          # http://localhost:3000
pnpm docs:dev            # this documentation → http://localhost:3001
```

> **Prerequisites**: Node.js ≥ 20, pnpm ≥ 9, PostgreSQL 15+ (or Supabase).

## 📚 Documentation structure

- **[Getting Started](./getting-started)** — clone, install, env, dev
- **[Architecture](./architecture/intro)** — 5 Pillars, AkashaLayout, MCP, RAG
- **[API Reference](./api/intro)** — REST endpoints, authentication
- **[Contributing](./contributing/intro)** — dev setup, tests, deploy

## 📐 Design principles

1. **PT-BR first** — i18n default `pt-BR`, EN summary
2. **Privacy-first** — no external tracking, data on own Supabase
3. **PWA-first** — works offline (F-228), share target (F-240)
4. **Determinism** — esoteric calculations are pure, no RNG outside yoga/meditation
5. **Esoteric ethics** — Pillar 4 (Odu) requires consent + terreiro

## 📜 License

MIT © Akasha-0 contributors.

---

> **Next step**: [Getting Started →](./getting-started)
