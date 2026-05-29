/**
 * PDF Generation Unit Tests
 *
 * Tests for the Mapa da Alma PDF report generator.
 */

import { describe, it, expect } from 'vitest';
import { gerarRelatorioPDF, MapaData } from '@/lib/pdf/gerarRelatorio';

// ============================================================
// Test Fixtures
// ============================================================

const createSampleMapaData = (overrides: Partial<MapaData> = {}): MapaData => ({
  id: 'test-mapa-001',
  created_at: '2026-05-29T14:30:00.000Z',
  numerologia: {
    numero_vida: 7,
    numero_destino: 3,
    numero_alma: 5,
    numero_personalidade: 9
  },
  odu: {
    nome: 'Ogundá',
    numero: 8,
    orixas: ['Oxum', 'Oxóssi'],
    quizilas: ['Não comer camarão', 'Não comer peixe de escamas pretas'],
    preceitos: 'Respeitar as águas e os caminhos da floresta'
  },
  astrologia: {
    signo: 'Escorpião',
    ascendente: 'Câncer',
    planetas: {
      Sol: 'Escorpião',
      Lua: 'Câncer',
      Mercúrio: 'Sagitário',
      Vênus: 'Capricórnio',
      Marte: 'Leão'
    }
  },
  tarot: {
    carta_nascimento: 0, // O Mago
    carta_ano_pessoal: 19 // A Lua
  },
  orixas: ['Oxum', 'Oxóssi', 'Iemanjá'],
  sefirot: ['Chokhmah', 'Binah', 'Daat', 'Chesed', 'Gevurah'],
  ...overrides
});

const mapaDataWithConvergencias: MapaData = createSampleMapaData({
  convergencias: [
    {
      energia: 'Intuição Espiritual',
      forca: 'tripla',
      descricao: 'Conexão profunda com os planos espirituais através da agua e da terra'
    },
    {
      energia: 'Força Interior',
      forca: 'dupla',
      descricao: 'Resistência e perseverança nos momentos de desafio'
    },
    {
      energia: 'Criatividade',
      forca: 'simples',
      descricao: 'Expressão artistica e inovação nos projetos'
    }
  ]
});

const mapaDataWithoutConvergencias = createSampleMapaData({
  convergencias: []
});

const mapaDataWithMinData = {
  id: 'minimal-001',
  created_at: '2026-01-01T00:00:00.000Z',
  numerologia: {
    numero_vida: 1,
    numero_destino: 1,
    numero_alma: 1,
    numero_personalidade: 1
  },
  odu: {
    nome: 'Eji-Okun',
    numero: 1,
    orixas: [],
    quizilas: [],
    preceitos: ''
  },
  astrologia: {
    signo: 'Áries',
    ascendente: 'Áries',
    planetas: {}
  },
  tarot: {
    carta_nascimento: 0,
    carta_ano_pessoal: 0
  },
  orixas: [],
  sefirot: []
};

// ============================================================
// Tests
// ============================================================

describe('gerarRelatorioPDF', () => {
  describe('basic functionality', () => {
    it('should return a Blob instance', () => {
      const result = gerarRelatorioPDF(createSampleMapaData());
      expect(result).toBeInstanceOf(Blob);
    });

    it('should return a Blob with correct MIME type application/pdf', () => {
      const result = gerarRelatorioPDF(createSampleMapaData());
      expect(result.type).toBe('application/pdf');
    });

    it('should return non-empty PDF content', () => {
      const result = gerarRelatorioPDF(createSampleMapaData());
      expect(result.size).toBeGreaterThan(0);
    });

    it('should generate a PDF with reasonable file size', () => {
      const result = gerarRelatorioPDF(createSampleMapaData());
      // A simple PDF should be at least 500 bytes
      expect(result.size).toBeGreaterThan(500);
      // And not absurdly large (e.g., 10MB would indicate a problem)
      expect(result.size).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('with different data scenarios', () => {
    it('should handle full data with all sections populated', () => {
      const mapaData = createSampleMapaData({
        numerologia: {
          numero_vida: 7,
          numero_destino: 3,
          numero_alma: 5,
          numero_personalidade: 9
        },
        odu: {
          nome: 'Ogundá',
          numero: 8,
          orixas: ['Oxum', 'Oxóssi', 'Iemanjá'],
          quizilas: ['Proibição 1', 'Proibição 2'],
          preceitos: 'Preceito principal de Ogundá'
        },
        astrologia: {
          signo: 'Escorpião',
          ascendente: 'Câncer',
          planetas: {
            Sol: 'Escorpião',
            Lua: 'Câncer',
            Mercúrio: 'Sagitário',
            Vênus: 'Capricórnio',
            Marte: 'Leão',
            Júpiter: 'Touro',
            Saturno: 'Aquário'
          }
        },
        tarot: {
          carta_nascimento: 21, // O Mundo
          carta_ano_pessoal: 0 // O Mago
        },
        orixas: ['Oxum', 'Oxóssi', 'Iemanjá', 'Ogum', 'Xangô'],
        sefirot: ['Chokhmah', 'Binah', 'Daat', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth']
      });

      const result = gerarRelatorioPDF(mapaData);
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
      expect(result.size).toBeGreaterThan(1000); // More data = larger PDF
    });

    it('should handle data with convergences', () => {
      const result = gerarRelatorioPDF(mapaDataWithConvergencias);
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
      expect(result.size).toBeGreaterThan(500);
    });

    it('should handle data without convergences', () => {
      const result = gerarRelatorioPDF(mapaDataWithoutConvergencias);
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    it('should handle minimal data with empty arrays', () => {
      const result = gerarRelatorioPDF(mapaDataWithMinData);
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should handle undefined convergencias (no convergences key)', () => {
      const mapaData = createSampleMapaData();
      // Remove convergencias completely
      const { convergencias, ...mapaDataWithoutConvergenciasKey } = mapaData as typeof mapaData & { convergencias?: unknown };
      const dataWithoutKey = mapaDataWithoutConvergenciasKey;
      // Cast to MapaData to satisfy TypeScript
      const result = gerarRelatorioPDF(dataWithoutKey as MapaData);
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });
  });

  describe('PDF content verification', () => {
    it('should generate a blob that can be converted to array buffer', async () => {
      const result = gerarRelatorioPDF(createSampleMapaData());
      const arrayBuffer = await result.arrayBuffer();
      expect(arrayBuffer.byteLength).toBe(result.size);
    });

    it('should generate a blob that starts with PDF header', async () => {
      const result = gerarRelatorioPDF(createSampleMapaData());
      const buffer = await result.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // PDF files start with %PDF-
      const header = String.fromCharCode(...bytes.slice(0, 5));
      expect(header).toBe('%PDF-');
    });
  });

  describe('different Odu scenarios', () => {
    it('should handle Odu with preceitos', () => {
      const data = createSampleMapaData({
        odu: {
          nome: 'Oxá',
          numero: 13,
          orixas: ['Oxum', 'Iansã'],
          quizilas: ['Evitar metal'],
          preceitos: 'Manter a harmonia familiar e respeitar os mais velhos'
        }
      });
      const result = gerarRelatorioPDF(data);
      expect(result.size).toBeGreaterThan(500);
    });

    it('should handle Odu without preceitos', () => {
      const data = createSampleMapaData({
        odu: {
          nome: 'Ejionile',
          numero: 2,
          orixas: [],
          quizilas: [],
          preceitos: ''
        }
      });
      const result = gerarRelatorioPDF(data);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('different Tarot scenarios', () => {
    it('should handle birth card as first arcano (0)', () => {
      const data = createSampleMapaData({
        tarot: {
          carta_nascimento: 0,
          carta_ano_pessoal: 21
        }
      });
      const result = gerarRelatorioPDF(data);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle birth card as last arcano (21)', () => {
      const data = createSampleMapaData({
        tarot: {
          carta_nascimento: 21,
          carta_ano_pessoal: 0
        }
      });
      const result = gerarRelatorioPDF(data);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle birth card as middle arcano (10)', () => {
      const data = createSampleMapaData({
        tarot: {
          carta_nascimento: 10,
          carta_ano_pessoal: 15
        }
      });
      const result = gerarRelatorioPDF(data);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('different convergence strengths', () => {
    it('should handle tripla forca convergences', () => {
      const data = createSampleMapaData({
        convergencias: [
          {
            energia: 'Força Espiritual',
            forca: 'tripla',
            descricao: 'Potência maxima de energia espiritual'
          }
        ]
      });
      const result = gerarRelatorioPDF(data);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle dupla forca convergences', () => {
      const data = createSampleMapaData({
        convergencias: [
          {
            energia: 'Equilibrio',
            forca: 'dupla',
            descricao: 'Balance entre dois planos'
          }
        ]
      });
      const result = gerarRelatorioPDF(data);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle simples forca convergences', () => {
      const data = createSampleMapaData({
        convergencias: [
          {
            energia: 'Iniciacao',
            forca: 'simples',
            descricao: 'Primeiro passo de uma jornada'
          }
        ]
      });
      const result = gerarRelatorioPDF(data);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('edge cases', () => {
    it('should handle long text in preceitos without crashing', () => {
      const data = createSampleMapaData({
        odu: {
          nome: 'Ogundá',
          numero: 8,
          orixas: ['Oxum'],
          quizilas: ['Quizila 1', 'Quizila 2'],
          preceitos: 'Este é um texto muito longo que testa como o sistema lida com grandes quantidades de texto na seção de preceitos. O texto deve ser quebrado adequadamente em linhas sem causar overflow ou erros de renderização no PDF gerado.'
        }
      });
      const result = gerarRelatorioPDF(data);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle many planets in astrology', () => {
      const data = createSampleMapaData({
        astrologia: {
          signo: 'Escorpião',
          ascendente: 'Câncer',
          planetas: {
            Sol: 'Escorpião',
            Lua: 'Câncer',
            Mercúrio: 'Sagitário',
            Vênus: 'Capricórnio',
            Marte: 'Leão',
            Júpiter: 'Touro',
            Saturno: 'Aquário',
            Urano: 'Peixes',
            Netuno: 'Aquário',
            Plutão: 'Sagitário'
          }
        }
      });
      const result = gerarRelatorioPDF(data);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle many orixas', () => {
      const data = createSampleMapaData({
        orixas: ['Ogum', 'Oxum', 'Iemanjá', 'Oxóssi', 'Xangô', 'Nanã', 'Iansã', 'Omulu', 'Eshu', 'Oxumaré']
      });
      const result = gerarRelatorioPDF(data);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle many sefirot', () => {
      const data = createSampleMapaData({
        sefirot: ['Keter', 'Chokhmah', 'Binah', 'Daat', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth']
      });
      const result = gerarRelatorioPDF(data);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('timestamp handling', () => {
    it('should handle ISO date format', () => {
      const data = createSampleMapaData({
        created_at: '2026-05-29T14:30:00.000Z'
      });
      const result = gerarRelatorioPDF(data);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle older dates', () => {
      const data = createSampleMapaData({
        created_at: '2024-01-15T10:00:00.000Z'
      });
      const result = gerarRelatorioPDF(data);
      expect(result).toBeInstanceOf(Blob);
    });
  });
});