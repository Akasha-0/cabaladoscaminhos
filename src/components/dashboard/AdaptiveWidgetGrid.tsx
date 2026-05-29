'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TooltipInfo } from '@/components/ui/tooltip-info';
import {
  TrendingUp,
  Activity,
  Compass,
  Globe,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import SelfEvolutionTracker from './SelfEvolutionTracker';
import UserGrowthMetrics from './UserGrowthMetrics';

export interface WidgetConfig {
  id: string;
  type: 'evolution' | 'growth' | 'analysis' | 'correlation';
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  expanded: boolean;
  visible: boolean;
  order: number;
}

export interface AdaptiveWidgetGridProps {
  userData: {
    nome: string;
    numeroPessoal: number;
    cicloMes: number;
    cicloDia: number;
    dataNascimento?: string;
    sefirot: string[];
    orixas: string[];
    odu: string;
  };
  evolutionStage: string;
  className?: string;
}

const STORAGE_KEY = 'cabala-widget-preferences';

const DEFAULT_WIDGET_CONFIGS: Record<string, WidgetConfig[]> = {
  'iniciante': [
    { id: 'evolution', type: 'evolution', title: 'Evolução Espiritual', icon: <TrendingUp className="w-4 h-4" />, iconColor: 'text-emerald-400', expanded: true, visible: true, order: 0 },
    { id: 'growth', type: 'growth', title: 'Métricas de Crescimento', icon: <Activity className="w-4 h-4" />, iconColor: 'text-sky-400', expanded: true, visible: true, order: 1 },
  ],
  'explorador': [
    { id: 'evolution', type: 'evolution', title: 'Evolução Espiritual', icon: <TrendingUp className="w-4 h-4" />, iconColor: 'text-emerald-400', expanded: true, visible: true, order: 0 },
    { id: 'growth', type: 'growth', title: 'Métricas de Crescimento', icon: <Activity className="w-4 h-4" />, iconColor: 'text-sky-400', expanded: false, visible: true, order: 1 },
  ],
};

function loadWidgetPreferences(stage: string): WidgetConfig[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.stage === stage && Array.isArray(parsed.widgets)) {
        return parsed.widgets;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_WIDGET_CONFIGS[stage] || DEFAULT_WIDGET_CONFIGS['iniciante'];
}

function saveWidgetPreferences(stage: string, widgets: WidgetConfig[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stage, widgets }));
  } catch {
    // Ignore storage errors
  }
}

export function AdaptiveWidgetGrid({
  userData,
  evolutionStage,
  className = '',
}: AdaptiveWidgetGridProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [showControls, setShowControls] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load preferences on mount or stage change
  useEffect(() => {
    setWidgets(loadWidgetPreferences(evolutionStage));
  }, [evolutionStage]);

  // Save preferences when widgets change
  const persistWidgets = useCallback((updatedWidgets: WidgetConfig[]) => {
    setIsSaving(true);
    saveWidgetPreferences(evolutionStage, updatedWidgets);
    setTimeout(() => setIsSaving(false), 500);
  }, [evolutionStage]);

  // Toggle widget expansion
  const toggleExpand = useCallback((id: string) => {
    setWidgets(prev => {
      const updated = prev.map(w => w.id === id ? { ...w, expanded: !w.expanded } : w);
      persistWidgets(updated);
      return updated;
    });
  }, [persistWidgets]);

  // Toggle widget visibility
  const toggleVisibility = useCallback((id: string) => {
    setWidgets(prev => {
      const updated = prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
      persistWidgets(updated);
      return updated;
    });
  }, [persistWidgets]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    const defaults = DEFAULT_WIDGET_CONFIGS[evolutionStage] || DEFAULT_WIDGET_CONFIGS['iniciante'];
    setWidgets(defaults);
    persistWidgets(defaults);
  }, [evolutionStage, persistWidgets]);

  const visibleWidgets = widgets.filter(w => w.visible).sort((a, b) => a.order - b.order);
  const hiddenCount = widgets.filter(w => !w.visible).length;

  const renderWidgetContent = (type: WidgetConfig['type']) => {
    switch (type) {
      case 'evolution':
        return <SelfEvolutionTracker userName={userData.nome} className="" />;
      case 'growth':
        return <UserGrowthMetrics className="" />;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Widget Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TooltipInfo
            titulo="Personalizar Layout"
            descricao="Expanda ou recolha widgets para personalizar sua experiência"
            variante="info"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              className={`text-xs ${showControls ? 'text-violet-400' : 'text-muted-foreground'}`}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Personalizar
            </Button>
          </TooltipInfo>
          {hiddenCount > 0 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {hiddenCount} oculto{hiddenCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {showControls && (
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Save className="w-3 h-3" />
                Salvando...
              </span>
            )}
            <TooltipInfo titulo="Resetar Layout" descricao="Voltar ao layout padrão" variante="info">
              <Button variant="ghost" size="sm" onClick={resetLayout} className="text-xs text-muted-foreground">
                <RotateCcw className="w-3 h-3 mr-1" />
                Resetar
              </Button>
            </TooltipInfo>
          </div>
        )}
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visibleWidgets.map((widget) => (
          <div
            key={widget.id}
            className="transition-all duration-200"
          >
            <Card className={`h-full transition-all duration-300 ${widget.expanded ? '' : 'hover:border-violet-500/30'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={widget.iconColor}>{widget.icon}</span>
                    <CardTitle className="text-base">{widget.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    {showControls && (
                      <TooltipInfo titulo={widget.visible ? 'Ocultar widget' : 'Mostrar widget'} descricao="" variante="info">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVisibility(widget.id)}
                          className="h-8 w-8 p-0"
                        >
                          {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                      </TooltipInfo>
                    )}
                    <TooltipInfo titulo={widget.expanded ? 'Recolher' : 'Expandir'} descricao="" variante="info">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(widget.id)}
                        className="h-8 w-8 p-0"
                      >
                        {widget.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </TooltipInfo>
                  </div>
                </div>
              </CardHeader>
              {widget.expanded && (
                <CardContent>
                  {renderWidgetContent(widget.type)}
                </CardContent>
              )}
            </Card>
          </div>
        ))}
      </div>

      {visibleWidgets.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Todos os widgets estão ocultos. Use o botão &ldquo;Personalizar&rdquo; para mostrá-los.</p>
        </Card>
      )}
    </div>
  );
}

export default AdaptiveWidgetGrid;