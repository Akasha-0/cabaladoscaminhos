/**
 * /[locale]/(akasha)/admin/benchmarks/annotate — Wave 32.2
 *
 * Server Component que:
 *   1. Autentica (JWT cookie + ADMIN role)
 *   2. Lê responses do Mentor redacted via API
 *   3. Lê progresso de annotations (todos anotadores)
 *   4. Renderiza client component AnnotateUI com tudo
 *
 * LGPD: nada de PII do consulente chega aqui (redaction no API).
 */
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { prisma } from '@/lib/infrastructure/prisma';
import { ChatRole } from '@prisma/client';
import { redactMessagesForAnnotation, type RedactableMessage } from '@/lib/application/privacy/redact';
import AnnotateUI from '@/components/akasha/admin/AnnotateUI';
import type { ProgressByAnnotator } from '@/components/akasha/admin/AnnotateUI';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Calibração AUT — Akasha Admin',
  description:
    'Anotação humana R/T/U/V para validar construct validity dos 4 critérios AUT (Wave 32.2, ADR-027).',
};

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AnnotatePage({ params }: PageProps) {
  const { locale } = await params;

  // 1. Auth
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');
  if (authStatus !== 'refreshed' && (!token || !verifyAkashaToken(token, 'access'))) {
    redirect(`/${locale}/login`);
  }

  // 2. ADMIN role check
  if (!token) redirect(`/${locale}/login`);
  const payload = verifyAkashaToken(token, 'access');
  if (!payload?.sub) redirect(`/${locale}/login`);
  const caller = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, name: true, email: true },
  });
  if (caller?.role !== 'ADMIN') {
    redirect(`/${locale}/dashboard?forbidden=admin`);
  }

  // 3. Carrega responses redacted (não anotadas pelo caller) + progresso geral
  const alreadyAnnotated = await prisma.benchmarkAnnotation.findMany({
    where: { annotatorId: caller.id },
    select: { responseId: true },
  });
  const alreadyIds = alreadyAnnotated.map((a) => a.responseId);
  // Buscar responses do Mentor (Mentor = "ORACLE" no schema atual).
    const messages = await prisma.chatMessage.findMany({
      where: {
        role: ChatRole.ORACLE,
      ...(alreadyIds.length > 0 ? { id: { notIn: alreadyIds } } : {}),
    },
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: {
      consultation: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  const redactable: RedactableMessage[] = messages.map((m) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt,
    consultationTitle: m.consultation.title,
    consultationUser: m.consultation.user
      ? { name: m.consultation.user.name, email: m.consultation.user.email }
      : null,
    routedPillars: m.routedPillars,
  }));
  const responses = redactMessagesForAnnotation(redactable);

  // 4. Progresso por anotador
  const groups = await prisma.benchmarkAnnotation.groupBy({
    by: ['annotatorId'],
    _count: { _all: true },
    _min: { annotatedAt: true },
    _max: { annotatedAt: true },
  });
  const annotatorIds = groups.map((g) => g.annotatorId);
  const annotators = await prisma.user.findMany({
    where: { id: { in: annotatorIds } },
    select: { id: true, name: true, email: true, role: true },
  });
  const progress: ProgressByAnnotator[] = groups.map((g) => {
    const u = annotators.find((a) => a.id === g.annotatorId);
    return {
      annotatorId: g.annotatorId,
      annotatorName: u?.name ?? '(deleted user)',
      annotatorRole: u?.role ?? null,
      annotationsCount: g._count._all,
      firstAnnotationAt: g._min.annotatedAt?.toISOString() ?? null,
      lastAnnotationAt: g._max.annotatedAt?.toISOString() ?? null,
    };
  });
  const totalAnnotations = groups.reduce((s, g) => s + g._count._all, 0);

  return (
    <AnnotateUI
      locale={locale}
      callerId={caller.id}
      callerName={caller.name ?? caller.email ?? 'Admin'}
      responses={responses}
      progress={progress}
      totalAnnotations={totalAnnotations}
    />
  );
}
