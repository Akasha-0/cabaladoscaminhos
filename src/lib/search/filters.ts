// ============================================================
// SEARCH FILTERS - CABALA DOS CAMINHOS
// ============================================================
// Search filter system for filtering content by category, date, and type
// ============================================================

export interface SearchFilterOptions {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
}

export interface FilterOption<T = string> {
  value: T;
  label: string;
  count?: number;
}

export interface FilterConfig {
  categories: FilterOption[];
  types: FilterOption[];
}

const DEFAULT_CATEGORIES: FilterOption[] = [
  { value: 'tarot', label: 'Tarot' },
  { value: 'astrologia', label: 'Astrologia' },
  { value: 'numerologia', label: 'Numerologia' },
  { value: 'cabala', label: 'Cabala' },
  { value: 'ifá', label: 'Ifá' },
  { value: 'rituais', label: 'Rituais' },
  { value: 'meditações', label: 'Meditações' },
];

const DEFAULT_TYPES: FilterOption[] = [
  { value: 'article', label: 'Artigo' },
  { value: 'guide', label: 'Guia' },
  { value: 'reading', label: 'Leitura' },
  { value: 'prediction', label: 'Previsão' },
  { value: 'ritual', label: 'Ritual' },
];

export interface FilterableItem {
  id: string;
  category?: string;
  type?: string;
  date?: string;
  [key: string]: unknown;
}

export function applyFilters<T extends FilterableItem>(
  items: T[],
  filters: SearchFilterOptions
): T[] {
  return items.filter((item) => {
    if (filters.category && item.category !== filters.category) {
      return false;
    }

    if (filters.type && item.type !== filters.type) {
      return false;
    }

    if (filters.dateFrom || filters.dateTo) {
      const itemDate = item.date ? new Date(item.date) : null;
      if (!itemDate) return false;

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        if (itemDate < from) return false;
      }

      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        if (itemDate > to) return false;
      }
    }

    return true;
  });
}

export function getFilterOptions(
  items: FilterableItem[],
  config?: Partial<FilterConfig>
): FilterConfig {
  const categories = config?.categories ?? DEFAULT_CATEGORIES;
  const types = config?.types ?? DEFAULT_TYPES;

  const countByCategory = new Map<string, number>();
  for (const item of items) {
    if (item.category) {
      countByCategory.set(item.category, (countByCategory.get(item.category) ?? 0) + 1);
    }
  }

  const countByType = new Map<string, number>();
  for (const item of items) {
    if (item.type) {
      countByType.set(item.type, (countByType.get(item.type) ?? 0) + 1);
    }
  }

  return {
    categories: categories.map((opt) => ({
      ...opt,
      count: countByCategory.get(opt.value),
    })),
    types: types.map((opt) => ({
      ...opt,
      count: countByType.get(opt.value),
    })),
  };
}
