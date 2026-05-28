// Bandha data

export interface Bandha {
  id: string;
  name: string;
  namePt: string;
  type: 'bandha';
  description: string;
  descriptionPt: string;
  duration: number;
  durationUnit: 'minutes';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  precautions: string[];
  location: string;
  locationPt: string;
  sefirot: string[];
  qualities: string[];
  score: number;
}

const data: Bandha[] = [
  {
    id: 'mulabandha',
    name: 'Mulabandha',
    namePt: 'Mulabandha',
    type: 'bandha',
    description: 'Root lock that seals and directs pranic energy upward through the central channel.',
    descriptionPt: 'Bloqueio raiz que sella e direciona a energia prânica para cima através do canal central.',
    duration: 5,
    durationUnit: 'minutes',
    difficulty: 'advanced',
    benefits: ['Grounds energy', 'Activates kundalini', 'Strengthens pelvic floor'],
    precautions: ['Build gradually', 'Avoid during menstruation', 'Practice with guidance'],
    location: 'Perineum / Base of spine',
    locationPt: 'Períneo / Base da coluna',
    sefirot: ['Malkuth', 'Yesod'],
    qualities: ['Grounding', 'Stability', 'Containment'],
    score: 6,
  },
  {
    id: 'uddiyana-bandha',
    name: 'Uddiyana Bandha',
    namePt: 'Uddiyana Bandha',
    type: 'bandha',
    description: 'Abdominal lock that lifts pranic energy toward the heart center with powerful suction.',
    descriptionPt: 'Bloqueio abdominal que eleva a energia prânica em direção ao centro do coração com potente sucção.',
    duration: 3,
    durationUnit: 'minutes',
    difficulty: 'intermediate',
    benefits: ['Strengthens abdomen', 'Stimulates digestion', 'Raises energy to heart'],
    precautions: ['Avoid after meals', 'Skip during pregnancy', 'Do not force breath'],
    location: 'Navel region',
    locationPt: 'Região do umbigo',
    sefirot: ['Malkuth', 'Netzach'],
    qualities: ['Expansion', 'Uplift', 'Vitality'],
    score: 5,
  },
  {
    id: 'jalandhara-bandha',
    name: 'Jalandhara Bandha',
    namePt: 'Jalandhara Bandha',
    type: 'bandha',
    description: 'Throat lock that seals the energy in the throat center and balances thyroid function.',
    descriptionPt: 'Bloqueio da garganta que sella a energia no centro da garganta e equilibra a função tireoidiana.',
    duration: 5,
    durationUnit: 'minutes',
    difficulty: 'beginner',
    benefits: ['Balances thyroid', 'Calms nervous system', 'Seals prana in upper body'],
    precautions: ['Keep spine straight', 'Avoid if neck injury', 'Release slowly'],
    location: 'Throat / Chin to chest',
    locationPt: 'Garganta / Queixo ao peito',
    sefirot: ['Yesod', 'Hod'],
    qualities: ['Balance', 'Communication', 'Integration'],
    score: 4,
  },
  {
    id: 'maha-bandha',
    name: 'Maha Bandha',
    namePt: 'Maha Bandha',
    type: 'bandha',
    description: 'The great lock combining all three bandhas for maximum pranic retention and awakening.',
    descriptionPt: 'O grande bloqueio que combina os três bandhas para máxima retenção prânica e despertar.',
    duration: 3,
    durationUnit: 'minutes',
    difficulty: 'advanced',
    benefits: ['Unifies all energy centers', 'Powerful kundalini activator', 'Deep meditation aid'],
    precautions: ['Master individual bandhas first', 'Practice on empty stomach', 'Seek guidance'],
    location: 'All three: root, navel, throat',
    locationPt: 'Todos os três: raiz, umbigo, garganta',
    sefirot: ['Malkuth', 'Tiphereth', 'Kether'],
    qualities: ['Unity', 'Transcendence', 'Mastery'],
    score: 8,
  },
];

export function getData(): Bandha[] {
  return data;
}