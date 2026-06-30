'use client';

// ============================================================================
// CommentComposerWithMentions.tsx — Comment composer with @mention autocomplete
// (W90s-D)
//
// Wires together:
//   - a plain <textarea> bound to `text` state
//   - the `mentionEngine` to detect active @triggers and rank suggestions
//   - the `MentionAutocomplete` popover for keyboard + click selection
//   - inline @mention highlighting using `tokenizeMentions`
//
// Mobile-first: max-w-full on mobile, sm:max-w-2xl on tablet+. All touch
// targets ≥ 44px. ARIA live region announces status updates (a11y).
//
// Sacred-cultural compliance:
//   - Positive-only signals. No downvote / shame language.
//   - 7 tradição symbols + sacred terms preserved verbatim.
// ============================================================================

import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { Send, AlertCircle, Loader2, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  mentionEngine,
  createInitialState,
  type MentionUser,
  type MentionAutocompleteState,
} from '@/lib/w90s/comments-mention-autocomplete';
import { MentionAutocomplete } from '@/components/community/MentionAutocomplete';
import { tokenizeMentions, type MentionNode } from '@/lib/utils/format-mention';

const MAX_COMMENT_LENGTH = 2000;
const MIN_COMMENT_LENGTH = 1;

export interface CommentComposerWithMentionsProps {
  /** User dataset for autocomplete suggestions. Typically fetched from the
   *  `/api/users/search` endpoint. */
  users: ReadonlyArray<MentionUser>;
  /** Optional placeholder text. */
  placeholder?: string;
  /** Optional initial text (e.g. when replying to a comment). */
  initialText?: string;
  /** Callback when the user submits the comment. Returns a Promise so the
   *  composer can show a loading state. */
  onSubmit?: (text: string, mentions: ReadonlyArray<string>) => Promise<boolean>;
  /** Hide the popover (e.g. when used in a test environment). */
  disableAutocomplete?: boolean;
  /** Optional className for the composer wrapper. */
  className?: string;
  /** Current user ID — surfaced in ARIA labels for context. */
  currentUserId?: string | null;
}

type ComposerState = {
  text: string;
  acState: MentionAutocompleteState;
  status: 'idle' | 'saving' | 'saved' | 'error';
  errorMsg: string | null;
};

type ComposerAction =
  | { type: 'set-text'; text: string }
  | { type: 'set-ac'; state: MentionAutocompleteState }
  | { type: 'set-status'; status: ComposerState['status']; errorMsg?: string | null }
  | { type: 'reset' };

function composerReducer(state: ComposerState, action: ComposerAction): ComposerState {
  switch (action.type) {
    case 'set-text':
      return { ...state, text: action.text };
    case 'set-ac':
      return { ...state, acState: action.state };
    case 'set-status':
      return { ...state, status: action.status, errorMsg: action.errorMsg ?? null };
    case 'reset':
      return {
        text: '',
        acState: createInitialState({ nowMs: Date.now(), id: 'composer-reset' }),
        status: 'idle',
        errorMsg: null,
      };
    default:
      return state;
  }
}

export function CommentComposerWithMentions({
  users,
  placeholder = 'Escreva um comentário… use @ para mencionar alguém.',
  initialText = '',
  onSubmit,
  disableAutocomplete = false,
  className,
  currentUserId,
}: CommentComposerWithMentionsProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [state, dispatch] = useReducer(composerReducer, undefined, () => ({
    text: initialText,
    acState: createInitialState({ nowMs: Date.now(), id: 'composer-init' }),
    status: 'idle' as const,
    errorMsg: null,
  }));

  // ---------------------------------------------------------------------
  // Sync autocomplete state whenever text + cursor change.
  // ---------------------------------------------------------------------
  const recompute = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta || disableAutocomplete) return;
    const text = ta.value;
    const cursor = ta.selectionStart ?? text.length;
    const next = mentionEngine.computeAutocompleteState(
      state.acState,
      text,
      cursor,
      users,
      { nowMs: Date.now() },
    );
    if (
      next.trigger?.startIndex !== state.acState.trigger?.startIndex ||
      next.trigger?.endIndex !== state.acState.trigger?.endIndex ||
      next.suggestions.length !== state.acState.suggestions.length
    ) {
      dispatch({ type: 'set-ac', state: next });
    } else if (next.activeIndex !== state.acState.activeIndex) {
      dispatch({ type: 'set-ac', state: next });
    }
  }, [state.acState, users, disableAutocomplete]);

  useEffect(() => {
    recompute();
    // We intentionally re-run only when `users` changes or on initial mount;
    // text/cursor changes are handled by the listeners below.
  }, [users, disableAutocomplete, recompute]);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      dispatch({ type: 'set-text', text });
      if (disableAutocomplete) return;
      const cursor = e.target.selectionStart ?? text.length;
      const next = mentionEngine.computeAutocompleteState(
        state.acState,
        text,
        cursor,
        users,
        { nowMs: Date.now() },
      );
      dispatch({ type: 'set-ac', state: next });
    },
    [state.acState, users, disableAutocomplete],
  );

  const handleSelect = useCallback(() => {
    if (disableAutocomplete) return;
    const ta = textareaRef.current;
    if (!ta) return;
    const text = ta.value;
    const cursor = ta.selectionStart ?? text.length;
    const next = mentionEngine.computeAutocompleteState(
      state.acState,
      text,
      cursor,
      users,
      { nowMs: Date.now() },
    );
    dispatch({ type: 'set-ac', state: next });
  }, [state.acState, users, disableAutocomplete]);

  // ---------------------------------------------------------------------
  // Mention pick handlers (click + keyboard)
  // ---------------------------------------------------------------------
  const handlePick = useCallback(
    (user: MentionUser) => {
      const ta = textareaRef.current;
      if (!ta) return;
      if (!state.acState.trigger) return;
      const result = mentionEngine.insertMention(
        ta.value,
        state.acState.trigger,
        user,
      );
      dispatch({ type: 'set-text', text: result.nextText });
      dispatch({
        type: 'set-ac',
        state: createInitialState({ nowMs: Date.now(), id: 'composer-after-pick' }),
      });
      // Restore caret after the inserted mention. Use rAF so React commits
      // the new value first.
      requestAnimationFrame(() => {
        if (!textareaRef.current) return;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          result.nextCursorPos,
          result.nextCursorPos,
        );
      });
    },
    [state.acState],
  );

  const handleClosePopover = useCallback(() => {
    dispatch({
      type: 'set-ac',
      state: createInitialState({ nowMs: Date.now(), id: 'composer-closed' }),
    });
  }, []);

  const handleActiveChange = useCallback((idx: number) => {
    const next = mentionEngine.setActive(
      // We read from the latest closure-bound state; the engine is pure so
      // setActive returns a new frozen state with the same trigger.
      state.acState,
      idx,
    );
    dispatch({ type: 'set-ac', state: next });
  }, [state.acState]);

  // ---------------------------------------------------------------------
  // Highlight @mention tokens in the composer preview strip below the textarea.
  // ---------------------------------------------------------------------
  const tokens = useMemo(() => tokenizeMentions(state.text), [state.text]);
  const previewNodes: MentionNode[] = tokens;

  // ---------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    const text = state.text.trim();
    if (text.length < MIN_COMMENT_LENGTH) {
      dispatch({ type: 'set-status', status: 'error', errorMsg: 'Comentário vazio.' });
      return;
    }
    if (text.length > MAX_COMMENT_LENGTH) {
      dispatch({
        type: 'set-status',
        status: 'error',
        errorMsg: `Limite de ${MAX_COMMENT_LENGTH} caracteres excedido.`,
      });
      return;
    }
    if (!onSubmit) {
      dispatch({ type: 'set-status', status: 'saved', errorMsg: null });
      dispatch({ type: 'reset' });
      return;
    }
    dispatch({ type: 'set-status', status: 'saving', errorMsg: null });
    try {
      const mentions = mentionEngine.parseMentions(text).map((h) => `@${h}`);
      const ok = await onSubmit(text, mentions);
      if (ok) {
        dispatch({ type: 'set-status', status: 'saved', errorMsg: null });
        dispatch({ type: 'reset' });
      } else {
        dispatch({
          type: 'set-status',
          status: 'error',
          errorMsg: 'Não foi possível enviar. Tente novamente.',
        });
      }
    } catch (err) {
      dispatch({
        type: 'set-status',
        status: 'error',
        errorMsg: err instanceof Error ? err.message : 'Erro de rede.',
      });
    }
  }, [state.text, onSubmit]);

  const popoverOpen =
    !disableAutocomplete && state.acState.trigger !== null;

  return (
    <div
      data-testid="comment-composer"
      data-user-id={currentUserId ?? 'anon'}
      data-popover-open={popoverOpen ? 'true' : 'false'}
      className={cn(
        'flex max-w-full flex-col gap-2 sm:max-w-2xl',
        className,
      )}
    >
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={state.text}
          onChange={handleTextChange}
          onSelect={handleSelect}
          onKeyUp={handleSelect}
          onClick={handleSelect}
          placeholder={placeholder}
          rows={3}
          aria-label="Escrever comentário"
          aria-describedby="composer-help composer-status"
          aria-autocomplete="list"
          aria-expanded={popoverOpen}
          aria-controls={popoverOpen ? `mention-listbox-${state.acState.id}` : undefined}
          aria-activedescendant={
            popoverOpen && state.acState.activeIndex >= 0
              ? `mention-option-${state.acState.id}-${state.acState.activeIndex}`
              : undefined
          }
          data-testid="composer-textarea"
          maxLength={MAX_COMMENT_LENGTH}
          className="min-h-[88px] resize-y"
        />
        <span
          className="pointer-events-none absolute bottom-2 right-2 text-[10px] text-slate-500"
          data-testid="composer-char-count"
        >
          {state.text.length}/{MAX_COMMENT_LENGTH}
        </span>
      </div>

      {popoverOpen ? (
        <div className="relative -mt-1 ml-1">
          <MentionAutocomplete
            state={state.acState}
            onPick={handlePick}
            onClose={handleClosePopover}
            onActiveChange={handleActiveChange}
          />
        </div>
      ) : null}

      {/* Preview strip with highlighted mentions */}
      {state.text.trim().length > 0 ? (
        <div
          data-testid="composer-preview"
          className="rounded-md border border-slate-800/60 bg-slate-900/30 px-3 py-2 text-sm text-slate-300"
          aria-hidden="true"
        >
          {previewNodes.map((node, i) =>
            node.type === 'mention' ? (
              <span
                key={i}
                className="rounded bg-amber-500/15 px-1 text-amber-300"
                data-testid="preview-mention"
              >
                @{node.handle}
              </span>
            ) : (
              <span key={i}>{node.value}</span>
            ),
          )}
        </div>
      ) : null}

      <p
        id="composer-help"
        className="flex items-center gap-1.5 text-[11px] text-slate-500"
      >
        <AtSign className="h-3 w-3" aria-hidden="true" />
        <span>
          Digite <kbd className="rounded bg-slate-800 px-1 text-[10px]">@</kbd> +
          handle para mencionar. Setas para navegar, Enter para escolher.
        </span>
      </p>

      <div className="flex items-center justify-between gap-3">
        <div
          id="composer-status"
          role="status"
          aria-live="polite"
          data-testid="composer-status"
          data-status={state.status}
          className={cn(
            'min-h-[20px] text-xs',
            state.status === 'error' ? 'text-red-400' : 'text-slate-400',
            state.status === 'saved' ? 'text-emerald-400' : '',
          )}
        >
          {state.status === 'error' && state.errorMsg ? (
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {state.errorMsg}
            </span>
          ) : null}
          {state.status === 'saving' ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Enviando…
            </span>
          ) : null}
          {state.status === 'saved' ? (
            <span data-testid="status-saved">Comentário enviado. ✨</span>
          ) : null}
        </div>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={
            state.text.trim().length < MIN_COMMENT_LENGTH || state.status === 'saving'
          }
          data-testid="submit-button"
          className="min-h-[44px]"
        >
          {state.status === 'saving' ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
              Enviando
            </>
          ) : (
            <>
              <Send className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Enviar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default CommentComposerWithMentions;