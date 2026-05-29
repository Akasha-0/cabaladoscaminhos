import type { UserSpiritualData } from './types';

// Re-export UserSpiritualData for backwards compatibility
export type { UserSpiritualData } from './types';

/**
 * Generate a contextual prompt for spiritual guidance based on user data
 */
export function generateSpiritualContext(userData: UserSpiritualData): string {
  const {
    nome,
    numeroPessoal,
    orixaRegente,
    sefirotDominante,
    arcoMaior,
    sign,
    odu,
  } = userData;

  const sefirotList = sefirotDominante?.join(', ') || 'N/A';
  const arcoList = arcoMaior?.join(', ') || 'N/A';

  return `
Nome: ${nome || 'Usuário'}
Número Pessoal: ${numeroPessoal || 'N/A'}
Arco Pessoal: ${userData.arcoPessoal || 'N/A'}
Orixá Regente: ${orixaRegente || 'N/A'}
Odu: ${odu || 'N/A'}
Signo Solar: ${sign || 'N/A'}
Sefirot Dominante: ${sefirotList}
Arco Maior: ${arcoList}
:`.trim();
}

/**
 * Generate a summary of user spiritual profile for AI prompts
 */
export function generateSpiritualSummary(userData: UserSpiritualData): {
  introduction: string;
  keyAttributes: string[];
  areasOfFocus: string[];
} {
  const keyAttributes: string[] = [];
  const areasOfFocus: string[] = [];

  if (userData.orixaRegente) {
    keyAttributes.push(`Orixá regente: ${userData.orixaRegente}`);
  }
  if (userData.numeroPessoal) {
    keyAttributes.push(`Número pessoal: ${userData.numeroPessoal}`);
  }
  if (userData.sign) {
    keyAttributes.push(`Signo: ${userData.sign}`);
  }
  if (userData.sefirotDominante?.length) {
    keyAttributes.push(`Sefirot: ${userData.sefirotDominante.join(', ')}`);
  }

  if (userData.odu) {
    areasOfFocus.push(`Odu: ${userData.odu}`);
  }
  if (userData.arcoMaior?.length) {
    areasOfFocus.push(`Arco Maior: ${userData.arcoMaior.join(', ')}`);
  }

  return {
    introduction: `Perfil espiritual de ${userData.nome || 'usuário'}`,
    keyAttributes,
    areasOfFocus,
  };
}

/**
 * Validate user spiritual data has minimum required fields
 */
export function isValidUserSpiritualData(data: unknown): data is UserSpiritualData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Partial<UserSpiritualData>;
  return (
    typeof d.id === 'string' &&
    typeof d.nome === 'string' &&
    typeof d.numeroPessoal === 'number'
  );
}