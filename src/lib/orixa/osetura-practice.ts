// @ts-nocheck
// SKIP_LINT

/* prettier-ignore */

/**
 * Osetura Practice — ORIXÁ OSETURA
 * Práticas ritualísticas e sagradas para Osetura.
 */

export interface OseturaPracticeResult {
  orixa: string;
  greeting: string;
  practice: string;
  elements: string[];
  offerings: string[];
  pontos_cantados: string[];
  fundamentos: string[];
  attributes: string[];
  ritualPractices: RitualPractice[];
}

export interface RitualPractice {
  type: string;
  description: string;
  duration: string;
  steps: string[];
}

/**
 * Performs Osetura practice ritual
 */
export function performPractice(): OseturaPracticeResult {
  return {
    orixa: 'Osetura',
    greeting: 'E osetura-o!',
    practice: 'Caminho da Serra e da Terra',
    elements: [
      'Terra (Ilê)',
      'Serra (Oke)',
      'Pedra (Okuta)',
      'Metal (Ogun)',
      'Água (Omi)',
    ],
    offerings: [
      'Duas velas - branca e amarela',
      'Farinha de mandioca',
      'Azeite de dendê',
      'Quiabo',
      'Eru ou okra',
      'Gelo',
      'Água de cheiro',
    ],
    pontos_cantados: [
      'Osetura Meji! Oke ti nko!',
      'E osetura-o! Senhor da serra sagrada!',
      'Oke oke, ose gun!',
      'Iá Osetura! Iá Osetura!',
      'Osetura abre caminho!',
    ],
    fundamentos: [
      'Osetura é o Orixá dono da serra e das montanhas sagradas',
      'Governa a terra firme e os caminhos elevados',
      'É considerado o pai de Ogum e está associado à metalurgia',
      'A serra é ponto de encontro entre o céu e a terra',
      'Osetura abre os caminhos e prepara o terreno para outros Orixás',
      'É Orixá de grande poder e autoridade',
      'Preside sobre ferramentas, instrumentos de corte e agricultura',
    ],
    attributes: [
      'força',
      'autoridade',
      'trabalhos',
      'abertura de caminhos',
      'proteção',
      'determinação',
    ],
    ritualPractices: [
      {
        type: 'Itutu Osetura',
        description: 'Ritual de conexão com a energia da serra e da terra',
        duration: '1-2 horas',
        steps: [
          'Escolher um local elevado ou próximo a pedras',
          'Preparar as oferendas - velas branca e amarela',
          'Colocar farinha de mandioca no local',
          'Acender as velas e recitar os pontos cantados',
          'Fazer pedidos de abertura de caminhos',
          'Oferecer quiabo e okra à terra',
          'Agradecer e fechar o ritual',
        ],
      },
      {
        type: 'Ebó de Abertura de Caminhos',
        description: 'Ritual para abrir novos caminhos e remover obstáculos',
        duration: '45 minutos - 1 hora',
        steps: [
          'Preparar efun (giz branco) para desenhar no chão',
          'Colocar as oferendas em local sagrado',
          'Recitar: "Osetura abre caminho!"',
          'Desenhar símbolos de proteção com efun',
          'Oferecer as velas aos quatro cantos',
          'Fazer o sacrifício de sangue se necessário',
          'Deixar as oferendas até o amanhecer',
        ],
      },
      {
        type: 'Rogação de Osetura',
        description: 'Súplica para que Osetura prepare o caminho',
        duration: '30 minutos',
        steps: [
          'Estar em jejum ritual de pelo menos 12 horas',
          'Tomar banho de herbs preparado para Osetura',
          'Vestir branco',
          'Recitar a ladainha de Osetura',
          'Fazer pedidos específicos de forma clara',
          'Agradecer pela proteção e força',
          'Guardar o dia como memória sagrada',
        ],
      },
    ],
  };
}