// mentorship-ui.smoke.ts — runtime smoke
// Quick checks: catalog sizes, adapter round-trip, route parse.

import {
  createInMemoryMentorshipAdapter,
} from '../components/mentorship/mentorship-adapter.ts';
import {
  TRADICAO_LABELS,
  SAMPLE_MENTORES,
  SAMPLE_SLOTS,
} from '../components/mentorship/constants.ts';
import { TRADICOES } from '../components/mentorship/types.ts';
import {
  parseMentorshipPath,
  buildMentorshipPath,
} from '../lib/engines/mentorship-ui/routing.ts';

let pass = 0;
let fail = 0;
function check(cond: boolean, msg: string): void {
  if (cond) {
    pass++;
  } else {
    fail++;
    console.log('  FAIL: ' + msg);
  }
}

function main(): void {
  check(SAMPLE_MENTORES.length === 12, 'SAMPLE_MENTORES has 12 entries');
  check(Object.keys(TRADICAO_LABELS).length === 7, 'TRADICAO_LABELS has 7 entries');
  check(TRADICOES.length === 7, 'TRADICOES has 7 entries');
  check(SAMPLE_SLOTS.length >= 30, 'SAMPLE_SLOTS has >= 30 entries (got ' + SAMPLE_SLOTS.length + ')');

  // All 7 tradições covered
  for (const t of TRADICOES) {
    check(
      SAMPLE_MENTORES.some((m) => m.tradicaoPrincipal === t),
      'tradicao ' + t + ' is covered'
    );
  }

  // Adapter round-trip
  const a = createInMemoryMentorshipAdapter();
  const m1 = a.getMentor('m-1');
  check(m1 !== null, 'm-1 found');
  if (m1) {
    const slots = a.getSlots(m1.id);
    check(slots.length >= 3, 'm-1 has >= 3 future slots');
    if (slots.length > 0) {
      const result = a.agendarSessao({
        usuarioId: 'u-smoke-1',
        slotId: slots[0]!.id,
      });
      check('sessao' in result, 'agendarSessao succeeds');
      if ('sessao' in result) {
        const mySessoes = a.listMinhasSessoes({ usuarioId: 'u-smoke-1' });
        check(mySessoes.length >= 1, 'listMinhasSessoes returns >= 1');
        const cancel = a.cancelarSessao({
          usuarioId: 'u-smoke-1',
          sessaoId: result.sessao.id,
        });
        check('status' in cancel, 'cancelarSessao succeeds');
      }
    }
  }

  // Routing smoke
  const r1 = parseMentorshipPath('/mentorship');
  check(r1 !== null && r1.route === 'list', 'parse /mentorship');
  const r2 = parseMentorshipPath('/mentorship/m-3');
  check(r2 !== null && r2.route === 'detail', 'parse /mentorship/m-3');
  check(buildMentorshipPath('minhas-sessoes') === '/mentorship/sessions', 'build path');

  console.log('');
  console.log('=== W82-C MENTORSHIP-UI SMOKE ===');
  console.log('PASS: ' + pass);
  console.log('FAIL: ' + fail);
  if (fail > 0) process.exit(1);
}

main();
