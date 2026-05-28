'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCreditos } from '@/lib/hooks';
import { TemaChat, MensagemChat } from '@/lib/chat/types';
import {
  Sparkles,
  Send,
  RefreshCw,
  Loader2,
  Heart,
  Briefcase,
  Coins,
  Activity,
  Compass,
  Star,
  MoreHorizontal
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AssistenteEspiritualProps {
  temaInicial?: TemaChat;
}

// Quick questions organized by topic
const quickQuestions: Record<TemaChat, string[]> = {
  espiritualidade: [
    'Qual é meu propósito de vida segundo a Cabala?',
    'Como posso fortalecer minha conexão espiritual?',
    'Quais são os sinais de crescimento espiritual?',
  ],
  relacionamento: [
    'Como posso melhorar meus relacionamentos?',
    'Qual a energia do meu signo sobre amor?',
    'Como curar feridas emocionais?',
  ],
  trabalho: [
    'Qual caminho profissional é mais aligned comigo?',
    'Como manifestar abundância no trabalho?',
    'Quais habilidades devo desenvolver?',
  ],
  dinheiro: [
    'Como abrir-me para a prosperidade?',
    'Qual minha relação com a energia do dinheiro?',
    'Como equilibrar minha energia financeira?',
  ],
  saude: [
    'Como harmonizar meus chakras?',
    'Qual a conexão espiritual da minha saúde?',
    'Como manter equilíbrio mente-corpo?',
  ],
  proposito: [
    'Qual minha missão de vida?',
    'Como descobrir meu verdadeiro potencial?',
    'Quais lições estou aprendendo agora?',
  ],
  outros: [
    'O que o universo quer me dizer hoje?',
    'Como posso encontrar mais paz interior?',
    'Qual é meu caminho de evolução?',
  ],
};

const temaIcones: Record<TemaChat, React.ReactNode> = {
  espiritualidade: <Compass className="w-4 h-4" />,
  relacionamento: <Heart className="w-4 h-4" />,
  trabalho: <Briefcase className="w-4 h-4" />,
  dinheiro: <Coins className="w-4 h-4" />,
  saude: <Activity className="w-4 h-4" />,
  proposito: <Star className="w-4 h-4" />,
  outros: <MoreHorizontal className="w-4 h-4" />,
};

const temaLabels: Record<TemaChat, string> = {
  espiritualidade: 'Espiritualidade',
  relacionamento: 'Relacionamentos',
  trabalho: 'Carreira e Trabalho',
  dinheiro: 'Finanças e Prosperidade',
  saude: 'Saúde e Bem-estar',
  proposito: 'Propósito de Vida',
  outros: 'Outros Temas',
};

function formatMessage(content: string): string {
  // Convert markdown-like formatting to HTML-friendly output
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');
}

export function AssistenteEspiritual({ temaInicial = 'espiritualidade' }: AssistenteEspiritualProps) {
  useCreditos();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [tema, setTema] = useState<TemaChat>(temaInicial);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  async function handleSendMessage(messageText?: string) {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessageId = crypto.randomUUID();
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    // Add temporary assistant message for typing indicator
    const assistantMessageId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);

    try {
      const historico: MensagemChat[] = messages.map((m) => ({
        id: m.id,
        tipo: m.role === 'user' ? 'usuario' : 'assistente',
        conteudo: m.content,
        tema,
        timestamp: m.timestamp,
      }));

      const response = await fetch('/api/chat/mensagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta: text,
          tema,
          historico,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao processar mensagem');
      }

      const data = await response.json();

      // Update the assistant message with the response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: data.resposta }
            : msg
        )
      );
    } catch (err) {
      // Remove the temporary message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  function handleQuickQuestion(question: string) {
    handleSendMessage(question);
  }

  return (
    <Card className="bg-gradient-to-br from-violet-950/40 via-slate-900/80 to-indigo-950/40 border-violet-500/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <span className="bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
              Guia Espiritual
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            disabled={messages.length === 0}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Topic Selector */}
        <div className="flex flex-wrap gap-2 mt-3">
          {(Object.keys(temaLabels) as TemaChat[]).map((t) => (
            <button
              key={t}
              onClick={() => setTema(t)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                transition-all duration-200 border
                ${
                  tema === t
                    ? 'bg-gradient-to-r from-violet-500/30 to-indigo-500/30 border-violet-500/50 text-violet-200'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }
              `}
            >
              {temaIcones[t]}
              {temaLabels[t]}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Messages Area */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                  <Sparkles className="w-8 h-8 text-violet-400/70" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-300">
                    Como posso iluminar seu caminho hoje?
                  </p>
                  <p className="text-xs text-slate-500 max-w-[280px]">
                    Escolha um tema acima e faça uma pergunta, ou use as sugestões rápidas abaixo.
                  </p>
                </div>

                {/* Quick Questions */}
                <div className="w-full space-y-2">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    Sugestões Rápidas
                  </p>
                  <div className="flex flex-col gap-2">
                    {quickQuestions[tema].slice(0, 3).map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(question)}
                        disabled={isLoading}
                        className="
                          text-left px-3 py-2 rounded-lg text-xs
                          bg-slate-800/50 border border-slate-700/50
                          text-slate-400 hover:text-slate-200
                          hover:bg-slate-800 hover:border-slate-600
                          transition-all duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed
                        "
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`
                    max-w-[85%] rounded-2xl px-4 py-3 text-sm
                    ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-md'
                        : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-bl-md'
                    }
                  `}
                >
                  {message.role === 'assistant' && message.content === '' && isLoading ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Refletindo...</span>
                    </div>
                  ) : (
                    <div
                      className="prose prose-sm prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(message.content),
                      }}
                    />
                  )}
                  <div
                    className={`
                      text-[10px] mt-1 opacity-60
                      ${message.role === 'user' ? 'text-violet-200' : 'text-slate-500'}
                    `}
                  >
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}

            {error && (
              <div className="flex justify-center">
                <div className="px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2 items-end pt-2 border-t border-slate-800">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Faça sua pergunta..."
            className="min-h-[44px] max-h-[120px] resize-none bg-slate-800/50 border-slate-700/50 focus:border-violet-500/50"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[44px] w-[44px] shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Cada pergunta custa 2 créditos</span>
          {messages.length > 0 && (
            <span>{messages.filter((m) => m.role === 'user').length} pergunta{messages.filter((m) => m.role === 'user').length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
