/**
 * Mesa Real - Comprehensive Tests
 * Tests for 36 houses, 36 cards, 16 Odús, and archetype correlations
 */

import { describe, it, expect } from 'vitest';
import {
  getCasaData,
  getCartaData,
  getOduData,
  construirArquiteturaDossiê,
  getArchetypeCorrelation,
  gerarTiragem9x4,
  gerarLeituraCompleta,
  validarTiragem,
  contarElementos,
  construirDossiêFromPosicoes,
  MESA_REAL_SPREADS,
  realizarLeitura,
} from '@/lib/lenormand/mesa-real';

import {
  CASAS_MESA_REAL,
  CARTAS_CIGANAS,
  ODUS_IFA,
  CORRELACOES_ESPECIAIS,
} from '@/lib/lenormand/mesa-real-data';

describe('Mesa Real - Data Integrity', () => {
  describe('36 Houses', () => {
    it('should have exactly 36 houses', () => {
      expect(CASAS_MESA_REAL.length).toBe(36);
    });

    it('should have houses numbered 1-36', () => {
      const numbers = CASAS_MESA_REAL.map(c => c.houseNumber).sort((a, b) => a - b);
      expect(numbers).toEqual(Array.from({ length: 36 }, (_, i) => i + 1));
    });

    it('should have all required fields for each house', () => {
      for (const casa of CASAS_MESA_REAL) {
        expect(casa).toHaveProperty('houseNumber');
        expect(casa).toHaveProperty('name');
        expect(casa).toHaveProperty('meaning');
        expect(casa).toHaveProperty('element');
        expect(casa).toHaveProperty('archetype');
        expect(casa).toHaveProperty('astrologyHouse');
        expect(casa).toHaveProperty('associatedPlanet');
        expect(casa).toHaveProperty('numerologyAspects');
        expect(casa).toHaveProperty('oduAspects');
      }
    });

    it('should have valid elements for all houses', () => {
      const elementosValidos = ['fogo', 'terra', 'ar', 'água', 'éter'];
      for (const casa of CASAS_MESA_REAL) {
        expect(elementosValidos).toContain(casa.element);
      }
    });

    it('should have valid astrology houses (1-12) for all houses', () => {
      for (const casa of CASAS_MESA_REAL) {
        expect(casa.astrologyHouse).toBeGreaterThanOrEqual(1);
        expect(casa.astrologyHouse).toBeLessThanOrEqual(12);
      }
    });

    it('should have non-empty meanings for all houses', () => {
      for (const casa of CASAS_MESA_REAL) {
        expect(casa.meaning.length).toBeGreaterThan(0);
      }
    });

    it('should have numerology aspects array for all houses', () => {
      for (const casa of CASAS_MESA_REAL) {
        expect(Array.isArray(casa.numerologyAspects)).toBe(true);
        expect(casa.numerologyAspects.length).toBeGreaterThan(0);
      }
    });

    it('should have odu aspects array for all houses', () => {
      for (const casa of CASAS_MESA_REAL) {
        expect(Array.isArray(casa.oduAspects)).toBe(true);
        expect(casa.oduAspects.length).toBeGreaterThan(0);
      }
    });

    it('House 1 (O Mensageiro) should have Mercury correlation', () => {
      const casa1 = CASAS_MESA_REAL.find(c => c.houseNumber === 1);
      expect(casa1).toBeDefined();
      expect(casa1?.associatedPlanet).toBe('Mercúrio');
      expect(casa1?.astrologyHouse).toBe(3);
    });

    it('House 4 (A Casa) should have Saturn and House 4 correlation', () => {
      const casa4 = CASAS_MESA_REAL.find(c => c.houseNumber === 4);
      expect(casa4).toBeDefined();
      expect(casa4?.associatedPlanet).toBe('Saturno');
      expect(casa4?.astrologyHouse).toBe(4);
      expect(casa4?.name).toBe('A CASA');
    });

    it('House 12 (Os Pássaros) should have Mercury correlation', () => {
      const casa12 = CASAS_MESA_REAL.find(c => c.houseNumber === 12);
      expect(casa12).toBeDefined();
      expect(casa12?.associatedPlanet).toBe('Mercúrio');
      expect(casa12?.astrologyHouse).toBe(3);
    });

    it('House 34 (Os Peixes) should have House 2 correlation for finances', () => {
      const casa34 = CASAS_MESA_REAL.find(c => c.houseNumber === 34);
      expect(casa34).toBeDefined();
      expect(casa34?.astrologyHouse).toBe(2);
      expect(casa34?.name).toBe('OS PEIXES');
    });
  });

  describe('36 Cards', () => {
    it('should have exactly 36 cards', () => {
      expect(CARTAS_CIGANAS.length).toBe(36);
    });

    it('should have cards numbered 1-36', () => {
      const numbers = CARTAS_CIGANAS.map(c => c.number).sort((a, b) => a - b);
      expect(numbers).toEqual(Array.from({ length: 36 }, (_, i) => i + 1));
    });

    it('should have all required fields for each card', () => {
      for (const carta of CARTAS_CIGANAS) {
        expect(carta).toHaveProperty('number');
        expect(carta).toHaveProperty('name');
        expect(carta).toHaveProperty('meaning');
      }
    });

    it('should have non-empty meanings for all cards', () => {
      for (const carta of CARTAS_CIGANAS) {
        expect(carta.meaning.length).toBeGreaterThan(0);
      }
    });

    it('should include O CAMINHO (Card 21)', () => {
      const caminho = CARTAS_CIGANAS.find(c => c.number === 21);
      expect(caminho).toBeDefined();
      expect(caminho?.name).toBe('O CAMINHO');
    });

    it('should include A FLOR (Card 6)', () => {
      const flor = CARTAS_CIGANAS.find(c => c.number === 6);
      expect(flor).toBeDefined();
      expect(flor?.name).toBe('A FLOR');
    });

    it('should include A SERPE (Card 5)', () => {
      const serpe = CARTAS_CIGANAS.find(c => c.number === 5);
      expect(serpe).toBeDefined();
      expect(serpe?.name).toBe('A SERPE');
    });
  });

  describe('16 Odús', () => {
    it('should have exactly 16 odus', () => {
      expect(ODUS_IFA.length).toBe(16);
    });

    it('should have odus numbered 1-16', () => {
      const numbers = ODUS_IFA.map(o => o.numero).sort((a, b) => a - b);
      expect(numbers).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
    });

    it('should have all required fields for each odu', () => {
      for (const odu of ODUS_IFA) {
        expect(odu).toHaveProperty('numero');
        expect(odu).toHaveProperty('nome');
        expect(odu).toHaveProperty('significado');
      }
    });

    it('should include OKANRAN (Odu 1)', () => {
      const okanran = ODUS_IFA.find(o => o.numero === 1);
      expect(okanran).toBeDefined();
      expect(okanran?.nome).toBe('OKANRAN');
    });

    it('should include OGUNDA (Odu 6)', () => {
      const ogun = ODUS_IFA.find(o => o.numero === 6);
      expect(ogun).toBeDefined();
      expect(ogun?.nome).toBe('OGUNDA');
    });

    it('should include GBO (Odu 8)', () => {
      const gbo = ODUS_IFA.find(o => o.numero === 8);
      expect(gbo).toBeDefined();
      expect(gbo?.nome).toBe('GBO');
    });

    it('should have non-empty significados for all odus', () => {
      for (const odu of ODUS_IFA) {
        expect(odu.significado.length).toBeGreaterThan(0);
      }
    });

    it('should have short meanings for all odus', () => {
      for (const odu of ODUS_IFA) {
        expect(odu.shortMeaning).toBeDefined();
        expect(odu.shortMeaning?.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('Mesa Real - getCasaData', () => {
  it('should return house data for valid house numbers (1-36)', () => {
    for (let i = 1; i <= 36; i++) {
      const casa = getCasaData(i);
      expect(casa).not.toBeNull();
      expect(casa?.houseNumber).toBe(i);
    }
  });

  it('should return null for invalid house numbers (< 1)', () => {
    expect(getCasaData(0)).toBeNull();
    expect(getCasaData(-1)).toBeNull();
    expect(getCasaData(-100)).toBeNull();
  });

  it('should return null for invalid house numbers (> 36)', () => {
    expect(getCasaData(37)).toBeNull();
    expect(getCasaData(100)).toBeNull();
  });

  it('should return correct house for house 1', () => {
    const casa = getCasaData(1);
    expect(casa?.name).toBe('O MENSAGEIRO');
    expect(casa?.element).toBe('ar');
  });

  it('should return correct house for house 4', () => {
    const casa = getCasaData(4);
    expect(casa?.name).toBe('A CASA');
    expect(casa?.element).toBe('terra');
  });

  it('should return correct house for house 36', () => {
    const casa = getCasaData(36);
    expect(casa?.name).toBe('A URNA');
    expect(casa?.element).toBe('água');
  });
});

describe('Mesa Real - getCartaData', () => {
  it('should return card data for valid card numbers (1-36)', () => {
    for (let i = 1; i <= 36; i++) {
      const carta = getCartaData(i);
      expect(carta).not.toBeNull();
      expect(carta?.number).toBe(i);
    }
  });

  it('should return null for invalid card numbers (< 1)', () => {
    expect(getCartaData(0)).toBeNull();
    expect(getCartaData(-1)).toBeNull();
  });

  it('should return null for invalid card numbers (> 36)', () => {
    expect(getCartaData(37)).toBeNull();
    expect(getCartaData(100)).toBeNull();
  });

  it('should return correct card for card 1', () => {
    const carta = getCartaData(1);
    expect(carta?.name).toBe('O MENSAGEIRO');
  });

  it('should return correct card for card 21 (O CAMINHO)', () => {
    const carta = getCartaData(21);
    expect(carta?.name).toBe('O CAMINHO');
    expect(carta?.meaning).toContain('Jornada');
  });
});

describe('Mesa Real - getOduData', () => {
  it('should return odu data for valid odu numbers (1-16)', () => {
    for (let i = 1; i <= 16; i++) {
      const odu = getOduData(i);
      expect(odu).not.toBeNull();
      expect(odu?.numero).toBe(i);
    }
  });

  it('should return null for invalid odu numbers (< 1)', () => {
    expect(getOduData(0)).toBeNull();
    expect(getOduData(-1)).toBeNull();
  });

  it('should return null for invalid odu numbers (> 16)', () => {
    expect(getOduData(17)).toBeNull();
    expect(getOduData(100)).toBeNull();
  });

  it('should return OKANRAN for odu 1', () => {
    const odu = getOduData(1);
    expect(odu?.nome).toBe('OKANRAN');
  });

  it('should return EJONG for odu 2', () => {
    const odu = getOduData(2);
    expect(odu?.nome).toBe('EJONG');
  });
});

describe('Mesa Real - getArchetypeCorrelation', () => {
  const mockClientData = {
    nome: 'João Silva',
    dataNascimento: '1990-05-15',
    caminhoDeVida: 7,
    numeroExpressao: 5,
    ascendente: 'Leão',
    signoSolar: 'Touro',
    oduNascimento: 'Ogunda',
    orixaRegente: 'Ogum',
  };

  it('should return correlation for valid house numbers', () => {
    for (let i = 1; i <= 36; i++) {
      const correlacao = getArchetypeCorrelation(i, mockClientData);
      expect(correlacao).toHaveProperty('casaNumero', i);
      expect(correlacao).toHaveProperty('casaNome');
      expect(correlacao).toHaveProperty('casaSignificado');
      expect(correlacao).toHaveProperty('arquetipo');
      expect(correlacao).toHaveProperty('casaAstrologica');
      expect(correlacao).toHaveProperty('planetaRegente');
      expect(correlacao).toHaveProperty('numerologia');
      expect(correlacao).toHaveProperty('odus');
      expect(correlacao).toHaveProperty('integracao');
    }
  });

  it('should throw for invalid house numbers', () => {
    expect(() => getArchetypeCorrelation(0, mockClientData)).toThrow();
    expect(() => getArchetypeCorrelation(37, mockClientData)).toThrow();
  });

  it('House 1 should correlate with Ascendente + Alma', () => {
    const correlacao = getArchetypeCorrelation(1, mockClientData);
    expect(correlacao.casaAstrologica).toBe(3);
    expect(correlacao.planetaRegente).toBe('Mercúrio');
    const hasAlmaCorrelation = correlacao.numerologia.some(n =>
      n.includes('Alma') || n.includes('Motivação')
    );
    expect(hasAlmaCorrelation).toBe(true);
  });

  it('House 4 should correlate with Fundo do Céu + Motivação', () => {
    const correlacao = getArchetypeCorrelation(4, mockClientData);
    expect(correlacao.casaAstrologica).toBe(4);
    expect(correlacao.planetaRegente).toBe('Saturno');
    const hasMotivacao = correlacao.numerologia.some(n =>
      n.includes('Destino') || n.includes('Motivação')
    );
    expect(hasMotivacao).toBe(true);
  });

  it('House 12 should correlate with Casa 3/Mercúrio + Dom Divino', () => {
    const correlacao = getArchetypeCorrelation(12, mockClientData);
    expect(correlacao.casaAstrologica).toBe(3);
    expect(correlacao.planetaRegente).toBe('Mercúrio');
    const hasDomDivino = correlacao.numerologia.some(n => n.includes('Dom Divino'));
    expect(hasDomDivino).toBe(true);
  });

  it('House 34 should correlate with Casa 2 + Karma', () => {
    const correlacao = getArchetypeCorrelation(34, mockClientData);
    expect(correlacao.casaAstrologica).toBe(2);
    expect(correlacao.numerologia.some(n => n.includes('Karma'))).toBe(true);
  });

  it('should include client data in integration string', () => {
    const correlacao = getArchetypeCorrelation(1, mockClientData);
    expect(correlacao.integracao).toContain('Casa Astrológica');
    expect(correlacao.integracao).toContain('Mercúrio');
    expect(correlacao.integracao).toContain('Caminho de Vida');
  });
});

describe('Mesa Real - construirArquiteturaDossiê', () => {
  const mockClientData = {
    nome: 'Maria Santos',
    dataNascimento: '1985-08-22',
    caminhoDeVida: 3,
    ascendente: 'Escorpião',
    signoSolar: 'Leão',
  };

  const sampleTiragem: Record<number, { carta: number; odu: number }> = {
    1: { carta: 10, odu: 1 },
    2: { carta: 20, odu: 2 },
    3: { carta: 30, odu: 3 },
    4: { carta: 5, odu: 4 },
    12: { carta: 12, odu: 6 },
    34: { carta: 34, odu: 8 },
  };

  it('should generate correct structure', () => {
    const dossiê = construirArquiteturaDossiê(sampleTiragem, mockClientData);

    expect(Array.isArray(dossiê)).toBe(true);
    expect(dossiê.length).toBeGreaterThan(0);

    for (const item of dossiê) {
      expect(item).toHaveProperty('casaNumero');
      expect(item).toHaveProperty('casaNome');
      expect(item).toHaveProperty('casaSignificado');
      expect(item).toHaveProperty('posicaoGrid');
      expect(item).toHaveProperty('carta');
      expect(item).toHaveProperty('odu');
      expect(item).toHaveProperty('correlacao');
      expect(item).toHaveProperty('dadosConsulente');
      expect(item).toHaveProperty('tiragem');
    }
  });

  it('should have correct position grid for each house', () => {
    const dossiê = construirArquiteturaDossiê(sampleTiragem, mockClientData);

    for (const item of dossiê) {
      const { linha, coluna } = item.posicaoGrid;
      expect(linha).toBeGreaterThanOrEqual(1);
      expect(linha).toBeLessThanOrEqual(4);
      expect(coluna).toBeGreaterThanOrEqual(1);
      expect(coluna).toBeLessThanOrEqual(9);
    }
  });

  it('should include card data correctly', () => {
    const dossiê = construirArquiteturaDossiê(sampleTiragem, mockClientData);

    const casa1 = dossiê.find(d => d.casaNumero === 1);
    expect(casa1).toBeDefined();
    expect(casa1?.carta.numero).toBe(10);
    expect(casa1?.carta.nome).toBe('A CRIANÇA');
  });

  it('should include odu data correctly', () => {
    const dossiê = construirArquiteturaDossiê(sampleTiragem, mockClientData);

    const casa1 = dossiê.find(d => d.casaNumero === 1);
    expect(casa1).toBeDefined();
    expect(casa1?.odu.numero).toBe(1);
    expect(casa1?.odu.nome).toBe('OKANRAN');
  });

  it('should skip positions not in tiragem', () => {
    const partialTiragem: Record<number, { carta: number; odu: number }> = {
      1: { carta: 10, odu: 1 },
      2: { carta: 20, odu: 2 },
    };

    const dossiê = construirArquiteturaDossiê(partialTiragem, mockClientData);
    expect(dossiê.length).toBe(2);
    expect(dossiê.find(d => d.casaNumero === 1)).toBeDefined();
    expect(dossiê.find(d => d.casaNumero === 2)).toBeDefined();
    expect(dossiê.find(d => d.casaNumero === 3)).toBeUndefined();
  });
});

describe('Mesa Real - gerarTiragem9x4', () => {
  it('should generate 36 positions', () => {
    const tiragem = gerarTiragem9x4();
    expect(tiragem.length).toBe(36);
  });

  it('should have valid casa numbers (1-36)', () => {
    const tiragem = gerarTiragem9x4();
    for (const pos of tiragem) {
      expect(pos.casa).toBeGreaterThanOrEqual(1);
      expect(pos.casa).toBeLessThanOrEqual(36);
    }
  });

  it('should have valid card numbers (1-36)', () => {
    const tiragem = gerarTiragem9x4();
    for (const pos of tiragem) {
      expect(pos.carta).toBeGreaterThanOrEqual(1);
      expect(pos.carta).toBeLessThanOrEqual(36);
    }
  });

  it('should have valid odu numbers (1-16)', () => {
    const tiragem = gerarTiragem9x4();
    for (const pos of tiragem) {
      expect(pos.odu).toBeGreaterThanOrEqual(1);
      expect(pos.odu).toBeLessThanOrEqual(16);
    }
  });

  it('should be deterministic with same seed', () => {
    const tiragem1 = gerarTiragem9x4(12345);
    const tiragem2 = gerarTiragem9x4(12345);
    expect(tiragem1).toEqual(tiragem2);
  });

  it('should be different with different seeds', () => {
    const tiragem1 = gerarTiragem9x4(12345);
    const tiragem2 = gerarTiragem9x4(67890);
    expect(tiragem1).not.toEqual(tiragem2);
  });
});

describe('Mesa Real - gerarLeituraCompleta', () => {
  const mockClientData = {
    nome: 'Test User',
    caminhoDeVida: 5,
  };

  it('should generate complete reading structure', () => {
    const posicoes = gerarTiragem9x4(100);
    const resultado = gerarLeituraCompleta(posicoes, mockClientData, '9x4');

    expect(resultado).toHaveProperty('data');
    expect(resultado).toHaveProperty('consulente', 'Test User');
    expect(resultado).toHaveProperty('tipoTiragem', '9x4');
    expect(resultado).toHaveProperty('posicoes');
    expect(resultado).toHaveProperty('dossiê');
    expect(resultado).toHaveProperty('sintese');
  });

  it('should have 36 posições in dossiê', () => {
    const posicoes = gerarTiragem9x4(100);
    const resultado = gerarLeituraCompleta(posicoes, mockClientData, '9x4');
    expect(resultado.dossiê.length).toBe(36);
  });

  it('should have non-empty sintese', () => {
    const posicoes = gerarTiragem9x4(100);
    const resultado = gerarLeituraCompleta(posicoes, mockClientData, '9x4');
    expect(resultado.sintese.length).toBeGreaterThan(0);
  });
});

describe('Mesa Real - validarTiragem', () => {
  it('should validate complete tiragem with 36 positions', () => {
    const tiragemCompleta: Record<number, { carta: number; odu: number }> = {};
    for (let i = 1; i <= 36; i++) {
      tiragemCompleta[i] = { carta: i, odu: ((i - 1) % 16) + 1 };
    }

    const result = validarTiragem(tiragemCompleta);
    expect(result.valida).toBe(true);
    expect(result.erros.length).toBe(0);
  });

  it('should detect missing positions', () => {
    const tiragemIncompleta: Record<number, { carta: number; odu: number }> = {
      1: { carta: 1, odu: 1 },
      2: { carta: 2, odu: 2 },
    };

    const result = validarTiragem(tiragemIncompleta);
    expect(result.valida).toBe(false);
    expect(result.erros.length).toBeGreaterThan(0);
    expect(result.erros.some(e => e.includes('não tem carta'))).toBe(true);
  });

  it('should detect invalid card numbers', () => {
    const tiragemInvalida: Record<number, { carta: number; odu: number }> = {
      1: { carta: 50, odu: 1 },
      2: { carta: 2, odu: 2 },
    };

    const result = validarTiragem(tiragemInvalida);
    expect(result.valida).toBe(false);
    expect(result.erros.some(e => e.includes('Carta 50 inválida'))).toBe(true);
  });

  it('should detect invalid odu numbers', () => {
    const tiragemInvalida: Record<number, { carta: number; odu: number }> = {
      1: { carta: 1, odu: 20 },
      2: { carta: 2, odu: 2 },
    };

    const result = validarTiragem(tiragemInvalida);
    expect(result.valida).toBe(false);
    expect(result.erros.some(e => e.includes('Odú 20 inválido'))).toBe(true);
  });
});

describe('Mesa Real - contarElementos', () => {
  it('should count elements correctly', () => {
    const dossiê = construirDossiêFromPosicoes(gerarTiragem9x4(100), {});
    const contagem = contarElementos(dossiê);

    expect(contagem).toHaveProperty('fogo');
    expect(contagem).toHaveProperty('terra');
    expect(contagem).toHaveProperty('ar');
    expect(contagem).toHaveProperty('água');
    expect(contagem).toHaveProperty('éter');

    const total = Object.values(contagem).reduce((sum, count) => sum + count, 0);
    expect(total).toBe(36);
  });

  it('should have at least one of each element', () => {
    const dossiê = construirDossiêFromPosicoes(gerarTiragem9x4(100), {});
    const contagem = contarElementos(dossiê);

    for (const element of ['fogo', 'terra', 'ar', 'água', 'éter']) {
      expect(contagem[element]).toBeGreaterThan(0);
    }
  });
});

describe('Mesa Real - MESA_REAL_SPREADS', () => {
  it('should have 2 spread types', () => {
    expect(Object.keys(MESA_REAL_SPREADS).length).toBe(2);
  });

  it('should include 9x4 spread', () => {
    expect(MESA_REAL_SPREADS['9x4']).toBeDefined();
    expect(MESA_REAL_SPREADS['9x4'].posicoes).toBe(36);
  });

  it('should include 8x4+4 spread', () => {
    expect(MESA_REAL_SPREADS['8x4+4']).toBeDefined();
    expect(MESA_REAL_SPREADS['8x4+4'].posicoes).toBe(36);
  });
});

describe('Mesa Real - realizarLeitura (legacy)', () => {
  it('should return array of CardPosition', () => {
    const result = realizarLeitura('9x4', 100);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(36);
  });

  it('should have correct structure for each position', () => {
    const result = realizarLeitura('9x4', 100);
    for (const card of result) {
      expect(card).toHaveProperty('position');
      expect(card).toHaveProperty('house');
      expect(card).toHaveProperty('card');
    }
  });
});

describe('Mesa Real - CORRELACOES_ESPECIAIS', () => {
  it('should have correlação for house 1', () => {
    expect(CORRELACOES_ESPECIAIS[1]).toBeDefined();
    expect(CORRELACOES_ESPECIAIS[1].numerologia).toContain('Número de Alma (Motivação)');
  });

  it('should have correlação for house 4', () => {
    expect(CORRELACOES_ESPECIAIS[4]).toBeDefined();
    expect(CORRELACOES_ESPECIAIS[4].numerologia.some(n => n.includes('Destino'))).toBe(true);
  });

  it('should have correlação for house 12', () => {
    expect(CORRELACOES_ESPECIAIS[12]).toBeDefined();
    expect(CORRELACOES_ESPECIAIS[12].numerologia).toContain('Dom Divino (Tântrica)');
  });

  it('should have correlação for house 34', () => {
    expect(CORRELACOES_ESPECIAIS[34]).toBeDefined();
    expect(CORRELACOES_ESPECIAIS[34].numerologia.some(n => n.includes('Karma'))).toBe(true);
  });
});

describe('Mesa Real - Edge Cases', () => {
  it('should handle empty tiragem', () => {
    const dossiê = construirArquiteturaDossiê({}, {});
    expect(dossiê.length).toBe(0);
  });

  it('should handle empty client data', () => {
    const tiragem: Record<number, { carta: number; odu: number }> = {
      1: { carta: 1, odu: 1 },
    };
    const dossiê = construirArquiteturaDossiê(tiragem, {});
    expect(dossiê.length).toBe(1);
    expect(dossiê[0].dadosConsulente).toEqual({});
  });

  it('should generate full reading without errors', () => {
    const posicoes = gerarTiragem9x4(42);
    const resultado = gerarLeituraCompleta(posicoes, {}, '9x4');
    expect(resultado.dossiê.length).toBe(36);
    expect(resultado.posicoes.length).toBe(36);
  });

  it('should handle decimal inputs gracefully', () => {
    expect(getCasaData(1.5)).toBeDefined();
    expect(getCartaData(1.5)).toBeDefined();
    expect(getOduData(1.5)).toBeDefined();
  });
});
