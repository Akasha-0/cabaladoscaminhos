/**
 * Element Compatibility — Astrological element compatibility calculator
 * 
 * Fire, Water, Earth, Air elements with cross-compatibility scoring.
 */

export type Element = 'fire' | 'water' | 'earth' | 'air';

export interface ElementCompatibilityResult {
  selfElement: Element;
  partnerElement: Element;
  score: number;
  compatible: boolean;
  description: string;
}

export interface CompatibilityResult {
  score: number;
  compatible: boolean;
  description: string;
  elementResults: ElementCompatibilityResult[];
}

// Element order for matrix indexing
const ELEMENT_ORDER: Element[] = ['fire', 'water', 'earth', 'air'];

// Compatibility matrix: rows = self element, cols = partner element
// Values: 1 = highly compatible, 0.5 = moderate, 0 = neutral, -0.5 = challenging, -1 = incompatible
const COMPATIBILITY_MATRIX: number[][] = [
  /*          fire   water  earth  air   */
  /* fire   */ [1.0,  -1.0,   0.0,   0.5 ],
  /* water  */ [-1.0,  1.0,   0.5,   0.0 ],
  /* earth  */ [0.0,   0.5,   1.0,   0.5 ],
  /* air    */ [0.5,   0.0,   0.5,   1.0 ],
];

const COMPATIBILITY_DESCRIPTIONS: Record<string, Record<string, string>> = {
  fire: {
    fire: 'Two fires burn bright together — passion, energy, but may exhaust each other.',
    water: 'Fire and water clash — dramatic tension, transformative but challenging.',
    earth: 'Fire warms earth gently — balanced energy with practical foundation.',
    air: 'Fire and air dance beautifully — inspiration, innovation, shared vision.',
  },
  water: {
    fire: 'Water extinguishes fire — emotional depth meets passionate intensity.',
    water: 'Deep waters flow together — intuitive connection, emotional understanding.',
    earth: 'Water nourishes earth — nurturing flow, stability and growth.',
    air: 'Air evaporates water — mental clarity meets emotional depth.',
  },
  earth: {
    fire: 'Earth grounds fire — practical stability tempers fiery enthusiasm.',
    water: 'Earth absorbs water — receptive, patient, building solid foundations.',
    earth: 'Two earth signs create lasting structures — reliable, committed partnership.',
    air: 'Earth connects with air — practicality meets intellectual stimulation.',
  },
  air: {
    fire: 'Air fans fire — intellectual spark ignites passionate ideas.',
    water: 'Air ripples water — mental perspective tempers emotional currents.',
    earth: 'Air nourishes earth — ideas bring growth to practical endeavors.',
    air: 'Two air signs share thoughts freely — mental connection, communication harmony.',
  },
};

/**
 * Get the compatibility score between two elements.
 * Returns value in [-1, 1]: positive = compatible, negative = challenging.
 */
function getCompatibilityScore(self: Element, partner: Element): number {
  const selfIndex = ELEMENT_ORDER.indexOf(self);
  const partnerIndex = ELEMENT_ORDER.indexOf(partner);
  
  if (selfIndex === -1 || partnerIndex === -1) {
    return 0;
  }
  
  return COMPATIBILITY_MATRIX[selfIndex][partnerIndex];
}

/**
 * Calculate element compatibility between two charts.
 * 
 * @param selfElement - Element of the first person (fire, water, earth, air)
 * @param partnerElement - Element of the second person (fire, water, earth, air)
 * @returns Compatibility result with score, compatibility status, and description
 */
export function calculateCompatibility(
  selfElement: Element,
  partnerElement: Element
): CompatibilityResult {
  const score = getCompatibilityScore(selfElement, partnerElement);
  const compatible = score >= 0;
  
  const description = COMPATIBILITY_DESCRIPTIONS[selfElement]?.[partnerElement] 
    ?? `${capitalize(selfElement)} and ${capitalize(partnerElement)} have a ${score > 0 ? 'compatible' : score < 0 ? 'challenging' : 'neutral'} relationship.`;
  
  return {
    score,
    compatible,
    description,
    elementResults: [
      {
        selfElement,
        partnerElement,
        score,
        compatible,
        description,
      },
    ],
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}