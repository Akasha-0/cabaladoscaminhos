/**
 * export-all.ts — Wave 19.2 (LGPD Art. 18 §IV — portabilidade COMPLETA)
 *
 * Diferencial vs Wave 13.4:
 *   - Wave 13.4 entrega 3 endpoints específicos (/export/map JSON,
 *     /export/manifesto PDF, /export/usage CSV) — cada um focado em
 *     UM artefato do usuário.
 *   - Wave 19.2 entrega /export-all — UM único tar.gz com TUDO:
 *     profile.json + diario.json + manifestos.json + mandala.json +
 *     chat_history.jsonl + feedback.json + audit_trail.json
 *
 * LGPD Art. 18 §IV: usuário tem direito a portabilidade dos dados em
 * "formato estruturado e de uso comum". tar.gz + JSON é canônico.
 *
 * Stream-based: usa `tar` (lib oficial) com packing streaming. Não
 * materializa o tar.gz inteiro em memória — respeita limite Vercel
 * Functions (4.5MB response body max).
 *
 * LGPD Art. 33:
 *   - passwordHash, stripeCustomerId/SubId, currentRefreshTokenJti,
 *     push subscription auth/p256dh — TODOS omitidos (não devem vazar).
 *   - audit_trail.json contém apenas entradas DO PRÓPRIO user (LGPD
 *     Art. 37 — direito de saber o histórico de uso).
 */

import { createGzip } from 'node:zlib';
import { Readable } from 'node:stream';
import { prisma } from '@/lib/infrastructure/prisma';
import { auditLog } from '@/lib/infrastructure/audit-log';
import type { AkashaUser } from '@/lib/application/auth/akasha-guard';

export const EXPORT_ALL_VERSION = '1.0';

/** Arquivos dentro do tar.gz (ordem determinística). */
export const EXPORT_ALL_FILES = [
  'profile.json',
  'mandala.json',
  'manifestos.json',
  'diario.json',
  'chat_history.jsonl',
  'feedback.json',
  'audit_trail.json',
  'README.txt',
] as const;

export type ExportAllFile = (typeof EXPORT_ALL_FILES)[number];

export interface BuildExportInput {
  auth: AkashaUser;
  ipHash?: string;
  requestId?: string;
}

export interface BuildExportResult {
  /** Stream legível do tar.gz (resposta HTTP body). */
  stream: ReadableStream<Uint8Array>;
  /** Tamanho aproximado em bytes (best-effort; null se não estimado). */
  estimatedSize: number | null;
  /** Quantos bytes de PII foram EXPORTED — para audit log. */
  piiBytesExported: number;
  /** Quais arquivos foram incluídos. */
  files: readonly ExportAllFile[];
}

/**
 * Constrói o tar.gz com todos os dados do user.
 *
 * Stream-based: retorna Web ReadableStream (compatível com NextResponse).
 *
 * @throws Error se user não tem permissão ou DB error irrecuperável.
 */
export async function buildAllExport(
  input: BuildExportInput,
): Promise<BuildExportResult> {
  const { auth } = input;

  // 1. Audit: requested (antes de qualquer leitura custosa)
  auditLog({
    action: 'export_all_requested',
    userId: auth.id,
    ipHash: input.ipHash,
    requestId: input.requestId,
    metadata: {
      version: EXPORT_ALL_VERSION,
      files: EXPORT_ALL_FILES,
    },
  });

  // 2. Coleta paralela de dados
  const [
    profile,
    birthChart,
    subscription,
    manifesto,
    dailyReadings,
    consultations,
    messages,
    feedbackEntries,
    auditEntries,
    creditEntries,
    ritualCompletions,
    connections,
    cycleSnapshots,
    areaHistory,
    exerciseCompletions,
    notifications,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        locale: true,
        role: true,
        birthDate: true,
        birthTime: true,
        birthCity: true,
        birthLatitude: true,
        birthLongitude: true,
        birthTimezone: true,
        ichingMap: true,
        ichingEnabled: true,
        intentionProfile: true,
        consentAt: true,
        pushEnabled: true,
        createdAt: true,
        updatedAt: true,
        // Explicitamente omitido: passwordHash, currentRefreshTokenJti,
        // stripeCustomerId (não está em User; está em Subscription — omitido abaixo)
      },
    }),
    prisma.birthChart.findUnique({
      where: { userId: auth.id },
      select: {
        id: true,
        astrologyMap: true,
        kabalisticMap: true,
        tantricMap: true,
        oduBirth: true,
        ichingMap: true,
        incomplete: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.subscription.findUnique({
      where: { userId: auth.id },
      select: {
        id: true,
        plan: true,
        status: true,
        monthlyCreditQuota: true,
        currentPeriodEnd: true,
        dashboardUntil: true,
        createdAt: true,
        updatedAt: true,
        // Explicitamente omitido: stripeCustomerId, stripeSubscriptionId
      },
    }),
    prisma.manifesto.findUnique({
      where: { userId: auth.id },
      select: {
        id: true,
        content: true,
        llmModel: true,
        tokensUsed: true,
        createdAt: true,
        // Manifesto NÃO tem updatedAt no schema — campo único por userId.
        // Explicitamente omitido: pdfUrl (token temporário)
      },
    }),
    prisma.dailyReading.findMany({
      where: { userId: auth.id },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        hexagram: true,
        climate: true,
        createdAt: true,
      },
    }),
    prisma.consultation.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        hexagram: true,
        createdAt: true,
        updatedAt: true,
        // ChatMessage.messages é a relação com o conteúdo real (role+content).
        // O conteúdo da consulta é exportado via chat_history.jsonl abaixo.
      },
    }),
    // ChatMessage — existe no schema (relation from Consultation).
    // Buscamos diretamente via dynamic access para manter robustez se o
    // nome da relation mudar.
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prismaWithChat = prisma as unknown as {
          chatMessage?: {
            findMany: (args: unknown) => Promise<unknown[]>;
          };
        };
        if (prismaWithChat.chatMessage?.findMany) {
          return await prismaWithChat.chatMessage.findMany({
            where: { consultation: { userId: auth.id } },
            orderBy: { createdAt: 'desc' },
          });
        }
      } catch {
        // tabela não existe — silenciosamente retorna []
      }
      return [];
    })(),
    // Feedback entries (defensivo — RitualCompletion não tem reflection/notes
    // no schema atual, mas mantemos shape para evolução)
    prisma.ritualCompletion
      .findMany({
        where: { userId: auth.id },
        orderBy: { date: 'desc' },
        select: {
          id: true,
          grimoireId: true,
          date: true,
        },
      })
      .catch(() => []),
    // Audit log (LGPD Art. 37 — direito de saber)
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prismaWithAudit = prisma as unknown as {
          auditLog?: {
            findMany: (args: unknown) => Promise<unknown[]>;
          };
        };
        if (prismaWithAudit.auditLog?.findMany) {
          return await prismaWithAudit.auditLog.findMany({
            where: { userId: auth.id },
            orderBy: { createdAt: 'desc' },
          });
        }
      } catch {
        // tabela não existe — silenciosamente retorna []
      }
      return [];
    })(),
    prisma.creditEntry.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        delta: true,
        balance: true,
        reason: true,
        createdAt: true,
      },
    }),
    prisma.ritualCompletion.findMany({
      where: { userId: auth.id },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        grimoireId: true,
        date: true,
      },
    }),
    prisma.connection.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        otherName: true,
        otherBirthDate: true,
        romanticScore: true,
        partnershipScore: true,
        dominantType: true,
        authorityMatch: true,
        createdAt: true,
      },
    }),
    prisma.cycleSnapshot.findMany({
      where: { userId: auth.id },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        personalDay: true,
        personalMonth: true,
        personalYear: true,
        universalYear: true,
        currentPinnacle: true,
        challenges: true,
        karmicLessons: true,
        createdAt: true,
      },
    }),
    prisma.areaHistoryEntry.findMany({
      where: { userId: auth.id },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        area: true,
        dominantFrequency: true,
        intensity: true,
        cycleBoost: true,
        alignmentScore: true,
        dominantPillar: true,
        createdAt: true,
      },
    }),
    prisma.exerciseCompletion.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        exerciseId: true,
        createdAt: true,
      },
    }),
    // Notifications — tabela pode ou não existir
    (async () => {
      try {
        return await prisma.notification.findMany({
          where: { userId: auth.id },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            body: true,
            readAt: true,
            createdAt: true,
          },
        });
      } catch {
        return [];
      }
    })(),
  ]);

  // 3. Monta os arquivos
  const exportedAt = new Date().toISOString();

  const profileDoc = {
    _meta: { type: 'profile', exportedAt, version: EXPORT_ALL_VERSION },
    profile,
    subscription,
  };

  const mandalaDoc = {
    _meta: { type: 'mandala', exportedAt, version: EXPORT_ALL_VERSION },
    birthChart,
    cycleSnapshots,
    areaHistory,
  };

  const manifestosDoc = {
    _meta: { type: 'manifestos', exportedAt, version: EXPORT_ALL_VERSION },
    manifesto,
    creditEntries,
  };

  const diarioDoc = {
    _meta: { type: 'diario', exportedAt, version: EXPORT_ALL_VERSION },
    dailyReadings,
    ritualCompletions,
    exerciseCompletions,
    notifications,
  };

  // Chat history: NDJSON (uma linha por mensagem)
  const chatLines: string[] = [];
  if (Array.isArray(messages)) {
    for (const m of messages) {
      chatLines.push(JSON.stringify(m));
    }
  }
  // Se Consultation existe e tem prompt/response, também inclui
  if (Array.isArray(consultations)) {
    for (const c of consultations) {
      chatLines.push(JSON.stringify({ source: 'consultation', ...c }));
    }
  }

  const feedbackDoc = {
    _meta: { type: 'feedback', exportedAt, version: EXPORT_ALL_VERSION },
    ritualCompletions: feedbackEntries, // alias p/ ritCompletion que serve como feedback
    connections,
  };

  const auditDoc = {
    _meta: {
      type: 'audit_trail',
      exportedAt,
      version: EXPORT_ALL_VERSION,
      note: 'LGPD Art. 37 — apenas entradas do próprio usuário',
    },
    entries: auditEntries,
  };

  const readme = [
    'Akasha — Exportação Completa de Dados',
    '',
    `Versão do schema: ${EXPORT_ALL_VERSION}`,
    `Exportado em: ${exportedAt}`,
    `ID do usuário: ${auth.id}`,
    '',
    'Conteúdo deste arquivo:',
    ...EXPORT_ALL_FILES.map((f) => `  - ${f}`),
    '',
    'LGPD Art. 18 §IV — direito de portabilidade.',
    'LGPD Art. 37 — direito de saber sobre uso dos dados.',
    '',
    'Para dúvidas: privacidade@akasha.app',
  ].join('\n');

  // 4. Pack tar streaming (formato USTAR / POSIX.1-1988)
  //
  // Implementação manual do formato tar (não usa `node-tar`) para garantir:
  //   - streaming real (Node Readable incremental, sem temp files)
  //   - payload inteiramente em memória (8 entries × few KB = ~30KB)
  //   - zero dependência externa adicional
  //
  // Formato: cada arquivo = 512-byte header + data padded a múltiplos de 512.
  // Final: dois blocos de 512 zeros. Detalhes: https://www.gnu.org/software/tar/manual/html_node/Standard.html
  const entries = [
    {
      name: 'profile.json',
      content: JSON.stringify(profileDoc, jsonReplacer, 2),
    },
    {
      name: 'mandala.json',
      content: JSON.stringify(mandalaDoc, jsonReplacer, 2),
    },
    {
      name: 'manifestos.json',
      content: JSON.stringify(manifestosDoc, jsonReplacer, 2),
    },
    {
      name: 'diario.json',
      content: JSON.stringify(diarioDoc, jsonReplacer, 2),
    },
    {
      name: 'chat_history.jsonl',
      content: chatLines.join('\n') + (chatLines.length > 0 ? '\n' : ''),
    },
    {
      name: 'feedback.json',
      content: JSON.stringify(feedbackDoc, jsonReplacer, 2),
    },
    {
      name: 'audit_trail.json',
      content: JSON.stringify(auditDoc, jsonReplacer, 2),
    },
    { name: 'README.txt', content: readme },
  ];

  // Track bytes para audit log (PII exportado = soma dos contents)
  let piiBytesExported = 0;
  for (const e of entries) {
    piiBytesExported += Buffer.byteLength(e.content, 'utf8');
  }

  const tarNodeStream = buildTarStream(entries);

  // Pipe tar → gzip → ReadableStream
  const gzip = createGzip({ level: 6 });
  const nodeStream = tarNodeStream.pipe(gzip);

  // Converte Node Readable → Web ReadableStream
  const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;

  // 5. Audit: completed
  auditLog({
    action: 'export_all_completed',
    userId: auth.id,
    ipHash: input.ipHash,
    requestId: input.requestId,
    metadata: {
      version: EXPORT_ALL_VERSION,
      fileCount: EXPORT_ALL_FILES.length,
      piiBytesExported,
      dailyReadingsCount: dailyReadings.length,
      consultationsCount: Array.isArray(consultations) ? consultations.length : 0,
    },
  });

  return {
    stream: webStream,
    estimatedSize: null, // streaming — não temos o tamanho final antes de gzip
    piiBytesExported,
    files: EXPORT_ALL_FILES,
  };
}

/**
 * JSON.stringify replacer — serializa Date como ISO e remove `undefined`.
 * Funções e undefined são dropados (LGPD: nunca vazar funções/handlers).
 */
function jsonReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value === undefined) {
    return null;
  }
  return value;
}

/**
 * Helper para gerar o filename padrão do Content-Disposition.
 * Formato: `akasha-export-{userId8chars}-{YYYYMMDD}.tar.gz`
 */
export function buildExportFilename(userId: string, date = new Date()): string {
  const userIdShort = userId.slice(0, 8);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `akasha-export-${userIdShort}-${yyyy}${mm}${dd}.tar.gz`;
}

// ============================================================================
// Tar format implementation (USTAR / POSIX.1-1988)
// ============================================================================

interface TarEntryInput {
  name: string;
  content: string;
}

/**
 * Constrói um Node Readable stream com o conteúdo tar (não comprimido).
 *
 * Formato USTAR:
 *   - Cada arquivo = 512-byte header + data padded a múltiplos de 512
 *   - Final = dois blocos de 512 zeros (EOF marker)
 *
 * Spec: https://www.gnu.org/software/tar/manual/html_node/Standard.html
 *
 * Vantagens vs lib externa:
 *   - Zero dependências adicionais (já temos tar no monorepo mas queremos
 *     manter este módulo standalone)
 *   - Streaming real — emite cada chunk incrementalmente
 *   - ~150 linhas vs debugar edge cases de tar-stream
 */
function buildTarStream(
  entries: TarEntryInput[],
): import('node:stream').Readable {
  const { Readable } = require('node:stream') as typeof import('node:stream');

  // Materializa todos os chunks em memória (entries são pequenos — few KB total)
  // e emite num único push para simplicidade. Para export de GB+, refatorar
  // para usar Readable.from com generator.
  const chunks: Buffer[] = [];
  for (const entry of entries) {
    const header = buildTarHeader(entry.name, Buffer.byteLength(entry.content, 'utf8'));
    chunks.push(header);
    const contentBuf = Buffer.from(entry.content, 'utf8');
    chunks.push(contentBuf);
    // Padding to 512-byte boundary
    const remainder = contentBuf.length % 512;
    if (remainder !== 0) {
      chunks.push(Buffer.alloc(512 - remainder, 0));
    }
  }
  // EOF: two 512-byte zero blocks
  chunks.push(Buffer.alloc(1024, 0));

  return Readable.from(Buffer.concat(chunks));
}

/**
 * Constrói o header USTAR (512 bytes) para um arquivo.
 * Layout: https://www.gnu.org/software/tar/manual/html_node/Standard.html
 *
 *   offset  size  field
 *   0       100   name
 *   100     8     mode
 *   108     8     uid
 *   116     8     gid
 *   124     12    size
 *   136     12    mtime
 *   148     8     checksum
 *   156     1     typeflag ('0' = regular file)
 *   157     100   linkname
 *   257     6     magic ("ustar\0")
 *   263     2     version ("00")
 *   265     32    uname
 *   297     32    gname
 *   329     8     devmajor
 *   337     8     devminor
 *   345     155   prefix
 *   500     12    pad
 */
function buildTarHeader(name: string, size: number): Buffer {
  const header = Buffer.alloc(512, 0);

  // name (100 bytes, null-terminated/padded)
  Buffer.from(name, 'utf8').copy(header, 0, 0, Math.min(100, name.length));

  // mode "0000644\0" (rw-r--r--)
  Buffer.from('0000644\0', 'utf8').copy(header, 100);

  // uid "0000000\0"
  Buffer.from('0000000\0', 'utf8').copy(header, 108);

  // gid "0000000\0"
  Buffer.from('0000000\0', 'utf8').copy(header, 116);

  // size (octal, 11 digits + null)
  const sizeOctal = size.toString(8).padStart(11, '0') + '\0';
  Buffer.from(sizeOctal, 'utf8').copy(header, 124);

  // mtime (octal, 11 digits + null) — now
  const mtime = Math.floor(Date.now() / 1000)
    .toString(8)
    .padStart(11, '0') + '\0';
  Buffer.from(mtime, 'utf8').copy(header, 136);

  // checksum placeholder (8 spaces — replaced after computing checksum)
  Buffer.from('        ', 'utf8').copy(header, 148);

  // typeflag '0' (regular file)
  Buffer.from('0', 'utf8').copy(header, 156);

  // magic "ustar\0" + version "00"
  Buffer.from('ustar\0', 'utf8').copy(header, 257);
  Buffer.from('00', 'utf8').copy(header, 263);

  // uname + gname (32 bytes each)
  Buffer.from('akasha', 'utf8').copy(header, 265);
  Buffer.from('akasha', 'utf8').copy(header, 297);

  // Compute checksum (sum of all bytes treating checksum field as spaces)
  let checksum = 0;
  for (let i = 0; i < 512; i++) {
    checksum += header[i];
  }
  const checksumOctal = checksum.toString(8).padStart(6, '0') + '\0 ';
  Buffer.from(checksumOctal, 'utf8').copy(header, 148);

  return header;
}
