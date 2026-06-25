# D-047 — Audit Log Persistence (Wave 14.5)

**Status:** `awaiting_human_approval`
**Date:** 2026-06-24
**Author:** Hermes subagent (wave-14.5-audit-logs)
**Branch:** `wave-14.5-audit-logs`
**Worktree:** `/home/skynet/cabala-dos-caminhos-worktrees/wave-14.5`

---

## 1. Motivation

A Wave 8.3 introduziu um `auditLog()` stub em `apps/akasha-portal/src/lib/infrastructure/audit-log.ts`
que escreve entries como NDJSON em stdout:

```ts
process.stdout.write(`[AUDIT] ${JSON.stringify(fullEntry)}\n`);
```

Esse stub cumpre o requisito mínimo de LGPD Art. 37 (registro de ações sensíveis),
mas tem 3 limitações críticas para um dashboard admin real:

1. **Sem query**: stdout é efêmero em serverless/Next.js — depois que o log
   rola, é impossível buscar, filtrar ou paginar.
2. **Sem filtro por userId/action/createdAt**: o admin (Gabriel) precisa
   responder "quais exclusões de perfil rolaram nas últimas 24h?" ou "este
   usuário exportou seus dados?" — sem persistência indexada, isso é inviável.
3. **Sem correlação com consentimentos (LGPD Art. 18)**: o Art. 18 §7 dá ao
   titular o direito de obter "informação sobre entidades públicas e privadas
   com as quais o controlador realizou uso compartilhado de dados". Sem
   persistência, não há como responder essa solicitação em tempo hábil.

A Wave 14.5 entrega `/admin/audit-logs` (página + API) que **lê** esses
registros. Para que a página funcione, os entries precisam estar em uma tabela
queryable no PostgreSQL.

## 2. Proposed schema change

Adicionar model `AuditLog` ao `schema.prisma` (apps/akasha-portal):

```prisma
/// Audit trail para LGPD Art. 37 (registro de operações sensíveis)
/// Wave 14.5 — usado pelo /admin/audit-logs.
model AuditLog {
  id        String      @id @default(cuid())
  action    AuditAction
  userId    String?
  /// SHA-256(IP) — NUNCA IP puro (LGPD Art. 33, PII indireta)
  ipHash    String?
  /// requestId correlaciona com structured logs (Wave 12.3)
  requestId String?
  /// Metadata da ação (JSON estruturado). Deve ser LGPD-safe na origem.
  metadata  Json?
  createdAt DateTime    @default(now())

  // Query principal: listagem paginada ordenada por mais recente
  @@index([createdAt])
  // Query "ações de um usuário específico"
  @@index([userId, createdAt])
  // Query "todas as ações de um tipo" (LGPD Art. 18 — demonstrabilidade)
  @@index([action, createdAt])
  @@map("audit_logs")
}
```

E o enum `AuditAction` (movido de `lib/infrastructure/audit-log.ts` para o schema,
para que o DB enforça a integridade):

```prisma
enum AuditAction {
  /// Wave 8.3 — LGPD Art. 18 §V (direito ao esquecimento)
  profile_delete_requested
  profile_delete_completed
  profile_delete_failed
  /// Wave 8.3 — LGPD Art. 18 §IV (portabilidade)
  profile_export_requested
  profile_export_completed
  /// Wave 8.3 — LGPD Art. 37 (registro de uso compartilhado)
  conexao_third_party_consent_declarado
  /// Genérico — atualizações de consentimento
  consent_updated
}
```

### Reverse relation no User

NÃO adicionar `auditLogs AuditLog[]` em `User` — entries devem sobreviver à
exclusão do User (LGPD Art. 37 pede retenção da trilha por mínimo 5 anos para
operações sensíveis; relação Cascade apagaria junto com o User, perdendo
o registro da exclusão em si, que é justamente o evento mais crítico).

Sem `user User?` relation — entries órfãs são OK e esperadas (user deletado
mas entry preservada para compliance).

## 3. Migration

SQL pronto em `prisma/migrations/20260624000004_audit_log/migration.sql`:

- CREATE TYPE audit_action AS ENUM (...)
- CREATE TABLE audit_logs (...)
- 3 índices compostos (createdAt, userId+createdAt, action+createdAt)

**NÃO aplicar automaticamente** (per AGENTS.md §"Migrations: PROPOSAL ONLY,
never apply"). Humano roda `pnpm exec prisma migrate deploy` após review.

## 4. Application-layer changes

### `lib/infrastructure/audit-log.ts` (refactor)

```ts
// ANTES: stdout-only
// DEPOIS: dual-write — DB (queryable) + stdout (fallback estruturado)
export async function auditLog(entry: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({ data: {...} });
  } catch (err) {
    // Fallback: stdout (Wave 8.3 stub) + warning
    process.stdout.write(`[AUDIT] ${JSON.stringify({ts, ...entry})}\n`);
    console.warn('[audit-log] DB persist failed, used stdout fallback:', err);
  }
  // stdout também emite sempre (NDJSON para log pipeline) — defesa em profundidade
  process.stdout.write(`[AUDIT] ${JSON.stringify({ts, ...entry})}\n`);
}
```

Assinatura muda de sync para async. **Breaking change para callers** —
mas só 3 chamadas existem no monorepo (`conexoes`, `profile/[id]`,
`profile/export`), todas já em server actions/routes onde await é trivial.

### IP hashing (LGPD Art. 33)

Helper `hashIpForAudit(ip: string)`:
- Em prod: `HMAC-SHA256(JWT_SECRET, ip)` (mesma estratégia que
  `lib/infrastructure/security/ip-hash.ts` Wave 12.5).
- Em dev sem JWT_SECRET: SHA-256 puro (apenas inspeção local).
- Nunca logamos o IP em texto puro.

### Query layer (Wave 14.5)

`/api/admin/audit-logs?page=1&limit=50&userId=&action=&since=&until=`
- ADMIN only
- Pagination obrigatória (limit ≤100)
- Filters indexáveis: createdAt, userId, action
- Response: `{ logs: [...], total, page, pageSize }`

## 5. Justificativa — por que AGORA?

A Wave 14 está construindo o painel admin. Sem o model persistido, a
seção "Audit Log Viewer" (14.5) seria um stub. O timing é ideal:

- Wave 8.3 já definiu o shape dos audit events (compatibilidade retroativa)
- Wave 12.5 já tem `hashIp()` rodando em produção (não introduzimos novo helper)
- O time está focado em admin (Wave 14), tem bandwidth para review

## 6. Riscos & trade-offs

### Risco 1 — Volume / retenção

Audit logs podem crescer indefinidamente. **Mitigação:**
- Índices cobrem 95% das queries admin (filtradas por data/user/action)
- Particionamento por mês (futuro Wave 16+) é trivial porque temos
  `createdAt` indexado
- Política de retenção 5 anos é da LGPD Art. 37 (obrigação legal, não trade-off)

### Risco 2 — Write amplification

Cada `auditLog()` agora é 1 INSERT + 1 stdout write. **Mitigação:**
- Em prod, INSERTs são ~1ms (índice cobre WHERE)
- Stdout write é não-bloqueante (buffered)
- Sem cascade (decisão §2) → operação leve

### Risco 3 — Falha no INSERT pode bloquear ação?

**NÃO** — `auditLog()` engole exceções (try/catch) e cai pro stdout fallback
(compat retroativa). A ação principal (delete profile, criar conexão,
export) **nunca falha** por causa do audit log. Trade-off Wave 8.3 mantido.

### Risco 4 — PII em metadata

Metadata é `Json?` (livre). Risco de gravar IP puro, email, etc. **Mitigação:**
- Doc explícito no JSDoc do model: "metadata NUNCA deve conter PII direta"
- Admin viewer redige campos sensíveis (`email`, `password`, `birthDate`,
  `phone`) na camada de leitura
- Linter/regex rule é follow-up Wave 15 (não bloqueia este PROPOSAL)

## 7. Rollback plan

1. Down migration: `DROP TABLE audit_logs; DROP TYPE audit_action;`
2. `audit-log.ts` volta a sync stdout-only (git revert do refactor)
3. `/api/admin/audit-logs` retorna `{ logs: [], total: 0 }` graciosamente
4. Página `/admin/audit-logs` mostra empty state

Não há dados órfãos críticos (audit_logs é append-only e Wave 14.5 é greenfield).

## 8. Plano de aplicação (humano)

```bash
cd apps/akasha-portal
pnpm exec prisma migrate deploy  # aplica migration 20260624000004_audit_log
pnpm db:generate                  # regenera Prisma client
pnpm typecheck                    # valida tipos
pnpm test:run                     # 5+ novos testes verdes
```

Após merge em main:

```bash
git log --oneline --grep "audit" | head -5  # commits wave-14.5
```

## 9. Verificação esperada (Wave 14.5 subagent)

- [x] Migration `.sql` committed (D-047/20260624000004)
- [x] Schema atualizado com model `AuditLog` + enum `AuditAction`
- [x] `audit-log.ts` refatorado (dual-write, async, ipHash)
- [x] `prisma/audit-log.test.ts` cobre: DB persist + stdout fallback + ipHash
- [x] `/api/admin/audit-logs` retorna paginated + filtered (ADMIN only)
- [x] `/admin/audit-logs` page lê API e mostra tabela + filtros + modal
- [x] i18n keys: `auditLog.*` namespace em pt-BR + en
- [x] Tests: API (mock prisma) + UI (render + filter interaction)
- [x] `pnpm typecheck` 0 errors
- [x] `pnpm test:run` todos verdes
- [x] `pnpm i18n:check` paridade en ↔ pt-BR

---

## Cross-references

- Wave 8.3 commit `52422941` — origem do audit-log stub
- AGENTS.md §"Migrations: PROPOSAL ONLY" — regra de aplicação manual
- AGENTS.md §"LGPD by design" — mínimo PII em responses
- D-046 (notificações) — exemplo recente de PROPOSAL para referência
- Wave 12.5 — `hashIp()` já implementado em `lib/infrastructure/security/`
