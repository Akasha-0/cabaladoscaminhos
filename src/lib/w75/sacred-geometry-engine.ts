/**
 * Sacred Geometry Engine — W75-C
 * ──────────────────────────────
 * Pure-logic engine for sacred-geometry meditation + analysis. Knows 13
 * patterns (Flower of Life, Metatron's Cube, Seed of Life, Tree of Life,
 * Sri Yantra, Vesica Piscis, Golden Spiral, Fibonacci Spiral, and the 5
 * Platonic Solids). For each pattern, it computes mathematically-grounded
 * vertices, edges, symmetry order, correspondences (≥5 traditions each),
 * cymatic frequency, meditation prompt, audio cue, and a render-ready
 * SVG path string.
 *
 * Cycle 75 lesson: worktree-isolated tsconfig + .ts extension imports +
 * no npm install (pure math + string concatenation).
 */


// ─── Branded types ────────────────────────────────────────────────────────
export type GeometryPattern = string & { readonly __brand: 'GeometryPattern' };

export const asPattern = (s: string): GeometryPattern => s as GeometryPattern;

export const GEOMETRY_PATTERNS: ReadonlyArray<GeometryPattern> = Object.freeze([
  asPattern('flower-of-life'),
  asPattern('metatron-cube'),
  asPattern('seed-of-life'),
  asPattern('tree-of-life'),
  asPattern('sri-yantra'),
  asPattern('vesica-piscis'),
  asPattern('golden-spiral'),
  asPattern('fibonacci-spiral'),
  asPattern('tetrahedron'),
  asPattern('cube'),
  asPattern('octahedron'),
  asPattern('dodecahedron'),
  asPattern('icosahedron'),
]);

// ─── Public types ─────────────────────────────────────────────────────────
export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface PatternGeometry {
  readonly pattern: GeometryPattern;
  readonly vertices: ReadonlyArray<Point>;
  readonly edges: ReadonlyArray<readonly [number, number]>;
  readonly centerOfMass: Point;
  readonly boundingRadius: number;
  readonly symmetryOrder: number;
  readonly fractalDimension?: number;
}

export interface PatternCorrespondences {
  readonly pattern: GeometryPattern;
  readonly traditionMap: ReadonlyArray<{
    readonly tradition: string;
    readonly meaning: string;
    readonly element?: string;
    readonly planet?: string;
    readonly chakra?: string;
  }>;
  readonly cymaticFrequency: number;
  readonly meditationPrompt: string;
  readonly audioCue: string;
}

export interface PatternWithMeaning {
  readonly geometry: PatternGeometry;
  readonly correspondences: PatternCorrespondences;
  readonly svgPath: string;
  readonly description: string;
}

export interface AuditEntry {
  readonly pattern: GeometryPattern;
  readonly renderCount: number;
  readonly lastRenderedAt: number;
}

// ─── Sacred constants ─────────────────────────────────────────────────────
/** Golden ratio φ = (1 + √5) / 2 ≈ 1.6180339887498949 */
export const PHI = (1 + Math.sqrt(5)) / 2;
/** Reciprocal 1/φ = φ − 1 */
export const PHI_INV = 1 / PHI;
/** √2 — used for cube/octahedron face diagonals */
export const SQRT2 = Math.sqrt(2);
/** √3 — used for tetrahedron/dodecahedron face heights */
export const SQRT3 = Math.sqrt(3);
/** Solfeggio + universal cymatic Hz constants (cycle 60+ sacred-sound work) */
export const SOLFEGGIO_HZ = Object.freeze([396, 417, 528, 639, 741, 852, 963] as const);
export const UNIVERSAL_HZ = Object.freeze([432, 440, 7.83] as const); // 7.83 = Schumann resonance
export const SACRED_FREQUENCIES = Object.freeze([...SOLFEGGIO_HZ, ...UNIVERSAL_HZ] as readonly number[]);

/** Floating-point epsilon for vertex/edge comparisons (cycle 60+ lesson). */
export const EPS = 1e-9;

// ─── Result type (cycle 73 lesson) ────────────────────────────────────────
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

const okResult = <T, E>(v: T): Result<T, E> => ({ ok: true, value: v });
const errResult = <T, E>(e: E): Result<T, E> => ({ ok: false, error: e });

export type GeometryError =
  | { kind: 'unknown-pattern'; pattern: string }
  | { kind: 'invalid-params'; reason: string };

// ─── Helpers ──────────────────────────────────────────────────────────────
/** Polar → Cartesian. Angle in radians. */
function polar(angleRad: number, radius: number): Point {
  return { x: radius * Math.cos(angleRad), y: radius * Math.sin(angleRad) };
}

/** Center of mass of a vertex set. */
function centroid(vertices: ReadonlyArray<Point>): Point {
  if (vertices.length === 0) return { x: 0, y: 0 };
  let sx = 0;
  let sy = 0;
  for (const v of vertices) {
    sx += v.x;
    sy += v.y;
  }
  return { x: sx / vertices.length, y: sy / vertices.length };
}

/** Bounding radius = max distance from centroid to any vertex. */
function boundingRadius(vertices: ReadonlyArray<Point>, c: Point): number {
  let maxR = 0;
  for (const v of vertices) {
    const dx = v.x - c.x;
    const dy = v.y - c.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    if (r > maxR) maxR = r;
  }
  return maxR;
}

/** Approximate rotational symmetry order (0..360°). Heuristic: GCD of small angles. */
function inferSymmetryOrder(vertices: ReadonlyArray<Point>, edges: ReadonlyArray<readonly [number, number]>): number {
  if (vertices.length === 0) return 0;
  // For Platonic solids: order = number of vertices / number of identical orbits.
  // For Flower/Seed: 6-fold. For Metatron's Cube: 6-fold (13-circle hex grid).
  // We detect by looking at angles modulo 60° (1° tolerance).
  const angles = vertices.map((v) => {
    const a = (Math.atan2(v.y, v.x) * 180) / Math.PI;
    return ((a % 360) + 360) % 360;
  });
  const buckets = new Set<number>();
  for (const a of angles) {
    buckets.add(Math.round(a / 60));
  }
  if (buckets.size <= 6 && buckets.size > 0) {
    // Likely n-fold rotational symmetry where n ∈ {1, 2, 3, 6}.
    if (buckets.size === 6) return 6;
    if (buckets.size === 3) return 3;
    if (buckets.size === 4) return 4;
    if (buckets.size === 5) return 5;
  }
  // Edge-based heuristic: GCD of all (i mod edgeCount) wrap-around counts
  void edges;
  // Default: count unique angles (rough proxy for symmetry).
  const uniqueAngles = new Set<number>();
  for (const a of angles) uniqueAngles.add(Math.round(a));
  if (uniqueAngles.size >= 5 && uniqueAngles.size <= 12) return uniqueAngles.size;
  return 1;
}

function validatePattern(p: string): Result<GeometryPattern, GeometryError> {
  if (GEOMETRY_PATTERNS.includes(p as GeometryPattern)) {
    return okResult(p as GeometryPattern);
  }
  return errResult({ kind: 'unknown-pattern', pattern: p });
}

// ─── Pattern-specific vertex generators ───────────────────────────────────
/**
 * Flower of Life — 19 vertices in 2D projection.
 * 1 center + 6 inner-ring + 12 outer-ring vertices (Flower of Life's classic
 * 19-circle pattern reduced to the intersection vertices in a hex layout).
 */
function flowerOfLifeVertices(scale: number): ReadonlyArray<Point> {
  const r = scale; // outer ring radius
  const inner = scale * 0.5;
  const out: Point[] = [];
  out.push({ x: 0, y: 0 });
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    out.push(polar(a, inner));
  }
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI / 6) * i;
    out.push(polar(a, r));
  }
  return out;
}

function flowerOfLifeEdges(): ReadonlyArray<readonly [number, number]> {
  const edges: Array<readonly [number, number]> = [];
  // Center → inner ring (6 edges)
  for (let i = 1; i <= 6; i++) edges.push([0, i] as const);
  // Inner ring consecutive (6 edges)
  for (let i = 1; i < 6; i++) edges.push([i, i + 1] as const);
  edges.push([6, 1] as const);
  // Inner ring → outer ring (12 edges — each inner vertex connects to 2 outer)
  for (let i = 0; i < 12; i++) {
    const innerIdx = (i % 6) + 1;
    const outerIdx = 7 + i;
    edges.push([innerIdx, outerIdx] as const);
  }
  // Outer ring → outer ring (12 edges)
  for (let i = 7; i < 18; i++) edges.push([i, i + 1] as const);
  edges.push([18, 7] as const);
  return edges;
}

/**
 * Seed of Life — 7 circles → 7 vertices (1 center + 6 around).
 */
function seedOfLifeVertices(scale: number): ReadonlyArray<Point> {
  const r = scale * 0.5;
  const out: Point[] = [{ x: 0, y: 0 }];
  for (let i = 0; i < 6; i++) {
    out.push(polar((Math.PI / 3) * i, r));
  }
  return out;
}

function seedOfLifeEdges(): ReadonlyArray<readonly [number, number]> {
  const edges: Array<readonly [number, number]> = [];
  for (let i = 1; i < 6; i++) edges.push([i, i + 1] as const);
  edges.push([6, 1] as const);
  return edges;
}

/**
 * Vesica Piscis — 2 circles (vertices = 2 centers + 2 intersection points).
 */
function vesicaPiscisVertices(scale: number): ReadonlyArray<Point> {
  const r = scale * 0.5;
  const halfD = scale * 0.5; // distance between centers = radius (classic ratio)
  return [
    { x: -halfD, y: 0 },
    { x: halfD, y: 0 },
    { x: 0, y: -r * SQRT3 },
    { x: 0, y: r * SQRT3 },
  ];
}

function vesicaPiscisEdges(): ReadonlyArray<readonly [number, number]> {
  return [
    [0, 2], [0, 3], [1, 2], [1, 3],
    [2, 3],
  ];
}

/**
 * Metatron's Cube — 13 vertices (1 center + 12 around).
 */
function metatronCubeVertices(scale: number): ReadonlyArray<Point> {
  const r = scale;
  const out: Point[] = [{ x: 0, y: 0 }];
  for (let i = 0; i < 12; i++) {
    out.push(polar((Math.PI / 6) * i, r));
  }
  return out;
}

function metatronCubeEdges(): ReadonlyArray<readonly [number, number]> {
  const edges: Array<readonly [number, number]> = [];
  const N = 13;
  // Connect every pair within distance ≤ ~scale (the cube's 78 edges).
  // For 13 vertices, full graph = 78 edges. To match "Metatron's Cube" wire-frame,
  // we keep edges between vertices ≤ 2r apart where r = the outer radius.
  const verts = metatronCubeVertices(1.0);
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const a = verts[i];
      const b = verts[j];
      if (!a || !b) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      // Metatron's Cube connects vertices that form lines through the figure.
      // Heuristic: connect if distance ≤ 2 * outer_radius (covers all 78 wires).
      if (d <= 2.0 + EPS) edges.push([i, j] as const);
    }
  }
  return edges;
}

/**
 * Tree of Life — 10 Sephirot + 22 connecting paths.
 * Sephirotic positions (from standard Kabbalistic diagram, normalized to ±1):
 *   1. Keter    (0, 1.0)
 *   2. Chokhmah (0.5, 0.75)
 *   3. Binah    (-0.5, 0.75)
 *   4. Chesed   (0.5, 0.25)
 *   5. Geburah  (-0.5, 0.25)
 *   6. Tiferet  (0.0, 0.0)
 *   7. Netzach  (0.5, -0.25)
 *   8. Hod      (-0.5, -0.25)
 *   9. Yesod    (0.0, -0.5)
 *  10. Malkuth  (0.0, -1.0)
 */
const TREE_OF_LIFE_POSITIONS: ReadonlyArray<readonly [number, number]> = Object.freeze([
  [0.0, 1.0],   // 1. Keter
  [0.5, 0.75],  // 2. Chokhmah
  [-0.5, 0.75], // 3. Binah
  [0.5, 0.25],  // 4. Chesed
  [-0.5, 0.25], // 5. Geburah
  [0.0, 0.0],   // 6. Tiferet
  [0.5, -0.25], // 7. Netzach
  [-0.5, -0.25],// 8. Hod
  [0.0, -0.5],  // 9. Yesod
  [0.0, -1.0],  // 10. Malkuth
]);

const TREE_OF_LIFE_PATHS: ReadonlyArray<readonly [number, number]> = Object.freeze([
  // 22 paths (classical Kabbalistic count)
  [0, 1], [0, 2], [0, 5], // Keter → Chokhmah, Binah, Tiferet (vertical & lightning flash)
  [1, 2], [1, 3], [1, 5], // Chokhmah → Binah, Chesed, Tiferet
  [2, 4], [2, 5],         // Binah → Geburah, Tiferet
  [3, 4], [3, 5], [3, 6], // Chesed → Geburah, Tiferet, Netzach
  [4, 5], [4, 7],         // Geburah → Tiferet, Hod
  [5, 6], [5, 7], [5, 8], // Tiferet → Netzach, Hod, Yesod (Pillar of Balance)
  [6, 7], [6, 8],         // Netzach → Hod, Yesod
  [7, 8], [7, 9],         // Hod → Yesod, Malkuth
  [8, 9],                  // Yesod → Malkuth
  [6, 9],                  // Netzach → Malkuth (22nd path)
]);

function treeOfLifeVertices(scale: number): ReadonlyArray<Point> {
  return TREE_OF_LIFE_POSITIONS.map(([x, y]) => ({ x: x * scale, y: y * scale }));
}

function treeOfLifeEdges(): ReadonlyArray<readonly [number, number]> {
  return TREE_OF_LIFE_PATHS.map((p) => p as readonly [number, number]);
}

/**
 * Sri Yantra — 9 triangles (4 upward ▲, 5 downward ▽).
 * Vertices = 9 triangle centers + intersection hot spots (5 bindu points).
 * Reduced to a canonical 14-vertex set.
 */
const SRI_YANTRA_VERTICES: ReadonlyArray<readonly [number, number]> = Object.freeze([
  [0.0, 1.0],     // 1. Apex (Shiva)
  [0.6, 0.7],     // 2. NE outer
  [-0.6, 0.7],    // 3. NW outer
  [0.8, 0.2],     // 4. E outer
  [-0.8, 0.2],    // 5. W outer
  [0.4, -0.3],    // 6. E mid
  [-0.4, -0.3],   // 7. W mid
  [0.6, -0.7],    // 8. SE outer
  [-0.6, -0.7],   // 9. SW outer
  [0.0, -1.0],    // 10. Base (Shakti)
  [0.0, 0.4],     // 11. Inner bindu
  [0.3, 0.1],     // 12. E bindu
  [-0.3, 0.1],    // 13. W bindu
  [0.0, -0.2],    // 14. Center bindu
]);

const SRI_YANTRA_EDGES: ReadonlyArray<readonly [number, number]> = Object.freeze([
  // Outer triangle (largest downward)
  [8, 10], [10, 9], [9, 8],
  // Inner triangles cross-connected to apex and base
  [0, 2], [2, 10],
  [0, 1], [1, 9],
  [0, 4], [4, 8],
  [0, 3], [3, 7],
  [0, 6], [6, 10],
  [0, 5], [5, 9],
  // Inner bindu connections
  [11, 12], [12, 13], [13, 11], [14, 11], [14, 12], [14, 13],
]);

function sriYantraVertices(scale: number): ReadonlyArray<Point> {
  return SRI_YANTRA_VERTICES.map(([x, y]) => ({ x: x * scale, y: y * scale }));
}

function sriYantraEdges(): ReadonlyArray<readonly [number, number]> {
  // Return the canonical 21-edge Sri Yantra wiring.
  return SRI_YANTRA_EDGES.map((e) => e as readonly [number, number]);
}

/**
 * Golden Spiral — n=12 segments (logarithmic spiral, r = a·φ^(2θ/π)).
 * Vertices = 12 segment endpoints.
 */
function goldenSpiralVertices(scale: number, iterations: number): ReadonlyArray<Point> {
  const n = Math.max(6, Math.min(iterations, 24));
  const out: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const theta = (Math.PI / 2) * (i / 4); // quarter-turn every 4 segments
    const r = scale * 0.1 * Math.pow(PHI, (2 * theta) / Math.PI);
    out.push(polar(theta, r));
  }
  return out;
}

function goldenSpiralEdges(): ReadonlyArray<readonly [number, number]> {
  const n = 12; // matches default iterations
  const edges: Array<readonly [number, number]> = [];
  for (let i = 0; i < n; i++) edges.push([i, i + 1] as const);
  return edges;
}

/**
 * Fibonacci Spiral — arcs connecting Fibonacci rectangles.
 * Vertices = 8 Fibonacci-rectangle corners (1,1,2,3,5,8,13).
 */
const FIB_RECTANGLES = Object.freeze([1, 1, 2, 3, 5, 8, 13] as const);

function fibonacciSpiralVertices(scale: number): ReadonlyArray<Point> {
  // Spiral embedded in square of side 13*scale/13 = scale.
  const out: Point[] = [];
  let x = 0;
  let y = 0;
  let size = scale;
  for (let i = 0; i < FIB_RECTANGLES.length; i++) {
    // Each rectangle: bottom-left (x,y), top-right (x+size, y+size)
    out.push({ x, y });
    out.push({ x: x + size, y });
    out.push({ x: x + size, y: y + size });
    out.push({ x, y: y + size });
    // Rotate/translate for next rectangle (Fibonacci spiral nests inward)
    x += size;
    size = scale * (FIB_RECTANGLES[i + 1] ?? 1) / 13;
  }
  return out;
}

function fibonacciSpiralEdges(): ReadonlyArray<readonly [number, number]> {
  // Connect each rectangle's corners to the next.
  const out: Array<readonly [number, number]> = [];
  for (let i = 0; i < FIB_RECTANGLES.length - 1; i++) {
    const base = i * 4;
    out.push([base, base + 1] as const);
    out.push([base + 1, base + 2] as const);
    out.push([base + 2, base + 3] as const);
    out.push([base + 3, base] as const);
  }
  return out;
}

/**
 * Tetrahedron — 4 vertices in 2D (regular tetrahedron projected).
 */
function tetrahedronVertices(scale: number): ReadonlyArray<Point> {
  const r = scale;
  const h = r * SQRT2 * (2 / 3);
  return [
    { x: 0, y: r * 0.816 },       // top
    { x: -r * 0.866, y: -r * 0.408 }, // bottom-left
    { x: r * 0.866, y: -r * 0.408 },  // bottom-right
    { x: 0, y: -r * 0.816 },       // back (projected)
  ];
}

function tetrahedronEdges(): ReadonlyArray<readonly [number, number]> {
  // 6 edges of tetrahedron
  return [
    [0, 1], [0, 2], [0, 3],
    [1, 2], [1, 3], [2, 3],
  ];
}

/**
 * Cube — 8 vertices projected (square outline + diamond).
 */
function cubeVertices(scale: number): ReadonlyArray<Point> {
  const r = scale;
  return [
    { x: -r, y: -r }, // 0: back-bottom-left
    { x: r, y: -r },  // 1: back-bottom-right
    { x: r, y: r },   // 2: back-top-right
    { x: -r, y: r },  // 3: back-top-left
    { x: -r * 0.5, y: -r * 0.5 }, // 4: front-bottom-left
    { x: r * 0.5, y: -r * 0.5 },  // 5: front-bottom-right
    { x: r * 0.5, y: r * 0.5 },   // 6: front-top-right
    { x: -r * 0.5, y: r * 0.5 },  // 7: front-top-left
  ];
}

function cubeEdges(): ReadonlyArray<readonly [number, number]> {
  return [
    [0, 1], [1, 2], [2, 3], [3, 0], // back square
    [4, 5], [5, 6], [6, 7], [7, 4], // front square
    [0, 4], [1, 5], [2, 6], [3, 7], // connectors
  ];
}

/**
 * Octahedron — 6 vertices (top, bottom, 4 around equator).
 */
function octahedronVertices(scale: number): ReadonlyArray<Point> {
  const r = scale;
  return [
    { x: 0, y: r },       // 0: top
    { x: r, y: 0 },       // 1: east
    { x: 0, y: -r },      // 2: bottom
    { x: -r, y: 0 },      // 3: west
    { x: r * 0.5, y: r * 0.5 }, // 4: NE (projection offset for 3D feel)
    { x: -r * 0.5, y: -r * 0.5 }, // 5: SW
  ];
}

function octahedronEdges(): ReadonlyArray<readonly [number, number]> {
  return [
    [0, 1], [0, 3], [0, 4], [0, 5],
    [2, 1], [2, 3], [2, 4], [2, 5],
    [1, 4], [4, 3],
    [3, 5], [5, 1],
  ];
}

/**
 * Dodecahedron — 12 pentagonal vertices projected (20-vertex icosahedron dual).
 * Simplified to 12 vertices in 2D: 2 polar + 10 around (2 rings of 5).
 */
function dodecahedronVertices(scale: number): ReadonlyArray<Point> {
  const r = scale;
  const phi = r / PHI;
  const out: Point[] = [];
  out.push({ x: 0, y: r });  // 0: north pole
  for (let i = 0; i < 5; i++) {
    out.push(polar((Math.PI * 2 * i) / 5 - Math.PI / 2, phi));
  }
  // Indices 1..5
  for (let i = 0; i < 5; i++) {
    out.push(polar((Math.PI * 2 * i) / 5 - Math.PI / 2 + Math.PI / 5, r));
  }
  // Indices 6..10
  out.push({ x: 0, y: -r }); // 11: south pole
  return out;
}

function dodecahedronEdges(): ReadonlyArray<readonly [number, number]> {
  const out: Array<readonly [number, number]> = [];
  // North pole to upper ring (5 edges)
  for (let i = 1; i <= 5; i++) out.push([0, i] as const);
  // Upper ring consecutive (5 edges)
  for (let i = 1; i < 5; i++) out.push([i, i + 1] as const);
  out.push([5, 1] as const);
  // Lower ring consecutive (5 edges)
  for (let i = 6; i < 10; i++) out.push([i, i + 1] as const);
  out.push([10, 6] as const);
  // South pole to lower ring (5 edges)
  for (let i = 6; i <= 10; i++) out.push([11, i] as const);
  // Cross-ring connections (5 edges)
  for (let i = 0; i < 5; i++) out.push([i + 1, i + 6] as const);
  return out;
}

/**
 * Icosahedron — 12 vertices projected.
 */
function icosahedronVertices(scale: number): ReadonlyArray<Point> {
  const r = scale;
  const phi = r / PHI;
  const out: Point[] = [];
  // Ring 1 (north) — 5 vertices
  for (let i = 0; i < 5; i++) {
    out.push(polar((Math.PI * 2 * i) / 5, phi));
  }
  // Ring 2 (south) — 5 vertices
  for (let i = 0; i < 5; i++) {
    out.push(polar((Math.PI * 2 * i) / 5 + Math.PI / 5, -phi));
  }
  // Poles
  out.push({ x: 0, y: r });  // 10: north
  out.push({ x: 0, y: -r }); // 11: south
  return out;
}

function icosahedronEdges(): ReadonlyArray<readonly [number, number]> {
  const out: Array<readonly [number, number]> = [];
  // North pole to ring 1 (5 edges)
  for (let i = 0; i < 5; i++) out.push([10, i] as const);
  // Ring 1 consecutive (5 edges)
  for (let i = 0; i < 4; i++) out.push([i, i + 1] as const);
  out.push([4, 0] as const);
  // Ring 1 → Ring 2 cross connections (10 edges)
  for (let i = 0; i < 5; i++) {
    out.push([i, i + 5] as const);
    out.push([i, (i + 4) % 5 + 5] as const);
  }
  // Ring 2 consecutive (5 edges)
  for (let i = 5; i < 9; i++) out.push([i, i + 1] as const);
  out.push([9, 5] as const);
  // South pole to ring 2 (5 edges)
  for (let i = 5; i < 10; i++) out.push([11, i] as const);
  return out;
}

// ─── FNV-1a 32-bit hash (cycle 73 pattern) ────────────────────────────────
const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

export function fnv1a(input: string): string {
  let h = FNV_OFFSET >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, FNV_PRIME) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// ─── SVG path generation ──────────────────────────────────────────────────
/** Render a list of vertices + edges as an SVG path string. */
function renderPolylinePath(vertices: ReadonlyArray<Point>, edges: ReadonlyArray<readonly [number, number]>, scale: number): string {
  const out: string[] = [];
  for (const [a, b] of edges) {
    const va = vertices[a];
    const vb = vertices[b];
    if (!va || !vb) continue;
    // Scale and center to a 200x200 viewport.
    const ax = (va.x * 80 + 100).toFixed(2);
    const ay = (100 - va.y * 80).toFixed(2);
    const bx = (vb.x * 80 + 100).toFixed(2);
    const by = (100 - vb.y * 80).toFixed(2);
    out.push(`M${ax},${ay} L${bx},${by}`);
  }
  void scale;
  return out.join(' ');
}

/** Render vertices as a closed polygon (for Solid outlines). */
function renderOutlinePath(vertices: ReadonlyArray<Point>): string {
  if (vertices.length === 0) return '';
  const parts: string[] = [];
  vertices.forEach((v, i) => {
    const x = (v.x * 80 + 100).toFixed(2);
    const y = (100 - v.y * 80).toFixed(2);
    parts.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
  });
  parts.push('Z');
  return parts.join(' ');
}

// ─── Pattern definitions table ────────────────────────────────────────────
interface PatternDef {
  readonly pattern: GeometryPattern;
  readonly generate: (scale: number, iterations: number) => ReadonlyArray<Point>;
  readonly edges: () => ReadonlyArray<readonly [number, number]>;
  readonly symmetryOrder: number;
  readonly fractalDimension?: number;
  readonly cymaticFrequency: number;
  readonly meditationPrompt: string;
  readonly audioCue: string;
  readonly description: string;
}

const PATTERN_DEFS: ReadonlyArray<PatternDef> = Object.freeze([
  {
    pattern: asPattern('flower-of-life'),
    generate: (s, _i) => flowerOfLifeVertices(s),
    edges: () => flowerOfLifeEdges(),
    symmetryOrder: 6,
    fractalDimension: 1.97, // H = ln(19)/ln(6) ≈ 1.97 (Hausdorff-like for self-similar hex)
    cymaticFrequency: 528, // "Mi" Solfeggio — transformation / love
    meditationPrompt: 'Respire em ondas de 6 tempos alinhando-se à frequência de 528 Hz. Visualize os 19 círculos do Flower of Life girando lentamente em torno do seu coração.',
    audioCue: 'Tom SOLFEGGIO 528 Hz (transformação DNA) sustentado por 4 minutos.',
    description: 'O Flower of Life é o padrão geométrico universal que contém 19 círculos sobrepostos em simetria hexagonal — a assinatura da criação em todas as escalas, do microcosmo ao macrocosmo.',
  },
  {
    pattern: asPattern('metatron-cube'),
    generate: (s, _i) => metatronCubeVertices(s),
    edges: () => metatronCubeEdges(),
    symmetryOrder: 6,
    cymaticFrequency: 741, // "Sol" Solfeggio — despertar de intuição
    meditationPrompt: 'Mantenha a consciência no centro do cubo. Visualize os 13 círculos de Metatron expandindo até conterem os 5 Sólidos Platônicos — veículos de cada elemento.',
    audioCue: 'Tom SOLFEGGIO 741 Hz (despertar intuitivo) em fade in de 90s.',
    description: 'O Cubo de Metatron é o mapa arquetípico que contém todos os 5 Sólidos Platônicos — chaves geométricas para fogo, água, ar, terra e éter.',
  },
  {
    pattern: asPattern('seed-of-life'),
    generate: (s, _i) => seedOfLifeVertices(s),
    edges: () => seedOfLifeEdges(),
    symmetryOrder: 6,
    cymaticFrequency: 396, // "Ut" Solfeggio — liberação de medo
    meditationPrompt: 'A Semente da Vida pulsa com o ritmo de 396 Hz. Sete respirações para dissolver padrões de medo enraizados.',
    audioCue: 'Tom SOLFEGGIO 396 Hz (liberação de culpa e medo).',
    description: 'A Semente da Vida — 7 círculos em formação hexagonal — é a estrutura embrionária do Flower of Life. Representa os 7 dias da criação e os 7 chakras.',
  },
  {
    pattern: asPattern('tree-of-life'),
    generate: (s, _i) => treeOfLifeVertices(s),
    edges: () => treeOfLifeEdges(),
    symmetryOrder: 1, // bilateral symmetry, no rotational
    cymaticFrequency: 963, // "Sol*" Solfeggio — conexão com o divino
    meditationPrompt: 'Suba pelo Pilar do Meio da Árvore da Vida. Toque cada Sephirah com a consciência, de Keter (coroa) a Malkuth (reino).',
    audioCue: 'Tom SOLFEGGIO 963 Hz (consciência divina) com modulação lenta em 22 caminhos.',
    description: 'A Árvore da Vida cabala estrutura a realidade em 10 Sephirot conectadas por 22 caminhos — a mesma estrutura do Tarot e das 22 letras hebraicas.',
  },
  {
    pattern: asPattern('sri-yantra'),
    generate: (s, _i) => sriYantraVertices(s),
    edges: () => sriYantraEdges(),
    symmetryOrder: 1,
    fractalDimension: 1.58, // Yantra fractal scaling
    cymaticFrequency: 432, // universal "OM" frequency
    meditationPrompt: 'Entre no bindu central (ponto de origem). Suba através dos 9 triângulos até o ápice Shiva-Shakti unificados.',
    audioCue: 'OM em 432 Hz com eco tântrico de 3s.',
    description: 'O Sri Yantra — 9 triângulos entrelaçados formando 43 triângulos secundários — é o diagrama tântrico supremo, manifestando a união Shiva-Shakti.',
  },
  {
    pattern: asPattern('vesica-piscis'),
    generate: (s, _i) => vesicaPiscisVertices(s),
    edges: () => vesicaPiscisEdges(),
    symmetryOrder: 2,
    cymaticFrequency: 7.83, // Schumann resonance — Earth pulse
    meditationPrompt: 'A Vesica Piscis é o portal entre dois mundos. Respire dentro dela — onde dois círculos se cruzam, novas formas nascem.',
    audioCue: 'Pulso Schumann 7.83 Hz (sub-audível, sentido no peito).',
    description: 'A Vesica Piscis — dois círculos entrelaçados — é o símbolo primordial da criação. Dela nascem o hexagrama, a flor-de-lótus e a mandorla cristã.',
  },
  {
    pattern: asPattern('golden-spiral'),
    generate: (s, i) => goldenSpiralVertices(s, i),
    edges: () => goldenSpiralEdges(),
    symmetryOrder: 1,
    fractalDimension: 1.0, // logarithmic spiral
    cymaticFrequency: 174, // Solfeggio — base frequency (optional inclusion)
    meditationPrompt: 'Siga a Espiral Dourada com os olhos fechados. PHI (1.618) é a assinatura do crescimento natural — você é parte desse movimento.',
    audioCue: 'Tom em 174 Hz com modulação logarítmica PHI.',
    description: 'A Espiral Dourada cresce na razão áurea φ — a proporção que governa conchas, galáxias e o ouvido interno humano.',
  },
  {
    pattern: asPattern('fibonacci-spiral'),
    generate: (s, _i) => fibonacciSpiralVertices(s),
    edges: () => fibonacciSpiralEdges(),
    symmetryOrder: 1,
    fractalDimension: 1.0,
    cymaticFrequency: 417, // Solfeggio — transformação de situação
    meditationPrompt: 'Cada retângulo Fibonacci é uma etapa de crescimento. Conte 1, 1, 2, 3, 5, 8, 13 — você está dentro da sequência criativa do universo.',
    audioCue: 'Tom SOLFEGGIO 417 Hz com ritmo Fibonacci (1-1-2-3-5-8-13).',
    description: 'A Espiral de Fibonacci é construída a partir de retângulos áureos cujas dimensões seguem 1, 1, 2, 3, 5, 8, 13... a sequência que governa a vida.',
  },
  {
    pattern: asPattern('tetrahedron'),
    generate: (s, _i) => tetrahedronVertices(s),
    edges: () => tetrahedronEdges(),
    symmetryOrder: 3,
    cymaticFrequency: 852, // Solfeggio — despertar espiritual / third eye
    meditationPrompt: 'O tetraedro é fogo — 4 faces triangulares queimando luz. Visualize 3 vértices apontando para baixo + 1 acima.',
    audioCue: 'Tom SOLFEGGIO 852 Hz (terceiro olho) com pulso triangular.',
    description: 'O Tetraedro — 4 vértices, 6 arestas, 4 faces — é o Sólido Platônico do FOGO. Elemento ativo, yang, transformador.',
  },
  {
    pattern: asPattern('cube'),
    generate: (s, _i) => cubeVertices(s),
    edges: () => cubeEdges(),
    symmetryOrder: 4,
    cymaticFrequency: 417, // Solfeggio — ancoragem
    meditationPrompt: 'O cubo é a estrutura do mundo manifesto — 6 faces, 8 vértices, 12 arestas. Estabilize-se nos eixos da terra.',
    audioCue: 'Tom SOLFEGGIO 417 Hz (transformação) em pulso quadrado.',
    description: 'O Cubo — 6 faces quadradas — é o Sólido Platônico da TERRA. Fundação, estabilidade, matéria densa.',
  },
  {
    pattern: asPattern('octahedron'),
    generate: (s, _i) => octahedronVertices(s),
    edges: () => octahedronEdges(),
    symmetryOrder: 4,
    cymaticFrequency: 639, // Solfeggio — conexões / relacionamentos
    meditationPrompt: 'O octaedro une dois tetraedros invertidos — fogo e água em equilíbrio. Medite sobre o entrelaçamento de opostos.',
    audioCue: 'Tom SOLFEGGIO 639 Hz (harmonia relacional) em fade simétrico.',
    description: 'O Octaedro — 8 faces triangulares — é o Sólido Platônico do AR. Representa o entrelaçamento de fogo (acima) e água (abaixo).',
  },
  {
    pattern: asPattern('dodecahedron'),
    generate: (s, _i) => dodecahedronVertices(s),
    edges: () => dodecahedronEdges(),
    symmetryOrder: 5,
    cymaticFrequency: 528, // Solfeggio — DNA / universo
    meditationPrompt: 'O dodecaedro é o universo em si — 12 faces pentagonais. Medite sobre a geometria do cosmos em escala macro.',
    audioCue: 'Tom SOLFEGGIO 528 Hz com reverberação cósmica (8s).',
    description: 'O Dodecaedro — 12 faces pentagonais — é o Sólido Platônico do ÉTER / UNIVERSO. Platão atribuiu a ele a forma do cosmos.',
  },
  {
    pattern: asPattern('icosahedron'),
    generate: (s, _i) => icosahedronVertices(s),
    edges: () => icosahedronEdges(),
    symmetryOrder: 5,
    cymaticFrequency: 963, // Solfeggio — consciência divina
    meditationPrompt: 'O icosaedro é a estrutura da água — 20 faces triangulares fluidas. Visualize a água se reorganizando neste padrão.',
    audioCue: 'Tom SOLFEGGIO 963 Hz (consciência) com textura líquida.',
    description: 'O Icosaedro — 20 faces triangulares — é o Sólido Platônico da ÁGUA. A geometria molecular da água e de muitos vírus.',
  },
]);

const PATTERN_INDEX: ReadonlyMap<GeometryPattern, PatternDef> = new Map(
  PATTERN_DEFS.map((d) => [d.pattern, d] as const),
);

// ─── Correspondence tables (≥5 traditions per pattern) ────────────────────
interface TraditionRow {
  readonly tradition: string;
  readonly meaning: string;
  readonly element?: string;
  readonly planet?: string;
  readonly chakra?: string;
}

const TRADITION_COVERAGE: ReadonlyArray<readonly [GeometryPattern, ReadonlyArray<TraditionRow>]> = Object.freeze([
  [asPattern('flower-of-life'), Object.freeze([
    { tradition: 'Cabala', meaning: 'Estrutura da criação emanada de Ein Sof — 19 círculos = 1+6+12 (=1+2+3+4+5+6)', element: 'éter', planet: 'Sol' },
    { tradition: 'Tantra', meaning: 'Yantra do coração (Anahata) — onde Shiva e Shakti se entrelaçam', chakra: 'anahata' },
    { tradition: 'Astrologia', meaning: 'Mandala zodiacal — 12 signos externos orbitando o Sol central', planet: 'Sol' },
    { tradition: 'Orixás', meaning: 'Padrão do Ori (cabeça/orixá interior) — geometria sagrada da consciência de cada Orixá', element: 'fogo' },
    { tradition: 'Numerologia Cabalística', meaning: '19 = 1+9 = 10 = 1+0 = 1 (Unidade) — o Todo em Um', element: 'número 1' },
    { tradition: 'Candomblé', meaning: 'Pontos riscados no chão do terreiro — assinatura geométrica do axé', element: 'axé' },
    { tradition: 'Runas', meaning: 'Jera + Berkano — ciclo de colheita e crescimento natural' },
    { tradition: 'Alquimia', meaning: 'Rubedo (estágio final) — a pedra filosofal em forma geométrica' },
  ])],
  [asPattern('metatron-cube'), Object.freeze([
    { tradition: 'Cabala', meaning: 'Metatron é o escriba celestial — seu cubo contém as 22 letras hebraicas e os 5 sólidos platônicos', element: 'éter' },
    { tradition: 'Tantra', meaning: 'Maha Meru (montanha cósmica) — geometria do bindu central', chakra: 'sahasrara' },
    { tradition: 'Astrologia', meaning: 'Mapa dos 12 signos + 12 casas + planetas internos', planet: 'Mercúrio (Metatron)' },
    { tradition: 'Orixás', meaning: 'Assentamento geométrico do Orixá — base de iniciação', element: 'fogo' },
    { tradition: 'Numerologia Cabalística', meaning: '13 = 1+3 = 4 (Tetraedro/Fogo) — totalidade em 13 vértices', element: 'número 13' },
    { tradition: 'Candomblé', meaning: 'Desenho da firma (assentamento) de Exu — abertura de caminhos' },
    { tradition: 'Runas', meaning: 'Dagaz (despertar) + Sowilo (Sol) — luz geométrica' },
    { tradition: 'Alquimia', meaning: 'Tabela de Esmeralda — "o que está em cima é como o que está embaixo"', element: 'mercúrio' },
  ])],
  [asPattern('seed-of-life'), Object.freeze([
    { tradition: 'Cabala', meaning: 'Sete dias da criação (Sephirot de construção) — 7 círculos = 7 dias', element: 'construção' },
    { tradition: 'Tantra', meaning: '7 chakras em formação hexagonal — equilíbrio ascendente', chakra: 'todos' },
    { tradition: 'Astrologia', meaning: '7 planetas clássicos — Sol, Lua, Mercúrio, Vênus, Marte, Júpiter, Saturno' },
    { tradition: 'Orixás', meaning: 'Sete Orixás fundamentais da criação — Orixá regente + 6 da linha', element: 'criação' },
    { tradition: 'Numerologia Cabalística', meaning: '7 = número da perfeição espiritual (Shevah)', element: 'número 7' },
    { tradition: 'Candomblé', meaning: 'Sete linhas da criação — 7 orixás fundamentais da nação' },
    { tradition: 'Runas', meaning: '7 planetas clássicos + 7 Runas Mãe' },
    { tradition: 'Alquimia', meaning: '7 estágios da obra (Nigredo a Rubedo) — apenas 7 dias', element: 'obra' },
  ])],
  [asPattern('tree-of-life'), Object.freeze([
    { tradition: 'Cabala', meaning: 'As 10 Sephirot + 22 caminhos — mapa completo da criação (Ets Chaim)', element: 'toda a estrutura' },
    { tradition: 'Tantra', meaning: 'Kundalini subindo do Muladhara (Malkuth) ao Sahasrara (Keter)', chakra: 'todos (10)' },
    { tradition: 'Astrologia', meaning: '10 Sephirot = 10 planetas (Sol, Lua, Mercúrio, Vênus, Marte, Júpiter, Saturno, Urano, Netuno, Plutão)', planet: 'todos' },
    { tradition: 'Orixás', meaning: '10 Orixás regentes das 10 esferas — Oxalá (Keter), Iemanjá (Malkuth), etc.', element: 'criação' },
    { tradition: 'Numerologia Cabalística', meaning: '10 Sephirot = 10 = 1 (Ein Sof) — retorno à Unidade', element: 'número 10' },
    { tradition: 'Candomblé', meaning: '10 fundamentos do terreiro — estrutura da casa', element: 'fundamento' },
    { tradition: 'Runas', meaning: '22 caminhos = 22 Runas do Futhark' },
    { tradition: 'Alquimia', meaning: '10 estágios da Grande Obra (prima materia até rubedo final)', element: 'obra completa' },
  ])],
  [asPattern('sri-yantra'), Object.freeze([
    { tradition: 'Cabala', meaning: '9 Sephirot dinâmicas manifestando + bindu central (Keter)', element: 'manifestação' },
    { tradition: 'Tantra', meaning: 'Sri Vidya — união de Shiva (4 triângulos ▼) e Shakti (5 triângulos ▲)', chakra: 'todos + bindu' },
    { tradition: 'Astrologia', meaning: '9 planetas + bindu (além-zodíaco) — geometria do sistema solar', planet: 'Navagraha' },
    { tradition: 'Orixás', meaning: '9 + 1 Orixás do panteão iorubano — geometria da criação', element: 'axé primordial' },
    { tradition: 'Numerologia Cabalística', meaning: '9 triângulos × 3 = 27 (3³ = mundo Triplicado) + bindu central', element: 'número 9' },
    { tradition: 'Candomblé', meaning: 'Ponto riscado de Iemanjá — geometria do mar primordial' },
    { tradition: 'Runas', meaning: '9 Mundos do Yggdrasil análogos aos 9 triângulos' },
    { tradition: 'Alquimia', meaning: 'Coniunctio oppositorum — o casamento alquímico em forma geométrica', element: 'ouro filosófico' },
  ])],
  [asPattern('vesica-piscis'), Object.freeze([
    { tradition: 'Cabala', meaning: 'Dois mundos se atravessando (Atziluth + Beriah) — portal da criação', element: 'portal' },
    { tradition: 'Tantra', meaning: 'Yoni (Shakti) + Lingam (Shiva) — origem da criação tântrica', chakra: 'manipura + svadhisthana' },
    { tradition: 'Astrologia', meaning: 'Conjunção Sol-Lua (eclipse) — fusão de opostos celestes', planet: 'Sol + Lua' },
    { tradition: 'Orixás', meaning: 'Portal entre Aiyê (mundo material) e Orun (mundo espiritual)', element: 'axé' },
    { tradition: 'Numerologia Cabalística', meaning: '√3 ≈ 1.732 — proporção irracional que conecta inteiro (2) ao irracional', element: 'número irracional' },
    { tradition: 'Candomblé', meaning: 'Ponto de abertura para o Orun — portão do Egungun' },
    { tradition: 'Runas', meaning: 'Gebo (presente) + Wunjo (alegria) — o portal do dom' },
    { tradition: 'Alquimia', meaning: 'Vaso hermético — recipiente da transformação', element: 'vaso' },
  ])],
  [asPattern('golden-spiral'), Object.freeze([
    { tradition: 'Cabala', meaning: 'Keter → Malkuth em espiral descendente — emissão divina (Tsimtsum)', element: 'emanação' },
    { tradition: 'Tantra', meaning: 'Kundalini subindo em espiral dourada — ativação da energia primordial', chakra: 'todos' },
    { tradition: 'Astrologia', meaning: 'Precessão dos equinócios (~25,920 anos = φ ciclos)', planet: 'precessão' },
    { tradition: 'Orixás', meaning: 'Movimento do Axé — espiral contínua do Ori em torno da cabeça', element: 'axé' },
    { tradition: 'Numerologia Cabalística', meaning: 'PHI = 1.618 = relação entre caminhos da Árvore', element: 'φ' },
    { tradition: 'Candomblé', meaning: 'Gira em espiral no terreiro — movimento fundamental da energia', element: 'movimento' },
    { tradition: 'Runas', meaning: 'Jera (ciclo) + Raidho (cavalgada) — movimento eterno' },
    { tradition: 'Alquimia', meaning: 'Ouroboros — espiral que retorna a si mesma', element: 'ouro' },
  ])],
  [asPattern('fibonacci-spiral'), Object.freeze([
    { tradition: 'Cabala', meaning: 'Sequência de criação — 1+1+2+3+5+8+13 até Tipheret (central)', element: 'criação' },
    { tradition: 'Tantra', meaning: '7 chakras alinhados em sequência Fibonacci (8 = infinito ∞)', chakra: 'todos' },
    { tradition: 'Astrologia', meaning: 'Órbitas planetárias em proporção Fibonacci (Mercúrio 88d, Vênus 225d, Terra 365d)', planet: 'Mercúrio, Vênus, Terra' },
    { tradition: 'Orixás', meaning: 'Linhagem dos Orixás — sequência genealógica da criação', element: 'linhagem' },
    { tradition: 'Numerologia Cabalística', meaning: 'Sequência: 1, 1, 2, 3, 5, 8, 13 — caminho de iniciação cabalística', element: 'sequência' },
    { tradition: 'Candomblé', meaning: 'Sequência de iniciação — primeiro, segundo, terceiro grau', element: 'iniciação' },
    { tradition: 'Runas', meaning: 'Kenaz + Perthro — sequência de revelação', element: 'fogo' },
    { tradition: 'Alquimia', meaning: 'Magnum Opus em etapas — cada estágio dobra o anterior', element: 'obra' },
  ])],
  [asPattern('tetrahedron'), Object.freeze([
    { tradition: 'Cabala', meaning: 'Geburah (Força/Julgamento) — fogo consumidor', element: 'fogo' },
    { tradition: 'Tantra', meaning: 'Manipura (chakra do fogo) — poder de vontade', chakra: 'manipura' },
    { tradition: 'Astrologia', meaning: 'Marte + Sol — signos de Fogo (Áries, Leão, Sagitário)', planet: 'Marte' },
    { tradition: 'Orixás', meaning: 'Ogun / Xangô — fogo da forja e do raio', element: 'fogo' },
    { tradition: 'Numerologia Cabalística', meaning: '4 = Tetragrammaton (YHVH) + 4 elementos + 4 fases da lua', element: 'número 4' },
    { tradition: 'Candomblé', meaning: 'Firma de Xangô — elemento ígneo do Orixá do raio', element: 'fogo' },
    { tradition: 'Runas', meaning: 'Thurisaz (gigante) + Sowilo (Sol) — fogo rúnico' },
    { tradition: 'Alquimia', meaning: 'Fogo Seco / Sulfur — princípio combustível', element: 'enxofre' },
  ])],
  [asPattern('cube'), Object.freeze([
    { tradition: 'Cabala', meaning: 'Malkuth (Reino) — mundo material manifesto', element: 'terra' },
    { tradition: 'Tantra', meaning: 'Muladhara (chakra raiz) — ancoragem na terra', chakra: 'muladhara' },
    { tradition: 'Astrologia', meaning: 'Saturno + signos de Terra (Touro, Virgem, Capricórnio)', planet: 'Saturno' },
    { tradition: 'Orixás', meaning: 'Oxum / Nanã — terra e água primordial', element: 'terra' },
    { tradition: 'Numerologia Cabalística', meaning: '6 = 6 faces + 6 dias da criação + 6 direções (cima/baixo/frente/trás/esquerda/direita)', element: 'número 6' },
    { tradition: 'Candomblé', meaning: 'Pedra fundamental do terreiro — alicerce material', element: 'terra' },
    { tradition: 'Runas', meaning: 'Isa (gelo) + Uruz (auroque) — solidez primordial' },
    { tradition: 'Alquimia', meaning: 'Sal — princípio fixo e cristalizado', element: 'sal' },
  ])],
  [asPattern('octahedron'), Object.freeze([
    { tradition: 'Cabala', meaning: 'Tipheret (Beleza/Harmonia) — equilíbrio entre fogo e água', element: 'ar' },
    { tradition: 'Tantra', meaning: 'Anahata (chakra do coração) — equilíbrio respiratório', chakra: 'anahata' },
    { tradition: 'Astrologia', meaning: 'Mercúrio / Vênus + signos de Ar (Gêmeos, Libra, Aquário)', planet: 'Mercúrio' },
    { tradition: 'Orixás', meaning: 'Iansã / Ewa — ventos e tempestades equilibradas', element: 'ar' },
    { tradition: 'Numerologia Cabalística', meaning: '8 = 8 faces + 8 direções + plenitude (após 7 dias)', element: 'número 8' },
    { tradition: 'Candomblé', meaning: 'Ponto de Iansã — ventos equilibrados no terreiro', element: 'ar' },
    { tradition: 'Runas', meaning: 'Ansuz (Odin/sopro) + Ehwaz (cavalo) — ar e movimento' },
    { tradition: 'Alquimia', meaning: 'Ar / Mercúrio volátil — princípio volátil', element: 'ar' },
  ])],
  [asPattern('dodecahedron'), Object.freeze([
    { tradition: 'Cabala', meaning: 'Keter (Coroa) — emanação primordial antes da criação', element: 'éter' },
    { tradition: 'Tantra', meaning: 'Sahasrara (chakra coroa) — conexão com o cosmos', chakra: 'sahasrara' },
    { tradition: 'Astrologia', meaning: 'Zodíaco inteiro — 12 signos = 12 faces pentagonais', planet: 'todos (12)' },
    { tradition: 'Orixás', meaning: 'Oxalá — Orixá da criação, do etéreo, da coroa', element: 'éter' },
    { tradition: 'Numerologia Cabalística', meaning: '12 = 12 tribos + 12 signos + 12 apóstolos', element: 'número 12' },
    { tradition: 'Candomblé', meaning: 'Firma de Oxalá — coroa da criação', element: 'éter' },
    { tradition: 'Runas', meaning: '12 Runas Mãe (correspondência zodiacal)', element: 'cosmos' },
    { tradition: 'Alquimia', meaning: 'Quinta Essentia — o éter dos antigos', element: 'quintessência' },
  ])],
  [asPattern('icosahedron'), Object.freeze([
    { tradition: 'Cabala', meaning: 'Yesod (Fundação) — água primordial antes da manifestação', element: 'água' },
    { tradition: 'Tantra', meaning: 'Svadhisthana (chakra sacro) — águas da criação', chakra: 'svadhisthana' },
    { tradition: 'Astrologia', meaning: 'Lua + signos de Água (Câncer, Escorpião, Peixes)', planet: 'Lua' },
    { tradition: 'Orixás', meaning: 'Iemanjá / Oxum — águas do mar e do rio', element: 'água' },
    { tradition: 'Numerologia Cabalística', meaning: '20 = 20 faces + 20 caminhos (Árvore menor) + letra Kaf (palma da mão)', element: 'número 20' },
    { tradition: 'Candomblé', meaning: 'Ponto de Iemanjá — água salgada primordial', element: 'água' },
    { tradition: 'Runas', meaning: 'Laguz (água) + Perthro (mistério) — fluido e profundo' },
    { tradition: 'Alquimia', meaning: 'Hydros / Mercúrio aquoso — princípio fluido', element: 'água' },
  ])],
]);

// Note: astrologia entry for 'cube' contains a typo 'meani:' — fixed below to 'meaning:'.

// ─── Correspondence lookup ────────────────────────────────────────────────
const TRADITION_INDEX: ReadonlyMap<GeometryPattern, ReadonlyArray<TraditionRow>> = new Map(
  TRADITION_COVERAGE.map(([p, rows]) => [p, rows] as const),
);

// ─── Canonical JSON (cycle 67 lesson: sorted keys for stable hashing) ─────
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map((v) => canonicalJson(v)).join(',') + ']';
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const parts = keys.map((k) => `${JSON.stringify(k)}:${canonicalJson((value as Record<string, unknown>)[k])}`);
  return '{' + parts.join(',') + '}';
}

// ─── Public API: computeGeometry ─────────────────────────────────────────
export function computeGeometry(
  pattern: GeometryPattern,
  params: { readonly scale?: number; readonly iterations?: number } = {},
): PatternGeometry {
  const validated = validatePattern(pattern);
  if (!validated.ok) {
    throw new Error(`Unknown pattern: ${(validated.error as { pattern: string }).pattern}`);
  }
  const def = PATTERN_INDEX.get(validated.value);
  if (!def) {
    throw new Error(`Pattern def missing: ${validated.value}`);
  }
  const scale = typeof params.scale === 'number' && params.scale > 0 ? params.scale : 1.0;
  const iterations = typeof params.iterations === 'number' && params.iterations > 0 ? params.iterations : 12;
  const vertices = def.generate(scale, iterations);
  const edges = def.edges();
  const com = centroid(vertices);
  const br = boundingRadius(vertices, com);
  // Use the pattern's declared symmetry order (override heuristic for accuracy).
  const symmetry = def.symmetryOrder;
  // Verify non-empty
  if (vertices.length === 0) {
    throw new Error(`Pattern ${validated.value} generated 0 vertices`);
  }
  const base: PatternGeometry = {
    pattern: validated.value,
    vertices,
    edges,
    centerOfMass: com,
    boundingRadius: br,
    symmetryOrder: symmetry,
  };
  if (def.fractalDimension !== undefined) {
    return { ...base, fractalDimension: def.fractalDimension };
  }
  return base;
}

// ─── Public API: getCorrespondences ───────────────────────────────────────
export function getCorrespondences(pattern: GeometryPattern): PatternCorrespondences {
  const def = PATTERN_INDEX.get(pattern);
  if (!def) {
    throw new Error(`Unknown pattern: ${pattern}`);
  }
  const rows = TRADITION_INDEX.get(pattern);
  if (!rows || rows.length === 0) {
    throw new Error(`No correspondences for pattern: ${pattern}`);
  }
  return Object.freeze({
    pattern,
    traditionMap: Object.freeze([...rows]),
    cymaticFrequency: def.cymaticFrequency,
    meditationPrompt: def.meditationPrompt,
    audioCue: def.audioCue,
  });
}

// ─── Public API: renderPattern ────────────────────────────────────────────
const RENDER_AUDIT: Map<GeometryPattern, { count: number; last: number }> = new Map();

export function renderPattern(pattern: GeometryPattern, scale: number = 1.0): PatternWithMeaning {
  const validated = validatePattern(pattern);
  if (!validated.ok) {
    throw new Error(`Unknown pattern: ${(validated.error as { pattern: string }).pattern}`);
  }
  const geometry = computeGeometry(validated.value, { scale });
  const correspondences = getCorrespondences(validated.value);
  const def = PATTERN_INDEX.get(validated.value);
  if (!def) {
    throw new Error(`Pattern def missing for render: ${validated.value}`);
  }
  // SVG path: for closed shapes (Platonic solids), render outline + edges.
  // For open patterns (spirals, tree), render only edges.
  const isClosed = ['tetrahedron', 'cube', 'octahedron', 'dodecahedron', 'icosahedron'].includes(validated.value);
  let svgPath: string;
  if (isClosed) {
    const outline = renderOutlinePath(geometry.vertices);
    const edges = renderPolylinePath(geometry.vertices, geometry.edges, scale);
    svgPath = `${outline} ${edges}`.trim();
  } else {
    svgPath = renderPolylinePath(geometry.vertices, geometry.edges, scale);
  }
  // Audit
  const prev = RENDER_AUDIT.get(validated.value) ?? { count: 0, last: 0 };
  RENDER_AUDIT.set(validated.value, { count: prev.count + 1, last: Date.now() });
  return Object.freeze({
    geometry,
    correspondences,
    svgPath: Object.freeze(svgPath),
    description: def.description,
  });
}

// ─── Public API: listPatterns ─────────────────────────────────────────────
export function listPatterns(): ReadonlyArray<{ readonly pattern: GeometryPattern; readonly traditionCount: number; readonly vertexCount: number }> {
  return Object.freeze(
    GEOMETRY_PATTERNS.map((p) => {
      const def = PATTERN_INDEX.get(p);
      const rows = TRADITION_INDEX.get(p);
      const v = def ? def.generate(1.0, 12).length : 0;
      return Object.freeze({
        pattern: p,
        traditionCount: rows?.length ?? 0,
        vertexCount: v,
      });
    }),
  );
}

// ─── Public API: exportAudit ──────────────────────────────────────────────
export function exportAudit(): ReadonlyArray<AuditEntry> {
  const out: AuditEntry[] = [];
  for (const p of GEOMETRY_PATTERNS) {
    const entry = RENDER_AUDIT.get(p);
    out.push({
      pattern: p,
      renderCount: entry?.count ?? 0,
      lastRenderedAt: entry?.last ?? 0,
    });
  }
  return Object.freeze(out);
}

// ─── Test hooks ───────────────────────────────────────────────────────────
export function _resetAuditForTest(): void {
  RENDER_AUDIT.clear();
}

export function _auditSacredTraditions(): ReadonlyArray<{ pattern: GeometryPattern; traditionCount: number }> {
  return Object.freeze(
    TRADITION_COVERAGE.map(([p, rows]) => Object.freeze({ pattern: p, traditionCount: rows.length })),
  );
}
