// Transmutation data for spiritual transformation phases

export interface TransmutationData {
  id: string;
  phase: 'awakening' | 'vibration' | 'transmutation' | 'ascension';
  name: string;
  description: string;
  duration: string;
  attributes: string[];
  practices: string[];
  symbols: string[];
  colors: string[];
  elements: string[];
  timestamp: number;
}

export const TRANSMUTATION_DATASET: TransmutationData[] = [
  {
    id: 'trans-001',
    phase: 'awakening',
    name: 'Consciência Primordial',
    description: 'Despertar da consciência para o processo de transmutação',
    duration: 'variável',
    attributes: ['discernimento', 'presença', 'reconhecimento'],
    practices: ['meditação', 'respiração consciente', 'auto-observação'],
    symbols: ['olho abierto', 'aurora'],
    colors: ['dourado', 'branco'],
    elements: ['luz'],
    timestamp: Date.now(),
  },
  {
    id: 'trans-002',
    phase: 'vibration',
    name: 'Ressonância Energética',
    description: 'Elevação da vibração através de práticas alquímicas',
    duration: 'ciclos de 40 dias',
    attributes: ['ressonância', 'harmonia', 'frequência'],
    practices: ['solfeggio', 'canto sagrado', 'visualização'],
    symbols: ['espiral', 'onda'],
    colors: ['violeta', 'índigo'],
    elements: ['éter'],
    timestamp: Date.now(),
  },
  {
    id: 'trans-003',
    phase: 'transmutation',
    name: 'Transformação Interior',
    description: 'Transmutação efetiva da energia inferior em superior',
    duration: 'períodos de integração',
    attributes: ['transmutação', 'purificação', 'refinamento'],
    practices: ['ritual', 'afirmações', 'trabalho com fogo'],
    symbols: ['enxofre', 'mercúrio', 'sal'],
    colors: ['vermelho', 'laranja'],
    elements: ['fogo', 'água'],
    timestamp: Date.now(),
  },
  {
    id: 'trans-004',
    phase: 'ascension',
    name: 'Ascensão Vibratória',
    description: 'Elevação final da consciência para planos superiores',
    duration: 'liberação completa',
    attributes: ['ascensão', 'unificação', 'perfeição'],
    practices: ['contemplação', 'unidade', 'serviço'],
    symbols: ['triângulo', 'coroa'],
    colors: ['branco', 'dourado', 'cristal'],
    elements: ['luz', 'espaço'],
    timestamp: Date.now(),
  },
];

export function getData(): TransmutationData[] {
  return [...TRANSMUTATION_DATASET];
}