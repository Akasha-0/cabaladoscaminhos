# Post-Recovery Checklist — Wave 23

> **Data:** 2026-06-28
> **Versão:** 1.0 — POST-RECOVERY 2/5
> **Autor:** Coder + SRE (Wave 23)
> **Público:** owner do repo `Akasha-0/cabaladoscaminhos`
> **Pré-requisitos:**
> - [`STATE-VERIFY-W22.md`](./STATE-VERIFY-W22.md) — state of the repo em 2026-06-28 02:44 UTC
> - [`COMMIT-BATCH-GUIDE-W22.md`](./COMMIT-BATCH-GUIDE-W22.md) — guia detalhado de commits
> - [`SANDBOX-RECOVERY-PLAYBOOK.md`](./SANDBOX-RECOVERY-PLAYBOOK.md) — playbook operacional v1.0

---

## 🎯 Objetivo

Checklist **executivo** (não tutorial) com 5 fases para recuperar o repo após o deadlock do sandbox Wave 22:

1. Validar ambiente (5 min)
2. Sanitização (5 min)
3. Fix TSC baseline (5-30 min — Option C da memory)
4. Validação Wave 11-21 (15-30 min)
5. Commit + Push (5-15 min)

**Tempo total:** ~35-85 min (depende da saúde do TSC).

---

## 📊 Estado atual (snapshot 2026-06-28 06:12 UTC)

| Item | Valor | Origem |
|---|---|---|
| HEAD local | `67676d6f5924dee42c666acd0af22d01db0757a8` | `.git/refs/heads/main` (lido W22) |
| Branch | `main` | `.git/HEAD` |
| Último commit | `feat(security): LGPD completo + rate limit por user + audit log` | W22 |
| Commits Wave 11+ locais | 6 commits | W22 reflog |
| Push Wave 11 | ❌ NÃO FEITO | W22 |
| Arquivos Wave 12-21 no disco | ~50 não commitados | W22 |
| TSC baseline | 2830 errors (memory) | ⚠️ bloqueante para tag v0.2.0 |
| Prisma | versão 7.x (incompatível) → downgrade p/ 6.16.2 | W22 |
| Sandbox bash | intermitente (hang em git/TSC) | user_profile 2026-06-27 |

---

## 🩺 Fase 1 — Validação de ambiente (5 min)

### 1.1 Bash recuperado?

```bash
# Smoke test: comando leve < 1s
echo "alive: $(date -u)"
# esperado: < 1s, timestamp UTC impresso
```

**Se travar:** NÃO FORCE. Pule para [Anexo A — Read-only fallback](#anexo-a--read-only-fallback-quando-bash-ainda-trava).

### 1.2 Read tool em `.git/` direto

```bash
# Estado git (não-bash)
cat /workspace/cabaladoscaminhos/.git/HEAD
# esperado: ref: refs/heads/main

cat /workspace/cabaladoscaminhos/.git/refs/heads/main
# esperado: 67676d6f5924dee42c666acd0af22d01db0757a8

# Reflog (últimas 10 linhas)
tail -10 /workspace/cabaladoscaminhos/.git/logs/HEAD
# esperado: commits Wave 11+, sem reset/rebase abort
```

**✅ Checkpoint 1:** SHA confere com W22 (67676d6f), reflog sem anomalias.

### 1.3 Working tree delta vs HEAD

```bash
# Status do working tree (se bash OK)
git -C /workspace/cabaladoscaminhos status --short | wc -l
# esperado: ~50 arquivos modificados/untracked

# Lista de paths não-commitados
git -C /workspace/cabaladoscaminhos status --short | awk '{print $2}' > /tmp/w23-uncommitted.txt
wc -l /tmp/w23-uncommitted.txt
```

**Se bash travar aqui:** usar `git ls-files --others --exclude-standard` é impossível via Read direto. Use o file `docs/W22-DELIVERABLE.md` (já lista ~50 paths) como referência. **Não bloqueia.**

### 1.4 TSC baseline

```bash
cd /workspace/cabaladoscaminhos
timeout 90 npx tsc --noEmit 2>&1 | tee /tmp/tsc-baseline-w23.log | tail -5
# esperado: Error count line OU timeout
```

**Se timeout:** marcar como **BLOCKED**, ir para Fase 3 direto. Não bloquear validação manual.

### 1.5 Verificar `package.json` Prisma

```bash
grep -E '"prisma"|"@prisma/client"' /workspace/cabaladoscaminhos/package.json
# esperado: prisma 7.x.x → precisa downgrade p/ 6.16.2
```

**✅ Checkpoint 1A:** estado documentado, prontos para Fase 2.

---

## 🧹 Fase 2 — Sanitização (5 min)

### 2.1 Token rotation (Wave 23 W23-1 — já planejado)

```bash
# 2.1.1 — Listar secrets atuais
# NÃO usar bash para secrets — usar mavis tool:
mavis secret list

# 2.1.2 — Rotacionar tokens expostos (Stripe webhook, GitHub PAT, Vercel, OpenAI, etc.)
mavis secret update --name=GITHUB_TOKEN --value="<novo-valor>" --description="Rotated W23 post-sandbox recovery"
mavis secret update --name=STRIPE_SECRET_KEY --value="<novo-valor>" --description="Rotated W23"
# ... repetir para cada secret relevante

# 2.1.3 — Validar
mavis secret list
# esperado: todos com "Updated: 2026-06-28"
```

### 2.2 Limpar sandbox artifacts

```bash
# 2.2.1 — Logs antigos > 7 dias
find /workspace/cabaladoscaminhos/docs/.lint-output-*.log \
     /workspace/cabaladoscaminhos/docs/.tsc-output-*.log \
     /workspace/cabaladoscaminhos/docs/.vitest-community-*.log \
     -mtime +7 -ls 2>/dev/null

# 2.2.2 — Backup (NÃO deletar ainda — mover para /tmp)
mkdir -p /tmp/sandbox-artifacts-backup-$(date +%Y%m%d)
mv /workspace/cabaladoscaminhos/docs/.lint-output-*.log /tmp/sandbox-artifacts-backup-*/
# repetir para .tsc- e .vitest-

# 2.2.3 — Limpar .commit-msg-w*.txt rascunhos
ls /workspace/cabaladoscaminhos/docs/.commit-msg-w*.txt
# esperado: poucos arquivos (rascunhos Wave 15+)
# mover para backup se confirmados como rascunho
```

### 2.3 Limpar node_modules + cache (se disco cheio)

```bash
df -h /workspace  # < 20% livre → limpar
du -sh /workspace/cabaladoscaminhos/node_modules 2>/dev/null
du -sh /workspace/cabaladoscaminhos/.next 2>/dev/null

# Limpar somente se disk < 20% free:
cd /workspace/cabaladoscaminhos
rm -rf .next/cache
# NÃO deletar node_modules inteiro (regenerar via npm install)
```

**✅ Checkpoint 2:** tokens rotacionados, artefatos backupados, disco OK.

---

## 🔧 Fase 3 — Fix TSC baseline (5-30 min, Option C memory)

> Memory 2026-06-28: **"Opção C = rollback seletivo".** TSC 2830 errors é bloqueio P0 para tag v0.2.0.

### 3.1 Downgrade Prisma 7 → 6.16.2

```bash
cd /workspace/cabaladoscaminhos

# 3.1.1 — Conferir versão atual
grep '"prisma"' package.json
# esperado: 7.x.x

# 3.1.2 — Downgrade
npm install --save-exact prisma@6.16.2 @prisma/client@6.16.2
# esperado: adicionado 1 pacote, removido 1 pacote

# 3.1.3 — Regenerar cliente
npx prisma generate
# esperado: ✔ Generated Prisma Client (v6.16.2)

# 3.1.4 — Validar migrations
npx prisma migrate status
# esperado: Database schema is up to date
```

### 3.2 Cleanup orphans B2B

```bash
# 3.2.1 — Listar candidatos (cf. W20/W21 legacy cleanup)
cat /workspace/cabaladoscaminhos/docs/LEGACY-CLEANUP-W21.md | grep -E "^- " | head -20
# esperado: ~10 paths B2B (Stripe webhook, admin panel, MFA routes)

# 3.2.2 — Remover paths confirmados (DRY-RUN primeiro!)
git rm -n <path1> <path2> ... | tee /tmp/w23-rm-dryrun.txt
# revisar lista antes de aplicar

# 3.2.3 — Aplicar (somente após revisão)
git rm <path1> <path2> ...
```

**Lista conhecida Wave 21 (validar antes de remover):**
- `src/app/api/stripe/webhook/route.ts`
- `src/app/admin/**`
- `src/lib/mfa/**`
- `src/lib/billing/**`
- `prisma/schema-b2b.prisma`

### 3.3 Re-rodar TSC e contar errors

```bash
cd /workspace/cabaladoscaminhos
timeout 120 npx tsc --noEmit 2>&1 | tee /tmp/tsc-after-prisma-downgrade.log | tail -5
# esperado: < 100 errors (cf. memory Option C: "Validar < 100 errors")
```

**Se ainda > 1000 errors:**
```bash
# Diagnostic top-10 arquivos com mais errors
grep -E "^[^ ].+\.tsx?" /tmp/tsc-after-prisma-downgrade.log | sort | uniq -c | sort -rn | head -10
```

**Ações por arquivo:**
- `prisma/schema.prisma` → conferir se migration quebrou cliente
- `src/lib/akashic/**` → conferir imports (Wave 12)
- `src/app/api/auth/**` → conferir NextAuth types (Wave 11)

### 3.4 Decisão Go/No-Go

| Cenário | Decisão |
|---|---|
| TSC < 100 errors | ✅ Ir para Fase 4 |
| TSC 100-500 errors | ⚠️ Continuar, mas documentar debt em `docs/TSC-DEBT-W23.md` |
| TSC > 500 errors | 🔴 **PARAR.** Reverter downgrade Prisma (`git checkout package.json package-lock.json && npm install`) e escalar Wave 24 |

**✅ Checkpoint 3:** TSC < 100 OU debt documentado + escalation plan.

---

## ✅ Fase 4 — Validação Wave 11-21 (15-30 min)

### 4.1 TSC em arquivos novos (Wave 12-21)

```bash
cd /workspace/cabaladoscaminhos

# 4.1.1 — Identificar arquivos Wave 12-21 não-commitados
git status --short | awk '{print $2}' > /tmp/w23-uncommitted.txt
wc -l /tmp/w23-uncommitted.txt
# esperado: ~50 paths

# 4.1.2 — Filtrar só .ts/.tsx
grep -E "\.(ts|tsx)$" /tmp/w23-uncommitted.txt > /tmp/w23-ts-changed.txt
wc -l /tmp/w23-ts-changed.txt
```

**TSC focado (mais rápido):**
```bash
# 4.1.3 — Listar errors agrupados por path
timeout 90 npx tsc --noEmit 2>&1 | \
  grep -oE "^[^ ].+\.(ts|tsx)" | \
  sort -u > /tmp/w23-tsc-error-paths.txt

# 4.1.4 — Cross-ref: errors tocam arquivos Wave 12-21?
comm -12 <(sort /tmp/w23-ts-changed.txt) <(sort /tmp/w23-tsc-error-paths.txt) | tee /tmp/w23-intersect.txt
# esperado: lista de arquivos Wave 12-21 com errors
```

**Se intersect > 10 arquivos:** documentar em `docs/TSC-WAVE-12-21-AUDIT-W23.md` antes de prosseguir.

### 4.2 Visual smoke test (Read tool)

```bash
# 4.2.1 — Conferir que arquivos críticos existem e têm conteúdo não-vazio
for f in \
  src/lib/akashic/streaming.ts \
  src/app/api/akashic/stream/route.ts \
  src/lib/search/synonyms.ts \
  src/lib/community/search.ts \
  src/app/search/page.tsx \
  src/i18n/dictionaries/pt-BR.json \
  src/app/api/voice/route.ts ; do
  test -s "$f" && echo "✅ $f ($(wc -l < $f) lines)" || echo "❌ MISSING: $f"
done
```

**Critério:** todos `✅`. Se algum `❌`, **PARAR** — arquivo sumiu ou está vazio, não commitar.

### 4.3 Linter check (defensivo)

```bash
cd /workspace/cabaladoscaminhos
timeout 60 npx eslint --quiet src/lib/akashic src/lib/search src/lib/community src/i18n 2>&1 | tee /tmp/w23-eslint.log | tail -20
# esperado: 0 errors OU lista pequena de warnings aceitáveis
```

### 4.4 Bundle size check (sanity)

```bash
cd /workspace/cabaladoscaminhos
timeout 60 du -sh src/lib/akashic src/lib/search src/lib/community src/i18n 2>&1 | tee /tmp/w23-bundle.log
# esperado: cada trilha < 500KB
```

**✅ Checkpoint 4:** TSC focado OK + visual smoke 100% + lint clean OU debt documentado.

---

## 🚀 Fase 5 — Commit + Push (5-15 min)

### 5.1 Wave 11 push (commits já em HEAD)

```bash
cd /workspace/cabaladoscaminhos

# 5.1.1 — Confirmar 6 commits Wave 11+ em HEAD não-pushados
git log origin/main..HEAD --oneline
# esperado: 6 commits (W22 confirmou)

# 5.1.2 — Push Wave 11
git push origin main
# esperado: 6 commits pushados, sem conflitos

# 5.1.3 — Validar
git log origin/main -5 --oneline
# esperado: SHA 67676d6f no topo
```

### 5.2 Wave 12-21 batch commit

```bash
cd /workspace/cabaladoscaminhos

# 5.2.1 — Stage ALL (cuidado: revisar antes)
git add -A

# 5.2.2 — Conferir staging
git diff --cached --stat | tail -5
# esperado: ~50 arquivos, +5000/-1000 lines (aproximado)

# 5.2.3 — Commit batch (mensagem resumida — detalhes no body)
git commit -m "feat: wave 12-21 batch — akashic streaming, search filters, voice, i18n, perf

Waves combined: 12 (akashic streaming + i18n + voice), 13 (UX patterns),
14 (animations + a11y deep), 15 (mobile fixes), 16-17 (perf + animations),
18 (search + analytics + akashic improvements), 19 (a11y final + admin),
20 (admin dashboard + legacy cleanup), 21 (pages + apis push + deliverables)

Refs:
- docs/AKASHIC-STREAMING-W12.md
- docs/MOBILE-DEEP-WAVE11.md (Wave 15 subset)
- docs/ANIMATIONS-W17.md
- docs/A11Y-DEEP-AUDIT-FINAL-W19.md
- docs/ADMIN-DASHBOARD-W20.md
- docs/LEGACY-CLEANUP-W21.md
- docs/APIS-PUSH-W21.md
- docs/PAGES-W21.md
- docs/SEARCH-W18.md

Breaking: see docs/LEGACY-CLEANUP-W21.md for B2B file removals."
```

### 5.3 Tag v0.2.0

```bash
cd /workspace/cabaladoscaminhos

# 5.3.1 — Conferir SHA do commit batch
SHA_BATCH=$(git rev-parse HEAD)
echo "Batch SHA: $SHA_BATCH"

# 5.3.2 — Tag annotated (não lightweight!)
git tag -a v0.2.0 -m "v0.2.0 — Wave 12-21 batch (akashic streaming, search, i18n, voice)

$(git log --oneline 67676d6f..HEAD | wc -l) commits since v0.1.0-rc.1.

Highlights:
- Akashic streaming SSE + voice mode
- Search: pg_trgm + PT-BR synonyms + filters (Wave 18)
- i18n EN/ES
- A11y WCAG AA final audit
- Admin dashboard + Legacy B2B cleanup
- Performance: code-split, ISR, next/image migrations

Refs: docs/STATE-VERIFY-W22.md, docs/POST-RECOVERY-CHECKLIST-W23.md"

# 5.3.3 — Conferir
git tag -l v0.2.0
git show v0.2.0 --stat | head -20
```

### 5.4 Push Wave 12-21 + tag

```bash
cd /workspace/cabaladoscaminhos

# 5.4.1 — Push branch (commits Wave 12-21)
git push origin main
# esperado: 1 commit (batch) pushado

# 5.4.2 — Push tag
git push origin v0.2.0
# esperado: tag v0.2.0 disponível em origin

# 5.4.3 — Validação final
git log origin/main -10 --oneline
git tag -l v0.2.0
# esperado: SHA batch no topo de origin/main, tag v0.2.0 listada
```

**✅ Checkpoint 5:** todos pushes OK, tag disponível.

---

## 🔄 Rollback Plan

### Identificar "last good" SHA

```bash
# R1 — Listar últimos 5 commits com SHA completo
git log -5 --format="%H %s"

# R2 — Identificar candidato "last good" = 67676d6f (Wave 11 LGPD, validado W22)
LAST_GOOD=67676d6f5924dee42c666acd0af22d01db0757a8

# R3 — Conferir tag local (se existir)
git show-ref --tags | head -5
```

### Cenários de rollback

#### R-A: Wave 11 push quebrou CI → reverter push sem perder trabalho local

```bash
cd /workspace/cabaladoscaminhos

# R-A.1 — Conferir que nada local foi perdido
git log origin/main -10 --oneline  # se HEAD local = origin/main, nada pushou
git log HEAD -10 --oneline          # conferir estado local

# R-A.2 — Reverter via reverse commit (preserva histórico)
git revert HEAD~5..HEAD --no-edit
# OU: se for 1 commit só:
git revert HEAD --no-edit

# R-A.3 — Push do revert
git push origin main
```

#### R-B: Wave 12-21 batch commit quebrou build → reset --soft (preserva staging)

```bash
cd /workspace/cabaladoscaminhos

# R-B.1 — Conferir que estamos no commit batch
git log -1 --format="%H %s"
# esperado: "feat: wave 12-21 batch — ..."

# R-B.2 — Soft reset (mantém arquivos staged)
git reset --soft $LAST_GOOD
git status --short | head -5
# esperado: arquivos ainda staged, prontos para re-commitar após fix

# R-B.3 — Re-rodar TSC e validar antes de novo commit
timeout 120 npx tsc --noEmit 2>&1 | tee /tmp/tsc-after-rollback.log | tail -5
```

#### R-C: Tudo quebrou → reset --hard para last good

```bash
cd /workspace/cabaladoscaminhos

# R-C.1 — CONFIRMAR 2x (perigoso!)
echo "Vou resetar para $LAST_GOOD — TODOS arquivos uncommitted serão PERDIDOS"
git status --short | wc -l  # lembrar: ~50 arquivos serão perdidos

# R-C.2 — Backup de segurança
mkdir -p /tmp/w23-emergency-backup
cp -r /workspace/cabaladoscaminhos/src /tmp/w23-emergency-backup/src-$(date +%s)
cp -r /workspace/cabaladoscaminhos/docs /tmp/w23-emergency-backup/docs-$(date +%s)

# R-C.3 — Reset hard
git reset --hard $LAST_GOOD

# R-C.4 — Validar
git log -1 --format="%H %s"  # esperado: 67676d6f
git status --short | wc -l   # esperado: 0
```

#### R-D: Tag v0.2.0 errada → deletar e recriar

```bash
cd /workspace/cabaladoscaminhos

# R-D.1 — Local
git tag -d v0.2.0

# R-D.2 — Remote
git push origin :refs/tags/v0.2.0
# OU (alternativa): git push origin --delete v0.2.0

# R-D.3 — Recriar no commit correto
git tag -a v0.2.0 <sha-correto> -m "..."
git push origin v0.2.0
```

### Critério de escalação

Se **rollback não restaura build verde em 2 tentativas**:
1. Criar issue/handoff em `docs/HANDOFF-W24-RECOVERY.md`
2. Listar: SHA tentados, errors TSC, últimos 20 commits, packages instalados
3. Escalar Wave 24 com nova estratégia (ex.: bisect, fix isolado por arquivo)

---

## ✔️ Verification Tests (pós-push, ANTES de declarar done)

```bash
# V1 — Push de Wave 11 confirmado
git log origin/main -5 --oneline
# esperado: 67676d6f no topo OU abaixo de commits Wave 10

# V2 — Push de Wave 12-21 batch confirmado
git log origin/main -10 --oneline | grep "wave 12-21 batch"
# esperado: 1 linha com subject do batch commit

# V3 — Tag v0.2.0 disponível
git ls-remote --tags origin | grep v0.2.0
# esperado: linha com SHA + refs/tags/v0.2.0

# V4 — Working tree local limpo
git status --short | wc -l
# esperado: 0

# V5 — TSC pós-fix
timeout 120 npx tsc --noEmit 2>&1 | tail -1
# esperado: "Found 0 errors" OU < 100 com debt documentado
```

**GitHub UI (manual):**
- Abrir https://github.com/Akasha-0/cabaladoscaminhos/commits/main
- Confirmar: tag `v0.2.0` visível, último commit = "feat: wave 12-21 batch..."
- CI status (se GitHub Actions configurado): verde

---

## 🔥 Smoke Test Commands (pós-deploy em staging/prod)

> **Quando rodar:** após CI verde + push de tag v0.2.0 para `main`. Em staging OU prod (após deploy automático).

```bash
# S1 — Health check
curl -fsS https://<host>/api/health
# esperado: {"status":"ok","version":"0.2.0"}

# S2 — Landing / validacao renderiza
curl -fsS https://<host>/validacao -o /tmp/s2.html
wc -c /tmp/s2.html  # esperado: > 50KB
grep -c "validacao" /tmp/s2.html  # esperado: >= 1 match

# S3 — Login flow (NextAuth credentials provider)
# Substituir <cookie-jar> por path real
curl -fsS -c <cookie-jar> -X POST https://<host>/api/auth/csrf
curl -fsS -b <cookie-jar> -X POST https://<host>/api/auth/callback/credentials \
  -d "email=test@example.com&password=<test-pwd>&csrfToken=<csrf>"
# esperado: 200 + Set-Cookie de sessão

# S4 — Akashic chat responde (autenticado)
curl -fsS -b <cookie-jar> -X POST https://<host>/api/akashic/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"o que é escorpiao?"}'
# esperado: 200 + JSON com `text` OU stream SSE

# S5 — Search filtra + highlight
curl -fsS "https://<host>/api/search?q=escorpião&level=intermediario&hasAudio=true"
# esperado: 200 + array results com <mark> em highlights

# S6 — i18n switch
curl -fsS https://<host>/pt-BR/dashboard -o /tmp/s6-pt.html
curl -fsS https://<host>/en/dashboard -o /tmp/s6-en.html
diff /tmp/s6-pt.html /tmp/s6-en.html | wc -l  # esperado: > 0 (idiomas diferem)

# S7 — Voice route
curl -fsS -X POST https://<host>/api/voice \
  -H "Content-Type: audio/wav" \
  --data-binary @sample.wav
# esperado: 200 + transcription JSON

# S8 — Admin dashboard (se aplicável, requer role admin)
curl -fsS -b <admin-cookie-jar> https://<host>/admin
# esperado: 200 + HTML do dashboard
```

**Critério Go/No-Go:**
- S1-S5: todos `✅` → declarar v0.2.0 deployed
- S6-S8: 2/3 `✅` → aceitável (i18n/voice podem ter rate limit em staging)
- Qualquer 5xx persistente → rollback Wave 23 (ver Rollback Plan R-D + R-C)

---

## 📌 Decisão ao final de cada fase

| Fase | ✅ SUCESSO | ⚠️ ACEITÁVEL COM DEBT | 🔴 BLOQUEIO |
|---|---|---|---|
| 1. Validação | bash OK, SHA confere, reflog limpo | bash intermitente, Read-only OK | bash morto, sem Read tool |
| 2. Sanitização | secrets rotacionados, disco OK | artefatos não-backupados, sem impacto | secrets expostos sem rotate |
| 3. TSC | < 100 errors | 100-500, debt doc | > 500 OU Prisma broken |
| 4. Validação | TSC focado OK, visual smoke 100%, lint clean | 1-2 paths missing, lint warning | qualquer `❌` em smoke OU > 10 lint errors |
| 5. Push | Wave 11 + batch + tag OK, CI verde | push manual pós-fix de 1-2 erros | CI vermelho > 2h OU conflito em push |

---

## 🚦 Próxima ação (W24)

**Se W23 terminar com ✅ em todas as 5 fases:**
- Wave 24 = Polish (perf deep, e2e regression suite, observability)
- Referência: `docs/08_roadmap.md` Q4 features com ICE score

**Se W23 terminar com ⚠️ em qualquer fase:**
- Wave 24 = Continuar cleanup da fase com ⚠️ (ex.: debt TSC)
- Criar `docs/HANDOFF-W24-<fase>.md` com contexto

**Se W23 terminar com 🔴:**
- Rollback completo (R-C), reabrir playbook v1.0 (`SANDBOX-RECOVERY-PLAYBOOK.md`)
- Escalação: Coder + SRE + PM (Tomás) + Owner

---

## Anexo A — Read-only fallback (quando bash ainda trava)

Se Fase 1.1-1.4 falharem (bash morre), usar **Read tool** em arquivos `.git/` direto:

| Comando bash (alvo) | Fallback Read tool |
|---|---|
| `git rev-parse HEAD` | Read `/workspace/cabaladoscaminhos/.git/refs/heads/main` |
| `git log --oneline -10` | Read `/workspace/cabaladoscaminhos/.git/logs/HEAD` (reflog) |
| `git status --short` | Não disponível via Read direto. Usar `docs/W22-DELIVERABLE.md` (lista ~50 paths) |
| `git tag -l` | Read `/workspace/cabaladoscaminhos/.git/packed-refs` + glob `.git/refs/tags/*` |
| `npx tsc --noEmit` | Não disponível. Pular para Wave 24 com TSC deferido. |

**Quando usar:** bash travou em 2+ comandos consecutivos. Documente em `docs/BASH-DEGRADED-W23.md` e prossiga com Read-only.

---

## Anexo B — Comandos one-liner úteis

```bash
# B1 — Resumo executivo em 1 comando
{ echo "=== HEAD ==="; cat /workspace/cabaladoscaminhos/.git/refs/heads/main; \
  echo "=== Working tree ==="; git -C /workspace/cabaladoscaminhos status --short 2>/dev/null | wc -l; \
  echo "=== Prisma version ==="; grep '"prisma"' /workspace/cabaladoscaminhos/package.json; }

# B2 — TSC count rápido
timeout 90 npx tsc --noEmit 2>&1 | grep -c "error TS"

# B3 — Path mais comum em errors
timeout 90 npx tsc --noEmit 2>&1 | grep -oE "^[^ ].+\.tsx?" | sort | uniq -c | sort -rn | head -10

# B4 — Diff entre HEAD e origin/main
git -C /workspace/cabaladoscaminhos log origin/main..HEAD --oneline | wc -l

# B5 — Tamanho de arquivos Wave 12-21 untracked
git -C /workspace/cabaladoscaminhos status --porcelain | awk '{print $2}' | \
  xargs -I {} du -h {} 2>/dev/null | sort -h | tail -20
```

---

## Histórico

| Versão | Data | Mudança |
|---|---|---|
| 1.0 | 2026-06-28 | Criação inicial — POST-RECOVERY 2/5 (Wave 23) |

---

**Refs:**
- [`STATE-VERIFY-W22.md`](./STATE-VERIFY-W22.md) — state snapshot W22
- [`COMMIT-BATCH-GUIDE-W22.md`](./COMMIT-BATCH-GUIDE-W22.md) — guia detalhado de commits
- [`SANDBOX-RECOVERY-PLAYBOOK.md`](./SANDBOX-RECOVERY-PLAYBOOK.md) — playbook v1.0
- [`LEGACY-CLEANUP-W21.md`](./LEGACY-CLEANUP-W21.md) — paths B2B para Fase 3.2
- [`SECURITY-LGPD-CHECKLIST.md`](./SECURITY-LGPD-CHECKLIST.md) — tokens + secrets (Fase 2.1)
- `user_profile` 2026-06-27 — git bash hangs pattern + BLOCKED-w/-evidence acceptance
- `agent_memory` 2026-06-28 — Option C rollback seletivo + TSC debt < 100 errors