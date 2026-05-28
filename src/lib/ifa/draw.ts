// Odu Drawing Mechanism - Cabala Dos Caminhos
// Merindilogun (16 Odus) with Opes (Trigrams)
// Traditional Ifa divination system

// Opes (Trigrams) - The 8 fundamental building blocks
export interface Ope {
  id: number;
  nome: string;
  simbolo: string; // Unicode symbol representation
  linhas: boolean[]; // true = aberto (yang), false = fechado (yin)
  significado: string;
  natureza: 'Yang' | 'Yin' | 'Neutro';
}

export const opes: Ope[] = [
  {
    id: 1,
    nome: 'Ogbe',
    simbolo: '☰',
    linhas: [true, true, true],
    significado: 'Caminho aberto, inicio, movimento, prosperidade',
    natureza: 'Yang'
  },
  {
    id: 2,
    nome: 'Oyun',
    simbolo: '☱',
    linhas: [true, true, false],
    significado: 'Desenvolvimento gradual, fluxo, suavidade',
    natureza: 'Yang'
  },
  {
    id: 3,
    nome: 'Oturupon',
    simbolo: '☲',
    linhas: [true, false, true],
    significado: 'Desordem, transformacao, crise necessaria',
    natureza: 'Neutro'
  },
  {
    id: 4,
    nome: 'Odionran',
    simbolo: '☳',
    linhas: [false, true, true],
    significado: 'Despertar, movimento brusco, despertar da consciencia',
    natureza: 'Yang'
  },
  {
    id: 5,
    nome: 'Ossa',
    simbolo: '☴',
    linhas: [true, false, false],
    significado: 'Vento, comunicacao, mudanca, viagem',
    natureza: 'Neutro'
  },
  {
    id: 6,
    nome: 'Obara',
    simbolo: '☶',
    linhas: [false, true, false],
    significado: 'Lei, ordem, justica, disciplina',
    natureza: 'Yin'
  },
  {
    id: 7,
    nome: 'Owonrin',
    simbolo: '☷',
    linhas: [false, false, true],
    significado: 'Montanha, silencio, introspeccao, contencao',
    natureza: 'Yin'
  },
  {
    id: 8,
    nome: 'Oka',
    simbolo: '☸',
    linhas: [false, false, false],
    significado: 'Camino fechado, fim de ciclo, encerramento, morte',
    natureza: 'Yin'
  }
];

// Merindilogun Odu configuration
export interface Odu {
  numero: number;
  nome: string;
  opeCima: Ope;
  opeBaixo: Ope;
  elementos: string;
  orixaRegente: string;
  significado: string;
}

// Map of 16 Odu to their Ope combinations (top + bottom)
const oduMap: Record<number, { top: number; bottom: number; elementos: string; orixa: string; significado: string }> = {
  1: { top: 1, bottom: 1, elementos: 'Terra/Fogo', orixa: 'Exu', significado: 'O comeco, a duvida, a insubordinacao. Caminho dificil, mas de grande aprendizado.' },
  2: { top: 1, bottom: 2, elementos: 'Ar/Terra', orixa: 'Ibeji', significado: 'A dualidade, os caminhos duplos, uniao e disputa. Vitoria apos grandes lutas.' },
  3: { top: 1, bottom: 3, elementos: 'Fogo/Terra', orixa: 'Ogum', significado: 'A revolta, a forca fisica, a criacao de ferramentas. O corte e a separacao.' },
  4: { top: 1, bottom: 4, elementos: 'Fogo/Terra', orixa: 'Iemanja', significado: 'O aviso, o sangue que corre nas veias, a visao espiritual. Olhar para o futuro.' },
  5: { top: 1, bottom: 5, elementos: 'Agua', orixa: 'Oxum', significado: 'O ouro, a docura, a feiticararia, a vaidade e a lagrima. Sangue menstrual.' },
  6: { top: 1, bottom: 6, elementos: 'Ar/Fogo', orixa: 'Xango', significado: 'A riqueza, a fartura, a sabedoria e a surpresa. O rei que se veste de mendigo.' },
  7: { top: 1, bottom: 7, elementos: 'Terra/Agua', orixa: 'Omolu', significado: 'A teimosia, o renascimento, as coisas ocultas, o poco profundo.' },
  8: { top: 1, bottom: 8, elementos: 'Ar/Agua', orixa: 'Oxala', significado: 'A cabeca (Ori), a lideranca, o topo do mundo, o sangue branco.' },
  9: { top: 2, bottom: 1, elementos: 'Ar/Agua', orixa: 'Iansa', significado: 'O vento, as transformacoes rapidas, o reino das Iyami (as bruxas ancestrais).' },
  10: { top: 2, bottom: 2, elementos: 'Ar/Agua', orixa: 'Oxala', significado: 'O misterio, a velhice, a cura, o sopro divino. O Odu mais velho da criacao.' },
  11: { top: 2, bottom: 3, elementos: 'Fogo/Ar', orixa: 'Iansa', significado: 'A pressa, a ansiedade, a mudanca de rumo rapida. O vento que espalha as folhas.' },
  12: { top: 2, bottom: 4, elementos: 'Fogo', orixa: 'Xango', significado: 'A justica, o fogo purificador, a guerra justa, os terremotos.' },
  13: { top: 2, bottom: 5, elementos: 'Terra/Agua', orixa: 'Nana', significado: 'A doenca, as transformacoes fisicas, o fim de ciclos. O recolhimento.' },
  14: { top: 2, bottom: 6, elementos: 'Agua/Terra', orixa: 'Oxumare', significado: 'A traicao, a cobra que morde, a sabedoria oculta e a renovacao da pele.' },
  15: { top: 2, bottom: 7, elementos: 'Fogo/Terra', orixa: 'Oba', significado: 'A feiticararia, o corte pesado, as disputas por espaco ou poder.' },
  16: { top: 2, bottom: 8, elementos: 'Ar/Luz', orixa: 'Orunmila', significado: 'A paz absoluta, a luz total, a confirmacao dos Deuses. Tudo esta bem.' }
};

// Get Ope by ID
export function getOpe(id: number): Ope {
  return opes.find(o => o.id === id) || opes[0];
}

// Get all 16 Odu
export function getAllOdu(): Odu[] {
  return Object.entries(oduMap).map(([num, config]) => ({
    numero: parseInt(num),
    nome: getOduNome(parseInt(num)),
    opeCima: getOpe(config.top),
    opeBaixo: getOpe(config.bottom),
    elementos: config.elementos,
    orixaRegente: config.orixa,
    significado: config.significado
  }));
}

// Odu names for Merindilogun
export function getOduNome(numero: number): string {
  const nomes: Record<number, string> = {
    1: 'Okaran',
    2: 'Ejioko',
    3: 'Etaogunda',
    4: 'Irosun',
    5: 'Oxé',
    6: 'Obara',
    7: 'Odi',
    8: 'EjiOnile',
    9: 'Ossa',
    10: 'Ofun',
    11: 'Owarin',
    12: 'Ejilsebora',
    13: 'Olobon',
    14: 'Ika',
    15: 'Ogbogbe',
    16: 'Alafia'
  };
  return nomes[numero] || 'Desconhecido';
}

// Odu drawing result
export interface DrawResult {
  odu: Odu;
  opeCima: Ope;
  opeBaixo: Ope;
  linhasCima: string;
  linhasBaixo: string;
  timestamp: Date;
}

// Convert lines to visual string
function linhasToString(linhas: boolean[]): string {
  return linhas.map(l => l ? '━━━' : '━━ ━').join('\n');
}

// Main draw function - simulates Merindilogun divination
export function drawOdu(options?: {
  seed?: string;
  method?: 'random' | 'birth-date';
  dataNascimento?: string;
}): DrawResult {
  let numeroOdu: number;

  if (options?.method === 'birth-date' && options?.dataNascimento) {
    // Derive Odu from birth date using traditional calculation
    numeroOdu = deriveOduFromBirthDate(options.dataNascimento);
  } else {
    // Random draw simulating 16 cowrie shells (opon)
    numeroOdu = Math.floor(Math.random() * 16) + 1;
  }

  const config = oduMap[numeroOdu];
  const opeCima = getOpe(config.top);
  const opeBaixo = getOpe(config.bottom);

  const odu: Odu = {
    numero: numeroOdu,
    nome: getOduNome(numeroOdu),
    opeCima,
    opeBaixo,
    elementos: config.elementos,
    orixaRegente: config.orixa,
    significado: config.significado
  };

  return {
    odu,
    opeCima,
    opeBaixo,
    linhasCima: linhasToString(opeCima.linhas),
    linhasBaixo: linhasToString(opeBaixo.linhas),
    timestamp: new Date()
  };
}

// Traditional Odu derivation from birth date
function deriveOduFromBirthDate(dataNascimento: string): number {
  const numeros = dataNascimento.replace(/\D/g, '');
  
  let soma = 0;
  for (const char of numeros) {
    soma += parseInt(char);
  }
  
  // Reduce to 1-16
  while (soma > 16) {
    let novoSoma = 0;
    const digits = soma.toString().split('');
    for (const d of digits) {
      novoSoma += parseInt(d);
    }
    soma = novoSoma;
  }
  
  return soma || 1;
}

// Draw multiple Odus (for complex readings)
export function drawMultipleOdu(count: number): DrawResult[] {
  const results: DrawResult[] = [];
  
  for (let i = 0; i < count; i++) {
    results.push(drawOdu());
  }
  
  return results;
}

// Get Odu by number
export function getOduByNumber(numero: number): Odu | null {
  if (numero < 1 || numero > 16) return null;
  
  const config = oduMap[numero];
  return {
    numero,
    nome: getOduNome(numero),
    opeCima: getOpe(config.top),
    opeBaixo: getOpe(config.bottom),
    elementos: config.elementos,
    orixaRegente: config.orixa,
    significado: config.significado
  };
}