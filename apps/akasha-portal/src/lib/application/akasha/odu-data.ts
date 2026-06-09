/**
 * Odu Data - Tipos para Odus do Ifá
 * 
 * STUB: Implementação real do Grimório
 */

export interface OduData {
  id: string;
  name: string;
  meaning: string;
  verses: number;
 元素: string;
}

export type OduElement = 'air' | 'water' | 'fire' | 'earth';

export interface OduInfo {
  id: string;
  name: string;
  elements: OduElement[];
}

/**
 * Retorna dados de um Odu pelo nome
 */
export function getOduByName(name: string): OduData | null {
  return null;
}
