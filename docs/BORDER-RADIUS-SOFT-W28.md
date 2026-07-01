# 🌙 Border Radius Soft — W28

> **Status:** ✅ Aplicado (8 componentes v2 + 2 tokens + 1 utility class)
> **Data:** 2026-06-28
> **Owner:** Lina (Designer)
> **Wave:** 28 — Border Radius 2/8
> **Precedentes:** W28-1/8 Color Palette Mystical

---

## TL;DR

Refinamos o sistema de **border-radius** para ser **acolhedor, suave e moderno** — abandonando a sensação "quadrada" do design anterior. Agora todos os componentes v2 têm cantos generosamente arredondados, com uma escala explícita e consistente que respeita mobile-first e áreas de toque.

**Mantra:** *"Nada de quadrados duros — cada canto é uma pequena carícia visual."*

---

## 🎯 Filosofia

### Por que suavizar agora?

1. **Comunidade-alvo é mobile-first.** Usuárias(os) acessam a plataforma de casa, muitas vezes pelo celular, em momentos de leitura/contemplação. Cantos suaves passam sensação de **acolhimento** ao invés de institucional.
2. **Hierarquia visual moderna.** Apple HIG, Material You, Tailwind UI e Linear usam radii generosos. Estamos alinhando o produto à estética vigente sem cair em decoração gratuita.
3. **Coerência com a paleta mística W28-1.** Glows, gradients e bordas suaves pedem a mesma sintonia geométrica — caso contrário, o glow vira "pintura em moldura rígida".
4. **Toque feminino-energy.** A plataforma fala com praticantes de Umbanda, Candomblé, Cabala, Astrologia, Tantra — tradições onde a estética **curva** (círculos, mandalas, rosáceas, labirintos) é estrutural. Border-radius acompanha esse simbolismo.

### Princípios

- ✅ **Nada de `rounded-none`** (quadrado) — exceto texto/link sem background
- ✅ **Nada de `rounded-sm` (4px)** antigo — apenas `sm` (8px) ou maior exceto badges/avatars
- ✅ **Mobile-first** — pelo menos 12px nos elementos tocáveis
- ✅ **Transição suave** em hover/focus (200ms ease-out)
- ✅ **Hover lift opcional** — radius cresce levemente (md → lg) sem quebrar layout

---

## 📐 Escala W28

| Token | Valor | px | Uso principal |
|---|---|---|---|
| `--radius-xs`   | `0.375rem` | **6px**  | Exceções (código inline, hot spots) |
| `--radius-sm`   | `0.5rem`   | **8px**  | Pills compactos, tags pequenas |
| `--radius-md`   | `0.75rem`  | **12px** | **Buttons, inputs (padrão tocável)** |
| `--radius-lg`   | `1rem`     | **16px** | **Cards (padrão)** |
| `--radius-xl`   | `1.5rem`   | **24px** | Modais desktop, sheets laterais |
| `--radius-2xl`  | `2rem`     | **32px** | Cards destaque, containers featured |
| `--radius-3xl`  | `2.5rem`   | **40px** | Hero, featured blocks decorativos |
| `--radius-4xl`  | `3rem`     | **48px** | Landing CTAs, full pill |
| `--radius-full` | `9999px`   | —        | Pills, avatars (sempre circular) |

### Visualização

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌──┐  ┌───┐  ┌────┐  ┌──────┐  ┌──────────┐  ┌───────────────┐    │
│  │xs│  │sm │  │ md │  │  lg  │  │    xl    │  │      2xl      │    │
│  └──┘  └───┘  └────┘  └──────┘  └──────────┘  └───────────────┘    │
│   6px   8px   12px    16px      24px         32px                    │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────────────┐  ┌──────────┐  │
│  │       3xl        │  │          4xl             │  │   pill   │  │
│  └──────────────────┘  └──────────────────────────┘  └──────────┘  │
│        40px                  48px                    9999px        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Multiplicadores legados (removidos)

Antes da W28, a escala usava `--radius: 0.5rem` como base com multiplicadores `* 0.6, 0.8, 1, 1.4, 1.8, 2.2, 2.6`. Resultado: valores derivados (4.8, 6.4, 8, 11.2, 14.4, 17.6, 20.8) sem alinhamento a uma escala intencional.

**Agora:** valores **explícitos** em rem, com semântica clara por componente.

---

## 🎨 Aplicações por Componente (v2)

| Componente | Antes | Depois | Touch target |
|---|---|---|---|
| **Button (sm)** | `rounded-md` (6px derivado) | `rounded-[var(--radius-sm)]` (8px) | 32px ✓ |
| **Button (md)** | `rounded-md` (8px) | `rounded-[var(--radius-md)]` (12px) | 40px ✓ |
| **Button (lg)** | `rounded-lg` (8px) | `rounded-[var(--radius-lg)]` (16px) | 48px ✓ |
| **Button (lg-pill)** ⭐ NEW | — | `rounded-full` (9999px) | 48px ✓ |
| **Card** | `rounded-lg` (8px) | `rounded-[var(--radius-lg)]` (16px) | — |
| **Card interactive (hover)** | `hover:shadow-xl` | `hover:rounded-[var(--radius-xl)]` (16→24px) | — |
| **LuminousCard** | `rounded-xl` (16px) | `rounded-[var(--radius-xl)]` (24px) | — |
| **LuminousCard (hover)** | `hover:scale` | `hover:rounded-[var(--radius-2xl)]` (24→32px) | — |
| **Input (sm)** | `rounded-md` (8px) | `rounded-[var(--radius-sm)]` (8px) | 36px ✓ |
| **Input (md/lg)** | `rounded-md/lg` | `rounded-[var(--radius-md)]` (12px) | 44/48px ✓ |
| **Badge** | `rounded-full` ✓ | `rounded-full` ✓ (mantido) | 24px ✓ |
| **Avatar** | `rounded-full` ✓ | `rounded-full` ✓ (mantido) | 24-64px ✓ |
| **Sheet bottom (mobile)** | `rounded-t-2xl` (16px) | `rounded-t-[var(--radius-3xl)]` (40px) | — |
| **Sheet lateral (desktop)** | (sem radius) | `rounded-l/r-[var(--radius-xl)]` (24px) | — |
| **Sheet top** | (sem radius) | `rounded-b-[var(--radius-2xl)]` (32px) | — |
| **Sheet close button** | `rounded-md` (6px derivado) | `rounded-[var(--radius-md)]` (12px) | 36px ✓ |
| **Toast** | `rounded-lg` (8px) | `rounded-[var(--radius-xl)]` (24px) | — |
| **Toast close** | `rounded` (2px) | `rounded-[var(--radius-sm)]` (8px) | 28px ✓ |
| **Command palette** | `rounded-xl` (16px) | `rounded-[var(--radius-2xl)]` (32px) | — |
| **Command item** | `rounded-md` (8px) | `rounded-[var(--radius-md)]` (12px) | — |
| **Command kbd** | `rounded` (2px) | `rounded-[var(--radius-xs)]` (6px) | — |
| **Tabs (default)** | `rounded-lg` (8px) | `rounded-[var(--radius-sm)]` (8px) | — |
| **Tabs (line variant)** | `rounded-none` ❌ | `rounded-[var(--radius-xs)]` (6px) ✓ | — |

---

## 🌀 Utility Classes (novas)

Adicionadas em `globals.css` sob bloco `WAVE 28 — SOFT BORDER RADIUS UTILITIES`:

```css
/* Mapeadas 1:1 com --radius-* tokens */
.rounded-soft-xs  { border-radius: var(--radius-xs); }   /*  6px */
.rounded-soft-sm  { border-radius: var(--radius-sm); }   /*  8px */
.rounded-soft     { border-radius: var(--radius-md); }   /* 12px (alias curto) */
.rounded-soft-md  { border-radius: var(--radius-md); }   /* 12px */
.rounded-soft-lg  { border-radius: var(--radius-lg); }   /* 16px */
.rounded-soft-xl  { border-radius: var(--radius-xl); }   /* 24px */
.rounded-soft-2xl { border-radius: var(--radius-2xl); }  /* 32px */
.rounded-soft-3xl { border-radius: var(--radius-3xl); }  /* 40px */
.rounded-soft-4xl { border-radius: var(--radius-4xl); }  /* 48px */
.rounded-soft-pill,
.rounded-soft-full { border-radius: var(--radius-full); } /* 9999px */

/* Transição suave em mudanças de radius — para hover/focus interativos */
.transition-radius {
  transition-property: border-radius, box-shadow, background-color, transform;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1); /* ease-out-quint */
  transition-duration: 200ms;
}

/* Hover lift cosmético (radius + translate + shadow) sem quebrar layout */
.hover-lift-soft { ... }
.hover-lift-soft:hover { transform: translateY(-2px); }

/* Focus ring compatível com radius gentil */
.focus-soft-ring:focus-visible { ... }
```

**Quando usar:** Tailwind utility `rounded-[var(--radius-lg)]` (inline var) ou classes Tailwind padrão `rounded-lg/xl/2xl` que mapeiam para os mesmos tokens. As utility classes `.rounded-soft-*` são **atalhos semânticos** quando Tailwind não é a fonte.

---

## 🧪 Testes Visuais

Recomenda-se **não rodar TSC** completo (baseline tem 500+ erros pré-existentes — incluindo `node_modules/csstype/index.d.ts` e o `luminous-card.tsx` adicionado em paralelo sem validar).

**Verificação sugerida:** comparar screenshots antes/depois nas páginas mais visíveis:
- `/design-system` (radius demo atualizado)
- `/beta` (landing — CTAs em pill)
- `/welcome` (cards convite)
- `/manifesto` (cards conceituais)

---

## 📂 Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `src/styles/tokens.css` | Radius scale explícita (xs→full, 9 níveis) + comentários |
| `src/app/globals.css` | `--radius: 0.875rem` (14px) + tokens explícitos + utility classes |
| `src/lib/design-system/tokens.ts` | `radius` object reescrito (multiplicadores → literais via vars) |
| `src/components/ui/v2/button.tsx` | sm(8)/md(12)/lg(16) + novo `lg-pill` + transition refinada |
| `src/components/ui/v2/card.tsx` | lg(16) base, hover→xl(24) + transition refinada |
| `src/components/ui/v2/luminous-card.tsx` | xl(24) base, hover→2xl(32) + transition refinada |
| `src/components/ui/v2/input.tsx` | sm/md/lg alinhados (8/12/12) |
| `src/components/ui/v2/badge.tsx` | `rounded-full` mantido + transition refinada |
| `src/components/ui/v2/avatar.tsx` | `rounded-full` mantido + transition refinada |
| `src/components/ui/v2/sheet.tsx` | Mobile bottom=t-3xl(40), desktop lateral=xl(24), top=b-2xl(32) |
| `src/components/ui/v2/toast.tsx` | xl(24) + close button sm(8) |
| `src/components/ui/v2/command.tsx` | 2xl(32) container + md(12) items + xs(6) kbd |
| `src/components/ui/tabs.tsx` | sm(8) default + xs(6) line (removido rounded-none) |
| `src/app/design-system/page.tsx` | Radius demo atualizado para escala completa (xs→full) |
| **`docs/BORDER-RADIUS-SOFT-W28.md`** | Este doc |

---

## 🔮 Próximas Ondas (W29+)

### Pendente / futuro
- [ ] **Audit full codebase** (`grep -r "rounded-" src/`) para padronizar todos os usos aos novos tokens (W29 polish)
- [ ] **Avatar stack group** — refinar sobreposição com radius consistente
- [ ] **Image cards** — aplicar radius `lg` em containers de imagem (atualmente algumas usam `rounded-md` Tailwind legado)
- [ ] **Beta page** — aplicar `rounded-soft-4xl` no hero CTA (W29)
- [ ] **Loading skeletons** — alinhar com `--radius-lg` (16px) para sentir "carregando um card"
- [ ] **Toast stacking** — wrapper radius `xl`, itens radius `lg` (diferenciação visual)

### O que **NÃO** mudar
- `rounded-full` em pills/badges/avatars — é convenção universal, não "quadrado duro"
- `rounded-xs` (6px) em código inline/kbd — não é decoração, é affordance técnica
- Text underline (links) — não tem "radius" significativo

---

## 📚 Referências

- **In-app:** `/design-system` → Seção "Espaçamento + radius"
- **Source of truth:** `src/styles/tokens.css` + `src/app/globals.css` + `src/lib/design-system/tokens.ts`
- **Tailwind map:** via `var(--radius-*)` (autoprocessado em `@theme`)
- **Precedentes W28:**
  - `docs/COLOR-PALETTE-MYSTICAL-W28.md` — gradientes cósmicos/aurora/sacred-gold

---

> **Nota final:** este wave não é cosmético gratuito. Cada raio suavizado é uma decisão de produto — a Cabala dos Caminhos fala com gente que está em momento de busca, reflexão ou acolhimento. A geometria precisa combinar com a mensagem.
>
> — *Lina (Designer), Wave 28*
