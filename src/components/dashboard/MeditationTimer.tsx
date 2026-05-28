'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Clock,
  Bell,
  Circle,
  Sparkles,
} from 'lucide-react';

const PRESET_DURATIONS = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

const INTERVAL_OPTIONS = [
  { label: 'No intervals', value: 0 },
  { label: 'Every 5 min', value: 5 },
  { label: 'Every 10 min', value: 10 },
  { label: 'Every 15 min', value: 15 },
  { label: 'Every 30 min', value: 30 },
];

interface MeditationTimerProps {
  defaultMinutes?: number;
  onComplete?: () => void;
}

export default function MeditationTimer({
  defaultMinutes = 10,
  onComplete,
}: MeditationTimerProps) {
  const [duration, setDuration] = useState(defaultMinutes);
  const [inputMinutes, setInputMinutes] = useState(defaultMinutes.toString());
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(0);
  const [lastBellTime, setLastBellTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/bell.mp3');
    audioRef.current.volume = 0.7;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playBell = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const playCompletion = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      }, 500);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      }, 1000);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleStart = () => {
    setSessionStartTime(Date.now());
    setLastBellTime(0);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    if (timeLeft > 0) setIsRunning(true);
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setLastBellTime(0);
    setSessionStartTime(null);
  };

  const handlePresetSelect = (value: string) => {
    const minutes = parseInt(value, 10);
    setDuration(minutes);
    setInputMinutes(value);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
    setLastBellTime(0);
    setSessionStartTime(null);
  };

  const handleIntervalChange = (value: string | null) => {
    if (value === null) return;
    setIntervalMinutes(parseInt(value, 10));
  };

  const handleCustomDuration = (value: string) => {
    setInputMinutes(value);
    const minutes = parseInt(value, 10);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 180) {
      setDuration(minutes);
      if (!isRunning) {
        setTimeLeft(minutes * 60);
      }
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;

          if (intervalMinutes > 0) {
            const elapsed = (duration * 60) - newTime;
            const intervalSeconds = intervalMinutes * 60;
            const bellsRung = Math.floor(elapsed / intervalSeconds);
            if (bellsRung > lastBellTime && newTime > 0) {
              playBell();
              setLastBellTime(bellsRung);
            }
          }

          if (newTime <= 0) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setIsRunning(false);
            playCompletion();
            if (onComplete) onComplete();
            return 0;
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, duration, intervalMinutes, lastBellTime, onComplete, playBell, playCompletion]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatElapsed = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const elapsed = duration * 60 - timeLeft;
  const bellsRung = intervalMinutes > 0 ? Math.floor(elapsed / (intervalMinutes * 60)) : 0;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-slate-900/80 to-indigo-950/50 rounded-xl border border-indigo-500/20 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <CardTitle className="text-lg font-medium text-slate-100">
          Meditação Guiada
        </CardTitle>
      </div>

      <div className="relative">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-700/50"
          />
          <circle
            cx="96"
            cy="96"
            r="90"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-100">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-slate-400 mt-1">
            {isRunning ? 'em progresso' : timeLeft === 0 ? 'completo' : 'pronto'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-slate-600 text-slate-300">
          <Clock className="w-3 h-3 mr-1" />
          {formatElapsed(elapsed)} decorrido
        </Badge>
        {intervalMinutes > 0 && (
          <Badge variant="outline" className="border-indigo-500/50 text-indigo-300">
            <Bell className="w-3 h-3 mr-1" />
{bellsRung} sino{bellsRung !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="w-full flex items-center justify-center gap-2 flex-wrap">
        {PRESET_DURATIONS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetSelect(preset.value.toString())}
            disabled={isRunning}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${duration === preset.value && !isRunning
                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
              }
              ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="w-full flex items-center gap-2">
        <label className="text-sm text-slate-400 whitespace-nowrap">Sino:</label>
        <Select
          value={intervalMinutes.toString()}
          onValueChange={handleIntervalChange}
          disabled={isRunning}
        >
          <SelectTrigger className="w-full bg-slate-800/50 border-slate-700/50 text-slate-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {INTERVAL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value.toString()}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full flex items-center gap-2">
        <label className="text-sm text-slate-400 whitespace-nowrap">Min:</label>
        <input
          type="number"
          min="1"
          max="180"
          value={inputMinutes}
          onChange={(e) => handleCustomDuration(e.target.value)}
          disabled={isRunning}
          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
        />
      </div>

      <div className="flex items-center gap-3">
        {!isRunning ? (
          <>
            <Button
              onClick={timeLeft === duration * 60 ? handleStart : handleResume}
              variant="default"
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
            >
              <Play className="w-4 h-4" />
              {timeLeft === duration * 60 ? 'Iniciar' : 'Retomar'}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800/50 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </>
        ) : (
          <Button
            onClick={handlePause}
            variant="outline"
            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 gap-2"
          >
            <Pause className="w-4 h-4" />
            Pausar
          </Button>
        )}
      </div>

      <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}