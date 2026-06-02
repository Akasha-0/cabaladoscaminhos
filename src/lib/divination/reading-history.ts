// fallow-ignore-file unused-file
// src/lib/divination/reading-history.ts
// Histórico de leituras (consultas) do operador.
//
// Stub estrutural — a persistência real (Prisma) está planejada para
// a Fase 7. Esta função existe para satisfazer imports em
// `tests/lib/divination/reading-history.test.ts` e como ponto de
// integração futura.

export interface ReadingHistoryEntry {
  id: string;
  /** ISO date da leitura. */
  date: string;
  /** Nome do consulente (ou anônimo). */
  clientName: string;
  /** Método de divinatório usado. */
  method: string;
  /** Resumo (1 linha) do que foi destacado. */
  summary?: string;
}

/**
 * Retorna o histórico de leituras.
 *
 * Por enquanto, retorna array vazio. Quando a Fase 7 (persistência)
 * for implementada, esta função consultará a tabela `Consultation`
 * (modelo Prisma adicionado na Fase 4).
 */
export function getReadingHistory(): ReadingHistoryEntry[] {
  return [];
}
