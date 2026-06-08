/**
 * Odú Ifá-to-Element Correlation Mapping
 * Based on Cabala dos Caminhos spiritual system
 * Maps each Odu Ifá (Merindilogun 16) to its corresponding element
 * and provides comprehensive spiritual correlations
 */

export type Elemento = 'Fogo' | 'Água' | 'Terra' | 'Ar';

export interface ElementQualities {
  qualidade: 'Yang (Exterior)' | 'Yin (Interior)' | 'Neutro (Equilibrado)';
  temperamento: string;
  natureza: 'Transformador' | 'Receptivo' | 'Estruturante' | 'Comunicativo';
}

export interface OduElementMapping {
  /** Odu name (Portuguese) */
  odu: string;
  /** Odu number (1-16) */
  numero: number;
  /** Primary element */
  elemento: Elemento;
  /** Element qualities */
  qualidades_elementares: ElementQualities;
  /** Spiritual significance of element in this Odu */
  significado_elementar: string;
  /** Primary Orixá correspondent */
  orixa: string;
  /** Sacred day */
  dia_sagrado: string;
  /** Chakra correspondent */
  chakra: string;
  /** Chakra type for element correlations */
  tipo_chakra: 'Raiz' | 'Sacral' | 'Solar' | 'Cardíaco' | 'Laríngeo' | 'Frontal' | 'Coronário';
  /** Associated metals */
  metais: string[];
  /** Elemental directions */
  direcoes_elementares: string[];
  /** Ritual offerings */
  oferendas: string[];
  /** Affinities */
  afinidades: string[];
  /** Elemental vibrations */
  vibracoes: string[];
}

// ─── Odú Ifá-to-Element Mapping ─────────────────────────────────────────────────

export const ODU_ELEMENT_MAPPINGS: Record<string, OduElementMapping> = {
  // ─── TERRA (Estrutura/Grounding) ─────────────────────────────────────────────
  Okaran: {
    odu: 'Okaran',
    numero: 1,
    elemento: 'Terra',
    qualidades_elementares: {
      qualidade: 'Yin (Interior)',
      temperamento: 'Melancólico',
      natureza: 'Estruturante',
    },
    significado_elementar:
      'Terra representa a师长 que traz provas necessárias para o crescimento. O peso da Terra ensina disciplina e perseverança, a estruturação que transforma o粗o em refinamento espiritual através da paciência.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    chakra: '1º Básico (Muladhara)',
    tipo_chakra: 'Raiz',
    metais: ['Chumbo', 'Ferro'],
    direcoes_elementares: ['Norte', 'Centro'],
    oferendas: ['Milho', 'Pipoca', 'Eruwá', 'Gelo'],
    afinidades: [
      'Sistema ósseo',
      'Chakra Básico (Muladhara)',
      'Sistema digestivo',
      'Conexão com ancestrais',
      'Disciplina e perseverança',
      'Grounding e estabilidade',
    ],
    vibracoes: [
      'Denso',
      'Estruturante',
      'Transformador',
      'Kármico',
      'Providente',
    ],
  },

  // ─── AR (Comunicação/Ligação) ─────────────────────────────────────────────────
  Ejiokô: {
    odu: 'Ejiokô',
    numero: 2,
    elemento: 'Ar',
    qualidades_elementares: {
      qualidade: 'Neutro (Equilibrado)',
      temperamento: 'Sanguíneo',
      natureza: 'Comunicativo',
    },
    significado_elementar:
      'Ar representa a mente que conecta o céu e a terra. O sopro de Ejiokô traz a dualidade sagrada, o equilíbrio entre extremos e a sabedoria de navegar entre opostos com agilidade mental.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira',
    chakra: '5º Laríngeo (Vishuddha)',
    tipo_chakra: 'Laríngeo',
    metais: ['Mercúrio', 'Prata'],
    direcoes_elementares: ['Leste', 'Centro'],
    oferendas: ['Frutas frescas', 'Mel', 'Água de cheiro'],
    afinidades: [
      'Sistema respiratório',
      'Chakra Laríngeo (Vishuddha)',
      'Sistema nervoso',
      'Discernimento e sabedoria',
      'Comunicação e negociação',
      'Equilíbrio dual',
    ],
    vibracoes: [
      'Neutro',
      'Equilibrado',
      'Comunicativo',
      'Mental',
      'Versátil',
    ],
  },

  // ─── FOGO (Transformação/Ação) ────────────────────────────────────────────────
  Etaogundá: {
    odu: 'Etaogundá',
    numero: 3,
    elemento: 'Fogo',
    qualidades_elementares: {
      qualidade: 'Yang (Exterior)',
      temperamento: 'Colérico',
      natureza: 'Transformador',
    },
    significado_elementar:
      'Fogo representa a criação de ferramentas e o poder de cortar para construir. A chama de Etaogundá traz a energia de combate aos obstáculos, a coragem de iniciar jornadas e a força vital que transforma o caos em ordem.',
    orixa: 'Ogum',
    dia_sagrado: 'Terça-feira',
    chakra: '3º Plexo Solar (Manipura)',
    tipo_chakra: 'Solar',
    metais: ['Ferro', 'Aço'],
    direcoes_elementares: ['Oeste', 'Sul'],
    oferendas: ['Mel', 'Pimenta', 'Azeite de dendê', 'Gengibre'],
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (Manipura)',
      'Sistema muscular',
      'Criatividade e inovação',
      'Coragem e determinação',
      'Poder de transformação',
    ],
    vibracoes: [
      'Quente',
      'Transformador',
      'Criativo',
      'ígneo',
      'Combativo',
    ],
  },

  // ─── ÁGUA (Intuição/Receptividade) ───────────────────────────────────────────
  Irosun: {
    odu: 'Irosun',
    numero: 4,
    elemento: 'Água',
    qualidades_elementares: {
      qualidade: 'Yin (Interior)',
      temperamento: 'Fleumático',
      natureza: 'Receptivo',
    },
    significado_elementar:
      'Água representa a alma, os ciclos e a sabedoria emocional. As águas de Irosun trazem a visão espiritual, a percepção do mundo sutil e a conexão com ancestrais através da profundidade emocional.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira',
    chakra: '6º Frontal (Ajna)',
    tipo_chakra: 'Frontal',
    metais: ['Prata', 'Platina'],
    direcoes_elementares: ['Norte', 'Centro'],
    oferendas: ['Água mineral', 'Flores brancas', 'Mironga', 'Acareação'],
    afinidades: [
      'Sistema linfático',
      'Chakra Frontal (Ajna)',
      'Sistema hormonal',
      'Intuição e clarividência',
      'Conexão com ancestrais',
      'Sensibilidade emocional',
    ],
    vibracoes: [
      'Frio',
      'Receptivo',
      'Profundo',
      'Maternal',
      'Oculto',
    ],
  },

  // ─── FOGO (Expansão/Abundância) ───────────────────────────────────────────────
  Oxé: {
    odu: 'Oxé',
    numero: 5,
    elemento: 'Fogo',
    qualidades_elementares: {
      qualidade: 'Yang (Exterior)',
      temperamento: 'Sanguíneo',
      natureza: 'Transformador',
    },
    significado_elementar:
      'Fogo representa a fartura cósmica e o conhecimento dos mestres. A chama de Oxé confere magnetismo, doçura e a energia da feitiçaria natural que expande a consciência e atrai prosperidade.',
    orixa: 'Oxóssi',
    dia_sagrado: 'Quinta-feira',
    chakra: '4º Cardíaco (Anahata)',
    tipo_chakra: 'Cardíaco',
    metais: ['Ouro', 'Cobre'],
    direcoes_elementares: ['Sul', 'Centro'],
    oferendas: ['Mel', 'Canela', 'Fumo de rolo', 'Alfarroba'],
    afinidades: [
      'Coração e sistema circulatório',
      'Chakra Cardíaco (Anahata)',
      'Sistema hepático',
      'Carisma e magnetismo',
      'Abundância e prosperidade',
      'Sabedoria sagrada',
    ],
    vibracoes: [
      'Quente',
      'Expansivo',
      'Abundante',
      'Magnético',
      'Fertilizante',
    ],
  },

  // ─── FOGO (Vitalidade/Liderança) ─────────────────────────────────────────────
  Obará: {
    odu: 'Obará',
    numero: 6,
    elemento: 'Fogo',
    qualidades_elementares: {
      qualidade: 'Yang (Exterior)',
      temperamento: 'Colérico',
      natureza: 'Transformador',
    },
    significado_elementar:
      'Fogo representa o núcleo do ser e a essência divina. O brilho solar de Obará ilumina o caminho, confere realeza interior e o poder de manifestar abundância através da luz interior.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    chakra: '3º Plexo Solar (Manipura)',
    tipo_chakra: 'Solar',
    metais: ['Aço', 'Ferro'],
    direcoes_elementares: ['Oeste', 'Centro'],
    oferendas: ['Pimenta', 'Gengibre', 'Kankere', 'Milho torrado'],
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (Manipura)',
      'Sistema metabólico',
      'Carisma e magnetismo pessoal',
      'Liderança e criatividade',
      'Poder de manifestação',
    ],
    vibracoes: [
      'Quente',
      'Solar',
      'Brilhante',
      'Radiante',
      'Manifestador',
    ],
  },

  // ─── ÁGUA (Transmutação/Oculto) ───────────────────────────────────────────────
  Odi: {
    odu: 'Odi',
    numero: 7,
    elemento: 'Água',
    qualidades_elementares: {
      qualidade: 'Yin (Interior)',
      temperamento: 'Fleumático',
      natureza: 'Receptivo',
    },
    significado_elementar:
      'Água representa o poço profundo dos mistérios ocultos. As águas de Odi ensinam a coragem de enfrentar o que está oculto, a transformação do impuro em puro e o renascimento após ciclos difíceis.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    chakra: '6º Frontal (Ajna)',
    tipo_chakra: 'Frontal',
    metais: ['Chumbo', 'Prata escura'],
    direcoes_elementares: ['Norte', 'Sul'],
    oferendas: ['Gelo', 'Eruwá', 'Pipoca', 'Água de oxum'],
    afinidades: [
      'Sistema linfático',
      'Chakra Frontal (Ajna)',
      'Sistema reprodutivo',
      'Intuição e percepção oculta',
      'Capacidade de transformação',
      'Sabedoria dos mistérios',
    ],
    vibracoes: [
      'Frio',
      'Oculto',
      'Transmutador',
      'Profundo',
      'Renovador',
    ],
  },

  // ─── ÁGUA (Harmonia/Limpeza) ─────────────────────────────────────────────────
  EjiOnile: {
    odu: 'EjiOnile',
    numero: 8,
    elemento: 'Água',
    qualidades_elementares: {
      qualidade: 'Yin (Interior)',
      temperamento: 'Fleumático',
      natureza: 'Receptivo',
    },
    significado_elementar:
      'Água representa o amor incondicional e a harmonia divina. As águas de EjiOnile trazem a limpeza emocional, a paz absoluta e a capacidade de magnetizar experiências de serenidade através da频道.',
    orixa: 'Oxalá',
    dia_sagrado: 'Sexta-feira / Sábado',
    chakra: '4º Cardíaco (Anahata)',
    tipo_chakra: 'Cardíaco',
    metais: ['Prata', 'Ouro branco'],
    direcoes_elementares: ['Centro', 'Leste'],
    oferendas: ['Leite', 'Acarajé', 'Frutas brancas', 'água de flor'],
    afinidades: [
      'Coração e sistema circulatório',
      'Chakra Cardíaco (Anahata)',
      'Sistema renal',
      'Amor e compaixão',
      'Alinhamento espiritual',
      'Paz e harmonia',
    ],
    vibracoes: [
      'Frio',
      'Magnético',
      'Doce',
      'Purificador',
      'Harmonizador',
    ],
  },

  // ─── AR (Transformação/Mudança) ─────────────────────────────────────────────
  Ossá: {
    odu: 'Ossá',
    numero: 9,
    elemento: 'Ar',
    qualidades_elementares: {
      qualidade: 'Neutro (Equilibrado)',
      temperamento: 'Sanguíneo',
      natureza: 'Comunicativo',
    },
    significado_elementar:
      'Ar representa a mente que muda rapidamente. O sopro de Ossá traz transformações ágeis, o poder feminino das Iyami e a comunicação com mundos superiores através da agilidade mental.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira',
    chakra: '5º Laríngeo (Vishuddha)',
    tipo_chakra: 'Laríngeo',
    metais: ['Mercúrio', 'Alumínio'],
    direcoes_elementares: ['Leste', 'Centro'],
    oferendas: ['Fumo', 'Mel', 'Goma', 'Água de cheiro'],
    afinidades: [
      'Sistema respiratório',
      'Chakra Laríngeo (Vishuddha)',
      'Sistema nervoso',
      'Capacidade de transformação rápida',
      'Comunicação e expressão',
      'Conexão com orixás femininos',
    ],
    vibracoes: [
      'Neutro',
      'Transformador',
      'Rápido',
      'Mutável',
      'Flexível',
    ],
  },

  // ─── ÁGUA (Cura/Profundidade) ────────────────────────────────────────────────
  Ofun: {
    odu: 'Ofun',
    numero: 10,
    elemento: 'Água',
    qualidades_elementares: {
      qualidade: 'Yin (Interior)',
      temperamento: 'Fleumático',
      natureza: 'Receptivo',
    },
    significado_elementar:
      'Água representa as águas profundas do inconsciente. Ofun traz a cura através da paciência e do silêncio, a sabedoria interior da escuta silenciosa e a cura que flui como rio manso.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira / Sábado',
    chakra: '6º Frontal (Ajna)',
    tipo_chakra: 'Frontal',
    metais: ['Prata', 'Cristal'],
    direcoes_elementares: ['Norte', 'Sul'],
    oferendas: ['Água de aluá', 'Biscoito de amenim', 'Flores', 'Perfume'],
    afinidades: [
      'Sistema linfático',
      'Chakra Frontal (Ajna)',
      'Sistema hormonal',
      'Sensibilidade emocional',
      'Capacidade de cura',
      'Sabedoria do silêncio',
    ],
    vibracoes: [
      'Frio',
      'Receptivo',
      'Profundo',
      'Curativo',
      'Maternal',
    ],
  },

  // ─── AR (Elevação/Pensamento) ───────────────────────────────────────────────
  Alafia: {
    odu: 'Alafia',
    numero: 11,
    elemento: 'Ar',
    qualidades_elementares: {
      qualidade: 'Neutro (Equilibrado)',
      temperamento: 'Sanguíneo',
      natureza: 'Comunicativo',
    },
    significado_elementar:
      'Ar representa o pensamento iluminado que transcende opostos. O sopro de Alafia traz paz absoluta e a confirmação dos Deuses através da harmonia entre luz e sombra.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira / Terça-feira',
    chakra: '5º Laríngeo (Vishuddha)',
    tipo_chakra: 'Laríngeo',
    metais: ['Mercúrio', 'Prata'],
    direcoes_elementares: ['Leste', 'Centro'],
    oferendas: ['Mel', 'Fumo', 'Frutas', 'Água de cheiro'],
    afinidades: [
      'Sistema respiratório',
      'Chakra Laríngeo (Vishuddha)',
      'Sistema nervoso',
      'Capacidade de comunicação',
      'Paz e harmonia',
      'Elevação espiritual',
    ],
    vibracoes: [
      'Neutro',
      'Equilibrado',
      'Elevado',
      'Pacificador',
      'Transcendente',
    ],
  },

  // ─── FOGO (Purificação/Guerra) ──────────────────────────────────────────────
  Ejilsebora: {
    odu: 'Ejilsebora',
    numero: 12,
    elemento: 'Fogo',
    qualidades_elementares: {
      qualidade: 'Yang (Exterior)',
      temperamento: 'Colérico',
      natureza: 'Transformador',
    },
    significado_elementar:
      'Fogo representa o brilho purificador e a guerra justa. A chama de Ejilsebora ilumina os caminhos, traz determinação inabalável e a força vital que transforma o caos em ordem.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    chakra: '3º Plexo Solar (Manipura)',
    tipo_chakra: 'Solar',
    metais: ['Ferro', 'Aço'],
    direcoes_elementares: ['Oeste', 'Centro'],
    oferendas: ['Pimenta', 'Kankere', 'Milho torrado', 'Gengibre'],
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (Manipura)',
      'Sistema metabólico',
      'Espírito de liderança',
      'Coragem e proteção',
      'Fogo purificador',
    ],
    vibracoes: [
      'Quente',
      'ígneo',
      'Radiante',
      'Purificador',
      'Guerreiro',
    ],
  },

  // ─── TERRA (Transformação/Físico) ───────────────────────────────────────────
  Olobón: {
    odu: 'Olobón',
    numero: 13,
    elemento: 'Terra',
    qualidades_elementares: {
      qualidade: 'Yin (Interior)',
      temperamento: 'Melancólico',
      natureza: 'Estruturante',
    },
    significado_elementar:
      'Terra representa a transformação física e a renovação do corpo. A solidez de Olobón traz a limpeza kármica, a renovação através da paciência e a sabedoria do corpo.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    chakra: '1º Básico (Muladhara)',
    tipo_chakra: 'Raiz',
    metais: ['Chumbo', 'Ferro'],
    direcoes_elementares: ['Norte', 'Centro'],
    oferendas: ['Milho', 'Pipoca', 'Eruwá', 'Gelo'],
    afinidades: [
      'Sistema ósseo',
      'Chakra Básico (Muladhara)',
      'Sistema digestivo',
      'Resiliência física',
      'Sabedoria do corpo',
      'Renovação kármica',
    ],
    vibracoes: [
      'Denso',
      'Transformador',
      'Físico',
      'Kármico',
      'Renovador',
    ],
  },

  // ─── TERRA (Revelação/Renovação) ────────────────────────────────────────────
  Iká: {
    odu: 'Iká',
    numero: 14,
    elemento: 'Terra',
    qualidades_elementares: {
      qualidade: 'Yin (Interior)',
      temperamento: 'Melancólico',
      natureza: 'Estruturante',
    },
    significado_elementar:
      'Terra representa a sabedoria da serpente que renova sua pele. Iká revela a capacidade de descascar o velho para revelar o novo, ensinando que a renovação exige soltar o antigo.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    chakra: '1º Básico (Muladhara)',
    tipo_chakra: 'Raiz',
    metais: ['Chumbo', 'Ferro oxidado'],
    direcoes_elementares: ['Norte', 'Centro'],
    oferendas: ['Milho', 'Pipoca', 'Eruwá', 'Inhame'],
    afinidades: [
      'Sistema ósseo',
      'Chakra Básico (Muladhara)',
      'Sistema digestivo',
      'Sabedoria ancestral',
      'Capacidade de renovação',
      'Transformação da pele',
    ],
    vibracoes: [
      'Denso',
      'Revelador',
      'Renovador',
      'Ancestral',
      'Serpentino',
    ],
  },

  // ─── TERRA (Dedicação/Guerreira) ────────────────────────────────────────────
  Obá: {
    odu: 'Obá',
    numero: 15,
    elemento: 'Terra',
    qualidades_elementares: {
      qualidade: 'Yang (Exterior)',
      temperamento: 'Colérico',
      natureza: 'Estruturante',
    },
    significado_elementar:
      'Terra representa a energia guerreira da dedicação amorosa. A força de Obá manifesta-se como a guerreira devotada, a limpeza das negatividades e a proteção através da devoção.',
    orixa: 'Obá',
    dia_sagrado: 'Sexta-feira',
    chakra: '3º Plexo Solar (Manipura)',
    tipo_chakra: 'Solar',
    metais: ['Cobre', 'Bronze'],
    direcoes_elementares: ['Oeste', 'Sul'],
    oferendas: ['Azeite de dendê', 'Vick Vaporub', 'Pimenta', 'Quiabo'],
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (Manipura)',
      'Sistema muscular',
      'Dedicação e lealdade',
      'Proteção e guarda',
      'Força guerreira',
    ],
    vibracoes: [
      'Quente',
      'Transformador',
      'Guerreiro',
      'Devotado',
      'Protetor',
    ],
  },

  // ─── AR (Elevação/Paz) ───────────────────────────────────────────────────────
  Oyekun: {
    odu: 'Oyekun',
    numero: 16,
    elemento: 'Ar',
    qualidades_elementares: {
      qualidade: 'Neutro (Equilibrado)',
      temperamento: 'Sanguíneo',
      natureza: 'Comunicativo',
    },
    significado_elementar:
      'Ar representa a expansão da consciência espiritual e a paz que transcende conflitos. O sopro de Oyekun traz a confirmação dos Deuses e a bênção dos mestres para todos os caminhos.',
    orixa: 'Oxalá',
    dia_sagrado: 'Sexta-feira / Domingo',
    chakra: '7º Coronário (Sahasrara)',
    tipo_chakra: 'Coronário',
    metais: ['Ouro', 'Prata'],
    direcoes_elementares: ['Centro', 'Leste', 'Oeste'],
    oferendas: ['Leite', 'Farinhas', 'Acarajé', 'Água de aluá'],
    afinidades: [
      'Sistema nervoso',
      'Chakra Coronário (Sahasrara)',
      'Sistema respiratório',
      'Sabedoria espiritual',
      'Paz e harmonia',
      'Conexão divina',
    ],
    vibracoes: [
      'Neutro',
      'Elevado',
      'Pacificador',
      'Espiritual',
      'Divino',
    ],
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(ODU_ELEMENT_MAPPINGS);
// Freeze nested objects
Object.values(ODU_ELEMENT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Odu-to-element correlation mapping
 * @param odu - Odu name (e.g., 'Ejilsebora', 'Ofun', 'Alafia', 'Okaran')
 * @returns The correlation mapping or null if not found
 */
export function getOduElement(odu: string): OduElementMapping | null {
  return ODU_ELEMENT_MAPPINGS[odu] ?? null;
}

/**
 * Get all Odus for a specific element
 * @param elemento - Element name ('Fogo', 'Água', 'Terra', 'Ar')
 * @returns Array of Odu mappings for that element
 */
export function getElementOdu(elemento: string): OduElementMapping[] {
  return Object.values(ODU_ELEMENT_MAPPINGS)
    .filter(mapping => mapping.elemento === elemento)
    .sort((a, b) => a.numero - b.numero);
}

/**
 * Get all available Odu-element mappings
 * @returns Array of all correlation mappings
 */
export function getAllOduElements(): OduElementMapping[] {
  return Object.values(ODU_ELEMENT_MAPPINGS);
}

/**
 * Get all Odu names
 * @returns Array of Odu names (sorted by number)
 */
export function getAllOduNames(): string[] {
  return Object.values(ODU_ELEMENT_MAPPINGS)
    .sort((a, b) => a.numero - b.numero)
    .map(m => m.odu);
}

/**
 * Check if an Odu exists in the mapping
 * @param odu - Odu name to check
 * @returns True if Odu exists in mapping
 */
export function hasOduElement(odu: string): boolean {
  return odu in ODU_ELEMENT_MAPPINGS;
}

/**
 * Get Odu by number
 * @param numero - Odu number (1-16)
 * @returns The element mapping or null if not found
 */
export function getOduByNumber(numero: number): OduElementMapping | null {
  return Object.values(ODU_ELEMENT_MAPPINGS).find(m => m.numero === numero) ?? null;
}

/**
 * Get all Odus for a specific element by element name
 * @param elemento - Element name
 * @returns Array of Odu names for that element
 */
export function getOdusForElement(elemento: string): string[] {
  return getElementOdu(elemento).map(m => m.odu);
}

/**
 * Get all elements
 * @returns Array of unique element names
 */
export function getAllElements(): Elemento[] {
  const elements = new Set(Object.values(ODU_ELEMENT_MAPPINGS).map(m => m.elemento));
  return Array.from(elements) as Elemento[];
}

/**
 * Get element count distribution
 * @returns Object with element names as keys and counts as values
 */
export function getElementDistribution(): Record<Elemento, number> {
  const distribution: Record<string, number> = {};
  for (const odu of Object.values(ODU_ELEMENT_MAPPINGS)) {
    distribution[odu.elemento] = (distribution[odu.elemento] || 0) + 1;
  }
  return distribution as Record<Elemento, number>;
}
