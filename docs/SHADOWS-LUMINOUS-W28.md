# Wave 28 — Shadows & Glows Luminosos

> **Designer:** Lina · **Filosofia:** *luz interior, aura, elevação mística*
> **Data:** 2026-06-28 · **Status:** ✅ Entregue (commit, sem push)

---

## 1. Princípios de Design

Três decisões de raiz que governam todos os tokens e componentes desta wave:

1. **Luz vem DE DENTRO** — componentes "ativos" (card cósmico, badge ritual, status online)
   emitem luz inscrita (`--shadow-inner-*`) em adição à sombra projetada. A UI parece
   *respirar*, não *flutuar passivamente*.

2. **Glow é aura, não decoração** — halos cromáticos (24px+48px duplo stop) só aparecem
   em estados que merecem atenção semântica: hover, ativo, sucesso, alerta, ritual.
   Estado default permanece neutro (`--shadow-md` / `--shadow-lg`).

3. **Dark mode é o palco principal** — modo noturno intensifica glows em 40-60% e troca
   `--shadow-*` por `--shadow-cosmic-*` (profundidade cósmica indigo-purpurea). A
   sensação é de *observatório* ou *templo noturno*, não de *app comum*.

Inspiração direta: Linear (clareza), Vercel (elevação sutil), Apple HIG (luminosidade
em modo escuro), templos contemporâneos (luz inscrita em materiais).

---

## 2. Escala Mística — 16 Tokens

### 2.1 Elevação Neutra (`--shadow-sm` → `--shadow-2xl`)

Escala canônica de sombra projetada. Inspirada em Tailwind v3 + Material 3, mas em
OKLCH / `rgb()` puro (sem dependência do plugin Tailwind).

| Token       | Uso recomendado                          | Camadas de sombra       |
|-------------|------------------------------------------|-------------------------|
| `--shadow-sm`  | Botão default, input focused         | 1 (1-2px drop)          |
| `--shadow-md`  | Card default (raised), toast         | 2 (4px + 2px)           |
| `--shadow-lg`  | Card floating, modal pequeno        | 2 (10px + 4px)          |
| `--shadow-xl`  | Card hover, dropdown menu            | 2 (20px + 8px)          |
| `--shadow-2xl` | Modal/sheet, command palette        | 1 (25px profunda)       |

### 2.2 Glows Cromáticos (`--shadow-glow-{amber,violet,emerald,cyan}`)

Halos duplos (24px + 48px) em cor OKLCH. Cada glow tem 2 stops de cor com alpha
diferente para simular falloff natural.

| Token                  | Hue OKLCH | Significado simbólico      | Aplicação                       |
|------------------------|-----------|----------------------------|---------------------------------|
| `--shadow-glow-amber`    | 80  | Sol, Axé, ouro sagrado, Xangô | Sucesso, primary action, ritual |
| `--shadow-glow-violet`   | 285 | 3º olho, mistério, noite    | CTA secundário, cosmic, badge   |
| `--shadow-glow-emerald`  | 160 | Cura, Oxóssi, crescimento   | Online, success ritual          |
| `--shadow-glow-cyan`     | 220 | Aurora, informação, garganta | Info toast, loading             |

### 2.3 Inner Glows (`--shadow-inner-{sacred,mystical}`)

`inset 0 0 20px` — luz *inscrita no material*. Usado quando o componente precisa
parecer *iluminado por dentro* (badge ativo, card ritual, foco profundo).

| Token                       | Cor               | Quando usar                         |
|-----------------------------|-------------------|-------------------------------------|
| `--shadow-inner-sacred`     | amber 25% alpha   | Liturgia, bênção, momento sagrado  |
| `--shadow-inner-mystical`   | violet 25% alpha  | Leitura profunda, ativação 3º olho |

### 2.4 Cosmic Depth (`--shadow-cosmic-{sm,md,lg}`)

Elevação específica para **modo escuro**. Indigo-purpurea profunda (`oklch(0.10 0.05 285)`)
em vez de preto puro. Cria sensação de cosmos denso onde elementos parecem flutuar
em poeira estelar.

| Token              | Composição                                       |
|--------------------|--------------------------------------------------|
| `--shadow-cosmic-sm`  | 1 layer (2px)                                |
| `--shadow-cosmic-md`  | 2 layers (8px + 4px)                         |
| `--shadow-cosmic-lg`  | 2 layers (16px + 8px) — modal/hero em dark   |

Sheet/Modal usa `--shadow-2xl` no claro e `--shadow-cosmic-lg` no escuro (aplicado via
`dark:shadow-[var(--shadow-cosmic-lg)]`).

---

## 3. Mapa Shadow → Uso

```
COMPONENTE              │ LIGHT                  │ DARK
────────────────────────┼────────────────────────┼────────────────────────
Button primary          │ shadow-sm → md         │ shadow-sm → md
Button secondary        │ — → md+glow-violet     │ — → md+glow-violet
Button sacred-gold      │ glow-sacred-gold       │ glow-sacred-gold
Button cosmic           │ glow-cosmic            │ glow-cosmic
Button divine           │ glow-cosmic → sacred   │ glow-cosmic → sacred
Card default            │ shadow-md              │ shadow-md
Card raised             │ shadow-md              │ shadow-md
Card floating           │ shadow-lg              │ shadow-lg
Card interactive hover  │ shadow-xl              │ shadow-xl
Card gold               │ + glow-amber (hover)   │ + glow-amber (hover)
Card violet             │ + glow-violet (hover)  │ + glow-violet (hover)
Card cosmic             │ glow-cosmic            │ glow-violet + inner
Card aurora             │ glow-ethereal-cyan     │ glow-cyan
LuminousCard (qualquer) │ elevation base + glow  │ elevation + glow + shine
Modal / Sheet           │ shadow-2xl             │ cosmic-lg
Toast success           │ shadow-lg + glow-amber │ shadow-lg + glow-amber
Toast info              │ shadow-lg + glow-cyan  │ shadow-lg + glow-cyan
Toast warning           │ shadow-lg + glow-amber │ shadow-lg + glow-amber
Toast error             │ shadow-lg + rose-glow  │ shadow-lg + rose-glow
Badge cosmic/aurora     │ glow-cosmic/cyan       │ glow-cosmic/cyan
Badge sacred-gold/amber │ glow-sacred-gold       │ glow-sacred-gold
Avatar status online    │ dot-glow-emerald       │ dot-glow-emerald
Avatar status away      │ dot-glow-amber         │ dot-glow-amber
Command palette         │ shadow-2xl             │ shadow-2xl
```

---

## 4. Light vs Dark — Comparação

```css
/* Light mode (default) */
--shadow-glow-amber: 0 0 24px oklch(0.70 0.18 80 / 0.35),
                     0 0 48px oklch(0.70 0.18 80 / 0.20);
--shadow-sm:        0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Dark mode (`.dark` class) */
--shadow-glow-amber: 0 0 32px oklch(0.70 0.18 80 / 0.50),  /* +14px spread */
                     0 0 64px oklch(0.70 0.18 80 / 0.30);  /* +43% alpha  */
--shadow-sm:        0 1px 2px 0 rgb(0 0 0 / 0.40);        /* 8× mais profundo */
```

**Por quê glow é mais intenso no escuro?** Porque no escuro os olhos estão adaptados e
um glow fraco fica invisível. Aumentar a intensidade mantém a percepção visual
*igual* à do modo claro — não exagerada.

**Por quê `--shadow-cosmic-*` substitui `--shadow-*` no escuro?** Porque sombras pretas
em fundo preto somem. Cosmic usa tinta indigo-purpurea (`oklch(0.10 0.05 285)`) que
se diferencia do fundo `--background: oklch(0.10 0.012 250)` mantendo a sensação de
profundidade.

---

## 5. Animações Etéreas

### 5.1 `.animate-glow-{cor}` — Respiração Meditativa

3s ease-in-out infinite. Oscila entre glow base e glow intensificado (+30-40%).
Use em **≤3 elementos por viewport** (cards de destaque, CTA principal, indicador
de ritual ativo). Combinar com `.animate-pulse` em loading spinners (cyan é o mais
neutro para estados de espera).

```html
<button class="bg-amber-600 animate-glow-amber ...">Começar leitura</button>
```

### 5.2 `.animate-shine` — Varredura Aurora

6s ease-in-out infinite. Gradiente diagonal branco translúcido varre 200% do
componente. Composição GPU (background-image, não box-shadow). Não impacta performance.

```html
<LuminousCard variant="amber" elevation="raised">  <!-- shine ON por default -->
<LuminousCard variant="violet" disableShine>      <!-- shine OFF em listas -->
```

### 5.3 Reduced Motion

Todas as animações são **bloqueadas** quando `prefers-reduced-motion: reduce`. O
glow estático (sem animação) permanece — só a respiração/shine é desligada. Componente
se mantém visualmente coerente, apenas sem movimento.

---

## 6. `<LuminousCard />` — API

```tsx
import { LuminousCard, LuminousCardHeader, LuminousCardContent, LuminousCardFooter }
  from "@/components/ui/v2"

<LuminousCard variant="amber" elevation="raised">
  <LuminousCardHeader>
    <LuminousCardTitle>Sua leitura de hoje</LuminousCardTitle>
    <LuminousCardDescription>Consciência · Numerologia Cabalística</LuminousCardDescription>
  </LuminousCardHeader>
  <LuminousCardContent>
    {/* Conteúdo da leitura */}
  </LuminousCardContent>
  <LuminousCardFooter>
    <span class="text-xs text-muted-foreground">2026-06-28</span>
    <button class="text-amber-600 font-medium">Abrir →</button>
  </LuminousCardFooter>
</LuminousCard>
```

### Props

| Prop          | Tipo                                  | Default   | Descrição                              |
|---------------|---------------------------------------|-----------|----------------------------------------|
| `variant`     | `'amber' \| 'violet' \| 'emerald' \| 'cyan'` | `'amber'` | Cor do glow + tint                     |
| `elevation`   | `'flat' \| 'raised' \| 'floating'`    | `'raised'`| Sombra base neutra                     |
| `pulse`       | `boolean`                             | `false`   | Respiração animada (≤3/viewport)       |
| `disableShine`| `boolean`                             | `false`   | Desliga varredura aurora               |

### Variantes Cromáticas

| Variant   | Glow Token               | Gradient Tint                  | Chakra/Tradição          |
|-----------|--------------------------|--------------------------------|--------------------------|
| `amber`   | `--shadow-glow-amber`    | `oklch(0.70 0.18 80 / 0.12)`  | Solar · Xangô · Cabala   |
| `violet`  | `--shadow-glow-violet`   | `oklch(0.65 0.22 285 / 0.12)` | 3º olho · Umbanda        |
| `emerald` | `--shadow-glow-emerald` | `oklch(0.65 0.17 160 / 0.12)` | Cardíaco · Oxóssi        |
| `cyan`    | `--shadow-glow-cyan`     | `oklch(0.65 0.20 220 / 0.12)` | Garganta · Meditação     |

---

## 7. Performance — Considerações

### Limites hard

- **≤8 box-shadows com glow por viewport** (mobile + desktop).
- **≤3 elementos com `.animate-glow-*` simultâneos** (cada um é ~2 layers de box-shadow
  animados; em dispositivos modestos isso pode causar 60fps → 45fps drop).
- **NÃO usar `pulse` em listas com 10+ cards.** Preferir `pulse={false}` + hover only.

### Por que `box-shadow` é caro

`box-shadow` força **repaint** a cada frame (não composita na GPU). Em listas longas
isso degrada o scroll smoothness. Estratégias de mitigação:

1. **`will-change: transform`** no LuminousCard (já aplicado) — promove a uma
   compositor layer separada para o transform/scale; box-shadow ainda repinta mas
   em layer isolada.
2. **Hover only** — `pulse={false}` por padrão; só ligar para o CTA principal ou
   indicador ritual.
3. **Variantes sem shine em listas** — `disableShine` em grids de cards repetidos.
4. **CSS containment** — futuro: `contain: layout style` no LuminousCard para isolar
   repaints do parent.

### Shine vs Glow — custo

| Animação          | Custo                          | Composição GPU? | Quantos usar |
|-------------------|--------------------------------|-----------------|--------------|
| `.animate-glow-*` | Repaint (box-shadow animado)   | Não             | ≤3/viewport  |
| `.animate-shine`  | Composite (background animado) | **Sim**         | ≤20/viewport |
| Hover transform   | Composite (transform)          | **Sim**         | Sem limite   |

`transform` e `background-position` (shine) são GPU-accelerated e não causam repaint.
`box-shadow` é CPU. Por isso `disableShine` é OK mas `disablePulse` deve ser
considerado em densidade alta.

---

## 8. Acessibilidade (WCAG AA)

- **Contraste preservado:** sombras e glows são efeitos decorativos que não alteram
  contraste de texto. Texto sempre usa `var(--foreground)` ou `var(--card-foreground)`
  com contraste ≥ 4.5:1 já garantido.
- **Foco visível:** `outline-2 ring-[var(--ring)] ring-offset-2` mantido em todos os
  componentes. Glows não substituem o anel de foco — complementam.
- **Reduced motion:** todas as animações bloqueadas em `@media (prefers-reduced-motion: reduce)`.
  Glow estático permanece (é só uma sombra mais visível), só a respiração/shine para.
- **Não-convencional mas ok:** halos pulsantes podem incomodar usuários com sensibilidade
  visual. Mantemos `pulse={false}` como default para que o efeito seja opt-in.

---

## 9. Arquivos Modificados / Criados

| Arquivo                                                  | Tipo      | Δ        |
|----------------------------------------------------------|-----------|----------|
| `src/app/globals.css`                                    | Modified  | +120/-2  |
| `src/components/ui/v2/luminous-card.tsx`                | **New**   | +200/0   |
| `src/components/ui/v2/button.tsx`                       | Modified  | +2/-1    |
| `src/components/ui/v2/card.tsx`                          | Modified  | +4/-3    |
| `src/components/ui/v2/toast.tsx`                        | Modified  | +9/-2    |
| `src/components/ui/v2/avatar.tsx`                        | Modified  | +2/-2    |
| `src/components/ui/v2/sheet.tsx`                        | Modified  | +1/-1    |
| `src/components/ui/v2/index.ts`                          | Modified  | +9/0     |
| `docs/SHADOWS-LUMINOUS-W28.md`                           | **New**   | +350/0   |

**Total:** 9 arquivos · ~700 linhas · 16 tokens · 4 utilitários animados · 1 componente novo.

---

## 10. Próximas Ondas (Sugestões)

- **W29+ — Tokens de motion semânticos:** `--motion-breath` (3s), `--motion-aurora` (6s),
  `--motion-sacred` (12s) — desacoplar duração de efeitos místicos da duração de UI genérica.
- **W30+ — Modo "templo":** dark mode com bg `--background: oklch(0.05 0.05 285)` (quase
  preto indigo), glows +20% adicionais, desabilitar cores de UI não-místicas.
- **W31+ — Sound design alinhado:** sound effect opcional em hover de LuminousCard
  (sino tibetano em amber, sinos tibetanos em violet, etc.) — opt-in, com mute global.

---

> *"Design não é decoração — é a primeira pergunta ética que fazemos ao usuário."*
> — Lina, Senior Product Designer