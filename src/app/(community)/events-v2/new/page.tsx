'use client';

// ============================================================================
// EVENT CREATION — /events-v2/new
// ============================================================================
// Multi-step wizard (5 passos) para criar evento W35:
//   1. Tipo + Tradição + Título + Descrição
//   2. Data + Hora + Timezone + Duração
//   3. Localização física OU URL online
//   4. Capacidade + Preço + RSVP settings
//   5. Cover image + Tags + Review + Publish
//
// Cada step valida antes de avançar. Estado vive em useState local
// (não há auto-save — em prod, draft ficaria em localStorage).
// ============================================================================

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar, MapPin, Globe, Users, DollarSign, Image as ImageIcon,
  Tag, Check, ArrowLeft, ArrowRight, Loader2, Sparkles, AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

// ============================================================
// Constantes
// ============================================================

const EVENT_TYPES = [
  { value: 'WORKSHOP', label: 'Workshop', emoji: '🎓', desc: 'Presencial ou virtual, pago' },
  { value: 'CIRCLE', label: 'Círculo', emoji: '🌀', desc: 'Grupo pequeno (até 12), gratuito' },
  { value: 'LECTURE', label: 'Palestra', emoji: '🎤', desc: 'Gratuito, gravado' },
  { value: 'CEREMONY', label: 'Cerimônia', emoji: '🔥', desc: 'Ritual coletivo' },
  { value: 'MEDITATION', label: 'Meditação', emoji: '🧘', desc: 'Sessão guiada' },
  { value: 'LIVESTREAM', label: 'Livestream', emoji: '📡', desc: 'Transmissão ao vivo' },
] as const;

const TRADITIONS = [
  { value: 'cabala', label: 'Cabala', emoji: '✡️' },
  { value: 'ifa', label: 'Ifá', emoji: '🪶' },
  { value: 'astrologia', label: 'Astrologia', emoji: '♈' },
  { value: 'tantra', label: 'Tantra', emoji: '🕉️' },
  { value: 'reiki', label: 'Reiki', emoji: '🔆' },
  { value: 'meditacao', label: 'Meditação', emoji: '🧘' },
  { value: 'xamanismo', label: 'Xamanismo', emoji: '🌿' },
  { value: 'cristianismo-mistico', label: 'Cristianismo Místico', emoji: '✝️' },
  { value: 'sufismo', label: 'Sufismo', emoji: '☪️' },
  { value: 'taoismo', label: 'Taoísmo', emoji: '☯️' },
  { value: 'umbanda', label: 'Umbanda', emoji: '🪘' },
  { value: 'candomble', label: 'Candomblé', emoji: '🌍' },
];

const STEPS = [
  { num: 1, title: 'Básico', icon: Sparkles },
  { num: 2, title: 'Quando', icon: Calendar },
  { num: 3, title: 'Onde', icon: MapPin },
  { num: 4, title: 'Capacidade', icon: Users },
  { num: 5, title: 'Mídia + Review', icon: ImageIcon },
];

// ============================================================
// Form state
// ============================================================

interface FormState {
  // Step 1
  type: string;
  tradition: string;
  title: string;
  description: string;
  // Step 2
  startsAt: string; // ISO date
  endsAt: string;
  timezone: string;
  // Step 3
  location: string;
  onlineUrl: string;
  // Step 4
  capacity: string;
  priceCents: number;
  rsvpRequired: boolean;
  // Step 5
  coverImage: string;
  tags: string[];
}

const INITIAL: FormState = {
  type: '',
  tradition: '',
  title: '',
  description: '',
  startsAt: '',
  endsAt: '',
  timezone: 'America/Sao_Paulo',
  location: '',
  onlineUrl: '',
  capacity: '',
  priceCents: 0,
  rsvpRequired: true,
  coverImage: '',
  tags: [],
};

// ============================================================
// MAIN
// ============================================================

export default function NewEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validation = useMemo(() => validateStep(step, form), [step, form]);

  if (!user) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50 max-w-md">
          <CardContent className="py-12 text-center space-y-4">
            <Sparkles className="w-10 h-10 mx-auto text-amber-400" />
            <p className="text-slate-300">Faça login para criar um evento.</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-amber-500 to-violet-500 text-white border-0">
                Entrar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const next = () => {
    if (!validation.ok) {
      setError(validation.errors[0]);
      return;
    }
    setError(null);
    if (step < 5) setStep(step + 1);
  };

  const back = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  const submit = async (status: 'DRAFT' | 'PUBLISHED') => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/community/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          capacity: form.capacity ? parseInt(form.capacity, 10) : null,
          status,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      router.push(`/events-v2/${data.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar evento');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8" data-testid="new-event-page">
      <main className="max-w-3xl mx-auto space-y-6 pb-24">
        {/* Header */}
        <header className="flex items-center gap-3">
          <Link href="/events-v2">
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-200">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
              Criar evento
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Workshop, círculo, palestra, cerimônia ou livestream
            </p>
          </div>
        </header>

        {/* Stepper */}
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
          <CardContent className="pt-4">
            <ol className="flex items-center gap-2 overflow-x-auto pb-2">
              {STEPS.map((s) => {
                const Icon = s.icon;
                const active = step === s.num;
                const done = step > s.num;
                return (
                  <li key={s.num} className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                        active && 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                        done && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                        !active && !done && 'bg-slate-800/40 text-slate-500',
                      )}
                    >
                      {done ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                      <span>{s.num}. {s.title}</span>
                    </div>
                    {s.num < STEPS.length && (
                      <span className="text-slate-700">›</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="card-spiritual bg-red-500/10 border-red-500/30">
            <CardContent className="py-3 flex items-center gap-2 text-sm text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </CardContent>
          </Card>
        )}

        {/* Step content */}
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
          <CardContent className="pt-6 space-y-4">
            {step === 1 && <Step1 form={form} update={update} />}
            {step === 2 && <Step2 form={form} update={update} />}
            {step === 3 && <Step3 form={form} update={update} />}
            {step === 4 && <Step4 form={form} update={update} />}
            {step === 5 && (
              <Step5
                form={form}
                update={update}
                tagInput={tagInput}
                setTagInput={setTagInput}
              />
            )}
          </CardContent>
        </Card>

        {/* Nav */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={back}
            disabled={step === 1 || submitting}
            className="border-slate-700 text-slate-300"
            data-testid="step-back"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>

          <div className="flex items-center gap-2">
            {step === 5 && (
              <Button
                variant="outline"
                onClick={() => submit('DRAFT')}
                disabled={submitting}
                className="border-slate-700 text-slate-300"
                data-testid="save-draft"
              >
                Salvar rascunho
              </Button>
            )}
            {step < 5 ? (
              <Button
                onClick={next}
                disabled={!validation.ok}
                className="bg-gradient-to-r from-amber-500 to-violet-500 text-white border-0"
                data-testid="step-next"
              >
                Próximo <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => submit('PUBLISHED')}
                disabled={submitting || !validation.ok}
                className="bg-gradient-to-r from-amber-500 to-violet-500 text-white border-0"
                data-testid="publish-event"
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Publicar
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// Steps
// ============================================================

function Step1({ form, update }: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-slate-400 mb-2">Tipo de evento *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {EVENT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update('type', t.value)}
              data-testid={`type-${t.value}`}
              className={cn(
                'p-3 rounded-xl border text-left transition-all',
                form.type === t.value
                  ? 'bg-amber-500/20 border-amber-500/50'
                  : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600',
              )}
            >
              <div className="text-2xl mb-1">{t.emoji}</div>
              <div className="text-sm font-medium text-slate-200">{t.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-2">Tradição *</label>
        <select
          value={form.tradition}
          onChange={(e) => update('tradition', e.target.value)}
          data-testid="tradition-select"
          className="w-full px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 outline-none"
        >
          <option value="">Selecione...</option>
          {TRADITIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-2">Título *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          maxLength={200}
          placeholder="Ex: Workshop de Cabala Prática"
          data-testid="title-input"
          className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-2">Descrição *</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          maxLength={5000}
          rows={6}
          placeholder="Conte o que vai acontecer, para quem é, o que leva..."
          data-testid="description-input"
          className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 outline-none resize-none"
        />
        <p className="text-xs text-slate-500 mt-1">{form.description.length} / 5000</p>
      </div>
    </div>
  );
}

function Step2({ form, update }: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-2">Início *</label>
          <input
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => update('startsAt', e.target.value)}
            data-testid="starts-at-input"
            className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-2">Término *</label>
          <input
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => update('endsAt', e.target.value)}
            data-testid="ends-at-input"
            className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-2">Timezone</label>
        <select
          value={form.timezone}
          onChange={(e) => update('timezone', e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 outline-none"
        >
          <option value="America/Sao_Paulo">America/São_Paulo (BRT)</option>
          <option value="America/New_York">America/New_York (EST)</option>
          <option value="Europe/Lisbon">Europe/Lisbon (WET)</option>
          <option value="UTC">UTC</option>
        </select>
      </div>
      <p className="text-xs text-slate-500">
        A duração é calculada automaticamente. Eventos passados não podem ser publicados.
      </p>
    </div>
  );
}

function Step3({ form, update }: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const online = form.type === 'LIVESTREAM' || form.type === 'WORKSHOP';
  const physical = form.type !== 'LIVESTREAM';

  return (
    <div className="space-y-4">
      {physical && (
        <div>
          <label className="block text-xs text-slate-400 mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Localização física
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            maxLength={500}
            placeholder="Ex: Centro Akasha — R. das Tradições, 123 — São Paulo"
            data-testid="location-input"
            className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 outline-none"
          />
        </div>
      )}

      {online && (
        <div>
          <label className="block text-xs text-slate-400 mb-2 flex items-center gap-1">
            <Globe className="w-3 h-3" /> URL online
          </label>
          <input
            type="url"
            value={form.onlineUrl}
            onChange={(e) => update('onlineUrl', e.target.value)}
            placeholder="https://meet.jit.si/circulo-cabala-2026"
            data-testid="online-url-input"
            className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            Use Jitsi, Zoom ou outro. Será revelado aos participantes após RSVP.
          </p>
        </div>
      )}

      {!physical && !online && (
        <p className="text-sm text-slate-400">Selecione um tipo de evento no passo 1.</p>
      )}
    </div>
  );
}

function Step4({ form, update }: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-slate-400 mb-2 flex items-center gap-1">
          <Users className="w-3 h-3" /> Capacidade (vazio = ilimitado)
        </label>
        <input
          type="number"
          value={form.capacity}
          onChange={(e) => update('capacity', e.target.value)}
          min={1}
          max={10000}
          placeholder="Ex: 30"
          data-testid="capacity-input"
          className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-2 flex items-center gap-1">
          <DollarSign className="w-3 h-3" /> Preço (em centavos, 0 = gratuito)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={form.priceCents}
            onChange={(e) => update('priceCents', parseInt(e.target.value || '0', 10))}
            min={0}
            data-testid="price-input"
            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 outline-none"
          />
          <span className="text-sm text-slate-400">BRL</span>
          <span className="text-xs text-slate-500">= R$ {(form.priceCents / 100).toFixed(2)}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Pagamento via Stripe (integração W36). Eventos gratuitos não exigem checkout.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="rsvpRequired"
          checked={form.rsvpRequired}
          onChange={(e) => update('rsvpRequired', e.target.checked)}
          data-testid="rsvp-required-input"
          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
        />
        <label htmlFor="rsvpRequired" className="text-sm text-slate-300 cursor-pointer">
          Exigir RSVP para participar
        </label>
      </div>
    </div>
  );
}

function Step5({
  form,
  update,
  tagInput,
  setTagInput,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  tagInput: string;
  setTagInput: (v: string) => void;
}) {
  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t) && form.tags.length < 10) {
      update('tags', [...form.tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => {
    update('tags', form.tags.filter((x) => x !== t));
  };

  const typeObj = EVENT_TYPES.find((t) => t.value === form.type);
  const tradObj = TRADITIONS.find((t) => t.value === form.tradition);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-slate-400 mb-2 flex items-center gap-1">
          <ImageIcon className="w-3 h-3" /> Imagem de capa (URL)
        </label>
        <input
          type="url"
          value={form.coverImage}
          onChange={(e) => update('coverImage', e.target.value)}
          placeholder="https://..."
          data-testid="cover-input"
          className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-2 flex items-center gap-1">
          <Tag className="w-3 h-3" /> Tags (até 10)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Ex: iniciantes"
            data-testid="tag-input"
            className="flex-1 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 outline-none"
          />
          <Button size="sm" onClick={addTag} variant="outline" className="border-slate-700">
            Adicionar
          </Button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.tags.map((t) => (
              <Badge
                key={t}
                variant="outline"
                className="border-amber-500/30 text-amber-300 cursor-pointer hover:bg-red-500/10"
                onClick={() => removeTag(t)}
              >
                #{t} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Review */}
      <div className="pt-4 border-t border-slate-800/50 space-y-2">
        <h3 className="text-sm font-medium text-slate-300">Revisão</h3>
        <div className="text-xs space-y-1 text-slate-400">
          <div><span className="text-slate-500">Tipo:</span> {typeObj?.emoji} {typeObj?.label}</div>
          <div><span className="text-slate-500">Tradição:</span> {tradObj?.emoji} {tradObj?.label}</div>
          <div><span className="text-slate-500">Título:</span> {form.title}</div>
          <div><span className="text-slate-500">Quando:</span> {form.startsAt} → {form.endsAt}</div>
          <div><span className="text-slate-500">Onde:</span> {form.location || form.onlineUrl || '—'}</div>
          <div><span className="text-slate-500">Capacidade:</span> {form.capacity || 'Ilimitada'}</div>
          <div><span className="text-slate-500">Preço:</span> R$ {(form.priceCents / 100).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Validação
// ============================================================

function validateStep(step: number, f: FormState): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (step === 1) {
    if (!f.type) errors.push('Selecione um tipo de evento');
    if (!f.tradition) errors.push('Selecione uma tradição');
    if (!f.title || f.title.length < 3) errors.push('Título deve ter ao menos 3 caracteres');
    if (!f.description || f.description.length < 10) errors.push('Descrição deve ter ao menos 10 caracteres');
  }
  if (step === 2) {
    if (!f.startsAt) errors.push('Início obrigatório');
    if (!f.endsAt) errors.push('Término obrigatório');
    if (f.startsAt && f.endsAt && new Date(f.endsAt) <= new Date(f.startsAt)) {
      errors.push('Término deve ser depois do início');
    }
  }
  if (step === 3) {
    if (f.type !== 'LIVESTREAM' && !f.location) errors.push('Localização física obrigatória');
    if ((f.type === 'LIVESTREAM' || f.type === 'WORKSHOP') && !f.onlineUrl) {
      errors.push('URL online obrigatória');
    }
  }
  if (step === 4) {
    if (f.capacity && (parseInt(f.capacity, 10) < 1 || parseInt(f.capacity, 10) > 10000)) {
      errors.push('Capacidade entre 1 e 10000');
    }
    if (f.priceCents < 0) errors.push('Preço não pode ser negativo');
  }
  if (step === 5) {
    if (f.tags.length > 10) errors.push('Máximo 10 tags');
  }
  return { ok: errors.length === 0, errors };
}