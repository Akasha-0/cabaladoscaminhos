// fallow-ignore-file unused-file
// @ts-nocheck
// Numerology number meanings - spiritual and esoteric descriptions

export interface NumberMeaning {
  numero: number;
  nome: string;
  planeta: string;
  significado: string;
  forca: string;
  desafio: string;
  sefira: string;
  arco: string;
  cor: string;
  pedra: string;
  qualidade: string;
  palavraChave: string;
  affirmation: string;
}

const numberMeanings: Record<number, NumberMeaning> = {
  1: {
    numero: 1,
    nome: 'O Sol',
    planeta: 'Sol',
    significado: 'Liderança, independência, pioneirismo e inovação. O número 1 representa o início de tudo, a centelha divina que dá origem à criação. É a energia do Alpha, o princípio masculino cósmico.',
    forca: 'Determinação, coragem, originalidade, ambição e força de vontade',
    desafio: 'Egocentrismo, impaciência, arrogância, isolamento e teimosia',
    sefira: 'Kether (Coroanama)',
    arco: 'Fogo',
    cor: 'Dourado',
    pedra: 'Olho de Tigre',
    qualidade: 'Iniciativa e Liderança',
    palavraChave: 'Eu sou',
    affirmation: 'Aceito minha força interior e lidero com propósito'
  },
  2: {
    numero: 2,
    nome: 'A Lua',
    planeta: 'Lua',
    significado: 'Parceria, cooperação, diplomacia e sensibilidade. O número 2 representa a dualidade e a necessidade de equilíbrio entre opostos. È a energia receptiva do Yin.',
    forca: 'Diplomacia, empatia, paciência, adaptabilidade e intuição',
    desafio: 'Indecisão, subordinação excessiva, auto-piedade e حساسية مفرطة',
    sefira: 'Chokmah (Sabedoria)',
    arco: 'Água',
    cor: 'Prata',
    pedra: 'Moonstone',
    qualidade: 'Cooperação e Equilíbrio',
    palavraChave: 'Eu coopero',
    affirmation: 'Confio no fluxo da vida e nutro mim mismo com compaixão'
  },
  3: {
    numero: 3,
    nome: 'Júpiter',
    planeta: 'Júpiter',
    significado: 'Expressão criativa, comunicação, otimismo e expansão. O número 3 representa a trindade e a manifestação criativa. Simboliza a criança sagrada dentro de nós.',
    forca: 'Criatividade, sociabilidade, otimismo, inspiração e expressão',
    desafio: 'Superficialidade, dispersão, crítica excessiva e vaidade',
    sefira: 'Binah (Compreensão)',
    arco: 'Fogo',
    cor: 'Lima',
    pedra: 'Água-Marinha',
    qualidade: 'Criatividade e Expressão',
    palavraChave: 'Eu exprimo',
    affirmation: 'Abraço minha criatividade e expresso minha verdade com alegria'
  },
  4: {
    numero: 4,
    nome: 'Urano',
    planeta: 'Urano/Ra',
    significado: 'Estabilidade, construção, disciplina e trabalho árduo. O número 4 representa a matéria e a estrutura física da realidade. È o fundamento sólido sob nossos pés.',
    forca: 'Praticidade, confiabilidade, trabalho árduo, organização e lealdade',
    desafio: 'Rigidez, teimosia, resistência à mudança e materialismo',
    sefira: 'Chesed (Misericórdia)',
    arco: 'Terra',
    cor: 'Verde',
    pedra: 'Ágata',
    qualidade: 'Estabilidade e Construção',
    palavraChave: 'Eu construo',
    affirmation: 'Construo minha vida sobre fundações sólidas de integridade'
  },
  5: {
    numero: 5,
    nome: 'Mercúrio',
    planeta: 'Mercúrio',
    significado: 'Liberdade, mudança, aventura e progresso. O número 5 representa a mente em movimento e a busca por experiências. È o número do exchanges e da curiosidade.',
    forca: 'Versatilidade, curiosidade, comunicação, adaptabilidade e progresso',
    desafio: 'Impaciência, irresponsabilidade, superficialidade e inquiétude',
    sefira: 'Geburah (Severidade)',
    arco: 'Ar',
    cor: 'Amarelo',
    pedra: 'Ágata Azul',
    qualidade: 'Liberdade e Progresso',
    palavraChave: 'Eu流動',
    affirmation: 'Abraço as mudanças com coragem e celebro minha liberdade de Ser'
  },
  6: {
    numero: 6,
    nome: 'Vênus',
    planeta: 'Vênus',
    significado: 'Harmonia, amor, família e responsabilidade. O número 6 representa o idealismo e o serviço aos outros. Simboliza o amor incondicional e a beleza.',
    forca: 'Compassão, responsabilidade, harmonia, devoção e beleza',
    desafio: 'Autocomplacência, interferência excessiva, ciúme e sacrificio excessivo',
    sefira: 'Tiphereth (Beleza)',
    arco: 'Água',
    cor: 'Rosa',
    pedra: 'Quartzo Rosa',
    qualidade: 'Harmonia e Amor',
    palavraChave: 'Eu amo',
    affirmation: 'Sou digno de amor e ofereço compaixão a mim même e aos outros'
  },
  7: {
    numero: 7,
    nome: 'Netuno',
    planeta: 'Netuno',
    significado: 'Sabedoria interior, introspecção, espiritualidade e análise. O número 7 representa a busca pela verdade interior através da solidão sagrada.',
    forca: 'Intuição, sabedoria, análise, espiritualidade e insight profundo',
    desafio: 'Isolamento, melancolia, ceticismo excessivo e perfeccionismo',
    sefira: 'Netzach (Vitória)',
    arco: 'Água',
    cor: 'Violeta',
    pedra: 'Ametista',
    qualidade: 'Wisdom and Introspection',
    palavraChave: 'Eu compreendo',
    affirmation: 'Confio na minha sabedoria interior e abraço meu caminho espiritual'
  },
  8: {
    numero: 8,
    nome: 'Saturno',
    planeta: 'Saturno',
    significado: 'Abundância material, poder, autoridade e carma. O número 8 representa o equilíbrio entre o material e o espiritual, o karma e a recompensa.',
    forca: 'Ambição, determinação, sabedoria, sucesso material e disciplina',
    desafio: 'Materialismo, avareza, rigidez emocional e medo do fracasso',
    sefira: 'Hod (Glória)',
    arco: 'Terra',
    cor: 'Preto',
    pedra: 'Ônix',
    qualidade: 'Abundance and Authority',
    palavraChave: 'Eu alcanço',
    affirmation: 'Recebo abundância com gratidão e uso meu poder com sabedoria'
  },
  9: {
    numero: 9,
    nome: 'Marte',
    planeta: 'Marte',
    significado: 'Humanitarismo, compaixão, encerramento e sabedoria universal. O número 9 representa o encerramento de um ciclo e a sabedoria dos mestres.',
    forca: 'Compaixão, generosidade, sabedoria, idealismo e força',
    desafio: 'Impaciência, ressentimento, autodestruição e frieza emocional',
    sefira: 'Yesod (Fundação)',
    arco: 'Fogo',
    cor: 'Vermelho',
    pedra: 'Cornalina',
    qualidade: 'Humanitarismo e Sabedoria',
    palavraChave: 'Eu sirvo',
    affirmation: 'Coloco minha sabedoria a serviço da humanidade com compaixão'
  },
  11: {
    numero: 11,
    nome: 'A Inspiração',
    planeta: 'Plutão/Lua',
    significado: 'Intuição espiritual, iluminação e visão profética. O número 11 é um número mestre que representa a ponte entre o mortal e o divino.',
    forca: 'Visão, intuição, espiritualidade, inspiração e clarevidência',
    desafio: 'Ansiedade, exaustão, sensibilidade excessiva e sobrecarga',
    sefira: 'Daath (Conhecimento)',
    arco: 'Fogo/Ar',
    cor: 'Prata/Dourado',
    pedra: 'Moldavita',
    qualidade: 'Iluminação and Visão',
    palavraChave: 'Eu iluminho',
    affirmation: 'Sou um canal de luz divina e compartilho minha visão com o mundo'
  },
  22: {
    numero: 22,
    nome: 'O Mestre Construtor',
    planeta: 'Terra/Netuno',
    significado: 'Manifestação prática de sonhos grandiosos. O número 22 combina a visão espiritual do 11 com a practicidade do 4 em sua forma mais elevada.',
    forca: 'Visão, praticidade, maestria, conquista e realizações concretas',
    desafio: 'Exigência excessiva, instabilidade, autocrítica e medo de fracasso',
    sefira: 'Malkuth (Reino)',
    arco: 'Terra',
    cor: 'Verde/Dourado',
    pedra: 'Cristal de Rocha',
    qualidade: 'Maestria Concreta',
    palavraChave: 'Eu manifesto',
    affirmation: 'Transformo minha visão em realidade com determinação e grace'
  },
  33: {
    numero: 33,
    nome: 'O Mestre Elevado',
    planeta: 'Sol/Vênus',
    significado: 'Serviço espiritual altruísta e amor incondicional. O número 33 representa a mais alta expressão de compaixão e o caminho do guru interior.',
    forca: 'Altruísmo, sabedoria, inspiração, cura e devoção absoluta',
    desafio: 'Martírio, sobrecarga, autopiedade e dificuldade em receber',
    sefira: 'Tiphereth (Beleza)',
    arco: 'Luz',
    cor: 'Rosa/Dourado/Claro',
    pedra: 'Selenita',
    qualidade: 'Elevação Espiritual',
    palavraChave: 'Eu transcedo',
    affirmation: 'Sou um veículo de amor incondicional e iluminho todos os que toco'
  }
};

export function getMeanings(): Record<number, NumberMeaning> {
  return numberMeanings;
}

export function getMeaning(numero: number): NumberMeaning {
  return numberMeanings[numero] || {
    numero,
    nome: 'Energia Desconhecida',
    planeta: 'Desconhecido',
    significado: `Número ${numero} - energia não catalogada na tradição numerológica`,
    forca: '',
    desafio: '',
    sefira: '',
    arco: '',
    cor: '',
    pedra: '',
    qualidade: '',
    palavraChave: '',
    affirmation: ''
  };
}

export function getMasterNumbers(): number[] {
  return [11, 22, 33];
}

export function getCoreNumbers(): number[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9];
}

export function getAllNumbers(): number[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
}

export default getMeanings;
