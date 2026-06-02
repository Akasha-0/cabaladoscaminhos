'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Brain, RefreshCw, Send, MessageSquare, Database, Cpu, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserData {
  nome: string;
  dataNascimento: string;
  horaNascimento?: string;
  localNascimento?: string;
  fullName?: string;
  caminhoDeVida?: number;
  signoSolar?: string;
  ascendente?: string;
  oduNascimento?: string;
  orixaRegente?: string;
}

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  source?: 'minimax-m3' | 'fallback';
  timestamp: string;
  knowledgeUsed?: number;
}

interface KBStats {
  entries: number;
  domains: number;
  byDomain: Record<string, number>;
}

interface SwarmChatWidgetProps {
  userData: UserData;
  className?: string;
}

// ============================================================
// SWARM CHAT WIDGET - Chat agêntico com IA + Knowledge Base
// ============================================================

// fallow-ignore-next-line complexity
export function SwarmChatWidget({ userData, className }: SwarmChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [kbStats, setKBStats] = useState<KBStats | null>(null);
  const [showKB, setShowKB] = useState(false);

  useEffect(() => {
    loadKBStats();
  }, []);

  const loadKBStats = async () => {
    try {
      const res = await fetch('/api/swarm/knowledge');
      const data = await res.json();
      setKBStats(data.stats);
    } catch (err) {
      console.error('Erro ao carregar KB stats:', err);
    }
  };

  const sendMessage = async (question?: string) => {
    const text = question || input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          user: userData,
          question: text,
          useAI: true,
        }),
      });

      if (!res.ok) throw new Error('Erro ao consultar IA');

      const data = await res.json();
      const agentMsg: ChatMessage = {
        role: 'agent',
        content: data.answer,
        source: data.source,
        timestamp: new Date().toISOString(),
        knowledgeUsed: data.knowledgeUsed,
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        source: 'fallback',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_QUESTIONS = [
    'O que devo fazer hoje para equilibrar minhas energias?',
    'O que meu Odu me ensina sobre prosperidade?',
    'Como melhorar minha sexualidade segundo meu mapa?',
    'Quais ervas podem me ajudar neste momento?',
    'O que meu caminho de vida 11 significa?',
  ];

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/95 via-violet-950/30 to-slate-950/95 backdrop-blur-sm border-violet-500/30 overflow-hidden flex flex-col',
      className
    )}>
      <CardHeader className="pb-3 border-b border-violet-500/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/30 to-amber-500/30 border border-violet-500/40 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <span className="text-base font-bold bg-gradient-to-r from-violet-300 to-amber-300 bg-clip-text text-transparent block">
                MAWARI
              </span>
              <span className="text-xs text-slate-400">Conselheiro Espiritual IA</span>
            </div>
          </CardTitle>

          {kbStats && (
            <button
              onClick={() => setShowKB(!showKB)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-colors"
            >
              <Database className="w-3 h-3" />
              <span className="text-xs font-medium">{kbStats.entries}</span>
            </button>
          )}
        </div>

        {showKB && kbStats && (
          <div className="mt-2 p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <p className="text-[10px] text-slate-400 mb-1">Knowledge Base ativa:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(kbStats.byDomain).slice(0, 8).map(([domain, count]) => (
                <span key={domain} className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  {domain}: {count}
                </span>
              ))}
              {Object.keys(kbStats.byDomain).length > 8 && (
                <span className="text-[9px] text-slate-500">+{Object.keys(kbStats.byDomain).length - 8}</span>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col gap-3 min-h-[300px] max-h-[500px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 text-center py-2">
                Pergunte ao MAWARI sobre qualquer aspecto do seu mapa espiritual
              </p>
              <div className="space-y-1.5">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/30 text-slate-300 hover:bg-slate-700/40 hover:border-violet-500/30 transition-all disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-xl p-3',
                  msg.role === 'user'
                    ? 'bg-violet-500/10 border border-violet-500/20 ml-8'
                    : 'bg-slate-800/40 border border-slate-700/30 mr-4'
                )}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm text-slate-200">{msg.content}</p>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Brain className="w-3 h-3 text-violet-400" />
                      <span className="text-[10px] text-violet-300 font-semibold">MAWARI</span>
                      {msg.source === 'minimax-m3' && (
                        <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300">M3</span>
                      )}
                      {msg.knowledgeUsed && msg.knowledgeUsed > 0 && (
                        <span className="text-[9px] text-slate-500">
                          📚 {msg.knowledgeUsed}
                        </span>
                      )}
                    </div>
                    <MarkdownContent content={msg.content} />
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Consultando {kbStats?.entries || '99'} entradas da KB + IA M3...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-end gap-2 pt-2 border-t border-slate-700/30">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Pergunte ao MAWARI..."
            rows={2}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/40 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 text-white hover:opacity-90 disabled:opacity-30 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const rendered: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      rendered.push(
        <h3 key={i} className="text-xs font-semibold text-amber-300 mt-2 mb-1 flex items-center gap-1">
          <span className="w-0.5 h-3 bg-amber-400 rounded" />
          {line.replace('## ', '')}
        </h3>
      );
    } else if (line.startsWith('### ')) {
      rendered.push(
        <h4 key={i} className="text-[11px] font-semibold text-violet-300 mt-1.5 mb-0.5">
          {line.replace('### ', '')}
        </h4>
      );
    } else if (line.startsWith('> ')) {
      rendered.push(
        <blockquote key={i} className="border-l-2 border-amber-400/40 pl-2 my-1 italic text-[11px] text-slate-300">
          {line.replace('> ', '')}
        </blockquote>
      );
    } else if (line.trim() === '') {
      // skip
    } else {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const processed = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-white font-semibold">{part.replace(/\*\*/g, '')}</strong>;
        }
        return <span key={j}>{part}</span>;
      });
      rendered.push(
        <p key={i} className="text-[11px] text-slate-300 leading-relaxed mb-1">
          {processed}
        </p>
      );
    }
  });

  return <div>{rendered}</div>;
}

// fallow-ignore-next-line unused-export
export default SwarmChatWidget;
