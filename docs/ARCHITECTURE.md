# Arquitetura Técnica — Cabala dos Caminhos

> **Versão:** 1.0.0  
> **Data:** 2026-06-01  
> **Status:** Ativo

---

## 🎯 Visão Geral

O **Cabala dos Caminhos** é uma aplicação Next.js 15 que integra múltiplas tradições espirituais através de um sistema de correlações inteligente. A arquitetura é projetada para:

1. **Modularidade** — Cada sistema espiritual (Numerologia, Odús, Astrologia) é um módulo independente
2. **Correlação** — O motor de correlações conecta sistemas para gerar insights unificados
3. **Performance** — Edge functions para cálculos rápidos e caching estratégico
4. **Escalabilidade** — API extensível para novos sistemas e integrações

---

## 📐 Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   React 19  │  │  Zustand    │  │    Tailwind CSS 4       │ │
│  │   + Next.js │  │   State     │  │    (Design System)      │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────────┘ │
│         │                │                                        │
└─────────┼────────────────┼────────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP ROUTER                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API ROUTES                               │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │ │
│  │  │ Auth     │ │ Correlation│ │ Numerologia│ │ Odús    │       │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐  │
│  │ DeepCorre- │  │ MiniMax    │  │  Supabase              │  │
│  │ lation     │  │ AI Service │  │  (Auth + Database)     │  │
│  │ Engine     │  │            │  │                        │  │
│  └────────────┘  └────────────┘  └────────────────────────┘  │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐  │
│  │ Stripe     │  │ Analytics  │  │  PWA Service           │  │
│  │ Payments   │  │ Tracking   │  │  (Offline Support)     │  │
│  └────────────┘  └────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔢 Fluxo de Dados — Cálculos Espirituais

### Fluxo 1: Cálculo de Perfil Espiritual

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Input do    │────▶│  Cálculos    │────▶│  Correlação  │────▶│  Response    │
│  Usuário     │     │  Múltiplos   │     │  Cruzada     │     │  Unificado    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
     │                    │                     │                     │
     │ Nome + Data         │                     │                     │
     │                    ▼                     │                     │
     │              ┌──────────────┐             │                     │
     │              │  NUMEROLOGIA │             │                     │
     │              │  • Pitagórica │            │                     │
     │              │  • Caldeia    │            │                     │
     │              │  • Cabalística│            │                     │
     │              │  • Tântrica    │            │                     │
     │              └──────────────┘             │                     │
     │                                          ▼                     │
     │                                    ┌──────────────┐           │
     │                                    │ DEEP CORRE-  │           │
     │                                    │ LATION       │           │
     │                                    │ ENGINE       │           │
     │                                    │ • Padrões    │           │
     │                                    │ • Harmonias  │           │
     │                                    │ • Insights   │           │
     │                                    └──────────────┘           │
     │                                                                  │
     ▼                                                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           PERFIL CONSOLIDADO                             │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Numerologia: Caminho de Vida 11, Expressão 7, Alma 4              │ │
│  │ Astrologia: Escorpião, Ascendente Leão, Lua em Peixes               │ │
│  │ Odu: Irosun (4) com preceitos e ebós                               │ │
│  │ Kabbalah: Sefirot Binah → Yesod                                    │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │ CORRELAÇÕES:                                                       │ │
│  │ • 11 (Mestre) ↔ Binah (Compreensão) — Força: 0.85                 │ │
│  │ • Irosun ↔ Tarot 4 (Imperador) — Força: 0.75                       │ │
│  │ • Escorpião ↔ Odu 4 — Energia: Água, Intuição                      │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │ INSIGHTS:                                                          │ │
│  │ "Sua intuição elevada (11) é amplificada pelo elemento água..."   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### Fluxo 2: API de Correlação Cruzada

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        POST /api/divination/cross-system                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │     VALIDAÇÃO (Zod Schema)     │
                    │  • userId (required)          │
                    │  • question (3-500 chars)      │
                    │  • spread (enum)              │
                    │  • birthDate ou userName       │
                    └───────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
         ┌─────────────────┐            ┌─────────────────┐
         │    TAROT         │            │      IFA        │
         │  10 cartas       │            │  1 Odú aleatório│
         │  (Celtic Cross)  │            │  + correlações   │
         └─────────────────┘            └─────────────────┘
                    │                               │
                    └─────────────┬─────────────────┘
                                  ▼
                    ┌───────────────────────────────┐
                    │      NUMEROLOGIA              │
                    │  • Número de Vida/Data        │
                    │  • Sefirot relacionados       │
                    │  • Correlações com Odús       │
                    └───────────────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────────┐
                    │      ASTROLOGIA               │
                    │  • Planeta dominante          │
                    │  • Signo atual                │
                    │  • Equilíbrio elemental       │
                    └───────────────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────────┐
                    │   SPIRITUAL STATS AGGREGATION  │
                    │  • Sefirot counts             │
                    │  • Chakra distribution        │
                    │  • Element balance            │
                    │  • Orixá occurrences          │
                    └───────────────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────────┐
                    │    AI INTERPRETATION           │
                    │  (MiniMax Integration)         │
                    │  • combinedInterpretation      │
                    │  • aiGuidance                  │
                    └───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              RESPONSE                                    │
│  {                                                                       │
│    "success": true,                                                     │
│    "tarotReading": [...],        // 10 cartas com correlações           │
│    "oduReading": {...},         // Odú com spiritualCorrelations       │
│    "numerologyReading": {...},  // Número com sefirot                  │
│    "astrologyReading": {...},   // Planeta + signo                      │
│    "spiritualStats": {...},     // Agregações                           │
│    "combinedInterpretation": "...",                                     │
│    "aiGuidance": "..."                                                  │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Estrutura de Dados

### Tipos Principais

```typescript
// ════════════════════════════════════════════════════════════════════════════
// USER SPIRITUAL DATA — Perfil consolidado do usuário
// ════════════════════════════════════════════════════════════════════════════

interface UserSpiritualData {
  // Dados básicos
  nome: string;
  dataNascimento: string; // YYYY-MM-DD
  
  // Sistemas de cálculo
  numeroPessoal?: number;
  caminhoDeVida?: number;
  expressao?: number;
  alma?: number;
  
  // Tradições
  sign?: string;           // Astrologia ocidental
  rashi?: string;          // Astrologia védica
  odu?: string;            // Ifá/Odú
  orixaRegente?: string;  // Candomblé
  
  // Kabbalah
  sefirotDominante?: string[];
  arvoreVida?: string[];
  
  // Tarot
  arcoMaior?: number[];    // Arcanos Maiores (0-21)
  arcoMenor?: string[];
  
  // chakras
  chakrasAtivos?: string[];
  chakrasBloqueados?: string[];
}

// ════════════════════════════════════════════════════════════════════════════
// NUMEROLOGY TYPES — Sistema numerológico
// ════════════════════════════════════════════════════════════════════════════

type SistemaNumerologico = 'pitagorica' | 'caldeia' | 'cabalistica' | 'tantrica';

interface ResultadoNumerologia {
  numero: number;
  sistema: SistemaNumerologico;
  nome: string;
  significado: string;
  forca: string;
  desafio: string;
  sefirotRelacionado: string;
  interpretacaoCompleta: {
    titulo: string;
    descricao: string;
    pontosFortes: string[];
    pontosDesafio: string[];
    caminho: string;
  };
}

// ════════════════════════════════════════════════════════════════════════════
// ODU TYPES — Sistema Ifá/Odú
// ════════════════════════════════════════════════════════════════════════════

interface OduInfo {
  numero: number;           // 1-16
  nome: string;             // Ogbe, Oyeku, etc.
  significado: string;
  elementos: string;       // "Terra/Fogo"
  orixaRegente: string;    // Ogum, Iemanjá, etc.
  quizilas: string[];       // Proibições
  preceitos: string[];      // Regras de conduta
  ebos: string[];          // Oferendas/rituais
}

interface OduCorrelations {
  tarot: string;            // Arcano Maior correlacionado
  arcanoNumber: number;
  orixas: string[];
  elementos: string[];
  affirmation: string;
}

// ════════════════════════════════════════════════════════════════════════════
// ASTROLOGY TYPES — Sistema astrológico
// ════════════════════════════════════════════════════════════════════════════

interface PosicaoPlaneta {
  signo: string;
  grau: number;
  casa: number;
}

interface MapaNatal {
  planeta: {
    sol: PosicaoPlaneta;
    lua: PosicaoPlaneta;
    mercurio: PosicaoPlaneta;
    venus: PosicaoPlaneta;
    marte: PosicaoPlaneta;
    jupiter: PosicaoPlaneta;
    saturno: PosicaoPlaneta;
    urano: PosicaoPlaneta;
    netuno: PosicaoPlaneta;
    plutao: PosicaoPlaneta;
  };
  casas: number[];          // 1-12
  ascendente: number;
  mediumCoeli: number;
  nodes: {
    norte: PosicaoPlaneta;
    sul: PosicaoPlaneta;
  };
}

interface AspectoPlanetario {
  planeta1: string;
  planeta2: string;
  tipo: 'conjuncao' | 'oposicao' | 'trino' | 'quadratura' | 'sextil';
  grau: number;
}

// ════════════════════════════════════════════════════════════════════════════
// CORRELATION TYPES — Sistema de correlações
// ════════════════════════════════════════════════════════════════════════════

type SpiritualSource = 'kabbalah' | 'ifa' | 'candomble' | 'tarot' | 'astrology' | 'numerology';

interface SpiritualCorrelation {
  source: SpiritualSource;
  target: string;
  correlation: number;      // 0-1
  explanation: string;
  shared_energy: string;
}

interface SystemCorrelation {
  source: SpiritualSystem;
  target: SpiritualSystem;
  correlationType: 'elemental' | 'numerical' | 'symbolic' | 'temporal';
  strength: number;          // 0-1
  explanation: string;
}

interface CrossSystemPattern {
  name: string;
  description: string;
  strength: number;         // 0-1
  involved_systems: SpiritualSource[];
  manifestations: string[];
}

interface EnergyHarmonyReport {
  overall_score: number;
  system_harmonies: Record<SpiritualSource, number>;
  dominant_energy: string;
  balance_indicators: {
    harmonious: string[];
    conflicting: string[];
    neutral: string[];
  };
  recommendations: string[];
}

// ════════════════════════════════════════════════════════════════════════════
// CHAKRA TYPES — Sistema de chakras
// ════════════════════════════════════════════════════════════════════════════

interface ChakraInfo {
  nome: string;
  numero: number;          // 1-7
  cor: string;
  elemento: string;
  orixa: string;
  planeta: string;
  frequencia: string;      // Solfeggio
  mantra: string;
  localizacao: string;
  funcaoEspiritual: string;
}

const CHAKRAS: ChakraInfo[] = [
  { numero: 1, nome: 'Muladhara', cor: 'Vermelho', elemento: 'Terra', orixa: 'Ogum', planeta: 'Saturno', frequencia: '174 Hz', mantra: 'LAM', localizacao: 'Base da coluna', funcaoEspiritual: 'Sobrevivência e segurança' },
  { numero: 2, nome: 'Svadhisthana', cor: 'Laranja', elemento: 'Água', orixa: 'Iemanjá', planeta: 'Netuno', frequencia: '285 Hz', mantra: 'VAM', localizacao: 'Abdômen', funcaoEspiritual: 'Criatividade e emoções' },
  { numero: 3, nome: 'Manipura', cor: 'Amarelo', elemento: 'Fogo', orixa: 'Xangô', planeta: 'Marte', frequencia: '396 Hz', mantra: 'RAM', localizacao: 'Plexo solar', funcaoEspiritual: 'Poder e autodisciplina' },
  { numero: 4, nome: 'Anahata', cor: 'Verde', elemento: 'Ar', orixa: 'Oxum', planeta: 'Vênus', frequencia: '528 Hz', mantra: 'YAM', localizacao: 'Coração', funcaoEspiritual: 'Amor e compaixão' },
  { numero: 5, nome: 'Vishuddha', cor: 'Azul', elemento: 'Éter', orixa: 'Oxóssi', planeta: 'Mercúrio', frequencia: '741 Hz', mantra: 'HAM', localizacao: 'Garganta', funcaoEspiritual: 'Comunicação e expressão' },
  { numero: 6, nome: 'Ajna', cor: 'Índigo', elemento: 'Luz', orixa: 'Oxalá', planeta: 'Júpiter', frequencia: '852 Hz', mantra: 'OM', localizacao: 'Testa', funcaoEspiritual: 'Intuição e percepção' },
  { numero: 7, nome: 'Sahasrara', cor: 'Branco/Violeta', elemento: 'Vazio', orixa: 'Orunmilá', planeta: 'Sem planeta', frequencia: '963 Hz', mantra: 'SILÊNCIO', localizacao: 'Coroa', funcaoEspiritual: 'Conexão divina' },
];
```

---

## 📊 Matriz de Correlações

### Sistema de Correlações Cruzadas

```
                    │ Numerologia │   Odú   │ Astrologia │   Tarot   │ Kabbalah │ Chakra │
────────────────────┼─────────────┼─────────┼────────────┼───────────┼──────────┼────────┤
  Numerologia       │     —       │   0.75  │    0.70    │   0.75    │   0.70   │  0.60  │
────────────────────┼─────────────┼─────────┼────────────┼───────────┼──────────┼────────┤
  Odú (Ifá)        │    0.75     │   —     │    0.50    │   0.80    │   0.85   │  0.65  │
────────────────────┼─────────────┼─────────┼────────────┼───────────┼──────────┼────────┤
  Astrologia        │    0.70     │   0.50  │    —       │   0.70    │   0.50   │  0.75  │
────────────────────┼─────────────┼─────────┼────────────┼───────────┼──────────┼────────┤
  Tarot             │    0.75     │   0.80  │    0.70    │    —      │   0.80   │  0.85  │
────────────────────┼─────────────┼─────────┼────────────┼───────────┼──────────┼────────┤
  Kabbalah          │    0.70     │   0.85  │    0.50    │   0.80    │    —     │  0.60  │
────────────────────┼─────────────┼─────────┼────────────┼───────────┼──────────┼────────┤
  Chakra            │    0.60     │   0.65  │    0.75    │   0.85    │   0.60   │   —    │
────────────────────┴─────────────┴─────────┴────────────┴───────────┴──────────┴────────┘
```

### Correlações por Número (1-9)

| Número | Elemento | Orixá | Chakra | Sefirá | Planeta | Tarot |
|--------|----------|-------|--------|--------|---------|-------|
| 1 | Fogo | Ogum | Muladhara (1) | Kether | Marte | O Mago |
| 2 | Água | Iemanjá | Svadhisthana (2) | Chokhmah | Lua | Alta Sacerdotisa |
| 3 | Ar | Orunmilá | Vishuddha (5) | Binah | Júpiter | Imperatriz |
| 4 | Terra | Ogum | Muladhara (1) | Chesed | Urano | Imperador |
| 5 | Fogo | Xangô | Manipura (3) | Gevurah | Mercúrio | Hierofante |
| 6 | Fogo | Oxum | Anahata (4) | Tipheret | Vênus | Enamorados |
| 7 | Água | Oxalá | Ajna (6) | Netzach | Netuno | Carro |
| 8 | Terra | Ogum | Manipura (3) | Hod | Saturno | Justiça |
| 9 | Água | Iemanjá | Ajna (6) | Yesod | Marte | Eremita |

---

## 🔌 Endpoints da API

### Grupo 1: Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login com email/senha |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/register` | Registro de novo usuário |
| GET | `/api/auth/status` | Status da sessão |

### Grupo 2: Sistemas Espirituais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/numerologia` | Cálculos numerológicos |
| GET | `/api/odus` | Cálculo de Odú de nascimento |
| GET | `/api/astrologia/mapa-natal` | Mapa natal completo |
| GET | `/api/astrologia/transitos` | Trânsitos planetários |
| GET | `/api/cabala/sefirot` | Sefirot da Árvore da Vida |

### Grupo 3: Correlações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/correlation/analyze` | Análise temporal de correlações |
| POST | `/api/correlation/diagnosis` | Diagnóstico espiritual |
| POST | `/api/divination/cross-system` | Divinação integrada |

### Grupo 4: Insights e Prática

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/insights/diario` | Insight espiritual diário |
| GET | `/api/ciclos` | Ciclos temporais (ano, mês, dia) |
| GET | `/api/afirmacoes` | Afirmações personalizadas |

---

## 🧩 Estrutura de Diretórios

```
src/
├── app/
│   ├── api/
│   │   ├── auth/                    # Auth routes
│   │   ├── correlation/             # Correlation engine
│   │   │   ├── analyze/
│   │   │   ├── diagnosis/
│   │   │   └── ritual/
│   │   ├── divination/              # Cross-system divination
│   │   │   ├── cross-system/
│   │   │   └── oracle/
│   │   ├── numerologia/             # Numerology calculations
│   │   ├── odu/                     # Odu/Ifá calculations
│   │   ├── astrologia/              # Astrology calculations
│   │   ├── cabala/                  # Kabbalah
│   │   ├── insights/                # Daily insights
│   │   └── ...
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   │
│   └── page.tsx                     # Landing page
│
├── components/
│   ├── ui/                          # Base components (shadcn/ui)
│   ├── dashboard/                   # Dashboard widgets
│   │   ├── correlation/             # Correlation widgets
│   │   │   ├── CorrelationViz.tsx
│   │   │   ├── CrossSystemDivination.tsx
│   │   │   └── ...
│   │   ├── numerology/
│   │   ├── astrology/
│   │   ├── odu/
│   │   └── ...
│   ├── auth/
│   └── providers/
│
├── lib/
│   ├── api/                        # API utilities
│   │   ├── types.ts
│   │   ├── validation.ts
│   │   └── rate-limit.ts
│   │
│   ├── ai/                         # AI integration
│   │   ├── minimax.ts
│   │   └── deep-correlation-engine.ts
│   │
│   ├── correlation/                 # Correlation engine
│   │   ├── correlation-types.ts
│   │   ├── day-portal-analyzer.ts
│   │   ├── lunar-phase-analyzer.ts
│   │   └── spiritual-diagnosis.ts
│   │
│   ├── numerologia/                 # Numerology
│   │   ├── calculos.ts
│   │   └── odu-correlations.ts
│   │
│   ├── odu/                        # Odu/Ifá
│   │   ├── calculos.ts
│   │   └── odus-data.ts
│   │
│   ├── astrologia/                  # Astrology
│   │   ├── mapa-natal.ts
│   │   └── transitos.ts
│   │
│   ├── tarot/                      # Tarot
│   │   ├── cards.ts
│   │   └── readings.ts
│   │
│   └── hooks/                      # Custom hooks
│       ├── useCreditos.ts
│       ├── useNumerologia.ts
│       └── ...
│
└── styles/
    └── globals.css                  # Global styles + CSS vars
```

---

## ⚡ Performance e Caching

### Estratégia de Cache

| Tipo | Estratégia | TTL |
|------|------------|-----|
| Cálculos estáticos (Odú, Número) | ISR | 24 horas |
| Trânsitos astrológicos | On-demand + cache | 1 hora |
| Insights diários | Cache por usuário | 12 horas |
| Correlações Cruzadas | Edge cache | 30 minutos |

### Otimizações

1. **Edge Functions** — Cálculos de numerologia executados em edge
2. **ISR (Incremental Static Regeneration)** — Páginas de perfil com dados semi-estáticos
3. **Streaming** — Respostas de API com streaming para UI responsiva
4. **Prefetching** — Dados do próximo passo já carregados

---

## 🔒 Segurança

### Headers de Segurança

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set('Content-Security-Policy', "default-src 'self'");
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}
```

### Rate Limiting

| Endpoint | Limite | Janela |
|----------|--------|--------|
| Chat | 10 req | 60s |
| Insights | 5 req | 60s |
| Divinação | 3 req | 60s |
| API Geral | 100 req | 60s |

---

## 📈 Monitoramento

### Métricas de Saúde

```typescript
interface HealthMetrics {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;              // segundos
  memoryUsage: {
    used: number;
    total: number;
  };
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  errorRate: number;           // porcentagem
}
```

### Logs Estruturados

```typescript
// Formato de log
{
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  service: string;
  message: string;
  metadata: {
    userId?: string;
    endpoint?: string;
    duration?: number;
    error?: string;
  };
}
```

---

## 🔧 Variáveis de Ambiente

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# MiniMax AI
MINIMAX_API_KEY=xxx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Cache
REDIS_URL=redis://xxx
```

---

## 🚀 Deploy

### Build

```bash
# Build de produção
npm run build

# Preview local
npm run start
```

### Ambientes

| Ambiente | URL | Propósito |
|----------|-----|-----------|
| Development | localhost:3000 | Desenvolvimento local |
| Staging | staging.cabaladoscaminhos.com | Testes |
| Production | cabaladoscaminhos.com | Produção |

---

*Documento criado em 2026-06-01*  
*Part of spiritual-correlation-v1.yaml*