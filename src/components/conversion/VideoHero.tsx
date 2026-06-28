'use client';

// ============================================================================
// VideoHero — Player de vídeo com poster (Wave 20 — Variante B)
// ============================================================================
// Placeholder de vídeo para /validacao/b. Usa poster estático e player
// nativo do browser. Lazy-load (preload="none"). Quando vídeo real
// estiver no CDN, basta trocar `videoSrc`.
//
// Métricas: dispara `funnel_cta_click` quando usuário dá play.
// ============================================================================

import { useState, useRef } from 'react';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';
import { useCTATracker } from './LandingTracker';

interface Props {
  posterSrc: string;
  videoSrc: string;
  title: string;
}

export function VideoHero({ posterSrc, videoSrc, title }: Props) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackCTA = useCTATracker('B');

  const handlePlay = () => {
    setPlaying(true);
    trackCTA('video-play');
    videoRef.current?.play();
  };

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-violet-500/30 shadow-2xl shadow-violet-500/10">
      {!playing && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label={`Reproduzir vídeo: ${title}`}
          className="absolute inset-0 z-10 flex items-center justify-center group"
        >
          {/* Poster image (Wave 27 perf — next/image with priority preload) */}
          <Image
            src={posterSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 768px, 1200px"
            className="object-cover"
            priority={false}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-slate-950/40" />

          {/* Play button */}
          <div className="relative z-10 flex flex-col items-center gap-3 transition group-hover:scale-110">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-400 to-violet-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <PlayCircle className="w-12 h-12 md:w-14 md:h-14 text-slate-900" strokeWidth={1.5} />
            </div>
            <p className="text-sm md:text-base font-cinzel text-amber-200 tracking-wide">
              ▶ Assistir 60 segundos
            </p>
          </div>
        </button>
      )}

      <video
        ref={videoRef}
        poster={posterSrc}
        controls={playing}
        preload="none"
        playsInline
        aria-label={title}
        className={`absolute inset-0 w-full h-full object-cover ${playing ? 'opacity-100' : 'opacity-0'}`}
      >
        <source src={videoSrc} type="video/mp4" />
        <track kind="captions" srcLang="pt-BR" label="Português" />
        Seu navegador não suporta vídeo HTML5.
      </video>
    </div>
  );
}
