'use client';

/**
 * ReportForm — client component para /report/[postId]
 *
 * Categorias: SPAM, HARASSMENT, MISINFO, SACRED_OFFENSE, COPYRIGHT, NSFW, OTHER.
 * Inclui reason text + evidence URLs. POST /api/report.
 */

import { useState, useTransition } from 'react';

const REASONS = [
  { value: 'SPAM', label: 'Spam / promoção não-autorizada', emoji: '🚫' },
  { value: 'HARASSMENT', label: 'Assédio ou discurso de ódio', emoji: '⚠️' },
  { value: 'MISINFO', label: 'Informação falsa ou perigosa', emoji: '❌' },
  { value: 'SACRED_OFFENSE', label: 'Uso indevido de conteúdo sagrado', emoji: '🕊️' },
  { value: 'COPYRIGHT', label: 'Violação de direitos autorais', emoji: '©️' },
  { value: 'NSFW', label: 'Conteúdo impróprio (NSFW)', emoji: '🔞' },
  { value: 'OTHER', label: 'Outro motivo', emoji: '✋' },
] as const;

type Reason = typeof REASONS[number]['value'];

interface ReportFormProps {
  targetType: 'POST' | 'COMMENT' | 'USER' | 'GROUP' | 'ARTICLE';
  targetId: string;
}

export function ReportForm({ targetType, targetId }: ReportFormProps) {
  const [reason, setReason] = useState<Reason>('SPAM');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<Array<{ type: 'link' | 'image' | 'quote'; value: string }>>([]);
  const [evidenceInput, setEvidenceInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string; routedTo?: string } | null>(null);

  const addEvidence = () => {
    const trimmed = evidenceInput.trim();
    if (!trimmed) return;
    setEvidence((prev) => [...prev, { type: 'link', value: trimmed }]);
    setEvidenceInput('');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch('/api/report', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            targetType,
            targetId,
            reason,
            description: description || undefined,
            evidence: evidence.length > 0 ? evidence : undefined,
          }),
        });
        const json = await res.json();
        if (json?.data?.flagId) {
          setResult({
            success: true,
            message: json.data.message,
            routedTo: json.data.routedTo,
          });
        } else {
          setResult({
            success: false,
            message: json?.error?.message ?? 'Erro ao enviar denúncia',
          });
        }
      } catch (err) {
        setResult({ success: false, message: String(err) });
      }
    });
  };

  if (result?.success) {
    return (
      <div className="rounded-lg border border-emerald-700/40 bg-emerald-900/20 p-6 text-center">
        <p className="text-2xl">✅</p>
        <h2 className="mt-2 text-lg font-semibold text-emerald-200">Denúncia registrada</h2>
        <p className="mt-2 text-sm text-slate-300">{result.message}</p>
        {result.routedTo && (
          <p className="mt-2 text-xs text-slate-500">
            Encaminhada para: <code>{result.routedTo}</code>
          </p>
        )}
        <button
          onClick={() => {
            setResult(null);
            setDescription('');
            setEvidence([]);
          }}
          className="mt-4 rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Nova denúncia
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-lg border border-slate-800 bg-slate-900/40 p-5">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-200">Motivo</legend>
        <div className="space-y-2">
          {REASONS.map((r) => (
            <label
              key={r.value}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                reason === r.value
                  ? 'border-amber-500/60 bg-amber-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="mt-1"
              />
              <span className="text-lg">{r.emoji}</span>
              <span className="flex-1 text-sm text-slate-200">{r.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-200">
          Contexto adicional <span className="text-xs text-slate-500">(opcional)</span>
        </label>
        <textarea
          id="description"
          rows={4}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva brevemente o problema. Não compartilhe informações pessoais."
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
        />
        <p className="mt-1 text-right text-xs text-slate-500">{description.length}/2000</p>
      </div>

      <div>
        <label htmlFor="evidence" className="mb-2 block text-sm font-semibold text-slate-200">
          Evidências <span className="text-xs text-slate-500">(URLs opcionais — ex: link para print)</span>
        </label>
        <div className="flex gap-2">
          <input
            id="evidence"
            type="url"
            value={evidenceInput}
            onChange={(e) => setEvidenceInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addEvidence();
              }
            }}
            placeholder="https://..."
            className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
          />
          <button
            type="button"
            onClick={addEvidence}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Adicionar
          </button>
        </div>
        {evidence.length > 0 && (
          <ul className="mt-2 space-y-1">
            {evidence.map((e, i) => (
              <li key={i} className="flex items-center justify-between rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs">
                <a href={e.value} target="_blank" rel="noreferrer" className="truncate text-slate-300 hover:text-amber-300">
                  {e.value}
                </a>
                <button
                  type="button"
                  onClick={() => setEvidence(evidence.filter((_, j) => j !== i))}
                  className="text-slate-500 hover:text-rose-400"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {result && !result.success && (
        <div className="rounded-md border border-rose-700/40 bg-rose-900/20 p-3 text-sm text-rose-200">
          {result.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-amber-600 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-500 disabled:opacity-50"
      >
        {isPending ? 'Enviando…' : 'Enviar denúncia'}
      </button>
    </form>
  );
}