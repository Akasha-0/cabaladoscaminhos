# Migration Proposal — Focus: Auth Security Hardening

**Status**: PROPOSAL (não aplicar sem aprovação)
**Criado**: 2026-06-20
**PR**: `feat(schema): D-178 — proposal (awaiting approval)`

---

## Resumo

Adição de campos para auditoria de segurança e controle de senha no modelo `User`:
1. `lastPasswordChangedAt` — rastreia quando a senha foi alterada pela última vez.
2. `lastLoginAt` — rastreia o último acesso do usuário.

---

## Mudança 1 — `User.lastPasswordChangedAt` e `User.lastLoginAt`

### Diff do schema

```diff
model User {
  # ...
  passwordHash  String?
  name          String
+ lastPasswordChangedAt DateTime @default(now())
+ lastLoginAt           DateTime?
  locale        String   @default("pt-BR")
  # ...
}
```

### Justificativa

- **Segurança**: Permite implementar políticas de rotação de senha ou expiração forçada no futuro (ex: exigir troca se `lastPasswordChangedAt` > 90 dias).
- **Auditoria**: `lastLoginAt` é essencial para identificar contas inativas que podem ser alvos de ataques de credenciais (conta esquecida mas válida).
- **Risco**: Zero. Campos são `DateTime` (com default `now()`) ou `nullable`, não afetam queries existentes.
- **Rollback**: `DROP COLUMN` correspondente.

---

## Plano de aplicação

```bash
# 1. Gerar migration
cd apps/akasha-portal
pnpm exec prisma migrate dev --name add_auth_audit_fields

# 2. SQL gerado (exemplo)
# ALTER TABLE "akasha_users" ADD COLUMN "lastPasswordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
# ALTER TABLE "akasha_users" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

# 3. Aplicar e commitar (após aprovação)
```

---

## Verificação

```bash
pnpm --filter akasha-portal typecheck   # ✅ deve passar
pnpm --filter akasha-portal test:run   # ✅ suite deve passar
pnpm exec prisma validate               # ✅ schema válido
```
