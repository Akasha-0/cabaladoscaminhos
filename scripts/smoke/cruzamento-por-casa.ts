/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-A — CRUZAMENTO POR CASA · RUNTIME SMOKE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Runtime smoke harness. Exits 0 if all checks pass, non-zero otherwise.
 * Does NOT import the spec (avoids cross-module @ts-nocheck bleed); instead
 * imports the public engine directly and runs a parallel set of checks.
 *
 * Run with: node --experimental-strip-types scripts/smoke/cruzamento-por-casa.ts
 */

// @ts-nocheck — runtime smoke is permissive about types
import {
  CASAS_ORDENADAS,
  cruzamentoPorCasa,
  NOMES_CARTAS_CIGANAS,
  SACRED_TERMS_BY_TRADICAO,
  TEMAS_CASAS,
  TRADICOES,
  type CasaId,
  type CartaCiganaId,
  type MapaConsulente,
  type MesaCard,
  type MesaRealState,
} from '../../src/lib/engines/cruzamento-por-casa/index.ts';

// `process` not declared in node-stubs for runtime; declare inline.
declare const process: { exit(code: number): never };

let pass = 0;
let fail = 0;

function check(label: string, cond: boolean): void {
  if (cond) {
    pass++;
    console.log('  ✓ ' + label);
  } else {
    fail++;
    console.log('  ✗ ' + label);
  }
}

// Build a minimal but realistic fixture.
const consulenteId = 'smoke-w82a';
const cartas = [];
for (let c = 1; c <= 36; c++) {
  const cartaId = ((c * 5) % 36) + 1;
  cartas.push({
    casa: c,
    cartaCiganaId: cartaId,
    posicao: c % 2 === 0 ? 'cima' : 'baixo',
  });
}

const mapa = {
  astrologia: {
    sol: 'Touro',
    lua: 'Câncer',
    asc: 'Libra',
    mc: 'Capricórnio',
    casas: {
      1: 'Libra', 2: 'Escorpião', 3: 'Sagitário', 4: 'Capricórnio',
      5: 'Aquário', 6: 'Peixes', 7: 'Áries', 8: 'Touro',
      9: 'Gêmeos', 10: 'Câncer', 11: 'Leão', 12: 'Virgem',
    },
  },
  numerologia: { numeroDestino: 22, anoPessoal: 4, diaNatalicio: 7 },
  odu: { odu: 'Obara', orixaRegente: 'Oxóssi', orixaAtencao: 'Ogum' },
  cigano: { cartaNascimento: 8, regencia: 'Saturno' },
};

const mesa = { consulenteId, cartas };
const result = cruzamentoPorCasa(mesa, mapa);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('W82-A cruzamento-por-casa · Runtime Smoke');
console.log('═══════════════════════════════════════════════════════════════\n');

// 1. Output length
check('engine returns 36 casas', result.length === 36);

// 2. Order
check('casas in order 1..36', result.every((cr, i) => cr.casa === i + 1));

// 3. Each tema non-empty
check('every tema non-empty', result.every((cr) => cr.tema.length > 0));

// 4. Each casa has ≥ 3 contribs
check('every casa has ≥ 3 contribuicoes',
  result.every((cr) => cr.contribuicoes.length >= 3));

// 5. Cigano present for all
check('every casa has cigano contribution',
  result.every((cr) => cr.contribuicoes.some((cb) => cb.tradicao === 'cigano')));

// 6. Sintese non-empty
check('every sintese non-empty',
  result.every((cr) => cr.sintese.length > 0));

// 7. Output frozen
check('result array is frozen', Object.isFrozen(result));

// 8. Each CruzamentoCasa frozen
check('each CruzamentoCasa is frozen',
  result.every((cr) => Object.isFrozen(cr)));

// 9. Fontes subset of contribuicoes.tradicao
check('fontes ⊆ contribuicoes.tradicao',
  result.every((cr) => cr.fontes.every((f) => cr.contribuicoes.some((cb) => cb.tradicao === f))));

// 10. Fontes ⊇ contribuicoes.tradicao
check('fontes ⊇ contribuicoes.tradicao',
  result.every((cr) => cr.contribuicoes.every((cb) => cr.fontes.includes(cb.tradicao))));

// 11. TEMAS_CASAS has 36 entries
check('TEMAS_CASAS has 36 entries', Object.keys(TEMAS_CASAS).length === 36);

// 12. TRADICOES has 7 entries
check('TRADICOES has 7 entries', TRADICOES.length === 7);

// 13. SACRED_TERMS_BY_TRADICAO has 7 entries
check('SACRED_TERMS_BY_TRADICAO has 7 entries',
  Object.keys(SACRED_TERMS_BY_TRADICAO).length === 7);

// 14. CASAS_ORDENADAS length 36
check('CASAS_ORDENADAS length is 36', CASAS_ORDENADAS.length === 36);

// 15. Casa 1 tem "O Consulente"
check('casa 1 = O Consulente', TEMAS_CASAS[1] === 'O Consulente');

// 16. Casa 8 = Sexualidade e Transformação
check('casa 8 = Sexualidade e Transformação',
  TEMAS_CASAS[8] === 'Sexualidade e Transformação');

// 17. Casa 10 = Carreira e Vocação
check('casa 10 = Carreira e Vocação',
  TEMAS_CASAS[10] === 'Carreira e Vocação');

// 18. Casa 36 = O Retorno
check('casa 36 = O Retorno', TEMAS_CASAS[36] === 'O Retorno');

// 19. Sintese cites odu
check('sintese cites odu',
  result.every((cr) => cr.sintese.includes('Obara')));

// 20. Sintese cites numero
check('sintese cites a numero',
  result.every((cr) => /Número (\d+)|numero (\d+)/i.test(cr.sintese)));

// 21. Numerologia math: numeroDestino=22, casa=1 → (22+1)%9=2
const cr1Num = result[0].contribuicoes.find((cb) => cb.tradicao === 'numerologia');
check('casa 1 numero math (22+1=23, 23%9=5... wait, let me recompute: (22+1)%9=23%9=5)',
  cr1Num && cr1Num.texto.includes('Número 5'));

// 22. Numerologia modulo wraps: numeroDestino=22, casa=4 → (22+4)%9=26%9=8
const cr4 = result[3];
const cr4Num = cr4.contribuicoes.find((cb) => cb.tradicao === 'numerologia');
check('casa 4 numero math (22+4=26, 26%9=8)',
  cr4Num && cr4Num.texto.includes('Número 8'));

// 23. Astrologia modulo wraps: mesa 13 = astro 1
const cr13 = result[12];
const cr13Astro = cr13.contribuicoes.find((cb) => cb.tradicao === 'astrologia');
check('mesa casa 13 wraps to astro 1 (Libra)',
  cr13Astro && cr13Astro.texto.includes('Libra'));

// 24. Card name appears in at least one sintese
const cardName8 = NOMES_CARTAS_CIGANAS[8];
check('card name "Caixão" appears somewhere',
  result.some((cr) => cr.contribuicoes.some((cb) => cb.texto.includes(cardName8))));

// 25. Sacred term catalog covers 7 traditions
check('SACRED_TERMS_BY_TRADICAO covers 7 tradicoes',
  ['cigano', 'orixas', 'astrologia', 'cabala', 'numerologia', 'tantra', 'tarot']
    .every((t) => Array.isArray(SACRED_TERMS_BY_TRADICAO[t])));

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('SMOKE RESULT: ' + pass + '/' + (pass + fail) + ' passed');
console.log('═══════════════════════════════════════════════════════════════');

if (fail > 0) {
  process.exit(1);
}
process.exit(0);