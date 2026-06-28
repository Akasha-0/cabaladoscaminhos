// ============================================================================
// COMMUNITY DRAFTS — Backend helpers (Prisma → API DTO mapping)
// ============================================================================
// Funções que ficam entre os route handlers e o Prisma. Centralizam a
// transformação DTO e operações em massa (publish, schedule) se necessário.
// ============================================================================

import type { Prisma, Draft as PrismaDraft } from '@prisma/client';

export interface DraftDto {
  id: string;
  authorId: string;
  title: string | null;
  content: string;
  tradition: string | null;
  topic: string | null;
  tags: string[];
  lastSavedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function draftToDto(draft: PrismaDraft): DraftDto {
  return {
    id: draft.id,
    authorId: draft.authorId,
    title: draft.title,
    content: draft.content,
    tradition: draft.tradition,
    topic: draft.topic,
    tags: draft.tags ?? [],
    lastSavedAt: draft.lastSavedAt ? draft.lastSavedAt.toISOString() : null,
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
  };
}

// Re-exporta o tipo do payload para uso futuro em queries com includes
export type DraftWithRelations = Prisma.DraftGetPayload<true>;
