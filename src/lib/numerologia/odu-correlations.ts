/**
 * Numerology-Odú Correlations
 * Based on IDEIA.md "Matriz de Numerologia e Odús de Nascimento" pp.150-167
 */

export interface NumerologyOdúCorrelation {
  numeroReduzido: number;
  equivalenteTantrica: string;
  equivalenteCabalistica: string;
  oduNascimento: string;
  oduId: string;
  tarotCorrelation: string;
  vetorAlinhamento: string;
  sephirahFrom: string;
  sephirahTo: string;
}

/**
 * Correlation table for numbers 1-11 and their Odú equivalents
 * Per IDEIA.md pp.150-167
 */
export const NUMEROLOGY_ODU_CORRELATIONS: NumerologyOdúCorrelation[] = [
  {
    numeroReduzido: 1,
    equivalenteTantrica: 'Corpo da Alma (Essência Interna)',
    equivalenteCabalistica: 'O Iniciador / O Líder',
    oduNascimento: 'Okaran (1)',
    oduId: 'okaran',
    tarotCorrelation: 'O Mago / O Louco',
    vetorAlinhamento: 'Kether para Chokmah (Impulso Puro)',
    sephirahFrom: 'Kether',
    sephirahTo: 'Chokmah',
  },
  {
    numeroReduzido: 2,
    equivalenteTantrica: 'Mente Negativa (Proteção/Alerta)',
    equivalenteCabalistica: 'O Diplomata / O Par',
    oduNascimento: 'Ejiokô (2)',
    oduId: 'ejioko',
    tarotCorrelation: 'A Sacerdotisa',
    vetorAlinhamento: 'Chokmah para Binah (A Forma/Polaridade)',
    sephirahFrom: 'Chokmah',
    sephirahTo: 'Binah',
  },
  {
    numeroReduzido: 3,
    equivalenteTantrica: 'Mente Positiva (Ação/Expansão)',
    equivalenteCabalistica: 'O Comunicador / Criador',
    oduNascimento: 'Etaogundá (3)',
    oduId: 'etaogunda',
    tarotCorrelation: 'A Imperatriz',
    vetorAlinhamento: 'Binah para Chesed (Expansão da Matriz)',
    sephirahFrom: 'Binah',
    sephirahTo: 'Chesed',
  },
  {
    numeroReduzido: 4,
    equivalenteTantrica: 'Mente Negativa (Equilíbrio/Julgamento)',
    equivalenteCabalistica: 'O Construtor / Estrutura',
    oduNascimento: 'Irosun (4)',
    oduId: 'irosun',
    tarotCorrelation: 'O Imperador',
    vetorAlinhamento: 'Chesed para Geburah (Equilíbrio da Lei)',
    sephirahFrom: 'Chesed',
    sephirahTo: 'Geburah',
  },
  {
    numeroReduzido: 5,
    equivalenteTantrica: 'Corpo Físico (Ação no Mundo)',
    equivalenteCabalistica: 'O Viajante / Alquimista',
    oduNascimento: 'Oxé (5)',
    oduId: 'oxe',
    tarotCorrelation: 'O Hierofante',
    vetorAlinhamento: 'Geburah para Tiphereth (O Homem no Centro)',
    sephirahFrom: 'Geburah',
    sephirahTo: 'Tiphereth',
  },
  {
    numeroReduzido: 6,
    equivalenteTantrica: 'Corpo do Arco (Linha de Luz/Foco)',
    equivalenteCabalistica: 'O Conciliador / Família',
    oduNascimento: 'Obará (6)',
    oduId: 'obara',
    tarotCorrelation: 'Os Enamorados',
    vetorAlinhamento: 'Tiphereth para Netzach (Vitória da Vontade)',
    sephirahFrom: 'Tiphereth',
    sephirahTo: 'Netzach',
  },
  {
    numeroReduzido: 7,
    equivalenteTantrica: 'Campo Auricular (Proteção/Magnetismo)',
    equivalenteCabalistica: 'O Filósofo / O Ocultista',
    oduNascimento: 'Odi (7)',
    oduId: 'odi',
    tarotCorrelation: 'O Carro',
    vetorAlinhamento: 'Tiphereth para Hod (Intelecto e Magia)',
    sephirahFrom: 'Tiphereth',
    sephirahTo: 'Hod',
  },
  {
    numeroReduzido: 8,
    equivalenteTantrica: 'Corpo Prânico (Respiração/Energia vital)',
    equivalenteCabalistica: 'O Executivo / Justiça Karma',
    oduNascimento: 'EjiOníle (8)',
    oduId: 'ejionile',
    tarotCorrelation: 'A Justiça / A Força',
    vetorAlinhamento: 'Hod para Yesod (Condensação da Força)',
    sephirahFrom: 'Hod',
    sephirahTo: 'Yesod',
  },
  {
    numeroReduzido: 9,
    equivalenteTantrica: 'Corpo Sutil (Percepção além da matéria)',
    equivalenteCabalistica: 'O Sábio / O Integrador',
    oduNascimento: 'Ossá (9)',
    oduId: 'ossa',
    tarotCorrelation: 'O Eremita',
    vetorAlinhamento: 'Yesod para Malkuth (Manifestação Oculta)',
    sephirahFrom: 'Yesod',
    sephirahTo: 'Malkuth',
  },
  {
    numeroReduzido: 10,
    equivalenteTantrica: 'Corpo Radiante (Brilho e Coragem Real)',
    equivalenteCabalistica: 'O Renovador / Mudança',
    oduNascimento: 'Ofun (10)',
    oduId: 'ofun',
    tarotCorrelation: 'A Roda da Fortuna',
    vetorAlinhamento: 'Malkuth (Retorno ao Eixo Central)',
    sephirahFrom: 'Malkuth',
    sephirahTo: 'Malkuth',
  },
  {
    numeroReduzido: 11,
    equivalenteTantrica: 'Incorporação Divina / Mestre de Si',
    equivalenteCabalistica: 'O Canalizador / Desperto',
    oduNascimento: 'Alafia (16)',
    oduId: 'alafia',
    tarotCorrelation: 'A Força / O Pendurado',
    vetorAlinhamento: 'O Alinhamento Completo do Pilar Central',
    sephirahFrom: 'Kether',
    sephirahTo: 'Malkuth',
  },
];

/**
 * Get correlation for a specific number
 */
function getCorrelationForNumber(numero: number): NumerologyOdúCorrelation | undefined {
  return NUMEROLOGY_ODU_CORRELATIONS.find(c => c.numeroReduzido === numero);
}

/**
 * Get Odú for a birth number
 */
function getOduForBirthNumber(numero: number): string {
  const reduced = numero > 9 && numero !== 11 ? numero % 9 : numero;
  const correlation = getCorrelationForNumber(reduced);
  return correlation?.oduNascimento || 'Ofun (10)';
}

/**
 * Get all correlations
 */
export function getAllNumerologyOdúCorrelations(): NumerologyOdúCorrelation[] {
  return NUMEROLOGY_ODU_CORRELATIONS;
}

/**
 * Get tarot correlation for a number
 */
function getTarotForNumber(numero: number): string {
  const reduced = numero > 9 && numero !== 11 ? numero % 9 : numero;
  const correlation = getCorrelationForNumber(reduced);
  return correlation?.tarotCorrelation || 'A Roda da Fortuna';
}

/**
 * Get sephirah alignment for a number
 */
function getSephirahAlignment(numero: number): { from: string; to: string } | null {
  const reduced = numero > 9 && numero !== 11 ? numero % 9 : numero;
  const correlation = getCorrelationForNumber(reduced);
  if (!correlation) return null;
  return { from: correlation.sephirahFrom, to: correlation.sephirahTo };
}