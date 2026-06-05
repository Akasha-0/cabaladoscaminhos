'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';

const llmSettingSchema = z.object({
  provider: z.enum(['openai', 'minimax', 'anthropic', 'local', 'gemini', 'groq', 'deepseek', 'openrouter']),
  openaiKey: z.string().nullable().optional(),
  openaiModel: z.string().min(1, 'Modelo OpenAI é obrigatório').optional(),
  minimaxKey: z.string().nullable().optional(),
  minimaxModel: z.string().min(1, 'Modelo Minimax é obrigatório').optional(),
  anthropicKey: z.string().nullable().optional(),
  anthropicModel: z.string().min(1, 'Modelo Anthropic é obrigatório').optional(),
  localEndpoint: z.string().min(1, 'Endpoint local é obrigatório').optional(),
  localModel: z.string().min(1, 'Modelo local é obrigatório').optional(),
  
  geminiKey: z.string().nullable().optional(),
  geminiModel: z.string().min(1, 'Modelo Gemini é obrigatório').optional(),
  groqKey: z.string().nullable().optional(),
  groqModel: z.string().min(1, 'Modelo Groq é obrigatório').optional(),
  deepseekKey: z.string().nullable().optional(),
  deepseekModel: z.string().min(1, 'Modelo DeepSeek é obrigatório').optional(),
  openrouterKey: z.string().nullable().optional(),
  openrouterModel: z.string().min(1, 'Modelo OpenRouter é obrigatório').optional(),
});

export type SaveLlmSettingInput = z.infer<typeof llmSettingSchema>;

async function ensureUserExists(user: { id: string; email: string; name: string }) {
  if (user.id === 'cockpit-bypass-dev') {
    const exists = await prisma.user.findUnique({ where: { id: user.id } });
    if (!exists) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          passwordHash: '!bypass-no-password!',
          role: 'ADMIN',
        },
      });
    }
  }
}

/**
 * Gets the LLM settings for the active user.
 * Fallbacks to empty/default settings if none exists yet.
 */
export async function getActiveOperatorLlmSetting(): Promise<SaveLlmSettingInput | null> {
  try {
    const user = await getOperatorFromServerContext();
    if (!user) return null;

    await ensureUserExists(user);

    const setting = await prisma.userLlmSetting.findUnique({
      where: { userId: user.id },
    });

    if (!setting) {
      return {
        provider: 'openai',
        openaiKey: '',
        openaiModel: 'gpt-4o',
        minimaxKey: '',
        minimaxModel: 'minimax/m3',
        anthropicKey: '',
        anthropicModel: 'claude-3-5-sonnet',
        localEndpoint: 'http://localhost:1234/v1',
        localModel: 'meta-llama-3-8b-instruct',
        geminiKey: '',
        geminiModel: 'gemini-1.5-flash',
        groqKey: '',
        groqModel: 'llama-3.3-70b-versatile',
        deepseekKey: '',
        deepseekModel: 'deepseek-chat',
        openrouterKey: '',
        openrouterModel: 'google/gemini-2.5-flash',
      };
    }

    return {
      provider: setting.provider as SaveLlmSettingInput['provider'],
      openaiKey: setting.openaiKey,
      openaiModel: setting.openaiModel ?? 'gpt-4o',
      minimaxKey: setting.minimaxKey,
      minimaxModel: setting.minimaxModel ?? 'minimax/m3',
      anthropicKey: setting.anthropicKey,
      anthropicModel: setting.anthropicModel ?? 'claude-3-5-sonnet',
      localEndpoint: setting.localEndpoint ?? 'http://localhost:1234/v1',
      localModel: setting.localModel ?? 'meta-llama-3-8b-instruct',
      geminiKey: setting.geminiKey,
      geminiModel: setting.geminiModel ?? 'gemini-1.5-flash',
      groqKey: setting.groqKey,
      groqModel: setting.groqModel ?? 'llama-3.3-70b-versatile',
      deepseekKey: setting.deepseekKey,
      deepseekModel: setting.deepseekModel ?? 'deepseek-chat',
      openrouterKey: setting.openrouterKey,
      openrouterModel: setting.openrouterModel ?? 'google/gemini-2.5-flash',
    };
  } catch (err) {
    console.error('[llm-settings-actions] Error fetching active operator LLM settings:', err);
    return {
      provider: 'openai',
      openaiKey: '',
      openaiModel: 'gpt-4o',
      minimaxKey: '',
      minimaxModel: 'minimax/m3',
      anthropicKey: '',
      anthropicModel: 'claude-3-5-sonnet',
      localEndpoint: 'http://localhost:1234/v1',
      localModel: 'meta-llama-3-8b-instruct',
      geminiKey: '',
      geminiModel: 'gemini-1.5-flash',
      groqKey: '',
      groqModel: 'llama-3.3-70b-versatile',
      deepseekKey: '',
      deepseekModel: 'deepseek-chat',
      openrouterKey: '',
      openrouterModel: 'google/gemini-2.5-flash',
    };
  }
}

/**
 * Saves or updates the LLM settings for the active user.
 */
export async function saveActiveOperatorLlmSetting(input: SaveLlmSettingInput) {
  try {
    const user = await getOperatorFromServerContext();
    if (!user) {
      return { ok: false, error: 'Não autorizado' };
    }

    await ensureUserExists(user);

    const data = llmSettingSchema.parse(input);

    await prisma.userLlmSetting.upsert({
      where: { userId: user.id },
      update: {
        provider: data.provider,
        openaiKey: data.openaiKey || null,
        openaiModel: data.openaiModel || 'gpt-4o',
        minimaxKey: data.minimaxKey || null,
        minimaxModel: data.minimaxModel || 'minimax/m3',
        anthropicKey: data.anthropicKey || null,
        anthropicModel: data.anthropicModel || 'claude-3-5-sonnet',
        localEndpoint: data.localEndpoint || 'http://localhost:1234/v1',
        localModel: data.localModel || 'meta-llama-3-8b-instruct',
        geminiKey: data.geminiKey || null,
        geminiModel: data.geminiModel || 'gemini-1.5-flash',
        groqKey: data.groqKey || null,
        groqModel: data.groqModel || 'llama-3.3-70b-versatile',
        deepseekKey: data.deepseekKey || null,
        deepseekModel: data.deepseekModel || 'deepseek-chat',
        openrouterKey: data.openrouterKey || null,
        openrouterModel: data.openrouterModel || 'google/gemini-2.5-flash',
      },
      create: {
        userId: user.id,
        provider: data.provider,
        openaiKey: data.openaiKey || null,
        openaiModel: data.openaiModel || 'gpt-4o',
        minimaxKey: data.minimaxKey || null,
        minimaxModel: data.minimaxModel || 'minimax/m3',
        anthropicKey: data.anthropicKey || null,
        anthropicModel: data.anthropicModel || 'claude-3-5-sonnet',
        localEndpoint: data.localEndpoint || 'http://localhost:1234/v1',
        localModel: data.localModel || 'meta-llama-3-8b-instruct',
        geminiKey: data.geminiKey || null,
        geminiModel: data.geminiModel || 'gemini-1.5-flash',
        groqKey: data.groqKey || null,
        groqModel: data.groqModel || 'llama-3.3-70b-versatile',
        deepseekKey: data.deepseekKey || null,
        deepseekModel: data.deepseekModel || 'deepseek-chat',
        openrouterKey: data.openrouterKey || null,
        openrouterModel: data.openrouterModel || 'google/gemini-2.5-flash',
      },
    });

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido ao salvar configurações',
    };
  }
}
