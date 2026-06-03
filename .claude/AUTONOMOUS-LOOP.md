# Loop Autônomo — Ativação e Monitoramento

## Sistema Ativo ✅

O projeto Cabala dos Caminhos agora tem um loop autônomo completo rodando via systemd user timers.

## Arquitetura

```
systemd (user session)
├── cabala-quick.timer    (every 20min: :13, :33, :53)
│   └── cabala-quick.service → cabala-loop-runner.sh quick
├── cabala-hourly.timer   (every hour at :07)
│   └── cabala-hourly.service → cabala-loop-runner.sh hourly
├── cabala-night.timer    (daily at 23:00)
│   └── cabala-night.service → cabala-loop-runner.sh night
└── cabala-standup.timer  (Mon-Fri at 09:00)
    └── cabala-standup.service → cabala-loop-runner.sh standup
```

## Scripts

- `.claude/scripts/cabala-loop-runner.sh` — executor de 1 ciclo (5 modos)
- `.claude/scripts/cabala-loop-systemd.sh` — gerencia systemd services
- `.claude/scripts/cabala-loop-cron.sh` — fallback se systemd indisponível

## Comandos

```bash
# Status dos timers
systemctl --user list-timers | grep cabala

# Ver logs recentes
tail -f ~/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-quick.log
tail -f ~/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-hourly.log

# Pausar/resumir
systemctl --user stop cabala-quick.timer cabala-hourly.timer
systemctl --user start cabala-quick.timer cabala-hourly.timer

# Desativar completamente
systemctl --user stop cabala-quick.timer cabala-hourly.timer cabala-night.timer cabala-standup.timer
systemctl --user disable cabala-quick.timer cabala-hourly.timer cabala-night.timer cabala-standup.timer

# Reativar
systemctl --user enable --now cabala-quick.timer cabala-hourly.timer cabala-night.timer cabala-standup.timer

# Rodar manualmente (sem esperar o timer)
./.claude/scripts/cabala-loop-runner.sh hourly
./.claude/scripts/cabala-loop-runner.sh quick
./.claude/scripts/cabala-loop-runner.sh standup

# Status detalhado
bash .claude/scripts/cabala-loop-systemd.sh status
```

## Como Funciona Cada Modo

| Modo | Budget | Schedule | O que faz |
|------|--------|----------|-----------|
| `quick` | 15 min | 20/40/60min | 1 tarefa P0/P1 pequena |
| `hourly` | 45 min | :07 every hour | 1 iteração completa |
| `night` | 9 horas | 23:00 daily | quantas iterações caberem |
| `standup` | 5 min | 09:00 M-F | relatório diário |
| `weekly` | 30 min | Sunday 22:00 | manutenção |

## Outputs

- **Cycle memory**: `~/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cycle-NNN.md`
- **Logs**: `~/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-{mode}.log`
- **scheduled_tasks.json**: atualizado com `last_run` e `last_status` após cada execução

## Pré-requisitos para Funcionar

1. **Claude Code instalado**: `/home/skynet/.local/bin/claude`
2. **Modelo configurado**: `CLAUDE_MODEL=MiniMax-M2.7` (ou `claude` para usar default)
3. **Prompt loop**: `~/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/loop-prompt.md`
4. **Task queue**: `~/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/task-queue.md`
5. **systemd --user session ativa**: `systemctl --user status` deve mostrar "running"

## Solução de Problemas

**Timer não dispara?**
```bash
# Verificar se o timer está ativo
systemctl --user status cabala-quick.timer

# Ver último resultado do service
journalctl --user -u cabala-quick.service --no-pager -n 30
```

**Loop trava em "ALREADY_RUNNING"?**
```bash
# Verificar locks pendurados
ls ~/.claude/state/locks/cabala-loop/
# Remover locks velhos manualmente
rm -rf ~/.claude/state/locks/cabala-loop/*.lock
```

**Output vazio?**
```bash
# O script cria o output em /tmp — verificar
ls /tmp/*.tmp 2>/dev/null
# O output vai para memory/cycle-*.md após completion
```
