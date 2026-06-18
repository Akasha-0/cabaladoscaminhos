export type SpreadType = 'celtic-cross' | 'three-card' | 'single-card';

export interface SpreadPosition {
  position: number;
  name: string;
  description: string;
  orientation: 'upright' | 'reversed' | 'both';
}

export interface TarotSpread {
  id: SpreadType;
  name: string;
  description: string;
  positions: SpreadPosition[];
  totalCards: number;
}

// Celtic Cross - 10 positions
const celticCross: TarotSpread = {
  id: 'celtic-cross',
  name: 'Cruz Celta',
  description:
    'Leitura completa de 10 cartas para análise profunda de uma situação, seus obstáculos e caminhos futuros.',
  totalCards: 10,
  positions: [
    {
      position: 1,
      name: 'Situação Atual',
      description: 'Representa o momento presente, o coração da questão. A energia que age agora.',
      orientation: 'both',
    },
    {
      position: 2,
      name: 'Obstáculo',
      description: 'O desafio ou força oposta que atua na situação. O que se interpõe no caminho.',
      orientation: 'both',
    },
    {
      position: 3,
      name: 'Base/Fundação',
      description:
        'As raízes da questão, o passado que influencia o presente. A base sobre a qual tudo foi construído.',
      orientation: 'both',
    },
    {
      position: 4,
      name: 'Passado Recente',
      description: 'Eventos ou influências recentes que contribuíram para a situação atual.',
      orientation: 'both',
    },
    {
      position: 5,
      name: 'Possível Futuro',
      description:
        'O resultado mais provável se o curso atual for mantido. A tendência inalterada.',
      orientation: 'both',
    },
    {
      position: 6,
      name: 'Futuro Próximo',
      description: 'O que está por vir em curto prazo. Próximos passos ou eventos iminentes.',
      orientation: 'both',
    },
    {
      position: 7,
      name: 'Postura do Consultante',
      description: 'A posição ou atitude do consulente frente à situação. Como se posiciona.',
      orientation: 'both',
    },
    {
      position: 8,
      name: 'Influências Externas',
      description: 'O ambiente, as pessoas e as forças ao redor que afetam a situação.',
      orientation: 'both',
    },
    {
      position: 9,
      name: 'Esperanças e Medos',
      description: 'Os desejos mais profundos e as anxieties inconscientes relacionadas à questão.',
      orientation: 'both',
    },
    {
      position: 10,
      name: 'Resultado Final',
      description:
        'A síntese de tudo, o resultado final da situação quando todas as forças se equilibrarem.',
      orientation: 'both',
    },
  ],
};

// Three Card - 3 positions
const threeCard: TarotSpread = {
  id: 'three-card',
  name: 'Três Cartas',
  description:
    'Leitura rápida de 3 cartas representando passado, presente e futuro de uma situação.',
  totalCards: 3,
  positions: [
    {
      position: 1,
      name: 'Passado',
      description: 'As influências passadas que moldaram a situação atual. O que já aconteceu.',
      orientation: 'both',
    },
    {
      position: 2,
      name: 'Presente',
      description: 'A energia que atua agora. O momento atual e seu significado.',
      orientation: 'both',
    },
    {
      position: 3,
      name: 'Futuro',
      description: 'A direção provável. O que está por vir se as condições atuais se mantiverem.',
      orientation: 'both',
    },
  ],
};

// Single Card - 1 position
const singleCard: TarotSpread = {
  id: 'single-card',
  name: 'Carta Única',
  description: 'Leitura minimalista para uma resposta clara e direta. Ideal para questões simples.',
  totalCards: 1,
  positions: [
    {
      position: 1,
      name: 'Resposta',
      description: 'A essência da questão. Uma verdade fundamental sobre o momento ou pergunta.',
      orientation: 'both',
    },
  ],
};

const spreads: Record<SpreadType, TarotSpread> = {
  'celtic-cross': celticCross,
  'three-card': threeCard,
  'single-card': singleCard,
};

/**
 * Returns a tarot spread configuration by type.
 * @param type - The spread type: 'celtic-cross', 'three-card', or 'single-card'
 * @returns The spread configuration with all positions and meanings
 */
export function getSpread(type: SpreadType): TarotSpread {
  const spread = spreads[type];
  if (!spread) {
    throw new Error(
      `Spread type "${type}" not found. Valid types: ${Object.keys(spreads).join(', ')}`
    );
  }
  return spread;
}

/**
 * Returns all available spread types.
 */
export function getAllSpreadTypes(): SpreadType[] {
  return Object.keys(spreads) as SpreadType[];
}
