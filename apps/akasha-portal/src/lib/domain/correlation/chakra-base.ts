/**
 * Chakra Base Types and Utilities
 *
 * Canonical definitions shared across chakra correlation modules
 * (chakra-day, chakra-element, chakra-planet).
 */

// Tipos canônicos
export type ChakraName =
  | 'Muladhara'
  | 'Svadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddha'
  | 'Ajna'
  | 'Sahasrara';

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export type Planeta = 'Sol' | 'Lua' | 'Marte' | 'Mercúrio' | 'Júpiter' | 'Vênus' | 'Saturno';

/**
 * Normalizes chakra name to match ChakraName type.
 * Preserves behavior of the original three implementations:
 * - standard Sanskrit names
 * - numbered Portuguese forms (1º básico, 2º sacro, etc.)
 * - short Portuguese forms (basic, sacro, plexo, etc.)
 *
 * Unknown chakra names are returned as-is (lowercased/trimmed) so that
 * downstream callers (`getChakraDay`, `getChakraElement`, `getChakraPlanet`,
 * etc.) can detect the miss via a lookup miss and return null/empty.
 * Previously this function returned 'Muladhara' as a fallback, which
 * masked unknown-chakra lookups and produced non-null results for
 * inputs like "Unknown Chakra" — violating the contract of those callers.
 *
 * @see tests/lib/correlation/chakra-{day,element,planet}.test.ts
 *      ("should return null/[] for unknown chakra")
 */
export function normalizeChakraName(chakra: string): ChakraName | string {
  const chakraMap: Record<string, ChakraName> = {
    'muladhara': 'Muladhara',
    'svadhisthana': 'Svadhisthana',
    'manipura': 'Manipura',
    'anahata': 'Anahata',
    'vishuddha': 'Vishuddha',
    'ajna': 'Ajna',
    'sahasrara': 'Sahasrara',
    '1º básico': 'Muladhara',
    '1º Básico': 'Muladhara',
    '2º sacro': 'Svadhisthana',
    '2º Sacro': 'Svadhisthana',
    '3º plexo solar': 'Manipura',
    '3º Plexo Solar': 'Manipura',
    '4º cardíaco': 'Anahata',
    '4º Cardíaco': 'Anahata',
    '5º laríngeo': 'Vishuddha',
    '5º Laríngeo': 'Vishuddha',
    '6º frontal': 'Ajna',
    '6º Frontal': 'Ajna',
    '7º coronário': 'Sahasrara',
    '7º Coronário': 'Sahasrara',
    // short Portuguese forms (from chakra-day.ts)
    'basic': 'Muladhara',
    'sacro': 'Svadhisthana',
    'plexo': 'Manipura',
    'cardiaco': 'Anahata',
    'laríngeo': 'Vishuddha',
    'frontal': 'Ajna',
    'coronário': 'Sahasrara',
  };
  const lower = chakra.toLowerCase().trim();
  return chakraMap[lower] ?? lower;
}
