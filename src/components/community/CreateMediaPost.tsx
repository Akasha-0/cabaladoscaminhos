'use client';

// ============================================================================
// CreateMediaPost — Form de criação de AudioPost / VideoPost / Carrossel
// ============================================================================
// Fluxo:
//   1. Escolha do tipo (audio | video | carrossel)
//   2. Upload de arquivo (file input com validacao client de duracao + size)
//   3. Title (até 140 chars, com contador)
//   4. Transcrição (opcional, exige consent LGPD)
//   5. SacredMetadata picker (tradição + entidades[])
//   6. Preview antes de publicar
//   7. Submit → callback onCreate(MediaPost)
//
// LGPD: checkbox de consent OBRIGATÓRIO para storage de transcrição
// (Art. 7º I + Art. 11º I — dado sensível de origem espiritual).
// ============================================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Music2, Film, Layers, Upload, Loader2, Shield, Eye, Send,
  AlertTriangle, Check, X, Sparkles, Plus, Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/lib/i18n/useT';
import { cn } from '@/lib/utils';
import {
  validateMediaPost,
  MEDIA_LIMITS,
  SACRED_TRADITIONS,
  getWaveformPeaks,
  formatDuration,
  type MediaPost,
  type AudioPost,
  type VideoPost,
  type CarrosselAyanPost,
  type Tradition,
} from '@/lib/w94/media-posts';
import { AudioPost as AudioPostView } from './AudioPost';
import { VideoPost as VideoPostView } from './VideoPost';
import { CarrosselAyan as CarrosselView } from './CarrosselAyan';

// ============================================================================
// Visual constants
// ============================================================================

const TRADITION_LABELS: Record<Tradition, string> = {
  candomble: 'Candomblé',
  umbanda: 'Umbanda',
  ifa: 'Ifá',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
};

const TYPE_OPTIONS: Array<{ value: 'audio' | 'video' | 'carrossel'; icon: React.ReactNode; label: string; }> = [
  { value: 'audio', icon: <Music2 className="w-4 h-4" />, label: 'Áudio' },
  { value: 'video', icon: <Film className="w-4 h-4" />, label: 'Vídeo' },
  { value: 'carrossel', icon: <Layers className="w-4 h-4" />, label: 'Carrossel de Ayan' },
];

// ============================================================================
// Helpers locais
// ============================================================================

function probeAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    audio.src = url;
  });
}

function probeVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    video.src = url;
  });
}

// ============================================================================
// FilePicker — input de arquivo com validacao
// ============================================================================

interface FilePickerProps {
  kind: 'audio' | 'video';
  onFile: (file: File, durationSec: number) => void;
  url: string;
  onUrlChange: (url: string) => void;
  durationSec: number;
  onDurationChange: (sec: number) => void;
  error: string | null;
}

function FilePicker({
  kind, onFile, url, onUrlChange, durationSec, onDurationChange, error,
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isProbing, setIsProbing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setIsProbing(true);
      try {
        const probe = kind === 'audio' ? probeAudioDuration : probeVideoDuration;
        const dur = await probe(file);
        const blobUrl = URL.createObjectURL(file);
        onFile(file, dur);
        onUrlChange(blobUrl);
        onDurationChange(dur);
      } catch (e) {
        console.warn('[FilePicker] probe falhou', e);
      } finally {
        setIsProbing(false);
      }
    },
    [kind, onFile, onUrlChange, onDurationChange]
  );

  const limitSec = kind === 'audio'
    ? MEDIA_LIMITS.AUDIO_MAX_DURATION_SEC
    : MEDIA_LIMITS.VIDEO_MAX_DURATION_SEC;
  const limitBytes = kind === 'audio'
    ? MEDIA_LIMITS.AUDIO_MAX_FILE_BYTES
    : MEDIA_LIMITS.VIDEO_MAX_FILE_BYTES;
  const accept = kind === 'audio' ? 'audio/*' : 'video/*';

  return (
    <div className="space-y-2">
      <label
        htmlFor={`file-input-${kind}`}
        className="block text-xs font-medium text-slate-300"
      >
        Arquivo de {kind === 'audio' ? 'áudio' : 'vídeo'}
      </label>
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border-2 border-dashed',
          error
            ? 'border-red-500/50 bg-red-950/20'
            : 'border-slate-700/60 bg-slate-950/40',
          'transition-colors hover:border-amber-500/50'
        )}
      >
        <input
          ref={inputRef}
          id={`file-input-${kind}`}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
          className="sr-only"
          data-testid={`file-input-${kind}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isProbing}
          className="min-h-[44px]"
          data-testid={`file-pick-button-${kind}`}
        >
          {isProbing ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-1.5" />
          )}
          Escolher arquivo
        </Button>
        <div className="flex-1 min-w-0 text-xs text-slate-400 space-y-0.5">
          {url ? (
            <>
              <p className="truncate text-slate-200">{url.split('/').pop()}</p>
              {durationSec > 0 && (
                <p className="font-mono">
                  {formatDuration(durationSec)} / {formatDuration(limitSec)} max
                </p>
              )}
            </>
          ) : (
            <p>
              Limite: {formatDuration(limitSec)} · {(limitBytes / 1024 / 1024).toFixed(0)} MB
            </p>
          )}
        </div>
        {url && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              onUrlChange('');
              onDurationChange(0);
            }}
            className="min-h-[44px] min-w-[44px] h-9 w-9 text-slate-400 hover:text-red-400"
            aria-label="Remover arquivo"
            data-testid={`file-clear-${kind}`}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5" role="alert">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// CreateMediaPost — main form
// ============================================================================

export interface CreateMediaPostProps {
  /** Callback chamado após validação OK; recebe o MediaPost pronto */
  onCreate: (post: MediaPost) => Promise<{ ok: boolean; error?: string }>;
  /** dev user id para auth bypass em sandbox */
  devUserId?: string;
}

type FormKind = 'audio' | 'video' | 'carrossel';

export function CreateMediaPost({ onCreate, devUserId }: CreateMediaPostProps) {
  const t = useT();

  // Form state
  const [kind, setKind] = useState<FormKind>('audio');
  const [title, setTitle] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [durationSec, setDurationSec] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [transcriptionConsent, setTranscriptionConsent] = useState(false);
  const [tradition, setTradition] = useState<Tradition | ''>('');
  const [entitiesInput, setEntitiesInput] = useState('');
  const [oduRef, setOduRef] = useState('');

  // Carrossel state
  const [carrosselSegs, setCarrosselSegs] = useState<Array<{ url: string; duration: number; kind: 'audio' | 'video' }>>([]);

  // UI state
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<'idle' | 'ok' | 'error'>('idle');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Limpa erro de arquivo ao trocar kind
  useEffect(() => {
    setFileError(null);
    setValidationError(null);
  }, [kind]);

  const titleCharCount = title.length;
  const titleOverLimit = titleCharCount > MEDIA_LIMITS.TITLE_MAX_CHARS;

  const transcriptionOverLimit = transcription.length > MEDIA_LIMITS.TRANSCRIPTION_MAX_CHARS;
  const transcriptionNeedsConsent =
    transcription.trim().length > 0 && !transcriptionConsent;

  // Entities parsed (comma-separated)
  const parsedEntities = useMemo(
    () => entitiesInput
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && e.length <= 80),
    [entitiesInput]
  );

  // Build preview post
  const previewPost = useMemo<MediaPost | null>(() => {
    if (!title || titleOverLimit) return null;
    const baseMeta = (tradition || entitiesInput || oduRef) ? {
      tradition: (tradition || 'cabala') as Tradition,
      entities: parsedEntities.length > 0 ? parsedEntities : undefined,
      oduRef: oduRef || undefined,
    } : undefined;
    const baseFields = {
      id: 'preview-' + Date.now(),
      authorId: devUserId ?? 'preview-user',
      title,
      createdAt: new Date().toISOString(),
      sacredMetadata: baseMeta,
    };
    if (kind === 'audio') {
      if (!audioUrl) return null;
      const wf = new Array(200).fill(0.3);
      return {
        ...baseFields,
        kind: 'audio',
        audioUrl,
        durationSec: durationSec > 0 ? durationSec : 30,
        waveformData: wf,
        transcription: transcription || undefined,
        transcriptionRedacted: false,
      } as AudioPost;
    }
    if (kind === 'video') {
      if (!videoUrl) return null;
      return {
        ...baseFields,
        kind: 'video',
        videoUrl,
        posterUrl: posterUrl || '/img/poster-placeholder.jpg',
        durationSec: durationSec > 0 ? durationSec : 30,
        transcription: transcription || undefined,
      } as VideoPost;
    }
    if (kind === 'carrossel') {
      if (carrosselSegs.length < 3) return null;
      // Build audio-only segments for preview simplicity
      const segs: AudioPost[] = carrosselSegs.slice(0, 5).map((s, i) => ({
        kind: 'audio',
        id: `preview-seg-${i}`,
        authorId: devUserId ?? 'preview-user',
        title: `Segmento ${i + 1}`,
        audioUrl: s.url,
        durationSec: s.duration,
        waveformData: new Array(200).fill(0.4),
        createdAt: new Date().toISOString(),
      }));
      return {
        ...baseFields,
        kind: 'carrossel',
        segments: segs,
        commonTradition: (tradition || undefined) as Tradition | undefined,
      } as CarrosselAyanPost;
    }
    return null;
  }, [
    kind, title, titleOverLimit, audioUrl, videoUrl, posterUrl,
    durationSec, transcription, tradition, parsedEntities, oduRef,
    carrosselSegs, devUserId,
  ]);

  const handleFile = useCallback(
    (_file: File, dur: number) => {
      if (kind === 'audio' && dur > MEDIA_LIMITS.AUDIO_MAX_DURATION_SEC) {
        setFileError(`Áudio excede ${MEDIA_LIMITS.AUDIO_MAX_DURATION_SEC}s (foi ${Math.round(dur)}s)`);
      } else if (kind === 'video' && dur > MEDIA_LIMITS.VIDEO_MAX_DURATION_SEC) {
        setFileError(`Vídeo excede ${MEDIA_LIMITS.VIDEO_MAX_DURATION_SEC}s (foi ${Math.round(dur)}s)`);
      } else {
        setFileError(null);
      }
    },
    [kind]
  );

  const handleAddCarrosselSeg = useCallback(() => {
    if (carrosselSegs.length >= MEDIA_LIMITS.CARROSSEL_MAX_SEGMENTS) return;
    setCarrosselSegs((s) => [...s, { url: '', duration: 30, kind: 'audio' }]);
  }, [carrosselSegs.length]);

  const handleSubmit = useCallback(async () => {
    if (!previewPost) {
      setValidationError('Preencha todos os campos obrigatórios');
      return;
    }
    if (transcriptionNeedsConsent) {
      setValidationError('Consentimento LGPD necessário para armazenar transcrição');
      return;
    }
    const r = validateMediaPost(previewPost);
    if (!r.ok) {
      setValidationError(`Validação: ${r.error.kind}`);
      return;
    }
    setSubmitting(true);
    setValidationError(null);
    try {
      const result = await onCreate(r.value);
      if (result.ok) {
        setSubmitResult('ok');
        // Reset
        setTitle('');
        setAudioUrl('');
        setVideoUrl('');
        setDurationSec(0);
        setTranscription('');
        setTranscriptionConsent(false);
        setEntitiesInput('');
        setOduRef('');
        setCarrosselSegs([]);
        setPreviewOpen(false);
      } else {
        setSubmitResult('error');
        setValidationError(result.error ?? 'Erro ao criar post');
      }
    } catch (e) {
      setSubmitResult('error');
      setValidationError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setSubmitting(false);
    }
  }, [previewPost, transcriptionNeedsConsent, onCreate]);

  return (
    <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* Type selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Tipo de post
          </label>
          <div className="grid grid-cols-3 gap-2" role="radiogroup">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={kind === opt.value}
                onClick={() => setKind(opt.value)}
                className={cn(
                  'min-h-[44px] px-3 py-2 rounded-lg border text-sm font-medium',
                  'flex items-center justify-center gap-2',
                  'transition-colors',
                  kind === opt.value
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/50'
                    : 'bg-slate-800/40 text-slate-300 border-slate-700/60 hover:border-slate-600'
                )}
                data-testid={`type-${opt.value}`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* File picker */}
        {kind === 'audio' && (
          <FilePicker
            kind="audio"
            onFile={handleFile}
            url={audioUrl}
            onUrlChange={setAudioUrl}
            durationSec={durationSec}
            onDurationChange={setDurationSec}
            error={fileError}
          />
        )}
        {kind === 'video' && (
          <>
            <FilePicker
              kind="video"
              onFile={handleFile}
              url={videoUrl}
              onUrlChange={setVideoUrl}
              durationSec={durationSec}
              onDurationChange={setDurationSec}
              error={fileError}
            />
            <div>
              <label htmlFor="poster-url" className="block text-xs font-medium text-slate-300 mb-1.5">
                URL do poster (opcional)
              </label>
              <Input
                id="poster-url"
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://cdn.example.com/poster.jpg"
                className="bg-slate-950/60 border-slate-700"
                data-testid="poster-url-input"
              />
            </div>
          </>
        )}
        {kind === 'carrossel' && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-300">
              Segmentos ({carrosselSegs.length} / {MEDIA_LIMITS.CARROSSEL_MAX_SEGMENTS})
            </p>
            {carrosselSegs.map((seg, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-950/40 rounded border border-slate-800/60">
                <Badge variant="outline" className="border-slate-700 text-slate-400">
                  {i + 1}
                </Badge>
                <Input
                  type="url"
                  value={seg.url}
                  onChange={(e) => setCarrosselSegs((s) =>
                    s.map((x, idx) => idx === i ? { ...x, url: e.target.value } : x)
                  )}
                  placeholder="URL do segmento"
                  className="flex-1 bg-slate-950/60 border-slate-700"
                  data-testid={`carrossel-url-${i}`}
                />
                <Input
                  type="number"
                  value={seg.duration}
                  onChange={(e) => setCarrosselSegs((s) =>
                    s.map((x, idx) => idx === i ? { ...x, duration: Number(e.target.value) || 0 } : x)
                  )}
                  min={1}
                  max={300}
                  className="w-20 bg-slate-950/60 border-slate-700"
                  aria-label="Duração em segundos"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setCarrosselSegs((s) => s.filter((_, idx) => idx !== i))}
                  className="min-h-[44px] min-w-[44px] h-9 w-9 text-slate-400 hover:text-red-400"
                  aria-label="Remover segmento"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCarrosselSeg}
              disabled={carrosselSegs.length >= MEDIA_LIMITS.CARROSSEL_MAX_SEGMENTS}
              className="min-h-[44px]"
              data-testid="carrossel-add-seg"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Adicionar segmento
            </Button>
            {carrosselSegs.length < MEDIA_LIMITS.CARROSSEL_MIN_SEGMENTS && (
              <p className="text-xs text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" />
                Mínimo {MEDIA_LIMITS.CARROSSEL_MIN_SEGMENTS} segmentos
              </p>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-xs font-medium text-slate-300 mb-1.5">
            Título <span className="text-slate-500">({titleCharCount}/{MEDIA_LIMITS.TITLE_MAX_CHARS})</span>
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Oração para Iemanjá"
            maxLength={MEDIA_LIMITS.TITLE_MAX_CHARS}
            className="bg-slate-950/60 border-slate-700"
            data-testid="title-input"
          />
          {titleOverLimit && (
            <p className="text-xs text-red-400 mt-1">Excede {MEDIA_LIMITS.TITLE_MAX_CHARS} caracteres</p>
          )}
        </div>

        {/* Sacred metadata */}
        <div className="space-y-3">
          <div>
            <label htmlFor="tradition" className="block text-xs font-medium text-slate-300 mb-1.5">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Tradição
            </label>
            <select
              id="tradition"
              value={tradition}
              onChange={(e) => setTradition(e.target.value as Tradition | '')}
              className="w-full min-h-[44px] px-3 py-2 rounded-md bg-slate-950/60 border border-slate-700 text-slate-200 text-sm"
              data-testid="tradition-select"
            >
              <option value="">Nenhuma</option>
              {SACRED_TRADITIONS.map((t) => (
                <option key={t} value={t}>{TRADITION_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="entities" className="block text-xs font-medium text-slate-300 mb-1.5">
              Entidades (separadas por vírgula)
            </label>
            <Input
              id="entities"
              type="text"
              value={entitiesInput}
              onChange={(e) => setEntitiesInput(e.target.value)}
              placeholder="Ex: Iemanjá, Oxum"
              className="bg-slate-950/60 border-slate-700"
              data-testid="entities-input"
            />
          </div>
          <div>
            <label htmlFor="oduref" className="block text-xs font-medium text-slate-300 mb-1.5">
              Odu de referência (opcional)
            </label>
            <Input
              id="oduref"
              type="text"
              value={oduRef}
              onChange={(e) => setOduRef(e.target.value)}
              placeholder="Ex: Odu 7 — Ogundá"
              className="bg-slate-950/60 border-slate-700"
              data-testid="oduref-input"
            />
          </div>
        </div>

        {/* Transcription + LGPD consent */}
        <div className="space-y-2">
          <label htmlFor="transcription" className="block text-xs font-medium text-slate-300 mb-1.5">
            Transcrição (opcional)
          </label>
          <Textarea
            id="transcription"
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder="Texto da transcrição (será redigido se contiver PII)..."
            rows={3}
            maxLength={MEDIA_LIMITS.TRANSCRIPTION_MAX_CHARS}
            className="bg-slate-950/60 border-slate-700"
            data-testid="transcription-input"
          />
          <p className="text-xs text-slate-500">
            {transcription.length}/{MEDIA_LIMITS.TRANSCRIPTION_MAX_CHARS}
          </p>
          <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer select-none p-2.5 rounded-md bg-slate-950/40 border border-slate-800/40 min-h-[44px]">
            <input
              type="checkbox"
              checked={transcriptionConsent}
              onChange={(e) => setTranscriptionConsent(e.target.checked)}
              className="mt-0.5 accent-amber-500"
              data-testid="transcription-consent"
            />
            <span>
              <Shield className="w-3 h-3 inline mr-1" />
              Autorizo o armazenamento desta transcrição. Confirmo que não contém dados pessoais de terceiros (LGPD Art. 7º I).
            </span>
          </label>
          {transcriptionNeedsConsent && (
            <p className="text-xs text-amber-400 flex items-center gap-1.5" role="alert">
              <AlertTriangle className="w-3 h-3" />
              Consentimento necessário para publicar transcrição
            </p>
          )}
        </div>

        {/* Validation error display */}
        {validationError && (
          <div
            className="flex items-start gap-2 p-2.5 rounded-md bg-red-950/30 border border-red-800/40 text-xs text-red-200"
            role="alert"
            data-testid="validation-error"
          >
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {submitResult === 'ok' && (
          <div
            className="flex items-center gap-2 p-2.5 rounded-md bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200"
            role="status"
            data-testid="submit-success"
          >
            <Check className="w-3.5 h-3.5" />
            Post criado com sucesso. Axé!
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewOpen((o) => !o)}
            disabled={!previewPost}
            className="min-h-[44px]"
            data-testid="preview-toggle"
          >
            <Eye className="w-4 h-4 mr-1.5" />
            {previewOpen ? 'Ocultar preview' : 'Ver preview'}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !previewPost || transcriptionNeedsConsent}
            className="min-h-[44px] flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950"
            data-testid="submit-button"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-1.5" />
            )}
            Publicar
          </Button>
        </div>

        {/* Preview */}
        {previewOpen && previewPost && (
          <div className="pt-2 border-t border-slate-800/60" data-testid="preview-area">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
              Preview
            </p>
            {previewPost.kind === 'audio' && <AudioPostView post={previewPost} />}
            {previewPost.kind === 'video' && <VideoPostView post={previewPost} />}
            {previewPost.kind === 'carrossel' && <CarrosselView post={previewPost} />}
          </div>
        )}

        {devUserId && <span className="sr-only">dev:{devUserId}</span>}
      </CardContent>
    </Card>
  );
}

export default CreateMediaPost;
