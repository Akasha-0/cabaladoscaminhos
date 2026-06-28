// ============================================================================
// EVENT COVER — Imagem de capa do evento (W26)
// ----------------------------------------------------------------------------
// Wrapper sobre `next/image` com:
//   - Aspect ratio 16:9 (recomendado pelo Unsplash)
//   - Lazy loading automático (next/image default)
//   - Fallback gradient se a URL falhar
//   - Alt text obrigatório (acessibilidade WCAG 1.1.1)
// ============================================================================

import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCoverProps {
  src: string;
  alt: string;
  /** Variante visual: card (rounded) ou hero (full-width edge-to-edge) */
  variant?: 'card' | 'hero';
  /** Mostrar overlay gradient escuro sobre a imagem (melhora leitura do título) */
  withOverlay?: boolean;
  /** Quando true, prioriza o carregamento (acima da fold) */
  priority?: boolean;
  className?: string;
}

export function EventCover({
  src,
  alt,
  variant = 'card',
  withOverlay = false,
  priority = false,
  className,
}: EventCoverProps) {
  const aspectClass = variant === 'hero' ? 'aspect-[21/9]' : 'aspect-[16/9]';
  const sizeHint = variant === 'hero' ? '(min-width: 1024px) 100vw, 100vw' : '(min-width: 1024px) 50vw, 100vw';

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-gradient-to-br from-violet-900/40 via-slate-900 to-amber-900/30',
        aspectClass,
        className
      )}
      data-testid="event-cover"
    >
      {/* Ícone de fallback caso a imagem não carregue (next/image onError visual)
          — só aparece se houver erro, por cima da gradient. */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Sparkles
          className="w-8 h-8 text-amber-500/30"
          aria-hidden="true"
        />
      </div>

      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizeHint}
        priority={priority}
        className={cn(
          'object-cover',
          // Fade in suave quando a imagem carrega
          'transition-opacity duration-300'
        )}
      />

      {withOverlay && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
}