'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Ritual } from './useRituals';

export interface CalendarSyncStatus {
  isSynced: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  isLoading: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  ritualId?: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  recurrence?: string;
}

export interface UpcomingRitual extends CalendarEvent {
  ritual: Ritual;
  daysUntil: number;
  isToday: boolean;
}

interface UseRitualCalendarOptions {
  autoSync?: boolean;
  syncInterval?: number;
  userId?: string;
  lookAheadDays?: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Calendar provider helpers
// ──────────────────────────────────────────────────────────────────────────────

interface CalendarManager {
  getCalendars(): Promise<Array<{ id: string; isPrimary?: boolean; title?: string }>>;
  fetchEvents(calendarId: string, startDate: Date, endDate: Date): Promise<Array<{
    id: string;
    title?: string;
    startDate: string;
    endDate?: string;
    allDay?: boolean;
    recurrence?: string;
    notes?: string;
  }>>;
  createEvent(calendarId: string, event: Record<string, unknown>): Promise<{ id: string } | null>;
  deleteEvent(eventId: string): Promise<void>;
}

interface CalendarPlugin {
  listCalendars(): Promise<Array<{ id: string; isPrimary?: boolean; title?: string }>>;
  findEvents(calendarId: string, startDate: number, endDate: number): Promise<Array<{
    id: string;
    title?: string;
    startDate: number;
    endDate?: number;
    allDay?: boolean;
    recurrence?: string;
    notes?: string;
  }>>;
  createEvent(calendarId: string, event: Record<string, unknown>): Promise<{ id: string } | null>;
  deleteEvent(eventId: string): Promise<void>;
}

type ResolvedCalendarProvider = {
  type: 'manager';
  manager: CalendarManager;
} | {
  type: 'plugin';
  plugin: CalendarPlugin;
} | {
  type: 'none';
};

/** Detects which calendar API is available in the current environment. */
function resolveCalendarProvider(): ResolvedCalendarProvider {
  if ('calendarManager' in navigator) {
    return { type: 'manager', manager: navigator.calendarManager as CalendarManager };
  }
  const plugin = (navigator as unknown as { plugin?: { calendar?: CalendarPlugin } }).plugin?.calendar;
  if (plugin) {
    return { type: 'plugin', plugin };
  }
  return { type: 'none' };
}

/** Fetches all calendars from the resolved provider. */
async function fetchCalendarsFromProvider(provider: ResolvedCalendarProvider): Promise<Array<{ id: string; isPrimary?: boolean; title?: string }>> {
  if (provider.type === 'manager') {
    return provider.manager.getCalendars();
  }
  if (provider.type === 'plugin') {
    return provider.plugin.listCalendars();
  }
  return [];
}

/** Creates a calendar event using the resolved provider. */
async function createCalendarEvent(
  provider: ResolvedCalendarProvider,
  calendarId: string,
  event: Record<string, unknown>
): Promise<{ id: string } | null> {
  if (provider.type === 'manager') {
    return provider.manager.createEvent(calendarId, event);
  }
  if (provider.type === 'plugin') {
    return provider.plugin.createEvent(calendarId, event);
  }
  return null;
}

/** Deletes a calendar event using the resolved provider. */
async function deleteCalendarEvent(provider: ResolvedCalendarProvider, eventId: string): Promise<void> {
  if (provider.type === 'manager') {
    return provider.manager.deleteEvent(eventId);
  }
  if (provider.type === 'plugin') {
    return provider.plugin.deleteEvent(eventId);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Event normalization helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Normalizes a raw manager event into the internal CalendarEvent shape. */
function normalizeManagerEvent(event: {
  id: string;
  title?: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  recurrence?: string;
  notes?: string;
}): CalendarEvent {
  return {
    id: event.id,
    title: event.title || '',
    ritualId: extractRitualId(event.notes),
    startDate: event.startDate,
    endDate: event.endDate,
    allDay: event.allDay || false,
    recurrence: event.recurrence,
  };
}

/** Normalizes a raw plugin event into the internal CalendarEvent shape. */
function normalizePluginEvent(event: {
  id: string;
  title?: string;
  startDate: number;
  endDate?: number;
  allDay?: boolean;
  recurrence?: string;
  notes?: string;
}): CalendarEvent {
  return {
    id: event.id,
    title: event.title || '',
    ritualId: extractRitualId(event.notes),
    startDate: new Date(event.startDate).toISOString(),
    endDate: event.endDate ? new Date(event.endDate).toISOString() : undefined,
    allDay: event.allDay || false,
    recurrence: event.recurrence,
  };
}

/** Extracts the ritual ID from event notes (format: "ritual:<id>"). */
function extractRitualId(notes?: string): string | undefined {
  if (!notes) return undefined;
  const idx = notes.indexOf('ritual:');
  if (idx === -1) return undefined;
  return notes.slice(idx + 7).trim();
}

/** Fetches all calendar events across all calendars within the given range. */
async function fetchCalendarEvents(
  provider: ResolvedCalendarProvider,
  now: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  if (provider.type === 'none') return [];

  const calendars = await fetchCalendarsFromProvider(provider);
  const events: CalendarEvent[] = [];

  for (const cal of calendars) {
    if (provider.type === 'manager') {
      const raw = await provider.manager.fetchEvents(cal.id, now, endDate);
      for (const event of raw) {
        events.push(normalizeManagerEvent(event));
      }
    } else if (provider.type === 'plugin') {
      const raw = await provider.plugin.findEvents(cal.id, now.getTime(), endDate.getTime());
      for (const event of raw) {
        events.push(normalizePluginEvent(event));
      }
    }
  }

  return events;
}

// ──────────────────────────────────────────────────────────────────────────────
// Rituals helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Fetches the user's rituals from the API. */
async function fetchRituals(userId?: string): Promise<Ritual[]> {
  const res = await fetch(`/api/rituais?userId=${userId || ''}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.rituais || [];
}

/** Maps ritual array by ID for O(1) lookup. */
function buildRitualMap(rituais: Ritual[]): Map<string, Ritual> {
  const map = new Map<string, Ritual>();
  for (const r of rituais) {
    map.set(r.id, r);
  }
  return map;
}

/** Finds a ritual matching an event by ID or name similarity. */
function matchRitual(event: CalendarEvent, ritualMap: Map<string, Ritual>, ritualList: Ritual[]): Ritual | undefined {
  if (event.ritualId) {
    return ritualMap.get(event.ritualId);
  }
  return ritualList.find(r => r.nome === event.title || event.title.includes(r.nome));
}

/** Converts a CalendarEvent into an UpcomingRitual if a matching ritual exists. */
function toUpcomingRitual(event: CalendarEvent, ritualMap: Map<string, Ritual>, ritualList: Ritual[], now: Date): UpcomingRitual | null {
  const ritual = matchRitual(event, ritualMap, ritualList);
  if (!ritual) return null;

  const start = new Date(event.startDate);
  const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return null;

  return {
    ...event,
    ritual,
    daysUntil,
    isToday: daysUntil === 0,
  };
}
// ─── Calendar event helpers ────────────────────────────────────────────────
/** Builds the calendar event data object from ritual and scheduling parameters. */
function buildRitualEventData(
  ritual: Ritual,
  startDate: Date,
  frequency: 'once' | 'daily' | 'weekly' | 'monthly'
): Record<string, unknown> {
  const recurrenceMap: Record<string, string | undefined> = {
    once: undefined,
    daily: 'daily',
    weekly: 'weekly',
    monthly: 'monthly',
  };
  return {
    title: `${ritual.nome} 🌙`,
    startDate: startDate.toISOString(),
    endDate: ritual.duracaoMinutos
      ? new Date(startDate.getTime() + ritual.duracaoMinutos * 60000).toISOString()
      : undefined,
    allDay: false,
    notes: `ritual:${ritual.id}`,
    recurrence: recurrenceMap[frequency],
  };
}

/** Resolves the target calendar from a list of calendars, by explicit ID or primary flag. */
function resolveTargetCalendar(
  calendars: Array<{ id: string; isPrimary?: boolean; title?: string }>,
  calendarId?: string
): { id: string; isPrimary?: boolean; title?: string } | undefined {
  return calendarId
    ? calendars.find(c => c.id === calendarId)
    : calendars.find(c => c.isPrimary);
}

/** Converts event data to plugin format when the provider is a plugin (numeric timestamps). */
function toPluginEvent(
  eventData: Record<string, unknown>,
  startDate: Date
): Record<string, unknown> {
  return {
    ...eventData,
    startDate: startDate.getTime(),
    endDate: eventData.endDate ? new Date(eventData.endDate as string).getTime() : undefined,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────────────────────

export function useRitualCalendar(options: UseRitualCalendarOptions = {}) {
  const {
    autoSync = true,
    syncInterval = 300000,
    userId,
    lookAheadDays = 30,
  } = options;

  const [upcomingRituals, setUpcomingRituals] = useState<UpcomingRitual[]>([]);
  const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus>({
    isSynced: false,
    lastSyncedAt: null,
    error: null,
    isLoading: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCalendarPermission = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.permissions) {
      return false;
    }
    try {
      const result = await navigator.permissions.query({ name: 'calendar' as PermissionName });
      return result.state === 'granted';
    } catch {
      return false;
    }
  }, []);

  const syncWithDeviceCalendar = useCallback(async (): Promise<void> => {
    setSyncStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const now = new Date();
      const endDate = new Date(now.getTime() + lookAheadDays * 24 * 60 * 60 * 1000);

      const provider = resolveCalendarProvider();
      const events = await fetchCalendarEvents(provider, now, endDate);
      const rituais = await fetchRituals(userId);

      const ritualMap = buildRitualMap(rituais);
      const mapped: UpcomingRitual[] = events
        .map(event => toUpcomingRitual(event, ritualMap, rituais, now))
        .filter((r): r is UpcomingRitual => r !== null)
        .sort((a, b) => a.daysUntil - b.daysUntil);

      setUpcomingRituals(mapped);
      setSyncStatus({
        isSynced: true,
        lastSyncedAt: now.toISOString(),
        error: null,
        isLoading: false,
      });
    } catch (err) {
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Sync failed',
      }));
    }
  }, [userId, lookAheadDays]);

  const addRitualToCalendar = useCallback(async (
    ritual: Ritual,
    startDate: Date,
    frequency: 'once' | 'daily' | 'weekly' | 'monthly' = 'weekly',
    calendarId?: string
  ): Promise<string | null> => {
    try {
      const eventData = buildRitualEventData(ritual, startDate, frequency);
      const provider = resolveCalendarProvider();
      const calendars = await fetchCalendarsFromProvider(provider);
      const targetCal = resolveTargetCalendar(calendars, calendarId);
      if (!targetCal) return null;
      const pluginEvent = provider.type === 'plugin'
        ? toPluginEvent(eventData, startDate)
        : eventData;
      const created = await createCalendarEvent(provider, targetCal.id, pluginEvent);
      const createdEventId = created?.id || null;
      if (createdEventId) {
        setUpcomingRituals(prev => {
          const daysUntil = Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const newEvent: UpcomingRitual = {
            id: createdEventId,
            title: String(eventData.title),
            ritualId: ritual.id,
            startDate: String(eventData.startDate),
            endDate: eventData.endDate ? String(eventData.endDate) : undefined,
            allDay: Boolean(eventData.allDay),
            recurrence: eventData.recurrence ? String(eventData.recurrence) : undefined,
            ritual,
            daysUntil,
            isToday: daysUntil === 0,
          };
          return [...prev, newEvent].sort((a, b) => a.daysUntil - b.daysUntil);
        });
      }
      return createdEventId;
    } catch {
      return null;
    }
  }, []);

  const removeRitualFromCalendar = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      const provider = resolveCalendarProvider();
      await deleteCalendarEvent(provider, eventId);
      setUpcomingRituals(prev => prev.filter(e => e.id !== eventId));
      return true;
    } catch {
      return false;
    }
  }, []);

  const refreshSync = useCallback(async () => {
    await syncWithDeviceCalendar();
  }, [syncWithDeviceCalendar]);

  useEffect(() => {
    syncWithDeviceCalendar();
  }, [syncWithDeviceCalendar]);

  useEffect(() => {
    if (autoSync && syncInterval > 0) {
      intervalRef.current = setInterval(syncWithDeviceCalendar, syncInterval);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoSync, syncInterval, syncWithDeviceCalendar]);

  return {
    upcomingRituals,
    syncStatus,
    syncWithDeviceCalendar: refreshSync,
    addRitualToCalendar,
    removeRitualFromCalendar,
  };
}
