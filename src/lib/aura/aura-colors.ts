// Aura color definitions
export interface AuraColor {
  name: string;
  hex: string;
  description: string;
}

export function getColors(): AuraColor[] {
  return [
    { name: 'White',   hex: '#F8F8FF', description: 'Pure spirit, enlightenment, truth' },
    { name: 'Yellow',  hex: '#FFD700', description: 'Intellect, creativity, joy' },
    { name: 'Orange',  hex: '#FF8C00', description: 'Vitality, ambition, transformation' },
    { name: 'Pink',    hex: '#FF69B4', description: 'Compassion, love, tenderness' },
    { name: 'Red',     hex: '#DC143C', description: 'Strength, passion, grounding' },
    { name: 'Blue',    hex: '#4169E1', description: 'Calm, wisdom, depth' },
    { name: 'Violet',  hex: '#9400D3', description: 'Intuition, mysticism, the divine' },
  ];
}
