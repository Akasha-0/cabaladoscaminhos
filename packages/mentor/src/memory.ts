// Session memory management

import type { ChatSession, MentorMessage, MentorContext } from './types';

export interface MemoryStore {
  sessions: Map<string, ChatSession>;
}

const store: MemoryStore = {
  sessions: new Map(),
};

export function createSession(context: MentorContext): ChatSession {
  const session: ChatSession = {
    id: generateSessionId(),
    messages: [],
    context,
    createdAt: Date.now(),
  };
  
  store.sessions.set(session.id, session);
  return session;
}

export function getSession(sessionId: string): ChatSession | undefined {
  return store.sessions.get(sessionId);
}

export function addMessage(sessionId: string, message: MentorMessage): void {
  const session = store.sessions.get(sessionId);
  if (session) {
    session.messages.push({
      ...message,
      timestamp: message.timestamp || Date.now(),
    });
  }
}

export function getHistory(sessionId: string, limit?: number): MentorMessage[] {
  const session = store.sessions.get(sessionId);
  if (!session) return [];
  
  const messages = session.messages;
  return limit ? messages.slice(-limit) : messages;
}

export function clearSession(sessionId: string): void {
  store.sessions.delete(sessionId);
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
