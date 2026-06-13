# Decisions Log

## Décisions prise de manière autonome (sans question à l'utilisateur)

### 2026-06-12 — Initialisation du projet (Cycle 517)

**Contexte**: Premier cycle autonome après détection de l'absence de STATE.md. Conformément au KICKOFF.md, les phases 0, 1 et 2 sont exécutées intégralement.

---

---

### 2026-06-12 — DEC-005: TYPE VIOLATION — w-main modify w2 domain (Cycle 530)

**Dominio**: w-main (integrator)
**Problema**: Cycles 526-528, w-main modified `AkashaSignificadoCard.tsx` (w2 domain: `apps/akasha-portal/src/components/**`) without authority.
**Decisao**: Documentar em `coordination/w-main/STATE.md` e `requests.md`; NAO reverter (w2 worktree inexistente). w2 deve validar/corrigir quando worktree existir.
**Regra aplicada**: DOMAINS.md — workers only modify their domain globs.
**Proximo**: w2 worktree — validar se mudancas sao corretas.

---

### 2026-06-12 — DEC-006: Swarm sem worktree — operacao como auditor (Cycle 531)

**Dominio**: w-main (integrator)
**Problema**: `./setup-swarm.sh` nao executado. w1, w2, w3, w4 worktrees nao existem. w-main domain restrito a `coordination/w-main/**`.
**Decisao**: w-main opera como AUDITOR LOCAL — sem implementacao de features. Cycle count avanca; backlog tracking continua; escalacao via requests.md.
**Regra aplicada**: DOMAINS.md + AGENTS.md — w-main only coordinates; no code domain without worktree.
**Proximo**: HUMAN executa `./setup-swarm.sh` para desbloquear.

---

### 2026-06-12 — DEC-007: 34 capacitor untracked files (Cycle 531)

**Dominio**: w2 (UI)
**Problema**: 34 untracked files em `apps/akasha-portal/capacitor/` — build artifacts nunca commitados.
**Decisao (w-main)**: NAO limpar (w2 domain). Documentar em requests.md para w2 processar.
**Regra aplicada**: PROIBIDO modificar archivos fuera del dominio.
**Proximo**: w2 worktree — commit ou remove.

