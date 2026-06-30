/**
 * Sacred Geometry Engine — Smoke Harness
 * W75-C — Cycle 75
 *
 * Self-running end-to-end smoke. 1 inline check per pattern (13 total) +
 * 5 pattern-coverage checks. Exit 0 = PASS.
 */

import {
  computeGeometry,
  getCorrespondences,
  renderPattern,
  listPatterns,
  exportAudit,
  fnv1a,
  GEOMETRY_PATTERNS,
  asPattern,
  type GeometryPattern,
} from './sacred-geometry-engine.ts';

declare const process: { exit(code: number): never };

// ─── Tiny assertion harness ──────────────────────────────────────────────
let pass = 0;
let fail = 0;
const fails: string[] = [];

function check(label: string, cond: boolean, detail: string = ''): void {
  if (cond) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    fails.push(`${label}${detail ? ` (${detail})` : ''}`);
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

function section(name: string): void {
  console.log(`\n— ${name} —`);
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 1: PATTERN_REGISTRY — 13 patterns, 1 check each
// ─────────────────────────────────────────────────────────────────────────
section('1. PATTERN_REGISTRY (13 patterns)');

const PATTERN_LIST: ReadonlyArray<GeometryPattern> = [
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
];

for (const p of PATTERN_LIST) {
  check(`pattern "${p}" is registered in GEOMETRY_PATTERNS`, GEOMETRY_PATTERNS.includes(p));
}

check('GEOMETRY_PATTERNS has exactly 13 entries', GEOMETRY_PATTERNS.length === 13, `got ${GEOMETRY_PATTERNS.length}`);

// ─────────────────────────────────────────────────────────────────────────
// SECTION 2: RENDER_ONE_PER_PATTERN — 13 checks
// ─────────────────────────────────────────────────────────────────────────
section('2. RENDER_ONE_PER_PATTERN (13 renders)');

const auditedRenderCounts = new Map<string, number>();
for (const p of PATTERN_LIST) {
  const r = renderPattern(p);
  const verts = r.geometry.vertices.length;
  const edges = r.geometry.edges.length;
  const svgLen = r.svgPath.length;
  const ok = verts >= 4 && edges >= 5 && svgLen > 20 && r.description.length > 20;
  check(`renderPattern("${p}") => vertices>=4, edges>=5, svg>20, desc>20 (got v=${verts} e=${edges} s=${svgLen})`, ok);
  auditedRenderCounts.set(p, (auditedRenderCounts.get(p) ?? 0) + 1);
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 3: TRADITION_COVERAGE — 13 checks (>=5 traditions per pattern)
// ─────────────────────────────────────────────────────────────────────────
section('3. TRADITION_COVERAGE');

const SACRED_TRADITIONS = ['Cabala', 'Tantra', 'Astrologia', 'Orixás', 'Numerologia Cabalística', 'Candomblé', 'Runas', 'Alquimia'] as const;

for (const p of PATTERN_LIST) {
  const c = getCorrespondences(p);
  const traditionNames = c.traditionMap.map((r) => r.tradition);
  const allSacredPresent = SACRED_TRADITIONS.every((t) => traditionNames.includes(t));
  check(`pattern "${p}" has all 8 sacred traditions present`, allSacredPresent, `traditions=${traditionNames.join(',')}`);
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 4: CYMATIC_FREQUENCY_VALIDATION — 13 checks
// ─────────────────────────────────────────────────────────────────────────
section('4. CYMATIC_FREQUENCY_VALIDATION');

const SACRED_HZ = new Set([396, 417, 528, 639, 741, 852, 963, 432, 440, 7.83, 174]);

for (const p of PATTERN_LIST) {
  const c = getCorrespondences(p);
  check(`pattern "${p}" cymatic frequency ${c.cymaticFrequency}Hz in sacred set`, SACRED_HZ.has(c.cymaticFrequency));
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 5: SVG_PATH_NONEMPTY — 13 checks
// ─────────────────────────────────────────────────────────────────────────
section('5. SVG_PATH_NONEMPTY');

for (const p of PATTERN_LIST) {
  const r = renderPattern(p);
  const isPath = r.svgPath.startsWith('M') && (r.svgPath.includes('L') || r.svgPath.includes('Z'));
  check(`pattern "${p}" SVG path starts with M and contains L or Z`, isPath, `path="${r.svgPath.slice(0, 50)}..."`);
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 6: LIST_PATTERNS — 1 check (returns 13)
// ─────────────────────────────────────────────────────────────────────────
section('6. LIST_PATTERNS');

const list = listPatterns();
check('listPatterns returns 13 entries', list.length === 13, `got ${list.length}`);
check('listPatterns every entry has >=5 traditions', list.every((p) => p.traditionCount >= 5));

// ─────────────────────────────────────────────────────────────────────────
// SECTION 7: EXPORT_AUDIT_FROZEN — 3 checks
// ─────────────────────────────────────────────────────────────────────────
section('7. EXPORT_AUDIT_FROZEN');

const audit = exportAudit();
check('exportAudit returns 13 entries', audit.length === 13);
check('exportAudit result is frozen', Object.isFrozen(audit));
const cubeEntry = audit.find((a) => a.pattern === 'cube');
check('cube renderCount > 0 after Section 2 render', !!cubeEntry && cubeEntry.renderCount > 0, `cubeCount=${cubeEntry?.renderCount}`);

// ─────────────────────────────────────────────────────────────────────────
// SECTION 8: FNV_HASH — 2 checks
// ─────────────────────────────────────────────────────────────────────────
section('8. FNV_HASH');

check('fnv1a("") = 811c9dc5 (FNV offset)', fnv1a('') === '811c9dc5');
check('fnv1a deterministic across calls', fnv1a('sacred-geometry') === fnv1a('sacred-geometry'));

// ─────────────────────────────────────────────────────────────────────────
// SECTION 9: COMPUTE_GEOMETRY_MATH — 4 checks
// ─────────────────────────────────────────────────────────────────────────
section('9. COMPUTE_GEOMETRY_MATH');

const foL = computeGeometry(asPattern('flower-of-life'));
check('flower-of-life vertices = 19', foL.vertices.length === 19, `got ${foL.vertices.length}`);
check('flower-of-life boundingRadius > 0', foL.boundingRadius > 0);
const tot = computeGeometry(asPattern('tree-of-life'));
check('tree-of-life vertices = 10', tot.vertices.length === 10, `got ${tot.vertices.length}`);
check('tree-of-life edges = 22', tot.edges.length === 22, `got ${tot.edges.length}`);

// ─────────────────────────────────────────────────────────────────────────
// REPORT
// ─────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`W75-C SMOKE: pass=${pass} fail=${fail}`);
console.log('─'.repeat(60));
if (fail > 0) {
  console.log('Failures:');
  for (const f of fails) console.log(`  - ${f}`);
  process.exit(1);
}
console.log('W75-C SMOKE: ALL PASSED ✅');
process.exit(0);
