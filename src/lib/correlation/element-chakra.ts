/**
 * Element-Chakra Spiritual Correlation
 * Maps the 5 elements (Fogo, Água, Ar, Terra, Éter) to their corresponding chakras,
 * orixás regentes, qualities, and recommended spiritual practices.
 * 
 * Based on Cabala dos Caminhos hermetic principles and Candomblé/Umbanda traditions.
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export type Chakra = 
  | '1º Básico'
  | '2º Sacro'
  | '3º Plexo Solar'
  | '4º Cardíaco'
  | '5º Laríngeo'
  | '6º Frontal'
  | '7º Coronário';

export interface ElementChakraMapping {
  elemento: Elemento;
  chakras_correspondentes: {
    primario: Chakra;
    secundarios: Chakra[];
  };
  orixa_regente: string;
  orixas_secundarios: string[];
  qualidade_energetica: {
    tipo: 'Quente' | 'Frio' | 'Neutro';
    polaridade: 'Yang' | 'Yin' | 'Equilibrado';
    vibração: string;
  };
  praticas_recomendadas: {
    ebos: string[];
    banhos: string[];
    defumacoes: string[];
    mantras: string[];
    horarios_rituais: string[];
  };
  correspondencia_sefirot: string;
  direcao_cardinal: string;
}

/**
 * Complete mapping of the 5 elements to their spiritual correspondences.
 * Derived from IDEIA.md Cabala dos Caminhos system data.
 */
export const ELEMENT_CHAKRA_MAPPINGS: Record<Elemento, ElementChakraMapping> = {
  Fogo: {
    elemento: 'Fogo',
    chakras_correspondentes: {
      primario: '2º Sacro',
      secundarios: ['3º Plexo Solar'],
    },
    orixa_regente: 'Iansã',
    orixas_secundarios: ['Ogum', 'Xangô', 'Exu'],
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Transformação, purificação, destruição criativa',
    },
    praticas_recomendadas: {
      ebos: [
        'Ebó de Transmutação com pipoca (Deburu) para Omolu',
        'Ebó de Defesa com inhames assados e paliteiros de Ogum',
        'Ebó de Justiça com pedras de raio e amalá',
      ],
      banhos: [
        'Decocção de pinhão roxo e guiné (do pescoço para baixo)',
        'Banho de erva-de-bicho ou espada-de-santa-bárbara',
        'Banhos de lama ou argila para transmutação',
      ],
      defumacoes: [
        'Arruda seca com cânfora',
        'Resinas de olíbano',
        'Pinho roxo para descarrego pesado',
      ],
      mantras: ['HAM (5º Laríngeo)', 'RAM (3º Plexo Solar)', 'VAM (2º Sacro)'],
      horarios_rituais: [
        'Terça-feira (Marte/Plutão): força de guerra e movimento',
        'Quarta-feira (Mercúrio): inteligência e estratégia',
        'Domingo (Sol): vitalidade e brilho pessoal',
      ],
    },
    correspondencia_sefirot: 'Geburah (Severidade) / Tiphereth (Beleza)',
    direcao_cardinal: 'Oeste / Sudoeste',
  },

  Água: {
    elemento: 'Água',
    chakras_correspondentes: {
      primario: '2º Sacro',
      secundarios: ['4º Cardíaco', '6º Frontal'],
    },
    orixa_regente: 'Oxum',
    orixas_secundarios: ['Iemanjá', 'Oxumaré', 'Nanã'],
    qualidade_energetica: {
      tipo: 'Frio',
      polaridade: 'Yin',
      vibração: 'Fluidez, purificação emocional, fertilidade, amor',
    },
    praticas_recomendadas: {
      ebos: [
        'Ebó de Atração/Ouro com banhos de mel e caldas de frutas',
        'Ebó de Fartura com seis tipos de frutas',
        'Ebó de Renovação com folhas de fortuna',
      ],
      banhos: [
        'Banho de mel e calêndula (noite de Lua Cheia)',
        'Macerado a frio de colônia e saião (sob o luar)',
        'Banho de rosas com mel',
      ],
      defumacoes: [
        'Alfazema para limpeza astral',
        'Saião para purificação emocional',
        'Erva-doce para harmonização',
      ],
      mantras: ['YAM (4º Cardíaco)', 'VAM (2º Sacro)'],
      horarios_rituais: [
        'Sábado (Saturno/Urano): amor incondicional e intuição',
        'Quinta-feira (Júpiter): expansão e fartura',
        'Dias de Lua Cheia: magnetismo máximo',
      ],
    },
    correspondencia_sefirot: 'Binah (Compreensão) / Chesed (Misericórdia)',
    direcao_cardinal: 'Oeste',
  },

  Ar: {
    elemento: 'Ar',
    chakras_correspondentes: {
      primario: '4º Cardíaco',
      secundarios: ['3º Plexo Solar', '5º Laríngeo'],
    },
    orixa_regente: 'Oxalá',
    orixas_secundarios: ['Oxóssi', 'Xangô', 'Ibeji'],
    qualidade_energetica: {
      tipo: 'Neutro',
      polaridade: 'Equilibrado',
      vibração: 'Comunicação, sabedoria, expansão mental, paz',
    },
    praticas_recomendadas: {
      ebos: [
        'Ebó de Alinhamento (Bori) com canjica branca e algodão',
        'Ebó de Prosperidade com doces e frutas',
        'Ebó de Agradecimento com flores brancas',
      ],
      banhos: [
        'Banho de boldo (tapete de Oxalá)',
        'Infusão de alecrim e manjericão branco',
        'Banho de camomila e malva',
      ],
      defumacoes: [
        'Alecrim para clareza mental',
        'Sândalo para paz espiritual',
        'Manjericão branco para proteção suave',
      ],
      mantras: ['AUM (7º Coronário)', 'OM (6º Frontal)', 'HAM (5º Laríngeo)'],
      horarios_rituais: [
        'Sexta-feira (Vênus): paz absoluta e conexão divina',
        'Quinta-feira (Júpiter): fartura e conhecimento',
        'Domingo (Sol): vitalidade e propósito',
      ],
    },
    correspondencia_sefirot: 'Chesed (Misericórdia) / Hod (Glória)',
    direcao_cardinal: 'Leste',
  },

  Terra: {
    elemento: 'Terra',
    chakras_correspondentes: {
      primario: '1º Básico',
      secundarios: ['2º Sacro'],
    },
    orixa_regente: 'Omolu',
    orixas_secundarios: ['Nanã', 'Oxumaré', 'Exu'],
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Aterramento, cura física, transmutação, estrutura',
    },
    praticas_recomendadas: {
      ebos: [
        'Ebó de Caminho/Limpeza com despachos em encruzilhadas',
        'Ebó de Evolução na lama ou mangue para Nanã',
        'Ebó de Defesa com paliteiros de Ogum',
      ],
      banhos: [
        'Decocção de canela-de-velho (lavar pés e chão)',
        'Banho de assa-peixe e peregrum verde',
        'Sacudimento com pipoca (Deburu)',
      ],
      defumacoes: [
        'Cânfora e mirra para proteção pesada',
        'Resinas para encerramento de ciclos',
        'Canela-de-velho para ancoramento',
      ],
      mantras: ['LAM (1º Básico)', 'VAM (2º Sacro)'],
      horarios_rituais: [
        'Segunda-feira (Lua/Saturno): aterramento e limpeza ancestral',
        'Dias de Lua Minguante: descarrego e corte de laços',
        'Terça-feira: cura física e proteção',
      ],
    },
    correspondencia_sefirot: 'Malkuth (Reino) / Yesod (Fundação)',
    direcao_cardinal: 'Norte',
  },

  Éter: {
    elemento: 'Éter',
    chakras_correspondentes: {
      primario: '7º Coronário',
      secundarios: ['6º Frontal', '5º Laríngeo'],
    },
    orixa_regente: 'Oxalá',
    orixas_secundarios: ['Iemanjá', 'Orunmilá'],
    qualidade_energetica: {
      tipo: 'Neutro',
      polaridade: 'Equilibrado',
      vibração: 'Conexão divina, iluminação, sabedoria primordial',
    },
    praticas_recomendadas: {
      ebos: [
        'Ebó de Alinhamento (Bori) espiritual',
        'Ebó de Agradecimento com flores brancas e velas',
        'Ebó de Alívio/Saúde com frutas brancas e ervas calmas',
      ],
      banhos: [
        'Banho gelado de boldo no Ori (cabeça)',
        'Macerado de leite de cabra com ervas calmas',
        'Banho de camomila e alfazema na cabeça',
      ],
      defumacoes: [
        'Incenso puro (olíbano)',
        'Sândalo para paz absoluta',
        'Alfazema com saião para orientação',
      ],
      mantras: ['AUM (7º Coronário)', 'OM (6º Frontal)', 'SILÊNCIO'],
      horarios_rituais: [
        'Sexta-feira (Vênus): paz e pureza máxima',
        'Dias de Lua Nova: silêncio e planejamento invisível',
        'Dias de Lua Cheia: magnetismo e conexão espiritual',
      ],
    },
    correspondencia_sefirot: 'Kether (Coroa) / Tiphereth (Beleza)',
    direcao_cardinal: 'Centro / Zênite',
  },
};

/**
 * Returns the complete element-chakra mapping for a given element name.
 * Case-insensitive matching with normalization.
 * 
 * @param elemento - The element name (Fogo, Água, Ar, Terra, Éter)
 * @returns The complete ElementChakraMapping or null if not found
 */
export function getElementChakras(elemento: string): ElementChakraMapping | null {
  const normalized = elemento
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const elementMap: Record<string, Elemento> = {
    fogo: 'Fogo',
    agua: 'Água',
    ar: 'Ar',
    terra: 'Terra',
    eter: 'Éter',
  };

  const key = elementMap[normalized];
  if (key && ELEMENT_CHAKRA_MAPPINGS[key]) {
    return ELEMENT_CHAKRA_MAPPINGS[key];
  }

  return null;
}

/**
 * Returns all elements with their chakra mappings.
 * Useful for iteration and display purposes.
 * 
 * @returns Array of all ElementChakraMapping entries
 */
export function getAllElementMappings(): ElementChakraMapping[] {
  return Object.values(ELEMENT_CHAKRA_MAPPINGS);
}

/**
 * Returns the primary chakra for a given element.
 * 
 * @param elemento - The element name
 * @returns The primary chakra or null if not found
 */
export function getPrimaryChakra(elemento: string): Chakra | null {
  const mapping = getElementChakras(elemento);
  return mapping?.chakras_correspondentes.primario ?? null;
}

/**
 * Returns all chakras (primary + secondary) for a given element.
 * 
 * @param elemento - The element name
 * @returns Array of all chakras or null if not found
 */
export function getAllChakras(elemento: string): Chakra[] | null {
  const mapping = getElementChakras(elemento);
  if (!mapping) return null;
  
  return [
    mapping.chakras_correspondentes.primario,
    ...mapping.chakras_correspondentes.secundarios,
  ];
}

/**
 * Returns the energy quality type for a given element.
 * 
 * @param elemento - The element name
 * @returns The energy type ('Quente' | 'Frio' | 'Neutro') or null
 */
export function getEnergyType(elemento: string): 'Quente' | 'Frio' | 'Neutro' | null {
  const mapping = getElementChakras(elemento);
  return mapping?.qualidade_energetica.tipo ?? null;
}

/**
 * Returns the regent orixá for a given element.
 * 
 * @param elemento - The element name
 * @returns The regent orixá name or null if not found
 */
export function getRegentOrixa(elemento: string): string | null {
  const mapping = getElementChakras(elemento);
  return mapping?.orixa_regente ?? null;
}