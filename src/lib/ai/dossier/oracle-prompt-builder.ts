// ============================================================
// ORACLE PROMPT BUILDER — Motor de cruzamento determinístico
// ============================================================
// Implementa a arquitetura canônica do Doc 06 §3.2:
// para cada casa preenchida, injeta APENAS os aspectos do mapa
// natal delegados àquela casa pela CORRELATION_MAP (Doc 06 §3.1).
//
// Regra inviolável (Doc 09 §5.7): cada casa recebe apenas os dados
// mapeados para ela — nunca dados genéricos.

import {
  CORRELATION_MAP,
  getCorrelationEntry,
  extractFromMap,
} from '@/lib/ai/correlation-map';
import { getLenormandCardById } from '@/lib/constants/lenormand-cards';
import { getOduById } from '@/lib/constants/odus';
import type { MatrixData } from '@/types';
import type { BirthChart } from '@/lib/astrologia/birth-chart';

/**
 * Normalizes a BirthChart to the flat key format expected by extractFromMap.
 *
 * Bug fix: BirthChart uses internal Portuguese planet names (sol, marte, etc.)
 * and has .numero on houses, but extraction keys expect English names (sun, mars)
 * and .house on houses. This function bridges the gap.
 *
 * The normalized output has:
 * - planets.sun / planets.mars / etc. (English keys → internal positions)
 * - houses['1'] / houses['2'] / etc. (string keys with .numero and .house for compatibility)
 * - flat top-level keys: ascendente, ascendente_signo, sun.signo, moon.signo, etc.
 */
const PLANET_NAMES: Record<string, string> = {
  sun: 'sol',
  moon: 'lua',
  mercury: 'mercurio',
  venus: 'venus',
  mars: 'marte',
  jupiter: 'jupiter',
  saturn: 'saturno',
  uranus: 'urano',
  neptune: 'netuno',
  pluto: 'plutao',
  chiron: 'chiron',
  lilith: 'lilith',
};

function signFromDegree(degree: number): string {
  const signs = [
    'aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem',
    'libra', 'escorpio', 'sagitario', 'capricornio', 'aquario', 'peixes',
  ];
  return signs[Math.floor(degree / 30) % 12];
}

export function normalizeBirthChart(chart: BirthChart): Record<string, unknown> {
  // Support both formats:
  // 1. Nested (BirthChart): chart.planeta[key], chart.casas[], chart.ascendente, chart.nodes
  // 2. Flat (legacy test data): planeta[key], casas[], ascendente, nodes
  const isNested = !!(chart as unknown as Record<string, unknown>).chart;
  const planeta = isNested
    ? (chart as unknown as { chart: { planeta: Record<string, unknown> } }).chart.planeta
    : (chart as unknown as Record<string, unknown>)['planeta'] as Record<string, unknown>;
  const casas = isNested
    ? (chart as unknown as { chart: { casas: Array<{ numero: number; signo: string; planetaRegente: string | null }> } }).chart.casas
    : (chart as unknown as Record<string, unknown>)['casas'] as Array<{ numero: number; signo: string; planetaRegente: string | null }>;
  const ascendente = isNested
    ? (chart as unknown as { chart: { ascendente: number } }).chart.ascendente
    : (chart as unknown as Record<string, unknown>)['ascendente'] as number;
  const nodes = isNested
    ? (chart as unknown as { chart: { nodes: { norte: unknown; sul: unknown } } }).chart.nodes
    : (chart as unknown as Record<string, unknown>)['nodes'] as { norte: unknown; sul: unknown } | undefined;
  const aspects = (chart as unknown as Record<string, unknown>)['aspects'];

  // NOTE: do NOT add ascendant to the planets object — the extraction key 'ascendant'
  // expects a direct string value, not {sign, house}. Top-level ascendant_signo is used.

  const planets: Record<string, Record<string, unknown>> = {};
  for (const [key, internalName] of Object.entries(PLANET_NAMES)) {
    const pos = planeta?.[internalName] as { signo: string; casa: number; grauNoSigno: number } | undefined;
    if (pos) {
      planets[key] = {
        sign: pos.signo,
        house: pos.casa,
        degree: pos.grauNoSigno,
      };
    }
  }
  // Add ascendente as 'ascendant' top-level key (extraction key 'ascendant' expects string, not object)
  const ascendantSign = signFromDegree(ascendente);
  // Return Record format: extractFromMap's else branch accesses by index
  const houses: Record<string, Record<string, unknown>> = {};
  if (casas) {
    for (const casa of casas) {
      const num = casa.numero;
      houses[String(num)] = {
        house: num,
        numero: num,
        sign: casa.signo,
        signo: casa.signo,
        planetaRegente: casa.planetaRegente,
      };
    }
  }
  // Build nodes (handle both flat and nested internal format)
  const buildNode = (node: unknown): Record<string, unknown> | null => {
    if (!node) return null;
    const n = node as { signo?: string; casa?: number; sign?: string; house?: number };
    return {
      sign: n.signo ?? n.sign ?? null,
      house: n.casa ?? n.house ?? null,
      signo: n.signo ?? n.sign ?? null,
      casa: n.casa ?? n.house ?? null,
    };
  };

  // Build planetsInHouses: reverse lookup from planet → house
  const planetsInHouses: Record<string, string[]> = {};
  for (const [key, pos] of Object.entries(planets)) {
    const house = String(pos.house);
    if (!planetsInHouses[house]) planetsInHouses[house] = [];
    planetsInHouses[house].push(key);
  }
  return {
    planets,
    houses,
    planetsInHouses,
    aspects: aspects as unknown,
    ascendente,
    ascendente_signo: signFromDegree(ascendente),
    ascendant: signFromDegree(ascendente),
    northNode: buildNode(nodes?.norte),
    southNode: buildNode(nodes?.sul),
    chiron: planets['chiron'],
    lilith: planets['lilith'],
  };
}

/** Subconjunto do Client necessário para o cruzamento (mapas cacheados). */
export interface ClientMaps {
  fullName: string;
  birthDate: string | Date;
  birthCity?: string;
  birthCountry?: string;
  astrologyMap?: Record<string, unknown> | null;
  kabalisticMap?: Record<string, unknown> | null;
  tantricMap?: Record<string, unknown> | null;
  oduBirth?: Record<string, unknown> | null;
}

// ============================================================
// SYSTEM PROMPT — Persona do Oráculo (Cigano Ramiro)
// ============================================================

/**
 * System prompt canônico (Doc 06 §3.2 + Doc 13).
 * Persona do Oráculo no espírito do Cigano Ramiro: 2ª pessoa,
 * místico-tecnológico, protetor, direto; estrutura de 3 parágrafos.
 */
export function buildSystemPrompt(): string {
  return `Você é o Oráculo da "Cabala dos Caminhos", um sistema integrativo de leitura profunda consagrado ao Cigano Ramiro.

Sua missão é analisar cada casa da Mesa Real cruzando os dados do mapa natal do consulente com a tiragem do dia.

REGRAS OBRIGATÓRIAS:
1. Dirija-se SEMPRE ao consulente na segunda pessoa (você, seu, sua), em tom místico-tecnológico, direto e protetor.
2. Para cada casa, siga RIGOROSAMENTE a estrutura de 3 parágrafos:
   - §1 O TERRENO: Como o consulente naturalmente vive esta área da vida, baseado nos dados natais delegados a esta casa.
   - §2 O EVENTO: O que a carta tirada revela sobre o momento atual nesta área.
   - §3 A DIREÇÃO: O conselho do Odu para agir/navegar esta energia.
3. Seja direto, preciso e profundo. NUNCA seja genérico.
4. Termine cada casa com uma linha de síntese em itálico: *[Palavra-chave]: [frase de 10 a 15 palavras]*
5. Use SOMENTE os dados natais fornecidos para cada casa. Não invente aspectos que não foram enviados.
6. Para a Síntese Final, integre os padrões que se repetem nas casas em 4 capítulos
   (Trabalho/Dinheiro, Lar/Família, Amor/Relacionamentos, Conselho Espiritual) e feche com um Veredito Final.`;
}

// ============================================================
// PAYLOAD POR CASA
// ============================================================

export interface HousePayload {
  casa_numero: number;
  casa_nome: string;
  casa_tema: string;
  dados_natais_consulente: {
    astrologia: { aspectos_relevantes: string[]; valores: Record<string, unknown> };
    numerologia_cabalistica: { aspectos: string[]; valores: Record<string, unknown> };
    numerologia_tantrica: { aspectos: string[]; valores: Record<string, unknown> };
    odu_natal: Record<string, unknown> | null | undefined;
  };
  tiragem_do_dia: {
    carta: string;
    carta_numero: number;
    carta_significado: string;
    /** Significado-base canônico injetado como verdade (Doc 15). */
    carta_base: string;
    /** Face desafiadora da carta (Doc 15). */
    carta_sombra: string;
    odu_tirado: string;
    odu_numero: number;
    odu_essencia: string;
    /** Quizila/preceito do Odu (Doc 15). */
    odu_quizila: string;
    /** Conselho-base do Odu (Doc 15). */
    odu_conselho: string;
  };
  instrucao: string;
}

/**
 * Monta o bloco interpretativo de UMA casa, injetando apenas os
 * aspectos natais delegados pela CORRELATION_MAP.
 */
export function buildHousePayload(
  house: number,
  entry: MatrixData[string],
  client: ClientMaps
): HousePayload {
  const correlation = getCorrelationEntry(house);

  const normalizedAstro = normalizeBirthChart(client.astrologyMap as unknown as BirthChart);
  const astralData = extractFromMap(normalizedAstro, correlation.astrology.extractionKeys);
  const kabalaData = extractFromMap(client.kabalisticMap, correlation.kabalah.extractionKeys);
  const tantricData = extractFromMap(client.tantricMap, correlation.tantric.extractionKeys);

  const card = getLenormandCardById(entry.carta);
  const odu = getOduById(entry.odu);

  return {
    casa_numero: house,
    casa_nome: correlation.houseName,
    casa_tema: correlation.houseTheme,
    dados_natais_consulente: {
      astrologia: {
        aspectos_relevantes: [
          ...correlation.astrology.primaryPlanets,
          ...correlation.astrology.primaryHouses.map((h) => `${h}ª Casa`),
        ],
        valores: astralData,
      },
      numerologia_cabalistica: { aspectos: correlation.kabalah.aspects, valores: kabalaData },
      numerologia_tantrica: { aspectos: correlation.tantric.aspects, valores: tantricData },
      odu_natal: client.oduBirth,
    },
    tiragem_do_dia: {
      carta: card?.name ?? card?.name ?? `Carta ${entry.carta}`,
      carta_numero: entry.carta,
      carta_significado: card?.keywords ?? '',
      carta_base: card?.baseMeaning ?? '',
      carta_sombra: card?.shadow ?? '',
      odu_tirado: odu?.name ?? odu?.name ?? `Odu ${entry.odu}`,
      odu_numero: entry.odu,
      odu_essencia: odu?.essence ?? '',
      odu_quizila: odu?.quizila ?? '',
      odu_conselho: odu?.baseAdvice ?? '',
    },
    instrucao: `Analise a Casa ${house} (${correlation.houseName}) seguindo os 3 parágrafos obrigatórios.`,
  };
}

// ============================================================
// PAYLOAD COMPLETO
// ============================================================

// fallow-ignore-next-line unused-type
export interface FullPayload {
  consulente: { nome: string; data_nascimento: string; local_nascimento: string };
  casas: HousePayload[];
  instrucao_sintese_final: string;
}

/**
 * Monta o payload completo (todas as casas preenchidas + instrução de síntese).
 */
function buildFullPayload(client: ClientMaps, matrixData: MatrixData): FullPayload {
  const casas = Object.entries(matrixData)
    .filter(([houseStr]) => CORRELATION_MAP[parseInt(houseStr, 10)] !== undefined)
    .map(([houseStr, entry]) => buildHousePayload(parseInt(houseStr, 10), entry, client));

  const birthDate =
    client.birthDate instanceof Date ? client.birthDate.toISOString().slice(0, 10) : String(client.birthDate);

  return {
    consulente: {
      nome: client.fullName,
      data_nascimento: birthDate,
      local_nascimento: [client.birthCity, client.birthCountry].filter(Boolean).join(', '),
    },
    casas,
    instrucao_sintese_final: `Após analisar todas as ${casas.length} casas acima, gere uma SÍNTESE FINAL com 4 capítulos:
1. **O Caminho do Trabalho e Dinheiro**
2. **O Caminho do Lar e Família**
3. **O Caminho do Amor e Relacionamentos**
4. **O Grande Conselho Espiritual**
Cada capítulo: 2 a 3 parágrafos. Feche com um VEREDITO FINAL de 1 parágrafo com a direção mais urgente e concreta.`,
  };
}
