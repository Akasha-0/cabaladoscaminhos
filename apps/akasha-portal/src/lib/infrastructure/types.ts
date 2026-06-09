/**
 * Tipos para o Grimório (Camada de Infraestrutura)
 * 
 * STUB: Tipos para compatibilidade com consult/route.ts e grimoire-search.ts
 */

export interface ChartContext {
  birthDate?: Date;
  birthLocation?: {
    latitude: number;
    longitude: number;
  };
  // Propriedades adicionais usadas pelo código
  element?: string;
  oduId?: string;
  pillarsConsulted?: string[];
}

export interface GrimoireContext {
  library?: string;
  entries: GrimoireEntry[];
  pillarsConsulted?: string[];
}

export interface GrimoireEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  // Nomes em português usados pelo código
  titulo?: string;
  conteudo?: string;
  categoria?: string;
}

export interface GrimoireSearchQuery {
  text: string;
  library?: string;
  limit?: number;
  query?: string;
  tags?: string[];
}

export interface GrimoireSearchResult {
  entries: GrimoireEntry[];
  context: GrimoireContext;
  score: number;
}
