// ============================================================================
// CDN Distribution — Wave 39 (Video + Streaming 6/8)
// ============================================================================
// CDN configuration for HLS adaptive bitrate live + VOD delivery.
// Three deployment profiles are supported:
//
//   1. Cloudflare Stream  — RECOMMENDED for open beta scaling
//      • Per-minute pricing (~$1/1000 min stored, $1/1000 min delivered)
//      • Built-in captions, recording, analytics
//      • WebRTC low-latency + HLS fallback (perfect ABR story)
//      • Global edge cache (300+ PoPs)
//
//   2. AWS MediaConvert + CloudFront
//      • Enterprise scale, deepest IAM integration
//      • Higher setup cost, but best for large catalogues
//
//   3. Mux
//      • Most developer-friendly API (Mux Video + Mux Data analytics)
//      • Slightly higher per-minute cost than Cloudflare
//
// All three paths export the same `CdnDistributionConfig` shape so the
// player + API endpoints stay deployment-agnostic.
// ============================================================================

export type CdnProvider = 'cloudflare-stream' | 'mediaconvert' | 'mux' | 'self-hosted';

export interface CdnDistributionConfig {
  readonly provider: CdnProvider;
  /** CDN base URL (no trailing slash). */
  readonly baseUrl: string;
  /** Customer / account ID (Mux = 'sub-xxx', Cloudflare = account id). */
  readonly accountId?: string;
  /** API token — NEVER log this. Read from process.env. */
  readonly apiTokenEnvVar: string;
  /** Webhook secret for ingest complete / live started callbacks. */
  readonly webhookSecretEnvVar: string;
  /** Region hint for origin shield (south-america for Brazilian audience). */
  readonly preferredRegion: 'sa-east-1' | 'us-east-1' | 'eu-west-1' | 'global';
  /** Default TTL for HLS .m3u8 playlists (seconds). Short = low latency. */
  readonly playlistTtlSeconds: number;
  /** Default TTL for .ts segments (seconds). Long = CDN cache hit ratio. */
  readonly segmentTtlSeconds: number;
  /** Allow public playback URLs (false = signed URLs only). */
  readonly publicPlayback: boolean;
  /** Auto-generate captions via CDN-side speech-to-text. */
  readonly autoCaptions: boolean;
  /** Allowed origins for CORS on playback URLs (CORS for cross-domain HLS). */
  readonly allowedOrigins: readonly string[];
}

/**
 * Cloudflare Stream configuration preset.
 * Recommended for open beta — handles live ingest + VOD transcoding + captions
 * in a single service, with global edge cache included.
 */
export const CLOUDFLARE_STREAM_CONFIG: CdnDistributionConfig = Object.freeze({
  provider: 'cloudflare-stream',
  baseUrl: 'https://stream.cdn.luminarias.cloud',
  accountId: 'CLOUDFLARE_ACCOUNT_ID',
  apiTokenEnvVar: 'CLOUDFLARE_STREAM_TOKEN',
  webhookSecretEnvVar: 'CLOUDFLARE_STREAM_WEBHOOK_SECRET',
  preferredRegion: 'global',
  playlistTtlSeconds: 4,
  segmentTtlSeconds: 86_400,
  publicPlayback: true,
  autoCaptions: true,
  allowedOrigins: ['luminarias.app', 'cabala.app'],
});

/**
 * Mux configuration preset.
 * Lower setup cost, Mux Data analytics included.
 */
export const MUX_CONFIG: CdnDistributionConfig = Object.freeze({
  provider: 'mux',
  baseUrl: 'https://stream.mux.com',
  apiTokenEnvVar: 'MUX_TOKEN_ID',
  webhookSecretEnvVar: 'MUX_WEBHOOK_SECRET',
  preferredRegion: 'global',
  playlistTtlSeconds: 4,
  segmentTtlSeconds: 86_400,
  publicPlayback: true,
  autoCaptions: true,
  allowedOrigins: ['luminarias.app'],
});

/**
 * AWS MediaConvert + CloudFront preset.
 * For enterprise scale when we hit >50TB egress / month.
 */
export const MEDIACONVERT_CONFIG: CdnDistributionConfig = Object.freeze({
  provider: 'mediaconvert',
  baseUrl: 'https://d111111abcdef8.cloudfront.net',
  accountId: 'AWS_ACCOUNT_ID',
  apiTokenEnvVar: 'AWS_MEDIACONVERT_ROLE_ARN',
  webhookSecretEnvVar: 'AWS_EVENTBRIDGE_WEBHOOK_SECRET',
  preferredRegion: 'sa-east-1',
  playlistTtlSeconds: 4,
  segmentTtlSeconds: 7_776_000, // 90 days
  publicPlayback: false,
  autoCaptions: false, // Use external Whisper pipeline
  allowedOrigins: ['luminarias.app'],
});

/**
 * Resolve the active CDN configuration from environment variables.
 * Falls back to Cloudflare Stream (recommended) when no override.
 */
export function resolveCdnConfig(override?: CdnProvider): CdnDistributionConfig {
  const provider = override ?? (process.env.STREAMING_CDN_PROVIDER as CdnProvider) ?? 'cloudflare-stream';
  switch (provider) {
    case 'cloudflare-stream':
      return CLOUDFLARE_STREAM_CONFIG;
    case 'mux':
      return MUX_CONFIG;
    case 'mediaconvert':
      return MEDIACONVERT_CONFIG;
    case 'self-hosted':
      return {
        provider: 'self-hosted',
        baseUrl: process.env.STREAMING_BASE_URL ?? 'https://stream.luminarias.app',
        apiTokenEnvVar: 'STREAMING_API_TOKEN',
        webhookSecretEnvVar: 'STREAMING_WEBHOOK_SECRET',
        preferredRegion: 'sa-east-1',
        playlistTtlSeconds: 4,
        segmentTtlSeconds: 86_400,
        publicPlayback: false,
        autoCaptions: false,
        allowedOrigins: ['luminarias.app'],
      };
    default: {
      const exhaustive: never = provider;
      throw new Error(`Unknown CDN provider: ${String(exhaustive)}`);
    }
  }
}

/**
 * Generate a Cloudflare Stream signed playback token (HMAC-based).
 * Used when `publicPlayback: false`. Safe to expose in client — the
 * URL is bound to a specific playback policy + TTL.
 *
 * NOTE: This is a server-side helper. We use Node's crypto module via
 * `globalThis.crypto.subtle` to stay runtime-agnostic (Edge-compatible).
 */
export async function buildSignedPlaybackUrl(
  config: CdnDistributionConfig,
  videoId: string,
  ttlSeconds: number,
): Promise<string> {
  if (config.publicPlayback) {
    return `${config.baseUrl.replace(/\/$/, '')}/${videoId}/manifest.m3u8`;
  }
  // HMAC-SHA256 over (videoId + expiry) using the CDN's signing key.
  const secret = process.env[config.apiTokenEnvVar];
  if (!secret) {
    throw new Error(
      `[cdn-config] Missing signing secret in env var ${config.apiTokenEnvVar}.`,
    );
  }
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${videoId}:${expiry}`;
  const enc = new TextEncoder();
  const keyData = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', keyData, enc.encode(payload));
  const tokenBytes = new Uint8Array(sig);
  let hex = '';
  for (let i = 0; i < tokenBytes.length; i++) {
    hex += tokenBytes[i]!.toString(16).padStart(2, '0');
  }
  const params = new URLSearchParams({ exp: String(expiry), sig: hex });
  return `${config.baseUrl.replace(/\/$/, '')}/${videoId}/manifest.m3u8?${params.toString()}`;
}

/**
 * Build a list of edge PoPs for the recommended provider.
 * Informational only — used in the analytics dashboard.
 */
export const EDGE_POPS: Readonly<Record<CdnProvider, readonly string[]>> = Object.freeze({
  'cloudflare-stream': Object.freeze([
    'GRU', 'GIG', 'POA', 'FOR', // Brazil
    'EZE', 'SCL',              // Argentina, Chile
    'JFK', 'MIA', 'LAX',       // USA
  ]),
  'mux': Object.freeze([
    'global-cdn',
  ]),
  'mediaconvert': Object.freeze([
    'sa-east-1',
    'us-east-1',
    'eu-west-1',
  ]),
  'self-hosted': Object.freeze([
    'sa-east-1',
  ]),
});
