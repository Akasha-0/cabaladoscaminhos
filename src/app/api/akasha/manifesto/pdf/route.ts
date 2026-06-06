import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/auth/akasha-guard';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import ManifestoPDF from '@/components/akasha/ManifestoPDF';
import type { ManifestoContent } from '@/components/akasha/ManifestoPDF';

export async function GET(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const manifesto = await prisma.akashaManifesto.findUnique({
    where: { userId: auth.id },
  });

  if (!manifesto) {
    return NextResponse.json(
      { error: 'Manifesto não gerado. Chame POST /api/akasha/manifesto/generate primeiro.' },
      { status: 404 }
    );
  }

  // renderToBuffer requer ReactElement do react-pdf — cast via unknown para satisfazer o tipo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(ManifestoPDF, { content: manifesto.content as unknown as ManifestoContent }) as any;
  const buffer = await renderToBuffer(element);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="manifesto-akashico.pdf"',
      'Content-Length': String(buffer.byteLength),
    },
  });
}
