'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  RotateCcw,
  Eye,
  Wind,
  Target,
  Sparkles,
  Crown,
  Brain,
  Heart,
  Shield,
  Sun,
  Zap,
  Gem,
  Anchor,
  Castle,
} from 'lucide-react';
import { getMeditation, type Sefirah, type Meditation } from '@/lib/cabala/sefiroth-meditation';

const SEFIRAH_ICONS: Record<Sefirah, React.ElementType> = {
  keter: Crown,
  chokhmah: Brain,
  binah: Sparkles,
  chesed: Heart,
  geburah: Shield,
  tiferet: Sun,
  netzach: Zap,
  hod: Gem,
  yesod: Anchor,
  malkuth: Castle,
};

const SEFIRAH_COLORS: Record<Sefirah, { from: string; to: string; glow: string }> = {
  keter: { from: 'from-violet-600', to: 'to-purple-600', glow: 'shadow-violet-500/25' },
  chokhmah: { from: 'from-amber-500', to: 'to-yellow-500', glow: 'shadow-amber-500/25' },
  binah: { from: 'from-slate-600', to: 'to-gray-600', glow: 'shadow-slate-500/25' },
  chesed: { from: 'from-blue-500', to: 'to-indigo-600', glow: 'shadow-blue-500/25' },
  geburah: { from: 'from-red-600', to: 'to-orange-600', glow: 'shadow-red-500/25' },
  tiferet: { from: 'from-yellow-400', to: 'to-amber-500', glow: 'shadow-yellow-500/25' },
  netzach: { from: 'from-emerald-500', to: 'to-green-600', glow: 'shadow-emerald-500/25' },
  hod: { from: 'from-orange-500', to: 'to-amber-600', glow: 'shadow-orange-500/25' },
  yesod: { from: 'from-violet-600', to: 'to-indigo-700', glow: 'shadow-violet-500/25' },
  malkuth: { from: 'from-stone-600', to: 'to-amber-700', glow: 'shadow-stone-500/25' },
};

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)-(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  const singleMatch = duration.match(/(\d+)/);
  return singleMatch ? parseInt(singleMatch[1], 10) : 15;
}

interface SefirahMeditationProps {
  defaultSefirah?: Sefirah;
  onComplete?: (sefirah: Sefirah) => void;
}

export default function SefirahMeditation({
  defaultSefirah = 'tiferet',
  onComplete,
}: SefirahMeditationProps) {
  const [selectedSefirah, setSelectedSefirah] = useState<Sefirah>(defaultSefirah);
  const [meditation, setMeditation] = useState<Meditation>(() => getMeditation(defaultSefirah));
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(() => parseDuration(getMeditation(defaultSefirah).duration) * 60);
  const [totalDuration, setTotalDuration] = useState(() => parseDuration(getMeditation(defaultSefirah).duration) * 60);
  const [currentTab, setCurrentTab] = useState<string>('mantra');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const med = getMeditation(selectedSefirah);
    setMeditation(med);
    const durationSecs = parseDuration(med.duration) * 60;
    setTotalDuration(durationSecs);
    if (!isPlaying) {
      setTimeRemaining(durationSecs);
    }
  }, [selectedSefirah, isPlaying]);

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            onComplete?.(selectedSefirah);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, selectedSefirah, onComplete]);

  const handlePlayPause = useCallback(() => {
    if (timeRemaining === 0) {
      const durationSecs = parseDuration(meditation.duration) * 60;
      setTimeRemaining(durationSecs);
      setTotalDuration(durationSecs);
    }
    setIsPlaying((prev) => !prev);
    if (!isPlaying) {
      startTimeRef.current = Date.now();
    }
  }, [timeRemaining, meditation.duration, isPlaying]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    const durationSecs = parseDuration(meditation.duration) * 60;
    setTimeRemaining(durationSecs);
    setTotalDuration(durationSecs);
  }, [meditation.duration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;
  const colors = SEFIRAH_COLORS[selectedSefirah];
  const SefirahIcon = SEFIRAH_ICONS[selectedSefirah];

  const sefirot: Sefirah[] = [
    'keter', 'chokhmah', 'binah', 'chesed', 'geburah',
    'tiferet', 'netzach', 'hod', 'yesod', 'malkuth',
  ];

  return (
    <Card className={`bg-gradient-to-br from-card to-card/80 border-border/50 overflow-hidden`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${colors.from} ${colors.to} bg-opacity-20`}>
              <SefirahIcon className={`w-5 h-5 bg-gradient-to-br ${colors.from} ${colors.to} bg-clip-text`} />
            </div>
            <div>
              <CardTitle className="text-lg font-serif">
                {meditation.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground font-hebrew">
                {meditation.hebrew}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPlaying && (
              <Badge variant="secondary" className="animate-pulse">
                <span className="mr-1">●</span> Ativo
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sefirah Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Sephirah
          </label>
          <Select
            value={selectedSefirah}
            onValueChange={(value) => {
              setSelectedSefirah(value as Sefirah);
              setCurrentTab('mantra');
            }}
          >
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sefirot.map((sef) => {
                const Icon = SEFIRAH_ICONS[sef];
                const med = getMeditation(sef);
                return (
                  <SelectItem key={sef} value={sef}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{med.name}</span>
                      <span className="text-xs text-muted-foreground font-hebrew ml-1">
                        {med.hebrew}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground/70">
            {meditation.meaning}
          </p>
        </div>

        {/* Timer Display */}
        <div className="relative flex flex-col items-center justify-center py-6">
          <div
            className={`
              relative w-28 h-28 rounded-full
              bg-gradient-to-br ${colors.from}/10 ${colors.to}/10
              border-2 border-${colors.from.split('-')[1]}-500/30
              ${isPlaying ? 'animate-pulse' : ''}
            `}
          >
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.from}/5 ${colors.to}/5`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-serif font-bold bg-gradient-to-br ${colors.from} ${colors.to} bg-clip-text text-transparent`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xs mt-4 space-y-1">
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colors.from} ${colors.to} transition-all duration-1000`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{meditation.duration}</span>
              <span>{Math.round(progress)}% completo</span>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-background/50">
            <TabsTrigger value="mantra" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Mantra
            </TabsTrigger>
            <TabsTrigger value="visualization" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Visualização
            </TabsTrigger>
            <TabsTrigger value="details" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Detalhes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mantra" className="mt-4 space-y-3">
            <div className={`p-4 rounded-lg bg-gradient-to-br ${colors.from}/10 ${colors.to}/10 border border-${colors.from.split('-')[1]}-500/20`}>
              <div className="text-center mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Mantra
                </span>
                <div className={`text-2xl font-serif font-bold mt-1 bg-gradient-to-br ${colors.from} ${colors.to} bg-clip-text text-transparent`}>
                  {meditation.mantra}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background/30 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Padrão Respiratório</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {meditation.breathPattern}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="visualization" className="mt-4">
            <div className={`p-4 rounded-lg bg-gradient-to-br ${colors.from}/5 ${colors.to}/5 border border-${colors.from.split('-')[1]}-500/10`}>
              <div className="flex items-center gap-2 mb-3">
                <Eye className={`w-4 h-4 text-${colors.from.split('-')[1]}-400`} />
                <span className="text-sm font-medium">Visualização</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {meditation.visualization}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-3">
            <div className="p-3 rounded-lg bg-background/30 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Pontos de Foco</span>
              </div>
              <ul className="space-y-1.5">
                {meditation.focus.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${colors.from} ${colors.to}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-background/30 border border-border/30 text-center">
                <div className="text-lg font-serif font-bold text-muted-foreground">
                  {meditation.duration}
                </div>
                <div className="text-xs text-muted-foreground">Duração</div>
              </div>
              <div className="p-3 rounded-lg bg-background/30 border border-border/30 text-center">
                <div className={`text-lg font-serif font-bold bg-gradient-to-br ${colors.from} ${colors.to} bg-clip-text text-transparent`}>
                  {selectedSefirah.charAt(0).toUpperCase() + selectedSefirah.slice(1)}
                </div>
                <div className="text-xs text-muted-foreground">Sefirah</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            className="rounded-full bg-background/50 border-border/50 hover:bg-background/70"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            size="lg"
            onClick={handlePlayPause}
            className={`
              rounded-full w-16 h-16
              bg-gradient-to-br ${colors.from} ${colors.to}
              hover:${colors.from} hover:${colors.to}
              ${colors.glow}
              shadow-lg
              transition-all duration-300
              ${isPlaying ? 'animate-pulse' : ''}
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
      </CardContent>
    </Card>
  );
}
