/**
 * Odú Ifá-to-Planet Correlation Mapping
 * Based on Cabala dos Caminhos spiritual system
 * Maps each Odu Ifá (Merindilogun 16) to its corresponding planet
 * and provides comprehensive spiritual correlations
 */

export type Planeta = 'Sol' | 'Lua' | 'Marte' | 'Mercúrio' | 'Júpiter' | 'Vênus' | 'Saturno';

export interface PlanetQualities {
  qualidade: 'Yang (Exterior)' | 'Yin (Interior)' | 'Neutro (Equilibrado)';
  elemento: string;
  temperamento: string;
}

export interface OduPlanetMapping {
  /** Odu name (Portuguese) */
  odu: string;
  /** Odu number (1-16) */
  numero: number;
  /** Corresponding planet */
  planeta: Planeta;
  /** Associated element */
  elemento: string;
  /** Planet qualities */
  qualidades_planetarias: PlanetQualities;
  /** Energy alignment description */
  alinhamento_energetico: string;
  /** Spiritual significance */
  significado_espiritual: string;
  /** Primary Orixá correspondent */
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
  /** Zodiac sign connection */
  signo_zodiacal: string;
  /** Numerology correspondence */
  numerologia: number;
  /** Affinities with body/mind */
  afinidades: string[];
}

// ─── Odú Ifá-to-Planet Mapping ─────────────────────────────────────────────────

export const ODU_PLANET_MAPPINGS: Record<string, OduPlanetMapping> = {
  // ─── SATURNO (Terra/Restrição) ───────────────────────────────────────────────
  Okaran: {
    odu: 'Okaran',
    numero: 1,
    planeta: 'Saturno',
    elemento: 'Terra',
    qualidades_planetarias: {
      qualidade: 'Yin (Interior)',
      elemento: 'Terra',
      temperamento: 'Melancólico',
    },
    alinhamento_energetico: 'Denso / Aterrador / Transformador',
    significado_espiritual:
      'Okaran traz o começo difícil e a prova que fortalece a vontade de criar. Saturno representa o师长 que traz provas necessárias para o crescimento espiritual, o karma que deve ser trabalhado e a disciplina que transforma o、粗o em refinamento.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho', 'Preto e Branco'],
    chakra: '1º Básico',
    sephirah: 'Malkuth',
    elementos_rituais: ['Terra', 'Fogo'],
    direcoes: ['Norte', 'Centro'],
    signo_zodiacal: 'Capricórnio',
    numerologia: 8,
    afinidades: [
      'Sistema ósseo',
      'Chakra Básico (Muladhara)',
      'Sistema digestivo',
      'Temperamento melancólico',
      'Conexão com ancestrais',
      'Disciplina e perseverança',
    ],
  },

  // ─── MERCÚRIO (Comunicação/Mudança) ─────────────────────────────────────────
  Ejiokô: {
    odu: 'Ejiokô',
    numero: 2,
    planeta: 'Mercúrio',
    elemento: 'Ar',
    qualidades_planetarias: {
      qualidade: 'Neutro (Equilibrado)',
      elemento: 'Ar',
      temperamento: 'Sanguíneo',
    },
    alinhamento_energetico: 'Neutro / Dual / Equilibrado',
    significado_espiritual:
      'Ejiokô ensina sobre dualidade e os caminhos duplos. Mercúrio representa a mente que conecta o céu e a terra, o mensageiro que traz mudanças e a sabedoria de navegar entre opostos com agilidade mental.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde', 'Branco'],
    chakra: '5º Laríngeo',
    sephirah: 'Hod',
    elementos_rituais: ['Ar', 'Fogo'],
    direcoes: ['Leste', 'Centro'],
    signo_zodiacal: 'Gêmeos',
    numerologia: 5,
    afinidades: [
      'Sistema respiratório',
      'Chakra Laríngeo (Vishuddha)',
      'Sistema nervoso',
      'Temperamento sanguíneo',
      'Discernimento e sabedoria',
      'Comunicação e negociação',
    ],
  },

  // ─── MARTE (Ação/Transformação) ──────────────────────────────────────────────
  Etaogundá: {
    odu: 'Etaogundá',
    numero: 3,
    planeta: 'Marte',
    elemento: 'Fogo',
    qualidades_planetarias: {
      qualidade: 'Yang (Exterior)',
      elemento: 'Fogo',
      temperamento: 'Colérico',
    },
    alinhamento_energetico: 'Quente / Transformador / Criativo',
    significado_espiritual:
      'Etaogundá representa a criação de ferramentas e o poder de cortar para construir. Marte traz a energia de combate aos obstáculos, a coragem de iniciar jornadas e a força vital que transforma o caos em ordem.',
    orixa: 'Ogum',
    dia_sagrado: 'Terça-feira',
    cores: ['Vermelho', 'Verde', 'Azul Claro'],
    chakra: '3º Plexo Solar',
    sephirah: 'Netzach',
    elementos_rituais: ['Fogo', 'Terra'],
    direcoes: ['Oeste'],
    signo_zodiacal: 'Áries',
    numerologia: 9,
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (Manipura)',
      'Sistema muscular',
      'Temperamento colérico',
      'Criatividade e inovação',
      'Coragem e determinação',
    ],
  },

  // ─── LUA (Intuição/Receptividade) ────────────────────────────────────────────
  Irosun: {
    odu: 'Irosun',
    numero: 4,
    planeta: 'Lua',
    elemento: 'Água',
    qualidades_planetarias: {
      qualidade: 'Yin (Interior)',
      elemento: 'Água',
      temperamento: 'Fleumático',
    },
    alinhamento_energetico: 'Fria / Receptiva / Profunda',
    significado_espiritual:
      'Irosun traz o aviso e a visão espiritual. A Lua representa a alma, os ciclos e a sabedoria emocional que vem do mundo sutil. Este Odu abre a visão interior para perceber o que está além do véu.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira',
    cores: ['Azul Escuro', 'Branco', 'Azul-celeste'],
    chakra: '6º Frontal',
    sephirah: 'Yesod',
    elementos_rituais: ['Água', 'Terra'],
    direcoes: ['Norte'],
    signo_zodiacal: 'Câncer',
    numerologia: 2,
    afinidades: [
      'Sistema linfático',
      'Chakra Frontal (Ajna)',
      'Sistema hormonal',
      'Temperamento fleumático',
      'Intuição e clarividência',
      'Conexão com ancestrais',
    ],
  },

  // ─── JÚPITER (Expansão/Abundância) ───────────────────────────────────────────
  Oxé: {
    odu: 'Oxé',
    numero: 5,
    planeta: 'Júpiter',
    elemento: 'Fogo',
    qualidades_planetarias: {
      qualidade: 'Yang (Exterior)',
      elemento: 'Fogo',
      temperamento: 'Sanguíneo',
    },
    alinhamento_energetico: 'Quente / Expansiva / Abundante',
    significado_espiritual:
      'Oxé confere magnetismo, doçura e a energia da feitiçaria natural. Júpiter representa a fartura cósmica, o conhecimento dos mestres e a bênção divina que expande a consciência e atrai prosperidade.',
    orixa: 'Oxóssi',
    dia_sagrado: 'Quinta-feira',
    cores: ['Verde', 'Azul-turquesa', 'Amarelo-ouro'],
    chakra: '4º Cardíaco',
    sephirah: 'Tiphereth',
    elementos_rituais: ['Fogo', 'Terra'],
    direcoes: ['Sul'],
    signo_zodiacal: 'Sagitário',
    numerologia: 3,
    afinidades: [
      'Coração e sistema circulatório',
      'Chakra Cardíaco (Anahata)',
      'Sistema hepático',
      'Temperamento sanguíneo',
      'Carisma e magnetismo',
      'Abundância e prosperidade',
    ],
  },

  // ─── SOL (Vitalidade/Liderança) ──────────────────────────────────────────────
  Obará: {
    odu: 'Obará',
    numero: 6,
    planeta: 'Sol',
    elemento: 'Fogo',
    qualidades_planetarias: {
      qualidade: 'Yang (Exterior)',
      elemento: 'Fogo',
      temperamento: 'Colérico',
    },
    alinhamento_energetico: 'Quente / Solar / Brilhante',
    significado_espiritual:
      'Obará confere brilho pessoal e prosperidade através da energia solar. O Sol representa o núcleo do ser, a essência divina que ilumina o caminho, a realeza interior e o poder de manifestar abundância.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    chakra: '3º Plexo Solar',
    sephirah: 'Tiphereth',
    elementos_rituais: ['Fogo', 'Ar'],
    direcoes: ['Oeste', 'Centro'],
    signo_zodiacal: 'Leão',
    numerologia: 6,
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (Manipura)',
      'Sistema metabólico',
      'Temperamento colérico',
      'Carisma e magnetismo pessoal',
      'Liderança e criatividade',
    ],
  },

  // ─── MARTE (Ação/Transmutação) ───────────────────────────────────────────────
  Odi: {
    odu: 'Odi',
    numero: 7,
    planeta: 'Marte',
    elemento: 'Água',
    qualidades_planetarias: {
      qualidade: 'Yin (Interior)',
      elemento: 'Água',
      temperamento: 'Fleumático',
    },
    alinhamento_energetico: 'Frio / Oculto / Transmutador',
    significado_espiritual:
      'Odi conecta ao poço profundo dos mistérios ocultos e à transmutação. Marte aqui representa a coragem de enfrentar o que está oculto, a transformação do impuro em puro e o renascimento após ciclos difíceis.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho'],
    chakra: '6º Frontal',
    sephirah: 'Hod',
    elementos_rituais: ['Água', 'Terra'],
    direcoes: ['Norte', 'Sul'],
    signo_zodiacal: 'Escorpião',
    numerologia: 9,
    afinidades: [
      'Sistema linfático',
      'Chakra Frontal (Ajna)',
      'Sistema reprodutivo',
      'Temperamento fleumático',
      'Intuição e percepção oculta',
      'Capacidade de transformação',
    ],
  },

  // ─── VÊNUS (Harmonia/Beleza) ─────────────────────────────────────────────────
  EjiOnile: {
    odu: 'EjiOnile',
    numero: 8,
    planeta: 'Vênus',
    elemento: 'Água',
    qualidades_planetarias: {
      qualidade: 'Yin (Interior)',
      elemento: 'Água',
      temperamento: 'Fleumático',
    },
    alinhamento_energetico: 'Frio / Magnético / Doce',
    significado_espiritual:
      'EjiOnile representa a cabeça (Ori), a liderança espiritual e a paz absoluta. Vênus traz o amor incondicional, a harmonia divina e a capacidade de magnetizar experiências de paz e belOzena através da频道.',
    orixa: 'Oxalá',
    dia_sagrado: 'Sexta-feira / Sábado',
    cores: ['Branco', 'Marfim', 'Azul-celeste'],
    chakra: '4º Cardíaco',
    sephirah: 'Netzach',
    elementos_rituais: ['Água', 'Ar'],
    direcoes: ['Centro', 'Leste'],
    signo_zodiacal: 'Touro',
    numerologia: 6,
    afinidades: [
      'Coração e sistema circulatório',
      'Chakra Cardíaco (Anahata)',
      'Sistema renal',
      'Temperamento fleumático',
      'Amor e compaixão',
      'Alinhamento espiritual',
    ],
  },

  // ─── MERCÚRIO (Comunicação/Mudança) ─────────────────────────────────────────
  Ossá: {
    odu: 'Ossá',
    numero: 9,
    planeta: 'Mercúrio',
    elemento: 'Ar',
    qualidades_planetarias: {
      qualidade: 'Neutro (Equilibrado)',
      elemento: 'Ar',
      temperamento: 'Sanguíneo',
    },
    alinhamento_energetico: 'Neutro / Transformador / Rápido',
    significado_espiritual:
      'Ossá traz as transformações rápidas e o poder feminino das Iyami. Mercúrio representa a mente que muda rapidamente, a agilidade mental que modifica a realidade e a comunicação com os mundos superiores.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde', 'Branco'],
    chakra: '5º Laríngeo',
    sephirah: 'Hod',
    elementos_rituais: ['Ar', 'Fogo'],
    direcoes: ['Leste', 'Centro'],
    signo_zodiacal: 'Virgem',
    numerologia: 5,
    afinidades: [
      'Sistema respiratório',
      'Chakra Laríngeo (Vishuddha)',
      'Sistema nervoso',
      'Temperamento sanguíneo',
      'Capacidade de transformação rápida',
      'Comunicação e expressão',
    ],
  },

  // ─── LUA (Intuição/Receptividade) ────────────────────────────────────────────
  Ofun: {
    odu: 'Ofun',
    numero: 10,
    planeta: 'Lua',
    elemento: 'Água',
    qualidades_planetarias: {
      qualidade: 'Yin (Interior)',
      elemento: 'Água',
      temperamento: 'Fleumático',
    },
    alinhamento_energetico: 'Frio / Receptivo / Profundo',
    significado_espiritual:
      'Ofun traz o sopro divino e a cura através da paciência e do silêncio. A Lua representa as águas profundas do inconsciente, a sabedoria interior que vem da escuta silenciosa e a cura que flui como rio manso.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira / Sábado',
    cores: ['Azul Escuro', 'Branco', 'Transparente', 'Rosa'],
    chakra: '6º Frontal',
    sephirah: 'Yesod',
    elementos_rituais: ['Água', 'Terra'],
    direcoes: ['Norte', 'Sul'],
    signo_zodiacal: 'Câncer',
    numerologia: 2,
    afinidades: [
      'Sistema linfático',
      'Chakra Frontal (Ajna)',
      'Sistema hormonal',
      'Temperamento fleumático',
      'Sensibilidade emocional',
      'Capacidade de cura',
    ],
  },

  // ─── SATURNO (Restrição/Mestria) ─────────────────────────────────────────────
  Olobón: {
    odu: 'Olobón',
    numero: 13,
    planeta: 'Saturno',
    elemento: 'Terra',
    qualidades_planetarias: {
      qualidade: 'Yin (Interior)',
      elemento: 'Terra',
      temperamento: 'Melancólico',
    },
    alinhamento_energetico: 'Denso / Transformador / Físico',
    significado_espiritual:
      'Olobón conecta à transformação física, às doenças que curam e ao fim de ciclos necessários. Saturno representa o师长 que traz provas para o crescimento, a limpeza kármica e a renovação através da paciência e disciplina.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho', 'Preto e Branco'],
    chakra: '1º Básico',
    sephirah: 'Malkuth',
    elementos_rituais: ['Terra', 'Fogo'],
    direcoes: ['Norte', 'Centro'],
    signo_zodiacal: 'Capricórnio',
    numerologia: 8,
    afinidades: [
      'Sistema ósseo',
      'Chakra Básico (Muladhara)',
      'Sistema digestivo',
      'Temperamento melancólico',
      'Resiliência física',
      'Sabedoria do corpo',
    ],
  },

  // ─── SATURNO (Restrição/Renovação) ──────────────────────────────────────────
  Iká: {
    odu: 'Iká',
    numero: 14,
    planeta: 'Saturno',
    elemento: 'Terra',
    qualidades_planetarias: {
      qualidade: 'Yin (Interior)',
      elemento: 'Terra',
      temperamento: 'Melancólico',
    },
    alinhamento_energetico: 'Denso / Revelador / Renovador',
    significado_espiritual:
      'Iká revela a sabedoria oculta da serpente, a traição que renova e a capacidade de descascar o velho para revelar o novo. Saturno ensina que a renovação exige soltar o antigo, que a serpente renova sua pele.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho', 'Preto e Branco'],
    chakra: '1º Básico',
    sephirah: 'Malkuth',
    elementos_rituais: ['Terra', 'Fogo'],
    direcoes: ['Norte', 'Centro'],
    signo_zodiacal: 'Aquário',
    numerologia: 8,
    afinidades: [
      'Sistema ósseo',
      'Chakra Básico (Muladhara)',
      'Sistema digestivo',
      'Temperamento melancólico',
      'Sabedoria ancestral',
      'Capacidade de renovação',
    ],
  },

  // ─── VÊNUS (Harmonia/Limpeza) ────────────────────────────────────────────────
  Obá: {
    odu: 'Obá',
    numero: 15,
    planeta: 'Vênus',
    elemento: 'Terra',
    qualidades_planetarias: {
      qualidade: 'Yang (Exterior)',
      elemento: 'Terra',
      temperamento: 'Colérico',
    },
    alinhamento_energetico: 'Quente / Transformador / Guerreira',
    significado_espiritual:
      'Obá traz a energia guerreira da dedicação amorosa. Vênus aqui manifesta-se como a guerreira devotada, a limpeza das negatividades e a proteção através da força do amor e da devoção.',
    orixa: 'Obá',
    dia_sagrado: 'Sexta-feira',
    cores: ['Dourado', 'Laranja', 'Vermelho'],
    chakra: '3º Plexo Solar',
    sephirah: 'Geburah',
    elementos_rituais: ['Fogo', 'Terra'],
    direcoes: ['Oeste', 'Sul'],
    signo_zodiacal: 'Libra',
    numerologia: 6,
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (Manipura)',
      'Sistema muscular',
      'Temperamento colérico',
      'Dedicação e lealdade',
      'Proteção e guarda',
    ],
  },

  // ─── JÚPITER (Expansão/Paz) ───────────────────────────────────────────────────
  Oyekun: {
    odu: 'Oyekun',
    numero: 16,
    planeta: 'Júpiter',
    elemento: 'Ar',
    qualidades_planetarias: {
      qualidade: 'Neutro (Equilibrado)',
      elemento: 'Ar',
      temperamento: 'Sanguíneo',
    },
    alinhamento_energetico: 'Neutro / Elevado / Pacificador',
    significado_espiritual:
      'Oyekun traz a confirmação dos Deuses e a paz absoluta. Júpiter representa a expansão da consciência espiritual, a bênção dos mestres e a paz que transcende todos os conflitos terrenais.',
    orixa: 'Oxalá',
    dia_sagrado: 'Sexta-feira / Domingo',
    cores: ['Branco', 'Amarelo-ouro', 'Azul-celeste'],
    chakra: '7º Coronário',
    sephirah: 'Kether',
    elementos_rituais: ['Ar', 'Fogo'],
    direcoes: ['Centro', 'Leste', 'Oeste'],
    signo_zodiacal: 'Peixes',
    numerologia: 3,
    afinidades: [
      'Sistema nervoso',
      'Chakra Coronário (Sahasrara)',
      'Sistema respiratório',
      'Temperamento sanguíneo',
      'Sabedoria espiritual',
      'Paz e harmonia',
    ],
  },

  // ─── SOL (Vitalidade/Combate) ────────────────────────────────────────────────
  Ejilsebora: {
    odu: 'Ejilsebora',
    numero: 12,
    planeta: 'Sol',
    elemento: 'Fogo',
    qualidades_planetarias: {
      qualidade: 'Yang (Exterior)',
      elemento: 'Fogo',
      temperamento: 'Colérico',
    },
    alinhamento_energetico: 'Quente / Ígneo / Radiante',
    significado_espiritual:
      'Ejilsebora traz a energia do fogo purificador e da guerra justa. O Sol representa o brilho interior que ilumina os caminhos, a determinação inabalável que supera obstáculos e a força vital que transforma o caos em ordem.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    chakra: '3º Plexo Solar',
    sephirah: 'Geburah',
    elementos_rituais: ['Fogo', 'Ar'],
    direcoes: ['Oeste', 'Centro'],
    signo_zodiacal: 'Leão',
    numerologia: 1,
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (Manipura)',
      'Sistema metabólico',
      'Temperamento colérico',
      'Espírito de liderança',
      'Coragem e proteção',
    ],
  },

  // ─── LUA (Intuição/Purificação) ─────────────────────────────────────────────
  Alafia: {
    odu: 'Alafia',
    numero: 11,
    planeta: 'Lua',
    elemento: 'Ar',
    qualidades_planetarias: {
      qualidade: 'Neutro (Equilibrado)',
      elemento: 'Ar',
      temperamento: 'Sanguíneo',
    },
    alinhamento_energetico: 'Neutro / Equilibrado / Elevado',
    significado_espiritual:
      'Alafia traz a paz absoluta e a confirmação dos Deuses. A Lua representa o pensamento iluminado que transcende opostos, a harmonia que vem da integração entre luz e sombra.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira / Terça-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde', 'Branco'],
    chakra: '5º Laríngeo',
    sephirah: 'Daath',
    elementos_rituais: ['Ar', 'Fogo'],
    direcoes: ['Leste', 'Centro'],
    signo_zodiacal: 'Gêmeos',
    numerologia: 2,
    afinidades: [
      'Sistema respiratório',
      'Chakra Laríngeo (Vishuddha)',
      'Sistema nervoso',
      'Temperamento sanguíneo',
      'Capacidade de comunicação',
      'Paz e harmonia',
    ],
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(ODU_PLANET_MAPPINGS);
// Freeze nested objects
Object.values(ODU_PLANET_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Odu-to-planet correlation mapping
 * @param odu - Odu name (e.g., 'Ejilsebora', 'Ofun', 'Alafia', 'Okaran')
 * @returns The correlation mapping or null if not found
 */
export function getOduPlanet(odu: string): OduPlanetMapping | null {
  return ODU_PLANET_MAPPINGS[odu] ?? null;
}

/**
 * Get all Odus for a specific planet
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno')
 * @returns Array of Odu mappings for that planet
 */
export function getPlanetOdu(planeta: string): OduPlanetMapping[] {
  return Object.values(ODU_PLANET_MAPPINGS)
    .filter(mapping => mapping.planeta === planeta)
    .sort((a, b) => a.numero - b.numero);
}

/**
 * Get all available Odu-planet mappings
 * @returns Array of all correlation mappings
 */
export function getAllOduPlanets(): OduPlanetMapping[] {
  return Object.values(ODU_PLANET_MAPPINGS);
}

/**
 * Get all Odu names
 * @returns Array of Odu names (sorted by number)
 */
export function getAllOduNames(): string[] {
  return Object.values(ODU_PLANET_MAPPINGS)
    .sort((a, b) => a.numero - b.numero)
    .map(m => m.odu);
}

/**
 * Check if an Odu exists in the mapping
 * @param odu - Odu name to check
 * @returns True if Odu exists in mapping
 */
export function hasOduPlanet(odu: string): boolean {
  return odu in ODU_PLANET_MAPPINGS;
}

/**
 * Get Odu by number
 * @param numero - Odu number (1-16)
 * @returns The planet mapping or null if not found
 */
export function getOduByNumber(numero: number): OduPlanetMapping | null {
  return Object.values(ODU_PLANET_MAPPINGS).find(m => m.numero === numero) ?? null;
}

/**
 * Get all Odus for a specific planet by planet name
 * @param planeta - Planet name
 * @returns Array of Odu names for that planet
 */
export function getOdusForPlanet(planeta: string): string[] {
  return getPlanetOdu(planeta).map(m => m.odu);
}

/**
 * Get all planets
 * @returns Array of unique planet names
 */
export function getAllPlanets(): Planeta[] {
  const planets = new Set(Object.values(ODU_PLANET_MAPPINGS).map(m => m.planeta));
  return Array.from(planets) as Planeta[];
}
