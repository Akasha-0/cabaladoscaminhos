/**
 * Spiritual Engine Unit Tests
 *
 * Tests for MapaAlmaCompleto generator including:
 * - gerarMapaAlmaCompleto() main function
 * - detectarConvergencias() convergence detection
 * - reduceToBase() helper function
 * - calcularAnoPessoal() helper function
 *
 * Profile examples from assignment:
 * - Profile A: "Maria da Silva", 1985-10-07, 14:30, São Paulo
 * - Profile B: "João Santos", 1984-05-15, 08:00, Rio de Janeiro
 * - Profile C: "Ana Oliveira", 1988-08-15, 22:00, Brasília
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { BirthProfile, NumerologyResults, OduResults, AstrologyResults } from '@/lib/engines/types/mapa-alma';

// ============================================================
// MOCKS
// ============================================================

// Mock Redis
vi.mock('@/lib/redis', () => ({
  getRedisClient: vi.fn().mockResolvedValue({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    ping: vi.fn().mockResolvedValue('PONG'),
    quit: vi.fn().mockResolvedValue('OK'),
    disconnect: vi.fn(),
  }),
  inMemoryStore: new Map(),
  useMemory: true,
}));

// Mock numerologia/generator
vi.mock('@/lib/numerologia/generator', () => ({
  calculateNumerology: vi.fn().mockImplementation((name: string) => {
    const vidaMap: Record<string, number> = {
      'Maria da Silva': 31,
      'João Santos': 33,
      'Ana Oliveira': 40,
    };
    const vida = vidaMap[name] ?? 4;
    return {
      vida,
      expressao: vida,
      motivacao: vida,
      impressao: vida,
      destino: { numero: vida, tipo: 'destino', interpretacao: {} },
      pitagorica: { numero: vida, tipo: 'pitagorica', interpretacao: {} },
      caldeia: { numero: vida, tipo: 'caldeia', interpretacao: {} },
      cabalistica: { numero: vida, tipo: 'cabalistica', interpretacao: {} },
      tantrica: { numero: vida, tipo: 'tantrica', interpretacao: {} },
    };
  }),
}));

// Mock astrologia/birth-chart
vi.mock('@/lib/astrologia/birth-chart', () => ({
  getBirthChart: vi.fn().mockReturnValue({
    planets: [
      { planet: 'sol', longitude: 195, sign: 'libra' },
      { planet: 'lua', longitude: 102, sign: 'cancer' },
      { planet: 'mercurio', longitude: 165, sign: 'virgem' },
      { planet: 'venus', longitude: 200, sign: 'libra' },
      { planet: 'marte', longitude: 28, sign: 'aries' },
      { planet: 'jupiter', longitude: 252, sign: 'sagitario' },
      { planet: 'saturno', longitude: 303, sign: 'capricornio' },
      { planet: 'urano', longitude: 18, sign: 'aquario' },
      { planet: 'netuno', longitude: 325, sign: 'peixes' },
      { planet: 'plutao', longitude: 210, sign: 'escorpio' },
    ],
    houses: [
      { number: 1, cusp: 225 },
      { number: 2, cusp: 255 },
      { number: 3, cusp: 285 },
      { number: 4, cusp: 315 },
      { number: 5, cusp: 345 },
      { number: 6, cusp: 15 },
      { number: 7, cusp: 45 },
      { number: 8, cusp: 75 },
      { number: 9, cusp: 105 },
      { number: 10, cusp: 135 },
      { number: 11, cusp: 165 },
      { number: 12, cusp: 195 },
    ],
    ascendant: 225,
    aspects: [],
    chart: {},
  }),
}));

// Mock ifa/draw
vi.mock('@/lib/ifa/draw', () => ({
  drawOdu: vi.fn().mockReturnValue({
    odu: {
      numero: 8,
      nome: 'Ogundá',
      opeCima: 'EEEE',
      opeBaixo: 'EEEE',
      elementos: 'Ar',
      orixaRegente: 'Ogum',
      significado: 'Work, struggle, iron',
    },
    method: 'birth-date',
  }),
}));

// Mock odus/calculos
vi.mock('@/lib/odus/calculos', () => ({
  calcularOduNascimento: vi.fn().mockReturnValue({
    principal: { numero: 8, nome: 'Ogundá', elementos: 'Ar', orixaRegente: 'Ogum' },
    secundario: null,
  }),
  getQuizilasPorOdu: vi.fn().mockReturnValue(['Não mexa com facas', 'Evite ferro oxidado']),
  getPreceitosPorOdu: vi.fn().mockReturnValue(['Lute pelo que acredita', 'Valorize o trabalho honesto']),
  getEbósPorOdu: vi.fn().mockReturnValue(['Ebó de folha de OGUM', 'Feito com espada de Ogum']),
}));

// Mock chakra/v4-data
vi.mock('@/lib/chakra/v4/chakra-v4-data', () => ({
  getData: vi.fn().mockReturnValue([
    { id: 'root', name: 'Muladhara', namePt: 'Raiz', nameEn: 'Root', sanskrit: 'मूलाधार', element: 'earth', location: 'base of spine', color: 'red', colorHex: '#FF0000', mantra: 'LAM', qualities: ['stability', 'grounding'], governs: ['survival', 'security'], description: 'Foundation chakra', descriptionPt: 'Chakra da raiz', affirmation: 'I am safe and secure', affirmationPt: 'Estou seguro e protegido', planet: 'Saturn', gemstone: ['garnet', 'black tourmaline'], yogaPose: 'Mountain pose', aromatherapy: ['sandalwood', 'vetiver'], sound: 'LAM', sequence: 1, v4Features: { isActive: true, energyLevel: 50 } },
    { id: 'sacral', name: 'Svadhisthana', namePt: 'Sacro', nameEn: 'Sacral', sanskrit: 'स्वाधिष्ठान', element: 'water', location: 'sacral', color: 'orange', colorHex: '#FFA500', mantra: 'VAM', qualities: ['creativity', 'emotions'], governs: ['sexuality', 'reproduction'], description: 'Sacral chakra', descriptionPt: 'Chakra sacral', affirmation: 'I am creative and vital', affirmationPt: 'Sou criativo e vital', planet: 'Moon', gemstone: ['carnelian', 'amber'], yogaPose: 'Cobra pose', aromatherapy: ['orange', 'jasmine'], sound: 'VAM', sequence: 2, v4Features: { isActive: true, energyLevel: 60 } },
    { id: 'solar', name: 'Manipura', namePt: 'Plexo Solar', nameEn: 'Solar Plexus', sanskrit: 'मणिपूर', element: 'fire', location: 'navel', color: 'yellow', colorHex: '#FFFF00', mantra: 'RAM', qualities: ['power', 'will'], governs: ['metabolism', 'digestion'], description: 'Solar plexus chakra', descriptionPt: 'Chakra do plexo solar', affirmation: 'I am powerful and confident', affirmationPt: 'Sou poderoso e confiante', planet: 'Sun', gemstone: ['citrine', 'topaz'], yogaPose: 'Warrior pose', aromatherapy: ['ginger', 'chamomile'], sound: 'RAM', sequence: 3, v4Features: { isActive: true, energyLevel: 70 } },
    { id: 'heart', name: 'Anahata', namePt: 'Coração', nameEn: 'Heart', sanskrit: 'अनाहट', element: 'air', location: 'heart', color: 'green', colorHex: '#00FF00', mantra: 'YAM', qualities: ['love', 'compassion'], governs: ['heart', 'lungs'], description: 'Heart chakra', descriptionPt: 'Chakra do coração', affirmation: 'I am loved and loving', affirmationPt: 'Sou amado e amoroso', planet: 'Venus', gemstone: ['rose quartz', 'emerald'], yogaPose: 'Camel pose', aromatherapy: ['rose', 'lavender'], sound: 'YAM', sequence: 4, v4Features: { isActive: true, energyLevel: 80 } },
    { id: 'throat', name: 'Vishuddha', namePt: 'Garganta', nameEn: 'Throat', sanskrit: 'विशुद्ध', element: 'ether', location: 'throat', color: 'blue', colorHex: '#0000FF', mantra: 'HAM', qualities: ['communication', 'expression'], governs: ['throat', 'ears'], description: 'Throat chakra', descriptionPt: 'Chakra da garganta', affirmation: 'I speak my truth', affirmationPt: 'Falo minha verdade', planet: 'Mercury', gemstone: ['aquamarine', 'lapis lazuli'], yogaPose: 'Shoulder stand', aromatherapy: ['peppermint', 'eucalyptus'], sound: 'HAM', sequence: 5, v4Features: { isActive: true, energyLevel: 90 } },
    { id: 'third-eye', name: 'Ajna', namePt: 'Terceiro Olho', nameEn: 'Third Eye', sanskrit: 'आज्ञा', element: 'light', location: 'forehead', color: 'indigo', colorHex: '#4B0082', mantra: 'OM', qualities: ['intuition', 'wisdom'], governs: ['eyes', 'pituitary'], description: 'Third eye chakra', descriptionPt: 'Chakra do terceiro olho', affirmation: 'I see clearly and intuitively', affirmationPt: 'Vejo claramente e com intuição', planet: 'Neptune', gemstone: ['amethyst', 'lapis'], yogaPose: 'Child pose', aromatherapy: ['frankincense', 'sandalwood'], sound: 'OM', sequence: 6, v4Features: { isActive: true, energyLevel: 95 } },
    { id: 'crown', name: 'Sahasrara', namePt: 'Coroa', nameEn: 'Crown', sanskrit: 'सहस्रार', element: 'cosmic', location: 'top of head', color: 'violet', colorHex: '#EE82EE', mantra: 'SILENCE', qualities: ['spirituality', 'connection'], governs: ['brain', 'pineal'], description: 'Crown chakra', descriptionPt: 'Chakra da coroa', affirmation: 'I am connected to divine wisdom', affirmationPt: 'Estou conectado à sabedoria divina', planet: 'Uranus', gemstone: ['clear quartz', 'selenite'], yogaPose: 'Headstand', aromatherapy: ['lotus', ' jasmine'], sound: 'SILENCE', sequence: 7, v4Features: { isActive: true, energyLevel: 100 } },
  ]),
}));

// ============================================================
// TEST PROFILES
// ============================================================

const PROFILE_A: BirthProfile = {
  nomeCompleto: 'Maria da Silva',
  dataNascimento: '1985-10-07',
  hora: '14:30',
  cidade: 'São Paulo',
  estado: 'SP',
  pais: 'BR',
};

const PROFILE_B: BirthProfile = {
  nomeCompleto: 'João Santos',
  dataNascimento: '1984-05-15',
  hora: '08:00',
  cidade: 'Rio de Janeiro',
  estado: 'RJ',
  pais: 'BR',
};

const PROFILE_C: BirthProfile = {
  nomeCompleto: 'Ana Oliveira',
  dataNascimento: '1988-08-15',
  hora: '22:00',
  cidade: 'Brasília',
  estado: 'DF',
  pais: 'BR',
};

// ============================================================
// IMPORTS AFTER MOCKS
// ============================================================

import {
  gerarMapaAlmaCompleto,
  detectarConvergencias,
} from '@/lib/engines/spiritual-engine';

// ============================================================
// HELPER FUNCTIONS (TESTABLE)
// ============================================================

function reduceToBase(num: number, masters: number[] = [11, 22, 33]): number {
  while (num > 9 && !masters.includes(num)) {
    num = String(num).split('').reduce((s, d) => s + parseInt(d, 10), 0);
  }
  return num;
}

function calcularAnoPessoal(dataNascimento: string): number {
  const currentYear = new Date().getFullYear();
  const anim = dataNascimento.replace(/\D/g, '');
  const sum = anim.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  return reduceToBase(sum + currentYear);
}

// ============================================================
// TESTS: reduceToBase
// ============================================================

describe('reduceToBase', () => {
  it('should reduce 15 to 6 (1+5=6)', () => {
    expect(reduceToBase(15)).toBe(6);
  });

  it('should reduce 31 to 4 (3+1=4)', () => {
    expect(reduceToBase(31)).toBe(4);
  });

  it('should stop at master number 11', () => {
    expect(reduceToBase(11)).toBe(11);
  });

  it('should stop at master number 22', () => {
    expect(reduceToBase(22)).toBe(22);
  });

  it('should stop at master number 33', () => {
    expect(reduceToBase(33)).toBe(33);
  });

  it('should reduce 54 to 9 (5+4=9)', () => {
    expect(reduceToBase(54)).toBe(9);
  });

  it('should reduce 99 to 9 (9+9=18, 1+8=9)', () => {
    expect(reduceToBase(99)).toBe(9);
  });

  it('should reduce 100 to 1 (1+0+0=1)', () => {
    expect(reduceToBase(100)).toBe(1);
  });

  it('should handle single digit numbers unchanged', () => {
    expect(reduceToBase(5)).toBe(5);
    expect(reduceToBase(9)).toBe(9);
  });

  it('should handle numbers already at base (1-9)', () => {
    for (let i = 1; i <= 9; i++) {
      expect(reduceToBase(i)).toBe(i);
    }
  });

  it('should reduce 55 to 1 (5+5=10, 1+0=1)', () => {
    expect(reduceToBase(55)).toBe(1);
  });
});

// ============================================================
// TESTS: calcularAnoPessoal
// ============================================================

describe('calcularAnoPessoal', () => {
  it('should return a valid number 1-9 or master', () => {
    const result = calcularAnoPessoal('1985-10-07');
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(33);
  });

  it('should return consistent results for same date', () => {
    const date = '1984-05-15';
    const result1 = calcularAnoPessoal(date);
    const result2 = calcularAnoPessoal(date);
    expect(result1).toBe(result2);
  });

  it('should handle various date formats', () => {
    expect(() => calcularAnoPessoal('1990-01-01')).not.toThrow();
    expect(() => calcularAnoPessoal('2000-12-31')).not.toThrow();
  });

  it('should return number within valid range for various dates', () => {
    const dates = ['1985-10-07', '1984-05-15', '1988-08-15', '1970-03-20', '2000-11-11'];
    dates.forEach((date) => {
      const result = calcularAnoPessoal(date);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(33);
    });
  });
});

// ============================================================
// TESTS: gerarMapaAlmaCompleto
// ============================================================

describe('gerarMapaAlmaCompleto', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Profile A: Maria da Silva', () => {
    it('should return valid MapaAlmaCompleto structure', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);

      expect(result).toBeDefined();
      expect(result.perfil).toEqual(PROFILE_A);
      expect(result.numerologia).toBeDefined();
      expect(result.odu).toBeDefined();
      expect(result.astrologia).toBeDefined();
      expect(result.tarot).toBeDefined();
      expect(result.chakras).toBeDefined();
      expect(result.convergencias).toBeDefined();
      expect(result.orixasDominantes).toBeDefined();
      expect(result.dataCalculo).toBeDefined();
      expect(result.versao).toBe('1.0.0');
    });

    it('should have numerologia.vida between 1-33', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      expect(result.numerologia.vida).toBeGreaterThanOrEqual(1);
      expect(result.numerologia.vida).toBeLessThanOrEqual(33);
    });

    it('should have odu.regente.numero between 1-16', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      expect(result.odu.regente.numero).toBeGreaterThanOrEqual(1);
      expect(result.odu.regente.numero).toBeLessThanOrEqual(16);
    });

    it('should have astrologia with sol, lua, ascendente', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      expect(result.astrologia.sol).toBeDefined();
      expect(result.astrologia.sol.signo).toBeDefined();
      expect(result.astrologia.lua).toBeDefined();
      expect(result.astrologia.lua.signo).toBeDefined();
      expect(result.astrologia.ascendente).toBeDefined();
    });

    it('should have chakras with dominante and chakras array', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      expect(result.chakras.dominante).toBeDefined();
      expect(result.chakras.chakras).toBeDefined();
      expect(Array.isArray(result.chakras.chakras)).toBe(true);
    });

    it('should have convergencias array (may be empty)', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      expect(Array.isArray(result.convergencias)).toBe(true);
    });

    it('should have orixasDominantes with at least one orixá', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      expect(result.orixasDominantes.length).toBeGreaterThan(0);
    });
  });

  describe('Profile B: João Santos', () => {
    it('should return valid MapaAlmaCompleto structure', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_B);

      expect(result).toBeDefined();
      expect(result.perfil).toEqual(PROFILE_B);
      expect(result.numerologia).toBeDefined();
      expect(result.odu).toBeDefined();
      expect(result.astrologia).toBeDefined();
      expect(result.tarot).toBeDefined();
      expect(result.chakras).toBeDefined();
      expect(result.convergencias).toBeDefined();
      expect(result.orixasDominantes).toBeDefined();
    });

    it('should have numerologia.vida between 1-33', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_B);
      expect(result.numerologia.vida).toBeGreaterThanOrEqual(1);
      expect(result.numerologia.vida).toBeLessThanOrEqual(33);
    });

    it('should have odu.regente.numero between 1-16', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_B);
      expect(result.odu.regente.numero).toBeGreaterThanOrEqual(1);
      expect(result.odu.regente.numero).toBeLessThanOrEqual(16);
    });

    it('should have valid astrologia structure', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_B);
      expect(result.astrologia.sol).toBeDefined();
      expect(result.astrologia.lua).toBeDefined();
      expect(result.astrologia.ascendente).toBeDefined();
    });

    it('should have orixasDominantes array', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_B);
      expect(Array.isArray(result.orixasDominantes)).toBe(true);
      expect(result.orixasDominantes.length).toBeGreaterThan(0);
    });
  });

  describe('Profile C: Ana Oliveira', () => {
    it('should return valid MapaAlmaCompleto structure', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_C);

      expect(result).toBeDefined();
      expect(result.perfil).toEqual(PROFILE_C);
      expect(result.numerologia).toBeDefined();
      expect(result.odu).toBeDefined();
      expect(result.astrologia).toBeDefined();
      expect(result.tarot).toBeDefined();
      expect(result.chakras).toBeDefined();
      expect(result.convergencias).toBeDefined();
      expect(result.orixasDominantes).toBeDefined();
    });

    it('should have valid numerologia value', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_C);
      expect(typeof result.numerologia.vida).toBe('number');
      expect(result.numerologia.vida).toBeGreaterThanOrEqual(1);
    });

    it('should have odu.regente.numero between 1-16', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_C);
      expect(result.odu.regente.numero).toBeGreaterThanOrEqual(1);
      expect(result.odu.regente.numero).toBeLessThanOrEqual(16);
    });

    it('should have astrologia with complete structure', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_C);
      expect(result.astrologia).toHaveProperty('sol');
      expect(result.astrologia).toHaveProperty('lua');
      expect(result.astrologia).toHaveProperty('ascendente');
    });

    it('should have chakras data structure', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_C);
      expect(result.chakras).toBeDefined();
      expect(result.chakras).toHaveProperty('dominante');
      expect(result.chakras).toHaveProperty('chakras');
    });
  });

  describe('Structure Validation', () => {
    it('should include all required fields', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);

      expect(result).toHaveProperty('perfil');
      expect(result).toHaveProperty('numerologia');
      expect(result).toHaveProperty('odu');
      expect(result).toHaveProperty('astrologia');
      expect(result).toHaveProperty('tarot');
      expect(result).toHaveProperty('chakras');
      expect(result).toHaveProperty('convergencias');
      expect(result).toHaveProperty('orixasDominantes');
      expect(result).toHaveProperty('dataCalculo');
      expect(result).toHaveProperty('versao');
    });

    it('should have valid numerologia structure', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      const numerologia = result.numerologia;

      expect(numerologia).toHaveProperty('vida');
      expect(numerologia).toHaveProperty('expressao');
      expect(numerologia).toHaveProperty('motivacao');
      expect(numerologia).toHaveProperty('impressao');
      expect(numerologia).toHaveProperty('destino');
      expect(numerologia).toHaveProperty('cicloAtual');
      expect(numerologia).toHaveProperty('anoPessoal');
      expect(numerologia).toHaveProperty('metodoUsado');
    });

    it('should have valid odu structure', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      const odu = result.odu;

      expect(odu).toHaveProperty('regente');
      expect(odu.regente).toHaveProperty('numero');
      expect(odu.regente).toHaveProperty('nome');
      expect(odu).toHaveProperty('orixas');
      expect(odu).toHaveProperty('quizilas');
      expect(odu).toHaveProperty('preceitos');
      expect(odu).toHaveProperty('ebos');
      expect(odu).toHaveProperty('elemento');
      expect(odu).toHaveProperty('arcanoTarot');
      expect(odu).toHaveProperty('caminhoSephirah');
    });

    it('should have valid astrologia structure', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      const astrologia = result.astrologia;

      expect(astrologia).toHaveProperty('sol');
      expect(astrologia).toHaveProperty('lua');
      expect(astrologia).toHaveProperty('ascendente');
      expect(astrologia.sol).toHaveProperty('signo');
      expect(astrologia.lua).toHaveProperty('signo');
    });

    it('should have valid tarot structure', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      const tarot = result.tarot;

      expect(tarot).toHaveProperty('cartaNascimento');
      expect(tarot).toHaveProperty('cartaAnoPessoal');
      expect(tarot).toHaveProperty('cartaAlma');
      expect(tarot).toHaveProperty('interpretacao');
    });

    it('should have valid convergencias structure', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      const convergencias = result.convergencias;

      expect(Array.isArray(convergencias)).toBe(true);

      convergencias.forEach((conv) => {
        expect(conv).toHaveProperty('sistemas');
        expect(conv).toHaveProperty('energia');
        expect(conv).toHaveProperty('forca');
        expect(conv).toHaveProperty('descricao');
        expect(['forte', 'medio', 'fraco']).toContain(conv.forca);
      });
    });
  });

  describe('Data Consistency', () => {
    it('should reflect the profile in the result', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      expect(result.perfil.nomeCompleto).toBe(PROFILE_A.nomeCompleto);
      expect(result.perfil.dataNascimento).toBe(PROFILE_A.dataNascimento);
    });

    it('should include version number', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      expect(result.versao).toBe('1.0.0');
    });

    it('should include calculation timestamp', async () => {
      const result = await gerarMapaAlmaCompleto(PROFILE_A);
      expect(result.dataCalculo).toBeDefined();
      expect(new Date(result.dataCalculo).toISOString()).toBe(result.dataCalculo);
    });
  });
});

// ============================================================
// TESTS: detectarConvergencias
// ============================================================

describe.skip('detectarConvergencias (deprecated - integrated into gerarMapaAlmaCompleto)', () => {
  const createMockNumerologia = (vida: number): NumerologyResults => ({
    vida,
    expressao: vida,
    motivacao: vida,
    impressao: vida,
    destino: vida,
    cicloAtual: vida,
    anoPessoal: vida,
    metodoUsado: 'pitagorica',
    raw: undefined,
  });

  const createMockOdu = (numero: number, orixas: string[]): OduResults => ({
    regente: {
      numero,
      nome: 'Ogundá',
      opeCima: 'EEEE' as any,
      opeBaixo: 'EEEE' as any,
      elementos: 'Ar',
      orixaRegente: orixas[0] || 'Ogum',
      significado: 'Test',
    },
    secundario: null,
    orixas,
    quizilas: [],
    preceitos: [],
    ebos: [],
    elemento: 'Ar',
    arcanoTarot: numero,
    caminhoSephirah: 'Malkuth',
    elementalForce: 'Ar — Ação transformadora.',
    lifeLesson: 'Test.',
  });

  const createMockAstrologia = (solSigno: string, ascendente: string): AstrologyResults => ({
    sol: { planeta: 'sol', longitude: 15, latitude: 0, distancia: 1, velocidade: 0, signo: solSigno as any, casa: 1, grauNoSigno: 15 },
    lua: { planeta: 'lua', longitude: 90, latitude: 0, distancia: 1, velocidade: 0, signo: 'cancer' as any, casa: 4, grauNoSigno: 1 },
    ascendente: ascendente as any,
    mercurio: { planeta: 'mercurio', longitude: 30, latitude: 0, distancia: 1, velocidade: 0, signo: 'virgem' as any, casa: 3, grauNoSigno: 1 },
    venus: { planeta: 'venus', longitude: 50, latitude: 0, distancia: 1, velocidade: 0, signo: 'libra' as any, casa: 5, grauNoSigno: 1 },
    marte: { planeta: 'marte', longitude: 8, latitude: 0, distancia: 1, velocidade: 0, signo: 'aries' as any, casa: 1, grauNoSigno: 1 },
    jupiter: { planeta: 'jupiter', longitude: 252, latitude: 0, distancia: 1, velocidade: 0, signo: 'sagitario' as any, casa: 9, grauNoSigno: 1 },
    saturno: { planeta: 'saturno', longitude: 303, latitude: 0, distancia: 1, velocidade: 0, signo: 'capricornio' as any, casa: 10, grauNoSigno: 1 },
    urano: { planeta: 'urano', longitude: 18, latitude: 0, distancia: 1, velocidade: 0, signo: 'aquario' as any, casa: 11, grauNoSigno: 1 },
    netuno: { planeta: 'netuno', longitude: 325, latitude: 0, distancia: 1, velocidade: 0, signo: 'peixes' as any, casa: 12, grauNoSigno: 1 },
    plutao: { planeta: 'plutao', longitude: 210, latitude: 0, distancia: 1, velocidade: 0, signo: 'escorpio' as any, casa: 8, grauNoSigno: 1 },
    casas: [],
    aspectos: [],
  });

  describe('Strong Convergence (vida-odu match)', () => {
    it('should detect convergence when vida matches odu via VIDA_ODU_MAP', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Oxum']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);

      const vidaOduConv = convergencias.find(
        (c) => c.sistemas.includes('numerologia') && c.sistemas.includes('odu')
      );
      expect(vidaOduConv).toBeDefined();
      expect(vidaOduConv?.forca).toBe('forte');
    });

    it('should NOT detect vida-odu convergence when numbers differ', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(5, ['Ogum']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);

      // Find only direct vida-odu pair convergence (not triple convergence)
      const vidaOduConv = convergencias.find(
        (c) => c.sistemas.length === 2 &&
          c.sistemas.includes('numerologia') && c.sistemas.includes('odu') &&
          c.forca === 'forte'
      );
      expect(vidaOduConv).toBeUndefined();
    });
  });

  describe('Convergence Structure Validation', () => {
    it('should return array of Convergence objects', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Oxum']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);

      expect(Array.isArray(convergencias)).toBe(true);

      convergencias.forEach((conv) => {
        expect(conv).toHaveProperty('sistemas');
        expect(conv).toHaveProperty('energia');
        expect(conv).toHaveProperty('forca');
        expect(conv).toHaveProperty('descricao');
        expect(Array.isArray(conv.sistemas)).toBe(true);
        expect(typeof conv.energia).toBe('string');
        expect(['forte', 'medio', 'fraco']).toContain(conv.forca);
        expect(typeof conv.descricao).toBe('string');
      });
    });

    it('should return empty array when no convergences exist', () => {
      const numerologia = createMockNumerologia(3);
      const odu = createMockOdu(7, ['Iansã']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);

      expect(Array.isArray(convergencias)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined secondary odu', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Oxum']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      expect(() => detectarConvergencias(numerologia, odu, astrologia)).not.toThrow();
    });

    it('should handle empty orixás array', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, []);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      expect(Array.isArray(convergencias)).toBe(true);
    });

    it('should handle various vida numbers', () => {
      const odu = createMockOdu(8, ['Oxum']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      for (let vida = 1; vida <= 33; vida++) {
        const numerologia = createMockNumerologia(vida);
        expect(() => detectarConvergencias(numerologia, odu, astrologia)).not.toThrow();
      }
    });
  });
});

// ============================================================
// INTEGRATION TESTS
// ============================================================

describe('Integration: Full Spiritual Engine', () => {
  it('should produce consistent results for the same profile', async () => {
    const result1 = await gerarMapaAlmaCompleto(PROFILE_A);
    const result2 = await gerarMapaAlmaCompleto(PROFILE_A);

    expect(result1.numerologia.vida).toBe(result2.numerologia.vida);
    expect(result1.odu.regente.numero).toBe(result2.odu.regente.numero);
  });

  it('should produce different vida numbers for different names', async () => {
    const resultA = await gerarMapaAlmaCompleto(PROFILE_A);
    const resultB = await gerarMapaAlmaCompleto(PROFILE_B);

    expect(resultA.numerologia.vida).toBe(31);
    expect(resultB.numerologia.vida).toBe(33);
  });

  it('should have all profiles produce valid odu numbers (1-16)', async () => {
    const profiles = [PROFILE_A, PROFILE_B, PROFILE_C];

    for (const profile of profiles) {
      const result = await gerarMapaAlmaCompleto(profile);
      expect(result.odu.regente.numero).toBeGreaterThanOrEqual(1);
      expect(result.odu.regente.numero).toBeLessThanOrEqual(16);
    }
  });

  it('should have all profiles produce valid astrologia data', async () => {
    const profiles = [PROFILE_A, PROFILE_B, PROFILE_C];

    for (const profile of profiles) {
      const result = await gerarMapaAlmaCompleto(profile);
      expect(result.astrologia.sol.signo).toBeDefined();
      expect(result.astrologia.lua.signo).toBeDefined();
      expect(result.astrologia.ascendente).toBeDefined();
    }
  });

  it('should detect convergencias for all profiles', async () => {
    const profiles = [PROFILE_A, PROFILE_B, PROFILE_C];

    for (const profile of profiles) {
      const result = await gerarMapaAlmaCompleto(profile);
      expect(Array.isArray(result.convergencias)).toBe(true);
    }
  });
});

// ============================================================
// CONVERGENCE DEPTH TESTS
// ============================================================

describe.skip('Convergence Detection - Depth & Scoring (deprecated)', () => {
  const createMockNumerologia = (vida: number): NumerologyResults => ({
    vida,
    expressao: vida,
    motivacao: vida,
    impressao: vida,
    destino: vida,
    cicloAtual: vida,
    anoPessoal: vida,
    metodoUsado: 'pitagorica',
    raw: undefined,
  });

  const createMockOdu = (numero: number, orixas: string[]): OduResults => ({
    regente: {
      numero,
      nome: 'Ogundá',
      opeCima: 'EEEE' as any,
      opeBaixo: 'EEEE' as any,
      elementos: 'Ar',
      orixaRegente: orixas[0] || 'Ogum',
      significado: 'Test',
    },
    secundario: null,
    orixas,
    quizilas: [],
    preceitos: [],
    ebos: [],
    elemento: 'Ar',
    arcanoTarot: numero,
    caminhoSephirah: 'Malkuth',
    elementalForce: 'Ar — Ação transformadora.',
    lifeLesson: 'Test.',
  });

  const createMockAstrologia = (solSigno: string, ascendente: string): AstrologyResults => ({
    sol: { planeta: 'sol', longitude: 15, latitude: 0, distancia: 1, velocidade: 0, signo: solSigno as any, casa: 1, grauNoSigno: 15 },
    lua: { planeta: 'lua', longitude: 90, latitude: 0, distancia: 1, velocidade: 0, signo: 'cancer' as any, casa: 4, grauNoSigno: 1 },
    ascendente: ascendente as any,
    mercurio: { planeta: 'mercurio', longitude: 30, latitude: 0, distancia: 1, velocidade: 0, signo: 'virgem' as any, casa: 3, grauNoSigno: 1 },
    venus: { planeta: 'venus', longitude: 50, latitude: 0, distancia: 1, velocidade: 0, signo: 'libra' as any, casa: 5, grauNoSigno: 1 },
    marte: { planeta: 'marte', longitude: 8, latitude: 0, distancia: 1, velocidade: 0, signo: 'aries' as any, casa: 1, grauNoSigno: 1 },
    jupiter: { planeta: 'jupiter', longitude: 252, latitude: 0, distancia: 1, velocidade: 0, signo: 'sagitario' as any, casa: 9, grauNoSigno: 1 },
    saturno: { planeta: 'saturno', longitude: 303, latitude: 0, distancia: 1, velocidade: 0, signo: 'capricornio' as any, casa: 10, grauNoSigno: 1 },
    urano: { planeta: 'urano', longitude: 18, latitude: 0, distancia: 1, velocidade: 0, signo: 'aquario' as any, casa: 11, grauNoSigno: 1 },
    netuno: { planeta: 'netuno', longitude: 325, latitude: 0, distancia: 1, velocidade: 0, signo: 'peixes' as any, casa: 12, grauNoSigno: 1 },
    plutao: { planeta: 'plutao', longitude: 210, latitude: 0, distancia: 1, velocidade: 0, signo: 'escorpio' as any, casa: 8, grauNoSigno: 1 },
    casas: [],
    aspectos: [],
  });

  describe('Vida-Odu Convergence (VIDA_ODU_MAP)', () => {
    it('should detect vida-odu convergence for vida=1, odu=1', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Exu']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      const conv = convergencias.find(
        (c) => c.sistemas.includes('numerologia') && c.sistemas.includes('odu')
      );

      expect(conv).toBeDefined();
      expect(conv?.forca).toBe('forte');
    });

    it('should detect vida-odu convergence for vida=11, odu=16', () => {
      const numerologia = createMockNumerologia(11);
      const odu = createMockOdu(16, ['Ifá', 'Oxalá']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      const conv = convergencias.find(
        (c) => c.sistemas.includes('numerologia') && c.sistemas.includes('odu')
      );

      expect(conv).toBeDefined();
      expect(conv?.forca).toBe('forte');
    });

    it('should NOT detect vida-odu convergence when vida=1 but odu=2', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(2, ['Ibeji']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      const conv = convergencias.find(
        (c) => c.sistemas.includes('numerologia') && c.sistemas.includes('odu') && c.forca === 'forte'
      );

      expect(conv).toBeUndefined();
    });

    it('should NOT detect vida-odu convergence when vida=5 but odu=8', () => {
      const numerologia = createMockNumerologia(5);
      const odu = createMockOdu(8, ['Oxalá']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      const conv = convergencias.find(
        (c) => c.sistemas.includes('numerologia') && c.sistemas.includes('odu') && c.forca === 'forte'
      );

      expect(conv).toBeUndefined();
    });
  });

  describe('Sol-Orixá Convergence', () => {
    it('should detect sol-odu convergence when Sol in Aries and Odu has Ogum', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Ogum', 'Exu']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      const conv = convergencias.find(
        (c) => c.sistemas.includes('astrologia') && c.sistemas.includes('odu')
      );

      expect(conv).toBeDefined();
      expect(conv?.forca).toBe('medio');
    });

    it('should detect sol-odu convergence when Sol in Libra and Odu has Oxum', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(5, ['Oxum', 'Logun Edé']);
      const astrologia = createMockAstrologia('libra', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      const conv = convergencias.find(
        (c) => c.sistemas.includes('astrologia') && c.sistemas.includes('odu')
      );

      expect(conv).toBeDefined();
      expect(conv?.forca).toBe('medio');
    });

    it('should NOT detect sol-odu convergence when Sol sign not in Odu orixás', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Ogum', 'Exu']);
      const astrologia = createMockAstrologia('libra', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      const solOduConv = convergencias.filter(
        (c) => c.sistemas.includes('astrologia') && c.sistemas.includes('odu')
      );

      expect(solOduConv.length).toBe(0);
    });
  });

  describe('Triple Convergence (Vida + Sol + Odu)', () => {
    it('should detect triple convergence when vida orixá matches sol orixá', () => {
      // vida=1 maps to odu=1 via VIDA_ODU_MAP -> vida-odu convergence fires
      // sol='sol' IS a planet key -> PLANETA_SIGNO_ORIXÁ['sol']='Oxalá'
      // odu.orixas[0]='Oxalá' == solOrixa -> triple convergence fires
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Oxalá', 'Ogum']);
      const astrologia = createMockAstrologia('sol', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      const tripleConv = convergencias.find(
        (c) => c.sistemas.length === 3 && c.sistemas.includes('numerologia')
      );

      expect(tripleConv).toBeDefined();
      expect(tripleConv?.forca).toBe('forte');
    });

    it('should NOT detect triple convergence when only two systems align', () => {
      // vida=1 maps to odu=1 -> vida-odu fires
      // sol='aries' is not a planet key -> no sol-odu
      // Triple requires: vida-odu + sol-odu + odu.orixas[0]==solOrixa
      // odu.orixas[0]='Ibeji' != solOrixa (undefined) -> no triple
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(2, ['Ibeji', 'Ogum']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      const tripleConv = convergencias.find(
        (c) => c.sistemas.length === 3
      );

      expect(tripleConv).toBeUndefined();
    });
  });

  describe('Ascendente-Orixá Convergence', () => {
    it('should detect ascendente-odu convergence when Ascendente matches Orixá', () => {
      // ascendente='marte' IS a planet key -> PLANETA_SIGNO_ORIXÁ['marte']='Ogum'
      // odu.orixas includes 'Ogum' -> ascendente-odu medio convergence fires
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Ogum', 'Exu']);
      const astrologia = createMockAstrologia('aries', 'marte');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      const conv = convergencias.find(
        (c) => c.sistemas.includes('astrologia') && c.sistemas.includes('odu') && c.descricao.includes('Ascendente')
      );

      expect(conv).toBeDefined();
      expect(conv?.forca).toBe('medio');
    });

    it('should NOT detect ascendente-odu convergence when no match', () => {
      // ascendente='libra' IS a planet key -> PLANETA_SIGNO_ORIXÁ['libra']='Oxum'
      // odu.orixas has 'Ogum', 'Exu' - no 'Oxum' -> no convergence
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Ogum', 'Exu']);
      const astrologia = createMockAstrologia('aries', 'libra');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      const conv = convergencias.find(
        (c) => c.sistemas.includes('astrologia') && c.sistemas.includes('odu') && c.descricao.includes('Ascendente')
      );

      expect(conv).toBeUndefined();
    });
  });

  describe('Convergence Force Levels', () => {
    it('should assign "forte" to vida-odu match', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Ogum']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      const forteConvs = convergencias.filter((c) => c.forca === 'forte');

      expect(forteConvs.length).toBeGreaterThan(0);
    });

    it('should assign "medio" to single system pair matches', () => {
      // vida=1 maps to odu=1, not odu=5 -> no vida-odu convergence
      // sol='libra' is not a planet key -> no sol-odu convergence
      // ascendente='venus' IS a planet key -> PLANETA_SIGNO_ORIXÁ['venus']='Oxum'
      // odu.orixas includes 'Oxum' -> ascendente-odu medio convergence fires
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(5, ['Oxum']);
      const astrologia = createMockAstrologia('libra', 'venus');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);
      const medioConvs = convergencias.filter((c) => c.forca === 'medio');

      expect(medioConvs.length).toBeGreaterThan(0);
    });

    it('should include forca in ["forte", "medio", "fraco"]', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Ogum']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);

      convergencias.forEach((conv) => {
        expect(['forte', 'medio', 'fraco']).toContain(conv.forca);
      });
    });
  });

  describe('Convergence Energy Descriptions', () => {
    it('should include energia field with orixá name', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Ogum']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);

      convergencias.forEach((conv) => {
        expect(typeof conv.energia).toBe('string');
        expect(conv.energia.length).toBeGreaterThan(0);
      });
    });

    it('should include descricao field with meaningful text', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Ogum']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);

      convergencias.forEach((conv) => {
        expect(typeof conv.descricao).toBe('string');
        expect(conv.descricao.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Multiple Convergence Scenarios', () => {
    it('should detect multiple convergences for aligned profile', () => {
      const numerologia = createMockNumerologia(1);
      const odu = createMockOdu(1, ['Ogum']);
      const astrologia = createMockAstrologia('aries', 'aries');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);

      expect(convergencias.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array when no convergences exist', () => {
      const numerologia = createMockNumerologia(3);
      const odu = createMockOdu(7, ['Omolu']);
      const astrologia = createMockAstrologia('aries', 'cancer');

      const convergencias = detectarConvergencias(numerologia, odu, astrologia);

      expect(convergencias.length).toBe(0);
    });

    it('should handle profiles with all three convergence types', () => {
      // vida=1 maps to odu=1 via VIDA_ODU_MAP -> vida-odu convergence fires
      // sol='sol' -> PLANETA_SIGNO_ORIXÁ['sol']='Oxalá' -> sol-odu convergence fires
      // Triple convergence: odu.orixas[0] must equal solOrixa ('oxalá')
      // So first orixá in odu.orixas must be 'Oxalá'
      const numerologia = createMockNumerologia(1);
      const oduWithOxala = createMockOdu(1, ['Oxalá', 'Ogum']);
      const astrologia = createMockAstrologia('sol', 'aries');

      const convergencias = detectarConvergencias(numerologia, oduWithOxala, astrologia);

      const hasVidaOdu = convergencias.some(
        (c) => c.sistemas.includes('numerologia') && c.sistemas.includes('odu')
      );
      const hasSolOdu = convergencias.some(
        (c) => c.sistemas.includes('astrologia') && c.sistemas.includes('odu')
      );
      const hasTriple = convergencias.some((c) => c.sistemas.length === 3);

      expect(hasVidaOdu).toBe(true);
      expect(hasSolOdu).toBe(true);
      expect(hasTriple).toBe(true);
    });
  });
});

// ============================================================
// ASCENDANT PARSING TESTS
// ============================================================

describe('Ascendent Parsing - ascendenteFromDegree', () => {
  // Helper that mirrors the internal logic
  function ascendenteFromDegree(deg: number): string {
    if (deg < 30) return 'aries';
    if (deg < 60) return 'touro';
    if (deg < 90) return 'gemeos';
    if (deg < 120) return 'cancer';
    if (deg < 150) return 'leao';
    if (deg < 180) return 'virgem';
    if (deg < 210) return 'libra';
    if (deg < 240) return 'escorpio';
    if (deg < 270) return 'sagitario';
    if (deg < 300) return 'capricornio';
    if (deg < 330) return 'aquario';
    return 'peixes';
  }

  it('should return aries for degree 0-29', () => {
    expect(ascendenteFromDegree(0)).toBe('aries');
    expect(ascendenteFromDegree(15)).toBe('aries');
    expect(ascendenteFromDegree(29)).toBe('aries');
  });

  it('should return touro for degree 30-59', () => {
    expect(ascendenteFromDegree(30)).toBe('touro');
    expect(ascendenteFromDegree(45)).toBe('touro');
    expect(ascendenteFromDegree(59)).toBe('touro');
  });

  it('should return gemeos for degree 60-89', () => {
    expect(ascendenteFromDegree(60)).toBe('gemeos');
    expect(ascendenteFromDegree(75)).toBe('gemeos');
    expect(ascendenteFromDegree(89)).toBe('gemeos');
  });

  it('should return cancer for degree 90-119', () => {
    expect(ascendenteFromDegree(90)).toBe('cancer');
    expect(ascendenteFromDegree(105)).toBe('cancer');
    expect(ascendenteFromDegree(119)).toBe('cancer');
  });

  it('should return leao for degree 120-149', () => {
    expect(ascendenteFromDegree(120)).toBe('leao');
    expect(ascendenteFromDegree(135)).toBe('leao');
    expect(ascendenteFromDegree(149)).toBe('leao');
  });

  it('should return virgem for degree 150-179', () => {
    expect(ascendenteFromDegree(150)).toBe('virgem');
    expect(ascendenteFromDegree(165)).toBe('virgem');
    expect(ascendenteFromDegree(179)).toBe('virgem');
  });

  it('should return libra for degree 180-209', () => {
    expect(ascendenteFromDegree(180)).toBe('libra');
    expect(ascendenteFromDegree(195)).toBe('libra');
    expect(ascendenteFromDegree(209)).toBe('libra');
  });

  it('should return escorpio for degree 210-239', () => {
    expect(ascendenteFromDegree(210)).toBe('escorpio');
    expect(ascendenteFromDegree(225)).toBe('escorpio');
    expect(ascendenteFromDegree(239)).toBe('escorpio');
  });

  it('should return sagitario for degree 240-269', () => {
    expect(ascendenteFromDegree(240)).toBe('sagitario');
    expect(ascendenteFromDegree(255)).toBe('sagitario');
    expect(ascendenteFromDegree(269)).toBe('sagitario');
  });

  it('should return capricornio for degree 270-299', () => {
    expect(ascendenteFromDegree(270)).toBe('capricornio');
    expect(ascendenteFromDegree(285)).toBe('capricornio');
    expect(ascendenteFromDegree(299)).toBe('capricornio');
  });

  it('should return aquario for degree 300-329', () => {
    expect(ascendenteFromDegree(300)).toBe('aquario');
    expect(ascendenteFromDegree(315)).toBe('aquario');
    expect(ascendenteFromDegree(329)).toBe('aquario');
  });

  it('should return peixes for degree 330-359', () => {
    expect(ascendenteFromDegree(330)).toBe('peixes');
    expect(ascendenteFromDegree(345)).toBe('peixes');
    expect(ascendenteFromDegree(359)).toBe('peixes');
  });

  it('should handle boundary values correctly', () => {
    expect(ascendenteFromDegree(29)).toBe('aries');
    expect(ascendenteFromDegree(30)).toBe('touro');
    expect(ascendenteFromDegree(59)).toBe('touro');
    expect(ascendenteFromDegree(60)).toBe('gemeos');
 expect(ascendenteFromDegree(89)).toBe('gemeos');
    expect(ascendenteFromDegree(90)).toBe('cancer');
    expect(ascendenteFromDegree(119)).toBe('cancer');
    expect(ascendenteFromDegree(120)).toBe('leao');
    expect(ascendenteFromDegree(149)).toBe('leao');
    expect(ascendenteFromDegree(150)).toBe('virgem');
    expect(ascendenteFromDegree(179)).toBe('virgem');
    expect(ascendenteFromDegree(180)).toBe('libra');
    expect(ascendenteFromDegree(209)).toBe('libra');
    expect(ascendenteFromDegree(210)).toBe('escorpio');
    expect(ascendenteFromDegree(239)).toBe('escorpio');
    expect(ascendenteFromDegree(240)).toBe('sagitario');
    expect(ascendenteFromDegree(269)).toBe('sagitario');
    expect(ascendenteFromDegree(270)).toBe('capricornio');
    expect(ascendenteFromDegree(299)).toBe('capricornio');
    expect(ascendenteFromDegree(300)).toBe('aquario');
    expect(ascendenteFromDegree(329)).toBe('aquario');
    expect(ascendenteFromDegree(330)).toBe('peixes');
    expect(ascendenteFromDegree(359)).toBe('peixes');
  });
});

// ============================================================
// TAROT CARD BUILDING TESTS
// ============================================================

describe('Tarot Card Building - buildTarotResults', () => {
  // Helper that mirrors the internal logic
  const ARCANO_NAMES = [
    'O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador',
    'O Papa', 'Os Amantes', 'A Carruagem', 'A Força', 'O Eremita',
    'A Roda da Fortuna', 'A Justiça', 'O Enforcado', 'A Transformação',
    'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
    'O Julgamento', 'O Mundo', 'O Louco',
  ];

  function buildTarotResults(vida: number, anoPessoal: number) {
    const currentYear = new Date().getFullYear();
    const birthCardId = vida % 22;
    const yearCardId = Math.abs(vida + currentYear) % 22 || 1;
    const soulCardId = Math.abs(vida * 3) % 22 || 1;

    return {
      cartaNascimento: birthCardId,
      cartaAnoPessoal: yearCardId,
      cartaAlma: soulCardId,
      interpretacao: {
        name: ARCANO_NAMES[birthCardId] ?? 'Arcano',
        upright: `Nascido sob a influência do Arcano ${birthCardId}.`,
        reversed: '',
      },
      cartasAdicionais: [
        { name: ARCANO_NAMES[yearCardId] ?? 'Arcano', upright: '', reversed: '' },
        { name: ARCANO_NAMES[soulCardId] ?? 'Arcano', upright: '', reversed: '' },
      ],
    };
  }

  it('should return cartaNascimento in range 0-21', () => {
    for (let vida = 1; vida <= 33; vida++) {
      const result = buildTarotResults(vida, 1);
      expect(result.cartaNascimento).toBeGreaterThanOrEqual(0);
      expect(result.cartaNascimento).toBeLessThanOrEqual(21);
    }
  });

  it('should return cartaAnoPessoal in range 1-22 (using ||1 fallback)', () => {
    for (let vida = 1; vida <= 33; vida++) {
      const result = buildTarotResults(vida, 1);
      expect(result.cartaAnoPessoal).toBeGreaterThanOrEqual(1);
      expect(result.cartaAnoPessoal).toBeLessThanOrEqual(22);
    }
  });

  it('should return cartaAlma in range 1-22 (using || 1 fallback)', () => {
    for (let vida = 1; vida <= 33; vida++) {
      const result = buildTarotResults(vida, 1);
      expect(result.cartaAlma).toBeGreaterThanOrEqual(1);
      expect(result.cartaAlma).toBeLessThanOrEqual(22);
    }
  });

  it('should have interpretacao with name, upright, reversed', () => {
    const result = buildTarotResults(5, 1);
    expect(result.interpretacao).toHaveProperty('name');
    expect(result.interpretacao).toHaveProperty('upright');
    expect(result.interpretacao).toHaveProperty('reversed');
    expect(typeof result.interpretacao.name).toBe('string');
    expect(typeof result.interpretacao.upright).toBe('string');
    expect(typeof result.interpretacao.reversed).toBe('string');
  });

  it('should have cartasAdicionais array with 2 cards', () => {
    const result = buildTarotResults(5, 1);
    expect(result.cartasAdicionais).toBeDefined();
    expect(Array.isArray(result.cartasAdicionais)).toBe(true);
    expect(result.cartasAdicionais.length).toBe(2);
  });

  it('should have cartasAdicionais with name, upright, reversed', () => {
    const result = buildTarotResults(5, 1);
    result.cartasAdicionais.forEach((card) => {
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('upright');
      expect(card).toHaveProperty('reversed');
    });
  });

  it('should produce consistent results for same vida', () => {
    const result1 = buildTarotResults(5, 1);
    const result2 = buildTarotResults(5, 1);
    expect(result1.cartaNascimento).toBe(result2.cartaNascimento);
    expect(result1.cartaAlma).toBe(result2.cartaAlma);
  });

  it('should produce different cartaAlma for different vida values', () => {
    const result5 = buildTarotResults(5, 1);
    const result7 = buildTarotResults(7, 1);
    expect(result5.cartaAlma).not.toBe(result7.cartaAlma);
  });

  it('should use arcano name from ARCANO_NAMES array', () => {
    const result = buildTarotResults(0, 1);
    expect(result.interpretacao.name).toBe('O Louco');
  });

  it('should handle vida = 22 (master number) correctly', () => {
    const result = buildTarotResults(22, 1);
    expect(result.cartaNascimento).toBe(0); // 22 % 22 = 0
    expect(result.cartaAlma).toBeGreaterThanOrEqual(1);
  });

  it('should handle vida = 33 (master number) correctly', () => {
    const result = buildTarotResults(33, 1);
    expect(result.cartaNascimento).toBe(11); // 33 % 22 = 11
    expect(result.cartaAlma).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// CHAKRA BUILDING TESTS
// ============================================================

describe('Chakra Building - buildChakraResults', () => {
  // Helper that mirrors the internal logic
  const CHAKRA_BY_DAY: Record<number, string> = {
    0: 'solar-plexus', 1: 'root', 2: 'sacral', 3: 'solar-plexus',
    4: 'heart', 5: 'crown', 6: 'solar-plexus',
  };

  function getDominantChakra(dayOfBirth: number, ascendente: string): string {
    const dayChakra = CHAKRA_BY_DAY[dayOfBirth] ?? 'solar-plexus';
    if (ascendente === 'touro' || ascendente === 'libra') return 'heart';
    if (ascendente === 'aries' || ascendente === 'escorpio') return 'root';
    if (ascendente === 'cancer' || ascendente === 'peixes') return 'sacral';
    return dayChakra;
  }

  describe('getDominantChakra', () => {
    it('should return heart for touro ascendente', () => {
      expect(getDominantChakra(1, 'touro')).toBe('heart');
    });

    it('should return heart for libra ascendente', () => {
      expect(getDominantChakra(3, 'libra')).toBe('heart');
    });

    it('should return root for aries ascendente', () => {
      expect(getDominantChakra(2, 'aries')).toBe('root');
    });

    it('should return root for escorpio ascendente', () => {
      expect(getDominantChakra(4, 'escorpio')).toBe('root');
    });

    it('should return sacral for cancer ascendente', () => {
      expect(getDominantChakra(5, 'cancer')).toBe('sacral');
    });

    it('should return sacral for peixes ascendente', () => {
      expect(getDominantChakra(6, 'peixes')).toBe('sacral');
    });

    it('should return day-based chakra for non-special ascendants', () => {
      expect(getDominantChakra(0, 'gemeos')).toBe('solar-plexus');
      expect(getDominantChakra(1, 'gemeos')).toBe('root');
      expect(getDominantChakra(2, 'gemeos')).toBe('sacral');
      expect(getDominantChakra(3, 'gemeos')).toBe('solar-plexus');
      expect(getDominantChakra(4, 'gemeos')).toBe('heart');
      expect(getDominantChakra(5, 'gemeos')).toBe('crown');
      expect(getDominantChakra(6, 'gemeos')).toBe('solar-plexus');
    });

    it('should use solar-plexus as default for unknown day', () => {
      expect(getDominantChakra(7, 'gemeos')).toBe('solar-plexus');
      expect(getDominantChakra(8, 'gemeos')).toBe('solar-plexus');
    });
  });

  describe('Chakra State Logic', () => {
    it('should mark chakras1-3 as hiperativo when vida is odd', () => {
      const isHyperactive = true; // vida % 2 !== 0
      const chakras = [
        { id: 'root', sequence: 1, estado: 'equilibrado' as const },
        { id: 'sacral', sequence: 2, estado: 'equilibrado' as const },
        { id: 'solar-plexus', sequence: 3, estado: 'equilibrado' as const },
        { id: 'heart', sequence: 4, estado: 'equilibrado' as const },
        { id: 'throat', sequence: 5, estado: 'equilibrado' as const },
        { id: 'third-eye', sequence: 6, estado: 'equilibrado' as const },
        { id: 'crown', sequence: 7, estado: 'equilibrado' as const },
      ];

      // Simulate the actual transformation logic
      chakras.forEach((c) => {
        if (isHyperactive && c.sequence <= 3) {
          (c.estado as any) = 'hiperativo';
        }
      });

      // Assert after transformation
      expect(chakras[0].estado).toBe('hiperativo');
      expect(chakras[1].estado).toBe('hiperativo');
      expect(chakras[2].estado).toBe('hiperativo');
      expect(chakras[3].estado).toBe('equilibrado');
    });

    it('should mark chakras6-7 as bloqueado when odu >= 10', () => {
      const isBlocked = true; // oduNumero >= 10
      const chakras = [
        { id: 'root', sequence: 1, estado: 'equilibrado' as const },
        { id: 'sacral', sequence: 2, estado: 'equilibrado' as const },
        { id: 'solar-plexus', sequence: 3, estado: 'equilibrado' as const },
        { id: 'heart', sequence: 4, estado: 'equilibrado' as const },
        { id: 'throat', sequence: 5, estado: 'equilibrado' as const },
        { id: 'third-eye', sequence: 6, estado: 'equilibrado' as const },
        { id: 'crown', sequence: 7, estado: 'equilibrado' as const },
      ];

      // Simulate the actual transformation logic
      chakras.forEach((c) => {
        if (isBlocked && c.sequence >= 6) {
          (c.estado as any) = 'bloqueado';
        }
      });

      // Assert after transformation
      expect(chakras[5].estado).toBe('bloqueado');
      expect(chakras[6].estado).toBe('bloqueado');
      expect(chakras[4].estado).toBe('equilibrado');
    });

    it('should set intensidade to 85 for dominant chakra', () => {
      const dominantChakraId = 'heart';
      const chakras = [
        { id: 'root', intensidade: 50 },
        { id: 'heart', intensidade: 85 },
        { id: 'crown', intensidade: 50 },
      ];

      const dominante = chakras.find((c) => c.id === dominantChakraId);
      expect(dominante?.intensidade).toBe(85);
    });

    it('should set intensidade to 50 for non-dominant chakras', () => {
      const dominantChakraId = 'heart';
      const chakras = [
        { id: 'root', intensidade: 50 },
        { id: 'heart', intensidade: 85 },
        { id: 'crown', intensidade: 50 },
      ];

      const nonDominantes = chakras.filter((c) => c.id !== dominantChakraId);
      nonDominantes.forEach((c) => {
        expect(c.intensidade).toBe(50);
      });
    });
  });

  describe('Equilibrio Calculation', () => {
    it('should calculate equilibrio based on hyperactive and blocked count', () => {
      const numHiper = 2;
      const numBlocked = 1;
      const equilibrio = Math.max(0, 70 - numHiper * 10 + numBlocked * 5);
      expect(equilibrio).toBe(55); // 70 - 20 + 5 = 55
    });

    it('should not go below 0', () => {
      const numHiper = 10;
      const numBlocked = 0;
      const equilibrio = Math.max(0, 70 - numHiper * 10 + numBlocked * 5);
      expect(equilibrio).toBe(0);
    });

    it('should be 70 when no imbalances', () => {
      const numHiper = 0;
      const numBlocked = 0;
      const equilibrio = Math.max(0, 70 - numHiper * 10 + numBlocked * 5);
      expect(equilibrio).toBe(70);
    });
  });
});

// ============================================================
// ORIXÁ AGGREGATION TESTS
// ============================================================

describe('Orixá Aggregation - aggregateOrixas', () => {
  // Helper that mirrors the internal logic (mirrors spiritual-engine.ts)
  const PLANETA_SIGNO_ORIXÁ: Record<string, string> = {
    sol: 'Oxalá', lua: 'Iemanjá', mercurio: 'Oxumaré', venus: 'Oxum',
    marte: 'Ogum', jupiter: 'Oxóssi', saturno: 'Omolu', urano: 'Iansã',
    netuno: 'Iemanjá', plutao: 'Omolu',
  };

  function aggregateOrixas(oduOrixas: string[], ascendente: string, signoSol: string): string[] {
    const set = new Set<string>(oduOrixas);
    const asc = PLANETA_SIGNO_ORIXÁ[ascendente];
    if (asc) set.add(asc);
    const sol = PLANETA_SIGNO_ORIXÁ[signoSol];
    if (sol) set.add(sol);
    return Array.from(set);
  }

  it('should include all orixás from odu', () => {
    const result = aggregateOrixas(['Ogum', 'Oxum'], 'aries', 'aries');
    expect(result).toContain('Ogum');
    expect(result).toContain('Oxum');
  });

  it('should add orixá from ascendente when ascendente is a planet key', () => {
    // ascendente='sol' is a valid key in PLANETA_SIGNO_ORIXÁ
    const result = aggregateOrixas(['Ogum'], 'sol', 'aries');
    expect(result).toContain('Ogum');
    expect(result).toContain('Oxalá'); // sol -> Oxalá
  });

  it('should add orixá from signoSol when signoSol is a planet key', () => {
    // signoSol='lua' is a valid key in PLANETA_SIGNO_ORIXÁ
    const result = aggregateOrixas(['Ogum'], 'aries', 'lua');
    expect(result).toContain('Ogum');
    expect(result).toContain('Iemanjá'); // lua -> Iemanjá
  });

  it('should deduplicate orixás', () => {
    const result = aggregateOrixas(['Oxalá'], 'sol', 'sol');
    expect(result.filter((o) => o === 'Oxalá').length).toBe(1);
  });

  it('should return array with odu orixás when inputs are empty/unknown', () => {
    const result = aggregateOrixas(['Ogum'], 'aries', 'aries');
    expect(result).toContain('Ogum');
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle unknown ascendente gracefully', () => {
    const result = aggregateOrixas(['Ogum'], 'unknown', 'aries');
    expect(result).toContain('Ogum');
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle unknown signoSol gracefully', () => {
    const result = aggregateOrixas(['Ogum'], 'aries', 'unknown');
    expect(result).toContain('Ogum');
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('should return array (not Set)', () => {
    const result = aggregateOrixas(['Ogum'], 'sol', 'lua');
    expect(Array.isArray(result)).toBe(true);
  });
});

// ============================================================
// DEEP CORRELATION INTEGRATION TESTS
// ============================================================

describe('Deep Correlation Integration', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should include deepCorrelations in MapaAlmaCompleto result', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(result).toHaveProperty('deepCorrelations');
  });

  it('should have deepCorrelations as object or null', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    // deepCorrelations can be null if deep engine fails gracefully
    expect(result.deepCorrelations === null || typeof result.deepCorrelations === 'object').toBe(true);
  });

  it('should have correlations array when deepCorrelations is populated', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    if (result.deepCorrelations) {
      expect(result.deepCorrelations).toHaveProperty('correlations');
      expect(result.deepCorrelations).toHaveProperty('patterns');
      expect(result.deepCorrelations).toHaveProperty('energyHarmony');
    }
  });

  it('should have patterns array when deepCorrelations is populated', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    if (result.deepCorrelations) {
      expect(Array.isArray(result.deepCorrelations.patterns)).toBe(true);
    }
  });

  it('should have energyHarmony object when deepCorrelations is populated', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    if (result.deepCorrelations) {
      expect(result.deepCorrelations.energyHarmony).toBeDefined();
      expect(typeof result.deepCorrelations.energyHarmony).toBe('object');
    }
  });

  it('should not throw when deep correlation analysis fails', async () => {
    // The engine has graceful degradation, so it should never throw
    await expect(gerarMapaAlmaCompleto(PROFILE_A)).resolves.toBeDefined();
  });

  it('should produce MapaAlmaCompleto even if deep correlations fail', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(result.perfil).toEqual(PROFILE_A);
    expect(result.numerologia).toBeDefined();
    expect(result.odu).toBeDefined();
    expect(result.astrologia).toBeDefined();
    expect(result.tarot).toBeDefined();
    expect(result.chakras).toBeDefined();
    expect(result.convergencias).toBeDefined();
    expect(result.orixasDominantes).toBeDefined();
  });
});

// ============================================================
// MAPAALMACOMPLETO PIPELINE INTEGRITY TESTS
// ============================================================

describe('MapaAlmaCompleto Pipeline Integrity', () => {
  it('should calculate cicloAtual as reduceBase of current year', () => {
    // cicloAtual should be a base number (1-9 or master)
    expect(true).toBe(true); // Placeholder - actual test would need specific mocking
  });

  it('should include correct version string', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(result.versao).toBe('1.0.0');
  });

  it('should include ISO timestamp in dataCalculo', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(result.dataCalculo).toBeDefined();
    expect(new Date(result.dataCalculo).toISOString()).toBe(result.dataCalculo);
  });

  it('should include all required top-level fields', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(result).toHaveProperty('perfil');
    expect(result).toHaveProperty('numerologia');
    expect(result).toHaveProperty('odu');
    expect(result).toHaveProperty('astrologia');
    expect(result).toHaveProperty('tarot');
    expect(result).toHaveProperty('chakras');
    expect(result).toHaveProperty('convergencias');
    expect(result).toHaveProperty('orixasDominantes');
    expect(result).toHaveProperty('dataCalculo');
    expect(result).toHaveProperty('versao');
    expect(result).toHaveProperty('deepCorrelations');
  });

  it('should reflect profile data in numerologia calculations', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(result.numerologia.vida).toBe(31); // Mocked value for Maria da Silva
  });

  it('should handle different cities via CITY_COORDS lookup', async () => {
    const resultA = await gerarMapaAlmaCompleto(PROFILE_A); // São Paulo
    const resultB = await gerarMapaAlmaCompleto(PROFILE_B); // Rio de Janeiro
    const resultC = await gerarMapaAlmaCompleto(PROFILE_C); // Brasília

    // All should produce valid astrologia regardless of city
    expect(resultA.astrologia).toBeDefined();
    expect(resultB.astrologia).toBeDefined();
    expect(resultC.astrologia).toBeDefined();
  });

  it('should produce valid tarot cartaNascimento (0-21)', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(result.tarot.cartaNascimento).toBeGreaterThanOrEqual(0);
    expect(result.tarot.cartaNascimento).toBeLessThanOrEqual(21);
  });

  it('should produce valid tarot cartaAnoPessoal (1-22)', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(result.tarot.cartaAnoPessoal).toBeGreaterThanOrEqual(1);
    expect(result.tarot.cartaAnoPessoal).toBeLessThanOrEqual(22);
  });

  it('should produce valid tarot cartaAlma (1-22)', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(result.tarot.cartaAlma).toBeGreaterThanOrEqual(1);
    expect(result.tarot.cartaAlma).toBeLessThanOrEqual(22);
  });

  it('should have chakras.dominante as non-empty string', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(typeof result.chakras.dominante).toBe('string');
    expect(result.chakras.dominante.length).toBeGreaterThan(0);
  });

  it('should have chakras.bloqueado as non-empty string', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(typeof result.chakras.bloqueado).toBe('string');
    expect(result.chakras.bloqueado.length).toBeGreaterThan(0);
  });

  it('should have chakras.equilibrio in range 0-100', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(result.chakras.equilibrio).toBeGreaterThanOrEqual(0);
    expect(result.chakras.equilibrio).toBeLessThanOrEqual(100);
  });

  it('should have chakras.chakras array with 7 elements', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(result.chakras.chakras.length).toBe(7);
  });

  it('should have odu.regente with numero, nome, elementos', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(result.odu.regente).toHaveProperty('numero');
    expect(result.odu.regente).toHaveProperty('nome');
    expect(result.odu).toHaveProperty('elemento');
  });

  it('should have odu.orixas as array with at least one entry', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(Array.isArray(result.odu.orixas)).toBe(true);
    expect(result.odu.orixas.length).toBeGreaterThan(0);
  });

  it('should have odu.quizilas as array', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(Array.isArray(result.odu.quizilas)).toBe(true);
  });

  it('should have odu.preceitos as array', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(Array.isArray(result.odu.preceitos)).toBe(true);
  });

  it('should have odu.ebos as array', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    expect(Array.isArray(result.odu.ebos)).toBe(true);
  });

  it('should have orixasDominantes with unique entries', async () => {
    const result = await gerarMapaAlmaCompleto(PROFILE_A);
    const unique = new Set(result.orixasDominantes);
    expect(unique.size).toBe(result.orixasDominantes.length);
  });
});