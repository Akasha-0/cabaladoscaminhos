import { describe, it, expect } from 'vitest';
import { getElementSign, getAllElementSigns, getSignsByElement, getElementNature, getElementDirection, isSignOfElement, ELEMENT_SIGN_MAPPINGS } from '@/lib/correlation/element-sign';

describe('correlation/element-sign', () => {
  it('ELEMENT_SIGN_MAPPINGS has 4 elements', () => {
    expect(Object.keys(ELEMENT_SIGN_MAPPINGS)).toHaveLength(4);
  });

  it('Fogo has correct signs', () => {
    const fogo = ELEMENT_SIGN_MAPPINGS.Fogo;
    expect(fogo.elemento).toBe('Fogo');
    expect(fogo.signos_pertencentes.cardinal).toBe('Áries');
    expect(fogo.signos_pertencentes.fixed).toBe('Leão');
    expect(fogo.signos_pertencentes.mutable).toBe('Sagitário');
  });

  it('Terra has correct signs', () => {
    const terra = ELEMENT_SIGN_MAPPINGS.Terra;
    expect(terra.elemento).toBe('Terra');
    expect(terra.signos_pertencentes.cardinal).toBe('Capricórnio');
    expect(terra.signos_pertencentes.fixed).toBe('Touro');
    expect(terra.signos_pertencentes.mutable).toBe('Virgem');
  });

  it('Ar has correct signs', () => {
    const ar = ELEMENT_SIGN_MAPPINGS.Ar;
    expect(ar.elemento).toBe('Ar');
    expect(ar.signos_pertencentes.cardinal).toBe('Balança');
    expect(ar.signos_pertencentes.fixed).toBe('Aquário');
    expect(ar.signos_pertencentes.mutable).toBe('Gémeos');
  });

  it('Água has correct signs', () => {
    const agua = ELEMENT_SIGN_MAPPINGS.Água;
    expect(agua.elemento).toBe('Água');
    expect(agua.signos_pertencentes.cardinal).toBe('Caranguejo');
    expect(agua.signos_pertencentes.fixed).toBe('Escorpião');
    expect(agua.signos_pertencentes.mutable).toBe('Peixes');
  });

  it('getElementSign finds each element', () => {
    expect(getElementSign('Fogo')).toBeDefined();
    expect(getElementSign('Terra')).toBeDefined();
    expect(getElementSign('Ar')).toBeDefined();
    expect(getElementSign('Água')).toBeDefined();
  });

  it('getElementSign returns null for unknown', () => {
    expect(getElementSign('Unknown')).toBeNull();
  });

  it('getAllElementSigns returns 4 elements', () => {
    expect(getAllElementSigns()).toHaveLength(4);
  });

  it('getSignsByElement returns 3 signs per element', () => {
    expect(getSignsByElement('Fogo')).toHaveLength(3);
    expect(getSignsByElement('Terra')).toHaveLength(3);
    expect(getSignsByElement('Ar')).toHaveLength(3);
    expect(getSignsByElement('Água')).toHaveLength(3);
  });

  it('getElementNature returns Yang for Fogo/Ar, Yin for Terra/Água', () => {
    expect(getElementNature('Fogo')).toBe('Yang');
    expect(getElementNature('Ar')).toBe('Yang');
    expect(getElementNature('Terra')).toBe('Yin');
    expect(getElementNature('Água')).toBe('Yin');
  });

  it('getElementDirection returns directions', () => {
    expect(getElementDirection('Fogo')).toBeTruthy();
    expect(getElementDirection('Terra')).toBeTruthy();
    expect(getElementDirection('Ar')).toBeTruthy();
    expect(getElementDirection('Água')).toBeTruthy();
  });

  it('isSignOfElement validates signs', () => {
    expect(isSignOfElement('Fogo', 'Áries')).toBe(true);
    expect(isSignOfElement('Fogo', 'Touro')).toBe(false);
    expect(isSignOfElement('Terra', 'Touro')).toBe(true);
    expect(isSignOfElement('Terra', 'Áries')).toBe(false);
  });
});
