import type { MapaAlmaCompleto } from '../engines/types/mapa-alma';

// PDF generation module for Mapa da Alma

// ============================================================
// Types
// Types
// ============================================================

export interface MapaData {
  id: string;
  created_at: string;
  numerologia: {
    numero_vida: number;
    numero_destino: number;
    numero_alma: number;
    numero_personalidade: number;
  };
  odu: {
    nome: string;
    numero: number;
    orixas: string[];
    quizilas: string[];
    preceitos: string;
  };
  astrologia: {
    signo: string;
    ascendente: string;
    planetas: Record<string, string>;
  };
  tarot: {
    carta_nascimento: number;
    carta_ano_pessoal: number;
  };
  orixas: string[];
  sefirot: string[];
  convergencias?: Array<{
    energia: string;
    forca: 'simples' | 'dupla' | 'tripla';
    descricao: string;
  }>;
}

// Tarot arcana names
const ARCANOS_MAIORES = [
  'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador', 'O Hierofante',
  'Os Enamorados', 'O Carro', 'A Força', 'O Eremita', 'A Roda da Fortuna',
  'A Justiça', 'O Louco', 'O Enforcado', 'A Morte', 'A Temperança',
  'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
  'O Julgamento', 'O Mundo'
];

// ============================================================
// Helper functions
// ============================================================
// ============================================================
// MapaAlma Completo Adapter
// ============================================================

function mapaAlmaToMapaData(mapa: MapaAlmaCompleto): MapaData {
  return {
    id: crypto.randomUUID(),
    created_at: mapa.dataCalculo,
    numerologia: {
      numero_vida: mapa.numerologia.vida,
      numero_destino: mapa.numerologia.destino,
      numero_alma: mapa.numerologia.motivacao,
      numero_personalidade: mapa.numerologia.expressao,
    },
    odu: {
      nome: mapa.odu.regente.nome,
      numero: mapa.odu.regente.numero,
      orixas: mapa.odu.orixas,
      quizilas: mapa.odu.quizilas,
      preceitos: mapa.odu.preceitos.join(', '),
    },
    astrologia: {
      signo: mapa.astrologia.sol.signo,
      ascendente: mapa.astrologia.ascendente,
      planetas: {
        sol: mapa.astrologia.sol.signo,
        lua: mapa.astrologia.lua.signo,
        mercurio: mapa.astrologia.mercurio.signo,
        venus: mapa.astrologia.venus.signo,
        marte: mapa.astrologia.marte.signo,
        jupiter: mapa.astrologia.jupiter.signo,
        saturno: mapa.astrologia.saturno.signo,
        urano: mapa.astrologia.urano.signo,
        netuno: mapa.astrologia.netuno.signo,
        plutao: mapa.astrologia.plutao.signo,
      },
    },
    tarot: {
      carta_nascimento: mapa.tarot.cartaNascimento,
      carta_ano_pessoal: mapa.tarot.cartaAnoPessoal,
    },
    orixas: mapa.orixasDominantes,
    sefirot: [mapa.odu.caminhoSephirah],
    convergencias: mapa.convergencias.map(c => ({
      energia: c.energia,
      forca: c.forca === 'forte' ? 'dupla' : c.forca === 'medio' ? 'dupla' : 'simples',
      descricao: c.descricao,
    })),
  };
}

export async function gerarRelatorioMapaAlmaPDF(mapa: MapaAlmaCompleto): Promise<Uint8Array> {
  const data = mapaAlmaToMapaData(mapa);
  const blob = await gerarRelatorioPDF(data);
  return new Uint8Array(await blob.arrayBuffer());
}

function formatarData(data: string | Date | undefined): string {
  if (!data) return '';
  const d = typeof data === 'string' ? new Date(data) : data;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getForcaColor(forca: string): [number, number, number] {
  switch (forca) {
    case 'tripla': return [212, 175, 55];
    case 'dupla': return [180, 120, 50];
    default: return [150, 130, 80];
  }
}

// ============================================================
// Section helpers
// ============================================================

function adicionarPaginaSeNecessario(doc: any, y: number, limite: number): number {
  if (y > limite) {
    doc.addPage();
    return 25;
  }
  return y;
}

function adicionarLinhaDecorativa(doc: any, y: number, largura: number, margem: number): number {
  doc.setDrawColor(180, 140, 50);
  doc.setLineWidth(0.3);
  doc.line(margem, y, largura - margem, y);
  return y + 6;
}

function adicionarTituloSecao(doc: any, titulo: string, y: number, largura: number, margem: number): number {
  y = adicionarLinhaDecorativa(doc, y, largura, margem);
  doc.setFontSize(14);
  (doc as any).setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, margem, y);
  return y + 8;
}

function adicionarSubtitulo(doc: any, texto: string, y: number, margem: number): number {
  doc.setFontSize(11);
  (doc as any).setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  doc.text(texto, margem, y);
  return y + 6;
}

function adicionarTexto(doc: any, texto: string, y: number, margem: number, largura: number): number {
  doc.setFontSize(10);
  (doc as any).setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  const linhas = doc.splitTextToSize(texto, largura);
  doc.text(linhas, margem, y);
  return y + linhas.length * 5 + 4;
}

// ============================================================
// Section generators
// ============================================================

function gerarSecaoNumerologia(doc: any, numerologia: MapaData['numerologia'], y: number, largura: number, margem: number): number {
  y = adicionarTituloSecao(doc, 'NUMEROLOGIA', y, largura, margem);

  const numeros = [
    { label: 'Número da Vida', valor: numerologia.numero_vida },
    { label: 'Número do Destino', valor: numerologia.numero_destino },
    { label: 'Número da Alma', valor: numerologia.numero_alma },
    { label: 'Número da Personalidade', valor: numerologia.numero_personalidade }
  ];

  numeros.forEach(({ label, valor }) => {
    y = adicionarPaginaSeNecessario(doc, y, 260);
    doc.setFontSize(11);
    (doc as any).setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margem, y);

    // Draw number in a circle
    (doc as any).setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    const numeroX = margem + 55;
    const numeroY = y - 4;
    doc.circle(numeroX, numeroY, 8);

    (doc as any).setTextColor(212, 175, 55);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(String(valor), numeroX, numeroY + 1, { align: 'center' });

    y += 12;
  });

  return y + 8;
}

function gerarSecaoOdu(doc: any, odu: MapaData['odu'], y: number, largura: number, margem: number): number {
  y = adicionarTituloSecao(doc, 'ODU - CAMINHO DE IFÁ', y, largura, margem);

  y = adicionarPaginaSeNecessario(doc, y, 250);

  // Odu name and number
  doc.setFontSize(13);
  (doc as any).setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(`${odu.nome} (${odu.numero})`, margem, y);
  y += 10;

  // Orixás
  y = adicionarSubtitulo(doc, 'Orixás:', y, margem);
  y = adicionarPaginaSeNecessario(doc, y, 265);
  const orixasTexto = odu.orixas.join(', ');
  y = adicionarTexto(doc, orixasTexto, y, margem, largura);

  // Quizilas
  y += 4;
  y = adicionarSubtitulo(doc, 'Quizilas:', y, margem);
  y = adicionarPaginaSeNecessario(doc, y, 265);
  const quizilasTexto = odu.quizilas.join(', ');
  y = adicionarTexto(doc, quizilasTexto, y, margem, largura);

  // Preceitos
  if (odu.preceitos) {
    y += 4;
    y = adicionarSubtitulo(doc, 'Preceitos:', y, margem);
    y = adicionarPaginaSeNecessario(doc, y, 265);
    y = adicionarTexto(doc, odu.preceitos, y, margem, largura);
  }

  return y + 8;
}

function gerarSecaoAstrologia(doc: any, astrologia: MapaData['astrologia'], y: number, largura: number, margem: number): number {
  y = adicionarTituloSecao(doc, 'ASTROLOGIA', y, largura, margem);

  // Main signs
  doc.setFontSize(12);
  (doc as any).setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text(`Signo Solar: ${astrologia.signo}`, margem, y);
  y += 8;

  y = adicionarPaginaSeNecessario(doc, y, 265);
  doc.text(`Ascendente: ${astrologia.ascendente}`, margem, y);
  y += 10;

  // Planetary positions
  if (Object.keys(astrologia.planetas).length > 0) {
    y = adicionarSubtitulo(doc, 'Posições Planetárias:', y, margem);
    y += 4;

    const larguraColuna = (largura - margem * 2) / 2;
    let col = 0;
    let x = margem;

    Object.entries(astrologia.planetas).forEach(([planeta, posicao]) => {
      y = adicionarPaginaSeNecessario(doc, y, 265);

      (doc as any).setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${planeta}: ${posicao}`, x, y);

      col++;
      if (col >= 2) {
        col = 0;
        x = margem;
        y += 6;
      } else {
        x += larguraColuna;
      }
    });

    if (col > 0) y += 6;
  }

  return y + 8;
}

function gerarSecaoTarot(doc: any, tarot: MapaData['tarot'], y: number, largura: number, margem: number): number {
  y = adicionarTituloSecao(doc, 'TAROT', y, largura, margem);

  // Birth card
  const cartaNascimento = ARCANOS_MAIORES[tarot.carta_nascimento] || `Carta ${tarot.carta_nascimento}`;
  y = adicionarPaginaSeNecessario(doc, y, 260);
  y = adicionarSubtitulo(doc, 'Carta de Nascimento:', y, margem);
  y = adicionarPaginaSeNecessario(doc, y, 260);

  // Draw card representation
  (doc as any).setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.roundedRect(margem, y - 2, 50, 25, 3, 3);

  (doc as any).setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${tarot.carta_nascimento + 1}`, margem + 25, y + 5, { align: 'center' });
  (doc as any).setTextColor(212, 175, 55);
  doc.setFontSize(9);
  doc.text(cartaNascimento, margem + 25, y + 12, { align: 'center' });
  y += 35;

  // Personal year card
  const cartaAnoPessoal = ARCANOS_MAIORES[tarot.carta_ano_pessoal] || `Carta ${tarot.carta_ano_pessoal}`;
  y = adicionarPaginaSeNecessario(doc, y, 260);
  y = adicionarSubtitulo(doc, 'Carta do Ano Pessoal:', y, margem);
  y = adicionarPaginaSeNecessario(doc, y, 260);

  (doc as any).setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.roundedRect(margem, y - 2, 50, 25, 3, 3);

  (doc as any).setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${tarot.carta_ano_pessoal + 1}`, margem + 25, y + 5, { align: 'center' });
  (doc as any).setTextColor(212, 175, 55);
  doc.setFontSize(9);
  doc.text(cartaAnoPessoal, margem + 25, y + 12, { align: 'center' });

  return y + 35;
}

function gerarSecaoOrixas(doc: any, orixas: string[], y: number, largura: number, margem: number): number {
  y = adicionarTituloSecao(doc, 'ORIXÁS', y, largura, margem);

  const texto = orixas.join(', ');
  y = adicionarPaginaSeNecessario(doc, y, 265);
  y = adicionarTexto(doc, texto, y, margem, largura);

  return y + 8;
}

function gerarSecaoSefirot(doc: any, sefirot: string[], y: number, largura: number, margem: number): number {
  y = adicionarTituloSecao(doc, 'SEFIROT', y, largura, margem);

  const texto = sefirot.join(' → ');
  y = adicionarPaginaSeNecessario(doc, y, 265);
  y = adicionarTexto(doc, texto, y, margem, largura);

  return y + 8;
}

function gerarSecaoConvergencias(doc: any, convergencias: MapaData['convergencias'], y: number, largura: number, margem: number): number {
  if (!convergencias || convergencias.length === 0) return y;

  y = adicionarTituloSecao(doc, 'CONVERGÊNCIAS', y, largura, margem);

  convergencias.forEach((conv) => {
    y = adicionarPaginaSeNecessario(doc, y, 260);

    const [r, g, b] = getForcaColor(conv.forca);
    (doc as any).setDrawColor(r, g, b);
    doc.setLineWidth(1);
    doc.setFillColor(r, g, b);
    doc.roundedRect(margem, y - 4, 8, 8, 1, 1, 'FD');

    doc.setFontSize(11);
    (doc as any).setTextColor(r, g, b);
    doc.setFont('helvetica', 'bold');
    doc.text(`${conv.energia} (${conv.forca})`, margem + 12, y);

    y += 10;
    y = adicionarPaginaSeNecessario(doc, y, 265);
    y = adicionarTexto(doc, conv.descricao, y, margem, largura);
    y += 6;
  });

  return y + 8;
}

// ============================================================
// Header and footer
// ============================================================

function adicionarHeader(doc: any, largura: number, margem: number): void {
  // Decorative top line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.line(margem, 15, largura - margem, 15);

  // Title
  doc.setFontSize(22);
  (doc as any).setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.text('Mapa da Alma', largura / 2, 25, { align: 'center' });

  doc.setFontSize(12);
  (doc as any).setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.text('Cabala dos Caminhos', largura / 2, 32, { align: 'center' });
}

function adicionarFooter(doc: any, largura: number, margem: number, pageNum: number, totalPages: number, data: MapaData): void {
  const footerY = 285;

  // Bottom decorative line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(margem, footerY, largura - margem, footerY);

  // Timestamp
  doc.setFontSize(8);
  (doc as any).setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${formatarData(data.created_at)}`, margem, footerY + 6);

  // Page number
  doc.text(`Página ${pageNum} de ${totalPages}`, largura - margem, footerY + 6, { align: 'right' });

  // ID
  (doc as any).setTextColor(180, 180, 180);
  doc.text(`ID: ${data.id}`, margem, footerY + 12);
}

// ============================================================
// Main export function
// ============================================================

async function gerarRelatorioPDF(data: MapaData): Promise<Blob> {
  // Dynamic import at call time - jsPDF is ~1MB, only load when needed
   
  const jsPDF = (await import('jspdf') as any).default;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const largura = doc.internal.pageSize.getWidth();
  const margem = 20;
  const larguraUtil = largura - margem * 2;

  // Add first page
  doc.addPage();

  // Header
  adicionarHeader(doc, largura, margem);

  let y = 45;

  // Numerology section
  y = adicionarLinhaDecorativa(doc, y, largura, margem);
  y = gerarSecaoNumerologia(doc, data.numerologia, y, largura, margem);

  // Odu section
  y = adicionarLinhaDecorativa(doc, y, largura, margem);
  y = gerarSecaoOdu(doc, data.odu, y, largura, margem);

  // Astrology section
  y = adicionarPaginaSeNecessario(doc, y, 250);
  y = adicionarLinhaDecorativa(doc, y, largura, margem);
  y = gerarSecaoAstrologia(doc, data.astrologia, y, largura, margem);

  // Tarot section
  y = adicionarPaginaSeNecessario(doc, y, 250);
  y = adicionarLinhaDecorativa(doc, y, largura, margem);
  y = gerarSecaoTarot(doc, data.tarot, y, largura, margem);

  // Orixás section
  y = adicionarPaginaSeNecessario(doc, y, 250);
  y = adicionarLinhaDecorativa(doc, y, largura, margem);
  y = gerarSecaoOrixas(doc, data.orixas, y, largura, margem);

  // Sefirot section
  y = adicionarPaginaSeNecessario(doc, y, 250);
  y = adicionarLinhaDecorativa(doc, y, largura, margem);
  y = gerarSecaoSefirot(doc, data.sefirot, y, largura, margem);

  // Convergences section
  y = adicionarPaginaSeNecessario(doc, y, 250);
  y = adicionarLinhaDecorativa(doc, y, largura, margem);
  y = gerarSecaoConvergencias(doc, data.convergencias, y, largura, margem);

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    adicionarFooter(doc, largura, margem, i, totalPages, data);
  }

  return doc.output('blob');
}
