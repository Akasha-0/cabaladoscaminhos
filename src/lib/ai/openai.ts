import OpenAI from 'openai';
import type { AIResponse, ChatCompletionOptions, ChatMessage } from './types';

// ============================================================
// CONFIGURATION
// ============================================================

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
const FALLBACK_MODEL = process.env.OPENAI_FALLBACK_MODEL || 'gpt-4o-mini';
// ANTHROPIC_MODEL: future support for Claude models via Anthropic API
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || '';
const DEFAULT_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS || '1000', 10);
const DEFAULT_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7');

// Retry configuration
const MAX_RETRIES = parseInt(process.env.OPENAI_MAX_RETRIES || '3', 10);
const INITIAL_DELAY_MS = parseInt(process.env.OPENAI_INITIAL_DELAY_MS || '1000', 10);
const MAX_DELAY_MS = parseInt(process.env.OPENAI_MAX_DELAY_MS || '30000', 10);
const RETRY_MULTIPLIER = parseFloat(process.env.OPENAI_RETRY_MULTIPLIER || '2.0');

// Circuit breaker configuration
const CIRCUIT_BREAKER_THRESHOLD = parseInt(process.env.OPENAI_CIRCUIT_THRESHOLD || '5', 10);
const CIRCUIT_BREAKER_TIMEOUT_MS = parseInt(process.env.OPENAI_CIRCUIT_TIMEOUT_MS || '60000', 10);

// ============================================================
// ERROR TYPES
// ============================================================

export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly isRetryable: boolean = true
  ) {
    super(message);
    this.name = 'AIError';
  }
}

class CircuitBreakerOpenError extends AIError {
  constructor() {
    super(
      'Circuit breaker is open - service temporarily unavailable',
      'CIRCUIT_BREAKER_OPEN',
      503,
      false
    );
    this.name = 'CircuitBreakerOpenError';
  }
}

class RateLimitError extends AIError {
  constructor(public readonly retryAfterMs?: number) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429, true);
    this.name = 'RateLimitError';
  }
}

// ============================================================
// CIRCUIT BREAKER
// ============================================================

interface CircuitState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

const circuitState: CircuitState = {
  failures: 0,
  lastFailureTime: 0,
  isOpen: false,
};

function shouldRetryAfterFailure(): boolean {
  const now = Date.now();

  if (circuitState.isOpen) {
    const timeSinceLastFailure = now - circuitState.lastFailureTime;
    if (timeSinceLastFailure > CIRCUIT_BREAKER_TIMEOUT_MS) {
      circuitState.isOpen = false;
      circuitState.failures = 0;
      return true;
    }
    return false;
  }

  return true;
}

function recordFailure(): void {
  circuitState.failures++;
  circuitState.lastFailureTime = Date.now();

  if (circuitState.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitState.isOpen = true;
    console.warn(`[OpenAI] Circuit breaker opened after ${circuitState.failures} failures`);
  }
}

function recordSuccess(): void {
  circuitState.failures = 0;
  circuitState.isOpen = false;
}

// ============================================================
// EXPONENTIAL BACKOFF
// ============================================================

async function sleep(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

function calculateBackoffDelay(attempt: number): number {
  const delay = INITIAL_DELAY_MS * Math.pow(RETRY_MULTIPLIER, attempt);
  const jitter = delay * 0.25 * (Math.random() - 0.5);
  return Math.min(delay + jitter, MAX_DELAY_MS);
}

// ============================================================
// CLIENT MANAGEMENT
// ============================================================

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

function resetOpenAIClient(): void {
  openaiClient = null;
}

// ============================================================
// STREAMS (for future streaming support)
// ============================================================

// ============================================================
// MAIN COMPLETION FUNCTION WITH RETRY & CIRCUIT BREAKER
// ============================================================

export interface RetryableError {
  message: string;
  statusCode?: number;
  code?: string;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof AIError) {
    return error.isRetryable;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const retryablePatterns = [
      'timeout',
      'network',
      'econnreset',
      'econnrefused',
      'socket',
      'fetch',
      'stream',
    ];

    if (retryablePatterns.some((p) => message.includes(p))) {
      return true;
    }

    const statusMatch = message.match(/status\s*(\d{3})/i);
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10);
      return status === 429 || (status >= 500 && status < 600);
    }
  }

  return false;
}

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const statusMatch = message.match(/status\s*(\d{3})/i);
    if (statusMatch) {
      return parseInt(statusMatch[1], 10) === 429;
    }
  }
  return false;
}

// ============================================================
// API PARAMETERS EXTRACTION
// ============================================================

interface ApiParams {
  model: string;
  temperature: number;
  max_tokens: number;
  useFallback: boolean;
}

function extractApiParams(options: ChatCompletionOptions): ApiParams {
  return {
    model: options.model || DEFAULT_MODEL,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: options.max_tokens ?? DEFAULT_MAX_TOKENS,
    useFallback: options.useFallback ?? false,
  };
}

// ============================================================
// RESPONSE TRANSFORMATION
// ============================================================

function transformResponse(completion: OpenAI.Chat.ChatCompletion): AIResponse {
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
    model: completion.model,
  };
}

// ============================================================
// ERROR TYPE DETECTION
// ============================================================

function detectApiErrorType(error: unknown, model: string): never {
  if (!(error instanceof Error)) {
    throw new AIError('Erro desconhecido na API OpenAI', 'UNKNOWN_ERROR', undefined, true);
  }

  const msg = error.message;

  if (msg.includes('401') || msg.includes('api key')) {
    throw new AIError('API key inválida ou não configurada', 'INVALID_API_KEY', 401, false);
  }
  if (msg.includes('403') || msg.includes('forbidden')) {
    throw new AIError('Acesso à API negado - verifique permissões', 'ACCESS_DENIED', 403, false);
  }
  if (msg.includes('429')) {
    throw new RateLimitError();
  }
  if (msg.includes('model')) {
    throw new AIError(`Modelo '${model}' não disponível`, 'MODEL_UNAVAILABLE', 400, false);
  }

  throw new AIError(msg, 'UNKNOWN_ERROR', undefined, true);
}

async function executeRetryOrThrow(
  error: unknown,
  options: ChatCompletionOptions,
  retryCount: number,
  useFallback: boolean
): Promise<AIResponse> {
  if (!isRetryableError(error)) {
    throw error;
  }

  const delay = calculateBackoffDelay(retryCount);
  const errorMsg = error instanceof Error ? error.message : String(error);

  console.warn(
    `[OpenAI] Request failed (attempt ${retryCount + 1}/${MAX_RETRIES + 1}), ` +
      `retrying in ${Math.round(delay)}ms: ${errorMsg}`
  );

  await sleep(delay);

  if (isRateLimitError(error)) {
    const rateLimitDelay = Math.min(delay * 2, MAX_DELAY_MS);
    console.info(`[OpenAI] Rate limited, waiting ${Math.round(rateLimitDelay)}ms before retry`);
    await sleep(rateLimitDelay);
  }

  const shouldUseFallback = retryCount === MAX_RETRIES - 1 && !useFallback;

  return createChatCompletion({ ...options, useFallback: shouldUseFallback }, retryCount + 1);
}

// ============================================================
// MAIN COMPLETION FUNCTION WITH RETRY & CIRCUIT BREAKER
// ============================================================

export async function createChatCompletion(
  options: ChatCompletionOptions,
  retryCount = 0
): Promise<AIResponse> {
  if (!shouldRetryAfterFailure()) {
    throw new CircuitBreakerOpenError();
  }
  const params = extractApiParams(options);
  const { model, temperature, max_tokens, useFallback } = params;
  const effectiveModel = useFallback ? FALLBACK_MODEL : model;

  try {
    const startMs = Date.now();
    const completion = await getOpenAIClient().chat.completions.create({
      model: effectiveModel,
      messages: options.messages,
      temperature,
      max_tokens,
    });
    recordSuccess();

    // Structured log: llm.call event (AD-22.6)
    const durationMs = Date.now() - startMs;
    const logEntry = {
      ts: new Date().toISOString(),
      level: 'info',
      event: 'llm.call',
      model: effectiveModel,
      temperature,
      max_tokens,
      promptTokens: completion.usage?.prompt_tokens,
      completionTokens: completion.usage?.completion_tokens,
      totalTokens: completion.usage?.total_tokens,
      durationMs,
      cached: false,
    };
    console.log(JSON.stringify(logEntry));

    return transformResponse(completion);
  } catch (error) {
    recordFailure();

    if (retryCount < MAX_RETRIES) {
      return await executeRetryOrThrow(error, options, retryCount, useFallback);
    }

    return detectApiErrorType(error, model);
  }
}

// ============================================================
// SEND MESSAGE WITH SYSTEM PROMPT
// ============================================================

async function sendMessage(messages: ChatMessage[], systemPrompt?: string): Promise<AIResponse> {
  const allMessages: ChatMessage[] = [];

  if (systemPrompt) {
    allMessages.push({ role: 'system', content: systemPrompt });
  }

  allMessages.push(...messages);

  return createChatCompletion({ messages: allMessages });
}

// (circuit-breaker status/reset utilities removed — knip-flagged dead exports)
