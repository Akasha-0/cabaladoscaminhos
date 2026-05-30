'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Play, Pause, RotateCcw, Volume2, VolumeX, Settings, Brain, Heart, Flame, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface MeditationPlayerProps {
  className?: string;
  userData?: {
    nome?: string;
    orixaRegente?: string;
  };
}

// ============================================================
// CONSTANTS
// ============================================================

const MEDITATION_TYPES = [
  { id: 'mindfulness', name: 'Mindfulness', icon: Brain, color: 'violet' },
  { id: 'loving', name: 'Amor', icon: Heart, color: 'pink' },
  { id: 'breath', name: 'Respiração', icon: Flame, color: 'orange' },
  { id: 'sleep', name: 'Sono', icon: Moon, color: 'indigo' },
];

const PRESETS = [
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '20 min', seconds: 1200 },
];

const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Chuva', icon: '🌧️' },
  { id: 'ocean', name: 'Ocean', icon: '🌊' },
  { id: 'forest', name: 'Floresta', icon: '🌲' },
  { id: 'bells', name: 'Sinos', icon: '🔔' },
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

export function MeditationPlayer({ className, userData }: MeditationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedType, setSelectedType] = useState(MEDITATION_TYPES[0]);
  const [selectedDuration, setSelectedDuration] = useState(600);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);

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

  const handlePlay = useCallback(() => {
    if (timeRemaining === 0) {
      setTimeRemaining(selectedDuration);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, timeRemaining, selectedDuration]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setTimeRemaining(selectedDuration);
  }, [selectedDuration]);

  const handleDurationChange = useCallback((seconds: number) => {
    setSelectedDuration(seconds);
    setTimeRemaining(seconds);
    setIsPlaying(false);
  }, []);

  const progress = ((selectedDuration - timeRemaining) / selectedDuration) * 100;
  const isComplete = timeRemaining === 0 && !isPlaying;

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Meditação Guiada
            </span>
          </span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-6">
        {/* Meditation Type Selector */}
        <div className="grid grid-cols-4 gap-2">
          {MEDITATION_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
                  selectedType.id === type.id
                    ? `bg-${type.color}-500/20 border-${type.color}-500/30 text-${type.color}-400`
                    : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:border-slate-600/50'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{type.name}</span>
              </button>
            );
          })}
        </div>

        {/* Timer Display */}
        <div className="text-center py-6">
          {/* Animated circle */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            {/* Background circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-slate-800"
              />
              {/* Progress circle */}
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
                style={{ color: selectedType.color === 'violet' ? '#8b5cf6' : selectedType.color === 'pink' ? '#ec4899' : selectedType.color === 'orange' ? '#f97316' : '#6366f1' }}
              />
            </svg>

            {/* Timer text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                'text-5xl font-bold tabular-nums',
                isComplete ? 'text-emerald-400' : 'text-white'
              )}>
                {isComplete ? '✓' : formatTime(timeRemaining)}
              </span>
              <span className="text-sm text-slate-400">
                {isComplete ? 'Completo!' : selectedType.name}
              </span>
            </div>
          </div>

          {/* Duration presets */}
          <div className="flex justify-center gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.seconds}
                onClick={() => handleDurationChange(preset.seconds)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  selectedDuration === preset.seconds
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:border-slate-600/50'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Reset */}
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all flex items-center justify-center border border-slate-700/30"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white hover:from-violet-400 hover:to-purple-400 transition-all flex items-center justify-center shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </button>

          {/* Mute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              'w-12 h-12 rounded-full transition-all flex items-center justify-center border',
              isMuted
                ? 'bg-slate-800/50 text-slate-400 border-slate-700/30'
                : 'bg-slate-800/50 text-violet-400 border-violet-500/30'
            )}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Ambient Sounds */}
        {showSettings && (
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 animate-fade-in">
            <p className="text-xs text-slate-400 mb-3">Sons Ambiente</p>
            <div className="grid grid-cols-4 gap-2">
              {AMBIENT_SOUNDS.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => setSelectedSound(selectedSound === sound.id ? null : sound.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all',
                    selectedSound === sound.id
                      ? 'bg-violet-500/20 border-violet-500/30'
                      : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
                  )}
                >
                  <span className="text-lg">{sound.icon}</span>
                  <span className="text-[10px] text-slate-400">{sound.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/50">
          <div className="text-center">
            <p className="text-lg font-bold text-white">12</p>
            <p className="text-[10px] text-slate-500">Sessões</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-violet-400">3.2h</p>
            <p className="text-[10px] text-slate-500">Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-orange-400">7🔥</p>
            <p className="text-[10px] text-slate-500">Sequência</p>
          </div>
        </div>
      </CardContent>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </Card>
  );
}

export default MeditationPlayer;