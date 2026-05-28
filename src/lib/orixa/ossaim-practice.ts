// @ts-nocheck
// SKIP_LINT

/**
 * Ossaim Practice — ORIXÁ OSSAIM
 * Práticas ritualísticas e sagradas para Ossaim, Orixá das Ervas e da Cura.
 */

export interface OssaimPracticeResult {
  orixa: string;
  greeting: string;
  practice: string;
  herbs: string[];
  offerings: string[];
  pontos_cantados: string[];
  fundamentos: string[];
  healingPrinciples: string[];
  ritualPractices: RitualPractice[];
}

export interface RitualPractice {
  type: string;
  description: string;
  duration: string;
  steps: string[];
}

/**
 * Performs Ossaim practice ritual
 */
export function performPractice(): OssaimPracticeResult {
  return {
    orixa: 'Ossaim',
    greeting: 'Mo a Ossaim',
    practice: 'Cura Herbal',
    herbs: [
      'Manjericão (Epal)',
      'Arruda (Ori)',
      'Alecrim (Temi)',
      'Colônia (Oba)',
      'Dendê (Eyin)',
    ],
    offerings: [
      'Ervas frescas colhidas ao amanhecer',
      'Mel puro',
      'Azeite de dendê',
      'Flores sagradas',
      'Pombos brancos',
      'Água de fonte',
    ],
    pontos_cantados: [
      'Ossaim, Mo a Ossaim!',
      'Iá Ossaim! Iá Ossaim!',
      'Ossaim curador, Ossaim protetor',
      'Epa Hey! Ossaim Lafô',
      'Moô Ossaim, moô!',
    ],
    fundamentos: [
      'Ossaim é o Orixá das ervas, da cura natural e do conhecimento herbal ancestral',
      'É o guardião de todas as plantas medicinais e conhece seus segredos',
      'Trabalha com a energia da terra para curar corpo, mente e espírito',
      'A natureza é a maior farmácia — a cura vem da terra',
      'Cada planta tem um propósito espiritual e uma energia curativa',
      'O respeito pela natureza é fundamental para a prática',
      'O conhecimento herbal deve ser passado adiante para as próximas gerações',
    ],
    healingPrinciples: [
      'A cura vem da terra e das plantas',
      'Cada planta tem um propósito espiritual',
      'O respeito à natureza é fundamental',
      'A doença é um desequilíbrio entre corpo e espírito',
      'A prevenção é melhor que a cura',
      'O conhecimento herbal deve ser passado adiante',
      'A paciência é essencial no processo de cura',
    ],
    ritualPractices: [
      {
        type: 'Cura Herbal',
        description: 'Ritual de cura usando ervas sagradas de Ossaim',
        duration: '1-2 horas',
        steps: [
          'Preparar o espaço com defumação de ervas',
          'Fazer saudação a Ossaim: "Mo a Ossaim"',
          'Preparar o preparado herbal com intenção',
          'Aplicar ou administrar o preparado',
          'Agradecer a Ossaim pela cura',
        ],
      },
      {
        type: 'Banho de Ervas',
        description: 'Banho de purificação com ervas sagradas',
        duration: '30 minutos',
        steps: [
          'Colher ervas ao amanhecer com gratidão',
          'Preparar o banho com água aquecida',
          'Deixar repousar por 1 hora',
          'Coe e tome o banho em paz',
          'Seque naturalmente e descanse',
        ],
      },
      {
        type: 'Defumação',
        description: 'Purificação do ambiente com ervas secas',
        duration: '15-30 minutos',
        steps: [
          'Acender o carvão no defumador',
          'Colocar as ervas sobre o carvão',
          'Defumar os quatro cantos do ambiente',
          'Recitar o mantra de Ossaim',
          'Agradecer e fechar o ritual',
        ],
      },
    ],
  };
}