'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { geocodeCity } from '@/lib/infrastructure/geocoding/nominatim';

type FormData = {
  name: string;
  email: string;
  password: string;
  intention: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthState: string;
  birthLatitude: number;
  birthLongitude: number;
  birthTimezone: string;
  quiz1: string;
  quiz2: string;
  consent: boolean;
};

const INITIAL: FormData = {
  name: '',
  email: '',
  password: '',
  intention: '',
  birthDate: '',
  birthTime: '',
  birthCity: '',
  birthState: '',
  birthLatitude: 0,
  birthLongitude: 0,
  birthTimezone: '',
  quiz1: '',
  quiz2: '',
  consent: false,
};

const STEPS = ['Coleta', 'Nascimento', 'Local', 'Ancoragem', 'Revelando...'];

const RITUAL_PHRASES = [
  'Calculando trânsitos astrológicos…',
  'Acessando o Caminho de Vida…',
  'Sintetizando os 11 Corpos Tântricos…',
  'Ancorando as forças dos Odus…',
  'Traçando a geometria sagrada…',
  'Abrindo o Campo Akáshico…',
];

const QUIZ1_OPTIONS = [
  { value: 'proposito', label: 'Propósito', desc: 'Encontrar minha missão de vida' },
  { value: 'cura', label: 'Cura emocional', desc: 'Transmutar padrões e feridas' },
  { value: 'alinhamento', label: 'Alinhamento material', desc: 'Abundância e manifestação' },
  {
    value: 'despertar',
    label: 'Despertar ancestral',
    desc: 'Conectar com minhas raízes espirituais',
  },
];

const QUIZ2_OPTIONS = [
  { value: 'acelerada', label: 'Acelerada', desc: 'Muita energia, difícil de focar' },
  { value: 'dispersa', label: 'Dispersa', desc: 'Fora de eixo, sem clareza' },
  { value: 'estagnada', label: 'Estagnada', desc: 'Travada, esperando mover' },
  { value: 'fluxo', label: 'Em fluxo', desc: 'Alinhada e em movimento' },
];

const glassCard: React.CSSProperties = {
  background: 'rgba(20, 26, 51, 0.6)',
  border: '1px solid rgba(124, 92, 255, 0.2)',
  backdropFilter: 'blur(12px)',
  borderRadius: '16px',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(124, 92, 255, 0.25)',
  borderRadius: '8px',
  color: '#F4F5FF',
  outline: 'none',
  width: '100%',
  padding: '10px 14px',
  fontSize: '0.9375rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.8125rem',
  color: 'rgba(167,174,207,0.8)',
  letterSpacing: '0.04em',
};

interface OnboardingClientProps {
  locale: string;
  returnTo?: string;
}

export function OnboardingClient({ locale, returnTo }: OnboardingClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [error, setError] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [geocoding, setGeocoding] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // AD-T5-A: detectar timezone do browser uma vez no mount
  // (fallback quando birthCity não retorna timezone via Nominatim).
  useEffect(() => {
    if (form.birthTimezone) return;
    if (typeof Intl === 'undefined') return;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) set('birthTimezone', tz);
    } catch {
      /* ignore — manter '' até geocoding preencher */
    }
  }, []);

  // AD-T5-A: geocodificar birthCity no blur para preencher lat/long/timezone.
  async function handleCityBlur() {
    const city = form.birthCity.trim();
    if (city.length < 2) return;
    if (geocoding) return;
    setGeocoding(true);
    try {
      const result = await geocodeCity(city, { countryCodes: 'br' });
      if (!result) return;
      setForm((prev) => ({
        ...prev,
        birthLatitude: result.latitude,
        birthLongitude: result.longitude,
      }));
    } finally {
      setGeocoding(false);
    }
  }

  function next() {
    setError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  }

  async function startRevelation() {
    if (!form.consent) {
      setError('É necessário consentir com o processamento dos dados.');
      return;
    }
    setError('');
    setStep(4);
  }

  useEffect(() => {
    if (step !== 4) return;

    intervalRef.current = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % RITUAL_PHRASES.length);
    }, 1600);

    const intentionProfile = { quest: form.quiz1, energy: form.quiz2 };
    const registerPayload = {
      email: form.email,
      password: form.password,
      name: form.name,
      birthDate: form.birthDate,
      birthTime: form.birthTime,
      birthCity: form.birthCity,
      birthLatitude: form.birthLatitude,
      birthLongitude: form.birthLongitude,
      birthTimezone: form.birthTimezone,
      intentionProfile,
      // AD-T5-C: enviar consentimento explícito (LGPD)
      consent: form.consent,
    };

    (async () => {
      try {
        const reg = await fetch('/api/akasha/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerPayload),
        });
        if (!reg.ok) {
          const body = await reg.json().catch(() => ({}));
          const msg =
            body?.error ??
            body?.message ??
            (typeof body?.details?.formErrors?.[0] === 'string'
              ? body.details.formErrors[0]
              : null) ??
            'Erro ao criar conta.';
          throw new Error(msg);
        }

        const login = await fetch('/api/akasha/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        if (!login.ok) throw new Error('Conta criada! Faça login para continuar.');

        await fetch('/api/akasha/chart', { method: 'POST' });

        if (intervalRef.current) clearInterval(intervalRef.current);
        const destination = returnTo ?? `/${locale}/dashboard`;
        router.push(destination.startsWith('/') ? destination : `/${locale}/dashboard`);
      } catch (e: unknown) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setError(e instanceof Error ? e.message : 'Ocorreu um erro inesperado.');
        setStep(3);
      }
    })();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [step]);

  if (step === 4) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: '#06070F' }}
      >
        <div className="text-center max-w-sm">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(124,92,255,0.3) 0%, transparent 70%)',
              border: '1px solid rgba(124,92,255,0.4)',
              animation: 'spin 4s linear infinite',
            }}
          >
            <div
              className="w-10 h-10 rounded-full"
              style={{
                background: 'radial-gradient(circle, #9D86FF 0%, #7C5CFF 60%, transparent 100%)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          </div>
          <p
            className="text-lg font-medium mb-2"
            style={{ fontFamily: 'var(--font-cinzel), serif', color: '#F4F5FF' }}
          >
            {RITUAL_PHRASES[phraseIdx]}
          </p>
          <p style={{ color: 'rgba(167,174,207,0.6)', fontSize: '0.875rem' }}>
            Seu mapa está sendo traçado nos Registros Akáshicos…
          </p>
        </div>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100%{opacity:0.7;transform:scale(1);} 50%{opacity:1;transform:scale(1.15);} }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-12"
      style={{ background: '#06070F' }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: 'var(--font-cinzel), serif', color: '#F4F5FF' }}
          >
            Iniciar Jornada
          </h1>
          <p style={{ color: 'rgba(167,174,207,0.6)', fontSize: '0.875rem' }}>
            Passo {step + 1} de {STEPS.length - 1} — {STEPS[step]}
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          {STEPS.slice(0, -1).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? '#7C5CFF' : 'rgba(124,92,255,0.15)' }}
            />
          ))}
        </div>

        <div style={glassCard} className="p-6 mb-4">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>Como você é chamado neste plano?</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Senha (mínimo 8 caracteres)</label>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Por que você busca o Akasha?</label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                  placeholder="Uma frase sobre sua intenção…"
                  value={form.intention}
                  onChange={(e) => set('intention', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <p
                style={{ color: 'rgba(45,212,191,0.8)', fontSize: '0.8125rem', lineHeight: '1.5' }}
              >
                Em qual instante sua jornada neste plano começou?
              </p>
              <div>
                <label style={labelStyle}>Data de nascimento</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => set('birthDate', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Hora de nascimento</label>
                <input
                  style={inputStyle}
                  type="time"
                  value={form.birthTime}
                  onChange={(e) => set('birthTime', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <p
                style={{ color: 'rgba(45,212,191,0.8)', fontSize: '0.8125rem', lineHeight: '1.5' }}
              >
                Onde você aterrissou? Usaremos sua cidade para o mapa astrológico.
              </p>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="São Paulo"
                  value={form.birthCity}
                  onChange={(e) => set('birthCity', e.target.value)}
                  onBlur={handleCityBlur}
                />
                {geocoding && (
                  <p
                    style={{
                      color: 'rgba(167,174,207,0.5)',
                      fontSize: '0.75rem',
                      marginTop: '4px',
                    }}
                  >
                    Localizando coordenadas…
                  </p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="SP"
                  value={form.birthState}
                  onChange={(e) => set('birthState', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: '#F4F5FF', fontFamily: 'var(--font-cinzel), serif' }}
                >
                  O que te traz ao Akasha hoje?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUIZ1_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('quiz1', opt.value)}
                      className="text-left p-3 rounded-xl transition-all duration-200"
                      style={{
                        background:
                          form.quiz1 === opt.value
                            ? 'rgba(124,92,255,0.25)'
                            : 'rgba(255,255,255,0.03)',
                        border:
                          form.quiz1 === opt.value
                            ? '1px solid rgba(124,92,255,0.7)'
                            : '1px solid rgba(124,92,255,0.15)',
                      }}
                    >
                      <span
                        className="block text-xs font-semibold mb-0.5"
                        style={{ color: '#F4F5FF' }}
                      >
                        {opt.label}
                      </span>
                      <span
                        className="block text-xs leading-snug"
                        style={{ color: 'rgba(167,174,207,0.7)' }}
                      >
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: '#F4F5FF', fontFamily: 'var(--font-cinzel), serif' }}
                >
                  Como você sente sua energia neste ciclo?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUIZ2_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('quiz2', opt.value)}
                      className="text-left p-3 rounded-xl transition-all duration-200"
                      style={{
                        background:
                          form.quiz2 === opt.value
                            ? 'rgba(45,212,191,0.2)'
                            : 'rgba(255,255,255,0.03)',
                        border:
                          form.quiz2 === opt.value
                            ? '1px solid rgba(45,212,191,0.6)'
                            : '1px solid rgba(45,212,191,0.1)',
                      }}
                    >
                      <span
                        className="block text-xs font-semibold mb-0.5"
                        style={{ color: '#F4F5FF' }}
                      >
                        {opt.label}
                      </span>
                      <span
                        className="block text-xs leading-snug"
                        style={{ color: 'rgba(167,174,207,0.7)' }}
                      >
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => set('consent', e.target.checked)}
                  className="mt-0.5"
                  style={{ width: '16px', height: '16px', flexShrink: 0, accentColor: '#7C5CFF' }}
                />
                <span
                  className="text-xs leading-relaxed"
                  style={{ color: 'rgba(167,174,207,0.65)' }}
                >
                  Consinto com o processamento dos meus dados para geração do mapa natal.
                </span>
              </label>
            </div>
          )}
        </div>

        {error && (
          <p
            className="text-sm mb-4 px-4 py-3 rounded-lg"
            style={{
              background: 'rgba(251,87,129,0.1)',
              border: '1px solid rgba(251,87,129,0.3)',
              color: '#FB5781',
            }}
          >
            {error}
          </p>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="flex-1 py-3 rounded-xl text-sm transition-colors"
              style={{
                background: 'rgba(124,92,255,0.08)',
                border: '1px solid rgba(124,92,255,0.2)',
                color: '#F4F5FF',
              }}
            >
              Voltar
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ background: '#7C5CFF', color: '#fff' }}
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={startRevelation}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: '#7C5CFF', color: '#fff' }}
            >
              Revelar meu Mapa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
