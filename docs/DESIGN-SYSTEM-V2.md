# Design System v2 — Akasha Portal

> Modernized 2026-06-27 · Wave 17 · Trilha Design 2/6
> 12 ramps OKLCH · 8 componentes premium · mobile-first · espiritualidade preservada

A evolução do [Design System v1](./DESIGN-SYSTEM.md) — agora com tokens perceptualmente uniformes (OKLCH), componentes premium inspirados em **Linear**, **Vercel**, **Stripe** e **Apple HIG**, e zero quebra de contrato com a base existente (v1 + v2 coexistem).

---

## 🎯 Filosofia

| Princípio | Decisão |
|-----------|---------|
| **Vibrancy perceptual** | OKLCH em vez de hex/Hex2 — luminância uniforme entre tons |
| **Mobile-first** | Touch targets ≥ 44px · bottom sheet > modal · safe-area-inset |
| **Espiritualidade honesta** | Gold (Cigano Ramiro) + Violet (Cabala) preservados como tokens semânticos |
| **Sem regressão** | v1 (`src/components/ui/`) continua funcional — v2 (`src/components/ui/v2/`) é aditiva |
| **Acessibilidade por padrão** | Focus ring visível · `aria-invalid`/`aria-describedby` · `prefers-reduced-motion` |
| **Inspiração 2026** | Linear (depth + glow) · Vercel (sharp focus) · Stripe (clean hierarchy) · Apple HIG (bottom sheet) |

---

## 🎨 Tokens — OKLCH Ramps

### Paleta de 12 ramps × 10 shades

Todas as cores são definidas em OKLCH (Lightness, Chroma, Hue) — space de cor perceptual que garante vibrancy consistente entre tons. Shade 500 é sempre o "default" da ramp.

| Ramp | Uso principal | Hue |
|------|---------------|-----|
| **slate** | UI base neutra fria | 247° |
| **gray** | True neutral | 286° |
| **amber** | Warm accent | 92° |
| **yellow** | Sacred Gold (Cigano Ramiro) | 86° |
| **violet** | Primary (Cabala) | 293° |
| **purple** | Chakra crown / mystical | 308° |
| **emerald** | Sucesso / cura | 156° |
| **rose** | Love / error soft | 12° |
| **red** | Destrutivo | 17° |
| **orange** | Fogo / transformação | 73° |
| **sky** | Chakra throat / info | 237° |
| **teal** | Sabedoria | 181° |
| **indigo** | Third eye | 272° |

**Acesso via Tailwind v4 (`@theme`):**
```tsx
<div className="bg-amber-500 text-amber-950" />
<div className="border-violet-300/40" />
```

**Acesso via CSS variables:**
```css
.my-element {
  background: var(--amber-500);
  border-color: oklch(from var(--violet-500) l c h / 0.4);
}
```

### Tokens semânticos

Todos os tokens do v1 estão preservados, agora em OKLCH:

```css
/* Surface */
--background, --foreground, --card, --card-foreground
--popover, --popover-foreground

/* Brand */
--primary, --primary-foreground      /* violet-600 → violet-400 dark */
--secondary, --secondary-foreground
--accent, --accent-foreground        /* yellow-500 → yellow-400 dark */

//* Status (NOVO no v2) */
--success, --success-foreground      /* emerald */
--warning, --warning-foreground      /* orange */
--info, --info-foreground            /* sky */
--destructive, --destructive-foreground  /* red */

/* Border + Focus */
--border, --input, --ring

/* Espiritual (preservado) */
--spiritual-gold, --spiritual-gold-dark, --spiritual-gold-light,
--spiritual-gold-glow, --spiritual-gold-muted
--spiritual-violet, --spiritual-violet-dark, --spiritual-violet-light,
--spiritual-violet-glow

/* Chakras (preservado) */
--chakra-root, --chakra-sacral, --chakra-solar, --chakra-heart,
--chakra-throat, --chakra-third-eye, --chakra-crown

/* Orixás (preservado) */
--orixa-sun, --orixa-moon, --orixa-mars, --orixa-mercury,
--orixa-jupiter, --orixa-venus, --orixa-saturn
```

---

## 📐 Spacing Scale

Base 4px, granularidade fina (0 → 96):

| Token | Valor | px |
|-------|-------|-----|
| `--space-0` | 0 | 0 |
| `--space-1` | 0.25rem | 4 |
| `--space-2` | 0.5rem | 8 |
| `--space-3` | 0.75rem | 12 |
| `--space-4` | 1rem | 16 |
| `--space-6` | 1.5rem | 24 |
| `--space-8` | 2rem | 32 |
| `--space-12` | 3rem | 48 |
| `--space-16` | 4rem | 64 |
| `--space-24` | 6rem | 96 |

**Acesso:** `className="p-4 gap-2 mt-6"` (Tailwind v4 utility) ou `var(--space-4)` em CSS.

---

## 🟢 Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | 0.25rem (4px) | Chips, tags |
| `--radius-md` | 0.5rem (8px) | Buttons, inputs |
| `--radius-lg` | 0.75rem (12px) | Cards |
| `--radius-xl` | 1rem (16px) | Modals |
| `--radius-2xl` | 1.5rem (24px) | Hero, feature |
| `--radius-3xl` | 2rem (32px) | Cosmic |
| `--radius-full` | 9999px | Pills, avatars |

---

## 🌫 Shadow Scale

Contexto de elevação explícito (Material Design-inspired):

| Token | Elevação | Uso |
|-------|----------|-----|
| `--shadow-xs` | 1dp | Inline hints |
| `--shadow-sm` | 4dp | Cards raised |
| `--shadow-md` | 8dp | Dropdowns |
| `--shadow-lg` | 12dp | Popovers |
| `--shadow-xl` | 16dp | Modals |
| `--shadow-2xl` | 24dp | Dialogs críticos |
| `--shadow-gold` | glow | Ações espirituais |
| `--shadow-violet` | glow | Estados místicos |
| `--shadow-cosmic` | ambient | Background depth |

---

## ✍️ Font Scale

Modular (1.250 — Major Third), line-heights otimizados:

| Token | Tamanho | Line-height | Uso |
|-------|---------|-------------|-----|
| `--font-size-xs` | 12px | 18 | Captions, badges |
| `--font-size-sm` | 14px | 20 | Helper text |
| `--font-size-base` | 16px | 24 | Body |
| `--font-size-lg` | 18px | 28 | Subheadings |
| `--font-size-xl` | 20px | 28 | H4 |
| `--font-size-2xl` | 24px | 32 | H3 |
| `--font-size-3xl` | 30px | 36 | H2 |
| `--font-size-4xl` | 36px | 40 | H1 |
| `--font-size-5xl` | 48px | 48 | Display |

Fontes do projeto: Raleway (sans), Cormorant (serif), Cinzel (display), Im Fell (accent).

---

## 🎬 Animation Tokens

**Duration:**
```css
--duration-instant: 75ms;   /* micro-interactions */
--duration-fast:    150ms;  /* hover, focus */
--duration-normal:  250ms;  /* default */
--duration-slow:    400ms;  /* modals, sheets */
--duration-slower:  600ms;  /* page transitions */
```

**Easing:**
```css
--ease-out:        cubic-bezier(0, 0, 0.2, 1);   /* default */
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);  /* playful */
--ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);      /* linear-like */
--ease-in-out-sine: cubic-bezier(0.37, 0, 0.63, 1);    /* smooth */
```

**Reduced motion:** Globalmente desabilitado via `@media (prefers-reduced-motion: reduce)` em `tokens.css`.

---

## 🧩 Componentes v2 — 8 premium

Localização: `src/components/ui/v2/`. Import via barrel `@/components/ui/v2`.

### 1. `<Button>` — `button.tsx`

**8 variants:**
- `primary` — violet base, ação principal
- `secondary` — slate neutro
- `ghost` — transparente
- `outline` — borda visível
- `danger` — destructive vermelho
- `link` — texto com underline
- `gold` — gradient sagrado (Cigano Ramiro)
- `violet` — gradient místico (Cabala)

**4 sizes:** `sm` (32px), `md` (40px), `lg` (48px), `icon` (40px quadrado).

**Anatomia:**
```tsx
<Button
  variant="gold"             // variant
  size="lg"                  // size
  loading={isSubmitting}     // spinner state
  leftIcon={<Sparkles />}    // adornment
  rightIcon={<ArrowRight />} // adornment
  disabled={!isValid}        // state
  aria-label="Iniciar leitura"
>
  Começar jornada
</Button>
```

**Features:**
- Focus ring 2px com offset 2px (visível em qualquer fundo)
- `active:scale-[0.97]` — feedback tátil
- `disabled:opacity-50` + `pointer-events-none`
- Spinner automático em `loading`
- Touch target ≥ 44px em `lg`

---

### 2. `<Card>` — `card.tsx`

**3 elevations:** `flat` (ring only) · `raised` (sm shadow) · `floating` (lg shadow)

**2 variant modes:** `default` · `gold` · `violet` (gradient border sutil)

**Compound API:**
```tsx
<Card elevation="raised" interactive variant="gold" padding="md">
  <CardHeader>
    <CardTitle>Numerologia Cabalística</CardTitle>
    <CardDescription>Caminho de vida 7 — introspecção</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Conteúdo principal aqui…</p>
  </CardContent>
  <CardFooter>
    <Badge variant="cabala">Cabala</Badge>
    <Button size="sm" variant="ghost">Detalhes</Button>
  </CardFooter>
</Card>
```

**`interactive={true}`** adiciona:
- `cursor-pointer`
- `hover:-translate-y-0.5` (lift)
- `hover:shadow-[var(--shadow-xl)]`
- `active:translate-y-0` (press down)

---

### 3. `<Badge>` — `badge.tsx`

**10 variants temáticos:**

| Variant | Cor | Uso |
|---------|-----|-----|
| `default` | primary violet | Tags genéricas |
| `secondary` | slate | Neutro |
| `outline` | border only | Tags externas |
| `success` | emerald | Status positivo |
| `warning` | orange | Atenção |
| `danger` | red | Erro |
| `info` | sky | Informativo |
| `cabala` | violet light | Contexto cabalístico |
| `ifa` | purple light | Contexto Ifá |
| `reiki` | emerald | Cura sutil |
| `astrologia` | sky/indigo | Contexto astrológico |
| `cigano` | gold muted | Contexto Cigano Ramiro |

```tsx
<Badge variant="cabala" icon={<Star className="size-3" />}>Cabala</Badge>
<Badge variant="success" dot>Ativo</Badge>
```

---

### 4. `<Input>` — `input.tsx`

**Anatomia completa:**
```tsx
<Input
  label="Nome completo"            // futuro — labelId
  placeholder="Conforme certidão"
  leftIcon={<User />}              // adornment
  helperText="Como aparece no RG"   // texto de apoio
  error="Nome inválido"             // vira aria-invalid + ring destructive
  success={isValid}                 // checkmark verde
  disabled={loading}                // state
  inputSize="lg"                    // sm | md | lg
/>
```

**Estados:**
- Default — borda slate
- Hover — borda intensificada
- Focus — ring 2px violet/30
- Error — borda + ring destructive + ícone AlertCircle
- Success — ícone CheckCircle verde
- Disabled — opacity 50 + bg muted

**Acessibilidade:**
- `aria-invalid` quando error
- `aria-describedby` apontando para helper/error
- Touch target ≥ 44px (size `lg`)
- Helper text sob o input (separado do erro)

---

### 5. `<Avatar>` — `avatar.tsx`

**5 sizes:** `xs` (24px) · `sm` (32px) · `md` (40px) · `lg` (48px) · `xl` (64px)

**Status indicator:** `online` · `offline` · `away` · `busy` (dot bottom-right com ring)

**Spiritual ring:** `gold` · `violet` · `primary` (2px ring + offset)

```tsx
<Avatar size="md" status="online" ring="gold">
  <AvatarImage src="/avatar.jpg" alt="Maria" />
  <AvatarFallback name="Maria Santos" />
</Avatar>

<Avatar size="xl">
  <AvatarFallback name="João" />
</Avatar>
```

**Fallback inteligente:** Iniciais automáticas (primeira letra de até 2 palavras) + gradient gold→violet determinístico.

---

### 6. `<Sheet>` — `sheet.tsx`

**Pattern mobile-first:** bottom sheet default (drag handle affordance, safe-area-inset).

**4 sides:** `top` · `right` · `bottom` · `left`

```tsx
const [open, setOpen] = useState(false)

<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent side="bottom"> {/* mobile default */}
    <SheetHeader>
      <SheetTitle>Compartilhar leitura</SheetTitle>
      <SheetDescription>Escolha o canal</SheetDescription>
    </SheetHeader>
    <SheetBody>{/* scrollable content */}</SheetBody>
    <SheetFooter>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
      <Button variant="primary">Compartilhar</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

**Features:**
- Esc fecha · click no backdrop fecha
- Body scroll lock enquanto aberto
- Drag handle visual em `bottom` (não precisa de swipe lib — use radix-ui ou framer-motion se precisar)
- Safe-area-inset respeitado (iOS notch)
- `pb-[env(safe-area-inset-bottom)]` automático

---

### 7. `<Command>` — `command.tsx`

**⌘K command palette** (também Ctrl+K).

```tsx
const [open, setOpen] = useState(false)

<Command
  open={open}
  onOpenChange={setOpen}
  items={[
    { id: 'new', label: 'Nova leitura', group: 'Jornada', icon: <Plus />, shortcut: '⌘N', onSelect: () => {} },
    { id: 'cabala', label: 'Cabala', group: 'Tradições', icon: <Star />, onSelect: () => {} },
    { id: 'cigano', label: 'Baralho Cigano', group: 'Tradições', icon: <Sparkles />, onSelect: () => {} },
  ]}
  placeholder="Buscar rituais, símbolos, orixás…"
/>
```

**Features:**
- ⌘K global shortcut (auto-bind)
- Fuzzy search (case-insensitive)
- Grouped categories (renderiza header por grupo)
- Keyboard nav: ↑↓ navega · Enter seleciona · Esc fecha
- Auto-focus input ao abrir
- Gold accent no item ativo (espiritual)

---

### 8. `<Toast>` — `toast.tsx`

**Hook-based API:**
```tsx
// 1. Wrap app
<ToastProvider>{children}</ToastProvider>

// 2. Use anywhere
const { toast } = useToast()

toast({
  severity: 'success',
  title: 'Leitura salva',
  description: 'Sua consulta foi registrada no diário.',
})

toast({ severity: 'error', title: 'Erro de conexão', duration: 0 }) // persistent

toast({ severity: 'warning', title: 'Sessão expirando em 5min' })
```

**4 severities:**
- `success` — border-left gold + check icon
- `info` — border-left sky + info icon
- `warning` — border-left orange + alert icon
- `error` — border-left destructive + x icon

**Features:**
- Auto-dismiss (default 5s, configurável)
- Stack manager (max 5 visíveis, FIFO)
- Manual close button
- `aria-live="polite"` + `role="status"`/`"alert"` por severity
- Slide-in from right (top-right viewport)
- `var(--z-toast)` (camada dedicada, acima de modais)

---

## 🎯 Do's & Don'ts

### ✅ Faça

```tsx
// Use tokens semânticos
<Button variant="primary">Ação</Button>
<div className="bg-[var(--card)] text-[var(--card-foreground)]">

// Mobile-first touch targets
<Button size="lg" /> {/* 48px */}

// Compondo tokens
<Card elevation="raised" interactive variant="gold">
  <Badge variant="cabala">Tema</Badge>
</Card>

// Spiritual com propósito
<Button variant="gold" leftIcon={<Sparkles />}>Caminho dourado</Button>

// Reduced motion respeitado
<Sheet> {/* duração vem do token */}
```

### ❌ Não faça

```tsx
// ❌ Hex inline
<div style={{ background: '#C9A227' }} />

// ❌ Tamanho hard-coded fora do scale
<button className="h-[37px] px-[13px]" />

// ❌ Cor de chakra sem contexto
<Badge style={{ color: '#EF4444' }}>Root</Badge> {/* use chakra-root token */}

// ❌ Touch target < 44px (mobile)
<button className="h-6 w-6" />

// ❌ Modal para filtros mobile (use Sheet)
<Dialog>...</Dialog>

// ❌ Inventar variantes sem documentar
<Button className="bg-pink-300">Salvar</Button>
```

---

## 🔄 Migração v1 → v2

| v1 | v2 equivalente | Mudança |
|----|----------------|---------|
| `<Button variant="golden">` | `<Button variant="gold">` | Rename · gold → amber/yellow gradient |
| `<Button variant="default">` | `<Button variant="primary">` | Rename · mais explícito |
| `<Card size="sm">` | `<Card padding="sm">` | Rename · semântica mais clara |
| `<Input aria-invalid>` | `<Input error="...">` | Helper text embutido |
| `<Avatar>` | `<Avatar ring="gold" status="online">` | Novas props |
| `<BottomSheet>` | `<Sheet side="bottom">` | API unificada (4 sides) |
| (não existia) | `<Command>` | ⌘K palette nova |
| (não existia) | `<Toast>` + `useToast()` | Hook-based |

**Coexistência:** v1 e v2 podem ser usados no mesmo projeto. **Recomendação:** novas features → v2. Manutenção → manter v1 até refactor planejado.

---

## 📂 Estrutura de Arquivos

```
src/
├── styles/
│   └── tokens.css                          # Fonte da verdade — 12 ramps OKLCH + semantic
├── components/
│   ├── ui/                                  # v1 (preservado, não deprecated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── ui/v2/                               # v2 (NOVO — aditivo)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── avatar.tsx
│   │   ├── sheet.tsx
│   │   ├── command.tsx
│   │   ├── toast.tsx
│   │   └── index.ts                         # barrel
│   └── design-system/                       # wrappers shadcn-style (preservado)
│       └── ...
└── app/
    └── globals.css                          # @theme Tailwind v4 — consome tokens.css

docs/
├── DESIGN-SYSTEM.md                         # v1 (foundation)
└── DESIGN-SYSTEM-V2.md                      # este arquivo
```

---

## 🧪 Como verificar mudanças

```bash
# 1. Type check (pega props fora do contrato)
pnpm tsc --noEmit

# 2. Lint
pnpm lint

# 3. Storybook vivo
pnpm dev
# → http://localhost:3000/design-system

# 4. Testes Vitest (TODO — backlog)
pnpm test:run
```

---

## 📚 Referências de Inspiração

| Sistema | Aprendizado aplicado |
|---------|----------------------|
| **Linear** | Subtle hover lifts · depth + glow em cards · focus rings precisos |
| **Vercel** | Sharp focus rings (3px ring-300 + offset) · clean monospace tracking |
| **Stripe** | Input error states claros · button hierarchy (primary > secondary > ghost) |
| **Apple HIG** | Bottom sheet pattern · safe-area-inset · drag handle affordance |
| **Raycast** | ⌘K command palette UX · grouped categories · keyboard nav |
| **Sonner** | Toast API minimal · auto-dismiss com timer |
| **GitHub** | Status indicators (online/offline dot) · avatar stacking |
| **Tailwind v4** | OKLCH nativo · @theme directive · spacing/typography utilities |

---

## 🔗 Cross-references Wave 17

- [`docs/TYPOGRAPHY-W17.md`](./TYPOGRAPHY-W17.md) — type scale pairing
- [`docs/ANIMATIONS-W17.md`](./ANIMATIONS-W17.md) — motion design patterns
- [`docs/RESPONSIVE-AUDIT-W17.md`](./RESPONSIVE-AUDIT-W17.md) — breakpoint strategy
- [`docs/JOURNEY-MAPS-W15.md`](./JOURNEY-MAPS-W15.md) — UX context
- [Wave 1 (DESIGN-SYSTEM.md)](./DESIGN-SYSTEM.md) — v1 baseline

---

**Mantido por:** time de frontend (Lina · designer) · **Status:** foundation v2.0 · **Próxima revisão:** após adicionar 3+ componentes novos OU após primeiro redesign de jornada