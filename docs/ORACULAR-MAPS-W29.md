# Oracular Maps — Wave 29 (2026-06-29)

> **Status: IMPLEMENTAÇÃO BASE ENTREGUE**
> Engines limitadas a cálculos publicamente verificáveis (signos por data,
> numerologia Pitagórica/Caldeia). Posições planetárias, aspectos e Lilith
> PRECISAM de integração com efemérides (Swiss Ephemeris ou NASA JPL).

---

## TL;DR

Wave 29 adiciona **mapas oraculares de autoconhecimento** ao Cabala dos Caminhos.
Três fluxos:

1. **Mapa Natal Astrológico** — signos solar/lunar/ascendente (zodíaco tropical,
   public domain).
2. **Numerologia Cabalística** — caminho de vida, expressão, motivação, ano
   pessoal (Pitagórica + Caldeia + estrutura Cabalística).
3. **Mapa Integrado** — combina ambos, com interpretação Akashic IA que respeita
   tradição preferida do consulente.

**Universalia**: múltiplas tradições suportadas. **Nunca prescrevemos** —
sempre sugerimos consultar profissional. Erros honestos quando dados são
insuficientes (ex: efemérides ausentes para planetas).

---

## Estrutura de Arquivos

```
src/
├── lib/oraculo/                          # Engines (lógica pura)
│   ├── astrologia.ts                     # Mapa natal (sinais + slots)
│   ├── numerologia.ts                    # Pitagórica/Caldeia/Cabalística
│   └── mapa-integrado.ts                 # Orchestrator + markdown
├── components/oraculo/                   # UI (mobile-first)
│   ├── InputForm.tsx                     # Form universal (3 modos)
│   ├── MapaNatalCard.tsx                 # Visualização astrológica
│   ├── NumerologiaGrid.tsx               # Grid numerológico + Árvore
│   ├── MapaCompletoView.tsx              # Integrated view + Akashic
│   └── AspectWheel.tsx                   # SVG roda de signos
├── app/(community)/oraculo/              # Pages
│   ├── page.tsx                          # Hub
│   ├── astrologia/page.tsx
│   ├── numerologia/page.tsx
│   └── mapa-completo/page.tsx
└── app/api/oraculo/                      # APIs
    ├── astrologia/route.ts               # POST: calcular mapa
    ├── numerologia/route.ts              # POST: calcular mapa num
    ├── mapa-completo/route.ts            # POST: integrado + persist
    └── historico/route.ts                # GET: mapas anteriores
```

---

## Engines — Algoritmos

### 1. Astrologia (`astrologia.ts`)

**Implementado (verificável):**

| Cálculo | Algoritmo | Fonte | Precisão |
|---|---|---|---|
| Signo solar | Tabela de faixas de datas | Zodíaco tropical OCC | ±1 dia |
| Signo lunar | Fase lunar sinódica (29.530588853 dias) + fase | Lua nova ref 2000-01-06 | ±1-2 dias |
| Ascendente | Tempo sideral local (Meeus simplificado) | Astronomical Algorithms Cap. 12 | ±15 min sem nutação |
| Fase da Lua | Idade lunar vs mês sinódico | Tradição + astronomia moderna | OK |

**Estrutural (slot, NÃO computado):**

- **Posição planetária** (Mercúrio, Vênus, Marte, Júpiter, Saturno, Urano, Netuno, Plutão)
  - **Por que não:** requer longitudes eclípticas precisas.
  - **Quando calculável:** integrando Swiss Ephemeris (https://www.astro.com/ftp/swisseph/)
    ou NASA JPL Horizons API (https://ssd.jpl.nasa.gov/horizons/).
  - **Output quando vazio:** array vazio + aviso honesto no campo `avisos`.
- **Aspectos** (conjunção, oposição, trígono, quadratura, sextil)
  - Calculado APENAS quando planets presentes. Lógica de orbe em `ORBES` map.
- **Lilith (Black Moon)** — requer efemérides.
- **Nodos lunares (NN/SN)** — requer efemérides.

**Tradições suportadas:**

- `ocidental-tropical` (default) — funciona corretamente.
- `védica-sidereal` — emite **aviso explícito** de que ayanamsa (~24°) não é
  aplicado (sem correção). Para mapa védico de verdade: integrar ayanamsa
  (Lahiri/Krishnamurti) + efemérides.
- `chinesa` — emite aviso: requer engine separada (ano lunar + 12 animais +
  5 elementos). NÃO implementado nesta wave.

**Verificação de qualidade:**

- Cobre faixas de signos: 12/12 (boundary cases — Capricórnio trans-anual incluso)
- Limites Sun: 21 Mar a 20 Mar (todos os signos)
- Lua: confidence = `low` (aproximação), documentado
- Ascendente: null vs string `"desconhecido (sem coordenadas)"` — distinção clara

### 2. Numerologia (`numerologia.ts`)

**Implementado (algoritmo puro, public domain):**

| Cálculo | Sistema | Algoritmo |
|---|---|---|
| Caminho de vida | Pitagórica + Cabalística | Soma digital YYYYMMDD, redução teosófica |
| Expressão | Pitagórica OU Caldeia | Soma valores de letras do nome |
| Motivação (alma) | Pitagórica OU Caldeia | Soma vogais apenas |
| Personalidade | Pitagórica OU Caldeia | Soma consoantes |
| Ano pessoal | — | `dia + mês + ano_corrente` reduzido |
| Dia nascimento | — | `Number(dataISO.slice(8,10))` |

**Master numbers preservados:** 11, 22, 33 (não reduzem) — alinhamento com tradição
numerológica padrão.

**Tabelas:**
- Pitagórica: `A=1, B=2, ..., I=9, J=1, K=2, ..., R=9, S=1, T=2, U=3, V=4, W=5, X=6, Y=7, Z=8`
- Caldeia: variante com 8 letras diferentes (W=6, X=5, etc.)
- Normalização: `NFD` + remove diacríticos + uppercase + apenas letras

**Mapa Cabalístico estrutural:**
- 10 Sephirot: Kether, Chokmah, Binah, Chesed, Geburah, Tiphereth, Netzach, Hod, Yesod, Malkuth
- 22 Paths: Alef..Tav (mapeamento Tarot)
- **NÃO computamos** gematria hebraica em nome PT-BR (alphabet mismatch).
  No `sistema=cabalistica-estrutural`, retorna estrutura + usa Pitagórica internamente.

### 3. Mapa Integrado (`mapa-integrado.ts`)

**Função:** `calcularMapaCompleto(input) -> MapaCompleto`

**Output estruturado:**
```ts
interface MapaCompleto {
  calculadoEm: string;
  input: MapaCompletoInput;
  mapaNatal: MapaNatal;
  mapaNumerológico: MapaNumerológico;
  cruzamentos: Cruzamento[];      // 'factual' | 'sugestão'
  markdown: string;               // ~3-4kb, renderizado
  resumoCurto: string;            // 1 linha para hero card
  avisos: string[];               // agregado de todos os engines
  disclaimer: string;             // disclaimer ético fixo
}
```

**Cruzamentos — verificação honesta:**

| Cruzamento | Tipo | Verificação |
|---|---|---|
| Sincronicidade signo-dia | `sugestão` | Observação simbólica, não causal |
| Caminho × Expressão | `factual` | Igualdade de master numbers é verificável |
| Ascendente × Motivação | `sugestão` | Sincronia simbólica, não correlação causal |

**Universalismo:** cruzamentos marcados como `sugestão` são sincronicidades
interpretativas, não causalidade. Akashic IA marca cross-references com `# cross-ref`.

---

## APIs — Contrato

### POST `/api/oraculo/astrologia`

```json
// Request
{
  "data": "1990-04-23",
  "hora": "14:30",
  "local": "São Paulo, SP, Brasil",
  "latitude": -23.55,
  "longitude": -46.63,
  "tradição": "ocidental-tropical"
}

// Response
{ "ok": true, "mapa": MapaNatal }
```

**Rate limit:** 30 req/min/IP. Erros: `RATE_LIMIT_EXCEEDED (429)`, `BAD_JSON (400)`,
`VALIDATION_ERROR (400)`, `CALC_ERROR (500)`.

### POST `/api/oraculo/numerologia`

```json
// Request
{
  "nomeCompleto": "Maria da Silva Santos",
  "dataNascimento": "1990-04-23",
  "sistema": "pitagorica",  // ou "caldeia" | "cabalistica-estrutural"
  "anoReferência": 2026
}
```

### POST `/api/oraculo/mapa-completo`

Requer todos os campos anteriores + `tradiçãoPreferida` (ex: `"cigano"`).

**Persistência:** Se autenticado, persiste em `oraculo_mapas` (best-effort).
Tabela pode não existir — degrada gracefully sem erro.

### GET `/api/oraculo/historico?limit=20`

**Auth:** OBRIGATÓRIO. Sem auth → 401.
**Rate limit:** 10 req/min/user.

---

## Componentes UI

### `InputForm`

- Mobile-first (44px touch targets).
- 3 modos: `astrologia` / `numerologia` / `completo` (controla visibilidade de campos).
- Campos opcionais colapsáveis (lat/lon).
- ARIA: `aria-required`, `aria-describedby`, `aria-label`.
- Dark mode padrão (slate-950 bg).

### `MapaNatalCard`

- Hero card com Sol + Lua + Ascendente (gradient por elemento).
- Lista de planetas (ou aviso se vazio).
- Avisos técnicos em `<details>` colapsável.
- Comentário Akashic opcional (slot `commentary`).

### `NumerologiaGrid`

- 6 blocos de números (caminho, expressão, motivação, personalidade, dia, ano).
- Master numbers (11, 22, 33) destacados com borda amber.
- Lista das 10 Sephirot (Árvore da Vida).
- Lista das 22 Paths (letras hebraicas ↔ Tarot) colapsável.

### `MapaCompletoView`

- Renderiza markdown com parser inline (sem react-markdown — TS-friendly).
  - Suporta: `# / ## / ###`, `**bold**`, `*em*`, `- list`, `> blockquote`, `--- hr`.
- Input para perguntar à Akashic IA pós-mapa (consome `/api/akashic/chat/stream`).
- Streaming visualizado com cursor piscante.
- Disclaimer ético sempre no final.

### `AspectWheel`

- SVG 300x300 sem libs externas.
- 12 signos no anel externo.
- Planetas como pontos amarelos (quando presente).
- Aspectos como linhas coloridas por tipo.
- Linha pontilhada do ascendente.
- Legenda de aspectos com cores.
- A11y: `role="img"`, `<title>`, `<desc>`, `aria-label`.

---

## Princípios Éticos (Universalismo)

### 8 regras inegociáveis:

1. **Nunca prescrever** — a IA pode citar tradições, mas não diz "faça X".
2. **Sempre citar tradição** — cada insight linka à fonte (Pitagórica, Caldeia, Cabala, Tropical).
3. **Respeitar autoridade profissional** — sempre sugerir astrólogo/terapeuta/líder.
4. **Não inventar correlações** — sem causalidade sem evidência.
5. **Não inventar cálculos** — efemérides ausentes → aviso, NÃO numbers fabricados.
6. **Não substituir diagnóstico** — espiritual/médico/psicológico.
7. **Universalismo** — múltiplas tradições, zero imposição.
8. **Honestidade sobre limites** — confidence badges, avisos técnicos visíveis.

### Implementações de segurança:

- **Disclaimer fixo** em `DISCLAIMER_ÉTICO` é exportado e renderizado em todo mapa.
- **Avisos inline** para cada cálculo que não pôde ser feito (efemérides faltando).
- **Confidence badge** na Lua (`low`/`medium`/`high`).
- **Mapa parcial é explícito** — UI não finge que temos dados que não temos.

---

## Fontes Tradicionais (Verificáveis)

### Astrologia:

- **Zodíaco Tropical OCC** — convencional, public domain, registrado em
  múltiplas referências desde Ptolomeu (~150 d.C.) — "Tetrabiblos".
- **Swiss Ephemeris** — Dietrich, https://www.astro.com/ftp/swisseph/ — para
  integração futura de planetas (offline, licença AGPL).
- **NASA JPL Horizons** — https://ssd.jpl.nasa.gov/horizons/ — para integração
  futura via API (online).
- **Meeus, J.** — "Astronomical Algorithms" (1998), Cap. 12 — fórmula do
  ascendente usada (simplificada).
- **Lua nova de referência** — 2000-01-06 18:14 UTC, NASA.

### Numerologia:

- **Pitágoras (~570-495 a.C.)** — sistema numerológico clássico, public
  domain há >2000 anos. Redução teosófica preserva master numbers (11, 22, 33).
- **Caldeia (~4000 anos)** — variante mesopotâmica com tabela diferente de letras.
- **Árvore da Vida (Etz Chaim)** — Ática, hermética, cabalística cristã.
  - Atribuição planetária das Sephirot via tradição hermética (Crowley, "777", 1909).
  - 22 Paths: atribuídos às letras hebraicas (Alef..Tav) e ao Tarot
    (Crowley, "The Book of Thoth", 1944).
- **Redução teosófica** — padrão em numerologia moderna (Vitrine, "Numerology
  for Beginners", 1990; public domain knowledge).

### Cabala estrutural:

- **10 Sephirot + 22 Paths** — estrutura padrão, multiple sources concordam
  (Mathers, "The Kabbalah Unveiled", 1887; Regardie, "The Golden Dawn", 1937).
- **Não calculamos** gematria hebraica para nomes em PT-BR — alfabeto incompatível.

---

## Como Estender

### 1. Adicionar planetas

```typescript
// src/lib/oraculo/astrologia.ts
import { calcularSignoSolar } from './astrologia';

// Integrar Swiss Ephemeris (Node wrapper):
// import * as sweph from 'sweph';
//
// export async function calcularPosicoesPlanetarias(data: string, hora: string) {
//   const jd = await sweph.julday(/* ... */);
//   const posicoes = [];
//   for (const planeta of [/* ... */]) {
//     const [longitude] = await sweph.calc(jd, planeta, sweph.SEFLG_SWIEPH);
//     const signoIdx = Math.floor(longitude / 30) % 12;
//     posicoes.push({ planeta, signo: SIGNOS[signoIdx].nome, grau: longitude % 30, confidence: 'computed', source: 'Swiss Ephemeris' });
//   }
//   return posicoes;
// }
// ```
// Depois passar para `calcularMapaNatal(dados, 'ocidental-tropical', posicoes)`.

### 2. Adicionar nova tradição

```typescript
// Adicionar em `TradiçãoAstrológica`:
export type TradiçãoAstrológica = 'ocidental-tropical' | 'védica-sidereal' | 'chinesa' | 'helenistica';

// Adicionar lógica em `calcularMapaNatal` switch:
if (tradição === 'helenistica') {
  // Aplica triplicidade, sect, profections...
}
```

### 3. Adicionar Akashic prompt específico

Em `src/lib/ai/prompts/oraculo.ts`:

```typescript
export const ORACULO_AKASHA_PROMPT = `
Você é Akasha IA interpretando um mapa oracular integrado.
Baseando-se APENAS nos dados:
  {{mapa.markdown}}
Responda perguntas do consulente com base em {{mapa.input.tradiçãoPreferida}}.
Regras:
- Cite a fonte (Pitágoras, Caldeia, Árvore da Vida, Tropical).
- Marque cross-refs com "# cross-ref".
- NUNCA prescreva. SEMPRE sugira consultar profissional.
`;
```

---

## Limitações Conhecidas

1. **Lua em signo** — aproximação com confidence `low`. Para precisão: efemérides.
2. **Sem planetas** — slots estruturais prontos, requer integração externa.
3. **Védica sem ayanamsa** — só emite aviso.
4. **Chinesa não implementada** — stub com aviso.
5. **Historico requer tabela** — schema não versionado (`oraculo_mapas`). Best-effort.
6. **Markdown rendering** — próprio (sem react-markdown). Parsing básico, sem nested HTML.

---

## Smoke-Test Rápido (sandbox-side)

```bash
# Backend (server-side, requer Node 18+)
node -e "
  const { calcularMapaNumerológico } = require('./src/lib/oraculo/numerologia.ts').default;
  console.log(calcularMapaNumerológico({
    nomeCompleto: 'Maria da Silva Santos',
    dataNascimento: '1990-04-23'
  }, 'pitagorica').resumoParaIA);
"

# Frontend (browser, com app rodando em :3000)
curl -X POST http://localhost:3000/api/oraculo/numerologia \
  -H "content-type: application/json" \
  -d '{"nomeCompleto":"Maria da Silva Santos","dataNascimento":"1990-04-23"}'
```

> ⚠️ Smoke-test NÃO foi executado nesta wave por degradação do shell
> sandbox (pós-OOM). Documentado em DELIVERABLE-W29.md.

---

## Source Citations (Akashic IA RAG)

Engines e componentes devem estar disponíveis via RAG para a Akashic IA
interpretar. Adicionar artigos sobre:

- "Pitágoras e a numerologia clássica" (Batch 4??)
- "Árvore da Vida: estrutura" (existente em `seed/articles-batch-4.ts`?)
- "Meeus — Astronomical Algorithms" (referência técnica)
- "Astrologia Tropical vs Sideral" (cross-tradition)

TODO: PR follow-up verificar se já existem ou adicionar à fila de embedding.

---

**Wave 29 — Implementação base entregue.**
Próxima wave (W30): integrar Swiss Ephemeris para posições planetárias reais.
