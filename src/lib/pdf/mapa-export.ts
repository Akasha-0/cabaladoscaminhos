// @ts-nocheck
import jsPDF from 'jspdf';

export interface MapaPDFOptions {
  title?: string;
  includeChart?: boolean;
  includeCorrelations?: boolean;
  includeOduReading?: boolean;
  colorScheme?: 'dark' | 'light';
}

export interface MapaData {
  numerologia: { numeroVida: number; numeroDestino: number; numeroAlma: number; numeroPersonalidade: number; };
  odu: { nome: string; numero: number; orixas: string[]; quizilas: string[]; preceitos: string; interpretacao?: string; };
  astrologia: { signoSolar: string; signoLua: string; ascendente: string; planetas: Record<string, string>; };
  orixas: string[];
  convergencias?: Array<{ energia: string; forca: 'simples' | 'dupla' | 'tripla'; descricao: string; }>;
}

const PAGE_WIDTH = 210, PAGE_HEIGHT = 297, MARGIN = 20, CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  dark: { background: [10, 10, 15] as [number, number, number], text: [232, 232, 232] as [number, number, number], accent: [212, 168, 67] as [number, number, number], secondary: [124, 110, 179] as [number, number, number], muted: [107, 114, 128] as [number, number, number] },
  light: { background: [255, 255, 255] as [number, number, number], text: [26, 26, 46] as [number, number, number], accent: [45, 106, 79] as [number, number, number], secondary: [124, 110, 179] as [number, number, number], muted: [156, 163, 175] as [number, number, number] },
};

function formatarData(data?: string | Date): string {
  if (!data) return new Date().toLocaleDateString('pt-BR');
  const d = typeof data === 'string' ? new Date(data) : data;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function setColors(doc: jsPDF, colors: typeof COLORS.dark) {
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
  doc.setDrawColor(colors.muted[0], colors.muted[1], colors.muted[2]);
}

function adicionarPaginaSeNecessario(doc: jsPDF, y: number, limite: number): number {
  if (y > limite) { doc.addPage(); return MARGIN + 10; }
  return y;
}

function adicionarTituloSecao(doc: jsPDF, titulo: string, y: number, largura: number, margem: number, colors: typeof COLORS.dark): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text(titulo, margem, y);
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.3);
  doc.line(margem, y + 2, margem + largura * 0.3, y + 2);
  return y + 10;
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

function gerarSecaoNumerologia(doc: jsPDF, numerologia: MapaData['numerologia'], y: number, largura: number, margem: number, colors: typeof COLORS.dark): number {
  y = adicionarTituloSecao(doc, 'NUMEROLOGIA', y, largura, margem, colors);
  const numbers = [
    { label: 'Caminho de Vida', value: numerologia.numeroVida },
    { label: 'Número de Destino', value: numerologia.numeroDestino },
    { label: 'Número da Alma', value: numerologia.numeroAlma },
    { label: 'Número de Personalidade', value: numerologia.numeroPersonalidade },
  ];
  numbers.forEach((item, i) => {
    const col = i % 2, row = Math.floor(i / 2), x = margem + col * (largura / 2), itemY = y + row * 15;
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
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text(odu.nome + ' (' + odu.numero + ')', margem, y);
  y += 8;
  if (odu.orixas?.length > 0) {
    y = adicionarSubtitulo(doc, 'Orixás:', y, margem, colors);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(odu.orixas.join(', '), margem + 40, y - 6);
    y += 5;
  }
  if (odu.quizilas?.length > 0) {
    y = adicionarSubtitulo(doc, 'Quizilas:', y, margem, colors);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(odu.quizilas.join(', '), margem + 40, y - 6);
    y += 5;
  }
  if (odu.preceitos) {
    y = adicionarSubtitulo(doc, 'Preceitos:', y, margem, colors);
    y = adicionarTexto(doc, odu.preceitos, y, margem + 5, largura - 10, colors, 9);
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
  return y + 30;
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
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text('Orixá Principal: ' + orixas[0], margem, y);
  return y + 15;
}

function adicionarHeader(doc: jsPDF, largura: number, margem: number, titulo: string, colors: typeof COLORS.dark): void {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text('CABALA DOS CAMINHOS', margem, margem + 8);
  doc.setFontSize(12);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text(titulo, largura - margem, margem + 8, { align: 'right' });
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(1);
  doc.line(margem, margem + 12, largura - margem, margem + 12);
}

function adicionarFooter(doc: jsPDF, largura: number, margem: number, pageNum: number, colors: typeof COLORS.dark): void {
  const footerY = PAGE_HEIGHT - 10;
  doc.setDrawColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.setLineWidth(0.3);
  doc.line(margem, footerY - 5, largura - margem, footerY - 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.text('Página ' + pageNum, largura / 2, footerY, { align: 'center' });
  doc.text('Gerado em: ' + formatarData(new Date().toISOString()), margem, footerY);
  doc.text('Cabala dos Caminhos', largura - margem, footerY, { align: 'right' });
}

export function formatOduSection(oduName: string): string {
  const oduMap: Record<string, { orixas: string[]; quizilas: string[]; preceitos: string }> = {
    'Ogbe': { orixas: ['Exu', 'Obatalá'], quizilas: ['Pombo', 'Galinha'], preceitos: 'Paz, verdade e justiça. Proibido matar.' },
    'Oyeku': { orixas: ['Oxum', 'Yemanjá'], quizilas: ['Cabrito'], preceitos: 'Respeito à água e às mulheres.' },
  };
  const data = oduMap[oduName] || { orixas: ['Obatalá'], quizilas: ['Galinha'], preceitos: 'Manter a paz.' };
  return 'Odú: ' + oduName + '\nOrixás: ' + data.orixas.join(', ') + '\nQuizilas: ' + data.quizilas.join(', ') + '\nPreceitos: ' + data.preceitos;
}

export function formatOrixaSection(orixaName: string): string {
  const orixaData: Record<string, { colors: string[]; herbs: string[]; greeting: string }> = {
    'Oxalá': { colors: ['branco'], herbs: ['boldo', 'artemisia'], greeting: 'Epa!' },
    'Iemanjá': { colors: ['azul', 'branco'], herbs: ['lótus', 'manjericão'], greeting: 'Oia!' },
    'Ogum': { colors: ['vermelho', 'verde'], herbs: ['pimenta', 'cravinho'], greeting: 'Olá!' },
  };
  const data = orixaData[orixaName] || { colors: ['branco'], herbs: ['boldo'], greeting: 'Olá!' };
  return 'Orixá: ' + orixaName + '\nCores: ' + data.colors.join(', ') + '\nErvas: ' + data.herbs.join(', ') + '\nSaudação: ' + data.greeting;
}

export async function generateMapaPDF(mapaData: MapaData, options?: MapaPDFOptions): Promise<Blob> {
  const { title = 'Mapa da Alma', includeChart = true, includeCorrelations = true, includeOduReading = true, colorScheme = 'dark' } = options || {};
  const colors = COLORS[colorScheme];
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let pageNum = 1;
  setColors(doc, colors);
  adicionarHeader(doc, PAGE_WIDTH, MARGIN, title, colors);
  let y = MARGIN + 25;
  
  if (includeChart) {
    const chartSize = 80, chartX = (PAGE_WIDTH - chartSize) / 2;
    doc.setFillColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.roundedRect(chartX, y, chartSize, chartSize, 3, 3, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text('Mapa Natal', chartX + chartSize / 2, y + chartSize / 2, { align: 'center' });
    y += chartSize + 10;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text('RESUMO ESPIRITUAL', MARGIN, y);
  y += 8;
  
  const leftCol = MARGIN, rightCol = MARGIN + CONTENT_WIDTH / 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
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
  y = gerarSecaoNumerologia(doc, mapaData.numerologia, y, CONTENT_WIDTH, MARGIN, colors);
  y += 5;
  y = gerarSecaoOrixas(doc, mapaData.orixas, y, CONTENT_WIDTH, MARGIN, colors);
  adicionarFooter(doc, PAGE_WIDTH, MARGIN, pageNum, colors);
  
  if (includeOduReading || includeCorrelations) {
    doc.addPage();
    pageNum++;
    y = MARGIN + 10;
    y = gerarSecaoOdu(doc, mapaData.odu, y, CONTENT_WIDTH, MARGIN, colors);
    y = adicionarPaginaSeNecessario(doc, y, PAGE_HEIGHT - 50);
    y += 5;
    y = gerarSecaoAstrologia(doc, mapaData.astrologia, y, CONTENT_WIDTH, MARGIN, colors);
    adicionarFooter(doc, PAGE_WIDTH, MARGIN, pageNum, colors);
  }
  
  return doc.output('blob');
}

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
