import { createChatCompletion } from '@/lib/ai/openai';
import { gerarPromptChat, gerarPromptSemContexto } from './prompt';
import { TemaChat, MensagemChat } from './types';
import type { UsuarioContext } from '@/lib/ai/prompt-system';
import type { ChatMessage } from '@/lib/ai/types';

export interface EnviarMensagemParams {
  pergunta: string;
  tema: TemaChat;
  contextoUsuario?: UsuarioContext;
  historico?: MensagemChat[];
}

export async function enviarMensagemChat(
  params: EnviarMensagemParams
): Promise<string> {
  const { pergunta, tema, contextoUsuario, historico } = params;

  let systemPrompt: string;
  let userPrompt: string;

  if (contextoUsuario) {
    const prompts = gerarPromptChat(
      tema,
      pergunta,
      contextoUsuario,
      historico?.map(m => ({ tipo: m.tipo, conteudo: m.conteudo }))
    );
    systemPrompt = prompts.system;
    userPrompt = prompts.user;
  } else {
    const prompts = gerarPromptSemContexto(tema, pergunta);
    systemPrompt = prompts.system;
    userPrompt = prompts.user;
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await createChatCompletion({
    messages,
    max_tokens: 1500,
    temperature: 0.8,
  });

  return response.content;
}

export async function salvarConversa(
  userId: string,
  tema: TemaChat,
  mensagens: MensagemChat[]
): Promise<{ id: string }> {
  const { prisma } = await import('@/lib/prisma');

  const conversa = await prisma.conversa.create({
    data: {
      userId,
      tema,
      mensagens: {
        create: mensagens.map(msg => ({
          tipo: msg.tipo,
          conteudo: msg.conteudo,
        })),
      },
    },
  });

  return { id: conversa.id };
}

export async function buscarConversas(userId: string): Promise<{
  id: string;
  tema: string;
  mensagens: { tipo: string; conteudo: string; createdAt: Date }[];
  criadaEm: Date;
  atualizadaEm: Date;
}[]> {
  const { prisma } = await import('@/lib/prisma');

  const conversas = await prisma.conversa.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 20,
    include: {
      mensagens: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return conversas.map(c => ({
    id: c.id,
    tema: c.tema,
    mensagens: c.mensagens.map(m => ({
      tipo: m.tipo,
      conteudo: m.conteudo,
      createdAt: m.createdAt,
    })),
    criadaEm: c.createdAt,
    atualizadaEm: c.updatedAt,
  }));
}

export async function adicionarMensagem(
  conversaId: string,
  tipo: 'usuario' | 'assistente',
  conteudo: string
): Promise<void> {
  const { prisma } = await import('@/lib/prisma');

  await prisma.mensagem.create({
    data: {
      conversaId,
      tipo,
      conteudo,
    },
  });

  await prisma.conversa.update({
    where: { id: conversaId },
    data: { updatedAt: new Date() },
  });
}

export async function buscarConversa(conversaId: string): Promise<{
  id: string;
  tema: string;
  mensagens: { tipo: string; conteudo: string; createdAt: Date }[];
} | null> {
  const { prisma } = await import('@/lib/prisma');

  const conversa = await prisma.conversa.findUnique({
    where: { id: conversaId },
    include: {
      mensagens: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversa) return null;

  return {
    id: conversa.id,
    tema: conversa.tema,
    mensagens: conversa.mensagens.map(m => ({
      tipo: m.tipo,
      conteudo: m.conteudo,
      createdAt: m.createdAt,
    })),
  };
}