import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/auth/akasha-guard';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import ManifestoPDF from '@/components/akasha/ManifestoPDF';
import type { ManifestoContent } from '@/components/akasha/ManifestoPDF';

export async function GET(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const manifesto = await prisma.manifesto.findUnique({
    where: { userId: auth.id },
  });

  if (!manifesto) {
    return NextResponse.json(
      { error: 'Manifesto não gerado. Acesse /manifesto primeiro.' },
      { status: 404 }
    );
  }

  const content = manifesto.content as unknown as ManifestoContent;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(ManifestoPDF, { content }) as any;
  const buffer = await renderToBuffer(element);

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="manifesto-akasha-${auth.id.slice(0, 8)}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
