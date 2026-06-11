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

---

## CONTEXT HYGIENE — prevenir context rot

**Regra de ouro:** contexto da sessão é finito. Disco é infinito. **Estado
vive em disco, contexto carrega só o necessário.**

### Token-efficient tooling (sempre)

| Em vez de | Use |
|-----------|-----|
| `Read arquivo_grande.md` | `Grep pattern arquivo_grande.md` |
| `Read` de past commits | `git log --oneline -N` |
| `Read feature_list.json` | `jq '.[] \| select(.passes==false) \| .id' .autonomous/feature_list.json` |
| `Read` de muitos .md | `grep -lE "pattern" .autonomous/research/systems/` |
| `Read IDEIA.md` inteiro | `grep -n "section" IDEIA.md` |
| `cat` arquivo | `head -N` / `tail -N` / `wc -l` |

### Anti-context-rot (regras duras)

1. **NUNCA re-leia arquivo já lido nesta sessão** — anote na working memory
   (ou em `.autonomous/state/session-NN-notes.md` se >10 itens) e use
   `Grep` para re-verificar.
2. **Após 30 tool calls, RE-ORIENTE** (15s):
   ```bash
   cat .autonomous/research/INDEX.md | head -30
   git log --oneline -5
   tail -20 .autonomous/claude-progress.txt
   ```
   Restaura o "onde estou" sem bloat.
3. **Após 60 tool calls, COMMIT-WIP** mesmo se inacabado (checkpoint em
   `.autonomous/state/session-NN-wip.md`).
4. **Markdown longo:** sempre `Read` com `offset+limit` (máx 200 linhas).
   `wc -l` antes.
5. **JSON grande:** sempre `jq` com filter específico. Nunca `cat` + parse mental.
6. **Antes de WebSearch/WebFetch:** Grep local primeiro (IDEIA.md,
   .autonomous/research/, grimoire/). Só vai pra web se gap confirmado.
7. **Cota de output:** respostas em texto < 300 palavras. Tabelas
   preferidas. Citações só com --limit.

### Memória persistente (cross-session)

| Camada | Onde | Quando ler |
|--------|------|------------|
| Mapa do projeto | `.autonomous/research/INDEX.md` | SEMPRE no STEP 1 |
| Status resumido | `.autonomous/research/CHECKPOINT.md` | SEMPRE no STEP 1 |
| Decisões | `.autonomous/research/chain-of-thought/*.md` | Citar antes de mudar |
| Progresso vivo | `.autonomous/claude-progress.txt` | Append-only |
| WIP da sessão | `.autonomous/state/session-NN-wip.md` | Criar após 30 tool calls |
| Fila viva | `.claude/TODO.md` | STEP 1 + marcar `[~]` ao começar |
| Lições | `.autonomous/lessons/<chave>.md` | Grep no STEP 1 |

### Curva de aprendizado exponencial

**Cada sessão DEVE terminar com 1 insight novo escrito em**
`.autonomous/research/chain-of-thought/cot-<DATE>-<session>-<slug>.md`
**e referenciado no INDEX.md.**

1. **Síntese:** 12 RQs + 20 patterns + 20 gaps = 1 truth-table 5×4
   (herda/melhora/evita) por pilar.
2. **Comparação cruzada:** ao encontrar padrão X no pilar A, **imediatamente**
   Grep pilares B/C/D/E para ver se X reaparece. Isomorfismos são ouro.
3. **Citação canônica:** toda decisão de design tem fonte em
   `.autonomous/research/systems/<X>.md` ou autor + ano. Padrão
   "(Gene Keys 2009, Rudd p.42)" inline.
4. **Memória institucional:** ao errar (test fail, build fail, typo), criar
   `.autonomous/lessons/<chave>.md` em 1 parágrafo. Próxima sessão Grep
   `.autonomous/lessons/` no STEP 1.

### Auto-checkpoint (final da sessão)

```bash
# 1. Resumo de 1 linha
echo "## Sessão N (DATA) — [RQ-ID] [status]" >> .autonomous/claude-progress.txt
echo "- [x] O que fiz" >> .autonomous/claude-progress.txt
echo "- Próxima sessão: [RQ-ID]" >> .autonomous/claude-progress.txt

# 2. WIP persistente (se não terminou)
[ -f .autonomous/state/session-NN-wip.md ] && git add .autonomous/state/

# 3. Commit atômico
git add .autonomous/research/ .claude/TODO.md
git commit -m "research(akasha): <RQ-ID> — <título curto>"
```

**Nunca termine sem:**
- Progresso no `claude-progress.txt`
- `[x]` ou `[~]` correto no `TODO.md`
- `passes: true/false` correto no `feature_list.json`
- WIP checkpoint se inacabado
- COT de decisão significativa

---

## FASE 5+ — QA CYCLE (após implementação começar)

Quando `packages/akasha-core/src/` ou `apps/akasha-portal/src/` tiver
arquivos novos editados nos últimos commits, rode o ciclo de QA:

### STEP 10 — VERIFY TRIAD (sempre que tocar código de feature)

```bash
pnpm test:run 2>&1 | tail -30   # vitest — fails in suite? rodar isolado
pnpm typecheck 2>&1 | tail -20
pnpm lint 2>&1 | tail -20
```

- Falhou teste isolado → corrigir antes de commit.
- Falhou só no suite → suspect test pollution (ciclo [[cycle-102]]+); refatorar
  cache/singleton atrás de factory.
- Typecheck/lint quebrou → corrigir.

### STEP 11 — E2E SMOKE (Fase 6+)

Use `chrome-devtools` MCP ou `playwright` para o caminho crítico:

1. `cd apps/akasha-portal && pnpm dev` (background)
2. Navigate `/` → onboarding flow
3. POST `/api/akasha/ritual` com payload válido → 200 + JSON shape correto
4. POST `/api/akasha/ritual` com payload inválido → 400 (não 500)
5. Verificar console: zero error vermelho
6. Screenshot saved em `.autonomous/e2e/<YYYY-MM-DD>.png`

Falhou → RQ-bugfix em TODO. Passou → commit `test(akasha): E2E smoke green`.

### STEP 12 — META-REVIEW (loop perpétuo)

Se ao iniciar a sessão existir `.autonomous/state/meta_review.signal`:

1. `git log --oneline -20` — analise últimos 20 commits
2. Procure por: TODOs órfãos, dead code, gaps de teste, debt de
   performance, vulnerabilidades óbvias, sync de docs
3. Abra 3-5 novos RQs (Fase 7) em `.claude/TODO.md` E
   `.autonomous/feature_list.json` (preservar schema JSON)
4. `rm .autonomous/state/meta_review.signal`
5. Commit `chore(akasha): meta-review cycle N — <kebab-slug>`
6. Continue com STEP 1 normal

**O loop nunca termina sozinho.** Hard stop só via
`bash .autonomous/launch.sh --stop` manual. Fila vazia = gatilho para
meta-review, não para exit.

---

## FASE 7 — CONTINUOUS IMPROVEMENT (RFs perpétuos)

Após Fase 6, o agente adiciona RQs de:

- **F-100 Refactor:** arquivos >500 linhas, funções >50 linhas, duplicação
  óbvia. Use `knip`/`ts-prune` para candidatos.
- **F-101 Dead Code:** imports não usados, exports sem callers, branches
  mortos. Tool: `pnpm fallow` (definido em package.json se existir).
- **F-102 Security:** OWASP top 10 nos endpoints novos. Use
  `ecc:security-scan` skill.
- **F-103 Performance:** bundle size, TTFB, query N+1. Use
  `vercel:performance-optimizer` skill.
- **F-104 Docs Sync:** código novo sem doc/README/AGENTS.md atualizado.

Cada RQ vira entrada em `feature_list.json` com `phase: 7, category:
maintenance, priority: P2`. Resolver 1-2 por sessão para não dominar
agenda.
