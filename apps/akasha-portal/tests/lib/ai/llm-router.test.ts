import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLlmConfig, generateCompletion } from '@/lib/ai/llm-router';

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

describe('llm-router', () => {
  const originalEnv = process.env;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    process.env = originalEnv;
  });

  it('getLlmConfig lê provider e modelos do env', async () => {
    process.env.LLM_PROVIDER = 'minimax';
    process.env.MINIMAX_API_TOKEN = 'env-minimax-key';
    process.env.MINIMAX_MODEL = 'minimax/m3-env';

    const config = await getLlmConfig();
    expect(config.provider).toBe('minimax');
    expect(config.minimaxKey).toBe('env-minimax-key');
    expect(config.minimaxModel).toBe('minimax/m3-env');
    expect(config.openaiModel).toBe('gpt-4o');
  });

  it('generateCompletion usa OpenAI quando provider=openai', async () => {
    process.env.LLM_PROVIDER = 'openai';
    process.env.OPENAI_API_KEY = 'env-openai-key';
    process.env.OPENAI_MODEL = 'gpt-4o-mini';

    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'ok' } }],
      usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 },
    });

    const result = await generateCompletion({
      messages: [{ role: 'user', content: 'ping' }],
      temperature: 0.1,
      max_tokens: 10,
    });

    expect(result.content).toBe('ok');
    expect(result.model).toBe('gpt-4o-mini');
    expect(mockConstructor).toHaveBeenCalledWith({ apiKey: 'env-openai-key', baseURL: undefined });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        max_tokens: 10,
      })
    );
  });
});

