'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type BreathingPattern = '4-7-8' | 'box';

interface BreathingPhase {
  name: string;
  duration: number;
  instruction: string;
}

const PATTERNS: Record<BreathingPattern, { name: string; phases: BreathingPhase[] }> = {
  '4-7-8': {
    name: 'Relaxação 4-7-8',
    phases: [
      { name: 'inhale', duration: 4, instruction: 'Inspire profundamente' },
      { name: 'hold', duration: 7, instruction: 'Segure o ar' },
      { name: 'exhale', duration: 8, instruction: 'Expire lentamente' },
    ],
  },
  'box': {
    name: 'Box Breathing',
    phases: [
      { name: 'inhale', duration: 4, instruction: 'Inspire' },
      { name: 'hold', duration: 4, instruction: 'Segure' },
      { name: 'exhale', duration: 4, instruction: 'Expire' },
      { name: 'hold', duration: 4, instruction: 'Segure' },
    ],
  },
};

interface BreathingExerciseProps {
  defaultPattern?: BreathingPattern;
  defaultDuration?: number;
  onComplete?: () => void;
}

export default function BreathingExercise({
  defaultPattern = '4-7-8',
  defaultDuration = 5,
  onComplete,
}: BreathingExerciseProps) {
  const [pattern, setPattern] = useState<BreathingPattern>(defaultPattern);
  const [duration, setDuration] = useState(defaultDuration);
  const [inputDuration, setInputDuration] = useState(defaultDuration.toString());
  const [timeLeft, setTimeLeft] = useState(defaultDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const phases = PATTERNS[pattern].phases;
  const currentPhase = phases[currentPhaseIndex];

  useEffect(() => {
    audioRef.current = new Audio('/sounds/bell.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  const playBell = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const totalCycleDuration = phases.reduce((sum, p) => sum + p.duration, 0);
  const cycleSeconds = totalCycleDuration;
  const cyclesCompleted = Math.floor((defaultDuration * 60 - timeLeft) / cycleSeconds);
  const targetCycles = Math.ceil(duration / (cycleSeconds / 60));

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const startTime = Date.now();
      const initialPhaseIndex = currentPhaseIndex;
      const initialPhaseTime = phaseProgress;

      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        let newPhaseIndex = initialPhaseIndex;
        let newPhaseTime = initialPhaseTime + elapsed;
        let accumulatedTime = 0;

        for (let i = 0; i < phases.length; i++) {
          const phaseDuration = phases[i].duration;
          if (accumulatedTime + phaseDuration > newPhaseTime) {
            newPhaseIndex = i;
            newPhaseTime = newPhaseTime - accumulatedTime;
            break;
          }
          accumulatedTime += phaseDuration;
          if (i === phases.length - 1) {
            newPhaseTime = newPhaseTime - accumulatedTime;
            accumulatedTime = 0;
          }
        }

        setCurrentPhaseIndex(newPhaseIndex);
        setPhaseProgress(newPhaseTime);

        const currentPhaseDuration = phases[newPhaseIndex].duration;
        const progress = (newPhaseTime / currentPhaseDuration) * 100;

        if (newPhaseTime >= currentPhaseDuration) {
          if (newPhaseIndex === phases.length - 1) {
            playBell();
          }
        }
      }, 50);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentPhaseIndex, phases, playBell]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          playBell();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, playBell, onComplete]);

  useEffect(() => {
    if (!isRunning) return;

    const phaseTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          playBell();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(phaseTimer);
  }, [isRunning, playBell, onComplete]);

  const handleStart = () => {
    const mins = parseInt(inputDuration, 10);
    if (!isNaN(mins) && mins > 0 && mins <= 120) {
      setDuration(mins);
      setTimeLeft(mins * 60);
    }
    setCurrentPhaseIndex(0);
    setPhaseProgress(0);
    setIsRunning(true);
    playBell();
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    if (timeLeft > 0) setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentPhaseIndex(0);
    setPhaseProgress(0);
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0;
  const phaseDuration = currentPhase?.duration || 1;
  const phaseProgressPct = Math.min((phaseProgress / phaseDuration) * 100, 100);

  const getCircleScale = () => {
    if (!currentPhase) return 1;
    switch (currentPhase.name) {
      case 'inhale':
        return 0.6 + (phaseProgressPct / 100) * 0.4;
      case 'exhale':
        return 1 - (phaseProgressPct / 100) * 0.4;
      case 'hold':
        return currentPhaseIndex === 0 ? 1 : 0.6;
      default:
        return 1;
    }
  };

  const getCircleColor = () => {
    if (!currentPhase) return 'text-cyan-400';
    switch (currentPhase.name) {
      case 'inhale':
        return 'text-emerald-400';
      case 'exhale':
        return 'text-blue-400';
      case 'hold':
        return 'text-amber-400';
      default:
        return 'text-cyan-400';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-900/50 rounded-xl border border-slate-700/50">
      <h2 className="text-xl font-semibold text-slate-100">
        Exercício de Respiração
      </h2>

      {/* Pattern Selector */}
      <div className="flex gap-2">
        {(Object.keys(PATTERNS) as BreathingPattern[]).map((p) => (
          <button
            key={p}
            onClick={() => {
              setPattern(p);
              if (!isRunning) {
                setCurrentPhaseIndex(0);
                setPhaseProgress(0);
              }
            }}
            disabled={isRunning}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              pattern === p
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            } disabled:opacity-50`}
          >
            {PATTERNS[p].name}
          </button>
        ))}
      </div>

      {/* Animated Circle */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-700"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="text-cyan-500 transition-all duration-1000"
          />
        </svg>
        <div
          className={`absolute w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-4 border-cyan-400/50 flex items-center justify-center transition-transform duration-1000 ease-in-out ${getCircleColor()}`}
          style={{ transform: `scale(${getCircleScale()})` }}
        >
          <div className="text-center">
            <span className="text-lg font-bold text-white">
              {currentPhase?.name === 'inhale' ? 'Inspire' : currentPhase?.name === 'exhale' ? 'Expire' : 'Segure'}
            </span>
            <div className="text-3xl font-mono font-bold text-white mt-1">
              {Math.ceil(phaseDuration - phaseProgress)}
            </div>
          </div>
        </div>
      </div>

      {/* Time Remaining */}
      <div className="text-2xl font-mono font-bold text-slate-100">
        {formatTime(timeLeft)}
      </div>

      {/* Instruction */}
      <div className="text-cyan-300 text-center">
        {currentPhase?.instruction}
      </div>

      {/* Cycle Counter */}
      <div className="text-sm text-slate-400">
        Ciclo {cyclesCompleted + 1} de ~{targetCycles}
      </div>

      {/* Duration Input */}
      {!isRunning && timeLeft === duration * 60 && (
        <div className="flex items-center gap-2">
          <label htmlFor="breathing-duration" className="text-sm text-slate-400">
            Duração (min):
          </label>
          <input
            id="breathing-duration"
            type="number"
            min="1"
            max="120"
            value={inputDuration}
            onChange={(e) => setInputDuration(e.target.value)}
            className="w-16 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          timeLeft < duration * 60 && timeLeft > 0 ? (
            <button
              onClick={handleResume}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
            >
              Iniciar
            </button>
          )
        ) : (
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
          >
            Pausar
          </button>
        )}

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
        >
          Reiniciar
        </button>
      </div>

      {/* Status */}
      <div className="text-sm text-slate-400">
        {isRunning ? 'Em exercício' : 'Pausado'}
      </div>
    </div>
  );
}