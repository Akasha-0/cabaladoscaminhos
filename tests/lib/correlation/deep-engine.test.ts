import { describe, test, expect } from 'vitest';
import { getDayCorrelations } from '../../../src/lib/correlation/deep-engine';
describe('Deep', () => {
  test('basic', () => { expect(getDayCorrelations('segunda-feira')?.orixas).toContain('Omolu'); });
});
