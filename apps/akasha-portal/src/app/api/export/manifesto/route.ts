/**
 * /api/export/manifesto — LGPD Art. 18 (V)
 *
 * Retorna um PDF manifesto do usuário autenticado. Conteúdo:
 *   - Cabeçalho com nome + email
 *   - Dados de nascimento (data, hora, cidade)
 *   - Resumo dos 5 Pilares (se houver mapa astral calculado)
 *   - Pilar dominante (heurística simples sobre os 5)
 *   - Código do dia atual (DailyReading.hexagram ou fallback data ISO)
 *   - Footer com data de geração e nota LGPD
 *
 * Implementação: server-side jsPDF (sem dependência de browser/Canvas).
 * Conteúdo é texto puro em PT-BR para garantir legibilidade em qualquer
 * leitor de PDF (mobile-first).
 *
 * LGPD: autenticação obrigatória via requireAkashaApi; nenhum dado de
 * outros usuários é tocado.
 */

import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PilarResumo {
  nome: string;
  presente: boolean;
  snippet: string;
}

// Extrai uma string curta descrevendo o conteúdo de um Pilar (Json arbitrário).
// Estratégia: encontrar primeiro campo string razoavelmente curto. Fallback
// para JSON.stringify truncado. Nunca lança.
function snippetFromPilar(pilar: unknown, fallbackLabel: string): string {
  if (!pilar || typeof pilar !== 'object') {
    return 'Pilar não calculado';
  }
  const obj = pilar as Record<string, unknown>;

  const candidateKeys = [
    'resumo',
    'summary',
    'descricao',
    'description',
    'titulo',
    'title',
    'nome',
    'name',
    'cabalisticName',
    'sun',
    'signo',
    'sign',
    'corpoDominante',
    'dominantBody',
    'odu',
    'hexagrama',
    'hexagram',
  ];

  for (const key of candidateKeys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim().length > 0 && value.length <= 200) {
      return value;
    }
  }

  try {
    const json = JSON.stringify(pilar);
    return json.length > 180 ? `${json.slice(0, 177)}...` : json;
  } catch {
    return fallbackLabel;
  }
}

// Heurística simples para pilar "dominante" — escolhe o primeiro pilar
// presente na ordem Cabala → Astrologia → Tantra → Odu → I-Ching. A ordem
// reflete a tradição da Cabala dos Caminhos (Pilar 1 é a fundação).
function escolherPilarDominante(pilares: PilarResumo[]): PilarResumo | null {
  for (const p of pilares) {
    if (p.presente) return p;
  }
  return null;
}

export async function GET(request: NextRequest) {
  // Auth obrigatória (LGPD)
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult.id;

  // Busca user + chart + último DailyReading em paralelo
  const [user, chart, todayReading] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        birthDate: true,
        birthTime: true,
        birthCity: true,
        ichingMap: true,
      },
    }),
    prisma.birthChart.findUnique({ where: { userId } }),
    prisma.dailyReading.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { hexagram: true, climate: true, date: true },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const pilares: PilarResumo[] = [
    {
      nome: 'Pilar 1 — Cabala',
      presente: Boolean(chart?.kabalisticMap),
      snippet: snippetFromPilar(chart?.kabalisticMap, 'Cabala'),
    },
    {
      nome: 'Pilar 2 — Astrologia',
      presente: Boolean(chart?.astrologyMap),
      snippet: snippetFromPilar(chart?.astrologyMap, 'Astrologia'),
    },
    {
      nome: 'Pilar 3 — Tantra',
      presente: Boolean(chart?.tantricMap),
      snippet: snippetFromPilar(chart?.tantricMap, 'Tantra'),
    },
    {
      nome: 'Pilar 4 — Odu',
      presente: Boolean(chart?.oduBirth),
      snippet: snippetFromPilar(chart?.oduBirth, 'Odu'),
    },
    {
      nome: 'Pilar 5 — I Ching',
      presente: Boolean(chart?.ichingMap ?? user.ichingMap),
      snippet: snippetFromPilar(chart?.ichingMap ?? user.ichingMap, 'I Ching'),
    },
  ];

  const pilarDominante = escolherPilarDominante(pilares);
  const codigoDoDia = todayReading?.hexagram ?? new Date().toISOString().slice(0, 10);

  // ── Geração do PDF ─────────────────────────────────────────────────────
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Cabeçalho
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Manifesto Akasha', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, y, {
    align: 'center',
  });
  y += 12;

  // Identidade
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(user.name, margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(user.email, margin, y);
  y += 8;

  // Dados de nascimento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Dados de nascimento', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const birthDateStr = user.birthDate
    ? new Date(user.birthDate).toLocaleDateString('pt-BR')
    : '—';
  const birthTimeStr = user.birthTime ?? '—';
  const birthCityStr = user.birthCity ?? '—';
  doc.text(`Data: ${birthDateStr}`, margin, y);
  y += 5;
  doc.text(`Hora: ${birthTimeStr}`, margin, y);
  y += 5;
  doc.text(`Local: ${birthCityStr}`, margin, y);
  y += 10;

  // Pilar dominante
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Pilar dominante', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (pilarDominante) {
    doc.text(pilarDominante.nome, margin, y);
    y += 5;
    const lines = doc.splitTextToSize(pilarDominante.snippet, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 3;
  } else {
    doc.text(
      'Nenhum Pilar calculado ainda — visite /mapa para gerar seu mapa completo.',
      margin,
      y,
    );
    y += 10;
  }

  // 5 Pilares (resumo)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Os 5 Pilares', margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  for (const pilar of pilares) {
    if (y > 260) {
      doc.addPage();
      y = margin;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(pilar.nome, margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const status = pilar.presente ? 'Calculado' : 'Pendente';
    const lines = doc.splitTextToSize(
      `[${status}] ${pilar.snippet}`,
      pageWidth - margin * 2,
    );
    doc.text(lines, margin, y);
    y += lines.length * 5 + 4;
  }

  // Código do dia
  if (y > 260) {
    doc.addPage();
    y = margin;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Código do dia', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(String(codigoDoDia), margin, y);
  y += 10;

  // Footer LGPD
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const footer = `Documento gerado para ${user.email} conforme LGPD Art. 18 (portabilidade).`;
  doc.text(footer, pageWidth / 2, 285, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  const filename = `akasha-manifesto-${user.id.slice(0, 8)}-${Date.now()}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}