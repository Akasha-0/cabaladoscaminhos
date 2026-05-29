// @ts-nocheck
// SKIP_LINT

/**
 * Iron Meji Practice — Union of Iron's strength and Meji's creation/beginnings
 * The sacred synthesis where primordial light meets the enduring Sacred Metal
 */

export interface IronMejiPracticeResult {
  orixa: string;
  blessing: string;
  message: string;
  guidance: string[];
  elements: string[];
  attributes: string[];
  properties: {
    magnetic: boolean;
    ferromagnetic: boolean;
    conductivity: number;
    hardness: number;
    malleability: number;
  };
  symbolism: {
    elemental: string;
    alchemical: string;
    spiritual: string;
  };
}

const ORIXAS = [
  'Olodumare', 'Oxalá', 'Ogun', 'Oxum',
  'Iemanjá', 'Ogum', 'Oxóssi', 'Shangó',
  'Nanã', 'Yemoja', 'Obatalá', 'Ewá'
];

const BLESSINGS = [
  'light', 'clarity', 'creation', 'beginnings',
  'strength', 'wisdom', 'harmony', 'guidance'
];

/**
 * Performs the Iron Meji practice — a synthesis ritual
 * combining Iron's grounding strength with Meji's primordial creation.
 * This practice invokes the union of the Sacred Metal's durability
 * with the first light of divine beginnings.
 */
export function performPractice(): IronMejiPracticeResult {
  const orixaIndex = Math.floor(Math.random() * ORIXAS.length);
  const blessingIndex = Math.floor(Math.random() * BLESSINGS.length);

  const orixa = ORIXAS[orixaIndex];
  const blessing = BLESSINGS[blessingIndex];

  const practiceElements = [
    "Invocation of Iron's grounding strength",
    "Connection with Meji's primordial light",
    "Alignment with creation's first breath",
    "Seeking protection through the Sacred Metal",
    "Honoring the essence of new beginnings",
  ];

  const attributes = [
    'força',
    'duração',
    'proteção',
    'essência',
    'criação',
    'luz',
  ];

  const properties = {
    magnetic: true,
    ferromagnetic: true,
    conductivity: 10e6,
    hardness: 4,
    malleability: 6,
  };

  const symbolism = {
    elemental: "Strength, durability, and the light of first creation",
    alchemical: "The union of Mars and primordial creation",
    spiritual: "Iron's grounding essence meets Meji's sacred light",
  };

  return {
    orixa,
    blessing,
    message: `${blessing.charAt(0).toUpperCase() + blessing.slice(1)} emanates from Meji's first light — Iron's strength grounds this new beginning.`,
    guidance: [
      'Honor the seed of every endeavor; Iron holds the space for creation to take root.',
      'Step into your path with strength; Meji illuminates, Iron anchors.',
      'Allow space for creation; Iron patience sustains the new light.',
      'Receive the dawn without resistance; the Sacred Metal protects your path.',
      'Trust the cycle of beginning and completion; strength and light walk together.'
    ],
    elements: practiceElements,
    attributes: attributes,
    properties: properties,
    symbolism: symbolism,
  };
}