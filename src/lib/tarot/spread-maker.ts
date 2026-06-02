// fallow-ignore-file unused-file
// src/lib/tarot/spread-maker.ts
// Tarot spread maker - create custom spreads

import { getSpread, type TarotSpread, type SpreadPosition } from './spreads';
/**
 * Options for creating a custom spread
 */
export interface CustomSpreadOptions {
  name: string;
  description: string;
  positions: Array<{
    name: string;
    description: string;
    orientation?: 'upright' | 'reversed' | 'both';
  }>;
}

/**
 * Result from creating a spread
 */
export interface CreatedSpread extends TarotSpread {
  isCustom: boolean;
}

/**
 * Creates a custom tarot spread from user-defined positions.
 * Allows users to design their own card layouts for readings.
 *
 * @param options - Spread configuration
 * @param options.name - Display name for the spread
 * @param options.description - Description of the spread's purpose
 * @param options.positions - Array of position configurations
 * @param options.positions[].name - Name of the position (e.g., "Past", "Present")
 * @param options.positions[].description - Meaning/interpretation of the position
 * @param options.positions[].orientation - Allowed card orientations (default: 'both')
 * @returns The configured spread ready for use
 *
 * @example
 * const mySpread = createSpread({
 *   name: 'Love Triangle',
 *   description: 'Analyze a three-way relationship situation',
 *   positions: [
 *     { name: 'Person A', description: 'First person involved' },
 *     { name: 'Person B', description: 'Second person involved' },
 *     { name: 'Dynamics', description: 'The relationship between them' },
 *   ]
 * });
 */
export function createSpread(options: CustomSpreadOptions): CreatedSpread {
  const { name, description, positions } = options;

  if (!name?.trim()) {
    throw new Error('Spread name is required');
  }

  if (!positions || positions.length === 0) {
    throw new Error('At least one position is required');
  }

  const totalCards = positions.length;

  const spreadPositions: SpreadPosition[] = positions.map((pos, index) => ({
    position: index + 1,
    name: pos.name.trim(),
    description: pos.description.trim(),
    orientation: pos.orientation ?? 'both',
  }));

  const spreadId = `custom-${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    id: spreadId as CreatedSpread['id'],
    name: name.trim(),
    description: description?.trim() ?? '',
    positions: spreadPositions,
    totalCards,
    isCustom: true,
  } as CreatedSpread;
}

/**
 * Creates a spread from a template spread type, optionally modifying its settings.
 * Useful for creating variations of predefined spreads.
 *
 * @param templateType - One of: 'celtic-cross', 'three-card', 'single-card'
 * @param overrides - Optional overrides for name and description
 * @returns A spread configuration based on the template
 */
function createSpreadFromTemplate(
  templateType: SpreadType | (typeof import('./spreads')['getAllSpreadTypes'] extends () => infer R ? R extends string[] ? R[number] : never : never),
  overrides?: { name?: string; description?: string }
): TarotSpread {
  const template = getSpread(templateType as SpreadType);

  return {
    ...template,
    name: overrides?.name ?? template.name,
    description: overrides?.description ?? template.description,
  };
}

type SpreadType = 'celtic-cross' | 'three-card' | 'single-card';

/**
 * Validates spread options before creation.
 * Returns an array of validation error messages (empty if valid).
 *
 * @param options - Spread options to validate
 * @returns Array of error messages, or empty array if valid
 */
export function validateSpreadOptions(options: CustomSpreadOptions): string[] {
  const errors: string[] = [];

  if (!options.name?.trim()) {
    errors.push('Spread name is required');
  } else if (options.name.trim().length < 2) {
    errors.push('Spread name must be at least 2 characters');
  } else if (options.name.trim().length > 50) {
    errors.push('Spread name must not exceed 50 characters');
  }

  if (!options.positions || options.positions.length === 0) {
    errors.push('At least one position is required');
  } else {
    options.positions.forEach((pos, index) => {
      if (!pos.name?.trim()) {
        errors.push(`Position ${index + 1} name is required`);
      } else if (pos.name.trim().length < 2) {
        errors.push(`Position ${index + 1} name must be at least 2 characters`);
      } else if (pos.name.trim().length > 30) {
        errors.push(`Position ${index + 1} name must not exceed 30 characters`);
      }

      if (!pos.description?.trim()) {
        errors.push(`Position ${index + 1} description is required`);
      } else if (pos.description.trim().length < 3) {
        errors.push(`Position ${index + 1} description must be at least 3 characters`);
      }
    });
  }

  return errors;
}

/**
 * Merges an existing spread with additional or modified positions.
 * Useful for extending predefined spreads with custom positions.
 *
 * @param spread - The base spread to extend
 * @param additionalPositions - Additional positions to append
 * @returns A new spread with the combined positions
 */
function extendSpread(
  spread: TarotSpread,
  additionalPositions: Array<{
    name: string;
    description: string;
    orientation?: 'upright' | 'reversed' | 'both';
  }>
): CreatedSpread {
  const startIndex = spread.positions.length;

  const newPositions: SpreadPosition[] = additionalPositions.map((pos, index) => ({
    position: startIndex + index + 1,
    name: pos.name.trim(),
    description: pos.description.trim(),
    orientation: pos.orientation ?? 'both',
  }));

  return {
    ...spread,
    positions: [...spread.positions, ...newPositions],
    totalCards: spread.totalCards + additionalPositions.length,
    isCustom: true,
  } as CreatedSpread;
}

/**
 * Creates a simple two-card spread for quick yes/no style readings.
 *
 * @param question - Optional question context for the spread
 * @returns A two-card spread configuration
 */
export function createTwoCardSpread(question?: string): CreatedSpread {
  return createSpread({
    name: question ? `Pergunta: ${question}` : 'Duas Cartas',
    description: question ?? 'Resposta rápida sim/não com contexto adicional',
    positions: [
      {
        name: 'Situação',
        description: 'A energia ou contexto atual da questão',
        orientation: 'both',
      },
      {
        name: 'Resposta',
        description: 'A orientação ou caminho sugerido',
        orientation: 'both',
      },
    ],
  });
}

/**
 * Creates a horseshoe spread (7 cards) for more detailed readings.
 *
 * @param focus - Optional focus area for the reading
 * @returns A 7-card horseshoe spread configuration
 */
export function createHorseshoeSpread(focus?: string): CreatedSpread {
  return createSpread({
    name: focus ? `Ferradura: ${focus}` : 'Ferradura',
    description: focus ?? 'Leitura em formato de ferradura para análise completa de uma situação',
    positions: [
      { name: 'Passado', description: ' foundations or events leading to the current situation' },
      { name: 'Presente', description: 'A situação atual que afeta o resultado' },
      { name: 'Futuro', description: 'O caminho provável se nada mudar' },
      { name: 'Conselho', description: 'Orientação para o caminho a seguir' },
      { name: 'Influência Externa', description: 'Fatores externos que afetam a situação' },
      { name: 'Oposta', description: 'A energia oposta ou contraste' },
      { name: 'Resultado', description: 'O resultado final provável' },
    ],
  });
}
