# Documento 19 — Estratégia de Testes, Qualidade & CI

## Sistema Akasha

> **Norte:** Doc 25.
> **Tipo:** Decisão de arquitetura — testes, qualidade e portão de CI.
> **Versão:** 1.1 | **Data:** 2026-06-02
> **Resolve:** a suíte que **bloqueia a evolução** (estoura timeout) e não protege o que importa.
> **Relação:** subordina-se ao Doc 25 (Visão Akasha) e ao Doc 04 (modelo de dados). A partição "núcleo × legado" deste doc é a antecâmara do **Monorepo** (Doc 25 §11): o núcleo protegido migra para `packages/core-*`; o legado B2B vira `apps/legacy-cockpit`. Onde divergir sobre o que testar e como rodar, este prevalece.

---

## 1. O Diagnóstico (por que isto é um bloqueador)

| Sintoma | Medição (2026-06-02) |
|---|---|
| Suíte gigante e lenta | **682** arquivos de teste; `vitest run` **estoura 120s** |
| Ambiente único caro | **`jsdom` para tudo** (até cálculo puro), `globals:true`, sem `pool`/`maxWorkers`/`testTimeout` |
| Cobertura mal particionada | a lógica espiritual reaproveitável (cálculo, IA) e a UI do Cockpit antigo correm juntas, sem fronteira; **576 só em `tests/lib/`** |
| Falhas de drift | `tests/lib/lenormand/mesa-real.test.ts` **33/83** (Mesa Real → legado, Doc 25 §11); `tests/lib/auth-jwt/*` **import-error** (módulo inexistente) |
| Sem partição nem gate | Tudo roda junto; nada separa os **motores espirituais** (futuros `packages/core-*`) do **Cockpit B2B** (futuro `apps/legacy-cockpit`) |

**Conclusão:** a suíte mistura os ~9k testes que blindam a **matemática espiritual** (o cofre-forte a preservar na Cirurgia de Extração — Doc 25 §11) com testes de UI/Mesa Real do Cockpit que sairão do produto Akasha. É lenta demais para rodar a cada commit e mistura falhas de legado com regressões reais — tornando o sinal de CI inútil. A correção é **arquitetural** (partição → extração para o monorepo), não cosmética.

---

## 2. Princípio Reitor

> **AD-19.1 — Testa-se o que o produto promete, no nível certo.** O conjunto **protegido** (gate de CI) cobre os **motores espirituais agnósticos** (cálculo determinístico + camada de inteligência) que viram `packages/core-*` no monorepo — é a matemática validada que o Akasha B2C herda intacta (Doc 25 §11). O **Cockpit B2B / Mesa Real** (`apps/legacy-cockpit`) **não** entra no gate: roda até o desligamento (AD-25.2) e seus testes saem com o código.

---

## 3. Particionamento (Vitest *projects*)

> **AD-19.2 — Dividir a suíte em projetos por ambiente e por escopo.** Em vez de um `test` monolítico em `jsdom`, definir projetos com ambiente adequado. A partição já antecipa a fronteira do monorepo (`packages/core-*` × `apps/legacy-cockpit`):

| Projeto | Escopo | Mapeia para (monorepo) | Ambiente | No gate de CI? |
|---|---|---|---|---|
| **`core-logic`** | `tests/lib/ai`, `tests/calculators`, `tests/lib/auth`, `tests/lib/db`, `tests/lib/divination`, `tests/lib/constants` | `packages/core-astrology/-tantra/-cabala/-odus/-graph` | **`node`** (rápido) | ✅ **sim** |
| **`core-api`** | `tests/api/{consult,operator}`, `tests/middleware` | `apps/b2c-portal` (rotas de IA reaproveitáveis) | **`node`** | ✅ **sim** |
| **`legacy-ui`** | `tests/cockpit`, `tests/components/cockpit`, `tests/api/mesa-real` | `apps/legacy-cockpit` (a desligar) | `jsdom` | ⚠️ transitório (até a extração) |
| **`legacy`** | todo o resto (`tests/lib/**` legado, `tests/components/**`, `tests/hooks`, `tests/app`, `tests/integration`, `tests/e2e`) | `apps/legacy-cockpit` | `jsdom` | ❌ **não** (quarentena) |

- **Ganho de velocidade**: `node` para lógica pura elimina o custo de `jsdom`; o gate de núcleo roda **só ~20 arquivos** → alvo **< 30s** (§6).
- **Implementação (futura, fora deste doc)**: `vitest.config.ts` com `test.projects` (ou `workspace`), cada projeto com seu `environment` e `include`. Script `test:core` (gate) vs `test:legacy` (manual/diagnóstico). No monorepo, cada `packages/core-*` carrega o próprio Vitest e os testes de `core-logic` migram para junto do código (Doc 25 §11).

> **AD-19.3 — O legado segue o desligamento.** A Mesa Real / Cockpit B2B (`apps/legacy-cockpit`, AD-25.2) é desligada quando o portal B2C estiver autônomo; seus testes vão junto. O projeto `legacy` encolhe até desaparecer. Nenhum esforço de "consertar" testes legados (ex.: `auth-jwt/*`, `mesa-real.test`) — eles **saem com o código**.

---

## 4. A Pirâmide de Testes do Núcleo

Mapeada às três camadas de inteligência (Doc 25 §4: Determinístico → Grafo → Síntese) e ao modelo de dados (Doc 04). O fluxo E2E B2C-alvo é **onboarding → 4 mapas → Dashboard Diário → Consulta Oracular** (Doc 03 §4); o fluxo Mesa Real abaixo permanece como cobertura do `legacy-cockpit` até o desligamento:

```
        ┌───────────────────────────────────────────┐
   E2E  │  Akasha: onboarding → mandala → diário     │   (poucos, caros)
        │  → consulta (RAG)   [legado: tiragem→Q&A]  │
        ├───────────────────────────────────────────┤
 INTEG. │  rotas API com Prisma mockado/efêmero:     │
        │  chart (4 mapas), daily (SSE+status),      │
        │  consult (RAG fechado, debita créditos)    │
        ├───────────────────────────────────────────┤
 UNIT   │  determinismo & verdade (a base, muitos):  │
        │  correlation-map · theme-router ·          │
        │  calculators (Doc 11) · glossário ·        │
        │  cruzamento do Grafo (Doc 25 §4)           │
        └───────────────────────────────────────────┘
```

### 4.1 Testes-guardião (determinismo & anti-alucinação) — prioridade máxima
> **AD-19.4 — Estes invariantes são contratos executáveis e nunca podem regredir.** Os guardiões 1, 2, 5 e 6 protegem os motores espirituais que migram para `packages/core-*` e a busca RAG do Grimório (Doc 25 §5) — o coração do Akasha. Os guardiões 3 e 4 pertencem à Mesa Real (`apps/legacy-cockpit`) e valem **até o desligamento** (AD-25.2):
> 1. **Correlação determinística** (Doc 06 / Grafo, Doc 25 §4): cada casa/cruzamento puxa **apenas** seus aspectos delegados — testar que a Casa 34 injeta 2ª Casa+Vênus+Karma e **não** vaza Ascendente/Lua.
> 2. **Roteador de temas** (Doc 12): `amor → Casa 24 (+Vênus/Lua)`, `dinheiro → Casa 34 (+2ª Casa)`; determinístico (mesma pergunta → mesmas casas/pilares).
> 3. **Permutação da tiragem** (Doc 18 AD-18.2 — *legacy-cockpit*): `save` rejeita carta repetida; 36 cartas distintas = tiragem completa.
> 4. **Fonte única das cartas/Odus** (Doc 16 AD-02 — cartas em *legacy-cockpit*; Odus permanecem no Akasha): Casa 24 = "O Coração" em **todas** as fontes; nenhuma lista paralela diverge.
> 5. **Cálculo determinístico** (Doc 11 / `core-cabala`, `core-tantra`, `core-odus`): casos-âncora (ex.: "Eliane…20/08/1986" → Caminho 7, Alma 2, Karma 8, Dom 5).
> 6. **RAG fechado** (Doc 25 §5 / Doc 12): a síntese nunca cita ritual/erva/Odu fora dos fragmentos injetados do Grimório; sem match, recusa em vez de inventar.

### 4.2 O que **não** testar
- Integrações externas reais (LLM, Swiss Ephemeris, Ollama/embeddings) — **mockar** nas fronteiras; testar o *payload determinístico*, não a resposta do modelo.
- Legado (Mesa Real / Cockpit B2B) — fora do gate (AD-19.1).

---

## 5. Portão de CI & Qualidade

> **AD-19.5 — O merge exige apenas o núcleo verde + lint + typecheck.**
> ```
> Gate (bloqueante):  npm run test:core   (projetos core-*, alvo < 30s)
>                     npm run lint        (eslint)
>                     tsc --noEmit        (typecheck do núcleo)
> Não-bloqueante:     npm run test:legacy (diagnóstico; tende a zero com a poda)
> ```
> - **Cadência local (regra do projeto):** `build` → `lint` → `test:run` antes de commitar; falha de teste **pré-existente de legado/drift** não bloqueia (registrar como "Pré-existente"), mas falha de **core** bloqueia. No monorepo, `turbo run test --filter=./packages/*` roda os gates de núcleo.
> - **`scripts/run-quality-eval.ts`** (`npm run quality`) permanece como métrica suplementar (QUALITY_SCORE ≥ 0.91, CLAUDE.md), não como gate de merge.

---

## 6. Orçamento de Performance

| Conjunto | Hoje | Alvo |
|---|---|---|
| Gate de CI (`test:core`) | (afogado nos 682) | **< 30s** |
| Suíte completa (`+legacy`) | estoura 120s | irrelevante (legado sai) |

> **AD-19.6 — Tuning do runner do núcleo:** ambiente `node` onde não há DOM; `pool: 'threads'` com `maxWorkers` adequado; `testTimeout` curto (5s) para falhar rápido; sem `setupFiles` pesados no projeto de lógica.

---

## 7. Plano de Migração (decisão; execução fora deste doc)

1. **Onda T1 — Partição.** Introduzir `test.projects` (core-logic/core-api/legacy-ui/legacy) + scripts `test:core`/`test:legacy`. Gate passa a ser `test:core`.
2. **Onda T2 — Guardião.** Garantir que os 6 invariantes do §4.1 têm teste explícito (criar os que faltarem). Estes são o "cinto de segurança" da inteligência.
3. **Onda T3 — Cirurgia de Extração (Doc 25 §11).** Mover os testes de `core-logic` para dentro de cada `packages/core-*` (junto do código extraído). À medida que o `legacy-cockpit` é desligado, apagar os testes correspondentes; o projeto `legacy` definha.
4. **Onda T4 — E2E mínimo.** 1 fluxo feliz ponta-a-ponta do Akasha (onboarding → 4 mapas → Dashboard Diário → Consulta Oracular) com Prisma efêmero e LLM/Ollama mockados.

---

## 8. Critério de "pronto"

- [ ] `npm run test:core` roda o núcleo em **< 30s** e é o **único** gate de merge.
- [ ] Os **6 invariantes** (§4.1) têm teste dedicado e verde.
- [ ] Nenhum teste de legado no gate; `legacy` só roda sob demanda.
- [ ] Falha de `core` bloqueia; o sinal de CI volta a ser **confiável**.

---

*Doc 19 é a referência canônica de testes/qualidade/CI. A suíte protege os motores espirituais (`packages/core-*`, ~9k testes — Doc 25 §11) e a busca RAG do Grimório (Doc 25 §5); tudo o que serve só ao Cockpit B2B (`apps/legacy-cockpit`) sai do caminho crítico no desligamento (AD-25.2).*
