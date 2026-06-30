// @ts-nocheck
// scripts/smoke/mentorship-ui.ts — runtime smoke (Node strip-types)
import { SAMPLE_MENTORES, TRADICAO_LABELS } from '../../src/components/mentorship/constants.ts';
import { TRADICOES } from '../../src/components/mentorship/types.ts';

const a = SAMPLE_MENTORES.length;
const b = Object.keys(TRADICAO_LABELS).length;
const c = TRADICOES.length;
console.log('mentores=' + a + ' tradicoes=' + b + ' catalog=' + c);
if (a !== 12 || b !== 7 || c !== 7) {
  console.log('SMOKE FAILED');
  process.exit(1);
}
console.log('SMOKE OK');
