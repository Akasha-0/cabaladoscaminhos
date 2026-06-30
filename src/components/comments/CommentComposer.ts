// CommentComposer.ts — mobile-first bottom-sheet composer with @ mention autocomplete.
// A11Y: aria-label on composer, role="alert" on error, role="dialog" on sheet.

import { h, type ComponentType } from './react-stubs.js';
import type {
  MentionHandle,
  SuggestionMatch,
} from '../../lib/engines/comments/index.ts';
import {
  applyMentionPick,
  detectActiveMentionPrefix,
  extractMentions,
} from '../../lib/engines/comments/index.ts';
import { MentionSuggestions } from './MentionSuggestions.ts';

export interface CommentComposerProps {
  readonly open: boolean;
  readonly parentId: string | null;
  readonly draftText: string;
  readonly suggestions: ReadonlyArray<SuggestionMatch>;
  readonly activeSuggestionIndex: number;
  readonly knownHandles: ReadonlyArray<MentionHandle>;
  readonly errorMessage?: string | null;
  readonly onChange: (text: string, cursor: number) => void;
  readonly onPickSuggestion: (index: number) => void;
  readonly onHoverSuggestion: (index: number) => void;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly placeholder?: string;
}

export const CommentComposer: ComponentType<CommentComposerProps> = (props) => {
  const {
    open,
    parentId,
    draftText,
    suggestions,
    activeSuggestionIndex,
    knownHandles,
    errorMessage,
    onChange,
    onPickSuggestion,
    onHoverSuggestion,
    onClose,
    onSubmit,
    placeholder,
  } = props;

  if (!open) return null;

  const activePrefix = detectActiveMentionPrefix(draftText, draftText.length);
  const showSuggestions =
    activePrefix !== null && activePrefix.prefix.length > 0;

  const headingText = parentId ? 'Responder comentário' : 'Comentar no post';
  const submitLabel = parentId ? 'Responder' : 'Comentar';

  // Mention count (resolved)
  const mentionCount = extractMentions(draftText).filter((e) =>
    knownHandles.includes(e.handle),
  ).length;

  return h(
    'div',
    {
      className: 'comment-composer-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': headingText,
      onClick: (e: MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
      },
      style: {
        position: 'fixed',
        inset: '0',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      },
    },
    h(
      'div',
      {
        className: 'comment-composer-backdrop',
        onClick: onClose,
        style: {
          position: 'absolute',
          inset: '0',
          background: 'rgba(0,0,0,0.45)',
        },
        'aria-hidden': 'true',
      },
    ),
    h(
      'form',
      {
        className: 'comment-composer',
        onSubmit: (e: Event) => {
          e.preventDefault();
          onSubmit();
        },
        style: {
          position: 'relative',
          background: '#fff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          padding: '16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
          maxHeight: '85vh',
          overflow: 'auto',
          width: '100%',
          boxSizing: 'border-box',
        },
      },
      // Drag handle for mobile UX
      h(
        'div',
        {
          className: 'comment-composer-handle',
          'aria-hidden': 'true',
          style: {
            width: '40px',
            height: '4px',
            background: '#ccc',
            borderRadius: '2px',
            margin: '0 auto 12px auto',
          },
        },
      ),
      h(
        'header',
        { className: 'comment-composer-header' },
        h('h2', { className: 'comment-composer-title' }, headingText),
        h(
          'button',
          {
            type: 'button',
            className: 'comment-composer-close',
            'aria-label': 'Fechar',
            onClick: onClose,
            style: {
              minHeight: '44px',
              minWidth: '44px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
            },
          },
          '✕',
        ),
      ),

      showSuggestions
        ? h(MentionSuggestions, {
            suggestions,
            activeIndex: activeSuggestionIndex,
            onPick: onPickSuggestion,
            onHover: onHoverSuggestion,
            id: 'mention-suggestions',
          })
        : null,

      h(
        'label',
        {
          className: 'comment-composer-label',
          htmlFor: 'comment-composer-input',
        },
        'Sua mensagem',
      ),
      h(
        'textarea',
        {
          id: 'comment-composer-input',
          className: 'comment-composer-input',
          value: draftText,
          rows: 4,
          placeholder:
            placeholder ??
            'Escreva seu comentário. Use @ para mencionar alguém.',
          'aria-label': 'Texto do comentário',
          'aria-describedby': errorMessage
            ? 'comment-composer-error'
            : 'comment-composer-help',
          onInput: (e: Event) => {
            const target = e.target as HTMLTextAreaElement;
            onChange(target.value, target.selectionStart ?? target.value.length);
          },
          onKeyDown: (e: KeyboardEvent) => {
            if (showSuggestions && suggestions.length > 0) {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                onHoverSuggestion(
                  (activeSuggestionIndex + 1) % suggestions.length,
                );
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                onHoverSuggestion(
                  (activeSuggestionIndex - 1 + suggestions.length) %
                    suggestions.length,
                );
              } else if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                activeSuggestionIndex >= 0
              ) {
                e.preventDefault();
                onPickSuggestion(activeSuggestionIndex);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
              }
            } else if (e.key === 'Escape') {
              onClose();
            } else if (
              (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) ||
              (e.key === 'Enter' && !e.shiftKey && !showSuggestions)
            ) {
              e.preventDefault();
              onSubmit();
            }
          },
          style: {
            width: '100%',
            minHeight: '88px',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontFamily: 'inherit',
            fontSize: '16px',
            boxSizing: 'border-box',
            resize: 'vertical',
          },
        },
      ),

      h(
        'div',
        {
          id: 'comment-composer-help',
          className: 'comment-composer-help',
          style: { fontSize: '12px', color: '#666', marginTop: '4px' },
        },
        mentionCount > 0
          ? mentionCount + ' menção(ões) ativa(s)'
          : 'Dica: digite @ para mencionar usuários',
      ),

      errorMessage
        ? h(
            'div',
            {
              id: 'comment-composer-error',
              className: 'comment-composer-error',
              role: 'alert',
              style: {
                color: '#b00020',
                background: '#fde7e9',
                padding: '8px 12px',
                borderRadius: '8px',
                marginTop: '8px',
                fontSize: '14px',
              },
            },
            errorMessage,
          )
        : null,

      h(
        'div',
        {
          className: 'comment-composer-actions',
          style: {
            display: 'flex',
            gap: '8px',
            marginTop: '12px',
            justifyContent: 'flex-end',
          },
        },
        h(
          'button',
          {
            type: 'button',
            className: 'comment-composer-cancel',
            onClick: onClose,
            'aria-label': 'Cancelar',
            style: {
              minHeight: '44px',
              minWidth: '44px',
              padding: '0 16px',
              border: '1px solid #ccc',
              background: '#fff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
            },
          },
          'Cancelar',
        ),
        h(
          'button',
          {
            type: 'submit',
            className: 'comment-composer-submit',
            'aria-label': submitLabel,
            disabled: draftText.trim().length === 0,
            style: {
              minHeight: '44px',
              minWidth: '44px',
              padding: '0 20px',
              border: 'none',
              background: draftText.trim().length === 0 ? '#999' : '#1f4e79',
              color: '#fff',
              borderRadius: '8px',
              cursor: draftText.trim().length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: 600,
            },
          },
          submitLabel,
        ),
      ),
    ),
  );
};