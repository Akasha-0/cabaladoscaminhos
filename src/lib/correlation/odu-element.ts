/**
 * Odú Ifá-to-Element Correlation Mapping
 * Based on IDEIA.md Cabala dos Caminhos spiritual system
 * Maps each Odu Ifá (Merindilogun) to its corresponding element and spiritual qualities
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra';

export interface ElementQualities {
  temperatura: 'Quente' | 'Frio' | 'Neutro';
  umidade: 'Seco' | 'Úmido';
  polaridade: 'Yang' | 'Yin' | 'Equilibrado';
}

export interface SpiritualPractice {
  tipo: 'ebo' | 'oracao' | 'banho' | 'ritual' | 'oferenda';
  descricao: string;
}

export interface OduElementMapping {
  /** Odu name (Portuguese) */
  odu: string;
  /** Odu number (1-16) */
  numero: number;
  /** Primary corresponding element */
  elemento: Elemento;
  /** Elemental qualities (hermetic) */
  qualidades: ElementQualities;
  /** Energy alignment description */
  alinhamento_energetico: string;
  /** Spiritual significance */
  significado_espiritual: string;
  /** Orixá correspondent */
  orixa: string;
  /** Sacred day */
  dia_sagrado: string;
  /** Traditional colors */
  cores: string[];
  /** Chakra correspondent */
  chakra: string;
  /** Sephirah correspondence (Cabala) */
  sephirah: string;
  /** Associated elements for rituals */
  elementos_rituais: string[];
  /** Ritual directions */
  direcoes: string[];
  /** Spiritual practices for this Odu-element combination */
  praticas_espirituais: SpiritualPractice[];
  /** Affinities with body/mind */
  afinidades: string[];
}

// ─── Odú Ifá-to-Element Mapping ─────────────────────────────────────────────────

export const ODU_ELEMENT_MAPPINGS: Record<string, OduElementMapping> = {
  // ─── FOGO Element ─────────────────────────────────────────────────────────────
  Ejilsebora: {
    odu: 'Ejilsebora',
    numero: 12,
    elemento: 'Fogo',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    alinhamento_energetico: 'Quente / Ígneo / Radiante',
    significado_espiritual:
      'Ejilsebora traz a energia do fogo purificador e da guerra justa. Este Odu representa a força vital que transforma o caos em ordem, o brilho interior que ilumina os caminhos e a determinação inabalável que supera obstáculos.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    chakra: '3º Plexo Solar',
    sephirah: 'Tiphereth',
    elementos_rituais: ['Fogo', 'Ar'],
    direcoes: ['Oeste', 'Centro'],
    praticas_espirituais: [
      { tipo: 'ebo', descricao: 'Firmezas com pedras de raio (meteoritos/quartzo marrom)' },
      { tipo: 'ritual', descricao: 'Rituais de fogo e purificação' },
      { tipo: 'oracao', descricao: 'Orações de guerra justa e proteção' },
    ],
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (Manipura)',
      'Sistema metabólico',
      'Temperamento bilioso',
      'Espírito de liderança',
    ],
  },
  Obará: {
    odu: 'Obará',
    numero: 6,
    elemento: 'Fogo',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    alinhamento_energetico: 'Quente / Solar / Brilhante',
    significado_espiritual:
      'Obará confere brilho pessoal e prosperidade através da energia solar. Este Odu traz abundância material e espiritual, o carisma que atrai oportunidades e a luz interior que inspira outros.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    chakra: '3º Plexo Solar',
    sephirah: 'Tiphereth',
    elementos_rituais: ['Fogo', 'Ar'],
    direcoes: ['Oeste', 'Centro'],
    praticas_espirituais: [
      { tipo: 'oferenda', descricao: 'Oferendas de seis tipos de frutas' },
      { tipo: 'ritual', descricao: 'Rituais de prosperidade e brilho pessoal' },
      { tipo: 'ebo', descricao: 'Amalá bem quente com folhas de fumo para Xangô' },
    ],
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (Manipura)',
      'Sistema metabólico',
      'Temperamento bilioso',
      'Carisma e magnetismo pessoal',
    ],
  },
  Etaogundá: {
    odu: 'Etaogundá',
    numero: 3,
    elemento: 'Fogo',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    alinhamento_energetico: 'Quente / Transformador / Criativo',
    significado_espiritual:
      'Etaogundá representa a criação de ferramentas e o poder de cortar para construir. Este Odu ensina que a destruição do velho permite o nascimento do novo, a transformação necessária para a evolução espiritual.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    chakra: '3º Plexo Solar',
    sephirah: 'Tiphereth',
    elementos_rituais: ['Fogo', 'Ar'],
    direcoes: ['Oeste', 'Centro'],
    praticas_espirituais: [
      { tipo: 'ebo', descricao: 'Inhames assados para Etaogundá' },
      { tipo: 'ritual', descricao: 'Rituais de transformação e renovação' },
      { tipo: 'oracao', descricao: 'Orações para força criativa' },
    ],
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (Manipura)',
      'Sistema metabólico',
      'Temperamento bilioso',
      'Criatividade e inovação',
    ],
  },

  // ─── ÁGUA Element ────────────────────────────────────────────────────────────
  Ofun: {
    odu: 'Ofun',
    numero: 10,
    elemento: 'Água',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    alinhamento_energetico: 'Frio / Receptivo / Profundo',
    significado_espiritual:
      'Ofun traz o sopro divino e a cura através da paciência e do silêncio. Este Odu representa as águas profundas do inconsciente, a sabedoria interior que vem da escuta silenciosa e a cura que flui como rio manso.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira / Sábado',
    cores: ['Azul Escuro', 'Branco', 'Transparente', 'Rosa'],
    chakra: '6º Frontal',
    sephirah: 'Yesod',
    elementos_rituais: ['Água', 'Terra'],
    direcoes: ['Norte', 'Sul'],
    praticas_espirituais: [
      { tipo: 'oracao', descricao: 'Rezas mansas e frutas brancas para Ofun' },
      { tipo: 'banho', descricao: 'Banhos de leite de cabra ou ervas calmas' },
      { tipo: 'ritual', descricao: 'Rituais de cura e suavização' },
    ],
    afinidades: [
      'Sistema linfático',
      'Chakra Frontal (Ajna)',
      'Sistema hormonal',
      'Temperamento fleumático',
      'Sensibilidade emocional',
    ],
  },
  Oxé: {
    odu: 'Oxé',
    numero: 5,
    elemento: 'Água',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    alinhamento_energetico: 'Frio / Magnético / Doce',
    significado_espiritual:
      'Oxé confere magnetismo, doçura e a energia da feitiçaria natural. Este Odu traz o poder de encantamento e persuasão, a graça que suaviza conflitos e a magia ritual que manifesta desejos.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira / Sábado',
    cores: ['Azul Escuro', 'Branco', 'Transparente', 'Rosa'],
    chakra: '6º Frontal',
    sephirah: 'Yesod',
    elementos_rituais: ['Água', 'Terra'],
    direcoes: ['Norte', 'Sul'],
    praticas_espirituais: [
      { tipo: 'banho', descricao: 'Banhos de mel e caldas de frutas para Oxé' },
      { tipo: 'ritual', descricao: 'Rituais de encantamento e magnetismo' },
      { tipo: 'oferenda', descricao: 'Oferendas doces e perfumadas' },
    ],
    afinidades: [
      'Sistema linfático',
      'Chakra Frontal (Ajna)',
      'Sistema hormonal',
      'Temperamento fleumático',
      'Charme e persuasão',
    ],
  },
  Odi: {
    odu: 'Odi',
    numero: 7,
    elemento: 'Água',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    alinhamento_energetico: 'Frio / Oculto / Transmutador',
    significado_espiritual:
      'Odi conecta ao poço profundo dos mistérios ocultos e à transmutação. Este Odu revela os segredos escondidos nas águas profundas, o poder de transformar o impuro em puro e a sabedoria dos mistérios antigos.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira / Sábado',
    cores: ['Azul Escuro', 'Branco', 'Transparente', 'Rosa'],
    chakra: '6º Frontal',
    sephirah: 'Yesod',
    elementos_rituais: ['Água', 'Terra'],
    direcoes: ['Norte', 'Sul'],
    praticas_espirituais: [
      { tipo: 'ebo', descricao: 'Pipoca (Deburu) para Odi/Omolu' },
      { tipo: 'ritual', descricao: 'Rituais de revelação de mistérios' },
      { tipo: 'banho', descricao: 'Banhos de lama ou argila para transmutação' },
    ],
    afinidades: [
      'Sistema linfático',
      'Chakra Frontal (Ajna)',
      'Sistema hormonal',
      'Temperamento fleumático',
      'Intuição e percepção oculta',
    ],
  },

  // ─── AR Element ──────────────────────────────────────────────────────────────
  Alafia: {
    odu: 'Alafia',
    numero: 16,
    elemento: 'Ar',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Equilibrado',
    },
    alinhamento_energetico: 'Neutro / Equilibrado / Elevado',
    significado_espiritual:
      'Alafia traz a paz absoluta e a confirmação dos Deuses. Este Odu representa o elemento mais elevado do pensamento iluminado, a harmonia que transcende opostos e a cura que vem da reconciliação interior.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira / Terça-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde', 'Branco'],
    chakra: '5º Laríngeo',
    sephirah: 'Hod',
    elementos_rituais: ['Ar', 'Fogo'],
    direcoes: ['Leste', 'Centro'],
    praticas_espirituais: [
      { tipo: 'oferenda', descricao: 'Flores brancas e oferendas de frutas doces para Alafia' },
      { tipo: 'ritual', descricao: 'Acentender lâmpadas e velas brancas' },
      { tipo: 'oracao', descricao: 'Orações de paz e harmonia' },
    ],
    afinidades: [
      'Sistema respiratório',
      'Chakra Laríngeo (Vishuddha)',
      'Sistema nervoso',
      'Temperamento melancólico',
      'Capacidade de comunicação',
    ],
  },
  Ejiokô: {
    odu: 'Ejiokô',
    numero: 2,
    elemento: 'Ar',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Equilibrado',
    },
    alinhamento_energetico: 'Neutro / Dual / Equilibrado',
    significado_espiritual:
      'Ejiokô ensina sobre dualidade e os caminhos duplos. Este Odu traz o equilíbrio entre opostos, a sabedoria de que toda escolha tem dois lados e a capacidade de navegar entre extremos com sabedoria.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira / Terça-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde', 'Branco'],
    chakra: '5º Laríngeo',
    sephirah: 'Hod',
    elementos_rituais: ['Ar', 'Fogo'],
    direcoes: ['Leste', 'Centro'],
    praticas_espirituais: [
      { tipo: 'ritual', descricao: 'Rituais de equilíbrio e escolhas' },
      { tipo: 'oracao', descricao: 'Orações para sabedoria nas decisões' },
      { tipo: 'oferenda', descricao: 'Oferendas balanceadas e equilibradas' },
    ],
    afinidades: [
      'Sistema respiratório',
      'Chakra Laríngeo (Vishuddha)',
      'Sistema nervoso',
      'Temperamento melancólico',
      'Discernimento e sabedoria',
    ],
  },
  Ossá: {
    odu: 'Ossá',
    numero: 9,
    elemento: 'Ar',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Equilibrado',
    },
    alinhamento_energetico: 'Neutro / Transformador / Rápido',
    significado_espiritual:
      'Ossá traz as transformações rápidas e o poder feminino das Iyami. Este Odu representa a mudança acelerada, o poder de feitiçaria das bruxas ancestrais e a capacidade de modificar rapidamente a realidade.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira / Terça-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde', 'Branco'],
    chakra: '5º Laríngeo',
    sephirah: 'Hod',
    elementos_rituais: ['Ar', 'Fogo'],
    direcoes: ['Leste', 'Centro'],
    praticas_espirituais: [
      { tipo: 'ritual', descricao: 'Sacudimentos com folhas de fumo para Ossá' },
      { tipo: 'ebo', descricao: 'Rituais de transformação rápida' },
      { tipo: 'oracao', descricao: 'Orações para mudanças aceleradas' },
    ],
    afinidades: [
      'Sistema respiratório',
      'Chakra Laríngeo (Vishuddha)',
      'Sistema nervoso',
      'Temperamento melancólico',
      'Capacidade de transformação',
    ],
  },

  // ─── TERRA Element ──────────────────────────────────────────────────────────
  Okaran: {
    odu: 'Okaran',
    numero: 1,
    elemento: 'Terra',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    alinhamento_energetico: 'Denso / Aterrador / Transformador',
    significado_espiritual:
      'Okaran traz o começo difícil, a dúvida e a prova que fortalece a vontade de criar. Este Odu representa a terra fértil que necesita de esforço para produzir, o ancoramento que sustenta todos os outros elementos.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho', 'Preto e Branco'],
    chakra: '1º Básico',
    sephirah: 'Malkuth',
    elementos_rituais: ['Terra', 'Fogo'],
    direcoes: ['Norte', 'Centro'],
    praticas_espirituais: [
      { tipo: 'ebo', descricao: 'Despachos em encruzilhadas para Okaran' },
      { tipo: 'ritual', descricao: 'Rituais para abrir caminhos' },
      { tipo: 'oferenda', descricao: 'Moedas e pipoca para abrir caminhos' },
    ],
    afinidades: [
      'Sistema ósseo',
      'Chakra Básico (Muladhara)',
      'Sistema digestivo',
      'Temperamento melancólico',
      'Conexão com a natureza',
    ],
  },
  Olobón: {
    odu: 'Olobón',
    numero: 13,
    elemento: 'Terra',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    alinhamento_energetico: 'Denso / Transformador / Físico',
    significado_espiritual:
      'Olobón conecta à transformação física, às doenças que curam e ao fim de ciclos necessários. Este Odu revela que a doença pode ser cura, que o fim de um ciclo é início de outro e que a terra transforma tudo em novo solo.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho', 'Preto e Branco'],
    chakra: '1º Básico',
    sephirah: 'Malkuth',
    elementos_rituais: ['Terra', 'Fogo'],
    direcoes: ['Norte', 'Centro'],
    praticas_espirituais: [
      { tipo: 'ebo', descricao: 'Oferendas na lama ou mangue para Olobón' },
      { tipo: 'ritual', descricao: 'Rituais de fim de ciclo' },
      { tipo: 'banho', descricao: 'Banhos de cura e renovação física' },
    ],
    afinidades: [
      'Sistema ósseo',
      'Chakra Básico (Muladhara)',
      'Sistema digestivo',
      'Temperamento melancólico',
      'Resiliência física',
    ],
  },
  Iká: {
    odu: 'Iká',
    numero: 14,
    elemento: 'Terra',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    alinhamento_energetico: 'Denso / Revelador / Renovador',
    significado_espiritual:
      'Iká revela a sabedoria oculta da serpente, a traição que renova e a capacidade de descascar o velho para revelar o novo. Este Odu ensina que a renovação exige soltar o antigo, que a serpente renova sua pele e que a sabedoria vem da transformação.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho', 'Preto e Branco'],
    chakra: '1º Básico',
    sephirah: 'Malkuth',
    elementos_rituais: ['Terra', 'Fogo'],
    direcoes: ['Norte', 'Centro'],
    praticas_espirituais: [
      { tipo: 'ebo', descricao: 'Ebó com feijão preto e velas lilases' },
      { tipo: 'ritual', descricao: 'Amarrar fitas coloridas (7 cores) para Iká' },
      { tipo: 'oracao', descricao: 'Orações para renovação e descascar o velho' },
    ],
    afinidades: [
      'Sistema ósseo',
      'Chakra Básico (Muladhara)',
      'Sistema digestivo',
      'Temperamento melancólico',
      'Sabedoria ancestral',
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
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of Odu mappings for that element
 */
export function getElementOdu(elemento: string): OduElementMapping[] {
  return Object.values(ODU_ELEMENT_MAPPINGS).filter(
    mapping => mapping.elemento === elemento
  );
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
  return Object.values(ODU_ELEMENT_MAPPINGS).find(
    mapping => mapping.numero === numero
  ) ?? null;
}

/**
 * Get all Odus for a specific element by element name
 * @param elemento - Element name
 * @returns Array of Odu names for that element
 */
export function getOdusForElement(elemento: string): string[] {
  return Object.values(ODU_ELEMENT_MAPPINGS)
    .filter(mapping => mapping.elemento === elemento)
    .sort((a, b) => a.numero - b.numero)
    .map(m => m.odu);
}

export default {
  getOduElement,
  getElementOdu,
  getAllOduElements,
  getAllOduNames,
  hasOduElement,
  getOduByNumber,
  getOdusForElement,
  ODU_ELEMENT_MAPPINGS,
};
