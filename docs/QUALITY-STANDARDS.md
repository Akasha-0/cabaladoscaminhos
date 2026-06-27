# Quality Standards - Akasha Portal

> Standards operationals (nao aspiracionais) pra workers de agents.
> Aprendizados REAIS do wave-2 (2026-06-27) onde sandbox perdeu branches.

---

## TL;DR

Wave-2 produziu codigo real (auth, onboarding, posts API, smoke tests) em branches isoladas. Workers clonaram worktrees e produziram arquivos. MAS no final, branches NAO EXISTIAM nem local nem em origin. Codigo perdido porque:

1. Workers nao fizeram push antes de serem killed
2. Sandbox cleanup apagou worktrees
3. Nenhum mecanismo de backup automatico

Abaixo: como evitar no wave-7+.

---

## Standards pra Workers (agent producers)

### 1. SEMPRE fazer commit + push incremental

**Regra:** Cada feature completa = 1 commit. Cada 3-5 commits = 1 push.

**Por que:** Se worker for killed por timeout, trabalho fica em origin.

**Pattern:**
```
[cria arquivos]
git add -A
git commit -m "feat(X): parte 1"
git push origin feat/X

[mais arquivos]
git add -A
git commit -m "feat(X): parte 2"
git push origin feat/X

[deliverable final]
git push origin feat/X
```

### 2. SEMPRE usar branch isolada + push frequente

**Regra:** Workers NUNCA devem trabalhar direto em feat/community-platform.

**Pattern:**
```bash
git checkout -b feat/<feature>-<short-id>
# trabalho
git push origin feat/<feature>-<short-id>
# ao final, owner faz merge
```

**Por que:** Se sandbox limpa, trabalho em origin sobrevive.

### 3. SEMPRE commitar arquivos DELETADOS

**Regra:** `git add -A` (inclui deletes). Nunca `git add .` ou parcial.

**Por que:** Deletes esquecidos causam conflitos.

### 4. TSC zero erros ANTES de cada push

**Regra:** Rodar `timeout 60 npx tsc --noEmit --skipLibCheck` antes de push.

**Por que:** Push com TS quebrado = main quebrada.

### 5. Commits descritivos (Conventional Commits)

**Regra:** `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`

**Pattern:**
- `feat(auth): Supabase client setup`
- `feat(onboarding): 5-step form with numerology`
- `feat(posts): CRUD API with rate limiting`
- `fix(auth): cookie session not persisting`
- `docs(ops): quality standards`

### 6. Limites de tamanho

**Regra:** Task individual nao deve exceder:
- 500 linhas de código novo
- 5 arquivos modificados
- 30 min de trabalho

**Por que:** Tasks grandes = maior risco de kill + timeout.

### 7. Reports concisos

**Regra:** Report final deve ter:
- Lista de arquivos criados/modificados
- Status de TSC
- Próximo passo (se houver)
- NÃO repetir código inline

---

## Standards pra Plan YAML (engine)

### 1. max_concurrency respeitando sandbox

**Regra:** max_concurrency = 2-3 (NAO 4+) por causa do sandbox 2GB.

**Por que:** 4+ workers clonando worktrees = OOM.

### 2. timeout_minutes realista

**Regra:** 15min para tasks simples (1 arquivo, 1 feature)
**Regra:** 30min para tasks médias (3-5 arquivos)
**Regra:** 45min para tasks grandes (workflow inteiro)

**Por que:** Workers gastam 2-3min só em setup.

### 3. verify_skip_reason SEMPRE presente

**Regra:** Toda task precisa de `verify_skip_reason` ou `verified_by`.

**Por que:** Engine falha plano se faltar (já aconteceu).

### 4. assigned_to: usar só agents existentes

**Regra:** `Coder` ou `General` (únicos disponíveis).

**Por que:** Outros nomes crasham engine ("agent not found").

### 5. Dependências explícitas

**Regra:** Usar `depends_on: [task1, task2]` para tarefas sequenciais.

**Por que:** Sem depends_on, engine dispatcha tudo simultâneo e gera conflito.

### 6. max_consecutive_failures = 2 (não 1)

**Por que:** 1 = cancela plano rápido demais. 2 = dá margem pra retry.

### 7. auto_accept = false (sempre)

**Por que:** Owner precisa revisar antes de aceitar.

### 8. auto_reject_retries = 1

**Por que:** Depois de 1 reject, manual_retry só com decisão do owner.

---

## Standards pra Documentação

### 1. Cadernos de bordo atualizados em CADA wave

Arquivos:
- `docs/EVOLUTION-LOG.md` - gaps + prioridades
- `docs/HEALTH-LOG.md` - status + aprendizados
- `docs/DEV-LOG.md` - decisões técnicas
- `docs/TEST-REPORT.md` - status dos testes

### 2. Cada decisão técnica = ADR

**Pattern:** `docs/adr/NNNN-titulo-curto.md`

**Template:** Status, Contexto, Decisão, Consequências, Alternativas.

### 3. Doc-as-code: como rodar, como extender

**Regra:** Toda doc nova tem 3 secoes:
- **Como rodar** (passos práticos)
- **Como extender** (adicionar feature)
- **Troubleshooting** (erros comuns)

---

## Standards pra Orquestrador

### 1. Sempre produzir logs estruturados

JSON Lines (jsonl) em `/workspace/logs/<plan-id>.log`

### 2. Wave termina = decisão + próximo wave

**Pattern:**
```bash
1. Wave termina → engine manda cycle-report
2. Owner aceita (override_accept se parcial)
3. Owner lança próximo wave via team run
4. Worker termina → engine manda cycle-report
5. Loop
```

### 3. Plano crashed = não tentar ressuscitar

**Pattern:** Se plano crashed por bug estrutural, cancelar + criar novo plano com schema corrigido.

---

## Standards pra Sandbox (limitações conhecidas)

### 1. max 3 workers simultâneos

**Por que:** 2GB RAM. Mais que isso = OOM.

### 2. Worktrees em /tmp (NÃO /workspace)

**Por que:** /workspace às vezes limpo. /tmp persiste melhor.

### 3. Push ANTES de report final

**Por que:** Sandbox pode matar worker entre report e push.

### 4. NUNCA confiar em "comando rodou sem erro"

**Por que:** Sandbox degrada I/O. Sempre rodar 2x pra confirmar.

### 5. Arquivos críticos em git, NUNCA em local

**Por que:** Se sandbox zera, código em origin volta via clone.

---

## Standards pra Owner (decisor)

### 1. Aceitar parcial > rejeitar tudo

**Pattern:**
- Se deliverable existe (arquivos no disco): `override_accept`
- Se deliverable não existe: `manual_retry` com prompt mais focado
- Nunca: `plan_complete=true` sem ter validado manualmente

### 2. Critério de qualidade mínimo

**Mínimo aceitável:**
- Arquivos criados em paths corretos
- TSC zero erros
- Conventional Commits
- Push em origin

**Ideal:**
- Testes passando (Vitest)
- Documentação atualizada
- Sem warnings de lint

### 3. Timezone do cron

**Regra:** Cron em UTC (consistente globalmente). User em GMT-3 (Brasil).

---

## Standards pra Auditoria (sempre rodar)

### 1. tsc --noEmit zero erros

```bash
timeout 60 npx tsc --noEmit --skipLibCheck
```

### 2. git log dos últimos 7 dias

```bash
git log --since="7 days ago" --oneline
```

### 3. Status dos planos ativos

```bash
# bash workaround (tool wrapper tem bug)
ls /workspace/.mavis/plans/
cat /workspace/.mavis/plans/plan_*/state.json | head -30
```

### 4. Branches locais vs origin

```bash
git branch -a | head -20
git log origin/feat/community-platform --oneline -3
```

---

## Métricas de qualidade (target)

| Métrica | Target |
|---|---|
| TSC erros | 0 |
| Conventional Commits compliance | >95% |
| Tasks com push antes de timeout | 100% |
| Branches mergeadas vs criadas | >80% |
| Cadernos de bordo atualizados | >90% das waves |
| Cobertura de testes | >60% (quando ambiente permitir) |
| Lighthouse score | >90 mobile |
| Bundle size | <200KB gzipped |
| Time-to-feedback (cron) | <6h |
| Wave success rate | >70% |

---

## Recovery procedures (saber o que fazer quando dá ruim)

### Cenário 1: Worker killed por timeout
- Aceitar com `override_accept`
- Verificar arquivos no disco
- Push manual se necessário
- Continuar próxima wave

### Cenário 2: Plano crashed estrutural
- Cancelar
- Corrigir YAML
- Relançar
- NÃO repetir sem fix

### Cenário 3: Sandbox I/O degradado
- Cancelar worker
- Esperar 1-2 min
- Relançar com mesmo YAML
- Documentar em HEALTH-LOG

### Cenário 4: Branches perdidas (wave-2)
- Aceitar perda
- Recriar a partir de docs/SPEC.md
- Workers committam + push incremental
- Owner merge direto sem worktrees

### Cenário 5: Tool wrapper com bug
- Documentar workaround
- Usar bash alternativo
- Notificar owner

---

> Última atualizacao: 2026-06-27 01:18 UTC
> Aprendizados principais: do wave-2 (branches perdidas) + wave-7 (criando 6 agents)
