/**
 * Tarot card meanings for all 78 cards
 * Organized by Major Arcana (22 cards) and Minor Arcana (56 cards)
 */

export interface CardMeaning {
  name: string;
  keywords: string[];
  upright: string;
  reversed: string;
}

export interface TarotCardMeanings {
  majorArcana: CardMeaning[];
  minorArcana: {
    wands: CardMeaning[];
    cups: CardMeaning[];
    swords: CardMeaning[];
    pentacles: CardMeaning[];
  };
}

const MAJOR_ARCANA: CardMeaning[] = [
  {
    name: "The Fool",
    keywords: ["new beginnings", "innocence", "spontaneity", "free spirit"],
    upright: "A new journey full of possibilities. Trust in the path ahead, even without a clear plan. Embrace spontaneity and have faith that everything will work out.",
    reversed: "Recklessness, fear of change, holding back. Naivety or being taken advantage of. A warning to think before acting."
  },
  {
    name: "The Magician",
    keywords: ["willpower", "creation", "manifestation", "power"],
    upright: "You have all the tools and resources needed to succeed. Focus your intentions and take decisive action. Your potential is limitless.",
    reversed: "Manipulation, poor planning, untapped talents. Deception or using skills for selfish purposes. A call to examine your motivations."
  },
  {
    name: "The High Priestess",
    keywords: ["intuition", "sacred knowledge", "divine feminine", "mystery"],
    upright: "Trust your inner voice and the wisdom within. Secrets are being revealed. Look beyond the surface and trust your instincts.",
    reversed: "Hidden agendas, withdrawal, need to trust intuition. Secrets surfacing that may be unsettling. A reminder to listen to your gut."
  },
  {
    name: "The Empress",
    keywords: ["abundance", "femininity", "motherhood", "creativity"],
    upright: "Nurturing energy and creative expression flourishing. A time of growth, prosperity, and natural beauty. Embrace your nurturing side.",
    reversed: "Creative block, dependence, emptiness. Over-bearing or smothering behavior. A need to reconnect with your creative source."
  },
  {
    name: "The Emperor",
    keywords: ["authority", "structure", "control", "fatherhood"],
    upright: "Establish firm foundations and take control of your destiny. Leadership through experience and discipline. Build structure in your life.",
    reversed: "Domination, excessive control, rigidity. Lack of discipline or abuse of power. A warning against becoming too rigid or dictatorial."
  },
  {
    name: "The Hierophant",
    keywords: ["spiritual wisdom", "tradition", "conformity", "education"],
    upright: "Seek guidance from established systems and traditions. A time for learning, spiritual growth, and finding your place within community.",
    reversed: "Personal beliefs, freedom, challenging the status quo. Non-conformity and questioning traditional paths. May indicate need to find your own spiritual way."
  },
  {
    name: "The Lovers",
    keywords: ["love", "harmony", "relationships", "choices"],
    upright: "A powerful connection and alignment of values. Deep romantic love or an important life decision. Union and balance between opposites.",
    reversed: "Self-love, disharmony, imbalance. Misaligned values or relationship challenges. Difficult choices that require deep introspection."
  },
  {
    name: "The Chariot",
    keywords: ["willpower", "determination", "success", "control"],
    upright: "Victory through confidence and focus. Harness opposing forces and steer them toward your goal. Assertive action leads to triumph.",
    reversed: "Self-discipline, opposition, lack of control. Aggression or moving too fast. A need to reassess direction before proceeding."
  },
  {
    name: "Strength",
    keywords: ["courage", "perseverance", "compassion", "inner strength"],
    upright: "Inner power and gentle strength overcome challenges. Show compassion and courage. True strength comes from within, not from force.",
    reversed: "Inner strength, self-doubt, raw emotion. Weakness or letting your temper control you. A reminder to find strength through patience."
  },
  {
    name: "The Hermit",
    keywords: ["introspection", "solitude", "self-discovery", "inner guidance"],
    upright: "A period of introspection and seeking deeper truths. Soul-searching and reflection. Trust the journey inward to find answers.",
    reversed: "Isolation, loneliness, withdrawal. Too much solitude leading to isolation. Finding guidance within rather than without."
  },
  {
    name: "Wheel of Fortune",
    keywords: ["change", "cycles", "fate", "destiny"],
    upright: "A turning point in life. Good luck and positive change coming. Embrace the cycles of life and go with the flow.",
    reversed: "Bad luck, resistance to change, breaking cycles. External forces keeping you stuck. A need to work with change rather than against it."
  },
  {
    name: "Justice",
    keywords: ["fairness", "truth", "cause and effect", "law"],
    upright: "Truth and honesty prevail. Actions have consequences. Fair decisions and karmic balance. Legal matters may be resolved.",
    reversed: "Unfairness, lack of accountability, dishonesty. Refusing to take responsibility. A call for deeper truth and fairness."
  },
  {
    name: "The Hanged Man",
    keywords: ["surrender", "new perspective", "letting go", "pause"],
    upright: "Pause and gain a new viewpoint by seeing from a different angle. Willing sacrifice leads to insight. Let go of control.",
    reversed: "Delays, resistance, stalling. Need to make a decision but feeling stuck. A suspended state waiting for action."
  },
  {
    name: "Death",
    keywords: ["endings", "change", "transformation", "transition"],
    upright: "Profound transformation and endings making way for new beginnings. Deep change in progress. Let go of what no longer serves you.",
    reversed: "Resistance to change, personal transformation, inner purging. Fear of endings or fighting natural transitions. Slow but necessary changes."
  },
  {
    name: "Temperance",
    keywords: ["balance", "patience", "purpose", "meaning"],
    upright: "Finding middle ground and balance. Moderate your actions and find peace. Blend opposites with patience and purpose.",
    reversed: "Imbalance, excess, self-healing. Extreme behavior or lack of moderation. A need to find balance in your life."
  },
  {
    name: "The Devil",
    keywords: ["shadow self", "attachment", "addiction", "materialism"],
    upright: "Bondage to addictive patterns or negative influences. Face your shadows and liberate yourself. Material attachment holding you back.",
    reversed: "Releasing shame, recovering control, re-evaluating your path. Breaking free from chains. A turning point for positive change."
  },
  {
    name: "The Tower",
    keywords: ["sudden change", "upheaval", "revelation", "awakening"],
    upright: "Sudden upheaval leading to clarity. Breakthrough and awakening through disruption. Structures crumbling to reveal truth.",
    reversed: "Personal transformation, fear of change, resisting the truth. Averting disaster or internal revolution. Change coming whether you're ready or not."
  },
  {
    name: "The Star",
    keywords: ["hope", "faith", "purpose", "renewal"],
    upright: "Genuine hope and faith fill you with inspiration. Healing and renewal. After struggle comes inspiration and guidance toward your purpose.",
    reversed: "Lack of faith, despair, self-trust. Disconnection from your inspiration. A temporary disconnection with your inner light."
  },
  {
    name: "The Moon",
    keywords: ["illusion", "fear", "anxiety", "subconscious"],
    upright: "Hidden fears and unconscious anxieties surfacing. Intuition may be clouded. Navigate through uncertainty with care. Things may not be what they seem.",
    reversed: "Release of fear, repressed emotion, inner clarity. Facing your fears and finding clarity. Confusion lifting as you confront reality."
  },
  {
    name: "The Sun",
    keywords: ["positivity", "success", "vitality", "joy"],
    upright: "Radiant success and joy illuminate your path. Vitality and warmth. A time of happiness, optimism, and fulfillment. Achievement and celebration.",
    reversed: "Inner child, feeling down, overly optimistic. Temporary setbacks or feeling less than confident. A temporary cloud over otherwise bright prospects."
  },
  {
    name: "Judgement",
    keywords: ["judgment", "rebirth", "inner calling", "absolution"],
    upright: "A calling to higher purpose and soul purpose. Judgment and accountability with mercy. A spiritual awakening and answering your calling.",
    reversed: "Self-doubt, inner critic, ignoring the call. Harsh self-judgment or feeling called out unfairly. A need to trust your own inner voice."
  },
  {
    name: "The World",
    keywords: ["completion", "integration", "accomplishment", "travel"],
    upright: "Achievement and completion of a major life cycle. Integration of lessons learned. Success and fulfillment. A major milestone reached.",
    reversed: "Seeking personal closure, short-cuts, delays. Incomplete endings or lack of closure. A pause before completion."
  }
];

const WANDS: CardMeaning[] = [
  {
    name: "Ace of Wands",
    keywords: ["inspiration", "new opportunities", "growth", "potential"],
    upright: "A spark of creative energy and inspiration. New ventures and opportunities emerging. Boundless potential and the beginning of something exciting.",
    reversed: "Delays, frustration, lack of motivation. Creative blocks or lost opportunities. A creative flame dimming or waiting to be reignited."
  },
  {
    name: "Two of Wands",
    keywords: ["planning", "decisions", "discovery"],
    upright: "Planning and contemplating future moves. A need to step out of your comfort zone. A decision to be made about your next direction.",
    reversed: "Personal goals, inner alignment, fear of unknown. Lack of planning or being too fixed in your ways. Opportunity to explore new horizons."
  },
  {
    name: "Three of Wands",
    keywords: ["expansion", "foresight", "overseas"],
    upright: "Progress, expansion, and looking ahead. Your efforts are beginning to show fruit. Patience required for plans to manifest.",
    reversed: "Playing small, lack of forward planning, delays in receiving help. Obstacles or delays to your progress. Re-evaluating your direction."
  },
  {
    name: "Four of Wands",
    keywords: ["celebration", "harmony", "marriage", "home"],
    upright: "Community harmony and joyful celebration. A wedding, housewarming, or family reunion. Success recognized by your community.",
    reversed: "Disconnection, lack of support, conflict within community. Unstable living situation or resistance to group harmony. Working through conflict."
  },
  {
    name: "Five of Wands",
    keywords: ["conflict", "disagreement", "diversity", "competition"],
    upright: "Conflict and competition bring creative tension. Diversity of thought and viewpoints. A battle of ideas or competing interests.",
    reversed: "Avoiding conflict, respecting differences. Inner conflict or finding peace within. Winning over competition by changing strategy."
  },
  {
    name: "Six of Wands",
    keywords: ["success", "public recognition", "progress", "self-confidence"],
    upright: "Victory and public recognition. Success and recognition of achievements. Confidence and pride in your accomplishments.",
    reversed: "Failure, lack of recognition, fall from grace. Private success or ego-driven victories. Reassessing what success means to you."
  },
  {
    name: "Seven of Wands",
    keywords: ["challenge", "perseverance", "defense"],
    upright: "Standing your ground and defending your position. Challenges test your determination. You have the strength to overcome.",
    reversed: "Overwhelmed, giving up, being too defensive. Exhaustion from defending your position. Yielding or finding a different approach."
  },
  {
    name: "Eight of Wands",
    keywords: ["action", "movement", "fast pace", "progress"],
    upright: "Rapid progress and swift action. Things moving quickly and smoothly. Travel or communication flowing effortlessly.",
    reversed: "Delays, frustration, waiting for news. Friction or slow progress. Unexpected obstacles creating delays."
  },
  {
    name: "Nine of Wands",
    keywords: ["resilience", "courage", "persistence", "test of faith"],
    upright: "Last stands and perseverance. You've been through challenges and can handle more. Determination and courage to see things through.",
    reversed: "Inner resources, struggle, overwhelm. Exhaustion or feeling nearly defeated. Paranoia or being surrounded by enemies that don't exist."
  },
  {
    name: "Ten of Wands",
    keywords: ["burden", "responsibility", "hard work", "stress"],
    upright: "Heavy burdens and responsibilities weighing you down. Carrying the load alone when help is available. Work hard to achieve goals.",
    reversed: "Doing it all, delegation, release of burden. Trying to do everything yourself. Learning to share responsibilities or let some things go."
  },
  {
    name: "Page of Wands",
    keywords: ["exploration", "excitement", "freedom", "discovery"],
    upright: "A messenger of passion and inspiration. New creative ventures or journeys. Enthusiasm and curiosity spark new adventures.",
    reversed: "Newly found passion, delays, distracted. Lack of direction or motivation. Creative blocks or second-guessing yourself."
  },
  {
    name: "Knight of Wands",
    keywords: ["energy", "passion", "adventure", "impulsiveness"],
    upright: "Passionate energy and action. Charging toward your goals with enthusiasm. Spontaneous and bold, ready for adventure.",
    reversed: "Anger, impulses, passion without direction. Rushing into things without thought. Delays or finding a more grounded approach."
  },
  {
    name: "Queen of Wands",
    keywords: ["courage", "confidence", "independence", "warmth"],
    upright: "Bold and confident energy. A warm, encouraging presence. Leadership with compassion and determination.",
    reversed: "Selfishness, jealousy, self-dependence. Harsh or demanding energy. Insecurity or seeking external validation."
  },
  {
    name: "King of Wands",
    keywords: ["vision", "leadership", "success", "boldness"],
    upright: "Natural born leader with big vision. Entrepreneurial spirit and success. Charismatic and inspiring others toward goals.",
    reversed: "Impulsiveness, haste, ruthless, high expectations. Domination or demanding behavior. Unrealistic goals or misuse of power."
  }
];

const CUPS: CardMeaning[] = [
  {
    name: "Ace of Cups",
    keywords: ["new feelings", "spiritual awakening", "love", "compassion"],
    upright: "A new beginning in love and emotional fulfillment. Overflowing compassion and spiritual insights. An open heart ready to receive.",
    reversed: "Self-love, intuition, repressed emotions. Emotional emptiness or inability to feel. Blocked feelings ready to be released."
  },
  {
    name: "Two of Cups",
    keywords: ["unions", "commitment", "attraction", "connection"],
    upright: "Partnership and mutual attraction. A meaningful connection or romantic bond. Harmony and shared values in relationships.",
    reversed: "Imbalanced relationship, breaking apart, incompatibility. Power struggles or one-sided emotional investment. Breaking away from unhealthy bonds."
  },
  {
    name: "Three of Cups",
    keywords: ["celebration", "friendship", "creativity", "collaboration"],
    upright: "Joyful celebrations with friends. Creative collaboration and community. Social gatherings and happy times together.",
    reversed: "Overindulgence, social complications, gossip. Too much partying or being pulled into drama. Third party interfering with relationships."
  },
  {
    name: "Four of Cups",
    keywords: ["meditation", "contemplation", "apathy", "reevaluation"],
    upright: "Dissatisfaction and withdrawn contemplation. Reevaluating what truly matters. Discontent or feeling disconnected from opportunities.",
    reversed: "Sudden awareness, choosing happiness, acceptance. Coming out of apathy and noticing what's around you. Acceptance and gratitude emerging."
  },
  {
    name: "Five of Cups",
    keywords: ["loss", "regret", "disappointment", "grief"],
    upright: "Deep loss and focusing on what's been missed. Regret and disappointment. The path forward requires leaving the past behind.",
    reversed: "Acceptance, moving on, finding peace. Recovery from loss or finding new meaning. Regret transforming into acceptance and hope."
  },
  {
    name: "Six of Cups",
    keywords: ["nostalgia", "memories", "innocence", "family"],
    upright: "Happy memories and nostalgic feelings. Innocence and childhood joy. Family connections and reconnecting with the past.",
    reversed: "Living in the past, naivety, Unrealistic. Stuck in memories or idealizing the past. Moving forward while honoring the past."
  },
  {
    name: "Seven of Cups",
    keywords: ["choices", "fantasy", "illusion", "wishful thinking"],
    upright: "Temptation and many choices. Daydreaming and fantasy. Discernment needed to separate reality from illusion.",
    reversed: "Alignment of values, personal priorities, better choices. Gaining clarity on what's really wanted. Taking a practical approach to fantasies."
  },
  {
    name: "Eight of Cups",
    keywords: ["walking away", "disappointment", "abandonment", "seeking truth"],
    upright: "Walking away from what no longer serves you. Moving on from disappointments. A journey inward to find deeper truth.",
    reversed: "Fear of change, fighting the tide, aimless drift. Avoiding change or unable to let go. Sleepless nights processing deep emotions."
  },
  {
    name: "Nine of Cups",
    keywords: ["contentment", "satisfaction", "gratitude", "wish fulfilled"],
    upright: "Emotional fulfillment and wishes coming true. Contentment and gratitude. A wish granted or emotional wish coming to pass.",
    reversed: "Inner happiness, materialism, dissatisfaction. Contentment within despite external circumstances. Seeking more or struggling with gratitude."
  },
  {
    name: "Ten of Cups",
    keywords: ["alignment", "family", "harmony", "emotional fulfillment"],
    upright: "Emotional fulfillment and harmony in the home. Family bliss and shared joy. Dreams coming true and lasting happiness.",
    reversed: "Disalignment, broken family, unfulfilled dreams. Family conflict or unrealistic expectations. Finding harmony even in imperfect situations."
  },
  {
    name: "Page of Cups",
    keywords: ["creative opportunities", "intuition", "curiosity", "exploration"],
    upright: "A creative, intuitive messenger. New emotional experiences or creative opportunities. Curiosity and wonder leading to discovery.",
    reversed: "Inner child healing, feeling insecure, emotionally immature. Creative blocks or emotional instability. Trusting intuition more."
  },
  {
    name: "Knight of Cups",
    keywords: ["romance", "charm", "imagination", "following the heart"],
    upright: "A romantic idealist and dreamer. Following your heart with charm and grace. Artistic pursuits and romantic adventures.",
    reversed: "Moodiness, unrealistic, jealousy. Being swept away by emotions or impractical decisions. Reining in fantasies to take practical action."
  },
  {
    name: "Queen of Cups",
    keywords: ["compassion", "intuition", "emotional security", "nurturing"],
    upright: "Deep compassion and emotional wisdom. Intuitive and nurturing energy. Creating safe emotional spaces for others.",
    reversed: "Inner feelings, self-protection, overwhelm. Over-giving or neglecting your own needs. Emotional insecurity and needing to protect yourself."
  },
  {
    name: "King of Cups",
    keywords: ["emotional balance", "diplomacy", "compassion", "calm"],
    upright: "Mastery of emotions and balanced leadership. Diplomatic and compassionate approach. Emotional maturity and wisdom.",
    reversed: "Self-compassion, inner feelings, moodiness. Emotional manipulation or volatility. Restoring balance between heart and mind."
  }
];

const SWORDS: CardMeaning[] = [
  {
    name: "Ace of Swords",
    keywords: ["clarity", "breakthrough", "new ideas", "truth"],
    upright: "Breakthrough and mental clarity. New ideas and cutting through confusion. A breakthrough moment bringing truth and clarity.",
    reversed: "Inner clarity, re-thinking, clouded judgment. Mental blocks or misuse of mental power. Finding clarity within despite confusion."
  },
  {
    name: "Two of Swords",
    keywords: ["indecision", "stalemate", "blocked emotions", "avoidance"],
    upright: "Blocked emotions and difficult decisions. Avoiding a choice or being paralyzed by fear. Need to trust your intuition.",
    reversed: "Indecision, confusion, information overload. Breaking the stalemate with new information. A decision that must be made despite uncertainty."
  },
  {
    name: "Three of Swords",
    keywords: ["heartbreak", "emotional pain", "grief", "sorrow"],
    upright: "Heartbreak and emotional pain. Grief and sorrow from loss or betrayal. Painful truth that must be faced to heal.",
    reversed: "Negative self-talk, releasing pain, optimism. Recovery from heartbreak or processing grief. Finding hope in difficult emotional times."
  },
  {
    name: "Four of Swords",
    keywords: ["rest", "recovery", "contemplation", "restoration"],
    upright: "Rest and recovery needed. A time of contemplation and withdrawal. Restoration through rest before returning to action.",
    reversed: "Exhaustion, burn-out, deep contemplation. Burnout or unable to rest despite needing to. Deeper reflection needed for true restoration."
  },
  {
    name: "Five of Swords",
    keywords: ["conflict", "defeat", "winning at all costs", "betrayal"],
    upright: "Conflict and defeat in competition. Winning at the expense of others. Burned bridges and the aftermath of betrayal.",
    reversed: "Reconciliation, making peace, conflict avoidance. Moving past defeat or choosing not to fight. Finding peace after conflict."
  },
  {
    name: "Six of Swords",
    keywords: ["transition", "leaving behind", "moving forward", "recovery"],
    upright: "Transition and moving toward calmer waters. Leaving difficulties behind. Recovery from trauma and moving forward.",
    reversed: "Personal transition, unfinished business, resisting change. Stuck in transition or refusing to move on. A long journey with difficulties ahead."
  },
  {
    name: "Seven of Swords",
    keywords: ["deception", "getting away with something", "strategy", "stealth"],
    upright: "Deception and questionable actions. Strategic thinking but potentially dishonest. Secrets and lies that may come to light.",
    reversed: "Imposter syndrome, self-deceit, truth revealed. Coming clean or being caught in deception. Facing the truth about your actions."
  },
  {
    name: "Eight of Swords",
    keywords: ["restriction", "imprisonment", "helplessness", "self-victimization"],
    upright: "Feeling trapped and restricted. Self-imposed limitations and feeling helpless. A situation where you may be your own prison.",
    reversed: "Self-acceptance, new perspective, freedom. Breaking free from self-imposed restrictions. A new way of seeing yourself and your situation."
  },
  {
    name: "Nine of Swords",
    keywords: ["anxiety", "worry", "fear", "nightmares"],
    upright: "Anxiety, worry, and deep fears. Nightmares and sleepless nights. Overwhelming mental anguish that feels unbearable.",
    reversed: "Inner turmoil, deep-seated fears, releasing worry. Facing fears or finding hope in darkness. Recovery from anxiety through support."
  },
  {
    name: "Ten of Swords",
    keywords: ["endings", "betrayal", "loss", "crisis"],
    upright: "A painful ending and total defeat. Betrayal and rock bottom. An ending so complete that only rebirth is possible.",
    reversed: "Recovery, regeneration, resisting an inevitable end. Recovery beginning or finding strength in adversity. An ending that is actually a new beginning."
  },
  {
    name: "Page of Swords",
    keywords: ["new ideas", "curiosity", "thirst for knowledge", "communication"],
    upright: "An eager messenger of truth and ideas. Curiosity and thirst for knowledge. Fresh perspectives and speaking your truth.",
    reversed: "Self-expression, all talk no action, haste. Scattered thoughts or speaking without thinking. Inner truth waiting to be expressed."
  },
  {
    name: "Knight of Swords",
    keywords: ["ambition", "action", "drive", "direction"],
    upright: "Ambitious and action-oriented. Charging toward goals with determination. Fast thinker and doer, sometimes too hasty.",
    reversed: "Restlessness, impatience, haste, driving without care. Burning out or making enemies through haste. Reassessing direction before continuing."
  },
  {
    name: "Queen of Swords",
    keywords: ["perception", "clear thinking", "independence", "direct communication"],
    upright: "Sharp perception and clear thinking. Independent and direct but compassionate. Wisdom and clear communication.",
    reversed: "Cold-hearted, cruel, bitingly honest. Harsh judgments or emotional manipulation. Over-critical thinking cutting off compassion."
  },
  {
    name: "King of Swords",
    keywords: ["authority", "truth", "clear thinking", "intellectual power"],
    upright: "Mastery of thought and authority through truth. Clear thinking and decisive action. Intellectual power with ethical use.",
    reversed: "Inner truth, misuse of power, manipulation. Abuse of authority or manipulative thinking. Seeking truth through self-reflection."
  }
];

const PENTACLES: CardMeaning[] = [
  {
    name: "Ace of Pentacles",
    keywords: ["opportunity", "prosperity", "new venture", "manifestation"],
    upright: "A new financial or career opportunity. Seeds of prosperity being planted. A material beginning with great potential.",
    reversed: "Lost opportunity, lack of planning, scarcity mindset. Missed chances or poor execution. Reframing financial opportunities."
  },
  {
    name: "Two of Pentacles",
    keywords: ["balance", "adaptability", "time management", "prioritization"],
    upright: "Juggling priorities and maintaining balance. Adaptability and flexibility needed. Time management and keeping things in perspective.",
    reversed: "Over-committed, disorganization, Imbalance. Dropping the ball or taking on too much. Finding balance through prioritization."
  },
  {
    name: "Three of Pentacles",
    keywords: ["teamwork", "collaboration", "learning", "implementation"],
    upright: "Teamwork and collaboration leading to success. Learning and mastery developing. Working together to implement plans.",
    reversed: "Disharmony, misalignment, working alone. Lack of teamwork or unrecognized contributions. Working solo but eventually finding support."
  },
  {
    name: "Four of Pentacles",
    keywords: ["security", "conservation", "control", "stability"],
    upright: "Holding tight to resources and control. Security and stability through careful management. Fear of losing what you have.",
    reversed: "Letting go, generosity, sharing wealth. Release control and open to abundance. Generosity and finding security through sharing."
  },
  {
    name: "Five of Pentacles",
    keywords: ["hardship", "isolation", "worry", "financial loss"],
    upright: "Financial difficulty and isolation. Feeling excluded or struggling alone. Worry and anxiety about basic needs.",
    reversed: "Recovery from loss, spiritual aid, trying times passed. Finding help through difficulty. Recovery and hope emerging from hardship."
  },
  {
    name: "Six of Pentacles",
    keywords: ["generosity", "charity", "giving and receiving", "sharing"],
    upright: "Sharing wealth and generous giving. Balance in giving and receiving. Charity and helping those in need.",
    reversed: "Debt, strings attached to giving, inequality. Borrowing or owing. Strings attached to generosity or unequal exchanges."
  },
  {
    name: "Seven of Pentacles",
    keywords: ["patience", "long-term view", "investment", "perseverance"],
    upright: "Patience and long-term investment. Working hard with delayed gratification. A pause to reassess efforts toward goals.",
    reversed: "Impatience, feeling that effort is wasted. Frustration with slow progress or lack of return. Reassessing where to invest energy."
  },
  {
    name: "Eight of Pentacles",
    keywords: ["apprenticeship", "skill development", "dedication", "quality"],
    upright: "Dedicated effort and mastery developing. Quality craftsmanship and attention to detail. Learning and refining skills over time.",
    reversed: "Self-development, perfectionism, haste. Rushing through work or lacking dedication. Developing skills through self-study."
  },
  {
    name: "Nine of Pentacles",
    keywords: ["abundance", "luxury", "self-sufficiency", "independence"],
    upright: "Abundance and luxury through self-reliance. Financial independence and comfortable living. Enjoying the rewards of hard work.",
    reversed: "Over-indulgence, dependence, living beyond means. Financial excess or superficiality. Learning to enjoy without overdoing."
  },
  {
    name: "Ten of Pentacles",
    keywords: ["inheritance", "legacy", "family", "long-term success"],
    upright: "Family wealth and lasting success. Legacy and generational prosperity. Stability and foundation built over time.",
    reversed: "Family conflict, financial failure, lack of stability. Inheritance disputes or family dysfunction. Finding stability outside traditional structures."
  },
  {
    name: "Page of Pentacles",
    keywords: ["manifestation", "financial opportunity", "skill development"],
    upright: "A diligent student of practical matters. Financial opportunities and manifestation potential. Developing skills and creating stability.",
    reversed: "Lack of progress, procrastination, lack of direction. Failing to commit or lacking ambition. Finding direction for practical goals."
  },
  {
    name: "Knight of Pentacles",
    keywords: ["efficiency", "routine", "conservatism", "hard work"],
    upright: "Hard work and steady progress. Practical and reliable approach. Following through on responsibilities with patience.",
    reversed: "Boredom, feeling stuck, perfectionism. Lethargy or resistance to change. Finding motivation to make needed changes."
  },
  {
    name: "Queen of Pentacles",
    keywords: ["nurturing", "abundance", "practicality", "security"],
    upright: "Nurturing abundance and practical security. Creating comfortable, stable environments. Supportive and generous with resources.",
    reversed: "Self-care, work-home conflict, financial insecurity. Neglecting home life or overworking. Finding balance between nurturing and practical matters."
  },
  {
    name: "King of Pentacles",
    keywords: ["abundance", "control", "discipline", "wealth"],
    upright: "Mastery of material world and wealth. Disciplined and practical approach to success. Security through wise resource management.",
    reversed: "Finances, business, missed opportunities. Greed or material obsession. Using resources responsibly and avoiding exploitation."
  }
];

/**
 * Get all tarot card meanings organized by Arcana
 */
export function getCardMeanings(): TarotCardMeanings {
  return {
    majorArcana: MAJOR_ARCANA,
    minorArcana: {
      wands: WANDS,
      cups: CUPS,
      swords: SWORDS,
      pentacles: PENTACLES
    }
  };
}

/**
 * Get all 78 cards as a flat array
 */
export function getAllCards(): CardMeaning[] {
  const meanings = getCardMeanings();
  return [
    ...meanings.majorArcana,
    ...meanings.minorArcana.wands,
    ...meanings.minorArcana.cups,
    ...meanings.minorArcana.swords,
    ...meanings.minorArcana.pentacles
  ];
}

/**
 * Get a specific card by name
 */
export function getCardByName(name: string): CardMeaning | undefined {
  return getAllCards().find(card => card.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get cards by Arcana type
 */
export function getMajorArcana(): CardMeaning[] {
  return getCardMeanings().majorArcana;
}

export function getMinorArcana(): TarotCardMeanings['minorArcana'] {
  return getCardMeanings().minorArcana;
}

export function getWands(): CardMeaning[] {
  return getCardMeanings().minorArcana.wands;
}

export function getCups(): CardMeaning[] {
  return getCardMeanings().minorArcana.cups;
}

export function getSwords(): CardMeaning[] {
  return getCardMeanings().minorArcana.swords;
}

export function getPentacles(): CardMeaning[] {
  return getCardMeanings().minorArcana.pentacles;
}
