export type TipoOperacao = 
  | 'insightRapido'
  | 'insightDetalhado'
  | 'relatorioSemanal'
  | 'relatorioMensal'
  | 'perguntaChat';

export const CUSTOS_OPERACOES: Record<TipoOperacao, number> = {
  insightRapido: 2,
  insightDetalhado: 5,
  relatorioSemanal: 15,
  relatorioMensal: 30,
  perguntaChat: 2,
};

export function obterCusto(operacao: TipoOperacao): number {
  return CUSTOS_OPERACOES[operacao];
}

function formatarSaldo(saldo: number): string {
  return `${saldo} crédito${saldo !== 1 ? 's' : ''}`;
}