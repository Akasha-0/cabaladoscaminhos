// Ida-Pingala Data
// Represents the lunar (ida) and solar (pingala) nadis in the sushumna system

export interface IdaPingalaData {
  ida: {
    name: string;
    element: string;
    side: string;
    color: string;
    polarity: string;
    direction: string;
    chakraFocus: string;
    qualities: string[];
  };
  pingala: {
    name: string;
    element: string;
    side: string;
    color: string;
    polarity: string;
    direction: string;
    chakraFocus: string;
    qualities: string[];
  };
}

export function getData(): IdaPingalaData {
  return {
    ida: {
      name: 'Ida Nadi',
      element: 'Chandra (Moon)',
      side: 'Left',
      color: 'Silver/White',
      polarity: 'Yin',
      direction: 'Moonward',
      chakraFocus: 'Chandra (Muladhara)',
      qualities: [
        'Lunar consciousness',
        'Cooling energy',
        'Receptive intuition',
        'Mental calm',
        'Left nostril dominance',
        'Crystalline clarity',
      ],
    },
    pingala: {
      name: 'Pingala Nadi',
      element: 'Surya (Sun)',
      side: 'Right',
      color: 'Golden/Orange',
      polarity: 'Yang',
      direction: 'Solarward',
      chakraFocus: 'Surya (Muladhara)',
      qualities: [
        'Solar consciousness',
        'Warming energy',
        'Active willpower',
        'Physical vitality',
        'Right nostril dominance',
        'Fiery determination',
      ],
    },
  };
}