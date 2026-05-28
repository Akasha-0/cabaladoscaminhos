'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserPreferences } from '@/lib/store';
import { Moon, Sun, Sparkles, Bell, BellOff, X } from 'lucide-react';

export function UserSettings() {
  const { 
    tema, 
    notifications, 
    quizilas,
    setTema, 
    setNotifications,
    removeQuizila 
  } = useUserPreferences();

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-cinzel text-primary flex items-center gap-2">
              Configurações
            </CardTitle>
            <CardDescription className="font-raleway">
              Personalize sua experiência
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-primary">Tema</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={tema === 'mystical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTema('mystical')}
              className={tema === 'mystical' ? 'bg-primary' : ''}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Místico
            </Button>
            <Button
              variant={tema === 'minimal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTema('minimal')}
              className={tema === 'minimal' ? 'bg-primary' : ''}
            >
              <Moon className="w-4 h-4 mr-1" />
              Minimalista
            </Button>
            <Button
              variant={tema === 'cosmic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTema('cosmic')}
              className={tema === 'cosmic' ? 'bg-primary' : ''}
            >
              <Sun className="w-4 h-4 mr-1" />
              Cósmico
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-primary">Notificações</label>
          <Button
            variant={notifications ? 'default' : 'outline'}
            size="sm"
            onClick={() => setNotifications(!notifications)}
            className={notifications ? 'bg-primary' : ''}
          >
            {notifications ? <Bell className="w-4 h-4 mr-1" /> : <BellOff className="w-4 h-4 mr-1" />}
            {notifications ? 'Ativadas' : 'Desativadas'}
          </Button>
        </div>

        {quizilas.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-primary">Suas Quizilas</label>
            <div className="flex flex-wrap gap-2">
              {quizilas.map((quizila) => (
                <Badge key={quizila} variant="secondary" className="text-xs pr-1">
                  {quizila}
                  <button
                    onClick={() => removeQuizila(quizila)}
                    className="ml-1 p-0.5 hover:text-destructive rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}