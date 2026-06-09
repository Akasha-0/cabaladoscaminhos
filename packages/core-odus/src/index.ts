/**
 * @akasha/core-odus
 * Motor determinístico dos 16 Odus — Merindilogun / Ifá
 * Sem dependências de framework. Dados esotéricos validados contra IDEIA.md.
 */

// Dados canônicos dos 16 Odus
export { ODUS_IFA, getOduPorNumero } from './odus-ifa-data';

// Odu Info - fonte canônica
export type { OduInfo } from './calculos';

// Cálculos de Odu
export { odusData, calcularOduNascimento, getQuizilasPorOdu, getPreceitosPorOdu, getEbósPorOdu } from './calculos';

// Odu de Nascimento
export { calculateBirthOdu } from './odu-birth';

// Ifá — Draw
export type { Ope, Odu, DrawResult } from './draw';
export { getOpe, getAllOdu, getOduNome, drawOdu, drawMultipleOdu, getOduByNumber } from './draw';

// Ifá — Matching
export { matchOduToRitual } from './matching';

// Ifá — Comparison
export { compareOduNumbers } from './comparison';

// Ifá — Suggestions
export { getRitualSuggestions, getRitualTiming } from './suggestions';

// Ifá — Timeline
export type { TimelinePhase, TimelineEvent, OduTimeline } from './timeline';
export { getOduTimeline, getPhaseProgress } from './timeline';
