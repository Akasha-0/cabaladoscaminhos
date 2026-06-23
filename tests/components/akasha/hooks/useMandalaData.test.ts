import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMandalaData } from '@/components/akasha/hooks/useMandalaData';
import type { MandalaData } from '@/components/akasha/MandalaChart';

const fullData: MandalaData = {
  incomplete: false,
  odus: {
    oduName: 'Ogbe',
    oduNumber: 1,
    orixaRegency: ['Obatalá'],
    elementalForce: 'Oxumaré',
    provisional: false,
  },
  kabala: {
    lifePath: 3,
    lifePathMaster: false,
    expression: 5,
    expressionMaster: false,
    motivation: 7,
    impression: 9,
    mission: 4,
    personalYear: 6,
    personalMonth: 2,
    personalDay: 15,
    sefira: null,
    hebrewLetter: null,
    tarotCard: null,
    challenges: null,
    pinnacles: null,
    lifeCycles: null,
  },
  tantra: {
    soul: 1,
    karma: 2,
    divineGift: 3,
    destiny: 4,
    tantricPath: 5,
    bodies: [
      { index: 1, name: 'Corpo da Alma', active: true },
      { index: 2, name: 'Mente Negativa', active: true },
      { index: 3, name: 'Mente Positiva', active: false },
      { index: 4, name: 'Mente Neutra', active: true },
      { index: 5, name: 'Corpo Físico', active: true },
      { index: 6, name: 'Linha do Arco', active: false },
      { index: 7, name: 'Aura', active: true },
      { index: 8, name: 'Corpo Prânico', active: true },
      { index: 9, name: 'Corpo Sutil', active: false },
      { index: 10, name: 'Corpo Radiante', active: true },
      { index: 11, name: 'Mente Divina', active: true },
    ],
  },
  astrology: {
    ascendant: 'Leão',
    midheaven: 'Áries',
    dominantPlanet: 'Sol',
    planets: [
      { name: 'Sol', sign: 'Leão', degree: 120, absoluteLongitude: 120, retrograde: false, house: 1 },
      { name: 'Lua', sign: 'Câncer', degree: 90, absoluteLongitude: 90, retrograde: false, house: 2 },
    ],
    aspects: [],
    elementalBalance: { fire: 2, earth: 3, air: 2, water: 3 },
  },
  iching: {
    hexagramNumber: 1,
    hexagramName: 'Qián',
    hexagramChineseName: '乾',
    upperTrigram: 1,
    lowerTrigram: 1,
    upperTrigramName: 'Qián',
    lowerTrigramName: 'Qián',
    lines: [true, true, true, true, true, true],
    algorithm: 'test',
    provisional: false,
    birthDate: null,
    birthTime: null,
    available: true,
    error: null,
  },
};

describe('useMandalaData', () => {
  it('returns all derived data fields', () => {
    const { result } = renderHook(() => useMandalaData(fullData));
    expect(result.current).toHaveProperty('tooltipByLayer');
    expect(result.current).toHaveProperty('planetDots');
    expect(result.current).toHaveProperty('tantricNodes');
    expect(result.current).toHaveProperty('kabVerts');
    expect(result.current).toHaveProperty('trianglePath');
    expect(result.current).toHaveProperty('elem');
    expect(result.current).toHaveProperty('inactiveBodies');
    expect(result.current).toHaveProperty('lpMeaning');
  });

  it('builds 3 kab verts for the triangle', () => {
    const { result } = renderHook(() => useMandalaData(fullData));
    expect(result.current.kabVerts).toHaveLength(3);
    // Vida (lifePath) at angle 0
    expect(result.current.kabVerts[0].value).toBe(3);
    expect(result.current.kabVerts[0].label).toBe('VP');
    // Expressão (expression) at angle 120
    expect(result.current.kabVerts[1].value).toBe(5);
    expect(result.current.kabVerts[1].label).toBe('EX');
    // Motivação (motivation) at angle 240
    expect(result.current.kabVerts[2].value).toBe(7);
    expect(result.current.kabVerts[2].label).toBe('MO');
  });

  it('marks master number vertices', () => {
    const masterData: MandalaData = {
      ...fullData,
      kabala: { ...fullData.kabala, lifePath: 11, lifePathMaster: true },
    };
    const { result } = renderHook(() => useMandalaData(masterData));
    expect(result.current.kabVerts[0].master).toBe(true);
  });

  it('builds a closed triangle path string', () => {
    const { result } = renderHook(() => useMandalaData(fullData));
    const path = result.current.trianglePath;
    expect(path).toMatch(/^M \d+ \d+ L \d+ \d+ L \d+ \d+ Z$/);
    // Path should contain 3 coordinate pairs
    const parts = path.split(' ');
    expect(parts.length).toBe(7); // M, x1, y1, L, x2, y2, ...
  });

  it('tooltipByLayer has keys 1-5', () => {
    const { result } = renderHook(() => useMandalaData(fullData));
    const keys = Object.keys(result.current.tooltipByLayer).map(Number).sort();
    expect(keys).toEqual([1, 2, 3, 4, 5]);
  });

  it('tooltipForLayer2 contains lifePath number', () => {
    const { result } = renderHook(() => useMandalaData(fullData));
    expect(result.current.tooltipByLayer[2]).toContain('Vida 3');
  });

  it('builds planet dots for all planets', () => {
    const { result } = renderHook(() => useMandalaData(fullData));
    expect(result.current.planetDots).toHaveLength(2);
    expect(result.current.planetDots[0].name).toBe('Sol');
    expect(result.current.planetDots[0].pos).toHaveProperty('x');
    expect(result.current.planetDots[0].pos).toHaveProperty('y');
  });

  it('planet dots fall back to degree when absoluteLongitude is null', () => {
    const noAbsLon: MandalaData = {
      ...fullData,
      astrology: {
        ...fullData.astrology,
        planets: [
          { name: 'Sol', sign: 'Leão', degree: 120, absoluteLongitude: null, house: 1 },
        ],
      },
    };
    const { result } = renderHook(() => useMandalaData(noAbsLon));
    expect(result.current.planetDots[0].absoluteLongitude).toBeNull();
    expect(result.current.planetDots[0].pos.x).toBeDefined();
    expect(result.current.planetDots[0].pos.y).toBeDefined();
  });

  it('builds 11 tantric nodes', () => {
    const { result } = renderHook(() => useMandalaData(fullData));
    expect(result.current.tantricNodes).toHaveLength(11);
  });

  it('marks active and inactive tantric nodes', () => {
    const { result } = renderHook(() => useMandalaData(fullData));
    const inactive = result.current.tantricNodes.filter((n) => !n.active);
    // Bodies 3, 6, 9 are inactive
    expect(inactive).toHaveLength(3);
    expect(inactive.map((n) => n.label).sort()).toEqual([3, 6, 9]);
  });

  it('inactiveBodies matches filtered inactive nodes', () => {
    const { result } = renderHook(() => useMandalaData(fullData));
    expect(result.current.inactiveBodies).toHaveLength(3);
    expect(result.current.inactiveBodies.every((n) => !n.active)).toBe(true);
  });

  it('elemGuidance is present when element is dominant', () => {
    const { result } = renderHook(() => useMandalaData(fullData));
    // earth=3 is highest — should have guidance
    expect(result.current.elem).toBeTruthy();
  });

  it('lpMeaning is present when lifePath is set', () => {
    const { result } = renderHook(() => useMandalaData(fullData));
    expect(result.current.lpMeaning).toBeTruthy();
    expect(typeof result.current.lpMeaning).toBe('string');
  });

  it('returns stable references on same input (memoization)', () => {
    const { result, rerender } = renderHook(() => useMandalaData(fullData));
    const firstTooltip = result.current.tooltipByLayer;
    rerender();
    expect(result.current.tooltipByLayer).toBe(firstTooltip);
  });
});
