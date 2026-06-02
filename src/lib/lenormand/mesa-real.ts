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
 * Obtém dados de uma casa específica (1-36)
 */
export function getCasaData(casaNumero: number): CasaCigana | null {
  if (casaNumero < 1 || casaNumero > 36) {
    return null;
  }
  return getCasaPorNumero(casaNumero) || null;
}

/**
 * Obtém dados de uma carta específica (1-36)
 */
export function getCartaData(cartaNumero: number): CartaCigana | null {
  if (cartaNumero < 1 || cartaNumero > 36) {
    return null;
  }
  return getCartaPorNumero(cartaNumero) || null;
}

/**
 * Obtém dados de um Odú específico (1-16)
 */
export function getOduData(oduNumero: number): OduInfo | null {
  if (oduNumero < 1 || oduNumero > 16) {
    return null;
  }
  return getOduPorNumero(oduNumero) || null;
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
    throw new Error(`Casa ${casaNumero} não existe. Use valores de 1 a 36.`);
  }

  // Busca correlações especiais se existirem
  const correlacaoEspecial = CORRELACOES_ESPECIAIS[casaNumero] || {
    numerologia: [],
    tantrica: [],
    cabalistica: [],
  };

  // Constrói descrição integrativa
  const integracao = construirIntegracao(casa, clientData, correlacaoEspecial);

  return {
    casaNumero,
    casaNome: casa.name,
    casaSignificado: casa.meaning,
    arquetipo: casa.archetype,
    casaAstrologica: casa.astrologyHouse,
    planetaRegente: casa.associatedPlanet,
    numerologia: [...casa.numerologyAspects, ...correlacaoEspecial.numerologia],
    odus: [...casa.oduAspects, ...correlacaoEspecial.tantrica],
    integracao,
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

  // Itera sobre todas as 36 casas
  for (let casaNumero = 1; casaNumero <= 36; casaNumero++) {
    const posicao = matrixData[casaNumero];
    if (!posicao) {
      continue; // Skip if no card placed
    }

    const casa = getCasaData(casaNumero);
    const carta = getCartaData(posicao.carta);
    const odu = getOduData(posicao.odu);

    if (!casa || !carta || !odu) {
      continue;
    }

    // Obtém correlação do arquétipo
    const correlacao = getArchetypeCorrelation(casaNumero, clientData);

    // Constrói interpretação integrada para esta posição
    const tiragem = gerarInterpretacaoPosicao(casa, carta, odu, correlacao, clientData);

    dossiê.push({
      casaNumero,
      casaNome: casa.name,
      casaSignificado: casa.meaning,
      posicaoGrid: getPosicaoGrid(casaNumero),
      carta: {
        numero: carta.numero,
        nome: carta.nome,
        significado: carta.significado,
      },
      odu: {
        numero: odu.numero,
        nome: odu.nome,
        significado: odu.significado,
      },
      correlacao,
      dadosConsulente: clientData as DadosConsulente,
      tiragem,
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
  // Constrói index auxiliar pos→{carta,odu}; não precisa de todos os
  // campos canônicos de TiragemMesaReal porque é só consumido pelo
  // construirArquiteturaDossiê.
  const matrixData: MatrixIndex = {};

  for (const pos of posicoes) {
    matrixData[pos.casa] = {
      carta: pos.carta,
      odu: pos.odu,
    };
  }

  return construirArquiteturaDossiê(matrixData, clientData);
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
    consulente: clientData.nome,
    tipoTiragem,
    posicoes,
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
  const partes: string[] = [];

  // Casa astrológica
  partes.push(`Casa Astrológica ${casa.astrologyHouse} (${casa.associatedPlanet})`);

  // Numerologia
  if (clientData.caminhoDeVida) {
    partes.push(`Caminho de Vida: ${clientData.caminhoDeVida}`);
  }
  if (correlacaoEspecial.numerologia.length > 0) {
    partes.push(`Correlações numerológicas: ${correlacaoEspecial.numerologia.join(', ')}`);
  }

  // Odús
  if (clientData.oduNascimento) {
    partes.push(`Odú de Nascimento: ${clientData.oduNascimento}`);
  }
  if (clientData.orixaRegente) {
    partes.push(`Orixá Regente: ${clientData.orixaRegente}`);
  }

  // Tântrica
  if (correlacaoEspecial.tantrica.length > 0) {
    partes.push(`Energia Tântrica: ${correlacaoEspecial.tantrica.join(', ')}`);
  }

  return partes.join(' | ');
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
  const elementos: string[] = [];

  // Elemento da casa
  elementos.push(`Elemento: ${casa.element}`);

  // Arquétipo
  elementos.push(`Arquétipo: ${correlacao.arquetipo}`);

  // Integração astrológica
  elementos.push(`${casa.associatedPlanet} rege esta posição`);

  // Numerologia correlacionada
  if (correlacao.numerologia.length > 0) {
    elementos.push(`Numerologia: ${correlacao.numerologia.slice(0, 3).join(', ')}`);
  }

  // Odú
  elementos.push(`Odú ${odu.nome} traz ${odu.significado}`);

  // Dados do consulente
  if (clientData.ascendente) {
    elementos.push(`Ascendente: ${clientData.ascendente}`);
  }
  if (clientData.signoSolar) {
    elementos.push(`Signo: ${clientData.signoSolar}`);
  }

  return elementos.join(' | ');
}

/**
 * Gera síntese geral da leitura
 */
function gerarSintese(dossiê: ArquiteturaDossiê[], clientData: Partial<DadosConsulente>): string {
  if (dossiê.length === 0) {
    return 'Nenhuma posição foi tirada nesta leitura.';
  }

  // Identifica casas dominantes
  const casasFogo = dossiê.filter(d => getCasaData(d.casaNumero)?.element === 'fogo');
  const casasAgua = dossiê.filter(d => getCasaData(d.casaNumero)?.element === 'água');
  const casasTerra = dossiê.filter(d => getCasaData(d.casaNumero)?.element === 'terra');
  const casasAr = dossiê.filter(d => getCasaData(d.casaNumero)?.element === 'ar');

  // Identifica Odús predominantes
  const oduCounts: Record<number, number> = {};
  for (const d of dossiê) {
    oduCounts[d.odu.numero] = (oduCounts[d.odu.numero] || 0) + 1;
  }
  const maisFrequente = Object.entries(oduCounts).sort((a, b) => b[1] - a[1])[0];

  const sintesePartes: string[] = [];

  // Elemento predominante
  const elementos = [
    { nome: 'Fogo', casas: casasFogo },
    { nome: 'Água', casas: casasAgua },
    { nome: 'Terra', casas: casasTerra },
    { nome: 'Ar', casas: casasAr },
  ];
  const predominante = elementos.reduce((max, curr) =>
    curr.casas.length > max.casas.length ? curr : max
  );
  sintesePartes.push(`Energia predominante: ${predominante.nome} (${predominante.casas.length} posições)`);

  // Odú mais frequente
  const oduPredominante = getOduData(parseInt(maisFrequente[0]));
  if (oduPredominante) {
    sintesePartes.push(`Odú mais presente: ${oduPredominante.nome} (${maisFrequente[1]} vezes) - ${oduPredominante.significado}`);
  }

  // Posição do consulente
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

export type SpreadType = keyof typeof MESA_REAL_SPREADS;

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
export type {
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