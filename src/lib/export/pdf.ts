// PDF export module for spiritual readings
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { jsPDF } = require('jspdf');

interface PosicaoPlaneta {
  planeta: string;
  longitude: number;
  latitude: number;
  distancia: number;
  velocidade: number;
  signo: string;
  casa: number;
  grauNoSigno: number;
}

interface MapaNatal {
  usuarioId: string;
  dataCalculo: Date;
  planeta: {
    sol: PosicaoPlaneta;
    lua: PosicaoPlaneta;
    mercurio: PosicaoPlaneta;
    venus: PosicaoPlaneta;
    marte: PosicaoPlaneta;
    jupiter: PosicaoPlaneta;
    saturno: PosicaoPlaneta;
    urano: PosicaoPlaneta;
    netuno: PosicaoPlaneta;
    plutao: PosicaoPlaneta;
  };
  casas: Array<{ numero: number; signo: string; grauNoSigno: number; planetaRegente: string | null }>;
  ascendente: number;
  mediumCoeli: number;
  nodes: {
    norte: PosicaoPlaneta;
    sul: PosicaoPlaneta;
  };
}

interface Ritual {
  nome: string;
  descricao?: string;
}

interface RelatorioSemanal {
  tipo: 'semanal';
  dataGeracao: Date;
  periodo: { inicio: Date; fim: Date };
  usuario: { nome: string };
  mapaNatal: MapaNatal;
  dias: unknown[];
  resumenSemanal: unknown;
  ritaisRecomendados: Ritual[];
  affirmation: string;
  frequenciasDoPeriodo: string[];
}

interface RelatorioMensal {
  tipo: 'mensal';
  dataGeracao: Date;
  previsaoMensal: unknown;
  cronogramaRitual: { rituais: Ritual[] };
}

export interface ReadingData {
  tipo: 'mapa-natal' | 'relatorio-semanal' | 'relatorio-mensal' | 'transitos' | 'ciclos' | 'numerologia';
  titulo: string;
  nome?: string;
  dataNascimento?: string;
  dataGeracao?: Date;
  mapaNatal?: MapaNatal;
  relatorioSemanal?: RelatorioSemanal;
  relatorioMensal?: RelatorioMensal;
  conteudo?: Record<string, string>;
  insights?: string[];
}

export interface PDFOptions {
  formato?: 'a4' | 'letter';
  orientacao?: 'portrait' | 'landscape';
  incluirAssinatura?: boolean;
}

const COR_PRIMARIA = '#4B0082'; // Índigo
const COR_SECUNDARIA = '#8A2BE2'; // Azul violeta
const COR_TEXTO = '#1E1E1E';

function formatarData(data: Date | string | undefined): string {
  if (!data) return '';
  const d = typeof data === 'string' ? new Date(data) : data;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatarGrau(grau: number): string {
  return `${Math.floor(grau)}°${((grau % 1) * 60).toFixed(0)}'`;
}

function formatarSigno(sign: string): string {
  return sign.charAt(0).toUpperCase() + sign.slice(1);
}

export async function generatePDF(
  readingData: ReadingData,
  options: PDFOptions = {}
): Promise<Uint8Array> {
  const { formato = 'a4', orientacao = 'portrait' } = options;

  const doc = new jsPDF({
    orientation: orientacao,
    unit: 'mm',
    format: formato,
  });

  const largura = doc.internal.pageSize.getWidth();
  const margemEsq = 20;
  let yPos = 20;

  // Linha decorativa superior
  (doc as any).setDrawColor(75, 0, 130);
  doc.setLineWidth(0.5);
  doc.line(margemEsq, yPos, largura - 20, yPos);
  yPos += 5;

  // Título principal
  doc.setFontSize(20);
  (doc as any).setTextColor(75, 0, 130);
  doc.setFont('helvetica', 'bold');
  doc.text(readingData.titulo || 'Leitura Espiritual', largura / 2, yPos, { align: 'center' });
  yPos += 10;

  // Nome do usuário
  if (readingData.nome) {
    doc.setFontSize(14);
    (doc as any).setTextColor(138, 43, 226);
    doc.setFont('helvetica', 'italic');
    doc.text(readingData.nome, largura / 2, yPos, { align: 'center' });
    yPos += 7;
  }

  // Data de nascimento
  if (readingData.dataNascimento) {
    doc.setFontSize(10);
    (doc as any).setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nascimento: ${readingData.dataNascimento}`, largura / 2, yPos, { align: 'center' });
    yPos += 5;
  }

  // Data de geração
  if (readingData.dataGeracao) {
    doc.setFontSize(9);
    (doc as any).setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${formatarData(readingData.dataGeracao)}`, largura / 2, yPos, {
      align: 'center',
    });
    yPos += 5;
  }

  yPos += 5;
  doc.line(margemEsq, yPos, largura - 20, yPos);
  yPos += 10;

  switch (readingData.tipo) {
    case 'mapa-natal':
      gerarPDFMapaNatal(doc, readingData, margemEsq, largura);
      break;
    case 'relatorio-semanal':
      gerarPDFRelatorioSemanal(doc, readingData, margemEsq, largura);
      break;
    case 'relatorio-mensal':
      gerarPDFRelatorioMensal(doc, readingData, margemEsq, largura);
      break;
    case 'transitos':
      gerarPDFTransitos(doc, readingData, margemEsq, largura);
      break;
    case 'ciclos':
      gerarPDFCiclos(doc, readingData, margemEsq, largura);
      break;
    case 'numerologia':
      gerarPDFNumerologia(doc, readingData, margemEsq, largura);
      break;
    default:
      gerarPDFConteudoGeral(doc, readingData, margemEsq, largura);
  }

  // Rodapé
  const alturaPagina = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  (doc as any).setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text('Cabala dos Caminhos - Luz, Sabedoria e Propósito', largura / 2, alturaPagina - 10, {
    align: 'center',
  });

  return doc.output('arraybuffer') as unknown as Uint8Array;
}

function adicionaSecao(doc: any, titulo: string, y: number, largura: number): number {
  doc.setFontSize(12);
  (doc as any).setTextColor(75, 0, 130);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 20, y);
  (doc as any).setDrawColor(138, 43, 226);
  doc.setLineWidth(0.3);
  doc.line(20, y + 2, 80, y + 2);
  return y + 10;
}

function adicionarPaginaSeNecessario(doc: any, y: number, limite: number): number {
  if (y > limite) {
    doc.addPage();
    return 20;
  }
  return y;
}

function gerarPDFMapaNatal(
  doc: any,
  readingData: ReadingData,
  margemEsq: number,
  largura: number
) {
  const mapa = readingData.mapaNatal;
  if (!mapa) return;

  let y = 70;
  y = adicionaSecao(doc, 'Posições Planetárias', y, largura);

  const planetas = [
    { nome: 'Sol', pos: mapa.planeta.sol },
    { nome: 'Lua', pos: mapa.planeta.lua },
    { nome: 'Mercúrio', pos: mapa.planeta.mercurio },
    { nome: 'Vênus', pos: mapa.planeta.venus },
    { nome: 'Marte', pos: mapa.planeta.marte },
    { nome: 'Júpiter', pos: mapa.planeta.jupiter },
    { nome: 'Saturno', pos: mapa.planeta.saturno },
    { nome: 'Urano', pos: mapa.planeta.urano },
    { nome: 'Netuno', pos: mapa.planeta.netuno },
    { nome: 'Plutão', pos: mapa.planeta.plutao },
  ];

  planetas.forEach(({ nome, pos }) => {
    y = adicionarPaginaSeNecessario(doc, y, 270);
    doc.setFontSize(10);
    (doc as any).setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(nome, margemEsq, y);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${formatarSigno(pos.signo)} ${formatarGrau(pos.grauNoSigno)} | Casa ${pos.casa}`,
      margemEsq + 30,
      y
    );
    y += 6;
  });

  y += 8;
  y = adicionarPaginaSeNecessario(doc, y, 250);
  y = adicionaSecao(doc, 'Ascendente', y, largura);
  y += 5;
  doc.setFontSize(12);
  (doc as any).setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(formatarSigno(mapa.planeta.sol.signo), margemEsq, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ascendente: ${formatarGrau(mapa.ascendente)}`, margemEsq + 40, y);
}

function gerarPDFRelatorioSemanal(
  doc: any,
  readingData: ReadingData,
  margemEsq: number,
  largura: number
) {
  const relatorio = readingData.relatorioSemanal;
  if (!relatorio) return;

  let y = 70;
  y = adicionaSecao(doc, 'Resumo da Semana', y, largura);
  y += 5;

  if (relatorio.resumenSemanal) {
    doc.setFontSize(10);
    (doc as any).setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    const linhas = doc.splitTextToSize(JSON.stringify(relatorio.resumenSemanal), largura - 40);
    doc.text(linhas, margemEsq, y);
    y += linhas.length * 5 + 8;
  }

  if (relatorio.affirmation) {
    y = adicionarPaginaSeNecessario(doc, y, 250);
    y = adicionaSecao(doc, 'Afirmação da Semana', y, largura);
    y += 5;
    doc.setFontSize(11);
    (doc as any).setTextColor(138, 43, 226);
    doc.setFont('helvetica', 'italic');
    const affLinhas = doc.splitTextToSize(`"${relatorio.affirmation}"`, largura - 40);
    doc.text(affLinhas, largura / 2, y, { align: 'center' });
    y += affLinhas.length * 5 + 10;
  }

  if (relatorio.ritaisRecomendados?.length) {
    y = adicionarPaginaSeNecessario(doc, y, 250);
    y = adicionaSecao(doc, 'Rituais Recomendados', y, largura);
    y += 5;
    relatorio.ritaisRecomendados.forEach((ritual) => {
      y = adicionarPaginaSeNecessario(doc, y, 270);
      doc.setFontSize(10);
      (doc as any).setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${ritual.nome}`, margemEsq, y);
      y += 5;
      if (ritual.descricao) {
        doc.setFont('helvetica', 'normal');
        const descLinhas = doc.splitTextToSize(ritual.descricao, largura - 45);
        doc.text(descLinhas, margemEsq + 5, y);
        y += descLinhas.length * 5 + 3;
      }
    });
  }
}

function gerarPDFRelatorioMensal(
  doc: any,
  readingData: ReadingData,
  margemEsq: number,
  largura: number
) {
  const relatorio = readingData.relatorioMensal;
  if (!relatorio) return;

  let y = 70;
  y = adicionaSecao(doc, 'Energia do Mês', y, largura);
  y += 5;

  doc.setFontSize(10);
  (doc as any).setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  if (relatorio.previsaoMensal) {
    const previsoes = doc.splitTextToSize(JSON.stringify(relatorio.previsaoMensal), largura - 40);
    doc.text(previsoes, margemEsq, y);
    y += previsoes.length * 5 + 8;
  }

  if (relatorio.cronogramaRitual?.rituais?.length) {
    y = adicionarPaginaSeNecessario(doc, y, 250);
    y = adicionaSecao(doc, 'Cronograma de Rituais', y, largura);
    y += 5;
    relatorio.cronogramaRitual.rituais.forEach((ritual) => {
      y = adicionarPaginaSeNecessario(doc, y, 270);
      doc.setFontSize(10);
      (doc as any).setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${ritual.nome}`, margemEsq, y);
      y += 5;
    });
  }
}

function gerarPDFTransitos(
  doc: any,
  readingData: ReadingData,
  margemEsq: number,
  largura: number
) {
  let y = 70;
  y = adicionaSecao(doc, 'Trânsitos Planetários', y, largura);
  y += 5;

  if (readingData.conteudo) {
    doc.setFontSize(10);
    (doc as any).setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    Object.entries(readingData.conteudo).forEach(([planeta, descricao]) => {
      y = adicionarPaginaSeNecessario(doc, y, 270);
      doc.setFont('helvetica', 'bold');
      doc.text(planeta, margemEsq, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const linhas = doc.splitTextToSize(descricao, largura - 40);
      doc.text(linhas, margemEsq, y);
      y += linhas.length * 5 + 8;
    });
  }

  if (readingData.insights?.length) {
    y += 5;
    y = adicionaSecao(doc, 'Insights', y, largura);
    y += 5;
    readingData.insights.forEach((insight) => {
      y = adicionarPaginaSeNecessario(doc, y, 270);
      doc.setFontSize(10);
      (doc as any).setTextColor(138, 43, 226);
      doc.setFont('helvetica', 'italic');
      const linhas = doc.splitTextToSize(`"${insight}"`, largura - 40);
      doc.text(linhas, margemEsq, y);
      y += linhas.length * 5 + 5;
    });
  }
}

function gerarPDFCiclos(
  doc: any,
  readingData: ReadingData,
  margemEsq: number,
  largura: number
) {
  let y = 70;
  y = adicionaSecao(doc, 'Ciclos de Vida', y, largura);
  y += 5;

  if (readingData.conteudo) {
    doc.setFontSize(10);
    (doc as any).setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    Object.entries(readingData.conteudo).forEach(([ciclos, descricao]) => {
      y = adicionarPaginaSeNecessario(doc, y, 270);
      doc.setFont('helvetica', 'bold');
      doc.text(ciclos, margemEsq, y);
      y += 5;
      const linhas = doc.splitTextToSize(descricao, largura - 40);
      doc.text(linhas, margemEsq, y);
      y += linhas.length * 5 + 8;
    });
  }
}

function gerarPDFNumerologia(
  doc: any,
  readingData: ReadingData,
  margemEsq: number,
  largura: number
) {
  let y = 70;
  y = adicionaSecao(doc, 'Numerologia', y, largura);
  y += 5;

  if (readingData.conteudo) {
    doc.setFontSize(11);
    (doc as any).setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    Object.entries(readingData.conteudo).forEach(([chave, valor]) => {
      y = adicionarPaginaSeNecessario(doc, y, 270);
      doc.setFont('helvetica', 'bold');
      (doc as any).setTextColor(75, 0, 130);
      doc.text(chave, margemEsq, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      (doc as any).setTextColor(30, 30, 30);
      const linhas = doc.splitTextToSize(valor, largura - 40);
      doc.text(linhas, margemEsq, y);
      y += linhas.length * 5 + 8;
    });
  }

  if (readingData.insights?.length) {
    y += 5;
    y = adicionaSecao(doc, 'Reflexão', y, largura);
    y += 5;
    readingData.insights.forEach((insight) => {
      y = adicionarPaginaSeNecessario(doc, y, 270);
      doc.setFontSize(10);
      (doc as any).setTextColor(138, 43, 226);
      doc.setFont('helvetica', 'italic');
      const linhas = doc.splitTextToSize(insight, largura - 40);
      doc.text(linhas, margemEsq, y);
      y += linhas.length * 5 + 5;
    });
  }
}

function gerarPDFConteudoGeral(
  doc: any,
  readingData: ReadingData,
  margemEsq: number,
  largura: number
) {
  let y = 70;

  if (readingData.conteudo) {
    doc.setFontSize(10);
    (doc as any).setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    Object.entries(readingData.conteudo).forEach(([titulo, conteudo]) => {
      y = adicionarPaginaSeNecessario(doc, y, 270);
      y = adicionaSecao(doc, titulo, y, largura);
      y += 5;
      const linhas = doc.splitTextToSize(conteudo, largura - 40);
      doc.text(linhas, margemEsq, y);
      y += linhas.length * 5 + 10;
    });
  }

  if (readingData.insights?.length) {
    y = adicionaSecao(doc, 'Insights', y, largura);
    y += 5;
    readingData.insights.forEach((insight) => {
      y = adicionarPaginaSeNecessario(doc, y, 270);
      doc.setFontSize(10);
      (doc as any).setTextColor(138, 43, 226);
      doc.setFont('helvetica', 'italic');
      const linhas = doc.splitTextToSize(`"${insight}"`, largura - 40);
      doc.text(linhas, margemEsq, y);
      y += linhas.length * 5 + 5;
    });
  }
}

// ============================================================
// Chart-specific PDF template
// ============================================================

interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  house: number;
}

interface AspectData {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

interface ChartTemplateData {
  nome?: string;
  dataNascimento?: string;
  signoSolar?: string;
  ascendente?: string;
  planets: PlanetPosition[];
  aspects: AspectData[];
  planetKeys?: string[];
}

/**
 * Draws a circular birth chart visualization with zodiac wheel and planet positions
 */
function drawBirthChartWheel(doc: any, centerX: number, centerY: number, radius: number): void {
  // Draw outer wheel
  doc.setDrawColor(74, 0, 130);
  doc.setLineWidth(1);
  doc.circle(centerX, centerY, radius);

  // Draw zodiac signs segments (12 signs)
  const segmentAngle = 30;
  for (let i = 0; i < 12; i++) {
    const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
    doc.setDrawColor(200, 200, 220);
    doc.setLineWidth(0.3);
    doc.line(
      centerX + Math.cos(startAngle) * (radius * 0.3),
      centerY + Math.sin(startAngle) * (radius * 0.3),
      centerX + Math.cos(startAngle) * radius,
      centerY + Math.sin(startAngle) * radius
    );
  }

  // Draw inner house ring
  doc.setDrawColor(180, 180, 200);
  doc.setLineWidth(0.5);
  doc.circle(centerX, centerY, radius * 0.7);
  doc.circle(centerX, centerY, radius * 0.5);

  // Draw sign symbols around the wheel
  const signSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  doc.setFontSize(8);
  for (let i = 0; i < 12; i++) {
    const angle = ((i * 30 + 15) - 90) * (Math.PI / 180);
    const x = centerX + Math.cos(angle) * (radius * 0.85);
    const y = centerY + Math.sin(angle) * (radius * 0.85);
    doc.setFont('helvetica', 'normal');
    (doc as any).setTextColor(74, 0, 130);
    doc.text(signSymbols[i], x - 2, y + 2);
  }
}

/**
 * Plots planet positions on the birth chart wheel
 */
function plotPlanetPositions(
  doc: any,
  centerX: number,
  centerY: number,
  radius: number,
  planets: PlanetPosition[]
): void {
  doc.setFontSize(7);
  const signList = ['aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem', 'libra', 'escorpiao', 'sagitario', 'capricornio', 'aquario', 'peixes'];
  const planetGlyphs: Record<string, string> = {
    'Sol': '☉', 'Lua': '☽', 'Mercúrio': '☿', 'Vênus': '♀', 'Marte': '♂',
    'Júpiter': '♃', 'Saturno': '♄', 'Urano': '♅', 'Netuno': '♆', 'Plutão': '♇',
    'Norte': '☊', 'Sul': '☋'
  };

  planets.forEach((planet) => {
    const signIndex = signList.indexOf(planet.sign.toLowerCase());
    const longitudeAngle = ((signIndex * 30 + planet.degree) - 90) * (Math.PI / 180);
    const distance = radius * 0.6;
    const px = centerX + Math.cos(longitudeAngle) * distance;
    const py = centerY + Math.sin(longitudeAngle) * distance;

    const glyph = planetGlyphs[planet.name] || '○';
    doc.setFont('helvetica', 'bold');
    (doc as any).setTextColor(138, 43, 226);
    doc.text(glyph, px - 3, py + 2);

    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    (doc as any).setTextColor(30, 30, 30);
    doc.text(planet.name.substring(0, 3), px + 2, py + 2);
  });
}

/**
 * Draws aspect lines between planets
 */
function drawAspectLines(
  doc: any,
  centerX: number,
  centerY: number,
  radius: number,
  aspects: AspectData[],
  planets: PlanetPosition[]
): void {
  const aspectColors: Record<string, [number, number, number]> = {
    'conjunção': [200, 100, 100],
    'oposição': [100, 100, 200],
    'quadratura': [200, 50, 50],
    'trígono': [50, 180, 100],
    'sextil': [100, 180, 150],
    'semisextil': [150, 150, 150],
  };

  const signList = ['aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem', 'libra', 'escorpiao', 'sagitario', 'capricornio', 'aquario', 'peixes'];

  aspects.forEach((aspect) => {
    const p1 = planets.find(p => p.name.toLowerCase() === aspect.planet1.toLowerCase());
    const p2 = planets.find(p => p.name.toLowerCase() === aspect.planet2.toLowerCase());
    if (!p1 || !p2) return;

    const signIndex1 = signList.indexOf(p1.sign.toLowerCase());
    const signIndex2 = signList.indexOf(p2.sign.toLowerCase());
    const angle1 = ((signIndex1 * 30 + p1.degree) - 90) * (Math.PI / 180);
    const angle2 = ((signIndex2 * 30 + p2.degree) - 90) * (Math.PI / 180);
    const dist = radius * 0.6;

    const x1 = centerX + Math.cos(angle1) * dist;
    const y1 = centerY + Math.sin(angle1) * dist;
    const x2 = centerX + Math.cos(angle2) * dist;
    const y2 = centerY + Math.sin(angle2) * dist;

    const color = aspectColors[aspect.type.toLowerCase()] || [100, 100, 100];
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.4);
    doc.line(x1, y1, x2, y2);
  });
}

/**
 * Renders the planetary positions table in the PDF
 */
function renderPlanetaryPositionsTable(
  doc: any,
  yStart: number,
  margemEsq: number,
  largura: number,
  planets: PlanetPosition[]
): number {
  let y = yStart;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  (doc as any).setTextColor(74, 0, 130);
  doc.text('TABELA DE POSIÇÕES PLANETÁRIAS', margemEsq, y);
  y += 10;

  const cols = { planeta: margemEsq, signo: margemEsq + 50, grau: margemEsq + 100, casa: margemEsq + 140 };
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  (doc as any).setTextColor(30, 30, 30);
  doc.text('Planeta', cols.planeta, y);
  doc.text('Signo', cols.signo, y);
  doc.text('Grau', cols.grau, y);
  doc.text('Casa', cols.casa, y);
  y += 6;

  doc.setDrawColor(138, 43, 226);
  doc.setLineWidth(0.5);
  doc.line(cols.planeta, y, cols.casa + 30, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  planets.forEach((planet) => {
    (doc as any).setTextColor(30, 30, 30);
    doc.text(planet.name, cols.planeta, y);
    doc.text(formatarSigno(planet.sign), cols.signo, y);
    doc.text(formatarGrau(planet.degree), cols.grau, y);
    doc.text(planet.house.toString(), cols.casa, y);
    y += 6;
  });

  return y + 5;
}

/**
 * Renders the aspects table/diagram
 */
function renderAspectsTable(
  doc: any,
  yStart: number,
  margemEsq: number,
  largura: number,
  aspects: AspectData[]
): number {
  let y = yStart;

  if (!aspects || aspects.length === 0) return y;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  (doc as any).setTextColor(74, 0, 130);
  doc.text('ASPECTOS', margemEsq, y);
  y += 10;

  const cols = { pl1: margemEsq, aspecto: margemEsq + 70, pl2: margemEsq + 110, orb: margemEsq + 150 };
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  (doc as any).setTextColor(30, 30, 30);
  doc.text('Planeta 1', cols.pl1, y);
  doc.text('Aspecto', cols.aspecto, y);
  doc.text('Planeta 2', cols.pl2, y);
  doc.text('Orbe', cols.orb, y);
  y += 6;

  doc.setDrawColor(138, 43, 226);
  doc.setLineWidth(0.5);
  doc.line(cols.pl1, y, cols.orb + 30, y);
  y += 8;

  const aspectColors: Record<string, string> = {
    'conjunção': '#C86464',
    'oposição': '#6464C8',
    'quadratura': '#C83232',
    'trígono': '#32B464',
    'sextil': '#64B496',
    'semisextil': '#969696',
  };

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  aspects.forEach((aspect) => {
    const colorHex = aspectColors[aspect.type.toLowerCase()] || '#1E1E1E';
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);
    (doc as any).setTextColor(r, g, b);
    doc.text(aspect.planet1, cols.pl1, y);
    (doc as any).setTextColor(30, 30, 30);
    doc.text(aspect.type, cols.aspecto, y);
    doc.text(aspect.planet2, cols.pl2, y);
    (doc as any).setTextColor(100, 100, 100);
    doc.text(`${aspect.orb.toFixed(1)}°`, cols.orb, y);
    y += 6;
  });

  return y + 10;
}

/**
 * Generates a chart-specific PDF with birth chart visualization
 */
export async function generateChartPDF(
  data: ChartTemplateData,
  options: PDFOptions = {}
): Promise<Uint8Array> {
  const doc = new jsPDF({
    orientation: options.formato === 'letter' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: options.formato || 'a4',
  });

  const margemEsq = 20;
  const largura = doc.internal.pageSize.getWidth() - margemEsq - 20;
  let y = 20;

  // Header
  doc.setFillColor(74, 0, 130);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, 'F');

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  (doc as any).setTextColor(255, 255, 255);
  doc.text('Carta Natal', margemEsq, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (data.nome) {
    doc.text(data.nome, margemEsq, 28);
  }
  if (data.dataNascimento) {
    doc.text(data.dataNascimento, margemEsq + 50, 28);
  }

  (doc as any).setTextColor(255, 255, 255);
  if (data.signoSolar) {
    doc.text(`Sol: ${formatarSigno(data.signoSolar)}`, margemEsq + 110, 18);
  }
  if (data.ascendente) {
    doc.text(`Ascendente: ${formatarSigno(data.ascendente)}`, margemEsq + 110, 26);
  }

  y = 45;
  (doc as any).setTextColor(30, 30, 30);

  // Birth chart visualization - centered
  const chartWidth = doc.internal.pageSize.getWidth();
  const chartHeight = doc.internal.pageSize.getHeight() - y - 20;
  const chartCenterX = chartWidth / 2;
  const chartCenterY = y + chartHeight / 2 + 10;
  const chartRadius = Math.min(chartWidth, chartHeight) / 2 - 25;

  if (chartRadius > 30) {
    drawBirthChartWheel(doc, chartCenterX, chartCenterY, chartRadius);

    if (data.planets && data.planets.length > 0) {
      plotPlanetPositions(doc, chartCenterX, chartCenterY, chartRadius, data.planets);
    }

    if (data.aspects && data.aspects.length > 0 && data.planets) {
      drawAspectLines(doc, chartCenterX, chartCenterY, chartRadius, data.aspects, data.planets);
    }
  }

  // Add planetary positions table below chart
  y = chartCenterY + chartRadius + 15;
  if (y < 200) y = 200;

  if (data.planets && data.planets.length > 0) {
    y = renderPlanetaryPositionsTable(doc, y, margemEsq, largura, data.planets);
  }

  if (data.aspects && data.aspects.length > 0) {
    y = renderAspectsTable(doc, y, margemEsq, largura, data.aspects);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  (doc as any).setTextColor(150, 150, 150);
  doc.text(
    'Cábala dos Caminhos - Carta Natal',
    chartWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  return doc.output('arraybuffer') as unknown as Uint8Array;
}

/**
 * Converts full chart data to ChartTemplateData format
 */
export function extractChartDataForPDF(
  mapaNatal: MapaNatal | undefined,
  aspectos?: Array<{ planeta1: string; planeta2: string; tipo: string; orbe: number }>
): ChartTemplateData | null {
  if (!mapaNatal) return null;

  const planetMap = mapaNatal.planeta;
  const planets: PlanetPosition[] = [
    { name: 'Sol', sign: planetMap.sol.signo, degree: planetMap.sol.grauNoSigno, house: planetMap.sol.casa },
    { name: 'Lua', sign: planetMap.lua.signo, degree: planetMap.lua.grauNoSigno, house: planetMap.lua.casa },
    { name: 'Mercúrio', sign: planetMap.mercurio.signo, degree: planetMap.mercurio.grauNoSigno, house: planetMap.mercurio.casa },
    { name: 'Vênus', sign: planetMap.venus.signo, degree: planetMap.venus.grauNoSigno, house: planetMap.venus.casa },
    { name: 'Marte', sign: planetMap.marte.signo, degree: planetMap.marte.grauNoSigno, house: planetMap.marte.casa },
    { name: 'Júpiter', sign: planetMap.jupiter.signo, degree: planetMap.jupiter.grauNoSigno, house: planetMap.jupiter.casa },
    { name: 'Saturno', sign: planetMap.saturno.signo, degree: planetMap.saturno.grauNoSigno, house: planetMap.saturno.casa },
    { name: 'Urano', sign: planetMap.urano.signo, degree: planetMap.urano.grauNoSigno, house: planetMap.urano.casa },
    { name: 'Netuno', sign: planetMap.netuno.signo, degree: planetMap.netuno.grauNoSigno, house: planetMap.netuno.casa },
    { name: 'Plutão', sign: planetMap.plutao.signo, degree: planetMap.plutao.grauNoSigno, house: planetMap.plutao.casa },
  ];

  if (mapaNatal.nodes?.norte) {
    planets.push({ name: 'Norte', sign: mapaNatal.nodes.norte.signo, degree: mapaNatal.nodes.norte.grauNoSigno, house: mapaNatal.nodes.norte.casa });
  }

  const aspects: AspectData[] = (aspectos || []).map(a => ({
    planet1: a.planeta1,
    planet2: a.planeta2,
    type: a.tipo,
    orb: a.orbe,
  }));

  const ascendenteSign = getSignoFromGrau(mapaNatal.ascendente);

  return {
    nome: mapaNatal.usuarioId,
    planets,
    aspects,
    signoSolar: planetMap.sol.signo,
    ascendente: ascendenteSign,
  };
}

function getSignoFromGrau(grau: number): string {
  const normalized = ((grau % 360) + 360) % 360;
  const signos = ['aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem', 'libra', 'escorpiao', 'sagitario', 'capricornio', 'aquario', 'peixes'];
  return signos[Math.floor(normalized / 30)];
}