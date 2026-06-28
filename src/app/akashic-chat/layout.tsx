// ============================================================================
// /akashic-chat — Layout (Wave 27 perf — metadata)
// ============================================================================
// Wave 27 perf:
//   - Adiciona metadata (SEO + perf) — akashic-chat/page.tsx é 'use client'
//     e não pode exportar metadata diretamente.
//   - Mantém a página como client island (SSE + voice mode).
//
// Distingue-se de /akashic por:
//   - /akashic: sidebar de sources, mais rico visualmente
//   - /akashic-chat: foco no chat, mais compacto, citations inline
// ============================================================================

import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/og';

export const metadata: Metadata = buildPageMetadata({
  title: 'Akashic Chat — Pergunte à IA curadora',
  description:
    'Chat direto com a Akashic IA. Faça perguntas sobre Cabala, Ifá, Tantra, Meditação, Xamanismo, Astrologia e mais. Respostas com citações das fontes.',
  path: '/akashic-chat',
  category: 'ai',
  priority: 0.7,
});

export default function AkashicChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}