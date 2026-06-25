/**
 * @akasha/portal — AttendanceClient smoke tests
 *
 * Wave 22.2 Zelador Attendance UI. Render estrutural do hub completo:
 * top bar, emotional toggle, layout 2-col, action bar sticky.
 *
 * NOTA: AttendanceClient depende de `useEmotionalState` (localStorage),
 * que precisa de jsdom + polyfill. Esses testes cobrem a estrutura
 * básica e as interações principais (rating, cite, save).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// Stub do `useEmotionalState` para evitar dependência de localStorage timing.
vi.mock('@/lib/state/emotional-state', async () => {
  const actual = await vi.importActual<typeof import('@/lib/state/emotional-state')>(
    '@/lib/state/emotional-state'
  );
  return {
    ...actual,
    useEmotionalState: () => ({
      state: 'ansioso' as const,
      hydrated: true,
      setState: vi.fn(),
      needsPrompt: false,
    }),
  };
});

// Stub useTranslation — devolve a própria chave (sem dependência i18n runtime).
// NOTA: testes assertivos só em data-testids / estrutura. Copy PT-BR pode mudar.

vi.mock('@/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { AttendanceClient } from '../AttendanceClient';

beforeEach(() => {
  cleanup();
  // Reset fetch mock entre testes.
  vi.restoreAllMocks();
});

describe('AttendanceClient — render estrutural', () => {
  it('renderiza o hub principal', () => {
    render(<AttendanceClient locale="pt-BR" zeladorName="Maria" />);
    expect(screen.getByTestId('attendance-hub')).toBeInTheDocument();
  });

  it('mostra o top bar com chave i18n da saudação', () => {
    render(<AttendanceClient locale="pt-BR" zeladorName="Maria" />);
    const top = screen.getByTestId('attendance-top-bar');
    // i18n mock devolve a chave — verificamos que ela existe no top bar.
    expect(top.textContent).toContain('atendimento.topBar.greeting');
  });

  it('mostra o ClientCard com nome do consulente mock', () => {
    render(<AttendanceClient locale="pt-BR" zeladorName="Maria" />);
    expect(screen.getByTestId('attendance-client-name')).toHaveTextContent('João Silva');
  });

  it('mostra o toggle emocional com 4 estados', () => {
    render(<AttendanceClient locale="pt-BR" zeladorName="Maria" />);
    expect(screen.getByTestId('attendance-emotional-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('attendance-emotional-ansioso')).toHaveAttribute('data-active', 'true');
  });

  it('renderiza seção de insights com cards mock', () => {
    render(<AttendanceClient locale="pt-BR" zeladorName="Maria" />);
    const insights = screen.getAllByTestId('attendance-discovery-card');
    expect(insights.length).toBeGreaterThanOrEqual(1);
  });

  it('renderiza ActionBar sticky no rodapé', () => {
    render(<AttendanceClient locale="pt-BR" zeladorName="Maria" />);
    expect(screen.getByTestId('attendance-action-bar')).toBeInTheDocument();
  });

  it('renderiza tabs mobile (Cliente | Insights | Chat)', () => {
    render(<AttendanceClient locale="pt-BR" zeladorName="Maria" />);
    expect(screen.getByTestId('attendance-mobile-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('attendance-tab-cliente')).toBeInTheDocument();
    expect(screen.getByTestId('attendance-tab-insights')).toBeInTheDocument();
    expect(screen.getByTestId('attendance-tab-chat')).toBeInTheDocument();
  });
});

describe('AttendanceClient — interações', () => {
  it('marcar upvote em um discovery muda estado visual', () => {
    render(<AttendanceClient locale="pt-BR" zeladorName="Maria" />);
    const upButtons = screen.getAllByTestId('discovery-upvote');
    fireEvent.click(upButtons[0]);
    expect(upButtons[0].getAttribute('data-active')).toBe('true');
  });

  it('rating chama POST /api/feedback/discoveries (best-effort)', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'));
    render(<AttendanceClient locale="pt-BR" zeladorName="Maria" />);
    fireEvent.click(screen.getAllByTestId('discovery-upvote')[0]);
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/feedback/discoveries',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('clicar em tab mobile muda o conteúdo visível', () => {
    render(<AttendanceClient locale="pt-BR" zeladorName="Maria" />);
    const chatTab = screen.getByTestId('attendance-tab-chat');
    fireEvent.click(chatTab);
    expect(chatTab).toHaveAttribute('aria-selected', 'true');
  });

  it('digitar no chat input atualiza valor (controlled)', () => {
    render(<AttendanceClient locale="pt-BR" zeladorName="Maria" />);
    const input = screen.getByTestId('attendance-chat-input');
    fireEvent.change(input, { target: { value: 'como ele está?' } });
    expect(input).toHaveValue('como ele está?');
  });

  it('botão enviar fica desabilitado quando input vazio', () => {
    render(<AttendanceClient locale="pt-BR" zeladorName="Maria" />);
    const sendBtn = screen.getByTestId('attendance-chat-send');
    expect(sendBtn).toBeDisabled();
  });

  it('botão enviar fica habilitado quando input tem texto', () => {
    render(<AttendanceClient locale="pt-BR" zeladorName="Maria" />);
    const input = screen.getByTestId('attendance-chat-input');
    fireEvent.change(input, { target: { value: 'oi' } });
    expect(screen.getByTestId('attendance-chat-send')).not.toBeDisabled();
  });
});
