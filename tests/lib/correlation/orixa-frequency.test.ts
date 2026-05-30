import { describe, it, expect } from 'vitest';
import {
  getOrixaFrequency,
  getFrequencyOrixa,
  getAllOrixaFrequencies,
  getElementByOrixa,
  getChakraByOrixa,
  getDayByOrixa,
  getColorByOrixa,
  getHealingByOrixa,
  getOrixasByFrequency,
  getOrixasByElement,
  getOrixasByDay,
  getAllElements,
  ORIXA_FREQUENCY_MAP,
  SOLFEGGIO_FREQUENCIES,
  ALL_ORIXAS,
} from '@/lib/correlation/orixa-frequency';

describe('OrixaFrequency Correlation', () => {
  describe('getOrixaFrequency', () => {
    it('should return the full mapping for Oxum', () => {
      const result = getOrixaFrequency('Oxum');
      expect(result).not.toBeNull();
      expect(result?.orixa).toBe('Oxum');
      expect(result?.frequencia).toBe(417);
      expect(result?.elemento).toBe('Água');
      expect(result?.chakra).toBe('2º Sacro (Svadhisthana)');
    });

    it('should return the full mapping for Xangô', () => {
      const result = getOrixaFrequency('Xangô');
      expect(result).not.toBeNull();
      expect(result?.orixa).toBe('Xangô');
      expect(result?.frequencia).toBe(528);
      expect(result?.elemento).toBe('Fogo');
      expect(result?.chakra).toBe('3º Plexo Solar (Manipura)');
    });

    it('should be case-insensitive', () => {
      const lower = getOrixaFrequency('oxum');
      const upper = getOrixaFrequency('OXUM');
      const title = getOrixaFrequency('Oxum');
      expect(lower).toEqual(title);
      expect(upper).toEqual(title);
    });

    it('should return null for unknown Orixá', () => {
      const result = getOrixaFrequency('UnknownOrixa');
      expect(result).toBeNull();
    });

    it('should handle whitespace variations', () => {
      const result = getOrixaFrequency('  Xangô  ');
      expect(result?.orixa).toBe('Xangô');
    });
  });

  describe('getFrequencyOrixa', () => {
    it('should return frequency 396 for Oxalufã', () => {
      expect(getFrequencyOrixa('Oxalufã')).toBe(396);
    });

    it('should return frequency 417 for Oxum', () => {
      expect(getFrequencyOrixa('Oxum')).toBe(417);
    });

    it('should return frequency 528 for Xangô', () => {
      expect(getFrequencyOrixa('Xangô')).toBe(528);
    });

    it('should return frequency 639 for Oxóssi', () => {
      expect(getFrequencyOrixa('Oxóssi')).toBe(639);
    });

    it('should return frequency 741 for Iansã', () => {
      expect(getFrequencyOrixa('Iansã')).toBe(741);
    });

    it('should return frequency 852 for Oxumaré', () => {
      expect(getFrequencyOrixa('Oxumaré')).toBe(852);
    });

    it('should return frequency 963 for Ori', () => {
      expect(getFrequencyOrixa('Ori')).toBe(963);
    });

    it('should return null for unknown Orixá', () => {
      expect(getFrequencyOrixa('Não Existe')).toBeNull();
    });
  });

  describe('getAllOrixaFrequencies', () => {
    it('should return all 14 Orixá mappings', () => {
      const all = getAllOrixaFrequencies();
      expect(all.length).toBe(14);
    });

    it('should include all expected Orixás', () => {
      const all = getAllOrixaFrequencies();
      const orixas = all.map((m) => m.orixa);
      expect(orixas).toContain('Oxalufã');
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Oxóssi');
      expect(orixas).toContain('Iansã');
      expect(orixas).toContain('Oxumaré');
      expect(orixas).toContain('Ori');
    });

    it('should return frozen objects', () => {
      const all = getAllOrixaFrequencies();
      all.forEach((mapping) => {
        expect(Object.isFrozen(mapping)).toBe(true);
      });
    });
  });

  describe('ORIXA_FREQUENCY_MAP', () => {
    it('should have 14 entries', () => {
      expect(Object.keys(ORIXA_FREQUENCY_MAP).length).toBe(14);
    });

    it('should have valid frequency values for all entries', () => {
      Object.values(ORIXA_FREQUENCY_MAP).forEach((mapping) => {
        expect(SOLFEGGIO_FREQUENCIES).toContain(mapping.frequencia);
      });
    });

    it('should have healing applications for all entries', () => {
      Object.values(ORIXA_FREQUENCY_MAP).forEach((mapping) => {
        expect(mapping.aplicacao_healing).toBeDefined();
        expect(mapping.aplicacao_healing.fisico).toBeTruthy();
        expect(mapping.aplicacao_healing.emocional).toBeTruthy();
        expect(mapping.aplicacao_healing.mental_espiritual).toBeTruthy();
        expect(mapping.aplicacao_healing.pratica_recomendada).toBeTruthy();
      });
    });
  });

  describe('SOLFEGGIO_FREQUENCIES', () => {
    it('should contain the 7 standard Solfeggio frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toEqual([396, 417, 528, 639, 741, 852, 963]);
    });
  });

  describe('ALL_ORIXAS', () => {
    it('should contain 14 unique Orixás', () => {
      expect(ALL_ORIXAS.length).toBe(14);
    });

    it('should contain expected Orixás', () => {
      expect(ALL_ORIXAS).toContain('Oxalufã');
      expect(ALL_ORIXAS).toContain('Omulu');
      expect(ALL_ORIXAS).toContain('Oxum');
      expect(ALL_ORIXAS).toContain('Iemanjá');
    });
  });

  describe('getElementByOrixa', () => {
    it('should return Terra for Oxalufã', () => {
      expect(getElementByOrixa('Oxalufã')).toBe('Terra');
    });

    it('should return Água for Oxum', () => {
      expect(getElementByOrixa('Oxum')).toBe('Água');
    });

    it('should return Fogo for Xangô', () => {
      expect(getElementByOrixa('Xangô')).toBe('Fogo');
    });

    it('should return Ar for Iansã', () => {
      expect(getElementByOrixa('Iansã')).toBe('Ar');
    });

    it('should return Éter for Oxumaré', () => {
      expect(getElementByOrixa('Oxumaré')).toBe('Éter');
    });

    it('should return null for unknown Orixá', () => {
      expect(getElementByOrixa('Não Existe')).toBeNull();
    });
  });

  describe('getChakraByOrixa', () => {
    it('should return first chakra for Oxalufã', () => {
      expect(getChakraByOrixa('Oxalufã')).toBe('1º Básico (Muladhara)');
    });

    it('should return seventh chakra for Ori', () => {
      expect(getChakraByOrixa('Ori')).toBe('7º Coronário (Sahasrara)');
    });

    it('should return null for unknown Orixá', () => {
      expect(getChakraByOrixa('Não Existe')).toBeNull();
    });
  });

  describe('getDayByOrixa', () => {
    it('should return Segunda-feira for Oxalufã', () => {
      expect(getDayByOrixa('Oxalufã')).toBe('Segunda-feira');
    });

    it('should return Sábado for Oxum', () => {
      expect(getDayByOrixa('Oxum')).toBe('Sábado');
    });

    it('should return null for unknown Orixá', () => {
      expect(getDayByOrixa('Não Existe')).toBeNull();
    });
  });

  describe('getColorByOrixa', () => {
    it('should return Branco for Oxalufã', () => {
      expect(getColorByOrixa('Oxalufã')).toBe('Branco');
    });

    it('should return Vermelho for Xangô', () => {
      expect(getColorByOrixa('Xangô')).toBe('Vermelho');
    });

    it('should return Arco-íris for Oxumaré', () => {
      expect(getColorByOrixa('Oxumaré')).toBe('Arco-íris');
    });

    it('should return null for unknown Orixá', () => {
      expect(getColorByOrixa('Não Existe')).toBeNull();
    });
  });

  describe('getHealingByOrixa', () => {
    it('should return healing application for Oxum', () => {
      const healing = getHealingByOrixa('Oxum');
      expect(healing).not.toBeNull();
      expect(healing?.fisico).toContain('Hidrata');
      expect(healing?.emocional).toContain('Libera');
    });

    it('should return healing application for Iansã', () => {
      const healing = getHealingByOrixa('Iansã');
      expect(healing).not.toBeNull();
      expect(healing?.pratica_recomendada).toContain('Cantos');
    });

    it('should return null for unknown Orixá', () => {
      expect(getHealingByOrixa('Não Existe')).toBeNull();
    });
  });

  describe('getOrixasByFrequency', () => {
    it('should return Oxalufã and Omulu for 396 Hz', () => {
      const orixas = getOrixasByFrequency(396);
      expect(orixas.length).toBe(2);
      expect(orixas.map((m) => m.orixa)).toContain('Oxalufã');
      expect(orixas.map((m) => m.orixa)).toContain('Omulu');
    });

    it('should return Oxum and Iemanjá for 417 Hz', () => {
      const orixas = getOrixasByFrequency(417);
      expect(orixas.length).toBe(2);
      expect(orixas.map((m) => m.orixa)).toContain('Oxum');
      expect(orixas.map((m) => m.orixa)).toContain('Iemanjá');
    });

    it('should return Xangô and Logun Ede for 528 Hz', () => {
      const orixas = getOrixasByFrequency(528);
      expect(orixas.length).toBe(2);
      expect(orixas.map((m) => m.orixa)).toContain('Xangô');
      expect(orixas.map((m) => m.orixa)).toContain('Logun Ede');
    });

    it('should return empty array for unknown frequency', () => {
      const orixas = getOrixasByFrequency(999);
      expect(orixas.length).toBe(0);
    });
  });

  describe('getOrixasByElement', () => {
    it('should return Terra Orixás', () => {
      const orixas = getOrixasByElement('Terra');
      expect(orixas.length).toBe(2);
      expect(orixas.map((m) => m.orixa)).toContain('Oxalufã');
      expect(orixas.map((m) => m.orixa)).toContain('Omulu');
    });

    it('should return Água Orixás', () => {
      const orixas = getOrixasByElement('Água');
      expect(orixas.length).toBe(2);
      expect(orixas.map((m) => m.orixa)).toContain('Oxum');
      expect(orixas.map((m) => m.orixa)).toContain('Iemanjá');
    });

    it('should return Fogo Orixás', () => {
      const orixas = getOrixasByElement('Fogo');
      expect(orixas.length).toBe(2);
      expect(orixas.map((m) => m.orixa)).toContain('Xangô');
      expect(orixas.map((m) => m.orixa)).toContain('Logun Ede');
    });

    it('should return Ar Orixás', () => {
      const orixas = getOrixasByElement('Ar');
      expect(orixas.length).toBe(4);
      expect(orixas.map((m) => m.orixa)).toContain('Oxóssi');
      expect(orixas.map((m) => m.orixa)).toContain('Nanã Buruquá');
      expect(orixas.map((m) => m.orixa)).toContain('Iansã');
      expect(orixas.map((m) => m.orixa)).toContain('Obá');
    });

    it('should return Éter Orixás', () => {
      const orixas = getOrixasByElement('Éter');
      expect(orixas.length).toBe(4);
      expect(orixas.map((m) => m.orixa)).toContain('Oxumaré');
      expect(orixas.map((m) => m.orixa)).toContain('Ossaim');
      expect(orixas.map((m) => m.orixa)).toContain('Ori');
      expect(orixas.map((m) => m.orixa)).toContain('Olokun');
    });

    it('should be case-insensitive', () => {
      const lower = getOrixasByElement('fogo');
      const upper = getOrixasByElement('FOGO');
      expect(lower.length).toBe(upper.length);
    });

    it('should return empty array for unknown element', () => {
      const orixas = getOrixasByElement('Unknown');
      expect(orixas.length).toBe(0);
    });
  });

  describe('getOrixasByDay', () => {
    it('should return Segunda-feira Orixás', () => {
      const orixas = getOrixasByDay('Segunda-feira');
      expect(orixas.length).toBe(2);
      expect(orixas.map((m) => m.orixa)).toContain('Oxalufã');
      expect(orixas.map((m) => m.orixa)).toContain('Omulu');
    });

    it('should return Terça-feira Orixás', () => {
      const orixas = getOrixasByDay('Terça-feira');
      expect(orixas.length).toBe(2);
      expect(orixas.map((m) => m.orixa)).toContain('Oxóssi');
      expect(orixas.map((m) => m.orixa)).toContain('Nanã Buruquá');
    });

    it('should return Quarta-feira Orixás', () => {
      const orixas = getOrixasByDay('Quarta-feira');
      expect(orixas.length).toBe(4);
      expect(orixas.map((m) => m.orixa)).toContain('Xangô');
      expect(orixas.map((m) => m.orixa)).toContain('Logun Ede');
      expect(orixas.map((m) => m.orixa)).toContain('Iansã');
      expect(orixas.map((m) => m.orixa)).toContain('Obá');
    });

    it('should return Sábado Orixás', () => {
      const orixas = getOrixasByDay('Sábado');
      expect(orixas.length).toBe(2);
      expect(orixas.map((m) => m.orixa)).toContain('Oxum');
      expect(orixas.map((m) => m.orixa)).toContain('Iemanjá');
    });

    it('should return Domingo Orixás', () => {
      const orixas = getOrixasByDay('Domingo');
      expect(orixas.length).toBe(4);
      expect(orixas.map((m) => m.orixa)).toContain('Oxumaré');
      expect(orixas.map((m) => m.orixa)).toContain('Ossaim');
      expect(orixas.map((m) => m.orixa)).toContain('Ori');
      expect(orixas.map((m) => m.orixa)).toContain('Olokun');
    });

    it('should be case-insensitive', () => {
      const lower = getOrixasByDay('segunda-feira');
      const upper = getOrixasByDay('SEGUNDA-FEIRA');
      expect(lower.length).toBe(upper.length);
    });

    it('should return empty array for unknown day', () => {
      const orixas = getOrixasByDay('Sexta-feira');
      expect(orixas.length).toBe(0);
    });
  });

  describe('getAllElements', () => {
    it('should return all 5 elements', () => {
      const elements = getAllElements();
      expect(elements.length).toBe(5);
    });

    it('should contain expected elements', () => {
      const elements = getAllElements();
      expect(elements).toContain('Terra');
      expect(elements).toContain('Água');
      expect(elements).toContain('Fogo');
      expect(elements).toContain('Ar');
      expect(elements).toContain('Éter');
    });
  });

  describe('Spiritual Consistency', () => {
    it('should map frequency 396 to Terra element', () => {
      const mapping = getOrixaFrequency('Oxalufã');
      expect(mapping?.frequencia).toBe(396);
      expect(mapping?.elemento).toBe('Terra');
    });

    it('should map frequency 417 to Água element', () => {
      const mapping = getOrixaFrequency('Oxum');
      expect(mapping?.frequencia).toBe(417);
      expect(mapping?.elemento).toBe('Água');
    });

    it('should map frequency 528 to Fogo element', () => {
      const mapping = getOrixaFrequency('Xangô');
      expect(mapping?.frequencia).toBe(528);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should map frequency 639 to Ar element', () => {
      const mapping = getOrixaFrequency('Oxóssi');
      expect(mapping?.frequencia).toBe(639);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should map frequency 741 to Ar element', () => {
      const mapping = getOrixaFrequency('Iansã');
      expect(mapping?.frequencia).toBe(741);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should map frequency 852 to Éter element', () => {
      const mapping = getOrixaFrequency('Oxumaré');
      expect(mapping?.frequencia).toBe(852);
      expect(mapping?.elemento).toBe('Éter');
    });

    it('should map frequency 963 to Éter element', () => {
      const mapping = getOrixaFrequency('Ori');
      expect(mapping?.frequencia).toBe(963);
      expect(mapping?.elemento).toBe('Éter');
    });
  });
});