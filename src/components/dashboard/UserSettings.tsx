'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIStore, type Theme } from '@/lib/store';
import { Moon, Sun, Sparkles, Bell, BellOff } from 'lucide-react';

const THEMES: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'mystical', label: 'Místico', icon: <Sparkles className="w-4 h-4" /> },
  { value: 'minimal', label: 'Minimalista', icon: <Sun className="w-4 h-4" /> },
  { value: 'cosmic', label: 'Cósmico', icon: <Moon className="w-4 h-4" /> },
];

export function UserSettings() {
  const { 
    theme, 
    notificationsEnabled,
    setTheme,
    setNotifications,
  } = useUIStore();

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>Personalize sua experiência espiritual</CardDescription>
          </div>
          <Badge variant="secondary">Beta</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-primary">Tema</label>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <Button
                key={t.value}
                variant={theme === t.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme(t.value)}
                className="flex items-center gap-2"
              >
                {t.icon}
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-primary">Notificações</label>
          <Button
            variant={notificationsEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setNotifications(!notificationsEnabled)}
            className="flex items-center gap-2"
          >
            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            {notificationsEnabled ? 'Ativadas' : 'Desativadas'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}