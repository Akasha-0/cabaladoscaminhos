// ============================================================================
// useAutoSave — debounced auto-save de Drafts (2026-06-27, Onda 14b)
// ============================================================================
// Salva o conteúdo a cada 5s quando há mudanças. Estratégia:
//   - Compara conteúdo contra `lastSavedContent` (ref) para detectar "dirty"
//   - Ignora saves em paralelo: usa `inFlightRef` para evitar PATCH race
//   - Expõe status: idle | dirty | saving | saved | error
//
// Uso típico:
//   const { status, lastSavedAt, save } = useAutoSave({ draftId, content, intervalMs: 5000 });
//
// O hook é client-only — renderiza dentro de componentes com 'use client'.
// ============================================================================

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type AutoSaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveOptions {
  draftId: string | null;
  content: string;
  // Quão frequente o auto-save dispara (default 5000ms)
  intervalMs?: number;
  // Permite pular autosave (ex: usuário desabilitou)
  enabled?: boolean;
  // Chamado após cada save bem-sucedido (para mostrar "salvo há Xs")
  onSaved?: (savedAt: Date) => void;
}

export interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  /** Força um save imediato (usado em unmount ou "Salvar agora"). */
  save: () => Promise<void>;
  /** Erro da última tentativa (status==='error'). */
  error: string | null;
}

interface DraftPayload {
  id?: string;
  title?: string | null;
  content: string;
  tradition?: string | null;
  topic?: string | null;
  tags?: string[];
}

async function persistDraft(draftId: string | null, payload: DraftPayload) {
  const body: DraftPayload = { ...payload };
  if (draftId) body.id = draftId;

  const res = await fetch('/api/drafts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    const msg = detail?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const json = await res.json();
  return json?.data as { id: string; lastSavedAt: string | null };
}

export function useAutoSave({
  draftId,
  content,
  intervalMs = 5000,
  enabled = true,
  onSaved,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs para o loop de autosave sem re-bindar timers
  const draftIdRef = useRef<string | null>(draftId);
  const lastSavedContentRef = useRef<string>('');
  const inFlightRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mantém o draftId mais recente acessível dentro do timer
  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  const runSave = useCallback(async () => {
    if (!enabled) return;
    if (inFlightRef.current) return;
    if (lastSavedContentRef.current === content) return;

    inFlightRef.current = true;
    setStatus('saving');
    try {
      const data = await persistDraft(draftIdRef.current, { content });
      // Após o POST, o server devolve o id definitivo — atualiza a ref
      draftIdRef.current = data.id;
      lastSavedContentRef.current = content;
      const savedAt = data.lastSavedAt ? new Date(data.lastSavedAt) : new Date();
      setLastSavedAt(savedAt);
      setStatus('saved');
      setError(null);
      onSaved?.(savedAt);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar rascunho';
      setError(msg);
      setStatus('error');
    } finally {
      inFlightRef.current = false;
    }
  }, [content, enabled, onSaved]);

  // Marca como dirty sempre que o conteúdo diverge do último salvo
  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }
    if (lastSavedContentRef.current === '') {
      // Inicialização: aceita o conteúdo inicial como baseline
      lastSavedContentRef.current = content;
      return;
    }
    if (lastSavedContentRef.current !== content) {
      setStatus('dirty');
    }
  }, [content, enabled]);

  // Loop de autosave com debounce por intervalMs
  useEffect(() => {
    if (!enabled) return;
    timerRef.current = setInterval(() => {
      void runSave();
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, intervalMs, runSave]);

  // Flush ao desmontar (best-effort)
  useEffect(() => {
    return () => {
      void runSave();
    };
  }, [runSave]);

  return { status, lastSavedAt, save: runSave, error };
}
