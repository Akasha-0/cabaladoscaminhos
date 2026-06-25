---
slug: /architecture/intro
title: Arquitetura — Introdução
sidebar_position: 1
description: Visão geral da arquitetura do Akasha Portal — 5 Pilares, AkashaLayout, MCP e RAG.
---

# Arquitetura

> **🚧 Em construção** — esta seção será populada pela **Wave 15.2**.

A arquitetura do Akasha Portal será detalhada aqui, cobrindo:

- **Os 5 Pilares** — Cabala, Astrologia, Tantra, Odu, I Ching — e como o
  `@akasha/core` orquestra o cálculo e a correlação.
- **AkashaLayout** — shell do portal, navegação contextual, e estado
  de leitura atual.
- **Integração MCP** — Model Context Protocol para tools externas
  (calendário, geolocalização, bases esotéricas).
- **Pipeline RAG** — Retrieval-Augmented Generation do Mentor AI.
- **Diagrama de componentes** — renderizado via Mermaid.

## Diagramas (preview)

```mermaid
graph LR
  A[AkashaInput] --> B[AkashaCore]
  B --> C1[Cabala]
  B --> C2[Astrologia]
  B --> C3[Tantra]
  B --> C4[Odu]
  B --> C5[I Ching]
  B --> D[AkashaLeitura]
  D --> E[Mentor AI]
  E --> F[Authority Score]
```

Veja a página completa em breve.
