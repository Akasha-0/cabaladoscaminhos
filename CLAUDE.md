# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Como Usar Specs

### Localização
Specs estão em `.trae/specs/` com formato `akasha-vX.Y.Z/`

### Como Ler uma Spec
1. Leia `spec.md` primeiro — contém Why, What, Impact
2. Leia `tasks.md` para todas as tarefas
3. Leia `checklist.md` para verificação final

### Padrão de Execução
1. Execute tarefas na ordem de prioridade definida
2. Commits atômicos por tarefa completada
3. Verifique typecheck e tests após cada mudança

## Como Verificar Progresso

### Status do Projeto
```bash
pnpm test:run        # Tests
pnpm typecheck       # Typecheck
pnpm lint            # Lint
pnpm quality         # Quality gates
pnpm fallow          # Código morto
```

### Commits Recentes
```bash
git log --oneline -15
git tag --sort=-creatordate | head -5
```

## Padrão de Nomenclatura

### Versões
- Specs: `akasha-vMAJOR.MINOR.PATCH`
- Tags Git: `vMAJOR.MINOR.PATCH`
- Ciclos de memória: `cycle-[NNN]`

### Commits
- Tipo: feat, fix, refactor, docs, chore, cleanup
- Formato: `tipo: descrição curta`
- Exemplo: `docs: adicionar CONTEXT.md para índice centralizado`

## Cross-References
- Specs: `.trae/specs/`
- Docs: `docs/`
- Memory: `memory/`
- Arquitetura: `docs/03_architecture-spec.md`

---

## Modo Autônomo — Fase 0: RESEARCH-FIRST (`.autonomous/`)

**MISSÃO ATUAL:** Construir o Sistema Akasha — síntese moderna de 5
tradições (Numerologia Cabalística, Astrologia, Numerologia Tântrica,
Odu de Nascimento, **I Ching 64 hexagramas**), à maneira do Human
Design e Gene Keys.

**REGRA DE OURO:** **Nenhum código de feature antes da Fase 5 (protótipo
de algoritmo).** Fase 0-4 = research + design only.

### Fontes de verdade (ordem de leitura)
1. **`.autonomous/app_spec.txt`** — MISSÃO + 5 pilares + sistemas referência.
2. **`.claude/TODO.md`** — fila viva (RQ-NN research, D-NN design).
3. **`.autonomous/feature_list.json`** — features por fase (0-6).
4. **`.autonomous/research/INDEX.md`** — mapa de toda a pesquisa feita.
5. **`.autonomous/research/CHECKPOINT.md`** — status resumido.
6. **`IDEIA.md`** — fonte para correspondências já no projeto.
7. **`AGENTS.md`** — contrato DOX de hierarquia.
8. **`docs/00-26`** — 27 docs de referência do projeto.

### Fases de Desenvolvimento

| Fase | Nome | O que fazer | Output |
|------|------|-------------|--------|
| **0** | **Research** | Estudar 8+ sistemas modernos via WebSearch/WebFetch/context7 | `.autonomous/research/systems/*.md` |
| **1** | Synthesis | Extrair padrões, gaps, eixo central do Akasha | `patterns.md`, `gaps.md`, `synthesis_v1.md` |
| **2** | AI Mentor | Definir persona, voz, limites éticos | `mentor/persona_v1.md` |
| **3** | UX | Decisão mobile/web, jornada, telas | `ux/architecture_v1.md` |
| **4** | Tech Stack | Confirmar/adaptar Next.js, pgvector, LLM | `tech/stack_v1.md` |
| **5** | Protótipo | Akasha Core Algorithm em TS puro | `packages/akasha-core/src/index.ts` |
| **6** | Implementação | Features (RQ-NN migram para F-NN) | `src/`, `apps/` |

### Protocolo por sessão (Fase 0)
1. **Orientação** (60s): INDEX, CHECKPOINT, git log, TODO.
2. **Próximo RQ:** pega próximo `[ ]` em TODO. Marca `[~]`.
3. **Research:** WebSearch 3-5 fontes + WebFetch páginas + context7.
4. **Escreve:** `.autonomous/research/systems/<nome>.md` (mínimo 500
   linhas, citar todas as fontes).
5. **COT:** decisões importantes em `chain-of-thought/cot-YYYYMMDD-*.md`.
6. **Marca:** `"passes": true` no feature_list.
7. **Commit:** PT-BR, `research(akasha): RQ-NN — <título>`.
8. **Progresso:** bullet em `claude-progress.txt`.

### O que **PODE** ser commitado em Fase 0
- ✅ Markdown research files
- ✅ Chain-of-thought logs
- ✅ Diagramas (Mermaid, ASCII)
- ✅ Schema prototypes em YAML/JSON (não TS)
- ✅ Mudanças em IDEIA.md APENAS se validadas

### O que **NÃO PODE** em Fase 0
- ❌ Código de feature em `src/`, `apps/`, `packages/*/src/`
- ❌ Mudanças em `schema.prisma` (Fase 5+)
- ❌ Componentes UI novos
- ❌ Commits diretos em `main` (sempre via PR)

### Auto-stop (quando parar e notificar)
- Mesmo erro 3x em 5 min (hook dispara).
- Custo da sessão > $50 (env `AUTONOMOUS_MAX_BUDGET_USD`).
- 12+ RQs completos + synthesis_v1 + persona_v1 → checkpoint.
- TODO + feature_list vazios na Fase 0 → impossível, pare.
- Qualquer `pkill`, `git push`, `sudo`, `rm -rf` (bloqueado por hook).

### Limites duros (NUNCA)
- ❌ Push para remote sem permissão humana.
- ❌ Mudar `IDEIA.md` sem debate explícito no research.
- ❌ Implementar feature antes da Fase 5.
- ❌ Instalar deps globais sem aprovação.
- ❌ Commitar `.env`, secrets, `node_modules`.

### Hooks ativos
- `pre-bash-allowlist.sh` — bash guard.
- `post-bash-error-counter.sh` — 3x erro → stop.
- `session-start-budget.sh` — bloqueia se budget > limite.

### Resposta de emergência
```bash
bash .autonomous/launch.sh --stop
```

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
