// tests/cockpit/consultation/OraculoChat.test.tsx
// Tests for OraculoChat — Q&A chat orchestrator (Doc 12 §8).
// Verifies: empty state, message rendering, streaming, routing chips, error display.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { OraculoChat } from '@/components/cockpit/consultation/OraculoChat';

// Named types — explicit contracts, no ReturnType<typeof vi.fn>
type FetchMock = (args?: unknown) => unknown;

// Synchronous stream — pulls all chunks immediately so jsdom processes them
// without needing real setTimeout (which jsdom doesn't fire by default).
function makeSseStream(events: Array<{ event: string; data: Record<string, unknown> }>): ReadableStream {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index >= events.length) { controller.close(); return; }
      const { event, data } = events[index++];
      const chunk = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      controller.enqueue(encoder.encode(chunk));
    },
  });
}

function mockHistoryFetch(messages: Array<{ id: string; role: string; content: string; routedThemes?: string[]; routedHouses?: number[] }>) {
  (global.fetch as FetchMock).mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ messages }),
  } as Response);
}

function mockEmptyHistory() {
  (global.fetch as FetchMock).mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ messages: [] }),
  } as Response);
}

function mockSse(events: Array<{ event: string; data: Record<string, unknown> }>) {
  (global.fetch as FetchMock).mockResolvedValueOnce({
    ok: true,
    body: makeSseStream(events),
  } as unknown as Response);
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('OraculoChat', () => {
  it('renders empty state with welcome message', () => {
    render(<OraculoChat readingId="reading-1" clientName="Maria" />);
    expect(screen.getByText(/Faça uma pergunta sobre esta leitura/)).toBeInTheDocument();
    expect(screen.getByText(/ancorado no dossiê/)).toBeInTheDocument();
  });

  it('renders empty state with client name', () => {
    render(<OraculoChat readingId="reading-1" clientName="João" />);
    expect(screen.getByText(/João/)).toBeInTheDocument();
  });

  it('renders with consultationId from props (shows empty state)', () => {
    render(<OraculoChat readingId="reading-1" clientName="Maria" consultationId="c1" />);
    expect(screen.getByText(/Faça uma pergunta/)).toBeInTheDocument();
  });

  it('loads and displays existing messages when consultationId is provided', async () => {
    mockHistoryFetch([
      { id: 'm1', role: 'USER', content: 'Olá oráculo', routedThemes: [], routedHouses: [] },
      { id: 'm2', role: 'ORACLE', content: 'Saudações, consulente.', routedThemes: ['geral'], routedHouses: [1] },
    ]);
    render(<OraculoChat readingId="reading-1" clientName="Maria" consultationId="c1" />);
    await waitFor(() => { expect(screen.getByText('Olá oráculo')).toBeInTheDocument(); });
    await waitFor(() => { expect(screen.getByText(/Saudações/)).toBeInTheDocument(); });
  });

  it('displays user bubble after sending a question', async () => {
  it('displays user bubble after sending a question', async () => {
    mockEmptyHistory();
    render(<OraculoChat readingId="reading-1" clientName="Maria" />);
    await waitFor(() => { expect(screen.getByText(/Faça uma pergunta/)).toBeInTheDocument(); });
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    mockSse([
      { event: 'routing', data: { themes: ['geral'], houses: [1] } },
      { event: 'token', data: { delta: 'Olá.' } },
      { event: 'done', data: { consultationId: 'c1', routedThemes: ['geral'], routedHouses: [1], fullAnswer: 'Olá.' } },
    ]);
    const sendBtn = screen.getByRole('button', { name: 'Enviar pergunta' });
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Minha pergunta' } });
      fireEvent.click(sendBtn);
      // Wait for fetch to be called (it starts after handleSend runs synchronously)
      await new Promise((r) => setTimeout(r, 0));
    });
    await waitFor(() => { expect(screen.getByText('Minha pergunta')).toBeInTheDocument(); }, { timeout: 3000 });
  });
  it('shows oracle streaming text as it arrives', async () => {
    mockEmptyHistory();
    render(<OraculoChat readingId="reading-1" clientName="Maria" />);
    await waitFor(() => { expect(screen.getByText(/Faça uma pergunta/)).toBeInTheDocument(); });
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    mockSse([
      { event: 'routing', data: { themes: ['geral'], houses: [1] } },
      { event: 'token', data: { delta: 'Resposta completa.' } },
      { event: 'done', data: { consultationId: 'c1', routedThemes: ['geral'], routedHouses: [1], fullAnswer: 'Resposta completa.' } },
    ]);
    const sendBtn = screen.getByRole('button', { name: 'Enviar pergunta' });
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Streaming test' } });
      fireEvent.click(sendBtn);
      await new Promise((r) => setTimeout(r, 0));
    });
    await waitFor(() => { expect(screen.getByText('Resposta completa.')).toBeInTheDocument(); }, { timeout: 3000 });
  });
  it('displays error banner when SSE sends error event', async () => {
    mockEmptyHistory();
    render(<OraculoChat readingId="reading-1" clientName="Maria" />);
    await waitFor(() => { expect(screen.getByText(/Faça uma pergunta/)).toBeInTheDocument(); });
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    mockSse([
      { event: 'routing', data: { themes: ['geral'], houses: [1] } },
      { event: 'error', data: { message: 'Erro de conexão' } },
      { event: 'done', data: { consultationId: 'c1', routedThemes: ['geral'], routedHouses: [1], fullAnswer: '' } },
    ]);
    const sendBtn = screen.getByRole('button', { name: 'Enviar pergunta' });
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Teste erro' } });
      fireEvent.click(sendBtn);
      await new Promise((r) => setTimeout(r, 0));
    });
    await waitFor(() => { expect(screen.getByText('Erro de conexão')).toBeInTheDocument(); }, { timeout: 3000 });
  });
  it('shows routing chips after done event', async () => {
    mockEmptyHistory();
    render(<OraculoChat readingId="reading-1" clientName="Maria" />);
    await waitFor(() => { expect(screen.getByText(/Faça uma pergunta/)).toBeInTheDocument(); });
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    mockSse([
      { event: 'routing', data: { themes: ['amor'], houses: [24, 25] } },
      { event: 'token', data: { delta: 'Resposta completa.' } },
      { event: 'done', data: { consultationId: 'c1', routedThemes: ['amor'], routedHouses: [24, 25], fullAnswer: 'Resposta completa.' } },
    ]);
    const sendBtn = screen.getByRole('button', { name: 'Enviar pergunta' });
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Sobre amor' } });
      fireEvent.click(sendBtn);
      await new Promise((r) => setTimeout(r, 0));
    });
    await waitFor(() => { expect(screen.getByText('Casa 24')).toBeInTheDocument(); }, { timeout: 3000 });
    await waitFor(() => { expect(screen.getByText('Casa 25')).toBeInTheDocument(); }, { timeout: 3000 });
    await waitFor(() => { expect(screen.getByText('amor')).toBeInTheDocument(); }, { timeout: 3000 });
  });
  it('disables input while streaming', async () => {
    mockEmptyHistory();
    render(<OraculoChat readingId="reading-1" clientName="Maria" />);
    await waitFor(() => { expect(screen.getByText(/Faça uma pergunta/)).toBeInTheDocument(); });
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    mockSse([
      { event: 'routing', data: { themes: ['geral'], houses: [1] } },
      { event: 'token', data: { delta: 'x' } },
    ]);
    const sendBtn = screen.getByRole('button', { name: 'Enviar pergunta' });
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Streaming test' } });
      fireEvent.click(sendBtn);
      await new Promise((r) => setTimeout(r, 0));
    });
    // While streaming, the component sets streaming=true which disables the input
    await waitFor(() => {
      expect((textarea as HTMLTextAreaElement).disabled).toBe(true);
    }, { timeout: 3000 });
  });
  it('handles multi-line user message', async () => {
    mockEmptyHistory();
    render(<OraculoChat readingId="reading-1" clientName="Maria" />);
    await waitFor(() => { expect(screen.getByText(/Faça uma pergunta/)).toBeInTheDocument(); });
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    mockSse([
      { event: 'routing', data: { themes: ['geral'], houses: [1] } },
      { event: 'done', data: { consultationId: 'c1', routedThemes: ['geral'], routedHouses: [1], fullAnswer: 'OK' } },
    ]);
    const sendBtn = screen.getByRole('button', { name: 'Enviar pergunta' });
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Linha um\nLinha dois\nLinha três' } });
      fireEvent.click(sendBtn);
      await new Promise((r) => setTimeout(r, 0));
    });
    await waitFor(() => { expect(screen.getByText(/Linha um/)).toBeInTheDocument(); }, { timeout: 3000 });
  });
  it('displays error banner when SSE sends error event', async () => {
    mockEmptyHistory();
    render(<OraculoChat readingId="reading-1" clientName="Maria" />);
    await waitFor(() => { expect(screen.getByText(/Faça uma pergunta/)).toBeInTheDocument(); });
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    await act(async () => { fireEvent.change(textarea, { target: { value: 'Teste erro' } }); });
    mockSse([
      { event: 'routing', data: { themes: ['geral'], houses: [1] } },
      { event: 'error', data: { message: 'Erro de conexão' } },
      { event: 'done', data: { consultationId: 'c1', routedThemes: ['geral'], routedHouses: [1], fullAnswer: '' } },
    ]);
    const sendBtn = screen.getByRole('button', { name: 'Enviar pergunta' });
    await act(async () => { fireEvent.click(sendBtn); });
    await waitFor(() => { expect(screen.getByText('Erro de conexão')).toBeInTheDocument(); }, { timeout: 3000 });
  });

  it('shows routing chips after done event', async () => {
    mockEmptyHistory();
    render(<OraculoChat readingId="reading-1" clientName="Maria" />);
    await waitFor(() => { expect(screen.getByText(/Faça uma pergunta/)).toBeInTheDocument(); });
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    await act(async () => { fireEvent.change(textarea, { target: { value: 'Sobre amor' } }); });
    mockSse([
      { event: 'routing', data: { themes: ['amor'], houses: [24, 25] } },
      { event: 'token', data: { delta: 'Resposta completa.' } },
      { event: 'done', data: { consultationId: 'c1', routedThemes: ['amor'], routedHouses: [24, 25], fullAnswer: 'Resposta completa.' } },
    ]);
    const sendBtn = screen.getByRole('button', { name: 'Enviar pergunta' });
    await act(async () => { fireEvent.click(sendBtn); });
    await waitFor(() => { expect(screen.getByText('Casa 24')).toBeInTheDocument(); }, { timeout: 3000 });
    await waitFor(() => { expect(screen.getByText('Casa 25')).toBeInTheDocument(); }, { timeout: 3000 });
    await waitFor(() => { expect(screen.getByText('amor')).toBeInTheDocument(); }, { timeout: 3000 });
  });

  it('disables input while streaming', async () => {
    mockEmptyHistory();
    render(<OraculoChat readingId="reading-1" clientName="Maria" />);
    await waitFor(() => { expect(screen.getByText(/Faça uma pergunta/)).toBeInTheDocument(); });
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    await act(async () => { fireEvent.change(textarea, { target: { value: 'Streaming test' } }); });
    mockSse([
      { event: 'routing', data: { themes: ['geral'], houses: [1] } },
      { event: 'token', data: { delta: 'x' } },
    ]);
    const sendBtn = screen.getByRole('button', { name: 'Enviar pergunta' });
    await act(async () => { fireEvent.click(sendBtn); });
    // While streaming the component sets streaming=true which disables the input
    await waitFor(() => {
      expect((textarea as HTMLTextAreaElement).disabled).toBe(true);
    }, { timeout: 3000 });
  });

  it('handles multi-line user message', async () => {
    mockEmptyHistory();
    render(<OraculoChat readingId="reading-1" clientName="Maria" />);
    await waitFor(() => { expect(screen.getByText(/Faça uma pergunta/)).toBeInTheDocument(); });
    const textarea = screen.getByPlaceholderText(/Pergunte ao Oráculo/);
    await act(async () => { fireEvent.change(textarea, { target: { value: 'Linha um\nLinha dois\nLinha três' } }); });
    mockSse([
      { event: 'routing', data: { themes: ['geral'], houses: [1] } },
      { event: 'done', data: { consultationId: 'c1', routedThemes: ['geral'], routedHouses: [1], fullAnswer: 'OK' } },
    ]);
    const sendBtn = screen.getByRole('button', { name: 'Enviar pergunta' });
    await act(async () => { fireEvent.click(sendBtn); });
    await waitFor(() => { expect(screen.getByText(/Linha um/)).toBeInTheDocument(); }, { timeout: 3000 });
  });
});
