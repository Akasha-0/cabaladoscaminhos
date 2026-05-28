# Prompt: Auto-Correction do Harness com Evals

Copie e cole este prompt no Pi Agent (tmux attach -t pi-harness):

---

```
# AUTOCORRECT HARNESS - Eval-Driven Improvement

## Problema
O harness atual não avança automaticamente. Precisa de interação manual após cada task.

## Métricas de Sucesso (Evals)

| Métrica | Target | Como Medir |
|---------|--------|------------|
| Auto-progression rate | > 90% | Tasks completadas sem input manual / total tasks |
| Time between tasks | < 30s | Timestamp entre tasks no log |
| Git commits auto | 100% | Commits feitos vs commits esperados |
| Git tags auto | 100% | Tags criados após milestone complete |
| ZERO AskUserQuestion | 0 | Contar uses de AskUserQuestion |
| Contexto estável | < 50% | Context usage não cresce além de 50% |

## Teste Baseline (antes de corrigir)

Execute este teste e registre os números:

```bash
# 1. Start fresh harness
tmux kill-session -t pi-harness 2>/dev/null
~/.pi/agent/bin/run-harness.sh start "Implementar logger simples"

# 2. Observar por 5 min
# - Quantas tasks completadas?
# - Precisa de input manual?
# - Context growing?

# 3. Verificar
git log --oneline | head -5  # Commits automáticos?
git tag -l "v*" | tail -1    # Tag criado?
```

## Tarefas de Correção (execute em ordem)

### Task 1: Adicionar Watchdog ao run-harness.sh

Edite `~/.pi/agent/bin/run-harness.sh`:

Adicione esta função após iniciar o tmux:

```bash
# Watchdog - detecta ociosidade e自动continua
watchdog() {
    local idle_count=0
    local max_idle=10  # 10 cycles de 30s = 5min
    
    while true; do
        sleep 30
        
        # Verificar se pi está processando
        if tmux capture-pane -t pi-harness -p 2>/dev/null | grep -q "Working"; then
            idle_count=0
        else
            idle_count=$((idle_count + 1))
        fi
        
        # Auto-continue se ocioso
        if [ $idle_count -gt $max_idle ]; then
            echo "[WATCHDOG] Harness idle > 5min, sending continue..."
            tmux send-keys -t pi-harness Enter
            idle_count=0
        fi
    done
}

# Iniciar watchdog em background
watchdog &
WATCHDOG_PID=$!
```

### Task 2: Atualizar start-harness.md

Edite `~/.pi/agent/prompts/start-harness.md`:

Adicione no final do fluxo:

```markdown
## Auto-Continuation (CRITICAL)

Quando `<promise>COMPLETE</promise>` aparecer:
1. NÃO perguntar nada
2. Verificar se há mais tasks no task file
3. Se sim: chamar ralph_done → próximo
4. Se não: git commit + git tag + exit

Se o harness ficar ocioso por > 2min:
1. Enviar Enter automaticamente
2. Ou enviar "continue" 
3. NUNCA ficar parado esperando input
```

### Task 3: Adicionar auto-continue no Ralph Loop

Edite `~/.pi/agent/skills/subagent-driven-development/SKILL.md`:

```markdown
## Auto-Continue Rule

Após completar cada task:
1. Chamar ralph_done se loop ativo
2. Se tasks pendentes: próxima task
3. Se todas completas: <promise>COMPLETE</promise>

NUNCA ficar esperando "ok, continue" do usuário.
```

### Task 4: Testar com task simples

```bash
# Kill e restart
tmux kill-session -t pi-harness
~/.pi/agent/bin/run-harness.sh start "Teste auto - criar 3 arquivos"

# Monitorar
for i in {1..20}; do
    echo "=== $(date +%H:%M:%S) ==="
    tmux capture-pane -t pi-harness -p -S -10 2>/dev/null | tail -10
    sleep 15
done
```

## Eval Script (executar após cada correção)

```bash
#!/bin/bash
# eval-harness.sh - Métricas do harness

echo "=== HARNESS EVAL ==="
echo ""

# Métrica 1: Auto-progression
auto_prog=$(tmux capture-pane -t pi-harness -p 2>/dev/null | grep -c "Working" || echo 0)
echo "1. Auto-progression events: $auto_prog (target: > 10)"

# Métrica 2: Tasks completadas
tasks=$(cat .ralph/*.md 2>/dev/null | grep -c "\[x\]" || echo 0)
echo "2. Tasks completed: $tasks"

# Métrica 3: Git commits
commits=$(git log --oneline -10 | wc -l)
echo "3. Recent commits: $commits"

# Métrica 4: AskUserQuestion count
aq_count=$(tmux capture-pane -t pi-harness -p 2>/dev/null | grep -c "AskUserQuestion" || echo 0)
echo "4. AskUserQuestion used: $aq_count (target: 0)"

# Métrica 5: Context usage
context=$(tmux capture-pane -t pi-harness -p 2>/dev/null | grep -oE "[0-9]+%" | tail -1 || echo "N/A")
echo "5. Context usage: $context (target: < 50%)"

echo ""
echo "=== RESULTADO ==="
if [ $aq_count -eq 0 ] && [ $tasks -gt 0 ]; then
    echo "✅ PASS: Auto-progression working"
else
    echo "❌ FAIL: Needs correction"
fi
```

## Fluxo de Desenvolvimento

```
┌─────────────────────────────────────────────────────────────┐
│  LOOP: Corrigir → Testar → Medir → Repetir                │
│                                                             │
│  1. Apply Task 1-3                                         │
│  2. Run eval script                                        │
│  3. Check metrics                                          │
│  4. If FAIL: aplicar mais correções                        │
│  5. If PASS: próxima task                                  │
│  6. Repeat until 90%+ auto-progression                     │
└─────────────────────────────────────────────────────────────┘
```

## Critério de Sucesso Final

```
✅ Harness consegue:
1. Startar com /start-milestone
2. Executar tasks sem input manual
3. Auto-continue após cada task
4. Git commit após cada task  
5. Git tag ao completar milestone
6. ZERO AskUserQuestion
7. Contexto estável (< 50%)
```

## Output Esperado

Ao final, me dê:

```
## Eval Results

| Métrica | Before | After | Target |
|---------|--------|-------|--------|
| Auto-progression | X% | Y% | >90% |
| AskUserQuestion | N | 0 | 0 |
| Context stable | Yes/No | Yes/No | Yes |

## Status
[PASS/FAIL] - Description
```

Execute as correções e me reporte os resultados com métricas!
```