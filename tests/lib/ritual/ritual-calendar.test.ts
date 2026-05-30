import { describe, it, expect } from 'vitest';
import { getCalendar, scheduleRitual, completeRitual } from '../../../src/lib/ritual/ritual-calendar';

describe('ritual-calendar', () => {
  it('getCalendar returns month with events array', () => {
    const calendar = getCalendar(2024, 6);
    expect(calendar.year).toBe(2024);
    expect(calendar.month).toBe(6);
    expect(Array.isArray(calendar.events)).toBe(true);
  });

  it('scheduleRitual returns event with id', () => {
    const event = scheduleRitual({
      ritualId: 'ritual-1',
      name: 'Test Ritual',
      date: '2024-06-15',
      category: 'protection',
      completed: false,
    });
    expect(event.id).toBeTruthy();
    expect(event.name).toBe('Test Ritual');
    expect(event.completed).toBe(false);
  });

  it('completeRitual returns boolean', () => {
    const result = completeRitual('ritual-1');
    expect(typeof result).toBe('boolean');
  });
});
