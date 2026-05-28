// Evolution data module

export interface EvolutionStage {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  symbols: string[];
}

export interface EvolutionData {
  stages: EvolutionStage[];
  paths: {
    id: string;
    name: string;
    description: string;
    stageIds: string[];
  }[];
}

export function getData(): EvolutionData {
  return {
    stages: [
      {
        id: '燎原',
        name: '燎原',
        description: 'A chama inicial que se espalha pela planície — o despertar da consciência.',
        characteristics: [
          'Expansão espontânea',
          'Clareza primordial',
          'Movimento ascendente',
        ],
        symbols: ['🔥', '🌄'],
      },
      {
        id: '破曉',
        name: '破曉',
        description: 'A luz que rompe a escuridão — a transição do inconsciente para o desperto.',
        characteristics: [
          'Transição',
          'Iluminação gradual',
          'Renovação',
        ],
        symbols: ['🌅', '✨'],
      },
      {
        id: '顯化',
        name: '顯化',
        description: 'O ponto culminante — a manifestação concreta da intenção.',
        characteristics: [
          'Manifestação',
          'Cristalização',
          'Presença plena',
        ],
        symbols: ['💎', '⬡'],
      },
      {
        id: '循環',
        name: '循環',
        description: 'O retorno ao início com compreensão — o ciclo que se renova em harmonia.',
        characteristics: [
          'Ciclo completo',
          'Sabedoria integrada',
          'Renovação consciente',
        ],
        symbols: ['☯', '∞'],
      },
    ],
    paths: [
      {
        id: 'caminho-central',
        name: 'Caminho Central',
        description: 'O trajeto reto entre os mundos — a via direta de transformação.',
        stageIds: ['燎原', '破曉', '顯化', '循環'],
      },
      {
        id: 'caminho- левый',
        name: 'Caminho da Mão Esquerda',
        description: 'O caminho da sombra — integração através da noite.',
        stageIds: ['燎原', '循環'],
      },
      {
        id: 'caminho-direito',
        name: 'Caminho da Mão Direita',
        description: 'O caminho da luz — integração através do dia.',
        stageIds: ['破曉', '顯化'],
      },
    ],
  };
}
