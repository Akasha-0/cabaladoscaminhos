import React, { useState, useEffect, useCallback } from 'react';
import { Text, Box } from 'ink';
import { MentorEngine } from '../mentor';
import { formatMapsSummary } from '../maps';
import type { UserMaps } from '../types';

interface MentorCLIProps {
  apiUrl?: string;
  userId?: string;
  maps?: UserMaps | null;
  onExit?: () => void;
}

type CLIState = 'loading' | 'chat' | 'error';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export const MentorCLI: React.FC<MentorCLIProps> = ({ 
  apiUrl = 'http://localhost:3000/api/mentor',
  userId, 
  maps = null,
  onExit 
}) => {
  const [state, setState] = useState<CLIState>('loading');
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const mentor = new MentorEngine();

  useEffect(() => {
    initializeChat();
  }, []);

  function initializeChat() {
    try {
      // Mensagem de boas-vindas
      setMessages([{
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: '🔮 Bem-vindo ao Akáshico - seu Mentor Espiritual!\n\nEstou aqui para guiá-lo através dos caminhos da sabedoria ancestral. Como posso iluminá-lo hoje?',
        timestamp: Date.now(),
      }]);
      setState('chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setState('error');
    }
  }

  const handleSubmit = useCallback(async (input: string) => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      const response = await mentor.ask(input, { userId });
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Não foi possível processar sua pergunta. Tente novamente.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [mentor, userId]);

  if (state === 'loading') {
    return (
      <Box>
        <Text>Conectando-se ao Akáshico...</Text>
      </Box>
    );
  }

  if (state === 'error') {
    return (
      <Box flexDirection="column">
        <Text color="red" bold>✖ Erro de Conexão</Text>
        <Text color="red">{error}</Text>
        <Text dimColor>Pressione qualquer tecla para tentar novamente...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
        <Text bold color="cyan">🔮 Akáshico — Mentor Espiritual</Text>
      </Box>

      {/* Maps Summary */}
      {maps && (
        <Box flexDirection="column" marginBottom={1}>
          <Text dimColor>{formatMapsSummary(maps)}</Text>
        </Box>
      )}

      {/* Messages */}
      <Box flexDirection="column" flexGrow={1} marginBottom={1}>
        {messages.map(msg => (
          <Box key={msg.id} flexDirection="column" marginBottom={1}>
            <Text bold color={msg.role === 'user' ? 'green' : 'magenta'}>
              {msg.role === 'user' ? '► Você:' : '🔮 Akáshico:'}
            </Text>
            <Text>{msg.content}</Text>
          </Box>
        ))}
        
        {isTyping && (
          <Box flexDirection="column">
            <Text dimColor>Pensando...</Text>
          </Box>
        )}
      </Box>

      {/* Input Area */}
      <Box flexDirection="column" borderStyle="single" borderColor="gray" padding={1}>
        <Text dimColor>Digite sua pergunta ou 'sair' para encerrar</Text>
      </Box>
    </Box>
  );
};

// Expose handleSubmit para uso externo
export function createMentorCLI(props: MentorCLIProps) {
  return MentorCLI;
}
