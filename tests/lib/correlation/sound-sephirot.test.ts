/**
 * Sound-Sephirot Spiritual Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getSoundSephirot,
  getSephirotSound,
  getAllSoundSephiroth,
  getAllSounds,
  getAllSephiroth,
  getSoundsBySephirah,
  getHealingProperties,
  getElementBySound,
  getPlanetBySound,
  getSoundsByElement,
  getSoundsByPlanet,
  hasSoundSephirot,
  getPathBySound,
  SOUND_SEPHIROT_MAPPINGS,
  type SoundSephirot,
} from '@/lib/correlation/sound-sephirot';

describe('sound-sephirot', () => {
  // ─── getSoundSephirot: valid sounds ───────────────────────────────────────

  describe('getSoundSephirot', () => {
    it('returns correct mapping for AUM (Kether)', () => {
      const result = getSoundSephirot('AUM');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Kether');
      expect(result?.numero_caminho).toBe(1);
      expect(result?.elemento).toBe('Éter');
      expect(result?.planeta).toBe('Vênus');
      expect(result?.letra_hebraica).toBe('א');
      expect(result?.propriedades_cura).toContain('Conexão com a fonte divina');
    });

    it('returns correct mapping for OM (Kether)', () => {
      const result = getSoundSephirot('OM');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Kether');
      expect(result?.numero_caminho).toBe(1);
      expect(result?.elemento).toBe('Éter');
    });

    it('returns correct mapping for YAH (Chokmah)', () => {
      const result = getSoundSephirot('YAH');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Chokmah');
      expect(result?.numero_caminho).toBe(2);
      expect(result?.elemento).toBe('Éter');
      expect(result?.planeta).toBe('Vênus');
    });

    it('returns correct mapping for EHEIEH (Binah)', () => {
      const result = getSoundSephirot('EHEIEH');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Binah');
      expect(result?.numero_caminho).toBe(3);
      expect(result?.elemento).toBe('Água');
      expect(result?.planeta).toBe('Saturno');
      expect(result?.propriedades_cura).toContain('Dissolução de traumas emocionais profundos');
    });

    it('returns correct mapping for EL (Chesed)', () => {
      const result = getSoundSephirot('EL');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.numero_caminho).toBe(4);
      expect(result?.elemento).toBe('Água');
      expect(result?.planeta).toBe('Júpiter');
    });

    it('returns correct mapping for ELOHIM (Geburah)', () => {
      const result = getSoundSephirot('ELOHIM');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Geburah');
      expect(result?.numero_caminho).toBe(5);
      expect(result?.elemento).toBe('Fogo');
      expect(result?.planeta).toBe('Marte');
      expect(result?.propriedades_cura).toContain('Dissolução de medos ancestrais');
    });

    it('returns correct mapping for YHVH (Tiphereth)', () => {
      const result = getSoundSephirot('YHVH');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.numero_caminho).toBe(6);
      expect(result?.elemento).toBe('Fogo');
      expect(result?.planeta).toBe('Sol');
      expect(result?.nome_divino).toBe('YHVH ELOAH VA-DAATH');
    });

    it('returns correct mapping for ELOHIM_SABBAOTH (Netzach)', () => {
      const result = getSoundSephirot('ELOHIM_SABBAOTH');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.numero_caminho).toBe(7);
      expect(result?.elemento).toBe('Fogo');
      expect(result?.planeta).toBe('Vênus');
    });

    it('returns correct mapping for ELOHIM_TZABAOTH (Hod)', () => {
      const result = getSoundSephirot('ELOHIM_TZABAOTH');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Hod');
      expect(result?.numero_caminho).toBe(8);
      expect(result?.elemento).toBe('Ar');
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.propriedades_cura).toContain('Clarificação de pensamentos confusos');
    });

    it('returns correct mapping for SHADDAI (Yesod)', () => {
      const result = getSoundSephirot('SHADDAI');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.numero_caminho).toBe(9);
      expect(result?.elemento).toBe('Água');
      expect(result?.planeta).toBe('Lua');
    });

    it('returns correct mapping for ADONAI (Malkuth)', () => {
      const result = getSoundSephirot('ADONAI');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Malkuth');
      expect(result?.numero_caminho).toBe(10);
      expect(result?.elemento).toBe('Terra');
      expect(result?.planeta).toBe('Terra');
      expect(result?.propriedades_cura).toContain('Aterramento em momentos de fuga');
    });

    it('handles lowercase sound names', () => {
      const result = getSoundSephirot('aum');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Kether');
    });

    it('handles mixed case sound names', () => {
      const result = getSoundSephirot('Yhvh');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Tiphereth');
    });

    it('handles sound names with extra whitespace', () => {
      const result = getSoundSephirot('  OM  ');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Kether');
    });

    it('returns undefined for unknown sound', () => {
      const result = getSoundSephirot('UNKNOWN');
      expect(result).toBeUndefined();
    });
  });

  // ─── getSephirotSound: reverse lookup ─────────────────────────────────────

  describe('getSephirotSound', () => {
    it('returns sound for Kether', () => {
      const result = getSephirotSound('Kether');
      expect(result).toBe('AUM');
    });

    it('returns sound for Chokmah', () => {
      const result = getSephirotSound('Chokmah');
      expect(result).toBe('YAH');
    });

    it('returns sound for Binah', () => {
      const result = getSephirotSound('Binah');
      expect(result).toBe('EHEIEH');
    });

    it('returns sound for Chesed', () => {
      const result = getSephirotSound('Chesed');
      expect(result).toBe('EL');
    });

    it('returns sound for Geburah', () => {
      const result = getSephirotSound('Geburah');
      expect(result).toBe('ELOHIM');
    });

    it('returns sound for Tiphereth', () => {
      const result = getSephirotSound('Tiphereth');
      expect(result).toBe('YHVH');
    });

    it('returns sound for Netzach', () => {
      const result = getSephirotSound('Netzach');
      expect(result).toBe('ELOHIM_SABBAOTH');
    });

    it('returns sound for Hod', () => {
      const result = getSephirotSound('Hod');
      expect(result).toBe('ELOHIM_TZABAOTH');
    });

    it('returns sound for Yesod', () => {
      const result = getSephirotSound('Yesod');
      expect(result).toBe('SHADDAI');
    });

    it('returns sound for Malkuth', () => {
      const result = getSephirotSound('Malkuth');
      expect(result).toBe('ADONAI');
    });

    it('handles lowercase sephirah names', () => {
      const result = getSephirotSound('tiphereth');
      expect(result).toBe('YHVH');
    });

    it('returns undefined for unknown sephirah', () => {
      const result = getSephirotSound('Unknown');
      expect(result).toBeUndefined();
    });
  });

  // ─── getAllSoundSephiroth ──────────────────────────────────────────────────

  describe('getAllSoundSephiroth', () => {
    it('returns all sound-sephirot mappings', () => {
      const result = getAllSoundSephiroth();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings sorted by path number', () => {
      const result = getAllSoundSephiroth();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].numero_caminho).toBeGreaterThanOrEqual(result[i - 1].numero_caminho);
      }
    });

    it('includes all required properties in each mapping', () => {
      const result = getAllSoundSephiroth();
      for (const mapping of result) {
        expect(mapping.som).toBeDefined();
        expect(mapping.sephirah).toBeDefined();
        expect(mapping.numero_caminho).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.elemento_en).toBeDefined();
        expect(mapping.propriedades_cura).toBeDefined();
        expect(Array.isArray(mapping.propriedades_cura)).toBe(true);
        expect(mapping.planeta).toBeDefined();
        expect(mapping.direcao).toBeDefined();
        expect(mapping.nome_divino).toBeDefined();
        expect(mapping.letra_hebraica).toBeDefined();
        expect(mapping.dinamica).toBeDefined();
      }
    });
  });

  // ─── getAllSounds ───────────────────────────────────────────────────────────

  describe('getAllSounds', () => {
    it('returns array of all sounds', () => {
      const result = getAllSounds();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes primary sounds for each sephirah', () => {
      const result = getAllSounds();
      expect(result).toContain('AUM');
      expect(result).toContain('ELOHIM');
      expect(result).toContain('YHVH');
      expect(result).toContain('ADONAI');
    });
  });

  // ─── getAllSephiroth ────────────────────────────────────────────────────────

  describe('getAllSephiroth', () => {
    it('returns all 10 sephiroth', () => {
      const result = getAllSephiroth();
      expect(result).toContain('Kether');
      expect(result).toContain('Chokmah');
      expect(result).toContain('Binah');
      expect(result).toContain('Chesed');
      expect(result).toContain('Geburah');
      expect(result).toContain('Tiphereth');
      expect(result).toContain('Netzach');
      expect(result).toContain('Hod');
      expect(result).toContain('Yesod');
      expect(result).toContain('Malkuth');
    });

    it('returns unique sephiroth without duplicates', () => {
      const result = getAllSephiroth();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  // ─── getSoundsBySephirah ────────────────────────────────────────────────────

  describe('getSoundsBySephirah', () => {
    it('returns all sounds for Kether', () => {
      const result = getSoundsBySephirah('Kether');
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some(s => s.som === 'AUM')).toBe(true);
      expect(result.some(s => s.som === 'OM')).toBe(true);
    });

    it('returns all sounds for Tiphereth', () => {
      const result = getSoundsBySephirah('Tiphereth');
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some(s => s.som === 'YHVH')).toBe(true);
      expect(result.some(s => s.som === 'RA')).toBe(true);
    });

    it('handles lowercase sephirah names', () => {
      const result = getSoundsBySephirah('malkuth');
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty array for unknown sephirah', () => {
      const result = getSoundsBySephirah('Unknown');
      expect(result).toEqual([]);
    });
  });

  // ─── getHealingProperties ───────────────────────────────────────────────────

  describe('getHealingProperties', () => {
    it('returns healing properties for valid sound', () => {
      const result = getHealingProperties('AUM');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
    });

    it('returns healing properties for YHVH', () => {
      const result = getHealingProperties('YHVH');
      expect(result).toContain('Harmonização do ego com o eu superior');
    });

    it('returns undefined for unknown sound', () => {
      const result = getHealingProperties('UNKNOWN');
      expect(result).toBeUndefined();
    });
  });

  // ─── getElementBySound ──────────────────────────────────────────────────────

  describe('getElementBySound', () => {
    it('returns Éter for AUM', () => {
      expect(getElementBySound('AUM')).toBe('Éter');
    });

    it('returns Água for EHEIEH', () => {
      expect(getElementBySound('EHEIEH')).toBe('Água');
    });

    it('returns Fogo for YHVH', () => {
      expect(getElementBySound('YHVH')).toBe('Fogo');
    });

    it('returns Ar for ELOHIM_TZABAOTH', () => {
      expect(getElementBySound('ELOHIM_TZABAOTH')).toBe('Ar');
    });

    it('returns Terra for ADONAI', () => {
      expect(getElementBySound('ADONAI')).toBe('Terra');
    });

    it('returns undefined for unknown sound', () => {
      expect(getElementBySound('UNKNOWN')).toBeUndefined();
    });
  });

  // ─── getPlanetBySound ───────────────────────────────────────────────────────

  describe('getPlanetBySound', () => {
    it('returns Vênus for Kether sounds', () => {
      expect(getPlanetBySound('AUM')).toBe('Vênus');
    });

    it('returns Saturno for Binah sounds', () => {
      expect(getPlanetBySound('EHEIEH')).toBe('Saturno');
    });

    it('returns Sol for Tiphereth sounds', () => {
      expect(getPlanetBySound('YHVH')).toBe('Sol');
    });

    it('returns Lua for Yesod sounds', () => {
      expect(getPlanetBySound('SHADDAI')).toBe('Lua');
    });

    it('returns Terra for Malkuth sounds', () => {
      expect(getPlanetBySound('ADONAI')).toBe('Terra');
    });

    it('returns undefined for unknown sound', () => {
      expect(getPlanetBySound('UNKNOWN')).toBeUndefined();
    });
  });

  // ─── getSoundsByElement ────────────────────────────────────────────────────

  describe('getSoundsByElement', () => {
    it('returns sounds for Éter element', () => {
      const result = getSoundsByElement('Éter');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.elemento === 'Éter')).toBe(true);
    });

    it('returns sounds for Água element', () => {
      const result = getSoundsByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.elemento === 'Água')).toBe(true);
    });

    it('returns sounds for Fogo element', () => {
      const result = getSoundsByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.elemento === 'Fogo')).toBe(true);
    });

    it('handles lowercase element names', () => {
      const result = getSoundsByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown element', () => {
      const result = getSoundsByElement('Unknown');
      expect(result).toEqual([]);
    });
  });

  // ─── getSoundsByPlanet ──────────────────────────────────────────────────────

  describe('getSoundsByPlanet', () => {
    it('returns sounds for Sol', () => {
      const result = getSoundsByPlanet('Sol');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.planeta === 'Sol')).toBe(true);
    });

    it('returns sounds for Lua', () => {
      const result = getSoundsByPlanet('Lua');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.planeta === 'Lua')).toBe(true);
    });

    it('handles lowercase planet names', () => {
      const result = getSoundsByPlanet('lua');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown planet', () => {
      const result = getSoundsByPlanet('Unknown');
      expect(result).toEqual([]);
    });
  });

  // ─── hasSoundSephirot ───────────────────────────────────────────────────────

  describe('hasSoundSephirot', () => {
    it('returns true for valid sounds', () => {
      expect(hasSoundSephirot('AUM')).toBe(true);
      expect(hasSoundSephirot('YHVH')).toBe(true);
      expect(hasSoundSephirot('ADONAI')).toBe(true);
    });

    it('returns true for lowercase sounds', () => {
      expect(hasSoundSephirot('aum')).toBe(true);
      expect(hasSoundSephirot('yhvh')).toBe(true);
    });

    it('returns false for unknown sounds', () => {
      expect(hasSoundSephirot('UNKNOWN')).toBe(false);
    });
  });

  // ─── getPathBySound ─────────────────────────────────────────────────────────

  describe('getPathBySound', () => {
    it('returns correct path for Kether sounds', () => {
      expect(getPathBySound('AUM')).toBe(1);
      expect(getPathBySound('OM')).toBe(1);
    });

    it('returns correct path for Chokmah sounds', () => {
      expect(getPathBySound('YAH')).toBe(2);
    });

    it('returns correct path for Binah sounds', () => {
      expect(getPathBySound('EHEIEH')).toBe(3);
    });

    it('returns correct path for Chesed sounds', () => {
      expect(getPathBySound('EL')).toBe(4);
    });

    it('returns correct path for Geburah sounds', () => {
      expect(getPathBySound('ELOHIM')).toBe(5);
    });

    it('returns correct path for Tiphereth sounds', () => {
      expect(getPathBySound('YHVH')).toBe(6);
    });

    it('returns correct path for Netzach sounds', () => {
      expect(getPathBySound('ELOHIM_SABBAOTH')).toBe(7);
    });

    it('returns correct path for Hod sounds', () => {
      expect(getPathBySound('ELOHIM_TZABAOTH')).toBe(8);
    });

    it('returns correct path for Yesod sounds', () => {
      expect(getPathBySound('SHADDAI')).toBe(9);
    });

    it('returns correct path for Malkuth sounds', () => {
      expect(getPathBySound('ADONAI')).toBe(10);
    });

    it('returns undefined for unknown sound', () => {
      expect(getPathBySound('UNKNOWN')).toBeUndefined();
    });
  });

  // ─── SOUND_SEPHIROT_MAPPINGS constant ───────────────────────────────────────

  describe('SOUND_SEPHIROT_MAPPINGS', () => {
    it('is defined and frozen', () => {
      expect(SOUND_SEPHIROT_MAPPINGS).toBeDefined();
      expect(Object.isFrozen(SOUND_SEPHIROT_MAPPINGS)).toBe(true);
    });

    it('contains primary sound names', () => {
      expect('AUM' in SOUND_SEPHIROT_MAPPINGS).toBe(true);
      expect('YHVH' in SOUND_SEPHIROT_MAPPINGS).toBe(true);
      expect('ADONAI' in SOUND_SEPHIROT_MAPPINGS).toBe(true);
    });
  });

  // ─── SoundSephirot interface completeness ──────────────────────────────────

  describe('SoundSephirot interface completeness', () => {
    it('contains all required fields in each entry', () => {
      const entries = Object.values(SOUND_SEPHIROT_MAPPINGS);
      for (const entry of entries) {
        expect(typeof entry.som).toBe('string');
        expect(typeof entry.pronunciacao).toBe('string');
        expect(typeof entry.sephirah).toBe('string');
        expect(typeof entry.numero_caminho).toBe('number');
        expect(typeof entry.elemento).toBe('string');
        expect(typeof entry.elemento_en).toBe('string');
        expect(Array.isArray(entry.propriedades_cura)).toBe(true);
        expect(typeof entry.planeta).toBe('string');
        expect(typeof entry.direcao).toBe('string');
        expect(typeof entry.nome_divino).toBe('string');
        expect(typeof entry.letra_hebraica).toBe('string');
        expect(typeof entry.dinamica).toBe('string');
      }
    });

    it('has valid path numbers (1-10)', () => {
      const entries = Object.values(SOUND_SEPHIROT_MAPPINGS);
      for (const entry of entries) {
        expect(entry.numero_caminho).toBeGreaterThanOrEqual(1);
        expect(entry.numero_caminho).toBeLessThanOrEqual(10);
      }
    });

    it('has valid Hebrew letters', () => {
      const entries = Object.values(SOUND_SEPHIROT_MAPPINGS);
      for (const entry of entries) {
        expect(entry.letra_hebraica.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Element distribution ──────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('has sounds for Éter element (Kether, Chokmah)', () => {
      const ether = getSoundsByElement('Éter');
      expect(ether.length).toBeGreaterThan(0);
    });

    it('has sounds for Água element (Binah, Chesed, Yesod)', () => {
      const water = getSoundsByElement('Água');
      expect(water.length).toBeGreaterThan(0);
    });

    it('has sounds for Fogo element (Geburah, Tiphereth, Netzach)', () => {
      const fire = getSoundsByElement('Fogo');
      expect(fire.length).toBeGreaterThan(0);
    });

    it('has sounds for Ar element (Hod)', () => {
      const air = getSoundsByElement('Ar');
      expect(air.length).toBeGreaterThan(0);
    });

    it('has sounds for Terra element (Malkuth)', () => {
      const earth = getSoundsByElement('Terra');
      expect(earth.length).toBeGreaterThan(0);
    });
  });

  // ─── Planet distribution ───────────────────────────────────────────────────

  describe('Planet distribution', () => {
    it('has sounds for Vênus', () => {
      const venus = getSoundsByPlanet('Vênus');
      expect(venus.length).toBeGreaterThan(0);
    });

    it('has sounds for Saturno', () => {
      const saturn = getSoundsByPlanet('Saturno');
      expect(saturn.length).toBeGreaterThan(0);
    });

    it('has sounds for Júpiter', () => {
      const jupiter = getSoundsByPlanet('Júpiter');
      expect(jupiter.length).toBeGreaterThan(0);
    });

    it('has sounds for Marte', () => {
      const mars = getSoundsByPlanet('Marte');
      expect(mars.length).toBeGreaterThan(0);
    });

    it('has sounds for Sol', () => {
      const sol = getSoundsByPlanet('Sol');
      expect(sol.length).toBeGreaterThan(0);
    });

    it('has sounds for Mercúrio', () => {
      const mercury = getSoundsByPlanet('Mercúrio');
      expect(mercury.length).toBeGreaterThan(0);
    });

    it('has sounds for Lua', () => {
      const lua = getSoundsByPlanet('Lua');
      expect(lua.length).toBeGreaterThan(0);
    });

    it('has sounds for Terra', () => {
      const terra = getSoundsByPlanet('Terra');
      expect(terra.length).toBeGreaterThan(0);
    });
  });

  // ─── Divine names consistency ──────────────────────────────────────────────

  describe('Divine names consistency', () => {
    it('Kether has EHEIEH as divine name', () => {
      const kether = getSoundsBySephirah('Kether');
      expect(kether.some(s => s.nome_divino === 'EHEIEH')).toBe(true);
    });

    it('Chokmah has YAH as divine name', () => {
      const chokmah = getSoundsBySephirah('Chokmah');
      expect(chokmah.some(s => s.nome_divino === 'YAH')).toBe(true);
    });

    it('Tiphereth has YHVH ELOAH VA-DAATH as divine name', () => {
      const tipereth = getSoundsBySephirah('Tiphereth');
      expect(tipereth.some(s => s.nome_divino === 'YHVH ELOAH VA-DAATH')).toBe(true);
    });

    it('Malkuth has ADONAI HA-ARETZ as divine name', () => {
      const malkuth = getSoundsBySephirah('Malkuth');
      expect(malkuth.some(s => s.nome_divino === 'ADONAI HA-ARETZ')).toBe(true);
    });
  });

  // ─── Healing properties coverage ───────────────────────────────────────────

  describe('Healing properties coverage', () => {
    it('all sounds have healing properties', () => {
      const entries = Object.values(SOUND_SEPHIROT_MAPPINGS);
      for (const entry of entries) {
        expect(entry.propriedades_cura.length).toBeGreaterThan(0);
      }
    });

    it('healing properties are meaningful strings', () => {
      const entries = Object.values(SOUND_SEPHIROT_MAPPINGS);
      for (const entry of entries) {
        for (const prop of entry.propriedades_cura) {
          expect(typeof prop).toBe('string');
          expect(prop.length).toBeGreaterThan(10);
        }
      }
    });
  });
});
