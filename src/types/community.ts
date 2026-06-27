// ============================================================================
// COMMUNITY TYPES — Tipos compartilhados para Posts, Comments, Likes
// ============================================================================
// Estruturas que trafegam entre API e UI. Devem ser serializáveis em JSON.
// ============================================================================

export type PostType =
  | 'TEXT'
  | 'LINK'
  | 'ARTICLE'
  | 'QUESTION'
  | 'EXPERIENCE'
  | 'PRACTICE';

export interface Author {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string | null;
  spiritualTag?: string | null;
  orixa?: string | null;
}

export interface PostReference {
  title: string;
  url?: string;
  doi?: string;
  year?: number;
}

export interface Post {
  id: string;
  author: Author;
  content: string;
  type: PostType;
  tradition?: string | null;
  topic?: string | null;
  groupName?: string | null;
  groupSlug?: string | null;
  mediaUrls?: string[];
  references?: PostReference[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  liked?: boolean;
  bookmarked?: boolean;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
}

export interface Comment {
  id: string;
  postId: string;
  author: Author;
  content: string;
  parentId?: string | null;
  likesCount: number;
  liked?: boolean;
  createdAt: string;
}

// ============================================================================
// API Response envelope (data/error/meta)
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: { code: number; message: string; details?: unknown };
  meta?: {
    timestamp: string;
    requestId?: string;
    nextCursor?: string | null;
    total?: number;
    [key: string]: unknown;
  };
}

export interface FeedPage {
  posts: Post[];
  nextCursor: string | null;
  total: number;
}

export interface LikeResponse {
  liked: boolean;
  likesCount: number;
}