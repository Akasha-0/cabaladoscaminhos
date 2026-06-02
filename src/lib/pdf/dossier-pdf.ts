// src/lib/pdf/dossier-pdf.ts
// Gerador de PDF do Dossiê Cabalístico usando jsPDF v4.
// Executado 100% no cliente (browser) — não requer dependência de servidor.
// Estilo Ramiro: fundo royal escuro, texto claro, laranja para destaques.
import jsPDF from 'jspdf';

import { LENORMAND_CARDS } from '@/lib/constants/lenormand-cards';

// ----------------------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------------------

export interface PdfReportContent {
  houses: Record<
    string,
    { houseNumber?: number; houseName?: string; carta?: string; odu?: string; interpretation: string }
  >;
  synthesis?: {
    workAndMoney?: string;
    homeAndFamily?: string;
    loveAndRelationships?: string;
    spiritualPath?: string;
    finalVerdict?: string;
  };
}

export interface PdfMatrixData {
  [casa: string]: { carta: number; odu: number } | null;
}

export interface DossierPdfData {
  clientName: string;
  readingDate: string;
  reportCreatedAt: string;
  matrixData: PdfMatrixData;
  reportContent: PdfReportContent;
  maps: {
    astrology: Record<string, unknown> | unknown[] | null;
    kabalistic: Record<string, unknown> | unknown[] | null;
    tantric: Record<string, unknown> | unknown[] | null;
    odu: Record<string, unknown> | unknown[] | null;
  };
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

/** Retorna o nome da carta Lenormand dado o número (1-36). */
function cartaNome(numero: number): string {
  return LENORMAND_CARDS[numero - 1]?.name ?? `Carta ${numero}`;
}

/** Retorna o label do Odu dado o número. */
function oduNome(numero: number): string {
  const odus = [
    'Ogundá', 'Ogbe', 'Yekun', 'Irosun', 'Owonrin', 'Obara',
    'Okanran', 'Ogunda', 'Osa', 'Ika', 'Oturupon', 'Otura',
    'Lewi', 'Eji-Ogbe', 'Alafia', 'Irete',
  ];
  return odus[numero - 1] ?? `Odu ${numero}`;
}

/** Limpa markdown básico para texto legível em PDF. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*>\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ----------------------------------------------------------------------------
// Cores — Estilo Ramiro
// ----------------------------------------------------------------------------

const ROYAL_DARK = [13, 10, 40] as const;      // #0D0A28 — fundo principal
const ROYAL_MID  = [22, 17, 70] as const;      // #161146 — cards
const ROYAL_LIGHT = [35, 30, 100] as const;    // #231E64 — bordas
const LARANJA    = [235, 100, 20] as const;   // #EB6414 — destaques
const LARANJA_BG = [70, 20, 0] as const;      // bg laranja escuro
const TEXT_WHITE  = [245, 240, 230] as const; // texto principal
const TEXT_MUTED  = [200, 195, 220] as const; // texto secundário
const TEXT_ACCENT = [255, 190, 80] as const;  // laranja claro

// ----------------------------------------------------------------------------
// Constantes de layout (A4, milimetros)
// ----------------------------------------------------------------------------

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BOTTOM_MARGIN = 15;
const LINE_H = 6;

// ----------------------------------------------------------------------------
// Função principal
// ----------------------------------------------------------------------------

/**
 * Gera o PDF do dossiê no browser e dispara o download.
 *
 * @param data  Dados completos retornados pela API /api/mesa-real/pdf
 * @returns void — dispara window.open com o Blob URL
 */
export function generateDossierPDF(data: DossierPdfData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ---------------------------------------------------------------------------
  // helpers de página
  // ---------------------------------------------------------------------------

  /** Posição Y atual — permite rastrear onde estamos na página. */
  let y = MARGIN;

  /** Desenha o rodapé da página com o número. */
  function addFooter(pageNum: number) {
    const total = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Cabala dos Caminhos · Dossiê Cabalístico · ${data.clientName}`,
      PAGE_W / 2,
      PAGE_H - 6,
      { align: 'center' },
    );
    doc.text(`${pageNum} / ${total}`, PAGE_W - MARGIN, PAGE_H - 6, { align: 'right' });
  }

  /** Desenha fundo royal escuro em toda a página. */
  function fillRoyalBg() {
    doc.setFillColor(...ROYAL_DARK);
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  }

  /** Reseta cursor para topo após quebra de página. */
  function newPage(pg = 1) {
    doc.addPage();
    fillRoyalBg();
    y = MARGIN;
    addFooter(pg);
  }

  /** Verifica espaço e quebra página se necessário. */
  function ensureSpace(minLines: number): void {
    const needed = minLines * LINE_H;
    if (y + needed > PAGE_H - BOTTOM_MARGIN) {
      newPage();
    }
  }

  /** Linha separadora laranja. */
  function divider(accent = LARANJA) {
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 4;
  }

  // ---------------------------------------------------------------------------
  // PÁGINA 1 — CAPA
  // ---------------------------------------------------------------------------
  fillRoyalBg();

  // Faixa laranja superior
  doc.setFillColor(...LARANJA);
  doc.rect(0, 0, PAGE_W, 60, 'F');

  // Título na faixa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...TEXT_WHITE);
  doc.text('Dossiê Cabalístico', PAGE_W / 2, 28, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(255, 220, 180);
  doc.text('Mesa Real · Cabala dos Caminhos', PAGE_W / 2, 40, { align: 'center' });

  // Faixa laranja inferior
  doc.setFillColor(...LARANJA);
  doc.rect(0, PAGE_H - 35, PAGE_W, 35, 'F');

  // Info na faixa inferior
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...TEXT_WHITE);
  doc.text(data.clientName, PAGE_W / 2, PAGE_H - 23, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(
    new Date(data.readingDate).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    }),
    PAGE_W / 2,
    PAGE_H - 14,
    { align: 'center' },
  );

  // Ornamento central
  doc.setDrawColor(...LARANJA);
  doc.setLineWidth(0.6);
  doc.line(MARGIN + 20, 75, PAGE_W - MARGIN - 20, 75);
  doc.line(MARGIN + 20, 78, PAGE_W - MARGIN - 20, 78);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...LARANJA);
  doc.text('✦  CABALA DOS CAMINHOS  ✦', PAGE_W / 2, 88, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    `Gerado em ${new Date(data.reportCreatedAt).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    })}`,
    PAGE_W / 2,
    96,
    { align: 'center' },
  );

  addFooter(1);

  // ---------------------------------------------------------------------------
  // PÁGINA 2 — RESUMO DOS MAPAS
  // ---------------------------------------------------------------------------
  newPage(2);

  // Título da seção
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...LARANJA);
  doc.text('Resumo dos Mapas', PAGE_W / 2, y, { align: 'center' });
  y += 10;

  divider();
  y += 4;

  const mapCards = [
    { label: 'Astrologia', icon: '☉', map: data.maps.astrology, accent: ROYAL_LIGHT },
    { label: 'Numerologia Cabalística', icon: '♕', map: data.maps.kabalistic, accent: ROYAL_LIGHT },
    { label: 'Numerologia Tântrica', icon: '🜂', map: data.maps.tantric, accent: LARANJA_BG },
    { label: 'Odu de Nascimento', icon: '✧', map: data.maps.odu, accent: ROYAL_LIGHT },
  ] as const;

  for (const card of mapCards) {
    ensureSpace(3);

    // Card bg
    doc.setFillColor(...(card.accent as readonly number[]));
    const cardH = 30;
    doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 2, 2, 'F');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_ACCENT);
    doc.text(`${card.icon}  ${card.label}`, MARGIN + 5, y + 7);

    // Conteúdo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_WHITE);

    const mapObj = card.map && typeof card.map === 'object' && !Array.isArray(card.map)
      ? (card.map as Record<string, unknown>)
      : null;

    if (mapObj) {
      const entries = Object.entries(mapObj).filter(([, v]) => v != null).slice(0, 5);
      const lines: string[] = [];
      for (const [k, v] of entries) {
        const val = Array.isArray(v) ? v.join(', ') : String(v);
        if (val) lines.push(`${k}: ${val}`);
      }
      const text = lines.join('   ·   ');
      if (text) {
        const wrapped = doc.splitTextToSize(text, CONTENT_W - 12);
        for (let i = 0; i < Math.min(wrapped.length, 2); i++) {
          doc.text(wrapped[i], MARGIN + 5, y + 15 + i * 5);
        }
      }
    } else {
      doc.setTextColor(...TEXT_MUTED);
      doc.text('Não disponível', MARGIN + 5, y + 15);
    }

    y += cardH + 5;
  }

  // ---------------------------------------------------------------------------
  // CASAS — uma entrada por casa preenchida
  // ---------------------------------------------------------------------------

  const casasOrdenadas = Object.keys(data.reportContent.houses)
    .map(Number)
    .filter((n) => n >= 1 && n <= 36)
    .sort((a, b) => a - b);

  for (let i = 0; i < casasOrdenadas.length; i++) {
    const casa = casasOrdenadas[i];
    const houseData = data.reportContent.houses[String(casa)];
    if (!houseData) continue;

    const matrix = data.matrixData[String(casa)];
    const cartaNum = matrix?.carta ?? 0;
    const cartaLabel = cartaNum > 0 ? cartaNome(cartaNum) : houseData.carta ?? `Carta ${casa}`;
    const oduLabel = matrix?.odu
      ? `${oduNome(matrix.odu)} (${matrix.odu})`
      : houseData.odu ?? '';

    const rawInterpretation = houseData.interpretation ?? '';
    const interpretation = stripMarkdown(rawInterpretation);
    const wrapped = doc.splitTextToSize(interpretation, CONTENT_W - 12);
    const linesNeeded = 6 + wrapped.length;

    ensureSpace(linesNeeded);

    // Header da casa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...LARANJA);
    doc.text(`Casa ${casa} — ${casaLabel}`, MARGIN, y);
    y += LINE_H;

    // Cartas e Odu
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    if (cartaNum > 0) {
      doc.setTextColor(...TEXT_ACCENT);
      doc.text(`Carta: ${cartaLabel}`, MARGIN, y);
    }
    if (oduLabel) {
      doc.setTextColor(160, 210, 255);
      const oduX = cartaNum > 0 ? MARGIN + CONTENT_W / 2 : MARGIN;
      doc.text(`Odu: ${oduLabel}`, oduX, y);
    }
    y += LINE_H + 1;

    // Interpretação
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_WHITE);
    for (const line of wrapped) {
      ensureSpace(1);
      doc.text(line, MARGIN, y);
      y += 4.5;
    }

    y += 6;
    divider(ROYAL_LIGHT as unknown as readonly number[]);
  }

  // ---------------------------------------------------------------------------
  // SÍNTESE FINAL
  // ---------------------------------------------------------------------------

  const synthesis = data.reportContent.synthesis;
  if (synthesis) {
    newPage(doc.getNumberOfPages() + 1);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...LARANJA);
    doc.text('Síntese Final', PAGE_W / 2, y, { align: 'center' });
    y += 10;

    divider();
    y += 6;

    const synthesisItems = [
      { label: 'Trabalho e Dinheiro', value: synthesis.workAndMoney },
      { label: 'Lar e Família', value: synthesis.homeAndFamily },
      { label: 'Amor e Relacionamentos', value: synthesis.loveAndRelationships },
      { label: 'Caminho Espiritual', value: synthesis.spiritualPath },
    ] as const;

    for (const item of synthesisItems) {
      if (!item.value) continue;
      ensureSpace(5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...TEXT_ACCENT);
      doc.text(item.label, MARGIN, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...TEXT_WHITE);
      const wrapped = doc.splitTextToSize(stripMarkdown(item.value), CONTENT_W);
      for (const line of wrapped) {
        ensureSpace(1);
        doc.text(line, MARGIN, y);
        y += 4.5;
      }
      y += 5;
      divider(ROYAL_LIGHT as unknown as readonly number[]);
      y += 4;
    }

    // Veredicto Final
    if (synthesis.finalVerdict) {
      ensureSpace(8);

      doc.setFillColor(...LARANJA_BG);
      doc.roundedRect(MARGIN, y, CONTENT_W, 28, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...LARANJA);
      doc.text('Veredicto Final', MARGIN + 5, y + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...TEXT_WHITE);
      const wrapped = doc.splitTextToSize(stripMarkdown(synthesis.finalVerdict), CONTENT_W - 10);
      let vy = y + 14;
      for (const line of wrapped) {
        ensureSpace(1);
        doc.text(line, MARGIN + 5, vy);
        vy += 4.5;
      }
      y += 34;
    }
  }

  // ---------------------------------------------------------------------------
  // Download
  // ---------------------------------------------------------------------------
  const dateStr = new Date(data.readingDate).toISOString().slice(0, 10);
  const safeName = data.clientName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
  doc.save(`dossier-${safeName}-${dateStr}.pdf`);
}
