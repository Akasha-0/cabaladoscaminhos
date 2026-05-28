import { calcularPosicao } from '../swiss-ephemeris';
import type { MapaNatal } from '../tipos';

export interface Transito {
  planeta: string;
  aspecto: string;
  planetaNatal: string;
  progresso: 'aplicativo' | 'separativo';
  inicio: Date;
  fim: Date | null;
  impacto: 'alto' | 'medio' | 'baixo';
  descricao: string;
}

const ASPECTOS_TRANSITO = [
  { nome: 'conjunto', angulo: 0, impacto: 'alto' as const },
  { nome: 'oposto', angulo: 180, impacto: 'alto' as const },
  { nome: 'quadrado', angulo: 90, impacto: 'medio' as const },
  { nome: 'trino', angulo: 120, impacto: 'medio' as const },
  { nome: 'sextil', angulo: 60, impacto: 'baixo' as const },
];

const PLANETAS_TRANSITO = ['marte', 'jupiter', 'saturno', 'urano', 'netuno', 'plutao'] as const;

export function calcularTrânsitosAtivos(
  mapaNatal: MapaNatal,
  dataAtual: Date = new Date()
): Transito[] {
  const transitos: Transito[] = [];
  
  for (const planetaTransito of PLANETAS_TRANSITO) {
    const posicaoAtual = calcularPosicao(planetaTransito, dataAtual);
    
    for (const [nomeNatal, posicaoNatal] of Object.entries(mapaNatal.planeta)) {
      for (const aspecto of ASPECTOS_TRANSITO) {
        const diferenca = Math.abs(normalizeDiff(posicaoAtual.longitude - posicaoNatal.longitude));
        
        if (Math.abs(diferenca - aspecto.angulo) < 5) {
          transitos.push({
            planeta: planetaTransito,
            aspecto: aspecto.nome,
            planetaNatal: nomeNatal,
            progresso: posicaoAtual.velocidade > 0 ? 'aplicativo' : 'separativo',
            inicio: dataAtual,
            fim: null,
            impacto: aspecto.impacto,
            descricao: gerarDescricao(planetaTransito, aspecto.nome, nomeNatal),
          });
        }
      }
    }
  }
  
  return transitos.sort((a, b) => {
    const impactoOrder = { alto: 0, medio: 1, baixo: 2 };
    return impactoOrder[a.impacto] - impactoOrder[b.impacto];
  });
}

function normalizeDiff(diff: number): number {
  return ((diff + 180) % 360) - 180;
}

function gerarDescricao(transito: string, aspecto: string, natal: string): string {
  const descricoes: Record<string, string> = {
    'saturno_oposto': 'Período de desafios e amadurecimento em área relacionada a ' + natal + '.',
    'jupiter_trino': 'Oportunidade de crescimento e expansão em área de ' + natal + '.',
    'marte_conjunto': 'Energia intensificada em área de ' + natal + '. Ação decisiva necessária.',
    'netuno_trino': 'Período de inspiração e intuição em área de ' + natal + '.',
    'plutao_oposto': 'Transformação profunda em área de ' + natal + '.',
  };
  
  const key = `${transito}_${aspecto}`;
  return descricoes[key] || `Trânsito de ${transito} em ${aspecto} com ${natal}.`;
}
