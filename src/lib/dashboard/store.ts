// Dashboard Store - Cabala dos Caminhos
// Zustand store for dashboard widgets, layout, and settings

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================
// TYPES
// ============================================================

export type WidgetId =
  | 'mapa-natal'
  | 'tarot-do-dia'
  | 'afirmacao'
  | 'previsao-semanal'
  | 'previsao-mensal'
  | 'ritual-of-the-day'
  | 'soul-cycle'
  | 'spirituality-map'
  | 'mandala-energia'
  | 'frequencias-explorer'
  | 'geometria-sagrada'
  | 'calendario-espiritual'
  | 'insight-diario'
  | 'meditacao-guiada'
  | 'crystal-grid'
  | 'numerologia'
  | 'correspondencias'
  | 'efemerides'
  | 'aspect-grid'
  | 'ritual-tracker'
  | 'synastry'
  | 'compatibilidade';

export interface WidgetConfig {
  id: WidgetId;
  visible: boolean;
  order: number;
  size: 'sm' | 'md' | 'lg' | 'xl';
  customLabel?: string;
}

export interface LayoutConfig {
  columns: 1 | 2 | 3 | 4;
  gap: number;
  compactMode: boolean;
  showLabels: boolean;
}

export interface DashboardSettings {
  theme: 'mystical' | 'minimal' | 'cosmic' | 'auto';
  language: 'pt-BR' | 'en';
  notifications: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  animations: 'full' | 'subtle' | 'none';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
}

// ============================================================
// STORE INTERFACE
// ============================================================

export interface DashboardState {
  // Widgets slice
  widgets: WidgetConfig[];
  activeWidget: WidgetId | null;
  setActiveWidget: (id: WidgetId | null) => void;
  toggleWidget: (id: WidgetId) => void;
  reorderWidgets: (widgets: WidgetConfig[]) => void;
  updateWidgetConfig: (id: WidgetId, config: Partial<WidgetConfig>) => void;

  // Layout slice
  layout: LayoutConfig;
  updateLayout: (layout: Partial<LayoutConfig>) => void;
  resetLayout: () => void;

  // Settings slice
  settings: DashboardSettings;
  updateSettings: (settings: Partial<DashboardSettings>) => void;
  resetSettings: () => void;
}

// ============================================================
// DEFAULT VALUES
// ============================================================

const defaultWidgets: WidgetConfig[] = [
  { id: 'mapa-natal', visible: true, order: 0, size: 'xl' },
  { id: 'tarot-do-dia', visible: true, order: 1, size: 'md' },
  { id: 'afirmacao', visible: true, order: 2, size: 'sm' },
  { id: 'previsao-semanal', visible: true, order: 3, size: 'lg' },
  { id: 'previsao-mensal', visible: true, order: 4, size: 'lg' },
  { id: 'ritual-of-the-day', visible: true, order: 5, size: 'md' },
  { id: 'soul-cycle', visible: false, order: 6, size: 'md' },
  { id: 'spirituality-map', visible: false, order: 7, size: 'lg' },
  { id: 'mandala-energia', visible: false, order: 8, size: 'md' },
  { id: 'frequencias-explorer', visible: false, order: 9, size: 'md' },
  { id: 'geometria-sagrada', visible: false, order: 10, size: 'md' },
  { id: 'calendario-espiritual', visible: false, order: 11, size: 'lg' },
  { id: 'insight-diario', visible: true, order: 12, size: 'sm' },
  { id: 'meditacao-guiada', visible: false, order: 13, size: 'md' },
  { id: 'crystal-grid', visible: false, order: 14, size: 'md' },
  { id: 'numerologia', visible: false, order: 15, size: 'lg' },
  { id: 'correspondencias', visible: false, order: 16, size: 'md' },
  { id: 'efemerides', visible: false, order: 17, size: 'md' },
  { id: 'aspect-grid', visible: false, order: 18, size: 'lg' },
  { id: 'ritual-tracker', visible: false, order: 19, size: 'md' },
  { id: 'synastry', visible: false, order: 20, size: 'lg' },
  { id: 'compatibilidade', visible: false, order: 21, size: 'lg' },
];

const defaultLayout: LayoutConfig = {
  columns: 3,
  gap: 16,
  compactMode: false,
  showLabels: true,
};

const defaultSettings: DashboardSettings = {
  theme: 'auto',
  language: 'pt-BR',
  notifications: true,
  soundEnabled: true,
  reducedMotion: false,
  highContrast: false,
  animations: 'full',
  dateFormat: 'DD/MM/YYYY',
};

// ============================================================
// STORE CREATION
// ============================================================

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      // Widgets
      widgets: defaultWidgets,
      activeWidget: null,

      setActiveWidget: (id) => set({ activeWidget: id }),

      toggleWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, visible: !w.visible } : w
          ),
        })),

      reorderWidgets: (widgets) => set({ widgets }),

      updateWidgetConfig: (id, config) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...config } : w
          ),
        })),

      // Layout
      layout: defaultLayout,

      updateLayout: (layout) =>
        set((state) => ({
          layout: { ...state.layout, ...layout },
        })),

      resetLayout: () => set({ layout: defaultLayout }),

      // Settings
      settings: defaultSettings,

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        widgets: state.widgets,
        layout: state.layout,
        settings: state.settings,
      }),
    }
  )
);