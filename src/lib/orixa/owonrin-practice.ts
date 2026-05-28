// @ts-nocheck
// SKIP_LINT

/**
 * Owonrin Practice — ODU OWONRIN
 * Práticas ritualísticas e sagradas para Owonrin, Odu das Tempestades e Mutações Cósmicas.
 */

export interface OwonrinPracticeResult {
  orixa: string;
  greeting: string;
  practice: string;
  elements: string[];
  offerings: string[];
  pontos_cantados: string[];
  fundamentos: string[];
  transformationPrinciples: string[];
  ritualPractices: RitualPractice[];
}

export interface RitualPractice {
  type: string;
  description: string;
  duration: string;
  steps: string[];
}

/**
 * Performs Owonrin practice ritual
 */
export function performPractice(): OwonrinPracticeResult {
  return {
    orixa: 'Owonrin',
    greeting: 'E owonrin-o!',
    practice: 'Tempestade e Transformação',
    elements: [
      'Vento (Ojo)',
      'Fogo (Ina)',
      'Tempestade (Ojo ologo)',
      'Relâmpago (eran owú)',
      'Trovão (odede)',
    ],
    offerings: [
      'Duas velas - azul e vermelha',
      'Azeite de dendê',
      'Agua de chuva收集ada',
      'Pombos brancos',
      'Milho torrado',
      'Café preto',
    ],
    pontos_cantados: [
      'Owonrin Meji! Ojo ti nko!',
      'E owonrin-o! Tempestado sagrada!',
      'Aja o ma je, Owonrin ologo!',
      'Vento que varre, fogo que purifica!',
      'Iá Owonrin! Iá Owonrin!',
    ],
    fundamentos: [
      'Owonrin é o Odu das tempestades, do fogo e da destruição regeneradora',
      'Governa as transformações cósmicas e as mutações necessárias',
      'A destruição do velho é necessária para o nascimento do novo',
      'O vento varre o que não serve mais, o fogo purifica',
      'Tempestades não são castigo — são renovação',
      'A mudança total é por vezes o caminho mais sagrado',
      'Owonzin Meji é a tempestade dupla que transforma',
    ],
    transformationPrinciples: [
      'A destruição pode ser necessária para a regeneração',
      'Tempestades são agentes de mudança, não de castigo',
      'O vento que varre limpa o caminho para o novo',
      'O fogo purifica o que precisa ser transformado',
      'Aceitar a mudança é aceitar a vida',
      'Nem toda destruição é negativa — algumas são libertação',
    ],
    ritualPractices: [
      {
        type: 'Itutu Owonrin Meji',
        description: 'Ritual de renovação através da destruição',
        duration: '1-2 horas',
        steps: [
          'Escolher um momento de tempestade ou vento forte',
          'Preparar duas velas - azul e vermelha',
          'Recitar o poema de Owonrin Meji',
          'Identificar mentalmente o que precisa ser destruído',
          'Libertar o que não serve mais em pensamento',
          'Agradecer pela tempestade que purifica',
          'Deixar as velas queimar até o fim',
        ],
      },
      {
        type: 'Defumação de Tempestade',
        description: 'Purificação com elementos de tempestade',
        duration: '30-45 minutos',
        steps: [
          'Acender o carvão no defumador',
          'Queimar ervas secas ao vento simbólico',
          'Acender velas azul e vermelha',
          'Recitar os pontos cantados de Owonrin',
          'Percorrer os quatro cantos portando o defumador',
          'Agradecer e cerrar o ritual',
        ],
      },
      {
        type: 'Abertura de Caminhos',
        description: 'Ritual para quando mudança total é necessária',
        duration: '45 minutos',
        steps: [
          'Preparar espaço aberto ao ar livre se possível',
          'Fazer oferenda de café negro à terra',
          'Acender velas azul e vermelha nos quatro cantos',
          'Recitar: "Vento que varre, fogo que purifica"',
          'Nomear em voz alta o que está sendo libertado',
          'Agradecer a Owonrin pela coragem de mudar',
          'Dar por encerrado o ciclo antigo',
        ],
      },
    ],
  };
}
