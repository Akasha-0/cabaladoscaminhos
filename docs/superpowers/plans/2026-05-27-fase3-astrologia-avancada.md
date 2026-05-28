# FASE 3: Expansão - Astrologia Avançada Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar cálculos astrológicos avançados usando Swiss Ephemeris, incluindo posição planetária, casas astrológicas e mapa natal completo.

**Architecture:** Integração da biblioteca Swiss Ephemeris para cálculos astronômicos precisos. Cálculos executados no servidor (Node.js), resultados armazenados em cache, interface responsiva no dashboard.

**Tech Stack:** 
- `sweph` (Swiss Ephemeris Node.js wrapper)
- Prisma (armazenamento de posições)
- Next.js API Routes
- Cache Redis/in-memory para posições calculadas

---

## Arquitetura de Arquivos

```
src/
├── lib/
│   └── astrologia/
│       ├── swiss-ephemeris.ts      # Wrapper Swiss Ephemeris
│       ├── tipos.ts                 # Tipos TypeScript
│       ├── planetas/
│       │   ├── posicoes.ts          # Cálculo de posições
│       │   └── aspectos.ts         # Cálculo de aspectos
│       ├── casas/
│       │   └── sistema-casas.ts     # Cálculo de casas (Placidus)
│       ├── mapa-natal/
│       │   ├── calculadora.ts      # Gerador de mapa natal
│       │   └── interpretador.ts     # Interpretação básica
│       └── trânsitos/
│           └── calculator.ts        # Cálculo de trânsitos atuais
├── hooks/
│   └── useMapaNatal.ts             # Hook React para dados
├── components/
│   ├── astrologia/
│   │   ├── MapaNatalCard.tsx       # Card do mapa natal
│   │   ├── PlanetaIcone.tsx        # Ícone de planeta
│   │   ├── CartaNatal.tsx          # Visualização radial
│   │   └── TrânsitosAtivos.tsx     # Lista de trânsitos
└── app/
    └── api/
        ├── astrologia/
        │   ├── mapa-natal/route.ts      # GET mapa natal
        │   ├── posicoes/route.ts        # GET posições
        │   └── transitos/route.ts       # GET trânsitos
        └── dashboard/
            └── resumo/route.ts         # UPDATE: incluir trânsitos
```

---

## Task 1: Setup Swiss Ephemeris

**Files:**
- Create: `src/lib/astrologia/swiss-ephemeris.ts`
- Create: `src/lib/astrologia/tipos.ts`
- Modify: `package.json` (adicionar dependência)
- Test: `tests/lib/astrologia/swiss-ephemeris.test.ts`

- [ ] **Step 1: Adicionar dependência Swiss Ephemeris**

Run: `npm install sweph` (ou verificar se já existe)

- [ ] **Step 2: Criar tipos TypeScript**

```typescript
// src/lib/astrologia/tipos.ts
export interface PosicaoPlaneta {
  planeta: Planeta;
  longitude: number;        // 0-360 graus
  latitude: number;          // -90 a 90 graus
  distancia: number;         // UA
  velocidade: number;        // graus/dia
  signo: Signo;
  casa: number;             // 1-12
  grauNoSigno: number;      // 0-29.99
}

export interface Casa {
  numero: number;           // 1-12
  signo: Signo;
  grauNoSigno: number;
  planetaRegente: Planeta | null;
}

export interface MapaNatal {
  usuarioId: string;
  dataCalculo: Date;
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
  casas: Casa[];
  ascendente: number;       // grau do ascendente
  mediumCoeli: number;      // grau do MC
  nodes: {
    norte: PosicaoPlaneta;
    sul: PosicaoPlaneta;
  };
}

export type Planeta = 
  | 'sol' | 'lua' | 'mercurio' | 'venus' | 'marte'
  | 'jupiter' | 'saturno' | 'urano' | 'netuno' | 'plutao'
  | 'node_norte' | 'node_sul' | 'quiron';

export type Signo = 
  | 'aries' | 'touro' | 'gemeos' | 'cancer' | 'leao' | 'virgem'
  | 'libra' | 'escorpio' | 'sagitario' | 'capricornio' | 'aquario' | 'peixes';

export interface Aspecto {
  planeta1: Planeta;
  planeta2: Planeta;
  tipo: AspectoTipo;
  orb: number;              // graus de tolerância
  aplicativo: boolean;      // true = está se aproximando
}

export type AspectoTipo = 
  | 'conjunção'     // 0°
  | 'oposicao'      // 180°
  | 'quadratura'    // 90°
  | 'trino'         // 120°
  | 'sextil';       // 60°
```

- [ ] **Step 3: Criar wrapper Swiss Ephemeris**

```typescript
// src/lib/astrologia/swiss-ephemeris.ts
import { swe, SweFlags, PlanetName } from 'sweph';

export const PLANETA_CODIGO: Record<Planeta, number> = {
  sol: SweFlags.SE_SUN,
  lua: SweFlags.SE_MOON,
  mercurio: SweFlags.SE_MERCURY,
  venus: SweFlags.SE_VENUS,
  marte: SweFlags.SE_MARS,
  jupiter: SweFlags.SE_JUPITER,
  saturno: SweFlags.SE_SATURN,
  urano: SweFlags.SE_URANUS,
  netuno: SweFlags.SE_NEPTUNE,
  plutao: SweFlags.SE_PLUTO,
  node_norte: SweFlags.SE_TRUE_NODE,
  node_sul: SweFlags.SE_TRUE_NODE, // opposite
  quiron: SweFlags.SE_CHIRON,
};

export function calcularPosicao(
  planeta: Planeta,
  data: Date,
  latitude?: number,
  longitude?: number
): PosicaoPlaneta {
  const jd = toJulianDate(data);
  
  // Cálculo heliocêntrico ou geocêntrico
  const resultado = swe.calc(jd, PLANETA_CODIGO[planeta], SweFlags.SEFLG_SWIEPH);
  
  if (resultado.error) {
    throw new Error(`Erro calculando ${planeta}: ${resultado.error}`);
  }
  
  const [longitude, latitude, distancia, velocidade] = resultado.result;
  
  return {
    planeta,
    longitude: normalizeDegrees(longitude),
    latitude,
    distancia,
    velocidade,
    signo: getSigno(longitude),
    casa: 0, // calculado depois
    grauNoSigno: getGrauNoSigno(longitude),
  };
}

export function calcularCasas(data: Date, latitude: number, longitude: number): {
  casas: number[];
  ascendente: number;
  mediumCoeli: number;
} {
  const jd = toJulianDate(data);
  const resultado = swe.houses(jd, latitude, longitude, 'P'); // Placidus
  
  return {
    casas: resultado.houses.map(h => normalizeDegrees(h)),
    ascendente: normalizeDegrees(resultado.ascendant),
    mediumCoeli: normalizeDegrees(resultado.mc),
  };
}

function toJulianDate(data: Date): number {
  return (data.getTime() / 86400000) + 2440587.5;
}

function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function getSigno(longitude: number): Signo {
  const signos = [
    'aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem',
    'libra', 'escorpio', 'sagitario', 'capricornio', 'aquario', 'peixes'
  ];
  const indice = Math.floor(longitude / 30);
  return signos[indice] as Signo;
}

function getGrauNoSigno(longitude: number): number {
  return longitude % 30;
}
```

- [ ] **Step 4: Criar teste**

```typescript
// tests/lib/astrologia/swiss-ephemeris.test.ts
import { describe, it, expect } from 'vitest';
import { calcularPosicao, calcularCasas } from '@/lib/astrologia/swiss-ephemeris';

describe('Swiss Ephemeris', () => {
  it('deve calcular posição do Sol', () => {
    const data = new Date('2000-01-01T12:00:00Z');
    const posicao = calcularPosicao('sol', data);
    
    expect(posicao.longitude).toBeGreaterThan(0);
    expect(posicao.longitude).toBeLessThan(360);
  });

  it('deve calcular casas para São Paulo', () => {
    const data = new Date('1990-05-15T10:30:00Z');
    const resultado = calcularCasas(data, -23.55, -46.63);
    
    expect(resultado.casas).toHaveLength(12);
    expect(resultado.ascendente).toBeGreaterThan(0);
    expect(resultado.mediumCoeli).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/astrologia/tipos.ts src/lib/astrologia/swiss-ephemeris.ts
git add tests/lib/astrologia/swiss-ephemeris.test.ts
git commit -m "feat: add Swiss Ephemeris integration and types"
```

---

## Task 2: Cálculo de Posições Planetárias

**Files:**
- Create: `src/lib/astrologia/planetas/posicoes.ts`
- Create: `src/lib/astrologia/planetas/aspectos.ts`
- Create: `tests/lib/astrologia/planetas/posicoes.test.ts`

- [ ] **Step 1: Criar calculadora de posições completas**

```typescript
// src/lib/astrologia/planetas/posicoes.ts
import { calcularPosicao, calcularCasas } from '../swiss-ephemeris';
import type { PosicaoPlaneta, MapaNatal, Planeta } from '../tipos';

const PLANETAS_PRINCIPAIS: Planeta[] = [
  'sol', 'lua', 'mercurio', 'venus', 'marte',
  'jupiter', 'saturno', 'urano', 'netuno', 'plutao'
];

export function calcularMapaNatal(
  dataNascimento: Date,
  horaNascimento: string, // HH:mm
  latitude: number,
  longitude: number
): MapaNatal {
  const dataHora = new Date(`${dataNascimento.toISOString().split('T')[0]}T${horaNascimento}:00`);
  
  // Calcular casas primeiro
  const { casas, ascendente, mediumCoeli } = calcularCasas(dataHora, latitude, longitude);
  
  // Calcular posições dos planetas
  const posicoes = {} as MapaNatal['planeta'];
  
  for (const planeta of PLANETAS_PRINCIPAIS) {
    const posicao = calcularPosicao(planeta, dataHora, latitude, longitude);
    posicao.casa = determinarCasa(posicao.longitude, casas);
    posicoes[planeta] = posicao;
  }
  
  // Calcular nós lunares
  const luaPosicao = posicoes.lua;
  const nodeNorte = {
    ...luaPosicao,
    planeta: 'node_norte' as Planeta,
    longitude: calcularNodeLunar(luaPosicao.longitude, 'norte'),
  };
  const nodeSul = {
    ...nodeNorte,
    planeta: 'node_sul' as Planeta,
    longitude: normalizeDegrees(nodeNorte.longitude + 180),
  };
  
  return {
    usuarioId: '', // preenchido depois
    dataCalculo: new Date(),
    planeta: posicoes,
    casas: casas.map((c, i) => ({
      numero: i + 1,
      signo: getSigno(c),
      grauNoSigno: c % 30,
      planetaRegente: null,
    })),
    ascendente,
    mediumCoeli,
    nodes: {
      norte: nodeNorte,
      sul: nodeSul,
    },
  };
}

function calcularNodeLunar(luaLongitude: number, tipo: 'norte' | 'sul'): number {
  // Os nós são calculated based on Moon's orbital intersection with ecliptic
  // Simplificação: nós são opostos entre si
  return tipo === 'norte' ? luaLongitude : normalizeDegrees(luaLongitude + 180);
}

function determinarCasa(longitude: number, casas: number[]): number {
  for (let i = 0; i < 12; i++) {
    const casaStart = casas[i];
    const casaEnd = casas[(i + 1) % 12];
    
    if (casaEnd > casaStart) {
      if (longitude >= casaStart && longitude < casaEnd) return i + 1;
    } else {
      // casa cruza o 0°
      if (longitude >= casaStart || longitude < casaEnd) return i + 1;
    }
  }
  return 1;
}
```

- [ ] **Step 2: Criar calculadora de aspectos**

```typescript
// src/lib/astrologia/planetas/aspectos.ts
import type { Aspecto, AspectoTipo, Planeta, PosicaoPlaneta } from '../tipos';

const ASPECTOS: { tipo: AspectoTipo; angulo: number; orbMax: number }[] = [
  { tipo: 'conjunção', angulo: 0, orbMax: 10 },
  { tipo: 'sextil', angulo: 60, orbMax: 6 },
  { tipo: 'quadratura', angulo: 90, orbMax: 8 },
  { tipo: 'trino', angulo: 120, orbMax: 8 },
  { tipo: 'oposição', angulo: 180, orbMax: 10 },
];

export function calcularAspectos(posicoes: PosicaoPlaneta[]): Aspecto[] {
  const aspectos: Aspecto[] = [];
  
  for (let i = 0; i < posicoes.length; i++) {
    for (let j = i + 1; j < posicoes.length; j++) {
      const p1 = posicoes[i];
      const p2 = posicoes[j];
      
      for (const aspecto of ASPECTOS) {
        const diferenca = Math.abs(normalizeDiff(p1.longitude - p2.longitude));
        const orb = Math.abs(diferenca - aspecto.angulo);
        
        if (orb <= aspecto.orbMax) {
          aspectos.push({
            planeta1: p1.planeta,
            planeta2: p2.planeta,
            tipo: aspecto.tipo,
            orb,
            aplicativo: p1.velocidade > p2.velocidade, // simplificação
          });
        }
      }
    }
  }
  
  return aspectos;
}

function normalizeDiff(diff: number): number {
  return ((diff + 180) % 360) - 180;
}
```

- [ ] **Step 3: Criar teste de posições**

```typescript
// tests/lib/astrologia/planetas/posicoes.test.ts
import { describe, it, expect } from 'vitest';
import { calcularMapaNatal } from '@/lib/astrologia/planetas/posicoes';

describe('Posições Planetárias', () => {
  it('deve calcular mapa natal completo', () => {
    const data = new Date('1990-05-15');
    const resultado = calcularMapaNatal(data, '10:30', -23.55, -46.63);
    
    expect(resultado.planeta.sol).toBeDefined();
    expect(resultado.planeta.lua).toBeDefined();
    expect(resultado.casas).toHaveLength(12);
    expect(resultado.ascendente).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/astrologia/planetas/posicoes.ts src/lib/astrologia/planetas/aspectos.ts
git add tests/lib/astrologia/planetas/posicoes.test.ts
git commit -m "feat: add planetary positions and aspects calculation"
```

---

## Task 3: Cálculo de Trânsitos Atuais

**Files:**
- Create: `src/lib/astrologia/trânsitos/calculator.ts`
- Create: `tests/lib/astrologia/trânsitos/calculator.test.ts`

- [ ] **Step 1: Criar calculadora de trânsitos**

```typescript
// src/lib/astrologia/trânsitos/calculator.ts
import { calcularPosicao } from '../swiss-ephemeris';
import type { MapaNatal } from '../tipos';

export interface Transito {
  planeta: string;
  aspecto: string;
  planetaNatal: string;
  progresso: 'aplicativo' | 'separativo';
  inicio: Date;
  fim: Date | null;
  impacto: 'alto' | 'medio' | 'baixo';
  descricao: string;
}

const ASPECTOS_TRANSITO = [
  { nome: 'conjunto', angulo: 0, impacto: 'alto' },
  { nome: 'oposto', angulo: 180, impacto: 'alto' },
  { nome: 'quadrado', angulo: 90, impacto: 'medio' },
  { nome: 'trino', angulo: 120, impacto: 'medio' },
  { nome: 'sextil', angulo: 60, impacto: 'baixo' },
];

export function calcularTrânsitosAtivos(
  mapaNatal: MapaNatal,
  dataAtual: Date = new Date()
): Transito[] {
  const transitos: Transito[] = [];
  
  const planetas = ['marte', 'jupiter', 'saturno', 'urano', 'netuno', 'plutao'] as const;
  
  for (const planetaTransito of planetas) {
    const posicaoAtual = calcularPosicao(planetaTransito, dataAtual);
    
    for (const [nomeNatal, posicaoNatal] of Object.entries(mapaNatal.planeta)) {
      for (const aspecto of ASPECTOS_TRANSITO) {
        const diferenca = Math.abs(normalizeDiff(posicaoAtual.longitude - posicaoNatal.longitude));
        
        if (Math.abs(diferenca - aspecto.angulo) < 5) {
          transitos.push({
            planeta: planetaTransito,
            aspecto: aspecto.nome,
            planetaNatal: nomeNatal,
            progresso: posicaoAtual.velocidade > 0 ? 'aplicativo' : 'separativo',
            inicio: dataAtual, // simplificação
            fim: null,
            impacto: aspecto.impacto,
            descricao: gerarDescricao(planetaTransito, aspecto.nome, nomeNatal),
          });
        }
      }
    }
  }
  
  return transitos.sort((a, b) => {
    const impactoOrder = { alto: 0, medio: 1, baixo: 2 };
    return impactoOrder[a.impacto] - impactoOrder[b.impacto];
  });
}

function normalizeDiff(diff: number): number {
  return ((diff + 180) % 360) - 180;
}

function gerarDescricao(transito: string, aspecto: string, natal: string): string {
  const descricoes: Record<string, string> = {
    'saturno_oposicao': 'Período de desafios e amadurecimento em área relacionada a {natal}.',
    'jupiter_trino': 'Oportunidade de crescimento e expansão em área de {natal}.',
    'marte_conjuncao': 'Energia intensificada em área de {natal}. Ação decisiva necessária.',
    // ... mais descrições
  };
  
  const key = `${transito}_${aspecto}`;
  return descricoes[key] || `Trânsito de ${transito} em ${aspecto} com ${natal}.`;
}
```

- [ ] **Step 2: Criar teste**

```typescript
// tests/lib/astrologia/trânsitos/calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calcularTrânsitosAtivos } from '@/lib/astrologia/trânsitos/calculator';
import type { MapaNatal } from '@/lib/astrologia/tipos';

describe('Trânsitos', () => {
  it('deve listar trânsitos ativos', () => {
    // Criar mapa natal mock
    const mapaNatal: MapaNatal = {
      usuarioId: 'test',
      dataCalculo: new Date(),
      planeta: {
        sol: { planeta: 'sol', longitude: 100, latitude: 0, distancia: 1, velocidade: 1, signo: 'aries', casa: 1, grauNoSigno: 10 },
        lua: { planeta: 'lua', longitude: 200, latitude: 0, distancia: 1, velocidade: 12, signo: 'libra', casa: 7, grauNoSigno: 20 },
      } as any,
      casas: [],
      ascendente: 0,
      mediumCoeli: 0,
      nodes: { norte: null as any, sul: null as any },
    };
    
    const transitos = calcularTrânsitosAtivos(mapaNatal);
    expect(Array.isArray(transitos)).toBe(true);
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/astrologia/trânsitos/calculator.ts
git add tests/lib/astrologia/trânsitos/calculator.test.ts
git commit -m "feat: add transit calculation system"
```

---

## Task 4: API de Mapa Natal

**Files:**
- Create: `src/app/api/astrologia/mapa-natal/route.ts`
- Modify: `src/app/api/dashboard/resumo/route.ts` (adicionar trânsitos)
- Test: API endpoint tests

- [ ] **Step 1: Criar endpoint GET mapa-natal**

```typescript
// src/app/api/astrologia/mapa-natal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { calcularMapaNatal } from '@/lib/astrologia/planetas/posicoes';
import { calcularAspectos } from '@/lib/astrologia/planetas/aspectos';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });
    
    if (!user?.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    const { dataNascimento, horaNascimento, latitude, longitude } = user.profile;
    
    if (!dataNascimento || !latitude || !longitude) {
      return NextResponse.json({ 
        error: 'Dados incompletos para cálculo' 
      }, { status: 400 });
    }
    
    const mapaNatal = calcularMapaNatal(
      dataNascimento,
      horaNascimento || '12:00',
      latitude,
      longitude
    );
    
    mapaNatal.usuarioId = user.id;
    
    // Calcular aspectos
    const posicoes = Object.values(mapaNatal.planeta);
    const aspectos = calcularAspectos(posicoes);
    
    return NextResponse.json({
      mapaNatal,
      aspectos,
      interpretacao: gerarInterpretacaoBasica(mapaNatal),
    });
  } catch (error) {
    console.error('Erro calculando mapa natal:', error);
    return NextResponse.json({ 
      error: 'Erro ao calcular mapa natal' 
    }, { status: 500 });
  }
}

function gerarInterpretacaoBasica(mapaNatal: any): string {
  const solSigno = mapaNatal.planeta.sol.signo;
  const ascendente = mapaNatal.ascendente;
  
  return `Sol em ${solSigno}, Ascendente em ${getSignoNome(ascendente)}. Mapa astral personalizado.`;
}

function getSignoNome(grau: number): string {
  const signos = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 
                  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  return signos[Math.floor(grau / 30)];
}
```

- [ ] **Step 2: Criar endpoint GET transitos**

```typescript
// src/app/api/astrologia/transitos/route.ts
import { NextResponse } from 'next/server';
import { calcularTrânsitosAtivos } from '@/lib/astrologia/trânsitos/calculator';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Buscar mapa natal do usuário (do cache ou recalcular)
    // Por ora, retornar trânsitos vazios - implementar cache depois
    const transitos = calcularTrânsitosAtivos({
      usuarioId: '',
      dataCalculo: new Date(),
      planeta: {} as any,
      casas: [],
      ascendente: 0,
      mediumCoeli: 0,
      nodes: { norte: null as any, sul: null as any },
    });
    
    return NextResponse.json({ transitos });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao calcular trânsitos' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/astrologia/mapa-natal/route.ts
git add src/app/api/astrologia/transitos/route.ts
git commit -m "feat: add astrology API endpoints"
```

---

## Task 5: Hook useMapaNatal

**Files:**
- Create: `src/hooks/useMapaNatal.ts`
- Modify: `src/components/dashboard/DashboardContent.tsx` (adicionar seção)

- [ ] **Step 1: Criar hook**

```typescript
// src/hooks/useMapaNatal.ts
'use client';

import { useState, useEffect } from 'react';

interface MapaNatalData {
  solSigno: string;
  luaSigno: string;
  ascendente: string;
  planetas: Record<string, string>;
  casas: { numero: number; signo: string }[];
  aspectos: { tipo: string; planetas: string[] }[];
  loading: boolean;
  error: string | null;
}

export function useMapaNatal() {
  const [data, setData] = useState<MapaNatalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchMapaNatal() {
      try {
        const response = await fetch('/api/astrologia/mapa-natal');
        if (!response.ok) throw new Error('Erro ao carregar mapa natal');
        
        const resultado = await response.json();
        
        setData({
          solSigno: resultado.mapaNatal.planeta.sol.signo,
          luaSigno: resultado.mapaNatal.planeta.lua.signo,
          ascendente: resultado.mapaNatal.ascendente,
          planetas: Object.fromEntries(
            Object.entries(resultado.mapaNatal.planeta).map(([k, v]) => [k, v.signo])
          ),
          casas: resultado.mapaNatal.casas,
          aspectos: resultado.aspectos,
          loading: false,
          error: null,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setLoading(false);
      }
    }
    
    fetchMapaNatal();
  }, []);
  
  return { data, loading, error };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useMapaNatal.ts
git commit -m "feat: add useMapaNatal hook"
```

---

## Task 6: Componentes UI

**Files:**
- Create: `src/components/astrologia/MapaNatalCard.tsx`
- Create: `src/components/astrologia/CartaNatal.tsx`
- Create: `src/components/astrologia/TransitosAtivos.tsx`

- [ ] **Step 1: Criar MapaNatalCard**

```tsx
// src/components/astrologia/MapaNatalCard.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMapaNatal } from '@/hooks/useMapaNatal';

const SIGNOS_ICONES: Record<string, string> = {
  aries: '♈', touro: '♉', gemeos: '♊', cancer: '♋',
  leao: '♌', virgem: '♍', libra: '♎', escorpio: '♏',
  sagitario: '♐', capricornio: '♑', aquario: '♒', peixes: '♓',
};

export function MapaNatalCard() {
  const { data, loading, error } = useMapaNatal();
  
  if (loading) {
    return <Card><CardContent>Carregando mapa natal...</CardContent></Card>;
  }
  
  if (error || !data) {
    return <Card><CardContent>Erro ao carregar mapa natal</CardContent></Card>;
  }
  
  return (
    <Card className="bg-slate-900/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>⭐</span> Mapa Natal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <InfoItem 
            label="Sol" 
            value={capitalize(data.solSigno)} 
            icon={SIGNOS_ICONES[data.solSigno]} 
          />
          <InfoItem 
            label="Lua" 
            value={capitalize(data.luaSigno)} 
            icon={SIGNOS_ICONES[data.luaSigno]} 
          />
          <InfoItem 
            label="Ascendente" 
            value={capitalize(data.ascendente)} 
            icon="↑" 
          />
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-purple-300 mb-2">Planetas</h4>
          <div className="flex flex-wrap gap-1">
            {Object.entries(data.planetas).map(([planeta, signo]) => (
              <Badge 
                key={planeta} 
                variant="outline" 
                className="text-xs"
              >
                {planeta}: {SIGNOS_ICONES[signo]}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="text-center p-2 bg-purple-950/30 rounded-lg">
      <div className="text-2xl">{icon}</div>
      <div className="text-xs text-purple-300">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

- [ ] **Step 2: Criar TransitosAtivos**

```tsx
// src/components/astrologia/TransitosAtivos.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Transito {
  planeta: string;
  aspecto: string;
  planetaNatal: string;
  impacto: 'alto' | 'medio' | 'baixo';
  descricao: string;
}

interface Props {
  transitos: Transito[];
}

export function TransitosAtivos({ transitos }: Props) {
  const impactoCores = {
    alto: 'bg-red-500/20 border-red-500 text-red-300',
    medio: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    baixo: 'bg-green-500/20 border-green-500 text-green-300',
  };
  
  return (
    <Card className="bg-slate-900/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🪐</span> Trânsitos Ativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transitos.length === 0 ? (
          <p className="text-slate-400">Nenhum trânsito significativo no momento.</p>
        ) : (
          <div className="space-y-3">
            {transitos.slice(0, 5).map((t, i) => (
              <div 
                key={i}
                className={`p-3 rounded-lg border ${impactoCores[t.impacto]}`}
              >
                <div className="font-medium">
                  {capitalize(t.planeta)} {t.aspecto} {capitalize(t.planetaNatal)}
                </div>
                <p className="text-sm mt-1 opacity-80">{t.descricao}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/astrologia/MapaNatalCard.tsx src/components/astrologia/TransitosAtivos.tsx
git commit -m "feat: add astrology UI components"
```

---

## Task 7: Integração no Dashboard

**Files:**
- Modify: `src/app/(dashboard)/page.tsx` (adicionar componentes)
- Modify: `src/app/api/dashboard/resumo/route.ts` (incluir astrologia)

- [ ] **Step 1: Adicionar ao dashboard resumo**

```typescript
// src/app/api/dashboard/resumo/route.ts (modificar)
export async function GET() {
  // ... código existente ...
  
  const resumo = {
    // ... campos existentes ...
    
    // Novos campos de astrologia
    astrologia: {
      solSigno: mapaNatal?.planeta.sol.signo || null,
      luaSigno: mapaNatal?.planeta.lua.signo || null,
      ascendente: mapaNatal?.ascendente || null,
      planetas: mapaNatal ? Object.fromEntries(
        Object.entries(mapaNatal.planeta).map(([k, v]) => [k, v.signo])
      ) : null,
    },
  };
  
  return NextResponse.json(resumo);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/page.tsx src/app/api/dashboard/resumo/route.ts
git commit -m "feat: integrate astrology into dashboard"
```

---

## Task 8: Testes de Integração e Build

**Files:**
- Modify: `package.json` (verificar scripts)
- Run: testes e build

- [ ] **Step 1: Executar testes**

Run: `npm run test`

Expected: Todos os testes passando

- [ ] **Step 2: Executar lint**

Run: `npm run lint`

Expected: 0 errors

- [ ] **Step 3: Executar build**

Run: `npm run build`

Expected: Build successful

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "feat: complete Sprint 9 - Astrology Advanced"
```

---

## Resumo das Tasks

| Task | Descrição | Arquivos |
|------|-----------|----------|
| 1 | Setup Swiss Ephemeris | 3 arquivos |
| 2 | Cálculo de posições | 3 arquivos |
| 3 | Cálculo de trânsitos | 2 arquivos |
| 4 | API de mapa natal | 2 arquivos |
| 5 | Hook useMapaNatal | 1 arquivo |
| 6 | Componentes UI | 3 arquivos |
| 7 | Integração no dashboard | 2 arquivos |
| 8 | Testes e build | 3 verificações |

**Total: 8 tasks, ~20 arquivos**

---

## Prioridade de Execução

1. **Task 1: Setup** - Fundamental, todas as outras dependem
2. **Task 2: Posições** - Core da funcionalidade
3. **Task 3: Trânsitos** - Funcionalidade adicional
4. **Task 4: API** - Expõe os dados
5. **Task 5: Hook** - Conecta frontend/backend
6. **Task 6-7: UI** - Visualização
7. **Task 8: Testes** - Validação final

---

*Plano criado: 2026-05-27*
*FASE 3: Sprint 9 - Astrologia Avançada*