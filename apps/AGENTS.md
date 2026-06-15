# Apps DOX

## Purpose
Aplicações web do monorepo `cabala-dos-caminhos`. A única app atualmente
é o portal Next.js; CLI e outros binários vivem em `packages/`.

## Ownership
- `akasha-portal/`: Portal Next.js 16 (Fluid Compute) — Akasha OS
  - App Router com i18n (`[locale]/(akasha)/`)
  - 50+ API routes em `src/app/api/`
  - 5 Pilares: Cabala + Astrologia + Tantra + Odu + I Ching
  - F-228 PWA-first (manifest + service worker + Web Push)
  - F-240 Share Target (Web Share Target API)

## Local Contracts
- **Apps são CLIENTES dos packages** (akasha-core, mentor, core-*,
  akasha-cli). Business logic NÃO vive em `apps/`.
- **API routes em `src/app/api/`** seguem REST:
  - GET = read, POST = create, PATCH = update, DELETE = remove
  - Auth via `verifyAkashaToken` (cookie `akasha_session`) ou `requireAkashaApi`
  - Cron endpoints usam `verifyCronSecret` (header Bearer only)
  - Validation com Zod em rotas mutating
  - Erros retornam JSON `{ error: 'code' }` com status apropriado
- **Componentes React** em `src/components/`:
  - `src/components/akasha/`: features (MandalaChart, MyDayScreen,
    AkashaAuthorityPrompt, CaixaUnificada, dashboard, etc)
  - `src/components/ui/`: shadcn primitives (Button, Card, Dialog, etc)
  - `src/components/shared/`: cross-cutting (loading states, error boundaries)
- **PWA**: ativar via `manifest.json` + service worker; **NÃO** use
  `output: 'export'` (incompatível com `cookies()` em rotas auth).

## Work Guidance
- **TypeScript estrito** (zero `any` em código novo)
- **Tests co-located** com código (lesson N+24) — `*.test.ts` ao lado
  de `*.ts`. API route tests em `tests/integration/api/`
- **PT-BR primeiro** (i18n config); EN summary only (translation-status note)
- **Pilar 4 (Odu) ethics**: aviso `requer consentimento + terreiro`
- **NÃO inventar correspondências** esotéricas (lesson N+15, R-022 §4.4)
- **Cyclic dependency check**: packages importam entre si via paths TS
  (`@akasha/core`, etc); apps importam packages, NUNCA o contrário
- **i18n**: rodar `pnpm i18n:check` antes de commitar mudanças em
  `messages/{en,pt-BR}.json`

## Verification
- `pnpm typecheck` (0 errors)
- `pnpm test:run` (suite)
- `pnpm lint` (0 errors; warnings pré-existentes documentados)
- `pnpm i18n:check` (paridade en ↔ pt-BR)
- Lighthouse PWA score >90 (F-228)

## Padrões comuns

### Auth guard em API route
```ts
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;
  // ... rest of handler
}
```

### Cron guard
```ts
import { verifyCronSecret } from '@/lib/application/auth/cron-guard';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const guard = verifyCronSecret(request);
  if (guard) return guard;
  // ... rest of handler
}
```

### Server Component
```ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAkashaToken } from '@/lib/application/auth/akasha-jwt';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('akasha_session')?.value;
  if (!verifyAkashaToken(token, 'access')) redirect(`/${locale}/onboarding`);
  // ... render
}
```

## Child DOX Index
- [akasha-portal](file:///home/skynet/cabala-dos-caminhos/apps/akasha-portal/AGENTS.md) — Portal Akasha OS (Next.js 16, App Router, PWA)
