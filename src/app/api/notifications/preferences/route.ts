// fallow-ignore-next-line: high-complexity
import { z } from "zod";
import { withErrorHandler } from "@/lib/error-handling";

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const NotificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  transitAlerts: z.boolean(),
  dailyInsights: z.boolean(),
  weeklyReport: z.boolean().optional(),
  moonAlerts: z.boolean().optional(),
  orixaReminders: z.boolean().optional(),
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()),
    chakra: z.number(),
    element: z.string(),
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});

const PreferencesQuerySchema = z.object({
  format: z.enum(['full', 'summary']).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const UpdatePreferencesSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  transitAlerts: z.boolean().optional(),
  dailyInsights: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
  moonAlerts: z.boolean().optional(),
  orixaReminders: z.boolean().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Notification Preferences ──────────────────────────────────────────
const PREFERENCE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  email: {
    sefirot: ['Hod', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'As mensagens espirituais chegam até mim',
    frequency: '741 Hz',
  },
  push: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Recebo alertas em tempo real',
    frequency: '741 Hz',
  },
  transitAlerts: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'Os trânsitos astrais me guiam',
    frequency: '639 Hz',
  },
  dailyInsights: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'A sabedoria diária ilumina meu caminho',
    frequency: '963 Hz',
  },
  weeklyReport: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O relatório semanal revela meu progresso',
    frequency: '528 Hz',
  },
  moonAlerts: {
    sefirot: ['Yesod', 'Binah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A lua me conecta com a energia feminina',
    frequency: '639 Hz',
  },
  orixaReminders: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Meus Orixás me lembram de suas lições',
    frequency: '528 Hz',
  },
};

// ─── Type Definitions ───────────────────────────────────────────────────────
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  transitAlerts: boolean;
  dailyInsights: boolean;
  weeklyReport?: boolean;
  moonAlerts?: boolean;
  orixaReminders?: boolean;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

export const dynamic = 'force-dynamic';

// In-memory store (would be replaced with database)
const preferenceStore: Map<string, NotificationPreferences> = new Map([
  ['default', {
    email: true,
    push: false,
    transitAlerts: true,
    dailyInsights: true,
    weeklyReport: true,
    moonAlerts: true,
    orixaReminders: false,
    spiritualCorrelations: PREFERENCE_SPIRITUAL_CORRELATIONS['dailyInsights'],
  }],
]);

export const GET = withErrorHandler(async (req: NextRequest) => {
  try {
    const userId = req.headers.get('x-user-id') || 'default';
    const { searchParams } = new URL(req.url);
    const parseResult = PreferencesQuerySchema.safeParse({
      format: searchParams.get('format'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const preferences = preferenceStore.get(userId) || preferenceStore.get('default')!;
    const { format, sefirot, chakra, element, orixa } = parseResult.data;

    // Calculate spiritual stats
    const spiritualStats = {
      byType: Object.entries(preferences).reduce((acc, [key, value]) => {
        if (typeof value === 'boolean' && value) {
          acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      bySefirot: preferences.spiritualCorrelations?.sefirot.reduce((acc, s) => {
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      byChakra: preferences.spiritualCorrelations?.chakra ? {
        [preferences.spiritualCorrelations.chakra]: 1
      } : {},
      byElement: preferences.spiritualCorrelations?.element ? {
        [preferences.spiritualCorrelations.element]: 1
      } : {},
      byOrixa: preferences.spiritualCorrelations?.orixa ? {
        [preferences.spiritualCorrelations.orixa]: 1
      } : {},
    };

    if (format === 'summary') {
      return NextResponse.json({
        success: true,
        preferences: {
          email: preferences.email,
          push: preferences.push,
          totalEnabled: Object.values(preferences).filter(v => typeof v === 'boolean' && v).length,
        },
        spiritualCorrelations: PREFERENCE_SPIRITUAL_CORRELATIONS,
        spiritualStats,
      });
    }

    return NextResponse.json({
      success: true,
      preferences: {
        ...preferences,
        channels: {
          email: { enabled: preferences.email, label: 'Email notifications' },
          push: { enabled: preferences.push, label: 'Push notifications' },
        },
        alerts: {
          transitAlerts: { enabled: preferences.transitAlerts, label: 'Astrology transit alerts' },
          dailyInsights: { enabled: preferences.dailyInsights, label: 'Daily spiritual insights' },
          weeklyReport: { enabled: preferences.weeklyReport, label: 'Weekly progress report' },
          moonAlerts: { enabled: preferences.moonAlerts, label: 'Lunar phase alerts' },
          orixaReminders: { enabled: preferences.orixaReminders, label: 'Orixá daily reminders' },
        },
      },
      spiritualCorrelations: PREFERENCE_SPIRITUAL_CORRELATIONS,
      spiritualStats,
 meta: {
        userId,
        filters: { format, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  try {
    const userId = req.headers.get('x-user-id') || 'default';
    const body = await req.json();
    const parseResult = UpdatePreferencesSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { email, push, transitAlerts, dailyInsights, weeklyReport, moonAlerts, orixaReminders, sefirot, chakra, element, orixa } = parseResult.data;

    const currentPrefs = preferenceStore.get(userId) || preferenceStore.get('default')!;
    const baseCorr = PREFERENCE_SPIRITUAL_CORRELATIONS['dailyInsights'];

    const updatedPreferences: NotificationPreferences = {
      email: email ?? currentPrefs.email,
      push: push ?? currentPrefs.push,
      transitAlerts: transitAlerts ?? currentPrefs.transitAlerts,
      dailyInsights: dailyInsights ?? currentPrefs.dailyInsights,
      weeklyReport: weeklyReport ?? currentPrefs.weeklyReport,
      moonAlerts: moonAlerts ?? currentPrefs.moonAlerts,
      orixaReminders: orixaReminders ?? currentPrefs.orixaReminders,
      spiritualCorrelations: {
        sefirot: sefirot ? [sefirot] : baseCorr?.sefirot || [],
        chakra: chakra || baseCorr?.chakra || 5,
        element: element || baseCorr?.element || 'Ar',
        orixa: orixa || baseCorr?.orixa || 'Oxalá',
        affirmation: baseCorr?.affirmation || '',
        frequency: baseCorr?.frequency || '741 Hz',
      },
    };

    preferenceStore.set(userId, updatedPreferences);

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
      spiritualCorrelations: updatedPreferences.spiritualCorrelations,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
});