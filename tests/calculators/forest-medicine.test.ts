import { describe, it, expect } from 'vitest';
import { buildForestMedicineMap } from '@/lib/calculators/forest-medicine';

describe('forest-medicine calculator', () => {
  it('should return default protocol when date is invalid', () => {
    const result = buildForestMedicineMap('invalid-date', 'Test Client');
    expect(result.ayahuascaProtocol.name).toBe('Protocolo de Alinhamento Diário');
    expect(result.recomendedRapes[0].name).toBe('Rapé Tsunu');
  });

  it('should calculate correct protocol and recommended rapes for Eliane Simão de Almeida (1986-08-20)', () => {
    const result = buildForestMedicineMap('1986-08-20', 'Eliane Simão de Almeida');

    // Odu: 20+8 = 28 -> 2+8 = 10.
    // Personal Year in 2026: 20+8+1 = 29 -> 11 -> 2.
    // Name Length: 20 (even)
    expect(result.ayahuascaProtocol.name).toBe('Protocolo de Alinhamento Diário');
    expect(result.recomendedRapes).toHaveLength(2);
    expect(result.recomendedRapes[0].name).toBe('Rapé Tsunu Tradicional');
    expect(result.recomendedRapes[1].name).toBe('Rapé de Alecrim');

    // Month is 8, so hasFamilyKarmicChallenge is true
    expect(result.spiritualWarning).toContain('bloqueios kármicos associados a dinâmicas familiares');
    expect(result.spiritualWarning).not.toContain('Ori Quente');
  });

  it('should determine Ori Quente warning and correct rapé for birthOdu = 9 (Ossá) and day divisible by 3', () => {
    const result = buildForestMedicineMap('1999-09-09', 'Test User');

    // Odu: 9+9 = 18 -> 9 (Ossá)
    // Day: 9 (divisible by 3)
    // Name Length: 8 (even)
    expect(result.recomendedRapes[0].name).toBe('Rapé Tsunu (Sabedoria da Floresta)');
    expect(result.recomendedRapes[1].name).toBe('Rapé de Alecrim');

    expect(result.spiritualWarning).toContain('Vigilância contra o "Ori Quente"');
    expect(result.spiritualWarning).toContain('bloqueios kármicos associados a dinâmicas familiares');
  });

  it('should recommend correct Ayahuasca protocol for Personal Year 9', () => {
    // We want Day + Month + 1 (reduced 2026) = 9
    // E.g., Day = 3, Month = 5 (3+5+1 = 9)
    const result = buildForestMedicineMap('1990-05-03', 'John Doe');
    expect(result.ayahuascaProtocol.name).toBe('Protocolo de Travessia (Ayahuasca Microdosing)');
    expect(result.ayahuascaProtocol.dosage).toContain('3 gotas à noite');
  });

  it('should recommend correct Ayahuasca protocol for Personal Year 7', () => {
    // Day + Month + 1 = 7 -> Day = 1, Month = 5 (1+5+1 = 7)
    const result = buildForestMedicineMap('1990-05-01', 'John Doe');
    expect(result.ayahuascaProtocol.name).toBe('Protocolo de Visão e Intuição (Ayahuasca Microdosing)');
  });
});
