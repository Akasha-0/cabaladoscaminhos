# Auth Flow — signup → onboarding → feed

> **Quando usar:** Você está implementando / debugando autenticação no
> Akasha Portal. Este doc mapeia o fluxo completo: do clique em "Criar
> conta" até o usuário logado ver o feed.
>
> **Versão:** 1.0 (Junho 2026)

---

## Visão geral

```
┌────────────────┐         ┌─────────────────┐         ┌──────────────────┐
│  /register     │  (1)    │  Supabase Auth  │  (2)    │  Server Action   │
│  <RegisterForm>│ ──────> │  signUp()       │ ──────> │  signupAction()  │
│  (client)      │         │  (server)       │         │  cria User +     │
└────────────────┘         └─────────────────┘         │  SpiritualProfile│
                                                        └────────┬─────────┘
                                                                 │ (3)
                                                                 ▼
                                              ┌──────────────────────────┐
                                              │  /onboarding              │
                                              │  <OnboardingFlow>         │
                                              │  (5 passos)               │
                                              └────────────┬───────────────┘
                                                            │ (4) submit
                                                            ▼
                                              ┌──────────────────────────┐
                                              │  completeOnboardingAction │
                                              │  upsert SpiritualProfile  │
                                              └────────────┬───────────────┘
                                                            │ (5) redirect
                                                            ▼
                                              ┌──────────────────────────┐
                                              │  /feed                   │
                                              │  (acesso autenticado)    │
                                              └──────────────────────────┘
```

---

## Passo a passo

### 1. Signup — `/register`

**Arquivo**: `src/app/(info)/register/page.tsx`
**Componente**: `src/components/auth/RegisterForm.tsx`

```
Usuário preenche:
  - Nome (≥2 chars)
  - Email (formato válido)
  - Senha (≥8 chars)
  - Confirmar senha (deve bater)
  - Aceitar termos (obrigatório)

Validação client-side (Zod: signupSchema em src/lib/validation/auth.ts)
   ↓
Chamada Supabase signUp() via useAuth()
   ↓
Metadados enviados: { full_name, traditions? }
   ↓
emailRedirectTo = NEXT_PUBLIC_SITE_URL + NEXT_PUBLIC_AUTH_REDIRECT
```

Se a sessão vier **vazia** (`session: null`), Supabase exige confirmação
por email — UI mostra tela "Confirme seu email". Senão, segue para
`/onboarding`.

### 2. Signup action (server-side)

**Arquivo**: `src/app/actions/auth.ts`
**Função**: `signupAction(input: SignupInput)`

```typescript
// Valida input com Zod
const parsed = signupSchema.safeParse(input);
if (!parsed.success) return { ok: false, fieldErrors };

// Chama Supabase Auth
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name }, emailRedirectTo },
});

if (error) return { ok: false, error: mapAuthError(error.message) };

// Se sessão veio pronta (email confirmation OFF), cria perfil espiritual
if (data.session) {
  await ensureSpiritualProfile(userId, { fullName });
}

return { ok: true, data: { userId, email } };
```

> O **`signUp` direto do client (via `useAuth`)** é o caminho principal.
> A server action existe para casos onde uma API externa precisa
> provisionar usuário (ex: convite admin).

### 3. Onboarding — `/onboarding`

**Arquivo**: `src/app/onboarding/page.tsx`
**Componente**: `src/components/onboarding/OnboardingFlow.tsx`

Proteção: o `middleware.ts` (root) redireciona para `/login?redirectTo=/onboarding`
se o user não estiver autenticado.

Cinco passos, cada um validado com Zod (ver `src/lib/validation/auth.ts`):

| Passo | Schema | Campo persistido |
|---|---|---|
| 1. Nome | `onboardingStep1Schema` | `birthName` |
| 2. Tradições | `onboardingStep2Schema` (1-6) | `mapaJson.traditions` |
| 3. Data nasc. | `onboardingStep3Schema` (`YYYY-MM-DD`) | `birthDate` |
| 4. Hora (opcional) | `onboardingStep4Schema` (`HH:MM` ou '') | `birthTime` |
| 5. Local | `onboardingStep5Schema` (cidade + país) | `birthPlace` |

UX:
- Progress bar visual (1/5, 2/5, ...)
- Botões "Voltar" / "Continuar"
- Validação por passo (não avança se incompleto)
- Salvamento só acontece no submit final

### 4. Complete onboarding action

**Arquivo**: `src/app/actions/auth.ts`
**Função**: `completeOnboardingAction(input)`

```typescript
const parsed = onboardingCompleteSchema.safeParse(input);
const supabase = await createServerSupabase();
const { data: { user } } = await supabase.auth.getUser();

const profileId = await upsertSpiritualProfile(user.id, parsed.data);

revalidatePath('/onboarding');
revalidatePath('/feed');

return { ok: true, data: { profileId, userId: user.id } };
```

`upsertSpiritualProfile` faz `prisma.spiritualProfile.upsert({...})` no
modelo de `community.prisma` — cria ou atualiza conforme o user já
tenha perfil (ex: foi criado pelo `signupAction` antes).

### 5. Redirect para `/feed`

Após sucesso do `completeOnboardingAction`, o componente chama:

```typescript
router.push('/feed?welcome=1');
router.refresh();
```

`/feed` está em `PROTECTED_PREFIXES` do `src/lib/supabase/middleware.ts`
— se a sessão expirou no meio do onboarding, o middleware redireciona
para `/login?redirectTo=/feed`.

---

## Componentes auxiliares

### Hook `useAuth`

**Arquivo**: `src/hooks/useAuth.ts`

API unificada (re-export do `SupabaseProvider` para padronizar import):

```typescript
const {
  user,            // User | null
  loading,         // boolean
  isAuthenticated, // boolean
  signIn,          // (email, password) => Promise<{ ok, error? }>
  signUp,          // (email, password, metadata) => Promise<{ ok, error? }>
  signInWithGoogle,// () => Promise<{ ok, error? }>
  signOut,         // () => Promise<{ ok, error? }>
  supabase,        // cliente (null se envs ausentes)
} = useAuth();
```

### Middleware de proteção

**Arquivo**: `middleware.ts` (raiz) + `src/lib/supabase/middleware.ts`

```typescript
// Rotas que exigem user logado
export const PROTECTED_PREFIXES = [
  '/feed', '/explore', '/library', '/notifications',
  '/post', '/u', '/groups', '/onboarding',
  '/settings', '/dashboard',
];

// Rotas de auth — se logado, redireciona para /feed
export const AUTH_PREFIXES = [
  '/login', '/register', '/forgot-password',
];
```

Para **adicionar uma nova rota protegida**: basta adicionar o prefixo em
`PROTECTED_PREFIXES`. Não precisa mexer em nenhum outro lugar.

### Google OAuth Button

**Arquivo**: `src/components/auth/GoogleOAuthButton.tsx`

Botão standalone que chama `signInWithGoogle()`. Mostra estado de loading
e mensagem clara quando o provider não está habilitado no Supabase
(modo placeholder).

---

## Server Actions

Todas em `src/app/actions/auth.ts`. Cada uma retorna `ActionResult<T>`:

```typescript
type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
```

| Action | Input | Output | Descrição |
|---|---|---|---|
| `signupAction` | `SignupInput` | `SignupResult` | Cria usuário no Supabase Auth + perfil |
| `loginAction` | `LoginInput` | `LoginResult` | Login email/senha |
| `logoutAction` | — | — | Sign out + redirect para `/login` |
| `completeOnboardingAction` | `OnboardingCompleteInput` | `OnboardingResult` | Upsert SpiritualProfile |
| `listTraditionsAction` | — | `string[]` | Lista de tradições suportadas |

---

## Cookies e sessões

O `@supabase/ssr` gerencia cookies automaticamente:

| Cookie | Função |
|---|---|
| `sb-<project-ref>-auth-token` | JWT + refresh token (Supabase) |

Importante:
- `signInWithPassword` salva cookie automaticamente
- `signOut` limpa cookie
- `getUser()` no middleware **valida** o token (não aceita falsificação)
- **Nunca** confie em `getSession()` server-side — ela lê o cookie sem
  validar

---

## Fluxo de erro

| Cenário | UX |
|---|---|
| Email inválido (Zod) | Erro inline no campo |
| Senha curta (Zod) | Erro inline + indicador de força |
| Senhas diferentes | Erro inline em "confirmar senha" |
| Email já cadastrado | Toast / erro: "Este email já está cadastrado" |
| Credenciais inválidas | Erro: "Email ou senha incorretos" |
| Email não confirmado | Erro: "Confirme seu email antes de entrar" |
| Sessão expirou | Middleware redireciona para `/login?redirectTo=...` |
| Supabase não configurado | Banner amarelo + botão desabilitado + link para `docs/SUPABASE-SETUP.md` |
| Erro de rede | Erro genérico + retry button |

---

## Variáveis de ambiente relevantes

| Variável | Padrão | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | (sem) | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (sem) | Chave pública anon |
| `SUPABASE_SERVICE_ROLE_KEY` | (sem) | Chave admin (server only) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Origem para redirects OAuth |
| `NEXT_PUBLIC_AUTH_REDIRECT` | `/feed` | Destino pós-login |

---

## Testes

| Arquivo | Cobre |
|---|---|
| `src/hooks/__tests__/useAuth.test.tsx` | Hook unitário (mock Supabase) |
| `src/__tests__/auth.test.tsx` | Fluxo signup → onboarding → feed |
| `src/lib/validation/auth.test.ts` | Schemas Zod |
| `tests/api/auth-login.test.ts` | API route POST /api/auth/login |
| `tests/api/auth-register.test.ts` | API route POST /api/auth/register |

Rode: `npm run test`

---

## Próximos passos

- [ ] Implementar reset de senha em `/forgot-password` (server action
      `requestPasswordResetAction`)
- [ ] Editar perfil espiritual em `/settings/profile`
- [ ] Deletar conta + purge de dados (LGPD)
- [ ] Adicionar OAuth providers extras (Apple, GitHub)
- [ ] Audit log de ações sensíveis (mudança de email, etc.)

Veja roadmap completo em `docs/ROADMAP-v2.md` (quando existir).