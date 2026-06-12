// Ollama Provider — Local LLM via Ollama API

import type { LLMProvider } from './index';

const OLLAMA_DEFAULT_URL = 'http://localhost:11434';
const OLLAMA_DEFAULT_MODEL = 'llama3';

export class OllamaProvider implements LLMProvider {
  readonly name = 'ollama' as const;
  readonly model: string;
  readonly baseUrl: string;

  constructor(baseUrl?: string, model?: string) {
    this.baseUrl = baseUrl ?? OLLAMA_DEFAULT_URL;
    this.model = model ?? OLLAMA_DEFAULT_MODEL;
  }

  async check(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  async *stream(prompt: string, systemPrompt?: string): AsyncIterable<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Ollama response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              yield data.message.content;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    const chunks: string[] = [];

    for await (const chunk of this.stream(prompt, systemPrompt)) {
      chunks.push(chunk);
    }

    return chunks.join('');
  }
}
