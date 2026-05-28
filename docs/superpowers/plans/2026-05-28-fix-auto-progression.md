# Plano: Corrigir Auto-Progression do Harness

## Problema

O harness **não avança automaticamente**. Precisa de interação manual para continuar.

## Issues Identificadas

| Issue | Causa | Impacto |
|-------|-------|---------|
| Não avança automaticamente | Falta `ralph_done` ou prompt de continuação | Harness fica "travado" |
| Ralph para ao completar | Não há auto-trigger para próxima milestone | Processo morre |
| Contexto acumula | Cada iteração soma no mesmo session | Eventual token limit |

## Solução: Auto-Progression via Script

### Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────┐
│                  HARNESS ORCHESTRATOR                          │
│                                                                 │
│  1. pi-harness (tmux session)                                  │
│     └── pi process (mestre)                                     │
│         ├── Context Resolution                                 │
│         ├── Spec Creation                                       │
│         └── Spawn Ralph Loop                                    │
│                                                                 │
│  2. ralph-loop-orchestrator.sh (separado)                       │
│     ├── Executa em loop                                         │
│     ├── Spawns `pi --no-session` por iteração                  │
│     ├── Detecta tasks completadas via file                     │
│     └── Auto-progression: task done → next                     │
│                                                                 │
│  3. Auto-milestone.sh (cron ou watchdog)                        │
│     ├── Watchdog para detectar Ralph complete                   │
│     └── Auto-inicia próxima milestone                          │
└─────────────────────────────────────────────────────────────────┘
```

## Tasks

### Task 1: Atualizar ralph-loop-orchestrator.sh

**File:** `~/.pi/agent/scripts/ralph-loop-orchestrator.sh`

**Problema:** Script existe mas não está sendo usado pelo harness.

**Solução:** Integrar o script no fluxo do harness.

```bash
# Adicionar função auto-progression
auto_progression() {
    local iteration=$1
    local task_file=$2
    
    # Verificar se há tasks pendentes
    if grep -q "^\- \[ \]" "$task_file"; then
        # Há tasks pendentes - continuar
        echo "Continuing to next task..."
        return 0
    else
        # Todas completadas - marcar done
        echo "All tasks complete!"
        return 1
    fi
}

# Modificar loop para não perguntar, apenas continuar
while has_pending_work; do
    execute_pi_iteration
    if all_complete; then
        git commit + tag
        exit 0  # Em vez de travar, sair com sucesso
    fi
done
```

### Task 2: Criar auto-restart no harness

**File:** `~/.pi/agent/prompts/start-harness.md`

**Problema:** Harness para após completar tasks.

**Solução:** Adicionar ao final do fluxo:

```markdown
## Auto-Continuation

Quando Ralph Loop completa (`<promise>COMPLETE</promise>`):

1. Verificar se há mais tasks no backlog
2. Se sim: iniciar novo Ralph Loop com próxima task
3. Se não: aguardar novo `/start-milestone`

## Watchdog (opcional)

Se harness fica ocioso por > 5min sem progresso:
- Enviar "continue" automaticamente
- Ou executar `/ralph resume` se há loop pausado
```

### Task 3: Modificar run-harness.sh

**File:** `~/.pi/agent/bin/run-harness.sh`

**Problema:** Não há watchdog para detectar ociosidade.

**Solução:** Adicionar monitoramento:

```bash
# No loop principal, após iniciar pi:
watchdog_loop() {
    local idle_time=0
    local max_idle=300  # 5 minutos
    
    while true; do
        sleep 30
        
        # Verificar se harness está processando
        if tmux capture-pane -t pi-harness 2>/dev/null | grep -q "Working"; then
            idle_time=0
        else
            idle_time=$((idle_time + 30))
        fi
        
        # Se ocioso por muito tempo, tentar continuar
        if [ $idle_time -gt $max_idle ]; then
            echo "Harness idle for ${max_idle}s, sending continue..."
            tmux send-keys -t pi-harness Enter
            idle_time=0
        fi
    done
}
```

### Task 4: Criar auto-milestone script

**File:** `~/.pi/agent/scripts/auto-milestone.sh`

```bash
#!/bin/bash
# Auto-Milestone: detecta Ralph complete e inicia próxima

WATCH_DIR="/home/skynet/cabala-dos-caminhos/.ralph"
POLL_INTERVAL=60

while true; do
    # Procurar loops completados
    for state_file in "$WATCH_DIR"/*.state.json; do
        if [ -f "$state_file" ]; then
            status=$(jq -r '.status' "$state_file")
            if [ "$status" == "completed" ]; then
                echo "Loop completed: $(basename $state_file)"
                
                # Extrair próxima task do backlog
                backlog=$(find "$WATCH_DIR/../backlog" -name "*.md" 2>/dev/null | head -1)
                
                if [ -n "$backlog" ]; then
                    echo "Starting next milestone from backlog: $backlog"
                    # Aqui iniciaria o próximo loop
                fi
            fi
        fi
    done
    
    sleep $POLL_INTERVAL
done
```

### Task 5: Testar fluxo completo

**Teste:** Iniciar harness, executar task, verificar se continua automaticamente.

```bash
# 1. Start harness
~/.pi/agent/bin/run-harness.sh start "Implementar feature X"

# 2. Verificar que executa
tmux attach -t pi-harness

# 3. Verificar auto-progression
# - Após completar, deve continuar automaticamente
# - Sem perguntar

# 4. Verificar git tag ao completar
git tag -l "v*"
```

## Verification

### Test 1: Auto-progression

```bash
# Iniciar harness com task simples
tmux send-keys -t pi-harness "/start-milestone Implementar logger simples" Enter

# Aguardar ~2 min
sleep 120

# Verificar se continuou sem interação
# Se está em nova task, funcionou
```

### Test 2: Git tag automático

```bash
# Após completar, verificar
git tag -l "v*" | tail -1  # deve ter novo tag
git log --oneline -3        # deve ter commit recente
```

## Arquivos a Modificar

| File | Action | Change |
|------|--------|--------|
| `scripts/ralph-loop-orchestrator.sh` | Modify | Add auto-progression |
| `prompts/start-harness.md` | Modify | Add auto-continue |
| `bin/run-harness.sh` | Modify | Add watchdog |
| `scripts/auto-milestone.sh` | Create | New watchdog script |

## Tempo Estimado

- Task 1: 30 min
- Task 2: 15 min
- Task 3: 20 min
- Task 4: 20 min
- Task 5: 15 min
- **Total: ~100 min (1.5 horas)**

## Prioridade

| Task | Priority | Razão |
|------|----------|-------|
| Task 3 (Watchdog) | HIGH | Resolve travamento |
| Task 2 (Auto-continue) | HIGH | Resolver parar |
| Task 1 (Orchestrator) | MEDIUM | Funcionalidade existente |
| Task 4 (Auto-milestone) | LOW | Nice-to-have |
| Task 5 (Test) | HIGH | Validar fixes |