'use client';

// ============================================================================
// MENTORSHIP LIST — /mentorship
// ============================================================================
// Lista mentores disponíveis por tradição. Mentee clica "Solicitar mentoria"
// e uma Mentorship (PENDING) é criada. Cada card mostra tradição + bio +
// rating + completed.
// ============================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles, Search, Loader2, GraduationCap, Send, Hash, MessageCircle, X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  useAvailableMentors,
  useRequestMentorship,
  useMyMentorships,
  type MentorDto,
  type MentorshipDto,
} from '@/hooks/useMentorship';
import { useAuth } from '@/hooks/useAuth';
import { useHaptic } from '@/hooks/useHaptic';
import { MentorCard } from '@/components/mentorship/MentorCard';
import {
  SingleChipGroup,
  MultiChipGroup,
} from '@/components/mentorship/FilterChips';
import {
  TRADITION_CHIPS,
  LANGUAGE_CHIPS,
  TOPIC_CHIPS,
  type TraditionSlug,
  type Language,
  type Topic,
} from '@/lib/mentorship/types';

// ============================================================
// Constantes — tradições canônicas (espelham groups/page.tsx)
// ============================================================

const TRADITION_FILTERS = [
  { value: '', label: 'Todas as tradições' },
  { value: 'cabala', label: 'Cabala' },
  { value: 'ifa', label: 'Astrologia' },
  { value: 'astrologia', label: 'Astrologia' },
  { value: 'tantra', label: 'Tantra' },
  { value: 'reiki', label: 'Reiki' },
  { value: 'meditacao', label: 'Meditação' },
  { value: 'xamanismo', label: 'Xamanismo' },
  { value: 'cristianismo-mistico', label: 'Cristianismo Místico' },
  { value: 'sufismo', label: 'Sufismo' },
  { value: 'taoismo', label: 'Taoísmo' },
  { value: 'umbanda', label: 'Umbanda' },
  { value: 'candomble', label: 'Candomblé' },
];

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
};

// ============================================================
// MAIN
// ============================================================

export default function MentorshipPage() {
  const { user } = useAuth();
  const { trigger } = useHaptic();
  const devUserId = user?.id ?? undefined;

  const [tradition, setTradition] = useState<TraditionSlug | ''>('');
  const [search, setSearch] = useState('');
  const [selectedTradition, setSelectedTradition] = useState<string>('');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [requestingMentorId, setRequestingMentorId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleLanguage = (lang: Language) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };
  const toggleTopic = (topic: Topic) => {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const { mentors, loading, error, refresh } = useAvailableMentors({
    tradition: tradition || undefined,
    ...(devUserId ? { devUserId } : {}),
  });

  const { mentorships: myMentorships, refresh: refreshMine } = useMyMentorships({
    ...(devUserId ? { devUserId } : {}),
  });

  const { request, loading: requesting } = useRequestMentorship({
    ...(devUserId ? { devUserId } : {}),
  });

  // Mapeia mentorId → mentorship existente (PENDING/ACTIVE) para desabilitar card
  const existingByMentor = useMemo(() => {
    const map = new Map<string, MentorshipDto>();
    for (const m of myMentorships) {
      if (m.status === 'PENDING' || m.status === 'ACTIVE') {
        map.set(m.mentorId, m);
      }
    }
    return map;
  }, [myMentorships]);

  // Filtro client-side por search (nome/bio) + language + topic
  const filtered = useMemo(() => {
    let list = mentors;
    if (search.trim()) {
      const needle = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.displayName.toLowerCase().includes(needle) ||
          (m.bio?.toLowerCase().includes(needle) ?? false) ||
          m.traditions.some((t) => t.toLowerCase().includes(needle))
      );
    }
    // Languages/topics are display-only fields on the API DTO today.
    // If the API doesn't expose them yet, the filter is a no-op
    // (graceful degradation) — see Wave 20 Worker D note.
    // To keep the UI honest: only filter when value is present.
    if (languages.length > 0) {
      list = list.filter((m) => {
        const mLanguages = (m as unknown as { languages?: Language[] }).languages;
        if (!mLanguages) return true; // unknown → keep (no false negatives)
        return mLanguages.some((l) => languages.includes(l));
      });
    }
    if (topics.length > 0) {
      list = list.filter((m) => {
        const mTopics = (m as unknown as { topics?: string[] }).topics;
        if (!mTopics) return true; // unknown → keep
        return mTopics.some((t) => topics.includes(t as Topic));
      });
    }
    return list;
  }, [mentors, search, languages, topics]);

  const handleRequest = async (mentor: MentorDto) => {
    if (!user) {
      setFeedback('Faça login para solicitar mentoria');
      trigger('error');
      return;
    }
    if (!selectedTradition) {
      setFeedback(
        `Escolha a tradição antes de solicitar (uma das: ${mentor.traditions.join(', ')})`
      );
      trigger('error');
      return;
    }
    setRequestingMentorId(mentor.id);
    trigger('medium');
    const result = await request({
      mentorId: mentor.id,
      tradition: selectedTradition,
    });
    setRequestingMentorId(null);
    if (result.ok) {
      setFeedback(
        `Solicitação enviada para ${mentor.displayName}! Aguarde a aceitação.`
      );
      trigger('success');
      refreshMine();
    } else {
      setFeedback(result.error ?? 'Erro ao solicitar mentoria');
      trigger('error');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 pb-24 md:pb-8" data-testid="mentorship-list-page">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              🪶 Mentoria 1-on-1
            </h1>
            <p className="text-sm text-slate-400 font-raleway mt-1">
              Praticantes experientes guiam novatos em uma tradição
            </p>
          </div>
        </header>

        {/* Feedback banner */}
        {feedback && (
          <Card className="card-spiritual bg-slate-900/70 border-amber-500/40">
            <CardContent className="py-3 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-200 flex-1">{feedback}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFeedback(null)}
                className="text-xs text-slate-400"
              >
                Fechar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* My mentorships */}
        {myMentorships.length > 0 && (
          <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-300/80">
                <MessageCircle className="w-3 h-3" />
                Minhas mentorias
              </div>
              <div className="flex flex-wrap gap-2">
                {myMentorships.slice(0, 8).map((m) => (
                  <Link
                    key={m.id}
                    href={`/mentorship/${m.id}`}
                    data-testid={`my-mentorship-${m.id}`}
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        'cursor-pointer hover:bg-slate-800/50',
                        m.status === 'PENDING' &&
                          'border-amber-500/40 text-amber-300',
                        m.status === 'ACTIVE' &&
                          'border-emerald-500/40 text-emerald-300',
                        m.status === 'COMPLETED' &&
                          'border-slate-700 text-slate-400'
                      )}
                    >
                      {m.status === 'PENDING' && '⏳ '}
                      {m.status === 'ACTIVE' && '✓ '}
                      {m.status === 'COMPLETED' && '✓ '}
                      {m.tradition} · {m.mentorId === user?.id ? m.menteeName : m.mentorName}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
          <CardContent className="pt-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nome, bio ou tradição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="mentorship-search-input"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 placeholder-slate-500 outline-none"
                aria-label="Buscar mentores"
              />
            </div>

            {/* Tradition chips */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
                <Hash className="w-3 h-3" aria-hidden />
                <span>Tradição</span>
              </div>
              <SingleChipGroup
                options={TRADITION_CHIPS}
                value={tradition}
                onChange={(v) => setTradition(v)}
                label="Filtrar por tradição"
                testIdPrefix="tradition-chip"
              />
            </div>

            {/* Language chips (multi) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
                <Sparkles className="w-3 h-3" aria-hidden />
                <span>Idioma</span>
              </div>
              <MultiChipGroup
                options={LANGUAGE_CHIPS}
                values={languages}
                onToggle={toggleLanguage}
                onClear={() => setLanguages([])}
                label="Filtrar por idioma"
                testIdPrefix="language-chip"
              />
            </div>

            {/* Topic chips (multi) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
                <Sparkles className="w-3 h-3" aria-hidden />
                <span>Tópicos</span>
              </div>
              <MultiChipGroup
                options={TOPIC_CHIPS}
                values={topics}
                onToggle={toggleTopic}
                onClear={() => setTopics([])}
                label="Filtrar por tópicos"
                testIdPrefix="topic-chip"
              />
            </div>

            {/* Secondary row: dropdown backup + selectedTradition + clear */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/50">
              <label className="flex items-center gap-1.5 text-xs text-slate-400">
                <Hash className="w-3 h-3" aria-hidden />
                <span>Filtro API:</span>
                <select
                  value={tradition}
                  onChange={(e) => setTradition(e.target.value as TraditionSlug | '')}
                  data-testid="mentorship-tradition-filter"
                  className="bg-slate-800/40 border border-slate-700/40 rounded-md px-2 py-1 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                  aria-label="Filtro de tradição via API"
                >
                  {TRADITION_FILTERS.map((opt) => (
                    <option key={opt.value || 'all'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-400">
                <Sparkles className="w-3 h-3" aria-hidden />
                <span>Vou pedir mentoria de:</span>
                <select
                  value={selectedTradition}
                  onChange={(e) => setSelectedTradition(e.target.value)}
                  data-testid="mentorship-request-tradition"
                  className="bg-slate-800/40 border border-slate-700/40 rounded-md px-2 py-1 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  {TRADITION_FILTERS.filter((t) => t.value !== '').map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              {(tradition || search || languages.length > 0 || topics.length > 0) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setTradition('');
                    setSearch('');
                    setLanguages([]);
                    setTopics([]);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200"
                  data-testid="mentorship-clear-filters"
                >
                  <X className="w-3 h-3 mr-1" aria-hidden /> Limpar tudo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && mentors.length === 0 && (
          <div
            className="flex justify-center py-12"
            data-testid="mentorship-loading"
          >
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && mentors.length === 0 && (
          <Card className="card-spiritual bg-red-500/10 border-red-500/30">
            <CardContent className="py-6 text-center space-y-2">
              <p className="text-sm text-red-300">
                Não foi possível carregar os mentores: {error}
              </p>
              <Button size="sm" variant="outline" onClick={refresh}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
            <CardContent className="py-12 text-center space-y-2">
              <GraduationCap className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-sm text-slate-300">
                Nenhum mentor disponível {tradition && `para "${tradition}"`}.
              </p>
              <p className="text-xs text-slate-500">
                Tente outra tradição ou volte mais tarde.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Grid */}
        {filtered.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-testid="mentorship-grid"
          >
            {filtered.map((m) => {
              const existing = existingByMentor.get(m.id);
              const isRequesting = requestingMentorId === m.id;
              return (
                <MentorCard
                  key={m.id}
                  mentor={m}
                  existing={existing}
                  isRequesting={isRequesting || requesting}
                  canRequest={!!user && m.isAvailable && !!selectedTradition}
                  onRequest={() => handleRequest(m)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
