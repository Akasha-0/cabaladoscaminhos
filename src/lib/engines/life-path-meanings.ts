/**
 * Significados do Caminho de Vida (Numerologia Cabalística)
 * ----------------------------------------------------------------------------
 * Frase única de 1 linha exibida no preview do Passo 2 do Onboarding.
 * Mantém coerência com `lib/numerologia/calculos.ts` e
 * `lib/numerologia/number-meanings.ts`.
 *
 * @module engines/life-path-meanings
 */

const LIFE_PATH_MEANINGS: Record<number, string> = {
  1: 'Liderança, independência e o poder de iniciar novos caminhos.',
  2: 'Diplomacia, parceria e a arte de unir o que está separado.',
  3: 'Expressão, criatividade e o dom da comunicação que inspira.',
  4: 'Construção, estrutura e o trabalho paciente que edifica.',
  5: 'Liberdade, movimento e a curiosidade que expande horizontes.',
  6: 'Amor, responsabilidade e o cuidado que cura relações.',
  7: 'Intuição, saber interior e a busca pela verdade essencial.',
  8: 'Poder pessoal, abundância e a maestria no mundo material.',
  9: 'Humanitarismo, compaixão e a sabedoria que transcende o eu.',
  11: 'Iluminação, intuição visionária e o canal da luz espiritual.',
  22: 'O Mestre Construtor — visões elevadas materializadas em obra.',
  33: 'O Mestre Curador — amor incondicional a serviço da humanidade.',
};

/**
 * Retorna a frase-síntese do caminho de vida para uma data.
 * @param number caminho de vida (1-9, 11, 22, 33)
 */
export function getLifePathMeaning(number: number): string | null {
  if (!Number.isFinite(number) || number <= 0) return null;
  return LIFE_PATH_MEANINGS[number] ?? null;
}

export const ALL_LIFE_PATH_MEANINGS = LIFE_PATH_MEANINGS;