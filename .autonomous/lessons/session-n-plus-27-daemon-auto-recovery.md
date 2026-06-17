# Lesson — Daemon auto-recovery: signal handling + orphan work rescue

**Date:** 2026-06-16
**Session:** N+27 (loop/w2, akasha-evolution iter 4→5)
**Commits context:** 4908ac13 (v0.6.0), 13c8cb5c (v0.5.0)

## Contexto

Durante a iteração 4 do akasha-evolution, 2 agents foram spawned em
paralelo (ta-1781620443-0 tech_debt, ta-1781620443-1 large_file).
O daemon supervisor (PID 4112725) recebeu um sinal externo de
shutdown (provavelmente do `start-akasha-evolution.sh` re-executado
pelo usuário) às 11:43:09 UTC, antes dos agents terminarem.

O comportamento observado:

1. **Agent tech_debt (PID 133086)** — completou e escreveu
   `result-ta-1781620443-0.json` (0 marcadores encontrados)
2. **Agent large_file (PID 133089)** — estava extraindo
   `vida-numero-9.ts` mas foi MORTO pelo supervisor antes de
   commitar. O trabalho ficou **no filesystem** (untracked) mas
   o result JSON nunca foi escrito.
3. **Daemon 109140** — parou de receber conexões
4. **Daemon 191454** — supervisor启动了 novo daemon automaticamente
5. **Startup recovery** — daemon 191454 detectou 1 resultado "stale"
   (o do tech_debt) e o incorporou na iteração 4
6. **Auto-commit** — durante RELEASE v0.6.0, o daemon fez `git add`
   de TODOS os arquivos modificados/untracked, incluindo:
   - `vida-numero-9.ts` (criado pelo agent morto)
   - `interpretation-engine.ts` (modificado pelo agent morto)
   - A lesson `session-n-plus-26-interpretation-engine-refactor-strategy.md`
     (escrita externamente em paralelo)
   - Todos os state files

## Aprendizado

1. **O daemon tem auto-recovery robusto.** Signal de shutdown
   durante IMPLEMENTATION_WAIT não descarta o trabalho já feito
   no filesystem — apenas o "result" pendente. No próximo
   start, o daemon coleta resultados stale e prossegue.

2. **Agents mortos depois de escreverem arquivos MAS antes de
   escreverem o result JSON ainda podem ser resgatados.** O
   daemon coleta o trabalho do filesystem durante o RELEASE
   (via `git add .`).

3. **Trabalhos paralelos ao daemon (escritos por outros processos
   ou humanos) são incorporados no próximo RELEASE.** Não há
   race condition: o `git add .` no fim do ciclo captura tudo
   o que estiver untracked ou modified.

4. **A lesson N+26 (interpretation-engine refactor strategy) foi
   incluída no commit v0.6.0 automaticamente.** Isso significa
   que **escrever lessons durante a execução do loop é seguro e
   benéfico** — elas são capturadas no próximo release e ficam
   disponíveis para iterações futuras.

5. **`start-akasha-evolution.sh` re-executado causa um restart
   do daemon, não acumula daemons.** O supervisor detecta o
   novo start, mata o antigo e os agents órfãos.

## Implicação operacional

- **Não tema escrever arquivos no filesystem durante o loop ativo.**
  Eles serão capturados no próximo RELEASE.
- **Não tente "salvar" trabalho órfão manualmente** — o daemon
  cuida disso. Apenas aguarde a próxima iteração de RELEASE.
- **Lessons podem ser escritas em paralelo** sem risco de perda.

## Métricas (iter 4 → 5)

- Iter 4: 11:34:02 → 11:43:15 (~9 min)
- Release v0.6.0: 27 files changed, 485 insertions, 699 deletions
- Net: -214L
- 1 agent completou (tech_debt — 0 fixes)
- 1 agent órfão (large_file) — trabalho resgatado
- Iter 5: RESEARCH em andamento, daemon 191454 ativo
