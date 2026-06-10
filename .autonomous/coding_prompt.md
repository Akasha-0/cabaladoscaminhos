## YOUR ROLE — CODING AGENT (Sessão N — Research Continuation)

Você está continuando a Fase 0 (Research) do Sistema Akasha. Contexto
fresco — estado vive em disco: `.autonomous/research/`, `INDEX.md`,
`claude-progress.txt`, `git log`.

### STEP 1 — ORIENTAÇÃO (60s)

```bash
cd /home/skynet/cabala-dos-caminhos
cat .autonomous/research/INDEX.md
cat .autonomous/research/CHECKPOINT.md 2>/dev/null
ls .autonomous/research/systems/ 2>/dev/null
git log --oneline -15
cat .claude/TODO.md | head -60
cat .autonomous/feature_list.json | jq '[.[] | select(.passes == false)] | length'
```

### STEP 2 — PRÓXIMO TRABALHO

**Prioridade 1:** Próximo RQ-NN `[ ]` em `.claude/TODO.md`
**Prioridade 2:** Próxima feature `passes:false` com phase ≤ 4
**Prioridade 3:** Melhorar COT ou research já existente

Mude checkbox para `[~]` ao começar.

### STEP 3 — CONTINUAR RESEARCH

Para RQ-XXX pendente:
1. WebSearch 3-5 fontes
2. WebFetch páginas principais
3. context7 se for lib técnica
4. Escreva `.autonomous/research/systems/<nome>.md`
5. Marque `passes: true` em `feature_list.json`
6. Adicione linha em `.claude/TODO.md` Notas de Iteração

**NÃO IMPLEMENTE CÓDIGO** até:
- Todos RQ-001 a RQ-012 marcados `passes: true`
- RQ-020 (patterns), RQ-021 (gaps), RQ-022 (synthesis_v1) completos
- RQ-023 (mentor persona_v1), RQ-024 (ux), RQ-025 (tech) completos
- CHECKPOINT.md criado e commit feito

### STEP 4 — APROFUNDAR RESEARCH EXISTENTE

Se um relatório está raso:
- Adicione seções faltantes
- Refine com base em novas fontes
- Atualize `chain-of-thought/` com novas decisões

### STEP 5 — COT (chain-of-thought) LOGGING

Para cada decisão significativa, escreva:
`.autonomous/research/chain-of-thought/cot-YYYYMMDD-HHMM-<slug>.md`

Use este template:
```
# COT: <título>

## Contexto
## Hipóteses
## Evidências
## Conclusão
## Próximos passos
```

### STEP 6 — SÍNTESE & DESIGN

Quando research estiver maduro:
- `patterns.md` — extrair 10-20 padrões comuns dos sistemas
- `gaps.md` — oportunidades únicas
- `synthesis/synthesis_v1.md` — Akasha Core Algorithm (markdown, não código)
- `mentor/persona_v1.md` — quem é o Mentor
- `ux/architecture_v1.md` — como o usuário vive o sistema
- `tech/stack_v1.md` — decisões técnicas

### STEP 7 — CHECKPOINT

Ao final da sessão, crie/atualize
`.autonomous/research/CHECKPOINT.md` com:
- O que está completo
- O que falta
- Próximos passos concretos

### STEP 8 — COMMIT

```bash
git add .autonomous/research/ .claude/TODO.md
git status
git commit -m "research(akasha): <RQ-NN> — <título curto>"
```

Tipos: `research`, `synthesis`, `design`, `docs`, `chore`.

### STEP 9 — ATUALIZAR PROGRESS LOG

`.autonomous/claude-progress.txt`:
```
## Sessão N (YYYY-MM-DD)
- [x] Orientação: <o que li>
- [x] Research: <RQ completada>
- [x] COT: <decisão>
- [x] Commit: <hash> - <msg>
- Próxima sessão: <RQ>
```

### REGRAS DE OURO

- **Fonte única:** `IDEIA.md` para correspondências já no projeto.
  Não conflite com `src/lib/constants/*.ts`.
- **Research antes de código.** Sem exceção. Sem atalhos.
- **Markdown rico, fontes citadas, COT para decisões.**
- **Não invente tradições** sem fonte.
- **Critique os sistemas estudados** — não os endeuse.
- **Mantenha coerência com `app_spec.txt`.**

### AUTO-STOP

Pare e escreva CHECKPOINT.md parcial se:
- Mesmo sistema pesquisado 3h+ (provavelmente é distração)
- 4+ horas de sessão sem novo research
- 12+ RQs completos E synthesis_v1 E persona_v1 → sessão pode parar
- Custo > $50/sessão (config `AUTONOMOUS_MAX_BUDGET_USD`)

### FERRAMENTAS

Built-in: Read, Write, Edit, Glob, Grep, Bash.
MCP: **WebSearch + WebFetch** (use muito!), context7, graphiti-memory,
claude-mem, playwright.
Custom skills: arch-ai-engineer, spiritual-validator,
knowledge-validator, prisma-patterns, context-budget, orchestrator.

**Comece pelo STEP 1. Continue o trabalho de pesquisa.**
