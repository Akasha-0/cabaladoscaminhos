# Troubleshooting — Akasha Portal

> **Versão:** 1.0 | **Atualizado:** 2026-06-27 | **Wave:** 11 (Docs Governance)
>
> Erros comuns de **build / runtime / deploy** com causa raiz + solução + link pro runbook quando aplicável.

---

## Índice

- [Build (TypeScript / ESLint / Next)](#build)
- [Runtime — Auth (Supabase)](#runtime--auth-supabase)
- [Runtime — Prisma / DB](#runtime--prisma--db)
- [Runtime — Akasha IA (OpenAI)](#runtime--akasha-ia-openai)
- [Runtime — Vercel / Serverless](#runtime--vercel--serverless)
- [Deploy — Supabase](#deploy--supabase)
- [Deploy — Vercel](#deploy--vercel)
- [Local dev — gotchas](#local-dev--gotchas)

---

## Build

### ❌ `Type error: Cannot find module '@/...'`

```
error TS2307: Cannot find module '@/lib/...' or its corresponding type declarations.
```

**Causa:** `@/*` path alias não configurado em `tsconfig.json` ou falta `pnpm install`.

**Solução:**

```bash
# Verificar tsconfig.json deve ter:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# Reinstalar
rm -rf node_modules .next
pnpm install
```

---

### ❌ `PrismaClient is unable to be generated`

```
Error: @prisma/client did not initialize yet. Please run "prisma generate"
```

**Causa:** Build do Vercel rodou `next build` antes de `prisma generate`.

**Solução:**

`vercel.json` deve ter:

```json
"buildCommand": "pnpm db:generate && pnpm build"
```

Já está configurado no projeto — se mudou, voltar. Ver [Runbook 01 §buildCommand](./runbooks/01-deploy.md).

---

### ❌ `Module not found: Can't resolve 'fs' / 'node:crypto'`

```
Module not found: Can't resolve 'node:crypto'
```

**Causa:** usando Node API em Edge Runtime, ou tentando importar server-only em client.

**Solução:**

```typescript
// ❌ Errado (em client component)
import fs from 'node:fs';

// ✅ Certo: mover pra server-side
// src/lib/parsers/file.ts (server-only)
import fs from 'node:fs';
export async function readFile() { /* ... */ }

// src/components/MyComponent.tsx (client)
'use client';
import { readFile } from '@/lib/parsers/file';  // server action
```

Se for API route, garantir `export const runtime = 'nodejs';` (não Edge).

---

### ❌ ESLint error: `'X' is defined but never used`

```
error  '@typescript-eslint/no-unused-vars'  no-unused-vars
```

**Solução:**

```bash
# Auto-fix onde possível
pnpm lint --fix

# Se for import de tipo, prefixar com underscore
import { type UnusedType } from '@/lib/...';
```

---

### ❌ `Out of memory` durante build (Vercel)

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Causa:** projeto grande + `next build` sem limite de memory.

**Solução:**

`vercel.json`:

```json
"build": {
  "env": {
    "NODE_OPTIONS": "--max-old-space-size=4096"
  }
}
```

Já configurado. Se persistir, ver [Runbook 03 §Vercel](./runbooks/03-scaling.md).

---

## Runtime — Auth (Supabase)

### ❌ `Auth session missing!` em server action

```
Error: Auth session missing!
    at supabase.auth.getSession
```

**Causa:** server action chamada sem cookies do Supabase no contexto.

**Solução:**

```typescript
// ❌ Errado
import { createClient } from '@/lib/supabase/server';
const supabase = createClient();
const { data } = await supabase.auth.getUser();

// ✅ Certo: criar cliente a partir de cookies da request
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function myServerAction() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => cookies.forEach(c => cookieStore.set(c.name, c.value, c.options)),
      },
    }
  );
  const { data } = await supabase.auth.getUser();
}
```

---

### ❌ Login retorna 401 com "Invalid login credentials"

**Causa:** email não confirmado, senha errada, ou usuário não existe.

**Debug:**

```bash
# Verificar se usuário existe (Supabase SQL Editor)
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'user@example.com';

# Se email_confirmed_at é NULL: confirmar manualmente
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'user@example.com';
```

**Solução real:** corrigir fluxo de signup (enviar email de confirmação) ou orientar usuário a confirmar.

---

### ❌ `supabase.auth.signOut()` não desloga (bug wave 10 F2)

**Sintoma:** cookie some mas JWT continua válido.

**Causa:** implementação antiga só deletava cookie `cabala_auth` que nunca foi definido.

**Solução:** usar a versão corrigida em `src/app/api/auth/logout/route.ts` (já chama `supabase.auth.signOut()` server-side). Ver [Runbook 02 §Auth quebrado](./runbooks/02-incident-response.md#-login-quebrado-401-em-todas-tentativas).

---

## Runtime — Prisma / DB

### ❌ `PrismaClientInitializationError: Can't reach database server`

```
Error: P1001: Can't reach database server at `localhost:5432`
```

**Causa:** DATABASE_URL errada, Supabase offline, ou connection pooler mal configurado.

**Solução:**

```bash
# 1. Testar conexão direta
psql "$DATABASE_URL" -c "SELECT 1;"

# 2. Se erro de DNS: verificar URL
echo $DATABASE_URL
# Formato Supabase pooler: postgres://postgres.[ref]:[pwd]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# 3. Se erro de SSL: adicionar ?sslmode=require
DATABASE_URL="postgres://...?sslmode=require"
```

Ver [Runbook 02 §5xx em massa](./runbooks/02-incident-response.md#-5xx-em-massa-no-apiposts).

---

### ❌ `PrismaClientKnownRequestError: Invalid \`prisma.x.create()\` invocation`

**Causa comum:** violação de constraint UNIQUE ou FK.

**Debug:**

```bash
# Ver detalhes do erro
const error = e as PrismaClientKnownRequestError;
console.log({
  code: error.code,           // P2002 = unique violation, P2003 = FK violation
  meta: error.meta,           // campo duplicado, etc
});
```

**Solução:** adicionar validação antes (Zod) + tratar `P2002` retornando 409.

---

### ❌ Conexões Supabase esgotadas (`Too many connections`)

**Causa:** serverless functions criando conexão direta (porta 5432) em vez de pooler (6543).

**Solução:**

```bash
# Trocar porta 5432 → 6543 em DATABASE_URL
# Antes (errado): postgres://...:5432/postgres
# Depois (certo):  postgres://...:6543/postgres (com .pooler. no host)
```

Limite: free = 15 conexões, Pro = 60+. Ver [Runbook 03 §Supabase](./runbooks/03-scaling.md#camada-3--supabase-db--auth).

---

## Runtime — Akasha IA (OpenAI)

### ❌ `OpenAI 429: Rate limit exceeded`

**Causa:** muitas chamadas em pouco tempo.

**Solução (já implementado):**

- Circuit breaker em `src/lib/ai/openai.ts` — abre após 5 falhas
- Rate limit de 30 msgs/min por usuário
- Retry com backoff exponencial

Se persistir em prod: [Runbook 03 §OpenAI](./runbooks/03-scaling.md#camada-4--openai-akasha-ia).

---

### ❌ `OpenAI 401: Incorrect API key`

**Causa:** `OPENAI_API_KEY` rotacionada ou revogada.

**Solução:**

```bash
# 1. Testar chave direto
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 2. Se 401: rotacionar em platform.openai.com/api-keys

# 3. Atualizar Vercel
vercel env rm OPENAI_API_KEY production
vercel env add OPENAI_API_KEY production  # nova chave

# 4. Redeploy
```

---

### ❌ `Circuit breaker is OPEN` (erro custom 503)

**Causa:** circuit breaker abriu após 5 falhas consecutivas em 60s.

**Solução:**

1. Esperar 30s (auto-reset)
2. Verificar OpenAI status: [status.openai.com](https://status.openai.com)
3. Se chave OK e OpenAI OK: pode ser problema de rede Vercel → esperar

```typescript
// Forçar reset (em dev)
import { resetCircuitBreaker } from '@/lib/ai/openai';
resetCircuitBreaker();
```

---

### ❌ Resposta da Akasha vazia ou "truncada"

**Causa:** atingiu `max_tokens` (default 1000). Aumentar em `src/lib/ai/openai.ts`:

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  max_tokens: 2000,  // ← era 1000
  // ...
});
```

---

## Runtime — Vercel / Serverless

### ❌ `FUNCTION_INVOCATION_TIMEOUT`

**Causa:** função excedeu o timeout (default 10s no Hobby, 60s no Pro para funções padrão, 300s para Pro com `maxDuration`).

**Solução:**

```typescript
// src/app/api/akashic/chat/route.ts
export const maxDuration = 60; // 60s para chamadas LLM
export const runtime = 'nodejs';
```

Ou quebrar operação em chunks (background job).

---

### ❌ Cold start lento (> 2s na primeira request)

**Causa:** função serverless fica inativa e precisa reiniciar.

**Solução:**

- Vercel Pro tem "Fluid Compute" que reduz cold starts
- Para rotas críticas: usar [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions) (mas atenção às limitações)
- Cron job dummy a cada 5min (`vercel cron`) para manter quente (não recomendado em prod, só dev)

---

### ❌ `EROFS: read-only file system` ao tentar escrever arquivo

**Causa:** Vercel functions são read-only. Não dá pra escrever em disco.

**Solução:** usar `/tmp` (writable mas efêmero) ou Storage externo:

```typescript
// ❌ Errado
import fs from 'fs';
fs.writeFileSync('./data.json', JSON.stringify(data));

// ✅ Certo: Storage (S3, Supabase Storage, Vercel Blob)
import { put } from '@vercel/blob';
await put('data.json', JSON.stringify(data), { access: 'public' });
```

> Nota: `/api/waitlist` escreve em `data/waitlist.json` — funciona local mas **NÃO funciona em Vercel**. Ver roadmap em `docs/VALIDACAO-LANDING.md` (migrar para Supabase).

---

## Deploy — Supabase

### ❌ `permission denied for schema public` ao rodar migration

**Causa:** usuário do `DATABASE_URL` não tem permissão CREATE.

**Solução:**

```bash
# Usar service-role ou postgres user (não anon key!)
DATABASE_URL="postgres://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
#                                                                                ^^^^^^^^^^^^^
#                                                                                NÃO usar 5432 direta em prod
```

---

### ❌ Migration travou em `ALTER TABLE` (lock)

**Causa:** tabela grande + lock de longa duração.

**Solução (preventiva):**

- Usar `CONCURRENTLY` para índices
- Adicionar coluna nullable primeiro, popular, depois NOT NULL
- Em último caso: rodar em janela de manutenção com aviso

Ver [Runbook 04 §quando dá errado](./runbooks/04-database-migration.md#quando-a-migration-dá-errado-em-prod).

---

### ❌ RLS bloqueia query legítima

```
Error: new row violates row-level security policy for table "Post"
```

**Causa:** Row-Level Security ativa mas policy não permite a operação.

**Debug:**

```sql
-- Ver policies ativas
SELECT * FROM pg_policies WHERE tablename = 'Post';

-- Testar com service-role (bypassa RLS)
SET ROLE service_role;
INSERT INTO "Post" (...);  -- funciona?
```

**Solução:** adicionar/adjust policy em `prisma/migrations/`:

```sql
CREATE POLICY "Users can create posts in their groups"
  ON "Post" FOR INSERT
  WITH CHECK (
    "groupId" IS NULL  -- posts pessoais
    OR EXISTS (
      SELECT 1 FROM "GroupMember"
      WHERE "groupId" = "Post"."groupId"
        AND "userId" = auth.uid()
    )
  );
```

---

## Deploy — Vercel

### ❌ Build passa local mas falha em Vercel

**Causa comum:** env vars diferentes, ou lockfile desatualizado.

**Solução:**

```bash
# 1. Comparar env vars
vercel env ls production

# 2. Forçar install fresh
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 3. Limpar cache build
vercel --force
```

---

### ❌ `Error: Cannot find module './X'` em produção mas funciona em dev

**Causa:** dynamic import com path errado, ou case-sensitive (Linux vs macOS).

**Solução:**

```typescript
// ❌ Errado (case-sensitive falha em Linux)
import { foo } from './Foo';

// ✅ Certo
import { foo } from './foo';
```

Verificar imports são case-consistent com arquivos no repo.

---

### ❌ `Error: ENOENT: no such file or directory, open '.next/...'

**Causa:** arquivo esperado em `.next/` que não foi gerado (build incompleto).

**Solução:**

```bash
# Forçar build completo
rm -rf .next
pnpm build

# Se persistir: limpar cache Vercel
vercel --force
```

---

### ❌ Preview deploy lento (> 10min)

**Causa:** projeto grande + cold install + build completo.

**Solução:**

- Vercel Pro tem "Build cache" persistente (acelera em 70%)
- Marcar `.next/cache` em `.vercelignore` se quiser ignorar
- Separar deps de dev/prod em `package.json` corretamente

---

## Local dev — gotchas

### ❌ `Error: supabaseUrl is required` em dev

**Causa:** `.env.local` não criado ou vars faltando.

**Solução:**

```bash
cp .env.example .env.local
# Editar com valores reais (Supabase local ou cloud free tier)
```

---

### ❌ Prisma Client desatualizado após mudar schema

**Sintoma:** TS error tipo "property X does not exist on type Y".

**Solução:**

```bash
pnpm db:generate
# Reiniciar TS server no editor: Cmd+Shift+P → "Restart TS Server"
```

---

### ❌ `Error: listen EADDRINUSE :::3000`

**Causa:** porta 3000 ocupada.

**Solução:**

```bash
# Ver quem está usando
lsof -i :3000

# Matar
kill -9 <PID>

# Ou rodar em outra porta
pnpm dev -- --port 3001
```

---

### ❌ Tests Vitest falhando com `cannot find module`

**Causa:** mocks não configurados ou `__mocks__` faltando.

**Solução:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
  },
});

// vitest.setup.ts
import { vi } from 'vitest';
vi.mock('@/lib/supabase/server');
```

---

## Onde buscar mais ajuda

| Recurso | URL |
|---------|-----|
| Sentry (erros runtime prod) | sentry.io |
| Vercel logs | vercel.com/dashboard → Logs |
| Supabase logs | app.supabase.com → Logs |
| GitHub Actions | github.com/Akasha-0/cabaladoscaminhos/actions |
| PostHog (analytics) | posthog.com |
| OpenAI status | status.openai.com |
| Supabase status | status.supabase.com |
| **Runbook incident response** | [docs/runbooks/02-incident-response.md](./runbooks/02-incident-response.md) |
| **Runbook deploy** | [docs/runbooks/01-deploy.md](./runbooks/01-deploy.md) |

---

## Reportar novo erro

Achou um erro não documentado aqui?

1. Verifique se já tem issue: `gh issue list --label bug`
2. Se não: criar com template `.github/ISSUE_TEMPLATE/bug_report.md`
3. Adicionar entrada aqui com causa + solução (PR pequeno, label `docs`)

> **Mantido por:** Documentation Steward · Wave 11 (Trilha 9)
> **Próxima revisão:** mensal ou após cada SEV-1/SEV-2.