/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { formatOduSection, formatOrixaSection } from '@/lib/pdf/mapa-export';

describe('Mapa PDF Export', () => {
  describe('formatOduSection', () => {
    it('formats Ogbe with orixas', () => {
      const result = formatOduSection('Ogbe');
      expect(result).toContain('Ogbe');
      expect(result).toContain('Exu');
      expect(result).toContain('Quizilas');
    });

    it('formats Oyeku correctly', () => {
      const result = formatOduSection('Oyeku');
      expect(result).toContain('Oyeku');
      expect(result).toContain('Oxum');
    });

    it('includes preceitos', () => {
      expect(formatOduSection('Ogbe')).toContain('Preceitos:');
    });

    it('handles unknown odu with defaults', () => {
      const result = formatOduSection('Unknown');
      expect(result).toContain('Unknown');
      expect(result).toContain('Obatalá');
    });
  });

  describe('formatOrixaSection', () => {
    it('formats Oxalá with colors and herbs', () => {
      const result = formatOrixaSection('Oxalá');
      expect(result).toContain('Oxalá');
      expect(result).toContain('branco');
      expect(result).toContain('boldo');
    });

    it('formats Iemanjá with correct data', () => {
      const result = formatOrixaSection('Iemanjá');
      expect(result).toContain('Iemanjá');
      expect(result).toContain('azul');
      expect(result).toContain('Oia!');
    });

    it('formats Ogum with peppers and greeting', () => {
      const result = formatOrixaSection('Ogum');
      expect(result).toContain('Ogum');
      expect(result).toContain('pimenta');
    });

    it('handles unknown orixá with defaults', () => {
      const result = formatOrixaSection('Unknown');
      expect(result).toContain('Unknown');
      expect(result).toContain('branco');
    });
  });
});
