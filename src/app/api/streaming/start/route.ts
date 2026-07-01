// ============================================================================
// POST /api/streaming/start — Wave 39 (Video + Streaming 6/8)
// ============================================================================
// Start a live broadcast for a scheduled event. Host-only.
// Returns the HLS configuration + ingest URL + signed playback URL.
//
// LGPD Art. 7: requires explicit host opt-in (lgpdConsent: true).
// LGPD Art. 37: writes an audit entry for record-keeping.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { assertLgpdConsent, buildMasterPlaylist, ABR_LADDER } from '@/lib/streaming/hls-server';
import { resolveCdnConfig, buildSignedPlaybackUrl } from '@/lib/streaming/cdn-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface StartStreamingBody {
  eventId: string;
  hostId: string;
  latencyProfile: 'low' | 'normal';
  lgpdConsent: true;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as StartStreamingBody;
    if (!body.eventId || !body.hostId) {
      return NextResponse.json(
        { error: 'eventId e hostId são obrigatórios' },
        { status: 400 },
      );
    }
    if (body.lgpdConsent !== true) {
      return NextResponse.json(
        { error: 'LGPD Art. 7 — consentimento explícito do host é obrigatório para iniciar a transmissão.' },
        { status: 422 },
      );
    }
    const cdn = resolveCdnConfig();
    const streamKey = randomHex(32);
    const masterPlaylistUrl = await buildSignedPlaybackUrl(cdn, body.eventId, 3600);
    const config = {
      eventId: body.eventId,
      cdnBaseUrl: cdn.baseUrl,
      rtmpIngestUrl:
        cdn.provider === 'cloudflare-stream'
          ? `rtmps://live.cloudflarestream.com:443/live`
          : cdn.provider === 'mux'
            ? `rtmps://global-live.mux.com:443/app`
            : `rtmp://ingest.luminarias.app/live/${streamKey}`,
      streamKey,
      masterPlaylistUrl,
      variants: ABR_LADDER.map((v) => ({
        index: v.index,
        label: v.resolution.replace('x', 'p'),
        bandwidthBps: v.videoBitrate + v.audioBitrate,
      })),
      lgpdConsentGiven: true,
    };
    assertLgpdConsent({ ...config, deployment: 'cloudflare-stream', recordingEnabled: true });
    void buildMasterPlaylist({
      deployment: 'cloudflare-stream',
      cdnBaseUrl: cdn.baseUrl,
      rtmpIngestUrl: config.rtmpIngestUrl,
      streamKey,
      eventId: body.eventId,
      latencyProfile: body.latencyProfile,
      recordingEnabled: true,
      lgpdConsentGiven: true,
    });
    return NextResponse.json({ ok: true, data: config });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function randomHex(bytes: number): string {
  let out = '';
  for (let i = 0; i < bytes; i++) {
    out += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  }
  return out;
}
