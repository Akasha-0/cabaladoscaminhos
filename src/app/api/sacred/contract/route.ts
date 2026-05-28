 
import { NextRequest, NextResponse } from 'next/server';

interface Contract {
  id: string;
  name: string;
  description: string;
  type: string;
  sefirot: string[];
  chakra: number[];
  element: string;
  intention: string;
  practice: string;
  frequency: string;
  affirmation: string;
}

const CONTRACTS: Contract[] = [
  {
    id: 'sacred-union',
    name: 'Sacred Union Contract',
    description: 'A covenant of divine partnership and soul fusion between two beings committed to mutual spiritual evolution.',
    type: 'union',
    sefirot: ['Tiferet', 'Yesod', 'Malkuth'],
    chakra: [4, 5, 6],
    element: 'Air',
    intention: 'Deep connection, unconditional love, shared spiritual path',
    practice: 'Joint meditation, heart-centered prayer, covenant ceremonies',
    frequency: 'Daily practice, weekly communion',
    affirmation: 'I am united with my sacred partner in divine love and purpose'
  },
  {
    id: 'light-worker',
    name: 'Light Worker Contract',
    description: 'An agreement with the divine to embody light and serve humanity through healing, teaching, and transformation.',
    type: 'service',
    sefirot: ['Chesed', 'Gevurah', 'Tiferet'],
    chakra: [3, 4, 5, 6, 7],
    element: 'Fire',
    intention: 'Divine service, healing ministry, light embodiment',
    practice: 'Light meditation, healing sessions, prayer warriors practice',
    frequency: 'Continuous awareness, dedicated service hours',
    affirmation: 'I am a vessel of divine light serving the highest good of all'
  },
  {
    id: 'soul-retrieval',
    name: 'Soul Retrieval Contract',
    description: 'A sacred pact for recovering fragmented soul aspects lost through trauma or life experiences.',
    type: 'healing',
    sefirot: ['Netzach', 'Hod', 'Yesod'],
    chakra: [1, 2, 3],
    element: 'Water',
    intention: 'Soul integration, wholeness restoration, trauma healing',
    practice: 'Shamanic journeying, inner child work, energy healing',
    frequency: 'As needed, intensive healing periods',
    affirmation: 'All fragmented parts of my soul return to wholeness now'
  },
  {
    id: 'elemental-pact',
    name: 'Elemental Pact',
    description: 'A covenant with the elemental forces of nature for magical workings and spiritual protection.',
    type: 'elemental',
    sefirot: ['Malkuth'],
    chakra: [1, 2],
    element: 'Earth',
    intention: 'Nature connection, elemental mastery, magical protection',
    practice: 'Ritual offerings, nature meditation, elemental invocations',
    frequency: 'Seasonal celebrations, daily elemental attunement',
    affirmation: 'I am in sacred relationship with all elemental forces'
  },
  {
    id: 'ascension-covenant',
    name: 'Ascension Covenant',
    description: 'A commitment to raise vibrational frequency and ascend through the dimensions of consciousness.',
    type: 'ascension',
    sefirot: ['Keter', 'Chokhmah', 'Binah'],
    chakra: [6, 7, 8],
    element: 'Ether',
    intention: 'Energetic ascension, consciousness expansion, dimension hopping',
    practice: 'High vibration meditation, light language, energy attunements',
    frequency: 'Continuous practice, ascension initiations',
    affirmation: 'I ascend with grace and ease into higher dimensions of being'
  },
  {
    id: 'ancestral-healing',
    name: 'Ancestral Healing Contract',
    description: 'An agreement to heal generational patterns and release ancestral karma for lineage liberation.',
    type: 'lineage',
    sefirot: ['Chesed', 'Gevurah', 'Netzach'],
    chakra: [1, 2, 3, 4],
    element: 'Earth',
    intention: 'Lineage clearing, generational healing, ancestral blessing',
    practice: 'Ancestral meditation, genogram work, gratitude rituals',
    frequency: 'Weekly lineage sessions, moon cycle ceremonies',
    affirmation: 'I break ancestral chains and bring healing to my bloodline'
  },
  {
    id: 'divine-masculine',
    name: 'Divine Masculine Covenant',
    description: 'A pact to embody sacred masculine energy in balance with the divine feminine.',
    type: 'balance',
    sefirot: ['Gevurah', 'Chesed'],
    chakra: [1, 2, 3],
    element: 'Fire',
    intention: 'Sacred masculine embodiment, healthy boundaries, purposeful action',
    practice: 'Warrior meditation, strength practices, boundary ceremonies',
    frequency: 'Daily masculine practice, weekly balance check',
    affirmation: 'I embody divine masculine strength in service of love'
  },
  {
    id: 'divine-feminine',
    name: 'Divine Feminine Covenant',
    description: 'An agreement to embrace and embody sacred feminine energy in its fullness.',
    type: 'balance',
    sefirot: ['Binah', 'Chokhmah'],
    chakra: [2, 4, 6],
    element: 'Water',
    intention: 'Sacred feminine embodiment, intuition development, creative flow',
    practice: 'Goddess meditation, yoni ceremonies, creative expression',
    frequency: 'Daily feminine practice, moon cycle honoring',
    affirmation: 'I embody the sacred feminine in all her wild, wise glory'
  },
  {
    id: 'crystal-empowerment',
    name: 'Crystal Empowerment Contract',
    description: 'A pact with crystal and mineral kingdoms for healing, protection, and spiritual amplification.',
    type: 'crystal',
    sefirot: ['Yesod', 'Malkuth'],
    chakra: [1, 4, 7],
    element: 'Earth',
    intention: 'Crystal healing, energy amplification, spiritual protection',
    practice: 'Crystal meditation, grid work, crystal charging rituals',
    frequency: 'Daily crystal connection, weekly grid work',
    affirmation: 'I am amplified and protected by the crystal kingdom'
  },
  {
    id: 'star-seed',
    name: 'Star Seed Activation Contract',
    description: 'An agreement to activate dormant star seed codes and fulfill cosmic missions.',
    type: 'cosmic',
    sefirot: ['Keter', 'Chokhmah'],
    chakra: [5, 6, 7, 8, 9],
    element: 'Ether',
    intention: 'Star activation, cosmic mission fulfillment, galactic heritage',
    practice: 'Stargate meditation, star seed activation, cosmic visualizations',
    frequency: 'Full moon activations, continuous cosmic awareness',
    affirmation: 'I am activated as a star seed fulfilling my cosmic mission'
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');
  const sefirot = searchParams.get('sefirot');
  const chakra = searchParams.get('chakra');
  const element = searchParams.get('element');

  if (id) {
    const contract = CONTRACTS.find(c => c.id === id);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    return NextResponse.json(contract);
  }

  let results = [...CONTRACTS];

  if (type) {
    results = results.filter(c => c.type === type);
  }

  if (sefirot) {
    results = results.filter(c => 
      c.sefirot.some(s => s.toLowerCase().includes(sefirot.toLowerCase()))
    );
  }

  if (chakra) {
    const chakraNum = parseInt(chakra, 10);
    results = results.filter(c => c.chakra.includes(chakraNum));
  }

  if (element) {
    results = results.filter(c => 
      c.element.toLowerCase() === element.toLowerCase()
    );
  }

  return NextResponse.json({
    contracts: results,
    total: results.length,
    types: [...new Set(CONTRACTS.map(c => c.type))],
    sefirot: [...new Set(CONTRACTS.flatMap(c => c.sefirot))],
    elements: [...new Set(CONTRACTS.map(c => c.element))]
  });
}
