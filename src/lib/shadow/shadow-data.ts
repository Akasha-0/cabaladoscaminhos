/**
 * Shadow Data - Shadow work and integration data for Cabala dos Caminhos
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ShadowData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  type: 'aspect' | 'integration' | 'practice' | 'challenge';
  description: string;
  descriptionPt: string;
  keywords: string[];
}

const shadowData: ShadowData[] = [
  {
    id: 'shadow-aspect-fear',
    name: 'Medo',
    namePt: 'Medo',
    nameEn: 'Fear',
    type: 'aspect',
    description: 'The primal fear that binds the soul to protective shadows',
    descriptionPt: 'O medo primal que prende a alma às sombras protetoras',
    keywords: ['fear', 'shadow', 'primal', 'protection'],
  },
  {
    id: 'shadow-aspect-shame',
    name: 'Vergonha',
    namePt: 'Vergonha',
    nameEn: 'Shame',
    type: 'aspect',
    description: 'Hidden shame that dims the inner light',
    descriptionPt: 'Vergonha escondida que apaga a luz interior',
    keywords: ['shame', 'hidden', 'dim', 'light'],
  },
  {
    id: 'shadow-aspect-anger',
    name: 'Raiva',
    namePt: 'Raiva',
    nameEn: 'Anger',
    type: 'aspect',
    description: 'Repressed anger seeking healthy expression',
    descriptionPt: 'Raiva reprimida buscando expressão saudável',
    keywords: ['anger', 'repressed', 'expression', 'healthy'],
  },
  {
    id: 'shadow-aspect-grief',
    name: 'Pesar',
    namePt: 'Pesar',
    nameEn: 'Grief',
    type: 'aspect',
    description: 'Unprocessed grief that weighs upon the spirit',
    descriptionPt: 'Pesar não processado que pesa sobre o espírito',
    keywords: ['grief', 'unprocessed', 'weight', 'spirit'],
  },
  {
    id: 'shadow-aspect-judgment',
    name: 'Julgo',
    namePt: 'Julgo',
    nameEn: 'Judgment',
    type: 'aspect',
    description: 'Critical judgment turned inward against the self',
    descriptionPt: 'Julgo crítico voltado para dentro contra o self',
    keywords: ['judgment', 'critical', 'self', 'inner'],
  },
  {
    id: 'shadow-aspect-rejection',
    name: 'Rejeição',
    namePt: 'Rejeição',
    nameEn: 'Rejection',
    type: 'aspect',
    description: 'Fear of rejection manifesting as self-protection',
    descriptionPt: 'Medо de rejeição se manifestando como autoproteção',
    keywords: ['rejection', 'fear', 'protection', 'self'],
  },
  {
    id: 'shadow-integration-awareness',
    name: 'Autoconsciência',
    namePt: 'Autoconsciência',
    nameEn: 'Awareness',
    type: 'integration',
    description: 'Bringing shadow aspects into conscious awareness',
    descriptionPt: 'Trazendo aspectos sombrios para a consciência',
    keywords: ['awareness', 'conscious', 'shadow', 'integration'],
  },
  {
    id: 'shadow-integration-acceptance',
    name: 'Aceitação',
    namePt: 'Aceitação',
    nameEn: 'Acceptance',
    type: 'integration',
    description: 'Accepting all parts of self without judgment',
    descriptionPt: 'Aceitando todas as partes do self sem julgamento',
    keywords: ['acceptance', 'wholeness', 'self', 'all'],
  },
  {
    id: 'shadow-integration-transformation',
    name: 'Transformação',
    namePt: 'Transformação',
    nameEn: 'Transformation',
    type: 'integration',
    description: 'Transforming shadow energy into spiritual power',
    descriptionPt: 'Transformando energia sombria em poder espiritual',
    keywords: ['transformation', 'power', 'energy', 'spiritual'],
  },
  {
    id: 'shadow-practice-meditation',
    name: 'Meditação Sombria',
    namePt: 'Meditação Sombria',
    nameEn: 'Shadow Meditation',
    type: 'practice',
    description: 'Deep meditation to meet and embrace shadow aspects',
    descriptionPt: 'Meditação profunda para encontrar e abraçar aspectos sombrios',
    keywords: ['meditation', 'deep', 'shadow', 'embrace'],
  },
  {
    id: 'shadow-practice-journaling',
    name: 'Diário de Sombras',
    namePt: 'Diário de Sombras',
    nameEn: 'Shadow Journaling',
    type: 'practice',
    description: 'Writing practice to explore hidden emotions',
    descriptionPt: 'Prática de escrita para explorar emoções escondidas',
    keywords: ['journaling', 'writing', 'emotions', 'hidden'],
  },
  {
    id: 'shadow-practice-dialogue',
    name: 'Diálogo Interior',
    namePt: 'Diálogo Interior',
    nameEn: 'Inner Dialogue',
    type: 'practice',
    description: 'Internal conversation with shadow selves',
    descriptionPt: 'Conversa interna com selves sombrios',
    keywords: ['dialogue', 'internal', 'shadow', ' selves'],
  },
  {
    id: 'shadow-challenge-resistance',
    name: 'Resistência',
    namePt: 'Resistência',
    nameEn: 'Resistance',
    type: 'challenge',
    description: 'The mind resists facing uncomfortable truths',
    descriptionPt: 'A mente resiste a enfrentar verdades desconfortáveis',
    keywords: ['resistance', 'mind', 'truth', 'uncomfortable'],
  },
  {
    id: 'shadow-challenge-denial',
    name: 'Negação',
    namePt: 'Negação',
    nameEn: 'Denial',
    type: 'challenge',
    description: 'Denial of shadow aspects keeps them hidden',
    descriptionPt: 'Negação dos aspectos sombrios os mantém escondidos',
    keywords: ['denial', 'hidden', 'shadow', 'concealed'],
  },
  {
    id: 'shadow-challenge-projection',
    name: 'Projeção',
    namePt: 'Projeção',
    nameEn: 'Projection',
    type: 'challenge',
    description: 'Projecting shadow qualities onto others',
    descriptionPt: 'Projetando qualidades sombrias nos outros',
    keywords: ['projection', 'others', 'shadow', 'external'],
  },
  {
    id: 'shadow-challenge-avoidance',
    name: 'Evitação',
    namePt: 'Evitação',
    nameEn: 'Avoidance',
    type: 'challenge',
    description: 'Avoiding shadow work through distraction',
    descriptionPt: 'Evitando trabalho sombrio através de distração',
    keywords: ['avoidance', 'distraction', 'shadow', 'work'],
  },
];

/**
 * Get all shadow data entries
 */
export function getData(): ShadowData[] {
  return shadowData;
}

/**
 * Get shadow data by type
 */
export function getDataByType(type: ShadowData['type']): ShadowData[] {
  return shadowData.filter((d) => d.type === type);
}

/**
 * Get shadow data entry by id
 */
export function getDataById(id: string): ShadowData | undefined {
  return shadowData.find((d) => d.id === id);
}
