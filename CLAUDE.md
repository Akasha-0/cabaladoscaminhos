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

## Modo Autônomo (`.autonomous/`)

Quando a sessão for iniciada via `bash .autonomous/launch.sh`, este modo
ativo. **Você está rodando sem supervisão humana em tempo real.**

### Fontes de verdade (nesta ordem)
1. **`.claude/TODO.md`** — fila viva de tarefas (lida no STEP 1).
2. **`.autonomous/feature_list.json`** — backlog de features (pega `passes:false`).
3. **`.autonomous/app_spec.txt`** — spec consolidado do projeto.
4. **`IDEIA.md`** — fonte única para correspondências esotéricas.
5. **`AGENTS.md`** — contrato DOX de hierarquia de pastas.
6. **`docs/00-26`** — documentação canônica do projeto.

### Protocolo por sessão
1. **Orientação** (primeiros 60s): ler progress.txt, git log, TODO, feature_list.
2. **Regressão** (sempre antes de novo trabalho): `pnpm typecheck && pnpm test:run`.
3. **Trabalho:** implementar UM item por sessão. Sem scope creep.
4. **Marcar:** mudar `[ ]` → `[x]` no TODO; mudar `"passes": false` → `true` no JSON.
5. **Commit atômico** PT-BR: `tipo: descrição`.
6. **Atualizar** `.autonomous/claude-progress.txt` com bullet do que foi feito.

### Auto-stop (quando parar e notificar)
- Mesmo erro 3x em 5 min (hook `post-bash-error-counter.sh` dispara).
- Custo da sessão > $50 (configurável em `AUTONOMOUS_MAX_BUDGET_USD`).
- TODO + feature_list vazios.
- Mudança em `IDEIA.md` (sempre pare e peça validação humana).
- Qualquer `pkill`, `git push`, `sudo`, `rm -rf` (bloqueado por hook).

### Limites duros (NUNCA fazer)
- ❌ Push para remote sem permissão.
- ❌ Mudar `IDEIA.md` (ledger de correspondências).
- ❌ Deletar/modificar steps de `feature_list.json` (só mude `passes`).
- ❌ Instalar deps globais sem aprovação.
- ❌ Commitar `.env`, secrets, `node_modules`.

### Hooks ativos (wired em `.claude_settings.json`)
- `pre-bash-allowlist.sh` — só permite comandos dev seguros.
- `post-bash-error-counter.sh` — 3x mesmo erro → stop signal.
- `session-start-budget.sh` — bloqueia se budget diário > limite.

### Resposta de emergência
Se algo parecer errado (loop infinito, custo subindo, comportamento
estranho): escreva `bash .autonomous/launch.sh --stop` em OUTRA sessão
para parar o orchestrator.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
