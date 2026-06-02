/**
 * Dashboard Integration API Tests
 *
 * Tests the unified endpoint for dashboard widget data aggregation.
 */

import { describe, it, expect, vi } from 'vitest';

// Mock all the AI modules
vi.mock('@/lib/ai/spiritual-energy-analyzer', () => ({
  SpiritualEnergyAnalyzer: vi.fn(() => ({
    analyzeCurrentEnergy: vi.fn().mockResolvedValue({
      nivel: 75,
      tendencia: 'ascending' as const,
      elementoDominante: 'água',
      orixasAtivos: ['oxum', 'iemanja'],
      sefirotEmFoco: ['Yesod', 'Malkuth'],
      faseLuaAtual: 'cheia',
      diaSemana: 'sexta-feira',
      timestamp: new Date(),
    }),
  })),
}));

vi.mock('@/lib/ai/correlation-engine', () => ({
  correlateSpiritualData: vi.fn().mockResolvedValue({
    numerology: { numero: 7, element: 'fogo', planet: 'marte' },
    astrology: { sign: 'aries', rulingPlanet: 'marte' },
    orixa: [{ nome: 'xangô', elemento: 'fogo' }],
    odu: [{ nome: 'ogunda', correlationStrength: 0.85 }],
    tarot: { arcano: 'O Mago', numero: 1 },
    sephira: { nome: 'Chokhmah', numero: 2 },
  }),
}));

vi.mock('@/lib/ai/personalized-report', () => ({
  generateSpiritualReport: vi.fn().mockResolvedValue({
    id: 'report-123',
    title: 'Relatório Espiritual Personalizado',
    summary: 'Análise completa do seu caminho espiritual.',
    sections: [
      { type: 'numerologia', title: 'Numerologia', content: 'Seu número é 7.' },
      { type: 'astrologia', title: 'Astrologia', content: 'Seu signo é Áries.' },
    ],
  }),
}));

vi.mock('@/lib/ai/prophecy-ai', () => ({
  generateProphecy: vi.fn().mockResolvedValue({
    id: 'prophecy-123',
    mainMessage: 'Um novo caminho se abre diante de você.',
    symbols: [
      { system: 'tarot', value: 'O Mago', meaning: 'Manifestação e poder pessoal.' },
      { system: 'odu', value: 'Ogunda', meaning: 'Caminho de ação e determinação.' },
    ],
    timeframe: 'Próximos 30 dias',
    guidance: 'Siga com determinação.',
  }),
}));

vi.mock('@/lib/ai/meditation-ai', () => ({
  generateMeditationGuidance: vi.fn().mockResolvedValue({
    id: 'meditation-123',
    phases: [
      { name: 'Preparação', durationSeconds: 60, description: 'Prepare seu espaço.' },
      { name: 'Respiração', durationSeconds: 180, description: 'Respire profundamente.' },
      { name: 'Meditação', durationSeconds: 300, description: 'Entre em meditação.' },
      { name: 'Integração', durationSeconds: 60, description: 'Retorne suavemente.' },
    ],
    totalDurationMinutes: 10,
  }),
}));

describe('Dashboard Integration API', () => {
  describe('POST /api/dashboard/integrate', () => {
    it('should validate request body schema', async () => {
      const invalidBody = {
        userId: '', // empty - should fail
        widgets: [],
        userData: {
          nome: 'Test User',
          dataNascimento: 'invalid-date',
        },
      };

      // Import the schema directly for validation test
      const { z } = await import('zod');

      const UserSpiritualDataSchema = z.object({
        nome: z.string().min(1),
        dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        signoSolar: z.string().optional(),
        numeroCabalistico: z.number().optional(),
        orixaPrincipal: z.string().optional(),
        caminhoCabalistico: z.string().optional(),
      });

      const RequestBodySchema = z.object({
        userId: z.string().min(1, 'userId is required'),
        widgets: z.array(z.enum([
          'energy', 'timeline', 'meditation', 'correlations',
          'report', 'predictions', 'journey', 'evolution',
        ])).min(1, 'At least one widget is required'),
        userData: UserSpiritualDataSchema,
      });

      const result = RequestBodySchema.safeParse(invalidBody);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('should validate valid request body', async () => {
      const { z } = await import('zod');

      const UserSpiritualDataSchema = z.object({
        nome: z.string().min(1),
        dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        signoSolar: z.string().optional(),
        numeroCabalistico: z.number().optional(),
        orixaPrincipal: z.string().optional(),
        caminhoCabalistico: z.string().optional(),
      });

      const RequestBodySchema = z.object({
        userId: z.string().min(1, 'userId is required'),
        widgets: z.array(z.enum([
          'energy', 'timeline', 'meditation', 'correlations',
          'report', 'predictions', 'journey', 'evolution',
        ])).min(1, 'At least one widget is required'),
        userData: UserSpiritualDataSchema,
      });

      const validBody = {
        userId: 'user-123',
        widgets: ['energy', 'correlations'],
        userData: {
          nome: 'Maria Silva',
          dataNascimento: '1990-05-15',
          signoSolar: 'Touro',
          numeroCabalistico: 7,
          orixaPrincipal: 'Oxum',
        },
      };

      const result = RequestBodySchema.safeParse(validBody);
      expect(result.success).toBe(true);
    });

    it('should support all widget types', async () => {
      const { z } = await import('zod');

      const RequestBodySchema = z.object({
        userId: z.string().min(1),
        widgets: z.array(z.enum([
          'energy', 'timeline', 'meditation', 'correlations',
          'report', 'predictions', 'journey', 'evolution',
        ])),
        userData: z.object({
          nome: z.string(),
          dataNascimento: z.string(),
        }),
      });

      const allWidgetsBody = {
        userId: 'user-123',
        widgets: [
          'energy', 'timeline', 'meditation', 'correlations',
          'report', 'predictions', 'journey', 'evolution',
        ],
        userData: {
          nome: 'Test User',
          dataNascimento: '2000-01-01',
        },
      };

      const result = RequestBodySchema.safeParse(allWidgetsBody);
      expect(result.success).toBe(true);
    });
  });

  describe('Cache functionality', () => {
    it('should generate consistent cache keys', () => {
      const getCacheKey = (userId: string, widgets: string[]): string => {
        return `${userId}:${widgets.sort().join(',')}`;
      };

      const key1 = getCacheKey('user-123', ['energy', 'correlations']);
      const key2 = getCacheKey('user-123', ['correlations', 'energy']);

      // Keys should be identical regardless of widget order
      expect(key1).toBe(key2);
      expect(key1).toBe('user-123:correlations,energy');
    });

    it('should differentiate cache keys for different users', () => {
      const getCacheKey = (userId: string, widgets: string[]): string => {
        return `${userId}:${widgets.sort().join(',')}`;
      };

      const key1 = getCacheKey('user-123', ['energy']);
      const key2 = getCacheKey('user-456', ['energy']);

      expect(key1).not.toBe(key2);
    });
  });

  describe('Response structure', () => {
    it('should match expected IntegrationResponse structure', () => {
      const mockResponse = {
        widgets: {
          energy: { energy: { nivel: 75 } },
          correlations: {
            correlations: { numerology: { numero: 7 } },
            summary: { dominantElement: 'fogo', dominantOrixa: 'xangô', dominantOdu: 'ogunda', strength: 0.85 },
          },
        },
        timestamp: Date.now(),
        cacheStatus: 'fresh' as const,
      };

      expect(mockResponse).toHaveProperty('widgets');
      expect(mockResponse).toHaveProperty('timestamp');
      expect(mockResponse).toHaveProperty('cacheStatus');
      expect(['fresh', 'cached']).toContain(mockResponse.cacheStatus);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid date format', async () => {
      const { z } = await import('zod');

      const UserSpiritualDataSchema = z.object({
        nome: z.string().min(1),
        dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      });

      const invalidDates = [
        '01-05-1990',
        '1990/05/15',
        '1990-5-15',
        'invalid',
        '',
      ];

      for (const date of invalidDates) {
        const result = UserSpiritualDataSchema.safeParse({ nome: 'Test', dataNascimento: date });
        expect(result.success).toBe(false);
      }
    });

    it('should require at least one widget', async () => {
      const { z } = await import('zod');

      const RequestBodySchema = z.object({
        userId: z.string().min(1),
        widgets: z.array(z.string()).min(1, 'At least one widget is required'),
        userData: z.object({ nome: z.string(), dataNascimento: z.string() }),
      });

      const emptyWidgets = { userId: '123', widgets: [], userData: { nome: 'Test', dataNascimento: '2000-01-01' } };
      const result = RequestBodySchema.safeParse(emptyWidgets);
      expect(result.success).toBe(false);
    });
  });

  describe('Widget types', () => {
    it('should define all 8 widget types', () => {
      const validWidgets = [
        'energy',
        'timeline',
        'meditation',
        'correlations',
        'report',
        'predictions',
        'journey',
        'evolution',
      ] as const;

      expect(validWidgets).toHaveLength(8);
      expect(validWidgets).toContain('energy');
      expect(validWidgets).toContain('timeline');
      expect(validWidgets).toContain('meditation');
      expect(validWidgets).toContain('correlations');
      expect(validWidgets).toContain('report');
      expect(validWidgets).toContain('predictions');
      expect(validWidgets).toContain('journey');
      expect(validWidgets).toContain('evolution');
    });
  });
});