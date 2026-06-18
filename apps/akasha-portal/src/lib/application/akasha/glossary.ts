/**
 * Glossary - Builds glossary sections for AI prompts
 *
 * STUB: Implementação real do Grimório
 */

export interface OduGlossarySection {
  oduName: string;
  essencia: string;
  quizila: string;
  conselho: string;
}

/**
 * Constrói seção de glossário para Odus
 */
export function buildOduGlossary(odues: unknown): OduGlossarySection | null {
  if (!odues) return null;

  // Se for array de strings
  if (Array.isArray(odues)) {
    const name = odues[0] as string;
    if (name) {
      return {
        oduName: name,
        essencia: `(essência do Odu ${name})`,
        quizila: `(quizila do Odu ${name})`,
        conselho: `(conselho do Odu ${name})`,
      };
    }
    return null;
  }

  // Se for objeto (como vem do chart)
  if (typeof odues === 'object') {
    const odu = odues as Record<string, unknown>;
    const name = (odu.oduName ?? odu.name ?? odu.id) as string;
    if (name) {
      return {
        oduName: name,
        essencia: `(essência do Odu ${name})`,
        quizila: `(quizila do Odu ${name})`,
        conselho: `(conselho do Odu ${name})`,
      };
    }
  }

  return null;
}

/**
 * Formata seção de glossário
 */
export function formatGlossarySection(section: OduGlossarySection | null): string {
  if (!section) return '';
  return [
    '## GLOSSÁRIO DO ODU',
    `- odu_essencia: ${section.essencia}`,
    `- odu_quizila: ${section.quizila}`,
    `- odu_conselho: ${section.conselho}`,
  ].join('\n');
}
