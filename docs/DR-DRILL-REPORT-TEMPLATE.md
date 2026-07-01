# DR Drill Report — Template (Wave 34)

> **Versão:** 1.0 | **Data:** 2026-07-01 | **Wave:** 34 (DISASTER RECOVERY 1/8)
> **Idioma:** PT-BR
> **Owner:** DevOps
> **Quando usar:** Após cada DR drill (trimestral).
> **Salvar em:** `docs/dr-drills/YYYY-QX-drill-report.md`

---

## Metadata

```yaml
Drill ID:           DRILL-YYYY-QX-NN  (ex: DRILL-2026-Q3-01)
Data:               YYYY-MM-DD
Hora de início:     HH:MM UTC
Hora de fim:        HH:MM UTC
Duração total:      Xh Ymin
Tipo de drill:      [ ] Tabletop  [ ] Restore test  [ ] Failover test  [ ] Full DR
Severidade simulada: [ ] P0  [ ] P1  [ ] P2  [ ] P3
Cenário simulado:   <descrever cenário (ex: DB corrompido, restore de S3)>
Responsável:        <nome>
Participantes:      <lista de pessoas envolvidas>
Backup testado:     akasha-db-YYYYMMDD.dump (size: XMB, age: Yd)
RTO medido:         Xmin (target: < 4h para critical tier)
RPO medido:         Yh (target: < 24h)
Status:             [ ] PASS  [ ] FAIL (parcial)  [ ] FAIL (total)
```

---

## 1. Resumo executivo

<1-2 parágrafos resumindo o que foi testado, resultado, e principais lições>

**Exemplo:**

> Drill trimestral Q3 2026 executado em 2026-09-15. Testamos restore de backup S3 do dia 2026-09-14 para staging DB em região us-east-1. Restore completo em 28min (target: < 30min). Todos os 16 smoke tests E2E passaram. Verificamos que as extensões pgvector e uuid-ossp foram corretamente restauradas, mas identificamos que a extensão `pg_trgm` precisa ser adicionada ao setup script. Ação: atualizar `scripts/setup-supabase-storage.sh` antes do próximo drill.

---

## 2. Cenário simulado

### 2.1 Premissa

<O que假设假设? Ex: "Supomos que o DB primário foi corrompido por falha de hardware às 14:00 UTC do dia 2026-09-14">

### 2.2 Comandos executados

```bash
# Listar aqui os comandos executados durante o drill
# Ex:

# 1. Setup
mkdir -p /tmp/akasha-dr-drill/
cd /workspace/cabaladoscaminhos/

# 2. Listar backups disponíveis
aws s3 ls s3://akasha-backups/db/daily/ | tail -5

# 3. Executar drill
bash scripts/backup/disaster-recovery-drill.sh \
  --source=s3 \
  --bucket=akasha-backups/db/daily/ \
  --target-db=postgres \
  --target-host=$STAGING_DB_HOST \
  --verify \
  --smoke-test

# 4. Validar restore
psql $STAGING_DB_URL -c "SELECT count(*) FROM users;"
# ... etc
```

### 2.3 Timeline detalhada (UTC)

| Hora | Evento | Responsável |
|------|--------|-------------|
| 13:50 | Início do drill (pre-flight checks) | @dev1 |
| 13:55 | Backup selecionado: akasha-db-20260914.dump | @dev1 |
| 13:58 | Download S3 completo (3.2GB) | @dev1 |
| 14:02 | Checksum validado | @dev1 |
| 14:05 | pg_restore iniciado | @dev1 |
| 14:25 | pg_restore completo (20min) | @dev1 |
| 14:30 | Schema validation OK | @dev1 |
| 14:35 | Smoke tests E2E (16/16 passed) | @dev2 |
| 14:42 | Cleanup staging DB | @dev1 |
| 14:50 | Drill concluído, relatório iniciado | @dev1 |

---

## 3. Resultados

### 3.1 Métricas-chave

| Métrica | Target | Medido | Status |
|---------|--------|--------|--------|
| **RTO** (tempo total de restore) | < 4h (critical) | XXmin | [ ] PASS [ ] FAIL |
| **RPO** (idade do backup) | < 24h | Xh | [ ] PASS [ ] FAIL |
| **Tempo de download S3** | < 10min | Xmin | [ ] PASS [ ] FAIL |
| **Checksum OK** | 100% | X/X | [ ] PASS [ ] FAIL |
| **Restore completo** | 100% tabelas | X/Y | [ ] PASS [ ] FAIL |
| **Extensões OK** | uuid-ossp, pgcrypto, vector | X/Y | [ ] PASS [ ] FAIL |
| **Smoke tests E2E** | 16/16 | X/16 | [ ] PASS [ ] FAIL |
| **Auth funcional** | sim | sim/não | [ ] PASS [ ] FAIL |
| **Storage funcional** | sim | sim/não | [ ] PASS [ ] FAIL |
| **Akasha IA funcional** | sim | sim/não | [ ] PASS [ ] FAIL |

### 3.2 Contagens de tabela (vs baseline)

| Tabela | Baseline | Pós-restore | Delta | Status |
|--------|----------|-------------|-------|--------|
| users | 1,000 | 998 | -0.2% | [ ] OK |
| posts | 5,000 | 4,990 | -0.2% | [ ] OK |
| comments | 25,000 | 24,950 | -0.2% | [ ] OK |
| articles | 200 | 200 | 0% | [ ] OK |
| subscriptions | 50 | 50 | 0% | [ ] OK |

**Nota:** Delta pequeno é esperado (registros criados entre backup e drill).

### 3.3 Checksums

```
SHA-256 do backup: <hash>
Verificação:        <OK / FAIL>
Tamanho:             X MB
Idade do backup:     X horas
```

### 3.4 Smoke tests E2E

Listar quais passaram/falharam:

- [ ] login.spec.ts — PASS
- [ ] signup.spec.ts — PASS
- [ ] post-creation.spec.ts — PASS
- [ ] feed-load.spec.ts — PASS
- [ ] akasha-chat.spec.ts — PASS
- [ ] marketplace-browse.spec.ts — PASS
- [ ] ... (16 specs total)

---

## 4. O que funcionou bem ✅

<Listar aspectos positivos do drill>

- Restore completo em Xmin (bem abaixo do target de 4h).
- Checksum bateu perfeitamente, zero corrupção.
- Smoke tests passaram 100%.
- Scripts de backup estão robustos (lidaram com DB de XGB sem problemas).
- Documentação estava atualizada e o time conseguiu seguir sem help externo.
- Comunicação Slack funcionou bem para coordenar.

---

## 5. O que não funcionou ❌

<Listar problemas, falhas, surpresas>

- Extensão `pg_trgm` não estava no backup script — não foi restaurada.
  - **Impacto:** queries que usam trigram search vão falhar.
  - **Severidade:** média.
- Tempo de download S3 foi mais lento que o esperado (Xmin vs target 10min).
  - **Causa:** throttling da AWS por múltiplos downloads paralelos.
- Smoke test "akasha-chat" intermitente (passa às vezes, falha outras).
  - **Hipótese:** OpenAI rate limit durante drill (3 simulações em paralelo).
- Script de cleanup deixou staging DB órfão em 1 caso.
  - **Causa:** race condition entre DROP DATABASE e conexões pendentes.

---

## 6. Action items

| # | Descrição | Owner | Deadline | Status |
|---|-----------|-------|----------|--------|
| 1 | Adicionar `pg_trgm` ao setup script de backup | @dev1 | 2026-09-30 | [ ] Open |
| 2 | Aumentar timeout de download S3 ou usar multipart | @dev2 | 2026-10-15 | [ ] Open |
| 3 | Investigar flake do smoke test "akasha-chat" | @dev3 | 2026-10-01 | [ ] Open |
| 4 | Adicionar retry logic ao DROP DATABASE no drill script | @dev1 | 2026-09-30 | [ ] Open |
| 5 | Documentar ordem de restore (PG → Storage → Configs → Embeddings) | @dev2 | 2026-10-15 | [ ] Open |
| 6 | Adicionar métrica "backup_age_hours" para alertar se > 24h | @dev1 | 2026-10-30 | [ ] Open |

---

## 7. Custos

| Item | Custo |
|------|-------|
| S3 data transfer (download) | $X |
| Staging DB (Supabase, 24h) | $X |
| OpenAI API (smoke tests + embeddings re-gen se aplicável) | $X |
| Tempo de engenharia (Xh × $Y/h) | $X |
| **Total** | **$X** |

---

## 8. Compliance check

- [ ] LGPD: dados pessoais em staging foram deletados após drill
- [ ] Audit log registrado em `logs/backup-access.log`
- [ ] Secrets não foram expostos em logs do drill
- [ ] Staging DB dropada (cleanup OK)

---

## 9. Próximo drill

**Data proposta:** YYYY-MM-DD (1 quarter depois)
**Tipo proposto:** [Restore test / Failover test / Full DR]
**Owner:** @nome
**Action items prioritários a validar antes do próximo drill:**

- [ ] #1 da seção anterior (extensão pg_trgm)
- [ ] #3 da seção anterior (flake do smoke test)

---

## 10. Assinaturas

| Função | Nome | Data |
|--------|------|------|
| DevOps lead | | |
| Tech lead | | |
| Coder (drill executor) | | |

---

## 11. Anexos

- [ ] Logs completos do drill: `docs/dr-drills/YYYY-QX-NN-logs.txt`
- [ ] Output do pg_restore: `docs/dr-drills/YYYY-QX-NN-pg-restore.log`
- [ ] Output dos smoke tests: `docs/dr-drills/YYYY-QX-NN-e2e.log`
- [ ] Screenshots de Sentry/PostHog/Vercel durante drill
- [ ] Métricas de custo AWS (CSV export)

---

## 12. Referências

- `docs/DISASTER-RECOVERY-W34.md` — Estratégia geral
- `docs/RESTORE-PROCEDURES.md` — Runbook de restore
- `scripts/backup/disaster-recovery-drill.sh` — Script usado
- `docs/ops/OPS-RUNBOOK.md` § 4 — Backup strategy (baseline)

---

## 13. Template reuse

Para o próximo drill, fazer cópia deste arquivo:

```bash
cp docs/DR-DRILL-REPORT-TEMPLATE.md docs/dr-drills/YYYY-QX-NN-drill-report.md
# Preencher metadata + seção 1
# Executar drill
# Preencher seções 2-13 com resultados
# Salvar logs em docs/dr-drills/YYYY-QX-NN-logs.txt
# Commitar + push
```

---

**Fim do template.** Para dúvidas, consultar `docs/DISASTER-RECOVERY-W34.md` § 17 ou abrir issue com label `ops/disaster-recovery`.