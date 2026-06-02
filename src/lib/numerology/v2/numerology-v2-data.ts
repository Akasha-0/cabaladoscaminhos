// fallow-ignore-file unused-file
// @ts-nocheck
// Numerology-v2 data

export interface NumerologyV2Data {
  lifePath: Record<number, { title: string; description: string; keywords: string[] }>;
  destiny: Record<number, { title: string; description: string; keywords: string[] }>;
  personality: Record<number, { title: string; description: string; keywords: string[] }>;
  soulUrge: Record<number, { title: string; description: string; keywords: string[] }>;
  masterNumbers: number[];
  baseNumbers: number[];
}

function getData(): NumerologyV2Data {
  return {
    masterNumbers: [11, 22, 33],
    baseNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    lifePath: {
      1: {
        title: 'The Leader',
        description: 'Your path leads you to independence, leadership, and pioneering spirit. You are meant to forge new trails and lead others.',
        keywords: ['independence', 'leadership', 'pioneering', 'initiative', 'ambition'],
      },
      2: {
        title: 'The Peacemaker',
        description: 'Your path centers on partnership, cooperation, and diplomacy. You are meant to build bridges and foster harmony.',
        keywords: ['partnership', 'cooperation', 'diplomacy', 'sensitivity', 'intuition'],
      },
      3: {
        title: 'The Communicator',
        description: 'Your path is one of creativity, expression, and social connection. You are meant to inspire through art and communication.',
        keywords: ['creativity', 'expression', 'social', 'inspiration', 'optimism'],
      },
      4: {
        title: 'The Builder',
        description: 'Your path demands practicality, discipline, and hard work. You are meant to build lasting foundations.',
        keywords: ['practicality', 'discipline', 'foundation', 'stability', 'dedication'],
      },
      5: {
        title: 'The Adventurer',
        description: 'Your path embraces freedom, adventure, and versatility. You are meant to experience life to its fullest.',
        keywords: ['freedom', 'adventure', 'versatility', 'change', 'adaption'],
      },
      6: {
        title: 'The Nurturer',
        description: 'Your path centers on responsibility, nurturing, and harmony. You are meant to care for home and community.',
        keywords: ['responsibility', 'nurturing', 'harmony', 'home', 'service'],
      },
      7: {
        title: 'The Seeker',
        description: 'Your path calls you to introspection, analysis, and spiritual depth. You are meant to seek hidden wisdom.',
        keywords: ['introspection', 'analysis', 'wisdom', 'spiritual', 'solitude'],
      },
      8: {
        title: 'The Achiever',
        description: 'Your path is marked by ambition, authority, and material mastery. You are meant to achieve worldly success.',
        keywords: ['ambition', 'authority', 'mastery', 'success', 'abundance'],
      },
      9: {
        title: 'The Humanitarian',
        description: 'Your path leads to compassion, humanitarianism, and global consciousness. You are meant to serve humanity.',
        keywords: ['compassion', 'humanitarianism', 'global', 'wisdom', 'generosity'],
      },
      11: {
        title: 'The Illuminator',
        description: 'Your path carries the weight of intuitive insight and spiritual illumination. As a Master Number, you have exceptional potential.',
        keywords: ['intuition', 'illumination', 'spiritual', 'inspiration', 'vision'],
      },
      22: {
        title: 'The Master Builder',
        description: 'Your path is that of the Master Builder, capable of manifesting grand visions into reality. As a Master Number, you hold great power.',
        keywords: ['master builder', 'manifestation', 'vision', 'power', 'achievement'],
      },
      33: {
        title: 'The Master Teacher',
        description: 'Your path embodies the Master Teacher, devoted to spiritual upliftment. As a Master Number, you inspire through unconditional love.',
        keywords: ['master teacher', 'upliftment', 'spiritual', 'love', 'guidance'],
      },
    },
    destiny: {
      1: {
        title: 'The Independent',
        description: 'Your destiny is to become a leader who inspires others through personal achievement and self-reliance.',
        keywords: ['leadership', 'independence', 'determination', 'courage', 'initiation'],
      },
      2: {
        title: 'The Diplomat',
        description: 'Your destiny involves being a peacemaker who brings people together and creates harmony through cooperation.',
        keywords: ['cooperation', 'partnership', 'diplomacy', ' mediates', 'balance'],
      },
      3: {
        title: 'The Creative',
        description: 'Your destiny is to express yourself creatively and inspire others through art, communication, and joy.',
        keywords: ['creativity', 'expression', 'inspiration', 'joy', 'imagination'],
      },
      4: {
        title: 'The Practical',
        description: 'Your destiny is to build solid structures and systems that provide lasting value and security.',
        keywords: ['foundation', 'order', 'build', 'stability', 'service'],
      },
      5: {
        title: 'The Freedom Seeker',
        description: 'Your destiny involves embracing change, travel, and diverse experiences to expand consciousness.',
        keywords: ['freedom', 'adventure', 'change', 'flexibility', 'growth'],
      },
      6: {
        title: 'The Caregiver',
        description: 'Your destiny centers on nurturing others, creating harmonious homes, and serving your community.',
        keywords: ['nurturing', 'responsibility', 'harmony', 'family', 'home'],
      },
      7: {
        title: 'The Sage',
        description: 'Your destiny calls you to seek deep wisdom, pursue spiritual truth, and share knowledge with others.',
        keywords: ['wisdom', 'spirituality', 'truth', 'introspection', 'knowledge'],
      },
      8: {
        title: 'The Power Broker',
        description: 'Your destiny involves achieving material success, financial mastery, and positions of authority.',
        keywords: ['power', 'abundance', 'authority', 'achievement', 'mastery'],
      },
      9: {
        title: 'The Global Servant',
        description: 'Your destiny is to serve humanity broadly, letting go of the personal to embrace universal compassion.',
        keywords: ['compassion', 'humanitarian', 'universal', 'completion', 'forgiveness'],
      },
      11: {
        title: 'The Visionary',
        description: 'Your destiny is to channel spiritual insight and inspire others through illuminated ideas and intuition.',
        keywords: ['vision', 'intuition', 'inspiration', 'idealism', 'revelation'],
      },
      22: {
        title: 'The Architect',
        description: 'Your destiny is to manifest grand visions into tangible reality on a large scale.',
        keywords: ['architecture', 'manifestation', 'grand vision', 'mastery', 'construction'],
      },
      33: {
        title: 'The Lightbringer',
        description: 'Your destiny is to teach spiritual truths and uplift humanity through unconditional love.',
        keywords: ['light', 'teaching', 'spiritual', 'love', 'upliftment'],
      },
    },
    personality: {
      1: {
        title: 'The Determined',
        description: 'Others perceive you as confident, ambitious, and self-directed. You appear strong and capable of leading.',
        keywords: ['determined', 'ambitious', 'confident', 'independent', 'strong'],
      },
      2: {
        title: 'The Diplomatic',
        description: 'Others perceive you as cooperative, sensitive, and tactful. You appear warm and supportive.',
        keywords: ['diplomatic', 'sensitive', 'tactful', 'supportive', 'peaceful'],
      },
      3: {
        title: 'The Charismatic',
        description: 'Others perceive you as creative, expressive, and socially magnetic. You appear charming and optimistic.',
        keywords: ['charismatic', 'creative', 'expressive', 'charming', 'optimistic'],
      },
      4: {
        title: 'The Reliable',
        description: 'Others perceive you as dependable, practical, and hardworking. You appear stable and trustworthy.',
        keywords: ['reliable', 'practical', 'hardworking', 'stable', 'trustworthy'],
      },
      5: {
        title: 'The Enthusiastic',
        description: 'Others perceive you as adventurous, freedom-loving, and energetic. You appear exciting and adaptable.',
        keywords: ['enthusiastic', 'adventurous', 'freedom-loving', 'adaptable', 'exciting'],
      },
      6: {
        title: 'The Responsible',
        description: 'Others perceive you as caring, nurturing, and responsible. You appear loving and protective.',
        keywords: ['responsible', 'caring', 'nurturing', 'loving', 'protective'],
      },
      7: {
        title: 'The Analytical',
        description: 'Others perceive you as intelligent, introspective, and reserved. You appear wise and mysterious.',
        keywords: ['analytical', 'intelligent', 'introspective', 'wise', 'reserved'],
      },
      8: {
        title: 'The Authoritative',
        description: 'Others perceive you as powerful, confident, and business-minded. You appear successful and commanding.',
        keywords: ['authoritative', 'powerful', 'confident', 'business-minded', 'commanding'],
      },
      9: {
        title: 'The Humanitarian',
        description: 'Others perceive you as compassionate, wise, and selfless. You appear wise and universally loving.',
        keywords: ['humanitarian', 'compassionate', 'wise', 'selfless', 'generous'],
      },
      11: {
        title: 'The Intuitive',
        description: 'Others perceive you as highly intuitive, spiritually aware, and visionary. You appear enlightened.',
        keywords: ['intuitive', 'spiritual', 'visionary', 'enlightened', 'sensitive'],
      },
      22: {
        title: 'The Mastermind',
        description: 'Others perceive you as capable of great accomplishments. You appear powerful and competent.',
        keywords: ['mastermind', 'powerful', 'competent', 'visionary', 'grand'],
      },
      33: {
        title: 'The Saint',
        description: 'Others perceive you as selfless and spiritually devoted. You appear loving and enlightened.',
        keywords: ['saintly', 'selfless', 'devoted', 'loving', 'enlightened'],
      },
    },
    soulUrge: {
      1: {
        title: 'The Self-Reliant',
        description: 'Your soul craves independence, leadership, and personal achievement. You seek to prove your capabilities.',
        keywords: ['independence', 'achievement', 'leadership', 'self-reliance', 'initiative'],
      },
      2: {
        title: 'The Companion',
        description: 'Your soul craves connection, harmony, and meaningful relationships. You seek love and partnership.',
        keywords: ['companionship', 'harmony', 'love', 'partnership', 'cooperation'],
      },
      3: {
        title: 'The Creative',
        description: 'Your soul craves creative expression, joy, and artistic display. You seek beauty and inspiration.',
        keywords: ['creativity', 'joy', 'expression', 'beauty', 'inspiration'],
      },
      4: {
        title: 'The Builder',
        description: 'Your soul craves stability, order, and tangible accomplishment. You seek to create lasting work.',
        keywords: ['stability', 'order', 'accomplishment', 'build', 'security'],
      },
      5: {
        title: 'The Liberated',
        description: 'Your soul craves freedom, variety, and new experiences. You seek adventure and spontaneous joy.',
        keywords: ['freedom', 'variety', 'adventure', 'experience', 'spontaneity'],
      },
      6: {
        title: 'The Devoted',
        description: 'Your soul craves love, responsibility, and harmonious environment. You seek to nurture and be nurtured.',
        keywords: ['devotion', 'love', 'responsibility', 'harmony', 'nurturing'],
      },
      7: {
        title: 'The Seeker',
        description: 'Your soul craves wisdom, spiritual truth, and deep understanding. You seek inner peace and knowledge.',
        keywords: ['wisdom', 'truth', 'understanding', 'spiritual', 'solitude'],
      },
      8: {
        title: 'The Empowered',
        description: 'Your soul craves power, achievement, and material mastery. You seek success and recognition.',
        keywords: ['power', 'achievement', 'mastery', 'success', 'recognition'],
      },
      9: {
        title: 'The Compassionate',
        description: 'Your soul craves service, compassion, and universal love. You seek to help all beings.',
        keywords: ['compassion', 'service', 'love', 'universal', 'generosity'],
      },
      11: {
        title: 'The Illuminated',
        description: 'Your soul craves spiritual revelation, divine connection, and to inspire others through light.',
        keywords: ['illumination', 'revelation', 'spiritual', 'inspiration', 'divine'],
      },
      22: {
        title: 'The Grand Visionary',
        description: 'Your soul craves to manifest grand purposes and build lasting legacies for humanity.',
        keywords: ['grand vision', 'manifestation', 'legacy', 'mastery', 'purpose'],
      },
      33: {
        title: 'The Pure Love',
        description: 'Your soul craves to embody unconditional love and elevate humanity through spiritual teaching.',
        keywords: ['unconditional love', 'spiritual', 'teaching', 'upliftment', 'devotion'],
      },
    },
  };
}

export default getData;
