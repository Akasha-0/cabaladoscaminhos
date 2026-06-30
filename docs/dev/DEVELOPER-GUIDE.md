# Developer Guide — Akasha Portal

> **Versão:** 1.0 | **Data:** 2026-06-30 | **Wave:** 32 (DOCUMENTATION 6/8)
> **Stack:** Next.js 16 (App Router) · TypeScript 5 · React 19 · Supabase (Postgres + Auth + Storage) · Stripe Connect · OpenAI / MiniMax
> **Language:** EN
> **Audience:** new contributors, integrators, AI agents

---

## 1. Setup local

### 1.1 Pré-requisitos

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20.x LTS | Volta ou nvm |
| pnpm | 9.x | `corepack enable && corepack prepare pnpm@latest --activate` |
| Git | 2.40+ | `git lfs install` opcional |
| Docker | 24+ | Para Postgres + Redis locais |
| VSCode | latest | Extensions: ESLint, Prettier, Tailwind IntelliSense |

### 1.2 Clone & install

```bash
git clone https://github.com/Akasha-0/cabaladoscaminhos.git
cd cabaladoscaminhos
pnpm install
```

### 1.3 Environment variables

```bash
cp .env.example .env.local
```

Edite `.env.local` — **mínimo para dev local**:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/akasha"
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<from supabase start>"
SUPABASE_SERVICE_ROLE_KEY="<from supabase start>"
OPENAI_API_KEY="sk-..."            # opcional em dev (fallback para MiniMax)
NEXTAUTH_SECRET="<openssl rand -base64 32>"
```

Veja `docs/DEPLOY-RUNBOOK-W27.md` para checklist completo de env vars em produção.

### 1.4 Banco local (Supabase + Docker)

```bash
# Sobe Postgres + pgvector + Supabase Studio
npx supabase start

# Aplica migrations
pnpm db:migrate

# Seed (opcional)
pnpm db:seed
```

**URLs:**
- Postgres: `postgresql://postgres:postgres@localhost:54322/postgres` (porta do Supabase CLI)
- Studio: [http://localhost:54323](http://localhost:54323)
- Mailpit (dev emails): [http://localhost:54324](http://localhost:54324)

### 1.5 Rodar dev server

```bash
pnpm dev
# → http://localhost:3000
```

**Quality gates em paralelo:**
```bash
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint
pnpm test             # vitest
pnpm test:e2e         # playwright
```

---

## 2. Architecture overview

### 2.1 High-level

```
┌────────────────────────────────────────────────────────┐
│                      Browser (PWA)                     │
│  React 19 + Next.js 16 App Router + Tailwind + shadcn  │
└────────────┬───────────────────────────────────────────┘
             │ HTTPS (cookies + JWT)
             ▼
┌────────────────────────────────────────────────────────┐
│                  Vercel Edge Runtime                   │
│  - middleware.ts (rate limit, CORS, auth gate)         │
│  - Server Components + Server Actions                  │
│  - Streaming SSE (Akasha chat)                         │
└─────┬──────────┬──────────┬──────────┬─────────────────┘
      │          │          │          │
      ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Supabase│ │ Stripe │ │ OpenAI │ │ PostHog│
│Auth +  │ │ Connect│ │   /    │ │ +Sentry│
│Postgres│ │ (B2B)  │ │ MiniMax│ │        │
│+Storage│ │        │ │        │ │        │
└────────┘ └────────┘ └────────┘ └────────┘
```

### 2.2 Pastas principais

```
src/
├── app/              # Next.js App Router
│   ├── (marketing)/  # Landing, about, FAQ
│   ├── (app)/        # Auth-required (feed, profile, marketplace, etc)
│   ├── api/          # 118 rotas REST
│   ├── admin/        # Painel admin
│   └── oraculo/      # Páginas dos oráculos
├── components/
│   ├── ui/           # shadcn primitives
│   ├── sacred/       # Componentes espirituais (LuminousCard, etc)
│   └── oraculo/      # Componentes de mapa astral, numerologia
├── lib/
│   ├── api/          # Helpers de response (ok, error, rateLimited)
│   ├── auth/         # Supabase server + client
│   ├── db/           # Prisma client + queries
│   ├── ai/           # Akasha personality + prompts
│   ├── oraculo/      # Engines de astrologia, numerologia, Mesa Real
│   └── env.ts        # Zod schema de env vars
├── prisma/           # Schema + migrations
└── middleware.ts     # Rate limit + CORS + auth gate

docs/
├── user/             # Guias de usuário (PT-BR)
├── api/              # API reference (EN)
├── dev/              # Este guia (EN)
├── ops/              # Runbooks operacionais (PT-BR)
└── videos/           # Scripts de vídeo
```

### 2.3 Data flow típico (criar post)

```
1. User submits form (Client Component)
   ↓
2. Server Action / fetch('/api/posts', POST)
   ↓
3. middleware.ts → rate limit check
   ↓
4. API route handler
   ├─ requireUser() (Supabase)
   ├─ validateInput (Zod)
   ├─ db.post.create({ data })
   ├─ enqueueNotification (smart-send worker)
   └─ return ok(post, 201)
   ↓
5. Client revalidate + UI update
   ↓
6. PostHog.track('post_created')
```

---

## 3. Code conventions

### 3.1 TypeScript

- **Strict mode** sempre (`"strict": true`)
- **No `any`** — use `unknown` + type narrowing
- **Prefer `interface`** para objetos públicos; `type` para unions/aliases
- **No enums** — use `as const` objects
- **No unused vars** — ESLint bloqueia

```typescript
// ✅ Bom
interface Post {
  id: string;
  authorId: string;
  content: string;
}

type Visibility = 'public' | 'group' | 'private';
const VISIBILITY = { PUBLIC: 'public', GROUP: 'group', PRIVATE: 'private' } as const;

// ❌ Evite
enum Visibility { Public, Group, Private }
const post: any = { ... }
```

### 3.2 React

- **Server Components por padrão** — só adicione `'use client'` quando precisar de estado/efeito/browser API
- **Hooks custom** em `src/hooks/` com prefixo `use`
- **Composição > props drilling** — use Context ou composition pattern
- **Testes:** cada componente tem `.test.tsx` colocalizado

```tsx
// ✅ Server Component
export default async function FeedPage() {
  const posts = await db.post.findMany();
  return <Feed posts={posts} />;
}

// ✅ Client Component (apenas quando necessário)
'use client';
export function AkashaChatInput() {
  const [text, setText] = useState('');
  // ...
}
```

### 3.3 Prisma / DB

- **Migrations nomeadas** — `20260630_add_mentorship_table`
- **Soft delete** — campo `deletedAt` em vez de DELETE
- **Cursor pagination** — `?cursor=<id>&limit=<n>`
- **Indexes** — todo FK + todo campo usado em WHERE/ORDER

```typescript
// ✅ Bom
const posts = await db.post.findMany({
  where: { authorId, deletedAt: null },
  orderBy: { publishedAt: 'desc' },
  take: 20,
  cursor: cursor ? { id: cursor } : undefined,
  include: { author: true, _count: { select: { likes: true } } },
});
```

### 3.4 Naming

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Arquivos | kebab-case | `akasha-chat.tsx` |
| Componentes | PascalCase | `AkashaChat` |
| Funções | camelCase | `fetchPost` |
| Constantes | UPPER_SNAKE | `MAX_POST_LENGTH` |
| Types/Interfaces | PascalCase | `Post`, `UserProfile` |
| DB tables | snake_case | `user_profile` |
| API routes | kebab-case | `/api/akashic/chat` |

### 3.5 Git

- **Conventional Commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- **Branches:** `main` (protegida) → `feat/wXX-desc`, `fix/wXX-desc`
- **PRs:** título descritivo + checklist + screenshots
- **Worktrees:** use `git worktree` para waves paralelas (evita colisões)

```bash
git checkout -b feat/w32-documentation
# ... commits ...
gh pr create --title "docs: comprehensive user + dev + API W32"
```

---

## 4. Testing

### 4.1 Estratégia

| Tipo | Tool | Cobertura mínima |
|------|------|------------------|
| Unit | Vitest | 80% em `src/lib/**` |
| Component | Vitest + Testing Library | Componentes críticos |
| Integration | Vitest | API routes |
| E2E | Playwright | Fluxos principais (signup, post, akasha, oráculo) |
| Visual | Chromatic | Componentes UI |

### 4.2 Rodar testes

```bash
pnpm test                 # Unit + integration
pnpm test:watch           # Watch mode
pnpm test:e2e             # Playwright
pnpm test:e2e:ui          # Playwright com UI
pnpm test:coverage        # Cobertura
```

### 4.3 Escrever testes

```typescript
// src/lib/oraculo/mapa-completo.test.ts
import { describe, it, expect } from 'vitest';
import { calcularMapaCompleto } from './mapa-completo';

describe('calcularMapaCompleto', () => {
  it('calcula sol, lua e ascendente', () => {
    const mapa = calcularMapaCompleto({
      data: '1990-06-15',
      hora: '14:30',
      local: 'São Paulo',
    });
    expect(mapa.sol).toBeDefined();
    expect(mapa.lua).toBeDefined();
    expect(mapa.ascendente).toBeDefined();
  });

  it('rejeita data inválida', () => {
    expect(() => calcularMapaCompleto({
      data: 'invalid', hora: '14:30', local: 'São Paulo'
    })).toThrow('Data inválida');
  });
});
```

---

## 5. Deploy

### 5.1 Ambientes

| Env | URL | Trigger |
|-----|-----|---------|
| Preview | per-PR Vercel URL | PR aberta |
| Production | https://akasha.com.br | Merge em `main` |

### 5.2 Pipeline

1. PR aberta → Vercel Preview deploy
2. CI (GitHub Actions): TSC + lint + unit tests
3. Aprovação → squash merge
4. Vercel Production deploy (canary 10% → 100%)
5. PostHog + Sentry monitoring

### 5.3 Pre-deploy checklist

Veja `docs/DEPLOY-RUNBOOK-W27.md` §1 (10 itens). Resumo:

```bash
pnpm typecheck           # TSC = 0
pnpm lint                # ESLint = 0
pnpm test                # All pass
bash scripts/verify-env.sh
bash scripts/pre-deploy-check.sh
```

---

## 6. Contributing

### 6.1 Workflow

1. **Escolha uma issue** em `github.com/Akasha-0/cabaladoscaminhos/issues` (label `good first issue` para começar)
2. **Comente na issue** que você quer pegar
3. **Fork + branch** (`feat/wXX-desc`)
4. **Implemente + teste**
5. **Abra PR** com:
   - Título conventional commit
   - Descrição do que mudou + por quê
   - Screenshots (se UI)
   - Checklist preenchido
6. **Code review** — mínimo 1 aprovação
7. **Squash merge** após CI verde

### 6.2 Code review checklist

- [ ] Lint + TSC = 0
- [ ] Tests added/updated
- [ ] Conventional commit message
- [ ] No secrets in diff
- [ ] Accessibility (a11y) verificado
- [ ] LGPD compliance (se envolve dados pessoais)
- [ ] Docs atualizadas (se API/mudança visível)

### 6.3 Segurança

- **Nunca** commite `.env`, secrets, tokens
- **Reportar vulnerabilidades:** security@akashaportal.com.br (PGP key em `docs/SECURITY.md`)
- Veja `docs/SECURITY-FIXES-WAVE10.md` para histórico

---

## 7. Ferramentas úteis

| Tool | Comando | Função |
|------|---------|--------|
| TSC | `pnpm typecheck` | Type check |
| ESLint | `pnpm lint` | Lint |
| Prettier | `pnpm format` | Auto-format |
| Vitest | `pnpm test` | Unit + integration |
| Playwright | `pnpm test:e2e` | E2E |
| Prisma Studio | `pnpm db:studio` | GUI do DB |
| Supabase Studio | `npx supabase studio` | GUI Supabase |
| PostHog | dashboard.posthog.com | Analytics |
| Sentry | sentry.io | Error tracking |
| Vercel | vercel.com/dashboard | Deploy logs |

---

## 8. Próximos passos

- **Runbook operacional:** `docs/ops/OPS-RUNBOOK.md`
- **API reference:** `docs/api/API-REFERENCE-W32.md`
- **Changelog:** `CHANGELOG.md`
- **Roadmap:** `docs/08_roadmap.md`