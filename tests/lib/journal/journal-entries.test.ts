import { describe, it, expect } from 'vitest';
import { createEntry, updateEntry, deleteEntry, getEntryById } from '@/lib/journal/journal-entries';

describe('journal/journal-entries', () => {
  it('creates a journal entry', () => {
    const entry = createEntry({
      title: 'Test Entry',
      content: 'Test content',
      type: 'reflection',
    });
    expect(entry).toBeDefined();
    expect(entry.id).toBeDefined();
    expect(entry.title).toBe('Test Entry');
  });

  it('updates an existing entry', () => {
    const entry = createEntry({
      title: 'Original Title',
      content: 'Original content',
      type: 'reflection',
    });
    const updated = updateEntry(entry.id, { title: 'Updated Title' });
    expect(updated).toBeDefined();
    expect(updated?.title).toBe('Updated Title');
  });

  it('deletes an entry', () => {
    const entry = createEntry({
      title: 'To Delete',
      content: 'Content',
      type: 'reflection',
    });
    const deleted = deleteEntry(entry.id);
    expect(deleted).toBe(true);
  });
});