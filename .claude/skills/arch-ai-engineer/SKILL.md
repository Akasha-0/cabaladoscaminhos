# Arch AI Engineer — Arquitetura de IA e Agentes

> **Tipo:** Agente especialista em arquitetura de IA e sistemas multi-agente
> **Versão:** 1.0 | **Data:** 2026-06-04
> **Base:** Doc 06 (Motor de IA), Doc 12 (Q&A), Doc 20 (Governança)

## Quando Ativar

- Validação de arquitetura de IA
- Melhorias em OpenAI/MiniMax client
- Evolução do swarm de agentes
- RAG e contexto de consulta
- "validar arquitetura IA", "melhorar motor de IA", "avaliar swarm", "checar RAG"

## Entrada

```json
{
  "focus": "full|openai|minimax|swarm|rag|theme-router|prompt-builder",
  "target_files": ["src/lib/ai/openai.ts", "src/lib/swarm/swarm-orchestrator.ts"]
}
```

## Tarefas

### 1. Validar OpenAI Client (`openai.ts`)

- Retry com backoff exponencial implementado?
- Circuit breaker presente?
- Fallback model (gpt-4o-mini) configurado?
- Error handling robusto?
- Streaming suportado?

### 2. Validar MiniMax Client (`minimax.ts`)

- M3 model utilizado?
- Retry/backoff implementado?
- Fallback para OpenAI?
- Error handling robusto?

### 3. Validar Swarm Orchestrator (`swarm-orchestrator.ts`)

**12 agentes:**
1. Orixá Specialist
2. Odu Specialist
3. Tantra Specialist
4. Chakra Specialist
5. Numerology Specialist
6. Astrology Specialist
7. Wicca Specialist
8. Flora Specialist
9. Xing Ling Specialist
10. Sexuality Specialist
11. Coherence Validator
12. Prompt Engineer

**Verificações:**
- Todos os 12 agentes estão implementados?
- `swarm-memory.ts` persiste entre sessões?
- `knowledge-base.ts` tem dados espirituais seededs?
- Communication pattern: polling ou event-driven?
- Cada agente tem domínio definido?
- Agentes cobrem os domínios do `IDEIA.md`?

### 4. Validar Correlation Map e Theme Router

**`theme-router.ts`:**
- 14 temas implementados?
- Roteamento determinístico (theme → casas)?
- Mapeamento para `correlation-map.ts` correto?

**`oracle-prompt-builder.ts`:**
- 3 parágrafos por casa (Terreno/Evento/Direção)?
- Injeção via `correlation-map.ts` (não genérico)?
- Sem perguntas abertas no dossiê (Doc 06)?
- Persona "Cigano Ramiro" consistente?

### 5. Validar RAG e Contexto de Consulta (`consult-context.ts`)

- RAG fechado (só dados da leitura)?
- Dossiê + mapas natais + casas + histórico?
- Streaming SSE implementado?
- `ChatMessage` com `routedThemes`/`routedHouses`?
- Tokens utilizados persistidos?

### 6. Avaliar Motor de Inteligência (Doc 20 §6)

**Vetor 1 — Profundidade do glossário:**
- `baseMeaning`/`shadow` ricos?
- Correlações carta×casa implementadas?

**Vetor 2 — Refino da correlação:**
- 36 casas com `rationale`/`source` completos?
- Ajuste de delegações necessário?

**Vetor 3 — Novos sistemas:**
- I-Ching como campo opcional em `CorrelationEntry`?
- Doc 14 (Extensibilidade) implementado?

### 7. Propor Melhorias Arquiteturais

```
1. Cache inteligente (Doc 22):
   - SHA-256 cache para mapas natais?
   - Cache de prompt builders?
   
2. Circuit breaker refinado:
   - Max retries: 3?
   - Backoff: exponencial 1s, 2s, 4s?
   
3. Fallback model:
   - gpt-4o → gpt-4o-mini → gpt-3.5-turbo
   
4. Swarm evolution:
   - Mais agentes por domínio?
   - Comunicação mais eficiente?
   
5. RAG improvements:
   - Semantic search sobre dossiê?
   - Cache de contexto?
```

## Gate de Validação

```
AD-20.7: crescimento é aditivo e versionado?
Motor de IA: 0 perguntas abertas no dossiê (Doc 06)?
RAG: contexto fechado ao que foi calculado (Doc 12)?
Swarm: 12 agentes cobrem os domínios do IDEIA.md?
Circuit breaker: implementado em OpenAI client?
Streaming: SSE em todas as rotas de geração?
```

## Saída

```json
{
  "openai": { "retry": true, "circuit_breaker": true, "fallback": true, "streaming": true },
  "minimax": { "retry": true, "fallback_to_openai": true },
  "swarm": {
    "total_agents": 12,
    "domains_covered": ["orixa", "odu", "tantra", "chakra", "numerology", "astrology", "wicca", "flora", "xing", "sexuality"],
    "memory_persistent": true,
    "communication": "polling|event"
  },
  "theme_router": { "themes": 14, "deterministic": true },
  "oracle_prompt_builder": { "paragraphs_per_house": 3, "correlation_based": true, "no_open_questions": true },
  "rag": { "closed_context": true, "streaming": true, "tokens_tracked": true },
  "motor_inteligencia": { "vetor1": "partial|complete", "vetor2": "partial|complete", "vetor3": "not_started|partial" },
  "cm01_status": "fixed|pending",
  "proposed_improvements": [],
  "gates_passed": ["retry", "circuit_breaker", "fallback", "streaming", "deterministic", "closed_rag"],
  "quality_score": 0.95
}
```

## Regras

1. **Motor de dossiê = 0 perguntas abertas.** (Doc 06, resolve I3)
2. **RAG = contexto fechado.** (Doc 12)
3. **Gatilhos não podem quebrar.** Circuit breaker + retry.
4. **Swarm cobre domínios do IDEIA.md.** 12 agentes = 12 domínios.
5. **Growth = aditivo.** Nunca mudar contrato (Doc 20 AD-20.7).
