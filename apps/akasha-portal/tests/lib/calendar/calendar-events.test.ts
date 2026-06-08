import { describe, it, expect, beforeEach } from 'vitest';
import {
  getEvents,
  getEventsByRange,
  addEvent,
  updateEvent,
  deleteEvent,
  clearEvents,
  CalendarEvent,
} from '../../../src/lib/calendar/calendar-events';

describe('Calendar Events', () => {
  beforeEach(() => {
    clearEvents();
  });

  describe('getEvents', () => {
    it('should return empty array initially', () => {
      const events = getEvents();
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBe(0);
    });

    it('should return copy of events array', () => {
      addEvent({
        title: 'Test Event',
        date: new Date('2024-01-15'),
      });
      const events = getEvents();
      expect(events.length).toBe(1);
    });
  });

  describe('getEventsByRange', () => {
    it('should return events within date range', () => {
      addEvent({
        title: 'Event 1',
        date: new Date('2024-01-10'),
        allDay: true,
      });
      addEvent({
        title: 'Event 2',
        date: new Date('2024-01-15'),
        allDay: true,
      });
      addEvent({
        title: 'Event 3',
        date: new Date('2024-01-20'),
        allDay: true,
      });

      const start = new Date('2024-01-08');
      const end = new Date('2024-01-12');
      const events = getEventsByRange(start, end);

      expect(events.length).toBe(1);
      expect(events[0].title).toBe('Event 1');
    });

    it('should return empty array for no matching events', () => {
      const start = new Date('2024-02-01');
      const end = new Date('2024-02-28');
      const events = getEventsByRange(start, end);
      expect(events.length).toBe(0);
    });

    it('should include events on boundary dates', () => {
      const eventDate = new Date('2024-01-15');
      addEvent({
        title: 'Boundary Event',
        date: eventDate,
        allDay: true,
      });

      const start = new Date('2024-01-15');
      const end = new Date('2024-01-15');
      const events = getEventsByRange(start, end);

      expect(events.length).toBe(1);
    });
  });

  describe('addEvent', () => {
    it('should add event with generated id', () => {
      const event = addEvent({
        title: 'New Event',
        date: new Date('2024-01-15'),
        allDay: true,
      });

      expect(event).toHaveProperty('id');
      expect(event.title).toBe('New Event');
      expect(event.allDay).toBe(true);
    });

    it('should return event with all properties', () => {
      const event = addEvent({
        title: 'Full Event',
        description: 'Description',
        date: new Date('2024-01-15'),
        endDate: new Date('2024-01-16'),
        allDay: false,
        recurring: true,
        recurrenceRule: 'WEEKLY',
      });

      expect(event.title).toBe('Full Event');
      expect(event.description).toBe('Description');
      expect(event.endDate).toBeInstanceOf(Date);
      expect(event.recurring).toBe(true);
      expect(event.recurrenceRule).toBe('WEEKLY');
    });

    it('should be retrievable after adding', () => {
      const event = addEvent({
        title: 'Retrieve Test',
        date: new Date('2024-01-15'),
        allDay: true,
      });

      const events = getEvents();
      expect(events.some((e) => e.id === event.id)).toBe(true);
    });
  });

  describe('updateEvent', () => {
    it('should update existing event', () => {
      const event = addEvent({
        title: 'Original Title',
        date: new Date('2024-01-15'),
        allDay: true,
      });

      const updated = updateEvent(event.id, { title: 'Updated Title' });
      expect(updated).not.toBeNull();
      expect(updated?.title).toBe('Updated Title');
    });

    it('should return null for non-existent event', () => {
      const result = updateEvent('non-existent-id', { title: 'Test' });
      expect(result).toBeNull();
    });

    it('should preserve unchanged properties', () => {
      const event = addEvent({
        title: 'Preserve Test',
        description: 'Original description',
        date: new Date('2024-01-15'),
        allDay: true,
      });

      const updated = updateEvent(event.id, { title: 'New Title' });
      expect(updated?.description).toBe('Original description');
    });

    it('should handle partial updates', () => {
      const event = addEvent({
        title: 'Partial Update',
        date: new Date('2024-01-15'),
        allDay: true,
      });

      const updated = updateEvent(event.id, { description: 'Added description' });
      expect(updated?.description).toBe('Added description');
      expect(updated?.title).toBe('Partial Update');
    });
  });

  describe('deleteEvent', () => {
    it('should delete existing event', () => {
      const event = addEvent({
        title: 'To Delete',
        date: new Date('2024-01-15'),
        allDay: true,
      });

      const result = deleteEvent(event.id);
      expect(result).toBe(true);

      const events = getEvents();
      expect(events.some((e) => e.id === event.id)).toBe(false);
    });

    it('should return false for non-existent event', () => {
      const result = deleteEvent('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('clearEvents', () => {
    it('should remove all events', () => {
      addEvent({
        title: 'Event 1',
        date: new Date('2024-01-15'),
        allDay: true,
      });
      addEvent({
        title: 'Event 2',
        date: new Date('2024-01-16'),
        allDay: true,
      });

      clearEvents();
      const events = getEvents();
      expect(events.length).toBe(0);
    });
  });
});