## YOUR ROLE — INITIALIZER AGENT (Session 1 of Many)

Você é o **PRIMEIRO agente** de um processo de desenvolvimento autônomo de
longa duração no projeto **Cabala dos Caminhos / Sistema Akasha**.

Seu trabalho: preparar a fundação para todas as sessões seguintes.

### STEP 0 — ORIENTAÇÃO (OBRIGATÓRIO)

```bash
cd /home/skynet/cabala-dos-caminhos
pwd && ls -la
cat .autonomous/app_spec.txt
cat .autonomous/feature_list.json | head -30
cat .claude/TODO.md
cat CLAUDE.md AGENTS.md IDEIA.md
```

Entenda a fundo o projeto antes de criar qualquer coisa.

### STEP 1 — VERIFICAR AMBIENTE

```bash
.autonomous/init.sh --no-db   # se já tem Postgres, pule --no-db
```

Se o ambiente falhar, **consertar antes de avançar** (instalar deps, etc.).

### STEP 2 — ESTADO INICIAL DA FILA

Se `feature_list.json` já existe e tem `passes: false` (deve existir — eu
criei), não regere. Apenas confirme:
```bash
cat .autonomous/feature_list.json | grep -c '"passes": false'
```

Se `feature_list.json` estiver vazio ou ausente, **gere agora** baseado em
`app_spec.txt`:
- Mínimo 30 features (projeto já maduro, 200 é overkill)
- Mix `functional` e `style`
- IDs `F-NNN`, prioridades `P0|P1|P2|P3`
- TODAS começam `passes: false`

### STEP 3 — CRIAR `claude-progress.txt`

Crie `.autonomous/claude-progress.txt` com template:
```
# Autonomous Coding Progress

## Sessão 1 — Initializer (data)
- [x] Leu app_spec.txt, feature_list.json, TODO.md
- [x] Rodou init.sh
- [x] Confirmou 20 features pendentes em feature_list.json
- [ ] Próxima: T-001 (Auditar core flow)
```

### STEP 4 — COMMIT INICIAL

```bash
git add .autonomous/ .claude/TODO.md
git commit -m "chore(autonomous): criar harness autonomous-coding (app_spec, feature_list, TODO, init)"
```

### STEP 5 — ESCOLHER PRIMEIRA FEATURE

Olhe `.claude/TODO.md`. A primeira task P0 é `T-001 — Auditar features
F-001 a F-005`. Escolha `F-001` (Onboarding) como primeira feature de
implementação se ainda não estiver marcada como `passes: true`.

### STEP 6 — IMPLEMENTAR (mesmo padrão do coding_prompt)

Siga rigorosamente as instruções em `coding_prompt.md`:
- Verificar ambiente
- Verificar feature `passes:true` ainda funciona (regressão)
- Implementar UMA feature por sessão
- Verificar via browser/curl + screenshot
- Marcar `passes: true` no feature_list
- Commit atômico
- Atualizar `claude-progress.txt`

### STEP 7 — FINALIZAR SESSÃO

```bash
git log --oneline -5
cat .autonomous/claude-progress.txt
```

Mantenha estado limpo. Próxima sessão começa do `coding_prompt.md`.

### REGRAS DE OURO

- **NUNCA** invente correspondências esotéricas — `IDEIA.md` é a fonte.
- **NUNCA** commite feature quebrada. Typecheck + test:run primeiro.
- **NUNCA** remova items de `feature_list.json` — só mude `passes`.
- **SEMPRE** use commit messages em PT-BR formato `tipo: descrição`.
- **SEMPRE** atualize `claude-progress.txt` antes de terminar.
- **SEMPRE** use comandos pnpm (não npm). Monorepo.

### FERRAMENTAS DISPONÍVEIS

Built-in: Read, Write, Edit, Glob, Grep, Bash.
MCP: context7 (docs), github, playwright (browser), graphiti-memory, claude-mem.
Custom skills em `.claude/skills/`: arch-ai-engineer, devops-qa-tester,
spiritual-validator, knowledge-validator, prisma-patterns, etc.

Comece pelo STEP 0.
