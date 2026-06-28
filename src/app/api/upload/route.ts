// ============================================================================
// UPLOAD MEDIA — POST /api/upload
// ============================================================================
// Wave 21 (2026-06-28) — API crítica faltante. Recebe multipart/form-data
// com UM arquivo (campo "file"), valida tipo/tamanho, faz upload para
// Supabase Storage no path `post-media/{userId}/{uuid}.{ext}` e devolve
// a URL pública + metadata.
//
// Validações:
//   - Tipo MIME deve estar em [image/*, video/*, audio/*]
//   - Tamanho máximo: 50MB (configurável via constante MAX_SIZE)
//   - Campo "file" obrigatório
//
// Auth: required (requireViewer)
// Rate limit: 20 uploads / hora por user (in-memory, suficiente p/ MVP)
// Storage: Supabase Storage bucket `post-media` (service role)
//
// Resposta:
//   201 Created → { url, mimeType, size, dimensions? }
//   400 Bad Request → sem file, MIME inválido, > 50MB
//   401 Unauthorized → sem auth
//   429 Too Many Requests → rate limit excedido
//   503 Service Unavailable → Storage não configurado
//   500 Internal Server Error → upload falhou
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { createAdminClient, MEDIA_BUCKET } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// Constantes
// ============================================================================

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const RATE_LIMIT_PER_HOUR = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const ALLOWED_PREFIXES = ['image/', 'video/', 'audio/'] as const;

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/webm': 'webm',
  'audio/aac': 'aac',
  'audio/flac': 'flac',
};

// ============================================================================
// Rate limit in-memory (suficiente p/ MVP; substituir por Redis em prod)
// ============================================================================

interface Bucket {
  count: number;
  resetAt: number;
}
const rateLimitBuckets = new Map<string, Bucket>();

function checkUploadRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const key = `upload:${userId}`;
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return {
      allowed: true,
      remaining: RATE_LIMIT_PER_HOUR - 1,
      resetIn: RATE_LIMIT_WINDOW_MS,
    };
  }
  if (bucket.count >= RATE_LIMIT_PER_HOUR) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: bucket.resetAt - now,
    };
  }
  bucket.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_PER_HOUR - bucket.count,
    resetIn: bucket.resetAt - now,
  };
}

// ============================================================================
// UUID helper (Web Crypto disponível em Node 18+ e Edge)
// ============================================================================

function uuid(): string {
  // Captura local para evitar narrowing cross-branch no TS.
  // Cast generico porque `globalThis.crypto` em ambientes antigos (Node <19)
  // e `never`/`undefined`, e o TS faz narrowing agressivo dentro do if.
  const g = globalThis as unknown as { crypto?: { randomUUID?: () => string; getRandomValues?: (a: Uint8Array) => Uint8Array } };
  const c = g.crypto;
  // Preferir crypto.randomUUID() quando disponível (Node 19+, Edge)
  if (c?.randomUUID) {
    return c.randomUUID();
  }
  // Fallback manual
  const bytes = new Uint8Array(16);
  if (c?.getRandomValues) {
    c.getRandomValues(bytes);
  } else {
    // Ultimo recurso — Math.random nao e cripto-seguro, mas evita throw
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// ============================================================================
// Helpers
// ============================================================================

function isAllowedMime(mime: string): boolean {
  return ALLOWED_PREFIXES.some((p) => mime.startsWith(p));
}

function extensionFor(mime: string, fallback: string): string {
  return EXT_BY_MIME[mime.toLowerCase()] ?? fallback;
}

function inferKind(mime: string): 'image' | 'video' | 'audio' | 'unknown' {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'unknown';
}

// ============================================================================
// POST handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado para fazer upload');
    }

    // Rate limit
    const rl = checkUploadRateLimit(viewer.id);
    if (!rl.allowed) {
      const minutes = Math.ceil(rl.resetIn / 60_000);
      return fail(
        429,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        `Limite de ${RATE_LIMIT_PER_HOUR} uploads/hora atingido. Tente novamente em ~${minutes} min.`,
        { retryAfterMs: rl.resetIn }
      );
    }

    // Parse multipart
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo deve ser multipart/form-data');
    }

    const fileEntry = formData.get('file');
    if (!fileEntry || typeof fileEntry === 'string') {
      return fail(400, ErrorCode.BAD_REQUEST, 'Campo "file" é obrigatório');
    }

    const file = fileEntry as File;
    const mimeType = file.type || 'application/octet-stream';

    if (!isAllowedMime(mimeType)) {
      return fail(
        400,
        ErrorCode.BAD_REQUEST,
        `Tipo de arquivo não suportado: ${mimeType}. Aceitos: image/*, video/*, audio/*`
      );
    }

    if (file.size <= 0) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Arquivo vazio');
    }
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return fail(
        400,
        ErrorCode.BAD_REQUEST,
        `Arquivo muito grande (${sizeMb} MB). Máximo permitido: 50 MB.`
      );
    }

    // Gerar path: post-media/{userId}/{uuid}.{ext}
    const id = uuid();
    const ext = extensionFor(mimeType, 'bin');
    const path = `${viewer.id}/${id}.${ext}`;

    // Upload para Supabase Storage
    let admin;
    try {
      admin = createAdminClient();
    } catch (err) {
      console.error('[api/upload] supabase admin client indisponível:', err);
      return fail(
        503,
        ErrorCode.INTERNAL_ERROR,
        'Storage não configurado. Defina SUPABASE_SERVICE_ROLE_KEY.'
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(MEDIA_BUCKET)
      .upload(path, bytes, {
        contentType: mimeType,
        cacheControl: '31536000', // 1 ano (immutable media)
        upsert: false,
      });

    if (uploadError) {
      console.error('[api/upload] supabase storage error:', uploadError);
      return fail(
        500,
        ErrorCode.INTERNAL_ERROR,
        `Falha no upload: ${uploadError.message}`
      );
    }

    // URL pública (bucket público) ou signed URL (bucket privado).
    // Assumimos bucket público por ora (mais comum para mídia de posts).
    const {
      data: { publicUrl },
    } = admin.storage.from(MEDIA_BUCKET).getPublicUrl(path);

    const kind = inferKind(mimeType);

    // Log de auditoria (LGPD Art. 37 — ações sensíveis)
    try {
      await admin.from('audit_logs').insert({
        actorId: viewer.id,
        action: 'POST_CREATED', // reusando enum — sem variant nova para upload
        metadata: {
          event: 'media_upload',
          kind,
          mimeType,
          size: file.size,
          path,
          bucket: MEDIA_BUCKET,
        },
      });
    } catch {
      // Audit é best-effort — não bloqueia o upload
    }

    return ok(
      {
        url: publicUrl,
        path,
        kind,
        mimeType,
        size: file.size,
        // dimensions preenchidas opcionalmente pelo client que conhece
        // o arquivo antes do upload (ex: width/height de uma imagem).
        // Aqui retornamos apenas o que sabemos do File metadata.
        filename: file.name || `${id}.${ext}`,
      },
      {
        status: 201,
        meta: {
          userId: viewer.id,
          rateLimitRemaining: rl.remaining,
        },
      }
    );
  } catch (err) {
    return handleError(err);
  }
}