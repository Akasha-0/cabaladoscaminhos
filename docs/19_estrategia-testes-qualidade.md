# Documento 19 — Estratégia de Testes, Qualidade & CI

## Cabala dos Caminhos

> **Tipo:** Decisão de arquitetura — testes, qualidade e portão de CI.
> **Versão:** 1.0 | **Data:** 2026-06-02
> **Resolve:** a suíte que **bloqueia a evolução** (estoura timeout) e não protege o que importa.
> **Relação:** subordina-se ao Doc 17 (interface única / poda) e ao Doc 18 (contratos). Onde divergir sobre o que testar e como rodar, este prevalece.

---

## 1. O Diagnóstico (por que isto é um bloqueador)

| Sintoma | Medição (2026-06-02) |
|---|---|
| Suíte gigante e lenta | **682** arquivos de teste; `vitest run` **estoura 120s** |
| Ambiente único caro | **`jsdom` para tudo** (até cálculo puro), `globals:true`, sem `pool`/`maxWorkers`/`testTimeout` |
| Cobertura no lugar errado | **~20** arquivos cobrem o produto B2B; **~662** são legado B2C (**576 só em `tests/lib/`**) |
| Falhas de drift | `tests/lib/lenormand/mesa-real.test.ts` **33/83**; `tests/lib/auth-jwt/*` **import-error** (módulo inexistente) |
| Sem partição nem gate | Tudo roda junto; nada separa "produto" de "legado quarentenado" |

**Conclusão:** a suíte testa majoritariamente código que o Doc 17 §4.2 marcou para **remoção**, é lenta demais para rodar a cada commit, e mistura falhas de legado com regressões reais — tornando o sinal de CI inútil. A correção é **arquitetural**, não cosmética.

---

## 2. Princípio Reitor

> **AD-19.1 — Testa-se o que o produto promete, no nível certo.** O conjunto **protegido** (gate de CI) cobre exclusivamente o **núcleo B2B** (a página única + a camada de inteligência). O legado B2C **não** entra no gate — ele será removido (Doc 17 §4.2); até lá fica num projeto à parte, fora do caminho crítico.

---

## 3. Particionamento (Vitest *projects*)

> **AD-19.2 — Dividir a suíte em projetos por ambiente e por escopo.** Em vez de um `test` monolítico em `jsdom`, definir projetos com ambiente adequado:

| Projeto | Escopo | Ambiente | No gate de CI? |
|---|---|---|---|
| **`core-logic`** | `tests/lib/ai`, `tests/calculators`, `tests/lib/auth`, `tests/lib/db`, `tests/lib/divination`, `tests/lib/constants` | **`node`** (rápido) | ✅ **sim** |
| **`core-api`** | `tests/api/{mesa-real,consult,operator}`, `tests/middleware` | **`node`** | ✅ **sim** |
| **`core-ui`** | `tests/cockpit`, `tests/components/cockpit` | `jsdom` | ✅ **sim** |
| **`legacy`** | todo o resto (`tests/lib/**` legado, `tests/components/**`, `tests/hooks`, `tests/app`, `tests/integration`, `tests/e2e`) | `jsdom` | ❌ **não** (quarentena) |

- **Ganho de velocidade**: `node` para lógica pura elimina o custo de `jsdom`; o gate roda **só ~20 arquivos** → alvo **< 30s** (§6).
- **Implementação (futura, fora deste doc)**: `vitest.config.ts` com `test.projects` (ou `workspace`), cada projeto com seu `environment` e `include`. Script `test:core` (gate) vs `test:legacy` (manual/diagnóstico).

> **AD-19.3 — O legado segue a poda.** Quando um diretório B2C for removido (Doc 17 Onda 3), seus testes vão junto. O projeto `legacy` encolhe até desaparecer. Nenhum esforço de "consertar" testes legados (ex.: `auth-jwt/*`, `mesa-real.test`) — eles **saem com o código**.

---

## 4. A Pirâmide de Testes do Núcleo

Mapeada às camadas de inteligência (Doc 17 §5) e aos contratos (Doc 18):

```
        ┌───────────────────────────────────────────┐
   E2E  │  1 fluxo: login → tiragem → dossiê → Q&A   │   (poucos, caros)
        ├───────────────────────────────────────────┤
 INTEG. │  rotas API com Prisma mockado/efêmero:     │
        │  save (permutação), generate (SSE+status), │
        │  consult (RAG fechado), clients (auth)     │
        ├───────────────────────────────────────────┤
 UNIT   │  determinismo & verdade (a base, muitos):  │
        │  correlation-map · theme-router ·          │
        │  calculators (Doc 11) · glossário ·        │
        │  invariante de permutação (Doc 18 AD-18.2) │
        └───────────────────────────────────────────┘
```

### 4.1 Testes-guardião (determinismo & anti-alucinação) — prioridade máxima
> **AD-19.4 — Estes invariantes são contratos executáveis e nunca podem regredir:**
> 1. **Correlação determinística** (Doc 06): cada casa puxa **apenas** seus aspectos delegados — testar que a Casa 34 injeta 2ª Casa+Vênus+Karma e **não** vaza Ascendente/Lua.
> 2. **Roteador de temas** (Doc 12): `amor → Casa 24 (+Vênus/Lua)`, `dinheiro → Casa 34 (+2ª Casa)`; determinístico (mesma pergunta → mesmas casas).
> 3. **Permutação da tiragem** (Doc 18 AD-18.2): `save` rejeita carta repetida; 36 cartas distintas = tiragem completa.
> 4. **Fonte única das cartas/Odus** (Doc 16 AD-02): Casa 24 = "O Coração" em **todas** as fontes; nenhuma lista paralela diverge.
> 5. **Cálculo determinístico** (Doc 11): casos-âncora (ex.: "Eliane…20/08/1986" → Caminho 7, Alma 2, Karma 8, Dom 5).
> 6. **RAG fechado** (Doc 12): a consulta nunca cita carta/Odu fora da tiragem; cai em `geral` sem match.

### 4.2 O que **não** testar
- Integrações externas reais (LLM, efeméride) — **mockar** nas fronteiras; testar o *payload determinístico*, não a resposta do modelo.
- Legado B2C — fora do gate (AD-19.1).

---

## 5. Portão de CI & Qualidade

> **AD-19.5 — O merge exige apenas o núcleo verde + lint + typecheck.**
> ```
> Gate (bloqueante):  npm run test:core   (projetos core-*, alvo < 30s)
>                     npm run lint        (eslint)
>                     tsc --noEmit        (typecheck do núcleo)
> Não-bloqueante:     npm run test:legacy (diagnóstico; tende a zero com a poda)
> ```
> - **Cadência local (regra do projeto):** `build` → `lint` → `test:run` antes de commitar; falha de teste **pré-existente de legado/drift** não bloqueia (registrar como "Pré-existente"), mas falha de **core** bloqueia.
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

1. **Onda T1 — Partição.** Introduzir `test.projects` (core-logic/core-api/core-ui/legacy) + scripts `test:core`/`test:legacy`. Gate passa a ser `test:core`.
2. **Onda T2 — Guardião.** Garantir que os 6 invariantes do §4.1 têm teste explícito (criar os que faltarem). Estes são o "cinto de segurança" da inteligência.
3. **Onda T3 — Poda.** À medida que o legado é removido (Doc 17 Onda 3), apagar os testes correspondentes; o projeto `legacy` definha.
4. **Onda T4 — E2E mínimo.** 1 fluxo feliz ponta-a-ponta (login → tiragem → dossiê → Q&A) com Prisma efêmero e LLM mockado.

---

## 8. Critério de "pronto"

- [ ] `npm run test:core` roda o núcleo em **< 30s** e é o **único** gate de merge.
- [ ] Os **6 invariantes** (§4.1) têm teste dedicado e verde.
- [ ] Nenhum teste de legado no gate; `legacy` só roda sob demanda.
- [ ] Falha de `core` bloqueia; o sinal de CI volta a ser **confiável**.

---

*Doc 19 é a referência canônica de testes/qualidade/CI. A suíte protege a interface única (Doc 17) e os contratos (Doc 18); tudo o que não os serve sai do caminho crítico com a poda.*
