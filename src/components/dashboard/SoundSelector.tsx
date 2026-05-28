'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { playBell, BellType } from '@/lib/audio/bell';
import { playAmbient, stopAmbient, setVolume as setAmbientVolume, AmbientType } from '@/lib/audio/ambient';

const BELL_OPTIONS: { value: BellType; label: string; desc: string }[] = [
  { value: 'temple', label: 'Templo', desc: 'Frequência 528Hz • Decay 2.5s' },
  { value: 'meditation', label: 'Meditação', desc: 'Frequência 432Hz • Decay 3.0s' },
  { value: 'singing', label: 'Canto', desc: 'Frequência 396Hz • Decay 2.0s' },
  { value: 'chime', label: 'Sino', desc: 'Frequência 639Hz • Decay 1.5s' },
];

const AMBIENT_OPTIONS: { value: AmbientType; label: string; desc: string }[] = [
  { value: 'chuva', label: 'Chuva', desc: 'Ruído marrom com gotículas' },
  { value: 'floresta', label: 'Floresta', desc: 'Vento entre folhas com sons sutis' },
  { value: 'oceano', label: 'Oceano', desc: 'Ondas com graves profundas' },
  { value: 'templos', label: 'Templos', desc: 'Tons sustentados com atmosfera suave' },
];

export function SoundSelector() {
  const [soundType, setSoundType] = useState<'bell' | 'ambient'>('bell');
  const [selectedBell, setSelectedBell] = useState<BellType>('temple');
  const [selectedAmbient, setSelectedAmbient] = useState<AmbientType>('templos');
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (isPlaying) {
      stopAmbient();
      setIsPlaying(false);
      return;
    }

    if (soundType === 'bell') {
      playBell(selectedBell);
    } else {
      playAmbient(selectedAmbient, volume / 100);
    }
    setIsPlaying(true);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (soundType === 'ambient' && isPlaying) {
      setAmbientVolume(newVolume / 100);
    }
  };

  const currentOptions = soundType === 'bell' ? BELL_OPTIONS : AMBIENT_OPTIONS;
  const currentSelection = soundType === 'bell' ? selectedBell : selectedAmbient;

  const handleSelectSound = (value: BellType | AmbientType) => {
    if (soundType === 'bell') {
      setSelectedBell(value as BellType);
    } else {
      setSelectedAmbient(value as AmbientType);
    }
    if (isPlaying && soundType === 'ambient') {
      stopAmbient();
      playAmbient(value as AmbientType, volume / 100);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Seletor de Sons</h3>
        <button
          onClick={handlePlay}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isPlaying
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
          }`}
        >
          {isPlaying ? 'Parar' : '🔊 Reproduzir'}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSoundType('bell')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            soundType === 'bell'
              ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
              : 'bg-slate-800/50 text-slate-400 border border-transparent hover:text-slate-300'
          }`}
        >
          Sino
        </button>
        <button
          onClick={() => setSoundType('ambient')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            soundType === 'ambient'
              ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
              : 'bg-slate-800/50 text-slate-400 border border-transparent hover:text-slate-300'
          }`}
        >
          Ambiente
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {currentOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelectSound(option.value)}
            className={`p-4 rounded-lg text-left transition-all ${
              currentSelection === option.value
                ? 'bg-indigo-500/20 border border-indigo-500/50'
                : 'bg-slate-800/50 border border-transparent hover:border-slate-600/50'
            }`}
          >
            <div className="font-medium text-sm">{option.label}</div>
            <div className="text-xs text-slate-500 mt-1">{option.desc}</div>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Volume</span>
          <span className="text-slate-300 font-medium">{volume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-500 bg-slate-700"
        />
      </div>
    </Card>
  );
}
