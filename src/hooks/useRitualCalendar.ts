// fallow-ignore-file unused-file
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

// fallow-ignore-next-line complexity
  const syncWithDeviceCalendar = useCallback(async (): Promise<void> => {
    setSyncStatus(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const events: CalendarEvent[] = [];
      const now = new Date();
      const endDate = new Date(now.getTime() + lookAheadDays * 24 * 60 * 60 * 1000);

      const availableProviders = await navigator.mediaDevices?.getUserMedia ? [] : [];

      if ('calendarManager' in navigator) {
        const calendarManager = (navigator as unknown as { calendarManager: CalendarManager }).calendarManager;
        const calendars = await calendarManager.getCalendars();
        for (const cal of calendars) {
          const calEvents = await calendarManager.fetchEvents(cal.id, now, endDate);
          for (const event of calEvents) {
            events.push({
              id: event.id,
              title: event.title || '',
              ritualId: event.notes?.includes('ritual:') ? event.notes.split('ritual:')[1]?.trim() : undefined,
              startDate: event.startDate,
              endDate: event.endDate,
              allDay: event.allDay || false,
              recurrence: event.recurrence,
            });
          }
        }
      } else if ('plugin' in navigator && (navigator as unknown as { plugin: { calendar: CalendarPlugin } }).plugin?.calendar) {
        const calendarPlugin = (navigator as unknown as { plugin: { calendar: CalendarPlugin } }).plugin.calendar;
        const allCalendars = await calendarPlugin.listCalendars();
        for (const cal of allCalendars) {
          const calEvents = await calendarPlugin.findEvents(cal.id, now.getTime(), endDate.getTime());
          for (const event of calEvents) {
            events.push({
              id: event.id,
              title: event.title || '',
              ritualId: event.notes?.includes('ritual:') ? event.notes.split('ritual:')[1]?.trim() : undefined,
              startDate: new Date(event.startDate).toISOString(),
              endDate: event.endDate ? new Date(event.endDate).toISOString() : undefined,
              allDay: event.allDay || false,
              recurrence: event.recurrence,
            });
          }
        }
      }

      const ritualsRes = await fetch(`/api/rituais?userId=${userId || ''}`);
      const ritualsData = ritualsRes.ok ? await ritualsRes.json() : { rituais: [] };
      const ritais: Ritual[] = ritualsData.rituais || [];

      const mapped: UpcomingRitual[] = events
        .map(event => {
          const ritual = event.ritualId
            ? ritais.find(r => r.id === event.ritualId)
            : ritais.find(r => r.nome === event.title || event.title.includes(r.nome));
          if (!ritual) return null;
          const start = new Date(event.startDate);
          const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return {
            ...event,
            ritual,
            daysUntil,
            isToday: daysUntil === 0,
          };
        })
        .filter((r): r is UpcomingRitual => r !== null && r.daysUntil >= 0)
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

// fallow-ignore-next-line complexity
  const addRitualToCalendar = useCallback(async (
    ritual: Ritual,
    startDate: Date,
    frequency: 'once' | 'daily' | 'weekly' | 'monthly' = 'weekly',
    calendarId?: string
  ): Promise<string | null> => {
    try {
      let createdEventId: string | null = null;
      const eventData = {
        title: `${ritual.nome} 🌙`,
        startDate: startDate.toISOString(),
        endDate: ritual.duracaoMinutos
          ? new Date(startDate.getTime() + ritual.duracaoMinutos * 60000).toISOString()
          : undefined,
        allDay: false,
        notes: `ritual:${ritual.id}`,
        recurrence: frequency === 'once' ? undefined :
          frequency === 'daily' ? 'daily' :
          frequency === 'weekly' ? 'weekly' :
          frequency === 'monthly' ? 'monthly' : undefined,
      };

      if ('calendarManager' in navigator) {
        const calendarManager = (navigator as unknown as { calendarManager: CalendarManager }).calendarManager;
        const calendars = await calendarManager.getCalendars();
        const targetCal = calendarId
          ? calendars.find(c => c.id === calendarId)
          : calendars.find(c => c.isPrimary);
        if (targetCal) {
          const created = await calendarManager.createEvent(targetCal.id, eventData);
          createdEventId = created?.id || null;
        }
      } else if ('plugin' in navigator && (navigator as unknown as { plugin: { calendar: CalendarPlugin } }).plugin?.calendar) {
        const calendarPlugin = (navigator as unknown as { plugin: { calendar: CalendarPlugin } }).plugin.calendar;
        const allCalendars = await calendarPlugin.listCalendars();
        const targetCal = calendarId
          ? allCalendars.find(c => c.id === calendarId)
          : allCalendars.find(c => c.isPrimary);
        if (targetCal) {
          const created = await calendarPlugin.createEvent(targetCal.id, {
            ...eventData,
            startDate: startDate.getTime(),
            endDate: eventData.endDate ? new Date(eventData.endDate).getTime() : undefined,
          });
          createdEventId = created?.id || null;
        }
      }

      if (createdEventId) {
        setUpcomingRituals(prev => {
          const newEvent: UpcomingRitual = {
            id: createdEventId!,
            title: eventData.title,
            ritualId: ritual.id,
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            allDay: eventData.allDay,
            recurrence: eventData.recurrence,
            ritual,
            daysUntil: Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            isToday: Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) === 0,
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
      if ('calendarManager' in navigator) {
        const calendarManager = (navigator as unknown as { calendarManager: CalendarManager }).calendarManager;
        await calendarManager.deleteEvent(eventId);
      } else if ('plugin' in navigator && (navigator as unknown as { plugin: { calendar: CalendarPlugin } }).plugin?.calendar) {
        const calendarPlugin = (navigator as unknown as { plugin: { calendar: CalendarPlugin } }).plugin.calendar;
        await calendarPlugin.deleteEvent(eventId);
      }

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
