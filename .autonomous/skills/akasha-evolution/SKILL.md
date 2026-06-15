---
name: akasha-evolution
description: "AKASHA autonomous evolution loop — 5 specialized agents (researcher, architect, coder, qa, validator) running 6-phase workflow (RESEARCH→PLANNING→IMPLEMENTATION→QA→VALIDATION→RELEASE) with CodeGraph intelligence, Headroom compression, exponential learning, and self-improving decisions. Trigger: /loop 9999999999 + 'start akasha-evolution'."
description-en: "AKASHA autonomous evolution loop with 5 parallel agents and 6-phase state machine."
description-pt: "Loop de auto-evolução AKASHA com 5 agentes paralelos e máquina de estados de 6 fases."
kind: workflow
purpose: "Autonomous project evolution through intelligent multi-agent orchestration"
trigger: "autonomous, loop, evolution, self-improve, akasha-evolution, /loop 99999999"
shape: delegate
role: orchestrator
base: harness-work
pair: harness-sync
owner: akasha-core
since: "2026-06-15"
allowed-tools: ["Read", "Edit", "Bash", "Task", "mcp__codegraph__*", "mcp__claude_mem__*", "mcp__headroom__*", "Irc", "Job"]
argument-hint: "[start|status|stop] [--agents researcher,architect,coder,qa,validator] [--max-iterations N]"
user-invocable: true
---

# akasha-evolution

Sistema autônomo de evolução de projeto usando 5 agentes especializados
em 6 fases com aprendizagem exponencial e decisões inteligentes.

## Como Ativar

```bash
# 1. Ativar /loop no OMP (por tempo indeterminado)
/loop 9999999999

# 2. No prompt que aparece, dizer:
start akasha-evolution
```

O loop roda **dentro do OMP** como agente principal, interagindo com a CLI,
orquestrando 5 sub-agentes em paralelo via `task`, tomando decisões
baseadas em evidências reais do projeto, e evoluindo continuamente.

## invocation (step-by-step)

### Passo 1 — `/loop 9999999999`
Ativa o modo dinâmico do OMP. OMP vai aguardar input do usuário.

### Passo 2 — `start akasha-evolution`
Este skill ativa. O agente principal:
1. Executa `bootstrap()` → carrega contexto REAL do projeto
2. Analisa `decision = make_decision(snapshot, memory, current_phase)`
3. Executa a fase atual do state machine
4. Ao final de cada iteração, faz `ScheduleWakeup` para próximo ciclo
5. Repete até stop.signal ou max-iterations

### Passo 3 — O loop continua
Cada wake-up carrega **fresh context** (CodeGraph, git, triad, Plans.md).
O loop nunca opera com contexto obsoleto.

## Arquitetura

```
AKASHA Evolution Loop (OMP main agent)
│
├── bootstrap()          ← carrega contexto REAL a cada iteração
│   ├── Plans.md
│   ├── feature_list.json  (52 features | 8 pending)
│   ├── CodeGraph (929 files, 6117 nodes, 17238 edges)
│   ├── git status
│   └── triad (typecheck + tests + lint)
│
├── intelligence layer     ← decisões Evidence-based
│   ├── should_proceed?   (triad green? codegraph sync? git clean?)
│   ├── pick_next_task    (não cega por lista — analisa histórico)
│   └── make_decision     (retorna {action, feature, reasoning, confidence})
│
├── 5 sub-agentes (via task tool, em paralelo)
│   ├── researcher     → web search, competitive analysis
│   ├── architect      → system design, blast-radius, isomorfismos
│   ├── coder          → implementation, refactoring, triad
│   ├── qa             → test execution, quality gates
│   └── validator      → DOX compliance, backwards compat, meta-review
│
└── 6 fases (máquina de estados)
    RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE
```

## Ciclo de Execução

### Uma Iteração (= 6 fases executadas em sequência)

**FASE 1 — RESEARCH**
- 5 sub-agentes spawnados via `task` em paralelo
- Cada agente recebe contexto FRESCO (snapshot real)
- Agentes escrevem resultado em `result-{agent}.json`
- Main agent sintetiza achados → `memory.json`

**FASE 2 — PLANNING**
- Atualiza `Plans.md` com síntese da research
- Gera blocos `## cc: Ralph-loop iter N` para rastreabilidade
- Decide próximo feature baseado em inteligência

**FASE 3 — IMPLEMENTATION**
- Coder + Architect + Researcher executam
- Cada mudança executa triad completo
- Triad vermelho → para e reporta
- Triad verde → continua

**FASE 4 — QA**
- QAAgent executa triad completo
- Categoriza falhas: pre-existing vs introduced-by-change
- Se todas green → VALIDATION
- Se falhou → IMPLEMENTATION (retry)

**FASE 5 — VALIDATION**
- ValidatorAgent verifica:
  - AGENTS.md chain completo para todos os paths modificados
  - Backwards compat de mudanças API/schema
  - Plans.md atualizado
  - CodeGraph sync

**FASE 6 — RELEASE**
- Bump versão (minor++)
- git commit + git tag
- CHANGELOG.md atualizado
- memory.json atualizado (exponential learning)
- Próxima iteração: RESEARCH

## Decisões Inteligentes

Antes de cada ação, o sistema verifica:

```
should_proceed?
├── triad verde?     → NÃO → "fix triad first"
├── codegraph sync?  → NÃO → "sync index first"
├── git clean?       → NÃO → "commit changes first"
└── pending features? → NÃO → "nothing to do"

pick_next_task?
├── Features bloqueadas (dependências resolvidas)
├── Features nunca tentadas
├── Features com histórico de sucesso
├── Features com 3+ falhas recentes → skip
└── Phase ordering (menor phase primeiro)
```

## Aprendizagem Exponencial (memory.json)

```json
{
  "iteration": 47,
  "learnings": [
    { "agent": "coder", "phase": "IMPLEMENTATION", "feature_id": "F-223",
      "outcome": "success", "summary": "..." }
  ],
  "error_patterns": { "abc123": 3 },
  "task_history": [ /* last 100 */ ],
  "context_window": [ /* last 20 snapshots */ ],
  "decisions": [ /* every decision made */ ]
}
```

Cada iteração: o sistema **lembra** o que funcionou e o que falhou.
Over time: decisões ficam mais precisas.

## Comandos

```
start akasha-evolution   → inicia o loop ( dentro de /loop)
akasha-evolution status  → mostra estado atual
akasha-evolution stop    → envia stop.signal
```

## Código Fonte

| Arquivo | Responsabilidade |
|---------|-----------------|
| `akasha-evolution-loop.py` | Orquestrador principal — 6 fases, bootstrap, decisões |
| `context_bootstrap.py` | Carrega contexto real (Plans, features, CodeGraph, git, triad) |
| `intelligence.py` | Decisões evidence-based, aprendizagem exponencial |
| `state.json` | Estado persistente (phase, iteration, current_feature) |
| `memory.json` | Histórico de aprendizados (exponential learning) |
| `context_snapshot.json` | Snapshot do projeto (atualizado a cada bootstrap) |
| `result-{agent}.json` | Resultado de cada agente |
| `task-{agent}.json` | Input para cada agente |

## Sub-agentes

### researcher
Ferramentas: `web_search`, `codegraph_explore`
- Web search para informação externa
- codegraph_explore para contexto de código
- Cita fontes para todas as claims externas

### architect
Ferramentas: `codegraph_explore`, `ast_grep`, `ast_edit`
- Design de sistemas com codegraph_explore obrigatório
- Analisa blast radius de mudanças propostas
- Identifica isomorfismos com padrões existentes
- Documenta tradeoffs com evidências

### coder
Ferramentas: `codegraph_explore`, `Edit`, `Bash`, `lsp`
- codegraph_explore antes de tocar código desconhecido
- Executa triad após cada mudança (typecheck → tests → lint)
- Nunca commita se triad falha
- Usa Headroom para outputs > 5k tokens

### qa
Ferramentas: `Bash`, `codegraph_explore`
- Executa triad completo e reporta cada tool separadamente
- Categoriza falhas: pre-existing vs introduced
- Identifica gaps de cobertura

### validator
Ferramentas: `Read`, `search`, `codegraph_explore`
- Verifica AGENTS.md chain para todos os paths modificados
- Verifica backwards compat de mudanças API/schema
- Verifica Plans.md atualizado
- Executa codegraph sync verification
