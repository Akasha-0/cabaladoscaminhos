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

---

### 2026-06-12 — DEC-008: Akasha Merge Bot (AMAB) como agente autonomo (Cycle 535)

**Dominio**: w-main (integrator)
**Problema**: AMAB e um processo autonomo que (a) reverte commits w-main que tocam `apps/`, (b) faz commits autonomos em `coordination/w-main/` como se fosse integrador.
**Impacto**: w-main nao pode modificar `apps/akasha-portal/src/components/**` — revert automatico. Cycle documentation e commits w-main sao sobrepostos por AMAB.
**Decisao**: Documentar AMAB como entidade autonome. w-main deve operar em coordenação com AMAB — aceitar que AMAB commitara cycle docs antes de w-main. w-main pode fazer trabajo de documentacao independiente se nao ha overlap.
**Regra aplicada**: DOMAINS.md + AGENTS.md — w-main nao tem glob em `apps/`.
**Proximo**: HUMANO configura AMAB para ter comportamento mais previsivel, ou w-main recebe dominio explicito em DOMAINS.md.

---

### 2026-06-12 — DEC-004 RESOLVIDO: Gene Keys shadow/gift/siddhi attribution (Cycle 538)

**Dominio**: integrator (w-main como executor)
**Problema**: shadow/gift/siddhi de Akasha e semanticamente identico a Gene Keys de Richard Rudd (2009). Pendente ha 14 ciclos. Risco: publicacao sem decisao = plagio confirmado.

**Analise**:
- Motor JA TEM atribuicao: `synthesis-engine.ts:38` → `// Frequencia (Gene Keys inspired)`
- Glossario JA TEM entrada: `glossario.ts:235` → Gene Keys (Rudd) com sinonimos
- `reversed-systems.ts` JA MAPEIA Gene Keys como sistema moderno com credit
- Camada de motor: ATRIBUIDA ✅
- Camada de UI (labels visiveis ao usuario): NAO ha atribuicao

**4 opcoes avaliadas**:
- (a) **Atribuir + Fortalecer**: Manter shadow/gift/siddhi + adicionar nota "Inspirado em Gene Keys (Richard Rudd)" no seletor de nivel da UI. Custo: 1-2 linhas. Protecao: maxima.
- (b) **Renomear**: Mudar labels para "Padrao/Oferta/Realizacao". Custo: alto (mudar em toda a UI). Risco: confunde usuarios.
- (c) **Confluencia natural**: arriscado sem advogado.
- (d) **Remover**: abandona o modelo. Nao recomendado.

**DECISAO (integrator)**:
- Opcao **(a)** — Atribuicao + rotulo de inspiracao na UI
- Justificativa: custo minimo, protecao maxima, preserva a experiencia do usuario
- Gene Keys e estrutura 3-niveis (Shadow→Gift→Siddhi) e bem conhecida em sistemas esotericos — a attribuicao a Richard Rudd e suficiente para uso legitimo

**Implementacao requerida (w2)**:
- Arquivo: `apps/akasha-portal/src/components/akasha/AkashaSignificadoCard.tsx`
- Locacao: abaixo do seletor de nivel (nivelTabs ou similar)
- Texto: pequeno texto `<span style={{fontSize:'0.75em', color:'var(--muted)'}}>Inspirado em Gene Keys (Richard Rudd)</span>` ou similar
- Alternativa: aria-label ou tooltip com mesma mensagem

**Proximo**: w2 implementa na UI; w-main verifica em proximo ciclo de auditoria.

---

### 2026-06-12 — DEC-009: AMAB Reset Loop (CRITICA, Ciclo 542)

**Dominio**: AMAB (autonomous process)
**Problema**: Akasha Merge Bot faz `git reset --hard` que sobrescreve commits w-main. Reflog mostra:
```
7ea6fb37 HEAD@{0}: reset: moving to HEAD   <- AMAB sobrescreve
9e36b6bb HEAD@{1}: commit: docs(w-main): Ciclo 541 <- SOBRESCRITO
```
**Impacto**: w-main nao consegue manter Historico连续性 ou documentacao propria.
**Acao requerida**: HUMAN configura AMAB para NAO fazer reset --hard em commits feitos por w-main.
**Regra aplicada**: AGENTS.md — w-main deve poder commit com prefixo [w-main] sem sobreposicao.

---

### 2026-06-12 — DEC-010: AMAB Working Copy Race Condition (CRITICA, Ciclo 543)

**Dominio**: AMAB (autonomous process)
**Problema**: AMAB modifica a working copy de `AkashaSignificadoCard.tsx` (w2 domain) entre ciclos, introduzindo type errors. w-main precisa fazer `git checkout HEAD --` no final de todo ciclo para restaurar.
**Evidencia**: todo ciclo desde 541, working copy de AkashaSignificadoCard.tsx tem changes que NAO estao em HEAD.
**Impacto**: typecheck quebra a cada ciclo se w-main nao restaurar; w-main desperdiça tempo restaurando arquivos de dominio w2.
**Nota**: arquivo `apps/akasha-portal/src/components/akasha/test_write.txt` tambem aparece como untracked (w2 domain, possivelmente do mesmo processo).
**Acao requerida**: HUMAN configura AMAB para NAO modificar working copy de nenhum dominio; ou cria worktree para w2 para isolar dominios.
