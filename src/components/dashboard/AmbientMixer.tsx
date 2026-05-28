'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { playAmbient, stopAmbient, setVolume, AmbientType } from '@/lib/audio/ambient';

interface Channel {
  id: string;
  type: AmbientType;
  label: string;
  volume: number;
  enabled: boolean;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  channels: Omit<Channel, 'id'>[];
}

const AMBIENT_OPTIONS: { type: AmbientType; label: string; icon: string }[] = [
  { type: 'chuva', label: 'Chuva', icon: '🌧️' },
  { type: 'floresta', label: 'Floresta', icon: '🌲' },
  { type: 'oceano', label: 'Oceano', icon: '🌊' },
  { type: 'templos', label: 'Templos', icon: '🕉️' },
];

const PRESETS: Preset[] = [
  {
    id: 'meditation',
    name: 'Meditação Profunda',
    description: 'Ambiente tranquilo para práticas contemplativas',
    channels: [
      { type: 'templos', label: 'Templos', volume: 60, enabled: true },
      { type: 'chuva', label: 'Chuva', volume: 30, enabled: true },
    ],
  },
  {
    id: 'nature',
    name: 'Natureza',
    description: 'Imersão total na natureza',
    channels: [
      { type: 'floresta', label: 'Floresta', volume: 70, enabled: true },
      { type: 'chuva', label: 'Chuva', volume: 40, enabled: true },
      { type: 'oceano', label: 'Oceano', volume: 20, enabled: true },
    ],
  },
  {
    id: 'ocean',
    name: 'Ondas do Oceano',
    description: 'Relaxamento junto ao mar',
      { type: 'oceano', label: 'Oceano', volume: 80, enabled: true },
    ],
    ],
  },
  {
    id: 'rainforest',
    name: 'Floresta Tropical',
    description: 'Sombras e brisas tropicais',
    channels: [
      { type: 'floresta', label: 'Floresta', volume: 50, enabled: true },
      { type: 'chuva', label: 'Chuva', volume: 60, enabled: true },
    ],
  },
];

const createChannel = (type: AmbientType, enabled = false): Channel => {
  const option = AMBIENT_OPTIONS.find((o) => o.type === type) || AMBIENT_OPTIONS[0];
  return {
    id: `${type}-${Date.now()}`,
    type,
    label: option.label,
    volume: 50,
    enabled,
  };
};

export function AmbientMixer() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(75);

  const stopAllSounds = useCallback(() => {
    stopAmbient();
    channels.forEach((ch) => {
      if (ch.enabled) {
        // Individual stop not needed since ambient.ts uses single source
      }
    });
  }, [channels]);

  const startMix = useCallback(() => {
    const activeChannels = channels.filter((ch) => ch.enabled);
    if (activeChannels.length === 0) return;

    // For now, play the first active channel
    // A full implementation would use Web Audio API mixing
    if (activeChannels.length > 0) {
      const avgVolume = (masterVolume / 100) * 0.5;
      playAmbient(activeChannels[0].type, avgVolume);
    }
  }, [channels, masterVolume]);

  const handleToggleChannel = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch
      )
    );
  };

  const handleVolumeChange = (channelId: string, volume: number[]) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, volume: volume[0] } : ch
      )
    );
    // Update the playing sound's volume if active
    const channel = channels.find((ch) => ch.id === channelId);
    if (channel?.enabled && isPlaying) {
      const effectiveVolume = (masterVolume / 100) * (volume[0] / 100) * 0.5;
      setVolume(effectiveVolume);
    }
  };

  const handleAddChannel = (type: AmbientType) => {
    if (channels.find((ch) => ch.type === type)) return;
    const newChannel = createChannel(type, true);
    setChannels((prev) => [...prev, newChannel]);
  };

  const handleRemoveChannel = (channelId: string) => {
    setChannels((prev) => prev.filter((ch) => ch.id !== channelId));
  };

  const handleApplyPreset = (preset: Preset) => {
    // Map preset channels to actual options, skipping unavailable ones
    const validChannels = preset.channels
      .filter((pc) => AMBIENT_OPTIONS.some((o) => o.type === pc.type))
      .map((pc) => createChannel(pc.type, pc.enabled));

    setChannels(validChannels);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopAllSounds();
      setIsPlaying(false);
    } else {
      startMix();
      setIsPlaying(true);
    }
  };

  const handleMasterVolumeChange = (value: number[]) => {
    setMasterVolume(value[0]);
    if (isPlaying) {
      const activeChannels = channels.filter((ch) => ch.enabled);
      if (activeChannels.length > 0) {
        const effectiveVolume = (value[0] / 100) * (activeChannels[0].volume / 100) * 0.5;
        setVolume(effectiveVolume);
      }
    }
  };

  const availableOptions = AMBIENT_OPTIONS.filter(
    (opt) => !channels.find((ch) => ch.type === opt.type)
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mixer de Ambientes</span>
          <Button
            size="sm"
            variant={isPlaying ? 'destructive' : 'default'}
            onClick={handlePlayPause}
          >
            {isPlaying ? '⏹ Parar' : '▶️ Tocar'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
              onValueChange={(v) => handleMasterVolumeChange(typeof v === 'number' ? [v] : v as number[])}
        <div className="space-y-2">
          <label className="text-sm font-medium">Volume Principal</label>
          <div className="flex items-center gap-4">
            <Slider
              value={[masterVolume]}
              onValueChange={handleMasterVolumeChange}
              min={0}
              max={100}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12 text-right">
              {masterVolume}%
            </span>
          </div>
        </div>

        {/* Active Channels */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Canais Ativos</label>
          {channels.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Adicione sons para criar seu mix
            </p>
          ) : (
            <div className="space-y-2">
              {channels.map((channel) => {
                const option = AMBIENT_OPTIONS.find((o) => o.type === channel.type);
                return (
                  <div
                    key={channel.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
                  >
                    <button
                      onClick={() => handleToggleChannel(channel.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors ${
                        channel.enabled
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted-foreground/20'
                      }`}
                    >
                      {option?.icon || '🔊'}
                    </button>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{channel.label}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Slider
                          value={[channel.volume]}
                          onValueChange={(v) => handleVolumeChange(channel.id, v)}
                          min={0}
                          max={100}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {channel.volume}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveChannel(channel.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Sound */}
        {availableOptions.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Adicionar Som</label>
            <div className="flex flex-wrap gap-2">
              {availableOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => handleAddChannel(opt.type)}
                  className="px-3 py-2 rounded-full border bg-background hover:bg-muted transition-colors text-sm flex items-center gap-2"
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Presets */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className="p-3 rounded-lg border bg-background hover:bg-muted transition-colors text-left"
              >
                <div className="text-sm font-medium">{preset.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}