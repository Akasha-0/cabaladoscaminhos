// CLI Chat interface using Ink

import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export function MentorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [messageId, setMessageId] = useState(0);

  useEffect(() => {
    setMessages([{
      id: messageId,
      role: 'assistant',
      content: 'Welcome to Akasha Mentor. Ask me anything about your spiritual path.',
    }]);
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setMessageId(prev => prev + 1);

    // Placeholder response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: messageId + 1,
        role: 'assistant',
        content: `Processing: "${userMessage.content}"...`,
      }]);
      setMessageId(prev => prev + 2);
    }, 100);
  };

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" marginY={1}>
        {messages.map(msg => (
          <Box key={msg.id} flexDirection="column" marginY={0}>
            <Text bold color={msg.role === 'user' ? 'cyan' : 'green'}>
              {msg.role === 'user' ? 'You' : 'Mentor'}:
            </Text>
            <Text>{msg.content}</Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text bold color="yellow">Type your message and press Enter to submit</Text>
        <Text>Input: {input || '(empty)'}</Text>
        <Text dimColor>Note: This is a placeholder CLI interface</Text>
      </Box>
    </Box>
  );
}
