/**
 * Supabase Storage Helper
 * ----------------------------------------------------------------------------
 * Wrapper tipado ao redor de `supabase.storage.from(bucket)` com:
 *   - uploadFile(bucket, path, file)
 *   - deleteFile(bucket, paths[])
 *   - getPublicUrl(bucket, path)
 *   - getSignedUrl(bucket, path, expiresIn)
 *   - validateFileType(file, allowedTypes)
 *   - validateFileSize(file, maxMB)
 *
 * Buckets canônicos (criados por scripts/setup-supabase-storage.sh):
 *   - avatars               PUBLIC    read all, write own (RLS)
 *   - post-media            AUTH      read auth, write own
 *   - library-covers        PUBLIC    read all, write ADMIN/CURATOR
 *   - message-attachments   AUTH      read/write own
 *
 * Path conventions (validado pelas RLS policies no migration.sql):
 *   - avatars:              {userId}/avatar.{ext}
 *   - post-media:           {userId}/{postId}/{filename}
 *   - library-covers:       {articleId}/cover.{ext}
 *   - message-attachments:  {conversationId}/{userId}/{filename}
 *
 * Variáveis de ambiente (Server-side; helper roda só em server actions /
 * route handlers):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY   (admin, bypassa RLS — para signed URLs
 *                                  confiáveis em mensagens privadas)
 *
 * Em ambiente SEM Supabase configurado, todos os métodos retornam erro
 * tipado `{ ok: false, code: 'SUPABASE_NOT_CONFIGURED' }` — o caller pode
 * detectar e mostrar fallback gracioso (igual ao resto do projeto).
 */

import { createAdminClient, isSupabaseServerConfigured } from './server';

// ============================================================================
// Types
// ============================================================================

export const BUCKETS = {
  AVATARS: 'avatars',
  POST_MEDIA: 'post-media',
  LIBRARY_COVERS: 'library-covers',
  MESSAGE_ATTACHMENTS: 'message-attachments',
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

export const PUBLIC_BUCKETS: ReadonlySet<BucketName> = new Set([
  BUCKETS.AVATARS,
  BUCKETS.LIBRARY_COVERS,
]);

export type StorageErrorCode =
  | 'SUPABASE_NOT_CONFIGURED'
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'EMPTY_FILE'
  | 'UPLOAD_FAILED'
  | 'DELETE_FAILED'
  | 'SIGNED_URL_FAILED'
  | 'INVALID_PATH'
  | 'UNKNOWN';

export interface StorageError {
  ok: false;
  code: StorageErrorCode;
  message: string;
  details?: unknown;
}

export type StorageResult<T> =
  | { ok: true; data: T }
  | StorageError;

export interface UploadResult {
  path: string;
  size: number;
  contentType: string | null;
}

export interface SignedUrlResult {
  signedUrl: string;
  expiresAt: number; // epoch ms
}

// ============================================================================
// Validation helpers
// ============================================================================

/**
 * Limites por bucket (em MB) — devem bater com os buckets criados via
 * scripts/setup-supabase-storage.sh. Cada bucket tem `file_size_limit` próprio
 * no Supabase Storage; isto é a checagem client-side antes do upload.
 */
export const BUCKET_MAX_SIZE_MB: Record<BucketName, number> = {
  [BUCKETS.AVATARS]: 2,
  [BUCKETS.POST_MEDIA]: 50,
  [BUCKETS.LIBRARY_COVERS]: 3,
  [BUCKETS.MESSAGE_ATTACHMENTS]: 25,
};

/**
 * Tipos MIME permitidos por bucket. Whitelist explícita para impedir
 * upload de executáveis / arquivos maliciosos disfarçados.
 */
export const BUCKET_ALLOWED_TYPES: Record<BucketName, readonly string[]> = {
  [BUCKETS.AVATARS]: ['image/jpeg', 'image/png', 'image/webp'],
  [BUCKETS.POST_MEDIA]: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ],
  [BUCKETS.LIBRARY_COVERS]: ['image/jpeg', 'image/png', 'image/webp'],
  [BUCKETS.MESSAGE_ATTACHMENTS]: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
  ],
};

/**
 * Valida que o tipo MIME do arquivo está na whitelist do bucket.
 * Aceita `File` (browser), `Blob` (browser), ou `{ type: string, size: number }`
 * genérico (Node.js — por ex.: vindo de formidable / busboy).
 */
export function validateFileType(
  file: { type?: string | null },
  allowedTypes: readonly string[]
): { ok: true } | StorageError {
  const type = file.type ?? 'application/octet-stream';
  if (!allowedTypes.includes(type)) {
    return {
      ok: false,
      code: 'INVALID_FILE_TYPE',
      message: `Tipo de arquivo não permitido: ${type}. Permitidos: ${allowedTypes.join(', ')}`,
      details: { receivedType: type, allowedTypes },
    };
  }
  return { ok: true };
}

/**
 * Valida que o tamanho do arquivo está abaixo do limite do bucket.
 * `maxMB` é o limite; aceita o mesmo shape genérico de `validateFileType`.
 */
export function validateFileSize(
  file: { size?: number },
  maxMB: number
): { ok: true } | StorageError {
  const size = file.size ?? 0;
  if (size === 0) {
    return {
      ok: false,
      code: 'EMPTY_FILE',
      message: 'Arquivo vazio (size=0).',
    };
  }
  const maxBytes = maxMB * 1024 * 1024;
  if (size > maxBytes) {
    return {
      ok: false,
      code: 'FILE_TOO_LARGE',
      message: `Arquivo muito grande: ${(size / 1024 / 1024).toFixed(2)} MB. Máximo: ${maxMB} MB.`,
      details: { sizeBytes: size, maxBytes },
    };
  }
  return { ok: true };
}

/**
 * Helper combinado: valida tipo + tamanho em uma chamada.
 */
export function validateForBucket(
  file: { type?: string | null; size?: number },
  bucket: BucketName
): { ok: true } | StorageError {
  const typeCheck = validateFileType(file, BUCKET_ALLOWED_TYPES[bucket]);
  if (!typeCheck.ok) return typeCheck;
  const sizeCheck = validateFileSize(file, BUCKET_MAX_SIZE_MB[bucket]);
  if (!sizeCheck.ok) return sizeCheck;
  return { ok: true };
}

// ============================================================================
// Upload
// ============================================================================

/**
 * Faz upload de um arquivo para o bucket/path especificado.
 *
 * @param bucket  Nome do bucket (use BUCKETS.* para segurança de tipo).
 * @param path    Caminho dentro do bucket. Deve respeitar a convenção do
 *                bucket (ver header do arquivo) para passar nas RLS policies.
 * @param file    File (browser), Blob, ou Uint8Array + contentType.
 *                Em Node.js server actions, passe `Uint8Array` e `options.contentType`.
 * @param options.cacheControl (default '3600') — Cache-Control header.
 *                options.upsert (default false) — sobrescrever se já existir.
 *
 * IMPORTANTE: esta função usa o **admin client** (service_role) para
 * bypassar RLS no upload — a autorização fina deve ser feita PELO CALLER
 * (route handler / server action) ANTES de chamar. Ex.: /api/upload valida
 * que userId no path === auth.uid() antes de delegar aqui.
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: Blob | File | Uint8Array,
  options?: {
    contentType?: string;
    cacheControl?: string;
    upsert?: boolean;
  }
): Promise<StorageResult<UploadResult>> {
  if (!isSupabaseServerConfigured()) {
    return {
      ok: false,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL ausente).',
    };
  }

  if (!path || path.includes('..')) {
    return {
      ok: false,
      code: 'INVALID_PATH',
      message: 'Path inválido ou contém traversal (../).',
    };
  }

  // Tenta extrair size/type se disponível (File / Blob).
  const inferredType = options?.contentType
    ?? (file instanceof Blob ? file.type : null);
  const inferredSize = file instanceof Blob ? file.size : file.byteLength;

  const validation = validateForBucket(
    { type: inferredType, size: inferredSize },
    bucket
  );
  if (!validation.ok) return validation;

  const supabase = createAdminClient();
  if (!supabase) {
    return {
      ok: false,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Admin client indisponível (SUPABASE_SERVICE_ROLE_KEY ausente).',
    };
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType ?? (file instanceof Blob ? file.type : undefined),
      cacheControl: options?.cacheControl ?? '3600',
      upsert: options?.upsert ?? false,
    });

  if (error || !data) {
    return {
      ok: false,
      code: 'UPLOAD_FAILED',
      message: error?.message ?? 'Upload falhou sem mensagem de erro.',
      details: error,
    };
  }

  return {
    ok: true,
    data: {
      path: data.path,
      size: inferredSize,
      contentType: inferredType,
    },
  };
}

// ============================================================================
// Delete
// ============================================================================

/**
 * Remove um ou mais arquivos de um bucket. Aceita string ou string[].
 *
 * IMPORTANTE: admin client bypassa RLS. Valide permissão no caller.
 */
export async function deleteFile(
  bucket: BucketName,
  paths: string | string[]
): Promise<StorageResult<{ removed: string[] }>> {
  if (!isSupabaseServerConfigured()) {
    return {
      ok: false,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Supabase não configurado.',
    };
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return {
      ok: false,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Admin client indisponível.',
    };
  }

  const pathArray = Array.isArray(paths) ? paths : [paths];
  if (pathArray.some((p) => !p || p.includes('..'))) {
    return {
      ok: false,
      code: 'INVALID_PATH',
      message: 'Path inválido ou contém traversal.',
    };
  }

  const { data, error } = await supabase.storage.from(bucket).remove(pathArray);

  if (error) {
    return {
      ok: false,
      code: 'DELETE_FAILED',
      message: error.message,
      details: error,
    };
  }

  return {
    ok: true,
    data: { removed: data?.map((r) => r.name) ?? pathArray },
  };
}

// ============================================================================
// URLs
// ============================================================================

/**
 * Gera URL pública para arquivos em buckets PUBLIC. NÃO use para buckets
 * privados (post-media, message-attachments) — a URL retornada seria
 * acessível publicamente mesmo assim (com 404), vazando path info.
 *
 * Para buckets privados, use `getSignedUrl`.
 */
export function getPublicUrl(bucket: BucketName, path: string): string | null {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Gera URL temporária (signed) para acesso a arquivo em bucket privado.
 * Use para message-attachments, post-media (se quiser restringir leitura).
 *
 * @param expiresIn segundos até expirar (default 3600 = 1h; máximo 604800 = 7d).
 *
 * IMPORTANTE: o admin client é usado para gerar a URL — isso permite ao
 * service role assinar URLs para qualquer path. O caller deve validar
 * que o requisitante tem direito de acessar o path ANTES de chamar.
 */
export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn: number = 3600
): Promise<StorageResult<SignedUrlResult>> {
  if (!isSupabaseServerConfigured()) {
    return {
      ok: false,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Supabase não configurado.',
    };
  }

  if (expiresIn < 1 || expiresIn > 604800) {
    return {
      ok: false,
      code: 'INVALID_PATH',
      message: 'expiresIn deve estar entre 1 e 604800 (7 dias) segundos.',
    };
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return {
      ok: false,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Admin client indisponível.',
    };
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data) {
    return {
      ok: false,
      code: 'SIGNED_URL_FAILED',
      message: error?.message ?? 'Falha ao gerar signed URL.',
      details: error,
    };
  }

  return {
    ok: true,
    data: {
      signedUrl: data.signedUrl,
      // Supabase não retorna expiresAt; calculamos do expiresIn.
      expiresAt: Date.now() + expiresIn * 1000,
    },
  };
}

// ============================================================================
// Convenience helpers (path builders)
// ============================================================================

/**
 * Constrói o path canônico para upload de avatar.
 *   avatars/{userId}/avatar.{ext}
 */
export function buildAvatarPath(userId: string, ext: string = 'jpg'): string {
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4) || 'jpg';
  return `${userId}/avatar.${safeExt}`;
}

/**
 * Constrói o path canônico para mídia em post.
 *   post-media/{userId}/{postId}/{filename}
 */
export function buildPostMediaPath(
  userId: string,
  postId: string,
  filename: string
): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${userId}/${postId}/${safeName}`;
}

/**
 * Constrói o path canônico para capa de artigo.
 *   library-covers/{articleId}/cover.{ext}
 */
export function buildLibraryCoverPath(articleId: string, ext: string = 'jpg'): string {
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4) || 'jpg';
  return `${articleId}/cover.${safeExt}`;
}

/**
 * Constrói o path canônico para anexo de mensagem.
 *   message-attachments/{conversationId}/{userId}/{filename}
 */
export function buildMessageAttachmentPath(
  conversationId: string,
  userId: string,
  filename: string
): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${conversationId}/${userId}/${safeName}`;
}