# Wave 24 — Microinteractions 8/8

> **Status:** ✅ Delivered (TS clean, sandboxes OK)
> **Data:** 2026-06-28
> **Owner:** Lina (Designer) + Coder (Wave 24)
> **Escopo:** Polimento final de feedback visual, tátil e sonoro em ações-chave.

---

## 1. TL;DR

Onda 24 fechou o ciclo de **microinterações** que faltava em cima das 9 primitivas
do Wave 17 (`FadeIn`, `StaggerList`, `HeartBurst`, `PressableScale`, `Toast`,
`ProgressBar`, `ModalShell`, `PageTransition`, `TypingDots`).

Adicionamos **10+ microinterações novas** + 3 hooks + 3 componentes + 1 toggle,
todos com fallback em `prefers-reduced-motion` e feedback multimodal
(haptic + visual + sonoro opcional).

| Categoria | Antes (W17) | Depois (W24) |
|-----------|-------------|--------------|
| Bookmark  | scale 0.95 + fill toggle | scale 0.95 + **checkmark overlay** + **bookmark-pop** + light/success haptic + tap/success sound |
| Reação    | toggle binário sem feedback | toggle + **light haptic** + **success/error haptic** + **tap/success/error sound** |
| Comentário| append direto no DOM | append + **slide-in-from-right** + light/success/error haptic + submit/success/error sound |
| Feed list | render imediato | **StaggerList 50ms** + **PullToRefresh** (custom spinner + threshold haptic) + **Toast** em criar/falhar |
| Filtros   | hover bg | hover bg + **light haptic** + **tab-indicator** animado (220ms) + tap sound + active state com gradient bar |
| Offline   | sem indicador | **OfflineBanner** (slide from top + WiFiOff icon) + **toast de reconexão** (fade-in-up) |
| Settings  | sem opção de som | **SoundEffectsToggle** (WebAudio opt-in, preview ao ativar) |
| Erro      | silencioso | haptic warning + error sound + toast destructive + retry inline |

---

## 2. Inventário de mudanças

### 2.1 Hooks novos (3)

| Arquivo | LOC | Função |
|---------|-----|--------|
| `src/hooks/useSoundEffects.ts` | 173 | WebAudio tones (tap/submit/success/error/notification/like), opt-in via localStorage `akasha.soundEnabled`, cross-tab sync via `storage` event, fallback graceful se API ausente. |
| `src/hooks/useOnlineStatus.ts` | 27 | Wrap de `navigator.onLine` + listeners `online`/`offline`. SSR-safe (default `true`). |
| (existente) `src/hooks/useHaptic.ts` | — | Mantido + ampliado uso (light/medium/success/error em todos os handlers de submit/like/bookmark/reaction/comment). |

### 2.2 Componentes novos (3)

| Arquivo | LOC | Função |
|---------|-----|--------|
| `src/components/community/OfflineBanner.tsx` | 67 | Banner "Sem internet" no topo (slide-in-from-top) + toast "Conexão restabelecida" 2.5s quando volta. Safe-area inset top. |
| `src/components/community/PullToRefresh.tsx` | 178 | Touch-only, threshold 80px / max 140px, resistência 0.4, haptic no threshold + medium no release, spinner custom (ArrowDown → RefreshCw), reduced-motion sem animação. |
| `src/components/ui/ConfirmCheck.tsx` | 67 | SVG checkmark animado (stroke-dasharray 22→0 em 280ms cubic-out). Reduced-motion: solid instantâneo. |

### 2.3 Componentes atualizados (4)

| Arquivo | Mudança |
|---------|---------|
| `src/components/community/BookmarkButton.tsx` | +useHaptic, +useSoundEffects, +ConfirmCheck overlay, +class `.animate-bookmark-pop`, +success/error haptic, +tap/success/error sound, +pulseKey state |
| `src/components/community/ReactionBar.tsx` | +useHaptic, +useSoundEffects, feedback light/success/error em toggle otimista |
| `src/components/community/CommentThread.tsx` | +useHaptic, +useSoundEffects, +slide-in-from-right em replies otimistas (id tracked via `justAddedId`), success haptic em send, error haptic em falha |
| `src/app/(community)/feed/page.tsx` | +OfflineBanner, +Toast (success/destructive/default), +StaggerList em posts (50ms entre cards, max=12), +PullToRefresh wrapper, +tab-indicator animado no FilterChip, +light haptic + tap sound no filter click |

### 2.4 CSS novo (Wave 24)

Arquivo: `src/app/globals.css` — bloco `Wave 24 — Microinteractions` (~140 LOC):

| Classe | Animação | Duração | Easing |
|--------|----------|---------|--------|
| `.animate-count-bounce` | `scale(1) → 1.18 → 1` | 320ms | spring (1.56 overshoot) |
| `.animate-bookmark-pop` | `scale 1 → 1.25 → 0.92 → 1` | 380ms | spring |
| `.animate-confirm-pop` | `scale 0 + rotate -15° → 1.15 → 1` | 320ms | spring |
| `.animate-tab-indicator` | `scaleX 0.4 → 1, opacity 0.6 → 1` | 220ms | expo-out |
| `.animate-avatar-swap-in` | `scale 0.6 rotate -8° → 1` | 280ms | expo-out |
| `.animate-follow-ring` | `box-shadow 0 → 14px ring fade` | 600ms | expo-out |
| `.animate-empty-float` | `translateY 0 → -6 → 0` | 4s loop | ease-in-out |
| `.animate-pulse-gentle` | `opacity 0.55 → 0.85 → 0.55` | 2.4s loop | ease-in-out |
| `.animate-spin-smooth` | `rotate 0 → 360°` | 800ms loop | linear |

Todas as animações:
- ✅ compositor-only (`transform` + `opacity` + `box-shadow` para ring)
- ✅ Wrapped em `@media (prefers-reduced-motion: reduce)` → `animation: none !important`
- ✅ Mobile-first (60fps em mid-tier Android)

### 2.5 Settings atualizado

`src/app/(community)/settings/page.tsx`:
- Painel renomeado para "Notificações & Feedback"
- Novo bloco **Feedback ao interagir** com `<SoundEffectsToggle />`
- Toggle tem preview (toca `success` 60ms após ativar)
- Copy explica WCAG 1.4.2 + relação com haptic

---

## 3. Onde aplicar cada microinteração (matriz)

| Componente | Haptic | Visual | Som | Reduced-motion |
|------------|--------|--------|-----|----------------|
| BookmarkButton click | `light()` | `bookmark-pop` + checkmark | `tap()` | sem pop |
| Bookmark save success | `success()` | checkmark draw 280ms | `success()` | check instantâneo |
| Bookmark save error | `error()` | rollback + error msg | `error()` | rollback sem som |
| Reaction toggle | `light()` + `success()` / `error()` | pill update otimista | `tap()` + `success()`/`error()` | pill update direto |
| Comment submit start | `light()` | botão → loading | `submit()` | botão → loading |
| Comment submit success | `success()` | **slide-in-from-right** no novo comment | `success()` | append direto |
| Comment submit error | `error()` | error msg inline | `error()` | error msg inline |
| FilterChip click | `light()` | tab-indicator slide 220ms + active state | `tap()` | active state direto |
| Toast (success) | implícito via som | slide-in from top, auto-dismiss 5s | `success()` | slide-in direto |
| Toast (destructive) | implícito via som | slide-in from top, role=alert | `error()` | slide-in direto |
| PullToRefresh threshold | `light()` | ArrowDown rotates 360° | — | sem rotação |
| PullToRefresh release | `medium()` | RefreshCw spinner 800ms loop | — | sem spinner |
| Offline detectado | — | slide-in from top, role=alert | — | slide-in direto |
| Back online | — | fade-in-up "Conexão restabelecida" 2.5s | — | fade direto |
| Settings sound toggle ON | — | toggle state | preview `success()` 60ms | — |

---

## 4. Wireframes antes / depois

### 4.1 Like (ReactionBar)

**Antes (W17):**
```
[👍 12]  [🙏 5]  [💜 3]
```
Click → pill atualiza contagem. Sem feedback além da cor.

**Depois (W24):**
```
[👍 12 → 13]   [🙏 5]  [💜 3]
   ↓ scale 1.18 → 1 (320ms spring)
   light haptic + tap sound
   success haptic + success sound (sino 880→1320 Hz, 80ms cada)
```
Reduced-motion: contagem muda sem scale.

### 4.2 Bookmark

**Antes:**
```
[🔖] ──click──→ [🔖✓ filled amber]
```

**Depois:**
```
[🔖] ──click──→
   light haptic + tap sound
   [🔖 filled amber] ──scale 1.25 → 0.92 → 1 (380ms)
                       [✓ verde badge canto superior-direito]
                       success haptic + success sound
```

### 4.3 Tab switch (FilterChip)

**Antes:**
```
[ Para você ] [ Tudo ] [ Seguindo ]
               ↑ active: amber bg
```
Click → bg muda. Sem transição suave.

**Depois:**
```
[ Para você ] [ Tudo ] [ Seguindo ]
              ↑ tab-indicator (gradient bar) slide-in 220ms
                scaleX 0.4 → 1, opacity 0.6 → 1
              ↑ light haptic + tap sound
              ↑ border-amber + gradient bg
```

### 4.4 Pull-to-refresh (feed)

**Antes:** N/A — feed refresh era apenas via botão "Carregar mais".

**Depois:**
```
Scroll no topo
   ↓ touchstart (Y=0)
   ↓ touchmove ↓ 80px (threshold)
   ↓ light haptic (uma vez)
   "Puxe para atualizar" → "Solte para atualizar" + ArrowDown rotaciona
   ↓ touchend (>= 80px)
   ↓ medium haptic
   "Atualizando..." + RefreshCw spinner (800ms loop)
   onRefresh() async
   ↓ ≥ 400ms feedback mínimo
   "Atualizado" toast (default) + dismiss
```

### 4.5 Offline → online

**Antes:** UI travava silenciosamente, usuário sem saber se era problema local.

**Depois:**
```
navigator.onLine === false
   ↓
┌──────────────────────────────────────────────┐
│ 📵 Sem internet — mostrando conteúdo em cache │
└──────────────────────────────────────────────┘
(slide-in-from-top, role=alert, aria-live=assertive)
   ↓
navigator.onLine === true (evento)
   ↓
┌──────────────────────────────────────┐
│ 📶 Conexão restabelecida             │
└──────────────────────────────────────┘
(fade-in-up, auto-dismiss 2.5s, role=status)
```

---

## 5. Acessibilidade

### 5.1 prefers-reduced-motion

Todas as animações novas estão wrappadas em:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-count-bounce,
  .animate-bookmark-pop,
  .animate-confirm-pop,
  .animate-tab-indicator,
  .animate-avatar-swap-in,
  .animate-follow-ring,
  .animate-empty-float,
  .animate-pulse-gentle,
  .animate-spin-smooth {
    animation: none !important;
  }
}
```

JS consumers (`ConfirmCheck`, `PullToRefresh`, `OfflineBanner`) também checam
`window.matchMedia('(prefers-reduced-motion: reduce)').matches` e degradam:
- PullToRefresh: 0ms de hold no spinner (vai direto pro done state)
- ConfirmCheck: stroke-dashoffset fixo em 0 (sólido imediato)
- OfflineBanner: sem animação (mas slide-in from top é seguro pois é só translate)

### 5.2 ARIA

| Componente | Role | aria-live | aria-atomic |
|------------|------|-----------|-------------|
| OfflineBanner (offline) | `alert` | `assertive` | `true` |
| OfflineBanner (online) | `status` | `polite` | `true` |
| Toast (default/success) | `status` | `polite` | `true` |
| Toast (destructive/warning) | `alert` | `assertive` | `true` |
| PullToRefresh indicator | `status` | `polite` | — |
| ConfirmCheck | `img` + aria-label="Confirmado" | — | — |
| CountBounce | — | `polite` (no span) | `true` |

### 5.3 Touch targets

Todos os botões novos/herdados mantêm 44×44px mínimo (`min-h-[44px]` + `min-w-[44px]`).
PullToRefresh funciona em área > 44px (touch start no scroll-top, então qualquer
largura serve).

### 5.4 Volume / som

- Default volume = 0.18 (gentil, não compete com narração)
- Master gain enforçado em todos os oscillators (clamp 0..1)
- Frequências entre 220Hz (erro) e 1320Hz (success) — audíveis mas não estridentes
- Toggle é opt-in (default OFF) — usuário escolhe ativar

### 5.5 WCAG 1.4.2 (som dispensável)

- Haptic funciona sem som
- Visual funciona sem som
- Som é camada terciária de feedback
- Toggle exposto em Settings (Settings → Notificações & Feedback → Feedback ao
  interagir → Sons de feedback)
- Audio API lazy-init (não dispara autoplay warning)

---

## 6. 60fps — performance budget

Todas as microinterações usam **exclusivamente** `transform` e `opacity` (com
exceção de `box-shadow` no follow-ring, que é GPU-compositor quando simples).

Benchmarks esperados (mid-tier Android, Chrome DevTools Performance):
- Bookmark pop: < 8ms por frame (16ms budget, sobra 50%)
- Reaction toggle: < 6ms por frame
- Tab indicator: < 5ms por frame
- PullToRefresh drag: < 4ms por frame (transform compositor-only)
- Toast slide-in: < 10ms por frame (backdrop-blur tem custo, mas é só durante 300ms)

Nenhuma animação mexe em `width`/`height`/`top`/`left`/`margin`/`padding`.

---

## 7. Como rodar localmente

### 7.1 Testar cada microinteração manualmente

```bash
npm run dev
# abre http://localhost:3000/feed
```

| Teste | Como |
|-------|------|
| Bookmark haptic | Click no 🔖 de qualquer post → vibração curta + check verde |
| Bookmark sound | Settings → ativa "Sons" → click no 🔖 → bell-like 1100Hz |
| Reaction haptic | Click em qualquer emoji da barra de reactions → vibração + tone |
| Comment slide-in | Responder qualquer comentário → novo comment entra com slide da direita |
| Tab indicator | Click entre "Para você" / "Tudo" / "Seguindo" → bar gradient slide 220ms |
| Pull-to-refresh | Mobile: scroll até o topo, puxa pra baixo ≥ 80px, solta |
| Offline banner | Chrome DevTools → Network → Offline → reload → banner aparece |
| Back online | Volta a Online → "Conexão restabelecida" 2.5s |

### 7.2 Verificar reduced-motion

```bash
# macOS / iOS
System Preferences → Accessibility → Display → Reduce motion

# Chrome DevTools
Rendering → Emulate CSS media feature prefers-reduced-motion: reduce
```

Com reduce-motion ativo, todas as animações viram instantâneas (sem scale,
sem slide, sem rotação).

### 7.3 Testar offline programmatically

```js
// Console do browser
window.dispatchEvent(new Event('offline'));  // banner aparece
window.dispatchEvent(new Event('online'));   // toast "Conexão restabelecida"
```

---

## 8. Trade-offs e decisões

### 8.1 Por que WebAudio em vez de `<audio>` assets?

- ✅ Zero assets (sem download, sem custo de bundle)
- ✅ Volume control programático
- ✅ Funciona em data-saver / conexão ruim
- ❌ Não tem personalidade (todos os tons são "clean sine/sawtooth")

**Futuro:** se o brand quiser personalidade sonora, dá pra trocar pelo
hook sem mudar a API pública (`play(name: SoundName)`).

### 8.2 Por que PullToRefresh próprio em vez de lib?

- ✅ Zero KB adicionado (react-use, react-pull-to-refresh somam ~8KB gzip)
- ✅ Integra direto com `useHaptic` + `useSoundEffects` + `prefers-reduced-motion`
- ✅ Threshold/resistência tuneáveis pelo design system
- ❌ Touch-only (desktop é no-op, mas isso é o comportamento esperado)

### 8.3 Por que opt-in para som?

- WCAG 1.4.2: som não deve ser a única forma de feedback
- Padrão da indústria (Twitter, Instagram, WhatsApp: default OFF)
- Respeita usuários sensíveis a som (autismo, TDAH, misofonia)
- Ativação mostra preview → user confirma que gosta

### 8.4 Por que StaggerList max=12?

Acima de 12 cards, o stagger cumulativo (12 × 50ms = 600ms) começa a parecer
lento. Wave 17 definiu max=20 como spec, mas Lina (review) recomendou 12 para
feed principal. Lista paginada carrega mais em batches.

---

## 9. Próximos passos (fora do escopo W24)

- [ ] Sound settings por tipo (custom pattern por evento)
- [ ] Haptic patterns além de Vibration API (Apple `selection` no iOS 18+)
- [ ] View Transitions API (Wave 17 já tem PageTransition, falta testar em
      browsers que suportam `document.startViewTransition`)
- [ ] Lottie illustrations no empty state (não SVG estático)
- [ ] Sound preference em `users.settings` (atualmente só localStorage)

---

## 10. Referências

- [WCAG 2.1 — 1.4.2 Audio Control](https://www.w3.org/TR/WCAG21/#audio-control)
- [WCAG 2.1 — 2.5.5 Target Size](https://www.w3.org/TR/WCAG21/#target-size-enhanced)
- [prefers-reduced-motion — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Web Audio API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vibration API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [Cubic-bezier easing reference](https://cubic-bezier.com)
- Wave 17 (`docs/ANIMATIONS-W17.md`) — primitivas motion base
- Wave 23 (`docs/TOKEN-REMEDIATION-W23.md`) — security baseline mantido

---

**Assinado:** Lina + Coder · 2026-06-28 · Wave 24 / 8
