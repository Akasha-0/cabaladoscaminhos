/**
 * Meditation Generator Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { generateMeditation } from '@/lib/ai/meditation';

describe('generateMeditation', () => {
  describe('duration validation', () => {
    it('accepts minimum duration of 1 minute', () => {
      const result = generateMeditation(1, 'cura');
      expect(result.duration).toBe(1);
    });

    it('accepts maximum duration of 60 minutes', () => {
      const result = generateMeditation(60, 'cura');
      expect(result.duration).toBe(60);
    });

    it('accepts valid intermediate durations', () => {
      const result = generateMeditation(15, 'amor');
      expect(result.duration).toBe(15);
    });

    it('rejects duration below 1 minute', () => {
      expect(() => generateMeditation(0, 'cura')).toThrow('Duration must be between 1 and 60 minutes');
    });

    it('rejects duration above 60 minutes', () => {
      expect(() => generateMeditation(61, 'cura')).toThrow('Duration must be between 1 and 60 minutes');
    });

    it('rejects negative duration', () => {
      expect(() => generateMeditation(-1, 'cura')).toThrow('Duration must be between 1 and 60 minutes');
    });
  });

  describe('theme validation', () => {
    it('accepts cura theme', () => {
      const result = generateMeditation(5, 'cura');
      expect(result.theme).toBe('cura');
    });

    it('accepts proteção theme', () => {
      const result = generateMeditation(5, 'proteção');
      expect(result.theme).toBe('proteção');
    });

    it('accepts prosperidade theme', () => {
      const result = generateMeditation(5, 'prosperidade');
      expect(result.theme).toBe('prosperidade');
    });

    it('accepts amor theme', () => {
      const result = generateMeditation(5, 'amor');
      expect(result.theme).toBe('amor');
    });

    it('accepts sabedoria theme', () => {
      const result = generateMeditation(5, 'sabedoria');
      expect(result.theme).toBe('sabedoria');
    });

    it('rejects invalid theme', () => {
      expect(() => generateMeditation(5, 'invalid' as never)).toThrow('Invalid theme');
    });

    it('rejects empty string theme', () => {
      expect(() => generateMeditation(5, '' as never)).toThrow('Invalid theme');
    });
  });

  describe('cura theme output', () => {
    it('returns correct structure', () => {
      const result = generateMeditation(5, 'cura');
      expect(result).toHaveProperty('theme');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('phases');
      expect(result.phases).toHaveProperty('intro');
      expect(result.phases).toHaveProperty('breathing');
      expect(result.phases).toHaveProperty('visualization');
      expect(result.phases).toHaveProperty('affirmation');
      expect(result.phases).toHaveProperty('close');
    });

    it('contains healing-related content in visualization', () => {
      const result = generateMeditation(5, 'cura');
      expect(result.phases.visualization).toContain('luz dourada');
    });

    it('contains healing-related content in affirmation', () => {
      const result = generateMeditation(5, 'cura');
      expect(result.phases.affirmation).toContain('cure');
    });

    it('contains theme name in intro', () => {
      const result = generateMeditation(5, 'cura');
      expect(result.phases.intro).toContain('Cura');
    });
  });

  describe('proteção theme output', () => {
    it('contains shield imagery in visualization', () => {
      const result = generateMeditation(5, 'proteção');
      expect(result.phases.visualization).toContain('escudo');
    });

    it('contains protection-related affirmation', () => {
      const result = generateMeditation(5, 'proteção');
      expect(result.phases.affirmation).toContain('proteção');
    });

    it('contains theme name in intro', () => {
      const result = generateMeditation(5, 'proteção');
      expect(result.phases.intro).toContain('Proteção');
    });
  });

  describe('prosperidade theme output', () => {
    it('contains abundance imagery in visualization', () => {
      const result = generateMeditation(5, 'prosperidade');
      expect(result.phases.visualization).toContain('abundância');
    });

    it('contains prosperity-related affirmation', () => {
      const result = generateMeditation(5, 'prosperidade');
      expect(result.phases.affirmation).toContain('prosperidade');
    });

    it('contains theme name in intro', () => {
      const result = generateMeditation(5, 'prosperidade');
      expect(result.phases.intro).toContain('Prosperidade');
    });
  });

  describe('amor theme output', () => {
    it('contains unconditional love imagery in visualization', () => {
      const result = generateMeditation(5, 'amor');
      expect(result.phases.visualization).toContain('amor');
    });

    it('contains love-related affirmation', () => {
      const result = generateMeditation(5, 'amor');
      expect(result.phases.affirmation).toContain('amor');
    });

    it('contains theme name in intro', () => {
      const result = generateMeditation(5, 'amor');
      expect(result.phases.intro).toContain('Amor');
    });
  });

  describe('sabedoria theme output', () => {
    it('contains intuition/flame imagery in visualization', () => {
      const result = generateMeditation(5, 'sabedoria');
      expect(result.phases.visualization).toContain('intuição');
    });

    it('contains wisdom-related affirmation', () => {
      const result = generateMeditation(5, 'sabedoria');
      expect(result.phases.affirmation).toContain('sabedoria');
    });

    it('contains theme name in intro', () => {
      const result = generateMeditation(5, 'sabedoria');
      expect(result.phases.intro).toContain('Sabedoria');
    });
  });

  describe('duration-based output differences', () => {
    it('short meditation (≤5 min) has simpler breathing section', () => {
      const short = generateMeditation(5, 'cura');
      const long = generateMeditation(15, 'cura');

      // Short meditations have single breathing section
      expect(short.phases.breathing).not.toContain('Fase 1');
      expect(short.phases.breathing).not.toContain('Fase 2');

      // Long meditations have multiple phases
      expect(long.phases.breathing).toContain('Fase');
    });

    it('short meditation has single visualization section', () => {
      const result = generateMeditation(5, 'cura');
      expect(result.phases.visualization).toContain('Visualização');
      expect(result.phases.visualization).not.toContain('Guiada');
    });

    it('long meditation has guided visualization section', () => {
      const result = generateMeditation(15, 'cura');
      expect(result.phases.visualization).toContain('Visualização');
      expect(result.phases.visualization).toContain('Guiada');
    });

    it('close phase is present in all durations', () => {
      const short = generateMeditation(3, 'cura');
      const long = generateMeditation(30, 'cura');
      const medium = generateMeditation(10, 'amor');

      expect(short.phases.close).toContain('Encerramento');
      expect(long.phases.close).toContain('Encerramento');
      expect(medium.phases.close).toContain('Encerramento');
    });
  });

  describe('breathing patterns', () => {
    it('contains breathing instructions', () => {
      const result = generateMeditation(5, 'cura');
      expect(result.phases.breathing).toContain('Respiração');
      expect(result.phases.breathing).toContain('Inspire');
      expect(result.phases.breathing).toContain('Expire');
    });

    it('contains hold instruction', () => {
      const result = generateMeditation(5, 'cura');
      expect(result.phases.breathing).toContain('Segure');
    });
  });

  describe('complete script structure', () => {
    it('returns all required phases for short meditation', () => {
      const result = generateMeditation(3, 'cura');
      expect(result.phases.intro).toBeTruthy();
      expect(result.phases.breathing).toBeTruthy();
      expect(result.phases.visualization).toBeTruthy();
      expect(result.phases.affirmation).toBeTruthy();
      expect(result.phases.close).toBeTruthy();
    });

    it('returns all required phases for long meditation', () => {
      const result = generateMeditation(45, 'sabedoria');
      expect(result.phases.intro).toBeTruthy();
      expect(result.phases.breathing).toBeTruthy();
      expect(result.phases.visualization).toBeTruthy();
      expect(result.phases.affirmation).toBeTruthy();
      expect(result.phases.close).toBeTruthy();
    });

    it('phases contain non-empty strings', () => {
      const result = generateMeditation(10, 'amor');
      expect(result.phases.intro.length).toBeGreaterThan(0);
      expect(result.phases.breathing.length).toBeGreaterThan(0);
      expect(result.phases.visualization.length).toBeGreaterThan(0);
      expect(result.phases.affirmation.length).toBeGreaterThan(0);
      expect(result.phases.close.length).toBeGreaterThan(0);
    });
  });
});
