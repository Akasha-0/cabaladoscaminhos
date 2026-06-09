/**
 * Glossary - Builds glossary sections for AI prompts
 * 
 * STUB: Implementação real do Grimório
 */

/**
 * Constrói seção de glossário para Odus
 */
export function buildOduGlossary(odues: string[]): string {
  return odues.map(odu => `- **${odu}**: (glossário do Odu)`).join('\n');
}

/**
 * Formata seção de glossário
 */
export function formatGlossarySection(title: string, content: string): string {
  return `## ${title}\n\n${content}`;
}
