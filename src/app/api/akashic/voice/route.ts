// POST /api/akashic/voice
// Wave 38 — Voice chat endpoint (Whisper STT → Akasha → TTS)
import { NextRequest, NextResponse } from 'next/server';
import {
  transcribeAudio,
  synthesizeSpeech,
  resolveVoiceId,
  type VoiceSessionConfig,
} from '@/lib/ai/voice/chat';
import { detectCrisis } from '@/lib/ai/safety/escalation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const crisisCheck = detectCrisis(req.headers.get('user-message') ?? '');
  if (crisisCheck.isCrisis) {
    return NextResponse.json(
      { error: 'crisis_detected', severity: crisisCheck.severity, redirect: '/akashic/crisis' },
      { status: 200 },
    );
  }

  const form = await req.formData();
  const audio = form.get('audio') as Blob | null;
  const text = form.get('text') as string | null;
  const session: VoiceSessionConfig = JSON.parse((form.get('session') as string) ?? '{}');

  if (!session.audioOptIn) {
    return NextResponse.json({ error: 'lgpd_optin_required' }, { status: 400 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: 'openai_key_missing' }, { status: 500 });
  }

  // STT path: audio → text
  if (audio) {
    const transcription = await transcribeAudio(
      {
        audio,
        mimeType: (form.get('mimeType') as 'audio/webm' | 'audio/wav') ?? 'audio/webm',
        session,
      },
      openaiKey,
    );
    return NextResponse.json({
      transcription,
      audioStored: false, // LGPD Art. 37
    });
  }

  // TTS path: text → audio
  if (text) {
    const voiceId = resolveVoiceId(session.tradition, session.preferredVoice);
    const synthesis = await synthesizeSpeech(
      { text, voiceId, speed: session.speed ?? 1.0 },
      openaiKey,
    );
    return NextResponse.json({
      synthesis,
      audioStored: false,
    });
  }

  return NextResponse.json({ error: 'no_input' }, { status: 400 });
}