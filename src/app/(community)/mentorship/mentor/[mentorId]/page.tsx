// ============================================================================
// MENTOR PROFILE — /mentorship/mentor/[mentorId]
// ============================================================================
// Public mentor profile page. Distinct from /mentorship/[id]:
//   - /mentorship/[id]            → active mentorship (chat, status, accept/end)
//   - /mentorship/mentor/[mentorId] → mentor's profile (bio, topics, request CTA)
//
// Today this page consumes mock-mentors.ts (offline preview). Once the API
// exposes a GET /api/mentorship/[id]/profile endpoint, swap the data source.
//
// Wave 20 Worker D — 2026-06-28
// ============================================================================

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, Star, Globe2, BookOpen, Clock, MapPin,
  GraduationCap, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_MENTORS, findMockMentor } from '@/lib/mentorship/mock-mentors';
import { LANGUAGE_LABEL } from '@/components/mentorship/MentorCard';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ mentorId: string }>;
}

export async function generateStaticParams() {
  return MOCK_MENTORS.map((m) => ({ mentorId: m.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { mentorId } = await params;
  const mentor = findMockMentor(mentorId);
  if (!mentor) {
    return { title: 'Mentor não encontrado · Cabala dos Caminhos' };
  }
  const traditions = mentor.traditions.join(', ');
  return {
    title: `${mentor.displayName} · Mentoria 1-on-1`,
    description:
      mentor.bio ??
      `Mentor de ${traditions} na Cabala dos Caminhos. ${mentor.rating.toFixed(1)} ★ (${mentor.completed} mentorias concluídas).`,
  };
}

export default async function MentorProfilePage({ params }: PageProps) {
  const { mentorId } = await params;
  const mentor = findMockMentor(mentorId);
  if (!mentor) notFound();

  return (
    <div className="min-h-screen p-4 md:p-6 pb-24 md:pb-8" data-testid="mentor-profile-page">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Back */}
        <Link href="/mentorship">
          <Button variant="ghost" size="sm" data-testid="mentor-profile-back">
            <ArrowLeft className="w-4 h-4 mr-1" aria-hidden /> Voltar para mentorias
          </Button>
        </Link>

        {/* Header card */}
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
          <CardHeader>
            <div className="flex items-start gap-4 flex-wrap">
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-950/40 border border-slate-800/50 flex items-center justify-center text-3xl md:text-4xl flex-shrink-0"
                aria-hidden
              >
                {mentor.displayName[0]?.toUpperCase() ?? '🪶'}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-2xl md:text-3xl text-slate-100">
                  {mentor.displayName}
                </CardTitle>
                <div
                  className="flex items-center gap-1 text-sm text-amber-300 mt-1"
                  aria-label={
                    mentor.rating > 0
                      ? `Avaliação ${mentor.rating.toFixed(1)} de 5 estrelas`
                      : 'Mentor novo'
                  }
                >
                  <Star className="w-4 h-4 fill-current" aria-hidden />
                  <span className="font-medium">
                    {mentor.rating > 0 ? mentor.rating.toFixed(1) : 'novo'}
                  </span>
                  {mentor.completed > 0 && (
                    <>
                      <span className="text-slate-500 mx-1" aria-hidden>
                        ·
                      </span>
                      <span className="text-slate-400">
                        {mentor.completed} mentorias concluídas
                      </span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {mentor.traditions.map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="border-amber-500/40 text-amber-300"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Bio */}
            {mentor.bio && (
              <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                {mentor.bio}
              </p>
            )}

            {/* Meta grid */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/50">
              {mentor.region && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-slate-500" aria-hidden />
                  <dt className="sr-only">Região</dt>
                  <dd className="text-slate-300">{mentor.region}</dd>
                </div>
              )}
              {mentor.responseTime && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-500" aria-hidden />
                  <dt className="sr-only">Tempo de resposta</dt>
                  <dd className="text-slate-300">Responde em {mentor.responseTime}</dd>
                </div>
              )}
              {mentor.yearsPracticing !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-slate-500" aria-hidden />
                  <dt className="sr-only">Anos de prática</dt>
                  <dd className="text-slate-300">
                    {mentor.yearsPracticing} anos de prática
                  </dd>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Globe2 className="w-4 h-4 text-slate-500" aria-hidden />
                <dt className="sr-only">Idiomas</dt>
                <dd className="text-slate-300">
                  {mentor.languages.map((l) => LANGUAGE_LABEL[l] ?? l).join(' · ')}
                </dd>
              </div>
            </dl>

            {/* CTA */}
            <div className="pt-3 border-t border-slate-800/50">
              {mentor.isAvailable ? (
                <Link href={`/mentorship?request=${mentor.id}`}>
                  <Button
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0 min-h-[48px] px-6"
                    data-testid="mentor-profile-request"
                  >
                    <Sparkles className="w-4 h-4 mr-2" aria-hidden />
                    Pedir mentoria
                  </Button>
                </Link>
              ) : (
                <div className="text-sm text-slate-400 text-center py-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  Este mentor está com agenda cheia no momento. Tente outro.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Topics */}
        {mentor.topics.length > 0 && (
          <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-300/80">
                <BookOpen className="w-3 h-3" aria-hidden />
                Tópicos de especialidade
              </div>
            </CardHeader>
            <CardContent>
              <ul
                className="flex flex-wrap gap-2"
                aria-label={`Tópicos: ${mentor.topics.join(', ')}`}
              >
                {mentor.topics.map((t) => (
                  <li key={t}>
                    <Badge
                      variant="outline"
                      className="border-slate-700 text-slate-200"
                    >
                      {t}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Languages */}
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-300/80">
              <Globe2 className="w-3 h-3" aria-hidden />
              Idiomas
            </div>
          </CardHeader>
          <CardContent>
            <ul
              className="flex flex-wrap gap-2"
              aria-label={`Idiomas: ${mentor.languages.join(', ')}`}
            >
              {mentor.languages.map((l) => (
                <li key={l}>
                  <Badge
                    variant="outline"
                    className="border-slate-700 text-slate-200"
                  >
                    {LANGUAGE_LABEL[l] ?? l}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
