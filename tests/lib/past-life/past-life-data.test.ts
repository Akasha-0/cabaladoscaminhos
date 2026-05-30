import { describe, it, expect } from 'vitest';
import {
  getData,
  getProfileById,
  getProfilesByEra,
  getProfilesByCulture,
  getProfilesBySpiritualAge,
  getRelationshipById,
  getRelationshipsByType,
  getThemeById,
  getThemesByCategory,
  getSkillById,
  getSkillsByDomain
} from '@/lib/past-life/past-life-data';

describe('past-life/past-life-data', () => {
  it('returns data with profiles', () => {
    const data = getData();
    expect(data).toBeDefined();
    expect(data.profiles).toBeDefined();
  });

  it('getProfileById returns a profile', () => {
    const profile = getProfileById('ancient-healer');
    expect(profile).toBeDefined();
  });

  it('getProfilesByEra filters by era', () => {
    const profiles = getProfilesByEra('ancient');
    expect(Array.isArray(profiles)).toBe(true);
  });

  it('getSkillById returns a skill', () => {
    const skill = getSkillById('energy-healing');
    expect(skill).toBeDefined();
  });

  it('getThemeById returns a theme', () => {
    const theme = getThemeById('abandonment');
    expect(theme).toBeDefined();
  });
});