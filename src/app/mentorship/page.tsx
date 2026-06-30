'use client';

// ============================================================================
// W87-B — /mentorship · Página mobile-first de pareamento 1-on-1
// ----------------------------------------------------------------------------
// Mostra mentores disponíveis, com filtros por tradição/área/nível. Card
// por mentor abre um modal de pairing (com LGPD consent REQUIRED).
//
// Decisões:
//   - 'use client' — state de filtros e modal é client-side
//   - ARIA: aria-live="polite" em filter changes, role="dialog" no modal,
//     data-testid estável em todas as superfícies
//   - LGPD consent é REQUIRED no submit (disabled até marcar)
//   - Sem dependência de API — usa o engine in-memory embarcado
// ============================================================================

import React, { useMemo, useState } from 'react';

import {
  TRADIÇÃO_LABEL,
  TRADIÇÃO_SYMBOL,
  TRADIÇÕES,
  STUDY_AREA_LABEL,
  STUDY_AREAS,
  LEVEL_LABEL,
  LEVEL_ORDER,
  LGPD_VERSION,
  MESSAGE_MAX_LEN,
  MESSAGE_MIN_LEN,
  InMemoryMentorshipAdapter,
  createMentorshipEngine,
  computePairingScore,
  applyMentorFilter,
  menteeId,
  type MentorProfile,
  type MenteeProfile,
  type Tradição,
  type StudyArea,
  type ExperienceLevel,
  type PairingScore,
} from '@/engine/mentorship';

// ============================================================
// Sample state — em produção viria de API/Supabase
// ============================================================

const ADAPTER = new InMemoryMentorshipAdapter();
const ENGINE = createMentorshipEngine(ADAPTER);

// Para a demo usamos sempre a Lúcia como "me" (mock auth).
const SELF_MENTEE: MenteeProfile = {
  id: menteeId('mentee-br-iniciante'),
  displayName: 'Lúcia Mendes',
  handle: 'lucia-mendes',
  tradiçãoEscolhida: 'cigano',
  interests: ['taro-cigano', 'meditacao'],
  level: 'iniciante',
  languages: ['pt-BR'],
  timezone: 'America/Sao_Paulo',
};

// ============================================================
// Page component
// ============================================================

export default function MentorshipPage(): React.JSX.Element {
  // Filter state
  const [tradiçãoFilter, setTradiçãoFilter] = useState<Tradição | null>(null);
  const [studyFilter, setStudyFilter] = useState<StudyArea | null>(null);
  const [levelFilter, setLevelFilter] = useState<ExperienceLevel | null>(null);

  // Data (snapshot estático — em produção seria useSWR / useEffect)
  const mentorsArray = useMemo<ReadonlyArray<MentorProfile>>(
    () => Array.from((ADAPTER['mentors'] as unknown as Map<string, MentorProfile>).values()),
    [],
  );

  // Pairings score (sempre calcula contra o SELF_MENTEE — em produção,
  // usaria o mentor logado como contexto)
  const pairings = useMemo<ReadonlyArray<PairingScore>>(() => {
    return mentorsArray
      .filter((m) => m.acceptMentees)
      .map((m) => computePairingScore(m, SELF_MENTEE))
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return a.mentorId.localeCompare(b.mentorId);
      });
  }, [mentorsArray]);

  // Aplica filtros UI-side (compose pattern do W86-B)
  const filteredMentors = useMemo<ReadonlyArray<MentorProfile>>(() => {
    return applyMentorFilter(mentorsArray, {
      ...(tradiçãoFilter ? { tradição: tradiçãoFilter } : {}),
      ...(studyFilter ? { studyArea: studyFilter } : {}),
      ...(levelFilter ? { level: levelFilter } : {}),
      onlyAccepting: true,
    });
  }, [mentorsArray, tradiçãoFilter, studyFilter, levelFilter]);

  // Modal state
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [lgpdConsent, setLgpdConsent] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const selectedMentor = useMemo<MentorProfile | null>(() => {
    if (!selectedMentorId) return null;
    return mentorsArray.find((m) => m.id === selectedMentorId) ?? null;
  }, [selectedMentorId, mentorsArray]);

  const pairingForSelected = useMemo<PairingScore | null>(() => {
    if (!selectedMentor) return null;
    return pairings.find((p) => p.mentorId === selectedMentor.id) ?? null;
  }, [selectedMentor, pairings]);

  function openPairingModal(mentor: MentorProfile): void {
    setSelectedMentorId(mentor.id);
    setModalMessage('');
    setLgpdConsent(false);
    setSubmitFeedback(null);
  }

  function closePairingModal(): void {
    setSelectedMentorId(null);
    setModalMessage('');
    setLgpdConsent(false);
    setSubmitFeedback(null);
  }

  async function submitPairingRequest(): Promise<void> {
    if (!selectedMentor) return;
    if (!lgpdConsent) {
      setSubmitFeedback({ kind: 'error', message: 'É necessário aceitar o termo LGPD.' });
      return;
    }
    if (modalMessage.trim().length < MESSAGE_MIN_LEN) {
      setSubmitFeedback({
        kind: 'error',
        message: `A mensagem deve ter ao menos ${MESSAGE_MIN_LEN} caracteres.`,
      });
      return;
    }
    const result = await ENGINE.createPairingRequest({
      menteeId: SELF_MENTEE.id,
      mentorId: selectedMentor.id,
      message: modalMessage,
      lgpdConsent,
    });
    if (result.kind === 'success') {
      setSubmitFeedback({ kind: 'success', message: 'Solicitação enviada! O mentor responderá em breve.' });
    } else {
      setSubmitFeedback({ kind: 'error', message: result.message });
    }
  }

  const canSubmit = lgpdConsent && modalMessage.trim().length >= MESSAGE_MIN_LEN;

  return (
    <main
      id="main-content"
      className="mentorship-page mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8"
      data-testid="mentorship-page"
    >
      {/* Header */}
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          ✦ Mentoria 1-on-1
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Conexão Akáshica — encontre seu mentor entre praticantes das 7 tradições.
        </p>
      </header>

      {/* Filtros */}
      <section
        aria-label="Filtros de mentores"
        aria-live="polite"
        className="mb-6 flex flex-col gap-4"
        data-testid="mentorship-filters"
      >
        {/* Tradição */}
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Tradição
          </h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtro por tradição">
            <FilterChip
              active={tradiçãoFilter === null}
              onClick={() => setTradiçãoFilter(null)}
              testId="filter-chip-tradição-all"
            >
              ✺ Todas
            </FilterChip>
            {TRADIÇÕES.map((t) => (
              <FilterChip
                key={t}
                active={tradiçãoFilter === t}
                onClick={() => setTradiçãoFilter(t === tradiçãoFilter ? null : t)}
                testId={`filter-chip-tradição-${t}`}
              >
                {TRADIÇÃO_SYMBOL[t]} {TRADIÇÃO_LABEL[t]}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Study Area */}
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Área de estudo
          </h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtro por área de estudo">
            <FilterChip
              active={studyFilter === null}
              onClick={() => setStudyFilter(null)}
              testId="filter-chip-study-all"
              size="sm"
            >
              Todas
            </FilterChip>
            {STUDY_AREAS.map((s) => (
              <FilterChip
                key={s}
                active={studyFilter === s}
                onClick={() => setStudyFilter(s === studyFilter ? null : s)}
                testId={`filter-chip-study-${s}`}
                size="sm"
              >
                {STUDY_AREA_LABEL[s]}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Level */}
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Nível
          </h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtro por nível">
            <FilterChip
              active={levelFilter === null}
              onClick={() => setLevelFilter(null)}
              testId="filter-chip-level-all"
              size="sm"
            >
              Todos
            </FilterChip>
            {(Object.keys(LEVEL_ORDER) as ExperienceLevel[])
              .sort((a, b) => LEVEL_ORDER[a] - LEVEL_ORDER[b])
              .map((l) => (
                <FilterChip
                  key={l}
                  active={levelFilter === l}
                  onClick={() => setLevelFilter(l === levelFilter ? null : l)}
                  testId={`filter-chip-level-${l}`}
                  size="sm"
                >
                  {LEVEL_LABEL[l]}
                </FilterChip>
              ))}
          </div>
        </div>
      </section>

      {/* Contagem + Mentor cards */}
      <section
        aria-label={`${filteredMentors.length} mentores disponíveis`}
        aria-live="polite"
        data-testid="mentorship-list"
        className="flex flex-col gap-3"
      >
        <p className="text-sm text-muted-foreground">
          {filteredMentors.length} {filteredMentors.length === 1 ? 'mentor disponível' : 'mentores disponíveis'}
        </p>

        {filteredMentors.length === 0 && (
          <div
            data-testid="mentorship-empty"
            className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-center text-sm text-muted-foreground"
          >
            Nenhum mentor corresponde aos filtros. Tente uma combinação diferente.
          </div>
        )}

        {filteredMentors.map((mentor) => {
          const pairing = pairings.find((p) => p.mentorId === mentor.id);
          return (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              pairing={pairing ?? null}
              onRequest={() => openPairingModal(mentor)}
            />
          );
        })}
      </section>

      {/* Pairing modal */}
      {selectedMentor && (
        <PairingModal
          mentor={selectedMentor}
          pairing={pairingForSelected}
          message={modalMessage}
          lgpdConsent={lgpdConsent}
          feedback={submitFeedback}
          canSubmit={canSubmit}
          onMessageChange={setModalMessage}
          onConsentChange={setLgpdConsent}
          onSubmit={submitPairingRequest}
          onClose={closePairingModal}
        />
      )}
    </main>
  );
}

// ============================================================
// Filter chip
// ============================================================

interface FilterChipProps {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly testId: string;
  readonly children: React.ReactNode;
  readonly size?: 'sm' | 'md';
}

function FilterChip({ active, onClick, testId, children, size = 'md' }: FilterChipProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={active}
      data-testid={testId}
      className={[
        'inline-flex items-center gap-1 rounded-full border px-3 transition-colors',
        size === 'sm' ? 'py-1 text-xs' : 'py-1.5 text-sm',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:bg-muted',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ============================================================
// Mentor card
// ============================================================

interface MentorCardProps {
  readonly mentor: MentorProfile;
  readonly pairing: PairingScore | null;
  readonly onRequest: () => void;
}

function MentorCard({ mentor, pairing, onRequest }: MentorCardProps): React.JSX.Element {
  return (
    <article
      data-testid="mentor-card"
      data-mentor-id={mentor.id}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        {/* Avatar placeholder */}
        <div
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-amber-500/30 text-2xl"
        >
          {TRADIÇÃO_SYMBOL[mentor.tradição]}
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold" data-testid="mentor-name">
            {mentor.displayName}
          </h3>
          <p className="text-xs text-muted-foreground" data-testid="mentor-tradição">
            {TRADIÇÃO_SYMBOL[mentor.tradição]} {TRADIÇÃO_LABEL[mentor.tradição]} · {LEVEL_LABEL[mentor.level]}
          </p>
        </div>

        {pairing && (
          <div
            data-testid="mentor-score"
            className={[
              'flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg text-xs font-bold',
              pairing.isPlausible
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-muted text-muted-foreground',
            ].join(' ')}
            aria-label={`Score de compatibilidade: ${pairing.score} de 100`}
          >
            <span className="text-base">{pairing.score}</span>
            <span className="text-[10px]">/ 100</span>
          </div>
        )}
      </div>

      <p className="text-sm text-foreground/90" data-testid="mentor-bio">
        {mentor.bio}
      </p>

      {/* Study areas */}
      <div className="flex flex-wrap gap-1.5" data-testid="mentor-study-areas">
        {mentor.studyAreas.map((s) => (
          <span
            key={s}
            className="rounded-md bg-muted px-2 py-0.5 text-xs"
          >
            {STUDY_AREA_LABEL[s]}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span data-testid="mentor-languages">
          🌐 {mentor.languages.join(' · ')}
        </span>
        <span data-testid="mentor-timezone">
          🕐 {mentor.timezone}
        </span>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={onRequest}
        disabled={!mentor.acceptMentees}
        data-testid="mentor-request-btn"
        className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mentor.acceptMentees ? 'Solicitar mentoria' : 'Pausado'}
      </button>
    </article>
  );
}

// ============================================================
// Pairing modal
// ============================================================

interface PairingModalProps {
  readonly mentor: MentorProfile;
  readonly pairing: PairingScore | null;
  readonly message: string;
  readonly lgpdConsent: boolean;
  readonly feedback: { kind: 'success' | 'error'; message: string } | null;
  readonly canSubmit: boolean;
  readonly onMessageChange: (value: string) => void;
  readonly onConsentChange: (value: boolean) => void;
  readonly onSubmit: () => void;
  readonly onClose: () => void;
}

function PairingModal({
  mentor,
  pairing,
  message,
  lgpdConsent,
  feedback,
  canSubmit,
  onMessageChange,
  onConsentChange,
  onSubmit,
  onClose,
}: PairingModalProps): React.JSX.Element {
  const messageLen = message.trim().length;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pairing-modal-title"
      aria-describedby="pairing-modal-desc"
      data-testid="pairing-modal"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-t-2xl bg-background p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="pairing-modal-title" className="text-lg font-bold">
              Solicitar mentoria
            </h2>
            <p id="pairing-modal-desc" className="text-sm text-muted-foreground">
              Com {mentor.displayName} ({TRADIÇÃO_SYMBOL[mentor.tradição]} {TRADIÇÃO_LABEL[mentor.tradição]})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            data-testid="pairing-modal-close"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          >
            ✕
          </button>
        </div>

        {/* Score preview */}
        {pairing && (
          <div
            className="rounded-lg border border-border bg-muted/30 p-3"
            data-testid="pairing-modal-score"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Score de compatibilidade
            </p>
            <p className="mt-1 text-2xl font-bold">{pairing.score} <span className="text-sm font-normal text-muted-foreground">/ 100</span></p>
            <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
              {pairing.reason.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Message textarea */}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            Mensagem inicial
            <span className="ml-1 text-xs text-muted-foreground">
              ({messageLen}/{MESSAGE_MAX_LEN})
            </span>
          </span>
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value.slice(0, MESSAGE_MAX_LEN))}
            rows={5}
            placeholder="Conte ao mentor por que você quer essa mentoria e onde gostaria de chegar..."
            data-testid="pairing-message"
            aria-label="Mensagem inicial"
            aria-describedby="pairing-message-help"
            className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span id="pairing-message-help" className="text-xs text-muted-foreground">
            Mínimo {MESSAGE_MIN_LEN} caracteres. Seja claro sobre seu momento espiritual.
          </span>
        </label>

        {/* LGPD consent */}
        <label className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <input
            type="checkbox"
            checked={lgpdConsent}
            onChange={(e) => onConsentChange(e.target.checked)}
            data-testid="lgpd-consent"
            aria-required="true"
            aria-label={`Aceitar termo de consentimento LGPD versão ${LGPD_VERSION}`}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-border accent-primary"
          />
          <span className="text-xs text-foreground/90">
            Eu li e aceito o termo de consentimento LGPD (versão {LGPD_VERSION}) — meus dados serão usados apenas para esta solicitação de mentoria, conforme nossa{' '}
            <a className="underline" href="/privacy">
              Política de Privacidade
            </a>.
          </span>
        </label>

        {/* Feedback */}
        {feedback && (
          <p
            role={feedback.kind === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            data-testid={`pairing-modal-${feedback.kind}`}
            className={[
              'rounded-lg border p-3 text-sm',
              feedback.kind === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-destructive/40 bg-destructive/10 text-destructive',
            ].join(' ')}
          >
            {feedback.message}
          </p>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          data-testid="pairing-modal-submit"
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Enviar solicitação
        </button>
      </div>
    </div>
  );
}
