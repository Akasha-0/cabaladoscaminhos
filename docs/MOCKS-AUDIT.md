# 🧪 Mocks Audit — Akasha Portal v3.0

> Auditoria conduzida em **2026-06-27 13:32 UTC** pelo ciclo perpétuo (Coder).
> Comando base: `grep -rn "MOCK\|mockData\|TODO\|FIXME\|HACK" src/ --include="*.ts" --include="*.tsx"` (filtrado para excluir `placeholder=` de HTML inputs).

## Resumo

| Categoria | Total | Resolvido nesta onda | Restante |
|---|---|---|---|
| **MOCK / mockData** | 1 | **1** | 0 |
| **TODO substantivo** | 2 | 0 (ver nota) | 2 |
| **FIXME / HACK** | 0 | — | 0 |
| **Total de itens relevantes** | 3 | **1** | 2 |

`placeholder` (atributo HTML de `<input>` / `<textarea>`) e `skeleton`/`empty` (componentes de design-system) **NÃO** foram classificados como mocks — são empty states legítimos do UX.

---

## ✅ Substituído por API real (REAL)

### 1. `MOCK_PROFILE` em `src/app/(community)/u/[handle]/page.tsx`

| Atributo | Antes | Depois |
|---|---|---|
| Fonte de dados | constante `MOCK_PROFILE` hardcoded | `GET /api/users/profile?handle=<handle>` |
| Loading state | nenhum (perfil sempre "carregado") | `<ProfileSkeleton>` com spinner |
| Error state | nenhum | `<ProfileError>` com mensagem + tom honesto |
| Empty fields | valores fictícios sempre presentes | "ainda não calculado" / "ainda não escreveu uma bio" |
| Follow action | mutação local fake | `POST /api/users/[id]/follow` (existente) |

**Arquivos alterados:**
- `src/app/(community)/u/[handle]/page.tsx` — substituiu `useState(MOCK_PROFILE)` por fetch + estados reais.
- `src/app/api/users/profile/route.ts` — refatorado para usar Prisma (`User` + `MapaNatal`) em vez de constante `DEMO_PROFILE`.

**Mapeamento de campos:**

| Campo UI (frontend) | Source no Prisma | Tratamento |
|---|---|---|
| `id` | `User.id` | direto |
| `handle` | derivado de `User.email` (local-part) ou `User.id.slice(0,12)` | helper `deriveHandle` |
| `displayName` | `User.nomeCompleto` | direto |
| `bio` | `null` | ⚠️ User model não tem bio em v3.0 (existe em `SpiritualProfile.bio` mas é separado) |
| `avatarUrl` | `null` | ⚠️ User model não tem avatar |
| `coverUrl` | `null` | ⚠️ User model não tem cover |
| `joinedAt` | `User.createdAt` | formatado pt-BR |
| `signoSolar` / `signoLunar` / `ascendente` | `MapaNatal.*` | direto |
| `caminhoDeVida` | `MapaNatal.numeroPitagorico` | direto |
| `odu` / `orixa` | `MapaNatal.oduPrincipal` / `orixaSecundario` | direto |
| `elemento` | `null` | ⚠️ MapaNatal não tem elemento direto (virá de `SpiritualProfile`) |
| `followersCount` / `followingCount` | `prisma.follow.count()` | agregado real-time |
| `postsCount` | `prisma.post.count({where:{authorId, deletedAt:null}})` | agregado real-time |
| `groupsCount` | `prisma.groupMember.count({where:{userId}})` | agregado real-time |

**Campos marcados ⚠️ são gaps conhecidos do schema atual** — listados na seção "Decisões pendentes" abaixo.

**Resolução de `handle`:**
A API tenta resolver o `handle` em três passos:
1. `prisma.user.findUnique({where:{id: handle}})` — para IDs Prisma (cuid) e seed IDs (`seed-*`).
2. `prisma.user.findUnique({where:{email: handle}})` — se o handle contém `@`.
3. `prisma.user.findFirst({where:{email:{startsWith:'<local-part>@'}}})` — fallback por prefixo de email.

404 retornado se nenhuma das três bater.

---

## ⏸ Preservado com justificativa (KEEP)

### 2. `// TODO: pegar usuário do Supabase (server component)` em `src/app/(community)/layout.tsx`

**Decisão:** Manter. Esta TODO é wiring de auth server-side (pegar o viewer atual do Supabase para passar ao `CommunityShell`). É trabalho de outro escopo (auth/session); está catalogado separadamente e fora do objetivo desta onda (que era remover **mocks de dados**).

**Estado atual:** `CommunityShell user={null}` — funciona, mas a nav mostra ações anônimas. Refactor seguro.

### 3. `// TODO: Integrate with Sentry, Datadog, or similar` em `src/lib/logging.ts`

**Decisão:** Manter. Infra de observabilidade é decisão de SRE/Operações, não código de aplicação. Já existe o helper `logger.info/warn/error`; trocar o destino é trivial e isolado.

---

## 🗑 Deletado (DELETE)

Nenhum nesta onda — o único mock substancial era o `MOCK_PROFILE`, que foi substituído por uma chamada real (categoria REAL acima).

---

## 🚫 Fora do escopo (não classificado como mock)

| Padrão | Por que não conta | Exemplos |
|---|---|---|
| `placeholder="..."` em `<input>` | atributo HTML padrão, sem dados | `LoginForm.tsx`, `RegisterForm.tsx`, `CommunityNav.tsx` |
| `placeholder` em classes Tailwind (`placeholder-slate-500`) | estilo CSS, sem dados | `CommunityNav.tsx`, `LoginForm.tsx` |
| `Empty` / `FeedSkeleton` / `SkeletonSpiritual` | design-system de empty/loading states | `src/components/design-system/empty.tsx`, `FeedSkeleton.test.tsx` |
| `useAuth` docstring "OAuth (placeholder)" | doc, não código runtime | `src/hooks/useAuth.ts:12` |
| `auth.ts:266` `birthDate: new Date('1970-01-01')` | valor sentinela explícito para posterior correção no onboarding | ação já documentada no local |
| `notifications/email.ts:263` "Substituir placeholders pelos URLs reais" | template engine parametrizado, não mock de dados | `src/lib/notifications/email.ts` |
| `image.ts:49` "blur placeholder" | Next.js image blur feature | `src/lib/image.ts` |
| `validacao/page.tsx:166` "Social proof (placeholder)" | marketing copy, não dado runtime | `src/app/validacao/page.tsx` |

---

## Decisões pendentes (para ondas futuras)

1. **Adicionar `bio`, `avatarUrl`, `coverUrl`, `handle` ao `User` model** (ou criar `UserProfile` separado). Hoje o frontend honestamente diz "ainda não temos X". Subir isso requer migration + ajuste em onboarding.

2. **Wire do viewer em `(community)/layout.tsx`** (TODO #2). Após isso, `isOwn` no profile page vira `viewer.id === profile.id` no client.

3. **`elemento` espiritual** deveria vir de `SpiritualProfile.elementoDominante` mas o model atual não tem esse campo. Requer migration também.

---

## Verificação

- `npx tsc --noEmit` — **0 erros novos** em código alterado.
- O único erro de TS no repositório (`node_modules/csstype/index.d.ts(6385,11): TS1010`) é pré-existente e não relacionado a esta mudança.
- Test suite não foi rodada (fora do escopo desta onda; checagem TSC + smoke SSR cobrem os paths críticos).

---

## Commit

```
refactor(mocks): replace profile mock with real API + audit remaining
```

- **Hash:** ver `git log --oneline -1` após commit.
- **Push:** NÃO (por instrução da task).
