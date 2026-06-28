# Supabase Storage — Wave 21

> **Quando usar:** Você precisa hospedar arquivos do projeto (avatares, mídias
> de posts, capas da biblioteca, anexos de mensagens). Este doc é o manual
> operacional do Storage do Akasha Portal.
>
> **Versão:** 1.0 (28 de junho de 2026) — Wave 21 — P0 Critical Fix 5/6
>
> **Stack:** `@supabase/supabase-js@2.106+`, `@supabase/ssr@0.10+`

---

## Sumário

1. [Por que Supabase Storage?](#1-por-que-supabase-storage)
2. [Os 4 buckets do projeto](#2-os-4-buckets-do-projeto)
3. [Setup em 5 min](#3-setup-em-5-min)
4. [RLS policies](#4-rls-policies)
5. [Limites e cotas](#5-limites-e-cotas)
6. [Helper TypeScript](#6-helper-typescript)
7. [Como usar no código](#7-como-usar-no-código)
8. [Testando localmente](#8-testando-localmente)
9. [Quando migrar para R2 / S3](#9-quando-migrar-para-r2--s3)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Por que Supabase Storage?

Decidido em `ARCHITECTURE.md` §3 (Stack definitiva) como **storage padrão**
do projeto. Vantagens:

- ✅ S3-compatible API por baixo (não fica preso ao vendor)
- ✅ RLS nativo — policies em `storage.objects` com `auth.uid()`
- ✅ SDK JS compartilhado com Auth/DB (mesmo client, mesmas chaves)
- ✅ Plano gratuito generoso (1 GB storage + 2 GB egress/mês)
- ✅ Edge CDN automática em buckets `public`

Quando migrar para Cloudflare R2 ou AWS S3 direto? Veja seção 9.

---

## 2. Os 4 buckets do projeto

| Bucket | Visibilidade | Tamanho máx | MIME permitidos | Path convention |
|---|---|---|---|---|
| `avatars` | PUBLIC | 2 MB | jpg, png, webp | `{userId}/avatar.{ext}` |
| `post-media` | AUTH | 50 MB | jpg, png, webp, gif, mp4, webm, mov | `{userId}/{postId}/{filename}` |
| `library-covers` | PUBLIC | 3 MB | jpg, png, webp | `{articleId}/cover.{ext}` |
| `message-attachments` | AUTH | 25 MB | jpg, png, webp, gif, pdf, txt, mp3, wav, ogg | `{conversationId}/{userId}/{filename}` |

### 2.1 Por que essas convenções de path?

As **RLS policies** no SQL validam que `auth.uid()` (primeira pasta do path)
bate com o dono do arquivo. **NUNCA mude a estrutura do path sem atualizar
as policies em paralelo** — senão uploads param de funcionar.

Exemplos válidos:
```
avatars/abc123-def4-5678/avatar.jpg                    ✓
post-media/abc123-def4-5678/post_xyz/photo.png         ✓
library-covers/art_001/cover.webp                      ✓
message-attachments/conv_99/abc123-def4-5678/audio.mp3 ✓
```

Exemplos **bloqueados** pelas policies:
```
avatars/../etc/passwd                                  ✗ (traversal)
post-media/outro_user/post_xyz/photo.png               ✗ (path mismatch)
```

---

## 3. Setup em 5 min

### 3.1 — Pré-requisitos

- Conta Supabase ativa (projeto provisionado — ver `docs/SUPABASE-SETUP.md`)
- `supabase` CLI instalado:
  ```bash
  brew install supabase/tap/supabase      # macOS
  scoop install supabase                  # Windows
  # ou baixar binário: https://github.com/supabase/cli/releases
  ```
- `psql` instalado (para aplicar migration de policies):
  ```bash
  brew install libpq && export PATH=$(brew --prefix libpq)/bin:$PATH
  # Linux: apt install postgresql-client
  ```

### 3.2 — Login + link ao projeto

```bash
supabase login
supabase link --project-ref <seu-project-ref>
```

`<seu-project-ref>` está na URL do dashboard: `https://supabase.com/dashboard/project/<ref>`.

### 3.3 — Rodar o setup script

```bash
cd /workspace/cabaladoscaminhos

# Verificar pré-requisitos
bash scripts/setup-supabase-storage.sh --check

# Criar buckets + policies em uma tacada
bash scripts/setup-supabase-storage.sh

# Ou separadamente
bash scripts/setup-supabase-storage.sh --buckets
bash scripts/setup-supabase-storage.sh --policies
```

O script é **idempotente** — pode rodar várias vezes sem erro.

### 3.4 — Setup manual (alternativa)

Se preferir criar pelo Dashboard:

1. **Storage → New bucket** → repita para cada bucket acima
2. **Marque "Public bucket"** em `avatars` e `library-covers`
3. **File size limit** em MB conforme tabela
4. **Allowed MIME types** conforme tabela
5. **Storage → Policies → New policy** → cole os policies do migration.sql
   (`prisma/migrations/20260628_supabase_storage/migration.sql`)

---

## 4. RLS policies

Aplicadas via `prisma/migrations/20260628_supabase_storage/migration.sql`:

### 4.1 Resumo das policies

| Bucket | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `avatars` | público | owner | owner | owner |
| `post-media` | auth | owner | owner | owner |
| `library-covers` | público | admin/curator | admin/curator | admin/curator |
| `message-attachments` | owner | owner | owner | owner |

Onde:
- **público** = qualquer um (mesmo não-logado) pode ler
- **auth** = apenas usuários autenticados
- **owner** = `auth.uid()::text` bate com a primeira pasta do path
- **admin/curator** = role em `user_roles.role IN ('ADMIN', 'CURATOR')`

### 4.2 Por que admin client (service_role)?

`src/lib/supabase/storage.ts` usa `createAdminClient()` para operações de
storage. Isso é **intencional** porque:

1. **Validação de permissão** fica na camada de service (route handler /
   server action) — facilita testes e auditoria
2. **Signed URLs** precisam ser emitidas sem RLS (caso contrário o admin
   não consegue assinar para outros users)
3. **Cleanup** (delete) é trivial sem precisar encodar auth context

⚠️ **NUNCA exponha `SUPABASE_SERVICE_ROLE_KEY` ao client.** Valide sempre
no server:

```ts
// src/app/api/upload/route.ts (server-side)
const session = await getServerSession();
if (!session?.user?.id) return Response.json({ error: 'unauthorized' }, { status: 401 });

const { bucket, path, file } = await req.formData();
// Validar que path começa com session.user.id antes de chamar uploadFile()
if (!path.toString().startsWith(`${session.user.id}/`)) {
  return Response.json({ error: 'forbidden' }, { status: 403 });
}

const result = await uploadFile(BUCKETS.AVATARS, path.toString(), file);
```

---

## 5. Limites e cotas

### 5.1 Limites do plano Free

- **Storage:** 1 GB
- **Egress (download):** 2 GB/mês
- **Upload size por arquivo:** 50 MB (default; configurável por bucket)

### 5.2 Limites do plano Pro ($25/mês)

- **Storage:** 100 GB
- **Egress:** 250 GB/mês
- **Upload:** 5 GB por arquivo (configurável)

### 5.3 Limites aplicados no nosso helper

| Bucket | maxMB | MIME filter |
|---|---|---|
| `avatars` | 2 | jpg/png/webp |
| `post-media` | 50 | jpg/png/webp/gif/mp4/webm/mov |
| `library-covers` | 3 | jpg/png/webp |
| `message-attachments` | 25 | jpg/png/webp/gif/pdf/txt/mp3/wav/ogg |

⚠️ **Upload via Vercel Edge / Next.js Server Actions** tem limite prático
de **4.5 MB** por default (request body). Para arquivos maiores:

1. Use **resumable upload** (TUS protocol — Supabase suporta)
2. Ou faça upload direto do browser para Supabase com **signed upload URL**

Ver roadmap §9 — planejamos signed upload URLs na Wave 22.

---

## 6. Helper TypeScript

`src/lib/supabase/storage.ts` expõe:

```ts
import {
  BUCKETS,
  uploadFile,
  deleteFile,
  getPublicUrl,
  getSignedUrl,
  validateFileType,
  validateFileSize,
  buildAvatarPath,
  buildPostMediaPath,
  buildLibraryCoverPath,
  buildMessageAttachmentPath,
} from '@/lib/supabase/storage';
```

Todos os métodos retornam `StorageResult<T>` (discriminated union):

```ts
type StorageResult<T> = { ok: true; data: T } | StorageError;
```

---

## 7. Como usar no código

### 7.1 Upload de avatar

```ts
import { uploadFile, buildAvatarPath, BUCKETS } from '@/lib/supabase/storage';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return new Response('unauthorized', { status: 401 });

  const formData = await req.formData();
  const file = formData.get('avatar') as File;

  const path = buildAvatarPath(session.user.id, 'jpg');
  const result = await uploadFile(BUCKETS.AVATARS, path, file);

  if (!result.ok) {
    return Response.json({ error: result.message, code: result.code }, { status: 400 });
  }

  return Response.json({ path: result.data.path, url: getPublicUrl(BUCKETS.AVATARS, path) });
}
```

### 7.2 Signed URL para anexo de mensagem privada

```ts
import { getSignedUrl, BUCKETS } from '@/lib/supabase/storage';

// Em um endpoint /api/messages/[id]/attachment/[filename]
export async function GET(req: Request, { params }: { params: { id: string; filename: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return new Response('unauthorized', { status: 401 });

  const path = `${params.id}/${session.user.id}/${params.filename}`;
  const result = await getSignedUrl(BUCKETS.MESSAGE_ATTACHMENTS, path, 600); // 10 min

  if (!result.ok) return Response.json({ error: result.message }, { status: 400 });
  return Response.redirect(result.data.signedUrl);
}
```

### 7.3 Delete

```ts
import { deleteFile, BUCKETS } from '@/lib/supabase/storage';

const result = await deleteFile(BUCKETS.AVATARS, `${userId}/avatar.jpg`);
if (!result.ok) console.error('delete failed', result.code, result.message);
```

---

## 8. Testando localmente

### 8.1 Variáveis de ambiente

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # só server-side
```

### 8.2 Testar upload via curl

```bash
# 1. Login (pega access_token)
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha"}'

# 2. Upload (path deve respeitar convention do bucket)
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/storage/v1/object/avatars/$USER_ID/avatar.jpg" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: image/jpeg" \
  --data-binary @./avatar.jpg
```

### 8.3 Verificar policies via SQL

```sql
-- Quantas policies existem em storage.objects?
SELECT COUNT(*) FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
-- esperado: 16 (4 buckets × 4 ações)

-- Ver policies específicas
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE 'avatar%';
```

---

## 9. Quando migrar para R2 / S3

Sinais de que Supabase Storage está ficando pequeno:

- [ ] **Egress > 200 GB/mês** — Pro plan não cobre, e o overage é caro ($0.09/GB)
- [ ] **Storage > 80 GB** — próximo do limite do Pro
- [ ] **P99 latência > 500ms** em região fora da América do Sul
- [ ] **Necessidade de multi-region** (DR, GDPR)

Recomendação: **Cloudflare R2** (mesmo S3-compatible API, **zero egress fee**):

```ts
// src/lib/supabase/storage.ts v2 — adapter pattern
export async function uploadFileR2(...) { /* S3 SDK */ }
```

Quando migrar, mantemos o helper `src/lib/supabase/storage.ts` como
**adapter** — o código de chamada não muda, só trocamos o backend.

---

## 10. Troubleshooting

### `SUPABASE_NOT_CONFIGURED`

Variáveis `NEXT_PUBLIC_SUPABASE_URL` ou `SUPABASE_SERVICE_ROLE_KEY` ausentes.
Verifique `.env.local` e reinicie `next dev`.

### `INVALID_FILE_TYPE`

MIME do arquivo não está na whitelist do bucket. Veja `BUCKET_ALLOWED_TYPES`
em `src/lib/supabase/storage.ts`. Para JPEG de cameras iOS antigos, force
`image/jpeg` no client antes do upload.

### `FILE_TOO_LARGE`

Arquivo acima do limite do bucket. Limites por bucket:
- `avatars`: 2 MB
- `post-media`: 50 MB
- `library-covers`: 3 MB
- `message-attachments`: 25 MB

Comprimir no client antes de upload (canvas API para imagens, ffmpeg.wasm
para vídeo).

### `UPLOAD_FAILED` com `Payload too large`

Vercel Edge / Next.js Server Actions limita request body a 4.5 MB.
Solução: signed upload URL direto do browser (Wave 22).

### `SIGNED_URL_FAILED` com `signature verification failed`

Signed URL expirou ou foi gerada com outra chave. Verifique `expiresIn`
e que `SUPABASE_SERVICE_ROLE_KEY` não foi rotacionado entre geração e uso.

### Bucket não aparece no Dashboard

Rodou `supabase storage create-bucket` sem `--project-ref`? Use:
```bash
supabase storage create-bucket avatars --public --file-size-limit=2
```

### Policies bloqueando upload legítimo

Verifique que o path respeita a convention:
- `avatars/{userId}/...` (não `avatars/profile/...`)
- `post-media/{userId}/{postId}/...` (não `post-media/posts/...`)

Se o admin client está sendo usado, policies **não se aplicam** (bypassa RLS) —
o problema é outro (network, MIME, size).

### `supabase storage` retorna `command not found`

Reinstale a CLI:
```bash
brew reinstall supabase/tap/supabase
```

Ou use o binário direto: https://github.com/supabase/cli/releases

---

## 11. Referências

- Supabase Storage docs: https://supabase.com/docs/guides/storage
- Storage RLS: https://supabase.com/docs/guides/storage/security/access-control
- Signed URLs: https://supabase.com/docs/guides/storage/serving/signed-urls
- Migration SQL: `prisma/migrations/20260628_supabase_storage/migration.sql`
- Helper: `src/lib/supabase/storage.ts`
- Setup script: `scripts/setup-supabase-storage.sh`
- Auth setup relacionado: `docs/SUPABASE-SETUP.md`

---

## 12. Checklist de setup

```
[ ] supabase CLI instalado e logado
[ ] supabase link --project-ref <ref> executado
[ ] NEXT_PUBLIC_SUPABASE_URL no .env.local
[ ] SUPABASE_SERVICE_ROLE_KEY no .env.local
[ ] bash scripts/setup-supabase-storage.sh --check → vê 4 buckets
[ ] bash scripts/setup-supabase-storage.sh --buckets → 4 buckets criados
[ ] bash scripts/setup-supabase-storage.sh --policies → 16 policies criadas
[ ] Upload de teste via curl funciona (200 OK)
[ ] Signed URL de teste funciona (expira em N segundos)
[ ] npm run dev → upload de avatar via /api/upload funciona end-to-end
```

Quando tudo ✅, o storage está pronto para o upload real de mídias.