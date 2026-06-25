/**
 * @akasha/portal — ActionBar tests
 *
 * Wave 22.2 Zelador Attendance UI. Sticky bottom bar com Salvar / Citar /
 * chat input. Testa render, interações e disabled state.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ActionBar } from '../components/ActionBar';

const LABELS = {
  saveLabel: 'Salvar sessão',
  citeLabel: 'Citar',
  upvoteLabel: 'Útil',
  downvoteLabel: 'Não útil',
  saveAriaLabel: 'Salvar a sessão inteira',
  citeAriaLabel: 'Citar discovery no diário',
  chatPlaceholder: 'Falar com Mentor…',
  sendAriaLabel: 'Enviar mensagem ao Mentor',
  cited: 'citadas',
  rated: 'avaliados',
};

const COUNTS = { total: 5, cited: 2, rated: 3 };

describe('ActionBar', () => {
  it('renderiza a barra sticky', () => {
    render(
      <ActionBar
        inputValue=""
        onInputChange={vi.fn()}
        onSend={vi.fn()}
        counts={COUNTS}
        labels={LABELS}
      />
    );
    expect(screen.getByTestId('attendance-action-bar')).toBeInTheDocument();
  });

  it('renderiza input de chat com placeholder', () => {
    render(
      <ActionBar
        inputValue=""
        onInputChange={vi.fn()}
        onSend={vi.fn()}
        counts={COUNTS}
        labels={LABELS}
      />
    );
    const input = screen.getByTestId('attendance-chat-input');
    expect(input).toHaveAttribute('placeholder', LABELS.chatPlaceholder);
  });

  it('dispara onInputChange ao digitar', () => {
    const onChange = vi.fn();
    render(
      <ActionBar
        inputValue=""
        onInputChange={onChange}
        onSend={vi.fn()}
        counts={COUNTS}
        labels={LABELS}
      />
    );
    fireEvent.change(screen.getByTestId('attendance-chat-input'), {
      target: { value: 'oi' },
    });
    expect(onChange).toHaveBeenCalledWith('oi');
  });

  it('envia mensagem quando input tem texto', () => {
    const onSend = vi.fn();
    render(
      <ActionBar
        inputValue="oi mentor"
        onInputChange={vi.fn()}
        onSend={onSend}
        counts={COUNTS}
        labels={LABELS}
      />
    );
    fireEvent.click(screen.getByTestId('attendance-chat-send'));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('envia mensagem via Enter (form submit)', () => {
    const onSend = vi.fn();
    render(
      <ActionBar
        inputValue="oi mentor"
        onInputChange={vi.fn()}
        onSend={onSend}
        counts={COUNTS}
        labels={LABELS}
      />
    );
    fireEvent.submit(screen.getByTestId('attendance-chat-form'));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('botão Salvar dispara onSave', () => {
    const onSave = vi.fn();
    render(
      <ActionBar
        inputValue=""
        onInputChange={vi.fn()}
        onSend={vi.fn()}
        onSave={onSave}
        counts={COUNTS}
        labels={LABELS}
      />
    );
    fireEvent.click(screen.getByTestId('attendance-save-button'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('botão Citar dispara onCite', () => {
    const onCite = vi.fn();
    render(
      <ActionBar
        inputValue=""
        onInputChange={vi.fn()}
        onSend={vi.fn()}
        onCite={onCite}
        counts={COUNTS}
        labels={LABELS}
      />
    );
    fireEvent.click(screen.getByTestId('attendance-cite-button'));
    expect(onCite).toHaveBeenCalledTimes(1);
  });

  it('mostra micro-feedback de counts (citadas/avaliados)', () => {
    render(
      <ActionBar
        inputValue=""
        onInputChange={vi.fn()}
        onSend={vi.fn()}
        counts={COUNTS}
        labels={LABELS}
      />
    );
    expect(screen.getByTestId('attendance-counts')).toBeInTheDocument();
  });

  it('omite micro-feedback quando counts é zero', () => {
    render(
      <ActionBar
        inputValue=""
        onInputChange={vi.fn()}
        onSend={vi.fn()}
        counts={{ total: 5, cited: 0, rated: 0 }}
        labels={LABELS}
      />
    );
    expect(screen.queryByTestId('attendance-counts')).toBeNull();
  });
});
