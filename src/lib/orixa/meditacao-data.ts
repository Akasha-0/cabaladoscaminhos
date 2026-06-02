// @ts-nocheck
// SKIP_LINT

/**
 * Meditacao Data Module
 * Spiritual meditation data for Yoruba/Afro-Brazilian tradition
 */

export interface MeditacaoData {
  id: string;
  name: string;
  namePortuguese: string;
  nameYoruba: string;
  type: string;
  description: string;
  purpose: string;
  duration: string;
  position: string;
  breathing: BreathingData;
  visualization: VisualizationData;
  mantra: MantraData;
  associatedOrixas: string[];
  benefits: string[];
  contraindications: string[];
  steps: string[];
  sacredTimes: string[];
  elements: string[];
}

export interface BreathingData {
  technique: string;
  ratio: string;
  cycles: number;
  instructions: string[];
}

export interface VisualizationData {
  type: string;
  description: string;
  imagery: string[];
}

export interface MantraData {
  primary: string;
  meaning: string;
  pronunciation: string;
  times: number;
}

const MEDITACAO_DATA: MeditacaoData = {
  id: 'meditacao',
  name: 'Meditação Tradicional',
  namePortuguese: 'Meditação de Orixá',
  nameYoruba: 'Ikíni',
  type: 'Meditação Espiritual',
  description: 'Prática ancestral de contemplação e conexão espiritual com os orixás e a energia vital universal. A meditação ikíni é uma tradição sagrada passed down through generations of practitioners.',
  purpose: 'Alcançar estados alterados de consciência, conectar-se com os orixás, receber orientação espiritual, limpar a cabeça (ori) e harmonizar o axé individual.',
  duration: '15 a 45 minutos',
  position: 'Sentado em posição de respeito (ejìbìtì) com as pernas cruzadas, coluna ereta, mãos sobre os joelhos ou no colo em posição de offering (àdìmù)',
  breathing: {
    technique: 'Respiração Sagrada de Orixá',
    ratio: '4-7-8',
    cycles: 9,
    instructions: [
      'Inspire profundamente pelo nariz contando até 4',
      'Segure o fôlego contando até 7',
      'Expire lentamente pela boca contando até 8',
      'Repita o ciclo mantendo foco no axé'
    ]
  },
  visualization: {
    type: 'Visualização de Axé',
    description: 'Técnica de concentração que utiliza a imaginação sagrada para conectar com a energia dos orixás',
    imagery: [
      'Imagine uma luz dourada (axé) descendo do céu (òrun) através do topo da cabeça (ori)',
      'Visualize a luz preenchendo cada parte do corpo, dos pés à cabeça',
      'Imagine seu душа (emi) expandindo-se como o sol',
      'Visualize o orixá protector emanando energia protetora em forma de escudo luminoso'
    ]
  },
  mantra: {
    primary: 'Ase Ase Ase',
    meaning: 'Poder, força vital, activação sagrada',
    pronunciation: 'ah-SHEH ah-SHEH ah-SHEH',
    times: 108
  },
  associatedOrixas: [
    'Obatalá (criação e pureza)',
    'Oxum (sabedoria e intuição)',
    'Orunmila (conhecimento e destino)',
    'Yemoja (emoções e intuicão)',
    'Shango (força e transformação)'
  ],
  benefits: [
    'Clarificação mental e espiritual',
    'Conexão com ancestrais e orixás',
    'Redução de stress e ansiedade',
    'Desenvolvimento de intuição',
    'Harmonização do axé pessoal',
    'Proteção espiritual',
    'Abertura de canais de comunicação divina',
    'Fortalecimento da vontade e determinação'
  ],
  contraindications: [
    'Não meditar em lugares impuros ou com resíduos de sacrifícios',
    'Evitar meditação durante momentos de raiva intensa',
    'Não meditar sem proteção de ebó preparatório quando indicado',
    'Pessoas com condições cardíacas devem adaptar a respiração'
  ],
  steps: [
    '1. Preparação: Escolha um local limpo, preferably com representação do orixá protector',
    '2. Purificação: Acenda incenso (preferably alménegà ou páu-brasil) e faça prayers de abertura',
    '3. Postura: Assuma a posição ejìbìtì com respeito e intenção',
    '4. Invocação: Recite o mantra de abertura: "Mo dúpó, mo wà, ase mi lo"',
    '5. Respiração: Pratique a respiração sagrada pelos ciclos indicados',
    '6. Visualização: Execute a visualização de axé gradualmente',
    '7. Mantra: Repita o mantra principal contanto as repetições',
    '8. Silêncio: Permaneça em silêncio receptivo por vários minutos',
    '9. Recebimento: Aguarde orientação ou visão, se vier',
    '10. Encerramento: Agradeça aos orixás, faça oferenda mental, cier o espaço'
  ],
  sacredTimes: [
    'Antes do amanhecer (àárọ̀) - conexão com Orunmila',
    'Meio-dia (ọ̀sán) - força de Shango',
    'Pôr do sol (Ọ̀túntọ̀) - transição entre mundos',
    'Meia-noite (alẹ́) - tempo de Yemoja e Ossaim',
    'Quarta-feira - dia de Ossaim, orixá das folhas e medicina'
  ],
  elements: [
    'Fogo (dúdì) - represented by candles e incenso',
    'Água (omi) - represented by água corrente ou jarra',
    'Terra (ìrìn) - represented by terra sagrada ou gameleira',
    'Ar (afẹ́) - represented by prayers e mantras',
    'Éter (ọ̀run) - represented pela luz descendente do céu'
  ]
};

export function getData(): MeditacaoData {
  return MEDITACAO_DATA;
}

function getDataById(id: string): MeditacaoData | undefined {
  return id === 'meditacao' ? MEDITACAO_DATA : undefined;
}

function getBreathingTechnique(): BreathingData {
  return MEDITACAO_DATA.breathing;
}

function getVisualization(): VisualizationData {
  return MEDITACAO_DATA.visualization;
}

function getMantra(): MantraData {
  return MEDITACAO_DATA.mantra;
}

function getAssociatedOrixas(): string[] {
  return MEDITACAO_DATA.associatedOrixas;
}

function getSacredTimes(): string[] {
  return MEDITACAO_DATA.sacredTimes;
}

function getElements(): string[] {
  return MEDITACAO_DATA.elements;
}
