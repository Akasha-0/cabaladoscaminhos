'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Loader2,
  MessageSquare,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCheck,
  Moon,
  Sun,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface AIOracleChatProps {
  userData?: {
    id: string;
    nome: string;
    odu?: string;
    orixaRegente?: string;
    numeroPessoal?: number;
  };
  className?: string;
  onSendMessage?: (message: string) => Promise<string>;
  initialMessages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'insight' | 'guidance' | 'warning' | 'affirmation';
    source?: string;
  };
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// CONSTANTS
// ============================================================

const ORACLE_PERSONALITY = {
  name: 'Oráculo IA',
  greeting: 'Sou seu guia espiritual. Pergunte-me sobre seu caminho, insights ou orientações divinas.',
  systemPrompt: 'Você é um oráculo sábio e compassivo, guiando o usuário em sua jornada espiritual com base em sua numerologia, astrologia e tradição Ifá.',
};

const QUICK_PROMPTS = [
  { label: 'Meu destino hoje', prompt: 'O que o universo revela para mim hoje?' },
  { label: 'Proteção espiritual', prompt: 'Preciso de proteção espiritual, quais orações me ajudam?' },
  { label: 'Caminho de evolução', prompt: 'Como posso acelerar minha evolução espiritual?' },
  { label: 'Odu guidance', prompt: 'O que meu Odu revela sobre meu caminho atual?' },
];

const MESSAGE_COLORS = {
  user: 'bg-gradient-to-br from-purple-600/20 to-purple-500/10 border-purple-500/30',
  assistant: 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/30',
  system: 'bg-amber-500/10 border-amber-500/30',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-700/50 px-1 rounded">$1</code>')
    .replace(/\n/g, '<br />');
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface MessageBubbleProps {
  message: ChatMessage;
  onCopy?: () => void;
}

function MessageBubble({ message, onCopy }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'relative max-w-[80%] rounded-xl p-4 border',
        MESSAGE_COLORS[message.role]
      )}>
        <div className="flex items-center gap-2 mb-2">
          {isUser ? (
            <User className="w-4 h-4 text-purple-400" />
          ) : isSystem ? (
            <Sparkles className="w-4 h-4 text-amber-400" />
          ) : (
            <Bot className="w-4 h-4 text-blue-400" />
          )}
          <span className="text-xs text-slate-400">
            {isUser ? 'Você' : isSystem ? 'Sistema' : ORACLE_PERSONALITY.name}
          </span>
          <span className="text-xs text-slate-500 ml-auto">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        
        <div
          className="text-sm text-slate-200 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
        />
        
        {message.metadata?.type && (
          <div className="mt-2 flex items-center gap-1">
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              message.metadata.type === 'insight' && 'bg-blue-500/20 text-blue-400',
              message.metadata.type === 'guidance' && 'bg-emerald-500/20 text-emerald-400',
              message.metadata.type === 'warning' && 'bg-amber-500/20 text-amber-400',
              message.metadata.type === 'affirmation' && 'bg-purple-500/20 text-purple-400',
            )}>
              {message.metadata.type}
            </span>
          </div>
        )}
        
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1 rounded hover:bg-slate-700/50 transition-colors"
          >
            {copied ? (
              <CheckCheck className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

interface QuickPromptButtonProps {
  label: string;
  prompt: string;
  onClick: (prompt: string) => void;
}

function QuickPromptButton({ label, prompt, onClick }: QuickPromptButtonProps) {
  return (
    <button
      onClick={() => onClick(prompt)}
      className="px-3 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-full transition-colors"
    >
      {label}
    </button>
  );
}

interface TypingIndicatorProps {
  name?: string;
}

function TypingIndicator({ name = ORACLE_PERSONALITY.name }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-slate-400">
      <Bot className="w-4 h-4" />
      <span className="text-sm">{name} está digitando</span>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AIOracleChat({
  userData,
  className = '',
  onSendMessage,
  initialMessages = [],
}: AIOracleChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Add system greeting on mount
  useEffect(() => {
    if (messages.length === 0) {
      const greetingMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: `${ORACLE_PERSONALITY.greeting}${userData ? `\n\nVejo que você é ${userData.nome}, nascido sob a proteção de ${userData.orixaRegente || 'um orixá sagrado'}.` : ''}`,
        timestamp: new Date(),
        metadata: { type: 'guidance', source: 'system' },
      };
      setMessages([greetingMessage]);
    }
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let responseText = '';
      
      if (onSendMessage) {
        responseText = await onSendMessage(content);
      } else {
        // Simulated response for demo
        await new Promise(resolve => setTimeout(resolve, 1500));
        responseText = generateOracleResponse(content, userData);
      }

      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        metadata: { type: 'insight', source: 'oracle' },
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
        metadata: { type: 'warning', source: 'system' },
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [onSendMessage, isLoading, userData]);

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className={cn('bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden', className)}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{ORACLE_PERSONALITY.name}</h3>
            <p className="text-xs text-slate-400">Guiando sua jornada espiritual</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleClearChat(); }}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            title="Limpar conversa"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Chat Content */}
      {isExpanded && (
        <>
          {/* Messages Area */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-400 text-sm">Inicie uma conversa com o oráculo</p>
              </div>
            )}
            
            {messages.map(message => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={() => setCopiedMessageId(message.id)}
              />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" />
                <TypingIndicator />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map(({ label, prompt }) => (
              <QuickPromptButton
                key={label}
                label={label}
                prompt={prompt}
                onClick={handleQuickPrompt}
              />
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte ao oráculo..."
                className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-400 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                rows={1}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// ORACLE RESPONSE GENERATOR
// ============================================================

function generateOracleResponse(question: string, userData?: AIOracleChatProps['userData']): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('destino') || lowerQuestion.includes('hoje')) {
    return `**Insight do Dia** 🌟\n\nAs estrelas revelam que hoje é um dia propício para reflexões profundas. ${userData?.orixaRegente ? `Seu orixá regente ${userData.orixaRegente} oferece proteção especial.` : ''}\n\n*Permita-se momentos de silêncio e escuta interior.*`;
  }
  
  if (lowerQuestion.includes('proteção') || lowerQuestion.includes('oração')) {
    return `**Proteção Espiritual** 🛡️\n\nRecomendo repetir o mantra: *"Oxalá, guia meus passos na luz"*.\n\n${userData?.odu ? `Para seu Odu ${userData.odu}, a prática de offerings menores ao amanhecer fortalece sua conexão protetora.` : 'Pratique a meditação ao amanhecer para fortalecer seu campo energético.'}`;
  }
  
  if (lowerQuestion.includes('evolução') || lowerQuestion.includes('caminho')) {
    return `**Caminho de Evolução** ✨\n\n${userData?.numeroPessoal ? `Seu número pessoal ${userData.numeroPessoal} indica uma via de autoconhecimento profundo.` : 'Seu caminho aponta para o autoconhecimento.'}\n\n*As práticas de GRATIDÃO e HUMILDADE são catalisadores essenciais neste momento.*`;
  }
  
  if (lowerQuestion.includes('odu') || lowerQuestion.includes('ifá')) {
    return `**Guia Ifá** 🔮\n\n${userData?.odu ? `Odu ${userData.odu} revela profundos mistérios sobre sua jornada.` : 'A tradição Ifá guarda respostas ancestrais.'}\n\n*Consulte os Ikin (nozes de dendê) em momento de calma para receber orientações específicas.*`;
  }
  
  return `**Mensagem do Oráculo** 🌙\n\nOuvindo sua pergunta com atenção...\n\n${userData?.nome ? `Para ${userData.nome}, a resposta emerge das suas conexões energéticas.` : 'A resposta emerge das suas conexões energéticas.'}\n\n*Solicite uma pergunta mais específica para um insight direcionado.*`;
}

export default AIOracleChat;