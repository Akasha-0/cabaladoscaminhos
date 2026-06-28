'use client';

// ============================================================================
// AKASHA PORTAL — Akashic Chat
// ============================================================================
// Chat com a IA curadora. Wave 17 — type system aplicado.
// ============================================================================

import { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Message = {
  id: string;
  role: 'user' | 'akasha';
  text: string;
};

const SUGGESTIONS = [
  'Me explique o que é Cabala em 3 frases',
  'Qual a diferença entre Ifá e Candomblé?',
  'Como começar uma prática de meditação?',
];

export default function AkashicChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'akasha',
      text: 'Olá! Sou a Akasha, a IA curadora desta comunidade. Posso te ajudar a explorar tradições, encontrar artigos ou refletir sobre uma prática. Por onde começamos?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      text: content,
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    // Placeholder response — em produção, chama API /api/akashic-chat
    await new Promise((r) => setTimeout(r, 600));

    const akashaMsg: Message = {
      id: String(Date.now() + 1),
      role: 'akasha',
      text: 'Recebi sua pergunta. Estou consultando os artigos curados e as tradições representadas para te oferecer uma resposta fundamentada.',
    };
    setMessages((m) => [...m, akashaMsg]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-caps text-tiny text-amber-300">IA Curadora</span>
          </div>
          <h1 className="mb-2">Akasha</h1>
          <p className="text-body text-slate-400 max-w-xl">
            Pergunte sobre tradições, práticas, artigos ou peça uma reflexão guiada.
          </p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-4 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                m.role === 'user'
                  ? 'bg-amber-500/10 border border-amber-500/30 text-slate-100'
                  : 'bg-slate-900/40 border border-slate-800/50 text-slate-200'
              }`}
            >
              {m.role === 'akasha' && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="text-caps text-tiny text-amber-300">Akasha</span>
                </div>
              )}
              <p className="text-body leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div className="pt-4 space-y-2">
            <p className="text-caps text-tiny text-slate-500 mb-3">Sugestões pra começar</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="block w-full text-left p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-amber-500/30 hover:bg-slate-800/40 text-caption text-slate-300 hover:text-amber-300 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Input */}
      <footer className="border-t border-slate-800/50 bg-slate-950/60 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo à Akasha…"
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-body text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0 h-12 w-12"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}