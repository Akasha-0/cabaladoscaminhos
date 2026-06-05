# Sistema Multi-Agente de Evolução Contínua — Sistema Akasha

> **Norte:** Doc 25.
> **Versão:** 1.1 | **Data:** 2026-06-04
> **Baseado em:** Doc 25 (Visão Akasha) + Doc 26 (Identidade Akasha) no topo da hierarquia; Doc 20 (Governança do Grimório), Doc 24 (Guia de Agentes IA), Doc 06 (Motor de IA)
> **Operacionaliza:** AD-20.7 (crescimento aditivo versionado) e o fluxo de fases do AGENTS.md §11
> **Alvo de produto:** os agentes evoluem o `apps/b2c-portal` (Akasha) e os `packages/core-*` (Doc 25 §11). O `apps/legacy-cockpit` (Mesa Real B2B) só é tocado para manutenção até o desligamento (AD-25.2).

---

## 1. Visão

Sistema de agentes autônomos especializados que **investigam, planejam, implementam, validam e propõem melhorias** em todas as camadas do projeto — IA, arquitetura, UI/UX, DevOps, QA, base de conhecimento — mantendo-se rigidamente alinhados aos documentos canônicos.

O sistema opera em **ciclos de evolução** (fases). Cada ciclo produz:
- Métricas (Quality Score, testes, build)
- Correlações espirituais validadas
- Melhorias arquiteturais propostas
- Gaps identificados e priorizados

**Meta:** `QUALITY_SCORE >= 91%` por ciclo.

---

## 2. Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                  ORQUESTRADOR CENTRAL                    │
│  (loop-orchestrator / sequential-thinking)               │
│  1. ASSESS   →  2. PLAN   →  3. EXECUTE               │
│     4. VERIFY →  5. EVOLVE →  6. LOOP                  │
└────────────────────┬────────────────────────────────────┘
                     │ 6 agentes especializados em paralelo
     ┌───────────────┼───────────────┬──────────────┬─────────────┐
     ▼               ▼               ▼              ▼            ▼
┌─────────┐   ┌───────────┐  ┌───────────┐  ┌──────────┐  ┌─────────┐
│SPIRITUAL│   │ ARCH-AI   │  │  UI-UX    │  │ DEVOPS  │  │KNOWLEDGE│
│VALIDATOR│   │ ENGINEER  │  │ EVOLUTION │  │  QA     │  │VALIDATOR│
└─────────┘   └───────────┘  └───────────┘  └──────────┘  └─────────┘
     │               │               │              │            │
     └───────────────┴───────────────┴──────────────┴────────────┘
                     │  Resultados → Memória (IDEIA.md + cycle-NNN.md)
```

---

## 3. Os 6 Agentes Especializados

### 3.1 `spiritual-validator` — Validação Espiritual

**Responsabilidade:** Validar correlações esotéricas, glossários, e a integridade da base de conhecimento oracular.

**Domínio:**
- `src/lib/ai/correlation-map.ts` (o Grafo de cruzamento dos 4 Pilares)
- `src/lib/constants/odus.ts` (16 Odus — Pilar da Terra)
- `grimorio/**` (as 4 bibliotecas: botanica/vibracional/ancestral/diagnostico — Doc 25 §5)
- `IDEIA.md` (ledger de correspondências)
- `src/lib/constants/lenormand-cards.ts` (36 cartas — *legacy-cockpit*, fora do Akasha)
- Doc 06 (Matriz de Correlação), Doc 15 (Glossário), Doc 20 (Governança do Grimório), Doc 25 (Visão), Doc 26 (Identidade/voz)

**Gate (Cabala Corr Validator):**
```
AD-20.1: source presente? (tradição listada)
AD-20.2: significado vem do glossário (não inventado)?
AD-20.5: IDEIA.md tem a entrada?
AD-20.6: proveniência rastreável?
```

**Output:**
- Correlações validadas (✅/⚠️/❌)
- Novas correlações propostas (com fonte)
- Gaps de governança (D1-D4 status)

---

### 3.2 `arch-ai-engineer` — Arquitetura de IA e Agentes

**Responsabilidade:** Validar e propor melhorias na arquitetura de IA, motores de inferência, swarm, RAG, e cadeia de agentes.

**Domínio:**
- `src/lib/ai/openai.ts` (retry, circuit breaker, fallback)
- `src/lib/ai/minimax.ts` (MiniMax M3)
- `src/lib/ai/deep-correlation-engine.ts` (padrões cross-tradição)
- `src/lib/swarm/swarm-orchestrator.ts` (12 agentes)
- `src/lib/swarm/swarm-types.ts`, `swarm-memory.ts`, `knowledge-base.ts`
- `src/lib/ai/theme-router.ts` (14 temas)
- `src/lib/ai/dossier/oracle-prompt-builder.ts`
- `src/lib/ai/dossier/consult-context.ts`
- Doc 06 (Motor de IA), Doc 12 (Q&A), Doc 20 (Motor de Inteligência)

**Gate:**
```
AD-20.7: crescimento é aditivo e versionado?
3 camadas: Determinístico → Grafo → Síntese separados (Doc 25 §4)?
RAG: busca híbrida (JSONB + pgvector) injeta só o Grimório (Doc 25 §5)?
Anti-alucinação: síntese nunca inventa ritual/erva fora do contexto?
Embeddings: Ollama local (localhost:11434), fallback cloud opcional?
```

**Output:**
- Validação de arquitetura (✅/⚠️/❌)
- Melhorias propostas (circuit breaker, fallback, cache do céu no Redis, streaming SSE)
- Refino do Grafo de Conhecimento e da busca híbrida
- Gaps de CM-01 (Casa 5 Kabalah extractionKey)

---

### 3.3 `ui-ux-evolution` — Evolução UI/UX

**Responsabilidade:** Validar a interface do `apps/b2c-portal` contra o Doc 26 (Identidade Akasha) e propor melhorias de UX mobile-first.

**Domínio:**
- `apps/b2c-portal/**` — onboarding (Quiz Espiritual), Mandala Toroidal, Dashboard Diário, Manifesto, Agente Oracular
- componentes da Mandala (Three.js/R3F atmosfera + SVG/D3 dados + glassmorphism)
- estado de UI (Zustand)
- Doc 26 (Identidade Akasha — paleta cósmica, voz), Doc 25 §2/§8 (Mandala, frontend)

**Gate:**
```
Mandala: WebGL (atmosfera) separado de SVG/D3 (dados clicáveis)?
Paleta cósmica: violeta #7C5CFF / aurora #2DD4BF / ori #F0B429 (Doc 26 §3)?
Tipografia: Cinzel/Cormorant/Lora/JetBrains Mono + Inter (UI mobile)?
Mobile-first absoluto + PWA (Doc 25 §8)?
Voz do Oráculo: magnética/cósmica, nunca genérica/fatalista (Doc 26 §7)?
i18n: next-intl (pt-BR/en) desde o dia zero?
```

**Output:**
- Validação de UI contra o Design System Akasha
- Melhorias de UX propostas (descoberta progressiva, glows, animações, estados)
- Anomalias visuais / resíduos da identidade Ramiro (laranja+royal) a aposentar

---

### 3.4 `devops-qa-tester` — DevOps, QA e Testes

**Responsabilidade:** Validar pipeline de CI, cobertura de testes, DevOps, e observabilidade.

**Domínio:**
- `vitest.config.ts`
- `src/__tests__/**` (testes core)
- `src/**/*.test.ts`
- `.github/workflows/*`
- `src/lib/observabilidade/*`
- Doc 19 (Estratégia de Testes), Doc 22 (Observabilidade)

**Gate:**
```
Testes: QUALITY_SCORE >= 91%?
TypeScript: 0 erros?
Build: compilando?
Rate limiting: Redis implementado?
Logs: JSON estruturado, sem PII?
Health checks: /api/health + /api/health/live?
```

**Output:**
- Status de build/testes
- Coverage report
- Melhorias de DevOps propostas (CI/CD, caching, rollback)
- Gaps de performance (S6 — Reading indexes)

---

### 3.5 `knowledge-validator` — Validação de Base de Conhecimento

**Responsabilidade:** Validar que a base de conhecimento está fundamentada com fontes reais e não contém alucinações.

**Domínio:**
- `grimorio/**` (as 4 bibliotecas em Markdown+YAML — a verdade do RAG, Doc 25 §5)
- `src/lib/swarm/knowledge-base.ts` (dados espirituais seededs)
- `src/lib/constants/odus.ts`
- `IDEIA.md` (ledger)
- `src/lib/constants/lenormand-cards.ts` (*legacy-cockpit*)
- Doc 11 (Cálculo Determinístico), Doc 15 (Glossário), Doc 20 (Governança do Grimório)

**Gate:**
```
AD-20.1: cada correspondência tem fonte (tradição)?
AD-20.2: nenhum significado vem do LLM?
AD-20.4: conteúdo provisional está marcado?
D1-D4: status atual de cada decisão pendente?
```

**Output:**
- Validação de conhecimento (✅/⚠️/❌)
- Lista de entradas sem proveniência
- Propostas de enriquecimento (Vetores 1-3 do Doc 20)

---

### 3.6 `platform-evolver` — Evolução da Plataforma

**Responsabilidade:** Agente superior que coordena todos os outros, propõe novas ideias, e mantém o ciclo de evolução.

**Responsabilidades:**
- Ler ciclo atual (cycle-NNN.md)
- Identificar gaps abertos
- Priorizar próxima fase
- Propor novas correlações espirituais (Doc 20 Vetores 1-3)
- Coordenar implementação dos gates
- Atualizar PROGRESS.md

---

## 4. Fluxo de Execução do Ciclo

### 4.1 ASSESS — Avaliação de Contexto

```
1. Ler PROGRESS.md (estado macro)
2. Ler memory/cycle-NNN.md (último ciclo)
3. Ler memory_summary.md (aprendizagens acumuladas)
4. Ler Doc 21 (painel de decisões AD-16..AD-20)
5. Verificar gaps do ciclo anterior (CM-01, S6, A2)
6. Verificar build/testes: npm run test:run && npm run build
```

### 4.2 PLAN — Planejamento do Ciclo

```
1. Listar 3 tarefas coesas (Fase N.A, N.B, N.C)
2. Alinhar com painel Doc 21 (decisões pendentes)
3. Verificar se tarefa toca conteúdo oracular (→ cabala-corr-validator)
4. Declarar critérios de sucesso
```

### 4.3 EXECUTE — Execução

```
Paralelo:
  - spiritual-validator → valida correlações
  - arch-ai-engineer → valida arquitetura de IA
  - ui-ux-evolution → valida UI/UX
  - devops-qa-tester → valida DevOps/QA
  - knowledge-validator → valida base de conhecimento

Serial (dependências):
  - platform-evolver → sintetiza resultados
  - Implementa correções priorizadas
```

### 4.4 VERIFY — Verificação

```
1. npm run build → 0 erros TypeScript
2. npm run test:run → 0 falhas
3. TypeScript: 0 erros (npx tsc --noEmit)
4. QUALITY_SCORE = passing/(total) >= 0.91
```

### 4.5 EVOLVE — Evolução

```
1. Se QUALITY_SCORE >= 0.91:
   → Adicionar nova correlação espiritual validada
   → Propor melhoria arquitetural (Vetores Doc 20)
   → Escrever memory/cycle-NNN.md
   → Atualizar PROGRESS.md

2. Se QUALITY_SCORE < 0.91:
   → Identificar blockers
   → Criar task no cycle-NNN.md "Lições"
   → Não avançar para nova feature
```

---

## 5. Gates e Critérios de Qualidade

| Gate | Critério | Ferramenta |
|------|----------|-----------|
| Build | `npm run build` = 0 erros | TypeScript compiler |
| Tests | `npm run test:run` = 0 falhas | Vitest |
| Lint | `npm run lint` = 0 warnings | ESLint |
| Correlação | AD-20.1..20.9 validados | cabala-corr-validator |
| Arquitetura | Doc 25 §4–5 (3 camadas + RAG) + Doc 06 | arch-ai-engineer |
| UI/UX | Doc 26 (Identidade Akasha) + Doc 25 §2/§8 | ui-ux-evolution |
| DevOps | Doc 19 + Doc 22 respeitados | devops-qa-tester |
| Conhecimento | Doc 15 + Doc 20 (Grimório) respeitados | knowledge-validator |

**QUALITY_SCORE** = (gates_aprovados / total_gates)

---

## 6. Sistema de Memória

### 6.1 Memória por Ciclo

Cada ciclo gera:
- `memory/cycle-NNN.md` — métricas + aprendizagens
- `memory/MEMORY.md` — índice das últimas 10-15 fases

### 6.2 Ledger de Correlações

`IDEIA.md` = fonte da verdade para todas as correspondências esotéricas (precede o frontmatter do Grimório, Doc 20 AD-20.5).
Formato por entrada:
```md
## <Sistema A> ↔ <Sistema B>: <correspondência>
- Afirmação: <ex.: "Manjericão (erva fria) atua sobre Lua em Escorpião + Odu Ejioko para aterrar o Ori">
- Tradição: <Cabalística | Tântrica | Ifá/Merindilogun | Astrologia | Magia natural | …>
- Fonte: <livro, autor, edição/página | Doc interno nº | tradição oral verificável>
- Status: <validado | provisório (D#) >
- Data / Autor: <YYYY-MM-DD / nome>
```

### 6.3 Decisões Arquiteturais

`docs/21_registro-decisoes-roadmap.md` = painel único de todas as decisões AD-16..AD-20.
Status: 🟡 pendente | ✅ feito | ❌ bloqueado

---

## 7. Auto-Evolution Loop (Loop Autônomo)

O sistema pode operar em modo **autônomo contínuo**:

```
LOOP:
  1. ASSESS (ler contexto, verificar estado)
  2. PLAN (identificar 3 tarefas coesas)
  3. EXECUTE (paralelo: 5 agentes especializados)
  4. VERIFY (build + tests + quality gates)
  5. EVOLVE:
     - Se QUALITY_SCORE >= 0.91 → próxima fase
     - Se QUALITY_SCORE < 0.91 → fix blockers primeiro
  6. Persistir: memory/cycle-NNN.md + PROGRESS.md
  7. LOOP
```

---

## 8. Comandos do Sistema

```bash
# Ciclo completo manual
npm run cycle:assess    # Lê contexto, verifica build/testes
npm run cycle:plan      # Identifica tarefas
npm run cycle:execute   # Dispara 5 agentes em paralelo
npm run cycle:verify    # Build + tests + quality gates
npm run cycle:evolve    # Atualiza memória e progresso
npm run cycle:full      # Ciclo completo (assess → evolve)

# Validações específicas
npm run validate:correlations  # cabala-corr-validator
npm run validate:knowledge     # knowledge-validator
npm run validate:architecture  # arch-ai-engineer
npm run validate:uiux         # ui-ux-evolution
npm run validate:devops        # devops-qa-tester
```

---

## 9. Regras de Ouro do Sistema

1. **Nunca inventar correspondência.** Toda correlação precisa de fonte (AD-20.1); a síntese só redige o Grimório (Doc 25 §5).
2. **Nunca fugir da documentação.** Hierarquia: **Doc 25 (Visão) → Doc 26 (Identidade) →** Doc 04 → Doc 03 → Doc 06 → Doc 11 → Doc 20. Docs B2B (13, 16, 17, 18) são legado/referência histórica.
3. **Testes antes de assertar.** `npm run test:run` deve passar antes de declarar vitória.
4. **Qualitative Score mínimo: 91%.** Se abaixo, gap antes de nova feature.
5. **Cada ciclo gera memória.** `memory/cycle-NNN.md` é obrigatório.
6. **Cirúrgico.** Não melhorar código adjacente fora do escopo.
7. **Fonte única por conceito.** Odus → `odus.ts`, Correlação/Grafo → `correlation-map.ts`, magia natural → `grimorio/**`. (Lenormand → `lenormand-cards.ts`, só no `legacy-cockpit`.)

---

*Doc superpowers/multi-agent/MULTI-AGENT-SYSTEM.md — Sistema de Evolução Contínua do Akasha*
*Operacionaliza: Doc 20 §6 (Motor de Inteligência) + AGENTS.md §11 (workflow de fases). Norte: Doc 25 + Doc 26.*
