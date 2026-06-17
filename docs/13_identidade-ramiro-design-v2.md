<!-- NOTE: This document may be outdated. Review needed before relying on it. -->
# Documento 13 — Identidade Cigano Ramiro & Design System v2
## Cabala dos Caminhos — LEGADO B2B

> ⚠️ **LEGADO B2B — referência histórica (não-canônico).** Este documento pertence ao produto **Cockpit Oracular / Mesa Real (B2B)**, descontinuado com o pivô para o **Sistema Akasha (B2C)**. Permanece apenas como registro do `apps/legacy-cockpit` (mantido durante a migração, depois desligado). **Visão vigente: Doc 25 (Visão Akasha) + Doc 26 (Identidade Akasha).** Não usar como fonte para o produto Akasha. A identidade Cigano Ramiro (paleta laranja + azul royal, persona umbandista) aqui descrita foi integralmente aposentada e **substituída pelo Doc 26 (Identidade Akasha cósmica)**.

> **Tipo:** Identidade de marca + Design System (fonte canônica da paleta)
> **Versão:** 2.0 | **Resolve:** G1, G2 e as inconsistências I1, I2 do Doc 10
> **Regra:** Em qualquer divergência de cor entre documentos, **este documento prevalece.**

---

## 1. A Consagração ao Cigano Ramiro

O sistema **Cabala dos Caminhos** é consagrado ao **Cigano Ramiro**, entidade da linha do Povo Cigano (Umbanda) que rege a abertura de caminhos, a leitura do destino e a proteção do consulente em sua jornada. Toda a identidade — nome, cores, tom e a persona do Oráculo — nasce desse vínculo.

O Cigano Ramiro é, simultaneamente:
- **Fogo que abre caminho** — luz, movimento, oportunidade, a notícia que chega, a estrada que se revela.
- **Profundidade que protege** — mistério, nobreza, a sabedoria que vê o que está oculto e guarda o consulente.

Esse duplo princípio (fogo + profundidade) é a chave de leitura de **toda** a identidade visual e verbal. Onde o sistema **age**, ele é laranja (fogo). Onde o sistema **sustenta e revela profundidade**, ele é azul royal.

---

## 2. Tom de Marca

| Eixo | Definição |
|---|---|
| **Místico** | Fala a partir da tradição oracular, com reverência ao sagrado. Nunca trivializa o destino. |
| **Tecnológico** | Precisão de cockpit. Nada de floreio gratuito: cada elemento tem função. |
| **Direto** | O Oráculo de Ramiro não enrola. Diz o que vê, dá a direção, fecha. |
| **Protetor** | Nunca alarmista. Mesmo um aviso duro é entregue como cuidado, não como sentença. |

A persona do Oráculo (system prompt — Docs 06 e 09) deve respirar esse tom: 2ª pessoa, místico-tecnológico, protetor, direto. Nunca genérico, nunca fatalista.

---

## 3. Paleta de Cores v2 (Tokens Canônicos)

Substitui integralmente a paleta dourado/âmbar + esmeralda da v1 (Doc 05 §1.1).

```css
:root {
  /* Backgrounds — azul-noite (harmoniza com o royal) */
  --bg-canvas:   #0A0E1A;  /* fundo principal */
  --bg-surface:  #111726;  /* cards e painéis */
  --bg-elevated: #1A2236;  /* elementos elevados */
  --bg-border:   #2A3550;  /* bordas */

  /* Primária — LARANJA (Ramiro: luz, fogo, movimento, abertura de caminhos) */
  --accent-orange:        #F97316;
  --accent-orange-bright: #FB923C;
  --accent-orange-dim:    #C2410C;
  --accent-orange-glow:   rgba(249,115,22,0.18);

  /* Secundária — AZUL ROYAL (Ramiro: profundidade, mistério, nobreza, proteção) */
  --accent-royal:        #2547D0;
  --accent-royal-bright: #3B5BDB;
  --accent-royal-dim:    #1E3A8A;
  --accent-royal-glow:   rgba(37,71,208,0.18);

  /* Alerta — mantém */
  --accent-alert: #F43F5E;

  /* Texto */
  --text-primary:   #F5F7FF;
  --text-secondary: #9AA7C7;
  --text-muted:     #56618A;
}
```

### 3.1 Equivalência Tailwind

Para uso nas classes utilitárias (extend em `tailwind.config.ts`), os tokens mapeiam aproximadamente para:

| Token | Tailwind aproximado |
|---|---|
| `--accent-orange` `#F97316` | `orange-500` |
| `--accent-orange-bright` `#FB923C` | `orange-400` |
| `--accent-orange-dim` `#C2410C` | `orange-700` |
| `--accent-royal` `#2547D0` | entre `blue-700`/`indigo-600` (custom) |
| `--accent-royal-bright` `#3B5BDB` | `indigo-500` |
| `--accent-royal-dim` `#1E3A8A` | `blue-900` |
| `--accent-alert` `#F43F5E` | `rose-500` |

> Recomendado registrar as cores `royal` como custom no Tailwind, pois não há equivalente exato no padrão.

---

## 4. Mapeamento Semântico das Cores

A regra de ouro: **laranja = ação; azul royal = estrutura e profundidade.**

### 4.1 Laranja (elementos ativos / fogo)
- Casa preenchida (borda e glow do slot na Mesa Real).
- Botão "Gerar Dossiê" e "Enviar" (consulta Q&A).
- Títulos `h2` de casa no dossiê.
- Palavra-chave de destaque na linha-síntese.
- Estado ativo/hover de navegação e CTAs primários.
- Indicador de progresso quando a mesa está completa (pulse laranja).

### 4.2 Azul Royal (estrutura / profundidade)
- Badges astrológicos e badge do Odu Natal.
- Glows internos de painéis e cards.
- Linha-síntese em itálico (`em`) do dossiê.
- Bordas e separadores de seção.
- Bolhas do Oráculo no chat de consulta (ver Doc 12).

### 4.3 Remapeamento dos Badges (substitui Doc 05 §4.2, l.224-227)

A v1 usava 4 famílias (blue/purple/amber/emerald). A v2 colapsa tudo em **royal + laranja**, diferenciando por intensidade e não por matiz:

| Variante | v1 (antigo) | v2 (novo) |
|---|---|---|
| `astro` | blue-950/700/300 | `bg-royal-dim/15 border-royal/40 text-royal-bright` |
| `kabala` | purple-950/700/300 | `bg-royal/10 border-royal-bright/40 text-text-primary` |
| `tantric` | amber-950/700/300 | `bg-orange-dim/15 border-orange/40 text-orange-bright` |
| `odu` | emerald-950/700/300 | `bg-royal/15 border-royal-bright/50 text-royal-bright` |

> Princípio: numerologia tântrica (ligada ao dom/fogo da alma) puxa para o laranja; astrologia, cabala estrutural e Odu (estrutura e profundidade) puxam para o royal. Mantém legibilidade no dark mode com contraste AA.

---

## 5. Tipografia

Mantida da v1 (continua coerente com o tom místico-tecnológico):

```css
/* Títulos místicos, nomes de casas, elementos de destaque */
font-family: 'Cinzel', serif;          /* 400, 600, 700 */

/* Dados, labels, textos de interface */
font-family: 'Cormorant Garamond', serif; /* 300, 400, 600 */

/* Números de casas, dados técnicos, IDs */
font-family: 'JetBrains Mono', monospace;  /* 400 */

/* Corpo do dossiê gerado pela IA e do chat de consulta */
font-family: 'Lora', serif;            /* 400, 500 */
```

---

## 6. Efeitos e Glows (v2)

Onde a v1 usava `rgba(245,158,11,...)` (âmbar), a v2 usa:
- **Slot/CTA ativo:** `--accent-orange-glow` → `rgba(249,115,22,0.18)`.
- **Profundidade de painel:** `--accent-royal-glow` → `rgba(37,71,208,0.18)`.

Exemplo de container do grid (atualização do Doc 05 §4.3):

```
shadow-[inset_0_0_60px_rgba(37,71,208,0.05)]   /* profundidade royal ao fundo */
```

E o glow do slot preenchido passa de âmbar para laranja:

```
border-orange-500/40
shadow-[0_0_12px_rgba(249,115,22,0.10)]
hover:shadow-[0_0_20px_rgba(249,115,22,0.18)]
```

---

## 7. Checklist de Migração da Paleta (para o agente)

Ao aplicar a v2 no código e nos docs, troque **toda** referência:

- [ ] `--accent-gold` / `amber-*` / `#f59e0b` / `rgba(245,158,11,...)` → `--accent-orange` / `orange-*` / `#F97316`.
- [ ] `--accent-emerald` / `emerald-*` / `#10b981` → `--accent-royal` / royal tokens.
- [ ] Backgrounds `slate-950/900/800/700` → `--bg-canvas/surface/elevated/border`.
- [ ] "pulsa em âmbar" → "pulsa em laranja" (Doc 07 S3.5).
- [ ] "cores âmbar/esmeralda" → "cores laranja/azul royal" (Doc 07 S4.3).
- [ ] Títulos `h2` do dossiê: `color: #f59e0b` → `#F97316`.
- [ ] `em` do dossiê: `color: #10b981` → `#3B5BDB` (royal-bright).

---

*Este documento é a referência única da identidade visual. Docs 01 e 05 apontam para cá.*
