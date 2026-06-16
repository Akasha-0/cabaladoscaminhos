# Lesson — Daemon stuck in RESEARCH: phase_research exception swallowed before save_state

**Date:** 2026-06-16
**Session:** N+31 (loop/w2, akasha-evolution iter 8)
**Daemon affected:** 432213 (12:13 → 12:29, 16 min stuck)

## Contexto

Durante a iteração 8, o daemon ficou PRESO em loop infinito chamando
`phase_research()` repetidamente (~1 vez por segundo) durante 16
minutos. O `state.json` no disco continuava com `phase: "RESEARCH"`
mesmo a função tentando setar `phase: "PLANNING"`.

## Diagnóstico

Sintomas observados:
- `state.json` mtime: 12:13:57 (não atualiza mais)
- `/tmp/daemon-stdout.log`: mostra "RESEARCH (iter 8): 6 cand, 5 selected" repetidamente
- `/tmp/daemon-stderr.log`: vazio (sem exceptions)
- `daemon_pid: 432213` ativo, sem child processes

## Causa raiz

A função `phase_research` (linha 118-148 do `akasha-loop-daemon.py`):

```python
def phase_research(state, memory):
    ...
    if not selected:
        ...
        state["phase"] = "RELEASE"
        save_state(state)              # ← save_state OK
        ...
        return

    _rec_dec(memory, selected)
    save_json(TASK_FILE, ...)          # ← OK
    save_json(IMPL_FILE, ...)          # ← OK
    state["phase"] = "PLANNING"        # ← in-memory only
    state["current_features"] = [...]  # ← in-memory only
    dur = _evals.phase_end("RESEARCH") # ← OK
    _tracker.record_research(...)      # ← **LEVANTA EXCEPTION** (?)
    # save_state(state)               # ← NUNCA EXECUTADO
```

A chamada `_tracker.record_research(...)` no final de `phase_research`
está levantando uma exception. O main loop captura a exception
(`except Exception as e: log(f"Phase {ph} error: {e}")`), mas o
`state` em memória (com `phase="PLANNING"`) é perdido. A próxima
iteração do main loop chama `load_state()` que lê do disco
(`phase="RESEARCH"`) → loop infinito.

## Correção aplicada (manual)

```bash
# 1. Parar o daemon stuck
kill 432213

# 2. Supervisor detectou e reiniciou automaticamente (494079)
#    Mas o novo daemon também travou no mesmo loop

# 3. Fix manual do state.json para forçar advance
cat > .autonomous/multi-agent/state.json << 'EOF'
{
  "phase": "PLANNING",
  "iteration": 8,
  "current_features": [...],
  "running": true,
  "phase_iteration": 0
}
EOF

# 4. Supervisor reiniciou (495596) e o daemon leu PLANNING
#    → prosseguiu para PLANNING → IMPLEMENTATION → IMPLEMENTATION_WAIT
```

## Aprendizado

1. **save_state deve ser chamado IMEDIATAMENTE após mudar phase.**
   A função `phase_research` modifica o state em memória e confia
   no `_tracker.record_research` para chamar save_state
   indiretamente. Se o tracker falha, o state é perdido.

2. **O main loop não diferencia exception "real" de "log-and-continue".**
   A exception é logada mas o loop continua. Para RESEARCH, isso
   significa REPETIR a fase sem avançar. O ideal seria parar
   após N retries consecutivos com a mesma exception.

3. **Não há signal visível para o usuário quando o daemon trava.**
   O stdout mostra a fase repetindo, mas só alguém olhando
   cuidadosamente nota. Seria útil um watchdog que detectasse
   "N mensagens idênticas em T segundos" e alertasse.

4. **O supervisor restart é a rede de segurança**, mas só ajuda
   se o bug não é persistente. Aqui o bug é persistente (no
   código, não no estado), então o novo daemon também travou.
   A correção manual do state foi necessária.

## Sugestão de patch (proposal)

Reforçar `phase_research` para chamar `save_state` ANTES do tracker:

```diff
   state["phase"] = "PLANNING"
   state["current_features"] = [imp.get("type") for imp in selected]
+  save_state(state)              # ← persistir ANTES do tracker
   dur = _evals.phase_end("RESEARCH")
   _tracker.record_research(...)
```

E adicionar retry counter no main loop:

```diff
   while load_state().get("running", False):
       ...
       try:
           ph_fn(...)
       except Exception as e:
           log(f"Phase {ph} error: {e}")
+          retries = load_state().get("_phase_retries", {})
+          retries[ph] = retries.get(ph, 0) + 1
+          if retries[ph] > 5:
+              log(f"Phase {ph} failed 5x, alerting")
+              # enviar signal ou notification
+          save_state({**load_state(), "_phase_retries": retries})
           time.sleep(5)
```

## Custo medido

- 16 min wall-clock de daemon stuck (12:13 → 12:29)
- 1 intervenção manual (kill + state fix)
- 0 commits de código perdidos
- 1 lesson (esta)

## Estado final após fix

- 12:30:04: PLANNING (iter 8) completou
- 12:30:05: IMPLEMENTATION: 5 agents spawned
- 5 agents paralelos: missing_tradition, missing_tests, tech_debt,
  console_cleanup, large_file
- Iter 8 em IMPLEMENTATION_WAIT
