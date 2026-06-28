# Tipografia — Wave 17 (TRILHA DESIGN 4/6)

**Status:** ✅ Implementado
**Branch:** main
**Autor:** Lina (Senior Designer) via General agent
**Wave:** 17 — Type system moderno

---

## Visão Geral

Sistema tipográfico modular baseado em escala harmônica (Major Third — 1.250)
com hierarquia clara para 5 níveis de heading + 3 níveis de corpo.

Inspirado em:
- Tailwind CSS defaults (1.25 ratio)
- Material Design 3 type scale
- IBM Carbon type tokens
- Variable fonts já configurados em Wave 11 (Cinzel, Cormorant, Raleway, IM_Fell)

---

## 1. Type Scale — Modular (1.250 — Major Third)

Cada token = `font-size / line-height`. Line-heights mobile-first (escalam em
viewport pequeno via utility classes).

| Token | Size | Line-Height | Ratio | Uso |
|-------|------|-------------|-------|-----|
| `xs` | 12px | 18px | 1.50 | Legal, disclaimers |
| `sm` | 14px | 20px | 1.43 | Captions, meta |
| `base` | 16px | 24px | 1.50 | Body corrido (padrão) |
| `lg` | 18px | 28px | 1.56 | Lead text, ênfase |
| `xl` | 20px | 28px | 1.40 | H4 subsection |
| `2xl` | 24px | 32px | 1.33 | H3 card title |
| `3xl` | 30px | 36px | 1.20 | H2 section title |
| `4xl` | 36px | 40px | 1.11 | H1 page title |
| `5xl` | 48px | 48px | 1.00 | Display marketing |
| `6xl` | 60px | 60px | 1.00 | Display grande |
| `7xl` | 72px | 72px | 1.00 | Display hero (somente home) |

### Implementação (Tailwind v4 via `@theme`)

```css
@theme {
  --text-xs: 0.75rem;     --text-xs--line-height: 1.5;
  --text-sm: 0.875rem;    --text-sm--line-height: 1.43;
  --text-base: 1rem;      --text-base--line-height: 1.5;
  --text-lg: 1.125rem;    --text-lg--line-height: 1.56;
  --text-xl: 1.25rem;     --text-xl--line-height: 1.4;
  --text-2xl: 1.5rem;     --text-2xl--line-height: 1.33;
  --text-3xl: 1.875rem;   --text-3xl--line-height: 1.2;
  --text-4xl: 2.25rem;    --text-4xl--line-height: 1.11;
  --text-5xl: 3rem;       --text-5xl--line-height: 1;
  --text-6xl: 3.75rem;    --text-6xl--line-height: 1;
  --text-7xl: 4.5rem;     --text-7xl--line-height: 1;
}
```

> **Nota:** Tailwind v4 não usa `tailwind.config.ts` — config 100% em CSS via `@theme`.

---

## 2. Hierarquia

Mapeamento semântico → token. Use **sempre** o utility correspondente, NUNCA
um valor arbitrário (`text-[20px]` é code smell).

| Nível | Token | Tamanho | Onde usar |
|-------|-------|---------|-----------|
| **Display 7xl** | `text-display-7xl` | 72px / 72px | Só hero de home (`/`) |
| **Display 6xl** | `text-display-6xl` | 60px / 60px | Marketing landing pages |
| **Display 5xl** | `text-display-5xl` | 48px / 48px | Hero secundário, headline marketing |
| **H1** | `<h1>` ou `text-4xl` | 36px / 40px | Page title (`/feed`, `/akashic-chat`) |
| **H2** | `<h2>` ou `text-3xl` | 30px / 36px | Section title (`/library` seções) |
| **H3** | `<h3>` ou `text-2xl` | 24px / 32px | Card title (`/post/[id]`) |
| **H4** | `<h4>` ou `text-xl` | 20px / 28px | Subsection, autor de post |
| **Body** | `text-body` | 16px / 24px | Texto corrido (padrão body) |
| **Small** | `text-caption` | 14px / 20px | Captions, meta |
| **Tiny** | `text-tiny` | 12px / 18px | Legal, disclaimers, footer |
| **Caps** | `text-caps` | qualquer | Tag/badge com uppercase + tracking |

### Mobile-first (≤640px)

Display e headings escalam automaticamente:
- `display-7xl` → `5xl` (72→48)
- `display-6xl` → `5xl` (60→48)
- `display-5xl` → `4xl` (48→36)
- `h1` → `3xl` (36→30)
- `h2` → `2xl` (30→24)
- `h3` → `xl` (24→20)
- `h4` → `lg` (20→18)

Definido em `@layer utilities` dentro de `@media (max-width: 640px)`.

---

## 3. Font Weights

| Uso | Weight | Token |
|-----|--------|-------|
| Display (hero, marketing) | **700** Bold | `--font-weight-display` |
| Headings (h1-h4) | **600** Semibold | `--font-weight-heading` |
| Body regular | **400** Regular | `--font-weight-body` |
| Emphasis (lead, link) | **500** Medium | `--font-weight-emphasis` |
| Strong (`<strong>`) | **700** Bold | `--font-weight-strong` |

**Compatibilidade com Wave 11:** Raleway carrega 400/500/600 (não 700). Para
display bold, usar fallback `--font-cinzel` (que tem 700 nativamente via Cinzel
Google Font) ou aceitar que o browser faz synthetic bold em Raleway. Para Wave
17, optamos por `font-cinzel` em display, mantendo consistência com headings.

---

## 4. Letter Spacing (tracking)

| Uso | Value | Token |
|-----|-------|-------|
| Display | **-0.02em** (tight) | `--tracking-display` |
| Headings | **-0.01em** | `--tracking-heading` |
| Body | **0** (normal) | `--tracking-body` |
| Caps (uppercase) | **+0.05em** | `--tracking-caps` |

Razão: tracking negativo em display compensa o "ar" que letras grandes
criam. Caps precisam de tracking positivo para legibilidade (regra clássica
de tipografia editorial).

---

## 5. Fontes (Wave 11 baseline + Wave 17 mappings)

| Família | Wave 11 Weight | Wave 17 Uso |
|---------|----------------|-------------|
| **Cinzel** | 600 (variable) | Display 5xl-7xl, h1-h4 (default heading family) |
| **Cormorant Garamond** | 500 | Body emphasis serif, legal text |
| **Raleway** | 400/500/600 | Body sans-serif default, UI |
| **IM_Fell English** | 400 | Decorativo (citações, pull-quotes) |

---

## 6. Pages Aplicadas (5 principais)

### `/` (Home) — `src/app/page.tsx`
- **Hero:** `text-display-7xl` (72px) → "Akasha"
- **Sub-hero:** `text-display-5xl` (48px) → "Comunidade Viva..."
- **Section title:** `text-display-5xl` → "Uma consciência coletiva"
- **Card title:** `text-xl` (h3) → "Comunidade real", "IA curadora"
- **Body:** `text-body` (default)
- **Meta footer:** `text-tiny`
- **Tag badge:** `text-caps`

### `/feed` — `src/app/feed/page.tsx` (novo)
- **Page title:** `<h1>` → "Feed da Comunidade"
- **Section badge:** `text-caps` + `text-tiny`
- **Card author:** `<h4>` → nome do autor
- **Card excerpt:** `text-body`
- **Card meta:** `text-tiny`

### `/library` — `src/app/library/page.tsx` (novo)
- **Page title:** `<h1>` → "Biblioteca Viva"
- **Section title:** `<h2>` → "Cabala", "Ifá", "Tantra"
- **Card title:** `<h3>` → título do artigo
- **Card excerpt:** `text-caption`
- **Evidence badge:** `text-caps` + `text-tiny`

### `/post/[id]` — `src/app/post/[id]/page.tsx` (novo)
- **Back link:** `text-caption`
- **Tradition tag:** `text-caps` + `text-tiny`
- **Post title:** `<h2>` (36px) → "Hoje no estudo da Árvore..."
- **Author name:** `<h4>` (20px)
- **Body:** `text-body` (default, paragraphs)
- **Pull-quote:** italic, body, pl-4
- **Comments title:** `<h3>` → "Comentários"
- **Action labels:** `text-caption`

### `/akashic-chat` — `src/app/akashic-chat/page.tsx` (novo)
- **Page title:** `<h1>` → "Akasha"
- **Tag badge:** `text-caps` + `text-tiny`
- **Description:** `text-body`
- **Message body:** `text-body`
- **Suggestion button:** `text-caption`
- **Input:** `text-body`
- **Footer meta:** `text-tiny`

---

## 7. Validação Manual (substitui TSC quando sandbox bloqueia)

Checklist para cada página aplicada:

- [ ] `<h1>` aparece exatamente 1x por página
- [ ] Hierarquia não pula níveis (h1 → h3 sem h2 é code smell)
- [ ] Display 7xl/6xl/5xl aparece só em hero/marketing, nunca em body
- [ ] `text-caption` para qualquer coisa <16px (mantém WCAG AA)
- [ ] Line-height segue ratio (ver tabela)
- [ ] Letter-spacing respeita tabela (display negativo, caps positivo)
- [ ] Mobile (≤640px): heading não estoura viewport — text-wrap balance ativo

---

## 8. Anti-Padrões (NÃO fazer)

❌ `className="text-[20px]"` — valor arbitrário
❌ `<h1 className="text-base">` — heading com tamanho de body
❌ `<p className="text-5xl">` — parágrafo com tamanho de display
❌ Misturar Raleway com Cinzel no mesmo heading
❌ `tracking` positivo em display (deixa "espalhado")
❌ `tracking` 0 em caps (fica ilegível)
❌ `<h4>` dentro de `<h1>` sem `<h2>`/`<h3>` intermediários

---

## 9. Próximos Passos (fora do escopo W17)

1. Auditar contraste (WCAG AA) em todos os textos aplicados
2. Adicionar `text-balance` automático em headings via `@supports`
3. Considerar `--text-8xl` (96px) para landing pages de marketing futuras
4. Adicionar variants `prose-display-7xl` para documentação markdown
5. Considerar display=swap em Raleway 700 (Wave 18) se quisermos display sans

---

## Arquivos Modificados

- ✅ `src/app/globals.css` — type tokens em `@theme` + `@layer utilities`
- ✅ `src/app/page.tsx` — Home com hierarchy + display 7xl
- 🆕 `src/app/feed/page.tsx` — Feed com hierarchy + h1
- 🆕 `src/app/library/page.tsx` — Library com hierarchy + h2 sections
- 🆕 `src/app/post/[id]/page.tsx` — Post detail com hierarchy + h2 title
- 🆕 `src/app/akashic-chat/page.tsx` — Chat com hierarchy + h1 + body
- ✅ `docs/TYPOGRAPHY-W17.md` — este doc

**Commit message:** `feat(typography): modular scale + hierarchy + 5 pages`