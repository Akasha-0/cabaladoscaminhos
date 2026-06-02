// fallow-ignore-file unused-file
export interface RelatorioSemanal {
  tipo: 'semanal';
  dataGeracao: Date;
  periodo: {
    inicio: Date;
    fim: Date;
  };
  usuario: {
    nome: string;
    dataNascimento: Date;
  };
  mapaNatal: {
    numeroDestino: number;
    oduPrincipal: string;
    oduSecundario: string;
    signoSolar: string;
    ascendente: string;
  };
  dias: DiaRelatorio[];
  resumenSemanal: {
    energiaGeral: 'positiva' | 'neutra' | 'desafiante';
    principaisTemas: string[];
    diasFavoraveis: number[];
    diasDesafiantes: number[];
  };
  ritaisRecomendados: Ritual[];
  affirmation: string;
  frequenciasDoPeriodo: string[];
}

export interface RelatorioMensal {
  tipo: 'mensal';
  dataGeracao: Date;
  periodo: {
    mes: number;
    ano: number;
  };
  usuario: {
    nome: string;
    dataNascimento: Date;
  };
  mapaNatal: {
    numeroDestino: number;
    numeroAnoPessoal: number;
    oduPrincipal: string;
    signoSolar: string;
    sefirotDominante: string;
  };
  semanas: SemanaRelatorio[];
  tendenciasMensais: {
    energiaPredominante: string;
    oportunidades: string[];
    desafios: string[];
    ciclosEmFoco: string[];
  };
  previsoes: Previsao[];
  planoAcao: PlanoAcaoItem[];
  cronogramaRituais: CronogramaRitual[];
  affirmation: string;
  frequenciasDoMes: string[];
}

export interface DiaRelatorio {
  data: Date;
  diaSemana: string;
  numeroPessoal: number;
  sefirot: string;
  orixa: string;
  energia: 'favoravel' | 'neutra' | 'desafiante';
  favorablePara: string[];
  evitar: string[];
  ritais: string[];
  cores: string[];
  frequencias: string[];
}

export interface SemanaRelatorio {
  numero: number;
  inicio: Date;
  fim: Date;
  energiaPredominante: string;
  temas: string[];
  diasFavoraveis: number[];
  conselhos: string[];
}

export interface Ritual {
  nome: string;
  dia: string;
  orixa: string;
  materiais: string[];
  passos: string[];
  intencao: string;
}

export interface Previsao {
  periodo: string;
  area: 'amor' | 'trabalho' | 'saude' | 'financas' | 'espiritualidade';
  descricao: string;
  conselho: string;
}

export interface PlanoAcaoItem {
  area: string;
  acao: string;
  prazo: string;
  afirmacao: string;
}

export interface CronogramaRitual {
  data: Date;
  tipo: 'diario' | 'semanal' | 'mensal';
  nome: string;
  duracao: string;
  materiais: string[];
}

export function gerarAffirmationSemanal(numeroAnoPessoal: number): string {
  const affirmations: Record<number, string> = {
    1: "Eu abraço novos começos com coragem e determinação. Minha energia lidera o caminho.",
    2: "A harmonia flui naturalmente em minha vida. Cada conexão que faço traz luz e paz.",
    3: "Minha criatividade transborda. Expresso minha verdade com alegria e inspiração.",
    4: "Com paciência e perseverança, construo uma fundação sólida para meus sonhos.",
    5: "Libero o antigo e abraço a mudança. Minha liberdade interior é minha força.",
    6: "Amor e responsabilidade caminham juntas em meu caminho. Crio harmonia em todos os relacionamentos.",
    7: "Na quietude, encontro todas as respostas. Minha sabedoria interior guia meus passos.",
    8: "Abundância é meu direito divino. Recebo com gratidão e compartilho com generosidade.",
    9: "Libero o que não serve mais. Novo começo surge em cada encerramento.",
  };
  return affirmations[numeroAnoPessoal] || affirmations[1];
}

export function gerarAffirmationMensal(numeroMensal: number): string {
  const affirmations: Record<number, string> = {
    1: "Sou pioneiro em minha própria história. Começo com propósito e clareza.",
    2: "Cooperacao e paciencia sao minhas aliadas neste mes de crescimento.",
    3: "Minha voz e minha arte se manifestam com poder este mes.",
    4: "Disciplina e estrutura me dao a stability que preciso.",
    5: "Adaptacao e flexibilidade me tornam invencivel.",
    6: "Equilibrio entre dar e receber traz paz ao meu coracao.",
    7: "Introspeccao revela os tesouros escondidos dentro de mim.",
    8: "Prosperidade flui para mim de todas as direcoes.",
    9: "Compassao e liberacao transformam minha realidade.",
  };
  return affirmations[numeroMensal] || affirmations[1];
}

// fallow-ignore-next-line complexity
export function calcularEnergiaDiaria(
  diaSemana: number,
  numeroPessoal: number,
  trânsitos: string[]
): 'favoravel' | 'neutra' | 'desafiante' {
  let score = 0;
  
  if ([2, 5, 6].includes(diaSemana)) score += 1;
  if ([1, 4].includes(diaSemana)) score += 0;
  if ([3, 7, 0].includes(diaSemana)) score -= 0;
  
  if (trânsitos.includes('trino')) score += 1;
  if (trânsitos.includes('quadratura')) score -= 1;
  if (trânsitos.includes('oposicao')) score -= 1;
  if (trânsitos.includes('conjunção')) score += 0;
  
  if (score > 0) return 'favoravel';
  if (score < -1) return 'desafiante';
  return 'neutra';
}

export const RITAIS_COMUNS: Record<string, Ritual> = {
  banhodoces: {
    nome: 'Banho de和田 Doce',
    dia: 'Segunda a Sexta',
    orixa: 'Oxum',
    materiais: ['Mel', 'Flores Rosas', 'Canela', 'Agua de rosas'],
    passos: [
      'Ferva 1L de agua e deixe amornar',
      'Adicione 3 colheres de mel',
      'Misture pétalas de rosa e canela',
      'Despeje a mistura do pescoço para baixo',
      'Agradeça a Oxum pela abundancia',
    ],
    intencao: 'Harmonia nos relacionamentos, amor proprio, doçura emocional',
  },
  limpezaPessoal: {
    nome: 'Descarrego Pessoal',
    dia: 'Segunda ou Quinta',
    orixa: 'Omolu',
    materiais: ['Alfa?', 'Pimenta-do-reino', 'Sal grosso', 'Fem?'],
    passos: [
      'Em uma vasilha, misture alfa?, sal e pimenta',
      'Acenda o fem? e faca prayers de protecao',
      'Passe a mistura nas palmas das maos',
      'Bata palmas 7 vezes',
      'Descarregue com agua corrente',
    ],
    intencao: 'Remocao de energias densas, protecao, limpeza espiritual',
  },
  terreiro: {
    nome: 'Aterramento com Terra',
    dia: 'Terca ou Sabado',
    orixa: 'Ogum',
    materiais: ['Terra de roseira', 'Agua', 'Velas verdes', 'Ferramenta de trabalho'],
    passos: [
      'Sente-se em local tranquilo',
      'Segure um punhado de terra',
      'Visualize raizes descendo ate o centro da Terra',
      'Respire fundo 7 vezes',
      'Agradeça a Ogum pela forca e coragem',
    ],
    intencao: 'Aterramento, forca interior, coragem para agir',
  },
  incenso: {
    nome: 'Purificacao com Incenso',
    dia: 'Qualquer dia',
    orixa: 'Xangô',
    materiais: ['Incenso de olibano', 'Porta-incenso', 'Prancha de osso ou madeira'],
    passos: [
      'Acenda o incenso e aguarde a brasa',
      'Purifique o espaco com a fumaça',
      'Purifique-se passando o incenso pelo corpo',
      'Agradeça a Xangô pela justica e verdade',
      'Mantenha o incenso aceso durante a meditacao',
    ],
    intencao: 'Purificacao, oracao, conexao com o divino',
  },
  velacoes: {
    nome: 'Velacao de Luiz',
    dia: 'Terca ou Domingo',
    orixa: 'Xangô',
    materiais: ['Velas brancas e vermelhas', 'Alfazema', 'Pão', 'Vinho doce'],
    passos: [
      'Limpe o espaco com alfazema',
      'Acenda 7 velas (3 brancas, 4 vermelhas)',
      'Recite oracoes a Xangô',
      'Ofereca o pão e vinho',
      'Deixe as velas ate apagarem sozinhas',
    ],
    intencao: 'Vitoria, justica, forca da palavra falada',
  },
};