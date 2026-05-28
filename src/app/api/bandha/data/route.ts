// ============================================================
// BANDHA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for bandha (energy locks) data
// - Core bandhas: Mula, Uddiyana, Jalandhara
// - Bandha types, benefits, and practice guidance
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export interface BandhaBenefits {
  physical: string[];
  energetic: string[];
  mental: string[];
}

export interface BandhaData {
  id: string;
  name: string;
  namePt: string;
  type: 'root' | 'abdominal' | 'throat' | 'compound';
  description: string;
  descriptionPt: string;
  duration: number;
  durationUnit: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: BandhaBenefits;
  precautions: string[];
  associatedSefirot: string[];
  associatedChakras: string[];
  qualities: string[];
  score: number;
}

// ============================================================
// BANDHA DATA
// ============================================================

const BANDHA_DATA: BandhaData[] = [
  {
    id: 'mula-bandha',
    name: 'Mula Bandha',
    namePt: 'Bloqueio da Raiz',
    type: 'root',
    description: 'Root lock - contraction of the pelvic floor muscles, engaging mulaadhaara chakra. This bandha seals prana at the base of the spine and awakens kundalini energy.',
    descriptionPt: 'Bloqueio da raiz - contração dos músculos do assoalho pélvico, ativando o chakra mulaadhaara. Este bandha sela o prana na base da coluna e desperta a energia kundalini.',
    duration: 15,
    durationUnit: 'seconds',
    difficulty: 'beginner',
    benefits: {
      physical: ['Strengthens pelvic floor', 'Improves reproductive health', 'Supports spine stability'],
      energetic: ['Activates root chakra', 'Channels kundalini upward', 'Grounds pranic flow'],
      mental: ['Enhances focus', 'Builds willpower', 'Cultivates inner strength'],
    },
    precautions: ['Avoid during pregnancy', 'Practice empty bladder', 'Release if experiencing discomfort'],
    associatedSefirot: ['Malkuth', 'Yesod'],
    associatedChakras: ['muladhara', 'svadhisthana'],
    qualities: ['Grounding', 'Stability', 'Awakening'],
    score: 7,
  },
  {
    id: 'uddiyana-bandha',
    name: 'Uddiyana Bandha',
    namePt: 'Bloqueio Abdominal',
    type: 'abdominal',
    description: 'Flying upward lock - performed after exhalation by drawing the abdomen inward and upward toward the spine. This bandha lifts prana from the solar plexus region.',
    descriptionPt: 'Bloqueio voador - executado após a expiração ao puxar o abdômen para dentro e para cima em direção à coluna. Este bandha eleva o prana da região do plexo solar.',
    duration: 10,
    durationUnit: 'seconds',
    difficulty: 'intermediate',
    benefits: {
      physical: ['Massages abdominal organs', 'Improves digestion', 'Strengthens core'],
      energetic: ['Activates manipura chakra', 'Circulates prana through sushumna', 'Fires the digestive fire'],
      mental: ['Increases mental clarity', 'Builds concentration', 'Develops body awareness'],
    },
    precautions: ['Avoid during menstruation', 'Do not practice on full stomach', 'Release gently after practice'],
    associatedSefirot: ['Tiferet', 'Netzach', 'Hod'],
    associatedChakras: ['manipura'],
    qualities: ['Power', 'Upliftment', 'Transformation'],
    score: 6,
  },
  {
    id: 'jalandhara-bandha',
    name: 'Jalandhara Bandha',
    namePt: 'Bloqueio da Garganta',
    type: 'throat',
    description: 'Net holding lock - chin locked to chest while raising the sternum. This bandha closes the throat center and redirects prana toward the heart.',
    descriptionPt: 'Bloqueio de rede - queixo travado no peito enquanto ergue o esterno. Este bandha fecha o centro da garganta e redireciona o prana em direção ao coração.',
    duration: 15,
    durationUnit: 'seconds',
    difficulty: 'beginner',
    benefits: {
      physical: ['Stretches cervical spine', 'Balances thyroid', 'Relieves throat tension'],
      energetic: ['Activates vishuddha chakra', 'Redirects prana to anahata', 'Seals apana downward'],
      mental: ['Calms the mind', 'Reduces anxiety', 'Enhances meditation depth'],
    },
    precautions: ['Avoid with neck injuries', 'Practice gently if you have hypertension', 'Do not force the lock'],
    associatedSefirot: ['Chesed', 'Gevurah'],
    associatedChakras: ['vishuddha'],
    qualities: ['Humility', 'Receptivity', 'Balance'],
    score: 5,
  },
  {
    id: 'maha-bandha',
    name: 'Maha Bandha',
    namePt: 'Grande Bloqueio',
    type: 'compound',
    description: 'Great lock - combination of all three bandhas performed sequentially. This compound bandha creates a complete energy seal along the sushumna nadi.',
    descriptionPt: 'Grande bloqueio - combinação dos três bandhas executados sequencialmente. Este bandha composto cria um selo energético completo ao longo do nadi sushumna.',
    duration: 30,
    durationUnit: 'seconds',
    difficulty: 'advanced',
    benefits: {
      physical: ['Stimulates all abdominal organs', 'Strengthens entire trunk', 'Balances nervous system'],
      energetic: ['Maximum pranic circulation', 'Activates all chakras', 'Awakens kundalini shakti'],
      mental: ['Deepest meditative states', 'Unity of consciousness', 'Transcendental awareness'],
    },
    precautions: ['Requires mastery of individual bandhas', 'Avoid during pregnancy', 'Practice under guidance initially', 'Do not hold beyond capacity'],
    associatedSefirot: ['Kether', 'Chokhmah', 'Binah', 'Tiferet', 'Malkuth'],
    associatedChakras: ['muladhara', 'svadhisthana', 'manipura', 'vishuddha', 'anahata'],
    qualities: ['Mastery', 'Unity', 'Transcendence'],
    score: 9,
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getBandhaById(id: string): BandhaData | undefined {
  return BANDHA_DATA.find((b) => b.id === id);
}

function getBandhasByType(type: string): BandhaData[] {
  return BANDHA_DATA.filter((b) => b.type === type);
}

function getBandhasByDifficulty(difficulty: string): BandhaData[] {
  return BANDHA_DATA.filter((b) => b.difficulty === difficulty);
}

function getBandhasByScore(minScore: number): BandhaData[] {
  return BANDHA_DATA.filter((b) => b.score >= minScore);
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/bandha/data
 * Retrieve bandha data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');
    const minScore = searchParams.get('minScore');
    const format = searchParams.get('format');

    // Single bandha by ID
    if (id) {
      const bandha = getBandhaById(id);
      if (!bandha) {
        return NextResponse.json(
          { error: 'Bandha not found', id },
          { status: 404 }
        );
      }

      if (format === 'summary') {
        return NextResponse.json({
          id: bandha.id,
          name: bandha.name,
          namePt: bandha.namePt,
          type: bandha.type,
          difficulty: bandha.difficulty,
        });
      }

      return NextResponse.json(bandha);
    }

    // Filter by type
    if (type) {
      const filtered = getBandhasByType(type);
      return NextResponse.json({
        type,
        bandhas: filtered,
        count: filtered.length,
      });
    }

    // Filter by difficulty
    if (difficulty) {
      const filtered = getBandhasByDifficulty(difficulty);
      return NextResponse.json({
        difficulty,
        bandhas: filtered,
        count: filtered.length,
      });
    }

    // Filter by minimum score
    if (minScore) {
      const score = parseInt(minScore, 10);
      if (isNaN(score)) {
        return NextResponse.json(
          { error: 'Invalid minScore parameter' },
          { status: 400 }
        );
      }
      const filtered = getBandhasByScore(score);
      return NextResponse.json({
        minScore: score,
        bandhas: filtered,
        count: filtered.length,
      });
    }

    // Return all bandhas
    return NextResponse.json({
      bandhas: BANDHA_DATA,
      count: BANDHA_DATA.length,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}