# Cabala dos Caminhos - Design System

## Philosophy

O sistema de design captura a essência da sabedoria ancestral através de uma estética que evoca mistério, sacralidade e transcendência. A paleta combina tons dorados (luz divina), violeta (consciência superior), azul profundo (infinito cósmico) e terra (ancestralidade).

---

## Color Palette

### Primary Colors - Essência Divina

| Token | Hex | Usage |
|-------|-----|-------|
| `--spiritual-gold` | `#D4AF37` | Ações primárias, destaques, ícones sagrados |
| `--spiritual-gold-light` | `#FFD700` | Hover states, glows |
| `--spiritual-gold-dark` | `#B8860B` | Pressed states, sombras |
| `--spiritual-gold-muted` | `rgba(212, 175, 55, 0.15)` | Backgrounds sutis |

### Secondary Colors - Consciência Superior

| Token | Hex | Usage |
|-------|-----|-------|
| `--spiritual-violet` | `#8B5CF6` | Links, selos ativos, estados selecionados |
| `--spiritual-violet-deep` | `#6B21A8` | Hierarquia secundária |
| `--spiritual-violet-muted` | `rgba(139, 92, 246, 0.12)` | Cards de energia sutil |

### Accent Colors - Elementos Naturais

| Token | Hex | Usage |
|-------|-----|-------|
| `--spiritual-amber` | `#F59E0B` | Avisos, energia solar, dias favoráveis |
| `--spiritual-emerald` | `#10B981` | Sucesso, cura, Orixás de cura |
| `--spiritual-rose` | `#F43F5E` | Alertas, energia de transformação |
| `--spiritual-sky` | `#0EA5E9` | Intuição, água, energia lunar |

### Background Colors - Ambientes

| Token | Hex | Usage |
|-------|-----|-------|
| `--spiritual-bg-primary` | `#020617` | Background principal (slate-950) |
| `--spiritual-bg-secondary` | `#0F172A` | Cards, containers (slate-900) |
| `--spiritual-bg-tertiary` | `#1E293B` | Hover states, elementos elevados |
| `--spiritual-bg-glass` | `rgba(15, 23, 42, 0.8)` | Glassmorphism overlays |

### Chakra Colors

| Chakra | Cor | Hex |
|--------|-----|-----|
| Muladhara (Raiz) | Vermelho | `#EF4444` |
| Svadhisthana (Sacro) | Laranja | `#F97316` |
| Manipura (Plexo) | Amarelo | `#EAB308` |
| Anahata (Coração) | Verde | `#22C55E` |
| Vishuddha (Garganta) | Azul Claro | `#38BDF8` |
| Ajna (Terceiro Olho) | Índigo | `#6366F1` |
| Sahasrara (Coroa) | Violeta | `#A855F7` |

### Orixá Colors

| Orixá | Cor Primária | Hex |
|-------|-------------|-----|
| Oxalá | Branco/Dourado | `#FAFAFA` / `#D4AF37` |
| Iemanjá | Azul Claro | `#7DD3FC` |
| Ogum | Verde | `#22C55E` |
| Oxum | Amarelo/Rosa | `#FDE047` / `#F9A8D4` |
| Xangô | Vermelho | `#EF4444` |
| Oxóssi | Verde | `#22C55E` |
| Iansã | Vermelho/Laranja | `#EF4444` / `#F97316` |

---

## Typography

### Font Stack

```css
--font-heading: 'Cinzel', 'Times New Roman', serif;
--font-body: 'Raleway', system-ui, sans-serif;
--font-accent: 'Cormorant Garamond', Georgia, serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-display` | 3.5rem (56px) | 1.1 | 600 | Títulos principais |
| `--text-h1` | 2.5rem (40px) | 1.2 | 600 | Seções principais |
| `--text-h2` | 2rem (32px) | 1.25 | 500 | Subseções |
| `--text-h3` | 1.5rem (24px) | 1.3 | 500 | Cards, componentes |
| `--text-h4` | 1.25rem (20px) | 1.4 | 500 | Labels destacados |
| `--text-body` | 1rem (16px) | 1.6 | 400 | Texto corrido |
| `--text-small` | 0.875rem (14px) | 1.5 | 400 | Texto secundário |
| `--text-xs` | 0.75rem (12px) | 1.4 | 500 | Badges, tags |

### Letter Spacing

```css
--tracking-tight: -0.02em;    /* Headings */
--tracking-normal: 0em;        /* Body */
--tracking-wide: 0.05em;       /* Small caps, labels */
--tracking-wider: 0.1em;       /* All caps, spiritual symbols */
```

---

## Spacing System

Base: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 0.25rem (4px) | Separadores internos mínimos |
| `--space-sm` | 0.5rem (8px) | Elementos inline, gaps |
| `--space-md` | 1rem (16px) | Padding padrão de cards |
| `--space-lg` | 1.5rem (24px) | Seções, margins |
| `--space-xl` | 2rem (32px) | Headers de seção |
| `--space-2xl` | 3rem (48px) | Espaçamento entre seções |
| `--space-3xl` | 4rem (64px) | Margins de página |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 0.375rem | Badges, tags pequenas |
| `--radius-md` | 0.5rem | Botões, inputs |
| `--radius-lg` | 0.75rem | Cards |
| `--radius-xl` | 1rem | Modais, containers grandes |
| `--radius-2xl` | 1.5rem | Cards hero |
| `--radius-full` | 9999px | Pills, avatares |

---

## Shadows & Elevation

```css
/* Sombra suave para cards */
--shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 
               0 2px 4px -2px rgba(0, 0, 0, 0.2);

/* Sombra elevada para modais */
--shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

/* Glow espiritual para elementos sagrados */
--shadow-glow-gold: 0 0 20px rgba(212, 175, 55, 0.4),
                    0 0 40px rgba(212, 175, 55, 0.2);

--shadow-glow-violet: 0 0 20px rgba(139, 92, 246, 0.4),
                       0 0 40px rgba(139, 92, 246, 0.2);
```

---

## Animation Principles

### Timing

| Token | Duration | Usage |
|-------|----------|-------|
| `--duration-instant` | 75ms | Feedback imediato |
| `--duration-fast` | 150ms | Transições rápidas |
| `--duration-normal` | 250ms | Transições padrão |
| `--duration-slow` | 400ms | Entrada de elementos |
| `--duration-slower` | 600ms | Elementos grandes, modais |

### Easing

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);     /* Entrada suave */
--ease-in-out-sine: cubic-bezier(0.37, 0, 0.63, 1); /* Oscilações */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);    /* Bounce sutil */
```

### Animation Patterns

**Fade In Up (Recomendado para cards)**
```css
.animate-fade-in-up {
  animation: fadeInUp var(--duration-slow) var(--ease-out-expo) forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Glow Pulse (Para elementos sagrados)**
```css
.animate-glow-pulse {
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(212, 175, 55, 0.6);
  }
}
```

**Stagger (Para listas)**
```css
.stagger-children > * {
  opacity: 0;
  animation: fadeInUp var(--duration-slow) var(--ease-out-expo) forwards;
}
.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 75ms; }
.stagger-children > *:nth-child(3) { animation-delay: 150ms; }
.stagger-children > *:nth-child(4) { animation-delay: 225ms; }
/* Continue até 8-10 items */
```

---

## Component Patterns

### Spiritual Card

```tsx
<Card className="bg-gradient-to-br from-spiritual-bg-secondary to-spiritual-bg-tertiary 
                  border border-gold-500/20 
                  shadow-card
                  hover:shadow-glow-gold transition-all duration-normal">
  <CardHeader className="border-b border-gold-500/10">
    <CardTitle className="font-heading text-spiritual-gold">
      Título Sagrada
    </CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo...
  </CardContent>
</Card>
```

### Spiritual Button Variants

| Variant | Usage | Estilo |
|---------|-------|--------|
| `golden` | Ações primárias | Borda dourada, glow no hover |
| `ghost-sacred` | Navegação secundária | Hover sutil com brilho |
| `outline-glow` | Destaques especiais | Glow animado |

### Badge Styles

| Variant | Usage |
|---------|-------|
| `spiritual-gold` | Destaques, energia |
| `spiritual-violet` | Selos ativos, terceiro olho |
| `spiritual-amber` | Avisos, energia solar |
| `spiritual-chakra-{n}` | Cores de chakras |

---

## Accessibility

- Contraste mínimo 4.5:1 para texto normal
- Contraste mínimo 3:1 para texto grande
- Foco visível com outline dourado: `focus-visible:ring-2 focus-visible:ring-spiritual-gold`
- Reduz motion: respeitar `prefers-reduced-motion`

---

## Dark Mode Only

Este design system é otimizado para modo escuro, refletindo a natureza contemplativa e misteriosa das práticas espirituais. Cores claras são usadas apenas para destaques e elementos interativos.
