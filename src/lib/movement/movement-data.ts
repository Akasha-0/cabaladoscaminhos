/**
 * Movement Data Module
 * Provides movement practices, techniques, and their spiritual properties
 */

export interface Movement {
  id: string;
  name: string;
  namePt: string;
  category: string;
  origin: string;
  description: string;
  benefits: string[];
  chakraAlignment: number[];
  element: string;
  intensity: 'low' | 'medium' | 'high';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  contraindications: string[];
  spiritualPurposes: string[];
  breathingSync: boolean;
}

export interface MovementCategory {
  id: string;
  name: string;
  namePt: string;
  description: string;
}

export function getData(): {
  movements: Movement[];
  categories: MovementCategory[];
} {
  return {
    movements: [
      {
        id: "yoga-ashtanga",
        name: "Ashtanga Yoga",
        namePt: "Yoga Ashtanga",
        category: "yoga",
        origin: "India",
        description: "Dynamic and physically demanding practice following a set sequence of postures synchronized with breath.",
        benefits: [
          "Builds strength and flexibility",
          "Detoxifies body and mind",
          "Improves focus and concentration",
          "Develops stamina and endurance"
        ],
        chakraAlignment: [1, 2, 3, 4, 5],
        element: "fire",
        intensity: "high",
        duration: "60-90 min",
        difficulty: "advanced",
        contraindications: [
          "Injuries",
          "Heart conditions",
          "Pregnancy"
        ],
        spiritualPurposes: [
          "Purification of nadis",
          "Activation of kundalini",
          "Union of body and breath"
        ],
        breathingSync: true
      },
      {
        id: "yoga-hatha",
        name: "Hatha Yoga",
        namePt: "Yoga Hatha",
        category: "yoga",
        origin: "India",
        description: "Gentle practice focusing on physical postures and breathing techniques to balance body and mind.",
        benefits: [
          "Improves flexibility",
          "Reduces stress",
          "Balances nervous system",
          "Promotes inner peace"
        ],
        chakraAlignment: [1, 2, 3, 4, 5, 6, 7],
        element: "earth",
        intensity: "medium",
        duration: "45-60 min",
        difficulty: "beginner",
        contraindications: [],
        spiritualPurposes: [
          "Preparation for meditation",
          "Balancing ida and pingala",
          "Purification of body"
        ],
        breathingSync: true
      },
      {
        id: "tai-chi",
        name: "Tai Chi Chuan",
        namePt: "Tai Chi Chuan",
        category: "martial",
        origin: "China",
        description: "Gentle martial art characterized by slow, flowing movements and deep breathing.",
        benefits: [
          "Improves balance and coordination",
          "Reduces stress and anxiety",
          "Enhances mindfulness",
          "Strengthens joints and muscles"
        ],
        chakraAlignment: [1, 2, 3, 4],
        element: "water",
        intensity: "low",
        duration: "20-30 min",
        difficulty: "beginner",
        contraindications: [],
        spiritualPurposes: [
          "Cultivation of chi",
          "Harmony with nature",
          "Inner stillness through movement"
        ],
        breathingSync: true
      },
      {
        id: "qigong",
        name: "Qigong",
        namePt: "Qigong",
        category: "energy",
        origin: "China",
        description: "Practice of cultivating and balancing life energy through movement, breathing, and meditation.",
        benefits: [
          "Boosts immune system",
          "Increases energy levels",
          "Improves circulation",
          "Promotes emotional balance"
        ],
        chakraAlignment: [1, 2, 3, 4, 5],
        element: "wood",
        intensity: "low",
        duration: "15-30 min",
        difficulty: "beginner",
        contraindications: [],
        spiritualPurposes: [
          "Cultivation of vital energy",
          "Opening of energy channels",
          "Harmonization of five elements"
        ],
        breathingSync: true
      },
      {
        id: "sufi-whirling",
        name: "Sufi Whirling",
        namePt: "Dervixe Giratório",
        category: "sacred",
        origin: "Turkey",
        description: "Meditative practice of spinning to achieve spiritual transcendence and union with the divine.",
        benefits: [
          "Induces altered states",
          "Opens heart chakra",
          "Transcends ego",
          "Connects to divine love"
        ],
        chakraAlignment: [4, 5, 6, 7],
        element: "air",
        intensity: "medium",
        duration: "15-20 min",
        difficulty: "intermediate",
        contraindications: [
          "Inner ear problems",
          "Balance disorders"
        ],
        spiritualPurposes: [
          "Union with the divine",
          "Dissolution of ego",
          "Activation of higher consciousness"
        ],
        breathingSync: false
      },
      {
        id: "biodanza",
        name: "Biodanza",
        namePt: "Biodanza",
        category: "sacred",
        origin: "Chile",
        description: "System of integration through movement, music, and group encounter to reconnect with vital life energy.",
        benefits: [
          "Emotional integration",
          "Reconnection with life",
          "Expression of feelings",
          "Strengthening of bonds"
        ],
        chakraAlignment: [2, 3, 4],
        element: "fire",
        intensity: "medium",
        duration: "60 min",
        difficulty: "beginner",
        contraindications: [],
        spiritualPurposes: [
          "Reintegration with vital force",
          "Group harmony",
          "Emotional healing"
        ],
        breathingSync: false
      },
      {
        id: "5-rhythms",
        name: "5 Rhythms",
        namePt: "5 Ritmos",
        category: "dance",
        origin: "USA",
        description: "Movement meditation practice exploring five qualities: flowing, staccato, chaos, lyrical, stillness.",
        benefits: [
          "Self-expression",
          "Emotional release",
          "Body-mind integration",
          "Creative exploration"
        ],
        chakraAlignment: [1, 2, 3, 4, 5, 6, 7],
        element: "water",
        intensity: "high",
        duration: "60-90 min",
        difficulty: "intermediate",
        contraindications: [],
        spiritualPurposes: [
          "Integration of body and soul",
          "Release of stored emotions",
          "Finding personal rhythm"
        ],
        breathingSync: false
      },
      {
        id: "pilates",
        name: "Pilates",
        namePt: "Pilates",
        category: "bodywork",
        origin: "Germany",
        description: "Method focusing on core strength, posture, and controlled movements to improve physical alignment.",
        benefits: [
          "Strengthens core",
          "Improves posture",
          "Increases body awareness",
          "Prevents injuries"
        ],
        chakraAlignment: [1, 2, 3],
        element: "earth",
        intensity: "medium",
        duration: "45-60 min",
        difficulty: "beginner",
        contraindications: [
          "Acute injuries",
          "Herniated discs"
        ],
        spiritualPurposes: [
          "Body awareness",
          "Mind-body connection",
          "Grounding"
        ],
        breathingSync: true
      },
      {
        id: "kundalini-yoga",
        name: "Kundalini Yoga",
        namePt: "Yoga Kundalini",
        category: "yoga",
        origin: "India",
        description: "Practice combining breathing, movement, and mantra to awaken kundalini energy and expand consciousness.",
        benefits: [
          "Activates dormant energy",
          "Balances glands",
          "Strengthens nervous system",
          "Expands awareness"
        ],
        chakraAlignment: [1, 2, 3, 4, 5, 6, 7],
        element: "fire",
        intensity: "high",
        duration: "60-90 min",
        difficulty: "intermediate",
        contraindications: [
          "Pregnancy",
          "Heart conditions",
          "Mental health issues"
        ],
        spiritualPurposes: [
          "Kundalini awakening",
          "Chakra activation",
          "Higher consciousness"
        ],
        breathingSync: true
      },
      {
        id: "capoeira",
        name: "Capoeira",
        namePt: "Capoeira",
        category: "martial",
        origin: "Brazil",
        description: "Brazilian art form combining martial arts, dance, music, and spirituality in a playful and rhythmic manner.",
        benefits: [
          "Improves agility",
          "Develops musicality",
          "Builds community",
          "Expresses resistance"
        ],
        chakraAlignment: [1, 2, 3, 4],
        element: "fire",
        intensity: "high",
        duration: "60 min",
        difficulty: "intermediate",
        contraindications: [
          "Heart conditions"
        ],
        spiritualPurposes: [
          "Ancestral connection",
          "Freedom expression",
          "Community bonding"
        ],
        breathingSync: true
      },
      {
        id: "walking-meditation",
        name: "Walking Meditation",
        namePt: "Meditação Caminhando",
        category: "meditation",
        origin: "Buddhist",
        description: "Mindful practice of walking with full awareness of each step, breath, and sensation.",
        benefits: [
          "Improves concentration",
          "Grounds in present",
          "Enhances body awareness",
          "Reduces anxiety"
        ],
        chakraAlignment: [1, 4],
        element: "earth",
        intensity: "low",
        duration: "20-45 min",
        difficulty: "beginner",
        contraindications: [],
        spiritualPurposes: [
          "Mindful presence",
          "Grounding",
          "Walking the path"
        ],
        breathingSync: true
      },
      {
        id: "sacred-dance",
        name: "Sacred Dance",
        namePt: "Dança Sagrada",
        category: "sacred",
        origin: "Universal",
        description: "Dance practices honoring sacred geometry, divine archetypes, and spiritual transformation.",
        benefits: [
          "Connects to sacred",
          "Transforms consciousness",
          "Expresses devotion",
          "Heals trauma"
        ],
        chakraAlignment: [1, 2, 3, 4, 5, 6, 7],
        element: "air",
        intensity: "medium",
        duration: "30-60 min",
        difficulty: "beginner",
        contraindications: [],
        spiritualPurposes: [
          "Divine union",
          "Chakra activation",
          "Spiritual transformation"
        ],
        breathingSync: false
      }
    ],
    categories: [
      {
        id: "yoga",
        name: "Yoga",
        namePt: "Yoga",
        description: "Ancient Indian practices combining postures, breathing, and meditation for holistic development."
      },
      {
        id: "martial",
        name: "Martial Arts",
        namePt: "Artes Marciais",
        description: "Movement practices originating from combat traditions that develop body, mind, and spirit."
      },
      {
        id: "energy",
        name: "Energy Work",
        namePt: "Trabalho Energético",
        description: "Practices focused on cultivating and balancing vital life energy (chi, prana, ki)."
      },
      {
        id: "sacred",
        name: "Sacred Movement",
        namePt: "Movimento Sagrado",
        description: "Ritualistic and devotional movement practices for spiritual transformation."
      },
      {
        id: "dance",
        name: "Dance",
        namePt: "Dança",
        description: "Expressive movement practices for emotional integration and creative exploration."
      },
      {
        id: "bodywork",
        name: "Bodywork",
        namePt: "Trabalho Corporal",
        description: "Movement methods focused on physical alignment, strength, and body awareness."
      },
      {
        id: "meditation",
        name: "Movement Meditation",
        namePt: "Meditação em Movimento",
        description: "Meditative practices that use movement as a vehicle for mindfulness and presence."
      }
    ]
  };
}

export function getMovement(id: string): Movement | undefined {
  const data = getData();
  return data.movements.find(m => m.id === id);
}

export function getMovementsPorCategory(category: string): Movement[] {
  const data = getData();
  return data.movements.filter(m => m.category === category);
}

export function getMovementsPorChakra(chakra: number): Movement[] {
  const data = getData();
  return data.movements.filter(m => m.chakraAlignment.includes(chakra));
}

export function getMovementsPorElement(element: string): Movement[] {
  const data = getData();
  return data.movements.filter(m => m.element === element);
}

export function getMovementsPorDifficulty(difficulty: Movement['difficulty']): Movement[] {
  const data = getData();
  return data.movements.filter(m => m.difficulty === difficulty);
}

export function getTodosMovimentos(): Movement[] {
  const data = getData();
  return data.movements;
}

export function getTodasCategorias(): MovementCategory[] {
  const data = getData();
  return data.categories;
}