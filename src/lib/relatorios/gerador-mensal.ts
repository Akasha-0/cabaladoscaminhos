export interface RelatorioMensal {
  dataGeracao: Date;
  mes: string;
  ano: number;
  resumo: {
    energiaMensal: string;
    temaMensal: string;
    oportunidades: string[];
    desafios: string[];
    diasIntensos: string[];
  };
  ciclos: {
    numeroMes: number;
    cicloAtual: string;
    diasFavoraveis: number[];
    diasNeutros: number[];
    diasDesafio: number[];
  };
  aspectos: {
    sol: string;
    lua: string;
    mercurio: string;
    venus: string;
    marte: string;
  };
  previsoes: {
    area: string;
    tendencia: string;
    conselho: string;
  }[];
  diasDetalhados: {
    dia: number;
    energia: string;
    faseLua: string;
    orixa: string;
    recomendacao: string;
  }[];
}

export function gerarRelatorioMensal(mes?: number, ano?: number): RelatorioMensal {
  const data = new Date();
  const mesAtual = mes || data.getMonth() + 1;
  const anoAtual = ano || data.getFullYear();
  
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  return {
    dataGeracao: new Date(),
    mes: nomesMeses[mesAtual - 1],
    ano: anoAtual,
    resumo: {
      energiaMensal: getEnergiaMensal(mesAtual),
      temaMensal: getTemaMensal(mesAtual),
      oportunidades: getOportunidades(mesAtual),
      desafios: getDesafios(mesAtual),
      diasIntensos: [1, 8, 15, 22].map(String),
    },
    ciclos: {
      numeroMes: somarDigitos(mesAtual) + somarDigitos(anoAtual),
      cicloAtual: getCicloAtual(mesAtual),
      diasFavoraveis: [3, 5, 7, 10, 12, 14, 17, 19, 21, 24, 26, 28],
      diasNeutros: [2, 4, 6, 9, 11, 13, 16, 18, 20, 23, 25, 27],
      diasDesafio: [1, 8, 15, 22],
    },
    aspectos: {
      sol: 'Período de clareza e autoconhecimento',
      lua: 'Ciclos emocionais intensificados',
      mercurio: 'Comunicação favorecida',
      venus: 'Relacionamentos harmonizados',
      marte: 'Energia de ação equilibrada',
    },
    previsoes: [
      {
        area: 'Espiritualidade',
        tendencia: 'Crescimento e expansão',
        conselho: 'Pratique meditação diariamente',
      },
      {
        area: 'Relacionamentos',
        tendencia: 'Harmonia e compreensão',
        conselho: 'Comunique-se com clareza e empatia',
      },
      {
        area: 'Finanças',
        tendencia: 'Estabilidade com oportunidades',
        conselho: 'Planeje gastos com atenção',
      },
      {
        area: 'Saúde',
        tendencia: 'Período de regeneração',
        conselho: 'Cuide do corpo e mente',
      },
      {
        area: 'Carreira',
        tendencia: 'Novos horizontes',
        conselho: 'Abrace mudanças com coragem',
      },
    ],
    diasDetalhados: gerarDiasDetalhados(mesAtual, anoAtual),
  };
}

function somarDigitos(n: number): number {
  return String(n).split('').reduce((acc, d) => acc + parseInt(d), 0);
}

function getEnergiaMensal(mes: number): string {
  const energias: Record<number, string> = {
    1: 'Renovação e novos começos',
    2: 'Introspecção e planejamento',
    3: 'Expressão criativa e comunicação',
    4: 'Estrutura e organização',
    5: 'Liberdade e aventuras',
    6: 'Harmonia familiar e relações',
    7: 'Reflexão espiritual',
    8: 'Poder e transformação',
    9: 'Conclusão e sabedoria',
    10: 'Novos ciclos profissionais',
    11: 'Iluminação e intuição',
    12: 'Gratidão e conclusão anual',
  };
  return energias[mes];
}

function getTemaMensal(mes: number): string {
  const temas: Record<number, string> = {
    1: 'Mês da Fundação - plante suas seeds para o ano',
    2: 'Mês do Planejamento - estruture seus objetivos',
    3: 'Mês da Expressão - comunique sua verdade',
    4: 'Mês da Disciplina - construa bases sólidas',
    5: 'Mês da Liberdade - experimente e explore',
    6: 'Mês do Amor - cultive relações importantes',
    7: 'Mês da Introspecção - aprofunde sua espiritualidade',
    8: 'Mês do Poder - transforme sua realidade',
    9: 'Mês da Sabedoria - colha os frutos',
    10: 'Mês do Trabalho - materialize suas intentions',
    11: 'Mês da Luz - desperte sua verdadeira essência',
    12: 'Mês da Consciência - gratidão e conclusão',
  };
  return temas[mes];
}

function getOportunidades(mes: number): string[] {
  const op: Record<number, string[]> = {
    1: ['Novos projetos', 'Conexões importantes', 'Limpeza de padrões antigos'],
    2: ['Planejamento estratégico', 'Estudos', 'Introspecção'],
    3: ['Comunicação clara', 'Expressão criativa', 'Networking'],
    4: ['Organização', 'Rotinas produtivas', 'Estabilidade'],
    5: ['Viagens', 'Novas experiências', 'Flexibilidade'],
    6: ['Relacionamentos', 'Harmonia', 'Cuidados familiares'],
    7: ['Meditação', 'Estudos espirituais', 'Autoconhecimento'],
    8: ['Transformação', 'Manifestação', 'Poder pessoal'],
    9: ['Conclusões', 'Sabedoria', 'Graduação'],
    10: ['Carreira', 'Reconhecimento', 'Materialização'],
    11: ['Intuição', 'Iluminação', 'Propósito'],
    12: ['Gratidão', 'Celebração', 'Preparo para novo ciclo'],
  };
  return op[mes];
}

function getDesafios(mes: number): string[] {
  const desc: Record<number, string[]> = {
    1: ['Impaciência', 'Expectativas irreais'],
    2: ['Indecisão', 'Procrastinação'],
    3: ['Superficialidade', 'Comunicação agressiva'],
    4: ['Rigidez', 'Perfeccionismo'],
    5: ['Irresponsabilidade', 'Dispersão'],
    6: ['Ciúmes', 'Conflitos familiares'],
    7: ['Isolamento', 'Indecisão'],
    8: ['Controle excessivo', 'Medo de mudança'],
    9: ['Procrastinação', 'Culpa residual'],
    10: ['Competitividade', 'Workaholismo'],
    11: ['Ilusão', 'Expectativas elevadas'],
    12: ['Excesso', 'Comparação'],
  };
  return desc[mes];
}

function getCicloAtual(mes: number): string {
  const ciclos = [
    'Ciclo de Manifestação (1-9 dias)',
    'Ciclo de Estruturação (10-19 dias)',
    'Ciclo de Expressão (20-31 dias)',
  ];
  return ciclos[Math.floor((mes - 1) / 4)];
}

function gerarDiasDetalhados(mes: number, ano: number): {
  dia: number;
  energia: string;
  faseLua: string;
  orixa: string;
  recomendacao: string;
}[] {
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const luas = ['Lua Nova', 'Crescente', 'Cheia', 'Minguante'];
  const orixas = ['Oxalá', 'Omolu', 'Ogum', 'Xangô', 'Oxóssi', 'Oxum', 'Iemanjá'];
  
  return Array.from({ length: Math.min(diasNoMes, 15) }, (_, i) => {
    const dia = i + 1;
    return {
      dia,
      energia: getEnergiaDia(dia),
      faseLua: luas[dia % 4],
      orixa: orixas[dia % 7],
      recomendacao: getRecomendacao(dia),
    };
  });
}

function getEnergiaDia(dia: number): string {
  const energias = [
    'Fundação', 'Introspecção', 'Expressão', 'Organização',
    'Ação', 'Harmonia', 'Reflexão', 'Poder', 'Sabedoria',
    'Clareza', 'Intuição', 'Gratidão', 'Desenvolvimento', 'Equilíbrio', 'Conclusão',
  ];
  return energias[(dia - 1) % energias.length];
}

function getRecomendacao(dia: number): string {
  if (dia <= 5) return 'Período para plantar intentions e começar projetos';
  if (dia <= 10) return 'Hora de estruturar e organizar ideias';
  if (dia <= 15) return 'Expresse sua criatividade e comunique-se';
  return 'Avalie progresso e ajuste direção';
}