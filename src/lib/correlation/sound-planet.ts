/**
 * Sound-Planet Spiritual Correlation Module
 * Maps sacred sounds, mantras, and musical types to classical planets.
 * Based on classical Western astrology integrated with sound healing traditions.
 * Complements the planet-sound.ts module with detailed sound-to-planet mappings.
 */

export interface SoundPlanet {
  /** Sound or music type identifier */
  som: string;
  /** Pronunciation or description of the sound */
  pronunciacao: string;
  /** Associated planet name */
  planeta: string;
  /** Planet number (traditional order: 1-7) */
  planeta_numero: number;
  /** Element associated with this sound-planet correspondence */
  elemento: string;
  /** Chakra associated with this sound */
  chakra: string;
  /** Musical instrument or tradition type */
  instrumento_tradicional?: string;
  /** Day of week associated */
  dia_semana: string;
  /** Color correspondence */
  cor: string;
  /** Spiritual meaning and significance */
  significado_espiritual: string;
  /** Healing properties for this sound-planet correlation */
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
  /** Frequency in Hz */
  frequencia: number;
  /** Musical note */
  nota_musical: string;
  /** Mantra or sacred affirmation */
  mantra: string;
}

/**
 * Complete mapping of sacred sounds/music types to their planetary correspondences.
 * Based on classical Western astrology and sound healing traditions.
 * Keys are normalized to uppercase ASCII for case-insensitive lookup.
 */
const SOUND_PLANET_MAP: Record<string, SoundPlanet> = {
  "RAM": {
    som: "RAM",
    pronunciacao: "Rahm (vibração solar, luz interior)",
    planeta: "Sol",
    planeta_numero: 1,
    elemento: "Fogo",
    chakra: "7º Coronário (Sahasrara)",
    instrumento_tradicional: "Gong solar, sinos de cristal, harpa",
    dia_semana: "Domingo",
    cor: "Dourado",
    significado_espiritual: "Som da luz interior e propósito divino. Promove transformação奇迹 e desperta o eu superior.",
    propriedades_healing: {
      fisico: "Estimula regeneração celular, fortalece coração e sistema circulatório",
      emocional: "Promove alegria, confiança e autorrealização",
      mental_espiritual: "Ativa propósito de vida e conexão com o divino",
      pratica: "Meditação solar, visualização da luz dourada, canto de mantras",
    },
    frequencia: 528,
    nota_musical: "E",
    mantra: "Eu sou a luz que ilumina meu caminho",
  },
  "OM": {
    som: "OM",
    pronunciacao: "Aum (som primordial, vibração lunar)",
    planeta: "Lua",
    planeta_numero: 2,
    elemento: "Água",
    chakra: "1º Básico (Muladhara)",
    instrumento_tradicional: "Tingsha, bowls tibetanos, água",
    dia_semana: "Segunda-feira",
    cor: "Prata",
    significado_espiritual: "Som da intuição lunar e receptividade. Conecta com o inconsciente e os ciclos naturais.",
    propriedades_healing: {
      fisico: "Hidrata tecidos, equilibra fluidos corporais e glândulas",
      emocional: "Promove calma, sonho reparador e conexão com emoções",
      mental_espiritual: "Desperta intuição, percepção extrasensorial e sabedoria interior",
      pratica: "Meditação lunar, trabalho com sonhos, banhos sonoros",
    },
    frequencia: 852,
    nota_musical: "A",
    mantra: "Eu fluo com os ciclos da vida",
  },
  "VAM": {
    som: "VAM",
    pronunciacao: "Vahm (vibração marciana, coragem)",
    planeta: "Marte",
    planeta_numero: 3,
    elemento: "Fogo",
    chakra: "1º Básico (Muladhara)",
    instrumento_tradicional: "Tambores de guerra, djembe, atabaque",
    dia_semana: "Terça-feira",
    cor: "Vermelho",
    significado_espiritual: "Som de coragem, força vital e ação decisiva. Transforma medo em poder pessoal.",
    propriedades_healing: {
      fisico: "Fortalece músculos, ossos, sistema sanguíneo e energia vital",
      emocional: "Dissolve medos, promove coragem e assertividade",
      mental_espiritual: "Ativa força de vontade, determinação e proteção",
      pratica: "Trabalho de empowerment, drumming ritual, movimento energizado",
    },
    frequencia: 432,
    nota_musical: "D",
    mantra: "Eu ago com coragem e propósito",
  },
  "AUM": {
    som: "AUM",
    pronunciacao: "Aum (som mercurial, comunicação)",
    planeta: "Mercúrio",
    planeta_numero: 4,
    elemento: "Ar",
    chakra: "3º Plexo Solar (Manipura)",
    instrumento_tradicional: "Flautas, pandeiro, viola caipira",
    dia_semana: "Quarta-feira",
    cor: "Amarelo",
    significado_espiritual: "Som da comunicação clara e mentalidade aberta. Abre caminhos e facilita aprendizado.",
    propriedades_healing: {
      fisico: "Equilibra sistema nervoso, tireoide e metabolismo",
      emocional: "Promove clareza emocional, expressão autêntica e diálogos saudáveis",
      mental_espiritual: "Desperta inteligência, memória e capacidade de comunicação",
      pratica: "Cantos grupais, recitação de mantras, trabalho vocal",
    },
    frequencia: 741,
    nota_musical: "F#",
    mantra: "Minhas palavras são channel de luz e verdade",
  },
  "HAM": {
    som: "HAM",
    pronunciacao: "Hahm (vibração jupiteriana, expansão)",
    planeta: "Júpiter",
    planeta_numero: 5,
    elemento: "Fogo/Água",
    chakra: "4º Cardíaco (Anahata)",
    instrumento_tradicional: "Trompas, órgãos, gamelan, músicas orquestrais",
    dia_semana: "Quinta-feira",
    cor: "Azul-royal",
    significado_espiritual: "Som da expansão espiritual e sabedoria. Liberta medos e abre portas para abundance.",
    propriedades_healing: {
      fisico: "Fortalece fígado, sistema circulatório e expansão de consciência",
      emocional: "Promove otimismo, generosidade e conexão com o sagrado",
      mental_espiritual: "Desperta sabedoria, intuição elevada e visão de longo prazo",
      pratica: "Meditação de expansão, visualização de luz azul, música sacra",
    },
    frequencia: 396,
    nota_musical: "G",
    mantra: "Eu abundo em sabedoria e prosperidade",
  },
  "YAM": {
    som: "YAM",
    pronunciacao: "Yahm (vibração venusiana, amor)",
    planeta: "Vênus",
    planeta_numero: 6,
    elemento: "Água",
    chakra: "4º Cardíaco (Anahata)",
    instrumento_tradicional: "Harpa, violino, flauta doce, cítara",
    dia_semana: "Sexta-feira",
    cor: "Verde-água",
    significado_espiritual: "Som do amor, harmonia e conexões sagradas. Promove reconciliação e beldade interior.",
    propriedades_healing: {
      fisico: "Equilibra rins, sistema linfático e hydration",
      emocional: "Promove amor-próprio, harmonia em relacionamentos e perdão",
      mental_espiritual: "Desperta receptividade, appreciação da beleza e conexão divina",
      pratica: "Trabalho com relacionamentos, música para cura do coração, yoga",
    },
    frequencia: 639,
    nota_musical: "G#",
    mantra: "Eu sou amada(e) e deserving de todo amor",
  },
  "DUM": {
    som: "DUM",
    pronunciacao: "Duum (vibração saturniana, disciplina)",
    planeta: "Saturno",
    planeta_numero: 7,
    elemento: "Terra",
    chakra: "1º Básico (Muladhara)",
    instrumento_tradicional: "Tambor de frame, didgeridoo, campainhas profundas",
    dia_semana: "Sábado",
    cor: "Preto",
    significado_espiritual: "Som da disciplina, proteção ekarma. Conecta com o divino através da responsabilidad.",
    propriedades_healing: {
      fisico: "Fortalece ossos, dentes, pele e estrutura corporal",
      emocional: "Promove disciplina, paciência e struktur in life",
      mental_espiritual: "Desperta sabedoria kármica, proteção espiritual e limites saudáveis",
      pratica: "Meditação de proteção, trabalho com Ancestors, ritual de boundárias",
    },
    frequencia: 963,
    nota_musical: "C",
    mantra: "Eu construo minha vida sobre alicerces firmes",
  },
  // Additional sacred sounds mapped to planetary energies
  "SOL": {
    som: "SÓL",
    pronunciacao: "Soul (vibração solar egípcia)",
    planeta: "Sol",
    planeta_numero: 1,
    elemento: "Fogo",
    chakra: "5º Laríngeo (Vishuddha)",
    instrumento_tradicional: "Sistros, matacas, música antiga egípcia",
    dia_semana: "Domingo",
    cor: "Ouro",
    significado_espiritual: "Som da alma solar egípcia. Representa a essência divina individual e immortality.",
    propriedades_healing: {
      fisico: "Alinha coluna vertebral, sistema nervoso e glândula pineal",
      emocional: "Promove identidade forte, autoexpressão e vitalidade",
      mental_espiritual: "Desperta consciência de luz interior e conexão com ancestrais",
      pratica: "Cânticos solares, trabalho com o ba, meditação da luz",
    },
    frequencia: 528,
    nota_musical: "E",
    mantra: "Minha alma brilha como o sol eterno",
  },
  "SELENE": {
    som: "SELENE",
    pronunciacao: "Seh-leh-neh (vibração lunar grega)",
    planeta: "Lua",
    planeta_numero: 2,
    elemento: "Água",
    chakra: "6º Frontal (Ajna)",
    instrumento_tradicional: "Liras, aulos, música grega antiga",
    dia_semana: "Segunda-feira",
    cor: "Azul-prateado",
    significado_espiritual: "Som da lua grega Selene. Ilumina a noite e guia através do inconsciente.",
    propriedades_healing: {
      fisico: "Hidrata sistema, melhora sono e equilibra hormônios lunares",
      emocional: "Promove sonhos, intuição e conexão com o divino feminino",
      mental_espiritual: "Desperta visão clara no escuro, capacidades adivinhatórias",
      pratica: "Meditação noturna, trabalho onírico, invocação lunar",
    },
    frequencia: 852,
    nota_musical: "A",
    mantra: "A lua ilumina meu caminho no escuro",
  },
  "ARES": {
    som: "ARES",
    pronunciacao: "Ah-res (vibração marciana grega)",
    planeta: "Marte",
    planeta_numero: 3,
    elemento: "Fogo",
    chakra: "3º Plexo Solar (Manipura)",
    instrumento_tradicional: "Trompas de guerra, címbalos, música épica",
    dia_semana: "Terça-feira",
    cor: "Escarlate",
    significado_espiritual: "Som do guerreiro grego Ares. Força, proteção e triumph na batalha espiritual.",
    propriedades_healing: {
      fisico: "Fortalece sistema adrenal, músculos e coragem física",
      emocional: "Dissolve raiva residual, promove proteção saudável",
      mental_espiritual: "Ativa força interior, capacidade de defesa espiritual",
      pratica: "Trabalhos de proteção, drumming guerreiro, afirmações de poder",
    },
    frequencia: 432,
    nota_musical: "D",
    mantra: "Eu sou forte e protegido(a) em minha verdade",
  },
  "HERMES": {
    som: "HERMES",
    pronunciacao: "Her-mez (vibração mercurial grega)",
    planeta: "Mercúrio",
    planeta_numero: 4,
    elemento: "Ar",
    chakra: "5º Laríngeo (Vishuddha)",
    instrumento_tradicional: "Lira, syrinx, flauta de Pan",
    dia_semana: "Quarta-feira",
    cor: "Ciano",
    significado_espiritual: "Som do mensageiro Hermes. Comunicação entre mundos e apertura de caminhos.",
    propriedades_healing: {
      fisico: "Equilibra mãos, braços, pulmões e sistema nervoso",
      emocional: "Promove adaptabilidade, comunicação clara e agility mental",
      mental_espiritual: "Desperta eloquência, aprendizado rápido e conexão interdimensional",
      pratica: "Trabalhos com sonhos lúcidos, invocação do mensageiro, meditação de viagem",
    },
    frequencia: 741,
    nota_musical: "F#",
    mantra: "Minhas palavras atravessam véus entre mundos",
  },
  "ZEUS": {
    som: "ZEUS",
    pronunciacao: "Dzeus (vibração jupiteriana grega)",
    planeta: "Júpiter",
    planeta_numero: 5,
    elemento: "Fogo/Água",
    chakra: "7º Coronário (Sahasrara)",
    instrumento_tradicional: "Trombeta, lira, música orquestral épica",
    dia_semana: "Quinta-feira",
    cor: "Roxo-dourado",
    significado_espiritual: "Som dorei supremo Zeus. Expansão infinita, sabedoria divina e lei cósmica.",
    propriedades_healing: {
      fisico: "Expande sistema circulatório, digestão e energia vital geral",
      emocional: "Promove confiança, Optimism e conexão com o sagrado",
      mental_espiritual: "Desperta sabedoria cósmica, visão elevada e abundância espiritual",
      pratica: "Meditação de expansão cósmica, visualização de abundância, invocação divina",
    },
    frequencia: 396,
    nota_musical: "G",
    mantra: "A sabedoria divina flui através de mim",
  },
  "AFRODITE": {
    som: "AFRODITE",
    pronunciacao: "A-fro-di-teh (vibração venusiana grega)",
    planeta: "Vênus",
    planeta_numero: 6,
    elemento: "Água",
    chakra: "2º Sacro (Svadhisthana)",
    instrumento_tradicional: "Conchas, harpa, música sensual mediterrânea",
    dia_semana: "Sexta-feira",
    cor: "Rosa-perola",
    significado_espiritual: "Som da deusa do amor Afrodite. Beleza, charme e conexões amorosas sagradas.",
    propriedades_healing: {
      fisico: "Hidrata pele, equilibra sistema reprodutor e glandular",
      emocional: "Promove amor-próprio, sensualidade saudável e atraação",
      mental_espiritual: "Desperta charme, graça e capacidade de amar incondicionalmente",
      pratica: "Trabalho de amor-próprio, rituals de beleza sagrada, dança",
    },
    frequencia: 639,
    nota_musical: "G#",
    mantra: "Eu sou a personificação do amor sagrado",
  },
  "KRONOS": {
    som: "KRONOS",
    pronunciacao: "Kro-nos (vibração saturniana grega)",
    planeta: "Saturno",
    planeta_numero: 7,
    elemento: "Terra",
    chakra: "1º Básico (Muladhara)",
    instrumento_tradicional: "Tambores profundos, Gong grave, música funeral",
    dia_semana: "Sábado",
    cor: "Cinza-escuro",
    significado_espiritual: "Som do tempo Kronos. Disciplina, restrição e completude dos ciclos.",
    propriedades_healing: {
      fisico: "Fortalece ossos, articulações, dentes e estrutura do tempo corporal",
      emocional: "Promove paciência, aceitação do tempo e maturidade",
      mental_espiritual: "Desperta sabedoria do tempo, compreensão de ciclos kármicos",
      pratica: "Meditação do tempo, trabalho com ancestralidade, ritual de purificação",
    },
    frequencia: 963,
    nota_musical: "C",
    mantra: "Eu aceito o tempo como meu aliado",
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
    .replace(/Ç/g, "C");
}

/**
 * Get the sound-planet mapping for a given sound/music
 * @param som - Sound or music identifier (e.g., "RAM", "OM", "YAM", "SOL")
 * @returns SoundPlanet mapping or undefined if not found
 */
export function getSoundPlanet(som: string): SoundPlanet | undefined {
  const normalized = normalizeSound(som);
  return SOUND_PLANET_MAP[normalized];
}

/**
 * Get the reverse mapping: Planet to associated sounds
 * @returns Record mapping each planet to their associated sounds
 */
export function getPlanetSound(): Record<string, string[]> {
  const mapping: Record<string, string[]> = {};
  
  Object.values(SOUND_PLANET_MAP).forEach((soundPlanet) => {
    if (!mapping[soundPlanet.planeta]) {
      mapping[soundPlanet.planeta] = [];
    }
    if (!mapping[soundPlanet.planeta].includes(soundPlanet.som)) {
      mapping[soundPlanet.planeta].push(soundPlanet.som);
    }
  });
  
  return mapping;
}

/**
 * Get all sound-planet mappings
 * @returns Array of all SoundPlanet objects ordered by planet number
 */
export function getAllSoundPlanets(): SoundPlanet[] {
  return Object.values(SOUND_PLANET_MAP).sort((a, b) => a.planeta_numero - b.planeta_numero);
}

/**
 * Get all sounds associated with a specific planet
 * @param planeta - Planet name (case-insensitive)
 * @returns Array of SoundPlanet mappings
 */
export function getSoundsByPlanet(planeta: string): SoundPlanet[] {
  const upperPlaneta = planeta.toUpperCase();
  return Object.values(SOUND_PLANET_MAP).filter(
    (s) => s.planeta.toUpperCase() === upperPlaneta
  );
}

/**
 * Get all sounds for a specific element
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of SoundPlanet mappings
 */
export function getSoundsByElement(elemento: string): SoundPlanet[] {
  const upperElemento = elemento.toUpperCase();
  return Object.values(SOUND_PLANET_MAP).filter(
    (s) => s.elemento.toUpperCase().includes(upperElemento)
  );
}

/**
 * Get all registered planet names
 * @returns Array of unique planet names
 */
export function getAllPlanets(): string[] {
  const planets = new Set<string>();
  Object.values(SOUND_PLANET_MAP).forEach((s) => {
    planets.add(s.planeta);
  });
  return Array.from(planets).sort();
}

/**
 * Get healing properties for a given sound
 * @param som - Sound identifier
 * @returns Healing properties object or null if not found
 */
export function getHealingBySound(som: string): SoundPlanet['propriedades_healing'] | null {
  const soundPlanet = getSoundPlanet(som);
  return soundPlanet?.propriedades_healing ?? null;
}

/**
 * Get the frequency for a given sound
 * @param som - Sound identifier
 * @returns Frequency in Hz or null if not found
 */
export function getFrequencyBySound(som: string): number | null {
  const soundPlanet = getSoundPlanet(som);
  return soundPlanet?.frequencia ?? null;
}

/**
 * Get the chakra for a given sound
 * @param som - Sound identifier
 * @returns Chakra name or null if not found
 */
export function getChakraBySound(som: string): string | null {
  const soundPlanet = getSoundPlanet(som);
  return soundPlanet?.chakra ?? null;
}

/**
 * Get the element for a given sound
 * @param som - Sound identifier
 * @returns Element name or null if not found
 */
export function getElementBySound(som: string): string | null {
  const soundPlanet = getSoundPlanet(som);
  return soundPlanet?.elemento ?? null;
}

/**
 * Get the planet number for a given sound
 * @param som - Sound identifier
 * @returns Planet number or null if not found
 */
export function getPlanetNumberBySound(som: string): number | null {
  const soundPlanet = getSoundPlanet(som);
  return soundPlanet?.planeta_numero ?? null;
}
