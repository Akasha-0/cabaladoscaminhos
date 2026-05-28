// Dashboard Data Integration - Cabala Dos Caminhos
// Aggregates numerology, astrology, and Ifá data for unified dashboard display

import type { MapaNatal } from '@/lib/astrologia/tipos';
import type { Odu } from '@/lib/ifa/draw';
import type { BirthChart } from '@/lib/astrologia/mapa-natal/chart';
import type { InterpretacaoNumerologia } from '@/lib/numerologia/calculos';
import type { OduMatchingResult } from '@/lib/ifa/matching';

// ============================================================
// TYPES
// ============================================================

export interface DashboardNumerologia {
  pitagorica: number | null;
  caldeia: number | null;
  cabalistica: number | null;
  tantrica: number | null;
  interpretacao: InterpretacaoNumerologia | null;
}

export interface DashboardAstrologia {
  mapaNatal: MapaNatal | null;
  carta: BirthChart | null;
}

export interface DashboardIfa {
  odu: Odu | null;
  matching: OduMatchingResult | null;
}

export interface AggregateDashboardDataOptions {
  nome?: string;
  dataNascimento?: string;
  horaNascimento?: string;
  latitude?: number;
  longitude?: number;
}

export interface AggregateDashboardDataResult {
  numerologia: DashboardNumerologia;
  astrologia: DashboardAstrologia;
  ifa: DashboardIfa;
  timestamp: Date;
  errors: string[];
}

// ============================================================
// NUMEROLOGIA AGGREGATION
// ============================================================

async function aggregateNumerologia(
  nome?: string,
  dataNascimento?: string
): Promise<DashboardNumerologia> {
  const result: DashboardNumerologia = {
    pitagorica: null,
    caldeia: null,
    cabalistica: null,
    tantrica: null,
    interpretacao: null,
  };

  try {
    if (nome) {
      // Dynamic import to avoid circular dependencies
      const { calcularPitagorica, calcularCaldeia, calcularCabalistica, getInterpretacao } = await import('@/lib/numerologia/calculos');
      
      result.pitagorica = calcularPitagorica(nome);
      result.caldeia = calcularCaldeia(nome);
      result.cabalistica = calcularCabalistica(nome);
      result.interpretacao = getInterpretacao(result.pitagorica);
    }

    if (dataNascimento) {
      const { calcularTantrica } = await import('@/lib/numerologia/calculos');
      result.tantrica = calcularTantrica(dataNascimento);
    }
  } catch {
    // Return empty result on error
  }

  return result;
}

// ============================================================
// ASTROLOGIA AGGREGATION
// ============================================================

async function aggregateAstrologia(
  dataNascimento?: string,
  horaNascimento?: string,
  latitude?: number,
  longitude?: number
): Promise<DashboardAstrologia> {
  const result: DashboardAstrologia = {
    mapaNatal: null,
    carta: null,
  };

  try {
    if (dataNascimento && horaNascimento && latitude !== undefined && longitude !== undefined) {
      const { generateBirthChart } = await import('@/lib/astrologia/mapa-natal/chart');
      result.carta = generateBirthChart(
        new Date(dataNascimento),
        horaNascimento,
        latitude,
        longitude
      );

      // Build MapaNatal from chart
      const { calcularPosicao, calcularCasas, normalizeDegrees } = await import('@/lib/astrologia/swiss-ephemeris');
      const birthDate = new Date(dataNascimento);
      const posicoes = calcularPosicao(birthDate);
      const casas = calcularCasas(birthDate, horaNascimento, latitude, longitude);

      result.mapaNatal = {
        usuarioId: '',
        dataCalculo: birthDate,
        planeta: {
          sol: posicoes.sol,
          lua: posicoes.lua,
          mercurio: posicoes.mercurio,
          venus: posicoes.venus,
          marte: posicoes.marte,
          jupiter: posicoes.jupiter,
          saturno: posicoes.saturno,
          urano: posicoes.urano,
          netuno: posicoes.netuno,
          plutao: posicoes.plutao,
        },
        casas,
        ascendente: normalizeDegrees(casas[0].grauNoSigno + (casas[0].signo * 30)),
        mediumCoeli: normalizeDegrees(casas[9]?.grauNoSigno + ((casas[9]?.signo ?? 0) * 30) ?? 0),
        nodes: posicoes.nodes,
      };
    }
  } catch {
    // Return empty result on error
  }

  return result;
}

// ============================================================
// IFÁ AGGREGATION
// ============================================================

async function aggregateIfa(dataNascimento?: string): Promise<DashboardIfa> {
  const result: DashboardIfa = {
    odu: null,
    matching: null,
  };

  try {
    if (dataNascimento) {
      const { drawOdu } = await import('@/lib/ifa/draw');
      const drawResult = drawOdu({ birthDate: dataNascimento });
      result.odu = drawResult.odu;
    }
  } catch {
    // Return empty result on error
  }

  return result;
}

// ============================================================
// MAIN EXPORT
// ============================================================

/**
 * Aggregate all dashboard data from multiple spiritual systems.
 * Combines numerology, astrology, and Ifá into a unified structure.
 */
export async function aggregateDashboardData(
  options: AggregateDashboardDataOptions = {}
): Promise<AggregateDashboardDataResult> {
  const errors: string[] = [];

  // Aggregate all data in parallel
  const [numerologia, astrologia, ifa] = await Promise.all([
    aggregateNumerologia(options.nome, options.dataNascimento).catch((e) => {
      errors.push(`Numerologia error: ${e instanceof Error ? e.message : 'Unknown'}`);
      return {
        pitagorica: null,
        caldeia: null,
        cabalistica: null,
        tantrica: null,
        interpretacao: null,
      };
    }),
    aggregateAstrologia(
      options.dataNascimento,
      options.horaNascimento,
      options.latitude,
      options.longitude
    ).catch((e) => {
      errors.push(`Astrologia error: ${e instanceof Error ? e.message : 'Unknown'}`);
      return { mapaNatal: null, carta: null };
    }),
    aggregateIfa(options.dataNascimento).catch((e) => {
      errors.push(`Ifá error: ${e instanceof Error ? e.message : 'Unknown'}`);
      return { odu: null, matching: null };
    }),
  ]);

  return {
    numerologia,
    astrologia,
    ifa,
    timestamp: new Date(),
    errors,
  };
}