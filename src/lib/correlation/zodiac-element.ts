/**
 * Zodiac-Element Spiritual Correlation
 * Maps each zodiac sign to its primary element, element qualities, and spiritual practices.
 * Based on classical Western astrology integrated with the Cabala dos Caminhos system.
 */

import type { Elemento, Natureza } from './element-sign';

/** The twelve zodiac signs in Portuguese */
export type Signo =
  | 'Áries'
  | 'Touro'
  | 'Gémeos'
  | 'Câncer'
  | 'Leão'
  | 'Virgem'
  | 'Libra'
  | 'Escorpião'
  | 'Sagitário'
  | 'Capricórnio'
  | 'Aquário'
  | 'Peixes';

/**
 * Complete zodiac-element mapping with spiritual practices.
 * Each sign is classified by element, element qualities (hot/cold, wet/dry),
 * polarity, and recommended spiritual practices based on Brazilian traditions.
 */
export interface ZodiacElementMapping {
  signo: Signo;
  elemento: Elemento;
  qualidades_elementares: {
    quente_frio: 'Quente' | 'Frio' | 'Neutro';
    humido_seco: 'Húmido' | 'Seco' | 'Neutro';
    polaridade: Natureza;
    vibração: string;
  };
  praticas_espirituais: {
    ebos: string[];
    banhos: string[];
    defumacoes: string[];
    mantras: string[];
    horarios_rituais: string[];
    cores_rituais: string[];
    ofertas: string[];
  };
  correspondencia_cabala: {
    sefirot: string;
    caminho_sefirotico: string;
    arcanjo: string;
  };
}

/**
 * Complete mapping of all 12 zodiac signs with their element correspondences.
 * Based on classical Western astrology integrated with Brazilian spiritual traditions.
 */
export const ZODIAC_ELEMENT_MAPPINGS: Readonly<Record<Signo, ZodiacElementMapping>> = {
  /** Fogo - Quente - Seco - Yang - pioneiro, corajoso, líder natural */
  Áries: {
    signo: 'Áries',
    elemento: 'Fogo',
    qualidades_elementares: {
      quente_frio: 'Quente',
      humido_seco: 'Seco',
      polaridade: 'Yang',
      vibração: 'Expansiva e ascendente, energia de ignição e criação',
    },
    praticas_espirituais: {
      ebos: [
        'Ebo de força para proteção contra inimigos ocultos',
        'Ebo de coragem para abrir caminhos bloqueados',
      ],
      banhos: [
        'Banho de alecrim e louro para energia',
        'Banho de pétalas de girassol e cânfora',
      ],
      defumacoes: [
        'Sálvia branca para purificação',
        'Benjoim para proteção',
        'Aloé para energização',
      ],
      mantras: [
        'OM (som cósmico de criação)',
        'Ram Ram (invocação de Ogum)',
        'KRIM (potencialização da força)',
      ],
      horarios_rituais: [
        'Nascer do sol (primeiro quarto do dia)',
        'Terça-feira (dia de Marte)',
        'Horário de Marte: 13h-15h',
      ],
      cores_rituais: ['Vermelho', 'Laranja', 'Amarelo-dourado'],
      ofertas: ['Pimenta dedo-de-moça', 'Espada de Ogum', 'Vinho tinto'],
    },
    correspondencia_cabala: {
      sefirot: 'Geburah (Severidade)',
      caminho_sefirotico: 'Caminho 11 - entre Chokmah e Tiphereth',
      arcanjo: 'Kamael (Camil)',
    },
  },
  /** Terra - Frio - Seco - Yin - estável, paciente, sensual, prático */
  Touro: {
    signo: 'Touro',
    elemento: 'Terra',
    qualidades_elementares: {
      quente_frio: 'Frio',
      humido_seco: 'Seco',
      polaridade: 'Yin',
      vibração: 'Ancorada e estável, energia de nutrição e abundância',
    },
    praticas_espirituais: {
      ebos: [
        'Ebo de prosperidade para abrir caminhos financeiros',
        'Ebo de fertilidade para bênçãos materiais',
      ],
      banhos: [
        'Banho de açucena e jasmim para amor',
        'Banho de terra de Rio e flores brancas',
      ],
      defumacoes: [
        'Benjoim para abundância',
        'Pau-brasil para longevidade',
        'Canela para prosperidade',
      ],
      mantras: [
        'Mam (som de Oxum)',
        'OXUM OXUM (prosperidade)',
        'HUM (terra e fertilidade)',
      ],
      horarios_rituais: [
        'Fim da tarde (último quarto do dia)',
        'Sexta-feira (dia de Vénus)',
        'Horário de Vénus: 9h-11h',
      ],
      cores_rituais: ['Verde', 'Rosa', 'Azul-claro'],
      ofertas: ['Mel', 'Flores amarelas', 'Pente de Oxum', 'Moedas'],
    },
    correspondencia_cabala: {
      sefirot: 'Malkuth (Reino)',
      caminho_sefirotico: 'Caminho 32 - entre Yesod e Malkuth',
      arcanjo: 'Gabriel (Gavriel)',
    },
  },
  /** Ar - Quente - Húmido - Yang - comunicativo, curioso, versátil, intelectual */
  Gémeos: {
    signo: 'Gémeos',
    elemento: 'Ar',
    qualidades_elementares: {
      quente_frio: 'Quente',
      humido_seco: 'Húmido',
      polaridade: 'Yang',
      vibração: 'Móvel e versátil, energia de comunicação e troca',
    },
    praticas_espirituais: {
      ebos: [
        'Ebo de comunicação para desbloqueio verbal',
        'Ebo de inteligência para negócios e estudos',
      ],
      banhos: [
        'Banho de hortelã e eucalipto para clareza mental',
        'Banho de alecrim e erva-doce',
      ],
      defumacoes: [
        'Lavanda para concentração',
        'Funcho para sabedoria',
        'Mate para vigor mental',
      ],
      mantras: [
        'HRIM (som de comunicação)',
        'STRIM (clareza mental)',
        'OM GURU (transmissão de sabedoria)',
      ],
      horarios_rituais: [
        'Manhã (terceiro quarto do dia)',
        'Quarta-feira (dia de Mercúrio)',
        'Horário de Mercúrio: 8h-10h',
      ],
      cores_rituais: ['Amarelo', 'Laranja-claro', 'Azul-celeste'],
      ofertas: ['Caneta', 'Papel branco', 'Livros', 'Café'],
    },
    correspondencia_cabala: {
      sefirot: 'Hod (Glória)',
      caminho_sefirotico: 'Caminho 17 - entre Netzach e Yesod',
      arcanjo: 'Rafael (Raphael)',
    },
  },
  /** Água - Frio - Húmido - Yin - emocional, intuitivo, protetor, doméstico */
  Câncer: {
    signo: 'Câncer',
    elemento: 'Água',
    qualidades_elementares: {
      quente_frio: 'Frio',
      humido_seco: 'Húmido',
      polaridade: 'Yin',
      vibração: 'Fluida e emocional, energia de nutrição e proteção',
    },
    praticas_espirituais: {
      ebos: [
        'Ebo de proteção do lar e família',
        'Ebo de cura emocional para feridas do passado',
      ],
      banhos: [
        'Banho de sal marinho e flor de laranjeira',
        'Banho de ervas de Iemanjá (camomila e boldo)',
      ],
      defumacoes: [
        'Mirra para proteção familiar',
        'Rosa para ternura',
        'Lótus para purificação emocional',
      ],
      mantras: [
        'YA (som lunar)',
        'IEMANJÁ OJUA (mãe das águas)',
        'OM MAMA (nutrição)',
      ],
      horarios_rituais: [
        'Noite (quarto Menguante)',
        'Segunda-feira (dia da Lua)',
        'Horário da Lua: 17h-19h',
      ],
      cores_rituais: ['Branco', 'Prata', 'Azul-escuro'],
      ofertas: ['Água de cheiro', 'Perfume', 'Flores do mar', 'Bolsa de Iemanjá'],
    },
    correspondencia_cabala: {
      sefirot: 'Yesod (Fundação)',
      caminho_sefirotico: 'Caminho 19 - entre Hod e Malkuth',
      arcanjo: 'Gabriel (Gavriel)',
    },
  },
  /** Fogo - Quente - Seco - Yang - criativo, generoso, magnânimo, líder */
  Leão: {
    signo: 'Leão',
    elemento: 'Fogo',
    qualidades_elementares: {
      quente_frio: 'Quente',
      humido_seco: 'Seco',
      polaridade: 'Yang',
      vibração: 'Radiante e poderosa, energia de expressão criativa',
    },
    praticas_espirituais: {
      ebos: [
        'Ebo de reconhecimento e fama',
        'Ebo de autoestima e poder real',
      ],
      banhos: [
        'Banho de calêndula e girassol para vitalidade',
        'Banho de cravo-da-índia e canela',
      ],
      defumacoes: [
        'Sândalo para aura real',
        'Benjoim para abundância',
        'Açafrão para brilho dourado',
      ],
      mantras: [
        'RAM (som solar)',
        'HRIH (blazing aura)',
        'KRIM KRIM KRIM (potência real)',
      ],
      horarios_rituais: [
        'Meio-dia (sol no zênite)',
        'Domingo (dia do Sol)',
        'Horário do Sol: 12h-14h',
      ],
      cores_rituais: ['Dourado', 'Laranja', 'Amarelo'],
      ofertas: ['Fogo (velas douradas)', 'Ouro', 'Frutas douradas', 'Coroa de Xangô'],
    },
    correspondencia_cabala: {
      sefirot: 'Tiphereth (Belleza)',
      caminho_sefirotico: 'Caminho 14 - entre Chesed e Geburah',
      arcanjo: 'Michael (Mikhael)',
    },
  },
  /** Terra - Frio - Seco - Yin - analítico, detalhista, útil, puro */
  Virgem: {
    signo: 'Virgem',
    elemento: 'Terra',
    qualidades_elementares: {
      quente_frio: 'Frio',
      humido_seco: 'Seco',
      polaridade: 'Yin',
      vibração: 'Analítica e metódica, energia de purificação e serviço',
    },
    praticas_espirituais: {
      ebos: [
        'Ebo de purificação e limpeza espiritual',
        'Ebo de saúde e vitalidade',
      ],
      banhos: [
        'Banho de artemísia e arruda para purificação',
        'Banho de manjericão e cidreira',
      ],
      defumacoes: [
        'Artemísia para desintoxicação',
        'Funcho paradigestão',
        'Alcachofra para vitalidade',
      ],
      mantras: [
        'SHAM (som de cura)',
        'KSHAM (purificação)',
        'OM SHANTI (paz)',
      ],
      horarios_rituais: [
        'Manhã cedo (primeiro quarto)',
        'Quarta-feira (dia de Mercúrio)',
        'Horário de Mercúrio: 8h-10h',
      ],
      cores_rituais: ['Verde-escuro', 'Marrom', 'Amarelo-claro'],
      ofertas: ['Ervas frescas', 'Mel', 'Grãos', 'Velas verdes'],
    },
    correspondencia_cabala: {
      sefirot: 'Netzach (Vitória)',
      caminho_sefirotico: 'Caminho 25 - entre Tiphereth e Hod',
      arcanjo: 'Haniel (Chaniel)',
    },
  },
  /** Ar - Quente - Húmido - Yang - harmonioso, diplomático, justo, social */
  Libra: {
    signo: 'Libra',
    elemento: 'Ar',
    qualidades_elementares: {
      quente_frio: 'Quente',
      humido_seco: 'Húmido',
      polaridade: 'Yang',
      vibração: 'Equilibrada e harmônica, energia de justiça e partnerships',
    },
    praticas_espirituais: {
      ebos: [
        'Ebo de harmonia em relacionamentos',
        'Ebo de justiça e equidade',
      ],
      banhos: [
        'Banho de lavanda e rosa para amor e harmonia',
        'Banho de valeriana e erva-cidreira',
      ],
      defumacoes: [
        'Rosa para amor',
        'Verbena para harmonia',
        'Junípero para proteção legal',
      ],
      mantras: [
        'SHUM (som de equilíbrio)',
        'OM SHANTI (paz)',
        'AIM (consorte divina)',
      ],
      horarios_rituais: [
        'Fim da tarde (balance point)',
        'Sexta-feira (dia de Vénus)',
        'Horário de Vénus: 9h-11h',
      ],
      cores_rituais: ['Rosa', 'Azul-claro', 'Lavanda'],
      ofertas: ['Balança (representação)', 'Flores rosas', 'Perfume de rosa', 'Vinho branco'],
    },
    correspondencia_cabala: {
      sefirot: 'Chesed (Misericórdia)',
      caminho_sefirotico: 'Caminho 13 - entre Chokmah e Tiphereth',
      arcanjo: 'Zadkiel (Tzadkiel)',
    },
  },
  /** Água - Frio - Húmido - Yin - intenso, transformação, oculto, profundo */
  Escorpião: {
    signo: 'Escorpião',
    elemento: 'Água',
    qualidades_elementares: {
      quente_frio: 'Frio',
      humido_seco: 'Húmido',
      polaridade: 'Yin',
      vibração: 'Profunda e transformadora, energia de regeneração e mistério',
    },
    praticas_espirituais: {
      ebos: [
        'Ebo de transformação e renascimento',
        'Ebo de proteção contra feitiçaria',
      ],
      banhos: [
        'Banho de sálvia e purificação profunda',
        'Banho de alecrim e sal grosso',
      ],
      defumacoes: [
        'Sálvia para exorcismo',
        'Mastruz para limpeza profunda',
        'Arruda para proteção',
      ],
      mantras: [
        'KHAM (som de transformação)',
        'VAM (karma clearing)',
        'HUM PHAT (purificação profunda)',
      ],
      horarios_rituais: [
        'Meia-noite (ponto de transformação)',
        'Terça-feira (dia de Marte)',
        'Horário de Plutão: 20h-22h',
      ],
      cores_rituais: ['Preto', 'Vermelho-escuro', 'Carmesim'],
      ofertas: ['Escorpião (representação)', 'Café preto', 'Vinho tinto', 'Pimenta'],
    },
    correspondencia_cabala: {
      sefirot: 'Geburah (Severidade)',
      caminho_sefirotico: 'Caminho 27 - entre Tiphereth e Hod',
      arcanjo: 'Kamael (Camil)',
    },
  },
  /** Fogo - Quente - Seco - Yang - filosófico, otimista, aventureiro, expansivo */
  Sagitário: {
    signo: 'Sagitário',
    elemento: 'Fogo',
    qualidades_elementares: {
      quente_frio: 'Quente',
      humido_seco: 'Seco',
      polaridade: 'Yang',
      vibração: 'Expansiva e visionária, energia de busca e exploração',
    },
    praticas_espirituais: {
      ebos: [
        'Ebo de abundância e riqueza',
        'Ebo de viagem e proteção em estradas',
      ],
      banhos: [
        'Banho de alecrim para prosperidade',
        'Banho de cúrcuma e gengibre',
      ],
      defumacoes: [
        'Gengibre para energia',
        'Cardamomo para clareza',
        "Pau-d'alho para proteção",
      ],
      mantras: [
        'GAM (som de expansão)',
        'RAM RAM (oxalá e oxóssi)',
        'BHRUM (abundância)',
      ],
      horarios_rituais: [
        'Tarde (quinto dia)',
        'Quinta-feira (dia de Júpiter)',
        'Horário de Júpiter: 14h-16h',
      ],
      cores_rituais: ['Roxo', 'Azul-royal', 'Dourado'],
      ofertas: ['Flecha (representação)', 'Arco', 'Cachaça', 'Frango assado', 'Fumo'],
    },
    correspondencia_cabala: {
      sefirot: 'Chesed (Misericórdia)',
      caminho_sefirotico: 'Caminho 16 - entre Chesed e Gedulah',
      arcanjo: 'Tzadkiel (Tzadkiel)',
    },
  },
  /** Terra - Frio - Seco - Yin - ambicioso, disciplinado, responsável, paciente */
  Capricórnio: {
    signo: 'Capricórnio',
    elemento: 'Terra',
    qualidades_elementares: {
      quente_frio: 'Frio',
      humido_seco: 'Seco',
      polaridade: 'Yin',
      vibração: 'Estruturada e persistente, energia de disciplina e conquista',
    },
    praticas_espirituais: {
      ebos: [
        'Ebo de carreira e sucesso',
        'Ebo de proteção contra falhas',
      ],
      banhos: [
        'Banho de alecrim e dedicação',
        'Banho de pinho e eucalipto',
      ],
      defumacoes: [
        'Pau-ferro para força',
        'Alecrim para clareza',
        'Canela para sucesso',
      ],
      mantras: [
        'OM OM OM (som de Satya)',
        'HUM HUM (determinação)',
        'KSHAM (trabalho)',
      ],
      horarios_rituais: [
        'Madrugada (primeiro horóscopo)',
        'Sábado (dia de Saturno)',
        'Horário de Saturno: 15h-17h',
      ],
      cores_rituais: ['Preto', 'Cinza', 'Marrom-escuro'],
      ofertas: ['Chifre de bode (representação)', 'Pedras negras', 'Fumo', 'Café preto'],
    },
    correspondencia_cabala: {
      sefirot: 'Binah (Entendimento)',
      caminho_sefirotico: 'Caminho 7 - entre Chokmah e Binah',
      arcanjo: 'Cassiel (Kamael)',
    },
  },
  /** Ar - Quente - Húmido - Yang - humanitário, original, independente, rebelde */
  Aquário: {
    signo: 'Aquário',
    elemento: 'Ar',
    qualidades_elementares: {
      quente_frio: 'Quente',
      humido_seco: 'Húmido',
      polaridade: 'Yang',
      vibração: 'Libertadora e visionária, energia de inovação e fraternidade',
    },
    praticas_espirituais: {
      ebos: [
        'Ebo de liberdade espiritual',
        'Ebo de abertura mental e sabedoria',
      ],
      banhos: [
        'Banho de lavanda e libertação',
        'Banho de verbena e citrus',
      ],
      defumacoes: [
        'Verbena para espiritualidade',
        'Lótus para iluminação',
        'Eucalipto para renovação',
      ],
      mantras: [
        'OM OM OM (som de UR)',
        'YA YA (chamada da liberdade)',
        'BHRAM (rotação)',
      ],
      horarios_rituais: [
        'Qualquer horário (coringa)',
        'Sábado (dia de Urano)',
        'Horário de Urano: 22h-24h',
      ],
      cores_rituais: ['Azul-escuro', 'Roxo', 'Prata'],
      ofertas: ['Água (garrafa)', 'Círculo de crystals', 'Pombo', 'Incenso de sândalo'],
    },
    correspondencia_cabala: {
      sefirot: 'Chokmah (Sabedoria)',
      caminho_sefirotico: 'Caminho 3 - entre Kether e Chokmah',
      arcanjo: 'Tzaphkiel (Tzaphkiel)',
    },
  },
  /** Água - Frio - Húmido - Yin - compassivo, sonhador, artístico, intuitivo */
  Peixes: {
    signo: 'Peixes',
    elemento: 'Água',
    qualidades_elementares: {
      quente_frio: 'Frio',
      humido_seco: 'Húmido',
      polaridade: 'Yin',
      vibração: 'Transcendente e receptiva, energia de unidade com o divino',
    },
    praticas_espirituais: {
      ebos: [
        'Ebo de enlightenment espiritual',
        'Ebo de proteção contra energies negativas',
      ],
      banhos: [
        'Banho de jasmim e iluminação',
        'Banho de água do mar e flor de laranjeira',
      ],
      defumacoes: [
        'Lótus para espiritualidade',
        'Jasmim para compaixão',
        'Sálvia branca para pureza',
      ],
      mantras: [
        'OM OM OM (moksha)',
        'SO HAM (eu sou)',
        'AUM (som do universo)',
      ],
      horarios_rituais: [
        'Qualquer horário (melhor ao anoitecer)',
        'Quarta-feira (dia de Neptuno)',
        'Horário de Neptuno: 21h-23h',
      ],
      cores_rituais: ['Verde-água', 'Roxo', 'Branco'],
      ofertas: ['Peixe (representação)', 'Âmbar', 'Vinho Moscatel', 'Flores do mar'],
    },
    correspondencia_cabala: {
      sefirot: 'Kether (Corona)',
      caminho_sefirotico: 'Caminho 1 - entre Kether e Binah',
      arcanjo: 'Metatron (Metatron)',
    },
  },
} as const;

/**
 * Returns the complete zodiac-element mapping for a given sign name.
 * Case-insensitive matching with normalization.
 * 
 * @param signo - The zodiac sign name (Áries, Touro, etc.)
 * @returns The complete ZodiacElementMapping or null if not found
 */
export function getZodiacElement(signo: string): ZodiacElementMapping | null {
  const normalized = signo
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const signMap: Record<string, Signo> = {
    aries: 'Áries',
    touro: 'Touro',
    gemeos: 'Gémeos',
    cancer: 'Câncer',
    leao: 'Leão',
    virgem: 'Virgem',
    libra: 'Libra',
    escorpiao: 'Escorpião',
    sagitario: 'Sagitário',
    capricornio: 'Capricórnio',
    aquario: 'Aquário',
    peixes: 'Peixes',
  };

  const key = signMap[normalized];
  if (key && ZODIAC_ELEMENT_MAPPINGS[key]) {
    return ZODIAC_ELEMENT_MAPPINGS[key];
  }

  return null;
}

/**
 * Returns the element mapping for a given element name.
 * Reverse lookup from element to zodiac signs.
 * 
 * @param elemento - The element name (Fogo, Água, Ar, Terra, Éter)
 * @returns Array of zodiac signs with that element, or null if element not found
 */
export function getElementZodiac(elemento: string): ZodiacElementMapping[] | null {
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

  const element = elementMap[normalized];
  if (!element) return null;

  const signs = Object.values(ZODIAC_ELEMENT_MAPPINGS).filter(
    (mapping) => mapping.elemento === element
  );

  return signs.length > 0 ? signs : null;
}

/**
 * Returns all zodiac-element mappings.
 * Useful for iteration and display purposes.
 * 
 * @returns Array of all ZodiacElementMapping entries
 */
export function getAllZodiacElements(): ZodiacElementMapping[] {
  return Object.values(ZODIAC_ELEMENT_MAPPINGS);
}

/**
 * Returns the primary element for a given sign.
 * 
 * @param signo - The zodiac sign name
 * @returns The element name or null if not found
 */
export function getElementFromZodiac(signo: string): Elemento | null {
  return getZodiacElement(signo)?.elemento ?? null;
}

/**
 * Returns the element qualities for a given sign.
 * 
 * @param signo - The zodiac sign name
 * @returns The element qualities or null if not found
 */
export function getQualidadesFromZodiac(signo: string): ZodiacElementMapping['qualidades_elementares'] | null {
  return getZodiacElement(signo)?.qualidades_elementares ?? null;
}

/**
 * Returns the spiritual practices for a given sign.
 * 
 * @param signo - The zodiac sign name
 * @returns The spiritual practices or null if not found
 */
export function getPraticasFromZodiac(signo: string): ZodiacElementMapping['praticas_espirituais'] | null {
  return getZodiacElement(signo)?.praticas_espirituais ?? null;
}

/**
 * Returns all signs belonging to a given element.
 * 
 * @param elemento - The element name
 * @returns Array of zodiac signs
 */
export function getSignosByElement(elemento: string): Signo[] {
  const mapping = getElementZodiac(elemento);
  if (!mapping) return [];
  return mapping.map((m) => m.signo);
}

/**
 * Returns all signs with a given polarity.
 * 
 * @param polaridade - 'Yang' or 'Yin'
 * @returns Array of zodiac signs
 */
export function getSignosByPolaridade(polaridade: 'Yang' | 'Yin'): Signo[] {
  return Object.values(ZODIAC_ELEMENT_MAPPINGS)
    .filter((mapping) => mapping.qualidades_elementares.polaridade === polaridade)
    .map((mapping) => mapping.signo);
}

/**
 * Returns the Cabala correspondence for a given sign.
 * 
 * @param signo - The zodiac sign name
 * @returns The Cabala correspondence or null if not found
 */
export function getCabalaFromZodiac(signo: string): ZodiacElementMapping['correspondencia_cabala'] | null {
  return getZodiacElement(signo)?.correspondencia_cabala ?? null;
}