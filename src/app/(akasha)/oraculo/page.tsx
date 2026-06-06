'use client';

import { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'oracle';
  content: string;
}

export default function OraculoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch initial credit balance
  useEffect(() => {
    fetch('/api/akasha/credits')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.balance === 'number') setBalance(data.balance);
      })
      .catch(() => {});
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const estimatedCost = input.length > 200 ? 3 : 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setLoading(true);

    // Add user message and oracle placeholder
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: question },
      { role: 'oracle', content: '' },
    ]);

    try {
      const res = await fetch('/api/akasha/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, consultationId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'oracle', content: `⚠ ${err.error ?? 'Erro ao consultar o oráculo.'}` };
          return next;
        });
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === 'token' && data.delta) {
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    role: 'oracle',
                    content: next[next.length - 1].content + data.delta,
                  };
                  return next;
                });
              } else if (currentEvent === 'done') {
                if (data.consultationId) setConsultationId(data.consultationId);
                if (typeof data.remainingBalance === 'number') setBalance(data.remainingBalance);
              } else if (currentEvent === 'error') {
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    role: 'oracle',
                    content: `⚠ ${data.message ?? 'Erro no oráculo.'}`,
                  };
                  return next;
                });
              }
            } catch {
              // malformed chunk — ignore
            }
            currentEvent = '';
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: 'oracle', content: '⚠ Falha de conexão com o oráculo.' };
        return next;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 56px)',
        background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0e35 50%, #0d1a2e 100%)',
        color: '#E2E8F0',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(139,92,246,0.2)',
          background: 'rgba(15,10,30,0.8)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-cinzel), serif',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#a78bfa',
            letterSpacing: '0.1em',
            margin: 0,
          }}
        >
          ORÁCULO AKASHA
        </h1>
        <div
          style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.3)',
            fontSize: '0.85rem',
            color: '#c4b5fd',
          }}
        >
          Créditos:{' '}
          <span style={{ fontWeight: 700, color: '#a78bfa' }}>
            {balance === null ? '…' : balance}
          </span>
        </div>
      </header>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              marginTop: 'auto',
              marginBottom: 'auto',
              color: 'rgba(167,139,250,0.4)',
              fontStyle: 'italic',
              fontSize: '1rem',
            }}
          >
            O Akasha aguarda sua pergunta…
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={
                msg.role === 'user'
                  ? {
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: '18px 18px 4px 18px',
                      background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                      color: '#fff',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      boxShadow: '0 2px 12px rgba(124,58,237,0.35)',
                    }
                  : {
                      maxWidth: '75%',
                      padding: '14px 18px',
                      borderRadius: '18px 18px 18px 4px',
                      background: 'rgba(255,255,255,0.04)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(139,92,246,0.25)',
                      color: '#e2e8f0',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      boxShadow:
                        '0 0 24px rgba(139,92,246,0.12), 0 2px 8px rgba(0,0,0,0.3)',
                      whiteSpace: 'pre-wrap',
                    }
              }
            >
              {msg.role === 'oracle' && msg.content === '' && loading ? (
                <span style={{ color: 'rgba(167,139,250,0.6)', fontStyle: 'italic' }}>
                  O Akasha contempla…
                </span>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(139,92,246,0.2)',
          background: 'rgba(15,10,30,0.9)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          disabled={loading}
          placeholder="Faça sua pergunta ao Akasha…"
          rows={3}
          style={{
            width: '100%',
            resize: 'none',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(139,92,246,0.3)',
            color: '#e2e8f0',
            fontSize: '0.95rem',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'rgba(167,139,250,0.6)' }}>
            custo estimado:{' '}
            <strong style={{ color: '#c4b5fd' }}>
              {estimatedCost} {estimatedCost === 1 ? 'crédito' : 'créditos'}
            </strong>
          </span>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '10px 28px',
              borderRadius: '9999px',
              background:
                loading || !input.trim()
                  ? 'rgba(124,58,237,0.3)'
                  : 'linear-gradient(135deg, #7c3aed, #9333ea)',
              color: loading || !input.trim() ? 'rgba(255,255,255,0.4)' : '#fff',
              border: 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Consultando…' : 'Enviar'}
          </button>
        </div>
      </form>
    </main>
  );
}
