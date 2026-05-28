// ============================================================
// BREATH DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for breath data
// - Retrieve all breathing exercises and techniques
// - Breathing patterns and spiritual practices
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed breath data for spiritual practice
const BREATH_EXERCISES = [
  {
    id: 'relaxing',
    name: 'Relaxing Breath',
    namePt: 'Respiração Relaxante',
    description: 'Calming 4-7-8 technique for relaxation and sleep',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 4,
    benefits: ['Deep relaxation', 'Sleep promotion', 'Anxiety reduction'],
    benefitsPt: ['Relaxamento profundo', 'Promoção do sono', 'Redução de ansiedade'],
  },
  {
    id: 'energizing',
    name: 'Energizing Breath',
    namePt: 'Respiração Energizante',
    description: 'Quick rhythmic breathing for energy and vitality',
    inhale: 2,
    hold1: 0,
    exhale: 2,
    hold2: 0,
    cycles: 10,
    benefits: ['Increased energy', 'Mental clarity', 'Vitality boost'],
    benefitsPt: ['Energia aumentada', 'Clareza mental', 'Impulso de vitalidade'],
  },
  {
    id: 'balancing',
    name: 'Balancing Breath',
    namePt: 'Respiração Balanceadora',
    description: 'Equal timing for centered calm and equilibrium',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 6,
    benefits: ['Emotional balance', 'Centered focus', 'Peace restoration'],
    benefitsPt: ['Equilíbrio emocional', 'Foco centrado', 'Restabelecimento da paz'],
  },
  {
    id: 'deep-calm',
    name: 'Deep Calm',
    namePt: 'Calma Profunda',
    description: 'Extended exhale for deep relaxation and nervous system reset',
    inhale: 4,
    hold1: 2,
    exhale: 8,
    hold2: 2,
    cycles: 5,
    benefits: ['Parasympathetic activation', 'Stress relief', 'Deep rest'],
    benefitsPt: ['Ativação parassimpática', 'Alívio do estresse', 'Descanso profundo'],
  },
  {
    id: 'clarity',
    name: 'Clarity Breath',
    namePt: 'Respiração de Clareza',
    description: 'Box breathing for focus, clarity and mental performance',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 8,
    benefits: ['Enhanced focus', 'Mental clarity', 'Emotional control'],
    benefitsPt: ['Foco aprimorado', 'Clareza mental', 'Controle emocional'],
  },
];

const BREATH_TECHNIQUES = [
  {
    id: 'box-breathing',
    title: 'Respiração Quadrada',
    titleEn: 'Box Breathing',
    description: 'Técnica simples de 4 fases iguais para calma e foco mental.',
    descriptionEn: 'Simple 4-phase equal technique for calm and mental focus.',
    instructions: [
      'Sente-se confortavelmente com a coluna ereta',
      'Inspire pelo nariz contando até 4',
      'Segure a respiração contando até 4',
      'Expire pela boca contando até 4',
      'Segure com os pulmões vazios contando até 4',
      'Repita pelo número desejado de ciclos',
    ],
    instructionsEn: [
      'Sit comfortably with spine straight',
      'Inhale through nose counting to 4',
      'Hold breath counting to 4',
      'Exhale through mouth counting to 4',
      'Hold empty counting to 4',
      'Repeat for desired number of cycles',
    ],
    type: 'box-breathing',
    intensity: 'gentle',
    inhaleSeconds: 4,
    holdAfterInhaleSeconds: 4,
    exhaleSeconds: 4,
    holdAfterExhaleSeconds: 4,
    cycles: 8,
    durationMinutes: 10,
    benefits: ['Reduz estresse', 'Melhora concentração', 'Calma o sistema nervoso'],
    benefitsEn: ['Reduces stress', 'Improves concentration', 'Calms nervous system'],
    warnings: ['Não segure a respiração se tiver problemas cardiovasculares'],
    warningsEn: ['Do not hold breath if you have cardiovascular issues'],
    associatedChakras: ['Third Eye', 'Crown'],
    associatedSefirot: ['Chesed', 'Tiferet'],
  },
  {
    id: '4-7-8',
    title: '4-7-8 Respiração',
    titleEn: '4-7-8 Breathing',
    description: 'Pranayama yogico para relaxamento profundo e indução do sono.',
    descriptionEn: 'Yogic pranayama for deep relaxation and sleep induction.',
    instructions: [
      'Coloque a ponta da língua no céu da boca atrás dos dentes superiores',
      'Expire completamente pela boca, fazendo um som de whoosh',
      'Feche a boca e inspire pelo nariz contando até 4',
      'Segure a respiração contando até 7',
      'Expire completamente pela boca contando até 8',
      'Repita por 4 ciclos inicialmente',
    ],
    instructionsEn: [
      'Place tongue tip against ridge behind upper teeth',
      'Exhale completely through mouth making a whoosh sound',
      'Close mouth and inhale through nose counting to 4',
      'Hold breath counting to 7',
      'Exhale completely through mouth counting to 8',
      'Repeat for 4 cycles initially',
    ],
    type: '4-7-8',
    intensity: 'gentle',
    inhaleSeconds: 4,
    holdAfterInhaleSeconds: 7,
    exhaleSeconds: 8,
    holdAfterExhaleSeconds: 0,
    cycles: 4,
    durationMinutes: 8,
    benefits: ['Promove sono', 'Reduz ansiedade', 'Ativa sistema parassimpático'],
    benefitsEn: ['Promotes sleep', 'Reduces anxiety', 'Activates parasympathetic system'],
    warnings: ['Não use se tiver problemas respiratórios graves'],
    warningsEn: ['Do not use if you have severe respiratory problems'],
    associatedChakras: ['Heart', 'Crown'],
    associatedSefirot: ['Chesed', 'Netzach'],
  },
  {
    id: 'coherent-breathing',
    title: 'Respiração Coerente',
    titleEn: 'Coherent Breathing',
    description: 'Respiração rítmica de 5 segundos para cada fase, sincronizando coração e mente.',
    descriptionEn: 'Rhythmic 5-second phase breathing, synchronizing heart and mind.',
    instructions: [
      'Sente-se confortavelmente ou deite-se',
      'Respire apenas pelo nariz',
      'Inspire por exatamente 5 segundos',
      'Expire por exatamente 5 segundos',
      'Mantenha o ritmo consistente',
      'Pratique por 10-20 minutos',
    ],
    instructionsEn: [
      'Sit comfortably or lie down',
      'Breathe only through the nose',
      'Inhale for exactly 5 seconds',
      'Exhale for exactly 5 seconds',
      'Maintain consistent rhythm',
      'Practice for 10-20 minutes',
    ],
    type: 'coherent',
    intensity: 'gentle',
    inhaleSeconds: 5,
    holdAfterInhaleSeconds: 0,
    exhaleSeconds: 5,
    holdAfterExhaleSeconds: 0,
    cycles: 20,
    durationMinutes: 15,
    benefits: ['Melhora variabilidade cardíaca', 'Reduz pressão arterial', 'Promove calma'],
    benefitsEn: ['Improves heart rate variability', 'Reduces blood pressure', 'Promotes calm'],
    warnings: [],
    warningsEn: [],
    associatedChakras: ['Heart'],
    associatedSefirot: ['Tiferet'],
  },
  {
    id: 'alternate-nostril',
    title: 'Respiração Alternate Nostril',
    titleEn: 'Alternate Nostril Breathing',
    description: 'Nadi Shodhana para balanceamento hemispérico e calma mental.',
    descriptionEn: 'Nadi Shodhana for hemispheric balance and mental calm.',
    instructions: [
      'Sente-se com coluna ereta',
      'Use o polegar direito para fechar a narina direita',
      'Inspire pela narina esquerda',
      'Use o dedo anelar para fechar a narina esquerda',
      'Expire pela narina direita',
      'Inspire pela narina direita',
      'Feche a direita e expire pela esquerda',
    ],
    instructionsEn: [
      'Sit with spine straight',
      'Use right thumb to close right nostril',
      'Inhale through left nostril',
      'Use ring finger to close left nostril',
      'Exhale through right nostril',
      'Inhale through right nostril',
      'Close right and exhale through left',
    ],
    type: 'alternate-nostril',
    intensity: 'moderate',
    inhaleSeconds: 4,
    holdAfterInhaleSeconds: 4,
    exhaleSeconds: 4,
    holdAfterExhaleSeconds: 0,
    cycles: 10,
    durationMinutes: 12,
    benefits: ['Balanceia hemisférios cerebrais', 'Reduz estresse', 'Melhora concentração'],
    benefitsEn: ['Balances brain hemispheres', 'Reduces stress', 'Improves concentration'],
    warnings: ['Pare se sentir tontura'],
    warningsEn: ['Stop if you feel dizzy'],
    associatedChakras: ['Third Eye', 'Heart'],
    associatedSefirot: ['Keter', 'Chesed'],
  },
  {
    id: 'diaphragmatic',
    title: 'Respiração Diafragmática',
    titleEn: 'Diaphragmatic Breathing',
    description: 'Respiração profunda que ativa o nervo vago para relaxamento profundo.',
    descriptionEn: 'Deep breathing that activates the vagus nerve for deep relaxation.',
    instructions: [
      'Deite-se ou sente-se com as costas apoiadas',
      'Coloque uma mão no peito e outra no abdômen',
      'Respire pelo nariz, permitindo que o abdômen se expanda',
      'Mantenha o peito relativamente imóvel',
      'Expire lentamente pelo nariz',
      'Sinta o abdômen contraindo',
    ],
    instructionsEn: [
      'Lie down or sit with back supported',
      'Place one hand on chest and one on abdomen',
      'Breathe through nose, allowing abdomen to expand',
      'Keep chest relatively still',
      'Exhale slowly through nose',
      'Feel abdomen contracting',
    ],
    type: 'diaphragmatic',
    intensity: 'gentle',
    inhaleSeconds: 4,
    holdAfterInhaleSeconds: 2,
    exhaleSeconds: 6,
    holdAfterExhaleSeconds: 2,
    cycles: 10,
    durationMinutes: 12,
    benefits: ['Ativa nervo vago', 'Reduz cortisol', 'Melhora digestão'],
    benefitsEn: ['Activates vagus nerve', 'Reduces cortisol', 'Improves digestion'],
    warnings: [],
    warningsEn: [],
    associatedChakras: ['Solar Plexus', 'Heart'],
    associatedSefirot: ['Gevurah', 'Chesed'],
  },
  {
    id: 'holotropic',
    title: 'Respiração Holotrópica',
    titleEn: 'Holotropic Breathwork',
    description: 'Técnica de respiração profunda para estados expandidos de consciência.',
    descriptionEn: 'Deep breathing technique for expanded states of consciousness.',
    instructions: [
      'Deite-se confortavelmente',
      'Respire profundamente pelo nariz em um ritmo rápido',
      'Mantenha a respiração contínua sem pausas',
      'Permita que a respiração se intensifique naturalmente',
      'Permaneça presente com as sensações',
      'Reduza gradualmente a intensidade após 20-30 minutos',
      'Descanse em silêncio por 15 minutos',
    ],
    instructionsEn: [
      'Lie down comfortably',
      'Breathe deeply through nose in a fast rhythm',
      'Maintain continuous air flow without pauses',
      'Allow breathing to intensify naturally',
      'Stay present with sensations',
      'Gradually reduce intensity after 20-30 minutes',
      'Rest in silence for 15 minutes',
    ],
    type: 'holotropic',
    intensity: 'dynamic',
    inhaleSeconds: 1,
    holdAfterInhaleSeconds: 0,
    exhaleSeconds: 1,
    holdAfterExhaleSeconds: 0,
    cycles: 1800,
    durationMinutes: 45,
    benefits: ['Estados alterados', 'Processamento emocional', 'Expansão de consciência'],
    benefitsEn: ['Altered states', 'Emotional processing', 'Consciousness expansion'],
    warnings: ['Não use se tiver epilepsia, glaucoma ou pressão alta', 'Tenha um facilitador presente'],
    warningsEn: ['Do not use if you have epilepsy, glaucoma or high blood pressure', 'Have a facilitator present'],
    associatedChakras: ['All'],
    associatedSefirot: ['Keter', 'Chokmah'],
  },
];

// GET /api/breath/data - Get all breath data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const technique = searchParams.get('technique');
    const category = searchParams.get('category');

    // Return specific exercise by id
    if (id) {
      const exercise = BREATH_EXERCISES.find((e) => e.id === id);
      if (!exercise) {
        return NextResponse.json(
          { error: 'Breath exercise not found', validIds: BREATH_EXERCISES.map((e) => e.id) },
          { status: 404 }
        );
      }
      return NextResponse.json({ exercise });
    }

    // Return specific technique by id
    if (technique) {
      const tech = BREATH_TECHNIQUES.find((t) => t.id === technique);
      if (!tech) {
        return NextResponse.json(
          { error: 'Breath technique not found', validIds: BREATH_TECHNIQUES.map((t) => t.id) },
          { status: 404 }
        );
      }
      return NextResponse.json({ technique: tech });
    }

    // Return exercises by type
    if (type === 'exercises') {
      return NextResponse.json({
        exercises: BREATH_EXERCISES,
        count: BREATH_EXERCISES.length,
      });
    }

    // Return techniques by category
    if (type === 'techniques') {
      let techniques = BREATH_TECHNIQUES;
      if (category) {
        techniques = BREATH_TECHNIQUES.filter((t) => t.intensity === category);
        if (techniques.length === 0) {
          return NextResponse.json(
            { error: 'Invalid category', validCategories: ['gentle', 'moderate', 'dynamic'] },
            { status: 400 }
          );
        }
      }
      return NextResponse.json({
        techniques,
        count: techniques.length,
      });
    }

    // Return all breath data
    return NextResponse.json({
      exercises: BREATH_EXERCISES,
      techniques: BREATH_TECHNIQUES,
      summary: {
        totalExercises: BREATH_EXERCISES.length,
        totalTechniques: BREATH_TECHNIQUES.length,
        categories: ['gentle', 'moderate', 'dynamic'],
        associatedChakras: ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Third Eye', 'Crown', 'All'],
        associatedSefirot: ['Keter', 'Chokmah', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach'],
      },
    });
  } catch (error) {
    console.error('Breath data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}