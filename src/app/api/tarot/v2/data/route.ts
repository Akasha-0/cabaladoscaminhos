// ============================================================
// TAROT DATA API v2 - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for tarot v2 data access
// - Retrieve all tarot cards and decks
// - Retrieve card interpretations and meanings
// - Get specific card by ID or name
// - Tarot spreads and layouts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ─── CARD INTERFACES ──────────────────────────────────────────────────────────

interface TarotCard {
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

interface CardInterpretation {
  cardName: string;
  tags: string[];
  summary: string;
  general: string;
  love: string | null;
  career: string | null;
  shadow: string[];
  affirmations: string[];
}

interface TarotSpread {
  id: string;
  name: string;
  name_pt: string;
  cards: number;
  positions: string[];
  description: string;
  description_pt: string;
}

interface TarotConfiguration {
  key: string;
  value: string;
  updatedAt: string;
}

// ─── MAJOR ARCANA DATA ────────────────────────────────────────────────────────

const MAJOR_ARCANA_CARDS: TarotCard[] = [
  { id: 0, name: 'The Fool', arcana: 'major', element: 'Air', astro: 'Uranus', upright: ['New beginnings', 'Innocence', 'Spontaneity', 'Free will'], reversed: ['Recklessness', 'Fearlessness', 'Risk-taking'] },
  { id: 1, name: 'The Magician', arcana: 'major', element: 'Air', astro: 'Mercury', upright: ['Manifestation', 'Resourcefulness', 'Power', 'Inspired action'], reversed: ['Manipulation', 'Poor planning', 'Unused talents'] },
  { id: 2, name: 'The High Priestess', arcana: 'major', element: 'Water', astro: 'Moon', upright: ['Intuition', 'Sacred knowledge', 'Divine feminine', 'Mystery'], reversed: ['Hidden agendas', 'Lack of trust', 'Deception'] },
  { id: 3, name: 'The Empress', arcana: 'major', element: 'Earth', astro: 'Venus', upright: ['Femininity', 'Beauty', 'Nature', 'Abundance', 'Creativity'], reversed: ['Creative block', 'Dependence', 'Smothering'] },
  { id: 4, name: 'The Emperor', arcana: 'major', element: 'Fire', astro: 'Aries', upright: ['Authority', 'Structure', 'Control', 'Fatherhood', 'Stability'], reversed: ['Domination', 'Excessive control', 'Tyranny'] },
  { id: 5, name: 'The Hierophant', arcana: 'major', element: 'Earth', astro: 'Taurus', upright: ['Spiritual wisdom', 'Tradition', 'Conformity', 'Education', 'Faith'], reversed: ['Personal beliefs', 'Freedom', 'Subversive'] },
  { id: 6, name: 'The Lovers', arcana: 'major', element: 'Air', astro: 'Gemini', upright: ['Love', 'Harmony', 'Relationships', 'Choices', 'Union'], reversed: ['Self-trust', 'Doubt', 'Imbalance'] },
  { id: 7, name: 'The Chariot', arcana: 'major', element: 'Water', astro: 'Cancer', upright: ['Control', 'Willpower', 'Success', 'Action', 'Confidence'], reversed: ['Lack of direction', 'Aggression', 'Turned around'] },
  { id: 8, name: 'Strength', arcana: 'major', element: 'Fire', astro: 'Leo', upright: ['Courage', 'Perseverance', 'Compassion', 'Inner strength'], reversed: ['Self-doubt', 'Weakness', 'Insecurity'] },
  { id: 9, name: 'The Hermit', arcana: 'major', element: 'Earth', astro: 'Virgo', upright: ['Soul-searching', 'Introspection', 'Inner guidance', 'Soltude'], reversed: ['Isolation', 'Loneliness', 'Withdrawal'] },
  { id: 10, name: 'Wheel of Fortune', arcana: 'major', element: 'Fire', astro: 'Jupiter', upright: ['Good luck', 'Karma', 'Life cycles', 'Destiny', 'Turn for better'], reversed: ['Bad luck', 'Resistance to change', 'Breaking cycles'] },
  { id: 11, name: 'Justice', arcana: 'major', element: 'Air', astro: 'Libra', upright: ['Cause and effect', 'Law', 'Fairness', 'Truth', 'Accountability'], reversed: ['Unfairness', 'Lack of accountability', 'Dishonesty'] },
  { id: 12, name: 'The Hanged Man', arcana: 'major', element: 'Water', astro: 'Neptune', upright: ['Pause', 'Surrender', 'Letting go', 'New perspectives'], reversed: ['Delays', 'Resistance', 'Stalling', 'Inaction'] },
  { id: 13, name: 'Death', arcana: 'major', element: 'Water', astro: 'Scorpio', upright: ['Endings', 'Change', 'Transformation', 'Transition'], reversed: ['Resistance to change', 'Personal transformation', 'Inner purging'] },
  { id: 14, name: 'Temperance', arcana: 'major', element: 'Fire', astro: 'Sagittarius', upright: ['Balancing', 'Patience', 'Purpose', 'Meaning', 'Moderation'], reversed: ['Imbalance', 'Excess', 'Self-healing', 'Realignment'] },
  { id: 15, name: 'The Devil', arcana: 'major', element: 'Earth', astro: 'Capricorn', upright: ['Shadow self', 'Attachment', 'Addiction', 'Materialism'], reversed: ['Releasing limiting beliefs', 'Exploring dark emotions', 'Addiction free'] },
  { id: 16, name: 'The Tower', arcana: 'major', element: 'Fire', astro: 'Mars', upright: ['Sudden change', 'Upheaval', 'Revelation', 'Awakening'], reversed: ['Personal transformation', 'Disaster avoided', 'Inner turmoil'] },
  { id: 17, name: 'The Star', arcana: 'major', element: 'Air', astro: 'Aquarius', upright: ['Hope', 'Faith', 'Purpose', 'Renewal', 'Serenity'], reversed: ['Lack of faith', 'Desperation', 'Tarnished hope'] },
  { id: 18, name: 'The Moon', arcana: 'major', element: 'Water', astro: 'Pisces', upright: ['Illusion', 'Fear', 'Anxiety', 'Subconscious', 'Instinct'], reversed: ['Release of fear', 'Emotional and psychological release', 'Peace'] },
  { id: 19, name: 'The Sun', arcana: 'major', element: 'Fire', astro: 'Sun', upright: ['Positivity', 'Success', 'Vitality', 'Inner child', 'Joy'], reversed: ['Feeling down', 'Overly optimistic', 'Tarnished success'] },
  { id: 20, name: 'Judgement', arcana: 'major', element: 'Fire', astro: 'Pluto', upright: ['Judgement', 'Rebirth', 'Inner calling', 'Absolution'], reversed: ['Self-doubt', 'Ignored calling', 'Harsh self-judgment'] },
  { id: 21, name: 'The World', arcana: 'major', element: 'Earth', astro: 'Saturn', upright: ['Completion', 'Integration', 'Accomplishment', 'Travel'], reversed: ['Seeking personal closure', 'Incomplete completion', 'Shortcuts'] },
];

// ─── MINOR ARCANA DATA ────────────────────────────────────────────────────────

const MINOR_ARCANA_CARDS: TarotCard[] = [
  // Wands
  { id: 22, name: 'Ace of Wands', arcana: 'minor', suit: 'wands', number: 1, element: 'Fire', upright: ['Inspiration', 'New opportunities', 'Growth', 'Potential'], reversed: ['Delays', 'Lack of motivation', 'Creative block'] },
  { id: 23, name: 'Two of Wands', arcana: 'minor', suit: 'wands', number: 2, element: 'Fire', upright: ['Future planning', 'Progress', 'Decisions', 'Discovery'], reversed: ['Personal goals', 'Inner alignment', 'Lack of planning'] },
  { id: 24, name: 'Three of Wands', arcana: 'minor', suit: 'wands', number: 3, element: 'Fire', upright: ['Progress', 'Expansion', 'Foresight', 'New horizons'], reversed: ['Playing it safe', 'Delays', 'Obstacles'] },
  { id: 25, name: 'Four of Wands', arcana: 'minor', suit: 'wands', number: 4, element: 'Fire', upright: ['Celebration', 'Harmony', 'Marriage', 'Homecoming', 'Stability'], reversed: ['Personal celebration', 'Inner harmony', 'Conflict'] },
  { id: 26, name: 'Five of Wands', arcana: 'minor', suit: 'wands', number: 5, element: 'Fire', upright: ['Conflict', 'Intense competition', 'Diversity', 'Conflict resolution'], reversed: ['Avoiding conflict', 'Internal conflict', 'Resolution'] },
  { id: 27, name: 'Six of Wands', arcana: 'minor', suit: 'wands', number: 6, element: 'Fire', upright: ['Success', 'Public recognition', 'Progress', 'Self-confidence'], reversed: ['Inner success', 'Fall from grace', 'Ego'] },
  { id: 28, name: 'Seven of Wands', arcana: 'minor', suit: 'wands', number: 7, element: 'Fire', upright: ['Challenge', 'Competition', 'Protect achievements', 'Test of will'], reversed: ['Exhaustion', 'Give up', 'Winning'] },
  { id: 29, name: 'Eight of Wands', arcana: 'minor', suit: 'wands', number: 8, element: 'Fire', upright: ['Action', 'Movement', 'Quick decisions', 'Flying fast'], reversed: ['Delays', 'Frustration', 'Waiting'] },
  { id: 30, name: 'Nine of Wands', arcana: 'minor', suit: 'wands', number: 9, element: 'Fire', upright: ['Resilience', 'Courage', 'Persistence', 'Test of faith'], reversed: ['Inner resilience', 'Exhaustion', 'Paranoia'] },
  { id: 31, name: 'Ten of Wands', arcana: 'minor', suit: 'wands', number: 10, element: 'Fire', upright: ['Burden', ' Responsibility', 'Hard work', 'Stress'], reversed: ['Doing it all', 'Delegation', 'Release'] },
  { id: 32, name: 'Page of Wands', arcana: 'minor', suit: 'wands', number: 11, element: 'Fire', upright: ['Inspiration', 'Ideas', 'Discovery', 'Free spirit'], reversed: ['Newly found passion', 'Setbacks', 'Lack of direction'] },
  { id: 33, name: 'Knight of Wands', arcana: 'minor', suit: 'wands', number: 12, element: 'Fire', upright: ['Energy', 'Passion', 'Adventure', 'Impulsiveness'], reversed: ['Passion project', 'Impulsiveness', 'Setbacks'] },
  { id: 34, name: 'Queen of Wands', arcana: 'minor', suit: 'wands', number: 13, element: 'Fire', upright: ['Courage', 'Confidence', 'Independence', 'Social butterfly'], reversed: ['Self-assurance', 'Selfishness', 'Jealousy'] },
  { id: 35, name: 'King of Wands', arcana: 'minor', suit: 'wands', number: 14, element: 'Fire', upright: ['Natural leader', 'Vision', 'Entrepreneur', 'Honor'], reversed: ['Impulsiveness', 'Tyrrany', 'Weakness'] },
  // Cups
  { id: 36, name: 'Ace of Cups', arcana: 'minor', suit: 'cups', number: 1, element: 'Water', upright: ['New love', 'Compassion', 'Joy', 'Creativity'], reversed: ['Self-love', 'Repressed emotions', 'Empty heart'] },
  { id: 37, name: 'Two of Cups', arcana: 'minor', suit: 'cups', number: 2, element: 'Water', upright: ['Unified love', 'Partnership', 'Mutual attraction'], reversed: ['Self-love', 'Imbalanced relationship', 'Breaking away'] },
  { id: 38, name: 'Three of Cups', arcana: 'minor', suit: 'cups', number: 3, element: 'Water', upright: ['Celebration', 'Friendship', 'Community', 'Creativity'], reversed: ['Independence', 'Social cloud', 'Trapped'] },
  { id: 39, name: 'Four of Cups', arcana: 'minor', suit: 'cups', number: 4, element: 'Water', upright: ['Meditation', 'Apathy', 'Contemplation', 'Discontent'], reversed: ['Sudden awareness', 'Choosing happiness', 'Acceptance'] },
  { id: 40, name: 'Five of Cups', arcana: 'minor', suit: 'cups', number: 5, element: 'Water', upright: ['Regret', 'Failure', 'Disappointment', 'Despair'], reversed: ['Personal disappointment', 'Recovering optimism', 'Accepting'] },
  { id: 41, name: 'Six of Cups', arcana: 'minor', suit: 'cups', number: 6, element: 'Water', upright: ['Revisiting the past', 'Innocence', 'Joy', 'Youth'], reversed: ['Living in the past', 'Naivety', 'Stuck'] },
  { id: 42, name: 'Seven of Cups', arcana: 'minor', suit: 'cups', number: 7, element: 'Water', upright: ['Opportunities', 'Choices', 'Wishful thinking', 'Stuck'], reversed: ['Avoidance', 'Sleeping on decisions', 'Personal values'] },
  { id: 43, name: 'Eight of Cups', arcana: 'minor', suit: 'cups', number: 8, element: 'Water', upright: ['Disappointment', 'Abandonment', 'Withdrawal', 'Escapism'], reversed: ['Trying one more time', 'Fear of loss', 'Need to walk away'] },
  { id: 44, name: 'Nine of Cups', arcana: 'minor', suit: 'cups', number: 9, element: 'Water', upright: ['Contentment', 'Satisfaction', 'Gratitude', 'Wish fulfilled'], reversed: ['Inner happiness', 'Materialism', 'Satisfaction lacking'] },
  { id: 45, name: 'Ten of Cups', arcana: 'minor', suit: 'cups', number: 10, element: 'Water', upright: ['Divine love', 'Blissful relationships', 'Alignment', 'Harmony'], reversed: ['Unfulfilled dreams', 'Disconnection', 'Happiness blocked'] },
  { id: 46, name: 'Page of Cups', arcana: 'minor', suit: 'cups', number: 11, element: 'Water', upright: ['Creative opportunities', 'Intuition', 'Curiosity'], reversed: ['Inner child healing', 'Creative blocks', 'Intuition studied'] },
  { id: 47, name: 'Knight of Cups', arcana: 'minor', suit: 'cups', number: 12, element: 'Water', upright: ['Creativity', 'Romance', 'Charm', 'Imagination'], reversed: ['Moodiness', 'Unrealistic', 'Boredom'] },
  { id: 48, name: 'Queen of Cups', arcana: 'minor', suit: 'cups', number: 13, element: 'Water', upright: ['Compassion', 'Intuition', 'Emotional security', 'Calm'], reversed: ['Inner feelings', 'Self-care', 'Coldness'] },
  { id: 49, name: 'King of Cups', arcana: 'minor', suit: 'cups', number: 14, element: 'Water', upright: ['Emotionally balanced', 'Compassionate', 'Diplomatic'], reversed: ['Self-compassion', 'Moody', 'Manipulative'] },
  // Swords
  { id: 50, name: 'Ace of Swords', arcana: 'minor', suit: 'swords', number: 1, element: 'Air', upright: ['Breakthrough', 'Clarity', 'Mental edge', 'Truth'], reversed: ['Inner clarity', 'Repressed truths', 'Chaos'] },
  { id: 51, name: 'Two of Swords', arcana: 'minor', suit: 'swords', number: 2, element: 'Air', upright: ['Difficult choices', 'Indecision', 'Stalemate', 'Avoidance'], reversed: ['Indecision', 'Confusion', 'Information overload'] },
  { id: 52, name: 'Three of Swords', arcana: 'minor', suit: 'swords', number: 3, element: 'Air', upright: ['Heartbreak', 'Emotional pain', 'Sorrow', 'Grief'], reversed: ['Negative self-talk', 'Recovering heart', 'Moving on'] },
  { id: 53, name: 'Four of Swords', arcana: 'minor', suit: 'swords', number: 4, element: 'Air', upright: ['Rest', 'Restoration', 'Contemplation', 'Meditation'], reversed: ['Exhaustion', 'Deep contemplation', 'Forced rest'] },
  { id: 54, name: 'Five of Swords', arcana: 'minor', suit: 'swords', number: 5, element: 'Air', upright: ['Conflict', 'Defeat', 'Winning at all costs', 'Betrayal'], reversed: ['Reaching resolution', 'Dark victory', 'Reconciliation'] },
  { id: 55, name: 'Six of Swords', arcana: 'minor', suit: 'swords', number: 6, element: 'Air', upright: ['Transition', 'Leaving behind', 'Moving on', 'Recovery'], reversed: ['Stuck', 'Resisting change', 'Unfinished business'] },
  { id: 56, name: 'Seven of Swords', arcana: 'minor', suit: 'swords', number: 7, element: 'Air', upright: ['Betrayal', 'Deception', 'Getting away with something', 'Secrets'], reversed: ['Imposter', 'Self-deception', 'Truth revealed'] },
  { id: 57, name: 'Eight of Swords', arcana: 'minor', suit: 'swords', number: 8, element: 'Air', upright: ['Imprisonment', 'Entrapment', 'Self-victimization', 'Helplessness'], reversed: ['Self-acceptance', 'New perspective', 'Freedom'] },
  { id: 58, name: 'Nine of Swords', arcana: 'minor', suit: 'swords', number: 9, element: 'Air', upright: ['Anxiety', 'Worry', 'Overthinking', 'Despair', 'Guilt'], reversed: ['Inner turmoil', 'Recovering optimism', 'Facing fears'] },
  { id: 59, name: 'Ten of Swords', arcana: 'minor', suit: 'swords', number: 10, element: 'Air', upright: ['Painful ending', 'Crisis', 'Betrayal', 'Loss', 'Trauma'], reversed: ['Recovery', 'Resistance', 'Energy clearing'] },
  { id: 60, name: 'Page of Swords', arcana: 'minor', suit: 'swords', number: 11, element: 'Air', upright: ['New ideas', 'Curiosity', 'Thirst for knowledge', 'Communication'], reversed: ['Self-expression', 'Scattered thoughts', 'Defensive'] },
  { id: 61, name: 'Knight of Swords', arcana: 'minor', suit: 'swords', number: 12, element: 'Air', upright: ['Ambitious', 'Action-oriented', 'Drive', 'Fast thinking'], reversed: ['Restless', 'Scattered', 'Frivolous'] },
  { id: 62, name: 'Queen of Swords', arcana: 'minor', suit: 'swords', number: 13, element: 'Air', upright: ['Independent', 'Unapologetic', 'Strong', 'Clear boundaries'], reversed: ['Overly emotional', 'Self-protective', 'Cold-hearted'] },
  { id: 63, name: 'King of Swords', arcana: 'minor', suit: 'swords', number: 14, element: 'Air', upright: ['Intellectual power', 'Authority', 'Truth', 'Clear communication'], reversed: ['Inner authority', 'Abuse of power', 'Manipulation'] },
  // Pentacles
  { id: 64, name: 'Ace of Pentacles', arcana: 'minor', suit: 'pentacles', number: 1, element: 'Earth', upright: ['New financial opportunity', 'Manifestation', 'Abundance'], reversed: ['Lost opportunity', 'Focus on inner values', 'Missed chances'] },
  { id: 65, name: 'Two of Pentacles', arcana: 'minor', suit: 'pentacles', number: 2, element: 'Earth', upright: ['Multiple priorities', 'Time management', 'Prioritization', 'Adaptability'], reversed: ['Over-committed', 'Disorganization', 'Imbalance'] },
  { id: 66, name: 'Three of Pentacles', arcana: 'minor', suit: 'pentacles', number: 3, element: 'Earth', upright: ['Teamwork', 'Collaboration', 'Learning', 'Implementation'], reversed: ['Disharmony', 'Miscommunication', 'Working alone'] },
  { id: 67, name: 'Four of Pentacles', arcana: 'minor', suit: 'pentacles', number: 4, element: 'Earth', upright: ['Saving money', 'Security', 'Control', 'Stability'], reversed: ['Over-spending', 'Greed', 'Letting go'] },
  { id: 68, name: 'Five of Pentacles', arcana: 'minor', suit: 'pentacles', number: 5, element: 'Earth', upright: ['Financial loss', 'Poverty', 'Lack', 'Worry'], reversed: ['Recovery from loss', 'Spiritual poverty', 'Inner guidance'] },
  { id: 69, name: 'Six of Pentacles', arcana: 'minor', suit: 'pentacles', number: 6, element: 'Earth', upright: ['Giving, sharing', 'Receiving', 'Charity', 'Generosity'], reversed: ['Strings attached', 'Debt', 'Self-care'] },
  { id: 70, name: 'Seven of Pentacles', arcana: 'minor', suit: 'pentacles', number: 7, element: 'Earth', upright: ['Long-term view', 'Sustainable results', 'Perseverance', 'Investment'], reversed: ['Lack of long-term vision', 'Limited success', 'Impatience'] },
  { id: 71, name: 'Eight of Pentacles', arcana: 'minor', suit: 'pentacles', number: 8, element: 'Earth', upright: ['Apprenticeship', ' repetitive tasks', 'Skill development', 'Quality'], reversed: ['Self-development', 'Short-cuts', 'Perfectionism'] },
  { id: 72, name: 'Nine of Pentacles', arcana: 'minor', suit: 'pentacles', number: 9, element: 'Earth', upright: ['Abundance', 'Luxury', 'Self-sufficiency', 'Financial independence'], reversed: ['Inner values', 'Over-spending', 'Comparison'] },
  { id: 73, name: 'Ten of Pentacles', arcana: 'minor', suit: 'pentacles', number: 10, element: 'Earth', upright: ['Wealth', 'Inheritance', 'Family', 'Long-term success'], reversed: ['Family conflict', 'Financial failure', 'Instability'] },
  { id: 74, name: 'Page of Pentacles', arcana: 'minor', suit: 'pentacles', number: 11, element: 'Earth', upright: ['Manifestation', 'Financial opportunity', 'Skill development'], reversed: ['Skill development', 'Lack of progress', 'Missed opportunity'] },
  { id: 75, name: 'Knight of Pentacles', arcana: 'minor', suit: 'pentacles', number: 12, element: 'Earth', upright: ['Efficient', 'Reliable', 'Patient', 'Hard-working'], reversed: ['Boring', 'Stuck', 'Work-life balance'] },
  { id: 76, name: 'Queen of Pentacles', arcana: 'minor', suit: 'pentacles', number: 13, element: 'Earth', upright: ['Nurturing', 'Practical', 'Providing', 'Down-to-earth'], reversed: ['Self-care', 'Financial independence', 'Smothering'] },
  { id: 77, name: 'King of Pentacles', arcana: 'minor', suit: 'pentacles', number: 14, element: 'Earth', upright: ['Wealth', 'Business', 'Leadership', 'Security', 'Discipline'], reversed: ['Financially inept', 'Greedy', 'Stubborn'] },
];

// ─── MAJOR ARCANA INTERPRETATIONS ─────────────────────────────────────────────

const MAJOR_ARCANA_INTERPRETATIONS: CardInterpretation[] = [
  { cardName: 'The Fool', tags: ['new-beginnings', 'spontaneity', 'innocence', 'trust'], summary: 'Leap into the unknown with wonder and trust.', general: 'You stand at the threshold of a new chapter. Everything feels fresh, uncertain, and full of possibility. The Fool urges you to step forward with an open heart, trusting that the path will reveal itself as you walk it.', love: null, career: 'A new venture or career pivot is on the horizon. This is the spark of an idea — lean into curiosity.', shadow: ['Where am I using spontaneity to mask avoidance?', 'Am I truly ready to be present, or chasing novelty?'], affirmations: ['I trust the path I am on.', 'I move forward with curiosity and courage.'] },
  { cardName: 'The Magician', tags: ['manifestation', 'willpower', 'creation', 'resources'], summary: 'You already have everything you need to make magic happen.', general: 'All the tools, resources, and skills you need are already within your reach. The Magician is the reminder that you are not a victim of circumstance — you are the architect of your reality.', love: null, career: 'A period of professional empowerment. Focus on leveraging what you already possess.', shadow: ['Where am I aware of my power but hesitating to use it?', 'What talents have I been hiding?'], affirmations: ['I have all I need to create the life I desire.', 'I focus my intentions and take inspired action.'] },
  { cardName: 'The High Priestess', tags: ['intuition', 'mystery', 'inner-knowledge', 'sacred'], summary: 'Trust the wisdom that lives beneath the surface.', general: 'Not everything can be known through logic and analysis — some truths live in the realm of feeling and instinct. The High Priestess calls you to listen inward.', love: null, career: 'Intuition is your professional asset right now. Trust your gut feelings about people and situations.', shadow: ['What am I avoiding by staying in my head?', 'Where is my inner voice being drowned out by noise?'], affirmations: ['I trust my inner wisdom.', 'The answers I seek are already within me.'] },
  { cardName: 'The Empress', tags: ['femininity', 'creativity', 'abundance', 'nature'], summary: 'Nurture the garden of your life with patience and love.', general: 'The Empress embodies the fertile abundance of the natural world. She invites you to connect with your creative power, your capacity to nurture, and your relationship with the physical realm.', love: null, career: 'A period of creative expansion and growth in your work. Allow inspiration to flow.', shadow: ['Where am I neglecting my own needs while nurturing others?', 'What part of me needs tending like an overgrown garden?'], affirmations: ['I am a channel of creative abundance.', 'I nurture myself as I nurture others.'] },
  { cardName: 'The Emperor', tags: ['authority', 'structure', 'control', 'stability'], summary: 'Build the architecture of your reality with discipline.', general: 'The Emperor represents the power of structure, discipline, and authority. He teaches that freedom can be found within boundaries when those boundaries are of your own making.', love: null, career: 'A time to establish systems, set boundaries, and take decisive action in your professional life.', shadow: ['Where am I using control to avoid feeling vulnerable?', 'What structures have I built that no longer serve me?'], affirmations: ['I create structure that serves my highest good.', 'I lead with wisdom and clarity.'] },
  { cardName: 'The Hierophant', tags: ['tradition', 'wisdom', 'education', 'faith'], summary: 'Seek truth through the wisdom of those who walked before.', general: 'The Hierophant represents the sacred teacher, the keeper of spiritual tradition. He calls you to explore the systems, beliefs, and teachers that have guided humanity toward truth.', love: null, career: 'Seek guidance from mentors or established systems. Traditional wisdom may hold the answer.', shadow: ['Where have I blindly followed tradition without questioning it?', 'What beliefs am I holding onto that no longer serve my growth?'], affirmations: ['I honour the wisdom of those before me.', 'I question what needs questioning while honoring truth.'] },
  { cardName: 'The Lovers', tags: ['love', 'harmony', 'relationships', 'choices'], summary: 'Choose love in all its forms, starting with yourself.', general: 'The Lovers represents the profound choice to commit — to another, to a path, to yourself. It speaks to the alchemy of bringing two forces together in harmony.', love: null, career: 'A significant choice is before you that will shape your professional or personal direction.', shadow: ['Am I choosing from love or from fear?', 'Where have I abandoned my own truth to keep the peace?'], affirmations: ['I choose love, starting with myself.', 'I make decisions from a place of wholeness.'] },
  { cardName: 'The Chariot', tags: ['control', 'willpower', 'success', 'confidence'], summary: 'Harness your opposing forces and drive forward.', general: 'The Chariot represents triumph through the integration of opposing forces. You have the will to overcome obstacles and the focus to direct your energy toward victory.', love: null, career: 'Your determination will carry you through current challenges. Stay focused on your destination.', shadow: ['Am I forcing my will when surrender would serve me better?', 'Which parts of myself have I disowned that need to come along for the ride?'], affirmations: ['I channel my will toward my highest purpose.', 'I integrate all parts of myself toward my goals.'] },
  { cardName: 'Strength', tags: ['courage', 'perseverance', 'compassion', 'inner-strength'], summary: 'True strength lies in the gentleness of your heart.', general: 'Strength here is not about physical power but about the quiet strength that comes from compassion, patience, and inner courage. The lion is tamed not through force but through presence.', love: null, career: 'Your patience and compassion will be your greatest assets in current challenges.', shadow: ['Where am I confusing strength with aggression?', 'What fear am I trying to overpower instead of understanding?'], affirmations: ['My strength lies in my tenderness.', 'I meet challenges with courage and compassion.'] },
  { cardName: 'The Hermit', tags: ['introspection', 'soul-searching', 'guidance', 'solitude'], summary: 'Find the light within by embracing the darkness.', general: 'The Hermit invites you into the caves of your own psyche — the spaces where the noise of the world falls away and you can finally hear your own voice.', love: null, career: 'A period of introspection may be exactly what your career path needs. Trust the inner work.', shadow: ['Am I using solitude to escape or to grow?', 'What parts of myself have I been hiding from the light?'], affirmations: ['I light my own way through the darkness.', 'In solitude, I find my deepest truth.'] },
  { cardName: 'Wheel of Fortune', tags: ['karma', 'cycles', 'destiny', 'change'], summary: 'Ride the wheel with grace — up and down are both teachers.', general: 'The Wheel of Fortune reminds us that life moves in cycles. What is down will rise, what is up will fall. The only constant is change itself.', love: null, career: 'A turning point is coming. Stay flexible and ready to adapt to whatever the wheel brings.', shadow: ['Where am I fighting against the natural cycles of life?', 'What old patterns am I ready to release as the wheel turns?'], affirmations: ['I ride the cycles of life with grace.', 'I trust that the wheel is turning in my favour.'] },
  { cardName: 'Justice', tags: ['truth', 'fairness', 'law', 'karma'], summary: 'Truth cuts through illusion with unwavering clarity.', general: 'Justice represents the unblinking eye of truth — the karmic principle that every action has consequences. It asks you to look at yourself and your situation with absolute honesty.', love: null, career: 'Honesty and transparency will serve you best. Truth may be uncomfortable but it is necessary.', shadow: ['Where have I been avoiding the truth?', 'Am I willing to see my own part in this situation?'], affirmations: ['I align with truth and fairness.', 'I accept the consequences of my actions with grace.'] },
  { cardName: 'The Hanged Man', tags: ['pause', 'surrender', 'new-perspectives', 'letting-go'], summary: 'See the world upside down and discover new truth.', general: 'The Hanged Man invites you to pause — to surrender the need to control, to see things from a different angle. In stillness, new perspectives emerge.', love: null, career: 'Sometimes the best action is no action. Allow clarity to emerge from stillness.', shadow: ['What am I avoiding by staying busy?', 'Where am I ready to let go of control?'], affirmations: ['I find wisdom in stillness.', 'New perspectives emerge when I release my grip.'] },
  { cardName: 'Death', tags: ['endings', 'transformation', 'change', 'transition'], summary: 'Honor the death that makes new life possible.', general: 'Death in the Tarot is never about physical death — it is about the profound transformation that comes from endings. Something must die for something else to be born.', love: null, career: 'An ending is creating space for something new. Embrace the transformation.', shadow: ['What needs to die so I can be reborn?', 'What am I holding onto that is ready to be released?'], affirmations: ['I honor endings as the space for new beginnings.', 'I release what no longer serves my transformation.'] },
  { cardName: 'Temperance', tags: ['balance', 'patience', 'moderation', 'synthesis'], summary: 'Blend opposing forces into a golden whole.', general: 'Temperance is the art of synthesis — the alchemical process of mixing opposites to create something new. It asks for patience, moderation, and the ability to find the middle path.', love: null, career: 'Balance in your approach will yield better long-term results than extremes.', shadow: ['Where have I been out of balance?', 'What opposites need to be blended within me?'], affirmations: ['I find balance in all things.', 'I blend opposing forces into harmony.'] },
  { cardName: 'The Devil', tags: ['shadow', 'attachment', 'materialism', 'bondage'], summary: 'Face the chains you have bound yourself with.', general: 'The Devil represents our shadow selves and the attachments that bind us — not through external forces but through our own choices. What chains are you choosing to wear?', love: null, career: 'Examine what attachments or dependencies may be limiting your professional freedom.', shadow: ['What attachments am I not willing to examine?', 'Where have I given away my power?'], affirmations: ['I release the chains I have placed upon myself.', 'I am free to choose differently.'] },
  { cardName: 'The Tower', tags: ['upheaval', 'sudden-change', 'awakening', 'revelation'], summary: 'Let the lightning of truth shatter what was never real.', general: 'The Tower represents sudden, often violent change — the kind that shatters illusions and forces us to see reality as it is. Though painful, it is ultimately liberating.', love: null, career: 'A disruption may be clearing the way for something better. Trust the demolition.', shadow: ['What illusions about myself am I being forced to release?', 'What foundation was built on sand?'], affirmations: ['I welcome the truth that sets me free.', 'In the rubble of what was false, I find what is real.'] },
  { cardName: 'The Star', tags: ['hope', 'renewal', 'faith', 'serenity'], summary: 'After the storm, the stars reveal the way forward.', general: 'After The Tower comes The Star — hope, renewal, and the quiet faith that comes from having survived the worst. It represents healing, inspiration, and a renewed connection to the divine.', love: null, career: 'A period of healing and renewed hope. Trust that better days are coming.', shadow: ['Where have I lost hope?', 'What part of me needs the medicine of the stars?'], affirmations: ['I align with hope and renewal.', 'The stars guide me toward my highest good.'] },
  { cardName: 'The Moon', tags: ['illusion', 'intuition', 'subconscious', 'fear'], summary: 'Navigate the waters of the unconscious with courage.', general: 'The Moon represents the realm of the unconscious — where things are not always as they seem, where shadows loom large, and where following your intuition is both necessary and treacherous.', love: null, career: 'Trust your instincts but verify your perceptions. Not everything is as it appears.', shadow: ['What fears are playing tricks on me?', 'Where am I avoiding looking at something I need to see?'], affirmations: ['I trust my intuition through the darkness.', 'I face my shadows with courage and compassion.'] },
  { cardName: 'The Sun', tags: ['positivity', 'success', 'joy', 'vitality'], summary: 'Bathe in the light of your own radiance.', general: 'The Sun represents joy, success, vitality, and the pure light that comes from aligning with your true self. It is the Tarot card most associated with happiness and warmth.', love: null, career: 'A period of success and recognition. Enjoy the warmth of your achievements.', shadow: ['Where have I dimmed my own light?', 'What prevents me from fully accepting my success?'], affirmations: ['I shine with the light of my authentic self.', 'I bask in the warmth of my own success.'] },
  { cardName: 'Judgement', tags: ['judgement', 'rebirth', 'calling', 'absolution'], summary: 'Answer the call that awakens your highest self.', general: 'Judgement represents the moment of awakening — when you hear the call to become who you were always meant to be. It is a card of reckoning, resurrection, and the honouring of your soul journey.', love: null, career: 'A calling may be emerging from within you. Are you ready to answer?', shadow: ['What calling am I afraid to answer?', 'What is my inner critic preventing me from becoming?'], affirmations: ['I answer the call of my highest self.', 'I am reborn into my truest purpose.'] },
  { cardName: 'The World', tags: ['completion', 'integration', 'accomplishment', 'travel'], summary: 'Complete the cycle and celebrate the journey.', general: 'The World represents completion — the end of a cycle, the achievement of a goal, the integration of everything learned. It asks you to acknowledge the journey and celebrate how far you have come.', love: null, career: 'A major chapter is completing. Take time to acknowledge your accomplishments.', shadow: ['What have I learned that I can now integrate?', 'How can I celebrate this completion?'], affirmations: ['I complete this cycle with gratitude.', 'I integrate all I have learned into my whole self.'] },
];

// ─── TAROT SPREADS DATA ───────────────────────────────────────────────────────

const TAROT_SPREADS: TarotSpread[] = [
  { id: 'three-cards', name: 'Three Cards', name_pt: 'Três Cartas', cards: 3, positions: ['Past', 'Present', 'Future'], description: 'A simple past-present-future spread for quick insights.', description_pt: 'Uma simples leitura de passado-presente-futuro para insights rápidos.' },
  { id: 'cross', name: 'Celtic Cross', name_pt: 'Cruz Celta', cards: 10, positions: ['Significator', 'Challenge', 'Past', 'Present', 'Future', 'Above', 'Below', 'Attitude', 'House', 'Outcome'], description: 'The classic ten-card Celtic Cross spread for deep readings.', description_pt: 'A clássica leitura de dez cartas da Cruz Celta para leituras profundas.' },
  { id: 'horseshoe', name: 'Horseshoe', name_pt: 'Ferradura', cards: 7, positions: ['Past', 'Present', 'Future', 'Root Cause', 'Obstacle', 'Foundation', 'Outcome'], description: 'A seven-card spread focusing on causes and outcomes.', description_pt: 'Uma leitura de sete cartas focada em causas e resultados.' },
  { id: 'relationship', name: 'Relationship', name_pt: 'Relacionamento', cards: 6, positions: ['You', 'Them', 'Connection', 'Your Needs', 'Their Needs', 'Outcome'], description: 'A spread for understanding relationship dynamics.', description_pt: 'Uma leitura para entender a dinâmica do relacionamento.' },
  { id: 'career', name: 'Career Path', name_pt: 'Caminho Profissional', cards: 5, positions: ['Current State', 'Challenge', 'Hidden Factor', 'Foundation', 'Outcome'], description: 'A spread for career and professional guidance.', description_pt: 'Uma leitura para orientação profissional e de carreira.' },
];

// ─── CONFIGURATION DATA ──────────────────────────────────────────────────────

const TAROT_CONFIG: TarotConfiguration[] = [
  { key: 'version', value: '2.0', updatedAt: '2026-05-28' },
  { key: 'totalCards', value: '78', updatedAt: '2026-05-28' },
  { key: 'majorArcana', value: '22', updatedAt: '2026-05-28' },
  { key: 'minorArcana', value: '56', updatedAt: '2026-05-28' },
];

// ─── PRIMARY DATA STRUCTURE ──────────────────────────────────────────────────

const TAROT_DATA = {
  version: '2.0',
  totalCards: 78,
  majorArcanaCount: 22,
  minorArcanaCount: 56,
  lastUpdated: '2026-05-28',
};

// ─── GET HANDLER ─────────────────────────────────────────────────────────────

// GET /api/tarot/v2/data - Get tarot v2 data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const card = searchParams.get('card');
    const spread = searchParams.get('spread');

    // Return specific card by number/ID
    if (card) {
      const cardNum = parseInt(card, 10);
      if (isNaN(cardNum)) {
        // Try finding by name
        const cardName = card.toLowerCase().replace(/[^a-z\s]/g, '').trim();
        const allCards = [...MAJOR_ARCANA_CARDS, ...MINOR_ARCANA_CARDS];
        const foundCard = allCards.find((c) => 
          c.name.toLowerCase().includes(cardName) || 
          cardName.includes(c.name.toLowerCase())
        );
        if (!foundCard) {
          return NextResponse.json(
            { success: false, error: 'Card not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: foundCard });
      }
      
      const allCards = [...MAJOR_ARCANA_CARDS, ...MINOR_ARCANA_CARDS];
      const cardData = allCards.find((c) => c.id === cardNum);
      if (!cardData) {
        return NextResponse.json(
          { success: false, error: 'Card not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: cardData });
    }

    // Return specific tarot spread by ID
    if (spread) {
      const spreadData = TAROT_SPREADS.find((s) => s.id === spread);
      if (!spreadData) {
        return NextResponse.json(
          { success: false, error: 'Spread not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: spreadData });
    }

    // Return specific tarot data by ID
    if (id) {
      // Check cards
      const cardNum = parseInt(id, 10);
      if (!isNaN(cardNum)) {
        const allCards = [...MAJOR_ARCANA_CARDS, ...MINOR_ARCANA_CARDS];
        const cardData = allCards.find((c) => c.id === cardNum);
        if (cardData) {
          return NextResponse.json({ success: true, data: cardData });
        }
      }

      // Check special IDs
      if (id === 'major' || id === 'majorArcana') {
        return NextResponse.json({ success: true, data: MAJOR_ARCANA_CARDS });
      }
      if (id === 'minor' || id === 'minorArcana') {
        return NextResponse.json({ success: true, data: MINOR_ARCANA_CARDS });
      }
      if (id === 'spreads') {
        return NextResponse.json({ success: true, data: TAROT_SPREADS });
      }
      if (id === 'interpretations') {
        return NextResponse.json({ success: true, data: MAJOR_ARCANA_INTERPRETATIONS });
      }
      if (id === 'tarot-primary' || id === 'primary') {
        return NextResponse.json({ success: true, data: TAROT_DATA });
      }
      if (id === 'decks') {
        return NextResponse.json({
          success: true,
          data: {
            major: MAJOR_ARCANA_CARDS,
            minor: MINOR_ARCANA_CARDS,
            total: 78,
          },
        });
      }

      // Check spreads by ID
      const spreadData = TAROT_SPREADS.find((s) => s.id === id);
      if (spreadData) {
        return NextResponse.json({ success: true, data: spreadData });
      }

      return NextResponse.json(
        { success: false, error: 'Tarot data not found' },
        { status: 404 }
      );
    }

    // Return specific type of tarot data
    if (type === 'major' || type === 'majorArcana') {
      return NextResponse.json({ success: true, data: MAJOR_ARCANA_CARDS });
    }

    if (type === 'minor' || type === 'minorArcana') {
      return NextResponse.json({ success: true, data: MINOR_ARCANA_CARDS });
    }

    if (type === 'spreads') {
      return NextResponse.json({ success: true, data: TAROT_SPREADS });
    }

    if (type === 'interpretations') {
      return NextResponse.json({ success: true, data: MAJOR_ARCANA_INTERPRETATIONS });
    }

    if (type === 'config') {
      return NextResponse.json({ success: true, data: TAROT_CONFIG });
    }

    if (type === 'categories') {
      return NextResponse.json({
        success: true,
        data: {
          major: MAJOR_ARCANA_CARDS.length,
          minor: MINOR_ARCANA_CARDS.length,
          spreads: TAROT_SPREADS.length,
          interpretations: MAJOR_ARCANA_INTERPRETATIONS.length,
        },
      });
    }

    if (type === 'decks') {
      return NextResponse.json({
        success: true,
        data: {
          major: MAJOR_ARCANA_CARDS,
          minor: MINOR_ARCANA_CARDS,
          total: 78,
        },
      });
    }

    // Default: return all tarot v2 data
    return NextResponse.json({
      success: true,
      data: {
        tarot: TAROT_DATA,
        major: MAJOR_ARCANA_CARDS,
        minor: MINOR_ARCANA_CARDS,
        spreads: TAROT_SPREADS,
        interpretations: MAJOR_ARCANA_INTERPRETATIONS,
        config: TAROT_CONFIG,
      },
    });
  } catch (error) {
    console.error('Tarot v2 API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}