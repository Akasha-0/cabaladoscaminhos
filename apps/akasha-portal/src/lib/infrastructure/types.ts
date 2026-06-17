/**
 * Tipos para o Grimório (Camada de Infraestrutura)
 *
 * STUB: Tipos para compatibilidade com consult/route.ts e grimoire-search.ts
 */

// NOTE (lesson N+20/N+24 pattern: surface, don't hide):
//   This file is intentionally a STUB. The Portuguese-named optional fields
//   (`titulo?`, `conteudo?`, `categoria?`) alongside the English ones
//   (`title`, `content`, `category`) exist for legacy compat with
//   `consult/route.ts` while the rest of the codebase migrates to
//   English field names. When `consult/route.ts` is fully migrated
//   (or removed), the optional Portuguese fields can be deleted.
//   Reference: F-231 spec closure notes the EN/PT parity progress.

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
