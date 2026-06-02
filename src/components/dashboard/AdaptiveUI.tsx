// fallow-ignore-file unused-file
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Settings, Eye, Clock, TrendingUp, Star, Zap, Brain, Palette, Layout, ChevronDown, ChevronUp, Check, X, RotateCcw, Monitor, Smartphone, Tablet } from 'lucide-react';

export type AdaptationType = 'layout' | 'theme' | 'widgets' | 'navigation' | 'content';
export type UserPreference = 'dark' | 'light' | 'auto' | 'system';
export type LearningMode = 'active' | 'passive' | 'disabled';

export interface UserBehavior {
  pageViews: Record<string, number>;
  widgetUsage: Record<string, number>;
  timeSpent: Record<string, number>;
  clickPatterns: Record<string, number>;
  sessionCount: number;
  lastActive: Date;
}

export interface AdaptationRule {
  id: string;
  type: AdaptationType;
  condition: (behavior: UserBehavior) => boolean;
  action: () => void;
  description: string;
  confidence: number;
  enabled: boolean;
}

export interface WidgetOrder {
  widgetId: string;
  priority: number;
  lastUsed: Date;
  useCount: number;
}

interface AdaptiveUIProps {
  onPreferenceChange?: (preferences: Partial<UserPreferences>) => void;
  learningMode?: LearningMode;
  className?: string;
}

interface UserPreferences {
  theme: UserPreference;
  layout: 'grid' | 'list' | 'focus' | 'auto';
  widgetOrder: WidgetOrder[];
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  showHints: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  layout: 'auto',
  widgetOrder: [],
  reducedMotion: false,
  fontSize: 'medium',
  compactMode: false,
  showHints: true,
  autoRefresh: true,
  refreshInterval: 30000
};

// Learning thresholds
const LEARNING_THRESHOLDS = {
  minSessions: 3,
  minInteractions: 10,
  confidenceThreshold: 0.7
};

// fallow-ignore-next-line complexity
export function AdaptiveUI({
  onPreferenceChange,
  learningMode = 'active',
  className = ''
}: AdaptiveUIProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [behavior, setBehavior] = useState<UserBehavior>({
    pageViews: {},
    widgetUsage: {},
    timeSpent: {},
    clickPatterns: {},
    sessionCount: 1,
    lastActive: new Date()
  });
  const [adaptations, setAdaptations] = useState<{ type: AdaptationType; description: string; confidence: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'learned' | 'rules' | 'settings'>('learned');
  const [isLearning, setIsLearning] = useState(learningMode !== 'disabled');

  // Load preferences from storage
  useEffect(() => {
    const stored = localStorage.getItem('cabala_adaptive_preferences');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch {
        // Use defaults
      }
    }

    const storedBehavior = localStorage.getItem('cabala_user_behavior');
    if (storedBehavior) {
      try {
        setBehavior(JSON.parse(storedBehavior));
      } catch {
        // Use defaults
      }
    }
  }, []);

  // Save preferences to storage
  useEffect(() => {
    localStorage.setItem('cabala_adaptive_preferences', JSON.stringify(preferences));
    localStorage.setItem('cabala_user_behavior', JSON.stringify(behavior));
    onPreferenceChange?.(preferences);
  }, [preferences, behavior, onPreferenceChange]);

  // Track user behavior
  const trackBehavior = useCallback((type: keyof UserBehavior, key: string, value?: number) => {
    if (learningMode === 'disabled') return;
// fallow-ignore-next-line complexity

    setBehavior(prev => {
      const updated = { ...prev };
      if (type === 'pageViews') {
        updated.pageViews = { ...prev.pageViews, [key]: (prev.pageViews[key] || 0) + 1 };
      } else if (type === 'widgetUsage') {
        updated.widgetUsage = { ...prev.widgetUsage, [key]: (prev.widgetUsage[key] || 0) + 1 };
      } else if (type === 'timeSpent') {
        updated.timeSpent = { ...prev.timeSpent, [key]: (prev.timeSpent[key] || 0) + (value || 0) };
      } else if (type === 'clickPatterns') {
        updated.clickPatterns = { ...prev.clickPatterns, [key]: (prev.clickPatterns[key] || 0) + 1 };
      }
      updated.lastActive = new Date();
      return updated;
    });
    // Do NOT call analyzeAndAdapt here - that would violate hooks rules
    // (analyzeAndAdapt is declared below via useCallback)
  }, [learningMode, behavior]);

  // Analyze behavior and suggest adaptations
  const analyzeAndAdapt = useCallback(() => {
    if (learningMode !== 'active') return;
    const newAdaptations: { type: AdaptationType; description: string; confidence: number }[] = [];

    // Layout preference based on widget usage
    const topWidgets = Object.entries(behavior.widgetUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (topWidgets.length >= 3) {
      newAdaptations.push({
        type: 'layout',
        description: 'Recomendamos layout em grade para sua preferência de widgets',
        confidence: Math.min(topWidgets.length / 10, 0.95)
      });
    }

    // Theme based on time of day (simplified)
    const hour = new Date().getHours();
    if (hour < 7 || hour > 19) {
      newAdaptations.push({
        type: 'theme',
        description: 'Detectamos horário noturno - sugerimos tema escuro',
        confidence: 0.8
      });
    }

    // Widget order based on usage
    const frequentWidgets = Object.entries(behavior.widgetUsage)
      .filter(([_, count]) => count > 5)
      .sort((a, b) => b[1] - a[1]);
    
    if (frequentWidgets.length > 0) {
      newAdaptations.push({
        type: 'widgets',
        description: `${frequentWidgets.length} widgets identificados como frequentemente usados`,
        confidence: Math.min(frequentWidgets.length / 20, 0.9)
      });
    }

    setAdaptations(newAdaptations);
  }, [behavior, learningMode]);

  // Trigger analyzeAndAdapt when behavior changes in active learning mode
  useEffect(() => {
    if (learningMode === 'active') {
      analyzeAndAdapt();
    }
  }, [behavior, learningMode, analyzeAndAdapt]);

  // Apply adaptation
  const applyAdaptation = useCallback((adaptation: typeof adaptations[0]) => {
    switch (adaptation.type) {
      case 'layout':
        setPreferences(prev => ({ ...prev, layout: 'grid' }));
        break;
      case 'theme':
        setPreferences(prev => ({ ...prev, theme: 'dark' }));
        break;
      case 'widgets':
        // Reorder widgets based on usage
        const widgetOrder = Object.entries(behavior.widgetUsage)
          .sort((a, b) => b[1] - a[1])
          .map(([widgetId], index) => ({
            widgetId,
            priority: index + 1,
            lastUsed: new Date(),
            useCount: behavior.widgetUsage[widgetId] || 0
          }));
        setPreferences(prev => ({ ...prev, widgetOrder }));
        break;
    }
  }, [behavior.widgetUsage]);

  // Dismiss adaptation
  const dismissAdaptation = useCallback((index: number) => {
    setAdaptations(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Update preference
  const updatePreference = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  // Reset learning
  const resetLearning = useCallback(() => {
    setBehavior({
      pageViews: {},
      widgetUsage: {},
      timeSpent: {},
      clickPatterns: {},
      sessionCount: 0,
      lastActive: new Date()
    });
    setPreferences(DEFAULT_PREFERENCES);
    setAdaptations([]);
  }, []);

  // Get theme icon
  const getThemeIcon = (theme: UserPreference): React.ReactNode => {
    switch (theme) {
      case 'dark': return <Sparkles className="w-4 h-4" />;
      case 'light': return <Eye className="w-4 h-4" />;
      case 'auto': return <Settings className="w-4 h-4" />;
      case 'system': return <Monitor className="w-4 h-4" />;
    }
  };

  // Stats
  const stats = useMemo(() => {
    const totalViews = Object.values(behavior.pageViews).reduce((a, b) => a + b, 0);
    const totalWidgets = Object.keys(behavior.widgetUsage).length;
    const topWidget = Object.entries(behavior.widgetUsage).sort((a, b) => b[1] - a[1])[0];
    return {
      sessions: behavior.sessionCount,
      pageViews: totalViews,
      widgets: totalWidgets,
      topWidget: topWidget ? topWidget[0] : null,
      adaptations: adaptations.length
    };
  }, [behavior, adaptations]);

  // Export tracking function for use in components
  const trackWidgetUsage = useCallback((widgetId: string) => {
    trackBehavior('widgetUsage', widgetId);
  }, [trackBehavior]);

  return (
    <div className={`bg-slate-900/80 rounded-xl border border-slate-800/60 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">UI Adaptativa</h3>
              <p className="text-xs text-slate-400">Aprendizado espiritual do usuário</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetLearning}
              className="flex items-center gap-1 px-3 py-2 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg cursor-pointer">
              <span className="text-sm text-slate-300">Aprendizado</span>
              <input
                type="checkbox"
                checked={isLearning}
                onChange={e => setIsLearning(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500 relative">
                <div className={`absolute top-[2px] ${isLearning ? 'left-[18px] bg-white' : 'left-[2px] bg-slate-400'} w-4 h-4 rounded-full transition-all`} />
              </div>
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-100">{stats.sessions}</p>
            <p className="text-xs text-slate-500">Sessões</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-cyan-400">{stats.pageViews}</p>
            <p className="text-xs text-slate-500">Visualizações</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-violet-400">{stats.widgets}</p>
            <p className="text-xs text-slate-500">Widgets</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amber-400">{adaptations.length}</p>
            <p className="text-xs text-slate-500">Adaptações</p>
          </div>
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto ${isLearning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <p className="text-xs text-slate-500">{isLearning ? 'Ativo' : 'Pausado'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-800/30 flex gap-2">
        {(['learned', 'rules', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${activeTab === tab ? 'bg-violet-500/20 text-violet-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {tab === 'learned' ? 'Aprendidas' : tab === 'rules' ? 'Regras' : 'Configurações'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {activeTab === 'learned' && (
          <div className="p-4">
            {/* Pending adaptations */}
            {adaptations.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs text-slate-500 mb-2">Adaptações sugeridas:</h4>
                <div className="space-y-2">
                  {adaptations.map((adaptation, i) => (
                    <div key={i} className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-violet-400" />
                          <span className="text-sm text-slate-200">{adaptation.description}</span>
                        </div>
                        <span className="text-xs text-violet-400">{(adaptation.confidence * 100).toFixed(0)}% confiança</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => applyAdaptation(adaptation)}
                          className="px-3 py-1 bg-violet-500 hover:bg-violet-600 rounded text-xs text-white"
                        >
                          Aplicar
                        </button>
                        <button
                          onClick={() => dismissAdaptation(i)}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
                        >
                          Dispensar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learned patterns */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <h5 className="text-xs text-slate-500 mb-2">Widgets mais usados:</h5>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(behavior.widgetUsage)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([widgetId, count]) => (
                      <span key={widgetId} className="px-2 py-1 bg-violet-500/20 rounded text-xs text-violet-400">
                        {widgetId}: {count}x
                      </span>
                    ))}
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <h5 className="text-xs text-slate-500 mb-2">Páginas mais visitadas:</h5>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(behavior.pageViews)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([page, views]) => (
                      <span key={page} className="px-2 py-1 bg-cyan-500/20 rounded text-xs text-cyan-400">
                        {page}: {views}x
                      </span>
                    ))}
                </div>
              </div>

              {Object.keys(behavior.pageViews).length === 0 && Object.keys(behavior.widgetUsage).length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum padrão aprendido ainda</p>
                  <p className="text-xs text-slate-600 mt-1">Use a dashboard para começar a aprender</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="p-4">
            <div className="space-y-3">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-200">Tema baseado em horário</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 relative">
                      <div className="absolute top-[2px] left-[18px] bg-white w-4 h-4 rounded-full transition-all" />
                    </div>
                  </label>
                </div>
                <p className="text-xs text-slate-500">Alternar automaticamente entre claro/escuro</p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-200">Ordenação de widgets</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 relative">
                      <div className="absolute top-[2px] left-[18px] bg-white w-4 h-4 rounded-full transition-all" />
                    </div>
                  </label>
                </div>
                <p className="text-xs text-slate-500">Reordenar widgets baseado no uso</p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-200">Layout adaptativo</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 relative">
                      <div className="absolute top-[2px] left-[18px] bg-white w-4 h-4 rounded-full transition-all" />
                    </div>
                  </label>
                </div>
                <p className="text-xs text-slate-500">Ajustar layout baseado no dispositivo</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4 space-y-4">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-200 mb-3">Tema preferido:</p>
              <div className="grid grid-cols-4 gap-2">
                {(['dark', 'light', 'auto', 'system'] as const).map(theme => (
                  <button
                    key={theme}
                    onClick={() => updatePreference('theme', theme)}
                    className={`p-3 rounded-lg text-center transition-colors ${preferences.theme === theme ? 'bg-violet-500/20 border border-violet-500/50' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                  >
                    {getThemeIcon(theme)}
                    <p className="text-xs mt-1 capitalize">{theme}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-200 mb-3">Tamanho da fonte:</p>
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => updatePreference('fontSize', size)}
                    className={`p-3 rounded-lg text-center transition-colors ${preferences.fontSize === size ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                  >
                    <span className={size === 'small' ? 'text-xs' : size === 'large' ? 'text-lg' : 'text-sm'}>Aa</span>
                    <p className="text-xs mt-1 capitalize">{size}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-200">Modo compacto</p>
                  <p className="text-xs text-slate-500">Reduce padding e margins</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.compactMode}
                    onChange={e => updatePreference('compactMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 relative">
                    <div className={`absolute top-[2px] ${preferences.compactMode ? 'left-[18px] bg-white' : 'left-[2px] bg-slate-400'} w-4 h-4 rounded-full transition-all`} />
                  </div>
                </label>
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-200">Auto-refresh</p>
                  <p className="text-xs text-slate-500">Atualizar dados automaticamente</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.autoRefresh}
                    onChange={e => updatePreference('autoRefresh', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 relative">
                    <div className={`absolute top-[2px] ${preferences.autoRefresh ? 'left-[18px] bg-white' : 'left-[2px] bg-slate-400'} w-4 h-4 rounded-full transition-all`} />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-800/60">
        <p className="text-xs text-slate-500 text-center">
          {Object.keys(behavior.widgetUsage).length} padrões aprendidos • Evolução contínua
        </p>
      </div>
    </div>
  );
}

export default AdaptiveUI;
