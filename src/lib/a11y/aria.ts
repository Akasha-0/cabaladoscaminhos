/**
 * ARIA helper functions for accessible spiritual content
 */

/**
 * Generates an ARIA label string from spiritual content metadata
 */
export function getAriaLabel(label: string, context?: string): string {
  if (!label) return '';
  return context ? `${label} - ${context}` : label;
}

/**
 * Generates an ARIA described-by ID reference from multiple descriptions
 */
export function getAriaDescribedBy(...ids: (string | undefined)[]): string | undefined {
  const validIds = ids.filter((id): id is string => Boolean(id));
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}
