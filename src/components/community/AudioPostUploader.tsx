/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90s-C — AudioPostUploader (client component)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 90 · 2026-06-30
 *
 * File picker + drag-drop + progress bar + validation + preview.
 *
 * Mobile-first: 360px baseline, 44px touch targets.
 *
 * Accessibility:
 *   - drag-drop region has keyboard fallback (click-to-pick)
 *   - validation error has aria-live="polite"
 *   - progress has role="progressbar" + aria-valuenow
 *   - LGPD consent labeled with for/id pair
 */

'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Upload, Loader2, CheckCircle2, AlertTriangle, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  validateAudioFile,
  encodeAudioForPreview,
  revokeObjectUrlSafe,
  formatDuration,
  generateWaveformPeaks,
  extractMetadata,
  createInitialUploadState,
  canSubmitAudio,
  lgpdNoteForAudio,
  computeUploadProgress,
  LGPD_VERSION_AUDIO,
  type AudioFormat,
  type AudioUploadState,
  type FileValidationResult,
  type ObjectUrlRef,
  type WaveformPeaks,
} from '@/lib/w90s/audio-posts-upload';
import {
  saveAudioPost,
  type StoredAudioPost,
} from '@/lib/w90s/audio-storage';

const ACCEPT = '.mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg';

export interface AudioPostUploaderProps {
  /** Default dev user id when not authenticated (sandbox/test only) */
  devUserId?: string;
  /** Called when the user finishes the upload flow */
  onPublish?: (post: StoredAudioPost) => void;
  /** Optional pre-fill title (e.g., reply-to context) */
  defaultTitle?: string;
}

export function AudioPostUploader({
  devUserId,
  onPublish,
  defaultTitle = '',
}: AudioPostUploaderProps) {
  const [state, setState] = useState<AudioUploadState>(() => createInitialUploadState());
  const [dragActive, setDragActive] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [lgpd, setLgpd] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validation, setValidation] = useState<FileValidationResult | null>(null);
  const [previewRef, setPreviewRef] = useState<ObjectUrlRef | null>(null);
  const [peaks, setPeaks] = useState<WaveformPeaks | null>(null);
  const [metadata, setMetadata] = useState<{ duration: number; size: number; format: AudioFormat } | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);

  // Cleanup object URL on unmount or when replaced
  useEffect(() => {
    return () => {
      if (previewRef) revokeObjectUrlSafe(previewRef);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewRef?.url]);

  const canSubmit = useMemo(() => {
    return canSubmitAudio(state) && title.trim().length >= 3 && !saving;
  }, [state, title, saving]);

  const reset = useCallback(() => {
    if (previewRef) revokeObjectUrlSafe(previewRef);
    setPreviewRef(null);
    setValidation(null);
    setPeaks(null);
    setMetadata(null);
    setProgress(0);
    setState(createInitialUploadState());
    setErrorMessage(null);
  }, [previewRef]);

  const acceptFile = useCallback(
    async (file: File) => {
      setErrorMessage(null);
      setSuccessMessage(null);
      setState((s) => ({ ...s, status: 'validating', fileName: file.name, sizeBytes: file.size, format: 'mp3' as AudioFormat }));

      const result = validateAudioFile(file);
      setValidation(result);

      if (!result.ok) {
        setErrorMessage(result.message);
        setState((s) => ({ ...s, status: 'error', errorMessage: result.message }));
        return;
      }

      // Build preview object URL
      const preview = encodeAudioForPreview(file, result.format);
      setPreviewRef((prev) => {
        if (prev) revokeObjectUrlSafe(prev);
        return preview;
      });

      setState((s) => ({
        ...s,
        status: 'previewing',
        format: result.format,
        objectUrl: preview.url,
        errorMessage: null,
      }));

      // Generate waveform peaks with a simulated reading (synthetic sampler).
      // Without DOM AnalyserNode in this static demo, we feed a deterministic
      // 200-sample sinusoid scaled by file size (so different sizes differ).
      const seed = Array.from({ length: 200 }, (_, i) => {
        const t = i / 200;
        const noise = Math.sin(t * Math.PI * 8 + file.size * 0.0001) * 0.5;
        const env = Math.sin(t * Math.PI);
        return Math.abs(noise) * env;
      });
      const wf = generateWaveformPeaks(seed, { peaks: 80 });
      setPeaks(wf);

      const md = extractMetadata({
        fileSizeBytes: result.sizeBytes,
        durationSeconds: Math.max(2, Math.round(result.sizeBytes / 16000)),
        sampleRateHz: 44100,
        channels: 2,
        format: result.format,
      });
      setMetadata({ duration: md.durationSeconds, size: result.sizeBytes, format: md.format });

      // Simulate progress (the actual read is fast for ≤10MB files)
      setProgress(0);
      let p = 0;
      const tick = () => {
        p = Math.min(100, p + 12 + Math.random() * 8);
        setProgress(computeUploadProgress(p, 100));
        if (p < 100) {
          setTimeout(tick, 60);
        } else {
          setState((s) => ({ ...s, status: 'ready' }));
        }
      };
      setTimeout(tick, 80);
    },
    [],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files[0]) {
        void acceptFile(files[0]);
      }
    },
    [acceptFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      dragCounter.current = 0;
      const files = e.dataTransfer?.files;
      if (files && files[0]) {
        void acceptFile(files[0]);
      }
    },
    [acceptFile],
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current += 1;
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragActive(false);
    }
  }, []);

  const openFilePicker = useCallback(() => {
    if (inputRef.current) inputRef.current.click();
  }, [inputRef]);

  const onSubmit = useCallback(async () => {
    if (!canSubmit || !validation || !validation.ok || !previewRef) return;
    setSaving(true);
    setErrorMessage(null);

    try {
      // Simulate small network roundtrip (deterministic in tests)
      await new Promise<void>((res) => setTimeout(res, 100));

      const result = saveAudioPost({
        title: title.trim(),
        validation,
        state,
        durationSeconds: metadata?.duration ?? 0,
        peaksLength: peaks?.binCount ?? 0,
        fileRef: previewRef.fileRef,
      });

      if (!result.ok) {
        setErrorMessage(
          result.error === 'localStorage_unavailable'
            ? 'Não foi possível salvar localmente. Verifique as permissões do navegador.'
            : `Falha ao salvar (${result.error})`,
        );
        return;
      }

      const last = result.posts[0];
      if (last) {
        setSuccessMessage('Áudio preparado. Preview disponível localmente.');
        onPublish?.(last);
        // Reset for next upload
        if (previewRef) revokeObjectUrlSafe(previewRef);
        setPreviewRef(null);
        setValidation(null);
        setPeaks(null);
        setMetadata(null);
        setProgress(0);
        setTitle('');
        setLgpd(false);
        setState(createInitialUploadState());
      }
    } finally {
      setSaving(false);
    }
  }, [canSubmit, validation, previewRef, title, state, metadata, peaks, onPublish]);

  return (
    <section
      aria-labelledby="audio-uploader-title"
      data-testid="audio-post-uploader"
      className="mx-auto w-full max-w-full space-y-4 px-4 py-6 md:max-w-2xl"
    >
      <header className="space-y-1">
        <h1
          id="audio-uploader-title"
          className="flex items-center gap-2 text-xl font-semibold tracking-tight"
        >
          <Mic className="h-5 w-5" aria-hidden="true" />
          Post de áudio
        </h1>
        <p className="text-sm text-muted-foreground">
          Compartilhe um áudio curto (≤10MB). Suporta mp3, wav e ogg.
        </p>
      </header>

      {devUserId ? (
        <p
          className="rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground"
          data-testid="dev-user-banner"
        >
          Modo dev · usuário {devUserId}
        </p>
      ) : null}

      <div
        role="button"
        tabIndex={0}
        aria-label="Arraste um arquivo de áudio ou clique para selecionar"
        aria-describedby="audio-upload-hint"
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFilePicker();
          }
        }}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        data-testid="audio-dropzone"
        data-drag-active={dragActive ? 'true' : 'false'}
        className={cn(
          'flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30',
        )}
      >
        <Upload
          className={cn('h-8 w-8', dragActive ? 'text-primary' : 'text-muted-foreground')}
          aria-hidden="true"
        />
        <span id="audio-upload-hint" className="text-sm text-muted-foreground">
          {dragActive
            ? 'Solte o arquivo aqui'
            : 'Arraste um arquivo de áudio ou clique para selecionar'}
        </span>
        <span className="text-xs text-muted-foreground/70">
          mp3 · wav · ogg · até 10MB
        </span>
        <Input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onInputChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          data-testid="audio-file-input"
        />
      </div>

      {validation && !validation.ok ? (
        <div
          role="alert"
          aria-live="polite"
          data-testid="audio-validation-error"
          className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <span>{validation.message}</span>
        </div>
      ) : null}

      {state.status !== 'idle' ? (
        <div className="space-y-2 rounded-md border bg-card p-4" data-testid="audio-preview-panel">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate font-medium" title={state.fileName}>
              {state.fileName}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {(state.sizeBytes / 1024).toFixed(0)} KB
              {metadata ? ` · ${formatDuration(metadata.duration)}` : ''}
            </span>
          </div>
          {state.status === 'validating' || state.status === 'previewing' ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Processando preview…
            </div>
          ) : null}
          {progress > 0 && progress < 100 ? (
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progresso do preview"
              data-testid="audio-progress-bar"
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}
          {state.status === 'ready' ? (
            <div
              role="status"
              aria-live="polite"
              data-testid="audio-ready-badge"
              className="flex items-center gap-2 text-xs text-emerald-600"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Pronto para publicar
            </div>
          ) : null}
          <button
            type="button"
            onClick={reset}
            data-testid="audio-reset-button"
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Trocar arquivo
          </button>
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="audio-title-input"
          className="text-sm font-medium"
        >
          Título
        </label>
        <Input
          id="audio-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 200))}
          placeholder="Ex: Salmo de proteção"
          maxLength={200}
          data-testid="audio-title-input"
          className="min-h-[44px]"
        />
        <p className="text-xs text-muted-foreground">
          Mínimo 3 caracteres. Apenas para referência — o conteúdo é o áudio.
        </p>
      </div>

      <fieldset className="space-y-2 rounded-md border border-primary/20 bg-primary/5 p-3">
        <legend className="px-1 text-sm font-medium">Consentimento LGPD</legend>
        <label
          htmlFor="audio-lgpd-consent"
          className="flex items-start gap-2 text-sm"
        >
          <input
            id="audio-lgpd-consent"
            type="checkbox"
            checked={lgpd}
            onChange={(e) => setLgpd(e.target.checked)}
            required
            data-testid="audio-lgpd-consent"
            className="mt-1 h-4 w-4 rounded border-input"
          />
          <span>
            Li e concordo com o termo (versão {LGPD_VERSION_AUDIO}). O áudio é
            armazenado localmente para preview; só é publicado quando você confirmar.
          </span>
        </label>
        <p className="text-xs text-muted-foreground">{lgpdNoteForAudio()}</p>
      </fieldset>

      {errorMessage ? (
        <div
          role="alert"
          aria-live="assertive"
          data-testid="audio-submit-error"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      ) : null}
      {successMessage ? (
        <div
          role="status"
          aria-live="polite"
          data-testid="audio-submit-success"
          className="rounded-md border border-emerald-400/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          {successMessage}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          data-testid="audio-publish-button"
          className="min-h-[44px]"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          {saving ? 'Salvando…' : 'Publicar preview'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={reset}
          data-testid="audio-cancel-button"
          className="min-h-[44px]"
        >
          Cancelar
        </Button>
      </div>
    </section>
  );
}

export default AudioPostUploader;
