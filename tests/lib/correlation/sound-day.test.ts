import { describe, it, expect } from 'vitest';
import {
  getSoundDay,
  getDaySound,
  getAllSoundDays,
  getSoundsByDay,
  getSoundsByElement,
  getAllDays,
  getPlanetBySound,
  getElementBySound,
  getFrequencyBySound,
  getChakraBySound,
  getHealingBySound,
  getSoundsByType,
  getSoundsByPlanet,
  SOUND_DAY_MAP,
  type SoundDayCorrelation,
} from '@/lib/correlation/sound-day';

describe('sound-day correlation', () => {
  describe('getSoundDay', () => {
    it('returns correct mapping for OM on Sunday', () => {
      const result = getSoundDay('OM');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Domingo');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.planeta).toBe('Sol');
      expect(result?.frequencia).toBe(528);
    });

    it('returns correct mapping for IEMANJÁ on Monday', () => {
      const result = getSoundDay('IEMANJÁ');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Segunda-feira');
      expect(result?.elemento).toBe('Água');
      expect(result?.planeta).toBe('Lua');
    });

    it('returns correct mapping for XANGÔ on Tuesday', () => {
      const result = getSoundDay('XANGÔ');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Terça-feira');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.planeta).toBe('Marte');
    });

    it('returns correct mapping for GAYATRI on Wednesday', () => {
      const result = getSoundDay('GAYATRI');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Quarta-feira');
      expect(result?.elemento).toBe('Ar');
      expect(result?.planeta).toBe('Mercúrio');
    });

    it('returns correct mapping for LARÉ on Thursday', () => {
      const result = getSoundDay('LARÉ');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Quinta-feira');
      expect(result?.elemento).toBe('Terra');
      expect(result?.planeta).toBe('Júpiter');
    });

    it('returns correct mapping for OXUM on Friday', () => {
      const result = getSoundDay('OXUM');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Sexta-feira');
      expect(result?.elemento).toBe('Água');
      expect(result?.planeta).toBe('Vênus');
    });

    it('returns correct mapping for OSSAIM on Saturday', () => {
      const result = getSoundDay('OSSAIM');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Sábado');
      expect(result?.elemento).toBe('Terra');
      expect(result?.planeta).toBe('Saturno');
    });

    it('accepts lowercase sound names', () => {
      const result = getSoundDay('om');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Domingo');
    });

    it('accepts mixed case sound names', () => {
      const result = getSoundDay('Xangô');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Terça-feira');
    });

    it('returns undefined for unknown sound', () => {
      const result = getSoundDay('UNKNOWN');
      expect(result).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const result = getSoundDay('');
      expect(result).toBeUndefined();
    });

    it('handles solfeggio frequencies', () => {
      const result = getSoundDay('SOLFEGGIO 417HZ');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Segunda-feira');
      expect(result?.frequencia).toBe(417);
    });

    it('handles accent characters', () => {
      const result = getSoundDay('Iansã');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Terça-feira');
    });
  });

  describe('getDaySound', () => {
    it('returns correct reverse mapping for Sunday', () => {
      const result = getDaySound();
      expect(result['Domingo']).toBeDefined();
      expect(result['Domingo'].length).toBeGreaterThan(0);
      expect(result['Domingo'][0].planeta).toBe('Sol');
    });

    it('returns correct reverse mapping for Monday', () => {
      const result = getDaySound();
      expect(result['Segunda-feira']).toBeDefined();
      expect(result['Segunda-feira'][0].planeta).toBe('Lua');
    });

    it('returns correct reverse mapping for Tuesday', () => {
      const result = getDaySound();
      expect(result['Terça-feira']).toBeDefined();
      expect(result['Terça-feira'][0].planeta).toBe('Marte');
    });

    it('returns correct reverse mapping for Wednesday', () => {
      const result = getDaySound();
      expect(result['Quarta-feira']).toBeDefined();
      expect(result['Quarta-feira'][0].planeta).toBe('Mercúrio');
    });

    it('returns correct reverse mapping for Thursday', () => {
      const result = getDaySound();
      expect(result['Quinta-feira']).toBeDefined();
      expect(result['Quinta-feira'][0].planeta).toBe('Júpiter');
    });

    it('returns correct reverse mapping for Friday', () => {
      const result = getDaySound();
      expect(result['Sexta-feira']).toBeDefined();
      expect(result['Sexta-feira'][0].planeta).toBe('Vênus');
    });

    it('returns correct reverse mapping for Saturday', () => {
      const result = getDaySound();
      expect(result['Sábado']).toBeDefined();
      expect(result['Sábado'][0].planeta).toBe('Saturno');
    });

    it('contains all seven days', () => {
      const result = getDaySound();
      const days = Object.keys(result);
      expect(days).toContain('Domingo');
      expect(days).toContain('Segunda-feira');
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Sábado');
    });
  });

  describe('getAllSoundDays', () => {
    it('returns all sound-day mappings', () => {
      const result = getAllSoundDays();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns array of SoundDayCorrelation objects', () => {
      const result = getAllSoundDays();
      expect(result[0]).toHaveProperty('dia');
      expect(result[0]).toHaveProperty('som');
      expect(result[0]).toHaveProperty('elemento');
      expect(result[0]).toHaveProperty('planeta');
    });

    it('each item has required properties', () => {
      const result = getAllSoundDays();
      for (const item of result) {
        expect(item.dia).toBeDefined();
        expect(item.som).toBeDefined();
        expect(item.tipo).toBeDefined();
        expect(item.elemento).toBeDefined();
        expect(item.planeta).toBeDefined();
        expect(item.significado).toBeDefined();
        expect(item.propriedades_healing).toBeDefined();
      }
    });
  });

  describe('getSoundsByDay', () => {
    it('returns sounds for Sunday', () => {
      const result = getSoundsByDay('Domingo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((s) => s.dia === 'Domingo')).toBe(true);
    });

    it('returns sounds for Monday', () => {
      const result = getSoundsByDay('Segunda-feira');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns sounds for Saturday', () => {
      const result = getSoundsByDay('Sábado');
      expect(result.length).toBeGreaterThan(0);
    });

    it('is case-insensitive', () => {
      const result1 = getSoundsByDay('DOMINGO');
      const result2 = getSoundsByDay('domingo');
      expect(result1.length).toBe(result2.length);
    });

    it('returns empty array for unknown day', () => {
      const result = getSoundsByDay('UnknownDay');
      expect(result).toEqual([]);
    });
  });

  describe('getSoundsByElement', () => {
    it('returns sounds for Fire element', () => {
      const result = getSoundsByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((s) => s.elemento === 'Fogo')).toBe(true);
    });

    it('returns sounds for Water element', () => {
      const result = getSoundsByElement('Água');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns sounds for Earth element', () => {
      const result = getSoundsByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns sounds for Air element', () => {
      const result = getSoundsByElement('Ar');
      expect(result.length).toBeGreaterThan(0);
    });

    it('is case-insensitive', () => {
      const result1 = getSoundsByElement('FOGO');
      const result2 = getSoundsByElement('fogo');
      expect(result1.length).toBe(result2.length);
    });

    it('returns empty array for unknown element', () => {
      const result = getSoundsByElement('UnknownElement');
      expect(result).toEqual([]);
    });
  });

  describe('getAllDays', () => {
    it('returns all seven days', () => {
      const result = getAllDays();
      expect(result.length).toBe(7);
    });

    it('contains all expected days', () => {
      const result = getAllDays();
      expect(result).toContain('Domingo');
      expect(result).toContain('Segunda-feira');
      expect(result).toContain('Terça-feira');
      expect(result).toContain('Quarta-feira');
      expect(result).toContain('Quinta-feira');
      expect(result).toContain('Sexta-feira');
      expect(result).toContain('Sábado');
    });
  });

  describe('getPlanetBySound', () => {
    it('returns planet for OM', () => {
      const result = getPlanetBySound('OM');
      expect(result).toBe('Sol');
    });

    it('returns planet for IEMANJÁ', () => {
      const result = getPlanetBySound('IEMANJÁ');
      expect(result).toBe('Lua');
    });

    it('returns planet for XANGÔ', () => {
      const result = getPlanetBySound('XANGÔ');
      expect(result).toBe('Marte');
    });

    it('returns planet for GAYATRI', () => {
      const result = getPlanetBySound('GAYATRI');
      expect(result).toBe('Mercúrio');
    });

    it('returns planet for LARÉ', () => {
      const result = getPlanetBySound('LARÉ');
      expect(result).toBe('Júpiter');
    });

    it('returns planet for OXUM', () => {
      const result = getPlanetBySound('OXUM');
      expect(result).toBe('Vênus');
    });

    it('returns planet for OSSAIM', () => {
      const result = getPlanetBySound('OSSAIM');
      expect(result).toBe('Saturno');
    });

    it('returns null for unknown sound', () => {
      const result = getPlanetBySound('UNKNOWN');
      expect(result).toBeNull();
    });
  });

  describe('getElementBySound', () => {
    it('returns element for OM', () => {
      const result = getElementBySound('OM');
      expect(['Fogo', 'Água', 'Terra', 'Ar']).toContain(result);
    });

    it('returns element for SOLFEGGIO 396HZ', () => {
      const result = getElementBySound('SOLFEGGIO 396HZ');
      expect(result).toBe('Terra');
    });

    it('returns element for SOLFEGGIO 417HZ', () => {
      const result = getElementBySound('SOLFEGGIO 417HZ');
      expect(result).toBe('Água');
    });


    it('returns element for SOLFEGGIO 741HZ', () => {
      const result = getElementBySound('SOLFEGGIO 741HZ');
      expect(result).toBe('Fogo');
    });

    it('returns element for SOLFEGGIO 852HZ', () => {
      const result = getElementBySound('SOLFEGGIO 852HZ');
      expect(result).toBe('Ar');
    });

    it('returns null for unknown sound', () => {
      const result = getElementBySound('UNKNOWN');
      expect(result).toBeNull();
    });
  });

  describe('getFrequencyBySound', () => {
    it('returns frequency for OM', () => {
      const result = getFrequencyBySound('OM');
      expect([396, 417, 528, 741, 852, 963]).toContain(result);
    });

    it('returns frequency for SOLFEGGIO 396HZ', () => {
      const result = getFrequencyBySound('SOLFEGGIO 396HZ');
      expect(result).toBe(396);
    });

    it('returns frequency for SOLFEGGIO 417HZ', () => {
      const result = getFrequencyBySound('SOLFEGGIO 417HZ');
      expect(result).toBe(417);
    });


    it('returns frequency for SOLFEGGIO 741HZ', () => {
      const result = getFrequencyBySound('SOLFEGGIO 741HZ');
      expect(result).toBe(741);
    });

    it('returns frequency for SOLFEGGIO 852HZ', () => {
      const result = getFrequencyBySound('SOLFEGGIO 852HZ');
      expect(result).toBe(852);
    });

    it('returns null for unknown sound', () => {
      const result = getFrequencyBySound('UNKNOWN');
      expect(result).toBeNull();
    });
  });

  describe('getChakraBySound', () => {
    it('returns chakra for OM', () => {
      const result = getChakraBySound('OM');
      expect(result).toBeDefined();
      expect(result).toMatch(/Coronário|Sahasrara|Sacro|Básico|Cardíaco|Laríngeo|Terceiro Olho|Ajna/);
    });

    it('returns chakra for GAYATRI', () => {
      const result = getChakraBySound('GAYATRI');
      expect(result).toBe('6º Terceiro Olho (Ajna)');
    });

    it('returns null for unknown sound', () => {
      const result = getChakraBySound('UNKNOWN');
      expect(result).toBeNull();
    });
  });

  describe('getHealingBySound', () => {
    it('returns healing properties for OM', () => {
      const result = getHealingBySound('OM');
      expect(result).toBeDefined();
      expect(result?.fisico).toBeDefined();
      expect(result?.emocional).toBeDefined();
      expect(result?.mental_espiritual).toBeDefined();
      expect(result?.pratica).toBeDefined();
    });

    it('returns healing properties for XANGÔ', () => {
      const result = getHealingBySound('XANGÔ');
      expect(result).toBeDefined();
      expect(result?.fisico).toContain('ossos');
    });

    it('returns null for unknown sound', () => {
      const result = getHealingBySound('UNKNOWN');
      expect(result).toBeNull();
    });
  });

  describe('getSoundsByType', () => {
    it('returns mantra sounds', () => {
      const result = getSoundsByType('mantra');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((s) => s.tipo === 'mantra')).toBe(true);
    });

    it('returns oracao sounds', () => {
      const result = getSoundsByType('oracao');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns solfeggio sounds', () => {
      const result = getSoundsByType('solfeggio');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown type', () => {
      const result = getSoundsByType('unknown_type');
      expect(result).toEqual([]);
    });
  });

  describe('getSoundsByPlanet', () => {
    it('returns sounds for Sun', () => {
      const result = getSoundsByPlanet('Sol');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((s) => s.planeta === 'Sol')).toBe(true);
    });

    it('returns sounds for Moon', () => {
      const result = getSoundsByPlanet('Lua');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns sounds for Mars', () => {
      const result = getSoundsByPlanet('Marte');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns sounds for Mercury', () => {
      const result = getSoundsByPlanet('Mercúrio');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns sounds for Jupiter', () => {
      const result = getSoundsByPlanet('Júpiter');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns sounds for Venus', () => {
      const result = getSoundsByPlanet('Vênus');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns sounds for Saturn', () => {
      const result = getSoundsByPlanet('Saturno');
      expect(result.length).toBeGreaterThan(0);
    });

    it('is case-insensitive', () => {
      const result1 = getSoundsByPlanet('SOL');
      const result2 = getSoundsByPlanet('sol');
      expect(result1.length).toBe(result2.length);
    });

    it('returns empty array for unknown planet', () => {
      const result = getSoundsByPlanet('UnknownPlanet');
      expect(result).toEqual([]);
    });
  });

  describe('Complete sound-day correlation', () => {
    it('every day has at least one sound', () => {
      const days = getAllDays();
      for (const day of days) {
        const sounds = getSoundsByDay(day);
        expect(sounds.length).toBeGreaterThan(0);
      }
    });

    it('every sound has valid day', () => {
      const allSounds = getAllSoundDays();
      const validDays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      for (const sound of allSounds) {
        expect(validDays).toContain(sound.dia);
      }
    });

    it('every sound has valid element', () => {
      const allSounds = getAllSoundDays();
      const validElements = ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'];
      for (const sound of allSounds) {
        expect(validElements).toContain(sound.elemento);
      }
    });

    it('every sound has valid planet', () => {
      const allSounds = getAllSoundDays();
      const validPlanets = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'];
      for (const sound of allSounds) {
        expect(validPlanets).toContain(sound.planeta);
      }
    });

    it('frequency values are valid solfeggio frequencies', () => {
      const allSounds = getAllSoundDays();
      const validFrequencies = [174, 285, 396, 417, 528, 639, 741, 852, 963];
      for (const sound of allSounds) {
        expect(validFrequencies).toContain(sound.frequencia);
      }
    });

    it('sounds map is not empty', () => {
      expect(Object.keys(SOUND_DAY_MAP).length).toBeGreaterThan(0);
    });
  });

  describe('Sound-day consistency', () => {
    it('Sunday is associated with Sol and Fogo', () => {
      const sounds = getSoundsByDay('Domingo');
      for (const sound of sounds) {
        expect(sound.planeta).toBe('Sol');
        expect(sound.elemento).toBe('Fogo');
      }
    });

    it('Monday is associated with Lua and Água', () => {
      const sounds = getSoundsByDay('Segunda-feira');
      for (const sound of sounds) {
        expect(sound.planeta).toBe('Lua');
        expect(sound.elemento).toBe('Água');
      }
    });

    it('Tuesday is associated with Marte and Fogo', () => {
      const sounds = getSoundsByDay('Terça-feira');
      for (const sound of sounds) {
        expect(sound.planeta).toBe('Marte');
        expect(sound.elemento).toBe('Fogo');
      }
    });

    it('Wednesday is associated with Mercúrio and Ar', () => {
      const sounds = getSoundsByDay('Quarta-feira');
      for (const sound of sounds) {
        expect(sound.planeta).toBe('Mercúrio');
        expect(sound.elemento).toBe('Ar');
      }
    });

    it('Thursday is associated with Júpiter', () => {
      const sounds = getSoundsByDay('Quinta-feira');
      for (const sound of sounds) {
        expect(sound.planeta).toBe('Júpiter');
      }
    });

    it('Friday is associated with Vênus and Água', () => {
      const sounds = getSoundsByDay('Sexta-feira');
      for (const sound of sounds) {
        expect(sound.planeta).toBe('Vênus');
        expect(sound.elemento).toBe('Água');
      }
    });

    it('Saturday is associated with Saturno and Terra', () => {
      const sounds = getSoundsByDay('Sábado');
      for (const sound of sounds) {
        expect(sound.planeta).toBe('Saturno');
        expect(sound.elemento).toBe('Terra');
      }
    });
  });
});
