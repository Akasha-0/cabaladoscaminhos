# Deploy Runbook — `refactor-akasha-v2` → produção

> Procedimento passo-a-passo para aplicar o PR #4 em produção. Executar em janela de manutenção, com rollback preparado.

**PR:** https://github.com/Akasha-0/cabaladoscaminhos/pull/4
**Branch:** `refactor/akasha-v2` (16 commits)
**Migrations envolvidas:** `20260606000000_init_akasha_v2` + `20260606000001_add_user_consent_at` + `20260606000010_push_subscriptions`
**Risk:** 🔴 **HIGH** — a migration inicial é destrutiva. **Backup obrigatório** antes de aplicar.

---

## 0. Pré-condições (T-1h)

```bash
# Confirme que o PR está aprovado
gh pr view 4 --json state,mergeable,reviews

# Confirme que o CI do PR está verde
gh pr checks 4
```

- [ ] PR #4 aprovado por ≥ 1 reviewer com permissão de merge
- [ ] CI verde (typecheck, lint, test, build)
- [ ] Janela de manutenção comunicada (se houver usuários ativos)
- [ ] Time de plantão avisado

## 1. Merge

```bash
# Opção A: merge via CLI
gh pr merge 4 --squash --body "Production deploy"

# Opção B: merge via UI do GitHub
# https://github.com/Akasha-0/cabaladoscaminhos/pull/4
```

Recomendado `--squash` para manter `main` limpo (1 commit de merge em vez de 16).

## 2. Backup do banco (T-30min)

```bash
# No servidor de produção
cd /opt/cabala-dos-caminhos

# 2a. Backup full do banco atual
./scripts/backup-db.sh

# 2b. Verificar o backup
ls -lh /var/backups/cabala/$(date +%Y%m%d)_*.sql.gz
gunzip -c /var/backups/cabala/$(date +%Y%m%d)_*.sql.gz | head -50

# 2c. Anotar tamanho, contagem de tabelas, e contagem de linhas críticas
psql "$DATABASE_URL" -c "SELECT count(*) AS users FROM \"User\";"
psql "$DATABASE_URL" -c "SELECT count(*) AS grimoire FROM grimoire;"
```

⚠️ **NÃO prossiga se o backup não foi validado.** O restore é mais barato do que recriar dados.

## 3. Pull + install (T-25min)

```bash
cd /opt/cabala-dos-caminhos

# 3a. Pull do main
git fetch origin
git checkout main
git pull origin main

# 3b. Conferir a SHA do merge
git log -1 --format='%H %s'

# 3c. Instalar deps
npm ci

# 3d. Gerar Prisma Client (sanity)
npm run db:generate
```

## 4. Dry-run das migrations (T-20min)

```bash
# 4a. Verifica status
npx prisma migrate status

# Saída esperada (em produção ainda com schema legado):
# "Database schema is not in sync with the migration history"
# + lista das 3 migrations pendentes
# (init_akasha_v2, add_user_consent_at, push_subscriptions)

# 4b. Gera o SQL que será executado (sem aplicar)
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-migrations prisma/migrations \
  --script > /tmp/migration-preview.sql

# 4c. Revise o SQL gerado
less /tmp/migration-preview.sql
```

⚠️ **ATENÇÃO** — a `20260606000000_init_akasha_v2` é destrutiva. Ela vai:
- `DROP TABLE` em qualquer tabela legada (Operator, Client, Reading, Report, OperatorSession, etc.)
- `DROP TYPE` nos enums legados (OperatorRole, etc.)
- Criar o schema canônico B2C do zero

**Se houver dados legados em produção, o `prisma migrate deploy` vai falhar com conflito de nomes.** Nesse caso, siga o caminho "Migrations destrutivas + dados legados" abaixo.

### Caminho alternativo: dados legados em produção

```bash
# 1. Exportar dados legados ANTES da migration
pg_dump --data-only --table='"Operator"' --table='"Client"' \
  --table='"Reading"' --table='"Report"' "$DATABASE_URL" \
  > /tmp/legacy-data-$(date +%Y%m%d).sql

# 2. Aplicar migration
npx prisma migrate deploy

# 3. Importar dados legados para arquivo morto (opcional)
# Criar schema 'legacy_archive' e importar lá para consulta histórica
psql "$DATABASE_URL" -c "CREATE SCHEMA IF NOT EXISTS legacy_archive;"
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS legacy_archive.\"Operator\";"
psql "$DATABASE_URL" -c "CREATE TABLE legacy_archive.\"Operator\" (LIKE public.\"Operator\" INCLUDING ALL);" 2>/dev/null || true
# (Ajustar conforme schema legado real)
```

## 5. Aplicar migrations (T-15min → T-5min)

```bash
cd /opt/cabala-dos-caminhos

# 5a. Aplicar
npx prisma migrate deploy

# Saída esperada:
# 3 migrations found in prisma/migrations
# Applying migration 20260606000000_init_akasha_v2
# Applying migration 20260606000001_add_user_consent_at
# Applying migration 20260606000010_push_subscriptions
# All migrations applied successfully.

# 5b. Conferir tabelas
psql "$DATABASE_URL" -c "\dt" | grep -E 'User|BirthChart|Subscription|CreditEntry|Manifesto|DailyReading|RitualCompletion|Consultation|ChatMessage|GrimoireEntry|PushSubscription'
# Espera-se 11 tabelas.

# 5c. Conferir pgvector
psql "$DATABASE_URL" -c "SELECT extname FROM pg_extension WHERE extname = 'vector';"
# Deve retornar 1 linha.

# 5d. Conferir índice do grimoire
psql "$DATABASE_URL" -c "\d grimoire_embedding_idx"
# Deve mostrar ivfflat + vector_cosine_ops.
```

## 6. Seed (T-3min)

```bash
cd /opt/cabala-dos-caminhos

# 6a. Setar senha do admin (use um cofre — 1Password, Vault, Doppler)
export SEED_ADMIN_PASSWORD="<senha forte gerada pelo cofre>"

# 6b. Rodar seed
npm run db:seed

# 6c. Verificar admin criado
psql "$DATABASE_URL" -c "SELECT email, role, \"createdAt\" FROM \"User\" WHERE role = 'ADMIN';"
# Deve retornar gabriel@cabaladoscaminhos.com com role=ADMIN.
```

## 7. Deploy da aplicação (T-0)

```bash
# 7a. Build
npm run build

# 7b. Reiniciar app
pm2 reload cabaladoscaminhos

# 7c. Conferir logs
pm2 logs cabaladoscaminhos --lines 100
```

## 8. Verificação pós-deploy (T+5min)

```bash
# 8a. Health check
curl -sS https://cabala-dos-caminhos.com/api/health/ready | jq .

# 8b. Tentar login admin
curl -sS -X POST https://cabala-dos-caminhos.com/api/akasha/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gabriel@cabaladoscaminhos.com","password":"<SEED_ADMIN_PASSWORD>"}' | jq .

# 8c. Conferir rotas akasha
for route in auth/me chart consult daily manifesto mandala subscription transits/today; do
  status=$(curl -sS -o /dev/null -w '%{http_code}' "https://cabala-dos-caminhos.com/api/akasha/$route")
  echo "akasha/$route → $status"
done
# Esperado: 401 (não autenticado) ou 200 (autenticado). NÃO 404.

# 8d. Conferir que rotas B2B estão mortas
for route in operator/auth/me cockpit admin/operators; do
  status=$(curl -sS -o /dev/null -w '%{http_code}' "https://cabala-dos-caminhos.com/api/$route")
  echo "/api/$route → $status (esperado 404)"
done
```

## 9. Validação do Service Worker (Fase Q)

```bash
# 9a. Conferir que o SW está sendo servido
curl -sS -I https://cabala-dos-caminhos.com/sw.js | head -5
# Esperado: 200 OK, Content-Type: application/javascript

# 9b. Conferir manifest
curl -sS https://cabala-dos-caminhos.com/manifest.json | jq .name
# Esperado: "Cabala dos Caminhos" (ou nome similar)

# 9c. Teste manual (Chromium DevTools):
#   1. Abrir https://cabala-dos-caminhos.com
#   2. DevTools → Application → Service Workers
#   3. Conferir que está activated e running
#   4. DevTools → Application → Manifest
#   5. Conferir ícones, name, start_url, display
```

## 10. Monitoramento (T+15min até T+24h)

- [ ] Sem erros 5xx no log do pm2
- [ ] Sem exceções do Prisma no log
- [ ] Latência p95 da rota `/api/akasha/consult` < 3s
- [ ] Taxa de erros de push notification < 1%
- [ ] Health check `/api/health/ready` retorna 200 consistentemente

## 11. Rollback

Se algo der errado nos primeiros 30min:

```bash
# 11a. Parar a app
pm2 stop cabaladoscaminhos

# 11b. Reverter código
git revert -m 1 <merge-commit-sha>
# OU
git reset --hard origin/main@{1}
git pull origin main

# 11c. Rebuild
npm ci
npm run build

# 11d. Restaurar banco (CUIDADO — perde tudo escrito entre T-30min e agora)
gunzip -c /var/backups/cabala/<timestamp>.sql.gz | psql "$DATABASE_URL"

# 11e. Reiniciar
pm2 reload cabaladoscaminhos

# 11f. Validar
curl -sS https://cabala-dos-caminhos.com/api/health/ready
```

⚠️ Rollback do banco **destrutivo** — só usar se houver certeza de que os dados escritos após o backup são descartáveis.

## 12. Pós-deploy

- [ ] Comunicar "deploy concluído" no canal de plantão
- [ ] Atualizar status page (se houver)
- [ ] Adicionar entrada no changelog
- [ ] Fechar milestone / epic
- [ ] Monitorar logs por 24h

---

## Apêndice A — Comandos úteis

```bash
# Tamanho do banco
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Conexões ativas
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"

# Migrações aplicadas
npx prisma migrate status

# Histórico de backups
ls -lh /var/backups/cabala/

# Logs do app
pm2 logs cabaladoscaminhos --lines 200 --nostream
```

## Apêndice B — Checklist de pré-merge

- [x] `prisma validate` exit 0
- [x] `prisma generate` exit 0
- [x] `tsc --noEmit` exit 0
- [x] `npm run test:run` 8113 passed, 0 failed
- [x] `npm run build` exit 0
- [x] Spec compliance review ✅ APPROVED
- [x] Code quality review ✅ APPROVED (2 rounds)
- [x] 1 CRITICAL + 3 HIGH + 1 LOW corrigidos
- [x] Branch `refactor/akasha-v2` pushada
- [x] PR #4 aberto com descrição completa
- [x] `.trae/specs/refactor-akasha-v2/` materializado em disco
