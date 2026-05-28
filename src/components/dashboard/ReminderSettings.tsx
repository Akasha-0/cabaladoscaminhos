'use client';

import { useState, useEffect } from 'react';
import { Bell, Moon, Flame, Clock, Save, Check } from 'lucide-react';
import { SpiritualCard, SpiritualCardHeader, SpiritualCardTitle, SpiritualCardContent } from '@/components/ui/spiritual-card';
import { SpiritualButton } from '@/components/ui/spiritual-button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

interface ReminderSettings {
  ritualEnabled: boolean;
  ritualTime: string;
  moonEnabled: boolean;
  moonTime: string;
  streakEnabled: boolean;
  streakTime: string;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  ritualEnabled: true,
  ritualTime: '07:00',
  moonEnabled: true,
  moonTime: '20:00',
  streakEnabled: true,
  streakTime: '21:00',
};

const STORAGE_KEY = 'reminder_settings';

function loadSettings(): ReminderSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: ReminderSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

interface ToggleRowProps {
  enabled: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
  children?: React.ReactNode;
}

function ToggleRow({ enabled, onToggle, icon, label, description, children }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-2 rounded-lg ${enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
          {icon}
        </div>
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
            enabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`pointer-events-none inline-block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export function ReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const handleToggle = (key: keyof ReminderSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleTimeChange = (key: keyof ReminderSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SpiritualCard variant="default" size="default">
      <SpiritualCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <SpiritualCardTitle>Configurações de Lembretes</SpiritualCardTitle>
          </div>
          <SpiritualButton
            variant={saved ? 'secondary' : 'default'}
            size="sm"
            onClick={handleSave}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Salvo
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar
              </>
            )}
          </SpiritualButton>
        </div>
      </SpiritualCardHeader>
      <SpiritualCardContent className="space-y-6">
        <ToggleRow
          enabled={settings.ritualEnabled}
          onToggle={() => handleToggle('ritualEnabled')}
          icon={<Flame className="w-4 h-4" />}
          label="Alertas de Ritual"
          description="Notificações para práticas espirituais do dia"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="time"
              value={settings.ritualTime}
              onChange={(e) => handleTimeChange('ritualTime', e.target.value)}
              disabled={!settings.ritualEnabled}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </ToggleRow>

        <Separator />

        <ToggleRow
          enabled={settings.moonEnabled}
          onToggle={() => handleToggle('moonEnabled')}
          icon={<Moon className="w-4 h-4" />}
          label="Alertas de Lua"
          description="Fases lunares, eclipses e eventos celestiais"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="time"
              value={settings.moonTime}
              onChange={(e) => handleTimeChange('moonTime', e.target.value)}
              disabled={!settings.moonEnabled}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </ToggleRow>

        <Separator />

        <ToggleRow
          enabled={settings.streakEnabled}
          onToggle={() => handleToggle('streakEnabled')}
          icon={<Bell className="w-4 h-4" />}
          label="Alertas de Sequência"
          description="Lembretes para manter sua streaks diária"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="time"
              value={settings.streakTime}
              onChange={(e) => handleTimeChange('streakTime', e.target.value)}
              disabled={!settings.streakEnabled}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </ToggleRow>
      </SpiritualCardContent>
    </SpiritualCard>
  );
}

export default ReminderSettings;