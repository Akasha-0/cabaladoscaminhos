# Cycle 506 — Gaps Resolution (Fases 53-55 Follow-up)

**Date:** 2026-06-04
**Quality Score:** 91.8% → **91.9%** (2 gaps resolved)
**Type:** Bug Fix + Performance
**Branch:** `claude/docs-refactor-alignment-FOUqN`

---

## Objetivo

Resolver os 3 gaps não-bloqueantes encontrados na Validação Multi-Agente (Fase 55).

---

## Gaps Analisados

| Gap | Severidade | Status | Decisão |
|-----|-----------|--------|---------|
| CM-01 | **MEDIUM** | ✅ Resolvido | Casa 5 Kabalah extractionKey: `['destiny']` → `['expression']` |
| S6 | **LOW** | ✅ Resolvido | Leitura: adicionou `@@index([clientId])` + `@@index([operatorId])` |
| A2 | **LOW** | ⏸️ Adiado | CasaData nested vs flat — impacto ambíguo sem contexto adicional |

---

## CM-01 — Casa 5 Kabalah extractionKey

### Problema
Doc 06 §3.1 (tabela de especificações, linha 454) define para a Casa 5:
```
kabalah: { aspects: ["Número de Destino"], extractionKeys: ["expression"] }
```
O código em `src/lib/ai/correlation-map.ts:139` tinha:
```
kabalah: { aspects: ['Número de Destino'], extractionKeys: ['destiny'] }
```

### Análise
- Campo `aspects` = label descritivo (não usado na extração)
- Campo `extractionKeys` = dot-path usado para extrair dados do KabalisticMap JSON
- **Racional no código**: "O destino físico, a resistência corporal e a saúde como destino"
- Em Numerologia Cabalística Pitagórica: `expression` = como o número se expressa no mundo físico; `destiny` = caminho de vida composto
- Para "saúde como destino" → `expression` é semanticamente correto (expressão física do número)

### Ação
Corrigido `correlation-map.ts` linha 139: `extractionKeys: ['destiny']` → `extractionKeys: ['expression']`

### Verificação
- `npx tsc --noEmit` → 0 erros ✅
- `npm run test:run` → 220 passed, 8716 tests passed ✅
- Não quebrou nenhum teste existente (não há teste específico para extractionKeys de Casa 5)

---

## S6 — Índices em Reading

### Problema
O modelo `Reading` em `prisma/schema.prisma:298-322` tinha `clientId` e `operatorId` como campos, mas sem índices explícitos. Sem índices, queries que filtram por `clientId` ou `operatorId` fazem full table scan.

### Análise
Padrão existente verificado em outros modelos:
- `OperatorSession`: `@@index([operatorId])`, `@@index([operatorId, type])` ✅
- `PasswordResetToken`: `@@index([operatorId])` ✅
- `SecurityEvent`: `@@index([operatorId])` ✅
- `Reading`: **sem índices** → gap S6

### Ação
Adicionados em `prisma/schema.prisma:321-322`:
```prisma
@@index([clientId])
@@index([operatorId])
```

Criada migração `20260604000000_add_reading_indexes/migration.sql`:
```sql
CREATE INDEX "readings_client_id_idx" ON "readings" ("clientId");
CREATE INDEX "readings_operator_id_idx" ON "readings" ("operatorId");
```

### Verificação
- `npx prisma validate` → schema válido ✅
- `npx tsc --noEmit` → 0 erros ✅
- `npm run test:run` → 220 passed, 8716 tests passed ✅

> ⚠️ Nota: `prisma migrate dev` falha no shadow DB devido a conflito pré-existente na migration `20260602170000_rename_userrole_to_operatorrole`. A migração foi criada manualmente. Em produção, aplicar via `prisma migrate deploy`.

---

## A2 — CasaData Nested vs Flat Format

### Status: Adiado
- Severidade: **LOW**
- Impacto: Indefinido sem análise mais profunda de todos os callers de `CasaData`
- Não há teste que falhe por causa deste gap
- Adiando para próxima fase de evolução

---

## Commits

| Commit | Hash | Descrição |
|--------|------|-----------|
| Inicial | `c2f8aab3` | fix(layout): remove SupabaseProvider (AD-17.6) |
| B2C | `c456b8e0` | feat(cleanup): B2C legacy removal (AD-17.4) |
| Docs | `d9e82657` | docs: add cycle-504 B2C removal documentation |
| Validação | `23effc47` | Fase 55 — Validation complete: 4/4 agents PASS |
| Gaps | `e66e9865` | fix: CM-01 Casa 5 Kabalah extractionKey + S6 Reading indexes |

---

## Métricas Finais

| Métrica | Antes | Depois |
|---------|-------|--------|
| Quality Score | 91.8% | 91.9% |
| TypeScript Errors | 0 | 0 |
| Test Files | 220 passed | 220 passed |
| Tests | 8716 passed | 8716 passed |
| Gaps Resolved | 0/3 | 2/3 |

---

## PR Status

**URL:** https://github.com/Akasha-0/cabaladoscaminhos/pull/1
**Branch:** `claude/docs-refactor-alignment-FOUqN`
**Base:** `main`
**State:** Open (5 commits ahead)

---

*Lições: gaps MEDIUM sempre resolver. Gaps LOW: resolver se o custo é trivial (1-2 linhas + 1 commit) e o padrão já existe no codebase.*
