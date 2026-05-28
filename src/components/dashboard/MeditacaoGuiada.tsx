'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  Moon,
  Sun,
  Wind,
  Heart,
  Sparkles,
  CloudRain,
  TreePine,
} from 'lucide-react';

type ThemeId = 'descanso' | 'luz' | 'amor' | 'energia' | 'chuva' | 'natureza';

interface MeditationTheme {
  id: ThemeId;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  breathingPattern: {
    inhale: number;
    hold: number;
    exhale: number;
    holdAfterExhale: number;
  };
}

const themes: MeditationTheme[] = [
  {
    id: 'descanso',
    name: 'Descanso Profundo',
    description: 'Relaxamento total para restaurar energia',
    icon: Moon,
    color: 'text-indigo-400',
    breathingPattern: { inhale: 4, hold: 4, exhale: 6, holdAfterExhale: 2 },
  },
  {
    id: 'luz',
    name: 'Luz Divina',
    description: 'Conexão com a luz espiritual',
    icon: Sun,
    color: 'text-amber-400',
    breathingPattern: { inhale: 5, hold: 3, exhale: 5, holdAfterExhale: 2 },
  },
  {
    id: 'amor',
    name: 'Amor Incondicional',
    description: 'Expansão do coração e compaixão',
    icon: Heart,
    color: 'text-rose-400',
    breathingPattern: { inhale: 4, hold: 7, exhale: 8, holdAfterExhale: 0 },
  },
  {
    id: 'energia',
    name: 'Energia Vital',
    description: ' desperta a energia prânica',
    icon: Sparkles,
    color: 'text-emerald-400',
    breathingPattern: { inhale: 6, hold: 0, exhale: 6, holdAfterExhale: 0 },
  },
  {
    id: 'chuva',
    name: 'Chuva Serenidade',
    description: ' paz com sons da natureza',
    icon: CloudRain,
    color: 'text-sky-400',
    breathingPattern: { inhale: 4, hold: 4, exhale: 6, holdAfterExhale: 4 },
  },
  {
    id: 'natureza',
    name: 'Conexão Natural',
    description: 'Harmonia com os elementos',
    icon: TreePine,
    color: 'text-green-400',
    breathingPattern: { inhale: 5, hold: 5, exhale: 5, holdAfterExhale: 5 },
  },
];

const presetDurations = [5, 10, 15, 20, 30];

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'holdAfterExhale';

const phaseLabels: Record<BreathPhase, string> = {
  inhale: 'Inspire',
  hold: 'Segure',
  exhale: 'Expire',
  holdAfterExhale: 'Segure',
};

export function MeditacaoGuiada() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('descanso');
  const [duration, setDuration] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [volume, setVolume] = useState(70);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);
  const [breathCycleCount, setBreathCycleCount] = useState(0);

  const theme = themes.find((t) => t.id === selectedTheme)!;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalBreathTime = useCallback(() => {
    const p = theme.breathingPattern;
    return p.inhale + p.hold + p.exhale + p.holdAfterExhale;
  }, [theme]);

  const runBreathCycle = useCallback(() => {
    const p = theme.breathingPattern;
    const total = totalBreathTime();

    const phases: { phase: BreathPhase; duration: number; next: BreathPhase }[] = [];
    if (p.inhale > 0) phases.push({ phase: 'inhale', duration: p.inhale, next: 'hold' });
    if (p.hold > 0) phases.push({ phase: 'hold', duration: p.hold, next: 'exhale' });
    if (p.exhale > 0) phases.push({ phase: 'exhale', duration: p.exhale, next: 'holdAfterExhale' });
    if (p.holdAfterExhale > 0) phases.push({ phase: 'holdAfterExhale', duration: p.holdAfterExhale, next: 'inhale' });

    let currentPhaseIndex = 0;
    const startTime = Date.now();

    const tick = () => {
      if (!isPlaying) return;

      const elapsed = (Date.now() - startTime) / 1000;
      const currentPhase = phases[currentPhaseIndex];
      const phaseElapsed = elapsed % total;
      
      let accumulated = 0;
      let newPhaseIndex = 0;
      let phaseElapsedTime = 0;

      for (let i = 0; i < phases.length; i++) {
        if (accumulated + phases[i].duration > phaseElapsed) {
          newPhaseIndex = i;
          phaseElapsedTime = phaseElapsed - accumulated;
          break;
        }
        accumulated += phases[i].duration;
      }

      const activePhase = phases[newPhaseIndex];
      setBreathPhase(activePhase.phase);
      setBreathProgress((phaseElapsedTime / activePhase.duration) * 100);

      if (newPhaseIndex !== currentPhaseIndex) {
        currentPhaseIndex = newPhaseIndex;
        if (newPhaseIndex === 0) {
          setBreathCycleCount((c) => c + 1);
        }
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [isPlaying, theme, totalBreathTime]);

  useEffect(() => {
    if (isPlaying) {
      runBreathCycle();
    }
  }, [isPlaying, runBreathCycle]);

  useEffect(() => {
    setTimeRemaining(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (timeRemaining === 0 && isPlaying) {
      setIsPlaying(false);
    }
  }, [timeRemaining, isPlaying]);

  const handlePlayPause = () => {
    if (timeRemaining === 0) {
      setTimeRemaining(duration * 60);
      setBreathCycleCount(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkip = () => {
    setTimeRemaining(0);
    setIsPlaying(false);
  };

  const handleThemeChange = (value: string | null) => {
    if (!value) return;
    setSelectedTheme(value as ThemeId);
    setBreathCycleCount(0);
  };

  const handleDurationChange = (value: number | readonly number[]) => {
    const numValue = typeof value === 'number' ? value : value[0];
    setDuration(numValue);
    if (!isPlaying) {
      setTimeRemaining(numValue * 60);
    }
  };

  const ThemeIcon = theme.icon;

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-background/50 ${theme.color}`}>
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-serif">Meditação Guiada</CardTitle>
              <p className="text-xs text-muted-foreground">
                Respiração consciente e mindfulness
              </p>
            </div>
          </div>
          {isPlaying && (
            <Badge variant="secondary" className="animate-pulse">
              <span className="mr-1">●</span> Ativo
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Tema da Meditação
          </label>
          <Select value={selectedTheme} onValueChange={handleThemeChange}>
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {themes.map((t) => {
                const Icon = t.icon;
                return (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${t.color}`} />
                      <span>{t.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground/70">{theme.description}</p>
        </div>

        {/* Breathing Guide Visualization */}
        <div className="relative flex flex-col items-center justify-center py-6">
          <div
            className={`
              relative w-32 h-32 rounded-full
              bg-gradient-to-br from-indigo-500/20 to-violet-500/20
              border-2 border-indigo-500/30
              transition-all duration-300
              ${breathPhase === 'inhale' ? 'scale-110' : ''}
              ${breathPhase === 'exhale' ? 'scale-90' : ''}
            `}
            style={{
              transform: `
                scale(${breathPhase === 'inhale' ? 1 + breathProgress / 550 : 1})
              `,
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-indigo-500/20 animate-glow-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-300 uppercase tracking-wide">
                {phaseLabels[breathPhase]}
              </span>
            </div>
          </div>

          {/* Breathing Bar */}
          <div className="w-full max-w-xs mt-4 space-y-1">
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-100"
                style={{ width: `${breathProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Ciclos: {breathCycleCount}</span>
              <span>
                {theme.breathingPattern.inhale +
                  theme.breathingPattern.hold +
                  theme.breathingPattern.exhale +
                  theme.breathingPattern.holdAfterExhale}
                s por ciclo
              </span>
            </div>
          </div>
        </div>

        {/* Duration Display */}
        <div className="text-center py-4 bg-background/30 rounded-lg">
          <div className="text-4xl font-serif font-bold text-foreground tracking-wider">
            {formatTime(timeRemaining)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isPlaying ? 'Tempo restante' : `Duração: ${duration} minutos`}
          </p>
        </div>

        {/* Duration Slider */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Duração (minutos)
          </label>
          <Slider
            value={[duration]}
            onValueChange={handleDurationChange}
            min={5}
            max={30}
            step={5}
            className="w-full"
            disabled={isPlaying}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {presetDurations.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDuration(d);
                  if (!isPlaying) setTimeRemaining(d * 60);
                }}
                className={`
                  px-2 py-1 rounded transition-colors
                  ${duration === d ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-background/50'}
                `}
                disabled={isPlaying}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            onValueChange={(v: number | readonly number[]) => {
              const numVal = typeof v === 'number' ? v : v[0];
              setVolume(numVal);
            }}
            min={0}
            max={100}
            step={5}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8 text-right">{volume}%</span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSkip}
            disabled={!isPlaying && timeRemaining === 0}
            className="rounded-full bg-background/50 border-border/50 hover:bg-background/70"
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <Button
            size="lg"
            onClick={handlePlayPause}
            className={`
              rounded-full w-16 h-16
              bg-gradient-to-br from-indigo-500 to-violet-600
              hover:from-indigo-600 hover:to-violet-700
              shadow-lg shadow-indigo-500/25
              transition-all duration-300
              ${isPlaying ? 'animate-glow-pulse' : ''}
            `}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>

          <div className="w-10" />
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
          <div className="text-center">
            <div className="text-2xl font-serif font-bold text-indigo-400">
              {breathCycleCount}
            </div>
            <div className="text-xs text-muted-foreground">Ciclos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-serif font-bold text-violet-400">
              {formatTime(duration * 60 - timeRemaining + (isPlaying ? 1 : 0))}
            </div>
            <div className="text-xs text-muted-foreground">Meditado</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
