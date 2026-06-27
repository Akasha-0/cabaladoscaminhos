# Design System — Akasha Portal

> 8 componentes base · tokens semânticos · variantes espirituais · mobile-first

A "fonte da verdade" do design system do projeto. Tudo aqui foi escrito para ser **consistente** com `globals.css` (Tailwind v4 + CSS variables) e **type-safe** via `tokens.ts`.

---

## 📦 O que está incluído

| Arquivo | Função |
|---------|--------|
| `src/lib/design-system/tokens.ts` | Tokens em TypeScript (palette, spacing, typography, radius, shadows, motion, breakpoints, z-index, semantic + component tokens) |
| `src/components/design-system/button.tsx` | Button (wrapper shadcn-style) |
| `src/components/design-system/card.tsx` | Card compound (Header / Title / Description / Content / Footer / Action) |
| `src/components/design-system/input.tsx` | Input (wrapper shadcn-style) |
| `src/components/design-system/badge.tsx` | Badge (wrapper shadcn-style) |
| `src/components/design-system/divider.tsx` | Divider (horizontal + vertical + 4 variants + label opcional) |
| `src/components/design-system/loading.tsx` | Loading (spinner · skeleton · overlay) |
| `src/components/design-system/empty.tsx` | Empty (default + spiritual + minimal, com até 2 CTAs) |
| `src/components/design-system/error.tsx` | Error (3 severities · inline ou painel · retry embutido) |
| `src/components/design-system/index.ts` | Barrel — único ponto de import |
| `src/app/design-system/page.tsx` | **Storybook vivo** em `/design-system` |

**Tamanho total:** ~1.050 linhas de TS/TSX + 27KB de página showcase.

---

## 🚀 Como usar

### 1. Importação (recomendado)

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Badge,
  Divider,
  Loading,
  Empty,
  Error,
} from '@/components/design-system';
```

### 2. Tokens (quando precisar de valor programático)

```tsx
import {
  tokens,
  palette,
  semanticColor,
  spacing,
  duration,
  easing,
} from '@/lib/design-system/tokens';

// Em qualquer cálculo:
const cardBg = palette.slate[900];
const transitionDuration = duration.fast;
const gradientStops = `linear-gradient(135deg, ${palette.gold.DEFAULT}, ${palette.violet.DEFAULT})`;
```

### 3. Estilos com classes Tailwind (caso comum)

Os tokens são consumidos via CSS vars expostas pelo Tailwind v4 (`@theme {}` em `globals.css`). Use `bg-[var(--background)]`, `text-[var(--spiritual-gold)]` ou os utilitários padrão (`bg-card`, `text-foreground`).

---

## 🎨 Os 8 componentes base

### `<Button>`

7 variants + 6 sizes + suporte a ícone + estados (loading, disabled, focused).

```tsx
<Button>Ação primária</Button>
<Button variant="secondary">Secundária</Button>
<Button variant="outline" size="sm">Outline pequeno</Button>
<Button variant="destructive"><Trash2 /> Excluir</Button>
<Button variant="golden"><Sparkles /> Caminho dourado</Button>
<Button variant="golden-outline">Espiritual outlined</Button>
<Button variant="link">Texto com link</Button>
<Button variant="ghost">Sutil</Button>

{/* Sizes */}
<Button size="xs|sm|default|lg">…</Button>
<Button size="icon" aria-label="Enviar"><Send /></Button>
```

### `<Card>` + subcomponentes

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Subtítulo de apoio</CardDescription>
    <CardAction>
      <Button size="icon-sm" variant="ghost"><MoreHorizontal /></Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <p>Conteúdo principal…</p>
  </CardContent>
  <CardFooter>
    <Badge>novo</Badge>
    <Button size="sm">Continuar</Button>
  </CardFooter>
</Card>

{/* Variante compacta */}
<Card size="sm">…</Card>
```

### `<Input>`

```tsx
<Input placeholder="Nome completo" />
<Input type="email" defaultValue="" aria-invalid={false} />
<Input disabled placeholder="Bloqueado" />

{/* Com ícone (lucide-react) */}
<div className="relative">
  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <Input className="pl-8" placeholder="Buscar…" />
</div>
```

### `<Badge>`

```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Erro</Badge>
<Badge variant="ghost">Sutil</Badge>

{/* Customizado (espiritual) */}
<Badge className="bg-[var(--spiritual-gold-muted)] text-[var(--spiritual-gold-dark)]">
  <Sparkles className="mr-1 h-3 w-3" /> Golden
</Badge>
```

### `<Divider>`

```tsx
<Divider />
<Divider variant="subtle" thickness="medium" />
<Divider variant="spiritual" thickness="medium" />
<Divider variant="glow" thickness="thick" />
<Divider label="ou" />
<Divider orientation="vertical" />
<Divider orientation="vertical" thickness="medium" />
<Divider color="#8B5CF6" />
```

### `<Loading>`

3 variants + 3 sizes.

```tsx
{/* Spinner (default) */}
<Loading />
<Loading size="lg" message="Carregando jornada…" />

{/* Skeleton */}
<Loading variant="skeleton" lines={4} />

{/* Overlay (modal-style) */}
<Loading variant="overlay" message="Sincronizando com a comunidade…" />
```

### `<Empty>`

Para estados vazios, "sem resultados", "ainda não começou".

```tsx
<Empty
  icon={<Compass />}
  title="Nenhuma jornada iniciada"
  description="Comece sua primeira leitura."
  action={{ label: 'Iniciar', href: '/validacao' }}
  secondaryAction={{ label: 'Saber mais', href: '/explore' }}
/>

{/* Variante espiritual (fundo com gradiente dourado) */}
<Empty variant="spiritual" size="sm" title="Sem notificações" />
```

### `<Error>`

Para falhas recuperáveis (fetch / mutation). NÃO substitui Error Boundary.

```tsx
{/* Painel */}
<Error
  error={new Error('Network timeout')}
  onRetry={() => refetch()}
/>

{/* Inline */}
<Error
  inline
  size="sm"
  severity="warning"
  title="Sincronização atrasada"
  description="Algumas práticas podem não estar atualizadas."
  onRetry={() => syncNow()}
/>

{/* Critical */}
<Error
  severity="critical"
  title="Sessão expirada"
  retryLabel="Entrar"
  onRetry={() => signIn()}
/>
```

---

## 🪙 Tokens semânticos

| Categoria | Token | Onde usar |
|-----------|-------|-----------|
| Surface | `--background` · `--card` · `--popover` · `--muted` | Backgrounds de containers |
| Text | `--foreground` · `--muted-foreground` · `--primary` · `--destructive` | Texto padrão, secundário, marca, erro |
| Border | `--border` · `--input` · `--ring` | Divisórias, inputs, focus ring |
| Brand | `--primary` · `--secondary` (light/dark variants) | Ações de UI |
| Spiritual | `--spiritual-gold` · `--spiritual-violet` (com `-light`/`-dark`/`-muted`) | Contexto espiritual |
| Chakra | `palette.chakra.*` | Mapas de chakras (numerologia tântrica) |
| Orixá | `palette.orixa.*` | Calendário espiritual afro-brasileiro |

**Modo escuro** já está preparado — todos os tokens têm valor em `.dark`. Não duplique cores hard-coded.

---

## ⚡ Convenções

### ✅ Faça

- **Importe sempre via barrel** (`@/components/design-system`). Tree-shaking é automático.
- **Use tokens semânticos** (`var(--primary)`, não `#4338CA`).
- **Mantenha `globals.css` e `tokens.ts` em sincronia** ao adicionar cor / spacing / sombra nova.
- **Espelhe novos componentes** no storybook (`/design-system`) — é a documentação viva.
- **Respeite `prefers-reduced-motion`**: animações são desabilitadas globalmente em `globals.css` (regra `@media (prefers-reduced-motion: reduce)`).

### ❌ Evite

- Cores hex inline (use `var(--…)`).
- `font-size` numérico em CSS — use `tokens.fontSize`.
- Componentes próprios que duplicam o que já existe no design system.
- Modificar `globals.css` sem espelhar em `tokens.ts` (e vice-versa).

---

## 🧪 Como verificar mudanças

```bash
# 1. Type check (pega props fora do contrato)
pnpm tsc --noEmit

# 2. Lint
pnpm lint

# 3. Subir dev server e abrir /design-system
pnpm dev
# → http://localhost:3000/design-system

# 4. Storybook page é client-component + 'use client' — fica fora do SSR estático.
```

---

## 🛣️ Roadmap (próximos passos sugeridos)

| # | Item | Por quê |
|---|------|---------|
| 1 | Testes Vitest para cada componente (render + props) | Garantir que mudanças não quebrem contratos |
| 2 | Storybook Storybook real (Chromatic / Ladle) | Além da página `/design-system` |
| 3 | Migrar `<EmptyState>` em `src/components/ui/empty-state.tsx` → re-exportar do DS | Consolidar superfície |
| 4 | Adicionar `<Toast>` (snackbar com fila) | Feedback não-modal |
| 5 | Adicionar `<Tooltip>` + `<Popover>` | Acessibilidade em ícones |
| 6 | Adicionar `<Tabs>` + `<Accordion>` | Estruturas comuns |
| 7 | Adicionar `<Dialog>` (modal) | Confirmações destrutivas |

> **Princípio:** cada novo componente só entra se for usado em ≥ 2 lugares diferentes do app (regra DRY).

---

## 🔗 Referências cruzadas

- `globals.css` (Tailwind v4 theme) → mesmas variáveis
- `src/app/design-system/page.tsx` → showcase viva
- `src/lib/utils.ts` → `cn()` (clsx + tailwind-merge)
- `class-variance-authority` → variantes tipadas para Button / Badge
- `@base-ui/react` → primitivos de Button / Input
- ADR-0001 (Next.js 16) → build pipeline

---

**Mantido por:** time de frontend · **Status:** foundation v0.1 · **Próxima revisão:** quando o 5º componente novo entrar
