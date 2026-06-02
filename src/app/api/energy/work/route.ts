// ============================================================
// ENERGY WORK API - CABALA DOS CAMINHOS
// Enhanced with cross-tradition spiritual correlations
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { SefirotSchema, ChakraSchema, ElementSchema } from '@/lib/api/spiritual-filters'
// ─── Spiritual filter schemas imported from @/lib/api/spiritual-filters ─────

const EnergyWorkTypeSchema = z.enum(['channeling', 'healing', 'cleansing', 'balancing', 'manifestation', 'protection'])

const EnergyWorkQuerySchema = z.object({
  type: EnergyWorkTypeSchema.optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
})

interface EnergyTechnique {
  id: string
  name: string
  nameEn?: string
  type: string
  description: string
  steps: string[]
  benefits: string[]
  precautions: string[]
  sefirot: string[]
  chakra: number
  element: string
  orixa: string
  affirmation: string
  frequency: string
}

// ─── Energy Techniques with Spiritual Correlations ──────────────────────────────────────────
const ENERGY_TECHNIQUES: EnergyTechnique[] = [
  {
    id: 'reiiki',
    name: 'Canalização de Energia Reiki',
    nameEn: 'Reiki Energy Channeling',
    type: 'healing',
    description: 'Channel universal life force energy through the palms for healing and balance.',
    steps: [
      'Center yourself with three deep breaths',
      'Set your intention for healing',
      'Place hands gently on or above the recipient',
      'Visualize white light flowing through your crown',
      'Allow energy to flow naturally for 3-5 minutes',
      'Close with gratitude and energy sealing',
    ],
    benefits: ['Promotes physical healing', 'Reduces stress and anxiety', 'Balances energy field', 'Supports emotional release'],
    precautions: ['Not a substitute for medical care', 'Avoid during acute infections', 'Respect personal energy boundaries'],
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A energia divina flui através de minhas mãos para curar',
    frequency: '528 Hz',
  },
  {
    id: 'cord-cutting',
    name: 'Corte de Cordões Energéticos',
    nameEn: 'Energy Cord Cutting',
    type: 'cleansing',
    description: 'Sever energetic connections to people, places, or situations that drain your energy.',
    steps: [
      'Identify the connection to release',
      'Visualize a cord connecting you to the source',
      'See golden scissors or sword of light',
      'Cut the cord with clear intention',
      'Seal the opening with white light',
      'Affirm your independence and freedom',
    ],
    benefits: ['Releases energetic attachments', 'Restores personal power', 'Clears emotional baggage', 'Creates energetic boundaries'],
    precautions: ['Ensure you are ready to release', 'May bring up emotional processing', 'Trust your readiness'],
    sefirot: ['Gevurah', 'Hod'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Corto todos os cordões que não me servem e libero minha energia',
    frequency: '639 Hz',
  },
  {
    id: 'grounding',
    name: 'Prática de Ancoramento Energético',
    nameEn: 'Energy Grounding Practice',
    type: 'balancing',
    description: 'Connect with Earth energy to stabilize and anchor your personal energy field.',
    steps: [
      'Stand or sit comfortably',
      'Visualize roots extending from your feet',
      'Allow roots to go deep into the Earth',
      'Feel the connection with Earth energy',
      'Draw Earth energy up through the roots',
      'Breathe it into your entire being',
    ],
    benefits: ['Stabilizes scattered energy', 'Increases present-moment awareness', 'Strengthens energy boundaries', 'Promotes feelings of safety'],
    precautions: ['May intensify during initial practice', 'Some may feel disoriented - start slowly'],
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'Estou ancorado na terra sagrada, seguro e estável',
    frequency: '432 Hz',
  },
  {
    id: 'shielding',
    name: 'Técnica de Proteção Energética',
    nameEn: 'Shielding Technique',
    type: 'protection',
    description: 'Create an energetic shield to protect yourself from negative influences.',
    steps: [
      'Stand or sit in meditation posture',
      'Visualize white light surrounding your body',
      'Expand the light into an egg-shaped shield',
      'Set the intention that only love enters',
      'Feel the shield activating and sealing',
      'Carry this protection throughout your day',
    ],
    benefits: ['Blocks negative energy', 'Strengthens aura', 'Maintains personal energy integrity', 'Creates safe energetic space'],
    precautions: ['Do not use for extended periods without breaks', 'Periodically refresh the shield'],
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'Sou protegido por uma luz divina que permite apenas amor',
    frequency: '417 Hz',
  },
  {
    id: 'abundance',
    name: 'Prática de Manifestação Energética',
    nameEn: 'Energy Manifestation Practice',
    type: 'manifestation',
    description: 'Align your energy field with abundance to attract desired outcomes.',
    steps: [
      'Clarify your intention with emotion',
      'Visualize already having achieved your goal',
      'Feel the emotions as if it is real now',
      'Release attachment to the outcome',
      'Take inspired action when prompted',
      'Express gratitude for what is coming',
    ],
    benefits: ['Aligns energy with goals', 'Increases abundance awareness', 'Attracts opportunities', 'Elevates overall vibration'],
    precautions: ['Avoid forcing outcomes', 'Trust divine timing', 'Remain open to unexpected paths'],
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A abundância flui naturalmente para mim em todas as formas',
    frequency: '528 Hz',
  },
  {
    id: 'chakra-activation',
    name: 'Ativação de Chakras',
    nameEn: 'Chakra Activation',
    type: 'healing',
    description: 'Activate and balance the energy centers for optimal spiritual flow.',
    steps: [
      'Begin at the root chakra, visualize red light',
      'Move up through each chakra with appropriate color',
      'Hold intention at each center for 3-5 breaths',
      'Visualize each chakra spinning and radiating light',
      'Complete with crown chakra open to divine light',
      'Seal with gratitude for the energy flow',
    ],
    benefits: ['Balances energy centers', 'Increases spiritual awareness', 'Promotes emotional harmony', 'Enhances intuition'],
    precautions: ['Start slowly if new to energy work', 'Ground after practice', 'Trust your pace'],
    sefirot: ['Kether', 'Tipheret', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Meus chakras estão equilibrados e irradiam luz harmoniosa',
    frequency: '639 Hz',
  },
  {
    id: 'auracleansing',
    name: 'Limpeza da Aura',
    nameEn: 'Aura Cleansing',
    type: 'cleansing',
    description: 'Clean and purify your energetic field to remove accumulated negative energies.',
    steps: [
      'Stand or sit comfortably with eyes closed',
      'Visualize a waterfall of white light above',
      'Allow the light to wash through your aura',
      'Feel negative energies dissolving and flowing away',
      'Visualize your aura bright and luminous',
      'Seal with a burst of golden light',
    ],
    benefits: ['Removes energetic debris', 'Brightens aura', 'Increases energy flow', 'Promotes spiritual clarity'],
    precautions: ['May feel emotional during cleansing', 'Rest after practice', 'Hydrate well'],
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Minha aura brilha com luz pura e limpa',
    frequency: '741 Hz',
  },
  {
    id: 'third-eye-opening',
    name: 'Abertura do Terceiro Olho',
    nameEn: 'Third Eye Opening',
    type: 'channeling',
    description: 'Activate the sixth chakra to enhance intuition and spiritual perception.',
    steps: [
      'Sit in meditation with spine straight',
      'Focus on the point between eyebrows',
      'Visualize indigo light growing brighter',
      'Chant mantra "Om" or "Aum" three times',
      'Allow visions or insights to arise without attachment',
      'Close with gratitude for increased awareness',
    ],
    benefits: ['Enhances intuition', 'Opens psychic abilities', 'Promotes inner vision', 'Deepens spiritual connection'],
    precautions: ['Not for those with tendency to dissociate', 'Ground well after', 'Proceed gradually'],
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Meu terceiro olho está aberto para a verdade divina',
    frequency: '963 Hz',
  },
  {
    id: 'heart-healing',
    name: 'Cura do Chakra do Coração',
    nameEn: 'Heart Chakra Healing',
    type: 'healing',
    description: 'Heal and open the heart chakra to receive and give unconditional love.',
    steps: [
      'Place hands over heart center',
      'Breathe into the heart space with green light',
      'Forgive yourself and others with each breath',
      'Visualize heart opening like a flower',
      'Feel love radiating to all beings',
      'Receive love from the divine source',
    ],
    benefits: ['Heals emotional wounds', 'Opens capacity for love', 'Balances giving and receiving', 'Promotes emotional wellbeing'],
    precautions: ['May release stored emotions', 'Process with compassion', 'Seek support if needed'],
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Meu coração irradia amor incondicional para mim e para todos',
    frequency: '528 Hz',
  },
  {
    id: 'sacral-cleansing',
    name: 'Cura do Chakra Sacral',
    nameEn: 'Sacral Chakra Healing',
    type: 'cleansing',
    description: 'Cleanse and balance the sacral chakra for emotional harmony and creativity.',
    steps: [
      'Sit comfortably with pelvis relaxed',
      'Visualize orange light at the sacral center',
      'Breathe deeply into the lower abdomen',
      'Release emotions stored in this center',
      'Affirm your creative power and emotional flow',
      'Feel the water element purifying and cleansing',
    ],
    benefits: ['Balances emotions', 'Enhances creativity', 'Supports healthy relationships', 'Promotes emotional flow'],
    precautions: ['May bring up emotional release', 'Allow feelings to flow', 'Be gentle with yourself'],
    sefirot: ['Yesod', 'Netzach'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Meu chakra sacral flui com harmonia e criatividade',
    frequency: '396 Hz',
  },
]

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const parseResult = EnergyWorkQuerySchema.safeParse({
      type: searchParams.get('type'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      limit: searchParams.get('limit'),
    })

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 })
    }

    const { type, sefirot, chakra, element, limit } = parseResult.data

    let techniques = [...ENERGY_TECHNIQUES]

    // Filter by type
    if (type) {
      techniques = techniques.filter(t => t.type === type)
    }

    // Filter by spiritual correlations
    if (sefirot) {
      techniques = techniques.filter(t => t.sefirot.includes(sefirot))
    }
    if (chakra) {
      techniques = techniques.filter(t => t.chakra === chakra)
    }
    if (element) {
      techniques = techniques.filter(t => t.element === element)
    }

    // Apply limit
    if (limit) {
      techniques = techniques.slice(0, limit)
    }

    // Statistics
    const stats = {
      byType: ENERGY_TECHNIQUES.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byElement: ENERGY_TECHNIQUES.reduce((acc, t) => {
        acc[t.element] = (acc[t.element] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byChakra: ENERGY_TECHNIQUES.reduce((acc, t) => {
        acc[t.chakra] = (acc[t.chakra] || 0) + 1
        return acc
      }, {} as Record<number, number>),
      bySefirot: ENERGY_TECHNIQUES.reduce((acc, t) => {
        t.sefirot.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1
        })
        return acc
      }, {} as Record<string, number>),
      byOrixa: ENERGY_TECHNIQUES.reduce((acc, t) => {
        acc[t.orixa] = (acc[t.orixa] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      totalTechniques: ENERGY_TECHNIQUES.length,
    }

    return NextResponse.json({
      success: true,
      techniques,
      total: techniques.length,
      stats,
    })
  } catch (error) {
    const err = error as Error
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 })
  }
}