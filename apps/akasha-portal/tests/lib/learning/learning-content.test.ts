import { describe, it, expect } from 'vitest';
import { getContent, getModuleById, getCategories, getModulesByCategory } from '@/lib/learning/learning-content';

describe('learning/learning-content', () => {
  it('returns content with modules and metadata', () => {
    const content = getContent();
    expect(content.modules.length).toBeGreaterThan(0);
    expect(content.metadata).toBeDefined();
    expect(content.metadata.version).toBe('1.0.0');
  });

  it('finds module by id', () => {
    const mod = getModuleById('foundations-cabala');
    expect(mod).toBeDefined();
    expect(mod?.title).toBe('Fundamentos da Cabala');
  });

  it('returns categories', () => {
    const categories = getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories).toContain('foundations');
  });
});
