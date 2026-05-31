import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateTimerSchema = z.object({
  label: z.string().optional().default(""),
  durationSeconds: z.number().positive("Must be positive"),
});

const TimerQuerySchema = z.object({
  id: z.string().optional(),
});

interface TimerEntry {
  id: string;
  label: string;
  durationSeconds: number;
  startedAt: string;
  endedAt?: string;
  status: "running" | "paused" | "completed";
}

const timers: Map<string, TimerEntry> = new Map();

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = CreateTimerSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: "Invalid request",
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { label, durationSeconds } = parseResult.data;
    const entry: TimerEntry = {
      id: generateId(),
      label,
      durationSeconds,
      startedAt: new Date().toISOString(),
      status: "running",
    };
    timers.set(entry.id, entry);
    setTimeout(() => {
      const timer = timers.get(entry.id);
      if (timer && timer.status === "running") {
        timer.status = "completed";
        timer.endedAt = new Date().toISOString();
      }
    }, durationSeconds * 1000);
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create timer" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parseResult = TimerQuerySchema.safeParse({ id: searchParams.get("id") });
    if (!parseResult.success) {
      return NextResponse.json({
        error: "Invalid request",
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { id } = parseResult.data;
    if (id) {
      const entry = timers.get(id);
      if (!entry) {
        return NextResponse.json({ error: "Timer not found" }, { status: 404 });
      }
      return NextResponse.json(entry);
    }
    return NextResponse.json(Array.from(timers.values()));
  } catch {
    return NextResponse.json({ error: "Failed to get timers" }, { status: 500 });
  }
}
