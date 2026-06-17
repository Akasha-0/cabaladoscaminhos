'use client';

import { useEffect, useRef, useState } from 'react';

interface OracleMessage {
  role: 'user' | 'oracle';
  content: string;
  pillarsConsulted?: string[];
}

const PILLAR_COLORS: Record<string, string> = {
  Botânica: '#2DD4BF',
  Odus: '#F0B429',
  Diagnóstico: '#FB5781',
  Astrologia: '#7C5CFF',
  Tarot: '#F0B429',
  Numerologia: '#2DD4BF',
  Chakras: '#FB5781',
  Kabala: '#7C5CFF',
};

function getPillarColor(pillar: string): string {
  return PILLAR_COLORS[pillar] ?? '#A7AECF';
}

export default function OraculoPage() {
  const [messages, setMessages] = useState<OracleMessage[]>([]);
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
    if (balance !== null && balance === 0) return;

    // Optimistic balance deduction
    if (balance !== null) setBalance((b) => (b !== null ? b - estimatedCost : null));

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
          next[next.length - 1] = {
            role: 'oracle',
            content: `⚠ ${err.error ?? 'Erro ao consultar o oráculo.'}`,
          };
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
                    pillarsConsulted: next[next.length - 1].pillarsConsulted,
                  };
                  return next;
                });
              } else if (currentEvent === 'done') {
                if (data.consultationId) setConsultationId(data.consultationId);
                if (typeof data.remainingBalance === 'number') setBalance(data.remainingBalance);
                if (Array.isArray(data.pillarsConsulted)) {
                  setMessages((prev) => {
                    const next = [...prev];
                    next[next.length - 1] = {
                      ...next[next.length - 1],
                      pillarsConsulted: data.pillarsConsulted as string[],
                    };
                    return next;
                  });
                }
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
        next[next.length - 1] = {
          role: 'oracle',
          content: '⚠ Falha de conexão com o oráculo.',
        };
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
        background: '#06070F',
        color: '#F4F5FF',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(124,92,255,0.2)',
          background: 'rgba(11,14,28,0.95)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-cinzel, serif)',
            fontSize: '1.3rem',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #7C5CFF 0%, #2DD4BF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.12em',
            margin: 0,
          }}
        >
          Oráculo Akasha
        </h1>
        <div
          style={{
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(124,92,255,0.1)',
            border: '1px solid rgba(124,92,255,0.3)',
            fontSize: '0.82rem',
            color: '#A7AECF',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ color: '#7C5CFF' }}>✦</span>
          <span>
            <span style={{ fontWeight: 700, color: '#F4F5FF' }}>
              {balance === null ? '…' : balance}
            </span>{' '}
            créditos
          </span>
        </div>
      </header>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Welcome state */}
        {messages.length === 0 && (
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              maxWidth: '520px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,92,255,0.3) 0%, rgba(45,212,191,0.1) 100%)',
                border: '1px solid rgba(124,92,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
              }}
            >
              <Sparkles size={24} style={{ color: '#9D86FF' }} />
            </div>
            <div
              style={{
                padding: '20px 28px',
                borderRadius: '16px',
                background: 'rgba(11,14,28,0.8)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(45,212,191,0.2)',
                boxShadow: '0 0 32px rgba(45,212,191,0.06)',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#A7AECF',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                }}
              >
                <span style={{ color: '#2DD4BF' }}>
                  O que você precisa compreender hoje?
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Nova consulta */}
        {messages.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setMessages([]); setInput(''); }}
              style={{
                padding: '6px 18px',
                borderRadius: '9999px',
                background: 'transparent',
                border: '1px solid rgba(124,92,255,0.3)',
                color: '#7C5CFF',
                fontSize: '0.8rem',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                transition: 'all 0.2s ease',
              }}
            >
              Nova consulta
            </button>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: '6px',
            }}
          >
            <div
              style={
                msg.role === 'user'
                  ? {
                      maxWidth: '68%',
                      padding: '12px 18px',
                      borderRadius: '18px 18px 4px 18px',
                      background: 'rgba(124,92,255,0.15)',
                      border: '1px solid rgba(124,92,255,0.3)',
                      color: '#F4F5FF',
                      fontSize: '0.95rem',
                      lineHeight: 1.65,
                    }
                  : {
                      maxWidth: '75%',
                      padding: '16px 20px',
                      borderRadius: '18px 18px 18px 4px',
                      background: 'rgba(11,14,28,0.8)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(45,212,191,0.2)',
                      color: '#F4F5FF',
                      fontSize: '0.95rem',
                      lineHeight: 1.75,
                      boxShadow: '0 0 24px rgba(45,212,191,0.06), 0 2px 8px rgba(0,0,0,0.4)',
                      whiteSpace: 'pre-wrap',
                    }
              }
            >
              {msg.role === 'oracle' && (
                <span
                  style={{
                    color: '#2DD4BF',
                    marginRight: '8px',
                    fontSize: '0.8rem',
                    verticalAlign: 'middle',
                  }}
                >
                  ✦
                </span>
              )}
              {msg.role === 'oracle' && msg.content === '' && loading ? (
                <span style={{ color: '#5C6691', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  O Akasha responde
                  <span style={{ display: 'inline-flex', gap: '3px' }}>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: '#5C6691',
                          animation: 'oraclePulse 1.2s ease-in-out infinite',
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </span>
                  <style>{`@keyframes oraclePulse { 0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); } 30% { opacity: 1; transform: scale(1); } }`}</style>
                </span>
              ) : (
                <span style={{ verticalAlign: 'middle' }}>{msg.content}</span>
              )}
            </div>

            {/* Tradições consultadas label + chips */}
            {msg.role === 'oracle' &&
              msg.pillarsConsulted &&
              msg.pillarsConsulted.length > 0 && (
                <>
                  <span style={{ fontSize: '0.75rem', color: '#5C6691', fontWeight: 500 }}>
                    Tradições que ressoaram
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '4px' }}>
                    {msg.pillarsConsulted.map((pillar) => {
                      const color = getPillarColor(pillar);
                      return (
                        <span
                          key={pillar}
                          style={{
                            padding: '2px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            color,
                            background: `${color}18`,
                            border: `1px solid ${color}40`,
                          }}
                        >
                          {pillar}
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(124,92,255,0.2)',
          background: 'rgba(11,14,28,0.95)',
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
          placeholder="Descreva sua situação ou faça uma pergunta…"
          rows={3}
          style={{
            width: '100%',
            resize: 'none',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(124,92,255,0.3)',
            color: '#F4F5FF',
            fontSize: '0.95rem',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            boxSizing: 'border-box',
            transition: 'border-color 0.2s ease',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: '#5C6691' }}>
            Isso usará{' '}
            <strong style={{ color: '#A7AECF' }}>
              {estimatedCost} {estimatedCost === 1 ? 'crédito' : 'créditos'}
            </strong>
          </span>
          <button
            type="submit"
            disabled={loading || !input.trim() || (balance !== null && balance === 0)}
            style={{
              padding: '10px 32px',
              borderRadius: '9999px',
              background:
                loading || !input.trim() || (balance !== null && balance === 0)
                  ? 'rgba(124,92,255,0.2)'
                  : '#7C5CFF',
              color: loading || !input.trim() || (balance !== null && balance === 0) ? '#5C6691' : '#F4F5FF',
              border: 'none',
              cursor: loading || !input.trim() || (balance !== null && balance === 0) ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              transition: 'all 0.2s ease',
              boxShadow: loading || !input.trim() || (balance !== null && balance === 0) ? 'none' : '0 0 20px rgba(124,92,255,0.4)',
            }}
          >
            {loading ? 'Consultando…' : 'Consultar'}
          </button>
        </div>
      </form>
    </main>
  );
}
