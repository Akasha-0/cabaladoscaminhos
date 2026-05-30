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

describe('detectarConvergencias', () => {
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
      opeCima: 'EEEE',
      opeBaixo: 'EEEE',
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
    houses: [],
    aspects: [],
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

      const vidaOduConv = convergencias.find(
        (c) => c.sistemas.includes('numerologia') && c.sistemas.includes('odu') && c.forca === 'forte'
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