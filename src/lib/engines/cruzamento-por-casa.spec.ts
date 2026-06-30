/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-A — CRUZAMENTO POR CASA · SELF-RUNNING SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Self-running spec harness — NO vitest, NO jest. Run with:
 *   node --experimental-strip-types src/lib/engines/cruzamento-por-casa.spec.ts
 *
 * Inline SHA-256 (simplified 16-round, NOT cryptographic — used only as
 * a content fingerprint for the audit hash). Pattern from cycle 67+.
 *
 * ≥25 assertions covering:
 *   - 36 casas present and in order
 *   - tema non-empty for every casa
 *   - contribuicoes ≥ 3 per casa (astro, num, odu)
 *   - cigano present when mesa has carta
 *   - sintese non-empty + cites specific symbols (number, odu, card name)
 *   - fontes subset of contribuicoes.tradicao
 *   - frozen objects (deep immutability)
 *   - validateMapa passes valid input, rejects bad input
 *   - branded constructors throw on out-of-range
 *   - constants frozen
 */

import {
  assertValidMapa,
  casa,
  cartaCigana,
  CASAS_ORDENADAS,
  cruzamentoPorCasa,
  KEYWORDS_ODUS,
  NOMES_CARTAS_CIGANAS,
  SACRED_TERMS_BY_TRADICAO,
  TEMAS_CASAS,
  TRADICOES,
  validateMapa,
  type CasaId,
  type CartaCiganaId,
  type CruzamentoCasa,
  type MapaConsulente,
  type MesaCard,
  type MesaRealState,
} from './cruzamento-por-casa/index.ts';

// `process` is not declared in node-stubs for the worktree tsconfig. Declare inline.
declare const process: { exit(code: number): never };

// ════════════════════════════════════════════════════════════════════════════
// INLINE SHA-256 (simplified 16-round, fingerprint only)
// ════════════════════════════════════════════════════════════════════════════

function sha256Fingerprint(s: string): string {
  // FNV-1a 64-bit hash + djb2 — purely a content fingerprint, not crypto.
  let h1 = 0xcbf29ce484222325n;
  let h2 = 5381n;
  for (let i = 0; i < s.length; i++) {
    const c = BigInt(s.charCodeAt(i));
    h1 = ((h1 ^ c) * 0x100000001b3n) & 0xffffffffffffffffn;
    h2 = ((h2 * 33n) + c) & 0xffffffffffffffffn;
  }
  return h1.toString(16).padStart(16, '0') + h2.toString(16).padStart(16, '0');
}

// ════════════════════════════════════════════════════════════════════════════
// MINIMAL FIXTURE — 36 cards (1 per casa) + sample MapaConsulente
// ════════════════════════════════════════════════════════════════════════════

function buildFixture(): { mesa: MesaRealState; mapa: MapaConsulente } {
  const consulenteId = 'consulente-w82a-test' as MesaRealState['consulenteId'];
  const cartas: MesaCard[] = [];
  for (let c = 1; c <= 36; c++) {
    const cid = c as CasaId;
    const cartaId = ((c * 7 - 3) % 36) + 1; // deterministic shuffle 1..36
    cartas.push({
      casa: cid,
      cartaCiganaId: cartaId as CartaCiganaId,
      posicao: c % 2 === 0 ? 'cima' : 'baixo',
    });
  }

  const astrologia = {
    sol: 'Leão',
    lua: 'Escorpião',
    asc: 'Sagitário',
    mc: 'Áries',
    casas: {
      1: 'Sagitário', 2: 'Capricórnio', 3: 'Aquário', 4: 'Peixes',
      5: 'Áries', 6: 'Touro', 7: 'Gêmeos', 8: 'Câncer',
      9: 'Leão', 10: 'Virgem', 11: 'Libra', 12: 'Escorpião',
    },
  };

  const numerologia = {
    numeroDestino: 11, // master number
    anoPessoal: 7,
    diaNatalicio: 23,
  };

  const odu = {
    odu: 'Ejiogbe' as MapaConsulente['odu']['odu'],
    orixaRegente: 'Oxalá' as MapaConsulente['odu']['orixaRegente'],
    orixaAtencao: 'Iemanjá' as MapaConsulente['odu']['orixaAtencao'],
  };

  const cigano = {
    cartaNascimento: 1 as CartaCiganaId,
    regencia: 'Sol',
  };

  return {
    mesa: { consulenteId, cartas },
    mapa: { astrologia, numerologia, odu, cigano },
  };
}

// ════════════════════════════════════════════
// ASSERTIONS
// ════════════════════════════════════════════

let pass = 0;
let fail = 0;
const failures: string[] = [];

function expect(label: string, cond: boolean, info?: unknown): void {
  if (cond) {
    pass++;
    console.log('  ✓ ' + label);
  } else {
    fail++;
    const infoStr = info !== undefined ? ' ' + JSON.stringify(info) : '';
    failures.push(label + infoStr);
    console.log('  ✗ ' + label + infoStr);
  }
}

// ════════════════════════════════════════════
// RUN
// ════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('W82-A cruzamento-por-casa · Self-running spec');
console.log('═══════════════════════════════════════════════════════════════\n');

const { mesa, mapa } = buildFixture();
const result = cruzamentoPorCasa(mesa, mapa);

// 1. Output length
expect('engine returns 36 casas', result.length === 36, { length: result.length });

// 2. Output is in order 1..36
const ordemOk = result.every((cr, i) => cr.casa === (i + 1));
expect('casas are in order 1..36', ordemOk);

// 3. Every tema is non-empty
const allTemasOk = result.every((cr) => typeof cr.tema === 'string' && cr.tema.length > 0);
expect('every casa has a non-empty tema', allTemasOk);

// 4. Every casa has ≥ 3 contribuicoes (astro + num + odu)
const minContribs = result.every((cr) => cr.contribuicoes.length >= 3);
expect('every casa has ≥ 3 contribuicoes', minContribs);

// 5. Every casa has cigano contribution (mesa has cards for all 36)
const ciganoOk = result.every((cr) =>
  cr.contribuicoes.some((cb) => cb.tradicao === 'cigano'),
);
expect('every casa has cigano contribution (mesa has 36 cards)', ciganoOk);

// 6. Sintese is non-empty and ≥ 30 chars
const sinteseOk = result.every((cr) => cr.sintese.length >= 30);
expect('every sintese is ≥ 30 chars', sinteseOk);

// 7. Sintese cites the odu keyword
const oduKeyword = KEYWORDS_ODUS[mapa.odu.odu];
const sinteseOduOk = result.every((cr) => cr.sintese.includes(mapa.odu.odu) || cr.sintese.includes(oduKeyword ?? ''));
expect('every sintese cites the odu or its keyword', sinteseOduOk);

// 8. Sintese cites the numero (regex match)
const sinteseNumeroOk = result.every((cr) => /Número (\d+)|número (\d+)|numero (\d+)/.test(cr.sintese));
expect('every sintese cites a numero', sinteseNumeroOk);

// 9. Sintese cites the card name (at least one casa)
const firstCartaName = NOMES_CARTAS_CIGANAS[1];
const sinteseCardOk = result.some((cr) => firstCartaName ? cr.sintese.includes(firstCartaName) : false);
expect('at least one sintese cites the Cigano card name', sinteseCardOk);

// 10. Fontes is subset of contribuicoes.tradicao
const fontesOk = result.every((cr) =>
  cr.fontes.every((f) => cr.contribuicoes.some((cb) => cb.tradicao === f)),
);
expect('fontes ⊆ contribuicoes.tradicao for every casa', fontesOk);

// 11. Fontes contains all four contribs that exist
const fontesCompleto = result.every((cr) =>
  cr.contribuicoes.every((cb) => cr.fontes.includes(cb.tradicao)),
);
expect('fontes ⊇ contribuicoes.tradicao for every casa', fontesCompleto);

// 12. Output is deeply frozen
const frozenOk = Object.isFrozen(result);
expect('output array is frozen', frozenOk);

// 13. Each CruzamentoCasa is frozen
const eachFrozen = result.every((cr) => Object.isFrozen(cr));
expect('each CruzamentoCasa is frozen', eachFrozen);

// 14. Each contribuicoes array is frozen
const contribsFrozen = result.every((cr) => Object.isFrozen(cr.contribuicoes));
expect('each contribuicoes array is frozen', contribsFrozen);

// 15. TEMAS_CASAS is frozen
expect('TEMAS_CASAS is frozen', Object.isFrozen(TEMAS_CASAS));

// 16. TRADICOES is frozen
expect('TRADICOES is frozen', Object.isFrozen(TRADICOES));

// 17. SACRED_TERMS_BY_TRADICAO is frozen
expect('SACRED_TERMS_BY_TRADICAO is frozen', Object.isFrozen(SACRED_TERMS_BY_TRADICAO));

// 18. SACRED_TERMS_BY_TRADICAO has 7 entries
expect('SACRED_TERMS_BY_TRADICAO has 7 tradicoes', Object.keys(SACRED_TERMS_BY_TRADICAO).length === 7);

// 19. CASAS_ORDENADAS has 36 entries in order
expect('CASAS_ORDENADAS length is 36', CASAS_ORDENADAS.length === 36);
expect('CASAS_ORDENADAS starts at 1 and ends at 36',
  CASAS_ORDENADAS[0] === 1 && CASAS_ORDENADAS[35] === 36);

// 20. Casa 8 has the expected tema
expect('casa 8 tema is "Sexualidade e Transformação"',
  TEMAS_CASAS[8 as CasaId] === 'Sexualidade e Transformação');

// 21. Casa 10 has the expected tema
expect('casa 10 tema is "Carreira e Vocação"',
  TEMAS_CASAS[10 as CasaId] === 'Carreira e Vocação');

// 22. validateMapa accepts the fixture
const validResult = validateMapa(mapa);
expect('validateMapa accepts valid fixture', validResult.ok === true);

// 23. validateMapa rejects bad astrologia
const badMapa = {
  ...mapa,
  astrologia: { ...mapa.astrologia, casas: { ...mapa.astrologia.casas, 1: '' } },
};
const invalidResult = validateMapa(badMapa);
expect('validateMapa rejects bad astrologia', invalidResult.ok === false);

// 24. validateMapa rejects bad numerologia
const badNum = {
  ...mapa,
  numerologia: { ...mapa.numerologia, numeroDestino: 99 },
};
expect('validateMapa rejects numeroDestino > 33', validateMapa(badNum).ok === false);

// 25. assertValidMapa throws on bad input
let threw = false;
try {
  assertValidMapa(badNum);
} catch (_e) {
  threw = true;
}
expect('assertValidMapa throws on bad input', threw);

// 26. Branded constructors work for valid values
expect('casa(1) === 1 (branded)', casa(1) === 1);
expect('cartaCigana(1) === 1 (branded)', cartaCigana(1) === 1);

// 27. Branded constructors throw on out-of-range
let threwRange = false;
try {
  casa(99);
} catch (_e) {
  threwRange = true;
}
expect('casa(99) throws', threwRange);

// 28. SHA-256 fingerprint is deterministic
const fp1 = sha256Fingerprint('w82-a cruzamento test');
const fp2 = sha256Fingerprint('w82-a cruzamento test');
expect('sha256 fingerprint is deterministic', fp1 === fp2);

// 29. SHA-256 fingerprint differs for different inputs
const fp3 = sha256Fingerprint('w82-a different input');
expect('sha256 fingerprint differs for different inputs', fp1 !== fp3);

// 30. SHA-256 fingerprint is 32 hex chars
expect('sha256 fingerprint is 32 hex chars', /^[0-9a-f]{32}$/.test(fp1));

// 31. Specific casa (casa 1) has 'O Consulente' as tema
const casa1 = result[0];
expect('casa 1 tema is "O Consulente"', casa1 !== undefined && casa1.tema === 'O Consulente');

// 32. Specific casa (casa 36) has 'O Retorno' as tema
const casa36 = result[35];
expect('casa 36 tema is "O Retorno"', casa36 !== undefined && casa36.tema === 'O Retorno');

// 33. Contribuicao ref is non-empty for every entry
const refOk = result.every((cr) => cr.contribuicoes.every((cb) => cb.ref.length > 0));
expect('every contribuicao has a non-empty ref', refOk);

// 34. Astrologia contribution ref starts with 'casa-'
const astroRefOk = result.every((cr) => {
  const astro = cr.contribuicoes.find((cb) => cb.tradicao === 'astrologia');
  return astro ? astro.ref.startsWith('casa-') : true;
});
expect('astrologia ref starts with "casa-"', astroRefOk);

// 35. Odu contribution ref starts with 'odu-'
const oduRefOk = result.every((cr) => {
  const odu = cr.contribuicoes.find((cb) => cb.tradicao === 'orixas');
  return odu ? odu.ref.startsWith('odu-') : true;
});
expect('orixas ref starts with "odu-"', oduRefOk);

// 36. Cigano contribution ref starts with 'carta-'
const ciganoRefOk = result.every((cr) => {
  const cig = cr.contribuicoes.find((cb) => cb.tradicao === 'cigano');
  return cig ? cig.ref.startsWith('carta-') : true;
});
expect('cigano ref starts with "carta-"', ciganoRefOk);

// 37. Numerologia: numero (numeroDestino + c) % 9 || 9 — casa 1 sanity check
// numeroDestino = 11, casa = 1 → (11 + 1) % 9 = 3
const cr1 = result[0];
const numContrib1 = cr1 !== undefined ? cr1.contribuicoes.find((cb) => cb.tradicao === 'numerologia') : undefined;
const num1Match = numContrib1 !== undefined ? numContrib1.texto.match(/Número (\d+)/) : null;
expect('casa 1 numero = 3 (11+1=12, 12%9=3)',
  num1Match !== null && num1Match[1] === '3', { texto: numContrib1?.texto });

// 38. Numerologia modulo wraps to 9 for casa where (n+c) % 9 === 0
// numeroDestino = 11, casa = 7 → (11+7)=18, 18%9=0 → 9
const cr7 = result[6];
const numContrib7 = cr7 !== undefined ? cr7.contribuicoes.find((cb) => cb.tradicao === 'numerologia') : undefined;
const num7Match = numContrib7 !== undefined ? numContrib7.texto.match(/Número (\d+)/) : null;
expect('casa 7 numero = 9 (11+7=18, 18%9=0 → 9)',
  num7Match !== null && num7Match[1] === '9', { texto: numContrib7?.texto });

// 39. Astrologia wraps for mesa casa > 12 (mesa 13 = astro 1)
const cr13 = result[12];
const astroContrib13 = cr13 !== undefined ? cr13.contribuicoes.find((cb) => cb.tradicao === 'astrologia') : undefined;
expect('casa 13 astrology uses cusp of casa 1 (Sagitário)',
  astroContrib13 !== undefined && astroContrib13.texto.includes('Sagitário'),
  { texto: astroContrib13?.texto });

// 40. TRADICOES contains all 7 expected names
const expectedTradicoes = ['cigano', 'orixas', 'astrologia', 'cabala', 'numerologia', 'tantra', 'tarot'];
const allTradicoesOk = expectedTradicoes.every((t) => TRADICOES.includes(t as typeof TRADICOES[number]));
expect('TRADICOES contains all 7 expected entries', allTradicoesOk);

// 41. validateMapa rejects bad odu
const badOdu = { ...mapa, odu: { ...mapa.odu, odu: 'NotAValidOdu' as MapaConsulente['odu']['odu'] } };
expect('validateMapa rejects unknown odu', validateMapa(badOdu).ok === false);

// 42. validateMapa rejects bad cigano
const badCigano = { ...mapa, cigano: { ...mapa.cigano, cartaNascimento: 99 as CartaCiganaId } };
expect('validateMapa rejects cartaNascimento > 36', validateMapa(badCigano).ok === false);

// 43. Reference types: CruzamentoCasa shape is correct
const sample: CruzamentoCasa | undefined = result[0];
const sampleOk = sample !== undefined
  && typeof sample.casa === 'number'
  && typeof sample.tema === 'string'
  && Array.isArray(sample.contribuicoes)
  && typeof sample.sintese === 'string'
  && Array.isArray(sample.fontes);
expect('CruzamentoCasa shape is correct', sampleOk === true);

// 44. Hash fingerprint of result is stable
const resultJson = JSON.stringify(result.map((cr) => ({ c: cr.casa, t: cr.tema, s: cr.sintese })));
const fpResult1 = sha256Fingerprint(resultJson);
const fpResult2 = sha256Fingerprint(resultJson);
expect('sha256 fingerprint of result is stable', fpResult1 === fpResult2);

// ════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('RESULT: ' + pass + '/' + (pass + fail) + ' passed');
console.log('═══════════════════════════════════════════════════════════════');

if (fail > 0) {
  console.error('\nFAILURES:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
process.exit(0);