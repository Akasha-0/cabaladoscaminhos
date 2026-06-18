'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { UserMaps, MentorMessage, AskResponse } from '../types';

interface MentorChatProps {
  userId: string;
  maps: UserMaps;
  className?: string;
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function MentorChat({ userId, maps, className }: MentorChatProps) {
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [mapsMentioned, setMapsMentioned] = useState<string[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const question = input.trim();
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');
    setMapsMentioned([]);

    const userMessage: MentorMessage = {
      id: crypto.randomUUID(),
      userId,
      role: 'user',
      content: question,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/mentor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          userId,
          sessionHistory: messages,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullAnswer += chunk;
          setStreamingContent(fullAnswer);
        }
      }

      const data: AskResponse = {
        answer: fullAnswer,
        maps: mapsMentioned,
      };

      try {
        const parsed = JSON.parse(fullAnswer);
        if (parsed.answer) {
          data.answer = parsed.answer;
          data.maps = parsed.maps || [];
          data.confidence = parsed.confidence;
        }
      } catch {
        // Resposta em texto puro
      }

      const mentorMessage: MentorMessage = {
        id: crypto.randomUUID(),
        userId,
        role: 'mentor',
        content: data.answer,
        maps: data.maps,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, mentorMessage]);
      setMapsMentioned(data.maps || []);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const partialMessage: MentorMessage = {
          id: crypto.randomUUID(),
          userId,
          role: 'mentor',
          content: streamingContent || 'Resposta cancelada.',
          maps: mapsMentioned,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, partialMessage]);
      } else {
        console.error('Erro:', error);
        const errorMessage: MentorMessage = {
          id: crypto.randomUUID(),
          userId,
          role: 'mentor',
          content: 'Desculpe, ocorreu um erro. Tente novamente.',
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {streamingContent && (
          <MessageBubble
            message={{
              id: 'streaming',
              userId,
              role: 'mentor',
              content: streamingContent,
              createdAt: new Date(),
            }}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Faça sua pergunta ao Akáshico..."
            disabled={isStreaming}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-100"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={handleStop}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Parar
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: MentorMessage }) {
  return (
    <div className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 rounded-lg',
          message.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.maps && message.maps.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.maps.map((map, index) => (
              <span
                key={`${map}-${index}`}
                className="text-xs bg-white/20 dark:bg-black/20 px-2 py-1 rounded"
              >
                {map}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
