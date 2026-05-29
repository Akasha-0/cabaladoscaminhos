/**
 * AIOracleChat Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIOracleChat } from '@/components/dashboard/AIOracleChat';

vi.mock('@/lib/ai/oracle', () => ({
  generateOracleResponse: vi.fn(() =>
    Promise.resolve({
      resposta: 'Resposta espiritual do oraculo',
      referencias: ['Referencia 1', 'Referencia 2'],
      caminho: 'caminho-do-meio' as const,
      sefirot: ['Keter', 'Chesed'],
      orixas: ['Oxum', 'Oxossi'],
      arcano: 'O Sol',
      affirmation: 'Que a luz me guie',
    })
  ),
  getOracleSystemPrompt: vi.fn(() => 'System prompt mock'),
}));

describe('AIOracleChat', () => {
  const mockUserData = {
    id: 'user-1',
    nome: 'Maria da Silva',
    odu: 'Ogbe',
    orixaRegente: 'Oxum',
    numeroPessoal: 5,
  };

  beforeEach(() => { vi.clearAllMocks(); });

  describe('initial render', () => {
    it('renders chat header with oracle name', () => {
      render(<AIOracleChat userData={mockUserData} />);
      expect(screen.getByText('Oraculo IA')).toBeInTheDocument();
    });
    it('renders header subtitle', () => {
      render(<AIOracleChat userData={mockUserData} />);
      expect(screen.getByText('Guiando sua jornada espiritual')).toBeInTheDocument();
    });
    it('renders input placeholder', () => {
      render(<AIOracleChat userData={mockUserData} />);
      expect(screen.getByPlaceholderText('Pergunte ao oraculo...')).toBeInTheDocument();
    });
    it('renders quick prompt buttons', () => {
      render(<AIOracleChat userData={mockUserData} />);
      expect(screen.getByText('Meu destino hoje')).toBeInTheDocument();
      expect(screen.getByText('Protecao espiritual')).toBeInTheDocument();
      expect(screen.getByText('Caminho de evolucao')).toBeInTheDocument();
      expect(screen.getByText('Odu guidance')).toBeInTheDocument();
    });
    it('renders without userData', () => {
      render(<AIOracleChat />);
      expect(screen.getByText('Oraculo IA')).toBeInTheDocument();
    });
    it('applies custom className', () => {
      const { container } = render(<AIOracleChat className="custom-chat" />);
      expect(container.firstChild).toHaveClass('custom-chat');
    });
    it('displays greeting message on mount with user name', async () => {
      render(<AIOracleChat userData={mockUserData} />);
      await waitFor(() => { expect(screen.getByText(/Maria da Silva/)).toBeInTheDocument(); });
    });
    it('displays greeting message on mount without userData', async () => {
      render(<AIOracleChat />);
      await waitFor(() => { expect(screen.getByText(/Sou seu guia espiritual/)).toBeInTheDocument(); });
    });
  });

  describe('message input', () => {
    it('accepts text input', async () => {
      const user = userEvent.setup();
      render(<AIOracleChat userData={mockUserData} />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Quando devo fazer o ebo?');
      expect(textarea).toHaveValue('Quando devo fazer o ebo?');
    });
    it('clears input after sending', async () => {
      const user = userEvent.setup();
      render(<AIOracleChat userData={mockUserData} />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test message');
      const buttons = document.querySelectorAll('button');
      await user.click(buttons[buttons.length - 1]);
      await waitFor(() => { expect(textarea).toHaveValue(''); });
    });
    it('displays user message after sending', async () => {
      const user = userEvent.setup();
      render(<AIOracleChat userData={mockUserData} />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test message');
      const buttons = document.querySelectorAll('button');
      await user.click(buttons[buttons.length - 1]);
      await waitFor(() => { expect(screen.getByText('Test message')).toBeInTheDocument(); });
    });
    it('trims whitespace from message', async () => {
      const user = userEvent.setup();
      render(<AIOracleChat userData={mockUserData} />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '   Trim this   ');
      const buttons = document.querySelectorAll('button');
      await user.click(buttons[buttons.length - 1]);
      await waitFor(() => { expect(screen.getByText('Trim this')).toBeInTheDocument(); });
    });
  });

  describe('send message on enter', () => {
    it('sends message on enter key press', async () => {
      const user = userEvent.setup();
      render(<AIOracleChat userData={mockUserData} />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Fale comigo');
      await user.keyboard('{Enter}');
      await waitFor(() => { expect(screen.getByText('Fale comigo')).toBeInTheDocument(); });
    });
  });

  describe('clear chat', () => {
    it('clears all messages when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<AIOracleChat userData={mockUserData} />);
      await waitFor(() => { expect(screen.getByText(/Maria da Silva/)).toBeInTheDocument(); });
      const clearButton = screen.getByTitle('Limpar conversa');
      await user.click(clearButton);
      await waitFor(() => { expect(screen.queryByText(/Maria da Silva/)).not.toBeInTheDocument(); });
    });
  });

  describe('expand/collapse', () => {
    it('collapses when header is clicked', async () => {
      render(<AIOracleChat userData={mockUserData} />);
      const header = screen.getByText('Oraculo IA').closest('div');
      await fireEvent.click(header!);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  describe('quick prompts', () => {
    it('sends quick prompt message on click', async () => {
      const user = userEvent.setup();
      render(<AIOracleChat userData={mockUserData} />);
      const quickPrompt = screen.getByText('Meu destino hoje');
      await user.click(quickPrompt);
      await waitFor(() => { expect(screen.getByText('O que o universo revela para mim hoje?')).toBeInTheDocument(); });
    });
  });

  describe('onSendMessage callback', () => {
    it('uses custom onSendMessage callback when provided', async () => {
      const onSendMessage = vi.fn(() => Promise.resolve('Custom response'));
      const user = userEvent.setup();
      render(<AIOracleChat userData={mockUserData} onSendMessage={onSendMessage} />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Custom message');
      await user.keyboard('{Enter}');
      await waitFor(() => { expect(onSendMessage).toHaveBeenCalledWith('Custom message'); });
    });
    it('displays response from onSendMessage callback', async () => {
      const onSendMessage = vi.fn(() => Promise.resolve('Custom oracle response'));
      const user = userEvent.setup();
      render(<AIOracleChat userData={mockUserData} onSendMessage={onSendMessage} />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Ask');
      await user.keyboard('{Enter}');
      await waitFor(() => { expect(screen.getByText('Custom oracle response')).toBeInTheDocument(); });
    });
  });

  describe('initial messages', () => {
    it('displays initial messages without greeting', () => {
      const initialMessages = [
        { id: 'init-1', role: 'user' as const, content: 'Previous message', timestamp: new Date() },
        { id: 'init-2', role: 'assistant' as const, content: 'Previous response', timestamp: new Date() },
      ];
      render(<AIOracleChat initialMessages={initialMessages} />);
      expect(screen.getByText('Previous message')).toBeInTheDocument();
      expect(screen.getByText('Previous response')).toBeInTheDocument();
    });
  });

  describe('send button disabled state', () => {
    it('disables send button when input is empty', () => {
      render(<AIOracleChat userData={mockUserData} />);
      const buttons = document.querySelectorAll('button');
      expect(buttons[buttons.length - 1]).toBeDisabled();
    });
    it('enables send button when input has text', async () => {
      const user = userEvent.setup();
      render(<AIOracleChat userData={mockUserData} />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'x');
      const buttons = document.querySelectorAll('button');
      expect(buttons[buttons.length - 1]).not.toBeDisabled();
    });
  });
});
