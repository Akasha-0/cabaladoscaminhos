'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo, ReactNode } from 'react';

// Types
export type WidgetSize = 'sm' | 'md' | 'lg' | 'xl';
export type ViewMode = 'grid' | 'list' | 'focus';
export type ThemeMode = 'dark' | 'light' | 'auto';
export type DensityMode = 'comfortable' | 'compact';

export interface WidgetConfig {
  id: string;
  name: string;
  category: string;
  icon: string;
  size: WidgetSize;
  x: number;
  y: number;
  visible: boolean;
  favorite: boolean;
  config?: Record<string, unknown>;
}

export interface DashboardState {
  widgets: WidgetConfig[];
  selectedWidgetId: string | null;
  viewMode: ViewMode;
  theme: ThemeMode;
  density: DensityMode;
  columns: number;
  gap: 'sm' | 'md' | 'lg';
  searchQuery: string;
  categoryFilter: string[];
  isSettingsOpen: boolean;
  isLayoutOpen: boolean;
  isLoading: boolean;
  lastSaved: string | null;
}

// Actions
type DashboardAction =
  | { type: 'SET_WIDGETS'; payload: WidgetConfig[] }
  | { type: 'SELECT_WIDGET'; payload: string | null }
  | { type: 'UPDATE_WIDGET'; payload: Partial<WidgetConfig> & { id: string } }
  | { type: 'REMOVE_WIDGET'; payload: string }
  | { type: 'REORDER_WIDGETS'; payload: WidgetConfig[] }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_DENSITY'; payload: DensityMode }
  | { type: 'SET_COLUMNS'; payload: number }
  | { type: 'SET_GAP'; payload: 'sm' | 'md' | 'lg' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CATEGORY_FILTER'; payload: string[] }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_LAYOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: string }
  | { type: 'LOAD_LAYOUT'; payload: DashboardState };

// Initial state
const initialState: DashboardState = {
  widgets: [],
  selectedWidgetId: null,
  viewMode: 'grid',
  theme: 'dark',
  density: 'comfortable',
  columns: 4,
  gap: 'md',
  searchQuery: '',
  categoryFilter: [],
  isSettingsOpen: false,
  isLayoutOpen: false,
  isLoading: true,
  lastSaved: null
};

// Reducer
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_WIDGETS':
      return { ...state, widgets: action.payload };
    case 'SELECT_WIDGET':
      return { ...state, selectedWidgetId: action.payload };
    case 'UPDATE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.map(w =>
          w.id === action.payload.id ? { ...w, ...action.payload } : w
        )
      };
    case 'REMOVE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.filter(w => w.id !== action.payload)
      };
    case 'REORDER_WIDGETS':
      return { ...state, widgets: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_DENSITY':
      return { ...state, density: action.payload };
    case 'SET_COLUMNS':
      return { ...state, columns: action.payload };
    case 'SET_GAP':
      return { ...state, gap: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_CATEGORY_FILTER':
      return { ...state, categoryFilter: action.payload };
    case 'TOGGLE_SETTINGS':
      return { ...state, isSettingsOpen: !state.isSettingsOpen, isLayoutOpen: false };
    case 'TOGGLE_LAYOUT':
      return { ...state, isLayoutOpen: !state.isLayoutOpen, isSettingsOpen: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };
    case 'LOAD_LAYOUT':
      return { ...action.payload, isLoading: false };
    default:
      return state;
  }
}

// Context
interface DashboardContextValue {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  // Helper methods
  selectWidget: (id: string | null) => void;
  updateWidget: (widget: Partial<WidgetConfig> & { id: string }) => void;
  removeWidget: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setTheme: (theme: ThemeMode) => void;
  setDensity: (density: DensityMode) => void;
  setColumns: (columns: number) => void;
  setGap: (gap: 'sm' | 'md' | 'lg') => void;
  setSearch: (query: string) => void;
  setCategoryFilter: (categories: string[]) => void;
  toggleSettings: () => void;
  toggleLayout: () => void;
  saveLayout: (name: string) => void;
  loadLayout: (layout: Partial<DashboardState> & { widgets: WidgetConfig[] }) => void;
  // Computed values
  filteredWidgets: WidgetConfig[];
  selectedWidget: WidgetConfig | null;
  categories: { id: string; name: string; count: number }[];
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

// Provider
interface DashboardProviderProps {
  children: ReactNode;
  initialWidgets?: WidgetConfig[];
}

export function DashboardProvider({ children, initialWidgets = [] }: DashboardProviderProps) {
  const [state, dispatch] = useReducer(dashboardReducer, {
    ...initialState,
    widgets: initialWidgets,
    isLoading: initialWidgets.length === 0
  });

  // Load widgets from API on mount
  useEffect(() => {
    const loadWidgets = async () => {
      try {
        const response = await fetch('/api/dashboard/widgets');
        if (response.ok) {
          const data = await response.json();
          if (data.widgets) {
            dispatch({ type: 'SET_WIDGETS', payload: data.widgets });
          }
        }
      } catch {
        // Use default widgets if API fails
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadWidgets();
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem('dashboard-state', JSON.stringify({
        viewMode: state.viewMode,
        theme: state.theme,
        density: state.density,
        columns: state.columns,
        gap: state.gap,
        searchQuery: state.searchQuery,
        categoryFilter: state.categoryFilter
      }));
    }
  }, [state.viewMode, state.theme, state.density, state.columns, state.gap, state.searchQuery, state.categoryFilter, state.isLoading]);

  // Helper methods
  const selectWidget = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_WIDGET', payload: id });
  }, []);

  const updateWidget = useCallback((widget: Partial<WidgetConfig> & { id: string }) => {
    dispatch({ type: 'UPDATE_WIDGET', payload: widget });
  }, []);

  const removeWidget = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_WIDGET', payload: id });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const widget = state.widgets.find(w => w.id === id);
    if (widget) {
      dispatch({ type: 'UPDATE_WIDGET', payload: { id, favorite: !widget.favorite } });
    }
  }, [state.widgets]);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const setDensity = useCallback((density: DensityMode) => {
    dispatch({ type: 'SET_DENSITY', payload: density });
  }, []);

  const setColumns = useCallback((columns: number) => {
    dispatch({ type: 'SET_COLUMNS', payload: columns });
  }, []);

  const setGap = useCallback((gap: 'sm' | 'md' | 'lg') => {
    dispatch({ type: 'SET_GAP', payload: gap });
  }, []);

  const setSearch = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  }, []);

  const setCategoryFilter = useCallback((categories: string[]) => {
    dispatch({ type: 'SET_CATEGORY_FILTER', payload: categories });
  }, []);

  const toggleSettings = useCallback(() => {
    dispatch({ type: 'TOGGLE_SETTINGS' });
  }, []);

  const toggleLayout = useCallback(() => {
    dispatch({ type: 'TOGGLE_LAYOUT' });
  }, []);

  const saveLayout = useCallback((name: string) => {
    const layout = {
      widgets: state.widgets,
      viewMode: state.viewMode,
      theme: state.theme,
      density: state.density,
      columns: state.columns,
      gap: state.gap,
      searchQuery: state.searchQuery,
      categoryFilter: state.categoryFilter,
      isSettingsOpen: false,
      isLayoutOpen: false,
      isLoading: false,
      selectedWidgetId: state.selectedWidgetId,
      lastSaved: new Date().toISOString()
    };
    
    // Save to localStorage
    const layouts = JSON.parse(localStorage.getItem('dashboard-layouts') || '[]');
    const newLayout = { ...layout, id: `layout-${Date.now()}`, name };
    localStorage.setItem('dashboard-layouts', JSON.stringify([...layouts, newLayout]));
    dispatch({ type: 'SET_LAST_SAVED', payload: new Date().toLocaleTimeString() });
  }, [state]);

  const loadLayout = useCallback((layout: Partial<DashboardState> & { widgets: WidgetConfig[] }) => {
    dispatch({ type: 'LOAD_LAYOUT', payload: { ...state, ...layout } });
  }, [state]);

  // Computed values
  const filteredWidgets = useMemo(() => {
    let filtered = state.widgets.filter(w => w.visible);

    // Search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(query) ||
        w.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (state.categoryFilter.length > 0) {
      filtered = filtered.filter(w => state.categoryFilter.includes(w.category));
    }

    return filtered;
  }, [state.widgets, state.searchQuery, state.categoryFilter]);

  const selectedWidget = useMemo(() => {
    return state.widgets.find(w => w.id === state.selectedWidgetId) || null;
  }, [state.widgets, state.selectedWidgetId]);

  const categories = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    state.widgets.forEach(w => {
      if (!counts[w.category]) {
        counts[w.category] = { name: w.category, count: 0 };
      }
      counts[w.category].count++;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [state.widgets]);

  const value: DashboardContextValue = {
    state,
    dispatch,
    selectWidget,
    updateWidget,
    removeWidget,
    toggleFavorite,
    setViewMode,
    setTheme,
    setDensity,
    setColumns,
    setGap,
    setSearch,
    setCategoryFilter,
    toggleSettings,
    toggleLayout,
    saveLayout,
    loadLayout,
    filteredWidgets,
    selectedWidget,
    categories
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// Hook
export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
}

export default DashboardContext;