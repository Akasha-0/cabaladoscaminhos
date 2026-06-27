# Supabase Setup — Guia Passo a Passo

> **Quando usar:** Você precisa ligar o sistema de auth (login, signup, etc)
> e/ou hospedar o banco Postgres. O Akasha Portal usa Supabase para os dois.
>
> **Versão:** 1.0 (Junho 2026) — baseado em `@supabase/ssr@0.10+`

---

## 1. Por que Supabase?

Decidido em `ARCHITECTURE.md` (seção "Stack definitiva") como a única
fonte de verdade para **Auth + DB**. Vantagens:

- ✅ Auth gerenciada (senhas, OAuth, JWT, sessões)
- ✅ Postgres real (não SQLito, não mock)
- ✅ Row-Level Security (RLS) — política fina de acesso por linha
- ✅ Integração nativa com Next.js via `@supabase/ssr`
- ✅ Plano gratuito generoso (até 50k MAU)

---

## 2. Criando o projeto (5 min)

### 2.1 — Conta e projeto

1. Acesse https://supabase.com → **Start your project**
2. Login com GitHub (mais rápido) ou email
3. **New project** → preencha:
   - **Name**: `akasha-portal` (ou qualquer nome)
   - **Database password**: gere uma forte e **salve no 1Password** (não
     vai conseguir recuperar depois)
   - **Region**: escolha a mais próxima do público-alvo (ex: `South
     America (São Paulo)` para BR)
4. Clique **Create new project** — leva ~2 min para provisionar

### 2.2 — Pegar as credenciais

Quando o projeto estiver pronto, vá em:

**Authentication → Providers**

Confirme que **Email** está habilitado (já vem por padrão).

**Settings → API**

Você vai precisar de três valores:

| Variável | Onde está | Uso |
|---|---|---|
| **Project URL** | "Project URL" no topo | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** | Project API keys → `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** | Project API keys → `service_role` | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ **NUNCA exponha a `service_role` no client.** Ela bypassa RLS.
> Só use server-side (server actions, route handlers, migrations).

### 2.3 — Configurar URL do site

Em **Authentication → URL Configuration**:

- **Site URL**: `https://seu-dominio.com` (em dev: `http://localhost:3000`)
- **Redirect URLs**: adicione todas as URLs onde o app pode estar:
  - `http://localhost:3000`
  - `https://seu-dominio.com`
  - `https://staging.seu-dominio.com`

Sem isso, confirmação de email e OAuth vão falhar com `redirect_uri_mismatch`.

---

## 3. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
# Database (Settings → Database → Connection string → URI mode)
DATABASE_URL="postgresql://postgres.xxxx:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"

# Auth — público (NEXT_PUBLIC_*) — OK expor no browser
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."

# Service role — APENAS server (NUNCA NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Onde o app está rodando (Authentication → URL Configuration)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Onde mandar o usuário após login
NEXT_PUBLIC_AUTH_REDIRECT="/feed"
```

> Use o **pooler** (`pooler.supabase.com:6543`) em produção serverless
> (Vercel) — não a conexão direta na porta 5432.

---

## 4. Schema do banco

### 4.1 — Modelo mental

O schema Prisma vive em `prisma/schema.prisma` (legado) e
`prisma/community.prisma` (comunidade — adicionado em 2026-06-26).

A integração com Supabase Postgres funciona via Prisma normalmente:

```bash
# Gerar client Prisma após mudanças no schema
npx prisma generate

# Push do schema para o banco (dev/staging)
npx prisma db push

# Migration versionada (produção)
npx prisma migrate dev --name <descrição>
```

### 4.2 — Tabelas principais do MVP de auth

Já cobertas no `prisma/schema.prisma`:

- `User` — usuário base (campos legados do MVP)
- `SpiritualProfile` (em `community.prisma`) — perfil espiritual do
  usuário (criado no signup ou no onboarding)

### 4.3 — Row-Level Security (RLS)

Para que cada user só veja/edite os próprios dados, habilite RLS nas
tabelas e crie policies. Exemplo:

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_profiles ENABLE ROW LEVEL SECURITY;

-- Users podem ler o próprio registro
CREATE POLICY "Users can read own row"
  ON users FOR SELECT
  USING (auth.uid()::text = "supabaseUserId");

-- Users podem atualizar o próprio registro
CREATE POLICY "Users can update own row"
  ON users FOR UPDATE
  USING (auth.uid()::text = "supabaseUserId");

-- Spiritual profiles: leitura pública (community), escrita só do dono
CREATE POLICY "Profiles are publicly readable"
  ON spiritual_profiles FOR SELECT
  USING (visibility = 'PUBLIC' OR auth.uid()::text = "userId");
```

(O mapping `auth.uid()::text = "userId"` assume que `users.id` é o mesmo
id do Supabase Auth — ajuste conforme o schema final.)

---

## 5. Google OAuth (opcional)

Para liberar login com Google:

### 5.1 — Google Cloud Console

1. https://console.cloud.google.com → projeto novo (ou use um existente)
2. **APIs & Services → OAuth consent screen**
   - User type: **External** (ou Internal se for workspace)
   - Preencha app name, support email, dev email
3. **APIs & Services → Credentials → Create OAuth client ID**
   - Application type: **Web application**
   - **Authorized redirect URIs** (CRÍTICO):
     ```
     https://<seu-project-ref>.supabase.co/auth/v1/callback
     ```
   - Salve o **Client ID** e **Client Secret**

### 5.2 — Configurar no Supabase

**Authentication → Providers → Google → Enable**

Cole Client ID e Secret. Salve.

### 5.3 — Testar

```bash
npm run dev
# Abra http://localhost:3000/login
# Clique em "Continuar com Google"
```

Se der `provider is not enabled`, revise o passo 5.2.

---

## 6. Email templates (confirmação)

Por padrão o Supabase manda emails em inglês. Para traduzir:

**Authentication → Email Templates**

Customize:
- **Confirm signup** — "Bem-vindo ao Akasha Portal"
- **Magic Link** — "Seu link de acesso"
- **Reset password** — "Redefina sua senha"

O remetente pode ser customizado em **Settings → Auth → SMTP Settings** —
recomendamos Resend, Postmark ou SendGrid em produção (SendGrid/Postmark
free tier cobre o MVP).

---

## 7. Ambiente local (sem Supabase real)

O código é **sandbox-friendly**: se as envs `NEXT_PUBLIC_SUPABASE_*`
não estiverem configuradas:

- `useAuth()` retorna `isConfigured: false` e todos os métodos retornam
  erro amigável
- `signIn` mostra mensagem "Serviço de autenticação indisponível"
- Páginas de marketing (landing `/`, `/validacao`, `/manifesto`)
  renderizam normalmente
- `middleware.ts` libera rotas (mas redireciona `/feed` etc para
  `/login` se Supabase não estiver configurado — comportamento defensivo)

Isso permite rodar `npm run dev` e navegar a UI mesmo sem Supabase.

---

## 8. Checklist de setup

```
[ ] Conta Supabase criada
[ ] Projeto provisionado
[ ] URL + anon key + service_role copiados para .env.local
[ ] Site URL + Redirect URLs configurados
[ ] npx prisma generate && npx prisma db push rodado
[ ] RLS habilitado nas tabelas users / spiritual_profiles
[ ] (Opcional) Google OAuth configurado
[ ] (Opcional) Email templates traduzidos
[ ] npm run dev → /login → testa signup com email real
```

Quando tudo estiver ✅, a UI deixa de mostrar o aviso "Supabase não
configurado" e o fluxo de signup → onboarding → feed funciona ponta a
ponta.

---

## 9. Troubleshooting

| Erro | Causa | Fix |
|---|---|---|
| `Invalid API key` | anon key errada | Recopie de Settings → API |
| `redirect_uri_mismatch` | URL não está em Redirect URLs | Adicione em Auth → URL Configuration |
| `User already registered` | Email já existe | Normal — usuário faz login |
| `Email rate limit exceeded` | Muitos signups | Espere 1h ou desabilite rate limit em dev |
| CORS error no browser | Site URL errado | Confira NEXT_PUBLIC_SITE_URL |
| `fetch failed` | URL do projeto errada | Confira NEXT_PUBLIC_SUPABASE_URL |

Mais ajuda: https://supabase.com/docs/guides/auth

---

## 10. Referências

- Documentação oficial: https://supabase.com/docs
- `@supabase/ssr` (Next.js integration): https://supabase.com/docs/guides/auth/server-side/nextjs
- RLS guide: https://supabase.com/docs/guides/auth/row-level-security
- Auth Flow do projeto: ver [`AUTH-FLOW.md`](./AUTH-FLOW.md)