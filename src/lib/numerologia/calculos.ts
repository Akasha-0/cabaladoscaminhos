export const tabelaPitagorica: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
  Á: 1, À: 1, Ã: 1, Â: 1, É: 5, Ê: 5, Í: 9, Ó: 6, Ô: 6, Õ: 6, Ú: 3, Ü: 3
};

export const tabelaCaldeia: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2,
  S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7,
  Á: 1, À: 1, Ã: 1, Â: 1, É: 5, Ê: 5, Í: 1, Ó: 7, Ô: 7, Õ: 7, Ú: 6, Ü: 6
};

export const tabelaCabalistica: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1,
  J: 1, K: 2, L: 30, M: 40, N: 50, O: 70, P: 80, Q: 100, R: 200,
  S: 300, T: 400, U: 6, V: 700, W: 900, X: 60, Y: 10, Z: 700,
  Á: 1, À: 1, Ã: 1, Â: 1, É: 5, Ê: 5, Í: 1, Ó: 70, Ô: 70, Õ: 70, Ú: 6, Ü: 6
};

function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

function somarDigitos(numero: number): number {
  while (numero > 9 && numero !== 11 && numero !== 22 && numero !== 33) {
    numero = numero.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  return numero;
}

export function calcularPitagorica(nome: string): number {
  const nomeLimpo = removerAcentos(nome.replace(/[^A-ZÀ-Ü]/g, ''));
  let soma = 0;
  
  for (const letra of nomeLimpo) {
    soma += tabelaPitagorica[letra] || 0;
  }
  
  return somarDigitos(soma);
}

export function calcularCaldeia(nome: string): number {
  const nomeLimpo = removerAcentos(nome.replace(/[^A-ZÀ-Ü]/g, ''));
  let soma = 0;
  
  for (const letra of nomeLimpo) {
    soma += tabelaCaldeia[letra] || 0;
  }
  
  return somarDigitos(soma);
}

export function calcularCabalistica(nome: string): number {
  const nomeLimpo = removerAcentos(nome.replace(/[^A-ZÀ-Ü]/g, ''));
  let soma = 0;
  
  for (const letra of nomeLimpo) {
    soma += tabelaCabalistica[letra] || 0;
  }
  
  return somarDigitos(soma);
}

export function calcularTantrica(dataNascimento: string): number {
  const numeros = dataNascimento.replace(/\D/g, '');
  let soma = 0;
  
  for (const digito of numeros) {
    soma += parseInt(digito);
  }
  
  return somarDigitos(soma);
}

export function calcularPitagoricaData(data: string): number {
  const numeros = data.replace(/\D/g, '');
  let soma = 0;
  
  for (const digito of numeros) {
    soma += parseInt(digito);
  }
  
  return somarDigitos(soma);
}

export interface InterpretacaoNumerologia {
  numero: number;
  nome: string;
  significado: string;
  forca: string;
  desafio: string;
  sefirotRelacionado: string;
}

export const interpretacoesNumerologia: Record<number, InterpretacaoNumerologia> = {
  1: {
    numero: 1,
    nome: 'O Sol',
    significado: 'Liderança, independência, pioneirismo e inovação. O número 1 representa o início de tudo, a centelha divina que dá origem à criação.',
    forca: 'Determinação, coragem, originalidade e ambição',
    desafio: 'Egocentrismo, impaciência e arrogância',
    sefirotRelacionado: 'Kether (Coroa)'
  },
  2: {
    numero: 2,
    nome: 'A Lua',
    significado: 'Parceria, cooperação, diplomacy and sensitivity. O número 2 representa a dualidade e a necessidade de equilíbrio entre opostos.',
    forca: 'Diplomacia, empatia, paciência e adaptabilidade',
    desafio: 'Indecisão, subordinação excessiva e auto-piedade',
    sefirotRelacionado: 'Chokmah (Sabedoria)'
  },
  3: {
    numero: 3,
    nome: 'Júpiter',
    significado: 'Expressão criativa, comunicação, otimismo e expansão. O número 3 representa a trindade e a manifestação criativa.',
    forca: 'Criatividade, sociabilidade, otimismo e inspiração',
    desafio: 'Superficialidade, dispersão e crítica excessiva',
    sefirotRelacionado: 'Binah (Compreensão)'
  },
  4: {
    numero: 4,
    nome: 'Urano',
    significado: 'Estabilidade, construção, disciplina e trabalho árduo. O número 4 representa a matéria e a estrutura física da realidade.',
    forca: 'Praticidade, reliability, hard work and organization',
    desafio: 'Rigidez, teimosia e resistência à mudança',
    sefirotRelacionado: 'Chesed (Misericórdia)'
  },
  5: {
    numero: 5,
    nome: 'Mercúrio',
    significado: 'Liberdade, mudança, aventura e progresso. O número 5 representa a mente em movimento e a busca por experiências.',
    forca: 'Versatilidade, curiosidade, comunicação e adaptabilidade',
    desafio: 'Impaciência, irresponsabilidade e superficialidade',
    sefirotRelacionado: 'Geburah (Severidade)'
  },
  6: {
    numero: 6,
    nome: 'Vênus',
    significado: 'Harmonia, amor, família e responsabilidade. O número 6 representa o idealismo e o serviço aos outros.',
    forca: 'Compassão, responsabilidade, harmonic e devoção',
    desafio: 'Autocomplacência, interferência excessiva e ciúme',
    sefirotRelacionado: 'Tiphereth (Beleza)'
  },
  7: {
    numero: 7,
    nome: 'Netuno',
    significado: 'Sabedoria interior, introspecção, espiritualidade e análise. O número 7 representa a busca pela verdade interior.',
    forca: 'Intuição, sabedoria, análise e espiritualidade',
    desafio: 'Isolamento, melancolia e ceticismo excessivo',
    sefirotRelacionado: 'Netzach (Vitória)'
  },
  8: {
    numero: 8,
    nome: 'Saturno',
    significado: 'Abundância material, poder, autoridade ekarma. O número 8 representa o equilíbrio entre o material e o espiritual.',
    forca: 'Ambição, determinação, wisdom and material success',
    desafio: 'Materialismo, avareza e rigidez emocional',
    sefirotRelacionado: 'Hod (Glória)'
  },
  9: {
    numero: 9,
    nome: 'Marte',
    significado: 'Humanitarismo, compaixão, completion and wisdom. O número 9 representa o encerramento de um ciclo e a sabedoria universal.',
    forca: 'Compaixão, generosidade, wisdom and idealism',
    desafio: 'Impaciência, resentimento e autodestruição',
    sefirotRelacionado: 'Yesod (Fundação)'
  },
  11: {
    numero: 11,
    nome: 'A Inspiração',
    significado: 'Intuição espiritual, iluminação e visão profética. O número 11 é um número mestre que representa a ponte entre o mortal e o divino.',
    forca: 'Visão, intuição, espiritualidade e inspiração',
    desafio: 'Ansiedade, exaustão e sensibilidade excessiva',
    sefirotRelacionado: 'Daath (Conhecimento)'
  },
  22: {
    numero: 22,
    nome: 'O Mestre Construtor',
    significado: 'Manifestação prática de sonhos grandiosos. O número 22 combina a visão espiritual do 11 com a praticidade do 4.',
    forca: 'Visão, practicidade, master e achievement',
    desafio: 'Exigência excessiva, instabilidade e autocrítica',
    sefirotRelacionado: 'Malkuth (Reino)'
  },
  33: {
    numero: 33,
    nome: 'O Mestre Elevado',
    significado: 'Serviço espiritual altruísta. O número 33 representa a mais alta expressão de amor incondicional.',
    forca: 'Altruísmo, sabedoria, inspiration and healing',
    desafio: 'Martírio, sobrecarga e autopiedade',
    sefirotRelacionado: 'Tiphereth (Beleza)'
  }
};

export function getInterpretacao(numero: number): InterpretacaoNumerologia {
  return interpretacoesNumerologia[numero] || {
    numero,
    nome: 'Energia Desconhecida',
    significado: 'Este número carrega uma energia única que transcende as definições tradicionais.',
    forca: 'Versatilidade e adaptabilidade',
    desafio: 'Encontrar seu caminho único',
    sefirotRelacionado: 'A determinar'
  };
}