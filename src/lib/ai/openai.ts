import OpenAI from 'openai';
import type { AIResponse, ChatCompletionOptions, ChatMessage } from './types';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
const DEFAULT_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS || '1000', 10);
const DEFAULT_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7');

export async function createChatCompletion(
  options: ChatCompletionOptions
): Promise<AIResponse> {
  const messages = options.messages;
  const model = options.model || DEFAULT_MODEL;
  const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
  const max_tokens = options.max_tokens ?? DEFAULT_MAX_TOKENS;

  const completion = await getOpenAIClient().chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens,
  });

  const choice = completion.choices[0];

  return {
    content: choice.message.content || '',
    usage: completion.usage
      ? {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens,
        }
      : undefined,
    model,
  };
}

export async function sendMessage(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<AIResponse> {
  const allMessages: ChatMessage[] = [];

  if (systemPrompt) {
    allMessages.push({ role: 'system', content: systemPrompt });
  }

  allMessages.push(...messages);

  return createChatCompletion({ messages: allMessages });
}
