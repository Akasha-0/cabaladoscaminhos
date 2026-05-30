/**
 * Sound-Day Spiritual Correlation Module
 * Maps sacred sounds and music to days of the week
 * with their elemental connections and spiritual meanings.
 *
 * Based on the Cabala dos Caminhos system - daily vibrational signatures
 * associated with specific sound practices and musical expressions.
 */

import type { DiaSemana } from './day-frequency';
import type { Elemento } from './element-frequency';

/**
 * Type for all supported days of the week
 */
export type SoundDay = DiaSemana;

/**
 * Sound-Day correlation interface
 */
export interface SoundDayCorrelation {
  /** Day of the week */
  dia: SoundDay;
  /** Sound or music type identifier */
  som: string;
  /** Pronunciation guide or description */
  pronunciacao: string;
  /** Type of sound/music (mantra, instrument, chant, etc.) */
  tipo: 'mantra' | 'instrumento' | 'canto' | 'canto_gregoriano' | 'solfeggio' | 'oracao' | ' tambor' | 'sino';
  /** Associated element */
  elemento: Elemento;
  /** Planet ruling the day */
  planeta: string;
  /** Chakra associated with this sound practice */
  chakra: string;
  /** Solfeggio frequency in Hz */
  frequencia: number;
  /** Color associated */
  cor: string;
  /** Spiritual meaning and purpose */
  significado: string;
  /** Healing properties */
  propriedades_healing: {
    fisico: string;
    emocional: string;
    mental_espiritual: string;
    pratica: string;
  };
  /** Ritual tool or offering associated */
  ferramenta_ritual?: string;
  /** Best time for practice */
  melhor_horario?: string;
}

/**
 * Complete mapping of sacred sounds/music to days of the week.
 * Each day carries a specific vibrational signature that can be
 * amplified through corresponding sound practices.
 * Keys are normalized to uppercase ASCII for case-insensitive lookup.
 */
export const SOUND_DAY_MAP: Record<string, SoundDayCorrelation> = {
  // ==================== DOMINGO (Sunday) ====================
  // Sol - Fogo - 528Hz - Vitality, Purpose, Creativity
  'DOMINGO_OM': {
    dia: 'Domingo',
    som: 'OM',
    pronunciacao: 'Aum (som primordial, vibração solar)',
    tipo: 'mantra',
    elemento: 'Fogo',
    planeta: 'Sol',
    chakra: '7º Coronário (Sahasrara)',
    frequencia: 528,
    cor: 'Dourado',
    significado: 'Som primordial do Sol - representa a luz divina e o propósito de vida',
    propriedades_healing: {
      fisico: 'Estimula vitalidade, fortalece sistema cardíaco e metabolismo',
      emocional: 'Promove alegria autêntica, amor próprio e brilho pessoal',
      mental_espiritual: 'Ativa propósito de vida e expressão criativa',
      pratica: 'Meditação solar ao amanhecer, canto de mantras luminosos',
    },
    ferramenta_ritual: 'Velas douradas, espelho, incenso de sândalo',
    melhor_horario: 'Durante o nascer do sol',
  },
  'DOMINGO_HARE_KRISHNA': {
    dia: 'Domingo',
    som: 'HARE KRISHNA',
    pronunciacao: 'Haré Krishná (convocação das energias divinas)',
    tipo: 'mantra',
    elemento: 'Fogo',
    planeta: 'Sol',
    chakra: '4º Cardíaco (Anahata)',
    frequencia: 528,
    cor: 'Rosa-dourado',
    significado: 'Mantra de devoção solar - ativa o coração divino e a service ao próximo',
    propriedades_healing: {
      fisico: 'Harmoniza sistema circulatório e ritmo cardíaco',
      emocional: 'Desperta compaixão universal e amor incondicional',
      mental_espiritual: 'Transforma ego em serviço sagrado',
      pratica: 'Kirtan comunitário, japa mala, cantos devocionais',
    },
    ferramenta_ritual: 'Mala de contas, flores, incenso de lavanda',
    melhor_horario: 'Manhã e tarde',
  },
  'DOMINGO_CANTO_GREGORIANO': {
    dia: 'Domingo',
    som: 'CANTO GREGORIANO',
    pronunciacao: 'Canto modal gregoriano (liturgia solar)',
    tipo: 'canto_gregoriano',
    elemento: 'Fogo',
    planeta: 'Sol',
    chakra: '7º Coronário (Sahasrara)',
    frequencia: 528,
    cor: 'Branco-dourado',
    significado: 'Música sacra cristã - eleva a consciência ao divino',
    propriedades_healing: {
      fisico: 'Regula batimentos cardíacos e pressão arterial',
      emocional: 'Promove paz interior e harmonia celular',
      mental_espiritual: 'Facilita contemplação e oração profunda',
      pratica: 'Ouvir ou entoar cantos gregorianos em ambiente sagrado',
    },
    ferramenta_ritual: 'Cruz, vela branca, água benta',
    melhor_horario: 'Qualquer momento do dia',
  },

  // ==================== SEGUNDA-FEIRA (Monday) ====================
  // Lua - Água - 417Hz - Emotional Healing, Intuition, Dreams
  'SEGUNDA_IEMANJA': {
    dia: 'Segunda-feira',
    som: 'IEMANJÁ',
    pronunciacao: 'Yeh-man-já (vibração das águas maternas)',
    tipo: 'oracao',
    elemento: 'Água',
    planeta: 'Lua',
    chakra: '2º Sacro (Svadhisthana)',
    frequencia: 417,
    cor: 'Azul e Branco',
    significado: 'Oração às águas - proteção maternal e renovação emocional',
    propriedades_healing: {
      fisico: 'Hidrata tecidos, melhora circulação e sono',
      emocional: 'Libera traumas emocionais e nutre a alma',
      mental_espiritual: 'Desperta intuição profunda e flexibilidade emocional',
      pratica: 'Orações às águas, banhos ritualísticos, meditação lunar',
    },
    ferramenta_ritual: 'Espelho, flores brancas, água do mar, perfume',
    melhor_horario: 'Noite, preferência em lua cheia',
  },
  'SEGUNDA_OM_LUNAR': {
    dia: 'Segunda-feira',
    som: 'OM',
    pronunciacao: 'Aum (som lunar, vibração intuitiva)',
    tipo: 'mantra',
    elemento: 'Água',
    planeta: 'Lua',
    chakra: '6º Terceiro Olho (Ajna)',
    frequencia: 417,
    cor: 'Prata-claro',
    significado: 'OM lunar - conexão com o inconsciente e os sonhos',
    propriedades_healing: {
      fisico: 'Relaxa sistema nervoso e melhora qualidade do sono',
      emocional: 'Acolhe a criança interior e promove cura emocional',
      mental_espiritual: 'Desperta visão interior e sabedoria intuitiva',
      pratica: 'Meditação noturna, trabalho com sonhos, visualização',
    },
    ferramenta_ritual: 'Cristal de lua, água lunarizada, prata',
    melhor_horario: 'Noite, ao luar',
  },
  'SEGUNDA_SOLFEGGIO_417': {
    dia: 'Segunda-feira',
    som: 'SOLFEGGIO 417HZ',
    pronunciacao: 'Frequência 417 Hz (facilitação de mudanças)',
    tipo: 'solfeggio',
    elemento: 'Água',
    planeta: 'Lua',
    chakra: '2º Sacro (Svadhisthana)',
    frequencia: 417,
    cor: 'Azul-claro',
    significado: 'Frequência de transformação - facilita desatar nós do passado',
    propriedades_healing: {
      fisico: 'Limpa celularmente e restaura tecidos',
      emocional: 'Transmuta padrões emocionais enraizados',
      mental_espiritual: 'Promove adaptação e renovação completa',
      pratica: 'Terapia sonora, musicoterapia, trabalho emocional',
    },
    ferramenta_ritual: 'Tuning forks, bowls, água estruturada',
    melhor_horario: 'Tarde e noite',
  },

  // ==================== TERÇA-FEIRA (Tuesday) ====================
  // Marte - Fogo - 741Hz - Courage, Transformation, Will Power
  'TERCA_XANGO': {
    dia: 'Terça-feira',
    som: 'XANGÔ',
    pronunciacao: 'Shan-gô (trovão do justiceiro divino)',
    tipo: 'oracao',
    elemento: 'Fogo',
    planeta: 'Marte',
    chakra: '5º Laríngeo (Vishuddha)',
    frequencia: 741,
    cor: 'Vermelho e Branco',
    significado: 'Oração de Xangô - justiça divina e poder da palavra verdadeira',
    propriedades_healing: {
      fisico: 'Fortalece ossos, sistema imunológico e魄',
      emocional: 'Transforma raiva em poder construtivo e justiça',
      mental_espiritual: 'Ativa coragem, determinação e verdade interior',
      pratica: 'Rituais de proteção, trabalho com fogo,太极',
    },
    ferramenta_ritual: 'Pedras de raio, espada, figa, charuto',
    melhor_horario: 'Meio-dia e meia-noite',
  },
  'TERCA_IANSA': {
    dia: 'Terça-feira',
    som: 'IANSÃ',
    pronunciacao: 'Yan-sã (vento que varre obstáculos)',
    tipo: 'oracao',
    elemento: 'Fogo',
    planeta: 'Marte',
    chakra: '5º Laríngeo (Vishuddha)',
    frequencia: 741,
    cor: 'Vermelho e Azul',
    significado: 'Oração de Iansã - comunicação com os mortos e mudança de destino',
    propriedades_healing: {
      fisico: 'Libera tensões e desobstrui canais energéticos',
      emocional: 'Transforma medos em ação e dissipa inimigos internos',
      mental_espiritual: 'Abre portais e facilita comunicação espiritual',
      pratica: 'Rituais de descarrego, trabalho com antepassados',
    },
    ferramenta_ritual: 'Palha, faca, espada, maraca, fumo',
    melhor_horario: 'Entardecer',
  },
  'TERCA_SOLFEGGIO_741': {
    dia: 'Terça-feira',
    som: 'SOLFEGGIO 741HZ',
    pronunciacao: 'Frequência 741 Hz (despertar da intuição)',
    tipo: 'solfeggio',
    elemento: 'Fogo',
    planeta: 'Marte',
    chakra: '6º Terceiro Olho (Ajna)',
    frequencia: 741,
    cor: 'Verde-esmeralda',
    significado: 'Frequência de despertar - expande consciência e purifica',
    propriedades_healing: {
      fisico: 'Purifica células e desintoxica organismos',
      emocional: 'Dissolve energias densas e pensamentos negativos',
      mental_espiritual: 'Ativa percepção espiritual e clarividência',
      pratica: 'Terapia sonora, meditação de limpeza, trabalho com aird',
    },
    ferramenta_ritual: 'Tuning forks, bowls, salts pretos',
    melhor_horario: 'Manhã e entardecer',
  },

  // ==================== QUARTA-FEIRA (Wednesday) ====================
  // Mercúrio - Ar - 852Hz - Communication, Intellect, Truth
  'QUARTA_HUM': {
    dia: 'Quarta-feira',
    som: 'HUM',
    pronunciacao: 'Hoom (vibração do espaço, som cósmico)',
    tipo: 'mantra',
    elemento: 'Ar',
    planeta: 'Mercúrio',
    chakra: '5º Laríngeo (Vishuddha)',
    frequencia: 852,
    cor: 'Azul-claro',
    significado: 'Mantra de proteção verbal - shields contra palavras negativas',
    propriedades_healing: {
      fisico: 'Harmoniza tireoide e sistema respiratório',
      emocional: 'Promove comunicação clara e proteção energética',
      mental_espiritual: 'Ativa sabedoria interior e expressão autêntica',
      pratica: 'Japa do HUM, meditação de silêncio mental',
    },
    ferramenta_ritual: 'Mala, incenso de olíbano, azulasa',
    melhor_horario: 'Manhã cedo',
  },
  'QUARTA_GAYATRI': {
    dia: 'Quarta-feira',
    som: 'GAYATRI',
    pronunciacao: 'Ga-ya-tri (mantra solar de iluminação)',
    tipo: 'mantra',
    elemento: 'Ar',
    planeta: 'Mercúrio',
    chakra: '6º Terceiro Olho (Ajna)',
    frequencia: 852,
    cor: 'Ouro',
    significado: 'Mantra da iluminação - desperta a visão divina e a verdade',
    propriedades_healing: {
      fisico: 'Energiza sistema nervoso e melhora memória',
      emocional: 'Promove clareza mental e paz interior',
      mental_espiritual: 'Desperta terceiro olho e percepção da verdade',
      pratica: 'Cantos védicos ao amanhecer, contemplação solar',
    },
    ferramenta_ritual: 'Velas, incenso de sândalo, água sagrada',
    melhor_horario: 'Nascer do sol (Brahmamuhurta)',
  },
  'QUARTA_SOLFEGGIO_852': {
    dia: 'Quarta-feira',
    som: 'SOLFEGGIO 852HZ',
    pronunciacao: 'Frequência 852 Hz (retorno à ordem divina)',
    tipo: 'solfeggio',
    elemento: 'Ar',
    planeta: 'Mercúrio',
    chakra: '6º Terceiro Olho (Ajna)',
    frequencia: 852,
    cor: 'Violeta-claro',
    significado: 'Frequência de ordem - restaura harmonia e desperta intuição',
    propriedades_healing: {
      fisico: 'Regula sistema nervoso e equilibra hormônios',
      emocional: 'Promove serenidade e confiança na vida',
      mental_espiritual: 'Ativa terceira fase da mente e sabedoria',
      pratica: 'Terapia sonora, meditação profunda, estudo sagrado',
    },
    ferramenta_ritual: 'Tuning forks, sinos, cristais',
    melhor_horario: 'Tarde',
  },

  // ==================== QUINTA-FEIRA (Thursday) ====================
  // Júpiter - Fogo - 528Hz - Expansion, Abundance, Teaching
  'QUINTA_OM_ABUNDANCIA': {
    dia: 'Quinta-feira',
    som: 'OM',
    pronunciacao: 'Aum (som de expansão e abundância cósmica)',
    tipo: 'mantra',
    elemento: 'Fogo',
    planeta: 'Júpiter',
    chakra: '7º Coronário (Sahasrara)',
    frequencia: 528,
    cor: 'Roxo-dourado',
    significado: 'OM de prosperidade - manifesta abundância e sabedoria divina',
    propriedades_healing: {
      fisico: 'Estimula sistema digestivo e metabolismo',
      emocional: 'Dissolve bloqueios de abundância e escassez',
      mental_espiritual: 'Ativa compreensão profunda e ensinamentos sagrados',
      pratica: 'Meditação de prosperidade, visualização de abundância',
    },
    ferramenta_ritual: 'Velas roxas, incenso de cedro, ouro',
    melhor_horario: 'Manhã',
  },
  'QUINTA_LARE': {
    dia: 'Quinta-feira',
    som: 'LARÉ',
    pronunciacao: 'Lah-reh (vibração de prosperidade e proteção)',
    tipo: 'oracao',
    elemento: 'Terra',
    planeta: 'Júpiter',
    chakra: '1º Básico (Muladhara)',
    frequencia: 396,
    cor: 'Branco e amarelo',
    significado: 'Oração de Oxalufã - firmeaa e proteção com fartura',
    propriedades_healing: {
      fisico: 'Fortalece sistema imunológico e ossos',
      emocional: 'Promove segurança, firmeza e confiança',
      mental_espiritual: 'Ativa trabalho ancestral e propósito de vida',
      pratica: 'Rituais de prosperidade, oferendas aos ancestrais',
    },
    ferramenta_ritual: 'Al Guidanceê, fumo, charuto, pipoca',
    melhor_horario: 'Manhã cedo',
  },
  'QUINTA_SHIVA': {
    dia: 'Quinta-feira',
    som: 'OM NAMAH SHIVAYA',
    pronunciacao: 'Aum Namah Shivaya (vibração de destruição e renovação)',
    tipo: 'mantra',
    elemento: 'Fogo',
    planeta: 'Júpiter',
    chakra: '5º Laríngeo (Vishuddha)',
    frequencia: 528,
    cor: 'Cinza e branco',
    significado: 'Mantra de Shiva - transformação, destruição do ego e renovação',
    propriedades_healing: {
      fisico: 'Desintoxica corpo e regenera tecidos',
      emocional: 'Liberta apegos e transforma identidades falsas',
      mental_espiritual: 'Desperta consciência do eu superior e meditação profunda',
      pratica: 'Meditação de Shiva, práticas de Letting go',
    },
    ferramenta_ritual: 'Cenário, ossos, cinzas, lua',
    melhor_horario: 'Entardecer e noite',
  },

  // ==================== SEXTA-FEIRA (Friday) ====================
  // Vênus - Água - 417Hz - Love, Beauty, Relationships
  'SEXTA_OM_AMOR': {
    dia: 'Sexta-feira',
    som: 'OM',
    pronunciacao: 'Aum (som do amor universal e compaixão)',
    tipo: 'mantra',
    elemento: 'Água',
    planeta: 'Vênus',
    chakra: '4º Cardíaco (Anahata)',
    frequencia: 417,
    cor: 'Verde e rosa',
    significado: 'OM de amor - desperta o coração e atrai relacionamentos sagrados',
    propriedades_healing: {
      fisico: 'Harmoniza sistema cardiovascular e hormonal',
      emocional: 'Abre o coração ao amor incondicional',
      mental_espiritual: 'Promove perdão, gratidão e conexões autênticas',
      pratica: 'Meditação de amor, yoga do coração, trabalho com relacionamentos',
    },
    ferramenta_ritual: 'Flores, rosas, incenso de jasmim, água de rosas',
    melhor_horario: 'Qualquer momento, preferência à tarde',
  },
  'SEXTA_OXUM': {
    dia: 'Sexta-feira',
    som: 'OXUM',
    pronunciacao: 'Oh-shum (vibração das águas doces e prosperidade)',
    tipo: 'oracao',
    elemento: 'Água',
    planeta: 'Vênus',
    chakra: '2º Sacro (Svadhisthana)',
    frequencia: 417,
    cor: 'Amarelo-dourado e azul',
    significado: 'Oração de Oxum - beleza, amor, prosperidade e sabedoria',
    propriedades_healing: {
      fisico: 'Embeleza pele, regula sistema reprodutivo',
      emocional: 'Promove autoestima, charme e feminilidade sagrada',
      mental_espiritual: 'Desperta sabedoria do coração e intuição',
      pratica: 'Rituais de beleza, oferendas de mel e ouro',
    },
    ferramenta_ritual: 'Espelho, pentes de ouro, mel, flores amarelas',
    melhor_horario: 'Manhã, preferência em sexta-feira de lua cheia',
  },
  'SEXTA_NANNA': {
    dia: 'Sexta-feira',
    som: 'NANÃ',
    pronunciacao: 'Na-nã (vibração das águas primordiais)',
    tipo: 'oracao',
    elemento: 'Água',
    planeta: 'Vênus',
    chakra: '7º Coronário (Sahasrara)',
    frequencia: 396,
    cor: 'Branco e lilás',
    significado: 'Oração de Nanã - purificação, morte e renascimento espiritual',
    propriedades_healing: {
      fisico: 'Purifica sangue e sistema linfático',
      emocional: 'Liberta da necessidade de controle e aceita a mudança',
      mental_espiritual: 'Desperta consciência da impermanência e trascendência',
      pratica: 'Rituais de purificação, trabalho com morte egoica',
    },
    ferramenta_ritual: 'Barro, sapê, incenso, água de味道',
    melhor_horario: 'Noite',
  },

  // ==================== SÁBADO (Saturday) ====================
  // Saturno - Terra - 396Hz - Discipline, Structure, Karma
  'SABADO_OM_KARMICO': {
    dia: 'Sábado',
    som: 'OM',
    pronunciacao: 'Aum (som de karma e disciplina cósmica)',
    tipo: 'mantra',
    elemento: 'Terra',
    planeta: 'Saturno',
    chakra: '1º Básico (Muladhara)',
    frequencia: 396,
    cor: 'Preto e branco',
    significado: 'OM kármico - dissolve debts físicos e espirituais',
    propriedades_healing: {
      fisico: 'Fortalece ossos, dentes e estrutura física',
      emocional: 'Liberta medos de punição e senso de culpa',
      mental_espiritual: 'Promove disciplina, paciência e sabedoria do tempo',
      pratica: 'Meditação de karma, trabalho com sombras, disciplinas',
    },
    ferramenta_ritual: 'Sementes, terra, pedras negras, silêncio',
    melhor_horario: 'Meia-noite e meio-dia',
  },
  'SABADO_OSSAIM': {
    dia: 'Sábado',
    som: 'OSSAIM',
    pronunciacao: 'Oh-sã-im (vibração das folhas e sabedoria das plantas)',
    tipo: 'oracao',
    elemento: 'Terra',
    planeta: 'Saturno',
    chakra: '2º Sacro (Svadhisthana)',
    frequencia: 396,
    cor: 'Verde-escuro',
    significado: 'Oração de Ossaim - senhor das folhas e medicina natural',
    propriedades_healing: {
      fisico: 'Cura com ervas, reequilibra sistema nervoso',
      emocional: 'Dissolve traumas ancestrais e memórias celulares',
      mental_espiritual: 'Desperta sabedoria da natureza e medicina do corpo',
      pratica: 'Trabalho com ervas, cura natural, conexão com elementais',
    },
    ferramenta_ritual: 'Folhas, plantas, terroso, defumadores',
    melhor_horario: 'Entardecer',
  },
  'SABADO_SOLFEGGIO_396': {
    dia: 'Sábado',
    som: 'SOLFEGGIO 396HZ',
    pronunciacao: 'Frequência 396 Hz (libertação do medo e culpa)',
    tipo: 'solfeggio',
    elemento: 'Terra',
    planeta: 'Saturno',
    chakra: '1º Básico (Muladhara)',
    frequencia: 396,
    cor: 'Branco-leitoso',
    significado: 'Frequência de libertação - dissolve medos e sensos de culpa',
    propriedades_healing: {
      fisico: 'Fortalece ossos e sistema imunológico',
      emocional: 'Liberta padrões de medo, culpa e trauma',
      mental_espiritual: 'Promove coragem, firmeza e redenção',
      pratica: 'Terapia sonora, trabalho com sombras, meditação ground',
    },
    ferramenta_ritual: 'Tuning forks, bowls, sementes, terra',
    melhor_horario: 'Noite',
  },
};

/**
 * Normalize sound string for lookup - converts accented chars to ASCII equivalents
 * and handles day prefixes
 */
function normalizeSoundSom(som: string): string {
  return som
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Get the sound-day mapping for a given sound/music
 * @param som - Sound or music identifier (e.g., "OM", "XANGÔ", "IEMANJÁ", "SOLFEGGIO 417HZ")
 * @returns SoundDayCorrelation mapping or undefined if not found
 */
export function getSoundDay(som: string): SoundDayCorrelation | undefined {
  if (!som || typeof som !== 'string') return undefined;
  const normalized = normalizeSoundSom(som);
  // Direct lookup
  if (SOUND_DAY_MAP[normalized]) return SOUND_DAY_MAP[normalized];
  // Try partial matches
  for (const key of Object.keys(SOUND_DAY_MAP)) {
    if (key.includes(normalized) || normalized.includes(key.replace(/_/g, ''))) {
      return SOUND_DAY_MAP[key];
    }
  }
  return undefined;
}

/**
 * Get the reverse mapping: day to associated sounds
 * @returns Record mapping each day to their associated sounds
 */
export function getDaySound(): Record<string, SoundDayCorrelation[]> {
  const result: Partial<Record<SoundDay, SoundDayCorrelation[]>> = {};
  for (const item of Object.values(SOUND_DAY_MAP)) {
    if (!result[item.dia]) result[item.dia] = [];
    result[item.dia].push(item);
  }
  return result as Record<string, SoundDayCorrelation[]>;
}

/**
 * Get all sound-day mappings
 * @returns Array of all SoundDayCorrelation objects
 */
export function getAllSoundDays(): SoundDayCorrelation[] {
  return Object.values(SOUND_DAY_MAP);
}

/**
 * Get all sounds for a specific day
 * @param dia - Day name (case-insensitive)
 * @returns Array of SoundDayCorrelation mappings
 */
export function getSoundsByDay(dia: string): SoundDayCorrelation[] {
  const dayLower = dia.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return Object.values(SOUND_DAY_MAP).filter(
    (item) => item.dia.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === dayLower
  );
}

/**
 * Get sounds by element
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of SoundDayCorrelation mappings
 */
export function getSoundsByElement(elemento: string): SoundDayCorrelation[] {
  const elementLower = elemento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return Object.values(SOUND_DAY_MAP).filter(
    (item) => item.elemento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === elementLower
  );
}

/**
 * Get all registered days
 * @returns Array of unique day names
 */
export function getAllDays(): string[] {
  const days = new Set(Object.values(SOUND_DAY_MAP).map((item) => item.dia));
  return Array.from(days);
}

/**
 * Get the planet for a given sound
 * @param som - Sound identifier
 * @returns Planet name or null if not found
 */
export function getPlanetBySound(som: string): string | null {
  const item = getSoundDay(som);
  return item?.planeta ?? null;
}

/**
 * Get the element for a given sound
 * @param som - Sound identifier
 * @returns Element name or null if not found
 */
export function getElementBySound(som: string): string | null {
  const item = getSoundDay(som);
  return item?.elemento ?? null;
}

/**
 * Get the frequency for a given sound
 * @param som - Sound identifier
 * @returns Frequency in Hz or null if not found
 */
export function getFrequencyBySound(som: string): number | null {
  const item = getSoundDay(som);
  return item?.frequencia ?? null;
}

/**
 * Get the chakra for a given sound
 * @param som - Sound identifier
 * @returns Chakra name or null if not found
 */
export function getChakraBySound(som: string): string | null {
  const item = getSoundDay(som);
  return item?.chakra ?? null;
}

/**
 * Get the healing properties for a given sound
 * @param som - Sound identifier
 * @returns Healing properties or null if not found
 */
export function getHealingBySound(som: string): SoundDayCorrelation['propriedades_healing'] | null {
  const item = getSoundDay(som);
  return item?.propriedades_healing ?? null;
}

/**
 * Get sounds by type
 * @param tipo - Sound type (mantra, instrumento, canto, solfeggio, etc.)
 * @returns Array of SoundDayCorrelation mappings
 */
export function getSoundsByType(tipo: string): SoundDayCorrelation[] {
  return Object.values(SOUND_DAY_MAP).filter((item) => item.tipo === tipo);
}

/**
 * Get sounds by planet
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno')
 * @returns Array of SoundDayCorrelation mappings
 */
export function getSoundsByPlanet(planeta: string): SoundDayCorrelation[] {
  const planetLower = planeta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return Object.values(SOUND_DAY_MAP).filter(
    (item) => item.planeta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === planetLower
  );
}
