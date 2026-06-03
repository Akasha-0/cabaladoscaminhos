// src/lib/credits/custos.ts
// Phase 19 — extracted from credits/service.ts for test compatibility

export const CUSTOS_OPERACOES: Record<string, number> = {
  perguntaChat: 2,
  insightRapido: 2,
  insightDetalhado: 5,
  leituraCompleta: 5,
  mapaNatal: 10,
  previsaoMensal: 8,
  relatorioSemanal: 15,
  relatorioMensal: 30,
};

export function obterCusto(operacao: string): number {
  return CUSTOS_OPERACOES[operacao] ?? 0;
}
