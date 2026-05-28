import { NextRequest, NextResponse } from "next/server";

interface TimerEntry {
  id: string;
  label: string;
  durationSeconds: number;
  startedAt: string;
  endedAt?: string;
  status: "running" | "paused" | "completed";
}

// In-memory store for demo (replace with DB in production)
const timers: Map<string, TimerEntry> = new Map();

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = await req.json().catch(() => ({}));
  const { label, durationSeconds } = body;

  if (!durationSeconds || typeof durationSeconds !== "number" || durationSeconds <= 0) {
    return NextResponse.json({ error: "durationSeconds must be a positive number" }, { status: 400 });
  }

  const entry: TimerEntry = {
    id: generateId(),
    label: typeof label === "string" ? label : "",
    durationSeconds,
    startedAt: new Date().toISOString(),
    status: "running",
  };

  timers.set(entry.id, entry);

  // Auto-complete timer after duration
  setTimeout(() => {
    const timer = timers.get(entry.id);
    if (timer && timer.status === "running") {
      timer.status = "completed";
      timer.endedAt = new Date().toISOString();
    }
  }, durationSeconds * 1000);

  return NextResponse.json(entry, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const entry = timers.get(id);
    if (!entry) {
      return NextResponse.json({ error: "Timer not found" }, { status: 404 });
    }
    return NextResponse.json(entry);
  }

  return NextResponse.json(Array.from(timers.values()));
}
