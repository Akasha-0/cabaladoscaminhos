import { render } from 'ink';
import React, { useState, useEffect } from 'react';
import { MentorCLI } from './MentorCLI';

export interface ChatOptions {
  apiUrl?: string;
  userId?: string;
  userToken?: string;
}

// Setup raw mode for stdin
function setupRawMode() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode?.(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
}

function cleanupRawMode() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode?.(false);
  }
}

// Componente Chat com input handling integrado
const ChatWithInput: React.FC<{ apiUrl: string; userId?: string }> = ({ apiUrl, userId }) => {
  const [inputBuffer, setInputBuffer] = useState('');

  useEffect(() => {
    setupRawMode();

    const handleInput = (chunk: Buffer) => {
      const key = chunk.toString();

      // Handle Ctrl+C
      if (key === '\x03') {
        cleanupRawMode();
        process.exit(0);
        return;
      }

      // Handle Enter
      if (key === '\r' || key === '\n') {
        const command = inputBuffer.trim();
        setInputBuffer('');

        if (command.toLowerCase() === 'sair') {
          cleanupRawMode();
          process.exit(0);
          return;
        }

        // Emit custom event for input submission
        if (command) {
          window.dispatchEvent(new CustomEvent('cli-input', { detail: command }));
        }
        return;
      }

      // Handle Backspace
      if (key === '\x7f' || key === '\b') {
        setInputBuffer((prev) => prev.slice(0, -1));
        return;
      }

      // Handle regular characters
      if (key.length === 1 && !key.startsWith('\x1b')) {
        setInputBuffer((prev) => prev + key);
      }
    };

    process.stdin.on('data', handleInput);

    return () => {
      process.stdin.removeListener('data', handleInput);
      cleanupRawMode();
    };
  }, [inputBuffer]);

  return <MentorCLI apiUrl={apiUrl} userId={userId} />;
};

export async function runChat(options: ChatOptions = {}) {
  const { apiUrl = 'http://localhost:3000/api/mentor', userId } = options;

  try {
    const instance = render(React.createElement(ChatWithInput, { apiUrl, userId }));

    await instance.waitUntilExit();
  } catch (err) {
    cleanupRawMode();
    console.error('Erro ao iniciar chat:', err);
    process.exit(1);
  }
}

// Exporta a função para uso como binário
export { runChat as default };
