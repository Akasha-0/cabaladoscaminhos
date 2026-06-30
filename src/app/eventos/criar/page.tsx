// ============================================================================
// W93-D — /EVENTOS/CRIAR (form de criação, organizer only)
// ----------------------------------------------------------------------------
// Form client-side que valida input e submete ao backend.
// Demo: usa localStorage para armazenar drafts + mostra preview do ICS.
//
// Em produção: substituir o submit por POST /api/eventos.
// ============================================================================

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Check,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { eventToIcs } from '@/lib/w93/ics-export.ts';
import {
  EVENT_KIND_LABEL,
  TRADITION_LABEL,
  type Event,
  type EventKind,
  type EventModality,
  type Tradition,
} from '@/lib/w93/events-types.ts';

// ============================================================================
// Constants
// ============================================================================

const KINDS: EventKind[] = ['roda', 'workshop', 'curso', 'cerimonia', 'gira'];
const MODALITIES: EventModality[] = ['online', 'presencial', 'hibrido'];
const TRADITIONS_LIST: Tradition[] = [
  'cabala',
  'ifa',
  'astrologia',
  'tantra',
  'reiki',
  'meditacao',
  'xamanismo',
  'cristianismo-mistico',
  'sufismo',
  'taoismo',
  'umbanda',
  'candomble',
];

interface FormState {
  title: string;
  slug: string;
  description: string;
  kind: EventKind;
  tradition: Tradition;
  modality: EventModality;
  startsAt: string;
  endsAt: string;
  capacity: string;
  priceCents: string;
  city: string;
  state: string;
  neighborhood: string;
  platform: string;
  coverImage: string;
  coverAlt: string;
  hostName: string;
  hostTraditionLine: string;
  hostBio: string;
}

function initialForm(): FormState {
  return {
    title: '',
    slug: '',
    description: '',
    kind: 'roda',
    tradition: 'cabala',
    modality: 'online',
    startsAt: '',
    endsAt: '',
    capacity: '20',
    priceCents: '',
    city: '',
    state: '',
    neighborhood: '',
    platform: 'Zoom',
    coverImage: '/event-covers/default.jpg',
    coverAlt: '',
    hostName: '',
    hostTraditionLine: '',
    hostBio: '',
  };
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ============================================================================
// Page
// ============================================================================

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTitleBlur = () => {
    if (!form.slug && form.title) {
      update('slug', slugify(form.title));
    }
  };

  const validation = useMemo(() => {
    const errs: string[] = [];
    if (!form.title.trim()) errs.push('Título é obrigatório.');
    if (!form.slug.trim()) errs.push('Slug é obrigatório (será gerado a partir do título).');
    if (!form.description.trim() || form.description.length < 30) errs.push('Descrição deve ter ao menos 30 caracteres.');
    if (!form.startsAt) errs.push('Data de início é obrigatória.');
    if (!form.endsAt) errs.push('Data de fim é obrigatória.');
    if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
      errs.push('Data de fim deve ser posterior à data de início.');
    }
    const cap = Number(form.capacity);
    if (!Number.isFinite(cap) || cap < 0 || !Number.isInteger(cap)) {
      errs.push('Capacidade deve ser inteiro ≥ 0.');
    }
    if (form.priceCents !== '') {
      const p = Number(form.priceCents);
      if (!Number.isFinite(p) || p < 0 || !Number.isInteger(p)) {
        errs.push('Preço deve ser inteiro ≥ 0 em centavos (ou vazio para gratuito).');
      }
    }
    if (!form.hostName.trim()) errs.push('Nome do facilitador é obrigatório.');
    if (form.modality !== 'online' && !form.city.trim()) errs.push('Cidade é obrigatória para presencial/hibrido.');
    return errs;
  }, [form]);

  const canSubmit = validation.length === 0 && !submitting;

  // Preview ICS
  const previewIcs = useMemo(() => {
    if (validation.length > 0) return null;
    try {
      const draftEvent: Event = {
        id: 'preview-id' as Event['id'],
        slug: form.slug,
        title: form.title,
        description: form.description,
        kind: form.kind,
        tradition: form.tradition,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        durationMin: Math.max(0, Math.round((Date.parse(form.endsAt) - Date.parse(form.startsAt)) / 60000)),
        location: {
          kind: form.modality,
          ...(form.modality !== 'online' && {
            city: form.city,
            state: form.state,
            neighborhood: form.neighborhood,
          }),
          ...(form.modality !== 'presencial' && { platform: form.platform }),
        },
        capacity: Number(form.capacity),
        priceCents: form.priceCents === '' ? null : Number(form.priceCents),
        coverImage: form.coverImage || '/event-covers/default.jpg',
        coverAlt: form.coverAlt || form.title,
        host: {
          id: 'preview-host' as Event['host']['id'],
          displayName: form.hostName,
          traditionLine: form.hostTraditionLine,
          bio: form.hostBio,
        },
        language: 'pt-BR',
        signupStatus: 'open',
        closedByOrganizer: false,
        confirmedCount: 0,
        waitlistCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return eventToIcs(draftEvent);
    } catch {
      return null;
    }
  }, [form, validation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      // Demo: persiste em localStorage
      const drafts = JSON.parse(localStorage.getItem('akasha-event-drafts') ?? '[]') as unknown[];
      const draft = { ...form, createdAt: new Date().toISOString() };
      drafts.push(draft);
      localStorage.setItem('akasha-event-drafts', JSON.stringify(drafts));
      setSubmitted(form.slug);
      // Em produção: await fetch('/api/eventos', { method: 'POST', body: JSON.stringify(draft) })
      setTimeout(() => router.push(`/eventos/${form.slug}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar evento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="border-b border-zinc-800/60 bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-amber-400 mb-3">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm uppercase tracking-wider">Criar evento</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Publique seu evento na Akasha</h1>
          <p className="text-zinc-300">
            Rodas, giras, workshops, cursos e cerimônias. Ao publicar, o evento aparece em
            <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-amber-400 mx-1">/eventos</code>
            com RSVP, lista de espera e exportação para calendário.
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-8 space-y-6" data-testid="create-event-form">
        {/* Identidade */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              Identidade
            </h2>
            <Field label="Título *">
              <Input
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Ex: Roda de Cabala — Os 72 Shemot"
                required
                data-testid="input-title"
              />
            </Field>
            <Field label="Slug (URL)" hint="Gerado automaticamente do título se vazio.">
              <Input
                value={form.slug}
                onChange={(e) => update('slug', slugify(e.target.value))}
                placeholder="roda-de-cabala-shemot"
                data-testid="input-slug"
              />
            </Field>
            <Field label="Descrição *" hint="Markdown simples. Mínimo 30 caracteres.">
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Sobre o que é o evento, para quem é, o que levar..."
                rows={5}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:border-amber-500/50 focus:outline-none"
                required
                data-testid="input-description"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo *">
                <Select
                  value={form.kind}
                  onChange={(v) => update('kind', v as EventKind)}
                  options={KINDS.map((k) => ({ value: k, label: EVENT_KIND_LABEL[k] }))}
                  testId="input-kind"
                />
              </Field>
              <Field label="Tradição *">
                <Select
                  value={form.tradition}
                  onChange={(v) => update('tradition', v as Tradition)}
                  options={TRADITIONS_LIST.map((t) => ({ value: t, label: TRADITION_LABEL[t] }))}
                  testId="input-tradition"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Quando */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Quando
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Início *">
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => update('startsAt', e.target.value)}
                  required
                  data-testid="input-starts"
                />
              </Field>
              <Field label="Fim *">
                <Input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => update('endsAt', e.target.value)}
                  required
                  data-testid="input-ends"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Local */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              Local
            </h2>
            <Field label="Modalidade *">
              <Select
                value={form.modality}
                onChange={(v) => update('modality', v as EventModality)}
                options={MODALITIES.map((m) => ({ value: m, label: m === 'online' ? 'Online' : m === 'presencial' ? 'Presencial' : 'Híbrido' }))}
                testId="input-modality"
              />
            </Field>
            {form.modality !== 'online' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Cidade *">
                  <Input
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    placeholder="Rio de Janeiro"
                    required
                    data-testid="input-city"
                  />
                </Field>
                <Field label="UF">
                  <Input
                    value={form.state}
                    onChange={(e) => update('state', e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="RJ"
                    maxLength={2}
                  />
                </Field>
                <Field label="Bairro / ponto de referência">
                  <Input
                    value={form.neighborhood}
                    onChange={(e) => update('neighborhood', e.target.value)}
                    placeholder="Ilê Axé Ogum Megê"
                  />
                </Field>
              </div>
            )}
            {form.modality !== 'presencial' && (
              <Field label="Plataforma (online)">
                <Input
                  value={form.platform}
                  onChange={(e) => update('platform', e.target.value)}
                  placeholder="Zoom"
                />
              </Field>
            )}
          </CardContent>
        </Card>

        {/* Vagas + preço */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              Vagas e preço
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Capacidade *" hint="0 = ilimitado">
                <Input
                  type="number"
                  min={0}
                  value={form.capacity}
                  onChange={(e) => update('capacity', e.target.value)}
                  required
                  data-testid="input-capacity"
                />
              </Field>
              <Field label="Preço (centavos)" hint="Vazio = gratuito">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" aria-hidden="true" />
                  <Input
                    type="number"
                    min={0}
                    value={form.priceCents}
                    onChange={(e) => update('priceCents', e.target.value)}
                    placeholder="0"
                    className="pl-9"
                  />
                </div>
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Facilitador */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Facilitador</h2>
            <Field label="Nome de exibição *">
              <Input
                value={form.hostName}
                onChange={(e) => update('hostName', e.target.value)}
                placeholder="Mago Hermes"
                required
                data-testid="input-host"
              />
            </Field>
            <Field label="Linha de tradição">
              <Input
                value={form.hostTraditionLine}
                onChange={(e) => update('hostTraditionLine', e.target.value)}
                placeholder="Cabala · Ifá · Astrologia"
              />
            </Field>
            <Field label="Bio">
              <textarea
                value={form.hostBio}
                onChange={(e) => update('hostBio', e.target.value)}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:border-amber-500/50 focus:outline-none"
                placeholder="Experiência e linhagem do facilitador..."
              />
            </Field>
          </CardContent>
        </Card>

        {/* Validação */}
        {validation.length > 0 && (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardContent className="p-4 space-y-1.5 text-sm text-amber-200" data-testid="validation-errors">
              <p className="font-semibold mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                Corrija antes de publicar:
              </p>
              {validation.map((v, i) => (
                <p key={i}>· {v}</p>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Submit + feedback */}
        {submitted ? (
          <Card className="border-emerald-500/40 bg-emerald-500/5">
            <CardContent className="p-6 text-emerald-200 flex items-center gap-3" data-testid="submit-success">
              <Check className="w-5 h-5" aria-hidden="true" />
              <p>
                Evento <strong>{submitted}</strong> criado! Redirecionando para a página…
              </p>
            </CardContent>
          </Card>
        ) : (
          <Button
            type="submit"
            variant="golden"
            disabled={!canSubmit}
            className="w-full"
            data-testid="submit-button"
          >
            {submitting ? 'Publicando…' : 'Publicar evento'}
          </Button>
        )}

        {error && (
          <p className="text-rose-300 text-sm" role="alert">{error}</p>
        )}

        {/* Preview do ICS gerado */}
        {previewIcs && (
          <Card className="bg-zinc-900/40 border-zinc-800">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">
                  Preview
                </Badge>
                <span className="text-sm text-zinc-300">
                  Arquivo .ics gerado automaticamente ({previewIcs.length} bytes)
                </span>
              </div>
              <pre className="text-xs text-zinc-400 bg-zinc-950 rounded-md p-3 overflow-x-auto max-h-48 overflow-y-auto">
                {previewIcs}
              </pre>
            </CardContent>
          </Card>
        )}
      </form>
    </main>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-zinc-300 block mb-1">{label}</span>
      {children}
      {hint && <span className="text-xs text-zinc-500 mt-1 block">{hint}</span>}
    </label>
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
  testId,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
  testId?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:border-amber-500/50 focus:outline-none"
      data-testid={testId}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}