---
name: akasha-evolution
description: "AKASHA autonomous evolution loop — hub-and-spoke orchestration of 5 specialized agents (researcher, architect, coder, qa, validator) through a 6-phase state machine. Trigger: /loop N + 'start akasha-evolution', or 'autonomous, loop, evolution, self-improve, akasha-evolution'."
description-en: "AKASHA autonomous evolution loop with 5 parallel agents and 6-phase state machine."
description-pt: "Loop de auto-evolução AKASHA com 5 agentes paralelos e máquina de estados de 6 fases."
kind: workflow
purpose: "Autonomous project evolution through hub-and-spoke multi-agent orchestration, driven by native OMP Task tool and worktree isolation."
trigger: "autonomous, loop, evolution, self-improve, akasha-evolution, /loop"
shape: delegate
role: orchestrator
base: harness-work
pair: harness-sync
owner: akasha-core
since: "2026-06-18"
allowed-tools:
  - Task
  - Read
  - Edit
  - Bash
  - lsp
  - search
  - ast_grep
  - ast_edit
  - mcp__codegraph__*
  - mcp__headroom__*
  - Irc
  - Job
argument-hint: "[start|status|stop] [--agents researcher,architect,coder,qa,validator] [--max-iterations N]"
user-invocable: true
---

# akasha-evolution

Sistema autônomo de evolução de projeto usando hub-and-spoke nativo do OMP:
um orquestrador delega a 5 sub-agentes isolados em worktrees, evoluindo o
Akasha em direção à linguagem única que integra todas as tradições.

---

## Ativação

```
/loop <high-number>
→ start akasha-evolution
```

O orquestrador roda na sessão do `/loop`, mantém coerência e é o único que
decide e integra. Sub-agentes executam isolados (cada um em worktree) e
reportam ao orquestrador — não entre si.

---

## Arquitetura

```
ORQUESTRADOR (loop — o cérebro)
│
├── bootstrap (barato)
│   ├── '/home/skynet/.omp/agent/memories/--home-skynet-cabala-dos-caminhos--/memory_summary.md'            ← memória nativa cross-session
│   ├── lessons/                  ← camada durável curada
│   ├── SPEC.md + DECISIONS.md   ← verdades de longo prazo
│   ├── git status               ← estado do repositório
│   └── Plans.md                 ← fila de tarefas
│
├── auditoria
│   └── codegraph → mapa do projeto; caça triad vermelho,
│       duplicata de harness, lixo commitado, página órfã
│
├── /plan — escolhe UMA melhoria de maior alavancagem
│   {alvo, ação, raciocínio, confiança, blast-radius}
│
├── 5 sub-agentes via Task tool (isolation: worktree, merge: branch)
│   ├── researcher  (smol)   → pesquisa tradição/concorrente
│   ├── architect   (slow)   → design + blast-radius + isomorfismos
│   ├── coder       (default)→ implementação isolada
│   ├── qa         (default)→ triad completo (único a build pesado)
│   └── validator  (default)→ veto: AGENTS.md chain, compat, spec
│
└── 6 fases (máquina de estados)
    RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE
```

---

## Ciclo por iteração (Instrução do Orquestrador — §7)

### 1. Orientar (barato)
- Memória nativa (`/memory`) já injeta resumo; ler estado git + `lessons/` do tema.
- Nada de snapshot gigante; contexto fresco a cada wake-up.

### 2. Auditar via codegraph
- Reconstruir o mapa; caçar triad vermelho, duplicata de harness, lixo
  commitado, página órfã.
- Achados de entropia são alvos de primeira classe.

### 3. `/plan`
- Escolher **UMA** melhoria de maior alavancagem (produto OU harness), com
  `{alvo, ação, raciocínio, confiança}` e blast-radius.
- Diagnosticar, não obedecer spec velha.

### 4. `todo_write`
- Quebrar em fases rastreáveis (não toda a iteração — só o próximo step).

### 5. Delegar via Task tool (isolado)
```
architect  → desenha em worktree isolado
coder      → implementa em worktree isolado
designer   → cuida do visual se aplicável
```
- Concorrência limitada por `async.maxJobs` (configurado em `.omp/settings.json`).
- Jamais commitar se triad falha.

### 6. QA
- Agente `qa` roda triad completo (isolado): typecheck → tests → lint.
- Vermelho → volta ao coder com feedback preciso.
- Categoriza: falha pré-existente vs. introduzida pela mudança.

### 7. Validator
- Veta se: AGENTS.md chain incompleto, backwards-incompat, truth-base
  violada, `SPEC`/`DECISIONS` desatualizada.

### 8. Integrar + `omp commit`
- Merge da branch do sub-agente; commit atômico (split se mexeu em coisas
  distintas) + changelog entry.
- Migration → PROPOSAL, nunca aplicar sem aprovação humana.

### 9. Aprender
- Se algo não-óbvio custou tempo → nova `lesson` em `lessons/`.
- Atualizar `SPEC`/`DECISIONS` de forma concisa.
- Comprimir o que inchou (compactação nativa ativa).

### 10. Encerrar limpo
- Working tree estável; nada de runtime commitado.

---

## 6-Fase State Machine

### FASE 1 — RESEARCH
- Researcher estuda tradições/sistemas e concorrentes (ferramentas: web_search, read).
- output: `result-researcher.json` com achados resumidos.
- Limite: não escreve código de produção.

### FASE 2 — PLANNING
- Orquestrador atualiza `Plans.md` com síntese da research.
- Gera bloco `## cc: akasha-evolution iter N` para rastreabilidade.
- Decide próximo feature com `{alvo, ação, raciocínio, confiança}`.

### FASE 3 — IMPLEMENTATION
- Architect desenha (slow model) → Coder implementa (default, worktree isolado).
- Cada mudança executa triad completo localmente.
- Triad vermelho → para e reporta.
- Triad verde → continua.

### FASE 4 — QA
- QAAgent executa triad completo em worktree isolado.
- Categoriza falhas: pré-existente vs. introduzida.
- Se verde → VALIDATION. Se vermelho → IMPLEMENTATION (retry).

### FASE 5 — VALIDATION
- ValidatorAgent verifica:
  - AGENTS.md chain completo para todos os paths modificados
  - Backwards compat de mudanças API/schema
  - Plans.md atualizado
  - Spec atualizada (`SPEC.md`, `DECISIONS.md`)

### FASE 6 — RELEASE
- `omp commit` atômico + changelog entry.
- Nova `lesson` se necessário.
- Próxima iteração: RESEARCH.

---

## Memória e Contexto (Nativo + Durável)

### Camada Nativa
- `/memory` ('/home/skynet/.omp/agent/memories/--home-skynet-cabala-dos-caminhos--/memory_summary.md') — memória cross-session do OMP.
- Compactação nativa (`.omp/settings.json`): `reserveTokens: 16384`, `keepRecentTokens: 20000`.
- Substitui o antigo `memory_manager`/`context_engine`.

### Camada Durável (a que importa)
```
lessons/          ← aprendizado de longo prazo (cada falha vira lesson)
SPEC.md           ← especificação viva do sistema
DECISIONS.md      ← registros de decisão arquitetural
```
- Nunca ler arquivo gigante inteiro; gitignore tudo que é runtime.

### Regras de higiene
- Nunca cometer: snapshots, logs, prompts de agente, `.pid`, `__pycache__`.
- Pergunta estrutural → codegraph MCP; nunca grep cego.
- Output > 5k tokens → Headroom (MCP).

---

## Decisões Inteligentes (Evidence-based)

Antes de cada ação, verificar:

```
should_proceed?
├── triad verde?       → NÃO → "fix triad first"
├── codegraph sync?    → NÃO → "sync index first"
├── git clean?         → NÃO → "commit changes first"
└── pending features?  → NÃO → "nothing to do"

pick_next_task?
├── Features bloqueadas (dependências resolvidas)
├── Features nunca tentadas
├── Features com histórico de sucesso
├── Features com 3+ falhas recentes → skip
└── Menor phase primeiro
```

---

## Agentes Especializados (`.omp/agents/`)

| Agente | Modelo | Responsabilidade | Limite |
|--------|--------|-----------------|--------|
| `researcher` | smol | Pesquisa tradição/concorrente; cita fontes | Não escreve código |
| `architect` | slow | Design, blast-radius, isomorfismos | Não implementa |
| `coder` | default | Implementa uma tarefa em worktree | Sem refactor fora do escopo |
| `qa` | default | Triad completo; único a build pesado | — |
| `validator` | default | Veto: AGENTS.md chain, compat, spec | — |
| `designer` | default | UI/UX, mandala, acessibilidade | — |

Cada sub-agente recebe contexto fresco (não herda estado de iteração anterior).

---

## A Visão de Produto que o Loop Serve

O loop melhora todos os aspectos a serviço da visão do Akasha:

> **Akasha = tradutor universal.** O objetivo NÃO é mostrar "Sol em Escorpião +
> Caminho 11 + Odu 11 Owonrin" lado a lado — isso fragmenta em três linguagens.
> O objetivo é mapear TODOS os sistemas numa **ontologia única de vetores da
> consciência** e devolver UMA leitura integrada.

### Tradições-alvo (mapeamento progressivo na mesma ontologia)
Astrologia Ocidental · Jyotish · Numerologia Cabalística · Numerologia Tântrica ·
Ifá (Odu) · Human Design · Gene Keys · Cabala Hermética · Tarot de Nascimento ·
Tzolkin Maia · Bazi · Soul Contract · Starseed

### Regra de integração
Um sistema novo só "entra" quando seus símbolos forem mapeados nos vetores
universais com procedência. Adicionar como aba/leitura separada é violar a
tese do Akasha.

### A barra
Superar Gene Keys, Human Design e afins pela **integração coerente de muitas
tradições numa linguagem só + acionabilidade em todas as áreas da vida**.
Profundidade real no motor, simplicidade radical na experiência.

---

## Configuração do Orquestrador

Definida em `.omp/settings.json` (§4 da constituição):

```yaml
task:
  eager: false
  isolation:
    mode: worktree      # cada sub-agente no seu worktree
    merge: branch       # integra por branch
async:
  enabled: true
  maxJobs: 4            # começar baixo; subir só com folga de máquina

modelRoles:
  default: minimax/MiniMax-M2.7-highspeed  # implementação
  smol:    minimax/MiniMax-M2.7-highspeed  # exploração barata
  slow:    minimax/MiniMax-M2.7-highspeed  # design/síntese
  plan:    minimax/MiniMax-M2.7-highspeed
  commit:  minimax/MiniMax-M2.7-highspeed

compaction:
  enabled: true
  reserveTokens: 16384
  keepRecentTokens: 20000
  autoContinue: true

skills:
  enabled: true
```

---

## Guardrails (TTSR + Hooks — sem custo de contexto)

### TTSR (injeta só quando regex casa)
- **Anti-invenção:** trigger em sinais de "inventar correspondência esotérica" →
  injeta "use só a whitelist canônica derivada da pesquisa".
- **Migration-stop:** trigger em `prisma migrate`/`schema.prisma` → injeta
  "produza PROPOSAL, NÃO rode migration sem aprovação humana".
- **Discover-don't-invent:** trigger ao aplicar trabalho prescrito → injeta
  "`codegraph`/`read` o alvo real antes; specs envelhecem".
- **Anti-bloat:** trigger em criar `*-v2`/`*-new`/`-final` → injeta
  "edite o canônico, não versione paralelo".

### Hooks (pre/post tool_call, podem bloquear)
- Bloquear commit quando triad vermelho.
- Bloquear `bash` com `sudo`/migration sem confirmação.

---

## Git Flow por Iteração

```
branch: akasha-evolution/iter-{N}
  ├── architect worktree → design/  (não toca código)
  ├── coder worktree → implementation/
  └── main merge ← branch (via omp commit)

Commits são atômicos por mudança distinta (split se preciso).
Changelog entry por commit relevante.
```

---

## Métricas e Scaling

- Começar com **1 orquestrador**, `async.maxJobs: 4`.
- Build pesado concentrado no `qa` (um por vez) — protege a CPU.
- Subir `maxJobs` ou adicionar 2º orquestrador **só** se o primeiro saturar
  E houver folga de máquina.
- Verificar CPU/RAM/disco por uma hora (`omp stats`) antes de escalar.
