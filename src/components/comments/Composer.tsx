/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-C — Comment Composer (shared)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Reusable composer used BOTH by the root form (parentId=null) AND by the
 * inline reply form (parentId=parent.id). The parent decides which parent
 * to wire; the composer only deals with `body` + `@mention` autocomplete +
 * LGPD consent.
 *
 * Props:
 *   - formId:    unique id for label/aria wiring
 *   - mode:      'root' | 'reply' — only changes button label + testid prefix
 *   - knownHandles: handle pool for autocomplete
 *   - isFirstComment: if true, LGPD checkbox starts checked (default LGPD-on)
 *   - onSubmit(sanitizedBody): async submit handler — implements engine.addComment
 */

'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';

import {
  caretAfterInsertion,
  detectMentionTrigger,
  applyHandleInsertion,
  STYLES,
} from './helpers';
import { sanitizeBody } from '@/engine/comments/parser';

export interface ComposerProps {
  formId: string;
  mode: 'root' | 'reply';
  knownHandles: ReadonlyArray<string>;
  isFirstComment: boolean;
  submitLabel?: string;
  onSubmit: (sanitizedBody: string) => Promise<void>;
  onError: (message: string) => void;
}

export function Composer({
  formId,
  mode,
  knownHandles,
  isFirstComment,
  submitLabel,
  onSubmit,
  onError,
}: ComposerProps) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lgpd, setLgpd] = useState(isFirstComment);
  const [mention, setMention] = useState<{ term: string; start: number } | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const filtered = useMemo<ReadonlyArray<string>>(() => {
    if (!mention) return [];
    const t = mention.term.toLowerCase();
    return knownHandles.filter((h) => h.toLowerCase().includes(t)).slice(0, 6);
  }, [mention, knownHandles]);

  const onTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      const caret = e.target.selectionStart ?? value.length;
      setBody(value);
      setMention(detectMentionTrigger(value, caret));
    },
    [],
  );

  const insertHandle = useCallback(
    (handle: string) => {
      if (!mention) return;
      const next = applyHandleInsertion(body, mention, handle);
      setBody(next);
      const newCaret = caretAfterInsertion(mention, handle);
      setMention(null);
      window.setTimeout(() => {
        const ta = taRef.current;
        if (!ta) return;
        ta.focus();
        ta.setSelectionRange(newCaret, newCaret);
      }, 0);
    },
    [mention, body],
  );

  const submit = useCallback(async () => {
    if (submitting) return;
    if (!lgpd) {
      onError('É necessário consentir com a Política de Privacidade (LGPD).');
      return;
    }
    const sanitized = sanitizeBody(body);
    if (sanitized.length < 1) {
      onError('Comentário vazio.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(sanitized);
      setBody('');
      setMention(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setSubmitting(false);
    }
  }, [submitting, lgpd, body, onSubmit, onError]);

  const isRootMode = mode === 'root';

  return (
    <form
      data-testid={isRootMode ? 'comment-root-form' : 'reply-form'}
      role="group"
      aria-label={isRootMode ? 'Compor comentário' : 'Formulário de resposta'}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      style={{ marginTop: 8, position: 'relative' }}
    >
      <label htmlFor={`${formId}-body`} style={{ fontSize: 13 }}>
        {isRootMode ? 'Comentar' : 'Responder'}
      </label>
      <textarea
        ref={taRef}
        id={`${formId}-body`}
        data-testid={isRootMode ? 'comment-root-textarea' : 'reply-textarea'}
        style={STYLES.textarea}
        value={body}
        onChange={onTextChange}
        aria-label="Conteúdo do comentário"
        maxLength={2000}
        placeholder="Escreva… use @ para mencionar"
      />
      {filtered.length > 0 ? (
        <ul
          data-testid="mention-dropdown"
          role="listbox"
          aria-label="Sugestões de menção"
          style={STYLES.dropdown}
        >
          {filtered.map((h) => (
            <li
              key={h}
              role="option"
              data-testid={`mention-option-${h}`}
              style={STYLES.mentionRow}
              tabIndex={0}
              onMouseDown={(e) => {
                e.preventDefault();
                insertHandle(h);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  insertHandle(h);
                }
              }}
            >
              @{h}
            </li>
          ))}
        </ul>
      ) : null}
      <div style={STYLES.consentBox}>
        <input
          id={`${formId}-lgpd`}
          type="checkbox"
          data-testid="lgpd-consent"
          checked={lgpd}
          onChange={(e) => setLgpd(e.target.checked)}
          required
        />
        <label htmlFor={`${formId}-lgpd`}>
          Li e concordo com a Política de Privacidade (LGPD).
        </label>
      </div>
      <button
        type="submit"
        style={STYLES.primaryBtn}
        disabled={submitting}
        data-testid={isRootMode ? 'comment-root-submit' : 'reply-submit'}
      >
        {submitting ? 'Enviando…' : (submitLabel ?? (isRootMode ? 'Comentar' : 'Enviar'))}
      </button>
    </form>
  );
}
