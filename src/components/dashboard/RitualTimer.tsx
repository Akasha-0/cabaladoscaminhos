'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface RitualTimerProps {
  defaultMinutes?: number;
  onComplete?: () => void;
}

export default function RitualTimer({
  defaultMinutes = 5,
  onComplete,
}: RitualTimerProps) {
  const [duration, setDuration] = useState(defaultMinutes);
  const [inputMinutes, setInputMinutes] = useState(defaultMinutes.toString());
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/bell.mp3');
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
      audioRef.current.play().catch(() => {
        // Audio play failed - user may need interaction first
      });
    }
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playBell();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, playBell]);

  const handleStart = () => {
    const mins = parseInt(inputMinutes, 10);
    if (isNaN(mins) || mins <= 0) return;
    setDuration(mins);
    setTimeLeft(mins * 60);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    if (timeLeft > 0) setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-900/50 rounded-xl border border-slate-700/50">
      {/* Timer Display */}
      <div className="relative w-48 h-48">
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
            className="text-amber-500 transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-mono font-bold text-slate-100">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Duration Input */}
      {!isRunning && timeLeft === duration * 60 && (
        <div className="flex items-center gap-2">
          <label htmlFor="duration" className="text-sm text-slate-400">
            Duration (min):
          </label>
          <input
            id="duration"
            type="number"
            min="1"
            max="120"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(e.target.value)}
            className="w-16 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          timeLeft < duration * 60 && timeLeft > 0 ? (
            <button
              onClick={handleResume}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
            >
              Start
            </button>
          )
        ) : (
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
          >
            Pause
          </button>
        )}

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Status */}
      <p className="text-sm text-slate-400">
        {isRunning ? 'In progress...' : timeLeft === 0 ? 'Complete' : 'Ready'}
      </p>
    </div>
  );
}