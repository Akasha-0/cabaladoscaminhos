/**
 * Orixá-planet correlation.
 * STUB: Mapeamento Orixá ↔ planeta astrológico.
 */

export function getOrixaPlanet(orixaName: string): string {
  // Stub: mapeamento básico
  const map: Record<string, string> = {
    Oxum: 'Venus',
    Oxumar: 'Saturn',
    Iansã: 'Mars',
    Xangô: 'Mars',
    Iemanjá: 'Moon',
    Oxalá: 'Jupiter',
  };
  return map[orixaName] ?? 'Sun';
}
