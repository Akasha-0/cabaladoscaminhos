/**
 * Akasha Synthesis — i18n key definitions
 * R-023 F-223
 *
 * All human-readable strings returned by deriveAkashaAuthority are
 * parameterized i18n keys rather than hardcoded Portuguese.
 * Callers resolve these via t(key, params).
 */
import type { EstrategiaAkasha, AutoridadeAkasha } from './synthesizer';
import type { Area } from '../traducao-areas';

// ─── Re-export enums for use in deriveAkashaAuthority ────────────────────────
export type { EstrategiaAkasha, AutoridadeAkasha } from './synthesizer';
export type { Area } from '../traducao-areas';

// ─── i18n key + params pair ─────────────────────────────────────────────────

/** A translatable string: resolved via t(key, params) in the UI layer. */
export interface I18nText {
  readonly key: string;
  readonly params: Readonly<Record<string, string | number>>;
}

// ─── Authority i18n ──────────────────────────────────────────────────────────

/** estrategiaExplicacao per life-path group */
export function estrategiaI18n(
  estrategia: EstrategiaAkasha,
  lp: number | undefined
): I18nText {
  if (lp === undefined) {
    return { key: 'diario.authority.estrategiaPadrao', params: {} };
  }
  if (estrategia === 'act') {
    return { key: 'diario.authority.estrategiaAct', params: { lp } };
  }
  if (estrategia === 'observe') {
    return { key: 'diario.authority.estrategiaObserve', params: { lp } };
  }
  if (estrategia === 'surrender') {
    return { key: 'diario.authority.estrategiaSurrender', params: { lp } };
  }
  // default: 'wait'
  return { key: 'diario.authority.estrategiaWait', params: { lp } };
}

/** autoridadeExplicacao per autoridade type */
export function autoridadeI18n(autoridade: AutoridadeAkasha): I18nText {
  return {
    key: `diario.authority.autoridade.${autoridade}`,
    params: {},
  };
}

/** regra.condicao per autoridade type */
export function regraCondicaoI18n(autoridade: AutoridadeAkasha): I18nText {
  return {
    key: `diario.authority.regra.condicao.${autoridade}`,
    params: {},
  };
}

/** regra.accao per estrategia type */
export function regraAccaoI18n(estrategia: EstrategiaAkasha): I18nText {
  return {
    key: `diario.authority.regra.accao.${estrategia}`,
    params: {},
  };
}

/** timing.melhor/pior — depends on luaDeAgua */
export function timingI18n(luaDeAgua: boolean): {
  melhor: I18nText;
  pior: I18nText;
} {
  const prefix = luaDeAgua ? 'agua' : 'padrao';
  return {
    melhor: {
      key: `diario.authority.timing.melhor.${prefix}`,
      params: {},
    },
    pior: {
      key: `diario.authority.timing.pior.${prefix}`,
      params: {},
    },
  };
}

/** decisaoHoje per life-path group */
export function decisaoHojeI18n(
  areaFoco: Area,
  lp: number | undefined
): I18nText {
  if (lp === undefined) {
    return { key: 'diario.authority.decisaoPadrao', params: { area: areaFoco } };
  }
  if ([1, 3, 5].includes(lp)) {
    return { key: 'diario.authority.decisaoAct', params: { area: areaFoco } };
  }
  if ([2, 6, 7].includes(lp)) {
    return { key: 'diario.authority.decisaoRelacoes', params: { area: areaFoco } };
  }
  if ([4, 8, 9, 11].includes(lp)) {
    return { key: 'diario.authority.decisaoProposito', params: { area: areaFoco } };
  }
  if (lp === 22 || lp === 33) {
    return { key: 'diario.authority.decisaoSpiritual', params: { area: areaFoco } };
  }
  return { key: 'diario.authority.decisaoPadrao', params: { area: areaFoco } };
}

/** praticaDiaria — depends on areaFoco + autoridade */
export function praticaDiariaI18n(
  areaFoco: Area,
  autoridade: AutoridadeAkasha
): I18nText {
  return {
    key: 'diario.authority.praticaDiariaTemplate',
    params: {
      area: areaFoco,
      autoridade,
    },
  };
}
