# Akasha v0.0.11 — Agente Mentor Espiritual (Akáshico)

> **Versão:** 0.0.11
> **Status:** Proposta
> **Sucessor de:** `akasha-v0.0.10`
> **Foco:** Primeiro agente mentor espiritual unificado (CLI + Web)
> **Nome interno:** Akáshico

---

## Why

O produto Akasha tem 4 mapas validados (Numerologia Cabalística, Odu de Nascimento, Astrologia, Numerologia Tântrica) mas falta um **oráculo vivo** que:

1. Responda perguntas dos usuários baseadas nos seus mapas
2. Faça **correlação cruzada** entre tradições
3. Permita exploração via **CLI** (terminal) e **Web** (interface)
4. Mantenha **memória persistente** das jornadas

Concorrentes como Gene Keys e Human Design já fazem isso com uma única tradição. O Akasha pode fazer melhor com **4 tradições unificadas**.

---

## What Changes

### Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                     USUÁRIO                                 │
│         (CLI Ink)  ←→  (Web React)                        │
└────────────────────┬──────────────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────────────┐
│              CAMADA DE INTERFACE                           │
│  akasha chat (CLI)  │  /oraculo (Web)                     │
└────────────────────┬──────────────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────────────┐
│              CAMADA DE APLICAÇÃO                           │
│  packages/mentor/                                          │
│  ├── cli/          — Ink CLI (akasha chat)                │
│  ├── web/          — React components (/oraculo)           │
│  └── api/          — Routes (pergunta → resposta)          │
└────────────────────┬──────────────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────────────┐
│              CAMADA DE DOMÍNIO                             │
│  ├── mentor.ts      — Orquestador do agente                │
│  ├── correlation.ts — DeepCorrelationEngine wrapper        │
│  ├── maps.ts        — Acesso aos 4 mapas do usuário        │
│  └── memory.ts      — Swarm-memory wrapper                 │
└────────────────────┬──────────────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────────────┐
│              CAMADA DE INFRAESTRUTURA                      │
│  LLM Router (OpenAI + Ollama fallback)                    │
│  Prisma (messages, users)                                  │
│  Rate Limiter (10 msg/min)                                 │
└─────────────────────────────────────────────────────────────┘
```

### 4 Mapas do Usuário

| Mapa | Fonte | Status |
|------|-------|--------|
| Numerologia Cabalística | `packages/core-cabala` | ✅ Pronto |
| Odu de Nascimento | `packages/core-odus` | ✅ Pronto |
| Astrologia | `packages/core-astrology` | ✅ Pronto |
| Numerologia Tântrica | `packages/core-tantra` | ✅ Pronto |

> **Excluído:** I Ching (Hexagramas) — futuro v0.0.12+

### Interfaces

#### CLI (Terminal)

```bash
$ akasha --help
akasha - Mentor Espiritual Akáshico

Comandos:
  akasha chat          Inicia conversa interativa
  akasha dev           Inicia dev server do portal
  akasha test          Roda testes
  akasha build         Build do portal
  akasha db:studio     Prisma Studio
  akasha --help        Mostra ajuda

$ akasha chat
🔮 Bem-vindo ao Akáshico, seu mentor espiritual.
📧 Login: user@email.com
⏳ Carregando seus mapas...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SEUS MAPAS:
• Caminho de Vida: 7 (Investigação)
• Odu Regente: Ogbe
• Sol: Peixes
• Corpo Tântrico: mental (Manas)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Akáshico: Olá! Sou seu guia Akáshico. Conheço suas quatro
dimensões e posso ajudá-lo a compreender como elas se
conectam. Como posso servir?

> vim me ajudar a entender minha relação com o trabalho
Akáshico: [resposta streaming]
```

#### Web (Interface)

- **Rota:** Extensão de `/oraculo` existente
- **Componentes:** Chat box, histórico, cards de mapas mencionados
- **Streaming:** SSE token-by-token
- **Cancelamento:** Botão "parar" durante resposta

### Fluxo de Resposta

```
1. Usuário pergunta (CLI ou Web)
2. Autenticação (JWT)
3. Verificar: usuário logado? → Não → redireciona login
4. Verificar: mapas calculados? → Não → redireciona onboarding
5. Verificar: credits ≥ 1? → Não → mostra "sem credits"
6. Verificar: rate limit (10/min)? → Não → "aguarde"
7. Carregar mapas do usuário (4 mapas)
8. Buscar histórico da sessão (últimas 10 mensagens)
9. DeepCorrelationEngine (correlações cruzadas)
10. LLM Router → OpenAI (fallback Ollama)
11. Streaming SSE → UI
12. Salvar mensagem → Prisma (messages)
13. Descontar 1 credit
```

### Persona

- **Nome:** Akáshico
- **Tom:** Guia experiencial, ritualístico
- **Linguagem:** Usa metáforas dos mapas
- **Exemplo:** "Quando Ogbe encontra o Caminho de Vida 7..."

### Prompt do Sistema

- **Localização:** `grimoire/mentor/system-prompt.md`
- **Editável:** Sim (versionável, curável)
- **Versão inicial:** minimal, expande com feedback

### Persistence

| Dado | Armazenamento |
|------|--------------|
| Mensagens | Prisma (`messages` table) |
| Memória cross-sessão | Swarm-memory → Prisma |
| Sessão atual | In-memory (últimas 10 msgs) |

### Custo

| Ação | Custo |
|------|-------|
| 1 pergunta | 1 credit |
| Mínimo para usar | 1 credit |
| Rate limit | 10 msg/min |

### Testes

- **Cobertura:** Integração (fluxo completo)
- **Localização:** `tests/integration/mentor/`
- **Cenários:**
  - Pergunta → mapas → resposta
  - Rate limit
  - Sem credits
  - Sem login
  - Sem mapas

---

## Impact

### Novos arquivos

```
packages/mentor/
├── src/
│   ├── index.ts
│   ├── mentor.ts              # Orquestador principal
│   ├── types.ts               # Tipos do mentor
│   ├── maps.ts                # Acesso aos 4 mapas
│   ├── correlation.ts         # Wrapper DeepCorrelationEngine
│   ├── memory.ts              # Wrapper swarm-memory
│   ├── cli/
│   │   ├── index.ts           # Entry point Ink
│   │   ├── chat.ts            # REPL interativo
│   │   └── login.ts           # Login via CLI
│   ├── web/
│   │   ├── MentorChat.tsx     # Componente React
│   │   └── MentorPage.tsx     # Página /oraculo
│   └── api/
│       ├── ask/route.ts       # POST pergunta
│       └── history/route.ts   # GET histórico
├── package.json
├── tsconfig.json
└── README.md

grimoire/mentor/
├── system-prompt.md            # Prompt do agente

apps/akasha-portal/
├── src/app/api/mentor/
│   ├── ask/route.ts           # Endpoint principal
│   └── history/route.ts       # Histórico
└── src/lib/application/mentor/
    ├── llm-router.ts          # OpenAI + Ollama
    └── rate-limit.ts          # 10/min
```

### Modificações

| Arquivo | Mudança |
|---------|---------|
| `package.json` (raiz) | Adicionar `akasha` CLI script |
| `packages/mentor/package.json` | Workspace dependência |
| `pnpm-workspace.yaml` | Incluir `packages/mentor` |
| `apps/akasha-portal/src/app/(akasha)/oraculo/page.tsx` | Integrar MentorChat |
| Prisma schema | Adicionar `Message` model |
| `apps/akasha-portal/src/middleware/rateLimit.ts` | 10 msg/min |

### Non-Goals

- ❌ I Ching (Hexagramas) — futuro
- ❌ RAG completo — stub v0.0.10
- ❌ Multi-idioma — PT-BR só
- ❌ Histórico completo — só sessão atual
- ❌ Microserviço — monolito
- ❌ Dashboard admin de analytics — logs no console

---

## Critérios de Sucesso

1. **`akasha chat`** — CLI abre, usuário faz login, ve mapas, faz pergunta
2. **`/oraculo`** — Web abre chat, pergunta retorna com streaming
3. **`pnpm test:run`** — testes de integração passam
4. **1 credit** descontado por pergunta
5. **Rate limit** bloqueia após 10 msg/min
6. **DeepCorrelationEngine** retorna correlações entre mapas
7. **Memória** persiste entre sessões (Prisma)

---

## Release

| Item | Detalhe |
|------|---------|
| Canal | Beta selado (usuários selecionados) |
| Primeiro commit | CLI básico → Web → Correlação → Memory |

---

## Dependências

| Dependência | Status | Ação |
|-------------|--------|------|
| `packages/core-cabala` | ✅ | Reutilizar |
| `packages/core-odus` | ✅ | Reutilizar |
| `packages/core-astrology` | ✅ | Reutilizar |
| `packages/core-tantra` | ✅ | Reutilizar |
| `DeepCorrelationEngine` | ✅ | Wrapper |
| `swarm-memory.ts` | ✅ | Wrapper |
| `swarm.ts` | ✅ | Reutilizar tipos |
| Ollama | ✅ | Fallback |
| Prisma | ✅ | Messages |
| Ink | 🆕 | CLI (nova dep) |

---

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| LLM retorna informações incorretas | Alta | Alto | RAG stub + validação |
| Custo de OpenAI imprevisível | Média | Médio | Logs console + rate limit |
| CLI Ink instável | Baixa | Médio | Testes de integração |
| Usuários sem mapas | Média | Baixo | Onboarding redirect |

---

## Cross-References

- **Spec base:** `.trae/specs/akasha-v0.0.10/`
- **Correlação:** `apps/akasha-portal/src/lib/application/ai/deep-correlation-engine.ts`
- **Swarm memory:** `apps/akasha-portal/src/lib/application/swarm/swarm-memory.ts`
- **Roadmap:** `docs/08_roadmap.md`
- **Sistema prompt:** `grimoire/mentor/system-prompt.md` (a criar)
