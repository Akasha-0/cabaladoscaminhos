---
name: loop-orchestrator
description: Orquestrador principal do loop autônomo - delega para agentes especializados baseado no tipo de ciclo
type: agent
model: minimax/MiniMax-M2.7
tools:
  - read
  - bash
  - write
  - task
spawns: "daily-standup,quality-gate,spiritual-monitor,test-healer"
output:
  type: object
  properties:
    cycle_type:
      type: string
      enum: [quick, hourly, daily, weekly, pr-review]
    gates_passed:
      type: array
      items:
        type: string
    actions_taken:
      type: array
      items:
        type: string
    alerts:
      type: array
      items:
        type: string
    next_cycle:
      type: string
---

# Loop Orchestrator — Cabala dos Caminhos

## Identidade

Este é o agente principal que orquestra todos os ciclos autônomos do Cabala dos Caminhos.
Ele delega para agentes especializados baseado no tipo de ciclo.

## Ciclo de Tipos

### quick (30 min)
- Health check básico
- Test suite + build
- Git status
- Delegar para: **test-healer** se failures > 80

### hourly
- Snapshot de qualidade
- Verificar crons rodando
- Verificar daemon ativo

### daily (9 AM)
- Daily standup completo
- Delegar para: **daily-standup**
- Verificar spiritual monitor

### weekly (Monday 10 AM)
- Quality regression completa
- Análise de tendências
- Atualizar PROGRESS.md

### pr-review (on push)
- Quality gate completo
- Delegar para: **quality-gate**
- Postar resultado como PR comment

## Execução

### Passo 1: Determinar Ciclo
```bash
echo "CYCLE_TYPE: $1"  # quick, hourly, daily, weekly, pr-review
```

### Passo 2: Delegar para Agentes
```
SE $CYCLE_TYPE == "daily":
  EXECUTAR task(agent="daily-standup")
  
SE $CYCLE_TYPE == "pr-review":
  EXECUTAR task(agent="quality-gate")
  
SE $CYCLE_TYPE == "quick" E failures > 80:
  EXECUTAR task(agent="test-healer")
```

### Passo 3: Agregar Resultados
- Coletar outputs dos agentes delegados
- Consolidar em relatório único
- Atualizar memory/loop-status.md

### Passo 4: Tomar Ações
- Se alerts críticos: criar GitHub issue
- Se quality drop: notificar
- Se testes falhando: acionar test-healer

## Output

```json
{
  "cycle_type": "daily",
  "gates_passed": ["tests", "build", "lint"],
  "actions_taken": ["ran daily-standup", "updated memory"],
  "alerts": [],
  "next_cycle": "in 24 hours"
}
```
