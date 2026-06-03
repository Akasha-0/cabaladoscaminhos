/**
 * Mesa Real - Engine de Leitura Cigana
 * Sistema completo de 36 casas com correlação astrológica,
 * numerológica e de Ifá/Candomblé
 */

import type {
  CasaCigana,
  CartaCigana,
  OduInfo,
  TiragemMesaReal,
  ArquiteturaDossiê,
  DadosConsulente,
  CorrelacaoCasa,
  ResultadoLeitura,
  PosicaoTiragem,
} from './mesa-real-types';

import {
  CASAS_MESA_REAL,
  CARTAS_CIGANAS,
  ODUS_IFA,
  getCasaPorNumero,
  getCartaPorNumero,
  getOduPorNumero,
  CORRELACOES_ESPECIAIS,
  getPosicaoGrid,
} from './mesa-real-data';

// ============================================================================
// FUNÇÕES EXPORTADAS
// ============================================================================

/**
 * Obtém dados de uma casa específica (1-36).
 * Retorna `null` para fora do range (vs `undefined` das helpers de mesa-real-data).
 */
export function getCasaData(casaNumero: number): CasaCigana | null {
  if (casaNumero < 1 || casaNumero > 36) {
    return null;
  }
  return getCasaPorNumero(casaNumero) ?? null;
}

/**
 * Obtém dados de uma carta específica (1-36).
 * Retorna `null` para fora do range.
 */
export function getCartaData(cartaNumero: number): CartaCigana | null {
  if (cartaNumero < 1 || cartaNumero > 36) {
    return null;
  }
  return getCartaPorNumero(cartaNumero) ?? null;
}

/**
 * Obtém dados de um Odú específico (1-16).
 * Retorna `null` para fora do range.
 */
export function getOduData(oduNumero: number): OduInfo | null {
  if (oduNumero < 1 || oduNumero > 16) {
    return null;
  }
  return getOduPorNumero(oduNumero) ?? null;
}

/**
 * Obtém correlação de arquétipo para uma casa com dados do consulente
 */
export function getArchetypeCorrelation(
  casaNumero: number,
  clientData: Partial<DadosConsulente>
): CorrelacaoCasa {
  const casa = getCasaData(casaNumero);
  if (!casa) {
    return {
      casaNumero,
      casaNome: `Casa ${casaNumero}`,
      casaSignificado: '',
      arquetipo: '',
      casaAstrologica: 1,
      planetaRegente: '',
      numerologia: [],
      odus: [],
      sefirot: '',
      tarot: '',
      integracao: '',
    };
  }

  // Get correlations for this house
  const correlations = CORRELACOES_ESPECIAIS[casaNumero] || {};
  
  // Include numerological data from client (if available)
  if (clientData.numerologia || clientData.sefira) {
    correlations.numerologia = [
      ...(correlations.numerologia || []),
      clientData.numerologia,
      clientData.sefira,
    ].filter(Boolean) as string[];
  }

  return {
    casaNumero,
    casaNome: casa.name,
    casaSignificado: casa.meaning,
    arquetipo: casa.archetype,
    casaAstrologica: casa.houseNumber,
    planetaRegente: casa.associatedPlanet || '',
    numerologia: correlations.numerologia || [],
    odus: correlations.cabalistica || [],
    sefirot: correlations.cabalistica?.[0] || '',
    tarot: '',
    integracao: '',
  };
}

/**
 * Tipo prático: a parte indexada de TiragemMesaReal.
 * Aceita tanto a forma completa quanto o Record simples usado por
 * testes e pela UI (não exige os campos `formato/cartas/odus/timestamp`).
 */
export type MatrixIndex = {
  [casaNumero: number]: { carta: number; odu: number };
};

/**
 * Constrói a arquitetura completa do dossiê
 */
export function construirArquiteturaDossiê(
  matrixData: MatrixIndex,
  clientData: Partial<DadosConsulente>
): ArquiteturaDossiê[] {
  const dossiê: ArquiteturaDossiê[] = [];

  for (let i = 1; i <= 36; i++) {
    const pos = matrixData[i];
    if (!pos) continue;

    const casa = getCasaData(i);
    const carta = getCartaData(pos.carta);
    const odu = getOduData(pos.odu);

    if (!casa || !carta || !odu) continue;

    const integracao = construirIntegracao(casa, clientData, CORRELACOES_ESPECIAIS[casa.houseNumber] || { numerologia: [], tantrica: [], cabalistica: [] });
    const correlacao = getArchetypeCorrelation(i, clientData);

    dossiê.push({
      casaNumero: i,
      casaNome: casa.name,
      casaSignificado: casa.meaning,
      posicaoGrid: { row: Math.floor((i - 1) / 4) + 1, col: ((i - 1) % 4) + 1 },
      carta,
      odu,
      integracao,
      correlacao,
      dadosConsulente: clientData as DadosConsulente,
    });
  }

  return dossiê;
}

/**
 * Constrói dossiê a partir de posições ordenadas (alternativa)
 */
export function construirDossiêFromPosicoes(
  posicoes: PosicaoTiragem[],
  clientData: Partial<DadosConsulente>
): ArquiteturaDossiê[] {
  const matrixIndex: MatrixIndex = {};
  for (const pos of posicoes) {
    matrixIndex[pos.casa] = { carta: pos.carta, odu: pos.odu };
  }
  return construirArquiteturaDossiê(matrixIndex, clientData);
}

/**
 * Gera resultado completo de leitura
 */
export function gerarLeituraCompleta(
  posicoes: PosicaoTiragem[],
  clientData: Partial<DadosConsulente>,
  tipoTiragem: '9x4' | '8x4+4' = '9x4'
): ResultadoLeitura {
  const dossiê = construirDossiêFromPosicoes(posicoes, clientData);
  const sintese = gerarSintese(dossiê, clientData);

  return {
    data: new Date().toISOString(),
    tipoTiragem,
    posicoes: [],
    dossiê,
    sintese,
  };
}

// ============================================================================
// FUNÇÕES INTERNAS
// ============================================================================

/**
 * Constrói descrição integrativa para uma casa
 */
function construirIntegracao(
  casa: CasaCigana,
  clientData: Partial<DadosConsulente>,
  correlacaoEspecial: { numerologia: string[]; tantrica: string[]; cabalistica: string[] }
): string {
  const parts: string[] = [];

  // Basic house description
  parts.push(casa.meaning);

  // Add archetype if available
  if (clientData.numerologia) {
    parts.push(`Numerologia: ${clientData.numerologia}`);
  }

  // Add sefirot if available
  if (clientData.sefira) {
    parts.push(`Sefirá: ${clientData.sefira}`);
  }

  // Add special correlations
  if (correlacaoEspecial.numerologia?.length) {
    parts.push(`Correlações numerológicas: ${correlacaoEspecial.numerologia.join(', ')}`);
  }

  return parts.join('. ');
}

/**
 * Gera interpretação para uma posição específica
 */
function gerarInterpretacaoPosicao(
  casa: CasaCigana,
  carta: CartaCigana,
  odu: OduInfo,
  correlacao: CorrelacaoCasa,
  clientData: Partial<DadosConsulente>
): string {
  const parts: string[] = [];

  // House interpretation
  parts.push(`${casa.name} (Casa ${casa.houseNumber}): ${casa.meaning}`);

  // Card interpretation
  parts.push(`Carta: ${carta.nome} - ${carta.significado}`);

  // Odu interpretation
  if (odu?.significado) {
    parts.push(`Odú: ${odu.nome} - ${odu.significado}`);
  }

  // Archetype correlation
  if (correlacao.arquetipo) {
    parts.push(`Arquétipo: ${correlacao.arquetipo}`);
  }

  // Integration
  if (correlacao.numerologia?.length) {
    parts.push(`Numerologia: ${correlacao.numerologia.join(', ')}`);
  }

  return parts.join(' | ');
}

/**
 * Gera síntese geral da leitura
 */
function gerarSintese(dossiê: ArquiteturaDossiê[], clientData: Partial<DadosConsulente>): string {
  const sintesePartes: string[] = [];

  // Count elements
  const elementos: Record<string, number> = {
    fogo: 0,
    terra: 0,
    ar: 0,
    água: 0,
  };

  for (const d of dossiê) {
    const casa = getCasaData(d.casaNumero);
    if (casa?.element) {
      elementos[casa.element] = (elementos[casa.element] || 0) + 1;
    }
  }

  // Add element summary
  const elementoSummary = Object.entries(elementos)
    .filter(([, count]) => count > 0)
    .map(([el, count]) => `${el}: ${count}`)
    .join(', ');

  if (elementoSummary) {
    sintesePartes.push(`Equilíbrio elementar: ${elementoSummary}`);
  }

  // Add client name if available
  if (clientData.nome) {
    sintesePartes.push(`Leitura para: ${clientData.nome}`);
  }

  return sintesePartes.join('. ') + '.';
}

// ============================================================================
// SPREADS (TIRAGENS)
// ============================================================================

export const MESA_REAL_SPREADS = {
  '9x4': {
    nome: 'Mesa Real 9x4',
    descricao: 'Grade de 9 colunas x 4 linhas = 36 posições. Leitura completa.',
    posicoes: 36,
  },
  '8x4+4': {
    nome: 'Mesa com 4 Laterais',
    descricao: '8x4 central + 4 posições laterais para questões específicas.',
    posicoes: 36,
  },
} as const;


/**
 * Gera posições para uma tiragem 9x4
 */
export function gerarTiragem9x4(seed?: number): PosicaoTiragem[] {
  const posicoes: PosicaoTiragem[] = [];

  for (let i = 1; i <= 36; i++) {
    // Simulated card placement - in real impl would use seed for determinism
    const cardIndex = seed ? ((seed * i) % 36) + 1 : i;
    const oduIndex = seed ? ((seed * i * 3) % 16) + 1 : ((i % 16) + 1);

    posicoes.push({
      casa: i,
      carta: cardIndex,
      odu: oduIndex,
    });
  }

  return posicoes;
}

/**
 * Interface de posição para leitura (compatibilidade)
 */
export interface CardPosition {
  position: number;
  house: string;
  card: string;
}

/**
 * Função legacy para compatibilidade
 */
export function realizarLeitura(
  format: '8x4+4' | '9x4' = '9x4',
  seed?: number
): CardPosition[] {
  const tiragem = gerarTiragem9x4(seed);
  return tiragem.map(pos => {
    const casa = getCasaData(pos.casa);
    const carta = getCartaData(pos.carta);
    return {
    data: new Date().toISOString(),
      position: pos.casa,
      house: casa?.name || `Casa ${pos.casa}`,
      card: carta?.nome || `Carta ${pos.carta}`,
    };
  });
}

// ============================================================================
// VALIDAÇÃO
// ============================================================================

/**
 * Valida uma tiragem completa
 */
export function validarTiragem(tiragem: MatrixIndex): {
  valida: boolean;
  erros: string[];
} {
  const erros: string[] = [];

  for (let i = 1; i <= 36; i++) {
    const pos = tiragem[i];
    if (!pos) {
      erros.push(`Casa ${i} não tem carta`);
      continue;
    }

    if (pos.carta < 1 || pos.carta > 36) {
      erros.push(`Casa ${i}: Carta ${pos.carta} inválida (use 1-36)`);
    }

    if (pos.odu < 1 || pos.odu > 16) {
      erros.push(`Casa ${i}: Odú ${pos.odu} inválido (use 1-16)`);
    }
  }

  return {
    valida: erros.length === 0,
    erros,
  };
}

/**
 * Conta elementos em uma tiragem
 */
export function contarElementos(dossiê: ArquiteturaDossiê[]): Record<string, number> {
  const contagem: Record<string, number> = {
    fogo: 0,
    terra: 0,
    ar: 0,
    água: 0,
    éter: 0,
  };

  for (const d of dossiê) {
    const casa = getCasaData(d.casaNumero);
    if (casa && contagem[casa.element] !== undefined) {
      contagem[casa.element]++;
    }
  }

  return contagem;
}

/**
 * Exporta tipos para uso em outros módulos
 */
