// Reading manifest/preface generator
// eslint-disable

export type ReadingType =
  | 'mapa-natal'
  | 'relatorio-semanal'
  | 'relatorio-mensal'
  | 'transitos'
  | 'ciclos'
  | 'numerologia'
  | 'frequencias'
  | 'geometria-sagrada';

export interface ManifestData {
  tipo: ReadingType;
  nome: string;
  nascimento?: string;
  local?: string;
  proposito?: string;
  contextoEspiritual?: string;
  dataLeitura: string;
  versao?: string;
}

export interface ManifestResult {
  titulo: string;
  subtitulo: string;
  prefacio: string;
  informacoes: Record<string, string>;
  contexto: string;
}

/**
 * Portuguese month names
 */
const MESES: Record<number, string> = {
  0: 'janeiro', 1: 'fevereiro', 2: 'marco', 3: 'abril',
  4: 'maio', 5: 'junho', 6: 'julho', 7: 'agosto',
  8: 'setembro', 9: 'outubro', 10: 'novembro', 11: 'dezembro',
};

const TITULOS: Record<ReadingType, string> = {
  'mapa-natal': 'Mapa Natal Carmico',
  'relatorio-semanal': 'Relatorio Semanal',
  'relatorio-mensal': 'Relatorio Mensal',
  'transitos': 'Trânsitos Planetarios',
  'ciclos': 'Ciclos Dimensionais',
  'numerologia': 'Cifras Numerologicas',
  'frequencias': 'Frequencias Solfeggio',
  'geometria-sagrada': 'Geometria Sagrada',
};

const SUBTITULOS: Record<ReadingType, string> = {
  'mapa-natal': 'Analise Carmica e Evolutiva',
  'relatorio-semanal': 'Reflexoes e Orientacoes',
  'relatorio-mensal': 'Energias e Profecias',
  'transitos': 'Movimentos Cosmicos e Influencias',
  'ciclos': 'Portal de Transformacao',
  'numerologia': 'Codigo Vibracional',
  'frequencias': 'Harmonia Vibracional',
  'geometria-sagrada': 'Padroes Divinos',
};

const PREFACIOS: Record<ReadingType, string[]> = {
  'mapa-natal': [
    'Este mapa representa a configuracao cosmica no momento do seu nascimento.',
    'As estrelas tracam caminhos que entrelaam destino e livre arbitrio.',
    'Cada planeta carrega uma mensagem; cada casa, um ensinamento.',
  ],
  'relatorio-semanal': [
    'Esta semana traz consigo reflexos das correntes cosmica em movimento.',
    'Permita que as estrelas guiem seus passos, mas nunca abra mao da escolha.',
    'O universo conspira a seu favor quando voce se alinha a sua verdade.',
  ],
  'relatorio-mensal': [
    'O mes que se inicia revela portais de transformacao e oportunidade.',
    'As luas tracam caminhos que influenciam pensamentos e acoes.',
    'Esteja aberto as mensagens que o invisivel oferece.',
  ],
  'transitos': [
    'Os astros em movimento revelam o fluxo constante da energia universal.',
    'Quando Saturno chama, aprendemos; quando Jupiter abencoa, expandimos.',
    'Cada transito carrega uma licao esperando ser compreendida.',
  ],
  'ciclos': [
    'Os ciclos dimensionais demonstram a natureza espiral da evolucao.',
    'Cada passagem representa uma oportunidade de ascensao consciencial.',
    'A geometria do tempo revela padroes ocultos na trama da existencia.',
  ],
  'numerologia': [
    'Os numeros sao a lingua primordial do universo.',
    'Cada digito vibra com uma frequencia unica que ressoa em sua essencia.',
    'A numerologia descobre codigos ocultos em nomes e datas.',
  ],
  'frequencias': [
    'As frequencias Solfeggio sao sons de cura que ressoam atraves das dimensoes.',
    'Cada tom carrega uma intencao especifica de harmonizacao e elevacao.',
    'Permita que estas vibracoes ajustem sua energia ao seu estado ideal.',
  ],
  'geometria-sagrada': [
    'A geometria sagrada e a linguagem matematica da criacao.',
    'Os padroes perfeitos revelam a ordem divina no aparente caos.',
    'Medite nestas formas e permita que elas ativem sua memoria celular.',
  ],
};

const CONTEXTOS: Record<ReadingType, string[]> = {
  'mapa-natal': [
    'Carmico: karma acumulado moldando o destino presente.',
    'Evolutivo: proposito de alma guiando a jornada atual.',
    'Astrologico: mapa celestial indicando potenciais e licoes.',
  ],
  'relatorio-semanal': [
    'energias planetarias afeta seus chakras e campos vibracionais.',
    'portal dimensional abre espaco para reprogramacao e curacao.',
    'influencia da lua em seus processos emocionais e criativos.',
  ],
  'relatorio-mensal': [
    'transitos lunares afetando sua energia e intuicao.',
    'alinhamentos cosmiocs indicando periodos de expansao ou contecao.',
    'aspectos ocultos revelando licoes karmicas e oportunidades de cura.',
  ],
  'transitos': [
    'planetas em transitos ativando pontos no seu mapa natal.',
    'conjuncoes, oposicoes e quadrados criando tensoes evolutivas.',
    'trigonos e sextis oferecendo gracias e oportunidades de crescimento.',
  ],
  'ciclos': [
    'ciclos de Saturno indicando fases de amadurecimento e estruturacao.',
    'transitos de Pluto representando transformacoes profundas e regeneracao.',
    'ciclos de Jupiter expandindo horizontes e atraindo abundancia.',
  ],
  'numerologia': [
    'numero de vida revelando seu caminho evolutivo e missao de alma.',
    'numero de expressao demonstrando seus talentos e desafios carmicos.',
    'numero de destino correlacionando seu nome com seu proposito.',
  ],
  'frequencias': [
    'cada frequencia afeta um chakra especifico e sistemas corporais.',
    'ritmos de Schumann harmonizam seu campo com a ressonancia da Terra.',
    'mantras e visualizacoes amplificam o efeito sanador destas ondas.',
  ],
  'geometria-sagrada': [
    'Flor da Vida contem todos os padroes geometricos da criacao.',
    'Semente da Vida representa os sete dias da criacao divina.',
    'Fruto da Vida contem as proporcoes perfeitas do corpo humano.',
  ],
};

/**
 * Format date for display in Portuguese
 */
function formatarDataManifest(data: Date | string | number): string {
  const date = typeof data === 'string' || typeof data === 'number'
    ? new Date(data)
    : data;
  const dia = date.getDate();
  const mes = MESES[date.getMonth()];
  const ano = date.getFullYear();
  return `${dia} de ${mes} de ${ano}`;
}

/**
 * Get random item from array
 */
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate spiritual context based on reading type
 */
function gerarContexto(tipo: ReadingType): string {
  return getRandomItem(CONTEXTOS[tipo]);
}

/**
 * Generate preface text
 */
function gerarPrefacio(tipo: ReadingType, nome?: string): string {
  const textos = PREFACIOS[tipo];
  let prefacio = getRandomItem(textos);

  if (nome) {
    prefacio = `${nome}, ${prefacio.charAt(0).toLowerCase()}${prefacio.slice(1)}`;
  }

  return prefacio;
}

/**
 * Create readings manifest/preface
 */
export function createManifest(
  readingType: ReadingType,
  data: Partial<ManifestData> = {}
): ManifestResult {
  const nome = data.nome || 'Amado Viajante';
  const props = data as ManifestData;

  const titulo = TITULOS[readingType] || 'Leitura Espiritual';
  const subtitulo = SUBTITULOS[readingType] || 'Reflexao Cosmica';

  const dataLeitura = formatarDataManifest(
    props.dataLeitura ? new Date(props.dataLeitura) : new Date()
  );

  const informacoes: Record<string, string> = {
    'Data da Leitura': dataLeitura,
  };

  if (props.nascimento) {
    informacoes['Data de Nascimento'] = formatarDataManifest(new Date(props.nascimento));
  }

  if (props.local) {
    informacoes['Local/Cidade'] = props.local;
  }

  if (props.proposito) {
    informacoes['Proposito'] = props.proposito;
  }

  const prefacio = gerarPrefacio(readingType, nome);
  const contexto = props.contextoEspiritual || gerarContexto(readingType);

  return {
    titulo,
    subtitulo,
    prefacio,
    informacoes,
    contexto,
  };
}

/**
 * Generate brief manifest summary string
 */
export function manifestSummary(manifest: ManifestResult): string {
  const lines: string[] = [
    `===== ${manifest.titulo} =====`,
    manifest.subtitulo,
    '',
    manifest.prefacio,
    '',
    '--- Informacoes ---',
    ...Object.entries(manifest.informacoes).map(
      ([k, v]) => `${k}: ${v}`
    ),
    '',
    `Contexto: ${manifest.contexto}`,
    '========================',
  ];
  return lines.join('\n');
}
