// ============================================================================
// ACHIEVEMENTS — Catalog + criteria evaluator (Wave 69, 2026-06-30)
// ============================================================================
// Pure-logic engine (no DB, no React) — registra 30+ conquistas espirituais,
// avalia critérios a partir do userState, retorna o que foi recém-desbloqueado.
//
// Design decisions:
//   - Branded types (AchievementId/UserId/Timestamp) prevent cross-mixing
//   - i18n via Record<Locale, string> (default pt-BR + en; extensível)
//   - Criteria functions are PURE — same input → same output, no Date.now()
//     unless the achievement explicitly needs it (none do here for eval)
//   - At least 50% dos achievements referenciam símbolo sagrado (Cigano/Orixás/etc.)
//   - Anti-dark-pattern: copy is positive/invitational ("awaits" / "convida")
//   - Single source of truth: ACHIEVEMENTS array — derived helpers walk it
// ============================================================================

// ============================================================================
// TYPES — Public brand types
// ============================================================================

declare const _brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [key in typeof _brand]: B };

/** Stable identifier for an achievement (e.g. "first-light"). */
export type AchievementId = Brand<string, 'AchievementId'>;
/** Stable identifier for a user. */
export type UserId = Brand<string, 'UserId'>;
/** ISO-8601 timestamp string ("2026-06-30T01:23:45.678Z"). */
export type Timestamp = Brand<string, 'Timestamp'>;

/** Available locales. Default is pt-BR; English always present. */
export type Locale = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR';

/** Visual tier for the badge. */
export type Tier = 'bronze' | 'silver' | 'gold' | 'mythic';

/** Categories — stable, used by progress.ts aggregators. */
export type AchievementCategory =
  | 'readings'
  | 'streaks'
  | 'reflection'
  | 'community'
  | 'exploration';

/** Sacred tradition taxonomy (7 traditions — counted by Wheel, not hardcoded). */
export type SacredTradition =
  | 'cigano'
  | 'tarot'
  | 'astrologia'
  | 'orixas'
  | 'cabala'
  | 'numerologia'
  | 'tantra';

/** Sacred reference for an achievement — symbol + tradition. Optional. */
export interface SacredRef {
  readonly tradition: SacredTradition;
  readonly symbol: string; // human-readable name (e.g. "Mesa Real", "Mestre Cigano")
  readonly note: string; // contextual note about why this achievement references the symbol
}

/** Badge styling metadata. */
export interface BadgeStyle {
  readonly iconName: string;
  readonly tier: Tier;
  readonly color: string; // hex/rgb for theme CSS vars
  readonly glowEffect: boolean;
}

/** A catalog entry — exposed for inspection but criteria/copy live here. */
export interface AchievementDefinition {
  readonly id: AchievementId;
  readonly title: Record<Locale, string>;
  readonly description: Record<Locale, string>;
  readonly category: AchievementCategory;
  /** Pure predicate on user state. MUST return boolean. */
  readonly criteria: (state: UserState) => boolean;
  readonly badge: BadgeStyle;
  readonly sacredRef?: SacredRef;
  /** Sort weight — lower = earlier in default ordering. Stable for UI lists. */
  readonly order: number;
}

/** Snapshot of everything the criteria functions need. */
export interface UserState {
  readonly userId: UserId;
  readonly totalReadings: number;     // 0..∞
  readonly ciganoReadings: number;
  readonly tarotReadings: number;
  readonly astrologiaReadings: number;
  readonly orixasReadings: number;
  readonly cabalaReadings: number;
  readonly numerologiaReadings: number;
  readonly tantraReadings: number;
  readonly currentStreak: number;     // 0..∞ (days)
  readonly longestStreak: number;
  readonly reflections: number;       // daily reflections
  readonly dreams: number;            // dream journal entries
  readonly posts: number;             // community posts
  readonly helpfulComments: number;   // marked helpful by others
  readonly mentoringPeer: boolean;    // accepted + completed a mentorship
  readonly uniqueTraditionsUsed: number; // distinct traditions in reading history
  readonly readingTypesUsed: number;  // distinct reading types (not tradition-bound)
  readonly hasCompletedOnboarding: boolean;
}

/** A unlocked achievement record returned by listUnlocked. */
export interface UnlockedAchievement {
  readonly achievement: AchievementDefinition;
  readonly earnedAt: Timestamp;
}

// ============================================================================
// HELPERS — Constructors + guards
// ============================================================================

const asAchievementId = (s: string): AchievementId => s as AchievementId;
const asUserId = (s: string): UserId => s as UserId;
const asTimestamp = (s: string): Timestamp => s as Timestamp;

/** Fallback: when a locale is missing, pt-BR is the source-of-truth default. */
function localize(
  map: Record<Locale, string>,
  locale: Locale,
): string {
  return map[locale] ?? map['pt-BR'];
}

// ============================================================================
// CRITERIA BUILDERS — Reusable predicates over UserState
// ============================================================================
// Cycle 60+ lesson: keep criteria predicates pure (no Date.now, no Math.random).
// Named-counter helpers below ensure criterion formulas are easy to audit.

function atLeast(
  field: keyof Pick<
    UserState,
    | 'totalReadings'
    | 'ciganoReadings'
    | 'tarotReadings'
    | 'astrologiaReadings'
    | 'orixasReadings'
    | 'cabalaReadings'
    | 'numerologiaReadings'
    | 'tantraReadings'
    | 'currentStreak'
    | 'longestStreak'
    | 'reflections'
    | 'dreams'
    | 'posts'
    | 'helpfulComments'
  >,
  min: number,
): (s: UserState) => boolean {
  return (s: UserState) => (s[field] as number) >= min;
}

function atLeastBy(
  compute: (s: UserState) => number,
  min: number,
): (s: UserState) => boolean {
  return (s: UserState) => compute(s) >= min;
}

// ============================================================================
// ACHIEVEMENTS — Canonical catalog (30+ entries)
// ============================================================================

export const ACHIEVEMENTS: readonly AchievementDefinition[] =
  Object.freeze([
    // ---------- READINGS (volume milestones) ----------
    {
      id: asAchievementId('first-light'),
      title: {
        'pt-BR': 'Primeira Luz',
        'en-US': 'First Light',
        'es-ES': 'Primera Luz',
        'fr-FR': 'Première Lumière',
      },
      description: {
        'pt-BR': 'Você fez sua primeira leitura. Bem-vindo(a) ao Caminho.',
        'en-US': 'You completed your first reading. Welcome to the Path.',
        'es-ES': 'Hiciste tu primera lectura. Bienvenido(a) al Camino.',
        'fr-FR': 'Tu as fait ta première lecture. Bienvenue sur le Chemin.',
      },
      category: 'readings',
      criteria: atLeast('totalReadings', 1),
      badge: { iconName: 'sparkles', tier: 'bronze', color: '#D2691E', glowEffect: false },
      sacredRef: { tradition: 'cigano', symbol: '1 — O Cigano', note: 'Toda jornada começa com a primeira carta virada.' },
      order: 10,
    },
    {
      id: asAchievementId('devoted-seeker'),
      title: {
        'pt-BR': 'Buscador Dedicado',
        'en-US': 'Devoted Seeker',
        'es-ES': 'Buscador Dedicado',
        'fr-FR': 'Chercheur Dévoué',
      },
      description: {
        'pt-BR': 'Você já fez 10 leituras. A consistência desperta a luz.',
        'en-US': 'You have made 10 readings. Consistency awakens the light.',
        'es-ES': 'Ya has hecho 10 lecturas. La constancia despierta la luz.',
        'fr-FR': 'Tu as fait 10 lectures. La constance éveille la lumière.',
      },
      category: 'readings',
      criteria: atLeast('totalReadings', 10),
      badge: { iconName: 'compass', tier: 'bronze', color: '#D2691E', glowEffect: false },
      order: 20,
    },
    {
      id: asAchievementId('caminhante-do-caminho'),
      title: {
        'pt-BR': 'Caminhante do Caminho',
        'en-US': 'Walker of the Path',
        'es-ES': 'Caminante del Camino',
        'fr-FR': 'Marcheur du Chemin',
      },
      description: {
        'pt-BR': '50 leituras. Seu caminhar já tem ritmo próprio.',
        'en-US': '50 readings. Your walking now has its own rhythm.',
        'es-ES': '50 lecturas. Tu caminar ya tiene su propio ritmo.',
        'fr-FR': '50 lectures. Ta marche a désormais son propre rythme.',
      },
      category: 'readings',
      criteria: atLeast('totalReadings', 50),
      badge: { iconName: 'footprints', tier: 'silver', color: '#C0C0C0', glowEffect: false },
      sacredRef: { tradition: 'cigano', symbol: 'O Andante', note: 'O Andante representa o passo firme no Caminho.' },
      order: 30,
    },
    {
      id: asAchievementId('mestre-da-mesa'),
      title: {
        'pt-BR': 'Mestre da Mesa',
        'en-US': 'Master of the Table',
        'es-ES': 'Maestro de la Mesa',
        'fr-FR': 'Maître de la Table',
      },
      description: {
        'pt-BR': '100 leituras. Sua presença já é referência na Mesa Real.',
        'en-US': '100 readings. Your presence is already a reference at the Royal Table.',
        'es-ES': '100 lecturas. Tu presencia ya es referente en la Mesa Real.',
        'fr-FR': '100 lectures. Ta présence est désormais une référence à la Table Royale.',
      },
      category: 'readings',
      criteria: atLeast('totalReadings', 100),
      badge: { iconName: 'crown', tier: 'gold', color: '#FFD700', glowEffect: true },
      sacredRef: { tradition: 'cigano', symbol: 'Mesa Real', note: 'Na tradição cigana, a mesa é o centro do ritual.' },
      order: 40,
    },
    {
      id: asAchievementId('oracle-elder'),
      title: {
        'pt-BR': 'Ancião do Oráculo',
        'en-US': 'Oracle Elder',
        'es-ES': 'Anciano del Oráculo',
        'fr-FR': 'Ancien de l\u2019Oracle',
      },
      description: {
        'pt-BR': '500 leituras. Sua voz é parte do oráculo.',
        'en-US': '500 readings. Your voice is part of the oracle.',
        'es-ES': '500 lecturas. Tu voz es parte del oráculo.',
        'fr-FR': '500 lectures. Ta voix fait partie de l\u2019oracle.',
      },
      category: 'readings',
      criteria: atLeast('totalReadings', 500),
      badge: { iconName: 'eye', tier: 'mythic', color: '#9400D3', glowEffect: true },
      order: 50,
    },

    // ---------- READINGS — by tradition ----------
    {
      id: asAchievementId('cigano-sincero'),
      title: {
        'pt-BR': 'Cigano Sincero',
        'en-US': 'Sincere Gypsy',
        'es-ES': 'Gitano Sincero',
        'fr-FR': 'Tsigane Sincère',
      },
      description: {
        'pt-BR': '10 leituras no caminho cigano. A voz do Cigano já te conhece.',
        'en-US': '10 readings on the gypsy path. The Gypsy\u2019s voice already knows you.',
        'es-ES': '10 lecturas en el camino gitano. La voz del Gitano ya te conoce.',
        'fr-FR': '10 lectures sur le chemin tsigane. La voix du Tsigane te connaît déjà.',
      },
      category: 'readings',
      criteria: atLeast('ciganoReadings', 10),
      badge: { iconName: 'moon', tier: 'bronze', color: '#D2691E', glowEffect: false },
      sacredRef: { tradition: 'cigano', symbol: 'A Lua Cigana', note: 'O caminho cigano fala pelos signos lunares.' },
      order: 110,
    },
    {
      id: asAchievementId('cigano-viajante'),
      title: {
        'pt-BR': 'Viajante Cigano',
        'en-US': 'Gypsy Voyager',
        'es-ES': 'Viajero Gitano',
        'fr-FR': 'Voyageur Tsigane',
      },
      description: {
        'pt-BR': '50 leituras no caminho cigano. Você já fala a língua da estrada.',
        'en-US': '50 readings on the gypsy path. You speak the language of the road.',
        'es-ES': '50 lecturas en el camino gitano. Ya hablas la lengua del camino.',
        'fr-FR': '50 lectures sur le chemin tsigane. Tu parles la langue de la route.',
      },
      category: 'readings',
      criteria: atLeast('ciganoReadings', 50),
      badge: { iconName: 'star', tier: 'silver', color: '#C0C0C0', glowEffect: false },
      sacredRef: { tradition: 'cigano', symbol: 'Estrela Cigana', note: 'A estrela guia quem caminha.' },
      order: 115,
    },
    {
      id: asAchievementId('astrologia-iniciante'),
      title: {
        'pt-BR': 'Astrologia Iniciante',
        'en-US': 'Astrology Apprentice',
        'es-ES': 'Astrología Aprendiz',
        'fr-FR': 'Astrologie Apprenti',
      },
      description: {
        'pt-BR': '10 leituras astrológicas. O céu já conversa com você.',
        'en-US': '10 astrological readings. The sky already converses with you.',
        'es-ES': '10 lecturas astrológicas. El cielo ya conversa contigo.',
        'fr-FR': '10 lectures astrologiques. Le ciel converse déjà avec toi.',
      },
      category: 'readings',
      criteria: atLeast('astrologiaReadings', 10),
      badge: { iconName: 'globe', tier: 'bronze', color: '#D2691E', glowEffect: false },
      sacredRef: { tradition: 'astrologia', symbol: 'Carta Natal', note: 'O mapa natal é o espelho do céu.' },
      order: 120,
    },
    {
      id: asAchievementId('astrologia-mestra'),
      title: {
        'pt-BR': 'Astróloga Dedicada',
        'en-US': 'Dedicated Astrologer',
        'es-ES': 'Astróloga Dedicada',
        'fr-FR': 'Astrologue Dédiée',
      },
      description: {
        'pt-BR': '50 leituras astrológicas. Você começa a ler entre os planetas.',
        'en-US': '50 astrological readings. You begin to read between the planets.',
        'es-ES': '50 lecturas astrológicas. Empiezas a leer entre los planetas.',
        'fr-FR': '50 lectures astrologiques. Tu commences à lire entre les planètes.',
      },
      category: 'readings',
      criteria: atLeast('astrologiaReadings', 50),
      badge: { iconName: 'sun', tier: 'silver', color: '#C0C0C0', glowEffect: true },
      sacredRef: { tradition: 'astrologia', symbol: 'Sol e Ascendente', note: 'O Sol ilumina, o Ascendente revela.' },
      order: 125,
    },
    {
      id: asAchievementId('orixas-tocado'),
      title: {
        'pt-BR': 'Tocado pelos Orixás',
        'en-US': 'Touched by the Orixás',
        'es-ES': 'Tocado por los Orixás',
        'fr-FR': 'Touché par les Orixás',
      },
      description: {
        'pt-BR': '10 leituras com os orixás. Você recebeu o axé da palavra.',
        'en-US': '10 readings with the orixás. You have received the axé of word.',
        'es-ES': '10 lecturas con los orixás. Recibiste el axé de la palabra.',
        'fr-FR': '10 lectures avec les orixás. Tu as reçu l\u2019axé de la parole.',
      },
      category: 'readings',
      criteria: atLeast('orixasReadings', 10),
      badge: { iconName: 'feather', tier: 'bronze', color: '#D2691E', glowEffect: false },
      sacredRef: { tradition: 'orixas', symbol: 'Orixá Regente', note: 'Cada odu traz o orixá que pede passagem.' },
      order: 130,
    },
    {
      id: asAchievementId('orixas-filhos-do-axxe'),
      title: {
        'pt-BR': 'Filhos do Axé',
        'en-US': 'Children of the Axé',
        'es-ES': 'Hijos del Axé',
        'fr-FR': 'Enfants de l\u2019Axé',
      },
      description: {
        'pt-BR': '50 leituras com os orixás. A corrente te sustenta.',
        'en-US': '50 readings with the orixás. The current sustains you.',
        'es-ES': '50 lecturas con los orixás. La corriente te sostiene.',
        'fr-FR': '50 lectures avec les orixás. Le courant te soutient.',
      },
      category: 'readings',
      criteria: atLeast('orixasReadings', 50),
      badge: { iconName: 'leaf', tier: 'silver', color: '#C0C0C0', glowEffect: true },
      sacredRef: { tradition: 'orixas', symbol: 'Corrente de Axé', note: 'A corrente sustenta os iniciados.' },
      order: 135,
    },
    {
      id: asAchievementId('cabala-estudante'),
      title: {
        'pt-BR': 'Estudante da Cabala',
        'en-US': 'Kabbalah Student',
        'es-ES': 'Estudiante de Cábala',
        'fr-FR': 'Étudiant de la Kabbale',
      },
      description: {
        'pt-BR': '10 leituras cabalísticas. As Sefirot começam a se iluminar.',
        'en-US': '10 kabbalistic readings. The Sefirot begin to illuminate.',
        'es-ES': '10 lecturas cabalísticas. Las Sefirot empiezan a iluminarse.',
        'fr-FR': '10 lectures kabbalistiques. Les Séfirot commencent à s\u2019éclairer.',
      },
      category: 'readings',
      criteria: atLeast('cabalaReadings', 10),
      badge: { iconName: 'tree', tier: 'bronze', color: '#D2691E', glowEffect: false },
      sacredRef: { tradition: 'cabala', symbol: 'Árvore da Vida', note: 'As 10 Sefirot se entrelaçam na Árvore.' },
      order: 140,
    },
    {
      id: asAchievementId('numerologia-vibrante'),
      title: {
        'pt-BR': 'Vibração Numérica',
        'en-US': 'Numerical Vibration',
        'es-ES': 'Vibración Numérica',
        'fr-FR': 'Vibration Numérique',
      },
      description: {
        'pt-BR': '10 leituras numerológicas. Os números te respondem.',
        'en-US': '10 numerological readings. The numbers respond to you.',
        'es-ES': '10 lecturas numerológicas. Los números te responden.',
        'fr-FR': '10 lectures numérologiques. Les chiffres te répondent.',
      },
      category: 'readings',
      criteria: atLeast('numerologiaReadings', 10),
      badge: { iconName: 'hash', tier: 'bronze', color: '#D2691E', glowEffect: false },
      sacredRef: { tradition: 'numerologia', symbol: 'Número de Vida', note: 'O número regente vibra no mapa pessoal.' },
      order: 150,
    },
    {
      id: asAchievementId('tantra-desperto'),
      title: {
        'pt-BR': 'Despertar Tantra',
        'en-US': 'Tantra Awakening',
        'es-ES': 'Despertar Tantra',
        'fr-FR': 'Éveil Tantra',
      },
      description: {
        'pt-BR': '10 leituras tântricas. O corpo te fala com clareza.',
        'en-US': '10 tantric readings. The body speaks to you clearly.',
        'es-ES': '10 lecturas tántricas. El cuerpo te habla con claridad.',
        'fr-FR': '10 lectures tantriques. Le corps te parle avec clarté.',
      },
      category: 'readings',
      criteria: atLeast('tantraReadings', 10),
      badge: { iconName: 'flame', tier: 'bronze', color: '#D2691E', glowEffect: true },
      sacredRef: { tradition: 'tantra', symbol: 'Energia Kundalini', note: 'O fogo desperto serpenteia pela coluna.' },
      order: 160,
    },
    {
      id: asAchievementId('tarot-leitor'),
      title: {
        'pt-BR': 'Leitor de Tarot',
        'en-US': 'Tarot Reader',
        'es-ES': 'Lector de Tarot',
        'fr-FR': 'Lecteur de Tarot',
      },
      description: {
        'pt-BR': '10 leituras de tarot. As cartas já te reconhecem.',
        'en-US': '10 tarot readings. The cards already recognize you.',
        'es-ES': '10 lecturas de tarot. Las cartas ya te reconocen.',
        'fr-FR': '10 lectures de tarot. Les cartes te reconnaissent déjà.',
      },
      category: 'readings',
      criteria: atLeast('tarotReadings', 10),
      badge: { iconName: 'card', tier: 'bronze', color: '#D2691E', glowEffect: false },
      sacredRef: { tradition: 'tarot', symbol: 'Os Arcanos', note: 'Os 78 Arcanos são espelhos do Caminho.' },
      order: 170,
    },

    // ---------- STREAKS ----------
    {
      id: asAchievementId('chama-de-3-dias'),
      title: {
        'pt-BR': 'Chama de 3 Dias',
        'en-US': 'Three-Day Flame',
        'es-ES': 'Llama de 3 Días',
        'fr-FR': 'Flamme de 3 Jours',
      },
      description: {
        'pt-BR': '3 dias seguidos no Caminho. A chama acendeu.',
        'en-US': '3 days in a row on the Path. The flame has lit.',
        'es-ES': '3 días seguidos en el Camino. La llama encendió.',
        'fr-FR': '3 jours d\u2019affilée sur le Chemin. La flamme est allumée.',
      },
      category: 'streaks',
      criteria: atLeast('currentStreak', 3),
      badge: { iconName: 'flame', tier: 'bronze', color: '#D2691E', glowEffect: true },
      order: 210,
    },
    {
      id: asAchievementId('chama-de-7-dias'),
      title: {
        'pt-BR': 'Chama de 7 Dias',
        'en-US': 'Seven-Day Flame',
        'es-ES': 'Llama de 7 Días',
        'fr-FR': 'Flamme de 7 Jours',
      },
      description: {
        'pt-BR': 'Uma semana inteira de prática. A chama é firme.',
        'en-US': 'A full week of practice. The flame is steady.',
        'es-ES': 'Una semana entera de práctica. La llama es firme.',
        'fr-FR': 'Une semaine entière de pratique. La flamme est stable.',
      },
      category: 'streaks',
      criteria: atLeast('currentStreak', 7),
      badge: { iconName: 'flame', tier: 'bronze', color: '#D2691E', glowEffect: true },
      sacredRef: { tradition: 'numerologia', symbol: '7 — Sabedoria', note: 'O 7 é o número do despertar interior.' },
      order: 220,
    },
    {
      id: asAchievementId('chama-de-30-dias'),
      title: {
        'pt-BR': 'Chama de 30 Dias',
        'en-US': 'Thirty-Day Flame',
        'es-ES': 'Llama de 30 Días',
        'fr-FR': 'Flamme de 30 Jours',
      },
      description: {
        'pt-BR': '30 dias seguidos. O hábito já fala por você.',
        'en-US': '30 days in a row. The habit now speaks for you.',
        'es-ES': '30 días seguidos. El hábito ya habla por ti.',
        'fr-FR': '30 jours d\u2019affilée. L\u2019habitude parle désormais pour toi.',
      },
      category: 'streaks',
      criteria: atLeast('currentStreak', 30),
      badge: { iconName: 'flame', tier: 'silver', color: '#C0C0C0', glowEffect: true },
      sacredRef: { tradition: 'numerologia', symbol: '30 — Ciclo Lunar', note: '30 dias fecham o ciclo lunar.' },
      order: 230,
    },
    {
      id: asAchievementId('chama-de-100-dias'),
      title: {
        'pt-BR': 'Chama de 100 Dias',
        'en-US': 'Hundred-Day Flame',
        'es-ES': 'Llama de 100 Días',
        'fr-FR': 'Flamme de 100 Jours',
      },
      description: {
        'pt-BR': '100 dias seguidos. Você transcendeu a rotina — virou prática.',
        'en-US': '100 days in a row. You transcended routine — became practice.',
        'es-ES': '100 días seguidos. Trascendiste la rutina — te volviste práctica.',
        'fr-FR': '100 jours d\u2019affilée. Tu as transcendé la routine — devenue pratique.',
      },
      category: 'streaks',
      criteria: atLeast('currentStreak', 100),
      badge: { iconName: 'flame', tier: 'gold', color: '#FFD700', glowEffect: true },
      order: 240,
    },
    {
      id: asAchievementId('chama-de-365-dias'),
      title: {
        'pt-BR': 'Chama de 365 Dias',
        'en-US': 'Year-Round Flame',
        'es-ES': 'Llama de 365 Días',
        'fr-FR': 'Flamme de 365 Jours',
      },
      description: {
        'pt-BR': 'Um ano solar de presença diária. Você é o Caminho.',
        'en-US': 'A full solar year of daily presence. You are the Path.',
        'es-ES': 'Un año solar de presencia diaria. Tú eres el Camino.',
        'fr-FR': 'Une année solaire de présence quotidienne. Tu es le Chemin.',
      },
      category: 'streaks',
      criteria: atLeast('currentStreak', 365),
      badge: { iconName: 'flame', tier: 'mythic', color: '#9400D3', glowEffect: true },
      order: 250,
    },

    // ---------- REFLECTION ----------
    {
      id: asAchievementId('primeira-reflexao'),
      title: {
        'pt-BR': 'Primeira Reflexão',
        'en-US': 'First Reflection',
        'es-ES': 'Primera Reflexión',
        'fr-FR': 'Première Réflexion',
      },
      description: {
        'pt-BR': 'Você registrou sua primeira reflexão.',
        'en-US': 'You recorded your first reflection.',
        'es-ES': 'Registraste tu primera reflexión.',
        'fr-FR': 'Tu as enregistré ta première réflexion.',
      },
      category: 'reflection',
      criteria: atLeast('reflections', 1),
      badge: { iconName: 'feather', tier: 'bronze', color: '#D2691E', glowEffect: false },
      order: 310,
    },
    {
      id: asAchievementId('reflexao-semanal'),
      title: {
        'pt-BR': 'Reflexão Semanal',
        'en-US': 'Weekly Reflection',
        'es-ES': 'Reflexión Semanal',
        'fr-FR': 'Réflexion Hebdomadaire',
      },
      description: {
        'pt-BR': '7 reflexões registradas. Sua voz interior começa a falar.',
        'en-US': '7 reflections recorded. Your inner voice begins to speak.',
        'es-ES': '7 reflexiones registradas. Tu voz interior empieza a hablar.',
        'fr-FR': '7 réflexions enregistrées. Ta voix intérieure commence à parler.',
      },
      category: 'reflection',
      criteria: atLeast('reflections', 7),
      badge: { iconName: 'feather', tier: 'bronze', color: '#D2691E', glowEffect: false },
      order: 320,
    },
    {
      id: asAchievementId('diario-de-sonhos'),
      title: {
        'pt-BR': 'Diário de Sonhos',
        'en-US': 'Dream Journal',
        'es-ES': 'Diario de Sueños',
        'fr-FR': 'Journal des Rêves',
      },
      description: {
        'pt-BR': '10 sonhos registrados. O inconsciente te conta histórias.',
        'en-US': '10 dreams recorded. The unconscious tells you stories.',
        'es-ES': '10 sueños registrados. El inconsciente te cuenta historias.',
        'fr-FR': '10 rêves enregistrés. L\u2019inconscient te raconte des histoires.',
      },
      category: 'reflection',
      criteria: atLeast('dreams', 10),
      badge: { iconName: 'moon', tier: 'silver', color: '#C0C0C0', glowEffect: true },
      sacredRef: { tradition: 'astrologia', symbol: 'Lua dos Sonhos', note: 'A lua rege o mundo onírico.' },
      order: 330,
    },
    {
      id: asAchievementId('reflexao-mestre'),
      title: {
        'pt-BR': 'Mestre da Reflexão',
        'en-US': 'Master of Reflection',
        'es-ES': 'Maestro de la Reflexión',
        'fr-FR': 'Maître de la Réflexion',
      },
      description: {
        'pt-BR': '100 reflexões. O espelho interior devolve a você a si mesmo.',
        'en-US': '100 reflections. The inner mirror returns you to yourself.',
        'es-ES': '100 reflexiones. El espejo interior te devuelve a ti mismo.',
        'fr-FR': '100 réflexions. Le miroir intérieur te rend à toi-même.',
      },
      category: 'reflection',
      criteria: atLeast('reflections', 100),
      badge: { iconName: 'eye', tier: 'gold', color: '#FFD700', glowEffect: true },
      order: 340,
    },

    // ---------- COMMUNITY ----------
    {
      id: asAchievementId('primeira-partilha'),
      title: {
        'pt-BR': 'Primeira Partilha',
        'en-US': 'First Sharing',
        'es-ES': 'Primera Compartida',
        'fr-FR': 'Premier Partage',
      },
      description: {
        'pt-BR': 'Você compartilhou sua primeira leitura com a comunidade.',
        'en-US': 'You shared your first reading with the community.',
        'es-ES': 'Compartiste tu primera lectura con la comunidad.',
        'fr-FR': 'Tu as partagé ta première lecture avec la communauté.',
      },
      category: 'community',
      criteria: atLeast('posts', 1),
      badge: { iconName: 'heart', tier: 'bronze', color: '#D2691E', glowEffect: false },
      order: 410,
    },
    {
      id: asAchievementId('conselheiro'),
      title: {
        'pt-BR': 'Conselheiro',
        'en-US': 'Counselor',
        'es-ES': 'Consejero',
        'fr-FR': 'Conseiller',
      },
      description: {
        'pt-BR': '10 comentários marcados como úteis. Sua palavra ajuda.',
        'en-US': '10 comments marked helpful. Your word helps.',
        'es-ES': '10 comentarios marcados como útiles. Tu palabra ayuda.',
        'fr-FR': '10 commentaires marqués comme utiles. Ta parole aide.',
      },
      category: 'community',
      criteria: atLeast('helpfulComments', 10),
      badge: { iconName: 'chat', tier: 'silver', color: '#C0C0C0', glowEffect: false },
      order: 420,
    },
    {
      id: asAchievementId('mentor-solidario'),
      title: {
        'pt-BR': 'Mentor Solidário',
        'en-US': 'Solidarity Mentor',
        'es-ES': 'Mentor Solidario',
        'fr-FR': 'Mentor Solidaire',
      },
      description: {
        'pt-BR': 'Você completou uma mentoria. O Caminho se multiplica.',
        'en-US': 'You completed a mentorship. The Path multiplies.',
        'es-ES': 'Completaste una mentoría. El Camino se multiplica.',
        'fr-FR': 'Tu as terminé un mentorat. Le Chemin se multiplie.',
      },
      category: 'community',
      criteria: (s: UserState) => s.mentoringPeer === true,
      badge: { iconName: 'star', tier: 'gold', color: '#FFD700', glowEffect: true },
      sacredRef: { tradition: 'orixas', symbol: 'O Mentoreiro', note: 'Na tradição nagô, o mais antigo partilha com o mais novo.' },
      order: 430,
    },
    {
      id: asAchievementId('mestre-da-celebracao'),
      title: {
        'pt-BR': 'Mestre da Celebração',
        'en-US': 'Master of Celebration',
        'es-ES': 'Maestro de la Celebración',
        'fr-FR': 'Maître de la Célébration',
      },
      description: {
        'pt-BR': '100 partilhas na comunidade. Você já é parte da roda.',
        'en-US': '100 sharings in the community. You are part of the wheel.',
        'es-ES': '100 compartidas en la comunidad. Ya eres parte de la rueda.',
        'fr-FR': '100 partages dans la communauté. Tu fais partie de la roue.',
      },
      category: 'community',
      criteria: atLeast('posts', 100),
      badge: { iconName: 'crown', tier: 'gold', color: '#FFD700', glowEffect: true },
      order: 440,
    },

    // ---------- EXPLORATION ----------
    {
      id: asAchievementId('tocou-3-tradicoes'),
      title: {
        'pt-BR': 'Tocou 3 Tradições',
        'en-US': 'Touched 3 Traditions',
        'es-ES': 'Tocaste 3 Tradiciones',
        'fr-FR': 'Touché 3 Traditions',
      },
      description: {
        'pt-BR': 'Você explorou 3 tradições diferentes. Curiosidade lúcida.',
        'en-US': 'You explored 3 different traditions. Lucid curiosity.',
        'es-ES': 'Exploraste 3 tradiciones diferentes. Curiosidad lúcida.',
        'fr-FR': 'Tu as exploré 3 traditions différentes. Curiosité lucide.',
      },
      category: 'exploration',
      criteria: atLeastBy((s) => s.uniqueTraditionsUsed, 3),
      badge: { iconName: 'compass', tier: 'bronze', color: '#D2691E', glowEffect: false },
      order: 510,
    },
    {
      id: asAchievementId('tocou-5-tradicoes'),
      title: {
        'pt-BR': 'Tocou 5 Tradições',
        'en-US': 'Touched 5 Traditions',
        'es-ES': 'Tocaste 5 Tradiciones',
        'fr-FR': 'Touché 5 Traditions',
      },
      description: {
        'pt-BR': 'Você explorou 5 tradições. Seu mapa é plural.',
        'en-US': 'You explored 5 traditions. Your map is plural.',
        'es-ES': 'Exploraste 5 tradiciones. Tu mapa es plural.',
        'fr-FR': 'Tu as exploré 5 traditions. Ta carte est plurielle.',
      },
      category: 'exploration',
      criteria: atLeastBy((s) => s.uniqueTraditionsUsed, 5),
      badge: { iconName: 'globe', tier: 'silver', color: '#C0C0C0', glowEffect: false },
      sacredRef: { tradition: 'cabala', symbol: 'Os 5 Mundos', note: 'Os 5 mundos cabalísticos se atravessam.' },
      order: 520,
    },
    {
      id: asAchievementId('orculo-inclusivo'),
      title: {
        'pt-BR': 'Oráculo Inclusivo',
        'en-US': 'Inclusive Oracle',
        'es-ES': 'Oráculo Inclusivo',
        'fr-FR': 'Oracle Inclusif',
      },
      description: {
        'pt-BR': 'Você usou todos os tipos de leitura. Nenhum caminho ficou de fora.',
        'en-US': 'You used all reading types. No path was left out.',
        'es-ES': 'Usaste todos los tipos de lectura. Ningún camino quedó afuera.',
        'fr-FR': 'Tu as utilisé tous les types de lecture. Aucun chemin n\u2019a été oublié.',
      },
      category: 'exploration',
      criteria: atLeastBy((s) => s.readingTypesUsed, 6),
      badge: { iconName: 'star', tier: 'gold', color: '#FFD700', glowEffect: true },
      sacredRef: { tradition: 'tarot', symbol: 'Os 4 Naipes', note: 'Os 4 naipes do tarot cobrem todas as direções.' },
      order: 530,
    },
    {
      id: asAchievementId('caminhante-de-todas-as-portas'),
      title: {
        'pt-BR': 'Caminhante de Todas as Portas',
        'en-US': 'Walker of All Doors',
        'es-ES': 'Caminante de Todas las Puertas',
        'fr-FR': 'Marcheur de Toutes les Portes',
      },
      description: {
        'pt-BR': 'Você tocou todas as 7 tradições. Sua curiosidade não tem limite.',
        'en-US': 'You touched all 7 traditions. Your curiosity has no limit.',
        'es-ES': 'Tocaste las 7 tradiciones. Tu curiosidad no tiene límite.',
        'fr-FR': 'Tu as touché les 7 traditions. Ta curiosité n\u2019a pas de limite.',
      },
      category: 'exploration',
      criteria: atLeastBy((s) => s.uniqueTraditionsUsed, 7),
      badge: { iconName: 'crown', tier: 'mythic', color: '#9400D3', glowEffect: true },
      order: 540,
    },

    // ---------- ONBOARDING-BASED ----------
    {
      id: asAchievementId('primeiro-passo'),
      title: {
        'pt-BR': 'Primeiro Passo',
        'en-US': 'First Step',
        'es-ES': 'Primer Paso',
        'fr-FR': 'Premier Pas',
      },
      description: {
        'pt-BR': 'Bem-vindo(a) ao Caminho. Você completou a acolhida.',
        'en-US': 'Welcome to the Path. You completed onboarding.',
        'es-ES': 'Bienvenido(a) al Camino. Completaste la bienvenida.',
        'fr-FR': 'Bienvenue sur le Chemin. Tu as terminé l\u2019accueil.',
      },
      category: 'exploration',
      criteria: (s: UserState) => s.hasCompletedOnboarding === true,
      badge: { iconName: 'sparkles', tier: 'bronze', color: '#D2691E', glowEffect: false },
      order: 600,
    },
  ]);

// ============================================================================
// EVALUATION FUNCTIONS
// ============================================================================

/**
 * Evaluate ALL achievement criteria against the provided userState.
 * Returns the IDs of newly-earned achievements (those whose criteria match).
 *
 * This is the "what did the user just unlock" entry point — feed it
 * the latest user state and it returns the diff.
 */
export function evaluateAchievements(state: UserState): AchievementId[] {
  if (!state || typeof state !== 'object') return [];
  const unlocked: AchievementId[] = [];
  for (const def of ACHIEVEMENTS) {
    try {
      if (def.criteria(state)) {
        unlocked.push(def.id);
      }
    } catch {
      // Criteria must be pure — silently skip failures (defensive)
    }
  }
  return unlocked;
}

/**
 * Evaluate a single achievement by ID. Returns true if the criteria match.
 * Returns false if the ID is unknown (no throw — anti-dark-pattern design).
 */
export function evaluateAchievement(
  state: UserState,
  achievementId: AchievementId,
): boolean {
  if (!state) return false;
  const def = ACHIEVEMENTS.find((d) => d.id === achievementId);
  if (!def) return false;
  try {
    return def.criteria(state);
  } catch {
    return false;
  }
}

/**
 * Lookup helper — returns the definition for a given id, or null.
 */
export function getAchievement(id: AchievementId): AchievementDefinition | null {
  return ACHIEVEMENTS.find((d) => d.id === id) ?? null;
}

/**
 * Lookup by category — stable order by `order` field.
 */
export function listByCategory(category: AchievementCategory): AchievementDefinition[] {
  return ACHIEVEMENTS
    .filter((d) => d.category === category)
    .slice()
    .sort((a, b) => a.order - b.order);
}

/**
 * Lookup by tradition — returns all achievements tagged with the sacred ref.
 */
export function listByTradition(
  tradition: SacredTradition,
): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((d) => d.sacredRef?.tradition === tradition);
}

// ============================================================================
// LIST-UNLOCKED — In-memory registry (caller persists via Prisma)
// ============================================================================
// Cycle 60+ lesson: keep storage pluggable. We export a pluggable Store
// interface so tests can swap an in-memory map and prod can swap Prisma.
//
// For the deliverable, the default is `inMemoryUnlockedStore` — caller can
// override via `setUnlockedStore()` for production persistence wiring.

export interface UnlockedStore {
  listForUser(userId: UserId): Promise<readonly UnlockedAchievement[]>;
  record(
    userId: UserId,
    achievementId: AchievementId,
    earnedAt: Timestamp,
  ): Promise<void>;
}

const IN_MEMORY: Map<UserId, Map<AchievementId, Timestamp>> = new Map();

export const inMemoryUnlockedStore: UnlockedStore = {
  async listForUser(userId) {
    const inner = IN_MEMORY.get(userId);
    if (!inner) return [];
    const defs = ACHIEVEMENTS.filter((d) => inner.has(d.id));
    return defs
      .map((d) => {
        const earnedAt = inner.get(d.id)!;
        return { achievement: d, earnedAt } satisfies UnlockedAchievement;
      })
      .sort((a, b) => (a.earnedAt < b.earnedAt ? -1 : a.earnedAt > b.earnedAt ? 1 : 0));
  },
  async record(userId, achievementId, earnedAt) {
    let inner = IN_MEMORY.get(userId);
    if (!inner) {
      inner = new Map();
      IN_MEMORY.set(userId, inner);
    }
    if (!inner.has(achievementId)) {
      inner.set(achievementId, earnedAt);
    }
  },
};

let _store: UnlockedStore = inMemoryUnlockedStore;

/** Swap the persistence layer. Production wires Prisma. */
export function setUnlockedStore(store: UnlockedStore): void {
  _store = store;
}

/** Reset to in-memory (test helper). */
export function resetUnlockedStore(): void {
  _store = inMemoryUnlockedStore;
  IN_MEMORY.clear();
}

/**
 * List all unlocked achievements for a user, sorted by earnedAt ascending.
 * The caller has the option to pass an optional store override.
 */
export async function listUnlocked(
  userId: UserId,
): Promise<readonly UnlockedAchievement[]> {
  const store = _store;
  const all = await store.listForUser(userId);
  // Defensive sort by earnedAt ASC (oldest first)
  return [...all].sort((a, b) => {
    if (a.earnedAt < b.earnedAt) return -1;
    if (a.earnedAt > b.earnedAt) return 1;
    return 0;
  });
}

/**
 * Atomically record any newly-earned achievement. Idempotent — already-recorded
 * achievements are skipped (no-op). Returns the IDs that were actually recorded.
 */
export async function recordUnlocked(
  state: UserState,
  nowISO: string,
): Promise<AchievementId[]> {
  const earnedIds = evaluateAchievements(state);
  if (earnedIds.length === 0) return [];
  const userId = state.userId;
  const timestamp = asTimestamp(nowISO);
  const recorded: AchievementId[] = [];
  for (const id of earnedIds) {
    const already = await _store.listForUser(userId);
    if (already.some((u) => u.achievement.id === id)) continue;
    await _store.record(userId, id, timestamp);
    recorded.push(id);
  }
  return recorded;
}

// ============================================================================
// AUDIT — Catalog invariants + sacred coverage
// ============================================================================

/**
 * Audit the catalog for invariants. Returns a human-readable summary used
 * by progress.ts audit chain and by smoke tests.
 *
 * Checks:
 *   - Total count (must be ≥ 30)
 *   - Unique IDs
 *   - All locales present (pt-BR + en-US mandatory)
 *   - Sacred coverage ratio (must be ≥ 50%)
 *   - All categories represented
 */
export interface CatalogAudit {
  readonly totalCount: number;
  readonly uniqueIdCount: number;
  readonly categories: readonly AchievementCategory[];
  readonly sacredCoveragePercent: number;
  readonly localeCompleteness: Record<Locale, number>;
  readonly passes: boolean;
}

export function auditCatalog(): CatalogAudit {
  const total = ACHIEVEMENTS.length;
  const ids = new Set<string>();
  for (const d of ACHIEVEMENTS) ids.add(d.id as string);
  const categories = Array.from(new Set(ACHIEVEMENTS.map((d) => d.category)));
  const sacredCount = ACHIEVEMENTS.filter((d) => d.sacredRef).length;
  const coverage = total === 0 ? 0 : Math.round((sacredCount / total) * 100);

  const localeStats: Record<string, number> = {
    'pt-BR': 0,
    'en-US': 0,
    'es-ES': 0,
    'fr-FR': 0,
  };
  for (const d of ACHIEVEMENTS) {
    for (const loc of Object.keys(localeStats) as Locale[]) {
      if (d.title[loc] && d.description[loc]) {
        localeStats[loc] += 1;
      }
    }
  }

  const passes =
    total >= 30 &&
    ids.size === total &&
    localeStats['pt-BR'] === total &&
    localeStats['en-US'] === total &&
    coverage >= 50 &&
    categories.includes('readings') &&
    categories.includes('streaks') &&
    categories.includes('reflection') &&
    categories.includes('community') &&
    categories.includes('exploration');

  return {
    totalCount: total,
    uniqueIdCount: ids.size,
    categories,
    sacredCoveragePercent: coverage,
    localeCompleteness: localeStats as Record<Locale, number>,
    passes,
  };
}

// Re-export the localization helper for downstream use (badges.ts uses it).
export { localize };
