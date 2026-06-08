// src/lib/tarot/cards.ts
// Tarot card data - 78 cards: 22 Major Arcana + 56 Minor Arcana

export interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: string;
  number?: number;
  element?: string;
  astro?: string;
  upright: string[];
  reversed: string[];
}

export interface TarotDeck {
  cards: TarotCard[];
}

// Major Arcana
export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0,
    name: 'The Fool',
    arcana: 'major',
    element: 'Air',
    astro: 'Uranus',
    upright: ['New beginnings', 'Innocence', 'Spontaneity', 'Free will'],
    reversed: ['Recklessness', 'Fearlessness', 'Risk-taking'],
  },
  {
    id: 1,
    name: 'The Magician',
    arcana: 'major',
    element: 'Air',
    astro: 'Mercury',
    upright: ['Manifestation', 'Resourcefulness', 'Power', 'Inspired action'],
    reversed: ['Manipulation', 'Poor planning', 'Unused talents', 'Scattered energy'],
  },
  {
    id: 2,
    name: 'The High Priestess',
    arcana: 'major',
    element: 'Water',
    astro: 'Moon',
    upright: ['Intuition', 'Sacred knowledge', 'Divine feminine', 'Mystery'],
    reversed: ['Hidden agendas', 'Lack of trust', 'Silence', 'Deception'],
  },
  {
    id: 3,
    name: 'The Empress',
    arcana: 'major',
    element: 'Earth',
    astro: 'Venus',
    upright: ['Femininity', 'Beauty', 'Nature', 'Abundance', 'Creativity'],
    reversed: ['Creative block', 'Dependence on others', 'Smothering', 'Stagnation'],
  },
  {
    id: 4,
    name: 'The Emperor',
    arcana: 'major',
    element: 'Fire',
    astro: 'Aries',
    upright: ['Authority', 'Structure', 'Control', 'Fatherhood', 'Stability'],
    reversed: ['Domination', 'Excessive control', 'Lack of discipline', 'Tyranny'],
  },
  {
    id: 5,
    name: 'The Hierophant',
    arcana: 'major',
    element: 'Earth',
    astro: 'Taurus',
    upright: ['Spiritual wisdom', 'Tradition', 'Conformity', 'Education', 'Faith'],
    reversed: ['Personal beliefs', 'Freedom', 'Challenging the status quo', 'Subversive'],
  },
  {
    id: 6,
    name: 'The Lovers',
    arcana: 'major',
    element: 'Air',
    astro: 'Gemini',
    upright: ['Love', 'Harmony', 'Relationships', 'Choices', 'Union'],
    reversed: ['Self-trust', 'Doubt', 'Self-love', 'Imbalance', 'One-sided'],
  },
  {
    id: 7,
    name: 'The Chariot',
    arcana: 'major',
    element: 'Water',
    astro: 'Cancer',
    upright: ['Control', 'Willpower', 'Success', 'Action', 'Confidence'],
    reversed: ['Self-discipline', 'Opposition', 'Lack of direction', 'Aggression'],
  },
  {
    id: 8,
    name: 'Strength',
    arcana: 'major',
    element: 'Earth',
    astro: 'Leo',
    upright: ['Inner strength', 'Bravery', 'Compassion', 'Focus', 'Fortitude'],
    reversed: ['Inner doubt', 'Weakness', 'Insecurity', 'Raw emotion'],
  },
  {
    id: 9,
    name: 'The Hermit',
    arcana: 'major',
    element: 'Earth',
    astro: 'Virgo',
    upright: ['Soul-searching', 'Introversion', 'Seeking truth', 'Inner guidance'],
    reversed: ['Isolation', 'Loneliness', 'Withdrawal', 'Lost purpose'],
  },
  {
    id: 10,
    name: 'Wheel of Fortune',
    arcana: 'major',
    element: 'Fire',
    astro: 'Jupiter',
    upright: ['Good luck', 'Karma', 'Life cycles', 'Destiny', 'Turning point'],
    reversed: ['Bad luck', 'Resistance to change', 'Breaking cycles', 'Setbacks'],
  },
  {
    id: 11,
    name: 'Justice',
    arcana: 'major',
    element: 'Air',
    astro: 'Libra',
    upright: ['Justice', 'Fairness', 'Truth', 'Cause and effect', 'Law'],
    reversed: ['Unfairness', 'Lack of accountability', 'Dishonesty', 'Truth withheld'],
  },
  {
    id: 12,
    name: 'The Hanged Man',
    arcana: 'major',
    element: 'Water',
    astro: 'Neptune',
    upright: ['Pause', 'Surrender', 'Letting go', 'New perspective', 'Breakthrough'],
    reversed: ['Delays', 'Resistance', 'Stalling', 'Indecision', 'Needless sacrifice'],
  },
  {
    id: 13,
    name: 'Death',
    arcana: 'major',
    element: 'Water',
    astro: 'Scorpio',
    upright: ['Endings', 'Change', 'Transformation', 'Transition'],
    reversed: ['Resistance to change', 'Personal transformation', 'Inner purging'],
  },
  {
    id: 14,
    name: 'Temperance',
    arcana: 'major',
    element: 'Fire',
    astro: 'Sagittarius',
    upright: ['Balance', 'Moderation', 'Patience', 'Purpose', 'Meaning'],
    reversed: ['Imbalance', 'Excess', 'Self-healing', 'Realignment', 'Finding peace'],
  },
  {
    id: 15,
    name: 'The Devil',
    arcana: 'major',
    element: 'Earth',
    astro: 'Capricorn',
    upright: ['Shadow self', 'Attachment', 'Addiction', 'Materialism', 'Exploitation'],
    reversed: ['Releasing limiting beliefs', 'Exploring dark emotions', 'Reclaiming power'],
  },
  {
    id: 16,
    name: 'The Tower',
    arcana: 'major',
    element: 'Fire',
    astro: 'Mars',
    upright: ['Sudden change', 'Chaos', 'Revelation', 'Awakening'],
    reversed: ['Personal transformation', 'Inner turmoil', 'Breaking free'],
  },
  {
    id: 17,
    name: 'The Star',
    arcana: 'major',
    element: 'Air',
    astro: 'Aquarius',
    upright: ['Hope', 'Faith', 'Purpose', 'Renewal', 'Spirituality'],
    reversed: ['Lack of faith', 'Despair', 'Self-trust', 'Connection'],
  },
  {
    id: 18,
    name: 'The Moon',
    arcana: 'major',
    element: 'Water',
    astro: 'Pisces',
    upright: ['Illusion', 'Fear', 'Anxiety', 'Subconscious', 'Intuition'],
    reversed: ['Release of fear', 'Rooted reality', 'Facing the shadow'],
  },
  {
    id: 19,
    name: 'The Sun',
    arcana: 'major',
    element: 'Fire',
    astro: 'Sun',
    upright: ['Positivity', 'Truth', 'Success', 'Vitality', 'Inner child'],
    reversed: ['Inner child', 'Feeling down', 'Overly optimistic', 'Lack of clarity'],
  },
  {
    id: 20,
    name: 'Judgement',
    arcana: 'major',
    element: 'Fire',
    astro: 'Pluto',
    upright: ['Judgement', 'Rebirth', 'Inner calling', 'Absolution', 'Redemption'],
    reversed: ['Self-doubt', 'Inner critic', 'Ignoring the call', 'Harsh self-judgment'],
  },
  {
    id: 21,
    name: 'The World',
    arcana: 'major',
    element: 'Earth',
    astro: 'Saturn',
    upright: ['Completion', 'Integration', 'Accomplishment', 'Travel', 'Celebration'],
    reversed: ['Seeking personal closure', 'Incomplete goals', 'Shortcuts', 'Disappointment'],
  },
];

// Minor Arcana - Wands (Fire)
const WANDS: TarotCard[] = [
  { id: 22, name: 'Ace of Wands', arcana: 'minor', suit: 'Wands', number: 1, element: 'Fire', upright: ['New venture', 'Inspiration', 'Creation', 'Renewal'], reversed: ['Delays', 'Lack of motivation', 'Creative block'] },
  { id: 23, name: 'Two of Wands', arcana: 'minor', suit: 'Wands', number: 2, element: 'Fire', upright: ['Future planning', 'Personal power', 'Discovery', 'Progress'], reversed: ['Playing it safe', 'Fear of unknown', 'Lack of planning'] },
  { id: 24, name: 'Three of Wands', arcana: 'minor', suit: 'Wands', number: 3, element: 'Fire', upright: ['Progress', 'Forward motion', 'Revealing plans', 'Foresight'], reversed: ['Playing it safe', 'Obstacles', 'Delays', 'Frustration'] },
  { id: 25, name: 'Four of Wands', arcana: 'minor', suit: 'Wands', number: 4, element: 'Fire', upright: ['Celebration', 'Harmony', 'Marriage', 'Home', 'Community'], reversed: ['Personal celebration', 'Inner harmony', 'Conflict'] },
  { id: 26, name: 'Five of Wands', arcana: 'minor', suit: 'Wands', number: 5, element: 'Fire', upright: ['Conflict', 'Disagreement', 'Competition', 'Winning'], reversed: ['Inner conflict', 'Conflict avoidance', 'Release of tension'] },
  { id: 27, name: 'Six of Wands', arcana: 'minor', suit: 'Wands', number: 6, element: 'Fire', upright: ['Success', 'Public recognition', 'Progress', 'Self-confidence'], reversed: ['Inner success', 'Fall from grace', 'Ego', 'Arrogance'] },
  { id: 28, name: 'Seven of Wands', arcana: 'minor', suit: 'Wands', number: 7, element: 'Fire', upright: ['Challenge', 'Competition', 'Protection', 'Perseverance'], reversed: ['Exhaustion', 'Giving up', 'Paranoia', 'Victim mentality'] },
  { id: 29, name: 'Eight of Wands', arcana: 'minor', suit: 'Wands', number: 8, element: 'Fire', upright: ['Action', 'Movement', 'Fast paced change', 'Swift energy'], reversed: ['Delays', 'Frustration', 'Waiting', 'Hesitation'] },
  { id: 30, name: 'Nine of Wands', arcana: 'minor', suit: 'Wands', number: 9, element: 'Fire', upright: ['Resilience', 'Courage', 'Persistence', 'Test of faith'], reversed: ['Exhaustion', 'Paranoia', 'Victim mentality', 'Breaking point'] },
  { id: 31, name: 'Ten of Wands', arcana: 'minor', suit: 'Wands', number: 10, element: 'Fire', upright: ['Burden', 'Responsibility', 'Hard work', 'Stress'], reversed: ['Doing it all', 'Delegation', 'Release of burden', 'Burnout'] },
  { id: 32, name: 'Page of Wands', arcana: 'minor', suit: 'Wands', number: 11, element: 'Fire', upright: ['Inspiration', 'Ideas', 'Discovery', 'Free spirit'], reversed: ['Newly found passion', 'Self-limiting beliefs', 'Setbacks'] },
  { id: 33, name: 'Knight of Wands', arcana: 'minor', suit: 'Wands', number: 12, element: 'Fire', upright: ['Energy', 'Passion', 'Adventure', 'Impulsiveness'], reversed: ['Passion project', 'Impulsive', 'Passionate', 'Scattered energy'] },
  { id: 34, name: 'Queen of Wands', arcana: 'minor', suit: 'Wands', number: 13, element: 'Fire', upright: ['Courage', 'Confidence', 'Independence', 'Warmth'], reversed: ['Self-assured', 'Self-preserving', 'Jealousy', 'Insecurity'] },
  { id: 35, name: 'King of Wands', arcana: 'minor', suit: 'Wands', number: 14, element: 'Fire', upright: ['Natural leader', 'Vision', 'Success', 'Boldness'], reversed: ['Impulsiveness', 'Tyranny', 'Fragile ego', 'Rash decisions'] },
];

// Minor Arcana - Cups (Water)
const CUPS: TarotCard[] = [
  { id: 36, name: 'Ace of Cups', arcana: 'minor', suit: 'Cups', number: 1, element: 'Water', upright: ['New love', 'Compassion', 'Creativity', 'Intuition'], reversed: ['Emotional loss', 'Blocked emotions', 'Repressed feelings'] },
  { id: 37, name: 'Two of Cups', arcana: 'minor', suit: 'Cups', number: 2, element: 'Water', upright: ['Partnership', 'Unity', 'Attraction', 'Connection'], reversed: ['Imbalance', 'Broken communication', 'Tension'] },
  { id: 38, name: 'Three of Cups', arcana: 'minor', suit: 'Cups', number: 3, element: 'Water', upright: ['Celebration', 'Friendship', 'Community', 'Creativity'], reversed: ['Independence', 'Social anxiety', 'Third party'] },
  { id: 39, name: 'Four of Cups', arcana: 'minor', suit: 'Cups', number: 4, element: 'Water', upright: ['Meditation', 'Contemplation', 'Apathy', 'Reevaluation'], reversed: ['Sudden awareness', 'Choosing happiness', 'Acceptance'] },
  { id: 40, name: 'Five of Cups', arcana: 'minor', suit: 'Cups', number: 5, element: 'Water', upright: ['Regret', 'Failure', 'Disappointment', 'Grief'], reversed: ['Personal setbacks', 'Moving on', 'Self-forgiveness'] },
  { id: 41, name: 'Six of Cups', arcana: 'minor', suit: 'Cups', number: 6, element: 'Water', upright: ['Revisiting the past', 'Childhood memories', 'Innocence', 'Nostalgia'], reversed: ['Living in the past', 'Naivety', 'Stagnation'] },
  { id: 42, name: 'Seven of Cups', arcana: 'minor', suit: 'Cups', number: 7, element: 'Water', upright: ['Opportunities', 'Choices', 'Wishful thinking', 'Fantasy'], reversed: ['Alignment', 'Personal values', 'Reevaluation'] },
  { id: 43, name: 'Eight of Cups', arcana: 'minor', suit: 'Cups', number: 8, element: 'Water', upright: ['Disappointment', 'Abandonment', 'Withdrawal', 'Disillusionment'], reversed: ['Trying one more time', 'Forgiveness', 'Setting boundaries'] },
  { id: 44, name: 'Nine of Cups', arcana: 'minor', suit: 'Cups', number: 9, element: 'Water', upright: ['Contentment', 'Satisfaction', 'Gratitude', 'Wish fulfilled'], reversed: ['Inner happiness', 'Materialism', 'Satisfaction', 'Greed'] },
  { id: 45, name: 'Ten of Cups', arcana: 'minor', suit: 'Cups', number: 10, element: 'Water', upright: ['Divine love', 'Blissful relationships', 'Harmony', 'Alignment'], reversed: ['Disalignment', 'Unfulfilled dreams', 'Mediocrity'] },
  { id: 46, name: 'Page of Cups', arcana: 'minor', suit: 'Cups', number: 11, element: 'Water', upright: ['Creative opportunity', 'Intuition', 'Curiosity', 'Exploration'], reversed: ['Inner child healing', 'Emotional immaturity', 'Creative blocks'] },
  { id: 47, name: 'Knight of Cups', arcana: 'minor', suit: 'Cups', number: 12, element: 'Water', upright: ['Creativity', 'Romance', 'Charm', 'Imagination'], reversed: ['Overactive imagination', 'Moodiness', 'Unrealistic', 'Boredom'] },
  { id: 48, name: 'Queen of Cups', arcana: 'minor', suit: 'Cups', number: 13, element: 'Water', upright: ['Compassion', 'Intuition', 'Emotional security', 'Nurturing'], reversed: ['Inner feelings', 'Self-care', 'Clarity', 'Self-love'] },
  { id: 49, name: 'King of Cups', arcana: 'minor', suit: 'Cups', number: 14, element: 'Water', upright: ['Emotionally balanced', 'Diplomacy', 'Compassion', 'Receptive'], reversed: ['Self-compassion', 'Inner feelings', 'Moodiness', 'Coldness'] },
];

// Minor Arcana - Swords (Air)
const SWORDS: TarotCard[] = [
  { id: 50, name: 'Ace of Swords', arcana: 'minor', suit: 'Swords', number: 1, element: 'Air', upright: ['Breakthroughs', 'Clarity', 'Mental clarity', 'Truth'], reversed: ['Inner clarity', 'Re-thinking', 'Clouded judgement'] },
  { id: 51, name: 'Two of Swords', arcana: 'minor', suit: 'Swords', number: 2, element: 'Air', upright: ['Difficult choices', 'Indecision', 'Stalemate', 'Avoidance'], reversed: ['Indecision', 'Confusion', 'Information overload'] },
  { id: 52, name: 'Three of Swords', arcana: 'minor', suit: 'Swords', number: 3, element: 'Air', upright: ['Heartbreak', 'Emotional pain', 'Grief', 'Sorrow'], reversed: ['Negative self-talk', 'Releasing pain', 'Optimism'] },
  { id: 53, name: 'Four of Swords', arcana: 'minor', suit: 'Swords', number: 4, element: 'Air', upright: ['Rest', 'Relaxation', 'Meditation', 'Contemplation'], reversed: ['Restlessness', 'Burnout', 'Slowing down', 'Too much rest'] },
  { id: 54, name: 'Five of Swords', arcana: 'minor', suit: 'Swords', number: 5, element: 'Air', upright: ['Conflict', 'Defeat', 'Winning at all costs', 'Betrayal'], reversed: ['Reconciliation', 'Making amends', 'Lingering resentment'] },
  { id: 55, name: 'Six of Swords', arcana: 'minor', suit: 'Swords', number: 6, element: 'Air', upright: ['Transition', 'Leaving behind', 'Moving on', 'Departure'], reversed: ['Stuck', 'Resisting change', 'Unfinished business'] },
  { id: 56, name: 'Seven of Swords', arcana: 'minor', suit: 'Swords', number: 7, element: 'Air', upright: ['Betrayal', 'Deception', 'Getting away with something', 'Secrets'], reversed: ['Imposter syndrome', 'Self-deception', 'Truth revealed'] },
  { id: 57, name: 'Eight of Swords', arcana: 'minor', suit: 'Swords', number: 8, element: 'Air', upright: ['Imprisonment', 'Entrapment', 'Self-victimization', 'Helplessness'], reversed: ['New perspective', 'Released from prison', 'Freeing yourself'] },
  { id: 58, name: 'Nine of Swords', arcana: 'minor', suit: 'Swords', number: 9, element: 'Air', upright: ['Anxiety', 'Worry', 'Fear', 'Nightmares'], reversed: ['Inner turmoil', 'Trauma', 'Deep-seated issues', 'Releasing pain'] },
  { id: 59, name: 'Ten of Swords', arcana: 'minor', suit: 'Swords', number: 10, element: 'Air', upright: ['Painful ending', 'Crisis', 'Betrayal', 'Loss'], reversed: ['Recovery', 'Regeneration', 'Resistance to endings'] },
  { id: 60, name: 'Page of Swords', arcana: 'minor', suit: 'Swords', number: 11, element: 'Air', upright: ['New ideas', 'Curiosity', 'Thirst for knowledge', 'Communication'], reversed: ['Self-expression', 'All talk no action', 'Deception'] },
  { id: 61, name: 'Knight of Swords', arcana: 'minor', suit: 'Swords', number: 12, element: 'Air', upright: ['Ambitious action', 'Drive', 'Fast thinking', 'Power'], reversed: ['Restlessness', 'Impatience', 'Unfocused', 'Forceful'] },
  { id: 62, name: 'Queen of Swords', arcana: 'minor', suit: 'Swords', number: 13, element: 'Air', upright: ['Independent', 'Truthful', 'Direct', 'Boundaries'], reversed: ['Overly emotional', 'Cold-hearted', 'Cruel', 'Bitterness'] },
  { id: 63, name: 'King of Swords', arcana: 'minor', suit: 'Swords', number: 14, element: 'Air', upright: ['Intellectual power', 'Truth', 'Authority', 'Clear thinking'], reversed: ['Inner truth', 'Inner voice', 'Manipulation', 'Tyranny'] },
];

// Minor Arcana - Pentacles (Earth)
const PENTACLES: TarotCard[] = [
  { id: 64, name: 'Ace of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 1, element: 'Earth', upright: ['New financial opportunity', 'Prosperity', 'Manifestation'], reversed: ['Lost opportunity', 'Missed chance', 'Poor financial planning'] },
  { id: 65, name: 'Two of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 2, element: 'Earth', upright: ['Multiple priorities', 'Time management', 'Stress', 'Adaptability'], reversed: ['Over-committed', 'Overwhelm', 'Re-prioritization'] },
  { id: 66, name: 'Three of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 3, element: 'Earth', upright: ['Teamwork', 'Collaboration', 'Learning', 'Implementation'], reversed: ['Disharmony', 'Miscommunication', 'Working alone'] },
  { id: 67, name: 'Four of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 4, element: 'Earth', upright: ['Saving money', 'Security', 'Control', 'Stability'], reversed: ['Over-spending', 'Greed', 'Materialism', 'Letting go'] },
  { id: 68, name: 'Five of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 5, element: 'Earth', upright: ['Financial loss', 'Poverty', 'Lack', 'Isolation'], reversed: ['Recovery from loss', 'Spiritual poverty', 'Finding help'] },
  { id: 69, name: 'Six of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 6, element: 'Earth', upright: ['Giving and receiving', 'Sharing wealth', 'Generosity', 'Charity'], reversed: ['Debt', 'Strings attached', 'Inequality', 'Self-care'] },
  { id: 70, name: 'Seven of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 7, element: 'Earth', upright: ['Long-term view', 'Sustainable results', 'Perseverance', 'Investment'], reversed: ['Frustration', 'Impatience', 'Lack of long-term vision'] },
  { id: 71, name: 'Eight of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 8, element: 'Earth', upright: ['Apprenticeship', ' repetitive tasks', ' mastery', 'dedication'], reversed: ['Self-development', 'Over-skill', 'Machinery', 'Perfectionism'] },
  { id: 72, name: 'Nine of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 9, element: 'Earth', upright: ['Abundance', 'Luxury', 'Self-sufficiency', 'Financial independence'], reversed: ['Self-worth', 'Over-investment in work', 'Superficiality'] },
  { id: 73, name: 'Ten of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 10, element: 'Earth', upright: ['Wealth', 'Inheritance', 'Family', 'Long-term success'], reversed: ['Financial failure', 'Loneliness', 'Loss of family'] },
  { id: 74, name: 'Page of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 11, element: 'Earth', upright: ['Manifestation', 'Financial opportunity', 'Skill development'], reversed: ['Lack of progress', 'Procrastination', 'Missed chances'] },
  { id: 75, name: 'Knight of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 12, element: 'Earth', upright: ['Hard work', 'Productivity', 'Routine', 'Conservative approach'], reversed: ['Self-discipline', 'Boredom', 'Feeling stuck', 'Obsessive work ethic'] },
  { id: 76, name: 'Queen of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 13, element: 'Earth', upright: ['Nurturing', 'Practicality', 'Security', 'Abundance'], reversed: ['Self-care', 'Financial independence', 'Work-home conflict'] },
  { id: 77, name: 'King of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 14, element: 'Earth', upright: ['Wealth', 'Business', 'Leadership', 'Security'], reversed: ['Financially inept', 'Stubborn', 'Greedy', 'Materialistic'] },
];

// All cards combined
const ALL_CARDS: TarotCard[] = [
  ...MAJOR_ARCANA,
  ...WANDS,
  ...CUPS,
  ...SWORDS,
  ...PENTACLES,
];

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}


export function drawCards(n: number): TarotCard[] {
  return shuffle(ALL_CARDS).slice(0, n);
}

export const TAROT_DECK: TarotDeck = { cards: ALL_CARDS };

// Export MINOR_ARCANA as a combined array for compatibility
export const MINOR_ARCANA: TarotCard[] = [...WANDS, ...CUPS, ...SWORDS, ...PENTACLES];