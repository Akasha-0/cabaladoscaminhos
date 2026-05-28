/**
 * Calendar events module
 * Provides event management functionality
 */

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  allDay?: boolean;
  recurring?: boolean;
  recurrenceRule?: string;
}

let events: CalendarEvent[] = [];

/**
 * Get all calendar events
 */
export function getEvents(): CalendarEvent[] {
  return [...events];
}

/**
 * Get events by date range
 */
export function getEventsByRange(start: Date, end: Date): CalendarEvent[] {
  return events.filter((event) => {
    const eventDate = event.date;
    return eventDate >= start && eventDate <= end;
  });
}

/**
 * Add a new calendar event
 */
export function addEvent(event: Omit<CalendarEvent, "id">): CalendarEvent {
  const newEvent: CalendarEvent = {
    ...event,
    id: crypto.randomUUID(),
  };
  events.push(newEvent);
  return newEvent;
}

/**
 * Update an existing event
 */
export function updateEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return null;
  events[index] = { ...events[index], ...updates };
  return events[index];
}

/**
 * Delete an event by id
 */
export function deleteEvent(id: string): boolean {
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return false;
  events.splice(index, 1);
  return true;
}

/**
 * Clear all events
 */
export function clearEvents(): void {
  events = [];
}