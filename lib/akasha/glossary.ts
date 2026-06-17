export interface OduGlossary {
  oduName: string;
  preceitos: string[];
}

export interface OduInput {
  oduName?: string;
  orixaRegency?: string[];
  preceitos?: string[];
  [key: string]: unknown;
}

export function buildOduGlossary(input: OduInput): OduGlossary {
  return {
    oduName: input.oduName ?? 'undetermined',
    preceitos: input.preceitos ?? ['Harmonia'],
  };
}

export function formatGlossarySection(glossary: OduGlossary): string {
  return `## Glossário Odu\n- Odu: ${glossary.oduName}\n- Preceito: ${glossary.preceitos[0]}`;
}
