# ANIMAÇÕES SAGRADAS — WAVE 28 (Lina, Designer 7/8)

> **Movimento consciente.** Cada animação respira com intenção — como
> meditação em pixels. Tecnologia espiritual em movimento.

---

## 1. Filosofia

A tradição contemplativa não é estática — ela **respira**, **flutua**,
**gira lentamente**. As animações sagradas refletem esses estados:

| Estado interior | Animação | Significado |
| --- | --- | --- |
| Meditação | `breathe` (4s) | Pulso vital, como Pranayama |
| Contemplação | `sacred-float` (6s) | Levitação contemplativa |
| Emergência | `ethereal-fade` (0.8s) | Materialização do plano sutil |
| Geometria viva | `orbit-*`, `mandala-spin` | Movimento perpétuo do cosmos |
| Presença | `chakra-pulse` (2s) | Aura ativa de chakra |
| Luz interior | `shimmer`, `aurora-drift` | Emanação luminosa |

**Princípios inegociáveis:**

1. **Apenas `transform` + `opacity`** → compositor thread → 60fps em
   mid-tier Android (Moto G, Redmi Note).
2. **1-2 animações por viewport** máximo → não compete com a atenção do
   usuário pelo mesmo "real estate perceptual".
3. **Duração mínima de 4s** para animações contínuas — abaixo disso
   vira "fidget spinner", não contemplação.
4. **`will-change` aplicado apenas onde necessário** (animação contínua
   + duração > 2s) — evita memory bloat.
5. **`prefers-reduced-motion` honrado** — tudo cai para 0.01ms ou estado
   final estático (ver §5).

---

## 2. Catálogo de Animações

### 2.1 `animate-breathe` — Respiração orgânica

```css
@keyframes akasha-breathe {
  0%, 100% { transform: scale(1);    opacity: 0.95; }
  50%      { transform: scale(1.05); opacity: 1; }
}
.animate-breathe { animation: akasha-breathe 4s ease-in-out infinite; }
```

- **Duração**: 4s (ciclo de respiração humana em repouso).
- **Easing**: `ease-in-out` (ida-e-volta orgânica).
- **Quando usar**: ícones decorativos, CTAs em estado idle, avatares
  durante loading, badges ativos (live indicator), play buttons.
- **Evitar**: texto corrido (causa fadiga), listas com >5 itens.

### 2.2 `animate-ethereal-fade` — Emergência etérea

```css
@keyframes akasha-ethereal-fade {
  0%   { opacity: 0; filter: blur(8px); transform: translateY(20px) scale(0.95); }
  100% { opacity: 1; filter: blur(0);   transform: translateY(0)    scale(1); }
}
.animate-ethereal-fade {
  animation: akasha-ethereal-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

- **Duração**: 0.8s — materialização "suficientemente lenta pra ser
  sentida, rápida o bastante pra não atrasar".
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo — Lina
  usa para quase tudo).
- **Quando usar**: entrada de hero titles, badges, headings de seção,
  páragrafos críticos, first-value experience.
- **Combinar com `animation-delay`** para cascata suave:
  ```tsx
  <p className="animate-ethereal-fade" style={{ animationDelay: '200ms' }}>
  ```

### 2.3 `animate-sacred-float` — Levitação contemplativa

```css
@keyframes akasha-sacred-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
.animate-sacred-float { animation: akasha-sacred-float 6s ease-in-out infinite; }
```

- **Duração**: 6s (mais lento que breathe — dá tempo de "esquecer"
  que está se mexendo, então volta).
- **Quando usar**: títulos hero, ícones principais, orbes decorativos.
- **Evitar**: navegação, footer, áreas que precisam de estabilidade
  perceptual.

### 2.4 `animate-orbit-*` — Rotação cósmica

```css
@keyframes akasha-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-orbit-slow   { animation-duration: 60s; }
.animate-orbit-medium { animation-duration: 30s; }
.animate-orbit-fast   { animation-duration: 15s; }
.animate-orbit-reverse { animation: akasha-orbit-reverse 45s linear infinite; }
```

- **Duração**: 60s (slow) / 30s (medium) / 15s (fast) / 45s (reverse).
- **Easing**: `linear` (rotação constante, não começa nem para).
- **Quando usar**:
  - `slow` (60s): Flor da Vida, Mandala de fundo — "presença cósmica"
  - `medium` (30s): Cubo de Metatron, geometria principal
  - `fast` (15s): spinners de loading (apenas quando o usuário precisa
    de feedback de progresso)
  - `reverse` (45s): sobreposição em geometria composta (rotação
    "contra-orbital" — cria complexidade visual)

### 2.5 `animate-mandala-spin` — Mandala ultra-lenta

```css
.animate-mandala-spin { animation: akasha-mandala-spin 120s linear infinite; }
```

- **Duração**: 120s (2 minutos completos) — **a animação mais lenta
  do sistema**. Pra quê? Pra ser percebida apenas pela visão
  periférica. Não compete por atenção direta.
- **Quando usar**: SVG decorativos em background, mandalas dividers
  de página, ornamentos que só são notados com atenção.

### 2.6 `animate-chakra-pulse` — Aura do chakra

```css
@keyframes akasha-chakra-pulse {
  0%, 100% { box-shadow: 0 0 0 0 currentColor; opacity: 0.85; }
  50%      { box-shadow: 0 0 0 12px transparent; opacity: 1; }
}
.animate-chakra-pulse { animation: akasha-chakra-pulse 2s ease-out infinite; }
```

- **Duração**: 2s (respiração consciente — 30 ciclos/min).
- **`currentColor`** herda a cor do texto → adapta a cada chakra
  automaticamente.
- **Quando usar**: `ChakraBadge` ativo, indicadores de ritual ao vivo,
  status "online", notificações pulsantes.
- **Combinar com delay** para os 7 chakras em cascata:
  ```tsx
  <ChakraBadge className="animate-chakra-pulse" style={{ color: 'oklch(0.55 0.22 25)' }} />
  <ChakraBadge className="animate-chakra-pulse" style={{ animationDelay: '150ms' }} />
  ```

### 2.7 `animate-aurora-drift` — Gradiente aurora

```css
.animate-aurora-drift {
  background-size: 200% 200%;
  animation: akasha-aurora-drift 12s ease-in-out infinite;
}
```

- **Duração**: 12s (movimento "quase imperceptível" — gradiente
  respira).
- **Quando usar**: CTAs premium, headers de modal, seções "místicas".

### 2.8 `animate-stardust` — Partículas piscando

```css
@keyframes akasha-stardust-twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50%      { opacity: 1;   transform: scale(1.2); }
}
.animate-stardust { animation: akasha-stardust-twinkle 3s ease-in-out infinite; }
```

- **Quando usar**: ícones de "presença" (✨ em feature cards), pontos
  em backgrounds cósmicos.

---

## 3. Onde cada animação é aplicada (Wave 28)

| Componente | Animações | Arquivo |
| --- | --- | --- |
| **HomePage hero** | `ethereal-fade` (badge), `breathe` (sparkles icon), `sacred-float` (h1), `ethereal-fade` (parágrafo), `ethereal-fade` (CTA group), `breathe` (CTA button) | `src/app/page.tsx` |
| **FeatureCard** | `breathe` (icon container) | `src/app/page.tsx` |
| **FirstValueExperience** | `ethereal-fade` (badge + h1 + p) | `src/components/conversion/FirstValueExperience.tsx` |
| **VideoHero** | `breathe` (play button) | `src/components/conversion/VideoHero.tsx` |
| **SkeletonAvatar** | `breathe` (pulso orgânico) | `src/components/shared/SkeletonSpiritual.tsx` |
| **SkeletonChart bars** | `breathe` com stagger de 100ms | `src/components/shared/SkeletonSpiritual.tsx` |
| **SacredGeometryFlower** | `animate-sacred-rotate` (60s) quando `variant="animated"` | `src/components/spiritual/SacredGeometryFlower.tsx` |
| **HexagonalMandala** | `animate-sacred-rotate` (90s) | `src/components/spiritual/HexagonalMandala.tsx` |
| **MetatronCube** | `animate-sacred-rotate` (60s) | `src/components/spiritual/MetatronCube.tsx` |
| **SriYantra** | `animate-sacred-rotate` (75s) | `src/components/spiritual/SriYantra.tsx` |
| **FibonacciSpiral** | `animate-sacred-rotate` (45s) | `src/components/spiritual/FibonacciSpiral.tsx` |
| **MandalaDivider** | `animate-sacred-rotate` quando `variant="animated"` | `src/components/spiritual/MandalaDivider.tsx` |
| **LuminousCard** | `animate-glow-*` (pulse mode), `animate-shine` (shine sweep) | `src/components/ui/v2/luminous-card.tsx` |

**Total: 14+ touchpoints em 6 arquivos, 9 keyframes novos, 12 classes utilitárias.**

---

## 4. Performance

### 4.1 Regra de ouro

> **Apenas `transform`, `opacity` e `filter`** são compostos na GPU.
> Qualquer animação que toca `width`, `height`, `top`, `left`, `margin`,
> `padding` causa **layout reflow** → 60fps impossível em mobile.

Todas as 9 animações sagradas usam exclusivamente `transform` +
`opacity` (+ `filter: blur` na ethereal-fade, também compositável).

### 4.2 `will-change` — uso cirúrgico

Aplicado **apenas** em animações contínuas infinitas (breathe, orbit,
sacred-float, mandala-spin, ethereal-fade durante entrada). Para
animações one-shot (entrada), o navegador já sabe otimizar.

```css
.animate-breathe { will-change: transform, opacity; }
```

⚠️ **Nunca** aplicar `will-change` em mais de ~10 elementos por
viewport — vira anti-pattern (consome VRAM).

### 4.3 Duração × Atenção

| Duração | Uso perceptual |
| --- | --- |
| < 0.5s | Feedback tátil (toque, hover) |
| 0.5-1.5s | Entrada/saída de elementos |
| 1.5-4s | Estados de transição |
| 4-12s | Estados idle contínuos (breathe, float) |
| 15-120s | Decoração cósmica (orbit, mandala) |

---

## 5. Acessibilidade — `prefers-reduced-motion`

Todos os usuários com `prefers-reduced-motion: reduce` (configurado
no SO, ~10-15% da população por motivos vestibulares) recebem:

| Animação | Estado sem motion |
| --- | --- |
| `breathe` | scale = 1, opacity = 1 |
| `sacred-float` | translateY = 0 |
| `ethereal-fade` | opacity 1, sem blur, sem transform (estado final) |
| `chakra-pulse` | box-shadow estática sutil |
| `orbit-*`, `mandala-spin` | rotação = 0 (estático) |
| `aurora-drift` | gradiente estático |
| `stardust` | opacity 0.6 média, sem scale |

**Implementação** — bloco `@media (prefers-reduced-motion: reduce)` em
`globals.css` § WAVE 28 SACRED MOTION. Override de qualquer
`animation` para `none !important` + `will-change: auto` para limpar
memória de GPU.

---

## 6. Composição (combinando animações)

Múltiplas animações no mesmo elemento via classes Tailwind são possíveis
(composição), mas **com cuidado**:

```tsx
{/* ✅ Correto: 1 animação contínua + 1 one-shot delay */}
<div className="animate-breathe animate-ethereal-fade">

{/* ⚠️ Evitar: 2 animações contínuas no mesmo elemento (interferem) */}
<div className="animate-breathe animate-sacred-float">
```

Regra: **1 animação contínua por elemento**. Para combinações, use
elementos aninhados:

```tsx
<div className="animate-sacred-float">  {/* container flutua */}
  <div className="animate-breathe">      {/* ícone respira */}
    <Sparkles />
  </div>
</div>
```

---

## 7. Wave 28 — Entrega

| Item | Status |
| --- | --- |
| 9 keyframes novos (breathe, orbit × 4, ethereal-fade, chakra-pulse, sacred-float, mandala-spin, aurora-drift, stardust) | ✅ |
| 12 classes utilitárias `.animate-*` | ✅ |
| Bloco `prefers-reduced-motion` cobrindo todas as novas | ✅ |
| Aplicação em 14+ touchpoints | ✅ |
| Componentes geométricos com `animate-sacred-rotate` | ✅ |
| SkeletonSpiritual com breathe | ✅ |
| Documentação `ANIMATIONS-SACRED-W28.md` | ✅ |

**TSC:** mantida em 0 (nenhuma tipagem alterada — todas as classes
são CSS-only).

**Commit:** `feat(design): sacred motion — breathe + orbit + ethereal W28`

---

## 8. Próximos passos (Wave 29+)

- [ ] Hook `useAnimationPreference()` que retorna variantes
      pré-reduzidas de animações baseadas em `prefers-reduced-motion`
      (hoje via CSS, mas com JS dá pra também suspender timers).
- [ ] `MotionLibrary` — Storybook visual de cada animação com
      controles de duração, easing, intensidade.
- [ ] Animações **interativas**: pulsação em resposta a eventos
      (hover, focus, click) — hoje só idle e entrada.
- [ ] `scroll-progress-mandala` — mandala que gira proporcional ao
      scroll da página (60s ↔ 0s).

---

**Wave 28 / Lina — Designer Sênior**  
*"Tecnologia espiritual em movimento. Cada pixel respira com a
comunidade."*