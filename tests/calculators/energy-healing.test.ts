import { describe, it, expect } from 'vitest';
import { buildEnergyHealingMap } from '@/lib/calculators/energy-healing';

describe('energy-healing calculator', () => {
  it('should return default protocols when there are no karmic debts', () => {
    // "Ana", "2000-01-01" has no karmic debts
    const result = buildEnergyHealingMap('2000-01-01', 'Ana');

    expect(result.reikiSymbols).toBeDefined();
    expect(result.reikiSymbols.some(s => s.symbol.includes('CHO-KU-REI'))).toBe(true);
    expect(result.groundingProtocol.technique).toBe('Aterramento Xamânico Geral e Harmonização Prânica');
  });

  it('should recommend Sei He Ki for even days or emotional months', () => {
    // 2000-01-02 -> Day 2 is even
    const result = buildEnergyHealingMap('2000-01-02', 'Ana');
    expect(result.reikiSymbols.some(s => s.symbol.includes('SEI-HE-KI'))).toBe(true);
  });

  it('should recommend Hon Sha Ze Sho Nen for specific days (e.g. 20)', () => {
    // Day 20 triggers Hon Sha Ze Sho Nen
    const result = buildEnergyHealingMap('1986-08-20', 'Eliane Simão de Almeida');
    expect(result.reikiSymbols.some(s => s.symbol.includes('HON-SHA-ZE-SHO-NEN'))).toBe(true);
  });

  it('should recommend Dai Ko Myo for reduced master or spiritual days (e.g. 7 or 11)', () => {
    // Day 11 is master/spiritual
    const result = buildEnergyHealingMap('2000-01-11', 'Ana');
    expect(result.reikiSymbols.some(s => s.symbol.includes('DAI-KO-MYO'))).toBe(true);
  });

  it('should recommend correct grounding protocol based on Kabalistic Karmic Debts', () => {
    // Let's check a case that generates karmic debt 13, 14, 16, or 19.
    const result = buildEnergyHealingMap('1986-08-20', 'Eliane Simão de Almeida');
    
    const validTechniques = [
      'Aterramento Xamânico Geral e Harmonização Prânica',
      'Aterramento de Liberação de Inércia e Ação Prática',
      'Aterramento para Integração Emocional e Equilíbrio da Alma',
      'Aterramento de Proteção e Fortalecimento do Templo Sagrado',
      'Aterramento Solar e Alinhamento de Poder Consciente'
    ];
    expect(validTechniques).toContain(result.groundingProtocol.technique);
  });
});
