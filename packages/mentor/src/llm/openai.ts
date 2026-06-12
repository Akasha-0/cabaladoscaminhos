import type { LLMProvider } from './index';

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai' as const;
  readonly model: string;
  private readonly apiKey: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model ?? 'gpt-4o-mini';
  }

  async *stream(prompt: string, systemPrompt?: string): AsyncIterable<string> {
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    if (!response.body) {
      throw new Error('OpenAI API response has no body');
    }

    const reader = response.body.getReader();
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
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          if (trimmed === 'data: [DONE]') return;

          const data = trimmed.slice(6);
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
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
