import { describe, it, expect } from 'vitest';
import {
  getSoundOrixa,
  getOrixaSound,
  getAllSoundOrixas,
  getSoundsByOrixa,
  getSoundsByElement,
  getSoundProperties,
  getSoundFrequency,
  getAllOrixas,
  getSoundPrayer,
  getSoundColor,
  getSoundChakra,
  SOUND_ORIXA_MAP,
} from '@/lib/correlation/sound-orixa';

describe('SoundOrixa Correlation', () => {
  describe('getSoundOrixa', () => {
    it('returns correct mapping for LAM (Oxalufã - Terra - 396Hz)', () => {
      const mapping = getSoundOrixa('LAM');
      expect(mapping).toBeDefined();
      expect(mapping?.som).toBe('LAM');
      expect(mapping?.orixa).toBe('Oxalufã');
      expect(mapping?.orixa_secundario).toBe('Omulu');
      expect(mapping?.frequencia).toBe(396);
      expect(mapping?.elemento).toBe('Terra');
      expect(mapping?.chakra_numero).toBe(1);
    });

    it('returns correct mapping for VAM (Oxum - Água - 417Hz)', () => {
      const mapping = getSoundOrixa('VAM');
      expect(mapping).toBeDefined();
      expect(mapping?.som).toBe('VAM');
      expect(mapping?.orixa).toBe('Oxum');
      expect(mapping?.orixa_secundario).toBe('Iemanjá');
      expect(mapping?.frequencia).toBe(417);
      expect(mapping?.elemento).toBe('Água');
      expect(mapping?.chakra_numero).toBe(2);
    });

    it('returns correct mapping for RAM (Xangô - Fogo - 528Hz)', () => {
      const mapping = getSoundOrixa('RAM');
      expect(mapping).toBeDefined();
      expect(mapping?.som).toBe('RAM');
      expect(mapping?.orixa).toBe('Xangô');
      expect(mapping?.orixa_secundario).toBe('Logun Ede');
      expect(mapping?.frequencia).toBe(528);
      expect(mapping?.elemento).toBe('Fogo');
      expect(mapping?.chakra_numero).toBe(3);
    });

    it('returns correct mapping for YAM (Oxóssi - Ar - 639Hz)', () => {
      const mapping = getSoundOrixa('YAM');
      expect(mapping).toBeDefined();
      expect(mapping?.som).toBe('YAM');
      expect(mapping?.orixa).toBe('Oxóssi');
      expect(mapping?.orixa_secundario).toBe('Nanã Buruquá');
      expect(mapping?.frequencia).toBe(639);
      expect(mapping?.elemento).toBe('Ar');
      expect(mapping?.chakra_numero).toBe(4);
    });

    it('returns correct mapping for HAM (Iansã - Ar - 741Hz)', () => {
      const mapping = getSoundOrixa('HAM');
      expect(mapping).toBeDefined();
      expect(mapping?.som).toBe('HAM');
      expect(mapping?.orixa).toBe('Iansã');
      expect(mapping?.orixa_secundario).toBe('Obá');
      expect(mapping?.frequencia).toBe(741);
      expect(mapping?.elemento).toBe('Ar');
      expect(mapping?.chakra_numero).toBe(5);
    });

    it('returns correct mapping for OM (Oxumaré - Éter - 852Hz)', () => {
      const mapping = getSoundOrixa('OM');
      expect(mapping).toBeDefined();
      expect(mapping?.som).toBe('OM');
      expect(mapping?.orixa).toBe('Oxumaré');
      expect(mapping?.orixa_secundario).toBe('Ossaim');
      expect(mapping?.frequencia).toBe(852);
      expect(mapping?.elemento).toBe('Éter');
      expect(mapping?.chakra_numero).toBe(6);
    });

    it('returns correct mapping for AUM (Ori - Éter - 963Hz)', () => {
      const mapping = getSoundOrixa('AUM');
      expect(mapping).toBeDefined();
      expect(mapping?.som).toBe('AUM');
      expect(mapping?.orixa).toBe('Ori');
      expect(mapping?.orixa_secundario).toBe('Olokun');
      expect(mapping?.frequencia).toBe(963);
      expect(mapping?.elemento).toBe('Éter');
      expect(mapping?.chakra_numero).toBe(7);
    });

    it('accepts lowercase sound identifier', () => {
      const mapping = getSoundOrixa('lam');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Oxalufã');
    });

    it('accepts mixed case sound identifier', () => {
      const mapping = getSoundOrixa('Lam');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Oxalufã');
    });

    it('accepts sound identifier with whitespace', () => {
      const mapping = getSoundOrixa(' LAM ');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Oxalufã');
    });

    it('returns undefined for unknown sound', () => {
      const mapping = getSoundOrixa('XYZ');
      expect(mapping).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const mapping = getSoundOrixa('');
      expect(mapping).toBeUndefined();
    });

    it('returns undefined for null/undefined input', () => {
      expect(getSoundOrixa(null as unknown as string)).toBeUndefined();
      expect(getSoundOrixa(undefined as unknown as string)).toBeUndefined();
    });
  });

  describe('getOrixaSound', () => {
    it('returns Orixá name for LAM', () => {
      expect(getOrixaSound('LAM')).toBe('Oxalufã');
    });

    it('returns Orixá name for VAM', () => {
      expect(getOrixaSound('VAM')).toBe('Oxum');
    });

    it('returns Orixá name for RAM', () => {
      expect(getOrixaSound('RAM')).toBe('Xangô');
    });

    it('returns Orixá name for YAM', () => {
      expect(getOrixaSound('YAM')).toBe('Oxóssi');
    });

    it('returns Orixá name for HAM', () => {
      expect(getOrixaSound('HAM')).toBe('Iansã');
    });

    it('returns Orixá name for OM', () => {
      expect(getOrixaSound('OM')).toBe('Oxumaré');
    });

    it('returns Orixá name for AUM', () => {
      expect(getOrixaSound('AUM')).toBe('Ori');
    });

    it('returns undefined for unknown sound', () => {
      expect(getOrixaSound('XYZ')).toBeUndefined();
    });
  });

  describe('getAllSoundOrixas', () => {
    it('returns all 7 sound-Orixá mappings', () => {
      const mappings = getAllSoundOrixas();
      expect(mappings).toHaveLength(7);
    });

    it('returns mappings sorted by chakra number', () => {
      const mappings = getAllSoundOrixas();
      const chakraNumbers = mappings.map(m => m.chakra_numero);
      expect(chakraNumbers).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('includes all required properties for each mapping', () => {
      const mappings = getAllSoundOrixas();
      for (const mapping of mappings) {
        expect(mapping.som).toBeDefined();
        expect(mapping.orixa).toBeDefined();
        expect(mapping.frequencia).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(mapping.propriedades).toBeDefined();
        expect(mapping.oracao_yoruba).toBeDefined();
      }
    });
  });

  describe('getSoundsByOrixa', () => {
    it('returns sounds for Oxalufã (primary)', () => {
      const sounds = getSoundsByOrixa('Oxalufã');
      expect(sounds).toHaveLength(1);
      expect(sounds[0].som).toBe('LAM');
    });

    it('returns sounds for Omulu (secondary)', () => {
      const sounds = getSoundsByOrixa('Omulu');
      expect(sounds).toHaveLength(1);
      expect(sounds[0].som).toBe('LAM');
    });

    it('returns sounds for Oxum (primary)', () => {
      const sounds = getSoundsByOrixa('Oxum');
      expect(sounds).toHaveLength(1);
      expect(sounds[0].som).toBe('VAM');
    });

    it('returns sounds for Iemanjá (secondary)', () => {
      const sounds = getSoundsByOrixa('Iemanjá');
      expect(sounds).toHaveLength(1);
      expect(sounds[0].som).toBe('VAM');
    });

    it('is case-insensitive', () => {
      const soundsUpper = getSoundsByOrixa('OXALUFÃ');
      const soundsLower = getSoundsByOrixa('oxalufã');
      expect(soundsUpper).toHaveLength(1);
      expect(soundsLower).toHaveLength(1);
      expect(soundsUpper[0].som).toBe(soundsLower[0].som);
    });

    it('returns empty array for unknown Orixá', () => {
      const sounds = getSoundsByOrixa('UnknownOrixa');
      expect(sounds).toHaveLength(0);
    });

    it('returns empty array for empty string', () => {
      const sounds = getSoundsByOrixa('');
      expect(sounds).toHaveLength(0);
    });
  });

  describe('getSoundsByElement', () => {
    it('returns sounds for Terra', () => {
      const sounds = getSoundsByElement('Terra');
      expect(sounds).toHaveLength(1);
      expect(sounds[0].som).toBe('LAM');
    });

    it('returns sounds for Água', () => {
      const sounds = getSoundsByElement('Água');
      expect(sounds).toHaveLength(1);
      expect(sounds[0].som).toBe('VAM');
    });

    it('returns sounds for Fogo', () => {
      const sounds = getSoundsByElement('Fogo');
      expect(sounds).toHaveLength(1);
      expect(sounds[0].som).toBe('RAM');
    });

    it('returns sounds for Ar (includes YAM and HAM)', () => {
      const sounds = getSoundsByElement('Ar');
      expect(sounds).toHaveLength(2);
      const soms = sounds.map(s => s.som).sort();
      expect(soms).toEqual(['HAM', 'YAM']);
    });

    it('returns sounds for Éter (includes OM and AUM)', () => {
      const sounds = getSoundsByElement('Éter');
      expect(sounds).toHaveLength(2);
      const soms = sounds.map(s => s.som).sort();
      expect(soms).toEqual(['AUM', 'OM']);
    });

    it('is case-insensitive', () => {
      const soundsUpper = getSoundsByElement('TERRA');
      const soundsLower = getSoundsByElement('terra');
      expect(soundsUpper).toHaveLength(1);
      expect(soundsLower).toHaveLength(1);
      expect(soundsUpper[0].som).toBe(soundsLower[0].som);
    });

    it('returns empty array for unknown element', () => {
      const sounds = getSoundsByElement('UnknownElement');
      expect(sounds).toHaveLength(0);
    });
  });

  describe('getSoundProperties', () => {
    it('returns properties for LAM', () => {
      const properties = getSoundProperties('LAM');
      expect(properties).toBeDefined();
      expect(properties).toHaveLength(5);
      expect(properties).toContain('Dissolução de medos de sobrevivência e escassez');
    });

    it('returns properties for VAM', () => {
      const properties = getSoundProperties('VAM');
      expect(properties).toBeDefined();
      expect(properties).toContain('Limpeza de traumas emocionais do passado');
    });

    it('returns properties for RAM', () => {
      const properties = getSoundProperties('RAM');
      expect(properties).toBeDefined();
      expect(properties).toContain('Transformação da força de vontade e autoconfiança');
    });

    it('returns undefined for unknown sound', () => {
      expect(getSoundProperties('XYZ')).toBeUndefined();
    });
  });

  describe('getSoundFrequency', () => {
    it('returns frequency for LAM (396)', () => {
      expect(getSoundFrequency('LAM')).toBe(396);
    });

    it('returns frequency for VAM (417)', () => {
      expect(getSoundFrequency('VAM')).toBe(417);
    });

    it('returns frequency for RAM (528)', () => {
      expect(getSoundFrequency('RAM')).toBe(528);
    });

    it('returns frequency for YAM (639)', () => {
      expect(getSoundFrequency('YAM')).toBe(639);
    });

    it('returns frequency for HAM (741)', () => {
      expect(getSoundFrequency('HAM')).toBe(741);
    });

    it('returns frequency for OM (852)', () => {
      expect(getSoundFrequency('OM')).toBe(852);
    });

    it('returns frequency for AUM (963)', () => {
      expect(getSoundFrequency('AUM')).toBe(963);
    });

    it('returns undefined for unknown sound', () => {
      expect(getSoundFrequency('XYZ')).toBeUndefined();
    });
  });

  describe('getAllOrixas', () => {
    it('returns all 14 unique Orixá names (7 primary + 7 secondary)', () => {
      const orixas = getAllOrixas();
      expect(orixas).toHaveLength(14);
    });

    it('includes primary Orixás', () => {
      const orixas = getAllOrixas();
      expect(orixas).toContain('Oxalufã');
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Oxóssi');
      expect(orixas).toContain('Iansã');
      expect(orixas).toContain('Oxumaré');
      expect(orixas).toContain('Ori');
    });

    it('includes secondary Orixás', () => {
      const orixas = getAllOrixas();
      expect(orixas).toContain('Omulu');
      expect(orixas).toContain('Iemanjá');
      expect(orixas).toContain('Logun Ede');
      expect(orixas).toContain('Nanã Buruquá');
      expect(orixas).toContain('Obá');
      expect(orixas).toContain('Ossaim');
      expect(orixas).toContain('Olokun');
    });

    it('returns sorted array', () => {
      const orixas = getAllOrixas();
      const sorted = [...orixas].sort();
      expect(orixas).toEqual(sorted);
    });
  });

  describe('getSoundPrayer', () => {
    it('returns prayer for LAM', () => {
      const prayer = getSoundPrayer('LAM');
      expect(prayer).toBe('Oxalufã / Obaluayê, dá-me firmeza e proteção');
    });

    it('returns prayer for VAM', () => {
      const prayer = getSoundPrayer('VAM');
      expect(prayer).toBe('Oxum, abre as águas da prosperidade em minha vida');
    });

    it('returns prayer for RAM', () => {
      const prayer = getSoundPrayer('RAM');
      expect(prayer).toBe('Xangô, concede-me a força da justiça e do equilíbrio');
    });

    it('returns undefined for unknown sound', () => {
      expect(getSoundPrayer('XYZ')).toBeUndefined();
    });
  });

  describe('getSoundColor', () => {
    it('returns color for LAM (Branco)', () => {
      expect(getSoundColor('LAM')).toBe('Branco');
    });

    it('returns color for VAM (Amarelo-dourado)', () => {
      expect(getSoundColor('VAM')).toBe('Amarelo-dourado');
    });

    it('returns color for RAM (Vermelho)', () => {
      expect(getSoundColor('RAM')).toBe('Vermelho');
    });

    it('returns color for OM (Arco-íris)', () => {
      expect(getSoundColor('OM')).toBe('Arco-íris');
    });

    it('returns color for AUM (Branco-dourado)', () => {
      expect(getSoundColor('AUM')).toBe('Branco-dourado');
    });

    it('returns undefined for unknown sound', () => {
      expect(getSoundColor('XYZ')).toBeUndefined();
    });
  });

  describe('getSoundChakra', () => {
    it('returns chakra for LAM (1º Básico - Muladhara)', () => {
      expect(getSoundChakra('LAM')).toBe('1º Básico (Muladhara)');
    });

    it('returns chakra for VAM (2º Sacro - Svadhisthana)', () => {
      expect(getSoundChakra('VAM')).toBe('2º Sacro (Svadhisthana)');
    });

    it('returns chakra for RAM (3º Plexo Solar - Manipura)', () => {
      expect(getSoundChakra('RAM')).toBe('3º Plexo Solar (Manipura)');
    });

    it('returns undefined for unknown sound', () => {
      expect(getSoundChakra('XYZ')).toBeUndefined();
    });
  });

  describe('SOUND_ORIXA_MAP integrity', () => {
    it('contains all 7 seed syllables', () => {
      const expectedSounds = ['LAM', 'VAM', 'RAM', 'YAM', 'HAM', 'OM', 'AUM'];
      for (const sound of expectedSounds) {
        expect(SOUND_ORIXA_MAP[sound]).toBeDefined();
      }
    });

    it('frequencies match Solfeggio pattern', () => {
      const expectedFrequencies = [396, 417, 528, 639, 741, 852, 963];
      const sounds = ['LAM', 'VAM', 'RAM', 'YAM', 'HAM', 'OM', 'AUM'];
      for (let i = 0; i < sounds.length; i++) {
        expect(SOUND_ORIXA_MAP[sounds[i]].frequencia).toBe(expectedFrequencies[i]);
      }
    });

    it('each mapping has 5 healing properties', () => {
      for (const mapping of Object.values(SOUND_ORIXA_MAP)) {
        expect(mapping.propriedades).toHaveLength(5);
      }
    });

    it('each mapping has pronunciation guide', () => {
      for (const mapping of Object.values(SOUND_ORIXA_MAP)) {
        expect(mapping.pronunciacao).toBeDefined();
        expect(mapping.pronunciacao.length).toBeGreaterThan(0);
      }
    });

    it('each mapping has ritual tool', () => {
      for (const mapping of Object.values(SOUND_ORIXA_MAP)) {
        expect(mapping.ferramenta_ritual).toBeDefined();
        expect(mapping.ferramenta_ritual.length).toBeGreaterThan(0);
      }
    });

    it('each mapping has day of week', () => {
      for (const mapping of Object.values(SOUND_ORIXA_MAP)) {
        expect(mapping.dia_semana).toBeDefined();
        expect(mapping.dia_semana.length).toBeGreaterThan(0);
      }
    });

    it('chakra numbers are 1-7 in sequence', () => {
      const chakraNumbers = Object.values(SOUND_ORIXA_MAP).map(m => m.chakra_numero);
      chakraNumbers.sort((a, b) => a - b);
      expect(chakraNumbers).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe('Sound-Orixá spiritual correlation completeness', () => {
    it('covers all five elements', () => {
      const elements = new Set(Object.values(SOUND_ORIXA_MAP).map(m => m.elemento));
      expect(elements.size).toBe(5);
      expect(elements.has('Terra')).toBe(true);
      expect(elements.has('Água')).toBe(true);
      expect(elements.has('Fogo')).toBe(true);
      expect(elements.has('Ar')).toBe(true);
      expect(elements.has('Éter')).toBe(true);
    });

    it('covers all seven chakras', () => {
      const chakras = Object.values(SOUND_ORIXA_MAP).map(m => m.chakra_numero);
      chakras.sort((a, b) => a - b);
      expect(chakras).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('each sound has unique Orixá', () => {
      const orixas = Object.values(SOUND_ORIXA_MAP).map(m => m.orixa);
      const uniqueOrixas = new Set(orixas);
      expect(uniqueOrixas.size).toBe(7);
    });

    it('all frequencies are unique Solfeggio frequencies', () => {
      const frequencies = Object.values(SOUND_ORIXA_MAP).map(m => m.frequencia);
      const uniqueFrequencies = new Set(frequencies);
      expect(uniqueFrequencies.size).toBe(7);
    });
  });
});