/**
 * Ancestor rituals module
 * Provides sacred rituals for ancestral connection and honoring
 */

export type RitualType = 
  | 'invocation'
  | 'offering'
  | 'meditation'
  | 'gratitude'
  | 'protection'
  | 'liberation';

export interface Ritual {
  id: string;
  name: string;
  type: RitualType;
  description: string;
  steps: string[];
  offerings?: string[];
  duration?: string;
}

const rituals: Ritual[] = [
  {
    id: ' ancestor-invocation-morning',
    name: 'Invocação Matinal aos Ancestrais',
    type: 'invocation',
    description: 'Ritual de abertura do dia com chamados aos ancestrais Guia.',
    steps: [
      'Acenda uma vela branca ou dourada',
      'Respire profundamente três vezes',
      'Recite o chamado aos ancestrais',
      'Pida bênçãos e proteção para o dia'
    ],
    duration: '5-10 minutos'
  },
  {
    id: 'offering-water-ancestors',
    name: 'Oferenda de Água',
    type: 'offering',
    description: 'Oferta simples de água para honrar os ancestrais.',
    steps: [
      'Coloque um copo de água limpa',
      'Diga o nome de seus ancestrais',
      'Agradeça por suas bênçãos',
      'Deixe o copo por algumas horas antes de consumir'
    ],
    offerings: ['Água fresca', 'Flores brancas']
  },
  {
    id: 'meditation-lineage',
    name: 'Meditação da Linha Ancestral',
    type: 'meditation',
    description: 'Conecta com a energia de seus ancestrais através da meditação.',
    steps: [
      'Sente-se em silêncio',
      'Visualize uma linha de luz conectando você aos seus ancestrais',
      'Sinta a presença e sabedoria deles',
      'Receba suas bênçãos com gratidão'
    ],
    duration: '15-20 minutos'
  },
  {
    id: 'gratitude-ancestors',
    name: 'Ação de Graças Ancestral',
    type: 'gratitude',
    description: 'Ritual de gratidão pelos sacrifícios e legados ancestrais.',
    steps: [
      'Lembre-se de um ancestral específico',
      'Agradeça por seus ensinamentos',
      'Reconheça seus sacrifícios',
      'Prometa honrar seu legado'
    ]
  },
  {
    id: 'protection-ritual',
    name: 'Ritual de Proteção Ancestral',
    type: 'protection',
    description: 'Pede proteção e cobertura espiritual aos ancestrais.',
    steps: [
      'Desenhe um círculo de sal (opcional)',
      'Chame seus ancestrais protetores',
      'Pede que afastem energias negativas',
      'Agradeça pela proteção recebida'
    ],
    duration: '10-15 minutos'
  },
  {
    id: 'liberation-ancestral',
    name: 'Libertação kármica ancestral',
    type: 'liberation',
    description: 'Ritual para libertar padrões e energias herdadas.',
    steps: [
      'Identifique um padrão a libertar',
      'Peça aos ancestrais ajuda para soltar',
      'Visualize a energia sendo transformada',
      'Agradeça pela libertação'
    ],
    duration: '20-30 minutos'
  }
];

/**
 * Returns all available ancestor rituals
 */
export function getRituals(): Ritual[] {
  return rituals;
}
