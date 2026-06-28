# 🛠️ Sandbox Recovery Playbook — Akasha Portal

> **Versão:** 1.0 | **Data:** 2026-06-27
> **Status:** Plano operacional — executar quando bash do cloud sandbox recuperar
> **Escopo:** Recuperação segura de ~25+ commits Wave 11-15 após deadlock do bash (>5h travado)
> **Owners:** Coder + Caio (security) + Lina (designer) — Wave 16 (Trilha Planejamento)

---

## 🎯 Resumo executivo

**Situação:** Bash do cloud sandbox Mavis travou completamente. Read/Write/Edit tools funcionam (não tocam o worktree scan), mas qualquer `git`, `npx`, `pnpm`, `find`, `cat` em paths do projeto cabalham (>30s timeout).

**Objetivo do playbook:** Sequência de comandos **passo-a-passo, idempotente, com rollback** para:
1. Validar estado sem confiar em bash (usar Read em `.git/` direto)
2. Aplicar fixes críticos (Prisma mismatch, test orphans) ANTES de commitar
3. Commitar batch Wave 11-15 com mensagem conventional
4. Recriar crons stale (mavis `cron update/delete` tem bug — workaround via `create`)
5. Push + validar CI + rollback se necessário

**Tempo total estimado:** ~35min (assumindo bash estável; dobre o tempo se ainda estiver degradado).

**Regra de ouro:** Cada fase é **independente e verificável**. Se Fase N falhar, rollback Fase N antes de prosseguir.

---

## 📋 Pré-condições

Antes de começar, confirme:

| Item | Comando de verificação | Esperado |
|------|------------------------|----------|
| Bash recuperado | `echo "alive: $(date -u)"` | < 1s |
| Read tool OK | `Read` em `/workspace/cabaladoscaminhos/README.md` | Retorna conteúdo |
| Branch correta | `cat .git/HEAD` via Read | `ref: refs/heads/main` |
| Último commit | `cat .git/logs/HEAD \| tail -1` via Read | SHA curto + commit message Wave 11+ |
| Working dir | `pwd` no bash | `/workspace/cabaladoscaminhos` |

**Se bash ainda trava:** NÃO FORCE. Pule para seção [Diagnóstico adicional](#diagnóstico-adicional-quando-bash-ainda-trava) no fim.

---

## 🩺 Fase 1 — Validação de estado (5 min)

### 1.1 Git state via `.git/` direto (Read tool)

```bash
# ATENÇÃO: se bash travar, use Read tool em /workspace/cabaladoscaminhos/.git/logs/HEAD
git -C /workspace/cabaladoscaminhos log --oneline -20
git -C /workspace/cabaladoscaminhos status --short
git -C /workspace/cabaladoscaminhos diff --name-only HEAD~25 HEAD
```

**Fallback Read tool (se bash travar):**
```
Read /workspace/cabaladoscaminhos/.git/logs/HEAD offset=131 limit=200
```
→ Confirme: últimos commits Wave 11+ estão presentes, HEAD = main, sem `reset`/`rebase (abort)` recentes.

**Esperado:**
- ~25 commits Wave 11-15 já commitados (reflog mostra trilha contínua)
- Working tree pode ter uncommitted changes dos Waves 14-15 (docs/UI)

### 1.2 Identificar backlog não-commitado

```bash
git status --porcelain | wc -l   # esperado: 0 a ~15 (não 25+)
```

Se > 0, listar:
```bash
git status --porcelain | awk '{print $1}' | sort | uniq -c
```
→ Deve mostrar mix de `??` (untracked) e ` M`/` M` (modified).

### 1.3 TSC baseline check

```bash
cd /workspace/cabaladoscaminhos
npx tsc --noEmit 2>&1 | tee /tmp/tsc-baseline.log | tail -20
echo "Exit code: $?"
```

**Baseline esperado:** 2.831 erros pré-existentes (memory). Anote o número exato:
```bash
grep -c "error TS" /tmp/tsc-baseline.log
```

**Se aumentar em >5%:** NÃO prossiga para Fase 2 sem investigar (regressão nova).

### 1.4 Prisma version mismatch (memory)

```bash
node -e "console.log(require('/workspace/cabaladoscaminhos/node_modules/@prisma/client/package.json').version)"
cat /workspace/cabaladoscaminhos/package.json | grep -E '"prisma"|"@prisma"'
```

**Esperado:**
- `@prisma/client` = 6.x (lockfile real, instalado)
- `prisma` (devDep) = 7.8 (declarado mas não instalado)

**Mismatch é intencional** mas precisa ser normalizado ANTES do batch commit (Fase 2).

### 1.5 Disk + memory

```bash
df -h /workspace
free -h
```

**Mínimo:** 2GB livre, 512MB RAM disponível.

---

## 🔧 Fase 2 — Fixes críticos ANTES do batch commit (10 min)

### 2.1 Prisma downgrade (6.x) + regenerate

```bash
cd /workspace/cabaladoscaminhos
pnpm install prisma@6 --save-dev   # ou: npm install prisma@6 -D
pnpm install @prisma/client@6      # garante paridade
npx prisma generate
npx prisma validate
```

**Verificação:**
```bash
node -e "console.log(require('@prisma/client/package.json').version)"  # deve ser 6.x
```

**Rollback:**
```bash
pnpm install prisma@7.8 --save-dev  # volta para declarado
```

### 2.2 Cleanup test orphans

```bash
# Encontrar testes órfãos (sem source correspondente)
cd /workspace/cabaladoscaminhos
find src -name "*.test.ts" -o -name "*.spec.ts" | sort > /tmp/tests.txt
find src -name "*.ts" -o -name "*.tsx" | grep -v ".test." | grep -v ".spec." > /tmp/sources.txt

# Listar testes que não têm source (candidates para remoção)
comm -23 <(sed 's/\.test\.\|\.spec\.//' /tmp/tests.txt | sort) <(sort /tmp/tests.txt) > /tmp/orphans.txt
wc -l /tmp/orphans.txt
```

**Decisão:**
- Se `orphans.txt` < 20: deletar em batch
- Se >= 20: revisar manualmente (1 por 1) — pode ser suite E2E Playwright

**Backup antes de deletar:**
```bash
mkdir -p /tmp/orphan-backup/$(date +%Y%m%d)
xargs -a /tmp/orphans.txt cp --parents -t /tmp/orphan-backup/$(date +%Y%m%d)/
```

### 2.3 Fix `src/` production errors (opcional, TSC)

**Recomendação:** NÃO consertar os 2.831 erros pré-existentes no batch commit. São dívida histórica documentada.

**Filtrar SÓ regressões novas:**
```bash
cd /workspace/cabaladoscaminhos
git stash --include-untracked   # garante estado limpo
npx tsc --noEmit 2>&1 > /tmp/tsc-clean.log
git stash pop
npx tsc --noEmit 2>&1 > /tmp/tsc-current.log
diff /tmp/tsc-clean.log /tmp/tsc-current.log | grep "^>" > /tmp/tsc-new-errors.log
wc -l /tmp/tsc-new-errors.log
```

**Se `tsc-new-errors.log` > 0:** investigar cada um (são regressões dos Waves 11-15).

### 2.4 Smoke test essencial

```bash
cd /workspace/cabaladoscaminhos
pnpm test:run --reporter=basic 2>&1 | tail -30
```

**Esperado:** verde nos testes críticos (auth, posts, groups). Falhas em suite E2E são aceitáveis (Fase 5 valida CI).

---

## 📦 Fase 3 — Batch commit Wave 11-15 (5 min)

### 3.1 Stage files em batches atômicos

```bash
cd /workspace/cabaladoscaminhos

# Batch 1: docs (Wave 11 PM/strategy)
git add docs/PM-ROADMAP-Q4.md docs/STRATEGY-*.md docs/EVOLUTION-LOG.md docs/SANDBOX-RECOVERY-PLAYBOOK.md
git commit -m "docs(strategy): Wave 11-12 PM + estratégia consolidada

- Q4 2026 roadmap ICE-scored
- Cadeia de pensamento estratégica completa
- Sandbox recovery playbook (Wave 16)

Refs: Wave 11 PM trilha 3"

# Batch 2: security fixes (Wave 10 polish + Wave 12)
git add src/lib/security/ src/middleware.ts src/app/api/auth/
git commit -m "fix(security): Wave 10-12 polish — 6 fixes (F1/F2/F3/F6/F8/F11)

- F1: remove MiniMax API token hardcoded
- F2: real supabase.auth.signOut logout
- F3: gate demo login bypass to NODE_ENV=development
- F6/F8: CORS fail-closed + HSTS/COOP/CORP headers
- F11: gate debug auth routes

Refs: Caio Wave 10 audit"

# Batch 3: perf (Wave 10-11)
git add src/components/community/ next.config.js
git commit -m "perf(images+bundle): Wave 10-11 quick wins

- Trocar <img> por next/image em 3 páginas (groups, profile, feed)
- Code-split CreatePost via next/dynamic em /feed e /groups/[slug]
- ISR (revalidate) em /api/search e /api/search/suggestions

Refs: Aki Wave 10 audit"

# Batch 4: tests (Wave 10-12)
git add tests/ src/**/__tests__/ e2e/
git commit -m "test(e2e+unit): expand coverage Wave 10-12

- 8 Playwright specs cobrindo flows críticos
- Akashic: 22 prompt builder + 16 endpoint tests
- Security: F1/F2/F3/F11 unit tests
- Community: groups/likes/auth-viewer

Refs: Ravena Wave 10-12"

# Batch 5: features (Akashic IA — Wave 10)
git add src/lib/akashic/ src/app/api/akashic/ src/components/akashic/
git commit -m "feat(akashic): MVP Wave 10 — system prompt + endpoints + UI

- System prompt module (8 regras éticas) + RAG helper
- POST /api/akashic/chat + /stream (SSE)
- /akashic chat UI mobile-first + nav links

Refs: Wave 10 Akashic IA trilha"

# Batch 6: misc (deploy, governance, ops)
git add vercel.json scripts/ docs/
git commit -m "chore(deploy+governance): Vercel config + runbooks + CI

- vercel.json com preview deploys
- scripts/runbook.md para ops
- docs/API-REFERENCE.md
- docs/TROUBLESHOOTING.md

Refs: Wave 11 DevOps trilha"
```

### 3.2 Tag v0.2.0

```bash
cd /workspace/cabaladoscaminhos
git tag -a v0.2.0 -m "Wave 10-12 release — Akashic IA MVP + security + perf

Features:
- Akashic IA chat (system prompt + RAG + UI)
- Community v3.0 (feed + groups + profile)
- Security audit P0/P1 completo (6 fixes)
- Performance Wave 10 (next/image, ISR, dynamic imports)
- E2E suite (8 Playwright specs)

Co-authored-by: Akasha-0 <akasha@cabala.dev>
Co-authored-by: Akasha Steward <akasha-bot@cabaladoscaminhos.local>"

git tag --list | grep v0.2.0   # verificação
```

### 3.3 Verificação pré-push

```bash
git log --oneline v0.2.0 --not $(git rev-list --tags | head -1) | wc -l
# Esperado: 6+ commits desde v0.1.0-rc.1
git status --porcelain | wc -l
# Esperado: 0 (working tree limpo)
```

---

## ⏰ Fase 4 — Fix stale crons (5 min)

### 4.1 Identificar crons quebrados

```bash
mavis cron list --agent-name=akasha-steward --format=json | jq '.[] | select(.cron_name | test("community-platform|smoke-tests|auth-supabase"))'
```

**Esperado:** 2-3 crons que referenciam branches deletadas (`feat/community-platform`, `feat/smoke-tests`, `feat/auth-supabase`).

### 4.2 Workaround para bug do `mavis cron update`/`delete`

**Bug conhecido (memory):** `mavis cron update` e `mavis cron delete` retornam sucesso mas não persistem mudança.

**Workaround:** deletar + recriar via `cron create`:

```bash
# PASSO 1: capturar config atual do cron stale
STALE_CRON_ID="cron_abc123"  # pegar de `mavis cron get <id>`
STALE_NAME="daily-evolution-community-platform"
STALE_SCHEDULE="0 9 * * *"
STALE_PROMPT="<conteúdo do prompt atual>"

# PASSO 2: recriar com nome corrigido + branch main
mavis cron create \
  --agent-name=akasha-steward \
  --cron-name="daily-evolution-v3-community" \
  --schedule="$STALE_SCHEDULE" \
  --prompt="$STALE_PROMPT (refactored: now targets main branch instead of deleted feat/community-platform)" \
  --enabled=true

# PASSO 3: tentar delete do stale (vai falhar silenciosamente — OK)
mavis cron delete --task-id="$STALE_CRON_ID"
# Saída esperada: "deleted" mas o cron continua listado (bug conhecido)

# PASSO 4: marcar como desabilitado via update (vai falhar silenciosamente)
mavis cron update --task-id="$STALE_CRON_ID" --enabled=false
# Saída esperada: "updated" mas `enabled` continua true

# NOTA: o cron stale vai disparar 1x e falhar (branch not found) — não é grave
# Solução permanente: limpar via DB direto OU recriar ambiente
```

### 4.3 Validação

```bash
mavis cron list --agent-name=akasha-steward --format=json | jq '.[] | {name: .cron_name, enabled: .enabled, next_run: .next_run_at}'
```

**Esperado:**
- Novo cron `daily-evolution-v3-community` aparece com `enabled: true`
- Cron stale continua listado (bug) mas não-crítico

---

## 🚀 Fase 5 — Push + validação (10 min)

### 5.1 Push para origin

```bash
cd /workspace/cabaladoscaminhos
git remote -v   # verificar origin = https://github.com/Akasha-0/cabaladoscaminhos.git
git push origin main --follow-tags
```

**Saída esperada:**
```
Enumerating objects: 47, done.
Counting objects: 100% (47/47), done.
Delta compression using up to 8 threads
Compressing objects: 100% (32/32), done.
Writing objects: 100% (35/35), 124.50 KiB | 8.30 MiB/s, done.
Total 35 (delta 18), reused 0 (delta 0), pack-reused 0
To https://github.com/Akasha-0/cabaladoscaminhos.git
   67676d6..a1b2c3d  main -> main
 * [new tag]         v0.2.0 -> v0.2.0
```

### 5.2 CI check (GitHub Actions)

```bash
gh run list --branch=main --limit=5 --json=databaseId,name,conclusion,createdAt
```

**Esperado:** último run verde ou em progresso.

Para acompanhar ao vivo:
```bash
gh run watch $(gh run list --branch=main --limit=1 --json=databaseId -q '.[0].databaseId')
```

### 5.3 Deploy Vercel preview

```bash
gh pr list --state=all --limit=5 --json=number,title,url
```

**Se main foi pushado direto:** Vercel auto-deploya em produção. Verificar:
```bash
vercel ls cabaladoscaminhos --json | jq '.[] | {state, url, created}'
```

**Esperado:** 1 deploy novo com state=`READY` em 3-5min.

---

## 🔙 Rollback commands

### Rollback Fase 5 (push com problemas)

```bash
cd /workspace/cabaladoscaminhos

# Rollback de tag (não-destrutivo — só remove tag local e remote)
git tag -d v0.2.0
git push origin :refs/tags/v0.2.0

# Rollback de push (CUIDADO: reescreve histórico do main)
git push origin main~6:main --force-with-lease
# Espera: reverte main 6 commits para trás (= desfaz batch Wave 11-15)
```

### Rollback Fase 3 (commit local)

```bash
# Desfazer último commit (mantém mudanças staged)
git reset --soft HEAD~1

# Desfazer últimos 6 commits (mantém mudanças untracked)
git reset --mixed HEAD~6

# Desfazer últimos 6 commits (DESTRUTIVO — perde tudo)
git reset --hard HEAD~6
```

### Rollback Fase 2 (Prisma/test fixes)

```bash
# Prisma downgrade
pnpm install prisma@7.8 --save-dev
pnpm install @prisma/client@7.8
npx prisma generate

# Restaurar test orphans (do backup)
cp -r /tmp/orphan-backup/$(date +%Y%m%d)/* /workspace/cabaladoscaminhos/
```

### Rollback Fase 4 (cron)

```bash
# Desabilitar cron novo (vai falhar silenciosamente — bug)
mavis cron update --task-id="$NEW_CRON_ID" --enabled=false

# Workaround: deletar via cron create com flag especial (não suportado)
# Solução real: recriar ambiente OU patch DB direto
```

---

## ✅ Verification checklist pós-recovery

Execute esta lista ANTES de marcar a recovery como completa:

### Estado git
- [ ] `git status --porcelain | wc -l` retorna `0` (working tree limpo)
- [ ] `git log --oneline -1` mostra último commit do batch Wave 11-15
- [ ] `git tag --list | grep v0.2.0` retorna `v0.2.0`
- [ ] `git ls-remote --tags origin | grep v0.2.0` confirma tag no remote

### Estado CI/deploy
- [ ] `gh run list --branch=main --limit=1 --json=conclusion -q '.[0].conclusion'` retorna `"success"`
- [ ] Vercel deploy production READY em cabaladoscaminhos.vercel.app
- [ ] Health check endpoint `/api/health` retorna 200 (se existir)

### Estado Prisma
- [ ] `node -e "console.log(require('@prisma/client/package.json').version)"` retorna `6.x`
- [ ] `npx prisma validate` passa sem erro
- [ ] `npx prisma generate` regenera client sem warning

### Estado testes
- [ ] `pnpm test:run` passa nos críticos (auth, posts, groups, akashic)
- [ ] E2E smoke spec passa (`pnpm e2e:smoke`)
- [ ] TSC erro count ≤ baseline (2.831 ± regressões novas documentadas)

### Estado crons
- [ ] Novo cron `daily-evolution-v3-community` aparece em `mavis cron list`
- [ ] Antigos crons stale ainda aparecem (bug conhecido — não-crítico)
- [ ] Próximo `next_run_at` está no futuro (< 24h)

### Estado sandbox
- [ ] `echo "alive: $(date -u)"` retorna < 1s
- [ ] `git status` retorna < 5s
- [ ] `npx tsc --noEmit` completa (mesmo que com erros)
- [ ] Sem `.git/index.lock` órfão (`ls /workspace/cabaladoscaminhos/.git/*.lock` deve estar vazio)

### Estado segurança (Caio)
- [ ] `grep -r "MiniMax\|sk-" src/ --include="*.ts" --include="*.tsx" --include="*.env*"` retorna vazio (exceto `.env.example`)
- [ ] `curl -I https://cabaladoscaminhos.vercel.app` retorna headers HSTS/COOP/CORP
- [ ] `curl -X POST https://cabaladoscaminhos.vercel.app/api/auth/demo-bypass` retorna 403 em prod

### Estado UX (Lina)
- [ ] Lighthouse score ≥ 90 (perf, a11y, best-practices, SEO)
- [ ] Touch targets ≥ 44px em mobile (verificar via DevTools)
- [ ] iOS-safe font-sizes (nenhum < 16px em inputs)
- [ ] Skip-to-content link presente e funcional

---

## 🆘 Diagnóstico adicional: quando bash AINDA trava

Se mesmo após 5h bash continua travando, este playbook é INVALIDADO. Proceda:

### Quick checks (Read tool bypassa bash)

```
Read /workspace/cabaladoscaminhos/.git/index
→ Se retornar conteúdo binário válido (>100KB), index está OK
→ Se retornar erro ou <1KB, index corrompido

Read /workspace/cabaladoscaminhos/.git/logs/HEAD limit=5
→ Confirma últimas operações git estão registradas

Read /workspace/cabaladoscaminhos/.git/HEAD
→ Deve retornar "ref: refs/heads/main"

Read /workspace/cabaladoscaminhos/.git/packed-refs
→ Confirma origin/main SHA conhecido
```

### Recovery sem bash (Read + Edit only)

1. **Editar `.git/HEAD` direto** (avançado): trocar `ref: refs/heads/main` para SHA específico
2. **Escrever `.git/refs/heads/main` com SHA**: cria ref local sem `git update-ref`
3. **Mover arquivos via Read+Write**: copy = Read origem → Write destino
4. **git push via mavis?**: NÃO — mavis não tem subcomando git

### Quando escalar (bash morto + sandbox degradado)

Se **Read tool TAMBÉM falhar** em paths do projeto (não só bash), o sandbox está completamente perdido. Proceda:

1. Pare todos os workers (mavis session update --status=paused)
2. Notifique usuário: "Sandbox irrecuperável, sessão precisa ser reiniciada"
3. Documente tudo em `docs/SANDBOX-DEATH-REPORT.md` antes do timeout
4. NÃO force — aceite perda de sessão e recomece em sessão nova

---

## 📚 Apêndice A — Comandos equivalentes (Read vs Bash)

| Operação | Bash (rápido) | Read tool (fallback) |
|----------|---------------|----------------------|
| Ver HEAD | `cat .git/HEAD` | `Read .git/HEAD` |
| Ver reflog | `cat .git/logs/HEAD` | `Read .git/logs/HEAD` |
| Listar crons | `mavis cron list` | (via `mavis` tool direto) |
| Ver arquivo | `cat README.md` | `Read README.md` |
| SHA de commit | `git rev-parse HEAD` | `Read .git/refs/heads/main` |
| Status files | `git status` | (sem equivalente — só `Read .git/index` parseado) |

---

## 📚 Apêndice B — Referências e memória

### Memory topics relevantes
- `bash-sandbox-instability` — quais comandos travam, workarounds
- `git-forensics` — git forensics via Read direto em `.git/`
- `pipeline-orchestration-patterns` — cadência deitada quando bash morre

### Histórico do problema
- **2026-06-27 02:11** — health-check-loop reportou "loop estável mas idle"
- **2026-06-27 05:50** — snapshot pos-merge, sandbox saudável
- **2026-06-27 10:48** — snapshot pos-batch 3-worker, sandbox saudável
- **2026-06-27 ~16:00** — bash começou a degradar (5h+ travado)
- **2026-06-27 21:47** — Wave 16 TRILHA PLANEJAMENTO cria este playbook

### Owners e contatos
- **Coder** (Wave 16 execução): implementar comandos deste playbook quando bash voltar
- **Caio** (security review): validar Fase 2.3 (regressões TSC) + checklist segurança
- **Lina** (UX review): validar checklist UX pós-deploy
- **Akasha Steward** (cron management): executar Fase 4 (recriar crons stale)
- **Akasha-0** (owner): aprovar push para main + tag v0.2.0

---

## 🏁 Próximo passo após recovery completa

1. **Imediato (1h):** atualizar `docs/EVOLUTION-LOG.md` com rev #N+1 documentando recovery
2. **Curto prazo (24h):** abrir issue no GitHub sobre bug do `mavis cron update/delete`
3. **Médio prazo (1 sem):** migrar de pnpm para `bun` (sandbox lida melhor com bun)
4. **Longo prazo (1 mês):** configurar CI para validar sandbox recovery automaticamente (test que executa playbook em container efêmero)

---

**Fim do playbook.** Imprima ou bookmark — vai ser usado quando bash voltar. 🙏
