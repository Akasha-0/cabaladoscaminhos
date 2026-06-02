// fallow-ignore-file unused-file
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain, Play, Pause, RotateCcw, Clock, Sparkles, Heart, 
  Shield, Eye, Zap, Mountain, Scale, CircleDot, Wind,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface AIMeditationGuideProps {
  userId: string;
  userName?: string;
  className?: string;
}

type MeditationTheme = 'transcendencia' | 'curacao' | 'protecao' | 'manifestacao' | 'ancestral' | 'equilibrio';

// ============================================================
// CONSTANTS
// ============================================================

const THEMES: { key: MeditationTheme; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { key: 'transcendencia', label: 'Transcendência', icon: <Sparkles className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/20' },
  { key: 'curacao', label: 'Cura', icon: <Heart className="w-5 h-5" />, color: 'text-pink-400', bg: 'bg-pink-500/20' },
  { key: 'protecao', label: 'Proteção', icon: <Shield className="w-5 h-5" />, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { key: 'manifestacao', label: 'Manifestação', icon: <Eye className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { key: 'ancestral', label: 'Ancestral', icon: <Mountain className="w-5 h-5" />, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  { key: 'equilibrio', label: 'Equilíbrio', icon: <Scale className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
];

const DURATIONS = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
];

const SESSIONS = [
  { id: 1, theme: 'Transcendência', duration: 10, date: 'Hoje às 08:00', completed: true },
  { id: 2, theme: 'Ancestral', duration: 15, date: 'Ontem às 21:00', completed: true },
  { id: 3, theme: 'Cura', duration: 5, date: '2 dias atrás', completed: false },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// fallow-ignore-next-line complexity
export function AIMeditationGuide({ userId, userName = 'Visitante', className = '' }: AIMeditationGuideProps) {
  const [selectedTheme, setSelectedTheme] = useState<MeditationTheme>('transcendencia');
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);

  // Get theme config
  const themeConfig = THEMES.find(t => t.key === selectedTheme) || THEMES[0];

  // Timer effect
  useEffect(() => {
    if (!isPlaying || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeRemaining]);

  const handleStart = () => {
    setTotalTime(selectedDuration * 60);
    setTimeRemaining(selectedDuration * 60);
    setShowPlayer(true);
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);
  const handleResume = () => setIsPlaying(true);
  const handleReset = () => {
    setTimeRemaining(totalTime);
    setIsPlaying(false);
  };

  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-base font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Meditação Guiada
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {!showPlayer ? (
          <>
            {/* Theme Selection */}
            <div>
              <p className="text-xs text-slate-400 mb-2">Escolha o tema</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.key}
                    onClick={() => setSelectedTheme(theme.key)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border transition-all',
                      selectedTheme === theme.key
                        ? `${theme.bg} ${theme.color} border-current/30`
                        : 'bg-slate-800/50 border-slate-700/30 text-slate-400 hover:border-slate-600/50'
                    )}
                  >
                    {theme.icon}
                    <span className="text-xs font-medium">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <p className="text-xs text-slate-400 mb-2">Duração</p>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDuration(d.value)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                      selectedDuration === d.value
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                        : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:border-slate-600/50'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Info */}
            <div className={cn('p-4 rounded-xl', themeConfig.bg, 'border', themeConfig.color.replace('text-', 'border-'), '/20')}>
              <div className="flex items-center gap-2 mb-2">
                <div className={themeConfig.color}>{themeConfig.icon}</div>
                <span className={cn('font-medium', themeConfig.color)}>{themeConfig.label}</span>
              </div>
              <p className="text-xs text-slate-400">
                Respiração: 4-4-4-4 • Mantram: Om Shanti
              </p>
            </div>

            {/* Start Button */}
            <Button 
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Meditação
            </Button>
          </>
        ) : (
          <>
            {/* Player */}
            <div className="text-center py-4">
              {/* Breathing animation */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className={cn(
                  'absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-violet-500/30',
                  isPlaying && 'animate-pulse'
                )} style={{ transform: isPlaying ? 'scale(1.1)' : 'scale(1)', transition: 'transform 2s ease-in-out' }} />
                <div className="absolute inset-4 rounded-full bg-slate-800/80 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-violet-400" />
                </div>
              </div>

              {/* Timer */}
              <p className="text-4xl font-bold text-white mb-2">
                {formatTime(timeRemaining)}
              </p>
              <p className="text-sm text-slate-400 mb-4">
                {themeConfig.label} • {selectedDuration} min
              </p>

              {/* Progress */}
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="rounded-full w-10 h-10 p-0 border-slate-700 text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={isPlaying ? handlePause : handleResume}
                  className="rounded-full w-14 h-14 p-0 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPlayer(false)}
                  className="rounded-full w-10 h-10 p-0 border-slate-700 text-slate-400 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Recent Sessions */}
        {showPlayer && (
          <div className="border-t border-slate-800/50 pt-4">
            <p className="text-xs text-slate-400 mb-2">Sessões recentes</p>
            <div className="space-y-2">
              {SESSIONS.slice(0, 3).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      session.completed ? 'bg-emerald-400' : 'bg-slate-500'
                    )} />
                    <span className="text-sm text-slate-300">{session.theme}</span>
                  </div>
                  <span className="text-xs text-slate-500">{session.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIMeditationGuide;