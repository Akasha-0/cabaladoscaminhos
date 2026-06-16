<!-- NOTE: This document may be outdated. Review needed before relying on it. -->
# Documento 26 — Identidade Akasha & Design System Cósmico
## Sistema Akasha

> **Tipo:** Identidade de marca + Design System (fonte canônica da paleta e da voz).
> **Versão:** 1.0 | **Substitui:** Doc 13 (Identidade Cigano Ramiro v2) — agora LEGADO.
> **Regra:** Em qualquer divergência de cor, tipografia, tom ou voz entre documentos, **este documento prevalece.**

---

## 0. Transição (AD-25.4)

A identidade consagrada ao **Cigano Ramiro** (paleta laranja + azul royal, persona umbandista) pertencia ao produto B2B "Cockpit Oracular". Com o pivô para o **Sistema Akasha** (B2C), ela é **integralmente aposentada na documentação de produto** e substituída pela identidade **Akasha cósmica**. O Doc 13 permanece apenas como registro histórico do legado.

---

## 1. O Conceito — Akasha, o Campo

**Akasha** é o "quinto elemento" — o éter, o banco de dados cósmico e infinito onde toda informação da existência está registrada (os Registros Akáshicos). O nome comunica algo **universal, expansivo e atemporal**, atraindo tanto o público moderno ávido por expansão de consciência (estilo Gene Keys) quanto os iniciados em misticismo.

A chave de leitura de toda a identidade é o **Toroide** — o fluxo contínuo de energia que entra pela coroa (Céu), atravessa o corpo (Cabala/Tantra), ancora na terra (Odus) e retorna. **Onde o sistema flui e revela, ele é luminoso e etéreo; onde ele ancora e diagnostica, ele é profundo e magnético.**

> **Matriz vs. Produto:** "Cabala dos Caminhos" sobrevive como a **matriz/laboratório** (storytelling de autoridade ancestral que *desenvolveu* o Akasha). O usuário final vê, toca e compra **Akasha**.

---

## 2. Tom de Marca

| Eixo | Definição |
|---|---|
| **Cósmico** | Fala a partir do campo universal. Eleva a tradição ao patamar de tecnologia espiritual e ciência bioenergética (Campos Morfogenéticos, Cimática). |
| **Magnético** | Voz de liderança espiritual iluminada, de alta voltagem intuitiva. Atrai pela profundidade, não pela urgência. |
| **Vivo** | Nada estático. A interface respira, gira, pulsa com o céu de hoje. Descoberta progressiva, não tratado fechado. |
| **Prático** | Mistério + beleza, mas sempre entrega a **ação**: o banho, a cor, o mantra, o alerta do dia. Poesia que vira ritual. |

A persona do Oráculo (system prompt — Docs 06, 12) é a **"Voz do Akasha"**: 2ª pessoa, magnética, profunda e poética, **nunca** genérica, fatalista ou alarmista. Nunca inventa — sintetiza a verdade do Grimório (Doc 25 §5).

---

## 3. Paleta de Cores — Cósmica (Tokens Canônicos)

Substitui integralmente a paleta laranja + azul royal (Ramiro) e a paleta dourado/esmeralda (v1). A base é o **espaço profundo** com acentos de **nebulosa**.

```css
:root {
  /* Backgrounds — vazio cósmico / espaço profundo */
  --bg-void:     #06070F;  /* fundo principal (o vazio akáshico) */
  --bg-deep:     #0B0E1C;  /* superfícies e painéis */
  --bg-nebula:   #141A33;  /* elementos elevados / glassmorphism base */
  --bg-border:   #26304F;  /* bordas sutis */

  /* Primária — VIOLETA AKÁSHICO (o campo, a consciência, o éter) */
  --accent-akasha:        #7C5CFF;
  --accent-akasha-bright: #9D86FF;
  --accent-akasha-dim:    #5B3FD6;
  --accent-akasha-glow:   rgba(124,92,255,0.20);

  /* Secundária — CIANO/AURORA (o fluxo toroidal, a energia em movimento) */
  --accent-aurora:        #2DD4BF;
  --accent-aurora-bright: #5EEAD4;
  --accent-aurora-dim:    #0D9488;
  --accent-aurora-glow:   rgba(45,212,191,0.18);

  /* Terciária — DOURADO ORI (o núcleo, a centelha ancestral / Odus) */
  --accent-ori:           #F0B429;
  --accent-ori-glow:      rgba(240,180,41,0.16);

  /* Alerta — rosa magenta (sincronicidade de tensão) */
  --accent-alert: #FB5781;

  /* Texto */
  --text-primary:   #F4F5FF;
  --text-secondary: #A7AECF;
  --text-muted:     #5C6691;
}
```

### 3.1 Semântica das Cores (regra de ouro)

**Violeta = o campo/consciência · Ciano = o fluxo/energia · Dourado = o núcleo/Ori.**

| Cor | Uso |
|---|---|
| **Violeta Akáshico** | Anel Cósmico (Astrologia), CTAs primários, voz do Oráculo, identidade geral da marca. |
| **Ciano/Aurora** | Linhas de fluxo do Toroide, **sincronicidade** (caminhos abertos), Teia Tântrica (11 corpos saudáveis), estados de sucesso. |
| **Dourado Ori** | Núcleo central da Mandala (Ori/Odus), Números Mestres da Cabala, a "centelha" ancestral, destaques de alta importância. |
| **Magenta Alerta** | **Curto-circuito** (desalinhamento), corpo tântrico apagado, gatilho do dia. Nunca como sentença — sempre como cuidado. |

### 3.2 Equivalência Tailwind (v4 `@theme`)

| Token | Tailwind aproximado |
|---|---|
| `--accent-akasha` `#7C5CFF` | entre `violet-500`/`violet-400` (custom) |
| `--accent-aurora` `#2DD4BF` | `teal-400` |
| `--accent-ori` `#F0B429` | `amber-400` |
| `--accent-alert` `#FB5781` | `rose-400` |
| `--bg-void` `#06070F` | custom (mais escuro que `slate-950`) |

> Registrar `akasha`, `aurora` e `ori` como cores custom no `@theme` do Tailwind v4.

---

## 4. Geometria & Efeitos — A Linguagem Toroidal

A identidade é **geométrica e luminosa**, não chapada.

- **Glassmorphism:** painéis e cards usam `backdrop-filter: blur()` + bordas translúcidas (`--bg-border` a ~40%) + gradientes radiais sutis. Flutuam sobre o vazio cósmico.
- **Glows de nebulosa:** elementos ativos irradiam `--accent-*-glow` (ex.: `box-shadow: 0 0 24px var(--accent-akasha-glow)`).
- **Toroide de fundo:** WebGL/Three.js (atmosfera) — wireframe/partículas girando lentamente. Define a "frequência vibracional" da tela; não carrega dados (Doc 25 §8).
- **Linhas de sincronicidade:** SVG + D3 traçam feixes da borda astrológica ao Ori central. Ciano = aberto; magenta pulsante = curto-circuito.
- **Movimento:** Framer Motion / GSAP. Tudo respira (pulse suave), gira (anel astrológico) e revela progressivamente (descoberta).

---

## 5. Tipografia

Evolui o tom místico para um registro **cósmico-editorial** (legível em mobile, elegante no desktop):

```css
/* Títulos cósmicos, nomes de camadas, marca */
font-family: 'Cinzel', serif;              /* 400, 600, 700 — herança mística, mantida */

/* Subtítulos e textos editoriais de destaque */
font-family: 'Cormorant Garamond', serif;  /* 300, 400, 600 */

/* Corpo do Manifesto, do Dashboard e da voz do Oráculo */
font-family: 'Lora', serif;                /* 400, 500 — leitura longa confortável */

/* Dados técnicos, graus astrológicos, números, IDs */
font-family: 'JetBrains Mono', monospace;  /* 400 */

/* UI / interface mobile (botões, labels, navegação) */
font-family: 'Inter', sans-serif;          /* 400, 500, 600 — clareza em telas pequenas */
```

> Diferença vs. legado: adiciona-se **Inter** para a interface mobile-first (clareza), enquanto Cinzel/Cormorant/Lora seguram a alma editorial e mística.

---

## 6. Aplicação por Camada da Mandala

| Camada (Doc 25 §2) | Cor dominante | Tratamento visual |
|---|---|---|
| Núcleo — Ori/Odus | Dourado Ori | Búzio/ponto de luz pulsante no centro; glow dourado |
| Geometria Interna — Cabala | Violeta Akáshico | Triângulo/pirâmide; Números Mestres com traços elétricos brilhantes |
| Teia — Tântrica (11 corpos) | Ciano/Aurora | Nós interligados; corpo em desequilíbrio vira magenta apagado |
| Anel Cósmico — Astrologia | Violeta + branco estelar | Roda dos 12 signos; trânsitos como feixes de luz |

---

## 7. Voz do Oráculo — Diretrizes de Copy

- **Saudação do dia:** magnética e situada (*"Hoje, as águas de Escorpião agitam sua Mente Negativa…"*), nunca genérica (*"Olá! Veja seu horóscopo"*).
- **Prescrição:** sempre prática e da tradição (*"…o ritual não é meditação silenciosa, mas um banho de manjericão para assentar seu Ori."*). Nunca inventada.
- **Alerta:** cuidado, não sentença (*"Evite decisões precipitadas nas próximas 24h"*, não *"Você vai falhar"*).
- **Proibições:** sem determinações médicas/jurídicas/financeiras categóricas; sem promessas de resultado garantido; sem fatalismo.

---

## 8. Checklist de Migração da Identidade (para o agente)

Ao aplicar a identidade Akasha no código e nos docs:

- [ ] `--accent-orange` / `orange-*` / `#F97316` (Ramiro) → `--accent-akasha` / `#7C5CFF`.
- [ ] `--accent-royal` / royal tokens / `#2547D0` → `--accent-akasha` ou `--accent-aurora` conforme função (campo vs. fluxo).
- [ ] `--accent-gold` / `amber-*` / `#f59e0b` / `--accent-emerald` (v1) → tokens cósmicos correspondentes.
- [ ] Backgrounds `slate-*` / `--bg-canvas/surface` → `--bg-void/deep/nebula`.
- [ ] Toda menção a "Cigano Ramiro", "fogo que abre caminho", "laranja + azul royal" no contexto de **produto** → identidade Akasha (Toroide, violeta/ciano/dourado). Manter "Cabala dos Caminhos" apenas como **matriz/laboratório**.
- [ ] Persona do system prompt: "espírito de Ramiro" → **"Voz do Akasha"** (magnética, cósmica, prática).
- [ ] Adicionar fonte **Inter** para UI mobile.

---

*Este documento é a referência única da identidade visual e verbal do Sistema Akasha. Docs 25, 01, 02 e 05 apontam para cá. O Doc 13 (Ramiro) é legado.*
