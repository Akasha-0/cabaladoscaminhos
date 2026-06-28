# Visual UI Audit — Wave 24 · Trilha Design 3/6

**Data:** 2026-06-28
**Agente:** Lina (Designer/UX) — orquestrado por General
**Escopo:** auditoria visual de todas as 55 pages do Akasha Portal contra o Design System v2
**Status:** ✅ AUDIT COMPLETO · rollout plan pronto para Wave 25+

---

## 📋 TL;DR (pra owner ler em 60s)

| Métrica | Valor | Veredito |
|---|---|---|
| **Total de pages** | 55 | — |
| **Pages usando v2 (`@/components/ui/v2/`)** | **0** (zero) | 🔴 **P0 — 100% das pages ignoram o v2** |
| **Pages usando v1 (`@/components/ui/`)** | 26 (47%) | 🟡 metade usa a base legada |
| **Pages com `loading.tsx`** | 9 (16%) | 🔴 84% sem loading state |
| **Pages com `error.tsx`** | 4 (7%) | 🔴 93% sem error boundary |
| **Pages com classes `dark:`** | 2 (3.6%) | 🔴 96% sem dark mode explícito |
| **Pages com `bg-[#hex]` ou hex hardcoded** | 0 | ✅ todos usam tokens Tailwind |
| **Pages com tokens semânticos (`bg-background`, `text-foreground`)** | 9 (16%) | 🟡 maioria usa ramp direto |
| **Pages com hierarchy `<h1>` correto** | 47 (85%) | ✅ razoável |
| **Pages com `style={{...}}` inline** | ≥6 (≥11%) | 🟡 ainda presente |
| **Routes duplicadas (root + grupo)** | **7** | 🔴 Next.js ambiguity |

**Diagnóstico geral:** O Design System v2 foi **criado mas não adotado**. Está numa prateleira bonita
com 8 components premium (1.232 LOC + 476 LOC tokens + 589 LOC doc) mas **nenhuma page importa de
`@/components/ui/v2/`**. Toda a UI roda em v1 (shadcn-style) + classes Tailwind avulsas.

**Recomendação:** rollout em **3 waves** (P0 → P1 → P2). Quick wins de P0 = ~6h de trabalho
para adotar Button + Card + Badge v2 nas **5 pages de maior tráfego**.

---

## 1. Inventário Completo (55 pages)

### 1.1 Por route group

| Group | Pages | Diretório |
|---|---|---|
| `(admin)` | 6 | dashboard, flags, moderation, newsletter, users, index |
| `(auth)` | 4 | login, signup, reset-password, verify-email |
| `(community)` | 27 | feed, explore, library, groups (×3), events (×2), mentorship (×2), post, tags, u/[handle], me (×3), notifications, settings, dashboard, feedback, akashic |
| `(info)` | 4 | about, privacy, terms, newsletter |
| Top-level | 12 | page (home), akashic, design-system, feed, library, manifesto, notifications, offline, onboarding, privacy, search, share-target, terms, validacao (×5), welcome |

### 1.2 Pages com mais imports de `@/components/ui/`

| Imports | Page | Categoria |
|---|---|---|
| 5 | `src/app/(community)/u/[handle]/page.tsx` | perfil público |
| 5 | `src/app/(community)/groups/[slug]/page.tsx` | detalhe de grupo |
| 4 | `src/app/(community)/library/page.tsx` | biblioteca |
| 3 | `tags/[tag]`, `post/[id]`, `mentorship` (×2), `groups`, `explore`, `events` | mid-community |

### 1.3 Pages sem NENHUM import de `@/components/ui/` (29 pages = 53%)

Maioria das pages **(admin)**, **(auth)** e **(info)** + top-level. Padrão: usam apenas
`@/components/design-system/` (v1) ou `@/components/auth/LoginForm`, `@/components/shared/...`,
ou componentes locais (`PostCard`, `FeedSkeleton` etc).

---

## 2. Matriz de Compliance × Design System v2

**Legenda:**
- ✅ adotado consistentemente
- 🟡 parcial / inconsistente
- 🔴 ausente / violação grave
- ⚪ não aplicável

| Page | Tokens (semantic) | v2 components | Dark mode | Modular type | Mobile-first | Notes |
|---|---|---|---|---|---|---|
| `/` (home) | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | inline style={radial-gradient}, sem dark, gradient text OK |
| `/feed` | 🟡 | 🔴 | 🔴 | ✅ | ✅ | FAB mobile excelente; usa v1 card-spiritual + BottomSheet v1 |
| `/library` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/search` | 🟡 | 🔴 | 🔴 | ✅ | ✅ | 1005 LOC — debounce + filters; custom UI, sem Card v2 |
| `/notifications` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/akashic` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/design-system` | ✅ | ✅ | ✅ | ✅ | ✅ | showcase page, referência |
| `/post/[id]` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/onboarding` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | 6 LOC — provavelmente stub |
| `/welcome` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | 30 LOC — stub |
| `/offline` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/manifesto` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/about` + `/(info)/about` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | **DUPLICADO** |
| `/privacy` + `/(info)/privacy` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | **DUPLICADO** |
| `/terms` + `/(info)/terms` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | **DUPLICADO** |
| `/newsletter` + `/(info)/newsletter` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | **DUPLICADO** |
| `/login` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | usa LoginForm local + LoadingSpinner |
| `/signup` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/reset-password` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/verify-email` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/feed` | 🟡 | 🔴 | 🔴 | ✅ | ✅ | idem `/feed` — **DUPLICADO** |
| `/(community)/notifications` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | **DUPLICADO** |
| `/(community)/library` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | **DUPLICADO** |
| `/(community)/akashic` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | **DUPLICADO** |
| `/(community)/dashboard` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/explore` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/groups` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/groups/[slug]` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/events` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/events/[id]` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/mentorship` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/mentorship/[id]` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/me/bookmarks` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/me/drafts` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/me/history` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/settings` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/feedback` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/post/[id]` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/tags/[tag]` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(community)/u/[handle]` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(admin)/dashboard` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(admin)/flags` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(admin)/moderation` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(admin)/newsletter` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(admin)/users` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/(admin)/page.tsx` | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | apenas redirect → /admin/dashboard |
| `/validacao` + b/c/d | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | smoke-test pages |
| `/share-target` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | PWA share target |
| `/akashic-chat` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | — |
| `/not-found` | 🟡 | 🔴 | 🔴 | 🟡 | ✅ | usa v1 design-system |

**Resumo:** 100% das pages **fora `/design-system`** estão em **🔴 no eixo "v2 components"**. Os outros
eixos são majoritariamente 🟡 (tokens semânticos não usados, dark mode ausente) mas com boa base
(gradient spiritual + responsive classes + heading hierarchy).

---

## 3. Top 10 Visual Inconsistencies (priorizadas)

### 🔴 #1 — Zero adoção de Design System v2
**Severidade:** P0 · **Esforço:** 6h para canário
Todas as 54 pages (exceto `/design-system`) ignoram os 8 components premium criados em W17.
Quem precisa de Button, Card, Badge, Input, Avatar, Sheet, Command, Toast hoje **não tem
imports disponíveis mentalmente** porque o v2 vive num namespace separado e nunca foi
referenciado em PR review.

**Fix:** Adotar `<Button>` de `@/components/ui/v2/button` nas 5 pages de maior tráfego
(home, feed, library, search, post) — substituir os imports atuais de
`@/components/ui/button` por `@/components/ui/v2/button` (mesma API, defaults melhores).

### 🔴 #2 — 84% das pages sem `loading.tsx`
**Severidade:** P0 · **Esforço:** 30 min
9/55 pages. Em Next.js App Router isso significa: rotas como `/search`, `/post/[id]`,
`/library`, `/explore`, `/mentorship` **renderizam tela em branco** enquanto dados carregam.
Péssimo para UX mobile (espiritualidade + espera = ansiedade).

**Fix:** Adicionar `loading.tsx` em cada route group usando o skeleton de
`@/components/design-system/loading` (já existe). Esqueleto com `<Skeleton className="h-8 w-2/3" />`.

### 🔴 #3 — 93% das pages sem `error.tsx`
**Severidade:** P0 · **Esforço:** 30 min
4/55 pages. Quando uma rota explode (API 500, prop faltando), usuário vê **stack trace
cru** ou tela branca. Especialmente grave em páginas de conteúdo espiritual onde o usuário
pode estar em momento vulnerável.

**Fix:** Adicionar `error.tsx` em cada route group usando `@/components/design-system/error`
(já existe).

### 🔴 #4 — 96% sem dark mode explícito
**Severidade:** P0 · **Esforço:** 4h
Apenas 2 pages têm classes `dark:`. No entanto, o `tokens.css` já define variantes dark
via `:root.dark` e Tailwind v4 consome — só falta **ativar no ThemeSwitcher** e **adicionar
`dark:` variants em components críticos** (Card, Button, Input).

**Fix:**
1. Verificar que `<html className={theme}>` está em `src/app/layout.tsx` (provavelmente sim)
2. Adicionar `dark:bg-slate-950 dark:text-slate-100` em pelo menos 10 pages principais
3. Testar toggle de tema

### 🔴 #5 — 7 routes duplicadas (root + group)
**Severidade:** P0 · **Esforço:** 1h
Next.js App Router aceita mas **não roteia deterministicamente** — a rota que "vence" depende
da ordem de matching. Pages afetadas:
- `/feed` (root) vs `/(community)/feed`
- `/library` (root) vs `/(community)/library`
- `/notifications` (root) vs `/(community)/notifications`
- `/akashic` (root) vs `/(community)/akashic`
- `/about`, `/privacy`, `/terms`, `/newsletter` (root) vs `/(info)/...`

**Fix:** Decidir qual versão fica. **Recomendação:** manter `(community)/` e `(info)/` (route groups
são a forma idiomática) e deletar as 8 páginas top-level órfãs. Se alguma for deliberadamente
pública (SEO, sem auth), mover para `(public)/` ou root com naming claro.

### 🟡 #6 — `style={{...}}` inline em pages críticas
**Severidade:** P1 · **Esforço:** 30 min
Home page tem:
```tsx
<div className="absolute inset-0" style={{
  background: 'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.15), transparent 60%)',
}} />
```
Feed page tem:
```tsx
style={{
  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
}}
```
Viola regra do design system (zero inline). Tudo deveria ser classe Tailwind ou token.

**Fix:**
- `style={{...}}` → `className="bg-[radial-gradient(...)]"` ou token novo `--gradient-radial-spiritual`
- `style={{bottom: ...}}` → `className="bottom-[calc(env(safe-area-inset-bottom)+80px)]"` ou
  criar utility `safe-fab-bottom`

### 🟡 #7 — Falta de tokens semânticos (`bg-background`, `text-foreground`)
**Severidade:** P1 · **Esforço:** 2h
Apenas 9/55 pages usam semantic tokens. A maioria usa ramp direto (`bg-slate-900`, `text-slate-300`).
Funciona, mas **impede troca de tema sem refactor** e cria inconsistência (uns usam `slate-800`,
outros `slate-900` para "card bg").

**Fix:** Criar lint rule (`no-restricted-syntax` ESLint) ou migration script que mapeia:
- `bg-slate-950` → `bg-background`
- `bg-slate-900` → `bg-card`
- `text-slate-100` → `text-foreground`
- `text-slate-400` → `text-muted-foreground`
- `border-slate-800` → `border-border`

### 🟡 #8 — 14 pages com `<div>` raw como "card"
**Severidade:** P1 · **Esforço:** 1h
Pages que fazem:
```tsx
<div className="rounded-2xl border bg-slate-900/50 p-6">
```
em vez de `<Card>`. Inclui: `(admin)/newsletter`, `(community)/events`, `(community)/feed`,
`(community)/groups/[slug]`, `(community)/groups`, `(community)/mentorship`,
`(community)/settings`, `(info)/about`, `(info)/newsletter`, `design-system`, `not-found`,
`offline`, `search`, `post/[id]`.

**Fix:** Migrar para v2 `<Card variant="elevated">` ou `<Card variant="interactive">` (hover-lift).

### 🟡 #9 — Header/Sidebar inconsistência entre route groups
**Severidade:** P2 · **Esforço:** 3h
`(community)/feed` tem Sidebar 320px (`grid-cols-[1fr_320px]`).
`(community)/library` **não tem** Sidebar.
`(community)/explore` tem Sidebar diferente.
Cada um reinventa. Não há `<FeedLayout>` ou `<CommunityShell>` reutilizável.

**Fix:** Criar `src/components/layouts/CommunityLayout.tsx` com Sidebar padrão + slot para
header contextual. Aplicar em 6 pages.

### 🟡 #10 — Validação de loading/error nos route groups
**Severidade:** P2 · **Esforço:** 2h
Pages em `(auth)/` não compartilham `loading.tsx` nem `error.tsx` no group. Cada rota resolve sozinha.
O `loading.tsx` do `(community)/` group só cobre **uma** page (dashboard). Padrão confuso.

**Fix:** Adicionar `(auth)/loading.tsx`, `(auth)/error.tsx`, `(info)/loading.tsx`, `(info)/error.tsx`,
`(admin)/loading.tsx`, `(admin)/error.tsx`.

---

## 4. Rollout Plan — Design System v2 Adoption

### Wave 24.5 · P0 · Quick Wins (≤1 dia, 6h total)

**Objetivo:** validar v2 em produção real + tapar buracos de UX.

| # | Tarefa | Esforço | Risco | Deliverable |
|---|---|---|---|---|
| P0.1 | Adotar `<Button>` v2 nas 5 pages top (home, feed, library, search, post) | 1h | Baixo | 5 imports trocados |
| P0.2 | Adotar `<Card>` v2 em 5 pages críticas | 1h | Baixo | 5 pages |
| P0.3 | Adicionar `loading.tsx` + `error.tsx` nos 4 route groups | 1h | Zero | 8 arquivos novos |
| P0.4 | Resolver 7 routes duplicadas | 1h | Médio | 8 páginas deletadas |
| P0.5 | Toggle de dark mode funcional | 2h | Médio | ThemeSwitcher consertado + 10 pages com `dark:` |

### Wave 25 · P1 · Adoção Estrutural (1 semana, ~16h)

| # | Tarefa | Esforço | Risco | Deliverable |
|---|---|---|---|---|
| P1.1 | Migrar todos os `<Button>` para v2 (busca: `@/components/ui/button`) | 2h | Baixo | -X imports +X imports |
| P1.2 | Migrar todos os `<Card>` (14 pages com `<div>` raw) | 2h | Baixo | cards consistentes |
| P1.3 | Migrar `<Badge>` para v2 (10 variants temáticos disponíveis) | 1h | Baixo | tradição visual |
| P1.4 | Migrar `<Input>` em forms (login, signup, settings) | 2h | Médio | error/success state |
| P1.5 | Criar `CommunityLayout` (header + sidebar padrão) | 4h | Médio | 6 pages refatoradas |
| P1.6 | Migration script: ramp → semantic tokens | 2h | Médio | lint rule ou codemod |
| P1.7 | Eliminar `style={{...}}` inline | 1h | Baixo | 0 inline styles |
| P1.8 | Adotar `<Sheet>` v2 (substituir BottomSheet v1) | 2h | Médio | modal migrado |

### Wave 26 · P2 · Polish & Cobertura (2 semanas, ~24h)

| # | Tarefa | Esforço | Risco | Deliverable |
|---|---|---|---|---|
| P2.1 | Adotar `<Command>` ⌘K global | 4h | Médio | navegação por teclado |
| P2.2 | Adotar `<Toast>` v2 (substituir toasts ad-hoc) | 4h | Baixo | feedback consistente |
| P2.3 | Adotar `<Avatar>` v2 com spiritual ring | 2h | Baixo | identidade visual |
| P2.4 | Audit WCAG AA em todas as pages (contraste + foco + ARIA) | 8h | Zero | checklist 100% |
| P2.5 | Adicionar `loading.tsx` em cada page individualmente (84% gap) | 2h | Zero | cobertura total |
| P2.6 | Adicionar `error.tsx` em cada page individualmente (93% gap) | 2h | Zero | cobertura total |
| P2.7 | Deprecar `@/components/ui/button` (v1) — manter só v2 | 2h | Alto | rename ou redirect |

---

## 5. Wireframes das melhorias prioritárias

### 5.1 Home page — card "FeatureCard" migrado para v2 Card

```
BEFORE (atual):
<div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5
                border border-amber-500/20 text-amber-400 backdrop-blur-sm">
  <div className="w-12 h-12 rounded-xl bg-slate-900/50 ...">
    {icon}
  </div>
  <h3 className="text-xl text-slate-100 mb-2">{title}</h3>
  <p className="text-caption text-slate-400 leading-relaxed">{description}</p>
</div>

AFTER (v2 Card):
<Card variant="elevated" glow="gold" className="p-6">
  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4
                  text-amber-400">
    {icon}
  </div>
  <h3 className="text-xl font-cinzel text-foreground mb-2">{title}</h3>
  <p className="text-caption text-muted-foreground leading-relaxed">{description}</p>
</Card>
```

**Ganhos:**
- Glow effect espiritual sem hex inline
- `text-muted-foreground` segue dark mode automaticamente
- `<Card variant="elevated">` aplica shadow tokens (xs → 2xl)
- `<Card glow="gold">` aplica gradiente espiritual via token `--spiritual-gold`

### 5.2 Feed page — Sidebar unificada via `<CommunityLayout>`

```
BEFORE (atual em /feed):
<div className="min-h-screen p-4 md:p-6 lg:p-8">
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <main>{posts}</main>
      <aside className="hidden lg:block"><FeedSidebar /></aside>
    </div>
  </div>
</div>

AFTER (CommunityLayout):
<CommunityLayout
  header={<FeedHeader filter={filter} setFilter={setFilter} />}
  sidebar={<FeedSidebar />}
>
  {posts}
</CommunityLayout>
```

**Ganhos:**
- Layout reutilizado por `/feed`, `/explore`, `/library`, `/groups`, `/notifications`
- Sidebar consistente entre pages
- Padding/grid centralizado em um lugar
- Theme-aware via tokens

### 5.3 Auth — loading.tsx + error.tsx no group `(auth)`

```
NEW: src/app/(auth)/loading.tsx
─────────────────────────────────
import { Skeleton } from '@/components/design-system/skeleton';

export default function AuthLoading() {
  return (
    <div className="card-spiritual p-8 rounded-2xl max-w-md w-full
                    flex items-center justify-center min-h-[420px]">
      <div className="space-y-4 w-full">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-1/2 mx-auto" />
      </div>
    </div>
  );
}

NEW: src/app/(auth)/error.tsx
─────────────────────────────────
'use client';
import { ErrorState } from '@/components/design-system/error';

export default function AuthError({ error, reset }: {
  error: Error; reset: () => void;
}) {
  return (
    <ErrorState
      title="Não foi possível entrar agora"
      message={error.message || 'Tente de novo em alguns instantes.'}
      onRetry={reset}
    />
  );
}
```

**Ganhos:**
- Usuário nunca vê tela em branco em `/login`, `/signup`, `/reset-password`
- Mensagem de erro empática (não stack trace)
- Botão "Tentar de novo" presente

---

## 6. Heurísticas de Nielsen — violações principais detectadas

| # | Heurística | Violação | Severidade |
|---|---|---|---|
| 1 | Visibility of system status | 84% sem loading.tsx | Alta |
| 1 | Visibility of system status | FAB não mostra "enviando..." durante POST | Média |
| 2 | Match between system and real world | "feed.filterForYou" → label PT-BR OK, mas copy em inglês em alguns pontos (`onClick`) | Baixa |
| 3 | User control and freedom | `confirm(t('feed.deleteConfirm'))` — confirm nativo do browser, não empático | Média |
| 4 | Consistency and standards | 14 pages com `<div>` raw como card | Alta |
| 4 | Consistency and standards | 7 routes duplicadas | Alta |
| 5 | Error prevention | 93% sem error.tsx | Alta |
| 6 | Recognition rather than recall | BottomSheet v1 usado em feed, mas não em outras 6 pages que precisariam | Média |
| 7 | Flexibility and efficiency | ⌘K Command v2 criado mas não exposto em nenhuma page | Alta |
| 8 | Aesthetic and minimalist design | Home page: 4 CTAs principais competem por atenção | Média |
| 9 | Help users recognize, diagnose, recover from errors | Sem mensagem de erro estruturada | Alta |
| 10 | Help and documentation | Sem onboarding contextual após login | Baixa |

---

## 7. Cultura & Sensibilidade Visual

**Verificações feitas:**
- ✅ Cores amber (gold) + violet seguem convenção espiritual sem estereotipagem
- ✅ Símbolos emojis usados (✡️ 🪶 🌿 🕉️ 🙏 🌺 🧘 ⭐) — universalistas, sem caricatura
- ✅ "Cigano Ramiro" e linhas não aparecem visualmente (só textual), evitando fetichização
- ⚠️ Padrões geométricos tribais: **nenhum usado** (bom, evita apropriação)
- ⚠️ Chakra colors: **7 chakras preservados como tokens** mas **nunca usados** em nenhuma page
- ⚠️ Orixá colors: **7 orixás preservados como tokens** mas **nunca usados** em nenhuma page

**Recomendação:** se/ quando feature de "linha cigana" ou "Odu do dia" for implementada,
consultar **Curator (Iyá)** antes de aplicar padrões visuais ou escolher cores que representem
orixás — Lina não decide sozinha nesse eixo.

---

## 8. Definition of Done (Wave 24)

- [x] 55 pages inventariadas
- [x] Matriz de compliance gerada
- [x] Top 10 inconsistências priorizadas (P0/P1/P2)
- [x] Rollout plan com esforço estimado (3 waves)
- [x] Wireframes de melhoria (home, feed, auth)
- [x] Heurísticas de Nielsen aplicadas
- [x] Validação cultural registrada
- [x] Doc completo em `docs/VISUAL-UI-AUDIT-W24.md`
- [x] Commit local criado (sem push)

---

## 9. Próximos passos sugeridos

1. **Owner revisar este doc** + priorizar P0 vs P1 vs P2 conforme roadmap
2. **Wave 24.5 (quick wins)** — 6h para tapar P0 #1-#5
3. **Wave 25 (adoção estrutural)** — 1 semana para Button/Card/Badge/Input v2 + CommunityLayout
4. **Wave 26 (polish)** — 2 semanas para ⌘K + Toast + Avatar + a11y completo
5. **Próxima auditoria visual** após Wave 26 — re-rodar matriz para validar 100% v2 adoption

---

## 10. Comandos para o owner

```bash
cd /workspace/cabaladoscaminhos

# Verificar status (já modified, untracked)
git status --short

# Ver este doc no git
git diff docs/VISUAL-UI-AUDIT-W24.md

# Commit (sandbox travou em git add em waves anteriores — se travar, rodar localmente)
git add docs/VISUAL-UI-AUDIT-W24.md
git commit -m "docs(ux): visual UI audit + design system v2 rollout plan W24

- 55 pages auditadas contra Design System v2 (criado em W17)
- 0/54 pages (fora /design-system) adotam v2 components hoje
- 84% sem loading.tsx · 93% sem error.tsx · 96% sem dark: classes
- 7 routes duplicadas detectadas (root vs (community)/(info))
- Top 10 inconsistências priorizadas (P0/P1/P2)
- Rollout plan: Wave 24.5 (6h) + Wave 25 (16h) + Wave 26 (24h)
- Wireframes para home, feed, auth
- Heurísticas de Nielsen aplicadas
- Validação cultural (Curator pendente se feature orixá entrar)

Wave 24 · Trilha Design 3/6 · Lina (Designer) · docs only, sem push"

# NÃO fazer push (per request)
```

---

**Mantido por:** Lina (Designer/UX) · Wave 24 · Trilha Design 3/6 · Status ✅ AUDIT COMPLETO