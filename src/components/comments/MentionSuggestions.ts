// MentionSuggestions.ts — dropdown showing matched users for @ autocomplete.
// A11Y: role="listbox", aria-label, keyboard arrow keys handled by parent composer.

import { h, type ComponentType } from './react-stubs.js';
import type { SuggestionMatch } from '../../lib/engines/comments/index.ts';
import { TRADICAO_EMOJI } from '../../lib/engines/comments/index.ts';

export interface MentionSuggestionsProps {
  readonly suggestions: ReadonlyArray<SuggestionMatch>;
  readonly activeIndex: number;
  readonly onPick: (index: number) => void;
  readonly onHover: (index: number) => void;
  readonly id?: string;
}

export const MentionSuggestions: ComponentType<MentionSuggestionsProps> = (
  props,
) => {
  const { suggestions, activeIndex, onPick, onHover, id } = props;

  if (suggestions.length === 0) {
    return h(
      'div',
      {
        className: 'mention-suggestions mention-suggestions--empty',
        role: 'status',
        'aria-live': 'polite',
        id,
      },
      'Nenhum usuário encontrado',
    );
  }

  return h(
    'ul',
    {
      className: 'mention-suggestions',
      role: 'listbox',
      'aria-label': 'Sugestões de menção',
      id,
    },
    suggestions.map((s, idx) => {
      const isActive = idx === activeIndex;
      const emoji = TRADICAO_EMOJI[s.usuario.tradicaoPrincipal];
      return h(
        'li',
        {
          key: s.usuario.id,
          className:
            'mention-suggestion' +
            (isActive ? ' mention-suggestion--active' : ''),
          role: 'option',
          id: id ? id + '-opt-' + idx : undefined,
          'aria-selected': isActive,
          onMouseEnter: () => onHover(idx),
          onMouseDown: (e: MouseEvent) => {
            e.preventDefault();
            onPick(idx);
          },
          // Mobile-first 44px tap target
          style: { minHeight: '44px' },
        },
        h(
          'span',
          { className: 'mention-suggestion-emoji', 'aria-hidden': 'true' },
          emoji,
        ),
        h(
          'span',
          { className: 'mention-suggestion-handle' },
          s.displayHandle,
        ),
        h(
          'span',
          { className: 'mention-suggestion-nome' },
          s.usuario.nome,
        ),
        h(
          'span',
          { className: 'mention-suggestion-tradicao' },
          s.usuario.tradicaoPrincipal,
        ),
      );
    }),
  );
};