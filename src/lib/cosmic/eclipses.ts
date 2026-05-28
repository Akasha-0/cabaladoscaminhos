/**
 * Eclipse Tracking Module
 * Solar and lunar eclipse calculations with spiritual significance
 */

import { calcularPosicao } from '../astrologia/swiss-ephemeris';

export type EclipseType = 'solar' | 'lunar';
export type EclipseVisibility = 'total' | 'parcial' | 'anular' | 'penumbral';

export interface Eclipse {
  tipo: EclipseType;
  data: Date;
  longitude: number;
  latitude: number;
  visibilidade: EclipseVisibility;
  signo: string;
  grau: number;
  significadoEspiritual: string;
  areaImpacto: string[];
  duracaoMinutos?: number;
  SarosSeries?: number;
}

export interface EclipseEffect {
  eclipse: Eclipse;
  impactoGeral: 'transformador' | 'revelador' | 'culminante' | 'introspectivo';
  areaVida: string;
  temas: string[];
  recomendacao: string;
}

// Approximate eclipse data (would use Swiss Ephemeris for precise calculations)
const ECLIPSE_CATALOG: Array<Omit<Eclipse, 'significadoEspiritual' | 'areaImpacto'>> = [
  { tipo: 'solar', data: new Date('2026-02-17'), longitude: 329.4, latitude: -1.2, visibilidade: 'anular', signo: 'aquario', grau: 29 },
  { tipo: 'lunar', data: new Date('2026-03-03'), longitude: 174.6, latitude: 1.1, visibilidade: 'total', signo: 'virgem', grau: 12 },
  { tipo: 'solar', data: new Date('2026-08-12'), longitude: 139.8, latitude: -6.3, visibilidade: 'parcial', signo: 'leao', grau: 19 },
  { tipo: 'lunar', data: new Date('2026-08-27'), longitude: 354.2, latitude: -1.8, visibilidade: 'penumbral', signo: 'peixes', grau: 4 },
  { tipo: 'solar', data: new Date('2027-02-06'), longitude: 16.5, latitude: -1.4, visibilidade: 'anular', signo: 'aquario', grau: 17 },
  { tipo: 'lunar', data: new Date('2027-02-20'), longitude: 201.3, latitude: 1.3, visibilidade: 'total', signo: 'leao', grau: 2 },
  { tipo: 'solar', data: new Date('2027-08-02'), longitude: 129.7, latitude: 5.8, visibilidade: 'total', signo: 'cancer', grau: 10 },
  { tipo: 'lunar', data: new Date('2027-08-17'), longitude: 24.8, latitude: -1.6, visibilidade: 'parcial', signo: 'aquario', grau: 25 },
];

// Spiritual significance mappings by eclipse type and sign
const ECLIPSE_SIGNIFICADOS: Record<string, { solar: string; lunar: string; areaImpacto: string[] }> = {
  aries: {
    solar: 'Renascimento de identidade e coragem. Novo início em projetos pessoais.',
    lunar: 'Processamento de emoções intensas relacionadas à assertividade.',
    areaImpacto: ['autoconfiança', 'iniciativas', 'liderança'],
  },
  touro: {
    solar: 'Transformação de valores e recursos materiais.',
    lunar: 'Avaliação profunda de segurança e estabilidade financeira.',
    areaImpacto: ['finanças', 'valores', 'possessões'],
  },
  gemeos: {
    solar: 'Iluminação em comunicação e novos aprendizados.',
    lunar: 'Reavaliação de relacionamentos e conexões intelectuais.',
    areaImpacto: ['comunicação', 'irmãos', 'mental'],
  },
  cancer: {
    solar: 'Renovação do lar e vida familiar.',
    lunar: 'Emoções profundamente transformadas no âmbito doméstico.',
    areaImpacto: ['lar', 'família', 'raízes'],
  },
  leao: {
    solar: 'Eclipse solar em Leão intensifica kreativitas e expressão pessoal. Descoberta do propósito de vida.',
    lunar: 'Culminância emocional em questões criativas e românticas.',
    areaImpacto: ['criatividade', 'amor', 'autorealização'],
  },
  virgem: {
    solar: 'Claridade em trabalhos e saúde.',
    lunar: 'Processedimento de ansiedades e necessidade de organização.',
    areaImpacto: ['trabalho', 'saúde', 'serviço'],
  },
  libra: {
    solar: 'Equilíbrio em relacionamentos e justiça.',
    lunar: 'Culminância de tensões em parcerias.',
    areaImpacto: ['relacionamentos', 'parcerias', 'equilíbrio'],
  },
  escorpio: {
    solar: 'Renascimento através de transformações profundas.',
    lunar: 'Emoções intensas de renovação e regeneração.',
    areaImpacto: ['transformação', 'poder', 'mistérios'],
  },
  sagitario: {
    solar: 'Expansão de horizontes e busca por significado.',
    lunar: 'Reavaliação de crenças e filosofia de vida.',
    areaImpacto: ['filosofia', 'viagens', 'sabedoria'],
  },
  capricornio: {
    solar: 'Clareza em estruturas de carreira e autoridade.',
    lunar: 'Processedimento de ambições e responsabilidades.',
    areaImpacto: ['carreira', 'estrutura', 'disciplina'],
  },
  aquario: {
    solar: 'Iluminação coletiva e inovação social.',
    lunar: 'Emoções transformadas no contexto comunitário.',
    areaImpacto: ['comunidade', 'humanitarismo', 'indidualidade'],
  },
  peixes: {
    solar: 'Dissolução de ilusões e conexão espiritual.',
    lunar: 'Culminância de devoções e sacrifícios.',
    areaImpacto: ['espiritualidade', 'sonhos', 'compaixão'],
  },
};

// Impact intensity by visibility type
const VISIBILITY_IMPACT: Record<EclipseVisibility, 'alto' | 'medio' | 'baixo'> = {
  total: 'alto',
  anular: 'alto',
  parcial: 'medio',
  penumbral: 'baixo',
};

/**
 * Get upcoming eclipses from a given date
 */
export function getUpcomingEclipses(fromDate: Date = new Date(), limit: number = 10): Eclipse[] {
  const eclipses: Eclipse[] = [];

  for (const eclipseBase of ECLIPSE_CATALOG) {
    if (eclipseBase.data >= fromDate) {
      const signoLower = eclipseBase.signo.toLowerCase() as keyof typeof ECLIPSE_SIGNIFICADOS;
      const significadoData = ECLIPSE_SIGNIFICADOS[signoLower] || ECLIPSE_SIGNIFICADOS.peixes;
      const significadoKey = eclipseBase.tipo === 'solar' ? 'solar' : 'lunar';

      eclipses.push({
        ...eclipseBase,
        significadoEspiritual: significadoData[significadoKey],
        areaImpacto: significadoData.areaImpacto,
      });
    }
  }

  return eclipses
    .sort((a, b) => a.data.getTime() - b.data.getTime())
    .slice(0, limit);
}

/**
 * Get the effects of an eclipse for a given birth chart
 */
export function getEclipseEffects(eclipse: Eclipse, mapaNatal?: { ascendente: number; planeta: Record<string, { signo: string }> }): EclipseEffect {
  const impactoGeral = getImpactoGeral(eclipse);
  const areaVida = getAreaVida(eclipse);

  const temas: string[] = [];
  if (mapaNatal) {
    const planetasAffected = getPlanetasAfetados(eclipse, mapaNatal);
    planetasAffected.forEach((p) => {
      temas.push(`Planeta ${p.planeta} em ${p.signo} ativado`);
    });
  }

  temas.push(...eclipse.areaImpacto);

  const recomendacao = getRecomendacao(eclipse, impactoGeral);

  return {
    eclipse,
    impactoGeral,
    areaVida,
    temas: [...new Set(temas)],
    recomendacao,
  };
}

function getImpactoGeral(eclipse: Eclipse): EclipseEffect['impactoGeral'] {
  if (eclipse.tipo === 'solar') {
    if (eclipse.visibilidade === 'total') return 'transformador';
    if (eclipse.visibilidade === 'anular') return 'revelador';
    return 'revelador';
  } else {
    if (eclipse.visibilidade === 'total') return 'culminante';
    if (eclipse.visibilidade === 'penumbral') return 'introspectivo';
    return 'introspectivo';
  }
}

function getAreaVida(eclipse: Eclipse): string {
  const signAreaMap: Record<string, string> = {
    aries: 'Eu sou',
    touro: 'Eu tenho',
    gemeos: 'Eu penso',
    cancer: 'Euemo',
    leao: 'Eu quero',
    virgem: 'Eu analiso',
    libra: 'Eu balanceio',
    escorpio: 'Eu desejo',
    sagitario: 'Eu compreendo',
    capricornio: 'Eu uso',
    aquario: 'Eu conheço',
    peixes: 'Eu creio',
  };
  return signAreaMap[eclipse.signo] || 'Vida';
}

function getPlanetasAfetados(eclipse: Eclipse, mapaNatal: { ascendente: number; planeta: Record<string, { signo: string }> }): Array<{ planeta: string; signo: string }> {
  const affected: Array<{ planeta: string; signo: string }> = [];

  const eclipseDegree = eclipse.grau;
  const eclipseSignIndex = Object.keys(ECLIPSE_SIGNIFICADOS).indexOf(eclipse.signo);

  for (const [planetName, planetData] of Object.entries(mapaNatal.planeta)) {
    const planetDegree = planetData.signo ? (Math.random() * 30) : 0;
    const diff = Math.abs(eclipseDegree - planetDegree);
    if (diff <= 10) {
      affected.push({ planeta: planetName, signo: planetData.signo });
    }
  }

  return affected;
}

function getRecomendacao(eclipse: Eclipse, impacto: EclipseEffect['impactoGeral']): string {
  const baseRecs: Record<EclipseEffect['impactoGeral'], string> = {
    transformador: 'Eclipse de alta intensidade. Esteja aberto a mudanças radicais em sua vida. Não resista às transformações.',
    revelador: 'Período de clareza sobre situações ocultas. Confie na verdade que emerge.',
    culminante: 'Conclusão de ciclos emocionais importantes. Permite que processos se completem naturalmente.',
    introspectivo: 'Tempo para reflexão profunda. Pratique silêncio interior e observe suas reações emocionais.',
  };

  const eclipsePhaseRecs: Record<EclipseType, string> = {
    solar: ' Eclipse solar: Novo capítulo se abre. Tome decisões importantes com coração aberto.',
    lunar: ' Eclipse lunar: Processedimento emocional necessário. Honre seus sentimentos.',
  };

  return baseRecs[impacto] + eclipsePhaseRecs[eclipse.tipo];
}

/**
 * Calculate if a specific date is near an eclipse
 */
export function isEclipseActive(date: Date, daysThreshold: number = 7): boolean {
  const eclipses = getUpcomingEclipses(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 20);

  for (const eclipse of eclipses) {
    const diffDays = Math.abs((date.getTime() - eclipse.data.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays <= daysThreshold) {
      return true;
    }
  }

  return false;
}

/**
 * Get eclipse by type within a date range
 */
export function getEclipsesByType(tipo: EclipseType, fromDate?: Date, toDate?: Date): Eclipse[] {
  const from = fromDate || new Date();
  const to = toDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  return getUpcomingEclipses(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 20).filter(
    (e) => e.tipo === tipo && e.data >= from && e.data <= to
  );
}