'use client';

import { useState, useCallback, useRef } from 'react';
import { 
  GripVertical, 
  Plus, 
  X, 
  Settings2,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { listWidgets, getWidget } from '@/lib/dashboard/widget-registry';

interface WidgetConfig {
  id: string;
  order: number;
  enabled: boolean;
}

interface WidgetCustomizerProps {
  activeWidgets: WidgetConfig[];
  onWidgetsChange: (widgets: WidgetConfig[]) => void;
}

interface WidgetItemProps {
  widget: WidgetConfig;
  onRemove: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  isDragOver: boolean;
}

function DraggableWidgetItem({ 
  widget, 
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
}: WidgetItemProps) {
  const widgetMeta = getWidget(widget.id);
  const label = widgetMeta?.label || widget.id;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(widget.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(widget.id);
      }}
      onDrop={() => onDrop(widget.id)}
      className={`
        flex items-center gap-3 p-3 rounded-lg border bg-card
        ${isDragOver ? 'border-primary bg-accent/50' : ''}
      `}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded touch-none"
        onMouseDown={(e) => {
          e.currentTarget.closest('[draggable]')?.setAttribute('draggable', 'false');
        }}
        onMouseUp={(e) => {
          const el = e.currentTarget.closest('[draggable]');
          if (el) el.setAttribute('draggable', 'true');
        }}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className="flex-1">
        <span className="text-sm font-medium">{label}</span>
      </div>

      <Badge variant={widget.enabled ? 'default' : 'secondary'}>
        {widget.enabled ? 'Ativo' : 'Inativo'}
      </Badge>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(widget.id)}
        className="h-8 w-8 text-destructive hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function WidgetCustomizer({ 
  activeWidgets, 
  onWidgetsChange 
}: WidgetCustomizerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAvailable, setShowAvailable] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const allWidgets = listWidgets();
  const availableWidgets = allWidgets.filter(
    w => !activeWidgets.some(aw => aw.id === w.id)
  );

  const handleDragStart = useCallback((id: string) => {
    setDraggingId(id);
  }, []);

  const handleDragOver = useCallback((id: string) => {
    if (draggingId && id !== draggingId) {
      setDragOverId(id);
    }
  }, [draggingId]);

  const handleDrop = useCallback((targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const activeWidgetsCopy = [...activeWidgets];
    const oldIndex = activeWidgetsCopy.findIndex(w => w.id === draggingId);
    const newIndex = activeWidgetsCopy.findIndex(w => w.id === targetId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const [removed] = activeWidgetsCopy.splice(oldIndex, 1);
      activeWidgetsCopy.splice(newIndex, 0, removed);
      
      const reordered = activeWidgetsCopy.map((widget, index) => ({
        ...widget,
        order: index,
      }));
      
      onWidgetsChange(reordered);
    }

    setDraggingId(null);
    setDragOverId(null);
  }, [draggingId, activeWidgets, onWidgetsChange]);

  const handleAddWidget = useCallback((widgetId: string) => {
    const newWidget: WidgetConfig = {
      id: widgetId,
      order: activeWidgets.length,
      enabled: true,
    };
    onWidgetsChange([...activeWidgets, newWidget]);
    setShowAvailable(false);
  }, [activeWidgets, onWidgetsChange]);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    const filtered = activeWidgets
      .filter(w => w.id !== widgetId)
      .map((widget, index) => ({ ...widget, order: index }));
    onWidgetsChange(filtered);
  }, [activeWidgets, onWidgetsChange]);

  const activeWidgetsSorted = [...activeWidgets].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Personalizar Widgets</span>
          <Badge variant="outline" className="ml-2">
            {activeWidgets.length} widgets
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          <Separator />

          {/* Active Widgets */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Widgets Ativos
              </span>
            </div>

            {activeWidgetsSorted.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum widget ativo. Adicione widgets abaixo.
              </p>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {activeWidgetsSorted.map(widget => (
                    <DraggableWidgetItem
                      key={widget.id}
                      widget={widget}
                      onRemove={handleRemoveWidget}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      isDragOver={dragOverId === widget.id}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}

            <p className="text-xs text-muted-foreground">
              Arraste para reordenar. Clique no badge para ativar/desativar.
            </p>
          </div>

          {/* Add Widget Button */}
          <Button
            variant="outline"
            onClick={() => setShowAvailable(!showAvailable)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Widget
          </Button>

          {/* Available Widgets */}
          {showAvailable && availableWidgets.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">
                Widgets Disponíveis
              </span>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-4">
                  {availableWidgets.map(widget => (
                    <div
                      key={widget.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <span className="text-sm font-medium">{widget.label}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddWidget(widget.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {showAvailable && availableWidgets.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Todos os widgets disponíveis já estão ativos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default WidgetCustomizer;