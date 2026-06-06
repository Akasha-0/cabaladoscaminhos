# Plano Onda D — Polish & QA

> **Tipo:** Plano de implementação. **Data:** 2026-06-02. **Branch:** `claude/docs-refactor-alignment-FOUqN`.
> **Pré-requisito:** Onda C 5/5 entregue (commit pendente de C.2+C.3 após triad).
> **Análise:** Doc 05 §7 (responsividade) + §8 (micro-interações) + Doc 13 §5 (tipografia). Wrapper multi-modelo indisponível — síntese direta a partir do estado real do código.
> **Achados da inspeção:**
> 1. `prefers-reduced-motion` JÁ existe em `src/app/globals.css:387, 836` (herdado de shared components). Reutilizar.
> 2. **ZERO uso de `React.memo`/`useMemo`/`next/dynamic`** no cockpit — todas as oportunidades abertas.
> 3. 9 componentes do cockpit têm `hover:`/`active:`/`focus:` — todos candidatos a polish.
> 4. Componentes pesados (candidatos a lazy-load): `DossierViewer` (react-markdown), `OraculoChat`, `DossierIndex`, `MetricsCards`, `RecentReadings`.

---

## 0. TL;DR — 4 entregáveis, 1-1.5d

| # | Entregável | Esforço | Risco | Pré-req |
|---|---|---|---|---|
| **D.1** | **Micro-interações** (Doc 05 §8) | 0.5d | 🟢 Baixo | nenhum |
| **D.2** | **Responsividade** (Doc 05 §7) | 0.4d | 🟡 Médio | nenhum |
| **D.3** | **Acessibilidade** (a11y WCAG 2.1 AA) | 0.3d | 🟡 Médio | D.1 (focus ring visível) |
| **D.4** | **Performance** | 0.2d | 🟡 Médio | nenhum |

**Total:** 1-1.5d. Sem dep nova. Reusa `prefers-reduced-motion` que já existe.

---

## 1. D.1 — Micro-interações (Doc 05 §8)

### 1.1 Especificação

| Elemento | Animação esperada | Implementação |
|---|---|---|
| Slot preenchido | `scale(1.02) + glow pulse 0.3s` ao confirmar | `HouseCell.tsx` — keyframe `cell-pulse` em globals.css (1 vez: 1.02 → 1.0 + glow 0.18→0.10) |
| Botão "Gerar Dossiê" | Pulsa em laranja quando mesa completa (36/36) | `CockpitSidebar.tsx` — classe `animate-pulse-orange` quando `filledCount === 36` |
| Transição vazio → preenchido | `fade + slide-up` da carta e Odu | `HouseCell.tsx` — `animate-fade-in` no estado filled |
| Loading Dossiê | Loader orbital de partículas | `LoadingOrbital.tsx` — adicionar `@keyframes orbital` (rotate + scale) para o Sparkles |
| Streaming Dossiê | Fade-in linha a linha do markdown | `DossierViewer.tsx` — `animate-fade-in` nas seções conforme `houses` cresce |
| Streaming Chat | Cursor piscante na bolha | `OracleBubble.tsx` — já tem `<span class="animate-pulse">` (manter) |

### 1.2 CSS a adicionar em `src/app/globals.css` (dentro de `.ramiro`)

```css
/* Micro-interações Doc 05 §8 — Escopo .ramiro para herança */
@keyframes ramiro-cell-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 15px var(--accent-orange-glow); }
  50%      { transform: scale(1.02); box-shadow: 0 0 30px var(--accent-orange-glow); }
}
.ramiro .house-cell-filled-animating {
  animation: ramiro-cell-pulse 0.3s ease-out;
}

@keyframes ramiro-pulse-orange {
  0%, 100% { box-shadow: 0 0 20px var(--accent-orange-glow); }
  50%      { box-shadow: 0 0 35px var(--accent-orange-glow); }
}
.ramiro .animate-pulse-orange {
  animation: ramiro-pulse-orange 2s ease-in-out infinite;
}

@keyframes ramiro-fade-in-up {
  0%   { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0); }
}
.ramiro .animate-fade-in {
  animation: ramiro-fade-in-up 0.25s ease-out;
}

@keyframes ramiro-orbital {
  0%   { transform: rotate(0deg) scale(1); opacity: 0.8; }
  50%  { transform: rotate(180deg) scale(1.1); opacity: 1; }
  100% { transform: rotate(360deg) scale(1); opacity: 0.8; }
}
.ramiro .animate-orbital {
  animation: ramiro-orbital 3s ease-in-out infinite;
  display: inline-block;
}

/* prefers-reduced-motion override (reusa o que já existe em globals.css:836) */
@media (prefers-reduced-motion: reduce) {
  .ramiro .house-cell-filled-animating,
  .ramiro .animate-pulse-orange,
  .ramiro .animate-fade-in,
  .ramiro .animate-orbital {
    animation: none !important;
  }
}
```

### 1.3 Componente a modificar: `HouseCell.tsx`

```tsx
// Adicionar prop `justFilled: boolean` para disparar pulse no fill
// (controlado pelo cockpit-store quando fillHouse é chamado).
// No JSX, aplicar classe condicional:
<div
  className={cn(
    '... base ...',
    isFilled && 'house-cell-filled-animating',
    isFilled && 'animate-fade-in',
  )}
/>
```

Modificação no `cockpit-store.ts` para flag `lastFilledCasa` que dispara re-render com `justFilled=true` por 300ms.

### 1.4 Componente a modificar: `CockpitSidebar.tsx`

```tsx
<Button
  variant="spiritual"
  className={cn(
    'w-full',
    isMesaCompleta && 'animate-pulse-orange shadow-[0_0_35px_var(--accent-orange-glow)]'
  )}
  disabled={!isMesaCompleta}
>
  Gerar Dossiê Cabalístico
</Button>
```

### 1.5 Componente a modificar: `LoadingOrbital.tsx`

```tsx
<Sparkles className="w-8 h-8 text-primary animate-orbital" />
```

### 1.6 Critérios de aceitação D.1

- [ ] Ao preencher uma casa, ela pulsa (scale + glow) por 0.3s
- [ ] Com 36/36 casas, "Gerar Dossiê" pulsa em laranja
- [ ] Loader orbital usa rotação, não só pulse
- [ ] Streaming do Dossiê tem fade-in linha a linha
- [ ] `prefers-reduced-motion: reduce` desativa TUDO

---

## 2. D.2 — Responsividade (Doc 05 §7)

### 2.1 Breakpoints

| Breakpoint | Comportamento | Arquivos |
|---|---|---|
| **`xl` (1280px+)** | Layout completo: sidebar `w-72` + grid 9×4 + painel de mapas | base (sem mudanças) |
| **`lg` (1024px)** | Sidebar `w-64`; grid mantem 9×4; Painel Consulente vira Drawer lateral | `B2BNav.tsx`, `CockpitSidebar.tsx` |
| **`md` (768px — iPad)** | Sidebar hamburguer; grid 9×4 com font menor; Painel Consulente colapsa | `B2BNav.tsx` (drawer), `HouseCell.tsx` (h-32 vs h-36) |
| **`sm` (640px)** | Grid vira lista accordion de 36 itens; "Gerar Dossiê" fixo no bottom | `CockpitOracular.tsx` (breakpoint conditional) |

### 2.2 CSS a adicionar em `globals.css`

```css
/* Sidebar responsiva (Doc 05 §7) */
@media (max-width: 1023px) {
  .ramiro aside[class*="w-72"] {
    width: 16rem; /* w-64 */
  }
}

@media (max-width: 767px) {
  .ramiro aside[class*="w-72"],
  .ramiro aside[class*="w-64"] {
    @apply fixed inset-y-0 left-0 z-50;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .ramiro aside.open {
    transform: translateX(0);
  }
}

/* Grid responsivo */
@media (max-width: 767px) {
  .ramiro .mesa-grid {
    @apply grid-cols-1 gap-2;
  }
  .ramiro .mesa-grid > * {
    @apply h-20 flex-row items-center justify-between;
  }
}
```

### 2.3 Componente a modificar: `CockpitOracular.tsx`

Adicionar estado `mobileMenuOpen` + botão hamburguer no header quando `<md`.

```tsx
{(isMobile) && (
  <button
    onClick={() => setMobileMenuOpen(true)}
    className="p-2 rounded hover:bg-muted md:hidden"
    aria-label="Abrir menu"
  >
    <Menu className="w-5 h-5" />
  </button>
)}
```

### 2.4 Componente a modificar: `DossierViewer.tsx` e `OraculoChat.tsx`

Em telas de leitura, o índice lateral (w-64) deve colapsar para um Sheet em `<md`. Solução simples: usar botão que abre drawer.

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => setIndexOpen(!indexOpen)}
  className="md:hidden mb-2"
>
  <List className="w-4 h-4 mr-2" />
  Índice
</Button>
{indexOpen && <DossierIndex ... />}
```

### 2.5 Critérios de aceitação D.2

- [ ] `xl` (1280+): tudo visível
- [ ] `lg` (1024): sidebar encolhe mas visível
- [ ] `md` (768): sidebar hamburguer; grid menor
- [ ] `sm` (<640): grid vira lista; "Gerar Dossiê" fixo
- [ ] Nenhum scroll horizontal acidental em nenhum breakpoint
- [ ] Touch targets ≥ 44px em mobile

---

## 3. D.3 — Acessibilidade (WCAG 2.1 AA)

### 3.1 Pendings (auditoria rápida)

| Item | Status atual | Ação |
|---|---|---|
| Aria-labels em botões de ícone | ✅ Maioria OK (alguns sem — ex: Sair do header) | Auditar e adicionar |
| Focus visível | ⚠️ Default do browser, sem `outline` customizado | Adicionar `focus-visible:ring-2 ring-primary` |
| `prefers-reduced-motion` | ✅ Já existe (globals.css:387, 836) | Manter + estender p/ D.1 |
| Contraste AA | ✅ Ramiro tem 4.5:1 mínimo garantido | Auditar com Lighthouse |
| Teclado | ✅ Maioria OK | Auditar todos os Dialogs |
| `aria-current="page"` na Nav | ✅ Já tem (B2BNav) | Manter |
| `aria-live` no streaming | ❌ Faltando | Adicionar |
| Skip link | ❌ Faltando | Adicionar "Pular para conteúdo principal" |

### 3.2 CSS a adicionar

```css
/* Focus visível WCAG 2.1 — Ramiro */
.ramiro *:focus-visible {
  @apply outline-none ring-2 ring-primary/60 ring-offset-2 ring-offset-background;
}

/* Skip link (Doc 09 §5 — acessibilidade) */
.ramiro .skip-link {
  @apply absolute -top-10 left-2 z-50 px-3 py-1 rounded bg-primary text-primary-foreground text-sm;
  transition: top 0.2s;
}
.ramiro .skip-link:focus {
  top: 0.5rem;
}
```

### 3.3 Skip link no layout

Adicionar no topo de `src/app/cockpit/layout.tsx`:

```tsx
<a href="#main-content" className="skip-link">
  Pular para conteúdo principal
</a>
<main id="main-content" ...>
```

E adicionar `tabIndex={-1}` no `<main>` para receber foco programático.

### 3.4 aria-live nas telas de streaming

Em `DossierViewer.tsx`:

```tsx
<div ref={articleRef} className="..." aria-live="polite" aria-atomic="false">
```

Em `OraculoChat.tsx`:

```tsx
<div ref={scrollRef} className="..." aria-live="polite" aria-atomic="false">
```

E marcar as bolhas individuais com `aria-label`:
- `<UserBubble aria-label="Sua mensagem">`
- `<OracleBubble aria-label="Resposta do Oráculo">`

### 3.5 Critérios de aceitação D.3

- [ ] Lighthouse Accessibility ≥ 95 em todas as páginas do cockpit
- [ ] Tab cycle completo: nav → main content → cards/tabela
- [ ] Esc fecha todos os modais/dialogs/popovers
- [ ] Screen reader anuncia streaming (aria-live)
- [ ] Skip link visível quando focado
- [ ] Contraste AA verificado (4.5:1 texto normal, 3:1 texto grande)

---

## 4. D.4 — Performance

### 4.1 Otimizações

| Componente | Otimização | Ganho esperado |
|---|---|---|
| `HouseCell` (36 instâncias) | `React.memo` + callback memoizado | Evita re-render de 35 células quando 1 muda |
| `DossierViewer` | `next/dynamic` com `ssr: false` | Bundle menor no initial load |
| `OraculoChat` | `next/dynamic` com `ssr: false` | Bundle menor |
| `cockpit-store` selectors | Usar selectors granulares ao invés de `useCockpitStore()` | Menos re-renders |

### 4.2 React.memo em HouseCell

```tsx
// src/components/cockpit/HouseCell.tsx
import { memo } from 'react';

export const HouseCell = memo(function HouseCell({ house, filledData, isActive, onClick, onClear }: HouseCellProps) {
  // ... (mesmo código)
}, (prev, next) => {
  return (
    prev.house.number === next.house.number &&
    prev.filledData === next.filledData &&
    prev.isActive === next.isActive
  );
});
```

### 4.3 next/dynamic para DossierViewer e OraculoChat

```tsx
// src/app/cockpit/leituras/[id]/page.tsx
import dynamic from 'next/dynamic';
const DossierViewer = dynamic(
  () => import('@/components/cockpit/dossier/DossierViewer').then(m => m.DossierViewer),
  { ssr: false, loading: () => <div className="p-8 text-muted-foreground">Carregando…</div> }
);
```

```tsx
// src/app/cockpit/leituras/[id]/consulta/page.tsx
const OraculoChat = dynamic(
  () => import('@/components/cockpit/consultation/OraculoChat').then(m => m.OraculoChat),
  { ssr: false, loading: () => <div className="p-8 text-muted-foreground">Carregando…</div> }
);
```

### 4.4 Cockpit-store: selectors granulares

```tsx
// Antes: const { houses, activePopover, fillHouse, clearHouse, clearAllHouses, resetCockpit } = useCockpitStore();
// Depois (evita re-render se outra parte do state muda):
const houses = useCockpitStore((s) => s.houses);
const activePopover = useCockpitStore((s) => s.activePopover);
const fillHouse = useCockpitStore((s) => s.fillHouse);
```

### 4.5 Critérios de aceitação D.4

- [ ] Lighthouse Performance ≥ 90 em `/cockpit` (mobile + desktop)
- [ ] React DevTools Profiler: alterar 1 casa não causa re-render das outras 35
- [ ] Bundle inicial de `/cockpit` < 200KB gzipped
- [ ] First Contentful Paint < 1.5s em rede 3G
- [ ] Time to Interactive < 3s

---

## 5. Arquivos a modificar (consolidado)

| Arquivo | D.1 | D.2 | D.3 | D.4 | Total |
|---|---|---|---|---|---|
| `src/app/globals.css` | +8 keyframes | +3 media | +focus + skip | — | D.1+D.2+D.3 |
| `src/components/cockpit/HouseCell.tsx` | +anim classes | — | — | +memo | D.1+D.4 |
| `src/stores/cockpit-store.ts` | +lastFilled flag | — | — | (selector split) | D.1+D.4 |
| `src/components/cockpit/CockpitSidebar.tsx` | +pulse conditional | — | — | — | D.1 |
| `src/components/cockpit/dossier/LoadingOrbital.tsx` | swap pulse→orbital | — | — | — | D.1 |
| `src/components/cockpit/dossier/DossierViewer.tsx` | +fade-in section | — | +aria-live | +dynamic import | D.1+D.3+D.4 |
| `src/components/cockpit/consultation/OraculoChat.tsx` | — | — | +aria-live | +dynamic import | D.3+D.4 |
| `src/components/cockpit/consultation/UserBubble.tsx` | — | — | +aria-label | — | D.3 |
| `src/components/cockpit/consultation/OracleBubble.tsx` | — | — | +aria-label | — | D.3 |
| `src/components/cockpit/CockpitOracular.tsx` | — | +hamburguer md | — | — | D.2 |
| `src/components/cockpit/navigation/B2BNav.tsx` | — | +drawer sm | — | — | D.2 |
| `src/app/cockpit/layout.tsx` | — | — | +skip-link | — | D.3 |
| `src/app/cockpit/leituras/[id]/page.tsx` | — | — | — | +dynamic(DossierViewer) | D.4 |
| `src/app/cockpit/leituras/[id]/consulta/page.tsx` | — | — | — | +dynamic(OraculoChat) | D.4 |

**Total: 14 arquivos** (1 CSS global, 9 componentes, 1 store, 1 layout, 2 pages).

---

## 6. Ordem de execução recomendada (1-1.5d)

1. **D.3 Acessibilidade (0.3d)** — adicionar skip-link, focus styles, aria-live (1 CSS + 1 layout + 2 componentes)
2. **D.1 Micro-interações (0.5d)** — CSS keyframes + aplicar em HouseCell/Sidebar/LoadingOrbital (3 componentes)
3. **D.2 Responsividade (0.4d)** — media queries + drawer/hamburguer (3 componentes)
4. **D.4 Performance (0.2d)** — React.memo + dynamic imports (2 pages + 1 componente)

**Justificativa da ordem:** A11y primeiro (beneficia todos os outros testes visuais), depois polish visual (D.1+D.2), e por último performance (caching/dynamic).

---

## 7. Verify Triad (final do ciclo)

| Etapa | Como verificar |
|---|---|
| `npm run build` | Sem erros, bundle de `/cockpit` < 200KB |
| `npm run lint` | Sem warnings |
| `npm run test:run` | 9.771+ testes mantidos (não regredir) |
| **Lighthouse** (manual) | Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 90 |
| **Visual smoke** (manual) | 4 breakpoints: 1280+, 1024, 768, 375 |
| **Keyboard smoke** (manual) | Tab cycle em `/cockpit` e `/cockpit/leituras/[id]`; Esc fecha popovers |
| **Screen reader** (opcional) | VoiceOver/NVDA anuncia streaming |

---

## 8. Riscos & Mitigações

| Risco | Mitigação |
|---|---|
| React.memo quebrar referências de callback | Usar `useCallback` em `CockpitOracular.tsx` para `fillHouse`/`clearHouse` antes de memoizar HouseCell |
| `dynamic` com `ssr: false` quebrar Server Components que dependem de props | Manter as pages como Server Components; apenas os Client Components filhos são dinâmicos |
| Media queries Tailwind vs CSS puro | Preferir Tailwind (`md:`, `lg:`) para consistência; CSS puro só para casos complexos (keyframes) |
| `prefers-reduced-motion` quebrar animações de feedback visual | Permitir transições de 0-100ms (color/opacity) mas desativar scale/rotate |
| Lighthouse scores variarem por ambiente | Usar `lighthouse-ci` em CI com thresholds fixos |

---

## 9. Dependências externas

Nenhuma. Tudo via CSS + hooks React existentes.

---

## 10. Pré-requisitos do commit (per `.claude/rules/commit-style.md`)

```bash
npm run build && npm run lint && npm run test:run
git add -A
git commit -m "feat(cockpit): Onda D — Polish & QA (micro-interações, responsividade, a11y WCAG 2.1 AA, performance)"
```

---

*Plano gerado em 2026-06-02 a partir do estado pós-Onda C 5/5 (C.5+C.1+C.4+C.2+C.3 entregue; commits pendentes após triad), Doc 05 §7-§8, Doc 13 §5, Doc 09 §5, e do estado real verificado do código (`prefers-reduced-motion` já existe em globals.css:387, 836; zero uso de `React.memo`/`next/dynamic` no cockpit).*
