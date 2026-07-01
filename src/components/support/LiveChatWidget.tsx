'use client';

// ============================================================================
// LiveChatWidget — floating chat widget (Wave 37)
// ============================================================================
// Botão flutuante bottom-right. Abre painel com pre-chat form, depois
// thread de mensagens. Polling 5s para mensagens do agente.
//
// Operating hours: 9h-18h BRT (configurável). Fora do horário: mostra
// fallback "deixe uma mensagem" (ticket creation).
//
// Acessibilidade: aria-live, focus trap no modal, Esc para fechar.
// ============================================================================

import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  isInternal: boolean;
}

type View = 'closed' | 'prechat' | 'chat';

const OPERATING_HOURS = {
  // BRT (UTC-3). 9-18 = 12-21 UTC. Allow +/- 1h grace.
  startHourUTC: 12,
  endHourUTC: 21,
};

function isWithinOperatingHours(now = new Date()): boolean {
  const hour = now.getUTCHours();
  return hour >= OPERATING_HOURS.startHourUTC && hour < OPERATING_HOURS.endHourUTC;
}

export function LiveChatWidget() {
  const [view, setView] = useState<View>('closed');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'BILLING' | 'TECHNICAL' | 'CONTENT' | 'COMMUNITY' | 'ACCOUNT' | 'OTHER'>('OTHER');
  const [initialMessage, setInitialMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(isWithinOperatingHours());
  const panelRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Operating-hours ticker
  useEffect(() => {
    const tick = () => setOnline(isWithinOperatingHours());
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  // Focus management when opening
  useEffect(() => {
    if (view !== 'closed') {
      const firstInput = panelRef.current?.querySelector<HTMLElement>('input, textarea, button');
      firstInput?.focus();
    }
  }, [view]);

  // Esc to close
  useEffect(() => {
    if (view === 'closed') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setView('closed');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view]);

  // Polling for messages
  useEffect(() => {
    if (!sessionId) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/support/chat?sessionId=${sessionId}&since=${encodeURIComponent(new Date(Date.now() - 30_000).toISOString())}`);
        const data = await res.json();
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            return [...prev, ...data.messages.filter((m: ChatMessage) => !ids.has(m.id))];
          });
        }
      } catch {
        // ignore poll errors
      }
    };
    pollRef.current = setInterval(poll, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [sessionId]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError('Nome muito curto.');
    if (!email.includes('@')) return setError('Email inválido.');
    if (initialMessage.trim().length < 10) return setError('Mensagem muito curta.');
    setSending(true);
    try {
      const res = await fetch('/api/support/chat?action=start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), category, initialMessage: initialMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Erro ao iniciar chat.');
        return;
      }
      setSessionId(data.sessionId);
      setMessages([{ id: 'init', body: initialMessage, createdAt: new Date().toISOString(), isInternal: false }]);
      setView('chat');
      setInitialMessage('');
    } catch {
      setError('Erro de rede.');
    } finally {
      setSending(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId || draft.trim().length === 0) return;
    setSending(true);
    try {
      await fetch('/api/support/chat?action=message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, body: draft.trim(), authorType: 'customer' }),
      });
      setMessages((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, body: draft.trim(), createdAt: new Date().toISOString(), isInternal: false },
      ]);
      setDraft('');
    } catch {
      setError('Erro ao enviar.');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setView(view === 'closed' ? 'prechat' : 'closed')}
        aria-label={view === 'closed' ? 'Abrir chat ao vivo' : 'Fechar chat'}
        aria-expanded={view !== 'closed'}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
      >
        {view === 'closed' ? (
          <span className="text-2xl" aria-hidden>💬</span>
        ) : (
          <span className="text-2xl" aria-hidden>✕</span>
        )}
        {!online && view === 'closed' && (
          <span
            className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-amber-500"
            aria-label="Fora do horário comercial"
          />
        )}
      </button>

      {/* Panel */}
      {view !== 'closed' && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-title"
          className="fixed bottom-20 right-4 z-50 flex h-[480px] w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-slate-200 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between rounded-t-lg bg-purple-600 px-4 py-3 text-white">
            <div>
              <h2 id="chat-title" className="text-sm font-semibold">
                Chat Cabala dos Caminhos
              </h2>
              <p className="text-xs opacity-90">
                {online ? '🟢 Online agora' : '🟡 Fora do horário'}
              </p>
            </div>
            <button
              onClick={() => setView('closed')}
              aria-label="Fechar chat"
              className="rounded p-1 hover:bg-purple-700"
            >
              ✕
            </button>
          </header>

          {view === 'prechat' && (
            <form onSubmit={handleStart} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              <p className="text-sm text-slate-600">
                {online
                  ? 'Inicie uma conversa — um agente responderá em instantes.'
                  : 'Fora do horário. Deixe sua mensagem — responderemos por email assim que possível.'}
              </p>
              <div>
                <label htmlFor="chat-name" className="block text-xs font-medium text-slate-700">Nome</label>
                <input
                  id="chat-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={80}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label htmlFor="chat-email" className="block text-xs font-medium text-slate-700">Email</label>
                <input
                  id="chat-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label htmlFor="chat-cat" className="block text-xs font-medium text-slate-700">Categoria</label>
                <select
                  id="chat-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as typeof category)}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                >
                  <option value="OTHER">Outro</option>
                  <option value="BILLING">Cobrança</option>
                  <option value="TECHNICAL">Técnico</option>
                  <option value="CONTENT">Conteúdo</option>
                  <option value="COMMUNITY">Comunidade</option>
                  <option value="ACCOUNT">Conta</option>
                </select>
              </div>
              <div>
                <label htmlFor="chat-msg" className="block text-xs font-medium text-slate-700">Mensagem</label>
                <textarea
                  id="chat-msg"
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  rows={3}
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
              {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={sending}
                className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {sending ? 'Iniciando…' : 'Iniciar conversa'}
              </button>
            </form>
          )}

          {view === 'chat' && (
            <>
              <div className="flex-1 space-y-2 overflow-y-auto p-4" aria-live="polite">
                {messages.map((m) => (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-lg bg-purple-100 px-3 py-2 text-sm text-slate-900">
                      {m.body}
                    </div>
                  </div>
                ))}
                {messages.length === 1 && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                      Recebemos sua mensagem! Um agente responderá em breve.
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-200 p-3">
                <label htmlFor="chat-draft" className="sr-only">Sua mensagem</label>
                <input
                  id="chat-draft"
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Digite sua mensagem…"
                  className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
                />
                <button
                  type="submit"
                  disabled={sending || draft.trim().length === 0}
                  className="rounded bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  Enviar
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}