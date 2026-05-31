/**
 * Odú-Ifá Solfeggio Frequency Correlation Module
 * Direct mappings of the 16 Odú Ifá (Merindilogun) to Solfeggio frequencies
 * With spiritual meaning for sound healing and ritual practice
 */

// ─── Type Definitions ────────────────────────────────────────────────────────

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra';

export interface HealingProperties {
  fisico: string;
  emocional: string;
  mental_espiritual: string;
  pratica: string;
}

export interface OduFrequencyMapping {
  /** Odu name in Portuguese */
  odu: string;
  /** Odu number (1-16) */
  numero: number;
  /** Odu name in English */
  nomeingles: string;
  /** Solfeggio frequency in Hz */
  frequencia: number;
  /** Primary element */
  elemento: Elemento;
  /** Energetic alignment description */
  alinhamento_energetico: string;
  /** Elemental qualities */
  qualidades: {
    temperatura: string;
    umidade: string;
    polaridade: string;
  };
  /** Spiritual meaning for sound healing */
  significado_espiritual: string;
  /** Ruling Orixá name */
  orixa: string;
  /** Sacred day */
  dia_sagrado: string;
  /** Associated colors */
  cores: string[];
  /** Associated chakra(s) */
  chakra: string[];
  /** Associated Kabbalistic Sephirah */
  sephirah: string;
  /** Healing properties for this frequency-Odu combination */
  propriedades_healing: HealingProperties;
  /** Ritual applications */
  aplicacoes_rituais: string[];
}

// ─── Solfeggio Frequencies ──────────────────────────────────────────────────

export const SOLFEGGIO_FREQUENCIES: readonly number[] = Object.freeze([174, 285, 396, 417, 528, 639, 741, 852, 963]);

// ─── Odú Ifá-to-Solfeggio Frequency Mapping (Merindilogun 1-16) ────────────

export const ODU_FREQUENCY_MAPPINGS: Record<string, OduFrequencyMapping> = Object.freeze({
  // ─── 1: Okaran (Okànràn) ───────────────────────────────────────────────────
  Okaran: {
    odu: 'Okaran',
    numero: 1,
    nomeingles: 'Life',
    frequencia: 174,
    elemento: 'Fogo',
    alinhamento_energetico: 'Funda as energias vitais e restaura a estrutura primordial do ser.',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    significado_espiritual: 'A frequência fundamental da existência. Estabelece a base para todas as outras frequências de cura.',
    orixa: 'Oxalá',
    dia_sagrado: 'Segunda-feira',
    cores: ['branco', 'ouro'],
    chakra: ['Muladhara', 'Sahasrara'],
    sephirah: 'Malkuth',
    propriedades_healing: {
      fisico: 'Alivia a dor, suporta a recuperação de lesões e fortalece o sistema imunológico.',
      emocional: 'Promove estabilidade emocional e reduz a ansiedade fundamental.',
      mental_espiritual: 'Abre通道 para consciência espiritual e conexão com o divino.',
      pratica: 'Use 174 Hz em práticas matutinas para estabelecer intenção sagrada.',
    },
    aplicacoes_rituais: [' Cura foundational', 'Purificação básica', 'Proteção energética'],
  },

  // ─── 2: Ejiokô ─────────────────────────────────────────────────────────────
  Ejiokô: {
    odu: 'Ejiokô',
    numero: 2,
    nomeingles: 'Twin',
    frequencia: 285,
    elemento: 'Água',
    alinhamento_energetico: 'Restaura e harmoniza as estruturas sutis do corpo energético.',
    qualidades: {
      temperatura: 'Morna',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    significado_espiritual: 'Harmonização das dualidades. Frequência da reconciliação e do equilíbrio interno.',
    orixa: 'Oxum',
    dia_sagrado: 'Sábado',
    cores: ['amarelo', 'azul celeste'],
    chakra: ['Svadhisthana'],
    sephirah: 'Yesod',
    propriedades_healing: {
      fisico: 'Estimula a regeneração celular e suporta a cura de tecidos.',
      emocional: 'Dissolve traumas emocionais e promove reconciliação interior.',
      mental_espiritual: 'Equilibra os opostos interiores e promove integração psíquica.',
      pratica: 'Use 285 Hz em práticas de meditação para harmonia emocional.',
    },
    aplicacoes_rituais: [' Harmonização de opostos', 'Cura emocional', 'Integração psicológica'],
  },

  // ─── 3: Etaogundá ──────────────────────────────────────────────────────────
  Etaogundá: {
    odu: 'Etaogundá',
    numero: 3,
    nomeingles: 'Third',
    frequencia: 396,
    elemento: 'Fogo',
    alinhamento_energetico: 'Liberta das correntes do passado e transforma padrões kármicos.',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    significado_espiritual: 'Libertação das vibrações densas. Transforma culpa e medo em amor e luz.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Domingo',
    cores: ['azul', 'branco'],
    chakra: ['Manipura', 'Anahata'],
    sephirah: 'Geburah',
    propriedades_healing: {
      fisico: 'Liberta bloqueios energéticos e promove desintoxicação profunda.',
      emocional: 'Remove padrões de culpa e medo que impedem o florescimento.',
      mental_espiritual: 'Dissolve barreiras kármicas e permite recomeçar com clareza.',
      pratica: 'Use 396 Hz para rituais de libertação e limpeza de padrões antigos.',
    },
    aplicacoes_rituais: ['Libertação de padrões', 'Cura kármica', 'Transformação de medo'],
  },

  // ─── 4: Ejilawn ─────────────────────────────────────────────────────────────
  Ejilawn: {
    odu: 'Ejilawn',
    numero: 4,
    nomeingles: 'Fourth',
    frequencia: 417,
    elemento: 'Água',
    alinhamento_energetico: 'Facilita mudanças e permite a transformação irreversível.',
    qualidades: {
      temperatura: 'Morna',
      umidade: 'Úmido',
      polaridade: 'Equilibrado',
    },
    significado_espiritual: 'Transmutação e facilitação. Abre o caminho para novas possibilidades.',
    orixa: 'Oxum',
    dia_sagrado: 'Sábado',
    cores: ['amarelo', 'verde'],
    chakra: ['Anahata', 'Vishuddha'],
    sephirah: 'Tiphereth',
    propriedades_healing: {
      fisico: 'Promove mudanças celulares positivas e renovação dos sistemas corporais.',
      emocional: 'Facilita a superação de situações complicadas e promove crescimento.',
      mental_espiritual: 'Remove bloqueios que impedem a evolução e abre novos caminhos.',
      pratica: 'Use 417 Hz quando enfrentando transições importantes na vida.',
    },
    aplicacoes_rituais: ['Facilitação de mudanças', 'Transmutação', 'Iniciação'],
  },

  // ─── 5: Oxé ────────────────────────────────────────────────────────────────
  Oxé: {
    odu: 'Oxé',
    numero: 5,
    nomeingles: 'Fifth',
    frequencia: 528,
    elemento: 'Fogo',
    alinhamento_energetico: 'Transforma e repara o DNA, restaurando a integridade espiritual.',
    qualidades: {
      temperatura: 'Muito quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    significado_espiritual: 'A frequência do milagre. Reparação do plano espiritual e físico.',
    orixa: 'Ogum',
    dia_sagrado: 'Terça-feira',
    cores: ['vermelho', 'laranja'],
    chakra: ['Manipura', 'Ajna'],
    sephirah: 'Chesed',
    propriedades_healing: {
      fisico: 'Repara DNA danificado, promove regeneração celular e fortalece vitalidade.',
      emocional: 'Promove amor incondicional e reconciliação com a vida.',
      mental_espiritual: 'Restauraconexão com a espiritualidade e desperta consciência superior.',
      pratica: 'Use 528 Hz para cura de doenças crônicas e rituais de transformação profunda.',
    },
    aplicacoes_rituais: ['Reparação do DNA', 'Milagres', 'Cura profunda'],
  },

  // ─── 6: Obará ───────────────────────────────────────────────────────────────
  Obará: {
    odu: 'Obará',
    numero: 6,
    nomeingles: 'Sixth',
    frequencia: 639,
    elemento: 'Terra',
    alinhamento_energetico: 'Promove harmonia relacional e reconciliação entre opostos.',
    qualidades: {
      temperatura: 'Neutra',
      umidade: 'Neutra',
      polaridade: 'Equilibrado',
    },
    significado_espiritual: 'Harmonização das relações humanas e divinas. Conexão comunitária.',
    orixa: 'Oxalá',
    dia_sagrado: 'Domingo',
    cores: ['branco', 'marrom'],
    chakra: ['Anahata'],
    sephirah: 'Netzach',
    propriedades_healing: {
      fisico: 'Harmoniza os sistemas do corpo e promove equilíbrio fisiológico.',
      emocional: 'Resolve conflitos interpessoais e promove perdão genuíno.',
      mental_espiritual: 'Promove compreensão mútua e harmonia em comunidades.',
      pratica: 'Use 639 Hz em rituais de reconciliação e cura de relacionamentos.',
    },
    aplicacoes_rituais: ['Harmonia relacional', 'Perdão', 'Comunidade'],
  },

  // ─── 7: Odi ────────────────────────────────────────────────────────────────
  Odi: {
    odu: 'Odi',
    numero: 7,
    nomeingles: 'Seventh',
    frequencia: 741,
    elemento: 'Água',
    alinhamento_energetico: 'Desperta a intuição e purifica a expressão criativa.',
    qualidades: {
      temperatura: 'Fresca',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    significado_espiritual: 'Despertar da percepção sutil. Expressão autêntica e criação sagrada.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira',
    cores: ['azul', 'branco'],
    chakra: ['Ajna', 'Sahasrara'],
    sephirah: 'Hod',
    propriedades_healing: {
      fisico: 'Purifica canais energéticos e melhora a comunicação celular.',
      emocional: 'Permite expressão autêntica e liberta medos de julgamento.',
      mental_espiritual: 'Desperta intuição e percepção para além do racional.',
      pratica: 'Use 741 Hz para práticas criativas e desenvolvimento da clarividência.',
    },
    aplicacoes_rituais: ['Despertar intuitivo', 'Expressão criativa', 'Purificação'],
  },

  // ─── 8: Ogbe ────────────────────────────────────────────────────────────────
  Ogbe: {
    odu: 'Ogbe',
    numero: 8,
    nomeingles: 'Eighth',
    frequencia: 852,
    elemento: 'Fogo',
    alinhamento_energetico: 'Desperta o terceiro olho e restaura a fé na luz interior.',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    significado_espiritual: 'Despertar espiritual e terceira eye. Conexão com a sabedoria divina.',
    orixa: 'Logun Ede',
    dia_sagrado: 'Sábado',
    cores: ['verde', 'ouro'],
    chakra: ['Ajna'],
    sephirah: 'Binah',
    propriedades_healing: {
      fisico: 'Estimula a glândula pineal e promove percepção extra-sensorial.',
      emocional: 'Dissipa ilusões e permite ver a verdade com clareza.',
      mental_espiritual: 'Desperta consciência espiritual e conexão com o divino.',
      pratica: 'Use 852 Hz para práticas de clarividência e despertar espiritual.',
    },
    aplicacoes_rituais: ['Despertar espiritual', 'Terceira eye', 'Fé restaurada'],
  },

  // ─── 9: Ossá ────────────────────────────────────────────────────────────────
  Ossá: {
    odu: 'Ossá',
    numero: 9,
    nomeingles: 'Ninth',
    frequencia: 963,
    elemento: 'Fogo',
    alinhamento_energetico: 'Ativa a glândula pineal e desperta a consciência divina.',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    significado_espiritual: 'Frequência da luz pura. Desperta a consciência cósmica e a unidade com o divino.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira',
    cores: ['vermelho', 'branco'],
    chakra: ['Sahasrara'],
    sephirah: 'Kether',
    propriedades_healing: {
      fisico: 'Ativa a glândula pineal e eleva a frequência do corpo.',
      emocional: 'Promove paz absoluta e acesso ao estado de graça.',
      mental_espiritual: 'Desperta consciência cósmica e unión con lo divino.',
      pratica: 'Use 963 Hz para rituais de elevação espiritual e conexión divine.',
    },
    aplicacoes_rituais: ['Iluminação', 'Consciência cósmica', 'Unidade divina'],
  },

  // ─── 10: Ofun ───────────────────────────────────────────────────────────────
  Ofun: {
    odu: 'Ofun',
    numero: 10,
    nomeingles: 'Tenth',
    frequencia: 528,
    elemento: 'Água',
    alinhamento_energetico: 'Reparação do plano espiritual e restauração da integridade da alma.',
    qualidades: {
      temperatura: 'Morna',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    significado_espiritual: 'A frequência do amor e da regeneração. Repara o que foi quebrado.',
    orixa: 'Oxalá',
    dia_sagrado: 'Segunda-feira',
    cores: ['branco', 'cinza'],
    chakra: ['Anahata', 'Ajna'],
    sephirah: 'Chokhmah',
    propriedades_healing: {
      fisico: 'Repara estruturas celulares e promove rejuvenescimento profundo.',
      emocional: 'Abre o coração para amor incondicional e autocompaixão.',
      mental_espiritual: 'Restaura integridade da alma e conexão com o eu superior.',
      pratica: 'Use 528 Hz para cura de traumas e práticas de regeneração espiritual.',
    },
    aplicacoes_rituais: ['Amor incondicional', 'Regeneração', 'Reparação espiritual'],
  },

  // ─── 11: Ojuani ─────────────────────────────────────────────────────────────
  Ojuani: {
    odu: 'Ojuani',
    numero: 11,
    nomeingles: 'Eleventh',
    frequencia: 396,
    elemento: 'Terra',
    alinhamento_energetico: 'Libertação profunda das correntes do passado e das limitações.',
    qualidades: {
      temperatura: 'Fresca',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    significado_espiritual: 'Transformação das sombras. Liberta medos e permite renascimento.',
    orixa: 'Nanã Buruku',
    dia_sagrado: 'Terça-feira',
    cores: ['roxo', 'preto'],
    chakra: ['Muladhara', 'Ajna'],
    sephirah: 'Malkuth',
    propriedades_healing: {
      fisico: 'Liberta bloqueios enraizados e promove desintoxicação profunda.',
      emocional: 'Remove medos ancestrais e permite renascimento emocional.',
      mental_espiritual: 'Transforma sombras em luz e promove transformação integral.',
      pratica: 'Use 396 Hz para rituais de renascimento e limpeza de linhagem.',
    },
    aplicacoes_rituais: ['Libertação profunda', 'Renascimento', 'Transformação de sombras'],
  },

  // ─── 12: Ejilsebora ─────────────────────────────────────────────────────────
  Ejilsebora: {
    odu: 'Ejilsebora',
    numero: 12,
    nomeingles: 'Twelfth',
    frequencia: 417,
    elemento: 'Terra',
    alinhamento_energetico: 'Facilitação de mudanças irreversíveis e evolução espiritual.',
    qualidades: {
      temperatura: 'Neutra',
      umidade: 'Neutra',
      polaridade: 'Equilibrado',
    },
    significado_espiritual: 'Evolução e facilitação. Abre portais para novas dimensões de consciência.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Domingo',
    cores: ['azul', 'verde'],
    chakra: ['Vishuddha', 'Sahasrara'],
    sephirah: 'Yesod',
    propriedades_healing: {
      fisico: 'Promove adaptações celulares e evolução do corpo físico.',
      emocional: 'Facilita transições emocionais profundas e crescimento.',
      mental_espiritual: 'Abre portais para dimensões superiores de consciência.',
      pratica: 'Use 417 Hz para rituais de evolução e navegação de mudanças.',
    },
    aplicacoes_rituais: ['Evolução espiritual', 'Facilitação', 'Mudança irreversível'],
  },

  // ─── 13: Olobón ─────────────────────────────────────────────────────────────
  Olobón: {
    odu: 'Olobón',
    numero: 13,
    nomeingles: 'Thirteenth',
    frequencia: 741,
    elemento: 'Ar',
    alinhamento_energetico: 'Expressão criativa purificada e inspiração divina.',
    qualidades: {
      temperatura: 'Morna',
      umidade: 'Neutra',
      polaridade: 'Equilibrado',
    },
    significado_espiritual: 'Criação sagrada e expressão autêntica. Canaliza a luz divina.',
    orixa: 'Oxum',
    dia_sagrado: 'Sábado',
    cores: ['amarelo', 'verde'],
    chakra: ['Vishuddha', 'Ajna'],
    sephirah: 'Tiphereth',
    propriedades_healing: {
      fisico: 'Purifica cordas vocais e canais de expressão criativa.',
      emocional: 'Promove expressão autêntica e liberta bloqueios criativos.',
      mental_espiritual: 'Canaliza inspiração divina e desperta criatividade sagrada.',
      pratica: 'Use 741 Hz para práticas artísticas e rituais de criação sagrada.',
    },
    aplicacoes_rituais: ['Criação sagrada', 'Expressão autêntica', 'Inspiração'],
  },

  // ─── 14: Iká ────────────────────────────────────────────────────────────────
  Iká: {
    odu: 'Iká',
    numero: 14,
    nomeingles: 'Fourteenth',
    frequencia: 852,
    elemento: 'Fogo',
    alinhamento_energetico: 'Despertar da intuição espiritual e percepção além dos sentidos.',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    significado_espiritual: 'Discernimento espiritual e terceira eye desperta. Clareza na escuridão.',
    orixa: 'Ogum',
    dia_sagrado: 'Terça-feira',
    cores: ['vermelho', 'preto'],
    chakra: ['Ajna', 'Muladhara'],
    sephirah: 'Geburah',
    propriedades_healing: {
      fisico: 'Estimula a glândula pineal e desenvolve percepção extrasensorial.',
      emocional: 'Promove discernimento e clareza em decisões espirituais.',
      mental_espiritual: 'Desperta terceira eye e percepção além dos sentidos físicos.',
      pratica: 'Use 852 Hz para práticas de clarividência e discernimento espiritual.',
    },
    aplicacoes_rituais: ['Terceira eye', 'Discernimento', 'Percepção espiritual'],
  },

  // ─── 15: Meji ────────────────────────────────────────────────────────────────
  Meji: {
    odu: 'Meji',
    numero: 15,
    nomeingles: 'Fifteenth',
    frequencia: 963,
    elemento: 'Ar',
    alinhamento_energetico: 'Unidade espiritual e acesso ao estado de graça divina.',
    qualidades: {
      temperatura: 'Morna',
      umidade: 'Neutra',
      polaridade: 'Equilibrado',
    },
    significado_espiritual: 'Completude e iluminação. Acesso direto à consciência divina.',
    orixa: 'Oxalá',
    dia_sagrado: 'Segunda-feira',
    cores: ['branco', 'prata'],
    chakra: ['Sahasrara'],
    sephirah: 'Kether',
    propriedades_healing: {
      fisico: 'Elava a frequência vibracional do corpo para estado de graça.',
      emocional: 'Promove paz absoluta e acesso ao estado de beatitude.',
      mental_espiritual: 'Abre canal direto para consciência divina e unidade.',
      pratica: 'Use 963 Hz para rituais de iluminação e práticas de unidade divina.',
    },
    aplicacoes_rituais: ['Iluminação', 'Unidade divina', 'Estado de graça'],
  },

  // ─── 16: Alafia ────────────────────────────────────────────────────────────
  Alafia: {
    odu: 'Alafia',
    numero: 16,
    nomeingles: 'Peace',
    frequencia: 963,
    elemento: 'Ar',
    alinhamento_energetico: 'Frequência da paz absoluta e harmonia universal.',
    qualidades: {
      temperatura: 'Morna',
      umidade: 'Neutra',
      polaridade: 'Yin',
    },
    significado_espiritual: 'Paz interior e harmonia. Culminación del camino espiritual.',
    orixa: 'Oxalá',
    dia_sagrado: 'Domingo',
    cores: ['branco', 'verde'],
    chakra: ['Anahata', 'Sahasrara'],
    sephirah: 'Chesed',
    propriedades_healing: {
      fisico: 'Promove harmonia nos sistemas corporais e bem-estar geral.',
      emocional: 'Promove paz interior absoluta e harmonia com o universo.',
      mental_espiritual: 'Desperta consciência de unidade e paz universal.',
      pratica: 'Use 963 Hz para rituais de paz, harmonia e conclusão sagrada.',
    },
    aplicacoes_rituais: ['Paz absoluta', 'Harmonia', 'Conclusão espiritual'],
  },
});

// ─── Lookup Functions ────────────────────────────────────────────────────────

/**
 * Get Odu-Solfeggio frequency correlation mapping
 * @param odu - Odu name (case-sensitive)
 * @returns OduFrequencyMapping or null if not found
 */
export function getOduFrequency(odu: string): OduFrequencyMapping | null {
  return ODU_FREQUENCY_MAPPINGS[odu] ?? null;
}

/**
 * Get Solfeggio frequency for a given Odu name
 * @param odu - Odu name (case-sensitive)
 * @returns Frequency in Hz or null if not found
 */
export function getFrequencyByOduName(odu: string): number | null {
  return ODU_FREQUENCY_MAPPINGS[odu]?.frequencia ?? null;
}

/**
 * Get all Odus for a given Solfeggio frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Array of OduFrequencyMapping for that frequency
 */
export function getFrequencyOdu(frequencia: number): OduFrequencyMapping[] {
  return Object.values(ODU_FREQUENCY_MAPPINGS)
    .filter((m) => m.frequencia === frequencia)
    .sort((a, b) => a.numero - b.numero);
}

/**
 * Get all Odu-Solfeggio frequency mappings
 * @returns Array of all mappings sorted by Odu number
 */
export function getAllOduFrequencies(): OduFrequencyMapping[] {
  return Object.values(ODU_FREQUENCY_MAPPINGS).sort(
    (a, b) => a.numero - b.numero
  );
}

/**
 * Get all Odu names
 * @returns Array of Odu names sorted by Odu number
 */
export function getAllOduNames(): string[] {
  return Object.values(ODU_FREQUENCY_MAPPINGS)
    .sort((a, b) => a.numero - b.numero)
    .map((m) => m.odu);
}

/**
 * Check if an Odu name exists
 * @param odu - Odu name to check
 * @returns True if Odu exists in mapping
 */
export function hasOduFrequency(odu: string): boolean {
  return odu in ODU_FREQUENCY_MAPPINGS;
}

/**
 * Get Odu mapping by number (1-16)
 * @param numero - Odu number
 * @returns OduFrequencyMapping or null if not found
 */
export function getOduByNumber(numero: number): OduFrequencyMapping | null {
  for (const mapping of Object.values(ODU_FREQUENCY_MAPPINGS)) {
    if (mapping.numero === numero) {
      return mapping;
    }
  }
  return null;
}

/**
 * Get all Odus for a given element
 * @param elemento - Element type
 * @returns Array of OduFrequencyMapping for that element
 */
export function getOdusForElement(elemento: Elemento): OduFrequencyMapping[] {
  return Object.values(ODU_FREQUENCY_MAPPINGS)
    .filter((m) => m.elemento === elemento)
    .sort((a, b) => a.numero - b.numero);
}

/**
 * Get unique frequencies for a given element
 * @param elemento - Element type
 * @returns Array of unique frequencies sorted in ascending order
 */
export function getFrequenciesForElement(elemento: Elemento): number[] {
  const frequencies = new Set<number>();
  Object.values(ODU_FREQUENCY_MAPPINGS)
    .filter((m) => m.elemento === elemento)
    .forEach((m) => frequencies.add(m.frequencia));
  return Array.from(frequencies).sort((a, b) => a - b);
}

/**
 * Get element for a given Odu name
 * @param odu - Odu name (case-sensitive)
 * @returns Element type or null if not found
 */
export function getElementByOdu(odu: string): Elemento | null {
  return ODU_FREQUENCY_MAPPINGS[odu]?.elemento ?? null;
}

/**
 * Get healing properties for a given Odu name
 * @param odu - Odu name (case-sensitive)
 * @returns HealingProperties or null if not found
 */
export function getHealingProperties(odu: string): HealingProperties | null {
  return ODU_FREQUENCY_MAPPINGS[odu]?.propriedades_healing ?? null;
}

/**
 * Get all used Solfeggio frequencies in ascending order
 * @returns Array of unique frequencies
 */
export function getUsedFrequencies(): number[] {
  const frequencies = new Set<number>(
    Object.values(ODU_FREQUENCY_MAPPINGS).map((m) => m.frequencia)
  );
  return Array.from(frequencies).sort((a, b) => a - b);
}

// ─── Default Export ───────────────────────────────────────────────────────────

export default {
  getOduFrequency,
  getFrequencyByOduName,
  getFrequencyOdu,
  getAllOduFrequencies,
  getAllOduNames,
  hasOduFrequency,
  getOduByNumber,
  getOdusForElement,
  getFrequenciesForElement,
  getElementByOdu,
  getHealingProperties,
  getUsedFrequencies,
  ODU_FREQUENCY_MAPPINGS,
  SOLFEGGIO_FREQUENCIES,
};