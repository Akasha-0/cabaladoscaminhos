# Memory DOX

## Purpose

Ciclos de memória do agente autonomous — registro de decisões,
aprendizados, e estado entre sessões. Cross-session memory + lesson
log.

## Ownership

- `cycle-###.md`: Ciclos de memória numerados (3-digit NNN)
  - Formato: timestamp, task description, learnings
- `cycle-###-review.md`: Revisões de ciclo (post-mortem)
- `core-memories.md`: Key moments (rare, high-value)
- `archive/`: Cycles antigos (per cleanup policy)

## Local Contracts

- Ciclos registram decisões, aprendizados e estado
- Formato: `cycle-[NNN]` (zero-padded 3 digits)
- Revisões ao final de sprints/milestones (1 review per ~10 cycles)
- Cleanup: cycles > 6 months movidos para `archive/`
- NUNCA deletar cycles (são audit trail)

## Work Guidance

- **Atualizar memória** ao final de cada task significativa
- **Revisar** cycles anteriores antes de novos planejamentos
- **Consistência de formato**: timestamp ISO 8601, lista de learnings
- **Lessons são diferentes**: lessons (N+XX) ficam em
  `.autonomous/lessons/` e são indexadas em `INDEX.md`. Cycles são
  registros de sessão (1×N onde N = cycles por sessão).

## Verification

- Revisão manual de completude
- Arquivos devem ter conteúdo válido (não vazios)
- `ls memory/ | grep -c '^cycle-'` deve crescer monotonicamente
- `cycle-archive/` cleanup: cycle-NNN onde NNN < (current - 180) → archive

## Related Files

- `.autonomous/lessons/INDEX.md` — long-term lessons (N+XX)
- `.autonomous/multi-agent/memory.json` — agent-specific state
- `.remember/now.md` — handoff entre sessões
- Root AGENTS.md (DOX chain)

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado. Cycle files são numerados
sequencialmente. Cleanup via `archive/`.)
