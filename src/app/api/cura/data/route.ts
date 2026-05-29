/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// SKIP_LINT

// ============================================================
// CURA DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for Cura data access
// - Sacred healing practices and rituals
// - Healing modalities and techniques
// - Compassion and restoration teachings
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ─── INTERFACES ─────────────────────────────────────────────────────────────

interface HealingPractice {
  id: string;
  name: string;
  namePt: string;
  category: string;
  description: string;
  descriptionPt: string;
  duration: string;
  frequency: string;
  elements: string[];
  benefits: string[];
  benefitsPt: string[];
  precautions?: string[];
  contraindications?: string[];
}

interface HealingModality {
  id: string;
  name: string;
  namePt: string;
  category: string;
  description: string;
  descriptionPt: string;
  origin: string;
  principles: string[];
  techniques: string[];
  applications: string[];
}

interface SacredSymbol {
  id: string;
  name: string;
  meaning: string;
  meaningPt: string;
  healingPower: string;
  invocation: string;
  visualization: string;
  affirmations: string[];
}

interface HealingElement {
  id: string;
  name: string;
  namePt: string;
  type: string;
  properties: string[];
  healingApplications: string[];
  combinations: string[];
}

interface CuraTeaching {
  id: string;
  title: string;
  titlePt: string;
  principle: string;
  principlePt: string;
  practice: string;
  practicePt: string;
  level: string;
  wisdom: string[];
  wisdomPt: string[];
}

// ─── HEALING PRACTICES DATA ─────────────────────────────────────────────────

const HEALING_PRACTICES: HealingPractice[] = [
  {
    id: 'cura-light',
    name: 'Light Healing',
    namePt: 'Cura pela Luz',
    category: 'energy',
    description: 'Channel divine light for spiritual, emotional, and physical restoration',
    descriptionPt: 'Canalize luz divina para restauração espiritual, emocional e física',
    duration: '15-30 minutes',
    frequency: 'Daily or as needed',
    elements: ['luz', 'divine', 'restoration', 'wholeness'],
    benefits: ['Spiritual renewal', 'Emotional balance', 'Physical healing', 'Energetic purification'],
    benefitsPt: ['Renovação espiritual', 'Equilíbrio emocional', 'Cura física', 'Purificação energética'],
    precautions: ['Practice in calm environment', 'Ground yourself before beginning'],
  },
  {
    id: 'cura-compassion',
    name: 'Compassion Meditation',
    namePt: 'Meditação de Compaixão',
    category: 'meditation',
    description: 'Cultivate infinite compassion as the foundation of all healing',
    descriptionPt: 'Cultive compaixão infinita como fundamento de toda cura',
    duration: '20-45 minutes',
    frequency: 'Daily practice recommended',
    elements: ['compassion', 'love', 'tenderness', 'unconditional'],
    benefits: ['Heart opening', 'Emotional healing', 'Inner peace', 'Connection to divine love'],
    benefitsPt: ['Abertura do coração', 'Cura emocional', 'Paz interior', 'Conexão com amor divino'],
    precautions: ['May surface deep emotions', 'Practice gentle self-compassion first'],
  },
  {
    id: 'cura-restoration',
    name: 'Sacred Restoration',
    namePt: 'Restauração Sagrada',
    category: 'ritual',
    description: 'Restore the body-mind-spirit to its natural state of wholeness',
    descriptionPt: 'Restaure o corpo-mente-espírito ao seu estado natural de integridade',
    duration: '30-60 minutes',
    frequency: 'Weekly or as needed',
    elements: ['wholeness', 'balance', 'renewal', 'integration'],
    benefits: ['Deep relaxation', 'Nervous system reset', 'Energy restoration', 'Soul reintegration'],
    benefitsPt: ['Relaxamento profundo', 'Reinício do sistema nervoso', 'Restauração energética', 'Reintegração da alma'],
    precautions: ['Requires quiet, sacred space', 'Best performed in morning or evening'],
  },
  {
    id: 'cura-breath',
    name: 'Healing Breath',
    namePt: 'Respiração de Cura',
    category: 'breathwork',
    description: 'Use sacred breath patterns to activate the body\'s natural healing intelligence',
    descriptionPt: 'Use padrões respiratórios sagrados para ativar a inteligência curativa natural do corpo',
    duration: '10-20 minutes',
    frequency: 'Daily practice',
    elements: ['breath', 'prana', 'life-force', 'vitality'],
    benefits: ['Increased vitality', 'Stress reduction', 'Emotional release', 'Energetic activation'],
    benefitsPt: ['Aumento da vitalidade', 'Redução do estresse', 'Liberação emocional', 'Ativação energética'],
    precautions: ['Practice seated or lying down', 'Stop if experiencing dizziness'],
  },
  {
    id: 'cura-sound',
    name: 'Healing Sound',
    namePt: 'Som de Cura',
    category: 'sound',
    description: 'Use sacred sounds and mantras to shift energy and promote healing',
    descriptionPt: 'Use sons sagrados e mantras para mudar energia e promover cura',
    duration: '15-30 minutes',
    frequency: 'As needed',
    elements: ['sound', 'vibration', 'frequency', 'resonance'],
    benefits: ['Energy clearing', 'Chakra balancing', 'Cellular regeneration', 'Stress relief'],
    benefitsPt: ['Limpeza energética', 'Equilíbrio dos chakras', 'Regeneração celular', 'Alívio do estresse'],
    precautions: ['Use comfortable volume', 'Allow time for integration after'],
  },
  {
    id: 'cura-forgiveness',
    name: 'Forgiveness Healing',
    namePt: 'Cura pelo Perdão',
    category: 'emotional',
    description: 'Release wounds through the transformative power of forgiveness',
    descriptionPt: 'Liberte feridas através do poder transformador do perdão',
    duration: '20-40 minutes',
    frequency: 'As needed, ongoing practice',
    elements: ['forgiveness', 'release', 'freedom', 'compassion'],
    benefits: ['Emotional freedom', 'Peace of mind', 'Relationship healing', 'Inner liberation'],
    benefitsPt: ['Liberdade emocional', 'Paz de espírito', 'Cura de relacionamentos', 'Libertação interior'],
    precautions: ['May be emotionally intense', 'Seek support if needed'],
    contraindications: ['Active trauma without professional support'],
  },
  {
    id: 'cura-visualization',
    name: 'Divine Visualization',
    namePt: 'Visualização Divina',
    category: 'visualization',
    description: 'Use guided imagery to direct healing energy to areas of need',
    descriptionPt: 'Use imagens guiadas para direcionar energia curativa a áreas de necessidade',
    duration: '15-25 minutes',
    frequency: 'Daily or as needed',
    elements: ['visualization', 'imagination', 'divine-light', 'intention'],
    benefits: ['Targeted healing', 'Pain management', 'Stress reduction', 'Positive mindset'],
    benefitsPt: ['Cura direcionada', 'Gestão da dor', 'Redução do estresse', 'Mentalidade positiva'],
    precautions: ['Practice in comfortable position', 'Avoid while driving'],
  },
  {
    id: 'cura-hands',
    name: 'Laying on of Hands',
    namePt: 'Imposição de Mãos',
    category: 'energy',
    description: 'Sacred touch to channel healing energy through the hands',
    descriptionPt: 'Toque sagrado para canalizar energia curativa através das mãos',
    duration: '20-45 minutes',
    frequency: 'As needed',
    elements: ['touch', 'hands', 'channeling', 'energy-transfer'],
    benefits: ['Energy balancing', 'Pain relief', 'Emotional comfort', 'Spiritual connection'],
    benefitsPt: ['Equilíbrio energético', 'Alívio da dor', 'Conforto emocional', 'Conexão espiritual'],
    precautions: ['Clean hands before practice', 'Respect personal boundaries'],
    contraindications: ['Active infections', 'Without consent'],
  },
];

// ─── HEALING MODALITIES DATA ────────────────────────────────────────────────

const HEALING_MODALITIES: HealingModality[] = [
  {
    id: 'spiritual-healing',
    name: 'Spiritual Healing',
    namePt: 'Cura Espiritual',
    category: 'spiritual',
    description: 'Direct connection with divine energy for soul-level healing and restoration',
    descriptionPt: 'Conexão direta com energia divina para cura e restauração em nível de alma',
    origin: 'Universal spiritual tradition',
    principles: [
      'Divine energy is infinite and accessible',
      'All healing comes from within',
      'Spiritual and physical are interconnected',
      'Compassion is the healing force',
    ],
    techniques: [
      'Prayer and invocation',
      'Divine light channeling',
      'Spiritual attunement',
      'Soul retrieval',
    ],
    applications: [
      'Deep trauma resolution',
      'Soul wound healing',
      'Spiritual awakening support',
      'Past life healing',
    ],
  },
  {
    id: 'energy-healing',
    name: 'Energy Healing',
    namePt: 'Cura Energética',
    category: 'energetic',
    description: 'Work with the body\'s energy systems to restore balance and vitality',
    descriptionPt: 'Trabalhe com os sistemas energéticos do corpo para restaurar equilíbrio e vitalidade',
    origin: 'Ancient healing traditions worldwide',
    principles: [
      'The body has natural energy flows',
      'Energy blockages cause imbalance',
      'Clearing restores natural flow',
      'Subtle energy affects physical health',
    ],
    techniques: [
      'Chakra balancing',
      'Meridian clearing',
      'Aura repair',
      'Energy cord cutting',
    ],
    applications: [
      'Chronic fatigue',
      'Emotional blocks',
      'Energy depletion',
      'Energetic hygiene',
    ],
  },
  {
    id: 'emotional-healing',
    name: 'Emotional Healing',
    namePt: 'Cura Emocional',
    category: 'emotional',
    description: 'Transform and release emotional wounds stored in the body and psyche',
    descriptionPt: 'Transforme e libere feridas emocionais armazenadas no corpo e na psique',
    origin: 'Psychology and spiritual traditions',
    principles: [
      'Emotions carry healing information',
      'Unprocessed emotions create blocks',
      'Feeling is the pathway to freedom',
      'Self-compassion transforms pain',
    ],
    techniques: [
      'Emotional awareness',
      'Feel-to-heal processing',
      'Inner child work',
      'Shadow integration',
    ],
    applications: [
      'Anxiety and depression',
      'Relationship wounds',
      'Childhood trauma',
      'Grief processing',
    ],
  },
  {
    id: 'body-healing',
    name: 'Body-Based Healing',
    namePt: 'Cura pelo Corpo',
    category: 'physical',
    description: 'Honor the body\'s wisdom as a partner in the healing process',
    descriptionPt: 'Honre a sabedoria do corpo como parceira no processo de cura',
    origin: 'Indigenous and holistic healing traditions',
    principles: [
      'The body stores wisdom and memory',
      'Symptoms are messages',
      'Body intelligence supports healing',
      'Movement and touch are healing',
    ],
    techniques: [
      'Body awareness practices',
      'Gentle movement',
      'Somatic experiencing',
      'Sacred touch',
    ],
    applications: [
      'Chronic pain',
      'Stress-related illness',
      'Trauma stored in body',
      'Body disconnection',
    ],
  },
];

// ─── SACRED SYMBOLS DATA ─────────────────────────────────────────────────────

const SACRED_SYMBOLS: SacredSymbol[] = [
  {
    id: 'healing-light',
    name: 'Divine Light',
    namePt: 'Luz Divina',
    meaning: 'Pure healing energy from the divine source',
    meaningPt: 'Energia curativa pura da fonte divina',
    healingPower: 'Transforms darkness into light, heals all wounds, restores divine perfection',
    invocation: 'Divine light, descend upon me and heal all that is broken',
    visualization: 'White-gold light pouring from above, filling every cell with radiance',
    affirmations: [
      'Divine light flows through me',
      'I am filled with healing radiance',
      'Light transforms all that it touches',
    ],
  },
  {
    id: 'compassion-heart',
    name: 'Compassionate Heart',
    namePt: 'Coração Compassivo',
    meaning: 'The infinite capacity to hold all suffering with love',
    meaningPt: 'A capacidade infinita de acolher todo sofrimento com amor',
    healingPower: 'Opens the heart to unconditional love, dissolves emotional walls, connects to all beings',
    invocation: 'Sacred compassion, open my heart to love all that exists',
    visualization: 'A green-gold light glowing in the center of the chest, expanding infinitely',
    affirmations: [
      'My heart is open to give and receive love',
      'Compassion flows through me freely',
      'I hold myself and others with tender love',
    ],
  },
  {
    id: 'wholeness-circle',
    name: 'Circle of Wholeness',
    namePt: 'Círculo de Integridade',
    meaning: 'Complete restoration to the natural state of being whole',
    meaningPt: 'Restauração completa ao estado natural de ser inteiro',
    healingPower: 'Integrates all parts of self, completes unfinished healing, returns to center',
    invocation: 'Sacred circle of wholeness, make me complete once more',
    visualization: 'A golden circle encompassing the entire being, every part connected and whole',
    affirmations: [
      'I am whole and complete',
      'All parts of me are integrated',
      'Wholeness is my natural state',
    ],
  },
  {
    id: 'restoration-ankh',
    name: 'Restoration Cross',
    namePt: 'Cruz de Restauração',
    meaning: 'The union of divine and human in healing',
    meaningPt: 'A união do divino e humano na cura',
    healingPower: 'Connects heaven and earth in the healing process, anchors divine energy',
    invocation: 'Sacred cross of restoration, bridge heaven and earth within me',
    visualization: 'A vertical beam of light connecting to above, a horizontal beam grounding to earth',
    affirmations: [
      'Divine energy flows through me to earth',
      'I am the bridge between worlds',
      'Heaven and earth are united within me',
    ],
  },
  {
    id: 'water-healing',
    name: 'Sacred Waters',
    namePt: 'Águas Sagradas',
    meaning: 'Cleansing and purification that restores purity',
    meaningPt: 'Purificação e limpeza que restauram a pureza',
    healingPower: 'Washes away impurities, cleanses energy fields, refreshes and renews',
    invocation: 'Sacred waters, cleanse me of all that does not serve',
    visualization: 'Pure flowing water cascading over the body, carrying away all darkness',
    affirmations: [
      'I am cleansed and purified',
      'Waters of life flow through me',
      'I release all that does not serve',
    ],
  },
];

// ─── HEALING ELEMENTS DATA ───────────────────────────────────────────────────

const HEALING_ELEMENTS: HealingElement[] = [
  {
    id: 'light',
    name: 'Light',
    namePt: 'Luz',
    type: 'sacred',
    properties: ['radiant', 'warming', 'clarifying', 'transforming'],
    healingApplications: [
      'Illuminating shadow areas',
      'Energizing depleted systems',
      'Clearing energetic blockages',
      'Activating cellular regeneration',
    ],
    combinations: ['water', 'sound', 'love'],
  },
  {
    id: 'love',
    name: 'Love',
    namePt: 'Amor',
    type: 'sacred',
    properties: ['compassionate', 'accepting', 'healing', 'transforming'],
    healingApplications: [
      'Healing emotional wounds',
      'Opening closed hearts',
      'Connecting to divine source',
      'Dissolving isolation',
    ],
    combinations: ['light', 'compassion', 'water'],
  },
  {
    id: 'water',
    name: 'Water',
    namePt: 'Água',
    type: 'elemental',
    properties: ['cleansing', 'flowing', 'adapting', 'purifying'],
    healingApplications: [
      'Emotional purification',
      'Energy field cleansing',
      'Releasing rigidity',
      'Facilitating letting go',
    ],
    combinations: ['light', 'earth', 'sound'],
  },
  {
    id: 'breath',
    name: 'Breath',
    namePt: 'Respiração',
    type: 'vital',
    properties: ['vitalizing', 'connecting', 'balancing', 'activating'],
    healingApplications: [
      'Bringing life force',
      'Connecting body and spirit',
      'Calming the nervous system',
      'Activating healing response',
    ],
    combinations: ['light', 'sound', 'movement'],
  },
  {
    id: 'sound',
    name: 'Sound',
    namePt: 'Som',
    type: 'vibrational',
    properties: ['vibrating', 'resonating', 'breaking', 'transforming'],
    healingApplications: [
      'Breaking energy blockages',
      'Resonating with healthy frequencies',
      'Facilitating deep relaxation',
      'Opening blocked channels',
    ],
    combinations: ['light', 'water', 'breath'],
  },
];

// ─── CURA TEACHINGS DATA ────────────────────────────────────────────────────

const CURA_TEACHINGS: CuraTeaching[] = [
  {
    id: 'compassion-foundation',
    title: 'The Foundation of Compassion',
    titlePt: 'O Fundamento da Compaixão',
    principle: 'All healing begins with compassion—for self and others',
    principlePt: 'Toda cura começa com compaixão—por si mesmo e pelos outros',
    practice: 'Practice seeing yourself and all beings with tender, infinite love',
    practicePt: 'Pratique ver a si mesmo e todos os seres com amor terno e infinito',
    level: 'beginner',
    wisdom: [
      'Compassion is the highest healing force',
      'Without self-compassion, healing remains incomplete',
      'All suffering is an opportunity for compassion',
    ],
    wisdomPt: [
      'Compaixão é a força curativa mais elevada',
      'Sem autocompaixão, a cura permanece incompleta',
      'Todo sofrimento é uma oportunidade para compaixão',
    ],
  },
  {
    id: 'wholeness-nature',
    title: 'The Nature of Wholeness',
    titlePt: 'A Natureza da Integridade',
    principle: 'Wholeness is your natural state—disease is the disruption of this',
    principlePt: 'Integridade é seu estado natural—doença é a interrupção disso',
    practice: 'Return again and again to the awareness of your inherent wholeness',
    practicePt: 'Retorne repetidamente à consciência de sua integridade inerente',
    level: 'beginner',
    wisdom: [
      'You were never broken—only temporarily disconnected',
      'Healing is remembering, not fixing',
      'Wholeness includes all parts, even the wounded',
    ],
    wisdomPt: [
      'Você nunca foi quebrado—apenas temporariamente desconectado',
      'Cura é lembrar, não corrigir',
      'Integridade inclui todas as partes, até as feridas',
    ],
  },
  {
    id: 'divine-channel',
    title: 'The Divine Channel',
    titlePt: 'O Canal Divino',
    principle: 'You are a channel for divine healing energy—not the source',
    principlePt: 'Você é um canal para energia divina de cura—não a fonte',
    practice: 'Open yourself to receive and pass through healing light without attachment',
    practicePt: 'Abra-se para receber e deixar passar luz curativa sem apego',
    level: 'intermediate',
    wisdom: [
      'Healing flows through you, not from you',
      'Releasing control allows greater healing',
      'The divine heals through those who surrender',
    ],
    wisdomPt: [
      'A cura flui através de você, não de você',
      'Liberar o controle permite maior cura',
      'O divino cura através daqueles que se rendem',
    ],
  },
  {
    id: 'body-wisdom',
    title: 'The Body\'s Wisdom',
    titlePt: 'A Sabedoria do Corpo',
    principle: 'The body holds innate healing intelligence when listened to',
    principlePt: 'O corpo possui inteligência curativa inata quando escutado',
    practice: 'Develop gentle awareness of your body\'s signals and respond with care',
    practicePt: 'Desenvolva consciência gentil dos sinais do seu corpo e responda com cuidado',
    level: 'beginner',
    wisdom: [
      'Symptoms are messages, not enemies',
      'The body never lies',
      'Trust your body\'s wisdom',
    ],
    wisdomPt: [
      'Sintomas são mensagens, não inimigos',
      'O corpo nunca mente',
      'Confie na sabedoria do seu corpo',
    ],
  },
  {
    id: 'transformation-fire',
    title: 'The Fire of Transformation',
    titlePt: 'O Fogo da Transformação',
    principle: 'Healing requires the fire of transformation, not just comfort',
    principlePt: 'Cura requer o fogo da transformação, não apenas conforto',
    practice: 'Embrace necessary change, even when painful, knowing it leads to renewal',
    practicePt: 'Abrace mudanças necessárias, mesmo quando dolorosas, sabendo que levam à renovação',
    level: 'advanced',
    wisdom: [
      'Comfort can perpetuate suffering',
      'Transformation often comes through fire',
      'The wound can become the source of greatest strength',
    ],
    wisdomPt: [
      'Conforto pode perpetuar o sofrimento',
      'Transformação frequentemente vem através do fogo',
      'A ferida pode se tornar a fonte de maior força',
    ],
  },
];

// ─── GET HANDLER ─────────────────────────────────────────────────────────────

// GET /api/cura/data - Get Cura data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const practice = searchParams.get('practice');
    const teaching = searchParams.get('teaching');
    const modality = searchParams.get('modality');
    const symbol = searchParams.get('symbol');
    const element = searchParams.get('element');

    // Return specific practice by id
    if (practice) {
      const foundPractice = HEALING_PRACTICES.find(
        (p) => p.id === practice || p.name.toLowerCase().replace(/\s+/g, '-') === practice.toLowerCase()
      );
      if (!foundPractice) {
        return NextResponse.json(
          { success: false, error: 'Healing practice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: foundPractice });
    }

    // Return specific teaching by id
    if (teaching) {
      const foundTeaching = CURA_TEACHINGS.find(
        (t) => t.id === teaching || t.title.toLowerCase().replace(/\s+/g, '-') === teaching.toLowerCase()
      );
      if (!foundTeaching) {
        return NextResponse.json(
          { success: false, error: 'Cura teaching not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: foundTeaching });
    }

    // Return specific modality by id
    if (modality) {
      const foundModality = HEALING_MODALITIES.find(
        (m) => m.id === modality || m.name.toLowerCase().replace(/\s+/g, '-') === modality.toLowerCase()
      );
      if (!foundModality) {
        return NextResponse.json(
          { success: false, error: 'Healing modality not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: foundModality });
    }

    // Return specific symbol by id
    if (symbol) {
      const foundSymbol = SACRED_SYMBOLS.find(
        (s) => s.id === symbol || s.name.toLowerCase().replace(/\s+/g, '-') === symbol.toLowerCase()
      );
      if (!foundSymbol) {
        return NextResponse.json(
          { success: false, error: 'Sacred symbol not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: foundSymbol });
    }

    // Return specific element by id
    if (element) {
      const foundElement = HEALING_ELEMENTS.find(
        (e) => e.id === element || e.name.toLowerCase() === element.toLowerCase()
      );
      if (!foundElement) {
        return NextResponse.json(
          { success: false, error: 'Healing element not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: foundElement });
    }

    // Return specific data by ID
    if (id) {
      // Check for specific collections
      if (id === 'practices' || id === 'praticas') {
        return NextResponse.json({ success: true, data: HEALING_PRACTICES });
      }
      if (id === 'modalities' || id === 'modalidades') {
        return NextResponse.json({ success: true, data: HEALING_MODALITIES });
      }
      if (id === 'symbols' || id === 'simbolos') {
        return NextResponse.json({ success: true, data: SACRED_SYMBOLS });
      }
      if (id === 'elements' || id === 'elementos') {
        return NextResponse.json({ success: true, data: HEALING_ELEMENTS });
      }
      if (id === 'teachings' || id === 'ensinos') {
        return NextResponse.json({ success: true, data: CURA_TEACHINGS });
      }
      if (id === 'all' || id === 'todos') {
        return NextResponse.json({
          success: true,
          data: {
            practices: HEALING_PRACTICES,
            modalities: HEALING_MODALITIES,
            symbols: SACRED_SYMBOLS,
            elements: HEALING_ELEMENTS,
            teachings: CURA_TEACHINGS,
            totalPractices: HEALING_PRACTICES.length,
            totalModalities: HEALING_MODALITIES.length,
            totalSymbols: SACRED_SYMBOLS.length,
            totalElements: HEALING_ELEMENTS.length,
            totalTeachings: CURA_TEACHINGS.length,
          },
        });
      }

      // Try finding by name or id in all collections
      const searchId = id.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      const allCollections = [
        { name: 'practice', data: HEALING_PRACTICES },
        { name: 'modality', data: HEALING_MODALITIES },
        { name: 'symbol', data: SACRED_SYMBOLS },
        { name: 'element', data: HEALING_ELEMENTS },
        { name: 'teaching', data: CURA_TEACHINGS },
      ];

      for (const collection of allCollections) {
        const found = collection.data.find(
          (item: any) =>
            item.id.toLowerCase() === searchId ||
            item.name.toLowerCase().replace(/\s+/g, '-') === searchId ||
            item.name.toLowerCase() === id.toLowerCase()
        );
        if (found) {
          return NextResponse.json({ success: true, data: found });
        }
      }

      return NextResponse.json(
        { success: false, error: 'Cura data not found' },
        { status: 404 }
      );
    }

    // Return specific type of Cura data
    if (type) {
      if (type === 'practices' || type === 'praticas') {
        return NextResponse.json({ success: true, data: HEALING_PRACTICES });
      }
      if (type === 'modalities' || type === 'modalidades') {
        return NextResponse.json({ success: true, data: HEALING_MODALITIES });
      }
      if (type === 'symbols' || type === 'simbolos') {
        return NextResponse.json({ success: true, data: SACRED_SYMBOLS });
      }
      if (type === 'elements' || type === 'elementos') {
        return NextResponse.json({ success: true, data: HEALING_ELEMENTS });
      }
      if (type === 'teachings' || type === 'ensinos') {
        return NextResponse.json({ success: true, data: CURA_TEACHINGS });
      }
      if (type === 'all' || type === 'todos') {
        return NextResponse.json({
          success: true,
          data: {
            practices: HEALING_PRACTICES,
            modalities: HEALING_MODALITIES,
            symbols: SACRED_SYMBOLS,
            elements: HEALING_ELEMENTS,
            teachings: CURA_TEACHINGS,
          },
        });
      }

      return NextResponse.json(
        { success: false, error: 'Invalid type parameter' },
        { status: 400 }
      );
    }

    // Default: return all Cura data summary
    return NextResponse.json({
      success: true,
      data: {
        practices: HEALING_PRACTICES,
        modalities: HEALING_MODALITIES,
        symbols: SACRED_SYMBOLS,
        elements: HEALING_ELEMENTS,
        teachings: CURA_TEACHINGS,
        totalPractices: HEALING_PRACTICES.length,
        totalModalities: HEALING_MODALITIES.length,
        totalSymbols: SACRED_SYMBOLS.length,
        totalElements: HEALING_ELEMENTS.length,
        totalTeachings: CURA_TEACHINGS.length,
      },
    });
  } catch (_error) {
    console.error('Cura API Error:', _error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
