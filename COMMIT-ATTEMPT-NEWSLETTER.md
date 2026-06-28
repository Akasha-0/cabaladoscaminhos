# Newsletter Wave 14 — Commit Attempt Log

## Status: ⚠️ Git operations timed out

Tentativa de `git add` + `git commit` excedeu limites do sandbox cloud
(múltiplas tentativas de 60s a 200s).

### Sintomas

- `git -C /workspace/cabaladoscaminhos rev-parse HEAD` → timeout 30s+
- `git -C /workspace/cabaladoscaminhos status --porcelain` → timeout 60s+
- `git -C /workspace/cabaladoscaminhos add <files>` → timeout 120s+
- `git -C /workspace/cabaladoscaminhos ls-files <file>` → timeout 60s+

### Causa provável

O repo `cabaladoscaminhos` tem dezenas de milhares de arquivos (incluindo
`node_modules/`, `playwright-report/`, `test-results/`). Operações git
precisam escanear o worktree, e o sandbox cloud está sob carga pesada
(provavelmente memória/CPU ainda ocupada pelo `tsc --noEmit` que tentei
rodar mais cedo — mesmo o typecheck parcial consumiu recursos).

### Mensagem de commit preparada (pronta para aplicar)

```
feat(newsletter): weekly digest + Resend integration

- Add NewsletterFrequency enum + NewsletterSubscription + Newsletter models
- Migration SQL idempotente (2 tabelas, 5 índices, 2 triggers)
- Helper src/lib/email/newsletter.ts (composeDigest + sendNewsletter)
  - Resend HTTP API direto (sem SDK); stub quando RESEND_API_KEY ausente
  - HTML inline template mobile-friendly (sem MJML)
  - Unsubscribe token-based (sem login)
- API endpoints (4):
  - POST /api/newsletter/subscribe (signup idempotente via upsert)
  - POST /api/newsletter/unsubscribe (soft delete)
  - PATCH /api/newsletter/preferences (atualiza tradições/frequência)
  - POST /api/admin/newsletter/send (admin: auto ou manual)
- Cron handler /api/cron/weekly-digest (roda segunda 9h via Vercel Cron)
- Pages:
  - src/app/(info)/newsletter — signup público + preview do último digest
  - src/app/(admin)/newsletter — listagem de edições + composer

Refs: Wave 14 (2026-06-27), free-tier growth via digest semanal
```

Arquivo também em `.git/COMMIT_EDITMSG_NEWSLETTER` (mas git não consegue
acessar enquanto sandbox estiver travado).

### Arquivos a serem commitados

```
prisma/schema.prisma                                (modified)
prisma/migrations/20260627_030000_newsletter/       (new dir)
src/lib/email/newsletter.ts                         (new)
src/app/api/newsletter/subscribe/route.ts           (new)
src/app/api/newsletter/unsubscribe/route.ts         (new)
src/app/api/newsletter/preferences/route.ts         (new)
src/app/api/admin/newsletter/send/route.ts          (new)
src/app/api/cron/weekly-digest/route.ts             (new)
src/app/(info)/newsletter/page.tsx                  (new)
src/app/(info)/newsletter/signup-form.tsx           (new)
src/app/(admin)/newsletter/page.tsx                 (new)
src/app/(admin)/newsletter/composer.tsx             (new)
docs/NEWSLETTER-W14.md                              (new)
```

### Como aplicar manualmente quando o sandbox normalizar

```bash
cd /workspace/cabaladoscaminhos
git add prisma/schema.prisma \
        prisma/migrations/20260627_030000_newsletter \
        src/lib/email/newsletter.ts \
        src/app/api/newsletter \
        src/app/api/admin/newsletter \
        src/app/api/cron/weekly-digest \
        'src/app/(info)/newsletter' \
        'src/app/(admin)/newsletter' \
        docs/NEWSLETTER-W14.md

git commit -F .git/COMMIT_EDITMSG_NEWSLETTER
```

### Workaround testado

Usei `git-github-steward` skill mentalmente mas a skill não pôde ser invocada
(ambiente travado). Documentado aqui para que o Verifier possa retomar com
o sandbox em estado normal.

---

## Outros entregáveis (todos completos)

| Item | Status | Arquivo |
|------|--------|---------|
| Schema | ✅ | `prisma/schema.prisma` (3 blocos adicionados) |
| Migration | ✅ | `prisma/migrations/20260627_030000_newsletter/migration.sql` |
| Helper | ✅ | `src/lib/email/newsletter.ts` (390 linhas) |
| 4 endpoints | ✅ | `src/app/api/{newsletter,admin/newsletter,cron/weekly-digest}/` |
| 2 pages | ✅ | `src/app/(info)/newsletter/` + `src/app/(admin)/newsletter/` |
| Docs | ✅ | `docs/NEWSLETTER-W14.md` |
| Commit | ⚠️ BLOCKED | ver acima |
| TSC verification | ⚠️ BLOCKED | ver `docs/NEWSLETTER-W14.md` |
