# BUG FIXES LOOP — Wave 36

> Hotfix loop, severity matrix, patch system, and error recovery.
> Shipped: 2026-07-01 · Wave 36 / Bug Fixes 1/8.
> Owner: Coder + Ravena (QA) · Reviewer: pending (Wave 36 cycle).

---

## 1. Sumário executivo

Wave 36 introduz o **hotfix loop** end-to-end: detectar erros via Sentry,
triar via dashboard admin `/admin/bugs`, aplicar hotfixes via `patch-system`,
fazer rollback com um clique, e mostrar páginas de erro branded para o
usuário final. Tudo isso respeitando LGPD Art. 7, 18, 37 e 46, e mantendo
deploys zero-downtime no Vercel/Netlify.

**Componentes entregues:**

| Componente | Arquivo | Função |
| --- | --- | --- |
| Sentry audit script | `scripts/audit-sentry-errors.ts` | Top 20 errors / users / routes |
| Bug dashboard | `src/app/admin/bugs/page.tsx` + `BugsDashboardClient.tsx` | Triagem manual |
| Bug API | `src/app/api/admin/bugs/route.ts` + `[id]/route.ts` | CRUD admin |
| Bug store | `src/lib/bugs/bug-store.ts` | JSONL-backed (migra p/ Prisma em W37+) |
| Patch registry | `src/lib/patches/patch-registry.ts` | Single source of truth |
| Hotfix deploy | `src/lib/patches/hotfix-deploy.ts` | snapshot → apply → verify → push |
| Rollback | `src/lib/patches/rollback-strategy.ts` | git revert + forward-fix |
| Patch audit | `src/lib/patches/patch-audit.ts` | JSONL hash chain (tamper-evident) |
| Error recovery | `src/lib/errors/recovery.ts` | 5xx/404/403/429/network |
| Recovery hooks | `src/hooks/use-recovery.ts` | React wrappers |
| Error page | `src/app/error.tsx` | Branded 500 + recovery CTAs |
| Not-found page | `src/app/not-found.tsx` | (existente — Wave 12) |

---

## 2. Quando abrir um bug

**Acionadores do hotfix loop (qualquer um):**

1. Sentry fingerprint novo aparece em `audit-sentry-errors.ts --since=1h`
   com severity `error` ou `fatal`.
2. NPS feedback contém mensagem classificada como `BUG` (não feature request).
3. Relato direto de beta tester Wave 1 com repro documentado.
4. Alerta de monitoria (Vercel analytics, Supabase pooler, Stripe webhook).

**Não é bug (redirecionar):**

- Pergunta sobre uso → FAQ / suporte
- Feature request → `/admin/feedback` (tipo FEATURE)
- Conteúdo impróprio → `/admin/moderation`
- Disputa de billing → `/admin/users` (caso individual)

---

## 3. Severity matrix

| Sev | Critério | SLA | Onde entra |
| --- | --- | --- | --- |
| **P0** | crash em fluxo crítico (login, pagamento, perda de dados) | < 2h | hotfix imediato |
| **P1** | erro recuperável com workaround claro | < 24h | hotfix na wave corrente |
| **P2** | cosmetic / UX glitch em rota secundária | < 7d | próximo sprint |
| **P3** | nice-to-have / "quando der" | backlog | triage mensal |

**Definição de "fluxo crítico":** rotas em `/api/auth/*`, `/api/payments/*`,
`/api/cron/*`, e qualquer página que produza receita direta (pricing, checkout,
onboarding-pago).

---

## 4. Status state machine

```
NEW ─► INVESTIGATING ─► IN_PROGRESS ─► FIXED ─► CLOSED
                          │              │
                          └─ (se hotfix  └─ (se regressão
                             falhou)       abre novo bug)
```

**Regras de transição:**

- `NEW → INVESTIGATING`: alguém assume (campo `assignedTo`).
- `INVESTIGATING → IN_PROGRESS`: reproduzido + causa raiz identificada.
- `IN_PROGRESS → FIXED`: hotfix deployed, Sentry clean por 30min.
- `FIXED → CLOSED`: revisado em retrospectiva OU 7 dias sem regressão.
- Qualquer estado → `NEW`: regressão confirmada (reabrir + linkedPatchId).

---

## 5. Patch workflow

### 5.1. Criar patch via `hotfix-deploy.ts`

```ts
import { deployHotfix } from '@/lib/patches';

const result = await deployHotfix({
  version: '0.3.1-hotfix1',
  title: 'Fix: rate-limit reset on login retry',
  description: 'Bug-W36-001: rate-limit counter was not reset after 401 → 200.',
  severity: 'P1',
  wave: 'W36',
  branch: 'hotfix/w36-001-rate-limit',
  references: ['bug-bug-20260701-abcd', 'sentry-fp=143d245c'],
  fileChanges: {
    'src/lib/security/rate-limit-v2.ts': '... novo conteúdo ...',
  },
});
// → { ok: true, patchId, commitSha, snapshotDir, steps: [...] }
```

### 5.2. Os 5 passos do hotfix-deploy

1. **snapshot**: clone `.hotfix-snapshots/<id>/` + grava `.base-sha` (rollback point).
2. **apply**: escreve os arquivos novos + `git add` (não commit ainda).
3. **verify**: `tsc --noEmit` (subset) — aborta e reverte se quebrar.
4. **commit+push**: cria branch `hotfix/<id>`, commita, push (best-effort).
5. **register**: grava entrada em `data/patches/registry.json` com audit hash.

### 5.3. Vercel/Netlify deploy

Vercel auto-deploys on push to a tracked branch. Recomendado:

```bash
# Após hotfix-deploy.ts commitar e fazer push:
vercel deploy --prod --yes
# OU merge hotfix/<id> → main via PR review (mais conservador)
```

Para deploys self-hosted (Railway/Fly):

```bash
# symlink atomic swap
ln -sfn /releases/<sha> /app/current
systemctl restart app
```

---

## 6. Rollback strategy

### 6.1. Dois caminhos

| Estratégia | Quando usar | Mecanismo |
| --- | --- | --- |
| **GIT_REVERT** | patch isolado, sem conflito | `git revert <sha>` em branch nova |
| **FORWARD_FIX** | revert conflita (5+ hotfixes no mesmo arquivo) | nova entrada no registry supersedes a original |

### 6.2. API

```ts
import { rollback, rollbackLatest } from '@/lib/patches';

// Reverter patch específico
rollback({
  patchId: 'patch-20260701123045-abc1',
  by: 'admin-user-id',
  reason: 'Hotfix broke onboarding CTA — see Sentry fp=42f730c2',
});

// Reverter o último patch da wave
rollbackLatest('W36', 'admin-user-id', 'regressão na home');
```

### 6.3. Auto-fallback

`rollback()` tenta GIT_REVERT primeiro. Se o revert falhar com conflito,
cai automaticamente para FORWARD_FIX. O caller recebe um `RollbackResult`
com `strategy: 'FORWARD_FIX'` para auditoria.

### 6.4. Rollback safety

- `rollbackPatch(id)` no registry: marca `status='ROLLED_BACK'` mas mantém a
  entrada (audit chain preservado).
- Audit log (`patch-audit.ts`) registra evento `ROLLED_BACK` com timestamp +
  actor + reason.
- Chain hash forward: cada `audit.jsonl` entry carrega `prevHash` → qualquer
  edição retroativa quebra a verificação.

---

## 7. Error recovery matrix

| HTTP / cenário | Classe | Max retries | Backoff | UX action |
| --- | --- | --- | --- | --- |
| 500-599 | `5xx` | 3 | 500ms × 2^n + jitter | retry silencioso → toast se esgotar |
| 404 | `404` | 0 | — | redirect para `/not-found` (página branded) |
| 403 | `403` | 0 | — | redirect para `/login?from=<current>` |
| 429 | `429` | 5 | 1s × 2^n + jitter | toast "aguarde" + backoff |
| 0 / `fetch failed` | `network` | 2 | 1.5s × 2^n + jitter | banner offline + retry on reconnect |
| qualquer outro | `unknown` | 1 | 1s | toast genérico |

### 7.1. Implementação client

```tsx
import { useRetryFetch } from '@/hooks/use-recovery';

function MyComponent() {
  const { data, loading, error, plan, retry } = useRetryFetch<MyData>('/api/foo');
  if (loading) return <Spinner />;
  if (error) return (
    <ErrorState
      message={plan.strategy.userMessage}
      severity={plan.toastSeverity}
      onRetry={retry}
      redirectTo={plan.redirectTo}
    />
  );
  return <Display data={data} />;
}
```

### 7.2. Implementação server (route handler)

```ts
import { fetchWithRecovery } from '@/lib/errors/recovery';

const result = await fetchWithRecovery('https://api.supabase.co/...', init);
if (!result.ok) {
  return NextResponse.json(
    { error: { code: 5003, message: result.error } },
    { status: result.status || 502 },
  );
}
```

---

## 8. Audit script — `audit-sentry-errors.ts`

### 8.1. Uso

```bash
# Local logs (default: logs/sentry/*.jsonl)
tsx scripts/audit-sentry-errors.ts

# Janela custom (1h, 7d, etc)
tsx scripts/audit-sentry-errors.ts --since=24h
tsx scripts/audit-sentry-errors.ts --since=7d

# JSON para piping
tsx scripts/audit-sentry-errors.ts --json | jq '.topErrors[0]'

# Sentry API remoto (precisa SENTRY_AUTH_TOKEN + ORG + PROJECT)
tsx scripts/audit-sentry-errors.ts --remote --since=1h
```

### 8.2. Output sections

1. **Top 20 unique errors** — fingerprint estável, count, last_seen, severity.
2. **Top 20 affected routes** — `/api/auth/login` etc.
3. **Top 20 affected users** — hash FNV-1a (LGPD-safe), distinct error count.
4. **Top 10 common patterns** — auto-classificados em `auth_failure`,
   `validation_error`, `rate_limit`, `db_timeout`, `payment_failed`,
   `csrf_or_origin`, `rate_limit_429`, `lgpd_consent`, `ai_quota`,
   `duplicate_resource`.
5. **Actionable checklist** — ordenado por severidade com `fixHint`.

### 8.3. Custom patterns

Para adicionar um padrão novo, edite `COMMON_PATTERNS` no script:

```ts
{
  category: 'meu_erro_custom',
  match: (m, c) => /minha assinatura/i.test(m),
  fixHint: 'Investigue X.ts linha Y',
  severity: 'warning',
}
```

---

## 9. Bug tracking — `/admin/bugs`

### 9.1. Visão geral

- Cards de severidade (P0/P1/P2/P3) com count por categoria.
- Status summary: total / open / fixed-7d / median time-to-fix.
- Filtros: status + severity.
- Lista de bugs com: badges de severidade, dropdown de status (mutação
  inline), links para Sentry (quando fingerprint), patch id (quando
  associado), wave de introdução, fixVersion.

### 9.2. Criar bug manualmente

```bash
curl -X POST https://app/api/admin/bugs \
  -H 'Cookie: <admin-session>' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Onboarding CTA invisível em iOS Safari",
    "description": "Step 3 CTA é renderizado offscreen...",
    "severity": "P1",
    "sentryFingerprint": "a80713c5",
    "affectedScreens": ["/onboarding/step-3"],
    "reproducibility": "INTERMITTENT"
  }'
```

### 9.3. Atualizar bug

```bash
curl -X PATCH https://app/api/admin/bugs/<id> \
  -H 'Cookie: <admin-session>' \
  -H 'Content-Type: application/json' \
  -d '{"status": "FIXED", "fixedIn": "W36", "fixVersion": "0.3.1-hotfix1"}'
```

---

## 10. Error pages

### 10.1. `src/app/error.tsx` (500 / runtime)

Captura erros não tratados em qualquer route segment. Recursos:

- Cosmic background + ícone `AlertTriangle` (vermelho).
- Mensagem espiritual rotativa (4 citações).
- **3 CTAs**: tentar novamente (reset boundary), voltar ao início,
  reportar (mailto com fingerprint + digest pré-preenchidos).
- Locale auto-detect (`pt-BR` default, `en` se `navigator.language`).
- `captureException(error)` automático no Sentry (best-effort).
- Fingerprint hash (FNV-1a) visível para correlação com audit script.

### 10.2. `src/app/not-found.tsx` (404)

Existente desde Wave 12. Mantido como está. Recursos: cosmic background,
citações místicas, CTAs (início / voltar / explorar outros caminhos).

### 10.3. Fluxo de report

O usuário clica "Reportar" → mailto abre com subject `[Erro] <fp8>` e body
pré-preenchido com fingerprint, digest, message, e template de repro steps.
Suporte recebe → busca no Sentry por fingerprint → linked ao bug no store.

---

## 11. LGPD compliance

| Requisito | Como atendemos |
| --- | --- |
| Art. 7 (consentimento) | Bug store não armazena email/body de usuário |
| Art. 18 (direitos do titular) | Affected-user IDs são FNV-1a hashed, raw nunca exposto |
| Art. 37 (registro de operações) | `patch-audit.ts` registra cada hotfix com hash chain |
| Art. 46 (segurança técnica) | Patch registry tem `verifyAuditChain()` para detectar tampering |

**Hashing FNV-1a 32-bit:** 8 hex chars, suficiente para correlação interna
(admin pode cruzar hashes com DB admin se necessário) sem reverter para o
user id original. Sha-256 fica reservado para integridade de arquivos.

---

## 12. Zero-downtime guarantees

| Camada | Mecanismo |
| --- | --- |
| Build | Vercel gera novo bundle paralelo ao atual |
| Route | Vercel faz cutover após healthcheck do novo container |
| DB | Migrations são forward-only + Prisma `migrate deploy` é transacional |
| Cron | `cron-job.org` aponta para URL `/api/cron/*` (sem mudança) |
| Cache | CDN invalida automaticamente em deploy |

**Regra de ouro:** nunca editar migrations já aplicadas. Para correções,
criar nova migration idempotente (`IF NOT EXISTS`, `DROP COLUMN IF EXISTS`).

---

## 13. Limites conhecidos (Wave 36)

- **Bug store é JSONL**, não Prisma. Migração planejada para W37+ quando
  schema tiver model `Bug`. Workaround: `bug-store.ts` lê arquivo em cada
  request (N pequeno, latência aceitável).
- **Audit chain é per-entry FNV-1a**, não SHA-256/Merkle. Suficiente para
  detectar tampering manual, não para auditoria criptográfica formal
  (W37+ pode subir para SHA-256 + chain hash semanal).
- **Patch deploy depende de `git push` auth.** Em sandboxes sem remote
  auth, o push é silenciosamente best-effort — a entrada do registry é
  criada localmente e o caller deve sincronizar depois.
- **Hotfix-deploy não roda testes E2E.** Apenas TSC + smoke. Para patches
  P0, runner manual de Playwright é mandatório antes do deploy.

---

## 14. Métricas de sucesso

Acompanhar semanalmente:

| Métrica | Target | Como medir |
| --- | --- | --- |
| Median TTF (time-to-fix) | < 48h | `bugSummary().medianTimeToFixHours` |
| Hotfix rollback rate | < 10% | `auditSummary().ROLLED_BACK / auditSummary().APPLIED` |
| Sentry error budget | < 1% requests 5xx | Sentry dashboard + Vercel analytics |
| Audit chain integrity | 100% | `verifyChain()` retorna `[]` |
| P0 SLA (< 2h) | 100% | manual log no bug store |

---

## 15. Próximas waves

- **W37**: migrar bug store para Prisma model + adicionar BugAttachment
  (screenshots/vídeos) + integrar com Sentry webhook para auto-create bug.
- **W38**: adicionar BugComment thread + mention @admin.
- **W39**: SHA-256 audit chain + on-chain proof semanal (Polygon Amoy).
- **W40**: AI-assisted root-cause analysis (Akasha lê stack trace + sugere fix).

---

## 16. Troubleshooting

### 16.1. "Hotfix deploy falha em `tsc --noEmit`"

Rode `npx tsc --noEmit` localmente antes de chamar `deployHotfix()`. O
erro mais comum: import path errado após refactor. Corrija antes de tentar
de novo.

### 16.2. "git revert conflito"

Esperado após 5+ hotfixes no mesmo arquivo. Solução: `rollback(..., {
strategy: 'FORWARD_FIX' })` cria um patch novo supersedendo o original.

### 16.3. "Audit chain quebrado"

Rode `verifyChain()` → retorna ids quebrados. Se foi edição manual
legítima, recrie a chain com `logPatchEvent({ event: 'CHAIN_VERIFIED',
detail: 'manual reset' })` (apenas admin sênior).

### 16.4. "Bug store duplicado"

`createBug()` é idempotente por (title + sentryFingerprint). Se aparecer
duplicado, é bug — reporte. Workaround: `listBugs()` + `updateBug()` para
mesclar manualmente.

---

## 17. Glossário

- **Hotfix** = patch aplicado fora do ciclo regular de wave.
- **Forward-fix** = patch novo que supersede outro (rollback via replacement).
- **Snapshot** = estado do working tree antes do hotfix (rollback point).
- **Fingerprint** = hash estável que agrupa erros similares no Sentry.
- **Audit chain** = sequência de entradas com hash linkado, tamper-evident.
- **TTF** = time-to-fix (criação → status=FIXED).
- **Recovery class** = categoria de erro (5xx/404/403/429/network/unknown).

---

## 18. Referências internas

- `src/lib/monitoring/sentry.ts` — wrapper Sentry (Wave 11)
- `src/lib/security/rate-limit-v2.ts` — rate limiting (Wave 34)
- `src/lib/error-handling.ts` — ErrorCode enum
- `src/app/admin/feedback/page.tsx` — dashboard de feedback (Wave 33)
- `docs/A11Y-FINAL-W34.md` — padrões de acessibilidade
- `docs/SECURITY-HARDENING-W34.md` — hardening 6/8
- `docs/BETA-LAUNCH-STRATEGY-W32.md` — estratégia beta (origem do loop)

---

## 19. Checklist do dev (PR template)

```markdown
## Bug fix PR — Wave 36

- [ ] Bug linked (id ou Sentry fingerprint)
- [ ] Severity atribuída (P0/P1/P2/P3)
- [ ] Repro steps documentados
- [ ] Test added (unit ou e2e)
- [ ] TSC passa local
- [ ] Sentry fingerprint estável
- [ ] LGPD-safe (sem PII em logs)
- [ ] Rollback testado (GIT_REVERT ou FORWARD_FIX)
- [ ] Audit event logado (`logPatchEvent`)
- [ ] Bug store atualizado (`updateBug({ status: 'FIXED', fixVersion, patchId })`)
```

---

## 20. Contatos

- **Owner do wave:** Coder (este agente) + Ravena (QA)
- **Reviewer:** Wave 36 cycle lead
- **On-call:** pager rotation no `#akasha-ops`
- **DPO:** LGPD Art. 18 requests → `dpo@cabaladoscaminhos.app`

---

*Fim do documento. Wave 36 / Bug Fixes 1/8.*