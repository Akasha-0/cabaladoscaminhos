/**
 * Sound-Orixá Spiritual Correlation Module
 * Maps sacred sounds, mantras, and frequencies to Orixás of Candomblé/Umbanda
 * Based on IDEIA.md - Cabala dos Caminhos framework
 *
 * Each Orixá has specific vibrational signatures through sounds, mantras,
 * and their healing frequencies for spiritual work.
 */

export interface SoundOrixa {
  /** Sound/mantra identifier (e.g., "OM", "LARÉ") */
  som: string;
  /** Pronunciation guide */
  pronunciacao: string;
  /** Primary Orixá name */
  orixa: string;
  /** Secondary Orixá (if applicable) */
  orixa_secundario?: string;
  /** Element associated with this sound */
  elemento: string;
  /** Frequency in Hz */
  frequencia: number;
  /** Chakra associated */
  chakra: string;
  /** Day of week associated */
  dia_semana: string;
  /** Color correspondence */
  cor: string;
  /** Healing properties */
  propriedades_healing: {
    /** Physical healing focus */
    fisico: string;
    /** Emotional healing focus */
    emocional: string;
    /** Mental/spiritual healing focus */
    mental_espiritual: string;
    /** Recommended practice */
    pratica: string;
  };
  /** Yoruba prayer or affirmation */
  oracao_yoruba: string;
  /** Ritual tool or offering */
  ferramenta_ritual: string;
  /** Meaning of the sound */
  significado: string;
}

/**
 * Complete mapping of sacred sounds/mantras to their Orixá correspondences.
 * Based on IDEIA.md and the Cabala dos Caminhos system data.
 * Keys are normalized to uppercase ASCII for case-insensitive lookup.
 */
export const SOUND_ORIXA_MAP: Record<string, SoundOrixa> = {
  "OM": {
    som: "OM",
    pronunciacao: "Aum (som primordial, vibração universal)",
    orixa: "Ori",
    orixa_secundario: "Oxumaré",
    elemento: "Éter",
    frequencia: 963,
    chakra: "7º Coronário (Sahasrara)",
    dia_semana: "Domingo",
    cor: "Branco-dourado",
    propriedades_healing: {
      fisico: "Restaura padrão original do DNA e regeneração celular",
      emocional: "Promove paz profunda e unidade com tudo existente",
      mental_espiritual: "Conexão direta com a Fonte criadora e infinito",
      pratica: "Meditação silenciosa, contemplação pura, oração profunda",
    },
    oracao_yoruba: "Ori mi, que minha cabeça seja iluminada pela verdade",
    ferramenta_ritual: "Pranche (prancha), coco, água do mar",
    significado: "Som primordial - representa a vibração do universo",
  },
  "LARE": {
    som: "LARÉ",
    pronunciacao: "Lah-reh (vibração terrestre, ancoramento)",
    orixa: "Oxalufã",
    orixa_secundario: "Omulu",
    elemento: "Terra",
    frequencia: 396,
    chakra: "1º Básico (Muladhara)",
    dia_semana: "Segunda-feira",
    cor: "Branco",
    propriedades_healing: {
      fisico: "Fortalece ossos, sistema imunológico e órgãos vitais",
      emocional: "Dissolve medos de sobrevivência e sensação de insegurança",
      mental_espiritual: "Promove clareza mental, foco e determinação",
      pratica: "Meditação em grupo, trabalho ancestral, firmeza",
    },
    oracao_yoruba: "Oxalufã / Obaluayê, dá-me firmeza e proteção",
    ferramenta_ritual: "Al Guidanceê (cabaça), fumo, charuto",
    significado: "Firmeza e proteção ancestral",
  },
  "IEMANJA": {
    som: "YEMANJÁ",
    pronunciacao: "Yeh-man-já (vibração das águas profundas)",
    orixa: "Iemanjá",
    orixa_secundario: "Oxum",
    elemento: "Água",
    frequencia: 417,
    chakra: "2º Sacro (Svadhisthana)",
    dia_semana: "Sábado",
    cor: "Azul e Branco",
    propriedades_healing: {
      fisico: "Hidrata tecidos, melhora circulação e limpeza celular",
      emocional: "Liberta traumas emocionais e padrões do passado",
      mental_espiritual: "Facilita adaptação, flexibilidade e renovação",
      pratica: "Trabalho emocional profundo, terapia vibracional, banhos",
    },
    oracao_yoruba: "Iemanjá, mãe das águas, abraça minha alma",
    ferramenta_ritual: "Espelho, flores brancas, água do mar, perfume",
    significado: "Mãe das águas - proteção e renovação emocional",
  },
  "OXUM": {
    som: "OXUM",
    pronunciacao: "Oh-shum (vibração dourada, prosperidade)",
    orixa: "Oxum",
    orixa_secundario: "Iemanjá",
    elemento: "Água",
    frequencia: 417,
    chakra: "2º Sacro (Svadhisthana)",
    dia_semana: "Sábado",
    cor: "Amarelo-dourado",
    propriedades_healing: {
      fisico: "Hidrata tecidos, melhora circulação e limpeza celular",
      emocional: "Liberta traumas emocionais e padrões do passado",
      mental_espiritual: "Facilita adaptação, flexibilidade e renovação",
      pratica: "Trabalho emocional profundo, terapia vibracional",
    },
    oracao_yoruba: "Oxum, abre as águas da prosperidade em minha vida",
    ferramenta_ritual: "Espelho, flores amarelas, mel, colares dourados",
    significado: "Rainha das águas doces - amor e prosperidade",
  },
  "XANGO": {
    som: "XANGÔ",
    pronunciacao: "Shangô (vibração do raio, transformação)",
    orixa: "Xangô",
    orixa_secundario: "Logun Ede",
    elemento: "Fogo",
    frequencia: 528,
    chakra: "3º Plexo Solar (Manipura)",
    dia_semana: "Quarta-feira",
    cor: "Vermelho",
    propriedades_healing: {
      fisico: "Estimula metabolismo, sistema nervoso e força vital",
      emocional: "Transforma negatividade em compaixão e amor incondicional",
      mental_espiritual: "Ativa criatividade, intuição e manifestação",
      pratica: "Trabalho com intenção, cura energética avançada",
    },
    oracao_yoruba: "Xangô, concede-me a força da justiça e do equilíbrio",
    ferramenta_ritual: "Oxê (Machado de dois Bost), pedras de raio, espada",
    significado: "Senhor do raio - justiça e transformação",
  },
  "OXOSSI": {
    som: "OXÓSSI",
    pronunciacao: "Oh-shóssi (vibração do ar, caça espiritual)",
    orixa: "Oxóssi",
    orixa_secundario: "Nanã Buruquá",
    elemento: "Ar",
    frequencia: 639,
    chakra: "4º Cardíaco (Anahata)",
    dia_semana: "Terça-feira",
    cor: "Verde",
    propriedades_healing: {
      fisico: "Equilibra sistema respiratório e circulatório",
      emocional: "Harmoniza relacionamentos e promove paz interior",
      mental_espiritual: "Abre canal de comunicação com o divino",
      pratica: "Trabalho com casal, cura de relacionamentos, meditação",
    },
    oracao_yoruba: "Oxóssi, guia-me pela trilha da sabedoria",
    ferramenta_ritual: "Arco e flecha, cabaça, ervas de mato",
    significado: "Caçador espiritual - busca da verdade e sabedoria",
  },
  "IANSA": {
    som: "IANSÃ",
    pronunciacao: "Yan-sã (vibração do fogo, transformação)",
    orixa: "Iansã",
    orixa_secundario: "Obá",
    elemento: "Fogo",
    frequencia: 741,
    chakra: "5º Laríngeo (Vishuddha)",
    dia_semana: "Quarta-feira",
    cor: "Laranja",
    propriedades_healing: {
      fisico: "Limpa garganta, ouvidos e vias respiratórias",
      emocional: "Liberta medo de falar verdades e se expressar autenticamente",
      mental_espiritual: "Desperta sabedoria interior e expressão criativa",
      pratica: "Cantos, mantras, trabalho com voz e som",
    },
    oracao_yoruba: "Iansã, dá-me coragem para transformação",
    ferramenta_ritual: "Eruexim (chicote), espada, fogo, faca",
    significado: "Senhora do raio - coragem e transformação",
  },
  "OGUM": {
    som: "OGUM",
    pronunciacao: "Oh-gum (vibração do ferro, trabalho)",
    orixa: "Ogum",
    orixa_secundario: "Oxóssi",
    elemento: "Fogo",
    frequencia: 741,
    chakra: "3º Plexo Solar (Manipura)",
    dia_semana: "Terça-feira",
    cor: "Vermelho",
    propriedades_healing: {
      fisico: "Fortalece músculos, sistema circulatório e energia vital",
      emocional: "Dissolve obstáculos e promove coragem para agir",
      mental_espiritual: "Ativa força de vontade e determinação",
      pratica: "Trabalho com intenção, movimento, ação",
    },
    oracao_yoruba: "Ogum, abre meu caminho com a força do ferro",
    ferramenta_ritual: "Espada, chave, faca, ferro",
    significado: "Senhor do ferro - trabalho e conquista",
  },
  "LOGUN_EDE": {
    som: "LOGUN EDÉ",
    pronunciacao: "Lo-gun E-dé (vibração dualidade, caça e água)",
    orixa: "Logun Ede",
    orixa_secundario: "Oxóssi, Oxum",
    elemento: "Água",
    frequencia: 528,
    chakra: "2º Sacro (Svadhisthana)",
    dia_semana: "Sábado",
    cor: "Verde e Amarelo",
    propriedades_healing: {
      fisico: "Equilibra sistema hormonal e glandular",
      emocional: "Harmoniza aspectos masculino e feminino",
      mental_espiritual: "Promove integração e wholeness",
      pratica: "Trabalho de integração, meditação dualidade",
    },
    oracao_yoruba: "Logun Ede, une as águas e a caça em mim",
    ferramenta_ritual: "Arco e flecha, espelho, flores, ervas",
    significado: "Caçador das águas - integração dualidade",
  },
  "NANA": {
    som: "NANÃ",
    pronunciacao: "Na-nã (vibração da lama, transformação)",
    orixa: "Nanã Buruquá",
    orixa_secundario: "Oxumaré",
    elemento: "Terra",
    frequencia: 396,
    chakra: "1º Básico (Muladhara)",
    dia_semana: "Segunda-feira",
    cor: "Roxo e Branco",
    propriedades_healing: {
      fisico: "Limpa sistema linfático e celular profundo",
      emocional: "Liberta apegos e padrões antigos",
      mental_espiritual: "Promove renascimento e transformação profunda",
      pratica: "Trabalho de purificação, banhos, mescla",
    },
    oracao_yoruba: "Nanã Buruquá, purifica minha alma com a lama sagrada",
    ferramenta_ritual: "Borracha, boneca, mescla (barro)",
    significado: "Mãe da lama - purificação e renascimento",
  },
  "OXUMARE": {
    som: "OXumaré",
    pronunciacao: "Oh-shu-ma-ré (vibração da cobra, ciclos)",
    orixa: "Oxumaré",
    orixa_secundario: "Ossaim",
    elemento: "Éter",
    frequencia: 852,
    chakra: "6º Frontal (Ajna)",
    dia_semana: "Domingo",
    cor: "Arco-íris",
    propriedades_healing: {
      fisico: "Equilibra glândula pineal e sistema nervoso central",
      emocional: "Dissipa ilusões e restaura visão clara da realidade",
      mental_espiritual: "Desperta capacidades psíquicas e consciência expandida",
      pratica: "Meditação profunda, trabalho com terceiro olho",
    },
    oracao_yoruba: "Oxumaré, completa o ciclo da minha transformação",
    ferramenta_ritual: "Cobra de madeira, jimboa (serpente), arco-íris",
    significado: "Cobra do arco-íris - ciclos e renovação completa",
  },
  "OBA": {
    som: "OBÁ",
    pronunciacao: "Oh-bá (vibração do amor, fidelidade)",
    orixa: "Obá",
    orixa_secundario: "Iansã",
    elemento: "Fogo",
    frequencia: 741,
    chakra: "5º Laríngeo (Vishuddha)",
    dia_semana: "Quarta-feira",
    cor: "Laranja e Dourado",
    propriedades_healing: {
      fisico: "Fortalece coração e sistema circulatório",
      emocional: "Promove fidelidade e amor profundo",
      mental_espiritual: "Desperta devoção e compromisso sagrado",
      pratica: "Trabalho com relacionamentos, devoção",
    },
    oracao_yoruba: "Obá, guarda meu coração com fidelidade",
    ferramenta_ritual: "Faca, espada, ouro, colares",
    significado: "Senhora do amor - fidelidade e devoção",
  },
  "OSSAIM": {
    som: "OSSANIM",
    pronunciacao: "Oh-ssã-nim (vibração das folhas, sabedoria)",
    orixa: "Ossaim",
    orixa_secundario: "Oxumaré",
    elemento: "Terra",
    frequencia: 528,
    chakra: "4º Cardíaco (Anahata)",
    dia_semana: "Sexta-feira",
    cor: "Verde",
    propriedades_healing: {
      fisico: "Fortalece sistema imunológico e cicatrização",
      emocional: "Promove sabedoria herbal e conhecimento natural",
      mental_espiritual: "Desperta capacidade de cura natural",
      pratica: "Trabalho com ervas, banhos, chás",
    },
    oracao_yoruba: "Ossaim, ensina-me a cura das folhas sagradas",
    ferramenta_ritual: "Folhas, ervas, livros, penas de galo",
    significado: "Senhor das folhas - sabedoria herbal e cura",
  },
  "EWA": {
    som: "EWA",
    pronunciacao: "Eh-wa (vibração do céu, destino)",
    orixa: "Ewa",
    orixa_secundario: "Oxum",
    elemento: "Água",
    frequencia: 639,
    chakra: "6º Frontal (Ajna)",
    dia_semana: "Sexta-feira",
    cor: "Azul e Branco",
    propriedades_healing: {
      fisico: "Equilibra sistema hormonal e glândulas",
      emocional: "Promove aceitação do destino e paz",
      mental_espiritual: "Desperta visão clara e intuição",
      pratica: "Trabalho com destino, oráculos, previsão",
    },
    oracao_yoruba: "Ewa, mostra-me meu caminho no céu",
    ferramenta_ritual: "Colares azuis, conchas, água benta",
    significado: "Senhora do céu - destino e proteção",
  },
  "INZETE": {
    som: "INZETE",
    pronunciacao: "In-ze-te (vibração do mar, mistérios)",
    orixa: "Inzete",
    orixa_secundario: "Iemanjá",
    elemento: "Água",
    frequencia: 417,
    chakra: "2º Sacro (Svadhisthana)",
    dia_semana: "Sábado",
    cor: "Azul",
    propriedades_healing: {
      fisico: "Harmoniza fluidos corporais e eletrólitos",
      emocional: "Promove conexão com o inconsciente",
      mental_espiritual: "Desperta mistérios e capacidade de sonho",
      pratica: "Trabalho onírico, meditação aquática",
    },
    oracao_yoruba: "Inzete, revela-me os mistérios do mar",
    ferramenta_ritual: "Água do mar, pérolas, peixes, conchas",
    significado: "Senhora do mar - mistérios e sonhos",
  },
};

/**
 * Normalize sound string for lookup - converts accented chars to ASCII equivalents
 */
function normalizeSound(som: string): string {
  return som
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ô/g, "O")
    .replace(/Ã/g, "A")
    .replace(/Á/g, "A")
    .replace(/É/g, "E")
    .replace(/Í/g, "I")
    .replace(/Ó/g, "O")
    .replace(/Ú/g, "U")
    .replace(/Ê/g, "E")
    .replace(/Ê/g, "E")
    .replace(/Ê/g, "E");
}

/**
 * Get the sound-Orixá mapping for a given sound/mantra
 * @param som - Sound or mantra identifier (e.g., "OM", "XANGÔ", "LARÉ", "IEMANJÁ", "Oxumaré")
 * @returns SoundOrixa mapping or undefined if not found
 */
export function getSoundOrixa(som: string): SoundOrixa | undefined {
  const normalized = normalizeSound(som);
  return SOUND_ORIXA_MAP[normalized];
}

/**
 * Get the reverse mapping: Orixá to associated sounds
 * @returns Record mapping each Orixá to their associated sounds
 */
export function getOrixaSound(): Record<string, string[]> {
  const mapping: Record<string, string[]> = {};
  
  Object.values(SOUND_ORIXA_MAP).forEach((soundOrixa) => {
    if (!mapping[soundOrixa.orixa]) {
      mapping[soundOrixa.orixa] = [];
    }
    if (!mapping[soundOrixa.orixa].includes(soundOrixa.som)) {
      mapping[soundOrixa.orixa].push(soundOrixa.som);
    }
    
    // Also include secondary Orixá
    if (soundOrixa.orixa_secundario) {
      // Handle multiple secondary Orixás separated by comma
      const secundaries = soundOrixa.orixa_secundario.split(",").map(s => s.trim());
      secundaries.forEach(sec => {
        if (!mapping[sec]) {
          mapping[sec] = [];
        }
        if (!mapping[sec].includes(soundOrixa.som)) {
          mapping[sec].push(soundOrixa.som);
        }
      });
    }
  });
  
  return mapping;
}

/**
 * Get all sound-Orixá mappings
 * @returns Array of all SoundOrixa objects
 */
export function getAllSoundOrixas(): SoundOrixa[] {
  return Object.values(SOUND_ORIXA_MAP);
}

/**
 * Get all sounds associated with a specific Orixá
 * @param orixa - Orixá name (case-insensitive)
 * @returns Array of SoundOrixa mappings
 */
export function getSoundsByOrixa(orixa: string): SoundOrixa[] {
  const upperOrixa = orixa.toUpperCase();
  return Object.values(SOUND_ORIXA_MAP).filter(
    (s) => s.orixa.toUpperCase() === upperOrixa || 
           s.orixa_secundario?.toUpperCase().includes(upperOrixa)
  );
}

/**
 * Get all sounds for a specific element
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of SoundOrixa mappings
 */
export function getSoundsByElement(elemento: string): SoundOrixa[] {
  const upperElemento = elemento.toUpperCase();
  return Object.values(SOUND_ORIXA_MAP).filter(
    (s) => s.elemento.toUpperCase() === upperElemento
  );
}

/**
 * Get all registered Orixá names
 * @returns Array of unique Orixá names
 */
export function getAllOrixas(): string[] {
  const orixas = new Set<string>();
  Object.values(SOUND_ORIXA_MAP).forEach((s) => {
    orixas.add(s.orixa);
    if (s.orixa_secundario) {
      s.orixa_secundario.split(",").forEach(sec => orixas.add(sec.trim()));
    }
  });
  return Array.from(orixas).sort();
}

/**
 * Get healing properties for a given sound
 * @param som - Sound or mantra identifier
 * @returns Healing properties object or null if not found
 */
export function getHealingBySound(som: string): SoundOrixa['propriedades_healing'] | null {
  const soundOrixa = getSoundOrixa(som);
  return soundOrixa?.propriedades_healing ?? null;
}

/**
 * Get the frequency for a given sound
 * @param som - Sound or mantra identifier
 * @returns Frequency in Hz or null if not found
 */
export function getFrequencyBySound(som: string): number | null {
  const soundOrixa = getSoundOrixa(som);
  return soundOrixa?.frequencia ?? null;
}

/**
 * Get the chakra for a given sound
 * @param som - Sound or mantra identifier
 * @returns Chakra name or null if not found
 */
export function getChakraBySound(som: string): string | null {
  const soundOrixa = getSoundOrixa(som);
  return soundOrixa?.chakra ?? null;
}

/**
 * Get the Yoruba prayer for a given sound
 * @param som - Sound or mantra identifier
 * @returns Prayer string or null if not found
 */
export function getOrayoBySound(som: string): string | null {
  const soundOrixa = getSoundOrixa(som);
  return soundOrixa?.oracao_yoruba ?? null;
}

/**
 * Get the element for a given sound
 * @param som - Sound or mantra identifier
 * @returns Element name or null if not found
 */
export function getElementBySound(som: string): string | null {
  const soundOrixa = getSoundOrixa(som);
  return soundOrixa?.elemento ?? null;
}