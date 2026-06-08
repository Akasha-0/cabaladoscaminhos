/**
 * Day Energy Correlation Module
 * 
 * Maps each day of the week to spiritual energies based on the
 * "Tabela de Correspondência Macro: Oito Portais da Consciência"
 * from the Cabala dos Caminhos system.
 * 
 * Integrates: Chakra, Planeta, Orixá, Sephirah, Tarot Arcano,
 * Numerologia Tântrica/Cabalística, Fase Lunar e Atuação Ritual.
 */

/** Represents the ideal moon phase for rituals on a given day */
export type MoonPhase = 
  | 'Lua Nova'
  | 'Lua Crescente'
  | 'Lua Cheia'
  | 'Lua Minguante'
  | 'Lua Nova / Crescente'
  | 'Lua Crescente / Cheia'
  | 'Lua Cheia / Crescente'
  | 'Lua Minguante / Nova';

/** Numerological numbers with their tantric/cabalistic interpretations */
export interface NumerologyNumbers {
  /** Tantric number and its meaning */
  tantric: { value: number; meaning: string };
  /** Cabalistic numbers associated with the day */
  cabalistic: number[];
}

/** Full spiritual energy mapping for a day of the week */
export interface DayEnergy {
  /** Day identifier: Monday=0 through Sunday=6 */
  dayOfWeek: number;
  /** Portuguese day name */
  dayNamePt: string;
  /** English day name */
  dayNameEn: string;
  /** Primary and secondary chakras */
  chakras: string[];
  /** Ruling planets */
  planetas: string[];
  /** Associated Orixás */
  orixas: string[];
  /** Kabbalistic Sephiroth */
  sephirot: string[];
  /** Major Arcana tarot cards */
  tarotArcanos: string[];
  /** Numerological significance */
  numeros: NumerologyNumbers;
  /** Ideal moon phases for ritual work */
  fasesLua: MoonPhase[];
  /** Spiritual action and ritual purpose */
  atuacaoRitual: string;
}

/** Lookup table indexed by dayOfWeek (Monday=0 through Sunday=6) */
const DAY_ENERGY_DATA: ReadonlyArray<Readonly<DayEnergy>> = [
  // ─── Segunda-Feira (Monday) ────────────────────────────────────────────────
  {
    dayOfWeek: 0,
    dayNamePt: 'Segunda-feira',
    dayNameEn: 'Monday',
    chakras: ['1º Básico (Muladhara)', '6º Frontal (Ajna)'],
    planetas: ['Lua', 'Saturno'],
    orixas: ['Omolu', 'Exu'],
    sephirot: ['Malkuth', 'Yesod'],
    tarotArcanos: ['II - A Sacerdotisa (The High Priestess)', 'XXI - O Mundo (The World)'],
    numeros: {
      tantric: { value: 2, meaning: 'Mente Negativa — Proteção, Alerta, Intuição' },
      cabalistic: [2, 4],
    },
    fasesLua: ['Lua Minguante', 'Lua Nova'],
    atuacaoRitual:
      'Limpeza pesada, corte de laços kármicos, aterramento e conexão ancestral. ' +
      'Dia propício para ebós de transmutação, despachos em encruzilhadas e firmes de proteção. ' +
      'Reverência aos Eguns (ancestrais) e trabalhos com Omolu para cura física e estrutural.',
  },

  // ─── Terça-Feira (Tuesday) ────────────────────────────────────────────────
  {
    dayOfWeek: 1,
    dayNamePt: 'Terça-feira',
    dayNameEn: 'Tuesday',
    chakras: ['2º Sacro (Svadhisthana)'],
    planetas: ['Marte', 'Plutão'],
    orixas: ['Iansã', 'Ogum'],
    sephirot: ['Geburah'],
    tarotArcanos: ['XVI - A Torre (The Tower)', 'VIII - O Carro (The Chariot)'],
    numeros: {
      tantric: { value: 5, meaning: 'Corpo Físico — Ação, Coragem, Determinação' },
      cabalistic: [5, 9],
    },
    fasesLua: ['Lua Nova', 'Lua Crescente'],
    atuacaoRitual:
      'Quebra de demandas, ativação do movimento, coragem e rituais de banimento. ' +
      'Dia de guerra espiritual: cortes drásticos de amarrações, defumações de descarrego ' +
      'com guiné e pinhão roxo (do pescoço para baixo). Trabalhos com Iansã e Ogum para ' +
      'abertura de caminhos e proteção contra obsessores.',
  },

  // ─── Quarta-Feira (Wednesday) ─────────────────────────────────────────────
  {
    dayOfWeek: 2,
    dayNamePt: 'Quarta-feira',
    dayNameEn: 'Wednesday',
    chakras: ['3º Plexo Solar (Manipura)'],
    planetas: ['Mercúrio'],
    orixas: ['Xangô', 'Iansã'],
    sephirot: ['Hod'],
    tarotArcanos: ['I - O Mago (The Magician)', 'IX - O Eremita (The Hermit)'],
    numeros: {
      tantric: { value: 4, meaning: 'Mente Positiva — Equilíbrio, Julgamento, Estrutura' },
      cabalistic: [3, 5],
    },
    fasesLua: ['Lua Crescente'],
    atuacaoRitual:
      'Estudos, justiça, direcionamento mental e estratégias de negócios. ' +
      'Dia de clareza intelectual: rituals de prosperidade para Xangô, consultas de Ifá, ' +
      'trabalhos com Exu e Mercúrio para comunicação espiritual e abertura de portas no mundo material. ' +
      'Excelente para meditação e busca pela verdade.',
  },

  // ─── Quinta-Feira (Thursday) ───────────────────────────────────────────────
  {
    dayOfWeek: 3,
    dayNamePt: 'Quinta-feira',
    dayNameEn: 'Thursday',
    chakras: ['4º Cardíaco (Anahata)'],
    planetas: ['Júpiter'],
    orixas: ['Oxóssi'],
    sephirot: ['Chesed'],
    tarotArcanos: ['V - O Hierofante (The Hierophant)'],
    numeros: {
      tantric: { value: 7, meaning: 'Aura — Proteção, Magnetismo, Fé' },
      cabalistic: [1, 3],
    },
    fasesLua: ['Lua Crescente', 'Lua Cheia'],
    atuacaoRitual:
      'Expansão de projetos, rituais de fartura, saúde e busca por conhecimento. ' +
      'Dia do caçador: oferendas para Oxóssi nas matas, ebós de fartura com Amalá, ' +
      'banhos de samambaia e eucalipto para expansão áurica. Trabalhos de cura e ' +
      'atração de mentores espirituais e recursos financeiros.',
  },

  // ─── Sexta-Feira (Friday) ──────────────────────────────────────────────────
  {
    dayOfWeek: 4,
    dayNamePt: 'Sexta-feira',
    dayNameEn: 'Friday',
    chakras: ['7º Coronário (Sahasrara)'],
    planetas: ['Vênus'],
    orixas: ['Oxalá'],
    sephirot: ['Kether'],
    tarotArcanos: ['IV - O Imperador (The Emperor)', '0 - O Louco (The Fool)'],
    numeros: {
      tantric: { value: 1, meaning: 'Alma — Essência, Pureza, Origem Divina' },
      cabalistic: [1, 7],
    },
    fasesLua: ['Lua Cheia'],
    atuacaoRitual:
      'Conexão espiritual direta, paz, harmonização do Ori e rituais de gratidão. ' +
      'Dia da pureza absoluta: Boris (ofereendas à cabeça), banhos de boldo no topo da ' +
      'cabeça, acender velas brancas para Oxalá, rezas mansas e silêncio interior. ' +
      'Excelente para alinhamento com o Divino e purificação da consciência.',
  },

  // ─── Sábado (Saturday) ─────────────────────────────────────────────────────
  {
    dayOfWeek: 5,
    dayNamePt: 'Sábado',
    dayNameEn: 'Saturday',
    chakras: ['4º Cardíaco (Anahata)', '6º Frontal (Ajna)'],
    planetas: ['Saturno', 'Urano'],
    orixas: ['Oxum', 'Iemanjá'],
    sephirot: ['Binah', 'Tiphereth'],
    tarotArcanos: ['III - A Imperatriz (The Empress)', 'XVII - A Estrela (The Star)'],
    numeros: {
      tantric: { value: 3, meaning: 'Mente Neutra — Equilíbrio, Inteligência Emocional' },
      cabalistic: [6, 8],
    },
    fasesLua: ['Lua Cheia'],
    atuacaoRitual:
      'Atração, magnetismo, fertilidade, inteligência emocional e feitiçaria natural. ' +
      'Dia das Grandes Mães: oferendas de canjica na beira-mar para Iemanjá, banhos de ' +
      'mel e rosas para Oxum, trabalhos de amor incondicional e cura emocional. ' +
      'Excelente para feitiços de atração e rituais de fertilidade.',
  },

  // ─── Domingo (Sunday) ──────────────────────────────────────────────────────
  {
    dayOfWeek: 6,
    dayNamePt: 'Domingo',
    dayNameEn: 'Sunday',
    chakras: ['3º Plexo Solar (Manipura)'],
    planetas: ['Sol'],
    orixas: ['Xangô'],
    sephirot: ['Tiphereth'],
    tarotArcanos: ['XIX - O Sol (The Sun)'],
    numeros: {
      tantric: { value: 9, meaning: 'Corpo Prânico — Energia Vital, Vitalidade, Brilho' },
      cabalistic: [1, 6],
    },
    fasesLua: ['Lua Cheia', 'Lua Crescente'],
    atuacaoRitual:
      'Vitalidade, irradiação do poder pessoal, sucesso e alinhamento com o propósito. ' +
      'Dia do rei: consagração de amuletos de poder para Xangô, banhos de dourado e ' +
      'canela, acender lamparinas de azeite na força do Sol. Trabalhos de realeza, ' +
      'cura física e manifestação do sucesso e brilho próprio.',
  },
] as const;

/**
 * Returns the complete spiritual energy mapping for a given day of the week.
 *
 * @param dia - Day index where Monday = 0 and Sunday = 6
 * @returns The DayEnergy object for the specified day
 * @throws RangeError if dia is outside the valid range (0–6)
 *
 * @example
 * const monday = getDayEnergy(0);
 * console.log(monday.dayNamePt);    // 'Segunda-feira'
 * console.log(monday.orixas);       // ['Omolu', 'Exu']
 * console.log(monday.fasesLua);     // ['Lua Minguante', 'Lua Nova']
 */
export function getDayEnergy(dia: number): DayEnergy {
  if (dia < 0 || dia > 6) {
    throw new RangeError(
      `getDayEnergy: dia must be between 0 (Monday) and 6 (Sunday), got ${dia}`
    );
  }
  const src = DAY_ENERGY_DATA[dia];
  // Deep defensive copy — prevents mutation of both the object and all nested arrays
  return {
    ...src,
    chakras: [...src.chakras],
    planetas: [...src.planetas],
    orixas: [...src.orixas],
    sephirot: [...src.sephirot],
    tarotArcanos: [...src.tarotArcanos],
    numeros: { ...src.numeros, cabalistic: [...src.numeros.cabalistic] },
    fasesLua: [...src.fasesLua],
  };
}

/**
 * Returns all seven days of the week with their spiritual energies.
 * Useful for iterating all portals or displaying weekly calendars.
 */
export function getAllDayEnergies(): DayEnergy[] {
  return Array.from({ length: 7 }, (_, i) => getDayEnergy(i));
}

/**
 * Returns the day name in Portuguese for a given day index.
 * @param dia - Monday=0 through Sunday=6
 */
export function getDayName(dia: number): string {
  return getDayEnergy(dia).dayNamePt;
}

/**
 * Returns the day name in English for a given day index.
 * @param dia - Monday=0 through Sunday=6
 */
export function getDayNameEn(dia: number): string {
  return getDayEnergy(dia).dayNameEn;
}

/**
 * Returns the primary Orixá for a given day.
 * Useful for quick ritual context lookups.
 * @param dia - Monday=0 through Sunday=6
 */
export function getPrimaryOrixa(dia: number): string {
  return getDayEnergy(dia).orixas[0];
}

/**
 * Returns the ruling planets for a given day.
 * @param dia - Monday=0 through Sunday=6
 */
export function getRulingPlanets(dia: number): string[] {
  return [...getDayEnergy(dia).planetas];
}

/**
 * Returns the ideal moon phases for ritual work on a given day.
 * @param dia - Monday=0 through Sunday=6
 */
export function getIdealMoonPhases(dia: number): MoonPhase[] {
  return [...getDayEnergy(dia).fasesLua];
}

/**
 * Returns the Kabbalistic Sephiroth for a given day.
 * @param dia - Monday=0 through Sunday=6
 */
export function getSephirot(dia: number): string[] {
  return [...getDayEnergy(dia).sephirot];
}