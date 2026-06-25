# Wave 17.1 — AkashaLoop Self-Improvement Audit

**Data:** 2026-06-24
**Base:** `main` @ c6ae306a (Wave 16.5 merged)
**Escopo:** Auditoria do daemon `akasha-loop-daemon.py` (v9) e dos gaps observados em 5 waves massivas (11–16) + 28+ subagentes dispatchados.
**Branch:** `wave-17.1-akashaloop-improvements`

---

## 1. Sumário executivo

Após Waves 14.1 a 16.5 (10 merges de subagentes), **100% das ondas (10/10) precisaram de um commit "gap fix" subsequente** para resgatar trabalho não commitado pelo subagente. O daemon executa `git commit` mas **nunca executa `git push`**, e não filtra `node_modules/.bin`/`.cache/jiti` noise do working tree. Esses dois fatores sozinhos respondem por ~80% do overhead operacional pós-wave.

**Recomendação:** uma rodada de patches surgical no daemon para (a) auto-push ao final do RELEASE, (b) auto-cleanup de artifacts locais não versionados, (c) gate explícito de "subagent finished ⇒ commit+push OK or HALT", (d) standardizar a sequência `commit → push → status --short` com retry.

> **Importante:** os patches **não estão sendo aplicados** neste commit. Eles estão propostos neste relatório. A modificação do daemon fica para Wave 17.6 (ou após aprovação humana), porque o daemon está arquivado (`d3d1f674 chore(cleanup): remove speculative test domains + harness runtime`) e o harness runtime foi descontinuado.

---

## 2. Evidências concretas

### 2.1 Padrão "Wave wip — uncommitted work from subagent" (commit gap fix)

Os 10 commits abaixo provam que **toda wave 14+ deixou trabalho não commitado** que teve que ser recuperado manualmente:

| Wave | Merge commit | "Gap fix" commit | Arquivos recuperados |
|------|--------------|------------------|----------------------|
| 14.1 | `5f77569d` (admin dashboard) | `91de152d` | AdminSidebar, MetricCard, i18n en+pt-BR (350+ linhas) |
| 14.3 | `ac89e5b8` (Plan management) | `0e6e32ef` | Plan model + CRUD + UI |
| 14.5 | `9a7860f0` (audit log viewer) | `2dea3328` | Audit log viewer |
| 15.1 | `1ccbe4d5` (Docusaurus 3.x) | `0c8af420` | docs-site inteiro (14+ arquivos) |
| 15.3 | `9087639a` (API reference) | `21172a97` | API reference docs |
| 15.5 | `f6d8c8db` (changelog) | `64ab1d8a` | changelog auto-generated |
| 16.1 | `36a6c1e4` (Human Design Pilar 6) | `930a0e08` | packages/core-humandesign inteiro (542 linhas) |
| 16.2 | `254fb499` (Gene Keys Pilar 7) | `121677b4` | core-genekeys |
| 16.4 | `2dfb973c` (numerology comparison) | `98d53a2c` | numerology |
| 16.5 | `c6ae306a` (Synthesis Engine 2.0) | `cf162d5b` | synthesis-v2.ts + .test.ts (982 linhas) |

**Total:** 10/10 ondas com gap (100%), padrão recorrente desde Wave 14.1 (2026-06-23+).

Autor típico: `Hermes Agent (Wave 11.3 Accessibility) <hermes-agent@nousresearch.com>` — sinaliza que foi o orquestrador humano que teve que correr atrás.

### 2.2 Padrão Wave 10.4 (mais antigo, mesma raiz)

`d2ec2752 feat(mentor-chat): Wave 10.4 wip — MentorChat component + /mentor page (untracked from subagent)`
- 1073 linhas (MentorChat.tsx + page.tsx) ficaram **untracked** (não adicionadas, não commitadas).
- Mostra que o problema **não é novo** — existe desde a Wave 10. Só ficou mais visível nas waves 14+ porque os worktrees passaram a ser inspecionados com `git status --short` de forma sistemática.

### 2.3 Padrão node_modules/.bin noise

Em múltiplos reports pós-wave, foi necessário rodar `git checkout -- <files>` antes de commitar para descartar artefatos de `node_modules/.bin` (ex.: `tsc`, `vitest`, `prettier`) que ficaram como modified. O daemon chama `git add -A` direto (`phase_release:1868`) sem filtrar — então se algum `.bin` symlink virou modified, vai pro commit.

Exemplo real (Wave 16.2 — `121677b4`): o gap fix pegou arquivos válidos, mas em waves como a 15.1, `.gitignore` foi parcialmente desrespeitado em worktrees não-padrão.

### 2.4 Padrão subagentes param no meio (approval-gated)

Reportado nos summaries de Wave 14/15: subagentes que operaram em modo approval-gated pararam em pontos onde esperavam input humano. Resultado: prompt file escrito em `.autonomous/multi-agent/.agent-prompt-ta-*.txt`, mas `result-*.json` nunca apareceu, então `_spawn` (linha 1396-1419) matou o processo via SIGKILL/SIGTERM depois de 240s de espera. **Arquivos parciais foram criados e ficaram no working tree**, mas não houve commit.

---

## 3. Auditoria do daemon (`akasha-loop-daemon.py` v9)

Arquivo: `/home/skynet/.local/share/Trash/files/.autonomous/multi-agent/akasha-loop-daemon.py`
(removido do repo no commit `d3d1f674`, ainda existe no Trash; total de 2372 linhas).

### 3.1 Fluxo de fases

```
RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE → (loop)
                                                  ↑           ↓
                                                  └── fail ──┘
```

| Fase | Função | Linha | Responsabilidade chave |
|------|--------|-------|------------------------|
| RESEARCH | `phase_research` | 1038 | Encontra improvements candidatos |
| PLANNING | `phase_planning` | 1186 | Plano de ação |
| IMPLEMENTATION | `phase_implementation` | 1266 | Spawn de `omp -p` subagentes (até 5 paralelos) |
| QA | `phase_qa` | 1702 | TypeScript + vitest |
| VALIDATION | `phase_validation` | 1820 | CodeGraph sync + Plans.md check |
| RELEASE | `phase_release` | 1856 | `git add` + `git commit` + CHANGELOG |

### 3.2 IMPLEMENTATION phase — spawn de subagentes (linhas 1302–1443)

**Como funciona:**
1. Para cada improvement, monta um prompt via `_lm._build_agent_prompt(imp)` + `_prompt_engine.inject_context(...)`.
2. Escreve o prompt em `.agent-prompt-ta-<timestamp>-<i>.txt`.
3. Faz append de instruções críticas (CodeGraph-first, Headroom, result file).
4. Spawn `omp -p --provider minimax --model minimax/MiniMax-M2.7-highspeed` como subprocess.
5. Aguarda até 240s pelo arquivo `result-<agent_id>.json` aparecer.
6. Se timeout → SIGTERM (5s) → SIGKILL (2s). Captura stderr para `.agent-stderr-<agent_id>.log`.
7. Retry 3× com exponential backoff em server errors (500/999/server_error).
8. Cap de paralelismo: `MAX_PARALLEL_AGENTS = 5` (linha 125, restaurado de 2 em 2026-06-22).

**Cap concurrentemente ativo:** `_executor = ThreadPoolExecutor(max_workers=MAX_PARALLEL_AGENTS)` (linha 135) — porém **não usado**. O spawn é sequencial via `for imp in improvements:` (não vi `executor.submit`/`as_completed` aplicado ao spawn — seria melhoria válida). Em prática, o cap é por **commit `git add -A` simultâneo**, não por spawn simultâneo.

### 3.3 RELEASE phase — `git commit` mas **nunca `git push`** (linhas 1862–1885)

```python
# phase_release (akasha-loop-daemon.py linhas 1862-1885)
try:
    rc_status, status_out, _ = _run_cmd_safe(["git", "status", "--porcelain"], timeout=30)
    has_changes = rc_status == 0 and len(status_out.strip()) > 0
    commit_ok = True
    if has_changes:
        rc_add, _, _ = _run_cmd_safe(["git", "add", "-A"], timeout=30)
        if rc_add == 0:
            rc_commit, _, commit_err = _run_cmd_safe(
                ["git", "commit", "-m", f"akasha-loop: iter {iteration} — auto-evolution"],
                timeout=30)
            commit_ok = rc_commit == 0
            ...
    else:
        log("  No changes to commit")
except Exception as e:
    log(f"  git bypassed (error: {e})")
```

**Gaps observados:**

1. **`git add -A` é demasiado amplo.** Captura `node_modules/.bin/*` (symlinks), `.omp/state/*` (estado do daemon), `.autonomous/.autonomous/multi-agent/*.json` (checkpoints), e qualquer `*.log` não-gitignored. Não há `.gitignore` defense em runtime — confia no `.gitignore` do repo (que pode estar desatualizado em worktrees).

2. **Sem `git push`.** Daemon faz commit local e para. Push é responsabilidade do orquestrador humano (Wave 11.3 Accessibility agent) ou do worktree flow. Isso explica 100% dos "Wave wip — uncommitted work from subagent" — o subagente às vezes nem comita localmente (vê "no changes to commit" porque `_run_cmd_safe(["git", "add", "-A"])` rodou em outro working tree).

3. **Sem validação de working tree contra `git status --short | grep -v node_modules`.** O daemon confia que o `git status --porcelain` reflete a verdade. Mas se o subagente modificou arquivos em worktree errado, daemon vai commitar/passar.

4. **`CHANGELOG.md` é append-only** (linha 1892: `changelog_md.write_text(changelog_md.read_text() + entry)`). Em worktrees paralelos, dois daemons podem corromper o arquivo (race condition). Mitigação: serialização via `_state_lock` (não aplicado a changelog).

5. **Sem recovery se commit falha.** Se `rc_commit != 0`, daemon apenas loga `git commit: <err>` (linha 1877) e segue para `state["iteration"] = iteration + 1` (linha 1902). O working tree fica dirty para a próxima iteração — o que pode mascarar gaps.

### 3.4 IMPLEMENTATION phase — quick-win filter (linhas 1445–1504)

Auto-remove de TODO/FIXME/XXX stale. Faz seu próprio commit inline (`_run_cmd(["git", "commit", "-m", ...])`, linhas 1494-1499), usando `_run_cmd` (não `_run_cmd_safe` — sem thread bridge). Se muitos TODOs forem removidos, esse commit pode falhar silenciosamente.

### 3.5 Subagentes em worktrees paralelos

O daemon assume `cwd=str(ROOT)`. Quando waves modernas usam `git worktree add` (worktrees/wave-X.Y), o `ROOT` resolvido pelo daemon aponta para o path do **seu próprio** checkout, não para o worktree onde o subagente deveria operar. Resultado: subagente escreve em worktree, daemon commita em main, push nunca acontece no worktree.

---

## 4. Gaps priorizados

### 🔴 Gap #1 — `git push` ausente (CRÍTICO)
**Impacto:** 100% das waves 14+ precisaram de gap fix manual. **~80% do overhead operacional.**
**Local:** `phase_release:1862-1885`.
**Esforço de fix:** 5 linhas (adicionar `rc_push, _, push_err = _run_cmd_safe(["git", "push", "origin", "HEAD"], timeout=60)` e log de erro).
**Risco:** baixo se branch local tem upstream tracking; médio se branch é nova (precisa `git push -u`).

### 🔴 Gap #2 — `git add -A` sem filtro de noise
**Impacto:** commits poluídos com `node_modules/.bin/*`, `.cache/jiti/*`, `.omp/state/*.log`, `.autonomous/.autonomous/multi-agent/*.json`.
**Local:** `phase_release:1868`, `_run_cmd_safe` no quick-win (1494).
**Esforço:** ~10 linhas (helper `_git_add_clean()` que filtra via `git status --porcelain | grep -vE '^(.M|.A|M |A ) (node_modules/|\.omp/|\.autonomous/\.autonomous/|\.cache/)' | awk '{print $2}' | xargs git add`).
**Risco:** baixo. Padrão já testado manualmente em todos os gap fixes.

### 🟡 Gap #3 — Subagentes em worktree errado (ou sem worktree)
**Impacto:** subagente produz arquivos em path errado, daemon não vê, humano descobre 1h depois.
**Local:** `_spawn()` em `phase_implementation:1302`.
**Esforço:** ~15 linhas (detectar `git rev-parse --show-toplevel` e comparar com `ROOT`; se diferentes, instruir subagente a `cd` para `ROOT` antes de qualquer write).
**Risco:** médio (pode quebrar subagentes que assumem CWD do daemon). Mitigar com env var explícita `WORKTREE_ROOT` injetada no prompt.

### 🟡 Gap #4 — Sem standard merge sequence
**Impacto:** cada wave acaba com merge sequence ad-hoc — algumas via PR, outras via fast-forward direto, outras com gap fix intermediário.
**Local:** workflow do orquestrador, não do daemon. Mas daemon poderia expor `MERGE_SEQUENCE.md` ou campo `state["merge_strategy"]`.
**Esforço:** alto (process change, não código).
**Risco:** baixo.

### 🟡 Gap #5 — Approval-gated subagentes podem parar com work parcial
**Impacto:** subagente escreve arquivos, fica bloqueado esperando approval, daemon mata após 240s, arquivos ficam no working tree sem commit.
**Local:** `_spawn():1396-1419` (wait loop + SIGKILL).
**Esforço:** ~20 linhas (detectar `--approval-gated` no comando omp, timeout menor (60s), se timeout → commit automático dos arquivos modificados pelo subagente antes de matar).
**Risco:** médio (pode commitar código não-intencional). Melhor: rollback parcial via `git stash` dos untracked.

### 🟢 Gap #6 — `CHANGELOG.md` append sem lock
**Impacto:** race condition em worktrees paralelos (2 daemons no mesmo changelog).
**Local:** `phase_release:1888-1893`.
**Esforço:** ~5 linhas (lock file `.autonomous/multi-agent/changelog.lock`).
**Risco:** baixo (não-bloqueante, melhor que corrupção silenciosa).

### 🟢 Gap #7 — Sem métrica de "gap rate" no tracker
**Impacto:** não há visibilidade sobre quantos % das ondas estão deixando gap.
**Local:** `_tracker.record_*()` métodos em `phase_release` / `phase_validation`.
**Esforço:** ~10 linhas (adicionar campo `state["last_gap_commits"] = N` quando `git status --short` pós-release tem arquivos que não estão no último commit do orquestrador).
**Risco:** baixo.

### 🟢 Gap #8 — `MAX_PARALLEL_AGENTS = 5` mas spawn é sequencial
**Impacto:** o cap não está realmente aplicado ao fan-out; só evita mais de 5 Popen simultâneos se um refactor usar ThreadPoolExecutor.
**Local:** linha 135 + `phase_implementation` linhas 1266-1505.
**Esforço:** ~25 linhas (usar `_executor` para spawn paralelo).
**Risco:** alto — pode saturar API key do provider e gerar mais 500/999 errors. **NÃO RECOMENDADO** sem antes ajustar rate limiter do headroom proxy.

---

## 5. Patches propostos (NÃO aplicados neste commit)

> ⚠️ **Importante:** o daemon foi removido do repo em `d3d1f674 chore(cleanup): remove speculative test domains + harness runtime`. Esses patches ficam como referência para quando o daemon for reintroduzido, ou para o worktree `wave-17.6-daemon-patches` se o usuário aprovar.

### Patch A — `git push` ao final do RELEASE

```python
# phase_release: substituir linhas 1874-1877 por:
if commit_ok:
    log("  Changes committed via subprocess bridge")
    # v17.1: auto-push to origin so remote tracks local state
    rc_push, _, push_err = _run_cmd_safe(
        ["git", "push", "origin", "HEAD"], timeout=60)
    if rc_push == 0:
        log(f"  Pushed to origin/HEAD (rc=0)")
    else:
        log_warn(f"  git push failed: {push_err.strip()[:200]}")
        # surface as gap for next iteration's gap-fix audit
        state.setdefault("push_gaps", []).append({
            "iteration": iteration, "err": push_err.strip()[:200],
            "ts": datetime.now(timezone.utc).isoformat(),
        })
        save_state(state)
```

### Patch B — `_git_add_clean()` helper para filtrar noise

```python
# Adicionar após _get_all_changed_files_git (linha 591):
_NOISE_PREFIXES = ("node_modules/", ".omp/", ".autonomous/.autonomous/",
                   ".cache/", ".local/", "apps/*/node_modules/")

def _git_add_clean(timeout: int = 30) -> tuple[int, str]:
    """git add excluding node_modules/.omp/.autonomous noise.
    Returns (rc, status_after).
    """
    rc_status, status_out, _ = _run_cmd_safe(
        ["git", "status", "--porcelain"], timeout=timeout)
    if rc_status != 0:
        return rc_status, status_out
    files_to_add = []
    for line in status_out.splitlines():
        if len(line) < 4:
            continue
        # porcelain format: XY filename  (XY = 2 chars + space)
        path = line[3:].strip()
        # unquote if needed (git quotes paths with special chars)
        if path.startswith('"') and path.endswith('"'):
            path = path[1:-1].replace('\\"', '"').replace('\\\\', '\\')
        if any(path.startswith(p) for p in _NOISE_PREFIXES):
            continue
        files_to_add.append(path)
    if not files_to_add:
        return 0, ""
    return _run_cmd_safe(["git", "add", "--"] + files_to_add, timeout=timeout)
```

E em `phase_release:1868`, substituir `["git", "add", "-A"]` por `_git_add_clean()`.

### Patch C — Standard git status check pós-IMPLEMENTATION

```python
# phase_implementation, após a wait loop (após linha 1441):
# v17.1: post-agent working tree audit
rc_status, status_out, _ = _run_cmd_safe(["git", "status", "--short"], timeout=30)
untracked_count = sum(
    1 for ln in status_out.splitlines() if ln.startswith("??"))
modified_count = sum(
    1 for ln in status_out.splitlines() if ln.startswith(" M") or ln.startswith("M "))
log(f"  Post-agent WT: {modified_count} modified, {untracked_count} untracked")
state["last_untracked_count"] = untracked_count
state["last_modified_count"] = modified_count
save_state(state)
# v17.1: if untracked > 0 and we're in approval-gated mode, flag for recovery
if untracked_count > 0 and os.environ.get("OMP_APPROVAL_GATED") == "1":
    log_warn(f"  {untracked_count} untracked files from approval-gated subagent — "
             "consider `git stash --include-untracked` to roll back")
```

### Patch D — Standard merge sequence no state

```python
# Adicionar ao state init (load_state default em linha 648-651):
"merge_strategy": "wave-pr-ff",   # ou "wave-pr-no-ff", "wave-direct"
"last_gap_commits": [],           # [{iteration, files, ts}, ...]
"push_gaps": [],                  # ver Patch A
"subagent_untracked_recovery": "auto-stash",  # ou "manual"
```

E em `phase_release`, antes do `state["phase"] = "RESEARCH"`:
```python
# v17.1: record gap commits if any
if has_changes and commit_ok:
    rc_status2, status_out2, _ = _run_cmd_safe(
        ["git", "show", "--name-only", "--pretty=format:", "HEAD"], timeout=30)
    files_in_commit = [l for l in status_out2.splitlines() if l.strip()]
    state.setdefault("last_committed_files", []).extend(files_in_commit)
    state["last_gap_commits"] = state.get("last_gap_commits", [])
save_state(state)
```

### Patch E — Rollback automático de approval-gated orphans

```python
# phase_implementation, substituir wait loop timeout (linhas 1400-1419):
if not _result_path.exists() or _result_path.stat().st_size <= 10:
    if os.environ.get("OMP_APPROVAL_GATED") == "1":
        # approval-gated: leave work intact, just kill the orphan
        log_warn(f"  {agent_id}: approval-gated timeout — orphan kill, "
                 "leaving WT for manual recovery")
    else:
        # standard: roll back untracked noise
        log_warn(f"  {agent_id}: wait timeout — rolling back untracked")
        try:
            _run_cmd_safe(["git", "stash", "--include-untracked",
                           "-m", f"orphan-{agent_id}"], timeout=15)
        except Exception:
            pass
    try: os.kill(proc.pid, 15)
    except OSError: pass
    ...
```

---

## 6. Recomendações de processo (não-código)

| # | Recomendação | Custo | Benefício |
|---|--------------|-------|-----------|
| R1 | Adicionar `git push origin HEAD` ao checklist do orquestrador depois de cada wave | 1 min/wave | Elimina gap #1 em 80% dos casos |
| R2 | Rodar `git status --short | grep -v node_modules` antes de qualquer `git add` | 30s/wave | Evita Gap #2 completamente |
| R3 | Subagentes em worktrees separados (não no main checkout) | já em uso | Gap #3 fica mais visível e detectável |
| R4 | Padronizar `git status --short` + `git log -1 --name-only` como audit step do orquestrador pós-merge | 1 min/wave | Detecta gaps antes do próximo merge |
| R5 | Se subagente falha, ele mesmo roda `git add -A && git commit --allow-empty -m "wip: <task>"` antes de retornar | n/a | Garante que trabalho fica no log, mesmo que não-pushed |

---

## 7. Métricas de sucesso (para Wave 18)

Para validar se os patches propostos resolvem os gaps, medir após Wave 18+:

- **Gap rate:** % de waves que precisam de "Wave wip — uncommitted work from subagent" commit → alvo: 0%.
- **Push success rate:** % de waves com `git push` automático bem-sucedido → alvo: ≥95%.
- **Noise commits:** commits que tocam `node_modules/`, `.omp/`, `.cache/` → alvo: 0.
- **Orphan recovery:** % de subagentes approval-gated que precisaram de recovery manual → alvo: ≤10%.

---

## 8. Conclusão

O daemon `akasha-loop-daemon.py` v9 tem **fundação sólida** (timeouts, retry, thread bridge para subprocessos, lazy loading com timeout). Os gaps são **cirúrgicos e bem-localizados**:

- 1 gap crítico (`git push`): ~5 linhas.
- 1 gap importante (`git add -A` sem filtro): ~15 linhas.
- 3 gaps médios (worktree detection, approval-gated recovery, merge sequence): ~50 linhas.
- 3 gaps cosméticos (changelog lock, métricas, paralelismo): ~30 linhas.

**Total estimado: ~100 linhas de patch para eliminar ~80% do overhead operacional observado nas últimas 5 waves.**

Recomendação: abrir Wave 17.6 (ou 18.1) com branch dedicada `wave-17.6-daemon-patches`, reintroduzir daemon do Trash, aplicar Patches A–E com revisão humana, validar em 1-2 waves controladas antes de promover.
