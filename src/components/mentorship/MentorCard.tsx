// ============================================================================
// MentorCard — Visual card for a mentor in the discovery grid
// ============================================================================
// Extracted from src/app/(community)/mentorship/page.tsx (Wave 20, Worker D).
// Used by:
//   - /mentorship (list page)
//   - any future "similar mentors" surface
//
// Design notes:
//   - Mobile-first: avatar + name on top, full-width CTA at bottom
//   - Touch targets >= 44px
//   - Semantic HTML (<article>, <h3>)
//   - Decorative emoji uses aria-hidden; meaningful content is text
//
// ============================================================================

import Link from 'next/link';
import {
  Star, Send, Loader2, CheckCircle2, Globe2, BookOpen,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MentorDto, MentorshipDto } from '@/hooks/useMentorship';
import type { MentorProfile, Language } from '@/lib/mentorship/types';

// ============================================================
// Accent map (per tradition)
// ============================================================

const TRADITION_COLOR: Record<string, string> = {
  cabala: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 hover:border-violet-500/60',
  ifa: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-500/60',
  astrologia: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 hover:border-pink-500/60',
  tantra: 'from-rose-500/20 to-fuchsia-500/20 border-rose-500/30 hover:border-rose-500/60',
  reiki: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/30 hover:border-cyan-500/60',
  meditacao: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-500/60',
  xamanismo: 'from-emerald-500/20 to-lime-500/20 border-emerald-500/30 hover:border-emerald-500/60',
  'cristianismo-mistico': 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 hover:border-blue-500/60',
  sufismo: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-500/60',
  taoismo: 'from-slate-500/20 to-zinc-500/20 border-slate-500/30 hover:border-slate-500/60',
  umbanda: 'from-orange-500/20 to-red-500/20 border-orange-500/30 hover:border-orange-500/60',
  candomble: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:border-yellow-500/60',
  ayahuasca: 'from-lime-500/20 to-green-500/20 border-lime-500/30 hover:border-lime-500/60',
};

export const LANGUAGE_LABEL: Record<Language, string> = {
  'pt-BR': 'PT',
  en: 'EN',
  es: 'ES',
};

// ============================================================
// Adapter — MentorDto (API) → display shape
// ============================================================

/**
 * Normalize either a MentorDto (API) or a MentorProfile (mock) for
 * display. Keeps the component agnostic of source.
 */
export interface MentorDisplay {
  id: string;
  displayName: string;
  bio: string | null;
  traditions: string[];
  languages?: Language[];
  topics?: string[];
  rating: number;
  completed: number;
  isAvailable: boolean;
}

export function toDisplay(input: MentorDto | MentorProfile): MentorDisplay {
  return {
    id: input.id,
    displayName: input.displayName,
    bio: input.bio ?? null,
    traditions: input.traditions,
    languages: 'languages' in input ? input.languages : undefined,
    topics: 'topics' in input ? input.topics : undefined,
    rating: input.rating,
    completed: input.completed,
    isAvailable: input.isAvailable,
  };
}

// ============================================================
// Component
// ============================================================

export interface MentorCardProps {
  mentor: MentorDto | MentorProfile;
  /** Existing mentorship to surface instead of "request" CTA. */
  existing?: MentorshipDto | undefined;
  isRequesting?: boolean;
  canRequest?: boolean;
  onRequest?: () => void;
  /** Optional link to mentor profile (defaults to /mentorship/mentor/[id]). */
  profileHref?: string;
  /** Show language + topic meta lines (defaults true). */
  showMeta?: boolean;
}

export function MentorCard({
  mentor,
  existing,
  isRequesting = false,
  canRequest = true,
  onRequest,
  profileHref,
  showMeta = true,
}: MentorCardProps) {
  const display = toDisplay(mentor);
  const primaryTradition = display.traditions[0] ?? '';
  const colorClass =
    TRADITION_COLOR[primaryTradition] ||
    'from-slate-500/20 to-slate-500/20 border-slate-500/30 hover:border-slate-500/60';

  const href = profileHref ?? `/mentorship/mentor/${display.id}`;

  return (
    <Card
      className={cn(
        'card-spiritual bg-gradient-to-br border transition-all h-full flex flex-col',
        colorClass
      )}
      data-testid={`mentor-card-${display.id}`}
    >
      <CardContent className="pt-4 flex-1 flex flex-col gap-3">
        {/* Avatar + name */}
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl bg-slate-950/40 border border-slate-800/50 flex items-center justify-center text-2xl flex-shrink-0"
            aria-hidden
          >
            {display.displayName[0]?.toUpperCase() ?? '🪶'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-100 truncate">
              <Link
                href={href}
                className="hover:text-amber-300 transition-colors focus-visible:underline focus-visible:outline-none"
              >
                {display.displayName}
              </Link>
            </h3>
            <div
              className="flex items-center gap-1 text-xs text-amber-300 mt-0.5"
              aria-label={
                display.rating > 0
                  ? `Avaliação ${display.rating.toFixed(1)} de 5 estrelas`
                  : 'Mentor novo, sem avaliações'
              }
            >
              <Star className="w-3 h-3 fill-current" aria-hidden />
              <span className="font-medium">
                {display.rating > 0 ? display.rating.toFixed(1) : 'novo'}
              </span>
              {display.completed > 0 && (
                <>
                  <span className="text-slate-500 mx-1" aria-hidden>
                    ·
                  </span>
                  <span className="text-slate-400">
                    {display.completed} concluídas
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {display.bio && (
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
            {display.bio}
          </p>
        )}

        {/* Traditions */}
        <div className="flex items-center flex-wrap gap-1">
          {display.traditions.map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="text-[10px] border-slate-700 text-slate-400"
            >
              {t}
            </Badge>
          ))}
        </div>

        {/* Meta: languages + topics (optional, only when present) */}
        {showMeta && (display.languages?.length || display.topics?.length) ? (
          <div className="space-y-1.5 pt-1 border-t border-slate-800/50">
            {display.languages && display.languages.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Globe2 className="w-3 h-3" aria-hidden />
                <span className="sr-only">Idiomas:</span>
                <span aria-hidden>
                  {display.languages.map((l) => LANGUAGE_LABEL[l] ?? l).join(' · ')}
                </span>
              </div>
            )}
            {display.topics && display.topics.length > 0 && (
              <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
                <BookOpen className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden />
                <span className="sr-only">Tópicos:</span>
                <span aria-hidden className="line-clamp-2">
                  {display.topics.slice(0, 4).join(' · ')}
                  {display.topics.length > 4 && ` +${display.topics.length - 4}`}
                </span>
              </div>
            )}
          </div>
        ) : null}

        {/* CTA */}
        <div className="pt-3 mt-auto border-t border-slate-800/50">
          {existing ? (
            <Link href={`/mentorship/${existing.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-amber-500/40 text-amber-300 hover:bg-amber-500/10 min-h-[44px]"
                data-testid={`mentorship-open-${display.id}`}
              >
                {existing.status === 'PENDING' ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" aria-hidden /> Aguardando aceite
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden /> Abrir mentoria
                  </>
                )}
              </Button>
            </Link>
          ) : onRequest ? (
            <Button
              size="sm"
              onClick={onRequest}
              disabled={!canRequest || isRequesting}
              className="w-full bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
              data-testid={`mentorship-request-${display.id}`}
              aria-label={`Pedir mentoria para ${display.displayName}`}
            >
              {isRequesting ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" aria-hidden /> Enviando...
                </>
              ) : !canRequest ? (
                'Selecione uma tradição'
              ) : (
                <>
                  <Send className="w-3 h-3 mr-1" aria-hidden /> Pedir mentoria
                </>
              )}
            </Button>
          ) : (
            <Link href={href}>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-slate-700 text-slate-200 hover:bg-slate-800/40 min-h-[44px]"
                data-testid={`mentorship-profile-${display.id}`}
              >
                Ver perfil
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MentorCard;
