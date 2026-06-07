# Documento 08 — Roadmap de Desenvolvimento
## Sistema Akasha

> **Versão:** 3.0 | **Atualizado:** 2026-06-06 | **Norte:** Doc 25
> Substitui o roadmap B2B (Fundação → Cockpit MVP → Escala), agora legado. Metodologia: ondas incrementais sobre o monorepo. **Onda 3 ✅ concluída (Oráculo Vivo)** e **Onda 4 ✅ concluída (Monetização + Global)** — release v1.0.0-akasha.

---

## Visão Geral das Ondas

```
ONDA 1 — EXTRAÇÃO        ONDA 2 — PORTAL B2C       ONDA 3 — ORÁCULO VIVO     ONDA 4 — ESCALA
(Cirurgia de Extração)   (Fundação Akasha)         (Inteligência + Grimório)  (Monetização + Global)
─────────────────────    ─────────────────────     ──────────────────────     ──────────────────────
✦ Monorepo (Turbo/pnpm)  ✦ apps/b2c-portal         ✦ Grimório (Markdown→       ✦ Stripe: créditos
✦ packages/core-*        ✦ Auth User (B2C)            pgvector via Ollama)      ✦ Agente Oracular
✦ Religar legacy-cockpit ✦ Onboarding ritual       ✦ Motor 3 camadas          ✦ PWA + push
✦ Preservar ~9k testes   ✦ Mandala Toroidal        ✦ Dashboard Diário         ✦ i18n EN (global)
                         ✦ Manifesto (PDF)         ✦ Swiss Ephemeris+Redis    ✦ VPS hardening
─────────────────────    ─────────────────────     ──────────────────────     ──────────────────────
Entregável:              Entregável:               Entregável:                Entregável:
Engines isolados,        Usuário se cadastra,      Oráculo vivo: ritual       Produto comercial
testes verdes            vê sua Mandala e          diário + conversa          B2C escalável e
                         compra o Manifesto        ancorada no Grimório       internacional
```

---

## ONDA 1 — A Cirurgia de Extração (Monorepo)
**Objetivo:** isolar os motores espirituais validados sem quebrar o legado. Esta é a **verdadeira Fase 1** (Doc 25 §11) — não construir UI antes dos motores ("arranha-céu num pântano").

| ID | Tarefa | Prioridade |
|---|---|---|
| 1.1 | Setup Turborepo / pnpm workspaces; TS + Vitest compilando módulos | 🔴 |
| 1.2 | Extrair `packages/core-astrology` (Swiss Ephemeris, casas, planetas, trânsitos) | 🔴 |
| 1.3 | Extrair `packages/core-tantra` (11 Corpos) | 🔴 |
| 1.4 | Extrair `packages/core-cabala` (Caminho de Vida, nome, ciclos) | 🔴 |
| 1.5 | Extrair `packages/core-odus` (Odu de nascimento, Ori) | 🔴 |
| 1.6 | `packages/core-graph` (Grafo de Conhecimento — Camada 2) | 🟡 |
| 1.7 | **Religamento:** `apps/legacy-cockpit` importa de `@akasha/core-*` (retrocompat) | 🔴 |
| 1.8 | Rodar a suíte completa: **os ~9k testes devem permanecer verdes** | 🔴 |

**Milestone Onda 1:** engines agnósticos isolados em `packages/`; legado funcionando via imports; testes verdes. A lógica está blindada.

---

## ONDA 2 — Fundação do Portal B2C (Akasha)
**Objetivo:** o usuário se cadastra, faz o onboarding ritual e vê sua Mandala.

| ID | Tarefa | Prioridade |
|---|---|---|
| 2.1 | `apps/b2c-portal` (Next.js 16 + `next-intl` pt-BR/en) | 🔴 |
| 2.2 | Auth B2C: cadastro/login `User`, verificação de e-mail, OAuth social | 🔴 |
| 2.3 | Schema B2C (User, BirthChart, Subscription, Credits — Doc 04) + migrations | 🔴 |
| 2.4 | Onboarding ritualístico (Coleta Sagrada + Quiz de Ancoragem) | 🔴 |
| 2.5 | Cálculo dos 4 mapas no onboarding (via `packages/core-*`) | 🔴 |
| 2.6 | Mandala Toroidal: WebGL atmosfera (R3F) + SVG/D3 dados + glassmorphism | 🔴 |
| 2.7 | Renderização ritualística (loading mágico) | 🟡 |
| 2.8 | Manifesto Akáshico + export PDF (`@react-pdf/renderer`) | 🔴 |
| 2.9 | Identidade Akasha aplicada (paleta cósmica, tipografia — Doc 26) | 🔴 |

**Milestone Onda 2:** do cadastro à revelação da Mandala base (Freemium) + compra do Manifesto.

**Validação:** cadastrar um usuário-teste e verificar mapas (ex.: Caminho de Vida correto, Sol no signo esperado, Odu regente, 11 corpos).

---

## ONDA 3 — O Oráculo Vivo (Inteligência + Grimório)
**Objetivo:** o hábito diário e a conversa ancorada.

| ID | Tarefa | Prioridade |
|---|---|---|
| 3.1 | Estrutura do Grimório (`grimorio/*.md` + YAML) — 4 bibliotecas | 🔴 |
| 3.2 | Pipeline de ingestão Markdown → embeddings (Ollama) → pgvector | 🔴 |
| 3.3 | Busca híbrida (filtro JSONB + semântico pgvector) | 🔴 |
| 3.4 | Camada 2 (Grafo): cruzamento dos 4 pilares → Ponto de Tensão | 🔴 |
| 3.5 | Camada 3 (Agente de Síntese): System Prompt + RAG → SSE | 🔴 |
| 3.6 | Motor Astrológico Diário: cronjob meia-noite UTC → Redis (SETEX) | 🔴 |
| 3.7 | Dashboard Diário (Clima + Ritual + Alerta) | 🔴 |
| 3.8 | Agente Oracular conversacional (Doc 12) — roteamento por pilares | 🟡 |
| 3.9 | Webhook GitHub `grimoire-sync` + botão admin de reindexação | 🟡 |
| 3.10 | Conteúdo do Grimório: 16 Odus, 11 Corpos, ~50 ervas (curadoria, Doc 20) | 🔴 |

**Milestone Onda 3:** abrir o app de manhã e receber Clima + Ritual + Alerta do dia, com a IA usando 100% dados do Grimório.

---

## ONDA 4 — Monetização & Escala Global
**Objetivo:** transformar em economia interna e expandir.

| ID | Tarefa | Prioridade |
|---|---|---|
| 4.1 | Stripe: assinatura Akasha Pro + Manifesto one-time | 🔴 |
| 4.2 | Motor de Créditos (franquia mensal, débito por consulta, pacotes avulsos) | 🔴 |
| 4.3 | Webhooks Stripe (assinados) → Subscription/Credits | 🔴 |
| 4.4 | PWA (manifest + service worker + prompt de instalação) | 🟡 |
| 4.5 | Notificações (ritual do dia) | 🟢 |
| 4.6 | i18n EN: tradução das bibliotecas do Grimório + persona em inglês | 🟢 |
| 4.7 | Checkout multi-moeda | 🟢 |
| 4.8 | Desligar `apps/legacy-cockpit` quando o portal estiver 100% autônomo | 🟢 |

**Milestone Onda 4:** economia de créditos rodando; PWA instalável; base para expansão anglofone (competir com Gene Keys/Human Design). ✅ Concluído (2026-06-06)

---

## Infraestrutura (transversal a todas as ondas)

| Item | Tarefa |
|---|---|
| VPS Linux | Ubuntu + Docker + PM2 (Doc 25 §10) |
| Contêineres | PostgreSQL+pgvector · Redis · Ollama (`nomic-embed-text`) · App Next.js |
| Cronjobs | Trânsitos diários (madrugada UTC) |
| Backup | PostgreSQL (usuários + vetores do Grimório) |
| Observabilidade | Logs estruturados, health, custo de IA/créditos (Doc 22) |

---

## Critérios de Sucesso (B2C)

1. **Funcional:** do cadastro à Mandala em < 2 min; Dashboard diário gerado todo dia.
2. **Preciso:** mapas natais corretos (validados contra casos conhecidos); rituais 100% do Grimório (zero alucinação).
3. **Vivo:** o conteúdo do dia muda com o céu; nunca repete texto, nunca foge das regras.
4. **Soberano:** embeddings e dados sensíveis nunca saem do VPS.
5. **Retentivo:** o usuário volta de manhã (hábito); converte de Freemium → Manifesto → Akasha Pro.

---

## Dependências Críticas

| Dependência | Risco | Mitigação |
|---|---|---|
| Cirurgia de Extração íntegra | Alta — base de tudo | Religamento + suíte de testes verde antes de avançar |
| Swiss Ephemeris no VPS | Alta — precisão astral | Já validado no legado; cronjob + Redis |
| Ollama no VPS (RAM) | Média | Fallback de embeddings na nuvem (custo irrisório — Doc 25 §5) |
| Curadoria do Grimório | Alta — qualidade do oráculo | Geração em lote assistida + curadoria humana (Doc 20) |
| Tabela data→Odu (D3) | Média | Algoritmo default provisório (Doc 11 §4.1) até a linhagem |
