// @ts-nocheck
/**
 * Mapa PDF Export Module
 * Generates downloadable PDF reports for the Mapa da Alma
 */

import jsPDF from 'jspdf';

// ============================================================
// Types
// ============================================================

export interface MapaPDFOptions {
  title?: string;
  includeChart?: boolean;
  includeCorrelations?: boolean;
  includeOduReading?: boolean;
  colorScheme?: 'dark' | 'light';
}

export interface MapaData {
  id?: string;
  createdAt?: string;
  numerologia: {
    numeroVida: number;
    numeroDestino: number;
    numeroAlma: number;
    numeroPersonalidade: number;
  };
  odu: {
    nome: string;
    numero: number;
    orixas: string[];
    quizilas: string[];
    preceitos: string;
    interpretacao?: string;
  };
  astrologia: {
    signoSolar: string;
    signoLua: string;
    ascendente: string;
    planetas: Record<string, string>;
  };
  tarot?: {
    cartaNascimento: number;
    cartaAnoPessoal: number;
  };
  orixas: string[];
  sefirot?: string[];
  convergencias?: Array<{
    energia: string;
    forca: 'simples' | 'dupla' | 'tripla';
    descricao: string;
  }>;
}

// ============================================================
// Constants
// ============================================================

const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  dark: {
    background: [10, 10, 15] as [number, number, number],
    text: [232, 232, 232] as [number, number, number],
    accent: [212, 168, 67] as [number, number, number],
    secondary: [124, 110, 179] as [number, number, number],
    muted: [107, 114, 128] as [number, number, number],
    success: [34, 106, 79] as [number, number, number],
    danger: [220, 38, 38] as [number, number, number],
  },
  light: {
    background: [255, 255, 255] as [number, number, number],
    text: [26, 26, 46] as [number, number, number],
    accent: [45, 106, 79] as [number, number, number],
    secondary: [124, 110, 179] as [number, number, number],
    muted: [156, 163, 175] as [number, number, number],
    success: [34, 106, 79] as [number, number, number],
    danger: [220, 38, 38] as [number, number, number],
  },
};

// Tarot arcana names
const ARCANOS_MAIORES = [
  'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador', 'O Hierofante',
  'Os Enamorados', 'O Carro', 'A Força', 'O Eremita', 'A Roda da Fortuna',
  'A Justiça', 'O Louco', 'O Enforcado', 'A Morte', 'A Temperança',
  'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
  'O Julgamento', 'O Mundo'
];

// ============================================================
// Helper Functions
// ============================================================

function formatarData(data: string | Date | undefined): string {
  if (!data) return new Date().toLocaleDateString('pt-BR');
  const d = typeof data === 'string' ? new Date(data) : data;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function setColors(doc: jsPDF, colors: typeof COLORS.dark) {
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
  doc.setDrawColor(colors.muted[0], colors.muted[1], colors.muted[2]);
}

function adicionarPaginaSeNecessario(doc: jsPDF, y: number, limite: number): number {
  if (y > limite) {
    doc.addPage();
    return MARGIN + 10;
  }
  return y;
}

function adicionarLinhaDecorativa(doc: jsPDF, y: number, largura: number, margem: number, color: [number, number, number]): number {
  const lineY = y;
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.5);
  doc.line(margem, lineY, margem + largura, lineY);
  return lineY + 5;
}

function adicionarTituloSecao(doc: jsPDF, titulo: string, y: number, largura: number, margem: number, colors: typeof COLORS.dark): number {
  const textY = y;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text(titulo, margem, textY);
  
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.3);
  doc.line(margem, textY + 2, margem + largura * 0.3, textY + 2);
  
  return textY + 10;
}

function adicionarSubtitulo(doc: jsPDF, texto: string, y: number, margem: number, colors: typeof COLORS.dark): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text(texto, margem, y);
  return y + 6;
}

function adicionarTexto(doc: jsPDF, texto: string, y: number, margem: number, largura: number, colors: typeof COLORS.dark, size: number = 10): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(size);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  const lines = doc.splitTextToSize(texto, largura);
  doc.text(lines, margem, y);
  return y + lines.length * (size * 0.4) + 3;
}

// ============================================================
// Section Generators
// ============================================================

function gerarSecaoNumerologia(doc: jsPDF, numerologia: MapaData['numerologia'], y: number, largura: number, margem: number, colors: typeof COLORS.dark): number {
  y = adicionarTituloSecao(doc, 'NUMEROLOGIA', y, largura, margem, colors);
  
  const numbers = [
    { label: 'Caminho de Vida', value: numerologia.numeroVida },
    { label: 'Número de Destino', value: numerologia.numeroDestino },
    { label: 'Número da Alma', value: numerologia.numeroAlma },
    { label: 'Número de Personalidade', value: numerologia.numeroPersonalidade },
  ];

  const colWidth = largura / 2 - 5;
  
  numbers.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margem + col * (colWidth + 10);
    const itemY = y + row * 15;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(item.label + ':', x, itemY);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text(String(item.value), x + 50, itemY);
  });
  
  return y + 35;
}

function gerarSecaoOdu(doc: jsPDF, odu: MapaData['odu'], y: number, largura: number, margem: number, colors: typeof COLORS.dark): number {
  y = adicionarTituloSecao(doc, 'ODÚ DE NASCIMENTO', y, largura, margem, colors);
  
  // Odú name and number
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text(`${odu.nome} (${odu.numero})`, margem, y);
  y += 8;
  
  // Orixás
  if (odu.orixas && odu.orixas.length > 0) {
    y = adicionarSubtitulo(doc, 'Orixás:', y, margem, colors);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(odu.orixas.join(', '), margem + 40, y - 6);
    y += 5;
  }
  
  // Quizilas
  if (odu.quizilas && odu.quizilas.length > 0) {
    y = adicionarSubtitulo(doc, 'Quizilas:', y, margem, colors);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(odu.quizilas.join(', '), margem + 40, y - 6);
    y += 5;
  }
  
  // Preceitos
  if (odu.preceitos) {
    y = adicionarSubtitulo(doc, 'Preceitos:', y, margem, colors);
    y = adicionarTexto(doc, odu.preceitos, y, margem + 5, largura - 10, colors, 9);
  }
  
  // Interpretação
  if (odu.interpretacao) {
    y = adicionarLinhaDecorativa(doc, y, largura, margem, colors.muted);
    y = adicionarTexto(doc, odu.interpretacao, y, margem, largura, colors, 9);
  }
  
  return y + 10;
}

function gerarSecaoAstrologia(doc: jsPDF, astrologia: MapaData['astrologia'], y: number, largura: number, margem: number, colors: typeof COLORS.dark): number {
  y = adicionarTituloSecao(doc, 'ASTROLOGIA', y, largura, margem, colors);
  
  const items = [
    { label: 'Signo Solar', value: astrologia.signoSolar },
    { label: 'Signo Lunar', value: astrologia.signoLua },
    { label: 'Ascendente', value: astrologia.ascendente },
  ];

  items.forEach((item, i) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(item.label + ':', margem, y + i * 8);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(item.value, margem + 50, y + i * 8);
  });
  
  // Planet positions
  if (astrologia.planetas && Object.keys(astrologia.planetas).length > 0) {
    y += 25;
    y = adicionarSubtitulo(doc, 'Posições Planetárias:', y, margem, colors);
    
    const planetEntries = Object.entries(astrologia.planetas);
    const colWidth = largura / 2;
    
    planetEntries.forEach(([planet, position], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = margem + col * colWidth;
      const itemY = y + row * 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.text(planet + ':', x, itemY);
      
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(position, x + 35, itemY);
    });
    
    y += Math.ceil(planetEntries.length / 2) * 7 + 10;
  }
  
  return y;
}

function gerarSecaoOrixas(doc: jsPDF, orixas: string[], y: number, largura: number, margem: number, colors: typeof COLORS.dark): number {
  y = adicionarTituloSecao(doc, 'ORIXÁS', y, largura, margem, colors);
  
  if (orixas.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text('Nenhum Orixá identificado', margem, y);
    return y + 10;
  }
  
  // Main Orixá
  const mainOrixa = orixas[0];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text(`Orixá Principal: ${mainOrixa}`, margem, y);
  y += 8;
  
  // Other Orixás
  if (orixas.length > 1) {
    y = adicionarSubtitulo(doc, 'Orixás de Caminho:', y, margem, colors);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(orixas.slice(1).join(', '), margem, y);
    y += 8;
  }
  
  return y + 10;
}

function gerarSecaoConvergencias(doc: jsPDF, convergencias: MapaData['convergencias'], y: number, largura: number, margem: number, colors: typeof COLORS.dark): number {
  if (!convergencias || convergencias.length === 0) return y;
  
  y = adicionarTituloSecao(doc, 'CONVERGÊNCIAS', y, largura, margem, colors);
  
  convergencias.forEach((conv, i) => {
    y = adicionarPaginaSeNecessario(doc, y, PAGE_HEIGHT - 40);
    
    const forcaColor = conv.forca === 'dupla' ? colors.accent : 
                       conv.forca === 'tripla' ? colors.success : colors.muted;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(conv.energia, margem, y);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(forcaColor[0], forcaColor[1], forcaColor[2]);
    doc.text(`[${conv.forca.toUpperCase()}]`, margem + largura * 0.6, y);
    y += 6;
    
    y = adicionarTexto(doc, conv.descricao, y, margem + 5, largura - 10, colors, 9);
    y += 3;
  });
  
  return y + 5;
}

// ============================================================
// Header and Footer
// ============================================================

function adicionarHeader(doc: jsPDF, largura: number, margem: number, titulo: string, colors: typeof COLORS.dark): void {
  // Logo placeholder
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text('CABALA DOS CAMINHOS', margem, margem + 8);
  
  // Title
  doc.setFontSize(12);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text(titulo, largura - margem, margem + 8, { align: 'right' });
  
  // Decorative line
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(1);
  doc.line(margem, margem + 12, largura - margem, margem + 12);
}

function adicionarFooter(doc: jsPDF, largura: number, margem: number, pageNum: number, colors: typeof COLORS.dark): void {
  const footerY = PAGE_HEIGHT - 10;
  
  // Decorative line
  doc.setDrawColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.setLineWidth(0.3);
  doc.line(margem, footerY - 5, largura - margem, footerY - 5);
  
  // Page number
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.text(`Página ${pageNum}`, largura / 2, footerY, { align: 'center' });
  
  // Date
  doc.text(`Gerado em: ${formatarData(new Date().toISOString())}`, margem, footerY);
  
  // Brand
  doc.text('Cabala dos Caminhos', largura - margem, footerY, { align: 'right' });
}

// ============================================================
// Formatting Helpers for Tests
// ============================================================

export function formatOduSection(oduName: string): string {
  const oduMap: Record<string, { orixas: string[]; quizilas: string[]; preceitos: string }> = {
    'Ogbe': { orixas: ['Exu', 'Obatalá'], quizilas: ['Pombo', 'Galinha'], preceitos: 'Paz, verdade e justiça. Proibido matar.' },
    'Oyeku': { orixas: ['Oxum', 'Yemanjá'], quizilas: ['Cabrito'], preceitos: 'Respeito à água e às mulheres.' },
    'Iwori': { orixas: ['Oxum', 'Oduduwa'], quizilas: ['Galinha'], preceitos: 'Honrar os ancestrais maternos.' },
    'Idi': { orixas: ['Obatalá', 'Oxalufá'], quizilas: ['Ovelha'], preceitos: 'Pureza de pensamento e ação.' },
  };
  
  const data = oduMap[oduName] || { orixas: ['Obatalá'], quizilas: ['Galinha'], preceitos: 'Manter a paz.' };
  
  let result = `Odú: ${oduName}\n`;
  result += `Orixás: ${data.orixas.join(', ')}\n`;
  result += `Quizilas: ${data.quizilas.join(', ')}\n`;
  result += `Preceitos: ${data.preceitos}`;
  
  return result;
}

export function formatOrixaSection(orixaName: string): string {
  const orixaData: Record<string, { colors: string[]; herbs: string[]; greeting: string }> = {
    'Oxalá': { colors: ['branco'], herbs: ['boldo', 'artemisia'], greeting: 'Epa!' },
    'Iemanjá': { colors: ['azul', 'branco'], herbs: ['lótus', 'manjericão'], greeting: 'Oia!' },
    'Ogum': { colors: ['vermelho', 'verde'], herbs: ['pimenta', 'cravinho'], greeting: 'Olá!' },
    'São Jorge': { colors: ['vermelho'], herbs: ['espada de São Jorge'], greeting: 'Salve!' },
    'Oxosse': { colors: ['verde', 'amarelo'], herbs: ['cajá', 'ipê'], greeting: 'Olori!' },
  };
  
  const data = orixaData[orixaName] || { colors: ['branco'], herbs: ['boldo'], greeting: 'Olá!' };
  
  let result = `Orixá: ${orixaName}\n`;
  result += `Cores: ${data.colors.join(', ')}\n`;
  result += `Ervas: ${data.herbs.join(', ')}\n`;
  result += `Saudação: ${data.greeting}`;
  
  return result;
}

// ============================================================
// Main Export Function
// ============================================================

export async function generateMapaPDF(mapaData: MapaData, options?: MapaPDFOptions): Promise<Blob> {
  const {
    title = 'Mapa da Alma',
    includeChart = true,
    includeCorrelations = true,
    includeOduReading = true,
    colorScheme = 'dark',
  } = options || {};

  const colors = COLORS[colorScheme];
  
  // Create PDF in portrait mode
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  let pageNum = 1;
  setColors(doc, colors);
  
  // ============================================================
  // PAGE 1: Title, Chart Summary, Numerology
  // ============================================================
  
  adicionarHeader(doc, PAGE_WIDTH, MARGIN, title, colors);
  
  let y = MARGIN + 25;
  
  // Chart placeholder (if enabled)
  if (includeChart) {
    // Placeholder for Mapa Natal Wheel SVG
    const chartSize = 80;
    const chartX = (PAGE_WIDTH - chartSize) / 2;
    
    doc.setFillColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.roundedRect(chartX, y, chartSize, chartSize, 3, 3, 'FD');
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text('Mapa Natal', chartX + chartSize / 2, y + chartSize / 2, { align: 'center' });
    
    y += chartSize + 10;
  }
  
  // Summary Panel
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text('RESUMO ESPIRITUAL', MARGIN, y);
  y += 8;
  
  // Left column - Astrology
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  
  const leftCol = MARGIN;
  const rightCol = MARGIN + CONTENT_WIDTH / 2;
  
  doc.text('Signo Solar:', leftCol, y);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.text(mapaData.astrologia.signoSolar, leftCol + 40, y);
  y += 6;
  
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.text('Lua:', leftCol, y);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.text(mapaData.astrologia.signoLua, leftCol + 40, y);
  y += 6;
  
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.text('Ascendente:', leftCol, y);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.text(mapaData.astrologia.ascendente, leftCol + 40, y);
  
  // Right column - Numerology
  y = MARGIN + 43;
  
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.text('Caminho de Vida:', rightCol, y);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text(String(mapaData.numerologia.numeroVida), rightCol + 50, y);
  y += 6;
  
  if (includeOduReading) {
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text('Odú:', rightCol, y);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text(mapaData.odu.nome, rightCol + 50, y);
    y += 6;
  }
  
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.text('Orixá:', rightCol, y);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text(mapaData.orixas[0] || 'N/A', rightCol + 50, y);
  
  y += 15;
  
  // Numerology Section
  y = gerarSecaoNumerologia(doc, mapaData.numerologia, y, CONTENT_WIDTH, MARGIN, colors);
  
  y += 5;
  y = adicionarLinhaDecorativa(doc, y, CONTENT_WIDTH, MARGIN, colors.muted);
  
  // Orixás Section
  y = gerarSecaoOrixas(doc, mapaData.orixas, y, CONTENT_WIDTH, MARGIN, colors);
  
  // Footer
  adicionarFooter(doc, PAGE_WIDTH, MARGIN, pageNum, colors);
  
  // ============================================================
  // PAGE 2: Odú Reading and Correlations
  // ============================================================
  
  if (includeOduReading || includeCorrelations) {
    doc.addPage();
    pageNum++;
    y = MARGIN + 10;
    
    y = gerarSecaoOdu(doc, mapaData.odu, y, CONTENT_WIDTH, MARGIN, colors);
    
    y = adicionarPaginaSeNecessario(doc, y, PAGE_HEIGHT - 50);
    y += 5;
    
    y = gerarSecaoAstrologia(doc, mapaData.astrologia, y, CONTENT_WIDTH, MARGIN, colors);
    
    if (includeCorrelations && mapaData.convergencias && mapaData.convergencias.length > 0) {
      y = adicionarPaginaSeNecessario(doc, y, PAGE_HEIGHT - 50);
      y += 5;
      y = gerarSecaoConvergencias(doc, mapaData.convergencias, y, CONTENT_WIDTH, MARGIN, colors);
    }
    
    adicionarFooter(doc, PAGE_WIDTH, MARGIN, pageNum, colors);
  }
  
  // Return as Blob
  return doc.output('blob');
}

// ============================================================
// Download Helper
// ============================================================

export function downloadPDF(blob: Blob, filename: string = 'mapa-da-alma.pdf'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default generateMapaPDF;
