// fallow-ignore-file unused-file
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Save, Download, Upload, RotateCcw, Trash2, Check } from 'lucide-react';

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: Array<{
    id: string;
    size: 'sm' | 'md' | 'lg' | 'xl';
    x: number;
    y: number;
    config?: Record<string, unknown>;
  }>;
  settings: {
    theme: 'dark' | 'light' | 'auto';
    columns: number;
    gap: 'sm' | 'md' | 'lg';
    density: 'comfortable' | 'compact';
  };
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

interface LayoutPersistenceProps {
  currentLayout: DashboardLayout | null;
  onLoadLayout: (layout: DashboardLayout) => void;
  onSaveLayout: (layout: DashboardLayout) => void;
  onDeleteLayout: (layoutId: string) => void;
  className?: string;
}

// Default layout templates
const DEFAULT_TEMPLATES: DashboardLayout[] = [
  {
    id: 'template-spiritual',
    name: 'Foco Espiritual',
    description: 'Layout otimizado para práticas espirituais',
    widgets: [],
    settings: { theme: 'dark', columns: 3, gap: 'md', density: 'comfortable' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'template-technical',
    name: 'Foco Técnico',
    description: 'Layout otimizado para métricas técnicas',
    widgets: [],
    settings: { theme: 'dark', columns: 4, gap: 'sm', density: 'compact' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'template-balanced',
    name: 'Balanceado',
    description: 'Layout balanceado entre espiritual e técnico',
    widgets: [],
    settings: { theme: 'dark', columns: 4, gap: 'md', density: 'comfortable' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'template-minimal',
    name: 'Mínimo',
    description: 'Layout minimalista com apenas o essencial',
    widgets: [],
    settings: { theme: 'dark', columns: 2, gap: 'lg', density: 'compact' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  }
];

// fallow-ignore-next-line complexity
export function LayoutPersistence({
  currentLayout,
  onLoadLayout,
  onSaveLayout,
  onDeleteLayout,
  className = ''
}: LayoutPersistenceProps) {
  const [savedLayouts, setSavedLayouts] = useState<DashboardLayout[]>([]);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load layouts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dashboard-layouts');
    if (stored) {
      try {
        const layouts = JSON.parse(stored);
        setSavedLayouts(layouts);
      } catch {
        setSavedLayouts([]);
      }
    }
  }, []);

  // Save current layout
  const handleSaveLayout = useCallback(() => {
    if (!currentLayout || !newLayoutName.trim()) return;

    const newLayout: DashboardLayout = {
      ...currentLayout,
      id: `layout-${Date.now()}`,
      name: newLayoutName.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedLayouts = [...savedLayouts.filter(l => l.id !== newLayout.id), newLayout];
    setSavedLayouts(updatedLayouts);
    localStorage.setItem('dashboard-layouts', JSON.stringify(updatedLayouts));
    
    onSaveLayout(newLayout);
    setNewLayoutName('');
    setShowSaveDialog(false);
    setLastSaved(new Date().toLocaleTimeString());
  }, [currentLayout, newLayoutName, savedLayouts, onSaveLayout]);

  // Load a saved layout
  const handleLoadLayout = useCallback((layout: DashboardLayout) => {
    onLoadLayout(layout);
    setShowLoadDialog(false);
  }, [onLoadLayout]);

  // Delete a layout
  const handleDeleteLayout = useCallback((layoutId: string) => {
    const updatedLayouts = savedLayouts.filter(l => l.id !== layoutId);
    setSavedLayouts(updatedLayouts);
    localStorage.setItem('dashboard-layouts', JSON.stringify(updatedLayouts));
    onDeleteLayout(layoutId);
  }, [savedLayouts, onDeleteLayout]);

  // Export layout to JSON
  const handleExportLayout = useCallback(() => {
    if (!currentLayout) return;
    
    const json = JSON.stringify(currentLayout, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-layout-${currentLayout.name || 'export'}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    setShowExportDialog(false);
  }, [currentLayout]);

  // Import layout from JSON
  const handleImportLayout = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const layout = JSON.parse(event.target?.result as string) as DashboardLayout;
          
          // Validate layout structure
          if (!layout.widgets || !layout.settings) {
            alert('Formato de layout inválido');
            return;
          }

          // Add to saved layouts
          const importedLayout = {
            ...layout,
            id: `imported-${Date.now()}`,
            name: layout.name ? `${layout.name} (importado)` : 'Layout importado',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const updatedLayouts = [...savedLayouts, importedLayout];
          setSavedLayouts(updatedLayouts);
          localStorage.setItem('dashboard-layouts', JSON.stringify(updatedLayouts));
          
          onLoadLayout(importedLayout);
          setShowLoadDialog(false);
        } catch {
          alert('Erro ao importar layout');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }, [savedLayouts, onLoadLayout]);

  // Reset to default
  const handleResetLayout = useCallback(() => {
    if (confirm('Tem certeza que deseja restaurar o layout padrão?')) {
      const defaultLayout = DEFAULT_TEMPLATES[2]; // Balanced
      onLoadLayout(defaultLayout);
    }
  }, [onLoadLayout]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Save button */}
      <button
        onClick={() => setShowSaveDialog(true)}
        className="flex items-center gap-2 w-full px-4 py-2.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/50 rounded-lg text-violet-300 transition-colors"
      >
        <Save className="w-4 h-4" />
        <span>Salvar Layout</span>
        {lastSaved && <span className="ml-auto text-xs text-slate-500">{lastSaved}</span>}
      </button>

      {/* Load button */}
      <button
        onClick={() => setShowLoadDialog(true)}
        className="flex items-center gap-2 w-full px-4 py-2.5 bg-slate-800/60 hover:bg-slate-800/80 border border-slate-700/50 rounded-lg text-slate-300 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Carregar Layout</span>
        {savedLayouts.length > 0 && (
          <span className="ml-auto text-xs text-slate-500">{savedLayouts.length} salvo(s)</span>
        )}
      </button>

      {/* Export/Import buttons */}
      <button
        onClick={() => setShowExportDialog(true)}
        className="flex items-center gap-2 w-full px-4 py-2.5 bg-slate-800/60 hover:bg-slate-800/80 border border-slate-700/50 rounded-lg text-slate-300 transition-colors"
      >
        <Upload className="w-4 h-4" />
        <span>Exportar / Importar</span>
      </button>

      {/* Reset button */}
      <button
        onClick={handleResetLayout}
        className="flex items-center gap-2 w-full px-4 py-2.5 bg-slate-800/60 hover:bg-slate-800/80 border border-slate-700/50 rounded-lg text-slate-400 hover:text-slate-300 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Restaurar Padrão</span>
      </button>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Salvar Layout</h3>
            <input
              type="text"
              placeholder="Nome do layout"
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveLayout}
                disabled={!newLayoutName.trim()}
                className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                Salvar
              </button>
              <button
                onClick={() => { setShowSaveDialog(false); setNewLayoutName(''); }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Carregar Layout</h3>
              <button onClick={() => setShowLoadDialog(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                <span className="text-slate-400">✕</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Templates */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-400 mb-2">Templates</h4>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleLoadLayout(template)}
                      className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-left transition-colors"
                    >
                      <p className="font-medium text-slate-200">{template.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Saved layouts */}
              {savedLayouts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Layouts Salvos</h4>
                  <div className="space-y-2">
                    {savedLayouts.map(layout => (
                      <div
                        key={layout.id}
                        className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg"
                      >
                        <button
                          onClick={() => handleLoadLayout(layout)}
                          className="flex-1 text-left"
                        >
                          <p className="font-medium text-slate-200">{layout.name}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(layout.updatedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </button>
                        <button
                          onClick={() => handleDeleteLayout(layout.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleImportLayout}
                className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-lg text-slate-300 transition-colors"
              >
                Importar de arquivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Exportar / Importar</h3>
            <div className="space-y-3">
              <button
                onClick={handleExportLayout}
                className="flex items-center gap-3 w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-lg text-slate-200 transition-colors"
              >
                <Download className="w-5 h-5 text-violet-400" />
                <div className="text-left">
                  <p className="font-medium">Exportar Layout Atual</p>
                  <p className="text-xs text-slate-500">Baixar como arquivo JSON</p>
                </div>
              </button>
              <button
                onClick={handleImportLayout}
                className="flex items-center gap-3 w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-lg text-slate-200 transition-colors"
              >
                <Upload className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <p className="font-medium">Importar Layout</p>
                  <p className="text-xs text-slate-500">Carregar de arquivo JSON</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowExportDialog(false)}
              className="w-full mt-4 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LayoutPersistence;