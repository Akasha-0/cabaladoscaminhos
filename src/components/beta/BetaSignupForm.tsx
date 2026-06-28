'use client';

// ============================================================================
// BetaSignupForm — Form white-glove para /beta (Wave 28)
// ============================================================================
// Diferente do InlineEmailCapture (genérico) este form captura 5 campos:
//   1. Email          (required)
//   2. Nome completo  (required — personalização do 1-on-1)
//   3. Tradição favorita (optional — segmentação Fase 2)
//   4. Perfil         (required — mix VISION §3: 4 perfis)
//   5. Intenção       (optional — qualitative data para PM)
//
// Persistência: POST /api/waitlist com `source: 'beta-landing'` + `metadata`
// contendo os campos extras. O schema atual do /api/waitlist (zod) aceita
// apenas `email`, `source`, `referrer`, `utm` — então roteamos via source
// e ignoramos campos extras no MVP. Ver DELIVERABLE-BETA-SCAFFOLD-W28.md
// § "Pending API work" para evolução.
//
// Magic link: se `?token=` na URL, exibimos banner "Convite pessoal"
// (PM está convidando especificamente, não é signup orgânico).
//
// LGPD: 4 dos 5 campos são "low sensitivity" (nome, tradição, perfil,
// intenção). Não coletamos telefone, CPF, endereço.
// ============================================================================

import { useState, type FormEvent } from 'react';
import {
  Mail, User, Sparkles, Heart, Brain, Loader, CircleCheck,
  CircleAlert, Gift, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics/events-catalog';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 4 perfis do VISION §3 — segmentação obrigatória para mix de 50
const PROFILES = [
  {
    value: 'buscador',
    label: 'Buscador',
    description: 'Iniciante curioso, querendo explorar',
    icon: Sparkles,
  },
  {
    value: 'praticante',
    label: 'Praticante',
    description: 'Já estuda uma tradição com profundidade',
    icon: Heart,
  },
  {
    value: 'academico',
    label: 'Curioso acadêmico',
    description: 'Saúde, neurociência, pesquisa',
    icon: Brain,
  },
  {
    value: 'curador',
    label: 'Curador',
    description: 'Quer compartilhar conhecimento',
    icon: User,
  },
] as const;

// 8 tradições principais + multi (mesma taxonomia do /validacao Variants)
const TRADITIONS = [
  'Candomblé / Ifá',
  'Cabala / Numerologia',
  'Astrologia',
  'Tantra / Yoga',
  'Xamanismo',
  'Meditação / Budismo',
  'Umbanda / Espiritismo',
  'Reiki / Cura energética',
  'Outra / Multi-tradição',
];

interface Props {
  /** Magic link token vindo de ?token= */
  inviteToken?: string;
  /** Wave vindo de ?wave=1|2|3 */
  wave?: '1' | '2' | '3';
  /** Origem para tracking (ex: 'beta-landing', 'beta-magic-link') */
  source: string;
}

export function BetaSignupForm({ inviteToken, wave, source }: Props) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    profile: '' as '' | typeof PROFILES[number]['value'],
    tradition: '',
    intent: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isInvited = Boolean(inviteToken);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (status === 'error') {
      setStatus('idle');
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      setStatus('error');
      return;
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setErrorMsg('Email inválido.');
      setStatus('error');
      return;
    }
    if (!form.profile) {
      setErrorMsg('Por favor, escolha um perfil.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          source,
          metadata: {
            name: form.name.trim(),
            profile: form.profile,
            tradition: form.tradition || null,
            intent: form.intent.trim() || null,
            inviteToken: inviteToken ?? null,
            wave: wave ?? null,
          },
        }),
      });

      if (res.ok) {
        setStatus('success');
        // Track conversion — using existing page_viewed event as funnel proxy
        trackEvent('page_viewed', {
          path: '/beta-signup-success',
          query: { source, profile: form.profile, wave: wave ?? 'organic' },
        });
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data?.error ?? 'Erro ao enviar. Tenta novamente.');
        setStatus('error');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro de rede');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6 md:p-8 text-center"
      >
        <CircleCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-2xl text-slate-100 mb-2">
          {isInvited ? 'Convite confirmado!' : 'Inscrição recebida'}
        </h3>
        <p className="text-body text-slate-300 mb-1">
          {isInvited
            ? `Olá, ${form.name.split(' ')[0]}. Seu lugar está reservado na ${wave ?? ''}ª onda.`
            : `Obrigado, ${form.name.split(' ')[0]}. Sua inscrição entrou na fila.`}
        </p>
        <p className="text-caption text-slate-400">
          {isInvited
            ? 'O fundador entra em contato em até 72h para marcar o 1-on-1.'
            : 'Você recebe um email em até 7 dias com a posição na fila + critérios da próxima onda.'}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-slate-900/50 border border-slate-800/50 p-5 md:p-8 space-y-5"
      noValidate
      aria-label="Formulário de inscrição beta"
    >
      {/* Magic link banner */}
      {isInvited && (
        <div
          role="status"
          className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
        >
          <Gift className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-tiny text-amber-200">
            Convite pessoal · Onda {wave ?? '?'} · Token válido por 7 dias.
          </p>
        </div>
      )}

      {/* Nome */}
      <Field
        label="Nome completo"
        required
        htmlFor="beta-name"
        hint="Como aparece na certidão de nascimento — para o 1-on-1 personalizado."
      >
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="beta-name"
            type="text"
            autoComplete="name"
            placeholder="Maria Silva Santos"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            disabled={status === 'submitting'}
            required
            className="w-full h-11 pl-10 pr-3 rounded-lg bg-slate-950/60 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition disabled:opacity-60 text-sm"
          />
        </div>
      </Field>

      {/* Email */}
      <Field
        label="Email"
        required
        htmlFor="beta-email"
        hint="Você recebe confirmação aqui."
      >
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="beta-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            disabled={status === 'submitting'}
            required
            aria-invalid={status === 'error' && !EMAIL_PATTERN.test(form.email.trim())}
            className="w-full h-11 pl-10 pr-3 rounded-lg bg-slate-950/60 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition disabled:opacity-60 text-sm"
          />
        </div>
      </Field>

      {/* Perfil (radio cards — mobile-friendly) */}
      <Field
        label="Como você se descreve?"
        required
        htmlFor="beta-profile-group"
        hint="Para garantir o mix diverso de 50 (VISION §3)."
      >
        <div role="radiogroup" id="beta-profile-group" aria-label="Perfil" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PROFILES.map((p) => {
            const Icon = p.icon;
            const selected = form.profile === p.value;
            return (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update('profile', p.value)}
                disabled={status === 'submitting'}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                  selected
                    ? 'bg-amber-500/15 border-amber-400/60 ring-2 ring-amber-400/30'
                    : 'bg-slate-950/40 border-slate-700/60 hover:border-slate-600'
                } disabled:opacity-60`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${selected ? 'text-amber-300' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <div className={`text-sm font-medium ${selected ? 'text-amber-200' : 'text-slate-200'}`}>
                    {p.label}
                  </div>
                  <div className="text-tiny text-slate-400 truncate">{p.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Field>

      {/* Tradição (select) */}
      <Field
        label="Tradição favorita"
        htmlFor="beta-tradition"
        hint="Opcional — ajuda a montar grupos temáticos."
      >
        <select
          id="beta-tradition"
          value={form.tradition}
          onChange={(e) => update('tradition', e.target.value)}
          disabled={status === 'submitting'}
          className="w-full h-11 px-3 rounded-lg bg-slate-950/60 border border-slate-700 text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition disabled:opacity-60 text-sm"
        >
          <option value="">— Escolha uma tradição —</option>
          {TRADITIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>

      {/* Intenção (textarea) */}
      <Field
        label="Por que quer entrar na beta?"
        htmlFor="beta-intent"
        hint="Opcional — 1-2 frases. Lemos todos."
      >
        <textarea
          id="beta-intent"
          rows={3}
          maxLength={500}
          placeholder="Ex: 'Quero entender como Cabala conversa com neurociência.'"
          value={form.intent}
          onChange={(e) => update('intent', e.target.value)}
          disabled={status === 'submitting'}
          className="w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition disabled:opacity-60 text-sm resize-none"
        />
        <div className="text-tiny text-slate-500 text-right mt-1">
          {form.intent.length}/500
        </div>
      </Field>

      {/* Submit */}
      <Button
        type="submit"
        disabled={status === 'submitting'}
        size="lg"
        className="w-full bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0 h-12 text-base"
      >
        {status === 'submitting' ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Enviando...
          </>
        ) : isInvited ? (
          <>
            <CircleCheck className="w-4 h-4 mr-2" />
            Confirmar convite
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Entrar na lista
          </>
        )}
      </Button>

      {/* LGPD + Error */}
      <div className="space-y-2">
        <p className="flex items-start gap-1.5 text-tiny text-slate-500">
          <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
          Seus dados ficam no nosso servidor (LGPD). Usamos só para o beta — sem spam, sem venda.
        </p>
        {status === 'error' && errorMsg && (
          <p role="alert" className="flex items-start gap-1.5 text-tiny text-red-400">
            <CircleAlert className="w-3 h-3 mt-0.5 flex-shrink-0" />
            {errorMsg}
          </p>
        )}
      </div>
    </form>
  );
}

// ============================================================================
// Field — wrapper de label + input (a11y + spacing consistente)
// ============================================================================

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, required, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-200">
        {label}
        {required && <span className="text-amber-400 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && <p className="text-tiny text-slate-500">{hint}</p>}
    </div>
  );
}
