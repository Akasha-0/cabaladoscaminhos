import { describe, it, expect } from 'vitest';
import {
  getTypes,
  getTypeById,
  getTypeByName,
  type EnergyType,
} from '@/lib/energy/energy-types';

describe('energy-types module', () => {
  describe('getTypes', () => {
    it('returns an array', () => {
      const types = getTypes();
      expect(Array.isArray(types)).toBe(true);
    });

    it('returns all energy types', () => {
      const types = getTypes();
      expect(types.length).toBe(8);
    });

    it('each type has required fields', () => {
      const types = getTypes();
      types.forEach((type) => {
        expect(type).toHaveProperty('id');
        expect(type).toHaveProperty('name');
        expect(type).toHaveProperty('namePt');
        expect(type).toHaveProperty('nameEn');
        expect(type).toHaveProperty('description');
        expect(type).toHaveProperty('descriptionPt');
        expect(type).toHaveProperty('characteristics');
        expect(type).toHaveProperty('associatedPractices');
        expect(type).toHaveProperty('color');
        expect(type).toHaveProperty('colorHex');
        expect(type).toHaveProperty('element');
      });
    });

    it('each type has non-empty id', () => {
      const types = getTypes();
      types.forEach((type) => {
        expect(type.id).toBeTruthy();
        expect(typeof type.id).toBe('string');
      });
    });

    it('each type has non-empty characteristics array', () => {
      const types = getTypes();
      types.forEach((type) => {
        expect(Array.isArray(type.characteristics)).toBe(true);
        expect(type.characteristics.length).toBeGreaterThan(0);
      });
    });

    it('each type has non-empty associatedPractices array', () => {
      const types = getTypes();
      types.forEach((type) => {
        expect(Array.isArray(type.associatedPractices)).toBe(true);
        expect(type.associatedPractices.length).toBeGreaterThan(0);
      });
    });

    it('contains expected energy types by id', () => {
      const types = getTypes();
      const ids = types.map((t) => t.id);
      expect(ids).toContain('yang');
      expect(ids).toContain('yin');
      expect(ids).toContain('prana');
      expect(ids).toContain('qi');
      expect(ids).toContain('chakra');
      expect(ids).toContain('stellar');
      expect(ids).toContain('earth');
      expect(ids).toContain('sacred');
    });

    it('returns the same array reference on multiple calls', () => {
      const types1 = getTypes();
      const types2 = getTypes();
      expect(types1).toBe(types2);
    });
  });

  describe('getTypeById', () => {
    it('returns energy type for valid id "yang"', () => {
      const type = getTypeById('yang');
      expect(type).toBeDefined();
      expect(type?.id).toBe('yang');
      expect(type?.name).toBe('Yang');
    });

    it('returns energy type for valid id "yin"', () => {
      const type = getTypeById('yin');
      expect(type).toBeDefined();
      expect(type?.id).toBe('yin');
      expect(type?.name).toBe('Yin');
    });

    it('returns energy type for valid id "prana"', () => {
      const type = getTypeById('prana');
      expect(type).toBeDefined();
      expect(type?.id).toBe('prana');
    });

    it('returns energy type for valid id "qi"', () => {
      const type = getTypeById('qi');
      expect(type).toBeDefined();
      expect(type?.id).toBe('qi');
    });

    it('returns energy type for valid id "chakra"', () => {
      const type = getTypeById('chakra');
      expect(type).toBeDefined();
      expect(type?.id).toBe('chakra');
    });

    it('returns energy type for valid id "stellar"', () => {
      const type = getTypeById('stellar');
      expect(type).toBeDefined();
      expect(type?.id).toBe('stellar');
    });

    it('returns energy type for valid id "earth"', () => {
      const type = getTypeById('earth');
      expect(type).toBeDefined();
      expect(type?.id).toBe('earth');
    });

    it('returns energy type for valid id "sacred"', () => {
      const type = getTypeById('sacred');
      expect(type).toBeDefined();
      expect(type?.id).toBe('sacred');
    });

    it('returns undefined for unknown id', () => {
      const type = getTypeById('unknown-energy');
      expect(type).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const type = getTypeById('');
      expect(type).toBeUndefined();
    });

    it('returns undefined for null-like input', () => {
      const type = getTypeById('notexist');
      expect(type).toBeUndefined();
    });

    it('returns complete energy type with all properties', () => {
      const type = getTypeById('yang') as EnergyType | undefined;
      expect(type).toBeDefined();
      expect(type?.description).toContain('Active');
      expect(type?.characteristics).toContain('Expansive');
      expect(type?.associatedPractices).toContain('Sun salutation');
      expect(type?.color).toBe('Golden');
      expect(type?.colorHex).toBe('#FFD700');
      expect(type?.element).toBe('Fire');
    });
  });

  describe('getTypeByName', () => {
    it('finds energy type by exact English name "Yang"', () => {
      const type = getTypeByName('Yang');
      expect(type).toBeDefined();
      expect(type?.id).toBe('yang');
    });

    it('finds energy type by exact English name "Yin"', () => {
      const type = getTypeByName('Yin');
      expect(type).toBeDefined();
      expect(type?.id).toBe('yin');
    });

    it('finds energy type by exact English name "Prana"', () => {
      const type = getTypeByName('Prana');
      expect(type).toBeDefined();
      expect(type?.id).toBe('prana');
    });

    it('finds energy type by exact English name "Qi"', () => {
      const type = getTypeByName('Qi');
      expect(type).toBeDefined();
      expect(type?.id).toBe('qi');
    });

    it('finds energy type by exact English name "Chakra"', () => {
      const type = getTypeByName('Chakra');
      expect(type).toBeDefined();
      expect(type?.id).toBe('chakra');
    });

    it('finds energy type by exact English name "Stellar"', () => {
      const type = getTypeByName('Stellar');
      expect(type).toBeDefined();
      expect(type?.id).toBe('stellar');
    });

    it('finds energy type by exact English name "Earth"', () => {
      const type = getTypeByName('Earth');
      expect(type).toBeDefined();
      expect(type?.id).toBe('earth');
    });

    it('finds energy type by exact English name "Sacred"', () => {
      const type = getTypeByName('Sacred');
      expect(type).toBeDefined();
      expect(type?.id).toBe('sacred');
    });

    it('search is case-insensitive for English names', () => {
      expect(getTypeByName('YANG')?.id).toBe('yang');
      expect(getTypeByName('yin')?.id).toBe('yin');
      expect(getTypeByName('PrAnA')?.id).toBe('prana');
      expect(getTypeByName('qI')?.id).toBe('qi');
    });

    it('finds energy type by Portuguese name "Energia Estelar"', () => {
      const type = getTypeByName('Energia Estelar');
      expect(type).toBeDefined();
      expect(type?.id).toBe('stellar');
    });

    it('finds energy type by Portuguese name "Energia Sagrada"', () => {
      const type = getTypeByName('Energia Sagrada');
      expect(type).toBeDefined();
      expect(type?.id).toBe('sacred');
    });

    it('finds energy type by Portuguese name "Terra"', () => {
      const type = getTypeByName('Terra');
      expect(type).toBeDefined();
      expect(type?.id).toBe('earth');
    });

    it('search is case-insensitive for Portuguese names', () => {
      expect(getTypeByName('ENERGIA ESTELAR')?.id).toBe('stellar');
      expect(getTypeByName('energia sagrada')?.id).toBe('sacred');
    });

    it('returns undefined for unknown name', () => {
      const type = getTypeByName('Unknown Energy');
      expect(type).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const type = getTypeByName('');
      expect(type).toBeUndefined();
    });

    it('returns first match when name matches multiple fields', () => {
      // yang matches "Yang" in name, namePt, and nameEn
      const type = getTypeByName('Yang');
      expect(type).toBeDefined();
      expect(type?.id).toBe('yang');
    });

    it('returns complete energy type data', () => {
      const type = getTypeByName('Prana') as EnergyType | undefined;
      expect(type).toBeDefined();
      expect(type?.id).toBe('prana');
      expect(type?.namePt).toBe('Prana');
      expect(type?.nameEn).toBe('Prana');
      expect(type?.characteristics).toContain('Vital');
      expect(type?.element).toBe('Air');
    });
  });
});
