export interface ConsciousnessData {
  id: string;
  name: string;
  level: string;
  description: string;
  characteristics: string[];
  createdAt: Date;
}

export function getData(): ConsciousnessData[] {
  return [
    {
      id: 'consciousness-001',
      name: 'Conscious Awareness',
      level: 'fundamental',
      description: 'Basic state of being conscious and aware of existence',
      characteristics: ['Self-awareness', 'Present moment awareness', 'Basic perception'],
      createdAt: new Date('2026-01-01'),
    },
    {
      id: 'consciousness-002',
      name: 'Expanded Consciousness',
      level: 'elevated',
      description: 'Expanded state of consciousness beyond ordinary perception',
      characteristics: ['Enhanced intuition', 'Heightened perception', 'Deep insight'],
      createdAt: new Date('2026-01-15'),
    },
    {
      id: 'consciousness-003',
      name: 'Cosmic Consciousness',
      level: 'transcendent',
      description: 'Union with universal consciousness and divine awareness',
      characteristics: ['Oneness', 'Infinite awareness', 'Divine connection'],
      createdAt: new Date('2026-02-01'),
    },
    {
      id: 'consciousness-004',
      name: 'Pure Consciousness',
      level: 'absolute',
      description: 'Unified field of pure awareness beyond all concepts',
      characteristics: ['Non-dual awareness', 'Transcendent peace', 'Pure being'],
      createdAt: new Date('2026-02-15'),
    },
  ];
}
