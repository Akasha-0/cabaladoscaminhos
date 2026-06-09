export interface SyncOptions {
  force?: boolean;
  library?: 'all' | 'tarot' | 'iching' | 'odas' | 'ervas';
}

export interface SyncResult {
  synced: number;
  errors: string[];
  timestamp: Date;
}

/**
 * Sincroniza o Grimório (Markdown → embeddings → pgvector)
 * 
 * STUB: Implementação real na Onda 3 (Oráculo Vivo)
 * Por enquanto retorna dados mockados para tests passarem.
 */
export function syncGrimoire(options?: SyncOptions): Promise<SyncResult> {
  return Promise.resolve({
    synced: 0,
    errors: [],
    timestamp: new Date(),
  });
}
