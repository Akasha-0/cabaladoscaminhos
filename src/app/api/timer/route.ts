import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const CreateTimerSchema = z.object({
  label: z.string().optional().default(""),
  durationSeconds: z.number().positive("Must be positive"),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const TimerQuerySchema = z.object({
  id: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  status: z.enum(['running', 'paused', 'completed']).optional(),
});

// ─── Spiritual Correlations by Duration ──────────────────────────────────────────
const DURATION_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
}> = {
  short: { sefirot: ['Hod', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'O momento presente é sagrado' },
  medium: { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Equilibro entre ação e contemplação' },
  long: { sefirot: ['Binah', 'Kether'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Mergulho na profundidade do ser' },
};

// ─── Timer Types ──────────────────────────────────────────────────────────
interface TimerSpiritualCorrelations {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
}

interface TimerEntry {
  id: string;
  label: string;
  durationSeconds: number;
  startedAt: string;
  endedAt?: string;
  status: "running" | "paused" | "completed";
  spiritualCorrelations?: TimerSpiritualCorrelations;
}

const timers: Map<string, TimerEntry> = new Map();

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getDurationSpiritualCorrelations(seconds: number): TimerSpiritualCorrelations {
  if (seconds < 300) return DURATION_SPIRITUAL_CORRELATIONS.short;
  if (seconds < 600) return DURATION_SPIRITUAL_CORRELATIONS.medium;
  return DURATION_SPIRITUAL_CORRELATIONS.long;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = CreateTimerSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: "Invalid request",
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { label, durationSeconds, sefirot, chakra, element, orixa } = parseResult.data;
    
    // Build spiritual correlations from request or default by duration
    const spiritualCorrelations: TimerSpiritualCorrelations = sefirot && chakra && element && orixa
      ? { sefirot: [sefirot], chakra, element, orixa, affirmation: `Dedico ${durationSeconds} segundos ao crescimento espiritual` }
      : getDurationSpiritualCorrelations(durationSeconds);
    
    const entry: TimerEntry = {
      id: generateId(),
      label,
      durationSeconds,
      startedAt: new Date().toISOString(),
      status: "running",
      spiritualCorrelations,
    };
    timers.set(entry.id, entry);
    setTimeout(() => {
      const timer = timers.get(entry.id);
      if (timer && timer.status === "running") {
        timer.status = "completed";
        timer.endedAt = new Date().toISOString();
      }
    }, durationSeconds * 1000);
    return NextResponse.json({ success: true, ...entry }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create timer" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parseResult = TimerQuerySchema.safeParse({
      id: searchParams.get("id"),
      sefirot: searchParams.get("sefirot"),
      chakra: searchParams.get("chakra"),
      element: searchParams.get("element"),
      status: searchParams.get("status"),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: "Invalid request",
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { id, sefirot, chakra, element, status } = parseResult.data;
    
    if (id) {
      const entry = timers.get(id);
      if (!entry) {
        return NextResponse.json({ success: false, error: "Timer not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, timer: entry });
    }
    
    // Filter timers by spiritual correlations
    let result = Array.from(timers.values());
    
    if (sefirot) {
      result = result.filter(t => t.spiritualCorrelations?.sefirot.includes(sefirot));
    }
    if (chakra) {
      result = result.filter(t => t.spiritualCorrelations?.chakra === chakra);
    }
    if (element) {
      result = result.filter(t => t.spiritualCorrelations?.element === element);
    }
    if (status) {
      result = result.filter(t => t.status === status);
    }
    
    return NextResponse.json({
      success: true,
      timers: result,
      count: result.length,
      stats: {
        byStatus: result.reduce((acc, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byElement: result.reduce((acc, t) => {
          const el = t.spiritualCorrelations?.element || 'Unknown';
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byChakra: result.reduce((acc, t) => {
          const ch = t.spiritualCorrelations?.chakra || 0;
          acc[ch] = (acc[ch] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to get timers" }, { status: 500 });
  }
}

// DELETE handler to clean up completed timers
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clearCompleted = searchParams.get("clear") === "completed";
    
    if (clearCompleted) {
      let count = 0;
      timers.forEach((timer, id) => {
        if (timer.status === "completed") {
          timers.delete(id);
          count++;
        }
      });
      return NextResponse.json({ success: true, message: `Cleared ${count} completed timers` });
    }
    
    return NextResponse.json({ success: false, error: "Specify ?clear=completed" }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete timers" }, { status: 500 });
  }
}