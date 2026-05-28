// ifa-v2-data.ts
 

/**
 * Ifá-v2 Data Module
 * Enhanced Ifá divination data for spiritual practice
 */

export interface IfaV2Data {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  description?: string;
  descriptionPt?: string;
  timestamp: number;
  v2Features: {
    oduPrinciples: string[];
    spiritualGuidance: string[];
    ritualPractices: string[];
    sacredFrequencies: string[];
  };
}

export const ifaV2Data: IfaV2Data[] = [
  {
    id: 'ifa-v2-001',
    name: 'Ogbe V2',
    namePt: 'Ogbe - O Começo V2',
    nameEn: 'Ogbe - The Beginning V2',
    description: 'Enhanced Ogbe data with advanced v2 features for deeper spiritual practice.',
    descriptionPt: 'Dados melhorados do Ogbe com recursos avançados v2 para prática espiritual mais profunda.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Começo', 'Iniciação', 'Origem', 'Primeiro passo'],
      spiritualGuidance: ['New ventures are favored', 'Trust your inner voice', 'Embrace change'],
      ritualPractices: ['Ebo de开门', 'Offerings to Orunmila', 'Meditation at dawn'],
      sacredFrequencies: ['432 Hz (Origin)', '528 Hz (Creation)', '639 Hz (Connection)'],
    },
  },
  {
    id: 'ifa-v2-002',
    name: 'Oyeku V2',
    namePt: 'Oyeku - A Noite V2',
    nameEn: 'Oyeku - The Night V2',
    description: 'Enhanced Oyeku data with advanced v2 features for spiritual transformation.',
    descriptionPt: 'Dados melhorados do Oyeku com recursos avançados v2 para transformação espiritual.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Noite', 'Descanso', 'Reflexão', 'Transição'],
      spiritualGuidance: ['Rest is essential', 'Inner work ahead', 'Patience required'],
      ritualPractices: ['Ebo de renovação', 'Offerings to Osain', 'Night meditation'],
      sacredFrequencies: ['396 Hz (Liberation)', '417 Hz (Facilitation)', '528 Hz (Transformation)'],
    },
  },
  {
    id: 'ifa-v2-003',
    name: 'Iwori V2',
    namePt: 'Iwori - A Sabedoria V2',
    nameEn: 'Iwori - The Wisdom V2',
    description: 'Enhanced Iwori data with advanced v2 features for wisdom cultivation.',
    descriptionPt: 'Dados melhorados do Iwori com recursos avançados v2 para cultivo de sabedoria.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Sabedoria', 'Experiência', 'Elder wisdom', 'Ancient knowledge'],
      spiritualGuidance: ['Seek guidance from elders', 'Embrace difficult lessons', 'Share knowledge'],
      ritualPractices: ['Ebo de sabedoria', 'Offerings to Obatala', 'Wisdom meditation'],
      sacredFrequencies: ['432 Hz (Grounding)', '528 Hz (Enlightenment)', '741 Hz (Expression)'],
    },
  },
  {
    id: 'ifa-v2-004',
    name: 'Odi V2',
    namePt: 'Odi - O Poço V2',
    nameEn: 'Odi - The Well V2',
    description: 'Enhanced Odi data with advanced v2 features for deep introspection.',
    descriptionPt: 'Dados melhorados do Odi com recursos avançados v2 para introspecção profunda.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Poço', 'Oculto', 'Mistério', 'Investigação interior'],
      spiritualGuidance: ['Look within for answers', 'Face hidden truths', 'Transform secrets'],
      ritualPractices: ['Ebo de revelação', 'Offerings to Omolu', 'Deep meditation'],
      sacredFrequencies: ['396 Hz (Truth)', '417 Hz (Revelation)', '528 Hz (Transformation)'],
    },
  },
  {
    id: 'ifa-v2-005',
    name: 'Irosun V2',
    namePt: 'Irosun - O Aviso V2',
    nameEn: 'Irosun - The Warning V2',
    description: 'Enhanced Irosun data with advanced v2 features for spiritual protection.',
    descriptionPt: 'Dados melhorados do Irosun com recursos avançados v2 para proteção espiritual.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Aviso', 'Visão', 'Intuição', 'Alerta'],
      spiritualGuidance: ['Pay attention to signs', 'Trust your visions', 'Protect your path'],
      ritualPractices: ['Ebo de proteção', 'Offerings to Iemanjá', 'Vision meditation'],
      sacredFrequencies: ['432 Hz (Protection)', '528 Hz (Clarity)', '639 Hz (Connection)'],
    },
  },
  {
    id: 'ifa-v2-006',
    name: 'Owonrin V2',
    namePt: 'Owonrin - O Vento V2',
    nameEn: 'Owonrin - The Wind V2',
    description: 'Enhanced Owonrin data with advanced v2 features for movement and change.',
    descriptionPt: 'Dados melhorados do Owonrin com recursos avançados v2 para movimento e mudança.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Vento', 'Movimento', 'Mudança', 'Circulação'],
      spiritualGuidance: ['Embrace flexibility', 'Let go of resistance', 'Flow with life'],
      ritualPractices: ['Ebo de fluidez', 'Offerings to Oxossi', 'Wind meditation'],
      sacredFrequencies: ['417 Hz (Change)', '528 Hz (Adaptation)', '741 Hz (Freedom)'],
    },
  },
  {
    id: 'ifa-v2-007',
    name: 'Obara V2',
    namePt: 'Obara - A Riqueza V2',
    nameEn: 'Obara - The Wealth V2',
    description: 'Enhanced Obara data with advanced v2 features for abundance work.',
    descriptionPt: 'Dados melhorados do Obara com recursos avançados v2 para trabalho de abundância.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Riqueza', 'Fartura', 'Abundância', 'Prosperidade'],
      spiritualGuidance: ['Abundance is your birthright', 'Share your blessings', 'Work with integrity'],
      ritualPractices: ['Ebo de prosperidade', 'Offerings to Xango', 'Abundance meditation'],
      sacredFrequencies: ['396 Hz (Abundance)', '528 Hz (Prosperity)', '639 Hz (Gratitude)'],
    },
  },
  {
    id: 'ifa-v2-008',
    name: 'Okanran V2',
    namePt: 'Okanran - O Destino V2',
    nameEn: 'Okanran - The Destiny V2',
    description: 'Enhanced Okanran data with advanced v2 features for fate work.',
    descriptionPt: 'Dados melhorados do Okanran com recursos avançados v2 para trabalho de destino.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Destino', 'Fatalidade', 'Sorte', 'Fortuna'],
      spiritualGuidance: ['Embrace your path', 'Work with fate', 'Accept destiny'],
      ritualPractices: ['Ebo de destino', 'Offerings to Elegua', 'Fate meditation'],
      sacredFrequencies: ['432 Hz (Fate)', '528 Hz (Purpose)', '852 Hz (Acceptance)'],
    },
  },
  {
    id: 'ifa-v2-009',
    name: 'Ogunda V2',
    namePt: 'Ogunda - A Ferramenta V2',
    nameEn: 'Ogunda - The Tool V2',
    description: 'Enhanced Ogunda data with advanced v2 features for tool work.',
    descriptionPt: 'Dados melhorados do Ogunda com recursos avançados v2 para trabalho com ferramentas.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Ferramenta', 'Criação', 'Trabalho', 'Construção'],
      spiritualGuidance: ['Use your tools wisely', 'Build with purpose', 'Master your craft'],
      ritualPractices: ['Ebo de criação', 'Offerings to Ogum', 'Tool meditation'],
      sacredFrequencies: ['417 Hz (Creation)', '528 Hz (Mastery)', '741 Hz (Construction)'],
    },
  },
  {
    id: 'ifa-v2-010',
    name: 'Osa V2',
    namePt: 'Osa - A Floresta V2',
    nameEn: 'Osa - The Forest V2',
    description: 'Enhanced Osa data with advanced v2 features for nature work.',
    descriptionPt: 'Dados melhorados do Osa com recursos avançados v2 para trabalho com natureza.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Floresta', 'Natureza', 'Cura', 'Santuário'],
      spiritualGuidance: ['Connect with nature', 'Heal in the forest', 'Find sanctuary'],
      ritualPractices: ['Ebo de natureza', 'Offerings to Oya', 'Forest meditation'],
      sacredFrequencies: ['432 Hz (Nature)', '528 Hz (Healing)', '639 Hz (Sanctuary)'],
    },
  },
  {
    id: 'ifa-v2-011',
    name: 'Ika V2',
    namePt: 'Ika - A Escuridão V2',
    nameEn: 'Ika - The Darkness V2',
    description: 'Enhanced Ika data with advanced v2 features for shadow work.',
    descriptionPt: 'Dados melhorados do Ika com recursos avançados v2 para trabalho de sombra.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Escuridão', 'Sombra', 'Subconsciente', 'Mistério'],
      spiritualGuidance: ['Face your shadows', 'Transform darkness', 'Integrate all parts'],
      ritualPractices: ['Ebo de integração', 'Offerings to Osain', 'Shadow meditation'],
      sacredFrequencies: ['396 Hz (Shadow work)', '528 Hz (Integration)', '852 Hz (Wholeness)'],
    },
  },
  {
    id: 'ifa-v2-012',
    name: 'Oturupon V2',
    namePt: 'Oturupon - O Tempo V2',
    nameEn: 'Oturupon - The Time V2',
    description: 'Enhanced Oturupon data with advanced v2 features for temporal work.',
    descriptionPt: 'Dados melhorados do Oturupon com recursos avançados v2 para trabalho temporal.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Tempo', 'Ciclos', 'Estações', 'Eternidade'],
      spiritualGuidance: ['Honor timing', 'Work with cycles', 'Embrace seasons'],
      ritualPractices: ['Ebo de tempo', 'Offerings to Orunmila', 'Time meditation'],
      sacredFrequencies: ['432 Hz (Cycles)', '528 Hz (Timing)', '741 Hz (Eternity)'],
    },
  },
  {
    id: 'ifa-v2-013',
    name: 'Otura V2',
    namePt: 'Otura - O Destino V2',
    nameEn: 'Otura - The Fate V2',
    description: 'Enhanced Otura data with advanced v2 features for fate alignment.',
    descriptionPt: 'Dados melhorados do Otura com recursos avançados v2 para alinhamento de destino.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Destino', 'Oráculo', 'Profecia', 'Visão'],
      spiritualGuidance: ['Align with destiny', 'See your path', 'Trust the oracle'],
      ritualPractices: ['Ebo de destino', 'Offerings to Orunmila', 'Oracle meditation'],
      sacredFrequencies: ['417 Hz (Prophecy)', '528 Hz (Destiny)', '852 Hz (Fate alignment)'],
    },
  },
  {
    id: 'ifa-v2-014',
    name: 'Irete V2',
    namePt: 'Irete - A Paz V2',
    nameEn: 'Irete - The Peace V2',
    description: 'Enhanced Irete data with advanced v2 features for peace work.',
    descriptionPt: 'Dados melhorados do Irete com recursos avançados v2 para trabalho de paz.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Paz', 'Harmonia', 'Tranquilidade', 'Equilíbrio'],
      spiritualGuidance: ['Seek inner peace', 'Create harmony', 'Balance all aspects'],
      ritualPractices: ['Ebo de paz', 'Offerings to Olokun', 'Peace meditation'],
      sacredFrequencies: ['432 Hz (Peace)', '528 Hz (Harmony)', '639 Hz (Balance)'],
    },
  },
  {
    id: 'ifa-v2-015',
    name: 'Ose V2',
    namePt: 'Ose - A Vitória V2',
    nameEn: 'Ose - The Victory V2',
    description: 'Enhanced Ose data with advanced v2 features for victory work.',
    descriptionPt: 'Dados melhorados do Ose com recursos avançados v2 para trabalho de vitória.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Vitória', 'Conquista', 'Triunfo', 'Sucesso'],
      spiritualGuidance: ['Claim your victory', 'Overcome obstacles', 'Succeed with grace'],
      ritualPractices: ['Ebo de vitória', 'Offerings to Xango', 'Victory meditation'],
      sacredFrequencies: ['396 Hz (Victory)', '528 Hz (Success)', '741 Hz (Triumph)'],
    },
  },
  {
    id: 'ifa-v2-016',
    name: 'Ofun V2',
    namePt: 'Ofun - O Silêncio V2',
    nameEn: 'Ofun - The Silence V2',
    description: 'Enhanced Ofun data with advanced v2 features for silence work.',
    descriptionPt: 'Dados melhorados do Ofun com recursos avançados v2 para trabalho de silêncio.',
    timestamp: Date.now(),
    v2Features: {
      oduPrinciples: ['Silêncio', 'Meditação', 'Contemplação', 'Sabedoria silenciosa'],
      spiritualGuidance: ['Embrace silence', 'Listen within', 'Find inner stillness'],
      ritualPractices: ['Ebo de silêncio', 'Offerings to Obatala', 'Silence meditation'],
      sacredFrequencies: ['432 Hz (Silence)', '528 Hz (Stillness)', '852 Hz (Inner wisdom)'],
    },
  },
];

/**
 * Get all Ifá v2 data entries
 */
export function getData(): IfaV2Data[] {
  return ifaV2Data;
}

/**
 * Get Ifá v2 data entry by id
 */
export function getDataById(id: string): IfaV2Data | undefined {
  return ifaV2Data.find((d) => d.id === id);
}

/**
 * Get Ifá v2 data by odu name
 */
export function getDataByName(name: string): IfaV2Data | undefined {
  return ifaV2Data.find(
    (d) => d.name.toLowerCase() === name.toLowerCase() ||
           d.namePt.toLowerCase() === name.toLowerCase() ||
           d.nameEn.toLowerCase() === name.toLowerCase()
  );
}