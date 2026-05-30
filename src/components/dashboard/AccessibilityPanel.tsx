'use client';

import React, { useState, useCallback } from 'react';
import { Accessibility, Eye, Type, Volume2, Contrast, ZoomIn, MousePointer, Keyboard } from 'lucide-react';

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
}

interface AccessibilityPanelProps {
  settings?: Partial<AccessibilitySettings>;
  onChange?: (settings: AccessibilitySettings) => void;
  className?: string;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 'medium',
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  focusIndicators: true,
};

export function AccessibilityPanel({
  settings = DEFAULT_SETTINGS,
  onChange,
  className = ''
}: AccessibilityPanelProps) {
  const [localSettings, setLocalSettings] = useState<AccessibilitySettings>({
    ...DEFAULT_SETTINGS,
    ...settings,
  });

  // Update setting
  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onChange?.(newSettings);
  }, [localSettings, onChange]);

  // Font size options
  const fontSizes = [
    { id: 'small', label: 'Pequeno', size: '12px' },
    { id: 'medium', label: 'Médio', size: '14px' },
    { id: 'large', label: 'Grande', size: '16px' },
    { id: 'xlarge', label: 'Extra Grande', size: '18px' },
  ] as const;

  return (
    <div className={`bg-slate-900/80 rounded-xl border border-slate-800/60 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-slate-100">Acessibilidade</h3>
        </div>
      </div>

      {/* Font size */}
      <div className="px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4 text-slate-500" />
          <h4 className="text-sm text-slate-300">Tamanho da fonte</h4>
        </div>
        <div className="flex items-center gap-2">
          {fontSizes.map(fs => (
            <button
              key={fs.id}
              onClick={() => updateSetting('fontSize', fs.id)}
              className={`
                flex-1 py-2 rounded-lg transition-all text-center
                ${localSettings.fontSize === fs.id
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 border border-transparent text-slate-400'
                }
              `}
            >
              <span className="text-xs">{fs.label}</span>
              <div
                className="mt-1 mx-auto rounded bg-slate-700"
                style={{
                  width: fs.id === 'small' ? '12px' : fs.id === 'medium' ? '14px' : fs.id === 'large' ? '16px' : '18px',
                  height: '4px',
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Toggle options */}
      <div className="p-4 space-y-3">
        {/* High Contrast */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Contrast className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm text-slate-200">Alto contraste</p>
              <p className="text-xs text-slate-500">Aumenta contraste das cores</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('highContrast', !localSettings.highContrast)}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${localSettings.highContrast ? 'bg-emerald-500' : 'bg-slate-700'}
            `}
          >
            <span className={`
              absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
              ${localSettings.highContrast ? 'left-7' : 'left-1'}
            `} />
          </button>
        </div>

        {/* Reduce Motion */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm text-slate-200">Reduzir movimento</p>
              <p className="text-xs text-slate-500">Desativa animações</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('reduceMotion', !localSettings.reduceMotion)}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${localSettings.reduceMotion ? 'bg-emerald-500' : 'bg-slate-700'}
            `}
          >
            <span className={`
              absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
              ${localSettings.reduceMotion ? 'left-7' : 'left-1'}
            `} />
          </button>
        </div>

        {/* Screen Reader */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm text-slate-200">Leitor de tela</p>
              <p className="text-xs text-slate-500">Otimiza para leitores de tela</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('screenReader', !localSettings.screenReader)}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${localSettings.screenReader ? 'bg-emerald-500' : 'bg-slate-700'}
            `}
          >
            <span className={`
              absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
              ${localSettings.screenReader ? 'left-7' : 'left-1'}
            `} />
          </button>
        </div>

        {/* Keyboard Navigation */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Keyboard className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm text-slate-200">Navegação por teclado</p>
              <p className="text-xs text-slate-500">Habilita atalhos de teclado</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('keyboardNavigation', !localSettings.keyboardNavigation)}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${localSettings.keyboardNavigation ? 'bg-emerald-500' : 'bg-slate-700'}
            `}
          >
            <span className={`
              absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
              ${localSettings.keyboardNavigation ? 'left-7' : 'left-1'}
            `} />
          </button>
        </div>

        {/* Focus Indicators */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <MousePointer className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm text-slate-200">Indicadores de foco</p>
              <p className="text-xs text-slate-500">Destaca elementos em foco</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('focusIndicators', !localSettings.focusIndicators)}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${localSettings.focusIndicators ? 'bg-emerald-500' : 'bg-slate-700'}
            `}
          >
            <span className={`
              absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
              ${localSettings.focusIndicators ? 'left-7' : 'left-1'}
            `} />
          </button>
        </div>
      </div>

      {/* Zoom level */}
      <div className="px-4 py-3 border-t border-slate-800/60">
        <div className="flex items-center gap-2 mb-2">
          <ZoomIn className="w-4 h-4 text-slate-500" />
          <h4 className="text-sm text-slate-300">Nível de zoom</h4>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 flex items-center justify-center">
            -
          </button>
          <div className="flex-1 h-2 bg-slate-800 rounded-full relative">
            <div className="absolute top-0 left-1/2 w-4 h-4 bg-violet-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
          <button className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 flex items-center justify-center">
            +
          </button>
          <span className="text-sm text-slate-400 w-12 text-center">100%</span>
        </div>
      </div>

      {/* Reset */}
      <div className="px-4 py-3 border-t border-slate-800/60">
        <button
          onClick={() => setLocalSettings(DEFAULT_SETTINGS)}
          className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-400 transition-colors"
        >
          Resetar para padrão
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-800/60">
        <p className="text-xs text-slate-500">
          Configurações de acessibilidade
        </p>
      </div>
    </div>
  );
}

export default AccessibilityPanel;