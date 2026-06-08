import { describe, it, expect } from 'vitest';
import {
  getChakraMeanings,
  getChakraByIndex,
  getChakraByName,
} from '@/lib/chakra/meanings';

describe('chakra/meanings', () => {
  describe('getChakraMeanings', () => {
    it('returns array of 7 chakras', () => {
      const chakras = getChakraMeanings();
      expect(chakras).toHaveLength(7);
    });

    it('each chakra has required fields', () => {
      const chakras = getChakraMeanings();
      for (const chakra of chakras) {
        expect(chakra.name).toBeTruthy();
        expect(chakra.namePt).toBeTruthy();
        expect(chakra.sanskrit).toBeTruthy();
        expect(chakra.element).toBeTruthy();
        expect(chakra.color).toBeTruthy();
        expect(chakra.mantra).toBeTruthy();
        expect(Array.isArray(chakra.qualities)).toBe(true);
        expect(Array.isArray(chakra.governs)).toBe(true);
      }
    });

    it('first chakra is Muladhara (root)', () => {
      const root = getChakraByIndex(0);
      expect(root?.name).toBe('Muladhara');
      expect(root?.element).toBe('Terra');
      expect(root?.color).toBe('Vermelho');
    });

    it('seventh chakra is Sahasrara (crown)', () => {
      const crown = getChakraByIndex(6);
      expect(crown?.name).toBe('Sahasrara');
      expect(crown?.element).toBe('Cosmos');
      expect(crown?.color).toBe('Violeta/Branco');
    });
  });

  describe('getChakraByIndex', () => {
    it('returns chakra at valid index', () => {
      expect(getChakraByIndex(0)?.name).toBe('Muladhara');
      expect(getChakraByIndex(3)?.name).toBe('Anahata');
      expect(getChakraByIndex(6)?.name).toBe('Sahasrara');
    });

    it('returns undefined for out-of-bounds index', () => {
      expect(getChakraByIndex(-1)).toBeUndefined();
      expect(getChakraByIndex(7)).toBeUndefined();
      expect(getChakraByIndex(100)).toBeUndefined();
    });
  });

  describe('getChakraByName', () => {
    it('finds by name (case insensitive)', () => {
      expect(getChakraByName('Muladhara')?.element).toBe('Terra');
      expect(getChakraByName('muladhara')?.element).toBe('Terra');
      expect(getChakraByName('MULADHARA')?.element).toBe('Terra');
    });

    it('finds by namePt', () => {
      expect(getChakraByName('Raiz')?.name).toBe('Muladhara');
      expect(getChakraByName('Coração')?.name).toBe('Anahata');
      expect(getChakraByName('Coroa')?.name).toBe('Sahasrara');
    });

    it('finds by nameEn', () => {
      expect(getChakraByName('Root')?.name).toBe('Muladhara');
      expect(getChakraByName('Heart')?.name).toBe('Anahata');
      expect(getChakraByName('Crown')?.name).toBe('Sahasrara');
    });

    it('returns undefined for unknown name', () => {
      expect(getChakraByName('NonExistentChakra')).toBeUndefined();
      expect(getChakraByName('xyz')).toBeUndefined();
    });
  });
});

describe('chakra correlations (spiritual)', () => {
  it('correlates Muladhara with Malkuth (Cabala) - Terra/Segurança', () => {
    const root = getChakraByIndex(0);
    expect(root?.qualities).toContain('Segurança');
    expect(root?.governs).toContain('Sobrevivência');
  });

  it('correlates Svadhisthana with Yesod (Cabala) - Água/Emoções', () => {
    const sacral = getChakraByIndex(1);
    expect(sacral?.qualities).toContain('Criatividade');
    expect(sacral?.governs).toContain('Sexualidade');
  });

  it('correlates Manipura with Geburah/Tiphereth - Fogo/Poder pessoal', () => {
    const solar = getChakraByIndex(2);
    expect(solar?.qualities).toContain('Poder pessoal');
    expect(solar?.governs).toContain('Digestão');
  });

  it('correlates Anahata with Tiphereth - Ar/Amor incondicional', () => {
    const heart = getChakraByIndex(3);
    expect(heart?.qualities).toContain('Amor incondicional');
    expect(heart?.governs).toContain('Coração');
  });

  it('correlates Vishuddha with Hod - Éter/Comunicação', () => {
    const throat = getChakraByIndex(4);
    expect(throat?.qualities).toContain('Comunicação');
    expect(throat?.governs).toContain('Garganta');
  });

  it('correlates Ajna with Binah/Daath - Luz/Intuição', () => {
    const thirdEye = getChakraByIndex(5);
    expect(thirdEye?.qualities).toContain('Intuição');
    expect(thirdEye?.governs).toContain('Hipófise');
  });

  it('correlates Sahasrara with Kether - Cosmos/Conexão divina', () => {
    const crown = getChakraByIndex(6);
    expect(crown?.qualities).toContain('Conexão divina');
    expect(crown?.governs).toContain('Pineal');
  });
});

describe('chakra element progression', () => {
  it('elements follow ascending spiritual progression', () => {
    const chakras = getChakraMeanings();
    const elements = chakras.map(c => c.element);
    // Terra → Água → Fogo → Ar → Éter → Luz → Cosmos
    expect(elements[0]).toBe('Terra');
    expect(elements[1]).toBe('Água');
    expect(elements[2]).toBe('Fogo');
    expect(elements[3]).toBe('Ar');
    expect(elements[4]).toBe('Éter');
    expect(elements[5]).toBe('Luz');
    expect(elements[6]).toBe('Cosmos');
  });
});

describe('chakra color progression', () => {
  it('colors follow spectral/spiritual progression', () => {
    const chakras = getChakraMeanings();
    expect(chakras[0].color).toBe('Vermelho');
    expect(chakras[1].color).toBe('Laranja');
    expect(chakras[2].color).toBe('Amarelo');
    expect(chakras[3].color).toBe('Verde');
    expect(chakras[4].color).toBe('Azul');
    expect(chakras[5].color).toBe('Índigo');
    expect(chakras[6].color).toBe('Violeta/Branco');
  });
});

describe('chakra mantras', () => {
  it('each chakra has a seed mantra (bija mantra)', () => {
    const chakras = getChakraMeanings();
    for (const chakra of chakras) {
      expect(chakra.mantra.length).toBeGreaterThan(0);
      expect(chakra.mantra).toMatch(/^[A-Z]+(\s|$)/); // Sanskrit seed sounds in caps
    }
  });
});
