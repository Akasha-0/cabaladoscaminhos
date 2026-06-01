// src/app/api/akashic/records/route.ts
// Akashic Records API - skip linting
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const RecordTypeSchema = z.enum([
  'life', 'karma', 'soul', 'past_life', 'future', 'ancestral', 'universal'
]);
const AccessLevelSchema = z.enum(['basic', 'intermediate', 'advanced', 'master']);
const SoulAgeSchema = z.enum(['young', 'mature', 'old', 'ancient']);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Daat', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);

const AkashicQuerySchema = z.object({
  recordType: RecordTypeSchema.optional(),
  accessLevel: AccessLevelSchema.optional(),
  soulAge: SoulAgeSchema.optional(),
  theme: z.string().optional(),
  limit: z.coerce.number().int().positive().max(10).optional(),
  chakra: ChakraSchema.optional(),
  sefirot: SefirotSchema.optional(),
});

const AkashicRecordSchema = z.object({
  id: z.string(),
  recordType: RecordTypeSchema,
  accessLevel: AccessLevelSchema,
  entry: z.string(),
  insights: z.array(z.string()),
  guidance: z.string(),
  symbols: z.array(z.string()),
  affirmations: z.array(z.string()),
  practices: z.array(z.string()),
  timestamp: z.string(),
  sefirot: z.array(SefirotSchema).optional(),
  chakra: z.number().int().min(1).max(7).optional(),
  orixa: z.string().optional(),
});

export type RecordType = z.infer<typeof RecordTypeSchema>;
export type AccessLevel = z.infer<typeof AccessLevelSchema>;
export type AkashicRecord = z.infer<typeof AkashicRecordSchema>;
export const dynamic = 'force-dynamic';

// ─── Record Type Correlations ──────────────────────────────────────────────────────────
const RECORD_CORRELATIONS: Record<RecordType, {
  sefirot: z.infer<typeof SefirotSchema>[];
  chakra: number;
  orixa: string;
  element: string;
  planet: string;
}> = {
  life: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 4,
    orixa: 'Oxalá',
    element: 'Ar',
    planet: 'Sol',
  },
  karma: {
    sefirot: ['Gevurah', 'Chesed'],
    chakra: 3,
    orixa: 'Ogum',
    element: 'Fogo',
    planet: 'Marte',
  },
  soul: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    orixa: 'Oxalá',
    element: 'Éter',
    planet: 'Sol',
  },
  past_life: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 2,
    orixa: 'Iemanjá',
    element: 'Água',
    planet: 'Lua',
  },
  future: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    orixa: 'Oxumaré',
    element: 'Ar',
    planet: 'Júpiter',
  },
  ancestral: {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    orixa: 'Iemanjá',
    element: 'Terra',
    planet: 'Saturno',
  },
  universal: {
    sefirot: ['Kether', 'Daat'],
    chakra: 7,
    orixa: 'Oxalá',
    element: 'Éter',
    planet: 'Netuno',
  },
};

// ─── Guidance Templates ──────────────────────────────────────────────────────────
const guidanceTemplates: Record<RecordType, string[]> = {
  life: [
    'You are currently experiencing a pivotal transformation phase',
    'Your soul chose these challenges for accelerated growth',
    'Current relationships serve your soul\'s learning contract',
    'Trust the timing of your internal guidance system',
  ],
  karma: [
    'Balance is being restored through this cycle',
    'This lesson has appeared before in your journey',
    'You have the power to resolve old patterns now',
    'Forgiveness liberates both giver and receiver',
  ],
  soul: [
    'Your soul carries unique gifts waiting to be expressed',
    'You came here with specific soul contracts to fulfill',
    'Your essence knows the path even when the mind doubts',
    'Authentic expression is your birthright',
  ],
  past_life: [
    'Skills from past incarnations are awakening',
    'Old wounds from previous lives are being healed',
    'Relationships across lifetimes are finding resolution',
    'Unfinished business calls for completion',
  ],
  future: [
    'Multiple paths are available to you',
    'Your choices shape which probability manifests',
    'The highest timeline aligns with your soul purpose',
    'Trust the unseen forces guiding your path',
  ],
  ancestral: [
    'Blessings from lineage are available to claim',
    'Ancestral patterns can be consciously transformed',
    'You carry both gifts and wounds from those before',
    'Breaking cycles is itself a sacred act',
  ],
  universal: [
    'Cosmic laws operate beyond personal preference',
    'Your frequency determines your experience of reality',
    'All is connected in the unified field of consciousness',
    'The universe conspires in favor of your evolution',
  ],
};

const affirmationSets: Record<RecordType, string[]> = {
  life: [
    'I am living my soul\'s purpose',
    'I embrace growth with courage',
    'My challenges are stepping stones',
    'I am worthy of my own love',
  ],
  karma: [
    'I release what no longer serves me',
    'I am free from old patterns',
    'I choose love over fear',
    'I create new karmic patterns',
  ],
  soul: [
    'I honor my soul\'s design',
    'I express my unique gifts freely',
    'My essence shines through all aspects of my life',
    'I am a divine expression of the Creator',
  ],
  past_life: [
    'I integrate wisdom from all my lifetimes',
    'I release burdens from past lives',
    'I honor my journey through time',
    'I am free to create new patterns',
  ],
  future: [
    'I align with my highest timeline',
    'My future self supports my present choices',
    'I am the architect of my destiny',
    'The best is yet to come',
  ],
  ancestral: [
    'I claim my ancestral gifts',
    'I break patterns that no longer serve',
    'I honor my lineage while creating new ways',
    'Blessings flow through me to future generations',
  ],
  universal: [
    'I am one with all that is',
    'I am a channel for divine light',
    'I am connected to the infinite source',
    'I am a unique expression of universal consciousness',
  ],
};

const symbolSets: Record<RecordType, string[]> = {
  life: ['spiral', 'path', 'mirror', 'river'],
  karma: ['scales', 'chain', 'key', 'door'],
  soul: ['butterfly', 'phoenix', 'feather', 'light'],
  past_life: ['hourglass', 'doorway', 'keys', 'memories'],
  future: ['star', 'compass', 'map', 'horizon'],
  ancestral: ['tree', 'roots', 'crown', 'lineage'],
  universal: ['infinity', 'star', 'circle', 'void'],
};

const practiceSets: Record<RecordType, string[]> = {
  life: ['Meditation on present moment', 'Journaling life purpose', 'Soul-searching walks in nature'],
  karma: ['Forgiveness meditation', 'Release rituals', 'Breathwork for letting go'],
  soul: ['Soul retrieval meditation', 'Connecting with guides', 'Dream work'],
  past_life: ['Past life regression meditation', 'Timeline healing', 'Inner child work'],
  future: ['Visualization of ideal future', 'Meditation on higher self', 'Setting soul intentions'],
  ancestral: ['Ancestral offerings', 'Genealogy meditation', 'Honoring lineage rituals'],
  universal: ['Cosmic meditation', 'Unity consciousness practices', 'Transcendental meditation'],
};

// ─── In-memory Records Store ──────────────────────────────────────────────────────────
const recordsStore: AkashicRecord[] = [];

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parseResult = AkashicQuerySchema.safeParse({
      recordType: searchParams.get('recordType'),
      accessLevel: searchParams.get('accessLevel'),
      soulAge: searchParams.get('soulAge'),
      theme: searchParams.get('theme'),
      limit: searchParams.get('limit'),
      chakra: searchParams.get('chakra'),
      sefirot: searchParams.get('sefirot'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { recordType, accessLevel, soulAge, theme, limit, chakra, sefirot } = parseResult.data;

    let records = [...recordsStore];

    // Filter by record type
    if (recordType) {
      records = records.filter(r => r.recordType === recordType);
    }

    // Filter by access level
    if (accessLevel) {
      records = records.filter(r => r.accessLevel === accessLevel);
    }

    // Filter by chakra
    if (chakra) {
      records = records.filter(r => r.chakra === chakra);
    }

    // Filter by sefirot
    if (sefirot) {
      records = records.filter(r => r.sefirot?.includes(sefirot));
    }

    // Apply limit
    if (limit) {
      records = records.slice(0, limit);
    }

    // If no records, generate based on record type
    if (records.length === 0 && recordType) {
      const correlation = RECORD_CORRELATIONS[recordType];
      const guidance = guidanceTemplates[recordType];
      const affirmations = affirmationSets[recordType];
      const symbols = symbolSets[recordType];
      const practices = practiceSets[recordType];

      const generatedRecord: AkashicRecord = {
        id: `akashic_${Date.now()}`,
        recordType,
        accessLevel: accessLevel || 'intermediate',
        entry: `Your ${recordType} records hold profound wisdom for your spiritual journey.`,
        insights: [
          `This ${recordType} record connects to the sefirot of ${correlation.sefirot.join(' and ')}`,
          `The energy of ${correlation.orixa} supports this healing work`,
          `Working with chakra ${correlation.chakra} will accelerate your progress`,
        ],
        guidance: guidance[Math.floor(Math.random() * guidance.length)],
        symbols: symbols,
        affirmations: affirmations,
        practices: practices,
        timestamp: new Date().toISOString(),
        sefirot: correlation.sefirot,
        chakra: correlation.chakra,
        orixa: correlation.orixa,
      };

      return NextResponse.json({
        success: true,
        record: generatedRecord,
        correlations: {
          sefirot: correlation.sefirot,
          chakra: correlation.chakra,
          orixa: correlation.orixa,
          element: correlation.element,
          planet: correlation.planet,
        },
      });
    }

    // Statistics
    const stats = {
      byType: recordsStore.reduce((acc, r) => {
        acc[r.recordType] = (acc[r.recordType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byAccessLevel: recordsStore.reduce((acc, r) => {
        acc[r.accessLevel] = (acc[r.accessLevel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalRecords: recordsStore.length,
    };

    return NextResponse.json({
      success: true,
      records,
      total: records.length,
      filters: { recordType, accessLevel, soulAge, theme, chakra, sefirot },
      stats,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const recordSchema = z.object({
      recordType: RecordTypeSchema,
      accessLevel: AccessLevelSchema.optional().default('intermediate'),
      entry: z.string().optional(),
      insights: z.array(z.string()).optional(),
      guidance: z.string().optional(),
      symbols: z.array(z.string()).optional(),
      affirmations: z.array(z.string()).optional(),
      practices: z.array(z.string()).optional(),
    });

    const parseResult = recordSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { recordType, accessLevel, entry, insights, guidance, symbols, affirmations, practices } = parseResult.data;
    const correlation = RECORD_CORRELATIONS[recordType];

    const record: AkashicRecord = {
      id: `akashic_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      recordType,
      accessLevel: accessLevel || 'intermediate',
      entry: entry || `Akashic record for ${recordType}`,
      insights: insights || guidanceTemplates[recordType].slice(0, 2),
      guidance: guidance || guidanceTemplates[recordType][0],
      symbols: symbols || symbolSets[recordType],
      affirmations: affirmations || affirmationSets[recordType],
      practices: practices || practiceSets[recordType],
      timestamp: new Date().toISOString(),
      sefirot: correlation.sefirot,
      chakra: correlation.chakra,
      orixa: correlation.orixa,
    };

    recordsStore.push(record);

    return NextResponse.json({
      success: true,
      record,
      message: 'Registro akáshico criado com sucesso',
    }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}