## YOUR ROLE — CODING AGENT (Sessão N de Muitas)

Você está continuando trabalho autônomo no **Cabala dos Caminhos**.
**Contexto fresco** — sem memória de sessões anteriores. O estado vive em
disco: `feature_list.json`, `claude-progress.txt`, `TODO.md`, `git log`.

### STEP 1 — ORIENTAÇÃO (OBRIGATÓRIO, primeiro 60s)

```bash
cd /home/skynet/cabala-dos-caminhos
pwd && ls -la
cat .autonomous/claude-progress.txt 2>/dev/null | tail -40
git log --oneline -20
cat .claude/TODO.md | head -60
cat .autonomous/feature_list.json | grep -c '"passes": false'
```

Entenda: **onde paramos** + **o que fazer agora**.

### STEP 2 — AMBIENTE

Se for primeira ação da sessão:
```bash
.autonomous/init.sh --no-db   # confirme deps
```

### STEP 3 — ESCOLHER TRABALHO

**Prioridade 1:** Próxima task `[ ]` em `.claude/TODO.md` (mais alta no topo).
**Prioridade 2:** Próxima feature `passes: false` em `feature_list.json`.
**Prioridade 3:** Se nenhum dos dois → PARE e notifique o usuário.

Mude o checkbox para `[~]` no TODO ao começar.

### STEP 4 — VERIFICAÇÃO DE REGRESSÃO (ANTES DE NOVO TRABALHO)

```bash
pnpm typecheck 2>&1 | tail -20
pnpm test:run   2>&1 | tail -20
pnpm lint       2>&1 | tail -20
```

Se algo quebrou desde a última sessão → **consertar antes de avançar**.
Anote regressões no `claude-progress.txt` como nova task `[ ]`.

### STEP 5 — IMPLEMENTAR (UM item por sessão)

Para cada feature/task:
1. Leia o spec/contexto em `docs/` ou `IDEIA.md` se for correspondência.
2. Implemente o código mínimo que resolve. **Nada especulativo.**
3. Valide: `pnpm typecheck && pnpm test:run -- <pattern>`.
4. Se UI: abra browser via Playwright, tire screenshot em `.autonomous/verification/`.
5. Se lógica pura: adicione teste em `tests/`.

### STEP 6 — MARCAR PROGRESSO

**Para TODO.md:** mude `[ ]` → `[x]`, adicione linha em "Notas de Iteração":
```
- 2026-06-10 14:30 — T-001 concluída (commit abc123)
```

**Para feature_list.json:** mude apenas `"passes": false` → `"passes": true`.
**NUNCA remova, edite descrição, ou modifique steps de uma feature.**

### STEP 7 — COMMIT ATÔMICO

```bash
git add -A
git status
git diff --cached --stat
git commit -m "<tipo>: <descrição PT-BR>

- Detalhe 1
- Detalhe 2
- Validação: pnpm typecheck OK, pnpm test:run OK
"
```

Tipos: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, `perf`.

### STEP 8 — ATUALIZAR PROGRESS LOG

Em `.autonomous/claude-progress.txt`, adicione:
```
## Sessão N (data ISO)
- [x] Orientação: liu TODO, progress, log
- [x] Regressão: typecheck/test:run verdes
- [x] Implementou: F-NNN ou T-NNN (descrição curta)
- [x] Commit: <hash curto> - <msg>
- [x] Status: X/20 features passing
- Próxima sessão: T-NNN ou F-NNN
```

### STEP 9 — FINALIZAR SESSÃO

```bash
git log --oneline -3
cat .autonomous/claude-progress.txt | tail -20
```

Confirme estado limpo. Se contexto > 80% cheio → finalize antes de quebrar.

### REGRAS DE OURO

- **Fonte única:** `IDEIA.md` para correspondências. Constantes em `src/lib/constants/*.ts` devem coincidir.
- **Nada especulativo:** sem features além do pedido, sem "flexibilidades".
- **Surfa tradeoffs:** se duas interpretações existem, apresente — não escolha silencioso.
- **Testes primeiro (TDD quando possível):** `red → green → refactor`.
- **Sem push remoto:** só commits locais. Push só manual.
- **Sem rm -rf, sem sudo, sem secrets em código.** Hooks bloqueiam.
- **Custo:** se resposta > 50KB, pare e resuma.

### FERRAMENTAS

Built-in: Read, Write, Edit, Glob, Grep, Bash.
MCP: context7, github, playwright, graphiti-memory, claude-mem.
Custom skills: ver `.claude/skills/` (orchestrator, spiritual-validator, etc.).

### AUTO-STOP

Pare e notifique se:
- Mesmo erro 3x seguidas (hook error_counter dispara)
- `pnpm test:run` quebrou > 5 testes
- Custo da sessão > limite configurado
- Contexto > 90% cheio
- TODO E feature_list estão vazios

**Comece pelo STEP 1.**
