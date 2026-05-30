/**
 * Mapa Insights Module Integration Tests
 * Tests AI-powered MapaAlma insights: parser, prompt-builder, types.
 *
 * @file tests/lib/engines/mapa-insights.test.ts
 */

import { describe, it, expect, vi } from 'vitest';

// Mock Redis before imports
vi.mock('@/lib/redis', () => ({
  getRedisClient: vi.fn(() => null),
}));

import {
  parseInsightResponse,
  extractJson,
  criarInsightFallback,
} from '@/lib/ai/mapa-insights/parser';

import {
  gerarSystemPrompt,
  gerarContextoUsuario,
  gerarPromptInsight,
} from '@/lib/ai/mapa-insights/prompt-builder';

import type { MapaAlmaCompleto, Convergence } from '@/lib/engines/types/mapa-alma';

// ============================================================
// HELPERS
// ============================================================

/** Build a minimal valid MapaAlmaCompleto for testing */
function buildMapaCompleto(): MapaAlmaCompleto {
  return {
    perfil: {
      nomeCompleto: 'Maria da Silva Santos',
      dataNascimento: '1985-10-07',
      hora: '14:30',
      cidade: 'Salvador',
      estado: 'BA',
      pais: 'Brasil',
    },
    numerologia: {
      vida: 31,
      expressao: 22,
      motivacao: 12,
      impressao: 7,
      destino: 3,
      cicloAtual: 4,
      anoPessoal: 5,
      metodoUsado: 'pitagorica',
    },
    odu: {
      regente: {
        nome: 'Ogundá',
        numero: 8,
        significado: 'Incerteza, necessidade de escolha entre dois caminhos',
        orixaRegente: 'Iemanjá',
        elementos: ['Agua', 'Terra'],
      },
      secundario: {
        nome: 'Iwori',
        numero: 7,
        significado: 'A mulher da agua',
        orixaRegente: 'Iemanjá',
        elementos: ['Agua'],
      },
      orixas: ['Iemanjá', 'Oxum'],
      quizilas: ['nao comer ionga'],
      preceitos: ['maintain inner purity'],
      ebos: ['water ebo at full moon'],
      elemento: 'Agua',
      arcanoTarot: 8,
      caminhoSephirah: 'Hod',
    },
    astrologia: {
      ascendente: 'escorpio',
      sol: { signo: 'libra', grauNoSigno: 15, planeta: 'sol', longitude: 195, latitude: 0, distancia: 1.0, velocidade: 1.0, casa: 1 },
      lua: { signo: 'cancer', grauNoSigno: 22, planeta: 'lua', longitude: 112, latitude: 0, distancia: 0.0, velocidade: 14.0, casa: 4 },
      mercurio: { signo: 'libra', grauNoSigno: 10, planeta: 'mercurio', longitude: 190, latitude: 0, distancia: 1.2, velocidade: 2.0, casa: 1 },
      venus: { signo: 'escorpio', grauNoSigno: 5, planeta: 'venus', longitude: 225, latitude: 0, distancia: 0.7, velocidade: 1.2, casa: 7 },
      marte: { signo: 'capricornio', grauNoSigno: 3, planeta: 'marte', longitude: 273, latitude: 0, distancia: 2.0, velocidade: 1.5, casa: 1 },
      jupiter: { signo: 'touro', grauNoSigno: 18, planeta: 'jupiter', longitude: 48, latitude: 0, distancia: 5.5, velocidade: 0.2, casa: 2 },
      saturno: { signo: 'virgem', grauNoSigno: 12, planeta: 'saturno', longitude: 168, latitude: 0, distancia: 10.0, velocidade: 0.1, casa: 9 },
      urano: { signo: 'escorpio', grauNoSigno: 27, planeta: 'urano', longitude: 227, latitude: 0, distancia: 19.0, velocidade: 0.05, casa: 10 },
      netuno: { signo: 'sagitario', grauNoSigno: 8, planeta: 'netuno', longitude: 278, latitude: 0, distancia: 30.0, velocidade: 0.03, casa: 11 },
      plutao: { signo: 'libra', grauNoSigno: 4, planeta: 'plutao', longitude: 184, latitude: 0, distancia: 34.0, velocidade: 0.02, casa: 8 },
      aspectos: [],
    },
    tarot: {
      cartaNascimento: 1,
      cartaAnoPessoal: 1,
      cartaAlma: 1,
      interpretacao: { name: 'The Magician', arcano: 1, upright: 'Will and power', reversed: 'Unused' },
    },
    },
    chakras: {
      chakras: [
        { numero: 1, nome: 'Muladhara', estado: 'equilibrado', intensidade: 7 },
        { numero: 2, nome: 'Svadhisthana', estado: 'hiperativo', intensidade: 9 },
        { numero: 3, nome: 'Manipura', estado: 'desbalanceado', intensidade: 4 },
        { numero: 4, nome: 'Anahata', estado: 'equilibrado', intensidade: 6 },
        { numero: 5, nome: 'Vishuddha', estado: 'bloqueado', intensidade: 2 },
        { numero: 6, nome: 'Ajna', estado: 'equilibrado', intensidade: 8 },
        { numero: 7, nome: 'Sahasrara', estado: 'equilibrado', intensidade: 9, cor: 'violet' },
      ],
      dominante: 'Sahasrara',
      bloqueado: 'Vishuddha',
      equilibrio: 64,
    },
    convergencias: [
      {
        sistemas: ['Candomble', 'Numerologia', 'Astrologia'],
        energia: 'agua',
        forca: 'triplice' as const,
        descricao: 'Triplice convergencia aquatica',
      },
      {
        sistemas: ['Cabala', 'Tarot'],
        energia: 'ar',
        forca: 'dupla' as const,
        descricao: 'Convergencia de ar',
      },
      {
        sistemas: ['Ifa'],
        energia: 'terra',
        forca: 'simples' as const,
        descricao: 'Desafio karmico de Ifa',
      },
    ],
    orixasDominantes: ['Iemanjá', 'Oxum'],
    orixas: ['Iemanjá', 'Oxum'],
    dataCalculo: '2024-01-01T00:00:00Z',
    versao: '1.0.0',
  };
}

// ============================================================
// PARSER TESTS
// ============================================================

describe('Mapa Insights Parser', () => {
  describe('parseInsightResponse', () => {
    it('parses a valid JSON response with all required fields', () => {
      const raw = JSON.stringify({
        resumo: 'Resumo poetico do mapa.',
        proposito: 'Alinhar-se com a energia de Iemanja.',
        dons: [
          {
            titulo: 'Intuicao Aquatica',
            descricao: 'Capacidade de sentir as correntes emocionais profundas.',
            sistema: 'Candomble',
            forca: 'triplice',
          },
        ],
        desafios: [
          {
            titulo: 'Indecisao Cardinal',
            descricao: 'Dificuldade em tomar decisoes.',
            sistema: 'Ifa',
            forca: 'simples',
          },
        ],
        preceitos: [],
        praticas: [],
        orixas: [],
        ciclos: [],
        mensagemSemanal: 'Hoje e um bom dia para soltar.',
      });

      const result = parseInsightResponse(raw);

      expect(result.resumo).toBe('Resumo poetico do mapa.');
      expect(result.proposito).toBe('Alinhar-se com a energia de Iemanja.');
      expect(result.dons).toHaveLength(1);
      expect(result.dons[0].forca).toBe('triplice');
      expect(result.desafios).toHaveLength(1);
      expect(result.desafios[0].forca).toBe('simples');
      expect(result.id).toBeTruthy();
      expect(result.dataGeracao).toBeTruthy();
    });

    it('parses JSON wrapped in markdown code block', () => {
      const raw = '```json\n{"resumo":"Test","proposito":"Purpose","dons":[],"desafios":[],"preceitos":[],"praticas":[],"orixas":[],"ciclos":[],"mensagemSemanal":"Test"}\n```';
      const result = parseInsightResponse(raw);
      expect(result.resumo).toBe('Test');
    });
  });

  describe('extractJson', () => {
    it('extracts JSON from markdown code block', () => {
      const input = '```json\n{"test": "value"}\n```';
      expect(extractJson(input)).toBe('{"test": "value"}');
    });

    it('returns raw string if no code block found', () => {
      const input = '{"test": "value"}';
      expect(extractJson(input)).toBe(input);
    });
  });

  describe('criarInsightFallback', () => {
    it('creates InsightData with MapaAlma profile name in resumo', () => {
      const mapa = buildMapaCompleto();
      const result = criarInsightFallback(mapa);

      expect(result.resumo).toContain('Maria da Silva Santos');
      expect(result.resumo).toMatch(/Ogund[áa]/);
      expect(result.resumo).toContain('31');
    });

    it('includes Odu regente name and number in resumo', () => {
      const mapa = buildMapaCompleto();
      const result = criarInsightFallback(mapa);

      expect(result.resumo).toMatch(/Ogund[áa]/);
      expect(result.resumo).toMatch(/8/);
    });

    it('sets proposito referencing the Odu', () => {
      const mapa = buildMapaCompleto();
      const result = criarInsightFallback(mapa);

      expect(result.proposito).toMatch(/Ogund[áa]/);
    });

    it('maps Odu quizilas to preceitos detail', () => {
      const mapa = buildMapaCompleto();
      const result = criarInsightFallback(mapa);

      expect(result.preceitos).toHaveLength(1);
      expect(result.preceitos[0].quizilas).toEqual(mapa.odu.quizilas);
      expect(result.preceitos[0].preceitos).toEqual(mapa.odu.preceitos);
      expect(result.preceitos[0].ebos).toEqual(mapa.odu.ebos);
    });

    it('maps orixas to orixas field', () => {
      const mapa = buildMapaCompleto();
      const result = criarInsightFallback(mapa);

      expect(result.orixas).toHaveLength(2);
      expect(result.orixas[0].nome).toBe('Iemanjá');
      expect(result.orixas[1].nome).toBe('Oxum');
    });

    it('sets valid id and dataGeracao', () => {
      const mapa = buildMapaCompleto();
      const result = criarInsightFallback(mapa);

      expect(result.id).toBeTruthy();
      expect(result.dataGeracao).toBeTruthy();
      expect(new Date(result.dataGeracao)).toBeInstanceOf(Date);
    });
  });
});

// ============================================================
// PROMPT BUILDER TESTS
// ============================================================

describe('Mapa Insights Prompt Builder', () => {
  describe('gerarSystemPrompt', () => {
    it('includes spiritual guidance role', () => {
      const prompt = gerarSystemPrompt();
      expect(prompt).toContain('Cabala dos Caminhos');
    });

    it('includes language requirement for Portuguese', () => {
      const prompt = gerarSystemPrompt();
      expect(prompt).toMatch(/portugues|brasileiro/i);
    });

    it('includes quizilas and preceitos guidance', () => {
      const prompt = gerarSystemPrompt();
      expect(prompt).toMatch(/quizilas|preceitos/i);
    });

    it('instructs poetic and accessible language', () => {
      const prompt = gerarSystemPrompt();
      // Matches "POETICOS", "POÉTICOS", "poeticos", etc.
      expect(prompt).toMatch(/po[eé]ticos/i);
    });
  });

  describe('gerarContextoUsuario', () => {
    it('includes user profile information', () => {
      const mapa = buildMapaCompleto();
      const ctx = gerarContextoUsuario(mapa);

      expect(ctx).toContain('Maria da Silva Santos');
      expect(ctx).toContain('1985-10-07');
      expect(ctx).toContain('14:30');
    });

    it('includes numerology section', () => {
      const mapa = buildMapaCompleto();
      const ctx = gerarContextoUsuario(mapa);

      expect(ctx).toContain('31'); // vida
      expect(ctx).toContain('NUMEROLOGIA');
    });

    it('includes Odu section', () => {
      const mapa = buildMapaCompleto();
      const ctx = gerarContextoUsuario(mapa);

      expect(ctx).toContain('ODÚ');
      expect(ctx).toMatch(/Ogund[áa]/);
    });

    it('includes astrologia section', () => {
      const mapa = buildMapaCompleto();
      const ctx = gerarContextoUsuario(mapa);

      expect(ctx).toContain('ASTROLOGIA');
      expect(ctx).toContain('escorpio');
    });

    it('includes tarot section', () => {
      const mapa = buildMapaCompleto();
      const ctx = gerarContextoUsuario(mapa);

      expect(ctx).toContain('TAROT');
      expect(ctx).toContain('8'); // cartaNascimento
    });

    it('includes chakras section', () => {
      const mapa = buildMapaCompleto();
      const ctx = gerarContextoUsuario(mapa);

      expect(ctx).toContain('CHAKRAS');
      expect(ctx).toContain('Sahasrara');
    });

    it('includes orixas dominantes', () => {
      const mapa = buildMapaCompleto();
      const ctx = gerarContextoUsuario(mapa);

      expect(ctx).toContain('Iemanjá');
      expect(ctx).toContain('Oxum');
    });

    it('includes convergencias section', () => {
      const mapa = buildMapaCompleto();
      const ctx = gerarContextoUsuario(mapa);

      expect(ctx).toContain('CONVERG');
      expect(ctx).toMatch(/triplice/i);
    });
  });

  describe('gerarPromptInsight', () => {
    it('returns a string with all sections', () => {
      const mapa = buildMapaCompleto();
      const prompt = gerarPromptInsight(mapa);

      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(100);
    });

    it('includes PERFIL DO USUARIO section', () => {
      const mapa = buildMapaCompleto();
      const prompt = gerarPromptInsight(mapa);

      expect(prompt).toContain('PERFIL DO USUÁRIO');
    });

    it('includes NUMEROLOGIA section', () => {
      const mapa = buildMapaCompleto();
      const prompt = gerarPromptInsight(mapa);

      expect(prompt).toContain('NUMEROLOGIA');
    });

    it('includes brasileiro language requirement', () => {
      const mapa = buildMapaCompleto();
      const prompt = gerarPromptInsight(mapa);

      expect(prompt).toMatch(/portugues|brasileiro/i);
    });

    it('includes mission instructions', () => {
      const mapa = buildMapaCompleto();
      const prompt = gerarPromptInsight(mapa);

      expect(prompt).toMatch(/miss[ãa]o/i);
    });

    it('includes POETICOS requirement', () => {
      const mapa = buildMapaCompleto();
      const prompt = gerarPromptInsight(mapa);

      expect(prompt).toMatch(/po[eé]ticos/i);
    });

    it('includes quizilas reference', () => {
      const mapa = buildMapaCompleto();
      const prompt = gerarPromptInsight(mapa);

      expect(prompt).toMatch(/quizilas/i);
    });
  });
});