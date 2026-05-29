import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AIOracleChat } from '@/components/dashboard/AIOracleChat';

// Mock scrollIntoView for jsdom
const mockScrollIntoView = vi.fn();
Element.prototype.scrollIntoView = mockScrollIntoView;

vi.mock('@/lib/ai/oracle', () => ({
  generateOracleResponse: vi.fn(() =>
    Promise.resolve({
      resposta: 'Resposta espiritual',
      referencias: ['Ref1', 'Ref2'],
      caminho: 'caminho-do-meio' as const,
      sefirot: ['Keter'],
      orixas: ['Oxum'],
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

  beforeEach(() => { vi.clearAllMocks(); mockScrollIntoView.mockClear(); });

  it('renders chat header with Oracle name', () => {
    render(<AIOracleChat userData={mockUserData} />);
    expect(screen.getAllByText('Oráculo IA')[0]).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<AIOracleChat userData={mockUserData} />);
    expect(screen.getByText('Guiando sua jornada espiritual')).toBeInTheDocument();
  });

  it('renders quick prompt buttons', () => {
    render(<AIOracleChat userData={mockUserData} />);
    expect(screen.getByText('Meu destino hoje')).toBeInTheDocument();
    expect(screen.getByText('Proteção espiritual')).toBeInTheDocument();
    expect(screen.getByText('Caminho de evolução')).toBeInTheDocument();
    expect(screen.getByText('Odu guidance')).toBeInTheDocument();
  });

  it('renders input placeholder', () => {
    render(<AIOracleChat userData={mockUserData} />);
    expect(screen.getByPlaceholderText('Pergunte ao oráculo...')).toBeInTheDocument();
  });

  it('displays greeting with user name', async () => {
    render(<AIOracleChat userData={mockUserData} />);
    await waitFor(() => {
      expect(screen.getByText(/Maria da Silva/)).toBeInTheDocument();
    });
  });

  it('accepts text input', () => {
    render(<AIOracleChat userData={mockUserData} />);
    const ta = screen.getByRole('textbox');
    fireEvent.change(ta, { target: { value: 'Test message' } });
    expect(ta).toHaveValue('Test message');
  });

  it('clears input after sending', async () => {
    render(<AIOracleChat userData={mockUserData} />);
    const ta = screen.getByRole('textbox');
    fireEvent.change(ta, { target: { value: 'msg' } });
    fireEvent.click(document.querySelectorAll('button')[document.querySelectorAll('button').length - 1]);
    await waitFor(() => { expect(ta).toHaveValue(''); });
  });

  it('sends message on Enter key', async () => {
    render(<AIOracleChat userData={mockUserData} />);
    const ta = screen.getByRole('textbox');
    fireEvent.change(ta, { target: { value: 'msg' } });
    fireEvent.keyDown(ta, { key: 'Enter' });
    await waitFor(() => { expect(screen.getByText('msg')).toBeInTheDocument(); });
  });

  it('clears chat on clear button', async () => {
    render(<AIOracleChat userData={mockUserData} />);
    await waitFor(() => { expect(screen.getByText(/Maria da Silva/)).toBeInTheDocument(); });
    fireEvent.click(screen.getByTitle('Limpar conversa'));
    await waitFor(() => {
      expect(screen.queryByText(/Maria da Silva/)).toBeNull();
    });
  });

  it('collapses header on click', () => {
    render(<AIOracleChat userData={mockUserData} />);
    const header = screen.getAllByText('Oráculo IA')[0].closest('div');
    fireEvent.click(header!);
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('sends quick prompt on click', async () => {
    render(<AIOracleChat userData={mockUserData} />);
    fireEvent.click(screen.getByText('Meu destino hoje'));
    await waitFor(() => {
      expect(screen.getByText("O que o universo revela para mim hoje?")).toBeInTheDocument();
    });
  });

  it('uses custom onSendMessage callback', async () => {
    const onSend = vi.fn(() => Promise.resolve('custom response'));
    render(<AIOracleChat userData={mockUserData} onSendMessage={onSend} />);
    const ta = screen.getByRole('textbox');
    fireEvent.change(ta, { target: { value: 'x' } });
    fireEvent.keyDown(ta, { key: 'Enter' });
    await waitFor(() => { expect(onSend).toHaveBeenCalledWith('x'); });
  });

  it('displays callback response', async () => {
    const onSend = vi.fn(() => Promise.resolve('custom response'));
    render(<AIOracleChat userData={mockUserData} onSendMessage={onSend} />);
    const ta = screen.getByRole('textbox');
    fireEvent.change(ta, { target: { value: 'x' } });
    fireEvent.keyDown(ta, { key: 'Enter' });
    await waitFor(() => { expect(screen.getByText('custom response')).toBeInTheDocument(); });
  });

  it('renders initial messages', () => {
    render(<AIOracleChat initialMessages={[
      { id: 'i1', role: 'user' as const, content: 'Prev msg', timestamp: new Date() },
      { id: 'i2', role: 'assistant' as const, content: 'Prev resp', timestamp: new Date() },
    ]} />);
    expect(screen.getByText('Prev msg')).toBeInTheDocument();
    expect(screen.getByText('Prev resp')).toBeInTheDocument();
  });
});
