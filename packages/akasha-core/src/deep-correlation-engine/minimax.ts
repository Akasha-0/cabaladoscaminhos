/**
 * MiniMax M3 API integration stub.
 * The real implementation is in apps/akasha-portal.
 * This stub avoids a portal→core dependency.
 */
import type { ChatMessage } from './types';

export async function generateMinimaxResponse(
  messages: ChatMessage[],
  _options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  void messages;
  return '[MiniMax stub — implementação pendente]';
}
