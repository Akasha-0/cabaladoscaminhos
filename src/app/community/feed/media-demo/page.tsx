// ============================================================================
// W94-C — Demo page: Multimedia Posts (Audio / Video / Carrossel de Ayan)
// ============================================================================
// Server component que renderiza 4-5 posts multimídia de exemplo + o
// formulário de criação. Usa mock URLs (placeholder, paths válidos).
//
// i18n keys novas: media.* (pt-BR canonical, en/es stubs).
// ============================================================================

import { Metadata } from 'next';
import { AudioPost } from '@/components/community/AudioPost';
import { VideoPost } from '@/components/community/VideoPost';
import { CarrosselAyan } from '@/components/community/CarrosselAyan';
import { CreateMediaPost } from '@/components/community/CreateMediaPost';
import { getWaveformPeaks } from '@/lib/w94/media-posts';
import type { AudioPost as AudioPostType } from '@/lib/w94/media-posts';
import type { VideoPost as VideoPostType } from '@/lib/w94/media-posts';
import type { CarrosselAyanPost as CarrosselAyanPostType } from '@/lib/w94/media-posts';

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Posts Multimídia — Áudio, Vídeo e Carrossel de Ayan · Akasha',
  description:
    'Demonstração do feed multimídia da comunidade Akasha: áudios narrados, vídeos curtos, e Carrossel de Ayan (3-5 segmentos em jornada).',
  robots: { index: false, follow: false },
};

// ============================================================================
// Fixtures (server-side)
// ============================================================================

function makeWaveform(): number[] {
  // Mock: 200 peaks com envelope variável
  const buf = new Float32Array(44100);
  for (let i = 0; i < buf.length; i++) {
    buf[i] = Math.sin(i * 0.013) * 0.6 + Math.sin(i * 0.07) * 0.3;
  }
  return getWaveformPeaks(buf, 200);
}

const audioPost: AudioPostType = {
  kind: 'audio',
  id: 'demo-audio-001',
  authorId: 'Cigano Ramiro',
  title: 'Oração para Iemanjá — fechamento de gira',
  audioUrl: '/audio/sample-iemanjá.mp3',
  durationSec: 184,
  waveformData: makeWaveform(),
  transcription:
    '00:00 Saudação a Iemanjá, senhora dos mares\n0:30 Pedimos licença para abrir este trabalho\n1:30 Axé para todas as cabeças presentes\n2:30 Fechamento com gratidão',
  sacredMetadata: {
    tradition: 'candomble',
    entities: ['Iemanjá', 'Oxum'],
    oduRef: 'Odu 7 — Ogundá',
  },
  createdAt: '2026-06-30T14:00:00.000Z',
};

const videoPost: VideoPostType = {
  kind: 'video',
  id: 'demo-video-001',
  authorId: 'Maria do Axé',
  title: 'Ponto de Ogum — abertura de terreiro',
  videoUrl: '/video/ogum-ponto.mp4',
  posterUrl: '/img/poster-ogum.jpg',
  durationSec: 47,
  transcription:
    '00:00 Abertura com pemba riscada no chão\n0:15 Ogum, senhor das batalhas\n0:30 Abre os caminhos, faca de ferro na mão\n0:45 Fechamento com saudação ao santo',
  chapters: [
    { startSec: 0, title: 'Abertura', index: 0 },
    { startSec: 15, title: 'Ogum, senhor das batalhas', index: 1 },
    { startSec: 30, title: 'Abre os caminhos', index: 2 },
    { startSec: 45, title: 'Fechamento', index: 3 },
  ],
  sacredMetadata: {
    tradition: 'umbanda',
    entities: ['Ogum'],
  },
  createdAt: '2026-06-30T13:30:00.000Z',
};

const carrosselPost: CarrosselAyanPostType = {
  kind: 'carrossel',
  id: 'demo-carrossel-001',
  authorId: 'Pai Joaquim',
  title: 'Ritual de Abertura — Caboclo das Matas',
  segments: [
    {
      kind: 'audio',
      id: 'car-seg-1',
      authorId: 'Pai Joaquim',
      title: 'Saudação ao Caboclo',
      audioUrl: '/audio/caboclo-1.mp3',
      durationSec: 32,
      waveformData: makeWaveform(),
      sacredMetadata: { tradition: 'umbanda', entities: ['Caboclo'] },
      createdAt: '2026-06-30T12:00:00.000Z',
    },
    {
      kind: 'video',
      id: 'car-seg-2',
      authorId: 'Pai Joaquim',
      title: 'Defumação do terreiro',
      videoUrl: '/video/defumacao.mp4',
      posterUrl: '/img/poster-defumacao.jpg',
      durationSec: 28,
      sacredMetadata: { tradition: 'umbanda', entities: ['Caboclo'] },
      createdAt: '2026-06-30T12:01:00.000Z',
    },
    {
      kind: 'audio',
      id: 'car-seg-3',
      authorId: 'Pai Joaquim',
      title: 'Ponto de firmeza',
      audioUrl: '/audio/firmeza.mp3',
      durationSec: 35,
      waveformData: makeWaveform(),
      sacredMetadata: { tradition: 'umbanda', entities: ['Caboclo'] },
      createdAt: '2026-06-30T12:02:00.000Z',
    },
  ],
  commonTradition: 'umbanda',
  createdAt: '2026-06-30T12:00:00.000Z',
};

// ============================================================================
// Page
// ============================================================================

export default function MediaDemoPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="px-4 py-10 sm:py-16 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-100 leading-tight">
          Posts Multimídia
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
          Áudios narrados, vídeos curtos e Carrossel de Ayan — 3-5 segmentos formando
          uma jornada. Cada post preserva a tradição e o axé. Transcrições com PII
          são redigidas conforme LGPD.
        </p>
        <p className="mt-2 text-xs text-amber-300/80">
          axé · ciclo 94 · wave 3 de 4
        </p>
      </section>

      {/* Examples */}
      <section className="px-4 pb-10 max-w-3xl mx-auto space-y-6">
        <h2 className="text-sm uppercase tracking-wide text-slate-500 font-medium">
          Exemplos
        </h2>

        <AudioPost post={audioPost} />

        <VideoPost post={videoPost} />

        <CarrosselAyan post={carrosselPost} />
      </section>

      {/* Create form */}
      <section className="px-4 pb-20 max-w-3xl mx-auto space-y-4">
        <h2 className="text-sm uppercase tracking-wide text-slate-500 font-medium">
          Criar novo post multimídia
        </h2>
        <CreateMediaPost
          onCreate={async (post) => {
            // Demo: simula criação (não persiste). Console para dev.
            // eslint-disable-next-line no-console
            console.log('[media-demo] onCreate stub:', post);
            return { ok: true };
          }}
        />
      </section>
    </main>
  );
}
