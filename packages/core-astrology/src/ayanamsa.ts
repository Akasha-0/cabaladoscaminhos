/**
 * F-212: Ayanamsa (R-018 D1) — Zodiac tropical vs sideral opt-in
 *
 * Implementa conversão tropical ↔ sideral via ayanamsa.
 * Default: tropical (ocidental). Opt-in: Lahiri / Raman / Krishnamurti.
 *
 * Ayanamsa = offset entre zodiac tropical (baseado em estações) e
 * zodiac sideral (baseado em estrelas fixas). Causado por precessão
 * dos equinócios (~25.772 anos). Era ~0° em ~200 CE, hoje ~24°.
 *
 * Valores clássicos (R-018 §2.1):
 * - Lahiri: 23°51' (Indian Calendar Reform Committee 1956, oficial na Índia)
 * - Raman: 22°24'
 * - Krishnamurti: 23°49'
 *
 * @see .autonomous/research/synthesis/jyotish-reverse-engineering.md §2.1
 */

export type AyanamsaTipo = 'tropical' | 'lahiri' | 'raman' | 'krishnamurti';

/** Offsets de ayanamsa em graus (valores atuais, ano 2026) */
export const AYANAMSA_OFFSETS: Record<AyanamsaTipo, number> = {
  tropical: 0,
  lahiri: 23.85,
  raman: 22.4,
  // Krishnamurti varia por data: ~23°49' = 23.82 (média)
  krishnamurti: 23.82,
};

/** Nomes PT-BR para ayanamsa (R-018 D2) */
export const AYANAMSA_NOMES_PT: Record<AyanamsaTipo, string> = {
  tropical: 'Tropical (Ocidental)',
  lahiri: 'Lahiri (Jyotish oficial)',
  raman: 'Raman',
  krishnamurti: 'Krishnamurti',
};

/**
 * Converte longitude tropical em sideral subtraindo o ayanamsa offset.
 * tropical = sideral + ayanamsa (sideral está "atrasado" por precessão)
 * Portanto: sideral = tropical - ayanamsa
 */
export function tropicalParaSideral(longitude: number, ayanamsa: AyanamsaTipo): number {
  const offset = AYANAMSA_OFFSETS[ayanamsa];
  return (((longitude - offset) % 360) + 360) % 360;
}

/**
 * Converte longitude sideral em tropical adicionando o ayanamsa offset.
 */
export function sideralParaTropical(longitude: number, ayanamsa: AyanamsaTipo): number {
  const offset = AYANAMSA_OFFSETS[ayanamsa];
  return (((longitude + offset) % 360) + 360) % 360;
}
