/**
 * Day-Odú Ifá Correlation Mapping
 * Based on IDEIA.md Tabela de Correspondência Macro
 * Aligns days of the week with their corresponding Odu Ifá (Merindilogun)
 */

export interface DayOduMapping {
  /** Day name in Portuguese (e.g., 'Segunda-feira') */
  dia: string;
  /** Primary Odu Ifá */
  odu_principal: {
    numero: number;
    nome: string;
  };
  /** Secondary Odu Ifá (if applicable) */
  odu_secundario: {
    numero: number;
    nome: string;
  } | null;
  /** Energetic alignment classification */
  alinhamento_energetico: string;
  /** Spiritual significance and archetype */
  significado_espiritual: string;
  /** Ritual associations and offerings */
  associacoes_rituais: {
    ebos: string[];
    elementos: string[];
    direcoes: string[];
    cores: string[];
    orixas_relacionados: string[];
  };
}

// ─── Day-to-Odú Ifá Mapping ─────────────────────────────────────────────────

export const DAY_ODU_MAPPINGS: Record<string, DayOduMapping> = {
  'Segunda-feira': {
    dia: 'Segunda-feira',
    odu_principal: {
      numero: 1,
      nome: 'Okaran',
    },
    odu_secundario: {
      numero: 6,
      nome: 'Obará',
    },
    alinhamento_energetico: 'Quente / Densa',
    significado_espiritual:
      'Dia de abertura de caminhos, destino e ancestralidade. Okaran traz o poder do início, da dúvida transformada em ação e da insubordinação aos obstáculos. É o momento propício para trabalhar a transmutação e o poder da matéria — ancorar energias pesadas na terra e limpar o campo áurico de amarrações kármicas.',
    associacoes_rituais: {
      ebos: [
        'Despachos em encruzilhadas para Exu',
        'Moedas e pipoca para abrir caminhos',
        'Panos escuros para limpeza pesada',
        'Rituais de aterramento eancestralidade',
      ],
      elementos: ['Terra', 'Fogo'],
      direcoes: ['Norte', 'Centro'],
      cores: ['Preto', 'Vermelho', 'Branco e Preto', 'Vermelho e Branco'],
      orixas_relacionados: ['Omolu', 'Exu', 'Oxóssi'],
    },
  },
  'Terça-feira': {
    dia: 'Terça-feira',
    odu_principal: {
      numero: 7,
      nome: 'Odi',
    },
    odu_secundario: {
      numero: 12,
      nome: 'Ejilsebora',
    },
    alinhamento_energetico: 'Quente / Ígnea',
    significado_espiritual:
      'Dia de força de guerra, movimento rápido e coragem. Odi traz a energia da teimosia que se transforma em renascimento, o poço profundo que revela os mistérios ocultos. Ejilsebora ativa o fogo purificador e os cortes profundos de demandas. É o dia propício para quebrar energias paradas e iniciar movimentos decisivos.',
    associacoes_rituais: {
      ebos: [
        'Pipoca (Deburu) para Omolu',
        'Banhos de lama ou argila para transmutação',
        'Defumações pesadas com resinas',
        'Firmezas com pedras de raio para Xangô',
      ],
      elementos: ['Terra', 'Água', 'Fogo'],
      direcoes: ['Norte', 'Oeste'],
      cores: ['Preto', 'Branco', 'Vermelho', 'Laranja'],
      orixas_relacionados: ['Omolu', 'Iansã', 'Ogum', 'Xangô'],
    },
  },
  'Quarta-feira': {
    dia: 'Quarta-feira',
    odu_principal: {
      numero: 6,
      nome: 'Obará',
    },
    odu_secundario: {
      numero: 12,
      nome: 'Ejilsebora',
    },
    alinhamento_energetico: 'Quente / Radiante',
    significado_espiritual:
      'Dia da justiça divina, equilíbrio mental e verdade. Obará traz a energia da riqueza, fartura e sabedoria — o rei que se veste de mendigo. Ejilsebora ativa o fogo purificador da guerra justa. É o dia propício para estudos, estratégias de negócios, prosperidade e o equilíbrio entre razão e emoção.',
    associacoes_rituais: {
      ebos: [
        'Seis tipos de frutas para Obará',
        'Amalá para Xangô bem quente',
        'Firmezas com pedras de raio (meteoritos)',
        'Partilhar banquetes e dar comida à terra',
      ],
      elementos: ['Fogo', 'Ar'],
      direcoes: ['Oeste', 'Sul'],
      cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
      orixas_relacionados: ['Xangô', 'Oxóssi', 'Logun Edé'],
    },
  },
  'Quinta-feira': {
    dia: 'Quinta-feira',
    odu_principal: {
      numero: 4,
      nome: 'Irosun',
    },
    odu_secundario: {
      numero: 5,
      nome: 'Oxé',
    },
    alinhamento_energetico: 'Fria / Expansiva',
    significado_espiritual:
      'Dia da fartura, expansão e busca pelo conhecimento. Irosun traz o aviso, a visão espiritual e o sangue que corre nas veias — a capacidade de olhar para o futuro com clareza. Oxé ativa o ouro, a doçura e a feitiçaria natural. É o dia propício para direcionar a mente, buscar mentores espirituais e trabalhar a prosperidade nas matas.',
    associacoes_rituais: {
      ebos: [
        'Alimentos brancos para Iemanjá',
        'Canjica na beira-mar',
        'Banhos de mel e caldas de frutas para Oxé',
        'Oferecer girassóis e moedas douradas em águas doces',
      ],
      elementos: ['Fogo', 'Terra', 'Água'],
      direcoes: ['Sul', 'Norte'],
      cores: ['Verde', 'Azul-turquesa', 'Amarelo-ouro', 'Rosa'],
      orixas_relacionados: ['Oxóssi', 'Iemanjá', 'Oxum', 'Egum'],
    },
  },
  'Sexta-feira': {
    dia: 'Sexta-feira',
    odu_principal: {
      numero: 8,
      nome: 'EjiOníle',
    },
    odu_secundario: {
      numero: 16,
      nome: 'Alafia',
    },
    alinhamento_energetico: 'Fria / Magnética',
    significado_espiritual:
      'Dia da paz absoluta, pureza e conexão direta com o divino. EjiOníle traz a energia da cabeça (Ori), liderança e o topo do mundo — o sangue branco do alinhamento espiritual. Alafia confirma a luz total e a paz absoluta. É o dia propício para o Bori, rituals de alinhamento da cabeça fria (Ori) e sabedoria divina.',
    associacoes_rituais: {
      ebos: [
        'Oferendas de canjica branca para Oxalá',
        'Algodão para o tapete de Oxalá',
        'Banhos de boldo para alinhamento',
        'Velas brancas e flores brancas para Alafia',
      ],
      elementos: ['Ar', 'Água'],
      direcoes: ['Centro', 'Leste'],
      cores: ['Branco', 'Marfim', 'Opala', 'Violeta'],
      orixas_relacionados: ['Oxalá', 'Jagun', 'Orunmilá'],
    },
  },
  'Sábado': {
    dia: 'Sábado',
    odu_principal: {
      numero: 5,
      nome: 'Oxé',
    },
    odu_secundario: {
      numero: 9,
      nome: 'Ossá',
    },
    alinhamento_energetico: 'Fria / Magnética',
    significado_espiritual:
      'Dia das Grandes Mães e do amor incondicional. Oxé traz a doçura, o ouro e a feitiçaria natural — a lágrima que fecundou o mundo. Ossá ativa o vento, as transformações rápidas e o reino das Iyami (bruxas ancestrais). É o dia propício para trabalho com fertilidade, águas profundas, intuição geradora e feitiço natural.',
    associacoes_rituais: {
      ebos: [
        'Banhos de mel e caldas de frutas',
        'Sacudimentos com folhas de fumo ou pinhão roxo',
        'Acarajé para Iansã no vento',
        'Amor unconditional com Oxum e Iemanjá',
      ],
      elementos: ['Água', 'Ar'],
      direcoes: ['Sul', 'Norte'],
      cores: ['Rosa', 'Azul Escuro', 'Amarelo-ouro', 'Azul-celeste'],
      orixas_relacionados: ['Oxum', 'Iemanjá', 'Iansã'],
    },
  },
  'Domingo': {
    dia: 'Domingo',
    odu_principal: {
      numero: 6,
      nome: 'Obará',
    },
    odu_secundario: {
      numero: 8,
      nome: 'EjiOníle',
    },
    alinhamento_energetico: 'Quente / Radiante',
    significado_espiritual:
      'Dia do brilho pessoal, realeza e vitalidade. Obará traz a energia da riqueza, fartura e sabedoria — o rei que se veste de mendigo. EjiOníle ativa a liderança espiritual e o cuidado com o Ori. É o dia propício para recarregar a energia vital, focar no poder pessoal, no brilho próprio e na manifestação do sucesso.',
    associacoes_rituais: {
      ebos: [
        'Oferecer seis tipos de frutas',
        'Amalá para Xangô na vibração solar',
        'Bori espiritual com canjica branca',
        'Lâmpadas ou muitas velas brancas para Oxalá',
      ],
      elementos: ['Fogo', 'Ar', 'Luz'],
      direcoes: ['Oeste', 'Centro', 'Sul'],
      cores: ['Amarelo', 'Dourado', 'Branco', 'Vermelho'],
      orixas_relacionados: ['Xangô', 'Oxalá', 'Logun Edé'],
    },
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(DAY_ODU_MAPPINGS);
// Freeze nested objects
Object.values(DAY_ODU_MAPPINGS).forEach((mapping) => {
  Object.freeze(mapping.odu_principal);
  if (mapping.odu_secundario) {
    Object.freeze(mapping.odu_secundario);
  }
  Object.freeze(mapping.associacoes_rituais);
  Object.freeze(mapping.associacoes_rituais.ebos);
  Object.freeze(mapping.associacoes_rituais.elementos);
  Object.freeze(mapping.associacoes_rituais.direcoes);
  Object.freeze(mapping.associacoes_rituais.cores);
  Object.freeze(mapping.associacoes_rituais.orixas_relacionados);
});

/**
 * Get Odú Ifá correlation for a specific day of the week
 * @param dia - Day name (e.g., 'Segunda-feira', 'Terça-feira')
 * @returns The correlation mapping or null if not found
 */
export function getDayOdu(dia: string): DayOduMapping | null {
  return DAY_ODU_MAPPINGS[dia] ?? null;
}

/**
 * Get the day associated with a specific Odu
 * @param oduNome - Odu name (e.g., 'Okaran', 'Obará', 'Odi')
 * @returns The day name or null if not found
 */
export function getOduDay(oduNome: string): string | null {
  for (const [day, mapping] of Object.entries(DAY_ODU_MAPPINGS)) {
    if (
      mapping.odu_principal.nome === oduNome ||
      mapping.odu_secundario?.nome === oduNome
    ) {
      return day;
    }
  }
  return null;
}

/**
 * Get all available day-Odú mappings
 * @returns Array of all correlation mappings
 */
export function getAllDayOdus(): DayOduMapping[] {
  return Object.values(DAY_ODU_MAPPINGS);
}

/**
 * Get all days of the week
 * @returns Array of day names
 */
export function getAllDays(): string[] {
  return Object.keys(DAY_ODU_MAPPINGS);
}

/**
 * Check if a day exists in the mapping
 * @param dia - Day name to check
 * @returns True if day exists in mapping
 */
export function hasDayOdu(dia: string): boolean {
  return dia in DAY_ODU_MAPPINGS;
}

/**
 * Get Odu by number
 * @param numero - Odu number (1-16)
 * @returns The day mapping associated with that Odu number, or null if not found
 */
export function getDayByOduNumber(numero: number): DayOduMapping | null {
  for (const mapping of Object.values(DAY_ODU_MAPPINGS)) {
    if (
      mapping.odu_principal.numero === numero ||
      mapping.odu_secundario?.numero === numero
    ) {
      return mapping;
    }
  }
  return null;
}

/**
 * Get all Odu numbers present in the day mapping
 * @returns Array of unique Odu numbers
 */
export function getAllOduNumbers(): number[] {
  const numbers = new Set<number>();
  for (const mapping of Object.values(DAY_ODU_MAPPINGS)) {
    numbers.add(mapping.odu_principal.numero);
    if (mapping.odu_secundario) {
      numbers.add(mapping.odu_secundario.numero);
    }
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Get days associated with a specific Odu number
 * @param numero - Odu number (1-16)
 * @returns Array of day names
 */
export function getDaysByOduNumber(numero: number): string[] {
  const days: string[] = [];
  for (const [day, mapping] of Object.entries(DAY_ODU_MAPPINGS)) {
    if (
      mapping.odu_principal.numero === numero ||
      mapping.odu_secundario?.numero === numero
    ) {
      days.push(day);
    }
  }
  return days;
}

export default {
  getDayOdu,
  getOduDay,
  getAllDayOdus,
  getAllDays,
  hasDayOdu,
  getDayByOduNumber,
  getAllOduNumbers,
  getDaysByOduNumber,
  DAY_ODU_MAPPINGS,
};