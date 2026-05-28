// @ts-nocheck
// Past-life data — soul history, incarnations, and karmic patterns

export interface PastLifeProfile {
  id: string;
  name: string;
  portugueseName: string;
  era: string;
  culture: string;
  description: string;
  lessons: string[];
  unresolvedThemes: string[];
  gifts: string[];
  challenges: string[];
  spiritualAge: 'young' | 'intermediate' | 'advanced' | 'master';
}

export interface PastLifeRelationship {
  id: string;
  type: 'soul-family' | 'karmic-debt' | 'twin-flame' | 'mentor' | 'student';
  description: string;
  soulConnection: string;
  sharedLessons: string[];
  currentLifeDynamics: string[];
}

export interface PastLifeTheme {
  id: string;
  name: string;
  portugueseName: string;
  category: 'trauma' | 'gift' | 'lesson' | 'mission';
  description: string;
  healingAffirmation: string;
  integrationPractice: string;
}

export interface PastLifeSkill {
  id: string;
  name: string;
  portugueseName: string;
  domain: string;
  description: string;
  currentLifeExpression: string;
  enhancementTip: string;
}

const profiles: PastLifeProfile[] = [
  {
    id: 'ancient-healer',
    name: 'Ancient Healer',
    portugueseName: 'Curador Antigo',
    era: 'Ancient Egypt / Ancient Greece',
    culture: 'Egyptian / Greek',
    description: 'Soul who mastered healing arts in ancient civilizations, working with sacred plants and energy',
    lessons: ['letting go of control', 'trusting modern methods', 'humility'],
    unresolvedThemes: ['feeling unrecognized', 'grief of lost knowledge', 'power vs service'],
    gifts: ['intuitive healing', 'herbal wisdom', 'energy channeling'],
    challenges: ['difficulty trusting current healthcare', 'expecting others to honor traditional ways'],
    spiritualAge: 'advanced',
  },
  {
    id: 'warrior-soldier',
    name: 'Warrior / Soldier',
    portugueseName: 'Guerreiro / Soldado',
    era: 'Various military eras',
    culture: 'Universal',
    description: 'Soul with extensive martial experience, carrying both heroic and traumatic war memories',
    lessons: ['non-violence', 'peaceful resolution', 'protecting without destroying'],
    unresolvedThemes: ['survivor guilt', 'violence witnessed', 'lives taken'],
    gifts: ['strategic thinking', 'courage', 'protective instincts'],
    challenges: ['hypervigilance', 'triggers from conflict', 'difficulty relaxing'],
    spiritualAge: 'intermediate',
  },
  {
    id: 'royal-noble',
    name: 'Royal / Noble',
    portugueseName: 'Rei / Nobre',
    era: 'Medieval Europe / Asian Dynasties',
    culture: 'European / Asian',
    description: 'Soul who lived as royalty, carrying themes of power, responsibility, and often isolation',
    lessons: ['service over privilege', 'humility', 'authentic power'],
    unresolvedThemes: ['abandonment', 'betrayal', 'loss of status', 'loneliness at top'],
    gifts: ['leadership', 'political awareness', 'dignity'],
    challenges: ['expecting special treatment', 'difficulty with equality', 'trust issues'],
    spiritualAge: 'intermediate',
  },
  {
    id: 'mystic-sage',
    name: 'Mystic / Sage',
    portugueseName: 'Místico / Sábio',
    era: 'Ancient India / Tibet / Middle East',
    culture: 'Eastern / Mystical',
    description: 'Soul with deep spiritual practice, often living as priests, monks, or spiritual teachers',
    lessons: ['embodied spirituality', 'worldly engagement', 'teaching simplicity'],
    unresolvedThemes: ['spiritual arrogance', 'otherworldly detachment', 'unfulfilled teaching mission'],
    gifts: ['spiritual wisdom', 'meditation mastery', 'divine connection'],
    challenges: ['difficulty with material world', 'social awkwardness', 'perfectionism'],
    spiritualAge: 'master',
  },
  {
    id: 'artist-creator',
    name: 'Artist / Creator',
    portugueseName: 'Artista / Criador',
    era: 'Renaissance / Various artistic periods',
    culture: 'Universal',
    description: 'Soul who expressed divine beauty through art, music, poetry, or creative invention',
    lessons: ['creation for joy', 'detachment from recognition', 'artistic integrity'],
    unresolvedThemes: ['unrecognized genius', 'poverty for art', 'perfectionism blocks creation'],
    gifts: ['creativity', 'aesthetic sensitivity', 'expression mastery'],
    challenges: ['creative blocks', 'comparison to past mastery', 'money relationship'],
    spiritualAge: 'intermediate',
  },
  {
    id: 'earth-worker',
    name: 'Earth Worker / Peasant',
    portugueseName: 'Trabalhador da Terra / Camponês',
    era: 'Pre-industrial / Agricultural societies',
    culture: 'Universal',
    description: 'Soul grounded in physical labor and earth connection, carrying wisdom of simple living',
    lessons: ['self-worth beyond work', 'rest without guilt', 'claiming abundance'],
    unresolvedThemes: ['poverty consciousness', 'feeling lesser', 'overwork patterns'],
    gifts: ['work ethic', 'resilience', 'earth wisdom', 'contentment'],
    challenges: ['overworking', 'undervaluing self', 'difficulty receiving'],
    spiritualAge: 'young',
  },
  {
    id: 'betrayed-lover',
    name: 'Betrayed Lover',
    portugueseName: 'Amante Traído',
    era: 'Various',
    culture: 'Universal',
    description: 'Soul carrying wounds of betrayal, infidelity, or love lost, affecting current relationships',
    lessons: ['forgiveness', 'trust rebuilding', 'healthy love'],
    unresolvedThemes: ['abandonment', 'infidelity', 'unrequited love', 'death by heartbreak'],
    gifts: ['deep emotional capacity', 'romantic sensitivity', 'loyalty'],
    challenges: ['trust issues', 'jealousy patterns', 'fear of abandonment'],
    spiritualAge: 'intermediate',
  },
  {
    id: 'teacher-educator',
    name: 'Teacher / Educator',
    portugueseName: 'Professor / Educador',
    era: 'Various educational periods',
    culture: 'Universal',
    description: 'Soul dedicated to knowledge transmission and learning facilitation',
    lessons: ['student-centered teaching', 'adapting to new knowledge', 'humility as learner'],
    unresolvedThemes: ['unsuccessful students', 'knowledge dismissed', 'teaching under oppression'],
    gifts: ['communication', 'patience', 'knowledge synthesis'],
    challenges: ['control in teaching', 'resistance to new methods', 'perfectionism in students'],
    spiritualAge: 'advanced',
  },
];

const relationships: PastLifeRelationship[] = [
  {
    id: 'soul-family-member',
    type: 'soul-family',
    description: 'Souls from the same soul group who incarnate together across lifetimes',
    soulConnection: 'shared origin, multiple reunion points',
    sharedLessons: ['unconditional love', 'forgiveness within family', 'balancing independence and connection'],
    currentLifeDynamics: ['instant familiarity', 'unexplained comfort or tension', 'role patterns repeat'],
  },
  {
    id: 'karmic-debt-owed',
    type: 'karmic-debt',
    description: 'Souls with unfinished karma requiring resolution in current life',
    soulConnection: 'unpaid energetic debt, cycle completion required',
    sharedLessons: ['forgiveness', 'setting boundaries', 'completing cycles'],
    currentLifeDynamics: ['intense attraction or repulsion', 'felt obligation', 'power dynamics'],
  },
  {
    id: 'twin-flame',
    type: 'twin-flame',
    description: 'Soul split from same source, mirror of self, accelerates spiritual growth',
    soulConnection: 'split from same origin, polar expressions, deep recognition',
    sharedLessons: ['self-love', 'union within', 'separateness as illusion'],
    currentLifeDynamics: ['powerful recognition', 'triggers intense growth', 'union or separation theme'],
  },
  {
    id: 'mentor-student-past',
    type: 'mentor',
    description: 'Soul who guided your development in past life, continuing role in current journey',
    soulConnection: 'wisdom transmission, karmic teaching bond',
    sharedLessons: ['honoring wisdom', 'eventually surpassing mentor', 'giving back'],
    currentLifeDynamics: ['easier learning from this person', 'unexplained trust', 'familiar teaching dynamic'],
  },
  {
    id: 'student-mentor-future',
    type: 'student',
    description: 'Soul you guided in past life, now potentially in reversed role',
    soulConnection: 'role reversal, completion of teaching cycle',
    sharedLessons: ['humble leadership', 'allowing growth', 'releasing attachment to being teacher'],
    currentLifeDynamics: ['feeling responsible for their growth', 'unexplained investment', 'frustration when not learning'],
  },
];

const themes: PastLifeTheme[] = [
  {
    id: 'abandonment',
    name: 'Abandonment',
    portugueseName: 'Abandono',
    category: 'trauma',
    description: 'Soul wound from being left, rejected, or separated from caregivers or loved ones',
    healingAffirmation: 'I am never truly abandoned. My soul is always supported by the divine.',
    integrationPractice: 'Practice self-soothing and building internal security through daily meditation.',
  },
  {
    id: 'rejection',
    name: 'Rejection',
    portugueseName: 'Rejeição',
    category: 'trauma',
    description: 'Wound from not being accepted for who you are, leading to people-pleasing or isolation',
    healingAffirmation: 'I am worthy as I am. My authentic self is accepted and loved.',
    integrationPractice: 'Practice expressing your true self in small ways and noticing acceptance.',
  },
  {
    id: 'betrayal',
    name: 'Betrayal',
    portugueseName: 'Traição',
    category: 'trauma',
    description: 'Deep wound from broken trust, infidelities, or deceived trust in relationships',
    healingAffirmation: 'I release the need to control others\' actions. Trust is my natural state.',
    integrationPractice: 'Practice discernment without suspicion; allow trust while maintaining boundaries.',
  },
  {
    id: 'humiliation',
    name: 'Humiliation',
    portugueseName: 'Humilhação',
    category: 'trauma',
    description: 'Shame wound from public disgrace, shame, or degradation experienced in past life',
    healingAffirmation: 'My worth is not determined by others\' opinions. I honor my dignity.',
    integrationPractice: 'Practice self-respect in small choices; speak your truth even in small matters.',
  },
  {
    id: 'healing-ability',
    name: 'Healing Ability',
    portugueseName: 'Habilidade de Cura',
    category: 'gift',
    description: 'Innate capacity to channel healing energy, often carried from lives as healer or medicine person',
    healingAffirmation: 'I channel divine healing through my hands and heart with grace and wisdom.',
    integrationPractice: 'Practice energy healing techniques like Reiki or therapeutic touch daily.',
  },
  {
    id: 'creative-genius',
    name: 'Creative Genius',
    portugueseName: 'Gênio Criativo',
    category: 'gift',
    description: 'Exceptional creative ability carried from lives as master artists, inventors, or creators',
    healingAffirmation: 'I access my creative source freely, allowing divine inspiration to flow through me.',
    integrationPractice: 'Daily creative practice without attachment to outcome or quality.',
  },
  {
    id: 'spiritual-authority',
    name: 'Spiritual Authority',
    portugueseName: 'Autoridade Espiritual',
    category: 'gift',
    description: 'Natural leadership in spiritual matters from lives as priest, shaman, or spiritual teacher',
    healingAffirmation: 'I speak with wisdom and compassion, honoring the divine within and without.',
    integrationPractice: 'Practice sharing spiritual insights when called; teach what you have mastered.',
  },
  {
    id: 'martial-mastery',
    name: 'Martial Mastery',
    portugueseName: 'Mestria Marcial',
    category: 'gift',
    description: 'Combat skills and physical discipline carried from warrior lives, now transformable to protection work',
    healingAffirmation: 'I transform warrior energy into protection, love, and service.',
    integrationPractice: 'Practice martial arts or protective visualization to transform combat energy constructively.',
  },
];

const skills: PastLifeSkill[] = [
  {
    id: 'energy-healing',
    name: 'Energy Healing',
    portugueseName: 'Cura Energética',
    domain: 'Healing',
    description: 'Ability to channel and direct life force energy for healing purposes',
    currentLifeExpression: 'Natural hands-on healing, intuition about others\' energy fields',
    enhancementTip: 'Practice grounding before healing, and always cleanse your energy after sessions.',
  },
  {
    id: 'mediumship',
    name: 'Mediumship',
    portugueseName: 'Mediunidade',
    domain: 'Communication',
    description: 'Capacity to communicate with spirits, deceased, or non-physical beings',
    currentLifeExpression: 'Vivid dreams of deceased, intuition about spirits, comfort in cemeteries or haunted places',
    enhancementTip: 'Develop strong psychic protection before opening to spirit communication. Start with reading cards or oracle before full mediumship.',
  },
  {
    id: 'divination',
    name: 'Divination',
    portugueseName: 'Divinação',
    domain: 'Wisdom',
    description: 'Ability to receive guidance through various oracle systems, cards, astrology, etc.',
    currentLifeExpression: 'Natural intuition about future, accurate gut feelings, affinity for tarot or oracle decks',
    enhancementTip: 'Practice daily card draws and track accuracy to develop your divinatory muscles.',
  },
  {
    id: 'herbalism',
    name: 'Herbalism',
    portugueseName: 'Herborismo',
    domain: 'Healing',
    description: 'Knowledge of medicinal plants and natural remedies carried from healer past lives',
    currentLifeExpression: 'Natural affinity for plants, intuitive knowing about herbs, comfort in nature',
    enhancementTip: 'Study local medicinal plants, grow an herb garden, or take herbalism courses.',
  },
  {
    id: 'mystical-vision',
    name: 'Mystical Vision',
    portugueseName: 'Visão Mística',
    domain: 'Spiritual',
    description: 'Ability to see auras, energy fields, spirits, or non-physical dimensions',
    currentLifeExpression: 'Seeing colors around people, visions during meditation, ability to see in darkness',
    enhancementTip: 'Practice third eye meditation, and learn to interpret what you see with discernment.',
  },
  {
    id: 'manifestation',
    name: 'Manifestation',
    portugueseName: 'Manifestação',
    domain: 'Creation',
    description: 'Mastery of creative visualization and materialization of intentions',
    currentLifeExpression: 'Often accidental creation of reality, powerful imagination, successful visualizations',
    enhancementTip: 'Keep a manifestation journal, practice scriptwriting your ideal day, and learn conscious co-creation.',
  },
];

export interface PastLifeData {
  profiles: PastLifeProfile[];
  relationships: PastLifeRelationship[];
  themes: PastLifeTheme[];
  skills: PastLifeSkill[];
  totalProfiles: number;
  totalRelationships: number;
  totalThemes: number;
  totalSkills: number;
  highestProfileId: string;
}

function buildData(): PastLifeData {
  return {
    profiles,
    relationships,
    themes,
    skills,
    totalProfiles: profiles.length,
    totalRelationships: relationships.length,
    totalThemes: themes.length,
    totalSkills: skills.length,
    highestProfileId: profiles[profiles.length - 1].id,
  };
}

// Singleton cache
let cachedData: PastLifeData | null = null;

export function getData(): PastLifeData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getProfileById(id: string): PastLifeProfile | undefined {
  return profiles.find((p) => p.id === id);
}

export function getProfilesByEra(era: string): PastLifeProfile[] {
  return profiles.filter((p) => p.era.toLowerCase().includes(era.toLowerCase()));
}

export function getProfilesByCulture(culture: string): PastLifeProfile[] {
  return profiles.filter((p) => p.culture.toLowerCase().includes(culture.toLowerCase()));
}

export function getProfilesBySpiritualAge(age: PastLifeProfile['spiritualAge']): PastLifeProfile[] {
  return profiles.filter((p) => p.spiritualAge === age);
}

export function getRelationshipById(id: string): PastLifeRelationship | undefined {
  return relationships.find((r) => r.id === id);
}

export function getRelationshipsByType(type: PastLifeRelationship['type']): PastLifeRelationship[] {
  return relationships.filter((r) => r.type === type);
}

export function getThemeById(id: string): PastLifeTheme | undefined {
  return themes.find((t) => t.id === id);
}

export function getThemesByCategory(category: PastLifeTheme['category']): PastLifeTheme[] {
  return themes.filter((t) => t.category === category);
}

export function getSkillById(id: string): PastLifeSkill | undefined {
  return skills.find((s) => s.id === id);
}

export function getSkillsByDomain(domain: string): PastLifeSkill[] {
  return skills.filter((s) => s.domain.toLowerCase() === domain.toLowerCase());
}