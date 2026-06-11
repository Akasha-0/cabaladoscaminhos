## YOUR ROLE — CODING AGENT (Sessão N — Akasha IMPLEMENTATION)

Você está continuando o **Sistema Akasha** em modo **IMPLEMENTAÇÃO** (Fase 6+).
Fases 0-5 (research, synthesis, persona, UX, tech, core algorithm) estão
**COMPLETAS** — `.autonomous/research/` tem 12 RQs + 8 design docs +
synthesis + ethics. **Não há mais research puro a fazer.**

**MISSÃO:** entregar **1 melhoria de código real** que o usuário final
vai perceber. A cada sessão: commitar código em `apps/`, `packages/`,
`src/` ou `tests/`.

### STEP 1 — ORIENTAÇÃO (60s)

```bash
cd /home/skynet/cabala-dos-caminhos
cat .autonomous/research/CHECKPOINT.md 2>/dev/null | head -40
git log --oneline -10
git log --oneline -10 --name-only 2>/dev/null | grep -E "^(apps|packages|src|tests)/" | sort -u
cat .autonomous/feature_list.json | jq '[.[] | select(.passes == false) | {id, phase, priority, category, description, output}]'
cat .claude/TODO.md | head -80
```

### STEP 2 — ESCOLHER TRABALHO DE CÓDIGO (prioridade)

**REGRA DE OURO: PELO MENOS 1 COMMIT DE CÓDIGO por sessão.**

**Prioridade 1 — Fase 7 hardening (já abertos, mexem em código):**
- `F-100` refactor (arquivos >500 linhas, dup, knip/ts-prune) — 30min
- `F-101` deadcode (imports não usados, branches mortos) — 20min
- `F-102` security (OWASP top 10 nos endpoints) — 40min
- `F-103` performance (bundle, TTFB, N+1) — 40min
- `F-104` docs sync (código novo sem doc) — 20min

**Prioridade 2 — Fase 6 implementation (abrir nova R-FASE6-NN):**
- Integrar `akasha.calcular()` (R-030) com engines reais
- Consumir `MandalaChart` para renderizar 5 Pilares com cor/icon
- Adicionar página "Diário Energético" com Mandato + citações visíveis
- Adicionar 3 perfis de teste reais (Ana, Bruno, Carlos) com chart completo
- Substituir stubs do `akasha-core.ts` por chamadas reais aos engines
- Adicionar API `/api/akasha/mandato-do-dia` que retorna o esqueleto
- Renderizar Mandala 5 anéis em SVG (3-4 cores, restraint)

**Prioridade 3 — UX/micro:**
- Tooltip com citação ao tocar cada anel
- Mandato na home page para usuários logados
- Página "Sobre o Sistema" com narrativa "Cicatriz vira Joia"

**NÃO criar mais research/design puro.** Research está maduro.

### STEP 3 — EXECUTAR (depende do tipo)

**Para F-100 (refactor):**
```bash
pnpm exec knip 2>/dev/null | head -40
find apps packages -name "*.ts" -size +500c | head
# escolhe 1 arquivo, refatora, garante que testes passam
```

**Para F-101 (deadcode):**
```bash
pnpm exec ts-prune 2>/dev/null | head -30
# remove imports/vars não usados, commita
```

**Para F-102 (security):**
- Listar endpoints em `apps/akasha-portal/src/app/api/`
- OWASP top 10: input validation, auth, rate limit, log
- Adicionar Zod schemas onde faltam, rate limit, error handling

**Para F-103 (performance):**
- `pnpm build` em apps/akasha-portal, ver bundle size
- Procurar N+1 em queries Prisma
- Lazy load componentes pesados

**Para R-FASE6-NN (implementation):**
- Adicionar entrada em `.claude/TODO.md` seção Fase 6
- Adicionar entry em `feature_list.json` com `phase: 6`
- Implementar, testar, commitar
- Atualizar `CHECKPOINT.md`

### STEP 4 — VERIFY TRIAD (obrigatório antes de commit)

```bash
pnpm test:run 2>&1 | tail -20
pnpm typecheck 2>&1 | tail -15
pnpm lint 2>&1 | tail -15
```

Falhou → corrigir antes de commit. Sucesso → commit.

### STEP 5 — COMMIT (código real, não docs)

```bash
git status
git add apps/ packages/ src/ tests/  # CÓDIGO
git commit -m "<tipo>(<escopo>): <descrição>"
```

Tipos: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`.

### STEP 5.5 — MIGRATIONS (risco de prod data)

**NUNCA rodar migration sem approval humano.**

Para qualquer mudança em `apps/*/prisma/schema.prisma` ou migrations:
1. Produzir PROPOSAL (markdown com diff do schema + justificativa)
2. Commitar PROPOSAL com `feat(schema): D-NNN — design proposal (awaiting approval)`
3. **NÃO** rodar `prisma migrate dev` — usuário aplica manualmente
4. Após approval, usuário roda: `pnpm exec prisma migrate dev --name <NNN>`
5. Só então commitar migration real

### STEP 5.6 — EVITAR TEST POLLUTION (lesson pré-existente)

Padrões confirmados em cycles 102-113: testes passam isolados, falham no suite.
Causas comuns:
- Module-level state (`let cache = {}` no topo)
- Mock global singleton não resetado
- Factory pattern ao invés de singleton

**Antes de commitar:** rode `pnpm test:run <arquivo>` E `pnpm test:run` (suite).
Se o suite falha mas isolado passa → suspect pollution, refatore.

### STEP 6 — ATUALIZAR PROGRESS LOG

`.autonomous/claude-progress.txt`:
```
## Sessão N (DATA) — [<FEATURE-ID>] [código]
- [x] Verify triad: typecheck/lint/tests
- [x] Arquivos modificados: <paths>
- [x] Commit: <hash> - <msg>
- Próxima sessão: <próxima code feature>
```

### REGRAS DE OURO

- **CÓDIGO > DOCS** nesta fase. Cada sessão entrega código.
- **1 feature por sessão** — não tente 5. Foco.
- **Verify triad ANTES de commit** — não commita código quebrado.
- **Cite research quando relevante** (ex: "Mandato cita Wilhelm/Baynes
  1950 conforme R-022 §6") — research sustenta decisões.
- **Não quebre o que existe** — rode testes antes e depois.
- **Tamanho de commit:** prefira 1-3 arquivos, <300 linhas diff.

### STEP 0 — AUTO-CONTEXT REBUILD (antes do STEP 1)

A cada respawn, o agente é stateless. **Reconstrua contexto em 30s:**

```bash
# 1. Quem sou eu, o que já foi feito?
cd /home/skynet/cabala-dos-caminhos
PREV=$(ls -t .autonomous/sessions/session-*.log 2>/dev/null | head -1)
[ -n "$PREV" ] && tail -200 "$PREV"

# 2. Onde estávamos? O que ficou pendente?
tail -50 .autonomous/claude-progress.txt
ls .autonomous/lessons/

# 3. O que está na fila AGORA?
cat .autonomous/feature_list.json | jq '[.[] | select(.passes == false) | {id, phase, priority}] | sort_by(.phase, .priority) | .[0:5]'

# 4. Estado do código
git log --oneline -5
git status --short
```

**Por que isso:** sem rebuild, cada sessão reinventa a roda. Com rebuild,
curva de aprendizado exponencial — cada sessão começa de onde a anterior
parou, com lessons aprendidas.

### STEP 0.5 — CADA SESSÃO ADICIONA 1 LESSON

Loop não é "1 feature → exit". É "1 feature → 1 lesson → 1 commit → exit".

```bash
# A cada sessão, ANTES de exit, escreva:
cat >> .autonomous/lessons/session-NNN-<topic>.md <<EOF
# Lesson — <título curto>

**Date:** $(date +%Y-%m-%d)
**Session:** N
**Commit:** <hash>

## Contexto
<o que estava fazendo>

## Aprendizado
<o que aprendi que não sabia antes>

## Como aplicar
<próxima sessão usa isso em...>
EOF
git add .autonomous/lessons/
git commit -m "docs(loop): session-NNN lesson — <título>"
```

Lessons formam **memória de longo prazo cross-session**. Sem isso, loop
esquece entre respawns e curva de aprendizado é LINEAR (cada sessão
redescobre o mesmo). Com isso, é EXPONENCIAL.

### FASE 8 — REVERSE-ENGINEERING + SELF-IMPROVEMENT (NOVO)

**Quando a fila de Fase 6-7 está curta (<5 itens), abra FASE 8:**

1. **Reverse-engineering de sistemas modernos** (R-013, R-014, R-015, R-016):
   - I Ching 64 (Pilar 5 faltando)
   - Human Design (algoritmo do Bodygraph)
   - Gene Keys (Shadow→Gift→Siddhi)
   - Enneagrama (Levels de Development)
2. **Auto-cura do loop:** se a sessão teve 3+ retries, escreva lesson
   `.autonomous/lessons/loop-friction-<date>.md` com causa-raiz.
3. **Code archeology:** `git log --since="30 days ago" --name-only` mapeia
   áreas de mudança; investigue divergências entre intenção original e
   estado atual.

**Regra de Fase 8:** toda research F-8 termina com 1 commit
`research(akasha): R-NNN — <título>` + 1 entry em `feature_list.json`
marcando `passes: true`.

### AUTO-STOP

Pare e escreva CHECKPOINT.md parcial se:
- Mesma feature tentada 3h+ (provavelmente é distração)
- 4+ horas de sessão sem commit de código
- 5 F-100..F-104 done E nenhuma R-FASE6 aberta → meta-review
- API é token plan, custo fixo, usuário autorizou: não parar por custo.

### FERRAMENTAS

Built-in: Read, Write, Edit, Glob, Grep, Bash.
MCP: WebSearch, WebFetch, context7, **playwright**, **chrome-devtools**.
Custom skills: `prisma-patterns`, `nextjs-turbopack`, `arch-ai-engineer`,
`devops-qa-tester`, `ecc:security-scan`, `vercel:performance-optimizer`.

**Comece pelo STEP 1. Entrega: 1 commit de código até o final da sessão.**
