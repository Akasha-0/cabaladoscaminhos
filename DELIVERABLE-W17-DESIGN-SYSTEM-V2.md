# Deliverable — Wave 17 · Trilha Design 2/6
## Design System v2

**Data:** 2026-06-27
**Agente:** Lina (Designer) — orquestrado por General
**Status:** ✅ ENTREGUE (git commit pendente — sandbox travou em `git add`)

---

## 📦 Entregáveis

| Arquivo | Status | Tamanho |
|---------|--------|---------|
| `src/styles/tokens.css` | ✅ Criado (substitui v1) | ~19KB · 12 ramps OKLCH × 10 shades + semantic + spacing + radius + shadow + font + animation |
| `src/components/ui/v2/button.tsx` | ✅ Criado | ~4KB · 8 variants, 4 sizes, loading + icon support |
| `src/components/ui/v2/card.tsx` | ✅ Criado | ~4KB · 3 elevations, 2 modes, compound API |
| `src/components/ui/v2/badge.tsx` | ✅ Criado | ~2.5KB · 10 thematic variants |
| `src/components/ui/v2/input.tsx` | ✅ Criado | ~4KB · error/success state, helper text, icons |
| `src/components/ui/v2/avatar.tsx` | ✅ Criado | ~4KB · 5 sizes, status indicator, spiritual ring |
| `src/components/ui/v2/sheet.tsx` | ✅ Criado | ~6KB · mobile-first bottom sheet, 4 sides |
| `src/components/ui/v2/command.tsx` | ✅ Criado | ~8KB · ⌘K palette com fuzzy search + keyboard nav |
| `src/components/ui/v2/toast.tsx` | ✅ Criado | ~6KB · hook-based, 4 severities, stack manager |
| `src/components/ui/v2/index.ts` | ✅ Criado | ~1.2KB · barrel export |
| `docs/DESIGN-SYSTEM-V2.md` | ✅ Criado | ~17KB · doc completa com anatomia + Do's & Don'ts |

**Total:** 11 arquivos, ~76KB novos.

---

## 🎯 O que foi entregue (resumo)

### 1. Tokens (`src/styles/tokens.css`)

**12 ramps × 10 shades em OKLCH:**
- slate · gray · amber · yellow · violet · purple · emerald · rose · red · orange · sky · teal · indigo
- Vibrancy perceptual uniforme (Lightness/Chroma/Hue)

**Tokens semânticos preservados:**
- `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--accent`, `--destructive`
- **NOVOS:** `--success`, `--warning`, `--info` (status colors faltantes no v1)
- `--border`, `--input`, `--ring`
- `--spiritual-gold` (yellow-500), `--spiritual-violet` (violet-500)
- 7 chakras + 7 orixás preservados

**Spacing scale 0 → 96** (4px base), **radius sm → full**, **shadow xs → 2xl + glow**, **font xs → 6xl**, **animation duration + easing**

**Dark mode** com shade-400 (mais vibrante) para primary/accent/success

### 2. Componentes v2 — 8 premium

Todos com:
- ✅ Mobile-first (touch ≥44px em lg)
- ✅ Type-safe CVA variants
- ✅ Focus ring visível (2px ring + offset)
- ✅ `prefers-reduced-motion` respeitado
- ✅ Tokens semânticos (zero hex inline)
- ✅ Composição com v1 (não quebram imports existentes)

| Componente | Inspiração | Highlight |
|------------|------------|-----------|
| Button | Linear, Stripe | 8 variants, loading state, icon adornments |
| Card | Vercel, Linear | 3 elevations, interactive hover-lift, gold/violet variants |
| Badge | GitHub, Linear | 10 thematic variants (cabala, ifa, reiki, astrologia, cigano) |
| Input | Stripe | error/success state, helper text, aria-invalid/describedby |
| Avatar | Linear, GitHub | status indicator (4), spiritual ring (3), deterministic fallback |
| Sheet | Apple HIG | mobile-first bottom sheet com drag handle, safe-area-inset |
| Command | Linear, Raycast | ⌘K global, fuzzy search, grouped categories, keyboard nav |
| Toast | Sonner, Vercel | hook-based (`useToast`), 4 severities, stack manager (max 5) |

### 3. Documentação (`docs/DESIGN-SYSTEM-V2.md`)

- Filosofia + princípios
- Token reference (12 ramps, semantic, spacing, radius, shadow, font, animation)
- Anatomia de cada componente com exemplo de uso
- Tabela de **Do's & Don'ts** (5 ✅ + 6 ❌)
- Migração v1 → v2 (rename map + coexistência)
- Estrutura de arquivos
- Referências de inspiração (Linear, Vercel, Stripe, Apple HIG, Raycast, Sonner, GitHub, Tailwind v4)
- Cross-references Wave 17 (`TYPOGRAPHY-W17`, `ANIMATIONS-W17`, `RESPONSIVE-AUDIT-W17`)

---

## ⚠️ Bloqueio: Git commit

**Sintoma:** Comandos `git add`, `git status`, `git diff` na sandbox cabaladoscaminhos travam em 60-90s timeout (padrão conhecido — múltiplas waves relataram).

**Workaround aplicado:** Documentação honesta + comando pronto para o owner rodar manualmente.

### Comando para commit manual

```bash
cd /workspace/cabaladoscaminhos

git add \
  src/styles/tokens.css \
  src/components/ui/v2/button.tsx \
  src/components/ui/v2/card.tsx \
  src/components/ui/v2/badge.tsx \
  src/components/ui/v2/input.tsx \
  src/components/ui/v2/avatar.tsx \
  src/components/ui/v2/sheet.tsx \
  src/components/ui/v2/command.tsx \
  src/components/ui/v2/toast.tsx \
  src/components/ui/v2/index.ts \
  docs/DESIGN-SYSTEM-V2.md \
  DELIVERABLE-W17-DESIGN-SYSTEM-V2.md

git commit -m "feat(design-system): v2 tokens + 8 components premium

- tokens.css modernizado: 12 ramps OKLCH (perceptualmente uniforme)
- spacing scale 0-96 (4px base), radius sm-full, shadow xs-2xl + glow
- animation tokens: duration + easing (reduced-motion respeitado)
- semantic tokens: novos success/warning/info (faltantes no v1)
- preservar: spiritual-gold/violet, chakras, orixás

- src/components/ui/v2/ — 8 componentes premium:
  - Button: 8 variants (primary/secondary/ghost/outline/danger/link/gold/violet)
  - Card: 3 elevations + interactive hover-lift + gold/violet modes
  - Badge: 10 variants temáticos (cabala, ifa, reiki, astrologia, cigano)
  - Input: error/success state + helper text + icons
  - Avatar: 5 sizes + status indicator + spiritual ring
  - Sheet: mobile-first bottom sheet (Apple HIG) + 4 sides
  - Command: ⌘K palette com fuzzy search + keyboard nav
  - Toast: useToast() hook + 4 severities + stack manager

- docs/DESIGN-SYSTEM-V2.md: anatomia + Do's/Don'ts + migração v1→v2
- inspiração: Linear, Vercel, Stripe, Apple HIG, Raycast, Sonner

Coexistência: v1 (src/components/ui/) preservado, v2 é aditivo.
Wave 17 · Trilha Design 2/6 · Lina (designer)"

# NÃO fazer push (per request do orquestrador)
```

---

## ✅ Critérios de aceite

| Critério | Status |
|----------|--------|
| Tokens modernos (12 ramps OKLCH) | ✅ |
| Spacing scale 0-96 | ✅ |
| Border radius sm/md/lg/xl/2xl/full | ✅ |
| Shadow scale sm/md/lg/xl/2xl | ✅ + xs + glow |
| Font scale xs → 4xl | ✅ + 5xl/6xl |
| Animation: duration + easing tokens | ✅ + reduced-motion |
| Tailwind config atualizado | ✅ (Tailwind v4 — `@theme` em `globals.css` já consome tokens) |
| 8 components em `src/components/ui/` | ✅ (em `v2/` subfolder — aditivo) |
| Button variants: primary/secondary/ghost/outline/danger + sm/md/lg | ✅ (+ gold, violet, link, icon) |
| Card com elevation + hover | ✅ |
| Badge 10 variants temáticos | ✅ |
| Input com error state + helper text | ✅ |
| Avatar (já existe — polido) | ✅ (status + ring adicionados) |
| Sheet (mobile bottom sheet) | ✅ |
| Command (palette ⌘K) | ✅ |
| Toast (notification premium) | ✅ |
| `docs/DESIGN-SYSTEM-V2.md` | ✅ |
| TSC 0 errors | ⚠️ Não verificado (sandbox travou em `tsc --noEmit`) — código escrito seguindo contratos do projeto |
| Sem push | ✅ |
| Sem instalar libs | ✅ (apenas base-ui já instalado + lucide-react + cva) |
| Mobile-first | ✅ (touch ≥44px, safe-area-inset, bottom sheet) |

---

## 🔗 Próximos passos sugeridos

1. **Owner roda o `git commit`** acima
2. **Rodar `pnpm tsc --noEmit`** localmente para validar 0 errors
3. **Rodar `pnpm dev` e abrir `/design-system`** — adicionar showcase dos v2 components
4. **Migrar 1-2 telas** para usar v2 (ex: `src/components/akashic/` se existir) — canary deployment
5. **Adicionar testes Vitest** para cada componente (backlog DESIGN-SYSTEM-V2.md)
6. **Wave 18+** — considerar deprecate v1 após migração completa

---

**Mantido por:** Lina (Designer) · **Status:** foundation v2.0 ✅ · **Próxima revisão:** após migração de 1 feature real