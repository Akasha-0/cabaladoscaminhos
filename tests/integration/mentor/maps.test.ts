/**
 * Testes de integração para carregamento de mapas do Mentor
 * @akasha-v0.0.11 - T8.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UserMaps, CabalaData, AstrologyData } from '@akasha/mentor/types';

// =============================================================================
// Mocks para Prisma
// =============================================================================

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// =============================================================================
// Mocks para os cores
// =============================================================================

vi.mock('@akasha/core-cabala', () => ({
  buildKabalisticMap: vi.fn(() => ({
    lifePath: 5,
    lifePathMaster: false,
  })),
}));

vi.mock('@akasha/core-odus', () => ({
  calculateBirthOdu: vi.fn(() => ({
    oduName: 'Ogbe',
    sign: 'Yang',
  })),
}));

vi.mock('@akasha/core-astrology', () => ({
  getBirthChart: vi.fn(() => ({
    planets: [
      { planet: 'sol', longitude: 120 },
      { planet: 'lua', longitude: 45 },
      { planet: 'ascendente', longitude: 90 },
    ],
  })),
}));

vi.mock('@akasha/core-tantra', () => ({
  buildTantricMap: vi.fn(() => ({
    soulDescription: 'Corpo da Alma',
    karmaDescription: 'Corpo Negativo',
    divineGiftDescription: 'Corpo Positivo',
  })),
}));

// =============================================================================
// Funções a testar
// =============================================================================

import { loadUserMaps, formatMapsSummary, mapsToPromptContext } from '@akasha/mentor/maps';

// =============================================================================
// Helpers
// =============================================================================

function getMockUserData() {
  return {
    id: 'test-user-maps',
    name: 'Maria Silva',
    birthDate: '1990-01-01',
    location: '-23.5505,-46.6333',
  };
}

// =============================================================================
// Tests
// =============================================================================

describe('Maps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue(getMockUserData());
  });

  describe('loadUserMaps', () => {
    it('deve carregar mapas do usuário', async () => {
      const maps = await loadUserMaps({
        prisma: mockPrisma,
        userId: 'test-user-maps',
      });

      expect(maps).toBeDefined();
      expect(maps).toHaveProperty('cabala');
      expect(maps).toHaveProperty('astrology');
      expect(maps).toHaveProperty('odus');
      expect(maps).toHaveProperty('tantra');
    });

    it('deve chamar prisma com userId correto', async () => {
      await loadUserMaps({
        prisma: mockPrisma,
        userId: 'test-user-maps',
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-user-maps' },
        select: { birthDate: true, name: true, location: true },
      });
    });

    it('deve lançar erro para usuário não encontrado', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        loadUserMaps({
          prisma: mockPrisma,
          userId: 'non-existent',
        })
      ).rejects.toThrow('User not found');
    });

    it('deve incluir dados de Cabala', async () => {
      const maps = await loadUserMaps({
        prisma: mockPrisma,
        userId: 'test-user-maps',
      });

      expect(maps.cabala).toBeDefined();
      const cabala = maps.cabala as CabalaData;
      expect(cabala).toHaveProperty('lifePath');
      expect(cabala).toHaveProperty('description');
    });

    it('deve incluir dados de Astrologia', async () => {
      const maps = await loadUserMaps({
        prisma: mockPrisma,
        userId: 'test-user-maps',
      });

      expect(maps.astrology).toBeDefined();
      const astrology = maps.astrology as AstrologyData;
      expect(astrology).toHaveProperty('planets');
    });

    it('deve incluir dados de Odus', async () => {
      const maps = await loadUserMaps({
        prisma: mockPrisma,
        userId: 'test-user-maps',
      });

      expect(maps.odus).toBeDefined();
      expect(maps.odus).toHaveProperty('primary');
    });

    it('deve incluir dados de Tantra', async () => {
      const maps = await loadUserMaps({
        prisma: mockPrisma,
        userId: 'test-user-maps',
      });

      expect(maps.tantra).toBeDefined();
      expect(maps.tantra).toHaveProperty('primary');
      expect(maps.tantra).toHaveProperty('secondary');
    });
  });

  describe('formatMapsSummary', () => {
    it('deve formatar resumo com caminho de vida', () => {
      const maps: UserMaps = {
        cabala: {
          lifePath: 5,
          description: 'Liberdade, mudança, aventura',
        },
        astrology: {
          sign: 'touro',
        },
        odus: {
          primary: 'Ogbe',
        },
        tantra: {
          primary: 'Corpo da Alma',
        },
      };

      const summary = formatMapsSummary(maps);

      expect(summary).toContain('Caminho de Vida');
      expect(summary).toContain('5');
    });

    it('deve formatar resumo com Odu regente', () => {
      const maps: UserMaps = {
        cabala: {
          lifePath: 3,
          description: 'Expressão criativa',
        },
        astrology: {
          sign: 'gemeos',
        },
        odus: {
          primary: 'Oyeku',
        },
        tantra: {
          primary: 'Corpo da Alma',
        },
      };

      const summary = formatMapsSummary(maps);

      expect(summary).toContain('Odu Regente');
      expect(summary).toContain('Oyeku');
    });

    it('deve formatar resumo com signo solar', () => {
      const maps: UserMaps = {
        cabala: {
          lifePath: 7,
          description: 'Análise e introspecção',
        },
        astrology: {
          sign: 'leao',
        },
        odus: {
          primary: 'Ogbe',
        },
        tantra: {
          primary: 'Corpo da Alma',
        },
      };

      const summary = formatMapsSummary(maps);

      expect(summary).toContain('Sol');
      expect(summary).toContain('leao');
    });

    it('deve formatar resumo com corpo tântrico', () => {
      const maps: UserMaps = {
        cabala: {
          lifePath: 1,
          description: 'Iniciativa',
        },
        astrology: {
          sign: 'aries',
        },
        odus: {
          primary: 'Ogbe',
        },
        tantra: {
          primary: 'Corpo Divino',
        },
      };

      const summary = formatMapsSummary(maps);

      expect(summary).toContain('Corpo Tântrico');
      expect(summary).toContain('Corpo Divino');
    });

    it('deve lidar com dados indefinidos', () => {
      const maps: UserMaps = {
        cabala: undefined,
        astrology: undefined,
        odus: undefined,
        tantra: undefined,
      };

      const summary = formatMapsSummary(maps);

      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
    });
  });

  describe('mapsToPromptContext', () => {
    it('deve gerar contexto para LLM', () => {
      const maps: UserMaps = {
        cabala: {
          lifePath: 5,
          description: 'Liberdade e mudança',
          sefirot: ['Hod'],
        },
        astrology: {
          sign: 'touro',
          moon: 'cancer',
          rising: 'virgem',
          planets: { sol: 'touro', lua: 'cancer' },
        },
        odus: {
          primary: 'Ogbe',
          secondary: 'Oyeku',
          sign: 'Yang',
        },
        tantra: {
          primary: 'Corpo da Alma',
          secondary: 'Corpo Negativo',
          bodies: ['Corpo da Alma', 'Corpo Negativo', 'Corpo Positivo'],
        },
      };

      const context = mapsToPromptContext(maps);

      expect(context).toContain('CABALA');
      expect(context).toContain('IFÁ');
      expect(context).toContain('ASTROLOGIA');
      expect(context).toContain('TANTRA');
      expect(context).toContain('5');
      expect(context).toContain('Ogbe');
    });

    it('deve incluir sefirot quando disponível', () => {
      const maps: UserMaps = {
        cabala: {
          lifePath: 6,
          sefirot: ['Tiferet'],
        },
        astrology: {},
        odus: {},
        tantra: {},
      };

      const context = mapsToPromptContext(maps);

      expect(context).toContain('Tiferet');
    });
  });
});
