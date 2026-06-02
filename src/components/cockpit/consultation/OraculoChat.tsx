// src/components/cockpit/consultation/OraculoChat.tsx
// Orquestrador do chat Q&A (Doc 05 §9 + Doc 12 §8).
// POST /api/consult → SSE com eventos routing/token/done/error.

'use client';

import { Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ConsultationInput } from './ConsultationInput';
import { OracleBubble } from './OracleBubble';
import { RoutingChips } from './RoutingChips';
import { UserBubble } from './UserBubble';

// fallow-ignore-next-line unused-type
export interface ChatMessage {
  id: string;
  role: 'USER' | 'ORACLE';
  content: string;
  routedThemes?: string[];
  routedHouses?: number[];
  pending?: boolean;
}

interface OraculoChatProps {
  readingId: string;
  clientName: string;
}

interface RoutingPayload {
  themes: string[];
  houses: number[];
}

interface SsePayload {
  themes?: string[];
  houses?: number[];
  delta?: string;
  consultationId?: string;
  routedThemes?: string[];
  routedHouses?: number[];
  message?: string;
  fullAnswer?: string;
}

export function OraculoChat({ readingId, clientName }: OraculoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function applyUpdate(oracleId: string, updater: (msg: ChatMessage) => ChatMessage) {
    setMessages((m) => m.map((msg) => (msg.id === oracleId ? updater(msg) : msg)));
  }

  function appendRouting(routing: RoutingPayload) {
    // Anexa o routing à última mensagem ORACLE (que está pending)
    setMessages((m) => {
      const lastOracle = [...m].reverse().find((x) => x.role === 'ORACLE' && x.pending);
      if (!lastOracle) return m;
      return m.map((msg) =>
        msg.id === lastOracle.id
          ? { ...msg, routedThemes: routing.themes, routedHouses: routing.houses }
          : msg
      );
    });
  }

  function parseSseEvent(raw: string): { event: string; payload: SsePayload } | null {
    let event = 'message';
    let data = '';
    for (const line of raw.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data += line.slice(5).trim();
    }
    if (!data) return null;
    try {
      return { event, payload: JSON.parse(data) as SsePayload };
    } catch {
      return null;
    }
  }

// fallow-ignore-next-line complexity
  async function handleSend(question: string) {
    if (streaming) return;
    setError(null);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'USER',
      content: question,
    };
    const oracleId = `o-${Date.now()}`;
    setMessages((m) => [
      ...m,
      userMsg,
      { id: oracleId, role: 'ORACLE', content: '', pending: true },
    ]);
    setStreaming(true);

    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId, consultationId, question }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() ?? '';
        for (const chunk of chunks) {
          const parsed = parseSseEvent(chunk);
          if (!parsed) continue;
          const { event, payload } = parsed;

          if (event === 'routing' && payload.themes && payload.houses) {
            appendRouting({ themes: payload.themes, houses: payload.houses });
          } else if (event === 'token' && payload.delta) {
            accumulated += payload.delta;
            applyUpdate(oracleId, (msg) => ({ ...msg, content: accumulated, pending: true }));
          } else if (event === 'error' && payload.message) {
            setError(payload.message);
            applyUpdate(oracleId, (msg) => ({
              ...msg,
              content: accumulated + `\n\n*[Erro: ${payload.message}]*`,
              pending: false,
            }));
          } else if (event === 'done') {
            if (payload.consultationId) setConsultationId(payload.consultationId);
            applyUpdate(oracleId, (msg) => ({
              ...msg,
              content: accumulated,
              pending: false,
              routedThemes: payload.routedThemes,
              routedHouses: payload.routedHouses,
            }));
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao contatar o oráculo';
      setError(msg);
      applyUpdate(oracleId, (om) => ({ ...om, content: `*[Erro: ${msg}]*`, pending: false }));
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="text-center max-w-md">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-3 animate-pulse" />
            <h2 className="font-cinzel text-lg text-primary mb-2">
              Faça uma pergunta sobre esta leitura
            </h2>
            <p className="text-sm text-muted-foreground">
              O Oráculo responde a partir do que foi tirado para {clientName}, ancorado no dossiê e
              nos 4 mapas natais.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-3">
              Sugestões: &quot;E quanto à minha vida amorosa?&quot; · &quot;Devo aceitar a proposta
              de trabalho?&quot;
            </p>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) =>
          msg.role === 'USER' ? (
            <UserBubble key={msg.id} content={msg.content} />
          ) : (
            <div key={msg.id} className="space-y-2">
              <OracleBubble content={msg.content} pending={msg.pending} />
              {msg.routedHouses && msg.routedHouses.length > 0 && !msg.pending && (
                <RoutingChips themes={msg.routedThemes ?? []} houses={msg.routedHouses} />
              )}
            </div>
          )
        )}
      </div>

      {error && (
        <div className="mx-6 mb-2 p-2 rounded bg-destructive/10 border border-destructive/30 text-destructive text-xs">
          {error}
        </div>
      )}

      <ConsultationInput onSend={handleSend} disabled={streaming} />
    </div>
  );
}
