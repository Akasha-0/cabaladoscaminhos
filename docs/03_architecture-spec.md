# Documento 03 — Arquitetura Técnica
## Sistema Akasha · Matriz Cabala dos Caminhos

> **Versão:** 2.0 | **Padrão:** Monorepo (engines puros + apps) · VPS Linux soberano
> **Norte:** Doc 25 (Visão Akasha). Arquitetura canônica do Sistema Akasha.

---

## 1. Visão Geral da Arquitetura

O sistema é um **monorepo** (Turborepo / pnpm workspaces) que separa **motores espirituais agnósticos** (`packages/core-*`) das **aplicações** (`apps/*`). A inteligência opera em **três camadas** (Determinístico → Grafo → Síntese) e roda em um **VPS Linux soberano** (Docker + PM2), com Ollama local para embeddings e Redis para o céu do dia.

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLIENTE (Mobile-first PWA)                    │
│   Mandala Toroidal (WebGL atmosfera + SVG/D3 dados + glass)       │
│   Onboarding · Dashboard Diário · Manifesto · Agente Oracular     │
└────────────────────────────┬─────────────────────────────────────┘
                             │  HTTP / SSE
┌────────────────────────────▼─────────────────────────────────────┐
│              apps/b2c-portal  (Next.js 16 · next-intl)            │
│   Rotas: /onboarding /mandala /diario /manifesto /oraculo /conta  │
│   API: /api/{chart,daily,manifesto,consult,stripe,grimoire-sync}  │
└──────┬───────────────────────┬───────────────────┬───────────────┘
       │                       │                   │
┌──────▼──────────┐  ┌─────────▼──────────┐ ┌──────▼──────────────┐
│ CAMADA 1        │  │ CAMADA 2           │ │ CAMADA 3            │
│ Motor Determ.   │  │ Grafo de           │ │ Agente de Síntese   │
│ packages/core-* │  │ Conhecimento       │ │ (IA + RAG)          │
│ Swiss Ephemeris │  │ (cruzamento de     │ │ Busca híbrida no    │
│ Cabala/Tantra/  │  │  correspondências) │ │ Grimório → LLM      │
│ Odus → JSON     │  │                    │ │                     │
└──────┬──────────┘  └─────────┬──────────┘ └──────┬──────────────┘
       │                       │                   │
┌──────▼──────┐  ┌─────────────▼─────┐  ┌──────────▼──────┐  ┌──────────┐
│ PostgreSQL  │  │ Redis             │  │ Ollama          │  │ LLM API  │
│ + pgvector  │  │ (céu do dia,      │  │ nomic-embed-    │  │ (OpenAI/ │
│ (users,     │  │  cache, créditos) │  │ text (embeddings│  │ Gemini)  │
│  grimório)  │  │                   │  │ localhost:11434)│  │ síntese  │
└─────────────┘  └───────────────────┘  └─────────────────┘  └──────────┘
```

---

## 2. Estrutura do Monorepo

```
cabaladoscaminhos/                 # monorepo (Turborepo / pnpm workspaces)
├── packages/
│   ├── core-astrology/            # Swiss Ephemeris, casas, planetas, trânsitos
│   ├── core-tantra/               # 11 Corpos Espirituais
│   ├── core-cabala/               # Caminho de Vida, nome, ciclos
│   ├── core-odus/                 # Odu de nascimento, Ori, Orixás
│   ├── core-graph/                # Grafo de Conhecimento (cruzamento)
│   └── grimoire/                  # ingestão Markdown→pgvector, busca híbrida
├── apps/
│   └── b2c-portal/                # ⭐ Next.js 16 — o Akasha (Mandala, onboarding…)
├── grimorio/                      # 📚 conteúdo Markdown + YAML (as 4 bibliotecas)
│   ├── botanica/  ├── vibracional/  ├── ancestral/  └── diagnostico/
├── prisma/                        # schema + migrations (compartilhado)
├── turbo.json
└── pnpm-workspace.yaml
```

### 2.1 Os pacotes `core-*` são agnósticos
Não conhecem React, HTTP, botão ou CSS. **Recebem dados, fazem a matemática pesada, devolvem JSON.** São cobertos pelos ~9.000 testes preservados (a matemática não muda). Exemplo de contrato:

```ts
// @akasha/core-astrology
calcularMapaNatal(input: { data: Date; hora: string; lat: number; lng: number; tz: string }): MapaAstral
calcularTransitos(dia: Date): Transitos   // usado pelo cronjob de madrugada
```

---

## 3. Tech Stack Definitivo

### Frontend (`apps/b2c-portal`)
| Tecnologia | Versão | Justificativa |
|---|---|---|
| Next.js | **16** (App Router, Turbopack) | SSR, Server Actions, PWA |
| React | **19** | Base |
| TypeScript | 5+ (strict) | Tipagem completa |
| `next-intl` | latest | i18n desde o dia zero (pt-BR/en) |
| Tailwind CSS | **v4** (`@theme`) | Tokens da paleta cósmica (Doc 26) |
| Three.js / React Three Fiber | latest | Camada de atmosfera (Toroide WebGL) |
| D3.js | latest | Geometria da Mandala (coordenadas polares) — sob o capô |
| SVG + Framer Motion / GSAP | latest | Mandala interativa, glassmorphism, animações |
| Zustand | 5+ | Estado de UI |
| React Hook Form + Zod | latest | Onboarding e formulários |

### Backend / Engines
| Tecnologia | Versão | Justificativa |
|---|---|---|
| `packages/core-*` (TS puro) | — | Motores determinísticos agnósticos |
| Swiss Ephemeris (`swisseph`) | — | Padrão-ouro de precisão astrológica (local, soberano) |
| Prisma ORM | **7** | Type-safe; datasource em `prisma.config.ts` + adapter `pg` |
| PostgreSQL + **pgvector** | 16+ | Usuários, cache de relatórios, vetores do Grimório |
| Redis | 7+ | Céu do dia, cache, saldo de créditos |
| **Ollama** (`nomic-embed-text`) | — | Embeddings locais soberanos (`localhost:11434`) |
| LLM (OpenAI / Gemini SDK) | — | Camada 3 (síntese) e fallback de embeddings |
| JWT (`jsonwebtoken`) + bcrypt | — | Sessão do `User` B2C |
| Stripe | — | Assinaturas, Manifesto one-time, créditos |
| `@react-pdf/renderer` | — | Manifesto em PDF (vetorial, zero RAM gráfica) |

### Infraestrutura (VPS Linux — Doc 25 §10)
| Componente | Papel |
|---|---|
| Ubuntu + Docker + PM2 | Orquestração e processos persistentes |
| Contêiner: PostgreSQL+pgvector | Dados + vetores |
| Contêiner: Redis | Memória rápida |
| Contêiner: Ollama | Embeddings blindados |
| Processo PM2: Next.js + cronjobs | App + motor astrológico diário |

> **Vercel/serverless descartado:** timeouts e impossibilidade de embutir Ollama/cronjobs (Doc 25 §10).

---

## 4. Fluxos de Dados (End-to-End)

### Fluxo A — Onboarding → 4 Mapas
```
[Coleta Sagrada + Quiz] → [POST /api/chart]
   → core-cabala.calcular(nome, data)
   → core-tantra.calcular(data)         (11 corpos)
   → core-astrology.calcularMapaNatal(data, hora, lat, lng, tz)   (Swiss Ephemeris)
   → core-odus.calcular(data)           (Ori, Orixás)
→ Prisma: persiste User.birthChart (JSON, cacheado)
→ Renderização da Mandala (SVG/D3 + WebGL)
```

### Fluxo B — Dashboard Diário (3 camadas)
```
[Cronjob 00:00 UTC] core-astrology.calcularTransitos(hoje)
   → Redis SETEX transitos_diarios:AAAA-MM-DD 86400 {...}

[Usuário abre o app 07:00]
→ busca mapa natal (PostgreSQL) + céu de hoje (Redis, ms)
→ core-graph cruza geometrias → Ponto de Tensão (Camada 2)
→ grimoire.buscaHibrida(metadata JSONB + pgvector) → fragmentos
→ Agente IA (Camada 3) sintetiza Clima + Ritual + Alerta (SSE)
```

### Fluxo C — Sincronização do Grimório
```
[git push de novo ritual .md na main]
→ GitHub Webhook (POST assinado) → /api/grimoire-sync
→ verifica assinatura → npm run grimoire:sync
→ git pull → lê YAML+Markdown → Ollama gera embeddings (localhost)
→ UPSERT em pgvector (tabela grimorio)
   (botão "Sincronizar Grimório" no admin engatilha a mesma rota)
```

---

## 5. Variáveis de Ambiente (`.env.example`)

```env
# Banco
DATABASE_URL="postgresql://user:pass@localhost:5432/akasha"
# (pgvector habilitado: CREATE EXTENSION vector;)

# Redis
REDIS_URL="redis://localhost:6379"

# Embeddings locais (Ollama)
OLLAMA_URL="http://localhost:11434"
EMBEDDING_MODEL="nomic-embed-text"
# Fallback de embeddings/síntese na nuvem (opcional)
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="..."
SYNTHESIS_MODEL="gpt-4o"          # Camada 3 (Agente de Síntese)

# Auth (User B2C)
JWT_SECRET="..."

# Stripe (assinatura + Manifesto + créditos)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Grimório sync (webhook do GitHub)
GITHUB_WEBHOOK_SECRET="..."

# Geolocalização (onboarding)
NOMINATIM_URL="https://nominatim.openstreetmap.org"

# i18n
DEFAULT_LOCALE="pt-BR"

NODE_ENV="development"
```

---

## 6. Decisões de Arquitetura

### Por que monorepo?
Isola a lógica espiritual validada (~9k testes) em `packages/core-*` agnósticos, permitindo construir o `b2c-portal` do zero sem acoplar a camadas legadas. Os engines permanecem a única fonte da verdade do cálculo espiritual (Doc 25 §11).

### Por que três camadas de IA?
IA pura alucina rituais e erra cálculos; matriz fixa gera texto robótico. Separar Determinístico (precisão) + Grafo (cruzamento) + Síntese (fluidez com RAG) é o que torna o Akasha impecável (Doc 06).

### Por que pgvector + Ollama local (e não Pinecone/Neo4j)?
Soberania de dados, latência zero, custo fixo. O conhecimento do Grimório nunca trafega na internet pública. Neo4j é pesado (JVM); Pinecone/Weaviate adicionam dependência cloud e custo recorrente (Doc 25 §5).

### Por que Swiss Ephemeris + Redis?
Precisão de padrão-ouro (local) + "Calcule Uma Vez, Sirva Infinitamente": o céu é o mesmo para todos num instante; calcular uma vez por dia e cachear no Redis elimina recomputação e custo (Doc 25 §10).

### Por que VPS e não serverless?
Ollama e cronjobs de madrugada são incompatíveis com funções serverless (timeout, sem processos persistentes). VPS Linux com Docker+PM2 dá controle total e custo previsível.

### Por que `@react-pdf/renderer` e não Puppeteer?
Puppeteer/headless Chrome consome RAM gráfica absurda no VPS (pode derrubar DB/IA). `@react-pdf/renderer` compila PDF vetorial no backend com texto selecionável e quase zero RAM (Doc 25 §3).

---

## 7. Verificação de Arquitetura

> **Nota:** Para um índice centralizado de todo o projeto, consulte [CONTEXT.md](../CONTEXT.md)

### Violações Detectadas

#### V001: domain/ importando de interface/ (T9)
- **Arquivo:** `apps/akasha-portal/src/lib/domain/tarot/spread-calculator.ts:12`
- **Import problemático:** `import type { SpiritualCorrelations } from '@/lib/interface/api/spiritual-correlations'`
- **Regra violada:** `src/lib/domain/` não deve importar de `src/lib/interface/`
- **Recomendação:** Mover o tipo `SpiritualCorrelations` para `src/lib/domain/types/` ou `src/lib/shared/` para manter a independência da camada domain
