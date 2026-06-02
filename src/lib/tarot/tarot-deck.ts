// fallow-ignore-file unused-file
// src/lib/tarot/tarot-deck.ts
// Tarot deck - 78 cards

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

// Major Arcana (22 cards)
const MAJOR_ARCANA: TarotCard[] = [
  { id: 0, name: 'The Fool', arcana: 'major', element: 'Air', astro: 'Uranus', upright: ['New beginnings', 'Innocence', 'Spontaneity', 'Free will'], reversed: ['Recklessness', 'Fearlessness', 'Risk-taking'] },
  { id: 1, name: 'The Magician', arcana: 'major', element: 'Air', astro: 'Mercury', upright: ['Manifestation', 'Resourcefulness', 'Power', 'Inspired action'], reversed: ['Manipulation', 'Poor planning', 'Unused talents', 'Scattered energy'] },
  { id: 2, name: 'The High Priestess', arcana: 'major', element: 'Water', astro: 'Moon', upright: ['Intuition', 'Sacred knowledge', 'Divine feminine', 'Mystery'], reversed: ['Hidden agendas', 'Lack of trust', 'Silence', 'Deception'] },
  { id: 3, name: 'The Empress', arcana: 'major', element: 'Earth', astro: 'Venus', upright: ['Femininity', 'Beauty', 'Nature', 'Abundance', 'Creativity'], reversed: ['Creative block', 'Dependence on others', 'Smothering', 'Stagnation'] },
  { id: 4, name: 'The Emperor', arcana: 'major', element: 'Fire', astro: 'Aries', upright: ['Authority', 'Structure', 'Control', 'Fatherhood', 'Stability'], reversed: ['Domination', 'Excessive control', 'Lack of discipline', 'Tyranny'] },
  { id: 5, name: 'The Hierophant', arcana: 'major', element: 'Earth', astro: 'Taurus', upright: ['Spiritual wisdom', 'Tradition', 'Conformity', 'Education', 'Faith'], reversed: ['Personal beliefs', 'Freedom', 'Challenging the status quo', 'Subversive'] },
  { id: 6, name: 'The Lovers', arcana: 'major', element: 'Air', astro: 'Gemini', upright: ['Love', 'Harmony', 'Relationships', 'Choices', 'Union'], reversed: ['Self-trust', 'Doubt', 'Self-love', 'Imbalance', 'One-sided'] },
  { id: 7, name: 'The Chariot', arcana: 'major', element: 'Water', astro: 'Cancer', upright: ['Control', 'Willpower', 'Success', 'Action', 'Confidence'], reversed: ['Self-discipline', 'Opposition', 'Lack of direction', 'Aggression'] },
  { id: 8, name: 'Strength', arcana: 'major', element: 'Earth', astro: 'Leo', upright: ['Inner strength', 'Bravery', 'Compassion', 'Focus', 'Fortitude'], reversed: ['Inner doubt', 'Weakness', 'Insecurity', 'Raw emotion'] },
  { id: 9, name: 'The Hermit', arcana: 'major', element: 'Earth', astro: 'Virgo', upright: ['Soul-searching', 'Introversion', 'Seeking truth', 'Inner guidance'], reversed: ['Isolation', 'Loneliness', 'Withdrawal', 'Lost purpose'] },
  { id: 10, name: 'Wheel of Fortune', arcana: 'major', element: 'Fire', astro: 'Jupiter', upright: ['Good luck', 'Karma', 'Life cycles', 'Destiny', 'Turning point'], reversed: ['Bad luck', 'Resistance to change', 'Breaking cycles', 'Setbacks'] },
  { id: 11, name: 'Justice', arcana: 'major', element: 'Air', astro: 'Libra', upright: ['Justice', 'Fairness', 'Truth', 'Cause and effect', 'Law'], reversed: ['Unfairness', 'Lack of accountability', 'Dishonesty', 'Truth withheld'] },
  { id: 12, name: 'The Hanged Man', arcana: 'major', element: 'Water', astro: 'Neptune', upright: ['Pause', 'Surrender', 'Letting go', 'New perspective', 'Breakthrough'], reversed: ['Delays', 'Resistance', 'Stalling', 'Indecision', 'Needless sacrifice'] },
  { id: 13, name: 'Death', arcana: 'major', element: 'Water', astro: 'Scorpio', upright: ['Endings', 'Change', 'Transformation', 'Transition'], reversed: ['Resistance to change', 'Personal transformation', 'Inner purging'] },
  { id: 14, name: 'Temperance', arcana: 'major', element: 'Fire', astro: 'Sagittarius', upright: ['Balance', 'Moderation', 'Patience', 'Purpose', 'Meaning'], reversed: ['Imbalance', 'Excess', 'Self-healing', 'Realignment', 'Finding peace'] },
  { id: 15, name: 'The Devil', arcana: 'major', element: 'Earth', astro: 'Capricorn', upright: ['Shadow self', 'Attachment', 'Addiction', 'Materialism', 'Exploitation'], reversed: ['Releasing limiting beliefs', 'Exploring dark emotions', 'Reclaiming power'] },
  { id: 16, name: 'The Tower', arcana: 'major', element: 'Fire', astro: 'Mars', upright: ['Sudden change', 'Chaos', 'Revelation', 'Awakening'], reversed: ['Personal transformation', 'Inner turmoil', 'Breaking free'] },
  { id: 17, name: 'The Star', arcana: 'major', element: 'Air', astro: 'Aquarius', upright: ['Hope', 'Faith', 'Purpose', 'Renewal', 'Spirituality'], reversed: ['Lack of faith', 'Despair', 'Self-trust', 'Connection'] },
  { id: 18, name: 'The Moon', arcana: 'major', element: 'Water', astro: 'Pisces', upright: ['Illusion', 'Fear', 'Anxiety', 'Subconscious', 'Intuition'], reversed: ['Release of fear', 'Rooted reality', 'Facing the shadow'] },
  { id: 19, name: 'The Sun', arcana: 'major', element: 'Fire', astro: 'Sun', upright: ['Positivity', 'Truth', 'Success', 'Vitality', 'Inner child'], reversed: ['Inner child', 'Feeling down', 'Overly optimistic', 'Lack of clarity'] },
  { id: 20, name: 'Judgement', arcana: 'major', element: 'Fire', astro: 'Pluto', upright: ['Judgement', 'Rebirth', 'Inner calling', 'Absolution', 'Redemption'], reversed: ['Self-doubt', 'Inner critic', 'Ignoring the call', 'Harsh self-judgment'] },
  { id: 21, name: 'The World', arcana: 'major', element: 'Earth', astro: 'Saturn', upright: ['Completion', 'Integration', 'Accomplishment', 'Travel', 'Celebration'], reversed: ['Seeking personal closure', 'Incomplete goals', 'Shortcuts', 'Disappointment'] },
];

// Minor Arcana - Wands (Fire) - 14 cards
const WANDS: TarotCard[] = [
  { id: 22, name: 'Ace of Wands', arcana: 'minor', suit: 'Wands', number: 1, element: 'Fire', upright: ['Inspiration', 'New opportunities', 'Growth', 'Potential'], reversed: ['Emerging talents', 'Unopened礼物', 'Creative blocks'] },
  { id: 23, name: 'Two of Wands', arcana: 'minor', suit: 'Wands', number: 2, element: 'Fire', upright: ['Future planning', 'Personal power', 'Legacy', 'Discovery'], reversed: ['Personal goals', 'Inner alignment', 'Lack of strategic thinking'] },
  { id: 24, name: 'Three of Wands', arcana: 'minor', suit: 'Wands', number: 3, element: 'Fire', upright: ['Progress', 'Expansion', 'Foresight', 'New horizons'], reversed: ['Playing small', 'Delays', 'Obstacles', 'Limited vision'] },
  { id: 25, name: 'Four of Wands', arcana: 'minor', suit: 'Wands', number: 4, element: 'Fire', upright: ['Celebration', 'Harmony', 'Marriage', 'Homecoming', 'Stability'], reversed: ['Personal celebration', 'Inner harmony', 'Conflicts'] },
  { id: 26, name: 'Five of Wands', arcana: 'minor', suit: 'Wands', number: 5, element: 'Fire', upright: ['Conflict', 'Disagreement', 'Competition', 'Diversity'], reversed: ['Inner conflict', 'Avoiding conflict', 'Conflict avoidance'] },
  { id: 27, name: 'Six of Wands', arcana: 'minor', suit: 'Wands', number: 6, element: 'Fire', upright: ['Success', 'Public recognition', 'Progress', 'Self-confidence'], reversed: ['Inner success', 'Fall from grace', 'Ego deflation'] },
  { id: 28, name: 'Seven of Wands', arcana: 'minor', suit: 'Wands', number: 7, element: 'Fire', upright: ['Challenge', 'Competition', 'Protected victory', 'Perseverance'], reversed: ['Exhaustion', 'Giving up', 'Overwhelmed', 'Stressed'] },
  { id: 29, name: 'Eight of Wands', arcana: 'minor', suit: 'Wands', number: 8, element: 'Fire', upright: ['Rapid action', 'Movement', 'Quick decisions', 'Speed'], reversed: ['Delays', 'Frustration', 'Loss of control', 'Stalling'] },
  { id: 30, name: 'Nine of Wands', arcana: 'minor', suit: 'Wands', number: 9, element: 'Fire', upright: ['Resilience', 'Courage', 'Persistence', 'Test of faith'], reversed: ['Inner resources', 'Inner bell', 'Wounded', 'Suspicion'] },
  { id: 31, name: 'Ten of Wands', arcana: 'minor', suit: 'Wands', number: 10, element: 'Fire', upright: ['Burden', 'Responsibility', 'Hard work', 'Stress', 'Leader'], reversed: ['Doing it all', 'Delegation', 'Release of burden'] },
  { id: 32, name: 'Page of Wands', arcana: 'minor', suit: 'Wands', number: 11, element: 'Fire', upright: ['Inspiration', 'Ideas', 'Discovery', 'Free spirit'], reversed: ['Newly found power', 'Set exciting plans', 'Creative blocks'] },
  { id: 33, name: 'Knight of Wands', arcana: 'minor', suit: 'Wands', number: 12, element: 'Fire', upright: ['Energy', 'Passion', 'Adventure', 'Fearlessness'], reversed: ['Passion project', 'Creative blocks', 'Hot-headedness'] },
  { id: 34, name: 'Queen of Wands', arcana: 'minor', suit: 'Wands', number: 13, element: 'Fire', upright: ['Empowerment', 'Fierce', 'Confident', 'Warmth', 'Independence'], reversed: ['Inner confidence', 'Self-appreciation', 'Self-assurance'] },
  { id: 35, name: 'King of Wands', arcana: 'minor', suit: 'Wands', number: 14, element: 'Fire', upright: ['Natural leader', 'Vision', 'Entrepreneurship', 'Honor'], reversed: ['Impulsiveness', 'Tyranny', 'Arrogance', 'Rhyming decisions'] },
];

// Minor Arcana - Cups (Water) - 14 cards
const CUPS: TarotCard[] = [
  { id: 36, name: 'Ace of Cups', arcana: 'minor', suit: 'Cups', number: 1, element: 'Water', upright: ['New feelings', 'Spirituality', 'Intuition', 'Love'], reversed: ['Self-love', 'Self-care', 'Repressed emotions'] },
  { id: 37, name: 'Two of Cups', arcana: 'minor', suit: 'Cups', number: 2, element: 'Water', upright: ['Partnership', 'Mutual attraction', 'Connection', 'Bodings'], reversed: ['Self-love', 'Unequal partnership', 'Self-awareness'] },
  { id: 38, name: 'Three of Cups', arcana: 'minor', suit: 'Cups', number: 3, element: 'Water', upright: ['Celebration', 'Friendship', 'Community', 'Creativity'], reversed: ['Inner emotional clarity', 'Independence', 'Social overload'] },
  { id: 39, name: 'Four of Cups', arcana: 'minor', suit: 'Cups', number: 4, element: 'Water', upright: ['Meditation', 'Contemplation', 'Apathy', 'Reevaluation'], reversed: ['Sudden awareness', 'Choosing happiness', 'Acceptance'] },
  { id: 40, name: 'Five of Cups', arcana: 'minor', suit: 'Cups', number: 5, element: 'Water', upright: ['Loss', 'Grief', 'Disappointment', 'Regret'], reversed: ['Personal disappointment', 'Seeking inner guidance', 'Finding peace'] },
  { id: 41, name: 'Six of Cups', arcana: 'minor', suit: 'Cups', number: 6, element: 'Water', upright: ['Revisiting the past', 'Memories', 'Innocence', 'Joy'], reversed: ['Living in the past', 'Forgotten agreements', 'Naivety'] },
  { id: 42, name: 'Seven of Cups', arcana: 'minor', suit: 'Cups', number: 7, element: 'Water', upright: ['Opportunities', 'Choices', 'Wishful thinking', 'Fantasy'], reversed: ['Prioritizing', 'Motivation', 'Dream assassination'] },
  { id: 43, name: 'Eight of Cups', arcana: 'minor', suit: 'Cups', number: 8, element: 'Water', upright: ['Disappointment', 'Abandonment', 'Withdrawal', 'escaping'], reversed: ['Trying one more time', 'Deciding to grow'] },
  { id: 44, name: 'Nine of Cups', arcana: 'minor', suit: 'Cups', number: 9, element: 'Water', upright: ['Contentment', 'Satisfaction', 'Gratitude', 'Wish fulfilled'], reversed: ['Inner happiness', 'Sobriety', 'Materialism'] },
  { id: 45, name: 'Ten of Cups', arcana: 'minor', suit: 'Cups', number: 10, element: 'Water', upright: ['Divine contentment', 'Tolerance', 'Acceptance', 'In-tune'], reversed: ['Disconnected', 'Unfulfilled wishes', 'Disparity'] },
  { id: 46, name: 'Page of Cups', arcana: 'minor', suit: 'Cups', number: 11, element: 'Water', upright: ['Creative opportunities', 'Intuition', 'Curiosity'], reversed: ['New ideas', 'Doubtful emotions', 'Inner truth'] },
  { id: 47, name: 'Knight of Cups', arcana: 'minor', suit: 'Cups', number: 12, element: 'Water', upright: ['Creativity', 'Romance', 'Charm', 'Imagination'], reversed: ['Overactive imagination', 'Moodiness', 'Practicality'] },
  { id: 48, name: 'Queen of Cups', arcana: 'minor', suit: 'Cups', number: 13, element: 'Water', upright: ['Compassion', 'Intuition', 'Emotionally availability'], reversed: ['Inner feelings', 'Martyrdom', 'Codependency'] },
  { id: 49, name: 'King of Cups', arcana: 'minor', suit: 'Cups', number: 14, element: 'Water', upright: ['Emotionally stable', 'Diplomatic', 'Compassion', 'Balance'], reversed: ['Inner emotional balance', 'Self-compassion', 'Coldness'] },
];

// Minor Arcana - Swords (Air) - 14 cards
const SWORDS: TarotCard[] = [
  { id: 50, name: 'Ace of Swords', arcana: 'minor', suit: 'Swords', number: 1, element: 'Air', upright: ['Breakthroughs', 'Clarity', 'Sharp mind', 'Truth'], reversed: ['Inner clarity', 'Re-establishing identity', 'Boundaries'] },
  { id: 51, name: 'Two of Swords', arcana: 'minor', suit: 'Swords', number: 2, element: 'Air', upright: ['Difficult choices', 'Indecisiveness', 'Stalemate'], reversed: ['Indecision', 'Confusion', 'Inequality'] },
  { id: 52, name: 'Three of Swords', arcana: 'minor', suit: 'Swords', number: 3, element: 'Air', upright: ['Heartbreak', 'Emotional pain', 'hurt', 'Sorrow'], reversed: ['Inner conflict', 'Negative self-talk', 'Optimism'] },
  { id: 53, name: 'Four of Swords', arcana: 'minor', suit: 'Swords', number: 4, element: 'Air', upright: ['Rest', 'Restoration', 'Contemplation', 'Recovery'], reversed: ['Inner rest', 'Psychic attack', 'Overt burnout'] },
  { id: 54, name: 'Five of Swords', arcana: 'minor', suit: 'Swords', number: 5, element: 'Air', upright: ['Conflict', 'Defeat', 'Winning at all costs', 'Betrayal'], reversed: ['Reaching out', 'Vulnerability', 'Genuine alternative'] },
  { id: 55, name: 'Six of Swords', arcana: 'minor', suit: 'Swords', number: 6, element: 'Air', upright: ['Transition', 'Leaving behind', 'Moving on', 'Recovery'], reversed: ['Stuck', 'Resisting change', 'Unfinished business'] },
  { id: 56, name: 'Seven of Swords', arcana: 'minor', suit: 'Swords', number: 7, element: 'Air', upright: ['Betrayal', 'Deception', 'Getting away with something', 'Strategy'], reversed: ['Self-deception', 'Imposter syndrome', 'Revision'] },
  { id: 57, name: 'Eight of Swords', arcana: 'minor', suit: 'Swords', number: 8, element: 'Air', upright: ['Imprisonment', 'Entrapment', 'Self-victimization', 'Persecution'], reversed: ['Inciting incident', 'New persecuting', 'Freeing yourself'] },
  { id: 58, name: 'Nine of Swords', arcana: 'minor', suit: 'Swords', number: 9, element: 'Air', upright: ['Anxiety', 'Worry', 'Depressive state', 'Nightmares'], reversed: ['Inner turmoil', 'Reaching out', 'hope'] },
  { id: 59, name: 'Ten of Swords', arcana: 'minor', suit: 'Swords', number: 10, element: 'Air', upright: ['Painful endings', 'Deep wounds', 'Betrayal', 'Loss'], reversed: ['Recovery', 'Regeneration', 'Resisting an inevitable end'] },
  { id: 60, name: 'Page of Swords', arcana: 'minor', suit: 'Swords', number: 11, element: 'Air', upright: ['New ideas', 'Curiosity', 'Thirst for knowledge', 'Communication'], reversed: ['Self-expression', 'All talk no action', 'Scattered thoughts'] },
  { id: 61, name: 'Knight of Swords', arcana: 'minor', suit: 'Swords', number: 12, element: 'Air', upright: ['Ambitious action', 'Direction', 'Fast thinking', 'Swift action'], reversed: ['Restless', 'Burnout', 'anger', 'Unfocused'] },
  { id: 62, name: 'Queen of Swords', arcana: 'minor', suit: 'Swords', number: 13, element: 'Air', upright: ['Independent', '-non-judgmental', 'Clear boundaries', 'Direct'], reversed: ['Overly emotional', 'Easily influenced', 'Cold-hearted'] },
  { id: 63, name: 'King of Swords', arcana: 'minor', suit: 'Swords', number: 14, element: 'Air', upright: ['Intellectual power', 'Authority', 'Truth', 'Clear thinking'], reversed: ['Inner authority', 'Inner voice', 'Manipulation'] },
];

// Minor Arcana - Pentacles (Earth) - 14 cards
const PENTACLES: TarotCard[] = [
  { id: 64, name: 'Ace of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 1, element: 'Earth', upright: ['New financial opportunity', 'Manifestation', 'Abundance'], reversed: ['New venture', 'Lost opportunity', 'Missed chance'] },
  { id: 65, name: 'Two of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 2, element: 'Earth', upright: ['Multiple priorities', 'Time management', 'Adaptability'], reversed: ['Over-committed', 'Overwhelmed', 'Disorganization'] },
  { id: 66, name: 'Three of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 3, element: 'Earth', upright: ['Teamwork', 'Collaboration', 'Learning', 'Implementation'], reversed: ['Disharmony', 'Miscommunication', 'Working alone'] },
  { id: 67, name: 'Four of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 4, element: 'Earth', upright: ['Saving money', 'Security', 'Conservation', 'Frugality'], reversed: ['Over-spending', 'Greed', 'Letting go of security'] },
  { id: 68, name: 'Five of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 5, element: 'Earth', upright: ['Financial loss', 'Isolation', 'Worry', 'Fog'], reversed: ['Recovery', 'Spiritual poverty', 'Re-Evaluating priorities'] },
  { id: 69, name: 'Six of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 6, element: 'Earth', upright: ['Giving and receiving', 'Sharing wealth', 'Generosity', 'Charity'], reversed: ['Self-care', 'Owing favors', 'Strings attached'] },
  { id: 70, name: 'Seven of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 7, element: 'Earth', upright: ['Long-term view', 'Perseverance', 'Investment', 'Patience'], reversed: ['Lack of long-term vision', 'Limited success', 'Frustration'] },
  { id: 71, name: 'Eight of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 8, element: 'Earth', upright: ['Apprenticeship', '重复任务', 'Skill development', 'Dedication'], reversed: ['Self-development', 'Seeking recognition', 'Shiny new project'] },
  { id: 72, name: 'Nine of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 9, element: 'Earth', upright: ['Abundance', 'Independence', 'Financial freedom', 'Luxury'], reversed: ['Self-worth', 'Over-commercialization', 'Living beyond means'] },
  { id: 73, name: 'Ten of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 10, element: 'Earth', upright: ['Inheritance', 'Family', 'Establishment', 'Long-term success'], reversed: ['Inner abundance', 'Family conflict', 'Financial failure'] },
  { id: 74, name: 'Page of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 11, element: 'Earth', upright: ['Manifestation', 'Financial opportunity', 'Skill development'], reversed: ['Lack of progress', 'Procrastination', 'Missed deadlines'] },
  { id: 75, name: 'Knight of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 12, element: 'Earth', upright: ['Foundation', 'Efficiency', 'Routine', 'Conservative'], reversed: ['Self-discipline', 'Boring', 'Persistent habits'] },
  { id: 76, name: 'Queen of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 13, element: 'Earth', upright: ['Nurturing', 'Practicality', 'Abundance', 'Security'], reversed: ['Financial insecurity', 'Self-neglect', 'dependence'] },
  { id: 77, name: 'King of Pentacles', arcana: 'minor', suit: 'Pentacles', number: 14, element: 'Earth', upright: ['Wealth', 'Business', 'Leadership', 'Security', 'Discipline'], reversed: ['Financial failure', 'Greed', 'Materialism', 'Stubborness'] },
];

// All 78 cards
const ALL_CARDS: TarotCard[] = [
  ...MAJOR_ARCANA,
  ...WANDS,
  ...CUPS,
  ...SWORDS,
  ...PENTACLES,
];

/**
 * Get the complete 78-card tarot deck
 */
export function getDeck(): TarotDeck {
  return { cards: ALL_CARDS };
}
