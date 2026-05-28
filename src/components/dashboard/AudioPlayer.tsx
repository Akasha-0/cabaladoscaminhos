'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  coverArt?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export default function AudioPlayer({
  src,
  title = 'Audio Track',
  artist = 'Unknown Artist',
  coverArt,
  onEnded,
  autoPlay = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>(src);

  // Initialize audio context for visualization
  const initAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch {
      // Audio context not supported
    }
  }, []);

  // Generate mock waveform data
  useEffect(() => {
    const data: number[] = [];
    for (let i = 0; i < 50; i++) {
      data.push(Math.random() * 0.5 + 0.2);
    }
    setWaveformData(data);
  }, []);

  // Draw waveform
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    const width = rect.width;
    const height = rect.height;
    const barWidth = width / waveformData.length;
    const progress = duration > 0 ? currentTime / duration : 0;

    ctx.clearRect(0, 0, width, height);

    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;
      const isPast = index / waveformData.length < progress;

      ctx.fillStyle = isPast
        ? isPlaying
          ? 'rgba(139, 92, 246, 0.9)'
          : 'rgba(139, 92, 246, 0.6)'
        : 'rgba(148, 163, 184, 0.3)';

      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);

      if (isPlaying && analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
        const scaledHeight = barHeight * (1 + avg / 255 * 0.5);

        if (isPast) {
          ctx.fillStyle = 'rgba(167, 139, 250, 0.8)';
          ctx.fillRect(x + 1, (height - scaledHeight) / 2, barWidth - 2, scaledHeight);
        }
      }
    });

    // Progress indicator line
    const progressX = progress * width;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(progressX - 1, 0, 2, height);
  }, [waveformData, currentTime, duration, isPlaying]);

  // Animation loop for waveform
  useEffect(() => {
    const animate = () => {
      drawWaveform();
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, drawWaveform]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
    };
  }, [onEnded]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      initAudioContext();
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, initAudioContext]);

  // Handle volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  // Handle source change
  useEffect(() => {
    setAudioUrl(src);
    setCurrentTime(0);
    setIsPlaying(false);
    setIsLoading(true);
  }, [src]);

  // Auto play
  useEffect(() => {
    if (autoPlay && audioRef.current) {
      setIsPlaying(true);
    }
  }, [autoPlay]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - 10);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(duration, audioRef.current.currentTime + 10);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className={`${isFullscreen ? 'h-full flex flex-col' : ''}`}>
        {/* Header with cover art */}
        <div className={`relative ${isFullscreen ? 'h-48' : 'h-40'}`}>
          {coverArt ? (
            <img
              src={coverArt}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-900 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <Volume2 className="w-10 h-10 text-white/50" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Track info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-semibold text-white truncate">{title}</h3>
            <p className="text-sm text-white/70 truncate">{artist}</p>
          </div>

          {/* Fullscreen button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/20"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>

        <CardContent className={`${isFullscreen ? 'flex-1 flex flex-col justify-center p-6' : 'p-4'}`}>
          {/* Waveform */}
          <div className="relative mb-4">
            <canvas
              ref={canvasRef}
              className="w-full h-16 cursor-pointer rounded-lg bg-slate-800/50"
              onClick={handleSeek}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-lg">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Skip backward */}
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
              onClick={skipBackward}
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            {/* Play/Pause */}
            <Button
              variant="default"
              size="icon"
              className="w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-500 text-white"
              onClick={togglePlayPause}
              disabled={isLoading}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>

            {/* Skip forward */}
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
              onClick={skipForward}
            >
              <SkipForward className="w-5 h-5" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-20 h-1 appearance-none bg-slate-700 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:rounded-full"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 ${isMuted ? 0 : volume}%, #334155 ${isMuted ? 0 : volume}%)`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}