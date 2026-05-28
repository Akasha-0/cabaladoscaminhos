'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getCurrentMoonPhase,
  getMoonPhaseNotifications,
  getMoonPhaseNamePt,
  type MoonPhaseEvent,
  type MoonPhaseNotification,
} from '@/lib/notifications/lua';
import {
  Moon,
  Sparkles,
  Calendar,
  Star,
  Sunrise,
  Sunset,
} from 'lucide-react';

function getPhaseEmoji(phase: MoonPhaseEvent['phase']): string {
  const emojis: Record<MoonPhaseEvent['phase'], string> = {
    new: '🌑',
    waxing_crescent: '🌒',
    first_quarter: '🌓',
    waxing_gibbous: '🌔',
    full: '🌕',
    waning_gibbous: '🌖',
    last_quarter: '🌗',
    waning_crescent: '🌘',
  };
  return emojis[phase];
}

function getPhaseGuidance(phase: MoonPhaseEvent['phase']): string {
  const guidance: Record<MoonPhaseEvent['phase'], string> = {
    new: 'Lua Nova: Momento de renovação e novos começos. Estabeleça intenções claras para o ciclo que se inicia. A energia está propícia para iniciar projetos e plantar sementes de intenção.',
    waxing_crescent: 'Crescente: Fase de crescimento e expansão. Seu poder de manifestação aumenta. Continue construindo sobre as intenções da Lua Nova, tomando ações decisivas.',
    first_quarter: 'Quarto Crescente: Momento de ação e superação de obstáculos. Desafios surgem para fortalecê-lo. Mantenha-se firme em seu propósito e supere resistências.',
    waxing_gibbous: 'Gibosa Crescente: Período de refinamento e paciência. Reveja seus objetivos e ajuste detalhes. A lua está quase cheia, acumulando poder para manifestação.',
    full: 'Lua Cheia: Pico de iluminação e poder. Energia em máxima potência para meditação, gratidão e manifestação. Abrace a abundância e libere o que não serve.',
    waning_gibbous: 'Gibosa Minguante: Fase de gratidão e avaliação. Analise o que foimanifestado e agradeça. Prepare-se para soltar enquanto a luz lunar diminui gradualmente.',
    last_quarter: 'Quarto Minguante: Momento de perdão e liberação. Solte o que não serve mais ao seu caminho. Pratique compaixão consigo mesmo e com os outros.',
    waning_crescent: 'Minguante: Fase de repouso e introspecção. Descanse e processe as lições do ciclo. Prepare-se silenciosamente para o novo ciclo que se aproxima.',
  };
  return guidance[phase];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  });
}

function getDaysLabel(days: number): string {
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  return `Em ${days} dias`;
}

export function MoonPhaseCard() {
  const [currentPhase, setCurrentPhase] = useState<MoonPhaseEvent | null>(null);
  const [notifications, setNotifications] = useState<MoonPhaseNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateMoonData = () => {
      const now = new Date();
      const phase = getCurrentMoonPhase(now);
      const notifs = getMoonPhaseNotifications(30, now);
      
      setCurrentPhase(phase);
      setNotifications(notifs.filter(n => n.daysFromNow >= 0).slice(0, 4));
      setLoading(false);
    };

    updateMoonData();
  }, []);

  if (loading || !currentPhase) {
    return (
      <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-950/50 border-indigo-500/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" />
            <CardTitle className="font-cinzel text-indigo-400">
              Fase Lunar
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const phaseName = getMoonPhaseNamePt(currentPhase.phase);
  const phaseEmoji = getPhaseEmoji(currentPhase.phase);
  const guidance = getPhaseGuidance(currentPhase.phase);

  return (
    <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-950/50 border-indigo-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" />
            <CardTitle className="font-cinzel text-indigo-400">
              Fase Lunar
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-indigo-300 border-indigo-400/50">
            <Star className="w-3 h-3 mr-1" />
            {currentPhase.illumination.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Phase Display */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-indigo-950/40 border border-indigo-500/20">
          <div className="text-5xl">{phaseEmoji}</div>
          <div className="flex-1">
            <h3 className="font-cinzel text-xl text-primary">
              {phaseName}
            </h3>
            <p className="text-sm text-muted-foreground font-raleway">
              Idade lunar: {currentPhase.age.toFixed(1)} dias
            </p>
          </div>
        </div>

        {/* Spiritual Guidance */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-300">
            <Sparkles className="w-4 h-4" />
            Orientação Espiritual
          </div>
          <p className="text-xs font-raleway text-muted-foreground leading-relaxed">
            {guidance}
          </p>
        </div>

        {/* Illumination Visual */}
        <div className="relative h-3 rounded-full bg-purple-950/60 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-500"
            style={{ width: `${currentPhase.illumination}%` }}
          />
        </div>

        {/* Upcoming Phases */}
        {notifications.length > 1 && (
          <div className="pt-2 border-t border-indigo-500/20">
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-300 mb-3">
              <Calendar className="w-4 h-4" />
              Próximas Fases
            </div>
            <div className="space-y-2">
              {notifications.slice(1).map((notif, index) => {
                const isNew = notif.type === 'new_moon';
                const isFull = notif.type === 'full_moon';
                
                return (
                  <div
                    key={index}
                    className={`
                      flex items-center justify-between p-2 rounded-md
                      ${isNew ? 'bg-amber-950/30 border border-amber-500/20' : ''}
                      ${isFull ? 'bg-indigo-950/30 border border-indigo-500/20' : ''}
                      bg-purple-950/20
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {notif.type === 'new_moon' && '🌑'}
                        {notif.type === 'first_quarter' && '🌓'}
                        {notif.type === 'full_moon' && '🌕'}
                        {notif.type === 'last_quarter' && '🌗'}
                      </span>
                      <span className="text-xs font-raleway text-muted-foreground">
                        {notif.title.split(' ')[0]} {notif.title.split(' ').slice(1).join(' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-raleway text-primary">
                        {getDaysLabel(notif.daysFromNow)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(notif.date)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ritual Suggestions */}
        <div className="pt-2 border-t border-indigo-500/20">
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-300 mb-2">
            {currentPhase.illumination > 50 ? (
              <Sunrise className="w-4 h-4" />
            ) : (
              <Sunset className="w-4 h-4" />
            )}
            Práticas Sugeridas
          </div>
          <div className="flex flex-wrap gap-1">
            {currentPhase.phase === 'new' && (
              <>
                <Badge variant="outline" className="text-xs">Meditação</Badge>
                <Badge variant="outline" className="text-xs">Intenções</Badge>
                <Badge variant="outline" className="text-xs">Novo projeto</Badge>
              </>
            )}
            {currentPhase.phase === 'full' && (
              <>
                <Badge variant="outline" className="text-xs">Gratidão</Badge>
                <Badge variant="outline" className="text-xs">Manifestação</Badge>
                <Badge variant="outline" className="text-xs">Cura energética</Badge>
              </>
            )}
            {(currentPhase.phase === 'first_quarter' || currentPhase.phase === 'waxing_gibbous') && (
              <>
                <Badge variant="outline" className="text-xs">Ação</Badge>
                <Badge variant="outline" className="text-xs">Decisões</Badge>
                <Badge variant="outline" className="text-xs">Foco</Badge>
              </>
            )}
            {(currentPhase.phase === 'last_quarter' || currentPhase.phase === 'waning_crescent') && (
              <>
                <Badge variant="outline" className="text-xs">Perdão</Badge>
                <Badge variant="outline" className="text-xs">Liberação</Badge>
                <Badge variant="outline" className="text-xs">Descanso</Badge>
              </>
            )}
            {currentPhase.phase === 'waxing_crescent' && (
              <>
                <Badge variant="outline" className="text-xs">Crescimento</Badge>
                <Badge variant="outline" className="text-xs">Aprendizado</Badge>
                <Badge variant="outline" className="text-xs">Conexão</Badge>
              </>
            )}
            {currentPhase.phase === 'waning_gibbous' && (
              <>
                <Badge variant="outline" className="text-xs">Avaliação</Badge>
                <Badge variant="outline" className="text-xs">Gratidão</Badge>
                <Badge variant="outline" className="text-xs">Planejamento</Badge>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}