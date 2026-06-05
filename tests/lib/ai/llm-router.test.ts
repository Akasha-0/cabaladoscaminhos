import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLlmConfig, generateCompletion, streamCompletion } from '@/lib/ai/llm-router';
import { prisma } from '@/lib/prisma';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';

// Mock operator session
vi.mock('@/lib/auth/operator-session', () => ({
  getOperatorFromServerContext: vi.fn(),
  requireOperator: vi.fn(),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    operatorLlmSetting: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock OpenAI constructible class
const mockCreate = vi.fn();
const mockConstructor = vi.fn();
vi.mock('openai', () => {
  class MockOpenAI {
    apiKey: string;
    baseURL?: string;
    constructor(config: { apiKey: string; baseURL?: string }) {
      this.apiKey = config.apiKey;
      this.baseURL = config.baseURL;
      mockConstructor(config);
    }
    chat = {
      completions: {
        create: mockCreate,
      },
    };
  }
  return {
    default: MockOpenAI,
    OpenAI: MockOpenAI,
  };
});

describe('llm-router - Configuration & Fallbacks', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uses env fallbacks when operator has no custom settings', async () => {
    vi.mocked(getOperatorFromServerContext).mockResolvedValue({ id: 'op-1' } as any);
    vi.mocked(prisma.operatorLlmSetting.findUnique).mockResolvedValue(null);

    process.env.LLM_PROVIDER = 'minimax';
    process.env.MINIMAX_API_TOKEN = 'env-minimax-key';
    process.env.MINIMAX_MODEL = 'minimax/m3-env';

    const config = await getLlmConfig('op-1');
    expect(config.provider).toBe('minimax');
    expect(config.minimaxKey).toBe('env-minimax-key');
    expect(config.minimaxModel).toBe('minimax/m3-env');
    expect(config.openaiModel).toBe('gpt-4o'); // Default
  });

  it('loads operator LLM settings from database', async () => {
    vi.mocked(getOperatorFromServerContext).mockResolvedValue({ id: 'op-1' } as any);
    vi.mocked(prisma.operatorLlmSetting.findUnique).mockResolvedValue({
      operatorId: 'op-1',
      provider: 'local',
      localEndpoint: 'http://my-local-llama:11434/v1',
      localModel: 'llama-3',
    } as any);

    const config = await getLlmConfig('op-1');
    expect(config.provider).toBe('local');
    expect(config.localEndpoint).toBe('http://my-local-llama:11434/v1');
    expect(config.localModel).toBe('llama-3');
  });
});

describe('llm-router - Completion Execution', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('calls OpenAI sdk when provider is openai', async () => {
    vi.mocked(getOperatorFromServerContext).mockResolvedValue({ id: 'op-1' } as any);
    vi.mocked(prisma.operatorLlmSetting.findUnique).mockResolvedValue({
      provider: 'openai',
      openaiKey: 'key-123',
      openaiModel: 'gpt-4o-custom',
    } as any);

    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'Mística resposta' } }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });

    const result = await generateCompletion({
      messages: [{ role: 'user', content: 'Olá' }],
    }, 'op-1');

    expect(mockConstructor).toHaveBeenCalledWith({ apiKey: 'key-123', baseURL: undefined });
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-4o-custom',
      messages: [{ role: 'user', content: 'Olá' }],
      temperature: 0.7,
      max_tokens: 1000,
    });
    expect(result.content).toBe('Mística resposta');
    expect(result.usage?.total_tokens).toBe(30);
  });

  it('routes to custom endpoint when provider is local', async () => {
    vi.mocked(getOperatorFromServerContext).mockResolvedValue({ id: 'op-1' } as any);
    vi.mocked(prisma.operatorLlmSetting.findUnique).mockResolvedValue({
      provider: 'local',
      localEndpoint: 'http://localhost:11434/v1',
      localModel: 'llama-local',
    } as any);

    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'Resposta local' } }],
      usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 },
    });

    await generateCompletion({
      messages: [{ role: 'user', content: 'Olá' }],
    }, 'op-1');

    expect(mockConstructor).toHaveBeenCalledWith({ apiKey: 'local', baseURL: 'http://localhost:11434/v1' });
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'llama-local',
      messages: [{ role: 'user', content: 'Olá' }],
      temperature: 0.7,
      max_tokens: 1000,
    });
  });

  it('calls Minimax REST API v2 when provider is minimax', async () => {
    vi.mocked(getOperatorFromServerContext).mockResolvedValue({ id: 'op-1' } as any);
    vi.mocked(prisma.operatorLlmSetting.findUnique).mockResolvedValue({
      provider: 'minimax',
      minimaxKey: 'mini-key',
      minimaxModel: 'minimax/m3-custom',
    } as any);

    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Resposta Minimax' } }],
        usage: { prompt_tokens: 15, completion_tokens: 25, total_tokens: 40 },
      }),
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as any);

    const result = await generateCompletion({
      messages: [{ role: 'user', content: 'Olá' }],
    }, 'op-1');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.minimaxi.chat/v1/text/chatcompletion_v2',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mini-key',
        },
      })
    );
    expect(result.content).toBe('Resposta Minimax');
  });

  it('calls Anthropic REST API when provider is anthropic', async () => {
    vi.mocked(getOperatorFromServerContext).mockResolvedValue({ id: 'op-1' } as any);
    vi.mocked(prisma.operatorLlmSetting.findUnique).mockResolvedValue({
      provider: 'anthropic',
      anthropicKey: 'claude-key',
      anthropicModel: 'claude-3-custom',
    } as any);

    const mockResponse = {
      ok: true,
      json: async () => ({
        content: [{ text: 'Resposta Claude' }],
        usage: { input_tokens: 8, output_tokens: 12 },
      }),
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as any);

    const result = await generateCompletion({
      messages: [
        { role: 'system', content: 'Prompt sistema' },
        { role: 'user', content: 'Olá' },
      ],
    }, 'op-1');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'x-api-key': 'claude-key',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-custom',
          messages: [{ role: 'user', content: 'Olá' }],
          system: 'Prompt sistema',
          max_tokens: 1000,
          temperature: 0.7,
        }),
      })
    );
    expect(result.content).toBe('Resposta Claude');
  });

  it('calls Gemini when provider is gemini', async () => {
    vi.mocked(getOperatorFromServerContext).mockResolvedValue({ id: 'op-1' } as any);
    vi.mocked(prisma.operatorLlmSetting.findUnique).mockResolvedValue({
      provider: 'gemini',
      geminiKey: 'gemini-key-123',
      geminiModel: 'gemini-1.5-pro-custom',
    } as any);

    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'Resposta Gemini' } }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });

    const result = await generateCompletion({
      messages: [{ role: 'user', content: 'Olá' }],
    }, 'op-1');

    expect(mockConstructor).toHaveBeenCalledWith({ apiKey: 'gemini-key-123', baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai' });
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gemini-1.5-pro-custom',
      messages: [{ role: 'user', content: 'Olá' }],
      temperature: 0.7,
      max_tokens: 1000,
    });
    expect(result.content).toBe('Resposta Gemini');
  });

  it('calls Groq when provider is groq', async () => {
    vi.mocked(getOperatorFromServerContext).mockResolvedValue({ id: 'op-1' } as any);
    vi.mocked(prisma.operatorLlmSetting.findUnique).mockResolvedValue({
      provider: 'groq',
      groqKey: 'groq-key-123',
      groqModel: 'llama-custom',
    } as any);

    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'Resposta Groq' } }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });

    const result = await generateCompletion({
      messages: [{ role: 'user', content: 'Olá' }],
    }, 'op-1');

    expect(mockConstructor).toHaveBeenCalledWith({ apiKey: 'groq-key-123', baseURL: 'https://api.groq.com/openai/v1' });
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'llama-custom',
      messages: [{ role: 'user', content: 'Olá' }],
      temperature: 0.7,
      max_tokens: 1000,
    });
    expect(result.content).toBe('Resposta Groq');
  });

  it('calls DeepSeek when provider is deepseek', async () => {
    vi.mocked(getOperatorFromServerContext).mockResolvedValue({ id: 'op-1' } as any);
    vi.mocked(prisma.operatorLlmSetting.findUnique).mockResolvedValue({
      provider: 'deepseek',
      deepseekKey: 'ds-key-123',
      deepseekModel: 'deepseek-chat-custom',
    } as any);

    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'Resposta DeepSeek' } }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });

    const result = await generateCompletion({
      messages: [{ role: 'user', content: 'Olá' }],
    }, 'op-1');

    expect(mockConstructor).toHaveBeenCalledWith({ apiKey: 'ds-key-123', baseURL: 'https://api.deepseek.com/v1' });
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'deepseek-chat-custom',
      messages: [{ role: 'user', content: 'Olá' }],
      temperature: 0.7,
      max_tokens: 1000,
    });
    expect(result.content).toBe('Resposta DeepSeek');
  });

  it('calls OpenRouter when provider is openrouter', async () => {
    vi.mocked(getOperatorFromServerContext).mockResolvedValue({ id: 'op-1' } as any);
    vi.mocked(prisma.operatorLlmSetting.findUnique).mockResolvedValue({
      provider: 'openrouter',
      openrouterKey: 'or-key-123',
      openrouterModel: 'or-model-custom',
    } as any);

    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'Resposta OpenRouter' } }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });

    const result = await generateCompletion({
      messages: [{ role: 'user', content: 'Olá' }],
    }, 'op-1');

    expect(mockConstructor).toHaveBeenCalledWith({ apiKey: 'or-key-123', baseURL: 'https://openrouter.ai/api/v1' });
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'or-model-custom',
      messages: [{ role: 'user', content: 'Olá' }],
      temperature: 0.7,
      max_tokens: 1000,
    });
    expect(result.content).toBe('Resposta OpenRouter');
  });
});

describe('llm-router - Streaming Execution', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('streams OpenAI tokens using async generators', async () => {
    vi.mocked(getOperatorFromServerContext).mockResolvedValue({ id: 'op-1' } as any);
    vi.mocked(prisma.operatorLlmSetting.findUnique).mockResolvedValue({
      provider: 'openai',
      openaiKey: 'key-123',
      openaiModel: 'gpt-4o',
    } as any);

    // Mock async iterator return for chat.completions.create
    const mockAsyncIterator = {
      async *[Symbol.asyncIterator]() {
        yield { choices: [{ delta: { content: 'Ramiro ' } }] };
        yield { choices: [{ delta: { content: 'revela...' } }] };
      },
    };
    mockCreate.mockResolvedValueOnce(mockAsyncIterator);

    const chunks = [];
    for await (const chunk of streamCompletion({
      messages: [{ role: 'user', content: 'Olá' }],
    }, 'op-1')) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual([
      { content: 'Ramiro ', done: false },
      { content: 'revela...', done: false },
      { content: '', done: true },
    ]);
  });

  it('streams Anthropic token events using readable streams', async () => {
    vi.mocked(getOperatorFromServerContext).mockResolvedValue({ id: 'op-1' } as any);
    vi.mocked(prisma.operatorLlmSetting.findUnique).mockResolvedValue({
      provider: 'anthropic',
      anthropicKey: 'claude-key',
      anthropicModel: 'claude-3',
    } as any);

    // Mock Response body reader
    const sseChunks = [
      'data: {"type": "content_block_delta", "delta": {"text": "Ape"}}\n',
      'data: {"type": "content_block_delta", "delta": {"text": "nas isso"}}\n',
    ];

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        sseChunks.forEach((c) => controller.enqueue(encoder.encode(c)));
        controller.close();
      },
    });

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      body: readable,
    } as any);

    const chunks = [];
    for await (const chunk of streamCompletion({
      messages: [{ role: 'user', content: 'Olá' }],
    }, 'op-1')) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual([
      { content: 'Ape', done: false },
      { content: 'nas isso', done: false },
      { content: '', done: true },
    ]);
  });
});
