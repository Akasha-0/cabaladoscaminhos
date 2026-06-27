# 📐 Mobile Design Guide — Akasha Portal

> **Status:** ✅ GUIA OPERACIONAL
> **Data:** 2026-06-27
> **Branch:** `feat/mobile-pwa`
> **Foco:** Mobile-first com progressive enhancement

---

## 🎯 Filosofia

**Mobile-first ≠ "só encolhe desktop"**

Mobile-first é projetar **a melhor experiência possível em 320px** primeiro, depois expandir pra tablet e desktop. Não é "fazer caber em mobile" — é "começar pelo contexto mais restrito".

**Princípios:**

1. **Restrição gera foco** — 320px força hierarquia clara
2. **Touch é diferente de mouse** — sem hover, sem precisão pixel-perfect
3. **Conectividade é variável** — design funciona offline-first
4. **Atenção é fragmentada** — entrada e saída rápidas, estados salvos
5. **Contexto importa** — localização, hora, movimento

---

## 📏 Breakpoints

```ts
// Tailwind defaults (alinhados com nossa escolha)
sm:  640px   // mobile large → tablet pequeno
md:  768px   // tablet portrait
lg:  1024px  // tablet landscape / desktop pequeno
xl:  1280px  // desktop
2xl: 1536px  // desktop large
```

**Estratégia de design:**

| Viewport | Layout | Navigation |
|---|---|---|
| < 768px | Single column, full-width | Bottom nav (5 itens) |
| ≥ 768px | Two columns (sidebar + content) | Top nav (centered) |
| ≥ 1024px | Max-width 7xl, sidebar colapsável | Top nav + sidebar |

---

## 🎨 Sistema de design (mobile-first)

### Touch targets

**Mínimo: 44×44px** (Apple HIG / Material Design 3)

```tsx
// ❌ ERRADO
<button className="p-1.5"><Icon className="w-3 h-3" /></button>
// 12px (icon) + 12px (padding) = 24px total

// ✅ CORRETO
<button className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
  <Icon className="w-5 h-5" />
</button>
// 20px (icon) + 24px (padding) = 44px total
```

**Tabela de referência:**

| Elemento | Tamanho mínimo | Recomendado |
|---|---|---|
| Botão primário (CTA) | 44px | 48-52px |
| Botão secundário | 44px | 44px |
| Botão icônico (ícone único) | 44×44px | 48×48px |
| Link inline | 44px height (linha toda clicável) | — |
| Input field | 44px | 48-52px |
| Toggle switch | 44px hit area | 24px visual |
| Tab | 44px | 48px |

### Tipografia

```css
/* Base mobile */
html { font-size: 16px; }

body { font-family: var(--font-raleway); }

/* Headings — escala responsiva */
h1 { font-size: clamp(1.75rem, 5vw, 3rem); }    /* 28px → 48px */
h2 { font-size: clamp(1.5rem, 4vw, 2.25rem); } /* 24px → 36px */
h3 { font-size: clamp(1.25rem, 3vw, 1.75rem); }/* 20px → 28px */

/* Body */
p  { font-size: 1rem; line-height: 1.65; }      /* 16px / 26.4px */

/* Small text (usar com parcimônia) */
.text-sm { font-size: 0.875rem; }               /* 14px — apenas metadata */
```

**Regras:**

- **NUNCA** font-size < 16px em `<input>` ou `<textarea>` (causa zoom iOS)
- Body text: 16-17px base em mobile
- Line-height: 1.5-1.7 para parágrafos longos (legibilidade)
- Letter-spacing: -0.01em em headings grandes, 0 em body
- Max line length: 65-75 chars (controlar com `max-w-prose`)

### Espaçamento

```tsx
// Padding interno de containers mobile
<div className="p-4 sm:p-6 lg:p-8">

// Gap entre elementos
<div className="flex flex-col gap-4">

// Vertical rhythm entre seções
<section className="py-12 sm:py-16 lg:py-24">
```

**Regras:**

- Mobile: padding lateral `px-4` (16px)
- Tablet+: `px-6` (24px)
- Desktop: `px-8` (32px) ou max-width container
- Vertical: `py-12` mobile, `py-16` tablet, `py-24` desktop

### Cores e contraste

**WCAG AA mínimo:**

| Tipo | Ratio |
|---|---|
| Texto normal (< 18pt) | 4.5:1 |
| Texto grande (≥ 18pt ou 14pt bold) | 3:1 |
| UI components / icons | 3:1 |

**Paleta atual:**

```css
/* Foreground (texto) sobre Background */
--background: #020617;  /* slate-950 */
--foreground: #f8fafc;  /* slate-50 — contrast 17:1 ✅ */
--muted-foreground: #94a3b8; /* slate-400 — contrast 7:1 ✅ */

/* Accents */
--primary: #4338ca;     /* indigo-700 — 8:1 on slate-950 ✅ */
--amber: #fbbf24;       /* amber-400 — 11:1 on slate-950 ✅ */
```

### Safe area insets (iOS)

**Onde aplicar:**

| Container | Propriedade |
|---|---|
| Header sticky top | `padding-top: env(safe-area-inset-top)` |
| Bottom nav fixed | `padding-bottom: env(safe-area-inset-bottom)` |
| Fullscreen modal | `padding: env(safe-area-inset-top) ... env(safe-area-inset-bottom)` |
| Splash/loading | mesmo do header |

**Viewport-fit:**

```tsx
// app/layout.tsx
export const viewport: Viewport = {
  viewportFit: "cover",  // ← necessário para env() funcionar
  // ...
};
```

---

## 🧭 Navigation patterns

### Bottom nav (mobile < 768px)

**Máximo: 5 itens** (5 = limite cognitivo + mínimo para `grid-cols-5` uniforme).

```tsx
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-40"
     style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
  <div className="grid grid-cols-5 h-16">
    {items.map(item => <BottomNavItem key={item.href} {...item} />)}
  </div>
</nav>
```

**Cada item:**

```tsx
<Link
  href={item.href}
  className="relative flex flex-col items-center justify-center gap-0.5 
             text-[10px] font-medium min-h-[64px] py-2
             active:scale-95 transition-transform"
  aria-current={isActive ? 'page' : undefined}
  aria-label={item.label}
>
  <Icon className={cn('w-5 h-5', isActive && 'scale-110')} aria-hidden="true" />
  <span>{item.label}</span>
  {isActive && <span className="absolute top-0 w-8 h-0.5 bg-gradient-to-r from-amber-500 to-violet-500" />}
</Link>
```

### Top nav (desktop ≥ 768px)

```tsx
<header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80">
  <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
    {/* Logo + nav centralizado + actions */}
  </div>
</header>
```

### Drawer (mobile, opcional)

Para navegação secundária (settings, perfil detalhado):

```tsx
// Trigger: hamburger no header
// Animation: slide-in-from-right + backdrop fade
// Touch: swipe-right do edge para abrir, swipe-left para fechar
// Safe area: padding-right env(safe-area-inset-right)
```

---

## 🎭 Gestures

### Pull-to-refresh

```tsx
const { pullDistance, isRefreshing, handlers } = usePullToRefresh({
  onRefresh: async () => { await fetchData(); },
  threshold: 80,
});

return (
  <div {...handlers} style={{ transform: `translateY(${pullDistance}px)` }}>
    {isRefreshing && <Spinner />}
    {children}
  </div>
);
```

### Swipe actions

```tsx
const swipeHandlers = useSwipe({
  onSwipeLeft: () => deleteItem(),
  onSwipeRight: () => archiveItem(),
  threshold: 80,
});

<div {...swipeHandlers} className="relative">
  {/* Content */}
  {/* Reveal actions on swipe (opcional) */}
</div>
```

### Long press

```tsx
const longPress = useLongPress({
  onLongPress: () => openContextMenu(),
  delay: 500,
});

<div {...longPress}>Item</div>
```

### Haptic feedback

```tsx
const { trigger } = useHaptic();

trigger('selection'); // muda de tab
trigger('light');     // toque genérico
trigger('success');   // confirmação
trigger('error');     // erro
```

**Compatibilidade:** Vibration API só funciona em:
- Chrome Android ✅
- Safari iOS (apenas em PWAs instalados) ⚠️
- Edge ✅
- Firefox ❌

Sempre wrap em try/catch e respeitar `localStorage.akasha_haptic_enabled`.

---

## 📝 Forms

### Inputs

```tsx
<label htmlFor="email" className="block text-sm font-medium mb-2">
  Email
</label>
<input
  id="email"
  type="email"
  inputMode="email"
  autoComplete="email"
  autoCapitalize="none"
  autoCorrect="off"
  className="w-full px-4 py-3 text-base min-h-[48px] rounded-xl 
             bg-slate-800/50 border border-slate-700/50 
             focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
  aria-describedby="email-hint"
/>
```

**Regras:**

- `inputMode`: `email`, `tel`, `url`, `numeric`, `decimal`, `search`
- `autoComplete`: tokens padrão (`email`, `current-password`, `cc-number`)
- `text-base` (16px) **mínimo** — evita zoom iOS
- `min-h-[44px]` ou `min-h-[48px]` — touch target
- Label sempre visível (não flutuante)
- `aria-describedby` para hints e erros

### Botões

```tsx
{/* Primário */}
<button className="w-full sm:w-auto px-6 py-3 min-h-[48px] rounded-xl 
                   bg-gradient-to-r from-amber-500 to-violet-500 
                   text-white font-semibold 
                   active:scale-95 transition-transform
                   disabled:opacity-50 disabled:cursor-not-allowed">
  Ação principal
</button>

{/* Secundário */}
<button className="px-4 py-2 min-h-[44px] rounded-lg 
                   bg-slate-800 hover:bg-slate-700 
                   text-slate-300 
                   active:scale-95 transition-transform">
  Ação secundária
</button>

{/* Destrutivo */}
<button className="px-4 py-2 min-h-[44px] rounded-lg 
                   bg-red-500/10 hover:bg-red-500/20 
                   text-red-400 border border-red-500/20">
  Deletar
</button>
```

**Regra de ouro:** 1 CTA primário por tela.

---

## 🖼️ Imagens

### Lazy loading

```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Descrição semântica"
  width={800}
  height={600}
  loading="lazy"      // default em Next.js
  placeholder="blur"   // requer blurDataURL
  blurDataURL="data:image/..."
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

**Por quê `sizes`?**

Avisa o browser qual tamanho real terá em cada breakpoint → baixa resolução correta → bandwidth economizado.

### Avatares

```tsx
<Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
  <AvatarImage src={user.avatar} alt={`Foto de ${user.name}`} />
  <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-violet-500/20">
    {user.name[0]}
  </AvatarFallback>
</Avatar>
```

**Regras:**

- Sempre ter `AvatarFallback` (rede pode falhar)
- `flex-shrink-0` em flex containers
- `alt=""` se puramente decorativo, ou nome do usuário

---

## ⚡ Performance mobile

### Métricas alvo (Lighthouse mobile)

| Métrica | Target | Excelente |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | < 1.8s |
| FID (First Input Delay) | < 100ms | < 50ms |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.05 |
| TTI (Time to Interactive) | < 3.8s | < 2.5s |
| TBT (Total Blocking Time) | < 200ms | < 100ms |

### Code splitting

Next.js faz automático por rota. Componentes pesados usam `dynamic`:

```tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // se for client-only
});
```

### Font optimization

```tsx
// app/layout.tsx
const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",        // ← não bloqueia render
  weight: ["400", "600"], // ← subset de pesos usados
  variable: "--font-raleway",
});
```

**Regras:**

- `display: 'swap'` sempre
- Subset de pesos necessários (não todos)
- `preconnect` a fonts.gstatic.com no `<head>`

### Imagens responsivas

```tsx
// next.config.ts
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200],
  imageSizes: [16, 32, 48, 64, 96, 128, 256],
}
```

---

## ♿ Acessibilidade (a11y)

### Checklist por componente

- [ ] **Semântica**: tag HTML correta (`<button>`, `<nav>`, `<main>`)
- [ ] **ARIA**: `aria-label` em ícones, `aria-current="page"` em nav ativa
- [ ] **Focus visible**: nunca `outline: none` sem substituto
- [ ] **Touch target**: ≥ 44×44px
- [ ] **Contraste**: WCAG AA (4.5:1 texto, 3:1 UI)
- [ ] **Reduced motion**: respeitar `prefers-reduced-motion`
- [ ] **Keyboard nav**: Tab, Enter, Space, Esc funcionam
- [ ] **Screen reader**: testado em VoiceOver (iOS) / TalkBack (Android)

### Skip to content

```tsx
<a href="#main-content" 
   className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 
              focus:z-[100] focus:px-4 focus:py-3 focus:rounded-lg 
              focus:bg-amber-500 focus:text-white">
  Pular para conteúdo principal
</a>

<main id="main-content" tabIndex={-1}>
  {children}
</main>
```

### Reduced motion

```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion';

const reducedMotion = useReducedMotion();

<motion.div
  animate={reducedMotion ? {} : { y: [0, -8, 0] }}
  transition={{ duration: reducedMotion ? 0 : 2 }}
/>
```

---

## 🧪 Testing checklist (antes de PR)

### Manual tests
- [ ] Lighthouse mobile ≥ 90 (Performance, A11y, Best Practices, SEO)
- [ ] Viewports 320, 375, 768, 1024 sem overflow horizontal
- [ ] Touch targets ≥ 44px (verificar com régua ou DevTools)
- [ ] Tab order completo via keyboard
- [ ] VoiceOver/TalkBack em fluxo principal (login → home → ação)
- [ ] Sem warnings "small tap target" no Lighthouse
- [ ] Safe area insets visíveis em iPhone com notch
- [ ] Sem dependência de hover (testar em touch)
- [ ] Form: submit com Enter, navegação entre campos com Tab

### Automated tests
```bash
# Unit tests para componentes mobile
pnpm test CommunityNav
pnpm test MobileDrawer
pnpm test PullToRefresh

# E2E em viewports mobile
pnpm e2e:mobile
```

---

## 📚 Recursos

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design 3](https://m3.material.io/)
- [web.dev: Mobile UX](https://web.dev/mobile-ux/)
- [MDN: Touch events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_overview&versions=2.1&levels=aaa)

---

**Mantido por:** Designer + General
**Próxima revisão:** quando Stack major bump ou quando padrão mudar
**Issues:** abrir PR referenciando seção específica deste doc