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
// Helpers — dados
// ----------------------------------------------------------------------------

/** Retorna o nome da carta Lenormand dado o número (1-36). */
export function cartaNome(numero: number): string {
  return LENORMAND_CARDS[numero - 1]?.name ?? `Carta ${numero}`;
}

/** Retorna o label do Odu dado o número. */
export function oduNome(numero: number): string {
  const odus = [
    'Ogundá', 'Ogbe', 'Yekun', 'Irosun', 'Owonrin', 'Obara',
    'Okanran', 'Ogunda', 'Osa', 'Ika', 'Oturupon', 'Otura',
    'Lewi', 'Eji-Ogbe', 'Alafia', 'Irete',
  ];
  return odus[numero - 1] ?? `Odu ${numero}`;
}

/** Limpa markdown básico para texto legível em PDF. */
export function stripMarkdown(text: string): string {
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
const ROYAL_DARK: [number, number, number]   = [13, 10, 40];
const ROYAL_MID: [number, number, number]    = [22, 17, 70];
const ROYAL_LIGHT: [number, number, number]  = [35, 30, 100];
const LARANJA: [number, number, number]      = [235, 100, 20];
const LARANJA_BG: [number, number, number]   = [70, 20, 0];
const TEXT_WHITE: [number, number, number]   = [245, 240, 230];
const TEXT_MUTED: [number, number, number]   = [200, 195, 220];
const TEXT_ACCENT: [number, number, number]   = [255, 190, 80];
// ----------------------------------------------------------------------------
// Constantes de layout (A4, milímetros)
// ----------------------------------------------------------------------------

const PAGE_W        = 210;
const PAGE_H        = 297;
const MARGIN        = 18;
const CONTENT_W     = PAGE_W - MARGIN * 2;
const BOTTOM_MARGIN = 15;
const LINE_H        = 6;

// ----------------------------------------------------------------------------
// Estado de página — objeto mutável passado por todas as seções
// ----------------------------------------------------------------------------

interface PageState {
  /** Posição Y atual na página (milímetros). */
  y: number;
  /** Dados do dossiê — necessário para o rodapé em novas páginas. */
  data: DossierPdfData;
}

// ----------------------------------------------------------------------------
// Helpers — PDF de baixo nível
// ----------------------------------------------------------------------------

/** Preenche toda a página com o fundo royal escuro. */
function fillRoyalBackground(doc: jsPDF): void {
  doc.setFillColor(ROYAL_DARK[0], ROYAL_DARK[1], ROYAL_DARK[2]);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
}

function drawFooter(doc: jsPDF, data: DossierPdfData, pageNum: number): void {
  const total = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Cabala dos Caminhos · Dossiê Cabalístico · ${data.clientName}`,
    PAGE_W / 2,
    PAGE_H - 6,
    { align: 'center' },
  );
  doc.text(`${pageNum} / ${total}`, PAGE_W - MARGIN, PAGE_H - 6, { align: 'right' });
}

function drawDivider(doc: jsPDF, x1: number, y: number, x2: number, color: [number, number, number]): number {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.4);
  doc.line(x1, y, x2, y);
  return y + 4;
}

/** Verifica espaço vertical; cria nova página se necessário. */
function ensureSpace(doc: jsPDF, state: PageState, needed: number): void {
  if (state.y + needed > PAGE_H - BOTTOM_MARGIN) {
    startNewPage(doc, state);
  }
}

/** Adiciona nova página com fundo e rodapé. */
function startNewPage(doc: jsPDF, state: PageState): void {
  doc.addPage();
  fillRoyalBackground(doc);
  state.y = MARGIN;
  drawFooter(doc, state.data, doc.getNumberOfPages());
}

// ----------------------------------------------------------------------------
// Seções de página
// ----------------------------------------------------------------------------

/** PÁGINA 1 — Capa do dossiê. */
function drawCoverPage(doc: jsPDF, data: DossierPdfData): void {
  fillRoyalBackground(doc);

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

  // Nome do cliente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...TEXT_WHITE);
  doc.text(data.clientName, PAGE_W / 2, PAGE_H - 23, { align: 'center' });

  // Data da leitura
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
}

// ----------------------------------------------------------------------------
// MAPAS
// ----------------------------------------------------------------------------

interface MapCardDef {
  label: string;
  icon: string;
  map: Record<string, unknown> | unknown[] | null;
  accent: [number, number, number];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

/** Desenha um único card de mapa (Astrologia, Cabala, Tântrica, Odu). */
function drawMapCard(doc: jsPDF, card: MapCardDef, y: number): number {
  const CARD_H = 30;
  const cardY = y;

  doc.setFillColor(card.accent[0], card.accent[1], card.accent[2]);
  doc.roundedRect(MARGIN, cardY, CONTENT_W, CARD_H, 2, 2, 'F');

  // Label + ícone
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(TEXT_ACCENT[0], TEXT_ACCENT[1], TEXT_ACCENT[2]);
  doc.text(`${card.icon}  ${card.label}`, MARGIN + 5, cardY + 7);

  // Conteúdo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  if (isRecord(card.map)) {
    const entries = Object.entries(card.map)
      .filter(([, v]) => v != null)
      .slice(0, 5);
    const parts: string[] = [];
    for (const [k, v] of entries) {
      const val = Array.isArray(v) ? v.join(', ') : String(v);
      if (val) parts.push(`${k}: ${val}`);
    }
    const text = parts.join('   ·   ');
    if (text) {
      const wrapped = doc.splitTextToSize(text, CONTENT_W - 12);
      for (let i = 0; i < Math.min(wrapped.length, 2); i++) {
        doc.setTextColor(...TEXT_WHITE);
        doc.text(wrapped[i], MARGIN + 5, cardY + 15 + i * 5);
      }
    }
  } else {
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Não disponível', MARGIN + 5, cardY + 15);
  }

  return cardY + CARD_H + 5;
}

/** PÁGINA 2 — Resumo dos Mapas. */
function drawMapsSummarySection(doc: jsPDF, state: PageState, data: DossierPdfData): void {
  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...LARANJA);
  doc.text('Resumo dos Mapas', PAGE_W / 2, state.y, { align: 'center' });
  state.y += 10;

  state.y = drawDivider(doc, MARGIN, state.y, PAGE_W - MARGIN, LARANJA);
  state.y += 4;

  const cards: MapCardDef[] = [
    { label: 'Astrologia', icon: '☉', map: data.maps.astrology as Record<string, unknown> | null, accent: ROYAL_LIGHT },
    { label: 'Numerologia Cabalística', icon: '♕', map: data.maps.kabalistic as Record<string, unknown> | null, accent: ROYAL_LIGHT },
    { label: 'Numerologia Tântrica', icon: '🜂', map: data.maps.tantric as Record<string, unknown> | null, accent: LARANJA_BG },
    { label: 'Odu de Nascimento', icon: '✧', map: data.maps.odu as Record<string, unknown> | null, accent: ROYAL_LIGHT },
  ];

  for (const card of cards) {
    ensureSpace(doc, state, 35);
    state.y = drawMapCard(doc, card, state.y);
  }
}

// ----------------------------------------------------------------------------
// CASAS
// ----------------------------------------------------------------------------

// Desenha uma única entrada de casa.
function drawHouseEntry(
  doc: jsPDF,
  state: PageState,
  casa: number,
  houseData: NonNullable<DossierPdfData['reportContent']['houses'][string]>,
  matrix: DossierPdfData['matrixData'][string],
): void {
  // ── Extract and normalize labels ─────────────────────────────────────────────
  const cartaNum  = matrix?.carta ?? 0;
  const casaLabel = cartaNum > 0 ? cartaNome(cartaNum) : houseData.carta ?? `Carta ${casa}`;
  const oduLabel  = matrix?.odu
    ? `${oduNome(matrix.odu)} (${matrix.odu})`
    : houseData.odu ?? '';
  // ── Normalize interpretation text ───────────────────────────────────────────
  const rawText       = houseData.interpretation ?? '';
  const interpretation = stripMarkdown(rawText);
  const wrapped        = doc.splitTextToSize(interpretation, CONTENT_W - 12);
  const linesNeeded    = 6 + wrapped.length;
  ensureSpace(doc, state, linesNeeded);
  // ── Draw house header ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...LARANJA);
  doc.text(`Casa ${casa} — ${casaLabel}`, MARGIN, state.y);
  state.y += LINE_H;
  // ── Draw card and Odu labels ────────────────────────────────────────────────
  drawCardAndOduLabels(doc, state, cartaNum, casaLabel, oduLabel);
  // ── Draw interpretation text ────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_WHITE);
  for (const line of wrapped) {
    ensureSpace(doc, state, LINE_H);
    doc.text(line, MARGIN, state.y);
    state.y += 4.5;
  }
  state.y += 6;
  state.y = drawDivider(doc, MARGIN, state.y, PAGE_W - MARGIN, ROYAL_LIGHT);
}
/** Draws the card name and Odu label on a single row, handling absence gracefully. */
function drawCardAndOduLabels(
  doc: jsPDF,
  state: PageState,
  cartaNum: number,
  casaLabel: string,
  oduLabel: string,
): void {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  if (cartaNum > 0) {
    doc.setTextColor(...TEXT_ACCENT);
    doc.text(`Carta: ${casaLabel}`, MARGIN, state.y);
  }
  if (oduLabel) {
    doc.setTextColor(160, 210, 255);
    const oduX = cartaNum > 0 ? MARGIN + CONTENT_W / 2 : MARGIN;
    doc.text(`Odu: ${oduLabel}`, oduX, state.y);
  }
  state.y += LINE_H + 1;
}

/** Seção de casas — percorre e desenha cada casa preenchida. */
function drawHousesSection(doc: jsPDF, state: PageState, data: DossierPdfData): void {
  const casasOrdenadas = Object.keys(data.reportContent.houses)
    .map(Number)
    .filter((n) => n >= 1 && n <= 36)
    .sort((a, b) => a - b);

  for (const casa of casasOrdenadas) {
    const houseData = data.reportContent.houses[String(casa)];
    if (!houseData) continue;
    const matrix = data.matrixData[String(casa)];
    drawHouseEntry(doc, state, casa, houseData, matrix);
  }
}

// ----------------------------------------------------------------------------
// SÍNTESE
// ----------------------------------------------------------------------------

/** Box de Veredicto Final com fundo laranja escuro. */
function drawFinalVerdictBox(doc: jsPDF, state: PageState, verdict: string): void {
  ensureSpace(doc, state, 34);
  const boxY = state.y;

  doc.setFillColor(...LARANJA_BG);
  doc.roundedRect(MARGIN, boxY, CONTENT_W, 28, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...LARANJA);
  doc.text('Veredicto Final', MARGIN + 5, boxY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_WHITE);
  const wrapped = doc.splitTextToSize(stripMarkdown(verdict), CONTENT_W - 10);
  let vy = boxY + 14;
  for (const line of wrapped) {
    ensureSpace(doc, state, 4.5);
    doc.text(line, MARGIN + 5, vy);
    vy += 4.5;
  }
  state.y = boxY + 34;
}

/** Página de Síntese Final — trabalha, lar, amor, caminho espiritual + veredicto. */
function drawSynthesisSection(
  doc: jsPDF,
  state: PageState,
  data: DossierPdfData,
): void {
  const synthesis = data.reportContent.synthesis;
  if (!synthesis) return;

  // Nova página para síntese
  doc.addPage();
  fillRoyalBackground(doc);
  state.y = MARGIN;
  drawFooter(doc, data, doc.getNumberOfPages());

  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...LARANJA);
  doc.text('Síntese Final', PAGE_W / 2, state.y, { align: 'center' });
  state.y += 10;

  state.y = drawDivider(doc, MARGIN, state.y, PAGE_W - MARGIN, LARANJA);
  state.y += 6;

  const synthesisItems = [
    { label: 'Trabalho e Dinheiro',    value: synthesis.workAndMoney },
    { label: 'Lar e Família',           value: synthesis.homeAndFamily },
    { label: 'Amor e Relacionamentos',  value: synthesis.loveAndRelationships },
    { label: 'Caminho Espiritual',      value: synthesis.spiritualPath },
  ] as const;

  for (const item of synthesisItems) {
    if (!item.value) continue;
    ensureSpace(doc, state, 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_ACCENT);
    doc.text(item.label, MARGIN, state.y);
    state.y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_WHITE);
    const wrapped = doc.splitTextToSize(stripMarkdown(item.value), CONTENT_W);
    for (const line of wrapped) {
      ensureSpace(doc, state, 4.5);
      doc.text(line, MARGIN, state.y);
      state.y += 4.5;
    }
    state.y += 5;
    state.y = drawDivider(doc, MARGIN, state.y, PAGE_W - MARGIN, ROYAL_LIGHT);
    state.y += 4;
  }

  if (synthesis.finalVerdict) {
    drawFinalVerdictBox(doc, state, synthesis.finalVerdict);
  }
}

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

  const state: PageState = { y: MARGIN, data };

  // PÁGINA 1 — Capa
  drawCoverPage(doc, data);
  drawFooter(doc, data, 1);

  // PÁGINA 2 — Mapas
  startNewPage(doc, state);
  drawMapsSummarySection(doc, state, data);

  // Casas
  drawHousesSection(doc, state, data);

  // Síntese Final
  drawSynthesisSection(doc, state, data);

  // Download
  const dateStr  = new Date(data.readingDate).toISOString().slice(0, 10);
  const safeName = data.clientName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
  doc.save(`dossier-${safeName}-${dateStr}.pdf`);
}
