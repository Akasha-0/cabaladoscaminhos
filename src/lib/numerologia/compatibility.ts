import { calcularPitagorica, InterpretacaoNumerologia, getInterpretacao } from './calculos';
export interface CompatibilityResult {
  score: number;
  nivel: 'Baixa' | 'Moderada' | 'Alta' | 'Muito Alta';
  forcaNumero: number;
  destinoNumero: number;
  forcaDescricao: InterpretacaoNumerologia;
  destinoDescricao: InterpretacaoNumerologia;
  forca: string[];
  desafios: string[];
  harmonias: string[];
  recomendacoes: string[];
  matriz: CompatibilityMatrix;
}

export interface CompatibilityMatrix {
  forca: number;
  destino: number;
  combinacao: number;
  diferenca: number;
  harmonic: boolean;
}

const combinacoesHarmonicas: Record<string, string> = {
  '1-1': 'Dois líderes unidos — precisam aprender a合伙.',
  '1-2': 'Um impulsiona, outro sostiene — equilíbrio dinâmico.',
  '1-3': 'Inovação e comunicação andam juntas.',
  '1-4': 'Visão e estrutura — combinação prática.',
  '1-5': 'Liberdade e ação — energia alta.',
  '1-6': 'Liderança e harmonia familiar.',
  '1-7': 'Individualismo encontra profundidade espiritual.',
  '1-8': 'Poder e realização material.',
  '1-9': 'Idealismo humanitário juntas.',

  '2-2': 'Intuição compartilhada, mas podem se isolar.',
  '2-3': 'Sensibilidade encontra criatividade.',
  '2-4': 'Emoção encontra estabilidade.',
  '2-5': 'Intuição e liberdade em tensão produtiva.',
  '2-6': 'Harmonia familiar em destaque.',
  '2-7': 'Profundidade emocional e espiritual.',
  '2-8': 'Sensibilidade encontra ambição.',
  '2-9': 'Idealismo compartilhado.',

  '3-3': 'Criatividade em excesso — precisa de foco.',
  '3-4': 'Expressão encontra disciplina.',
  '3-5': 'Comunicação e mudança constante.',
  '3-6': 'Criatividade ao serviço da família.',
  '3-7': 'Expressão encontra introspecção.',
  '3-8': 'Criatividade encontra sucesso material.',
  '3-9': 'Inspiração e idealismo elevados.',

  '4-4': 'Estabilidade sólida, mas rígido.',
  '4-5': 'Mudança desafia a estabilidade.',
  '4-6': 'Família e tradição em foco.',
  '4-7': 'Prática encontra espiritualidade.',
  '4-8': 'Trabalho árduo encontra poder.',
  '4-9': 'Estrutura encontra idealismo.',

  '5-5': 'Liberdade em excesso — risco de caos.',
  '5-6': 'Liberdade e responsabilidade.',
  '5-7': 'Aventura encontra profundidade.',
  '5-8': 'Energia e ambição compartilhadas.',
  '5-9': 'Mudança e visão humanitária.',

  '6-6': 'Harmonia perfeita, mas pode gerar acomodação.',
  '6-7': 'Família encontra espiritualidade.',
  '6-8': 'Cuidado encontra sucesso.',
  '6-9': 'Serviço ao próximo em destaque.',

  '7-7': 'Introspecção em excesso — isolamento.',
  '7-8': 'Sabedoria encontra poder.',
  '7-9': 'Filosofia encontra ação.',

  '8-8': 'Realização material em alta.',
  '8-9': 'Ambição encontra idealismo.',

  '9-9': 'Humanitarismo em sua forma mais pura.'
};

const combinacoesDesafios: Record<string, string> = {
  '1-4': 'Conflito entre mudança e rotina.',
  '1-7': 'Egocentrismo pode frustrar introversão.',
  '2-5': 'Sensibilidade sobrecarregada por mudança.',
  '3-7': 'Extroversão conflita com introspecção.',
  '4-7': 'Rigidez vs. busca espiritual.',
  '5-8': 'Impaciência com ambição material.',
  '6-9': 'Expectativas emocionais vs. detachment.',
  '8-9': 'Materialismo vs. idealismo abstrato.'
};

function calcularNumeroReduzido(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((sum, d) => sum + Number(d), 0);
  }
  return n;
}

function construirMatriz(a: number, b: number): CompatibilityMatrix {
  const forca = a;
  const destino = b;
  const combinacao = calcularNumeroReduzido(a + b);
  const diferenca = Math.abs(a - b);
  const harmonic = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].includes(diferenca) || diferenca === 0;

  return { forca, destino, combinacao, diferenca, harmonic };
}

function gerarForcas(forca: number, destino: number, matriz: CompatibilityMatrix): string[] {
  const forcas: string[] = [];
  const key = `${Math.min(forca, destino)}-${Math.max(forca, destino)}`;

  if (matriz.harmonic) {
    forcas.push('Harmonia numérica entre os caminhos de vida');
  }

  if (matriz.combinacao === forca || matriz.combinacao === destino) {
    forcas.push('O número de combinação ressoa com um dos caminho');
  }

  if ([2, 4, 6, 8].includes(matriz.diferenca)) {
    forcas.push('Diferença par sugere estabilidade conjunts');
  }

  if (forca === destino) {
    forcas.push('Caminhos de vida idênticos — compreensão mútua imediata');
  }

  if (combinacoesHarmonicas[key]) {
    forcas.push(combinacoesHarmonicas[key]);
  }

  return forcas;
}

function gerarDesafios(forca: number, destino: number, matriz: CompatibilityMatrix): string[] {
  const desafios: string[] = [];
  const key = `${Math.min(forca, destino)}-${Math.max(forca, destino)}`;

  if (!matriz.harmonic && matriz.diferenca > 3) {
    desafios.push('Diferença significativa entre caminhos requer adaptação conscious');
  }

  if (matriz.diferenca === 0) {
    desafios.push('Identidade própria pode se diluir na relação');
  }

  if ([1, 3, 5, 7].includes(matriz.diferenca)) {
    desafios.push('Diferença ímpar indica perluitar de ajustes constantes');
  }

  if (combinacoesDesafios[key]) {
    desafios.push(combinacoesDesafios[key]);
  }

  return desafios;
}

function gerarHarmonias(matriz: CompatibilityMatrix): string[] {
  const harmonias: string[] = [];

  if (matriz.harmonic) {
    harmonias.push('A relação tem potencial para crescimento espiritual conjunto');
  }

  if (matriz.combinacao === 6) {
    harmonias.push('Excelente para família e vida doméstica');
  }
  if (matriz.combinacao === 5) {
    harmonias.push('Energia para aventuras e mudanças juntos');
  }
  if (matriz.combinacao === 7) {
    harmonias.push('Forte conexão intelectual e espiritual');
  }
  if (matriz.combinacao === 9) {
    harmonias.push('Potencial para grandes projetos humanitários');
  }
  if (matriz.combinacao === 11) {
    harmonias.push('Intuição elevada — podem construir algo inspirador');
  }

  return harmonias;
}

function gerarRecomendacoes(forca: number, destino: number, score: number, nivel: string): string[] {
  const recs: string[] = [];

  if (score >= 70) {
    recs.push('Aproveite a natural sintonia — construa sobre os pontos fortes');
  } else if (score >= 40) {
    recs.push('Trabalhem ativamente na comunicação para potencializar a conexão');
  } else {
    recs.push('Cada diferença é uma oportunidade de aprendizado mútuo');
  }

  if (forca === 1 || destino === 1) {
    recs.push('Estabeleçam espaços de liderança compartida');
  }
  if (forca === 4 || destino === 4) {
    recs.push('Criem rotinas que respeitem a necessidade de flexibilidade');
  }
  if (forca === 7 || destino === 7) {
    recs.push('Permitam tempo para reflexão individual');
  }

  if (nivel === 'Muito Alta') {
    recs.push('Considerem unir energias em projetos comuns');
  }

  return recs;
}

function calcularScore(matriz: CompatibilityMatrix): number {
  let score = 50;

  if (matriz.harmonic) score += 15;
  if (matriz.diferenca === 0) score += 5;
  if (matriz.diferenca <= 3) score += 10;
  if (matriz.diferenca >= 7) score -= 10;

  const soma = matriz.forca + matriz.destino;
  if ([6, 8, 10, 12].includes(soma)) score += 5;
  if ([2, 4, 14, 18].includes(soma)) score += 5;

  return Math.min(100, Math.max(0, score));
}

function getNivel(score: number): CompatibilityResult['nivel'] {
  if (score >= 75) return 'Muito Alta';
  if (score >= 50) return 'Alta';
  if (score >= 25) return 'Moderada';
  return 'Baixa';
}

/**
 * Calcula a compatibilidade numerológica entre dois nomes/números.
 * Usa a numerologia pitagórica para determinar a synergy entre os caminhos de vida.
 */
function calculateCompatibility(a: number | string, b: number | string): CompatibilityResult {
  const forcaNumero = typeof a === 'string' ? calcularPitagorica(a) : a;
  const destinoNumero = typeof b === 'string' ? calcularPitagorica(b) : b;

  const matriz = construirMatriz(forcaNumero, destinoNumero);
  const score = calcularScore(matriz);
  const nivel = getNivel(score);

  return {
    score,
    nivel,
    forcaNumero,
    destinoNumero,
    forcaDescricao: getInterpretacao(forcaNumero),
    destinoDescricao: getInterpretacao(destinoNumero),
    forca: gerarForcas(forcaNumero, destinoNumero, matriz),
    desafios: gerarDesafios(forcaNumero, destinoNumero, matriz),
    harmonias: gerarHarmonias(matriz),
    recomendacoes: gerarRecomendacoes(forcaNumero, destinoNumero, score, nivel),
    matriz
}
};
const calculate = calculateCompatibility;
