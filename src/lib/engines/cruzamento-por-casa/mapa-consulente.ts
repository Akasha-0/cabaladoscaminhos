/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-A — CRUZAMENTO POR CASA · MAPA CONSULENTE (validation)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Input validation for the 4 natal maps. The cruzamentoPorCasa engine
 * requires a structurally complete MapaConsulente; this module exposes
 * validateMapa() that returns a tagged Result (no exceptions thrown).
 *
 * Validation rules:
 *   - Astrologia: 12 entries in `casas`, all valid zodiac names
 *   - Numerologia: numeroDestino 1..33, anoPessoal 1..9, diaNatalicio 1..31
 *   - Odu: non-empty odu + both orixás
 *   - Cigano: cartaNascimento 1..36, regencia non-empty
 *
 * Casa range for astrologia.casas: 1..12 (only — mesa casas > 12 wrap or
 * use the fallback topic mapping).
 */

import type {
  CartaCiganaId,
  CasaId,
  MapaAstrologia,
  MapaCigano,
  MapaConsulente,
  MapaNumerologia,
  MapaOdu,
} from './types.ts';

// ════════════════════════════════════════════════════════════════════════════
// RESULT TYPE
// ════════════════════════════════════════════════════════════════════════════

export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// ════════════════════════════════════════════════════════════════════════════
// VALID ZODIAC NAMES (12 signs, PT-BR)
// ════════════════════════════════════════════════════════════════════════════

const ZODIAC_NAMES_PT: ReadonlyArray<string> = Object.freeze([
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
]);

// ════════════════════════════════════════════════════════════════════════════
// VALID ODUS (16)
// ════════════════════════════════════════════════════════════════════════════

const VALID_ODUS: ReadonlyArray<string> = Object.freeze([
  'Ejiogbe', 'Oyeku', 'Iwori', 'Odi', 'Irosu', 'Owonrin',
  'Obara', 'Okanran', 'Ogunda', 'Osa', 'Ika', 'Oturupon',
  'Otura', 'Irete', 'Ofe', 'Ofun',
]);

// ════════════════════════════════════════════════════════════════════════════
// PER-MAP VALIDATORS
// ════════════════════════════════════════════════════════════════════════════

function validateAstrologia(m: MapaAstrologia): Result<MapaAstrologia> {
  if (typeof m.sol !== 'string' || m.sol.length === 0) {
    return { ok: false, error: 'MapaAstrologia.sol ausente' };
  }
  if (typeof m.lua !== 'string' || m.lua.length === 0) {
    return { ok: false, error: 'MapaAstrologia.lua ausente' };
  }
  if (typeof m.asc !== 'string' || m.asc.length === 0) {
    return { ok: false, error: 'MapaAstrologia.asc ausente' };
  }
  if (typeof m.mc !== 'string' || m.mc.length === 0) {
    return { ok: false, error: 'MapaAstrologia.mc ausente' };
  }
  if (!m.casas || typeof m.casas !== 'object') {
    return { ok: false, error: 'MapaAstrologia.casas ausente' };
  }
  for (let c = 1; c <= 12; c++) {
    const sign = m.casas[c];
    if (typeof sign !== 'string' || sign.length === 0) {
      return { ok: false, error: `MapaAstrologia.casas[${c}] ausente` };
    }
  }
  return { ok: true, value: m };
}

function validateNumerologia(m: MapaNumerologia): Result<MapaNumerologia> {
  if (!Number.isInteger(m.numeroDestino) || m.numeroDestino < 1 || m.numeroDestino > 33) {
    return { ok: false, error: `numeroDestino inválido: ${m.numeroDestino} (esperado 1..33)` };
  }
  if (!Number.isInteger(m.anoPessoal) || m.anoPessoal < 1 || m.anoPessoal > 9) {
    return { ok: false, error: `anoPessoal inválido: ${m.anoPessoal} (esperado 1..9)` };
  }
  if (!Number.isInteger(m.diaNatalicio) || m.diaNatalicio < 1 || m.diaNatalicio > 31) {
    return { ok: false, error: `diaNatalicio inválido: ${m.diaNatalicio} (esperado 1..31)` };
  }
  return { ok: true, value: m };
}

function validateOdu(m: MapaOdu): Result<MapaOdu> {
  if (typeof m.odu !== 'string' || m.odu.length === 0) {
    return { ok: false, error: 'MapaOdu.odu ausente' };
  }
  if (!VALID_ODUS.includes(m.odu)) {
    return { ok: false, error: `Odu desconhecido: ${m.odu}` };
  }
  if (typeof m.orixaRegente !== 'string' || m.orixaRegente.length === 0) {
    return { ok: false, error: 'MapaOdu.orixaRegente ausente' };
  }
  if (typeof m.orixaAtencao !== 'string' || m.orixaAtencao.length === 0) {
    return { ok: false, error: 'MapaOdu.orixaAtencao ausente' };
  }
  return { ok: true, value: m };
}

function validateCigano(m: MapaCigano): Result<MapaCigano> {
  if (!Number.isInteger(m.cartaNascimento) || m.cartaNascimento < 1 || m.cartaNascimento > 36) {
    return { ok: false, error: `cartaNascimento inválida: ${m.cartaNascimento} (esperado 1..36)` };
  }
  if (typeof m.regencia !== 'string' || m.regencia.length === 0) {
    return { ok: false, error: 'MapaCigano.regencia ausente' };
  }
  return { ok: true, value: m };
}

// ════════════════════════════════════════════════════════════════════════════
// COMPOSITE VALIDATOR
// ════════════════════════════════════════════════════════════════════════════

/**
 * Validates the composite MapaConsulente. Returns the same object on
 * success; returns the first error encountered on failure.
 */
export function validateMapa(mapa: MapaConsulente): Result<MapaConsulente> {
  const a = validateAstrologia(mapa.astrologia);
  if (!a.ok) return a;
  const n = validateNumerologia(mapa.numerologia);
  if (!n.ok) return n;
  const o = validateOdu(mapa.odu);
  if (!o.ok) return o;
  const c = validateCigano(mapa.cigano);
  if (!c.ok) return c;
  return { ok: true, value: mapa };
}

/**
 * Convenience: throws on validation failure. Useful in test fixtures
 * where you want a hard failure rather than Result chaining.
 */
export function assertValidMapa(mapa: MapaConsulente): MapaConsulente {
  const r = validateMapa(mapa);
  if (!r.ok) throw new Error('mapa inválido: ' + r.error);
  return mapa;
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS — BRANDED CONSTRUCTORS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Branded casa constructor. Throws if casa is not 1..36.
 */
export function casa(n: number): CasaId {
  if (!Number.isInteger(n) || n < 1 || n > 36) {
    throw new Error('CasaId inválido: ' + n);
  }
  return n as CasaId;
}

/**
 * Branded cartaCigana constructor. Throws if carta is not 1..36.
 */
export function cartaCigana(n: number): CartaCiganaId {
  if (!Number.isInteger(n) || n < 1 || n > 36) {
    throw new Error('CartaCiganaId inválido: ' + n);
  }
  return n as CartaCiganaId;
}

// Export zodiac list for downstream test fixtures.
export const __ZODIAC_NAMES_PT__ = ZODIAC_NAMES_PT;