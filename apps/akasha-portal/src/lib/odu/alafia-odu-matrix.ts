/**
 * Matriz de Correlação Aláfia × Odu — Leitura Combinada
 *
 * Quando Aláfia e Odu são jogados juntos, a interpretação combinada
 * é mais profunda que cada um isolado.
 *
 * Pilar 6: Raiz & Esquerda
 */

import { AlafiaPolarity } from './types';
import { Odu } from './types';

/**
 * Combina uma tirada de Aláfia + Odu e retorna a leitura integrada.
 */
export function combineAlafiaOdu(
  alafia: AlafiaPolarity,
  odu: Odu,
  oduName: string,
  oduOrichas: string[],
  oduEsquerda: string[],
  oduKarmicTheme: string,
  oduSomaticAdvice: string[],
): {
  combinedLabel: string;
  combinedInterpretation: string;
  firmezasaFazer: string[];
  spiritualDirection: string;
} {
  const alafiaLabel = AlafiaPolarity[alafia];
  const oduLabel = Odu[odu];

  // Interpretação combinada baseada na polaridade de Aláfia
  const alafiaGuidance: Record<AlafiaPolarity, string> = {
    [AlafiaPolarity.ALAFIA]: 'Caminho aberto — seguir com fé e confiança',
    [AlafiaPolarity.ETAWA]: 'Sinal misto — buscar clarificação antes de agir',
    [AlafiaPolarity.EJIIFE]: 'Confirmação dupla — o destino confirma este caminho',
    [AlafiaPolarity.OKANRAN]: 'Atenção — há blokages no caminho, investir em proteção',
    [AlafiaPolarity.OPIRA]: 'Corte — o momento não é agora, guardar a energia',
  };

  // Firmezas de Esquerda recomendadas por Odu
  const esquerdaByOdu: Partial<Record<Odu, string[]>> = {
    [Odu.EJIONILE]: [
      'Firmeza de Tranca Ruas com ferro, carvão e pimenta',
      'Bebida de Exu (cachaça + limonada + fumaça de charuto) às 21h',
    ],
    [Odu.EYEOLLA]: [
      'Firmeza de Maria Padilha com rosa vermelha e mel',
      'Banho de descarrego com leaves amargas',
    ],
    [Odu.DIN]: [
      'Firmeza de Maria Padilha do Cabaré com fogo e incense',
      'Banho de开门 com folhas de opens',
    ],
    [Odu.ODI]: [
      'Porta de Tranca Ruas no início da noite',
      'Fechar o corpo com azeite de dendê e sal',
    ],
  };

  const firmezasaFazer = esquerdaByOdu[odu] ?? [
    'Firmeza simples de proteção: sal grosso nos cantos',
    'Banho de cheiro com plantas disponíveis',
  ];

  const spiritualDirection =
    alafia >= AlafiaPolarity.EJIIFE
      ? `O ${oduName} confirma: você está no caminho certo. ${alafiaGuidance[alafia]}`
      : `O ${oduName} avisa: ${alafiaGuidance[alafia]}. Firme-se antes de avançar.`;

  return {
    combinedLabel: `${alafiaLabel} + ${oduName}`,
    combinedInterpretation: `${oduKarmicTheme}. ${alafiaGuidance[alafia]}. Orixás confirmados: ${oduOrichas.join(', ')}.`,
    firmezasaFazer,
    spiritualDirection,
  };
}
