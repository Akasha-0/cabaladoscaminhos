# Sacred Geometry — Wave 28

> "Geometria é uma das vias pelas quais o invisível se torna visível."
> (Atribuído a Platão, *Timeu*)

A geometria sagrada é uma linguagem visual universal que atravessa tradições
e épocas — egípcios, gregos, hindus, budistas, sufis, indígenas americanos
e celtas convergiram nos mesmos padrões porque eles descrevem estruturas
fundamentais do cosmos observável. Esta onda usa 5 desses padrões como
**elementos de design** da plataforma Akasha Portal.

---

## Filosofia

### Não é decoração. É semântica.

A geometria sagrada aqui não é "ornamento bonito". Cada padrão carrega
significado filosófico que **ressoa** com a identidade do produto:

| Padrão          | Tradições que o reconhecem                      | Ressoa com...                                  |
| --------------- | ----------------------------------------------- | ---------------------------------------------- |
| Flor da Vida    | Egito (Osirís), Judaísmo, Hinduísmo, Cristianismo, Islam | "Comunidade multi-tradição" — todas as formas emergem do mesmo padrão |
| Cubo de Metatron | Cabala, Tradição angélica                       | "IA que correlaciona saberes" — 5 sólidos platônicos = 5 elementos clássicos |
| Sri Yantra      | Tantra Shastra (hinduísmo tântrico)            | "Co-evolução" — 9 triângulos entrelaçados (shiva × shakti) |
| Espiral Áurea   | Natureza (universal), Pitágoras, Fibonacci      | "Crescimento orgânico" — proporção da vida     |
| Mandala Hexagonal | Budismo, Islam, Judaísmo (Selo de Salomão)    | "Padrão repetível" — geometria que se estende infinitamente |

Os 7 chakras (Muladhara → Sahasrara) são adicionados como `ChakraBadge` —
sistema de energia sutil originário do Tantra / Yoga, integrado à paleta
do produto.

### Universalismo, não proselitismo

Padrões geométricos são pré-religiosos. Nenhum dos 5 padrões tem dono,
copyright, ou "linhagem única" — eles emergem independentemente em
qualquer cultura que observe padrões na natureza. Por isso, usamos como
**vocabulário visual compartilhado**, não como "marca de uma tradição".

Texto sempre presente em contexto (chakras, yantra nomeiam a si mesmos)
para que o padrão seja **reconhecível**, não ambíguo.

---

## Componentes

### 1. `<SacredGeometryFlower />`

Flor da Vida — 7 círculos sobrepostos (1 central + 6 ao redor).
Aparece em templos de Osirís (Abydos), no Palácio de Maria (Israel),
nos estudos de Leonardo da Vinci e em muitas tradições ancestrais.

Matemática: cada círculo periférico passa pelo centro do central.
Resultado: 19 círculos na extensão completa (não renderizamos os 19
por padrão para preservar leveza visual; apenas o "núcleo" 1+6).

**Uso recomendado:**
- Hero backgrounds em landing pages
- Cards de tradição (ornamento sutil)
- Marca d'água em documentos PDF curados

```tsx
<SacredGeometryFlower
  className="absolute -top-10 -right-20 h-[480px] w-[480px] opacity-[0.07]"
  variant="animated"
  colorToken="sacred-gold"
  duration={120}
/>
```

### 2. `<MetatronCube />`

Cubo de Metatron — 13 círculos dispostos a partir da Flor da Vida.
As linhas entre os centros formam os **5 Sólidos Platônicos**
(tetraedro, cubo, octaedro, icosaedro, dodecaedro).

Significado cabalístico/angélico: estrutura geométrica que contém
a essência de toda a matéria (os 5 elementos clássicos).

**Uso recomendado:**
- Cards de conteúdo (representa "o todo unificado")
- Páginas institucionais (sobre, manifesto) como ornamento
- Componentes que precisam transmitir "completude"

```tsx
<MetatronCube
  variant="animated"
  colorToken="cosmic"
  duration={90}
/>
```

### 3. `<SriYantra />`

Sri Yantra — 9 triângulos entrelaçados (4 shiva + 5 shakti) dentro
de um quadrado externo (bhupura). Origem no Tantra Shastra, ~3000+ anos.

Cada par shiva × shakti forma 43 triângulos secundários. O ponto
central (bindu) é o "local de não-dualidade" onde ambos os princípios
se fundem.

**Uso recomendado:**
- Loading states (rotação lenta meditativa)
- Seções de "fundamentos / princípios" (manifesto)
- Foco de meditação interativa (roadmap)

```tsx
<SriYantra
  variant="static"
  colorToken="sacred-gold"
  showFrame
/>
```

### 4. `<FibonacciSpiral />`

Espiral áurea — sequência de arcos de quartos de círculo inscritos em
quadrados cujos lados seguem a Sequência de Fibonacci (1, 1, 2, 3, 5, 8, 13...).
A taxa de crescimento converge para a **proporção áurea** (φ ≈ 1.618).

Aparece em conchas de náutilo, girassóis, galáxias espirais e galáxias —
é a "assinatura da vida".

**Uso recomendado:**
- Divisores de seção (quando se quer contraste geométrico)
- Indicador de progresso "orgânico" (vs. linear)
- Seções de "natureza" / "processo natural"

```tsx
<FibonacciSpiral
  className="h-20 w-20 opacity-30"
  colorToken="sacred-gold"
  segments={6}
  organic
/>
```

### 5. `<HexagonalMandala />`

Mandala hexagonal — favo de mel concêntrico centrado no bindu.
Base do favo de mel (abelhas), da malha de Bézier (design gráfico),
do Selo de Salomão (estrela de 6 pontas = dois triângulos).

Variante "rings" (1, 2, ou 3) controla quantos anéis de hexágonos
orbitam o centro.

**Uso recomendado:**
- Backgrounds institucionais (sobre, manifesto)
- Cards que precisam de "padrão repetível" sem ruído visual
- Loading states onde o Sri Yantra é "pesado demais"

```tsx
<HexagonalMandala
  variant="animated"
  colorToken="ethereal-cyan"
  rings={2}
  duration={90}
/>
```

### 6. `<MandalaDivider />`

Substituto para `<hr />`. Rosa-dos-ventos minimal: 2 círculos + 6 raios
+ bindu central. Suporta label centralizado e orientação vertical.

**Uso recomendado:** sempre que precisar de uma quebra visual em uma página
longa; preferir `size="sm"` para densidade alta, `lg`/`xl` para hero.

```tsx
<MandalaDivider
  colorToken="sacred-gold"
  size="md"
  label="Os 7 Chakras"
  className="mb-6"
/>
```

### 7. `<ChakraBadge />`

Os 7 chakras principais com cores oficiais + sânscrito + significado.
Cores são parte do significado (não decorativas) — texto sempre presente.

**Significados (PT-BR):**
- **Muladhara** (Raiz) — vermelho — sobrevivência e enraizamento
- **Svadhisthana** (Sacral) — laranja — criatividade e sexualidade
- **Manipura** (Solar) — amarelo — poder pessoal e vontade
- **Anahata** (Coração) — verde — amor e compaixão
- **Vishuddha** (Garganta) — azul — expressão e verdade
- **Ajna** (Terceiro Olho) — índigo — intuição e sabedoria
- **Sahasrara** (Coroa) — violeta — transcendência

**Uso recomendado:**
- Badges em perfis de praticantes (mostra quais chakras a pessoa está trabalhando)
- Filtros avançados (em conteúdo tântrico / yóguico)
- Cards de artigo de Tantra, Ayurveda, Meditação

```tsx
<ChakraBadge chakra="anahata" variant="soft" size="sm" showSanskrit />
```

---

## Onde aplicar (do's and don'ts)

### ✅ DO

| Onde | Como | Por quê |
| ---- | ---- | ------- |
| Hero sections | `variant="animated"`, `opacity-5 a -7` | Adiciona profundidade sem competir com CTA |
| Cards de tradição | `variant="static"`, `opacity-10`, posicionado absoluto | Identifica visualmente "essa é a tradição X" sem dominar |
| Loading states | `variant="animated"`, `duration={120s}` | O usuário TEM o tempo de olhar — geometria meditativa |
| Divisores de seção longa | `<MandalaDivider size="sm" />` | Pausa visual elegante; melhor que `<hr />` |
| Páginas institucionais | `variant="static"` canto superior | "Esta é uma página de princípios" — sinaliza cuidado |

### ❌ DON'T

| Onde | Por que NÃO | Alternativa |
| ---- | ----------- | ----------- |
| Acima de texto corrido sem opacity baixa | Concorra com a leitura; cansaço visual | Opacity 3-7%, ou mova pra "background layer" abaixo |
| Acima de CTAs primários | Distrai do objetivo de conversão | Use em hero, não em modal de CTA |
| Em inputs / formulários | Poluição visual durante typing | Apenas no background do formulário inteiro |
| Em fluxos críticos (compra, erro) | YMYL banking/health trust scoring penaliza "ornamento místico" | Reserve para páginas de tradição/contemplativas |
| Vários padrões sobrepostos | Ruído visual, anula o significado | 1 padrão por seção, no máximo |
| Cor única para todos os sites | Quebra o design system | Use os 3 color tokens (`cosmic`, `sacred-gold`, `ethereal-cyan`) com critério |

---

## Como criar novos padrões (template)

A API é estável. Para adicionar um novo padrão (ex: Vesica Piscis, Árvore da Vida
estendida, Toro Sagrado):

```tsx
// src/components/spiritual/NovoPadrao.tsx

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GeometryVariant, GeometryColor } from "./SacredGeometryFlower";
import { COLOR_CLASSES } from "./SacredGeometryFlower";

export interface NovoPadraoProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  variant?: GeometryVariant;
  colorToken?: GeometryColor;
  strokeWidth?: number;
  ariaHidden?: boolean;
  duration?: number;
}

export function NovoPadrao({
  variant = "static",
  colorToken = "sacred-gold",
  strokeWidth = 0.5,
  ariaHidden = true,
  duration = 60,
  className,
  ...rest
}: NovoPadraoProps) {
  const colors = COLOR_CLASSES[colorToken];
  const animClass = variant === "animated" ? "animate-sacred-rotate" : "";

  return (
    <div
      data-slot="novo-padrao"
      data-variant={variant}
      data-color={colorToken}
      className={cn("relative pointer-events-none select-none", className)}
      role={ariaHidden ? "presentation" : "img"}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : "Descrição do padrão para screen readers"}
      {...rest}
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-full h-full", animClass)}
        style={
          variant === "animated"
            ? ({ ["--sacred-duration" as string]: `${duration}s` } as React.CSSProperties)
            : undefined
        }
        preserveAspectRatio="xMidYMid meet"
      >
        {/* geometria aqui */}
      </svg>
    </div>
  );
}

export default NovoPadrao;
```

**Checklist do novo padrão:**
- [ ] `data-slot`, `data-variant`, `data-color` para DevTools
- [ ] `aria-hidden` por padrão, label decritivo quando `false`
- [ ] `aria-label` descritivo para screen readers quando visível
- [ ] `aria-hidden` quando decorator-only
- [ ] viewBox 100×100 (preserva proporção)
- [ ] `vectorEffect="non-scaling-stroke"` no path/line
- [ ] Usa `COLOR_CLASSES` para os 3 tokens
- [ ] Respeita `--sacred-duration` (custom CSS var)
- [ ] Adiciona export em `src/components/spiritual/index.ts`
- [ ] Testa com prefers-reduced-motion (animação deve parar)
- [ ] Adiciona entrada na tabela acima

---

## Animação & reduced-motion

Os 5 padrões SVG usam `animate-sacred-rotate` ou `animate-sacred-rotate-reverse`
quando `variant="animated"`. A duração é customizável via CSS custom property
`--sacred-duration` (default 60s).

**Performance:**
- Animação GPU-only (`transform: rotate()` no compositor)
- `will-change: transform` declarado
- 60fps garantidos em mid-tier Android (Moto G-class, Snapdragon 6xx)

**Acessibilidade:**
- `@media (prefers-reduced-motion: reduce)` zera ambas as animações
- Componentes respeitam via regra local em `globals.css` na seção
  *LOCAL REDUCED-MOTION OVERRIDES* (~linha 2305)

```css
.animate-sacred-rotate,
.animate-sacred-rotate-reverse {
  animation: none !important;
}
```

---

## Wireframes de uso

### Hero page (variant="animated", opacity-5 a 7)

```
┌──────────────────────────────────────────────┐
│        ╭──────────╮                          │
│       │   ◯◯◯◯   │  SacredGeometryFlower    │
│       │   ◯◯◯◯   │  (absolute, top-right,   │
│       │    ◯◯◯    │   opacity 7, animated)  │
│        ╰──────────╯                          │
│   ╔══════════════════════════════════════╗   │
│   ║  Akasha Portal                       ║   │
│   ║  Comunidade Viva de Espiritualidade  ║   │
│   ║  [Entrar]   [Explorar]              ║   │
│   ╚══════════════════════════════════════╝   │
│                                              │
│   ╔══════╗ ╔══════╗ ╔══════╗                  │
│   ║ card ║ ║ card ║ ║ card ║                  │
│   ╚══════╝ ╚══════╝ ╚══════╝                  │
└──────────────────────────────────────────────┘
```

### Library (HexagonalMandala background, MandalaDivider section)

```
┌──────────────────────────────────────────────┐
│ ◯◯◯◯◯  HexagonalMandala no canto sup. dir     │
│         (opacity 4, animated, 150s)          │
│ ─── ✦ ─── Acervo Curado ─── ✦ ───            │
│         MandalaDivider (size=sm)             │
│ ┌────────────┐ ┌────────────┐                │
│ │ Article #1 │ │ Article #2 │                │
│ └────────────┘ └────────────┘                │
│                                              │
│              ─── ✦ ───                       │
│         MandalaDivider (size=lg)             │
│              ◯◯◯◯                           │
│         FibonacciSpiral (size=20)            │
└──────────────────────────────────────────────┘
```

### Loading state (SriYantra, animated)

```
┌──────────────────────────────────────────────┐
│  ╱╲╱╲╱╲╱╲                                  │
│ ╱╲╱╲ ╱╲╱╲  SriYantra no canto sup. dir     │
│ ╲╱╲╱ ╲╱╲  (absolute, opacity 6, 120s)       │
│ ╱╲╱╲╱╲╱╲   ─── skeleton skeleton ───        │
│                                              │
│  ┌─────────────────┐                         │
│  │ PostCardSkeleton│                         │
│  └─────────────────┘                         │
└──────────────────────────────────────────────┘
```

### Chakras strip (homepage bottom, ChakraBadge + MandalaDivider)

```
              ═══ ✦ Os 7 Chakras ✦ ═══

   Muladhara Svadhisthana Manipura Anahata Vishuddha Ajna Sahasrara
    (Raiz)    (Sacral)   (Solar)  (Cor.) (Garg.) (3º)   (Coroa)
   [vermelho][laranja] [amarelo][verde][azul] [índigo][violeta]
```

---

## Métricas de adoção (a medir)

| Página                       | Componentes aplicados | Onde |
| ---------------------------- | --------------------- | ---- |
| `/` (home)                   | SacredGeometryFlower, HexagonalMandala, MandalaDivider, ChakraBadge × 7 | Hero, fundo de seção, strip de chakras |
| `/library`                   | HexagonalMandala, MandalaDivider, FibonacciSpiral | Background do main, divisores, footer |
| `/validacao` (Variant A)     | SacredGeometryFlower, MandalaDivider | Hero ornament, divisor pré-footer |
| `/manifesto`                 | MetatronCube, MandalaDivider | Article ornament, divisor pré-lista |
| `/about`                     | HexagonalMandala, MandalaDivider | Article ornament, divisor pré-pilares |
| `/feed` (loading)            | SriYantra              | Loading ornament |

Total: **8 componentes distintos aplicados em 6 páginas** (≥ mínimo de 5).

---

## File map

```
src/components/spiritual/
├── SacredGeometryFlower.tsx     # Flor da Vida (7 circles)
├── MetatronCube.tsx              # Cubo de Metatron (13 + Platonic lines)
├── SriYantra.tsx                 # Sri Yantra (9 triangles + bindu)
├── FibonacciSpiral.tsx           # Espiral áurea (Fibonacci arcs)
├── HexagonalMandala.tsx          # Mandala hexagonal (1-3 rings)
├── MandalaDivider.tsx            # <hr/> substituto c/ motivo geométrico
├── ChakraBadge.tsx               # 7 chakras + CHAKRA_META
├── tradition-badge.tsx           # pré-existente, preservado
└── index.ts                      # barrel export atualizado

src/app/globals.css               # +akasha-sacred-rotate{,-reverse} + .animate-sacred-rotate*
```

---

## Próximos passos sugeridos (fora desta wave)

- **Mesa Real** — geometria aplicada como layout (não só ornament) das 36 casas
- **Árvore da Vida** (10 sephiroth) — versão interativa no roadmap do cabalista
- **Toro Sagrado / Torus** — geometria 3D leve que respira (CSS ou Lottie)
- **Vesica Piscis** — complemento da Flor da Vida (interseção de 2 círculos)
- **Sound + geometry** — sincronizar rotação com audio meditativo (Tantra mode)
- **Export como PNG** — botão "baixar meditação" gerando SVG/PNG do padrão
