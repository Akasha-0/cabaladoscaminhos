/**
 * Odú Ifá - Day Correlation Tests
 */
import { describe, it, expect } from 'vitest';
import { getOduDay, getDayOdu, getAllOduDays, getAllDaysWithOdus, getAllOduNumbers, getAllOduNames, getOduDaysByElement, hasOduDay, hasDayOdu, getPrimaryDayForOdu, getOduElement, type OduDay, type ElementType } from '@/lib/correlation/oddu-day';

describe('Odú Ifá - Day Correlation', () => {
  describe('getOduDay by number', () => {
    it('should return mappings for Odu 1', () => { const result = getOduDay(1); expect(result).toHaveLength(2); expect(result[0].odu_numero).toBe(1); expect(result[0].dia).toBe('Segunda-feira'); expect(result[1].dia).toBe('Domingo'); });
    it('should return mapping for Odu 2', () => { const result = getOduDay(2); expect(result).toHaveLength(1); expect(result[0].dia).toBe('Sábado'); });
    it('should return mappings for Odu 3', () => { expect(getOduDay(3)).toHaveLength(2); });
    it('should return empty for invalid Odu', () => { expect(getOduDay(99)).toHaveLength(0); });
  });
  describe('getOduDay by name', () => {
    it('should return mappings for Okaran', () => { expect(getOduDay('Okaran').length).toBeGreaterThan(0); });
    it('should be case-insensitive', () => { expect(getOduDay('okaran').length).toBeGreaterThan(0); });
    it('should return empty for unknown', () => { expect(getOduDay('Unknown')).toHaveLength(0); });
  });
  describe('getDayOdu', () => {
    it('should return Odus for Segunda-feira', () => { expect(getDayOdu('Segunda-feira').length).toBeGreaterThan(0); });
    it('should return empty for Quarta-feira', () => { expect(getDayOdu('Quarta-feira')).toHaveLength(0); });
    it('should return Odus for Sábado', () => { expect(getDayOdu('Sábado').length).toBeGreaterThan(0); });
  });
  describe('getAllOduDays', () => {
    it('should have 24 mappings', () => { expect(getAllOduDays()).toHaveLength(24); });
    it('should contain all 16 Odus', () => { expect(new Set(getAllOduDays().map(m => m.odu_numero)).size).toBe(16); });
  });
  describe('getAllOduNumbers', () => {
    it('should return 1-16', () => { expect(getAllOduNumbers()).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]); });
  });
  describe('getAllDaysWithOdus', () => {
    it('should return 4 days', () => { expect(getAllDaysWithOdus()).toHaveLength(4); });
  });
  describe('getOduDaysByElement', () => {
    it('should return fogo Odus', () => { expect(getOduDaysByElement('fogo').length).toBeGreaterThan(0); });
    it('should return água Odus', () => { expect(getOduDaysByElement('água').length).toBeGreaterThan(0); });
    it('should return empty for ar', () => { expect(getOduDaysByElement('ar')).toHaveLength(0); });
  });
  describe('hasOduDay', () => {
    it('should return true for valid', () => { expect(hasOduDay(1)).toBe(true); expect(hasOduDay(16)).toBe(true); });
    it('should return false for invalid', () => { expect(hasOduDay(0)).toBe(false); expect(hasOduDay(99)).toBe(false); });
  });
  describe('hasDayOdu', () => {
    it('should return true for valid days', () => { expect(hasDayOdu('Segunda-feira')).toBe(true); expect(hasDayOdu('Terça-feira')).toBe(true); });
    it('should return false for Wednesday', () => { expect(hasDayOdu('Quarta-feira')).toBe(false); });
  });
  describe('getPrimaryDayForOdu', () => {
    it('should return primary day', () => { expect(getPrimaryDayForOdu(1)).toBe('Segunda-feira'); expect(getPrimaryDayForOdu(2)).toBe('Sábado'); });
    it('should return null for invalid', () => { expect(getPrimaryDayForOdu(99)).toBeNull(); });
  });
  describe('getOduElement', () => {
    it('should return element', () => { expect(getOduElement(1)).toBe('éter'); expect(getOduElement(2)).toBe('água'); expect(getOduElement(5)).toBe('fogo'); });
    it('should return null for invalid', () => { expect(getOduElement(99)).toBeNull(); });
  });
  describe('Spiritual Meaning Validation', () => {
    it('should have spiritual meaning for all', () => { for (const m of getAllOduDays()) { expect(m.significado_espiritual.length).toBeGreaterThan(0); } });
    it('should have valid elements', () => { const valid: ElementType[] = ['fogo', 'água', 'ar', 'terra', 'éter']; for (const m of getAllOduDays()) { expect(valid).toContain(m.elemento); } });
  });
  describe('Type exports', () => {
    it('should export OduDay interface', () => { const m: OduDay = { odu_numero: 1, odu_nome: 'Test', odu_nome_yoruba: 'Test', dia: 'Test', elemento: 'água', significado_espiritual: 'Test' }; expect(m.odu_numero).toBe(1); });
  });
});
