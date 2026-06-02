// fallow-ignore-file unused-file
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Palette, Bell, Globe, Moon, Sun, Monitor, Shield, Save, RotateCcw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

type Theme = 'dark' | 'light' | 'auto' | 'system';
type Density = 'compact' | 'comfortable' | 'spacious';

interface DashboardSettingsProps {
  className?: string;
}

interface SettingsState {
  theme: Theme;
  density: Density;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
  };
  language: string;
  timezone: string;
  reducedMotion: boolean;
  highContrast: boolean;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// fallow-ignore-next-line complexity
export function DashboardSettings({ className = '' }: DashboardSettingsProps) {
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'dark',
    density: 'comfortable',
    notifications: {
      email: true,
      push: true,
      sms: false,
      desktop: true,
    },
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    reducedMotion: false,
    highContrast: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In real app, save to backend/localStorage
    localStorage.setItem('dashboard-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings({
      theme: 'dark',
      density: 'comfortable',
      notifications: { email: true, push: true, sms: false, desktop: true },
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      reducedMotion: false,
      highContrast: false,
    });
  };

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'dark', label: 'Escuro', icon: <Moon className="w-4 h-4" /> },
    { value: 'light', label: 'Claro', icon: <Sun className="w-4 h-4" /> },
    { value: 'system', label: 'Sistema', icon: <Monitor className="w-4 h-4" /> },
  ];

  const densityOptions: { value: Density; label: string; description: string }[] = [
    { value: 'compact', label: 'Compacto', description: 'Mais informações na tela' },
    { value: 'comfortable', label: 'Confortável', description: 'Equilíbrio ideal' },
    { value: 'spacious', label: 'Espaçado', description: 'Mais respiração visual' },
  ];

  const toggleNotification = (key: keyof SettingsState['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
  };

  return (
    <Card className={cn('card-spiritual', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            <CardTitle className="text-lg">Configurações do Dashboard</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar
            </button>
            <button
              onClick={handleSave}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm',
                saved 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-primary text-white hover:bg-primary/80'
              )}
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Salvo!' : 'Salvar'}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <h3 className="font-medium text-white">Tema</h3>
          </div>
          <div className="flex gap-2">
            {themeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSettings(prev => ({ ...prev, theme: option.value }))}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                  settings.theme === option.value
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:text-white hover:border-slate-600'
                )}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Density Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h3 className="font-medium text-white">Densidade</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {densityOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSettings(prev => ({ ...prev, density: option.value }))}
                className={cn(
                  'p-3 rounded-lg border text-left transition-colors',
                  settings.density === option.value
                    ? 'border-primary bg-primary/20'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                )}
              >
                <p className={cn(
                  'font-medium',
                  settings.density === option.value ? 'text-primary' : 'text-white'
                )}>
                  {option.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-violet-400" />
            <h3 className="font-medium text-white">Notificações</h3>
          </div>
          <div className="space-y-2">
            {[
              { key: 'email' as const, label: 'E-mail', description: 'Receber notificações por e-mail' },
              { key: 'push' as const, label: 'Push', description: 'Notificações push no navegador' },
              { key: 'sms' as const, label: 'SMS', description: 'Alertas por mensagem de texto' },
              { key: 'desktop' as const, label: 'Desktop', description: 'Notificações na área de trabalho' },
            ].map(item => (
              <div 
                key={item.key}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
              >
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <button
                  onClick={() => toggleNotification(item.key)}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    settings.notifications[item.key] ? 'bg-primary' : 'bg-slate-600'
                  )}
                >
                  <span className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    settings.notifications[item.key] ? 'left-6' : 'left-1'
                  )} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Language & Timezone */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h3 className="font-medium text-white">Idioma</h3>
            </div>
            <select
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <h3 className="font-medium text-white">Fuso Horário</h3>
            </div>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
              <option value="America/New_York">New York (GMT-5)</option>
              <option value="Europe/London">London (GMT+0)</option>
              <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
            </select>
          </div>
        </div>

        {/* Accessibility */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            <h3 className="font-medium text-white">Acessibilidade</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <div>
                <p className="font-medium text-white">Motion Reduzido</p>
                <p className="text-xs text-slate-500">Minimizar animações</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }))}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  settings.reducedMotion ? 'bg-primary' : 'bg-slate-600'
                )}
              >
                <span className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.reducedMotion ? 'left-6' : 'left-1'
                )} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <div>
                <p className="font-medium text-white">Alto Contraste</p>
                <p className="text-xs text-slate-500">Melhorar legibilidade</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }))}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  settings.highContrast ? 'bg-primary' : 'bg-slate-600'
                )}
              >
                <span className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.highContrast ? 'left-6' : 'left-1'
                )} />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardSettings;
