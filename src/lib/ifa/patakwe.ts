// fallow-ignore-file unused-file
// Patakwe - Ifa Divination System - Cabala Dos Caminhos
// Traditional verses and meanings for Patakwe Odu

/**
 * Traditional verses (Ora) associated with Patakwe
 */
export interface PatakweVerse {
  verso: string;
  tradicao: string;
  significado: string;
}

/**
 * Patakwe meanings and interpretations
 */
export interface PatakweInfo {
  nome: string;
  numero: number;
  elementos: string[];
  orixaRegente: string;
  caminhoVida: string;
  qualidades: string[];
  desafios: string[];
  mensagens: string[];
  ebos: string[];
  quizilas: string[];
  virtudes: string[];
  verses: PatakweVerse[];
}

/**
 * Complete Patakwe data with traditional verses
 */
export const patakweData: PatakweInfo = {
  nome: 'Patakwe',
  numero: 16,
  elementos: ['Ogun', 'Obaluaye', 'Osanyin'],
  orixaRegente: 'Ogun',
  caminhoVida: 'O guerreiro que vence batalhas invisiveis',
  qualidades: [
    'Coragem inabalavel',
    'Forca de vontade',
    'Determinacao inquebrantavel',
    'Lideranca natural',
    'Protecao espiritual',
    'Resiliencia diante da adversidade'
  ],
  desafios: [
    'Tendencia a ser terlalu rigido',
    'Dificuldade em aceitar ajuda',
    'Conflitos por causa de principios',
    'Isolamento voluntario'
  ],
  mensagens: [
    'A batalha que voce enfrenta hoje preparara sua vitoria de amanha',
    'Nao lute sozinho quando existen forcas aliadas ao seu lado',
    'A arma mais poderosa e a verdade que voce carrega',
    'O ferro que nao e temperado pelo fogo se quebra na primeira bataha'
  ],
  ebos: [
    'Ebo de ferro - para fortalecer a protecao',
    'Ebo de melao - para suavizar o caminho',
    'Ebo de pioca - para abrir as portas bloqueadas',
    'Ebo deogun - para invocar a forca de Ogun'
  ],
  quizilas: [
    'Nao comer carne de porco',
    'Nao cruzar linhas de ferro',
    'Nao pronunciar mentiras',
    'Nao abandonar companheiros de batalha'
  ],
  virtudes: [
    'Honra acima de tudo',
    'Lealdade inquebrantavel',
    'Verdade como escudo',
    'Disciplina como estilo de vida'
  ],
  verses: [
    {
      verso: "Patakwe logbon, ose ni o gbon",
      tradicao: 'Ile-Ife',
      significado: 'Patakwe carrega a forca de dezesseis guerreiros'
    },
    {
      verso: 'Ogun ni o ba Patakwe lowo',
      tradicao: 'Yoruba Tradicional',
      significado: 'Aquele que caminha com Patakwe caminha com Ogun'
    },
    {
      verso: 'Igi okosi la fi n se ebo',
      tradicao: 'Ile-Ife',
      significado: 'Com o ferro da forja sagrada se faz o ebo'
    },
    {
      verso: 'Aje ki i se oogun ologbose',
      tradicao: 'Yoruba Tradicional',
      significado: 'A riqueza nao e medicacao para o tolo'
    },
    {
      verso: 'Oju ogun la fi n wo omo',
      tradicao: 'Ile-Ife',
      significado: 'Os olhos da guerra avaliam a coragem da crianca'
    },
    {
      verso: 'Bi ogun ti mo, ao gbon fii',
      tradicao: 'Ketu',
      significado: 'Quando a guerra chega, a sabedoria se manifesta'
    },
    {
      verso: 'Patakwe o dabi ogun titun',
      tradicao: 'Yoruba Tradicional',
      significado: 'Patakwe nao e como outra guerra qualquer'
    },
    {
      verso: 'Ebo la fi n pa ogo',
      tradicao: 'Ile-Ife',
      significado: 'Com sacrificio se apaga a ofensa'
    }
  ]
};

/**
 * Get Patakwe information
 */
export function getPatakwe(): PatakweInfo {
  return patakweData;
}

/**
 * Get specific Patakwe verse by index
 */
export function getPatakweVerse(index: number): PatakweVerse | null {
  const verse = patakweData.verses[index];
  return verse || null;
}

/**
 * Get all Patakwe verses
 */
export function getAllPatakweVerses(): PatakweVerse[] {
  return patakweData.verses;
}

/**
 * Get Patakwe messages for meditation
 */
export function getPatakweMessages(): string[] {
  return patakweData.mensagens;
}

/**
 * Get Patakwe ebos (sacrifices)
 */
export function getPatakweEbós(): string[] {
  return patakweData.ebos;
}

/**
 * Get Patakwe quizilas (prohibitions)
 */
export function getPatakweQuizilas(): string[] {
  return patakweData.quizilas;
}
