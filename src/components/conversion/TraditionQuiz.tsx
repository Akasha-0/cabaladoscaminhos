'use client';

// ============================================================================
// TraditionQuiz — Interactive quiz para Variante D (Wave 20)
// ============================================================================
// Quiz de 4 perguntas + resultado personalizado. Engaja o usuário,
// segmenta leads (sabemos intenção + tradição preferida), e aumenta
// conversion por personalização.
//
// Métricas: quiz_completed, quiz_intent, quiz_tradition.
// ============================================================================

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, Check, Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/events-catalog';
import { funnelEvents } from '@/lib/analytics/funnel';

interface Props {
  utmSource?: string;
  referralCode?: string;
}

type Step = 1 | 2 | 3 | 4 | 5; // 5 = resultado

interface QuizState {
  intention?: 'autoconhecimento' | 'pratica' | 'estudo' | 'comunidade';
  tradition?: 'cabala' | 'ifa' | 'tantra' | 'xamanismo' | 'cristianismo-mistico' | 'sufismo' | 'ainda-nao-sei';
  level?: 'iniciante' | 'intermediario' | 'avancado';
  referral?: 'amigo' | 'rede-social' | 'busca' | 'evento' | 'outro';
}

const QUESTIONS = [
  {
    step: 1 as const,
    field: 'intention' as const,
    title: 'O que te trouxe até aqui?',
    subtitle: 'Vamos entender sua intenção principal',
    options: [
      { value: 'autoconhecimento', label: 'Autoconhecimento', emoji: '🪞' },
      { value: 'pratica', label: 'Prática espiritual diária', emoji: '🧘' },
      { value: 'estudo', label: 'Estudo e aprofundamento', emoji: '📚' },
      { value: 'comunidade', label: 'Comunidade e troca', emoji: '🤝' },
    ],
  },
  {
    step: 2 as const,
    field: 'tradition' as const,
    title: 'Qual tradição te chama mais atenção?',
    subtitle: 'Sem compromisso — você pode explorar várias',
    options: [
      { value: 'cabala', label: 'Cabala', emoji: '✡️' },
      { value: 'ifa', label: 'Ifá / Candomblé', emoji: '🌿' },
      { value: 'tantra', label: 'Tantra', emoji: '🕉️' },
      { value: 'xamanismo', label: 'Xamanismo', emoji: '🦅' },
      { value: 'cristianismo-mistico', label: 'Cristianismo Místico', emoji: '✝️' },
      { value: 'sufismo', label: 'Sufismo', emoji: '☪️' },
      { value: 'ainda-nao-sei', label: 'Ainda não sei', emoji: '✨' },
    ],
  },
  {
    step: 3 as const,
    field: 'level' as const,
    title: 'Qual seu nível de experiência?',
    subtitle: 'Vamos calibrar o conteúdo pra você',
    options: [
      { value: 'iniciante', label: 'Iniciante', description: 'Começando agora' },
      { value: 'intermediario', label: 'Intermediário', description: 'Já pratico há 1-3 anos' },
      { value: 'avancado', label: 'Avançado', description: 'Mais de 3 anos de prática' },
    ],
  },
  {
    step: 4 as const,
    field: 'referral' as const,
    title: 'Como você chegou até nós?',
    subtitle: 'Sua resposta nos ajuda a melhorar',
    options: [
      { value: 'amigo', label: 'Indicação de amigo' },
      { value: 'rede-social', label: 'Rede social' },
      { value: 'busca', label: 'Busca no Google' },
      { value: 'evento', label: 'Evento espiritual' },
      { value: 'outro', label: 'Outro' },
    ],
  },
];

const RECOMMENDATIONS: Record<string, { tradition: string; reason: string }> = {
  autoconhecimento_cabala: {
    tradition: 'Cabala',
    reason: 'Árvore da Vida + meditação nos nomes divinos trabalha diretamente auto-conhecimento profundo.',
  },
  autoconhecimento_ifa: {
    tradition: 'Ifá',
    reason: 'Os Odus são um sistema de mapa interior — cada Odu ilumina uma camada do ser.',
  },
  autoconhecimento_tantra: {
    tradition: 'Tantra',
    reason: 'Tantra vê o corpo como templo — caminho direto pra reconectar com seu interior.',
  },
  pratica_cabala: {
    tradition: 'Cabala',
    reason: 'Práticas diárias de meditação Kabbalística (kavanah) são estruturadas e cumulativas.',
  },
  pratica_ifa: {
    tradition: 'Ifá',
    reason: 'Ifá oferece rituais práticos e calendário sagrado pra ancorar sua rotina.',
  },
  estudo_cabala: {
    tradition: 'Cabala',
    reason: 'Cabala tem 4000 anos de textualidade — perfeita pra quem gosta de aprofundamento.',
  },
  estudo_tantra: {
    tradition: 'Tantra',
    reason: 'Tantra tem textos raízes (Vijnana Bhairava) e linhagens com rigor filosófico.',
  },
  estudo_xamanismo: {
    tradition: 'Xamanismo',
    reason: 'Xamanismo tem tradição oral rica + estudos antropológicos contemporâneos.',
  },
  comunidade_tantra: {
    tradition: 'Tantra',
    reason: 'Tantra tem forte cultura de sangha (comunidade) e práticas em grupo.',
  },
};

function getRecommendation(state: QuizState): { tradition: string; reason: string } {
  const key = `${state.intention}_${state.tradition}`;
  if (RECOMMENDATIONS[key]) return RECOMMENDATIONS[key];
  // Fallback genérico
  const traditionMap: Record<string, string> = {
    cabala: 'Cabala',
    ifa: 'Ifá',
    tantra: 'Tantra',
    xamanismo: 'Xamanismo',
    'cristianismo-mistico': 'Cristianismo Místico',
    sufismo: 'Sufismo',
  };
  const trad = state.tradition && state.tradition !== 'ainda-nao-sei' ? traditionMap[state.tradition] : null;
  return {
    tradition: trad ?? 'Multi-tradição',
    reason: 'Recomendamos começar com uma trilha multi-tradição para identificar o que ressoa em você.',
  };
}

export function TraditionQuiz({ utmSource, referralCode }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<QuizState>({});
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentQ = QUESTIONS.find((q) => q.step === step);

  const handleSelect = (value: string) => {
    if (!currentQ) return;
    setState((prev) => ({ ...prev, [currentQ.field]: value }));
    // Auto-advance after short delay
    setTimeout(() => setStep((s) => (s + 1) as Step), 250);
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1) as Step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const rec = getRecommendation(state);
      // Submit to waitlist + quiz answers
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: `quiz-D-${utmSource ?? 'direct'}`,
          quiz: state,
          recommended: rec.tradition,
          referral: referralCode,
        }),
      });
      if (res.ok) {
        setCompleted(true);
        trackEvent('page_viewed', {
          path: '/quiz-completed',
          query: { variant: 'D', ...state },
        });
        funnelEvents.ctaClick({ variant: 'D', ctaId: 'quiz-submit' });
      }
    } catch {
      /* silent */
    } finally {
      setSubmitting(false);
    }
  };

  // Result screen
  if (step === 5) {
    const rec = getRecommendation(state);

    if (completed) {
      return (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-amber-500/10 to-violet-500/10 border border-emerald-500/30 p-6 md:p-8 text-center">
          <Check className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h2 className="text-2xl font-cinzel text-emerald-300 mb-2">
            Tudo certo!
          </h2>
          <p className="text-slate-300 text-sm">
            Sua vaga está garantida e a recomendação personalizada está a caminho
            do seu email.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl bg-slate-900/60 border border-amber-500/30 p-6 md:p-8 backdrop-blur-sm">
        <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
        <p className="text-xs uppercase tracking-widest text-amber-300/80 text-center mb-2">
          Sua recomendação
        </p>
        <h2 className="text-2xl md:text-3xl font-cinzel text-center bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent mb-3">
          {rec.tradition}
        </h2>
        <p className="text-slate-300 text-sm text-center mb-6 max-w-md mx-auto leading-relaxed">
          {rec.reason}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-xs text-slate-400 text-center">
            Garanta sua vaga no beta para começar sua trilha:
          </p>
          <input
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full h-12 px-4 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-semibold text-sm hover:from-amber-400 hover:to-amber-300 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                Quero começar minha trilha
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-3 text-xs text-slate-500 text-center">
          Sem spam. Você pode ajustar suas tradições quando quiser.
        </p>
      </div>
    );
  }

  // Quiz screen
  if (!currentQ) return null;
  const progress = ((step - 1) / QUESTIONS.length) * 100;

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-5 md:p-8 backdrop-blur-sm text-left">
      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-500">
            Pergunta {step} de {QUESTIONS.length}
          </span>
          <span className="text-xs text-amber-300 font-semibold">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-violet-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-cinzel text-slate-100 mb-1">
        {currentQ.title}
      </h2>
      <p className="text-sm text-slate-400 mb-5">{currentQ.subtitle}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {currentQ.options.map((opt) => {
          const selected = state[currentQ.field] === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`text-left p-3.5 rounded-lg border transition ${
                selected
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                  : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {'emoji' in opt && opt.emoji && (
                  <span className="text-xl" aria-hidden>
                    {opt.emoji}
                  </span>
                )}
                <span className="text-sm font-medium">{opt.label}</span>
                {selected && <Check className="w-4 h-4 ml-auto text-amber-400" />}
              </div>
              {'description' in opt && opt.description && (
                <p className="text-xs text-slate-500 mt-1 ml-7">{opt.description}</p>
              )}
            </button>
          );
        })}
      </div>

      {step > 1 && (
        <button
          type="button"
          onClick={handleBack}
          className="mt-4 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300"
        >
          <ArrowLeft className="w-3 h-3" />
          Voltar
        </button>
      )}
    </div>
  );
}
