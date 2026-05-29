// Mock minimax module before importing
vi.mock('../../src/lib/ai/minimax', () => ({
  generateMinimaxResponse: vi.fn().mockResolvedValue({
    content: 'The Kabbalah and numerology traditions share wisdom as their common mystical root.',
    usage: { total_tokens: 50 },
  }),
}));

 import { DeepCorrelationEngine } from '../../src/lib/ai/deep-correlation-engine';
 import type { UserSpiritualData } from '../../src/lib/ai/types';
 import type {
   SpiritualCorrelation,
   CrossSystemPattern,
   EnergyHarmonyReport,
   SpiritualSource,
 } from '../../src/lib/ai/deep-correlation-engine';

describe('DeepCorrelationEngine', () => {
  const engine = new DeepCorrelationEngine();

  const mockUserData: UserSpiritualData = {
    id: 'test-123',
    nome: 'Test User',
    dataNascimento: '1990-01-15',
    numeroPessoal: 7,
    arcoPessoal: 3,
    odu: 'Ogbe',
    orixaRegente: 'Oxum',
    sefirotDominante: ['Keter', 'Chokhmah'],
    arcoMaior: [0, 1, 21],
    sign: 'Leo',
    houses: { '4': 10, '10': 15 },
  };

  describe('analyzeCorrelations', () => {
    it('should return array of correlations', () => {
      const correlations = engine.analyzeCorrelations(mockUserData);
      expect(Array.isArray(correlations)).toBe(true);
      expect(correlations.length).toBeGreaterThan(0);
    });

    it('should have valid correlation structure', () => {
      const correlations = engine.analyzeCorrelations(mockUserData);
      for (const corr of correlations) {
        expect(corr).toHaveProperty('source');
        expect(corr).toHaveProperty('target');
        expect(corr).toHaveProperty('correlation');
        expect(corr).toHaveProperty('explanation');
        expect(corr).toHaveProperty('shared_energy');
        expect(corr.correlation).toBeGreaterThanOrEqual(0);
        expect(corr.correlation).toBeLessThanOrEqual(1);
      }
    });

    it('should sort correlations by strength', () => {
      const correlations = engine.analyzeCorrelations(mockUserData);
      for (let i = 1; i < correlations.length; i++) {
        expect(correlations[i - 1].correlation).toBeGreaterThanOrEqual(correlations[i].correlation);
      }
    });
  });

  describe('findCrossSystemPatterns', () => {
    it('should return array of patterns', () => {
      const patterns = engine.findCrossSystemPatterns(mockUserData);
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should have valid pattern structure', () => {
      const patterns = engine.findCrossSystemPatterns(mockUserData);
      for (const pattern of patterns) {
        expect(pattern).toHaveProperty('name');
        expect(pattern).toHaveProperty('description');
        expect(pattern).toHaveProperty('strength');
        expect(pattern).toHaveProperty('involved_systems');
        expect(pattern).toHaveProperty('manifestations');
        expect(pattern.strength).toBeGreaterThanOrEqual(0);
        expect(pattern.strength).toBeLessThanOrEqual(1);
        expect(pattern.involved_systems.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should identify Light Bearer pattern for Keter/Chokhmah', () => {
      const patterns = engine.findCrossSystemPatterns(mockUserData);
      const lightBearer = patterns.find(p => p.name === 'Light Bearer');
      expect(lightBearer).toBeDefined();
    });
  });

  describe('calculateEnergyHarmony', () => {
    it('should return valid harmony report', () => {
      const report = engine.calculateEnergyHarmony(mockUserData);
      expect(report).toHaveProperty('overall_score');
      expect(report).toHaveProperty('system_harmonies');
      expect(report).toHaveProperty('dominant_energy');
      expect(report).toHaveProperty('balance_indicators');
      expect(report).toHaveProperty('recommendations');
    });

    it('should have valid overall score', () => {
      const report = engine.calculateEnergyHarmony(mockUserData);
      expect(report.overall_score).toBeGreaterThanOrEqual(0);
      expect(report.overall_score).toBeLessThanOrEqual(1);
    });

    it('should include all systems in harmonies', () => {
      const report = engine.calculateEnergyHarmony(mockUserData);
      const systems: SpiritualSource[] = ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'];
      for (const system of systems) {
        expect(system in report.system_harmonies).toBe(true);
      }
    });

    it('should have recommendations when conflicting systems exist', () => {
      const report = engine.calculateEnergyHarmony(mockUserData);
      if (report.balance_indicators.conflicting.length > 0) {
        expect(report.recommendations.length).toBeGreaterThan(0);
      }
    });
  });

  describe('explainCorrelation', () => {
    it('should return a string explanation', async () => {
      const correlation: SpiritualCorrelation = {
        source: 'kabbalah',
        target: 'sefirot',
        correlation: 0.8,
        explanation: '',
        shared_energy: 'wisdom',
      };
      const explanation = await engine.explainCorrelation(correlation);
      expect(typeof explanation).toBe('string');
      expect(explanation.length).toBeGreaterThan(0);
    });
  });

  describe('type exports', () => {
    it('should export SpiritualSource type', () => {
      const source: SpiritualSource = 'kabbalah';
      expect(source).toBe('kabbalah');
    });

    it('should export all required types', () => {
      const correlation: SpiritualCorrelation = {
        source: 'tarot',
        target: 'Arcana 0',
        correlation: 0.7,
        explanation: 'test',
        shared_energy: 'wisdom',
      };
      expect(correlation.source).toBe('tarot');

      const pattern: CrossSystemPattern = {
        name: 'Test',
        description: 'Test desc',
        strength: 0.8,
        involved_systems: ['kabbalah', 'numerology'],
        manifestations: ['test1', 'test2'],
      };
      expect(pattern.involved_systems).toHaveLength(2);

      const report: EnergyHarmonyReport = {
        overall_score: 0.75,
        system_harmonies: {
          kabbalah: 0.9,
          ifa: 0.7,
          candomble: 0.8,
          tarot: 0.85,
          astrology: 0.6,
          numerology: 0.75,
        },
        dominant_energy: 'Divine Light',
        balance_indicators: {
          harmonious: ['kabbalah-numerology'],
          conflicting: [],
          neutral: [],
        },
        recommendations: ['Test recommendation'],
      };
      expect(report.overall_score).toBe(0.75);
      expect(report.dominant_energy).toBe('Divine Light');
    });
  });
});
