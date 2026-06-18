import { describe, it, expect } from 'vitest';
import {
  findCorrelations,
  getIchingsByIfa,
  getIfasByIching,
  getSefirotByTrigram,
  getFullCorrelation,
  IFA_ODUS,
  ifaToIchingMap,
  ichingToIfaMap,
  ICHING_NAMES,
} from './correlation-map';

describe('Correlation Map - Validação de Consistência', () => {
  // ============================================
  // TESTES: Hexagramas têm pelo menos uma correlação
  // ============================================
  it('hexagramas mapeados em ichingToIfaMap têm correlações', () => {
    const mappedHexagrams = Array.from(ichingToIfaMap.keys());
    expect(mappedHexagrams.length).toBeGreaterThan(0);

    // Verificar que cada hexagrama mapeado tem Ifás
    for (const hex of mappedHexagrams) {
      const ifas = getIfasByIching(hex);
      expect(ifas.length).toBeGreaterThan(0);
    }
  });

  it('hexagrama 1 (Qián) tem correlação com Oyekun', () => {
    const correlation = getFullCorrelation(1);
    expect(correlation.ifas).toContain('Oyekun');
  });

  it('hexagrama 64 não tem correlação (órfão)', () => {
    const correlation = getFullCorrelation(64);
    expect(correlation.ifas.length).toBe(0);
    expect(correlation.strength).toBe('weak');
  });

  // ============================================
  // TESTES: Odús têm pelo menos uma correlação
  // ============================================
  it('cada Odú de Ifá tem pelo menos um hexagrama correlacionado', () => {
    const orphanOdus: string[] = [];

    for (const odu of IFA_ODUS) {
      const hexagrams = getIchingsByIfa(odu);
      if (hexagrams.length === 0) {
        orphanOdus.push(odu);
      }
    }

    expect(orphanOdus).toEqual([]);
  });

  it('todos os 15 Odús estão mapeados no ifaToIchingMap', () => {
    for (const odu of IFA_ODUS) {
      expect(ifaToIchingMap[odu]).toBeDefined();
      expect(ifaToIchingMap[odu].length).toBeGreaterThan(0);
    }
  });

  // ============================================
  // TESTES: findCorrelations para cada tradição
  // ============================================
  it('findCorrelations retorna correlações para Ifá Oyekun', () => {
    const correlations = findCorrelations('ifa', 'Oyekun');
    expect(correlations.length).toBeGreaterThan(0);
    expect(correlations[0].source.tradition).toBe('ifa');
  });

  it('findCorrelations retorna correlações para I Ching hexagrama 1', () => {
    const correlations = findCorrelations('iching', 1);
    expect(correlations.length).toBeGreaterThan(0);
    expect(correlations[0].target.tradition).toBe('ifa');
  });

  it('findCorrelations para Odú inválido retorna array vazio', () => {
    const correlations = findCorrelations('ifa', 'Iba' as any);
    expect(correlations).toEqual([]);
  });

  // ============================================
  // TESTES: getSefirotByTrigram para trigramas 1-8
  // ============================================
  it('trigrama 1 (Qián/Céu) tem Sefirot corretos', () => {
    const sefirot = getSefirotByTrigram(1);
    expect(sefirot).toContain('Keter');
    expect(sefirot).toContain('Chokhmah');
  });

  it('trigrama 2 (Kūn/Terra) tem Sefirot corretos', () => {
    const sefirot = getSefirotByTrigram(2);
    expect(sefirot).toContain('Binah');
    expect(sefirot).toContain('Malkuth');
  });

  it('trigrama 3 (Zhēn/Trovao) tem Sefirot corretos', () => {
    const sefirot = getSefirotByTrigram(3);
    expect(sefirot.length).toBeGreaterThan(0);
  });

  it('trigrama 8 (Dui/Lago) tem Sefirot corretos', () => {
    const sefirot = getSefirotByTrigram(8);
    expect(sefirot).toContain('Hod');
  });

  it('trigrama inválido (0 ou 9) retorna array vazio', () => {
    expect(getSefirotByTrigram(0)).toEqual([]);
    expect(getSefirotByTrigram(9)).toEqual([]);
  });

  // ============================================
  // TESTES: Consistência dos mapas
  // ============================================
  it('mapa ichingToIfaMap é inverso consistente de ifaToIchingMap', () => {
    for (const [hex, ifas] of ichingToIfaMap.entries()) {
      for (const odu of ifas) {
        const reverseHexagrams = getIchingsByIfa(odu as any);
        expect(reverseHexagrams).toContain(hex);
      }
    }
  });

  it('getFullCorrelation retorna estrutura completa válida', () => {
    const result = getFullCorrelation(1);

    expect(result).toHaveProperty('hexagram');
    expect(result).toHaveProperty('iching');
    expect(result).toHaveProperty('iching.name');
    expect(result).toHaveProperty('ifas');
    expect(result).toHaveProperty('sefirot');
    expect(result).toHaveProperty('trigrams');
    expect(result).toHaveProperty('strength');
    expect(result.hexagram).toBe(1);
  });

  it('getFullCorrelation com hexagrama inválido retorna valores padrão', () => {
    const result = getFullCorrelation(0);

    expect(result.hexagram).toBe(0);
    expect(result.ifas).toEqual([]);
    expect(result.strength).toBe('weak');
  });

  it('getFullCorrelation para hexagrama 65 retorna valores padrão', () => {
    const result = getFullCorrelation(65);

    expect(result.ifas).toEqual([]);
    expect(result.strength).toBe('weak');
  });

  it('getFullCorrelation calcula Sefirot corretamente a partir dos Ifás', () => {
    const result = getFullCorrelation(11); // Tài (Paz) - correlaciona com Oyekun e Osa

    expect(result.sefirot.length).toBeGreaterThan(0);
    // Oyekun tem [1, 10] e Osa tem [1, 10]
    expect(result.sefirot).toContain(1); // Keter
    expect(result.sefirot).toContain(10); // Malkuth
  });

  // ============================================
  // TESTES: Nomes dos Hexagramas
  // ============================================
  it('ICHING_NAMES contém todos os 64 hexagramas', () => {
    for (let i = 1; i <= 64; i++) {
      expect(ICHING_NAMES[i]).toBeDefined();
      expect(typeof ICHING_NAMES[i]).toBe('string');
    }
  });

  it('ICHING_NAMES tem formato correto (chinês + tradução)', () => {
    expect(ICHING_NAMES[1]).toContain('Qián');
    expect(ICHING_NAMES[1]).toContain('Criação');
  });
});
