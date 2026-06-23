/**
 * Pilar 6 §1.1 — Detector de Tipo Energetico (D-YYY).
 *
 * Inspiracao algoritmica (D-YYY §"Inspiracao algoritmica"):
 *   - Tipo detection combina birthOdu (Pilar 4) + ascendente (Pilar 2)
 *     + estado do centro da vitalidade.
 *
 * Heuristica Wave 4 (skeleton — Wave 5+ pode refinar):
 *   - Refletor:     nenhum centro definido (lunar puro — raro)
 *   - Iniciador:    centro da vitalidade ativo + Odu "yin/feminino" (Ofun, Oyeku, ...)
 *   - Guia:         Odu "yang/masculino" + ascendente em signos mediadores (libra, aquario)
 *   - Iniciador Aberto: Odu yang + ascendente em signos de fogo (aries, leao, sagitario)
 *
 * Fallback deterministico se heuristica falhar: derivar do Pilar 4 (Odu).
 * Pilares 4/5 ja calculados em @akasha/core-odus + @akasha/core-iching.
 */

import type { Pilar6Input, TipoEnergetico } from './types';

/**
 * Lista simplificada de Odus "yang/masculino" (Pilar 4 subset).
 * Mantida inline para evitar ciclo de import (core-pilar6 → core-odus).
 * Quando core-odus exportar essas listas formalmente, refatorar.
 */
const ODUS_YANG = new Set([
  'Ogbe',
  'Owonrin',
  'Obara',
  'Ogunda',
  'Osa',
  'Ika',
  'Oturupon',
  'Otura',
  'Irete',
  'Ofun',
]);

const ODUS_YIN = new Set([
  'Oyeku',
  'Iwori',
  'Odi',
  'Irosun',
  'Oxê',
  'Obará',
  'Ejionile',
  'Ossá',
  'Ejilaxebô',
  'Ofurufu',
]);

/**
 * Detecta o Tipo Energetico a partir dos inputs canonicos.
 * Determinístico: mesma entrada → mesmo tipo.
 */
export function detectarTipoEnergetico(input: Pilar6Input): TipoEnergetico {
  // Refletor e raro (1-2% em sistemas tradicionais): nenhum centro
  // definido. Aqui usamos proxy: dataNascimento "lunar" (meses 6 ou 12)
  // e horaNascimento ausente — heuristica Wave 4, Wave 5+ refina.
  if (!input.horaNascimento && ehMêsLunar(input.dataNascimento)) {
    return 'refletor';
  }

  // Iniciador Aberto: Odu yang + ascendente em signos de fogo (aries/leao/sagitario).
  // Ascendente é derivado de longitudeToSigno PT-BR canonico (Aries = 0-30).
  if (
    ODUS_YANG.has(input.oduPrincipal) &&
    input.ascendenteLongitude != null &&
    ascendenteFogo(input.ascendenteLongitude)
  ) {
    return 'iniciador_aberto';
  }

  // Guia: Odu yang + ascendente em signos mediadores (libra/aquario).
  if (
    ODUS_YANG.has(input.oduPrincipal) &&
    input.ascendenteLongitude != null &&
    ascendenteMediador(input.ascendenteLongitude)
  ) {
    return 'guia';
  }

  // Iniciador: padrao (Odu yin OU Odu yang sem ascendente de fogo/mediador).
  // Captura ~70% dos casos conforme literatura esoterica universal.
  return 'iniciador';
}

/** Meses "lunares" — heuristica Wave 4 (refletor). */
function ehMêsLunar(iso: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const month = parseInt(m[2], 10);
  return month === 6 || month === 12; // junho/dezembro — lua cheia historica
}

/** Ascendente em signos de fogo (aries 0-30, leao 120-150, sagitario 240-270). */
function ascendenteFogo(lon: number): boolean {
  const norm = ((lon % 360) + 360) % 360;
  return (
    (norm >= 0 && norm < 30) ||    // aries
    (norm >= 120 && norm < 150) || // leao
    (norm >= 240 && norm < 270)    // sagitario
  );
}

/** Ascendente em signos mediadores (libra 180-210, aquario 300-330). */
function ascendenteMediador(lon: number): boolean {
  const norm = ((lon % 360) + 360) % 360;
  return (
    (norm >= 180 && norm < 210) || // libra
    (norm >= 300 && norm < 330)    // aquario
  );
}