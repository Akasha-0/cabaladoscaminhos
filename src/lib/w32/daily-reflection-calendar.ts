// src/lib/w32/daily-reflection-calendar.ts
// Cycle 32 worker C — daily reflection ingestion + calendar sync
// Composes w27/daily-reflection (reflection shape) + w30/daily-reflection-push (push trigger)
// Scope: iCal/Google/Apple feed export, opt-in scheduling, time-zone safe
// Namespace: w32 — self-contained, no runtime deps on other waves

export type CalendarProvider = "google" | "apple" | "outlook" | "generic_ics";

export interface ReflectionSchedule {
  readonly id: string;
  readonly userId: string;
  readonly hourLocal: number; // 0-23
  readonly minuteLocal: number; // 0-59
  readonly timezone: string; // IANA, e.g. "America/Sao_Paulo"
  readonly weekdays: ReadonlyArray<0 | 1 | 2 | 3 | 4 | 5 | 6>; // 0=Sun
  readonly enabled: boolean;
  readonly promptSource: "system" | "circulo" | "personalizado";
  readonly customPrompt: string | null;
}

export interface ICalEvent {
  readonly uid: string;
  readonly dtStart: string; // iCal UTC: YYYYMMDDTHHmmssZ
  readonly dtEnd: string;
  readonly summary: string;
  readonly description: string;
  readonly url: string;
  readonly categories: ReadonlyArray<string>;
}

/** Build a stable iCal UID for a user's reflection feed. */
export function buildReflectionFeedUid(userId: string, scheduleId: string): string {
  return `reflection-${userId}-${scheduleId}@akasha.portal`;
}

/** Convert (hour, minute) in a given IANA timezone to a UTC iCal timestamp. */
export function localTimeToICalUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  timezone: string,
): string {
  // Compute the local epoch ms using the timezone offset for that instant.
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offsetMin = getTimezoneOffsetMinutes(timezone, utcGuess);
  const localEpoch = utcGuess - offsetMin * 60_000;
  return formatIcalUtc(new Date(localEpoch));
}

function getTimezoneOffsetMinutes(timezone: string, utcMs: number): number {
  // Uses Intl.DateTimeFormat to compute the offset of `timezone` at the given UTC instant.
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = dtf.formatToParts(new Date(utcMs));
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
    const asUtc = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour") === 24 ? 0 : get("hour"),
      get("minute"),
      get("second"),
    );
    return Math.round((asUtc - utcMs) / 60_000);
  } catch {
    return 0;
  }
}

function formatIcalUtc(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}` +
    `${pad(d.getUTCMonth() + 1)}` +
    `${pad(d.getUTCDate())}T` +
    `${pad(d.getUTCHours())}` +
    `${pad(d.getUTCMinutes())}` +
    `${pad(d.getUTCSeconds())}Z`
  );
}

/** Generate the next N reflection events from a schedule, starting at `fromDate`. */
export function generateUpcomingEvents(
  schedule: ReflectionSchedule,
  fromDate: Date,
  count: number,
): ReadonlyArray<ICalEvent> {
  if (!schedule.enabled) return [];
  const events: ICalEvent[] = [];
  const cursor = new Date(fromDate);
  cursor.setUTCHours(0, 0, 0, 0);
  let safety = 0;
  while (events.length < count && safety < count * 14) {
    safety += 1;
    const day = cursor.getUTCDay();
    if (schedule.weekdays.includes(day as 0 | 1 | 2 | 3 | 4 | 5 | 6)) {
      const utcStart = localTimeToIcalUtc(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth() + 1,
        cursor.getUTCDate(),
        schedule.hourLocal,
        schedule.minuteLocal,
        schedule.timezone,
      );
      const endDate = new Date(
        Date.parse(
          utcStart.replace(
            /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
            "$1-$2-$3T$4:$5:$6Z",
          ),
        ) +
          15 * 60_000,
      );
      const utcEnd = formatIcalUtc(endDate);
      const prompt = resolvePrompt(schedule);
      events.push({
        uid: `${buildReflectionFeedUid(schedule.userId, schedule.id)}-${utcStart}`,
        dtStart: utcStart,
        dtEnd: utcEnd,
        summary: "Reflexão diária — Akasha",
        description: prompt,
        url: "https://akasha.portal/reflexao",
        categories: ["reflexao", "akasha"],
      });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return events;
}

function resolvePrompt(schedule: ReflectionSchedule): string {
  if (schedule.promptSource === "personalizado" && schedule.customPrompt) {
    return schedule.customPrompt;
  }
  if (schedule.promptSource === "circulo") {
    return "Como seu círculo contribuiu para sua jornada hoje?";
  }
  return "Reserve 5 minutos para respirar e registrar o que emergiu.";
}

/** Render a minimal VCALENDAR feed for a schedule. */
export function renderIcsFeed(
  schedule: ReflectionSchedule,
  events: ReadonlyArray<ICalEvent>,
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Akasha Portal//Daily Reflection//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const ev of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.uid}`,
      `DTSTAMP:${formatIcalUtc(new Date())}`,
      `DTSTART:${ev.dtStart}`,
      `DTEND:${ev.dtEnd}`,
      `SUMMARY:${escapeIcs(ev.summary)}`,
      `DESCRIPTION:${escapeIcs(ev.description)}`,
      `URL:${ev.url}`,
      `CATEGORIES:${ev.categories.join(",")}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/** Build a subscription URL hint for a given provider. */
export function providerSubscriptionHint(
  provider: CalendarProvider,
  feedToken: string,
): string {
  switch (provider) {
    case "google":
      return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(`webcal://akasha.portal/api/reflexao/ics?token=${feedToken}`)}`;
    case "apple":
      return `webcal://akasha.portal/api/reflexao/ics?token=${feedToken}`;
    case "outlook":
      return `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(`webcal://akasha.portal/api/reflexao/ics?token=${feedToken}`)}`;
    case "generic_ics":
      return `webcal://akasha.portal/api/reflexao/ics?token=${feedToken}`;
  }
}

/** Validate a user-provided timezone string. */
export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
