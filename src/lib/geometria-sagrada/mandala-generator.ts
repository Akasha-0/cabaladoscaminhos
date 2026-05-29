/**
 * Mandala Generator - Geometria Sagrada
 * Gera padrões geométricos sagrados baseados em mandalas
 */

export type EstiloMandala = 'flor-da-vida' | 'seed-of-life' | 'metatron' | 'shri-yantra' | 'torus' | 'sagrado';

export interface PontoGeometrico {
  x: number;
  y: number;
  angulo: number;
  raio: number;
}

export interface Ring {
  id: number;
  raio: number;
  pontos: number;
  rotacao: number;
  elementos: 'circulo' | 'pétala' | 'triangulo' | 'quadrado' | 'estrela' | 'semente';
}

export interface MandalaConfig {
  estilo: EstiloMandala;
  centros: number;
  aneis: number;
  rotacaoBase: number;
  espirais: number;
  simetria: number;
}

export interface Mandala {
  id: string;
  config: MandalaConfig;
  aneis: Ring[];
  pontosCentrais: PontoGeometrico[];
  descricao: string;
  sefirots: string[];
  chakras: number[];
  beneficios: string[];
  dataGeracao: string;
}

const MANDALA_POR_ESTILO: Record<EstiloMandala, Omit<MandalaConfig, 'centros' | 'aneis' | 'rotacaoBase' | 'espirais'>> = {
  'flor-da-vida': { estilo: 'flor-da-vida', simetria: 6 },
  'seed-of-life': { estilo: 'seed-of-life', simetria: 7 },
  'metatron': { estilo: 'metatron', simetria: 13 },
  'shri-yantra': { estilo: 'shri-yantra', simetria: 9 },
  'torus': { estilo: 'torus', simetria: 4 },
  'sagrado': { estilo: 'sagrado', simetria: 8 },
};

function gerarPontosAnel(anel: Ring, _simetria: number): { x: number; y: number; angulo: number }[] {
  const pontos: { x: number; y: number; angulo: number }[] = [];
  const anguloPasso = (2 * Math.PI) / anel.pontos;

  for (let i = 0; i < anel.pontos; i++) {
    const angulo = i * anguloPasso + anel.rotacao;
    pontos.push({
      x: Math.cos(angulo) * anel.raio,
      y: Math.sin(angulo) * anel.raio,
      angulo,
    });
  }

  return pontos;
}

function gerarAneis(quantidade: number, raioMaximo: number, simetria: number): Ring[] {
  const aneis: Ring[] = [];
  const elementosSequencia: Ring['elementos'][] = ['semente', 'pétala', 'circulo', 'triangulo', 'quadrado', 'estrela'];

  for (let i = 0; i < quantidade; i++) {
    const raio = ((i + 1) / quantidade) * raioMaximo;
    const pontos = simetria * (i + 1);
    const elemento = elementosSequencia[i % elementosSequencia.length];

    aneis.push({
      id: i,
      raio,
      pontos,
      rotacao: (i * (Math.PI / simetria)),
      elementos: elemento,
    });
  }

  return aneis;
}

function gerarPontosCentrais(quantidade: number): PontoGeometrico[] {
  const pontos: PontoGeometrico[] = [];

  if (quantidade === 1) {
    pontos.push({ x: 0, y: 0, angulo: 0, raio: 0 });
  } else {
    const raioInterno = 10;
    for (let i = 0; i < quantidade; i++) {
      const angulo = (i / quantidade) * 2 * Math.PI;
      pontos.push({
        x: Math.cos(angulo) * raioInterno,
        y: Math.sin(angulo) * raioInterno,
        angulo,
        raio: raioInterno,
      });
    }
  }

  return pontos;
}

function gerarEspiral(aneis: Ring[], numEspirais: number): { anelId: number; x: number; y: number }[] {
  const espiral: { anelId: number; x: number; y: number }[] = [];

  if (numEspirais === 0) return [];

  for (const anel of aneis) {
    for (let s = 0; s < numEspirais; s++) {
      const anguloBase = (s / numEspirais) * 2 * Math.PI;
      const anguloAnel = (aneis.indexOf(anel) / aneis.length) * Math.PI;

      for (let i = 0; i < anel.pontos; i++) {
        const angulo = anguloBase + (i / anel.pontos) * 2 * Math.PI + anguloAnel;
        espiral.push({
          anelId: anel.id,
          x: Math.cos(angulo) * anel.raio,
          y: Math.sin(angulo) * anel.raio,
        });
      }
    }
  }

  return espiral;
}

export interface MandalaGerado {
  mandala: Mandala;
  paths: {
    anelId: number;
    tipo: Ring['elementos'];
    pontos: { x: number; y: number }[];
  }[];
  espiral: { x: number; y: number }[];
}

/**
 * Gera um mandala sagrado com base nos parâmetros especificados.
 *
 * @param estilo - Estilo geométrico do mandala
 * @param centros - Número de pontos centrais (1-7)
 * @param aneis - Número de anéis concêntricos (3-12)
 * @param espirais - Número de espirais logarítmicas (0-6)
 * @returns Mandala completo com geometria e metadados espirituais
 */
export function generateMandala(
  estilo: EstiloMandala = 'sagrado',
  centros: number = 1,
  aneis: number = 6,
  espirais: number = 3,
): MandalaGerado {
  const estiloConfig = MANDALA_POR_ESTILO[estilo];
  const simetria = estiloConfig.simetria;

  const aneisGerados = gerarAneis(aneis, 200, simetria);
  const pontosCentrais = gerarPontosCentrais(centros);

  const descricoesPorEstilo: Record<EstiloMandala, string> = {
    'flor-da-vida': 'Padrão universal de criação, representando a estrutura fundamental de toda existência.',
    'seed-of-life': 'Semente da vida, primeiro estágio da Flor da Vida, símbolo de pureza e potencial.',
    'metatron': 'Cubo de Metatron, contendo todos os sólidos platônicos e campos dimensionais.',
    'shri-yantra': 'Yantra - Instrumento divino de meditação, alinhando os chakras ao divino.',
    'torus': 'Fluxo energético em espiral, representando a energia vital universal.',
    'sagrado': 'Mandala de harmonização sagrada, equilibrando sefirots e chakras.',
  };

  const sefirotsPorEstilo: Record<EstiloMandala, string[]> = {
    'flor-da-vida': ['Kether', 'Binah'],
    'seed-of-life': ['Chokmah', 'Chesed'],
    'metatron': ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Gevurah'],
    'shri-yantra': ['Daat', 'Kether', 'Chokmah', 'Binah'],
    'torus': ['Yesod', 'Chesed'],
    'sagrado': ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
  };

  const chakrasPorEstilo: Record<EstiloMandala, number[]> = {
    'flor-da-vida': [7, 6],
    'seed-of-life': [3, 4],
    'metatron': [1, 2, 3, 4, 5, 6, 7],
    'shri-yantra': [4, 5, 6, 7],
    'torus': [1, 2, 6],
    'sagrado': [1, 2, 3, 4, 5, 6, 7],
  };

  const beneficiosPorEstilo: Record<EstiloMandala, string[]> = {
    'flor-da-vida': ['Expansão da consciência', 'Conexão com a energia criadora', 'Purificação do campo áurico'],
    'seed-of-life': ['Renovação interior', 'Despertar do potencial latente', 'Proteção energética'],
    'metatron': ['Integração dimensional', 'Libertação de padrões cristalizados', 'Acesso aos campos superiores'],
    'shri-yantra': ['Meditação profunda', 'Alinhamento dos chakras', 'Expansão da consciência'],
    'torus': ['Fluxo energético restaurado', 'Vitalidade aumentada', 'Conexão com a energia vital'],
    'sagrado': ['Harmonização completa', 'Equilíbrio energético', 'Expansão espiritual', 'Proteção multidimensional'],
  };

  const config: MandalaConfig = {
    estilo,
    centros,
    aneis,
    rotacaoBase: Math.PI / simetria,
    espirais,
    simetria,
  };

  const mandala: Mandala = {
    id: `mandala-${estilo}-${Date.now()}`,
    config,
    aneis: aneisGerados,
    pontosCentrais,
    descricao: descricoesPorEstilo[estilo],
    sefirots: sefirotsPorEstilo[estilo],
    chakras: chakrasPorEstilo[estilo],
    beneficios: beneficiosPorEstilo[estilo],
    dataGeracao: new Date().toISOString(),
  };

  const paths = aneisGerados.map(anel => ({
    anelId: anel.id,
    tipo: anel.elementos,
    pontos: gerarPontosAnel(anel, simetria).map(p => ({ x: p.x, y: p.y })),
  }));

  const espiral = gerarEspiral(aneisGerados, espirais);

  return { mandala, paths, espiral };
}