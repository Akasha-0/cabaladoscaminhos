'use client';

// ============================================================================
// WeeklySurvey — micro-survey semanal (Wave 33)
// ============================================================================
// 3-5 perguntas rotativas (definidas por código), multi-step progress,
// skip por pergunta. Persistência via /api/feedback (PATCH shape) ou
// endpoint dedicado /api/survey — esta implementação envia cada resposta
// como FeedbackSubmission com type=SURVEY para reutilizar auditoria.
//
// ROtação semanal é feita por hash do ISO week + userId (seed determinístico).
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

type QuestionKind = 'rating' | 'select' | 'multitext' | 'boolean';
interface Question {
  id: string;
  text: string;
  kind: QuestionKind;
  options?: string[];
  helper?: string;
}

const QUESTION_BANK: Question[] = [
  {
    id: 'satisfaction',
    text: 'De 0 a 10, quão satisfeito você está com a Cabala nesta semana?',
    kind: 'rating',
    helper: '0 = insatisfeito · 10 = totalmente satisfeito',
  },
  {
    id: 'feature_use',
    text: 'Qual funcionalidade você mais usou nesta semana?',
    kind: 'select',
    options: ['Posts', 'Grupos', 'Eventos', 'Diretório', 'Cursos', 'Akasha (IA)', 'Nenhuma'],
  },
  {
    id: 'blocker',
    text: 'Algo te impediu de aproveitar mais a plataforma? (opcional)',
    kind: 'multitext',
  },
  {
    id: 'referral',
    text: 'Você indicaria a plataforma para um amigo agora?',
    kind: 'boolean',
  },
  {
    id: 'theme_preference',
    text: 'Qual tema você gostaria de ver mais conteúdo?',
    kind: 'select',
    options: ['Cabala', 'Ifá', 'Tantra', 'Umbanda', 'Xamanismo', 'Astrologia', 'Meditação'],
  },
];

function pickQuestions(seed: number, count = 4): Question[] {
  // Shuffle simples e pega N — não precisa ser cripto-seguro
  const shuffled = [...QUESTION_BANK];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor((Math.sin(seed + i) * 10000) % 1 * (i + 1));
    if (j < 0 || j > i) continue;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function isoWeek(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function WeeklySurvey() {
  const { data: session, status } = useSession();
  const week = useMemo(() => isoWeek(), []);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped] = useState(false);

  // Seed por userId+weekISO para rotação estável durante a semana
  const seed = useMemo(() => {
    const id = session?.user?.id ?? 'anon';
    let h = 0;
    for (const ch of `${id}-${week}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h;
  }, [session?.user?.id, week]);

  const questions = useMemo(() => pickQuestions(seed, 4), [seed]);

  // Auto-dismiss se tudo já respondido nesta semana (lê localStorage)
  useEffect(() => {
    const key = `weekly_survey:${week}`;
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(key) === 'done') {
      setSkipped(true);
      setSubmitted(true);
    }
  }, [week]);

  if (status === 'unauthenticated' || skipped) return null;

  async function persist() {
    const key = `weekly_survey:${week}`;
    try {
      localStorage.setItem(key, 'done');
    } catch {
      // ignore
    }
    setSkipped(true);
    setSubmitted(true);
    // Best-effort: enviar respostas como FeedbackSubmission ÚNICO agregado
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'OTHER',
          category: 'weekly_survey',
          message: `Survey ${week} respondida (${Object.keys(answers).length}/${questions.length} perguntas)`,
          metadata: { week, questions: questions.map((q) => q.id), answers, source: 'weekly_survey' },
        }),
      });
    } catch {
      // Silent
    }
  }

  function commitAnswer(value: unknown) {
    const q = questions[step];
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  }

  function next() {
    if (step + 1 >= questions.length) {
      void persist();
    } else {
      setStep((s) => s + 1);
    }
  }

  function skip() {
    const q = questions[step];
    setAnswers((prev) => ({ ...prev, [q.id]: null }));
    next();
  }

  if (submitted) return null;

  const q = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  return (
    <aside
      role="complementary"
      aria-labelledby="weekly-survey-title"
      className="rounded-xl border border-spiritual-gold/30 bg-spiritual-gold/5 p-5"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-spiritual-gold/80">
        Survey semanal
      </p>
      <h2 id="weekly-survey-title" className="mt-1 font-serif text-lg font-semibold">
        30 segundos? {week}
      </h2>

      <div
        className="mt-3 h-1 w-full overflow-hidden rounded-full bg-spiritual-gold/20"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-spiritual-gold transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Pergunta {step + 1} de {questions.length}
      </p>

      <div className="mt-4">
        <p className="text-sm font-semibold">{q.text}</p>
        {q.helper && <p className="mt-1 text-xs text-muted-foreground">{q.helper}</p>}

        <div className="mt-3">
          {q.kind === 'rating' && (
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 11 }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => commitAnswer(n)}
                  className={`h-11 w-11 rounded-md border text-sm ${
                    answers[q.id] === n
                      ? 'border-spiritual-gold bg-spiritual-gold text-background'
                      : 'border-border hover:bg-muted'
                  }`}
                  aria-pressed={answers[q.id] === n}
                  aria-label={`Nota ${n}`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
          {q.kind === 'select' && (
            <div className="flex flex-wrap gap-2">
              {q.options?.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => commitAnswer(opt)}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    answers[q.id] === opt
                      ? 'border-spiritual-gold bg-spiritual-gold text-background'
                      : 'border-border hover:bg-muted'
                  }`}
                  aria-pressed={answers[q.id] === opt}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {q.kind === 'boolean' && (
            <div className="flex gap-2">
              {['Sim', 'Não'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => commitAnswer(b)}
                  className={`flex-1 rounded-md border px-4 py-3 text-sm font-medium ${
                    answers[q.id] === b
                      ? 'border-spiritual-gold bg-spiritual-gold text-background'
                      : 'border-border hover:bg-muted'
                  }`}
                  aria-pressed={answers[q.id] === b}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
          {q.kind === 'multitext' && (
            <textarea
              rows={3}
              placeholder="Compartilhe…"
              defaultValue={(answers[q.id] as string) ?? ''}
              onBlur={(e) => commitAnswer(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-spiritual-gold focus:outline-none"
              maxLength={1000}
            />
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-between">
        <button
          type="button"
          onClick={skip}
          className="rounded-md border border-border px-3 py-2 text-xs hover:bg-muted focus:outline-none focus:ring-2 focus:ring-spiritual-gold/30"
        >
          Pular pergunta
        </button>
        <button
          type="button"
          onClick={next}
          disabled={answers[q.id] === undefined}
          className="rounded-md bg-spiritual-gold px-5 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/40"
        >
          {step + 1 === questions.length ? 'Concluir' : 'Próxima →'}
        </button>
      </div>
    </aside>
  );
}
