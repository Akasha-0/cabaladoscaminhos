/**
 * Testes para `significados-especificos.ts` (F-222).
 *
 * Testa o helper `significadosEspecificos` que recebe os 5 Pilares
 * (shape do core) e devolve 5 SignificadoCurado — cada um referente ao
 * SÍMBOLO ESPECÍFICO do Pilar, com fallback para a visão genérica quando
 * o símbolo não tem entrada curada.
 *
 * Princípios testados:
 * - `significadosEspecificos` retorna 5 chaves (cabala, astrologia, tantrica, odu, iching)
 * - Hit path: símbolo específico existe → retorna o SignificadoCurado específico
 * - Fallback path: símbolo inexistente → retorna a visão genérica (id === pilar)
 * - Pilares 1-3 e 5 NÃO carregam `requer_terreiro` (apenas Pilar 4)
 * - Axiomas VISION §3: PT-BR, citação, curadoria
 * - Interfaces verificadas via `satisfies` (compiletime shape guard)
 */
import { describe, it, expect } from 'vitest';
import type {
 PilarDadosCabala,
 PilarDadosAstrologia,
 PilarDadosTantrica,
 PilarDadosOdu,
 PilarDadosIChing,
 PilaresDados,
} from './significados-especificos';
import { significadosEspecificos } from './significados-especificos';
import type { SignificadoCurado } from './significados-curados';
import { significadoGenericoDoPilar } from './significados-curados';

// ─── Shape mínimo de SignificadoCurado (campos verificados em todos os testes) ───

const CAMPOS_OBRIGATORIOS: (keyof SignificadoCurado)[] = [
 'id',
 'pilar',
 'titulo',
 'essencia',
 'missao',
 'sombra',
 'pratica',
 'conexao',
 'fonte',
];

// ─── Fixture mínima válida — satisfaz PilaresDados sem campos extras ───
// Ids de Odu vêm de PILAR_4_SERIES (16 odus reais): Ogbe, Ejiokô, Etogundá,
// Irosun, Oxê, Obará, Odi, Ejionile, Ossá, Ofun, Owonrin, Ejilaxebô,
// Oturupon, Oturá, Iká, Ofurufu. Ogbe = 1º Odu (hit direto).

const FIXTURE_COMPLETA: PilaresDados = {
 cabala: { life_path: 1, birthday: 5, expression: 3, ano_pessoal: 7 },
 astrologia: {
  sol_signo: 'Escorpião',
  asc_signo: 'Leão',
  lua_signo: 'Câncer',
  lua_fase: 'cheia',
  trinity: { sombra: 8, dom: 11, graca: 5 },
  trinity_dominante: 'dom',
  lilith_signo: 'Áries',
  casa_8_signo: 'Escorpião',
 },
 tantrica: {
  corpo_predominante: 7,
  trigemeo: 'mental',
  temperamento_atual: 'colerico',
 },
 odu: {
  odu_principal: 'Ogbe',
  odu_secundario: 'Ogunda',
  fonte: 'Ifá',
 },
 iching: {
  hexagrama_natal: 1,
  hexagrama_dia: 51,
  level: 'gift',
 },
};

// ─── Helper de validação (reusado em HIT e FALLBACK) ────────────────────────

function validarSignificadoCurado(s: SignificadoCurado, pilar: string, id: string | number): void {
 CAMPOS_OBRIGATORIOS.forEach((campo) => {
  const valor = s[campo];
  expect(valor, `${pilar} campo "${String(campo)}" vazio ou falsy`).toBeTruthy();
  if (typeof valor === 'string') {
   expect(
    valor.trim().length,
    `${pilar} campo "${String(campo)}" whitespace-only`
   ).toBeGreaterThan(0);
  }
 });
 expect(s.pilar, `${pilar} pilar mismatch`).toBe(pilar);
 expect(s.id, `${pilar} id mismatch`).toEqual(id);
}

// ─── Interface shape checks (compiletime via satisfies) ────────────────────

describe('significados-especificos: interface shapes', () => {
 describe('PilarDadosCabala', () => {
  it('satisfies: aceita shape válido', () => {
   const fixture = {
    life_path: 11,
    birthday: 3,
    expression: 9,
    ano_pessoal: 5,
   } satisfies PilarDadosCabala;
   expect(fixture.life_path).toBe(11);
  });

  it('satisfies: life_path pode ser número mestre (11, 22, 33)', () => {
   ([11, 22, 33] as const).forEach((m) => {
    const f = {
     life_path: m,
     birthday: 1,
     expression: 1,
     ano_pessoal: 1,
    } satisfies PilarDadosCabala;
    expect(f.life_path).toBe(m);
   });
  });
 });

 describe('PilarDadosAstrologia', () => {
  it('satisfies: aceita shape válido', () => {
   const fixture = {
    sol_signo: 'Aries',
    asc_signo: null,
    lua_signo: 'Touro',
    lua_fase: 'nova' as const,
    trinity: { sombra: 1, dom: 2, graca: 3 },
    trinity_dominante: 'sombra' as const,
    lilith_signo: null,
    casa_8_signo: null,
   } satisfies PilarDadosAstrologia;
   expect(fixture.sol_signo).toBe('Aries');
  });

  it('lua_fase: união literal de 4 valores', () => {
   (['nova', 'crescente', 'cheia', 'minguante'] as const).forEach((f) => {
    const fixture = {
     sol_signo: 'Aries',
     asc_signo: null,
     lua_signo: 'Aries',
     lua_fase: f,
     trinity: { sombra: 1, dom: 1, graca: 1 },
     trinity_dominante: 'sombra' as const,
     lilith_signo: null,
     casa_8_signo: null,
    } satisfies PilarDadosAstrologia;
    expect(fixture.lua_fase).toBe(f);
   });
  });

  it('asc_signo, lilith_signo, casa_8_signo: permitem null', () => {
   const fixture = {
    sol_signo: 'Aries',
    asc_signo: null,
    lua_signo: 'Aries',
    lua_fase: 'nova' as const,
    trinity: { sombra: 1, dom: 1, graca: 1 },
    trinity_dominante: 'sombra' as const,
    lilith_signo: null,
    casa_8_signo: null,
   } satisfies PilarDadosAstrologia;
   expect(fixture.asc_signo).toBeNull();
   expect(fixture.lilith_signo).toBeNull();
   expect(fixture.casa_8_signo).toBeNull();
  });

  it('trinity_dominante: união literal de 3 valores', () => {
   (['sombra', 'dom', 'graca'] as const).forEach((d) => {
    const fixture = {
     sol_signo: 'Aries',
     asc_signo: null,
     lua_signo: 'Aries',
     lua_fase: 'nova' as const,
     trinity: { sombra: 1, dom: 1, graca: 1 },
     trinity_dominante: d,
     lilith_signo: null,
     casa_8_signo: null,
    } satisfies PilarDadosAstrologia;
    expect(fixture.trinity_dominante).toBe(d);
   });
  });
 });

 describe('PilarDadosTantrica', () => {
  it('satisfies: aceita shape válido', () => {
   const fixture = {
    corpo_predominante: 1,
    trigemeo: 'fisico' as const,
    temperamento_atual: 'sanguineo' as const,
   } satisfies PilarDadosTantrica;
   expect(fixture.corpo_predominante).toBe(1);
  });

  it('corpo_predominante: número de 1 a 11', () => {
   for (let c = 1; c <= 11; c++) {
    const f = {
     corpo_predominante: c,
     trigemeo: 'fisico' as const,
     temperamento_atual: 'sanguineo' as const,
    } satisfies PilarDadosTantrica;
    expect(f.corpo_predominante).toBe(c);
   }
  });

  it('trigemeo: união literal de 3 valores', () => {
   (['fisico', 'astral', 'mental'] as const).forEach((t) => {
    const fixture = {
     corpo_predominante: 1,
     trigemeo: t,
     temperamento_atual: 'sanguineo' as const,
    } satisfies PilarDadosTantrica;
    expect(fixture.trigemeo).toBe(t);
   });
  });

  it('temperamento_atual: união literal de 4 valores', () => {
   (['sanguineo', 'colerico', 'melancolico', 'fleumatico'] as const).forEach((t) => {
    const fixture = {
     corpo_predominante: 1,
     trigemeo: 'fisico' as const,
     temperamento_atual: t,
    } satisfies PilarDadosTantrica;
    expect(fixture.temperamento_atual).toBe(t);
   });
  });
 });

 describe('PilarDadosOdu', () => {
  it('satisfies: aceita shape válido', () => {
   const fixture = {
    odu_principal: 'Ogbe',
    odu_secundario: null,
    fonte: 'Ifá' as const,
   } satisfies PilarDadosOdu;
   expect(fixture.odu_principal).toBe('Ogbe');
  });

  it('fonte: união literal de 2 valores', () => {
   (['Ifá', 'Candomblé'] as const).forEach((f) => {
    const fixture = {
     odu_principal: 'Ogbe',
     odu_secundario: null,
     fonte: f,
    } satisfies PilarDadosOdu;
    expect(fixture.fonte).toBe(f);
   });
  });

  it('odu_secundario: permite null', () => {
   const fixture = {
    odu_principal: 'Ogbe',
    odu_secundario: null,
    fonte: 'Ifá' as const,
   } satisfies PilarDadosOdu;
   expect(fixture.odu_secundario).toBeNull();
  });
 });

 describe('PilarDadosIChing', () => {
  it('satisfies: aceita shape válido', () => {
   const fixture = {
    hexagrama_natal: 1,
    hexagrama_dia: 64,
    level: 'shadow' as const,
   } satisfies PilarDadosIChing;
   expect(fixture.hexagrama_dia).toBe(64);
  });

  it('level: união literal de 3 valores', () => {
   (['shadow', 'gift', 'siddhi'] as const).forEach((l) => {
    const fixture = {
     hexagrama_natal: 1,
     hexagrama_dia: 1,
     level: l,
    } satisfies PilarDadosIChing;
    expect(fixture.level).toBe(l);
   });
  });
 });

 describe('PilaresDados (aggregate)', () => {
  it('satisfies: fixture completa passa no tipo sem campos extras', () => {
   const fixture = FIXTURE_COMPLETA satisfies PilaresDados;
   expect(fixture.cabala.life_path).toBe(1);
   expect(fixture.astrologia.sol_signo).toBe('Escorpião');
   expect(fixture.tantrica.corpo_predominante).toBe(7);
   expect(fixture.odu.odu_principal).toBe('Ogbe');
   expect(fixture.iching.hexagrama_dia).toBe(51);
  });
 });
});

// ─── HIT path: símbolo específico existe na curadoria ─────────────────────

describe('significados-especificos: hit path (símbolo específico encontrado)', () => {
 it('cabala life_path=1 → "Pioneiro" (não genérico)', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   cabala: { ...FIXTURE_COMPLETA.cabala, life_path: 1 },
  });
  expect(result.cabala.id).toBe(1);
  expect(result.cabala.titulo).toBe('Pioneiro');
  expect(result.cabala.pilar).toBe('cabala');
  validarSignificadoCurado(result.cabala, 'cabala', 1);
 });

 it('cabala life_path=11 → número mestre (não genérico)', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   cabala: { ...FIXTURE_COMPLETA.cabala, life_path: 11 },
  });
  expect(result.cabala.id).toBe(11);
  expect(result.cabala.pilar).toBe('cabala');
  expect(result.cabala.titulo).not.toBe('Caminho de Vida');
  validarSignificadoCurado(result.cabala, 'cabala', 11);
 });

 it('astrologia sol_signo="Escorpião" → significado específico (não genérico)', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   astrologia: { ...FIXTURE_COMPLETA.astrologia, sol_signo: 'Escorpião' },
  });
  expect(result.astrologia.id).toBe('Escorpião');
  expect(result.astrologia.pilar).toBe('astrologia');
  expect(result.astrologia.titulo).not.toBe('Céu do seu nascimento');
  validarSignificadoCurado(result.astrologia, 'astrologia', 'Escorpião');
 });

 // PILAR_2_SIGNOS usa diacríticos PT-BR — 'Áries' (não 'Aries')
 it('astrologia sol_signo="Áries" → hit direto', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   astrologia: { ...FIXTURE_COMPLETA.astrologia, sol_signo: 'Áries' },
  });
  expect(result.astrologia.id).toBe('Áries');
  expect(result.astrologia.pilar).toBe('astrologia');
  validarSignificadoCurado(result.astrologia, 'astrologia', 'Áries');
 });

 it('tantrica corpo_predominante=1 → hit direto', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   tantrica: { ...FIXTURE_COMPLETA.tantrica, corpo_predominante: 1 },
  });
  expect(result.tantrica.pilar).toBe('tantrica');
  expect(result.tantrica.id).toBe(1);
  validarSignificadoCurado(result.tantrica, 'tantrica', 1);
 });

 it('odu odu_principal="Ogbe" → hit direto (Ifá)', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   odu: { odu_principal: 'Ogbe', odu_secundario: null, fonte: 'Ifá' },
  });
  expect(result.odu.pilar).toBe('odu');
  expect(result.odu.id).toBe('Ogbe');
  validarSignificadoCurado(result.odu, 'odu', 'Ogbe');
  // R-022 §4.4: Odu sempre requer terreiro
  expect(result.odu.requer_terreiro).toBe(true);
 });

 it('iching hexagrama_dia=1 → "Qian · O Criativo" (não genérico)', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   iching: { ...FIXTURE_COMPLETA.iching, hexagrama_dia: 1 },
  });
  expect(result.iching.id).toBe(1);
  expect(result.iching.pilar).toBe('iching');
  expect(result.iching.titulo).not.toBe('Mutação do seu caminho');
  validarSignificadoCurado(result.iching, 'iching', 1);
 });

 it('iching hexagrama_dia=64 → último hexagrama (hit direto)', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   iching: { ...FIXTURE_COMPLETA.iching, hexagrama_dia: 64 },
  });
  expect(result.iching.id).toBe(64);
  expect(result.iching.pilar).toBe('iching');
  validarSignificadoCurado(result.iching, 'iching', 64);
 });

 it('todos os 5 Pilares retornam SignificadoCurado com todos os campos obrigatórios', () => {
  const result = significadosEspecificos(FIXTURE_COMPLETA);
  (['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as const).forEach((pilar) => {
   validarSignificadoCurado(result[pilar], pilar, result[pilar].id);
  });
 });
});

// ─── FALLBACK path: símbolo inexistente → visão genérica ─────────────────

describe('significados-especificos: fallback path (símbolo inexistente → genérico)', () => {
 it('cabala life_path=99 → genérico (id === "cabala", título "Caminho de Vida")', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   cabala: { life_path: 99, birthday: 1, expression: 1, ano_pessoal: 1 },
  });
  expect(result.cabala.id).toBe('cabala');
  expect(result.cabala.pilar).toBe('cabala');
  expect(result.cabala.titulo).toBe('Caminho de Vida');
  expect(result.cabala).toEqual(significadoGenericoDoPilar('cabala'));
 });

 it('cabala life_path=0 → genérico (0 não tem entrada)', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   cabala: { life_path: 0, birthday: 1, expression: 1, ano_pessoal: 1 },
  });
  expect(result.cabala.id).toBe('cabala');
  expect(result.cabala.titulo).toBe('Caminho de Vida');
 });

 it('astrologia sol_signo="PlanetaX" → genérico (id === "astrologia")', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   astrologia: {
    sol_signo: 'PlanetaX',
    asc_signo: null,
    lua_signo: 'Aries',
    lua_fase: 'nova',
    trinity: { sombra: 1, dom: 1, graca: 1 },
    trinity_dominante: 'sombra',
    lilith_signo: null,
    casa_8_signo: null,
   },
  });
  expect(result.astrologia.id).toBe('astrologia');
  expect(result.astrologia.pilar).toBe('astrologia');
  expect(result.astrologia.titulo).toBe('Céu do seu nascimento');
  expect(result.astrologia).toEqual(significadoGenericoDoPilar('astrologia'));
 });

 it('tantrica corpo_predominante=99 → genérico (id === "tantrica")', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   tantrica: {
    corpo_predominante: 99,
    trigemeo: 'fisico',
    temperamento_atual: 'sanguineo',
   },
  });
  expect(result.tantrica.id).toBe('tantrica');
  expect(result.tantrica.pilar).toBe('tantrica');
  expect(result.tantrica.titulo).toBe('Anatomia sutil');
  expect(result.tantrica).toEqual(significadoGenericoDoPilar('tantrica'));
 });

 it('odu odu_principal="NaoExiste" → genérico (id === "odu", requer_terreiro=true)', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   odu: { odu_principal: 'NaoExiste', odu_secundario: null, fonte: 'Ifá' },
  });
  expect(result.odu.id).toBe('odu');
  expect(result.odu.pilar).toBe('odu');
  expect(result.odu.titulo).toBe('Ori do seu nascimento');
  expect(result.odu.requer_terreiro).toBe(true);
  expect(result.odu).toEqual(significadoGenericoDoPilar('odu'));
 });

 it('iching hexagrama_dia=999 → genérico (id === "iching")', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   iching: { hexagrama_natal: 1, hexagrama_dia: 999, level: 'shadow' },
  });
  expect(result.iching.id).toBe('iching');
  expect(result.iching.pilar).toBe('iching');
  expect(result.iching.titulo).toBe('Mutação do seu caminho');
  expect(result.iching).toEqual(significadoGenericoDoPilar('iching'));
 });

 it('iching hexagrama_dia=0 → genérico', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   iching: { hexagrama_natal: 1, hexagrama_dia: 0, level: 'shadow' },
  });
  expect(result.iching.id).toBe('iching');
  expect(result.iching.titulo).toBe('Mutação do seu caminho');
 });
});

// ─── R-022 §4.4: Pilar 4 (Odu) sempre requer terreiro ─────────────────

describe('significados-especificos: R-022 §4.4 — Odu requer terreiro', () => {
 it('Odu com hit direto ("Ogbe") → requer_terreiro=true', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   odu: { odu_principal: 'Ogbe', odu_secundario: null, fonte: 'Ifá' },
  });
  expect(result.odu.requer_terreiro).toBe(true);
 });

 it('Odu com fallback genérico ("NaoExiste") → requer_terreiro=true', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   odu: { odu_principal: 'NaoExiste', odu_secundario: null, fonte: 'Ifá' },
  });
  expect(result.odu.requer_terreiro).toBe(true);
 });

 it('Pilares 1, 2, 3 e 5 NÃO carregam requer_terreiro', () => {
  const result = significadosEspecificos(FIXTURE_COMPLETA);
  expect(result.cabala.requer_terreiro).toBeUndefined();
  expect(result.astrologia.requer_terreiro).toBeUndefined();
  expect(result.tantrica.requer_terreiro).toBeUndefined();
  expect(result.iching.requer_terreiro).toBeUndefined();
 });
});

// ─── Axiomas editoriais (VISION §3) ─────────────────────────────────────

describe('significados-especificos: axiomas editoriais', () => {
 const PT_BR_RE =
  /[áéíóúãõçÁÉÍÓÚÃÕÇ]|\b(o|a|os|as|de|do|da|dos|das|em|no|na|nos|nas|por|para|com|sem|que|não|seu|sua|seus|suas)\b/i;

 it('Axioma 4 (citação obrigatória): toda resposta tem fonte não-vazia', () => {
  const result = significadosEspecificos(FIXTURE_COMPLETA);
  (['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as const).forEach((p) => {
   expect(result[p].fonte.length, `${p} sem fonte`).toBeGreaterThan(0);
   expect(result[p].fonte).not.toBe('TBD');
   expect(result[p].fonte).not.toBe('N/A');
  });
 });

 it('Axioma 8 (PT-BR primeiro): registros contêm marcadores PT-BR', () => {
  const result = significadosEspecificos(FIXTURE_COMPLETA);
  const CAMPOS_TEXTO: Array<keyof SignificadoCurado> = [
   'titulo',
   'essencia',
   'missao',
   'sombra',
   'pratica',
   'conexao',
  ];
  (['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as const).forEach((p) => {
   const registro = CAMPOS_TEXTO.map((c) => result[p][c] as string).join(' ');
   expect(
    PT_BR_RE.test(registro),
    `${p} sem marcadores PT-BR: "${registro.slice(0, 80)}…"`
   ).toBe(true);
  });
 });

 it('conexao referencia o Pilar correto (não "undefined" / vazio)', () => {
  const result = significadosEspecificos(FIXTURE_COMPLETA);
  (['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as const).forEach((p) => {
   expect(result[p].conexao, `${p} conexao vazia`).toBeTruthy();
   expect(
    result[p].conexao.trim().length,
    `${p} conexao whitespace-only`
   ).toBeGreaterThan(0);
  });
 });
});

// ─── Pureza / idempotência ─────────────────────────────────────────────
// NOTA: significadosEspecificos retorna referências do array SIGNIFICADOS
// sub-jacente — as sub-chaves (a[p]) são estávelmente as MESMAS referências
// em todas as chamadas. Apenas o objeto wrapper externo é fresh a cada call.

describe('significados-especificos: pureza e idempotência', () => {
 it('objeto externo é fresco a cada chamada; valores são estáveis', () => {
  const a = significadosEspecificos(FIXTURE_COMPLETA);
  const b = significadosEspecificos(FIXTURE_COMPLETA);
  // Objeto wrapper é novo a cada chamada
  expect(a).not.toBe(b);
  expect(a).toEqual(b);
  // Sub-chaves são referências do array curado (comportamento documentado)
  expect(Object.keys(a).sort()).toEqual(['astrologia', 'cabala', 'iching', 'odu', 'tantrica']);
 });

 it('não muta o objeto retornado em chamadas subsequentes', () => {
  const snapshot = JSON.stringify(significadosEspecificos(FIXTURE_COMPLETA));
  significadosEspecificos(FIXTURE_COMPLETA);
  significadosEspecificos({
   ...FIXTURE_COMPLETA,
   cabala: { ...FIXTURE_COMPLETA.cabala, life_path: 22 },
  });
  expect(JSON.stringify(significadosEspecificos(FIXTURE_COMPLETA))).toBe(snapshot);
 });
});

// ─── Nullable e edge-case fields ─────────────────────────────────────────

describe('significados-especificos: nullable e edge-case fields', () => {
 it('asc_signo=null não quebra (astrologia)', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   astrologia: { ...FIXTURE_COMPLETA.astrologia, asc_signo: null },
  });
  expect(result.astrologia.pilar).toBe('astrologia');
  validarSignificadoCurado(result.astrologia, 'astrologia', result.astrologia.id);
 });

 it('lilith_signo=null não quebra (astrologia)', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   astrologia: { ...FIXTURE_COMPLETA.astrologia, lilith_signo: null },
  });
  expect(result.astrologia.pilar).toBe('astrologia');
 });

 it('casa_8_signo=null não quebra (astrologia)', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   astrologia: { ...FIXTURE_COMPLETA.astrologia, casa_8_signo: null },
  });
  expect(result.astrologia.pilar).toBe('astrologia');
 });

 it('odu_secundario=null não quebra (odu)', () => {
  const result = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   odu: { ...FIXTURE_COMPLETA.odu, odu_secundario: null },
  });
  expect(result.odu.pilar).toBe('odu');
 });

 it('level="siddhi" e "shadow" são aceitos (iching)', () => {
  const shadow = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   iching: { hexagrama_natal: 1, hexagrama_dia: 1, level: 'shadow' },
  });
  const siddhi = significadosEspecificos({
   ...FIXTURE_COMPLETA,
   iching: { hexagrama_natal: 1, hexagrama_dia: 1, level: 'siddhi' },
  });
  // O significado é determinado por hexagrama_dia; level não muda hit/fallback
  expect(shadow.iching.pilar).toBe('iching');
  expect(siddhi.iching.pilar).toBe('iching');
 });
});
