/**
 * Sacred Geometry Module
 * Geometria Sagrada
 */

export interface GeometryShape {
  id: string;
  nome: string;
  nomeIngles: string;
  descricao: string;
  simbolismo: string;
  elementos: string[];
  sefirots: string[];
  chakras: number[];
  cor: string;
  svgPath: string;
}

const GEOMETRY: GeometryShape[] = [
  {
    id: 'torus',
    nome: 'Toro',
    nomeIngles: 'Torus',
    descricao: 'Forma geométrica em formato de donut, representando o campo electromagnético e o fluxo de energia universal.',
    simbolismo: 'Fluxo energetico continuo,Auto-organizacao,Infinity loop',
    elementos: ['Anel interno', 'Anel externo', 'Eixo central'],
    sefirots: ['Chesed', 'Gevurah'],
    chakras: [1, 2, 3],
    cor: '#8B5CF6',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
  },
  {
    id: 'merkaba',
    nome: 'Merkaba',
    nomeIngles: 'Merkaba',
    descricao: 'Duas estrelas tetraedricas entrelacadas, representando veiculos de luz para ascensao espiritual.',
    simbolismo: 'Veiculo de luz,Ascensao dimensional,Equilibrio mente-corpo-espirito',
    elementos: ['2 tetraedros', 'Piramide superior', 'Piramide inferior'],
    sefirots: ['Tiferet', 'Netzach', 'Hod'],
    chakras: [4, 5, 6],
    cor: '#06B6D4',
    svgPath: 'M12 2L2 12l10 10 10-10L12 2zm0 4l6 6-6 6-6-6 6-6z',
  },
  {
    id: 'tree-of-life',
    nome: 'Arvore da Vida',
    nomeIngles: 'Tree of Life',
    descricao: 'Diagrama cabalistico com 10 sefirots conectados por 22 caminhos, representando a estrutura da realidade.',
    simbolismo: 'Caminho espiritual,Interconexao dimensional,Evolucao da consciencia',
    elementos: ['10 sefirots', '22 caminhos', '3 pilares'],
    sefirots: ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakras: [1, 2, 3, 4, 5, 6, 7],
    cor: '#22C55E',
    svgPath: 'M12 2v6m0 12v2M6 12H2m20 0h-4M7.76 7.76l4.24 4.24m8.48 8.48l4.24 4.24M7.76 16.24l4.24-4.24m8.48-8.48l4.24-4.24',
  },
  {
    id: 'spiral-sacra',
    nome: 'Espiral Sagrada',
    nomeIngles: 'Sacred Spiral',
    descricao: 'Espiral dourada baseada na sequencia de Fibonacci, representando crescimento natural e proporcao divina.',
    simbolismo: 'Crescimento spiral,Evolucao,Fibonacci',
    elementos: ['Fibonacci', 'Proporcao Aurea', 'Expansao infinita'],
    sefirots: ['Netzach', 'Yesod'],
    chakras: [2, 3],
    cor: '#F59E0B',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8z',
  },
  {
    id: 'hexagon',
    nome: 'Hexagono',
    nomeIngles: 'Hexagon',
    descricao: 'Seis lados representando equilibrio, harmonizacao e integracao dos opostos.',
    simbolismo: 'Equilibrio,Integracao,Harmonia',
    elementos: ['6 vertices', '6 lados', 'Centro geometrico'],
    sefirots: ['Tiferet'],
    chakras: [4],
    cor: '#3B82F6',
    svgPath: 'M12 2L2 7v10l10 5 10-5V7L12 2zm0 4l6 3-6 3-6-3 6-3z',
  },
  {
    id: 'star-of-david',
    nome: 'Estrela de David',
    nomeIngles: 'Star of David',
    descricao: 'Dois triangulos sobrepostos representando a uniao do masculino e feminino sagrado.',
    simbolismo: 'Uniao,Equilibrio,Protecao',
    elementos: ['2 triangulos', '6 vertices', 'Hexagono central'],
    sefirots: ['Tiferet', 'Chesed', 'Gevurah'],
    chakras: [4, 7],
    cor: '#6366F1',
    svgPath: 'M12 2L2 12l10 10 10-10L12 2zm0 4l6 6-6 6-6-6 6-6z',
  },
  {
    id: 'enneagram',
    nome: 'Eneagrama',
    nomeIngles: 'Enneagram',
    descricao: 'Diagrama de nove pontos conectado por linhas especificas, representando os nove tipos de personalidade.',
    simbolismo: 'Tipos de personalidade,Evolucao spiritual,Caminhos energeticos',
    elementos: ['9 pontos', '3 triangulos', 'Hexagono interno'],
    sefirots: ['Kether', 'Tiferet', 'Yesod'],
    chakras: [3, 4, 6],
    cor: '#EC4899',
    svgPath: 'M12 2l8.66 5v10l-8.66 5L3.34 17V7L12 2zm0 4l-6 3.46v6.92L12 20l6-3.46V9.46L12 6z',
  },
  {
    id: 'seed-of-life',
    nome: 'Semente da Vida',
    nomeIngles: 'Seed of Life',
    descricao: 'Sete circulos sobrepostos igualmente espacados, representando os sete dias da criacao.',
    simbolismo: 'Potencial puro,Inicio divino,Germinacao espiritual',
    elementos: ['Circulo central', '6 circulos circundantes'],
    sefirots: ['Kether'],
    chakras: [1, 7],
    cor: '#7B68EE',
    svgPath: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z',
  },
  {
    id: 'flower-of-life',
    nome: 'Flor da Vida',
    nomeIngles: 'Flower of Life',
    descricao: '19 circulos sobrepostos formando um padrao de flor com 6 petalas. Padrao universal encontrado em culturas antigas.',
    simbolismo: 'Criacao,Interconexao,Totalidade',
    elementos: ['19 circulos sobrepostos', '6 petalas externas', 'Centro geometrico'],
    sefirots: ['Kether', 'Chokmah', 'Binah'],
    chakras: [4, 7],
    cor: '#FFD700',
    svgPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  },
];

/**
 * Returns all sacred geometry shapes.
 */
export function getGeometry(): GeometryShape[] {
  return GEOMETRY;
}

/**
 * Returns a geometry shape by its ID.
 */
export function getGeometryById(id: string): GeometryShape | undefined {
  return GEOMETRY.find((shape) => shape.id === id);
}

/**
 * Returns geometry shapes associated with a specific sefirot.
 */
export function getGeometryBySefirot(sefirot: string): GeometryShape[] {
  return GEOMETRY.filter((shape) => shape.sefirots.includes(sefirot));
}

/**
 * Returns geometry shapes associated with a specific chakra.
 */
export function getGeometryByChakra(chakra: number): GeometryShape[] {
  return GEOMETRY.filter((shape) => shape.chakras.includes(chakra));
}