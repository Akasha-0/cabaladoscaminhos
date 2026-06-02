// Tarot Card Meanings — all 78 cards, upright and reversed
// Skip linting and formatting

export interface CardMeaning {
  name: string;
  upright: string;
  reversed: string;
}

export interface TarotDeck {
  majorArcana: CardMeaning[];
  minorArcana: {
    wands: CardMeaning[];
    cups: CardMeaning[];
    swords: CardMeaning[];
    pentacles: CardMeaning[];
  };
}

const majorArcana: CardMeaning[] = [
  {
    name: "The Fool",
    upright: "New beginnings, innocence, spontaneity, free spirit",
    reversed: "Recklessness, risk-taking, holding back, naivety",
  },
  {
    name: "The Magician",
    upright: "Manifestation, resourcefulness, power, inspired action",
    reversed: "Deception, trickery, manipulation, unused talent",
  },
  {
    name: "The High Priestess",
    upright: "Intuition, sacred knowledge, divine feminine, the subconscious mind",
    reversed: "Secrets, disconnected from intuition, withdrawal",
  },
  {
    name: "The Empress",
    upright: "Femininity, beauty, nature, nurturing, abundance",
    reversed: "Creative block, dependence, emptiness, neglect",
  },
  {
    name: "The Emperor",
    upright: "Authority, structure, control, fatherhood, stability",
    reversed: "Domination, excessive control, rigidity, lack of discipline",
  },
  {
    name: "The Hierophant",
    upright: "Spiritual wisdom, tradition, conformity, morality, ethics",
    reversed: "Personal beliefs, freedom, challenging the status quo",
  },
  {
    name: "The Lovers",
    upright: "Love, harmony, relationships, values alignment, choices",
    reversed: "Self-love, disharmony, imbalance, misalignment of values",
  },
  {
    name: "The Chariot",
    upright: "Control, willpower, success, action, determination",
    reversed: "Self-discipline, opposition, lack of direction, aggression",
  },
  {
    name: "Strength",
    upright: "Courage, persuasion, influence, compassion, inner strength",
    reversed: "Inner strength, self-doubt, raw emotion, overwhelm",
  },
  {
    name: "The Hermit",
    upright: "Soul-searching, introspection, inner guidance, solitude",
    reversed: "Isolation, loneliness, withdrawal, coming together",
  },
  {
    name: "Wheel of Fortune",
    upright: "Good luck, karma, life cycles, destiny, turning point",
    reversed: "Bad luck, resistance to change, breaking cycles",
  },
  {
    name: "Justice",
    upright: "Justice, fairness, truth, cause and effect, law",
    reversed: "Unfairness, lack of accountability, dishonesty",
  },
  {
    name: "The Hanged Man",
    upright: "Pause, surrender, letting go, new perspectives",
    reversed: "Delays, resistance, stalling, indecision",
  },
  {
    name: "Death",
    upright: "Endings, change, transformation, transition",
    reversed: "Resistance to change, personal transformation, inner purging",
  },
  {
    name: "Temperance",
    upright: "Balance, moderation, patience, purpose, meaning",
    reversed: "Imbalance, excess, self-healing, realignment",
  },
  {
    name: "The Devil",
    upright: "Shadow self, attachment, addiction, restriction",
    reversed: "Releasing limiting beliefs, exploring dark thoughts, detachment",
  },
  {
    name: "The Tower",
    upright: "Sudden change, upheaval, chaos, revelation, awakening",
    reversed: "Personal transformation, fear of change, averting disaster",
  },
  {
    name: "The Star",
    upright: "Hope, faith, purpose, renewal, spirituality",
    reversed: "Lack of faith, despair, self-trust, disconnection",
  },
  {
    name: "The Moon",
    upright: "Illusion, fear, anxiety, subconscious, intuition",
    reversed: "Release of fear, repressed emotion, inner confusion",
  },
  {
    name: "The Sun",
    upright: "Positivity, fun, warmth, success, vitality",
    reversed: "Inner child, feeling down, overly optimistic",
  },
  {
    name: "Judgement",
    upright: "Judgement, rebirth, inner calling, absolution",
    reversed: "Self-doubt, inner critic, ignoring the call",
  },
  {
    name: "The World",
    upright: "Completion, integration, accomplishment, travel",
    reversed: "Seeking personal closure, short-cuts, delays",
  },
];

const wands: CardMeaning[] = [
  {
    name: "Ace of Wands",
    upright: "Inspiration, new opportunities, growth, potential",
    reversed: "Emerging ideas, lack of direction, delays",
  },
  {
    name: "Two of Wands",
    upright: "Future planning, progress, decisions, discovery",
    reversed: "Personal goals, inner alignment, fear of unknown",
  },
  {
    name: "Three of Wands",
    upright: "Progress, expansion, foresight, overseas opportunities",
    reversed: "Playing small, lack of foresight, delays in plans",
  },
  {
    name: "Four of Wands",
    upright: "Celebration, harmony, marriage, home, community",
    reversed: "Personal celebration, inner harmony, conflict",
  },
  {
    name: "Five of Wands",
    upright: "Conflict, disagreements, competition, tension",
    reversed: "Inner conflict, conflict avoidance, release of tension",
  },
  {
    name: "Six of Wands",
    upright: "Success, public recognition, progress, self-confidence",
    reversed: "Inner success, fall from grace, egotism",
  },
  {
    name: "Seven of Wands",
    upright: "Challenge, competition, protection, perseverance",
    reversed: "Exhaustion, giving up, overwhelmed",
  },
  {
    name: "Eight of Wands",
    upright: "Speed, action, movement, quick decisions",
    reversed: "Delays, frustration, resisting change",
  },
  {
    name: "Nine of Wands",
    upright: "Resilience, courage, persistence, test of faith",
    reversed: "Inner resources, struggle, overwhelm",
  },
  {
    name: "Ten of Wands",
    upright: "Burden, responsibility, hard work, stress",
    reversed: "Doing it all, delegation, release of burden",
  },
  {
    name: "Page of Wands",
    upright: "Inspiration, ideas, discovery, free spirit",
    reversed: "Newly found passion, set backs, lack of direction",
  },
  {
    name: "Knight of Wands",
    upright: "Energy, passion, action, adventure, impulsiveness",
    reversed: "Passion project, haste, scattered energy",
  },
  {
    name: "Queen of Wands",
    upright: "Courage, confidence, independence, social butterfly",
    reversed: "Self-assurance, introverted, re-establish self",
  },
  {
    name: "King of Wands",
    upright: "Natural leader, vision, entrepreneur, honor",
    reversed: "Impulsiveness, haste, ruthless, high expectations",
  },
];

const cups: CardMeaning[] = [
  {
    name: "Ace of Cups",
    upright: "New feelings, spirituality, intuition, love",
    reversed: "Self-love, intuition, repressed emotions",
  },
  {
    name: "Two of Cups",
    upright: "Unified love, partnership, mutual attraction",
    reversed: "Self-love, break-ups, disharmony",
  },
  {
    name: "Three of Cups",
    upright: "Celebration, friendship, creativity, collaborations",
    reversed: "Independence, alone time, hardcore partying",
  },
  {
    name: "Four of Cups",
    upright: "Meditation, contemplation, apathy, reevaluation",
    reversed: "Sudden awareness, choosing happiness, acceptance",
  },
  {
    name: "Five of Cups",
    upright: "Regret, failure, disappointment, pessimism",
    reversed: "Personal setbacks, self-forgiveness, moving on",
  },
  {
    name: "Six of Cups",
    upright: "Revisiting the past, childhood memories, innocence, joy",
    reversed: "Living in the past, forgiveness, lacking playfulness",
  },
  {
    name: "Seven of Cups",
    upright: "Opportunities, choices, wishful thinking, illusion",
    reversed: "Alignment, personal values, overwhelmed by choices",
  },
  {
    name: "Eight of Cups",
    upright: "Disappointment, abandonment, withdrawal, escapism",
    reversed: "Trying one more time, indecision, aimless drifting",
  },
  {
    name: "Nine of Cups",
    upright: "Contentment, satisfaction, gratitude, wish fulfilled",
    reversed: "Inner happiness, materialism, dissatisfaction",
  },
  {
    name: "Ten of Cups",
    upright: "Divine love, blissful relationships, harmony, alignment",
    reversed: "Unfulfilled dreams, inner alignment, struggle",
  },
  {
    name: "Page of Cups",
    upright: "Creative opportunities, intuitive messages, curiosity",
    reversed: "Inner child healing, private intuition, emotional immaturity",
  },
  {
    name: "Knight of Cups",
    upright: "Creativity, romance, charm, imagination, beauty",
    reversed: "Overactive imagination, unrealistic, jealousy",
  },
  {
    name: "Queen of Cups",
    upright: "Compassionate, caring, emotionally stable, intuitive",
    reversed: "Inner feelings, self-care, self-love",
  },
  {
    name: "King of Cups",
    upright: "Emotionally balanced, compassionate, diplomatic",
    reversed: "Self-compassion, inner feelings, moodiness",
  },
];

const swords: CardMeaning[] = [
  {
    name: "Ace of Swords",
    upright: "Breakthroughs, clarity, sharp mind, truth",
    reversed: "Inner clarity, re-thinking, clouded judgement",
  },
  {
    name: "Two of Swords",
    upright: "Difficult choices, indecision, stalemate, blocked emotions",
    reversed: "Indecision, confusion, information overload",
  },
  {
    name: "Three of Swords",
    upright: "Heartbreak, emotional pain, sorrow, grief",
    reversed: "Negative self-talk, releasing pain, optimism",
  },
  {
    name: "Four of Swords",
    upright: "Rest, relaxation, meditation, contemplation, recuperation",
    reversed: "Exhaustion, burn-out, deep contemplation",
  },
  {
    name: "Five of Swords",
    upright: "Conflict, disagreements, competition, defeat, winning at all costs",
    reversed: "Reconciliation, making amends, past resentment",
  },
  {
    name: "Six of Swords",
    upright: "Transition, change, rite of passage, releasing baggage",
    reversed: "Personal transition, resistance, unfinished business",
  },
  {
    name: "Seven of Swords",
    upright: "Betrayal, deception, getting away with something, strategy",
    reversed: "Imposter syndrome, self-deceit, truth revealed",
  },
  {
    name: "Eight of Swords",
    upright: "Imprisonment, entrapment, self-victimization, limiting beliefs",
    reversed: "Self-acceptance, new perspective, freedom",
  },
  {
    name: "Nine of Swords",
    upright: "Anxiety, worry, fear, depression, nightmares",
    reversed: "Inner turmoil, deep-seated fears, releasing worry",
  },
  {
    name: "Ten of Swords",
    upright: "Painful endings, deep wounds, betrayal, loss, crisis",
    reversed: "Recovery, regeneration, resisting an inevitable end",
  },
  {
    name: "Page of Swords",
    upright: "New ideas, curiosity, thirst for knowledge, communication",
    reversed: "Self-expression, all talk and no action, haste",
  },
  {
    name: "Knight of Swords",
    upright: "Ambitious, action-oriented, driven, fast-thinking",
    reversed: "Restless, unfocused, impulsive, burn-out",
  },
  {
    name: "Queen of Swords",
    upright: "Independent, unbiased judgement, clear boundaries, direct",
    reversed: "Overly emotional, easily influenced, cold-hearted",
  },
  {
    name: "King of Swords",
    upright: "Intellectual power, authority, truth, clear thinking",
    reversed: "Inner truth, misuse of power, manipulation",
  },
];

const pentacles: CardMeaning[] = [
  {
    name: "Ace of Pentacles",
    upright: "New financial opportunity, manifestation, abundance",
    reversed: "Lost opportunity, lack of planning, scarcity mindset",
  },
  {
    name: "Two of Pentacles",
    upright: "Multiple priorities, time management, prioritization, adaptability",
    reversed: "Over-committed, disorganization, reprioritization",
  },
  {
    name: "Three of Pentacles",
    upright: "Teamwork, collaboration, learning, implementation",
    reversed: "Disharmony, misalignment, working alone",
  },
  {
    name: "Four of Pentacles",
    upright: "Saving money, security, conservatism, scarcity",
    reversed: "Over-spending, greed, self-protection",
  },
  {
    name: "Five of Pentacles",
    upright: "Financial loss, poverty, lack mindset, isolation",
    reversed: "Recovery from loss, spiritual poverty, re-evaluation",
  },
  {
    name: "Six of Pentacles",
    upright: "Giving, receiving, sharing wealth, generosity",
    reversed: "Self-care, unpaid debts, one-sided charity",
  },
  {
    name: "Seven of Pentacles",
    upright: "Long-term view, sustainable results, perseverance, investment",
    reversed: "Lack of long-term vision, limited success, impatience",
  },
  {
    name: "Eight of Pentacles",
    upright: "Apprenticeship, repetitive tasks, mastery, skill development",
    reversed: "Self-development, perfectionism, misdirected effort",
  },
  {
    name: "Nine of Pentacles",
    upright: "Abundance, luxury, self-sufficiency, financial independence",
    reversed: "Self-worth, over-investment in work, hustle culture",
  },
  {
    name: "Ten of Pentacles",
    upright: "Wealth, inheritance, family, establishment, retirement",
    reversed: "Financial failure, loneliness, loss of family",
  },
  {
    name: "Page of Pentacles",
    upright: "Manifestation, financial opportunity, skill development",
    reversed: "Lack of progress, procrastination, learn from failure",
  },
  {
    name: "Knight of Pentacles",
    upright: "Efficiency, routine, conservatism, hard work",
    reversed: "Self-discipline, boredom, feeling stuck",
  },
  {
    name: "Queen of Pentacles",
    upright: "Nurturing, practical, providing, down-to-earth",
    reversed: "Self-care, work-home conflict, financial independence",
  },
  {
    name: "King of Pentacles",
    upright: "Wealth, business, leadership, security, discipline",
    reversed: "Financially inept, obsessed with wealth, stubborn",
  },
];

export const tarotDeck: TarotDeck = {
  majorArcana,
  minorArcana: { wands, cups, swords, pentacles },
};

/** Returns all 78 card meanings flat */
export function getAllMeanings(): CardMeaning[] {
  return [
    ...majorArcana,
    ...wands,
    ...cups,
    ...swords,
    ...pentacles,
  ];
}

/** Looks up a card by name (case-insensitive, partial match) */
export function getCardMeaning(name: string): CardMeaning | undefined {
  const lower = name.toLowerCase().trim();
  return getAllMeanings().find(
    (c) => c.name.toLowerCase() === lower || c.name.toLowerCase().includes(lower)
  );
}