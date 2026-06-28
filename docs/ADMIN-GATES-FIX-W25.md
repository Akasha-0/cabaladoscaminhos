# ADMIN-GATES-FIX-W25 — Security Debt Cleanup

**Wave:** 25 (SECURITY FIX 3/8)
**Date:** 2026-06-28
**Author:** Coder (W25 session)
**Scope:** 2 routes com NODE_ENV-as-auth-gate + 3 routes sem try/catch canônico

---

## TL;DR

Removidos 2 NODE_ENV-gates que estavam sendo usados como auth-gate em rotas
admin. Substituídos pelo `requireAdmin()` real de `@/lib/admin/session`.
Adicionado try/catch canônico em 3 rotas para alinhar com o restante do
codebase.

**TSC:** 0 errors.
**Comportamento:** inalterado em dev (sem `ADMIN_EMAILS` configurado,
`requireAdmin` retorna `{ ok: true }` em dev).
**API contracts:** preservados (request/response shape idênticos).

---

## Rota 1 — `/api/admin/funnel-metrics` (GET)

### Antes
```ts
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Admin gate pendente' },
      { status: 403 }
    );
  }
  // ... lógica de funil ...
}
```

### Depois
```ts
export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(
        4003, // FORBIDDEN
        `Admin required (${session.reason})`,
        403
      );
    }
    // ... lógica de funil ...
  } catch (err) {
    return handleError(err);
  }
}
```

### Por que NODE_ENV gate é insuficiente
- `NODE_ENV === 'production'` é determinado pelo **deployment platform**
  (Vercel, Railway, etc), não pela identidade do caller.
- Qualquer request HTTP para o endpoint em produção recebe 403 — mas
  isso é coincidência, não segurança.
- **O vetor correto** é verificar se o user autenticado está em
  `ADMIN_EMAILS` ou tem `User.planoAssinatura === 'ADMIN'`.

### Imports adicionados
```ts
import { fail, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
```

---

## Rota 2 — `/api/flags/[name]` (PATCH)

### Antes
```ts
export async function PATCH(request, context) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return fail(403, ErrorCode.FORBIDDEN, 'Admin gate pendente...');
    }
    // ... lógica de upsert flag ...
  } catch (err) {
    return handleError(err);
  }
}
```

### Depois
```ts
export async function PATCH(request, context) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(
        ErrorCode.FORBIDDEN,
        `Admin required (${session.reason})`,
        403
      );
    }
    // ... lógica de upsert flag ...
  } catch (err) {
    return handleError(err);
  }
}
```

### Por que importa
Feature flag mutations em produção são **critical write operations**.
Um NODE_ENV gate é acidental — qualquer deploy em prod silenciosamente
bloqueia mutations legítimas; qualquer revert ou env mal configurado
**expõe mutations não-autenticadas**.

### Import adicionado
```ts
import { requireAdmin } from '@/lib/admin/session';
```

---

## Rota 3 — `/api/notifications/templates` (GET)

### Antes
```ts
import { withErrorHandler } from '@/lib/error-handling';

export const GET = withErrorHandler(async (req: NextRequest) => {
  // ... lógica de filtros ...
});
```

### Depois
```ts
export async function GET(req: NextRequest) {
  try {
    // ... lógica de filtros ...
  } catch (err) {
    return handleError(err);
  }
}
```

### Por que trocar `withErrorHandler` por try/catch explícito
- `withErrorHandler` é funcionalmente equivalente mas **esconde o error path**.
- O restante do codebase usa o padrão canônico `try { } catch (err) { return handleError(err); }`.
- Wave 24 audit flaggou como "inconsistente" — alinhamento traz clareza pro review.
- Também removido `formatTemplate` que estava importado mas nunca usado (dead import).

### Imports ajustados
```ts
import { handleError } from '@/lib/error-handling';
// (removido withErrorHandler, removido formatTemplate)
```

---

## Rota 4 — `/api/push/unsubscribe` (POST + DELETE + GET + PUT + PATCH)

### Antes
```ts
function moved() { return NextResponse.json({...}, { status: 410 }); }
export const POST = moved;
export const DELETE = moved;
export const GET = moved;
export const PUT = moved;
export const PATCH = moved;
```

### Depois
```ts
function moved() { return NextResponse.json({...}, { status: 410 }); }

export async function POST() {
  try { return moved(); } catch (err) { return handleError(err); }
}
// ... mesmo padrão para DELETE/GET/PUT/PATCH ...
```

### Por que adicionar try/catch num stub que só retorna 410
- Wave 24 audit (mecânico, grep-based) flaggou "POST sem try/catch".
- Função não tem lógica que falhe, mas o pattern é **defensivo e gratuito**.
- Alinha com o resto do codebase e elimina false positives em futuros scans.

### Import adicionado
```ts
import { handleError } from '@/lib/error-handling';
```

---

## Auditoria — outros NODE_ENV uses no `app/api`

Após o fix, **nenhuma rota admin** usa `NODE_ENV` como auth gate. Restam
usos legítimos em outros contextos:

| Path | Uso | Status |
|------|-----|--------|
| `admin/newsletter/send` | Webhook secret permissive mode (dev sem secret) | OK — não é auth gate |
| `auth/create-test`, `auth/login-form`, `auth/status` | Dev-only test routes (404 em prod) | OK |
| `auth/{logout,profile-auto-create,resend-verification,reset-password}` | Verbose logging em dev | OK |
| `cron/process-email-queue`, `cron/weekly-digest` | Webhook secret permissive mode | OK |
| `notifications/push/test` | Dev-only test endpoint (404 em prod) | OK |
| `flags/[name]` | Apenas em comentário header | OK |

Nenhuma dessas é um auth gate que precisa de `requireAdmin()`.

---

## Padrão canônico aplicado

Padrão usado em todas as 4 rotas:

```ts
import { requireAdmin } from '@/lib/admin/session';
import { fail, handleError } from '@/lib/community/api';

export async function METHOD(req) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(
        ErrorCode.FORBIDDEN,
        `Admin required (${session.reason})`,
        403
      );
    }
    // ... lógica ...
  } catch (err) {
    return handleError(err);
  }
}
```

Para rotas públicas (não-admin), o padrão é:
```ts
import { handleError } from '@/lib/error-handling';

export async function METHOD(req) {
  try {
    // ... lógica ...
  } catch (err) {
    return handleError(err);
  }
}
```

---

## Verificação

### TSC
```bash
$ cd /workspace/cabaladoscaminhos
$ timeout 90 npx tsc -p tsconfig.json --noEmit 2>&1 | grep -E "error TS" | grep -v csstype | wc -l
0
```

### Smoke estrutural (regex por arquivo)
| Arquivo | requireAdmin | try | catch | handleError | NODE_ENV prod |
|---------|--------------|-----|-------|-------------|---------------|
| `admin/funnel-metrics/route.ts` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `flags/[name]/route.ts` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `notifications/templates/route.ts` | — | ✅ | ✅ | ✅ | ❌ |
| `push/unsubscribe/route.ts` | — | ✅ | ✅ | ✅ | ❌ |

---

## Arquivos modificados

```
M  src/app/api/admin/funnel-metrics/route.ts   (NODE_ENV → requireAdmin + try/catch)
M  src/app/api/flags/[name]/route.ts            (NODE_ENV → requireAdmin)
M  src/app/api/notifications/templates/route.ts (withErrorHandler → try/catch + dead import removido)
M  src/app/api/push/unsubscribe/route.ts        (try/catch defensivo em todos métodos)
A  docs/ADMIN-GATES-FIX-W25.md                  (este doc)
```

---

## Próximos passos (W26+)

- [ ] Adicionar `requireAdmin` nos endpoints admin que estão em W23 mas ainda sem gate
- [ ] Revisar `/api/cron/*` para garantir que webhook secret é sempre obrigatório em prod (W25 não cobriu isso por estar fora do escopo do "admin gate")
- [ ] Auditar `requireViewer` consistency (algumas rotas usam `@/lib/community/auth`, outras inline Supabase)