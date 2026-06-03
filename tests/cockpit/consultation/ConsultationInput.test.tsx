// tests/cockpit/consultation/ConsultationInput.test.tsx
// Tests for ConsultationInput — chat input (Doc 12 §8, textarea + Send button).

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsultationInput } from '@/components/cockpit/consultation/ConsultationInput';

// Named type — matches the onSend contract in ConsultationInput
type SendFn = (question: string) => void;

describe('ConsultationInput', () => {
  it('renders textarea with placeholder', () => {
    render(<ConsultationInput onSend={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Pergunte ao Oráculo/)).toBeInTheDocument();
  });

  it('renders send button', () => {
    render(<ConsultationInput onSend={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeInTheDocument();
  });

  it('calls onSend with trimmed value on form submit', () => {
    const onSend: SendFn = vi.fn();
    render(<ConsultationInput onSend={onSend} />);
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    fireEvent.change(textarea, { target: { value: '  E sobre meu trabalho?  ' } });
    fireEvent.submit(textarea.form!);
    expect(onSend).toHaveBeenCalledWith('E sobre meu trabalho?');
  });

  it('clears textarea after submit', () => {
    const onSend: SendFn = vi.fn();
    render(<ConsultationInput onSend={onSend} />);
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    fireEvent.change(textarea, { target: { value: 'Minha pergunta' } });
    fireEvent.submit(textarea.form!);
    expect((textarea as HTMLTextAreaElement).value).toBe('');
  });

  it('does not call onSend when textarea is empty', () => {
    const onSend: SendFn = vi.fn();
    render(<ConsultationInput onSend={onSend} />);
    const form = screen.getByPlaceholderText(/Pergunte ao Oráculo/).closest('form') as HTMLFormElement;
    fireEvent.submit(form);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not call onSend when disabled', () => {
    const onSend: SendFn = vi.fn();
    render(<ConsultationInput onSend={onSend} disabled={true} />);
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    fireEvent.change(textarea, { target: { value: 'Minha pergunta' } });
    fireEvent.submit(textarea.form!);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('sends on Enter (without shift)', () => {
    const onSend: SendFn = vi.fn();
    render(<ConsultationInput onSend={onSend} />);
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    fireEvent.change(textarea, { target: { value: 'Pergunta via Enter' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    expect(onSend).toHaveBeenCalledWith('Pergunta via Enter');
  });

  it('does not send on Enter+Shift (allows newlines)', () => {
    const onSend: SendFn = vi.fn();
    render(<ConsultationInput onSend={onSend} />);
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    fireEvent.change(textarea, { target: { value: 'Linha um\nLinha dois' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('disables button when textarea is empty', () => {
    const onSend: SendFn = vi.fn();
    render(<ConsultationInput onSend={onSend} />);
    const btn = screen.getByRole('button', { name: 'Enviar pergunta' });
    expect(btn).toBeDisabled();
  });

  it('enables button when textarea has content', () => {
    const onSend: SendFn = vi.fn();
    render(<ConsultationInput onSend={onSend} />);
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    fireEvent.change(textarea, { target: { value: 'Pergunta' } });
    const btn = screen.getByRole('button', { name: 'Enviar pergunta' });
    expect(btn).not.toBeDisabled();
  });

  it('disables controls when disabled prop is true', () => {
    const onSend: SendFn = vi.fn();
    render(<ConsultationInput onSend={onSend} disabled={true} />);
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    expect((textarea as HTMLTextAreaElement).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Enviar pergunta' })).toBeDisabled();
  });
});
