// ============================================================================
// HLS Streaming Server — Wave 39 (Video + Streaming 6/8)
// ============================================================================
// Production-ready HLS adaptive bitrate configuration for the Cabala dos
// Caminhos events platform. Supports two deployment modes:
//
//   1. Self-hosted FFmpeg — when running on bare VPS / dedicated hosts
//      where we control the encoder pipeline. Profiles: 1080p, 720p, 480p, 240p.
//
//   2. Cloud-managed — Cloudflare Stream / Mux / AWS MediaConvert
//      when running on serverless Next.js where long-running daemons
//      cannot run. Recommended for open beta scaling.
//
// WCAG AA: closed captions track for every active stream (PT-BR primary).
// LGPD Art. 7, 18, 37: recording only with explicit host consent + viewer notice.
//
// Architecture:
//   OBS / WebCam  →  RTMP ingest  →  Transcoder  →  HLS (.m3u8 + .ts)
//                                          ↓
//                                   CDN (edge cache)
//                                          ↓
//                                  Viewers (hls.js)
//
// The transcoder ladder is tuned for:
//   - Mobile-first audience (most viewers on 3G/4G in Brazil)
//   - Candomblé / Umbanda ceremonies that demand low-latency (<5s)
//   - Workshops + aulas that tolerate higher latency (10-15s)
// ============================================================================

/**
 * HLS variant in the adaptive bitrate ladder.
 * Selected to match Akasha Wave CDN defaults — bandwidth per variant
 * matches common mobile network thresholds (200kbps / 800kbps / 2.5Mbps / 5Mbps).
 */
export interface HlsVariant {
  /** Variant index — 0 is the lowest quality, N-1 is highest. */
  readonly index: number;
  /** Resolution "WxH" (e.g. "1920x1080"). */
  readonly resolution: string;
  /** Target video bitrate (bps). */
  readonly videoBitrate: number;
  /** Target audio bitrate (bps). */
  readonly audioBitrate: number;
  /** H.264 profile (baseline | main | high). */
  readonly profile: 'baseline' | 'main' | 'high';
  /** Fragment length (seconds). 4s = low latency sweet spot. */
  readonly fragmentSeconds: number;
}

/**
 * Production ABR ladder for Cabala dos Caminhos events.
 * 240p covers 2G/3G edge cases; 1080p covers broadband.
 */
export const ABR_LADDER: readonly HlsVariant[] = Object.freeze([
  Object.freeze({
    index: 0,
    resolution: '426x240',
    videoBitrate: 400_000,
    audioBitrate: 64_000,
    profile: 'baseline' as const,
    fragmentSeconds: 4,
  }),
  Object.freeze({
    index: 1,
    resolution: '854x480',
    videoBitrate: 1_000_000,
    audioBitrate: 96_000,
    profile: 'baseline' as const,
    fragmentSeconds: 4,
  }),
  Object.freeze({
    index: 2,
    resolution: '1280x720',
    videoBitrate: 2_500_000,
    audioBitrate: 128_000,
    profile: 'main' as const,
    fragmentSeconds: 4,
  }),
  Object.freeze({
    index: 3,
    resolution: '1920x1080',
    videoBitrate: 5_000_000,
    audioBitrate: 192_000,
    profile: 'high' as const,
    fragmentSeconds: 4,
  }),
]);

/**
 * HLS server deployment target.
 * - 'ffmpeg' : self-hosted encoder on dedicated VM
 * - 'cloudflare-stream' : Cloudflare Stream (recommended for open beta)
 * - 'mux' : Mux (developer-friendly, fast setup)
 * - 'mediaconvert' : AWS MediaConvert + CloudFront (enterprise)
 */
export type HlsDeployment =
  | 'ffmpeg'
  | 'cloudflare-stream'
  | 'mux'
  | 'mediaconvert';

export interface HlsServerConfig {
  /** Deployment target. */
  readonly deployment: HlsDeployment;
  /** CDN base URL where .m3u8 + .ts segments are served. */
  readonly cdnBaseUrl: string;
  /** RTMP ingest URL (for self-hosted FFmpeg). */
  readonly rtmpIngestUrl?: string;
  /** Stream key (random 32-char hex, host-only). */
  readonly streamKey: string;
  /** Live event identifier — used to namespace HLS output. */
  readonly eventId: string;
  /** Latency profile: 'low' (<5s) for ceremonies, 'normal' (10-15s) for talks. */
  readonly latencyProfile: 'low' | 'normal';
  /** Closed captions track URL (VTT, PT-BR) — required for WCAG AA. */
  readonly captionsUrl?: string;
  /** Enable auto-recording on the CDN side. */
  readonly recordingEnabled: boolean;
  /** LGPD consent gate — must be `true` before broadcast starts. */
  readonly lgpdConsentGiven: boolean;
}

export const HLS_LOW_LATENCY_FRAGMENT_S = 1;
export const HLS_NORMAL_FRAGMENT_S = 4;

/**
 * Generate the FFmpeg command line for a given variant.
 * Used by the self-hosted encoder path.
 * Pure function — no I/O. Safe to call from serverless routes that
 * shell out to FFmpeg via child_process.
 */
export function buildFfmpegCommand(
  config: HlsServerConfig,
  variant: HlsVariant,
  playlistPath: string,
  segmentPattern: string,
): readonly string[] {
  if (config.deployment !== 'ffmpeg') {
    throw new Error(
      `buildFfmpegCommand requires deployment='ffmpeg'; got '${config.deployment}'. ` +
        `Use the CDN-specific helper for cloud deployments.`,
    );
  }
  const frag = config.latencyProfile === 'low'
    ? HLS_LOW_LATENCY_FRAGMENT_S
    : variant.fragmentSeconds;
  const [w, h] = variant.resolution.split('x');
  return Object.freeze([
    '-i', config.rtmpIngestUrl ?? `rtmp://localhost/live/${config.streamKey}`,
    '-c:v', 'libx264',
    '-profile:v', variant.profile,
    '-preset', 'veryfast',
    '-g', String(frag * 30), // GOP = 1 fragment at 30fps
    '-keyint_min', String(frag * 30),
    '-sc_threshold', '0',
    '-force_key_frames', `expr:gte(t,n_forced*${frag})`,
    '-r', '30',
    '-s', `${w}x${h}`,
    '-b:v', String(variant.videoBitrate),
    '-maxrate', String(Math.round(variant.videoBitrate * 1.07)),
    '-bufsize', String(variant.videoBitrate * 2),
    '-c:a', 'aac',
    '-b:a', String(variant.audioBitrate),
    '-ac', '2',
    '-ar', '44100',
    '-f', 'hls',
    '-hls_time', String(frag),
    '-hls_playlist_type', 'event',
    '-hls_segment_filename', segmentPattern,
    '-hls_flags', 'independent_segments+program_date_time',
    playlistPath,
  ]);
}

/**
 * Build the playlist URL for a given variant. Pure helper used by the
 * player bootstrap. Returns the CDN-cached URL where the .m3u8 lives.
 */
export function buildPlaylistUrl(config: HlsServerConfig, variant: HlsVariant): string {
  const v = variant.resolution.replace('x', 'p');
  return `${config.cdnBaseUrl.replace(/\/$/, '')}/${config.eventId}/${v}/index.m3u8`;
}

/**
 * Build a master playlist (multivariant) manifest body.
 * This .m3u8 lists all variants so ABR clients can switch on the fly.
 */
export function buildMasterPlaylist(config: HlsServerConfig): string {
  const lines: string[] = [
    '#EXTM3U',
    '#EXT-X-VERSION:6',
    '#EXT-X-INDEPENDENT-SEGMENTS',
  ];
  for (const variant of ABR_LADDER) {
    const url = buildPlaylistUrl(config, variant);
    const [w, h] = variant.resolution.split('x');
    const bandwidth = variant.videoBitrate + variant.audioBitrate;
    lines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${w}x${h},` +
        `CODECS="avc1.${variant.profile === 'baseline' ? '42E01E' : variant.profile === 'main' ? '4D401E' : '640028'},mp4a.40.2",` +
        `NAME="${variant.resolution}"`,
    );
    lines.push(url);
  }
  return lines.join('\n') + '\n';
}

/**
 * Validate that an HLS server config has the LGPD consent gate set.
 * Throws if a broadcast would start without explicit host consent —
 * LGPD Art. 7 (consentimento) + Art. 37 (registro de operações).
 */
export function assertLgpdConsent(config: HlsServerConfig): void {
  if (!config.lgpdConsentGiven) {
    throw new Error(
      `[LGPD Art. 7] Broadcast refused: host consent for recording is required. ` +
        `Set lgpdConsentGiven=true only after explicit "Eu autorizo a gravação" opt-in.`,
    );
  }
  if (config.recordingEnabled && !config.captionsUrl) {
    // Captions are required for recorded VOD under WCAG AA.
    console.warn(
      '[a11y] Captions URL not configured — recorded VOD will fail WCAG AA ' +
        'until captions.vtt is uploaded to the CDN.',
    );
  }
}
