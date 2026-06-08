/**
 * Planet-Sound Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getPlanetSound,
  getSoundPlanet,
  getAllPlanetSounds,
} from '@/lib/correlation/planet-sound';

describe('Planet-Sound Correlation', () => {
  describe('getPlanetSound', () => {
    it('should return Sol mapping with RAM sound and 528 Hz frequency', () => {
      const result = getPlanetSound('Sol');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Sol');
      expect(result?.som_sagrado).toBe('RAM');
      expect(result?.frequencia_hz).toBe(528);
      expect(result?.nota_musical).toBe('E');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.qualidade_energetica).toBe('Quente / Radiante');
      expect(result?.planeta_numero).toBe(1);
    });

    it('should return Lua mapping with OM sound and 852 Hz frequency', () => {
      const result = getPlanetSound('Lua');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Lua');
      expect(result?.som_sagrado).toBe('OM');
      expect(result?.frequencia_hz).toBe(852);
      expect(result?.nota_musical).toBe('A');
      expect(result?.elemento).toBe('Água');
      expect(result?.qualidade_energetica).toBe('Fria / Receptiva');
      expect(result?.planeta_numero).toBe(2);
    });

    it('should return Marte mapping with VAM sound and 432 Hz frequency', () => {
      const result = getPlanetSound('Marte');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Marte');
      expect(result?.som_sagrado).toBe('VAM');
      expect(result?.frequencia_hz).toBe(432);
      expect(result?.nota_musical).toBe('D');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.qualidade_energetica).toBe('Quente / Radiante');
      expect(result?.planeta_numero).toBe(3);
    });

    it('should return Mercúrio mapping with AUM sound and 741 Hz frequency', () => {
      const result = getPlanetSound('Mercúrio');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.som_sagrado).toBe('AUM');
      expect(result?.frequencia_hz).toBe(741);
      expect(result?.nota_musical).toBe('F#');
      expect(result?.elemento).toBe('Ar');
      expect(result?.qualidade_energetica).toBe('Neutra / Volátil');
      expect(result?.planeta_numero).toBe(4);
    });

    it('should return Júpiter mapping with HAM sound and 396 Hz frequency', () => {
      const result = getPlanetSound('Júpiter');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.som_sagrado).toBe('HAM');
      expect(result?.frequencia_hz).toBe(396);
      expect(result?.nota_musical).toBe('G');
      expect(result?.elemento).toBe('Fogo / Água');
      expect(result?.qualidade_energetica).toBe('Fria / Expansiva');
      expect(result?.planeta_numero).toBe(5);
    });

    it('should return Vênus mapping with YAM sound and 639 Hz frequency', () => {
      const result = getPlanetSound('Vênus');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Vênus');
      expect(result?.som_sagrado).toBe('YAM');
      expect(result?.frequencia_hz).toBe(639);
      expect(result?.nota_musical).toBe('G#');
      expect(result?.elemento).toBe('Água');
      expect(result?.qualidade_energetica).toBe('Fria / Receptiva');
      expect(result?.planeta_numero).toBe(6);
    });

    it('should return Saturno mapping with DUM sound and 963 Hz frequency', () => {
      const result = getPlanetSound('Saturno');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.som_sagrado).toBe('DUM');
      expect(result?.frequencia_hz).toBe(963);
      expect(result?.nota_musical).toBe('C');
      expect(result?.elemento).toBe('Terra');
      expect(result?.qualidade_energetica).toBe('Quente / Densa');
      expect(result?.planeta_numero).toBe(7);
    });

    it('should be case-insensitive', () => {
      expect(getPlanetSound('sol')?.planeta).toBe('Sol');
      expect(getPlanetSound('SOL')?.planeta).toBe('Sol');
      expect(getPlanetSound('lua')?.planeta).toBe('Lua');
      expect(getPlanetSound('júpiter')?.planeta).toBe('Júpiter');
      expect(getPlanetSound('vénus')?.planeta).toBe('Vênus');
    });

    it('should accept planet number as string', () => {
      expect(getPlanetSound('1')?.planeta).toBe('Sol');
      expect(getPlanetSound('2')?.planeta).toBe('Lua');
      expect(getPlanetSound('7')?.planeta).toBe('Saturno');
    });

    it('should return undefined for unknown planet', () => {
      expect(getPlanetSound('Unknown Planet')).toBeUndefined();
      expect(getPlanetSound('')).toBeUndefined();
      expect(getPlanetSound('Netuno')).toBeUndefined();
      expect(getPlanetSound('Plutão')).toBeUndefined();
    });

    it('should include all required properties in returned object', () => {
      const result = getPlanetSound('Sol');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('planeta_numero');
      expect(result).toHaveProperty('som_sagrado');
      expect(result).toHaveProperty('frequencia_hz');
      expect(result).toHaveProperty('nota_musical');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('qualidade_energetica');
      expect(result).toHaveProperty('descricao');
      expect(result).toHaveProperty('chakra_correspondencia');
    });

    it('should handle aliased planet names (mercurio vs mercúrio)', () => {
      expect(getPlanetSound('mercurio')?.planeta).toBe('Mercúrio');
      expect(getPlanetSound('jupiter')?.planeta).toBe('Júpiter');
      expect(getPlanetSound('venus')?.planeta).toBe('Vênus');
    });
  });

  describe('getSoundPlanet', () => {
    it('should find planet by sacred sound', () => {
      expect(getSoundPlanet('RAM')?.planeta).toBe('Sol');
      expect(getSoundPlanet('OM')?.planeta).toBe('Lua');
      expect(getSoundPlanet('VAM')?.planeta).toBe('Marte');
      expect(getSoundPlanet('AUM')?.planeta).toBe('Mercúrio');
      expect(getSoundPlanet('HAM')?.planeta).toBe('Júpiter');
      expect(getSoundPlanet('YAM')?.planeta).toBe('Vênus');
      expect(getSoundPlanet('DUM')?.planeta).toBe('Saturno');
    });

    it('should find planet by frequency (number)', () => {
      expect(getSoundPlanet(528)?.planeta).toBe('Sol');
      expect(getSoundPlanet(852)?.planeta).toBe('Lua');
      expect(getSoundPlanet(432)?.planeta).toBe('Marte');
      expect(getSoundPlanet(741)?.planeta).toBe('Mercúrio');
      expect(getSoundPlanet(396)?.planeta).toBe('Júpiter');
      expect(getSoundPlanet(639)?.planeta).toBe('Vênus');
      expect(getSoundPlanet(963)?.planeta).toBe('Saturno');
    });

    it('should find planet by frequency (string)', () => {
      expect(getSoundPlanet('528')?.planeta).toBe('Sol');
      expect(getSoundPlanet('852')?.planeta).toBe('Lua');
    });

    it('should find planet by musical note', () => {
      expect(getSoundPlanet('E')?.planeta).toBe('Sol');
      expect(getSoundPlanet('A')?.planeta).toBe('Lua');
      expect(getSoundPlanet('D')?.planeta).toBe('Marte');
      expect(getSoundPlanet('F#')?.planeta).toBe('Mercúrio');
      expect(getSoundPlanet('G')?.planeta).toBe('Júpiter');
      expect(getSoundPlanet('G#')?.planeta).toBe('Vênus');
      expect(getSoundPlanet('C')?.planeta).toBe('Saturno');
    });

    it('should be case-insensitive for sounds and notes', () => {
      expect(getSoundPlanet('ram')?.planeta).toBe('Sol');
      expect(getSoundPlanet('om')?.planeta).toBe('Lua');
      expect(getSoundPlanet('e')?.planeta).toBe('Sol');
    });

    it('should return undefined for unknown sound', () => {
      expect(getSoundPlanet('UNKNOWN')).toBeUndefined();
      expect(getSoundPlanet('')).toBeUndefined();
      expect(getSoundPlanet(999)).toBeUndefined();
    });
  });

  describe('getAllPlanetSounds', () => {
    it('should return all 7 classical planets', () => {
      const result = getAllPlanetSounds();
      expect(result).toHaveLength(7);
    });

    it('should return planets in correct order (1-7)', () => {
      const result = getAllPlanetSounds();
      expect(result[0].planeta).toBe('Sol');
      expect(result[0].planeta_numero).toBe(1);
      expect(result[1].planeta).toBe('Lua');
      expect(result[1].planeta_numero).toBe(2);
      expect(result[2].planeta).toBe('Marte');
      expect(result[2].planeta_numero).toBe(3);
      expect(result[3].planeta).toBe('Mercúrio');
      expect(result[3].planeta_numero).toBe(4);
      expect(result[4].planeta).toBe('Júpiter');
      expect(result[4].planeta_numero).toBe(5);
      expect(result[5].planeta).toBe('Vênus');
      expect(result[5].planeta_numero).toBe(6);
      expect(result[6].planeta).toBe('Saturno');
      expect(result[6].planeta_numero).toBe(7);
    });

    it('should return array with all required properties for each planet', () => {
      const result = getAllPlanetSounds();
      result.forEach((planet) => {
        expect(planet).toHaveProperty('planeta');
        expect(planet).toHaveProperty('planeta_numero');
        expect(planet).toHaveProperty('som_sagrado');
        expect(planet).toHaveProperty('frequencia_hz');
        expect(planet).toHaveProperty('nota_musical');
        expect(planet).toHaveProperty('elemento');
        expect(planet).toHaveProperty('qualidade_energetica');
        expect(planet).toHaveProperty('descricao');
        expect(planet).toHaveProperty('chakra_correspondencia');
      });
    });

    it('should contain unique frequencies for each planet', () => {
      const result = getAllPlanetSounds();
      const frequencies = result.map(r => r.frequencia_hz);
      const uniqueFrequencies = new Set(frequencies);
      expect(uniqueFrequencies.size).toBe(7);
    });

    it('should contain unique musical notes for each planet', () => {
      const result = getAllPlanetSounds();
      const notes = result.map(r => r.nota_musical);
      const uniqueNotes = new Set(notes);
      expect(uniqueNotes.size).toBe(7);
    });

    it('should contain unique sacred sounds for each planet', () => {
      const result = getAllPlanetSounds();
      const sounds = result.map(r => r.som_sagrado);
      const uniqueSounds = new Set(sounds);
      expect(uniqueSounds.size).toBe(7);
    });
  });

  describe('Sacred sound frequencies', () => {
    it('should use Solfeggio-compatible frequencies', () => {
      const result = getAllPlanetSounds();
      const validFrequencies = [396, 417, 432, 528, 639, 741, 852, 963];
      result.forEach((planet) => {
        expect(validFrequencies).toContain(planet.frequencia_hz);
      });
    });

    it('should have correct chakra correspondences', () => {
      expect(getPlanetSound('Sol')?.chakra_correspondencia).toContain('Sahasrara');
      expect(getPlanetSound('Lua')?.chakra_correspondencia).toContain('Muladhara');
      expect(getPlanetSound('Marte')?.chakra_correspondencia).toContain('Svadhisthana');
      expect(getPlanetSound('Mercúrio')?.chakra_correspondencia).toContain('Manipura');
      expect(getPlanetSound('Júpiter')?.chakra_correspondencia).toContain('Anahata');
      expect(getPlanetSound('Vênus')?.chakra_correspondencia).toContain('Anahata');
      expect(getPlanetSound('Saturno')?.chakra_correspondencia).toContain('Muladhara');
    });
  });

  describe('Energetic qualities', () => {
    it('should have correct energetic quality classification for each planet', () => {
      expect(getPlanetSound('Sol')?.qualidade_energetica).toBe('Quente / Radiante');
      expect(getPlanetSound('Lua')?.qualidade_energetica).toBe('Fria / Receptiva');
      expect(getPlanetSound('Marte')?.qualidade_energetica).toBe('Quente / Radiante');
      expect(getPlanetSound('Mercúrio')?.qualidade_energetica).toBe('Neutra / Volátil');
      expect(getPlanetSound('Júpiter')?.qualidade_energetica).toBe('Fria / Expansiva');
      expect(getPlanetSound('Vênus')?.qualidade_energetica).toBe('Fria / Receptiva');
      expect(getPlanetSound('Saturno')?.qualidade_energetica).toBe('Quente / Densa');
    });
  });

  describe('Musical notes alignment', () => {
    it('should have valid musical notes', () => {
      const result = getAllPlanetSounds();
      const validNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D#', 'F#', 'G#', 'A#'];
      result.forEach((planet) => {
        expect(validNotes).toContain(planet.nota_musical);
      });
    });
  });

  describe('Element correspondences', () => {
    it('should have element correspondences matching planet-chakra module', () => {
      expect(getPlanetSound('Sol')?.elemento).toBe('Fogo');
      expect(getPlanetSound('Lua')?.elemento).toBe('Água');
      expect(getPlanetSound('Marte')?.elemento).toBe('Fogo');
      expect(getPlanetSound('Mercúrio')?.elemento).toBe('Ar');
      expect(getPlanetSound('Júpiter')?.elemento).toBe('Fogo / Água');
      expect(getPlanetSound('Vênus')?.elemento).toBe('Água');
      expect(getPlanetSound('Saturno')?.elemento).toBe('Terra');
    });
  });

  describe('Cross-reference consistency', () => {
    it('should maintain consistency between getPlanetSound and getSoundPlanet', () => {
      const planets = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'];
      planets.forEach((planeta) => {
        const sound = getPlanetSound(planeta);
        expect(sound).toBeDefined();
        
        // Find planet by its sacred sound
        const foundBySound = getSoundPlanet(sound!.som_sagrado);
        expect(foundBySound?.planeta).toBe(planeta);
        
        // Find planet by its frequency
        const foundByFreq = getSoundPlanet(sound!.frequencia_hz);
        expect(foundByFreq?.planeta).toBe(planeta);
        
        // Find planet by its musical note
        const foundByNote = getSoundPlanet(sound!.nota_musical);
        expect(foundByNote?.planeta).toBe(planeta);
      });
    });
  });
});