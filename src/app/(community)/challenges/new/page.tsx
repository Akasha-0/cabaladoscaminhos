'use client';

// ============================================================================
// CHALLENGE CREATION — /challenges/new
// ============================================================================
// Multi-step form (4 etapas) para criar um CommunityChallenge.
// Universalismo: o foco é prática, não competição.
// ============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles, ArrowRight, ArrowLeft, Check, Loader2,
  Calendar, Award, Image as ImageIcon, FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3 | 4 | 5; // 5 = review

const TYPE_OPTIONS = [
  { value: 'MEDITATION', label: 'Meditação', desc: '7-21 dias de prática silenciosa' },
  { value: 'PRAYER', label: 'Mantra / Oração', desc: '21+ dias de repetição contemplativa' },
  { value: 'STUDY', label: 'Estudo', desc: 'Ler artigos de uma tradição' },
  { value: 'JOURNALING', label: 'Journaling', desc: 'Reflexão escrita diária' },
  { value: 'COMMUNITY', label: 'Comunidade', desc: 'Ajudar 3+ pessoas (reciprocidade)' },
  { value: 'FASTING', label: 'Jejum consciente', desc: 'Não é dieta — é prática contemplativa' },
  { value: 'TRADITION_SPECIFIC', label: 'Tradição específica', desc: 'Prática de uma tradição' },
];

const TRADITION_OPTIONS = [
  { value: '', label: 'Universal (multi-tradição)' },
  { value: 'cabala', label: 'Cabala' },
  { value: 'ifa', label: 'Ifá' },
  { value: 'tantra', label: 'Tantra' },
  { value: 'meditacao', label: 'Meditação' },
  { value: 'xamanismo', label: 'Xamanismo' },
  { value: 'cristianismo-mistico', label: 'Cristianismo Místico' },
  { value: 'sufismo', label: 'Sufismo' },
  { value: 'taoismo', label: 'Taoísmo' },
  { value: 'umbanda', label: 'Umbanda' },
  { value: 'candomble', label: 'Candomblé' },
  { value: 'reiki', label: 'Reiki' },
  { value: 'astrologia', label: 'Astrologia' },
];

const CADENCE_OPTIONS = [
  { value: 'DAILY', label: 'Diário' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'EVENT_BASED', label: 'Por evento' },
];

const PRESET_DURATIONS = [7, 21, 30, 40];

export default function NewChallengePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    // Step 1
    type: 'MEDITATION',
    tradition: '',
    title: '',
    description: '',

    // Step 2
    durationDays: 7,
    cadence: 'DAILY',
    completionThreshold: 80, // % dos dias para concluir

    // Step 3
    badgeEnabled: true,
    badgeName: '',
    badgeColor: '#7c3aed',

    // Step 4
    coverImage: '',
    startsAt: '',
    endsAt: '',
  });

  const canNextStep1 =
    form.title.trim().length >= 3 && form.description.trim().length >= 10;
  const canNextStep2 = form.durationDays > 0;
  const canNextStep3 = !form.badgeEnabled || form.badgeName.trim().length >= 3;
  const canNextStep4 = form.startsAt && form.endsAt;

  async function handlePublish() {
    setSubmitting(true);
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'unknown' }));
        alert(`Erro: ${err.error || res.statusText}`);
        return;
      }
      const data = await res.json();
      router.push(`/challenges/${data.challenge.id}`);
    } catch (e) {
      alert('Falha de rede — tente novamente');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/40 via-white to-amber-50/20 dark:from-violet-950/20 dark:via-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Criar desafio
          </h1>
          <span className="text-sm text-zinc-500">
            Etapa {step} de 5
          </span>
        </div>

        <div className="mb-6 flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                s <= step ? 'bg-violet-600' : 'bg-zinc-200 dark:bg-zinc-800',
              )}
            />
          ))}
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6 md:p-8">
            {/* ============================================ */}
            {/* STEP 1: Tipo + Tradição + Título + Descrição */}
            {/* ============================================ */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-1 text-lg font-semibold">
                    Sobre o que é o desafio?
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Defina o tipo de prática e a tradição (se aplicável).
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Tipo de prática</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, type: opt.value })}
                        className={cn(
                          'rounded-lg border p-3 text-left text-sm transition-all',
                          form.type === opt.value
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800',
                        )}
                      >
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-xs text-zinc-500">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Tradição alvo</label>
                  <select
                    value={form.tradition}
                    onChange={(e) => setForm({ ...form, tradition: e.target.value })}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    {TRADITION_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Título</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="ex: 7 dias de meditação silenciosa"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Descrição</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    placeholder="O que o participante vai fazer? Qual o espírito? Sem pressão, sem performance."
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    {form.description.length} caracteres (mínimo 10)
                  </p>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* STEP 2: Duração + Cadência + Scoring */}
            {/* ============================================ */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-1 text-lg font-semibold">Duração e cadência</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Quanto tempo dura e qual a frequência de prática.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Duração (em dias)
                  </label>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {PRESET_DURATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm({ ...form, durationDays: d })}
                        className={cn(
                          'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                          form.durationDays === d
                            ? 'bg-violet-600 text-white'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300',
                        )}
                      >
                        {d} dias
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={form.durationDays}
                    onChange={(e) =>
                      setForm({ ...form, durationDays: parseInt(e.target.value) || 7 })
                    }
                    className="w-32 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Cadência</label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {CADENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, cadence: opt.value })}
                        className={cn(
                          'rounded-lg border p-3 text-sm font-medium transition-all',
                          form.cadence === opt.value
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Conclusão (%)
                  </label>
                  <p className="mb-2 text-xs text-zinc-500">
                    Percentual mínimo de dias completados para receber badge.
                    Padrão 80% — flexibilidade é parte da prática.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={50}
                      max={100}
                      step={5}
                      value={form.completionThreshold}
                      onChange={(e) =>
                        setForm({ ...form, completionThreshold: parseInt(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="w-12 text-right text-sm font-mono">
                      {form.completionThreshold}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* STEP 3: Badge */}
            {/* ============================================ */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-1 text-lg font-semibold">Badge de conclusão</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Símbolo visual recebido ao completar o desafio (opcional).
                  </p>
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.badgeEnabled}
                    onChange={(e) =>
                      setForm({ ...form, badgeEnabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  <span className="text-sm">Conceder badge ao concluir</span>
                </label>

                {form.badgeEnabled && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Nome do badge
                      </label>
                      <input
                        type="text"
                        value={form.badgeName}
                        onChange={(e) => setForm({ ...form, badgeName: e.target.value })}
                        placeholder="ex: Sete Luas de Meditação"
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Cor simbólica</label>
                      <div className="flex gap-2">
                        {['#7c3aed', '#dc2626', '#0891b2', '#16a34a', '#ea580c', '#db2777'].map(
                          (color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setForm({ ...form, badgeColor: color })}
                              className={cn(
                                'h-8 w-8 rounded-full border-2 transition-all',
                                form.badgeColor === color
                                  ? 'border-zinc-900 dark:border-white scale-110'
                                  : 'border-transparent',
                              )}
                              style={{ backgroundColor: color }}
                              aria-label={`Cor ${color}`}
                            />
                          ),
                        )}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                      <p className="mb-3 text-xs text-zinc-500">Pré-visualização:</p>
                      <div className="flex items-center gap-3">
                        <Award className="h-10 w-10" style={{ color: form.badgeColor }} />
                        <div>
                          <div className="font-semibold">
                            {form.badgeName || 'Nome do Badge'}
                          </div>
                          <div className="text-xs text-zinc-500">
                            Conclusão de {form.durationDays}-day challenge
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ============================================ */}
            {/* STEP 4: Cover image + Datas */}
            {/* ============================================ */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-1 text-lg font-semibold">Aparência e datas</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Imagem de capa e período de execução.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">URL da capa (opcional)</label>
                  <input
                    type="url"
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    placeholder="https://…"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Sugestão: imagem quadrada 800×800. Hospede em CDN próprio.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Início</label>
                    <input
                      type="date"
                      value={form.startsAt}
                      onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Término</label>
                    <input
                      type="date"
                      value={form.endsAt}
                      onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* STEP 5: Review + publish */}
            {/* ============================================ */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="mb-1 text-lg font-semibold">Revisão</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Confira tudo antes de publicar.
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">{form.type}</Badge>
                    {form.tradition && (
                      <Badge variant="outline">{form.tradition}</Badge>
                    )}
                    <Badge variant="outline">{form.cadence}</Badge>
                    <Badge variant="outline">{form.durationDays} dias</Badge>
                  </div>
                  <h3 className="text-lg font-bold">{form.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {form.description}
                  </p>

                  {form.badgeEnabled && form.badgeName && (
                    <div className="mt-4 flex items-center gap-2 rounded bg-zinc-50 p-3 dark:bg-zinc-900">
                      <Award className="h-5 w-5" style={{ color: form.badgeColor }} />
                      <div className="text-sm">
                        <strong>{form.badgeName}</strong> · {form.completionThreshold}% conclusão
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar className="h-3 w-3" />
                    {form.startsAt} → {form.endsAt}
                  </div>
                </div>

                <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  ⚠️ Ao publicar, participantes podem se inscrever imediatamente.
                  Você pode editar título/descrição depois, mas tipo e duração
                  ficam fixos para preservar a integridade do desafio.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nav buttons */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((step - 1) as Step)}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          {step < 5 ? (
            <Button
              onClick={() => setStep((step + 1) as Step)}
              disabled={
                (step === 1 && !canNextStep1) ||
                (step === 2 && !canNextStep2) ||
                (step === 3 && !canNextStep3) ||
                (step === 4 && !canNextStep4)
              }
              className="bg-violet-600 hover:bg-violet-700"
            >
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={submitting}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publicando…
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Publicar desafio
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
