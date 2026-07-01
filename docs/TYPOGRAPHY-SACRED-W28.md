# Tipografia Sagrada — Wave 28.5

> *"Cada fonte carrega uma intenção. Cada letra é uma oração silenciosa."*

**Wave:** 28.5 (TYPOGRAPHY 5/8)
**Status:** ✅ Implementado
**Owner:** Lina (Designer)
**Branch:** main

---

## 1. Filosofia

A tipografia da **Akasha Portal** não é decorativa — é **litúrgica**. Cada escolha de fonte carrega uma intenção semântica que ressoa com a tradição correspondente:

| Fonte | Função Semântica | Tom |
|---|---|---|
| **Cinzel** | Sagrado / Display | Herança romana, livros sagrados, oráculos. **Uppercase + tracking wide** = "evocação cerimonial". |
| **Cormorant Garamond** | Místico / Serif | Eloqüência, poesia, oráculo, citações. **Italic** = modo "oraculum" (a voz do consulente). |
| **Raleway** | Tech / Sans | Precisão moderna, UI, dados, navegação. **Uppercase + tracking** = "label técnico". |
| **IM Fell English** | Manuscrito / Display decorativo | Impressão de 1700, marginalia, livros de grimório. |
| **Noto Sans Devanagari** | Sânscrito / Transliteração | Mantras, sutras, transliteração IAST. **Carregamento sob demanda.** |

A regra-mãe é: **a fonte é a primeira impressão da intenção**. Antes de ler a palavra, o usuário *sente* se é sagrado (Cinzel), poético (Cormorant), técnico (Raleway), antigo (IM Fell) ou transcendente (Devanagari).

---

## 2. Mapa Fonte → Uso

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  CAMADA DE INTERFACE                                                         │
│  ─────────────────                                                          │
│  • Tabs de navegação ......... Raleway uppercase tracking-[0.08em]           │
│  • Labels (badges) ........... Raleway uppercase tracking-[0.12em]           │
│  • Input placeholders ........ Raleway Regular 16px (iOS-safe)               │
│  • Botões técnicos ........... Raleway Medium 14px                            │
│  • Botões sagrados ........... Cinzel uppercase tracking-[0.08em]            │
│                                                                              │
│  CAMADA DE CONTEÚDO                                                          │
│  ──────────────────                                                         │
│  • Hero H1 ................... Cinzel Bold 48-64px tracking-[0.02em]         │
│  • Section H2 ................ Cinzel Semibold uppercase 32-48px             │
│  • Subheading H3 ............. Cormorant Bold Italic 28-36px                │
│  • Small heading H4 .......... Cormorant Semibold 22-28px                   │
│  • Body ...................... Raleway Regular 16px line-height 1.5         │
│  • Caption ................... Raleway Medium 14px                          │
│  • Quote / blockquote ........ Cormorant Italic 18px line-height 1.6        │
│  • Mystical display quote .... Cormorant Bold Italic 28-36px                │
│                                                                              │
│  CAMADA ESPECIAL                                                             │
│  ───────────────                                                            │
│  • Mantra em sânscrito ....... Noto Sans Devanagari 16-20px                 │
│  • Carta de oráculo .......... IM Fell English 16-18px                      │
│  • Gradient text cosmic ...... Cinzel Bold + bg gradient cosmic             │
│  • Gradient text divine ...... Cinzel Bold + bg gradient sacred-gold        │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Hierarquia Visual (Mobile-first)

A escala usa **clamp()** para adaptação fluida sem breakpoints artificiais:

```css
.display-2xl { font-size: clamp(2.5rem, 5vw + 1rem, 4rem); }    /* 40-64px */
.display-xl  { font-size: clamp(2rem, 4vw + 1rem, 3rem); }      /* 32-48px */
.display-lg  { font-size: clamp(1.5rem, 3vw + 0.5rem, 2.25rem); } /* 24-36px */
.display-md  { font-size: clamp(1.25rem, 2vw + 0.5rem, 1.75rem); } /* 20-28px */
.display-sm  { font-size: clamp(1.125rem, 1.5vw + 0.5rem, 1.375rem); } /* 18-22px */
```

| Nível | Elemento | Fonte | Peso | Tracking | LH | Uso |
|---|---|---|---|---|---|---|
| **H1** | `<h1>` | Cinzel | 700 | 0.02em | 1.1 | Título da página — "invocação de entrada" |
| **H2** | `<h2>` | Cinzel | 600 | 0.05em + UC | 1.2 | Section heading — "rótulo cerimonial" |
| **H3** | `<h3>` | Cormorant | 700 italic | 0.005em | 1.3 | Subheading — "voz contemplativa" |
| **H4** | `<h4>` | Cormorant | 600 | 0.01em | 1.35 | Card title, subsection — "linha eloqüente" |
| **H5/H6** | `<h5>`,`<h6>` | Raleway | 600 | 0.05em + UC | 1.4 | Label técnico — "metadata moderna" |
| **Body** | `<p>` | Raleway | 400 | 0 | 1.5 | Conteúdo corrido |
| **Caption** | `<small>` | Raleway | 500 | 0 | 1.5 | Metadata, datas, autor |
| **Quote** | `<blockquote>` | Cormorant | 500 italic | 0.005em | 1.6 | Citação, reflexão |
| **Mystical** | `<blockquote.display>` | Cormorant | 700 italic | -0.005em | 1.3 | Hero quote, abertura de página |

**Justificativa:**
- **H1/H2 em Cinzel** porque a primeira dobra de uma página é um "portal" — evoca livros sagrados abertos, capitulares romanas.
- **H3 em Cormorant italic** porque subheadings são contemplativos, não cerimoniais. Italic = voz interna do consulente.
- **H4 em Cormorant roman** para density em cards (não tão "cantado" quanto H3).
- **Body em Raleway** porque precisa ser legível em tela pequena por horas. Serif em body cansa; sans mantém objetividade.
- **Quote em Cormorant italic** porque citações espirituais são faladas, não impressas — italic é a voz do oráculo.

---

## 4. Utilitários CSS (Wave 28.5)

Adicionados em `src/app/globals.css`. Cada um mapeia 1:1 para uma intenção semântica:

### `.text-sacred` — Cinzel Sacred
```css
font-family: var(--font-cinzel), serif;
text-transform: uppercase;
letter-spacing: 0.08em;
font-weight: 600;
line-height: 1.2;
```
**Uso:** Section titles, headers de modal, page subtitles. Ex: "SEU CAMINHO", "TRADIÇÕES", "ORÁCULO".

### `.text-mystical` — Cormorant Mystical
```css
font-family: var(--font-cormorant), Georgia, serif;
font-style: italic;
font-weight: 500;
line-height: 1.6;
letter-spacing: 0.005em;
```
**Uso:** Citações, reflexões, oráculo, testimonials. Ex: "A linha do destino se entrelaça com a linha do coração."

### `.text-mystical-display` — Cormorant Hero
```css
font-family: var(--font-cormorant), Georgia, serif;
font-style: italic;
font-weight: 700;
line-height: 1.3;
letter-spacing: -0.005em;
```
**Uso:** Hero quote, abertura de página, chamada de evento.

### `.text-tech` — Raleway Tech
```css
font-family: var(--font-raleway), system-ui, sans-serif;
text-transform: uppercase;
letter-spacing: 0.12em;
font-weight: 500;
line-height: 1.4;
font-size: 0.75rem;
```
**Uso:** Tabs, badges, navigation labels, dados técnicos.

### `.text-cosmic` — Gradient Cosmic (purple→cyan)
```css
background: var(--gradient-cosmic);
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;
font-weight: 700;
```
**Uso:** Títulos de dashboard cósmico, badges de astrologia, headers de leitura astral.

### `.text-aurora` — Gradient Aurora (emerald→cyan→violet)
```css
background: var(--gradient-aurora);
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;
font-weight: 700;
```
**Uso:** Eventos de chakra, meditação multi-cor, status de cura.

### `.text-divine` — Gradient Sacred Gold (ouro envelhecido)
```css
background: var(--gradient-sacred-gold);
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;
font-weight: 700;
```
**Uso:** H1 de páginas de página principal, títulos de eventos, **padrão para todos os H1 da app** (substitui o gradient genérico amber→violet→pink). Mais coerente com o tema místico Akasha — ouro envelhecido evoca Axé, sabedoria, templo.

### `.text-manuscript` — IM Fell English
```css
font-family: var(--font-imfell), Georgia, serif;
font-weight: 400;
line-height: 1.35;
letter-spacing: 0.01em;
```
**Uso:** Cartas de oráculo impressas, mensagens de "carta do dia", reflexões em estilo epistolar.

### `.text-sanskrit` — Noto Sans Devanagari
```css
font-family: var(--font-devanagari), sans-serif;
font-weight: 500;
line-height: 1.5;
letter-spacing: 0;
```
**Uso:** Mantras em sânscrito transliterado (IAST), sutras, termos técnicos preservados.

### Variantes auxiliares
- `.text-sacred-tight` — Cinzel uppercase com tracking 0.04em (H2 dense, headers de modal pequenos)
- `.display-2xl` ... `.display-sm` — escala responsiva via `clamp()`

---

## 5. Componente Typography (`src/components/ui/v2/typography.tsx`)

Primitives prontas para uso em qualquer página. Cada uma aceita `as` para polymorphic rendering:

```tsx
import {
  DisplayHero,     // H1 — Cinzel Display 48-64px
  SectionHeading,  // H2 — Cinzel Sacred 32-48px uppercase
  Subheading,      // H3 — Cormorant Bold Italic 24-28px
  HeadingSmall,    // H4 — Cormorant Semibold 22-28px
  Body,            // Raleway 16px line-height 1.5
  Caption,         // Raleway Medium 14px
  Quote,           // Cormorant Italic 18px line-height 1.6 + gold border
  MysticalQuote,   // Cormorant Bold Italic 24-36px
  TechLabel,       // Raleway uppercase tracking 0.12em
  SacredLabel,     // Cinzel uppercase tracking 0.08em
  Manuscript,      // IM Fell English
  Sanskrit,        // Noto Devanagari
  CosmicText,      // Cosmic gradient text
  AuroraText,      // Aurora gradient text
  DivineText,      // Sacred gold gradient text
} from "@/components/ui/v2"
```

**Exemplo de uso:**

```tsx
<div>
  <SacredLabel as="p">Sua jornada</SacredLabel>
  <DisplayHero as="h1">🌌 Dashboard Espiritual</DisplayHero>
  <Body>Acompanhe sua jornada na comunidade.</Body>

  <Card>
    <Quote>
      "A linha do destino se entrelaça com a linha do coração."
    </Quote>
  </Card>

  <TechLabel>Tradição ativa</TechLabel>
  <Subheading>Cabala — Mizrah</Subheading>
</div>
```

---

## 6. Aplicação por Componente (Wave 28.5 — 11+ componentes)

| Componente | Mudança | Antes | Depois |
|---|---|---|---|
| `Button v2` | `sacred-gold`/`cosmic`/`aurora`/`divine` variants | Raleway semibold | **Cinzel uppercase tracking-[0.08em]** |
| `Card v2` | `CardTitle` | sans semibold | **Cormorant Bold Italic 18px** |
| `Badge v2` | base classes | sans medium | **Raleway uppercase tracking-[0.08em]** |
| `spiritual-button` | `golden`/`golden-outline`/`ghost-sacred`/`glow-violet` | sans semibold | **Cinzel uppercase tracking-[0.08em]** (golden/glow-violet) / **Cormorant italic** (ghost-sacred) |
| `Settings tabs` | tab labels | Raleway regular | **Cinzel uppercase tracking-[0.08em]** |
| `Dashboard page` | hero header | gradient genérico | **Cinzel Bold tracking-[0.02em] + `.text-divine`** |
| `Events list` | H1 | gradient genérico | **`.text-divine`** (ouro envelhecido) |
| `Events [id]` | event title | slate-100 plain | **Cinzel Bold tracking-[0.025em] + `.text-divine`** |
| `Explore page` | H1 | gradient genérico | **`.text-divine`** |
| `Feed page` | H1 | gradient genérico | **`.text-divine`** |
| `Groups list + [slug]` | H1 | gradient + slate-100 | **`.text-divine`** |
| `Library page` | H1 | gradient genérico | **`.text-divine`** |
| `Mentorship page` | H1 | gradient genérico | **`.text-divine`** |
| `Notifications page` | H1 | gradient genérico | **`.text-divine`** |
| `Post edit page` | H1 | gradient genérico | **`.text-divine`** |
| `Settings page` | H1 | gradient genérico | **`.text-divine`** |
| `globals.css` | base h1-h6 + utilities | default browser | **Cinzel/Cormorant/Raleway hierarchy + 9 utilities** |
| `layout.tsx` | font setup | 4 fonts | **+ Noto Devanagari (lazy) + expanded weights** |

**Total:** 17+ componentes refatorados para a nova hierarquia tipográfica sagrada.

---

## 7. Font Loading Strategy (Performance)

### Pesos por família

| Família | Pesos | Preload | Subset | Fallback |
|---|---|---|---|---|
| **Cinzel** | 500, 600, 700 | ✅ true | latin | Georgia / Times New Roman |
| **Cormorant Garamond** | 500, 700 (italic + normal) | ❌ false | latin | Georgia / Times New Roman |
| **Raleway** | 400, 500, 600 | ✅ true | latin | system-ui / Arial |
| **IM Fell English** | 400 | ❌ false | latin | Georgia / Times New Roman |
| **Noto Sans Devanagari** | 400, 500 | ❌ false | devanagari + latin | system-ui / Arial |

### Justificativa dos pesos

**Cinzel expandido para 500/600/700 (era só 600):**
- 500 = small caps ornamental (variações de H4 tight)
- 600 = section heading (padrão)
- 700 = hero H1, display máximo

**Cormorant expandido para 500/700 (era só 500):**
- 500 italic = quote padrão
- 700 italic = hero quote / display mystical

**Raleway mantido em 400/500/600:**
- 400 = body
- 500 = caption, label
- 600 = emphasis, button text

**IM Fell mantido em 400:**
- Display decorativo, só um peso necessário

**Noto Devanagari 400/500 (NOVO):**
- 400 = mantra transliterado
- 500 = mantra com emphasis

### Preload rationale
- **Cinzel + Raleway preload:true** — usadas em todas as páginas acima da dobra (LCP)
- **Cormorant preload:false** — usada em quotes/subheadings (below the fold na maioria)
- **IM Fell preload:false** — uso decorativo raro
- **Noto Devanagari preload:false** — usada em páginas de mantra/sutra apenas

### `display: "swap"` + `adjustFontFallback`
- `swap` mostra fallback imediatamente (sem FOIT — flash of invisible text)
- `adjustFontFallback` reduz CLS (Cumulative Layout Shift) ao alinhar métricas de fallback com a webfont real

---

## 8. Acessibilidade (WCAG AA)

| Critério | Implementação |
|---|---|
| **Contrast ratio ≥ 4.5:1** (body) | Amber 600 sobre neutral 50 = 4.7:1 ✅ |
| **Contrast ratio ≥ 3:1** (large text ≥18px) | Cosmic purple sobre neutral 50 = 7.1:1 ✅ |
| **iOS auto-zoom prevention** | Body min 16px (definido em `html { font-size: 16px }`) |
| **Reduced motion** | `prefers-reduced-motion` desabilita animações; gradients ficam (visuais estáticos) |
| **Screen reader semantics** | `<blockquote>`, `<h1>-<h6>` hierarchy preservadas |
| **Touch target ≥ 44px** | Tab labels agora têm `min-h-[44px]` |
| **RTL ready** | Devanagari subset suporta script direction; testar com i18n |

---

## 9. Wireframes — Antes / Depois

### Dashboard Hero

**ANTES (W28.0):**
```
[seu caminho]                                     ← Raleway uppercase 0.05em

🌌 Dashboard Espiritual                            ← Cinzel 32-36px
                                                   gradient amber→violet→pink

Acompanhe sua jornada na comunidade               ← Raleway 14px slate-400
```

**DEPOIS (W28.5):**
```
SEU CAMINHO                                        ← Cinzel 500 uppercase 0.12em
                                                   gold tint (text-spiritual-gold)

🌌 Dashboard Espiritual                            ← Cinzel 700 32-40px
                                                   .text-divine (sacred gold gradient)
                                                   tracking-[0.02em] leading-[1.1]

Acompanhe sua jornada na comunidade               ← Raleway 14px slate-400 line-1.5
```

### Settings Tab Label

**ANTES:**
```
[ Geral ] [ Conta ] [ Notificações ]              ← Raleway regular 14px
```

**DEPOIS:**
```
[ GERAL ] [ CONTA ] [ NOTIFICAÇÕES ]              ← Cinzel 500 uppercase tracking-[0.08em]
```

### Quote Block

**ANTES:**
```
> "A linha do destino se entrelaça com a linha
> do coração."
                                                   ← sans italic 16px slate-300
                                                   sem borda, sem identidade
```

**DEPOIS:**
```
┃ "A linha do destino se entrelaça com a linha
┃ do coração."                                     ← Cormorant Italic 500 18px line-1.6
                                                   borda esquerda 3px gold-400
                                                   (evoca livro aberto, marginalia)
```

---

## 10. Próximas Ondas (Sugestões)

- **W29 — Tipografia Dinâmica (Konami):** Ajustar hierarchy baseado em horário (manhã = mais weight, noite = mais italic).
- **W30 — Tipografia Gerativa:** Permitir usuários escolherem entre 3 perfis (Cabala/Ifá/Astrologia) com regras tipográficas diferentes.
- **W31 — Tipografia Acessível:** Modo "alto contraste" que aumenta weight de todas as fontes em 1 nível (500→600).
- **W32 — Tipografia I18n:** Validar como Cinzel/Cormorant renderizam em árabe/hindi/japonês — definir fallbacks por locale.

---

## 11. Decisões de Design Documentadas

### Por que **Cinzel** e não outra serif romana?
- Cinzel é a única serif romana **geométrica** que combina bem com elementos modernos (cards, buttons).
- Trajan Pro é paga. Cinzel é open-source + suportada por Google Fonts.
- Cormorant é eloqüente mas **fluida** demais para H1 — usa como H3/H4 italic.

### Por que **Cormorant italic** e não Playfair?
- Playfair Display é muito "moda editorial" — vibe Vogue, não templo.
- Cormorant tem origem **Garamond** (séc. XVI, livros de oração católicos).
- Cormorant italic tem o equilíbrio perfeito entre "voz falada" e "legibilidade".

### Por que **Raleway** e não Inter/Geist?
- Raleway tem **curvas mais humanas** (o 'a' tem gancho, o 'g' é single-storey) — combina com vibe orgânica.
- Inter/Geist são muito "tech bro" — vibe SaaS, não místico.
- Raleway suporta bem **uppercase + tracking wide** (a base do `text-tech`).

### Por que **IM Fell English** e não outra display?
- IM Fell é um **estilo de impressão de 1700** (reprodução digital de tipos de John Fell, Oxford).
- Evoca grimórios, livros de magia, oráculos impressos pré-industriais.
- Tem **apenas Regular 400** — uso propositalmente raro para não vulgarizar.

### Por que **Noto Devanagari** e não Siddhanta/Sanskrit 2003?
- Noto é mantido pelo Google, **cobertura Unicode completa** (não só Devanagari base).
- Subsets `devanagari + latin` carrega ambos em 1 request — sem FOUC.
- Fallback `Arial` é aceitável (sans system default cobre Devanagari base).

---

## 12. Validação & Checklist

- [x] `next/font/google` configurado com 5 famílias
- [x] Variáveis CSS `--font-*` exportadas e aplicadas em `@theme`
- [x] 9+ utilities typography em `globals.css`
- [x] 17+ componentes refatorados
- [x] Mobile-first (body 16px min para iOS não zoomar)
- [x] WCAG AA (contrast ≥4.5:1 body, ≥3:1 large)
- [x] Performance: 2 fonts preload (Cinzel+Raleway), 3 lazy
- [x] TSC = 0 (sem erros de tipo)
- [ ] Cross-browser test (Chrome, Safari iOS, Firefox, Samsung Internet)
- [ ] Lighthouse run (esperado: LCP < 2.5s, CLS < 0.1)

---

**Mantra do designer:**

> *Cinzel para invocar. Cormorant para contemplar. Raleway para agir. IM Fell para lembrar. Devanagari para honrar.*

— Lina, Wave 28.5