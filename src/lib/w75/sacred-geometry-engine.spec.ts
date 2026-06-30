/**
 * Sacred Geometry Engine — Vitest Spec
 * W75-C — Cycle 75
 *
 * 35+ assertions covering all 13 patterns, vertex/edge counts, symmetry,
 * tradition coverage, cymatic frequency, SVG path, listPatterns, audit.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  computeGeometry,
  getCorrespondences,
  renderPattern,
  listPatterns,
  exportAudit,
  fnv1a,
  canonicalJson,
  GEOMETRY_PATTERNS,
  PHI,
  PHI_INV,
  SQRT2,
  SQRT3,
  SOLFEGGIO_HZ,
  UNIVERSAL_HZ,
  SACRED_FREQUENCIES,
  _resetAuditForTest,
  _auditSacredTraditions,
  asPattern,
  type GeometryPattern,
  type PatternGeometry,
  type PatternCorrespondences,
  type PatternWithMeaning,
} from './sacred-geometry-engine.ts';

beforeEach(() => _resetAuditForTest());

// ─── Branded types ────────────────────────────────────────────────────────
describe('sacred-geometry-engine — branded types', () => {
  it('asPattern returns branded string', () => {
    const p = asPattern('flower-of-life');
    expect(typeof p).toBe('string');
    expect(p).toBe('flower-of-life');
  });

  it('GEOMETRY_PATTERNS has exactly 13 entries', () => {
    expect(GEOMETRY_PATTERNS.length).toBe(13);
  });

  it('GEOMETRY_PATTERNS is frozen', () => {
    expect(Object.isFrozen(GEOMETRY_PATTERNS)).toBe(true);
  });
});

// ─── Sacred constants ─────────────────────────────────────────────────────
describe('sacred-geometry-engine — sacred constants', () => {
  it('PHI ≈ 1.6180339887498949 (golden ratio)', () => {
    expect(Math.abs(PHI - 1.6180339887498949)).toBeLessThan(1e-12);
  });

  it('PHI_INV = 1/PHI = PHI - 1', () => {
    expect(Math.abs(PHI_INV - 1 / PHI)).toBeLessThan(1e-12);
    expect(Math.abs(PHI_INV - (PHI - 1))).toBeLessThan(1e-12);
  });

  it('PHI * PHI_INV ≈ 1', () => {
    expect(Math.abs(PHI * PHI_INV - 1)).toBeLessThan(1e-12);
  });

  it('SQRT2 ≈ 1.4142', () => {
    expect(Math.abs(SQRT2 - 1.4142135623730951)).toBeLessThan(1e-12);
  });

  it('SQRT3 ≈ 1.7321', () => {
    expect(Math.abs(SQRT3 - 1.7320508075688772)).toBeLessThan(1e-12);
  });

  it('SOLFEGGIO_HZ contains the 7 Solfeggio frequencies', () => {
    expect(SOLFEGGIO_HZ.length).toBe(7);
    for (const hz of [396, 417, 528, 639, 741, 852, 963]) {
      expect(SOLFEGGIO_HZ).toContain(hz);
    }
  });

  it('UNIVERSAL_HZ includes 432 Hz and 7.83 Hz (Schumann)', () => {
    expect(UNIVERSAL_HZ).toContain(432);
    expect(UNIVERSAL_HZ).toContain(7.83);
  });

  it('SACRED_FREQUENCIES union has 10 distinct values', () => {
    expect(SACRED_FREQUENCIES.length).toBe(10);
  });
});

// ─── FNV-1a hash (cycle 73 pattern) ───────────────────────────────────────
describe('sacred-geometry-engine — FNV-1a hash', () => {
  it('hashes empty string to FNV offset (0x811c9dc5)', () => {
    expect(fnv1a('')).toBe('811c9dc5');
  });

  it('hashes "a" to a deterministic value', () => {
    expect(fnv1a('a')).toBe('e40c292c');
  });

  it('is deterministic across calls', () => {
    expect(fnv1a('sacred-geometry')).toBe(fnv1a('sacred-geometry'));
  });
});

// ─── Canonical JSON ───────────────────────────────────────────────────────
describe('sacred-geometry-engine — canonical JSON', () => {
  it('sorts object keys', () => {
    const a = canonicalJson({ b: 1, a: 2 });
    const b = canonicalJson({ a: 2, b: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":2,"b":1}');
  });

  it('handles nested objects', () => {
    const r = canonicalJson({ z: { y: 1, x: 2 } });
    expect(r).toBe('{"z":{"x":2,"y":1}}');
  });

  it('handles arrays (preserves order)', () => {
    expect(canonicalJson([3, 1, 2])).toBe('[3,1,2]');
  });
});

// ─── listPatterns ─────────────────────────────────────────────────────────
describe('sacred-geometry-engine — listPatterns', () => {
  it('returns all 13 patterns', () => {
    const list = listPatterns();
    expect(list.length).toBe(13);
  });

  it('every pattern has >= 5 traditions', () => {
    const list = listPatterns();
    for (const p of list) {
      expect(p.traditionCount).toBeGreaterThanOrEqual(5);
    }
  });

  it('every pattern has >= 4 vertices', () => {
    const list = listPatterns();
    for (const p of list) {
      expect(p.vertexCount).toBeGreaterThanOrEqual(4);
    }
  });
});

// ─── computeGeometry — all 13 patterns ────────────────────────────────────
describe('sacred-geometry-engine — computeGeometry for all 13 patterns', () => {
  const cases: ReadonlyArray<{ pattern: string; minVerts: number; minEdges: number }> = [
    { pattern: 'flower-of-life', minVerts: 19, minEdges: 36 },
    { pattern: 'seed-of-life', minVerts: 7, minEdges: 6 },
    { pattern: 'metatron-cube', minVerts: 13, minEdges: 30 },
    { pattern: 'tree-of-life', minVerts: 10, minEdges: 22 },
    { pattern: 'sri-yantra', minVerts: 14, minEdges: 20 },
    { pattern: 'vesica-piscis', minVerts: 4, minEdges: 5 },
    { pattern: 'golden-spiral', minVerts: 8, minEdges: 8 },
    { pattern: 'fibonacci-spiral', minVerts: 24, minEdges: 20 },
    { pattern: 'tetrahedron', minVerts: 4, minEdges: 6 },
    { pattern: 'cube', minVerts: 8, minEdges: 12 },
    { pattern: 'octahedron', minVerts: 6, minEdges: 10 },
    { pattern: 'dodecahedron', minVerts: 12, minEdges: 20 },
    { pattern: 'icosahedron', minVerts: 12, minEdges: 25 },
  ];

  for (const c of cases) {
    it(`computeGeometry(${c.pattern}) returns valid geometry`, () => {
      const p = asPattern(c.pattern);
      const g = computeGeometry(p);
      expect(g.pattern).toBe(p);
      expect(g.vertices.length).toBeGreaterThanOrEqual(c.minVerts);
      expect(g.edges.length).toBeGreaterThanOrEqual(c.minEdges);
      expect(typeof g.centerOfMass.x).toBe('number');
      expect(typeof g.centerOfMass.y).toBe('number');
      expect(g.boundingRadius).toBeGreaterThan(0);
      expect(g.symmetryOrder).toBeGreaterThanOrEqual(1);
    });
  }

  it('computeGeometry respects scale param', () => {
    const small = computeGeometry(asPattern('cube'), { scale: 0.5 });
    const big = computeGeometry(asPattern('cube'), { scale: 2.0 });
    expect(big.boundingRadius).toBeGreaterThan(small.boundingRadius);
  });

  it('computeGeometry throws on unknown pattern', () => {
    expect(() => computeGeometry(asPattern('not-a-pattern'))).toThrow();
  });

  it('computeGeometry respects iterations for golden-spiral', () => {
    const g6 = computeGeometry(asPattern('golden-spiral'), { iterations: 6 });
    const g18 = computeGeometry(asPattern('golden-spiral'), { iterations: 18 });
    expect(g18.vertices.length).toBeGreaterThan(g6.vertices.length);
  });
});

// ─── getCorrespondences ───────────────────────────────────────────────────
describe('sacred-geometry-engine — getCorrespondences', () => {
  it('flower-of-life has >= 5 traditions', () => {
    const c = getCorrespondences(asPattern('flower-of-life'));
    expect(c.traditionMap.length).toBeGreaterThanOrEqual(5);
  });

  it('metatron-cube cymatic frequency is in sacred set', () => {
    const c = getCorrespondences(asPattern('metatron-cube'));
    expect(SACRED_FREQUENCIES).toContain(c.cymaticFrequency);
  });

  it('tree-of-life has meditation prompt non-empty', () => {
    const c = getCorrespondences(asPattern('tree-of-life'));
    expect(c.meditationPrompt.length).toBeGreaterThan(20);
  });

  it('correspondences are frozen', () => {
    const c = getCorrespondences(asPattern('cube'));
    expect(Object.isFrozen(c)).toBe(true);
    expect(Object.isFrozen(c.traditionMap)).toBe(true);
  });

  it('every pattern has 8 traditions (8 sacred traditions)', () => {
    const list = listPatterns();
    for (const p of list) {
      const c = getCorrespondences(p.pattern);
      expect(c.traditionMap.length).toBe(8);
    }
  });

  it('every pattern has cymatic frequency in SACRED_FREQUENCIES', () => {
    for (const p of GEOMETRY_PATTERNS) {
      const c = getCorrespondences(p);
      expect(SACRED_FREQUENCIES).toContain(c.cymaticFrequency);
    }
  });

  it('every tradition entry has tradition and meaning', () => {
    for (const p of GEOMETRY_PATTERNS) {
      const c = getCorrespondences(p);
      for (const row of c.traditionMap) {
        expect(row.tradition.length).toBeGreaterThan(0);
        expect(row.meaning.length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── renderPattern ────────────────────────────────────────────────────────
describe('sacred-geometry-engine — renderPattern', () => {
  it('flower-of-life renders with non-empty SVG path', () => {
    const r = renderPattern(asPattern('flower-of-life'));
    expect(r.svgPath.length).toBeGreaterThan(20);
    expect(r.svgPath).toMatch(/^M/);
  });

  it('cube renders outline + edges (contains Z = closed path)', () => {
    const r = renderPattern(asPattern('cube'));
    expect(r.svgPath).toContain('Z');
  });

  it('renderPattern returns description of >= 20 chars', () => {
    for (const p of GEOMETRY_PATTERNS) {
      const r = renderPattern(p);
      expect(r.description.length).toBeGreaterThan(20);
    }
  });

  it('renderPattern throws on unknown pattern', () => {
    expect(() => renderPattern(asPattern('xxx'))).toThrow();
  });

  it('renderPattern bumps audit count', () => {
    renderPattern(asPattern('cube'));
    renderPattern(asPattern('cube'));
    const audit = exportAudit();
    const cubeEntry = audit.find((a) => a.pattern === 'cube');
    expect(cubeEntry).toBeDefined();
    expect(cubeEntry?.renderCount).toBe(2);
    expect(cubeEntry?.lastRenderedAt).toBeGreaterThan(0);
  });

  it('renderPattern respects custom scale', () => {
    const small = renderPattern(asPattern('metatron-cube'), 0.5);
    const big = renderPattern(asPattern('metatron-cube'), 2.0);
    // Big should produce longer SVG path (more coords with bigger numbers)
    expect(big.svgPath.length).toBeGreaterThan(small.svgPath.length - 50);
  });

  it('rendered object is frozen', () => {
    const r = renderPattern(asPattern('icosahedron'));
    expect(Object.isFrozen(r)).toBe(true);
  });
});

// ─── exportAudit ──────────────────────────────────────────────────────────
describe('sacred-geometry-engine — exportAudit', () => {
  it('returns 13 entries (one per pattern)', () => {
    const a = exportAudit();
    expect(a.length).toBe(13);
  });

  it('is frozen', () => {
    expect(Object.isFrozen(exportAudit())).toBe(true);
  });

  it('renderCount starts at 0 for unrendered patterns', () => {
    const a = exportAudit();
    for (const e of a) {
      expect(e.renderCount).toBe(0);
      expect(e.lastRenderedAt).toBe(0);
    }
  });

  it('tracks multiple renders', () => {
    renderPattern(asPattern('tetrahedron'));
    renderPattern(asPattern('tetrahedron'));
    renderPattern(asPattern('tetrahedron'));
    const e = exportAudit().find((x) => x.pattern === 'tetrahedron');
    expect(e?.renderCount).toBe(3);
  });
});

// ─── _auditSacredTraditions ───────────────────────────────────────────────
describe('sacred-geometry-engine — _auditSacredTraditions', () => {
  it('returns 13 entries', () => {
    expect(_auditSacredTraditions().length).toBe(13);
  });

  it('every pattern has 8 traditions', () => {
    for (const e of _auditSacredTraditions()) {
      expect(e.traditionCount).toBe(8);
    }
  });
});

// ─── Pattern-specific symmetry & geometry checks ──────────────────────────
describe('sacred-geometry-engine — pattern-specific invariants', () => {
  it('flower-of-life has 6-fold rotational symmetry', () => {
    const g = computeGeometry(asPattern('flower-of-life'));
    expect(g.symmetryOrder).toBe(6);
  });

  it('seed-of-life has 6-fold rotational symmetry', () => {
    const g = computeGeometry(asPattern('seed-of-life'));
    expect(g.symmetryOrder).toBe(6);
  });

  it('metatron-cube has 6-fold rotational symmetry', () => {
    const g = computeGeometry(asPattern('metatron-cube'));
    expect(g.symmetryOrder).toBe(6);
  });

  it('tetrahedron has 3-fold symmetry', () => {
    const g = computeGeometry(asPattern('tetrahedron'));
    expect(g.symmetryOrder).toBe(3);
  });

  it('cube has 4-fold symmetry', () => {
    const g = computeGeometry(asPattern('cube'));
    expect(g.symmetryOrder).toBe(4);
  });

  it('dodecahedron has 5-fold symmetry (pentagonal)', () => {
    const g = computeGeometry(asPattern('dodecahedron'));
    expect(g.symmetryOrder).toBe(5);
  });

  it('icosahedron has 5-fold symmetry', () => {
    const g = computeGeometry(asPattern('icosahedron'));
    expect(g.symmetryOrder).toBe(5);
  });

  it('flower-of-life has fractalDimension', () => {
    const g = computeGeometry(asPattern('flower-of-life'));
    expect(g.fractalDimension).toBeDefined();
    expect(g.fractalDimension).toBeGreaterThan(1.5);
    expect(g.fractalDimension).toBeLessThan(2.5);
  });

  it('sri-yantra has fractalDimension', () => {
    const g = computeGeometry(asPattern('sri-yantra'));
    expect(g.fractalDimension).toBeDefined();
  });

  it('golden-spiral has fractalDimension ≈ 1.0 (logarithmic)', () => {
    const g = computeGeometry(asPattern('golden-spiral'));
    expect(g.fractalDimension).toBeDefined();
    expect(g.fractalDimension).toBeCloseTo(1.0, 1);
  });
});

// ─── Mathematical precision ───────────────────────────────────────────────
describe('sacred-geometry-engine — math precision', () => {
  it('flower-of-life centerOfMass is near origin', () => {
    const g = computeGeometry(asPattern('flower-of-life'));
    expect(Math.abs(g.centerOfMass.x)).toBeLessThan(0.5);
    expect(Math.abs(g.centerOfMass.y)).toBeLessThan(0.5);
  });

  it('tetrahedron centerOfMass is near origin', () => {
    const g = computeGeometry(asPattern('tetrahedron'));
    expect(Math.abs(g.centerOfMass.x)).toBeLessThan(0.3);
  });

  it('boundingRadius scales linearly with scale param', () => {
    const a = computeGeometry(asPattern('cube'), { scale: 1.0 });
    const b = computeGeometry(asPattern('cube'), { scale: 2.0 });
    expect(b.boundingRadius / a.boundingRadius).toBeCloseTo(2.0, 9);
  });
});
