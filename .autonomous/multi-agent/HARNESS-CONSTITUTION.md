# HARNESS CONSTITUTION — Akasha Autonomous Evolution Engine

> **Última atualização**: 2026-06-18 — v9 consolidation  
> **Version**: 9.0  
> **Canonical daemon**: `akasha-loop-daemon-v9.py`  
> **Canonical entrypoint**: `run-24-7.sh start` or `bash start-akasha-evolution.sh start`

---

## Artigo I — Princípios Fundamentais

### 1.1 Propósito
O harness existe para fazer o **projeto evoluir continuamente** — não para ser o projeto. Todo código, dívida, e complexidade do harness é um custo que o projeto paga. Menos harness é melhor que mais.

### 1.2 Disciplina: Restrição sobre Throughput
Um loop autônomo de 24/7 **não deve otimizar para intensidade, velocidade, ou quantidade de iterações**. Deve otimizar para **qualidade de mudança verificada por iteração**. Uma mudança completa e verificada vale mais que dez parciais.

**Regra de Ouro**: Se o loop precisa de mais que 10 minutos por iteração para produzir uma mudança de qualidade, algo está errado no harness — não no projeto.

### 1.3 Verdade Única (Single Source of Truth)
- **Um daemon canônico**: `akasha-loop-daemon-v9.py`
- **Uma versão de cada módulo**: módulos v2 quando existirem, v1 apenas onde v2 não existir
- **Um entrypoint**: `run-24-7.sh start` (ou `start-akasha-evolution.sh start`)
- **Arquivos arquivados**: `archive/daemons/`, `archive/loops/`, `archive/v1-modules/` — nunca deletar, nunca editar

Tudo que não é canônico vive no `archive/`.

---

## Artigo II — Arquitetura do Loop

### 2.1 Fases (em ordem)
```
RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE → RESEARCH (next iter)
```

### 2.2 Gate de Qualidade (triad)
```
TypeScript (tsc --noEmit)  ←→  Tests (vitest)  ←→  Format (prettier)
```
Três deve passar para VALIDATION → RELEASE. Falha em qualquer um = volta para IMPLEMENTATION.

### 2.3 Módulos Canônicos (v2 ou v1)

| Módulo | Versão | Arquivo |
|--------|--------|---------|
| Context Engine | v2 | `context_engine_v2.py` |
| Prompt Engine | v2 | `prompt_engine_v2.py` |
| Reasoning Chain | v2 | `reasoning_chain_v2.py` |
| Memory Manager | v2 | `memory_manager_v2.py` |
| Skill Discoverer | v2 | `skill_discoverer_v2.py` |
| Self Healer | v2 | `self_healer_v2.py` |
| Project Scanner | v2 | `project_scanner_v2.py` |
| Agent Orchestrator | v2 | `agent_orchestrator_v2.py` |
| Intelligence | v2 | `intelligence_v2.py` |
| Adaptive Pacer | v1 | `adaptive_pacer.py` |
| Predictive Engine | v1 | `predictive_engine.py` |
| Evolver | v1 | `evolver.py` |
| Continuity Manager | v1 | `continuity_manager.py` |
| Loop Optimizer | v1 | `loop_optimizer.py` |
| Smart Iterator | v1 | `smart_iterator.py` |
| Memory Compressor | v1 | `memory_compressor.py` |
| Telemetry | v1 | `telemetry.py` |
| Guardian | v1 | `guardian.py` |

### 2.4 v9 Novas Proteções

- **Phase Timeout**: cada fase tem tempo máximo — excede = auto-transição
  - RESEARCH: 120s | PLANNING: 30s | IMPLEMENTATION: 300s | QA: 120s | VALIDATION: 60s | RELEASE: 60s
- **Crash-resilient**: exceção em qualquer fase = recover para próxima fase, nunca para o loop
- **Supervisor ping**: daemon escreve heartbeat a cada 30s em WAIT
- **Non-blocking health check**: se health check demora >5s, ignora e continua
- **Pre-computed context cache**: contexto calculado uma vez, cache 300s, invalidação por git hash
- **Git-aware fast scan**: usa `git diff --name-only` para mudanças (instantâneo), não escaneia árvore inteira
- **Intensidade bounded**: auto-scale ±1 por ciclo, max 10, min 1 — nunca "maximize throughput"

---

## Artigo III — Memória e Contexto

### 3.1 Hierarquia de Memória
```
Hot (in-memory)     → recent <1h or confidence >0.8
Warm (disk)         → 1h–24h, confidence 0.4–0.8  
Cold (compressed)   → >24h or confidence <0.4, zlib
Evidence (append)   → memory_v2/evidence.json — nunca faz prune
```

### 3.2 Contexto por Iteração
- Contexto é reconstruído fresh a cada RESEARCH via `ContextEngineV2`
- Cache: 300s TTL, invalida em git diff
- Nunca usar snapshots de iterações anteriores como "memória" — eles se tornam obsoletos e enganam o loop

### 3.3 Lições (Lessons)
- Diretório `lessons/` contém lições reais de falha documentadas
- Lições são lidas antes de decisões de engenharia
- Prioridade: usar lição existente > inventar nova solução

---

## Artigo IV — Decisões de Engenharia

### 4.1 Cadeia de Pensamento Autônoma
Antes de implementar qualquer melhoria:
1. Consultar `lessons/` para padrões de falha conhecidos
2. Usar `IntelligenceV2.decide()` com múltiplas fontes de evidência
3. Documentar decisão rationale no `memory_v2/evidence.json`
4. Validar após implementação com `IntelligenceV2.validate_decision()`

### 4.2 Multi-Agent Decision Framework
- Decisões são validadas contra: memória histórica, telemetria, skill discoverer, preferências de usuário
- Se fontes discordam significativamente (std dev > 0.2): log incerteza, escolher anyway
- NUNCA inventar correspondência esotérica entre padrões — discover don't invent

### 4.3 Critérios para Mudança de Arquitetura
Mudanças estruturais no harness (novos módulos, novos daemons, novos entrypoints) REQUEREM:
1. Documentação no `HARNESS-CONSTITUTION.md`
2. Arquivar versões anteriores ANTES de introduzir nova
3. Commit separado com justificativa
4. Update no `SKILL.md`

---

## Artigo V — Sobrevivência de Longas Runs

### 5.1 O que Corrompe o Harness em Runs de 24h+
1. **Shell path corruption**: variáveis não citadas em redirects criam arquivos com nomes literais (`$VAR` vira nome de arquivo). Regra: SEMPRE citar variáveis em paths de redirecionamento.
2. **Garbage acumulado**: `.agent-prompt-*.txt`, `*.log`, `metrics.json`, snapshots — esses são transitórios e DEVEM ser limpos entre sessões
3. **Módulos duplicados**: cada novo daemon/versioned copy divide o contexto. Canonical = um.
4. **Logs de runtime commitados**: 45MB de logs envenenam o repo e confundem o loop.

### 5.2 Regras de Limpeza
- Arquivos `loop.log`, `loop-supervisor.log`, `loop-omp.log` → deletar (regenerados)
- `metrics.json`, `project_map.json`, `context_snapshot.json` → deletar (regenerados)
- `.agent-prompt-*.txt` → deletar (transitórios)
- PID files → não commitar (`.gitignore`)
- Qualquer arquivo criado por path malformado → mover para `archive/`, corrigir script

### 5.3 O que NUNCA Commitar
```
*.log                — runtime logs
metrics.json         — runtime telemetry
project_map.json     — regenerated each run
context_snapshot.json — regenerated each run
*.pid                — process IDs
loop-daemon.pid      — process ID
agent-pids.txt        — process IDs
telemetry.json        — runtime
pacer-state.json      — runtime
orchestrator.log      — runtime
*.tmp                — temp files
*.swp                — vim swap
*~
.DS_Store            — macOS noise
```

### 5.4 O que SEMPRE Commitar
- Código fonte (módulos, daemon)
- Configurações (SKILL.md, HARNESS-CONSTITUTION.md)
- Lições aprendidas (lessons/)
- Decisões registradas (memory_v2/evidence.json)
- Plans.md e SPEC.md (estado do projeto)

---

## Artigo VI — Git e Versionamento

### 6.1 Auto-Commit do Daemon
O daemon pode fazer auto-commit de mudanças que faz no código, com mensagem estruturada:
```
iter{NNN}: {descrição curta em inglês}
```
Exemplo: `iter005: autonomous evolution v9 — phase timeout protection`

### 6.2 Commits Manuais (deste agente)
Commits manuais são para:
- Consolidations (arquivar, limpar)
- Mudanças de arquitetura documentadas
- Updates de Constitution/SKILL
- NÃO para mudanças de código do projeto (daemon faz isso)

### 6.3 Fluxo
```
Daemon loop → implementa melhorias → auto-commits com "iter{NNN}: ..."
                               → SKILL.md pode ser atualizado manualmente
                               → HARNESS-CONSTITUTION.md atualizado quando arquitetura muda
```

---

## Artigo VII — Agentes Especializados

### 7.1 Agentes OMP (usar via `task` subagents)
- **code-architect**: arquitetura de feature
- **code-explorer**: análise profunda de código
- **code-reviewer**: bugs, lógica, segurança
- **nestjs-***: backend NestJS
- **react-***: frontend React
- **typescript-***: TypeScript, segurança

### 7.2 Agentes do Harness
- **ContextEngineV2**: contexto ultra-rápido, 300s cache TTL, char/4 token estimation
- **PromptEngineV2**: templates por área, injeção de learning
- **ReasoningChainV2**: causal reasoning, root cause, counterfactual
- **MemoryManagerV2**: exponential learning, bounded 50MB
- **SkillDiscovererV2**: TF-IDF similarity, success prediction
- **IntelligenceV2**: decisões com confiança, validação multi-fonte
- **SelfHealerV2**: circuit breaker, graceful degradation
- **ProjectScannerV2**: git-aware, <500ms scan
- **AgentOrchestratorV2**: pool 2-8 agents, priority routing

---

## Artigo VIII — OMP Skill

### 8.1 Skill Path
`.autonomous/multi-agent/skills/akasha-evolution/SKILL.md`

### 8.2 Comando de Inicialização
```bash
bash start-akasha-evolution.sh start
# ou
bash run-24-7.sh start
```

### 8.3 Prioridade de Módulos
Se módulo v1 e v2 existem: usar v2. Se v2 não funciona: fallback para v1 com log de warning.

---

## Artigo IX — Anti-Padrões (Proibidos)

1. **Não criar novos daemons versionados** — cada novo `akasha-loop-daemon-vN.py` divide o contexto. Em vez de novo daemon: melhorar o existente.
2. **Não adicionar módulos sem canonical path** — se não é `*.py` no `MA/`, não é parte do harness
3. **Não otimizar para intensidade** — `intensity=10` não é "mais inteligente", é mais barulho
4. **Não commitar runtime garbage** — logs, métricas, snapshots são transitórios
5. **Não inventar correspondências** — "esse padrão se parece com aquele" sem evidência é especulação
6. **Não fazer mudanças de arquitetura sem documentar** — HARNESS-CONSTITUTION.md é a verdade
7. **Não arquivar módulos que ainda são usados** — verificar `_load_subsystems()` antes de архивировать

---

## Artigo X — Lições Aprendidas (de lessons/)

### session-n-plus-31-daemon-stuck-in-research
O daemon pode travar em RESEARCH se `_load_v2_modules()` causa deadlock ou blocking I/O. Solução: SIGALRM timeout em imports, crash-resilient phase wrapper.

### memory-leak-via-unbounded-log
Logs não-rotacionados crescem indefinidamente. 24MB de agent-prompt-*.txt em uma sessão = memory leak no contexto do repo. Solução: deletar transitórios, não commitar.

### path-corruption-from-unquoted-vars
`>> $VAR` com VAR vazio cria arquivo literal `$VAR`. Solução: sempre citar, sempre validar path antes de redirecionar.

### quality-over-quantity
Loop com intensity=10 e 50 iterações/h produz mais mudanças ruins que um loop intensity=3 com 10 iterações/h de mudanças boas. Otimize para qualidade, não velocidade.
